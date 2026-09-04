'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Search, Filter, CheckCircle2, AlertCircle, AlertTriangle,
  Clock, Sparkles, BookOpen, Layers, Users, ExternalLink, Calendar,
  TrendingUp, Check, Play, Pause, RotateCcw, FileText, ChevronRight,
  ShieldCheck, Award, BarChart3, Edit3, X, MessageSquare
} from 'lucide-react';
import {
  getCohortCoverageSummaries,
  getOfferingCoverageTree,
  logTopicProgress,
  seedSampleCurriculumCoverage
} from '@/app/actions/curriculum-coverage';
import { getSimpleAcademicYears } from '@/app/actions/academic-sessions';
import {
  OfferingCoverageSummary,
  TopicWithCoverage,
  TopicProgressStatus,
  TOPIC_PROGRESS_META
} from '@/lib/types/curriculum';

export default function AdminCurriculumCoveragePage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  // Academic Years
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string; is_current: boolean }[]>([]);
  const [selectedYear, setSelectedYear] = useState('');

  // Course Offerings
  const [offerings, setOfferings] = useState<OfferingCoverageSummary[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);

  // KPIs
  const [totalOfferings, setTotalOfferings] = useState(0);
  const [averageCoverage, setAverageCoverage] = useState(0);
  const [onTrackCount, setOnTrackCount] = useState(0);
  const [behindCount, setBehindCount] = useState(0);
  const [completedTopicsTotal, setCompletedTopicsTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [pacingFilter, setPacingFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Selected Offering Detail
  const [offeringDetail, setOfferingDetail] = useState<{
    offeringInfo?: any;
    topics: TopicWithCoverage[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTermTab, setActiveTermTab] = useState<number | 'all'>('all');

  // Topic Edit Modal
  const [editingTopic, setEditingTopic] = useState<TopicWithCoverage | null>(null);
  const [editStatus, setEditStatus] = useState<TopicProgressStatus>('completed');
  const [editNotes, setEditNotes] = useState('');
  const [savingTopic, setSavingTopic] = useState(false);

  const [seeding, setSeeding] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Load Academic Years
  useEffect(() => {
    if (!tenant) return;
    getSimpleAcademicYears(tenant).then(res => {
      if (res && res.length > 0) {
        setAcademicYears(res);
        const cur = res.find(y => y.is_current) || res[0];
        setSelectedYear(cur.id);
      }
    });
  }, [tenant]);

  // 2. Load Offerings Coverage Summary
  const loadOfferings = useCallback(async () => {
    if (!tenant || !selectedYear) return;
    setLoadingOfferings(true);

    const res = await getCohortCoverageSummaries(tenant, {
      academic_year_id: selectedYear,
      search: search || undefined
    });

    if (res.success) {
      setOfferings(res.data);
      setTotalOfferings(res.totalOfferings);
      setAverageCoverage(res.averageCoverage);
      setOnTrackCount(res.onTrackCount);
      setBehindCount(res.behindCount);
      setCompletedTopicsTotal(res.completedTopicsTotal);

      // Auto-select first offering if none selected
      if (!selectedOfferingId && res.data.length > 0) {
        setSelectedOfferingId(res.data[0].offering_id);
      }
    }
    setLoadingOfferings(false);
  }, [tenant, selectedYear, search, selectedOfferingId]);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  // 3. Load Detail for Selected Offering
  const loadDetail = useCallback(async (offId: string) => {
    if (!tenant || !offId) return;
    setLoadingDetail(true);

    const termNum = activeTermTab === 'all' ? undefined : activeTermTab;
    const res = await getOfferingCoverageTree(tenant, offId, termNum);

    if (res.success) {
      setOfferingDetail({
        offeringInfo: res.offeringInfo,
        topics: res.topics
      });
    } else {
      setOfferingDetail(null);
    }
    setLoadingDetail(false);
  }, [tenant, activeTermTab]);

  useEffect(() => {
    if (selectedOfferingId) {
      loadDetail(selectedOfferingId);
    }
  }, [selectedOfferingId, loadDetail]);

  // 4. Quick Status Change on Topic
  const handleQuickStatusChange = async (topic: TopicWithCoverage, newStatus: TopicProgressStatus) => {
    if (!selectedOfferingId) return;

    const res = await logTopicProgress(tenant, {
      offering_id: selectedOfferingId,
      topic_id: topic.id,
      status: newStatus
    });

    if (res.success) {
      showNotification('success', `Topic marked as ${TOPIC_PROGRESS_META[newStatus].label}.`);
      loadDetail(selectedOfferingId);
      loadOfferings();
    } else {
      showNotification('error', res.error || 'Failed to update topic status.');
    }
  };

  // 5. Save Modal (with notes)
  const handleSaveTopicNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferingId || !editingTopic) return;
    setSavingTopic(true);

    const res = await logTopicProgress(tenant, {
      offering_id: selectedOfferingId,
      topic_id: editingTopic.id,
      status: editStatus,
      notes: editNotes
    });

    setSavingTopic(false);
    if (res.success) {
      showNotification('success', 'Progress and lesson reflection saved.');
      setEditingTopic(null);
      loadDetail(selectedOfferingId);
      loadOfferings();
    } else {
      showNotification('error', res.error || 'Failed to save topic progress.');
    }
  };

  // 6. Seed Sample Syllabi Helper
  const handleSeedTopics = async () => {
    setSeeding(true);
    const res = await seedSampleCurriculumCoverage(tenant);
    setSeeding(false);
    if (res.success) {
      showNotification('success', res.message);
      loadOfferings();
      if (selectedOfferingId) loadDetail(selectedOfferingId);
    } else {
      showNotification('error', res.error || 'Failed to seed sample coverage.');
    }
  };

  // Filter offerings
  const uniqueClasses = Array.from(new Set(offerings.map(o => o.class_name).filter(Boolean)));
  const filteredOfferings = offerings.filter(o => {
    if (pacingFilter !== 'all' && o.pacing_status !== pacingFilter) return false;
    if (classFilter !== 'all' && o.class_name !== classFilter) return false;
    return true;
  });

  const activeOffering = offerings.find(o => o.offering_id === selectedOfferingId);

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto animate-fade-in w-full pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold transition-all ${
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
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))] mb-1">
            <Link href={`/${tenant}/admin/academics`} className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Academic Hub
            </Link>
            <span>/</span>
            <Link href={`/${tenant}/admin/academics/curriculum`} className="hover:text-[hsl(var(--accent))] transition-colors">
              Curriculum Syllabi
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[hsl(var(--accent))]" />
            Curriculum Coverage &amp; Pacing
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Phase 8 Delivery Engine · Monitor syllabus completion percentages, track teacher lesson logs, and identify pacing deficits
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/${tenant}/teacher/coverage`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Teacher Logger View
          </Link>
          <button
            onClick={handleSeedTopics}
            disabled={seeding}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {seeding ? 'Seeding Syllabi…' : 'Seed Syllabi Topics & Logs (Demo)'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <BookOpen className="w-4 h-4 text-[hsl(var(--accent))]" /> Active Courses
          </div>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{totalOfferings}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Subject offerings tracked</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Avg Coverage
          </div>
          <p className="text-2xl font-black text-emerald-400">{averageCoverage}%</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Across all cohorts</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> On Track / Ahead
          </div>
          <p className="text-2xl font-black text-emerald-400">{onTrackCount}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Meeting syllabus pace</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Behind Pace
          </div>
          <p className="text-2xl font-black text-amber-400">{behindCount}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Requires pacing intervention</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <Award className="w-4 h-4 text-blue-400" /> Completed Topics
          </div>
          <p className="text-2xl font-black text-blue-400">{completedTopicsTotal}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Delivered lesson units</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Offerings List (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-4">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[hsl(var(--border)/0.5)]">
            <h3 className="text-sm font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[hsl(var(--accent))]" /> Class Offerings Directory
            </h3>
            <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">
              {filteredOfferings.length} courses
            </span>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subject or class…"
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={pacingFilter}
                onChange={e => setPacingFilter(e.target.value)}
                className="flex-1 h-8 px-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[11px] font-bold text-[hsl(var(--text-secondary))] focus:outline-none"
              >
                <option value="all">All Pacing States</option>
                <option value="on_track">On Track</option>
                <option value="behind">Behind Pace</option>
                <option value="ahead">Ahead</option>
              </select>

              {uniqueClasses.length > 0 && (
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="flex-1 h-8 px-2.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[11px] font-bold text-[hsl(var(--text-secondary))] focus:outline-none"
                >
                  <option value="all">All Classes</option>
                  {uniqueClasses.map(c => <option key={c} value={c!}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Offerings Scroll List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {loadingOfferings ? (
              <div className="p-8 text-center text-xs text-[hsl(var(--text-tertiary))]">
                <div className="inline-block w-6 h-6 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-2" />
                <p>Loading course offerings…</p>
              </div>
            ) : filteredOfferings.length === 0 ? (
              <div className="p-8 text-center text-xs text-[hsl(var(--text-tertiary))]">
                No offerings match the filter.
              </div>
            ) : (
              filteredOfferings.map(off => {
                const isSelected = off.offering_id === selectedOfferingId;

                return (
                  <div
                    key={off.offering_id}
                    onClick={() => setSelectedOfferingId(off.offering_id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none space-y-2 ${
                      isSelected
                        ? 'bg-[hsl(var(--accent)/0.08)] border-[hsl(var(--accent))] shadow-sm'
                        : 'bg-[hsl(var(--bg-tertiary)/0.3)] border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.2 rounded">
                            {off.subject_code}
                          </span>
                          <p className="text-xs font-black text-[hsl(var(--text-primary))] truncate">
                            {off.subject_name}
                          </p>
                        </div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">
                          {off.class_name} {off.section_name ? `(${off.section_name})` : ''} · {off.teacher_name}
                        </p>
                      </div>

                      {/* Pacing Badge */}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        off.pacing_status === 'ahead'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : off.pacing_status === 'on_track'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {off.pacing_status === 'behind' ? 'Behind' : off.pacing_status === 'ahead' ? 'Ahead' : 'On Track'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[hsl(var(--text-tertiary))]">
                          {off.completed_topics} / {off.total_topics} Topics
                        </span>
                        <span className="font-black text-[hsl(var(--text-primary))]">
                          {off.coverage_percentage}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[hsl(var(--bg-secondary))] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            off.pacing_status === 'behind'
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${off.coverage_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Syllabus Milestone Tree & Logger (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-[hsl(var(--border))] space-y-5">
          {activeOffering ? (
            <>
              {/* Selected Offering Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(var(--border))]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded">
                      {activeOffering.subject_code}
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-[hsl(var(--text-primary))]">
                      {activeOffering.subject_name}
                    </h2>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                    {activeOffering.class_name} {activeOffering.section_name ? `· ${activeOffering.section_name}` : ''} · Instructor: <strong className="text-[hsl(var(--text-secondary))]">{activeOffering.teacher_name}</strong> ({activeOffering.periods_per_week} p/wk)
                  </p>
                </div>

                {/* Term Tab Buttons */}
                <div className="flex items-center gap-1 bg-[hsl(var(--bg-tertiary))] p-1 rounded-2xl border border-[hsl(var(--border))]">
                  {(['all', 1, 2, 3] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTermTab(t)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        activeTermTab === t
                          ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                          : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                      }`}
                    >
                      {t === 'all' ? 'All' : `Term ${t}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics List */}
              {loadingDetail ? (
                <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">
                  <div className="inline-block w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-3" />
                  <p>Loading syllabus milestones &amp; coverage logs…</p>
                </div>
              ) : !offeringDetail || offeringDetail.topics.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto" />
                  <h4 className="text-xs font-bold text-[hsl(var(--text-primary))]">
                    No Topics Defined for this Term
                  </h4>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] max-w-sm mx-auto">
                    Click "Seed Syllabi Topics &amp; Logs" at the top to populate standard WAEC syllabus topic trees.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offeringDetail.topics.map(topic => {
                    const statusMeta = TOPIC_PROGRESS_META[topic.status] || TOPIC_PROGRESS_META.planned;

                    return (
                      <div
                        key={topic.id}
                        className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] transition-all space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="w-5 h-5 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[10px] font-bold text-[hsl(var(--text-secondary))] flex items-center justify-center flex-shrink-0">
                                {topic.sequence}
                              </span>
                              <h4 className="text-xs sm:text-sm font-black text-[hsl(var(--text-primary))]">
                                {topic.title}
                              </h4>
                              {topic.term && (
                                <span className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-secondary))] px-1.5 py-0.2 rounded">
                                  Term {topic.term}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                              Estimated duration: {topic.estimated_periods} periods
                            </p>
                          </div>

                          {/* Status Badge & Actions */}
                          <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${statusMeta.badgeClass}`}>
                              {topic.status === 'completed' && <Check className="w-3 h-3 text-emerald-400" />}
                              {topic.status === 'started' && <Play className="w-3 h-3 text-blue-400" />}
                              {topic.status === 'deferred' && <Clock className="w-3 h-3 text-amber-400" />}
                              {statusMeta.label}
                            </span>

                            {/* Quick Action: Mark Completed */}
                            {topic.status !== 'completed' && (
                              <button
                                onClick={() => handleQuickStatusChange(topic, 'completed')}
                                title="Mark topic completed"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Quick Action: Start Topic */}
                            {topic.status === 'planned' && (
                              <button
                                onClick={() => handleQuickStatusChange(topic, 'started')}
                                title="Start topic"
                                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit / Notes Button */}
                            <button
                              onClick={() => {
                                setEditingTopic(topic);
                                setEditStatus(topic.status);
                                setEditNotes(topic.notes || '');
                              }}
                              title="Add lesson reflection & notes"
                              className="p-1.5 rounded-lg bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] border border-[hsl(var(--border))] transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Learning Outcomes */}
                        {topic.outcomes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {topic.outcomes.map(lo => (
                              <span
                                key={lo.id}
                                className="text-[9px] font-medium text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-secondary))] px-2 py-0.5 rounded-md border border-[hsl(var(--border)/0.5)]"
                              >
                                <strong className="text-[hsl(var(--accent))]">{lo.code || 'LO'}:</strong> {lo.description}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Teacher Lesson Reflection Notes Preview */}
                        {topic.notes && (
                          <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-secondary)/0.8)] border border-[hsl(var(--border)/0.6)] text-[11px] text-[hsl(var(--text-secondary))] flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-[hsl(var(--accent))] flex-shrink-0 mt-0.5" />
                            <p className="italic">{topic.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">
              Select an offering from the directory on the left to inspect its syllabus tree and lesson logs.
            </div>
          )}
        </div>
      </div>

      {/* Edit Topic Progress & Lesson Reflection Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">
                  Log Syllabus Topic Progress
                </h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] truncate max-w-xs">
                  {editingTopic.title}
                </p>
              </div>
              <button onClick={() => setEditingTopic(null)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))]">
                <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            <form onSubmit={handleSaveTopicNote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Coverage Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['planned', 'started', 'completed', 'deferred', 'skipped', 'revised'] as const).map(st => {
                    const isSelected = editStatus === st;
                    const meta = TOPIC_PROGRESS_META[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditStatus(st)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors ${
                          isSelected
                            ? 'bg-[hsl(var(--accent)/0.15)] border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                            : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">
                  Teacher Reflection / Lesson Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Record pedagogy notes, laboratory observations, or topics requiring revision next period…"
                  className="w-full p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="flex-1 h-10 rounded-2xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTopic}
                  className="flex-1 h-10 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black transition-opacity disabled:opacity-50"
                >
                  {savingTopic ? 'Saving…' : 'Save Progress & Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
