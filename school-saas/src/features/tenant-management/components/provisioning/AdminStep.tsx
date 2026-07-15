import React from 'react';
import { User, Mail, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { StepTitle, FieldLabel, inputCls } from './VisualHelpers';
import { WizardData, SchoolEntry } from '../../types/provisioning';
import { AdminRole } from '@/app/actions/tenant';

interface AdminStepProps {
  data: WizardData;
  updateField: (key: keyof WizardData, value: any) => void;
  updateSchool?: (id: string, field: keyof SchoolEntry, value: any) => void;
}

const ROLE_OPTIONS: { value: AdminRole; label: string; desc: string }[] = [
  { value: 'school_admin',  label: 'School Admin',  desc: 'Manages a single school — students, staff, classes' },
  { value: 'org_admin',     label: 'Org Admin',     desc: 'Manages the entire organization and all its schools' },
];

function SchoolAdminCard({
  school,
  updateSchool,
}: {
  school: SchoolEntry;
  updateSchool: (id: string, field: keyof SchoolEntry, value: any) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[hsl(var(--accent)/0.15)] flex items-center justify-center text-[hsl(var(--accent))] text-[10px] font-black">
            {school.name.slice(0, 2).toUpperCase() || '??'}
          </div>
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">{school.name || 'Unnamed School'}</span>
          {school.adminEmail && (
            <span className="text-[10px] font-medium text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.1)] px-2 py-0.5 rounded-full">
              Admin assigned
            </span>
          )}
        </div>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          : <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[hsl(var(--border)/0.5)]">
          <div>
            <FieldLabel>Admin Name</FieldLabel>
            <input
              type="text"
              value={school.adminName || ''}
              onChange={e => updateSchool(school.id, 'adminName', e.target.value)}
              placeholder="Full name (optional)"
              className={inputCls}
            />
          </div>
          <div>
            <FieldLabel>Admin Email</FieldLabel>
            <input
              type="email"
              value={school.adminEmail || ''}
              onChange={e => updateSchool(school.id, 'adminEmail', e.target.value)}
              placeholder="admin@school.com (optional)"
              className={inputCls}
            />
          </div>
          <p className="sm:col-span-2 text-[11px] text-[hsl(var(--text-tertiary))] leading-relaxed">
            Leave blank to skip — you can assign a school admin later from the directory.
          </p>
        </div>
      )}
    </div>
  );
}

export function AdminStep({ data, updateField, updateSchool }: AdminStepProps) {
  const isOrg = data.orgMode === 'multi';
  const entityLabel = isOrg ? 'the organization' : 'the school';

  return (
    <div className="space-y-5 animate-fade-in">
      <StepTitle icon={User} title="Admin Account" />
      <p className="text-xs text-[hsl(var(--text-tertiary))]">
        This person will be the initial admin for {entityLabel}. A secure invitation email will be sent — no password is needed from you.
      </p>

      {/* Org / primary admin fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Full Name</FieldLabel>
          <input
            type="text"
            value={data.adminName}
            onChange={e => updateField('adminName', e.target.value)}
            placeholder="John Doe"
            className={inputCls}
          />
        </div>
        <div>
          <FieldLabel required>Email Address</FieldLabel>
          <input
            type="email"
            value={data.adminEmail}
            onChange={e => updateField('adminEmail', e.target.value)}
            placeholder={isOrg ? 'director@organization.com' : 'admin@school.com'}
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel required>Admin Role</FieldLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ROLE_OPTIONS
              .filter(opt => isOrg ? true : opt.value === 'school_admin')
              .map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField('adminRole', opt.value)}
                  className={`flex flex-col items-start gap-0.5 p-3 rounded-xl border text-left transition-all ${
                    data.adminRole === opt.value
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)]'
                  }`}
                >
                  <span className="text-xs font-bold text-[hsl(var(--text-primary))]">{opt.label}</span>
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{opt.desc}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Invite notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl border border-[hsl(var(--info)/0.2)] bg-[hsl(var(--info)/0.05)]">
        <Info className="w-4 h-4 text-[hsl(var(--info))] mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-[hsl(var(--info))] leading-relaxed">
          <strong>Invite-based access.</strong> A secure invitation link will be emailed to the address above. The admin clicks the link to set their password and activate their account. No credentials are shared manually.
        </p>
      </div>

      {/* Per-school admin assignment (multi-school mode only) */}
      {isOrg && data.schools.length > 0 && updateSchool && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
            <h3 className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
              Per-School Admin Assignments (Optional)
            </h3>
          </div>
          <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
            Optionally assign a dedicated school admin to each school. They will receive a separate invite email.
          </p>
          <div className="space-y-2">
            {data.schools.map(school => (
              <SchoolAdminCard key={school.id} school={school} updateSchool={updateSchool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
