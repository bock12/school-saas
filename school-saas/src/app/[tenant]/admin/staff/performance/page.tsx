'use client';

import { useState } from 'react';
import { BarChart3, Search, Plus, Award, Star, TrendingUp, Calendar, UserCheck } from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockAppraisals = [
  { id: '1', name: 'John Doe', position: 'Head of Mathematics', dept: 'Mathematics', score: '94%', rating: 'Exceeds Expectations', date: 'May 14, 2026', reviewer: 'Principal Sarah Jenkins', cycle: 'Annual 2025/2026' },
  { id: '2', name: 'Dr. Raj Sharma', position: 'Physics Instructor', dept: 'Science', score: '96%', rating: 'Outstanding', date: 'May 10, 2026', reviewer: 'Principal Sarah Jenkins', cycle: 'Annual 2025/2026' },
  { id: '3', name: 'Benjamin Asante', position: 'Senior Accountant', dept: 'Finance', score: '90%', rating: 'Exceeds Expectations', date: 'Apr 22, 2026', reviewer: 'Vice Principal Mark Osei', cycle: 'Annual 2025/2026' },
  { id: '4', name: 'Mrs. Hannah Cole', position: 'English Literature Lead', dept: 'Languages', score: '92%', rating: 'Exceeds Expectations', date: 'May 02, 2026', reviewer: 'Principal Sarah Jenkins', cycle: 'Annual 2025/2026' },
];

export default function PerformancePage() {
  const [search, setSearch] = useState('');

  const filtered = mockAppraisals.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.position.toLowerCase().includes(search.toLowerCase()) ||
    a.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Performance & Appraisals"
        subtitle="Annual staff evaluations, classroom observation scores, promotion benchmarks, and professional feedback."
        badge="93.0% Average Workforce Score"
        actionButton={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Start Evaluation</span>
          </button>
        }
      />

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search performance records by staff name, department, or score..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div className="glass-card overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                {['Staff Member', 'Position & Dept', 'Score', 'Rating Band', 'Review Cycle', 'Reviewed By', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{row.name}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">
                    <p className="font-semibold text-[hsl(var(--text-primary))]">{row.position}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{row.dept}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-black text-[hsl(var(--accent))] whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" /> {row.score}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      {row.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{row.cycle}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{row.reviewer}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
