'use client';

import { StatCard } from '@/components/super-admin/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, Users, CalendarCheck, BarChart3, User, Heart } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const student = {
  id: '1', first_name: 'Amara', last_name: 'Johnson', admission_number: 'STU-001',
  email: 'amara@school.edu', phone: '+1 555-0201', gender: 'female',
  date_of_birth: '2010-03-15', blood_group: 'O+', address: '456 Elm Street, Springfield',
  class: 'Grade 10', section: 'A',
  guardian_name: 'Mrs. Patricia Johnson', guardian_phone: '+1 555-0101', guardian_email: 'patricia@gmail.com', guardian_relationship: 'Mother',
  is_active: true, admitted_at: '2025-09-01',
  attendance_rate: 94, current_gpa: 3.7, total_fees_due: 2400, fees_paid: 1800,
};

const recentGrades = [
  { subject: 'Mathematics', score: 92, grade: 'A', term: 'Term 1' },
  { subject: 'English', score: 88, grade: 'A-', term: 'Term 1' },
  { subject: 'Science', score: 76, grade: 'B+', term: 'Term 1' },
  { subject: 'History', score: 85, grade: 'A-', term: 'Term 1' },
  { subject: 'Art', score: 95, grade: 'A+', term: 'Term 1' },
];

const attendanceRecent = [
  { date: '2026-06-23', status: 'present' },
  { date: '2026-06-22', status: 'present' },
  { date: '2026-06-21', status: 'late' },
  { date: '2026-06-20', status: 'present' },
  { date: '2026-06-19', status: 'absent' },
  { date: '2026-06-18', status: 'present' },
  { date: '2026-06-17', status: 'present' },
];

export default function StudentDetailPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <Link href={`/${tenant}/students`} className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </Link>

      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-400 text-xl font-bold">
              AJ
            </div>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--text-primary))]">{student.first_name} {student.last_name}</h1>
              <p className="text-sm text-[hsl(var(--text-tertiary))] mt-0.5">
                <code className="text-xs font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{student.admission_number}</code>
                <span className="mx-2">•</span>
                {student.class} — Section {student.section}
              </p>
              <div className="mt-2"><StatusBadge status={student.is_active ? 'active' : 'suspended'} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${student.attendance_rate}%`} icon={CalendarCheck} accentColor="hsl(142, 71%, 45%)" />
        <StatCard title="Current GPA" value={String(student.current_gpa)} icon={BarChart3} accentColor="hsl(250, 90%, 65%)" />
        <StatCard title="Fees Paid" value={`$${student.fees_paid}`} subtitle={`of $${student.total_fees_due}`} icon={Users} accentColor="hsl(38, 92%, 50%)" />
        <StatCard title="Class Rank" value="#5" subtitle="of 42 students" icon={BookOpen} accentColor="hsl(217, 91%, 60%)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal Info */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-4">Personal Information</h2>
          <div className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: student.email },
              { icon: Phone, label: 'Phone', value: student.phone },
              { icon: MapPin, label: 'Address', value: student.address },
              { icon: Calendar, label: 'Date of Birth', value: new Date(student.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { icon: User, label: 'Gender', value: student.gender.charAt(0).toUpperCase() + student.gender.slice(1) },
              { icon: Heart, label: 'Blood Group', value: student.blood_group },
              { icon: Calendar, label: 'Admitted', value: new Date(student.admitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-2">
                <item.icon className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                <span className="text-xs text-[hsl(var(--text-tertiary))] w-24">{item.label}</span>
                <span className="text-sm text-[hsl(var(--text-primary))]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guardian Info */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-4">Guardian Information</h2>
          <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
            <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{student.guardian_name}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{student.guardian_relationship}</p>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-2"><Phone className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{student.guardian_phone}</p>
              <p className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-2"><Mail className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />{student.guardian_email}</p>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-6 mb-3">Recent Attendance</h3>
          <div className="flex gap-1.5">
            {attendanceRecent.map((a, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  a.status === 'present' ? 'bg-emerald-500/15 text-emerald-400' :
                  a.status === 'late' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400'
                }`}>
                  {a.status === 'present' ? 'P' : a.status === 'late' ? 'L' : 'A'}
                </div>
                <span className="text-[9px] text-[hsl(var(--text-tertiary))]">
                  {new Date(a.date).toLocaleDateString('en-US', { day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="glass-card">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Current Term Grades</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Subject', 'Score', 'Grade', 'Term'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentGrades.map(g => (
                <tr key={g.subject} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-[hsl(var(--text-primary))]">{g.subject}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))]">
                        <div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${g.score}%` }} />
                      </div>
                      <span className="text-sm text-[hsl(var(--text-secondary))]">{g.score}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      g.grade.startsWith('A') ? 'bg-emerald-500/15 text-emerald-400' :
                      g.grade.startsWith('B') ? 'bg-blue-500/15 text-blue-400' :
                      'bg-amber-500/15 text-amber-400'
                    }`}>{g.grade}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[hsl(var(--text-tertiary))]">{g.term}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
