'use client';

import { Calendar, Layers, Users, CheckSquare, TrendingUp } from 'lucide-react';

interface ControlCenterFiltersProps {
  selectedYear: string;
  selectedGrade: string;
  onYearChange: (year: string) => void;
  onGradeChange: (grade: string) => void;
  studentCount?: number | string;
  studentAttendance?: string;
}

export function ControlCenterFilters({
  selectedYear,
  selectedGrade,
  onYearChange,
  onGradeChange,
  studentCount = '3,457',
  studentAttendance = '83.7%',
}: ControlCenterFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Upper Filter & Key Metrics Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-[hsl(var(--bg-secondary)/0.6)] backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-[hsl(var(--border)/0.6)] shadow-sm">
        {/* Left: Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full xl:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] w-full">
            <Calendar className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer font-bold text-xs w-full text-[hsl(var(--text-primary))]"
            >
              <option value="2025/2026">2025/2026 Academic Year</option>
              <option value="2026/2027">2026/2027 Academic Year</option>
              <option value="2024/2025">2024/2025 Academic Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] w-full">
            <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer font-bold text-xs w-full text-[hsl(var(--text-primary))]"
            >
              <option value="All">All Senior School Levels</option>
              <option value="SSS 1">Level SSS 1</option>
              <option value="SSS 2">Level SSS 2</option>
              <option value="SSS 3">Level SSS 3</option>
              <option value="SSS 1 Science">SSS 1 Science</option>
              <option value="SSS 1 Arts">SSS 1 Arts</option>
              <option value="SSS 1 Commercial">SSS 1 Commercial</option>
              <option value="SSS 2 Science">SSS 2 Science</option>
              <option value="SSS 2 Arts">SSS 2 Arts</option>
              <option value="SSS 2 Commercial">SSS 2 Commercial</option>
              <option value="SSS 3 Science">SSS 3 Science</option>
              <option value="SSS 3 Arts">SSS 3 Arts</option>
              <option value="SSS 3 Commercial">SSS 3 Commercial</option>
            </select>
          </div>
        </div>

        {/* Right: Key Summary Stat Boxes */}
        <div className="grid grid-cols-2 gap-2.5 w-full xl:w-auto xl:flex xl:items-center">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.8)] border border-[hsl(var(--border))]">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-black text-[hsl(var(--text-primary))] leading-none truncate">{studentCount}</p>
              <p className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))] mt-0.5 truncate">Student Count</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[hsl(var(--bg-tertiary)/0.8)] border border-[hsl(var(--border))]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-black text-[hsl(var(--text-primary))] leading-none truncate">{studentAttendance}</p>
              <p className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))] mt-0.5 truncate">Student Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Metric Highlights Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 flex-nowrap sm:flex-wrap">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-[hsl(var(--text-secondary))] whitespace-nowrap flex-shrink-0">
          <span>Student Count:</span>
          <span className="font-black text-violet-400 flex items-center gap-1">
            4.5% <TrendingUp className="w-3 h-3 text-violet-400" />
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-[hsl(var(--text-secondary))] whitespace-nowrap flex-shrink-0">
          <span>Student Attendance:</span>
          <span className="font-black text-amber-400 flex items-center gap-1">
            1.2% <CheckSquare className="w-3 h-3 text-amber-400" />
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-[hsl(var(--text-secondary))] whitespace-nowrap flex-shrink-0">
          <span>Exam Average:</span>
          <span className="font-black text-indigo-400 flex items-center gap-1">
            77.7% <TrendingUp className="w-3 h-3 text-indigo-400" />
          </span>
        </div>
      </div>
    </div>
  );
}
