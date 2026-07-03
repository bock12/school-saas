import { cn } from '@/lib/utils';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  accentColor?: string;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  accentColor = 'hsl(var(--accent))',
  className,
  delay = 0,
}: StatCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div
      className={cn(
        'glass-card stat-card-gradient p-5 animate-fade-in',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              isPositive && 'bg-emerald-500/10 text-emerald-400',
              isNegative && 'bg-red-500/10 text-red-400',
              !isPositive && !isNegative && 'bg-zinc-500/10 text-zinc-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            <span>
              {isPositive ? '+' : ''}
              {trend}%
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">
          {value}
        </p>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">{title}</p>
        {(subtitle || trendLabel) && (
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
            {trendLabel || subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
