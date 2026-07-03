'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Users, CalendarCheck,
  BarChart3, User, Heart, Shield, DollarSign, FileText, CheckCircle2, ChevronRight, Award, Clock, Briefcase
} from 'lucide-react';

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
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-indigo-400 text-2xl font-bold flex-shrink-0">
            {mockEmployee.first_name[0]}{mockEmployee.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">{mockEmployee.first_name} {mockEmployee.last_name}</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                {mockEmployee.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
              Staff ID: <code className="font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{mockEmployee.employee_id}</code>
              <span className="mx-2">•</span> Number: {mockEmployee.staff_number}
            </p>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              {mockEmployee.position} — {mockEmployee.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-[hsl(var(--border))]">
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Attendance Rate</p>
            <p className="text-lg font-bold text-emerald-400">{mockEmployee.attendance_rate}%</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Employment Type</p>
            <p className="text-lg font-bold text-[hsl(var(--accent))]">{mockEmployee.employment_type}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Manager</p>
            <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{mockEmployee.manager}</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="glass-card p-1 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 animate-fade-in">
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Lifecycle Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Campus Allocation</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.campus}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Job Confirmed Status</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.probation_status}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Date Hired</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{new Date(mockEmployee.date_hired).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Reporting Lines</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.manager}</p>
                  </div>
                </div>
              </div>

              {/* Accrued Qualification */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))] mb-4">Qualifications Overview</h3>
                <div className="space-y-3">
                  {qualifications.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)]">
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{q.degree}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">{q.institution}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{q.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Panel */}
            <div className="glass-card p-5 space-y-4 animate-fade-in">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Employment Action Timeline</h3>
              <div className="space-y-6 relative pl-4 border-l border-[hsl(var(--border))] ml-2 mt-4">
                {timelineHistory.map((ev, j) => (
                  <div key={j} className="relative space-y-1">
                    <div className="absolute w-2 h-2 rounded-full bg-[hsl(var(--accent))] -left-[21px] top-1.5" />
                    <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">{ev.title}</h4>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">{ev.date}</span>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 leading-relaxed">{ev.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL INFO TAB */}
        {activeTab === 'personal' && (
          <div className="glass-card p-5 max-w-4xl animate-fade-in space-y-6">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Full Legal Name</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.first_name} {mockEmployee.last_name}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Date of Birth</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.date_of_birth}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Gender</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.gender.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Nationality</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.nationality}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Phone Number</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.phone}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Personal Email</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.email}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Residential Address</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYMENT DETAILS TAB */}
        {activeTab === 'employment' && (
          <div className="glass-card p-5 max-w-4xl animate-fade-in space-y-6">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Employment Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Job Title</span>
                <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.position}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Department</span>
                <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.department}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Probation confirmation date</span>
                <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.confirmation_date}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Status</span>
                <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}

        {/* QUALIFICATIONS TAB */}
        {activeTab === 'academic' && (
          <div className="glass-card p-5 animate-fade-in space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Credentials Archive</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {qualifications.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{q.degree}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{q.institution}</p>
                  </div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))]">{q.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYROLL DETAILS TAB */}
        {activeTab === 'payroll' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Salary Ledger details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Grade Scale</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.salary_grade}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Payroll Number</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.payroll_number}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Tax Code Identifier</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.tax_code}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Bank Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Pension Provider</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.pension_provider}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Bank Name</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.bank_name}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Account Number</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">{mockEmployee.bank_account}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Attendance Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-base font-bold text-emerald-400">{mockEmployee.attendance_rate}%</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Accrued Presence</p>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-base font-bold text-rose-400">{mockEmployee.late_arrivals}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Late Check-ins</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Daily Logs</h3>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {attendanceLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{log.date}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{log.checkIn} - {log.checkOut}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
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
          <div className="glass-card p-5 animate-fade-in space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Performance Appraisals</h3>
            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {performanceReviews.map((rev, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{rev.title}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">Reviewed by: {rev.reviewer} • {rev.date}</p>
                  </div>
                  <span className="text-sm font-bold text-[hsl(var(--accent))]">{rev.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="glass-card p-5 animate-fade-in space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Digital Personnel File</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{doc.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{doc.category} • {doc.size}</p>
                  </div>
                  <button className="text-xs text-[hsl(var(--accent))] hover:underline flex-shrink-0">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SYSTEM ACCESS TAB */}
        {activeTab === 'access' && (
          <div className="glass-card p-5 max-w-4xl animate-fade-in space-y-6">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">RBAC Access Settings</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">Assigned Position</span>
                <span className="font-semibold text-[hsl(var(--text-primary))] mt-0.5">{mockEmployee.position}</span>
              </div>
              <div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] block">System Roles List</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]">Teacher</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]">Head of Department</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
                Two-Factor Authentication: <span className="text-emerald-400 font-semibold">Enabled</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
