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
      className={cn('fixed top-0 left-0 right-0 z-40 safe-top', className)}
      style={{ background: 'rgba(10,14,10,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1e2e1e' }}
    >
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-3 h-14">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-0.5 text-[#00cc44] font-medium press-scale -ml-1"
          >
            <ChevronLeft size={22} strokeWidth={2} />
            <span className="text-[15px]">Back</span>
          </button>
        )}

        <div className={cn('flex-1', back ? 'text-center' : '')}>
          {large ? (
            <h1 className="text-[26px] font-bold tracking-tight leading-tight text-[#e8f5e8]">{title}</h1>
          ) : (
            <h1 className="text-[16px] font-semibold tracking-tight text-[#e8f5e8]">{title}</h1>
          )}
          {subtitle && (
            <p className="text-[11px] text-[#4a5e4a] leading-none mt-0.5">{subtitle}</p>
          )}
        </div>

        {right && <div className="ml-auto">{right}</div>}
      </div>
    </header>
  );
}
