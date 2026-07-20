'use client';

import { useState } from 'react';
import { BarChart3, Search, Plus, Award } from 'lucide-react';

const mockAppraisals = [
  { id: '1', name: 'John Doe', position: 'Head of Mathematics', score: '94%', date: 'May 14, 2026', reviewer: 'Principal Sarah Jenkins' },
  { id: '2', name: 'Benjamin Asante', position: 'Accountant', score: '90%', date: 'Apr 22, 2026', reviewer: 'Vice Principal Mark Osei' }
];

export default function PerformancePage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Performance &amp; Appraisals</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Monitor annual staff appraisals, classroom observation reports, and promotion recommendations.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Start Evaluation
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Staff Member', 'Position', 'Evaluation Score', 'Review Date', 'Reviewer'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAppraisals.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.position}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-[hsl(var(--accent))] flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> {row.score}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{row.date}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.reviewer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
