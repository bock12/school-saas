'use client';

import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  ScrollText, Printer, Search, CheckCircle2,
  FileSpreadsheet, X
} from 'lucide-react';
import { useState } from 'react';

const availableClasses = [
  { class: 'SSS 1A', exam: 'End-of-Term 2026', students: 38, subjects: 9, generated: true },
  { class: 'SSS 1B', exam: 'End-of-Term 2026', students: 41, subjects: 9, generated: true },
  { class: 'SSS 2A', exam: 'End-of-Term 2026', students: 35, subjects: 9, generated: false },
  { class: 'SSS 2B', exam: 'End-of-Term 2026', students: 37, subjects: 9, generated: false },
  { class: 'SSS 3A', exam: 'End-of-Term 2026', students: 32, subjects: 9, generated: true },
];

interface BroadsheetStudent {
  rollNo: string;
  name: string;
  pos: number;
  maths: number;
  eng: number;
  sci: number;
  bio: number;
  chem: number;
  phys: number;
  econ: number;
  gov: number;
  lit: number;
  total: number;
  avg: number;
  grade: string;
  status: 'PASS' | 'FAIL';
}

const initialBroadsheets: Record<string, BroadsheetStudent[]> = {
  'SSS 1A': [
    { rollNo: '101', name: 'John Kamara', pos: 1, maths: 92, eng: 88, sci: 85, bio: 82, chem: 86, phys: 90, econ: 84, gov: 89, lit: 87, total: 783, avg: 87.0, grade: 'A1', status: 'PASS' },
    { rollNo: '102', name: 'Aminata Sesay', pos: 2, maths: 88, eng: 91, sci: 80, bio: 85, chem: 79, phys: 82, econ: 86, gov: 84, lit: 89, total: 764, avg: 84.9, grade: 'B2', status: 'PASS' },
    { rollNo: '103', name: 'Fatima Koroma', pos: 3, maths: 81, eng: 84, sci: 78, bio: 79, chem: 82, phys: 80, econ: 82, gov: 80, lit: 83, total: 729, avg: 81.0, grade: 'B2', status: 'PASS' },
    { rollNo: '104', name: 'Mohamed Conteh', pos: 4, maths: 75, eng: 78, sci: 72, bio: 70, chem: 74, phys: 71, econ: 76, gov: 78, lit: 74, total: 668, avg: 74.2, grade: 'B3', status: 'PASS' },
    { rollNo: '105', name: 'Ibrahim Bangura', pos: 5, maths: 68, eng: 72, sci: 65, bio: 60, chem: 63, phys: 64, econ: 70, gov: 69, lit: 67, total: 598, avg: 66.4, grade: 'C4', status: 'PASS' },
    { rollNo: '106', name: 'Mariama Turay', pos: 6, maths: 38, eng: 52, sci: 41, bio: 45, chem: 35, phys: 39, econ: 48, gov: 50, lit: 44, total: 392, avg: 43.5, grade: 'E8', status: 'FAIL' },
  ],
  'SSS 3A': [
    { rollNo: '301', name: 'Alhaji Mansaray', pos: 1, maths: 95, eng: 90, sci: 92, bio: 88, chem: 94, phys: 96, econ: 89, gov: 91, lit: 90, total: 825, avg: 91.6, grade: 'A1', status: 'PASS' },
    { rollNo: '302', name: 'Kadiatu Cole', pos: 2, maths: 89, eng: 92, sci: 86, bio: 84, chem: 88, phys: 87, econ: 90, gov: 88, lit: 91, total: 795, avg: 88.3, grade: 'A1', status: 'PASS' },
  ],
};

export function BroadsheetsTab({ officer }: { officer: OfficerData }) {
  void officer;
  const [selectedClass, setSelectedClass] = useState<string>('SSS 1A');
  const [broadsheetData] = useState(initialBroadsheets);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const currentStudents = broadsheetData[selectedClass] || [
    { rollNo: '201', name: 'Samuel Bangura', pos: 1, maths: 84, eng: 80, sci: 76, bio: 78, chem: 82, phys: 79, econ: 81, gov: 83, lit: 80, total: 723, avg: 80.3, grade: 'B2', status: 'PASS' },
    { rollNo: '202', name: 'Zainab Jalloh', pos: 2, maths: 79, eng: 82, sci: 74, bio: 76, chem: 78, phys: 75, econ: 80, gov: 81, lit: 78, total: 703, avg: 78.1, grade: 'B2', status: 'PASS' },
  ];

  const filteredStudents = currentStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.includes(searchQuery)
  );

  const handleGenerateBroadsheet = (clsName: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSuccessToast(`Master Broadsheet for ${clsName} calculated and generated!`);
      setTimeout(() => setSuccessToast(''), 4000);
    }, 1200);
  };

  const handleExportCSV = () => {
    const headers = ['Position', 'Roll No', 'Student Name', 'Maths', 'English', 'Science', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Government', 'Literature', 'Total Score', 'Average %', 'Grade', 'Status'];
    const rows = filteredStudents.map(s => [
      s.pos, s.rollNo, `"${s.name}"`, s.maths, s.eng, s.sci, s.bio, s.chem, s.phys, s.econ, s.gov, s.lit, s.total, s.avg, s.grade, s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Broadsheet_${selectedClass.replace(' ', '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Master Broadsheets Generator</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Official class broadsheets with all subject scores, positions, grade aggregates, and WAEC equivalents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] text-xs font-bold border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary)/0.8)] transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV / Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
          >
            <Printer className="w-4 h-4" /> Print Master Broadsheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Class Selection Sidebar */}
        <div className="space-y-3">
          <p className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Select Class</p>
          <div className="space-y-2">
            {availableClasses.map(c => (
              <div
                key={c.class}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedClass(c.class)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedClass(c.class); }}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedClass === c.class
                    ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                    : 'glass-card border-[hsl(var(--border))] hover:border-violet-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-black text-sm text-[hsl(var(--text-primary))]">{c.class}</p>
                  {c.generated ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">✓ Generated</span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleGenerateBroadsheet(c.class); }}
                      disabled={isGenerating}
                      className="text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/20 cursor-pointer"
                    >
                      {isGenerating ? 'Calculating...' : '⚡ Auto-Generate'}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">{c.students} Candidates • {c.subjects} Core Subjects</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Main Broadsheet Table */}
        <div className="xl:col-span-3 glass-card rounded-2xl border border-[hsl(var(--border))] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[hsl(var(--bg-tertiary)/0.3)]">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-violet-400" />
              <div>
                <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">{selectedClass} Master Broadsheet — End-of-Term 2026</h2>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Albert Academy Senior Secondary School • Official Examination Record</p>
              </div>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student or roll no..."
                className="w-full text-xs bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] pl-9 pr-3 py-1.5 rounded-xl border border-[hsl(var(--border))] outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-tertiary))] font-black uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-3 text-center">Pos</th>
                  <th className="py-3 px-3">Roll</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-2 text-center">Maths</th>
                  <th className="py-3 px-2 text-center">English</th>
                  <th className="py-3 px-2 text-center">Sci</th>
                  <th className="py-3 px-2 text-center">Bio</th>
                  <th className="py-3 px-2 text-center">Chem</th>
                  <th className="py-3 px-2 text-center">Phys</th>
                  <th className="py-3 px-2 text-center">Econ</th>
                  <th className="py-3 px-2 text-center">Govt</th>
                  <th className="py-3 px-2 text-center">Lit</th>
                  <th className="py-3 px-3 text-center">Total</th>
                  <th className="py-3 px-3 text-center">Avg %</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {filteredStudents.map(s => (
                  <tr key={s.rollNo} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="py-3 px-3 text-center">
                      {s.pos === 1 ? (
                        <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-0.5">🥇 1</span>
                      ) : s.pos === 2 ? (
                        <span className="text-xs font-black text-slate-300 flex items-center justify-center gap-0.5">🥈 2</span>
                      ) : s.pos === 3 ? (
                        <span className="text-xs font-black text-amber-600 flex items-center justify-center gap-0.5">🥉 3</span>
                      ) : (
                        <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">{s.pos}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[hsl(var(--text-tertiary))]">{s.rollNo}</td>
                    <td className="py-3 px-3 font-bold text-[hsl(var(--text-primary))] whitespace-nowrap">{s.name}</td>
                    {[s.maths, s.eng, s.sci, s.bio, s.chem, s.phys, s.econ, s.gov, s.lit].map((v, vi) => (
                      <td key={vi} className="py-3 px-2 text-center font-mono">
                        <span className={`font-semibold ${v >= 75 ? 'text-emerald-400' : v >= 50 ? 'text-[hsl(var(--text-primary))]' : 'text-red-400 font-bold'}`}>{v}</span>
                      </td>
                    ))}
                    <td className="py-3 px-3 text-center font-black text-[hsl(var(--text-primary))] font-mono">{s.total}</td>
                    <td className="py-3 px-3 text-center font-black text-violet-400 font-mono">{s.avg.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-black px-2 py-0.5 rounded-md text-[10px] ${s.avg >= 80 ? 'bg-emerald-500/15 text-emerald-400' : s.avg >= 60 ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                        {s.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${s.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
