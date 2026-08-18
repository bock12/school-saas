'use client';

import { useState } from 'react';
import { Layers, Plus, DollarSign, Users, Award, Briefcase, Search, Building } from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockDepts = [
  { id: '1', name: 'Mathematics Department', head: 'John Doe', staff: 12, budget: 14000, perf: '82%', subjects: ['Mathematics', 'Further Mathematics', 'Calculus'], vacancies: 1 },
  { id: '2', name: 'Science & Chemistry Department', head: 'Grace Owusu', staff: 16, budget: 18500, perf: '85%', subjects: ['Chemistry', 'Physics', 'Biology', 'Integrated Science'], vacancies: 2 },
  { id: '3', name: 'Languages & Humanities', head: 'Mrs. Hannah Cole', staff: 14, budget: 12000, perf: '88%', subjects: ['English Literature', 'French', 'History'], vacancies: 0 },
  { id: '4', name: 'Administration & Operations', head: 'Mrs. Patricia Osei', staff: 18, budget: 24000, perf: '91%', subjects: ['Logistics', 'Records', 'Admissions Support'], vacancies: 1 },
];

export default function DepartmentsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockDepts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Departmental Org Structure"
        subtitle="Review academic and operational departments, appointed heads, annual operational budgets, and vacancies."
        badge={`${mockDepts.length} Active Departments`}
        actionButton={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        }
      />

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search departments by name or department chair..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map(dept => (
          <div key={dept.id} className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.5)] transition-all duration-300 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[hsl(var(--border))]">
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{dept.name}</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
                    Head of Department: <span className="font-bold text-[hsl(var(--text-secondary))]">{dept.head}</span>
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  Perf: {dept.perf}
                </span>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Staff</span>
                  <p className="font-black text-sm text-[hsl(var(--text-primary))] mt-0.5 flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> {dept.staff}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Budget</span>
                  <p className="font-black text-sm text-emerald-400 mt-0.5">
                    ${dept.budget.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Openings</span>
                  <p className={`font-black text-sm mt-0.5 ${dept.vacancies > 0 ? 'text-rose-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                    {dept.vacancies}
                  </p>
                </div>
              </div>

              {/* Subject Chips */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))] block">Disciplines &amp; Areas</span>
                <div className="flex gap-1.5 flex-wrap">
                  {dept.subjects.map(sub => (
                    <span key={sub} className="px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-xs font-semibold">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
