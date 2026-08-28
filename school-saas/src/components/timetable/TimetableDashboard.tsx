'use client';

import { useState } from 'react';
import {
  Calendar, LayoutGrid, Shield, Settings, X, Sparkles, Zap, CheckCircle2
} from 'lucide-react';
import { TimetableList } from './TimetableList';
import { TimetableTemplates } from './TimetableTemplates';
import { TimetableRules } from './TimetableRules';

type Tab = 'timetables' | 'templates' | 'rules';

interface AISettings {
  strictness: 'relaxed' | 'balanced' | 'strict';
  prioritizeTeacherAvailability: boolean;
  prioritizeRoomCapacity: boolean;
  allowConsecutiveSubjects: boolean;
  optimizationGoal: 'balance' | 'compact' | 'spread';
}

const DEFAULT_AI_SETTINGS: AISettings = {
  strictness: 'balanced',
  prioritizeTeacherAvailability: true,
  prioritizeRoomCapacity: true,
  allowConsecutiveSubjects: false,
  optimizationGoal: 'balance',
};

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'timetables', label: 'Timetables',          icon: Calendar,    desc: 'Manage and generate class schedules' },
  { id: 'templates',  label: 'Templates',            icon: LayoutGrid,  desc: 'Define time-slot structures and shifts' },
  { id: 'rules',      label: 'Rules & Constraints',  icon: Shield,      desc: 'Configure scheduling constraint priorities' },
];

export function TimetableDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('timetables');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [pendingSettings, setPendingSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);

  const openSettings = () => {
    setPendingSettings({ ...aiSettings });
    setIsSettingsOpen(true);
  };

  const saveSettings = () => {
    setAiSettings({ ...pendingSettings });
    setIsSettingsOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent)/0.12)] border border-[hsl(var(--accent)/0.25)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[hsl(var(--accent))]" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">AI Timetable Generator</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-secondary))] max-w-xl">
            Generate conflict-free class schedules using AI. Define templates, configure constraints, and publish optimized timetables for all classes.
          </p>
        </div>
        <button
          onClick={openSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] transition-all shrink-0"
        >
          <Settings className="w-4 h-4" />
          AI Generation Settings
        </button>
      </div>

      {/* AI Settings Summary Bar */}
      <div className="glass-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
            <span className="text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">AI Engine</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              aiSettings.strictness === 'strict'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : aiSettings.strictness === 'relaxed'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.25)]'
            }`}>
              {aiSettings.strictness} mode
            </span>
            {aiSettings.prioritizeTeacherAvailability && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />Teacher Availability
              </span>
            )}
            {aiSettings.prioritizeRoomCapacity && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />Room Capacity
              </span>
            )}
            {!aiSettings.allowConsecutiveSubjects && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />No Repeat Subjects
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] border border-[hsl(var(--border))]">
              Goal: {aiSettings.optimizationGoal}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] w-full sm:w-fit overflow-x-auto no-scrollbar">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] shadow-sm border border-[hsl(var(--border))]'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-secondary)/0.5)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'timetables' && <TimetableList />}
        {activeTab === 'templates'  && <TimetableTemplates />}
        {activeTab === 'rules'      && <TimetableRules />}
      </div>

      {/* AI Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card p-6 shadow-2xl border border-[hsl(var(--border))] rounded-2xl overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent)/0.12)] border border-[hsl(var(--accent)/0.25)] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[hsl(var(--accent))]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[hsl(var(--text-primary))]">AI Generation Settings</h2>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">Configure the AI scheduling engine constraints</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Strictness */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">Generation Strictness</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['relaxed', 'balanced', 'strict'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setPendingSettings(p => ({ ...p, strictness: s }))}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        pendingSettings.strictness === s
                          ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] shadow-sm'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)]'
                      }`}
                    >
                      <div className="text-sm font-bold capitalize text-[hsl(var(--text-primary))]">{s}</div>
                      <div className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">
                        {s === 'relaxed' ? 'Faster, less strict' : s === 'strict' ? 'Zero conflicts' : 'Best balance'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">Active Constraints</label>
                <div className="space-y-2">
                  {[
                    { key: 'prioritizeTeacherAvailability' as const, label: 'Teacher Availability', desc: 'Prevent double-booking teachers' },
                    { key: 'prioritizeRoomCapacity' as const,        label: 'Room Capacity',         desc: 'Match class sizes to room capacity' },
                    { key: 'allowConsecutiveSubjects' as const,      label: 'Allow Consecutive Subjects', desc: 'Allow same subject back-to-back' },
                  ].map(({ key, label, desc }) => (
                    <button
                      key={key}
                      onClick={() => setPendingSettings(p => ({ ...p, [key]: !p[key] }))}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--bg-tertiary)/0.5)] transition-all"
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{label}</p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))]">{desc}</p>
                      </div>
                      <div className={`relative w-10 h-5 rounded-full transition-all shrink-0 ml-3 ${pendingSettings[key] ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${pendingSettings[key] ? 'left-[22px]' : 'left-0.5'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optimization Goal */}
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">Optimization Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'balance', label: 'Balanced', desc: 'Even distribution' },
                    { id: 'compact', label: 'Compact',  desc: 'Minimize gaps' },
                    { id: 'spread',  label: 'Spread',   desc: 'Maximize breaks' },
                  ] as const).map(g => (
                    <button
                      key={g.id}
                      onClick={() => setPendingSettings(p => ({ ...p, optimizationGoal: g.id }))}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        pendingSettings.optimizationGoal === g.id
                          ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] shadow-sm'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)]'
                      }`}
                    >
                      <div className="text-sm font-bold text-[hsl(var(--text-primary))]">{g.label}</div>
                      <div className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 h-9 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 h-9 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
