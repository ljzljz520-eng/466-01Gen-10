import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'red' | 'violet';
  className?: string;
}

const colorConfig = {
  cyan: {
    bg: 'from-cyan-500 to-blue-600',
    light: 'bg-cyan-50',
    icon: 'text-cyan-500',
  },
  emerald: {
    bg: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50',
    icon: 'text-emerald-500',
  },
  amber: {
    bg: 'from-amber-500 to-orange-600',
    light: 'bg-amber-50',
    icon: 'text-amber-500',
  },
  red: {
    bg: 'from-red-500 to-rose-600',
    light: 'bg-red-50',
    icon: 'text-red-500',
  },
  violet: {
    bg: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50',
    icon: 'text-violet-500',
  },
};

export function StatsCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  color = 'cyan',
  className,
}: StatsCardProps) {
  const colors = colorConfig[color];

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-xl', colors.light)}>
          <div className={colors.icon}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              trend >= 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="mb-1">
        <span className="text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </span>
        {unit && <span className="text-sm text-slate-500 ml-1">{unit}</span>}
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      {trendLabel && (
        <p className="text-xs text-slate-400 mt-2">{trendLabel}</p>
      )}
    </div>
  );
}
