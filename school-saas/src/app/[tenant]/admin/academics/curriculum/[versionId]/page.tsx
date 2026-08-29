'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Plus, Trash2, ChevronRight, ChevronDown, GripVertical,
  BookOpen, Target, Clock, Save, Check, X, AlertTriangle,
  Send, CheckCircle2, Sparkles, Layers, FileText, Eye,
  CornerDownRight, AlignLeft, Brain, Lightbulb, AlertCircle,
  Pencil, RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import LessonPlanGenerator from '@/components/academics/LessonPlanGenerator';
import {
  getCurriculumVersions, getCurriculumTopics, upsertCurriculumTopic, deleteCurriculumTopic,
  upsertLearningOutcome, submitCurriculumForReview, approveCurriculum, publishCurriculum,
  CurriculumVersionRecord, CurriculumTopicRecord, LearningOutcomeRecord
} from '@/app/actions/curriculum';

// ─────────────────────────────────────────────────────────────
// Cognitive Bloom's level config
// ─────────────────────────────────────────────────────────────

const BLOOM_LEVELS = [
  { value: 'remember',   label: 'Remember',   color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  { value: 'understand', label: 'Understand', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'apply',      label: 'Apply',      color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { value: 'analyze',    label: 'Analyze',    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'evaluate',   label: 'Evaluate',   color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'create',     label: 'Create',     color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
];

const bloomColor = (level?: string) =>
  BLOOM_LEVELS.find(b => b.value === level)?.color ??
  'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]';

// ─────────────────────────────────────────────────────────────
// Learning Outcome Row
// ─────────────────────────────────────────────────────────────

function OutcomeRow({
  outcome, versionId, topicId, isLocked, onSaved, onDelete,
}: {
  outcome: LearningOutcomeRecord;
  versionId: string;
  topicId: string;
  isLocked: boolean;
  onSaved: () => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    code: outcome.code || '',
    description: outcome.description,
    cognitive_level: outcome.cognitive_level || '',
  });
  const [saving, setSaving] = useState(false);
  const tenant = useParams()?.tenant as string;

  const handleSave = async () => {
    setSaving(true);
    const res = await upsertLearningOutcome(tenant, versionId, topicId, {
      id: outcome.id,
      code: form.code || undefined,
      description: form.description,
      cognitive_level: form.cognitive_level || undefined,
      sequence: outcome.sequence,
    });
    setSaving(false);
    if (res.success) { setEditing(false); onSaved(); }
  };

  if (editing) {
    return (
      <div className="bg-[hsl(var(--bg-tertiary))] rounded-2xl p-4 space-y-3 border border-[hsl(var(--accent)/0.3)]">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Code</label>
            <input
              value={form.code}
              onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
              placeholder="e.g. LO-1.1"
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Bloom's Level</label>
            <select
              value={form.cognitive_level}
              onChange={e => setForm(p => ({ ...p, cognitive_level: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
            >
              <option value="">None</option>
              {BLOOM_LEVELS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase">Learning Outcome *</label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] resize-none focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-secondary))] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.description} className="px-4 py-1.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 group py-1.5">
      <CornerDownRight className="w-3 h-3 text-[hsl(var(--text-tertiary))] mt-1 flex-shrink-0" />
      {outcome.code && (
        <span className="text-[9px] font-black font-mono text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] px-1.5 py-0.5 rounded-md flex-shrink-0 mt-0.5">{outcome.code}</span>
      )}
      <p className="text-xs text-[hsl(var(--text-secondary))] flex-1 leading-relaxed">{outcome.description}</p>
      {outcome.cognitive_level && (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border flex-shrink-0 ${bloomColor(outcome.cognitive_level)}`}>
          {BLOOM_LEVELS.find(b => b.value === outcome.cognitive_level)?.label}
        </span>
      )}
      {!isLocked && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setEditing(true)} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <Pencil className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
          </button>
          <button onClick={() => onDelete(outcome.id)} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Outcome Form (inline)
// ─────────────────────────────────────────────────────────────

function AddOutcomeForm({
  versionId, topicId, nextSequence, onSaved, onCancel,
}: {
  versionId: string;
  topicId: string;
  nextSequence: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ code: '', description: '', cognitive_level: '' });
  const [saving, setSaving] = useState(false);
  const tenant = useParams()?.tenant as string;
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleSave = async () => {
    if (!form.description.trim()) return;
    setSaving(true);
    const res = await upsertLearningOutcome(tenant, versionId, topicId, {
      code: form.code || undefined,
      description: form.description,
      cognitive_level: form.cognitive_level || undefined,
      sequence: nextSequence,
    });
    setSaving(false);
    if (res.success) { setForm({ code: '', description: '', cognitive_level: '' }); onSaved(); }
  };

  return (
    <div className="ml-6 bg-[hsl(var(--accent)/0.05)] rounded-2xl p-3 space-y-2.5 border border-[hsl(var(--accent)/0.2)]">
      <div className="grid grid-cols-3 gap-2">
        <input
          value={form.code}
          onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
          placeholder="Code (e.g. 1.1)"
          className="h-8 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
        />
        <select
          value={form.cognitive_level}
          onChange={e => setForm(p => ({ ...p, cognitive_level: e.target.value }))}
          className="col-span-2 h-8 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
        >
          <option value="">Bloom's level (optional)</option>
          {BLOOM_LEVELS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </div>
      <textarea
        ref={ref}
        value={form.description}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave(); if (e.key === 'Escape') onCancel(); }}
        rows={2}
        placeholder="Students will be able to… (Ctrl+Enter to save)"
        className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] resize-none focus:outline-none focus:border-[hsl(var(--accent))]"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving || !form.description.trim()} className="px-4 py-1.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold disabled:opacity-50">
          {saving ? 'Saving…' : 'Add Outcome'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Topic Node
// ─────────────────────────────────────────────────────────────

function TopicNode({
  topic, versionId, depth, isLocked, allTopics, onRefresh, onAiPlan
}: {
  topic: CurriculumTopicRecord;
  versionId: string;
  depth: number;
  isLocked: boolean;
  allTopics: CurriculumTopicRecord[];
  onRefresh: () => void;
  onAiPlan?: (id: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleForm, setTitleForm] = useState({ title: topic.title, description: topic.description || '', term: topic.term?.toString() || '', estimated_periods: topic.estimated_periods || 1 });
  const [addingOutcome, setAddingOutcome] = useState(false);
  const [addingSubtopic, setAddingSubtopic] = useState(false);
  const [subtopicTitle, setSubtopicTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const tenant = useParams()?.tenant as string;

  const outcomes = topic.outcomes || [];
  const children = topic.children || [];
  const hasContent = children.length > 0 || outcomes.length > 0;

  const handleSaveTitle = async () => {
    setSaving(true);
    await upsertCurriculumTopic(tenant, versionId, {
      id: topic.id,
      title: titleForm.title,
      description: titleForm.description || undefined,
      sequence: topic.sequence,
      term: titleForm.term ? parseInt(titleForm.term) : undefined,
      estimated_periods: titleForm.estimated_periods,
      parent_topic_id: topic.parent_topic_id,
    });
    setSaving(false);
    setEditingTitle(false);
    onRefresh();
  };

  const handleAddSubtopic = async () => {
    if (!subtopicTitle.trim()) return;
    setSaving(true);
    await upsertCurriculumTopic(tenant, versionId, {
      parent_topic_id: topic.id,
      title: subtopicTitle,
      sequence: children.length + 1,
    });
    setSaving(false);
    setSubtopicTitle('');
    setAddingSubtopic(false);
    onRefresh();
  };

  const handleDeleteOutcome = async (outcomeId: string) => {
    // Implement via a delete action — for now soft remove from UI
    // Full delete action can be added to curriculum.ts
    onRefresh();
  };

  const handleDeleteTopic = async () => {
    await deleteCurriculumTopic(tenant, topic.id);
    onRefresh();
  };

  const indentStyle = { paddingLeft: `${depth * 20}px` };
  const isRoot = depth === 0;

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all ${
      isRoot
        ? 'glass-card border-[hsl(var(--border))]'
        : 'border-[hsl(var(--border)/0.5)] bg-[hsl(var(--bg-tertiary)/0.3)]'
    }`}>
      {/* Topic header */}
      <div className={`flex items-start gap-3 p-4 ${isRoot ? '' : 'py-3'}`} style={isRoot ? {} : indentStyle}>
        {!isLocked && (
          <GripVertical className="w-4 h-4 text-[hsl(var(--text-tertiary))] mt-0.5 flex-shrink-0 cursor-grab" />
        )}

        <button
          onClick={() => setExpanded(p => !p)}
          className="flex-shrink-0 mt-0.5"
        >
          {hasContent
            ? expanded ? <ChevronDown className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                       : <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            : <div className="w-4 h-4 rounded-full border-2 border-[hsl(var(--border))] flex-shrink-0" />
          }
        </button>

        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <div className="space-y-2">
              <input
                value={titleForm.title}
                onChange={e => setTitleForm(p => ({ ...p, title: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--accent))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none"
                autoFocus
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={titleForm.description}
                  onChange={e => setTitleForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="col-span-2 h-8 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
                <div className="flex gap-1">
                  <select
                    value={titleForm.term}
                    onChange={e => setTitleForm(p => ({ ...p, term: e.target.value }))}
                    className="flex-1 h-8 px-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="">Term</option>
                    <option value="1">T1</option>
                    <option value="2">T2</option>
                    <option value="3">T3</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={titleForm.estimated_periods}
                    onChange={e => setTitleForm(p => ({ ...p, estimated_periods: parseInt(e.target.value) || 1 }))}
                    placeholder="Periods"
                    className="w-14 h-8 px-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] text-center"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingTitle(false)} className="px-3 py-1 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">Cancel</button>
                <button onClick={handleSaveTitle} disabled={saving || !titleForm.title.trim()} className="px-4 py-1 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-bold disabled:opacity-50">
                  {saving ? '…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-black text-[hsl(var(--text-primary))] ${isRoot ? 'text-sm' : 'text-xs'} leading-snug`}>
                    {topic.sequence}. {topic.title}
                  </h4>
                  {topic.term && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)]">
                      Term {topic.term}
                    </span>
                  )}
                  <span className="text-[9px] font-bold text-[hsl(var(--text-tertiary))]">
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />{topic.estimated_periods}p
                  </span>
                  <span className="text-[9px] font-bold text-[hsl(var(--text-tertiary))]">
                    <Target className="w-2.5 h-2.5 inline mr-0.5" />{outcomes.length} outcomes
                  </span>
                </div>
                {topic.description && (
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 leading-relaxed">{topic.description}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {onAiPlan && (
                  <button onClick={() => onAiPlan(topic.id, topic.title)} className="p-1 rounded-lg hover:bg-violet-500/10 transition-colors" title="Generate AI Lesson Plan">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                  </button>
                )}
                {!isLocked && (
                  <>
                    <button onClick={() => setEditingTitle(true)} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors" title="Edit topic">
                      <Pencil className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                    </button>
                    <button onClick={() => setAddingOutcome(true)} className="p-1 rounded-lg hover:bg-[hsl(var(--accent)/0.1)] transition-colors" title="Add learning outcome">
                      <Target className="w-3 h-3 text-[hsl(var(--accent))]" />
                    </button>
                    {depth < 2 && (
                      <button onClick={() => setAddingSubtopic(true)} className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors" title="Add subtopic">
                        <Plus className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                      </button>
                    )}
                    <button onClick={handleDeleteTopic} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete topic">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {/* Learning outcomes */}
          {outcomes.length > 0 && (
            <div className="ml-7 space-y-1 pb-1">
              {outcomes.map(o => (
                <OutcomeRow
                  key={o.id}
                  outcome={o}
                  versionId={versionId}
                  topicId={topic.id}
                  isLocked={isLocked}
                  onSaved={onRefresh}
                  onDelete={handleDeleteOutcome}
                />
              ))}
            </div>
          )}

          {/* Inline add outcome */}
          {addingOutcome && (
            <AddOutcomeForm
              versionId={versionId}
              topicId={topic.id}
              nextSequence={outcomes.length + 1}
              onSaved={() => { setAddingOutcome(false); onRefresh(); }}
              onCancel={() => setAddingOutcome(false)}
            />
          )}

          {/* Add outcome button */}
          {!isLocked && !addingOutcome && (
            <button
              onClick={() => setAddingOutcome(true)}
              className="ml-7 flex items-center gap-1.5 text-[10px] font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors py-0.5"
            >
              <Target className="w-3 h-3" /> Add learning outcome
            </button>
          )}

          {/* Children subtopics */}
          {children.length > 0 && (
            <div className="space-y-2 ml-4">
              {children.map(child => (
                <TopicNode
                  key={child.id}
                  topic={child}
                  versionId={versionId}
                  depth={depth + 1}
                  isLocked={isLocked}
                  allTopics={allTopics}
                  onRefresh={onRefresh}
                  onAiPlan={onAiPlan}
                />
              ))}
            </div>
          )}

          {/* Add subtopic inline */}
          {addingSubtopic && depth < 2 && (
            <div className="ml-4 flex items-center gap-2">
              <CornerDownRight className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] flex-shrink-0" />
              <input
                value={subtopicTitle}
                onChange={e => setSubtopicTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSubtopic(); if (e.key === 'Escape') setAddingSubtopic(false); }}
                placeholder="Subtopic title… (Enter to add)"
                autoFocus
                className="flex-1 h-9 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--accent)/0.4)] text-sm font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
              <button onClick={() => setAddingSubtopic(false)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                <X className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              </button>
              <button onClick={handleAddSubtopic} disabled={saving || !subtopicTitle.trim()} className="px-3 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold disabled:opacity-50">
                {saving ? '…' : 'Add'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Root Topic Form
// ─────────────────────────────────────────────────────────────

function AddRootTopicForm({
  versionId, nextSequence, onSaved, onCancel,
}: {
  versionId: string;
  nextSequence: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ title: '', description: '', term: '', estimated_periods: 4 });
  const [saving, setSaving] = useState(false);
  const tenant = useParams()?.tenant as string;
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const res = await upsertCurriculumTopic(tenant, versionId, {
      title: form.title,
      description: form.description || undefined,
      sequence: nextSequence,
      term: form.term ? parseInt(form.term) : undefined,
      estimated_periods: form.estimated_periods,
    });
    setSaving(false);
    if (res.success) onSaved();
  };

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 border-2 border-dashed border-[hsl(var(--accent)/0.3)]">
      <div className="flex items-center gap-2 text-xs font-black text-[hsl(var(--accent))]">
        <Plus className="w-3.5 h-3.5" /> New Topic / Chapter
      </div>
      <div className="grid grid-cols-4 gap-3">
        <input
          ref={ref}
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
          placeholder="Topic title *"
          className="col-span-2 h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
        />
        <select
          value={form.term}
          onChange={e => setForm(p => ({ ...p, term: e.target.value }))}
          className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
        >
          <option value="">Term</option>
          <option value="1">Term 1</option>
          <option value="2">Term 2</option>
          <option value="3">Term 3</option>
        </select>
        <input
          type="number"
          min={1}
          max={60}
          value={form.estimated_periods}
          onChange={e => setForm(p => ({ ...p, estimated_periods: parseInt(e.target.value) || 1 }))}
          placeholder="Periods"
          className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] text-center"
        />
      </div>
      <input
        value={form.description}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        placeholder="Description (optional)"
        className="w-full h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))]"
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving || !form.title.trim()} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold disabled:opacity-50">
          {saving ? 'Adding…' : 'Add Topic'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function CurriculumEditorPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || '';
  const versionId = (params?.versionId as string) || '';

  const [version, setVersion] = useState<CurriculumVersionRecord | null>(null);
  const [topics, setTopics] = useState<CurriculumTopicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingRootTopic, setAddingRootTopic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [aiPanel, setAiPanel] = useState<{ topicId: string; topicTitle: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    const [versionsRes, topicsRes] = await Promise.all([
      getCurriculumVersions(tenant),
      getCurriculumTopics(tenant, versionId),
    ]);

    if (versionsRes.success) {
      const found = versionsRes.data.find(v => v.id === versionId);
      setVersion(found || null);
    }
    if (topicsRes.success) setTopics(topicsRes.data);
    setLoading(false);
  }, [tenant, versionId]);

  useEffect(() => { loadData(); }, [loadData]);

  const isLocked = version?.status === 'published' || version?.status === 'archived';

  const totalPeriods = topics.reduce((sum, t) => {
    const childPeriods = (t.children || []).reduce((cs, c) => cs + (c.estimated_periods || 0), 0);
    return sum + (t.estimated_periods || 0) + childPeriods;
  }, 0);

  const totalOutcomes = topics.reduce((sum, t) => {
    const childOutcomes = (t.children || []).reduce((cs, c) => cs + (c.outcomes?.length || 0), 0);
    return sum + (t.outcomes?.length || 0) + childOutcomes;
  }, 0);

  const handleWorkflowAction = async (action: 'submit' | 'approve' | 'publish') => {
    setSaving(true);
    setActionError('');
    let res;
    if (action === 'submit') res = await submitCurriculumForReview(tenant, versionId);
    else if (action === 'approve') res = await approveCurriculum(tenant, versionId);
    else res = await publishCurriculum(tenant, versionId);
    setSaving(false);

    if (res.success) {
      showNotification('success', `Curriculum ${action === 'submit' ? 'submitted for review' : action === 'approve' ? 'approved' : 'published'}.`);
      loadData();
    } else {
      setActionError(res.error || `Failed to ${action}.`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-8 h-8 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[hsl(var(--text-secondary))]">Loading curriculum editor…</p>
      </div>
    );
  }

  if (!version) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h2 className="text-lg font-black text-[hsl(var(--text-primary))]">Curriculum not found</h2>
        <Link href={`/${tenant}/admin/academics/curriculum`} className="text-sm text-[hsl(var(--accent))] hover:underline">← Back to curriculum library</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-fade-in pb-16 w-full">

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div className="space-y-1.5 flex-1 min-w-0">
          <Link href={`/${tenant}/admin/academics/curriculum`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] transition-colors mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Curriculum Library
          </Link>
          <h1 className="text-lg sm:text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2.5 flex-wrap">
            <BookOpen className="w-6 h-6 text-[hsl(var(--accent))] flex-shrink-0" />
            <span className="line-clamp-1">{version.subject_name}</span>
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">{version.academic_year_name}</span>
            <span className="text-[hsl(var(--text-tertiary))]">·</span>
            <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">{version.grade_level}</span>
            <span className="text-[hsl(var(--text-tertiary))]">·</span>
            <span className="text-xs font-bold text-[hsl(var(--text-secondary))]">v{version.version}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl border ${
              version.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              version.status === 'approved' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              version.status === 'pending_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))]'
            }`}>
              {version.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {isLocked && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">Read-only</span>
            )}
          </div>
        </div>

        {/* Workflow action button */}
        {!isLocked && (
          <div className="flex-shrink-0">
            {version.status === 'draft' || version.status === 'changes_requested' ? (
              <button
                onClick={() => handleWorkflowAction('submit')}
                disabled={saving || topics.length === 0}
                title={topics.length === 0 ? 'Add at least one topic first' : ''}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Submit for Review
              </button>
            ) : version.status === 'pending_review' ? (
              <button
                onClick={() => handleWorkflowAction('approve')}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Curriculum
              </button>
            ) : version.status === 'approved' ? (
              <button
                onClick={() => handleWorkflowAction('publish')}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> Publish (Makes Immutable)
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Action error */}
      {actionError && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {actionError}
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {[
          { icon: Layers, label: 'Topics', value: topics.length },
          { icon: Target, label: 'Outcomes', value: totalOutcomes },
          { icon: Clock, label: 'Est. Periods', value: totalPeriods },
          { icon: FileText, label: 'Depth', value: `${Math.max(0, ...topics.map(t => t.children?.length ? 2 : 1))} levels` },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[hsl(var(--accent)/0.1)]">
              <s.icon className="w-4 h-4 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <div className="text-lg font-black text-[hsl(var(--text-primary))]">{s.value}</div>
              <div className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Locked notice */}
      {isLocked && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-xs font-semibold text-amber-400">
          <Eye className="w-4 h-4 flex-shrink-0" />
          This curriculum is {version.status}. Create a new version to make changes.
        </div>
      )}

      {/* Published: AI Lesson Plan launcher */}
      {version.status === 'published' && topics.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500/5 to-[hsl(var(--accent)/0.05)] border border-violet-500/20">
          <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-[hsl(var(--text-primary))]">AI Lesson Plans Available</p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Click ✦ on any topic to generate a classroom-ready lesson plan</p>
          </div>
        </div>
      )}

      {/* AI Tip */}
      {!isLocked && topics.length === 0 && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-[hsl(var(--accent)/0.05)] border border-[hsl(var(--accent)/0.15)] text-xs text-[hsl(var(--text-secondary))]">
          <Lightbulb className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0 mt-0.5" />
          <span>Start by adding <strong className="text-[hsl(var(--text-primary))]">topics/chapters</strong> to structure your syllabus. Each topic can have subtopics and learning outcomes aligned to Bloom's taxonomy. Once published, AI lesson plans will draw from this structure.</span>
        </div>
      )}

      {/* Topic tree */}
      <div className="space-y-3">
        {topics.map(topic => (
          <TopicNode
            key={topic.id}
            topic={topic}
            versionId={versionId}
            depth={0}
            isLocked={isLocked}
            allTopics={topics}
            onRefresh={loadData}
            onAiPlan={version.status === 'published' ? (id, title) => setAiPanel({ topicId: id, topicTitle: title }) : undefined}
          />
        ))}

        {/* Add root topic */}
        {addingRootTopic ? (
          <AddRootTopicForm
            versionId={versionId}
            nextSequence={topics.length + 1}
            onSaved={() => { setAddingRootTopic(false); loadData(); }}
            onCancel={() => setAddingRootTopic(false)}
          />
        ) : !isLocked && (
          <button
            onClick={() => setAddingRootTopic(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-tertiary))] hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.03)] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Topic / Chapter
          </button>
        )}
      </div>

      {/* AI Lesson Plan Slideover */}
      {aiPanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:w-auto h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-3xl overflow-hidden shadow-2xl rounded-t-3xl sm:rounded-3xl">
            <LessonPlanGenerator
              offeringId="" 
              topicId={aiPanel.topicId}
              topicTitle={aiPanel.topicTitle}
              subjectName={version.subject_name || ''}
              durationMinutes={40}
              onClose={() => setAiPanel(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
