import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import type { Card } from '../../lib/api';

interface CardTileProps {
  card: Card;
  className?: string;
}

const RARITY_COLORS: Record<string, string> = {
  HyperRare: 'from-yellow-400 to-amber-500',
  SpecialIllustrationRare: 'from-purple-400 to-pink-500',
  IllustrationRare: 'from-blue-400 to-cyan-400',
  RareSecret: 'from-yellow-300 to-orange-400',
  RareRainbow: 'from-pink-400 via-purple-400 to-blue-400',
  RareUltra: 'from-orange-400 to-red-400',
  VMAX: 'from-red-500 to-orange-400',
  VSTAR: 'from-yellow-400 to-orange-500',
  V: 'from-blue-500 to-indigo-500',
  RareHolo: 'from-blue-300 to-blue-500',
  Rare: 'from-gray-300 to-gray-400',
};

function rarityGradient(rarity: string) {
  return RARITY_COLORS[rarity] || 'from-gray-100 to-gray-200';
}

export function CardTile({ card, className }: CardTileProps) {
  const nmPrice = card.prices?.find(p => p.condition === 'NEAR_MINT')?.marketPrice;

  return (
    <Link
      to={`/card/${card.id}`}
      className={cn('block press-scale', className)}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.06] hover:shadow-md transition-shadow">
        {/* Card image */}
        <div className={cn('relative aspect-[2.5/3.5] bg-gradient-to-br', rarityGradient(card.rarity))}>
          {card.imageSmall ? (
            <img
              src={card.imageSmall}
              alt={card.name}
              className="absolute inset-0 w-full h-full object-contain p-1"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/60 text-xs font-medium">{card.name}</span>
            </div>
          )}

          {/* Language badge */}
          {card.language === 'JP' && (
            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              JP
            </span>
          )}
        </div>

        {/* Info */}
        <div className="px-2.5 py-2">
          <p className="text-[12px] font-semibold text-[#1C1C1E] leading-tight truncate">{card.name}</p>
          <p className="text-[10px] text-[#8E8E93] truncate mt-0.5">
            {card.set?.name} · #{card.number}
          </p>

          {/* Price */}
          <div className="mt-1.5 flex items-center justify-between">
            {nmPrice != null ? (
              <span className="text-[13px] font-bold text-[#1C1C1E]">
                ${nmPrice.toFixed(2)}
              </span>
            ) : (
              <span className="text-[11px] text-[#8E8E93]">No price</span>
            )}
            <span className="text-[9px] bg-[#F2F2F7] text-[#8E8E93] px-1.5 py-0.5 rounded-full font-medium">
              {card.rarity?.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CardTileSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.06]">
      <div className="aspect-[2.5/3.5] shimmer" />
      <div className="px-2.5 py-2 space-y-1.5">
        <div className="h-3 shimmer rounded w-3/4" />
        <div className="h-2.5 shimmer rounded w-1/2" />
        <div className="h-3 shimmer rounded w-1/3" />
      </div>
    </div>
  );
}
