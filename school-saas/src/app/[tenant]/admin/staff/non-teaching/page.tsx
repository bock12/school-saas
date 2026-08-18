'use client';

import { useState } from 'react';
import { Shield, Search, Phone, Mail, Eye, LayoutGrid, List, UserPlus, Building } from 'lucide-react';
import Link from 'next/link';
import { HCMHeader } from '../_components/hcm-header';

const mockSupportStaff = [
  { id: '1', name: 'Mrs. Patricia Osei', role: 'Head of Admin', dept: 'Administration', email: 'p.osei@school.edu', phone: '+1 555-8941', status: 'Active', shift: 'Morning (07:30 - 16:30)' },
  { id: '2', name: 'Mr. Benjamin Asante', role: 'Senior Accountant', dept: 'Finance', email: 'b.asante@school.edu', phone: '+1 555-8942', status: 'Active', shift: 'Standard (08:00 - 17:00)' },
  { id: '4', name: 'Mr. Kwame Darko', role: 'Lead Bus Driver', dept: 'Transport', email: 'k.darko@school.edu', phone: '+1 555-8944', status: 'On Leave', shift: 'Transit (06:30 - 15:30)' },
  { id: '6', name: 'Ms. Sarah Mensah', role: 'Head Librarian', dept: 'Library & Media', email: 's.mensah@school.edu', phone: '+1 555-8946', status: 'Active', shift: 'Standard (08:00 - 17:00)' },
];

export default function NonTeachingStaffPage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filtered = mockSupportStaff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Non-Teaching Support Staff"
        subtitle="Directory of administrative officers, accountants, facilities managers, security, and transport operators."
        badge={`${filtered.length} Support Personnel`}
        actionButton={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Support Staff</span>
          </button>
        }
      />

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search by staff name, department, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        <div className="flex items-center bg-[hsl(var(--bg-tertiary))] rounded-xl border border-[hsl(var(--border))] p-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              viewMode === 'cards' ? 'bg-[hsl(var(--accent))] text-white shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              viewMode === 'table' ? 'bg-[hsl(var(--accent))] text-white shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(s => (
            <div
              key={s.id}
              className="glass-card p-5 rounded-2xl border border-[hsl(var(--border))] hover:-translate-y-1 hover:border-[hsl(var(--accent)/0.5)] transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-[hsl(var(--border))] flex items-center justify-center text-teal-400 font-black text-base shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {s.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[hsl(var(--text-primary))] truncate group-hover:text-[hsl(var(--accent))] transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))] truncate mt-0.5">{s.role}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] flex items-center gap-1">
                    <Building className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                    {s.dept}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-tertiary))]">
                  <p className="flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5" /> {s.email}</p>
                  <p className="flex items-center gap-2 truncate"><Phone className="w-3.5 h-3.5" /> {s.phone}</p>
                  <p className="text-[10px] text-[hsl(var(--text-secondary))] pt-1">Shift: {s.shift}</p>
                </div>
              </div>

              <Link
                href={`/admin/staff/${s.id}`}
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
                  {['Staff Member', 'Role', 'Department', 'Contact', 'Shift', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{s.name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-medium whitespace-nowrap">{s.role}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{s.dept}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">
                      <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</p>
                      <p className="flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {s.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{s.shift}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        s.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/staff/${s.id}`}
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
