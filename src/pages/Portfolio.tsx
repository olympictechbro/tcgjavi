import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Layers, MoreHorizontal } from 'lucide-react';
import { getInventory } from '../lib/api';
import { ItemMenu } from '../components/ui/ItemMenu';
import type { InventoryItem } from '../lib/api';
import { cn } from '../lib/cn';

const TAGS = ['All', 'flip', 'personal-collection', 'grading', 'trade-bait'];
const CONDITIONS = ['All', 'NEAR_MINT', 'LIGHTLY_PLAYED', 'GRADED_PSA_10', 'GRADED_PSA_9'];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 press-scale"
      style={{ background: active ? '#00cc44' : '#111811', color: active ? '#000' : '#8fa88f', border: '1px solid ' + (active ? '#00cc44' : '#1e2e1e') }}>
      {children}
    </button>
  );
}

export default function Portfolio() {
  const [tag, setTag] = useState('All');
  const [condition, setCondition] = useState('All');
  const [menuItem, setMenuItem] = useState<InventoryItem | null>(null);

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
      <header className="fixed top-0 left-0 right-0 z-40 safe-top"
        style={{ background: 'rgba(10,14,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e2e1e' }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3">
          <h1 className="text-[22px] font-bold tracking-tight text-[#e8f5e8]">Collection</h1>
        </div>
      </header>

      <main className="pt-20 pb-36 max-w-[1600px] mx-auto px-4 sm:px-8 page-enter">

        {/* Portfolio banner */}
        {summary && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
            <p className="text-[10px] text-[#4a5e4a] font-semibold uppercase tracking-widest mb-1">Portfolio Value</p>
            <p className="text-[38px] font-bold text-[#00cc44] tracking-tight leading-none">
              ${summary.totalMarketValue.toFixed(2)}
            </p>
            <div className="flex items-center gap-5 mt-3">
              <div>
                <p className="text-[10px] text-[#4a5e4a] uppercase tracking-wide">Cost Basis</p>
                <p className="text-[15px] font-bold text-[#8fa88f]">${summary.totalCostBasis.toFixed(2)}</p>
              </div>
              <div className="w-px h-8" style={{ background: '#1e2e1e' }} />
              <div>
                <p className="text-[10px] text-[#4a5e4a] uppercase tracking-wide">Unrealized</p>
                <p className={cn('text-[15px] font-bold', summary.totalUnrealizedGain >= 0 ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                  {summary.totalUnrealizedGain >= 0 ? '+' : ''}${summary.totalUnrealizedGain.toFixed(2)}
                  <span className="text-[12px] ml-1 opacity-70">({summary.totalUnrealizedGainPct >= 0 ? '+' : ''}{summary.totalUnrealizedGainPct.toFixed(1)}%)</span>
                </p>
              </div>
              <div className="ml-auto">
                {summary.totalUnrealizedGain >= 0
                  ? <TrendingUp size={22} className="text-[#00cc44]" />
                  : <TrendingDown size={22} className="text-[#ff3b3b]" />}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
          {TAGS.map(t => <Chip key={t} active={tag === t} onClick={() => setTag(t)}>{t}</Chip>)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          {CONDITIONS.map(c => (
            <Chip key={c} active={condition === c} onClick={() => setCondition(c)}>
              {c === 'All' ? 'All Conditions' : c.replace(/_/g, ' ')}
            </Chip>
          ))}
        </div>

        {/* Count */}
        <div className="flex items-center gap-2 mb-3">
          <Layers size={12} className="text-[#4a5e4a]" />
          <span className="text-[12px] text-[#4a5e4a]">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[72px] rounded-2xl shimmer" />
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
              const setId = item.card?.set?.id;
              const setName = item.card?.set?.name ?? '';
              const number = item.card?.number;
              const isGain = (item.unrealizedGain ?? 0) >= 0;

              return (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
                  {/* Card image — links to card detail */}
                  <Link to={item.cardId ? `/card/${item.cardId}` : '#'} className="flex-shrink-0">
                    {image ? (
                      <img src={image} alt={name} className="w-12 h-16 object-contain rounded-lg" />
                    ) : (
                      <div className="w-12 h-16 rounded-lg flex-shrink-0" style={{ background: '#1c261c' }} />
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={item.cardId ? `/card/${item.cardId}` : '#'}>
                      <p className="text-[14px] font-bold text-[#e8f5e8] truncate">{name}</p>
                    </Link>
                    {/* Clickable set name */}
                    {setId ? (
                      <Link to={`/set/${setId}`} className="text-[11px] text-[#4a5e4a] hover:text-[#00cc44] transition-colors truncate block">
                        {setName}{number ? ` · #${number}` : ''}
                      </Link>
                    ) : (
                      <p className="text-[11px] text-[#4a5e4a] truncate">{setName}{number ? ` · #${number}` : ''}</p>
                    )}
                    <p className="text-[10px] text-[#4a5e4a] mt-0.5">
                      {item.condition.replace(/_/g, ' ')} · {item.quantityHeld} held · ${item.costBasis.toFixed(2)}/ea
                    </p>
                  </div>

                  {/* P&L */}
                  <div className="text-right flex-shrink-0 min-w-[72px]">
                    {item.currentValue != null ? (
                      <>
                        <p className="text-[15px] font-bold text-[#e8f5e8]">${item.currentValue.toFixed(2)}</p>
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

                  {/* 3-dot menu */}
                  <button
                    onClick={e => { e.preventDefault(); setMenuItem(item); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center press-scale flex-shrink-0"
                    style={{ background: '#1c261c' }}>
                    <MoreHorizontal size={15} className="text-[#8fa88f]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Item action menu */}
      <ItemMenu item={menuItem} onClose={() => setMenuItem(null)} />
    </div>
  );
}
