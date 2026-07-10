import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KpiMetric } from '../types/dashboard';

interface KpiCardProps {
  metric: KpiMetric;
  isLoading?: boolean;
}

// Maps trend direction to a left-border accent color
const accentMap = {
  up: 'border-l-emerald-500',
  down: 'border-l-rose-500',
  neutral: 'border-l-gray-400',
};

const trendBgMap = {
  up: 'bg-emerald-500/10 text-emerald-400',
  down: 'bg-rose-500/10 text-rose-400',
  neutral: 'bg-gray-500/10 text-gray-400',
};

const TrendIconMap = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

export function KpiCard({ metric, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="border-l-4 border-l-[hsl(var(--border))] glass-card p-5 border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] rounded-2xl animate-pulse">
        <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded w-2/3 mb-5" />
        <div className="h-8 bg-[hsl(var(--bg-tertiary))] rounded w-1/2 mb-3" />
        <div className="h-2 bg-[hsl(var(--bg-tertiary))] rounded w-1/3" />
      </div>
    );
  }

  const { title, value, trend, trendDirection, icon: Icon } = metric;
  const TrendIcon = TrendIconMap[trendDirection];

  return (
    <div
      className={`border-l-4 ${accentMap[trendDirection]} glass-card p-5 border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] rounded-2xl relative overflow-hidden group
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default`}
    >
      {/* Background icon watermark */}
      <div className="absolute top-0 right-0 p-3 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity pointer-events-none">
        <Icon className="w-16 h-16 text-[hsl(var(--accent))]" />
      </div>

      {/* Header row */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider leading-tight max-w-[70%]">
          {title}
        </span>
        <div className={`p-1.5 rounded-lg flex-shrink-0 ${trendBgMap[trendDirection]}`}>
          <TrendIcon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] relative z-10 tabular-nums">
        {value}
      </p>

      {/* Trend label */}
      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1.5 font-medium relative z-10">
        {trend}
      </p>
    </div>
  );
}
