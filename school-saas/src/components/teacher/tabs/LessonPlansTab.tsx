'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Plus, BookOpen, Target, FileText, CheckSquare, ChevronDown, ChevronRight, Edit3, Eye } from 'lucide-react';

const weeks = [
  {
    id: 1, label: 'Week 1 — Introduction to Algebra', status: 'approved',
    plans: [
      { day: 'Monday', topic: 'Algebraic Expressions', objective: 'Students can identify and simplify algebraic terms', class: 'SS2A', duration: 45, hasMaterials: true, homework: 'Ex 1.1 Q1–10' },
      { day: 'Tuesday', topic: 'Equations & Inequalities', objective: 'Solve linear equations in one variable', class: 'SS2B', duration: 45, hasMaterials: true, homework: 'Worksheet 3' },
      { day: 'Wednesday', topic: 'Quadratic Equations', objective: 'Factorisation method for quadratics', class: 'SS3A', duration: 45, hasMaterials: false, homework: 'Practice Q1–15' },
    ],
  },
  {
    id: 2, label: 'Week 2 — Coordinate Geometry', status: 'draft',
    plans: [
      { day: 'Monday', topic: 'Straight Lines & Gradients', objective: 'Calculate gradient and y-intercept of straight lines', class: 'SS2A', duration: 45, hasMaterials: false, homework: 'Ex 2.1' },
      { day: 'Tuesday', topic: 'Distance & Midpoint', objective: 'Apply distance and midpoint formulae', class: 'SS2B', duration: 45, hasMaterials: false, homework: 'Pg 45 Q1–8' },
    ],
  },
  {
    id: 3, label: 'Week 3 — Trigonometry', status: 'pending',
    plans: [],
  },
];

const statusStyles: Record<string, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400',
  draft: 'bg-amber-500/15 text-amber-400',
  pending: 'bg-blue-500/15 text-blue-400',
};

export function LessonPlansTab({ teacher }: { teacher: TeacherData }) {
  const [openWeeks, setOpenWeeks] = useState<number[]>([1]);
  const [showForm, setShowForm] = useState(false);

  function toggleWeek(id: number) {
    setOpenWeeks((prev) => prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Lesson Plans</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Plan and track your weekly lessons</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:scale-105 transition-all"
          style={{ background: teacher.primaryColor }}
        >
          <Plus className="w-4 h-4" /> New Lesson Plan
        </button>
      </div>

      {/* New Plan Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--accent)/0.2)]">
          <h3 className="font-black text-[hsl(var(--text-primary))] mb-4">Create Lesson Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Week / Unit', placeholder: 'e.g. Week 3 — Trigonometry' },
              { label: 'Topic', placeholder: 'e.g. Sine Rule' },
              { label: 'Class', placeholder: 'e.g. SS2A' },
              { label: 'Duration (mins)', placeholder: '45', type: 'number' },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Learning Objectives</label>
              <textarea
                placeholder="Students will be able to..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Homework / Assignment</label>
              <input
                placeholder="e.g. Textbook pg 45 Q1–10"
                className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>Save Plan</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</button>
          </div>
        </div>
      )}

      {/* Week Plans */}
      <div className="space-y-3">
        {weeks.map((week) => {
          const isOpen = openWeeks.includes(week.id);
          return (
            <div key={week.id} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleWeek(week.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[hsl(var(--accent))]" />
                  <div className="text-left">
                    <p className="font-black text-[hsl(var(--text-primary))] text-sm">{week.label}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{week.plans.length} lesson{week.plans.length !== 1 ? 's' : ''} planned</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${statusStyles[week.status]}`}>
                    {week.status.charAt(0).toUpperCase() + week.status.slice(1)}
                  </span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /> : <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />}
              </button>

              {isOpen && (
                <div className="border-t border-[hsl(var(--border)/0.5)]">
                  {week.plans.length === 0 ? (
                    <div className="py-8 text-center">
                      <BookOpen className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto mb-2" />
                      <p className="text-sm text-[hsl(var(--text-tertiary))]">No lessons planned yet</p>
                      <button onClick={() => setShowForm(true)} className="mt-2 text-xs text-[hsl(var(--accent))] hover:underline">+ Add lesson plan</button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[hsl(var(--border)/0.4)]">
                      {week.plans.map((plan, i) => (
                        <div key={i} className="p-4 hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-[hsl(var(--accent))]">{plan.day}</span>
                                <span className="w-1 h-1 rounded-full bg-[hsl(var(--text-tertiary))]" />
                                <span className="text-xs font-black text-[hsl(var(--text-primary))]">{plan.topic}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{plan.class}</span>
                                <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{plan.duration} min</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5">
                                <Target className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                                <p className="text-xs text-[hsl(var(--text-secondary))]">{plan.objective}</p>
                              </div>
                              {plan.homework && (
                                <div className="flex items-center gap-1 mt-1">
                                  <CheckSquare className="w-3 h-3 text-amber-400" />
                                  <p className="text-xs text-[hsl(var(--text-tertiary))]">HW: {plan.homework}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              {plan.hasMaterials && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold">Materials</span>
                              )}
                              <button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"><Eye className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
