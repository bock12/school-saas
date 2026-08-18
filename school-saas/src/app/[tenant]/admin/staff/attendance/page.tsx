'use client';

import { useState } from 'react';
import {
  CalendarCheck, Search, Clock, ShieldAlert, CheckCircle2,
  AlertTriangle, Filter, Download, UserCheck, Smartphone, Wifi
} from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

const mockAttendance = [
  { id: '1', name: 'John Doe', role: 'Head of Mathematics', dept: 'Mathematics', checkIn: '07:45 AM', checkOut: '04:15 PM', status: 'Present', device: 'Biometric Scanner #2', punctuality: 'On Time' },
  { id: '2', name: 'Patricia Osei', role: 'Head of Admin', dept: 'Administration', checkIn: '07:32 AM', checkOut: '04:45 PM', status: 'Present', device: 'RFID Gate #1', punctuality: 'Early' },
  { id: '3', name: 'Kwame Darko', role: 'Bus Driver', dept: 'Transport', checkIn: '—', checkOut: '—', status: 'On Leave', device: 'Approved Leave Form', punctuality: 'Excused' },
  { id: '4', name: 'Dr. Raj Sharma', role: 'Physics Instructor', dept: 'Science', checkIn: '08:14 AM', checkOut: '04:05 PM', status: 'Present', device: 'Biometric Scanner #1', punctuality: 'Late (14m)' },
  { id: '5', name: 'Benjamin Asante', role: 'Senior Accountant', dept: 'Finance', checkIn: '07:48 AM', checkOut: '04:30 PM', status: 'Present', device: 'Biometric Scanner #2', punctuality: 'On Time' },
];

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filtered = mockAttendance.filter(row =>
    row.name.toLowerCase().includes(search.toLowerCase()) ||
    row.role.toLowerCase().includes(search.toLowerCase()) ||
    row.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Daily Staff Attendance Logs"
        subtitle="Live check-in and check-out logs integrated with biometric readers, RFID turnstiles, and mobile geotags."
        badge="95.2% Live Attendance Today"
        actionButton={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.2)] transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Manual Check-In</span>
            </button>
          </div>
        }
      />

      {/* Attendance Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Present Today', value: '76 Staff', sub: '95.2% of roster', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'On Leave', value: '4 Staff', sub: 'Approved absence', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Late Arrivals', value: '4 Staff', sub: 'After 08:00 AM', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
          { label: 'Total Verified', value: '80 / 84', sub: 'Biometric + RFID', icon: Wifi, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{kpi.label}</span>
              <div className={`p-1.5 rounded-lg border ${kpi.color}`}>
                <kpi.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-[hsl(var(--text-primary))]">{kpi.value}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Filter attendance by name, department, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>
      </div>

      {/* Responsive Table / Mobile Cards */}
      <div className="glass-card overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                {['Staff Member', 'Department & Role', 'Check-In', 'Check-Out', 'Punctuality', 'Status', 'Verification Node'].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))]">{row.name}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-secondary))] whitespace-nowrap">
                    <p className="font-semibold text-[hsl(var(--text-primary))]">{row.role}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{row.dept}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-[hsl(var(--text-primary))] whitespace-nowrap">{row.checkIn}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-[hsl(var(--text-secondary))] whitespace-nowrap">{row.checkOut}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      row.punctuality === 'Early' || row.punctuality === 'On Time'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : row.punctuality === 'Excused'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {row.punctuality}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      row.status === 'Present'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap flex items-center gap-1.5 pt-4">
                    <Wifi className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> {row.device}
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
