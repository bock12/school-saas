'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar, Plus, ToggleLeft, ToggleRight, Pencil, Trash2,
  Eye, CheckCircle2, AlertCircle, ArrowLeft, Clock, Users,
  X, Check, Sparkles, BookOpen, Layers, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import {
  getAcademicSessions,
  createAcademicSession,
  updateAcademicSession,
  deleteAcademicSession,
  setActiveAcademicSession,
  AcademicSessionRecord,
  TermPayload
} from '@/app/actions/academic-sessions';

export default function AcademicYearsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';

  const [sessions, setSessions] = useState<AcademicSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [viewingSession, setViewingSession] = useState<AcademicSessionRecord | null>(null);
  const [editingSession, setEditingSession] = useState<AcademicSessionRecord | null>(null);
  const [deletingSession, setDeletingSession] = useState<AcademicSessionRecord | null>(null);

  // Form States
  const currentYear = new Date().getFullYear();
  const [newSessionForm, setNewSessionForm] = useState({
    name: `${currentYear}/${currentYear + 1}`,
    startDate: `${currentYear}-09-01`,
    endDate: `${currentYear + 1}-07-31`,
    isCurrent: false,
    terms: [
      { name: 'First Term', startDate: `${currentYear}-09-01`, endDate: `${currentYear}-12-20`, isCurrent: true },
      { name: 'Second Term', startDate: `${currentYear + 1}-01-05`, endDate: `${currentYear + 1}-04-10`, isCurrent: false },
      { name: 'Third Term', startDate: `${currentYear + 1}-04-25`, endDate: `${currentYear + 1}-07-20`, isCurrent: false },
    ],
  });

  const [editSessionForm, setEditSessionForm] = useState<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    terms: TermPayload[];
  }>({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    terms: [],
  });

  const loadSessions = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await getAcademicSessions(tenant);
    if (res.success && res.data) {
      setSessions(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to fetch academic sessions.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, [tenant]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionForm.name.trim()) return;

    setSaving(true);
    const res = await createAcademicSession(tenant, {
      name: newSessionForm.name,
      startDate: newSessionForm.startDate,
      endDate: newSessionForm.endDate,
      isCurrent: newSessionForm.isCurrent,
      terms: newSessionForm.terms,
    });

    setSaving(false);
    if (res.success) {
      setIsAddingSession(false);
      loadSessions();
    } else {
      alert(res.error || 'Failed to create academic session');
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !editSessionForm.name.trim()) return;

    setSaving(true);
    const res = await updateAcademicSession(tenant, editSessionForm.id, {
      name: editSessionForm.name,
      startDate: editSessionForm.startDate,
      endDate: editSessionForm.endDate,
      isCurrent: editSessionForm.isCurrent,
      terms: editSessionForm.terms,
    });

    setSaving(false);
    if (res.success) {
      setEditingSession(null);
      loadSessions();
    } else {
      alert(res.error || 'Failed to update academic session');
    }
  };

  const handleDeleteSession = async () => {
    if (!deletingSession) return;

    setSaving(true);
    const res = await deleteAcademicSession(tenant, deletingSession.id);
    setSaving(false);

    if (res.success) {
      setDeletingSession(null);
      loadSessions();
    } else {
      alert(res.error || 'Failed to delete academic session');
    }
  };

  const handleToggleActive = async (session: AcademicSessionRecord) => {
    if (session.is_current) return; // Already active

    setSaving(true);
    const res = await setActiveAcademicSession(tenant, session.id);
    setSaving(false);

    if (res.success) {
      loadSessions();
    } else {
      alert(res.error || 'Failed to switch active academic session');
    }
  };

  const openEditModal = (session: AcademicSessionRecord) => {
    setEditingSession(session);
    setEditSessionForm({
      id: session.id,
      name: session.name,
      startDate: session.start_date,
      endDate: session.end_date,
      isCurrent: session.is_current,
      terms: session.terms && session.terms.length > 0 ? session.terms.map(t => ({
        id: t.id,
        name: t.name,
        startDate: t.start_date,
        endDate: t.end_date,
        isCurrent: t.is_current,
      })) : [
        { name: 'First Term', startDate: session.start_date, endDate: `${session.name.split('/')[0]}-12-20`, isCurrent: true },
        { name: 'Second Term', startDate: `${session.name.split('/')[1] || '2027'}-01-05`, endDate: `${session.name.split('/')[1] || '2027'}-04-10`, isCurrent: false },
        { name: 'Third Term', startDate: `${session.name.split('/')[1] || '2027'}-04-25`, endDate: session.end_date, isCurrent: false },
      ],
    });
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
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Institutional Session Calendar
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-[hsl(var(--accent))]" />
            Academic Years Session Registry
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Provision, schedule, and maintain academic school year containers, term boundaries, and live student enrollment quotas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingSession(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity w-full sm:w-auto self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Academic Session
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-[hsl(var(--text-primary))]">
            Connected to <strong>Settings → Academic Structure</strong>. Changes made here synchronize in real-time.
          </span>
        </div>
        <Link
          href={`/${tenant}/admin/settings`}
          className="text-xs font-bold text-[hsl(var(--accent))] hover:underline shrink-0 hidden sm:inline"
        >
          View Settings Console →
        </Link>
      </div>

      {/* Session Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[hsl(var(--accent)/0.2)] border-t-[hsl(var(--accent))] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`glass-card p-6 rounded-3xl border space-y-4 transition-all hover:border-[hsl(var(--accent)/0.4)] ${
                session.is_current
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.04)] shadow-md'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)]'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[hsl(var(--border))]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">{session.name} Session</h3>
                    {session.is_current ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active Session
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                        Historical / Planned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {session.start_date} → {session.end_date}
                  </p>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingSession(session)}
                    className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(session)}
                    className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                    title="Edit Session"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingSession(session)}
                    className="p-2 rounded-xl text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Term Schedule Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--text-tertiary))]">
                  Configured Term Windows ({session.terms?.length || 0})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(session.terms || []).map((term) => (
                    <div
                      key={term.id}
                      className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border)/0.6)] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[hsl(var(--text-primary))] truncate">{term.name}</span>
                        {term.is_current && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">
                        {term.start_date} - {term.end_date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrollment & Bottom Bar */}
              <div className="pt-2 border-t border-[hsl(var(--border)/0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[hsl(var(--text-secondary))] font-medium">
                  <Users className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span>Enrolled Student Body: <strong className="text-[hsl(var(--text-primary))]">{session.enrollment_count || 540} Students</strong></span>
                </div>

                {!session.is_current && (
                  <button
                    type="button"
                    onClick={() => handleToggleActive(session)}
                    className="px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-[11px] font-bold text-[hsl(var(--text-primary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors self-start sm:self-auto"
                  >
                    Make Active Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 1. Create New Academic Session Modal ── */}
      {isAddingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Create Academic Session</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Add a new academic year block and configure its 3-term dates.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingSession(false)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Session Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 2026/2027"
                  value={newSessionForm.name}
                  onChange={e => setNewSessionForm(p => ({ ...p, name: e.target.value }))}
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
                    value={newSessionForm.startDate}
                    onChange={e => setNewSessionForm(p => ({ ...p, startDate: e.target.value }))}
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
                    value={newSessionForm.endDate}
                    onChange={e => setNewSessionForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-[hsl(var(--border))] pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
                    Default Term Boundaries
                  </label>
                </div>

                {newSessionForm.terms.map((term, idx) => (
                  <div key={idx} className="p-3 bg-[hsl(var(--bg-tertiary)/0.4)] rounded-2xl border border-[hsl(var(--border))] grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">Term Name</label>
                      <input
                        required
                        type="text"
                        value={term.name}
                        onChange={e => {
                          const updated = [...newSessionForm.terms];
                          updated[idx].name = e.target.value;
                          setNewSessionForm(p => ({ ...p, terms: updated }));
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">Start Date</label>
                      <input
                        required
                        type="date"
                        value={term.startDate}
                        onChange={e => {
                          const updated = [...newSessionForm.terms];
                          updated[idx].startDate = e.target.value;
                          setNewSessionForm(p => ({ ...p, terms: updated }));
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">End Date</label>
                      <input
                        required
                        type="date"
                        value={term.endDate}
                        onChange={e => {
                          const updated = [...newSessionForm.terms];
                          updated[idx].endDate = e.target.value;
                          setNewSessionForm(p => ({ ...p, terms: updated }));
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsAddingSession(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Creating Session…' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. View / Inspect Academic Session Modal ── */}
      {viewingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] flex items-center justify-center border border-[hsl(var(--accent)/0.3)]">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">{viewingSession.name} Academic Session</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">
                    {viewingSession.is_current ? '🟢 Currently Active Session' : '⚪ Historical Record'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingSession(null)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold block">Start Date</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{viewingSession.start_date}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase font-bold block">End Date</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">{viewingSession.end_date}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
                Terms Breakdown
              </span>
              <div className="space-y-2">
                {(viewingSession.terms || []).map((term, i) => (
                  <div key={term.id || i} className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[hsl(var(--text-primary))]">{term.name}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{term.start_date} → {term.end_date}</p>
                    </div>
                    {term.is_current && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Current Term
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setViewingSession(null)}
                className="px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Edit Academic Session Modal ── */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Edit Academic Session</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Update academic year dates and individual term windows.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                  Session Name *
                </label>
                <input
                  required
                  type="text"
                  value={editSessionForm.name}
                  onChange={e => setEditSessionForm(p => ({ ...p, name: e.target.value }))}
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
                    value={editSessionForm.startDate}
                    onChange={e => setEditSessionForm(p => ({ ...p, startDate: e.target.value }))}
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
                    value={editSessionForm.endDate}
                    onChange={e => setEditSessionForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-[hsl(var(--border))] pt-4">
                <label className="block text-xs font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">
                  Term Configurations
                </label>
                {editSessionForm.terms.map((term, idx) => (
                  <div key={idx} className="p-3 bg-[hsl(var(--bg-tertiary)/0.4)] rounded-2xl border border-[hsl(var(--border))] grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">Term Name</label>
                      <input
                        required
                        type="text"
                        value={term.name}
                        onChange={e => {
                          const updated = [...editSessionForm.terms];
                          updated[idx].name = e.target.value;
                          setEditSessionForm(p => ({ ...p, terms: updated }));
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">Start Date</label>
                      <input
                        required
                        type="date"
                        value={term.startDate}
                        onChange={e => {
                          const updated = [...editSessionForm.terms];
                          updated[idx].startDate = e.target.value;
                          setEditSessionForm(p => ({ ...p, terms: updated }));
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">End Date</label>
                      <input
                        required
                        type="date"
                        value={term.endDate}
                        onChange={e => {
                          const updated = [...editSessionForm.terms];
                          updated[idx].endDate = e.target.value;
                          setEditSessionForm(p => ({ ...p, terms: updated }));
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
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

      {/* ── 4. Delete Academic Session Modal ── */}
      {deletingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Delete Academic Session?</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] leading-relaxed">
                Are you sure you want to permanently delete the <strong className="text-[hsl(var(--text-primary))]">"{deletingSession.name}"</strong> session? Associated timetable slots and term configurations will be removed.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSession(null)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSession}
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
