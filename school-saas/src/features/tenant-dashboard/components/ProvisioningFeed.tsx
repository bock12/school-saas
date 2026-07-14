import React from 'react';
import { Activity, GraduationCap, Clock, Eye, RotateCcw, ExternalLink } from 'lucide-react';
import { useProvisioningFeed } from '../hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';

// Plan tier badge config
const planConfig: Record<string, { label: string; classes: string }> = {
  Enterprise: { label: 'Enterprise', classes: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20' },
  Pro:        { label: 'Pro',        classes: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' },
  Starter:    { label: 'Starter',   classes: 'bg-teal-500/10 text-teal-400 ring-teal-500/20' },
  Trial:      { label: 'Trial',      classes: 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20' },
};

const statusConfig: Record<string, { dot: string; label: string }> = {
  active:       { dot: 'bg-emerald-500', label: 'Active' },
  trial:        { dot: 'bg-yellow-500',  label: 'Trial' },
  pending:      { dot: 'bg-orange-500',  label: 'Pending' },
  provisioning: { dot: 'bg-blue-500',    label: 'Provisioning' },
  suspended:    { dot: 'bg-red-500',     label: 'Suspended' },
};

const geoFlag: Record<string, string> = {
  'North America': '🇺🇸',
  'Europe': '🇪🇺',
  'Asia': '🌏',
  'Asia Pacific': '🌏',
  'Africa': '🌍',
  'South America': '🌎',
};

export function ProvisioningFeed() {
  const { data: feed, isLoading, isError } = useProvisioningFeed();

  return (
    <div className="glass-card p-5 border border-[hsl(var(--border))] rounded-2xl flex flex-col flex-1 min-h-[300px]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[hsl(var(--accent)/0.1)]">
            <Activity className="w-4 h-4 text-[hsl(var(--accent))]" />
          </div>
          <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider">
            Recent Onboardings
          </h3>
        </div>
        <button className="text-[11px] text-[hsl(var(--accent))] hover:underline font-semibold">
          View All
        </button>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5 scrollbar-none">
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-[76px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] animate-pulse" />
          ))
        ) : isError ? (
          <div className="text-sm text-red-500 text-center py-6">Failed to load feed.</div>
        ) : !feed || feed.length === 0 ? (
          <div className="text-sm text-[hsl(var(--text-tertiary))] text-center py-6">
            No recent onboardings.
          </div>
        ) : (
          feed.map((activity) => {
            const plan = planConfig[activity.plan] ?? { label: activity.plan, classes: 'bg-gray-500/10 text-gray-400 ring-gray-500/20' };
            const status = statusConfig[activity.status] ?? { dot: 'bg-gray-500', label: activity.status };
            const flag = geoFlag[activity.geography] ?? '🌐';

            return (
              <div
                key={activity.id}
                className="relative flex items-start gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all duration-150 group"
              >
                {/* School icon */}
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Top row: name + status dot */}
                  <div className="flex items-center gap-2 justify-between">
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">
                      {activity.schoolName}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      <span className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))]">{status.label}</span>
                    </div>
                  </div>

                  {/* Meta row: plan badge + geo + time */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                    <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold ring-1 ${plan.classes}`}>
                      {plan.label}
                    </span>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">
                      {flag} {activity.geography}
                    </span>
                    <span className="text-[hsl(var(--text-tertiary))] text-[10px]">·</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-[hsl(var(--text-tertiary))]">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Hover action buttons */}
                  <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-0.5 text-[10px] font-bold text-[hsl(var(--accent))] hover:underline">
                      <Eye className="w-2.5 h-2.5" /> View
                    </button>
                    <button className="flex items-center gap-0.5 text-[10px] font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
                      <RotateCcw className="w-2.5 h-2.5" /> Retry
                    </button>
                    <button className="flex items-center gap-0.5 text-[10px] font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
                      <ExternalLink className="w-2.5 h-2.5" /> Logs
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
