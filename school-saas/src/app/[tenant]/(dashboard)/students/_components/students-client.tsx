'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/shared/status-badge';
import { SearchInput } from '@/components/shared/search-input';
import { Modal, ModalCancelButton, ModalSubmitButton } from '@/components/shared/modal';
import {
  Users, Plus, Eye, Edit2, Download, Filter, Mail, Phone, User,
  ChevronLeft, ChevronRight, MoreHorizontal, Trash2, BookOpen,
} from 'lucide-react';
import Link from 'next/link';

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

export function StudentsClient({ initialStudents }: { initialStudents: Student[] }) {
  const params = useParams();
  const tenant = params.tenant as string;
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const classes = [...new Set(initialStudents.map(s => s.className).filter(Boolean))].sort();

  const filtered = initialStudents.filter((s) => {
    const matchSearch = `${s.first_name} ${s.last_name} ${s.admission_number}`.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === 'all' || s.className === classFilter;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Students</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{initialStudents.length} total students</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <SearchInput placeholder="Search students..." onSearch={setSearch} className="w-full md:w-80" />
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <button
              onClick={() => setClassFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${classFilter === 'all' ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}
            >
              All
            </button>
            {classes.map(c => (
              <button
                key={c}
                onClick={() => setClassFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${classFilter === c ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
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
                {['Student', 'Admission #', 'Class', 'Guardian', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <tr key={student.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${student.gender === 'female' ? 'bg-pink-500/15 text-pink-400' : 'bg-blue-500/15 text-blue-400'}`}>
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1"><Mail className="w-3 h-3" />{student.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="text-xs font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded">{student.admission_number || 'N/A'}</code>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))]">
                      <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                      {student.className ? `${student.className} — ${student.sectionName}` : 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm text-[hsl(var(--text-secondary))]">{student.guardian_name || 'N/A'}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1"><Phone className="w-3 h-3" />{student.guardian_phone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={student.is_active ? 'active' : 'suspended'} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="relative">
                      <button onClick={() => setActiveMenu(activeMenu === student.id ? null : student.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[hsl(var(--border))]">
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
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
        subtitle="Fill in the student details below"
        maxWidth="lg"
        footer={
          <>
            <ModalCancelButton onClick={() => setShowAddModal(false)} />
            <ModalSubmitButton onClick={() => setShowAddModal(false)}>Add Student</ModalSubmitButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">First Name</label><input type="text" placeholder="e.g., Amara" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Last Name</label><input type="text" placeholder="e.g., Johnson" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Email</label><input type="email" placeholder="student@school.edu" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Gender</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Class</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Select class</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Section</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Select section</option><option>A</option><option>B</option><option>C</option></select></div>
          </div>
          <div className="pt-3 border-t border-[hsl(var(--border))]">
            <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Guardian Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Guardian Name</label><input type="text" placeholder="e.g., Mrs. Johnson" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
              <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Guardian Phone</label><input type="tel" placeholder="+1 555-0100" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
