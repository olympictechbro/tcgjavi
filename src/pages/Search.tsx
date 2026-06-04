import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X, LayoutGrid, List } from 'lucide-react';
import { AddCardSheet } from '../components/ui/AddCardSheet';
import type { Card } from '../lib/api';
import { searchCards } from '../lib/api';
import { CardTile, CardTileSkeleton, CardListItem, CardListSkeleton } from '../components/ui/CardTile';
import { cn } from '../lib/cn';

const RARITY_OPTIONS = [
  'Common','Uncommon','Rare','RareHolo','RareUltra','RareSecret',
  'IllustrationRare','SpecialIllustrationRare','HyperRare','VMAX','VSTAR','V',
];
const SORT_OPTIONS = [
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'name_asc',   label: 'A–Z' },
  { value: 'name_desc',  label: 'Z–A' },
  { value: 'number_asc', label: 'Number' },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale"
      style={{ background: active ? '#00cc44' : '#111811', color: active ? '#000' : '#8fa88f', border: '1px solid ' + (active ? '#00cc44' : '#1e2e1e') }}>
      {children}
    </button>
  );
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('price_desc');
  const [rarity, setRarity] = useState('');
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [quickAddCard, setQuickAddCard] = useState<Card | null>(null);

  const enabled = query.length > 1;

  const { data, isFetching } = useQuery({
    queryKey: ['search', query, sort, rarity, language, page],
    queryFn: () => searchCards({ q: query, sort, rarity: rarity || undefined, language: language || undefined, page, limit: 32 }),
    enabled,
    placeholderData: prev => prev,
  });

  const cards = data?.data ?? [];

  return (
    <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
      <header className="fixed top-0 left-0 right-0 z-40 safe-top"
        style={{ background: 'rgba(10,14,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e2e1e' }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3 space-y-2.5">
          <h1 className="text-[22px] font-bold tracking-tight text-[#e8f5e8]">Search</h1>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
            <SearchIcon size={15} className="text-[#4a5e4a] flex-shrink-0" />
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="Charizard, Pikachu, Mewtwo..."
              className="flex-1 text-[15px] bg-transparent outline-none text-[#e8f5e8] placeholder:text-[#4a5e4a]"
              autoFocus />
            {query && <button onClick={() => { setQuery(''); setPage(1); }} className="press-scale"><X size={14} className="text-[#4a5e4a]" /></button>}
            {isFetching && <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00cc44] border-t-transparent animate-spin" />}
            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden flex-shrink-0" style={{ border: '1px solid #1e2e1e' }}>
              <button onClick={() => setViewMode('grid')} className="p-2 press-scale"
                style={{ background: viewMode === 'grid' ? '#1e2e1e' : 'transparent', color: viewMode === 'grid' ? '#e8f5e8' : '#4a5e4a' }}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setViewMode('list')} className="p-2 press-scale"
                style={{ background: viewMode === 'list' ? '#1e2e1e' : 'transparent', color: viewMode === 'list' ? '#e8f5e8' : '#4a5e4a' }}>
                <List size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5">
            <Chip active={language === ''} onClick={() => setLanguage('')}>All</Chip>
            <Chip active={language === 'EN'} onClick={() => setLanguage('EN')}>EN</Chip>
            <Chip active={language === 'JP'} onClick={() => setLanguage('JP')}>JP</Chip>
            <div className="w-px flex-shrink-0 mx-1" style={{ background: '#1e2e1e' }} />
            {SORT_OPTIONS.map(s => (
              <Chip key={s.value} active={sort === s.value} onClick={() => setSort(s.value)}>{s.label}</Chip>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5">
            <Chip active={!rarity} onClick={() => setRarity('')}>All Rarities</Chip>
            {RARITY_OPTIONS.map(r => (
              <Chip key={r} active={rarity === r} onClick={() => setRarity(r === rarity ? '' : r)}>
                {r.replace(/([A-Z])/g, ' $1').trim()}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <main className="pt-56 pb-36 max-w-[1600px] mx-auto px-4 sm:px-8 page-enter">
        {!enabled ? (
          <div className="text-center py-24">
            <SearchIcon size={44} className="mx-auto text-[#1e2e1e] mb-4" />
            <p className="text-[16px] font-semibold text-[#8fa88f]">Search for cards</p>
            <p className="text-[13px] text-[#4a5e4a] mt-1">Try "Charizard ex" or "Pikachu VMAX"</p>
          </div>
        ) : (
          <>
            {data && <p className="text-[12px] text-[#4a5e4a] mb-3">{data.pagination.total.toLocaleString()} results</p>}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {isFetching && cards.length === 0
                  ? Array.from({ length: 24 }).map((_, i) => <CardTileSkeleton key={i} />)
                  : cards.map(card => <CardTile key={card.id} card={card} onQuickAdd={() => setQuickAddCard(card)} />)
                }
              </div>
            ) : (
              <div className="space-y-2">
                {isFetching && cards.length === 0
                  ? Array.from({ length: 20 }).map((_, i) => <CardListSkeleton key={i} />)
                  : cards.map(card => <CardListItem key={card.id} card={card} onQuickAdd={() => setQuickAddCard(card)} />)
                }
              </div>
            )}
            {data && data.pagination.pages > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className={cn('px-4 py-2 rounded-xl text-[13px] font-semibold press-scale disabled:opacity-30')}
                  style={{ background: '#111811', border: '1px solid #1e2e1e', color: '#8fa88f' }}>← Prev</button>
                <span className="text-[13px] text-[#4a5e4a] self-center">{page} / {data.pagination.pages}</span>
                <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages}
                  className={cn('px-4 py-2 rounded-xl text-[13px] font-semibold press-scale disabled:opacity-30')}
                  style={{ background: '#111811', border: '1px solid #1e2e1e', color: '#8fa88f' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </main>
      <AddCardSheet open={!!quickAddCard} initialCard={quickAddCard ?? undefined} onClose={() => setQuickAddCard(null)} />
    </div>
  );
}
