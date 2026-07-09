'use client';

import { HardDrive, Search, AlertTriangle, Download, Server, CloudOff } from 'lucide-react';
import { useState } from 'react';

const mockStorage = [
  { id: '1', tenant: 'Greenwood Academy', used: 45.2, quota: 100, files: 12450, status: 'healthy' },
  { id: '2', tenant: 'Sunrise International', used: 198.5, quota: 200, files: 45200, status: 'warning' },
  { id: '3', tenant: 'Oakwood Learning', used: 24.1, quota: 25, files: 8900, status: 'critical' },
  { id: '4', tenant: 'Maple Ridge', used: 2.4, quota: 10, files: 1200, status: 'healthy' },
];

export default function StoragePage() {
  const [search, setSearch] = useState('');

  const filtered = mockStorage.filter(s => s.tenant.toLowerCase().includes(search.toLowerCase()));

  const totalUsed = mockStorage.reduce((acc, curr) => acc + curr.used, 0);
  const totalQuota = mockStorage.reduce((acc, curr) => acc + curr.quota, 0);

  return (
    <div className="space-y-6 max-w-[1200px] animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2">
            <HardDrive className="w-7 h-7 text-[hsl(var(--accent))]" />
            Storage Management
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            Monitor tenant S3 bucket usage, quotas, and automated backups.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold hover:bg-[hsl(var(--bg-elevated))] transition-colors">
          <Download className="w-4 h-4" /> Trigger Global Backup
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 border border-[hsl(var(--border))] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Total Platform Storage</p>
            <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{totalUsed.toFixed(1)} GB</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">of {totalQuota} GB allocated</p>
          </div>
        </div>
        
        <div className="md:col-span-2 glass-card p-6 border border-[hsl(var(--border))] rounded-2xl">
          <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] mb-3">Global Usage Distribution</h3>
          <div className="h-4 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden flex">
            <div className="h-full bg-[hsl(var(--accent))]" style={{ width: `${(totalUsed / totalQuota) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[hsl(var(--text-tertiary))] mt-2 font-mono">
            <span>0 GB</span>
            <span>{((totalUsed / totalQuota) * 100).toFixed(1)}% Used</span>
            <span>{totalQuota} GB</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input 
            type="text" 
            placeholder="Search tenant storage..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg pl-9 pr-4 py-2 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {['Tenant', 'Used Storage', 'Total Quota', 'Utilization', 'Files Count', 'Status'].map(h => (
                <th key={h} className="text-left font-bold text-[hsl(var(--text-tertiary))] text-xs uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const util = (s.used / s.quota) * 100;
              return (
                <tr key={s.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-4 font-bold text-[hsl(var(--text-primary))]">{s.tenant}</td>
                  <td className="px-5 py-4 text-[hsl(var(--text-secondary))]">{s.used} GB</td>
                  <td className="px-5 py-4 text-[hsl(var(--text-secondary))]">{s.quota} GB</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${util > 90 ? 'bg-rose-500' : util > 75 ? 'bg-amber-500' : 'bg-[hsl(var(--accent))]'}`} 
                          style={{ width: `${util}%` }} 
                        />
                      </div>
                      <span className="text-xs text-[hsl(var(--text-tertiary))]">{util.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[hsl(var(--text-secondary))] font-mono">{s.files.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${
                      s.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      s.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
