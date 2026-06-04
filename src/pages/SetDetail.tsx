import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getSet, getCardsBySet } from '../lib/api';
import { CardTile, CardTileSkeleton } from '../components/ui/CardTile';
import { Header } from '../components/ui/Header';

export default function SetDetail() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  const { data: set } = useQuery({
    queryKey: ['set', id],
    queryFn: () => getSet(id!),
    enabled: !!id,
  });

  const { data, isFetching } = useQuery({
    queryKey: ['set-cards', id, page],
    queryFn: () => getCardsBySet(id!, page, 60),
    enabled: !!id,
    placeholderData: prev => prev,
  });

  const cards = data?.data ?? [];
  const totalPages = data?.pagination.pages ?? 1;

  return (
    <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
      <Header title={set?.name ?? 'Set'} back />

      <main className="pt-16 pb-36 max-w-[1600px] mx-auto px-4 sm:px-8">
        {/* Set header */}
        {set && (
          <div className="py-6 flex flex-col items-center gap-3">
            {set.logoUrl && (
              <img src={set.logoUrl} alt={set.name} className="h-16 object-contain" />
            )}
            <div className="text-center">
              <p className="text-[13px] text-[#4a5e4a]">{set.series}</p>
              <div className="flex items-center justify-center gap-3 mt-1">
                {set.symbolUrl && <img src={set.symbolUrl} alt="" className="w-5 h-5 object-contain" />}
                <span className="text-[12px] text-[#4a5e4a]">{set.total ?? set.printedTotal ?? '?'} cards</span>
                {set.releaseDate && (
                  <span className="text-[12px] text-[#4a5e4a]">
                    {new Date(set.releaseDate).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {data && (
          <p className="text-[12px] text-[#4a5e4a] mb-4">{data.pagination.total} cards</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isFetching && cards.length === 0
            ? Array.from({ length: 24 }).map((_, i) => <CardTileSkeleton key={i} />)
            : cards.map(card => <CardTile key={card.id} card={card} />)
          }
        </div>

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
    </div>
  );
}
