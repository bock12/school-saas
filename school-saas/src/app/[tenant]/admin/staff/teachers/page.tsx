'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  GraduationCap, Search, Award, Eye, BookOpen, Users,
  CheckCircle2, LayoutGrid, List, UserPlus, Download
} from 'lucide-react';
import Link from 'next/link';
import { HCMHeader } from '../_components/hcm-header';

const mockTeachers = [
  { id: '3', name: 'Mr. John Doe', position: 'Head of Mathematics', subjects: ['Mathematics', 'Further Mathematics', 'Calculus'], department: 'Mathematics Department', license: 'Active License', classes: 'Grade 10A, Grade 11B', totalStudents: 74, experience: '12 yrs' },
  { id: '5', name: 'Dr. Raj Sharma', position: 'Senior Physics Instructor', subjects: ['Physics', 'Advanced Science'], department: 'Science Department', license: 'Active License', classes: 'Grade 11A, Grade 12 Sci', totalStudents: 62, experience: '9 yrs' },
  { id: '7', name: 'Mrs. Hannah Cole', position: 'English Literature Lead', subjects: ['English Lit', 'Creative Writing'], department: 'Languages Department', license: 'Active License', classes: 'Grade 9B, Grade 10B', totalStudents: 68, experience: '8 yrs' },
  { id: '8', name: 'Mr. David Osei', position: 'Biology Teacher', subjects: ['Biology', 'Health Science'], department: 'Science Department', license: 'Active License', classes: 'Grade 10C, Grade 12 Bio', totalStudents: 58, experience: '5 yrs' }
];

export default function TeachersPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filtered = mockTeachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.position.toLowerCase().includes(search.toLowerCase()) ||
    t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Academic Teaching Staff"
        subtitle="Review certified educators, classroom teaching loads, license statuses, and student allocations."
        badge={`${filtered.length} Teachers Assigned`}
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Assign Course</span>
            </button>
          </div>
        }
      />

      {/* Filter & View Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search teachers by name, subject, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-[hsl(var(--bg-tertiary))] rounded-xl border border-[hsl(var(--border))] p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'cards' ? 'bg-[hsl(var(--accent))] text-white shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-[hsl(var(--accent))] text-white shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive View Panes */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(t => (
            <div
              key={t.id}
              className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.5)] transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--accent))] font-black text-base shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {t.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[hsl(var(--text-primary))] truncate group-hover:text-[hsl(var(--accent))] transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))] truncate mt-0.5">{t.position}</p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Award className="w-3 h-3" /> {t.license}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                    {t.experience} exp
                  </span>
                </div>

                {/* Assigned Subject Chips */}
                <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--text-tertiary))] block">Courses Taught</span>
                  <div className="flex flex-wrap gap-1">
                    {t.subjects.map(sub => (
                      <span key={sub} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Classes & Student Roster */}
                <div className="pt-2 text-[11px] text-[hsl(var(--text-secondary))] space-y-1">
                  <p className="flex items-center gap-1.5 truncate"><BookOpen className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> Classes: {t.classes}</p>
                  <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> Students: {t.totalStudents} enrolled</p>
                </div>
              </div>

              <Link
                href={`/admin/staff/${t.id}`}
                className="w-full py-2 px-3 rounded-xl bg-[hsl(var(--accent)/0.1)] hover:bg-[hsl(var(--accent))] text-[hsl(var(--accent))] hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>360° Profile</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                  {['Teacher', 'Position', 'Assigned Courses', 'Classes', 'License', ''].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--accent))] font-bold text-xs shrink-0">
                          {t.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{t.name}</p>
                          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{t.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-medium whitespace-nowrap">{t.position}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex gap-1 flex-wrap">
                        {t.subjects.map(s => (
                          <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{t.classes}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        {t.license}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/staff/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" /> 360° Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
