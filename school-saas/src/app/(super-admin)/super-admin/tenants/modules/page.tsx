'use client';

import { Blocks, Search, ToggleRight, ToggleLeft } from 'lucide-react';
import { useState } from 'react';

const mockModules = [
  { id: 'core', name: 'Core SIS', desc: 'Student info, attendance, grades', isGlobal: true, status: true },
  { id: 'finance', name: 'Finance & Billing', desc: 'Invoices, fee collection, payroll', isGlobal: false, status: true },
  { id: 'lms', name: 'Learning Management', desc: 'Assignments, quizzes, course content', isGlobal: false, status: true },
  { id: 'transport', name: 'Transport & Fleet', desc: 'Bus tracking, routes, fees', isGlobal: false, status: false },
  { id: 'ai', name: 'AI Study Assistant', desc: 'LLM tutoring and insights', isGlobal: false, status: true },
];

export default function ModulesPage() {
  const [modules, setModules] = useState(mockModules);
  const [search, setSearch] = useState('');

  const toggleModule = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, status: !m.status } : m));
  };

  const filtered = modules.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Blocks className="w-7 h-7 text-[hsl(var(--accent))]" />
            Feature Modules
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
            Enable or disable SaaS feature modules globally across the platform.
          </p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          <input 
            type="text" 
            placeholder="Search modules..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg pl-9 pr-4 py-2 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(mod => (
          <div key={mod.id} className="glass-card p-5 border border-[hsl(var(--border))] rounded-2xl flex items-start justify-between group">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[hsl(var(--text-primary))]">{mod.name}</h3>
                {mod.isGlobal && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] uppercase font-bold border border-[hsl(var(--border))]">Core</span>}
              </div>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">{mod.desc}</p>
            </div>
            
            <button 
              onClick={() => toggleModule(mod.id)} 
              disabled={mod.isGlobal}
              className={`transition-colors ${mod.isGlobal ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
              {mod.status ? (
                <ToggleRight className="w-8 h-8 text-[hsl(var(--accent))]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-[hsl(var(--text-tertiary))]" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
