'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutTemplate, Sparkles, Plus, Edit3, Eye, Trash2, RotateCcw,
  CheckCircle2, ArrowUpDown, ChevronUp, ChevronDown, Layers, Settings,
  Globe, Shield, Smartphone, Monitor, Tablet, Code, Palette, Search,
  Sliders, MessageSquare, Megaphone, Activity, HelpCircle, Copy,
  Check, ArrowRight, Upload, Image as ImageIcon, ExternalLink, RefreshCw,
  FolderPlus, Grid, AlignLeft, Send, BarChart3, School, Users, Zap,
  CreditCard, X, AlertTriangle, FileText, CheckSquare, Lock, Bookmark
} from 'lucide-react';
import {
  getLandingPageSections,
  updateLandingPageSection,
  toggleLandingPageSectionVisibility,
  createLandingPageSection,
  duplicateLandingPageSection,
  reorderLandingPageSections,
  deleteLandingPageSection,
  resetLandingPageSection,
  getCmsPages,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
  getCmsPlugins,
  updateCmsPlugin,
  getCmsMedia,
  addCmsMedia,
  deleteCmsMedia,
  getCmsSettings,
  updateCmsSettings,
  applyCmsTemplatePreset,
} from '@/app/actions/landing-cms';
import type {
  LandingPageSectionRecord,
  LandingPageItem,
  LandingPageSectionPayload,
  CmsPageRecord,
  CmsPagePayload,
  CmsPluginRecord,
  CmsMediaItem,
  CmsGlobalSettings,
  BlockType,
  BlockStyleOptions,
  PluginKey,
} from '@/lib/types/landing-cms';
import {
  DEFAULT_LANDING_SECTIONS,
  DEFAULT_CMS_PAGES,
  DEFAULT_CMS_PLUGINS,
  DEFAULT_CMS_MEDIA,
  DEFAULT_CMS_SETTINGS,
  CMS_THEME_PRESETS,
} from '@/lib/types/landing-cms';

const BLOCK_TYPE_META: Record<BlockType, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  hero: { label: 'Hero Banner', icon: Sparkles, description: 'High-impact value proposition, dynamic mosaic, and primary CTA buttons' },
  stats: { label: 'Metric Stats', icon: BarChart3, description: 'Quantified KPI counters with glowing glassmorphism cards' },
  institutions: { label: 'School Network Showcase', icon: School, description: 'Directory cards and campus gallery slider for registered institutions' },
  stakeholders: { label: 'Persona Workflows', icon: Users, description: 'Role-specific tabs (Teachers, Students, Parents, Admins, Boards)' },
  curriculum: { label: 'Curriculum & AI Engine', icon: Zap, description: '6-3-3-4 national syllabus tree and Gemini lesson planning engine' },
  security: { label: 'Data Sovereignty & Security', icon: Shield, description: 'PostgreSQL RLS tenant isolation and compliance guarantees' },
  pricing: { label: 'Pricing Tiers', icon: CreditCard, description: 'Per-term and annual subscription tiers with interactive switches' },
  impact: { label: 'Testimonials & Impact', icon: MessageSquare, description: 'Verified school testimonials, quotes, and 5-star ratings' },
  faq: { label: 'FAQ & Onboarding', icon: HelpCircle, description: '4-step implementation pathway and expandable FAQ accordion' },
  contact: { label: 'Lead & Demo Request Form', icon: Send, description: 'Interactive demo form, onboarding inputs, and contact channels' },
  bento_grid: { label: 'Bento Grid', icon: Grid, description: 'Modern multi-card bento grid with custom badges, stats, and links' },
  features_split: { label: 'Split Feature Showcase', icon: AlignLeft, description: 'Side-by-side feature text with accompanying photographic card' },
  cta_banner: { label: 'Call-to-Action Banner', icon: Megaphone, description: 'Full-width vibrant banner designed to maximize conversion' },
  rich_text: { label: 'Rich Text / Article', icon: FileText, description: 'Prose article section for institutional announcements or policies' },
  gallery: { label: 'Photo Gallery', icon: ImageIcon, description: 'Grid of campus photos, facilities, and academic activities' },
  custom_html: { label: 'Custom HTML / Widget Embed', icon: Code, description: 'Raw embedded HTML, iframes, or custom third-party widgets' },
};

export default function SuperAdminCmsDashboardPage() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'builder' | 'pages' | 'templates' | 'plugins' | 'media' | 'styler'>('builder');

  // Page selection for visual builder
  const [selectedPageSlug, setSelectedPageSlug] = useState('home');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Data states
  const [sections, setSections] = useState<LandingPageSectionRecord[]>([]);
  const [pages, setPages] = useState<CmsPageRecord[]>([]);
  const [plugins, setPlugins] = useState<CmsPluginRecord[]>([]);
  const [mediaList, setMediaList] = useState<CmsMediaItem[]>([]);
  const [settings, setSettings] = useState<CmsGlobalSettings>(DEFAULT_CMS_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [editingSection, setEditingSection] = useState<LandingPageSectionRecord | null>(null);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPageRecord | null>(null);
  const [configuringPlugin, setConfiguringPlugin] = useState<CmsPluginRecord | null>(null);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Form states
  const [blockForm, setBlockForm] = useState<LandingPageSectionPayload>({
    badge: '',
    title: '',
    subtitle: '',
    description: '',
    primary_cta_text: '',
    primary_cta_url: '',
    secondary_cta_text: '',
    secondary_cta_url: '',
    is_published: true,
    block_type: 'hero',
    items: [],
    style_options: { backgroundTheme: 'default', paddingY: 'normal', containerWidth: 'full' },
  });

  const [pageForm, setPageForm] = useState<CmsPagePayload>({
    title: '',
    slug: '',
    description: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    show_in_header: true,
    show_in_footer: true,
    is_published: true,
  });

  const [mediaForm, setMediaForm] = useState<{
    filename: string;
    title: string;
    url: string;
    file_type: 'image' | 'video' | 'document' | 'svg';
    category: CmsMediaItem['category'];
    alt_text: string;
  }>({
    filename: '',
    title: '',
    url: '',
    file_type: 'image',
    category: 'campuses',
    alt_text: '',
  });

  // Load all initial CMS data
  const loadAllCmsData = async () => {
    setLoading(true);
    try {
      const [secRes, pageRes, plugRes, medRes, setRes] = await Promise.all([
        getLandingPageSections(selectedPageSlug),
        getCmsPages(),
        getCmsPlugins(),
        getCmsMedia(),
        getCmsSettings(),
      ]);

      if (secRes.success) setSections(secRes.data);
      if (pageRes.success) setPages(pageRes.data);
      if (plugRes.success) setPlugins(plugRes.data);
      if (medRes.success) setMediaList(medRes.data);
      if (setRes.success) setSettings(setRes.data);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCmsData();
  }, [selectedPageSlug]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  // ── Block Editor Handlers ────────────────────────────────────
  const handleOpenEditSection = (sec: LandingPageSectionRecord) => {
    setEditingSection(sec);
    setBlockForm({
      badge: sec.badge,
      title: sec.title,
      subtitle: sec.subtitle,
      description: sec.description || '',
      primary_cta_text: sec.primary_cta_text || '',
      primary_cta_url: sec.primary_cta_url || '',
      secondary_cta_text: sec.secondary_cta_text || '',
      secondary_cta_url: sec.secondary_cta_url || '',
      is_published: sec.is_published,
      sort_order: sec.sort_order,
      block_type: sec.block_type || (sec.section_key as BlockType) || 'hero',
      page_slug: sec.page_slug || selectedPageSlug,
      items: sec.items ? JSON.parse(JSON.stringify(sec.items)) : [],
      style_options: sec.style_options ? { ...sec.style_options } : { backgroundTheme: 'default', paddingY: 'normal' },
    });
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    setSaving(true);
    try {
      const res = await updateLandingPageSection(editingSection.section_key, blockForm);
      if (res.success) {
        showNotification('success', `Block "${blockForm.title}" saved and published successfully.`);
        setEditingSection(null);
        loadAllCmsData();
      } else {
        showNotification('error', res.error || 'Failed to save block.');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBlock = async (type: BlockType) => {
    const meta = BLOCK_TYPE_META[type];
    const newKey = `${type}_${Date.now().toString().slice(-4)}`;
    setSaving(true);
    try {
      const payload: LandingPageSectionPayload = {
        badge: meta.label,
        title: `New ${meta.label}`,
        subtitle: `Customizable ${meta.label} block for your institutional portal.`,
        block_type: type,
        page_slug: selectedPageSlug,
        is_published: true,
        sort_order: sections.length + 1,
        items: [],
        style_options: { backgroundTheme: 'default', paddingY: 'normal', containerWidth: 'full' },
      };

      const res = await createLandingPageSection(newKey, payload);
      if (res.success) {
        showNotification('success', `Added new "${meta.label}" block.`);
        setShowAddBlockModal(false);
        loadAllCmsData();
      } else {
        showNotification('error', res.error || 'Could not add block.');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSectionVisibility = async (sec: LandingPageSectionRecord) => {
    const nextState = !sec.is_published;
    setSections(prev => prev.map(s => s.section_key === sec.section_key ? { ...s, is_published: nextState } : s));
    const res = await toggleLandingPageSectionVisibility(sec.section_key, nextState);
    if (res.success) {
      showNotification('success', `Section "${sec.title}" is now ${nextState ? 'Published Live' : 'Hidden in Draft'}.`);
    } else {
      showNotification('error', 'Failed to toggle visibility.');
      loadAllCmsData();
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIdx, 0, moved);
    setSections(newSections);

    const orderedKeys = newSections.map(s => s.section_key);
    await reorderLandingPageSections(orderedKeys);
    showNotification('success', 'Section sort order updated.');
  };

  const handleDuplicateSection = async (sec: LandingPageSectionRecord) => {
    setSaving(true);
    const res = await duplicateLandingPageSection(sec.section_key);
    if (res.success) {
      showNotification('success', `Duplicated "${sec.title}".`);
      loadAllCmsData();
    } else {
      showNotification('error', res.error || 'Failed to duplicate.');
    }
    setSaving(false);
  };

  const handleDeleteSection = async (sec: LandingPageSectionRecord) => {
    if (!confirm(`Are you sure you want to permanently delete the block "${sec.title}"?`)) return;
    setSaving(true);
    const res = await deleteLandingPageSection(sec.section_key);
    if (res.success) {
      showNotification('success', `Deleted block "${sec.title}".`);
      loadAllCmsData();
    } else {
      showNotification('error', res.error || 'Failed to delete block.');
    }
    setSaving(false);
  };

  const handleResetSection = async (sec: LandingPageSectionRecord) => {
    if (!confirm(`Reset "${sec.title}" to default template content?`)) return;
    setSaving(true);
    const res = await resetLandingPageSection(sec.section_key);
    if (res.success) {
      showNotification('success', `Reset "${sec.title}" to default factory settings.`);
      loadAllCmsData();
    } else {
      showNotification('error', res.error || 'Failed to reset.');
    }
    setSaving(false);
  };

  // ── Page Management Handlers ─────────────────────────────────
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPage) {
        const res = await updateCmsPage(editingPage.id, pageForm);
        if (res.success) {
          showNotification('success', `Page "${pageForm.title}" updated.`);
          setEditingPage(null);
          loadAllCmsData();
        } else {
          showNotification('error', res.error || 'Failed to update page.');
        }
      } else {
        const res = await createCmsPage(pageForm);
        if (res.success) {
          showNotification('success', `Page "${pageForm.title}" created successfully.`);
          setShowAddPageModal(false);
          loadAllCmsData();
        } else {
          showNotification('error', res.error || 'Failed to create page.');
        }
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (page: CmsPageRecord) => {
    if (page.is_home) {
      alert('The Home page is a protected core route and cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete page "/${page.slug}"?`)) return;
    const res = await deleteCmsPage(page.id);
    if (res.success) {
      showNotification('success', `Deleted page "/${page.slug}".`);
      loadAllCmsData();
    } else {
      showNotification('error', res.error || 'Failed to delete page.');
    }
  };

  // ── Plugin Handlers ──────────────────────────────────────────
  const handleTogglePlugin = async (plugin: CmsPluginRecord) => {
    const nextState = !plugin.is_enabled;
    setPlugins(prev => prev.map(p => p.plugin_key === plugin.plugin_key ? { ...p, is_enabled: nextState } : p));
    const res = await updateCmsPlugin(plugin.plugin_key, nextState, plugin.config);
    if (res.success) {
      showNotification('success', `Plugin "${plugin.name}" is now ${nextState ? 'Enabled' : 'Disabled'}.`);
    } else {
      showNotification('error', res.error || 'Failed to update plugin.');
      loadAllCmsData();
    }
  };

  const handleSavePluginConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringPlugin) return;
    setSaving(true);
    const res = await updateCmsPlugin(configuringPlugin.plugin_key, configuringPlugin.is_enabled, configuringPlugin.config);
    if (res.success) {
      showNotification('success', `Configuration for "${configuringPlugin.name}" saved.`);
      setConfiguringPlugin(null);
      loadAllCmsData();
    } else {
      showNotification('error', res.error || 'Failed to save plugin config.');
    }
    setSaving(false);
  };

  // ── Media Handlers ───────────────────────────────────────────
  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await addCmsMedia(mediaForm);
    if (res.success) {
      showNotification('success', 'Media asset added to library.');
      setShowAddMediaModal(false);
      setMediaForm({ filename: '', title: '', url: '', file_type: 'image', category: 'campuses', alt_text: '' });
      loadAllCmsData();
    } else {
      showNotification('error', res.error || 'Failed to add media.');
    }
    setSaving(false);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Delete this asset from media library?')) return;
    const res = await deleteCmsMedia(mediaId);
    if (res.success) {
      showNotification('success', 'Media asset deleted.');
      loadAllCmsData();
    } else {
      showNotification('error', 'Failed to delete asset.');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // ── Template Preset Apply Handler ────────────────────────────
  const handleApplyTemplate = async (presetId: string) => {
    if (!confirm(`Apply this template preset to your platform? This will configure your Home page layout.`)) return;
    setSaving(true);
    const res = await applyCmsTemplatePreset(presetId);
    if (res.success) {
      showNotification('success', 'Theme template applied successfully.');
      loadAllCmsData();
    } else {
      showNotification('error', res.error || 'Failed to apply preset.');
    }
    setSaving(false);
  };

  // ── Styler & Settings Handler ────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateCmsSettings(settings);
    if (res.success) {
      showNotification('success', 'Global platform branding & code settings saved.');
      loadAllCmsData();
    } else {
      showNotification('error', res.error || 'Failed to save settings.');
    }
    setSaving(false);
  };

  // ── Helpers for Item editing inside blockForm ────────────────
  const handleAddItem = () => {
    const newItem: LandingPageItem = {
      id: Date.now().toString(),
      title: 'New Sub-Element',
      description: 'Enter item description or feature details.',
    };
    setBlockForm(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const handleUpdateItem = (idx: number, updates: Partial<LandingPageItem>) => {
    setBlockForm(prev => {
      const items = [...(prev.items || [])];
      items[idx] = { ...items[idx], ...updates };
      return { ...prev, items };
    });
  };

  const handleRemoveItem = (idx: number) => {
    setBlockForm(prev => {
      const items = [...(prev.items || [])];
      items.splice(idx, 1);
      return { ...prev, items };
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] pb-20">
      
      {/* ── Notification Toast ────────────────────────────────────── */}
      {notice && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200 ${
          notice.type === 'success'
            ? 'bg-emerald-500 text-white shadow-emerald-500/25'
            : 'bg-red-500 text-white shadow-red-500/25'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* ── Top Bar Header ────────────────────────────────────────── */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] sticky top-0 z-30 px-6 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">Public Platform CMS Suite</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
                  WordPress-Grade
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                Visual block builder, multi-page engine, template presets, and plugin integrations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowLivePreviewModal(true)}
              className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold hover:bg-[hsl(var(--bg-tertiary))] transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" /> Live Visual Preview
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Visit Public Site
            </Link>
          </div>
        </div>

        {/* ── Sub-Navigation Tabs ─────────────────────────────────── */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-4 mt-2 border-t border-[hsl(var(--border)/0.6)]">
          {[
            { id: 'builder', label: 'Visual Page Builder', icon: LayoutTemplate, count: sections.length },
            { id: 'pages', label: 'Pages & Menus', icon: Globe, count: pages.length },
            { id: 'templates', label: 'Theme Templates', icon: Palette, count: CMS_THEME_PRESETS.length },
            { id: 'plugins', label: 'Plugin Extensions', icon: Sliders, count: plugins.filter(p => p.is_enabled).length },
            { id: 'media', label: 'Media Library', icon: ImageIcon, count: mediaList.length },
            { id: 'styler', label: 'Branding & Code Styler', icon: Code },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                  isActive
                    ? 'bg-[hsl(var(--accent))] text-white shadow-md shadow-[hsl(var(--accent)/0.25)]'
                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
        
        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 1: VISUAL PAGE BUILDER                                   */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'builder' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Builder Toolbar */}
            <div className="p-4 rounded-3xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Editing Page:</label>
                <select
                  value={selectedPageSlug}
                  onChange={e => setSelectedPageSlug(e.target.value)}
                  className="h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                >
                  {pages.map(p => (
                    <option key={p.slug} value={p.slug}>
                      {p.title} (/{p.slug === 'home' ? '' : p.slug})
                    </option>
                  ))}
                </select>

                <div className="h-5 w-px bg-[hsl(var(--border))] hidden sm:block" />

                {/* Device Viewport Selector */}
                <div className="flex items-center p-1 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))]">
                  {[
                    { id: 'desktop', icon: Monitor, label: 'Desktop' },
                    { id: 'tablet', icon: Tablet, label: 'Tablet' },
                    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                  ].map(dev => {
                    const DevIcon = dev.icon;
                    return (
                      <button
                        key={dev.id}
                        type="button"
                        onClick={() => setDeviceViewport(dev.id as any)}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          deviceViewport === dev.id
                            ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                            : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                        }`}
                        title={dev.label}
                      >
                        <DevIcon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{dev.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBlockModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Block / Widget
                </button>
              </div>
            </div>

            {/* Visual Section Matrix */}
            <div className="space-y-4">
              {sections.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[hsl(var(--bg-secondary))] border border-dashed border-[hsl(var(--border))] space-y-3">
                  <LayoutTemplate className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto" />
                  <h3 className="text-sm font-black">No sections added to this page yet</h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))] max-w-md mx-auto">
                    Click "Add Block / Widget" to insert your first section (Hero banner, Bento grid, Stats counter, etc.).
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddBlockModal(true)}
                    className="px-4 py-2 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold"
                  >
                    + Add First Block
                  </button>
                </div>
              ) : (
                sections.map((sec, idx) => {
                  const bType = sec.block_type || (sec.section_key as BlockType) || 'hero';
                  const meta = BLOCK_TYPE_META[bType] || BLOCK_TYPE_META.hero;
                  const BlockIcon = meta.icon;

                  return (
                    <div
                      key={sec.section_key}
                      className={`p-5 rounded-3xl bg-[hsl(var(--bg-secondary))] border transition-all ${
                        sec.is_published
                          ? 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] shadow-sm'
                          : 'border-dashed border-amber-500/30 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Left Info */}
                        <div className="flex items-start gap-4">
                          {/* Sort Arrows */}
                          <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSection(idx, 'up')}
                              className="p-1 rounded text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] disabled:opacity-25"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-black text-[hsl(var(--accent))]">{idx + 1}</span>
                            <button
                              type="button"
                              disabled={idx === sections.length - 1}
                              onClick={() => handleMoveSection(idx, 'down')}
                              className="p-1 rounded text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] disabled:opacity-25"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Block Icon */}
                          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                            <BlockIcon className="w-5 h-5" />
                          </div>

                          {/* Content Details */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] text-[10px] font-black uppercase tracking-wider">
                                {meta.label}
                              </span>
                              <span className="text-xs font-mono text-[hsl(var(--text-tertiary))]">#{sec.section_key}</span>
                              {!sec.is_published && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black">
                                  Draft / Hidden
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">{sec.title}</h3>
                            <p className="text-xs text-[hsl(var(--text-secondary))] line-clamp-1">{sec.subtitle || sec.description || 'No subtitle configured.'}</p>
                          </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                          {/* Live Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleSectionVisibility(sec)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                              sec.is_published
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
                                : 'bg-slate-500/15 text-slate-400 border border-slate-500/25 hover:bg-slate-500/25'
                            }`}
                          >
                            {sec.is_published ? '● Live' : '○ Draft'}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditSection(sec)}
                            className="px-3.5 py-1.5 rounded-xl bg-[hsl(var(--accent))] text-white font-bold text-xs shadow-sm hover:opacity-90 flex items-center gap-1.5 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Block
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateSection(sec)}
                            title="Duplicate Block"
                            className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-primary))] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset */}
                          <button
                            type="button"
                            onClick={() => handleResetSection(sec)}
                            title="Reset to Template Defaults"
                            className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-primary))] transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec)}
                            title="Delete Block"
                            className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 2: PAGES & MENUS                                          */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'pages' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight">Public Site Pages & Navigation Hierarchy</h2>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Manage static routes, multi-page URL slugs, SEO metadata tags, and header/footer navigation items.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPage(null);
                  setPageForm({
                    title: '',
                    slug: '',
                    description: '',
                    seo_title: '',
                    seo_description: '',
                    seo_keywords: '',
                    show_in_header: true,
                    show_in_footer: true,
                    is_published: true,
                  });
                  setShowAddPageModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create New Page
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map(page => (
                <div
                  key={page.id}
                  className="glass-card p-6 rounded-3xl border border-[hsl(var(--border))] space-y-4 hover:border-[hsl(var(--accent)/0.4)] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold">
                        /{page.slug === 'home' ? '' : page.slug}
                      </span>
                      {page.is_home && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase">
                          Root Home
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black">{page.title}</h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))] line-clamp-2 leading-relaxed">
                      {page.seo_description || page.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[hsl(var(--border))] space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[hsl(var(--text-tertiary))] font-medium">
                      <span>Header Menu: {page.show_in_header ? '✓ Visible' : '✗ Hidden'}</span>
                      <span>Footer: {page.show_in_footer ? '✓ Visible' : '✗ Hidden'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPageSlug(page.slug);
                          setActiveTab('builder');
                        }}
                        className="flex-1 py-2 rounded-xl bg-[hsl(var(--accent))] text-white font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-1"
                      >
                        <LayoutTemplate className="w-3.5 h-3.5" /> Edit Blocks
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPage(page);
                          setPageForm({
                            title: page.title,
                            slug: page.slug,
                            description: page.description || '',
                            seo_title: page.seo_title || '',
                            seo_description: page.seo_description || '',
                            seo_keywords: page.seo_keywords || '',
                            show_in_header: page.show_in_header,
                            show_in_footer: page.show_in_footer,
                            is_published: page.is_published,
                          });
                          setShowAddPageModal(true);
                        }}
                        className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-secondary))] transition-colors"
                        title="SEO Settings"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      {!page.is_home && (
                        <button
                          type="button"
                          onClick={() => handleDeletePage(page)}
                          className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 3: TEMPLATES & THEMES                                     */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'templates' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black tracking-tight">Full-Page Theme Presets & Layout Starters</h2>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                1-click full-page starter presets tailored for high schools, private academies, and diocesan networks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CMS_THEME_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  className="glass-card rounded-3xl border border-[hsl(var(--border))] overflow-hidden hover:border-[hsl(var(--accent)/0.4)] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Preview Band */}
                    <div className={`h-28 bg-gradient-to-tr ${preset.previewColor} p-6 flex flex-col justify-between text-white relative`}>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider self-start border border-white/25">
                        {preset.badge}
                      </span>
                      <p className="text-xs font-bold text-white/90">{preset.category}</p>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-base font-black">{preset.name}</h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed font-medium">
                        {preset.tagline}
                      </p>
                      <div className="pt-2 text-[11px] text-[hsl(var(--text-tertiary))] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Includes {preset.sectionsCount} Pre-configured Blocks</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-[hsl(var(--border))] mt-4">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(preset.id)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Apply Preset to Home
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 4: PLUGINS & EXTENSIONS                                  */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'plugins' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black tracking-tight">Widget Extensions & Built-in Plugins</h2>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                Activate floating widgets, urgent top banners, cookie compliance, and analytics tracking with 1 click.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugins.map(plugin => {
                return (
                  <div
                    key={plugin.plugin_key}
                    className={`glass-card p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                      plugin.is_enabled
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-[hsl(var(--border))]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          plugin.is_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {plugin.category}
                        </span>
                        
                        {/* Switch */}
                        <button
                          type="button"
                          onClick={() => handleTogglePlugin(plugin)}
                          className={`w-11 h-6 rounded-full p-1 transition-colors ${
                            plugin.is_enabled ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            plugin.is_enabled ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <h3 className="text-base font-black">{plugin.name}</h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                        {plugin.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[hsl(var(--border))] mt-4">
                      <button
                        type="button"
                        onClick={() => setConfiguringPlugin(plugin)}
                        className="w-full py-2 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-primary))] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Configure Settings
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 5: MEDIA LIBRARY                                         */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black tracking-tight">Centralized Media Library & Asset Manager</h2>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Organize high-resolution campus photos, logos, badges, and UI screenshots for direct insertion into blocks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMediaModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md flex items-center gap-2 shrink-0"
              >
                <Upload className="w-4 h-4" /> Add Media Asset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaList.map(media => (
                <div
                  key={media.id}
                  className="glass-card rounded-3xl border border-[hsl(var(--border))] overflow-hidden space-y-3 group hover:border-[hsl(var(--accent)/0.4)] transition-all"
                >
                  <div className="h-36 bg-[hsl(var(--bg-primary))] relative overflow-hidden flex items-center justify-center">
                    <img
                      src={media.url}
                      alt={media.alt_text || media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[9px] uppercase backdrop-blur-md">
                      {media.category}
                    </span>
                  </div>

                  <div className="p-4 pt-1 space-y-2">
                    <h4 className="text-xs font-black truncate">{media.title}</h4>
                    <p className="text-[10px] font-mono text-[hsl(var(--text-tertiary))] truncate">{media.url}</p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(media.url)}
                        className="flex-1 py-1.5 rounded-lg bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        {copiedUrl === media.url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUrl === media.url ? 'Copied!' : 'Copy URL'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(media.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 6: THEME & CSS STYLER                                    */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === 'styler' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black tracking-tight">Global Platform Branding & Custom Code Injector</h2>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                Tailor brand color tokens, typography pairings, and inject custom CSS or third-party tracking scripts.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              
              <div className="p-6 rounded-3xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-4">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" /> Brand Identity & Colors
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Site Name</label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Site Tagline</label>
                    <input
                      type="text"
                      value={settings.site_tagline}
                      onChange={e => setSettings({ ...settings, site_tagline: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Primary Brand Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-[hsl(var(--border))] bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primary_color}
                        onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
                        className="flex-1 h-10 px-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.accent_color}
                        onChange={e => setSettings({ ...settings, accent_color: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-[hsl(var(--border))] bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.accent_color}
                        onChange={e => setSettings({ ...settings, accent_color: e.target.value })}
                        className="flex-1 h-10 px-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom CSS Code Editor */}
              <div className="p-6 rounded-3xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] space-y-4">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" /> Custom Global CSS Overrides
                </h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Inject raw CSS stylesheets directly into all public platform landing pages.
                </p>
                <textarea
                  rows={6}
                  value={settings.custom_css || ''}
                  onChange={e => setSettings({ ...settings, custom_css: e.target.value })}
                  placeholder={`/* Example custom CSS */\n.hero-badge {\n  letter-spacing: 0.15em;\n}`}
                  className="w-full p-4 rounded-2xl bg-slate-950 font-mono text-xs text-emerald-400 border border-[hsl(var(--border))] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Branding &amp; Code Settings
              </button>

            </form>
          </div>
        )}

      </main>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: ADD BLOCK / WIDGET INSERTER                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showAddBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Add Block / Widget to Page</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">Choose a pre-built block type to insert into your layout.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBlockModal(false)}
                className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {(Object.keys(BLOCK_TYPE_META) as BlockType[]).map(type => {
                const meta = BLOCK_TYPE_META[type];
                const Icon = meta.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleCreateBlock(type)}
                    className="p-5 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] hover:scale-[1.02] text-left transition-all space-y-2.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-black text-[hsl(var(--text-primary))]">{meta.label}</h4>
                    <p className="text-[11px] text-[hsl(var(--text-secondary))] line-clamp-2 leading-relaxed">{meta.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: RICH BLOCK & SECTION EDITOR                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] text-[10px] font-black uppercase tracking-wider">
                  Block Inspector: {editingSection.block_type || editingSection.section_key}
                </span>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))] mt-1">
                  Edit Block &bull; {editingSection.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              
              {/* Core Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Section Badge</label>
                  <input
                    type="text"
                    value={blockForm.badge}
                    onChange={e => setBlockForm({ ...blockForm, badge: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Publication Status</label>
                  <select
                    value={blockForm.is_published ? 'true' : 'false'}
                    onChange={e => setBlockForm({ ...blockForm, is_published: e.target.value === 'true' })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="true">● Published Live</option>
                    <option value="false">○ Draft (Hidden from Public Site)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Main Headline Title *</label>
                <input
                  type="text"
                  required
                  value={blockForm.title}
                  onChange={e => setBlockForm({ ...blockForm, title: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-sm font-black text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Subtitle / Secondary Text</label>
                <textarea
                  rows={2}
                  value={blockForm.subtitle}
                  onChange={e => setBlockForm({ ...blockForm, subtitle: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              {/* Background Theme & Styling Options */}
              <div className="p-4 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-3">
                <h4 className="text-xs font-black text-[hsl(var(--accent))] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Layout &amp; Theme Styling
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[hsl(var(--text-secondary))] mb-1">Background Theme</label>
                    <select
                      value={blockForm.style_options?.backgroundTheme || 'default'}
                      onChange={e => setBlockForm({
                        ...blockForm,
                        style_options: { ...blockForm.style_options, backgroundTheme: e.target.value as any }
                      })}
                      className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold"
                    >
                      <option value="default">Default Primary Background</option>
                      <option value="secondary">Secondary Accent Tint</option>
                      <option value="accent-subtle">Subtle Indigo Glow</option>
                      <option value="gradient">Vertical Gradient</option>
                      <option value="glass">Frosted Glassmorphism</option>
                      <option value="dark">Deep Obsidian Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[hsl(var(--text-secondary))] mb-1">Vertical Padding</label>
                    <select
                      value={blockForm.style_options?.paddingY || 'normal'}
                      onChange={e => setBlockForm({
                        ...blockForm,
                        style_options: { ...blockForm.style_options, paddingY: e.target.value as any }
                      })}
                      className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold"
                    >
                      <option value="compact">Compact (Shorter Gap)</option>
                      <option value="normal">Normal (Standard Spacing)</option>
                      <option value="spacious">Spacious (Expansive Breathing Room)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Primary CTA Button Text</label>
                  <input
                    type="text"
                    value={blockForm.primary_cta_text || ''}
                    onChange={e => setBlockForm({ ...blockForm, primary_cta_text: e.target.value })}
                    placeholder="e.g. Register School Free"
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Primary CTA URL</label>
                  <input
                    type="text"
                    value={blockForm.primary_cta_url || ''}
                    onChange={e => setBlockForm({ ...blockForm, primary_cta_url: e.target.value })}
                    placeholder="e.g. /register"
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Items Editor */}
              <div className="space-y-3 pt-2 border-t border-[hsl(var(--border))]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--text-primary))]">
                    Sub-Elements &amp; Cards ({blockForm.items?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 rounded-xl bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] font-bold text-xs hover:bg-[hsl(var(--accent)/0.25)] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Card
                  </button>
                </div>

                <div className="space-y-3">
                  {blockForm.items?.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[hsl(var(--accent))] uppercase">Item #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={item.title || item.question || ''}
                          onChange={e => handleUpdateItem(idx, { title: e.target.value, question: e.target.value })}
                          placeholder="Card Title / Question"
                          className="h-9 px-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={item.statValue || item.tag || ''}
                          onChange={e => handleUpdateItem(idx, { statValue: e.target.value, tag: e.target.value })}
                          placeholder="Badge Tag / Metric (e.g. 99.9%)"
                          className="h-9 px-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-bold text-indigo-400"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={item.description || item.answer || ''}
                        onChange={e => handleUpdateItem(idx, { description: e.target.value, answer: e.target.value })}
                        placeholder="Card Description / Answer Text..."
                        className="w-full p-2.5 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))] sticky bottom-0 bg-[hsl(var(--bg-secondary))] py-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold hover:bg-[hsl(var(--bg-primary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save &amp; Publish Block
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: PAGE CREATOR & SEO EDITOR                            */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">
                  {editingPage ? `Edit Page: /${editingPage.slug}` : 'Create New Page'}
                </h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">Configure URL slug, navigation menus, and SEO search tags.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPageModal(false)}
                className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={pageForm.title}
                    onChange={e => setPageForm({
                      ...pageForm,
                      title: e.target.value,
                      slug: editingPage ? pageForm.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                    })}
                    placeholder="e.g. Admissions &amp; Enrollment"
                    className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">URL Slug *</label>
                  <input
                    type="text"
                    required
                    disabled={editingPage?.is_home}
                    value={pageForm.slug}
                    onChange={e => setPageForm({ ...pageForm, slug: e.target.value })}
                    placeholder="e.g. admissions"
                    className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1.5">SEO Meta Description</label>
                <textarea
                  rows={3}
                  value={pageForm.seo_description || ''}
                  onChange={e => setPageForm({ ...pageForm, seo_description: e.target.value })}
                  placeholder="Compelling 150-character summary for Google search results..."
                  className="w-full p-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs"
                />
              </div>

              <div className="flex items-center gap-6 p-4 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))]">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageForm.show_in_header}
                    onChange={e => setPageForm({ ...pageForm, show_in_header: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Show in Header Navbar</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageForm.show_in_footer}
                    onChange={e => setPageForm({ ...pageForm, show_in_footer: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Show in Footer Links</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setShowAddPageModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold hover:bg-[hsl(var(--bg-primary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 4: PLUGIN CONFIGURATION DRAWER                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      {configuringPlugin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase">
                  Plugin Config: {configuringPlugin.plugin_key}
                </span>
                <h3 className="text-lg font-black mt-1">{configuringPlugin.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfiguringPlugin(null)}
                className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePluginConfig} className="space-y-4">
              {configuringPlugin.plugin_key === 'top_banner' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={configuringPlugin.config.badgeText || ''}
                      onChange={e => setConfiguringPlugin({
                        ...configuringPlugin,
                        config: { ...configuringPlugin.config, badgeText: e.target.value }
                      })}
                      className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Announcement Message</label>
                    <textarea
                      rows={2}
                      value={configuringPlugin.config.message || ''}
                      onChange={e => setConfiguringPlugin({
                        ...configuringPlugin,
                        config: { ...configuringPlugin.config, message: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Link CTA Text</label>
                      <input
                        type="text"
                        value={configuringPlugin.config.linkText || ''}
                        onChange={e => setConfiguringPlugin({
                          ...configuringPlugin,
                          config: { ...configuringPlugin.config, linkText: e.target.value }
                        })}
                        className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Link URL</label>
                      <input
                        type="text"
                        value={configuringPlugin.config.linkUrl || ''}
                        onChange={e => setConfiguringPlugin({
                          ...configuringPlugin,
                          config: { ...configuringPlugin.config, linkUrl: e.target.value }
                        })}
                        className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {configuringPlugin.plugin_key === 'whatsapp_float' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={configuringPlugin.config.phoneNumber || ''}
                      onChange={e => setConfiguringPlugin({
                        ...configuringPlugin,
                        config: { ...configuringPlugin.config, phoneNumber: e.target.value }
                      })}
                      placeholder="+23276000000"
                      className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Initial Greeting Text</label>
                    <textarea
                      rows={2}
                      value={configuringPlugin.config.greetingMessage || ''}
                      onChange={e => setConfiguringPlugin({
                        ...configuringPlugin,
                        config: { ...configuringPlugin.config, greetingMessage: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs"
                    />
                  </div>
                </>
              )}

              {configuringPlugin.plugin_key === 'cookie_consent' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Banner Title</label>
                    <input
                      type="text"
                      value={configuringPlugin.config.title || ''}
                      onChange={e => setConfiguringPlugin({
                        ...configuringPlugin,
                        config: { ...configuringPlugin.config, title: e.target.value }
                      })}
                      className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Consent Notice Message</label>
                    <textarea
                      rows={2}
                      value={configuringPlugin.config.message || ''}
                      onChange={e => setConfiguringPlugin({
                        ...configuringPlugin,
                        config: { ...configuringPlugin.config, message: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setConfiguringPlugin(null)}
                  className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold hover:bg-[hsl(var(--bg-primary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Plugin Config'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 5: ADD MEDIA ASSET                                      */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showAddMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Add Media Asset to Library</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">Enter asset URL or public path to organize in library.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMediaModal(false)}
                className="p-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Asset Title *</label>
                <input
                  type="text"
                  required
                  value={mediaForm.title}
                  onChange={e => setMediaForm({ ...mediaForm, title: e.target.value, filename: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.jpg' })}
                  placeholder="e.g. Science Laboratory Students"
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Image URL / Path *</label>
                <input
                  type="text"
                  required
                  value={mediaForm.url}
                  onChange={e => setMediaForm({ ...mediaForm, url: e.target.value })}
                  placeholder="e.g. /hero-science.jpg or https://..."
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Category</label>
                <select
                  value={mediaForm.category}
                  onChange={e => setMediaForm({ ...mediaForm, category: e.target.value as any })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] text-xs font-bold"
                >
                  <option value="campuses">Campuses &amp; Facilities</option>
                  <option value="logos">Logos &amp; Crests</option>
                  <option value="badges">Badges &amp; Accreditations</option>
                  <option value="mockups">UI Screenshots &amp; Dashboards</option>
                  <option value="general">General Marketing</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setShowAddMediaModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-bold hover:bg-[hsl(var(--bg-primary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md"
                >
                  {saving ? 'Adding...' : 'Add to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 6: LIVE RESPONSIVE PREVIEW MODAL                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 text-white">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-black">Live Responsive Viewport Preview</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700 text-white">
                {[
                  { id: 'desktop', icon: Monitor, label: 'Desktop (100%)' },
                  { id: 'tablet', icon: Tablet, label: 'Tablet (768px)' },
                  { id: 'mobile', icon: Smartphone, label: 'Mobile (375px)' },
                ].map(dev => {
                  const DevIcon = dev.icon;
                  return (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => setDeviceViewport(dev.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        deviceViewport === dev.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <DevIcon className="w-3.5 h-3.5" />
                      <span>{dev.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowLivePreviewModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className={`h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
              deviceViewport === 'mobile'
                ? 'w-[375px] border-[10px] border-slate-900 rounded-[40px]'
                : deviceViewport === 'tablet'
                ? 'w-[768px] border-[10px] border-slate-900 rounded-[30px]'
                : 'w-full'
            }`}>
              <iframe
                src={`/${selectedPageSlug === 'home' ? '' : selectedPageSlug}`}
                className="w-full h-full border-0"
                title="Live Preview Frame"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
