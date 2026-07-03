'use client';

import { useState } from 'react';
import { Calendar, Plus, ToggleLeft } from 'lucide-react';

const mockYears = [
  { year: '2026/2027', status: 'Active', terms: ['First Term', 'Second Term', 'Third Term'], enrollment: 608 },
  { year: '2025/2026', status: 'Historical', terms: ['First Term', 'Second Term', 'Third Term'], enrollment: 580 }
];

export default function AcademicYearsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Academic Years Session Registry</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review active, planned, or archived academic year containers and student enrollment counts.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> New Academic Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockYears.map(item => (
          <div key={item.year} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{item.year} Session</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Terms Scheduled</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.terms.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[9px] text-[hsl(var(--text-secondary))]">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Registered Enrollment</span>
                <span className="text-sm font-bold text-[hsl(var(--text-primary))] block mt-1">{item.enrollment} Students</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
