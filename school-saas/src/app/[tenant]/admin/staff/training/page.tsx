'use client';

import { useState } from 'react';
import { Award, Plus, Calendar, CheckCircle2 } from 'lucide-react';

const mockTrainings = [
  { id: '1', title: 'Mathematics Curriculum Guidelines', date: 'Jul 10, 2026', host: 'National Board of Education', status: 'Completed' },
  { id: '2', title: 'Smart Board Digital Integration Workshop', date: 'Jul 22, 2026', host: 'EdTech Labs', status: 'Upcoming' }
];

export default function TrainingPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Professional Training &amp; Workshops</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review upcoming development seminars, curriculum training sessions, and track certification statuses.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Schedule Training
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockTrainings.map(t => (
          <div key={t.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{t.title}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Organized by: <span className="font-semibold text-[hsl(var(--text-secondary))]">{t.host}</span></p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                t.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
              }`}>{t.status}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Scheduled: {t.date}</span>
              {t.status === 'Completed' && (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Certificate Logged</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
