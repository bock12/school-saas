import React from 'react';
import { Building2, School } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepTitle } from './VisualHelpers';
import { OrgMode } from '../../types/provisioning';

interface TypeStepProps {
  orgMode: OrgMode;
  setOrgMode: (mode: OrgMode) => void;
}

export function TypeStep({ orgMode, setOrgMode }: TypeStepProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <StepTitle icon={Building2} title="What are you provisioning?" />
      <p className="text-xs text-[hsl(var(--text-tertiary))]">
        This determines the hierarchy structure and domain routing for the new tenant.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Standalone */}
        <label className={cn(
          'flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all',
          orgMode === 'standalone'
            ? 'border-teal-500/60 bg-teal-500/8'
            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'
        )}>
          <input type="radio" className="sr-only" checked={orgMode === 'standalone'} onChange={() => setOrgMode('standalone')} />
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <School className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <p className="text-sm font-black text-[hsl(var(--text-primary))]">Standalone School</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 leading-relaxed">
              A single school that is its own organization. Gets one subdomain. Ideal for independent schools.
            </p>
          </div>
          <div className="text-[10px] font-bold text-teal-500 font-mono bg-teal-500/10 rounded-lg px-2 py-1 w-fit">
            school.schoolsaas.com
          </div>
        </label>

        {/* Multi-school */}
        <label className={cn(
          'flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all',
          orgMode === 'multi'
            ? 'border-[hsl(var(--accent)/0.6)] bg-[hsl(var(--accent)/0.06)]'
            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'
        )}>
          <input type="radio" className="sr-only" checked={orgMode === 'multi'} onChange={() => setOrgMode('multi')} />
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <p className="text-sm font-black text-[hsl(var(--text-primary))]">Multi-School Organization</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 leading-relaxed">
              A governing body (trust, authority, network) that manages multiple schools. Each school gets its own subdomain.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[hsl(var(--accent))] font-mono bg-[hsl(var(--accent)/0.08)] rounded-lg px-2 py-1 w-fit">
            school1.schoolsaas.com, school2.schoolsaas.com…
          </div>
        </label>
      </div>
    </div>
  );
}
