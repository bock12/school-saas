'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  BookOpen, ArrowLeft, Plus, CheckCircle2, Clock, Send,
  Check, X, AlertTriangle, ChevronRight, Eye, Pencil,
  Archive, Layers, GraduationCap, Calendar, FileText,
  Sparkles, MoreHorizontal, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import {
  getCurriculumVersions, createCurriculumVersion, submitCurriculumForReview,
  approveCurriculum, publishCurriculum,
  CurriculumVersionRecord, CurriculumStatus
} from '@/app/actions/curriculum';
import { getSubjects, SubjectRecord } from '@/app/actions/subjects';
import { getSimpleAcademicYears } from '@/app/actions/academic-sessions';

// ─────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CurriculumStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Draft',
    color: 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))]',
    icon: <Pencil className="w-3 h-3" />,
  },
  pending_review: {
    label: 'Pending Review',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: <Clock className="w-3 h-3" />,
  },
  changes_requested: {
    label: 'Changes Requested',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  approved: {
    label: 'Approved',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  published: {
    label: 'Published',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: <Check className="w-3 h-3" />,
  },
  archived: {
    label: 'Archived',
    color: 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]',
    icon: <Archive className="w-3 h-3" />,
  },
};

// ─────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CurriculumStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-xl border ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Pipeline visualization
// ─────────────────────────────────────────────────────────────

function StatusPipeline({ status }: { status: CurriculumStatus }) {
  const stages: CurriculumStatus[] = ['draft', 'pending_review', 'approved', 'published'];
  const currentIdx = stages.indexOf(status);

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, i) => {
        const reached = i <= currentIdx;
        const cfg = STATUS_CONFIG[stage];
        return (
          <React.Fragment key={stage}>
            <div className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-lg ${
              reached ? cfg.color : 'text-[hsl(var(--text-tertiary))] opacity-40'
            }`}>
              {cfg.icon}
              <span className="hidden sm:inline">{cfg.label}</span>
            </div>
            {i < stages.length - 1 && (
              <ChevronRight className={`w-3 h-3 flex-shrink-0 ${reached && i < currentIdx ? 'text-emerald-400' : 'text-[hsl(var(--text-tertiary))] opacity-30'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// New Version Modal
// ─────────────────────────────────────────────────────────────

function NewVersionModal({
  subjects,
  academicYears,
  onClose,
  onSubmit,
  saving,
}: {
  subjects: SubjectRecord[];
  academicYears: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (payload: { subject_id: string; academic_year_id: string; grade_level: string; notes?: string }) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState({ subject_id: '', academic_year_id: '', grade_level: '', notes: '' });

  const gradeLevels = ['KG 1', 'KG 2', 'KG 3', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
    'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[hsl(var(--accent))]" />
            New Curriculum Version
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Subject *</label>
            <select
              value={form.subject_id}
              onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))}
              className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            >
              <option value="">Select subject…</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code ? `[${s.code}] ` : ''}{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Academic Year *</label>
              <select
                value={form.academic_year_id}
                onChange={e => setForm(p => ({ ...p, academic_year_id: e.target.value }))}
                className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              >
                <option value="">Select year…</option>
                {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Grade Level *</label>
              <select
                value={form.grade_level}
                onChange={e => setForm(p => ({ ...p, grade_level: e.target.value }))}
                className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              >
                <option value="">Select grade…</option>
                {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="Briefly describe what changed in this version…"
              className="w-full px-4 py-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] resize-none focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-[hsl(var(--border))]">
          <button onClick={onClose} className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            Cancel
          </button>
          <button
            disabled={saving || !form.subject_id || !form.academic_year_id || !form.grade_level}
            onClick={() => onSubmit(form)}
            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? 'Creating…' : 'Create Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Version Card
// ─────────────────────────────────────────────────────────────

function VersionCard({
  version,
  tenant,
  onAction,
}: {
  version: CurriculumVersionRecord;
  tenant: string;
  onAction: (action: 'submit' | 'approve' | 'publish', id: string) => void;
}) {
  return (
    <div className="glass-card rounded-3xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <StatusBadge status={version.status} />
            <span className="text-[10px] font-black text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-2 py-0.5 rounded-lg">v{version.version}</span>
          </div>
          <h3 className="text-sm font-black text-[hsl(var(--text-primary))] line-clamp-1">{version.subject_name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-tertiary))] font-medium">
              <Calendar className="w-3 h-3" />{version.academic_year_name}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-tertiary))] font-medium">
              <GraduationCap className="w-3 h-3" />{version.grade_level}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-tertiary))] font-medium">
              <Layers className="w-3 h-3" />{version.topic_count} topics
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-tertiary))] font-medium">
              <FileText className="w-3 h-3" />{version.outcome_count} outcomes
            </span>
          </div>
        </div>
        <Link
          href={`/${tenant}/admin/academics/curriculum/${version.id}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] hover:bg-[hsl(var(--accent)/0.15)] transition-colors flex-shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
      </div>

      {/* Pipeline */}
      <div className="overflow-x-auto">
        <StatusPipeline status={version.status} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[hsl(var(--border)/0.5)]">
        {version.status === 'draft' || version.status === 'changes_requested' ? (
          <button
            onClick={() => onAction('submit', version.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            <Send className="w-3 h-3" /> Submit for Review
          </button>
        ) : version.status === 'pending_review' ? (
          <button
            onClick={() => onAction('approve', version.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" /> Approve
          </button>
        ) : version.status === 'approved' ? (
          <button
            onClick={() => onAction('publish', version.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <Check className="w-3 h-3" /> Publish
          </button>
        ) : null}

        {version.notes && (
          <p className="text-[10px] text-[hsl(var(--text-tertiary))] italic ml-auto line-clamp-1">"{version.notes}"</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function CurriculumLibraryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenant = (params?.tenant as string) || '';
  const preselectedSubject = searchParams.get('subject');

  const [versions, setVersions] = useState<CurriculumVersionRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState(preselectedSubject || '');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [versionsRes, subjectsRes] = await Promise.all([
      getCurriculumVersions(tenant, {
        subject_id: subjectFilter || undefined,
        status: (statusFilter as CurriculumStatus) || undefined,
      }),
      getSubjects(tenant, { is_active: true, limit: 200 }),
    ]);

    if (versionsRes.success) setVersions(versionsRes.data);
    if (subjectsRes.success) setSubjects(subjectsRes.data);

    // Load academic years separately
    try {
      const years = await getSimpleAcademicYears(tenant);
      setAcademicYears(years || []);
    } catch {}

    setLoading(false);
  }, [tenant, subjectFilter, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (payload: { subject_id: string; academic_year_id: string; grade_level: string; notes?: string }) => {
    setSaving(true);
    const res = await createCurriculumVersion(tenant, payload);
    setSaving(false);
    if (res.success) {
      setIsNewOpen(false);
      showNotification('success', 'Curriculum version created as draft.');
      loadData();
    } else {
      showNotification('error', res.error || 'Failed to create curriculum version.');
    }
  };

  const handleAction = async (action: 'submit' | 'approve' | 'publish', id: string) => {
    setSaving(true);
    let res;
    if (action === 'submit') res = await submitCurriculumForReview(tenant, id);
    else if (action === 'approve') res = await approveCurriculum(tenant, id);
    else res = await publishCurriculum(tenant, id);
    setSaving(false);

    if (res.success) {
      showNotification('success', `Curriculum ${action === 'submit' ? 'submitted for review' : action === 'approve' ? 'approved' : 'published'}.`);
      loadData();
    } else {
      showNotification('error', res.error || `Failed to ${action}.`);
    }
  };

  const grouped = versions.reduce<Record<string, CurriculumVersionRecord[]>>((acc, v) => {
    const key = v.subject_name || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  const pendingCount = versions.filter(v => v.status === 'pending_review').length;
  const draftCount = versions.filter(v => v.status === 'draft').length;

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto animate-fade-in w-full pb-10">

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[hsl(var(--border))]">
        <div className="space-y-1">
          <Link href={`/${tenant}/admin/academics`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-[hsl(var(--accent))]" />
            Curriculum Library
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            {versions.length} version{versions.length !== 1 ? 's' : ''} · Manage structured syllabuses, topics, and learning outcomes
          </p>
        </div>
        <button
          onClick={() => setIsNewOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Curriculum Version
        </button>
      </div>

      {/* Alerts */}
      {(pendingCount > 0 || draftCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              {pendingCount} curriculum version{pendingCount > 1 ? 's' : ''} awaiting review
            </div>
          )}
          {draftCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]">
              <Pencil className="w-3.5 h-3.5" />
              {draftCount} unpublished draft{draftCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 rounded-3xl flex flex-col sm:flex-row gap-3">
        <select
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          className="h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors flex-1"
        >
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.code ? `[${s.code}] ` : ''}{s.name}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {(['', 'draft', 'pending_review', 'approved', 'published'] as const).map(s => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`h-11 px-4 rounded-2xl text-xs font-bold border transition-all ${
                statusFilter === s
                  ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white'
                  : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.5)]'
              }`}
            >
              {s === '' ? 'All' : STATUS_CONFIG[s as CurriculumStatus]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-3xl p-5 animate-pulse h-48" />
          ))}
        </div>
      ) : versions.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <BookOpen className="w-12 h-12 text-[hsl(var(--text-tertiary))] mx-auto mb-4" />
          <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mb-2">No curriculum versions yet</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mb-6">Create structured syllabuses with topics and learning outcomes</p>
          <button
            onClick={() => setIsNewOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create First Version
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([subjectName, subjectVersions]) => (
            <div key={subjectName} className="space-y-3">
              <h2 className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-1 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />{subjectName}
                <span className="font-normal normal-case tracking-normal text-[hsl(var(--text-tertiary))]">
                  ({subjectVersions.length} version{subjectVersions.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectVersions.map(v => (
                  <VersionCard key={v.id} version={v} tenant={tenant} onAction={handleAction} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Version Modal */}
      {isNewOpen && (
        <NewVersionModal
          subjects={subjects}
          academicYears={academicYears}
          onClose={() => setIsNewOpen(false)}
          onSubmit={handleCreate}
          saving={saving}
        />
      )}
    </div>
  );
}
