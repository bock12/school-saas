'use client';

import { useState } from 'react';
import { ClipboardList, Search, Filter, Mail, Phone, Clock, FileText } from 'lucide-react';

const demoApplications = [
  { id: '1', name: 'Liam Davies', grade: 'Grade 8', parent: 'Mrs. Sian Davies', email: 'sian@gmail.com', appliedDate: 'Jul 2, 2026', status: 'Pending Review' },
  { id: '2', name: 'Sophia Kowalski', grade: 'Grade 9', parent: 'Mr. Jan Kowalski', email: 'jan@kowalski.org', appliedDate: 'Jun 30, 2026', status: 'Under Interview' },
  { id: '3', name: 'Alexander Sterling', grade: 'Grade 10', parent: 'Ms. Clara Sterling', email: 'clara@sterling.net', appliedDate: 'Jun 28, 2026', status: 'Verification Completed' },
  { id: '4', name: 'Chloe Dubois', grade: 'Grade 7', parent: 'Mr. Pierre Dubois', email: 'pierre@dubois.fr', appliedDate: 'Jun 26, 2026', status: 'Awaiting Assessment' }
];

export default function ApplicationsPage() {
  const [search, setSearch] = useState('');

  const filtered = demoApplications.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.parent.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Applications Registry</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review and manage inbound student applications.</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
            />
          </div>
          <select className="h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
            <option>All Grades</option>
            <option>Grade 7</option>
            <option>Grade 8</option>
            <option>Grade 9</option>
            <option>Grade 10</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Applicant', 'Grade', 'Parent/Guardian', 'Applied Date', 'Documents', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-[hsl(var(--text-tertiary))]">No applications found.</td>
                </tr>
              ) : (
                filtered.map(app => (
                  <tr key={app.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{app.name}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1"><Mail className="w-3 h-3" /> {app.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.grade}</td>
                    <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{app.parent}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{app.appliedDate}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> 3 docs</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Clock className="w-3 h-3" /> {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
