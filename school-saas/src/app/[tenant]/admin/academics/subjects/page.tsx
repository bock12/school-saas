'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  BookMarked, Search, Plus, X, ArrowLeft, Filter,
  Building2, Layers, Archive, RotateCcw, Pencil,
  CheckCircle2, AlertCircle, ChevronRight, BookOpen,
  GraduationCap, Sparkles, MoreHorizontal, Tag, Globe,
  Eye, Trash2, FolderOpen, AlertTriangle, Check
} from 'lucide-react';
import Link from 'next/link';
import {
  getSubjects, createSubject, updateSubject, archiveSubject, restoreSubject,
  bulkCreateSubjects, getCurriculumStreams, getDepartments,
  SubjectRecord, SubjectPayload, SubjectCategory, SubjectTypeVal, CurriculumStreamRecord
} from '@/app/actions/subjects';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<SubjectCategory, string> = {
  science: 'Science',
  mathematics: 'Mathematics',
  language: 'Language',
  social_science: 'Social Science',
  business: 'Business',
  technology: 'Technology',
  vocational: 'Vocational',
  creative_arts: 'Creative Arts',
  physical_education: 'Physical Education',
  general: 'General',
  other: 'Other',
};

const CATEGORY_COLORS: Record<SubjectCategory, string> = {
  science: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  mathematics: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  language: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  social_science: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  business: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  technology: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  vocational: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  creative_arts: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  physical_education: 'bg-green-500/10 text-green-400 border-green-500/20',
  general: 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))]',
  other: 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]',
};

const EMPTY_FORM: SubjectPayload = {
  name: '',
  short_name: '',
  code: '',
  national_code: '',
  description: '',
  category: 'general',
  subject_type: 'academic',
  department_id: '',
  is_elective: false,
  stream_ids: [],
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function SubjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departments,
  streams,
  saving,
  mode = 'create',
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SubjectPayload) => Promise<void>;
  initialData?: Partial<SubjectPayload>;
  departments: { id: string; name: string }[];
  streams: CurriculumStreamRecord[];
  saving: boolean;
  mode?: 'create' | 'edit';
}) {
  const [form, setForm] = useState<SubjectPayload>({ ...EMPTY_FORM, ...initialData });

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...initialData });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleStream = (streamId: string) => {
    setForm(p => ({
      ...p,
      stream_ids: p.stream_ids?.includes(streamId)
        ? p.stream_ids.filter(s => s !== streamId)
        : [...(p.stream_ids || []), streamId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[hsl(var(--accent)/0.15)]">
              <BookMarked className="w-5 h-5 text-[hsl(var(--accent))]" />
            </div>
            <h2 className="text-base font-black text-[hsl(var(--text-primary))]">
              {mode === 'create' ? 'Add New Subject' : 'Edit Subject'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          </button>
        </div>

        <form
          onSubmit={async e => { e.preventDefault(); await onSubmit(form); }}
          className="p-6 space-y-5"
        >
          {/* Name + Short Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Subject Name *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. General Mathematics"
                className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Short Name</label>
              <input
                type="text"
                value={form.short_name || ''}
                onChange={e => setForm(p => ({ ...p, short_name: e.target.value }))}
                placeholder="e.g. Maths"
                className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
          </div>

          {/* Code + National Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">School Code</label>
              <input
                type="text"
                value={form.code || ''}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. MTH101 (auto-generated)"
                className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">MBSSE / National Code</label>
              <input
                type="text"
                value={form.national_code || ''}
                onChange={e => setForm(p => ({ ...p, national_code: e.target.value }))}
                placeholder="e.g. WAEC-MTH-01"
                className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Subject Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as SubjectCategory }))}
                className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              >
                {(Object.keys(CATEGORY_LABELS) as SubjectCategory[]).map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Subject Type</label>
              <select
                value={form.subject_type}
                onChange={e => setForm(p => ({ ...p, subject_type: e.target.value as SubjectTypeVal }))}
                className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              >
                <option value="academic">Academic</option>
                <option value="vocational">Vocational</option>
                <option value="co_curricular">Co-curricular</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Department</label>
            <select
              value={form.department_id || ''}
              onChange={e => setForm(p => ({ ...p, department_id: e.target.value || undefined }))}
              className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            >
              <option value="">No Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Streams */}
          {streams.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Curriculum Streams</label>
              <div className="flex flex-wrap gap-2">
                {streams.map(s => {
                  const selected = form.stream_ids?.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStream(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selected
                          ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white'
                          : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.5)]'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1" />}{s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Brief description of the subject..."
              className="w-full px-4 py-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] resize-none focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>

          {/* Is Elective */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(p => ({ ...p, is_elective: !p.is_elective }))}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.is_elective ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_elective ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">This is an elective subject</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create Subject' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function SubjectsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [streams, setStreams] = useState<CurriculumStreamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);
  const [archivingSubject, setArchivingSubject] = useState<SubjectRecord | null>(null);
  const [archiveError, setArchiveError] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [subjectsRes, deptsRes, streamsRes] = await Promise.all([
      getSubjects(tenant, {
        search: search || undefined,
        department_id: deptFilter || undefined,
        category: categoryFilter || undefined,
        is_active: showArchived ? undefined : true,
      }),
      getDepartments(tenant),
      getCurriculumStreams(tenant),
    ]);

    if (subjectsRes.success) { setSubjects(subjectsRes.data); setTotal(subjectsRes.total); }
    if (deptsRes.success)    setDepartments(deptsRes.data);
    if (streamsRes.success)  setStreams(streamsRes.data);
    setLoading(false);
  }, [tenant, search, deptFilter, categoryFilter, showArchived]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (payload: SubjectPayload) => {
    setSaving(true);
    const res = await createSubject(tenant, payload);
    setSaving(false);
    if (res.success) {
      setIsAddOpen(false);
      showNotification('success', `Subject "${payload.name}" created successfully.`);
      loadData();
    } else {
      showNotification('error', res.error || 'Failed to create subject.');
    }
  };

  const handleUpdate = async (payload: SubjectPayload) => {
    if (!editingSubject) return;
    setSaving(true);
    const res = await updateSubject(tenant, editingSubject.id, payload);
    setSaving(false);
    if (res.success) {
      setEditingSubject(null);
      showNotification('success', 'Subject updated.');
      loadData();
    } else {
      showNotification('error', res.error || 'Failed to update subject.');
    }
  };

  const handleArchive = async () => {
    if (!archivingSubject) return;
    setSaving(true);
    const res = await archiveSubject(tenant, archivingSubject.id);
    setSaving(false);
    if (res.success) {
      setArchivingSubject(null);
      setArchiveError('');
      showNotification('success', `"${archivingSubject.name}" archived.`);
      loadData();
    } else if (res.blocked) {
      setArchiveError(res.reason || 'Cannot archive this subject.');
    } else {
      showNotification('error', res.error || 'Failed to archive.');
    }
  };

  const handleRestore = async (subject: SubjectRecord) => {
    startTransition(async () => {
      const res = await restoreSubject(tenant, subject.id);
      if (res.success) { showNotification('success', `"${subject.name}" restored.`); loadData(); }
      else showNotification('error', res.error || 'Failed to restore.');
    });
  };

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
          <Link
            href={`/${tenant}/admin/academics`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <BookMarked className="w-7 h-7 text-[hsl(var(--accent))]" />
            Curriculum Subjects Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            {total} subject{total !== 1 ? 's' : ''} · Manage codes, categories, streams, and curriculum versions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-3xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or code…"
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none min-w-[160px]"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none min-w-[160px]"
          >
            <option value="">All Categories</option>
            {(Object.entries(CATEGORY_LABELS) as [SubjectCategory, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <button
            onClick={() => setShowArchived(p => !p)}
            className={`h-11 px-4 rounded-2xl border text-xs font-bold transition-colors ${
              showArchived
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
            }`}
          >
            <Archive className="w-3.5 h-3.5 inline mr-1.5" />
            {showArchived ? 'Showing Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-3xl p-5 animate-pulse">
              <div className="h-4 bg-[hsl(var(--bg-tertiary))] rounded-lg w-3/4 mb-3" />
              <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded-lg w-1/2 mb-2" />
              <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded-lg w-2/3" />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center mx-auto mb-4">
            <BookMarked className="w-8 h-8 text-[hsl(var(--accent))]" />
          </div>
          <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mb-2">No subjects found</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mb-6">
            {search || deptFilter || categoryFilter
              ? 'Try adjusting your filters'
              : 'Start building your subject catalogue'}
          </p>
          {!search && !deptFilter && !categoryFilter && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add Your First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              tenant={tenant}
              onEdit={() => setEditingSubject(subject)}
              onArchive={() => { setArchivingSubject(subject); setArchiveError(''); }}
              onRestore={() => handleRestore(subject)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <SubjectFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreate}
        departments={departments}
        streams={streams}
        saving={saving}
        mode="create"
      />

      {/* Edit Modal */}
      {editingSubject && (
        <SubjectFormModal
          isOpen={true}
          onClose={() => setEditingSubject(null)}
          onSubmit={handleUpdate}
          initialData={{
            name: editingSubject.name,
            short_name: editingSubject.short_name,
            code: editingSubject.code,
            national_code: editingSubject.national_code,
            description: editingSubject.description,
            category: editingSubject.category,
            subject_type: editingSubject.subject_type,
            department_id: editingSubject.department_id,
            is_elective: editingSubject.is_elective,
            stream_ids: editingSubject.streams?.map(s => s.stream_id) || [],
          }}
          departments={departments}
          streams={streams}
          saving={saving}
          mode="edit"
        />
      )}

      {/* Archive Confirm */}
      {archivingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Archive className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Archive Subject</h3>
            </div>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              Archive <strong className="text-[hsl(var(--text-primary))]">{archivingSubject.name}</strong>?
              Historical records (grades, attendance) will be preserved.
            </p>
            {archiveError && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {archiveError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setArchivingSubject(null); setArchiveError(''); }}
                className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleArchive}
                className="flex-1 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-50"
              >
                {saving ? 'Archiving…' : 'Archive Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Subject Card
// ─────────────────────────────────────────────────────────────

function SubjectCard({
  subject, tenant, onEdit, onArchive, onRestore
}: {
  subject: SubjectRecord;
  tenant: string;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const catColor = CATEGORY_COLORS[subject.category] || CATEGORY_COLORS.general;

  return (
    <div className={`glass-card rounded-3xl p-5 space-y-3.5 hover:shadow-lg transition-all group relative ${!subject.is_active ? 'opacity-60' : ''}`}>
      {/* Archive badge */}
      {!subject.is_active && (
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Archived</span>
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {subject.code && (
              <span className="text-[10px] font-black font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-2 py-0.5 rounded-lg">
                {subject.code}
              </span>
            )}
            {subject.is_elective && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Elective
              </span>
            )}
          </div>
          <h3 className="text-sm font-black text-[hsl(var(--text-primary))] leading-tight line-clamp-2">{subject.name}</h3>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="p-1.5 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-44 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl shadow-xl py-1.5 overflow-hidden" onMouseLeave={() => setMenuOpen(false)}>
              <Link
                href={`/${tenant}/admin/academics/subjects/${subject.id}`}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </Link>
              <button
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors text-left"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <Link
                href={`/${tenant}/admin/academics/curriculum?subject=${subject.id}`}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <BookOpen className="w-3.5 h-3.5" /> Curriculum
              </Link>
              <div className="my-1 border-t border-[hsl(var(--border))]" />
              {subject.is_active ? (
                <button
                  onClick={() => { setMenuOpen(false); onArchive(); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors text-left"
                >
                  <Archive className="w-3.5 h-3.5" /> Archive
                </button>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); onRestore(); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category + Department */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${catColor}`}>
          {CATEGORY_LABELS[subject.category]}
        </span>
        {subject.department_name && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
            <Building2 className="w-2.5 h-2.5 inline mr-1" />{subject.department_name}
          </span>
        )}
      </div>

      {/* Streams */}
      {subject.streams && subject.streams.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {subject.streams.slice(0, 2).map(s => (
            <span key={s.stream_id} className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.15)]">
              {s.stream_code}
              {s.is_core && ' •'}
            </span>
          ))}
          {subject.streams.length > 2 && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border border-[hsl(var(--border))]">
              +{subject.streams.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-[hsl(var(--border)/0.5)] flex items-center justify-between">
        <Link
          href={`/${tenant}/admin/academics/curriculum?subject=${subject.id}`}
          className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1"
        >
          <BookOpen className="w-3 h-3" /> Curriculum
        </Link>
        <Link
          href={`/${tenant}/admin/academics/subjects/${subject.id}`}
          className="text-[10px] font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1"
        >
          View <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
