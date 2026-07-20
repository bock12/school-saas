import { Scale, AlertTriangle, Plus, Heart, MessageSquare, Shield, CheckCircle2, Clock, User } from 'lucide-react';

const incidents = [
  { id: '1', student: 'Kevin Asante', grade: 'Grade 10', type: 'Bullying', description: 'Reported bullying of junior student in corridor', date: 'Jul 2, 2026', severity: 'high', status: 'under_review', assignedTo: 'Ms. Counselor Ama' },
  { id: '2', student: 'Brian Mensah', grade: 'Grade 12', type: 'Academic Dishonesty', description: 'Caught with phone during mid-term exam', date: 'Jun 28, 2026', severity: 'medium', status: 'resolved', assignedTo: 'Mr. Vice Principal' },
  { id: '3', student: 'Sandra Osei', grade: 'Grade 9', type: 'Truancy', description: 'Absent without excuse for 3 consecutive days', date: 'Jun 25, 2026', severity: 'medium', status: 'resolved', assignedTo: 'Form Teacher' },
  { id: '4', student: 'Paul Darko', grade: 'Grade 11', type: 'Misconduct', description: 'Vandalism of school property — desk carving', date: 'Jun 20, 2026', severity: 'low', status: 'closed', assignedTo: 'House Master' },
];

const counselingSessions = [
  { id: '1', student: 'Kevin Asante', type: 'Behavioral', date: 'Jul 3, 2026', counselor: 'Ms. Ama Owusu', status: 'scheduled' },
  { id: '2', student: 'Sandra Osei', type: 'Academic Support', date: 'Jun 30, 2026', counselor: 'Ms. Ama Owusu', status: 'completed' },
  { id: '3', student: 'Priya Sharma', type: 'Emotional Wellness', date: 'Jun 27, 2026', counselor: 'Ms. Ama Owusu', status: 'completed' },
];

const rewards = [
  { student: 'Amara Johnson', award: 'Student of the Month', date: 'Jun 2026', reason: 'Outstanding academic performance' },
  { student: 'David Okafor', award: 'Sports Excellence', date: 'Jun 2026', reason: 'Regional athletics champion' },
];

const severityConfig: Record<string, { color: string; bg: string }> = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  low: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  under_review: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Under Review' },
  resolved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Resolved' },
  closed: { color: 'text-zinc-400', bg: 'bg-zinc-500/10', label: 'Closed' },
  scheduled: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Scheduled' },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
};

export default function WelfarePage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Welfare & Discipline</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Behavior records, counseling, rewards and student welfare</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />Log Incident
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open Incidents', value: incidents.filter(i => i.status === 'under_review').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Resolved', value: incidents.filter(i => i.status === 'resolved').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Counseling Sessions', value: counselingSessions.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Awards Given', value: rewards.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incidents */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Incident Reports</h2>
            <button className="text-xs text-[hsl(var(--accent))] hover:underline">View all</button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {incidents.map(inc => {
              const sev = severityConfig[inc.severity];
              const sts = statusConfig[inc.status];
              return (
                <div key={inc.id} className="p-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{inc.student}</p>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{inc.grade}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${sev.bg} ${sev.color}`}>{inc.severity.toUpperCase()}</span>
                      </div>
                      <p className="text-xs font-medium text-[hsl(var(--text-secondary))] mt-0.5">{inc.type}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{inc.description}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${sts.bg} ${sts.color}`}>{sts.label}</span>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{inc.date} · {inc.assignedTo}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Counseling */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" />Counseling</h2>
            </div>
            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {counselingSessions.map(s => {
                const sts = statusConfig[s.status];
                return (
                  <div key={s.id} className="p-3 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{s.student}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sts.bg} ${sts.color}`}>{sts.label}</span>
                    </div>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{s.type} · {s.date}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rewards */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" />Rewards & Awards</h2>
            </div>
            <div className="divide-y divide-[hsl(var(--border)/0.5)]">
              {rewards.map((r, i) => (
                <div key={i} className="p-3 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{r.student}</p>
                  <p className="text-xs font-medium text-amber-400">{r.award}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
