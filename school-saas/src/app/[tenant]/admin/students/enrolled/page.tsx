'use client';

import { useState } from 'react';
import { UserCheck, Search, Calendar, Globe, BookOpen } from 'lucide-react';

const demoEnrollments = [
  { id: '1', name: 'James Nguyen', year: '2025-2026', grade: 'Grade 9', stream: 'General Stream', status: 'Enrolled' },
  { id: '2', name: 'Marcus Sterling', year: '2025-2026', grade: 'Grade 8', stream: 'General Stream', status: 'Enrolled' },
  { id: '3', name: 'Chloe Dubois', year: '2026-2027', grade: 'Grade 8', stream: 'Science Stream', status: 'Active' },
  { id: '4', name: 'Sophia Kowalski', year: '2026-2027', grade: 'Grade 10', stream: 'Arts Stream', status: 'Active' }
];

export default function EnrolledStudentsPage() {
  const [yearFilter, setYearFilter] = useState('all');

  const filtered = yearFilter === 'all' 
    ? demoEnrollments 
    : demoEnrollments.filter(e => e.year === yearFilter);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Enrolled Students</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review active student academic year enrollments.</p>
      </div>

      <div className="glass-card p-4 flex gap-3">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
        >
          <option value="all">All Academic Years</option>
          <option value="2025-2026">Academic Year 2025-2026</option>
          <option value="2026-2027">Academic Year 2026-2027</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student Name', 'Academic Year', 'Grade', 'Stream', 'Enrollment Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {row.year}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.grade}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.stream}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      {row.status}
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
