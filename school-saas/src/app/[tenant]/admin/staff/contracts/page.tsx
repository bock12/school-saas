'use client';

import { useState } from 'react';
import {
  ClipboardList, Search, Calendar, AlertTriangle, CheckCircle2,
  FileText, Plus, Download, RefreshCw, Eye
} from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockContracts = [
  { id: '1', name: 'John Doe', position: 'Head of Mathematics', dept: 'Mathematics', type: 'Fixed-Term (2 Years)', expiryDate: 'Jul 30, 2026', daysLeft: 27, status: 'Expiring Soon', compliance: 'Signed & Verified' },
  { id: '2', name: 'Patricia Osei', position: 'Head of Admin', dept: 'Administration', type: 'Permanent', expiryDate: 'Aug 15, 2027', daysLeft: 408, status: 'Active', compliance: 'Signed & Verified' },
  { id: '3', name: 'Benjamin Asante', position: 'Senior Accountant', dept: 'Finance', type: 'Fixed-Term (1 Year)', expiryDate: 'Sep 01, 2026', daysLeft: 60, status: 'Active', compliance: 'Signed & Verified' },
  { id: '4', name: 'Kwame Darko', position: 'Bus Driver', dept: 'Transport', type: 'Contractor', expiryDate: 'Aug 10, 2026', daysLeft: 38, status: 'Expiring Soon', compliance: 'Pending Police Clearance' },
];

export default function ContractsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockContracts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.position.toLowerCase().includes(search.toLowerCase()) ||
    c.dept.toLowerCase().includes(search.toLowerCase())
  );

  const expiringCount = mockContracts.filter(c => c.daysLeft <= 60).length;

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Employment Contracts & Compliance"
        subtitle="Track employment terms, contract expiration dates, signed compliance documents, and renewal deadlines."
        badge={`${expiringCount} Contracts Due for Renewal`}
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Contract</span>
            </button>
          </div>
        }
      />

      {/* Compliance Alert Banner */}
      {expiringCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[hsl(var(--text-primary))]">
                {expiringCount} Staff Contracts Expiring within 60 Days
              </p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                Immediate renewal discussions or contract termination notices must be issued per labor compliance policies.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto"
          >
            Review Renewals
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search contracts by employee, department, or contract type..."
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
                {['Staff Member', 'Position & Dept', 'Contract Type', 'Expiration Date', 'Remaining Days', 'Compliance Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{row.name}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">
                    <p className="font-semibold text-[hsl(var(--text-primary))]">{row.position}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{row.dept}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{row.type}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap flex items-center gap-1.5 pt-4">
                    <Calendar className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {row.expiryDate}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                    {row.daysLeft <= 30 ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {row.daysLeft} days left
                      </span>
                    ) : row.daysLeft <= 60 ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {row.daysLeft} days left
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">{row.daysLeft} days left</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      row.compliance.startsWith('Signed')
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {row.compliance}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-bold"
                    >
                      <RefreshCw className="w-3 h-3" /> Renew
                    </button>
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
