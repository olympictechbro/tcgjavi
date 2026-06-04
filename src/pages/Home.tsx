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
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'number_asc', label: 'Number' },
];

const LANGUAGE_FILTERS = ['All', 'EN', 'JP'];

export default function Home() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [language, setLanguage] = useState('All');
  const [setFilter, setSetFilter] = useState('');
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
    <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
      {/* Sticky header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 safe-top"
        style={{ background: 'rgba(10,14,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e2e1e' }}
      >
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3">
            {/* Search bar */}
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#111811', border: '1px solid #1e2e1e' }}
            >
              <Search size={15} className="text-[#4a5e4a] flex-shrink-0" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search Pokémon, sets..."
                className="flex-1 text-[15px] bg-transparent outline-none text-[#e8f5e8] placeholder:text-[#4a5e4a]"
              />
              {isFetching && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00cc44] border-t-transparent animate-spin" />
              )}
            </div>

            <button
              onClick={() => setShowFilters(v => !v)}
              className="p-2 rounded-xl transition-colors press-scale"
              style={{
                background: showFilters ? '#00cc44' : '#111811',
                border: '1px solid ' + (showFilters ? '#00cc44' : '#1e2e1e'),
                color: showFilters ? '#000' : '#8fa88f',
              }}
            >
              <SlidersHorizontal size={17} strokeWidth={2} />
            </button>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div className="pb-3 space-y-2 page-enter">
              {/* Language + sort */}
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {LANGUAGE_FILTERS.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l); setPage(1); }}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale transition-all"
                    style={{
                      background: language === l ? '#00cc44' : '#111811',
                      color: language === l ? '#000' : '#8fa88f',
                      border: '1px solid ' + (language === l ? '#00cc44' : '#1e2e1e'),
                    }}
                  >
                    {l}
                  </button>
                ))}
                <div className="w-px mx-1 flex-shrink-0" style={{ background: '#1e2e1e' }} />
                {SORT_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => { setSort(s.value); setPage(1); }}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale"
                    style={{
                      background: sort === s.value ? '#1e2e1e' : 'transparent',
                      color: sort === s.value ? '#e8f5e8' : '#4a5e4a',
                      border: '1px solid ' + (sort === s.value ? '#2a3d2a' : 'transparent'),
                    }}
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
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale"
                    style={{
                      background: !setFilter ? '#00cc44' : '#111811',
                      color: !setFilter ? '#000' : '#8fa88f',
                      border: '1px solid ' + (!setFilter ? '#00cc44' : '#1e2e1e'),
                    }}
                  >
                    All Sets
                  </button>
                  {setsData.slice(0, 20).map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSetFilter(s.id); setPage(1); }}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale flex items-center gap-1.5"
                      style={{
                        background: setFilter === s.id ? '#00cc44' : '#111811',
                        color: setFilter === s.id ? '#000' : '#8fa88f',
                        border: '1px solid ' + (setFilter === s.id ? '#00cc44' : '#1e2e1e'),
                      }}
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
      <main className={cn('max-w-2xl mx-auto px-4 pb-32', showFilters ? 'pt-44' : 'pt-20')}>

        {/* Trending */}
        {!query && trending.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-1.5 mb-3">
              <Flame size={15} className="text-orange-400" />
              <h2 className="text-[15px] font-bold text-[#e8f5e8] tracking-tight">Trending Today</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {trending.slice(0, 8).map(t => (
                <Link
                  key={t.card.id}
                  to={`/card/${t.card.id}`}
                  className="flex-shrink-0 w-24 rounded-2xl overflow-hidden press-scale"
                  style={{ background: '#111811', border: '1px solid #1e2e1e' }}
                >
                  {t.card.imageSmall && (
                    <img
                      src={t.card.imageSmall}
                      alt={t.card.name}
                      className="w-full aspect-[2.5/3.5] object-contain p-1"
                      style={{ background: '#0a0e0a' }}
                    />
                  )}
                  <div className="px-2 pb-2 pt-1">
                    <p className="text-[11px] font-semibold truncate text-[#e8f5e8]">{t.card.name}</p>
                    <p className={cn('text-[10px] font-bold', t.changePct >= 0 ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                      {t.changePct >= 0 ? '▲' : '▼'} {Math.abs(t.changePct).toFixed(1)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sets row */}
        {!query && setsData && (
          <section className="mb-6">
            <div className="flex items-center gap-1.5 mb-3">
              <Package size={15} className="text-[#00cc44]" />
              <h2 className="text-[15px] font-bold text-[#e8f5e8] tracking-tight">Sets</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {setsData.slice(0, 15).map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSetFilter(s.id); setShowFilters(true); }}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl press-scale w-20"
                  style={{ background: '#111811', border: '1px solid #1e2e1e' }}
                >
                  {s.logoUrl
                    ? <img src={s.logoUrl} alt={s.name} className="w-14 h-7 object-contain" />
                    : <span className="text-[9px] font-medium text-center text-[#8fa88f] leading-tight">{s.name}</span>
                  }
                  {s.symbolUrl && <img src={s.symbolUrl} alt="" className="w-4 h-4 object-contain" />}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Grid header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#e8f5e8]">
            {query ? `"${query}"` : 'All Cards'}
          </h2>
          {data && (
            <span className="text-[12px] text-[#4a5e4a]">
              {data.pagination.total.toLocaleString()} cards
            </span>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
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
              className="px-4 py-2 rounded-xl text-[13px] font-semibold press-scale disabled:opacity-30 transition-all"
              style={{ background: '#111811', border: '1px solid #1e2e1e', color: '#8fa88f' }}
            >
              ← Prev
            </button>
            <span className="text-[13px] text-[#4a5e4a]">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold press-scale disabled:opacity-30 transition-all"
              style={{ background: '#111811', border: '1px solid #1e2e1e', color: '#8fa88f' }}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
