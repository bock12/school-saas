'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Search, Phone, Mail, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';

const demoEmployeesList = [
  { id: '1', name: 'Mrs. Patricia Osei', position: 'Head of Admin', dept: 'Administration', email: 'p.osei@school.edu', status: 'Active' },
  { id: '2', name: 'Mr. Benjamin Asante', position: 'Accountant', dept: 'Finance', email: 'b.asante@school.edu', status: 'Active' },
  { id: '3', name: 'Mr. John Doe', position: 'Head of Mathematics', dept: 'Mathematics', email: 'john.doe@school.edu', status: 'Active' },
  { id: '4', name: 'Mr. Kwame Darko', position: 'Bus Driver', dept: 'Transport', email: 'k.darko@school.edu', status: 'On Leave' }
];

export default function EmployeesPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [search, setSearch] = useState('');

  const filtered = demoEmployeesList.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Employee Master Registry</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Unified directory for all active, on-leave, and former staff records.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search employee registry..."
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
                {['Employee Name', 'Position', 'Department', 'Email Address', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{emp.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{emp.position}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{emp.dept}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {emp.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      emp.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/staff/${emp.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-semibold"
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
    </div>
  );
}
