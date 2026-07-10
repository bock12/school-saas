import React from 'react';
import { Plus, Megaphone, Terminal, UserPlus, Settings, FileText, ArrowRight } from 'lucide-react';
import { QuickAction } from '../types/dashboard';

const actions: (QuickAction & { description: string })[] = [
  { id: '1', label: 'Provision Tenant', description: 'Onboard a new school', icon: Plus, color: 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20' },
  { id: '2', label: 'Broadcast', description: 'Send a platform-wide message', icon: Megaphone, color: 'text-blue-500 bg-blue-500/10 ring-blue-500/20' },
  { id: '3', label: 'View Logs', description: 'Inspect system logs', icon: Terminal, color: 'text-purple-500 bg-purple-500/10 ring-purple-500/20' },
  { id: '4', label: 'Invite Admin', description: 'Add a super-admin user', icon: UserPlus, color: 'text-orange-500 bg-orange-500/10 ring-orange-500/20' },
  { id: '5', label: 'Settings', description: 'Global platform config', icon: Settings, color: 'text-slate-400 bg-slate-500/10 ring-slate-500/20' },
  { id: '6', label: 'Run Report', description: 'Export analytics & CSV', icon: FileText, color: 'text-indigo-500 bg-indigo-500/10 ring-indigo-500/20' },
];

export function QuickActions() {
  return (
    <div className="glass-card p-5 border border-[hsl(var(--border))] rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider">
          Quick Actions
        </h3>
        <button className="flex items-center gap-1 text-[11px] text-[hsl(var(--accent))] hover:underline font-semibold">
          All actions <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Horizontal scroll strip on mobile, 2-col grid on larger screens */}
      <div className="flex sm:grid sm:grid-cols-2 gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {actions.map(action => (
          <button
            key={action.id}
            className="flex-shrink-0 w-36 sm:w-auto flex flex-row sm:flex-col items-center sm:items-start gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] 
              hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--bg-tertiary))] hover:shadow-sm
              transition-all duration-150 group text-left"
          >
            <div className={`p-2 rounded-lg ring-1 flex-shrink-0 ${action.color} group-hover:scale-105 transition-transform duration-150`}>
              <action.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{action.label}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] leading-tight mt-0.5 hidden sm:block">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
