'use client';

import { useState } from 'react';
import { Heart, Stethoscope, Search, User, Eye, Plus } from 'lucide-react';

const mockMedicalLogs = [
  { id: '1', name: 'Amara Johnson', blood: 'O+', allergies: 'Peanuts, Penicillin', medications: 'Asthma Inhaler', lastVisit: 'Jun 12, 2026', logs: 'Administered Tylenol for headaches' },
  { id: '2', name: 'Michael Chen', blood: 'A-', allergies: 'None', medications: 'None', lastVisit: 'May 04, 2026', logs: 'Bandaged knee graze from playground fall' },
  { id: '3', name: 'Marcus Sterling', blood: 'B+', allergies: 'Dust Mites', medications: 'Claritin', lastVisit: 'Apr 22, 2026', logs: 'Allergic rhinitis consultation' }
];

export default function MedicalPage() {
  const [search, setSearch] = useState('');

  const filtered = mockMedicalLogs.filter(log =>
    log.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Medical &amp; Health Registry</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Monitor clinical logs, allergy parameters, physical records, and clinic logs.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Stethoscope className="w-4 h-4" /> Record Clinic Visit
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search health records..."
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
                {['Student Name', 'Blood Group', 'Allergen Rules', 'Medications', 'Last Clinic Visit', 'Treatment details'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{log.name}</td>
                  <td className="px-5 py-3.5"><span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{log.blood}</span></td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{log.allergies}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{log.medications}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{log.lastVisit}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] max-w-[200px] truncate" title={log.logs}>{log.logs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
