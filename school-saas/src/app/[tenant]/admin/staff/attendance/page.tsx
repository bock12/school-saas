'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck, Search, Clock, ShieldAlert, CheckCircle2,
  AlertTriangle, Filter, Download, UserCheck, Smartphone, Wifi,
  QrCode, UserPlus, LogIn, LogOut, Check, X, RefreshCw,
  Building, Edit2, AlertCircle, FileSpreadsheet, Sparkles, ChevronRight
} from 'lucide-react';
import { HCMHeader } from '../_components/hcm-header';

interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  name: string;
  avatarInitials: string;
  role: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'Present' | 'On Leave' | 'Absent' | 'Half Day';
  punctuality: 'Early' | 'On Time' | 'Late' | 'Excused';
  lateMinutes: number;
  device: string;
  method: 'biometric' | 'rfid' | 'qr_scan' | 'manual';
  notes?: string;
}

const initialAttendanceData: StaffAttendanceRecord[] = [
  {
    id: '1',
    staffId: 'EMP-084920',
    name: 'John Doe',
    avatarInitials: 'JD',
    role: 'Head of Mathematics',
    department: 'Mathematics',
    date: new Date().toISOString().split('T')[0],
    checkIn: '07:45 AM',
    checkOut: null,
    status: 'Present',
    punctuality: 'On Time',
    lateMinutes: 0,
    device: 'Biometric Scanner #2',
    method: 'biometric',
  },
  {
    id: '2',
    staffId: 'EMP-084921',
    name: 'Dr. Raj Sharma',
    avatarInitials: 'RS',
    role: 'Senior Physics Instructor',
    department: 'Science',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:14 AM',
    checkOut: null,
    status: 'Present',
    punctuality: 'Late',
    lateMinutes: 14,
    device: 'Biometric Scanner #1',
    method: 'biometric',
  },
  {
    id: '3',
    staffId: 'EMP-084922',
    name: 'Mrs. Hannah Cole',
    avatarInitials: 'HC',
    role: 'English Literature Lead',
    department: 'Languages',
    date: new Date().toISOString().split('T')[0],
    checkIn: '07:38 AM',
    checkOut: '04:15 PM',
    status: 'Present',
    punctuality: 'Early',
    lateMinutes: 0,
    device: 'RFID Turnstile Gate #1',
    method: 'rfid',
  },
  {
    id: '4',
    staffId: 'EMP-084923',
    name: 'Patricia Osei',
    avatarInitials: 'PO',
    role: 'Head of Administration',
    department: 'Administration',
    date: new Date().toISOString().split('T')[0],
    checkIn: null,
    checkOut: null,
    status: 'On Leave',
    punctuality: 'Excused',
    lateMinutes: 0,
    device: 'Approved Leave Form (Annual)',
    method: 'manual',
    notes: 'Approved Annual Leave Jul 15-22',
  },
  {
    id: '5',
    staffId: 'EMP-084924',
    name: 'Benjamin Asante',
    avatarInitials: 'BA',
    role: 'Senior Accountant & Bursar',
    department: 'Finance',
    date: new Date().toISOString().split('T')[0],
    checkIn: '07:50 AM',
    checkOut: null,
    status: 'Present',
    punctuality: 'On Time',
    lateMinutes: 0,
    device: 'Biometric Scanner #2',
    method: 'biometric',
  },
  {
    id: '6',
    staffId: 'EMP-084925',
    name: 'Kwame Darko',
    avatarInitials: 'KD',
    role: 'Head of Transport & Fleet',
    department: 'Transport',
    date: new Date().toISOString().split('T')[0],
    checkIn: '06:30 AM',
    checkOut: '03:15 PM',
    status: 'Present',
    punctuality: 'Early',
    lateMinutes: 0,
    device: 'RFID Turnstile Gate #1',
    method: 'rfid',
  },
  {
    id: '7',
    staffId: 'EMP-084926',
    name: 'Grace Taylor',
    avatarInitials: 'GT',
    role: 'Head Librarian',
    department: 'Library',
    date: new Date().toISOString().split('T')[0],
    checkIn: null,
    checkOut: null,
    status: 'Absent',
    punctuality: 'Late',
    lateMinutes: 0,
    device: 'Awaiting Check-in',
    method: 'manual',
  },
];

export default function StaffAttendancePage() {
  const [attendanceList, setAttendanceList] = useState<StaffAttendanceRecord[]>(initialAttendanceData);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'roster' | 'kiosk'>('roster');

  // Kiosk / Quick Clock In/Out state
  const [kioskInputId, setKioskInputId] = useState('');
  const [recentKioskEvent, setRecentKioskEvent] = useState<{
    staffName: string;
    type: 'check_in' | 'check_out';
    time: string;
    punctuality: string;
    staffId: string;
  } | null>(null);

  // Edit / Override Modal state
  const [editingRecord, setEditingRecord] = useState<StaffAttendanceRecord | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editStatus, setEditStatus] = useState<StaffAttendanceRecord['status']>('Present');
  const [editPunctuality, setEditPunctuality] = useState<StaffAttendanceRecord['punctuality']>('On Time');
  const [editNotes, setEditNotes] = useState('');

  // Helper to format current time e.g. "08:15 AM"
  const getCurrentFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Clock In Action
  const handleClockIn = (staffId: string) => {
    const timeStr = getCurrentFormattedTime();
    const now = new Date();
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
    const punctualityStatus = isLate ? 'Late' : 'On Time';
    const lateMins = isLate ? (now.getHours() - 8) * 60 + now.getMinutes() : 0;

    let targetStaffName = '';

    setAttendanceList(prev =>
      prev.map(item => {
        if (item.staffId === staffId || item.id === staffId) {
          targetStaffName = item.name;
          return {
            ...item,
            checkIn: timeStr,
            status: 'Present',
            punctuality: punctualityStatus,
            lateMinutes: lateMins,
            device: 'Web Terminal / Kiosk',
            method: 'manual',
          };
        }
        return item;
      })
    );

    setRecentKioskEvent({
      staffName: targetStaffName || staffId,
      type: 'check_in',
      time: timeStr,
      punctuality: punctualityStatus,
      staffId: staffId,
    });
  };

  // Clock Out Action
  const handleClockOut = (staffId: string) => {
    const timeStr = getCurrentFormattedTime();
    let targetStaffName = '';

    setAttendanceList(prev =>
      prev.map(item => {
        if (item.staffId === staffId || item.id === staffId) {
          targetStaffName = item.name;
          return {
            ...item,
            checkOut: timeStr,
          };
        }
        return item;
      })
    );

    setRecentKioskEvent({
      staffName: targetStaffName || staffId,
      type: 'check_out',
      time: timeStr,
      punctuality: 'Completed',
      staffId: staffId,
    });
  };

  // Handle Scan / Kiosk Submit
  const handleKioskScan = (e: React.FormEvent) => {
    e.preventDefault();
    const query = kioskInputId.trim();
    if (!query) return;

    const matched = attendanceList.find(
      s => s.staffId.toLowerCase() === query.toLowerCase() ||
           s.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matched) {
      if (!matched.checkIn) {
        handleClockIn(matched.staffId);
      } else if (!matched.checkOut) {
        handleClockOut(matched.staffId);
      } else {
        // Already checked out, re-check in or notify
        handleClockIn(matched.staffId);
      }
      setKioskInputId('');
    } else {
      alert(`No employee record found matching "${query}". Please check Staff ID or Name.`);
    }
  };

  // Open Edit Override Modal
  const openEditModal = (record: StaffAttendanceRecord) => {
    setEditingRecord(record);
    setEditCheckIn(record.checkIn || '07:45 AM');
    setEditCheckOut(record.checkOut || '');
    setEditStatus(record.status);
    setEditPunctuality(record.punctuality);
    setEditNotes(record.notes || '');
  };

  // Save Edit Override
  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setAttendanceList(prev =>
      prev.map(item => {
        if (item.id === editingRecord.id) {
          return {
            ...item,
            checkIn: editCheckIn || null,
            checkOut: editCheckOut || null,
            status: editStatus,
            punctuality: editPunctuality,
            notes: editNotes,
            device: 'HR Admin Override',
          };
        }
        return item;
      })
    );

    setEditingRecord(null);
  };

  // Bulk Action: Mark All Remaining as Present
  const handleMarkAllRemainingPresent = () => {
    const timeStr = getCurrentFormattedTime();
    setAttendanceList(prev =>
      prev.map(item => {
        if (!item.checkIn && item.status === 'Absent') {
          return {
            ...item,
            checkIn: timeStr,
            status: 'Present',
            punctuality: 'On Time',
            device: 'HR Bulk Override',
          };
        }
        return item;
      })
    );
  };

  // Filtered list
  const filteredRecords = attendanceList.filter(row => {
    const matchDept = departmentFilter === 'All' || row.department === departmentFilter;
    const matchStatus = statusFilter === 'All' || row.status === statusFilter;
    const matchSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.role.toLowerCase().includes(search.toLowerCase()) ||
      row.staffId.toLowerCase().includes(search.toLowerCase()) ||
      row.department.toLowerCase().includes(search.toLowerCase());

    return matchDept && matchStatus && matchSearch;
  });

  // KPI Calculations
  const presentCount = attendanceList.filter(s => s.status === 'Present').length;
  const onLeaveCount = attendanceList.filter(s => s.status === 'On Leave').length;
  const lateCount = attendanceList.filter(s => s.punctuality === 'Late').length;
  const checkedOutCount = attendanceList.filter(s => !!s.checkOut).length;
  const attendanceRate = ((presentCount / (attendanceList.length || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-[1600px] animate-fade-in pb-16">
      {/* Shared Responsive HCM Header */}
      <HCMHeader
        title="Staff Attendance & Check-In / Check-Out"
        subtitle="Real-time check-in terminals, biometric sync, RFID turnstile logs, and manual attendance overrides."
        badge={`${attendanceRate}% Present Today`}
        actionButton={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/staff/attendance/kiosk"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-primary))] transition-colors shadow-sm cursor-pointer"
              title="Open Fullscreen Tablet Kiosk Station in New Tab"
            >
              <QrCode className="w-4 h-4 text-[hsl(var(--accent))]" />
              <span className="hidden sm:inline">Launch Fullscreen Kiosk</span>
            </Link>
            <button
              type="button"
              onClick={handleMarkAllRemainingPresent}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-xs font-bold text-[hsl(var(--text-primary))] transition-colors shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'kiosk' ? 'roster' : 'kiosk')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[hsl(var(--accent)/0.25)] transition-all cursor-pointer shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>{activeTab === 'kiosk' ? 'View Daily Roster' : 'Quick Clock Terminal'}</span>
            </button>
          </div>
        }
      />

      {/* KPI METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Present Today</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400">{presentCount} Staff</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{attendanceRate}% of total workforce</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Late Arrivals</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400">{lateCount} Staff</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Clocked in after 08:00 AM</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Clocked Out</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-400">{checkedOutCount} Staff</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Shift completed today</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider">Approved Leave</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400">{onLeaveCount} Staff</p>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Excused absence</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE SCANNER & KIOSK TERMINAL                              */}
      {/* ========================================================================= */}
      {activeTab === 'kiosk' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--bg-secondary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--accent)/0.04)] shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[hsl(var(--accent))]" />
                  Live Clock-In &amp; Clock-Out Terminal
                </h2>
                <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                  Scan Staff ID barcode, type employee number, or tap employee below to clock in/out
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Terminal Ready
              </span>
            </div>

            {/* Terminal Input Form */}
            <form onSubmit={handleKioskScan} className="max-w-xl mx-auto space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))] text-center block">
                  Scan ID Badge or Enter Staff ID / Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. EMP-084920 or John Doe..."
                    value={kioskInputId}
                    onChange={(e) => setKioskInputId(e.target.value)}
                    className="w-full h-14 pl-12 pr-28 rounded-2xl bg-[hsl(var(--bg-tertiary))] border-2 border-[hsl(var(--accent)/0.4)] focus:border-[hsl(var(--accent))] text-base sm:text-lg font-bold text-[hsl(var(--text-primary))] text-center shadow-inner focus:outline-none transition-colors"
                    autoFocus
                  />
                  <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[hsl(var(--accent))]" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Verify &amp; Clock
                  </button>
                </div>
              </div>
            </form>

            {/* Last Scanned Event Notification Banner */}
            {recentKioskEvent && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-center space-y-1 animate-fade-in max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {recentKioskEvent.type === 'check_in' ? 'Clock-In Recorded Successfully!' : 'Clock-Out Recorded Successfully!'}
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--text-primary))]">
                  <strong>{recentKioskEvent.staffName}</strong> ({recentKioskEvent.staffId}) logged at <strong className="text-emerald-400">{recentKioskEvent.time}</strong> • Status: <strong className="text-emerald-400">{recentKioskEvent.punctuality}</strong>
                </p>
              </div>
            )}

            {/* Quick 1-Click Clock In/Out Roster Grid */}
            <div className="space-y-3 pt-4 border-t border-[hsl(var(--border))]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                  Quick 1-Click Check-In / Check-Out Grid
                </h3>
                <span className="text-xs text-[hsl(var(--text-tertiary))]">Tap to toggle clock status</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {attendanceList.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center justify-between gap-3 hover:border-[hsl(var(--accent)/0.4)] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-xs shrink-0">
                        {item.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{item.name}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))] truncate font-mono">{item.staffId} • {item.department}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {!item.checkIn ? (
                        <button
                          type="button"
                          onClick={() => handleClockIn(item.staffId)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Clock In</span>
                        </button>
                      ) : !item.checkOut ? (
                        <button
                          type="button"
                          onClick={() => handleClockOut(item.staffId)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Clock Out</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DAILY ATTENDANCE ROSTER & LOGS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* FILTER & DATE TOOLBAR */}
          <div className="glass-card p-4 rounded-2xl border border-[hsl(var(--border))] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-tertiary))]" />
              <input
                type="text"
                placeholder="Search attendance by staff name, role, department, or staff ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
              />

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Languages">Languages</option>
                <option value="Administration">Administration</option>
                <option value="Finance">Finance</option>
                <option value="Transport">Transport</option>
                <option value="Library">Library</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))] transition-colors cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="On Leave">On Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          {/* ATTENDANCE ROSTER TABLE */}
          <div className="glass-card overflow-hidden rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary)/0.4)]">
                    {['Staff Member', 'Department', 'Clock In', 'Clock Out', 'Punctuality', 'Status', 'Terminal / Device', 'Action'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-[hsl(var(--text-tertiary))] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {filteredRecords.map(row => (
                    <tr key={row.id} className="hover:bg-[hsl(var(--bg-tertiary)/0.4)] transition-colors">
                      {/* Staff Member */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center font-bold text-[hsl(var(--accent))] text-xs shrink-0">
                            {row.avatarInitials}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{row.name}</p>
                            <p className="text-[10px] text-[hsl(var(--text-tertiary))] font-mono">{row.staffId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-semibold text-[hsl(var(--text-primary))]">{row.department}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{row.role}</p>
                      </td>

                      {/* Clock In */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {row.checkIn ? (
                          <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                            {row.checkIn}
                          </span>
                        ) : (
                          <span className="text-[hsl(var(--text-tertiary))] font-mono">—</span>
                        )}
                      </td>

                      {/* Clock Out */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {row.checkOut ? (
                          <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
                            {row.checkOut}
                          </span>
                        ) : (
                          <span className="text-[hsl(var(--text-tertiary))] font-mono">—</span>
                        )}
                      </td>

                      {/* Punctuality */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          row.punctuality === 'Early' || row.punctuality === 'On Time'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : row.punctuality === 'Late'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {row.punctuality} {row.lateMinutes > 0 && `(${row.lateMinutes}m)`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          row.status === 'Present'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                            : row.status === 'On Leave'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                        }`}>
                          {row.status}
                        </span>
                      </td>

                      {/* Terminal Device */}
                      <td className="px-5 py-3.5 text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap">
                        {row.device}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {!row.checkIn ? (
                            <button
                              type="button"
                              onClick={() => handleClockIn(row.staffId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Clock In
                            </button>
                          ) : !row.checkOut ? (
                            <button
                              type="button"
                              onClick={() => handleClockOut(row.staffId)}
                              className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Clock Out
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold">Completed</span>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            className="p-1 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                            title="Edit / Override Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HR ATTENDANCE EDIT & OVERRIDE DIALOG                               */}
      {/* ========================================================================= */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Override Attendance Log</h3>
                  <p className="text-xs text-[hsl(var(--text-tertiary))]">{editingRecord.name} ({editingRecord.staffId})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Clock In Time</label>
                  <input
                    type="text"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    placeholder="e.g. 07:45 AM"
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Clock Out Time</label>
                  <input
                    type="text"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    placeholder="e.g. 04:30 PM"
                    className="w-full h-10 px-3.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="Present">Present</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Punctuality</label>
                  <select
                    value={editPunctuality}
                    onChange={(e) => setEditPunctuality(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                  >
                    <option value="On Time">On Time</option>
                    <option value="Early">Early</option>
                    <option value="Late">Late</option>
                    <option value="Excused">Excused</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))]">Reason / Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Employee attended off-campus curriculum conference..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent))]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
