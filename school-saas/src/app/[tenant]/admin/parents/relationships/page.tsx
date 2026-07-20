'use client';

import { useState } from 'react';
import { Layers, Plus, Shield } from 'lucide-react';

const mockRelationships = [
  { adult: 'John Doe', student: 'Sarah Doe', relationship: 'Father', permissions: 'Academic + Finance' },
  { adult: 'Mary Doe', student: 'Sarah Doe', relationship: 'Mother', permissions: 'Full Access' },
  { adult: 'James Smith', student: 'Sarah Doe', relationship: 'Uncle', permissions: 'Pickup Only' },
  { adult: 'ABC Foundation Office', student: 'Sarah Doe', relationship: 'Sponsor', permissions: 'Finance Only' }
];

export default function RelationshipsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Student Relationships &amp; Permissions</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure student links and define strict portal access profiles for academics, behavior, or finances.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Link Adult to Student
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Adult Person', 'Student Child', 'Relationship', 'Portal Permission profile'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockRelationships.map((row, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.adult}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.student}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.relationship}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {row.permissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
