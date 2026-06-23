'use client';

import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/constants';
import type { TenantStatus } from '@/types';

interface StatusBadgeProps {
  status: TenantStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClasses = STATUS_COLORS[status] || STATUS_COLORS['active'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClasses,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
}
