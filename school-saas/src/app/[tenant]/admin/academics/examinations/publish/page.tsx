'use client';

import { useState } from 'react';
import { FileText, Search, ShieldCheck } from 'lucide-react';

const mockPubs = [
  { id: '1', name: 'First Term Exams - Grade 10', date: '2026-12-18', published: 'No', parentPortalVisibility: 'Off' },
  { id: '2', name: 'Junior Secondary Assessment 1', date: '2026-10-25', published: 'Yes', parentPortalVisibility: 'On' }
];

export default function ResultPublicationPage() {
  const [pubs, setPubs] = useState(mockPubs);

  const togglePub = (id: string) => {
    setPubs(prev => prev.map(p => {
      if (p.id === id) {
        const isPub = p.published === 'Yes';
        return {
          ...p,
          published: isPub ? 'No' : 'Yes',
          parentPortalVisibility: isPub ? 'Off' : 'On'
        };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Results Publication Panel</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Publish verified final grades registers, toggle parent/student portals view availability, or withdraw marks sheets.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Examination', 'Planned Release Date', 'Published Status', 'Portal Visibility', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pubs.map((row) => (
                <tr key={row.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2"><FileText className="w-4 h-4 text-[hsl(var(--accent))]" /> {row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      row.published === 'Yes' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {row.published === 'Yes' ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Portal access: {row.parentPortalVisibility}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => togglePub(row.id)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 transition-opacity ${
                        row.published === 'Yes'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {row.published === 'Yes' ? 'Withdraw results' : 'Publish marks'}
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
