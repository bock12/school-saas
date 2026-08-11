'use client';

import type { OfficerData } from '../ExamOfficeDashboardContent';
import {
  Users, Printer, RefreshCw, CheckCircle2, X, Shield, Clock,
  MapPin, ChevronRight, Sparkles, Filter, AlertCircle, Eye, UserCheck
} from 'lucide-react';
import { useState } from 'react';

interface SeatAllocation {
  id: string;
  examNo: string;
  studentName: string;
  className: string;
  subject: string;
  seatCode: string;
  row: number;
  col: number;
  clearance: boolean;
}

const hallData = [
  { id: 'hall-a', name: 'Main Examination Hall A', capacity: 35, occupied: 33, supervisor: 'Mr. S. Conteh (Lead)' },
  { id: 'hall-b', name: 'Senior Science Hall B', capacity: 30, occupied: 28, supervisor: 'Mrs. A. Mansaray' },
  { id: 'hall-c', name: 'Auditorium Hall C', capacity: 50, occupied: 45, supervisor: 'Dr. F. Cole' },
];

const initialSeats: (SeatAllocation | null)[][] = [
  [
    { id: '1-1', examNo: 'EX-2026-0001', studentName: 'John Kamara', className: 'SSS 3A', subject: 'Mathematics', seatCode: 'Desk A-1', row: 1, col: 1, clearance: true },
    { id: '1-2', examNo: 'EX-2026-0002', studentName: 'Aminata Sesay', className: 'SSS 2A', subject: 'Mathematics', seatCode: 'Desk A-2', row: 1, col: 2, clearance: true },
    { id: '1-3', examNo: 'EX-2026-0003', studentName: 'Mohamed Conteh', className: 'SSS 1A', subject: 'Mathematics', seatCode: 'Desk A-3', row: 1, col: 3, clearance: true },
    { id: '1-4', examNo: 'EX-2026-0004', studentName: 'Fatima Koroma', className: 'SSS 3B', subject: 'Mathematics', seatCode: 'Desk A-4', row: 1, col: 4, clearance: true },
    { id: '1-5', examNo: 'EX-2026-0005', studentName: 'Ibrahim Bangura', className: 'SSS 2B', subject: 'Mathematics', seatCode: 'Desk A-5', row: 1, col: 5, clearance: false },
  ],
  [
    { id: '2-1', examNo: 'EX-2026-0006', studentName: 'Mariama Turay', className: 'SSS 1B', subject: 'Mathematics', seatCode: 'Desk A-6', row: 2, col: 1, clearance: true },
    { id: '2-2', examNo: 'EX-2026-0007', studentName: 'Alhaji Mansaray', className: 'SSS 3A', subject: 'Mathematics', seatCode: 'Desk A-7', row: 2, col: 2, clearance: true },
    { id: '2-3', examNo: 'EX-2026-0008', studentName: 'Kadiatu Cole', className: 'SSS 2A', subject: 'Mathematics', seatCode: 'Desk A-8', row: 2, col: 3, clearance: true },
    { id: '2-4', examNo: 'EX-2026-0009', studentName: 'Samuel Bangura', className: 'SSS 1A', subject: 'Mathematics', seatCode: 'Desk A-9', row: 2, col: 4, clearance: true },
    { id: '2-5', examNo: 'EX-2026-0010', studentName: 'Zainab Jalloh', className: 'SSS 3B', subject: 'Mathematics', seatCode: 'Desk A-10', row: 2, col: 5, clearance: true },
  ],
  [
    { id: '3-1', examNo: 'EX-2026-0011', studentName: 'Saidu Koroma', className: 'SSS 2B', subject: 'Mathematics', seatCode: 'Desk A-11', row: 3, col: 1, clearance: true },
    { id: '3-2', examNo: 'EX-2026-0012', studentName: 'Fatmata Mansaray', className: 'SSS 1B', subject: 'Mathematics', seatCode: 'Desk A-12', row: 3, col: 2, clearance: true },
    { id: '3-3', examNo: 'EX-2026-0013', studentName: 'Emmanuel Sesay', className: 'SSS 3A', subject: 'Mathematics', seatCode: 'Desk A-13', row: 3, col: 3, clearance: true },
    null,
    { id: '3-5', examNo: 'EX-2026-0014', studentName: 'Isata Kamara', className: 'SSS 2A', subject: 'Mathematics', seatCode: 'Desk A-14', row: 3, col: 5, clearance: true },
  ],
  [
    { id: '4-1', examNo: 'EX-2026-0015', studentName: 'Abu Bakarr Bah', className: 'SSS 1A', subject: 'Mathematics', seatCode: 'Desk A-15', row: 4, col: 1, clearance: true },
    { id: '4-2', examNo: 'EX-2026-0016', studentName: 'Hawa Bangura', className: 'SSS 3B', subject: 'Mathematics', seatCode: 'Desk A-16', row: 4, col: 2, clearance: true },
    { id: '4-3', examNo: 'EX-2026-0017', studentName: 'Chernor Jalloh', className: 'SSS 2B', subject: 'Mathematics', seatCode: 'Desk A-17', row: 4, col: 3, clearance: true },
    { id: '4-4', examNo: 'EX-2026-0018', studentName: 'Sia Dumbuya', className: 'SSS 1B', subject: 'Mathematics', seatCode: 'Desk A-18', row: 4, col: 4, clearance: true },
    { id: '4-5', examNo: 'EX-2026-0019', studentName: 'Osman Sankoh', className: 'SSS 3A', subject: 'Mathematics', seatCode: 'Desk A-19', row: 4, col: 5, clearance: true },
  ],
];

export function SeatingTab({ officer }: { officer: OfficerData }) {
  const [selectedHall, setSelectedHall] = useState('hall-a');
  const [seatGrid, setSeatGrid] = useState(initialSeats);
  const [selectedSeat, setSelectedSeat] = useState<SeatAllocation | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const currentHallInfo = hallData.find(h => h.id === selectedHall) || hallData[0];

  const handleRandomizeSeating = () => {
    setIsShuffling(true);
    setTimeout(() => {
      // Shuffle non-null seats
      const flatSeats = seatGrid.flat().filter((s): s is SeatAllocation => s !== null);
      const shuffled = [...flatSeats].sort(() => Math.random() - 0.5);

      let index = 0;
      const newGrid = seatGrid.map(row =>
        row.map(cell => {
          if (cell === null) return null;
          const nextAlloc = shuffled[index++];
          return nextAlloc ? { ...cell, studentName: nextAlloc.studentName, className: nextAlloc.className, examNo: nextAlloc.examNo } : cell;
        })
      );
      setSeatGrid(newGrid);
      setIsShuffling(false);
      setSuccessToast('Seating allocation randomized with anti-cheating class mixing!');
      setTimeout(() => setSuccessToast(''), 4000);
    }, 1000);
  };

  const handlePrintSeatingChart = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))]">Exam Hall Seating Arrangement</h1>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">
            Visual exam hall seating plans with anti-cheating randomized allocation and printable door placards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomizeSeating}
            disabled={isShuffling}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] text-xs font-bold border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary)/0.8)] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-violet-400 ${isShuffling ? 'animate-spin' : ''}`} /> Randomize Allocation
          </button>
          <button
            onClick={handlePrintSeatingChart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
          >
            <Printer className="w-4 h-4" /> Print Seating Placard
          </button>
        </div>
      </div>

      {/* Hall Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {hallData.map(h => (
          <button
            key={h.id}
            onClick={() => setSelectedHall(h.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
              selectedHall === h.id
                ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/20'
                : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{h.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{h.occupied}/{h.capacity} Seats</span>
          </button>
        ))}
      </div>

      {/* Main Seating Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card rounded-2xl p-6 border border-[hsl(var(--border))] space-y-6">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
            <div>
              <h2 className="font-black text-lg text-[hsl(var(--text-primary))]">{currentHallInfo.name}</h2>
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Lead Supervisor: {currentHallInfo.supervisor}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Anti-Cheating Mixing Active
            </span>
          </div>

          {/* Invigilator Desk Banner */}
          <div className="flex justify-center">
            <div className="px-10 py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-xs font-bold text-violet-400 flex items-center gap-2 shadow-sm">
              <Shield className="w-4 h-4" /> INVIGILATOR &amp; SUPERVISOR DESK (FRONT OF HALL)
            </div>
          </div>

          {/* Seating Desk Grid */}
          <div className="space-y-4 pt-2">
            {seatGrid.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-3 sm:gap-4">
                {row.map((seat, ci) => (
                  <button
                    key={ci}
                    type="button"
                    onClick={() => seat && setSelectedSeat(seat)}
                    disabled={!seat}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center text-center border transition-all ${
                      seat
                        ? seat.clearance
                          ? 'bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))] hover:border-violet-500 hover:scale-105 shadow-sm'
                          : 'bg-red-500/10 border-red-500/40 hover:scale-105'
                        : 'border-dashed border-[hsl(var(--border)/0.3)] opacity-30 cursor-default'
                    }`}
                  >
                    {seat ? (
                      <>
                        <span className="text-[9px] font-mono text-[hsl(var(--text-tertiary))]">{seat.seatCode.replace('Desk ', '')}</span>
                        <span className="text-[10px] font-black text-violet-400 truncate max-w-[50px]">{seat.studentName.split(' ')[0]}</span>
                        <span className="text-[8px] font-bold text-[hsl(var(--text-secondary))]">{seat.className}</span>
                      </>
                    ) : (
                      <span className="text-[8px] text-[hsl(var(--text-tertiary))]">EMPTY</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Seating Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-[hsl(var(--border))] text-[11px] text-[hsl(var(--text-tertiary))]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))]" /> Cleared Candidate</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/10 border border-red-500/40" /> Clearance Issue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-dashed border border-[hsl(var(--border)/0.3)] opacity-40" /> Empty Desk</span>
          </div>
        </div>

        {/* Right Sidebar Rules & Seat Detail */}
        <div className="space-y-4">
          {selectedSeat ? (
            <div className="glass-card rounded-2xl p-5 border border-violet-500/30 bg-violet-500/5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">{selectedSeat.seatCode} Detail</span>
                <button onClick={() => setSelectedSeat(null)} className="p-1 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[hsl(var(--text-tertiary))] block">Candidate Name:</span>
                  <span className="font-bold text-sm text-[hsl(var(--text-primary))]">{selectedSeat.studentName}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))] block">Exam Number:</span>
                  <span className="font-mono font-bold text-violet-400">{selectedSeat.examNo}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))] block">Class:</span>
                  <span className="font-semibold text-[hsl(var(--text-secondary))]">{selectedSeat.className}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))] block">Scheduled Exam:</span>
                  <span className="font-bold text-[hsl(var(--text-primary))]">{selectedSeat.subject}</span>
                </div>
                <div>
                  <span className="text-[hsl(var(--text-tertiary))] block">Clearance Status:</span>
                  <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5 ${selectedSeat.clearance ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {selectedSeat.clearance ? '✓ Financial & Academic Clearance OK' : '⚠️ Financial Clearance Pending'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-5 border border-[hsl(var(--border))] space-y-3">
              <h3 className="font-black text-[hsl(var(--text-primary))] text-sm">Seating Configuration Rules</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Ordering Algorithm', val: 'Alternate Class Mixing' },
                  { label: 'Minimum Desk Distance', val: '1.5 Meters' },
                  { label: 'Invigilator Ratio', val: '1 Invigilator per 20 Candidates' },
                  { label: 'Placard Generation', val: 'QR Verification Enabled' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
                    <span className="text-[hsl(var(--text-tertiary))]">{r.label}</span>
                    <span className="font-bold text-[hsl(var(--text-primary))]">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
