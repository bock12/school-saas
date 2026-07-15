import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProgressProps {
  visibleSteps: readonly { id: string; label: string; icon: React.ComponentType<any> }[];
  step: number;
  progressPercent: number;
}

export function StepProgress({ visibleSteps, step, progressPercent }: StepProgressProps) {
  return (
    <div className="relative px-2 sm:px-0">
      {/* Track */}
      <div className="absolute top-4 sm:top-5 left-2 sm:left-0 right-2 sm:right-0 h-0.5 bg-[hsl(var(--border))] z-0" />
      {/* Fill */}
      <div
        className="absolute top-4 sm:top-5 left-2 sm:left-0 h-0.5 bg-[hsl(var(--accent))] z-0 transition-all duration-500"
        style={{ width: `${progressPercent}%` }}
      />
      <div className="flex justify-between relative z-10">
        {visibleSteps.map((s, idx) => {
          const isActive = idx === step;
          const isDone = idx < step;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-col items-center gap-1.5 z-10 relative">
              <div className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative bg-[hsl(var(--bg-primary))]',
                isActive
                  ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))] shadow-lg shadow-[hsl(var(--accent)/0.2)]'
                  : isDone
                    ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
              )}>
                {isDone ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
              </div>
              <span className={cn(
                'text-[9px] font-bold uppercase tracking-wider hidden sm:block absolute top-12 whitespace-nowrap',
                isActive || isDone ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-tertiary))]'
              )}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
