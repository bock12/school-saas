import React from 'react';
import { AlertTriangle, AlertCircle, Info, XCircle, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useDashboardAlerts } from '../hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';

type Severity = 'critical' | 'warning' | 'info';

const severityConfig: Record<Severity, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
  label: string;
}> = {
  critical: {
    icon: XCircle,
    bg: 'bg-red-500/8',
    border: 'border-red-500/20',
    iconColor: 'text-red-500',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500/8',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-500',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    label: 'Info',
  },
};

export function AlertsPanel() {
  const { data: alerts, isLoading, isError } = useDashboardAlerts();
  const criticalCount = alerts?.filter(a => a.severity === 'critical').length ?? 0;

  return (
    <div className="glass-card p-5 border border-[hsl(var(--border))] rounded-2xl flex flex-col flex-1 min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider">
            System Alerts
          </h3>
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {criticalCount} Critical
            </span>
          )}
        </div>
        <button className="flex items-center gap-1 text-[11px] text-[hsl(var(--accent))] hover:underline font-semibold">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5 scrollbar-none">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-[72px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] animate-pulse" />
          ))
        ) : isError ? (
          <div className="flex items-center gap-2 text-sm text-red-500 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> Failed to load alerts.
          </div>
        ) : !alerts || alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="p-3 rounded-full bg-emerald-500/10">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">All Systems Operational</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">No active alerts at this time.</p>
          </div>
        ) : (
          alerts.map(alert => {
            const config = severityConfig[alert.severity as Severity] ?? severityConfig.info;
            const SeverityIcon = config.icon;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg} ${config.border} group`}
              >
                <SeverityIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-[hsl(var(--text-primary))] leading-tight">{alert.title}</h4>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] flex-shrink-0 whitespace-nowrap">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5 leading-relaxed">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button className="text-[10px] font-bold text-[hsl(var(--accent))] hover:underline">
                      View Details
                    </button>
                    <button className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] flex items-center gap-0.5">
                      <X className="w-2.5 h-2.5" /> Dismiss
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
