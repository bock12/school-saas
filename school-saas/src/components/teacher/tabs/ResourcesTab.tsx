'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { BookMarked, Search, ExternalLink, Download, BookOpen, FileText, Video, Globe } from 'lucide-react';

type ResourceType = 'pdf' | 'video' | 'website' | 'document' | 'textbook';

const typeConfig: Record<ResourceType, { icon: React.ElementType; color: string; bg: string }> = {
  pdf:      { icon: FileText,   color: 'text-red-400',     bg: 'bg-red-500/15' },
  video:    { icon: Video,      color: 'text-purple-400',  bg: 'bg-purple-500/15' },
  website:  { icon: Globe,      color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  document: { icon: FileText,   color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  textbook: { icon: BookOpen,   color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
};

const resources = [
  { id: '1', title: 'WAEC Mathematics Syllabus 2025/2026', type: 'pdf' as ResourceType, subject: 'Mathematics', level: 'SS', description: 'Official WAEC curriculum guide for Senior Secondary Mathematics', url: '#', featured: true },
  { id: '2', title: 'Khan Academy — Algebra & Functions', type: 'website' as ResourceType, subject: 'Mathematics', level: 'All', description: 'Free online algebra resources with videos and practice problems', url: 'https://khanacademy.org', featured: true },
  { id: '3', title: 'New General Mathematics SS1–SS3', type: 'textbook' as ResourceType, subject: 'Mathematics', level: 'SS', description: 'Core recommended textbook series for Nigerian secondary schools', url: '#', featured: false },
  { id: '4', title: 'Introduction to Further Mathematics (Video)', type: 'video' as ResourceType, subject: 'Further Mathematics', level: 'SS3', description: 'Comprehensive video lecture covering further maths concepts', url: '#', featured: false },
  { id: '5', title: 'NMC Professional Standards for Teachers', type: 'document' as ResourceType, subject: 'CPD', level: 'All', description: 'Nigerian professional teaching standards and CPD framework', url: '#', featured: false },
  { id: '6', title: 'Differentiated Instruction Strategies Guide', type: 'pdf' as ResourceType, subject: 'Pedagogy', level: 'All', description: 'Research-based guide for teaching mixed-ability classrooms', url: '#', featured: false },
  { id: '7', title: 'Desmos Graphing Calculator', type: 'website' as ResourceType, subject: 'Mathematics', level: 'All', description: 'Free online graphing tool excellent for teaching coordinate geometry', url: 'https://desmos.com', featured: true },
  { id: '8', title: 'GeoGebra — Interactive Mathematics', type: 'website' as ResourceType, subject: 'Mathematics', level: 'All', description: 'Dynamic mathematics software for geometry, algebra, statistics', url: 'https://geogebra.org', featured: true },
];

const levels = ['All', 'JS', 'SS', 'SS1', 'SS2', 'SS3'];
const subjects = ['All Subjects', 'Mathematics', 'Further Mathematics', 'Pedagogy', 'CPD'];

export function ResourcesTab({ teacher }: { teacher: TeacherData }) {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [levelFilter, setLevelFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === 'All Subjects' || r.subject === subjectFilter;
    const matchLevel = levelFilter === 'All' || r.level === levelFilter || r.level === 'All';
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchSubject && matchLevel && matchType;
  });

  const featured = resources.filter((r) => r.featured);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Resources & Library</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">Curated teaching materials, tools, and professional development resources</p>
      </div>

      {/* Featured Resources */}
      <div>
        <p className="text-xs font-black text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">⭐ Featured Tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {featured.map((r) => {
            const cfg = typeConfig[r.type];
            const Icon = cfg.icon;
            return (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                className="glass-card rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-xs font-black text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))] transition-colors line-clamp-2">{r.title}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{r.subject}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-[hsl(var(--text-tertiary))] mt-auto" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
        {[
          { label: 'Subject', value: subjectFilter, options: subjects, onChange: setSubjectFilter },
          { label: 'Level', value: levelFilter, options: levels, onChange: setLevelFilter },
        ].map((ctrl) => (
          <div key={ctrl.label} className="flex items-center gap-2">
            <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">{ctrl.label}:</label>
            <select value={ctrl.value} onChange={(e) => ctrl.onChange(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none">
              {ctrl.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={() => setTypeFilter('all')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${typeFilter === 'all' ? 'bg-[hsl(var(--accent))] text-white' : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}>All</button>
          {(Object.keys(typeConfig) as ResourceType[]).map((t) => {
            const cfg = typeConfig[t];
            const Icon = cfg.icon;
            return (
              <button key={t} onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${typeFilter === t ? `${cfg.bg} ${cfg.color}` : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]'}`}>
                <Icon className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((r) => {
          const cfg = typeConfig[r.type];
          const Icon = cfg.icon;
          return (
            <div key={r.id} className="glass-card rounded-2xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-black text-[hsl(var(--text-primary))] leading-snug">{r.title}</p>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--accent))] flex-shrink-0 transition-colors">
                      {r.type === 'pdf' || r.type === 'document' || r.type === 'textbook' ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    </a>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 leading-relaxed">{r.description}</p>
                  <div className="flex gap-1.5 mt-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{r.subject}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{r.level}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${cfg.bg} ${cfg.color}`}>{r.type}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
