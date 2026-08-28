'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft, Sparkles, Download, AlertCircle, CheckCircle2, Clock,
  MapPin, User, X, Plus, Trash2, Edit2, Coffee, Zap,
  AlertTriangle, Save, Check
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 0=Mon … 4=Fri, or -1 for universal
  startTime: string;
  endTime: string;
  label: string;
  isBreak: boolean;
}

export interface TimetableEntry {
  id: string;
  slotId: string;
  dayOfWeek: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  classSectionId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  roomName: string;
  color: string;
}

export interface TimetableConflict {
  id: string;
  type: 'teacher_clash' | 'room_clash';
  description: string;
  severity: 'error' | 'warning';
}

export interface Timetable {
  id: string;
  name: string;
  academicYear: string;
  status: 'draft' | 'published' | 'archived';
  templateId: string;
  templateName?: string;
  entryCount?: number;
  lastModified?: string;
}

// ── Constants & Helpers ──────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SLOTS: TimetableSlot[] = [
  { id: 's1',  dayOfWeek: -1, startTime: '07:30', endTime: '08:15', label: 'Period 1',    isBreak: false },
  { id: 's2',  dayOfWeek: -1, startTime: '08:15', endTime: '09:00', label: 'Period 2',    isBreak: false },
  { id: 's3',  dayOfWeek: -1, startTime: '09:00', endTime: '09:45', label: 'Period 3',    isBreak: false },
  { id: 's4',  dayOfWeek: -1, startTime: '09:45', endTime: '10:00', label: 'Short Break', isBreak: true  },
  { id: 's5',  dayOfWeek: -1, startTime: '10:00', endTime: '10:45', label: 'Period 4',    isBreak: false },
  { id: 's6',  dayOfWeek: -1, startTime: '10:45', endTime: '11:30', label: 'Period 5',    isBreak: false },
  { id: 's7',  dayOfWeek: -1, startTime: '11:30', endTime: '12:15', label: 'Period 6',    isBreak: false },
  { id: 's8',  dayOfWeek: -1, startTime: '12:15', endTime: '13:00', label: 'Lunch',       isBreak: true  },
  { id: 's9',  dayOfWeek: -1, startTime: '13:00', endTime: '13:45', label: 'Period 7',    isBreak: false },
  { id: 's10', dayOfWeek: -1, startTime: '13:45', endTime: '14:30', label: 'Period 8',    isBreak: false },
];

const CLASSES = ['SS2A', 'SS2B', 'SS3A', 'JS3A', 'SS1A'];

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics':    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Further Maths':  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'English':        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Physics':        'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Chemistry':      'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Biology':        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'History':        'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Geography':      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'ICT':            'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'PE':             'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const getColor = (subject: string) => SUBJECT_COLORS[subject] || 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))]';

const ALL_SUBJECTS = ['Mathematics', 'Further Maths', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'ICT', 'PE'];
const ALL_TEACHERS = [
  { id: 't1', name: 'Mr. Asante' },
  { id: 't2', name: 'Ms. Williams' },
  { id: 't3', name: 'Dr. Mensah' },
  { id: 't4', name: 'Mrs. Boateng' },
  { id: 't5', name: 'Mr. Antwi' },
  { id: 't6', name: 'Ms. Owusu' },
  { id: 't7', name: 'Mr. Agyei' },
  { id: 't8', name: 'Mr. Darko' },
];
const ALL_ROOMS = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6', 'Room 7', 'Room 8', 'Room 9', 'Lab 1', 'Lab 2', 'ICT Lab'];

const BASE_ENTRIES: TimetableEntry[] = [
  // Monday
  { id: 'e1',  slotId: 's1',  dayOfWeek: 0, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't1', teacherName: 'Mr. Asante',   subject: 'Mathematics',   roomName: 'Lab 1',   color: '' },
  { id: 'e2',  slotId: 's1',  dayOfWeek: 0, classSectionId: 'ss2b', className: 'SS2B', teacherId: 't2', teacherName: 'Ms. Williams',  subject: 'English',       roomName: 'Room 3',  color: '' },
  { id: 'e3',  slotId: 's2',  dayOfWeek: 0, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't3', teacherName: 'Dr. Mensah',   subject: 'Physics',       roomName: 'Room 7',  color: '' },
  { id: 'e4',  slotId: 's2',  dayOfWeek: 0, classSectionId: 'ss3a', className: 'SS3A', teacherId: 't1', teacherName: 'Mr. Asante',   subject: 'Further Maths', roomName: 'Room 9',  color: '' },
  { id: 'e5',  slotId: 's3',  dayOfWeek: 0, classSectionId: 'js3a', className: 'JS3A', teacherId: 't4', teacherName: 'Mrs. Boateng', subject: 'Chemistry',     roomName: 'Lab 2',   color: '' },
  { id: 'e6',  slotId: 's3',  dayOfWeek: 0, classSectionId: 'ss2b', className: 'SS2B', teacherId: 't1', teacherName: 'Mr. Asante',   subject: 'Mathematics',   roomName: 'Lab 1',   color: '' },
  { id: 'e7',  slotId: 's5',  dayOfWeek: 0, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't5', teacherName: 'Mr. Antwi',    subject: 'Biology',       roomName: 'Room 5',  color: '' },
  { id: 'e8',  slotId: 's5',  dayOfWeek: 0, classSectionId: 'ss1a', className: 'SS1A', teacherId: 't2', teacherName: 'Ms. Williams',  subject: 'English',       roomName: 'Room 3',  color: '' },
  { id: 'e9',  slotId: 's6',  dayOfWeek: 0, classSectionId: 'ss3a', className: 'SS3A', teacherId: 't3', teacherName: 'Dr. Mensah',   subject: 'Physics',       roomName: 'Room 7',  color: '' },
  { id: 'e10', slotId: 's6',  dayOfWeek: 0, classSectionId: 'js3a', className: 'JS3A', teacherId: 't6', teacherName: 'Ms. Owusu',    subject: 'History',       roomName: 'Room 2',  color: '' },
  { id: 'e11', slotId: 's7',  dayOfWeek: 0, classSectionId: 'ss2b', className: 'SS2B', teacherId: 't4', teacherName: 'Mrs. Boateng', subject: 'Chemistry',     roomName: 'Lab 2',   color: '' },
  { id: 'e12', slotId: 's7',  dayOfWeek: 0, classSectionId: 'ss1a', className: 'SS1A', teacherId: 't1', teacherName: 'Mr. Asante',   subject: 'Mathematics',   roomName: 'Lab 1',   color: '' },
  { id: 'e13', slotId: 's9',  dayOfWeek: 0, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't7', teacherName: 'Mr. Agyei',    subject: 'ICT',           roomName: 'ICT Lab', color: '' },
  { id: 'e14', slotId: 's9',  dayOfWeek: 0, classSectionId: 'ss3a', className: 'SS3A', teacherId: 't1', teacherName: 'Mr. Asante',   subject: 'Further Maths', roomName: 'Room 9',  color: '' },
  { id: 'e15', slotId: 's10', dayOfWeek: 0, classSectionId: 'js3a', className: 'JS3A', teacherId: 't8', teacherName: 'Mr. Darko',    subject: 'Geography',     roomName: 'Room 6',  color: '' },
  // Tuesday
  { id: 'e16', slotId: 's1',  dayOfWeek: 1, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't2', teacherName: 'Ms. Williams',  subject: 'English',       roomName: 'Room 3',  color: '' },
  { id: 'e17', slotId: 's2',  dayOfWeek: 1, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't1', teacherName: 'Mr. Asante',   subject: 'Mathematics',   roomName: 'Lab 1',   color: '' },
  { id: 'e18', slotId: 's3',  dayOfWeek: 1, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't4', teacherName: 'Mrs. Boateng', subject: 'Chemistry',     roomName: 'Lab 2',   color: '' },
  { id: 'e19', slotId: 's5',  dayOfWeek: 1, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't7', teacherName: 'Mr. Agyei',    subject: 'ICT',           roomName: 'ICT Lab', color: '' },
  { id: 'e20', slotId: 's6',  dayOfWeek: 1, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't5', teacherName: 'Mr. Antwi',    subject: 'Biology',       roomName: 'Room 5',  color: '' },
  // Wednesday
  { id: 'e21', slotId: 's1',  dayOfWeek: 2, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't3', teacherName: 'Dr. Mensah',   subject: 'Physics',       roomName: 'Room 7',  color: '' },
  { id: 'e22', slotId: 's2',  dayOfWeek: 2, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't2', teacherName: 'Ms. Williams',  subject: 'English',       roomName: 'Room 3',  color: '' },
  { id: 'e23', slotId: 's5',  dayOfWeek: 2, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't1', teacherName: 'Mr. Asante',   subject: 'Mathematics',   roomName: 'Lab 1',   color: '' },
  // Thursday
  { id: 'e24', slotId: 's1',  dayOfWeek: 3, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't4', teacherName: 'Mrs. Boateng', subject: 'Chemistry',     roomName: 'Lab 2',   color: '' },
  { id: 'e25', slotId: 's3',  dayOfWeek: 3, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't3', teacherName: 'Dr. Mensah',   subject: 'Physics',       roomName: 'Room 7',  color: '' },
  { id: 'e26', slotId: 's6',  dayOfWeek: 3, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't1', teacherName: 'Mr. Asante',   subject: 'Mathematics',   roomName: 'Lab 1',   color: '' },
  // Friday
  { id: 'e27', slotId: 's1',  dayOfWeek: 4, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't7', teacherName: 'Mr. Agyei',    subject: 'ICT',           roomName: 'ICT Lab', color: '' },
  { id: 'e28', slotId: 's2',  dayOfWeek: 4, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't5', teacherName: 'Mr. Antwi',    subject: 'Biology',       roomName: 'Room 5',  color: '' },
  { id: 'e29', slotId: 's5',  dayOfWeek: 4, classSectionId: 'ss2a', className: 'SS2A', teacherId: 't2', teacherName: 'Ms. Williams',  subject: 'English',       roomName: 'Room 3',  color: '' },
].map(e => ({ ...e, color: getColor(e.subject) }));

// ── AI Schedule Generator ──────────────────────────────────────────────────
function generateSchedule(forClass: string): TimetableEntry[] {
  const subjects = ALL_SUBJECTS.slice(0, 8);
  const teachingSlots = SLOTS.filter(s => !s.isBreak);
  const entries: TimetableEntry[] = [];
  let subjectIdx = 0;

  for (let day = 0; day < 5; day++) {
    for (let p = 0; p < teachingSlots.length; p++) {
      const slot = teachingSlots[p];
      const subject = subjects[subjectIdx % subjects.length];
      const teacher = ALL_TEACHERS[(subjectIdx + day) % ALL_TEACHERS.length];
      const room = ALL_ROOMS[(subjectIdx + day) % ALL_ROOMS.length];

      entries.push({
        id: `ai-${day}-${p}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        slotId: slot.id,
        dayOfWeek: day,
        classSectionId: forClass.toLowerCase().replace(/\s/g, ''),
        className: forClass,
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject,
        roomName: room,
        color: getColor(subject),
      });
      subjectIdx++;
    }
  }
  return entries;
}

// ── Main Component ─────────────────────────────────────────────────────────
interface TimetableEditorProps {
  timetable: Timetable;
  onBack: () => void;
  onSave?: (updatedTimetable: Timetable, entries: TimetableEntry[]) => void;
}

export function TimetableEditor({ timetable, onBack, onSave }: TimetableEditorProps) {
  const [currentTimetable, setCurrentTimetable] = useState<Timetable>(timetable);
  const [entries, setEntries] = useState<TimetableEntry[]>(BASE_ENTRIES);
  const [selectedClass, setSelectedClass] = useState<string>('SS2A');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState('');
  const [showConflicts, setShowConflicts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Edit / Add modal states
  const [activeEntryModal, setActiveEntryModal] = useState<{
    mode: 'add' | 'edit';
    entry?: TimetableEntry;
    slotId: string;
    dayOfWeek: number;
  } | null>(null);

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({
    name: timetable.name,
    academicYear: timetable.academicYear,
    status: timetable.status,
  });

  const [entryForm, setEntryForm] = useState({
    className: 'SS2A',
    subject: 'Mathematics',
    teacherId: 't1',
    teacherName: 'Mr. Asante',
    roomName: 'Room 1',
  });

  // Drag & drop
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  // Visible entries filtered by class
  const visibleEntries = useMemo(() =>
    selectedClass === 'all' ? entries : entries.filter(e => e.classSectionId === selectedClass.toLowerCase().replace(/\s/g, '')),
    [entries, selectedClass]
  );

  // Get entries for a specific slot and day
  const getEntriesForSlotAndDay = useCallback((slotId: string, dayOfWeek: number) =>
    visibleEntries.filter(e => e.slotId === slotId && e.dayOfWeek === dayOfWeek),
    [visibleEntries]
  );

  // Conflict detection (same teacher double-booked in same slot and day)
  const conflicts = useMemo((): TimetableConflict[] => {
    const found: TimetableConflict[] = [];
    const teacherPerSlotDay: Record<string, Record<string, TimetableEntry[]>> = {};

    entries.forEach(e => {
      const key = `${e.slotId}-${e.dayOfWeek}`;
      if (!teacherPerSlotDay[key]) teacherPerSlotDay[key] = {};
      if (!teacherPerSlotDay[key][e.teacherId]) teacherPerSlotDay[key][e.teacherId] = [];
      teacherPerSlotDay[key][e.teacherId].push(e);
    });

    Object.entries(teacherPerSlotDay).forEach(([key, teacherMap]) => {
      const [slotId, dayStr] = key.split('-');
      const dayName = DAYS[parseInt(dayStr, 10)] || 'Unknown Day';
      const slotName = SLOTS.find(s => s.id === slotId)?.label || 'Slot';

      Object.entries(teacherMap).forEach(([, slotEntries]) => {
        if (slotEntries.length > 1) {
          found.push({
            id: `tc-${key}-${slotEntries[0].teacherId}`,
            type: 'teacher_clash',
            severity: 'error',
            description: `${slotEntries[0].teacherName} is double-booked on ${dayName} during ${slotName} across ${slotEntries.map(s => s.className).join(' & ')}.`,
          });
        }
      });
    });
    return found;
  }, [entries]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenProgress('Analyzing constraints and room capacity…');
    await new Promise(r => setTimeout(r, 700));
    setGenProgress('Running heuristic AI scheduling matrix…');
    await new Promise(r => setTimeout(r, 900));
    setGenProgress('Resolving teacher clashes and optimizing breaks…');
    await new Promise(r => setTimeout(r, 700));
    setGenProgress('Finalizing generated timetable slots…');

    const targetClasses = selectedClass === 'all' ? CLASSES : [selectedClass];
    const newEntries = targetClasses.flatMap(cls => generateSchedule(cls));

    setEntries(prev => [
      ...prev.filter(e => !targetClasses.some(c => c.toLowerCase().replace(/\s/g, '') === e.classSectionId)),
      ...newEntries,
    ]);

    setHasChanges(true);
    setGenProgress('Schedule generated successfully!');
    await new Promise(r => setTimeout(r, 500));
    setIsGenerating(false);
    setGenProgress('');
  };

  const handleOpenAdd = (slotId: string, dayOfWeek: number) => {
    setEntryForm({
      className: selectedClass === 'all' ? 'SS2A' : selectedClass,
      subject: 'Mathematics',
      teacherId: 't1',
      teacherName: 'Mr. Asante',
      roomName: 'Room 1',
    });
    setActiveEntryModal({ mode: 'add', slotId, dayOfWeek });
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setEntryForm({
      className: entry.className,
      subject: entry.subject,
      teacherId: entry.teacherId,
      teacherName: entry.teacherName,
      roomName: entry.roomName,
    });
    setActiveEntryModal({ mode: 'edit', entry, slotId: entry.slotId, dayOfWeek: entry.dayOfWeek });
  };

  const handleSaveEntryModal = () => {
    if (!activeEntryModal) return;

    if (activeEntryModal.mode === 'add') {
      const newEntry: TimetableEntry = {
        id: `m-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        slotId: activeEntryModal.slotId,
        dayOfWeek: activeEntryModal.dayOfWeek,
        classSectionId: entryForm.className.toLowerCase().replace(/\s/g, ''),
        className: entryForm.className,
        teacherId: entryForm.teacherId,
        teacherName: entryForm.teacherName,
        subject: entryForm.subject,
        roomName: entryForm.roomName,
        color: getColor(entryForm.subject),
      };
      setEntries(prev => [...prev, newEntry]);
    } else if (activeEntryModal.mode === 'edit' && activeEntryModal.entry) {
      const updatedId = activeEntryModal.entry.id;
      setEntries(prev => prev.map(e => e.id === updatedId ? {
        ...e,
        className: entryForm.className,
        classSectionId: entryForm.className.toLowerCase().replace(/\s/g, ''),
        subject: entryForm.subject,
        teacherId: entryForm.teacherId,
        teacherName: entryForm.teacherName,
        roomName: entryForm.roomName,
        color: getColor(entryForm.subject),
      } : e));
    }

    setHasChanges(true);
    setActiveEntryModal(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setHasChanges(true);
    if (activeEntryModal?.entry?.id === id) {
      setActiveEntryModal(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400));

    const updated: Timetable = {
      ...currentTimetable,
      name: metaForm.name,
      academicYear: metaForm.academicYear,
      status: metaForm.status,
      entryCount: entries.length,
      lastModified: 'Just now',
    };

    setCurrentTimetable(updated);
    if (onSave) {
      onSave(updated, entries);
    }

    setIsSaving(false);
    setHasChanges(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    let csv = 'Period,Time,' + DAYS.join(',') + '\n';
    SLOTS.filter(s => !s.isBreak).forEach(slot => {
      const row = [slot.label, `${slot.startTime} – ${slot.endTime}`];
      DAYS.forEach((_, dayIdx) => {
        const slotDayEntries = entries.filter(e => e.slotId === slot.id && e.dayOfWeek === dayIdx && (selectedClass === 'all' || e.classSectionId === selectedClass.toLowerCase().replace(/\s/g, '')));
        const text = slotDayEntries.map(e => `${e.className}: ${e.subject} (${e.teacherName} - ${e.roomName})`).join(' | ');
        row.push(`"${text}"`);
      });
      csv += row.join(',') + '\n';
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `timetable_${currentTimetable.name.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, entryId: string) => {
    setDraggedId(entryId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, cellId: string) => {
    e.preventDefault();
    setDragTarget(cellId);
  };
  const handleDrop = (e: React.DragEvent, targetSlotId: string, targetDay: number) => {
    e.preventDefault();
    if (!draggedId) return;
    setEntries(prev => prev.map(en => en.id === draggedId ? { ...en, slotId: targetSlotId, dayOfWeek: targetDay } : en));
    setDraggedId(null);
    setDragTarget(null);
    setHasChanges(true);
  };

  const statusColor = {
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    archived: 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]',
  }[currentTimetable.status];

  return (
    <div className="space-y-4">
      {/* Editor Header Card */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              All Timetables
            </button>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-black text-[hsl(var(--text-primary))]">{currentTimetable.name}</h2>
                <button
                  onClick={() => {
                    setMetaForm({
                      name: currentTimetable.name,
                      academicYear: currentTimetable.academicYear,
                      status: currentTimetable.status,
                    });
                    setIsEditingMeta(true);
                  }}
                  className="p-1 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors"
                  title="Edit timetable metadata"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${statusColor}`}>
                  {currentTimetable.status}
                </span>

                {conflicts.length > 0 ? (
                  <button
                    onClick={() => setShowConflicts(v => !v)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    No conflicts
                  </span>
                )}
              </div>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                {currentTimetable.academicYear} · {entries.length} scheduled periods
                {hasChanges && <span className="ml-2 text-amber-400 font-semibold">(Unsaved changes)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Class Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-[hsl(var(--text-tertiary))] hidden sm:inline">View:</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option value="all">All Classes Grid</option>
                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            {/* AI Generate */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[hsl(var(--accent)/0.12)] border border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.2)] text-xs font-bold transition-all disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'Scheduling…' : 'AI Generate'}
            </button>

            {/* Save Timetable Changes */}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Timetable</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generation Progress Bar */}
        {isGenerating && (
          <div className="mt-4 p-3 rounded-xl bg-[hsl(var(--accent)/0.07)] border border-[hsl(var(--accent)/0.2)] animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[hsl(var(--accent))] animate-pulse" />
              <span className="text-xs font-semibold text-[hsl(var(--accent))]">{genProgress}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] rounded-full animate-[progress_2.5s_ease-in-out_forwards]" style={{ width: '85%' }} />
            </div>
          </div>
        )}

        {/* Conflicts Panel */}
        {showConflicts && conflicts.length > 0 && (
          <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-red-400">Detected Scheduling Clashes ({conflicts.length})</span>
              <button onClick={() => setShowConflicts(false)} className="text-[10px] text-[hsl(var(--text-tertiary))] hover:underline">Dismiss</button>
            </div>
            {conflicts.map(c => (
              <div key={c.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/5 border border-red-500/15">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-[hsl(var(--text-secondary))]">{c.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timetable Interactive Grid */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 bg-[hsl(var(--bg-tertiary)/0.4)] border-b border-[hsl(var(--border))] flex items-center justify-between text-xs text-[hsl(var(--text-secondary))]">
          <span>💡 <strong>Tip:</strong> Click any scheduled entry to edit or delete it. Click any empty <strong>+</strong> cell to assign a period. Drag cards to reschedule.</span>
          <span className="font-semibold text-[hsl(var(--accent))]">{selectedClass === 'all' ? 'All Classes' : `Filter: ${selectedClass}`}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)]">
                <th className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-4 py-3.5 w-36">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                    Period & Time
                  </div>
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="text-center text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider px-2 py-3.5">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.4)]">
              {SLOTS.map(slot => {
                const isBreak = slot.isBreak;

                if (isBreak) {
                  return (
                    <tr key={slot.id} className="bg-[hsl(var(--bg-tertiary)/0.3)]">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                          <span className="text-xs font-bold text-[hsl(var(--text-tertiary))]">{slot.label}</span>
                        </div>
                        <span className="text-[10px] text-[hsl(var(--text-tertiary)/0.7)] font-mono">{slot.startTime}–{slot.endTime}</span>
                      </td>
                      {DAYS.map(day => (
                        <td key={day} className="px-2 py-2 text-center">
                          <span className="text-[11px] text-[hsl(var(--text-tertiary))] italic font-medium tracking-wide">
                            ☕ {slot.label} ({slot.startTime} – {slot.endTime})
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                }

                return (
                  <tr key={slot.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.15)] transition-colors">
                    {/* Slot Name & Time */}
                    <td className="px-4 py-3 align-top bg-[hsl(var(--bg-tertiary)/0.1)]">
                      <p className="text-xs font-black text-[hsl(var(--text-primary))]">{slot.label}</p>
                      <p className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] mt-0.5">{slot.startTime}–{slot.endTime}</p>
                    </td>

                    {/* Day Cells Mon - Fri */}
                    {DAYS.map((day, dayIdx) => {
                      const daySlotEntries = getEntriesForSlotAndDay(slot.id, dayIdx);
                      const cellId = `${slot.id}-${dayIdx}`;
                      const isDragTarget = dragTarget === cellId;

                      return (
                        <td
                          key={day}
                          className={`px-2 py-2.5 align-top transition-colors border-l border-[hsl(var(--border)/0.3)] min-w-[150px] ${isDragTarget ? 'bg-[hsl(var(--accent)/0.1)] ring-1 ring-[hsl(var(--accent))]' : ''}`}
                          onDragOver={e => handleDragOver(e, cellId)}
                          onDragLeave={() => setDragTarget(null)}
                          onDrop={e => handleDrop(e, slot.id, dayIdx)}
                        >
                          {daySlotEntries.length > 0 ? (
                            <div className="space-y-1.5">
                              {daySlotEntries.map(en => (
                                <div
                                  key={en.id}
                                  draggable
                                  onDragStart={e => handleDragStart(e, en.id)}
                                  onClick={() => handleOpenEdit(en)}
                                  className={`group relative p-2.5 rounded-xl border cursor-pointer hover:shadow-md hover:scale-[1.01] active:cursor-grabbing transition-all ${en.color}`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div>
                                      {selectedClass === 'all' && (
                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 mr-1">
                                          {en.className}
                                        </span>
                                      )}
                                      <span className="text-xs font-black leading-tight">{en.subject}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEntry(en.id);
                                      }}
                                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                                      title="Remove entry"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div className="mt-1.5 space-y-0.5 text-[10px] opacity-80">
                                    <div className="flex items-center gap-1">
                                      <User className="w-2.5 h-2.5 shrink-0" />
                                      <span className="truncate">{en.teacherName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-75">
                                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                                      <span>{en.roomName}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Allow adding another if in all class mode */}
                              {selectedClass === 'all' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAdd(slot.id, dayIdx)}
                                  className="w-full py-1 rounded-lg border border-dashed border-[hsl(var(--border))] text-[10px] font-semibold text-[hsl(var(--text-tertiary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-all flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAdd(slot.id, dayIdx)}
                              className="w-full h-16 rounded-xl border border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center gap-1 text-[hsl(var(--text-tertiary))] hover:border-[hsl(var(--accent)/0.6)] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.04)] transition-all group"
                            >
                              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Assign</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Color Legend */}
      <div className="glass-card p-4">
        <p className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2.5">Subject Color Index</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SUBJECT_COLORS).map(([sub, cls]) => (
            <span key={sub} className={`text-[11px] font-bold px-3 py-1 rounded-xl border ${cls}`}>{sub}</span>
          ))}
        </div>
      </div>

      {/* Modal: Add / Edit Period Entry */}
      {activeEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">
                  {activeEntryModal.mode === 'add' ? 'Assign Period Entry' : 'Edit Scheduled Period'}
                </h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  {DAYS[activeEntryModal.dayOfWeek]} · {SLOTS.find(s => s.id === activeEntryModal.slotId)?.label} ({SLOTS.find(s => s.id === activeEntryModal.slotId)?.startTime} – {SLOTS.find(s => s.id === activeEntryModal.slotId)?.endTime})
                </p>
              </div>
              <button
                onClick={() => setActiveEntryModal(null)}
                className="p-1.5 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Target Class</label>
                <select
                  value={entryForm.className}
                  onChange={e => setEntryForm(p => ({ ...p, className: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                >
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Subject</label>
                <select
                  value={entryForm.subject}
                  onChange={e => setEntryForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                >
                  {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Teacher</label>
                  <select
                    value={entryForm.teacherId}
                    onChange={e => {
                      const t = ALL_TEACHERS.find(teacher => teacher.id === e.target.value);
                      setEntryForm(p => ({ ...p, teacherId: e.target.value, teacherName: t?.name || '' }));
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    {ALL_TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Classroom / Lab</label>
                  <select
                    value={entryForm.roomName}
                    onChange={e => setEntryForm(p => ({ ...p, roomName: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    {ALL_ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[hsl(var(--border))]">
              {activeEntryModal.mode === 'edit' && activeEntryModal.entry ? (
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(activeEntryModal.entry!.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Period
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEntryModal(null)}
                  className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEntryModal}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 shadow-sm transition-opacity"
                >
                  {activeEntryModal.mode === 'add' ? 'Add Period' : 'Update Period'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Timetable Metadata */}
      {isEditingMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Edit Timetable Details</h3>
              <button
                onClick={() => setIsEditingMeta(false)}
                className="p-1.5 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Timetable Name</label>
                <input
                  type="text"
                  value={metaForm.name}
                  onChange={e => setMetaForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  placeholder="e.g. 2025/2026 Term 1 Master Schedule"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Academic Year</label>
                  <select
                    value={metaForm.academicYear}
                    onChange={e => setMetaForm(p => ({ ...p, academicYear: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={metaForm.status}
                    onChange={e => setMetaForm(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setIsEditingMeta(false)}
                className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentTimetable(prev => ({
                    ...prev,
                    name: metaForm.name,
                    academicYear: metaForm.academicYear,
                    status: metaForm.status,
                  }));
                  setHasChanges(true);
                  setIsEditingMeta(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 shadow-sm transition-opacity"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
