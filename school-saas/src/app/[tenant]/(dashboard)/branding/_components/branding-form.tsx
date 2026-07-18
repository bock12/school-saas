'use client';

import { useState, useTransition, useRef } from 'react';
import {
  Globe, Palette, Mail, Shield, CheckCircle2, AlertCircle,
  Loader2, Save, Upload, Eye, EyeOff, Link2, RefreshCw
} from 'lucide-react';
import { saveBrandingSettings } from '@/app/actions/tenant';
import { cn } from '@/lib/utils';

interface BrandingData {
  id?: string;
  name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  favicon_url?: string;
  custom_font?: string;
  custom_domain?: string;
  domain_verified?: boolean;
  email_sender_name?: string;
  email_reply_to?: string;
  hide_platform_branding?: boolean;
  login_bg_url?: string;
}

interface BrandingFormProps {
  tenantId: string;
  initialData: BrandingData;
}

const FONTS = ['Inter', 'Roboto', 'Poppins', 'Outfit', 'DM Sans', 'Nunito', 'Lato', 'Montserrat'];

type Section = 'domain' | 'branding' | 'email' | 'whitelabel';

export function BrandingForm({ tenantId, initialData }: BrandingFormProps) {
  const [activeSection, setActiveSection] = useState<Section>('branding');
  const [name, setName] = useState(initialData.name ?? '');
  const [primaryColor, setPrimaryColor] = useState(initialData.primary_color ?? '#6366f1');
  const [secondaryColor, setSecondaryColor] = useState(initialData.secondary_color ?? '#3b82f6');
  const [logoUrl, setLogoUrl] = useState(initialData.logo_url ?? '');
  const [faviconUrl, setFaviconUrl] = useState(initialData.favicon_url ?? '');
  const [customFont, setCustomFont] = useState(initialData.custom_font ?? 'Inter');
  const [customDomain, setCustomDomain] = useState(initialData.custom_domain ?? '');
  const [emailSenderName, setEmailSenderName] = useState(initialData.email_sender_name ?? '');
  const [emailReplyTo, setEmailReplyTo] = useState(initialData.email_reply_to ?? '');
  const [hidePlatformBranding, setHidePlatformBranding] = useState(initialData.hide_platform_branding ?? false);
  const [loginBgUrl, setLoginBgUrl] = useState(initialData.login_bg_url ?? '');
  const [domainVerified, setDomainVerified] = useState(initialData.domain_verified ?? false);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [verifying, setVerifying] = useState(false);

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
  const labelCls = 'block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5';
  const sectionCls = (s: Section) => cn(
    'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer',
    activeSection === s
      ? 'border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))]'
      : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.2)] hover:bg-[hsl(var(--bg-tertiary))]'
  );

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveBrandingSettings(tenantId, {
        name: name || undefined,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl || undefined,
        favicon_url: faviconUrl || undefined,
        custom_font: customFont,
        custom_domain: customDomain || undefined,
        email_sender_name: emailSenderName || undefined,
        email_reply_to: emailReplyTo || undefined,
        hide_platform_branding: hidePlatformBranding,
        login_bg_url: loginBgUrl || undefined,
      });
      if (!res.success) {
        setError(res.error ?? 'Failed to save.');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  const simulateVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setDomainVerified(!!customDomain);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      {/* Section nav */}
      <div className="space-y-2">
        {([
          { id: 'branding' as Section, icon: Palette, label: 'Brand Identity' },
          { id: 'domain'   as Section, icon: Globe,   label: 'Custom Domain' },
          { id: 'email'    as Section, icon: Mail,    label: 'Email Branding' },
          { id: 'whitelabel' as Section, icon: Shield, label: 'White-label' },
        ]).map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveSection(id)} className={sectionCls(id)}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}

        {/* Live preview */}
        <div className="mt-4 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] space-y-3">
          <p className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Live Preview</p>
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-8 h-8 rounded-lg object-contain bg-white/5" onError={() => setLogoUrl('')} />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primaryColor }}>
                {name.slice(0, 2).toUpperCase() || 'ED'}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-[hsl(var(--text-primary))]" style={{ fontFamily: customFont }}>{name || 'Your Organization'}</p>
              <p className="text-[10px]" style={{ color: primaryColor }}>Portal</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: primaryColor }} title="Primary" />
            <div className="w-5 h-5 rounded" style={{ backgroundColor: secondaryColor }} title="Secondary" />
          </div>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Font: {customFont}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Branding */}
        {activeSection === 'branding' && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Brand Identity</h2>

            <div>
              <label className={labelCls}>Organization Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Greenwood Academy Group" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-[hsl(var(--border))] cursor-pointer p-0.5 bg-[hsl(var(--bg-tertiary))]" />
                  <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className={cn(inputCls, 'font-mono text-xs flex-1')} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Secondary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-[hsl(var(--border))] cursor-pointer p-0.5 bg-[hsl(var(--bg-tertiary))]" />
                  <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className={cn(inputCls, 'font-mono text-xs flex-1')} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Font Family</label>
              <div className="grid grid-cols-4 gap-2">
                {FONTS.map(f => (
                  <button key={f} onClick={() => setCustomFont(f)}
                    className={cn('py-1.5 rounded-lg text-xs font-medium border transition-all', customFont === f
                      ? 'border-[hsl(var(--accent)/0.5)] bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))]'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.3)]')}
                    style={{ fontFamily: f }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Logo URL</label>
                <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://cdn.example.com/logo.png" className={inputCls} />
                {logoUrl && <img src={logoUrl} alt="preview" className="mt-2 h-12 rounded-lg object-contain border border-[hsl(var(--border))] bg-white/5 px-2" onError={() => setLogoUrl('')} />}
              </div>
              <div>
                <label className={labelCls}>Favicon URL</label>
                <input type="url" value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)} placeholder="https://cdn.example.com/favicon.ico" className={inputCls} />
                {faviconUrl && <img src={faviconUrl} alt="favicon preview" className="mt-2 w-10 h-10 rounded object-contain border border-[hsl(var(--border))]" onError={() => setFaviconUrl('')} />}
              </div>
            </div>
          </div>
        )}

        {/* Domain */}
        {activeSection === 'domain' && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Custom Domain</h2>

            <div>
              <label className={labelCls}>Custom Domain</label>
              <div className="flex gap-2">
                <input type="text" value={customDomain} onChange={e => { setCustomDomain(e.target.value); setDomainVerified(false); }}
                  placeholder="portal.yourschool.edu" className={cn(inputCls, 'flex-1')} />
                <button onClick={simulateVerify} disabled={!customDomain || verifying}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] disabled:opacity-50 transition-all">
                  {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Verify
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {domainVerified
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Domain verified</span></>
                  : <><AlertCircle className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">{customDomain ? 'Not yet verified' : 'No domain set'}</span></>}
              </div>
            </div>

            {customDomain && (
              <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] space-y-3">
                <p className="text-xs font-semibold text-[hsl(var(--text-primary))]">DNS Configuration Required</p>
                <p className="text-[11px] text-[hsl(var(--text-secondary))]">Add these DNS records to your domain provider:</p>
                <div className="space-y-2">
                  {[
                    { type: 'CNAME', name: 'portal', value: 'proxy.educate.io' },
                    { type: 'TXT',   name: '_verify.portal', value: `educate-verify=${tenantId.slice(0, 8)}` },
                  ].map(r => (
                    <div key={r.type} className="grid grid-cols-3 gap-2 text-[11px] p-2 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))]">
                      <span className="font-bold text-[hsl(var(--accent))]">{r.type}</span>
                      <span className="font-mono text-[hsl(var(--text-secondary))]">{r.name}</span>
                      <span className="font-mono text-[hsl(var(--text-primary))] truncate">{r.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))]">DNS changes can take up to 48 hours to propagate.</p>
              </div>
            )}
          </div>
        )}

        {/* Email */}
        {activeSection === 'email' && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Email Branding</h2>
            <div>
              <label className={labelCls}>Sender Display Name</label>
              <input type="text" value={emailSenderName} onChange={e => setEmailSenderName(e.target.value)} placeholder="e.g. Greenwood Notifications" className={inputCls} />
              <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-1">This appears as the "From" name in all system emails.</p>
            </div>
            <div>
              <label className={labelCls}>Reply-To Email</label>
              <input type="email" value={emailReplyTo} onChange={e => setEmailReplyTo(e.target.value)} placeholder="noreply@yourschool.edu" className={inputCls} />
            </div>
            <div className="p-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]">
              <p className="text-xs font-semibold text-[hsl(var(--text-primary))] mb-2">Email Preview</p>
              <div className="p-3 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] text-[11px]">
                <p className="text-[hsl(var(--text-tertiary))]">From: <span className="text-[hsl(var(--text-primary))]">{emailSenderName || 'Educate Notifications'} &lt;no-reply@educate.io&gt;</span></p>
                <p className="text-[hsl(var(--text-tertiary))]">Reply-To: <span className="text-[hsl(var(--text-primary))]">{emailReplyTo || 'Not set'}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* White-label */}
        {activeSection === 'whitelabel' && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">White-label Options</h2>
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)] transition-all">
              <div className="relative mt-0.5">
                <input type="checkbox" checked={hidePlatformBranding} onChange={e => setHidePlatformBranding(e.target.checked)} className="sr-only peer" />
                <div className={cn('w-9 h-5 rounded-full transition-colors', hidePlatformBranding ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--bg-tertiary))]')} />
                <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm', hidePlatformBranding ? 'left-5' : 'left-0.5')} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Hide Platform Branding</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Remove "Powered by Educate" from all school-facing pages.</p>
              </div>
            </label>

            <div>
              <label className={labelCls}>Custom Login Background URL</label>
              <input type="url" value={loginBgUrl} onChange={e => setLoginBgUrl(e.target.value)}
                placeholder="https://cdn.example.com/login-bg.jpg" className={inputCls} />
              {loginBgUrl && (
                <div className="mt-2 relative w-full h-28 rounded-lg overflow-hidden border border-[hsl(var(--border))]">
                  <img src={loginBgUrl} alt="bg preview" className="w-full h-full object-cover" onError={() => setLoginBgUrl('')} />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Login Background Preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center justify-between">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
