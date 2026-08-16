'use client';

import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { ScrollText, Printer, XCircle, Search, Filter, CheckCircle2 } from 'lucide-react';

type BroadsheetStudent = {
  id: string;
  indexNo: string;
  name: string;
  classArm: string;
  stream: string;
  subjects: Record<string, { score: number; grade: string; points: number }>;
  totalCredits: number;
  gpa: number;
  rank: number;
};

const SAMPLE_SUBJECTS = ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'Biology', 'Chemistry', 'Physics', 'Economics'];

const SAMPLE_STUDENTS: BroadsheetStudent[] = [
  {
    id: 'b1',
    indexNo: '4230101001',
    name: 'Sahr Tommy',
    classArm: 'SSS 3 Science A',
    stream: 'Science',
    subjects: {
      'Mathematics': { score: 85, grade: 'A1', points: 4.0 },
      'English Language': { score: 72, grade: 'B2', points: 3.5 },
      'Integrated Science': { score: 78, grade: 'A1', points: 4.0 },
      'Social Studies': { score: 68, grade: 'B3', points: 3.0 },
      'Biology': { score: 76, grade: 'A1', points: 4.0 },
      'Chemistry': { score: 81, grade: 'A1', points: 4.0 },
      'Physics': { score: 88, grade: 'A1', points: 4.0 },
      'Economics': { score: 64, grade: 'C4', points: 2.5 },
    },
    totalCredits: 8,
    gpa: 3.6,
    rank: 1,
  },
  {
    id: 'b2',
    indexNo: '4230101002',
    name: 'Fatmata Sesay',
    classArm: 'SSS 3 Science A',
    stream: 'Science',
    subjects: {
      'Mathematics': { score: 79, grade: 'A1', points: 4.0 },
      'English Language': { score: 76, grade: 'A1', points: 4.0 },
      'Integrated Science': { score: 74, grade: 'B2', points: 3.5 },
      'Social Studies': { score: 70, grade: 'B2', points: 3.5 },
      'Biology': { score: 80, grade: 'A1', points: 4.0 },
      'Chemistry': { score: 68, grade: 'B3', points: 3.0 },
      'Physics': { score: 72, grade: 'B2', points: 3.5 },
      'Economics': { score: 62, grade: 'C4', points: 2.5 },
    },
    totalCredits: 8,
    gpa: 3.5,
    rank: 2,
  },
  {
    id: 'b3',
    indexNo: '4230101003',
    name: 'Kondo Koroma',
    classArm: 'SSS 3 Arts B',
    stream: 'Arts',
    subjects: {
      'Mathematics': { score: 58, grade: 'C5', points: 2.0 },
      'English Language': { score: 82, grade: 'A1', points: 4.0 },
      'Integrated Science': { score: 65, grade: 'B3', points: 3.0 },
      'Social Studies': { score: 86, grade: 'A1', points: 4.0 },
      'Biology': { score: 60, grade: 'C4', points: 2.5 },
      'Chemistry': { score: 52, grade: 'C6', points: 1.5 },
      'Physics': { score: 48, grade: 'D7', points: 1.0 },
      'Economics': { score: 74, grade: 'B2', points: 3.5 },
    },
    totalCredits: 7,
    gpa: 2.7,
    rank: 3,
  },
  {
    id: 'b4',
    indexNo: '4230101004',
    name: 'Aminata Bangura',
    classArm: 'SSS 3 Commercial A',
    stream: 'Commercial',
    subjects: {
      'Mathematics': { score: 71, grade: 'B2', points: 3.5 },
      'English Language': { score: 69, grade: 'B3', points: 3.0 },
      'Integrated Science': { score: 61, grade: 'C4', points: 2.5 },
      'Social Studies': { score: 66, grade: 'B3', points: 3.0 },
      'Biology': { score: 55, grade: 'C5', points: 2.0 },
      'Chemistry': { score: 50, grade: 'C6', points: 1.5 },
      'Physics': { score: 44, grade: 'E8', points: 0.5 },
      'Economics': { score: 84, grade: 'A1', points: 4.0 },
    },
    totalCredits: 6,
    gpa: 2.5,
    rank: 4,
  },
  {
    id: 'b5',
    indexNo: '4230101005',
    name: 'Mohamed Kamara',
    classArm: 'SSS 3 Science B',
    stream: 'Science',
    subjects: {
      'Mathematics': { score: 54, grade: 'C6', points: 1.5 },
      'English Language': { score: 58, grade: 'C5', points: 2.0 },
      'Integrated Science': { score: 62, grade: 'C4', points: 2.5 },
      'Social Studies': { score: 60, grade: 'C4', points: 2.5 },
      'Biology': { score: 51, grade: 'C6', points: 1.5 },
      'Chemistry': { score: 46, grade: 'D7', points: 1.0 },
      'Physics': { score: 42, grade: 'E8', points: 0.5 },
      'Economics': { score: 56, grade: 'C5', points: 2.0 },
    },
    totalCredits: 5,
    gpa: 1.7,
    rank: 5,
  },
];

export function BroadsheetQuickPreviewModal({
  officer,
  onClose,
}: {
  officer: OfficerData;
  onClose: () => void;
}) {
  const [selectedClass, setSelectedClass]   = useState('SSS 3');
  const [selectedStream, setSelectedStream] = useState('All');
  const [search, setSearch]                 = useState('');

  const filteredStudents = SAMPLE_STUDENTS.filter((s) => {
    const matchStream = selectedStream === 'All' || s.stream === selectedStream;
    const matchSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.indexNo.includes(search);
    return matchStream && matchSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-6xl glass-card rounded-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl border border-violet-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[hsl(var(--bg-tertiary)/0.6)] flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-black flex-shrink-0">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm text-[hsl(var(--text-primary))] uppercase tracking-wider">
                  Master Broadsheet Quick Preview — WAEC A1–F9
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-bold border border-violet-500/20">
                  {selectedClass}
                </span>
              </div>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                {officer.tenantName} — 2025/2026 End-of-Term Broadsheet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" /> Print Broadsheet
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 sm:p-4 border-b border-[hsl(var(--border))] flex flex-wrap items-center justify-between gap-3 bg-[hsl(var(--bg-tertiary)/0.3)] flex-shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase">
              <Filter className="w-3.5 h-3.5 text-violet-400" /> Class:
            </div>
            {['Class 6', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  selectedClass === cls
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-violet-500/50 font-semibold"
            >
              <option value="All">All Streams</option>
              <option value="Science">Science 🧪</option>
              <option value="Arts">Arts 🎨</option>
              <option value="Commercial">Commercial 💼</option>
            </select>

            <div className="relative min-w-[140px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                placeholder="Search candidate…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
        </div>

        {/* Printable Master Broadsheet Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 print:p-0">
          <div className="glass-card rounded-2xl overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.6)]">
                    <th className="py-2.5 px-3 font-black uppercase text-[10px] text-[hsl(var(--text-tertiary))]">Rank</th>
                    <th className="py-2.5 px-3 font-black uppercase text-[10px] text-[hsl(var(--text-tertiary))]">WAEC Index</th>
                    <th className="py-2.5 px-3 font-black uppercase text-[10px] text-[hsl(var(--text-tertiary))] min-w-[140px]">Candidate Name</th>
                    {SAMPLE_SUBJECTS.map((sub) => (
                      <th key={sub} className="py-2.5 px-2 text-center font-black uppercase text-[9px] text-[hsl(var(--text-tertiary))] min-w-[65px]">
                        {sub.split(' ')[0]}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center font-black uppercase text-[10px] text-[hsl(var(--text-tertiary))]">Credits</th>
                    <th className="py-2.5 px-3 text-center font-black uppercase text-[10px] text-[hsl(var(--text-tertiary))]">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                      <td className="py-2.5 px-3 font-black text-[hsl(var(--text-primary))]">
                        {s.rank === 1 ? '🥇 1st' : s.rank === 2 ? '🥈 2nd' : s.rank === 3 ? '🥉 3rd' : `${s.rank}th`}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-violet-400">{s.indexNo}</td>
                      <td className="py-2.5 px-3 font-bold text-[hsl(var(--text-primary))]">{s.name}</td>

                      {SAMPLE_SUBJECTS.map((sub) => {
                        const obj = s.subjects[sub];
                        if (!obj) return <td key={sub} className="py-2.5 px-2 text-center text-[hsl(var(--text-tertiary))]">—</td>;
                        const isCredit = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(obj.grade);
                        return (
                          <td key={sub} className="py-2.5 px-2 text-center">
                            <span
                              className={`inline-block font-black text-[10px] px-1.5 py-0.5 rounded ${
                                isCredit
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : obj.grade === 'F9'
                                  ? 'bg-red-500/15 text-red-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}
                              title={`${obj.score}% (${obj.points.toFixed(1)} pts)`}
                            >
                              {obj.grade}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-center font-black text-emerald-400">{s.totalCredits} Credits</td>
                      <td className="py-2.5 px-3 text-center font-black text-violet-400">{s.gpa.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer Summary */}
        <div className="p-4 border-t border-[hsl(var(--border))] flex flex-wrap items-center justify-between gap-3 bg-[hsl(var(--bg-tertiary)/0.6)] flex-shrink-0 text-xs print:hidden">
          <div className="flex items-center gap-3 text-[hsl(var(--text-tertiary))]">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 5 / 5 Candidates Qualified for WASSCE
            </span>
            <span className="text-[10px]">Credits = A1 to C6 · Pass = D7 to E8 · Fail = F9</span>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-3.5 h-3.5" /> Print Broadsheet
          </button>
        </div>
      </div>
    </div>
  );
}
