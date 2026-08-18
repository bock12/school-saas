'use client';

import { useState } from 'react';
import { BookOpen, Plus, Search, Users, ShieldCheck } from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockPositions = [
  { id: '1', title: 'Mathematics Teacher', role: 'Teacher', count: 12, dept: 'Mathematics', desc: 'Responsible for Grade 7-12 math courses instruction and exams' },
  { id: '2', title: 'Head of Mathematics', role: 'Teacher + HOD', count: 1, dept: 'Mathematics', desc: 'Manages Mathematics department teachers and syllabus allocations' },
  { id: '3', title: 'Senior Accountant', role: 'Finance Officer', count: 2, dept: 'Finance', desc: 'Performs school budget accounting, tuition reconciliation, and ledgers' },
  { id: '4', title: 'Head Librarian', role: 'Support Staff', count: 1, dept: 'Library & Media', desc: 'Manages digital library catalogs, textbook loans, and study halls' },
];

export default function PositionsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockPositions.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase()) ||
    p.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Position & Role Designations"
        subtitle="Catalog structural organizational positions and map them to fine-grained system permission roles."
        badge={`${mockPositions.length} Defined Positions`}
        actionButton={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Position</span>
          </button>
        }
      />

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search positions by designation title, department, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div className="glass-card overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                {['Position Title', 'Department', 'Permission Role', 'Occupied Headcount', 'Description'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map(pos => (
                <tr key={pos.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{pos.title}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{pos.dept}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)]">
                      {pos.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-bold whitespace-nowrap">
                    {pos.count} staff active
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] max-w-[320px] truncate" title={pos.desc}>
                    {pos.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
