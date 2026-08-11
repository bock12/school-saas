'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RotateCcw } from 'lucide-react';

export type ExamResultSubject = {
  subject: string;
  Pass: number;
  Average: number;
  Fail: number;
  highlightBadge?: string;
  level?: string;
  stream?: string;
  classArm?: string;
  gender?: string;
};

// Rich subject performance records mapped by subject, level, stream, class arm
const subjectMatrix: ExamResultSubject[] = [
  // SSS 1 Science
  { subject: 'Maths', Pass: 420, Average: 120, Fail: 65, level: 'SSS 1', stream: 'Science', classArm: 'SSS 1 Science' },
  { subject: 'English', Pass: 390, Average: 150, Fail: 65, level: 'SSS 1', stream: 'Science', classArm: 'SSS 1 Science' },
  { subject: 'Science', Pass: 480, Average: 90, Fail: 35, level: 'SSS 1', stream: 'Science', classArm: 'SSS 1 Science' },
  { subject: 'Physics', Pass: 380, Average: 140, Fail: 85, level: 'SSS 1', stream: 'Science', classArm: 'SSS 1 Science' },
  { subject: 'Chemistry', Pass: 360, Average: 160, Fail: 85, level: 'SSS 1', stream: 'Science', classArm: 'SSS 1 Science' },
  { subject: 'Biology', Pass: 440, Average: 110, Fail: 55, level: 'SSS 1', stream: 'Science', classArm: 'SSS 1 Science' },

  // SSS 1 Arts
  { subject: 'English', Pass: 380, Average: 80, Fail: 24, level: 'SSS 1', stream: 'Arts', classArm: 'SSS 1 Arts' },
  { subject: 'History', Pass: 360, Average: 90, Fail: 34, level: 'SSS 1', stream: 'Arts', classArm: 'SSS 1 Arts' },
  { subject: 'Geography', Pass: 310, Average: 120, Fail: 54, level: 'SSS 1', stream: 'Arts', classArm: 'SSS 1 Arts' },
  { subject: 'Maths', Pass: 240, Average: 150, Fail: 94, level: 'SSS 1', stream: 'Arts', classArm: 'SSS 1 Arts' },

  // SSS 1 Commercial
  { subject: 'Maths', Pass: 210, Average: 80, Fail: 45, level: 'SSS 1', stream: 'Commercial', classArm: 'SSS 1 Commercial' },
  { subject: 'English', Pass: 260, Average: 50, Fail: 25, level: 'SSS 1', stream: 'Commercial', classArm: 'SSS 1 Commercial' },
  { subject: 'ICT', Pass: 280, Average: 40, Fail: 15, level: 'SSS 1', stream: 'Commercial', classArm: 'SSS 1 Commercial' },

  // SSS 2 Science
  { subject: 'Maths', Pass: 390, Average: 90, Fail: 45, level: 'SSS 2', stream: 'Science', classArm: 'SSS 2 Science' },
  { subject: 'Physics', Pass: 350, Average: 110, Fail: 65, level: 'SSS 2', stream: 'Science', classArm: 'SSS 2 Science' },
  { subject: 'Chemistry', Pass: 340, Average: 120, Fail: 65, level: 'SSS 2', stream: 'Science', classArm: 'SSS 2 Science' },
  { subject: 'Biology', Pass: 410, Average: 80, Fail: 35, level: 'SSS 2', stream: 'Science', classArm: 'SSS 2 Science' },

  // SSS 2 Arts & Commercial
  { subject: 'English', Pass: 350, Average: 110, Fail: 52, level: 'SSS 2', stream: 'Arts', classArm: 'SSS 2 Arts' },
  { subject: 'History', Pass: 330, Average: 70, Fail: 18, level: 'SSS 2', stream: 'Arts', classArm: 'SSS 2 Arts' },
  { subject: 'ICT', Pass: 230, Average: 45, Fail: 19, level: 'SSS 2', stream: 'Commercial', classArm: 'SSS 2 Commercial' },

  // SSS 3
  { subject: 'Maths', Pass: 250, Average: 50, Fail: 25, level: 'SSS 3', stream: 'Science', classArm: 'SSS 3 Science' },
  { subject: 'Physics', Pass: 240, Average: 60, Fail: 25, level: 'SSS 3', stream: 'Science', classArm: 'SSS 3 Science' },
  { subject: 'English', Pass: 210, Average: 35, Fail: 14, level: 'SSS 3', stream: 'Arts', classArm: 'SSS 3 Arts' },
  { subject: 'ICT', Pass: 180, Average: 25, Fail: 7, level: 'SSS 3', stream: 'Commercial', classArm: 'SSS 3 Commercial' },
];

const allClassArmsList = [
  'SSS 1 Science', 'SSS 1 Arts', 'SSS 1 Commercial',
  'SSS 2 Science', 'SSS 2 Arts', 'SSS 2 Commercial',
  'SSS 3 Science', 'SSS 3 Arts', 'SSS 3 Commercial',
];

export function ExamResultsBarChart({ data = subjectMatrix }: { data?: ExamResultSubject[] }) {
  // 4 Dropdown filter states
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [streamFilter, setStreamFilter] = useState<string>('All');
  const [classArmFilter, setClassArmFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');

  // Dynamic Class Arm dropdown options based on selected Stream and Level
  const availableClassArms = useMemo(() => {
    return allClassArmsList.filter((arm) => {
      const matchLvl = levelFilter === 'All' || arm.startsWith(levelFilter);
      const matchStrm = streamFilter === 'All' || arm.includes(streamFilter);
      return matchLvl && matchStrm;
    });
  }, [levelFilter, streamFilter]);

  // Compute aggregated chart data based on active filters
  const computedChartData = useMemo(() => {
    let filtered = data.filter((item) => {
      const matchLevel = levelFilter === 'All' || item.level === levelFilter;
      const matchStream = streamFilter === 'All' || item.stream === streamFilter;
      const matchArm = classArmFilter === 'All' || item.classArm === classArmFilter;
      return matchLevel && matchStream && matchArm;
    });

    if (filtered.length === 0) filtered = data;

    // Gender multiplier if filtering by Female or Male
    const genderMult = genderFilter === 'Female' ? 0.48 : genderFilter === 'Male' ? 0.52 : 1.0;

    // Group by Subject
    const map = new Map<string, { subject: string; Pass: number; Average: number; Fail: number }>();

    filtered.forEach((item) => {
      const existing = map.get(item.subject) || { subject: item.subject, Pass: 0, Average: 0, Fail: 0 };
      existing.Pass += Math.round(item.Pass * genderMult);
      existing.Average += Math.round(item.Average * genderMult);
      existing.Fail += Math.round(item.Fail * genderMult);
      map.set(item.subject, existing);
    });

    // Default fallback list if map is small
    const result = Array.from(map.values());
    if (result.length < 5) {
      const allSubjects = ['Maths', 'English', 'Science', 'Physics', 'Chemistry', 'Biology', 'ICT'];
      allSubjects.forEach((sub) => {
        if (!map.has(sub)) {
          result.push({
            subject: sub,
            Pass: Math.round(300 * genderMult),
            Average: Math.round(120 * genderMult),
            Fail: Math.round(40 * genderMult),
          });
        }
      });
    }

    return result.slice(0, 7);
  }, [data, levelFilter, streamFilter, classArmFilter, genderFilter]);

  // Reset cascading filters
  function handleLevelChange(val: string) {
    setLevelFilter(val);
    setClassArmFilter('All');
  }

  function handleStreamChange(val: string) {
    setStreamFilter(val);
    setClassArmFilter('All');
  }

  return (
    <div className="glass-card rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between border border-[hsl(var(--border)/0.6)] h-full overflow-hidden">
      {/* Header with 4 Dropdowns aligned in ONE SINGLE HORIZONTAL ROW */}
      <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-2 mb-2.5 pb-2 border-b border-[hsl(var(--border)/0.4)]">
        <div className="flex-shrink-0">
          <h3 className="font-black text-xs sm:text-sm text-[hsl(var(--text-primary))] leading-tight whitespace-nowrap">Examination Results</h3>
          <p className="text-[9px] sm:text-[10px] text-[hsl(var(--text-tertiary))] truncate max-w-[100px] sm:max-w-none">Pass, Average & Fail breakdown</p>
        </div>

        {/* 4 Filter Dropdowns in ONE HORIZONTAL ROW */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
          {/* 1. Level */}
          <div className="flex flex-col flex-shrink-0">
            <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-primary))] outline-none cursor-pointer hover:border-violet-500/50 transition-colors min-w-[46px]"
            >
              <option value="All">All</option>
              <option value="SSS 1">SSS 1</option>
              <option value="SSS 2">SSS 2</option>
              <option value="SSS 3">SSS 3</option>
            </select>
          </div>

          {/* 2. Stream */}
          <div className="flex flex-col flex-shrink-0">
            <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Stream</label>
            <select
              value={streamFilter}
              onChange={(e) => handleStreamChange(e.target.value)}
              className="px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-primary))] outline-none cursor-pointer hover:border-violet-500/50 transition-colors min-w-[60px]"
            >
              <option value="All">All</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          {/* 3. Class Arm */}
          <div className="flex flex-col flex-shrink-0">
            <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Class Arm</label>
            <select
              value={classArmFilter}
              onChange={(e) => setClassArmFilter(e.target.value)}
              className="px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-primary))] outline-none cursor-pointer hover:border-violet-500/50 transition-colors max-w-[85px] sm:max-w-[100px] truncate"
            >
              <option value="All">All Arms</option>
              {availableClassArms.map((arm) => (
                <option key={arm} value={arm}>
                  {arm}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Gender */}
          <div className="flex flex-col flex-shrink-0">
            <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Gender</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-primary))] outline-none cursor-pointer hover:border-violet-500/50 transition-colors min-w-[50px]"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Circle Arrow Reset Button */}
          <div className="flex flex-col flex-shrink-0 justify-end">
            <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-transparent select-none">Reset</label>
            <button
              onClick={() => {
                setLevelFilter('All');
                setStreamFilter('All');
                setClassArmFilter('All');
                setGenderFilter('All');
              }}
              title="Reset Filters"
              className="p-1 sm:p-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-tertiary))] hover:text-violet-400 hover:border-violet-500/50 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend Header Bar */}
      <div className="flex items-center gap-3 sm:gap-4 mb-2 text-[10px] sm:text-xs font-bold flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-violet-600" />
          <span className="text-[hsl(var(--text-secondary))]">Pass</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-500" />
          <span className="text-[hsl(var(--text-secondary))]">Average</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-amber-500" />
          <span className="text-[hsl(var(--text-secondary))]">Fail</span>
        </div>
      </div>

      {/* Recharts Grouped Bar Chart */}
      <div className="w-full min-h-[190px] sm:min-h-[220px] relative">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={computedChartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis
              dataKey="subject"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--text-secondary))', fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--text-tertiary))', fontSize: 10 }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--bg-tertiary)/0.3)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                      <p className="font-black text-[hsl(var(--text-primary))]">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                          <span style={{ color: entry.color }} className="font-bold">{entry.name}:</span>
                          <span className="font-black text-[hsl(var(--text-primary))]">{entry.value} candidates</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="Pass" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={9} />
            <Bar dataKey="Average" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={9} />
            <Bar dataKey="Fail" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={9} />
          </BarChart>
        </ResponsiveContainer>

        {/* Dynamic Highlight Callout Badge */}
        <div className="absolute top-4 left-[26%] -translate-x-1/2 pointer-events-none hidden sm:block">
          <div className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-blue-400/50 animate-bounce">
            Filtered
          </div>
        </div>
      </div>
    </div>
  );
}
