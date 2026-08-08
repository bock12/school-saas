'use client';
import type { OfficerData } from '../ExamOfficeDashboardContent';
import { BookMarked, Users, Plus } from 'lucide-react';

const rooms = [
  { name: 'Hall A', capacity: 60, candidates: 54, invigilators: 2, exam: 'Mathematics', time: '09:00 – 11:00', status: 'Ready' },
  { name: 'Hall B', capacity: 60, candidates: 62, invigilators: 2, exam: 'English Language', time: '13:00 – 15:00', status: 'Over Capacity' },
  { name: 'Hall C', capacity: 80, candidates: 48, invigilators: 2, exam: 'Biology', time: '09:00 – 11:00', status: 'Ready' },
  { name: 'Lab 1', capacity: 30, candidates: 28, invigilators: 1, exam: 'Chemistry Practical', time: '11:00 – 13:00', status: 'Ready' },
  { name: 'Lab 2', capacity: 30, candidates: 30, invigilators: 1, exam: 'Physics Practical', time: '14:00 – 16:00', status: 'At Capacity' },
];

const statusColors: Record<string, string> = {
  'Ready': 'bg-emerald-500/15 text-emerald-400',
  'Over Capacity': 'bg-red-500/15 text-red-400',
  'At Capacity': 'bg-amber-500/15 text-amber-400',
};

export function RoomsTab({ officer }: { officer: OfficerData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Examination Halls & Rooms</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">Manage room capacity, availability, and candidate allocations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map(r => (
          <div key={r.name} className={`glass-card rounded-2xl p-5 border ${r.status === 'Over Capacity' ? 'border-red-500/30' : r.status === 'At Capacity' ? 'border-amber-500/30' : 'border-[hsl(var(--border))]'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <BookMarked className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="font-black text-[hsl(var(--text-primary))]">{r.name}</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColors[r.status]}`}>{r.status}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-[hsl(var(--text-tertiary))]">Capacity</span><span className="font-bold text-[hsl(var(--text-primary))]">{r.capacity}</span></div>
              <div className="flex justify-between"><span className="text-[hsl(var(--text-tertiary))]">Candidates</span>
                <span className={`font-bold ${r.candidates > r.capacity ? 'text-red-400' : 'text-emerald-400'}`}>{r.candidates}</span>
              </div>
              <div className="h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${r.candidates > r.capacity ? 'bg-red-500' : r.candidates === r.capacity ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((r.candidates / r.capacity) * 100, 100)}%` }} />
              </div>
              <div className="flex justify-between"><span className="text-[hsl(var(--text-tertiary))]">Invigilators</span><span className="font-bold text-[hsl(var(--text-primary))]">{r.invigilators}</span></div>
              <div className="pt-2 border-t border-[hsl(var(--border)/0.5)]">
                <p className="font-semibold text-[hsl(var(--text-primary))]">{r.exam}</p>
                <p className="text-[hsl(var(--text-tertiary))]">{r.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
