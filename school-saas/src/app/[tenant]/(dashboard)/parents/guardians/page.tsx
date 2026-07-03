'use client';

import { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

const mockGuardians = [
  { id: '3', name: 'Ms. Linda Williams', relation: 'Aunt', custody: 'Legal Custody', pickup: 'Authorized', medicalRights: 'Full Consent' },
  { id: '9', name: 'Mr. Arthur Pendelton', relation: 'Family Friend', custody: 'Temporary Guardian', pickup: 'Authorized', medicalRights: 'Hold Consent' }
];

export default function GuardiansPage() {
  const [search, setSearch] = useState('');

  const filtered = mockGuardians.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Legal Guardians Directory</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review legal authority, custody conditions, pickup clearances, and medical decision rights.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search guardians..."
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
                {['Guardian Name', 'Student Relation', 'Custody Status', 'Pickup Status', 'Medical Consent'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{g.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{g.relation}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{g.custody}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {g.pickup}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      g.medicalRights === 'Full Consent' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {g.medicalRights}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
