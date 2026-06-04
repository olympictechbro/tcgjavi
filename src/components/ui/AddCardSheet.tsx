import { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Minus, Check, ChevronRight, Package, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchCards, addInventoryItem, type Card } from '../../lib/api';
import { cn } from '../../lib/cn';

interface AddCardSheetProps {
  open: boolean;
  onClose: () => void;
  initialCard?: Card;
}

// ── Condition config ───────────────────────────────────────────────────────────
const RAW_CONDITIONS = [
  { value: 'NEAR_MINT',         label: 'NM',  full: 'Near Mint' },
  { value: 'LIGHTLY_PLAYED',    label: 'LP',  full: 'Lightly Played' },
  { value: 'MODERATELY_PLAYED', label: 'MP',  full: 'Mod. Played' },
  { value: 'HEAVILY_PLAYED',    label: 'HP',  full: 'Heavily Played' },
  { value: 'DAMAGED',           label: 'DMG', full: 'Damaged' },
];

const GRADING_COMPANIES = ['PSA', 'BGS', 'CGC', 'SGC'];

const GRADES_BY_COMPANY: Record<string, { label: string; value: string }[]> = {
  PSA: [
    { label: '10 Gem Mint', value: '10' },
    { label: '9 Mint',      value: '9' },
    { label: '8 NM-MT',     value: '8' },
    { label: '7 NM',        value: '7' },
  ],
  BGS: [
    { label: '10 Pristine', value: '10' },
    { label: '9.5 Gem Mint',value: '9.5' },
    { label: '9 Mint',      value: '9' },
  ],
  CGC: [
    { label: '10 Gem Mint', value: '10' },
    { label: '9 Mint',      value: '9' },
  ],
  SGC: [
    { label: '10',          value: '10' },
    { label: '9',           value: '9' },
    { label: '8',           value: '8' },
    { label: '7',           value: '7' },
  ],
};

function conditionValue(isGraded: boolean, gradingCo: string, grade: string, rawCond: string): string {
  if (!isGraded) return rawCond;
  // Map to enum: GRADED_PSA_10, GRADED_BGS_95, GRADED_CGC_9, etc.
  const gradeStr = grade.replace('.', ''); // 9.5 → 95
  return `GRADED_${gradingCo}_${gradeStr}`;
}

const TAGS = ['flip', 'personal-collection', 'grading', 'trade-bait'];

interface LotCard { card: Card; quantity: number; }

// ── Condition selector component ───────────────────────────────────────────────
function ConditionSelector({
  isGraded, setIsGraded,
  gradingCo, setGradingCo,
  grade, setGrade,
  rawCond, setRawCond,
}: {
  isGraded: boolean; setIsGraded: (v: boolean) => void;
  gradingCo: string; setGradingCo: (v: string) => void;
  grade: string; setGrade: (v: string) => void;
  rawCond: string; setRawCond: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Raw / Graded toggle */}
      <div>
        <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2 px-1">Card type</p>
        <div className="flex rounded-xl overflow-hidden w-fit" style={{ border: '1px solid #1e2e1e' }}>
          <button onClick={() => setIsGraded(false)} className="px-5 py-2.5 press-scale"
            style={{ background: !isGraded ? '#00cc44' : '#0a0e0a', color: !isGraded ? '#000' : '#4a5e4a' }}>
            <span className="text-[13px] font-bold">Raw</span>
          </button>
          <button onClick={() => setIsGraded(true)} className="px-5 py-2.5 press-scale"
            style={{ background: isGraded ? '#00cc44' : '#0a0e0a', color: isGraded ? '#000' : '#4a5e4a' }}>
            <span className="text-[13px] font-bold">Graded</span>
          </button>
        </div>
      </div>

      {!isGraded ? (
        /* Raw condition pills */
        <div>
          <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2 px-1">Condition</p>
          <div className="flex flex-wrap gap-2">
            {RAW_CONDITIONS.map(c => (
              <button key={c.value} onClick={() => setRawCond(c.value)}
                className="flex flex-col items-center px-4 py-2.5 rounded-xl press-scale min-w-[52px]"
                style={{ background: rawCond === c.value ? '#00cc44' : '#111811', color: rawCond === c.value ? '#000' : '#8fa88f', border: '1px solid ' + (rawCond === c.value ? '#00cc44' : '#1e2e1e') }}>
                <span className="text-[12px] font-bold">{c.label}</span>
                <span className="text-[9px] mt-0.5 opacity-70">{c.full}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Graded: company + grade */
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2 px-1">Grading company</p>
            <div className="flex gap-2">
              {GRADING_COMPANIES.map(co => (
                <button key={co} onClick={() => { setGradingCo(co); setGrade(GRADES_BY_COMPANY[co][0].value); }}
                  className="px-4 py-2.5 rounded-xl press-scale text-[13px] font-bold"
                  style={{ background: gradingCo === co ? '#00cc44' : '#111811', color: gradingCo === co ? '#000' : '#8fa88f', border: '1px solid ' + (gradingCo === co ? '#00cc44' : '#1e2e1e') }}>
                  {co}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2 px-1">Grade</p>
            <div className="flex flex-wrap gap-2">
              {(GRADES_BY_COMPANY[gradingCo] ?? []).map(g => (
                <button key={g.value} onClick={() => setGrade(g.value)}
                  className="px-4 py-2.5 rounded-xl press-scale"
                  style={{ background: grade === g.value ? '#00cc44' : '#111811', color: grade === g.value ? '#000' : '#8fa88f', border: '1px solid ' + (grade === g.value ? '#00cc44' : '#1e2e1e'), minWidth: '72px' }}>
                  <span className="text-[12px] font-bold">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Single card add ────────────────────────────────────────────────────────────
function SingleMode({ onDone, initialCard }: { onDone: () => void; initialCard?: Card }) {
  const qc = useQueryClient();
  const [step, setStep] = useState<'search' | 'details'>(initialCard ? 'details' : 'search');
  const [selected, setSelected] = useState<Card | null>(initialCard ?? null);

  // Debounced search — avoids refetching on every keystroke
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (val: string) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  };

  // Condition state
  const [isGraded, setIsGraded] = useState(false);
  const [gradingCo, setGradingCo] = useState('PSA');
  const [grade, setGrade] = useState('10');
  const [rawCond, setRawCond] = useState('NEAR_MINT');

  const [quantity, setQuantity] = useState(1);
  const [costBasis, setCostBasis] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const condition = conditionValue(isGraded, gradingCo, grade, rawCond);

  const { data, isFetching } = useQuery({
    queryKey: ['sheet-search', debouncedQuery],
    queryFn: () => searchCards({ q: debouncedQuery, limit: 12 }),
    enabled: debouncedQuery.length > 1,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addInventoryItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setDone(true);
      setTimeout(() => { onDone(); resetForm(); }, 900);
    },
  });

  function resetForm() {
    setStep('search'); setInputValue(''); setDebouncedQuery(''); setSelected(null);
    setQuantity(1); setCostBasis(''); setNotes(''); setTags([]); setDone(false);
    setIsGraded(false); setGradingCo('PSA'); setGrade('10'); setRawCond('NEAR_MINT');
  }

  // Reset when a new initialCard is provided
  useEffect(() => {
    if (initialCard) {
      setSelected(initialCard);
      setStep('details');
    }
  }, [initialCard]);

  if (step === 'search') {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
            style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
            <Search size={15} className="text-[#4a5e4a] flex-shrink-0" />
            <input
              autoFocus
              value={inputValue}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search Pokémon cards..."
              className="flex-1 text-[15px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]"
            />
            {isFetching && <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00cc44] border-t-transparent animate-spin flex-shrink-0" />}
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
          {debouncedQuery.length > 1 && !isFetching && !data?.data.length && (
            <p className="text-center text-[13px] text-[#4a5e4a] py-8">No cards found</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
      {/* Selected card preview */}
      {selected && (
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
          {selected.imageSmall && <img src={selected.imageSmall} alt={selected.name} className="w-10 h-14 object-contain flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#e8f5e8] truncate">{selected.name}</p>
            <p className="text-[11px] text-[#4a5e4a]">{selected.set?.name} · #{selected.number}</p>
          </div>
          <button onClick={() => { setSelected(null); setStep('search'); }} className="text-[#00cc44] text-[12px] font-semibold press-scale flex-shrink-0">Change</button>
        </div>
      )}

      {/* Condition / Graded selector */}
      <ConditionSelector
        isGraded={isGraded} setIsGraded={setIsGraded}
        gradingCo={gradingCo} setGradingCo={setGradingCo}
        grade={grade} setGrade={setGrade}
        rawCond={rawCond} setRawCond={setRawCond}
      />

      {/* Quantity + Cost */}
      <div className="rounded-2xl overflow-hidden divide-y" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e', borderColor: '#1e2e1e' }}>
        <div className="flex items-center px-4 py-3.5">
          <span className="text-[14px] flex-1 text-[#e8f5e8]">Quantity</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
              style={{ background: '#1c261c', color: '#8fa88f' }}>
              <Minus size={14} />
            </button>
            <span className="text-[16px] font-bold w-6 text-center text-[#e8f5e8]">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
              style={{ background: '#00cc44' }}>
              <Plus size={14} className="text-black" />
            </button>
          </div>
        </div>
        <div className="flex items-center px-4 py-3.5" style={{ borderColor: '#1e2e1e' }}>
          <div className="flex-1">
            <p className="text-[14px] text-[#e8f5e8]">Cost paid <span className="text-[12px] text-[#4a5e4a]">/ unit</span></p>
            {quantity > 1 && costBasis && (
              <p className="text-[11px] text-[#4a5e4a]">Total ${(parseFloat(costBasis) * quantity).toFixed(2)}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[15px] text-[#4a5e4a]">$</span>
            <input type="number" value={costBasis} onChange={e => setCostBasis(e.target.value)}
              placeholder="0.00"
              className="text-[16px] font-bold text-right w-24 outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-2xl px-4 py-3" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
        <input value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)..."
          className="w-full text-[14px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
      </div>

      {/* Tags */}
      <div>
        <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2 px-1">Tags</p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => {
            const active = tags.includes(tag);
            return (
              <button key={tag} onClick={() => setTags(t => active ? t.filter(x => x !== tag) : [...t, tag])}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full press-scale"
                style={{ background: active ? '#00cc4415' : 'transparent', color: active ? '#00cc44' : '#4a5e4a', border: '1px solid ' + (active ? '#00cc4440' : '#1e2e1e') }}>
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={() => selected && costBasis && mutate({
          cardId: selected.id, quantity, condition,
          costBasis: parseFloat(costBasis),
          acquiredAt: new Date().toISOString(),
          notes: notes || undefined, tags,
        })}
        disabled={!selected || !costBasis || isPending || done}
        className="w-full py-4 rounded-2xl text-[16px] font-bold press-scale"
        style={{
          background: done ? '#00cc44' : (!selected || !costBasis) ? '#1c261c' : '#00cc44',
          color: done ? '#000' : (!selected || !costBasis) ? '#4a5e4a' : '#000',
        }}>
        {done
          ? <span className="flex items-center justify-center gap-2"><Check size={18} /> Added!</span>
          : isPending
            ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />Adding...</span>
            : `Add ${quantity > 1 ? `${quantity}× ` : ''}to Collection`
        }
      </button>
    </div>
  );
}

// ── Bulk lot add ───────────────────────────────────────────────────────────────
function BulkMode({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lotCards, setLotCards] = useState<LotCard[]>([]);
  const [totalLotPrice, setTotalLotPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleInput = (val: string) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  };

  const { data, isFetching } = useQuery({
    queryKey: ['sheet-bulk', debouncedQuery],
    queryFn: () => searchCards({ q: debouncedQuery, limit: 8 }),
    enabled: debouncedQuery.length > 1,
  });

  const totalCards = lotCards.reduce((s, c) => s + c.quantity, 0);
  const pricePerCard = totalCards > 0 && totalLotPrice ? parseFloat(totalLotPrice) / totalCards : 0;

  function addToLot(card: Card) {
    setLotCards(prev => {
      const existing = prev.find(c => c.card.id === card.id);
      if (existing) return prev.map(c => c.card.id === card.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { card, quantity: 1 }];
    });
    setInputValue(''); setDebouncedQuery('');
  }

  async function submitLot() {
    if (!lotCards.length || !totalLotPrice) return;
    setSubmitting(true);
    try {
      for (const item of lotCards) {
        await addInventoryItem({
          cardId: item.card.id, quantity: item.quantity,
          condition: 'NEAR_MINT', costBasis: pricePerCard,
          acquiredAt: new Date().toISOString(), tags: ['flip'],
        });
      }
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setDone(true);
      setTimeout(() => onDone(), 900);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2">Add cards to lot</p>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
          <Search size={14} className="text-[#4a5e4a] flex-shrink-0" />
          <input value={inputValue} onChange={e => handleInput(e.target.value)} autoFocus
            placeholder="Search and add cards..."
            className="flex-1 text-[14px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
          {isFetching && <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00cc44] border-t-transparent animate-spin" />}
        </div>
        {debouncedQuery.length > 1 && data?.data && (
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

      {lotCards.length > 0 && (
        <>
          <div>
            <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest mb-2">Lot · {totalCards} card{totalCards !== 1 ? 's' : ''}</p>
            <div className="space-y-1.5">
              {lotCards.map(item => (
                <div key={item.card.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
                  {item.card.imageSmall && <img src={item.card.imageSmall} alt="" className="w-8 h-11 object-contain flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#e8f5e8] truncate">{item.card.name}</p>
                    <p className="text-[10px] text-[#4a5e4a]">{item.card.set?.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
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
                  <button onClick={() => setLotCards(p => p.filter(c => c.card.id !== item.card.id))} className="press-scale">
                    <Trash2 size={13} className="text-[#4a5e4a]" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center px-4 py-4 rounded-2xl" style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#e8f5e8]">Total lot price</p>
              {pricePerCard > 0 && <p className="text-[11px] text-[#4a5e4a]">${pricePerCard.toFixed(2)} / card</p>}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[15px] text-[#4a5e4a]">$</span>
              <input type="number" value={totalLotPrice} onChange={e => setTotalLotPrice(e.target.value)}
                placeholder="0.00"
                className="text-[16px] font-bold text-right w-28 outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]" />
            </div>
          </div>

          <button onClick={submitLot} disabled={!totalLotPrice || submitting || done}
            className="w-full py-4 rounded-2xl text-[16px] font-bold press-scale"
            style={{ background: done ? '#00cc44' : !totalLotPrice ? '#1c261c' : '#00cc44', color: done ? '#000' : !totalLotPrice ? '#4a5e4a' : '#000' }}>
            {done
              ? <span className="flex items-center justify-center gap-2"><Check size={18} /> Added!</span>
              : submitting
                ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />Adding...</span>
                : `Add ${totalCards} cards · $${totalLotPrice || '0'}`
            }
          </button>
        </>
      )}
    </div>
  );
}

// ── Sheet wrapper ──────────────────────────────────────────────────────────────
export function AddCardSheet({ open, onClose, initialCard }: AddCardSheetProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Reset mode when sheet closes
  useEffect(() => {
    if (!open) setTimeout(() => setMode('single'), 300);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose} />

      <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full md:max-w-lg flex flex-col rounded-t-3xl md:rounded-3xl sheet-enter md:modal-enter"
          style={{ background: '#111811', border: '1px solid #1e2e1e', borderBottom: 'none', maxHeight: 'min(92vh, 780px)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0 md:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: '#2a3d2a' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
            <div>
              <h2 className="text-[18px] font-bold text-[#e8f5e8]">Add to Collection</h2>
              <p className="text-[11px] text-[#4a5e4a] mt-0.5">
                {mode === 'single' ? 'Single card' : 'Bulk lot purchase'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #1e2e1e' }}>
                <button onClick={() => setMode('single')} className="px-3 py-1.5 press-scale"
                  style={{ background: mode === 'single' ? '#1e2e1e' : 'transparent', color: mode === 'single' ? '#e8f5e8' : '#4a5e4a' }}>
                  <span className="text-[12px] font-semibold">Single</span>
                </button>
                <button onClick={() => setMode('bulk')} className="px-3 py-1.5 press-scale flex items-center gap-1.5"
                  style={{ background: mode === 'bulk' ? '#1e2e1e' : 'transparent', color: mode === 'bulk' ? '#e8f5e8' : '#4a5e4a' }}>
                  <Package size={12} />
                  <span className="text-[12px] font-semibold">Lot</span>
                </button>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center press-scale"
                style={{ background: '#1c261c' }}>
                <X size={15} className="text-[#8fa88f]" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {mode === 'single'
              ? <SingleMode onDone={onClose} initialCard={initialCard} />
              : <BulkMode onDone={onClose} />
            }
            <div className="h-6 md:hidden" />
          </div>
        </div>
      </div>
    </>
  );
}
