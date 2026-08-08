'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const events = [
  { date: 'Aug 18, 2026', event: 'End-of-Term Examinations Begin', type: 'exam', status: 'active' },
  { date: 'Aug 18, 2026', event: 'Mathematics — SSS 1, 2, 3', type: 'subject', status: 'active' },
  { date: 'Aug 19, 2026', event: 'Physics — SSS 2, 3', type: 'subject', status: 'upcoming' },
  { date: 'Aug 20, 2026', event: 'Chemistry & Biology — SSS 2, 3', type: 'subject', status: 'upcoming' },
  { date: 'Aug 22, 2026', event: 'Mark Entry Deadline (Teachers)', type: 'deadline', status: 'upcoming' },
  { date: 'Aug 25, 2026', event: 'HOD Moderation Deadline', type: 'deadline', status: 'upcoming' },
  { date: 'Aug 27, 2026', event: 'Principal Approval Deadline', type: 'deadline', status: 'upcoming' },
  { date: 'Aug 29, 2026', event: 'End-of-Term Examinations End', type: 'exam', status: 'upcoming' },
  { date: 'Sep 1, 2026', event: 'Result Publication (Portal Opens)', type: 'publication', status: 'upcoming' },
  { date: 'Sep 3, 2026', event: 'Certificate & Transcript Generation', type: 'admin', status: 'upcoming' },
];

const typeColors: Record<string, string> = {
  exam: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  subject: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  deadline: 'bg-red-500/15 text-red-400 border-red-500/20',
  publication: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  admin: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

export function CalendarTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Examination Calendar</h1>
        <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">All critical exam dates, subject schedules, and administrative deadlines in one view</p>
      </div>

      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${typeColors[e.type]} ${e.status === 'active' ? 'ring-1 ring-violet-500/30' : ''} transition-all`}>
            <div className="flex-shrink-0 text-center min-w-[52px]">
              <p className="text-xs font-black text-[hsl(var(--text-primary))]">{e.date.split(',')[0].split(' ')[1]}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase">{e.date.split(' ')[0]}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{e.event}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[e.type]}`}>{e.type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex-shrink-0">
              {e.status === 'active' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE</span>
              ) : (
                <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Upcoming</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
