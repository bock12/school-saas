'use client';

import { useState } from 'react';
import {
  LayoutGrid, Plus, Trash2, Edit3, X, Clock, Sun, Sunset, Layers,
  ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';

interface SlotDef {
  label: string;
  duration: number; // minutes
  isBreak: boolean;
}

interface TimetableTemplate {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  shift: 'morning' | 'afternoon' | 'full_day';
  startTime: string;
  slots: SlotDef[];
}

const initialTemplates: TimetableTemplate[] = [
  {
    id: 'tpl1',
    name: 'Standard 8-Period Day',
    description: 'Full-day schedule with 8 teaching periods, one short break, and one lunch break.',
    daysPerWeek: 5,
    shift: 'full_day',
    startTime: '07:30',
    slots: [
      { label: 'Period 1', duration: 45, isBreak: false },
      { label: 'Period 2', duration: 45, isBreak: false },
      { label: 'Period 3', duration: 45, isBreak: false },
      { label: 'Short Break', duration: 15, isBreak: true },
      { label: 'Period 4', duration: 45, isBreak: false },
      { label: 'Period 5', duration: 45, isBreak: false },
      { label: 'Lunch Break', duration: 30, isBreak: true },
      { label: 'Period 6', duration: 45, isBreak: false },
      { label: 'Period 7', duration: 45, isBreak: false },
      { label: 'Period 8', duration: 45, isBreak: false },
    ],
  },
  {
    id: 'tpl2',
    name: '6-Period Compact Day',
    description: 'Morning-focused schedule with 6 teaching periods and one break.',
    daysPerWeek: 5,
    shift: 'morning',
    startTime: '07:30',
    slots: [
      { label: 'Period 1', duration: 50, isBreak: false },
      { label: 'Period 2', duration: 50, isBreak: false },
      { label: 'Break', duration: 20, isBreak: true },
      { label: 'Period 3', duration: 50, isBreak: false },
      { label: 'Period 4', duration: 50, isBreak: false },
      { label: 'Period 5', duration: 50, isBreak: false },
      { label: 'Period 6', duration: 50, isBreak: false },
    ],
  },
];

const shiftConfig = {
  morning: { label: 'Morning Shift', icon: Sun, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  afternoon: { label: 'Afternoon Shift', icon: Sunset, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  full_day: { label: 'Full Day', icon: Layers, color: 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent)/0.3)]' },
};

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function computeSlotTimes(startTime: string, slots: SlotDef[]): { start: string; end: string }[] {
  const result: { start: string; end: string }[] = [];
  let current = startTime;
  for (const slot of slots) {
    const start = current;
    const end = addMinutes(current, slot.duration);
    result.push({ start, end });
    current = end;
  }
  return result;
}

function totalTeachingMinutes(slots: SlotDef[]) {
  return slots.filter(s => !s.isBreak).reduce((sum, s) => sum + s.duration, 0);
}

export function TimetableTemplates() {
  const [templates, setTemplates] = useState<TimetableTemplate[]>(initialTemplates);
  const [viewingTemplate, setViewingTemplate] = useState<TimetableTemplate | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    daysPerWeek: number;
    shift: 'morning' | 'afternoon' | 'full_day';
    startTime: string;
    slots: SlotDef[];
  }>({
    name: '',
    description: '',
    daysPerWeek: 5,
    shift: 'full_day',
    startTime: '07:30',
    slots: [
      { label: 'Period 1', duration: 45, isBreak: false },
      { label: 'Break', duration: 15, isBreak: true },
      { label: 'Period 2', duration: 45, isBreak: false },
    ],
  });

  const openAdd = () => {
    setForm({
      name: '',
      description: '',
      daysPerWeek: 5,
      shift: 'full_day',
      startTime: '07:30',
      slots: [
        { label: 'Period 1', duration: 45, isBreak: false },
        { label: 'Break', duration: 15, isBreak: true },
        { label: 'Period 2', duration: 45, isBreak: false },
      ],
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const openEdit = (tpl: TimetableTemplate) => {
    setForm({
      name: tpl.name,
      description: tpl.description,
      daysPerWeek: tpl.daysPerWeek,
      shift: tpl.shift,
      startTime: tpl.startTime,
      slots: [...tpl.slots.map(s => ({ ...s }))],
    });
    setEditingId(tpl.id);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setTemplates(prev => [...prev, { id: `tpl${Date.now()}`, ...form }]);
    }
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (viewingTemplate?.id === id) setViewingTemplate(null);
    setDeleteId(null);
  };

  const addSlot = (isBreak: boolean) => {
    const periodCount = form.slots.filter(s => !s.isBreak).length;
    setForm(p => ({
      ...p,
      slots: [...p.slots, { label: isBreak ? 'Break' : `Period ${periodCount + 1}`, duration: isBreak ? 15 : 45, isBreak }],
    }));
  };

  const removeSlot = (idx: number) => {
    setForm(p => ({ ...p, slots: p.slots.filter((_, i) => i !== idx) }));
  };

  const updateSlot = (idx: number, field: keyof SlotDef, value: string | number | boolean) => {
    setForm(p => ({ ...p, slots: p.slots.map((s, i) => i === idx ? { ...s, [field]: value } : s) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[hsl(var(--text-tertiary))]">
          <span className="font-semibold text-[hsl(var(--text-primary))]">{templates.length}</span> templates defined
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {templates.map(tpl => {
          const slotTimes = computeSlotTimes(tpl.startTime, tpl.slots);
          const endTime = slotTimes[slotTimes.length - 1]?.end || tpl.startTime;
          const teachingMins = totalTeachingMinutes(tpl.slots);
          const shiftCfg = shiftConfig[tpl.shift];
          const ShiftIcon = shiftCfg.icon;
          const teachingPeriods = tpl.slots.filter(s => !s.isBreak).length;
          const isViewing = viewingTemplate?.id === tpl.id;

          return (
            <div key={tpl.id} className="glass-card overflow-hidden">
              {/* Card Header */}
              <div className="p-4 border-b border-[hsl(var(--border)/0.5)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${shiftCfg.color}`}>
                      <ShiftIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">{tpl.name}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] truncate">{tpl.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(tpl)}
                      className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(tpl.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{tpl.startTime} – {endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{teachingPeriods} periods · {tpl.daysPerWeek} days/week</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{Math.floor(teachingMins / 60)}h {teachingMins % 60}m teaching</span>
                  </div>
                </div>
              </div>

              {/* Slot Timeline */}
              <div className="p-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {tpl.slots.map((slot, idx) => {
                    const widthPct = Math.round((slot.duration / tpl.slots.reduce((s, x) => s + x.duration, 0)) * 100);
                    return (
                      <div key={idx} className="flex items-center gap-1">
                        <div
                          className={`h-6 rounded-md flex items-center justify-center text-[10px] font-semibold px-1.5 min-w-[28px] ${
                            slot.isBreak
                              ? 'bg-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
                              : 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.3)]'
                          }`}
                          style={{ width: `${Math.max(widthPct * 2, 28)}px` }}
                          title={`${slot.label} (${slot.duration}m)`}
                        >
                          {slot.duration}m
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setViewingTemplate(isViewing ? null : tpl)}
                  className="mt-3 flex items-center gap-1.5 text-xs text-[hsl(var(--accent))] hover:underline transition-all"
                >
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isViewing ? 'rotate-90' : ''}`} />
                  {isViewing ? 'Hide' : 'View'} slot details
                </button>

                {isViewing && (
                  <div className="mt-3 space-y-1.5">
                    {tpl.slots.map((slot, idx) => {
                      const times = slotTimes[idx];
                      return (
                        <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg ${slot.isBreak ? 'bg-[hsl(var(--border)/0.3)]' : 'bg-[hsl(var(--bg-tertiary))]'}`}>
                          <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] w-20 shrink-0">
                            {times?.start} – {times?.end}
                          </span>
                          <span className={`text-xs font-semibold ${slot.isBreak ? 'text-[hsl(var(--text-tertiary))] italic' : 'text-[hsl(var(--text-primary))]'}`}>
                            {slot.label}
                          </span>
                          <span className="ml-auto text-[10px] text-[hsl(var(--text-tertiary))]">{slot.duration}m</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty */}
        {templates.length === 0 && (
          <div className="glass-card col-span-full p-12 text-center">
            <LayoutGrid className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-[hsl(var(--text-secondary))]">No templates yet</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Create a template to define the time slot structure for your timetables.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">
                {editingId ? 'Edit Template' : 'New Template'}
              </h3>
              <button onClick={() => setIsAdding(false)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Standard 8-Period Day"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                />
              </div>

              {/* Config Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Days / Week</label>
                  <select
                    value={form.daysPerWeek}
                    onChange={e => setForm(p => ({ ...p, daysPerWeek: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    {[5, 6].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>

              {/* Shift */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Shift</label>
                <div className="flex gap-2">
                  {(['morning', 'afternoon', 'full_day'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(p => ({ ...p, shift: s }))}
                      className={`flex-1 h-9 rounded-lg border text-xs font-medium transition-all ${form.shift === s ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]' : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.4)]'}`}
                    >
                      {shiftConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slots */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">Time Slots</label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {form.slots.map((slot, idx) => {
                    const times = computeSlotTimes(form.startTime, form.slots);
                    return (
                      <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${slot.isBreak ? 'bg-[hsl(var(--border)/0.3)]' : 'bg-[hsl(var(--bg-tertiary))]'}`}>
                        <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] w-20 shrink-0">
                          {times[idx]?.start}–{times[idx]?.end}
                        </span>
                        <input
                          type="text"
                          value={slot.label}
                          onChange={e => updateSlot(idx, 'label', e.target.value)}
                          className="flex-1 h-7 px-2 rounded-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                        <input
                          type="number"
                          value={slot.duration}
                          min={5}
                          max={180}
                          onChange={e => updateSlot(idx, 'duration', Number(e.target.value))}
                          className="w-16 h-7 px-2 rounded-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                        />
                        <span className="text-[10px] text-[hsl(var(--text-tertiary))]">min</span>
                        <button onClick={() => removeSlot(idx)} className="p-1 rounded text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => addSlot(false)} className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-dashed border-[hsl(var(--accent)/0.5)] text-[hsl(var(--accent))] text-xs hover:bg-[hsl(var(--accent)/0.05)] transition-colors">
                    <Plus className="w-3 h-3" /> Period
                  </button>
                  <button onClick={() => addSlot(true)} className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-dashed border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] text-xs hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                    <Plus className="w-3 h-3" /> Break
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsAdding(false)} className="flex-1 h-9 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 h-9 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                {editingId ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))]">Delete Template</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Timetables using this template will lose their slot structure reference.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-9 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 h-9 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
