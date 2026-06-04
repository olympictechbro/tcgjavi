import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Layers, Tag } from 'lucide-react';
import { getInventory } from '../lib/api';
import { cn } from '../lib/cn';

const TAGS = ['All', 'flip', 'personal-collection', 'grading', 'trade-bait'];
const CONDITIONS = ['All', 'NEAR_MINT', 'LIGHTLY_PLAYED', 'GRADED_PSA_10', 'GRADED_PSA_9'];

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale"
      style={{
        background: active ? '#00cc44' : '#111811',
        color: active ? '#000' : '#8fa88f',
        border: '1px solid ' + (active ? '#00cc44' : '#1e2e1e'),
      }}
    >
      {children}
    </button>
  );
}

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
    <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 safe-top"
        style={{ background: 'rgba(10,14,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e2e1e' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-[24px] font-bold tracking-tight text-[#e8f5e8]">Collection</h1>
        </div>
      </header>

      <main className="pt-20 pb-32 max-w-2xl mx-auto px-4 page-enter">

        {/* Portfolio value banner */}
        {summary && (
          <div
            className="rounded-2xl p-4 mb-5"
            style={{ background: '#111811', border: '1px solid #1e2e1e' }}
          >
            <p className="text-[12px] text-[#4a5e4a] font-medium mb-1 uppercase tracking-widest">Portfolio Value</p>
            <p className="text-[36px] font-bold text-[#00cc44] tracking-tight">
              ${summary.totalMarketValue.toFixed(2)}
            </p>
            <div className="flex items-center gap-4 mt-2.5">
              <div>
                <p className="text-[10px] text-[#4a5e4a] uppercase tracking-wide">Cost Basis</p>
                <p className="text-[14px] font-semibold text-[#8fa88f]">${summary.totalCostBasis.toFixed(2)}</p>
              </div>
              <div className="w-px h-8" style={{ background: '#1e2e1e' }} />
              <div>
                <p className="text-[10px] text-[#4a5e4a] uppercase tracking-wide">Unrealized</p>
                <p className={cn('text-[14px] font-semibold', summary.totalUnrealizedGain >= 0 ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                  {summary.totalUnrealizedGain >= 0 ? '+' : ''}${summary.totalUnrealizedGain.toFixed(2)}
                  {' '}({summary.totalUnrealizedGainPct >= 0 ? '+' : ''}{summary.totalUnrealizedGainPct.toFixed(1)}%)
                </p>
              </div>
              <div className="ml-auto">
                {summary.totalUnrealizedGain >= 0
                  ? <TrendingUp size={24} className="text-[#00cc44]" />
                  : <TrendingDown size={24} className="text-[#ff3b3b]" />
                }
              </div>
            </div>
          </div>
        )}

        {/* Tag filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
          {TAGS.map(t => (
            <Chip key={t} active={tag === t} onClick={() => setTag(t)}>
              <span className="flex items-center gap-1">
                {t !== 'All' && <Tag size={10} />}{t}
              </span>
            </Chip>
          ))}
        </div>

        {/* Condition filters */}
        <div className="flex gap-2 overflow-x-auto pb-3">
          {CONDITIONS.map(c => (
            <Chip key={c} active={condition === c} onClick={() => setCondition(c)}>
              {c === 'All' ? 'All Conditions' : c.replace(/_/g, ' ').replace('NEAR MINT', 'NM').replace('LIGHTLY PLAYED', 'LP')}
            </Chip>
          ))}
        </div>

        {/* Count */}
        <div className="flex items-center gap-2 mb-3">
          <Layers size={13} className="text-[#4a5e4a]" />
          <span className="text-[12px] text-[#4a5e4a]">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-20 shimmer" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Layers size={44} className="mx-auto text-[#1e2e1e] mb-3" />
            <p className="text-[16px] font-semibold text-[#8fa88f]">No cards yet</p>
            <p className="text-[13px] text-[#4a5e4a] mt-1">Tap + to add your first card</p>
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
                  className="flex items-center gap-3 p-3 rounded-2xl press-scale"
                  style={{ background: '#111811', border: '1px solid #1e2e1e' }}
                >
                  {image ? (
                    <img src={image} alt={name} className="w-11 h-[58px] object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-[58px] rounded-xl flex-shrink-0" style={{ background: '#1c261c' }} />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#e8f5e8] truncate">{name}</p>
                    <p className="text-[11px] text-[#4a5e4a] truncate">
                      {setName}{number ? ` · #${number}` : ''}
                    </p>
                    <p className="text-[10px] text-[#4a5e4a] mt-0.5">
                      {item.condition.replace(/_/g, ' ')} · Qty {item.quantityHeld}
                    </p>
                    <p className="text-[10px] text-[#4a5e4a]">
                      Cost ${item.costBasis.toFixed(2)}/ea
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {item.currentValue != null ? (
                      <>
                        <p className="text-[14px] font-bold text-[#e8f5e8]">${item.currentValue.toFixed(2)}</p>
                        <p className={cn('text-[12px] font-semibold', isGain ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                          {isGain ? '+' : ''}${item.unrealizedGain?.toFixed(2)}
                        </p>
                        <p className={cn('text-[10px]', isGain ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                          {isGain ? '+' : ''}{item.unrealizedGainPct?.toFixed(1)}%
                        </p>
                      </>
                    ) : (
                      <p className="text-[13px] text-[#4a5e4a]">—</p>
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
