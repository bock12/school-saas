'use client';

import { useState } from 'react';
import { Modal, ModalCancelButton, ModalSubmitButton } from '@/components/shared/modal';
import { Layers, Plus, Users, GraduationCap, ChevronRight, Edit2, Trash2 } from 'lucide-react';

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

export function ClassesClient({ initialClasses }: { initialClasses: ClassData[] }) {
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [expandedClass, setExpandedClass] = useState<string | null>(initialClasses[0]?.id || null);

  const totalStudents = initialClasses.reduce((sum, c) => sum + c.sections.reduce((s, sec) => s + sec.students, 0), 0);
  const totalSections = initialClasses.reduce((sum, c) => sum + c.sections.length, 0);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Classes & Sections</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{initialClasses.length} classes, {totalSections} sections, {totalStudents} students</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddSection(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <Plus className="w-4 h-4" /> Add Section
          </button>
          <button onClick={() => setShowAddClass(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Classes', value: initialClasses.length, icon: Layers, color: 'hsl(var(--accent))' },
          { label: 'Total Sections', value: totalSections, icon: Users, color: 'hsl(142, 71%, 45%)' },
          { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'hsl(38, 92%, 50%)' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
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
        ) : initialClasses.map((cls, i) => {
          const isExpanded = expandedClass === cls.id;
          const totalInClass = cls.sections.reduce((s, sec) => s + sec.students, 0);

          return (
            <div key={cls.id} className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              {/* Class Header */}
              <button
                onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center text-[hsl(var(--accent))] text-sm font-bold">
                    {cls.short_name || cls.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{cls.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))]">{cls.sections.length} sections • {totalInClass} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))]"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-1 rounded hover:bg-[hsl(var(--danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-[hsl(var(--text-tertiary))] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {/* Sections */}
              {isExpanded && (
                <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-primary)/0.5)]">
                  {cls.sections.length === 0 ? (
                    <div className="px-5 py-4 text-xs text-[hsl(var(--text-tertiary))] text-center">
                      No sections in this class.
                    </div>
                  ) : cls.sections.map(section => (
                    <div key={section.id} className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                      <div className="flex items-center gap-3 pl-14">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--bg-tertiary))] flex items-center justify-center text-xs font-bold text-[hsl(var(--text-secondary))]">
                          {section.name}
                        </div>
                        <div>
                          <p className="text-sm text-[hsl(var(--text-primary))]">{cls.name} — Section {section.name}</p>
                          <p className="text-xs text-[hsl(var(--text-tertiary))]">Class Teacher: {section.teacher || 'Unassigned'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{section.students}/{section.capacity}</p>
                          <div className="w-20 h-1.5 rounded-full bg-[hsl(var(--bg-tertiary))] mt-1">
                            <div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${Math.min((section.students / section.capacity) * 100, 100)}%` }} />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1 rounded hover:bg-[hsl(var(--bg-tertiary))]"><Edit2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                          <button className="p-1 rounded hover:bg-[hsl(var(--danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Class Modal */}
      <Modal isOpen={showAddClass} onClose={() => setShowAddClass(false)} title="Add New Class" footer={<><ModalCancelButton onClick={() => setShowAddClass(false)} /><ModalSubmitButton onClick={() => setShowAddClass(false)}>Create Class</ModalSubmitButton></>}>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Class Name</label><input type="text" placeholder="e.g., Grade 10" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Short Name</label><input type="text" placeholder="e.g., G10" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Capacity</label><input type="number" placeholder="40" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          </div>
        </div>
      </Modal>

      {/* Add Section Modal */}
      <Modal isOpen={showAddSection} onClose={() => setShowAddSection(false)} title="Add New Section" footer={<><ModalCancelButton onClick={() => setShowAddSection(false)} /><ModalSubmitButton onClick={() => setShowAddSection(false)}>Create Section</ModalSubmitButton></>}>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Class</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Select class</option>{initialClasses.map(c => <option key={c.id}>{c.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Section Name</label><input type="text" placeholder="e.g., A" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
            <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Capacity</label><input type="number" placeholder="40" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" /></div>
          </div>
          <div><label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Class Teacher</label><select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"><option>Select teacher</option></select></div>
        </div>
      </Modal>
    </div>
  );
}
