'use client';

import { useState } from 'react';
import { Modal, ModalCancelButton, ModalSubmitButton } from '@/components/shared/modal';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';

export interface SubjectData {
  id: string;
  name: string;
  code: string | null;
  department: string;
  is_elective: boolean;
  teachers: number;
  classes: number;
}

const departmentColors: Record<string, string> = {
  Sciences: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Languages: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Humanities: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Technology: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Arts: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
};

export function SubjectsClient({ initialSubjects }: { initialSubjects: SubjectData[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const departments = [...new Set(initialSubjects.map(s => s.department).filter(Boolean))].sort();

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Subjects</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{initialSubjects.length} subjects across {departments.length} departments</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Grouped by Department */}
      {departments.length === 0 ? (
        <div className="glass-card p-8 text-center text-sm text-[hsl(var(--text-tertiary))]">
          No subjects found. Add your first subject to get started.
        </div>
      ) : departments.map(dept => {
        const subjects = initialSubjects.filter(s => s.department === dept);
        return (
          <div key={dept}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${departmentColors[dept] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'}`}>
                {dept}
              </span>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">{subjects.length} subjects</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {subjects.map((subject, i) => (
                <div key={subject.id} className="glass-card p-4 flex items-center justify-between group animate-fade-in gap-3" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-[hsl(var(--accent))]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">{subject.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{subject.code || 'N/A'}</code>
                        {subject.is_elective && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium flex-shrink-0">Elective</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-[hsl(var(--text-secondary))]">{subject.teachers} teachers</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{subject.classes} classes</p>
                    </div>
                    <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))]"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add Subject Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Subject" footer={<><ModalCancelButton onClick={() => setShowAddModal(false)} /><ModalSubmitButton onClick={() => setShowAddModal(false)}>Add Subject</ModalSubmitButton></>}>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Subject Name</label><input type="text" placeholder="e.g., Mathematics" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Subject Code</label><input type="text" placeholder="e.g., MATH101" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] font-mono placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Department</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Select department</option>{departments.map(d => <option key={d}>{d}</option>)}</select></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))] cursor-pointer"><input type="checkbox" className="accent-[hsl(var(--accent))]" /> This is an elective subject</label>
        </div>
      </Modal>
    </div>
  );
}
