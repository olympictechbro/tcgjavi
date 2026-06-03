import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pokeapi-production-695d.up.railway.app',
  timeout: 15000,
});

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Set {
  id: string;
  name: string;
  series: string;
  language: 'EN' | 'JP';
  printedTotal: number;
  total: number;
  releaseDate: string;
  logoUrl: string | null;
  symbolUrl: string | null;
  ptcgoCode: string | null;
  _count?: { cards: number };
}

export interface Card {
  id: string;
  setId: string;
  name: string;
  number: string;
  supertype: string;
  subtypes: string[];
  hp: number | null;
  types: string[];
  rarity: string;
  language: 'EN' | 'JP';
  artist: string | null;
  imageSmall: string | null;
  imageLarge: string | null;
  evolvesFrom: string | null;
  nationalDex: number | null;
  set?: { id: string; name: string; logoUrl?: string | null };
  prices?: Price[];
  attacks?: Attack[];
  abilities?: Ability[];
}

export interface Attack {
  id: string;
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string | null;
  text: string | null;
}

export interface Ability {
  id: string;
  name: string;
  text: string | null;
  type: string | null;
}

export interface Price {
  id: string;
  cardId: string;
  condition: string;
  marketPrice: number | null;
  lowPrice: number | null;
  highPrice: number | null;
  salesCount: number;
  updatedAt: string;
}

export interface PriceHistory {
  recordedAt: string;
  marketPrice: number;
  lowPrice: number | null;
  highPrice: number | null;
  volume: number;
}

export interface SealedProduct {
  id: string;
  name: string;
  type: string;
  language: 'EN' | 'JP';
  imageUrl: string | null;
  releaseDate: string | null;
  msrp: number | null;
  set?: { id: string; name: string };
  prices?: { marketPrice: number | null; lowPrice: number | null };
}

export interface InventoryItem {
  id: string;
  cardId: string | null;
  sealedId: string | null;
  quantity: number;
  quantitySold: number;
  quantityHeld: number;
  condition: string;
  costBasis: number;
  totalCost: number;
  acquiredAt: string;
  notes: string | null;
  tags: string[];
  marketPrice: number | null;
  currentValue: number | null;
  costHeld: number;
  unrealizedGain: number | null;
  unrealizedGainPct: number | null;
  card?: Card | null;
  sealed?: SealedProduct | null;
}

export interface Transaction {
  id: string;
  type: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  feesAmount: number;
  netAmount: number;
  condition: string | null;
  platform: string | null;
  counterparty: string | null;
  notes: string | null;
  transactedAt: string;
  realizedGain: number | null;
  realizedGainPct: number | null;
  card?: Card | null;
  sealed?: SealedProduct | null;
}

export interface PnlSummary {
  realized: {
    revenue: number;
    cogs: number;
    fees: number;
    gain: number;
    gainPct: number;
    salesCount: number;
  };
  unrealized: {
    costBasis: number;
    marketValue: number;
    gain: number;
    gainPct: number;
    itemsHeld: number;
  };
  overall: {
    totalSpent: number;
    totalRevenue: number;
    netCashFlow: number;
    totalGain: number;
  };
}

export interface TrendingCard {
  card: { id: string; name: string; imageSmall: string; set: { name: string } };
  todayPrice: number;
  yesterdayPrice: number;
  changePct: number;
}

// ── API calls (with pokemontcg.io fallback) ───────────────────────────────────
import { ptcgSearchCards, ptcgGetSets, ptcgGetCard } from './pokemontcg';

async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await primary();
  } catch {
    return fallback();
  }
}

export const getSets = (params?: { language?: string }) =>
  withFallback(
    () => api.get<{ data: Set[] }>('/v1/sets', { params }).then(r => r.data.data),
    () => ptcgGetSets()
  );

export const searchCards = (params: {
  q?: string; language?: string; setId?: string; rarity?: string;
  sort?: string; page?: number; limit?: number;
}) =>
  withFallback(
    () => api.get<{ data: Card[]; pagination: { total: number; pages: number } }>(
      '/v1/cards/search', { params }
    ).then(r => r.data),
    () => ptcgSearchCards({ q: params.q, setId: params.setId, rarity: params.rarity, page: params.page, limit: params.limit })
  );

export const getCard = (id: string) =>
  withFallback(
    () => api.get<Card>(`/v1/cards/${id}`).then(r => r.data),
    () => ptcgGetCard(id).then(c => { if (!c) throw new Error('not found'); return c; })
  );

export const getCardPrices = (id: string) =>
  api.get<{ prices: Price[] }>(`/v1/cards/${id}/prices`).then(r => r.data.prices);

export const getCardPriceHistory = (id: string, range = '1M', condition = 'NEAR_MINT') =>
  api.get<{ data: PriceHistory[] }>(`/v1/cards/${id}/prices/history`, {
    params: { range, condition }
  }).then(r => r.data.data);

export const getSealed = (params?: { language?: string; type?: string; setId?: string }) =>
  api.get<{ data: SealedProduct[] }>('/v1/sealed', { params }).then(r => r.data.data);

export const getTrending = () =>
  api.get<{ data: TrendingCard[] }>('/v1/trending').then(r => r.data.data);

export const getInventory = (params?: { tag?: string; condition?: string }) =>
  api.get<{
    data: InventoryItem[];
    summary: { totalCostBasis: number; totalMarketValue: number; totalUnrealizedGain: number; totalUnrealizedGainPct: number };
  }>('/v1/inventory', { params }).then(r => r.data);

export const addInventoryItem = (body: {
  cardId?: string; sealedId?: string; quantity: number;
  condition: string; costBasis: number; acquiredAt: string;
  notes?: string; tags?: string[];
}) => api.post<InventoryItem>('/v1/inventory', body).then(r => r.data);

export const getTransactions = (params?: { type?: string; from?: string; to?: string }) =>
  api.get<{ data: Transaction[] }>('/v1/transactions', { params }).then(r => r.data.data);

export const addTransaction = (body: {
  type: string; inventoryId?: string; cardId?: string; sealedId?: string;
  quantity: number; pricePerUnit: number; feesAmount?: number;
  condition?: string; platform?: string; counterparty?: string;
  notes?: string; transactedAt: string;
}) => api.post<Transaction>('/v1/transactions', body).then(r => r.data);

export const getPnlSummary = () =>
  api.get<PnlSummary>('/v1/pnl/summary').then(r => r.data);

export const getPnlOverTime = (period = 'monthly') =>
  api.get<{ data: { label: string; realizedGain: number; revenue: number; totalBought: number }[] }>(
    '/v1/pnl/over-time', { params: { period } }
  ).then(r => r.data.data);

export const getBestFlips = () =>
  api.get<{ data: Transaction[] }>('/v1/pnl/best-flips').then(r => r.data.data);
