'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, ArrowLeft, Search, Filter, RefreshCw,
  Users, CheckCircle2, AlertCircle, AlertTriangle, Check,
  X, ChevronRight, Lock, Unlock, Sparkles, SlidersHorizontal,
  BookMarked, Layers, Shield, FileText, ArrowRight, UserCheck
} from 'lucide-react';
import {
  getStudentStreamAssignments,
  assignStudentToStream,
  batchAssignStudentsToStream,
  getStudentSubjectEnrollments,
  updateElectiveStatus,
  syncStreamCoreEnrollments,
  seedSampleStudentsAndStreams
} from '@/app/actions/stream-assignments';
import { getCurriculumStreams, CurriculumStreamRecord } from '@/app/actions/subjects';
import { getSimpleAcademicYears } from '@/app/actions/academic-sessions';
import {
  StudentStreamAssignmentRecord,
  StudentEnrolledSubjectDetail
} from '@/lib/types/curriculum';

export default function StudentStreamAssignmentsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  // Academic Sessions & Streams
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string; is_current: boolean }[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [streams, setStreams] = useState<CurriculumStreamRecord[]>([]);

  // Students & Assignments
  const [students, setStudents] = useState<StudentStreamAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // KPIs
  const [totalCount, setTotalCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [electiveFilter, setElectiveFilter] = useState('');

  // Modals & Drawers
  const [assigningStudent, setAssigningStudent] = useState<StudentStreamAssignmentRecord | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchStreamId, setBatchStreamId] = useState('');
  const [batchSaving, setBatchSaving] = useState(false);

  const [inspectingStudent, setInspectingStudent] = useState<StudentStreamAssignmentRecord | null>(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState<StudentEnrolledSubjectDetail[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Initial Load of Sessions & Streams
  useEffect(() => {
    if (!tenant) return;
    Promise.all([
      getSimpleAcademicYears(tenant),
      getCurriculumStreams(tenant),
    ]).then(([yearsRes, streamsRes]) => {
      if (yearsRes && yearsRes.length > 0) {
        setAcademicYears(yearsRes);
        const current = yearsRes.find(y => y.is_current) || yearsRes[0];
        setSelectedYear(current.id);
      }
      if (streamsRes.success) setStreams(streamsRes.data);
    });
  }, [tenant]);

  // 2. Load Student Assignments
  const loadAssignments = useCallback(async () => {
    if (!tenant || !selectedYear) return;
    setLoading(true);

    const res = await getStudentStreamAssignments(tenant, {
      academic_year_id: selectedYear,
      stream_id: streamFilter || undefined,
      elective_status: (electiveFilter as any) || undefined,
      search: search || undefined,
    });

    if (res.success) {
      setStudents(res.data);
      setTotalCount(res.totalCount);
      setAssignedCount(res.assignedCount);
      setUnassignedCount(res.unassignedCount);
    }
    setLoading(false);
  }, [tenant, selectedYear, streamFilter, electiveFilter, search]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // 3. Handle Single Assignment Save
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStudent || !selectedStreamId || !selectedYear) return;
    setSavingAssignment(true);

    const res = await assignStudentToStream(tenant, {
      student_id: assigningStudent.student_id,
      stream_id: selectedStreamId,
      academic_year_id: selectedYear,
      section_id: assigningStudent.section_id,
      change_reason: changeReason || 'Stream assignment via Academic Console',
    });

    setSavingAssignment(false);
    if (res.success) {
      showNotification(
        'success',
        `Assigned to stream. ${res.coreEnrolledCount ?? 0} core subjects auto-enrolled.`
      );
      setAssigningStudent(null);
      setSelectedStreamId('');
      setChangeReason('');
      loadAssignments();
    } else {
      showNotification('error', res.error || 'Failed to assign stream.');
    }
  };

  // 4. Handle Batch Assignment Save
  const handleBatchAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0 || !batchStreamId || !selectedYear) return;
    setBatchSaving(true);

    const res = await batchAssignStudentsToStream(tenant, {
      student_ids: selectedStudentIds,
      stream_id: batchStreamId,
      academic_year_id: selectedYear,
      change_reason: 'Batch stream assignment',
    });

    setBatchSaving(false);
    if (res.success) {
      showNotification('success', `Batch assigned ${res.count} students to stream.`);
      setIsBatchOpen(false);
      setBatchStreamId('');
      setSelectedStudentIds([]);
      loadAssignments();
    } else {
      showNotification('error', res.error || 'Failed to batch assign.');
    }
  };

  // 5. Inspect Student Enrolled Subjects
  const handleInspectStudent = async (student: StudentStreamAssignmentRecord) => {
    setInspectingStudent(student);
    setSubjectsLoading(true);
    const res = await getStudentSubjectEnrollments(tenant, student.student_id, selectedYear);
    if (res.success) {
      setEnrolledSubjects(res.data);
    }
    setSubjectsLoading(false);
  };

  // 6. Toggle Electives Lock
  const handleToggleLock = async (student: StudentStreamAssignmentRecord) => {
    if (!student.id) return;
    const newLock = !student.electives_locked;
    const res = await updateElectiveStatus(tenant, student.id, { electives_locked: newLock });
    if (res.success) {
      showNotification('success', `Electives ${newLock ? 'locked' : 'unlocked'}.`);
      loadAssignments();
    }
  };

  // 7. Sync Core Enrollments
  const handleSyncCore = async () => {
    if (!selectedYear) return;
    setSyncing(true);
    const res = await syncStreamCoreEnrollments(tenant, selectedYear);
    setSyncing(false);
    if (res.success) {
      showNotification('success', `Core enrollments reconciled (${res.enrolledCount} enrolled).`);
      loadAssignments();
    } else {
      showNotification('error', res.error || 'Sync failed.');
    }
  };

  // 8. Seed Sample Data Helper
  const handleSeedData = async () => {
    setSeeding(true);
    const res = await seedSampleStudentsAndStreams(tenant);
    setSeeding(false);
    if (res.success) {
      showNotification('success', res.message);
      loadAssignments();
    } else {
      showNotification('error', res.error || 'Failed to seed sample students.');
    }
  };

  // Select all toggle
  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.student_id));
    }
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Unique classes for filtering
  const uniqueClasses = Array.from(new Set(students.map(s => s.class_name).filter(Boolean)));
  const filteredStudents = classFilter ? students.filter(s => s.class_name === classFilter) : students;

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
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))] mb-1">
            <Link href={`/${tenant}/admin/academics`} className="hover:text-[hsl(var(--accent))] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Academic Hub
            </Link>
            <span>/</span>
            <Link href={`/${tenant}/admin/academics/streams`} className="hover:text-[hsl(var(--accent))] transition-colors">
              Streams &amp; Rules
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-[hsl(var(--accent))]" />
            Student Stream Assignments
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Assign secondary cohorts to academic streams · Core subjects are automatically enrolled via database triggers
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/${tenant}/admin/academics/streams`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <Layers className="w-3.5 h-3.5" /> Stream Rules Console
          </Link>
          <button
            onClick={handleSyncCore}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent))] transition-colors disabled:opacity-50"
            title="Reconcile core subject enrollments for all assigned students"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Reconciling…' : 'Sync Core Enrollments'}
          </button>
          {selectedStudentIds.length > 0 && (
            <button
              onClick={() => setIsBatchOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black hover:opacity-90 transition-opacity"
            >
              <UserCheck className="w-3.5 h-3.5" /> Assign Selected ({selectedStudentIds.length})
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <Users className="w-4 h-4 text-[hsl(var(--accent))]" /> Cohort Size
          </div>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{totalCount}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Enrolled secondary students</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Stream Assigned
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {assignedCount}{' '}
            <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))]">
              ({totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0}%)
            </span>
          </p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Active stream contracts</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Pending Stream
          </div>
          <p className="text-2xl font-black text-amber-400">{unassignedCount}</p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Awaiting stream allocation</p>
        </div>

        <div className="glass-card rounded-3xl p-5 border border-[hsl(var(--border))] space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--text-tertiary))]">
            <BookMarked className="w-4 h-4 text-blue-400" /> Core Auto-Enrolled
          </div>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">
            {students.reduce((sum, s) => sum + (s.core_subjects_count || 0), 0)}
          </p>
          <p className="text-[11px] text-[hsl(var(--text-secondary))]">Active trigger seats</p>
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

        {/* Secondary Filters */}
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
            <option value="unassigned">⚠️ Unassigned Students</option>
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
            value={electiveFilter}
            onChange={e => setElectiveFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none"
          >
            <option value="">All Elective States</option>
            <option value="locked">Locked</option>
            <option value="approved">Approved</option>
            <option value="submitted">Submitted</option>
            <option value="not_started">Not Started</option>
          </select>

          {(streamFilter || classFilter || electiveFilter || search) && (
            <button
              onClick={() => { setStreamFilter(''); setClassFilter(''); setElectiveFilter(''); setSearch(''); }}
              className="text-xs font-bold text-[hsl(var(--accent))] hover:underline px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Student Assignments Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
        {loading ? (
          <div className="p-16 text-center text-xs text-[hsl(var(--text-tertiary))]">
            <div className="inline-block w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin mb-3" />
            <p>Loading student stream assignments…</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <GraduationCap className="w-12 h-12 text-[hsl(var(--text-tertiary))] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">No students found</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] max-w-md mx-auto">
                {totalCount === 0
                  ? 'No secondary students have been enrolled in this school yet. You can initialize a sample secondary cohort to test stream rules and auto-enrollments.'
                  : 'No students match your selected filters. Try broadening your criteria.'}
              </p>
            </div>
            {totalCount === 0 && (
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black hover:opacity-90 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {seeding ? 'Seeding cohort…' : 'Seed Demo Secondary Cohort (SSS 1 & SSS 2)'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] uppercase tracking-wider bg-[hsl(var(--bg-tertiary)/0.4)]">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length > 0 && selectedStudentIds.length === filteredStudents.length}
                      onChange={handleSelectAll}
                      className="rounded border-[hsl(var(--border))]"
                    />
                  </th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class &amp; Section</th>
                  <th className="py-3 px-4">Assigned Stream</th>
                  <th className="py-3 px-4">Core Auto-Enrollments</th>
                  <th className="py-3 px-4">Elective Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                {filteredStudents.map(student => {
                  const isSelected = selectedStudentIds.includes(student.student_id);
                  const isAssigned = !!student.stream_id;

                  return (
                    <tr
                      key={student.student_id}
                      className={`hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors ${
                        isSelected ? 'bg-[hsl(var(--accent)/0.04)]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectStudent(student.student_id)}
                          className="rounded border-[hsl(var(--border))]"
                        />
                      </td>

                      {/* Student details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent-hover)/0.2)] flex items-center justify-center font-black text-xs text-[hsl(var(--accent))]">
                            {(student.student_name || 'ST').split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-[hsl(var(--text-primary))]">{student.student_name || 'Unnamed Student'}</p>
                            <p className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">
                              {student.admission_number || 'No Adm #'} · {student.gender || 'Student'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Class & Section */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[hsl(var(--text-primary))]">
                          {student.class_name || 'Unassigned Class'}
                        </span>
                        {student.section_name && (
                          <span className="block text-[10px] text-[hsl(var(--text-tertiary))]">
                            {student.section_name}
                          </span>
                        )}
                      </td>

                      {/* Stream Assignment */}
                      <td className="py-3.5 px-4">
                        {isAssigned ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              {student.stream_name}
                            </span>
                            {student.previous_stream_name && (
                              <p className="text-[9px] text-[hsl(var(--text-tertiary))]">
                                Prev: {student.previous_stream_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-2.5 h-2.5" /> Unassigned
                          </span>
                        )}
                      </td>

                      {/* Core Auto-Enrollments */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleInspectStudent(student)}
                          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--accent)/0.15)] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)] transition-colors"
                        >
                          <BookMarked className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                          <span className="font-bold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))]">
                            {student.core_subjects_count ?? 0} Core
                          </span>
                          <span className="text-[10px] text-[hsl(var(--text-tertiary))]">
                            (+{student.elective_subjects_count ?? 0} elec)
                          </span>
                          <ChevronRight className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                        </button>
                      </td>

                      {/* Electives Status & Lock */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            student.electives_locked
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : student.electives_approved
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : student.electives_submitted
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {student.electives_locked
                              ? 'Locked'
                              : student.electives_approved
                              ? 'Approved'
                              : student.electives_submitted
                              ? 'Submitted'
                              : 'Not Started'}
                          </span>
                          {student.id && (
                            <button
                              onClick={() => handleToggleLock(student)}
                              className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                              title={student.electives_locked ? 'Unlock Elective Selections' : 'Lock Elective Selections'}
                            >
                              {student.electives_locked ? <Lock className="w-3 h-3 text-red-400" /> : <Unlock className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setAssigningStudent(student);
                            setSelectedStreamId(student.stream_id || '');
                            setChangeReason('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--accent)/0.15)] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)] text-xs font-bold text-[hsl(var(--text-primary))] hover:text-[hsl(var(--accent))] transition-colors inline-flex items-center gap-1"
                        >
                          {isAssigned ? 'Change' : 'Assign Stream'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Assign Single Student Stream */}
      {assigningStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Assign Academic Stream</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  {assigningStudent.student_name} ({assigningStudent.admission_number || 'Cohort'})
                </p>
              </div>
              <button onClick={() => setAssigningStudent(null)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))]">
                <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Curriculum Stream</label>
                <select
                  required
                  value={selectedStreamId}
                  onChange={e => setSelectedStreamId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                >
                  <option value="">Select Stream…</option>
                  {streams.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) · {s.level || 'Secondary'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStreamId && (
                <div className="p-3.5 rounded-2xl bg-[hsl(var(--accent)/0.08)] border border-[hsl(var(--accent)/0.2)] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[hsl(var(--accent))]">
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Enrollment Trigger Active
                  </div>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
                    Saving this assignment will immediately trigger <code className="font-mono text-[10px]">trg_auto_core_enrollments</code>, creating active subject enrollments for all mandatory Core subjects in this stream.
                  </p>
                </div>
              )}

              {assigningStudent.stream_id && assigningStudent.stream_id !== selectedStreamId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">
                    Reason for Stream Change
                  </label>
                  <input
                    type="text"
                    required
                    value={changeReason}
                    onChange={e => setChangeReason(e.target.value)}
                    placeholder="e.g. Assessment results, parental request, track adjustment"
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))]"
                  />
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                    Note: Changing streams will automatically drop core enrollments from the previous stream.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningStudent(null)}
                  className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssignment || !selectedStreamId}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black hover:opacity-90 disabled:opacity-50"
                >
                  {savingAssignment ? 'Assigning…' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Batch Assign Students */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Batch Stream Assignment</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  Assign {selectedStudentIds.length} selected students
                </p>
              </div>
              <button onClick={() => setIsBatchOpen(false)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))]">
                <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            <form onSubmit={handleBatchAssign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Destination Stream</label>
                <select
                  required
                  value={batchStreamId}
                  onChange={e => setBatchStreamId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                >
                  <option value="">Select Stream…</option>
                  {streams.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-tertiary))]">Selected Students:</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{selectedStudentIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-tertiary))]">Academic Year:</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">
                    {academicYears.find(y => y.id === selectedYear)?.name}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(false)}
                  className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchSaving || !batchStreamId}
                  className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-black hover:opacity-90 disabled:opacity-50"
                >
                  {batchSaving ? 'Assigning…' : `Assign ${selectedStudentIds.length} Students`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal: Inspect Student Enrolled Subjects */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Subject Enrollments</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  {inspectingStudent.student_name} · Stream: {inspectingStudent.stream_name || 'Unassigned'}
                </p>
              </div>
              <button onClick={() => setInspectingStudent(null)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))]">
                <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              </button>
            </div>

            {subjectsLoading ? (
              <div className="p-8 text-center text-xs text-[hsl(var(--text-tertiary))]">
                Loading enrolled subjects…
              </div>
            ) : enrolledSubjects.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <BookMarked className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
                <p className="text-xs font-bold text-[hsl(var(--text-primary))]">No subject enrollments yet</p>
                <p className="text-[11px] text-[hsl(var(--text-secondary))]">
                  Assign this student to a stream to automatically generate core enrollments.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {enrolledSubjects.filter(s => s.enrollment_type === 'stream_core').length} Core subjects generated via <code className="font-mono">trg_auto_core_enrollments</code>
                </div>

                <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                  {enrolledSubjects.map(subj => (
                    <div key={subj.enrollment_id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded">
                            {subj.subject_code || 'SUBJ'}
                          </span>
                          <span className="text-xs font-black text-[hsl(var(--text-primary))]">
                            {subj.subject_name}
                          </span>
                        </div>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">
                          {subj.periods_per_week} p/wk · Teacher: {subj.teacher_name || 'Assigned in section'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          subj.enrollment_type === 'stream_core'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                        }`}>
                          {subj.enrollment_type === 'stream_core' ? 'Stream Core' : 'Elective'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="w-full h-10 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))]"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
