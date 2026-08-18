'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Users, CalendarCheck,
  BarChart3, User, Heart, Shield, DollarSign, FileText, CheckCircle2, ChevronRight,
  Award, Clock, Briefcase, Download, Printer, Edit2, ShieldCheck, KeyRound, Building,
  MessageSquare, Star, AlertTriangle, FileSpreadsheet, Lock, Sparkles, Check,
  ExternalLink, QrCode, FileCheck, CheckSquare, Hash, UserCheck, Layers, X, Save
} from 'lucide-react';

const initialEmployeeData = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  employee_id: 'EMP-084920',
  staff_number: 'STF-001',
  avatar_initials: 'JD',
  email: 'john.doe@school.edu',
  phone: '+1 (555) 894-8820',
  gender: 'Male',
  nationality: 'American',
  date_of_birth: 'May 14, 1985 (39 yrs)',
  blood_group: 'B+',
  marital_status: 'Married',
  address: '123 Oak Lane, Springfield, IL 62701',
  emergency_contact: 'Jane Doe (Spouse) • +1 (555) 894-8821',
  position: 'Head of Mathematics',
  department: 'Mathematics Department',
  campus: 'Main Campus',
  room_allocation: 'Room B-204 (Science & Math Wing)',
  status: 'Active',
  employment_type: 'Full-Time Permanent',
  manager: 'Principal Sarah Jenkins',
  manager_role: 'School Principal',
  date_hired: 'Sep 01, 2020',
  tenure: '3.8 Years',
  confirmation_date: 'Mar 01, 2021',
  probation_status: 'Confirmed & Tenured',
  contract_type: 'Fixed-Term (2-Year Renewal)',
  contract_expiry: 'Jul 30, 2026',
  contract_days_left: 27,
  salary_grade: 'Grade 12 Scale A',
  base_salary: '$4,250.00 / month',
  payroll_number: 'PAY-48920',
  tax_code: 'TAX-884-X (Resident)',
  pension_provider: 'National Teachers Pension Fund (NTPF)',
  pension_number: 'PEN-883920-A',
  bank_name: 'Chase Bank USA',
  bank_account: '**** **** **** 9984',
  bank_routing: '021000021',
  attendance_rate: 97.4,
  total_working_days: 184,
  present_days: 179,
  late_arrivals: 2,
  leave_balance_annual: '18 / 24 Days Remaining',
  leave_balance_sick: '8 / 10 Days Remaining',
  system_role: 'Teacher + Department Head (HOD)',
  two_factor_auth: 'Enforced (Active)',
  last_active: 'Today at 07:45 AM (Biometric Gate #2)',
};

const timelineHistory = [
  { date: 'Sep 10, 2023', title: 'Promoted to Head of Mathematics', desc: 'Appointed as Mathematics Department Chair with oversight over 12 faculty members.', icon: Award, color: 'text-purple-400 bg-purple-500/10' },
  { date: 'Mar 01, 2021', title: 'Probation Confirmed & Tenured', desc: 'Performance evaluation completed with 94% rating. Transitioned to confirmed status.', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10' },
  { date: 'Sep 01, 2020', title: 'Joined Springfield High School', desc: 'Official start date as Senior Mathematics Teacher for Grades 10-12.', icon: Building, color: 'text-blue-400 bg-blue-500/10' },
  { date: 'Aug 18, 2020', title: 'Contract Signed & Executed', desc: 'Onboarding paperwork, background clearance and credentials verified.', icon: FileCheck, color: 'text-teal-400 bg-teal-500/10' },
];

const qualifications = [
  { degree: 'Master of Science in Pure & Applied Mathematics', institution: 'Springfield State University', year: '2012', honors: 'Summa Cum Laude' },
  { degree: 'Bachelor of Education (B.Ed) in Secondary Education', institution: 'National Teachers College', year: '2008', honors: 'First Class Honors' },
  { degree: 'State Certified High School Educator License (Grade 7-12)', institution: 'State Board of Education', year: '2009', honors: 'License #EDU-994820 (Active)' },
];

const documents = [
  { name: 'Employment Contract - John Doe.pdf', category: 'Employment Agreement', date: 'Aug 18, 2020', size: '1.4 MB', status: 'Signed & Active' },
  { name: 'MSc Degree Certificate Verification.pdf', category: 'Academic Credential', date: 'Aug 10, 2020', size: '2.1 MB', status: 'Verified' },
  { name: 'State Police Background Clearance.pdf', category: 'Security & Compliance', date: 'Aug 17, 2020', size: '890 KB', status: 'Cleared' },
  { name: 'Annual Medical Fitness Assessment.pdf', category: 'Medical Clearance', date: 'Sep 04, 2023', size: '1.2 MB', status: 'Approved' },
];

const performanceReviews = [
  { cycle: 'Annual Review 2025/2026', date: 'May 14, 2026', score: '94%', rating: 'Exceeds Expectations', reviewer: 'Principal Sarah Jenkins', feedback: 'Outstanding syllabus completion rate (98.4%). Led math olympiad team to state championship.' },
  { cycle: 'Classroom Observation Audit', date: 'Nov 12, 2025', score: '96%', rating: 'Outstanding Pedagogy', reviewer: 'Vice Principal Mark Osei', feedback: 'Exceptional student engagement and interactive smart-board integration in advanced calculus.' },
  { cycle: 'Annual Review 2024/2025', date: 'May 10, 2025', score: '92%', rating: 'Exceeds Expectations', reviewer: 'Principal Sarah Jenkins', feedback: 'Consistently high student pass rate in national board examinations.' },
];

const attendanceLogs = [
  { date: 'Today (Jul 3, 2026)', checkIn: '07:45 AM', checkOut: '04:15 PM', status: 'Present', punctuality: 'On Time', device: 'Biometric Gate #2' },
  { date: 'Yesterday (Jul 2, 2026)', checkIn: '07:50 AM', checkOut: '04:05 PM', status: 'Present', punctuality: 'On Time', device: 'Biometric Gate #2' },
  { date: 'Jul 1, 2026', checkIn: '08:12 AM', checkOut: '04:10 PM', status: 'Present', punctuality: 'Late (12m)', device: 'Biometric Gate #1' },
  { date: 'Jun 30, 2026', checkIn: '07:40 AM', checkOut: '04:30 PM', status: 'Present', punctuality: 'Early', device: 'RFID Turnstile #1' },
  { date: 'Jun 29, 2026', checkIn: '07:42 AM', checkOut: '04:20 PM', status: 'Present', punctuality: 'Early', device: 'Biometric Gate #2' },
];

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [employee, setEmployee] = useState(initialEmployeeData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(initialEmployeeData);
  const [editModalTab, setEditModalTab] = useState<'personal' | 'job' | 'payroll'>('personal');
  const [showToast, setShowToast] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: BookOpen },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'academic', label: 'Qualifications', icon: Award },
    { id: 'payroll', label: 'Payroll & Banking', icon: DollarSign },
    { id: 'attendance', label: 'Attendance & Leave', icon: CalendarCheck },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'access', label: 'Security & Access', icon: Shield },
  ];

  const handleOpenEditModal = () => {
    setEditFormData({ ...employee });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = `${editFormData.first_name[0] || ''}${editFormData.last_name[0] || ''}`.toUpperCase();
    setEmployee({
      ...editFormData,
      avatar_initials: initials || 'JD',
    });
    setIsEditModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in pb-16 relative">
      {/* SUCCESS TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs font-bold">Profile Updated Successfully</p>
            <p className="text-[11px] text-white/80">Employee changes have been saved to the workforce registry.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER: Clean Back & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/staff/employees`)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors shrink-0"
            title="Back to Employee Registry"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-tertiary))]">
              <Link href="/admin/staff" className="hover:text-[hsl(var(--text-secondary))] transition-colors">HCM</Link>
              <span>/</span>
              <Link href="/admin/staff/employees" className="hover:text-[hsl(var(--text-secondary))] transition-colors">Employees</Link>
              <span>/</span>
              <span className="text-[hsl(var(--text-secondary))] font-bold">{employee.first_name} {employee.last_name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight mt-0.5">
              Employee 360° Profile
            </h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/admin/communication/internal`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-semibold text-[hsl(var(--text-primary))] transition-colors shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
            <span>Message</span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-semibold text-[hsl(var(--text-primary))] transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
            <span className="hidden sm:inline">Print ID</span>
          </button>
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all active:scale-95 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* MODERN 2-COLUMN DOSSIER LAYOUT (Linear / Stripe Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Sticky Identity & Summary Sidebar (4 cols on lg, 3 on xl)  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5 lg:sticky lg:top-6">
          {/* Identity & Core Role Card */}
          <div className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm text-center">
            {/* Avatar with Presence Indicator */}
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.25)] flex items-center justify-center text-[hsl(var(--accent))] text-2xl font-bold">
                {employee.avatar_initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[hsl(var(--bg-primary))]" title="Active & On Duty" />
            </div>

            {/* Name & Titles */}
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[hsl(var(--text-primary))]">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-xs font-medium text-[hsl(var(--accent))]">{employee.position}</p>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">{employee.department}</p>
            </div>

            {/* Status Pills */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                {employee.status}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">
                {employee.employment_type.split(' ')[0]}
              </span>
            </div>

            {/* Identifiers & Details */}
            <div className="pt-3 border-t border-[hsl(var(--border))] text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Staff ID</span>
                <span className="font-mono font-bold text-[hsl(var(--text-primary))]">{employee.employee_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Staff Number</span>
                <span className="font-semibold text-[hsl(var(--text-secondary))]">{employee.staff_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Tenure</span>
                <span className="font-semibold text-[hsl(var(--text-secondary))]">{employee.tenure}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Campus</span>
                <span className="font-semibold text-[hsl(var(--text-secondary))] truncate max-w-[130px]">{employee.campus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Office</span>
                <span className="font-semibold text-[hsl(var(--text-secondary))] truncate max-w-[130px]">{employee.room_allocation.split(' ')[0]} {employee.room_allocation.split(' ')[1]}</span>
              </div>
            </div>

            {/* Direct Contact Links */}
            <div className="pt-3 border-t border-[hsl(var(--border))] text-left space-y-2 text-xs">
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] transition-colors truncate"
              >
                <Mail className="w-3.5 h-3.5 text-[hsl(var(--accent))] shrink-0" />
                <span className="truncate">{employee.email}</span>
              </a>
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center gap-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] transition-colors truncate"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{employee.phone}</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics 4-Pack */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="glass-card p-3 rounded-xl border border-[hsl(var(--border))] space-y-1">
              <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Attendance</span>
              <p className="text-base font-bold text-emerald-400">{employee.attendance_rate}%</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">179/184 Days</p>
            </div>
            <div className="glass-card p-3 rounded-xl border border-[hsl(var(--border))] space-y-1">
              <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Appraisal</span>
              <p className="text-base font-bold text-purple-400">94%</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Outstanding</p>
            </div>
            <div className="glass-card p-3 rounded-xl border border-[hsl(var(--border))] space-y-1">
              <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Contract</span>
              <p className="text-sm font-bold text-rose-400 truncate">{employee.contract_days_left}d Left</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{employee.contract_expiry.split(',')[0]}</p>
            </div>
            <div className="glass-card p-3 rounded-xl border border-[hsl(var(--border))] space-y-1">
              <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block">Time Off</span>
              <p className="text-sm font-bold text-[hsl(var(--accent))] truncate">18d Left</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Annual Quota</p>
            </div>
          </div>

          {/* Supervisor Card */}
          <div className="glass-card p-4 rounded-xl border border-[hsl(var(--border))] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))] block">Reports To</span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex items-center justify-center font-bold text-xs text-[hsl(var(--text-secondary))]">
                SJ
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{employee.manager}</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{employee.manager_role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Clean, Uncluttered Detail Canvas (8 cols lg, 9 cols xl)   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6 min-w-0">
          {/* Linear-style Understated Horizontal Tabs Bar */}
          <div className="border-b border-[hsl(var(--border))] pb-px">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                        : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[hsl(var(--text-tertiary))]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Contract Expiration Alert Callout */}
              {employee.contract_days_left <= 30 && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Contract Renewal Required ({employee.contract_days_left} days remaining)</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5">Fixed-term agreement expires on {employee.contract_expiry}.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('employment')}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    Review Terms
                  </button>
                </div>
              )}

              {/* Job Architecture & Organizational Structure */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border))]">
                  <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">
                    Organizational Placement &amp; Assignment
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="text-xs text-[hsl(var(--accent))] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))]">Department</span>
                    <p className="font-semibold text-[hsl(var(--text-primary))] mt-0.5">{employee.department}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))]">Designation</span>
                    <p className="font-semibold text-[hsl(var(--text-primary))] mt-0.5">{employee.position}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))]">Employment Classification</span>
                    <p className="font-semibold text-[hsl(var(--text-primary))] mt-0.5">{employee.employment_type}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))]">Probation Status</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">{employee.probation_status}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))]">Hire Date</span>
                    <p className="font-semibold text-[hsl(var(--text-primary))] mt-0.5">{employee.date_hired}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--text-tertiary))]">Confirmation Date</span>
                    <p className="font-semibold text-[hsl(var(--text-primary))] mt-0.5">{employee.confirmation_date}</p>
                  </div>
                </div>
              </div>

              {/* Degrees & Verified Accreditations */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))] flex items-center justify-between">
                  <span>Degrees &amp; Educator Credentials</span>
                  <span className="text-xs font-normal text-[hsl(var(--text-tertiary))]">3 Verified</span>
                </h3>

                <div className="space-y-3">
                  {qualifications.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-[hsl(var(--text-primary))]">{q.degree}</p>
                        <p className="text-[hsl(var(--text-secondary))]">{q.institution}</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">{q.honors}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[10px] font-bold text-[hsl(var(--text-tertiary))] shrink-0">
                        {q.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Milestones */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">
                  Career Milestones &amp; Promotions
                </h3>

                <div className="space-y-4 relative pl-4 border-l border-[hsl(var(--border))] ml-2 mt-3">
                  {timelineHistory.map((ev, j) => (
                    <div key={j} className="relative space-y-0.5 text-xs">
                      <div className="absolute w-2 h-2 rounded-full bg-[hsl(var(--accent))] -left-[21px] top-1.5" />
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-[hsl(var(--text-primary))]">{ev.title}</h4>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] shrink-0">{ev.date}</span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">{ev.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-6 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border))]">
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">
                  Personal Information &amp; Civil Identity
                </h3>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="text-xs text-[hsl(var(--accent))] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Full Legal Name</span>
                  <p className="font-bold text-[hsl(var(--text-primary))] mt-1">{employee.first_name} {employee.last_name}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Date of Birth</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.date_of_birth}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Gender</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.gender}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Marital Status</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.marital_status}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Nationality</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.nationality}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Blood Group</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.blood_group}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[hsl(var(--text-tertiary))]">Residential Address</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.address}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[hsl(var(--text-tertiary))]">Emergency Contact Person</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.emergency_contact}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMPLOYMENT */}
          {activeTab === 'employment' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-6 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border))]">
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">
                  Employment Terms &amp; Contract Details
                </h3>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="text-xs text-[hsl(var(--accent))] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Job Title</span>
                  <p className="font-bold text-[hsl(var(--text-primary))] mt-1">{employee.position}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Department</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.department}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Contract Structure</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.contract_type}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Confirmation Status</span>
                  <p className="font-semibold text-emerald-400 mt-1">{employee.probation_status}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Start Date</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.date_hired}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Contract Expiration</span>
                  <p className="font-semibold text-rose-400 mt-1">{employee.contract_expiry} ({employee.contract_days_left} Days)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUALIFICATIONS */}
          {activeTab === 'academic' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">
                Degrees &amp; Certified Credentials
              </h3>

              <div className="space-y-3">
                {qualifications.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{q.degree}</p>
                      <p className="text-[hsl(var(--text-secondary))]">{q.institution}</p>
                      <p className="text-[11px] text-emerald-400 font-semibold">{q.honors}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] font-bold text-xs text-[hsl(var(--text-secondary))] shrink-0">
                      {q.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAYROLL & BANKING */}
          {activeTab === 'payroll' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-6 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border))]">
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">
                  Payroll, Salary Band &amp; Banking Ledgers
                </h3>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="text-xs text-[hsl(var(--accent))] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Salary Grade Band</span>
                  <p className="font-bold text-[hsl(var(--text-primary))] mt-1">{employee.salary_grade}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Base Monthly Compensation</span>
                  <p className="font-bold text-emerald-400 text-sm mt-1">{employee.base_salary}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Payroll System ID</span>
                  <p className="font-mono font-semibold text-[hsl(var(--accent))] mt-1">{employee.payroll_number}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Tax Code</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.tax_code}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Pension Provider</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.pension_provider}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Pension ID Number</span>
                  <p className="font-mono font-semibold text-[hsl(var(--text-secondary))] mt-1">{employee.pension_number}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Bank Name</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{employee.bank_name}</p>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))]">Account Number</span>
                  <p className="font-mono font-semibold text-emerald-400 mt-1">{employee.bank_account}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ATTENDANCE & LEAVE */}
          {activeTab === 'attendance' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="glass-card p-3.5 rounded-xl border border-[hsl(var(--border))] space-y-1">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Presence</span>
                  <p className="text-xl font-bold text-emerald-400">{employee.attendance_rate}%</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">179/184 Days</p>
                </div>
                <div className="glass-card p-3.5 rounded-xl border border-[hsl(var(--border))] space-y-1">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Late Check-ins</span>
                  <p className="text-xl font-bold text-amber-400">{employee.late_arrivals}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Total Term</p>
                </div>
                <div className="glass-card p-3.5 rounded-xl border border-[hsl(var(--border))] space-y-1">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Annual Leave</span>
                  <p className="text-sm font-bold text-[hsl(var(--accent))] truncate">{employee.leave_balance_annual}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">6 Days Used</p>
                </div>
                <div className="glass-card p-3.5 rounded-xl border border-[hsl(var(--border))] space-y-1">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Sick Leave</span>
                  <p className="text-sm font-bold text-blue-400 truncate">{employee.leave_balance_sick}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">2 Days Used</p>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="glass-card overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
                <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-primary))]">
                    Recent Daily Verification Logs
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)]">
                        {['Date', 'Check-In', 'Check-Out', 'Punctuality', 'Status', 'Device Node'].map(h => (
                          <th key={h} className="px-4 py-2.5 font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                      {attendanceLogs.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                          <td className="px-4 py-3 font-semibold text-[hsl(var(--text-primary))] whitespace-nowrap">{row.date}</td>
                          <td className="px-4 py-3 font-mono font-bold text-[hsl(var(--text-primary))] whitespace-nowrap">{row.checkIn}</td>
                          <td className="px-4 py-3 font-mono text-[hsl(var(--text-secondary))] whitespace-nowrap">{row.checkOut}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.punctuality.startsWith('On') || row.punctuality === 'Early'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {row.punctuality}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[hsl(var(--text-tertiary))] whitespace-nowrap">{row.device}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">
                Annual Evaluations &amp; Appraisals
              </h3>

              <div className="space-y-3">
                {performanceReviews.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] pb-2">
                      <div>
                        <p className="font-bold text-[hsl(var(--text-primary))]">{rev.cycle}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Reviewer: {rev.reviewer} • {rev.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-400 px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                          {rev.score}
                        </span>
                        <span className="font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {rev.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-[hsl(var(--text-secondary))] italic leading-relaxed">
                      &ldquo;{rev.feedback}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-4 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">
                Verified Personnel File Vault
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2 text-xs flex flex-col justify-between">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-[hsl(var(--accent))] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-bold text-[hsl(var(--text-primary))] truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{doc.category} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold">{doc.status}</span>
                      <button type="button" className="text-[hsl(var(--accent))] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SYSTEM ACCESS */}
          {activeTab === 'access' && (
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] space-y-5 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">
                Role-Based Access Control (RBAC) &amp; Security
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))] block">Assigned Roles</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                      Teacher
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      Head of Department
                    </span>
                  </div>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))] pt-1">
                    Grants syllabus entry, marks submission, and department approval scopes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))] block">Authentication Security</span>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(var(--text-secondary))]">Two-Factor Authentication:</span>
                      <span className="font-bold text-emerald-400">{employee.two_factor_auth}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(var(--text-secondary))]">Last Biometric Check-In:</span>
                      <span className="font-semibold text-[hsl(var(--text-primary))]">{employee.last_active}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL DIALOG                                                 */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-card w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Edit Employee Profile</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">Updating records for {employee.first_name} {employee.last_name} ({employee.employee_id})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Section Tabs */}
            <div className="flex items-center gap-2 p-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
              {[
                { id: 'personal', label: 'Personal & Contact' },
                { id: 'job', label: 'Job & Assignment' },
                { id: 'payroll', label: 'Compensation & Bank' },
              ].map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setEditModalTab(sec.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    editModalTab === sec.id
                      ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                      : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* SECTION 1: PERSONAL & CONTACT */}
                {editModalTab === 'personal' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">First Name</label>
                        <input
                          type="text"
                          value={editFormData.first_name}
                          onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Last Name</label>
                        <input
                          type="text"
                          value={editFormData.last_name}
                          onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Email Address</label>
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Phone Number</label>
                        <input
                          type="text"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Gender</label>
                        <select
                          value={editFormData.gender}
                          onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Blood Group</label>
                        <input
                          type="text"
                          value={editFormData.blood_group}
                          onChange={(e) => setEditFormData({ ...editFormData, blood_group: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Nationality</label>
                        <input
                          type="text"
                          value={editFormData.nationality}
                          onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Residential Address</label>
                      <input
                        type="text"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Emergency Contact Person &amp; Phone</label>
                      <input
                        type="text"
                        value={editFormData.emergency_contact}
                        onChange={(e) => setEditFormData({ ...editFormData, emergency_contact: e.target.value })}
                        className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                      />
                    </div>
                  </div>
                )}

                {/* SECTION 2: JOB & ASSIGNMENT */}
                {editModalTab === 'job' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Position Title</label>
                        <input
                          type="text"
                          value={editFormData.position}
                          onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Department</label>
                        <select
                          value={editFormData.department}
                          onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        >
                          <option value="Mathematics Department">Mathematics Department</option>
                          <option value="Science Department">Science Department</option>
                          <option value="Administration Department">Administration Department</option>
                          <option value="Languages Department">Languages Department</option>
                          <option value="Finance Department">Finance Department</option>
                          <option value="Transport Department">Transport Department</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Employment Status</label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Employment Classification</label>
                        <select
                          value={editFormData.employment_type}
                          onChange={(e) => setEditFormData({ ...editFormData, employment_type: e.target.value })}
                          className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        >
                          <option value="Full-Time Permanent">Full-Time Permanent</option>
                          <option value="Part-Time Adjunct">Part-Time Adjunct</option>
                          <option value="Fixed-Term Contract">Fixed-Term Contract</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Campus Office Room</label>
                        <input
                          type="text"
                          value={editFormData.room_allocation}
                          onChange={(e) => setEditFormData({ ...editFormData, room_allocation: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Direct Supervisor / Manager</label>
                        <input
                          type="text"
                          value={editFormData.manager}
                          onChange={(e) => setEditFormData({ ...editFormData, manager: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 3: COMPENSATION & BANK */}
                {editModalTab === 'payroll' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Salary Grade Band</label>
                        <input
                          type="text"
                          value={editFormData.salary_grade}
                          onChange={(e) => setEditFormData({ ...editFormData, salary_grade: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Base Monthly Salary</label>
                        <input
                          type="text"
                          value={editFormData.base_salary}
                          onChange={(e) => setEditFormData({ ...editFormData, base_salary: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Bank Institution Name</label>
                        <input
                          type="text"
                          value={editFormData.bank_name}
                          onChange={(e) => setEditFormData({ ...editFormData, bank_name: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Account Number</label>
                        <input
                          type="text"
                          value={editFormData.bank_account}
                          onChange={(e) => setEditFormData({ ...editFormData, bank_account: e.target.value })}
                          className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.25)] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
