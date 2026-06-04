import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { getCardPriceHistory } from '../../lib/api';
import { cn } from '../../lib/cn';

const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;

interface PriceChartProps {
  cardId: string;
  currentPrice?: number | null;
}

function formatDate(str: string, range: string) {
  const d = new Date(str);
  if (range === '1W') return d.toLocaleDateString('en', { weekday: 'short' });
  if (range === '1M' || range === '3M') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl px-3 py-2 shadow-lg text-center" style={{ background: '#161e16', border: '1px solid #1e2e1e' }}>
      <p className="text-[17px] font-bold text-[#00cc44]">${d.marketPrice?.toFixed(2)}</p>
      <p className="text-[10px] text-[#4a5e4a]">{new Date(d.recordedAt).toLocaleDateString()}</p>
    </div>
  );
}

export function PriceChart({ cardId, currentPrice }: PriceChartProps) {
  const [range, setRange] = useState<typeof RANGES[number]>('1M');

  const { data = [], isLoading } = useQuery({
    queryKey: ['priceHistory', cardId, range],
    queryFn: () => getCardPriceHistory(cardId, range),
  });

  const first = data[0]?.marketPrice ?? currentPrice ?? 0;
  const last = data[data.length - 1]?.marketPrice ?? currentPrice ?? 0;
  const change = last - first;
  const changePct = first > 0 ? (change / first) * 100 : 0;
  const isUp = change >= 0;
  const lineColor = isUp ? '#00cc44' : '#ff3b3b';

  const chartData = data.map(d => ({
    ...d,
    date: formatDate(d.recordedAt, range),
  }));

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
      {/* Price header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[30px] font-bold tracking-tight text-[#e8f5e8]">
            ${currentPrice?.toFixed(2) ?? '—'}
          </span>
          {data.length > 1 && (
            <span className={cn('text-[13px] font-semibold', isUp ? 'text-[#00cc44]' : 'text-[#ff3b3b]')}>
              {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(1)}%)
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#4a5e4a] mt-0.5">NM Market Price · avg last 4 sales</p>
      </div>

      {/* Chart */}
      <div className="h-40 px-1">
        {isLoading ? (
          <div className="h-full shimmer" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4a5e4a' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#4a5e4a' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e2e1e', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="marketPrice"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[13px] text-[#4a5e4a]">
            No price history yet
          </div>
        )}
      </div>

      {/* Range selector */}
      <div className="flex justify-around px-3 pb-3 pt-1">
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all press-scale"
            style={{
              background: range === r ? '#00cc44' : 'transparent',
              color: range === r ? '#000' : '#4a5e4a',
            }}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
