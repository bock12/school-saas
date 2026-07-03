'use client';

import { useState } from 'react';
import { Layers, Plus, Search, Users } from 'lucide-react';

const mockDepts = [
  { id: '1', name: 'Science & Math Department', head: 'Mr. John Doe', teachers: 8, subjectsCount: 14, workload: 'Target Load' },
  { id: '2', name: 'Arts & Humanities Department', head: 'Mrs. Rachel Johnson', teachers: 6, subjectsCount: 12, workload: 'Target Load' },
  { id: '3', name: 'Commercial & Business Dept', head: 'Mr. Emeka Okafor', teachers: 4, subjectsCount: 10, workload: 'Underallocated' }
];

export default function DepartmentsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockDepts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Academic Departments</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure subjects groupings, head of departments allocations, and workforce capacities.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Department
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search departments..."
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
                {['Department Name', 'Head of Department', 'Active Staff Count', 'Subjects count', 'Workload indicator'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{d.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{d.head}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{d.teachers} Teachers</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{d.subjectsCount} subjects</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      d.workload === 'Target Load' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {d.workload}
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
