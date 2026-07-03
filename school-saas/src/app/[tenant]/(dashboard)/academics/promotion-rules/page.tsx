'use client';

import { useState } from 'react';
import { TrendingUp, Plus, CheckCircle2 } from 'lucide-react';

const mockPromotionRules = [
  { id: '1', name: 'Secondary Promotion Policy', minAverage: 50, minAttendance: 75, compulsoryPass: 'Mathematics, English', failLimit: 2 },
  { id: '2', name: 'Primary Promotion Policy', minAverage: 45, minAttendance: 80, compulsoryPass: 'English', failLimit: 1 }
];

export default function PromotionRulesPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Automated Promotion Rules</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure automated pass averages, minimum class attendance, and compulsory subjects requirements before promotion.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Define Promotion Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockPromotionRules.map(rule => (
          <div key={rule.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{rule.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-1">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Min Average Pass</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">&ge; {rule.minAverage}%</p>
              </div>
              <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-1">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Min Attendance Pass</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">&ge; {rule.minAttendance}%</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[hsl(var(--border)/0.5)] text-xs text-[hsl(var(--text-secondary))]">
              <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Compulsory Subjects: <span className="font-semibold text-[hsl(var(--text-primary))]">{rule.compulsoryPass}</span></p>
              <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-rose-400" /> Maximum Failed Subjects allowed: <span className="font-semibold text-[hsl(var(--text-primary))]">{rule.failLimit}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
