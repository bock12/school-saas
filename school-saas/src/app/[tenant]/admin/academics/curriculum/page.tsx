'use client';

import { useState } from 'react';
import { BookOpen, Search, Download } from 'lucide-react';

const mockSyllabus = [
  { subject: 'Mathematics (MTH101)', week: 'Week 1', topic: 'Quadratic Equations Solving', outcome: 'Solve factoring and formula methods', resource: 'Algebra textbook Chapter 3' },
  { subject: 'Mathematics (MTH101)', week: 'Week 2', topic: 'Quadratic Equations Graphing', outcome: 'Plot parabolas on coordinates axis', resource: 'Graphing worksheets pack' }
];

export default function CurriculumPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Curriculum &amp; Syllabus Administration</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review weekly teaching schedules, topic timelines, learning outcomes, and assigned reference resources.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Subject Course', 'Timeline', 'Weekly Topic', 'Learning Outcome', 'Teaching Resources'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockSyllabus.map((row, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><BookOpen className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.subject}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-bold">{row.week}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.topic}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.outcome}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
