import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Layers, Tag } from 'lucide-react';
import { getInventory } from '../lib/api';
import { cn } from '../lib/cn';

const TAGS = ['All', 'flip', 'personal-collection', 'grading', 'trade-bait'];
const CONDITIONS = ['All', 'NEAR_MINT', 'LIGHTLY_PLAYED', 'GRADED_PSA_10', 'GRADED_PSA_9'];

export default function Portfolio() {
  const [tag, setTag] = useState('All');
  const [condition, setCondition] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', tag, condition],
    queryFn: () => getInventory({
      tag: tag !== 'All' ? tag : undefined,
      condition: condition !== 'All' ? condition : undefined,
    }),
  });

  const items = data?.data ?? [];
  const summary = data?.summary;

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/20 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-[28px] font-bold tracking-tight">Collection</h1>
        </div>
      </header>

      <main className="pt-20 pb-32 max-w-2xl mx-auto px-4 page-enter">
        {/* Portfolio value banner */}
        {summary && (
          <div className="bg-gradient-to-br from-[#1C1C1E] to-[#3A3A3C] rounded-2xl p-4 mb-4 shadow-lg">
            <p className="text-[13px] text-white/60 font-medium mb-1">Total Portfolio Value</p>
            <p className="text-[36px] font-bold text-white tracking-tight">
              ${summary.totalMarketValue.toFixed(2)}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div>
                <p className="text-[11px] text-white/50">Cost Basis</p>
                <p className="text-[14px] font-semibold text-white/80">${summary.totalCostBasis.toFixed(2)}</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-[11px] text-white/50">Unrealized Gain</p>
                <p className={cn('text-[14px] font-semibold', summary.totalUnrealizedGain >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]')}>
                  {summary.totalUnrealizedGain >= 0 ? '+' : ''}${summary.totalUnrealizedGain.toFixed(2)}
                  {' '}({summary.totalUnrealizedGainPct >= 0 ? '+' : ''}{summary.totalUnrealizedGainPct.toFixed(1)}%)
                </p>
              </div>
              <div className="ml-auto">
                {summary.totalUnrealizedGain >= 0
                  ? <TrendingUp size={28} className="text-[#34C759]" />
                  : <TrendingDown size={28} className="text-[#FF3B30]" />
                }
              </div>
            </div>
          </div>
        )}

        {/* Tag filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
          {TAGS.map(t => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={cn(
                'flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full flex-shrink-0 press-scale',
                tag === t ? 'bg-[#007AFF] text-white' : 'bg-white text-[#3C3C43] shadow-sm'
              )}
            >
              {t !== 'All' && <Tag size={11} />}{t}
            </button>
          ))}
        </div>

        {/* Condition filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
          {CONDITIONS.map(c => (
            <button
              key={c}
              onClick={() => setCondition(c)}
              className={cn(
                'text-[12px] font-medium px-3 py-1.5 rounded-full flex-shrink-0 press-scale',
                condition === c ? 'bg-[#1C1C1E] text-white' : 'bg-white text-[#3C3C43] shadow-sm'
              )}
            >
              {c === 'All' ? 'All Conditions' : c.replace(/_/g, ' ').replace('NEAR MINT', 'NM').replace('LIGHTLY PLAYED', 'LP')}
            </button>
          ))}
        </div>

        {/* Items count */}
        <div className="flex items-center gap-2 mb-3">
          <Layers size={14} className="text-[#8E8E93]" />
          <span className="text-[13px] text-[#8E8E93]">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Item list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-20 shimmer" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Layers size={48} className="mx-auto text-[#C7C7CC] mb-3" />
            <p className="text-[17px] font-semibold text-[#3C3C43]">No cards yet</p>
            <p className="text-[14px] text-[#8E8E93] mt-1">Tap + to add your first card</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => {
              const name = item.card?.name ?? item.sealed?.name ?? 'Unknown';
              const image = item.card?.imageSmall ?? item.sealed?.imageUrl;
              const setName = item.card?.set?.name ?? '';
              const number = item.card?.number;
              const isGain = (item.unrealizedGain ?? 0) >= 0;

              return (
                <Link
                  key={item.id}
                  to={item.cardId ? `/card/${item.cardId}` : '#'}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm press-scale"
                >
                  {image ? (
                    <img src={image} alt={name} className="w-12 h-16 object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-16 bg-[#F2F2F7] rounded-xl flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">{name}</p>
                    <p className="text-[12px] text-[#8E8E93] truncate">
                      {setName}{number ? ` · #${number}` : ''}
                    </p>
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">
                      {item.condition.replace(/_/g, ' ')} · Qty {item.quantityHeld}
                    </p>
                    <p className="text-[11px] text-[#8E8E93]">
                      Cost: ${item.costBasis.toFixed(2)}/unit
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {item.currentValue != null ? (
                      <>
                        <p className="text-[15px] font-bold text-[#1C1C1E]">${item.currentValue.toFixed(2)}</p>
                        <p className={cn('text-[12px] font-semibold', isGain ? 'text-gain' : 'text-loss')}>
                          {isGain ? '+' : ''}${item.unrealizedGain?.toFixed(2)}
                        </p>
                        <p className={cn('text-[11px]', isGain ? 'text-gain' : 'text-loss')}>
                          {isGain ? '+' : ''}{item.unrealizedGainPct?.toFixed(1)}%
                        </p>
                      </>
                    ) : (
                      <p className="text-[13px] text-[#C7C7CC]">—</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
