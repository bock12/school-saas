'use client';

import { useState } from 'react';
import { Building2, Plus, Search, Users, ArrowLeft, X, BookMarked } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const mockDepts = [
  { id: '1', name: 'Science & Mathematics Faculty', head: 'Dr. Evelyn Mensah', teachers: 14, subjectsCount: 16, workload: 'Optimal Load', room: 'Block A, Science Lab Wing' },
  { id: '2', name: 'Arts & Humanities Faculty', head: 'Mrs. Rachel Johnson', teachers: 10, subjectsCount: 12, workload: 'Optimal Load', room: 'Block B, Humanities Wing' },
  { id: '3', name: 'Commercial & Business Studies', head: 'Mr. Emeka Okafor', teachers: 8, subjectsCount: 10, workload: 'Optimal Load', room: 'Block C, Business Hub' },
  { id: '4', name: 'Technical & Vocational (TVET)', head: 'Engr. Sahr Bangura', teachers: 6, subjectsCount: 8, workload: 'High Load', room: 'Workshops & Technology Lab' },
];

export default function DepartmentsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', head: '', room: '' });

  const filtered = mockDepts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto animate-fade-in w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[hsl(var(--border))]">
        <div className="space-y-1">
          <Link
            href={`/${tenant}/admin/academics`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[hsl(var(--accent))]" />
            Academic Departments & Faculties
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Manage academic subject groupings, Head of Department (HOD) assignments, and teaching workforce allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity w-full sm:w-auto self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Department
        </button>
      </div>

      <div className="glass-card p-4 rounded-3xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search academic departments or faculty heads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs sm:text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-card overflow-hidden rounded-3xl border border-[hsl(var(--border))] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                {['Department Name', 'Head of Department (HOD)', 'Faculty Location', 'Staff Count', 'Subjects', 'Workload Status'].map(h => (
                  <th key={h} className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-5 py-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.4)] text-xs">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <td className="px-5 py-4 font-bold text-sm text-[hsl(var(--text-primary))]">{d.name}</td>
                  <td className="px-5 py-4 font-semibold text-[hsl(var(--text-primary))]">{d.head}</td>
                  <td className="px-5 py-4 text-[hsl(var(--text-secondary))] font-medium">{d.room}</td>
                  <td className="px-5 py-4 font-bold text-[hsl(var(--text-secondary))] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> {d.teachers} Teachers
                  </td>
                  <td className="px-5 py-4 text-[hsl(var(--text-secondary))] font-bold">{d.subjectsCount} Subjects</td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {d.workload}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map(d => (
          <div key={d.id} className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">{d.name}</h4>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">HOD: {d.head}</p>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                {d.workload}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border)/0.5)] text-xs text-[hsl(var(--text-secondary))]">
              <span>Location: {d.room}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-[hsl(var(--text-secondary))]">
              <span className="flex items-center gap-1 font-bold"><Users className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> {d.teachers} Teachers</span>
              <span className="font-bold">{d.subjectsCount} Subjects</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-card p-6 md:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Create Academic Department</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science & Computing Faculty"
                  value={newDept.name}
                  onChange={e => setNewDept(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Evelyn Mensah"
                  value={newDept.head}
                  onChange={e => setNewDept(p => ({ ...p, head: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Faculty Building / Lab Location</label>
                <input
                  type="text"
                  placeholder="e.g. Block A, 2nd Floor"
                  value={newDept.room}
                  onChange={e => setNewDept(p => ({ ...p, room: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newDept.name) return;
                  alert(`Created department: ${newDept.name}`);
                  setIsModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold shadow-sm"
              >
                Save Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
