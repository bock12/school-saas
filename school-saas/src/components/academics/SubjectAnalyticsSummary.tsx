'use client';

import React from 'react';
import { BookOpen, Layers, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { SubjectRecord } from '@/app/actions/subjects';

interface SubjectAnalyticsSummaryProps {
  subjects: SubjectRecord[];
  activeEnrollmentsCount?: number;
  unassignedOfferingsCount?: number;
}

export default function SubjectAnalyticsSummary({
  subjects,
  activeEnrollmentsCount = 0,
  unassignedOfferingsCount = 0
}: SubjectAnalyticsSummaryProps) {
  const activeSubjects = subjects.filter(s => s.is_active);
  const coreSubjects = activeSubjects.filter(s => !s.is_elective);
  const electives = activeSubjects.filter(s => s.is_elective);

  const categories = activeSubjects.reduce((acc, sub) => {
    const cat = sub.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card rounded-3xl p-5 border-l-4 border-l-[hsl(var(--accent))]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Active Subjects</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[hsl(var(--text-primary))]">{activeSubjects.length}</span>
              <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">Total</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {coreSubjects.length} Core
              </span>
              <span className="text-xs font-semibold text-violet-400 flex items-center gap-1">
                <Layers className="w-3 h-3" /> {electives.length} Elective
              </span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-[hsl(var(--accent)/0.1)]">
            <BookOpen className="w-5 h-5 text-[hsl(var(--accent))]" />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Top Category</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-[hsl(var(--text-primary))] line-clamp-1">{topCategory[0]}</span>
            </div>
            <p className="mt-3 text-xs font-medium text-[hsl(var(--text-secondary))]">
              {topCategory[1]} subjects in this category
            </p>
          </div>
          <div className="p-2 rounded-xl bg-[hsl(var(--bg-tertiary))]">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--text-tertiary))]" />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Student Enrollments</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[hsl(var(--text-primary))]">
                {activeEnrollmentsCount.toLocaleString()}
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-[hsl(var(--text-secondary))]">
              Active subject registrations
            </p>
          </div>
          <div className="p-2 rounded-xl bg-[hsl(var(--bg-tertiary))]">
            <Layers className="w-5 h-5 text-[hsl(var(--text-tertiary))]" />
          </div>
        </div>
      </div>

      <div className={`glass-card rounded-3xl p-5 ${unassignedOfferingsCount > 0 ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Allocation Status</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${unassignedOfferingsCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {unassignedOfferingsCount}
              </span>
              <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">Unassigned</span>
            </div>
            <p className={`mt-3 text-xs font-medium flex items-center gap-1.5 ${unassignedOfferingsCount > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>
              {unassignedOfferingsCount > 0 ? (
                <><AlertTriangle className="w-3.5 h-3.5" /> Classes need teachers</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5" /> All classes assigned</>
              )}
            </p>
          </div>
          <div className={`p-2 rounded-xl ${unassignedOfferingsCount > 0 ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
            <AlertTriangle className={`w-5 h-5 ${unassignedOfferingsCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
