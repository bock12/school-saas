'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Search, Mail, Phone, BookOpen, Eye, Plus, Filter,
  UserCheck, UserX, GraduationCap, ChevronLeft, ChevronRight,
  MoreHorizontal, Trash2, Camera, CreditCard, Loader2, CheckCircle2,
} from 'lucide-react';
import { addStudent } from '../actions';
import { StudentIdCardModal } from './student-id-card-modal';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  email: string | null;
  gender: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  is_active: boolean;
  admitted_at: string;
  avatar_url: string | null;
  className: string;
  sectionName: string;
  isEnrolled: boolean;
}

interface ClassOption {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

type Tab = 'active' | 'enrolled' | 'inactive';

const inputCls = 'w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
const selectCls = 'w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
const labelCls = 'block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5';

const PAGE_SIZE = 15;

export function MergedStudentsClient({
  initialStudents,
  classOptions,
  tenant,
}: {
  initialStudents: Student[];
  classOptions: ClassOption[];
  tenant: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const availableSections = classOptions.find(c => c.id === selectedClassId)?.sections || [];

  // Tab-filtered students
  const tabFiltered = students.filter(s => {
    if (activeTab === 'active') return s.is_active;
    if (activeTab === 'enrolled') return s.is_active && s.isEnrolled;
    if (activeTab === 'inactive') return !s.is_active;
    return true;
  });

  // Search + class filter
  const filtered = tabFiltered.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${s.first_name} ${s.last_name}`.toLowerCase().includes(q)
      || s.admission_number.toLowerCase().includes(q)
      || (s.email || '').toLowerCase().includes(q);
    const matchClass = classFilter === 'all' || s.className === classFilter;
    return matchSearch && matchClass;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    active: students.filter(s => s.is_active).length,
    enrolled: students.filter(s => s.is_active && s.isEnrolled).length,
    inactive: students.filter(s => !s.is_active).length,
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    fd.append('tenant', tenant);
    if (avatarUrl) fd.append('avatar_url', avatarUrl);

    startTransition(async () => {
      const res = await addStudent(fd);
      if (res.success) {
        setShowAddModal(false);
        setAvatarUrl(null);
        setSelectedClassId('');
        formEl.reset();
        setSuccessMsg('Student admitted successfully!');
        setTimeout(() => setSuccessMsg(null), 4000);
        router.refresh();
      } else {
        setFormError(res.error || 'Failed to add student.');
      }
    });
  };

  const TABS: { id: Tab; label: string; icon: any; count: number; color: string }[] = [
    { id: 'active', label: 'Active Students', icon: Users, count: counts.active, color: 'text-emerald-400' },
    { id: 'enrolled', label: 'Enrolled (Current Year)', icon: GraduationCap, count: counts.enrolled, color: 'text-blue-400' },
    { id: 'inactive', label: 'Inactive / Alumni', icon: UserX, count: counts.inactive, color: 'text-gray-400' },
  ];

  return (
    <>
      <div className="space-y-6 max-w-[1600px] animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Students</h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              All students across active, enrolled, and inactive states.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(var(--accent)/0.2)]"
          >
            <Plus className="w-4 h-4" /> Admit Student
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`glass-card p-4 text-left transition-all hover:scale-[1.01] ${activeTab === tab.id ? 'ring-2 ring-[hsl(var(--accent)/0.5)] bg-[hsl(var(--accent)/0.05)]' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${tab.color}`} />
                  <span className="text-xs text-[hsl(var(--text-secondary))] font-medium">{tab.label}</span>
                </div>
                <p className={`text-2xl font-black ${activeTab === tab.id ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-primary))]'}`}>
                  {tab.count}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tab bar + Filters */}
        <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex bg-[hsl(var(--bg-tertiary))] p-1 rounded-lg border border-[hsl(var(--border))] gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]' : 'bg-[hsl(var(--bg-tertiary))]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text" placeholder="Search name, ID, email..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
            </div>
            <select
              value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }}
              className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            >
              <option value="all">All Classes</option>
              {classOptions.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Student', 'Admission #', 'Class / Section', 'Guardian', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-[hsl(var(--text-tertiary))]">
                      {search ? 'No students match your search.' : `No ${activeTab} students found.`}
                    </td>
                  </tr>
                ) : (
                  paginated.map(student => (
                    <tr key={student.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {student.avatar_url ? (
                            <img src={student.avatar_url} alt={student.first_name} className="w-9 h-9 rounded-full object-cover border border-[hsl(var(--border))]" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[hsl(var(--accent)/0.12)] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold flex-shrink-0">
                              {student.first_name[0]}{student.last_name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] whitespace-nowrap">{student.first_name} {student.last_name}</p>
                            {student.email && <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 whitespace-nowrap"><Mail className="w-3 h-3" />{student.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="text-xs font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded">
                          {student.admission_number}
                        </code>
                      </td>
                      <td className="px-5 py-3.5">
                        {student.className ? (
                          <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))]">
                            <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                            {student.className}{student.sectionName ? ` — ${student.sectionName}` : ''}
                          </div>
                        ) : (
                          <span className="text-xs text-[hsl(var(--text-tertiary))] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {student.guardian_name && <p className="text-sm text-[hsl(var(--text-secondary))]">{student.guardian_name}</p>}
                        {student.guardian_phone && <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1"><Phone className="w-3 h-3" />{student.guardian_phone}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${student.is_active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/15 text-gray-400 border border-gray-500/20'}`}>
                            {student.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {student.isEnrolled && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                              Enrolled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/${tenant}/admin/students/${student.id}`}
                            className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.1)] transition-all"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setIdCardStudent(student)}
                            className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                            title="Print ID Card"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenu(activeMenu === student.id ? null : student.id)}
                              className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {activeMenu === student.id && (
                              <div className="absolute right-0 top-full mt-1 z-20 w-44 glass-card p-1 shadow-xl animate-fade-in" onMouseLeave={() => setActiveMenu(null)}>
                                <Link href={`/${tenant}/admin/students/${student.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> View Profile
                                </Link>
                                <button onClick={() => { setIdCardStudent(student); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-amber-400 hover:bg-amber-500/10 transition-colors">
                                  <CreditCard className="w-3.5 h-3.5" /> Print ID Card
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
              <p className="text-xs text-[hsl(var(--text-tertiary))]">
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] disabled:opacity-40 hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] disabled:opacity-40 hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ID Card Modal */}
      {idCardStudent && (
      <StudentIdCardModal
          student={{
            id: idCardStudent.id,
            first_name: idCardStudent.first_name,
            last_name: idCardStudent.last_name,
            admission_number: idCardStudent.admission_number,
            email: null,
            gender: idCardStudent.gender,
            className: idCardStudent.className,
            sectionName: idCardStudent.sectionName,
            guardian_name: idCardStudent.guardian_name,
            guardian_phone: idCardStudent.guardian_phone,
            avatar_url: idCardStudent.avatar_url,
            admitted_at: idCardStudent.admitted_at,
          }}
          orgName={tenant}
          onClose={() => setIdCardStudent(null)}
        />
      )}

      {/* Quick Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
          <div className="glass-card max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-between border-b border-[hsl(var(--border))] p-5 bg-[hsl(var(--bg-secondary))]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Quick Admit Student</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              <form onSubmit={handleAddStudent} className="space-y-4">
                {/* Photo */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))]">
                  <div className="relative w-16 h-16 rounded-full bg-[hsl(var(--bg-tertiary))] border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarUrl ? <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="w-5 h-5 text-[hsl(var(--text-tertiary))]" />}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Upload Photo (optional)</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">PNG, JPG. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>First Name *</label><input name="first_name" required className={inputCls} placeholder="e.g. Sarah" /></div>
                  <div><label className={labelCls}>Last Name *</label><input name="last_name" required className={inputCls} placeholder="e.g. Johnson" /></div>
                  <div><label className={labelCls}>Email</label><input name="email" type="email" className={inputCls} placeholder="e.g. sarah@mail.com" /></div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select name="gender" className={selectCls}><option>Male</option><option>Female</option><option>Other</option></select>
                  </div>
                  <div><label className={labelCls}>Guardian Name</label><input name="guardian_name" className={inputCls} placeholder="e.g. Patricia Johnson" /></div>
                  <div><label className={labelCls}>Guardian Phone</label><input name="guardian_phone" className={inputCls} placeholder="e.g. +232 76 000 001" /></div>
                  <div>
                    <label className={labelCls}>Class</label>
                    <select className={selectCls} value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                      <option value="">— No class —</option>
                      {classOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Section</label>
                    <select name="section_id" className={selectCls} disabled={!selectedClassId}>
                      <option value="">— No section —</option>
                      {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {formError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{formError}</p>}

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[hsl(var(--border))]">
                  <button type="button" onClick={() => setShowAddModal(false)} disabled={isPending}
                    className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Cancel</button>
                  <button type="submit" disabled={isPending}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 flex items-center gap-2">
                    {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Admitting...</> : '+ Admit Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
