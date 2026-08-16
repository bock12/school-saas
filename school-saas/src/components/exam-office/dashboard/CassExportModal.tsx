'use client';

import { useState, useEffect } from 'react';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { Download, XCircle, RefreshCw, CheckCircle2, AlertTriangle, FileSpreadsheet, ShieldCheck, Award } from 'lucide-react';

type CassRow = {
  indexNo: string;
  name: string;
  gender: string;
  stream: string;
  ca1: number;
  ca2: number;
  ca3: number;
  caTotal: number;
  exam: number;
  totalScore: number;
  grade: string;
  points: number;
  remark: string;
  isCompliant: boolean;
};

type CassExportData = {
  tenantName: string;
  schoolLevel: string;
  examType: string;
  academicYear: string;
  cassFormula: string;
  candidateCount: number;
  compliantCount: number;
  hasErrors: boolean;
  rows: CassRow[];
};

export function CassExportModal({
  officer,
  onClose,
}: {
  officer: OfficerData;
  onClose: () => void;
}) {
  const [schoolLevel, setSchoolLevel] = useState('SSS');
  const [examType, setExamType]       = useState('WASSCE');
  const [data, setData]               = useState<CassExportData | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshKey, setRefreshKey]   = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/cass-export?tenantSlug=${officer.tenantSlug}&schoolLevel=${schoolLevel}&examType=${examType}`);
        const json = await res.json();
        if (isMounted && json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.warn('[CassExportModal]', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [officer.tenantSlug, schoolLevel, examType, refreshKey]);

  const handleLevelChange = (lvl: string) => {
    setSchoolLevel(lvl);
    if (lvl === 'PRIMARY') setExamType('NPSE');
    else if (lvl === 'JSS') setExamType('BECE');
    else setExamType('WASSCE');
  };

  const handleDownloadCsv = async () => {
    setIsExporting(true);
    try {
      const url = `/api/cass-export?tenantSlug=${officer.tenantSlug}&schoolLevel=${schoolLevel}&examType=${examType}&format=csv`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `MBSSE_CASS_${examType}_${schoolLevel}_2025_2026.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Log batch
      await fetch('/api/cass-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: officer.tenantSlug,
          schoolLevel,
          academicYear: '2025/2026',
          term: 'Term 3',
          examType,
          candidateCount: data?.candidateCount ?? 0,
          exportFilename: `MBSSE_CASS_${examType}_${schoolLevel}_2025_2026.csv`,
        }),
      });
    } catch (err) {
      console.warn('[Download CSV]', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-4xl glass-card rounded-2xl overflow-hidden max-h-[92vh] flex flex-col shadow-2xl border border-violet-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[hsl(var(--bg-tertiary)/0.6)] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">
                🇸🇱 MBSSE CASS Mark Export & Compliance Auditor
              </h2>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">
              Formats & verifies 30% Continuous Assessment + 70% Final Exam marks for WAEC / MBSSE Submission
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              disabled={isExporting || isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> Export WAEC CSV
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Level / Exam Selector */}
        <div className="p-4 border-b border-[hsl(var(--border))] flex flex-wrap items-center justify-between gap-3 bg-[hsl(var(--bg-tertiary)/0.3)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase">School Level:</span>
            {['PRIMARY', 'JSS', 'SSS'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  schoolLevel === lvl
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-violet-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Target Exam: <span className="underline font-black">{examType}</span>
            </span>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-violet-400 transition-colors"
              title="Refresh CASS Audit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-violet-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Audit Stats Banner */}
        {data && (
          <div className="px-5 py-3 border-b border-[hsl(var(--border))] bg-gradient-to-r from-violet-500/5 to-emerald-500/5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))]">Candidates</span>
                <p className="font-black text-sm text-[hsl(var(--text-primary))]">{data.candidateCount}</p>
              </div>
              <div className="h-6 w-px bg-[hsl(var(--border))]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))]">Compliant (≤30% CA)</span>
                <p className="font-black text-sm text-emerald-400">{data.compliantCount} / {data.candidateCount}</p>
              </div>
              <div className="h-6 w-px bg-[hsl(var(--border))]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-tertiary))]">Formula Standard</span>
                <p className="font-semibold text-violet-300">30% CA + 70% Exam</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!data.hasErrors ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Ready for WAEC Upload
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" /> CA Threshold Warnings Found
                </span>
              )}
            </div>
          </div>
        )}

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.5)]">
                    {['WAEC Index No', 'Candidate Name', 'Stream', 'CA (30%)', 'Exam (70%)', 'Total (100%)', 'Grade', 'Status'].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                          <span className="text-xs text-[hsl(var(--text-tertiary))]">Auditing CASS scores…</span>
                        </div>
                      </td>
                    </tr>
                  ) : data?.rows && data.rows.length > 0 ? (
                    data.rows.map((r) => (
                      <tr key={r.indexNo} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-xs text-violet-400">{r.indexNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-xs text-[hsl(var(--text-primary))]">{r.name}</td>
                        <td className="py-2.5 px-3 text-xs text-[hsl(var(--text-secondary))]">{r.stream}</td>
                        <td className="py-2.5 px-3 text-xs font-bold text-violet-300">
                          {r.caTotal.toFixed(1)} <span className="text-[10px] text-[hsl(var(--text-tertiary))]">/ 30</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs font-bold text-amber-400">
                          {r.exam.toFixed(1)} <span className="text-[10px] text-[hsl(var(--text-tertiary))]">/ 70</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs font-black text-[hsl(var(--text-primary))]">
                          {r.totalScore.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`font-black text-xs px-2 py-0.5 rounded ${
                            ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(r.grade)
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : r.grade === 'F9'
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {r.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {r.isCompliant ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Exceeds 30%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[hsl(var(--text-tertiary))]">
                        No CASS data found for {schoolLevel} level.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--bg-tertiary)/0.6)] flex-shrink-0 text-xs">
          <span className="text-[hsl(var(--text-tertiary))] flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export format compatible with WAEC e-Registration portal
          </span>
          <button
            onClick={handleDownloadCsv}
            disabled={isExporting || isLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
