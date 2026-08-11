'use client';

import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  Fingerprint, Printer, QrCode, Download, Eye, CheckCircle2,
  X, Sparkles, Shield, User, Calendar, MapPin, Search
} from 'lucide-react';
import { useState } from 'react';

interface AdmitCardRecord {
  examNo: string;
  name: string;
  rollNo: string;
  class: string;
  seatNo: string;
  center: string;
  generated: boolean;
  clearance: boolean;
  timetable: { subject: string; date: string; time: string; hall: string }[];
}

const mockAdmitCards: AdmitCardRecord[] = [
  {
    examNo: 'EX-2026-0001',
    name: 'John Kamara',
    rollNo: '2026-SSS3-014',
    class: 'SSS 3A',
    seatNo: 'Desk A-01',
    center: 'Main Examination Hall A',
    generated: true,
    clearance: true,
    timetable: [
      { subject: 'Mathematics', date: '2026-08-18', time: '08:30 AM - 10:00 AM', hall: 'Hall A' },
      { subject: 'English Language', date: '2026-08-19', time: '08:30 AM - 10:00 AM', hall: 'Hall A' },
      { subject: 'Physics', date: '2026-08-20', time: '08:30 AM - 10:00 AM', hall: 'Hall A' },
      { subject: 'Chemistry', date: '2026-08-21', time: '08:30 AM - 10:00 AM', hall: 'Hall A' },
    ],
  },
  {
    examNo: 'EX-2026-0002',
    name: 'Aminata Sesay',
    rollNo: '2026-SSS3-018',
    class: 'SSS 3A',
    seatNo: 'Desk A-02',
    center: 'Main Examination Hall A',
    generated: true,
    clearance: true,
    timetable: [
      { subject: 'Mathematics', date: '2026-08-18', time: '08:30 AM - 10:00 AM', hall: 'Hall A' },
      { subject: 'English Language', date: '2026-08-19', time: '08:30 AM - 10:00 AM', hall: 'Hall A' },
    ],
  },
  {
    examNo: 'EX-2026-0003',
    name: 'Mohamed Conteh',
    rollNo: '2026-SSS2-009',
    class: 'SSS 2A',
    seatNo: 'Desk B-15',
    center: 'Senior Science Hall B',
    generated: false,
    clearance: false,
    timetable: [],
  },
  {
    examNo: 'EX-2026-0004',
    name: 'Fatima Koroma',
    rollNo: '2026-SSS1-022',
    class: 'SSS 1A',
    seatNo: 'Desk C-07',
    center: 'Auditorium Hall C',
    generated: true,
    clearance: true,
    timetable: [
      { subject: 'Mathematics', date: '2026-08-18', time: '08:30 AM - 10:00 AM', hall: 'Hall C' },
    ],
  },
];

export function AdmitCardsTab({ officer }: { officer: OfficerData }) {
  const [cardsList, setCardsList] = useState(mockAdmitCards);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardForPass, setSelectedCardForPass] = useState<AdmitCardRecord | null>(null);
  const [successToast, setSuccessToast] = useState('');

  const filtered = cardsList.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.examNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBatchGenerate = () => {
    const updated = cardsList.map(c => ({ ...c, generated: true, clearance: true }));
    setCardsList(updated);
    setSuccessToast('All Candidate Admit Cards generated and signed with QR codes!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handlePrintPass = () => {
    window.print();
  };

  const handleDownloadPDF = (name: string) => {
    setSuccessToast(`Admit Card PDF for ${name} downloaded!`);
    setTimeout(() => setSuccessToast(''), 4000);
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
            <Fingerprint className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Admit Cards &amp; Roll Numbers</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Generate candidate roll numbers, seat allocations, and printable exam hall passes with QR verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchGenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
          >
            <Sparkles className="w-4 h-4" /> Batch Generate All Cards
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))] text-center">
          <p className="text-2xl font-black text-emerald-400">{cardsList.filter(a => a.generated).length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Generated &amp; Issued</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))] text-center">
          <p className="text-2xl font-black text-amber-400">{cardsList.filter(a => !a.generated).length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Pending Generation</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))] text-center">
          <p className="text-2xl font-black text-violet-400">{cardsList.length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Total Registered Candidates</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-3 border border-[hsl(var(--border))]">
        <div className="relative">
          <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search candidate by name, exam number, or class..."
            className="w-full bg-[hsl(var(--bg-tertiary))] text-xs text-[hsl(var(--text-primary))] pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Admit Cards Registry Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">Candidate Admit Card Registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]">
                {['Exam Number', 'Candidate Name', 'Roll Number', 'Class', 'Seat No.', 'Exam Center', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {filtered.map(a => (
                <tr key={a.examNo} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-violet-400">{a.examNo}</td>
                  <td className="py-3 px-4 font-bold text-xs text-[hsl(var(--text-primary))]">{a.name}</td>
                  <td className="py-3 px-4 text-xs font-mono text-[hsl(var(--text-tertiary))]">{a.rollNo}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{a.class}</td>
                  <td className="py-3 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{a.seatNo}</td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{a.center}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${a.generated ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                      {a.generated ? 'Generated' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedCardForPass(a)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-violet-600/15 text-violet-300 font-bold hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Hall Pass
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(a.name)}
                        className="p-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-tertiary)/0.8)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CANDIDATE ADMIT CARD & HALL PASS MODAL ───────────────────── */}
      {selectedCardForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full border border-neutral-800 shadow-2xl space-y-5 bg-[#121214] text-white my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-mono text-neutral-400">EXAMINATION ADMIT CARD • ROLL NO: {selectedCardForPass.rollNo}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(selectedCardForPass.name)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Download PDF
                </button>
                <button
                  onClick={handlePrintPass}
                  className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-1 shadow-md shadow-violet-600/20"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Admit Card
                </button>
                <button onClick={() => setSelectedCardForPass(null)} className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Admit Card Pass Box */}
            <div className="p-6 rounded-2xl bg-[#19191c] border border-neutral-800 space-y-5 relative shadow-inner">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-base shadow-md">
                    AA
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider">Albert Academy Senior Secondary School</h3>
                    <p className="text-[10px] text-neutral-400">Official Candidate Examination Hall Pass — 2026</p>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="p-2 rounded-xl bg-white text-black text-center flex flex-col items-center">
                  <QrCode className="w-10 h-10" />
                  <span className="text-[8px] font-mono font-bold mt-0.5">VERIFIED</span>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#202024] p-4 rounded-xl">
                <div>
                  <span className="text-neutral-400 block text-[10px]">CANDIDATE NAME</span>
                  <span className="font-bold text-white text-sm">{selectedCardForPass.name}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">EXAM NUMBER</span>
                  <span className="font-mono font-bold text-violet-400">{selectedCardForPass.examNo}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">CLASS / STREAM</span>
                  <span className="font-semibold text-neutral-200">{selectedCardForPass.class}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">ASSIGNED SEAT NO.</span>
                  <span className="font-bold text-emerald-400">{selectedCardForPass.seatNo}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">EXAMINATION CENTER</span>
                  <span className="font-semibold text-neutral-200">{selectedCardForPass.center}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">FINANCIAL CLEARANCE</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] inline-block mt-0.5">
                    ✓ CLEARED
                  </span>
                </div>
              </div>

              {/* Scheduled Examination Timetable */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Candidate Timetable Allocation</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase bg-[#1e1e22]">
                        <th className="py-2 px-3">Subject</th>
                        <th className="py-2 px-3">Exam Date</th>
                        <th className="py-2 px-3">Timing</th>
                        <th className="py-2 px-3">Hall Venue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {selectedCardForPass.timetable.length > 0 ? (
                        selectedCardForPass.timetable.map((t, idx) => (
                          <tr key={idx} className="hover:bg-neutral-800/40">
                            <td className="py-2 px-3 font-bold text-blue-400">{t.subject}</td>
                            <td className="py-2 px-3 text-neutral-300">{t.date}</td>
                            <td className="py-2 px-3 text-neutral-300 font-mono text-[11px]">{t.time}</td>
                            <td className="py-2 px-3 font-semibold text-neutral-200">{t.hall}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-3 text-center text-neutral-500 text-xs">
                            Standard class schedule allocated (4 Papers)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Instructions & Signatures */}
              <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 gap-4 text-[10px] text-neutral-400">
                <div>
                  <p className="font-bold text-neutral-300 mb-1">CANDIDATE RULES:</p>
                  <p>1. Must bring this Admit Card to every examination session.</p>
                  <p>2. No mobile phones or programmable calculators allowed in hall.</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="border-b border-neutral-700 w-32 ml-auto pb-1 text-neutral-300 font-italic text-[10px]">S. Conteh</div>
                  <p className="font-bold text-neutral-200 mt-0.5">Exam Officer Signature &amp; Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
