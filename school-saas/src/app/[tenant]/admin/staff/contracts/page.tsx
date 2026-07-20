'use client';

import { useState } from 'react';
import { ClipboardList, Search, Calendar, AlertTriangle } from 'lucide-react';

const mockContracts = [
  { id: '1', name: 'John Doe', position: 'Head of Mathematics', expiryDate: 'Jul 30, 2026', daysLeft: 27, status: 'Expiring Soon' },
  { id: '2', name: 'Patricia Osei', position: 'Head of Admin', expiryDate: 'Aug 15, 2027', daysLeft: 408, status: 'Active' },
  { id: '3', name: 'Benjamin Asante', position: 'Accountant', expiryDate: 'Sep 01, 2026', daysLeft: 60, status: 'Active' }
];

export default function ContractsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Contracts &amp; Onboarding Compliance</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review active employment agreements, contract templates, and track upcoming expirations.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Staff Member', 'Position', 'Expiration Date', 'Compliance Check', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockContracts.map(row => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.position}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {row.expiryDate}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">
                    {row.daysLeft <= 30 ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Renewal Action Required ({row.daysLeft} days)</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">{row.daysLeft} days remaining</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      row.daysLeft <= 30 ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {row.status}
                    </span>
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
