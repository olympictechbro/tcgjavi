import { useState } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchCards, addInventoryItem, type Card } from '../../lib/api';
import { cn } from '../../lib/cn';

interface AddCardSheetProps {
  open: boolean;
  onClose: () => void;
}

const CONDITIONS = [
  { value: 'NEAR_MINT', label: 'Near Mint' },
  { value: 'LIGHTLY_PLAYED', label: 'Lightly Played' },
  { value: 'MODERATELY_PLAYED', label: 'Mod. Played' },
  { value: 'HEAVILY_PLAYED', label: 'Heavily Played' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'GRADED_PSA_10', label: 'PSA 10' },
  { value: 'GRADED_PSA_9', label: 'PSA 9' },
  { value: 'GRADED_BGS_10', label: 'BGS 10' },
];

export function AddCardSheet({ open, onClose }: AddCardSheetProps) {
  const qc = useQueryClient();
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Card | null>(null);
  const [form, setForm] = useState({
    quantity: 1,
    condition: 'NEAR_MINT',
    costBasis: '',
    notes: '',
    tags: [] as string[],
  });
  const [done, setDone] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ['search-sheet', query],
    queryFn: () => searchCards({ q: query, limit: 12 }),
    enabled: query.length > 1,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addInventoryItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setDone(true);
      setTimeout(() => { onClose(); reset(); }, 1200);
    },
  });

  function reset() {
    setStep('search'); setQuery(''); setSelected(null);
    setForm({ quantity: 1, condition: 'NEAR_MINT', costBasis: '', notes: '', tags: [] });
    setDone(false);
  }

  function handleAdd() {
    if (!selected || !form.costBasis) return;
    mutate({
      cardId: selected.id,
      quantity: form.quantity,
      condition: form.condition,
      costBasis: parseFloat(form.costBasis),
      acquiredAt: new Date().toISOString(),
      notes: form.notes || undefined,
      tags: form.tags,
    });
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={() => { onClose(); reset(); }}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sheet-enter max-w-lg mx-auto">
        <div className="rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col" style={{ background: '#111811', border: '1px solid #1e2e1e', borderBottom: 'none' }}>
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: '#2a3d2a' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
            <h2 className="text-[18px] font-bold text-[#e8f5e8]">Add to Collection</h2>
            <button
              onClick={() => { onClose(); reset(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
              style={{ background: '#1c261c' }}
            >
              <X size={15} strokeWidth={2.5} className="text-[#8fa88f]" />
            </button>
          </div>

          {step === 'search' ? (
            <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
              {/* Search bar */}
              <div className="px-4 pb-3 flex-shrink-0">
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                  style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}
                >
                  <Search size={15} className="text-[#4a5e4a] flex-shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search Pokémon cards..."
                    className="flex-1 text-[14px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]"
                  />
                  {isFetching && (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00cc44] border-t-transparent animate-spin" />
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {data?.data.map(card => (
                  <button
                    key={card.id}
                    onClick={() => { setSelected(card); setStep('details'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl press-scale"
                    style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}
                  >
                    {card.imageSmall && (
                      <img src={card.imageSmall} alt={card.name} className="w-11 h-[58px] object-contain flex-shrink-0" />
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[13px] font-semibold text-[#e8f5e8] truncate">{card.name}</p>
                      <p className="text-[11px] text-[#4a5e4a] truncate">{card.set?.name} · #{card.number}</p>
                      <p className="text-[10px] text-[#4a5e4a]">{card.rarity}</p>
                    </div>
                    {card.prices?.[0]?.marketPrice != null && (
                      <span className="text-[13px] font-bold flex-shrink-0" style={{ color: '#00cc44' }}>
                        ${card.prices[0].marketPrice.toFixed(2)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
              {/* Selected card preview */}
              {selected && (
                <div
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}
                >
                  {selected.imageSmall && (
                    <img src={selected.imageSmall} alt={selected.name} className="w-11 h-[58px] object-contain" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#e8f5e8] truncate">{selected.name}</p>
                    <p className="text-[11px] text-[#4a5e4a]">{selected.set?.name} · #{selected.number}</p>
                  </div>
                  <button
                    onClick={() => setStep('search')}
                    className="text-[#00cc44] text-[12px] font-medium press-scale flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Condition */}
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
                <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest px-4 pt-3 pb-2">Condition</p>
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {CONDITIONS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setForm(f => ({ ...f, condition: c.value }))}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-xl press-scale transition-all"
                      style={{
                        background: form.condition === c.value ? '#00cc44' : '#111811',
                        color: form.condition === c.value ? '#000' : '#8fa88f',
                        border: '1px solid ' + (form.condition === c.value ? '#00cc44' : '#1e2e1e'),
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & cost */}
              <div className="rounded-2xl divide-y overflow-hidden" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e', borderColor: '#1e2e1e' }}>
                <div className="flex items-center px-4 py-3">
                  <span className="text-[14px] flex-1 text-[#e8f5e8]">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[16px] font-semibold press-scale"
                      style={{ background: '#1c261c', color: '#8fa88f' }}
                    >−</button>
                    <span className="text-[14px] font-semibold w-5 text-center text-[#e8f5e8]">{form.quantity}</span>
                    <button
                      onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))}
                      className="w-7 h-7 rounded-full flex items-center justify-center press-scale"
                      style={{ background: '#00cc44' }}
                    >
                      <Plus size={13} className="text-black" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center px-4 py-3" style={{ borderColor: '#1e2e1e' }}>
                  <span className="text-[14px] flex-1 text-[#e8f5e8]">Cost Paid / unit</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] text-[#4a5e4a]">$</span>
                    <input
                      type="number"
                      value={form.costBasis}
                      onChange={e => setForm(f => ({ ...f, costBasis: e.target.value }))}
                      placeholder="0.00"
                      className="text-[14px] font-semibold text-right w-24 outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}
              >
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes (optional)..."
                  className="w-full text-[14px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]"
                />
              </div>

              {/* Tags */}
              <div
                className="rounded-2xl p-3"
                style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}
              >
                <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {['flip', 'personal-collection', 'grading', 'trade-bait'].map(tag => {
                    const active = form.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => setForm(f => ({
                          ...f,
                          tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
                        }))}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-full press-scale transition-all"
                        style={{
                          background: active ? '#00cc4418' : 'transparent',
                          color: active ? '#00cc44' : '#4a5e4a',
                          border: '1px solid ' + (active ? '#00cc4440' : '#1e2e1e'),
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                disabled={!form.costBasis || isPending || done}
                className={cn('w-full py-4 rounded-2xl text-[16px] font-semibold transition-all press-scale')}
                style={{
                  background: done ? '#00cc44' : !form.costBasis || isPending ? '#1c261c' : '#00cc44',
                  color: done ? '#000' : !form.costBasis || isPending ? '#4a5e4a' : '#000',
                  opacity: isPending && !done ? 0.7 : 1,
                }}
              >
                {done ? (
                  <span className="flex items-center justify-center gap-2"><Check size={17} /> Added!</span>
                ) : isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[#4a5e4a] border-t-transparent animate-spin" />
                    Adding...
                  </div>
                ) : (
                  `Add ${form.quantity > 1 ? `${form.quantity}× ` : ''}to Collection`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
