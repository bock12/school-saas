'use client';

import { useState } from 'react';
import { UsersRound, Plus, DollarSign } from 'lucide-react';

const mockFamilies = [
  { id: '1', name: 'Smith Family Roster', parentName: 'John Smith', siblings: ['Sarah Smith', 'David Smith', 'Esther Smith'], balance: 600, discount: '10% Sibling Discount' },
  { id: '2', name: 'Okafor Family Roster', parentName: 'Emeka Okafor', siblings: ['David Okafor'], balance: 0, discount: 'None' }
];

export default function FamilyGroupsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Family Groups Directory</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Consolidate sibling fee statements, apply family discount plans, and dispatch group parent communications.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create Family Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockFamilies.map(fam => (
          <div key={fam.id} className="glass-card p-5 space-y-4 hover:scale-[1.01] transition-transform">
            <div className="flex items-start justify-between pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{fam.name}</h3>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">Primary Representative: <span className="font-semibold text-[hsl(var(--text-secondary))]">{fam.parentName}</span></p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Discount: {fam.discount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Linked Siblings</span>
                <p className="font-bold text-[hsl(var(--text-primary))] mt-0.5 flex items-center justify-center gap-1"><UsersRound className="w-3.5 h-3.5" />{fam.siblings.length} students</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))]">
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] block">Consolidated Balance</span>
                <p className="font-bold text-amber-400 mt-0.5 flex items-center justify-center"><DollarSign className="w-3.5 h-3.5" />{fam.balance}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 text-xs text-[hsl(var(--text-secondary))]">
              <p className="font-semibold text-[hsl(var(--text-primary))]">Children:</p>
              <div className="flex gap-1.5 flex-wrap">
                {fam.siblings.map(sib => (
                  <span key={sib} className="px-2 py-0.5 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))] font-medium">{sib}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
