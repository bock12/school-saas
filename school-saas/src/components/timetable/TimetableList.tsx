'use client';

import { useState } from 'react';
import {
  Calendar, Clock, CheckCircle, Edit3, Archive, Plus, Search,
  ChevronRight, Trash2, Edit2, FileText, Sparkles, X,
  AlertTriangle, Save
} from 'lucide-react';
import { TimetableEditor, Timetable, TimetableEntry } from './TimetableEditor';

const INITIAL_TIMETABLES: Timetable[] = [
  {
    id: 'tt1',
    name: '2025/2026 Term 1 Master Schedule',
    academicYear: '2025/2026',
    status: 'published',
    templateId: 'tpl1',
    templateName: 'Standard 8-Period Day',
    entryCount: 29,
    lastModified: 'Yesterday',
  },
  {
    id: 'tt2',
    name: 'Senior Secondary Mock Schedule',
    academicYear: '2025/2026',
    status: 'draft',
    templateId: 'tpl1',
    templateName: 'Standard 8-Period Day',
    entryCount: 15,
    lastModified: '3 days ago',
  },
  {
    id: 'tt3',
    name: '2024/2025 Term 3 Archive',
    academicYear: '2024/2025',
    status: 'archived',
    templateId: 'tpl2',
    templateName: '6-Period Compact Day',
    entryCount: 24,
    lastModified: '1 week ago',
  },
];

const TEMPLATES = ['Standard 8-Period Day', '6-Period Compact Day'];
const ACADEMIC_YEARS = ['2025/2026', '2026/2027'];

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: Edit3,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  published: {
    label: 'Published',
    icon: CheckCircle,
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    color: 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]',
    dot: 'bg-[hsl(var(--text-tertiary))]',
  },
};

export function TimetableList() {
  const [timetables, setTimetables] = useState<Timetable[]>(INITIAL_TIMETABLES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

  const [formData, setFormData] = useState<{
    name: string;
    academicYear: string;
    templateName: string;
    status: 'draft' | 'published';
  }>({
    name: '',
    academicYear: '2025/2026',
    templateName: 'Standard 8-Period Day',
    status: 'draft',
  });

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    const newTimetable: Timetable = {
      id: `tt${Date.now()}`,
      name: formData.name,
      academicYear: formData.academicYear,
      status: formData.status,
      templateId: `tpl${Math.ceil(Math.random() * 2)}`,
      templateName: formData.templateName,
      entryCount: 0,
      lastModified: 'Just now',
    };
    setTimetables(prev => [newTimetable, ...prev]);
    setIsAdding(false);
    setFormData({ name: '', academicYear: '2025/2026', templateName: 'Standard 8-Period Day', status: 'draft' });
    // Open newly created timetable in editor immediately
    setSelectedTimetable(newTimetable);
  };

  const handleUpdateFromEditor = (updated: Timetable, entries: TimetableEntry[]) => {
    setTimetables(prev => prev.map(t => t.id === updated.id ? {
      ...updated,
      entryCount: entries.length,
      lastModified: 'Just now',
    } : t));
    setSelectedTimetable(prev => prev?.id === updated.id ? { ...updated, entryCount: entries.length, lastModified: 'Just now' } : prev);
  };

  const handleSaveCardEdit = () => {
    if (!editingTimetable || !editingTimetable.name.trim()) return;
    setTimetables(prev => prev.map(t => t.id === editingTimetable.id ? {
      ...t,
      name: editingTimetable.name,
      academicYear: editingTimetable.academicYear,
      status: editingTimetable.status,
      templateName: editingTimetable.templateName,
      lastModified: 'Just now',
    } : t));
    setEditingTimetable(null);
  };

  const handleDelete = (id: string) => {
    setTimetables(prev => prev.filter(t => t.id !== id));
    if (selectedTimetable?.id === id) setSelectedTimetable(null);
    setDeleteId(null);
  };

  const filtered = timetables.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.academicYear.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Show editor
  if (selectedTimetable) {
    return (
      <TimetableEditor
        timetable={selectedTimetable}
        onBack={() => setSelectedTimetable(null)}
        onSave={handleUpdateFromEditor}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input
            type="text"
            placeholder="Search timetables…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
          {(['all', 'draft', 'published', 'archived'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`h-7 px-3 rounded-md text-xs font-medium capitalize transition-all ${filterStatus === s ? 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] shadow-sm' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Timetable
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(timetable => {
          const sc = statusConfig[timetable.status];
          return (
            <div
              key={timetable.id}
              onClick={() => setSelectedTimetable(timetable)}
              className="glass-card p-5 cursor-pointer hover:border-[hsl(var(--accent)/0.4)] hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setEditingTimetable({ ...timetable });
                    }}
                    className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                    title="Edit Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setDeleteId(timetable.id);
                    }}
                    className="p-1.5 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete Timetable"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.12)] border border-[hsl(var(--accent)/0.25)] flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5 text-[hsl(var(--accent))]" />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{timetable.academicYear}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] transition-colors leading-snug mb-2">
                  {timetable.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))] mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  {timetable.templateName}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-tertiary))]">
                  <Clock className="w-3.5 h-3.5" />
                  {timetable.entryCount} scheduled periods · Modified {timetable.lastModified}
                </div>
              </div>

              {/* AI Ready + Arrow */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(var(--border)/0.5)]">
                <div className="flex items-center gap-1.5 text-[hsl(var(--accent))] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Interactive Editor
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--accent))]">
                  <span>Open Grid</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center">
            <Calendar className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold text-[hsl(var(--text-secondary))]">No timetables found</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
              {searchTerm ? 'Try a different search term.' : 'Create your first timetable to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">New Timetable</h3>
              <button onClick={() => setIsAdding(false)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Timetable Name</label>
                <input
                  type="text"
                  placeholder="e.g. 2025/2026 Term 2 Master"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Academic Year</label>
                  <select
                    value={formData.academicYear}
                    onChange={e => setFormData(p => ({ ...p, academicYear: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    {ACADEMIC_YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'draft' | 'published' }))}
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Slot Template</label>
                <select
                  value={formData.templateName}
                  onChange={e => setFormData(p => ({ ...p, templateName: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                >
                  {TEMPLATES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 h-10 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.name.trim()}
                className="flex-1 h-10 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingTimetable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Edit Timetable Details</h3>
              <button onClick={() => setEditingTimetable(null)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Timetable Name</label>
                <input
                  type="text"
                  value={editingTimetable.name}
                  onChange={e => setEditingTimetable(p => p ? { ...p, name: e.target.value } : null)}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Academic Year</label>
                  <select
                    value={editingTimetable.academicYear}
                    onChange={e => setEditingTimetable(p => p ? { ...p, academicYear: e.target.value } : null)}
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    {ACADEMIC_YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={editingTimetable.status}
                    onChange={e => setEditingTimetable(p => p ? { ...p, status: e.target.value as any } : null)}
                    className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTimetable(null)}
                className="flex-1 h-10 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCardEdit}
                disabled={!editingTimetable.name.trim()}
                className="flex-1 h-10 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] mb-1">Delete Timetable?</h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mb-5">
              Are you sure you want to delete this timetable? All associated slot allocations will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 h-10 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
