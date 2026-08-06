'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { User, Camera, Award, TrendingUp, BookOpen, CheckSquare, Calendar, Edit3, Save, X } from 'lucide-react';

const achievements = [
  { icon: Award, label: 'Top Teacher Q1 2026', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  { icon: TrendingUp, label: '95% Attendance Record', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { icon: BookOpen, label: '100 Lesson Plans Created', color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
  { icon: CheckSquare, label: 'Zero Missed Attendance', color: 'text-blue-400', bg: 'bg-blue-500/15' },
];

const stats = [
  { label: 'Years Teaching', value: '8' },
  { label: 'Classes Handled', value: '5' },
  { label: 'Students This Term', value: '187' },
  { label: 'Lessons This Term', value: '52' },
  { label: 'Avg Student Score', value: '72%' },
  { label: 'Avg Attendance', value: '89%' },
];

export function ProfileTab({ teacher }: { teacher: TeacherData }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">My Profile</h1>
        <button
          onClick={() => setEditing(!editing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${editing ? 'bg-emerald-500 text-white' : 'border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}
        >
          {editing ? <><Save className="w-4 h-4" /> Save Profile</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
        </button>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${teacher.primaryColor}22, ${teacher.primaryColor}08)`, border: `1px solid ${teacher.primaryColor}30` }}
      >
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.3)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center">
              <User className="w-12 h-12 text-[hsl(var(--accent))]" />
            </div>
            {editing && (
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[hsl(var(--accent))] text-white flex items-center justify-center shadow-md">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-[hsl(var(--text-primary))]">{teacher.name}</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">{teacher.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] font-semibold capitalize">
                {teacher.role.replace('_', ' ')}
              </span>
              {teacher.department && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">
                  {teacher.department}
                </span>
              )}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">
                {teacher.tenantName}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: teacher.primaryColor }} />
      </div>

      {/* Edit Form (shown when editing) */}
      {editing && (
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--accent)/0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[hsl(var(--text-primary))]">Edit Profile Details</h3>
            <button onClick={() => setEditing(false)}><X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: teacher.name },
              { label: 'Phone Number', value: '', placeholder: '+234 800 000 0000' },
              { label: 'NIN / Staff ID', value: '', placeholder: 'National ID / Staff Number' },
              { label: 'Qualifications', value: '', placeholder: 'e.g. B.Ed Mathematics, PGDE' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">{f.label}</label>
                <input defaultValue={f.value} placeholder={f.placeholder} className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Bio</label>
              <textarea rows={3} placeholder="A short professional bio..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Career Stats */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-black text-[hsl(var(--text-primary))] mb-4 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--accent))]" /> Career Statistics
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                <p className="text-xl font-black text-[hsl(var(--text-primary))]">{stat.value}</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-black text-[hsl(var(--text-primary))] mb-4 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Achievements & Badges
          </h2>
          <div className="space-y-3">
            {achievements.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                  <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${a.color}`} />
                  </div>
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{a.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
