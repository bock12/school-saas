'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, ArrowLeft, CheckCircle2, AlertCircle, AlertTriangle,
  Lock, Sparkles, BookMarked, Users, Check, Clock, ChevronRight,
  ShieldCheck, RefreshCw, Layers, BookOpen, Info
} from 'lucide-react';
import {
  getStudentElectivePackage,
  submitStudentElectives,
  ensureElectiveRulesAndOfferingsSeeded
} from '@/app/actions/elective-selections';
import { getStudentStreamAssignments } from '@/app/actions/stream-assignments';
import {
  StudentElectivePackage,
  StreamElectiveGroupOption,
  ElectiveSubjectOption
} from '@/lib/types/curriculum';

export default function StudentElectiveSelectionPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  const [studentPkg, setStudentPkg] = useState<StudentElectivePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Student selector for demo/testing across different students
  const [cohortStudents, setCohortStudents] = useState<Array<{ student_id: string; student_name: string; class_name?: string }>>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Selected elective offerings: Map of groupName -> array of offering IDs
  const [selectionsByGroup, setSelectionsByGroup] = useState<Record<string, string[]>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. Initial Load: Fetch cohort students to allow instant switching
  useEffect(() => {
    if (!tenant) return;
    getStudentStreamAssignments(tenant).then(res => {
      if (res.success && res.data.length > 0) {
        setCohortStudents(res.data.map(s => ({
          student_id: s.student_id,
          student_name: s.student_name || 'Student',
          class_name: s.class_name
        })));
        if (!selectedStudentId) {
          setSelectedStudentId(res.data[0].student_id);
        }
      }
    });
  }, [tenant]);

  // 2. Load Student Elective Package
  const loadPackage = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);

    const res = await getStudentElectivePackage(tenant, selectedStudentId || undefined);
    if (res.success && res.data) {
      setStudentPkg(res.data);
      // Initialize selectionsByGroup from existing enrolled electives
      const initialMap: Record<string, string[]> = {};
      for (const grp of res.data.elective_groups) {
        initialMap[grp.elective_group] = grp.options
          .filter(opt => res.data!.selected_offering_ids.includes(opt.offering_id))
          .map(opt => opt.offering_id);
      }
      setSelectionsByGroup(initialMap);
    } else {
      setStudentPkg(null);
    }
    setLoading(false);
  }, [tenant, selectedStudentId]);

  useEffect(() => {
    loadPackage();
  }, [loadPackage]);

  // 3. Handle Option Toggle
  const handleToggleOption = (group: StreamElectiveGroupOption, opt: ElectiveSubjectOption) => {
    if (studentPkg?.electives_locked) {
      showNotification('error', 'Elective selections are locked and cannot be modified.');
      return;
    }

    const currentPicks = selectionsByGroup[group.elective_group] || [];
    const isSelected = currentPicks.includes(opt.offering_id);

    if (isSelected) {
      // Deselect
      setSelectionsByGroup(prev => ({
        ...prev,
        [group.elective_group]: prev[group.elective_group].filter(id => id !== opt.offering_id)
      }));
    } else {
      // Check max_selections
      if (group.max_selections === 1) {
        // Radio behavior: replace existing selection
        setSelectionsByGroup(prev => ({
          ...prev,
          [group.elective_group]: [opt.offering_id]
        }));
      } else {
        // Checkbox behavior
        if (currentPicks.length >= group.max_selections) {
          showNotification(
            'error',
            `You can select at most ${group.max_selections} subject(s) in ${group.elective_group}.`
          );
          return;
        }
        setSelectionsByGroup(prev => ({
          ...prev,
          [group.elective_group]: [...(prev[group.elective_group] || []), opt.offering_id]
        }));
      }
    }
  };

  // 4. Validate All Requirements
  const validateForm = (): { valid: boolean; message?: string } => {
    if (!studentPkg) return { valid: false, message: 'No student package loaded.' };
    if (studentPkg.elective_groups.length === 0) return { valid: true };

    for (const grp of studentPkg.elective_groups) {
      const picks = selectionsByGroup[grp.elective_group] || [];
      if (picks.length < grp.min_selections) {
        return {
          valid: false,
          message: `Please select at least ${grp.min_selections} subject in ${grp.elective_group}.`
        };
      }
      if (picks.length > grp.max_selections) {
        return {
          valid: false,
          message: `You selected too many subjects in ${grp.elective_group} (max ${grp.max_selections}).`
        };
      }
    }
    return { valid: true };
  };

  // 5. Submit Selections
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentPkg) return;

    const val = validateForm();
    if (!val.valid) {
      showNotification('error', val.message || 'Please complete all required selections.');
      return;
    }

    setSubmitting(true);
    // Flatten selections
    const flatSelections: Array<{ offering_id: string; elective_group: string }> = [];
    for (const [groupName, offeringIds] of Object.entries(selectionsByGroup)) {
      for (const offId of offeringIds) {
        flatSelections.push({ offering_id: offId, elective_group: groupName });
      }
    }

    const res = await submitStudentElectives(tenant, {
      student_id: studentPkg.student_id,
      academic_year_id: studentPkg.academic_year_id,
      selections: flatSelections
    });

    setSubmitting(false);
    if (res.success) {
      showNotification('success', res.message || 'Electives submitted successfully!');
      loadPackage();
    } else {
      showNotification('error', res.error || 'Failed to submit electives.');
    }
  };

  // 6. Seed Elective Offerings Helper
  const handleSeedElectives = async () => {
    setSeeding(true);
    const res = await ensureElectiveRulesAndOfferingsSeeded(tenant);
    setSeeding(false);
    if (res.success) {
      showNotification('success', res.message);
      loadPackage();
    } else {
      showNotification('error', res.error || 'Failed to initialize electives.');
    }
  };

  const validationState = validateForm();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in w-full pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : notification.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.msg}
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[hsl(var(--border))]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))] mb-1">
            <Link href={`/${tenant}/student`} className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Student Portal
            </Link>
            <span>/</span>
            <span className="text-[hsl(var(--text-secondary))]">Electives Registration</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-[hsl(var(--accent))]" />
            Curriculum Elective Selection
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Tier 2 Faculty Electives · Choose your stream elective courses for the academic session
          </p>
        </div>

        {/* Demo Student Switcher */}
        {cohortStudents.length > 0 && (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] hidden sm:inline">
              Student View:
            </span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="h-10 px-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            >
              {cohortStudents.map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_name} ({s.class_name || 'Secondary'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">
          <div className="inline-block w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-3" />
          <p>Loading your curriculum package &amp; elective rules…</p>
        </div>
      ) : !studentPkg ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-[hsl(var(--border))]">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-black text-[hsl(var(--text-primary))]">
              No Active Stream Assignment Found
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] max-w-md mx-auto">
              You must be assigned to an academic stream (Science, Arts, or Commercial) before you can register electives. Please contact your academic dean.
            </p>
          </div>
          <Link
            href={`/${tenant}/admin/academics/stream-assignments`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--accent))]"
          >
            Go to Stream Assignment Console
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Student Banner Card */}
          <div className="glass-card rounded-3xl p-6 border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--bg-secondary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--accent)/0.05)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-base flex items-center justify-center shadow-md">
                  {studentPkg.student_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[hsl(var(--text-primary))]">
                    {studentPkg.student_name}
                  </h2>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] font-mono">
                    Adm: {studentPkg.admission_number || 'Cohort'} · {studentPkg.class_name} {studentPkg.section_name ? `(${studentPkg.section_name})` : ''}
                  </p>
                </div>
              </div>

              {/* Stream Track & Status Badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-black uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  {studentPkg.stream_name}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold ${
                  studentPkg.electives_locked
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : studentPkg.electives_approved
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : studentPkg.electives_submitted
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {studentPkg.electives_locked ? (
                    <>
                      <Lock className="w-3 h-3 text-red-400" /> Locked by Admin
                    </>
                  ) : studentPkg.electives_approved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approved &amp; Enrolled
                    </>
                  ) : studentPkg.electives_submitted ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> Submitted · Pending Review
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Selection Pending
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Tier 1: Auto-Enrolled Core Subjects Preview */}
          <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--text-primary))]">
                  Tier 1: Mandatory Core Curriculum ({studentPkg.core_subjects.length} Subjects)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Auto-Enrolled via Engine
              </span>
            </div>

            <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
              These foundation subjects are mandatory for all students in the <strong className="text-[hsl(var(--text-primary))]">{studentPkg.stream_name}</strong> track. They have already been assigned to your timetable schedule.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {studentPkg.core_subjects.map(cs => (
                <div
                  key={cs.enrollment_id}
                  className="p-3 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border)/0.6)] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.2 rounded">
                        {cs.subject_code}
                      </span>
                      <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">
                        {cs.subject_name}
                      </p>
                    </div>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">
                      {cs.periods_per_week || 4} p/wk · {cs.teacher_name || 'Faculty assigned'}
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2: Stream Elective Selection Groups */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-[hsl(var(--accent))]" />
                  Tier 2: Stream Electives Selection
                </h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Choose your optional subjects adhering to the credit limits for each faculty group
                </p>
              </div>

              {studentPkg.elective_groups.length === 0 && (
                <button
                  onClick={handleSeedElectives}
                  disabled={seeding}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {seeding ? 'Initializing…' : 'Initialize Elective Offerings (Demo)'}
                </button>
              )}
            </div>

            {studentPkg.elective_groups.length === 0 ? (
              <div className="glass-card rounded-3xl p-10 text-center space-y-3 border border-[hsl(var(--border))]">
                <BookOpen className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
                <h4 className="text-xs font-bold text-[hsl(var(--text-primary))]">No Elective Groups Configured</h4>
                <p className="text-[11px] text-[hsl(var(--text-secondary))] max-w-sm mx-auto">
                  There are currently no elective subject rules set up for this stream. Click the button above to seed standard WAEC/Sierra Leone elective tracks.
                </p>
              </div>
            ) : (
              studentPkg.elective_groups.map(group => {
                const picks = selectionsByGroup[group.elective_group] || [];
                const isSatisfied = picks.length >= group.min_selections && picks.length <= group.max_selections;

                return (
                  <div
                    key={group.elective_group}
                    className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[hsl(var(--border)/0.5)]">
                      <div className="space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-black text-[hsl(var(--text-primary))]">
                          {group.elective_group}
                        </h4>
                        <p className="text-[11px] text-[hsl(var(--text-secondary))]">
                          {group.min_selections === group.max_selections
                            ? `Select exactly ${group.min_selections} subject`
                            : `Select ${group.min_selections} to ${group.max_selections} subjects`}
                        </p>
                      </div>

                      {/* Group Progress Status */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSatisfied
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {isSatisfied ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {picks.length} of {group.max_selections} selected
                      </span>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.options.map(opt => {
                        const isSelected = picks.includes(opt.offering_id);
                        const isFull = opt.is_full;

                        return (
                          <div
                            key={opt.offering_id}
                            onClick={() => handleToggleOption(group, opt)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-3 ${
                              isSelected
                                ? 'bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent))] shadow-md'
                                : 'bg-[hsl(var(--bg-tertiary)/0.4)] border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)]'
                            } ${studentPkg.electives_locked ? 'opacity-75 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 min-w-0">
                                <span className="font-mono text-[10px] font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded">
                                  {opt.subject_code}
                                </span>
                                <p className="text-xs font-black text-[hsl(var(--text-primary))]">
                                  {opt.subject_name}
                                </p>
                              </div>

                              {/* Selection Indicator */}
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-[hsl(var(--accent))] text-white'
                                  : 'border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>

                            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                              {opt.periods_per_week} p/wk · Teacher: {opt.teacher_name || 'Assigned in cohort'}
                            </p>

                            {/* Capacity Bar */}
                            <div className="space-y-1 pt-1 border-t border-[hsl(var(--border)/0.4)]">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-[hsl(var(--text-tertiary))]">Seat Capacity:</span>
                                <span className={`font-bold ${isFull ? 'text-amber-400' : 'text-[hsl(var(--text-secondary))]'}`}>
                                  {opt.enrolled_count} / {opt.capacity} seats
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[hsl(var(--bg-secondary))] overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isFull ? 'bg-amber-400' : 'bg-[hsl(var(--accent))]'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, Math.round((opt.enrolled_count / opt.capacity) * 100))}%`
                                  }}
                                />
                              </div>
                              {isFull && !isSelected && (
                                <p className="text-[9px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Class full: waitlist seat will be requested
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Submission Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-[hsl(var(--bg-secondary)/0.92)] backdrop-blur-md border-t border-[hsl(var(--border))] px-4 py-3.5 shadow-2xl">
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                {validationState.valid ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> All elective requirements satisfied
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <AlertCircle className="w-4 h-4" /> {validationState.message}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !validationState.valid || studentPkg.electives_locked}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black shadow-lg hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {submitting
                    ? 'Submitting…'
                    : studentPkg.electives_submitted
                    ? 'Update Elective Choices'
                    : 'Submit Electives Package'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
