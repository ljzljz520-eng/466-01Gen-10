import {
  Thermometer,
  Package,
  Users,
  Clock,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import type { TemperatureZone, TenantContract } from '@/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface ZoneCardProps {
  zone: TemperatureZone;
  contracts: TenantContract[];
  onClick?: () => void;
  className?: string;
}

export function ZoneCard({ zone, contracts, onClick, className }: ZoneCardProps) {
  const usageRate = (zone.usedPallets / zone.totalPallets) * 100;
  const tempRange = zone.maxTemp - zone.minTemp;
  const tempPosition =
    ((zone.currentTemp - zone.minTemp) / tempRange) * 100;

  const activeContracts = contracts.filter((c) => c.status === 'active');

  const getTempColor = () => {
    if (zone.status === 'alert') return 'text-red-500';
    if (zone.status === 'warning') return 'text-amber-500';
    return 'text-cyan-500';
  };

  const getUsageColor = () => {
    if (usageRate >= 90) return 'from-red-500 to-red-400';
    if (usageRate >= 70) return 'from-amber-500 to-amber-400';
    return 'from-cyan-500 to-blue-500';
  };

  const getBorderColor = () => {
    if (zone.status === 'alert') return 'border-red-200 hover:border-red-300';
    if (zone.status === 'warning') return 'border-amber-200 hover:border-amber-300';
    return 'border-slate-200 hover:border-cyan-200';
  };

  const getGlowColor = () => {
    if (zone.status === 'alert') return 'shadow-red-100/50 hover:shadow-red-200/60';
    if (zone.status === 'warning') return 'shadow-amber-100/50 hover:shadow-amber-200/60';
    return 'shadow-slate-200/50 hover:shadow-cyan-100/60';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden',
        'shadow-lg hover:shadow-xl hover:-translate-y-1',
        getBorderColor(),
        getGlowColor(),
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {zone.name}
            </h3>
            <p className="text-xs text-slate-400">
              {zone.minTemp}°C ~ {zone.maxTemp}°C
            </p>
          </div>
          <StatusBadge status={zone.status} />
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-1">
            <Thermometer className={cn('w-5 h-5', getTempColor())} />
            <span
              className={cn(
                'text-3xl font-bold tracking-tight',
                getTempColor()
              )}
            >
              {zone.currentTemp.toFixed(1)}
            </span>
            <span className={cn('text-lg font-medium', getTempColor())}>°C</span>
          </div>

          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={cn(
                  'transition-all duration-700 ease-out',
                  usageRate >= 90
                    ? 'text-red-500'
                    : usageRate >= 70
                    ? 'text-amber-500'
                    : 'text-cyan-500'
                )}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                strokeDasharray={`${Math.min(usageRate, 100)}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600">
                {Math.round(usageRate)}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                托盘位使用
              </span>
              <span className="font-medium text-slate-700">
                {zone.usedPallets} / {zone.totalPallets}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                  getUsageColor()
                )}
                style={{ width: `${Math.min(usageRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeContracts.length} 个租户</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>最低 {zone.minLeaseDays} 天</span>
            </div>
          </div>
        </div>

        {zone.status === 'alert' && (
          <div className="mt-4 p-2.5 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-600">温度越界，请及时处理</span>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          可用 {zone.totalPallets - zone.usedPallets} 托
        </span>
        <div className="flex items-center gap-1 text-xs font-medium text-cyan-600">
          查看详情
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
