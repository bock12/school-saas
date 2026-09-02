'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookMarked, ArrowLeft, Building2, Layers, BookOpen,
  GraduationCap, Sparkles, Pencil, Archive, RotateCcw,
  CheckCircle2, AlertCircle, Users, Clock, Calendar,
  ChevronRight, Shield, Award, Plus, FolderKanban,
  FileText, Check, AlertTriangle
} from 'lucide-react';
import {
  getSubjectById, updateSubject, archiveSubject, restoreSubject,
  getDepartments, getCurriculumStreams,
  SubjectRecord, SubjectPayload, CurriculumStreamRecord
} from '@/app/actions/subjects';
import { getCurriculumVersions, CurriculumVersionRecord } from '@/app/actions/curriculum';
import { getSubjectOfferings, SubjectOfferingRecord } from '@/app/actions/offerings';

export default function SubjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || '';
  const subjectId = (params?.id as string) || '';

  const [subject, setSubject] = useState<SubjectRecord | null>(null);
  const [curriculumVersions, setCurriculumVersions] = useState<CurriculumVersionRecord[]>([]);
  const [offerings, setOfferings] = useState<SubjectOfferingRecord[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [streams, setStreams] = useState<CurriculumStreamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<SubjectPayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    if (!tenant || !subjectId) return;
    setLoading(true);
    setError('');

    try {
      const [subjRes, cvRes, offRes, deptRes, strRes] = await Promise.all([
        getSubjectById(tenant, subjectId),
        getCurriculumVersions(tenant, { subject_id: subjectId }),
        getSubjectOfferings(tenant, { subject_id: subjectId }),
        getDepartments(tenant),
        getCurriculumStreams(tenant),
      ]);

      if (subjRes.success && subjRes.data) {
        setSubject(subjRes.data);
        setEditForm({
          name: subjRes.data.name,
          short_name: subjRes.data.short_name,
          code: subjRes.data.code,
          national_code: subjRes.data.national_code,
          exam_board_code: subjRes.data.exam_board_code,
          description: subjRes.data.description,
          category: subjRes.data.category,
          subject_type: subjRes.data.subject_type,
          department_id: subjRes.data.department_id,
          is_elective: subjRes.data.is_elective,
          is_examinable: subjRes.data.is_examinable,
          default_periods_per_week: subjRes.data.default_periods_per_week,
          default_period_duration: subjRes.data.default_period_duration,
          max_class_size: subjRes.data.max_class_size,
          stream_ids: subjRes.data.streams?.map(s => s.stream_id) || [],
        });
      } else {
        setError(subjRes.error || 'Subject not found.');
      }

      if (cvRes.success) setCurriculumVersions(cvRes.data);
      if (offRes.success) setOfferings(offRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (strRes.success) setStreams(strRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load subject dossier.');
    } finally {
      setLoading(false);
    }
  }, [tenant, subjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setSaving(true);
    const res = await updateSubject(tenant, subjectId, editForm);
    setSaving(false);
    if (res.success) {
      showNotification('success', 'Subject catalogue updated successfully.');
      setIsEditing(false);
      loadData();
    } else {
      showNotification('error', res.error || 'Failed to update subject.');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this subject? Historical records will be preserved.')) return;
    setSaving(true);
    const res = await archiveSubject(tenant, subjectId);
    setSaving(false);
    if (res.success) {
      showNotification('success', 'Subject archived.');
      loadData();
    } else {
      showNotification('error', res.error || res.reason || 'Failed to archive.');
    }
  };

  const handleRestore = async () => {
    setSaving(true);
    const res = await restoreSubject(tenant, subjectId);
    setSaving(false);
    if (res.success) {
      showNotification('success', 'Subject restored.');
      loadData();
    } else {
      showNotification('error', res.error || 'Failed to restore.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-[hsl(var(--bg-tertiary))] rounded-lg w-48" />
        <div className="h-28 bg-[hsl(var(--bg-tertiary))] rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-[hsl(var(--bg-tertiary))] rounded-2xl" />
          <div className="h-24 bg-[hsl(var(--bg-tertiary))] rounded-2xl" />
          <div className="h-24 bg-[hsl(var(--bg-tertiary))] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-black text-[hsl(var(--text-primary))]">Subject Not Found</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))]">{error || 'The requested subject does not exist.'}</p>
        <Link
          href={`/${tenant}/admin/academics/subjects`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Subjects Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-16">
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

      {/* Navigation & Header */}
      <div className="space-y-3">
        <Link
          href={`/${tenant}/admin/academics/subjects`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Subjects Catalogue
        </Link>

        <div className="glass-card rounded-3xl p-6 border border-[hsl(var(--border))] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {subject.code && (
                <span className="text-xs font-black font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2.5 py-1 rounded-xl">
                  {subject.code}
                </span>
              )}
              {subject.is_examinable && (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {subject.exam_board_code || 'WAEC/BECE Examinable'}
                </span>
              )}
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border ${
                subject.is_elective
                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {subject.is_elective ? 'Elective' : 'Core Requirement'}
              </span>
              {!subject.is_active && (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Archived
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[hsl(var(--text-primary))]">
              {subject.name}
            </h1>
            {subject.description && (
              <p className="text-sm text-[hsl(var(--text-secondary))] max-w-2xl">
                {subject.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:border-[hsl(var(--accent))] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Master Entry
            </button>
            <Link
              href={`/${tenant}/admin/academics/curriculum?subject=${subject.id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-3.5 h-3.5" /> Curriculum Syllabus
            </Link>
            {subject.is_active ? (
              <button
                onClick={handleArchive}
                disabled={saving}
                className="p-2.5 rounded-2xl border border-[hsl(var(--border))] text-amber-400 hover:bg-amber-500/10 transition-colors"
                title="Archive Subject"
              >
                <Archive className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleRestore}
                disabled={saving}
                className="p-2.5 rounded-2xl border border-[hsl(var(--border))] text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title="Restore Subject"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-4 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-[hsl(var(--text-tertiary))] text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Timetable Load
          </div>
          <p className="text-xl font-black text-[hsl(var(--text-primary))]">
            {subject.default_periods_per_week} <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))]">p/wk</span>
          </p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">{subject.default_period_duration} mins per period</p>
        </div>

        <div className="glass-card rounded-3xl p-4 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-[hsl(var(--text-tertiary))] text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Class Size Advisory
          </div>
          <p className="text-xl font-black text-[hsl(var(--text-primary))]">
            {subject.max_class_size ? `${subject.max_class_size} max` : 'Unlimited'}
          </p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Per offering section</p>
        </div>

        <div className="glass-card rounded-3xl p-4 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-[hsl(var(--text-tertiary))] text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Department
          </div>
          <p className="text-sm font-black text-[hsl(var(--text-primary))] truncate">
            {subject.department_name || 'No Department'}
          </p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))] capitalize">{subject.category.replace('_', ' ')}</p>
        </div>

        <div className="glass-card rounded-3xl p-4 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-[hsl(var(--text-tertiary))] text-xs font-bold">
            <FolderKanban className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Active Offerings
          </div>
          <p className="text-xl font-black text-[hsl(var(--text-primary))]">
            {offerings.length}
          </p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">In current academic year</p>
        </div>
      </div>

      {/* Grid: Curriculum Versions + Stream Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Curriculum Versions */}
        <div className="glass-card rounded-3xl p-6 border border-[hsl(var(--border))] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[hsl(var(--accent))]" />
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Curriculum Versions</h3>
            </div>
            <Link
              href={`/${tenant}/admin/academics/curriculum?subject=${subject.id}`}
              className="text-xs font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1"
            >
              Open Editor <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {curriculumVersions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] space-y-3">
              <FileText className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
              <p className="text-xs text-[hsl(var(--text-secondary))]">No curriculum versions created for this subject yet.</p>
              <Link
                href={`/${tenant}/admin/academics/curriculum?subject=${subject.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Create v2026.1 Curriculum
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {curriculumVersions.map(cv => (
                <div key={cv.id} className="p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[hsl(var(--text-primary))]">{cv.grade_level}</span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
                        {cv.version_label || `v${cv.version}`}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        cv.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : cv.status === 'approved'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {cv.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                      {cv.topic_count ?? 0} topics · {cv.outcome_count ?? 0} learning outcomes
                    </p>
                  </div>
                  <Link
                    href={`/${tenant}/admin/academics/curriculum?subject=${subject.id}&version=${cv.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:border-[hsl(var(--accent))] transition-colors"
                  >
                    View Syllabus
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streams & Faculty Rules */}
        <div className="glass-card rounded-3xl p-6 border border-[hsl(var(--border))] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[hsl(var(--accent))]" />
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Stream &amp; Faculty Association</h3>
            </div>
            <Link
              href={`/${tenant}/admin/academics/streams`}
              className="text-xs font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1"
            >
              Configure Streams <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!subject.streams || subject.streams.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] space-y-2">
              <Layers className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
              <p className="text-xs text-[hsl(var(--text-secondary))]">Not linked to any curriculum stream yet.</p>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Add streams to allow stream-based student auto-enrollment.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {subject.streams.map(str => (
                <div key={str.stream_id} className="p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[hsl(var(--accent))]">{str.stream_code}</span>
                      <span className="text-xs font-black text-[hsl(var(--text-primary))]">{str.stream_name}</span>
                    </div>
                    <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                      Classification: <strong className="text-[hsl(var(--text-secondary))]">{str.is_core ? 'Core Subject (Mandatory)' : 'Elective Subject'}</strong>
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl ${
                    str.is_core ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  }`}>
                    {str.is_core ? 'Core' : 'Elective'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Offerings Table */}
      <div className="glass-card rounded-3xl p-6 border border-[hsl(var(--border))] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[hsl(var(--accent))]" />
            <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Class Section Allocations &amp; Offerings</h3>
          </div>
          <Link
            href={`/${tenant}/admin/academics/teacher-allocation`}
            className="text-xs font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1"
          >
            Teacher Allocation Matrix <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {offerings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
            No active class offerings assigned to this subject for this session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] uppercase">
                  <th className="py-2.5 px-3">Class / Section</th>
                  <th className="py-2.5 px-3">Lead Teacher</th>
                  <th className="py-2.5 px-3">Periods / Wk</th>
                  <th className="py-2.5 px-3">Enrolled</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {offerings.map(o => (
                  <tr key={o.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="py-3 px-3 font-bold text-[hsl(var(--text-primary))]">
                      {o.class_name} - {o.section_name}
                    </td>
                    <td className="py-3 px-3 text-[hsl(var(--text-secondary))]">
                      {o.teacher_name || <span className="text-amber-400 font-semibold italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[hsl(var(--text-primary))]">
                      {o.periods_per_week} p/wk ({o.duration_minutes || 40}m)
                    </td>
                    <td className="py-3 px-3 text-[hsl(var(--text-secondary))]">
                      {o.current_enrollment ?? 0} / {o.enrollment_capacity || '∞'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        o.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Drawer / Modal */}
      {isEditing && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--bg-secondary))] z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[hsl(var(--accent)/0.15)]">
                  <Pencil className="w-5 h-5 text-[hsl(var(--accent))]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[hsl(var(--text-primary))]">Edit Subject Master Entry</h2>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Updates apply school-wide across all academic years</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                <Check className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Subject Name</label>
                  <input
                    required
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(p => p ? { ...p, name: e.target.value } : null)}
                    className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Short Name</label>
                  <input
                    type="text"
                    value={editForm.short_name || ''}
                    onChange={e => setEditForm(p => p ? { ...p, short_name: e.target.value } : null)}
                    className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">School Code</label>
                  <input
                    type="text"
                    value={editForm.code || ''}
                    onChange={e => setEditForm(p => p ? { ...p, code: e.target.value.toUpperCase() } : null)}
                    className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--text-primary))]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Department</label>
                  <select
                    value={editForm.department_id || ''}
                    onChange={e => setEditForm(p => p ? { ...p, department_id: e.target.value || undefined } : null)}
                    className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))]"
                  >
                    <option value="">No Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[hsl(var(--text-primary))]">Public Examination Alignment</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.is_examinable}
                      onChange={e => setEditForm(p => p ? { ...p, is_examinable: e.target.checked } : null)}
                      className="rounded"
                    />
                    <span className="text-xs font-bold text-[hsl(var(--text-primary))]">Examinable in WASSCE/BECE</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="WAEC/BECE Code"
                    value={editForm.exam_board_code || ''}
                    onChange={e => setEditForm(p => p ? { ...p, exam_board_code: e.target.value.toUpperCase() } : null)}
                    className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="MBSSE National Code"
                    value={editForm.national_code || ''}
                    onChange={e => setEditForm(p => p ? { ...p, national_code: e.target.value.toUpperCase() } : null)}
                    className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <div>
                  <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Periods / Wk</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editForm.default_periods_per_week ?? 4}
                    onChange={e => setEditForm(p => p ? { ...p, default_periods_per_week: parseInt(e.target.value) || 1 } : null)}
                    className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Duration (mins)</label>
                  <input
                    type="number"
                    min={20}
                    max={120}
                    value={editForm.default_period_duration ?? 40}
                    onChange={e => setEditForm(p => p ? { ...p, default_period_duration: parseInt(e.target.value) || 40 } : null)}
                    className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Max Students</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={editForm.max_class_size || ''}
                    onChange={e => setEditForm(p => p ? { ...p, max_class_size: e.target.value ? parseInt(e.target.value) : undefined } : null)}
                    placeholder="Optional"
                    className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
