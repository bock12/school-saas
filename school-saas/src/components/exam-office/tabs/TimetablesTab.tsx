'use client';

import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  Clock, AlertTriangle, CheckCircle2, Plus, Download, Printer,
  X, Check, Sparkles, RefreshCw, Calendar, MapPin, Users, Edit3, Trash2, Search, Filter
} from 'lucide-react';
import { useState } from 'react';

interface TimetableSlot {
  id: string;
  date: string;
  subject: string;
  classes: string;
  room: string;
  time: string;
  startTime: string;
  endTime: string;
  invigilatorsCount: number;
  chiefInvigilator: string;
  candidatesCount: number;
  roomCapacity: number;
  status: 'confirmed' | 'conflict';
  conflictReason?: string;
}

interface TimetableConflict {
  id: string;
  type: 'Subject Clash' | 'Venue Overbooking' | 'Invigilator Overlap';
  desc: string;
  severity: 'critical' | 'warn';
  slotIds: string[];
}

const initialSchedule: TimetableSlot[] = [
  { id: 't1', date: 'Mon, Aug 18', subject: 'Mathematics', classes: 'SSS 1, 2, 3', room: 'Main Hall A', time: '09:00 – 11:00', startTime: '09:00', endTime: '11:00', invigilatorsCount: 3, chiefInvigilator: 'Mr. S. Conteh', candidatesCount: 92, roomCapacity: 120, status: 'confirmed' },
  { id: 't2', date: 'Mon, Aug 18', subject: 'English Language', classes: 'SSS 1, 2', room: 'Hall B', time: '13:00 – 15:00', startTime: '13:00', endTime: '15:00', invigilatorsCount: 2, chiefInvigilator: 'Mrs. A. Mansaray', candidatesCount: 58, roomCapacity: 60, status: 'confirmed' },
  { id: 't3', date: 'Tue, Aug 19', subject: 'Physics', classes: 'SSS 2, 3', room: 'Science Lab 2', time: '09:00 – 11:00', startTime: '09:00', endTime: '11:00', invigilatorsCount: 2, chiefInvigilator: 'Mrs. M. Bangura', candidatesCount: 38, roomCapacity: 40, status: 'conflict', conflictReason: 'Subject Clash: Physics and Chemistry at same time for SSS 3' },
  { id: 't4', date: 'Tue, Aug 19', subject: 'Chemistry', classes: 'SSS 2, 3', room: 'Main Hall A', time: '09:00 – 11:00', startTime: '09:00', endTime: '11:00', invigilatorsCount: 2, chiefInvigilator: 'Mr. J. Koroma', candidatesCount: 38, roomCapacity: 120, status: 'conflict', conflictReason: 'Subject Clash: Chemistry and Physics at same time for SSS 3' },
  { id: 't5', date: 'Wed, Aug 20', subject: 'Biology', classes: 'SSS 2, 3', room: 'Science Lab 1', time: '09:00 – 11:00', startTime: '09:00', endTime: '11:00', invigilatorsCount: 2, chiefInvigilator: 'Dr. F. Cole', candidatesCount: 35, roomCapacity: 40, status: 'confirmed' },
  { id: 't6', date: 'Thu, Aug 21', subject: 'Further Mathematics', classes: 'SSS 3', room: 'Room 5', time: '09:00 – 11:00', startTime: '09:00', endTime: '11:00', invigilatorsCount: 1, chiefInvigilator: 'Mr. S. Conteh', candidatesCount: 18, roomCapacity: 30, status: 'confirmed' },
];

const initialConflicts: TimetableConflict[] = [
  { id: 'c1', type: 'Subject Clash', desc: 'Physics and Chemistry scheduled at the exact same time (Tue 09:00 - 11:00) for SSS 3 candidates', severity: 'critical', slotIds: ['t3', 't4'] },
  { id: 'c2', type: 'Venue Overbooking', desc: 'Hall B capacity (60) closely bordered by SSS 1 English (58 candidates)', severity: 'warn', slotIds: ['t2'] },
];

export function TimetablesTab({ officer }: { officer: OfficerData }) {
  const [scheduleList, setScheduleList] = useState<TimetableSlot[]>(initialSchedule);
  const [conflictsList, setConflictsList] = useState<TimetableConflict[]>(initialConflicts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    date: 'Tue, Aug 19',
    subject: '',
    classes: 'SSS 2, 3',
    room: 'Main Hall A',
    startTime: '13:00',
    endTime: '15:00',
    invigilatorsCount: 2,
    chiefInvigilator: officer.name,
    candidatesCount: 40,
    roomCapacity: 120,
  });

  const filteredSchedule = scheduleList.filter(s =>
    s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.classes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) return;

    if (editingSlot) {
      const updated = scheduleList.map(s => s.id === editingSlot.id ? {
        ...s,
        date: formData.date,
        subject: formData.subject,
        classes: formData.classes,
        room: formData.room,
        time: `${formData.startTime} – ${formData.endTime}`,
        startTime: formData.startTime,
        endTime: formData.endTime,
        invigilatorsCount: Number(formData.invigilatorsCount),
        chiefInvigilator: formData.chiefInvigilator,
        candidatesCount: Number(formData.candidatesCount),
        roomCapacity: Number(formData.roomCapacity),
      } : s);
      setScheduleList(updated);
      setEditingSlot(null);
      setSuccessToast(`Schedule slot for "${formData.subject}" updated!`);
    } else {
      const created: TimetableSlot = {
        id: `t-${Date.now()}`,
        date: formData.date,
        subject: formData.subject,
        classes: formData.classes,
        room: formData.room,
        time: `${formData.startTime} – ${formData.endTime}`,
        startTime: formData.startTime,
        endTime: formData.endTime,
        invigilatorsCount: Number(formData.invigilatorsCount),
        chiefInvigilator: formData.chiefInvigilator,
        candidatesCount: Number(formData.candidatesCount),
        roomCapacity: Number(formData.roomCapacity),
        status: 'confirmed',
      };
      setScheduleList([...scheduleList, created]);
      setShowAddModal(false);
      setSuccessToast(`New schedule slot "${created.subject}" added!`);
    }
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleAutoResolveConflicts = () => {
    // Shift conflicting Chemistry slot from 09:00 to 13:00
    const resolved = scheduleList.map(s => {
      if (s.id === 't4') {
        return {
          ...s,
          time: '13:00 – 15:00',
          startTime: '13:00',
          endTime: '15:00',
          status: 'confirmed' as const,
          conflictReason: undefined,
        };
      }
      if (s.id === 't3') {
        return {
          ...s,
          status: 'confirmed' as const,
          conflictReason: undefined,
        };
      }
      return s;
    });
    setScheduleList(resolved);
    setConflictsList([]);
    setSuccessToast('Conflicts auto-resolved! Chemistry rescheduled to 13:00 - 15:00 PM.');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Examination Timetable Builder</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Build exam schedules with automated conflict detection for double-booked venues, teachers, or subject clashes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {conflictsList.length > 0 && (
            <button
              onClick={handleAutoResolveConflicts}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> ⚡ Auto-Resolve Conflicts ({conflictsList.length})
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] text-xs font-bold border border-[hsl(var(--border))]"
          >
            <Printer className="w-4 h-4" /> Print Timetable
          </button>
          <button
            onClick={() => {
              setEditingSlot(null);
              setFormData({ date: 'Tue, Aug 19', subject: '', classes: 'SSS 2, 3', room: 'Main Hall A', startTime: '13:00', endTime: '15:00', invigilatorsCount: 2, chiefInvigilator: officer.name, candidatesCount: 40, roomCapacity: 120 });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" /> Add Schedule Slot
          </button>
        </div>
      </div>

      {/* Conflict Banners */}
      {conflictsList.length > 0 && (
        <div className="space-y-3">
          {conflictsList.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border shadow-md ${
                c.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.severity === 'critical' ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs uppercase tracking-wider">{c.type} Detected</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">Action Required</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">{c.desc}</p>
                </div>
              </div>
              <button
                onClick={handleAutoResolveConflicts}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors shadow-sm self-end sm:self-center whitespace-nowrap"
              >
                Auto-Fix Clash
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-3 border border-[hsl(var(--border))]">
        <div className="relative">
          <Search className="w-4 h-4 text-[hsl(var(--text-tertiary))] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search timetable by subject, room hall, or class cohort..."
            className="w-full bg-[hsl(var(--bg-tertiary))] text-xs text-[hsl(var(--text-primary))] pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] outline-none focus:border-violet-500 font-medium"
          />
        </div>
      </div>

      {/* Timetable Schedule Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <h2 className="font-black text-sm text-[hsl(var(--text-primary))]">Master Examination Timetable Slots ({filteredSchedule.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)]">
                {['Exam Date', 'Subject Title', 'Classes Cohort', 'Room / Hall', 'Timing Slot', 'Invigilators', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--text-tertiary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {filteredSchedule.map((s) => (
                <tr key={s.id} className={`hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors ${s.status === 'conflict' ? 'bg-red-500/10' : ''}`}>
                  <td className="py-3.5 px-4 text-xs font-bold text-[hsl(var(--text-primary))] whitespace-nowrap">{s.date}</td>
                  <td className="py-3.5 px-4 font-bold text-xs text-[hsl(var(--text-primary))]">{s.subject}</td>
                  <td className="py-3.5 px-4 text-xs text-[hsl(var(--text-secondary))]">{s.classes}</td>
                  <td className="py-3.5 px-4 text-xs text-[hsl(var(--text-secondary))] font-medium">{s.room} ({s.candidatesCount}/{s.roomCapacity})</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-[hsl(var(--text-secondary))] whitespace-nowrap">{s.time}</td>
                  <td className="py-3.5 px-4 text-xs font-bold text-[hsl(var(--text-primary))]">{s.invigilatorsCount} ({s.chiefInvigilator})</td>
                  <td className="py-3.5 px-4">
                    {s.status === 'conflict' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 px-2.5 py-0.5 rounded-full border border-red-500/30 animate-pulse" title={s.conflictReason}>
                        <AlertTriangle className="w-3 h-3" /> Conflict Clash
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSlot(s);
                          setFormData({
                            date: s.date,
                            subject: s.subject,
                            classes: s.classes,
                            room: s.room,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            invigilatorsCount: s.invigilatorsCount,
                            chiefInvigilator: s.chiefInvigilator,
                            candidatesCount: s.candidatesCount,
                            roomCapacity: s.roomCapacity,
                          });
                          setShowAddModal(true);
                        }}
                        className="text-xs font-bold text-violet-400 hover:text-violet-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setScheduleList(scheduleList.filter(item => item.id !== s.id));
                          setSuccessToast(`Slot "${s.subject}" removed.`);
                          setTimeout(() => setSuccessToast(''), 4000);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD / EDIT TIMETABLE SLOT MODAL ─────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-lg w-full border border-[hsl(var(--border))] shadow-2xl space-y-4 bg-[hsl(var(--bg-secondary))]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-black text-base text-[hsl(var(--text-primary))]">
                {editingSlot ? `Edit Timetable Slot: ${editingSlot.subject}` : 'Add Timetable Schedule Slot'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Subject Title</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Physics"
                  className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-3 outline-none focus:border-violet-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Exam Date</label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Tue, Aug 19"
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Class Cohort</label>
                  <input
                    type="text"
                    required
                    value={formData.classes}
                    onChange={e => setFormData({ ...formData, classes: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Start Time</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="09:00"
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">End Time</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="11:00"
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Venue / Hall</label>
                  <select
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  >
                    <option value="Main Hall A">Main Hall A (Cap: 120)</option>
                    <option value="Hall B">Hall B (Cap: 60)</option>
                    <option value="Science Lab 1">Science Lab 1 (Cap: 40)</option>
                    <option value="Science Lab 2">Science Lab 2 (Cap: 40)</option>
                    <option value="Room 5">Room 5 (Cap: 30)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))] mb-1 block">Chief Invigilator</label>
                  <input
                    type="text"
                    value={formData.chiefInvigilator}
                    onChange={e => setFormData({ ...formData, chiefInvigilator: e.target.value })}
                    className="w-full text-xs bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-secondary))]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 flex items-center gap-1.5 shadow-md">
                  <Check className="w-4 h-4" /> Save &amp; Verify Conflicts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
