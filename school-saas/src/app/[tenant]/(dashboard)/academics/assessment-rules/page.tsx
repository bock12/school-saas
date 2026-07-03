'use client';

import { useState } from 'react';
import { ClipboardList, Plus, Percent } from 'lucide-react';

const mockAssessmentRules = [
  { id: '1', name: 'Standard Grade 10-12 Assessment Scale', assignments: 20, project: 10, ca: 30, finalExam: 40, activeClassLevels: ['SS1', 'SS2', 'SS3'] },
  { id: '2', name: 'Junior Secondary Assessment Model', assignments: 30, project: 20, ca: 20, finalExam: 30, activeClassLevels: ['JSS1', 'JSS2', 'JSS3'] }
];

export default function AssessmentRulesPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Assessment Weighting Rules</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure automated final grade calculation weightings from continuous assignments, projects, and final exams.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Define Assessment Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAssessmentRules.map(rule => (
          <div key={rule.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{rule.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Assignments</span>
                <p className="font-bold text-[hsl(var(--text-primary))] mt-1 flex items-center justify-center"><Percent className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{rule.assignments}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Projects</span>
                <p className="font-bold text-[hsl(var(--text-primary))] mt-1 flex items-center justify-center"><Percent className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{rule.project}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">CA Tests</span>
                <p className="font-bold text-[hsl(var(--text-primary))] mt-1 flex items-center justify-center"><Percent className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{rule.ca}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Final Exam</span>
                <p className="font-bold text-[hsl(var(--text-primary))] mt-1 flex items-center justify-center"><Percent className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{rule.finalExam}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 text-xs text-[hsl(var(--text-secondary))]">
              <span className="font-semibold text-[hsl(var(--text-primary))] block">Applicable Grade Levels:</span>
              <div className="flex gap-1 flex-wrap">
                {rule.activeClassLevels.map(cls => (
                  <span key={cls} className="px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[10px] text-[hsl(var(--text-tertiary))] font-medium">{cls}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
