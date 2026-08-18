'use client';

import { useState } from 'react';
import { Award, Plus, Calendar, CheckCircle2, Search, BookOpen, Building } from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockTrainings = [
  { id: '1', title: 'National Curriculum & Assessment Guidelines', date: 'Jul 10, 2026', host: 'National Ministry of Education', status: 'Completed', attendees: 34, location: 'Auditorium' },
  { id: '2', title: 'Interactive Smart Board & Digital Learning Integration', date: 'Jul 22, 2026', host: 'EdTech Academy', status: 'Upcoming', attendees: 48, location: 'Computer Lab 1' },
  { id: '3', title: 'First Aid, CPR & Emergency Campus Response', date: 'Aug 05, 2026', host: 'Red Cross Certified Unit', status: 'Upcoming', attendees: 84, location: 'Sports Complex' },
];

export default function TrainingPage() {
  const [search, setSearch] = useState('');

  const filtered = mockTrainings.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.host.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Professional Development & Training"
        subtitle="Continuous teacher development workshops, pedagogical certifications, and compliance training seminars."
        badge={`${mockTrainings.length} Scheduled Sessions`}
        actionButton={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Workshop</span>
          </button>
        }
      />

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search training programs by topic or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map(t => (
          <div key={t.id} className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.5)] transition-all duration-300 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{t.title}</h3>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  t.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Organized by: <span className="font-bold text-[hsl(var(--text-secondary))]">{t.host}</span>
              </p>
              <div className="pt-2 text-xs text-[hsl(var(--text-secondary))] space-y-1">
                <p>📍 Location: {t.location}</p>
                <p>👥 Expected Attendees: {t.attendees} staff</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> {t.date}</span>
              {t.status === 'Completed' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Certified</span>
              ) : (
                <button type="button" className="text-xs font-bold text-[hsl(var(--accent))] hover:underline">Enroll Staff</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
