'use client';

import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  BarChart3, Download, Printer, FileText, CheckCircle2, X, FileSpreadsheet, Sparkles, Eye
} from 'lucide-react';
import { useState } from 'react';

const reportTypes = [
  { id: 'class-result', name: 'Class Result Report', desc: 'Full results for a selected class with grade breakdown and analysis', icon: '📋', format: 'PDF, Excel' },
  { id: 'broadsheet', name: 'School Master Broadsheet', desc: 'All students, all subjects, all scores in one master sheet', icon: '📊', format: 'PDF, Excel' },
  { id: 'subject-analysis', name: 'Subject Analysis Report', desc: 'Per-subject performance, pass rates, and grade distribution', icon: '🔬', format: 'PDF' },
  { id: 'teacher-performance', name: 'Teacher Performance Review', desc: 'Compare class averages by teacher for accountability review', icon: '👨‍🏫', format: 'PDF' },
  { id: 'attendance-report', name: 'Exam Attendance Summary', desc: 'Hall attendance, absences, and late entries summary', icon: '📅', format: 'PDF, Excel' },
  { id: 'malpractice-report', name: 'Malpractice Investigation Log', desc: 'All reported incidents, disciplinary status, and outcomes', icon: '🛡️', format: 'PDF' },
  { id: 'trend-report', name: 'Term-on-Term Trend Analysis', desc: 'Compare current term performance against previous terms', icon: '📈', format: 'PDF, Excel' },
  { id: 'invigilation-report', name: 'Invigilation Duty Roster', desc: 'Full roster with duty hours, halls, and supervisor sign-offs', icon: '📌', format: 'PDF' },
];

const initialRecentReports = [
  { name: 'SSS 1A End-of-Term Results 2026', date: 'Aug 22, 2026', format: 'PDF', size: '2.4 MB' },
  { name: 'Master Broadsheet Q3 2026', date: 'Aug 20, 2026', format: 'Excel', size: '1.8 MB' },
  { name: 'Subject Performance Analysis — Mathematics', date: 'Aug 18, 2026', format: 'PDF', size: '1.1 MB' },
  { name: 'Malpractice Committee Summary Report', date: 'Aug 15, 2026', format: 'PDF', size: '890 KB' },
];

export function ReportsTab({ officer }: { officer: OfficerData }) {
  const [recentReports, setRecentReports] = useState(initialRecentReports);
  const [successToast, setSuccessToast] = useState('');

  const handleGenerateReport = (reportName: string, format: string) => {
    const ext = format.includes('Excel') ? 'xlsx' : 'pdf';
    const filename = `${reportName.replace(/\s+/g, '_')}_2026.${ext}`;

    const newReport = {
      name: `${reportName} 2026`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      format: ext.toUpperCase(),
      size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
    };

    setRecentReports([newReport, ...recentReports]);

    // Download simulation
    const blob = new Blob([`Official Report: ${reportName}\nGenerated for: ${officer.tenantName}\nDate: ${new Date().toISOString()}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccessToast(`Report "${reportName}" generated and downloaded!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Reports Center</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Generate, export, and download official examination reports in PDF and Excel formats
          </p>
        </div>
      </div>

      {/* Report Generator Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportTypes.map(r => (
          <div
            key={r.id}
            className="glass-card rounded-2xl p-4 hover:border-violet-500/40 border border-[hsl(var(--border))] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="text-2xl mb-2">{r.icon}</div>
              <h3 className="font-black text-sm text-[hsl(var(--text-primary))] group-hover:text-violet-400 transition-colors">{r.name}</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 mb-4 leading-relaxed">{r.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border)/0.5)]">
              <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold">{r.format}</span>
              <button
                onClick={() => handleGenerateReport(r.name, r.format)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Generate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Generated Reports Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">Recent Generated Reports Log</h2>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {recentReports.map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                {r.format === 'EXCEL' ? <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5 text-violet-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">{r.name}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{r.date} • {r.format} Format • {r.size}</p>
              </div>
              <button
                onClick={() => handleGenerateReport(r.name, r.format)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-violet-500/20 text-[hsl(var(--text-secondary))] hover:text-violet-300 text-xs font-bold transition-colors flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
