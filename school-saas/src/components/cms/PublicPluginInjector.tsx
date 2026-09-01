'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X, MessageSquare, Shield, Sparkles, Send,
  ChevronRight, CheckCircle2, ArrowRight
} from 'lucide-react';
import type { CmsPluginRecord, CmsGlobalSettings } from '@/lib/types/landing-cms';

interface PublicPluginInjectorProps {
  plugins: CmsPluginRecord[];
  settings?: CmsGlobalSettings;
}

export function PublicPluginInjector({ plugins, settings }: PublicPluginInjectorProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [socialProofIndex, setSocialProofIndex] = useState(0);
  const [showSocialProof, setShowSocialProof] = useState(false);

  const topBannerPlugin = plugins.find(p => p.plugin_key === 'top_banner' && p.is_enabled);
  const whatsappPlugin = plugins.find(p => p.plugin_key === 'whatsapp_float' && p.is_enabled);
  const cookiePlugin = plugins.find(p => p.plugin_key === 'cookie_consent' && p.is_enabled);
  const socialProofPlugin = plugins.find(p => p.plugin_key === 'social_proof_ticker' && p.is_enabled);

  // Check localStorage for dismissed cookie consent
  useEffect(() => {
    try {
      if (localStorage.getItem('schoolsaas_cookie_consent') === 'true') {
        setCookieAccepted(true);
      }
      if (sessionStorage.getItem('schoolsaas_top_banner_dismissed') === 'true') {
        setBannerDismissed(true);
      }
    } catch {}
  }, []);

  // Social proof ticker rotation timer
  useEffect(() => {
    if (!socialProofPlugin) return;
    const notifs = socialProofPlugin.config?.notifications || [];
    if (notifs.length === 0) return;

    const interval = (socialProofPlugin.config?.intervalSeconds || 12) * 1000;
    const timer = setInterval(() => {
      setShowSocialProof(true);
      setTimeout(() => setShowSocialProof(false), 5000);
      setSocialProofIndex(prev => (prev + 1) % notifs.length);
    }, interval);

    // Initial show after 3 seconds
    const initialTimeout = setTimeout(() => {
      setShowSocialProof(true);
      setTimeout(() => setShowSocialProof(false), 5000);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimeout);
    };
  }, [socialProofPlugin]);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem('schoolsaas_top_banner_dismissed', 'true');
    } catch {}
  };

  const handleAcceptCookie = () => {
    setCookieAccepted(true);
    try {
      localStorage.setItem('schoolsaas_cookie_consent', 'true');
    } catch {}
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappPlugin) return;
    const phone = whatsappPlugin.config?.phoneNumber || '+23276000000';
    const text = encodeURIComponent(whatsappMsg || whatsappPlugin.config?.greetingMessage || 'Hello SchoolSaaS team');
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    setWhatsappOpen(false);
  };

  const currentNotif = socialProofPlugin?.config?.notifications?.[socialProofIndex];

  return (
    <>
      {/* ── 1. Top Announcement Bar Plugin ────────────────────────── */}
      {topBannerPlugin && !bannerDismissed && (
        <aside aria-label="Announcement banner" className="sticky top-0 z-[60] w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-md transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-3 overflow-hidden">
              {topBannerPlugin.config?.badgeText && (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider shrink-0 border border-white/25">
                  {topBannerPlugin.config.badgeText}
                </span>
              )}
              <p className="truncate text-white/95 text-xs">
                {topBannerPlugin.config?.message || 'New features available!'}
              </p>
              {topBannerPlugin.config?.linkUrl && (
                <Link
                  href={topBannerPlugin.config.linkUrl}
                  className="font-bold underline underline-offset-2 hover:text-white/80 shrink-0 hidden sm:inline-flex items-center gap-1"
                >
                  {topBannerPlugin.config?.linkText || 'Learn More'}
                </Link>
              )}
            </div>

            {topBannerPlugin.config?.isDismissible && (
              <button
                type="button"
                onClick={handleDismissBanner}
                aria-label="Dismiss announcement"
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </aside>
      )}

      {/* ── 2. WhatsApp & Live Help Floating Launcher Plugin ───────── */}
      {whatsappPlugin && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* Chat Popover Card */}
          {whatsappOpen && (
            <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">{whatsappPlugin.config?.popupTitle || 'Admissions Support Desk'}</h4>
                    <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                      {whatsappPlugin.config?.onlineStatus || 'Online &bull; Instant WhatsApp Direct'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 bg-[hsl(var(--bg-secondary))]">
                <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] leading-relaxed shadow-sm">
                  {whatsappPlugin.config?.greetingMessage || 'Hello! How can we assist your institution with school onboarding today?'}
                </div>

                <form onSubmit={handleSendWhatsApp} className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={whatsappMsg}
                    onChange={e => setWhatsappMsg(e.target.value)}
                    placeholder="Type your question or school name..."
                    className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" /> Start Direct WhatsApp Chat
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Floating Action Button */}
          <button
            type="button"
            onClick={() => setWhatsappOpen(!whatsappOpen)}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 hover:scale-105 transition-all"
            aria-label="Open support chat"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-600" />
            </div>
            <span className="text-xs font-black tracking-wide hidden sm:inline-block">
              {whatsappPlugin.config?.buttonLabel || 'Live Support'}
            </span>
          </button>
        </div>
      )}

      {/* ── 3. Social Proof Real-Time Activity Ticker Plugin ───────── */}
      {socialProofPlugin && currentNotif && showSocialProof && (
        <aside aria-label="Recent activity notifications" className="fixed bottom-6 left-6 z-40 max-w-sm rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] p-4 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[hsl(var(--text-primary))] leading-snug line-clamp-2">
              {currentNotif.text}
            </p>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {currentNotif.timeAgo || 'Just now'}
            </p>
          </div>
        </aside>
      )}

      {/* ── 4. Cookie & Data Sovereignty Privacy Consent Plugin ────── */}
      {cookiePlugin && !cookieAccepted && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-3xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-[hsl(var(--text-primary))]">
              {cookiePlugin.config?.title || 'Data Sovereignty & Privacy'}
            </h4>
          </div>
          <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
            {cookiePlugin.config?.message || 'We use essential cookies to maintain secure tenant isolation and authenticate authorized educators, students, and parents.'}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptCookie}
              className="flex-1 h-9 rounded-xl bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white font-black text-xs shadow-md transition-all flex items-center justify-center"
            >
              {cookiePlugin.config?.acceptButtonText || 'Acknowledge & Continue'}
            </button>
            <button
              type="button"
              onClick={handleAcceptCookie}
              className="px-3 h-9 rounded-xl border border-[hsl(var(--border))] text-[11px] font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-secondary))] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── 5. Custom Global Head/Body CSS & Script Injector ──────── */}
      {settings?.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />
      )}
    </>
  );
}
