'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Users, CalendarCheck,
  BarChart3, User, Heart, Shield, DollarSign, FileText, CheckCircle2, ChevronRight, GraduationCap
} from 'lucide-react';
import Link from 'next/link';

// Mock data structures
const student = {
  id: '1', first_name: 'Amara', last_name: 'Johnson', admission_number: 'STU-001', student_id: 'ID-849204',
  email: 'amara@school.edu', phone: '+1 555-0201', gender: 'female', nationality: 'American', religion: 'Christian',
  date_of_birth: '2010-03-15', blood_group: 'O+', address: '456 Elm Street, Springfield',
  class: 'Grade 10', section: 'A', stream: 'Science Stream', house: 'Blue House', status: 'active',
  guardian_name: 'Mrs. Patricia Johnson', guardian_phone: '+1 555-0101', guardian_email: 'patricia@gmail.com', guardian_relationship: 'Mother',
  is_active: true, admitted_at: '2025-09-01',
  attendance_rate: 94, current_gpa: 3.7, total_fees_due: 2400, fees_paid: 1800, balance: 600,
  enrollment_history: [
    { year: '2025-2026', grade: 'Grade 9', stream: 'General Stream', status: 'Completed' },
    { year: '2026-2027', grade: 'Grade 10', stream: 'Science Stream', status: 'Current' },
  ]
};

const activityTimeline = [
  { year: '2025', events: [
    { title: 'Admission Applied', date: 'Jul 15, 2025', desc: 'Completed online application registration.' },
    { title: 'Application Document Verification', date: 'Jul 18, 2025', desc: 'Verified birth certificate and passport photo.' },
    { title: 'Interview & Assessment Passed', date: 'Aug 5, 2025', desc: 'Scored 88% in math and English proficiency assessment.' },
    { title: 'Enrollment Confirmed', date: 'Aug 12, 2025', desc: 'Admitted into Grade 9 General Stream.' },
    { title: 'First Fee Collection', date: 'Aug 20, 2025', desc: 'Paid initial enrollment and admission fees.' },
  ]},
  { year: '2026', events: [
    { title: 'Grade 9 Completed', date: 'May 30, 2026', desc: 'Successfully promoted with a GPA of 3.65.' },
    { title: 'Class Allocation Changed', date: 'Jun 15, 2026', desc: 'Allocated to Grade 10 A - Science Stream.' },
    { title: 'Active Enrollment Verified', date: 'Jul 1, 2026', desc: 'Marked active for Term 1.' }
  ]}
];

const familyContacts = [
  { name: 'Mrs. Patricia Johnson', relationship: 'Mother', phone: '+1 555-0101', email: 'patricia@gmail.com', address: '456 Elm Street, Springfield', isEmergency: true },
  { name: 'Mr. David Johnson', relationship: 'Father', phone: '+1 555-0102', email: 'david@gmail.com', address: '456 Elm Street, Springfield', isEmergency: false }
];

const siblings = [
  { name: 'Marcus Johnson', id: '2', grade: 'Grade 7', status: 'Active Student' }
];

const academicHistory = {
  subjects: [
    { name: 'Mathematics', teacher: 'Mr. Benjamin Asante', grade: 'A', score: 92 },
    { name: 'Physics', teacher: 'Dr. Raj Sharma', grade: 'A-', score: 89 },
    { name: 'Chemistry', teacher: 'Mrs. Grace Owusu', grade: 'B+', score: 84 },
    { name: 'English Literature', teacher: 'Ms. Ama Owusu', grade: 'A', score: 95 },
    { name: 'Biology', teacher: 'Mrs. Grace Owusu', grade: 'B', score: 81 }
  ]
};

const attendanceData = {
  present: 154,
  absent: 6,
  late: 4,
  recent: [
    { date: 'Jul 3, 2026', status: 'Present' },
    { date: 'Jul 2, 2026', status: 'Present' },
    { date: 'Jul 1, 2026', status: 'Present' },
    { date: 'Jun 30, 2026', status: 'Late' },
    { date: 'Jun 29, 2026', status: 'Absent' },
  ]
};

const medicalRecord = {
  blood_group: 'O+',
  allergies: ['Peanuts', 'Penicillin'],
  disabilities: ['None'],
  medications: ['Asthma inhaler (when needed)'],
  clinic_visits: [
    { date: 'Jun 12, 2026', complaint: 'Mild headaches during class', action: 'Administered Tylenol' },
    { date: 'Mar 18, 2026', complaint: 'Slight fever', action: 'Parents notified, picked up early' }
  ]
};

const disciplineRecord = {
  warnings: 0,
  incidents: [],
  rewards: [
    { date: 'Jun 22, 2026', title: 'Excellence in Science Research', awardedBy: 'Principal' }
  ]
};

const financialRecord = {
  balance: 600,
  scholarship: '10% Merit Discount',
  history: [
    { date: 'Jun 10, 2026', desc: 'Paid Term 1 Tuition', amount: 1800, method: 'Paystack Card' },
    { date: 'Sep 01, 2025', desc: 'Paid Grade 9 Reg Fees', amount: 1200, method: 'Bank Transfer' }
  ]
};

const studentDocuments = [
  { name: 'Birth Certificate.pdf', category: 'Admission', date: 'Jul 15, 2025', size: '1.2 MB' },
  { name: 'Grade 9 Report Card.pdf', category: 'Academic', date: 'May 30, 2026', size: '420 KB' },
  { name: 'Medical Clearance Form.pdf', category: 'Medical', date: 'Jul 16, 2025', size: '850 KB' },
  { name: 'Parent Portal Consent.pdf', category: 'Miscellaneous', date: 'Jul 15, 2025', size: '250 KB' }
];

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: BookOpen },
    { id: 'family', label: 'Family & Guard', icon: Users },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'medical', label: 'Medical', icon: Heart },
    { id: 'discipline', label: 'Discipline', icon: Shield },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-pink-400 text-2xl font-bold flex-shrink-0">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">{student.first_name} {student.last_name}</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                {student.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
              Admission: <code className="font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{student.admission_number}</code>
              <span className="mx-2">•</span> ID: {student.student_id}
            </p>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              {student.class} Section {student.section} — {student.stream}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-[hsl(var(--border))]">
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Attendance Rate</p>
            <p className="text-lg font-bold text-emerald-400">{student.attendance_rate}%</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Current GPA</p>
            <p className="text-lg font-bold text-[hsl(var(--accent))]">{student.current_gpa}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Fee Balance</p>
            <p className="text-lg font-bold text-amber-400">${student.balance}</p>
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
              {/* Core Details */}
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Lifecycle Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Enrollment Status</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.is_active ? 'Active Enrollment' : 'Suspended'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">House Assignment</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.house}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Date Admitted</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{new Date(student.admitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Primary Guardian</span>
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.guardian_name} ({student.guardian_relationship})</p>
                  </div>
                </div>
              </div>

              {/* Enrollment History */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))] mb-4">Yearly Enrollment History</h3>
                <div className="space-y-3">
                  {student.enrollment_history.map(eh => (
                    <div key={eh.year} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)]">
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{eh.year}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">{eh.grade} • {eh.stream}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        eh.status === 'Current' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'
                      }`}>{eh.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Panel */}
            <div className="glass-card p-5 space-y-4 animate-fade-in">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Timeline Activity</h3>
              <div className="space-y-6 relative pl-4 border-l border-[hsl(var(--border))] ml-2 mt-4">
                {activityTimeline.map((group) => (
                  <div key={group.year} className="space-y-4">
                    <span className="text-xs font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded -ml-6 border border-[hsl(var(--accent)/0.2)] block w-fit">
                      {group.year}
                    </span>
                    {group.events.map((ev, j) => (
                      <div key={j} className="relative space-y-1">
                        <div className="absolute w-2 h-2 rounded-full bg-[hsl(var(--accent))] -left-[21px] top-1.5" />
                        <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">{ev.title}</h4>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">{ev.date}</span>
                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 leading-relaxed">{ev.desc}</p>
                      </div>
                    ))}
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
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.first_name} {student.last_name}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Preferred Name</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.first_name}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Date of Birth</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.date_of_birth}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Gender</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.gender.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Nationality</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.nationality}</p>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Religion</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.religion}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[hsl(var(--text-tertiary))]">Residential Address</label>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5">{student.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* FAMILY TAB */}
        {activeTab === 'family' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Guardians cards */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Parents & Guardians</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {familyContacts.map((contact, j) => (
                  <div key={j} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{contact.name}</p>
                      {contact.isEmergency && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">EMERGENCY</span>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{contact.relationship}</p>
                    <div className="space-y-1.5 pt-2 text-xs text-[hsl(var(--text-secondary))]">
                      <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />{contact.phone}</p>
                      <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />{contact.email}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />{contact.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Siblings */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Linked Siblings</h3>
              <div className="space-y-2">
                {siblings.map(sib => (
                  <div key={sib.id} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                        {sib.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{sib.name}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">{sib.grade}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">{sib.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC TAB */}
        {activeTab === 'academic' && (
          <div className="glass-card animate-fade-in">
            <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))]">Assigned Subjects & Report Cards</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    {['Subject', 'Teacher', 'Grade', 'Academic Score'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {academicHistory.subjects.map(sub => (
                    <tr key={sub.name} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-[hsl(var(--text-primary))]">{sub.name}</td>
                      <td className="px-5 py-3 text-xs text-[hsl(var(--text-secondary))]">{sub.teacher}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">{sub.grade}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sub.score}%` }} />
                          </div>
                          <span className="text-xs text-[hsl(var(--text-primary))] font-semibold">{sub.score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Quick Summary stats */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Attendance Summary</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-base font-bold text-emerald-400">{attendanceData.present}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Present</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-base font-bold text-amber-400">{attendanceData.late}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Late</p>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-base font-bold text-rose-400">{attendanceData.absent}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Absent</p>
                </div>
              </div>
            </div>

            {/* Recent logs list */}
            <div className="lg:col-span-2 glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Daily Logs</h3>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {attendanceData.recent.map((log, k) => (
                  <div key={k} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-[hsl(var(--text-primary))]">{log.date}</span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded ${
                      log.status === 'Present' ? 'bg-emerald-500/15 text-emerald-400' :
                      log.status === 'Late' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-rose-500/15 text-rose-400'
                    }`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEDICAL TAB */}
        {activeTab === 'medical' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Quick Overview */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Clinical Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Blood Group</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">{medicalRecord.blood_group}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Allergies</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {medicalRecord.allergies.map(a => (
                      <span key={a} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Active Medications</span>
                  <p className="font-medium text-[hsl(var(--text-primary))] mt-0.5">{medicalRecord.medications.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Clinic visit logs */}
            <div className="lg:col-span-2 glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Clinic Visit Logs</h3>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {medicalRecord.clinic_visits.map((visit, k) => (
                  <div key={k} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{visit.complaint}</p>
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{visit.date}</span>
                    </div>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{visit.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DISCIPLINE TAB */}
        {activeTab === 'discipline' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Quick Metrics */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Behavior Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-base font-bold text-emerald-400">{disciplineRecord.rewards.length}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Awards &amp; Stars</p>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-base font-bold text-rose-400">{disciplineRecord.warnings}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Active Warnings</p>
                </div>
              </div>
            </div>

            {/* Rewards Logs */}
            <div className="lg:col-span-2 glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Awards &amp; Certifications</h3>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {disciplineRecord.rewards.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--text-tertiary))] py-4 text-center">No behavior record records logged.</p>
                ) : (
                  disciplineRecord.rewards.map((rew, k) => (
                    <div key={k} className="py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{rew.title}</p>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{rew.date}</span>
                      </div>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">Awarded by: {rew.awardedBy}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Quick Balance */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Fee Overview</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Outstanding Balance</span>
                  <span className="text-lg font-bold text-amber-400">${financialRecord.balance}</span>
                </div>
                <div>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] block">Scholarships &amp; Discounts</span>
                  <p className="font-semibold text-[hsl(var(--text-primary))] mt-0.5">{financialRecord.scholarship}</p>
                </div>
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="lg:col-span-2 glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Transaction Ledger</h3>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {financialRecord.history.map((tx, k) => (
                  <div key={k} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{tx.desc}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{tx.date} • {tx.method}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">${tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="glass-card p-5 animate-fade-in space-y-4">
            <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Digital Document Archive</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentDocuments.map(doc => (
                <div key={doc.name} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">{doc.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{doc.category} • {doc.size}</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline flex-shrink-0">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
