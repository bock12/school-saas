'use client';

import { FileText, Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';

const mockLogs = [
  { id: 'al-101', action: 'Tenant Provisioned', target: 'DreamDay Education Group', actor: 'superadmin@system.local', time: '10 mins ago', ip: '192.168.1.1' },
  { id: 'al-102', action: 'Subscription Updated', target: 'Greenwood Academy', actor: 'billing@system.local', time: '2 hours ago', ip: '192.168.1.5' },
  { id: 'al-103', action: 'Feature Module Toggled', target: 'Global: AI Assistant', actor: 'superadmin@system.local', time: '4 hours ago', ip: '192.168.1.1' },
  { id: 'al-104', action: 'Impersonation Session Started', target: 'Sunrise International', actor: 'support@system.local', time: '1 day ago', ip: '10.0.0.15' },
  { id: 'al-105', action: 'Tenant Suspended', target: 'Oakwood Learning', actor: 'billing@system.local', time: '2 days ago', ip: '192.168.1.5' },
];

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockLogs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.target.toLowerCase().includes(search.toLowerCase()) ||
    l.actor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1200px] animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2">
            <FileText className="w-7 h-7 text-[hsl(var(--accent))]" />
            Immutable Audit History
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            Cryptographically signed ledger of all critical platform and tenant lifecycle actions.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold hover:bg-[hsl(var(--bg-elevated))] transition-colors">
          <Download className="w-4 h-4" /> Export Ledger CSV
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input 
            type="text" 
            placeholder="Search actions, targets, or actors..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg pl-9 pr-4 py-2 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <select className="bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm text-[hsl(var(--text-secondary))] focus:outline-none">
            <option>All Actions</option>
            <option>Provisioning</option>
            <option>Security</option>
            <option>Billing</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]">
              {['Log ID', 'Action Taken', 'Target Entity', 'Actor', 'IP Address', 'Timestamp'].map(h => (
                <th key={h} className="text-left font-bold text-[hsl(var(--text-tertiary))] text-xs uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-[hsl(var(--text-tertiary))]">{log.id}</td>
                <td className="px-5 py-3 font-bold text-[hsl(var(--text-primary))]">{log.action}</td>
                <td className="px-5 py-3 text-[hsl(var(--text-secondary))]">{log.target}</td>
                <td className="px-5 py-3 text-[hsl(var(--text-secondary))] flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex items-center justify-center text-[10px] font-bold">
                    {log.actor[0].toUpperCase()}
                  </div>
                  {log.actor}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-[hsl(var(--text-tertiary))]">{log.ip}</td>
                <td className="px-5 py-3 text-xs text-[hsl(var(--text-secondary))]">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
