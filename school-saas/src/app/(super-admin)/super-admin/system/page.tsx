'use client';

import { useState } from 'react';
import { Activity, Database, HardDrive, Clock, Shield, Megaphone, Plus, X, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { BROADCAST_TYPE_COLORS } from '@/lib/constants';

const healthMetrics = [
  { label: 'Database', status: 'healthy', latency: '12ms', icon: Database, detail: 'PostgreSQL 15.4' },
  { label: 'API Response', status: 'healthy', latency: '45ms', icon: Activity, detail: 'Average p95' },
  { label: 'Storage Used', status: 'warning', latency: '72%', icon: HardDrive, detail: '720 GB / 1 TB' },
  { label: 'Auth Service', status: 'healthy', latency: '8ms', icon: Shield, detail: 'Supabase Auth' },
];

const auditLogs = [
  { id: '1', action: 'tenant.created', actor: 'Super Admin', tenant: 'Summit Academy', time: '2026-06-23T10:30:00Z', ip: '192.168.1.1' },
  { id: '2', action: 'tenant.suspended', actor: 'Super Admin', tenant: 'Riverdale Academy', time: '2026-06-22T16:15:00Z', ip: '192.168.1.1' },
  { id: '3', action: 'plan.updated', actor: 'Super Admin', tenant: null, time: '2026-06-22T14:00:00Z', ip: '192.168.1.1' },
  { id: '4', action: 'user.login', actor: 'john@greenwood.edu', tenant: 'Greenwood Academy', time: '2026-06-22T09:30:00Z', ip: '10.0.0.5' },
  { id: '5', action: 'broadcast.created', actor: 'Super Admin', tenant: null, time: '2026-06-21T18:00:00Z', ip: '192.168.1.1' },
  { id: '6', action: 'tenant.plan_changed', actor: 'Super Admin', tenant: 'Sunrise International', time: '2026-06-21T11:45:00Z', ip: '192.168.1.1' },
];

const broadcasts = [
  { id: '1', title: 'Scheduled Maintenance', message: 'System upgrade on Sunday 2 AM UTC', type: 'maintenance', active: true, starts: '2026-06-23', ends: '2026-06-24' },
  { id: '2', title: 'New Feature: Report Cards', message: 'Automated PDF report card generation is now available', type: 'info', active: true, starts: '2026-06-20', ends: null },
];

export default function SystemPage() {
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  const filteredLogs = auditLogs.filter(l =>
    l.action.includes(logSearch.toLowerCase()) || (l.tenant && l.tenant.toLowerCase().includes(logSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">System Health & Logs</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Monitor platform health, audit trail, and broadcasts</p>
        </div>
        <button onClick={() => setShowBroadcast(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Megaphone className="w-4 h-4" /> New Broadcast
        </button>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {healthMetrics.map((m, i) => (
          <div key={m.label} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <m.icon className="w-5 h-5 text-[hsl(var(--text-tertiary))]" />
              <span className={`flex items-center gap-1.5 text-xs font-medium ${m.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {m.status === 'healthy' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {m.status}
              </span>
            </div>
            <p className="text-xl font-bold text-[hsl(var(--text-primary))]">{m.latency}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{m.label} — {m.detail}</p>
          </div>
        ))}
      </div>

      {/* Active Broadcasts */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Active Broadcasts</h2>
          </div>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {broadcasts.map(b => (
            <div key={b.id} className="px-5 py-4 flex items-center justify-between table-row-hover">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${BROADCAST_TYPE_COLORS[b.type] || ''}`}>{b.type}</span>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{b.title}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{b.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[hsl(var(--text-tertiary))]">{b.starts} → {b.ends || '∞'}</span>
                <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--danger)/0.1)] transition-colors"><X className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Audit Trail</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
            <input type="text" value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Filter logs..." className="w-full h-8 pl-8 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[hsl(var(--border))]">
              {['Action', 'Actor', 'Tenant', 'Timestamp', 'IP'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-2.5">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover">
                  <td className="px-5 py-2.5"><code className="text-xs font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded">{log.action}</code></td>
                  <td className="px-5 py-2.5 text-xs text-[hsl(var(--text-secondary))]">{log.actor}</td>
                  <td className="px-5 py-2.5 text-xs text-[hsl(var(--text-secondary))]">{log.tenant || '—'}</td>
                  <td className="px-5 py-2.5 text-xs text-[hsl(var(--text-tertiary))]"><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(log.time).toLocaleString()}</span></td>
                  <td className="px-5 py-2.5 text-xs text-[hsl(var(--text-tertiary))] font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBroadcast(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-2xl animate-fade-in-scale p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">New Broadcast</h2>
              <button onClick={() => setShowBroadcast(false)} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))]"><X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Title</label><input type="text" placeholder="e.g., Scheduled Maintenance" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Message</label><textarea placeholder="Describe the announcement..." rows={3} className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Type</label><select className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Info</option><option>Warning</option><option>Critical</option><option>Maintenance</option></select></div>
                <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">Ends At</label><input type="date" className="w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowBroadcast(false)} className="px-4 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:opacity-90">Send Broadcast</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
