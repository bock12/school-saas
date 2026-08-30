'use client';

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Inbox } from 'lucide-react';
import { useProvisionWizard } from '@/features/tenant-management/hooks/useProvisionWizard';
import { StepProgress } from '@/features/tenant-management/components/provisioning/StepProgress';
import { TypeStep } from '@/features/tenant-management/components/provisioning/TypeStep';
import { IdentityStep } from '@/features/tenant-management/components/provisioning/IdentityStep';
import { SchoolsStep } from '@/features/tenant-management/components/provisioning/SchoolsStep';
import { SubscriptionStep } from '@/features/tenant-management/components/provisioning/SubscriptionStep';
import { ModulesStep } from '@/features/tenant-management/components/provisioning/ModulesStep';
import { AdminStep } from '@/features/tenant-management/components/provisioning/AdminStep';
import { ReviewStep } from '@/features/tenant-management/components/provisioning/ReviewStep';
import { WizardNavigation } from '@/features/tenant-management/components/provisioning/WizardNavigation';
import { OrgMode } from '@/features/tenant-management/types/provisioning';

function ProvisioningWizardContent() {
  const searchParams = useSearchParams();

  // Read pre-fill parameters if originating from an onboarding inquiry lead
  const initialOverrides = useMemo(() => {
    const name = searchParams?.get('name') || undefined;
    const email = searchParams?.get('email') || undefined;
    const contactName = searchParams?.get('contactName') || undefined;
    const type = (searchParams?.get('type') as OrgMode) || undefined;
    const region = searchParams?.get('region') || undefined;
    const leadId = searchParams?.get('leadId') || undefined;

    if (!name && !email && !leadId) return undefined;

    return {
      orgName: name,
      adminEmail: email,
      adminName: contactName,
      orgMode: type || 'standalone',
      region: region,
      leadId: leadId,
    };
  }, [searchParams]);

  const {
    state,
    visibleSteps,
    currentStepDef,
    totalSteps,
    progressPercent,
    setOrgMode,
    updateField,
    addSchool,
    removeSchool,
    updateSchool,
    toggleSchoolLevels,
    toggleSchoolShifts,
    toggleLevels,
    toggleShifts,
    toggleModule,
    prev,
    next,
    reset,
    provision,
  } = useProvisionWizard(initialOverrides);

  const { step, data, isProvisioning, provisionProgress, provisionDone, provisionError, invitesSent } = state;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="text-center space-y-1.5 px-4 sm:px-0">
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
          Provision New Tenant
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          Step-by-step setup for a new organization and its schools.
        </p>

        {data.leadId && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mt-2">
            <Inbox className="w-3.5 h-3.5" /> Pre-filled from Institutional Inquiry
          </div>
        )}
      </div>

      {/* Step progress bar */}
      {!provisionDone && (
        <StepProgress
          visibleSteps={visibleSteps}
          step={step}
          progressPercent={progressPercent}
        />
      )}

      {/* Form card */}
      <div className="glass-card p-4 sm:p-8 rounded-2xl border border-[hsl(var(--border))] min-h-[360px] mx-4 sm:mx-0">
        {provisionDone ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Tenant Provisioned!</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] max-w-sm">
              <strong>{data.orgName}</strong> has been successfully provisioned.
            </p>
            {invitesSent.length > 0 && (
              <div className="w-full max-w-sm text-left space-y-2">
                <p className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Invitations Sent</p>
                {invitesSent.map((inv, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[hsl(var(--text-primary))] truncate">{inv.email}</p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
                        {inv.role === 'org_admin' ? 'Org Admin' : 'School Admin'} · {inv.tenantName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              <a
                href="/super-admin/tenants/directory"
                className="px-4 py-2 rounded-lg bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-95 transition-opacity"
              >
                View in Tenant Directory
              </a>
              <a
                href="/super-admin/tenants/leads"
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Back to Leads
              </a>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Provision Another
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentStepDef?.id === 'type' && (
              <TypeStep
                orgMode={data.orgMode}
                setOrgMode={setOrgMode}
              />
            )}

            {currentStepDef?.id === 'identity' && (
              <IdentityStep
                data={data}
                updateField={updateField}
                toggleLevels={toggleLevels}
                toggleShifts={toggleShifts}
              />
            )}

            {currentStepDef?.id === 'schools' && (
              <SchoolsStep
                data={data}
                addSchool={addSchool}
                removeSchool={removeSchool}
                updateSchool={updateSchool}
                toggleSchoolLevels={toggleSchoolLevels}
                toggleSchoolShifts={toggleSchoolShifts}
              />
            )}

            {currentStepDef?.id === 'subscription' && (
              <SubscriptionStep data={data} updateField={updateField} />
            )}

            {currentStepDef?.id === 'modules' && (
              <ModulesStep data={data} toggleModule={toggleModule} />
            )}

            {currentStepDef?.id === 'admin' && (
              <AdminStep data={data} updateField={updateField} updateSchool={updateSchool} />
            )}

            {currentStepDef?.id === 'review' && (
              <ReviewStep
                data={data}
                isProvisioning={isProvisioning}
                provisionProgress={provisionProgress}
              />
            )}
          </>
        )}
      </div>

      {/* Provision error */}
      {provisionError && !provisionDone && (
        <div className="flex items-center gap-2 p-3 mx-4 sm:mx-0 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-xs font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {provisionError}
        </div>
      )}

      {/* Navigation footer */}
      {!provisionDone && (
        <WizardNavigation
          step={step}
          totalSteps={totalSteps}
          isProvisioning={isProvisioning}
          prev={prev}
          next={next}
          provision={provision}
        />
      )}
    </div>
  );
}

export default function ProvisioningWizardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-12 text-center text-xs text-[hsl(var(--text-secondary))] animate-pulse">
        Loading provisioning wizard...
      </div>
    }>
      <ProvisioningWizardContent />
    </Suspense>
  );
}
