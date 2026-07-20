'use client';

import { useState } from 'react';
import { GraduationCap, Award, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const mockGraduates = [
  { id: '1', name: 'Albert Einstein', GPA: '4.0', status: 'Approved', class: 'Grade 12 Science', clearingStatus: 'Cleared' },
  { id: '2', name: 'Marie Curie', GPA: '3.95', status: 'Approved', class: 'Grade 12 Science', clearingStatus: 'Cleared' },
  { id: '3', name: 'Isaac Newton', GPA: '3.9', status: 'Pending Review', class: 'Grade 12 Commercial', clearingStatus: 'Fees Owed' }
];

export default function GraduationPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Graduation Module</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Finalize academic records, generate student transcripts, and promote to Alumni status.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <GraduationCap className="w-4 h-4" /> Graduate Class
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates Table */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Graduation Candidates</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Candidate', 'Class', 'GPA', 'Tuition Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockGraduates.map(grad => (
                  <tr key={grad.id} className="border-b border-[hsl(var(--border)/0.5)] last:border-0 hover:bg-[hsl(var(--bg-tertiary)/0.3)]">
                    <td className="px-3 py-3 text-sm font-semibold text-[hsl(var(--text-primary))]">{grad.name}</td>
                    <td className="px-3 py-3 text-xs text-[hsl(var(--text-secondary))]">{grad.class}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-[hsl(var(--accent))]">{grad.GPA}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        grad.clearingStatus === 'Cleared' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>{grad.clearingStatus}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {grad.clearingStatus === 'Cleared' ? (
                        <button className="text-xs text-[hsl(var(--accent))] font-semibold hover:underline flex items-center gap-1.5 ml-auto">
                          Issue Transcript <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs text-[hsl(var(--text-tertiary))]">Hold Clearance</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Graduation processing rules/summary */}
        <div className="glass-card p-5 space-y-4 h-fit">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Graduation Actions</h3>
          <div className="space-y-3.5 text-xs text-[hsl(var(--text-secondary))]">
            <p className="font-semibold text-[hsl(var(--text-primary))]">Required Checklists:</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))]" /> Term 3 Exams marks finalized</label>
              <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))]" /> Finance tuition ledger audit checks</label>
              <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))]" /> Move approved to alumni status pool</label>
            </div>
            <button className="w-full py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white font-semibold text-xs hover:opacity-95 transition-opacity mt-4">
              Export Graduates Transcripts (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
