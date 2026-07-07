'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  School, Palette, Calendar, Users, Bell, Shield, Layers, MessageSquare, Database,
  Brain, Zap, Link2, Download, History, Settings, Save, Sparkles, Check, Play,
  Upload, QrCode, AlertTriangle, ShieldCheck, UserCheck, Trash2, Key, Search, Clock, Mail, Plus, Menu
} from 'lucide-react';

type SettingsTab =
  | 'overview'
  | 'profile'
  | 'branding'
  | 'academic'
  | 'notifications'
  | 'roles'
  | 'modules'
  | 'security'
  | 'communication'
  | 'privacy'
  | 'ai'
  | 'automation'
  | 'integrations'
  | 'backup'
  | 'audit'
  | 'advanced';

export default function SchoolSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<SettingsTab>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Settings mock states
  const [profile, setProfile] = useState({
    name: tenant.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Academy',
    code: 'GRN-2026',
    motto: 'Knowledge is Power',
    address: '123 Education Boulevard, Lagos',
    gps: '6.5244° N, 3.3792° E',
    phone: '+234 80 1234 5678',
    email: 'admin@greenwood.edu',
    website: 'www.greenwood.edu',
    principal: 'Mrs. Patricia Osei',
    type: 'Co-Educational Secondary',
    ownership: 'Private Boarding',
    timezone: 'Africa/Lagos (WAT)',
    currency: 'NGN (₦)',
    language: 'English (US)',
    academicSystem: 'WAEC & British Curriculum'
  });

  const [branding, setBranding] = useState({
    primaryColor: '#6366f1',
    secondaryColor: '#3b82f6',
    accentColor: '#10b981',
    logo: '',
    seal: '',
    signature: '',
    banner: ''
  });

  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    emailSender: 'Greenwood Notifications',
    emailReplyTo: 'reply@greenwood.edu',
    smsEnabled: true,
    smsSenderId: 'GREENWOOD',
    pushEnabled: true,
    pushQuietHours: true,
    inAppRetention: '90 Days'
  });

  const [security, setSecurity] = useState({
    minPasswordLength: 12,
    passwordExpiry: '90 Days',
    lockoutAttempts: 5,
    sessionTimeout: '30 Minutes',
    mfaRequired: true,
    loginAlerts: true
  });

  const [modules, setModules] = useState({
    studentManagement: true,
    attendance: true,
    finance: true,
    examinations: true,
    lms: true,
    library: true,
    hostel: false,
    transport: false,
    communication: true,
    aiAssistant: true
  });

  const [aiSettings, setAiSettings] = useState({
    aiEnabled: true,
    admissionsBot: true,
    gradingAnalyst: true,
    timetableOptimizer: true,
    approvalRequired: true,
    promptHistoryRetention: '30 Days'
  });

  const [activeRoles, setActiveRoles] = useState([
    { role: 'Principal', type: 'System Protected', users: 1, permissions: 'All Operations' },
    { role: 'Vice Principal', type: 'System Protected', users: 2, permissions: 'All Academic & HR' },
    { role: 'Registrar', type: 'System Protected', users: 1, permissions: 'Admissions & Roster' },
    { role: 'Teacher', type: 'Standard', users: 42, permissions: 'Assigned Classes Gradebook' },
    { role: 'Accountant', type: 'Standard', users: 2, permissions: 'Invoices, Fees Ledger' },
    { role: 'Parent', type: 'Standard', users: 512, permissions: 'Linked Children Portal' }
  ]);

  const [auditSearch, setAuditSearch] = useState('');
  const auditLogs = [
    { time: '2026-07-07 15:42', actor: 'Mrs. Patricia Osei', role: 'School Admin', action: 'Modified Term 3 Exam Schedules', module: 'Academics', ip: '197.210.8.44' },
    { time: '2026-07-07 14:15', actor: 'AI Operations Assistant', role: 'System Agent', action: 'Flagged 4 Students At-Risk', module: 'AI Engine', ip: '127.0.0.1' },
    { time: '2026-07-07 10:20', actor: 'John Accountant', role: 'Accountant', action: 'Approved Invoice Batch NGN-94', module: 'Finance', ip: '197.210.8.102' },
    { time: '2026-07-06 16:30', actor: 'Mrs. Patricia Osei', role: 'School Admin', action: 'Enabled Paystack Payments Integration', module: 'Integrations', ip: '197.210.8.44' },
  ].filter(l => l.action.toLowerCase().includes(auditSearch.toLowerCase()) || l.module.toLowerCase().includes(auditSearch.toLowerCase()));

  const handleSaveChanges = (section: string) => {
    setSaving(true);
    setSavedMessage(null);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(`Successfully saved ${section} configurations!`);
      setTimeout(() => setSavedMessage(null), 3000);
    }, 800);
  };

  const menuItems = [
    { id: 'overview', label: 'Settings Dashboard', icon: Settings },
    { id: 'profile', label: 'School Profile', icon: School },
    { id: 'branding', label: 'Branding & Themes', icon: Palette },
    { id: 'academic', label: 'Academic Setup', icon: Calendar },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'roles', label: 'Users & Permissions', icon: Users },
    { id: 'security', label: 'Password & Security', icon: Shield },
    { id: 'modules', label: 'Feature Modules', icon: Layers },
    { id: 'communication', label: 'Communication Hub', icon: MessageSquare },
    { id: 'privacy', label: 'Data & Privacy', icon: Database },
    { id: 'ai', label: 'AI Copilot Settings', icon: Brain },
    { id: 'automation', label: 'Automation Rules', icon: Zap },
    { id: 'integrations', label: 'Integrations Settings', icon: Link2 },
    { id: 'backup', label: 'Backup & Export', icon: Download },
    { id: 'audit', label: 'Audit System Logs', icon: History },
    { id: 'advanced', label: 'Advanced System Settings', icon: Sparkles }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))]">
            School Configuration Center
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Configure local school branding policies, academic terms, RBAC permissions limits, and module feature toggles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold shadow-glow">
            Subscription: Enterprise (Active)
          </span>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Desktop Horizontal Tabs */}
      <div className="hidden md:flex flex-wrap gap-2 pb-2 border-b border-[hsl(var(--border))] overflow-x-auto whitespace-nowrap scrollbar-none">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as SettingsTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white shadow-md shadow-[hsl(var(--accent)/0.15)]'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet Sticky Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] flex items-center justify-around py-2 px-4 shadow-2xl md:hidden">
        {menuItems.slice(0, 4).map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as SettingsTab);
              setShowMoreMenu(false);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-center transition-all ${
              activeTab === item.id && !showMoreMenu
                ? 'text-[hsl(var(--accent))] font-bold'
                : 'text-[hsl(var(--text-tertiary))]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-tight">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMoreMenu(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-center transition-all ${
            showMoreMenu
              ? 'text-[hsl(var(--accent))] font-bold'
              : 'text-[hsl(var(--text-tertiary))]'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {!menuItems.slice(0, 4).map(i => i.id).includes(activeTab) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
            )}
          </div>
          <span className="text-[9px] font-medium tracking-tight">More</span>
        </button>
      </div>

      {/* Bottom Sheet Backdrop & Panel for Mobile */}
      {showMoreMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="fixed bottom-14 left-0 right-0 z-50 bg-[hsl(var(--bg-secondary))] border-t border-[hsl(var(--border))] rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto md:hidden animate-slide-up">
            <div className="flex justify-between items-center pb-3 border-b border-[hsl(var(--border))] mb-3">
              <span className="text-xs font-extrabold uppercase text-[hsl(var(--text-tertiary))]">Configuration Menu</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-[10px] font-bold text-[hsl(var(--text-tertiary))]">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.slice(4).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as SettingsTab);
                    setShowMoreMenu(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] font-bold'
                      : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-[hsl(var(--accent))]" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Configurations Container */}
      <div className="pb-20 md:pb-0">
          {/* Settings Dashboard overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: 'Profile Build', value: '92%', sub: 'Motto & GPS set', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                  { label: 'Theme Branding', value: 'Configured', sub: 'Custom Indigo palette', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                  { label: 'Active Session', value: 'Term 3', sub: 'Ends July 31, 2026', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Active Users', value: '562 Users', sub: 'Parents, Staff, Admin', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                  { label: 'Active Modules', value: '8 / 10', sub: 'Hostel & Transit disabled', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                  { label: 'Security Score', value: 'A+ Compliance', sub: 'MFA active, 12-char limit', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
                  { label: 'Integrations', value: '4 Linked', sub: 'Paystack, Twilio, Supabase', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                  { label: 'Backup Health', value: '100% Verified', sub: 'Daily automated snapshot', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                  { label: 'Storage Used', value: '1.42 GB', sub: 'Limit: 50.0 GB', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                  { label: 'Audit Status', value: 'Secure Logs', sub: 'Last event 2 mins ago', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
                ].map(card => (
                  <div key={card.label} className={`glass-card p-4 border flex flex-col justify-between ${card.bg}`}>
                    <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider block mb-2">{card.label}</span>
                    <div>
                      <p className="text-base font-extrabold text-[hsl(var(--text-primary))]">{card.value}</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] truncate mt-0.5">{card.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* License Panel */}
              <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Platform Subscription & License Summary
                </h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  Your portal is locked to the <strong>Enterprise Plan</strong> configuration limits. Platform core parameters, database provision boundaries, and tenant tier levels can only be updated by the Platform Super Admin.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl text-center">
                    <p className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))]">Max Student Capacity</p>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-1">5,000 Students</p>
                  </div>
                  <div className="p-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl text-center">
                    <p className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))]">Subdomain Custom Domains</p>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-1">Supported (1 Enabled)</p>
                  </div>
                  <div className="p-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl text-center">
                    <p className="text-[10px] font-semibold text-[hsl(var(--text-tertiary))]">Authorized Campuses</p>
                    <p className="text-sm font-bold text-[hsl(var(--text-primary))] mt-1">Single Main Campus</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* School Profile panel */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">School Profile Configuration</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Define school location tags, contact channels, and system codes.</p>
              </div>

              {/* Upload Official Docs Assets */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.4)] border border-[hsl(var(--border))] text-center">
                {[
                  { label: 'School Logo', desc: 'Login & dashboard header' },
                  { label: 'Official Seal', desc: 'Transcripts certificates seal' },
                  { label: 'Principal Signature', desc: 'Report card validations signature' },
                  { label: 'Branded Banner', desc: 'Client portal custom background' }
                ].map(item => (
                  <div key={item.label} className="space-y-2 border border-[hsl(var(--border))] rounded-lg p-3 bg-[hsl(var(--bg-secondary))] flex flex-col justify-between items-center min-h-[120px]">
                    <Upload className="w-5 h-5 text-[hsl(var(--accent))]" />
                    <div>
                      <p className="text-[10px] font-bold text-[hsl(var(--text-primary))]">{item.label}</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] leading-snug mt-0.5">{item.desc}</p>
                    </div>
                    <button className="text-[9px] px-2 py-1 bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] rounded font-bold hover:bg-[hsl(var(--accent))] hover:text-white transition-all">Upload</button>
                  </div>
                ))}
              </div>

              {/* General Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">School Name *</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">School Code *</label>
                  <input type="text" value={profile.code} onChange={e => setProfile({...profile, code: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">School Motto</label>
                  <input type="text" value={profile.motto} onChange={e => setProfile({...profile, motto: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Address *</label>
                  <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">GPS Location coordinates</label>
                  <input type="text" value={profile.gps} onChange={e => setProfile({...profile, gps: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Principal / Director Name *</label>
                  <input type="text" value={profile.principal} onChange={e => setProfile({...profile, principal: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Time Zone *</label>
                  <select value={profile.timezone} onChange={e => setProfile({...profile, timezone: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>Africa/Lagos (WAT)</option>
                    <option>GMT (+00:00)</option>
                    <option>EST (-05:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">System Currency *</label>
                  <select value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>NGN (₦)</option>
                    <option>USD ($)</option>
                    <option>GHS (₵)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Default Language</label>
                  <select value={profile.language} onChange={e => setProfile({...profile, language: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Academic System *</label>
                  <select value={profile.academicSystem} onChange={e => setProfile({...profile, academicSystem: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>WAEC &amp; British Curriculum</option>
                    <option>Cambridge IB System</option>
                    <option>American GPA Standard</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => handleSaveChanges('School Profile')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {/* Branding & Themes Panel */}
          {activeTab === 'branding' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Branding &amp; Custom Themes</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Apply signature HSL colors to custom dashboards and document letterheads.</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider">1. Brand Theme Colors</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Primary Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="w-8 h-8 rounded border-0 cursor-pointer" />
                      <span className="text-xs font-mono">{branding.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Secondary Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={branding.secondaryColor} onChange={e => setBranding({...branding, secondaryColor: e.target.value})} className="w-8 h-8 rounded border-0 cursor-pointer" />
                      <span className="text-xs font-mono">{branding.secondaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={branding.accentColor} onChange={e => setBranding({...branding, accentColor: e.target.value})} className="w-8 h-8 rounded border-0 cursor-pointer" />
                      <span className="text-xs font-mono">{branding.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-[hsl(var(--border))/0.5] pt-4">
                <p className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider">2. Document Layout Templates Configuration</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Report Cards Template</label>
                    <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                      <option>Modern Compact (WAEC/National Standard)</option>
                      <option>Detailed Competency-based Assessment Card</option>
                      <option>Cambridge GCSE Profile Layout</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Billing Invoices &amp; Receipts Layout</label>
                    <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                      <option>Professional Sibling Consolidated Receipt</option>
                      <option>Standard Itemized Fees Invoice</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => handleSaveChanges('Branding Theme')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save Theme Settings
                </button>
              </div>
            </div>
          )}

          {/* Academic Setup Panel */}
          {activeTab === 'academic' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Academic Configuration Desk</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configure grading schemes, promotion pass scores, and active term timetables.</p>
              </div>

              {/* Term Dates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider">Active Academic Year: 2025/2026</span>
                  <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Term 3 Active</span>
                </div>
                <div className="space-y-2">
                  {[
                    { term: 'First Term', dates: 'Sept 01, 2025 - Dec 15, 2025', status: 'Completed' },
                    { term: 'Second Term', dates: 'Jan 05, 2026 - Apr 15, 2026', status: 'Completed' },
                    { term: 'Third Term', dates: 'May 01, 2026 - Jul 31, 2026', status: 'Active' }
                  ].map(t => (
                    <div key={t.term} className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] text-xs">
                      <span className="font-bold text-[hsl(var(--text-primary))]">{t.term}</span>
                      <span className="text-[hsl(var(--text-secondary))]">{t.dates}</span>
                      <span className={`px-2 py-0.5 rounded font-semibold text-[9px] uppercase ${t.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]'}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Rules */}
              <div className="space-y-3 border-t border-[hsl(var(--border))/0.5] pt-4">
                <p className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider">Promotion &amp; Passing Guidelines</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Minimum Pass Score (%)</label>
                    <input type="number" defaultValue={50} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Continuous Assessment Weight (%)</label>
                    <input type="number" defaultValue={40} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Exam Final Weight (%)</label>
                    <input type="number" defaultValue={60} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => handleSaveChanges('Academic Setup')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save Academic Rules
                </button>
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Notification Preferences</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configure automated dispatch gateways for parents, staff, and student alerts.</p>
              </div>

              <div className="space-y-4">
                {/* Email Gateway */}
                <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                      <Mail className="w-4.5 h-4.5 text-[hsl(var(--accent))]" /> Outbound Email Service
                    </p>
                    <input type="checkbox" checked={notifications.emailEnabled} onChange={e => setNotifications({...notifications, emailEnabled: e.target.checked})} className="w-4 h-4 cursor-pointer accent-[hsl(var(--accent))]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Sender Identity Name</label>
                      <input type="text" value={notifications.emailSender} onChange={e => setNotifications({...notifications, emailSender: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Reply-To Address</label>
                      <input type="email" value={notifications.emailReplyTo} onChange={e => setNotifications({...notifications, emailReplyTo: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* SMS Gateway */}
                <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.3)] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                      <MessageSquare className="w-4.5 h-4.5 text-[hsl(var(--accent))]" /> Outbound SMS Sender ID
                    </p>
                    <input type="checkbox" checked={notifications.smsEnabled} onChange={e => setNotifications({...notifications, smsEnabled: e.target.checked})} className="w-4 h-4 cursor-pointer accent-[hsl(var(--accent))]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Approved Sender ID (e.g. Greenwood)</label>
                    <input type="text" value={notifications.smsSenderId} onChange={e => setNotifications({...notifications, smsSenderId: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => handleSaveChanges('Notifications')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save Dispatch Rules
                </button>
              </div>
            </div>
          )}

          {/* User Roles & Permissions */}
          {activeTab === 'roles' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Users Roles &amp; Permissions (RBAC)</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Manage user levels access control lists. School Admin cannot edit system-protected roles.</p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-white transition-all text-xs font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Clone Custom Role
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                      <th className="text-left py-3 px-2">Role Name</th>
                      <th className="text-left py-3 px-2">Role Type</th>
                      <th className="text-left py-3 px-2">Assigned Accounts</th>
                      <th className="text-left py-3 px-2">Default Clearance Scope</th>
                      <th className="text-right py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRoles.map(r => (
                      <tr key={r.role} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.3)] transition-colors">
                        <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{r.role}</td>
                        <td className="py-3 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${r.type === 'System Protected' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-500/10 text-zinc-400'}`}>{r.type}</span>
                        </td>
                        <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{r.users} active</td>
                        <td className="py-3 px-2 text-[hsl(var(--text-tertiary))] font-mono">{r.permissions}</td>
                        <td className="py-3 px-2 text-right">
                          <button className="text-[hsl(var(--accent))] hover:underline font-bold">Edit permissions</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Password & Security policies */}
          {activeTab === 'security' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">System Security &amp; Password Policies</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configure credentials strength thresholds. Platform-level minimum settings supersede local overrides.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Minimum Password Length (Platform min: 8)</label>
                  <input type="number" value={security.minPasswordLength} onChange={e => setSecurity({...security, minPasswordLength: parseInt(e.target.value)})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Force Password Expiry Cycle</label>
                  <select value={security.passwordExpiry} onChange={e => setSecurity({...security, passwordExpiry: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>Never Expire</option>
                    <option>30 Days</option>
                    <option>90 Days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">MFA Authentication Code *</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>Enforced on Admin/Staff roles only</option>
                    <option>Enforced on all roles globally</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Session Idle Timeout *</label>
                  <select value={security.sessionTimeout} onChange={e => setSecurity({...security, sessionTimeout: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>60 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Failed Lockout Limit</label>
                  <input type="number" value={security.lockoutAttempts} onChange={e => setSecurity({...security, lockoutAttempts: parseInt(e.target.value)})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => handleSaveChanges('Security Policies')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save Security Policies
                </button>
              </div>
            </div>
          )}

          {/* Feature Modules Panel */}
          {activeTab === 'modules' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Licensed Feature Modules</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Enable or disable core functional desks. Hostel &amp; Transport require Enterprise level add-ons.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'studentManagement', label: 'Student Lifecycle Management (SLM)', desc: 'Full application-to-alumni workflows' },
                  { key: 'attendance', label: 'Biometric Attendance & Logs', desc: 'Daily logs & clocking integrations' },
                  { key: 'finance', label: 'Consolidated Sibling Billing Desk', desc: 'Fee collections and discount metrics' },
                  { key: 'examinations', label: 'Examination & Gradebooks Desk', desc: 'Weighted scores entry and report cards' },
                  { key: 'lms', label: 'LMS Homework Assignments Portal', desc: 'Online classes syllabus coverage' },
                  { key: 'library', label: 'Library Cataloguing & Auditing', desc: 'Books checkouts tracking' },
                  { key: 'hostel', label: 'Hostel Allocation (Add-on locked)', desc: 'Locked under current subscription plan tier', locked: true },
                  { key: 'transport', label: 'Transport Fleet Tracking (Add-on locked)', desc: 'Locked under current subscription plan tier', locked: true }
                ].map(mod => (
                  <div key={mod.key} className={`p-4 rounded-xl border flex items-start justify-between ${mod.locked ? 'bg-[hsl(var(--bg-tertiary)/0.4)] border-amber-500/20 text-[hsl(var(--text-tertiary))]' : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))]'}`}>
                    <div className="max-w-[80%]">
                      <p className="text-xs font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                        {mod.label} {mod.locked && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      </p>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1 leading-snug">{mod.desc}</p>
                    </div>
                    {!mod.locked && (
                      <input
                        type="checkbox"
                        checked={modules[mod.key as keyof typeof modules]}
                        onChange={e => setModules({...modules, [mod.key]: e.target.checked})}
                        className="w-4 h-4 cursor-pointer accent-[hsl(var(--accent))] mt-0.5"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => handleSaveChanges('Modules')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save Active Modules
                </button>
              </div>
            </div>
          )}

          {/* AI Settings Panel */}
          {activeTab === 'ai' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">AI Copilot Configurations</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Control automated data access and prompt histories storage limits.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--bg-tertiary)/0.3)] border border-[hsl(var(--border))]">
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Enable School Operations Copilot</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Activate AI analytics, predictions, and report generation engines.</p>
                  </div>
                  <input type="checkbox" checked={aiSettings.aiEnabled} onChange={e => setAiSettings({...aiSettings, aiEnabled: e.target.checked})} className="w-4 h-4 cursor-pointer accent-[hsl(var(--accent))]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Prompt history retention period</label>
                    <select value={aiSettings.promptHistoryRetention} onChange={e => setAiSettings({...aiSettings, promptHistoryRetention: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                      <option>7 Days</option>
                      <option>30 Days</option>
                      <option>90 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Human review authorization requirements</label>
                    <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                      <option>Required for all AI-generated actions</option>
                      <option>Bypass for minor notice templates</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => handleSaveChanges('AI Configurations')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save AI Copilot Settings
                </button>
              </div>
            </div>
          )}

          {/* Backup & recovery panel */}
          {activeTab === 'backup' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Backup, Export &amp; Disaster Recovery</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Extract tenant datasets, download rosters, or review system restore points.</p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Last Database Backup: Today, 03:00 AM</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Automated PostgreSQL snapshot status: Healthy &amp; Encrypted.</p>
                </div>
                <button onClick={() => alert('Manual database backup request sent to platform super admin.')} className="px-3.5 py-2 text-[10px] font-bold bg-[hsl(var(--accent))] text-white rounded-lg hover:opacity-95">Trigger Manual Backup</button>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider">Available Data Export Formats</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 border border-[hsl(var(--border))] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Export Full Student Roster</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">Contains medical records, contact profiles, and grade transcripts.</p>
                    </div>
                    <button className="p-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--accent))]"><Download className="w-4 h-4" /></button>
                  </div>
                  <div className="p-4 border border-[hsl(var(--border))] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[hsl(var(--text-primary))]">Export Staff Attendance Ledger</p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">CSV report detailing clock-in times and leaves logs.</p>
                    </div>
                    <button className="p-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--accent))]"><Download className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs panel */}
          {activeTab === 'audit' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Security Audit Logs</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Searchable chronological registry of administrative settings changes.</p>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    placeholder="Search logs actions or modules..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-semibold">
                      <th className="py-2.5 px-2">Timestamp</th>
                      <th className="py-2.5 px-2">Actor Name</th>
                      <th className="py-2.5 px-2">Action Description</th>
                      <th className="py-2.5 px-2">Settings Module</th>
                      <th className="py-2.5 px-2">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-[hsl(var(--border))/0.4] hover:bg-[hsl(var(--bg-tertiary)/0.2)] transition-colors">
                        <td className="py-3 px-2 font-mono text-[hsl(var(--text-tertiary))]">{log.time}</td>
                        <td className="py-3 px-2 font-bold text-[hsl(var(--text-primary))]">{log.actor}</td>
                        <td className="py-3 px-2 text-[hsl(var(--text-secondary))]">{log.action}</td>
                        <td className="py-3 px-2"><span className="px-1.5 py-0.5 rounded bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] text-[9px] font-bold uppercase">{log.module}</span></td>
                        <td className="py-3 px-2 text-[hsl(var(--text-tertiary))] font-mono">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div className="glass-card p-6 border border-[hsl(var(--border))] space-y-6 rounded-2xl animate-fade-in">
              <div className="border-b border-[hsl(var(--border))] pb-4">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Advanced Customization Formats</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Configure automated ID generators, billing codes prefixes, and receipt numbering models.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Student ID Code FormatPrefix</label>
                  <input type="text" defaultValue="STU-YYYY-[ID]" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Staff ID Code FormatPrefix</label>
                  <input type="text" defaultValue="STF-YYYY-[ID]" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Invoice Code Prefix</label>
                  <input type="text" defaultValue="INV-YYYY-[ID]" className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[hsl(var(--border))/0.5] pt-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Default Date Format</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>YYYY-MM-DD</option>
                    <option>DD/MM/YYYY</option>
                    <option>MM-DD-YYYY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Default Time Format</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none">
                    <option>24 Hour (e.g. 14:30)</option>
                    <option>12 Hour AM/PM (e.g. 02:30 PM)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[hsl(var(--border))]">
                <button onClick={() => handleSaveChanges('Advanced Settings')} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save Advanced Formats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }// Inline fallback for icon import error prevention
function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
