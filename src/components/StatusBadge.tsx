import { cn } from '@/lib/utils';

type StatusType = 'normal' | 'warning' | 'alert' | 'active' | 'expired' | 'pending' | 'in-stock' | 'outbound';

const statusConfig: Record<StatusType, { label: string; className: string; dotColor: string }> = {
  normal: {
    label: '正常',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  warning: {
    label: '预警',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  alert: {
    label: '告警',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500 animate-pulse',
  },
  active: {
    label: '生效中',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  expired: {
    label: '已过期',
    className: 'bg-slate-50 text-slate-500 border-slate-200',
    dotColor: 'bg-slate-400',
  },
  pending: {
    label: '待生效',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  'in-stock': {
    label: '在库中',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dotColor: 'bg-cyan-500',
  },
  outbound: {
    label: '已出库',
    className: 'bg-slate-50 text-slate-500 border-slate-200',
    dotColor: 'bg-slate-400',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />}
      {config.label}
    </span>
  );
}
