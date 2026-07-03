'use client';

import { useState } from 'react';
import { GraduationCap, Plus, Search } from 'lucide-react';

const mockClasses = [
  { class_id: 'SS1', capacity: 40, currentEnrollment: 38, streams: ['Science', 'Arts', 'Commercial'], coordinator: 'Mr. Kamara' },
  { class_id: 'SS2', capacity: 40, currentEnrollment: 35, streams: ['Science', 'Arts'], coordinator: 'Mrs. Rachel Johnson' },
  { class_id: 'SS3', capacity: 40, currentEnrollment: 39, streams: ['Science', 'Commercial'], coordinator: 'Dr. Raj Sharma' }
];

export default function ClassesPage() {
  const [search, setSearch] = useState('');

  const filtered = mockClasses.filter(c =>
    c.class_id.toLowerCase().includes(search.toLowerCase()) ||
    c.coordinator.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Classes (Grade Levels) Registry</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure class grade categories, room capacities, stream groupings, and academic coordinators.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Class Level
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search classes..."
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
                {['Class Level', 'Coordinator / Supervisor', 'Capacity Limit', 'Streams List', 'Allocation Rate'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.class_id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[hsl(var(--accent))]" /> {c.class_id}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{c.coordinator}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{c.capacity} students limit</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {c.streams.map(str => (
                        <span key={str} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">{str}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-[hsl(var(--accent))]" style={{ width: `${(c.currentEnrollment / c.capacity) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{c.currentEnrollment}/{c.capacity}</span>
                    </div>
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
