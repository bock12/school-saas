'use client';

import { useState } from 'react';
import { Award, Plus, Search } from 'lucide-react';

const mockOutcomes = [
  { subject: 'Mathematics (MTH101)', outcomes: [
    { code: 'MTH-LO-01', desc: 'Solve quadratic equations using standard formula method' },
    { code: 'MTH-LO-02', desc: 'Interpret graphic polynomial intersections coordinates' }
  ]},
  { subject: 'Physics (PHY101)', outcomes: [
    { code: 'PHY-LO-01', desc: 'Calculate velocity acceleration vectors products' }
  ]}
];

export default function LearningOutcomesPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Learning Outcomes &amp; Competencies</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure syllabus learning indicators later utilized by continuous assessments and report cards.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Learning Outcome
        </button>
      </div>

      <div className="space-y-4">
        {mockOutcomes.map((item, idx) => (
          <div key={idx} className="glass-card p-5 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2"><Award className="w-5 h-5 text-indigo-400" /> {item.subject}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.outcomes.map(out => (
                <div key={out.code} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]">{out.code}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed pt-1">{out.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
