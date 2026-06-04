import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Zap, Shield, Droplets } from 'lucide-react';
import { getCard, getCardPrices } from '../lib/api';
import { Header } from '../components/ui/Header';
import { PriceChart } from '../components/ui/PriceChart';
import { AddCardSheet } from '../components/ui/AddCardSheet';
import { cn } from '../lib/cn';

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Fire:      { bg: '#2a1200', text: '#ff7733' },
  Water:     { bg: '#001a2a', text: '#4da6ff' },
  Grass:     { bg: '#0a1a0a', text: '#00cc44' },
  Lightning: { bg: '#1a1500', text: '#ffd700' },
  Psychic:   { bg: '#1a0022', text: '#cc44ff' },
  Fighting:  { bg: '#1a0800', text: '#ff6633' },
  Darkness:  { bg: '#111111', text: '#8fa88f' },
  Metal:     { bg: '#111822', text: '#8fb8d0' },
  Dragon:    { bg: '#0a0a1a', text: '#6688ff' },
  Fairy:     { bg: '#1a0011', text: '#ff66aa' },
  Colorless: { bg: '#161e16', text: '#8fa88f' },
};

const CONDITION_LABELS: Record<string, string> = {
  NEAR_MINT: 'NM', LIGHTLY_PLAYED: 'LP', MODERATELY_PLAYED: 'MP',
  HEAVILY_PLAYED: 'HP', DAMAGED: 'DMG',
  GRADED_PSA_10: 'PSA 10', GRADED_PSA_9: 'PSA 9', GRADED_PSA_8: 'PSA 8',
  GRADED_BGS_10: 'BGS 10', GRADED_BGS_95: 'BGS 9.5',
  GRADED_CGC_10: 'CGC 10', GRADED_CGC_9: 'CGC 9',
};

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const [addOpen, setAddOpen] = useState(false);

  const { data: card, isLoading } = useQuery({
    queryKey: ['card', id],
    queryFn: () => getCard(id!),
    enabled: !!id,
  });

  const { data: prices = [] } = useQuery({
    queryKey: ['prices', id],
    queryFn: () => getCardPrices(id!),
    enabled: !!id,
  });

  const nmPrice = prices.find(p => p.condition === 'NEAR_MINT')?.marketPrice;

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
        <Header title="" back />
        <div className="pt-16 px-4 space-y-4">
          <div className="aspect-[2.5/3.5] max-w-[200px] mx-auto shimmer rounded-3xl" />
          <div className="h-7 shimmer rounded-xl w-40 mx-auto" />
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
      <Header
        title={card.name}
        back
        right={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold press-scale"
            style={{ background: '#00cc44', color: '#000' }}
          >
            <Plus size={14} strokeWidth={2.5} /> Add
          </button>
        }
      />

      <main className="pt-16 pb-32 max-w-lg mx-auto">
        {/* Card image */}
        <div className="flex justify-center py-6 px-8">
          {card.imageLarge ? (
            <img
              src={card.imageLarge}
              alt={card.name}
              className="w-full max-w-[260px] rounded-2xl"
              style={{ filter: 'drop-shadow(0 8px 32px rgba(0,204,68,0.2)) drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }}
            />
          ) : (
            <div className="w-56 aspect-[2.5/3.5] rounded-2xl flex items-center justify-center"
              style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
              <span className="text-base font-bold text-[#4a5e4a]">{card.name}</span>
            </div>
          )}
        </div>

        <div className="px-4 space-y-3">
          {/* Card identity */}
          <div className="rounded-2xl px-4 py-3" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[20px] font-bold text-[#e8f5e8]">{card.name}</h1>
                <p className="text-[13px] text-[#4a5e4a]">{card.set?.name} · #{card.number}</p>
              </div>
              {card.hp && (
                <div className="flex items-center gap-1 rounded-xl px-2 py-1" style={{ background: '#2a0a0a' }}>
                  <Shield size={12} className="text-red-400" />
                  <span className="text-[13px] font-bold text-red-400">{card.hp} HP</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {card.types?.map(type => {
                const c = TYPE_COLORS[type] ?? { bg: '#161e16', text: '#8fa88f' };
                return (
                  <span key={type} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: c.bg, color: c.text }}>
                    {type}
                  </span>
                );
              })}
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: '#1c261c', color: '#4a5e4a' }}>
                {card.rarity}
              </span>
              <span className={cn('text-[11px] font-medium px-2.5 py-0.5 rounded-full')}
                style={{ background: card.language === 'JP' ? '#2a0a0a' : '#0a1a1a', color: card.language === 'JP' ? '#ff6644' : '#44aaff' }}>
                {card.language}
              </span>
            </div>
          </div>

          {/* Price chart */}
          <PriceChart cardId={card.id} currentPrice={nmPrice} />

          {/* All conditions */}
          {prices.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
              <p className="text-[11px] font-semibold text-[#4a5e4a] uppercase tracking-widest px-4 pt-3 pb-2">
                Prices by Condition
              </p>
              <div className="divide-y" style={{ borderColor: '#1e2e1e' }}>
                {prices.map(p => (
                  <div key={p.condition} className="flex items-center px-4 py-3">
                    <span className="text-[13px] font-medium text-[#e8f5e8] flex-1">
                      {CONDITION_LABELS[p.condition] ?? p.condition}
                    </span>
                    <div className="text-right">
                      {p.marketPrice != null ? (
                        <>
                          <p className="text-[14px] font-bold text-[#00cc44]">${p.marketPrice.toFixed(2)}</p>
                          <p className="text-[10px] text-[#4a5e4a]">
                            ${p.lowPrice?.toFixed(2)} – ${p.highPrice?.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-[12px] text-[#4a5e4a]">—</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attacks */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
              <p className="text-[11px] font-semibold text-[#4a5e4a] uppercase tracking-widest px-4 pt-3 pb-2">
                Attacks
              </p>
              <div className="divide-y" style={{ borderColor: '#1e2e1e' }}>
                {card.attacks.map(atk => (
                  <div key={atk.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={13} className="text-yellow-400" />
                        <span className="text-[14px] font-semibold text-[#e8f5e8]">{atk.name}</span>
                      </div>
                      {atk.damage && (
                        <span className="text-[14px] font-bold text-[#e8f5e8]">{atk.damage}</span>
                      )}
                    </div>
                    {atk.text && <p className="text-[12px] text-[#4a5e4a] mt-1 leading-relaxed">{atk.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abilities */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
              <p className="text-[11px] font-semibold text-[#4a5e4a] uppercase tracking-widest px-4 pt-3 pb-2">
                Abilities
              </p>
              {card.abilities.map(ab => (
                <div key={ab.id} className="px-4 py-3 border-t first:border-0" style={{ borderColor: '#1e2e1e' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets size={13} className="text-[#4da6ff]" />
                    <span className="text-[12px] font-semibold text-[#4da6ff]">{ab.type}</span>
                    <span className="text-[13px] font-semibold text-[#e8f5e8]">{ab.name}</span>
                  </div>
                  {ab.text && <p className="text-[12px] text-[#4a5e4a] leading-relaxed">{ab.text}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="rounded-2xl overflow-hidden divide-y" style={{ background: '#111811', border: '1px solid #1e2e1e', borderColor: '#1e2e1e' }}>
            {[
              ['Artist', card.artist],
              ['Evolves From', card.evolvesFrom],
              ['Pokédex #', card.nationalDex?.toString()],
              ['Subtypes', card.subtypes?.join(', ')],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex items-center px-4 py-3" style={{ borderColor: '#1e2e1e' }}>
                <span className="text-[13px] text-[#4a5e4a] flex-1">{label}</span>
                <span className="text-[13px] font-medium text-[#8fa88f]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AddCardSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
