import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { Set } from '../../lib/api';

// ── Generic dropdown wrapper ───────────────────────────────────────────────────
export function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return { open, setOpen, ref };
}

function DropdownButton({ label, active, onClick, badge }: {
  label: string; active?: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl press-scale text-[13px] font-semibold whitespace-nowrap"
      style={{
        background: active ? '#00cc4420' : '#111811',
        color: active ? '#00cc44' : '#8fa88f',
        border: '1px solid ' + (active ? '#00cc4440' : '#1e2e1e'),
      }}
    >
      {label}
      {badge ? (
        <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: '#00cc44', color: '#000' }}>{badge}</span>
      ) : (
        <ChevronDown size={13} className={cn('transition-transform', active ? 'rotate-180' : '')} />
      )}
    </button>
  );
}

// ── Sort + Type dropdown ───────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { group: 'Price',     value: 'price_desc',   label: 'Price: High → Low' },
  { group: 'Price',     value: 'price_asc',    label: 'Price: Low → High' },
  { group: 'Trending',  value: 'change_desc',  label: '% Change: Biggest Movers' },
  { group: 'Name',      value: 'name_asc',     label: 'Name: A → Z' },
  { group: 'Name',      value: 'name_desc',    label: 'Name: Z → A' },
  { group: 'Number',    value: 'number_asc',   label: 'Card Number' },
  { group: 'Release',   value: 'release_desc', label: 'Newest Sets First' },
];

export const TYPE_OPTIONS = [
  { value: 'all',    label: 'All Types' },
  { value: 'single', label: 'Singles only' },
  { value: 'sealed', label: 'Sealed products' },
];

interface SortDropdownProps {
  sort: string;
  onSortChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
}

export function SortDropdown({ sort, onSortChange, typeFilter, onTypeChange, language, onLanguageChange }: SortDropdownProps) {
  const { open, setOpen, ref } = useDropdown();
  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Sort';
  const hasFilters = sort !== 'name_asc' || typeFilter !== 'all' || language !== 'All';

  return (
    <div ref={ref} className="relative">
      <DropdownButton
        label={hasFilters ? sortLabel.split(':')[0].split(' ')[0] + (typeFilter !== 'all' || language !== 'All' ? ' +' : '') : 'Sort & Filter'}
        active={open || hasFilters}
        onClick={() => setOpen(v => !v)}
        badge={[sort !== 'name_asc', typeFilter !== 'all', language !== 'All'].filter(Boolean).length || undefined}
      />

      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-2xl shadow-2xl z-[70] overflow-hidden"
          style={{ background: '#111811', border: '1px solid #1e2e1e', minWidth: '220px' }}
        >
          {/* Sort */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-bold text-[#4a5e4a] uppercase tracking-widest mb-1.5">Sort by</p>
            {SORT_OPTIONS.map(o => (
              <button key={o.value} onClick={() => { onSortChange(o.value); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl press-scale text-left"
                style={{ background: sort === o.value ? '#00cc4415' : 'transparent' }}>
                <span className="text-[13px]" style={{ color: sort === o.value ? '#00cc44' : '#e8f5e8' }}>{o.label}</span>
                {sort === o.value && <Check size={13} className="text-[#00cc44]" />}
              </button>
            ))}
          </div>

          <div className="mx-3 my-1" style={{ height: '1px', background: '#1e2e1e' }} />

          {/* Type */}
          <div className="px-3 pb-1">
            <p className="text-[10px] font-bold text-[#4a5e4a] uppercase tracking-widest mb-1.5">Type</p>
            {TYPE_OPTIONS.map(o => (
              <button key={o.value} onClick={() => onTypeChange(o.value)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl press-scale text-left"
                style={{ background: typeFilter === o.value ? '#00cc4415' : 'transparent' }}>
                <span className="text-[13px]" style={{ color: typeFilter === o.value ? '#00cc44' : '#e8f5e8' }}>{o.label}</span>
                {typeFilter === o.value && <Check size={13} className="text-[#00cc44]" />}
              </button>
            ))}
          </div>

          <div className="mx-3 my-1" style={{ height: '1px', background: '#1e2e1e' }} />

          {/* Language */}
          <div className="px-3 pb-3">
            <p className="text-[10px] font-bold text-[#4a5e4a] uppercase tracking-widest mb-1.5">Language</p>
            {['All', 'EN', 'JP'].map(l => (
              <button key={l} onClick={() => onLanguageChange(l)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl press-scale text-left"
                style={{ background: language === l ? '#00cc4415' : 'transparent' }}>
                <span className="text-[13px]" style={{ color: language === l ? '#00cc44' : '#e8f5e8' }}>{l === 'All' ? 'All Languages' : l}</span>
                {language === l && <Check size={13} className="text-[#00cc44]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sets multi-select dropdown ─────────────────────────────────────────────────
interface SetsDropdownProps {
  sets?: Set[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function SetsDropdown({ sets = [], selectedIds, onChange }: SetsDropdownProps) {
  const { open, setOpen, ref } = useDropdown();
  const [search, setSearch] = useState('');

  const filtered = sets.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.series ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Group by series
  const grouped = filtered.reduce<Record<string, Set[]>>((acc, s) => {
    const group = s.series ?? 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(s);
    return acc;
  }, {});

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  }

  const label = selectedIds.length === 0
    ? 'Sets'
    : selectedIds.length === 1
      ? (sets.find(s => s.id === selectedIds[0])?.name ?? '1 Set')
      : `${selectedIds.length} Sets`;

  return (
    <div ref={ref} className="relative">
      <DropdownButton
        label={label}
        active={open || selectedIds.length > 0}
        onClick={() => setOpen(v => !v)}
        badge={selectedIds.length || undefined}
      />

      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-2xl shadow-2xl z-[70] flex flex-col"
          style={{ background: '#111811', border: '1px solid #1e2e1e', width: '280px', maxHeight: '420px' }}
        >
          {/* Header */}
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-bold text-[#e8f5e8]">Sets</p>
              {selectedIds.length > 0 && (
                <button onClick={() => onChange([])}
                  className="flex items-center gap-1 text-[11px] text-[#4a5e4a] hover:text-[#ff3b3b] press-scale">
                  <X size={11} /> Clear all
                </button>
              )}
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#0a0e0a', border: '1px solid #1e2e1e' }}>
              <Search size={13} className="text-[#4a5e4a] flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sets..."
                autoFocus
                className="flex-1 text-[13px] outline-none bg-transparent text-[#e8f5e8] placeholder:text-[#4a5e4a]"
              />
            </div>
          </div>

          {/* Set list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {/* Selected sets shown first */}
            {selectedIds.length > 0 && search === '' && (
              <div className="mb-1">
                {selectedIds.map(id => {
                  const s = sets.find(x => x.id === id);
                  if (!s) return null;
                  return (
                    <label key={id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer press-scale"
                      style={{ background: '#00cc4415' }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: '#00cc44' }}>
                        <Check size={10} className="text-black" strokeWidth={3} />
                      </div>
                      {s.symbolUrl && <img src={s.symbolUrl} alt="" className="w-4 h-4 object-contain flex-shrink-0" />}
                      <span className="text-[13px] text-[#00cc44] truncate flex-1">{s.name}</span>
                      <span className="text-[10px] text-[#4a5e4a]">{s.total}</span>
                    </label>
                  );
                })}
                <div className="mx-3 my-1" style={{ height: '1px', background: '#1e2e1e' }} />
              </div>
            )}

            {/* Grouped sets */}
            {Object.entries(grouped).map(([series, groupSets]) => (
              <div key={series}>
                {!search && (
                  <p className="text-[9px] font-bold text-[#4a5e4a] uppercase tracking-widest px-3 py-1.5">{series}</p>
                )}
                {groupSets
                  .filter(s => !selectedIds.includes(s.id) || search !== '')
                  .map(s => {
                    const checked = selectedIds.includes(s.id);
                    return (
                      <label key={s.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer press-scale"
                        style={{ background: checked ? '#00cc4415' : 'transparent' }}
                        onClick={() => toggle(s.id)}>
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: checked ? '#00cc44' : 'transparent', border: checked ? 'none' : '1.5px solid #2a3d2a' }}>
                          {checked && <Check size={10} className="text-black" strokeWidth={3} />}
                        </div>
                        {s.symbolUrl && <img src={s.symbolUrl} alt="" className="w-4 h-4 object-contain flex-shrink-0" />}
                        <span className="text-[13px] truncate flex-1"
                          style={{ color: checked ? '#00cc44' : '#e8f5e8' }}>{s.name}</span>
                        <span className="text-[10px] text-[#4a5e4a] flex-shrink-0">{s.total}</span>
                      </label>
                    );
                  })}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-[13px] text-[#4a5e4a] py-6">No sets found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
