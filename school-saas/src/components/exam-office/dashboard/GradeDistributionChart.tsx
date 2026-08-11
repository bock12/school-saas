'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export type GradeDataItem = {
  name: string;
  percentage: number;
  count: number;
  color: string;
  categoryType?: 'grade' | 'level' | 'stream' | 'gender';
};

export type ClassGenderMatrixItem = {
  classArm: string;
  level: string;
  stream: string;
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
};

const defaultMatrix: ClassGenderMatrixItem[] = [
  { classArm: 'SSS 1 Science', level: 'SSS 1', stream: 'Science', totalStudents: 605, maleCount: 316, femaleCount: 289, malePercentage: 52.2, femalePercentage: 47.8 },
  { classArm: 'SSS 1 Arts', level: 'SSS 1', stream: 'Arts', totalStudents: 484, maleCount: 218, femaleCount: 266, malePercentage: 45.0, femalePercentage: 55.0 },
  { classArm: 'SSS 1 Commercial', level: 'SSS 1', stream: 'Commercial', totalStudents: 335, maleCount: 161, femaleCount: 174, malePercentage: 48.1, femalePercentage: 51.9 },
  { classArm: 'SSS 2 Science', level: 'SSS 2', stream: 'Science', totalStudents: 525, maleCount: 284, femaleCount: 241, malePercentage: 54.1, femalePercentage: 45.9 },
  { classArm: 'SSS 2 Arts', level: 'SSS 2', stream: 'Arts', totalStudents: 418, maleCount: 192, femaleCount: 226, malePercentage: 45.9, femalePercentage: 54.1 },
  { classArm: 'SSS 2 Commercial', level: 'SSS 2', stream: 'Commercial', totalStudents: 294, maleCount: 141, femaleCount: 153, malePercentage: 48.0, femalePercentage: 52.0 },
  { classArm: 'SSS 3 Science', level: 'SSS 3', stream: 'Science', totalStudents: 325, maleCount: 179, femaleCount: 146, malePercentage: 55.1, femalePercentage: 44.9 },
  { classArm: 'SSS 3 Arts', level: 'SSS 3', stream: 'Arts', totalStudents: 259, maleCount: 117, femaleCount: 142, malePercentage: 45.2, femalePercentage: 54.8 },
  { classArm: 'SSS 3 Commercial', level: 'SSS 3', stream: 'Commercial', totalStudents: 212, maleCount: 104, femaleCount: 108, malePercentage: 49.1, femalePercentage: 50.9 },
];

const armColors: Record<string, string> = {
  'SSS 1 Science': '#3b82f6',
  'SSS 1 Arts': '#06b6d4',
  'SSS 1 Commercial': '#0284c7',
  'SSS 2 Science': '#a855f7',
  'SSS 2 Arts': '#9333ea',
  'SSS 2 Commercial': '#7e22ce',
  'SSS 3 Science': '#10b981',
  'SSS 3 Arts': '#059669',
  'SSS 3 Commercial': '#047857',
  'SSS 1': '#3b82f6',
  'SSS 2': '#a855f7',
  'SSS 3': '#10b981',
  'Science': '#06b6d4',
  'Arts': '#ec4899',
  'Commercial': '#eab308',
  'Male': '#3b82f6',
  'Female': '#ec4899',
};

export function GradeDistributionChart({
  matrix = defaultMatrix,
}: {
  data?: GradeDataItem[];
  matrix?: ClassGenderMatrixItem[];
}) {
  // Dropdown filter state
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [streamFilter, setStreamFilter] = useState<string>('All');
  const [classArmFilter, setClassArmFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');

  const [activeIndex, setActiveIndex] = useState(0);

  // Dynamic Class Arm dropdown options based on selected Stream and Level
  const availableClassArms = useMemo(() => {
    return matrix
      .filter((m) => (levelFilter === 'All' || m.level === levelFilter) && (streamFilter === 'All' || m.stream === streamFilter))
      .map((m) => m.classArm);
  }, [matrix, levelFilter, streamFilter]);

  // Compute dataset for chart & breakdown based on dropdown selections
  const computedDataset = useMemo(() => {
    let filtered = matrix.filter(
      (m) =>
        (levelFilter === 'All' || m.level === levelFilter) &&
        (streamFilter === 'All' || m.stream === streamFilter) &&
        (classArmFilter === 'All' || m.classArm === classArmFilter)
    );

    if (filtered.length === 0) filtered = matrix;

    // Helper to extract student count based on gender selection
    const getCount = (m: ClassGenderMatrixItem) => {
      if (genderFilter === 'Female') return m.femaleCount;
      if (genderFilter === 'Male') return m.maleCount;
      return m.totalStudents;
    };

    const totalInSelection = filtered.reduce((sum, m) => sum + getCount(m), 0);

    // If viewing single class arm or filtered arms
    if (classArmFilter !== 'All' || (levelFilter !== 'All' && streamFilter !== 'All')) {
      return filtered.map((m) => {
        const count = getCount(m);
        const pct = totalInSelection > 0 ? (count / totalInSelection) * 100 : 0;
        return {
          name: m.classArm,
          count,
          percentage: Number(pct.toFixed(1)),
          color: armColors[m.classArm] || '#3b82f6',
        };
      });
    }

    // Grouping by Level if Level is selected or Stream is selected
    if (levelFilter === 'All' && streamFilter === 'All' && genderFilter === 'All') {
      const levels = ['SSS 1', 'SSS 2', 'SSS 3'];
      const totalAll = matrix.reduce((sum, m) => sum + m.totalStudents, 0);
      return levels.map((lvl) => {
        const lvlRows = matrix.filter((m) => m.level === lvl);
        const count = lvlRows.reduce((sum, m) => sum + m.totalStudents, 0);
        const pct = totalAll > 0 ? (count / totalAll) * 100 : 0;
        return {
          name: lvl,
          count,
          percentage: Number(pct.toFixed(1)),
          color: armColors[lvl] || '#3b82f6',
        };
      });
    }

    // Default detailed breakdown of matching arms
    return filtered.map((m) => {
      const count = getCount(m);
      const pct = totalInSelection > 0 ? (count / totalInSelection) * 100 : 0;
      let label = m.classArm;
      if (genderFilter !== 'All') label += ` (${genderFilter})`;
      return {
        name: label,
        count,
        percentage: Number(pct.toFixed(1)),
        color: armColors[m.classArm] || armColors[m.stream] || '#3b82f6',
      };
    });
  }, [matrix, levelFilter, streamFilter, classArmFilter, genderFilter]);

  const activeItem = computedDataset[activeIndex] || computedDataset[0];

  // Reset stream/classArm cascading filters
  function handleLevelChange(val: string) {
    setLevelFilter(val);
    setClassArmFilter('All');
    setActiveIndex(0);
  }

  function handleStreamChange(val: string) {
    setStreamFilter(val);
    setClassArmFilter('All');
    setActiveIndex(0);
  }

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-[hsl(var(--border)/0.6)] h-full">
      {/* Header with 4 Dropdowns aligned strictly in ONE SINGLE ROW */}
      <div className="flex flex-row items-center justify-between gap-2 mb-3 pb-2 border-b border-[hsl(var(--border)/0.4)]">
        <div className="flex-shrink-0">
          <h3 className="font-black text-sm sm:text-base text-[hsl(var(--text-primary))] leading-tight">Student Count</h3>
          <p className="text-[10px] sm:text-[11px] text-[hsl(var(--text-tertiary))] truncate">Filtered breakdown</p>
        </div>

        {/* 4 Filter Dropdowns in ONE HORIZONTAL ROW */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto">
          {/* 1. Level */}
          <div className="flex flex-col flex-shrink-0">
            <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-primary))] outline-none cursor-pointer hover:border-violet-500/50 transition-colors"
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
              className="px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-primary))] outline-none cursor-pointer hover:border-violet-500/50 transition-colors"
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
              onChange={(e) => {
                setClassArmFilter(e.target.value);
                setActiveIndex(0);
              }}
              className="px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-primary))] outline-none cursor-pointer hover:border-violet-500/50 transition-colors max-w-[105px] truncate"
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
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setActiveIndex(0);
              }}
              className="px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.8)] text-[hsl(var(--text-primary))] outline-none cursor-pointer hover:border-violet-500/50 transition-colors"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Body: Donut Chart + Horizontal Bar List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Recharts Donut */}
        <div className="md:col-span-5 relative flex items-center justify-center min-h-[180px] sm:min-h-[200px]">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={computedDataset}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="percentage"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {computedDataset.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as { name: string; percentage: number; count: number };
                    return (
                      <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 shadow-xl text-xs">
                        <p className="font-bold text-[hsl(var(--text-primary))]">{item.name}</p>
                        <p className="text-violet-400 font-semibold">{item.percentage}% ({item.count} students)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Dynamic Highlight */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))] leading-none">
              {activeItem?.percentage || 0}%
            </span>
            <span className="text-[9px] font-black tracking-widest text-[hsl(var(--text-tertiary))] uppercase mt-0.5 max-w-[95px] text-center truncate">
              {activeItem?.name || 'All'}
            </span>
          </div>
        </div>

        {/* Right: Progress Bar Breakdown */}
        <div className="md:col-span-7 space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-violet-500/20">
          {computedDataset.map((item, index) => (
            <div
              key={item.name}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl cursor-pointer transition-all ${
                activeIndex === index ? 'bg-[hsl(var(--bg-tertiary)/0.6)]' : 'hover:bg-[hsl(var(--bg-tertiary)/0.3)]'
              }`}
            >
              {/* Legend Color Dot */}
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />

              {/* Name */}
              <span className="text-xs font-bold text-[hsl(var(--text-secondary))] w-28 sm:w-32 flex-shrink-0 truncate">
                {item.name}
              </span>

              {/* Progress Bar Container */}
              <div className="flex-1 h-3 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1.5 text-[9px] font-black text-white"
                  style={{
                    width: `${Math.max(item.percentage, 8)}%`,
                    backgroundColor: item.color,
                  }}
                >
                  {item.percentage}%
                </div>
              </div>

              {/* Count */}
              <span className="text-xs font-black text-[hsl(var(--text-primary))] w-10 text-right flex-shrink-0">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
