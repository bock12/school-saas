'use client';

import { useState } from 'react';
import { ArrowRightLeft, Plus, Mail, Upload, Calendar, ArrowRight } from 'lucide-react';

const demoTransfers = [
  { id: '1', name: 'Oliver Twist', type: 'Incoming', school: 'London Grammar School', date: 'Jul 2, 2026', status: 'Approved', class: 'Grade 9' },
  { id: '2', name: 'Emily Bronte', type: 'Outgoing', school: 'Yorkshire Academy', date: 'Jun 28, 2026', status: 'Completed', class: 'Grade 10' },
  { id: '3', name: 'Charles Dickens', type: 'Incoming', school: 'Victorian Public School', date: 'Jun 20, 2026', status: 'Verification', class: 'Grade 8' }
];

export default function TransfersPage() {
  const [transferType, setTransferType] = useState<'Incoming' | 'Outgoing'>('Incoming');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Transfers Management</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Record and manage incoming transfers from other schools or outbound withdrawals and relocations.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Record Transfer
        </button>
      </div>

      {/* Type selection */}
      <div className="glass-card p-1 flex gap-1 w-fit">
        {['Incoming', 'Outgoing'].map((type) => (
          <button
            key={type}
            onClick={() => setTransferType(type as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              transferType === type
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            {type} Transfers
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfers table */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Student Name', 'Class', 'Associated School', 'Transfer Date', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoTransfers.filter(t => t.type === transferType).map(t => (
                  <tr key={t.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{t.name}</td>
                    <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{t.class}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{t.school}</td>
                    <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {t.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        t.status === 'Completed' || t.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfer certificates tool/form */}
        <div className="glass-card p-5 space-y-4 h-fit">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Generate Outgoing Certificate</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Select Student</label>
              <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                <option>Select Student...</option>
                <option>Emily Bronte (STU-008)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Destination School</label>
              <input type="text" placeholder="e.g. Yorkshire Academy" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
            </div>
            <button className="w-full py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-semibold hover:opacity-95 transition-opacity">
              Download Official Transfer Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
