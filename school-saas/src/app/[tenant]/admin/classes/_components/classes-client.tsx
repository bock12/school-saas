'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalCancelButton, ModalSubmitButton } from '@/components/shared/modal';
import { Layers, Plus, Users, GraduationCap, ChevronRight, Edit2, Trash2, Loader2 } from 'lucide-react';
import { addClass, addSection } from '../actions';

export interface Section {
  id: string;
  name: string;
  students: number;
  teacher: string | null;
  capacity: number;
}

export interface ClassData {
  id: string;
  name: string;
  short_name: string | null;
  sections: Section[];
}

export interface TeacherOption {
  id: string;
  name: string;
}

const inputClass =
  'w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
const selectClass =
  'w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
const labelClass = 'block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5';

export function ClassesClient({
  initialClasses,
  teacherOptions,
  tenant,
}: {
  initialClasses: ClassData[];
  teacherOptions: TeacherOption[];
  tenant: string;
}) {
  const router = useRouter();
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [expandedClass, setExpandedClass] = useState<string | null>(initialClasses[0]?.id || null);
  const [classFormError, setClassFormError] = useState<string | null>(null);
  const [sectionFormError, setSectionFormError] = useState<string | null>(null);
  const [isClassPending, startClassTransition] = useTransition();
  const [isSectionPending, startSectionTransition] = useTransition();

  const totalStudents = initialClasses.reduce((sum, c) => sum + c.sections.reduce((s, sec) => s + sec.students, 0), 0);
  const totalSections = initialClasses.reduce((sum, c) => sum + c.sections.length, 0);

  function handleAddClass(formData: FormData) {
    setClassFormError(null);
    formData.set('tenant', tenant);
    startClassTransition(async () => {
      const result = await addClass(formData);
      if (result.success) {
        setShowAddClass(false);
        router.refresh();
      } else {
        setClassFormError(result.error || 'Failed to create class.');
      }
    });
  }

  function handleAddSection(formData: FormData) {
    setSectionFormError(null);
    formData.set('tenant', tenant);
    startSectionTransition(async () => {
      const result = await addSection(formData);
      if (result.success) {
        setShowAddSection(false);
        router.refresh();
      } else {
        setSectionFormError(result.error || 'Failed to create section.');
      }
    });
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Classes &amp; Sections</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{initialClasses.length} classes, {totalSections} sections, {totalStudents} students</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={() => setShowAddSection(true)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add Section
          </button>
          <button onClick={() => setShowAddClass(true)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Classes', value: initialClasses.length, icon: Layers, color: 'hsl(var(--accent))' },
          { label: 'Total Sections', value: totalSections, icon: Users, color: 'hsl(142, 71%, 45%)' },
          { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'hsl(38, 92%, 50%)' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}15` }}>
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">{stat.value}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Class Accordion */}
      <div className="space-y-3">
        {initialClasses.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-[hsl(var(--text-tertiary))]">
            No classes found. Add your first class to get started.
          </div>
        ) : (
          initialClasses.map((cls, i) => {
            const isExpanded = expandedClass === cls.id;
            const totalInClass = cls.sections.reduce((s, sec) => s + sec.students, 0);

            return (
              <div key={cls.id} className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Use div+role to avoid nested <button> inside <button> — HTML spec violation */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedClass(isExpanded ? null : cls.id); } }}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors cursor-pointer select-none gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] text-sm font-bold flex-shrink-0">
                      {cls.short_name || cls.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{cls.name}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{cls.sections.length} sections • {totalInClass} students</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 rounded hover:bg-[hsl(var(--bg-tertiary))]"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                      <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 rounded hover:bg-[hsl(var(--danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-[hsl(var(--text-tertiary))] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.5)] divide-y divide-[hsl(var(--border)/0.3)]">
                    {cls.sections.length === 0 ? (
                      <div className="px-5 py-4 text-xs text-[hsl(var(--text-tertiary))] text-center">No sections in this class.</div>
                    ) : (
                      cls.sections.map((section) => (
                        <div key={section.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors gap-3">
                          <div className="flex items-center gap-3 sm:pl-14">
                            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--bg-tertiary))] flex items-center justify-center text-xs font-bold text-[hsl(var(--text-secondary))] flex-shrink-0">
                              {section.name}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{cls.name} — Section {section.name}</p>
                              <p className="text-xs text-[hsl(var(--text-tertiary))]">Class Teacher: {section.teacher || 'Unassigned'}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-11 sm:pl-0">
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{section.students}/{section.capacity}</p>
                              <div className="w-20 h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] mt-1">
                                <div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${Math.min((section.students / section.capacity) * 100, 100)}%` }} />
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button className="p-1.5 rounded hover:bg-[hsl(var(--bg-tertiary))]"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                              <button className="p-1.5 rounded hover:bg-[hsl(var(--danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={showAddClass}
        onClose={() => { setShowAddClass(false); setClassFormError(null); }}
        title="Add New Class"
        footer={
          <>
            <ModalCancelButton onClick={() => { setShowAddClass(false); setClassFormError(null); }} />
            <ModalSubmitButton
              onClick={() => {
                const form = document.getElementById('add-class-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              disabled={isClassPending}
            >
              {isClassPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Class'}
            </ModalSubmitButton>
          </>
        }
      >
        <form id="add-class-form" action={handleAddClass} className="space-y-4">
          {classFormError && (
            <div className="px-3 py-2.5 rounded-lg bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.3)] text-xs text-[hsl(var(--danger))]">{classFormError}</div>
          )}
          <div><label className={labelClass}>Class Name *</label><input name="name" type="text" required placeholder="e.g., Grade 10" className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Short Name</label><input name="short_name" type="text" placeholder="e.g., G10" className={inputClass} /></div>
            <div><label className={labelClass}>Capacity</label><input name="capacity" type="number" placeholder="40" className={inputClass} /></div>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={showAddSection}
        onClose={() => { setShowAddSection(false); setSectionFormError(null); }}
        title="Add New Section"
        footer={
          <>
            <ModalCancelButton onClick={() => { setShowAddSection(false); setSectionFormError(null); }} />
            <ModalSubmitButton
              onClick={() => {
                const form = document.getElementById('add-section-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              disabled={isSectionPending}
            >
              {isSectionPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Section'}
            </ModalSubmitButton>
          </>
        }
      >
        <form id="add-section-form" action={handleAddSection} className="space-y-4">
          {sectionFormError && (
            <div className="px-3 py-2.5 rounded-lg bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.3)] text-xs text-[hsl(var(--danger))]">{sectionFormError}</div>
          )}
          <div>
            <label className={labelClass}>Class *</label>
            <select name="class_id" required className={selectClass}>
              <option value="">Select class</option>
              {initialClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Section Name *</label><input name="name" type="text" required placeholder="e.g., A" className={inputClass} /></div>
            <div><label className={labelClass}>Capacity</label><input name="capacity" type="number" placeholder="40" className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>Class Teacher</label>
            <select name="teacher_id" className={selectClass}>
              <option value="">No teacher assigned</option>
              {teacherOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
