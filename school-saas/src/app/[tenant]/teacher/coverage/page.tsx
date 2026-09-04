'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, AlertCircle, Clock, BookOpen,
  Sparkles, Check, Play, Edit3, MessageSquare, ChevronRight,
  BarChart2, Layers
} from 'lucide-react';
import {
  getCohortCoverageSummaries,
  getOfferingCoverageTree,
  logTopicProgress
} from '@/app/actions/curriculum-coverage';
import {
  OfferingCoverageSummary,
  TopicWithCoverage,
  TopicProgressStatus,
  TOPIC_PROGRESS_META
} from '@/lib/types/curriculum';

export default function TeacherCoverageLoggerPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  const [offerings, setOfferings] = useState<OfferingCoverageSummary[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [topics, setTopics] = useState<TopicWithCoverage[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [offeringInfo, setOfferingInfo] = useState<any>(null);

  const [activeNoteTopicId, setActiveNoteTopicId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Load Teacher's Offerings
  useEffect(() => {
    if (!tenant) return;
    setLoading(true);
    getCohortCoverageSummaries(tenant).then(res => {
      if (res.success && res.data.length > 0) {
        setOfferings(res.data);
        setSelectedOfferingId(res.data[0].offering_id);
      }
      setLoading(false);
    });
  }, [tenant]);

  // 2. Load Topics for Selected Offering
  const loadTopics = useCallback(async (offId: string) => {
    if (!tenant || !offId) return;
    setLoadingTopics(true);
    const res = await getOfferingCoverageTree(tenant, offId);
    if (res.success) {
      setTopics(res.topics);
      setOfferingInfo(res.offeringInfo);
    }
    setLoadingTopics(false);
  }, [tenant]);

  useEffect(() => {
    if (selectedOfferingId) {
      loadTopics(selectedOfferingId);
    }
  }, [selectedOfferingId, loadTopics]);

  // 3. Quick Status Toggle
  const handleSetStatus = async (topic: TopicWithCoverage, newStatus: TopicProgressStatus) => {
    if (!selectedOfferingId) return;
    const res = await logTopicProgress(tenant, {
      offering_id: selectedOfferingId,
      topic_id: topic.id,
      status: newStatus
    });

    if (res.success) {
      showNotification('success', `Marked "${topic.title}" as ${TOPIC_PROGRESS_META[newStatus].label}.`);
      loadTopics(selectedOfferingId);
    } else {
      showNotification('error', res.error || 'Failed to update topic.');
    }
  };

  // 4. Save Lesson Note
  const handleSaveNote = async (topic: TopicWithCoverage) => {
    if (!selectedOfferingId) return;
    setSavingNote(true);

    const res = await logTopicProgress(tenant, {
      offering_id: selectedOfferingId,
      topic_id: topic.id,
      status: topic.status === 'planned' ? 'started' : topic.status,
      notes: noteInput
    });

    setSavingNote(false);
    if (res.success) {
      showNotification('success', 'Lesson reflection saved.');
      setActiveNoteTopicId(null);
      setNoteInput('');
      loadTopics(selectedOfferingId);
    } else {
      showNotification('error', res.error || 'Failed to save note.');
    }
  };

  const activeOffering = offerings.find(o => o.offering_id === selectedOfferingId);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in w-full pb-20">
      {/* Toast */}
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
            <Link href={`/${tenant}/teacher`} className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Teacher Dashboard
            </Link>
            <span>/</span>
            <span className="text-[hsl(var(--text-secondary))]">Lesson Delivery Logger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[hsl(var(--accent))]" />
            Classroom Lesson &amp; Syllabus Logger
          </h1>
          <p className="text-xs text-[hsl(var(--text-secondary))]">
            Record delivered curriculum milestones, mark completed topics, and log pedagogy reflections
          </p>
        </div>

        <Link
          href={`/${tenant}/admin/academics/coverage`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] transition-colors"
        >
          <BarChart2 className="w-3.5 h-3.5" /> Admin Pacing Console
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">
          <div className="inline-block w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-3" />
          <p>Loading course assignments…</p>
        </div>
      ) : offerings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3 border border-[hsl(var(--border))]">
          <BookOpen className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto" />
          <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">No Active Course Offerings</h3>
          <p className="text-xs text-[hsl(var(--text-secondary))] max-w-md mx-auto">
            You are not currently assigned as lead instructor to any course offerings in this academic session.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Course Selector Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {offerings.map(off => {
              const isSelected = off.offering_id === selectedOfferingId;
              return (
                <button
                  key={off.offering_id}
                  onClick={() => setSelectedOfferingId(off.offering_id)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                    isSelected
                      ? 'bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))] shadow-md'
                      : 'bg-[hsl(var(--bg-tertiary)/0.6)] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)]'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-80">{off.subject_code}</span>
                  <span>{off.subject_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20' : 'bg-[hsl(var(--bg-secondary))]'
                  }`}>
                    {off.coverage_percentage}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Course Banner & Pacing Summary */}
          {activeOffering && (
            <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--bg-secondary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--accent)/0.05)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded">
                      {activeOffering.subject_code}
                    </span>
                    <h2 className="text-base font-black text-[hsl(var(--text-primary))]">
                      {activeOffering.subject_name}
                    </h2>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                    {activeOffering.class_name} {activeOffering.section_name ? `(${activeOffering.section_name})` : ''} · {activeOffering.periods_per_week} periods/week
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-black text-[hsl(var(--text-primary))]">
                      {activeOffering.completed_topics} of {activeOffering.total_topics} Topics Delivered
                    </p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      {activeOffering.coverage_percentage}% Syllabus Covered
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex items-center justify-center font-black text-sm text-[hsl(var(--accent))]">
                    {activeOffering.coverage_percentage}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Topics Feed */}
          {loadingTopics ? (
            <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">
              <div className="inline-block w-6 h-6 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading syllabus topics…</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center space-y-2 border border-[hsl(var(--border))]">
              <BookOpen className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
              <p className="text-xs font-bold text-[hsl(var(--text-primary))]">No syllabus topics found for this course</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map(topic => {
                const isCompleted = topic.status === 'completed';
                const isStarted = topic.status === 'started';
                const statusMeta = TOPIC_PROGRESS_META[topic.status] || TOPIC_PROGRESS_META.planned;
                const isEditingNote = activeNoteTopicId === topic.id;

                return (
                  <div
                    key={topic.id}
                    className={`p-4 rounded-3xl border transition-all space-y-3 ${
                      isCompleted
                        ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                        : isStarted
                        ? 'bg-blue-500/[0.04] border-blue-500/30'
                        : 'bg-[hsl(var(--bg-tertiary)/0.4)] border-[hsl(var(--border))]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[10px] font-bold text-[hsl(var(--text-secondary))] flex items-center justify-center">
                            {topic.sequence}
                          </span>
                          <h3 className="text-xs sm:text-sm font-black text-[hsl(var(--text-primary))]">
                            {topic.title}
                          </h3>
                          {topic.term && (
                            <span className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-secondary))] px-1.5 py-0.2 rounded">
                              Term {topic.term}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                          Duration: {topic.estimated_periods} periods
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isCompleted ? (
                          <button
                            onClick={() => handleSetStatus(topic, 'planned')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Completed
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSetStatus(topic, 'completed')}
                            className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-secondary))] hover:bg-emerald-500/10 text-[hsl(var(--text-secondary))] hover:text-emerald-400 border border-[hsl(var(--border))] hover:border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (isEditingNote) {
                              setActiveNoteTopicId(null);
                            } else {
                              setActiveNoteTopicId(topic.id);
                              setNoteInput(topic.notes || '');
                            }
                          }}
                          className={`p-1.5 rounded-xl border text-xs font-bold transition-colors ${
                            topic.notes
                              ? 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.3)]'
                              : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]'
                          }`}
                          title="Add lesson reflection"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Learning outcomes preview */}
                    {topic.outcomes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {topic.outcomes.map(lo => (
                          <span
                            key={lo.id}
                            className="text-[9px] text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-secondary))] px-2 py-0.5 rounded border border-[hsl(var(--border)/0.5)]"
                          >
                            {lo.description}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reflection Note display / inline editor */}
                    {isEditingNote ? (
                      <div className="pt-2 space-y-2 border-t border-[hsl(var(--border)/0.5)]">
                        <textarea
                          rows={2}
                          value={noteInput}
                          onChange={e => setNoteInput(e.target.value)}
                          placeholder="Record notes on student understanding, homework assigned, or areas to recap…"
                          className="w-full p-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveNoteTopicId(null)}
                            className="px-3 py-1 rounded-xl text-xs font-bold text-[hsl(var(--text-tertiary))]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={savingNote}
                            onClick={() => handleSaveNote(topic)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-sm disabled:opacity-50"
                          >
                            {savingNote ? 'Saving…' : 'Save Reflection'}
                          </button>
                        </div>
                      </div>
                    ) : topic.notes ? (
                      <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-secondary)/0.6)] border border-[hsl(var(--border)/0.4)] text-[11px] text-[hsl(var(--text-secondary))] flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[hsl(var(--accent))] flex-shrink-0 mt-0.5" />
                        <p className="italic">{topic.notes}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
