'use client';

import { useState } from 'react';
import { Layers, Plus, Search } from 'lucide-react';

const mockCourseAllocations = [
  { id: '1', teacher: 'John Doe', subject: 'General Mathematics', classLink: 'SS2', stream: 'Science Stream', periods: 5 },
  { id: '2', teacher: 'Rachel Johnson', subject: 'Biology Mechanics', classLink: 'SS1', stream: 'Science Stream', periods: 4 },
  { id: '3', teacher: 'Emeka Okafor', subject: 'Economics Core', classLink: 'SS3', stream: 'Commercial Stream', periods: 5 }
];

export default function CourseAllocationPage() {
  const [search, setSearch] = useState('');

  const filtered = mockCourseAllocations.filter(c =>
    c.teacher.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Course Allocation Matrix</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review unified linkages between teacher, subject curriculum, class level stream, and weekly scheduling constraints.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> New Course Link
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search allocations..."
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
                {['Teacher Assigned', 'Subject Curriculum', 'Class Level', 'Assigned Stream', 'Periods/Week'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.teacher}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.subject}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-bold">{row.classLink}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.stream}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-[hsl(var(--text-primary))]">{row.periods} periods</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
