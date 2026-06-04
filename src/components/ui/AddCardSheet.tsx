import { useState } from 'react';
import { X, Search, Plus, Minus, Check, ChevronRight, Package, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchCards, addInventoryItem, type Card } from '../../lib/api';
import { cn } from '../../lib/cn';

interface AddCardSheetProps {
  open: boolean;
  onClose: () => void;
}

const CONDITIONS = [
  { value: 'NEAR_MINT',         label: 'NM',    full: 'Near Mint' },
  { value: 'LIGHTLY_PLAYED',    label: 'LP',    full: 'Lightly Played' },
  { value: 'MODERATELY_PLAYED', label: 'MP',    full: 'Mod. Played' },
  { value: 'HEAVILY_PLAYED',    label: 'HP',    full: 'Heavily Played' },
  { value: 'DAMAGED',           label: 'DMG',   full: 'Damaged' },
  { value: 'GRADED_PSA_10',     label: 'PSA10', full: 'PSA 10' },
  { value: 'GRADED_PSA_9',      label: 'PSA 9', full: 'PSA 9' },
  { value: 'GRADED_BGS_10',     label: 'BGS10', full: 'BGS 10' },
];

const TAGS = ['flip', 'personal-collection', 'grading', 'trade-bait'];

interface LotCard {
  card: Card;
  quantity: number;
  condition: string;
  costBasis: string; // per-unit override
}

// ── Single card add ────────────────────────────────────────────────────────────
function SingleMode({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Card | null>(null);
  const [form, setForm] = useState({ quantity: 1, condition: 'NEAR_MINT', costBasis: '', notes: '', tags: [] as string[] });
  const [done, setDone] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ['sheet-search', query],
    queryFn: () => searchCards({ q: query, limit: 12 }),
    enabled: query.length > 1,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addInventoryItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setDone(true);
      setTimeout(() => { onDone(); resetForm(); }, 1000);
    },
  });

  function resetForm() {
    setStep('search'); setQuery(''); setSelected(null);
    setForm({ quantity: 1, condition: 'NEAR_MINT', costBasis: '', notes: '', tags: [] });
    setDone(false);
  }

  if (step === 'search') {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        {/* Search input */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
            <Search size={15} className="text-[#4a5e4a] flex-shrink-0" />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search Pokémon cards..." className="flex-1 text-[15px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
            {isFetching && <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00cc44] border-t-transparent animate-spin" />}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {data?.data.map(card => (
            <button key={card.id} onClick={() => { setSelected(card); setStep('details'); }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl press-scale text-left"
              style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
              {card.imageSmall && <img src={card.imageSmall} alt={card.name} className="w-10 h-14 object-contain flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#e8f5e8] truncate">{card.name}</p>
                <p className="text-[11px] text-[#4a5e4a]">{card.set?.name} · #{card.number}</p>
                <p className="text-[10px] text-[#4a5e4a]">{card.rarity}</p>
              </div>
              {card.prices?.[0]?.marketPrice != null && (
                <span className="text-[13px] font-bold flex-shrink-0" style={{ color: '#00cc44' }}>
                  ${card.prices[0].marketPrice.toFixed(2)}
                </span>
              )}
              <ChevronRight size={14} className="text-[#4a5e4a] flex-shrink-0" />
            </button>
          ))}
          {query.length > 1 && !isFetching && !data?.data.length && (
            <p className="text-center text-[13px] text-[#4a5e4a] py-8">No cards found</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
      {/* Selected card */}
      {selected && (
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
          {selected.imageSmall && <img src={selected.imageSmall} alt={selected.name} className="w-10 h-14 object-contain flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#e8f5e8] truncate">{selected.name}</p>
            <p className="text-[11px] text-[#4a5e4a]">{selected.set?.name} · #{selected.number}</p>
          </div>
          <button onClick={() => setStep('search')} className="text-[#00cc44] text-[12px] font-semibold press-scale flex-shrink-0">Change</button>
        </div>
      )}

      {/* Condition */}
      <div>
        <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2 px-1">Condition</p>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(c => (
            <button key={c.value} onClick={() => setForm(f => ({ ...f, condition: c.value }))}
              className="flex flex-col items-center px-3 py-2 rounded-xl press-scale transition-all"
              style={{ background: form.condition === c.value ? '#00cc44' : '#111811', color: form.condition === c.value ? '#000' : '#8fa88f', border: '1px solid ' + (form.condition === c.value ? '#00cc44' : '#1e2e1e'), minWidth: '52px' }}>
              <span className="text-[11px] font-bold">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity + Cost */}
      <div className="rounded-2xl overflow-hidden divide-y" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e', borderColor: '#1e2e1e' }}>
        <div className="flex items-center px-4 py-3.5">
          <span className="text-[14px] flex-1 text-[#e8f5e8]">Quantity</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
              className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
              style={{ background: '#1c261c', color: '#8fa88f' }}>
              <Minus size={14} />
            </button>
            <span className="text-[16px] font-bold w-6 text-center text-[#e8f5e8]">{form.quantity}</span>
            <button onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))}
              className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
              style={{ background: '#00cc44' }}>
              <Plus size={14} className="text-black" />
            </button>
          </div>
        </div>
        <div className="flex items-center px-4 py-3.5" style={{ borderColor: '#1e2e1e' }}>
          <div className="flex-1">
            <p className="text-[14px] text-[#e8f5e8]">Cost paid <span className="text-[#4a5e4a] text-[12px]">/ unit</span></p>
            {form.quantity > 1 && form.costBasis && (
              <p className="text-[11px] text-[#4a5e4a]">Total: ${(parseFloat(form.costBasis) * form.quantity).toFixed(2)}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[15px] text-[#4a5e4a]">$</span>
            <input type="number" value={form.costBasis} onChange={e => setForm(f => ({ ...f, costBasis: e.target.value }))}
              placeholder="0.00" className="text-[15px] font-bold text-right w-24 outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-2xl px-4 py-3" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
        <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Notes (optional)..." className="w-full text-[14px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
      </div>

      {/* Tags */}
      <div>
        <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2 px-1">Tags</p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => {
            const active = form.tags.includes(tag);
            return (
              <button key={tag} onClick={() => setForm(f => ({ ...f, tags: active ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full press-scale"
                style={{ background: active ? '#00cc4415' : 'transparent', color: active ? '#00cc44' : '#4a5e4a', border: '1px solid ' + (active ? '#00cc4440' : '#1e2e1e') }}>
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button onClick={() => selected && form.costBasis && mutate({ cardId: selected.id, quantity: form.quantity, condition: form.condition, costBasis: parseFloat(form.costBasis), acquiredAt: new Date().toISOString(), notes: form.notes || undefined, tags: form.tags })}
        disabled={!selected || !form.costBasis || isPending || done}
        className="w-full py-4 rounded-2xl text-[16px] font-bold press-scale transition-all"
        style={{ background: done ? '#00cc44' : (!selected || !form.costBasis) ? '#1c261c' : '#00cc44', color: done ? '#000' : (!selected || !form.costBasis) ? '#4a5e4a' : '#000' }}>
        {done ? <span className="flex items-center justify-center gap-2"><Check size={18} /> Added!</span>
          : isPending ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />Adding...</span>
          : `Add ${form.quantity > 1 ? `${form.quantity}× ` : ''}to Collection`}
      </button>
    </div>
  );
}

// ── Bulk lot add ───────────────────────────────────────────────────────────────
function BulkMode({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [lotCards, setLotCards] = useState<LotCard[]>([]);
  const [totalLotPrice, setTotalLotPrice] = useState('');
  const [splitMode, setSplitMode] = useState<'even' | 'manual'>('even');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ['sheet-bulk', query],
    queryFn: () => searchCards({ q: query, limit: 8 }),
    enabled: query.length > 1,
  });

  const totalCards = lotCards.reduce((s, c) => s + c.quantity, 0);
  const pricePerCard = totalCards > 0 && totalLotPrice ? parseFloat(totalLotPrice) / totalCards : 0;

  function addToLot(card: Card) {
    setLotCards(prev => {
      const existing = prev.find(c => c.card.id === card.id);
      if (existing) return prev.map(c => c.card.id === card.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { card, quantity: 1, condition: 'NEAR_MINT', costBasis: '' }];
    });
    setQuery('');
  }

  async function submitLot() {
    if (!lotCards.length || !totalLotPrice) return;
    setSubmitting(true);
    try {
      for (const item of lotCards) {
        const cost = splitMode === 'even'
          ? pricePerCard
          : item.costBasis ? parseFloat(item.costBasis) : pricePerCard;

        await addInventoryItem({
          cardId: item.card.id,
          quantity: item.quantity,
          condition: item.condition,
          costBasis: cost,
          acquiredAt: new Date().toISOString(),
          tags: ['flip'],
        });
      }
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setDone(true);
      setTimeout(() => { onDone(); }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
      {/* Search to add cards */}
      <div>
        <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2">Add cards to lot</p>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
          <Search size={14} className="text-[#4a5e4a] flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
            placeholder="Search and add cards..." className="flex-1 text-[14px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
          {isFetching && <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00cc44] border-t-transparent animate-spin" />}
        </div>

        {/* Search results dropdown */}
        {query.length > 1 && data?.data && (
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
            {data.data.map(card => (
              <button key={card.id} onClick={() => addToLot(card)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl press-scale text-left"
                style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
                {card.imageSmall && <img src={card.imageSmall} alt="" className="w-8 h-11 object-contain flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#e8f5e8] truncate">{card.name}</p>
                  <p className="text-[10px] text-[#4a5e4a]">{card.set?.name}</p>
                </div>
                <Plus size={14} className="text-[#00cc44] flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lot contents */}
      {lotCards.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2">
            Lot · {totalCards} card{totalCards !== 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5">
            {lotCards.map(item => (
              <div key={item.card.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
                {item.card.imageSmall && <img src={item.card.imageSmall} alt="" className="w-8 h-11 object-contain flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#e8f5e8] truncate">{item.card.name}</p>
                  <p className="text-[10px] text-[#4a5e4a]">{item.card.set?.name}</p>
                </div>
                {/* Qty */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => setLotCards(p => p.map(c => c.card.id === item.card.id ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c))}
                    className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#1c261c', color: '#8fa88f' }}>
                    <Minus size={10} />
                  </button>
                  <span className="text-[12px] font-bold text-[#e8f5e8] w-4 text-center">{item.quantity}</span>
                  <button onClick={() => setLotCards(p => p.map(c => c.card.id === item.card.id ? { ...c, quantity: c.quantity + 1 } : c))}
                    className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#1c261c', color: '#8fa88f' }}>
                    <Plus size={10} />
                  </button>
                </div>
                <button onClick={() => setLotCards(p => p.filter(c => c.card.id !== item.card.id))}
                  className="press-scale flex-shrink-0">
                  <Trash2 size={13} className="text-[#4a5e4a]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total lot price */}
      {lotCards.length > 0 && (
        <div className="rounded-2xl overflow-hidden divide-y" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e', borderColor: '#1e2e1e' }}>
          <div className="flex items-center px-4 py-3.5">
            <div className="flex-1">
              <p className="text-[14px] text-[#e8f5e8] font-semibold">Total lot price</p>
              {pricePerCard > 0 && <p className="text-[11px] text-[#4a5e4a]">${pricePerCard.toFixed(2)}/card</p>}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[15px] text-[#4a5e4a]">$</span>
              <input type="number" value={totalLotPrice} onChange={e => setTotalLotPrice(e.target.value)}
                placeholder="0.00" className="text-[16px] font-bold text-right w-28 outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
            </div>
          </div>

          {/* Split mode */}
          <div className="flex items-center px-4 py-3" style={{ borderColor: '#1e2e1e' }}>
            <span className="text-[13px] text-[#8fa88f] flex-1">Split evenly</span>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #1e2e1e' }}>
              <button onClick={() => setSplitMode('even')} className="px-3 py-1.5 text-[11px] font-semibold press-scale"
                style={{ background: splitMode === 'even' ? '#00cc44' : 'transparent', color: splitMode === 'even' ? '#000' : '#4a5e4a' }}>Even</button>
              <button onClick={() => setSplitMode('manual')} className="px-3 py-1.5 text-[11px] font-semibold press-scale"
                style={{ background: splitMode === 'manual' ? '#00cc44' : 'transparent', color: splitMode === 'manual' ? '#000' : '#4a5e4a' }}>Manual</button>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      {lotCards.length > 0 && (
        <button onClick={submitLot} disabled={!totalLotPrice || submitting || done}
          className="w-full py-4 rounded-2xl text-[16px] font-bold press-scale"
          style={{ background: done ? '#00cc44' : !totalLotPrice ? '#1c261c' : '#00cc44', color: done ? '#000' : !totalLotPrice ? '#4a5e4a' : '#000' }}>
          {done ? <span className="flex items-center justify-center gap-2"><Check size={18} /> Added!</span>
            : submitting ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />Adding...</span>
            : `Add ${totalCards} cards · $${totalLotPrice || '0'}`}
        </button>
      )}
    </div>
  );
}

// ── Sheet wrapper ──────────────────────────────────────────────────────────────
export function AddCardSheet({ open, onClose }: AddCardSheetProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  function handleDone() { onClose(); setMode('single'); }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={handleDone} />

      <div className="fixed bottom-0 left-0 right-0 z-50 sheet-enter max-w-lg mx-auto">
        <div className="rounded-t-3xl flex flex-col max-h-[92vh]"
          style={{ background: '#111811', border: '1px solid #1e2e1e', borderBottom: 'none' }}>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: '#2a3d2a' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0">
            <div>
              <h2 className="text-[18px] font-bold text-[#e8f5e8]">Add to Collection</h2>
              <p className="text-[11px] text-[#4a5e4a] mt-0.5">
                {mode === 'single' ? 'Single card' : 'Bulk lot purchase'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode toggle */}
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #1e2e1e' }}>
                <button onClick={() => setMode('single')} className="px-3 py-1.5 press-scale flex items-center gap-1.5"
                  style={{ background: mode === 'single' ? '#1e2e1e' : 'transparent', color: mode === 'single' ? '#e8f5e8' : '#4a5e4a' }}>
                  <span className="text-[12px] font-semibold">Single</span>
                </button>
                <button onClick={() => setMode('bulk')} className="px-3 py-1.5 press-scale flex items-center gap-1.5"
                  style={{ background: mode === 'bulk' ? '#1e2e1e' : 'transparent', color: mode === 'bulk' ? '#e8f5e8' : '#4a5e4a' }}>
                  <Package size={12} />
                  <span className="text-[12px] font-semibold">Lot</span>
                </button>
              </div>
              <button onClick={handleDone} className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
                style={{ background: '#1c261c' }}>
                <X size={15} className="text-[#8fa88f]" />
              </button>
            </div>
          </div>

          {mode === 'single' ? <SingleMode onDone={handleDone} /> : <BulkMode onDone={handleDone} />}
        </div>
      </div>
    </>
  );
}
