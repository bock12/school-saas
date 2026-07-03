'use client';

import { useState } from 'react';
import { BarChart3, Plus, Shield } from 'lucide-react';

const mockGradingSchemes = [
  { id: '1', name: 'West African Exam Scale (WAEC)', grades: [
    { letter: 'A1', range: '80% - 100%', gpa: 4.0, desc: 'Excellent' },
    { letter: 'B2', range: '70% - 79%', gpa: 3.5, desc: 'Very Good' },
    { letter: 'C6', range: '50% - 69%', gpa: 2.0, desc: 'Credit Pass' }
  ]},
  { id: '2', name: 'GPA 4.0 Scale System', grades: [
    { letter: 'A', range: '90% - 100%', gpa: 4.0, desc: 'Excellent' },
    { letter: 'B', range: '80% - 89%', gpa: 3.0, desc: 'Good' },
    { letter: 'C', range: '70% - 79%', gpa: 2.0, desc: 'Satisfactory' }
  ]}
];

export default function GradingSystemsPage() {
  const [activeScheme, setActiveScheme] = useState('1');

  const scheme = mockGradingSchemes.find(s => s.id === activeScheme) || mockGradingSchemes[0];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Grading Schemes &amp; GPAs</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure percentage letters, GPA weights, and descriptive descriptors used across different class levels.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Define Grading Scheme
        </button>
      </div>

      <div className="glass-card p-1 flex gap-1 w-fit">
        {mockGradingSchemes.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveScheme(s.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeScheme === s.id
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Letter Grade', 'Percentage Range', 'GPA Weighting', 'Qualitative Descriptor'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheme.grades.map((g, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-bold text-[hsl(var(--text-primary))]">{g.letter}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{g.range}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-mono">{g.gpa.toFixed(1)} GPA</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {g.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
