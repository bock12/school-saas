'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Clock, Layers, BookMarked, GraduationCap, Users, UsersRound,
  ClipboardList, Award, TrendingUp, ChevronRight, Plus, CalendarCheck, BarChart3,
  LayoutDashboard, Search, Filter, BookOpen, Sliders, Building2, CheckCircle2,
  FileCheck, ShieldCheck, ArrowUpRight, Sparkles, Activity
} from 'lucide-react';

interface ModuleAction {
  id: string;
  label: string;
  desc: string;
  href: string;
  icon: any;
  category: 'curriculum' | 'allocation' | 'grading' | 'calendar';
  badge?: string;
  primary?: boolean;
}

export default function AcademicsDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || '';

  const [activeTab, setActiveTab] = useState<'all' | 'curriculum' | 'allocation' | 'grading' | 'calendar'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026/2027');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  const allModules: ModuleAction[] = [
    {
      id: 'subjects',
      label: 'Subject Directory',
      desc: 'Define subjects, core/elective tags & weightings',
      href: `/${tenant}/admin/academics/subjects`,
      icon: BookMarked,
      category: 'curriculum',
      primary: true,
      badge: '46 Active'
    },
    {
      id: 'departments',
      label: 'Departments',
      desc: 'Manage academic faculties & department heads',
      href: `/${tenant}/admin/academics/departments`,
      icon: Building2,
      category: 'curriculum',
      badge: '8 Faculties'
    },
    {
      id: 'classes',
      label: 'Classes & Grades',
      desc: 'Define grade levels, section capacities & forms',
      href: `/${tenant}/admin/academics/classes`,
      icon: GraduationCap,
      category: 'curriculum',
      badge: '12 Grades'
    },
    {
      id: 'streams',
      label: 'Class Streams',
      desc: 'Configure arm streams (Science, Arts, Commercial)',
      href: `/${tenant}/admin/academics/streams`,
      icon: Users,
      category: 'curriculum',
      badge: '36 Arms'
    },
    {
      id: 'subject-groups',
      label: 'Subject Groups',
      desc: 'Group compulsory & optional subject tracks',
      href: `/${tenant}/admin/academics/subject-groups`,
      icon: Layers,
      category: 'curriculum'
    },
    {
      id: 'teacher-allocation',
      label: 'Teacher Allocation',
      desc: 'Assign subject teachers to classes & workloads',
      href: `/${tenant}/admin/academics/teacher-allocation`,
      icon: UsersRound,
      category: 'allocation',
      badge: '142 Courses'
    },
    {
      id: 'course-allocation',
      label: 'Course Allocation',
      desc: 'Link subject curricula to timetable period slots',
      href: `/${tenant}/admin/academics/course-allocation`,
      icon: BookOpen,
      category: 'allocation'
    },
    {
      id: 'timetable',
      label: 'Master Timetable',
      desc: 'Generate & publish automated weekly class schedules',
      href: `/${tenant}/admin/academics/timetable`,
      icon: Clock,
      category: 'allocation',
      badge: 'Published'
    },
    {
      id: 'assessment-rules',
      label: 'Assessment Rules',
      desc: 'Configure CA weightings (Tests, Quizzes, Projects)',
      href: `/${tenant}/admin/academics/assessment-rules`,
      icon: ClipboardList,
      category: 'grading',
      badge: '40% CA / 60% Exam'
    },
    {
      id: 'grading',
      label: 'Grading Schema & GPA',
      desc: 'Set percentage grade boundaries & GPA points',
      href: `/${tenant}/admin/academics/grading`,
      icon: BarChart3,
      category: 'grading'
    },
    {
      id: 'examinations',
      label: 'Examinations',
      desc: 'Manage mid-term & final exam timetables',
      href: `/${tenant}/admin/academics/examinations`,
      icon: FileCheck,
      category: 'grading'
    },
    {
      id: 'promotion-rules',
      label: 'Promotion Rules',
      desc: 'Define pass thresholds & grade transition criteria',
      href: `/${tenant}/admin/academics/promotion-rules`,
      icon: Award,
      category: 'grading'
    },
    {
      id: 'calendar',
      label: 'Academic Calendar',
      desc: 'Term start/end dates, holidays & deadline events',
      href: `/${tenant}/admin/academics/calendar`,
      icon: CalendarCheck,
      category: 'calendar',
      badge: '2026/2027'
    },
    {
      id: 'terms',
      label: 'Terms & Semesters',
      desc: 'Configure term boundaries & lock period deadlines',
      href: `/${tenant}/admin/academics/terms`,
      icon: Calendar,
      category: 'calendar'
    },
    {
      id: 'years',
      label: 'Academic Years',
      desc: 'Archive prior sessions & rollover to new year',
      href: `/${tenant}/admin/academics/years`,
      icon: Sliders,
      category: 'calendar'
    },
    {
      id: 'reports',
      label: 'Academic Reports',
      desc: 'Generate broadsheets, performance analytics & transcripts',
      href: `/${tenant}/admin/academics/reports`,
      icon: TrendingUp,
      category: 'grading'
    }
  ];

  const filteredModules = allModules.filter(mod => {
    const matchesTab = activeTab === 'all' || mod.category === activeTab;
    const matchesSearch =
      mod.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const recentActivities = [
    { title: 'Syllabus completion updated for Grade 11 Physics', time: '10 mins ago', type: 'Curriculum', user: 'HOD Science' },
    { title: 'Teacher allocation saved for 2026/2027 Term 1', time: '1 hour ago', type: 'Allocation', user: 'Vice Principal' },
    { title: 'Assessment weighting modified (CA 40% / Exam 60%)', time: '3 hours ago', type: 'Grading', user: 'School Admin' },
    { title: 'Mid-term examination schedule published to portal', time: 'Yesterday', type: 'Exams', user: 'Exam Officer' }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--bg-secondary))] via-[hsl(var(--bg-secondary)/0.8)] to-[hsl(var(--accent)/0.05)] p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--accent))] tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Academic Control Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
              Academic Administration
            </h1>
            <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              Manage curriculum structures, departmental subject allocations, grading policies, and timetable execution across all grade levels.
            </p>
          </div>

          {/* Quick Context Control Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] rounded-2xl p-1.5 text-xs">
              <span className="text-[11px] font-semibold text-[hsl(var(--text-tertiary))] px-2">Session:</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-transparent font-bold text-[hsl(var(--text-primary))] focus:outline-none cursor-pointer pr-2"
              >
                <option value="2026/2027">2026/2027 Academic Year</option>
                <option value="2025/2026">2025/2026 Academic Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] rounded-2xl p-1.5 text-xs">
              <span className="text-[11px] font-semibold text-[hsl(var(--text-tertiary))] px-2">Term:</span>
              <select
                value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}
                className="bg-transparent font-bold text-[hsl(var(--text-primary))] focus:outline-none cursor-pointer pr-2"
              >
                <option value="Term 1">First Term (Active)</option>
                <option value="Term 2">Second Term</option>
                <option value="Term 3">Third Term</option>
              </select>
            </div>

            <button
              onClick={() => router.push(`/${tenant}/admin/academics/subjects`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-bold text-xs shadow-lg shadow-[hsl(var(--accent)/0.25)] hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Subject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Active Academic Session',
            value: selectedYear,
            sub: `${selectedTerm} (Sept 01 - Dec 18)`,
            badge: 'Active Term',
            icon: Calendar,
            accentColor: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30'
          },
          {
            label: 'Departments & Subjects',
            value: '46 Subjects',
            sub: 'Organized in 8 Departments',
            badge: 'Curriculum Ready',
            icon: BookMarked,
            accentColor: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30'
          },
          {
            label: 'Classes & Streams',
            value: '12 Grades',
            sub: '36 Active Class Arms / Streams',
            badge: '92% Capacity',
            icon: GraduationCap,
            accentColor: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30'
          },
          {
            label: 'Course & Teacher Coverage',
            value: '84.2%',
            sub: '142 Total Teacher Allocations',
            badge: 'Optimal Ratios',
            icon: Award,
            accentColor: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30'
          }
        ].map(kpi => (
          <div
            key={kpi.label}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${kpi.accentColor} p-5 hover:-translate-y-1 transition-all duration-300 shadow-sm`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
                {kpi.label}
              </span>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">{kpi.value}</p>
              <div className="flex items-center justify-between text-xs text-[hsl(var(--text-secondary))] pt-2 border-t border-white/5">
                <span className="truncate max-w-[180px]">{kpi.sub}</span>
                <span className="font-semibold text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {kpi.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Charts & Analytics + Modules & Navigation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left 2-Cols: Syllabus Analytics & Departmental Progress */}
        <div className="xl:col-span-2 space-y-8">
          {/* Syllabus Progress Chart Card */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-[hsl(var(--border))] space-y-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Syllabus Completion & Workload Coverage</h3>
                </div>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                  Real-time syllabus progression track across active academic terms
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-3 py-1.5 rounded-xl">
                <span>Teacher-Student Ratio: 1:18.5</span>
              </div>
            </div>

            {/* SVG Visual Curve */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                <span>Term Progress Timeline</span>
                <span className="text-[hsl(var(--accent))] font-extrabold">Current: 84.2% Covered</span>
              </div>
              <div className="h-56 w-full relative pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="academicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="hsl(var(--border)/0.4)" strokeWidth="1" strokeDasharray="4" />
                  {/* Area Fill */}
                  <path d="M 0 160 Q 125 100 250 115 T 500 35 L 500 180 L 0 180 Z" fill="url(#academicGrad)" />
                  {/* Line Stroke */}
                  <path d="M 0 160 Q 125 100 250 115 T 500 35" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" />
                  {/* Milestones */}
                  <circle cx="125" cy="100" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                  <circle cx="250" cy="115" r="5" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                  <circle cx="500" cy="35" r="6" fill="hsl(var(--accent))" stroke="white" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[hsl(var(--text-tertiary))] pt-3 border-t border-[hsl(var(--border)/0.5)]">
                  <span>Term Kickoff (Sept)</span>
                  <span>Mid-Term Tests (Oct)</span>
                  <span>Revision Week (Nov)</span>
                  <span className="font-bold text-[hsl(var(--accent))]">Final Exams (Dec)</span>
                </div>
              </div>
            </div>

            {/* Department Breakdown Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-[hsl(var(--border))]">
              {[
                { label: 'Science & Technology', val: '94%', status: 'Ahead of schedule', color: 'bg-blue-500' },
                { label: 'Arts & Humanities', val: '88%', status: 'On track', color: 'bg-purple-500' },
                { label: 'Commercial & Vocational', val: '92%', status: 'On track', color: 'bg-emerald-500' }
              ].map(dept => (
                <div key={dept.label} className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.5)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[hsl(var(--text-secondary))] truncate">{dept.label}</span>
                    <span className="text-xs font-black text-[hsl(var(--text-primary))]">{dept.val}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-secondary))] overflow-hidden">
                    <div className={`h-full rounded-full ${dept.color}`} style={{ width: dept.val }} />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] text-right font-medium">{dept.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Academic Policy & Assessment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="glass-card p-6 rounded-3xl border border-[hsl(var(--border))] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Continuous Assessment Policy</span>
              </div>
              <h4 className="text-sm font-bold text-[hsl(var(--text-primary))]">Current Weighting Schema</h4>
              <div className="space-y-2 text-xs text-[hsl(var(--text-secondary))]">
                <div className="flex justify-between p-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)]">
                  <span>Continuous Assessment (CA)</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">40%</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)]">
                  <span>End-of-Term Examination</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">60%</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)]">
                  <span>Minimum Attendance Requirement</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">75%</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-[hsl(var(--border))] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>System Readiness Check</span>
              </div>
              <h4 className="text-sm font-bold text-[hsl(var(--text-primary))]">Academic Configuration Health</h4>
              <div className="space-y-2 text-xs text-[hsl(var(--text-secondary))]">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span>All Subjects Assigned to Teachers</span>
                  <span className="font-bold">100%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span>Class Timetables Validated</span>
                  <span className="font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <span>Grading Scale Configured</span>
                  <span className="font-bold">A - F (GPA 4.0)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Academic Modules & Management Navigation */}
        <div className="space-y-6">
          {/* Navigation Controls: Tabs & Search */}
          <div className="glass-card p-5 rounded-3xl border border-[hsl(var(--border))] space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                Academic Modules ({filteredModules.length})
              </h3>
            </div>

            {/* Realtime Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                placeholder="Search modules (e.g. grading, timetable, subjects)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'curriculum', label: 'Curriculum' },
                { id: 'allocation', label: 'Allocation' },
                { id: 'grading', label: 'Grading' },
                { id: 'calendar', label: 'Calendar' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                      : 'bg-[hsl(var(--bg-tertiary)/0.5)] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filtered Module Cards List */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredModules.length === 0 ? (
                <div className="text-center py-8 text-xs text-[hsl(var(--text-tertiary))] space-y-1">
                  <p>No academic modules match your filter.</p>
                  <button onClick={() => { setSearchQuery(''); setActiveTab('all'); }} className="text-[hsl(var(--accent))] underline font-medium">
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredModules.map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => router.push(mod.href)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 group hover:-translate-y-0.5 ${
                      mod.primary
                        ? 'bg-gradient-to-r from-[hsl(var(--accent)/0.15)] to-[hsl(var(--accent)/0.05)] border-[hsl(var(--accent)/0.3)] hover:border-[hsl(var(--accent))]'
                        : 'bg-[hsl(var(--bg-secondary)/0.8)] border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                        mod.primary
                          ? 'bg-[hsl(var(--accent))] text-white shadow-md'
                          : 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]'
                      }`}>
                        <mod.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate group-hover:text-[hsl(var(--accent))] transition-colors">
                            {mod.label}
                          </p>
                          {mod.badge && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] whitespace-nowrap">
                              {mod.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--accent))] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="glass-card p-5 rounded-3xl border border-[hsl(var(--border))] space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[hsl(var(--text-secondary))] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
              <span>Recent Academic Audit Log</span>
            </h4>
            <div className="space-y-2.5">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs p-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.4)]">
                  <div className="space-y-0.5 pr-2">
                    <p className="font-semibold text-[hsl(var(--text-primary))] text-[11px] leading-tight">{act.title}</p>
                    <p className="text-[9px] text-[hsl(var(--text-tertiary))]">{act.user} • {act.type}</p>
                  </div>
                  <span className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
