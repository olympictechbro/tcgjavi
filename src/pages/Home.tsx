import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Flame, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchCards, getTrending, getSets, type Card } from '../lib/api';
import { CardTile, CardTileSkeleton } from '../components/ui/CardTile';
import { cn } from '../lib/cn';

const SORT_OPTIONS = [
  { value: 'name_asc',   label: 'Name A–Z' },
  { value: 'name_desc',  label: 'Name Z–A' },
  { value: 'price_desc', label: 'Price: High–Low' },
  { value: 'price_asc',  label: 'Price: Low–High' },
  { value: 'number_asc', label: 'Card Number' },
];

const TYPE_FILTERS = ['All', 'Cards', 'Sealed'];
const LANGUAGE_FILTERS = ['All', 'EN', 'JP'];

export default function Home() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [language, setLanguage] = useState('All');
  const [setFilter, setSetFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data: setsData } = useQuery({
    queryKey: ['sets', language],
    queryFn: () => getSets(language !== 'All' ? { language } : undefined),
  });

  const { data, isFetching } = useQuery({
    queryKey: ['cards', query, sort, language, setFilter, page],
    queryFn: () => searchCards({
      q: query || 'a',
      sort,
      language: language !== 'All' ? language : undefined,
      setId: setFilter || undefined,
      page,
      limit: 24,
    }),
    placeholderData: prev => prev,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
  });

  const cards: Card[] = data?.data ?? [];
  const totalPages = data?.pagination.pages ?? 1;

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Floating header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/20 safe-top">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3">
            <div className="flex-1 flex items-center gap-2 bg-[#E5E5EA]/80 rounded-xl px-3 py-2">
              <Search size={15} className="text-[#8E8E93] flex-shrink-0" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search Pokémon, sets..."
                className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-[#8E8E93]"
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                'p-2 rounded-xl transition-colors press-scale',
                showFilters ? 'bg-[#007AFF] text-white' : 'bg-[#E5E5EA]/80 text-[#3C3C43]'
              )}
            >
              <SlidersHorizontal size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div className="pb-3 space-y-2.5 page-enter">
              {/* Type filter */}
              <div className="flex gap-2">
                {TYPE_FILTERS.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTypeFilter(t); setPage(1); }}
                    className={cn(
                      'text-[13px] font-medium px-3 py-1.5 rounded-full press-scale',
                      typeFilter === t ? 'bg-[#007AFF] text-white' : 'bg-[#E5E5EA]/80 text-[#3C3C43]'
                    )}
                  >
                    {t}
                  </button>
                ))}
                <div className="mx-2 w-px bg-[#C7C7CC]" />
                {LANGUAGE_FILTERS.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l); setPage(1); }}
                    className={cn(
                      'text-[13px] font-medium px-3 py-1.5 rounded-full press-scale',
                      language === l ? 'bg-[#007AFF] text-white' : 'bg-[#E5E5EA]/80 text-[#3C3C43]'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {SORT_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => { setSort(s.value); setPage(1); }}
                    className={cn(
                      'text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale',
                      sort === s.value ? 'bg-[#1C1C1E] text-white' : 'bg-[#E5E5EA]/80 text-[#3C3C43]'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Set filter */}
              {setsData && (
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  <button
                    onClick={() => setSetFilter('')}
                    className={cn(
                      'text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale',
                      !setFilter ? 'bg-[#34C759] text-white' : 'bg-[#E5E5EA]/80 text-[#3C3C43]'
                    )}
                  >
                    All Sets
                  </button>
                  {setsData.slice(0, 20).map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSetFilter(s.id); setPage(1); }}
                      className={cn(
                        'text-[12px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale flex items-center gap-1.5',
                        setFilter === s.id ? 'bg-[#34C759] text-white' : 'bg-[#E5E5EA]/80 text-[#3C3C43]'
                      )}
                    >
                      {s.symbolUrl && <img src={s.symbolUrl} alt="" className="w-3.5 h-3.5 object-contain" />}
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className={cn('max-w-2xl mx-auto px-4 pb-32', showFilters ? 'pt-48' : 'pt-20')}>

        {/* Trending section */}
        {!query && trending.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Flame size={16} className="text-[#FF9500]" />
              <h2 className="text-[17px] font-bold text-[#1C1C1E]">Trending Today</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {trending.slice(0, 8).map(t => (
                <Link
                  key={t.card.id}
                  to={`/card/${t.card.id}`}
                  className="flex-shrink-0 w-28 bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.05] press-scale"
                >
                  {t.card.imageSmall && (
                    <img src={t.card.imageSmall} alt={t.card.name} className="w-full aspect-[2.5/3.5] object-contain p-1 bg-gradient-to-br from-gray-50 to-gray-100" />
                  )}
                  <div className="px-2 pb-2 pt-1">
                    <p className="text-[11px] font-semibold truncate">{t.card.name}</p>
                    <p className={cn('text-[11px] font-bold', t.changePct >= 0 ? 'text-gain' : 'text-loss')}>
                      {t.changePct >= 0 ? '▲' : '▼'} {Math.abs(t.changePct).toFixed(1)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sets quick-access row */}
        {!query && setsData && (
          <section className="mb-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Package size={16} className="text-[#007AFF]" />
              <h2 className="text-[17px] font-bold text-[#1C1C1E]">Sets</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {setsData.slice(0, 15).map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSetFilter(s.id); setShowFilters(true); }}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-2xl p-3 shadow-sm border border-black/[0.05] press-scale w-20"
                >
                  {s.logoUrl
                    ? <img src={s.logoUrl} alt={s.name} className="w-16 h-8 object-contain" />
                    : <span className="text-[10px] font-medium text-center text-[#3C3C43] leading-tight">{s.name}</span>
                  }
                  {s.symbolUrl && <img src={s.symbolUrl} alt="" className="w-5 h-5 object-contain" />}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Card grid header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#1C1C1E]">
            {query ? `Results for "${query}"` : 'All Cards'}
          </h2>
          {data && <span className="text-[13px] text-[#8E8E93]">{data.pagination.total.toLocaleString()} cards</span>}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {isFetching && cards.length === 0
            ? Array.from({ length: 12 }).map((_, i) => <CardTileSkeleton key={i} />)
            : cards.map(card => <CardTile key={card.id} card={card} />)
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2.5 bg-white rounded-xl text-[14px] font-medium shadow-sm border border-black/[0.06] disabled:opacity-40 press-scale"
            >
              ← Prev
            </button>
            <span className="text-[14px] text-[#8E8E93]">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-5 py-2.5 bg-white rounded-xl text-[14px] font-medium shadow-sm border border-black/[0.06] disabled:opacity-40 press-scale"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
