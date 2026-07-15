import React from 'react';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepTitle } from './VisualHelpers';
import { WizardData } from '../../types/provisioning';
import { PLAN_OPTIONS } from '../../constants/provisioning';

interface SubscriptionStepProps {
  data: WizardData;
  updateField: (key: keyof WizardData, value: any) => void;
}

export function SubscriptionStep({ data, updateField }: SubscriptionStepProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <StepTitle icon={CreditCard} title="Subscription Plan" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLAN_OPTIONS.map((p) => (
          <label
            key={p.value}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
              data.plan === p.value
                ? p.color + ' border-opacity-60'
                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'
            )}
          >
            <input
              type="radio"
              className="sr-only"
              checked={data.plan === p.value}
              onChange={() => updateField('plan', p.value)}
            />
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors',
                data.plan === p.value ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]' : 'border-[hsl(var(--border))]'
              )}
            >
              {data.plan === p.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-[hsl(var(--text-primary))]">{p.label}</p>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-0.5">{p.desc}</p>
              <p className="text-sm font-bold text-[hsl(var(--accent))] mt-2">{p.price}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
