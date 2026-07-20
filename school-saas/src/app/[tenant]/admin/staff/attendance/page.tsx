'use client';

import { useState } from 'react';
import { CalendarCheck, Search, Clock, ShieldAlert } from 'lucide-react';

const mockAttendance = [
  { name: 'John Doe', role: 'Head of Mathematics', checkIn: '07:45 AM', checkOut: '04:15 PM', status: 'Present', device: 'Biometric Scanner #2' },
  { name: 'Patricia Osei', role: 'Head of Admin', checkIn: '07:32 AM', checkOut: '04:45 PM', status: 'Present', device: 'RFID Gate #1' },
  { name: 'Kwame Darko', role: 'Bus Driver', checkIn: '07:15 AM', checkOut: '—', status: 'On Leave', device: 'Manual Override' }
];

export default function AttendancePage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Staff Daily Attendance Logs</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Review live check-in/out records linked to biometric devices, RFID readers, and manual overrides.</p>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search log..."
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
                {['Staff Member', 'Role', 'Check-In', 'Check-Out', 'Status', 'Verification Device'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAttendance.map((row, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--border)/0.5)] table-row-hover transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-[hsl(var(--text-primary))]">{row.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[hsl(var(--text-secondary))]">{row.role}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.checkIn}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))]">{row.checkOut}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      row.status === 'Present' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {row.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
