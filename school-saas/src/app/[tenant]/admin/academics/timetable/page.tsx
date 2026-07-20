import { Clock, Plus, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = ['7:30 – 8:15', '8:15 – 9:00', '9:00 – 9:45', 'Break', '10:00 – 10:45', '10:45 – 11:30', '11:30 – 12:15', 'Lunch', '13:00 – 13:45', '13:45 – 14:30', '14:30 – 15:15'];

const subjectColors = ['bg-purple-500/15 text-purple-300 border-purple-500/20','bg-blue-500/15 text-blue-300 border-blue-500/20','bg-emerald-500/15 text-emerald-300 border-emerald-500/20','bg-amber-500/15 text-amber-300 border-amber-500/20','bg-pink-500/15 text-pink-300 border-pink-500/20','bg-teal-500/15 text-teal-300 border-teal-500/20'];

const timetable: Record<string, Record<string, { subject: string; teacher: string } | null>> = {
  'Monday': {
    '7:30 – 8:15': { subject: 'Mathematics', teacher: 'Mr. Asante' },
    '8:15 – 9:00': { subject: 'English', teacher: 'Ms. Williams' },
    '9:00 – 9:45': { subject: 'Physics', teacher: 'Dr. Mensah' },
    'Break': null,
    '10:00 – 10:45': { subject: 'Chemistry', teacher: 'Mrs. Boateng' },
    '10:45 – 11:30': { subject: 'Biology', teacher: 'Mr. Antwi' },
    '11:30 – 12:15': { subject: 'History', teacher: 'Ms. Owusu' },
    'Lunch': null,
    '13:00 – 13:45': { subject: 'Geography', teacher: 'Mr. Darko' },
    '13:45 – 14:30': { subject: 'ICT', teacher: 'Mr. Agyei' },
    '14:30 – 15:15': { subject: 'PE', teacher: 'Coach Asare' },
  },
  'Tuesday': {
    '7:30 – 8:15': { subject: 'English', teacher: 'Ms. Williams' },
    '8:15 – 9:00': { subject: 'Mathematics', teacher: 'Mr. Asante' },
    '9:00 – 9:45': { subject: 'ICT', teacher: 'Mr. Agyei' },
    'Break': null,
    '10:00 – 10:45': { subject: 'Physics', teacher: 'Dr. Mensah' },
    '10:45 – 11:30': { subject: 'Biology', teacher: 'Mr. Antwi' },
    '11:30 – 12:15': { subject: 'Geography', teacher: 'Mr. Darko' },
    'Lunch': null,
    '13:00 – 13:45': { subject: 'Chemistry', teacher: 'Mrs. Boateng' },
    '13:45 – 14:30': { subject: 'History', teacher: 'Ms. Owusu' },
    '14:30 – 15:15': { subject: 'PE', teacher: 'Coach Asare' },
  },
  'Wednesday': {
    '7:30 – 8:15': { subject: 'Mathematics', teacher: 'Mr. Asante' },
    '8:15 – 9:00': { subject: 'Chemistry', teacher: 'Mrs. Boateng' },
    '9:00 – 9:45': { subject: 'English', teacher: 'Ms. Williams' },
    'Break': null,
    '10:00 – 10:45': { subject: 'Biology', teacher: 'Mr. Antwi' },
    '10:45 – 11:30': { subject: 'ICT', teacher: 'Mr. Agyei' },
    '11:30 – 12:15': { subject: 'History', teacher: 'Ms. Owusu' },
    'Lunch': null,
    '13:00 – 13:45': { subject: 'Physics', teacher: 'Dr. Mensah' },
    '13:45 – 14:30': { subject: 'Geography', teacher: 'Mr. Darko' },
    '14:30 – 15:15': null,
  },
  'Thursday': {
    '7:30 – 8:15': { subject: 'History', teacher: 'Ms. Owusu' },
    '8:15 – 9:00': { subject: 'Biology', teacher: 'Mr. Antwi' },
    '9:00 – 9:45': { subject: 'Mathematics', teacher: 'Mr. Asante' },
    'Break': null,
    '10:00 – 10:45': { subject: 'English', teacher: 'Ms. Williams' },
    '10:45 – 11:30': { subject: 'Geography', teacher: 'Mr. Darko' },
    '11:30 – 12:15': { subject: 'ICT', teacher: 'Mr. Agyei' },
    'Lunch': null,
    '13:00 – 13:45': { subject: 'Chemistry', teacher: 'Mrs. Boateng' },
    '13:45 – 14:30': { subject: 'Physics', teacher: 'Dr. Mensah' },
    '14:30 – 15:15': { subject: 'PE', teacher: 'Coach Asare' },
  },
  'Friday': {
    '7:30 – 8:15': { subject: 'Physics', teacher: 'Dr. Mensah' },
    '8:15 – 9:00': { subject: 'English', teacher: 'Ms. Williams' },
    '9:00 – 9:45': { subject: 'History', teacher: 'Ms. Owusu' },
    'Break': null,
    '10:00 – 10:45': { subject: 'Mathematics', teacher: 'Mr. Asante' },
    '10:45 – 11:30': { subject: 'Chemistry', teacher: 'Mrs. Boateng' },
    '11:30 – 12:15': { subject: 'Biology', teacher: 'Mr. Antwi' },
    'Lunch': null,
    '13:00 – 13:45': { subject: 'Geography', teacher: 'Mr. Darko' },
    '13:45 – 14:30': { subject: 'ICT', teacher: 'Mr. Agyei' },
    '14:30 – 15:15': { subject: 'PE', teacher: 'Coach Asare' },
  },
};

const subjectColorMap: Record<string, string> = {
  Mathematics: subjectColors[0],
  English: subjectColors[1],
  Physics: subjectColors[2],
  Chemistry: subjectColors[3],
  Biology: subjectColors[4],
  History: subjectColors[5],
  Geography: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  ICT: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  PE: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
};

export default function TimetablePage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Timetable</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Class schedule and period allocation</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all">
            Auto Generate
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Add Period
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3">
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>Grade 10 — Section A</option>
            <option>Grade 9 — Section A</option>
            <option>Grade 11 — Section B</option>
          </select>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>Week 27 (Jun 30 – Jul 4)</option>
            <option>Week 28 (Jul 7 – Jul 11)</option>
          </select>
          <div className="flex items-center gap-1 ml-auto">
            <button className="p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-4 py-3 w-28">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Period</div>
                </th>
                {days.map(d => (
                  <th key={d} className="text-center text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-3 py-3">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => {
                const isBreak = period === 'Break' || period === 'Lunch';
                return (
                  <tr key={period} className={`border-b border-[hsl(var(--border)/0.5)] ${isBreak ? 'bg-[hsl(var(--bg-tertiary)/0.3)]' : 'table-row-hover'}`}>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium ${isBreak ? 'text-[hsl(var(--text-tertiary))] italic' : 'text-[hsl(var(--text-secondary))]'}`}>{period}</span>
                    </td>
                    {days.map(day => {
                      if (isBreak) {
                        return (
                          <td key={day} colSpan={1} className="px-3 py-2 text-center">
                            <span className="text-xs text-[hsl(var(--text-tertiary))] italic">{period}</span>
                          </td>
                        );
                      }
                      const slot = timetable[day]?.[period];
                      if (!slot) {
                        return (
                          <td key={day} className="px-3 py-2">
                            <div className="h-14 rounded-lg border border-dashed border-[hsl(var(--border))] flex items-center justify-center cursor-pointer hover:border-[hsl(var(--accent)/0.4)] transition-colors group">
                              <Plus className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--accent))]" />
                            </div>
                          </td>
                        );
                      }
                      const colorClass = subjectColorMap[slot.subject] || subjectColors[0];
                      return (
                        <td key={day} className="px-3 py-2">
                          <div className={`h-14 rounded-lg border p-2 cursor-pointer hover:scale-105 transition-transform ${colorClass}`}>
                            <p className="text-[11px] font-semibold leading-tight">{slot.subject}</p>
                            <p className="text-[10px] opacity-70 mt-0.5 flex items-center gap-0.5">
                              <BookOpen className="w-2.5 h-2.5" />{slot.teacher}
                            </p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-4">
        <p className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Subject Legend</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(subjectColorMap).map(([sub, cls]) => (
            <span key={sub} className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${cls}`}>{sub}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
