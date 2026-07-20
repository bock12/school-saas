import { UserCog, CalendarCheck, Star, ClipboardList, Plus, TrendingUp, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

const leaveRequests = [
  { id: '1', name: 'Mr. James Mwangi', role: 'Teacher', type: 'Annual Leave', from: 'Jul 10, 2026', to: 'Jul 14, 2026', days: 5, status: 'pending', reason: 'Family vacation' },
  { id: '2', name: 'Ms. Patricia Osei', role: 'Admin', type: 'Sick Leave', from: 'Jul 3, 2026', to: 'Jul 4, 2026', days: 2, status: 'approved', reason: 'Medical appointment' },
  { id: '3', name: 'Mr. Kwame Darko', role: 'Driver', type: 'Emergency Leave', from: 'Jul 2, 2026', to: 'Jul 2, 2026', days: 1, status: 'approved', reason: 'Family emergency' },
  { id: '4', name: 'Dr. Mensah', role: 'Teacher', type: 'Maternity Leave', from: 'Aug 1, 2026', to: 'Oct 31, 2026', days: 92, status: 'pending', reason: 'Maternity leave' },
];

const performanceReviews = [
  { name: 'Mr. Benjamin Asante', role: 'Accountant', score: 88, quarter: 'Q2 2026', status: 'completed' },
  { name: 'Ms. Abena Frimpong', role: 'Secretary', score: 92, quarter: 'Q2 2026', status: 'completed' },
  { name: 'Nurse Mary Amponsah', role: 'Nurse', score: 95, quarter: 'Q2 2026', status: 'completed' },
  { name: 'Mr. Kofi Asumadu', role: 'IT Support', score: 0, quarter: 'Q2 2026', status: 'pending' },
];

const leaveStatusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

export default function HRPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Human Resources</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Leave management, performance and staff development</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />
          New Leave Request
        </button>
      </div>

      {/* HR Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Leave Requests', value: leaveRequests.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: CalendarCheck },
          { label: 'Pending Approval', value: leaveRequests.filter(l => l.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
          { label: 'Reviews Due', value: performanceReviews.filter(r => r.status === 'pending').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: Star },
          { label: 'Completed Reviews', value: performanceReviews.filter(r => r.status === 'completed').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-xl border p-4 flex items-center gap-3 ${s.bg}`}>
              <Icon className={`w-6 h-6 flex-shrink-0 ${s.color}`} />
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leave Requests */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Leave Requests</h2>
            <button className="text-xs text-[hsl(var(--accent))] hover:underline">View all</button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {leaveRequests.map((req) => {
              const cfg = leaveStatusConfig[req.status];
              const Icon = cfg.icon;
              return (
                <div key={req.id} className="p-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{req.name}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{req.role} · {req.type}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-2.5 h-2.5" />{req.status}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{req.from} – {req.to} · {req.days} day{req.days !== 1 ? 's' : ''}</p>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                        <CheckCircle2 className="w-3 h-3" />Approve
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        <XCircle className="w-3 h-3" />Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Reviews */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Performance Reviews — Q2 2026</h2>
            <button className="text-xs text-[hsl(var(--accent))] hover:underline">Start Review</button>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.5)]">
            {performanceReviews.map((review, i) => (
              <div key={i} className="p-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold flex-shrink-0">
                    {review.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">{review.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{review.role}</p>
                  </div>
                  {review.status === 'completed' ? (
                    <div className="text-right flex-shrink-0">
                      <p className={`text-lg font-bold ${review.score >= 90 ? 'text-emerald-400' : review.score >= 75 ? 'text-blue-400' : 'text-amber-400'}`}>{review.score}%</p>
                      <div className="w-16 h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full ${review.score >= 90 ? 'bg-emerald-500' : review.score >= 75 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${review.score}%` }} />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">Due</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
