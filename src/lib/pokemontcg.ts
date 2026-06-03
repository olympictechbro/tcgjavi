// Direct pokemontcg.io client — used as fallback when our API is unavailable
// Free, no key required, works from the browser
import axios from 'axios';
import type { Card, Set } from './api';

const ptcg = axios.create({
  baseURL: 'https://api.pokemontcg.io/v2',
  timeout: 10000,
});

function mapCard(c: Record<string, unknown>): Card {
  const set = c.set as Record<string, unknown>;
  const images = c.images as Record<string, string> | undefined;
  return {
    id: c.id as string,
    setId: (set?.id as string) ?? '',
    name: c.name as string,
    number: c.number as string,
    supertype: c.supertype as string,
    subtypes: (c.subtypes as string[]) ?? [],
    hp: c.hp ? parseInt(c.hp as string, 10) : null,
    types: (c.types as string[]) ?? [],
    rarity: (c.rarity as string) ?? 'Unknown',
    language: 'EN',
    artist: (c.artist as string) ?? null,
    imageSmall: images?.small ?? null,
    imageLarge: images?.large ?? null,
    evolvesFrom: (c.evolvesFrom as string) ?? null,
    nationalDex: (c.nationalPokedexNumbers as number[])?.[0] ?? null,
    set: {
      id: (set?.id as string) ?? '',
      name: (set?.name as string) ?? '',
      logoUrl: (set as Record<string, Record<string, string>>)?.images?.logo ?? null,
    },
    prices: [], // no pricing from pokemontcg.io
    attacks: ((c.attacks as Record<string, unknown>[]) ?? []).map((a, i) => ({
      id: `${c.id}-atk-${i}`,
      name: a.name as string,
      cost: (a.cost as string[]) ?? [],
      convertedEnergyCost: (a.convertedEnergyCost as number) ?? 0,
      damage: (a.damage as string) ?? null,
      text: (a.text as string) ?? null,
    })),
    abilities: ((c.abilities as Record<string, unknown>[]) ?? []).map((a, i) => ({
      id: `${c.id}-ab-${i}`,
      name: a.name as string,
      text: (a.text as string) ?? null,
      type: (a.type as string) ?? null,
    })),
  };
}

function mapSet(s: Record<string, unknown>): Set {
  const images = s.images as Record<string, string> | undefined;
  return {
    id: s.id as string,
    name: s.name as string,
    series: (s.series as string) ?? '',
    language: 'EN',
    printedTotal: (s.printedTotal as number) ?? 0,
    total: (s.total as number) ?? 0,
    releaseDate: (s.releaseDate as string) ?? null,
    logoUrl: images?.logo ?? null,
    symbolUrl: images?.symbol ?? null,
    ptcgoCode: (s.ptcgoCode as string) ?? null,
  };
}

export async function ptcgSearchCards(params: {
  q?: string; setId?: string; rarity?: string; page?: number; limit?: number;
}): Promise<{ data: Card[]; pagination: { total: number; pages: number } }> {
  let q = params.q ? `name:"${params.q}*"` : 'name:*';
  if (params.setId) q += ` set.id:${params.setId}`;
  if (params.rarity) q += ` rarity:"${params.rarity}"`;

  const res = await ptcg.get('/cards', {
    params: { q, page: params.page ?? 1, pageSize: params.limit ?? 24, orderBy: '-set.releaseDate' },
  });
  const data = (res.data.results as Record<string, unknown>[]).map(mapCard);
  const total = res.data.totalCount as number;
  return { data, pagination: { total, pages: Math.ceil(total / (params.limit ?? 24)) } };
}

export async function ptcgGetSets(): Promise<Set[]> {
  const res = await ptcg.get('/sets', { params: { orderBy: '-releaseDate', pageSize: 250 } });
  return (res.data.data as Record<string, unknown>[]).map(mapSet);
}

export async function ptcgGetCard(id: string): Promise<Card | null> {
  try {
    const res = await ptcg.get(`/cards/${id}`);
    return mapCard(res.data.data as Record<string, unknown>);
  } catch {
    return null;
  }
}
