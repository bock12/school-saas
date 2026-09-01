'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles, Shield, School, Users, CheckCircle2, ArrowRight, Star,
  Calendar, ChevronRight, Zap, Lock, Database, Award, BookOpen, Layers,
  Phone, Mail, MapPin, Check, Heart, Trophy, FileText, Smartphone
} from 'lucide-react';
import type { LandingPageSectionRecord, BlockStyleOptions } from '@/lib/types/landing-cms';

interface BlockRendererProps {
  section: LandingPageSectionRecord;
  memberTenants?: any[];
}

export function BlockRenderer({ section, memberTenants = [] }: BlockRendererProps) {
  const {
    block_type = 'hero',
    badge,
    title,
    subtitle,
    description,
    primary_cta_text,
    primary_cta_url,
    secondary_cta_text,
    secondary_cta_url,
    items = [],
    style_options = {},
  } = section;

  // Compute background class from style options
  const getBgClass = (bg?: BlockStyleOptions['backgroundTheme']) => {
    switch (bg) {
      case 'secondary':
        return 'bg-[hsl(var(--bg-secondary))] border-y border-[hsl(var(--border))]';
      case 'accent-subtle':
        return 'bg-indigo-900/10 border-y border-indigo-500/20';
      case 'dark':
        return 'bg-slate-950 text-white border-y border-slate-800';
      case 'glass':
        return 'backdrop-blur-xl bg-[hsl(var(--bg-primary)/0.75)] border-y border-[hsl(var(--border))]';
      case 'gradient':
        return 'bg-gradient-to-b from-[hsl(var(--bg-primary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-primary))]';
      default:
        return 'bg-[hsl(var(--bg-primary))]';
    }
  };

  const getPaddingClass = (pad?: BlockStyleOptions['paddingY']) => {
    switch (pad) {
      case 'compact':
        return 'py-10 sm:py-14';
      case 'spacious':
        return 'py-24 sm:py-36';
      default:
        return 'py-16 sm:py-24 lg:py-28';
    }
  };

  const sectionId = section.section_key;

  // ── 1. Bento Grid Block ───────────────────────────────────────
  if (block_type === 'bento_grid') {
    return (
      <section id={sectionId} className={`${getPaddingClass(style_options.paddingY)} ${getBgClass(style_options.backgroundTheme)}`}>
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            {badge && (
              <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest">{badge}</p>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{subtitle}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`glass-card p-8 rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all ${
                  idx === 0 ? 'md:col-span-2 bg-gradient-to-br from-indigo-500/10 via-[hsl(var(--bg-secondary))] to-transparent' : ''
                }`}
              >
                {item.tag && (
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] font-black text-[10px] uppercase tracking-wider">
                    {item.tag}
                  </span>
                )}
                {item.statValue && (
                  <p className="text-4xl font-black text-[hsl(var(--accent))]">{item.statValue}</p>
                )}
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">{item.title}</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{item.description}</p>
                {item.href && (
                  <Link href={item.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--accent))] hover:underline pt-2">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── 2. Call-to-Action Banner Block ────────────────────────────
  if (block_type === 'cta_banner') {
    return (
      <section id={sectionId} className={`${getPaddingClass(style_options.paddingY)} bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden`}>
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10 text-center max-w-4xl mx-auto space-y-6">
          {badge && (
            <span className="px-3 py-1 rounded-full bg-white/20 text-white font-black text-[11px] uppercase tracking-wider border border-white/25">
              {badge}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl mx-auto font-medium">
              {subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {primary_cta_text && (
              <Link
                href={primary_cta_url || '/register'}
                className="px-8 py-3.5 rounded-2xl bg-white text-indigo-700 hover:bg-white/90 font-black text-sm shadow-xl transition-all hover:scale-105"
              >
                {primary_cta_text}
              </Link>
            )}
            {secondary_cta_text && (
              <Link
                href={secondary_cta_url || '#contact'}
                className="px-8 py-3.5 rounded-2xl border border-white/40 text-white hover:bg-white/10 font-bold text-sm transition-all"
              >
                {secondary_cta_text}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── 3. Rich Text / Article Block ──────────────────────────────
  if (block_type === 'rich_text') {
    return (
      <section id={sectionId} className={`${getPaddingClass(style_options.paddingY)} ${getBgClass(style_options.backgroundTheme)}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-6">
          {badge && (
            <p className="text-xs font-black text-[hsl(var(--accent))] uppercase tracking-widest text-center">{badge}</p>
          )}
          <h2 className="text-3xl sm:text-4xl font-black text-[hsl(var(--text-primary))] text-center tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base text-[hsl(var(--text-secondary))] text-center leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
          {description && (
            <div className="prose dark:prose-invert max-w-none text-sm text-[hsl(var(--text-secondary))] leading-relaxed space-y-4 pt-4 border-t border-[hsl(var(--border))]">
              {description.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── 4. Custom HTML / Widget Embed Block ───────────────────────
  if (block_type === 'custom_html' && description) {
    return (
      <section id={sectionId} className={`${getPaddingClass(style_options.paddingY)} ${getBgClass(style_options.backgroundTheme)}`}>
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </section>
    );
  }

  // ── Default Core Block Fallback (Hero, Stats, Institutions, etc.) ──
  return null;
}
