'use client';

import { useState } from 'react';
import { DollarSign, Search, Plus, Award, Download, CheckCircle2, Building } from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockPayrollLedger = [
  { id: '1', name: 'John Doe', scale: 'Grade 12 Scale A', payrollNo: 'PAY-48920', dept: 'Mathematics', bank: 'Chase Bank', status: 'Active', baseSalary: '$3,850' },
  { id: '2', name: 'Patricia Osei', scale: 'Grade 14 Scale C', payrollNo: 'PAY-10029', dept: 'Administration', bank: 'HSBC Bank', status: 'Active', baseSalary: '$4,200' },
  { id: '3', name: 'Benjamin Asante', scale: 'Grade 11 Scale B', payrollNo: 'PAY-22940', dept: 'Finance', bank: 'Chase Bank', status: 'Active', baseSalary: '$3,400' },
  { id: '4', name: 'Kwame Darko', scale: 'Grade 8 Scale A', payrollNo: 'PAY-33829', dept: 'Transport', bank: 'Stanbic Bank', status: 'Active', baseSalary: '$2,100' },
];

export default function PayrollIntegrationPage() {
  const [search, setSearch] = useState('');

  const filtered = mockPayrollLedger.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.dept.toLowerCase().includes(search.toLowerCase()) ||
    p.payrollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Payroll & Compensation Profiles"
        subtitle="Manage employee compensation structures, salary grade assignments, pension codes, and bank ledger records."
        badge="Monthly Disbursement Cycle Ready"
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <span>Export Payroll Sheet</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>Configure Salary Scale</span>
            </button>
          </div>
        }
      />

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search payroll profiles by employee, payroll number, or department..."
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
                {['Staff Member', 'Department', 'Salary Scale', 'Payroll Number', 'Base Monthly', 'Payment Destination', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{row.name}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{row.dept}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-[hsl(var(--text-primary))] whitespace-nowrap">{row.scale}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-[hsl(var(--accent))] whitespace-nowrap">{row.payrollNo}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-emerald-400 whitespace-nowrap">{row.baseSalary}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">{row.bank}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
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
