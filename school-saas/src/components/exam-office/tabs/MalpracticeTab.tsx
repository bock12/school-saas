'use client';

import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  AlertTriangle, Plus, ChevronRight, Clock, XCircle, CheckCircle2, Shield,
  X, Check, FileText, UserX, Gavel, Search, Filter, AlertCircle, Scale, Eye
} from 'lucide-react';

interface MalpracticeIncident {
  id: string;
  candidate: string;
  class: string;
  examNo: string;
  exam: string;
  type: string;
  hall: string;
  invigilator: string;
  date: string;
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Under Investigation' | 'Result Cancelled' | 'Warning Issued' | 'Exonerated & Cleared' | 'Suspended';
  evidenceDetails?: string;
  committeeDecision?: string;
}

const initialIncidents: MalpracticeIncident[] = [
  {
    id: 'INC-2026-001',
    candidate: 'Ibrahim Bangura',
    class: 'SSS 3A',
    examNo: 'EX-2026-0005',
    exam: 'Physics',
    type: 'Possession of Electronic Device (Smart Watch)',
    hall: 'Main Hall A',
    invigilator: 'Mr. A. Kamara',
    date: 'Aug 19, 2026',
    severity: 'Critical',
    status: 'Under Investigation',
    evidenceDetails: 'Smartwatch intercepted with transmitted physics formula notes during Section B.',
  },
  {
    id: 'INC-2026-002',
    candidate: 'Samuel Turay',
    class: 'SSS 2B',
    examNo: 'EX-2026-0041',
    exam: 'Mathematics',
    type: 'Copying from Adjacent Candidate Desk',
    hall: 'Main Hall A',
    invigilator: 'Mrs. M. Bangura',
    date: 'Aug 18, 2026',
    severity: 'Major',
    status: 'Result Cancelled',
    evidenceDetails: 'Direct text copying observed by invigilator during first 30 mins.',
    committeeDecision: 'Subject score nullified; candidate barred from re-taking paper until 2027.',
  },
  {
    id: 'INC-2026-003',
    candidate: 'Mary Koroma',
    class: 'SSS 1A',
    examNo: 'EX-2026-0107',
    exam: 'English Language',
    type: 'Unauthorized Printed Notes in Desk Slot',
    hall: 'Senior Science Hall B',
    invigilator: 'Mr. S. Conteh',
    date: 'Aug 18, 2026',
    severity: 'Minor',
    status: 'Warning Issued',
    evidenceDetails: 'Found unreferenced textbook page inside desk slot before exam commencement.',
    committeeDecision: 'First-time warning issued. Candidate allowed to sit exam under strict supervision.',
  },
];

const severityColors: Record<string, string> = {
  Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  Major: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Minor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const statusColors: Record<string, string> = {
  'Under Investigation': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Result Cancelled': 'text-red-400 bg-red-500/10 border-red-500/20',
  'Warning Issued': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Exonerated & Cleared': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Suspended: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export function MalpracticeTab({ officer }: { officer: OfficerData }) {
  const [incidentsList, setIncidentsList] = useState<MalpracticeIncident[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<MalpracticeIncident | null>(initialIncidents[0]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    candidate: '',
    examNo: '',
    class: 'SSS 3A',
    exam: 'Mathematics',
    type: 'Possession of Unauthorized Notes',
    hall: 'Main Hall A',
    invigilator: officer.name,
    severity: 'Major' as MalpracticeIncident['severity'],
    evidenceDetails: '',
  });

  const filteredIncidents = incidentsList.filter(i =>
    i.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.exam.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidate) return;

    const created: MalpracticeIncident = {
      id: `INC-2026-00${incidentsList.length + 1}`,
      candidate: formData.candidate,
      class: formData.class,
      examNo: formData.examNo || `EX-2026-00${Math.floor(Math.random() * 90 + 10)}`,
      exam: formData.exam,
      type: formData.type,
      hall: formData.hall,
      invigilator: formData.invigilator,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      severity: formData.severity,
      status: 'Under Investigation',
      evidenceDetails: formData.evidenceDetails || 'Incident reported by hall invigilator on duty.',
    };

    setIncidentsList([created, ...incidentsList]);
    setSelectedIncident(created);
    setShowReportModal(false);
    setFormData({
      candidate: '',
      examNo: '',
      class: 'SSS 3A',
      exam: 'Mathematics',
      type: 'Possession of Unauthorized Notes',
      hall: 'Main Hall A',
      invigilator: officer.name,
      severity: 'Major',
      evidenceDetails: '',
    });
    setSuccessToast(`Incident "${created.id}" reported and logged into Disciplinary Committee queue!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleApplyResolution = (newStatus: MalpracticeIncident['status'], decisionNote: string) => {
    if (!selectedIncident) return;

    const updated = incidentsList.map(i => i.id === selectedIncident.id ? {
      ...i,
      status: newStatus,
      committeeDecision: decisionNote,
    } : i);

    setIncidentsList(updated);
    setSelectedIncident({ ...selectedIncident, status: newStatus, committeeDecision: decisionNote });
    setSuccessToast(`Resolution applied for candidate "${selectedIncident.candidate}": ${newStatus}`);
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
            <Gavel className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Malpractice &amp; Incident Management</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Log exam hall infractions, manage Disciplinary Committee investigations, and enforce grade cancellations or warnings
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20"
        >
          <Plus className="w-4 h-4" /> Report New Malpractice Incident
        </button>
      </div>

      {/* Incident Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
          <p className="text-2xl font-black text-blue-400">{incidentsList.filter(i => i.status === 'Under Investigation').length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Open Investigations</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
          <p className="text-2xl font-black text-red-400">{incidentsList.filter(i => i.status === 'Result Cancelled').length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Results Cancelled</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
          <p className="text-2xl font-black text-amber-400">{incidentsList.filter(i => i.status === 'Warning Issued').length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Warnings Issued</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-[hsl(var(--border))]">
          <p className="text-2xl font-black text-emerald-400">{incidentsList.filter(i => i.status === 'Exonerated & Cleared').length}</p>
          <p className="text-xs font-semibold text-[hsl(var(--text-tertiary))] mt-0.5">Exonerated Cases</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-3 border border-[hsl(var(--border))]">
        <div className="relative">
          <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incident by candidate name, ref ID, or exam subject..."
            className="w-full bg-[hsl(var(--bg-tertiary))] text-xs text-[hsl(var(--text-primary))] pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] outline-none font-medium"
          />
        </div>
      </div>

      {/* Incidents Table + Inspector Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
          <div className="p-4 border-b border-[hsl(var(--border))]">
            <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">Incident Log Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]">
                  {['Ref ID', 'Candidate Name', 'Infraction Type', 'Exam Paper', 'Date', 'Severity', 'Status'].map(h => (
                    <th key={h} className="py-3 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {filteredIncidents.map(inc => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors cursor-pointer ${
                      selectedIncident?.id === inc.id ? 'bg-violet-600/10 border-l-4 border-l-violet-500' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-xs font-mono font-bold text-red-400">{inc.id}</td>
                    <td className="py-3 px-4 font-bold text-xs text-[hsl(var(--text-primary))]">{inc.candidate}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{inc.type}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-secondary))]">{inc.exam}</td>
                    <td className="py-3 px-4 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">{inc.date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColors[inc.severity]}`}>{inc.severity}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[inc.status]}`}>{inc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Incident Inspector Sidebar */}
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--border))] space-y-4">
          {selectedIncident ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <h3 className="font-black text-sm text-[hsl(var(--text-primary))]">Incident Case Details</h3>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${severityColors[selectedIncident.severity]}`}>
                  {selectedIncident.severity}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Ref ID', val: selectedIncident.id },
                  { label: 'Candidate', val: selectedIncident.candidate },
                  { label: 'Exam Number', val: selectedIncident.examNo },
                  { label: 'Class', val: selectedIncident.class },
                  { label: 'Exam Paper', val: selectedIncident.exam },
                  { label: 'Infraction Type', val: selectedIncident.type },
                  { label: 'Exam Hall', val: selectedIncident.hall },
                  { label: 'Invigilator', val: selectedIncident.invigilator },
                  { label: 'Date Logged', val: selectedIncident.date },
                ].map(f => (
                  <div key={f.label} className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                    <span className="text-[hsl(var(--text-tertiary))]">{f.label}:</span>
                    <span className="font-bold text-[hsl(var(--text-primary))] text-right">{f.val}</span>
                  </div>
                ))}
              </div>

              {/* Evidence details */}
              {selectedIncident.evidenceDetails && (
                <div className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] text-xs space-y-1">
                  <span className="font-bold text-red-400 block uppercase text-[10px] tracking-wider">Evidence Summary</span>
                  <p className="text-[hsl(var(--text-secondary))] leading-relaxed">{selectedIncident.evidenceDetails}</p>
                </div>
              )}

              {/* Disciplinary Decision */}
              {selectedIncident.committeeDecision && (
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs space-y-1">
                  <span className="font-bold text-violet-300 block uppercase text-[10px] tracking-wider">Committee Resolution</span>
                  <p className="text-violet-200">{selectedIncident.committeeDecision}</p>
                </div>
              )}

              {/* Committee Action Controls */}
              <div className="pt-2 border-t border-[hsl(var(--border))] space-y-2">
                <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Disciplinary Actions</p>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleApplyResolution('Warning Issued', 'First-time warning issued. Candidate signed code of conduct statement.')}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span>⚠️ Issue Formal Written Warning</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleApplyResolution('Result Cancelled', 'Subject result nullified due to verified examination malpractice.')}
                    className="w-full py-2 px-3 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span>🚫 Nullify &amp; Cancel Result</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleApplyResolution('Exonerated & Cleared', 'Evidence reviewed by Disciplinary Committee; candidate exonerated.')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-colors flex items-center justify-between"
                  >
                    <span>✅ Exonerate &amp; Clear Candidate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <AlertTriangle className="w-8 h-8 text-[hsl(var(--text-tertiary))] mb-3" />
              <p className="text-sm font-bold text-[hsl(var(--text-secondary))]">Select an incident</p>
            </div>
          )}
        </div>
      </div>

      {/* ── REPORT MALPRACTICE INCIDENT MODAL ───────────────────────── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-lg w-full border border-[hsl(var(--border))] shadow-2xl space-y-4 bg-[hsl(var(--bg-secondary))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="font-black text-base text-[hsl(var(--text-primary))]">Report Malpractice Incident</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.candidate}
                  onChange={e => setFormData({ ...formData, candidate: e.target.value })}
                  placeholder="e.g. Samuel Bangura"
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Exam Number</label>
                  <input
                    type="text"
                    value={formData.examNo}
                    onChange={e => setFormData({ ...formData, examNo: e.target.value })}
                    placeholder="EX-2026-0042"
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Class Cohort</label>
                  <select
                    value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none"
                  >
                    <option value="SSS 1A">SSS 1A</option>
                    <option value="SSS 1B">SSS 1B</option>
                    <option value="SSS 2A">SSS 2A</option>
                    <option value="SSS 2B">SSS 2B</option>
                    <option value="SSS 3A">SSS 3A</option>
                    <option value="SSS 3B">SSS 3B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Exam Paper</label>
                  <input
                    type="text"
                    value={formData.exam}
                    onChange={e => setFormData({ ...formData, exam: e.target.value })}
                    placeholder="e.g. Physics"
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="Critical">Critical (Expulsion Level)</option>
                    <option value="Major">Major (Result Nullification)</option>
                    <option value="Minor">Minor (First Warning)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Infraction Category</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="Possession of Unauthorized Notes">Possession of Unauthorized Notes</option>
                  <option value="Possession of Electronic Device (Smart Watch/Phone)">Possession of Electronic Device (Smart Watch/Phone)</option>
                  <option value="Copying from Adjacent Candidate Desk">Copying from Adjacent Candidate Desk</option>
                  <option value="Impersonation & Replacement Candidate">Impersonation &amp; Replacement Candidate</option>
                  <option value="Collusion & Communication in Exam Hall">Collusion &amp; Communication in Exam Hall</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Evidence Summary &amp; Details</label>
                <textarea
                  rows={3}
                  value={formData.evidenceDetails}
                  onChange={e => setFormData({ ...formData, evidenceDetails: e.target.value })}
                  placeholder="Describe invigilator observations, confiscated materials..."
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-end gap-2">
                <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 flex items-center gap-1.5 shadow-md">
                  <Check className="w-4 h-4" /> Submit Report to Committee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
