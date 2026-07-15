import React from 'react';
import { User, Zap } from 'lucide-react';
import { StepTitle, FieldLabel, inputCls } from './VisualHelpers';
import { WizardData } from '../../types/provisioning';

interface AdminStepProps {
  data: WizardData;
  updateField: (key: keyof WizardData, value: any) => void;
}

export function AdminStep({ data, updateField }: AdminStepProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      <StepTitle icon={User} title="Initial Admin Account" />
      <p className="text-xs text-[hsl(var(--text-tertiary))]">
        This person will be the super-user for {data.orgMode === 'standalone' ? 'the school' : 'the organization'}. They will receive an invitation email.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Full Name</FieldLabel>
          <input
            type="text"
            value={data.adminName}
            onChange={(e) => updateField('adminName', e.target.value)}
            placeholder="John Doe"
            className={inputCls}
          />
        </div>
        <div>
          <FieldLabel required>Email Address</FieldLabel>
          <input
            type="email"
            value={data.adminEmail}
            onChange={(e) => updateField('adminEmail', e.target.value)}
            placeholder="admin@organization.com"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Temporary Password (Optional)</FieldLabel>
          <input
            type="text"
            value={data.adminPassword || ''}
            onChange={(e) => updateField('adminPassword', e.target.value)}
            placeholder="Leave blank to auto-generate"
            className={inputCls}
          />
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-amber-500/80 leading-relaxed">
          If left blank, a temporary password will be auto-generated and included in the invitation email. The admin must change it on first login.
        </p>
      </div>
    </div>
  );
}
