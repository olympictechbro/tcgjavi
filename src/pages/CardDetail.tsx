import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Zap, Shield, Droplets } from 'lucide-react';
import { getCard, getCardPrices } from '../lib/api';
import { Header } from '../components/ui/Header';
import { PriceChart } from '../components/ui/PriceChart';
import { AddCardSheet } from '../components/ui/AddCardSheet';
import { cn } from '../lib/cn';

const TYPE_COLORS: Record<string, string> = {
  Fire: 'bg-orange-100 text-orange-700',
  Water: 'bg-blue-100 text-blue-700',
  Grass: 'bg-green-100 text-green-700',
  Lightning: 'bg-yellow-100 text-yellow-700',
  Psychic: 'bg-purple-100 text-purple-700',
  Fighting: 'bg-red-100 text-red-700',
  Darkness: 'bg-gray-800 text-gray-100',
  Metal: 'bg-slate-200 text-slate-700',
  Dragon: 'bg-indigo-100 text-indigo-700',
  Fairy: 'bg-pink-100 text-pink-700',
  Colorless: 'bg-gray-100 text-gray-600',
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
      <div className="min-h-screen bg-[#F2F2F7]">
        <Header title="" back />
        <div className="pt-16 px-4 space-y-4">
          <div className="aspect-[2.5/3.5] max-w-xs mx-auto shimmer rounded-3xl" />
          <div className="h-8 shimmer rounded-xl w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <Header
        title={card.name}
        back
        right={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 bg-[#007AFF] text-white px-3 py-1.5 rounded-xl text-[14px] font-semibold press-scale"
          >
            <Plus size={15} strokeWidth={2.5} /> Add
          </button>
        }
      />

      <main className="pt-16 pb-32 max-w-lg mx-auto">
        {/* Card image */}
        <div className="flex justify-center py-5 px-8">
          <div className="relative">
            {card.imageLarge ? (
              <img
                src={card.imageLarge}
                alt={card.name}
                className="w-full max-w-[280px] drop-shadow-2xl rounded-2xl"
              />
            ) : (
              <div className="w-64 aspect-[2.5/3.5] bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                <span className="text-lg font-bold text-indigo-600">{card.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 space-y-3">
          {/* Card identity */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[22px] font-bold text-[#1C1C1E]">{card.name}</h1>
                <p className="text-[14px] text-[#8E8E93]">{card.set?.name} · #{card.number}</p>
              </div>
              {card.hp && (
                <div className="flex items-center gap-1 bg-red-50 rounded-xl px-2 py-1">
                  <Shield size={13} className="text-red-500" />
                  <span className="text-[14px] font-bold text-red-600">{card.hp} HP</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {card.types?.map(type => (
                <span key={type} className={cn('text-[12px] font-semibold px-2.5 py-0.5 rounded-full', TYPE_COLORS[type] || 'bg-gray-100 text-gray-600')}>
                  {type}
                </span>
              ))}
              <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-[#F2F2F7] text-[#8E8E93]">
                {card.rarity}
              </span>
              <span className={cn('text-[12px] font-medium px-2.5 py-0.5 rounded-full', card.language === 'JP' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600')}>
                {card.language}
              </span>
            </div>
          </div>

          {/* Price chart */}
          <PriceChart cardId={card.id} currentPrice={nmPrice} />

          {/* All conditions pricing */}
          {prices.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide px-4 pt-3 pb-2">
                Prices by Condition
              </p>
              <div className="divide-y divide-[#F2F2F7]">
                {prices.map(p => (
                  <div key={p.condition} className="flex items-center px-4 py-3">
                    <span className="text-[14px] font-medium text-[#1C1C1E] flex-1">
                      {CONDITION_LABELS[p.condition] ?? p.condition}
                    </span>
                    <div className="text-right">
                      {p.marketPrice != null ? (
                        <>
                          <p className="text-[15px] font-bold text-[#1C1C1E]">${p.marketPrice.toFixed(2)}</p>
                          <p className="text-[11px] text-[#8E8E93]">
                            ${p.lowPrice?.toFixed(2)} – ${p.highPrice?.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-[13px] text-[#C7C7CC]">No data</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attacks */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide px-4 pt-3 pb-2">
                Attacks
              </p>
              <div className="divide-y divide-[#F2F2F7]">
                {card.attacks.map(atk => (
                  <div key={atk.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-yellow-500" />
                        <span className="text-[15px] font-semibold">{atk.name}</span>
                      </div>
                      {atk.damage && (
                        <span className="text-[15px] font-bold text-[#1C1C1E]">{atk.damage}</span>
                      )}
                    </div>
                    {atk.text && <p className="text-[13px] text-[#8E8E93] mt-1 leading-relaxed">{atk.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abilities */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide px-4 pt-3 pb-2">
                Abilities
              </p>
              {card.abilities.map(ab => (
                <div key={ab.id} className="px-4 py-3 border-t border-[#F2F2F7] first:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets size={14} className="text-blue-500" />
                    <span className="text-[14px] font-semibold text-[#007AFF]">{ab.type}</span>
                    <span className="text-[14px] font-semibold">{ab.name}</span>
                  </div>
                  {ab.text && <p className="text-[13px] text-[#8E8E93] leading-relaxed">{ab.text}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-[#F2F2F7]">
            {[
              ['Artist', card.artist],
              ['Evolves From', card.evolvesFrom],
              ['Pokédex #', card.nationalDex?.toString()],
              ['Subtypes', card.subtypes?.join(', ')],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex items-center px-4 py-3">
                <span className="text-[14px] text-[#8E8E93] flex-1">{label}</span>
                <span className="text-[14px] font-medium text-[#1C1C1E]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AddCardSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
