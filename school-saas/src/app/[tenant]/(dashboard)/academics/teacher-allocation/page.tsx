'use client';

import { useState } from 'react';
import { UsersRound, Plus, BarChart3 } from 'lucide-react';

const mockAllocations = [
  { id: '1', name: 'John Doe', dept: 'Science & Math', subjectsAllocated: ['Mathematics - SS2 Science', 'Further Mathematics - SS3'], weeklyPeriods: 18, status: 'Target Load' },
  { id: '2', name: 'Rachel Johnson', dept: 'Science & Math', subjectsAllocated: ['Chemistry - SS1 Arts', 'Biology - SS1 Science'], weeklyPeriods: 16, status: 'Target Load' },
  { id: '3', name: 'Emeka Okafor', dept: 'Commercial', subjectsAllocated: ['Economics - SS3'], weeklyPeriods: 10, status: 'Underallocated' }
];

export default function TeacherAllocationPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Teacher Workload Allocation</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review weekly period assignments, departments workload balances, and avoid teacher overallocation.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Allocate Workload
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAllocations.map(alloc => (
          <div key={alloc.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-start justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{alloc.name}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Dept: {alloc.dept}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                alloc.status === 'Target Load' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {alloc.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Allocated Courses:</span>
              <div className="flex flex-wrap gap-1">
                {alloc.subjectsAllocated.map(sub => (
                  <span key={sub} className="px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[10px] text-[hsl(var(--text-secondary))] font-medium">{sub}</span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[hsl(var(--border)/0.5)] flex items-center justify-between text-xs text-[hsl(var(--text-secondary))]">
              <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-[hsl(var(--accent))]" /> Workload Volume:</span>
              <span className="font-bold text-[hsl(var(--text-primary))]">{alloc.weeklyPeriods} periods/week</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
