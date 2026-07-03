'use client';

import { useState } from 'react';
import { Home, Plus, Search } from 'lucide-react';

const mockHouses = [
  { name: 'Red House', patron: 'Mr. John Doe', studentsCount: 152, points: 420, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { name: 'Blue House', patron: 'Mrs. Rachel Johnson', studentsCount: 148, points: 380, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { name: 'Green House', patron: 'Mr. Emeka Okafor', studentsCount: 154, points: 460, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Yellow House', patron: 'Ms. Linda Williams', studentsCount: 154, points: 400, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
];

export default function HousesPage() {
  const [search, setSearch] = useState('');

  const filtered = mockHouses.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">School Houses</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Configure student sports houses, assign patrons, and track cumulative house points.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Create House
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(house => (
          <div key={house.name} className={`glass-card p-5 border space-y-4 hover:scale-[1.02] transition-transform ${house.color}`}>
            <div className="flex items-center gap-2.5 pb-2 border-b border-[hsl(var(--border)/0.2)]">
              <Home className="w-5 h-5" />
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">{house.name}</h3>
            </div>

            <div className="space-y-2 text-xs text-[hsl(var(--text-secondary))]">
              <p>House Patron: <span className="font-semibold text-[hsl(var(--text-primary))]">{house.patron}</span></p>
              <p>Students Grouped: <span className="font-semibold text-[hsl(var(--text-primary))]">{house.studentsCount} students</span></p>
              <div className="pt-2 border-t border-[hsl(var(--border)/0.2)] flex justify-between items-center text-sm font-bold text-[hsl(var(--text-primary))]">
                <span>House Points:</span>
                <span>{house.points} pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
