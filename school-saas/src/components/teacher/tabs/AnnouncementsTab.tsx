'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Megaphone, Plus, X, Eye, Users, Clock, Send } from 'lucide-react';

type AudienceType = 'all' | 'class' | 'subject' | 'parents' | 'staff';

const audienceConfig: Record<AudienceType, { label: string; color: string; bg: string }> = {
  all:     { label: 'All Students',  color: 'text-indigo-400',  bg: 'bg-indigo-500/15' },
  class:   { label: 'Class',         color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  subject: { label: 'Subject Group', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  parents: { label: 'Parents',       color: 'text-purple-400',  bg: 'bg-purple-500/15' },
  staff:   { label: 'Staff',         color: 'text-amber-400',   bg: 'bg-amber-500/15' },
};

const announcements = [
  { id: '1', title: 'Mathematics Assignment #8 — Due This Friday', audience: 'class' as AudienceType, class: 'SS2A', body: 'Dear students, please note that Assignment #8 on Coordinate Geometry is due this Friday, August 9th. Submit via your class folder. Late submissions will not be accepted.', date: '2026-08-05', views: 30, priority: 'high' },
  { id: '2', title: 'Mid-Term Exam Timetable Released', audience: 'all' as AudienceType, class: '', body: 'The mid-term examination timetable is now available on the school portal. Ensure you are well prepared. Any clashes should be reported to the class teacher immediately.', date: '2026-08-04', views: 142, priority: 'high' },
  { id: '3', title: 'Recommended Resources for Further Maths', audience: 'subject' as AudienceType, class: 'SS3A', body: 'I have uploaded new study materials for our Further Mathematics class. Please download the "Statistics & Probability" notes from the materials section.', date: '2026-08-03', views: 28, priority: 'normal' },
  { id: '4', title: 'Parent Reminder: Report Collection Day', audience: 'parents' as AudienceType, class: '', body: 'This is a reminder to all parents that Term 2 report cards will be available for collection on August 28th from 9am–3pm. Both parents are encouraged to attend.', date: '2026-08-01', views: 89, priority: 'normal' },
];

export function AnnouncementsTab({ teacher }: { teacher: TeacherData }) {
  const [showForm, setShowForm] = useState(false);
  const [audience, setAudience] = useState<AudienceType>('class');
  const [filter, setFilter] = useState<AudienceType | 'all'>('all');

  const filtered = announcements.filter((a) => filter === 'all' || a.audience === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Announcements</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">Broadcast messages to students, parents, and staff</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold hover:scale-105 transition-all"
          style={{ background: teacher.primaryColor }}
        >
          <Megaphone className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--accent)/0.2)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[hsl(var(--text-primary))]">Create Announcement</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-[hsl(var(--text-tertiary))]" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2">Send To</label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(audienceConfig) as [AudienceType, typeof audienceConfig[AudienceType]][]).map(([type, cfg]) => (
                  <button
                    key={type}
                    onClick={() => setAudience(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${audience === type ? `${cfg.bg} ${cfg.color} ring-1 ring-current` : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            {(audience === 'class' || audience === 'subject') && (
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">
                  {audience === 'class' ? 'Select Class' : 'Select Subject Group'}
                </label>
                <select className="w-full text-sm px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none">
                  {['SS1A', 'SS2A', 'SS2B', 'SS3A', 'JS3A'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Title</label>
              <input placeholder="Announcement title..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-1">Message</label>
              <textarea rows={4} placeholder="Write your announcement..." className="w-full px-3 py-2 text-sm rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] resize-none" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Priority:</label>
              {['normal', 'high'].map((p) => (
                <label key={p} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="radio" name="priority" value={p} defaultChecked={p === 'normal'} className="accent-[hsl(var(--accent))]" />
                  <span className="text-[hsl(var(--text-secondary))] capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: teacher.primaryColor }}>
              <Send className="w-3.5 h-3.5" /> Publish
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}>All</button>
        {(Object.entries(audienceConfig) as [AudienceType, typeof audienceConfig[AudienceType]][]).map(([type, cfg]) => (
          <button
            key={type}
            onClick={() => setFilter(filter === type ? 'all' : type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === type ? `${cfg.bg} ${cfg.color}` : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => {
          const cfg = audienceConfig[ann.audience];
          return (
            <div key={ann.id} className={`glass-card rounded-2xl p-5 ${ann.priority === 'high' ? 'border border-[hsl(var(--accent)/0.2)]' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {ann.priority === 'high' && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-black">HIGH</span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  {ann.class && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{ann.class}</span>}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--text-tertiary))]">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{ann.views}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ann.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <h3 className="font-black text-[hsl(var(--text-primary))] text-sm mb-1.5">{ann.title}</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-3">{ann.body}</p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[hsl(var(--border)/0.5)]">
                <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors font-semibold">
                  <Eye className="w-3 h-3" /> View Full
                </button>
                <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors font-semibold">
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
