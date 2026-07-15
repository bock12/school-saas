import React from 'react';
import { cn } from '@/lib/utils';

export const inputCls =
  'w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';

interface StepTitleProps {
  icon: React.ComponentType<any>;
  title: string;
}
export function StepTitle({ icon: Icon, title }: StepTitleProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[hsl(var(--accent))]" />
      </div>
      <h2 className="text-base font-black text-[hsl(var(--text-primary))] tracking-tight">{title}</h2>
    </div>
  );
}

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
}
export function FieldLabel({ children, required }: FieldLabelProps) {
  return (
    <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1.5 block">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

interface ReviewItemProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}
export function ReviewItem({ label, value, mono }: ReviewItemProps) {
  return (
    <div className="px-4 py-3 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] flex flex-col gap-0.5">
      <span className="text-[9px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">{label}</span>
      <span className={cn('text-xs font-semibold text-[hsl(var(--text-primary))]', mono && 'font-mono')}>
        {value}
      </span>
    </div>
  );
}
