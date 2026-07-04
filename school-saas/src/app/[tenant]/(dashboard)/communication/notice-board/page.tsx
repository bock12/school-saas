'use client';

import { useState } from 'react';
import { Layers, Plus, Search } from 'lucide-react';

const mockNotices = [
  { id: '1', title: 'PTA Assembly Rescheduled to Jul 12', category: 'General', target: 'All Parents', date: '2026-07-04' },
  { id: '2', title: 'Practical Science Laboratory Rotations', category: 'Academics', target: 'SS2 Science Streams', date: '2026-07-02' }
];

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState(mockNotices);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Digital Notice Board</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Publish bulletins categorized by Campus, Grade, or specific Sports club boards.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Bulletin Notice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map(row => (
          <div key={row.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">{row.title}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-[hsl(var(--text-secondary))]">
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Notice Category</span>
                <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{row.category}</p>
              </div>
              <div>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Target Audience</span>
                <p className="font-semibold text-[hsl(var(--text-primary))] mt-1">{row.target}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
