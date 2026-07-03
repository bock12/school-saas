'use client';

import { useState } from 'react';
import { Shield, Search, Phone, Mail } from 'lucide-react';

const mockSupportStaff = [
  { id: '1', name: 'Mrs. Patricia Osei', role: 'Head of Admin', dept: 'Administration', email: 'p.osei@school.edu' },
  { id: '2', name: 'Mr. Benjamin Asante', role: 'Accountant', dept: 'Finance', email: 'b.asante@school.edu' },
  { id: '6', name: 'Mr. Kwame Darko', role: 'Bus Driver', dept: 'Transport', email: 'k.darko@school.edu' }
];

export default function NonTeachingStaffPage() {
  const [search, setSearch] = useState('');

  const filtered = mockSupportStaff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Non-Teaching Support Staff</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Directory of administrative, finance, library, operations, security, and transport staff categories.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search support staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Staff Member', 'Role', 'Department', 'Email Address'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{s.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{s.role}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{s.dept}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
