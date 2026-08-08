'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Shield, Clock } from 'lucide-react';

const logs = [
  { time: '2026-08-22 14:33:12', user: 'exam.officer@school.com', action: 'Published SSS 3A End-of-Term Results', module: 'Publication', ip: '192.168.1.14' },
  { time: '2026-08-22 13:11:07', user: 'principal@school.com', action: 'Approved SSS 3A results — Principal sign-off', module: 'Approval', ip: '192.168.1.2' },
  { time: '2026-08-22 11:44:53', user: 'exam.officer@school.com', action: 'Score correction approved — John Kamara, Physics', module: 'Appeals', ip: '192.168.1.14' },
  { time: '2026-08-21 16:02:39', user: 'hod.sciences@school.com', action: 'Moderated and approved Physics results — SSS 2A', module: 'Moderation', ip: '192.168.1.7' },
  { time: '2026-08-21 09:15:22', user: 'mr.conteh@school.com', action: 'Submitted Mathematics marks — SSS 1A (38 students)', module: 'Score Entry', ip: '192.168.1.18' },
  { time: '2026-08-20 08:55:01', user: 'exam.officer@school.com', action: 'Locked question paper — Mathematics SSS 2 v3', module: 'Question Bank', ip: '192.168.1.14' },
  { time: '2026-08-19 17:30:44', user: 'exam.officer@school.com', action: 'Malpractice incident INC-001 reported — Physics Hall A', module: 'Malpractice', ip: '192.168.1.14' },
  { time: '2026-08-18 07:58:12', user: 'system', action: 'End-of-Term Examination session created', module: 'Sessions', ip: 'System' },
];

const moduleColors: Record<string, string> = {
  Publication: 'text-emerald-400',
  Approval: 'text-blue-400',
  Appeals: 'text-violet-400',
  Moderation: 'text-purple-400',
  'Score Entry': 'text-amber-400',
  'Question Bank': 'text-indigo-400',
  Malpractice: 'text-red-400',
  Sessions: 'text-teal-400',
};

export function AuditTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Audit & Security Log</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Complete immutable audit trail of all examination-related actions and system changes</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[hsl(var(--border))] flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          <h2 className="font-black text-[hsl(var(--text-primary))] text-sm">Security Audit Trail</h2>
          <span className="ml-auto text-xs text-[hsl(var(--text-tertiary))]">Showing latest 8 entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Timestamp', 'User', 'Action', 'Module', 'IP Address'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {logs.map((l, i) => (
                <tr key={i} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[hsl(var(--text-tertiary))] flex-shrink-0" />
                      <span className="text-xs text-[hsl(var(--text-tertiary))] font-mono whitespace-nowrap">{l.time}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-secondary))] max-w-[140px] truncate">{l.user}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-primary))] max-w-xs">{l.action}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] ${moduleColors[l.module] || 'text-[hsl(var(--text-secondary))]'}`}>{l.module}</span>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-[hsl(var(--text-tertiary))]">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
