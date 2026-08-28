'use client';

import { useState } from 'react';
import {
  Shield, Plus, Trash2, ChevronUp, ChevronDown, GripVertical,
  Clock, Users, BookOpen, Layers, AlertCircle, CheckCircle2, X, Edit3
} from 'lucide-react';

interface TimetableRule {
  id: string;
  name: string;
  type: 'teacher_availability' | 'room_capacity' | 'subject_consecutive' | 'double_period' | 'other';
  priority: number;
  active: boolean;
  description: string;
  config: Record<string, unknown>;
}

const ruleTypeConfig = {
  teacher_availability: {
    label: 'Teacher Availability',
    icon: Users,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    desc: 'Prevent teacher double-booking and respect off-period preferences',
  },
  room_capacity: {
    label: 'Room Capacity',
    icon: Layers,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    desc: 'Ensure classes never exceed assigned room capacity',
  },
  subject_consecutive: {
    label: 'No Back-to-Back Same Subject',
    icon: BookOpen,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    desc: 'Prevent the same subject being taught in consecutive periods',
  },
  double_period: {
    label: 'Double Period Limit',
    icon: Clock,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    desc: 'Limit the number of consecutive periods for any one subject per day',
  },
  other: {
    label: 'Custom Rule',
    icon: Shield,
    color: 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent)/0.3)]',
    desc: 'Custom scheduling constraint',
  },
};

const initialRules: TimetableRule[] = [
  {
    id: 'r1',
    name: 'Teacher Availability Enforcement',
    type: 'teacher_availability',
    priority: 1,
    active: true,
    description: 'Ensure no teacher is assigned to two classes in the same period slot.',
    config: { strictMode: true },
  },
  {
    id: 'r2',
    name: 'Room Capacity Compliance',
    type: 'room_capacity',
    priority: 2,
    active: true,
    description: 'Never assign a class section to a room with insufficient capacity.',
    config: { tolerance: 0 },
  },
  {
    id: 'r3',
    name: 'No Consecutive Same Subject',
    type: 'subject_consecutive',
    priority: 3,
    active: true,
    description: 'Avoid scheduling the same subject in back-to-back periods for the same class.',
    config: { maxConsecutive: 1 },
  },
  {
    id: 'r4',
    name: 'Double Period Maximum',
    type: 'double_period',
    priority: 4,
    active: false,
    description: 'Allow at most one double-period session per subject per day.',
    config: { maxDoublePeriods: 1 },
  },
];

const RULE_TYPES = Object.keys(ruleTypeConfig) as TimetableRule['type'][];

export function TimetableRules() {
  const [rules, setRules] = useState<TimetableRule[]>(initialRules);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState<TimetableRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'teacher_availability' as TimetableRule['type'],
    description: '',
  });

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    const newRule: TimetableRule = {
      id: `r${Date.now()}`,
      name: formData.name,
      type: formData.type,
      priority: rules.length + 1,
      active: true,
      description: formData.description || ruleTypeConfig[formData.type].desc,
      config: {},
    };
    setRules(prev => [...prev, newRule]);
    setIsAdding(false);
    setFormData({ name: '', type: 'teacher_availability', description: '' });
  };

  const handleSaveEdit = () => {
    if (!editingRule) return;
    setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id).map((r, i) => ({ ...r, priority: i + 1 })));
    setDeleteId(null);
  };

  const handleToggle = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const movePriority = (id: string, direction: 'up' | 'down') => {
    setRules(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((r, i) => ({ ...r, priority: i + 1 }));
    });
  };

  const activeCount = rules.filter(r => r.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[hsl(var(--text-tertiary))]">
            <span className="font-semibold text-[hsl(var(--text-primary))]">{activeCount}</span> of{' '}
            <span className="font-semibold text-[hsl(var(--text-primary))]">{rules.length}</span> rules active
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-4 border-l-4 border-l-[hsl(var(--accent))]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[hsl(var(--accent))] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Rules are enforced in priority order</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
              Higher priority rules (lower number) are validated first during AI generation. Drag or use arrows to reorder.
            </p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule, idx) => {
          const cfg = ruleTypeConfig[rule.type];
          const Icon = cfg.icon;
          return (
            <div
              key={rule.id}
              className={`glass-card p-4 transition-all ${!rule.active ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Priority badge + drag handle */}
                <div className="flex flex-col items-center gap-1 mt-0.5">
                  <button
                    onClick={() => movePriority(rule.id, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 rounded text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-[hsl(var(--text-tertiary))] min-w-[20px] text-center">
                    #{rule.priority}
                  </span>
                  <button
                    onClick={() => movePriority(rule.id, 'down')}
                    disabled={idx === rules.length - 1}
                    className="p-0.5 rounded text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Icon */}
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{rule.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">{rule.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(rule.id)}
                    className={`relative w-10 h-5 rounded-full transition-all ${rule.active ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`}
                    title={rule.active ? 'Disable rule' : 'Enable rule'}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${rule.active ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(rule.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {rules.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Shield className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-[hsl(var(--text-secondary))]">No rules configured</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Add scheduling constraints to improve AI generation quality.</p>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Add Scheduling Rule</h3>
              <button onClick={() => setIsAdding(false)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. No same subject back-to-back"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Rule Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {RULE_TYPES.map(type => {
                    const cfg = ruleTypeConfig[type];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setFormData(p => ({ ...p, type }))}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${formData.type === type ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)]'}`}
                      >
                        <Icon className="w-3.5 h-3.5 text-[hsl(var(--text-secondary))] shrink-0" />
                        <span className="text-xs font-medium text-[hsl(var(--text-primary))]">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder={ruleTypeConfig[formData.type].desc}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsAdding(false)} className="flex-1 h-9 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} className="flex-1 h-9 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Edit Rule</h3>
              <button onClick={() => setEditingRule(null)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={e => setEditingRule(r => r ? { ...r, name: e.target.value } : null)}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={editingRule.description}
                  onChange={e => setEditingRule(r => r ? { ...r, description: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors resize-none"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--bg-tertiary))]">
                <span className="text-sm text-[hsl(var(--text-primary))]">Rule Active</span>
                <button
                  onClick={() => setEditingRule(r => r ? { ...r, active: !r.active } : null)}
                  className={`relative w-10 h-5 rounded-full transition-all ${editingRule.active ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editingRule.active ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingRule(null)} className="flex-1 h-9 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="flex-1 h-9 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Save Changes
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
                <p className="text-sm font-bold text-[hsl(var(--text-primary))]">Delete Rule</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">This rule will be permanently removed from the AI engine.</p>
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
