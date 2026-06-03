import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://api.tcgplayer.com';
const POKEMON_CATEGORY_ID = 3;

const tokenCache = new NodeCache({ stdTTL: 1200 }); // 20 min
const priceCache = new NodeCache({ stdTTL: 300 });   // 5 min
const catalogCache = new NodeCache({ stdTTL: 3600 }); // 1 hr

async function getAccessToken(): Promise<string> {
  const cached = tokenCache.get<string>('token');
  if (cached) return cached;

  const response = await axios.post(
    `${BASE_URL}/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.TCGPLAYER_PUBLIC_KEY || '',
      client_secret: process.env.TCGPLAYER_PRIVATE_KEY || '',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const token = response.data.access_token as string;
  tokenCache.set('token', token);
  return token;
}

async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const token = await getAccessToken();
  const response = await axios.get(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data as T;
}

export interface TCGSet {
  groupId: number;
  name: string;
  abbreviation: string;
  publishedOn: string;
  modifiedOn: string;
  categoryId: number;
}

export interface TCGProduct {
  productId: number;
  name: string;
  cleanName: string;
  imageUrl: string;
  categoryId: number;
  groupId: number;
  url: string;
  modifiedOn: string;
  imageCount: number;
  extendedData: Array<{ name: string; displayName: string; value: string }>;
  presaleInfo?: { isPresale: boolean };
}

export interface TCGPrice {
  productId: number;
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  marketPrice: number | null;
  directLowPrice: number | null;
  subTypeName: string;
}

export async function getSets(language: 'EN' | 'JP' = 'EN'): Promise<TCGSet[]> {
  const cacheKey = `sets_${language}`;
  const cached = catalogCache.get<TCGSet[]>(cacheKey);
  if (cached) return cached;

  // Pokemon EN = category 3, Pokemon JP = category 68
  const categoryId = language === 'JP' ? 68 : POKEMON_CATEGORY_ID;

  const result = await apiGet<{ results: TCGSet[] }>(
    `/v2/catalog/categories/${categoryId}/groups`,
    { limit: 200, offset: 0 }
  );

  const sets = result.results || [];
  catalogCache.set(cacheKey, sets);
  return sets;
}

export async function searchProducts(
  query: string,
  options: {
    groupId?: number;
    categoryId?: number;
    limit?: number;
    offset?: number;
    language?: 'EN' | 'JP';
  } = {}
): Promise<{ results: TCGProduct[]; totalItems: number }> {
  const { language = 'EN', ...rest } = options;
  const categoryId = rest.categoryId ?? (language === 'JP' ? 68 : POKEMON_CATEGORY_ID);

  const params: Record<string, unknown> = {
    productName: query,
    categoryId,
    limit: rest.limit ?? 24,
    offset: rest.offset ?? 0,
    includeFields: 'extendedData',
  };

  if (rest.groupId) params.groupId = rest.groupId;

  const result = await apiGet<{ results: TCGProduct[]; totalItems: number }>(
    '/v2/catalog/products',
    params
  );

  return { results: result.results || [], totalItems: result.totalItems || 0 };
}

export async function getProductById(productId: number): Promise<TCGProduct | null> {
  const cacheKey = `product_${productId}`;
  const cached = catalogCache.get<TCGProduct>(cacheKey);
  if (cached) return cached;

  const result = await apiGet<{ results: TCGProduct[] }>(
    `/v2/catalog/products/${productId}`
  );

  const product = result.results?.[0] ?? null;
  if (product) catalogCache.set(cacheKey, product);
  return product;
}

export async function getPrices(productIds: number[]): Promise<TCGPrice[]> {
  if (productIds.length === 0) return [];

  const missing: number[] = [];
  const cached: TCGPrice[] = [];

  for (const id of productIds) {
    const c = priceCache.get<TCGPrice[]>(`price_${id}`);
    if (c) cached.push(...c);
    else missing.push(id);
  }

  if (missing.length === 0) return cached;

  const chunks: number[][] = [];
  for (let i = 0; i < missing.length; i += 250) {
    chunks.push(missing.slice(i, i + 250));
  }

  const results: TCGPrice[] = [...cached];

  for (const chunk of chunks) {
    const result = await apiGet<{ results: TCGPrice[] }>(
      `/v2/pricing/product/${chunk.join(',')}`
    );
    const prices = result.results || [];
    results.push(...prices);

    // cache per product
    const byProduct = new Map<number, TCGPrice[]>();
    for (const p of prices) {
      const arr = byProduct.get(p.productId) || [];
      arr.push(p);
      byProduct.set(p.productId, arr);
    }
    for (const [id, arr] of byProduct) {
      priceCache.set(`price_${id}`, arr);
    }
  }

  return results;
}

export async function getProductsInSet(
  groupId: number,
  options: { limit?: number; offset?: number } = {}
): Promise<{ results: TCGProduct[]; totalItems: number }> {
  const result = await apiGet<{ results: TCGProduct[]; totalItems: number }>(
    '/v2/catalog/products',
    {
      groupId,
      categoryId: POKEMON_CATEGORY_ID,
      limit: options.limit ?? 50,
      offset: options.offset ?? 0,
      includeFields: 'extendedData',
    }
  );
  return { results: result.results || [], totalItems: result.totalItems || 0 };
}
