'use client';

import { useState } from 'react';
import { DollarSign, Search, Plus, Eye } from 'lucide-react';

const mockSponsors = [
  { id: '8', name: 'Pastor Samuel Adeyemi', org: 'Calvary Church Outreach', totalContribution: 2400, activeLinks: 1 },
  { id: '10', name: 'ABC Foundation Office', org: 'ABC Foundation Trust', totalContribution: 4800, activeLinks: 2 }
];

export default function SponsorsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockSponsors.filter(sp =>
    sp.name.toLowerCase().includes(search.toLowerCase()) ||
    sp.org.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Financial Sponsors &amp; Donors</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review active tuition sponsorship accounts. Note: sponsors are restricted from academic grade records access.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Sponsor
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search sponsors..."
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
                {['Sponsor Name', 'Organization', 'Active sponsorships', 'Total Contributions', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(sp => (
                <tr key={sp.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{sp.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{sp.org}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{sp.activeLinks} students</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-emerald-400 flex items-center"><DollarSign className="w-3.5 h-3.5" />{sp.totalContribution}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-xs text-[hsl(var(--accent))] font-semibold hover:underline flex items-center gap-1 ml-auto">
                      <Eye className="w-3.5 h-3.5" /> Finance ledger
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
