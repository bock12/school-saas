'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { StatusBadge } from '@/components/shared/status-badge';
import { SearchInput } from '@/components/shared/search-input';
import { Modal, ModalCancelButton, ModalSubmitButton } from '@/components/shared/modal';
import { GraduationCap, Plus, Mail, Phone, BookOpen, Filter, MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string | null;
  email: string | null;
  phone: string | null;
  department: string;
  subjects: string[];
  qualification: string | null;
  is_active: boolean;
  date_of_joining: string | null;
}

export function TeachersClient({ initialTeachers }: { initialTeachers: Teacher[] }) {
  const params = useParams();
  const tenant = params.tenant as string;
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const departments = [...new Set(initialTeachers.map(t => t.department).filter(Boolean))].sort();

  const filtered = initialTeachers.filter(t => {
    const matchSearch = `${t.first_name} ${t.last_name} ${t.employee_id}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || t.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Teachers</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{initialTeachers.length} staff members</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <SearchInput placeholder="Search teachers..." onSearch={setSearch} className="w-full md:w-80" />
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <button onClick={() => setDeptFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${deptFilter === 'all' ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]' : 'text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}>All</button>
            {departments.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${deptFilter === d ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]' : 'text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))]'}`}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-8 text-center text-sm text-[hsl(var(--text-tertiary))]">
            No teachers found.
          </div>
        ) : filtered.map((teacher, i) => (
          <div key={teacher.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--info)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] text-sm font-bold">
                  {teacher.first_name[0]}{teacher.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{teacher.first_name} {teacher.last_name}</p>
                  <code className="text-[10px] font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-1.5 py-0.5 rounded">{teacher.employee_id || 'N/A'}</code>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === teacher.id ? null : teacher.id)} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                </button>
                {activeMenu === teacher.id && (
                  <div className="absolute right-0 top-7 w-40 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-lg z-10 animate-fade-in-scale overflow-hidden p-1">
                    <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"><Eye className="w-4 h-4" />View</button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"><Edit2 className="w-4 h-4" />Edit</button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] transition-all"><Trash2 className="w-4 h-4" />Remove</button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Mail className="w-3 h-3" />{teacher.email || 'No email'}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Phone className="w-3 h-3" />{teacher.phone || 'N/A'}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><GraduationCap className="w-3 h-3" />{teacher.qualification || 'N/A'}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
              <div className="flex flex-wrap gap-1">
                {teacher.subjects.length > 0 ? teacher.subjects.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
                    <BookOpen className="w-2.5 h-2.5" />{s}
                  </span>
                )) : (
                  <span className="text-xs text-[hsl(var(--text-tertiary))]">No subjects</span>
                )}
              </div>
              <StatusBadge status={teacher.is_active ? 'active' : 'suspended'} />
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Teacher" subtitle="Enter teacher details" maxWidth="lg"
        footer={<><ModalCancelButton onClick={() => setShowAddModal(false)} /><ModalSubmitButton onClick={() => setShowAddModal(false)}>Add Teacher</ModalSubmitButton></>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">First Name</label><input type="text" placeholder="e.g., John" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Last Name</label><input type="text" placeholder="e.g., Smith" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Email</label><input type="email" placeholder="teacher@school.edu" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Phone</label><input type="tel" placeholder="+1 555-0000" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Department</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Select department</option><option>Sciences</option><option>Languages</option><option>Humanities</option><option>Arts</option><option>Technology</option></select></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Qualification</label><input type="text" placeholder="e.g., M.Sc Mathematics" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
