'use client';

import { Trophy, TrendingUp, UserCheck } from 'lucide-react';

export type StudentSpotlight = {
  category: 'Best In Marks' | 'Best In Attendance' | 'Most Improved In Marks' | 'Most Improved In Attendance';
  score: string;
  name: string;
  grade: number | string;
  gpa: number | string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  avatarBg: string;
  avatarEmoji: string;
  badgeColor: string;
};

const defaultSpotlights: StudentSpotlight[] = [
  {
    category: 'Best In Marks',
    score: '87.9%',
    name: 'Kinara Zuri',
    grade: 3,
    gpa: 5,
    secondaryMetricLabel: 'Attend',
    secondaryMetricValue: '77.3%',
    avatarBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    avatarEmoji: '👦',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    category: 'Best In Attendance',
    score: '89.3%',
    name: 'Lea Jabulani',
    grade: 4,
    gpa: 4,
    secondaryMetricLabel: 'Marks',
    secondaryMetricValue: '75.3%',
    avatarBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    avatarEmoji: '👧',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    category: 'Most Improved In Marks',
    score: '79.3%',
    name: 'Corny Niang',
    grade: 5,
    gpa: 3,
    secondaryMetricLabel: 'Attend',
    secondaryMetricValue: '80.2%',
    avatarBg: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    avatarEmoji: '👧‍💼',
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    category: 'Most Improved In Attendance',
    score: '82.5%',
    name: 'Yao Ming',
    grade: 1,
    gpa: 5,
    secondaryMetricLabel: 'Marks',
    secondaryMetricValue: '86.8%',
    avatarBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    avatarEmoji: '👦‍💼',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
];

export function TopPerformersWall({ spotlights = defaultSpotlights }: { spotlights?: StudentSpotlight[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
      {spotlights.map((item) => (
        <div
          key={item.category}
          className="glass-card rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between border border-[hsl(var(--border)/0.6)] hover:border-violet-500/40 transition-all group min-w-0"
        >
          {/* Card Header: Score Highlight & Avatar */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center text-base sm:text-lg flex-shrink-0 shadow-sm ${item.avatarBg}`}>
                <span>{item.avatarEmoji}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-black text-[hsl(var(--text-primary))] leading-tight truncate">{item.score}</p>
                <h4 className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{item.name}</h4>
              </div>
            </div>
            <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${item.badgeColor}`}>
              GPA {item.gpa}
            </span>
          </div>

          {/* Metrics summary footer */}
          <div className="mt-2.5 pt-2 border-t border-[hsl(var(--border)/0.4)] flex items-center justify-between text-[10px] flex-wrap gap-x-2">
            <div className="flex items-center gap-2 sm:gap-3 text-[hsl(var(--text-tertiary))] flex-wrap">
              <span>Grade <strong className="text-[hsl(var(--text-secondary))]">{item.grade}</strong></span>
              <span>GPA <strong className="text-[hsl(var(--text-secondary))]">{item.gpa}</strong></span>
              <span>{item.secondaryMetricLabel} <strong className="text-[hsl(var(--text-secondary))]">{item.secondaryMetricValue}</strong></span>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-violet-400 uppercase tracking-wider truncate">
            {item.category === 'Best In Marks' && <Trophy className="w-3 h-3 text-amber-400 flex-shrink-0" />}
            {item.category === 'Best In Attendance' && <UserCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
            {item.category.includes('Most Improved') && <TrendingUp className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
            <span className="truncate">{item.category}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
