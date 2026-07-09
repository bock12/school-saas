'use client';

import { CreditCard, CheckCircle2, AlertTriangle, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';

const mockSubscriptions = [
  { id: 'sub1', tenant: 'Greenwood Academy', plan: 'Professional', mrr: 79, billing: 'Monthly', status: 'active', next_billing: '2026-08-15' },
  { id: 'sub2', tenant: 'Sunrise International', plan: 'Enterprise', mrr: 199, billing: 'Annual', status: 'active', next_billing: '2027-02-15' },
  { id: 'sub3', tenant: 'Oakwood Learning', plan: 'Professional', mrr: 79, billing: 'Monthly', status: 'past_due', next_billing: '2026-07-28' },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6 max-w-[1200px] animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-[hsl(var(--accent))]" />
            Tenant Subscriptions
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            Manage billing, pricing tiers, and active tenant subscriptions.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--text-primary))] text-[hsl(var(--bg-primary))] text-sm font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Create Custom Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total MRR', val: '$248.5k', icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { title: 'Active Subscriptions', val: '412', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Past Due', val: '14', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map(stat => (
          <div key={stat.title} className="glass-card p-5 border border-[hsl(var(--border))] rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{stat.title}</p>
              <p className="text-xl font-black text-[hsl(var(--text-primary))]">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {['Tenant', 'Plan', 'MRR', 'Billing Cycle', 'Next Billing', 'Status', ''].map(h => (
                <th key={h} className="text-left font-bold text-[hsl(var(--text-tertiary))] text-xs uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSubscriptions.map(sub => (
              <tr key={sub.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                <td className="px-5 py-4 font-bold text-[hsl(var(--text-primary))]">{sub.tenant}</td>
                <td className="px-5 py-4 text-[hsl(var(--text-secondary))]">{sub.plan}</td>
                <td className="px-5 py-4 font-bold text-[hsl(var(--text-primary))]">${sub.mrr}</td>
                <td className="px-5 py-4 text-[hsl(var(--text-secondary))]">{sub.billing}</td>
                <td className="px-5 py-4 text-[hsl(var(--text-tertiary))]">{new Date(sub.next_billing).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${
                    sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="p-1.5 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] transition-colors" title="Sync Billing">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
