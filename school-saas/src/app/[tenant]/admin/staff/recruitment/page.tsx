'use client';

import { useState } from 'react';
import { Briefcase, Search, Plus, Calendar, Edit2, Users } from 'lucide-react';

const mockVacancies = [
  { id: '1', title: 'Mathematics Teacher', department: 'Mathematics Department', applicants: 12, posted: 'Jun 10, 2026', status: 'Active' },
  { id: '2', title: 'Chemistry Teacher', department: 'Science & Chemistry Department', applicants: 8, posted: 'Jun 15, 2026', status: 'Active' },
  { id: '3', title: 'Bursar', department: 'Finance Department', applicants: 14, posted: 'May 20, 2026', status: 'Closed' }
];

export default function RecruitmentPage() {
  const [search, setSearch] = useState('');

  const filtered = mockVacancies.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Recruitment Center</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Publish job vacancies, monitor candidate pipelines, and tracking screening states.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Vacancy
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search active listings..."
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
                {['Job Title', 'Department', 'Applicants Count', 'Posted Date', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{v.title}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{v.department}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {v.applicants} applicants</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {v.posted}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      v.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-xs text-[hsl(var(--accent))] font-semibold hover:underline flex items-center gap-1 ml-auto">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
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
