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
    /* Outer wrapper: full-width flex container just to center the pill */
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center gap-0.5 p-1.5"
        style={{
          background: 'rgba(14,20,14,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid #1e2e1e',
          borderRadius: '999px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className="block">
            {({ isActive }) => (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 press-scale select-none cursor-pointer',
                  isActive ? 'text-black' : 'text-[#4a5e4a] hover:text-[#8fa88f]'
                )}
                style={isActive ? {
                  background: '#00cc44',
                  boxShadow: '0 2px 12px rgba(0,204,68,0.45)',
                } : undefined}
              >
                <Icon size={17} strokeWidth={isActive ? 2.3 : 1.7} />
                {isActive && (
                  <span className="text-[12px] font-bold tracking-tight whitespace-nowrap pr-0.5">
                    {label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
