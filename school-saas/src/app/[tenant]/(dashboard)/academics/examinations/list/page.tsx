'use client';

import { useState } from 'react';
import { FlaskConical, Plus, Search, Calendar } from 'lucide-react';

const mockExamsRegistry = [
  { id: '1', name: 'First Term Final Examinations', year: '2026/2027', term: 'First Term', startDate: '2026-12-07', endDate: '2026-12-11', status: 'Active' },
  { id: '2', name: 'WASSCE Secondary Mock 1', year: '2026/2027', term: 'First Term', startDate: '2026-10-20', endDate: '2026-10-25', status: 'Draft' }
];

export default function ExaminationsListPage() {
  const [search, setSearch] = useState('');

  const filtered = mockExamsRegistry.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Examinations Session Registry</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Create examinations, specify eligible class stream levels, and set result release dates.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Examination
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search examinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(ex => (
          <div key={ex.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{ex.name}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                ex.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
              }`}>
                {ex.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-[hsl(var(--text-secondary))]">
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Session / Term</span>
                <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{ex.year} • {ex.term}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Timeline Window</span>
                <p className="font-semibold text-[hsl(var(--text-primary))] mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />{ex.startDate} to {ex.endDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
