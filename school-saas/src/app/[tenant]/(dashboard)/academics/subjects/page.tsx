'use client';

import { useState } from 'react';
import { BookMarked, Search, Plus } from 'lucide-react';

const mockSubjects = [
  { code: 'MTH101', name: 'General Mathematics', dept: 'Science & Math', credits: 4, compulsory: 'Yes', period: '5/week' },
  { code: 'PHY101', name: 'Physics Mechanics', dept: 'Science & Math', credits: 4, compulsory: 'No', period: '4/week' },
  { code: 'ENG101', name: 'English Language arts', dept: 'Arts & Humanities', credits: 4, compulsory: 'Yes', period: '5/week' }
];

export default function SubjectsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockSubjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Subjects Catalog</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure subjects database codes, credits, and weekly period constraints.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Subject
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search subjects by name or code..."
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
                {['Subject Code', 'Subject Name', 'Department Group', 'Credits weighting', 'Compulsory status', 'Periods'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.code} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono font-semibold text-[hsl(var(--accent))]">{s.code}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{s.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{s.dept}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{s.credits} Credits</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      s.compulsory === 'Yes' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
                    }`}>
                      {s.compulsory === 'Yes' ? 'Compulsory' : 'Elective'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{s.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
