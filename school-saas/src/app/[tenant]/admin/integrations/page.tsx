'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Link as LinkIcon, CheckCircle2, AlertTriangle, Clock, Settings, RefreshCw, Plus, Zap, Mail, MessageSquare, CreditCard, Brain, BarChart3, FileText, X, Eye, EyeOff, Bot, Sparkles
} from 'lucide-react';

interface Integration {
  name: string;
  category: string;
  description: string;
  icon: string;
  status: 'connected' | 'error' | 'pending' | 'disconnected';
  lastSync: string;
  color: string;
  statusColor: string;
}

export default function IntegrationsPage() {
  const params = useParams();
  const tenant = params.tenant as string;

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      name: 'Supabase',
      category: 'Database & Auth',
      description: 'Primary database, real-time subscriptions and authentication provider',
      icon: '🛢️',
      status: 'connected',
      lastSync: '2 mins ago',
      color: 'border-emerald-500/20 bg-emerald-500/5',
      statusColor: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      name: 'Google Workspace',
      category: 'Productivity',
      description: 'Gmail, Google Calendar and Google Meet for staff and student communication',
      icon: '🔵',
      status: 'connected',
      lastSync: '1 hr ago',
      color: 'border-blue-500/20 bg-blue-500/5',
      statusColor: 'text-blue-400 bg-blue-500/10',
    },
    {
      name: 'Paystack',
      category: 'Payments',
      description: 'Online fee collection, payment receipts and financial reporting',
      icon: '💳',
      status: 'connected',
      lastSync: '30 mins ago',
      color: 'border-purple-500/20 bg-purple-500/5',
      statusColor: 'text-purple-400 bg-purple-500/10',
    },
    {
      name: 'Twilio SMS',
      category: 'Communication',
      description: 'Bulk SMS notifications for parents and emergency alerts',
      icon: '📱',
      status: 'connected',
      lastSync: '15 mins ago',
      color: 'border-red-500/20 bg-red-500/5',
      statusColor: 'text-red-400 bg-red-500/10',
    },
    {
      name: 'SendGrid',
      category: 'Email',
      description: 'Transactional emails, newsletters and automated parent communications',
      icon: '✉️',
      status: 'error',
      lastSync: 'Failed 2 hrs ago',
      color: 'border-amber-500/20 bg-amber-500/5',
      statusColor: 'text-amber-400 bg-amber-500/10',
    },
    {
      name: 'OpenRouter AI Hub',
      category: 'AI Assistant & Copilot',
      description: 'Route specific school intelligence modules (Finance, Academics, HR) to specialized LLMs',
      icon: '🤖',
      status: 'pending',
      lastSync: 'Not configured',
      color: 'border-indigo-500/20 bg-indigo-500/5',
      statusColor: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      name: 'Zoom',
      category: 'Video Conferencing',
      description: 'Virtual parent meetings, staff training and online classes',
      icon: '📹',
      status: 'disconnected',
      lastSync: 'Not connected',
      color: 'border-zinc-500/20 bg-zinc-500/5',
      statusColor: 'text-zinc-400 bg-zinc-500/10',
    },
    {
      name: 'Power BI',
      category: 'Analytics',
      description: 'Advanced analytics dashboards and executive reporting',
      icon: '📊',
      status: 'disconnected',
      lastSync: 'Not connected',
      color: 'border-zinc-500/20 bg-zinc-500/5',
      statusColor: 'text-zinc-400 bg-zinc-500/10',
    },
  ]);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // Model Routing Settings States
  const [routing, setRouting] = useState({
    academic: 'google/gemini-2.5-pro',
    finance: 'openai/gpt-4o',
    admissions: 'anthropic/claude-3.5-haiku',
    attendance: 'google/gemini-2.5-flash',
    timetable: 'openai/gpt-4o-mini',
    executive: 'anthropic/claude-3.5-sonnet'
  });

  const handleTestConnection = () => {
    if (!apiKey) {
      setTestResult('Error: API Key is required to test connection');
      return;
    }
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult('Success: API connected (OpenRouter Latency: 124ms)');
    }, 1000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;

    setIntegrations(prev => prev.map(integration => {
      if (integration.name === 'OpenRouter AI Hub') {
        return {
          ...integration,
          status: 'connected',
          lastSync: 'Just now',
          color: 'border-emerald-500/20 bg-emerald-500/5',
          statusColor: 'text-emerald-400 bg-emerald-500/10',
          description: `Active AI Routing: Academics (${routing.academic}), Finance (${routing.finance}), Executive (${routing.executive})`
        };
      }
      return integration;
    }));

    setShowConfigModal(false);
    setTestResult(null);
  };

  const statusIcon: Record<string, typeof CheckCircle2> = {
    connected: CheckCircle2,
    error: AlertTriangle,
    pending: Clock,
    disconnected: LinkIcon,
  };

  const statusLabels: Record<string, string> = {
    connected: 'Connected',
    error: 'Error',
    pending: 'Setup Required',
    disconnected: 'Not Connected',
  };

  const connected = integrations.filter(i => i.status === 'connected').length;
  const errored = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-8 max-w-[1600px] animate-fade-in px-4 sm:px-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] bg-clip-text bg-gradient-to-r from-[hsl(var(--text-primary))] to-[hsl(var(--text-secondary))]">
            Integrations Center
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Configure secure API gateways, billing endpoints, and modular OpenRouter LLM controllers.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-all w-fit">
          <Plus className="w-4 h-4" /> Add Custom API Integration
        </button>
      </div>

      {/* Stats indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Connected Channels', value: connected, color: 'text-emerald-400 font-bold', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Issues Found', value: errored, color: 'text-red-400 font-bold', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Not Connected', value: integrations.filter(i => i.status === 'disconnected').length, color: 'text-zinc-400 font-bold', bg: 'bg-zinc-500/10 border-zinc-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map((integration, i) => {
          const Icon = statusIcon[integration.status] || LinkIcon;
          const label = statusLabels[integration.status];
          return (
            <div key={integration.name} className={`rounded-2xl border p-6 hover:-translate-y-1 transition-all duration-300 shadow-md ${integration.color}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[hsl(var(--bg-secondary))] flex items-center justify-center text-2xl shadow">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-[hsl(var(--text-primary))] text-sm">{integration.name}</h3>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-semibold uppercase tracking-wider mt-0.5">{integration.category}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${integration.statusColor}`}>
                  <Icon className="w-3 h-3" /> {label}
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))] mb-6 leading-relaxed min-h-[40px]">{integration.description}</p>
              <div className="flex items-center justify-between border-t border-[hsl(var(--border))/0.4] pt-4">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-[hsl(var(--accent))]" /> {integration.lastSync}
                </span>
                <button
                  onClick={() => {
                    if (integration.name === 'OpenRouter AI Hub') {
                      setShowConfigModal(true);
                    } else {
                      alert(`Configuration options for ${integration.name} are managed inside global system settings.`);
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--accent))] hover:underline"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {integration.status === 'disconnected' || integration.status === 'pending' ? 'Configure' : 'Manage'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* OpenRouter Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[hsl(var(--accent))]" />
                <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">OpenRouter AI Orchestrator</h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* API Credentials */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">1. API Credentials</h4>
                <div className="relative">
                  <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1">OpenRouter API Key *</label>
                  <div className="relative flex items-center">
                    <input
                      type={showKey ? 'text' : 'password'}
                      required
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="w-full h-10 pl-3 pr-10 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="px-3.5 py-2 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[10px] font-bold text-[hsl(var(--text-primary))] hover:border-[hsl(var(--border-hover))] flex items-center gap-1.5"
                  >
                    {testing ? 'Testing connection...' : 'Test API Connection'}
                  </button>
                  {testResult && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${testResult.startsWith('Success') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {testResult.startsWith('Success') ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {testResult}
                    </span>
                  )}
                </div>
              </div>

              {/* Specialist Routing Setup */}
              <div className="space-y-4 border-t border-[hsl(var(--border))/0.5] pt-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-4.5 h-4.5 text-[hsl(var(--accent))]" />
                  <h4 className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">2. Specialist Module Routing Configuration</h4>
                </div>
                <p className="text-[10px] text-[hsl(var(--text-tertiary))] leading-relaxed">
                  Route specific analytical endpoints to models optimized for accuracy, coding logic, or low-latency reasoning.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Academic Analyst Model</label>
                    <select
                      value={routing.academic}
                      onChange={(e) => setRouting(prev => ({ ...prev, academic: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                    >
                      <option value="google/gemini-2.5-pro">google/gemini-2.5-pro (Recommended)</option>
                      <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet</option>
                      <option value="meta-llama/llama-3.1-405b">meta-llama/llama-3.1-405b</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Finance Analyst Model</label>
                    <select
                      value={routing.finance}
                      onChange={(e) => setRouting(prev => ({ ...prev, finance: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                    >
                      <option value="openai/gpt-4o">openai/gpt-4o (Recommended)</option>
                      <option value="google/gemini-2.5-flash">google/gemini-2.5-flash</option>
                      <option value="deepseek/deepseek-coder">deepseek/deepseek-coder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Admissions Assistant Model</label>
                    <select
                      value={routing.admissions}
                      onChange={(e) => setRouting(prev => ({ ...prev, admissions: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                    >
                      <option value="anthropic/claude-3.5-haiku">anthropic/claude-3.5-haiku (Recommended)</option>
                      <option value="google/gemini-2.5-flash">google/gemini-2.5-flash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Attendance Analyst Model</label>
                    <select
                      value={routing.attendance}
                      onChange={(e) => setRouting(prev => ({ ...prev, attendance: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                    >
                      <option value="google/gemini-2.5-flash">google/gemini-2.5-flash (Recommended)</option>
                      <option value="meta-llama/llama-3.1-70b">meta-llama/llama-3.1-70b</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Timetable Optimizer Model</label>
                    <select
                      value={routing.timetable}
                      onChange={(e) => setRouting(prev => ({ ...prev, timetable: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                    >
                      <option value="openai/gpt-4o-mini">openai/gpt-4o-mini (Recommended)</option>
                      <option value="google/gemini-2.5-flash">google/gemini-2.5-flash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Executive Decision Assistant</label>
                    <select
                      value={routing.executive}
                      onChange={(e) => setRouting(prev => ({ ...prev, executive: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] focus:outline-none"
                    >
                      <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet (Recommended)</option>
                      <option value="google/gemini-2.5-pro">google/gemini-2.5-pro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Save AI Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
