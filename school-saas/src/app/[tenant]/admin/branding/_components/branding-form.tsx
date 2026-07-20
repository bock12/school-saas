'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import {
  Globe, Palette, Mail, Shield, CheckCircle2, AlertCircle,
  Loader2, Save, Upload, RefreshCw, ImageIcon, Wand2
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

const SECTIONS: { id: Section; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'branding',    icon: Palette, label: 'Brand Identity' },
  { id: 'domain',     icon: Globe,   label: 'Custom Domain' },
  { id: 'email',      icon: Mail,    label: 'Email Branding' },
  { id: 'whitelabel', icon: Shield,  label: 'White-label' },
];

/** Extract dominant colors from an image element using the Canvas API */
function extractColorsFromImage(img: HTMLImageElement): string[] {
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  const colorMap: Record<string, number> = {};
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const a = data[i + 3]!;
    if (a < 128) continue; // skip transparent
    // Quantize to 32-step buckets to group similar colors
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  return Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => {
      const [r, g, b] = k.split(',').map(Number);
      return `#${r!.toString(16).padStart(2, '0')}${g!.toString(16).padStart(2, '0')}${b!.toString(16).padStart(2, '0')}`;
    });
}

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
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors';
  const labelCls = 'block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5';

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

  /** Upload logo file to Supabase Storage via fetch (client-side) */
  const handleLogoFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    setUploadingLogo(true);
    setError(null);

    // Preview locally immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setLogoUrl(url);
      // Extract colors from the preview image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const colors = extractColorsFromImage(img);
        setSuggestedColors(colors);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    setUploadingLogo(false);
  }, []);

  /** Extract colors from the current logo URL */
  const handleExtractFromUrl = useCallback(() => {
    if (!logoUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const colors = extractColorsFromImage(img);
      setSuggestedColors(colors);
    };
    img.onerror = () => setError('Could not load image for color extraction. Try uploading the file directly.');
    img.src = logoUrl;
  }, [logoUrl]);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Horizontal Tab Bar */}
      <div className="border-b border-[hsl(var(--border))] overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px',
                activeSection === id
                  ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                  : 'border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border))]'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Live Preview Strip */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
        <div className="flex items-center gap-3 flex-1">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="w-10 h-10 rounded-lg object-contain bg-white/5 border border-[hsl(var(--border))]" onError={() => setLogoUrl('')} />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: primaryColor }}>
              {name.slice(0, 2).toUpperCase() || 'ED'}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-[hsl(var(--text-primary))]" style={{ fontFamily: customFont }}>{name || 'Your Organization'}</p>
            <p className="text-xs" style={{ color: primaryColor }}>Portal Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: primaryColor }} title={`Primary: ${primaryColor}`} />
          <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: secondaryColor }} title={`Secondary: ${secondaryColor}`} />
          <span className="text-xs text-[hsl(var(--text-tertiary))]" style={{ fontFamily: customFont }}>{customFont}</span>
        </div>
      </div>

      {/* Section Content */}
      <div className="space-y-6">
        {/* BRAND IDENTITY */}
        {activeSection === 'branding' && (
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Brand Identity</h2>

              <div>
                <label className={labelCls}>Organization Display Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Greenwood Academy Group" className={inputCls} />
              </div>

              {/* Logo Section */}
              <div>
                <label className={labelCls}>Organization Logo</label>
                <div className="space-y-3">
                  {/* URL Input */}
                  <div className="flex gap-2">
                    <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                      placeholder="https://cdn.example.com/logo.png"
                      className={cn(inputCls, 'flex-1')} />
                    <button
                      onClick={handleExtractFromUrl}
                      disabled={!logoUrl}
                      title="Extract colors from logo"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] disabled:opacity-40 transition-all"
                    >
                      <Wand2 className="w-3.5 h-3.5" /> Extract Colors
                    </button>
                  </div>

                  {/* Upload Button */}
                  <div className="flex items-center gap-3">
                    <input ref={logoFileRef} type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                    <button
                      onClick={() => logoFileRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent)/0.4)] hover:bg-[hsl(var(--bg-tertiary))] transition-all"
                    >
                      {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload Logo File
                    </button>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">PNG, SVG, JPG, WebP — max 2MB</span>
                  </div>

                  {/* Logo Preview */}
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo Preview" onError={() => setLogoUrl('')}
                      className="h-14 w-auto rounded-lg object-contain border border-[hsl(var(--border))] bg-white/5 px-3" />
                  )}
                </div>
              </div>

              {/* Suggested Colors from Logo */}
              {suggestedColors.length > 0 && (
                <div>
                  <label className={labelCls}><Wand2 className="w-3 h-3 inline mr-1" />Extracted Colors — Click to Apply</label>
                  <div className="flex gap-2 flex-wrap">
                    {suggestedColors.map((color, i) => (
                      <div key={color} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => i === 0 ? setPrimaryColor(color) : setSecondaryColor(color)}
                          className="w-10 h-10 rounded-lg border-2 border-white/20 hover:scale-110 transition-transform hover:border-white/50 shadow-lg"
                          style={{ backgroundColor: color }}
                          title={`${color} — click to set as ${i === 0 ? 'primary' : 'secondary'} color`}
                        />
                        <span className="text-[9px] font-mono text-[hsl(var(--text-tertiary))]">{color}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-2">First color → Primary | Others → Secondary color</p>
                </div>
              )}

              {/* Color Pickers */}
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

              {/* Font */}
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

              {/* Favicon */}
              <div>
                <label className={labelCls}>Favicon URL</label>
                <input type="url" value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)} placeholder="https://cdn.example.com/favicon.ico" className={inputCls} />
                {faviconUrl && <img src={faviconUrl} alt="favicon preview" className="mt-2 w-10 h-10 rounded object-contain border border-[hsl(var(--border))]" onError={() => setFaviconUrl('')} />}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM DOMAIN */}
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
                <p className="text-[11px] text-[hsl(var(--text-secondary))]">Add these records to your domain provider:</p>
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

        {/* EMAIL BRANDING */}
        {activeSection === 'email' && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">Email Branding</h2>
            <div>
              <label className={labelCls}>Sender Display Name</label>
              <input type="text" value={emailSenderName} onChange={e => setEmailSenderName(e.target.value)} placeholder="e.g. Greenwood Notifications" className={inputCls} />
              <p className="text-[11px] text-[hsl(var(--text-tertiary))] mt-1">This appears as the &quot;From&quot; name in all system emails.</p>
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

        {/* WHITE-LABEL */}
        {activeSection === 'whitelabel' && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">White-label Options</h2>
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.3)] transition-all">
              <div className="relative mt-0.5">
                <input type="checkbox" checked={hidePlatformBranding} onChange={e => setHidePlatformBranding(e.target.checked)} className="sr-only" />
                <div className={cn('w-9 h-5 rounded-full transition-colors', hidePlatformBranding ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--bg-tertiary))]')} />
                <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm', hidePlatformBranding ? 'left-5' : 'left-0.5')} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Hide Platform Branding</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">Remove &quot;Powered by Educate&quot; from all school-facing pages.</p>
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
          <button onClick={handleSave} disabled={isPending}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
