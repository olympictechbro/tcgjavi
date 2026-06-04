import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Flame, Package, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchCards, getTrending, getSets, type Card } from '../lib/api';
import { CardTile, CardTileSkeleton, CardListItem, CardListSkeleton } from '../components/ui/CardTile';
import { AddCardSheet } from '../components/ui/AddCardSheet';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickAddCard, setQuickAddCard] = useState<Card | null>(null);

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
      limit: viewMode === 'list' ? 40 : 30,
    }),
    placeholderData: prev => prev,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
  });

  const cards: Card[] = data?.data ?? [];
  const totalPages = data?.pagination.pages ?? 1;

  // Sort trending by absolute price change
  const hotCards = [...trending].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 10);

  const chipStyle = (active: boolean) => ({
    background: active ? '#00cc44' : '#111811',
    color: active ? '#000' : '#8fa88f',
    border: '1px solid ' + (active ? '#00cc44' : '#1e2e1e'),
  });

  return (
    <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 safe-top"
        style={{ background: 'rgba(10,14,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e2e1e' }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2 py-3">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: '#111811', border: '1px solid #1e2e1e' }}
            >
              <Search size={15} className="text-[#4a5e4a] flex-shrink-0" />
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search Pokémon, sets..."
                className="flex-1 text-[15px] bg-transparent outline-none text-[#e8f5e8] placeholder:text-[#4a5e4a]"
              />
              {isFetching && <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00cc44] border-t-transparent animate-spin" />}
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden flex-shrink-0" style={{ border: '1px solid #1e2e1e' }}>
              <button onClick={() => setViewMode('grid')} className="p-2 press-scale"
                style={{ background: viewMode === 'grid' ? '#1e2e1e' : '#111811', color: viewMode === 'grid' ? '#e8f5e8' : '#4a5e4a' }}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className="p-2 press-scale"
                style={{ background: viewMode === 'list' ? '#1e2e1e' : '#111811', color: viewMode === 'list' ? '#e8f5e8' : '#4a5e4a' }}>
                <List size={16} />
              </button>
            </div>

            <button onClick={() => setShowFilters(v => !v)} className="p-2 rounded-xl press-scale flex-shrink-0"
              style={{ background: showFilters ? '#00cc44' : '#111811', border: '1px solid ' + (showFilters ? '#00cc44' : '#1e2e1e'), color: showFilters ? '#000' : '#8fa88f' }}>
              <SlidersHorizontal size={17} strokeWidth={2} />
            </button>
          </div>

          {showFilters && (
            <div className="pb-3 space-y-2 page-enter">
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {LANGUAGE_FILTERS.map(l => (
                  <button key={l} onClick={() => { setLanguage(l); setPage(1); }}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale"
                    style={chipStyle(language === l)}>{l}</button>
                ))}
                <div className="w-px mx-1 flex-shrink-0" style={{ background: '#1e2e1e' }} />
                {SORT_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => { setSort(s.value); setPage(1); }}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale"
                    style={chipStyle(sort === s.value)}>{s.label}</button>
                ))}
              </div>
              {setsData && (
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  <button onClick={() => setSetFilter('')}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale"
                    style={chipStyle(!setFilter)}>All Sets</button>
                  {setsData.slice(0, 30).map(s => (
                    <button key={s.id} onClick={() => { setSetFilter(s.id); setPage(1); }}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale flex items-center gap-1.5"
                      style={chipStyle(setFilter === s.id)}>
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

      <main className={cn('max-w-[1600px] mx-auto px-4 sm:px-8 pb-36', showFilters ? 'pt-48' : 'pt-20')}>

        {/* ── Trending section ─────────────────────────────────────────────── */}
        {!query && hotCards.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} className="text-orange-400" />
              <h2 className="text-[16px] font-bold text-[#e8f5e8] tracking-tight">Trending · Biggest Movers</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {hotCards.map(t => {
                const isUp = t.changePct >= 0;
                return (
                  <Link
                    key={t.card.id}
                    to={`/card/${t.card.id}`}
                    className="flex-shrink-0 w-36 rounded-2xl overflow-hidden press-scale"
                    style={{ background: '#111811', border: '1px solid #1e2e1e' }}
                  >
                    <div className="relative bg-[#0a0e0a]">
                      {t.card.imageSmall && (
                        <img src={t.card.imageSmall} alt={t.card.name} className="w-full aspect-[2.5/3.5] object-contain p-2" />
                      )}
                      {/* Big price change badge */}
                      <div
                        className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[11px] font-bold"
                        style={{ background: isUp ? '#00cc4420' : '#ff3b3b20', color: isUp ? '#00cc44' : '#ff3b3b', border: '1px solid ' + (isUp ? '#00cc4440' : '#ff3b3b40') }}
                      >
                        {isUp ? '▲' : '▼'} {Math.abs(t.changePct).toFixed(1)}%
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[12px] font-bold text-[#e8f5e8] truncate">{t.card.name}</p>
                      <p className="text-[11px] text-[#4a5e4a] truncate mt-0.5">{t.card.set?.name}</p>
                      <p className="text-[15px] font-bold mt-1" style={{ color: isUp ? '#00cc44' : '#ff3b3b' }}>
                        ${t.todayPrice?.toFixed(2) ?? '—'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Sets row ─────────────────────────────────────────────────────── */}
        {!query && setsData && setsData.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} className="text-[#00cc44]" />
              <h2 className="text-[16px] font-bold text-[#e8f5e8] tracking-tight">Sets</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {setsData.slice(0, 20).map(s => (
                <button key={s.id} onClick={() => { setSetFilter(s.id); setShowFilters(true); }}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-2 px-4 py-3.5 rounded-2xl press-scale"
                  style={{ background: '#111811', border: '1px solid #1e2e1e', minWidth: '120px' }}>
                  {s.logoUrl
                    ? <img src={s.logoUrl} alt={s.name} className="h-10 max-w-[100px] object-contain" />
                    : <span className="text-[11px] font-semibold text-center text-[#8fa88f] leading-tight px-1">{s.name}</span>}
                  {s.symbolUrl && <img src={s.symbolUrl} alt="" className="w-5 h-5 object-contain" />}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Grid header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[#e8f5e8]">
            {query ? `"${query}"` : 'All Cards'}
          </h2>
          {data && <span className="text-[12px] text-[#4a5e4a]">{data.pagination.total.toLocaleString()} cards</span>}
        </div>

        {/* ── Card grid or list ─────────────────────────────────────────────── */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {isFetching && cards.length === 0
              ? Array.from({ length: 30 }).map((_, i) => <CardTileSkeleton key={i} />)
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

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold press-scale disabled:opacity-30"
              style={{ background: '#111811', border: '1px solid #1e2e1e', color: '#8fa88f' }}>← Prev</button>
            <span className="text-[13px] text-[#4a5e4a]">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold press-scale disabled:opacity-30"
              style={{ background: '#111811', border: '1px solid #1e2e1e', color: '#8fa88f' }}>Next →</button>
          </div>
        )}
      </main>

      <AddCardSheet
        open={!!quickAddCard}
        initialCard={quickAddCard ?? undefined}
        onClose={() => setQuickAddCard(null)}
      />
    </div>
  );
}
