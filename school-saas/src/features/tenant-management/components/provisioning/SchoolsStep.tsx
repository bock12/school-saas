import React from 'react';
import { GraduationCap, Trash2, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepTitle, FieldLabel, inputCls } from './VisualHelpers';
import { WizardData, SchoolEntry } from '../../types/provisioning';
import { SCHOOL_LEVELS, SCHOOL_SHIFTS } from '../../constants/provisioning';

interface SchoolsStepProps {
  data: WizardData;
  addSchool: () => void;
  removeSchool: (id: string) => void;
  updateSchool: (id: string, field: keyof SchoolEntry, value: any) => void;
  toggleSchoolLevels: (id: string, val: string) => void;
  toggleSchoolShifts: (id: string, val: string) => void;
}

export function SchoolsStep({
  data,
  addSchool,
  removeSchool,
  updateSchool,
  toggleSchoolLevels,
  toggleSchoolShifts,
}: SchoolsStepProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <StepTitle icon={GraduationCap} title="Add Schools" />
      <p className="text-xs text-[hsl(var(--text-tertiary))]">
        Add all schools under <strong className="text-[hsl(var(--text-primary))]">{data.orgName || 'your organization'}</strong>.
        Each school gets its own subdomain and tenant data isolation. You can add more later.
      </p>

      <div className="space-y-3">
        {data.schools.map((school, idx) => (
          <div
            key={school.id}
            className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[hsl(var(--text-secondary))] flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                School {idx + 1}
              </span>
              {data.schools.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSchool(school.id)}
                  className="p-1 rounded text-[hsl(var(--text-tertiary))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel required>School Name</FieldLabel>
                <input
                  type="text"
                  value={school.name}
                  onChange={(e) => updateSchool(school.id, 'name', e.target.value)}
                  placeholder="e.g. Lincoln High School"
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel required>Subdomain Slug</FieldLabel>
                <div className="flex rounded-xl overflow-hidden border border-[hsl(var(--border))] focus-within:border-[hsl(var(--accent))] transition-colors">
                  <input
                    type="text"
                    value={school.slug}
                    onChange={(e) =>
                      updateSchool(
                        school.id,
                        'slug',
                        e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    placeholder="lincoln"
                    className="flex-1 min-w-0 bg-[hsl(var(--bg-tertiary))] px-3 py-2 text-xs font-mono text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                  <span className="flex-shrink-0 bg-[hsl(var(--bg-elevated))] px-2 py-2 text-[10px] text-[hsl(var(--text-tertiary))] font-mono border-l border-[hsl(var(--border))]">
                    .schoolsaas.com
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <FieldLabel>School Levels</FieldLabel>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {SCHOOL_LEVELS.map((t) => (
                    <label
                      key={t.value}
                      className={cn(
                        'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                        school.schoolLevels.includes(t.value)
                          ? 'border-teal-500/40 bg-teal-500/8 text-teal-400'
                          : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={school.schoolLevels.includes(t.value)}
                        onChange={() => toggleSchoolLevels(school.id, t.value)}
                        className="sr-only"
                      />
                      {school.schoolLevels.includes(t.value) && (
                        <Check className="w-3 h-3 flex-shrink-0 text-teal-400" />
                      )}
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>School Shifts</FieldLabel>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {SCHOOL_SHIFTS.map((t) => (
                    <label
                      key={t.value}
                      className={cn(
                        'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                        school.schoolShifts.includes(t.value)
                          ? 'border-indigo-500/40 bg-indigo-500/8 text-indigo-400'
                          : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={school.schoolShifts.includes(t.value)}
                        onChange={() => toggleSchoolShifts(school.id, t.value)}
                        className="sr-only"
                      />
                      {school.schoolShifts.includes(t.value) && (
                        <Check className="w-3 h-3 flex-shrink-0 text-indigo-400" />
                      )}
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSchool}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.05)] w-full justify-center transition-all"
      >
        <Plus className="w-3.5 h-3.5" /> Add Another School
      </button>
    </div>
  );
}
