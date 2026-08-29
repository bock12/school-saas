'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  UsersRound, Plus, BarChart3, ArrowLeft, Search, X, Check,
  AlertTriangle, CheckCircle2, AlertCircle, ChevronDown,
  Layers, BookMarked, GraduationCap, Sparkles, Pencil,
  Clock, RotateCcw, Filter
} from 'lucide-react';
import Link from 'next/link';
import {
  getAllocationMatrix, createSubjectOffering, updateSubjectOffering,
  deleteSubjectOffering, getTeacherQualifications,
  AllocationMatrixRow
} from '@/app/actions/offerings';
import { getSubjects, getCurriculumStreams, SubjectRecord } from '@/app/actions/subjects';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function WorkloadBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min((current / max) * 100, 100);
  const color =
    pct >= 100 ? 'bg-red-500' :
    pct >= 80  ? 'bg-amber-500' :
    pct >= 50  ? 'bg-[hsl(var(--accent))]' :
                 'bg-emerald-500';
  const label =
    pct >= 100 ? 'Overloaded' :
    pct >= 80  ? 'Near Limit' :
    pct >= 50  ? 'Target Load' :
                 'Underallocated';
  const labelColor =
    pct >= 100 ? 'text-red-400' :
    pct >= 80  ? 'text-amber-400' :
    pct >= 50  ? 'text-[hsl(var(--accent))]' :
                 'text-emerald-400';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className={labelColor}>{label}</span>
        <span className="text-[hsl(var(--text-secondary))]">{current}/{max} periods</span>
      </div>
      <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Assign Offering Modal
// ─────────────────────────────────────────────────────────────

function AssignOfferingModal({
  teacherId,
  teacherName,
  sectionId,
  sectionName,
  className: sectionClassName,
  existingOfferingId,
  subjects,
  tenant,
  academicYearId,
  onClose,
  onSaved,
}: {
  teacherId: string;
  teacherName: string;
  sectionId: string;
  sectionName: string;
  className: string;
  existingOfferingId?: string;
  subjects: SubjectRecord[];
  tenant: string;
  academicYearId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [subjectId, setSubjectId] = useState('');
  const [periodsPerWeek, setPeriodsPerWeek] = useState(4);
  const [isCompulsory, setIsCompulsory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [qualifiedSubjectIds, setQualifiedSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    getTeacherQualifications(tenant, teacherId).then(res => {
      if (res.success) setQualifiedSubjectIds(res.data.map(q => q.subject_id));
    });
  }, [teacherId, tenant]);

  const handleSave = async () => {
    if (!subjectId) { setError('Please select a subject.'); return; }
    setSaving(true);
    setError('');

    let res;
    if (existingOfferingId) {
      res = await updateSubjectOffering(tenant, existingOfferingId, {
        teacher_id: teacherId,
        periods_per_week: periodsPerWeek,
      });
    } else {
      res = await createSubjectOffering(tenant, {
        academic_year_id: academicYearId,
        subject_id: subjectId,
        section_id: sectionId,
        teacher_id: teacherId,
        periods_per_week: periodsPerWeek,
        is_compulsory: isCompulsory,
      });
    }

    setSaving(false);
    if (res.success) {
      onSaved();
    } else {
      setError(res.error || 'Failed to save allocation.');
    }
  };

  const handleRemove = async () => {
    if (!existingOfferingId) return;
    setSaving(true);
    const res = await deleteSubjectOffering(tenant, existingOfferingId);
    setSaving(false);
    if (res.success) onSaved();
    else setError(res.error || 'Failed to remove.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Assign Subject</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
              {teacherName} → {sectionClassName} {sectionName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Subject</label>
          <select
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          >
            <option value="">Select subject…</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code ? `[${s.code}] ` : ''}{s.name}
                {qualifiedSubjectIds.includes(s.id) ? ' ✓' : ''}
              </option>
            ))}
          </select>
          {qualifiedSubjectIds.length > 0 && (
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">✓ = Teacher has qualification on file</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Periods per Week</label>
          <div className="flex items-center gap-3">
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setPeriodsPerWeek(n)}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                  periodsPerWeek === n
                    ? 'bg-[hsl(var(--accent))] text-white'
                    : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.5)]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIsCompulsory(p => !p)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${isCompulsory ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isCompulsory ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">Compulsory subject</span>
        </label>

        <div className="flex gap-3 pt-2 border-t border-[hsl(var(--border))]">
          {existingOfferingId && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="h-11 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-2xl border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !subjectId}
            className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? 'Saving…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function TeacherAllocationPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  const [matrixRows, setMatrixRows] = useState<AllocationMatrixRow[]>([]);
  const [sections, setSections] = useState<{ id: string; name: string; class_name: string }[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string; is_current: boolean }[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTeacher, setSearchTeacher] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [assigningCell, setAssigningCell] = useState<{
    teacherId: string;
    teacherName: string;
    sectionId: string;
    sectionName: string;
    className: string;
    existingOfferingId?: string;
  } | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadYears = useCallback(async () => {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const admin = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenant);
      let tenantId = tenant;

      if (!isUuid) {
        const { data } = await admin.from('tenants').select('id').eq('slug', tenant).maybeSingle();
        tenantId = data?.id || tenant;
      }

      const { data } = await admin
        .from('academic_years')
        .select('id, name, is_current')
        .eq('tenant_id', tenantId)
        .order('start_date', { ascending: false });

      if (data && data.length > 0) {
        setAcademicYears(data);
        const current = data.find(y => y.is_current) || data[0];
        setSelectedYear(current.id);
      }
    } catch (err) {
      console.error('loadYears error', err);
    }
  }, [tenant]);

  const loadMatrix = useCallback(async () => {
    if (!selectedYear) return;
    setLoading(true);
    const [matrixRes, subjectsRes] = await Promise.all([
      getAllocationMatrix(tenant, selectedYear),
      getSubjects(tenant, { is_active: true, limit: 200 }),
    ]);

    if (matrixRes.success) {
      setMatrixRows(matrixRes.data);
      setSections(matrixRes.sections);
    }
    if (subjectsRes.success) setSubjects(subjectsRes.data);
    setLoading(false);
  }, [tenant, selectedYear]);

  useEffect(() => { loadYears(); }, [loadYears]);
  useEffect(() => { loadMatrix(); }, [loadMatrix]);

  const filteredRows = matrixRows.filter(row => {
    const matchSearch = !searchTeacher || row.teacher_name.toLowerCase().includes(searchTeacher.toLowerCase());
    const matchDept = !deptFilter || row.department_name === deptFilter;
    return matchSearch && matchDept;
  });

  const departments = [...new Set(matrixRows.map(r => r.department_name).filter(Boolean))].sort();
  const unassignedCount = sections.length > 0
    ? sections.filter(sec =>
        !matrixRows.some(row => row.assignments.some(a => a.section_id === sec.id && a.offering_id))
      ).length
    : 0;

  const overloadedCount = matrixRows.filter(r => r.total_periods > r.max_periods).length;

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in w-full pb-10">

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
          <Link href={`/${tenant}/admin/academics`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <UsersRound className="w-7 h-7 text-[hsl(var(--accent))]" />
            Teacher Allocation Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Assign subjects to class sections · workload validated in real time
          </p>
        </div>

        {/* Year Selector */}
        {academicYears.length > 0 && (
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors min-w-[180px]"
          >
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>
            ))}
          </select>
        )}
      </div>

      {/* Alert Banner */}
      {(overloadedCount > 0 || unassignedCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {overloadedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {overloadedCount} teacher{overloadedCount > 1 ? 's' : ''} over workload limit
            </div>
          )}
          {unassignedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {unassignedCount} class section{unassignedCount > 1 ? 's' : ''} without a teacher allocation
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 rounded-3xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            value={searchTeacher}
            onChange={e => setSearchTeacher(e.target.value)}
            placeholder="Search teachers…"
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none min-w-[160px]"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d!}>{d}</option>)}
        </select>
      </div>

      {/* Matrix */}
      {loading ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-4">Building allocation matrix…</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <UsersRound className="w-12 h-12 text-[hsl(var(--text-tertiary))] mx-auto mb-4" />
          <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mb-2">No teachers found</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Add teachers first in the Staff module</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRows.map(row => (
            <TeacherRow
              key={row.teacher_id}
              row={row}
              sections={sections}
              onCellClick={(sectionId, sectionName, className, existingOfferingId) =>
                setAssigningCell({
                  teacherId: row.teacher_id,
                  teacherName: row.teacher_name,
                  sectionId,
                  sectionName,
                  className,
                  existingOfferingId,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assigningCell && (
        <AssignOfferingModal
          {...assigningCell}
          subjects={subjects}
          tenant={tenant}
          academicYearId={selectedYear}
          onClose={() => setAssigningCell(null)}
          onSaved={() => {
            setAssigningCell(null);
            showNotification('success', 'Allocation saved.');
            loadMatrix();
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Teacher Row
// ─────────────────────────────────────────────────────────────

function TeacherRow({
  row,
  sections,
  onCellClick,
}: {
  row: AllocationMatrixRow;
  sections: { id: string; name: string; class_name: string }[];
  onCellClick: (sectionId: string, sectionName: string, className: string, existingOfferingId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const assignedCount = row.assignments.filter(a => a.offering_id).length;

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Teacher header */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent-hover)/0.2)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-black text-[hsl(var(--accent))]">
              {row.teacher_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">{row.teacher_name}</h3>
              {row.employee_id && (
                <span className="text-[9px] font-bold font-mono text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-1.5 py-0.5 rounded-md">{row.employee_id}</span>
              )}
              {row.total_periods > row.max_periods && (
                <span className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">OVERLOADED</span>
              )}
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              {row.department_name || 'No Department'} · {assignedCount} class{assignedCount !== 1 ? 'es' : ''} assigned
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:block w-40">
            <WorkloadBar current={row.total_periods} max={row.max_periods} />
          </div>
          <ChevronDown className={`w-4 h-4 text-[hsl(var(--text-tertiary))] transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Mobile workload */}
      <div className="sm:hidden px-5 pb-3">
        <WorkloadBar current={row.total_periods} max={row.max_periods} />
      </div>

      {/* Section cells */}
      {expanded && (
        <div className="border-t border-[hsl(var(--border))] p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {sections.map(section => {
              const assignment = row.assignments.find(a => a.section_id === section.id);
              const hasOffering = !!assignment?.offering_id;

              return (
                <button
                  key={section.id}
                  onClick={() => onCellClick(section.id, section.name, section.class_name, assignment?.offering_id)}
                  className={`relative p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] group ${
                    hasOffering
                      ? 'bg-[hsl(var(--accent)/0.08)] border-[hsl(var(--accent)/0.25)]'
                      : assignment?.is_form_tutor
                      ? 'bg-amber-500/5 border-amber-500/20 border-dashed'
                      : 'bg-[hsl(var(--bg-tertiary)/0.5)] border-[hsl(var(--border))] border-dashed hover:border-[hsl(var(--accent)/0.3)]'
                  }`}
                >
                  <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                    {section.class_name}
                  </p>
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{section.name}</p>
                  {hasOffering ? (
                    <>
                      <p className="text-[10px] font-bold text-[hsl(var(--accent))] mt-1.5 line-clamp-1">
                        {assignment?.subject_code ? `[${assignment.subject_code}]` : ''} {assignment?.subject_name}
                      </p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))]">{assignment?.periods_per_week}×/wk</p>
                    </>
                  ) : assignment?.is_form_tutor ? (
                    <p className="text-[10px] font-bold text-amber-400 mt-1.5">Form Tutor</p>
                  ) : (
                    <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                    </div>
                  )}
                  {hasOffering && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
