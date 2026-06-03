import { NavLink } from 'react-router-dom';
import { Home, Search, Layers, TrendingUp, User } from 'lucide-react';
import { cn } from '../../lib/cn';

const tabs = [
  { to: '/',          icon: Home,       label: 'Home'      },
  { to: '/search',    icon: Search,     label: 'Search'    },
  { to: '/portfolio', icon: Layers,     label: 'Portfolio' },
  { to: '/pnl',       icon: TrendingUp, label: 'P&L'       },
  { to: '/profile',   icon: User,       label: 'Profile'   },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/30 safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 press-scale min-w-0',
                isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={cn('transition-transform duration-150', isActive && 'scale-110')}
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
