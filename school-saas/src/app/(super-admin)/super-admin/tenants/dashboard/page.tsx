'use client';

import {
  School, Users, DollarSign, TrendingUp, AlertTriangle, 
  Database, Activity, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';

export default function TenantDashboardPage() {
  return (
    <div className="space-y-6 max-w-[1400px] animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))] flex items-center gap-2">
            Tenant Lifecycle Dashboard
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            Monitor overall tenant growth, platform adoption, and business health.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Registered Schools', val: '542', trend: '+12 this month', trendUp: true, icon: School },
          { title: 'Platform MRR', val: '$248.5k', trend: '+4.2% MRR', trendUp: true, icon: DollarSign },
          { title: 'Total End Users', val: '1.24M', trend: 'Active across platform', trendUp: true, icon: Users },
          { title: 'Risk / Suspended', val: '18', trend: 'Needs review', trendUp: false, icon: AlertTriangle }
        ].map(kpi => (
          <div key={kpi.title} className="glass-card p-5 border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <kpi.icon className="w-16 h-16 text-[hsl(var(--accent))]" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{kpi.title}</span>
              <div className={`p-1.5 rounded-lg ${kpi.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {kpi.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              </div>
            </div>
            <p className="text-2xl font-black text-[hsl(var(--text-primary))] relative z-10">{kpi.val}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 font-medium relative z-10">{kpi.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Tenant Acquisition & MRR Growth</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">New schools onboarded and recurring revenue over 6 months.</p>
            </div>
            <select className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 text-xs text-[hsl(var(--text-secondary))]">
              <option>Last 6 Months</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
          
          <div className="h-64 w-full relative pt-2 border-b border-[hsl(var(--border)/0.5)]">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tenantGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="50" x2="500" y2="50" stroke="hsl(var(--border)/0.3)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="hsl(var(--border)/0.3)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="hsl(var(--border)/0.3)" strokeWidth="1" strokeDasharray="4" />
              <path d="M 0 170 Q 125 150 250 110 T 500 40 L 500 200 L 0 200 Z" fill="url(#tenantGrad)" />
              <path d="M 0 170 Q 125 150 250 110 T 500 40" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" />
              
              <circle cx="0" cy="170" r="4" fill="hsl(var(--bg-secondary))" stroke="hsl(var(--accent))" strokeWidth="2" />
              <circle cx="125" cy="150" r="4" fill="hsl(var(--bg-secondary))" stroke="hsl(var(--accent))" strokeWidth="2" />
              <circle cx="250" cy="110" r="4" fill="hsl(var(--bg-secondary))" stroke="hsl(var(--accent))" strokeWidth="2" />
              <circle cx="375" cy="80" r="4" fill="hsl(var(--bg-secondary))" stroke="hsl(var(--accent))" strokeWidth="2" />
              <circle cx="500" cy="40" r="4" fill="hsl(var(--bg-secondary))" stroke="hsl(var(--accent))" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[hsl(var(--text-tertiary))] pt-3 transform translate-y-full">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May (Current)</span>
            </div>
          </div>
        </div>

        {/* Recent Provisioning Activity */}
        <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[hsl(var(--accent))]" />
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Recent Onboardings</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { school: 'Global Tech Academy', time: '2 hours ago', status: 'active' },
              { school: 'Summit International', time: '5 hours ago', status: 'trial' },
              { school: 'Westside High', time: '1 day ago', status: 'trial' },
              { school: 'Beacon Prep', time: '2 days ago', status: 'active' },
              { school: 'Northstar School', time: '3 days ago', status: 'pending' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{activity.school}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </p>
                </div>
                <StatusBadge status={activity.status as any} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
