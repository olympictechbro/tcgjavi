import { useQuery } from '@tanstack/react-query';
import { getInventory, getPnlSummary } from '../lib/api';
import { Bell, ExternalLink, ChevronRight, Layers, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { cn } from '../lib/cn';

function Row({ icon: Icon, label, value, chevron, accent }: {
  icon: React.ElementType; label: string; value?: string; chevron?: boolean; accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: (accent ?? '#00cc44') + '18' }}
      >
        <Icon size={15} style={{ color: accent ?? '#00cc44' }} />
      </div>
      <span className="text-[14px] flex-1 text-[#e8f5e8]">{label}</span>
      {value && <span className="text-[13px] text-[#4a5e4a]">{value}</span>}
      {chevron && <ChevronRight size={14} className="text-[#4a5e4a]" />}
    </div>
  );
}

export default function Profile() {
  const { data: inv } = useQuery({ queryKey: ['inventory'], queryFn: () => getInventory() });
  const { data: pnl } = useQuery({ queryKey: ['pnl-summary'], queryFn: getPnlSummary });

  const totalGain = pnl?.overall.totalGain ?? 0;
  const gainPositive = totalGain >= 0;

  return (
    <div className="min-h-screen" style={{ background: '#0a0e0a' }}>
      <header
        className="fixed top-0 left-0 right-0 z-40 safe-top"
        style={{ background: 'rgba(10,14,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e2e1e' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-[24px] font-bold tracking-tight text-[#e8f5e8]">Profile</h1>
        </div>
      </header>

      <main className="pt-20 pb-32 max-w-2xl mx-auto px-4 page-enter space-y-4">

        {/* Avatar */}
        <div className="flex flex-col items-center py-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #1a3a1a, #0a0e0a)',
              border: '2px solid #1e2e1e',
              boxShadow: '0 0 30px rgba(0,204,68,0.2)',
            }}
          >
            <span className="text-[34px]">🃏</span>
          </div>
          <h2 className="text-[18px] font-bold text-[#e8f5e8]">My Collection</h2>
          <p className="text-[13px] text-[#4a5e4a]">tcgjavi collector</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Cards', value: inv?.data.length?.toString() ?? '—', icon: Layers, accent: '#00cc44' },
            { label: 'Value', value: inv?.summary ? `$${inv.summary.totalMarketValue.toFixed(0)}` : '—', icon: DollarSign, accent: '#00cc44' },
            {
              label: 'Gain',
              value: pnl ? `${gainPositive ? '+' : ''}$${Math.abs(totalGain).toFixed(0)}` : '—',
              icon: TrendingUp,
              accent: gainPositive ? '#00cc44' : '#ff3b3b',
            },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl px-3 py-4 text-center"
              style={{ background: '#111811', border: '1px solid #1e2e1e' }}
            >
              <s.icon size={18} className="mx-auto mb-1" style={{ color: s.accent }} />
              <p className="text-[15px] font-bold" style={{ color: s.accent }}>{s.value}</p>
              <p className="text-[10px] text-[#4a5e4a] uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div className="rounded-2xl overflow-hidden divide-y" style={{ background: '#111811', border: '1px solid #1e2e1e', borderColor: '#1e2e1e' }}>
          <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest px-4 pt-3 pb-1">Preferences</p>
          <Row icon={Bell} label="Price Alerts" value="Coming soon" />
          <Row icon={Zap} label="Dark Mode" value="Always on" />
        </div>

        {/* Data sources */}
        <div className="rounded-2xl overflow-hidden divide-y" style={{ background: '#111811', border: '1px solid #1e2e1e', borderColor: '#1e2e1e' }}>
          <p className="text-[10px] font-semibold text-[#4a5e4a] uppercase tracking-widest px-4 pt-3 pb-1">Data</p>
          <Row icon={ExternalLink} label="Card Catalog" value="pokemontcg.io" chevron />
          <Row icon={ExternalLink} label="Pricing" value="PriceCharting" chevron />
          <Row icon={ExternalLink} label="API Docs" value="/docs" chevron />
        </div>

        {/* Version */}
        <div className="rounded-2xl px-4 py-3" style={{ background: '#111811', border: '1px solid #1e2e1e' }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#4a5e4a]">TCGJavi</span>
            <span className="text-[12px] font-mono" style={{ color: '#00cc44' }}>v1.0.0</span>
          </div>
          <p className="text-[11px] text-[#4a5e4a] mt-1">
            Powered by PokemonTCG.io · Pricing via PriceCharting
          </p>
        </div>

        <p className={cn('text-center text-[11px] pb-2')} style={{ color: '#4a5e4a' }}>
          Built for collectors, by collectors
        </p>
      </main>
    </div>
  );
}
