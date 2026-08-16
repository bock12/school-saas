'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, ArrowRight, ShieldCheck, Award } from 'lucide-react';

type NationalSitting = {
  id: string;
  code: 'WASSCE' | 'BECE' | 'NPSE' | 'NCTVA';
  title: string;
  level: string;
  targetClass: string;
  examDate: Date;
  registeredCandidates: number;
  cassStatus: 'Verified' | 'Audit Pending' | 'CASS Locked';
  color: string;
  gradient: string;
  badgeBg: string;
};

const NATIONAL_SITTINGS: NationalSitting[] = [
  {
    id: 'wassce-2026',
    code: 'WASSCE',
    title: 'West African Senior School Certificate Examination',
    level: 'Senior Secondary',
    targetClass: 'SSS 3',
    examDate: new Date('2026-09-15T08:30:00'),
    registeredCandidates: 432,
    cassStatus: 'Verified',
    color: 'emerald',
    gradient: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30',
    badgeBg: 'bg-emerald-500 text-white',
  },
  {
    id: 'bece-2026',
    code: 'BECE',
    title: 'Basic Education Certificate Examination',
    level: 'Junior Secondary',
    targetClass: 'JSS 3',
    examDate: new Date('2026-10-12T08:30:00'),
    registeredCandidates: 535,
    cassStatus: 'Verified',
    color: 'purple',
    gradient: 'from-purple-600/20 to-violet-600/10 border-purple-500/30',
    badgeBg: 'bg-purple-500 text-white',
  },
  {
    id: 'npse-2026',
    code: 'NPSE',
    title: 'National Primary School Examination',
    level: 'Primary School',
    targetClass: 'Class 6',
    examDate: new Date('2026-11-05T08:30:00'),
    registeredCandidates: 153,
    cassStatus: 'Audit Pending',
    color: 'blue',
    gradient: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30',
    badgeBg: 'bg-blue-500 text-white',
  },
  {
    id: 'nctva-2026',
    code: 'NCTVA',
    title: 'National Technical & Vocational Awards',
    level: 'TVET / Technical',
    targetClass: 'Level 3 / HND',
    examDate: new Date('2026-11-25T08:30:00'),
    registeredCandidates: 88,
    cassStatus: 'Verified',
    color: 'orange',
    gradient: 'from-orange-600/20 to-amber-600/10 border-orange-500/30',
    badgeBg: 'bg-orange-500 text-white',
  },
];

function calculateTimeLeft(targetDate: Date) {
  const diff = targetDate.getTime() - new Date().getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function WaecExamScheduleWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('wassce-2026');
  const [timeState, setTimeState] = useState<Record<string, ReturnType<typeof calculateTimeLeft>>>({});

  useEffect(() => {
    const updateAllTimers = () => {
      const newTimes: Record<string, ReturnType<typeof calculateTimeLeft>> = {};
      NATIONAL_SITTINGS.forEach((s) => {
        newTimes[s.id] = calculateTimeLeft(s.examDate);
      });
      setTimeState(newTimes);
    };

    updateAllTimers();
    const interval = setInterval(updateAllTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeSitting = NATIONAL_SITTINGS.find((s) => s.id === activeTab) ?? NATIONAL_SITTINGS[0];
  const activeTime = timeState[activeSitting.id] ?? { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-violet-500/30 bg-gradient-to-r from-violet-500/5 via-indigo-500/5 to-transparent">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[hsl(var(--border))] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-black">
            🇸🇱
          </div>
          <div>
            <h2 className="font-black text-sm text-[hsl(var(--text-primary))] uppercase tracking-wider flex items-center gap-2">
              National WAEC Sittings Schedule
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20 lowercase">
                live countdown
              </span>
            </h2>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
              Sierra Leone MBSSE & WAEC Official Examination Sittings
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {NATIONAL_SITTINGS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 flex-shrink-0 ${
                activeTab === s.id
                  ? `${s.badgeBg} shadow-sm`
                  : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <span>{s.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Countdown & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">

        {/* Left Column: Big Countdown Units */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-3 h-3 text-violet-400" /> Countdown to {activeSitting.code}
            </span>
            <span className="text-xs font-bold text-violet-400">
              {activeSitting.examDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Time digits grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-xl p-2.5 bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
              <p className="text-2xl sm:text-3xl font-black text-violet-400 font-mono leading-none">
                {String(activeTime.days).padStart(2, '0')}
              </p>
              <p className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase mt-1">Days</p>
            </div>
            <div className="rounded-xl p-2.5 bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
              <p className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] font-mono leading-none">
                {String(activeTime.hours).padStart(2, '0')}
              </p>
              <p className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase mt-1">Hours</p>
            </div>
            <div className="rounded-xl p-2.5 bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
              <p className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))] font-mono leading-none">
                {String(activeTime.minutes).padStart(2, '0')}
              </p>
              <p className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase mt-1">Mins</p>
            </div>
            <div className="rounded-xl p-2.5 bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono leading-none animate-pulse">
                {String(activeTime.seconds).padStart(2, '0')}
              </p>
              <p className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase mt-1">Secs</p>
            </div>
          </div>
        </div>

        {/* Right Column: Sitting Info Card */}
        <div className="lg:col-span-6">
          <div className={`rounded-xl p-4 border bg-gradient-to-br ${activeSitting.gradient} space-y-3`}>
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black ${activeSitting.badgeBg}`}>
                  {activeSitting.code} Sitting
                </span>
                <h3 className="font-black text-sm text-[hsl(var(--text-primary))] mt-1">
                  {activeSitting.title}
                </h3>
                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                  Target: {activeSitting.level} ({activeSitting.targetClass})
                </p>
              </div>
              <Award className="w-5 h-5 text-violet-400 flex-shrink-0" />
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[hsl(var(--border)/0.5)]">
              <div className="flex items-center gap-1.5 text-[hsl(var(--text-secondary))]">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-[hsl(var(--text-primary))]">{activeSitting.registeredCandidates}</span> Candidates
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {activeSitting.cassStatus}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push(`?tab=admissions`)}
              className="w-full py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              Manage {activeSitting.code} Candidates & CASS <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
