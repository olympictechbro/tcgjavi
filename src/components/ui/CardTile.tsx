import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useTilt } from '../../hooks/useTilt';
import type { Card } from '../../lib/api';

interface CardTileProps {
  card: Card;
  className?: string;
}

export const RARITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  HyperRare:               { bg: 'bg-yellow-500/20', text: 'text-yellow-400',  label: 'Hyper Rare' },
  SpecialIllustrationRare: { bg: 'bg-purple-500/20', text: 'text-purple-300',  label: 'SIR' },
  IllustrationRare:        { bg: 'bg-blue-500/20',   text: 'text-blue-300',    label: 'IR' },
  RareSecret:              { bg: 'bg-yellow-600/20', text: 'text-yellow-300',  label: 'Secret' },
  RareRainbow:             { bg: 'bg-pink-500/20',   text: 'text-pink-300',    label: 'Rainbow' },
  RareUltra:               { bg: 'bg-orange-500/20', text: 'text-orange-300',  label: 'Ultra' },
  VMAX:                    { bg: 'bg-red-500/20',    text: 'text-red-400',     label: 'VMAX' },
  VSTAR:                   { bg: 'bg-yellow-500/20', text: 'text-yellow-400',  label: 'VSTAR' },
  V:                       { bg: 'bg-blue-600/20',   text: 'text-blue-300',    label: 'V' },
  RareHolo:                { bg: 'bg-[#00cc4420]',   text: 'text-[#00cc44]',   label: 'Holo' },
  DoubleRare:              { bg: 'bg-[#00cc4420]',   text: 'text-[#00cc44]',   label: 'Double Rare' },
  Rare:                    { bg: 'bg-[#4a5e4a]',     text: 'text-[#8fa88f]',   label: 'Rare' },
  Uncommon:                { bg: 'bg-[#1c261c]',     text: 'text-[#4a5e4a]',   label: 'Uncommon' },
  Common:                  { bg: 'bg-[#1c261c]',     text: 'text-[#4a5e4a]',   label: 'Common' },
};

function getRarity(rarity: string) {
  return RARITY_COLORS[rarity] ?? { bg: 'bg-[#1c261c]', text: 'text-[#4a5e4a]', label: rarity };
}

const HOLO_RARITIES = new Set([
  'RareHolo','RareUltra','RareSecret','RareRainbow','HyperRare',
  'SpecialIllustrationRare','IllustrationRare','VMAX','VSTAR','V','DoubleRare',
]);

// ── Grid tile (for card grid view) ─────────────────────────────────────────────
export function CardTile({ card, className }: CardTileProps) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(12);
  const nmPrice = card.prices?.find(p => p.condition === 'NEAR_MINT')?.marketPrice;
  const rarity = getRarity(card.rarity);
  const isHolo = HOLO_RARITIES.has(card.rarity);

  return (
    <Link to={`/card/${card.id}`} className={cn('block', className)}>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="card-3d rounded-2xl overflow-hidden cursor-pointer"
        style={{ background: '#111811', border: '1px solid #1e2e1e' }}
      >
        <div className="card-shine rounded-2xl" />

        {isHolo && (
          <div className="absolute top-2 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <span className="text-[8px] font-bold tracking-widest uppercase text-[#8fa88f] bg-black/60 px-2 py-0.5 rounded-full">
              Holo
            </span>
          </div>
        )}

        {/* Card image — taller ratio so cards feel bigger */}
        <div className="relative aspect-[2.5/3.5] bg-[#0a0e0a] overflow-hidden">
          {card.imageSmall ? (
            <img
              src={card.imageSmall}
              alt={card.name}
              className="absolute inset-0 w-full h-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#4a5e4a] text-xs font-medium text-center px-2">{card.name}</span>
            </div>
          )}
          {card.language === 'JP' && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10">JP</span>
          )}
        </div>

        {/* Info */}
        <div className="px-3 pt-2.5 pb-3">
          <p className="text-[13px] font-bold text-[#e8f5e8] leading-tight truncate">{card.name}</p>
          {card.set?.id ? (
            <Link to={`/set/${card.set.id}`} onClick={e => e.stopPropagation()}
              className="text-[11px] text-[#4a5e4a] hover:text-[#00cc44] transition-colors truncate mt-0.5 block">
              {card.set.name}
            </Link>
          ) : (
            <p className="text-[11px] text-[#4a5e4a] truncate mt-0.5">{card.set?.name}</p>
          )}

          <div className="flex items-center justify-between mt-2 gap-1">
            <span className={cn('rarity-chip', rarity.bg, rarity.text)}>{rarity.label}</span>
            {nmPrice != null ? (
              <span className="text-[15px] font-bold text-[#00cc44]">${nmPrice.toFixed(2)}</span>
            ) : (
              <span className="text-[12px] text-[#4a5e4a]">—</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── List item (for list view — price prominently beside card) ──────────────────
export function CardListItem({ card }: CardTileProps) {
  const nmPrice = card.prices?.find(p => p.condition === 'NEAR_MINT')?.marketPrice;
  const rarity = getRarity(card.rarity);

  return (
    <Link to={`/card/${card.id}`} className="block press-scale">
      <div
        className="flex items-center gap-4 p-3 rounded-2xl"
        style={{ background: '#111811', border: '1px solid #1e2e1e' }}
      >
        {/* Card image */}
        <div className="flex-shrink-0 w-14 h-[76px] bg-[#0a0e0a] rounded-xl overflow-hidden flex items-center justify-center">
          {card.imageSmall ? (
            <img src={card.imageSmall} alt={card.name} className="w-full h-full object-contain p-1" loading="lazy" />
          ) : (
            <span className="text-[8px] text-[#4a5e4a] text-center px-1">{card.name}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[#e8f5e8] truncate">{card.name}</p>
          {card.set?.id ? (
            <Link to={`/set/${card.set.id}`} onClick={e => e.stopPropagation()}
              className="text-[12px] text-[#4a5e4a] hover:text-[#00cc44] transition-colors truncate block">
              {card.set.name}
            </Link>
          ) : (
            <p className="text-[12px] text-[#4a5e4a] truncate">{card.set?.name}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('rarity-chip', rarity.bg, rarity.text)}>{rarity.label}</span>
            {card.language === 'JP' && (
              <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">JP</span>
            )}
          </div>
        </div>

        {/* Price — right side */}
        <div className="flex-shrink-0 text-right">
          {nmPrice != null ? (
            <>
              <p className="text-[18px] font-bold text-[#00cc44] leading-tight">${nmPrice.toFixed(2)}</p>
              <p className="text-[10px] text-[#4a5e4a] mt-0.5">NM</p>
            </>
          ) : (
            <p className="text-[14px] text-[#4a5e4a]">—</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Skeletons ──────────────────────────────────────────────────────────────────
export function CardTileSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#1e2e1e]" style={{ background: '#111811' }}>
      <div className="aspect-[2.5/3.5] shimmer" />
      <div className="px-3 py-3 space-y-2">
        <div className="h-3.5 shimmer rounded w-4/5" />
        <div className="h-3 shimmer rounded w-1/2" />
        <div className="h-4 shimmer rounded w-2/3" />
      </div>
    </div>
  );
}

export function CardListSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl border border-[#1e2e1e]" style={{ background: '#111811' }}>
      <div className="w-14 h-[76px] shimmer rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 shimmer rounded w-3/4" />
        <div className="h-3 shimmer rounded w-1/2" />
        <div className="h-3 shimmer rounded w-1/4" />
      </div>
      <div className="w-16 h-6 shimmer rounded flex-shrink-0" />
    </div>
  );
}
