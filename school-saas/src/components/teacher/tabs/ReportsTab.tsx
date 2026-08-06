'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { FileText, Download, BarChart3, Users, CheckSquare, AlertTriangle } from 'lucide-react';

const reportTypes = [
  { id: 'attendance', label: 'Attendance Report', icon: CheckSquare, color: 'from-teal-500 to-emerald-600', desc: 'Daily and monthly attendance by class' },
  { id: 'performance', label: 'Performance Report', icon: BarChart3, color: 'from-indigo-500 to-blue-600', desc: 'Score analysis and grade distribution' },
  { id: 'subject', label: 'Subject Report', icon: FileText, color: 'from-purple-500 to-violet-600', desc: 'Per-subject statistics and progress' },
  { id: 'student', label: 'Student Report', icon: Users, color: 'from-amber-500 to-orange-600', desc: 'Individual student progress report card' },
  { id: 'behaviour', label: 'Behaviour Report', icon: AlertTriangle, color: 'from-rose-500 to-red-600', desc: 'Incident summary and discipline records' },
  { id: 'class', label: 'Class Report', icon: BarChart3, color: 'from-cyan-500 to-teal-600', desc: 'Full class summary for term-end' },
];

const recentReports = [
  { name: 'SS2A Attendance — July 2026', type: 'attendance', date: '2026-07-31', format: 'PDF' },
  { name: 'Mathematics Performance — Term 2', type: 'performance', date: '2026-07-28', format: 'Excel' },
  { name: 'SS3A Subject Report — Further Maths', type: 'subject', date: '2026-07-25', format: 'PDF' },
];

export function ReportsTab({ teacher }: { teacher: TeacherData }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  function generate() {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Generate Reports</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">Generate and download detailed reports for your classes</p>
      </div>

      {/* Report Type Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportTypes.map((rt) => {
          const Icon = rt.icon;
          const isSelected = selected === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setSelected(isSelected ? null : rt.id)}
              className={`glass-card rounded-2xl p-5 text-left transition-all hover:shadow-md ${isSelected ? 'ring-1 ring-[hsl(var(--accent))]' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rt.color} flex items-center justify-center mb-3 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-black text-[hsl(var(--text-primary))] text-sm mb-1">{rt.label}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">{rt.desc}</p>
              {isSelected && (
                <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] font-black">Selected</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Configuration Panel */}
      {selected && (
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--accent)/0.2)]">
          <h3 className="font-black text-[hsl(var(--text-primary))] mb-4">Configure Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Class', options: ['All Classes', 'SS2A', 'SS2B', 'SS3A', 'JS3A', 'SS1A'] },
              { label: 'Term', options: ['Term 1', 'Term 2', 'Term 3'] },
              { label: 'Period', options: ['Full Term', 'Month', 'Week'] },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">{f.label}</label>
                <select className="w-full text-sm px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]">
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2">Export Format</label>
            <div className="flex gap-2">
              {(['pdf', 'excel', 'csv'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${format === f ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-all hover:scale-105 disabled:hover:scale-100"
            style={{ background: teacher.primaryColor }}
          >
            <Download className="w-4 h-4" />
            {generating ? 'Generating...' : `Generate & Download ${format.toUpperCase()}`}
          </button>
        </div>
      )}

      {/* Recent Reports */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-black text-[hsl(var(--text-primary))] mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {recentReports.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--bg-tertiary))] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4.5 h-4.5 text-[hsl(var(--accent))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{r.name}</p>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{new Date(r.date).toLocaleDateString()} · {r.format}</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--accent))] transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
