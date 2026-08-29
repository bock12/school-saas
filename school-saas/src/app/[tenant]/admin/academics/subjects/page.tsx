'use client';

import { useState } from 'react';
import { BookMarked, Search, Plus, X, ArrowLeft, Filter, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const mockSubjects = [
  { code: 'MTH101', name: 'General Mathematics', dept: 'Science & Math', credits: 4, compulsory: 'Yes', period: '5/week', level: 'JSS / SSS' },
  { code: 'ENG101', name: 'English Language & Literature', dept: 'Arts & Humanities', credits: 4, compulsory: 'Yes', period: '5/week', level: 'JSS / SSS' },
  { code: 'PHY101', name: 'Physics Mechanics & Optics', dept: 'Science & Math', credits: 4, compulsory: 'No', period: '4/week', level: 'SSS' },
  { code: 'CHM101', name: 'Inorganic & Organic Chemistry', dept: 'Science & Math', credits: 4, compulsory: 'No', period: '4/week', level: 'SSS' },
  { code: 'BIO101', name: 'Biology & Physiology', dept: 'Science & Math', credits: 3, compulsory: 'No', period: '4/week', level: 'SSS' },
  { code: 'ACC101', name: 'Financial Accounting & Bookkeeping', dept: 'Commercial & Business', credits: 4, compulsory: 'No', period: '4/week', level: 'SSS' },
  { code: 'COM101', name: 'Commerce & Business Management', dept: 'Commercial & Business', credits: 3, compulsory: 'No', period: '3/week', level: 'SSS' },
  { code: 'INT101', name: 'Integrated Science', dept: 'Science & Math', credits: 4, compulsory: 'Yes', period: '4/week', level: 'JSS' },
  { code: 'SOC101', name: 'Social Studies & Civics', dept: 'Arts & Humanities', credits: 3, compulsory: 'Yes', period: '3/week', level: 'JSS' },
];

export default function SubjectsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubj, setNewSubj] = useState({ code: '', name: '', dept: 'Science & Math', credits: 4, compulsory: 'Yes', period: '4/week', level: 'SSS' });

  const filtered = mockSubjects.filter(s => {
    const matchQuery = s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || s.dept === deptFilter;
    return matchQuery && matchDept;
  });

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto animate-fade-in w-full pb-10">
      {/* Header with Breadcrumb Back link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[hsl(var(--border))]">
        <div className="space-y-1">
          <Link
            href={`/${tenant}/admin/academics`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5">
            <BookMarked className="w-7 h-7 text-[hsl(var(--accent))]" />
            Curriculum Subjects Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))]">
            Configure subject codes, credit weightings, WAEC core classifications, and weekly period constraints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity w-full sm:w-auto self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search subjects by name or code (e.g. MTH101, Physics)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs sm:text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-11 px-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Science & Math">Science & Math</option>
            <option value="Arts & Humanities">Arts & Humanities</option>
            <option value="Commercial & Business">Commercial & Business</option>
          </select>
        </div>
      </div>

      {/* Desktop Table (hidden on mobile, visible on tablet/desktop) */}
      <div className="hidden md:block glass-card overflow-hidden rounded-3xl border border-[hsl(var(--border))] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                {['Code', 'Subject Name', 'Department', 'Level', 'Credits', 'Type', 'Weekly Periods'].map(h => (
                  <th key={h} className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-widest px-5 py-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.4)] text-xs">
              {filtered.map(s => (
                <tr key={s.code} className="hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                  <td className="px-5 py-4 font-mono font-black text-[hsl(var(--accent))] text-sm">{s.code}</td>
                  <td className="px-5 py-4 font-bold text-[hsl(var(--text-primary))]">{s.name}</td>
                  <td className="px-5 py-4 text-[hsl(var(--text-secondary))] font-medium">{s.dept}</td>
                  <td className="px-5 py-4 font-bold text-[hsl(var(--text-primary))]">{s.level}</td>
                  <td className="px-5 py-4 text-[hsl(var(--text-secondary))] font-bold">{s.credits} Credits</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      s.compulsory === 'Yes'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
                    }`}>
                      {s.compulsory === 'Yes' ? 'Core Compulsory' : 'Elective'}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[hsl(var(--text-secondary))]">{s.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Grid (visible on mobile only) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map(s => (
          <div key={s.code} className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-black text-xs text-[hsl(var(--accent))] px-2 py-0.5 rounded-md bg-[hsl(var(--accent)/0.1)]">
                  {s.code}
                </span>
                <h4 className="font-bold text-sm text-[hsl(var(--text-primary))] mt-1">{s.name}</h4>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{s.dept} · {s.level}</p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                s.compulsory === 'Yes' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
              }`}>
                {s.compulsory === 'Yes' ? 'Core' : 'Elective'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[hsl(var(--border)/0.5)] text-[hsl(var(--text-secondary))]">
              <span>{s.credits} Credits Weighting</span>
              <span className="font-mono">{s.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-card p-6 md:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Add Subject to Catalog</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g. MTH101"
                  value={newSubj.code}
                  onChange={e => setNewSubj(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Further Mathematics"
                  value={newSubj.name}
                  onChange={e => setNewSubj(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={newSubj.dept}
                    onChange={e => setNewSubj(p => ({ ...p, dept: e.target.value }))}
                    className="w-full h-11 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option>Science & Math</option>
                    <option>Arts & Humanities</option>
                    <option>Commercial & Business</option>
                    <option>Technical & Vocational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">Level</label>
                  <select
                    value={newSubj.level}
                    onChange={e => setNewSubj(p => ({ ...p, level: e.target.value }))}
                    className="w-full h-11 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option>SSS</option>
                    <option>JSS</option>
                    <option>Primary</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))]">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newSubj.name || !newSubj.code) return;
                  alert(`Registered ${newSubj.name}`);
                  setIsModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold shadow-sm"
              >
                Save Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
