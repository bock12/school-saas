'use client';

import { useState } from 'react';
import { UserPlus, Search, ClipboardList, CheckCircle2, XCircle, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { HCMHeader } from '../_components/hcm-header';

const mockApplicants = [
  { id: '1', name: 'Robert Hooke', role: 'Physics Teacher', dept: 'Science', status: 'Screening', date: 'Jul 2, 2026', email: 'r.hooke@example.com', phone: '+1 555-0192', experience: '6 yrs' },
  { id: '2', name: 'Gregor Mendel', role: 'Biology Teacher', dept: 'Science', status: 'Interview Scheduled', date: 'Jun 28, 2026', email: 'g.mendel@example.com', phone: '+1 555-0193', experience: '8 yrs' },
  { id: '3', name: 'Jane Goodall', role: 'Biology Teacher', dept: 'Science', status: 'Offer Issued', date: 'Jun 25, 2026', email: 'j.goodall@example.com', phone: '+1 555-0194', experience: '10 yrs' },
  { id: '4', name: 'Alan Turing', role: 'Mathematics Teacher', dept: 'Mathematics', status: 'Screening', date: 'Jul 04, 2026', email: 'a.turing@example.com', phone: '+1 555-0195', experience: '5 yrs' },
];

export default function ApplicantsPage() {
  const [search, setSearch] = useState('');
  const [applicants, setApplicants] = useState(mockApplicants);

  const handleHire = (id: string, name: string) => {
    alert(`Candidate ${name} has been approved for hire! Onboarding flow initiated.`);
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'Hired & Onboarded' } : a));
  };

  const filtered = applicants.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Candidate Applicants"
        subtitle="Review prospective applicants, track interview schedules, review portfolio submissions, and issue offers."
        badge={`${filtered.length} Active Applicants`}
        actionButton={
          <Link
            href="/admin/staff/recruitment"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vacancies</span>
          </Link>
        }
      />

      {/* Filter toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search candidates by name or applied role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div className="glass-card overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                {['Candidate', 'Applied Position', 'Contact', 'Application Date', 'Stage Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{app.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{app.experience} experience</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] font-medium whitespace-nowrap">
                    <p className="font-bold text-[hsl(var(--text-primary))]">{app.role}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{app.dept} Department</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">
                    <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {app.email}</p>
                    <p className="flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" /> {app.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap flex items-center gap-1.5 pt-4">
                    <Calendar className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> {app.date}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      app.status === 'Offer Issued' || app.status.startsWith('Hired')
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : app.status === 'Interview Scheduled'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {app.status === 'Offer Issued' ? (
                      <button
                        type="button"
                        onClick={() => handleHire(app.id, app.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Hire
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--accent))] hover:underline"
                      >
                        Screen Candidate
                      </button>
                    )}
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
