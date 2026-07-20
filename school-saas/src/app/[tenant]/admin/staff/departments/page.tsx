'use client';

import { useState } from 'react';
import { Layers, Plus, DollarSign, Users, Award } from 'lucide-react';

const mockDepts = [
  { id: '1', name: 'Mathematics Department', head: 'John Doe', staff: 12, budget: 14000, perf: '82%', subjects: ['Mathematics', 'Further Mathematics'], vacancies: 1 },
  { id: '2', name: 'Science & Chemistry Department', head: 'Grace Owusu', staff: 16, budget: 18500, perf: '85%', subjects: ['Chemistry', 'Physics', 'Biology'], vacancies: 2 }
];

export default function DepartmentsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Departmental Org Structure</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review department heads, budgets, assigned subjects, and open staff vacancies.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockDepts.map(dept => (
          <div key={dept.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-start justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{dept.name}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Head of Department: <span className="font-semibold text-[hsl(var(--text-secondary))]">{dept.head}</span></p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                Avg Perf: {dept.perf}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Active Staff</span>
                <p className="font-bold text-[hsl(var(--text-primary))] mt-0.5 flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />{dept.staff}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Annual Budget</span>
                <p className="font-bold text-emerald-400 mt-0.5 flex items-center justify-center"><DollarSign className="w-3.5 h-3.5" />{dept.budget}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Vacancies</span>
                <p className="font-bold text-rose-400 mt-0.5">{dept.vacancies}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 text-xs text-[hsl(var(--text-secondary))]">
              <p className="font-semibold text-[hsl(var(--text-primary))]">Subjects managed:</p>
              <div className="flex gap-1.5 flex-wrap">
                {dept.subjects.map(sub => (
                  <span key={sub} className="px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-medium">{sub}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
