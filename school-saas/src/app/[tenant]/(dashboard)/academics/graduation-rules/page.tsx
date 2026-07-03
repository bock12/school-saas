'use client';

import { useState } from 'react';
import { GraduationCap, Plus, CheckCircle } from 'lucide-react';

const mockGradRules = [
  { id: '1', name: 'High School Graduation Criteria', credits: 24, requiredDepts: ['Science', 'Arts', 'Languages'], feeClearance: true },
  { id: '2', name: 'Vocational Cert Criteria', credits: 16, requiredDepts: ['Vocational'], feeClearance: false }
];

export default function GraduationRulesPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Graduation Requirements</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure credit weightings, compulsory department groups, and financial clearance conditions before graduation.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Define Graduation Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockGradRules.map(rule => (
          <div key={rule.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{rule.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-1">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Credits Required</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">&ge; {rule.credits} Credits</p>
              </div>
              <div className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-1">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Finance Clearance Required</span>
                <p className="font-bold text-[hsl(var(--text-primary))]">{rule.feeClearance ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border)/0.5)] text-xs text-[hsl(var(--text-secondary))]">
              <span className="font-semibold text-[hsl(var(--text-primary))] block">Required Subjects Departments:</span>
              <div className="flex gap-1 flex-wrap">
                {rule.requiredDepts.map(dept => (
                  <span key={dept} className="px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[10px] text-[hsl(var(--text-tertiary))] font-medium">{dept}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
