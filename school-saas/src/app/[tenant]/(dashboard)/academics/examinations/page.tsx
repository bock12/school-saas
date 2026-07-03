import { FlaskConical, Plus, Calendar, CheckCircle2, Clock, BarChart3, Users, FileText, Edit2 } from 'lucide-react';

const demoExams = [
  { id: '1', name: 'Mid-Term Examination', term: 'Term 2', startDate: 'Jul 7, 2026', endDate: 'Jul 11, 2026', classes: ['Grade 9','Grade 10','Grade 11','Grade 12'], status: 'upcoming', type: 'Mid-Term' },
  { id: '2', name: 'Monthly Assessment — June', term: 'Term 2', startDate: 'Jun 20, 2026', endDate: 'Jun 22, 2026', classes: ['All Classes'], status: 'completed', type: 'Assessment' },
  { id: '3', name: 'End of Term 1 Exams', term: 'Term 1', startDate: 'Mar 15, 2026', endDate: 'Mar 20, 2026', classes: ['All Classes'], status: 'completed', type: 'End-of-Term' },
  { id: '4', name: 'WASSCE Mock 1', term: 'Term 2', startDate: 'Jul 20, 2026', endDate: 'Jul 25, 2026', classes: ['Grade 12'], status: 'upcoming', type: 'Mock' },
];

const examSubjects = [
  { subject: 'Mathematics', date: 'Jul 7', time: '9:00 AM', duration: '3 hrs', room: 'Hall A', invigilator: 'Mr. Asante', marksEntry: 'pending' },
  { subject: 'English Language', date: 'Jul 8', time: '9:00 AM', duration: '2.5 hrs', room: 'Hall B', invigilator: 'Ms. Williams', marksEntry: 'pending' },
  { subject: 'Physics', date: 'Jul 9', time: '9:00 AM', duration: '2.5 hrs', room: 'Hall A', invigilator: 'Dr. Mensah', marksEntry: 'pending' },
  { subject: 'Chemistry', date: 'Jul 9', time: '2:00 PM', duration: '2.5 hrs', room: 'Lab 1', invigilator: 'Mrs. Boateng', marksEntry: 'pending' },
  { subject: 'Biology', date: 'Jul 10', time: '9:00 AM', duration: '2.5 hrs', room: 'Hall B', invigilator: 'Mr. Antwi', marksEntry: 'pending' },
  { subject: 'History', date: 'Jul 11', time: '9:00 AM', duration: '2 hrs', room: 'Room 101', invigilator: 'Ms. Owusu', marksEntry: 'pending' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  upcoming: { label: 'Upcoming', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ongoing: { label: 'Ongoing', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

export default function ExaminationsPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Examinations</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Manage exams, marks entry, and result publication</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />
          Create Exam
        </button>
      </div>

      {/* Exam Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {demoExams.map((exam, i) => {
          const cfg = statusConfig[exam.status];
          return (
            <div key={exam.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-[hsl(var(--accent))]" />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
              </div>
              <h3 className="font-semibold text-[hsl(var(--text-primary))] text-sm leading-tight mb-1">{exam.name}</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mb-3">{exam.term}</p>
              <div className="space-y-1.5">
                <p className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                  {exam.startDate} – {exam.endDate}
                </p>
                <p className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                  {exam.classes.join(', ')}
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-lg text-xs font-medium text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] hover:bg-[hsl(var(--accent)/0.2)] transition-colors">
                {exam.status === 'completed' ? 'View Results' : 'Manage Exam'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Subject Schedule for upcoming exam */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Mid-Term Examination Schedule</h2>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Jul 7–11, 2026 • All Grade Classes</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <FileText className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Subject', 'Date', 'Time', 'Duration', 'Room', 'Invigilator', 'Marks Entry', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examSubjects.map((sub, i) => (
                <tr key={i} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{sub.subject}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))] whitespace-nowrap">{sub.date}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))] whitespace-nowrap">{sub.time}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{sub.duration}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{sub.room}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))] whitespace-nowrap">{sub.invigilator}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline">
                      <Edit2 className="w-3 h-3" />
                      Enter Marks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
