'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { CalendarX, Plus, X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

type LeaveType = 'sick' | 'annual' | 'bereavement' | 'professional' | 'emergency' | 'study';

const leaveTypeConfig: Record<LeaveType, { label: string; color: string; bg: string }> = {
  sick:         { label: 'Sick Leave',          color: 'text-red-400',     bg: 'bg-red-500/15' },
  annual:       { label: 'Annual Leave',         color: 'text-blue-400',   bg: 'bg-blue-500/15' },
  bereavement:  { label: 'Bereavement Leave',    color: 'text-purple-400', bg: 'bg-purple-500/15' },
  professional: { label: 'Professional Dev',     color: 'text-amber-400',  bg: 'bg-amber-500/15' },
  emergency:    { label: 'Emergency Leave',      color: 'text-orange-400', bg: 'bg-orange-500/15' },
  study:        { label: 'Study Leave',          color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
};

const leaveHistory = [
  { id: '1', type: 'sick' as LeaveType, from: '2026-07-10', to: '2026-07-11', days: 2, reason: 'Fever and malaria', status: 'approved', substitute: 'Mr. Okafor' },
  { id: '2', type: 'professional' as LeaveType, from: '2026-06-15', to: '2026-06-17', days: 3, reason: 'Attended NMC-accredited training workshop', status: 'approved', substitute: 'Mrs. Eze' },
  { id: '3', type: 'annual' as LeaveType, from: '2026-08-20', to: '2026-08-24', days: 5, reason: 'Family vacation', status: 'pending', substitute: '' },
];

const statusConfig = {
  approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: CheckCircle },
  pending:  { label: 'Pending',  color: 'text-amber-400',   bg: 'bg-amber-500/15',   icon: Clock },
  rejected: { label: 'Rejected', color: 'text-red-400',     bg: 'bg-red-500/15',     icon: AlertTriangle },
};

const leaveBalance = [
  { type: 'Annual Leave',   total: 21, used: 3, remaining: 18 },
  { type: 'Sick Leave',     total: 15, used: 2, remaining: 13 },
  { type: 'Study Leave',    total: 5,  used: 0, remaining: 5 },
  { type: 'Other',          total: 5,  used: 0, remaining: 5 },
];

export function LeaveTab({ teacher }: { teacher: TeacherData }) {
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Leave Requests</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Apply for leave and track your application status</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:scale-105 transition-all"
          style={{ background: teacher.primaryColor }}
        >
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {leaveBalance.map((lb) => (
          <div key={lb.type} className="glass-card rounded-2xl p-4">
            <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{lb.remaining}</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{lb.type}</p>
            <div className="mt-2 h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[hsl(var(--accent))]"
                style={{ width: `${(lb.remaining / lb.total) * 100}%` }}
              />
            </div>
            <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-1">{lb.used} used of {lb.total}</p>
          </div>
        ))}
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--accent)/0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[hsl(var(--text-primary))]">Leave Application</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2">Leave Type</label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(leaveTypeConfig) as [LeaveType, typeof leaveTypeConfig[LeaveType]][]).map(([type, cfg]) => (
                  <button
                    key={type}
                    onClick={() => setLeaveType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${leaveType === type ? `${cfg.bg} ${cfg.color} ring-1 ring-current` : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ label: 'From Date', type: 'date' }, { label: 'To Date', type: 'date' }].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">{f.label}</label>
                  <input type={f.type} className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Substitute Teacher</label>
                <input placeholder="Who will cover your classes?" className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Contact Number</label>
                <input placeholder="Emergency contact during leave" className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Reason for Leave</label>
                <textarea rows={3} placeholder="Provide a brief reason..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>Submit Application</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">Cancel</button>
          </div>
        </div>
      )}

      {/* Leave History */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-black text-[hsl(var(--text-primary))] mb-4">Leave History</h2>
        <div className="space-y-4">
          {leaveHistory.map((leave) => {
            const typeCfg = leaveTypeConfig[leave.type];
            const statusCfg = statusConfig[leave.status as keyof typeof statusConfig];
            const StatusIcon = statusCfg.icon;
            return (
              <div key={leave.id} className="glass-card rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${typeCfg.bg} ${typeCfg.color}`}>{typeCfg.label}</span>
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black ${statusCfg.bg} ${statusCfg.color}`}>
                      <StatusIcon className="w-3 h-3" />{statusCfg.label}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[hsl(var(--text-primary))]">{leave.days} day{leave.days !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-xs font-semibold text-[hsl(var(--text-primary))] mb-1">{leave.reason}</p>
                <div className="flex flex-wrap gap-4 text-[10px] text-[hsl(var(--text-tertiary))]">
                  <span>{new Date(leave.from).toLocaleDateString()} – {new Date(leave.to).toLocaleDateString()}</span>
                  {leave.substitute && <span>Substitute: {leave.substitute}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
