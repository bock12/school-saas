'use client';

import { ArrowUpDown, RefreshCw } from 'lucide-react';

export type SubjectScoreGauge = {
  subject: string;
  score: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
};

const defaultGauges: SubjectScoreGauge[] = [
  {
    subject: 'English',
    score: 94.5,
    color: '#7c3aed',
    gradientFrom: '#7c3aed',
    gradientTo: '#a855f7',
  },
  {
    subject: 'Maths',
    score: 81.9,
    color: '#6366f1',
    gradientFrom: '#6366f1',
    gradientTo: '#4f46e5',
  },
  {
    subject: 'Science',
    score: 69.4,
    color: '#06b6d4',
    gradientFrom: '#06b6d4',
    gradientTo: '#3b82f6',
  },
  {
    subject: 'Physics',
    score: 78.2,
    color: '#f59e0b',
    gradientFrom: '#f59e0b',
    gradientTo: '#fbbf24',
  },
  {
    subject: 'Chemistry',
    score: 73.6,
    color: '#ec4899',
    gradientFrom: '#ec4899',
    gradientTo: '#f472b6',
  },
  {
    subject: 'Biology',
    score: 85.1,
    color: '#10b981',
    gradientFrom: '#10b981',
    gradientTo: '#34d399',
  },
  {
    subject: 'History',
    score: 88.7,
    color: '#8b5cf6',
    gradientFrom: '#8b5cf6',
    gradientTo: '#c084fc',
  },
  {
    subject: 'Geography',
    score: 76.4,
    color: '#14b8a6',
    gradientFrom: '#14b8a6',
    gradientTo: '#2dd4bf',
  },
  {
    subject: 'ICT',
    score: 91.2,
    color: '#3b82f6',
    gradientFrom: '#3b82f6',
    gradientTo: '#60a5fa',
  },
];

function RadialGauge({ item }: { item: SubjectScoreGauge }) {
  const radius = 34;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (item.score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-1 group">
      <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg] overflow-visible w-full h-full">
          <defs>
            <linearGradient id={`grad-${item.subject}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={item.gradientFrom} />
              <stop offset="100%" stopColor={item.gradientTo} />
            </linearGradient>
          </defs>

          {/* Track Circle */}
          <circle
            stroke="hsl(var(--bg-tertiary))"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Progress Circle */}
          <circle
            stroke={`url(#grad-${item.subject})`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] sm:text-xs font-black text-[hsl(var(--text-primary))] leading-none">
            {item.score}%
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-[hsl(var(--text-tertiary))] mt-0.5 truncate max-w-[48px] text-center">
            {item.subject}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AverageScoreRings({ gauges = defaultGauges }: { gauges?: SubjectScoreGauge[] }) {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-[hsl(var(--border)/0.6)] h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[hsl(var(--border)/0.4)]">
        <div>
          <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Average Score</h3>
          <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Subject performance overview</p>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Radial Gauges Container (9 Subjects in 3x3 Grid) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 items-center justify-items-center py-1">
        {gauges.map((gauge) => (
          <RadialGauge key={gauge.subject} item={gauge} />
        ))}
      </div>
    </div>
  );
}
