'use client';

import { useState } from 'react';
import type { TeacherData } from '../TeacherDashboardContent';
import { Upload, Folder, FileText, Film, Image, Link, Download, Search, Trash2 } from 'lucide-react';

type FileType = 'pdf' | 'ppt' | 'word' | 'video' | 'audio' | 'image' | 'link';

const fileTypeConfig: Record<FileType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pdf:   { icon: FileText, color: 'text-red-400',    bg: 'bg-red-500/15',    label: 'PDF' },
  ppt:   { icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/15', label: 'PowerPoint' },
  word:  { icon: FileText, color: 'text-blue-400',   bg: 'bg-blue-500/15',   label: 'Word' },
  video: { icon: Film,     color: 'text-purple-400', bg: 'bg-purple-500/15', label: 'Video' },
  audio: { icon: FileText, color: 'text-amber-400',  bg: 'bg-amber-500/15',  label: 'Audio' },
  image: { icon: Image,    color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Image' },
  link:  { icon: Link,     color: 'text-cyan-400',   bg: 'bg-cyan-500/15',   label: 'Link' },
};

const materials = [
  { id: '1', name: 'Quadratic Equations Notes.pdf', type: 'pdf' as FileType, class: 'SS2A', subject: 'Mathematics', topic: 'Algebra', week: 'Week 2', size: '2.3 MB', date: '2026-07-28' },
  { id: '2', name: 'Introduction to Trigonometry.ppt', type: 'ppt' as FileType, class: 'SS2B', subject: 'Mathematics', topic: 'Trigonometry', week: 'Week 3', size: '5.1 MB', date: '2026-07-30' },
  { id: '3', name: 'Coordinate Geometry Worksheet.pdf', type: 'pdf' as FileType, class: 'SS3A', subject: 'Further Maths', topic: 'Geometry', week: 'Week 1', size: '1.2 MB', date: '2026-07-25' },
  { id: '4', name: 'Algebra Concept Video.mp4', type: 'video' as FileType, class: 'SS1A', subject: 'Mathematics', topic: 'Algebra', week: 'Week 1', size: '45 MB', date: '2026-07-20' },
  { id: '5', name: 'Statistics Data Sets.xlsx', type: 'word' as FileType, class: 'SS3A', subject: 'Further Maths', topic: 'Statistics', week: 'Week 4', size: '800 KB', date: '2026-08-01' },
  { id: '6', name: 'Khan Academy — Algebra Playlist', type: 'link' as FileType, class: 'All', subject: 'Mathematics', topic: 'Algebra', week: 'Week 2', size: '—', date: '2026-07-22' },
];

export function MaterialsTab({ teacher }: { teacher: TeacherData }) {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<FileType | 'all'>('all');
  const [dragging, setDragging] = useState(false);

  const classes = ['All', 'SS1A', 'SS2A', 'SS2B', 'SS3A', 'JS3A'];
  const filtered = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.topic.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === 'All' || m.class === classFilter || m.class === 'All';
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    return matchSearch && matchClass && matchType;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[hsl(var(--text-primary))]">Teaching Materials</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))]">{materials.length} files · Upload, organize, and share resources</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragging ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.05)]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/0.4)] hover:bg-[hsl(var(--bg-tertiary)/0.3)]'}`}
      >
        <Upload className="w-10 h-10 text-[hsl(var(--text-tertiary))] mx-auto mb-3" />
        <p className="font-black text-[hsl(var(--text-primary))] mb-1">Drop files here or click to upload</p>
        <p className="text-xs text-[hsl(var(--text-tertiary))] mb-4">Supports PDF, PowerPoint, Word, Video, Audio, Images</p>
        <div className="flex flex-wrap justify-center gap-2">
          {(Object.keys(fileTypeConfig) as FileType[]).filter((t) => t !== 'link').map((type) => {
            const cfg = fileTypeConfig[type];
            return (
              <span key={type} className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
            );
          })}
        </div>
        <input type="file" multiple className="hidden" />
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Class:</label>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none">
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as FileType | 'all')} className="text-sm px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none">
            <option value="all">All Types</option>
            {(Object.keys(fileTypeConfig) as FileType[]).map((t) => <option key={t} value={t}>{fileTypeConfig[t].label}</option>)}
          </select>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((file) => {
          const cfg = fileTypeConfig[file.type];
          const Icon = cfg.icon;
          return (
            <div key={file.id} className="glass-card rounded-2xl p-4 group hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[hsl(var(--text-primary))] truncate">{file.name}</p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{file.size} · {new Date(file.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{file.class}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{file.topic}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] font-semibold">{file.week}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors font-semibold">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
