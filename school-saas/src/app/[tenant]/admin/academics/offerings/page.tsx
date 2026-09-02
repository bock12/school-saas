'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookMarked, ArrowLeft, Plus, Search, Calendar, Users,
  CheckCircle2, AlertCircle, AlertTriangle, Layers, Clock,
  Filter, Sparkles, Pencil, Trash2, Sliders, ChevronRight,
  Shield, Check, X, RefreshCw, Eye, GraduationCap, Zap
} from 'lucide-react';
import {
  getSubjectOfferings, getTermOfferings, createSubjectOffering,
  updateSubjectOffering, deleteSubjectOffering, generateTermOfferingsFromYear,
  updateTermOffering, SubjectOfferingRecord, TermOfferingRecord,
  OfferingMutationResult
} from '@/app/actions/offerings';
import { getSubjects, getCurriculumStreams, SubjectRecord, CurriculumStreamRecord } from '@/app/actions/subjects';
import { getSimpleAcademicYears, getAllTerms } from '@/app/actions/academic-sessions';

export default function SubjectOfferingsDirectoryPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  const [activeTab, setActiveTab] = useState<'annual' | 'term'>('annual');
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string; is_current: boolean }[]>([]);
  const [terms, setTerms] = useState<{ id: string; name: string; is_current?: boolean }[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const [annualOfferings, setAnnualOfferings] = useState<SubjectOfferingRecord[]>([]);
  const [termOfferings, setTermOfferings] = useState<TermOfferingRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [streams, setStreams] = useState<CurriculumStreamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingTermOffering, setEditingTermOffering] = useState<TermOfferingRecord | null>(null);
  const [termFormSaving, setTermFormSaving] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Initial Load of Academic Years & Master Lists
  useEffect(() => {
    if (!tenant) return;
    Promise.all([
      getSimpleAcademicYears(tenant),
      getSubjects(tenant, { is_active: true, limit: 100 }),
      getCurriculumStreams(tenant),
    ]).then(([yearsRes, subsRes, strRes]) => {
      if (yearsRes && yearsRes.length > 0) {
        setAcademicYears(yearsRes);
        const current = yearsRes.find(y => y.is_current) || yearsRes[0];
        setSelectedYear(current.id);
      }
      if (subsRes.success) setSubjects(subsRes.data);
      if (strRes.success) setStreams(strRes.data);
    });
  }, [tenant]);

  // 2. Load terms when year changes
  useEffect(() => {
    if (!tenant || !selectedYear) return;
    getAllTerms(tenant, selectedYear).then(res => {
      if (res.success && res.data) {
        setTerms(res.data);
        if (res.data.length > 0) {
          const cur = res.data.find(t => t.is_current) || res.data[0];
          setSelectedTerm(cur.id);
        } else {
          setSelectedTerm('');
        }
      }
    });
  }, [tenant, selectedYear]);

  // 3. Load offerings data
  const loadOfferings = useCallback(async () => {
    if (!tenant || !selectedYear) return;
    setLoading(true);

    const [annRes, troRes] = await Promise.all([
      getSubjectOfferings(tenant, { academic_year_id: selectedYear }),
      selectedTerm ? getTermOfferings(tenant, { term_id: selectedTerm }) : Promise.resolve({ success: true, data: [] }),
    ]);

    if (annRes.success) setAnnualOfferings(annRes.data);
    if (troRes.success) setTermOfferings(troRes.data);
    setLoading(false);
  }, [tenant, selectedYear, selectedTerm]);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  // Handle batch generate term offerings
  const handleGenerateTermOfferings = async () => {
    if (!selectedYear || !selectedTerm) return;
    setGenerating(true);
    const res = await generateTermOfferingsFromYear(tenant, selectedYear, selectedTerm);
    setGenerating(false);
    if (res.success) {
      showNotification('success', `Generated ${res.count ?? 0} operational term offerings.`);
      setIsGenerateOpen(false);
      loadOfferings();
    } else {
      showNotification('error', res.error || 'Failed to generate term offerings.');
    }
  };

  // Handle save term offering override
  const handleSaveTermOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTermOffering) return;
    setTermFormSaving(true);

    const res = await updateTermOffering(tenant, editingTermOffering.id, {
      periods_per_week: editingTermOffering.periods_per_week,
      duration_minutes: editingTermOffering.duration_minutes,
      timetable_status: editingTermOffering.timetable_status,
      status: editingTermOffering.status,
      notes: editingTermOffering.notes,
    });

    setTermFormSaving(false);
    if (res.success) {
      showNotification('success', 'Term offering operational state updated.');
      setEditingTermOffering(null);
      loadOfferings();
    } else {
      showNotification('error', res.error || 'Failed to update term offering.');
    }
  };

  // Filtering
  const filteredAnnual = annualOfferings.filter(o => {
    const matchesSearch = !search ||
      (o.subject_name?.toLowerCase().includes(search.toLowerCase())) ||
      (o.subject_code?.toLowerCase().includes(search.toLowerCase())) ||
      (o.class_name?.toLowerCase().includes(search.toLowerCase())) ||
      (o.teacher_name?.toLowerCase().includes(search.toLowerCase()));
    const matchesStream = !streamFilter || o.stream_id === streamFilter;
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStream && matchesStatus;
  });

  const filteredTerm = termOfferings.filter(o => {
    const matchesSearch = !search ||
      (o.subject_name?.toLowerCase().includes(search.toLowerCase())) ||
      (o.subject_code?.toLowerCase().includes(search.toLowerCase())) ||
      (o.class_name?.toLowerCase().includes(search.toLowerCase())) ||
      (o.teacher_name?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalOfferings = annualOfferings.length;
  const overloadOfferings = annualOfferings.filter(o => o.overload_flag).length;
  const totalEnrolled = annualOfferings.reduce((sum, o) => sum + (o.current_enrollment || 0), 0);
  const termScheduledCount = termOfferings.filter(t => t.timetable_status === 'scheduled' || t.timetable_status === 'active').length;

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto animate-fade-in w-full pb-16">
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
            href={`/${tenant}/admin/academics`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <BookMarked className="w-7 h-7 text-[hsl(var(--accent))]" />
            Subject Offerings &amp; Term Operations
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Hybrid model: Annual Course Contracts linking classes &amp; teachers, bridged into operational term executions
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/${tenant}/admin/academics/teacher-allocation`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <Users className="w-3.5 h-3.5" /> Teacher Allocation Matrix
          </Link>
          {terms.length > 0 && (
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[hsl(var(--accent)/0.15)] border border-[hsl(var(--accent)/0.3)] text-xs font-black text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.25)] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Generate Term Operations
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <BookMarked className="w-4 h-4 text-[hsl(var(--accent))]" /> Annual Offerings
          </div>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{totalOfferings}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Active course contracts</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <Users className="w-4 h-4 text-emerald-400" /> Total Enrolled
          </div>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{totalEnrolled}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Student subject seats</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <Clock className="w-4 h-4 text-blue-400" /> Term Operations
          </div>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">
            {termScheduledCount} <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))]">/ {termOfferings.length}</span>
          </p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Timetable active this term</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Overload Overrides
          </div>
          <p className="text-2xl font-black text-amber-400">{overloadOfferings}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Option B teacher exceptions</p>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[hsl(var(--border)/0.5)]">
          {/* Tab buttons */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] w-fit">
            <button
              onClick={() => setActiveTab('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'annual'
                  ? 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] shadow-sm'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
              }`}
            >
              Annual Course Contracts ({annualOfferings.length})
            </button>
            <button
              onClick={() => setActiveTab('term')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'term'
                  ? 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] shadow-sm'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
              }`}
            >
              Term Operations Bridge ({termOfferings.length})
            </button>
          </div>

          {/* Academic Year & Term Pickers */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
            >
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>
              ))}
            </select>

            {terms.length > 0 && (
              <select
                value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
              >
                {terms.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Search & secondary filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by subject, class, code, or teacher…"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            />
          </div>

          {streams.length > 0 && activeTab === 'annual' && (
            <select
              value={streamFilter}
              onChange={e => setStreamFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none min-w-[150px]"
            >
              <option value="">All Streams</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none min-w-[130px]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tab 1: Annual Course Contracts Table */}
      {activeTab === 'annual' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
          {loading ? (
            <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">Loading annual offerings…</div>
          ) : filteredAnnual.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <BookMarked className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto" />
              <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">No subject offerings found</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                {search || streamFilter || statusFilter
                  ? 'Try adjusting your search criteria'
                  : 'Use the Teacher Allocation Matrix to assign subjects to classes'}
              </p>
              <Link
                href={`/${tenant}/admin/academics/teacher-allocation`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                <Users className="w-3.5 h-3.5" /> Open Allocation Matrix
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] uppercase tracking-wider bg-[hsl(var(--bg-tertiary)/0.4)]">
                    <th className="py-3 px-4">Class Section</th>
                    <th className="py-3 px-4">Subject &amp; Code</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Lead Teacher</th>
                    <th className="py-3 px-4">Periods / Wk</th>
                    <th className="py-3 px-4">Enrollment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {filteredAnnual.map(offering => (
                    <tr key={offering.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[hsl(var(--text-primary))]">
                        {offering.class_name} — {offering.section_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded text-[10px]">
                            {offering.subject_code || 'SUBJ'}
                          </span>
                          <span className="font-black text-[hsl(var(--text-primary))]">{offering.subject_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            offering.requirement_type === 'elective'
                              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {offering.requirement_type || (offering.is_compulsory ? 'Core' : 'Elective')}
                          </span>
                          {offering.elective_group && (
                            <span className="text-[9px] font-bold text-[hsl(var(--text-tertiary))]">
                              ({offering.elective_group})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[hsl(var(--text-primary))]">
                            {offering.teacher_name || <span className="text-amber-400 italic font-normal">Unallocated</span>}
                          </span>
                          {offering.overload_flag && (
                            <span className="text-[8px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5" title="Option B Administrative Overload Override Active">
                              <AlertTriangle className="w-2.5 h-2.5" /> Overload
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[hsl(var(--text-primary))]">
                        {offering.periods_per_week} p/wk ({offering.duration_minutes}m)
                      </td>
                      <td className="py-3.5 px-4 text-[hsl(var(--text-secondary))]">
                        <span className="font-bold text-[hsl(var(--text-primary))]">{offering.current_enrollment ?? 0}</span>
                        {offering.enrollment_capacity ? ` / ${offering.enrollment_capacity}` : ' (unlimited)'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          offering.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {offering.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/${tenant}/admin/academics/subjects/${offering.subject_id}`}
                          className="text-[11px] font-bold text-[hsl(var(--accent))] hover:underline inline-flex items-center gap-1"
                        >
                          Dossier <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Term Operations Bridge Table */}
      {activeTab === 'term' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
          {loading ? (
            <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">Loading term operations…</div>
          ) : filteredTerm.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Clock className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto" />
              <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">No operational term offerings yet</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                Generate term offerings to bridge annual course contracts into the live term timetable.
              </p>
              <button
                onClick={() => setIsGenerateOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Generate from Annual Contracts
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] uppercase tracking-wider bg-[hsl(var(--bg-tertiary)/0.4)]">
                    <th className="py-3 px-4">Class Section</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Operational Teacher</th>
                    <th className="py-3 px-4">Term Timetable State</th>
                    <th className="py-3 px-4">Periods / Wk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {filteredTerm.map(tro => (
                    <tr key={tro.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[hsl(var(--text-primary))]">
                        {tro.class_name} — {tro.section_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded text-[10px]">
                            {tro.subject_code || 'SUBJ'}
                          </span>
                          <span className="font-black text-[hsl(var(--text-primary))]">{tro.subject_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[hsl(var(--text-primary))]">
                            {tro.teacher_name || <span className="text-amber-400 italic">Unassigned</span>}
                          </span>
                          {tro.overload_flag && (
                            <span className="text-[8px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                              ⚡ Overload
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          tro.timetable_status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tro.timetable_status === 'scheduled'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : tro.timetable_status === 'cancelled'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {tro.timetable_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[hsl(var(--text-primary))]">
                        {tro.periods_per_week} p/wk ({tro.duration_minutes}m)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          tro.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {tro.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setEditingTermOffering(tro)}
                          className="px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:border-[hsl(var(--accent))] transition-colors"
                        >
                          <Pencil className="w-3 h-3 inline mr-1" /> Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Generate Term Operations Confirmation Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[hsl(var(--accent)/0.15)]">
                <RefreshCw className="w-5 h-5 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Generate Term Operations</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Bridge year contracts into operational term execution</p>
              </div>
            </div>

            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
              This will create operational term offering records for all <strong className="text-[hsl(var(--text-primary))]">{annualOfferings.length} active subject offerings</strong> for the selected term.
              Existing term offerings will remain untouched.
            </p>

            <div className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Academic Year:</span>
                <span className="font-bold text-[hsl(var(--text-primary))]">
                  {academicYears.find(y => y.id === selectedYear)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--text-tertiary))]">Term:</span>
                <span className="font-bold text-[hsl(var(--accent))]">
                  {terms.find(t => t.id === selectedTerm)?.name || 'Selected Term'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsGenerateOpen(false)}
                className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={generating}
                onClick={handleGenerateTermOfferings}
                className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
              >
                {generating ? 'Generating…' : 'Generate Operations'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Term Offering Modal */}
      {editingTermOffering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Adjust Term Operations</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  {editingTermOffering.class_name} {editingTermOffering.section_name} · {editingTermOffering.subject_name}
                </p>
              </div>
              <button onClick={() => setEditingTermOffering(null)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))]">
                <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            <form onSubmit={handleSaveTermOffering} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Timetable Execution Status</label>
                <select
                  value={editingTermOffering.timetable_status}
                  onChange={e => setEditingTermOffering(p => p ? { ...p, timetable_status: e.target.value as any } : null)}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                >
                  <option value="scheduled">Scheduled (In Timetable)</option>
                  <option value="active">Active (Ongoing)</option>
                  <option value="draft">Draft / Unscheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Periods / Wk</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editingTermOffering.periods_per_week}
                    onChange={e => setEditingTermOffering(p => p ? { ...p, periods_per_week: parseInt(e.target.value) || 1 } : null)}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Duration (mins)</label>
                  <input
                    type="number"
                    min={20}
                    max={120}
                    value={editingTermOffering.duration_minutes}
                    onChange={e => setEditingTermOffering(p => p ? { ...p, duration_minutes: parseInt(e.target.value) || 40 } : null)}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Term Operational Notes</label>
                <textarea
                  rows={2}
                  value={editingTermOffering.notes || ''}
                  onChange={e => setEditingTermOffering(p => p ? { ...p, notes: e.target.value } : null)}
                  placeholder="e.g. Schedule adjustments, lab requirements..."
                  className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTermOffering(null)}
                  className="flex-1 h-10 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={termFormSaving}
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {termFormSaving ? 'Saving…' : 'Save Adjustments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
