'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, ArrowLeft, Search, Filter, CheckCircle2,
  AlertCircle, AlertTriangle, Check, X, Lock, Unlock,
  Sparkles, BookMarked, Layers, Clock, Users, UserCheck,
  ExternalLink, MessageSquare, ChevronRight, BookOpen
} from 'lucide-react';
import {
  getAdminElectiveSubmissions,
  reviewStudentElectives,
  batchReviewCohortElectives,
  ensureElectiveRulesAndOfferingsSeeded
} from '@/app/actions/elective-selections';
import { getCurriculumStreams, CurriculumStreamRecord } from '@/app/actions/subjects';
import { getSimpleAcademicYears } from '@/app/actions/academic-sessions';
import { ElectiveSubmissionAdminRow } from '@/lib/types/curriculum';

export default function AdminElectivesApprovalsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  // Academic Sessions & Streams
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string; is_current: boolean }[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [streams, setStreams] = useState<CurriculumStreamRecord[]>([]);

  // Submissions Data
  const [submissions, setSubmissions] = useState<ElectiveSubmissionAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // KPIs
  const [totalStudents, setTotalStudents] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [lockedCount, setLockedCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [reviewingStudent, setReviewingStudent] = useState<ElectiveSubmissionAdminRow | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);

  const [seeding, setSeeding] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Load Sessions & Streams
  useEffect(() => {
    if (!tenant) return;
    Promise.all([
      getSimpleAcademicYears(tenant),
      getCurriculumStreams(tenant)
    ]).then(([yearsRes, streamsRes]) => {
      if (yearsRes && yearsRes.length > 0) {
        setAcademicYears(yearsRes);
        const current = yearsRes.find(y => y.is_current) || yearsRes[0];
        setSelectedYear(current.id);
      }
      if (streamsRes.success) setStreams(streamsRes.data);
    });
  }, [tenant]);

  // 2. Load Submissions
  const loadSubmissions = useCallback(async () => {
    if (!tenant || !selectedYear) return;
    setLoading(true);

    const res = await getAdminElectiveSubmissions(tenant, {
      academic_year_id: selectedYear,
      stream_id: streamFilter || undefined,
      status: (statusFilter as any) || undefined,
      search: search || undefined
    });

    if (res.success) {
      setSubmissions(res.data);
      setTotalStudents(res.totalStudents);
      setSubmittedCount(res.submittedCount);
      setPendingCount(res.pendingCount);
      setApprovedCount(res.approvedCount);
      setLockedCount(res.lockedCount);
    }
    setLoading(false);
  }, [tenant, selectedYear, streamFilter, statusFilter, search]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // 3. Single Review Action (Approve / Reject)
  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingStudent) return;
    setReviewSaving(true);

    const res = await reviewStudentElectives(tenant, {
      assignment_id: reviewingStudent.assignment_id,
      student_id: reviewingStudent.student_id,
      action: reviewAction,
      review_comment: reviewComment || undefined
    });

    setReviewSaving(false);
    if (res.success) {
      showNotification(
        'success',
        `Electives ${reviewAction === 'approve' ? 'approved' : 'rejected'} for ${reviewingStudent.student_name}.`
      );
      setReviewingStudent(null);
      setReviewComment('');
      loadSubmissions();
    } else {
      showNotification('error', res.error || 'Review failed.');
    }
  };

  // 4. Batch Approve Action
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    const res = await batchReviewCohortElectives(tenant, selectedIds, 'approve');
    if (res.success) {
      showNotification('success', `Approved ${res.count} student elective packages.`);
      setSelectedIds([]);
      loadSubmissions();
    } else {
      showNotification('error', res.error || 'Batch approval failed.');
    }
  };

  // 5. Seed Electives helper
  const handleSeedElectives = async () => {
    setSeeding(true);
    const res = await ensureElectiveRulesAndOfferingsSeeded(tenant);
    setSeeding(false);
    if (res.success) {
      showNotification('success', res.message);
      loadSubmissions();
    } else {
      showNotification('error', res.error || 'Failed to seed electives.');
    }
  };

  // Select all toggle
  const handleSelectAll = () => {
    if (selectedIds.length === filteredSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubmissions.map(s => s.assignment_id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Unique classes for filtering
  const uniqueClasses = Array.from(new Set(submissions.map(s => s.class_name).filter(Boolean)));
  const filteredSubmissions = classFilter
    ? submissions.filter(s => s.class_name === classFilter)
    : submissions;

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
            <Link href={`/${tenant}/admin/academics/stream-assignments`} className="hover:text-[hsl(var(--accent))] transition-colors">
              Stream Assignments
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <BookMarked className="w-7 h-7 text-[hsl(var(--accent))]" />
            Elective Selections &amp; Approvals
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Tier 2 Faculty Electives · Review student elective choices, verify credit rules, and manage class capacity waitlists
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/${tenant}/student/electives`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Student Portal View
          </Link>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchApprove}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black shadow-md hover:opacity-95 transition-opacity"
            >
              <Check className="w-3.5 h-3.5" /> Batch Approve ({selectedIds.length})
            </button>
          )}
          <button
            onClick={handleSeedElectives}
            disabled={seeding}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent))] transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
            {seeding ? 'Configuring…' : 'Configure Elective Tracks (Demo)'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <Users className="w-4 h-4 text-[hsl(var(--accent))]" /> Total Cohort
          </div>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{totalStudents}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Assigned secondary students</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <CheckCircle2 className="w-4 h-4 text-blue-400" /> Submitted
          </div>
          <p className="text-2xl font-black text-blue-400">
            {submittedCount}{' '}
            <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))]">
              ({totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0}%)
            </span>
          </p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Packages submitted</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <Clock className="w-4 h-4 text-amber-400" /> Pending Review
          </div>
          <p className="text-2xl font-black text-amber-400">{pendingCount}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Awaiting HOD sign-off</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Approved
          </div>
          <p className="text-2xl font-black text-emerald-400">{approvedCount}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Finalized &amp; enrolled</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <Lock className="w-4 h-4 text-red-400" /> Locked Packages
          </div>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{lockedCount}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Closed to edits</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[hsl(var(--border)/0.5)]">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name or admission number…"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {academicYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none min-w-[160px]"
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Secondary Filter Pills */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))] mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          <select
            value={streamFilter}
            onChange={e => setStreamFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none"
          >
            <option value="">All Streams</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {uniqueClasses.length > 0 && (
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => <option key={c} value={c!}>{c}</option>)}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none"
          >
            <option value="all">All Submission States</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="not_submitted">Not Submitted</option>
            <option value="locked">Locked</option>
          </select>

          {(streamFilter || classFilter || statusFilter !== 'all' || search) && (
            <button
              onClick={() => { setStreamFilter(''); setClassFilter(''); setStatusFilter('all'); setSearch(''); }}
              className="text-xs font-bold text-[hsl(var(--accent))] hover:underline px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
        {loading ? (
          <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">
            <div className="inline-block w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-3" />
            <p>Loading elective submissions…</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <BookMarked className="w-12 h-12 text-[hsl(var(--text-tertiary))] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">No submissions found</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] max-w-md mx-auto">
                No students match your filter criteria. Secondary students will appear here once their stream has elective rules configured.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] uppercase tracking-wider bg-[hsl(var(--bg-tertiary)/0.4)]">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredSubmissions.length}
                      onChange={handleSelectAll}
                      className="rounded border-[hsl(var(--border))]"
                    />
                  </th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class &amp; Stream</th>
                  <th className="py-3 px-4">Chosen Elective Courses</th>
                  <th className="py-3 px-4">Package Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {filteredSubmissions.map(student => {
                  const isSelected = selectedIds.includes(student.assignment_id);
                  const isPending = student.electives_submitted && !student.electives_approved;

                  return (
                    <tr
                      key={student.assignment_id}
                      className={`hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors ${
                        isSelected ? 'bg-[hsl(var(--accent)/0.04)]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(student.assignment_id)}
                          className="rounded border-[hsl(var(--border))]"
                        />
                      </td>

                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent-hover)/0.2)] flex items-center justify-center font-black text-xs text-[hsl(var(--accent))]">
                            {(student.student_name || 'ST').split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-[hsl(var(--text-primary))]">{student.student_name}</p>
                            <p className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">
                              {student.admission_number || 'No Adm #'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Class & Stream */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[hsl(var(--text-primary))]">
                            {student.class_name} {student.section_name ? `· ${student.section_name}` : ''}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-400">
                            {student.stream_name}
                          </span>
                        </div>
                      </td>

                      {/* Chosen Electives */}
                      <td className="py-3.5 px-4">
                        {student.chosen_electives.length === 0 ? (
                          <span className="text-[11px] text-[hsl(var(--text-tertiary))] italic">
                            No electives selected yet
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {student.chosen_electives.map(e => (
                              <span
                                key={e.enrollment_id}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                                  e.waitlist_position
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : e.approval_status === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))]'
                                }`}
                              >
                                <span className="font-mono text-[9px]">{e.subject_code}</span>
                                <span>{e.subject_name}</span>
                                {e.waitlist_position && (
                                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[9px] font-black">
                                    WL #{e.waitlist_position}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          student.electives_locked
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : student.electives_approved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : student.electives_submitted
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {student.electives_locked
                            ? 'Locked'
                            : student.electives_approved
                            ? 'Approved'
                            : student.electives_submitted
                            ? 'Pending Review'
                            : 'Not Submitted'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => {
                                setReviewingStudent(student);
                                setReviewAction('approve');
                                setReviewComment('');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setReviewingStudent(student);
                              setReviewAction(student.electives_approved ? 'reject' : 'approve');
                              setReviewComment('');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--accent)/0.15)] text-xs font-bold text-[hsl(var(--text-primary))] hover:text-[hsl(var(--accent))] border border-[hsl(var(--border))] transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Decision Modal */}
      {reviewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">
                  Review Elective Package
                </h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  {reviewingStudent.student_name} ({reviewingStudent.class_name})
                </p>
              </div>
              <button onClick={() => setReviewingStudent(null)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))]">
                <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            <div className="space-y-2 p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs">
              <p className="text-[hsl(var(--text-tertiary))]">Selected Electives:</p>
              <div className="space-y-1 pt-1">
                {reviewingStudent.chosen_electives.map(e => (
                  <div key={e.enrollment_id} className="flex justify-between font-semibold">
                    <span>{e.subject_name} ({e.subject_code})</span>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{e.elective_group}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleConfirmReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approve')}
                    className={`py-2 rounded-xl border text-xs font-bold transition-colors ${
                      reviewAction === 'approve'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
                    }`}
                  >
                    Approve Package
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('reject')}
                    className={`py-2 rounded-xl border text-xs font-bold transition-colors ${
                      reviewAction === 'reject'
                        ? 'bg-red-500/10 border-red-500/40 text-red-400'
                        : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
                    }`}
                  >
                    Reject &amp; Request Resubmit
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">
                  Review Comment / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="e.g. Approved for WASSCE Science track, or prerequisite not met"
                  className="w-full p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingStudent(null)}
                  className="flex-1 h-10 rounded-2xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSaving}
                  className={`flex-1 h-10 rounded-2xl text-white text-xs font-black transition-opacity disabled:opacity-50 ${
                    reviewAction === 'approve'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-red-500 to-rose-600'
                  }`}
                >
                  {reviewSaving ? 'Saving…' : `Confirm ${reviewAction === 'approve' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
