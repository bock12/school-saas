'use client';

import { useState } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Printer, XCircle, CheckCircle2, FileText, MapPin, Building, ShieldCheck } from 'lucide-react';

export type AdmissionApplicantData = {
  id: string;
  first_name: string;
  last_name: string;
  dob?: string;
  gender?: string;
  school_level?: string;
  target_stream?: string;
  target_grade?: string;
  national_index_no?: string;
  parent_name?: string;
  parent_phone?: string;
};

const STREAM_COLORS: Record<string, { bg: string; text: string; badge: string; emoji: string }> = {
  'Science':    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    badge: 'bg-cyan-500 text-white',    emoji: '🧪' },
  'Arts':       { bg: 'bg-pink-500/10',    text: 'text-pink-400',    badge: 'bg-pink-500 text-white',    emoji: '🎨' },
  'Commercial': { bg: 'bg-amber-500/10',   text: 'text-amber-400',   badge: 'bg-amber-500 text-white',   emoji: '💼' },
  'Technical':  { bg: 'bg-orange-500/10',  text: 'text-orange-400',  badge: 'bg-orange-500 text-white',  emoji: '🛠️' },
};

export function AdmissionLetterModal({
  applicant,
  officer,
  onClose,
}: {
  applicant: AdmissionApplicantData;
  officer: OfficerData;
  onClose: () => void;
}) {
  const [academicYear]    = useState('2025/2026');
  const [reportingDate]   = useState('September 15, 2025');
  const [emisCode]        = useState('SL-MBSSE-42301');
  const [includeSignature, setIncludeSignature] = useState(true);

  const streamInfo = applicant.target_stream ? STREAM_COLORS[applicant.target_stream] : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl glass-card rounded-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl border border-violet-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Header */}
        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--bg-tertiary)/0.6)] flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">
              🇸🇱 Official Admission Letter Preview
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))] cursor-pointer mr-2">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="rounded border-violet-500/40 text-violet-600 focus:ring-violet-500"
              />
              Include Signature & Stamp
            </label>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" /> Print Letter
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-[hsl(var(--text-primary))] bg-white print:p-0 print:bg-white print:text-black print:overflow-visible text-slate-900">

          {/* Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇸🇱</span>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                    {officer.tenantName}
                  </h1>
                  <p className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">
                    Ministry of Basic & Senior Secondary Education (MBSSE) Approved
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> Freetown, Sierra Leone</span>
                <span className="flex items-center gap-1"><Building className="w-3 h-3 text-slate-500" /> EMIS Code: {emisCode}</span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-800">Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-[10px]">Ref: SL-ADM/2025/{(applicant.id || '001').slice(0, 6).toUpperCase()}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 inline-block pb-1">
              OFFICIAL OFFER OF ADMISSION — {academicYear}
            </h2>
          </div>

          {/* Recipient Details */}
          <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 space-y-1 text-xs">
            <p className="font-bold text-slate-700">To:</p>
            <p className="font-black text-sm text-slate-900 uppercase">{applicant.first_name} {applicant.last_name}</p>
            {applicant.national_index_no && (
              <p className="text-slate-600 font-mono">WAEC Index Number: <span className="font-bold text-violet-700">{applicant.national_index_no}</span></p>
            )}
            {applicant.parent_name && (
              <p className="text-slate-600">Parent/Guardian: {applicant.parent_name} ({applicant.parent_phone || 'N/A'})</p>
            )}
          </div>

          {/* Letter Content */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <p>
              Dear <span className="font-bold text-slate-900">{applicant.first_name}</span>,
            </p>
            <p>
              We are pleased to inform you that following your satisfactory performance in the national examinations and document verification, you have been offered provisional admission into <span className="font-bold text-slate-900">{officer.tenantName}</span> for the <span className="font-bold text-slate-900">{academicYear}</span> Academic Session.
            </p>

            {/* Admission Placement Summary Box */}
            <div className="my-3 p-3.5 rounded-xl border border-violet-200 bg-violet-50/50 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Level</p>
                  <p className="font-black text-slate-900">{applicant.school_level || 'Senior Secondary'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Class Assigned</p>
                  <p className="font-black text-slate-900">{applicant.target_grade || 'SSS 1'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Allocated Stream</p>
                  {streamInfo ? (
                    <span className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded text-xs ${streamInfo.badge}`}>
                      {streamInfo.emoji} {applicant.target_stream} Stream
                    </span>
                  ) : (
                    <p className="font-bold text-slate-700">General Stream</p>
                  )}
                </div>
              </div>
            </div>

            <p>
              Your stream placement has been verified under the Sierra Leone National Education System (<span className="font-bold">MBSSE Framework</span>) based on your BECE subject performance and credit evaluation.
            </p>

            {/* Required Documents Checklist */}
            <div className="pt-2">
              <p className="font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Required Documents on Reporting Date ({reportingDate}):
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pl-2">
                <li className="flex items-center gap-1.5">✓ Original WAEC/MBSSE Result Slip</li>
                <li className="flex items-center gap-1.5">✓ Certified Birth Certificate / Affidavit</li>
                <li className="flex items-center gap-1.5">✓ Primary/JSS School Testimonial</li>
                <li className="flex items-center gap-1.5">✓ Medical Fitness Certificate</li>
                <li className="flex items-center gap-1.5">✓ 2 Passport Photographs</li>
                <li className="flex items-center gap-1.5">✓ Signed Acceptance Form</li>
              </ul>
            </div>
          </div>

          {/* Signatures & Stamp */}
          {includeSignature && (
            <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
              <div className="space-y-1">
                <div className="w-28 h-10 border-b border-slate-400 flex items-end pb-1">
                  <span className="font-serif italic text-xs text-violet-800 font-bold">The Principal</span>
                </div>
                <p className="text-[11px] font-bold text-slate-900">The Principal</p>
                <p className="text-[9px] text-slate-500">{officer.tenantName}</p>
              </div>

              <div className="w-20 h-20 rounded-full border-2 border-dashed border-violet-600/40 flex flex-col items-center justify-center text-center p-1 bg-violet-50/30 rotate-[-12deg]">
                <ShieldCheck className="w-4 h-4 text-violet-700" />
                <span className="text-[7px] font-black text-violet-800 uppercase tracking-tighter leading-tight mt-0.5">OFFICIAL SEAL</span>
                <span className="text-[6px] font-bold text-violet-600">MBSSE APPROVED</span>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-[9px] text-slate-400">
              This letter is issued under the authority of the Ministry of Basic & Senior Secondary Education, Sierra Leone. Valid for 2025/2026 Academic Session.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
