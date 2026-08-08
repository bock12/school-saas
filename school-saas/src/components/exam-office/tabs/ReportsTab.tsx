'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { BarChart3, Download, Printer, FileText } from 'lucide-react';

const reportTypes = [
  { id: 'class-result', name: 'Class Result Report', desc: 'Full results for a selected class with grade breakdown and analysis', icon: '📋', format: 'PDF, Excel' },
  { id: 'broadsheet', name: 'School Broadsheet', desc: 'All students, all subjects, all scores in one master sheet', icon: '📊', format: 'PDF, Excel' },
  { id: 'subject-analysis', name: 'Subject Analysis Report', desc: 'Per-subject performance, pass rates, and grade distribution', icon: '🔬', format: 'PDF' },
  { id: 'teacher-performance', name: 'Teacher Performance Report', desc: 'Compare class averages by teacher for accountability review', icon: '👨‍🏫', format: 'PDF' },
  { id: 'attendance-report', name: 'Exam Attendance Report', desc: 'Hall attendance, absences, and late entries summary', icon: '📅', format: 'PDF, Excel' },
  { id: 'malpractice-report', name: 'Malpractice Summary', desc: 'All incidents, their status, and outcomes', icon: '🛡️', format: 'PDF' },
  { id: 'trend-report', name: 'Term-on-Term Trend Report', desc: 'Compare this term with previous terms', icon: '📈', format: 'PDF, Excel' },
  { id: 'invigilation-report', name: 'Invigilation Duty Report', desc: 'Full roster with duty hours and hall assignments', icon: '📌', format: 'PDF' },
];

const recentReports = [
  { name: 'SSS 1A End-of-Term Results', date: 'Aug 22, 2026', format: 'PDF', size: '2.4 MB' },
  { name: 'School Broadsheet Q3 2026', date: 'Aug 20, 2026', format: 'Excel', size: '1.8 MB' },
  { name: 'Subject Analysis — Mathematics', date: 'Aug 18, 2026', format: 'PDF', size: '1.1 MB' },
];

export function ReportsTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Reports Center</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Generate, export, and download examination reports in PDF and Excel formats</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportTypes.map(r => (
          <div key={r.id} className="glass-card rounded-2xl p-4 hover:border-violet-500/30 border border-[hsl(var(--border))] transition-all cursor-pointer group">
            <div className="text-2xl mb-3">{r.icon}</div>
            <h3 className="font-black text-sm text-[hsl(var(--text-primary))] group-hover:text-violet-400 transition-colors">{r.name}</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 mb-3">{r.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold">{r.format}</span>
              <button className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                <Download className="w-3.5 h-3.5" /> Generate
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Recent Reports</h2>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {recentReports.map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">{r.name}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{r.date} • {r.format} • {r.size}</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:underline flex-shrink-0">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
