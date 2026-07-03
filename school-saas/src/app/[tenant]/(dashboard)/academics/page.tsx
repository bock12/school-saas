'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Clock, Layers, BookMarked, GraduationCap, Users, UsersRound,
  ClipboardList, Award, TrendingUp, ChevronRight, Plus, CalendarCheck, BarChart3, LayoutDashboard
} from 'lucide-react';

export default function AcademicsDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const kpis: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    bg: string;
    subtitle: string;
  }[] = [
    { label: 'Active Academic Year', value: '2026/2027', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', subtitle: 'Historical tracking' },
    { label: 'Current Term', value: 'First Term', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', subtitle: 'Sept 01 - Dec 18' },
    { label: 'Departments', value: 8, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', subtitle: 'Academic groups' },
    { label: 'Subjects', value: 46, icon: BookMarked, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', subtitle: 'Credit weighted' },
    { label: 'Classes', value: 12, icon: GraduationCap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', subtitle: 'Grade levels' },
    { label: 'Streams', value: 36, icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', subtitle: 'Subject divisions' },
    { label: 'Active Teachers', value: 28, icon: UsersRound, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', subtitle: 'Full-time roster' },
    { label: 'Course Allocations', value: 142, icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', subtitle: 'Teacher links' },
    { label: 'Curriculum Completion', value: '84.2%', icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', subtitle: 'Syllabus coverage' },
    { label: 'Assessments Scheduled', value: 18, icon: ClipboardList, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', subtitle: 'Continuous / Exam' }
  ];

  const quickActions = [
    { label: 'Create Subject', desc: 'Add new weighted curriculum subject', href: `/${tenant}/academics/subjects`, icon: BookMarked, primary: true },
    { label: 'Create Class', desc: 'Define grade capacity levels', href: `/${tenant}/academics/classes`, icon: GraduationCap },
    { label: 'Create Stream', desc: 'Create science, arts stream groups', href: `/${tenant}/academics/streams`, icon: Users },
    { label: 'Assign Teacher', desc: 'Setup academic workload ratios', href: `/${tenant}/academics/teacher-allocation`, icon: UsersRound },
    { label: 'Assign Subject', desc: 'Allocate course links to timetable', href: `/${tenant}/academics/course-allocation`, icon: Layers },
    { label: 'Publish Academic Calendar', desc: 'Distribute term deadlines calendar', href: `/${tenant}/academics/calendar`, icon: CalendarCheck },
    { label: 'Configure Grading', desc: 'Configure percentage GPA tables', href: `/${tenant}/academics/grading`, icon: BarChart3 },
    { label: 'Configure Assessment Rules', desc: 'Configure continuous assessment weightings', href: `/${tenant}/academics/assessment-rules`, icon: ClipboardList }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Academic Administration Dashboard</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Centralized policy controls, grading configuration schemas, curriculum metrics, and course workload engines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-medium">
            Next Term Starts: Sept 01, 2026
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`glass-card p-4 flex flex-col justify-between border hover:scale-[1.02] transition-all cursor-pointer ${kpi.bg}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] tracking-wider truncate mr-1">{kpi.label}</span>
                <Icon className={`w-4 h-4 flex-shrink-0 ${kpi.color}`} />
              </div>
              <div className="mt-auto space-y-0.5">
                <p className="text-base font-bold text-[hsl(var(--text-primary))]">{kpi.value}</p>
                <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Graphs & Workloads */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Academic Performance &amp; Coverage</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Curriculum syllabus progression ratios and staff loads</p>
              </div>
              <span className="text-xs text-[hsl(var(--accent))] font-medium flex items-center gap-1">
                Student-Teacher Ratio: 18.5:1 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subjects count by department */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Curriculum Subjects by Department</p>
                <div className="space-y-2">
                  {[
                    { dept: 'Science & Math Department', count: 14, pct: '90%' },
                    { dept: 'Arts & Humanities Department', count: 12, pct: '80%' },
                    { dept: 'Commercial & Economics Dept', count: 10, pct: '70%' },
                    { dept: 'Languages & Vocational Dept', count: 10, pct: '70%' },
                  ].map(d => (
                    <div key={d.dept} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))] truncate mr-2">{d.dept}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))] flex-shrink-0">{d.count} subjects</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-[hsl(var(--accent))]" style={{ width: d.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher workload hours */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Average Teacher Weekly Periods Workload</p>
                <div className="space-y-2">
                  {[
                    { range: 'Overallocated (>22 periods/wk)', count: 2, pct: '8%' },
                    { range: 'Target Load (16-20 periods/wk)', count: 22, pct: '78%' },
                    { range: 'Underallocated (<16 periods/wk)', count: 4, pct: '14%' },
                  ].map(w => (
                    <div key={w.range} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[hsl(var(--text-secondary))]">{w.range}</span>
                        <span className="font-semibold text-[hsl(var(--text-primary))]">{w.count} teachers</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: w.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub performance rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Syllabus Completion Coverage</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-pink-500" style={{ width: '84.2%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">84%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Weekly Attendance compliance</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '96.8%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">96%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1.5">Continuous Assessment schedule</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] flex-1 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '90%' }} />
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">90%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Quick Policies Configurations</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickActions.map(act => (
              <button
                key={act.label}
                onClick={() => router.push(act.href)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left hover:scale-[1.01] hover:border-[hsl(var(--border-hover))] transition-all ${
                  act.primary
                    ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white border-transparent shadow-lg shadow-[hsl(var(--accent)/0.15)]'
                    : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-primary))]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <act.icon className={`w-5 h-5 ${act.primary ? 'text-white' : 'text-[hsl(var(--accent))]'}`} />
                  <div>
                    <p className="text-sm font-semibold">{act.label}</p>
                    <p className={`text-xs mt-0.5 ${act.primary ? 'text-white/80' : 'text-[hsl(var(--text-tertiary))]'}`}>{act.desc}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${act.primary ? 'text-white/85' : 'text-[hsl(var(--text-tertiary))]'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
