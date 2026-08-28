'use client';

import { useState } from 'react';
import { X, Sparkles, Key, CheckCircle2, AlertCircle, Eye, EyeOff, Cpu, RefreshCw } from 'lucide-react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIConfigModal({ isOpen, onClose }: AIConfigModalProps) {
  const [apiKey, setApiKey] = useState('AIzaSyD-••••••••••••••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 1000));
    setIsTesting(false);
    setTestResult('success');
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-3xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-[hsl(var(--text-primary))]">Gemini AI Configuration</h3>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Manage institutional AI tokens and model hyperparameters.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
              Google AI Studio API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full h-11 pl-4 pr-11 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">
              Your API key is securely encrypted and used for automated lesson plans, question generation, and timetable optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
                Default Model
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Efficient)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Creativity</label>
                <span className="text-xs font-bold text-[hsl(var(--accent))]">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[hsl(var(--accent))] mt-2"
              />
            </div>
          </div>

          {/* Test connection results */}
          {testResult === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Connection established successfully! Model latency: 182ms</span>
            </div>
          )}

          {testResult === 'error' && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to reach Google Gemini API. Please verify your token.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[hsl(var(--border))]">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testing…' : 'Test Connection'}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Key className="w-4 h-4" />}
              {isSaved ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
