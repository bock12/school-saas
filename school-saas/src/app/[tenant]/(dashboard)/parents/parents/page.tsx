'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, Search, Mail, Phone, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';

const mockParentsList = [
  { id: '1', name: 'Mrs. Rachel Johnson', email: 'rachel.johnson@email.com', phone: '+1 555-0101', children: ['Amara Johnson', 'Tony Johnson'], address: '42 Elm Street, Springfield' },
  { id: '2', name: 'Mr. Emeka Okafor', email: 'emeka.okafor@email.com', phone: '+1 555-0102', children: ['David Okafor'], address: '18 Oak Avenue, Riverside' }
];

export default function ParentsListPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const [search, setSearch] = useState('');

  const filtered = mockParentsList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Parents Registry</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Directory of all registered biological parents.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search parents..."
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
                {['Parent Name', 'Contact Info', 'Residential Address', 'Linked Children', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{p.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs space-y-1">
                      <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {p.email}</p>
                      <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {p.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {p.address}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5 flex-wrap">
                      {p.children.map(c => (
                        <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/${tenant}/parents/${p.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Profile
                    </Link>
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
