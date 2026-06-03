import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchCards } from '../lib/api';
import { CardTile, CardTileSkeleton } from '../components/ui/CardTile';
import { cn } from '../lib/cn';

const RARITY_OPTIONS = [
  'Common','Uncommon','Rare','RareHolo','RareUltra','RareSecret',
  'IllustrationRare','SpecialIllustrationRare','HyperRare','VMAX','VSTAR','V',
];
const SORT_OPTIONS = [
  { value: 'price_desc', label: '💰 Price: High–Low' },
  { value: 'price_asc',  label: '💸 Price: Low–High' },
  { value: 'name_asc',   label: '🔤 Name A–Z' },
  { value: 'name_desc',  label: '🔤 Name Z–A' },
  { value: 'number_asc', label: '🔢 Card Number' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('price_desc');
  const [rarity, setRarity] = useState('');
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);

  const enabled = query.length > 1;

  const { data, isFetching } = useQuery({
    queryKey: ['search', query, sort, rarity, language, page],
    queryFn: () => searchCards({ q: query, sort, rarity: rarity || undefined, language: language || undefined, page, limit: 24 }),
    enabled,
    placeholderData: prev => prev,
  });

  const cards = data?.data ?? [];

  function clear() { setQuery(''); setPage(1); }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/20 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2.5">
          <h1 className="text-[28px] font-bold tracking-tight">Search</h1>

          {/* Search input */}
          <div className="flex items-center gap-2 bg-[#E5E5EA]/80 rounded-2xl px-4 py-3">
            <SearchIcon size={16} className="text-[#8E8E93] flex-shrink-0" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="Charizard, Pikachu, Mewtwo..."
              className="flex-1 text-[16px] bg-transparent outline-none placeholder:text-[#8E8E93]"
              autoFocus
            />
            {query && (
              <button onClick={clear} className="press-scale">
                <X size={16} className="text-[#8E8E93]" />
              </button>
            )}
            {isFetching && (
              <div className="w-4 h-4 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin" />
            )}
          </div>

          {/* Sort + filters */}
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {/* Language */}
            {['', 'EN', 'JP'].map(l => (
              <button
                key={l || 'all'}
                onClick={() => setLanguage(l)}
                className={cn(
                  'text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale',
                  language === l ? 'bg-[#007AFF] text-white' : 'bg-white text-[#3C3C43] shadow-sm'
                )}
              >
                {l || 'All'}
              </button>
            ))}
            <div className="w-px bg-[#C7C7CC] mx-1 flex-shrink-0" />
            {SORT_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={cn(
                  'text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale',
                  sort === s.value ? 'bg-[#1C1C1E] text-white' : 'bg-white text-[#3C3C43] shadow-sm'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Rarity filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setRarity('')}
              className={cn(
                'text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale',
                !rarity ? 'bg-[#FF9500] text-white' : 'bg-white text-[#3C3C43] shadow-sm'
              )}
            >
              All Rarities
            </button>
            {RARITY_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setRarity(r === rarity ? '' : r)}
                className={cn(
                  'text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale',
                  rarity === r ? 'bg-[#FF9500] text-white' : 'bg-white text-[#3C3C43] shadow-sm'
                )}
              >
                {r.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="pt-64 pb-32 max-w-2xl mx-auto px-4 page-enter">
        {!enabled ? (
          <div className="text-center py-24">
            <SearchIcon size={48} className="mx-auto text-[#C7C7CC] mb-3" />
            <p className="text-[17px] font-semibold text-[#3C3C43]">Search for cards</p>
            <p className="text-[14px] text-[#8E8E93] mt-1">Try "Charizard ex" or "Pikachu VMAX"</p>
          </div>
        ) : (
          <>
            {data && (
              <p className="text-[13px] text-[#8E8E93] mb-3">
                {data.pagination.total.toLocaleString()} results
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {isFetching && cards.length === 0
                ? Array.from({ length: 12 }).map((_, i) => <CardTileSkeleton key={i} />)
                : cards.map(card => <CardTile key={card.id} card={card} />)
              }
            </div>

            {data && data.pagination.pages > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 bg-white rounded-xl text-[14px] font-medium shadow-sm disabled:opacity-40 press-scale"
                >← Prev</button>
                <span className="text-[14px] text-[#8E8E93] self-center">{page} / {data.pagination.pages}</span>
                <button
                  onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                  disabled={page === data.pagination.pages}
                  className="px-5 py-2.5 bg-white rounded-xl text-[14px] font-medium shadow-sm disabled:opacity-40 press-scale"
                >Next →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
