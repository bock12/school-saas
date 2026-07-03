'use client';

import { useState } from 'react';
import { Scale, Search, ShieldAlert, Award, FileText, Plus } from 'lucide-react';

const mockIncidents = [
  { id: '1', name: 'Marcus Sterling', type: 'Warning', date: 'Jun 22, 2026', severity: 'Low', description: 'Late to morning assembly repeatedly', action: 'Verbal Warning issued by Form Teacher' },
  { id: '2', name: 'David Okafor', type: 'Incident', date: 'May 18, 2026', severity: 'Medium', description: 'Disrespectful behavior towards lab assistant', action: '1-day detention allocated' }
];

export default function DisciplinePage() {
  const [search, setSearch] = useState('');

  const filtered = mockIncidents.filter(inc =>
    inc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Behavior &amp; Discipline Logs</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Record incidents, suspensions, counseling logs, and behavioral awards.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Log Incident
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student Name', 'Type', 'Record Date', 'Severity Level', 'Description', 'Resolution Action'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">No behavior logs recorded.</td>
                </tr>
              ) : (
                filtered.map(inc => (
                  <tr key={inc.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{inc.name}</td>
                    <td className="px-5 py-3.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${inc.type === 'Warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{inc.type}</span></td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{inc.date}</td>
                    <td className="px-5 py-3.5"><span className={`text-[10px] font-bold ${inc.severity === 'Low' ? 'text-blue-400' : 'text-amber-400'}`}>{inc.severity}</span></td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] max-w-[200px] truncate" title={inc.description}>{inc.description}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{inc.action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
