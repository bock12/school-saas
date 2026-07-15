import React from 'react';
import { CheckCircle2, Shield, Database, GraduationCap } from 'lucide-react';
import { StepTitle, ReviewItem } from './VisualHelpers';
import { WizardData } from '../../types/provisioning';
import { PLAN_OPTIONS } from '../../constants/provisioning';

interface ReviewStepProps {
  data: WizardData;
  isProvisioning: boolean;
  provisionProgress: number;
}

export function ReviewStep({ data, isProvisioning, provisionProgress }: ReviewStepProps) {
  return (
    <div className="space-y-5 animate-fade-in relative">
      {isProvisioning ? (
        <div className="absolute inset-0 bg-[hsl(var(--bg-secondary))] flex flex-col items-center justify-center gap-6 z-10 animate-fade-in rounded-2xl">
          {/* Circular progress */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full text-[hsl(var(--border))]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" />
            </svg>
            <svg
              className="absolute inset-0 w-full h-full text-[hsl(var(--accent))] -rotate-90 transition-all duration-200"
              viewBox="0 0 100 100"
              strokeDasharray="276"
              strokeDashoffset={276 - (276 * provisionProgress) / 100}
            >
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="w-6 h-6 text-[hsl(var(--accent))] animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Provisioning Infrastructure</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] font-mono">
              {provisionProgress < 25
                ? 'Creating database schema…'
                : provisionProgress < 50
                  ? 'Provisioning storage buckets…'
                  : provisionProgress < 75
                    ? 'Configuring DNS subdomains…'
                    : 'Setting up admin accounts…'}
            </p>
            <p className="text-lg font-black text-[hsl(var(--accent))]">{provisionProgress}%</p>
          </div>
        </div>
      ) : (
        <>
          <StepTitle icon={CheckCircle2} title="Review & Deploy" />
          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[11px] font-medium flex gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>This will provision a new tenant database schema, S3 storage, and DNS subdomains. Review before continuing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReviewItem
              label="Organization Type"
              value={data.orgMode === 'standalone' ? 'Standalone School' : 'Multi-School Organization'}
            />
            <ReviewItem label="Name" value={data.orgName || '—'} />
            {data.orgMode === 'standalone' && <ReviewItem label="Portal URL" value={`${data.orgSlug}.schoolsaas.com`} mono />}
            {data.orgMode === 'multi' && (
              <ReviewItem label="Schools" value={`${data.schools.length} school${data.schools.length !== 1 ? 's' : ''}`} />
            )}
            <ReviewItem label="Plan" value={PLAN_OPTIONS.find((p) => p.value === data.plan)?.label ?? '—'} />
            <ReviewItem label="Region" value={data.region} />
            <ReviewItem label="Modules" value={`${data.modules.length} enabled`} />
            <ReviewItem label="Admin" value={data.adminEmail || '—'} mono />
          </div>

          {data.orgMode === 'multi' && data.schools.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">
                Schools to Provision
              </p>
              <div className="space-y-1.5">
                {data.schools.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))]"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                        {s.name || 'Unnamed school'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{s.slug}.schoolsaas.com</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
