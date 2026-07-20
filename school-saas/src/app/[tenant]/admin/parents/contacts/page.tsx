'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Search, Mail, Phone, MapPin, Eye, CheckCircle2, ShieldAlert, DollarSign } from 'lucide-react';
import Link from 'next/link';

type ContactType = 'Parent' | 'Guardian' | 'Sponsor' | 'Other';

const mockContactsList = [
  { id: '1', name: 'Mrs. Rachel Johnson', type: 'Parent', email: 'rachel.johnson@email.com', phone: '+1 555-0101', children: ['Amara Johnson', 'Tony Johnson'], address: '42 Elm Street, Springfield', portalAccess: true, isEmergency: true, isFinancial: true },
  { id: '2', name: 'Mr. Emeka Okafor', type: 'Guardian', email: 'emeka.okafor@email.com', phone: '+1 555-0102', children: ['David Okafor'], address: '18 Oak Avenue, Riverside', portalAccess: true, isEmergency: true, isFinancial: false },
  { id: '3', name: 'Global Scholarship Fund', type: 'Sponsor', email: 'billing@gsf.org', phone: '+1 555-0999', children: ['Sarah Connor'], address: '100 Finance Blvd, NY', portalAccess: false, isEmergency: false, isFinancial: true }
];

export default function ContactsListPage() {
  const [search, setSearch] = useState('');

  const filtered = mockContactsList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full max-w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Parents & Contacts Registry</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Directory of all registered parents, guardians, and sponsors.</p>
        </div>
        <Link href={`/admin/parents/contacts/new`} className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white font-semibold text-sm hover:opacity-90 transition-opacity">
          + Add Contact
        </Link>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search contacts..."
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
                {['Contact Name', 'Type & Permissions', 'Contact Info', 'Linked Children', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-semibold text-[hsl(var(--text-primary))]">{p.name}</div>
                    <div className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {p.address}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      <span className="inline-block w-fit px-2 py-0.5 rounded text-xs font-medium bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))]">{p.type}</span>
                      <div className="flex gap-1">
                        {p.portalAccess && <span title="Portal Access" className="p-1 rounded bg-blue-500/10 text-blue-500"><CheckCircle2 className="w-3.5 h-3.5" /></span>}
                        {p.isEmergency && <span title="Emergency Contact" className="p-1 rounded bg-rose-500/10 text-rose-500"><ShieldAlert className="w-3.5 h-3.5" /></span>}
                        {p.isFinancial && <span title="Financial Sponsor" className="p-1 rounded bg-emerald-500/10 text-emerald-500"><DollarSign className="w-3.5 h-3.5" /></span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs space-y-1">
                      <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {p.email}</p>
                      <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {p.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5 flex-wrap">
                      {p.children.map(c => (
                        <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/parents/${p.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
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
