import React from 'react';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';

interface WizardNavigationProps {
  step: number;
  totalSteps: number;
  isProvisioning: boolean;
  prev: () => void;
  next: () => void;
  provision: () => void;
}

export function WizardNavigation({ step, totalSteps, isProvisioning, prev, next, provision }: WizardNavigationProps) {
  const isLastStep = step === totalSteps - 1;

  return (
    <div className="flex items-center justify-between px-4 sm:px-0">
      <button
        onClick={prev}
        disabled={step === 0 || isProvisioning}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
        {step + 1} / {totalSteps}
      </span>

      {isLastStep ? (
        <button
          onClick={provision}
          disabled={isProvisioning}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Deploy Tenant <Rocket className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={next}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-bold text-sm transition-all shadow-sm"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
