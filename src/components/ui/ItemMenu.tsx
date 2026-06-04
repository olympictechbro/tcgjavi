import { useState } from 'react';
import { X, Edit3, DollarSign, Tag, Trash2, Check, ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateInventoryItem, removeInventoryItem, logSale } from '../../lib/api';
import type { InventoryItem } from '../../lib/api';
import { cn } from '../../lib/cn';

interface ItemMenuProps {
  item: InventoryItem | null;
  onClose: () => void;
}

const PLATFORMS = ['EBAY', 'TCG_PLAYER', 'FACEBOOK_MARKETPLACE', 'LOCAL', 'TRADE', 'STORE', 'OTHER'];
const TAGS = ['flip', 'personal-collection', 'grading', 'trade-bait'];

type View = 'menu' | 'edit-cost' | 'sell' | 'tags';

export function ItemMenu({ item, onClose }: ItemMenuProps) {
  const qc = useQueryClient();
  const [view, setView] = useState<View>('menu');
  const [newCost, setNewCost] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellQty, setSellQty] = useState(1);
  const [sellPlatform, setSellPlatform] = useState('LOCAL');
  const [sellFees, setSellFees] = useState('');
  const [done, setDone] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>(item?.tags ?? []);

  const name = item?.card?.name ?? item?.sealed?.name ?? 'Item';
  const image = item?.card?.imageSmall ?? item?.sealed?.imageUrl;
  const maxQty = item ? item.quantity - item.quantitySold : 1;

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateInventoryItem>[1]) =>
      updateInventoryItem(item!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      flash();
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeInventoryItem(item!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      onClose();
    },
  });

  const sellMutation = useMutation({
    mutationFn: () => logSale({
      type: 'SELL',
      inventoryId: item!.id,
      cardId: item!.cardId,
      sealedId: item!.sealedId,
      quantity: sellQty,
      pricePerUnit: parseFloat(sellPrice),
      feesAmount: sellFees ? parseFloat(sellFees) : 0,
      platform: sellPlatform,
      transactedAt: new Date().toISOString(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['pnl-summary'] });
      flash();
    },
  });

  function flash() {
    setDone(true);
    setTimeout(() => { onClose(); setDone(false); }, 900);
  }

  if (!item) return null;

  const gain = item.currentValue != null
    ? item.currentValue - item.costHeld
    : null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full md:max-w-lg flex flex-col rounded-t-3xl md:rounded-3xl sheet-enter md:modal-enter"
          style={{ background: '#111811', border: '1px solid #1e2e1e', borderBottom: 'none', maxHeight: 'min(88vh, 640px)' }}
          onClick={e => e.stopPropagation()}
        >

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: '#2a3d2a' }} />
          </div>

          {/* Card preview header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #1e2e1e' }}>
            {image && <img src={image} alt={name} className="w-10 h-14 object-contain flex-shrink-0 rounded-lg" />}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-[#e8f5e8] truncate">{name}</p>
              <p className="text-[11px] text-[#4a5e4a]">
                {item.condition.replace(/_/g, ' ')} · Qty {maxQty} held · ${item.costBasis.toFixed(2)}/ea
              </p>
              {gain != null && (
                <p className={cn('text-[11px] font-semibold', gain >= 0 ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                  {gain >= 0 ? '+' : ''}${gain.toFixed(2)} unrealized
                </p>
              )}
            </div>
            {view !== 'menu' ? (
              <button onClick={() => setView('menu')} className="text-[#4a5e4a] press-scale">
                <X size={18} />
              </button>
            ) : (
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
                style={{ background: '#1c261c' }}>
                <X size={14} className="text-[#8fa88f]" />
              </button>
            )}
          </div>

          {/* ── Main menu ─────────────────────────────────────── */}
          {view === 'menu' && (
            <div className="flex flex-col divide-y overflow-hidden" style={{ borderColor: '#1e2e1e' }}>
              {[
                { icon: DollarSign, label: 'Mark as Sold', sub: `Up to ${maxQty} unit${maxQty > 1 ? 's' : ''}`, color: '#00cc44', action: () => { setSellQty(1); setView('sell'); } },
                { icon: Edit3, label: 'Edit cost basis', sub: `Currently $${item.costBasis.toFixed(2)}/ea`, action: () => { setNewCost(item.costBasis.toFixed(2)); setView('edit-cost'); } },
                { icon: Tag, label: 'Edit tags', sub: item.tags.length ? item.tags.join(', ') : 'None', action: () => { setActiveTags([...item.tags]); setView('tags'); } },
              ].map(({ icon: Icon, label, sub, color, action }) => (
                <button key={label} onClick={action}
                  className="flex items-center gap-4 px-5 py-4 press-scale text-left w-full"
                  style={{ background: 'transparent' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: (color ?? '#8fa88f') + '18' }}>
                    <Icon size={17} style={{ color: color ?? '#8fa88f' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#e8f5e8]">{label}</p>
                    <p className="text-[11px] text-[#4a5e4a]">{sub}</p>
                  </div>
                  <ChevronRight size={15} className="text-[#4a5e4a]" />
                </button>
              ))}

              {/* Remove */}
              <button onClick={() => { if (confirm('Remove from collection?')) removeMutation.mutate(); }}
                className="flex items-center gap-4 px-5 py-4 press-scale w-full" style={{ background: 'transparent' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ff3b3b18' }}>
                  <Trash2 size={17} className="text-[#ff3b3b]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-semibold text-[#ff3b3b]">Remove from collection</p>
                  <p className="text-[11px] text-[#4a5e4a]">Soft-deleted, keeps transaction history</p>
                </div>
              </button>
            </div>
          )}

          {/* ── Sell form ─────────────────────────────────────── */}
          {view === 'sell' && (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="rounded-2xl divide-y overflow-hidden" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e', borderColor: '#1e2e1e' }}>
                {/* Quantity */}
                <div className="flex items-center px-4 py-3.5">
                  <span className="text-[14px] text-[#e8f5e8] flex-1">Quantity sold</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSellQty(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
                      style={{ background: '#1c261c', color: '#8fa88f' }}><Minus size={14} /></button>
                    <span className="text-[16px] font-bold w-6 text-center text-[#e8f5e8]">{sellQty}</span>
                    <button onClick={() => setSellQty(q => Math.min(maxQty, q + 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
                      style={{ background: '#1c261c', color: '#8fa88f' }}><Plus size={14} /></button>
                  </div>
                </div>
                {/* Price */}
                <div className="flex items-center px-4 py-3.5" style={{ borderColor: '#1e2e1e' }}>
                  <div className="flex-1">
                    <p className="text-[14px] text-[#e8f5e8]">Sale price <span className="text-[#4a5e4a] text-[12px]">/ unit</span></p>
                    {sellPrice && sellQty > 1 && <p className="text-[11px] text-[#4a5e4a]">Total: ${(parseFloat(sellPrice) * sellQty).toFixed(2)}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] text-[#4a5e4a]">$</span>
                    <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} autoFocus
                      placeholder="0.00" className="text-[16px] font-bold text-right w-24 outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
                  </div>
                </div>
                {/* Fees */}
                <div className="flex items-center px-4 py-3.5" style={{ borderColor: '#1e2e1e' }}>
                  <span className="text-[14px] text-[#e8f5e8] flex-1">Platform fees <span className="text-[#4a5e4a] text-[12px]">(optional)</span></span>
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] text-[#4a5e4a]">$</span>
                    <input type="number" value={sellFees} onChange={e => setSellFees(e.target.value)}
                      placeholder="0.00" className="text-[14px] text-right w-20 outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
                  </div>
                </div>
              </div>

              {/* Platform */}
              <div>
                <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2">Platform</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => setSellPlatform(p)}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full press-scale"
                      style={{ background: sellPlatform === p ? '#00cc44' : '#111811', color: sellPlatform === p ? '#000' : '#8fa88f', border: '1px solid ' + (sellPlatform === p ? '#00cc44' : '#1e2e1e') }}>
                      {p.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gain preview */}
              {sellPrice && (
                <div className="rounded-xl px-4 py-3" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
                  {(() => {
                    const revenue = parseFloat(sellPrice) * sellQty;
                    const fees = sellFees ? parseFloat(sellFees) : 0;
                    const cost = item.costBasis * sellQty;
                    const gain = revenue - fees - cost;
                    const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
                    const isPos = gain >= 0;
                    return (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-[#4a5e4a]">Realized gain</p>
                          <p className={cn('text-[20px] font-bold', isPos ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                            {isPos ? '+' : ''}${gain.toFixed(2)}
                          </p>
                        </div>
                        <p className={cn('text-[14px] font-semibold', isPos ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                          {isPos ? '+' : ''}{gainPct.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <button onClick={() => sellMutation.mutate()} disabled={!sellPrice || sellMutation.isPending || done}
                className="w-full py-4 rounded-2xl text-[16px] font-bold press-scale"
                style={{ background: done ? '#00cc44' : !sellPrice ? '#1c261c' : '#00cc44', color: done ? '#000' : !sellPrice ? '#4a5e4a' : '#000' }}>
                {done ? <span className="flex items-center justify-center gap-2"><Check size={18} /> Sold!</span>
                  : sellMutation.isPending ? 'Recording...'
                  : `Record Sale · $${sellPrice ? (parseFloat(sellPrice) * sellQty).toFixed(2) : '0.00'}`}
              </button>
            </div>
          )}

          {/* ── Edit cost basis ───────────────────────────────── */}
          {view === 'edit-cost' && (
            <div className="px-4 py-4 space-y-3">
              <div className="rounded-2xl flex items-center px-4 py-4" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
                <span className="text-[15px] text-[#e8f5e8] flex-1">Cost per unit</span>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-[#4a5e4a]">$</span>
                  <input type="number" value={newCost} onChange={e => setNewCost(e.target.value)} autoFocus
                    className="text-[20px] font-bold text-right w-28 outline-none bg-transparent text-[#e8f5e8]" />
                </div>
              </div>
              <button onClick={() => updateMutation.mutate({ costBasis: parseFloat(newCost) })}
                disabled={!newCost || updateMutation.isPending || done}
                className="w-full py-4 rounded-2xl text-[16px] font-bold press-scale"
                style={{ background: done ? '#00cc44' : !newCost ? '#1c261c' : '#00cc44', color: done ? '#000' : !newCost ? '#4a5e4a' : '#000' }}>
                {done ? <span className="flex items-center justify-center gap-2"><Check size={18} /> Updated!</span> : 'Save Cost Basis'}
              </button>
            </div>
          )}

          {/* ── Edit tags ─────────────────────────────────────── */}
          {view === 'tags' && (
            <div className="px-4 py-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => {
                  const active = activeTags.includes(tag);
                  return (
                    <button key={tag} onClick={() => setActiveTags(t => active ? t.filter(x => x !== tag) : [...t, tag])}
                      className="px-4 py-2 rounded-full text-[13px] font-semibold press-scale"
                      style={{ background: active ? '#00cc44' : '#111811', color: active ? '#000' : '#8fa88f', border: '1px solid ' + (active ? '#00cc44' : '#1e2e1e') }}>
                      {tag}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => updateMutation.mutate({ tags: activeTags })} disabled={updateMutation.isPending || done}
                className="w-full py-4 rounded-2xl text-[16px] font-bold press-scale"
                style={{ background: done ? '#00cc44' : '#00cc44', color: '#000' }}>
                {done ? <span className="flex items-center justify-center gap-2"><Check size={18} /> Saved!</span> : 'Save Tags'}
              </button>
            </div>
          )}
          {/* Bottom safe area — clears pill nav on mobile */}
          <div className="h-6 md:hidden flex-shrink-0" />
        </div>
      </div>
    </>
  );
}

// Missing import needed in sell form
function Minus({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function Plus({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className={className}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
