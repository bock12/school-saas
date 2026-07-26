'use client';

import { useState } from 'react';
import { X, Shield, Eye, EyeOff, Globe, Users, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { updateChatPrivacySettings } from './actions';

const STATUS_PRESETS = [
  'Available 👋', 'In class 📚', 'Teaching 👨‍🏫', 'Exam Mode ✏️',
  'Studying 📖', 'Out of office ✈️', 'Focus Mode 🤫', 'In a meeting 📅',
  'On break ☕', 'Do not disturb 🔕',
];

type LastSeenVisibility = 'everyone' | 'contacts' | 'nobody';
type OnlineVisibility = 'everyone' | 'same_as_last_seen' | 'nobody';

interface ChatPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus: string;
  initialLastSeen: LastSeenVisibility;
  initialOnline: OnlineVisibility;
  onSettingsSaved?: (settings: { statusMessage: string; lastSeenVisibility: LastSeenVisibility; onlineVisibility: OnlineVisibility }) => void;
}

export default function ChatPrivacyModal({
  isOpen,
  onClose,
  initialStatus,
  initialLastSeen,
  initialOnline,
  onSettingsSaved,
}: ChatPrivacyModalProps) {
  const [statusMessage, setStatusMessage] = useState(initialStatus);
  const [lastSeen, setLastSeen] = useState<LastSeenVisibility>(initialLastSeen);
  const [online, setOnline] = useState<OnlineVisibility>(initialOnline);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customStatusDraft, setCustomStatusDraft] = useState('');

  if (!isOpen) return null;

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    await updateChatPrivacySettings({
      lastSeenVisibility: lastSeen,
      onlineVisibility: online,
      statusMessage,
    });
    setIsSaving(false);
    setSaved(true);
    onSettingsSaved?.({ statusMessage, lastSeenVisibility: lastSeen, onlineVisibility: online });
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  }

  const visibilityOptions: { value: string; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'everyone', label: 'Everyone', icon: <Globe className="w-4 h-4" />, desc: 'All school users can see this' },
    { value: 'contacts', label: 'My Contacts', icon: <Users className="w-4 h-4" />, desc: 'Only people you\'ve chatted with' },
    { value: 'nobody', label: 'Nobody', icon: <EyeOff className="w-4 h-4" />, desc: 'Hidden from everyone' },
  ];

  const onlineOptions: { value: string; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'everyone', label: 'Everyone', icon: <Globe className="w-4 h-4" />, desc: 'Show online status to all' },
    { value: 'same_as_last_seen', label: 'Same as Last Seen', icon: <Clock className="w-4 h-4" />, desc: 'Match your last seen setting' },
    { value: 'nobody', label: 'Nobody', icon: <EyeOff className="w-4 h-4" />, desc: 'Always appear offline' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[hsl(var(--bg-primary))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--bg-secondary))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[hsl(var(--text-primary))]">Privacy & Status</h3>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-medium uppercase tracking-wider">Control your messaging presence</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Status Message */}
          <section>
            <h4 className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Status Message
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {STATUS_PRESETS.map(p => (
                <button key={p} onClick={() => setStatusMessage(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    statusMessage === p
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                      : 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-emerald-400'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customStatusDraft}
                onChange={e => setCustomStatusDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customStatusDraft.trim()) {
                    setStatusMessage(customStatusDraft.trim());
                    setCustomStatusDraft('');
                  }
                }}
                placeholder="Custom status... (press Enter)"
                className="flex-1 h-9 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            {statusMessage && (
              <p className="mt-2 text-[10px] text-emerald-500 font-medium">
                Current: <span className="font-bold">{statusMessage}</span>
              </p>
            )}
          </section>

          {/* Last Seen */}
          <section>
            <h4 className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              Last Seen Visibility
            </h4>
            <div className="space-y-2">
              {visibilityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLastSeen(opt.value as LastSeenVisibility)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    lastSeen === opt.value
                      ? 'border-emerald-500 bg-emerald-500/8 shadow-sm'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:border-[hsl(var(--accent)/0.4)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    lastSeen === opt.value ? 'bg-emerald-600 text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]'
                  }`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${lastSeen === opt.value ? 'text-emerald-600' : 'text-[hsl(var(--text-primary))]'}`}>{opt.label}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    lastSeen === opt.value ? 'border-emerald-600 bg-emerald-600' : 'border-[hsl(var(--border))]'
                  }`}>
                    {lastSeen === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Online Status */}
          <section>
            <h4 className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wide mb-3 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              Online Status Visibility
            </h4>
            <div className="space-y-2">
              {onlineOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setOnline(opt.value as OnlineVisibility)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    online === opt.value
                      ? 'border-blue-500 bg-blue-500/8 shadow-sm'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:border-[hsl(var(--accent)/0.4)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    online === opt.value ? 'bg-blue-600 text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))]'
                  }`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${online === opt.value ? 'text-blue-600' : 'text-[hsl(var(--text-primary))]'}`}>{opt.label}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate">{opt.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    online === opt.value ? 'border-blue-600 bg-blue-600' : 'border-[hsl(var(--border))]'
                  }`}>
                    {online === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex gap-2">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-primary))] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className={`flex-1 h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-[hsl(var(--accent))] text-white hover:opacity-90'
            } disabled:opacity-60`}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" />
              : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
              : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
