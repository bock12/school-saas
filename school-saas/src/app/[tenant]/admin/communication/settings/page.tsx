'use client';

import { useState } from 'react';
import { Settings, Save } from 'lucide-react';

export default function CommunicationSettingsPage() {
  const [twilioSid, setTwilioSid] = useState('AC88492019a8bc8f9024f');
  const [senderEmail, setSenderEmail] = useState('no-reply@schoolsaas.edu');

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Communication Gateway Settings</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure credentials for external SMS provider failovers, SMTP servers, and define school-wide quiet hours.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>

      <div className="glass-card p-5 space-y-6 max-w-xl">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Twilio SMS Gateway Configuration</h3>
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Account SID</label>
            <input
              type="text"
              value={twilioSid}
              onChange={(e) => setTwilioSid(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">SMTP Outbound Mail Settings</h3>
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5">Verified Sender Email</label>
            <input
              type="text"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
