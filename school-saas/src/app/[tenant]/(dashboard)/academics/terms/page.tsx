'use client';

import { useState } from 'react';
import { Clock, Plus, Calendar } from 'lucide-react';

const mockTerms = [
  { term: 'First Term', year: '2026/2027', start: '2026-09-01', end: '2026-12-18', midterm: 'Oct 15 - Oct 18', exams: 'Dec 07 - Dec 11', status: 'Active' },
  { term: 'Second Term', year: '2026/2027', start: '2027-01-05', end: '2027-04-02', midterm: 'Feb 18 - Feb 21', exams: 'Mar 22 - Mar 26', status: 'Planned' }
];

export default function AcademicTermsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Terms &amp; Semesters Schedules</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review term limits, midterm intervals, examination intervals, and active status.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Define New Term
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockTerms.map(t => (
          <div key={t.term} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[hsl(var(--accent))]" />
                <div>
                  <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{t.term}</h3>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Session: {t.year}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                t.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
              }`}>
                {t.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Term Duration</span>
                <p className="font-semibold text-[hsl(var(--text-secondary))] mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{t.start} to {t.end}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Midterm recess</span>
                <p className="font-semibold text-[hsl(var(--text-secondary))] mt-1">{t.midterm}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Examination Window</span>
                <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{t.exams}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
