'use client';

import { useState, useEffect } from 'react';
import {
  MapPin, Wifi, CheckCircle2, Clock, QrCode, LogIn, LogOut,
  AlertTriangle, ShieldCheck, RefreshCw, Smartphone, Check
} from 'lucide-react';

interface StaffMobileCheckinWidgetProps {
  staffName?: string;
  staffId?: string;
}

export function StaffMobileCheckinWidget({
  staffName = 'John Doe',
  staffId = 'EMP-084920'
}: StaffMobileCheckinWidgetProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [geofenceStatus, setGeofenceStatus] = useState<'verifying' | 'inside' | 'outside'>('verifying');
  const [distanceMeters, setDistanceMeters] = useState<number>(35);
  const [wifiName, setWifiName] = useState<string>('School-Staff-Secure-5G');
  const [isScanningQR, setIsScanningQR] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Simulate real-time GPS Geofence Check
  useEffect(() => {
    const timer = setTimeout(() => {
      setGeofenceStatus('inside');
      setDistanceMeters(42);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleSelfClockIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setIsCheckedIn(true);
    setCheckInTime(timeStr);
    setShowSuccessToast(`Clocked In successfully at ${timeStr} (Verified On-Campus)`);
    setTimeout(() => setShowSuccessToast(null), 4000);
  };

  const handleSelfClockOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setCheckOutTime(timeStr);
    setShowSuccessToast(`Clocked Out successfully at ${timeStr}`);
    setTimeout(() => setShowSuccessToast(null), 4000);
  };

  const handleSimulateWallQRScan = () => {
    setIsScanningQR(true);
    setTimeout(() => {
      setIsScanningQR(false);
      handleSelfClockIn();
    }, 1500);
  };

  return (
    <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border))] space-y-4 shadow-md bg-gradient-to-br from-[hsl(var(--bg-secondary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--accent)/0.03)] relative overflow-hidden">
      {/* Toast */}
      {showSuccessToast && (
        <div className="p-3 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] flex items-center justify-center font-bold text-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[hsl(var(--text-primary))]">Mobile Self Check-In</h3>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{staffName} ({staffId})</p>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
          isCheckedIn && !checkOutTime
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : checkOutTime
            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn && !checkOutTime ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
          {isCheckedIn && !checkOutTime ? 'On Duty' : checkOutTime ? 'Shift Completed' : 'Not Clocked In'}
        </span>
      </div>

      {/* Location & Network Verification Status Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* GPS Geofence Badge */}
        <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center gap-2">
          <MapPin className={`w-4 h-4 ${geofenceStatus === 'inside' ? 'text-emerald-400' : 'text-amber-400'}`} />
          <div className="min-w-0">
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Campus Geofence (GPS)</p>
            <p className="font-bold text-[11px] text-[hsl(var(--text-primary))] truncate">
              {geofenceStatus === 'verifying' ? 'Verifying location...' : geofenceStatus === 'inside' ? `Within Campus (${distanceMeters}m from Gate)` : 'Outside Campus'}
            </p>
          </div>
        </div>

        {/* Wi-Fi Network Badge */}
        <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-tertiary)/0.6)] border border-[hsl(var(--border))] flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <div className="min-w-0">
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">School Wi-Fi Network</p>
            <p className="font-bold text-[11px] text-[hsl(var(--text-primary))] truncate">{wifiName}</p>
          </div>
        </div>
      </div>

      {/* Main Clock In / Out Action Buttons */}
      <div className="space-y-2 pt-1">
        {!isCheckedIn ? (
          <button
            type="button"
            onClick={handleSelfClockIn}
            disabled={geofenceStatus !== 'inside'}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Clock In (Campus Geofence Verified)</span>
          </button>
        ) : !checkOutTime ? (
          <button
            type="button"
            onClick={handleSelfClockOut}
            className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Clock Out (End Shift)</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Daily Shift Completed (In: {checkInTime} • Out: {checkOutTime})</span>
          </div>
        )}

        {/* Secondary Scan QR code button */}
        {!isCheckedIn && (
          <button
            type="button"
            onClick={handleSimulateWallQRScan}
            disabled={isScanningQR}
            className="w-full py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
            <span>{isScanningQR ? 'Scanning Wall QR Code...' : 'Scan Staff Lounge QR Code'}</span>
          </button>
        )}
      </div>

      {/* Clock-in history timestamp */}
      {checkInTime && (
        <div className="pt-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-[11px] text-[hsl(var(--text-tertiary))]">
          <span>Clocked in at: <strong className="text-[hsl(var(--text-primary))]">{checkInTime}</strong></span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Geotag Authenticated
          </span>
        </div>
      )}
    </div>
  );
}
