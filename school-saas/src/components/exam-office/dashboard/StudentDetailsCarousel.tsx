'use client';

import { useState, useMemo } from 'react';
import { Award, Trophy, Medal } from 'lucide-react';

export type StudentDetailCard = {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  avatarEmoji: string;
  marks: string;
  gpa: number;
  attendance: string;
  grade: string;
  level?: string;
  stream?: string;
  classArm?: string;
  rank?: number;
  avatarBg: string;
};

const defaultStudents: StudentDetailCard[] = [
  {
    id: '1',
    name: 'Amina Bello',
    gender: 'Female',
    avatarEmoji: '👩‍🎓',
    marks: '98.4%',
    gpa: 5.0,
    attendance: '99.5%',
    grade: 'SSS 1',
    level: 'SSS 1',
    stream: 'Science',
    classArm: 'SSS 1 Science',
    rank: 1,
    avatarBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  },
  {
    id: '2',
    name: 'Corny Niang',
    gender: 'Female',
    avatarEmoji: '👩‍🔬',
    marks: '97.1%',
    gpa: 5.0,
    attendance: '98.6%',
    grade: 'SSS 2',
    level: 'SSS 2',
    stream: 'Science',
    classArm: 'SSS 2 Science',
    rank: 2,
    avatarBg: 'bg-violet-500/15 border-violet-500/30 text-violet-400',
  },
  {
    id: '3',
    name: 'Luka Magic',
    gender: 'Male',
    avatarEmoji: '👨‍🎓',
    marks: '96.5%',
    gpa: 5.0,
    attendance: '98.2%',
    grade: 'SSS 1',
    level: 'SSS 1',
    stream: 'Science',
    classArm: 'SSS 1 Science',
    rank: 3,
    avatarBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  },
  {
    id: '4',
    name: 'Kwame Mensah',
    gender: 'Male',
    avatarEmoji: '👨‍💼',
    marks: '96.0%',
    gpa: 4.9,
    attendance: '96.8%',
    grade: 'SSS 3',
    level: 'SSS 3',
    stream: 'Commercial',
    classArm: 'SSS 3 Commercial',
    rank: 1,
    avatarBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  },
  {
    id: '5',
    name: 'Sarah Connor',
    gender: 'Female',
    avatarEmoji: '👩‍🎨',
    marks: '95.6%',
    gpa: 5.0,
    attendance: '99.1%',
    grade: 'SSS 1',
    level: 'SSS 1',
    stream: 'Arts',
    classArm: 'SSS 1 Arts',
    rank: 1,
    avatarBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
  },
  {
    id: '6',
    name: 'Bianca Shangwe',
    gender: 'Female',
    avatarEmoji: '👩‍🎓',
    marks: '94.8%',
    gpa: 4.9,
    attendance: '96.5%',
    grade: 'SSS 1',
    level: 'SSS 1',
    stream: 'Science',
    classArm: 'SSS 1 Science',
    rank: 2,
    avatarBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
  },
];

const allClassArmsList = [
  'SSS 1 Science', 'SSS 1 Arts', 'SSS 1 Commercial',
  'SSS 2 Science', 'SSS 2 Arts', 'SSS 2 Commercial',
  'SSS 3 Science', 'SSS 3 Arts', 'SSS 3 Commercial',
];

const rankBadges = [
  { rank: '1st', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Trophy },
  { rank: '2nd', bg: 'bg-slate-300/20 text-slate-200 border-slate-300/40', icon: Medal },
  { rank: '3rd', bg: 'bg-amber-700/20 text-amber-400 border-amber-700/40', icon: Award },
];

export function StudentDetailsCarousel({ students = defaultStudents }: { students?: StudentDetailCard[] }) {
  // Dropdown filter state
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [streamFilter, setStreamFilter] = useState<string>('All');
  const [classArmFilter, setClassArmFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');

  // Dynamic Class Arm options based on Stream and Level
  const availableClassArms = useMemo(() => {
    return allClassArmsList.filter((arm) => {
      const matchLvl = levelFilter === 'All' || arm.startsWith(levelFilter);
      const matchStrm = streamFilter === 'All' || arm.includes(streamFilter);
      return matchLvl && matchStrm;
    });
  }, [levelFilter, streamFilter]);

  // Compute Top 3 Performers matching filters
  const topPerformers = useMemo(() => {
    let filtered = students.filter((s) => {
      const matchLevel = levelFilter === 'All' || (s.level || s.grade) === levelFilter;
      const matchStream = streamFilter === 'All' || (s.stream || s.classArm?.includes(streamFilter));
      const matchArm = classArmFilter === 'All' || s.classArm === classArmFilter;
      const matchGender = genderFilter === 'All' || s.gender === genderFilter;
      return matchLevel && matchStream && matchArm && matchGender;
    });

    if (filtered.length === 0) {
      filtered = students.filter((s) => {
        const matchLevel = levelFilter === 'All' || (s.level || s.grade) === levelFilter;
        const matchGender = genderFilter === 'All' || s.gender === genderFilter;
        return matchLevel && matchGender;
      });
    }

    if (filtered.length === 0) filtered = students;

    // Sort by marks percentage numeric value descending
    const sorted = [...filtered].sort((a, b) => {
      const numA = parseFloat(a.marks.replace('%', '')) || 0;
      const numB = parseFloat(b.marks.replace('%', '')) || 0;
      return numB - numA;
    });

    return sorted.slice(0, 3);
  }, [students, levelFilter, streamFilter, classArmFilter, genderFilter]);

  // Reset cascading options
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
      {/* Responsive Header with Single-Row Dropdowns */}
      <div className="flex flex-row items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[hsl(var(--border)/0.4)]">
        <div className="flex-shrink-0 hidden lg:hidden 2xl:block">
          <h3 className="font-black text-sm sm:text-base text-[hsl(var(--text-primary))] leading-tight">Top 3 Performers</h3>
          <p className="text-[10px] sm:text-[11px] text-[hsl(var(--text-tertiary))] truncate">Filter by level & stream</p>
        </div>

        {/* 4 Filter Dropdowns aligned in ONE HORIZONTAL ROW */}
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
        </div>
      </div>

      {/* Top 3 Student Cards Grid — Responsive for Sidebar Expand / Collapse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 my-auto">
        {topPerformers.map((student, idx) => {
          const badge = rankBadges[idx] || rankBadges[0];
          const RankIcon = badge.icon;
          return (
            <div
              key={student.id || student.name}
              className="bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.5)] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center text-center hover:border-violet-500/40 transition-all group relative overflow-hidden min-w-0"
            >
              {/* Rank Badge Header */}
              <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[8.5px] sm:text-[9px] font-bold text-[hsl(var(--text-tertiary))] truncate min-w-0">
                  {student.classArm || student.grade}
                </span>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-black border flex items-center gap-0.5 flex-shrink-0 ${badge.bg}`}>
                  <RankIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {badge.rank}
                </span>
              </div>

              {/* Avatar Ring */}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center text-lg sm:text-xl mb-1.5 shadow-sm flex-shrink-0 ${student.avatarBg}`}>
                <span>{student.avatarEmoji}</span>
              </div>

              {/* Student Name */}
              <h4 className="text-[11px] sm:text-xs font-black text-[hsl(var(--text-primary))] truncate w-full mb-0.5">
                {student.name}
              </h4>

              {/* Gender Tag */}
              <span className="text-[8.5px] sm:text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">
                {student.gender}
              </span>

              {/* Metrics Triple Pill */}
              <div className="w-full grid grid-cols-3 gap-0.5 pt-1.5 border-t border-[hsl(var(--border)/0.4)] text-[9px] sm:text-[10px]">
                <div className="min-w-0">
                  <p className="font-black text-emerald-400 truncate">{student.marks}</p>
                  <p className="text-[7.5px] sm:text-[8px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Marks</p>
                </div>
                <div className="min-w-0">
                  <p className="font-black text-violet-400 truncate">{student.gpa}</p>
                  <p className="text-[7.5px] sm:text-[8px] font-bold text-[hsl(var(--text-tertiary))] uppercase">GPA</p>
                </div>
                <div className="min-w-0">
                  <p className="font-black text-cyan-400 truncate">{student.attendance}</p>
                  <p className="text-[7.5px] sm:text-[8px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Attend</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
