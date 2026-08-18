'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Users, CalendarCheck,
  BarChart3, User, Heart, Shield, DollarSign, FileText, CheckCircle2, ChevronRight,
  Award, Clock, Briefcase, Download, Printer, Edit2, ShieldCheck, KeyRound, Building
} from 'lucide-react';
import Link from 'next/link';
import { HCMHeader } from '../_components/hcm-header';

const mockEmployee = {
  id: '1', first_name: 'John', last_name: 'Doe', employee_id: 'EMP-084920', staff_number: 'STF-001',
  email: 'john.doe@school.edu', phone: '+1 555-8948', gender: 'male', nationality: 'American',
  date_of_birth: '1985-05-14', blood_group: 'B+', address: '123 Oak Lane, Springfield',
  position: 'Head of Mathematics', department: 'Mathematics Department', campus: 'Main Campus',
  status: 'active', employment_type: 'Full-Time', manager: 'Principal Sarah Jenkins',
  date_hired: '2020-09-01', confirmation_date: '2021-03-01', probation_status: 'Confirmed',
  salary_grade: 'Grade 12 Scale A', payroll_number: 'PAY-48920', tax_code: 'TAX-884-X',
  pension_provider: 'National Teachers Fund', bank_name: 'Chase Bank', bank_account: '****9984',
  attendance_rate: 97.4, total_hours: 168, late_arrivals: 2,
};

const timelineHistory = [
  { date: 'Jul 10, 2020', title: 'Applied', desc: 'Submitted online resume for Mathematics Teacher vacancy.' },
  { date: 'Aug 02, 2020', title: 'Interviewed', desc: 'Completed round 1 and technical panels.' },
  { date: 'Aug 15, 2020', title: 'Offered Position', desc: 'Employment contract sent with salary grade details.' },
  { date: 'Aug 18, 2020', title: 'Accepted Offer', desc: 'Returned signed contract and onboarding paperwork.' },
  { date: 'Sep 01, 2020', title: 'Joined School', desc: 'Registered in the system as Mathematics Teacher.' },
  { date: 'Mar 01, 2021', title: 'Completed Probation', desc: 'Performance appraisal completed; promoted to Confirmed status.' },
  { date: 'Sep 10, 2023', title: 'Head of Mathematics', desc: 'Assigned as Department Chair for Mathematics.' }
];

const qualifications = [
  { degree: 'Master of Science in Mathematics', institution: 'Springfield State University', year: '2012' },
  { degree: 'Bachelor of Education (B.Ed)', institution: 'Teacher Training College', year: '2008' },
  { degree: 'Certified High School Educator License', institution: 'State Board of Education', year: '2009' }
];

const documents = [
  { name: 'Employment Contract - John Doe.pdf', category: 'Contract', date: 'Aug 18, 2020', size: '1.4 MB' },
  { name: 'Background Check Verification.pdf', category: 'Security', date: 'Aug 17, 2020', size: '890 KB' },
  { name: 'MSc Degree Certificate.pdf', category: 'Academic', date: 'Aug 10, 2020', size: '2.1 MB' }
];

const performanceReviews = [
  { date: 'May 14, 2026', title: 'Annual Performance Appraisal', score: '94%', reviewer: 'Principal Sarah Jenkins' },
  { date: 'Nov 12, 2025', title: 'Classroom Observation Audit', score: 'Excellent', reviewer: 'HOD Science & Chemistry' }
];

const attendanceLogs = [
  { date: 'Jul 3, 2026', checkIn: '07:45 AM', checkOut: '04:15 PM', status: 'Present' },
  { date: 'Jul 2, 2026', checkIn: '07:50 AM', checkOut: '04:05 PM', status: 'Present' },
  { date: 'Jul 1, 2026', checkIn: '08:12 AM', checkOut: '04:10 PM', status: 'Late Check-in' },
  { date: 'Jun 30, 2026', checkIn: '07:40 AM', checkOut: '04:30 PM', status: 'Present' }
];

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: BookOpen },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'academic', label: 'Qualifications', icon: Award },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'access', label: 'System Access', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title={`${mockEmployee.first_name} ${mockEmployee.last_name}`}
        subtitle={`${mockEmployee.position} • ${mockEmployee.department}`}
        badge={mockEmployee.status.toUpperCase()}
        actionButton={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <span className="hidden sm:inline">Print ID Card</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        }
      />

      {/* Hero Profile Card */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
        {/* Left: Avatar + Identification */}
        <div className="flex items-start sm:items-center gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--accent))] text-2xl font-black shrink-0 shadow-inner">
            {mockEmployee.first_name[0]}{mockEmployee.last_name[0]}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">
                {mockEmployee.first_name} {mockEmployee.last_name}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                {mockEmployee.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              Staff ID: <code className="font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded-md font-bold">{mockEmployee.employee_id}</code>
              <span className="mx-2">•</span> Staff No: <span className="font-bold text-[hsl(var(--text-secondary))]">{mockEmployee.staff_number}</span>
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-[hsl(var(--text-secondary))] flex-wrap">
              <a href={`mailto:${mockEmployee.email}`} className="flex items-center gap-1.5 hover:text-[hsl(var(--accent))] transition-colors">
                <Mail className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> {mockEmployee.email}
              </a>
              <a href={`tel:${mockEmployee.phone}`} className="flex items-center gap-1.5 hover:text-[hsl(var(--accent))] transition-colors">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> {mockEmployee.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Right: Key Ratios */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-[hsl(var(--border))]">
          <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Attendance</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{mockEmployee.attendance_rate}%</p>
          </div>
          <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Type</p>
            <p className="text-sm font-bold text-[hsl(var(--accent))] mt-0.5 truncate">{mockEmployee.employment_type}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Reports To</p>
            <p className="text-xs font-bold text-[hsl(var(--text-primary))] mt-0.5 truncate">{mockEmployee.manager}</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="relative border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-1 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[hsl(var(--accent))] text-white shadow-md shadow-[hsl(var(--accent)/0.25)]'
                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[hsl(var(--text-tertiary))]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 animate-fade-in">
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
                  Workforce Lifecycle Snapshot
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Campus Allocation</span>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.campus}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Probation Status</span>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">{mockEmployee.probation_status}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Date Hired</span>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">
                      {new Date(mockEmployee.date_hired).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Direct Supervisor</span>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.manager}</p>
                  </div>
                </div>
              </div>

              {/* Accrued Qualification */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
                  Highest Credentials
                </h3>
                <div className="space-y-3">
                  {qualifications.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                      <div>
                        <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{q.degree}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">{q.institution}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">{q.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Panel */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
                Career History Timeline
              </h3>
              <div className="space-y-5 relative pl-4 border-l-2 border-[hsl(var(--accent)/0.3)] ml-2 mt-4">
                {timelineHistory.map((ev, j) => (
                  <div key={j} className="relative space-y-0.5">
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[hsl(var(--accent))] -left-[21.5px] top-1 shadow-sm shadow-[hsl(var(--accent))]" />
                    <h4 className="text-xs font-bold text-[hsl(var(--text-primary))]">{ev.title}</h4>
                    <span className="text-[10px] text-[hsl(var(--accent))] font-semibold block">{ev.date}</span>
                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-snug">{ev.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL INFO TAB */}
        {activeTab === 'personal' && (
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] max-w-4xl animate-fade-in space-y-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
              Personal &amp; Demographic Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Full Legal Name</label>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.first_name} {mockEmployee.last_name}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Date of Birth</label>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.date_of_birth}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Gender</label>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.gender.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Nationality</label>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.nationality}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Primary Phone</label>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.phone}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Email Address</label>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.email}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Residential Address</label>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYMENT DETAILS TAB */}
        {activeTab === 'employment' && (
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] max-w-4xl animate-fade-in space-y-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
              Employment Contract Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Position Title</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{mockEmployee.position}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Department</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{mockEmployee.department}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Confirmation Date</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{mockEmployee.confirmation_date}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Employment Status</span>
                <span className="font-bold text-emerald-400">{mockEmployee.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}

        {/* QUALIFICATIONS TAB */}
        {activeTab === 'academic' && (
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] animate-fade-in space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
              Degrees &amp; Licenses Archive
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {qualifications.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{q.degree}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{q.institution}</p>
                  </div>
                  <span className="text-xs font-bold text-[hsl(var(--accent))]">{q.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYROLL DETAILS TAB */}
        {activeTab === 'payroll' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
                Salary Grade &amp; Tax
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Grade Scale</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{mockEmployee.salary_grade}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Payroll ID</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{mockEmployee.payroll_number}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Tax Code</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{mockEmployee.tax_code}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
                Disbursement Account Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Pension Scheme</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{mockEmployee.pension_provider}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Bank Name</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{mockEmployee.bank_name}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Account Number</span>
                  <span className="font-bold text-[hsl(var(--text-primary))] font-mono">{mockEmployee.bank_account}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
                Attendance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xl font-black text-emerald-400">{mockEmployee.attendance_rate}%</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold mt-1">Presence</p>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <p className="text-xl font-black text-rose-400">{mockEmployee.late_arrivals}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold mt-1">Late Check-ins</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
                Recent Daily Check-Ins
              </h3>
              <div className="divide-y divide-[hsl(var(--border))]">
                {attendanceLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{log.date}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] font-mono">{log.checkIn} - {log.checkOut}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      log.status === 'Present' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] animate-fade-in space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
              Appraisals &amp; Evaluations
            </h3>
            <div className="divide-y divide-[hsl(var(--border))]">
              {performanceReviews.map((rev, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{rev.title}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">Reviewed by: {rev.reviewer} • {rev.date}</p>
                  </div>
                  <span className="text-sm font-black text-[hsl(var(--accent))]">{rev.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] animate-fade-in space-y-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
              Digital Personnel Files
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">{doc.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{doc.category} • {doc.size}</p>
                  </div>
                  <button className="text-xs font-bold text-[hsl(var(--accent))] hover:underline shrink-0">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SYSTEM ACCESS TAB */}
        {activeTab === 'access' && (
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] max-w-4xl animate-fade-in space-y-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] pb-2 border-b border-[hsl(var(--border))]">
              Role-Based Access Control (RBAC)
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Assigned Designation</span>
                <span className="font-bold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.position}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Active Role Grants</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)]">Teacher</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)]">Head of Department</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
                Two-Factor Authentication: <span className="text-emerald-400 font-bold">Enforced (Active)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
