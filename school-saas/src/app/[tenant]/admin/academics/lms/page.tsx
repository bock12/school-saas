import { LayoutGrid, Plus, BookOpen, Video, ClipboardList, MessageSquare, TrendingUp, Users, Play, FileText, Star } from 'lucide-react';

const demoCourses = [
  { id: '1', title: 'Advanced Mathematics', grade: 'Grade 12', teacher: 'Mr. Asante', enrolled: 28, lessons: 24, assignments: 8, completion: 72, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20' },
  { id: '2', title: 'English Literature', grade: 'Grade 11', teacher: 'Ms. Williams', enrolled: 32, lessons: 20, assignments: 6, completion: 58, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
  { id: '3', title: 'Physics — Mechanics', grade: 'Grade 11', teacher: 'Dr. Mensah', enrolled: 25, lessons: 18, assignments: 10, completion: 45, color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20' },
  { id: '4', title: 'Organic Chemistry', grade: 'Grade 12', teacher: 'Mrs. Boateng', enrolled: 22, lessons: 22, assignments: 9, completion: 85, color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
  { id: '5', title: 'Modern History', grade: 'Grade 10', teacher: 'Ms. Owusu', enrolled: 30, lessons: 16, assignments: 5, completion: 30, color: 'from-pink-500/20 to-pink-600/10 border-pink-500/20' },
  { id: '6', title: 'ICT & Programming', grade: 'Grade 10', teacher: 'Mr. Agyei', enrolled: 35, lessons: 28, assignments: 12, completion: 62, color: 'from-teal-500/20 to-teal-600/10 border-teal-500/20' },
];

const recentMaterials = [
  { title: 'Quadratic Equations — Worksheet', type: 'assignment', course: 'Advanced Mathematics', date: '2 days ago' },
  { title: 'Chapter 5: The French Revolution', type: 'video', course: 'Modern History', date: '3 days ago' },
  { title: 'Organic Reactions Quiz', type: 'quiz', course: 'Organic Chemistry', date: '4 days ago' },
  { title: 'Newton\'s Laws — Lecture Notes', type: 'material', course: 'Physics — Mechanics', date: '5 days ago' },
];

const typeIcon: Record<string, typeof BookOpen> = {
  assignment: ClipboardList,
  video: Video,
  quiz: Star,
  material: FileText,
};
const typeColor: Record<string, string> = {
  assignment: 'text-blue-400 bg-blue-500/10',
  video: 'text-purple-400 bg-purple-500/10',
  quiz: 'text-amber-400 bg-amber-500/10',
  material: 'text-emerald-400 bg-emerald-500/10',
};

export default function LMSPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Learning Management System</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Courses, materials, assignments and learning analytics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      {/* LMS Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Courses', value: demoCourses.length, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Total Students', value: demoCourses.reduce((a, c) => a + c.enrolled, 0), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Video Lessons', value: 47, icon: Video, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Avg. Completion', value: `${Math.round(demoCourses.reduce((a, c) => a + c.completion, 0) / demoCourses.length)}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
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

      {/* Courses Grid */}
      <div>
        <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-widest mb-3">Active Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {demoCourses.map((course, i) => (
            <div key={course.id} className={`glass-card p-5 animate-fade-in bg-gradient-to-br border ${course.color}`} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[hsl(var(--text-primary))]" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]">{course.grade}</span>
              </div>
              <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-0.5">{course.title}</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] mb-4">{course.teacher}</p>
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                {[
                  { label: 'Students', value: course.enrolled },
                  { label: 'Lessons', value: course.lessons },
                  { label: 'Tasks', value: course.assignments },
                ].map(s => (
                  <div key={s.label} className="bg-[hsl(var(--bg-tertiary)/0.6)] rounded-lg p-2">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{s.value}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Completion</span>
                  <span className="text-[10px] font-semibold text-[hsl(var(--text-primary))]">{course.completion}%</span>
                </div>
                <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--info))] rounded-full transition-all" style={{ width: `${course.completion}%` }} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">
                  <Play className="w-3 h-3" />
                  Open
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">
                  <TrendingUp className="w-3 h-3" />
                  Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Materials */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">Recently Added Materials</h2>
          <button className="text-xs text-[hsl(var(--accent))] hover:underline">View all</button>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.5)]">
          {recentMaterials.map((m, i) => {
            const Icon = typeIcon[m.type];
            const cls = typeColor[m.type];
            return (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">{m.title}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{m.course}</p>
                </div>
                <span className="text-xs text-[hsl(var(--text-tertiary))] flex-shrink-0">{m.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
