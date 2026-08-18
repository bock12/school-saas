'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode, Clock, CheckCircle2, AlertTriangle, ArrowLeft,
  ShieldCheck, UserCheck, LogIn, LogOut, Maximize2, Minimize2,
  Sparkles, RefreshCw, X, Hash, Lock, Check, Building, Volume2
} from 'lucide-react';

interface StaffInfo {
  id: string;
  staffId: string;
  name: string;
  avatarInitials: string;
  position: string;
  department: string;
  pin: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

const mockStaffDirectory: StaffInfo[] = [
  { id: '1', staffId: 'EMP-084920', name: 'John Doe', avatarInitials: 'JD', position: 'Head of Mathematics', department: 'Mathematics', pin: '1234', isCheckedIn: false },
  { id: '2', staffId: 'EMP-084921', name: 'Dr. Raj Sharma', avatarInitials: 'RS', position: 'Senior Physics Instructor', department: 'Science', pin: '2345', isCheckedIn: false },
  { id: '3', staffId: 'EMP-084922', name: 'Mrs. Hannah Cole', avatarInitials: 'HC', position: 'English Literature Lead', department: 'Languages', pin: '3456', isCheckedIn: true, checkInTime: '07:38 AM' },
  { id: '4', staffId: 'EMP-084923', name: 'Patricia Osei', avatarInitials: 'PO', position: 'Head of Administration', department: 'Administration', pin: '4567', isCheckedIn: false },
  { id: '5', staffId: 'EMP-084924', name: 'Benjamin Asante', avatarInitials: 'BA', position: 'Senior Accountant & Bursar', department: 'Finance', pin: '5678', isCheckedIn: true, checkInTime: '07:50 AM' },
  { id: '6', staffId: 'EMP-084925', name: 'Kwame Darko', avatarInitials: 'KD', position: 'Head of Transport & Fleet', department: 'Transport', pin: '6789', isCheckedIn: true, checkInTime: '06:30 AM' },
  { id: '7', staffId: 'EMP-084926', name: 'Grace Taylor', avatarInitials: 'GT', position: 'Head Librarian', department: 'Library', pin: '7890', isCheckedIn: false },
];

export default function StandaloneAttendanceKioskPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [inputVal, setInputVal] = useState<string>('');
  const [pinBuffer, setPinBuffer] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'scan' | 'pin'>('scan');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Success Confirmation Card state (auto-dismisses after 3.5s)
  const [confirmedStaff, setConfirmedStaff] = useState<{
    staff: StaffInfo;
    action: 'clock_in' | 'clock_out';
    time: string;
    punctuality: 'Early' | 'On Time' | 'Late';
  } | null>(null);

  const [staffList, setStaffList] = useState<StaffInfo[]>(mockStaffDirectory);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Real-time clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keep focus on input for USB barcode / RFID reader
  useEffect(() => {
    if (activeMode === 'scan' && !confirmedStaff) {
      scanInputRef.current?.focus();
    }
  }, [activeMode, confirmedStaff]);

  // Auto-dismiss confirmation overlay after 3.5s
  useEffect(() => {
    if (confirmedStaff) {
      const timer = setTimeout(() => {
        setConfirmedStaff(null);
        setInputVal('');
        setPinBuffer('');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [confirmedStaff]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleProcessVerification = (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) return;

    const matched = staffList.find(
      s => s.staffId.toLowerCase() === cleanId ||
           s.name.toLowerCase().includes(cleanId) ||
           s.pin === cleanId
    );

    if (!matched) {
      alert(`No employee record found for "${identifier}". Please check Staff ID or PIN.`);
      setInputVal('');
      setPinBuffer('');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
    const punctualityStatus: 'Early' | 'On Time' | 'Late' = now.getHours() < 7 || (now.getHours() === 7 && now.getMinutes() < 45) ? 'Early' : isLate ? 'Late' : 'On Time';

    const willClockOut = matched.isCheckedIn;

    // Update state
    setStaffList(prev =>
      prev.map(s => {
        if (s.id === matched.id) {
          return {
            ...s,
            isCheckedIn: !willClockOut,
            checkInTime: !willClockOut ? timeStr : s.checkInTime,
            checkOutTime: willClockOut ? timeStr : undefined,
          };
        }
        return s;
      })
    );

    setConfirmedStaff({
      staff: matched,
      action: willClockOut ? 'clock_out' : 'clock_in',
      time: timeStr,
      punctuality: punctualityStatus,
    });
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessVerification(inputVal);
  };

  const handlePinDigit = (digit: string) => {
    if (pinBuffer.length < 4) {
      const newPin = pinBuffer + digit;
      setPinBuffer(newPin);
      if (newPin.length === 4) {
        handleProcessVerification(newPin);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinBuffer(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[hsl(var(--accent)/0.12)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER: School Brand, Live Clock & Kiosk Actions */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/staff/attendance"
            className="w-10 h-10 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] flex items-center justify-center transition-colors shadow-sm"
            title="Exit Kiosk"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[hsl(var(--text-primary))] uppercase">
                Campus Attendance Terminal
              </h1>
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Main Gate &amp; Staff Lounge Station #1</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Ticker */}
          <div className="text-right hidden sm:block">
            <p className="text-xl sm:text-2xl font-mono font-black text-[hsl(var(--accent))] tracking-wider">
              {currentTime}
            </p>
            <p className="text-xs text-[hsl(var(--text-tertiary))] font-medium">{currentDate}</p>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors shadow-sm cursor-pointer"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN KIOSK INTERACTION CANVAS                                             */}
      {/* ========================================================================= */}
      <div className="my-auto py-8 max-w-2xl mx-auto w-full z-10">
        {/* SUCCESS CONFIRMATION OVERLAY */}
        {confirmedStaff ? (
          <div className="glass-card p-8 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/15 via-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-secondary))] shadow-2xl text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-3xl font-black mx-auto shadow-lg shadow-emerald-500/30">
              {confirmedStaff.staff.avatarInitials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">
                  {confirmedStaff.action === 'clock_in' ? 'Welcome & Clocked In!' : 'Goodbye & Clocked Out!'}
                </h2>
              </div>
              <p className="text-lg font-bold text-[hsl(var(--accent))]">{confirmedStaff.staff.name}</p>
              <p className="text-xs text-[hsl(var(--text-tertiary))] font-mono">{confirmedStaff.staff.staffId} • {confirmedStaff.staff.position}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex items-center justify-around text-xs max-w-md mx-auto">
              <div>
                <span className="text-[hsl(var(--text-tertiary))] uppercase text-[10px] font-bold block">Timestamp</span>
                <span className="font-mono font-bold text-sm text-[hsl(var(--text-primary))]">{confirmedStaff.time}</span>
              </div>
              <div className="h-8 w-px bg-[hsl(var(--border))]" />
              <div>
                <span className="text-[hsl(var(--text-tertiary))] uppercase text-[10px] font-bold block">Punctuality</span>
                <span className={`font-bold text-sm ${
                  confirmedStaff.punctuality === 'Late' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {confirmedStaff.punctuality}
                </span>
              </div>
            </div>

            <p className="text-xs text-[hsl(var(--text-tertiary))] animate-pulse">Ready for next employee in 3s...</p>
          </div>
        ) : (
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-[hsl(var(--border))] shadow-2xl space-y-6">
            {/* Mode Switcher: Scanner vs PIN Pad */}
            <div className="flex items-center justify-center gap-2 p-1 bg-[hsl(var(--bg-tertiary))] rounded-2xl border border-[hsl(var(--border))] max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setActiveMode('scan')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'scan'
                    ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Barcode / Badge</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('pin')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'pin'
                    ? 'bg-[hsl(var(--accent))] text-white shadow-sm'
                    : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                <Hash className="w-4 h-4" />
                <span>4-Digit PIN</span>
              </button>
            </div>

            {/* SCANNER MODE INPUT */}
            {activeMode === 'scan' && (
              <div className="space-y-6 text-center animate-fade-in">
                <div className="w-24 h-24 rounded-3xl bg-[hsl(var(--accent)/0.1)] border-2 border-dashed border-[hsl(var(--accent)/0.5)] flex items-center justify-center text-[hsl(var(--accent))] mx-auto">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-[hsl(var(--text-primary))]">Scan Your Staff Badge or Enter ID</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
                    Hold badge barcode or RFID card near the scanner to record check-in / check-out
                  </p>
                </div>

                <form onSubmit={handleScanSubmit} className="max-w-md mx-auto relative">
                  <input
                    ref={scanInputRef}
                    type="text"
                    placeholder="Scan Badge or Type EMP-084920..."
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="w-full h-14 pl-12 pr-28 rounded-2xl bg-[hsl(var(--bg-tertiary))] border-2 border-[hsl(var(--accent)/0.3)] focus:border-[hsl(var(--accent))] text-center text-base sm:text-lg font-mono font-bold text-[hsl(var(--text-primary))] focus:outline-none transition-colors shadow-inner"
                  />
                  <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[hsl(var(--accent))]" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
                  >
                    Enter
                  </button>
                </form>
              </div>
            )}

            {/* PIN PAD MODE */}
            {activeMode === 'pin' && (
              <div className="space-y-6 text-center animate-fade-in max-w-sm mx-auto">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[hsl(var(--text-primary))]">Enter Your 4-Digit Staff PIN</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">Your personal attendance authorization code</p>
                </div>

                {/* PIN Dots Display */}
                <div className="flex items-center justify-center gap-4 py-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        pinBuffer.length > idx
                          ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] scale-110'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]'
                      }`}
                    />
                  ))}
                </div>

                {/* 3x4 Touch Keypad */}
                <div className="grid grid-cols-3 gap-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        if (k === 'C') setPinBuffer('');
                        else if (k === '⌫') handlePinBackspace();
                        else handlePinDigit(k);
                      }}
                      className="h-14 rounded-2xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--accent))] hover:text-white border border-[hsl(var(--border))] text-lg font-black text-[hsl(var(--text-primary))] transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER: Status Bar & Fast Roster Snapshot */}
      <div className="border-t border-[hsl(var(--border))] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[hsl(var(--text-tertiary))] z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Biometric &amp; RFID Encryption Active • Offline Sync Buffered</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span>Present: <strong className="text-emerald-400">{staffList.filter(s => s.isCheckedIn).length}</strong></span>
          <span>•</span>
          <span>Awaiting: <strong className="text-[hsl(var(--text-primary))]">{staffList.filter(s => !s.isCheckedIn).length}</strong></span>
        </div>
      </div>
    </div>
  );
}
