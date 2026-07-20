'use client';

import { useState } from 'react';
import { Award, Search, ArrowUpRight } from 'lucide-react';

const mockRankings = [
  { rank: 1, name: 'Sarah Smith', classLink: 'SS1 Science', average: '94.2%', gpa: '4.00' },
  { rank: 2, name: 'Amara Johnson', classLink: 'SS1 Science', average: '92.8%', gpa: '3.90' },
  { rank: 3, name: 'David Smith', classLink: 'SS1 General', average: '88.5%', gpa: '3.65' }
];

export default function RankingsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockRankings.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Student Merit Lists &amp; Rankings</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review student rankings calculated from academic averages, GPA models, or credits completion rules.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {['Rank Position', 'Student Name', 'Class Level', 'Academic Average', 'GPA Score'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.rank} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-bold text-[hsl(var(--accent))] flex items-center gap-1.5"><Award className="w-4 h-4" /> #{row.rank}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.classLink}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-semibold">{row.average}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />{row.gpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
