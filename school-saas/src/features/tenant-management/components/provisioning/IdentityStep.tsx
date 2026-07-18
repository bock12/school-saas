import React from 'react';
import { Globe, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepTitle, FieldLabel, inputCls } from './VisualHelpers';
import { WizardData } from '../../types/provisioning';
import { REGIONS, SCHOOL_LEVELS, SCHOOL_SHIFTS } from '../../constants/provisioning';

interface IdentityStepProps {
  data: WizardData;
  updateField: (key: keyof WizardData, value: any) => void;
  toggleLevels: (val: string) => void;
  toggleShifts: (val: string) => void;
}

export function IdentityStep({ data, updateField, toggleLevels, toggleShifts }: IdentityStepProps) {
  const isValidSlug = (s: string) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(s);

  return (
    <div className="space-y-5 animate-fade-in">
      <StepTitle icon={Globe} title="Organization Identity" />

      <div>
        <FieldLabel required>
          {data.orgMode === 'standalone' ? 'School Name' : 'Organization / Trust Name'}
        </FieldLabel>
        <input
          type="text"
          value={data.orgName}
          onChange={(e) => {
            updateField('orgName', e.target.value);
            // Auto-slugify standalone slug from name if slug is empty
            if (data.orgMode === 'standalone' && !data.orgSlug) {
              const slug = e.target.value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
              updateField('orgSlug', slug);
            }
          }}
          placeholder={data.orgMode === 'standalone' ? 'e.g. Lincoln Academy' : 'e.g. Greenwood Education Trust'}
          className={inputCls}
        />
      </div>

      <div>
        <FieldLabel required>
          {data.orgMode === 'standalone' ? 'School Subdomain' : 'Organization Portal Subdomain'}
        </FieldLabel>
        <div className="flex rounded-xl overflow-hidden border border-[hsl(var(--border))] focus-within:border-[hsl(var(--accent))] transition-colors">
          <input
            type="text"
            value={data.orgSlug}
            onChange={(e) => updateField('orgSlug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            placeholder={data.orgMode === 'standalone' ? 'lincoln' : 'greenwood'}
            className="flex-1 bg-[hsl(var(--bg-tertiary))] px-4 py-2.5 text-sm font-mono text-[hsl(var(--text-primary))] focus:outline-none"
          />
          <span className="flex-shrink-0 bg-[hsl(var(--bg-elevated))] px-4 py-2.5 text-sm text-[hsl(var(--text-tertiary))] font-mono border-l border-[hsl(var(--border))]">
            .schoolsaas.com
          </span>
        </div>
        {data.orgSlug && isValidSlug(data.orgSlug) && (
          <p className="mt-1.5 text-[11px] text-emerald-400 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Portal: <span className="font-mono">{data.orgSlug}.schoolsaas.com</span>
          </p>
        )}
      </div>

      <div>
        <FieldLabel required>Data Region</FieldLabel>
        <select
          value={data.region}
          onChange={(e) => updateField('region', e.target.value)}
          className={inputCls}
        >
          {REGIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      {data.orgMode === 'standalone' && (
        <>
          <div>
            <FieldLabel>School Levels</FieldLabel>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {SCHOOL_LEVELS.map((t) => (
                <label
                  key={t.value}
                  className={cn(
                    'flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-all text-[11px] font-semibold',
                    data.schoolLevels.includes(t.value)
                      ? 'border-teal-500/40 bg-teal-500/8 text-teal-400'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={data.schoolLevels.includes(t.value)}
                    onChange={() => toggleLevels(t.value)}
                    className="sr-only"
                  />
                  {data.schoolLevels.includes(t.value) && <Check className="w-3 h-3 flex-shrink-0 text-teal-400" />}
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
                    data.schoolShifts.includes(t.value)
                      ? 'border-indigo-500/40 bg-indigo-500/8 text-indigo-400'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={data.schoolShifts.includes(t.value)}
                    onChange={() => toggleShifts(t.value)}
                    className="sr-only"
                  />
                  {data.schoolShifts.includes(t.value) && (
                    <Check className="w-3 h-3 flex-shrink-0 text-indigo-400" />
                  )}
                  {t.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
