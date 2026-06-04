import { NavLink } from 'react-router-dom';
import { Home, Search, Layers, TrendingUp, User } from 'lucide-react';
import { cn } from '../../lib/cn';

const tabs = [
  { to: '/',          icon: Home,       label: 'Home'       },
  { to: '/search',    icon: Search,     label: 'Search'     },
  { to: '/portfolio', icon: Layers,     label: 'Collection' },
  { to: '/pnl',       icon: TrendingUp, label: 'P&L'        },
  { to: '/profile',   icon: User,       label: 'Profile'    },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{
        background: 'rgba(14,20,14,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid #1e2e1e',
        borderRadius: '999px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        padding: '5px 6px',
      }}
    >
      <div className="flex items-center gap-0.5">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="block"
          >
            {({ isActive }) => (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 press-scale select-none',
                  isActive ? 'text-black' : 'text-[#4a5e4a]'
                )}
                style={isActive ? {
                  background: '#00cc44',
                  boxShadow: '0 2px 12px rgba(0,204,68,0.4)',
                } : undefined}
              >
                <Icon size={17} strokeWidth={isActive ? 2.3 : 1.7} />
                {isActive && (
                  <span className="text-[12px] font-bold tracking-tight whitespace-nowrap">
                    {label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
