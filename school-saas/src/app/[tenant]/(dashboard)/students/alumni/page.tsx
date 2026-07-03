'use client';

import { useState } from 'react';
import { Award, Mail, Phone, Calendar, ArrowUpRight, DollarSign } from 'lucide-react';

const mockAlumni = [
  { id: '1', name: 'Dr. Elizabeth Blackwell', classOf: 'Class of 2018', currentJob: 'General Resident at City Hospital', email: 'e.blackwell@cityhospital.org', totalDonated: 1200 },
  { id: '2', name: 'George Washington Carver', classOf: 'Class of 2015', currentJob: 'Agricultural Scientist', email: 'gw.carver@botanyres.org', totalDonated: 500 },
  { id: '3', name: 'Ada Lovelace', classOf: 'Class of 2020', currentJob: 'Software Architecture Consultant', email: 'ada@lovelace.io', totalDonated: 2500 }
];

export default function AlumniPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Alumni Network</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Track former students, manage recommendation requests, event registries, and donations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alumni registry directory */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Alumni Directory</h3>
          <div className="space-y-3">
            {mockAlumni.map(al => (
              <div key={al.id} className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{al.name}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">{al.classOf}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{al.currentJob}</p>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{al.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Total Donated</span>
                  <p className="text-sm font-bold text-emerald-400 flex items-center justify-end"><DollarSign className="w-3.5 h-3.5" />{al.totalDonated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests & letters panel */}
        <div className="glass-card p-5 space-y-4 h-fit">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Alumni Requests Queue</h3>
          <div className="space-y-3">
            {[
              { type: 'Transcript Request', name: 'Elizabeth Blackwell', date: 'Jul 2, 2026', status: 'Pending' },
              { type: 'Recommendation Letter', name: 'Ada Lovelace', date: 'Jun 29, 2026', status: 'In Progress' }
            ].map((req, k) => (
              <div key={k} className="p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border)/0.5)] flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[hsl(var(--text-primary))]">{req.type}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Requested by {req.name} • {req.date}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
