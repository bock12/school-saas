'use client';

import { useState } from 'react';
import { BarChart3, Plus, Shield } from 'lucide-react';

const mockGPASchemes = [
  { letter: 'A', range: '90% - 100%', gpa: 4.0, descriptor: 'Excellent' },
  { letter: 'B', range: '80% - 89%', gpa: 3.0, descriptor: 'Good' },
  { letter: 'C', range: '70% - 79%', gpa: 2.0, descriptor: 'Satisfactory' }
];

export default function GPAPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">GPA Weight Configurations</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Define percentage letters, GPA weights, and descriptive descriptors used across class transcripts.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add GPA Grade
        </button>
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
              {mockGPASchemes.map((g, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-bold text-[hsl(var(--text-primary))]">{g.letter}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{g.range}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-mono">{g.gpa.toFixed(1)} GPA</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {g.descriptor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
