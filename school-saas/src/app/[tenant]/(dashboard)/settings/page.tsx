'use client';

import { useState, useTransition } from 'react';
import {
  Settings, Shield, Bell, Users, History, Plug, AlertTriangle,
  Save, Check, Loader2, Lock, Mail, Phone, MapPin, Clock,
  Globe, ToggleLeft, ToggleRight, Search, Filter, Trash2, Power, UserCog
} from 'lucide-react';
import { saveOrgSettings } from '@/app/actions/tenant';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Tab = 'general' | 'security' | 'notifications' | 'permissions' | 'audit' | 'integrations' | 'danger';

const AUDIT_LOGS = [
  { id: 1, actor: 'Admin User', action: 'Added school "Greenwood High"',     ts: '2026-07-17T20:15:00Z', type: 'create' },
  { id: 2, actor: 'Admin User', action: 'Invited staff jane@school.edu',      ts: '2026-07-17T18:42:00Z', type: 'invite' },
  { id: 3, actor: 'Super Admin', action: 'Changed plan to Professional',     ts: '2026-07-16T10:00:00Z', type: 'billing' },
  { id: 4, actor: 'Admin User', action: 'Updated branding settings',          ts: '2026-07-15T14:30:00Z', type: 'update' },
  { id: 5, actor: 'Admin User', action: 'Assigned admin to Albert Academy',   ts: '2026-07-14T11:00:00Z', type: 'create' },
];

const INTEGRATIONS = [
  { name: 'Google Workspace', desc: 'Single Sign-On via Google accounts', status: 'available', icon: '🔵' },
  { name: 'Microsoft Azure AD', desc: 'SSO via Microsoft / Office 365',   status: 'available', icon: '🟦' },
  { name: 'Stripe',            desc: 'Payment processing for school fees', status: 'connected', icon: '💳' },
  { name: 'Zoom',              desc: 'Virtual classroom integration',       status: 'available', icon: '🟣' },
  { name: 'Canvas LMS',        desc: 'Learning management system sync',    status: 'available', icon: '🟠' },
  { name: 'SMS Gateway',       desc: "Bulk SMS via Twilio or Africa's Talking", status: 'available', icon: '📱' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="relative flex-shrink-0">
      <div className={cn('w-9 h-5 rounded-full transition-colors', checked ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--bg-tertiary))]')} />
      <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm', checked ? 'left-5' : 'left-0.5')} />
    </button>
  );
}

export default function OrgSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const [tab, setTab] = useState<Tab>('general');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General settings
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [language, setLanguage] = useState('en');

  // Security settings
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
  const [lockoutAttempts, setLockoutAttempts] = useState(5);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(30);
  const [requireMfa, setRequireMfa] = useState(false);
  const [staffApprovalRequired, setStaffApprovalRequired] = useState(false);

  // Notification toggles
  const [notifNewSchool, setNotifNewSchool] = useState(true);
  const [notifNewStaff, setNotifNewStaff] = useState(true);
  const [notifPlanChange, setNotifPlanChange] = useState(true);
  const [notifLoginAlert, setNotifLoginAlert] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  // Audit search
  const [auditSearch, setAuditSearch] = useState('');

  // Danger zone
  const [dangerConfirm, setDangerConfirm] = useState('');

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
  const labelCls = 'block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5';

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveOrgSettings(tenant, {
        contact_email: contactEmail || undefined,
        contact_phone: contactPhone || undefined,
        address: address || undefined,
        timezone,
        language,
        min_password_length: minPasswordLength,
        password_expiry_days: passwordExpiryDays,
        lockout_attempts: lockoutAttempts,
        session_timeout_mins: sessionTimeoutMins,
        require_mfa: requireMfa,
        staff_approval_required: staffApprovalRequired,
      });
      if (!res.success) {
        setError(res.error ?? 'Failed to save settings.');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  const tabs: { id: Tab; icon: React.ComponentType<{className?:string}>; label: string }[] = [
    { id: 'general',      icon: Settings,      label: 'General' },
    { id: 'security',     icon: Shield,        label: 'Security' },
    { id: 'notifications',icon: Bell,          label: 'Notifications' },
    { id: 'permissions',  icon: UserCog,       label: 'Permissions' },
    { id: 'audit',        icon: History,       label: 'Audit Logs' },
    { id: 'integrations', icon: Plug,          label: 'Integrations' },
    { id: 'danger',       icon: AlertTriangle, label: 'Danger Zone' },
  ];

  const filteredLogs = AUDIT_LOGS.filter(log =>
    log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.action.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-[hsl(var(--accent))]" />
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Organization Settings</h1>
        </div>
        <p className="text-sm text-[hsl(var(--text-secondary))]">Configure your organization-wide settings, policies, and integrations.</p>
      </div>

      {/* Horizontal Tab Bar */}
      <div className="border-b border-[hsl(var(--border))] overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px',
                tab === id
                  ? id === 'danger'
                    ? 'border-red-400 text-red-400'
                    : 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                  : 'border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border))]')}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* General */}
        {tab === 'general' && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">General Settings</h2>
            <div>
              <label className={labelCls}><Globe className="w-3 h-3 inline mr-1" />Organization Name</label>
              <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Greenwood Education Group" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}><Mail className="w-3 h-3 inline mr-1" />Contact Email</label>
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="admin@yourorg.edu" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}><Phone className="w-3 h-3 inline mr-1" />Contact Phone</label>
                  <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+234 80 0000 0000" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}><MapPin className="w-3 h-3 inline mr-1" />Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Education Blvd, City, Country" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}><Clock className="w-3 h-3 inline mr-1" />Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} className={inputCls}>
                    {['Africa/Lagos', 'Africa/Accra', 'Africa/Nairobi', 'Africa/Cairo', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Dubai'].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className={inputCls}>
                    {[['en', 'English'], ['fr', 'French'], ['ar', 'Arabic'], ['yo', 'Yoruba'], ['ha', 'Hausa']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {tab === 'security' && (
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Security Policy</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Minimum Password Length</label>
                  <input type="number" min={6} max={32} value={minPasswordLength} onChange={e => setMinPasswordLength(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password Expiry (days)</label>
                  <input type="number" min={0} max={365} value={passwordExpiryDays} onChange={e => setPasswordExpiryDays(+e.target.value)} className={inputCls} />
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Set 0 to never expire.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Account Lockout (failed attempts)</label>
                  <input type="number" min={3} max={10} value={lockoutAttempts} onChange={e => setLockoutAttempts(+e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Session Timeout (minutes)</label>
                  <input type="number" min={5} max={480} value={sessionTimeoutMins} onChange={e => setSessionTimeoutMins(+e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-[hsl(var(--border))]">
                {[
                  { label: 'Require MFA for all admins', sub: 'Enforce two-factor authentication for org and school admins.', value: requireMfa, setter: setRequireMfa },
                  { label: 'Staff addition approval required', sub: 'New staff accounts must be approved before activation.', value: staffApprovalRequired, setter: setStaffApprovalRequired },
                ].map(({ label, sub, value, setter }) => (
                  <label key={label} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[hsl(var(--border))] cursor-pointer hover:border-[hsl(var(--accent)/0.2)] transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{label}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{sub}</p>
                    </div>
                    <Toggle checked={value} onChange={setter} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Notification Settings</h2>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
                <div className="flex-1">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Email Notifications</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Receive notifications via email</p>
                    </div>
                    <Toggle checked={emailEnabled} onChange={setEmailEnabled} />
                  </label>
                </div>
                <div className="w-px h-8 bg-[hsl(var(--border))]" />
                <div className="flex-1">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">In-App Notifications</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">Dashboard bell icon alerts</p>
                    </div>
                    <Toggle checked={inAppEnabled} onChange={setInAppEnabled} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className={labelCls}>Event Triggers</p>
                {[
                  { label: 'New school added',         value: notifNewSchool,   setter: setNotifNewSchool },
                  { label: 'New staff member invited', value: notifNewStaff,    setter: setNotifNewStaff },
                  { label: 'Subscription plan changed',value: notifPlanChange,  setter: setNotifPlanChange },
                  { label: 'Suspicious login detected',value: notifLoginAlert,  setter: setNotifLoginAlert },
                ].map(({ label, value, setter }) => (
                  <label key={label} className="flex items-center justify-between p-3.5 rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--bg-tertiary)/0.5)] transition-colors">
                    <span className="text-sm text-[hsl(var(--text-primary))]">{label}</span>
                    <Toggle checked={value} onChange={setter} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Permissions */}
          {tab === 'permissions' && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Permissions & Access Control</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Define what org-level admins vs. school-level admins can access and modify.</p>
              
              <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
                <table className="w-full text-xs">
                  <thead className="bg-[hsl(var(--bg-tertiary))]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[hsl(var(--text-secondary))]">Permission</th>
                      <th className="px-4 py-3 text-center font-semibold text-[hsl(var(--text-secondary))]">Super Admin</th>
                      <th className="px-4 py-3 text-center font-semibold text-[hsl(var(--text-secondary))]">Org Admin</th>
                      <th className="px-4 py-3 text-center font-semibold text-[hsl(var(--text-secondary))]">School Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
                    {[
                      ['View all organizations', true, true, false],
                      ['Create/delete schools', true, true, false],
                      ['Manage org billing', true, true, false],
                      ['Invite org-level admins', true, true, false],
                      ['Invite school admins', true, true, true],
                      ['View school data', true, true, true],
                      ['Manage own school settings', true, true, true],
                      ['Export reports', true, true, true],
                      ['Delete school data', true, false, false],
                    ].map(([label, ...vals]) => (
                      <tr key={label as string} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)]">
                        <td className="px-4 py-3 text-[hsl(var(--text-primary))]">{label as string}</td>
                        {(vals as boolean[]).map((v, i) => (
                          <td key={i} className="px-4 py-3 text-center">
                            {v ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-[hsl(var(--text-tertiary))]">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Logs */}
          {tab === 'audit' && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                  <input type="text" value={auditSearch} onChange={e => setAuditSearch(e.target.value)}
                    placeholder="Search audit logs…"
                    className="w-full h-8 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors" />
                </div>
              </div>
              <div className="divide-y divide-[hsl(var(--border)/0.5)]">
                {filteredLogs.length === 0 ? (
                  <div className="py-12 text-center text-sm text-[hsl(var(--text-tertiary))]">No logs matching your search.</div>
                ) : filteredLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                      log.type === 'create' ? 'bg-emerald-400' :
                      log.type === 'billing' ? 'bg-purple-400' :
                      log.type === 'invite' ? 'bg-blue-400' : 'bg-amber-400')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[hsl(var(--text-primary))]">{log.action}</p>
                      <p className="text-[11px] text-[hsl(var(--text-tertiary))]">by {log.actor}</p>
                    </div>
                    <span className="text-[11px] text-[hsl(var(--text-tertiary))] flex-shrink-0">
                      {new Date(log.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          {tab === 'integrations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INTEGRATIONS.map(int => (
                <div key={int.name} className="glass-card p-5 flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{int.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{int.name}</p>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{int.desc}</p>
                  </div>
                  <button className={cn('flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    int.status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.3)] hover:text-[hsl(var(--accent))]')}>
                    {int.status === 'connected' ? '✓ Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Danger Zone */}
          {tab === 'danger' && (
            <div className="space-y-4">
              <div className="glass-card p-6 border border-red-500/20 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h2 className="text-sm font-bold text-red-400">Danger Zone</h2>
                </div>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Actions in this section are irreversible. Proceed with extreme caution.</p>

                {[
                  {
                    title: 'Deactivate All Schools',
                    desc: 'Temporarily suspend all schools under this organization. Staff and students will lose access.',
                    action: 'Deactivate Schools',
                    cls: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10',
                  },
                  {
                    title: 'Transfer Organization Ownership',
                    desc: 'Transfer this organization to a different admin. You will lose all admin privileges.',
                    action: 'Transfer Ownership',
                    cls: 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10',
                  },
                  {
                    title: 'Delete Organization',
                    desc: 'Permanently delete this organization and ALL its schools, staff, and student data. This cannot be undone.',
                    action: 'Delete Organization',
                    cls: 'border-red-500/30 text-red-400 hover:bg-red-500/10',
                  },
                ].map(({ title, desc, action, cls }) => (
                  <div key={title} className="p-4 rounded-xl border border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{title}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 max-w-sm">{desc}</p>
                    </div>
                    <button onClick={() => alert('This action requires contacting support in production.')}
                      className={cn('flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold border transition-all', cls)}>
                      {action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button (show for saveable tabs) */}
          {['general', 'security', 'notifications'].includes(tab) && (
            <div className="flex items-center justify-between">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Check className="w-4 h-4" /> Settings saved!
                </span>
              )}
              {error && (
                <span className="text-xs text-red-400">{error}</span>
              )}
              <button onClick={handleSave} disabled={isPending}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
                {isPending ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span> : <span className="flex items-center gap-2"><Save className="w-4 h-4" />Save Settings</span>}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
