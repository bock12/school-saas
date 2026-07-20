'use client';

import { useState } from 'react';
import { Layers, Plus, Percent } from 'lucide-react';

const mockCategories = [
  { id: '1', name: 'Continuous Assessment (CA)', weight: 30, maxScore: 30, passScore: 15, type: 'Quizzes & Assignments' },
  { id: '2', name: 'Practical Practicums', weight: 30, maxScore: 100, passScore: 50, type: 'Hands-on Lab tests' },
  { id: '3', name: 'Final Examination Paper', weight: 40, maxScore: 100, passScore: 40, type: 'Written examinations' }
];

export default function AssessmentCategoriesPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Assessment Categories</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure contribution percentages, passing requirements, and maximum score limits for final grades calculation.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCategories.map(cat => (
          <div key={cat.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{cat.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Weight</span>
                <p className="font-bold text-[hsl(var(--text-primary))] mt-1 flex items-center justify-center"><Percent className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{cat.weight}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Max Score</span>
                <p className="font-bold text-[hsl(var(--text-primary))] mt-1">{cat.maxScore} pts</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Passing Score</span>
                <p className="font-bold text-emerald-400 mt-1">{cat.passScore} pts</p>
              </div>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))] pt-2 border-t border-[hsl(var(--border)/0.5)]">
              Category Type: <span className="font-semibold text-[hsl(var(--text-primary))]">{cat.type}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
