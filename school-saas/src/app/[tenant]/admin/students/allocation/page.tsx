'use client';

import { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

const mockStreams = [
  { id: '1', class: 'Grade 10', section: 'A', stream: 'Science', current: 28, capacity: 30, genderBalance: '14 M / 14 F' },
  { id: '2', class: 'Grade 10', section: 'B', stream: 'Arts', current: 25, capacity: 25, genderBalance: '12 M / 13 F' },
  { id: '3', class: 'Grade 10', section: 'C', stream: 'Commercial', current: 22, capacity: 30, genderBalance: '10 M / 12 F' },
];

export default function ClassAllocationPage() {
  const [allocationMode, setAllocationMode] = useState<'single' | 'bulk' | 'auto'>('single');
  const [capacityOverride, setCapacityOverride] = useState(false);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Class &amp; Resource Allocation</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Manage streams, house allotments, hostel rooms, and classroom capacities.</p>
      </div>

      {/* Mode selection tabs */}
      <div className="glass-card p-1 flex gap-1 w-fit">
        {['single', 'bulk', 'auto'].map((mode) => (
          <button
            key={mode}
            onClick={() => setAllocationMode(mode as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              allocationMode === mode
                ? 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.1)]'
                : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
            }`}
          >
            {mode} allocation
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation forms panel */}
        <div className="lg:col-span-2 space-y-6">
          {allocationMode === 'single' && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Single Student Allocation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 font-semibold">Select Student</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                    <option>Select Student...</option>
                    <option>Amara Johnson (STU-001)</option>
                    <option>David Okafor (STU-002)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 font-semibold">Target Class &amp; Stream</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                    <option>Select Class Section...</option>
                    <option>Grade 10 A (Science Stream) - 28/30</option>
                    <option>Grade 10 B (Arts Stream) - 25/25 (FULL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 font-semibold">House Assignment</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                    <option>Select House...</option>
                    <option>Blue House</option>
                    <option>Red House</option>
                    <option>Green House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 font-semibold">Hostel Assignment</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-secondary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors">
                    <option>Select Hostel block...</option>
                    <option>Nelson Mandela Block - Room 102</option>
                    <option>Kofi Annan Block - Room 204</option>
                  </select>
                </div>
              </div>

              {/* Overrides warnings */}
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 space-y-2">
                <p className="flex items-center gap-1.5 font-medium"><AlertTriangle className="w-4 h-4" /> Capacity Check Warning</p>
                <p className="text-[hsl(var(--text-secondary))]">Assigning to Grade 10 B exceeds class capacity rules. Authorized system administrator override required.</p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={capacityOverride}
                    onChange={(e) => setCapacityOverride(e.target.checked)}
                    className="accent-[hsl(var(--accent))]"
                  /> Force override capacity locks
                </label>
              </div>

              <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-95 transition-opacity">
                Allocate Resources
              </button>
            </div>
          )}

          {allocationMode === 'bulk' && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Bulk Class Allocation</h3>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Download the allocation template spreadsheet, allocate class sections, and upload.</p>
              <div className="border border-dashed border-[hsl(var(--border))] p-6 rounded-xl text-center space-y-3">
                <Layers className="w-8 h-8 text-[hsl(var(--text-tertiary))] mx-auto" />
                <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">Drag &amp; drop allocation roster CSV template here</p>
                <button className="px-4 py-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]">Choose File</button>
              </div>
            </div>
          )}

          {allocationMode === 'auto' && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Smart Auto Allocation Engine</h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">The promotion engine automatically distributes unallocated candidates into classrooms matching balancing algorithms.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[hsl(var(--text-secondary))]">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))]" /> Balance male/female ratios in streams</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))]" /> Limit enrollments strictly to capacity limits</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-[hsl(var(--accent))]" /> Keep sibling house alignment locks</label>
              </div>
              <button className="w-full py-2.5 rounded-lg bg-[hsl(var(--accent))] text-white text-sm font-semibold hover:opacity-95 transition-opacity">
                Run Auto-Allocator
              </button>
            </div>
          )}
        </div>

        {/* Capacity overview stats */}
        <div className="glass-card p-5 space-y-4 h-fit">
          <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] pb-2 border-b border-[hsl(var(--border))]">Stream Load Limits</h3>
          <div className="space-y-4">
            {mockStreams.map(stream => {
              const isFull = stream.current >= stream.capacity;
              return (
                <div key={stream.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[hsl(var(--text-primary))]">{stream.class} {stream.section} ({stream.stream})</span>
                    <span className={isFull ? 'text-rose-400' : 'text-emerald-400'}>{stream.current}/{stream.capacity}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[hsl(var(--bg-tertiary))] overflow-hidden">
                    <div className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(stream.current/stream.capacity)*100}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[hsl(var(--text-tertiary))]">
                    <span>Balance: {stream.genderBalance}</span>
                    {isFull && <span className="font-semibold text-rose-400 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> FULL</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
