'use client';

import { useState } from 'react';
import { Briefcase, Search, Plus, Calendar, Edit2, Users, ArrowUpRight, Building, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { HCMHeader } from '../_components/hcm-header';

const mockVacancies = [
  { id: '1', title: 'Mathematics Teacher', department: 'Mathematics Department', applicants: 12, posted: 'Jun 10, 2026', status: 'Active', type: 'Full-Time', location: 'Main Campus' },
  { id: '2', title: 'Chemistry Teacher', department: 'Science & Chemistry Department', applicants: 8, posted: 'Jun 15, 2026', status: 'Active', type: 'Full-Time', location: 'Science Wing' },
  { id: '3', title: 'Senior Bursar', department: 'Finance Department', applicants: 14, posted: 'May 20, 2026', status: 'Closed', type: 'Full-Time', location: 'Administration Block' },
  { id: '4', title: 'Assistant Librarian', department: 'Library & Media', applicants: 6, posted: 'Jul 01, 2026', status: 'Active', type: 'Part-Time', location: 'Main Library' },
];

export default function RecruitmentPage() {
  const [search, setSearch] = useState('');

  const filtered = mockVacancies.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.department.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = mockVacancies.filter(v => v.status === 'Active').length;

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Recruitment & Job Openings"
        subtitle="Manage published job openings, candidate screening pipelines, interview stages, and onboarding offers."
        badge={`${activeCount} Active Vacancies`}
        actionButton={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/staff/applicants"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold transition-colors"
            >
              <Users className="w-4 h-4 text-[hsl(var(--accent))]" />
              <span>View Candidates</span>
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Vacancy</span>
            </button>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search job vacancies by title, department, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Vacancy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map(v => (
          <div
            key={v.id}
            className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.5)] transition-all duration-300 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[hsl(var(--border))]">
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{v.title}</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> {v.department}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  v.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20'
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[hsl(var(--text-secondary))] flex-wrap">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> <strong>{v.applicants}</strong> applicants</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> Posted {v.posted}</span>
                <span>•</span>
                <span>{v.type}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
              <span className="text-xs text-[hsl(var(--text-tertiary))]">{v.location}</span>
              <Link
                href="/admin/staff/applicants"
                className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--accent))] hover:underline"
              >
                Review Applicants ({v.applicants}) <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
