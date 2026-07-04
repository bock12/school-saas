'use client';

import { useState } from 'react';
import { BookOpen, Search, Eye } from 'lucide-react';

const mockGradebooks = [
  { subject: 'Mathematics', classLink: 'SS2 Science', stream: 'Science Stream', teacher: 'John Doe', completion: '80%', status: 'Active' },
  { subject: 'English Language', classLink: 'SS1 General', stream: 'General Stream', teacher: 'Ms. Williams', completion: '100%', status: 'Submitted' },
  { subject: 'Physics Mechanics', classLink: 'SS1 Arts', stream: 'Arts Stream', teacher: 'Dr. Mensah', completion: '50%', status: 'Active' }
];

export default function GradebooksPage() {
  const [search, setSearch] = useState('');

  const filtered = mockGradebooks.filter(g =>
    g.subject.toLowerCase().includes(search.toLowerCase()) ||
    g.teacher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Teacher Digital Gradebooks</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review live data entry completion rates, audit trail logs, and markbooks validation reports.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search gradebooks..."
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
                {['Subject Course', 'Class Level', 'Assigned Teacher', 'Completion Rate', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><BookOpen className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.subject}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.classLink} • {row.stream}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.teacher}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-[hsl(var(--accent))]" style={{ width: row.completion }} />
                      </div>
                      <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{row.completion}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      row.status === 'Submitted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-xs text-[hsl(var(--accent))] hover:underline flex items-center gap-1 ml-auto font-semibold">
                      <Eye className="w-3.5 h-3.5" /> View Gradebook
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
