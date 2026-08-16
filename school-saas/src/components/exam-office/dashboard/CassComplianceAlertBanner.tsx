'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Bell, ShieldAlert, FileWarning, Fingerprint, RefreshCw } from 'lucide-react';

type AuditIssue = {
  id: string;
  type: 'CA_EXCEEDED' | 'MISSING_INDEX_NO' | 'INCOMPLETE_CA';
  title: string;
  count: number;
  level: string;
  severity: 'critical' | 'warning';
  affected: string;
};

const DEFAULT_AUDIT_ISSUES: AuditIssue[] = [
  {
    id: 'issue-1',
    type: 'CA_EXCEEDED',
    title: 'CA Marks Exceed 30% Limit',
    count: 7,
    level: 'SSS 2',
    severity: 'critical',
    affected: 'SSS 2 Mathematics (Teacher: Mr. Bangura)',
  },
  {
    id: 'issue-2',
    type: 'MISSING_INDEX_NO',
    title: 'Missing WAEC National Index Numbers',
    count: 14,
    level: 'SSS 3',
    severity: 'critical',
    affected: 'WASSCE Candidates (Pending WAEC Roll No.)',
  },
  {
    id: 'issue-3',
    type: 'INCOMPLETE_CA',
    title: 'Incomplete CA 3 Scores',
    count: 4,
    level: 'JSS 3',
    severity: 'warning',
    affected: 'BECE Social Studies (Teacher: Mrs. Kamara)',
  },
];

export function CassComplianceAlertBanner() {
  const router = useRouter();
  const [issues, setIssues]             = useState<AuditIssue[]>(DEFAULT_AUDIT_ISSUES);
  const [isAuditing, setIsAuditing]     = useState(false);
  const [notified, setNotified]         = useState(false);

  const criticalCount = issues.filter(i => i.severity === 'critical').reduce((acc, i) => acc + i.count, 0);
  const totalIssues   = issues.length;

  const handleReaudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
    }, 800);
  };

  const handleNotifyTeachers = () => {
    setNotified(true);
    setTimeout(() => setNotified(false), 3000);
  };

  const clearIssue = (id: string) => {
    setIssues(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-md ${
      totalIssues > 0
        ? 'glass-card border-red-500/30 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent'
        : 'glass-card border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent'
    }`}>
      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-[hsl(var(--border))] pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            totalIssues > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {totalIssues > 0 ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm text-[hsl(var(--text-primary))] uppercase tracking-wider">
                MBSSE CASS 30/70 Compliance Auditor
              </h2>
              {totalIssues > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold border border-red-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> {criticalCount} Violations Flagged
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  ✓ 100% MBSSE Compliant
                </span>
              )}
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
              Automated scan for CA 30% thresholds & candidate WAEC Index Numbers
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReaudit}
            disabled={isAuditing}
            className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-violet-400' : ''}`} />
            {isAuditing ? 'Auditing…' : 'Re-Audit Marks'}
          </button>
          <button
            onClick={() => router.push('?tab=admissions')}
            className="px-4 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            Open CASS Exporter <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Issues list or clean state */}
      {totalIssues > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`rounded-xl p-3 border flex flex-col justify-between space-y-2 transition-all ${
                  issue.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/20 text-red-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-black/30 font-mono">
                      {issue.level}
                    </span>
                    <span className="text-[10px] font-bold flex items-center gap-1">
                      {issue.type === 'MISSING_INDEX_NO' ? (
                        <Fingerprint className="w-3 h-3 text-red-400" />
                      ) : (
                        <FileWarning className="w-3 h-3 text-amber-400" />
                      )}
                      {issue.count} Candidates
                    </span>
                  </div>
                  <p className="font-bold text-xs text-[hsl(var(--text-primary))] leading-tight">{issue.title}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 truncate">{issue.affected}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[hsl(var(--border)/0.4)]">
                  <button
                    onClick={handleNotifyTeachers}
                    className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <Bell className="w-2.5 h-2.5" /> {notified ? 'Notified!' : 'Notify Teacher'}
                  </button>
                  <button
                    onClick={() => clearIssue(issue.id)}
                    className="text-[9px] font-semibold text-[hsl(var(--text-tertiary))] hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-2 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All teacher CA marks are within the 30% MBSSE limit and candidate WAEC index numbers are verified!
        </div>
      )}
    </div>
  );
}
