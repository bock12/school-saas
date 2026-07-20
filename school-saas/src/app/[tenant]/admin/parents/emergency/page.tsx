'use client';

import { useState } from 'react';
import { Heart, Search, Phone, MapPin } from 'lucide-react';

const mockEmergencies = [
  { student: 'Amara Johnson', contacts: [
    { priority: 1, name: 'Mrs. Patricia Johnson', relation: 'Mother', phone: '+1 555-0101', pickupAuth: true },
    { priority: 2, name: 'Mr. David Johnson', relation: 'Father', phone: '+1 555-0102', pickupAuth: true }
  ]},
  { student: 'David Okafor', contacts: [
    { priority: 1, name: 'Mr. Emeka Okafor', relation: 'Father', phone: '+1 555-0102', pickupAuth: true },
    { priority: 2, name: 'Mrs. Chioma Okafor', relation: 'Aunt', phone: '+1 555-9022', pickupAuth: false }
  ]}
];

export default function EmergencyContactsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockEmergencies.filter(e =>
    e.student.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Emergency Contact Priority Lists</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review call hierarchies and pickup authorizations during school closures or medical incidents.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search student emergency contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="glass-card p-5 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> Student: {item.student}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.contacts.map(c => (
                <div key={c.priority} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Priority #{c.priority}: {c.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      c.pickupAuth ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {c.pickupAuth ? 'Pickup Auth' : 'No Pickup'}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{c.relation}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] flex items-center gap-1.5 pt-2"><Phone className="w-3.5 h-3.5" /> {c.phone}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
