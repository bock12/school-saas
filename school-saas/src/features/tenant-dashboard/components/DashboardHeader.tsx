'use client';
import React, { useState } from 'react';
import { Filter, RefreshCw, ChevronDown } from 'lucide-react';

function HealthDot() {
  // In production this would come from a health check hook
  const status = 'healthy'; // 'healthy' | 'degraded' | 'critical'
  const colors = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-yellow-500',
    critical: 'bg-red-500',
  };
  const labels = {
    healthy: 'All Systems Operational',
    degraded: 'Partial Degradation',
    critical: 'Service Disruption',
  };
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
      <span className={`w-2 h-2 rounded-full ${colors[status]} relative flex`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-50`} />
      </span>
      <span className="hidden sm:inline">{labels[status]}</span>
    </div>
  );
}

interface FilterSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}
function FilterSelect({ options, value, onChange }: FilterSelectProps) {
  return (
    <div className="relative flex-shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-8 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg pl-3 pr-7 text-xs font-medium text-[hsl(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/0.5)] transition-colors hover:border-[hsl(var(--border-hover))]"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--text-tertiary))]" />
    </div>
  );
}

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [region, setRegion] = useState('all');
  const [plan, setPlan] = useState('all');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'na', label: 'North America' },
    { value: 'eu', label: 'Europe' },
    { value: 'apac', label: 'Asia Pacific' },
  ];

  const planOptions = [
    { value: 'all', label: 'All Plans' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'pro', label: 'Pro' },
    { value: 'starter', label: 'Starter' },
    { value: 'trial', label: 'Trial' },
  ];

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-[hsl(var(--border))]">
      {/* Top row: title + refresh */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[hsl(var(--text-primary))]">
              Tenant Lifecycle Dashboard
            </h1>
            <HealthDot />
          </div>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            Monitor tenant growth, platform adoption, and business health.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] text-xs font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border-hover))] transition-all"
          title="Refresh data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filter row — horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        <FilterSelect options={regionOptions} value={region} onChange={setRegion} />
        <FilterSelect options={planOptions} value={plan} onChange={setPlan} />
      </div>
    </div>
  );
}
