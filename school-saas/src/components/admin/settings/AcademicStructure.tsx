'use client';

import React, { useState } from 'react';
import {
  Plus, Trash2, Save, Layers, Workflow,
  Settings2, CheckCircle2, AlertCircle, ChevronRight,
  School, Calendar, GraduationCap, Users, X, Pencil,
  Award, Check, BookOpen, RefreshCw
} from 'lucide-react';

export interface TermConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  terms: TermConfig[];
}

export interface GradeStructure {
  level: string; // e.g. "SS1", "JSS1"
  streams: string[]; // e.g. ["Science", "Arts", "Commercial"]
  sectionsPerStream: number;
}

interface AcademicStructureProps {
  organization?: { id?: string; name?: string };
  isEmbedded?: boolean;
}

const INITIAL_YEARS: AcademicYear[] = [
  {
    id: 'ay_2025_2026',
    name: '2025/2026',
    startDate: '2025-09-01',
    endDate: '2026-07-31',
    isCurrent: true,
    terms: [
      { id: 'term_1', name: 'First Term', startDate: '2025-09-01', endDate: '2025-12-20' },
      { id: 'term_2', name: 'Second Term', startDate: '2026-01-05', endDate: '2026-04-10' },
      { id: 'term_3', name: 'Third Term', startDate: '2026-04-25', endDate: '2026-07-20' },
    ],
  },
  {
    id: 'ay_2026_2027',
    name: '2026/2027',
    startDate: '2026-09-01',
    endDate: '2027-07-31',
    isCurrent: false,
    terms: [
      { id: 'term_1', name: 'First Term', startDate: '2026-09-01', endDate: '2026-12-20' },
      { id: 'term_2', name: 'Second Term', startDate: '2027-01-05', endDate: '2027-04-10' },
      { id: 'term_3', name: 'Third Term', startDate: '2027-04-25', endDate: '2027-07-20' },
    ],
  },
];

export default function AcademicStructure({ organization, isEmbedded = false }: AcademicStructureProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(INITIAL_YEARS);
  const [selectedYear, setSelectedYear] = useState<string>('ay_2025_2026');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  // Modals
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deletingYear, setDeletingYear] = useState<AcademicYear | null>(null);

  const [newYearData, setNewYearData] = useState({
    name: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    startDate: `${new Date().getFullYear()}-09-01`,
    endDate: `${new Date().getFullYear() + 1}-07-31`,
    terms: [
      { id: 'term_1', name: 'First Term', startDate: `${new Date().getFullYear()}-09-01`, endDate: `${new Date().getFullYear()}-12-20` },
      { id: 'term_2', name: 'Second Term', startDate: `${new Date().getFullYear() + 1}-01-05`, endDate: `${new Date().getFullYear() + 1}-04-10` },
      { id: 'term_3', name: 'Third Term', startDate: `${new Date().getFullYear() + 1}-04-25`, endDate: `${new Date().getFullYear() + 1}-07-20` },
    ],
  });

  const [editYearData, setEditYearData] = useState<{
    name: string;
    startDate: string;
    endDate: string;
    terms: TermConfig[];
  }>({
    name: '',
    startDate: '',
    endDate: '',
    terms: [],
  });

  // Secondary & Basic School Structure State
  const [gradeStructures, setGradeStructures] = useState<GradeStructure[]>([
    { level: 'JSS 1', streams: ['General'], sectionsPerStream: 2 },
    { level: 'JSS 2', streams: ['General'], sectionsPerStream: 2 },
    { level: 'JSS 3', streams: ['General'], sectionsPerStream: 2 },
    { level: 'SS 1', streams: ['Science', 'Arts', 'Commercial'], sectionsPerStream: 1 },
    { level: 'SS 2', streams: ['Science', 'Arts', 'Commercial'], sectionsPerStream: 1 },
    { level: 'SS 3', streams: ['Science', 'Arts', 'Commercial'], sectionsPerStream: 1 },
  ]);

  const [generatedCount, setGeneratedCount] = useState<number>(0);

  const addGradeLevel = () => {
    setGradeStructures(prev => [...prev, { level: 'New Level', streams: ['General'], sectionsPerStream: 1 }]);
  };

  const removeGradeLevel = (index: number) => {
    setGradeStructures(prev => prev.filter((_, i) => i !== index));
  };

  const updateGradeLevel = (index: number, updates: Partial<GradeStructure>) => {
    setGradeStructures(prev => {
      const newStructures = [...prev];
      newStructures[index] = { ...newStructures[index], ...updates };
      return newStructures;
    });
  };

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearData.name.trim()) return;

    const newId = `ay_${Date.now()}`;
    const newYear: AcademicYear = {
      id: newId,
      name: newYearData.name,
      startDate: newYearData.startDate,
      endDate: newYearData.endDate,
      isCurrent: academicYears.length === 0,
      terms: newYearData.terms,
    };

    setAcademicYears(prev => [...prev, newYear]);
    setSelectedYear(newId);
    setIsAddingYear(false);
  };

  const handleEditYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYear) return;

    setAcademicYears(prev => prev.map(y => y.id === editingYear.id ? {
      ...y,
      name: editYearData.name,
      startDate: editYearData.startDate,
      endDate: editYearData.endDate,
      terms: editYearData.terms,
    } : y));

    setEditingYear(null);
  };

  const handleDeleteYear = () => {
    if (!deletingYear) return;

    setAcademicYears(prev => prev.filter(y => y.id !== deletingYear.id));
    if (selectedYear === deletingYear.id) {
      setSelectedYear(academicYears.find(y => y.id !== deletingYear.id)?.id || '');
    }
    setDeletingYear(null);
  };

  const generateStructure = async () => {
    if (!selectedYear) {
      alert('Please select an academic session first.');
      return;
    }

    setSaving(true);
    await new Promise(r => setTimeout(r, 800));

    let totalClasses = 0;
    gradeStructures.forEach(g => {
      totalClasses += g.streams.length * g.sectionsPerStream;
    });

    setGeneratedCount(totalClasses);
    setSaving(false);
    setStep(3);
  };

  const selectedYearObj = academicYears.find(y => y.id === selectedYear);

  return (
    <div className={isEmbedded ? 'space-y-6 md:space-y-8' : 'max-w-4xl mx-auto space-y-6 md:space-y-8'}>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-500/20">
              Academics Console
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[hsl(var(--text-primary))]">Academic Structure</h2>
          <p className="text-[hsl(var(--text-tertiary))] mt-0.5 text-xs md:text-sm font-medium">
            Configure academic sessions, term calendars, grade levels, and stream allocations.
          </p>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="flex items-center gap-1.5 bg-[hsl(var(--bg-tertiary))] p-1 rounded-2xl border border-[hsl(var(--border))] w-full sm:w-auto overflow-x-auto shrink-0">
          {[
            { stepNum: 1, label: 'Session' },
            { stepNum: 2, label: 'Levels & Streams' },
            { stepNum: 3, label: 'Complete' },
          ].map(({ stepNum, label }) => (
            <div
              key={stepNum}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                step === stepNum
                  ? 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] shadow-sm font-black'
                  : 'text-[hsl(var(--text-tertiary))]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-all ${
                  step === stepNum
                    ? 'bg-[hsl(var(--accent))] text-white'
                    : step > stepNum
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-tertiary))]'
                }`}
              >
                {step > stepNum ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
              </div>
              <span className="text-xs font-bold hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Step 1: Session Selection */}
      {step === 1 && (
        <div className="glass-card p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5 pb-2 border-b border-[hsl(var(--border))]">
            <div className="w-11 h-11 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[hsl(var(--text-primary))]">Select Academic Session</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] font-medium">Choose or create the academic session to apply this structural blueprint to.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {academicYears.map((year) => {
              const isSelected = selectedYear === year.id;
              return (
                <div
                  key={year.id}
                  onClick={() => setSelectedYear(year.id)}
                  className={`group relative flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] shadow-sm'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.5)] hover:bg-[hsl(var(--bg-tertiary)/0.5)] bg-[hsl(var(--bg-tertiary)/0.2)]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-[hsl(var(--text-primary))] text-base">{year.name}</p>
                      {year.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-bold uppercase tracking-wider">
                      {year.terms?.length || 0} Terms Configured
                    </p>
                    <p className="text-[11px] text-[hsl(var(--text-secondary))] font-medium">
                      {year.startDate} → {year.endDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingYear(year);
                          setEditYearData({
                            name: year.name,
                            startDate: year.startDate,
                            endDate: year.endDate,
                            terms: year.terms || [],
                          });
                        }}
                        className="p-1.5 hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--accent))] rounded-xl text-[hsl(var(--text-tertiary))] transition-colors"
                        title="Edit Session"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingYear(year);
                        }}
                        className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-[hsl(var(--text-tertiary))] transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[hsl(var(--accent))] shrink-0 ml-1" />}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setIsAddingYear(true)}
              className="p-5 rounded-3xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.2)] flex flex-col items-center justify-center text-center group hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.04)] transition-all cursor-pointer min-h-[110px]"
            >
              <Plus className="w-6 h-6 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--accent))] mb-1 transition-colors" />
              <p className="text-xs font-black text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--accent))] transition-colors uppercase tracking-wider">
                Create New Session
              </p>
            </button>
          </div>

          <div className="flex justify-end pt-3 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!selectedYear}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm"
            >
              <span>Continue to Levels & Streams</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Levels & Streams Configuration */}
      {step === 2 && (
        <div className="glass-card p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[hsl(var(--text-primary))]">Grade Levels & Streams Blueprint</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] font-medium">
                  Configuring classes for session: <strong className="text-[hsl(var(--accent))]">{selectedYearObj?.name}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addGradeLevel}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[hsl(var(--accent))] text-white rounded-xl hover:opacity-90 transition-all font-bold text-xs uppercase tracking-wider shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Level</span>
            </button>
          </div>

          <div className="space-y-4">
            {gradeStructures.map((grade, idx) => (
              <div
                key={idx}
                className="p-5 bg-[hsl(var(--bg-tertiary)/0.3)] rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 max-w-xs">
                    <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                      Grade Level Title
                    </label>
                    <input
                      type="text"
                      value={grade.level}
                      onChange={(e) => updateGradeLevel(idx, { level: e.target.value })}
                      placeholder="e.g. SS 1"
                      className="w-full px-3.5 py-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGradeLevel(idx)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Remove Level"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">
                    Active Streams
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Science', 'Arts', 'Commercial', 'General', 'Technical'].map(s => {
                      const isSelected = grade.streams.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            const streams = isSelected
                              ? grade.streams.filter(item => item !== s)
                              : [...grade.streams, s];
                            updateGradeLevel(idx, { streams });
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))] shadow-sm'
                              : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))] hover:border-[hsl(var(--border)/0.8)]'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[hsl(var(--border)/0.5)]">
                  <div>
                    <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1">
                      Sections per Stream (e.g. Stream A, B...)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={grade.sectionsPerStream}
                      onChange={(e) => updateGradeLevel(idx, { sectionsPerStream: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>
                  <div className="flex items-center sm:pt-4">
                    <div className="px-4 py-2.5 bg-[hsl(var(--bg-tertiary))] rounded-xl border border-[hsl(var(--border))] w-full text-center sm:text-left">
                      <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                        Cohorts for {grade.level || 'this level'}:{' '}
                        <span className="text-[hsl(var(--accent))] font-black ml-1 text-sm">
                          {grade.streams.length * grade.sectionsPerStream} Class Sections
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto text-[hsl(var(--text-secondary))] font-bold hover:text-[hsl(var(--text-primary))] text-xs py-2.5 px-4 transition-colors"
            >
              ← Back to Session
            </button>

            <button
              type="button"
              onClick={generateStructure}
              disabled={saving || gradeStructures.length === 0}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Cohorts…</span>
                </>
              ) : (
                <>
                  <Workflow className="w-4 h-4" />
                  <span>Generate & Link Classes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generation Complete */}
      {step === 3 && (
        <div className="glass-card p-8 md:p-12 text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[hsl(var(--text-primary))]">Academic Structure Generated!</h3>
            <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] max-w-md mx-auto leading-relaxed">
              Successfully generated <strong className="text-[hsl(var(--accent))]">{generatedCount} class section cohorts</strong> for the <strong>{selectedYearObj?.name}</strong> academic session.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] max-w-md mx-auto text-xs text-[hsl(var(--text-secondary))] font-medium">
            Students and faculty can now be assigned to these cohorts in the SIS Directory and Timetable Scheduler.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
            >
              Done / Return to Sessions
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm"
            >
              Modify Structure
            </button>
          </div>
        </div>
      )}

      {/* Educational Structure Callout Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-blue-500/5 border border-blue-500/20 flex gap-4">
        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-400">
          <School className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-sm text-[hsl(var(--text-primary))]">Sierra Leone 6-3-3-4 & Secondary School Flow</h4>
          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
            In secondary school mode, classes are structured to follow students throughout their curriculum stream journey (e.g. Science, Arts, Commercial starting from SS 1). This generator maintains consistent cohort naming and seamless automated promotion paths across academic years.
          </p>
        </div>
      </div>

      {/* Add New Session Modal */}
      {isAddingYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Add New Academic Session</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Create a new school year block with default term dates.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingYear(false)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddYear} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
                  Academic Year Name
                </label>
                <input
                  required
                  type="text"
                  value={newYearData.name}
                  onChange={(e) => setNewYearData({ ...newYearData, name: e.target.value })}
                  placeholder="e.g. 2026/2027"
                  className="w-full h-11 px-4 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    required
                    type="date"
                    value={newYearData.startDate}
                    onChange={(e) => setNewYearData({ ...newYearData, startDate: e.target.value })}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    required
                    type="date"
                    value={newYearData.endDate}
                    onChange={(e) => setNewYearData({ ...newYearData, endDate: e.target.value })}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-[hsl(var(--border))] pt-4">
                <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
                  Default Term Configurations
                </label>
                {newYearData.terms.map((term, idx) => (
                  <div key={term.id} className="p-3 bg-[hsl(var(--bg-tertiary)/0.4)] rounded-2xl border border-[hsl(var(--border))] grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">Term Name</label>
                      <input
                        required
                        type="text"
                        value={term.name}
                        onChange={(e) => {
                          const newTerms = [...newYearData.terms];
                          newTerms[idx].name = e.target.value;
                          setNewYearData({ ...newYearData, terms: newTerms });
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">Start Date</label>
                      <input
                        required
                        type="date"
                        value={term.startDate}
                        onChange={(e) => {
                          const newTerms = [...newYearData.terms];
                          newTerms[idx].startDate = e.target.value;
                          setNewYearData({ ...newYearData, terms: newTerms });
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">End Date</label>
                      <input
                        required
                        type="date"
                        value={term.endDate}
                        onChange={(e) => {
                          const newTerms = [...newYearData.terms];
                          newTerms[idx].endDate = e.target.value;
                          setNewYearData({ ...newYearData, terms: newTerms });
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsAddingYear(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {editingYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Edit Academic Session</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Update academic year date ranges and term bounds.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingYear(null)}
                className="p-1.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] rounded-xl hover:bg-[hsl(var(--bg-tertiary))]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditYear} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
                  Academic Year Name
                </label>
                <input
                  required
                  type="text"
                  value={editYearData.name}
                  onChange={(e) => setEditYearData({ ...editYearData, name: e.target.value })}
                  placeholder="e.g. 2026/2027"
                  className="w-full h-11 px-4 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    required
                    type="date"
                    value={editYearData.startDate}
                    onChange={(e) => setEditYearData({ ...editYearData, startDate: e.target.value })}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    required
                    type="date"
                    value={editYearData.endDate}
                    onChange={(e) => setEditYearData({ ...editYearData, endDate: e.target.value })}
                    className="w-full h-10 px-3 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl font-bold text-xs text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-[hsl(var(--border))] pt-4">
                <label className="block text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
                  Default Term Configurations
                </label>
                {editYearData.terms.map((term, idx) => (
                  <div key={term.id} className="p-3 bg-[hsl(var(--bg-tertiary)/0.4)] rounded-2xl border border-[hsl(var(--border))] grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">Term Name</label>
                      <input
                        required
                        type="text"
                        value={term.name}
                        onChange={(e) => {
                          const newTerms = [...editYearData.terms];
                          newTerms[idx].name = e.target.value;
                          setEditYearData({ ...editYearData, terms: newTerms });
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">Start Date</label>
                      <input
                        required
                        type="date"
                        value={term.startDate}
                        onChange={(e) => {
                          const newTerms = [...editYearData.terms];
                          newTerms[idx].startDate = e.target.value;
                          setEditYearData({ ...editYearData, terms: newTerms });
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[hsl(var(--text-tertiary))] uppercase mb-1">End Date</label>
                      <input
                        required
                        type="date"
                        value={term.endDate}
                        onChange={(e) => {
                          const newTerms = [...editYearData.terms];
                          newTerms[idx].endDate = e.target.value;
                          setEditYearData({ ...editYearData, terms: newTerms });
                        }}
                        className="w-full h-8 px-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[10px] font-bold text-[hsl(var(--text-primary))]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setEditingYear(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md glass-card p-6 sm:p-8 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Delete Academic Session?</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))] leading-relaxed">
                Are you sure you want to permanently delete the <strong className="text-[hsl(var(--text-primary))]">"{deletingYear.name}"</strong> session? Associated class rosters and timetable allocations may be affected.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingYear(null)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteYear}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
