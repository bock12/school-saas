'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { BookOpen, Lock, Eye, Upload, Plus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const papers = [
  { id: '1', subject: 'Mathematics', class: 'SSS 2A/B/C', teacher: 'Mr. Conteh', status: 'Locked', version: 'v3', updated: '2 days ago', questions: 50, marks: 100 },
  { id: '2', subject: 'English Language', class: 'SSS 1A/B', teacher: 'Mrs. Kamara', status: 'Under Review', version: 'v2', updated: '4 days ago', questions: 60, marks: 100 },
  { id: '3', subject: 'Physics', class: 'SSS 3A', teacher: 'Mr. Bangura', status: 'Draft', version: 'v1', updated: '1 week ago', questions: 40, marks: 100 },
  { id: '4', subject: 'Chemistry', class: 'SSS 2A/B/C', teacher: 'Mr. Koroma', status: 'Approved', version: 'v2', updated: '3 days ago', questions: 50, marks: 100 },
  { id: '5', subject: 'Biology', class: 'SSS 3A/B', teacher: 'Mrs. Sesay', status: 'Draft', version: 'v1', updated: '5 days ago', questions: 50, marks: 100 },
];

const statusIcons: Record<string, any> = { Locked: Lock, 'Under Review': Eye, Draft: Clock, Approved: CheckCircle2 };
const statusColors: Record<string, string> = {
  Locked: 'text-blue-400 bg-blue-500/15',
  'Under Review': 'text-amber-400 bg-amber-500/15',
  Draft: 'text-slate-400 bg-slate-500/15',
  Approved: 'text-emerald-400 bg-emerald-500/15',
};

export function QuestionBankTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Question Papers & Document Security</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Manage exam paper submissions, versions, and security controls</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Upload className="w-4 h-4" /> Upload Paper
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Papers', value: papers.length, color: 'bg-indigo-500' },
          { label: 'Approved & Locked', value: papers.filter(p => p.status === 'Locked' || p.status === 'Approved').length, color: 'bg-emerald-500' },
          { label: 'Under Review', value: papers.filter(p => p.status === 'Under Review').length, color: 'bg-amber-500' },
          { label: 'Drafts Pending', value: papers.filter(p => p.status === 'Draft').length, color: 'bg-red-500' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div><p className="text-xl font-black text-[hsl(var(--text-primary))]">{s.value}</p><p className="text-xs text-[hsl(var(--text-secondary))]">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Question Papers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Subject', 'Class', 'Teacher', 'Questions', 'Max Marks', 'Version', 'Last Updated', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {papers.map((p) => {
                const StatusIcon = statusIcons[p.status] || Clock;
                return (
                  <tr key={p.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="py-3 px-4 font-bold text-[hsl(var(--text-primary))]">{p.subject}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{p.class}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{p.teacher}</td>
                    <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{p.questions}</td>
                    <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{p.marks}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))]">{p.version}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))]">{p.updated}</td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[p.status]}`}>
                        <StatusIcon className="w-3 h-3" />{p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button className="text-xs px-2 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] hover:bg-violet-500/20 text-[hsl(var(--text-secondary))] hover:text-violet-400 transition-colors">View</button>
                        <button className="text-xs px-2 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] hover:bg-amber-500/20 text-[hsl(var(--text-secondary))] hover:text-amber-400 transition-colors">Review</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
