import { ClipboardList, CheckCircle2, XCircle, Clock, UserPlus, GraduationCap, DollarSign, CalendarCheck, Edit2, FileText } from 'lucide-react';

const approvals = [
  { id: '1', title: 'Admission — Priya Sharma (Grade 9)', type: 'admission', requestedBy: 'Admissions Office', date: 'Jul 2, 2026', priority: 'high', status: 'pending', details: 'New student admission pending final approval' },
  { id: '2', title: 'Grade Change — David Okafor (Math, Q2)', type: 'grade_change', requestedBy: 'Mr. Asante (Math Teacher)', date: 'Jul 1, 2026', priority: 'medium', status: 'pending', details: 'Score correction from 68 to 74 due to marking error' },
  { id: '3', title: 'Leave Request — Mr. James Mwangi (5 days)', type: 'leave', requestedBy: 'Mr. James Mwangi', date: 'Jun 30, 2026', priority: 'medium', status: 'pending', details: 'Annual leave Jul 10–14, 2026' },
  { id: '4', title: 'Fee Discount — Amara Johnson (30%)', type: 'fee_discount', requestedBy: 'Finance Office', date: 'Jun 29, 2026', priority: 'low', status: 'pending', details: 'Hardship waiver for Q3 tuition fees' },
  { id: '5', title: 'Purchase Request — 5 Projectors ($4,500)', type: 'purchase', requestedBy: 'ICT Department', date: 'Jun 28, 2026', priority: 'low', status: 'approved', details: 'Replacement projectors for Blocks A and B' },
  { id: '6', title: 'Attendance Correction — Grade 10A (Jun 18)', type: 'attendance', requestedBy: 'Mrs. Boateng', date: 'Jun 25, 2026', priority: 'low', status: 'approved', details: '3 students marked absent incorrectly' },
  { id: '7', title: 'Timetable Change — Swap Periods 3 & 5 (Thu)', type: 'timetable', requestedBy: 'Dr. Mensah (Physics)', date: 'Jun 20, 2026', priority: 'low', status: 'rejected', details: 'Room conflict with Chemistry lab' },
];

const typeConfig: Record<string, { icon: typeof ClipboardList; color: string; bg: string; label: string }> = {
  admission: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Admission' },
  grade_change: { icon: Edit2, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Grade Change' },
  leave: { icon: CalendarCheck, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Leave' },
  fee_discount: { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Fee Discount' },
  purchase: { icon: FileText, color: 'text-teal-400', bg: 'bg-teal-500/10', label: 'Purchase' },
  attendance: { icon: ClipboardList, color: 'text-pink-400', bg: 'bg-pink-500/10', label: 'Attendance' },
  timetable: { icon: GraduationCap, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Timetable' },
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Pending' },
  approved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Approved' },
  rejected: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Rejected' },
};

const priorityConfig: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  low: 'text-zinc-400 bg-zinc-500/10',
};

export default function ApprovalsPage() {
  const pending = approvals.filter(a => a.status === 'pending');
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Approvals</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review and approve pending requests across all departments</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
            {pending.length} awaiting your action
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: approvals.filter(a => a.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Approved', value: approvals.filter(a => a.status === 'approved').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Rejected', value: approvals.filter(a => a.status === 'rejected').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending First */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Pending Review</h2>
        {pending.map((item, i) => {
          const typeCfg = typeConfig[item.type] || typeConfig.admission;
          const Icon = typeCfg.icon;
          return (
            <div key={item.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeCfg.bg}`}>
                  <Icon className={`w-5 h-5 ${typeCfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{item.title}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${priorityConfig[item.priority]}`}>{item.priority}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeCfg.bg} ${typeCfg.color}`}>{typeCfg.label}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{item.details}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Requested by {item.requestedBy} · {item.date}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />Approve
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                    <XCircle className="w-4 h-4" />Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Processed */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest">Recently Processed</h2>
        {approvals.filter(a => a.status !== 'pending').map((item) => {
          const typeCfg = typeConfig[item.type] || typeConfig.admission;
          const stsCfg = statusConfig[item.status];
          const Icon = typeCfg.icon;
          return (
            <div key={item.id} className="glass-card p-4 opacity-75">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeCfg.bg}`}>
                  <Icon className={`w-4 h-4 ${typeCfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">{item.title}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{item.requestedBy} · {item.date}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${stsCfg.bg} ${stsCfg.color}`}>{stsCfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
