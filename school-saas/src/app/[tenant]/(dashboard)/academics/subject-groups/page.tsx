'use client';

import { useState } from 'react';
import { LayoutGrid, Plus, Search } from 'lucide-react';

const mockGroups = [
  { id: '1', name: 'Science Electives', subjects: ['Agriculture Science', 'Computer Science', 'Further Mathematics'], minSelect: 1 },
  { id: '2', name: 'Vocational Electives', subjects: ['Technical Drawing', 'Fine Arts', 'Food & Nutrition'], minSelect: 1 }
];

export default function SubjectGroupsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Subject Groups (Electives Rules)</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure groups of elective subjects where students select options based on curriculum policy rules.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Subject Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockGroups.map(group => (
          <div key={group.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{group.name}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Min Electives: {group.minSelect}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Included Subjects:</span>
              <div className="flex flex-wrap gap-1.5">
                {group.subjects.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
