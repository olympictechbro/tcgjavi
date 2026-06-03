import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/cn';

interface HeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  large?: boolean;
  className?: string;
}

export function Header({ title, subtitle, back, right, large, className }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 glass border-b border-white/20 safe-top',
        className
      )}
    >
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-3 h-14">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-[#007AFF] font-medium press-scale -ml-1"
          >
            <ChevronLeft size={22} strokeWidth={2} />
            <span className="text-[17px]">Back</span>
          </button>
        )}

        <div className={cn('flex-1', back ? 'text-center' : '')}>
          {large ? (
            <h1 className="text-[28px] font-bold tracking-tight leading-tight">{title}</h1>
          ) : (
            <h1 className="text-[17px] font-semibold tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-[12px] text-[#8E8E93] leading-none mt-0.5">{subtitle}</p>
          )}
        </div>

        {right && <div className="ml-auto">{right}</div>}
      </div>
    </header>
  );
}
