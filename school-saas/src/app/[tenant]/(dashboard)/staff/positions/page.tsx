'use client';

import { useState } from 'react';
import { BookOpen, HelpCircle, Plus } from 'lucide-react';

const mockPositions = [
  { title: 'Mathematics Teacher', role: 'Teacher', count: 12, desc: 'Responsible for Grade 7-12 math courses instruction' },
  { title: 'Head of Mathematics', role: 'Teacher + HOD', count: 1, desc: 'Manages Mathematics department teachers and syllabus allocations' },
  { title: 'Accountant', role: 'Finance Officer', count: 2, desc: 'Performs school budget accounting and transaction processing' }
];

export default function PositionsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Position Catalog</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Separate structural employment **Positions** from application permissions **Roles**.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Position
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Position Title', 'Application Role (Permissions)', 'Staff Count', 'Description'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockPositions.map((pos, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{pos.title}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{pos.role}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{pos.count} active occupied</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] max-w-[300px] truncate" title={pos.desc}>{pos.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
