'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { AlertTriangle, Award, X, Plus, MessageSquare, Eye } from 'lucide-react';

type IncidentType = 'misconduct' | 'warning' | 'commendation' | 'achievement' | 'counselling' | 'incident';

const typeConfig: Record<IncidentType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  misconduct:   { label: 'Misconduct',    color: 'text-red-400',     bg: 'bg-red-500/15',     icon: AlertTriangle },
  warning:      { label: 'Warning',       color: 'text-orange-400',  bg: 'bg-orange-500/15',  icon: AlertTriangle },
  commendation: { label: 'Commendation',  color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: Award },
  achievement:  { label: 'Achievement',   color: 'text-blue-400',    bg: 'bg-blue-500/15',    icon: Award },
  counselling:  { label: 'Counselling',   color: 'text-purple-400',  bg: 'bg-purple-500/15',  icon: MessageSquare },
  incident:     { label: 'Incident',      color: 'text-amber-400',   bg: 'bg-amber-500/15',   icon: AlertTriangle },
};

const records = [
  { id: '1', student: 'Chukwuemeka Nwosu', class: 'SS2B', type: 'misconduct' as IncidentType, description: 'Disruptive behaviour during Mathematics class. Repeated talking after warning.', date: '2026-08-04', resolved: false },
  { id: '2', student: 'Damilola Adeyemi', class: 'SS2A', type: 'achievement' as IncidentType, description: 'Scored highest in class in Term 2 mid-term Mathematics examination.', date: '2026-08-03', resolved: true },
  { id: '3', student: 'Emmanuel Obi', class: 'SS2B', type: 'warning' as IncidentType, description: 'Submitted copied assignment. Received verbal warning and asked to redo.', date: '2026-08-02', resolved: true },
  { id: '4', student: 'Blessing Eze', class: 'SS2A', type: 'commendation' as IncidentType, description: 'Outstanding contribution to class discussion on Quadratic Equations.', date: '2026-08-01', resolved: true },
  { id: '5', student: 'Henry Adesanya', class: 'JS3A', type: 'counselling' as IncidentType, description: 'Student appeared withdrawn. Counselling session arranged with school counsellor.', date: '2026-07-30', resolved: false },
];

export function BehaviourTab({ teacher }: { teacher: TeacherData }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<IncidentType>('misconduct');
  const [filter, setFilter] = useState<'all' | IncidentType>('all');

  const filtered = records.filter((r) => filter === 'all' || r.type === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Behaviour & Discipline</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Record misconduct, commendations, and student observations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:scale-105 transition-all"
          style={{ background: teacher.primaryColor }}
        >
          <Plus className="w-4 h-4" /> New Record
        </button>
      </div>

      {/* Type Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(Object.entries(typeConfig) as [IncidentType, typeof typeConfig[IncidentType]][]).map(([type, cfg]) => {
          const count = records.filter((r) => r.type === type).length;
          const Icon = cfg.icon;
          return (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? 'all' : type)}
              className={`${cfg.bg} rounded-xl p-3 text-center transition-all hover:scale-105 ${filter === type ? 'ring-1 ring-current' : ''} ${cfg.color}`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <p className="text-base font-black">{count}</p>
              <p className="text-[9px] font-bold">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* New Record Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--accent)/0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[hsl(var(--text-primary))]">Record Behaviour Incident</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2">Type of Record</label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(typeConfig) as [IncidentType, typeof typeConfig[IncidentType]][]).map(([type, cfg]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedType === type ? `${cfg.bg} ${cfg.color} ring-1 ring-current` : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ label: 'Student Name', placeholder: 'Search student...' }, { label: 'Class', placeholder: 'e.g. SS2A' }].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Description</label>
              <textarea rows={3} placeholder="Describe the incident or commendation in detail..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Action Taken</label>
              <input placeholder="e.g. Verbal warning issued, parent notified" className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>Submit Record</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">Cancel</button>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="space-y-3">
        {filtered.map((record) => {
          const cfg = typeConfig[record.type];
          const Icon = cfg.icon;
          return (
            <div key={record.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs font-black text-[hsl(var(--text-primary))]">{record.student}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{record.class}</span>
                    {!record.resolved && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-black">Unresolved</span>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{record.description}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1.5">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]"><MessageSquare className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
