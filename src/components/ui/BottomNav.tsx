import { NavLink } from 'react-router-dom';
import { Home, Search, Layers, TrendingUp, User } from 'lucide-react';
import { cn } from '../../lib/cn';

const tabs = [
  { to: '/',          icon: Home,       label: 'Home'      },
  { to: '/search',    icon: Search,     label: 'Search'    },
  { to: '/portfolio', icon: Layers,     label: 'Collection'},
  { to: '/pnl',       icon: TrendingUp, label: 'P&L'       },
  { to: '/profile',   icon: User,       label: 'Profile'   },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ background: 'rgba(10,14,10,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid #1e2e1e' }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 press-scale min-w-0 relative',
                isActive ? 'text-[#00cc44]' : 'text-[#4a5e4a]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00cc44]" />
                )}
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className="transition-transform duration-150"
                />
                <span className="text-[10px] font-medium tracking-tight leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
