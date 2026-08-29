'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Clock, Plus, Calendar, Pencil, Trash2, Eye,
  CheckCircle2, AlertCircle, ArrowLeft, X, Check,
  Sparkles, CalendarCheck, Layers, BookOpen, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import {
  getAllTerms,
  getAcademicSessions,
  createSingleTerm,
  updateSingleTerm,
  deleteSingleTerm,
  setActiveSingleTerm,
  DetailedTermRecord,
  AcademicSessionRecord
} from '@/app/actions/academic-sessions';

export default function AcademicTermsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [terms, setTerms] = useState<DetailedTermRecord[]>([]);
  const [sessions, setSessions] = useState<AcademicSessionRecord[]>([]);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modals
  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [viewingTerm, setViewingTerm] = useState<DetailedTermRecord | null>(null);
  const [editingTerm, setEditingTerm] = useState<DetailedTermRecord | null>(null);
  const [deletingTerm, setDeletingTerm] = useState<DetailedTermRecord | null>(null);

  // Form state
  const currentYear = new Date().getFullYear();
  const [newTermForm, setNewTermForm] = useState({
    academicYearId: '',
    name: 'First Term',
    startDate: `${currentYear}-09-01`,
    endDate: `${currentYear}-12-20`,
    isCurrent: false,
    midtermRecess: 'Oct 15 - Oct 18',
    examWindow: 'Dec 07 - Dec 11',
  });

  const [editTermForm, setEditTermForm] = useState({
    id: '',
    academicYearId: '',
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  const loadData = async () => {
    setLoading(true);
    const [termsRes, sessRes] = await Promise.all([
      getAllTerms(tenant, selectedYearFilter === 'all' ? undefined : selectedYearFilter),
      getAcademicSessions(tenant),
    ]);

    if (termsRes.success && termsRes.data) {
      setTerms(termsRes.data);
    }
    if (sessRes.success && sessRes.data) {
      setSessions(sessRes.data);
      if (!newTermForm.academicYearId && sessRes.data.length > 0) {
        const activeSess = sessRes.data.find(s => s.is_current) || sessRes.data[0];
        setNewTermForm(p => ({ ...p, academicYearId: activeSess.id }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [tenant, selectedYearFilter]);

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermForm.name.trim() || !newTermForm.academicYearId) {
      alert('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    const res = await createSingleTerm(tenant, {
      academicYearId: newTermForm.academicYearId,
      name: newTermForm.name,
      startDate: newTermForm.startDate,
      endDate: newTermForm.endDate,
      isCurrent: newTermForm.isCurrent,
    });
    setSaving(false);

    if (res.success) {
      setIsAddingTerm(false);
      loadData();
    } else {
      alert(res.error || 'Failed to create term schedule');
    }
  };

  const handleUpdateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTerm || !editTermForm.name.trim()) return;

    setSaving(true);
    const res = await updateSingleTerm(tenant, editTermForm.id, {
      name: editTermForm.name,
      startDate: editTermForm.startDate,
      endDate: editTermForm.endDate,
      isCurrent: editTermForm.isCurrent,
    });
    setSaving(false);

    if (res.success) {
      setEditingTerm(null);
      loadData();
    } else {
      alert(res.error || 'Failed to update term schedule');
    }
  };

  const handleDeleteTerm = async () => {
    if (!deletingTerm) return;

    setSaving(true);
    const res = await deleteSingleTerm(tenant, deletingTerm.id);
    setSaving(false);

    if (res.success) {
      setDeletingTerm(null);
      loadData();
    } else {
      alert(res.error || 'Failed to delete term schedule');
    }
  };

  const handleToggleActive = async (term: DetailedTermRecord) => {
    if (term.is_current) return;

    setSaving(true);
    const res = await setActiveSingleTerm(tenant, term.id);
    setSaving(false);

    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Failed to switch current active term');
    }
  };

  const openEditModal = (term: DetailedTermRecord) => {
    setEditingTerm(term);
    setEditTermForm({
      id: term.id,
      academicYearId: term.academic_year_id,
      name: term.name,
      startDate: term.start_date,
      endDate: term.end_date,
      isCurrent: term.is_current,
    });
  };

  // Helper to calculate weeks
  const getDurationWeeks = (startStr: string, endStr: string) => {
    try {
      const d1 = new Date(startStr);
      const d2 = new Date(endStr);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.round(diffDays / 7);
    } catch {
      return 14;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1680px] mx-auto animate-fade-in w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[hsl(var(--border))]">
        <div className="space-y-1">
          <Link
            href={`/${tenant}/admin/academics`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Term Schedules & Intervals
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-[hsl(var(--accent))]" />
            Terms & Semesters Schedules
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Configure term time windows, midterm recess periods, assessment milestones, and mark entry deadline windows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingTerm(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity w-full sm:w-auto self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Define New Term
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-[hsl(var(--text-primary))]">
            Connected to <strong>Settings → Academic Structure</strong> and <strong>Academic Years Registry</strong>.
          </span>
        </div>
        <Link
          href={`/${tenant}/admin/academics/years`}
          className="text-xs font-bold text-[hsl(var(--accent))] hover:underline shrink-0 hidden sm:inline"
        >
          Manage Academic Sessions →
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider shrink-0">
            Filter Session:
          </span>
          <select
            value={selectedYearFilter}
            onChange={(e) => setSelectedYearFilter(e.target.value)}
            className="w-full sm:w-auto h-10 px-3.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          >
            <option value="all">All Academic Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} Session {s.is_current ? '(Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] self-start sm:self-auto">
          Total Scheduled Terms: <strong className="text-[hsl(var(--text-primary))]">{terms.length}</strong>
        </span>
      </div>

      {/* Terms Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[hsl(var(--accent)/0.2)] border-t-[hsl(var(--accent))] rounded-full animate-spin" />
        </div>
      ) : terms.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-[hsl(var(--border))] space-y-3">
          <Clock className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto" />
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">No Terms Scheduled Yet</h3>
          <p className="text-xs text-[hsl(var(--text-tertiary))] max-w-sm mx-auto">
            Click "Define New Term" to schedule the first term boundary for your academic calendar.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingTerm(true)}
            className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
          >
            Define New Term
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {terms.map((t) => {
            const weeks = getDurationWeeks(t.start_date, t.end_date);
            return (
              <div
                key={t.id}
                className={`glass-card p-6 rounded-3xl border space-y-4 transition-all hover:border-[hsl(var(--accent)/0.4)] ${
                  t.is_current
                    ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.04)] shadow-md'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)]'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[hsl(var(--border))]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-[hsl(var(--text-primary))]">{t.name}</h3>
                        {t.is_current ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Current Term
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                            Scheduled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] font-medium mt-0.5">
                        Academic Session: <strong className="text-[hsl(var(--text-secondary))]">{t.academic_year_name}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewingTerm(t)}
                      className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(t)}
                      className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      title="Edit Term"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingTerm(t)}
                      className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Term"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Term Bounds */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.5)]">
                    <span className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase block mb-1">
                      Term Duration ({weeks} Weeks)
                    </span>
                    <p className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> {t.start_date} → {t.end_date}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.5)]">
                    <span className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase block mb-1">
                      Midterm Break
                    </span>
                    <p className="font-bold text-[hsl(var(--text-secondary))]">
                      Mid-Term Recess Scheduled
                    </p>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-2 border-t border-[hsl(var(--border)/0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-[hsl(var(--text-tertiary))] font-medium">
                    Order index: #{t.sort_order} in {t.academic_year_name}
                  </span>

                  {!t.is_current && (
                    <button
                      type="button"
                      onClick={() => handleToggleActive(t)}
                      className="px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-[11px] font-bold text-[hsl(var(--text-primary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors self-start sm:self-auto"
                    >
                      Set as Active Term
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 1. Create New Term Modal ── */}
      {isAddingTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Define New Academic Term</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Set term dates and milestones within an academic session.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingTerm(false)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTerm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Parent Academic Session *
                </label>
                <select
                  required
                  value={newTermForm.academicYearId}
                  onChange={(e) => setNewTermForm((p) => ({ ...p, academicYearId: e.target.value }))}
                  className="w-full h-11 px-3.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} Academic Session {s.is_current ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Term Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. First Term, Second Term, Summer Term"
                  value={newTermForm.name}
                  onChange={(e) => setNewTermForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-11 px-4 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={newTermForm.startDate}
                    onChange={(e) => setNewTermForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={newTermForm.endDate}
                    onChange={(e) => setNewTermForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newTermActive"
                  checked={newTermForm.isCurrent}
                  onChange={(e) => setNewTermForm((p) => ({ ...p, isCurrent: e.target.checked }))}
                  className="w-4 h-4 accent-[hsl(var(--accent))] rounded cursor-pointer"
                />
                <label htmlFor="newTermActive" className="text-xs font-bold text-[hsl(var(--text-secondary))] cursor-pointer">
                  Set as current active term across school
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsAddingTerm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving Term…' : 'Save Term Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. View Details Modal ── */}
      {viewingTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] flex items-center justify-center border border-[hsl(var(--accent)/0.3)]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">{viewingTerm.name}</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">
                    Session: {viewingTerm.academic_year_name} • {viewingTerm.is_current ? '🟢 Active Term' : '⚪ Scheduled'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingTerm(null)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold block">Start Date</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{viewingTerm.start_date}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold block">End Date</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{viewingTerm.end_date}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Total Term Length:</span>
                <strong className="text-[hsl(var(--text-primary))]">{getDurationWeeks(viewingTerm.start_date, viewingTerm.end_date)} Weeks</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Sequence Order:</span>
                <strong className="text-[hsl(var(--text-primary))]">Term #{viewingTerm.sort_order}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setViewingTerm(null)}
                className="px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Edit Term Modal ── */}
      {editingTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Edit Term Schedule</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Update start and end dates for this academic term.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTerm(null)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTerm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Term Name *
                </label>
                <input
                  required
                  type="text"
                  value={editTermForm.name}
                  onChange={(e) => setEditTermForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full h-11 px-4 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={editTermForm.startDate}
                    onChange={(e) => setEditTermForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={editTermForm.endDate}
                    onChange={(e) => setEditTermForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setEditingTerm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 4. Delete Term Modal ── */}
      {deletingTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Delete Term Schedule?</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] leading-relaxed">
                Are you sure you want to delete <strong className="text-[hsl(var(--text-primary))]">"{deletingTerm.name}"</strong> ({deletingTerm.academic_year_name})? Associated calendar milestones may be unlinked.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTerm(null)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTerm}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all shadow-sm disabled:opacity-50"
              >
                {saving ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
