'use client';

import { useState } from 'react';
import { DollarSign, Search, Plus, Award } from 'lucide-react';

const mockPayrollLedger = [
  { name: 'John Doe', scale: 'Grade 12 Scale A', payrollNo: 'PAY-48920', bank: 'Chase Bank', status: 'Active' },
  { name: 'Patricia Osei', scale: 'Grade 14 Scale C', payrollNo: 'PAY-10029', bank: 'HSBC Bank', status: 'Active' },
  { name: 'Benjamin Asante', scale: 'Grade 11 Scale B', payrollNo: 'PAY-22940', bank: 'Chase Bank', status: 'Active' }
];

export default function PayrollIntegrationPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Payroll &amp; Compensation Profiles</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure structural salary scales, allowances, pension codes, and bank ledger integrations.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Staff Member', 'Salary Scale', 'Payroll Number', 'Payment Method / Bank', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockPayrollLedger.map((row, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.scale}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))]">{row.payrollNo}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.bank}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
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
