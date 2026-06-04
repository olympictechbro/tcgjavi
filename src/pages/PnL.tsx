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
  const accent = positive === undefined ? '#00cc44' : positive ? '#00cc44' : '#ff3b3b';
  return (
    <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accent + '18' }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#4a5e4a] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[16px] font-bold truncate" style={{ color: positive === undefined ? '#e8f5e8' : accent }}>
          {value}
        </p>
        {sub && <p className="text-[10px] text-[#4a5e4a]">{sub}</p>}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const gain = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl px-3 py-2 shadow-lg" style={{ background: '#161e16', border: '1px solid #1e2e1e' }}>
      <p className="text-[11px] text-[#4a5e4a]">{label}</p>
      <p className={cn('text-[14px] font-bold', gain >= 0 ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
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
    <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
      <header
        className="fixed top-0 left-0 right-0 z-40 safe-top"
        style={{ background: 'rgba(10,14,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e2e1e' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-[24px] font-bold tracking-tight text-[#e8f5e8]">P&amp;L</h1>
        </div>
      </header>

      <main className="pt-20 pb-32 max-w-2xl mx-auto px-4 page-enter space-y-3">

        {/* Hero */}
        {summary && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: isOverallPositive
                ? 'linear-gradient(135deg, #0a1a0a 0%, #0d2a0d 100%)'
                : 'linear-gradient(135deg, #1a0a0a 0%, #2a0d0d 100%)',
              border: '1px solid ' + (isOverallPositive ? '#00cc44' : '#ff3b3b'),
            }}
          >
            <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: isOverallPositive ? '#4a5e4a' : '#5e4a4a' }}>
              Total Gain · Realized + Unrealized
            </p>
            <p className="text-[38px] font-bold tracking-tight" style={{ color: isOverallPositive ? '#00cc44' : '#ff3b3b' }}>
              {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
            </p>
            <div className="flex gap-5 mt-3">
              {[
                { label: 'Net Cash Flow', value: `$${summary.overall.netCashFlow.toFixed(2)}` },
                { label: 'Revenue', value: `$${summary.overall.totalRevenue.toFixed(2)}` },
                { label: 'Spent', value: `$${summary.overall.totalSpent.toFixed(2)}` },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: isOverallPositive ? '#4a5e4a' : '#5e4a4a' }}>{s.label}</p>
                  <p className="text-[13px] font-semibold text-[#8fa88f]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stat cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label="Realized"
              value={`${summary.realized.gain >= 0 ? '+' : ''}$${summary.realized.gain.toFixed(2)}`}
              sub={`${summary.realized.gainPct.toFixed(1)}% · ${summary.realized.salesCount} sales`}
              positive={summary.realized.gain >= 0}
              icon={summary.realized.gain >= 0 ? TrendingUp : TrendingDown}
            />
            <StatCard
              label="Unrealized"
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
        <div className="rounded-2xl overflow-hidden" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[14px] font-bold text-[#e8f5e8]">Realized Gain Over Time</p>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg press-scale capitalize transition-all"
                  style={{
                    background: period === p ? '#00cc44' : 'transparent',
                    color: period === p ? '#000' : '#4a5e4a',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 px-2 pb-3">
            {overTime.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[13px] text-[#4a5e4a]">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overTime} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4a5e4a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#4a5e4a' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#1e2e1e' }} />
                  <Bar dataKey="realizedGain" radius={[5, 5, 0, 0]}>
                    {overTime.map((entry, i) => (
                      <Cell key={i} fill={entry.realizedGain >= 0 ? '#00cc44' : '#ff3b3b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Best flips */}
        {flips.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
              <Award size={15} className="text-yellow-400" />
              <p className="text-[14px] font-bold text-[#e8f5e8]">Best Flips</p>
            </div>
            <div className="divide-y" style={{ borderColor: '#1e2e1e' }}>
              {flips.slice(0, 10).map((flip, i) => {
                const name = flip.card?.name ?? flip.sealed?.name ?? 'Item';
                const image = flip.card?.imageSmall ?? flip.sealed?.imageUrl;
                const gain = (flip as { gain?: number }).gain ?? flip.realizedGain ?? 0;
                const gainPct = (flip as { gainPct?: number }).gainPct ?? flip.realizedGainPct ?? 0;

                return (
                  <div key={flip.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-[12px] font-bold text-[#4a5e4a] w-4">{i + 1}</span>
                    {image && <img src={image} alt={name} className="w-8 h-11 object-contain flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#e8f5e8] truncate">{name}</p>
                      <p className="text-[11px] text-[#4a5e4a]">
                        ${flip.pricePerUnit.toFixed(2)} × {flip.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-[13px] font-bold', gain >= 0 ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
                        {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
                      </p>
                      <p className={cn('text-[10px]', gainPct >= 0 ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
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
            <DollarSign size={44} className="mx-auto text-[#1e2e1e] mb-3" />
            <p className="text-[16px] font-semibold text-[#8fa88f]">No transactions yet</p>
            <p className="text-[13px] text-[#4a5e4a] mt-1">Add cards and log sales to see P&amp;L</p>
          </div>
        )}
      </main>
    </div>
  );
}
