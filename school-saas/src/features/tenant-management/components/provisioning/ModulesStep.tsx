import React from 'react';
import { Blocks, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepTitle } from './VisualHelpers';
import { WizardData } from '../../types/provisioning';
import { MODULES } from '../../constants/provisioning';

interface ModulesStepProps {
  data: WizardData;
  toggleModule: (val: string) => void;
}

export function ModulesStep({ data, toggleModule }: ModulesStepProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <StepTitle icon={Blocks} title="Feature Modules" />
      <p className="text-xs text-[hsl(var(--text-tertiary))]">
        Select the modules to enable for this tenant. Modules can be changed later from the tenant settings.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MODULES.map((mod) => {
          const isOn = data.modules.includes(mod.id);
          return (
            <label
              key={mod.id}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl border transition-all',
                mod.required
                  ? 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] opacity-70 cursor-not-allowed'
                  : isOn
                    ? 'border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.06)] cursor-pointer'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] cursor-pointer'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors',
                  isOn ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]' : 'border-[hsl(var(--border))]'
                )}
                onClick={() => !mod.required && toggleModule(mod.id)}
              >
                {isOn && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{mod.name}</p>
                  {mod.required && (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">
                      REQUIRED
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{mod.desc}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
