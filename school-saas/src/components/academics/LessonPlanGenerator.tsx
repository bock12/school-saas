'use client';

import React, { useState } from 'react';
import {
  Sparkles, Brain, ChevronDown, ChevronRight, Clock, Target,
  BookOpen, Users, ClipboardList, Lightbulb, Download, Copy,
  CheckCircle2, AlertCircle, X, Loader2, ArrowRight, RefreshCw,
  Star, FileText, GraduationCap, Layers
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface LessonPhase {
  phase: string;
  duration_minutes: number;
  description: string;
  teacher_activities: string[];
  student_activities: string[];
  key_questions: string[];
}

interface LessonPlan {
  lesson_title: string;
  subject: string;
  grade_class: string;
  topic: string;
  duration_minutes: number;
  term: string;
  learning_objectives: string[];
  materials_needed: string[];
  lesson_phases: LessonPhase[];
  assessment_strategies: string[];
  differentiation: { support: string; extension: string };
  homework: string;
  curriculum_outcomes_addressed: string[];
  teacher_notes: string;
}

interface LessonPlanGeneratorProps {
  offeringId: string;
  topicId: string;
  topicTitle: string;
  subjectName: string;
  durationMinutes?: number;
  onClose?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Phase section
// ─────────────────────────────────────────────────────────────

function PhaseCard({ phase, index }: { phase: LessonPhase; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const colors = [
    'border-blue-500/20 bg-blue-500/5',
    'border-violet-500/20 bg-violet-500/5',
    'border-emerald-500/20 bg-emerald-500/5',
    'border-amber-500/20 bg-amber-500/5',
    'border-pink-500/20 bg-pink-500/5',
  ];
  const color = colors[index % colors.length];

  return (
    <div className={`rounded-2xl border ${color} overflow-hidden`}>
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-[hsl(var(--text-primary))]">{index + 1}</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-[hsl(var(--text-primary))]">{phase.phase}</h4>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
              <Clock className="w-2.5 h-2.5 inline mr-1" />{phase.duration_minutes} min
            </p>
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /> : <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {phase.description && (
            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{phase.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phase.teacher_activities.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Teacher Activities
                </p>
                <ul className="space-y-1">
                  {phase.teacher_activities.map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
                      <ArrowRight className="w-3 h-3 text-[hsl(var(--accent))] flex-shrink-0 mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {phase.student_activities.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3" /> Student Activities
                </p>
                <ul className="space-y-1">
                  {phase.student_activities.map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
                      <ArrowRight className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {phase.key_questions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Key Questions
              </p>
              <ul className="space-y-1">
                {phase.key_questions.map((q, i) => (
                  <li key={i} className="text-xs text-[hsl(var(--text-secondary))] italic">"{q}"</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function LessonPlanGenerator({
  offeringId,
  topicId,
  topicTitle,
  subjectName,
  durationMinutes = 40,
  onClose,
}: LessonPlanGeneratorProps) {
  const [style, setStyle] = useState<'standard' | 'inquiry' | 'project' | 'direct'>('standard');
  const [duration, setDuration] = useState(durationMinutes);
  const [loading, setLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const STYLES = [
    { id: 'standard', label: 'Balanced', icon: Star, desc: 'Mix of direct instruction & activities' },
    { id: 'inquiry', label: 'Inquiry-Based', icon: Lightbulb, desc: 'Student-led questioning & discovery' },
    { id: 'project', label: 'Project-Based', icon: Layers, desc: 'Mini-project or design challenge' },
    { id: 'direct', label: 'Direct (I/We/You)', icon: GraduationCap, desc: 'Explicit instruction with scaffolding' },
  ] as const;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setLessonPlan(null);

    try {
      const res = await fetch('/api/academics/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offering_id: offeringId, topic_id: topicId, duration_minutes: duration, style }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to generate lesson plan.');
      } else {
        setLessonPlan(data.lesson_plan);
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!lessonPlan) return;
    const text = formatPlanAsText(lessonPlan);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!lessonPlan) return;
    const text = formatPlanAsText(lessonPlan);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subjectName.replace(/\s+/g, '_')}_${topicTitle.replace(/\s+/g, '_')}_lesson_plan.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalDuration = lessonPlan?.lesson_phases.reduce((s, p) => s + p.duration_minutes, 0) ?? 0;

  return (
    <div className="flex flex-col h-full max-h-[90vh] overflow-hidden bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl w-full max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-[hsl(var(--accent)/0.2)]">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[hsl(var(--text-primary))]">AI Lesson Plan Generator</h2>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Constrained to approved curriculum · {subjectName}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!lessonPlan ? (
          /* Configuration panel */
          <div className="p-6 space-y-6">
            {/* Topic info */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[hsl(var(--accent)/0.05)] border border-[hsl(var(--accent)/0.15)]">
              <BookOpen className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Selected Topic</p>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))] truncate">{topicTitle}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[hsl(var(--text-secondary))] uppercase tracking-wider">Lesson Duration</label>
              <div className="flex gap-2 flex-wrap">
                {[30, 40, 45, 60, 80, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                      duration === d
                        ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white'
                        : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.5)]'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* Pedagogical style */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[hsl(var(--text-secondary))] uppercase tracking-wider">Teaching Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all ${
                      style === s.id
                        ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--accent)/0.3)]'
                    }`}
                  >
                    <s.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style === s.id ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-tertiary))]'}`} />
                    <div>
                      <p className={`text-xs font-black ${style === s.id ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-primary))]'}`}>{s.label}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI constraint notice */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-[hsl(var(--text-secondary))]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>This AI is <strong className="text-[hsl(var(--text-primary))]">constrained to your school's approved curriculum</strong>. It only operationalises published topics and learning outcomes — it never invents or extends beyond the approved syllabus.</span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 via-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white font-black text-sm flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-[hsl(var(--accent)/0.2)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating lesson plan…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Lesson Plan
                </>
              )}
            </button>
          </div>
        ) : (
          /* Generated plan */
          <div className="p-6 space-y-5">

            {/* Plan header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))] leading-tight">{lessonPlan.lesson_title}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleCopy} className={`p-2 rounded-xl border transition-colors ${copied ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`} title="Copy as text">
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={handleDownload} className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] transition-colors" title="Download .txt">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => setLessonPlan(null)} className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] transition-colors" title="Regenerate">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                  <BookOpen className="w-2.5 h-2.5 inline mr-1" />{lessonPlan.subject}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                  <GraduationCap className="w-2.5 h-2.5 inline mr-1" />{lessonPlan.grade_class}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                  <Clock className="w-2.5 h-2.5 inline mr-1" />{totalDuration} min total
                </span>
                {lessonPlan.term && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))]">
                    {lessonPlan.term}
                  </span>
                )}
              </div>
            </div>

            {/* Learning objectives */}
            {lessonPlan.learning_objectives.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Learning Objectives
                </h4>
                <ul className="space-y-1.5">
                  {lessonPlan.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--text-secondary))]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials */}
            {lessonPlan.materials_needed.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" /> Materials Needed
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {lessonPlan.materials_needed.map((m, i) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Lesson phases */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-violet-400" /> Lesson Phases
              </h4>
              <div className="space-y-2">
                {lessonPlan.lesson_phases.map((phase, i) => (
                  <PhaseCard key={i} phase={phase} index={i} />
                ))}
              </div>
            </div>

            {/* Assessment */}
            {lessonPlan.assessment_strategies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-amber-400" /> Assessment Strategies
                </h4>
                <ul className="space-y-1">
                  {lessonPlan.assessment_strategies.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[hsl(var(--text-secondary))]">
                      <span className="text-amber-400 flex-shrink-0">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Differentiation */}
            {(lessonPlan.differentiation.support || lessonPlan.differentiation.extension) && (
              <div className="grid grid-cols-2 gap-3">
                {lessonPlan.differentiation.support && (
                  <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Support (SEN/EAL)</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{lessonPlan.differentiation.support}</p>
                  </div>
                )}
                {lessonPlan.differentiation.extension && (
                  <div className="p-3 rounded-2xl bg-violet-500/5 border border-violet-500/15 space-y-1">
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-wider">Extension (G&T)</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{lessonPlan.differentiation.extension}</p>
                  </div>
                )}
              </div>
            )}

            {/* Homework */}
            {lessonPlan.homework && (
              <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-1">
                <p className="text-[10px] font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Homework / Follow-up</p>
                <p className="text-sm text-[hsl(var(--text-secondary))]">{lessonPlan.homework}</p>
              </div>
            )}

            {/* Curriculum outcomes addressed */}
            {lessonPlan.curriculum_outcomes_addressed.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-1.5">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Curriculum Outcomes Addressed
                </p>
                <ul className="space-y-0.5">
                  {lessonPlan.curriculum_outcomes_addressed.map((co, i) => (
                    <li key={i} className="text-xs text-[hsl(var(--text-secondary))]">• {co}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Teacher notes */}
            {lessonPlan.teacher_notes && (
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Teacher Notes
                </p>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{lessonPlan.teacher_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Plain text formatter for copy/download
// ─────────────────────────────────────────────────────────────

function formatPlanAsText(plan: LessonPlan): string {
  const sep = '─'.repeat(60);
  const lines: string[] = [
    `LESSON PLAN`,
    sep,
    `Subject: ${plan.subject}`,
    `Class: ${plan.grade_class}`,
    `Topic: ${plan.topic}`,
    `Duration: ${plan.duration_minutes} minutes`,
    `Term: ${plan.term}`,
    '',
    'LEARNING OBJECTIVES',
    sep,
    ...plan.learning_objectives.map((o, i) => `${i + 1}. ${o}`),
    '',
    'MATERIALS NEEDED',
    sep,
    ...plan.materials_needed.map(m => `• ${m}`),
    '',
    'LESSON PHASES',
    sep,
    ...plan.lesson_phases.flatMap(p => [
      `[${p.phase.toUpperCase()} — ${p.duration_minutes} min]`,
      p.description,
      '  Teacher: ' + p.teacher_activities.join('; '),
      '  Students: ' + p.student_activities.join('; '),
      p.key_questions.length > 0 ? '  Questions: ' + p.key_questions.join(' | ') : '',
      '',
    ]),
    'ASSESSMENT',
    sep,
    ...plan.assessment_strategies.map(a => `• ${a}`),
    '',
    'DIFFERENTIATION',
    sep,
    `Support: ${plan.differentiation.support}`,
    `Extension: ${plan.differentiation.extension}`,
    '',
    'HOMEWORK',
    sep,
    plan.homework,
    '',
    'CURRICULUM OUTCOMES ADDRESSED',
    sep,
    ...plan.curriculum_outcomes_addressed.map(co => `• ${co}`),
    '',
    'TEACHER NOTES',
    sep,
    plan.teacher_notes,
  ];
  return lines.join('\n');
}
