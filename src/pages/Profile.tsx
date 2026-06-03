import { useQuery } from '@tanstack/react-query';
import { getInventory, getPnlSummary } from '../lib/api';
import { Settings, Bell, Moon, ExternalLink, ChevronRight, Layers, DollarSign, TrendingUp } from 'lucide-react';

function Row({ icon: Icon, label, value, chevron }: {
  icon: React.ElementType; label: string; value?: string; chevron?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-[#007AFF]/10 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-[#007AFF]" />
      </div>
      <span className="text-[15px] flex-1">{label}</span>
      {value && <span className="text-[14px] text-[#8E8E93]">{value}</span>}
      {chevron && <ChevronRight size={16} className="text-[#C7C7CC]" />}
    </div>
  );
}

export default function Profile() {
  const { data: inv } = useQuery({ queryKey: ['inventory'], queryFn: () => getInventory() });
  const { data: pnl } = useQuery({ queryKey: ['pnl-summary'], queryFn: getPnlSummary });

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/20 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-[28px] font-bold tracking-tight">Profile</h1>
        </div>
      </header>

      <main className="pt-20 pb-32 max-w-2xl mx-auto px-4 page-enter space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center mb-3 shadow-lg">
            <span className="text-[32px]">🃏</span>
          </div>
          <h2 className="text-[20px] font-bold text-[#1C1C1E]">My Collection</h2>
          <p className="text-[14px] text-[#8E8E93]">tcgjavi collector</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Cards', value: inv?.data.length ?? '—', icon: Layers, color: 'text-[#007AFF]' },
            { label: 'Portfolio', value: inv?.summary ? `$${inv.summary.totalMarketValue.toFixed(0)}` : '—', icon: DollarSign, color: 'text-[#34C759]' },
            { label: 'Total Gain', value: pnl ? `${pnl.overall.totalGain >= 0 ? '+' : ''}$${pnl.overall.totalGain.toFixed(0)}` : '—', icon: TrendingUp, color: pnl && pnl.overall.totalGain >= 0 ? 'text-gain' : 'text-loss' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl px-3 py-4 shadow-sm text-center">
              <s.icon size={20} className={`mx-auto mb-1 ${s.color}`} />
              <p className={`text-[16px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-[#8E8E93]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide px-4 pt-3 pb-1">Preferences</p>
          <div className="divide-y divide-[#F2F2F7]">
            <Row icon={Bell} label="Price Alerts" value="Coming soon" />
            <Row icon={Moon} label="Dark Mode" value="System" chevron />
            <Row icon={Settings} label="API Endpoint" value="localhost:3001" chevron />
          </div>
        </div>

        {/* API info */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide px-4 pt-3 pb-1">Data</p>
          <div className="divide-y divide-[#F2F2F7]">
            <Row icon={ExternalLink} label="Card Catalog" value="pokemontcg.io" chevron />
            <Row icon={ExternalLink} label="Pricing" value="PriceCharting" chevron />
            <Row icon={ExternalLink} label="API Docs" value="/docs" chevron />
          </div>
        </div>

        <p className="text-center text-[12px] text-[#C7C7CC] pb-4">
          TCGJavi v1.0.0 · Built with ❤️
        </p>
      </main>
    </div>
  );
}
