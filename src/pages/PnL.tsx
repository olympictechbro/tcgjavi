import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Award, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getPnlSummary, getPnlOverTime, getBestFlips } from '../lib/api';
import { cn } from '../lib/cn';

const PERIODS = ['daily', 'monthly', 'yearly'] as const;

function StatCard({ label, value, sub, positive, icon: Icon }: {
  label: string; value: string; sub?: string; positive?: boolean; icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
        positive === undefined ? 'bg-[#007AFF]/10' : positive ? 'bg-gain' : 'bg-loss')}>
        <Icon size={20} className={positive === undefined ? 'text-[#007AFF]' : positive ? 'text-gain' : 'text-loss'} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] text-[#8E8E93] font-medium">{label}</p>
        <p className={cn('text-[18px] font-bold truncate', positive === true ? 'text-gain' : positive === false ? 'text-loss' : 'text-[#1C1C1E]')}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-[#8E8E93]">{sub}</p>}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const gain = payload[0]?.value ?? 0;
  return (
    <div className="bg-white rounded-xl px-3 py-2 shadow-lg border border-black/[0.06]">
      <p className="text-[12px] text-[#8E8E93]">{label}</p>
      <p className={cn('text-[15px] font-bold', gain >= 0 ? 'text-gain' : 'text-loss')}>
        {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
      </p>
    </div>
  );
}

export default function PnL() {
  const [period, setPeriod] = useState<typeof PERIODS[number]>('monthly');

  const { data: summary } = useQuery({ queryKey: ['pnl-summary'], queryFn: getPnlSummary });
  const { data: overTime = [] } = useQuery({ queryKey: ['pnl-over-time', period], queryFn: () => getPnlOverTime(period) });
  const { data: flips = [] } = useQuery({ queryKey: ['best-flips'], queryFn: getBestFlips });

  const totalGain = summary ? summary.realized.gain + summary.unrealized.gain : 0;
  const isOverallPositive = totalGain >= 0;

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/20 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-[28px] font-bold tracking-tight">P&amp;L</h1>
        </div>
      </header>

      <main className="pt-20 pb-32 max-w-2xl mx-auto px-4 page-enter space-y-4">

        {/* Hero total gain */}
        {summary && (
          <div className={cn('rounded-2xl p-5 shadow-lg', isOverallPositive ? 'bg-gradient-to-br from-[#34C759] to-[#30D158]' : 'bg-gradient-to-br from-[#FF3B30] to-[#FF453A]')}>
            <p className="text-white/70 text-[13px] font-medium">Total Gain (Realized + Unrealized)</p>
            <p className="text-[38px] font-bold text-white tracking-tight mt-1">
              {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
            </p>
            <div className="flex gap-4 mt-3">
              <div>
                <p className="text-white/60 text-[11px]">Net Cash Flow</p>
                <p className="text-white text-[14px] font-semibold">${summary.overall.netCashFlow.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/60 text-[11px]">Total Revenue</p>
                <p className="text-white text-[14px] font-semibold">${summary.overall.totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/60 text-[11px]">Total Spent</p>
                <p className="text-white text-[14px] font-semibold">${summary.overall.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Realized vs Unrealized cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Realized Gain"
              value={`${summary.realized.gain >= 0 ? '+' : ''}$${summary.realized.gain.toFixed(2)}`}
              sub={`${summary.realized.gainPct.toFixed(1)}% · ${summary.realized.salesCount} sales`}
              positive={summary.realized.gain >= 0}
              icon={summary.realized.gain >= 0 ? TrendingUp : TrendingDown}
            />
            <StatCard
              label="Unrealized Gain"
              value={`${summary.unrealized.gain >= 0 ? '+' : ''}$${summary.unrealized.gain.toFixed(2)}`}
              sub={`${summary.unrealized.gainPct.toFixed(1)}% · ${summary.unrealized.itemsHeld} held`}
              positive={summary.unrealized.gain >= 0}
              icon={summary.unrealized.gain >= 0 ? TrendingUp : TrendingDown}
            />
            <StatCard
              label="Revenue"
              value={`$${summary.realized.revenue.toFixed(2)}`}
              icon={ArrowUpCircle}
            />
            <StatCard
              label="Total Spent"
              value={`$${summary.overall.totalSpent.toFixed(2)}`}
              sub={`Fees: $${summary.realized.fees.toFixed(2)}`}
              icon={ArrowDownCircle}
            />
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[15px] font-bold text-[#1C1C1E]">Realized Gain Over Time</p>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'text-[11px] font-semibold px-2.5 py-1 rounded-lg press-scale capitalize',
                    period === p ? 'bg-[#007AFF] text-white' : 'text-[#8E8E93]'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 px-2 pb-3">
            {overTime.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#C7C7CC] text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overTime} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="realizedGain" radius={[6, 6, 0, 0]}>
                    {overTime.map((entry, i) => (
                      <Cell key={i} fill={entry.realizedGain >= 0 ? '#34C759' : '#FF3B30'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Best flips */}
        {flips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
              <Award size={16} className="text-[#FF9500]" />
              <p className="text-[15px] font-bold text-[#1C1C1E]">Best Flips</p>
            </div>
            <div className="divide-y divide-[#F2F2F7]">
              {flips.slice(0, 10).map((flip, i) => {
                const name = flip.card?.name ?? flip.sealed?.name ?? 'Item';
                const image = flip.card?.imageSmall ?? flip.sealed?.imageUrl;
                const gain = (flip as { gain?: number }).gain ?? flip.realizedGain ?? 0;
                const gainPct = (flip as { gainPct?: number }).gainPct ?? flip.realizedGainPct ?? 0;

                return (
                  <div key={flip.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-[13px] font-bold text-[#8E8E93] w-4">{i + 1}</span>
                    {image && <img src={image} alt={name} className="w-9 h-12 object-contain flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate">{name}</p>
                      <p className="text-[12px] text-[#8E8E93]">
                        Sold ${flip.pricePerUnit.toFixed(2)} × {flip.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-[14px] font-bold', gain >= 0 ? 'text-gain' : 'text-loss')}>
                        {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
                      </p>
                      <p className={cn('text-[11px]', gainPct >= 0 ? 'text-gain' : 'text-loss')}>
                        {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!summary && (
          <div className="text-center py-20">
            <DollarSign size={48} className="mx-auto text-[#C7C7CC] mb-3" />
            <p className="text-[17px] font-semibold text-[#3C3C43]">No transactions yet</p>
            <p className="text-[14px] text-[#8E8E93] mt-1">Add cards and log sales to see your P&amp;L</p>
          </div>
        )}
      </main>
    </div>
  );
}
