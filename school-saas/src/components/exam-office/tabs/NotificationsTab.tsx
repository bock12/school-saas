'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Bell, AlertTriangle, CheckCircle2, Info, Clock } from 'lucide-react';

const notifications = [
  { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', title: 'Marks overdue — Physics SSS 1A', body: 'Mr. Bangura has not submitted Physics marks for SSS 1A. Deadline was Aug 22.', time: '2 hrs ago', unread: true },
  { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Results published — SSS 3A', body: 'SSS 3A End-of-Term results are now live on the student portal. 32 students notified.', time: '4 hrs ago', unread: true },
  { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'HOD Approval received — Chemistry SSS 2A', body: 'Dr. Koroma approved Chemistry results for SSS 2A. Ready for your review.', time: '6 hrs ago', unread: false },
  { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'Result appeal submitted', body: 'John Kamara (SSS 2A) has appealed Physics score (52%). Claims correct score is 68%.', time: '8 hrs ago', unread: false },
  { icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10', title: 'Moderation deadline approaching', body: 'HOD moderation deadline is Aug 25. 3 subjects still pending review.', time: '1 day ago', unread: false },
  { icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-500/10', title: 'Principal signed off SSS 3A results', body: 'Principal approved End-of-Term results for SSS 3A. Publication authorized.', time: '1 day ago', unread: false },
];

export function NotificationsTab({ officer }: { officer: OfficerData }) {
  const unread = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Notifications</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">All examination alerts, approvals, and deadline reminders</p>
        </div>
        {unread > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 text-xs font-bold">{unread} unread</span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <div key={i} className={`flex gap-4 p-4 rounded-2xl border transition-all ${n.unread ? 'border-violet-500/30 bg-violet-500/5' : 'glass-card border-[hsl(var(--border))]'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.bg}`}>
              <n.icon className={`w-4 h-4 ${n.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-bold ${n.unread ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-secondary))]'}`}>{n.title}</p>
                {n.unread && <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />}
              </div>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 leading-relaxed">{n.body}</p>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
