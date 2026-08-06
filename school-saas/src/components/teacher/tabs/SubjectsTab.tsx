'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { BookOpen, Users, CheckSquare, Award, TrendingUp, Edit3 } from 'lucide-react';

const subjects = [
  {
    id: '1', name: 'Mathematics', code: 'MTH301', classes: ['SS1A', 'SS2A', 'SS2B', 'JS3A'],
    lessonsCompleted: 18, totalLessons: 24, assignments: 7, avgScore: 71, students: 154, passRate: 78,
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: '2', name: 'Further Mathematics', code: 'FMT301', classes: ['SS3A'],
    lessonsCompleted: 14, totalLessons: 20, assignments: 5, avgScore: 65, students: 33, passRate: 64,
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: '3', name: 'SS1 Mathematics', code: 'MTH101', classes: ['SS1A'],
    lessonsCompleted: 20, totalLessons: 24, assignments: 9, avgScore: 68, students: 40, passRate: 72,
    color: 'from-cyan-500 to-teal-600',
  },
];

export function SubjectsTab({ teacher }: { teacher: TeacherData }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">My Subjects</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">{subjects.length} subjects · {subjects.reduce((s, c) => s + c.students, 0)} total students</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Subjects', value: subjects.length, color: 'bg-indigo-500' },
          { label: 'Total Lessons Done', value: subjects.reduce((s, c) => s + c.lessonsCompleted, 0), color: 'bg-blue-500' },
          { label: 'Avg Score', value: `${Math.round(subjects.reduce((s, c) => s + c.avgScore, 0) / subjects.length)}%`, color: 'bg-purple-500' },
          { label: 'Avg Pass Rate', value: `${Math.round(subjects.reduce((s, c) => s + c.passRate, 0) / subjects.length)}%`, color: 'bg-emerald-500' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
            <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{stat.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Subject Cards */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const lessonPct = Math.round((subject.lessonsCompleted / subject.totalLessons) * 100);
          return (
            <div key={subject.id} className="glass-card rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg`}>
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[hsl(var(--text-primary))]">{subject.name}</h2>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{subject.code}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {subject.classes.map((c) => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors self-start">
                  <Edit3 className="w-3.5 h-3.5" />Manage
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: 'Students', value: subject.students, icon: Users, color: 'text-blue-400' },
                  { label: 'Assignments', value: subject.assignments, icon: CheckSquare, color: 'text-amber-400' },
                  { label: 'Average Score', value: `${subject.avgScore}%`, icon: Award, color: 'text-purple-400' },
                  { label: 'Pass Rate', value: `${subject.passRate}%`, icon: TrendingUp, color: 'text-emerald-400' },
                  { label: 'Lessons Done', value: `${subject.lessonsCompleted}/${subject.totalLessons}`, icon: BookOpen, color: 'text-indigo-400' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)]">
                      <Icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                      <p className="text-base font-black text-[hsl(var(--text-primary))]">{stat.value}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Lesson Progress */}
              <div className="mt-4 pt-4 border-t border-[hsl(var(--border)/0.5)]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[hsl(var(--text-secondary))] font-semibold">Curriculum Progress</span>
                  <span className="font-black text-[hsl(var(--text-primary))]">{lessonPct}%</span>
                </div>
                <div className="h-2 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${subject.color}`}
                    style={{ width: `${lessonPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">
                  {subject.lessonsCompleted} of {subject.totalLessons} lessons completed
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
