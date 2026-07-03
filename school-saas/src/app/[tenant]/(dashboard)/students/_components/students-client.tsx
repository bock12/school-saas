'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/shared/status-badge';
import { SearchInput } from '@/components/shared/search-input';
import { Modal, ModalCancelButton, ModalSubmitButton } from '@/components/shared/modal';
import {
  Users, Plus, Eye, Edit2, Download, Filter, Mail, Phone, User,
  ChevronLeft, ChevronRight, MoreHorizontal, Trash2, BookOpen, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { addStudent } from '../actions';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  email: string | null;
  gender: string | null;
  className: string;
  sectionName: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  is_active: boolean;
  admitted_at: string;
}

export interface ClassOption {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

const inputClass =
  'w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
const selectClass =
  'w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
const labelClass = 'block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5';

export function StudentsClient({
  initialStudents,
  classOptions,
  tenant,
}: {
  initialStudents: Student[];
  classOptions: ClassOption[];
  tenant: string;
}) {
  const params = useParams();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');

  const availableSections =
    classOptions.find((c) => c.id === selectedClassId)?.sections || [];

  const classes = [...new Set(initialStudents.map((s) => s.className).filter(Boolean))].sort();

  const filtered = initialStudents.filter((s) => {
    const matchSearch = `${s.first_name} ${s.last_name} ${s.admission_number}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchClass = classFilter === 'all' || s.className === classFilter;
    return matchSearch && matchClass;
  });

  function handleCloseModal() {
    setShowAddModal(false);
    setFormError(null);
    setSelectedClassId('');
  }

  function handleSubmit(formData: FormData) {
    setFormError(null);
    formData.set('tenant', tenant);
    startTransition(async () => {
      const result = await addStudent(formData);
      if (result.success) {
        handleCloseModal();
        router.refresh();
      } else {
        setFormError(result.error || 'Failed to add student.');
      }
    });
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Students</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{initialStudents.length} total students</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <SearchInput placeholder="Search students..." onSearch={setSearch} className="w-full lg:w-80" />
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-2 lg:pb-0 max-w-full">
            <Filter className="w-4 h-4 text-[hsl(var(--text-tertiary))] flex-shrink-0" />
            <button
              onClick={() => setClassFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${classFilter === 'all' ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}
            >
              All
            </button>
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => setClassFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${classFilter === c ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="lg:ml-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors border border-[hsl(var(--border))] lg:border-0 w-full lg:w-auto">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Student', 'Admission #', 'Class', 'Guardian', 'Status', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">
                    No students found. Add your first student to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${student.gender === 'female' ? 'bg-pink-500/15 text-pink-400' : 'bg-blue-500/15 text-blue-400'}`}>
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[hsl(var(--text-primary))] whitespace-nowrap">{student.first_name} {student.last_name}</p>
                          <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 whitespace-nowrap"><Mail className="w-3 h-3 flex-shrink-0" />{student.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-xs font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded whitespace-nowrap">{student.admission_number || 'N/A'}</code>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))] whitespace-nowrap">
                        <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] flex-shrink-0" />
                        {student.className ? `${student.className} — ${student.sectionName}` : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm text-[hsl(var(--text-secondary))] whitespace-nowrap">{student.guardian_name || 'N/A'}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1 whitespace-nowrap"><Phone className="w-3 h-3 flex-shrink-0" />{student.guardian_phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={student.is_active ? 'active' : 'suspended'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === student.id ? null : student.id)}
                          className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                        </button>
                        {activeMenu === student.id && (
                          <div className="absolute right-0 top-8 w-44 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg z-10 animate-fade-in-scale overflow-hidden p-1">
                            <Link href={`/${tenant}/students/${student.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"><Eye className="w-4 h-4" />View Profile</Link>
                            <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"><Edit2 className="w-4 h-4" />Edit</button>
                            <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] transition-all"><Trash2 className="w-4 h-4" />Remove</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 gap-3 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--text-tertiary))]">Showing {filtered.length} of {initialStudents.length} students</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1 rounded-lg bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] text-xs font-medium">1</button>
            <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title="Add New Student"
        subtitle="Fill in the student details below"
        maxWidth="lg"
        footer={
          <>
            <ModalCancelButton onClick={handleCloseModal} />
            <ModalSubmitButton
              onClick={() => {
                const form = document.getElementById('add-student-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              disabled={isPending}
            >
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : 'Add Student'}
            </ModalSubmitButton>
          </>
        }
      >
        <form id="add-student-form" action={handleSubmit} className="space-y-4">
          {formError && (
            <div className="px-3 py-2.5 rounded-lg bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.3)] text-xs text-[hsl(var(--danger))]">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>First Name *</label><input name="first_name" type="text" required placeholder="e.g., Amara" className={inputClass} /></div>
            <div><label className={labelClass}>Last Name *</label><input name="last_name" type="text" required placeholder="e.g., Johnson" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelClass}>Email</label><input name="email" type="email" placeholder="student@school.edu" className={inputClass} /></div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" className={selectClass}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className={selectClass}
              >
                <option value="">Select class</option>
                {classOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Section</label>
              <select name="section_id" className={selectClass} disabled={!selectedClassId}>
                <option value="">Select section</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-3 border-t border-[hsl(var(--border))]">
            <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Guardian Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className={labelClass}>Guardian Name</label><input name="guardian_name" type="text" placeholder="e.g., Mrs. Johnson" className={inputClass} /></div>
              <div><label className={labelClass}>Guardian Phone</label><input name="guardian_phone" type="tel" placeholder="+1 555-0100" className={inputClass} /></div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
