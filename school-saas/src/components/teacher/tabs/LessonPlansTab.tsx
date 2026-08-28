'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import {
  Plus, BookOpen, Target, FileText, CheckSquare, ChevronDown, ChevronRight,
  Edit3, Eye, Sparkles, CheckCircle2, Clock, AlertCircle, Trash2,
  Printer, Download, X, Layers, Building, HelpCircle, ArrowRight
} from 'lucide-react';

interface LessonPlanItem {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  topic: string;
  subtopic?: string;
  class: string;
  duration: number;
  objective: string;
  methodology: string;
  hasMaterials: boolean;
  homework?: string;
  status: 'approved' | 'pending' | 'draft' | 'revision';
  hodFeedback?: string;
}

interface WeekUnit {
  id: number;
  weekNumber: number;
  label: string;
  theme: string;
  status: 'approved' | 'pending' | 'draft';
  plans: LessonPlanItem[];
}

const mockWeeksData: WeekUnit[] = [
  {
    id: 1,
    weekNumber: 1,
    label: 'Week 1 — Algebraic Foundations & Linear Systems',
    theme: 'Pure Mathematics',
    status: 'approved',
    plans: [
      {
        id: '101',
        day: 'Monday',
        topic: 'Algebraic Expressions & Factorisation',
        subtopic: 'Difference of Two Squares & Grouping',
        class: 'SS2A',
        duration: 45,
        objective: 'Students will accurately factorise quadratic polynomials using grouping and difference of squares methods.',
        methodology: 'Guided Practice & Whiteboard Problem Sets',
        hasMaterials: true,
        homework: 'Exercise 1.2 Q1–12 (Textbook Pg 28)',
        status: 'approved',
        hodFeedback: 'Well structured. Ensure time is allocated for struggling students.',
      },
      {
        id: '102',
        day: 'Tuesday',
        topic: 'Linear Equations & Simultaneous Systems',
        subtopic: 'Elimination vs Substitution Method',
        class: 'SS2B',
        duration: 45,
        objective: 'Students can set up and solve simultaneous linear equations in two unknowns with real-world scenarios.',
        methodology: 'Peer Collaboration & Problem Solving',
        hasMaterials: true,
        homework: 'Worksheet 3: Simultaneous Word Problems',
        status: 'approved',
      },
      {
        id: '103',
        day: 'Wednesday',
        topic: 'Quadratic Equations by Completing the Square',
        subtopic: 'Deriving the Quadratic Formula',
        class: 'SS3A',
        duration: 45,
        objective: 'Derive the quadratic formula step-by-step from ax² + bx + c = 0.',
        methodology: 'Direct Instruction & Algebraic Proof',
        hasMaterials: false,
        homework: 'Practice Set 4 Q1–15',
        status: 'approved',
      },
    ],
  },
  {
    id: 2,
    weekNumber: 2,
    label: 'Week 2 — Coordinate Geometry & Analytic Lines',
    theme: 'Geometry & Trigonometry',
    status: 'pending',
    plans: [
      {
        id: '201',
        day: 'Monday',
        topic: 'Straight Lines, Slopes & Gradients',
        subtopic: 'Parallel and Perpendicular Line Conditions',
        class: 'SS2A',
        duration: 45,
        objective: 'Calculate gradient m = (y2-y1)/(x2-x1) and write equations in slope-intercept form y = mx + c.',
        methodology: 'Interactive Graphing & GeoGebra Demo',
        hasMaterials: true,
        homework: 'Exercise 2.1 Q1–8',
        status: 'pending',
        hodFeedback: 'Awaiting HOD approval during Friday review meeting.',
      },
      {
        id: '202',
        day: 'Tuesday',
        topic: 'Distance Formula & Midpoint Coordinates',
        subtopic: 'Applications to Quadrilaterals on Cartesian Plane',
        class: 'SS2B',
        duration: 45,
        objective: 'Apply Euclidean distance formula to prove geometric properties of shapes on a plane.',
        methodology: 'Worksheet Pair-Share',
        hasMaterials: false,
        homework: 'Textbook Pg 45 Q1–10',
        status: 'draft',
      },
    ],
  },
  {
    id: 3,
    weekNumber: 3,
    label: 'Week 3 — Trigonometric Ratios & Elevation/Depression',
    theme: 'Applied Mathematics',
    status: 'draft',
    plans: [],
  },
];

export function LessonPlansTab({ teacher }: { teacher: TeacherData }) {
  const [weeks, setWeeks] = useState<WeekUnit[]>(mockWeeksData);
  const [openWeeks, setOpenWeeks] = useState<number[]>([1, 2]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWeekId, setSelectedWeekId] = useState<number>(1);
  const [viewingPlan, setViewingPlan] = useState<LessonPlanItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formTopic, setFormTopic] = useState('');
  const [formSubtopic, setFormSubtopic] = useState('');
  const [formClass, setFormClass] = useState('SS2A');
  const [formDay, setFormDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [formDuration, setFormDuration] = useState('45');
  const [formObjective, setFormObjective] = useState('');
  const [formMethodology, setFormMethodology] = useState('Guided Practice & Inquiry');
  const [formHomework, setFormHomework] = useState('');
  const [formHasMaterials, setFormHasMaterials] = useState(true);

  function toggleWeek(id: number) {
    setOpenWeeks(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  }

  // 1-Click AI Assistant Generator
  function handleGenerateWithAI() {
    if (!formTopic) {
      setFormTopic('Trigonometric Ratios (Sine, Cosine, Tangent)');
    }
    setFormSubtopic('Angles of Elevation & Depression in Surveying');
    setFormObjective('Students will be able to apply SOH CAH TOA to calculate heights of inaccessible objects from observed angles of elevation.');
    setFormMethodology('Real-world Clinometer Field Activity & Diagrammatic Modeling');
    setFormHomework('Textbook Chapter 5 Review Q1–8 & 2 Real-Life Measurement Problems');
    setFormHasMaterials(true);
  }

  function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!formTopic.trim()) return;

    const newPlan: LessonPlanItem = {
      id: String(Date.now()),
      day: formDay,
      topic: formTopic,
      subtopic: formSubtopic || undefined,
      class: formClass,
      duration: parseInt(formDuration) || 45,
      objective: formObjective || 'Students will understand key theoretical concepts and apply them in exercises.',
      methodology: formMethodology,
      hasMaterials: formHasMaterials,
      homework: formHomework || undefined,
      status: 'pending',
    };

    setWeeks(prev =>
      prev.map(w => {
        if (w.id === selectedWeekId) {
          return { ...w, plans: [...w.plans, newPlan] };
        }
        return w;
      })
    );

    setShowModal(false);
    setToastMessage(`Lesson plan "${formTopic}" added to Week ${selectedWeekId} and submitted for HOD review!`);
    setTimeout(() => setToastMessage(null), 5000);

    // Reset Form
    setFormTopic('');
    setFormSubtopic('');
    setFormObjective('');
    setFormHomework('');
  }

  // Summary Metrics
  const totalPlans = weeks.reduce((acc, w) => acc + w.plans.length, 0);
  const approvedPlans = weeks.reduce((acc, w) => acc + w.plans.filter(p => p.status === 'approved').length, 0);
  const pendingPlans = weeks.reduce((acc, w) => acc + w.plans.filter(p => p.status === 'pending').length, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center font-black">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">
              Curriculum &amp; Lesson Planner
            </h1>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              Prepare weekly lesson objectives, teaching methodologies, learning materials, and submit for HOD review
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-black shadow-md shadow-[hsl(var(--accent)/0.25)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Lesson Plan</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Total Lessons Planned</span>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))]">{totalPlans} Lessons</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Across {weeks.length} Curriculum Units</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-emerald-500/5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">HOD Approved</span>
          <p className="text-2xl font-black text-emerald-400">{approvedPlans} Lessons</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Ready for classroom delivery</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1 shadow-sm bg-blue-500/5">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Pending HOD Review</span>
          <p className="text-2xl font-black text-blue-400">{pendingPlans} Lessons</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Under departmental review</p>
        </div>
      </div>

      {/* Weekly Curriculum Accordion Cards */}
      <div className="space-y-4">
        {weeks.map(week => {
          const isOpen = openWeeks.includes(week.id);

          return (
            <div
              key={week.id}
              className="glass-card rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] overflow-hidden shadow-sm transition-all"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleWeek(week.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-xs shrink-0">
                    W{week.weekNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm sm:text-base text-[hsl(var(--text-primary))] truncate">
                      {week.label}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] font-mono">
                      {week.theme} • {week.plans.length} Lesson{week.plans.length !== 1 ? 's' : ''} Mapped
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    week.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                      : week.status === 'pending'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                  }`}>
                    {week.status.toUpperCase()}
                  </span>
                  {isOpen ? <ChevronDown className="w-5 h-5 text-[hsl(var(--text-tertiary))]" /> : <ChevronRight className="w-5 h-5 text-[hsl(var(--text-tertiary))]" />}
                </div>
              </button>

              {/* Accordion Body: Detailed Lesson Plans List */}
              {isOpen && (
                <div className="border-t border-[hsl(var(--border))] p-4 sm:p-5 space-y-3 bg-[hsl(var(--bg-secondary)/0.3)]">
                  {week.plans.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <BookOpen className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto opacity-50" />
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">No lesson plans created for this unit yet.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWeekId(week.id);
                          setShowModal(true);
                        }}
                        className="text-xs font-bold text-[hsl(var(--accent))] hover:underline cursor-pointer"
                      >
                        + Add First Lesson Plan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {week.plans.map(plan => (
                        <div
                          key={plan.id}
                          className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded-md">
                                  {plan.day}
                                </span>
                                <span className="text-xs font-black text-[hsl(var(--text-primary))]">
                                  {plan.topic}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">
                                  {plan.class} • {plan.duration} mins
                                </span>
                                {plan.hasMaterials && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20">
                                    Materials Attached
                                  </span>
                                )}
                              </div>

                              {plan.subtopic && (
                                <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                                  Subtopic: {plan.subtopic}
                                </p>
                              )}

                              {/* Learning Objective */}
                              <div className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))] pt-1">
                                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <p><strong className="text-[hsl(var(--text-primary))]">Objective:</strong> {plan.objective}</p>
                              </div>

                              {/* Methodology */}
                              <div className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))]">
                                <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                <p><strong className="text-[hsl(var(--text-primary))]">Method:</strong> {plan.methodology}</p>
                              </div>

                              {/* Homework */}
                              {plan.homework && (
                                <div className="flex items-start gap-2 text-xs text-amber-300">
                                  <CheckSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <p><strong>Homework Assigned:</strong> {plan.homework}</p>
                                </div>
                              )}
                            </div>

                            {/* Actions & Status */}
                            <div className="flex items-center sm:flex-col items-end gap-2 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                plan.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : plan.status === 'pending'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {plan.status === 'approved' ? '✓ Approved' : plan.status === 'pending' ? '⏳ Under Review' : '✎ Draft'}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setViewingPlan(plan)}
                                  className="p-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))] transition-colors cursor-pointer"
                                  title="View Full Lesson Dossier"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* HOD Feedback Banner */}
                          {plan.hodFeedback && (
                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span><strong>HOD Remark:</strong> {plan.hodFeedback}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE LESSON PLAN DIALOG                                          */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-card w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Create Curriculum Lesson Plan</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">Prepares structured learning objectives and homework</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  className="px-3 py-1.5 rounded-xl bg-[hsl(var(--accent)/0.15)] hover:bg-[hsl(var(--accent)/0.25)] border border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Auto-fill objectives and activities using AI Assistant"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
                  <span>Draft with AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Unit / Week</label>
                  <select
                    value={selectedWeekId}
                    onChange={(e) => setSelectedWeekId(parseInt(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    {weeks.map(w => (
                      <option key={w.id} value={w.id}>Week {w.weekNumber}: {w.theme}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Target Class</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="SS2A">SS2A</option>
                    <option value="SS2B">SS2B</option>
                    <option value="SS3A">SS3A</option>
                    <option value="JS3A">JS3A</option>
                    <option value="SS1A">SS1A</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Timetable Day</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Lesson Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quadratic Equations & Roots"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Subtopic / Special Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. Completing the Square Method"
                    value={formSubtopic}
                    onChange={(e) => setFormSubtopic(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">
                  Measurable Learning Objectives (Blooms Taxonomy)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="By the end of the 45-min period, students will be able to..."
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Teaching Methodology</label>
                  <input
                    type="text"
                    placeholder="e.g. Guided Practice & Collaborative Problem Solving"
                    value={formMethodology}
                    onChange={(e) => setFormMethodology(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Homework / Exercise</label>
                  <input
                    type="text"
                    placeholder="e.g. Textbook Chapter 4 Pg 52 Q1–10"
                    value={formHomework}
                    onChange={(e) => setFormHomework(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Submit Plan to HOD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW LESSON DOSSIER                                                */}
      {/* ========================================================================= */}
      {viewingPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--accent))]">Lesson Details</span>
                <h3 className="text-base font-black text-[hsl(var(--text-primary))]">{viewingPlan.topic}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingPlan(null)}
                className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] font-mono">
                <div>Class: <strong className="text-[hsl(var(--text-primary))]">{viewingPlan.class}</strong></div>
                <div>Day: <strong className="text-[hsl(var(--text-primary))]">{viewingPlan.day}</strong></div>
                <div>Duration: <strong className="text-[hsl(var(--text-primary))]">{viewingPlan.duration} mins</strong></div>
                <div>Status: <strong className="text-emerald-400 capitalize">{viewingPlan.status}</strong></div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[hsl(var(--text-secondary))]">Learning Objectives:</span>
                <p className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">{viewingPlan.objective}</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[hsl(var(--text-secondary))]">Teaching Methodology:</span>
                <p className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">{viewingPlan.methodology}</p>
              </div>

              {viewingPlan.homework && (
                <div className="space-y-1">
                  <span className="font-bold text-[hsl(var(--text-secondary))]">Homework Assignment:</span>
                  <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">{viewingPlan.homework}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => setViewingPlan(null)}
                className="px-4 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
