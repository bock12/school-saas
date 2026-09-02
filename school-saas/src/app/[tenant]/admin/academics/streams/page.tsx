'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers, Plus, Search, BookOpen, Users, ArrowLeft,
  Pencil, Trash2, CheckCircle2, AlertCircle, X,
  Shield, Check, AlertTriangle, Settings2, Sliders,
  HelpCircle, ChevronRight, GraduationCap, Tag
} from 'lucide-react';
import {
  getCurriculumStreams, createCurriculumStream,
  updateCurriculumStream, deleteCurriculumStream,
  getStreamSubjectRules, upsertStreamSubjectRule, deleteStreamSubjectRule,
  getSubjects, SubjectRecord, CurriculumStreamRecord
} from '@/app/actions/subjects';

interface StreamRuleItem {
  id: string;
  stream_id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  rule_type: 'core' | 'elective';
  elective_group?: string;
  min_selections: number;
  max_selections: number;
  sort_order: number;
  is_active: boolean;
}

export default function StreamsManagementPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  const [streams, setStreams] = useState<CurriculumStreamRecord[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Modals & Drawers
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<CurriculumStreamRecord | null>(null);
  const [streamForm, setStreamForm] = useState({
    code: '',
    name: '',
    description: '',
    level: 'SSS',
    sort_order: 1,
  });

  // Selected stream for rules management
  const [selectedStreamForRules, setSelectedStreamForRules] = useState<CurriculumStreamRecord | null>(null);
  const [streamRules, setStreamRules] = useState<StreamRuleItem[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);

  // New Rule Form
  const [newRuleForm, setNewRuleForm] = useState<{
    subject_id: string;
    rule_type: 'core' | 'elective';
    elective_group: string;
    min_selections: number;
    max_selections: number;
  }>({
    subject_id: '',
    rule_type: 'core',
    elective_group: 'Group A',
    min_selections: 1,
    max_selections: 1,
  });

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    const [streamsRes, subjectsRes] = await Promise.all([
      getCurriculumStreams(tenant),
      getSubjects(tenant, { is_active: true, limit: 100 }),
    ]);

    if (streamsRes.success) setStreams(streamsRes.data);
    if (subjectsRes.success) setAllSubjects(subjectsRes.data);
    setLoading(false);
  }, [tenant]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load rules when a stream is selected for rules
  const loadRulesForStream = useCallback(async (streamId: string) => {
    setLoadingRules(true);
    const res = await getStreamSubjectRules(tenant, streamId);
    if (res.success) {
      setStreamRules(res.data);
    } else {
      showNotification('error', res.error || 'Failed to load rules.');
    }
    setLoadingRules(false);
  }, [tenant]);

  useEffect(() => {
    if (selectedStreamForRules) {
      loadRulesForStream(selectedStreamForRules.id);
    }
  }, [selectedStreamForRules, loadRulesForStream]);

  // Save Stream (Create or Update)
  const handleSaveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamForm.code.trim() || !streamForm.name.trim()) return;
    setSaving(true);

    if (editingStream) {
      const res = await updateCurriculumStream(tenant, editingStream.id, streamForm);
      if (res.success) {
        showNotification('success', `Stream "${streamForm.name}" updated.`);
        setStreamModalOpen(false);
        setEditingStream(null);
        loadData();
      } else {
        showNotification('error', res.error || 'Failed to update stream.');
      }
    } else {
      const res = await createCurriculumStream(tenant, streamForm);
      if (res.success) {
        showNotification('success', `Stream "${streamForm.name}" created.`);
        setStreamModalOpen(false);
        loadData();
      } else {
        showNotification('error', res.error || 'Failed to create stream.');
      }
    }
    setSaving(false);
  };

  // Delete Stream
  const handleDeleteStream = async (stream: CurriculumStreamRecord) => {
    if (!confirm(`Are you sure you want to deactivate stream "${stream.name}"?`)) return;
    setSaving(true);
    const res = await deleteCurriculumStream(tenant, stream.id);
    setSaving(false);
    if (res.success) {
      showNotification('success', `Stream "${stream.name}" deactivated.`);
      loadData();
    } else {
      showNotification('error', res.error || 'Failed to delete stream.');
    }
  };

  // Add/Upsert Stream Subject Rule
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStreamForRules || !newRuleForm.subject_id) return;
    setSaving(true);

    const res = await upsertStreamSubjectRule(tenant, {
      stream_id: selectedStreamForRules.id,
      subject_id: newRuleForm.subject_id,
      rule_type: newRuleForm.rule_type,
      elective_group: newRuleForm.rule_type === 'elective' ? newRuleForm.elective_group : undefined,
      min_selections: newRuleForm.min_selections,
      max_selections: newRuleForm.max_selections,
    });

    setSaving(false);
    if (res.success) {
      showNotification('success', 'Subject rule applied to stream.');
      setNewRuleForm({
        subject_id: '',
        rule_type: 'core',
        elective_group: 'Group A',
        min_selections: 1,
        max_selections: 1,
      });
      loadRulesForStream(selectedStreamForRules.id);
      loadData();
    } else {
      showNotification('error', res.error || 'Failed to add rule.');
    }
  };

  // Delete Rule
  const handleDeleteRule = async (ruleId: string) => {
    setSaving(true);
    const res = await deleteStreamSubjectRule(tenant, ruleId);
    setSaving(false);
    if (res.success && selectedStreamForRules) {
      showNotification('success', 'Subject rule removed.');
      loadRulesForStream(selectedStreamForRules.id);
      loadData();
    } else {
      showNotification('error', res.error || 'Failed to remove rule.');
    }
  };

  const filteredStreams = streams.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.code.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = !levelFilter || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Calculate graduation summary for selected stream
  const coreRules = streamRules.filter(r => r.rule_type === 'core');
  const electiveRules = streamRules.filter(r => r.rule_type === 'elective');
  const electiveGroups = Array.from(new Set(electiveRules.map(r => r.elective_group || 'Group A')));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fade-in w-full pb-16">
      {/* Toast Notification */}
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
            href={`/${tenant}/admin/academics/subjects`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Subjects Catalogue
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[hsl(var(--accent))]" />
            Curriculum Streams &amp; Faculty Rules
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Configure academic faculties (Science, Arts, Commercial), core curricula, and elective graduation rules
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/${tenant}/admin/academics/stream-assignments`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5" /> Student Stream Assignments
          </Link>
          <button
            onClick={() => {
              setEditingStream(null);
              setStreamForm({ code: '', name: '', description: '', level: 'SSS', sort_order: streams.length + 1 });
              setStreamModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Curriculum Stream
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-3xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search streams by name or code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none min-w-[150px]"
          >
            <option value="">All Levels</option>
            <option value="SSS">Senior Secondary (SSS)</option>
            <option value="JSS">Junior Secondary (JSS)</option>
            <option value="TVET">Technical / Vocational</option>
            <option value="ALL">All Levels</option>
          </select>
        </div>
      </div>

      {/* Stream Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-3xl p-6 animate-pulse space-y-4">
              <div className="h-5 bg-[hsl(var(--bg-tertiary))] rounded-lg w-1/2" />
              <div className="h-4 bg-[hsl(var(--bg-tertiary))] rounded-lg w-3/4" />
              <div className="h-10 bg-[hsl(var(--bg-tertiary))] rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center space-y-3">
          <Layers className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto" />
          <h3 className="text-base font-black text-[hsl(var(--text-primary))]">No streams found</h3>
          <p className="text-xs text-[hsl(var(--text-secondary))]">Try adjusting your filters or create a new curriculum stream.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStreams.map(stream => (
            <div
              key={stream.id}
              className="glass-card rounded-3xl p-6 border border-[hsl(var(--border))] hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2.5 py-0.5 rounded-lg">
                        {stream.code}
                      </span>
                      {stream.level && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))]">
                          {stream.level}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-[hsl(var(--text-primary))] leading-tight">
                      {stream.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingStream(stream);
                        setStreamForm({
                          code: stream.code,
                          name: stream.name,
                          description: stream.description || '',
                          level: stream.level || 'SSS',
                          sort_order: stream.sort_order,
                        });
                        setStreamModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                      title="Edit Stream"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStream(stream)}
                      className="p-1.5 rounded-xl hover:bg-red-500/10 text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-colors"
                      title="Delete Stream"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {stream.description && (
                  <p className="text-xs text-[hsl(var(--text-secondary))] line-clamp-2">
                    {stream.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs font-bold text-[hsl(var(--text-tertiary))] pt-2 border-t border-[hsl(var(--border)/0.5)]">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                    {stream.subject_count ?? 0} Subjects
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    {stream.student_count ?? 0} Students
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStreamForRules(stream)}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" /> Configure Subject Rules
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stream Modal (Add / Edit) */}
      {streamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[hsl(var(--accent)/0.15)]">
                  <Layers className="w-5 h-5 text-[hsl(var(--accent))]" />
                </div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">
                  {editingStream ? 'Edit Curriculum Stream' : 'New Curriculum Stream'}
                </h3>
              </div>
              <button
                onClick={() => setStreamModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            <form onSubmit={handleSaveStream} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Stream Code *</label>
                  <input
                    required
                    type="text"
                    value={streamForm.code}
                    onChange={e => setStreamForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SCI_TECH"
                    className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--text-primary))]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Education Level</label>
                  <select
                    value={streamForm.level}
                    onChange={e => setStreamForm(p => ({ ...p, level: e.target.value }))}
                    className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))]"
                  >
                    <option value="SSS">Senior Secondary (SSS)</option>
                    <option value="JSS">Junior Secondary (JSS)</option>
                    <option value="TVET">Technical / Vocational</option>
                    <option value="ALL">All Levels</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Stream Name *</label>
                <input
                  required
                  type="text"
                  value={streamForm.name}
                  onChange={e => setStreamForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Sciences & Technologies"
                  className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Description / Focus Areas</label>
                <textarea
                  value={streamForm.description}
                  onChange={e => setStreamForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="e.g. Physics, Chemistry, Biology, Further Maths, ICT..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStreamModalOpen(false)}
                  className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90"
                >
                  {saving ? 'Saving…' : editingStream ? 'Save Changes' : 'Create Stream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stream Subject Rules Drawer / Modal */}
      {selectedStreamForRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--bg-secondary))] z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[hsl(var(--accent)/0.15)]">
                  <Sliders className="w-5 h-5 text-[hsl(var(--accent))]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[hsl(var(--text-primary))]">
                    Subject Rules — {selectedStreamForRules.name}
                  </h2>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                    Define Core subjects (mandatory) vs Elective Groups (student selectable)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStreamForRules(null)}
                className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Graduation Rule Summary Banner */}
              <div className="p-4 rounded-2xl bg-[hsl(var(--accent)/0.08)] border border-[hsl(var(--accent)/0.2)] space-y-1">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <h4 className="text-xs font-black text-[hsl(var(--text-primary))]">
                    Student Enrollment &amp; Graduation Blueprint
                  </h4>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  Students assigned to this stream will automatically be enrolled in{' '}
                  <strong className="text-[hsl(var(--text-primary))]">{coreRules.length} Core subject(s)</strong>.
                  {electiveGroups.length > 0 ? (
                    <>
                      {' '}Additionally, they select from{' '}
                      <strong className="text-[hsl(var(--text-primary))]">
                        {electiveGroups.length} elective group(s)
                      </strong>{' '}
                      ({electiveGroups.join(', ')}).
                    </>
                  ) : (
                    ' No elective groups configured yet.'
                  )}
                </p>
              </div>

              {/* Add New Rule Form */}
              <form onSubmit={handleAddRule} className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-3">
                <h4 className="text-xs font-black text-[hsl(var(--text-primary))] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Add Subject to Stream
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Select Subject *</label>
                    <select
                      required
                      value={newRuleForm.subject_id}
                      onChange={e => setNewRuleForm(p => ({ ...p, subject_id: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    >
                      <option value="">-- Choose Subject --</option>
                      {allSubjects
                        .filter(s => !streamRules.some(r => r.subject_id === s.id))
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code || 'NO-CODE'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Requirement Type</label>
                    <select
                      value={newRuleForm.rule_type}
                      onChange={e => setNewRuleForm(p => ({ ...p, rule_type: e.target.value as any }))}
                      className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                    >
                      <option value="core">Core (Mandatory)</option>
                      <option value="elective">Elective Group</option>
                    </select>
                  </div>

                  {newRuleForm.rule_type === 'elective' ? (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Elective Group</label>
                      <input
                        type="text"
                        value={newRuleForm.elective_group}
                        onChange={e => setNewRuleForm(p => ({ ...p, elective_group: e.target.value }))}
                        placeholder="e.g. Group A"
                        className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={saving || !newRuleForm.subject_id}
                        className="w-full h-10 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
                      >
                        {saving ? 'Adding…' : 'Add Subject'}
                      </button>
                    </div>
                  )}
                </div>

                {newRuleForm.rule_type === 'elective' && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[hsl(var(--border)/0.5)]">
                    <div>
                      <label className="text-[10px] font-bold text-[hsl(var(--text-secondary))]">Min Picks from Group</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newRuleForm.min_selections}
                        onChange={e => setNewRuleForm(p => ({ ...p, min_selections: parseInt(e.target.value) || 1 }))}
                        className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[hsl(var(--text-secondary))]">Max Picks from Group</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newRuleForm.max_selections}
                        onChange={e => setNewRuleForm(p => ({ ...p, max_selections: parseInt(e.target.value) || 1 }))}
                        className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={saving || !newRuleForm.subject_id}
                        className="w-full h-9 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
                      >
                        {saving ? 'Adding…' : 'Add Elective'}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Rules List */}
              {loadingRules ? (
                <div className="p-8 text-center text-xs text-[hsl(var(--text-tertiary))]">Loading rules…</div>
              ) : streamRules.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
                  No subjects assigned to this stream yet. Use the form above to add core and elective subjects.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Core Subjects */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-[hsl(var(--text-primary))] uppercase tracking-wider flex items-center justify-between">
                      <span>Core Subjects ({coreRules.length})</span>
                      <span className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))] lowercase">Mandatory for all stream students</span>
                    </h4>
                    <div className="space-y-1.5">
                      {coreRules.map(rule => (
                        <div key={rule.id} className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono font-bold text-[hsl(var(--accent))]">{rule.subject_code}</span>
                            <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{rule.subject_name}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Elective Groups */}
                  {electiveGroups.map(group => {
                    const groupRules = electiveRules.filter(r => (r.elective_group || 'Group A') === group);
                    const minPicks = groupRules[0]?.min_selections ?? 1;
                    const maxPicks = groupRules[0]?.max_selections ?? 1;

                    return (
                      <div key={group} className="space-y-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-violet-400 uppercase tracking-wider">
                            {group} Electives ({groupRules.length} subjects)
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            Pick {minPicks === maxPicks ? `${minPicks}` : `${minPicks} to ${maxPicks}`}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {groupRules.map(rule => (
                            <div key={rule.id} className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-mono font-bold text-violet-400">{rule.subject_code}</span>
                                <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{rule.subject_name}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
