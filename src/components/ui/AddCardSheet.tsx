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
  { value: 'MODERATELY_PLAYED', label: 'Moderately Played' },
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
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => { onClose(); reset(); }} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sheet-enter max-w-lg mx-auto">
        <div className="bg-[#F2F2F7] rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-[#C7C7CC] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
            <h2 className="text-[20px] font-bold">Add to Collection</h2>
            <button onClick={() => { onClose(); reset(); }}
              className="w-8 h-8 rounded-full bg-[#E5E5EA] flex items-center justify-center press-scale">
              <X size={16} strokeWidth={2.5} className="text-[#3C3C43]" />
            </button>
          </div>

          {step === 'search' ? (
            <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
              {/* Search bar */}
              <div className="px-4 pb-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 shadow-sm">
                  <Search size={16} className="text-[#8E8E93] flex-shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search Pokémon cards..."
                    className="flex-1 text-[15px] outline-none bg-transparent placeholder:text-[#C7C7CC]"
                  />
                  {isFetching && (
                    <div className="w-4 h-4 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin" />
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {data?.data.map(card => (
                  <button
                    key={card.id}
                    onClick={() => { setSelected(card); setStep('details'); }}
                    className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 press-scale shadow-sm"
                  >
                    {card.imageSmall && (
                      <img src={card.imageSmall} alt={card.name} className="w-12 h-16 object-contain flex-shrink-0" />
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[14px] font-semibold text-[#1C1C1E] truncate">{card.name}</p>
                      <p className="text-[12px] text-[#8E8E93] truncate">{card.set?.name} · #{card.number}</p>
                      <p className="text-[11px] text-[#8E8E93]">{card.rarity}</p>
                    </div>
                    {card.prices?.[0]?.marketPrice != null && (
                      <span className="text-[14px] font-bold text-[#1C1C1E] flex-shrink-0">
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
                <div className="flex items-center gap-3 bg-white rounded-2xl p-3">
                  {selected.imageSmall && (
                    <img src={selected.imageSmall} alt={selected.name} className="w-12 h-16 object-contain" />
                  )}
                  <div>
                    <p className="text-[15px] font-semibold">{selected.name}</p>
                    <p className="text-[12px] text-[#8E8E93]">{selected.set?.name} · #{selected.number}</p>
                  </div>
                  <button onClick={() => setStep('search')} className="ml-auto text-[#007AFF] text-[13px] font-medium press-scale">
                    Change
                  </button>
                </div>
              )}

              {/* Condition */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide px-4 pt-3 pb-1">Condition</p>
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {CONDITIONS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setForm(f => ({ ...f, condition: c.value }))}
                      className={cn(
                        'text-[12px] font-medium px-3 py-1.5 rounded-xl border transition-all press-scale',
                        form.condition === c.value
                          ? 'bg-[#007AFF] text-white border-[#007AFF]'
                          : 'bg-[#F2F2F7] text-[#1C1C1E] border-transparent'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & cost */}
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-[#F2F2F7]">
                <div className="flex items-center px-4 py-3">
                  <span className="text-[15px] flex-1">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                      className="w-7 h-7 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[18px] font-semibold press-scale">−</button>
                    <span className="text-[15px] font-semibold w-5 text-center">{form.quantity}</span>
                    <button onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))}
                      className="w-7 h-7 rounded-full bg-[#007AFF] flex items-center justify-center press-scale">
                      <Plus size={14} className="text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center px-4 py-3">
                  <span className="text-[15px] flex-1">Cost Paid / unit</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[15px] text-[#8E8E93]">$</span>
                    <input
                      type="number"
                      value={form.costBasis}
                      onChange={e => setForm(f => ({ ...f, costBasis: e.target.value }))}
                      placeholder="0.00"
                      className="text-[15px] font-semibold text-right w-24 outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes (optional)..."
                  className="w-full text-[15px] outline-none bg-transparent placeholder:text-[#C7C7CC]"
                />
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl p-3 shadow-sm">
                <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {['flip', 'personal-collection', 'grading', 'trade-bait'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setForm(f => ({
                        ...f,
                        tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
                      }))}
                      className={cn(
                        'text-[11px] font-medium px-2.5 py-1 rounded-full border press-scale',
                        form.tags.includes(tag)
                          ? 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/30'
                          : 'bg-[#F2F2F7] text-[#8E8E93] border-transparent'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                disabled={!form.costBasis || isPending || done}
                className={cn(
                  'w-full py-4 rounded-2xl text-[17px] font-semibold transition-all press-scale',
                  done
                    ? 'bg-[#34C759] text-white'
                    : 'bg-[#007AFF] text-white disabled:opacity-40'
                )}
              >
                {done ? (
                  <span className="flex items-center justify-center gap-2"><Check size={18} /> Added!</span>
                ) : isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
