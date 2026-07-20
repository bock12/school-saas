'use client';

import { useState } from 'react';
import { Users, Plus, Search } from 'lucide-react';

const mockStreams = [
  { id: '1', name: 'Science Stream', classLink: 'SS1', homeroomTeacher: 'Mr. Kamara', capacity: 20, activeCount: 18 },
  { id: '2', name: 'Arts Stream', classLink: 'SS1', homeroomTeacher: 'Ms. Linda Williams', capacity: 20, activeCount: 20 },
  { id: '3', name: 'Commercial Stream', classLink: 'SS1', homeroomTeacher: 'Mrs. Linh Nguyen', capacity: 20, activeCount: 19 }
];

export default function StreamsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockStreams.filter(str =>
    str.name.toLowerCase().includes(search.toLowerCase()) ||
    str.homeroomTeacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Class Streams &amp; Sections</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure class stream sections, room allocations, capacity limits, and assigned homeroom teachers.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Stream Section
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search streams..."
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
                {['Stream Section', 'Parent Class', 'Homeroom Teacher', 'Max capacity', 'Current Count', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(str => (
                <tr key={str.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><Users className="w-4 h-4 text-[hsl(var(--accent))]" /> {str.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))] font-bold">{str.classLink}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{str.homeroomTeacher}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{str.capacity} limit</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-[hsl(var(--text-primary))]">{str.activeCount} students</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      str.activeCount >= str.capacity ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {str.activeCount >= str.capacity ? 'Full' : 'Available'}
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
