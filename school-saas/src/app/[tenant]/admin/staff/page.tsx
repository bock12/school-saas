'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UsersRound, Briefcase, UserPlus, Users, GraduationCap, Shield, Layers, BookOpen,
  CalendarCheck, Clock, BarChart3, DollarSign, FileText, ClipboardList, Award,
  LayoutGrid, ArrowUpRight, ChevronRight, Plus, Download, CheckSquare, Settings,
  AlertTriangle, CheckCircle2, TrendingUp, Sparkles, UserCheck, ShieldCheck,
  Building, Activity, ArrowRight, BellRing, HeartHandshake, Eye, FileSpreadsheet,
  XCircle, Check
} from 'lucide-react';
import { HCMHeader } from './_components/hcm-header';

export default function StaffDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'teachers' | 'support'>('all');
  const [approvedLeaves, setApprovedLeaves] = useState<string[]>([]);
  const [rejectedLeaves, setRejectedLeaves] = useState<string[]>([]);

  // Functional Module Hub Tiles
  const hcmModules = [
    {
      title: 'Employee Registry',
      count: '84 Records',
      desc: 'Master directory of all academic, administrative & support personnel',
      href: `/admin/staff/employees`,
      icon: Users,
      color: 'from-blue-500/15 to-blue-600/5 text-blue-400 border-blue-500/20',
      badge: 'Active',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Academic Faculty',
      count: '48 Teachers',
      desc: 'Classroom teaching allocations, course loads & educator licenses',
      href: `/admin/staff/teachers`,
      icon: GraduationCap,
      color: 'from-purple-500/15 to-purple-600/5 text-purple-400 border-purple-500/20',
      badge: '100% Licensed',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      title: 'Support Personnel',
      count: '36 Staff',
      desc: 'Operations, facilities, library, transport & administrative staff',
      href: `/admin/staff/non-teaching`,
      icon: Shield,
      color: 'from-teal-500/15 to-teal-600/5 text-teal-400 border-teal-500/20',
      badge: 'Operational',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
    {
      title: 'Live Attendance',
      count: '95.2% Today',
      desc: 'Real-time biometric gates, RFID turnstiles & geotagged check-ins',
      href: `/admin/staff/attendance`,
      icon: CalendarCheck,
      color: 'from-emerald-500/15 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
      badge: '76 Present',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Leave & Absence Desk',
      count: '1 Pending',
      desc: 'Leave requests approval workflows, medical leaves & annual quotas',
      href: `/admin/staff/leave`,
      icon: Clock,
      color: 'from-amber-500/15 to-amber-600/5 text-amber-400 border-amber-500/20',
      badge: 'Action Needed',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      title: 'Contracts & Compliance',
      count: '3 Expiring',
      desc: 'Employment agreements, tenure compliance & upcoming renewals',
      href: `/admin/staff/contracts`,
      icon: ClipboardList,
      color: 'from-rose-500/15 to-rose-600/5 text-rose-400 border-rose-500/20',
      badge: '< 30 Days',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      title: 'Recruitment & Hiring',
      count: '5 Vacancies',
      desc: 'Job postings, candidate screening pipelines & onboarding offers',
      href: `/admin/staff/recruitment`,
      icon: Briefcase,
      color: 'from-indigo-500/15 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
      badge: '34 Applicants',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      title: 'Payroll & Compensation',
      count: 'Grade Scales',
      desc: 'Salary bands, tax identifiers, pension codes & bank ledger files',
      href: `/admin/staff/payroll`,
      icon: DollarSign,
      color: 'from-green-500/15 to-green-600/5 text-green-400 border-green-500/20',
      badge: 'Cycle Ready',
      badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
  ];

  // Department Headcount breakdown
  const departmentBreakdown = [
    { name: 'Science & Academics', count: 37, total: 84, pct: '44%', chair: 'Dr. Grace Owusu', color: 'bg-emerald-500' },
    { name: 'Operations & Facilities', count: 29, total: 84, pct: '35%', chair: 'Mr. Kwame Darko', color: 'bg-purple-500' },
    { name: 'Administration & Finance', count: 18, total: 84, pct: '21%', chair: 'Mrs. Patricia Osei', color: 'bg-blue-500' },
  ];

  // Urgent Action items
  const pendingLeaveRequest = {
    id: 'leave-1',
    name: 'Mrs. Patricia Osei',
    role: 'Head of Admin',
    dept: 'Administration',
    type: 'Annual Leave',
    dates: 'Jul 15 – Jul 22, 2026 (6 Days)',
    reason: 'Family vacation & personal time',
  };

  const expiringContract = {
    id: 'contract-1',
    name: 'Mr. John Doe',
    role: 'Head of Mathematics',
    dept: 'Mathematics Department',
    expiry: 'Jul 30, 2026',
    daysLeft: 27,
  };

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in pb-10">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Human Capital Management (HCM)"
        subtitle="Workforce directory, teacher allocations, real-time biometric attendance, and employment compliance."
        badge="84 Active Staff"
        actionButton={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/admin/staff/employees"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-[hsl(var(--accent)/0.25)] transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </Link>
            <Link
              href="/admin/staff/attendance"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] text-xs sm:text-sm font-bold transition-all active:scale-95 shrink-0"
            >
              <CheckSquare className="w-4 h-4 text-[hsl(var(--accent))]" />
              <span>Attendance Pulse</span>
            </Link>
          </div>
        }
      />

      {/* SECTION 1: High-Level Executive KPI Roster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Headcount */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-blue-500/10 via-transparent to-transparent shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Total Headcount</p>
              <p className="text-3xl sm:text-4xl font-black text-[hsl(var(--text-primary))] mt-1">84</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/20 shrink-0">
              <UsersRound className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))]">
            <div className="flex items-center justify-between text-xs text-[hsl(var(--text-secondary))] font-medium">
              <span>48 Teaching (57%)</span>
              <span>36 Support (43%)</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-[hsl(var(--bg-tertiary))]">
              <div className="bg-blue-500 w-[57%]" />
              <div className="bg-teal-400 w-[43%]" />
            </div>
          </div>
        </div>

        {/* KPI 2: Live Attendance */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Live Attendance</p>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">95.2%</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
            <div className="flex items-center justify-between">
              <span>76 Present On Campus</span>
              <span className="text-emerald-400 font-bold">4 On Leave</span>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">4 late arrivals logged today</p>
          </div>
        </div>

        {/* KPI 3: Compliance & Contracts */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-rose-500/10 via-transparent to-transparent shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Contract Renewals</p>
              <p className="text-3xl sm:text-4xl font-black text-rose-400 mt-1">3 Staff</p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/20 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
            <div className="flex items-center justify-between">
              <span className="text-rose-400 font-bold">Action Needed</span>
              <span>&lt; 30 Days</span>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">1 agreement requires immediate renewal</p>
          </div>
        </div>

        {/* KPI 4: Recruitment & Hiring */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Active Hiring</p>
              <p className="text-3xl sm:text-4xl font-black text-indigo-400 mt-1">5 Roles</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
            <div className="flex items-center justify-between">
              <span>34 Applicants Total</span>
              <span className="text-indigo-400 font-bold">12 In Screening</span>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Chemistry Teacher position has 8 candidates</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Functional Module Hub (Rippling / BambooHR Service Cards Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-[hsl(var(--accent))]" />
              Workforce Management Hub
            </h2>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
              Access core operational modules, employee rosters, attendance registers, and compliance files
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hcmModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)] hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-3 rounded-2xl border bg-gradient-to-br ${mod.color} group-hover:scale-105 transition-transform shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${mod.badgeColor} shrink-0`}>
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] transition-colors flex items-center justify-between">
                      <span>{mod.title}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--accent))]" />
                    </h3>
                    <p className="text-xs font-black text-[hsl(var(--accent))] mt-0.5">{mod.count}</p>
                    <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-1 leading-snug line-clamp-2">
                      {mod.desc}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Modern Workforce Breakdown & Action Center (2-Column Grid on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Department Distribution & Staff Demographics (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Department Breakdown Card */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[hsl(var(--accent))]" />
                  Workforce by Department
                </h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                  Headcount distribution across academic and administrative branches
                </p>
              </div>
              <Link
                href="/admin/staff/departments"
                className="text-xs text-[hsl(var(--accent))] hover:underline font-bold flex items-center gap-1"
              >
                View Structure <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Department Visual Rows */}
            <div className="space-y-4">
              {departmentBreakdown.map((dept) => (
                <div key={dept.name} className="p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[hsl(var(--text-primary))]">{dept.name}</span>
                    <span className="text-[hsl(var(--text-secondary))]">{dept.count} Staff ({dept.pct})</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[hsl(var(--bg-secondary))] overflow-hidden">
                    <div className={`h-full rounded-full ${dept.color} transition-all duration-500`} style={{ width: dept.pct }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[hsl(var(--text-tertiary))] pt-0.5">
                    <span>Chair: <strong className="text-[hsl(var(--text-secondary))]">{dept.chair}</strong></span>
                    <span>{dept.count} of 84 total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demographic & Composition Ratios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">Teaching Load</span>
                <GraduationCap className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xl font-black text-[hsl(var(--text-primary))]">57%</p>
              <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                <div className="h-full bg-purple-500 w-[57%]" />
              </div>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">48 Academic Educators</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">Support Staff</span>
                <Shield className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-xl font-black text-[hsl(var(--text-primary))]">43%</p>
              <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                <div className="h-full bg-teal-400 w-[43%]" />
              </div>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">36 Support Personnel</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">Full-Time Ratio</span>
                <Briefcase className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-[hsl(var(--text-primary))]">92.8%</p>
              <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                <div className="h-full bg-emerald-500 w-[93%]" />
              </div>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">78 Permanent Staff</p>
            </div>
          </div>
        </div>

        {/* Right: HR Action Center & To-Dos (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-primary))]">
                  Action Center (Approvals &amp; Compliance)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                2 Pending
              </span>
            </div>

            {/* Pending Leave Approval Item */}
            <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{pendingLeaveRequest.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{pendingLeaveRequest.role} • {pendingLeaveRequest.type}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  Leave Request
                </span>
              </div>

              <div className="text-xs text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-secondary))] p-2.5 rounded-xl border border-[hsl(var(--border))] space-y-0.5">
                <p className="font-semibold text-[hsl(var(--text-primary))]">{pendingLeaveRequest.dates}</p>
                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">{pendingLeaveRequest.reason}</p>
              </div>

              {approvedLeaves.includes(pendingLeaveRequest.id) ? (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Approved &amp; Roster Updated
                </div>
              ) : rejectedLeaves.includes(pendingLeaveRequest.id) ? (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Request Rejected
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setApprovedLeaves(prev => [...prev, pendingLeaveRequest.id])}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectedLeaves(prev => [...prev, pendingLeaveRequest.id])}
                    className="flex-1 py-1.5 rounded-xl bg-[hsl(var(--bg-secondary))] hover:bg-rose-500 hover:text-white border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>

            {/* Expiring Contract Item */}
            <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 shrink-0">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{expiringContract.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{expiringContract.role}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                  {expiringContract.daysLeft} Days Left
                </span>
              </div>

              <div className="text-xs text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-secondary))] p-2.5 rounded-xl border border-[hsl(var(--border))]">
                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                  Fixed-Term Agreement expires on <strong className="text-[hsl(var(--text-primary))]">{expiringContract.expiry}</strong>. Renewal discussion required.
                </p>
              </div>

              <Link
                href="/admin/staff/contracts"
                className="w-full py-1.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Review &amp; Renew Contract</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Roster Links */}
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/staff/attendance"
                className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-left transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Daily Check-Ins</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Live gate logs</p>
              </Link>
              <Link
                href="/admin/staff/bulk"
                className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-left transition-colors"
              >
                <LayoutGrid className="w-4 h-4 text-[hsl(var(--accent))] mb-1" />
                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Batch Print IDs</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Barcode cards</p>
              </Link>
              <Link
                href="/admin/staff/recruitment"
                className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-left transition-colors"
              >
                <Briefcase className="w-4 h-4 text-indigo-400 mb-1" />
                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Job Postings</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">5 open roles</p>
              </Link>
              <Link
                href="/admin/staff/reports"
                className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-left transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400 mb-1" />
                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Export Data</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">CSV &amp; PDF Rosters</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
