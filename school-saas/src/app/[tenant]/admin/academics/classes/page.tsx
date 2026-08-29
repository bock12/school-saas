'use client';

import { useState } from 'react';
import { GraduationCap, Plus, Search, ArrowLeft, X, Users, Layers } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const mockClasses = [
  { class_id: 'JSS 1', level: 'Junior Secondary', capacity: 120, currentEnrollment: 114, streams: ['Arm A', 'Arm B', 'Arm C'], coordinator: 'Mr. Joseph Tucker' },
  { class_id: 'JSS 2', level: 'Junior Secondary', capacity: 120, currentEnrollment: 108, streams: ['Arm A', 'Arm B', 'Arm C'], coordinator: 'Mrs. Hawa Conteh' },
  { class_id: 'JSS 3', level: 'Junior Secondary', capacity: 120, currentEnrollment: 118, streams: ['Arm A', 'Arm B', 'Arm C'], coordinator: 'Mr. David Koroma' },
  { class_id: 'SS 1', level: 'Senior Secondary', capacity: 150, currentEnrollment: 142, streams: ['Science', 'Arts', 'Commercial', 'Technical'], coordinator: 'Mr. Amara Kamara' },
  { class_id: 'SS 2', level: 'Senior Secondary', capacity: 150, currentEnrollment: 135, streams: ['Science', 'Arts', 'Commercial'], coordinator: 'Mrs. Rachel Johnson' },
  { class_id: 'SS 3', level: 'Senior Secondary', capacity: 150, currentEnrollment: 148, streams: ['Science', 'Arts', 'Commercial'], coordinator: 'Dr. Raymond Koroma' }
];

export default function ClassesPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', level: 'Senior Secondary', capacity: 40, coordinator: '' });

  const filtered = mockClasses.filter(c =>
    c.class_id.toLowerCase().includes(search.toLowerCase()) ||
    c.coordinator.toLowerCase().includes(search.toLowerCase())
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
            <GraduationCap className="w-7 h-7 text-[hsl(var(--accent))]" />
            Classes & Grade Levels Registry
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Configure grade categories, stream groupings, capacity limits, and grade level supervisors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity w-full sm:w-auto self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Grade Level
        </button>
      </div>

      <div className="glass-card p-4 rounded-3xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search classes or grade coordinators..."
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
                {['Class Level', 'Tier / Division', 'Supervisor', 'Capacity', 'Streams Arms', 'Enrollment Ratio'].map(h => (
                  <th key={h} className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-5 py-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.4)] text-xs">
              {filtered.map(c => {
                const percent = Math.round((c.currentEnrollment / c.capacity) * 100);
                return (
                  <tr key={c.class_id} className="hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                    <td className="px-5 py-4 font-black text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[hsl(var(--accent))]" /> {c.class_id}
                    </td>
                    <td className="px-5 py-4 text-[hsl(var(--text-secondary))] font-medium">{c.level}</td>
                    <td className="px-5 py-4 font-bold text-[hsl(var(--text-primary))]">{c.coordinator}</td>
                    <td className="px-5 py-4 text-[hsl(var(--text-secondary))] font-bold">{c.capacity} Students</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {c.streams.map(str => (
                          <span key={str} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">
                            {str}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-24 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                          <div className="h-full bg-[hsl(var(--accent))]" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="font-bold text-[hsl(var(--text-primary))]">{c.currentEnrollment}/{c.capacity} ({percent}%)</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map(c => {
          const percent = Math.round((c.currentEnrollment / c.capacity) * 100);
          return (
            <div key={c.class_id} className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-black text-base text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[hsl(var(--accent))]" /> {c.class_id}
                  </h4>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{c.level} · Supervisor: {c.coordinator}</p>
                </div>
                <span className="text-[10px] font-bold text-[hsl(var(--accent))] px-2 py-0.5 rounded-lg bg-[hsl(var(--accent)/0.1)] shrink-0">
                  {percent}% Full
                </span>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {c.streams.map(str => (
                  <span key={str} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">
                    {str}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-[hsl(var(--border)/0.5)] flex items-center justify-between text-xs font-bold text-[hsl(var(--text-secondary))]">
                <span>Total Enrollment:</span>
                <span className="text-[hsl(var(--text-primary))]">{c.currentEnrollment} / {c.capacity} Students</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Class Level Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-card p-6 md:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Create Grade Level</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Grade Level Title</label>
                <input
                  type="text"
                  placeholder="e.g. SS 4 / A-Level"
                  value={newClass.name}
                  onChange={e => setNewClass(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Academic Tier</label>
                <select
                  value={newClass.level}
                  onChange={e => setNewClass(p => ({ ...p, level: e.target.value }))}
                  className="w-full h-11 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                >
                  <option>Senior Secondary</option>
                  <option>Junior Secondary</option>
                  <option>Primary School</option>
                  <option>TVET / Technical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Supervisor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Sahr Bangura"
                  value={newClass.coordinator}
                  onChange={e => setNewClass(p => ({ ...p, coordinator: e.target.value }))}
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
                  if (!newClass.name) return;
                  alert(`Created grade level: ${newClass.name}`);
                  setIsModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold shadow-sm"
              >
                Save Grade Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
