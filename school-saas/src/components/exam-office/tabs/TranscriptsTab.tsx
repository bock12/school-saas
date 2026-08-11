'use client';

import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  Archive, Download, Printer, Search, Award, Eye, FileText, CheckCircle2,
  X, Sparkles, Shield, User, Calendar, Check, Filter
} from 'lucide-react';
import { useState } from 'react';

interface CertificateRecord {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  type: 'School Certificate' | 'Annual Transcript';
  status: 'Ready' | 'Pending' | 'On Hold';
  date: string;
  serialNo: string;
  cgpa: string;
  resultStatus: string;
  subjects: { name: string; caScore: number; examScore: number; total: number; grade: string; points: number }[];
}

const mockCertificates: CertificateRecord[] = [
  {
    id: 'cert-1',
    name: 'John Kamara',
    rollNo: '2026-SSS3-014',
    class: 'SSS 3A',
    type: 'School Certificate',
    status: 'Ready',
    date: 'Aug 22, 2026',
    serialNo: 'CERT-2026-08492',
    cgpa: '3.88',
    resultStatus: 'PASS WITH DISTINCTION (FIRST CLASS)',
    subjects: [
      { name: 'Mathematics', caScore: 28, examScore: 64, total: 92, grade: 'A1', points: 4.0 },
      { name: 'English Language', caScore: 26, examScore: 62, total: 88, grade: 'A1', points: 4.0 },
      { name: 'Physics', caScore: 27, examScore: 63, total: 90, grade: 'A1', points: 4.0 },
      { name: 'Chemistry', caScore: 25, examScore: 61, total: 86, grade: 'A1', points: 4.0 },
      { name: 'Biology', caScore: 24, examScore: 58, total: 82, grade: 'B2', points: 3.5 },
      { name: 'Economics', caScore: 26, examScore: 58, total: 84, grade: 'B2', points: 3.5 },
    ],
  },
  {
    id: 'cert-2',
    name: 'Aminata Sesay',
    rollNo: '2026-SSS3-018',
    class: 'SSS 3A',
    type: 'School Certificate',
    status: 'Ready',
    date: 'Aug 22, 2026',
    serialNo: 'CERT-2026-08493',
    cgpa: '3.75',
    resultStatus: 'PASS WITH CREDIT',
    subjects: [
      { name: 'Mathematics', caScore: 26, examScore: 62, total: 88, grade: 'A1', points: 4.0 },
      { name: 'English Language', caScore: 27, examScore: 64, total: 91, grade: 'A1', points: 4.0 },
      { name: 'Physics', caScore: 24, examScore: 58, total: 82, grade: 'B2', points: 3.5 },
      { name: 'Chemistry', caScore: 25, examScore: 59, total: 84, grade: 'B2', points: 3.5 },
      { name: 'Biology', caScore: 26, examScore: 59, total: 85, grade: 'A1', points: 4.0 },
    ],
  },
  {
    id: 'cert-3',
    name: 'Mohamed Conteh',
    rollNo: '2026-SSS2-009',
    class: 'SSS 2A',
    type: 'Annual Transcript',
    status: 'Pending',
    date: '—',
    serialNo: 'TRNS-2026-01042',
    cgpa: '3.10',
    resultStatus: 'PASS WITH CREDIT',
    subjects: [
      { name: 'Mathematics', caScore: 22, examScore: 53, total: 75, grade: 'B3', points: 3.0 },
      { name: 'English Language', caScore: 24, examScore: 54, total: 78, grade: 'B2', points: 3.5 },
    ],
  },
  {
    id: 'cert-4',
    name: 'Fatima Koroma',
    rollNo: '2026-SSS1-022',
    class: 'SSS 1A',
    type: 'Annual Transcript',
    status: 'Ready',
    date: 'Aug 21, 2026',
    serialNo: 'TRNS-2026-01043',
    cgpa: '3.60',
    resultStatus: 'PASS WITH CREDIT',
    subjects: [
      { name: 'Mathematics', caScore: 25, examScore: 56, total: 81, grade: 'B2', points: 3.5 },
      { name: 'English Language', caScore: 26, examScore: 58, total: 84, grade: 'B2', points: 3.5 },
      { name: 'Science', caScore: 24, examScore: 54, total: 78, grade: 'B2', points: 3.5 },
    ],
  },
  {
    id: 'cert-5',
    name: 'Ibrahim Bangura',
    rollNo: '2026-SSS3-031',
    class: 'SSS 3A',
    type: 'School Certificate',
    status: 'On Hold',
    date: '—',
    serialNo: 'CERT-2026-08499',
    cgpa: '2.50',
    resultStatus: 'RESULT ON HOLD — CLEARANCE PENDING',
    subjects: [],
  },
];

export function TranscriptsTab({ officer }: { officer: OfficerData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [docFilter, setDocFilter] = useState<'all' | 'certificate' | 'transcript'>('all');
  const [selectedCertForPreview, setSelectedCertForPreview] = useState<CertificateRecord | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const filtered = mockCertificates.filter(c => {
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = docFilter === 'all' || (docFilter === 'certificate' && c.type === 'School Certificate') || (docFilter === 'transcript' && c.type === 'Annual Transcript');
    return matchesQuery && matchesFilter;
  });

  const handlePrintDocument = () => {
    window.print();
  };

  const handleDownloadPDF = (certName: string) => {
    setSuccessToast(`Official Transcript PDF for ${certName} downloaded!`);
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
            <Archive className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Transcripts &amp; School Certificates</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Generate and verify official academic transcripts, WAEC-formatted broadsheet certificates, and school leaving diplomas
          </p>
        </div>
        <button
          onClick={() => setShowBatchModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
        >
          <Printer className="w-4 h-4" /> Batch Print Certificates
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full bg-[hsl(var(--bg-tertiary))] text-xs text-[hsl(var(--text-primary))] pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            onClick={() => setDocFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${docFilter === 'all' ? 'bg-violet-600 text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
          >
            All Documents
          </button>
          <button
            onClick={() => setDocFilter('certificate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${docFilter === 'certificate' ? 'bg-violet-600 text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
          >
            Certificates
          </button>
          <button
            onClick={() => setDocFilter('transcript')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${docFilter === 'transcript' ? 'bg-violet-600 text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
          >
            Transcripts
          </button>
        </div>
      </div>

      {/* Document List Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]">
                {['Student Name', 'Roll Number', 'Class', 'Document Type', 'Status', 'Issued Date', 'Serial No', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="py-3 px-4 font-bold text-xs text-[hsl(var(--text-primary))]">{c.name}</td>
                  <td className="py-3 px-4 text-xs font-mono text-[hsl(var(--text-tertiary))]">{c.rollNo}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-[hsl(var(--text-secondary))]">{c.class}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--text-secondary))]">
                      {c.type === 'School Certificate' ? <Award className="w-3.5 h-3.5 text-amber-400" /> : <Archive className="w-3.5 h-3.5 text-blue-400" />}
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      c.status === 'Ready' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      c.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))]">{c.date}</td>
                  <td className="py-3 px-4 text-xs font-mono text-[10px] text-[hsl(var(--text-tertiary))]">{c.serialNo}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {c.status === 'Ready' ? (
                        <>
                          <button
                            onClick={() => setSelectedCertForPreview(c)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-violet-600/15 text-violet-300 font-bold hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(c.name)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-bold hover:text-[hsl(var(--text-primary))] transition-all flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </>
                      ) : c.status === 'Pending' ? (
                        <button
                          onClick={() => {
                            c.status = 'Ready';
                            c.date = 'Aug 22, 2026';
                            setSuccessToast(`Transcript generated for ${c.name}`);
                            setTimeout(() => setSuccessToast(''), 4000);
                          }}
                          className="text-xs px-3 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold hover:bg-amber-500/25"
                        >
                          ⚡ Generate
                        </button>
                      ) : (
                        <span className="text-[10px] text-red-400 font-semibold">On hold (Clearance)</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── OFFICIAL ACADEMIC TRANSCRIPT & CERTIFICATE PREVIEW MODAL ── */}
      {selectedCertForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="glass-card rounded-2xl p-8 max-w-3xl w-full border border-neutral-800 shadow-2xl space-y-6 bg-[#0f0f10] text-white my-8 max-h-[90vh] overflow-y-auto relative">
            
            {/* Watermark Badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <Shield className="w-96 h-96 text-white" />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 relative z-10">
              <span className="text-xs font-mono text-neutral-400">OFFICIAL DOCUMENT • SERIAL: {selectedCertForPreview.serialNo}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(selectedCertForPreview.name)}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Download PDF
                </button>
                <button
                  onClick={handlePrintDocument}
                  className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-violet-600/20"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Document
                </button>
                <button onClick={() => setSelectedCertForPreview(null)} className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Document Layout (Print Ready Container) */}
            <div className="p-8 rounded-2xl bg-[#171718] border border-neutral-800 space-y-6 relative z-10 shadow-inner">
              {/* School Header */}
              <div className="text-center space-y-1.5 border-b border-neutral-800 pb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mx-auto flex items-center justify-center text-xl font-black text-white shadow-lg">
                  AA
                </div>
                <h2 className="font-black text-xl text-white uppercase tracking-wider">Albert Academy Senior Secondary School</h2>
                <p className="text-xs text-neutral-400">Office of the Registrar &amp; Controller of Examinations</p>
                <p className="text-[10px] font-mono text-neutral-500">Freetown, Sierra Leone • Government Accredited Examination Center</p>
              </div>

              {/* Document Title Banner */}
              <div className="text-center py-2 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                <h3 className="font-black text-sm text-violet-300 uppercase tracking-widest">
                  OFFICIAL ACADEMIC TRANSCRIPT &amp; PERFORMANCE RECORD
                </h3>
              </div>

              {/* Student Bio Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#202022] text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px]">STUDENT NAME</span>
                  <span className="font-bold text-white">{selectedCertForPreview.name}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">ROLL / REG NO.</span>
                  <span className="font-mono font-bold text-neutral-200">{selectedCertForPreview.rollNo}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">CLASS / YEAR</span>
                  <span className="font-bold text-white">{selectedCertForPreview.class} (2025/2026)</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">DATE ISSUED</span>
                  <span className="font-bold text-white">{selectedCertForPreview.date}</span>
                </div>
              </div>

              {/* Academic Performance Table */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Subject Performance Breakdown</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] bg-[#1a1a1c]">
                        <th className="py-2.5 px-3">Subject Title</th>
                        <th className="py-2.5 px-3 text-center">CA Score (30%)</th>
                        <th className="py-2.5 px-3 text-center">Exam Paper (70%)</th>
                        <th className="py-2.5 px-3 text-center">Final Score</th>
                        <th className="py-2.5 px-3 text-center">WAEC Grade</th>
                        <th className="py-2.5 px-3 text-center">Grade Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {selectedCertForPreview.subjects.map((sb, idx) => (
                        <tr key={idx} className="hover:bg-neutral-800/30">
                          <td className="py-2.5 px-3 font-bold text-neutral-200">{sb.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-neutral-400">{sb.caScore}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-neutral-400">{sb.examScore}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-white">{sb.total}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{sb.grade}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-neutral-300">{sb.points.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cumulative Result Summary Box */}
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px]">CUMULATIVE GRADE POINT AVERAGE (CGPA)</span>
                  <span className="text-2xl font-black text-violet-300">{selectedCertForPreview.cgpa} / 4.00</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 block text-[10px]">FINAL RESULT STANDING</span>
                  <span className="font-black text-xs text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 inline-block mt-0.5">
                    {selectedCertForPreview.resultStatus}
                  </span>
                </div>
              </div>

              {/* Signatures & Seal Block */}
              <div className="pt-8 border-t border-neutral-800 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-1">
                  <div className="border-b border-neutral-700 w-40 mx-auto pb-1 font-italic text-neutral-400 text-[11px]">S. Conteh</div>
                  <p className="font-bold text-neutral-200">Controller of Examinations</p>
                  <p className="text-[10px] text-neutral-500">Albert Academy Senior School</p>
                </div>
                <div className="space-y-1">
                  <div className="border-b border-neutral-700 w-40 mx-auto pb-1 font-italic text-neutral-400 text-[11px]">Dr. F. Cole</div>
                  <p className="font-bold text-neutral-200">Principal / Head of Institution</p>
                  <p className="text-[10px] text-neutral-500">Official Seal &amp; Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BATCH PRINT MODAL ────────────────────────────────────────── */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-[hsl(var(--border))] shadow-2xl space-y-4 bg-[hsl(var(--bg-secondary))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Batch Print Certificates</h3>
              <button onClick={() => setShowBatchModal(false)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              Select class cohort to generate and print all official school leaving certificates and transcripts in a single batch file.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[hsl(var(--text-tertiary))]">Select Target Cohort</label>
              <select className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none">
                <option>SSS 3A Graduating Class (32 Students)</option>
                <option>SSS 3B Graduating Class (30 Students)</option>
                <option>SSS 2A Annual Transcripts (35 Students)</option>
              </select>
            </div>
            <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-end gap-2">
              <button onClick={() => setShowBatchModal(false)} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  setSuccessToast('Batch print queue generated (32 certificates ready).');
                  setTimeout(() => setSuccessToast(''), 4000);
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Start Batch Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
