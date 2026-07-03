import { TrendingUp, Download, BarChart3, Users, CalendarCheck, DollarSign, GraduationCap, BookOpen, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const reportCategories = [
  {
    title: 'Enrollment Trends',
    description: 'Student enrollment by grade, term and year',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    metrics: [{ label: 'Total Students', value: '847', change: '+4.2%', up: true }, { label: 'New Admissions', value: '63', change: '+12%', up: true }],
  },
  {
    title: 'Academic Performance',
    description: 'Grade distributions, GPA and subject analytics',
    icon: GraduationCap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    metrics: [{ label: 'School Avg GPA', value: '3.2', change: '+0.1', up: true }, { label: 'Pass Rate', value: '91%', change: '-2%', up: false }],
  },
  {
    title: 'Attendance Analytics',
    description: 'Daily, weekly and monthly attendance breakdown',
    icon: CalendarCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    metrics: [{ label: 'Avg Attendance', value: '92%', change: '+1.3%', up: true }, { label: 'Chronic Absent', value: '14', change: '-3', up: true }],
  },
  {
    title: 'Financial Reports',
    description: 'Fee collection, outstanding balances and expenses',
    icon: DollarSign,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    metrics: [{ label: 'Collected', value: '$324K', change: '+12%', up: true }, { label: 'Outstanding', value: '$28K', change: '-8%', up: true }],
  },
  {
    title: 'Staff Performance',
    description: 'Teacher evaluations and HR metrics',
    icon: BarChart3,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    metrics: [{ label: 'Avg Review Score', value: '88%', change: '+2%', up: true }, { label: 'Leave Rate', value: '4.2%', change: '+0.5%', up: false }],
  },
  {
    title: 'LMS Engagement',
    description: 'Course completion, assignment and quiz rates',
    icon: BookOpen,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    metrics: [{ label: 'Avg Completion', value: '59%', change: '+7%', up: true }, { label: 'Active Courses', value: '6', change: '0', up: true }],
  },
];

const quickReports = [
  { label: 'Monthly Attendance Report', type: 'PDF', date: 'Jul 2026' },
  { label: 'Q2 Financial Summary', type: 'Excel', date: 'Jun 2026' },
  { label: 'Mid-Term Exam Results', type: 'PDF', date: 'Jul 2026' },
  { label: 'Student Enrollment Report', type: 'PDF', date: 'Jul 2026' },
  { label: 'Staff Leave Summary', type: 'Excel', date: 'Jun 2026' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Reports & Analytics</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Executive insights, trends and custom report generation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <BarChart3 className="w-4 h-4" />Custom Report
        </button>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={cat.title} className="glass-card p-5 animate-fade-in cursor-pointer group hover:border-[hsl(var(--border-hover))] transition-all" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.bg}`}>
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--accent))] transition-colors" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-1">{cat.title}</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mb-4 leading-relaxed">{cat.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {cat.metrics.map((m, j) => (
                  <div key={j} className="bg-[hsl(var(--bg-tertiary)/0.6)] rounded-lg p-2.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <p className="text-base font-bold text-[hsl(var(--text-primary))]">{m.value}</p>
                      <span className={`text-[10px] font-medium flex items-center gap-0.5 ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>
                        {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {m.change}
                      </span>
                    </div>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{m.label}</p>
                  </div>
                ))}
              </div>
              <button className={`mt-4 w-full py-2 rounded-lg text-xs font-medium border transition-all ${cat.bg} ${cat.color} hover:opacity-80`}>
                View Full Report
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Download Reports */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Recent Reports</h2>
          <button className="text-xs text-[hsl(var(--accent))] hover:underline">View archive</button>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {quickReports.map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${r.type === 'PDF' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                {r.type}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">{r.label}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{r.date}</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-[hsl(var(--accent))] hover:underline flex-shrink-0">
                <Download className="w-3.5 h-3.5" />Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
