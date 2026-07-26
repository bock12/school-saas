'use client';

import { useRef, useState } from 'react';
import { X, Printer, CreditCard, RotateCcw } from 'lucide-react';

export interface StudentForCard {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  email: string | null;
  gender: string | null;
  className: string;
  sectionName: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  avatar_url: string | null;
  admitted_at: string;
}

interface StudentIdCardModalProps {
  student: StudentForCard;
  orgName: string;
  orgLogoUrl?: string | null;
  onClose: () => void;
}

/** Generates a decorative QR-like SVG pattern from a seed string. */
function MiniQR({ value, size = 48 }: { value: string; size?: number }) {
  const cells = 7;
  const cell = size / cells;
  const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid: boolean[][] = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      const inFinder =
        (r < 2 && c < 2) || (r < 2 && c >= cells - 2) || (r >= cells - 2 && c < 2);
      if (inFinder) return true;
      return ((seed * (r + 1) * (c + 1) * 13) % 7) > 2;
    })
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell + 0.5}
              y={r * cell + 0.5}
              width={cell - 1}
              height={cell - 1}
              rx={0.5}
              fill="currentColor"
            />
          ) : null
        )
      )}
    </svg>
  );
}

function GoldWave({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 28"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{ transform: flip ? 'scaleY(-1)' : undefined }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="gwS" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b8860b" />
          <stop offset="40%" stopColor="#ffd700" />
          <stop offset="70%" stopColor="#daa520" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      <path d="M0,18 Q40,4 80,18 Q120,32 160,18 L160,28 L0,28 Z" fill="#1a1a2e" opacity="0.9" />
      <path d="M0,16 Q40,2 80,16 Q120,30 160,16 L160,20 Q120,34 80,20 Q40,6 0,20 Z" fill="url(#gwS)" />
      <path d="M0,14 Q40,0 80,14 Q120,28 160,14 L160,15.5 Q120,29.5 80,15.5 Q40,1.5 0,15.5 Z" fill="#ffd700" opacity="0.5" />
    </svg>
  );
}

export function StudentIdCardModal({
  student,
  orgName,
  orgLogoUrl,
  onClose,
}: StudentIdCardModalProps) {
  const [showBack, setShowBack] = useState(false);

  const fullName = `${student.first_name} ${student.last_name}`;
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
  const classLabel = student.className ? `${student.className}${student.sectionName ? ` — ${student.sectionName}` : ''}` : 'Unassigned';

  const admittedDate = student.admitted_at
    ? new Date(student.admitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';
  const today = new Date();
  const expireDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const avatarBg = student.gender === 'female' ? '#6d1b7b' : '#0d3b6e';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Student ID Card — ${fullName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    @page { size: 85.6mm 54mm portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #fff; }
    .page { width: 85.6mm; min-height: 108mm; display: flex; flex-direction: column; gap: 4mm; padding: 4mm; }
    .card { width: 85.6mm; height: 54mm; border-radius: 3mm; overflow: hidden; position: relative; display: flex; flex-direction: column; page-break-inside: avoid; }
    .front { background: #1a1a2e; }
    .front-top { padding: 4mm 4mm 0; display: flex; flex-direction: column; align-items: center; }
    .org-name { font-size: 8pt; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; color: #ffffff; }
    .slogan { font-size: 5pt; color: #d4af37; letter-spacing: 1px; text-transform: uppercase; margin-top: 0.5mm; }
    .wave-container { position: relative; margin-top: 1mm; }
    .avatar-ring { position: absolute; left: 50%; top: -9mm; transform: translateX(-50%); width: 18mm; height: 18mm; border-radius: 50%; border: 1.5px solid #d4af37; background: ${avatarBg}; display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 14pt; font-weight: 900; color: #d4af37; }
    .avatar-ring img { width: 100%; height: 100%; object-fit: cover; }
    .front-bottom { flex: 1; padding: 10mm 4mm 3mm; display: flex; flex-direction: column; align-items: center; }
    .full-name { font-size: 11pt; font-weight: 900; color: #ffffff; text-align: center; }
    .designation { font-size: 7pt; color: #d4af37; font-weight: 600; margin-top: 0.5mm; text-align: center; }
    .details-grid { margin-top: 2mm; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5mm 3mm; }
    .detail-row { display: flex; align-items: baseline; gap: 1mm; }
    .detail-label { font-size: 5.5pt; color: #9ca3af; font-weight: 600; white-space: nowrap; min-width: 14mm; }
    .detail-value { font-size: 5.5pt; color: #e5e7eb; }
    .back { background: #ffffff; }
    .back-top { background: #1a1a2e; padding: 2mm 4mm; display: flex; align-items: center; justify-content: center; }
    .back-title { font-size: 7pt; font-weight: 900; text-transform: uppercase; color: white; letter-spacing: 0.5px; }
    .back-content { flex: 1; padding: 2mm 4mm; }
    .terms-text { font-size: 5pt; color: #6b7280; text-align: center; line-height: 1.4; }
    .info-grid { margin-top: 2mm; display: grid; grid-template-columns: auto 1fr; gap: 0.5mm 2mm; }
    .info-label { font-size: 5.5pt; color: #374151; font-weight: 600; }
    .info-value { font-size: 5.5pt; color: #111827; }
    .back-signature { margin-top: 2mm; display: flex; align-items: flex-end; justify-content: space-between; }
    .sig-text { font-family: 'Brush Script MT', cursive; font-size: 9pt; color: #1a1a2e; }
    .sig-name { font-size: 5.5pt; color: #374151; font-weight: 700; }
    .sig-title { font-size: 4.5pt; color: #6b7280; }
    .qr-block { display: flex; flex-direction: column; align-items: center; }
    .qr-label { font-size: 4pt; color: #9ca3af; margin-top: 0.5mm; }
    .back-footer { background: #1a1a2e; padding: 1.5mm 4mm; display: flex; align-items: center; justify-content: space-between; }
    .footer-org { font-size: 6pt; font-weight: 900; color: white; text-transform: uppercase; }
    .footer-slogan { font-size: 4pt; color: #d4af37; text-transform: uppercase; }
  </style>
</head>
<body onload="window.print(); window.close();">
<div class="page">
  <!-- FRONT -->
  <div class="card front">
    <div class="front-top">
      <div class="org-name">${orgName}</div>
      <div class="slogan">Student Identity Card</div>
    </div>
    <div class="wave-container">
      <svg viewBox="0 0 160 28" xmlns="http://www.w3.org/2000/svg" width="100%" preserveAspectRatio="none">
        <defs><linearGradient id="gw3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#b8860b"/><stop offset="40%" stop-color="#ffd700"/>
          <stop offset="70%" stop-color="#daa520"/><stop offset="100%" stop-color="#b8860b"/>
        </linearGradient></defs>
        <path d="M0,18 Q40,4 80,18 Q120,32 160,18 L160,28 L0,28 Z" fill="#1a1a2e" opacity="0.9"/>
        <path d="M0,16 Q40,2 80,16 Q120,30 160,16 L160,20 Q120,34 80,20 Q40,6 0,20 Z" fill="url(#gw3)"/>
      </svg>
      <div class="avatar-ring">
        ${student.avatar_url ? `<img src="${student.avatar_url}" alt="Photo" />` : initials}
      </div>
    </div>
    <div class="front-bottom">
      <div class="full-name">${fullName}</div>
      <div class="designation">${classLabel}</div>
      <div class="details-grid">
        <div class="detail-row"><span class="detail-label">Adm No</span><span class="detail-value">: ${student.admission_number}</span></div>
        <div class="detail-row"><span class="detail-label">Class</span><span class="detail-value">: ${student.className}</span></div>
        <div class="detail-row"><span class="detail-label">Guardian</span><span class="detail-value">: ${student.guardian_name ?? '—'}</span></div>
        <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">: ${student.guardian_phone ?? '—'}</span></div>
        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">: ${student.email ?? '—'}</span></div>
        <div class="detail-row"><span class="detail-label">Expire</span><span class="detail-value">: ${expireDate}</span></div>
      </div>
    </div>
  </div>

  <!-- BACK -->
  <div class="card back">
    <div class="back-top"><div class="back-title">Terms &amp; Conditions</div></div>
    <div>
      <svg viewBox="0 0 160 14" xmlns="http://www.w3.org/2000/svg" width="100%" preserveAspectRatio="none" style="transform:scaleY(-1)">
        <defs><linearGradient id="gw4" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#b8860b"/><stop offset="40%" stop-color="#ffd700"/>
          <stop offset="100%" stop-color="#b8860b"/>
        </linearGradient></defs>
        <path d="M0,8 Q40,0 80,8 Q120,16 160,8 L160,14 L0,14 Z" fill="#1a1a2e"/>
        <path d="M0,7 Q40,-1 80,7 Q120,15 160,7 L160,9 Q120,17 80,9 Q40,1 0,9 Z" fill="url(#gw4)"/>
      </svg>
    </div>
    <div class="back-content">
      <div class="terms-text">This card is property of ${orgName}. If found, please return to school administration. This card must be worn visibly at all times on school premises.</div>
      <div class="info-grid">
        <span class="info-label">Admitted</span><span class="info-value">: ${admittedDate}</span>
        <span class="info-label">Expire</span><span class="info-value">: ${expireDate}</span>
        <span class="info-label">Guardian</span><span class="info-value">: ${student.guardian_name ?? '—'}</span>
        <span class="info-label">Contact</span><span class="info-value">: ${student.guardian_phone ?? '—'}</span>
      </div>
      <div class="back-signature">
        <div>
          <div class="sig-text">${fullName}</div>
          <div class="sig-name">${fullName}</div>
          <div class="sig-title">Student — ${student.className}</div>
        </div>
        <div class="qr-block">
          <svg width="30" height="30" viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="2" height="2" fill="#1a1a2e"/>
            <rect x="5" y="0" width="2" height="2" fill="#1a1a2e"/>
            <rect x="0" y="5" width="2" height="2" fill="#1a1a2e"/>
            <rect x="3" y="1" width="1" height="1" fill="#1a1a2e"/>
            <rect x="1" y="3" width="2" height="1" fill="#1a1a2e"/>
            <rect x="4" y="3" width="1" height="1" fill="#1a1a2e"/>
            <rect x="3" y="4" width="2" height="1" fill="#1a1a2e"/>
            <rect x="3" y="6" width="1" height="1" fill="#1a1a2e"/>
            <rect x="5" y="5" width="2" height="2" fill="#1a1a2e"/>
          </svg>
          <div class="qr-label">QR</div>
        </div>
      </div>
    </div>
    <div class="back-footer">
      <div><div class="footer-org">${orgName}</div><div class="footer-slogan">Student Identity Card</div></div>
    </div>
  </div>
</div>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-[hsl(var(--text-primary))]">Student ID Card</h2>
            <span className="text-[10px] text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-2 py-0.5 rounded-full">
              {showBack ? 'Back' : 'Front'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-6 flex justify-center">
          {/* FRONT */}
          <div
            style={{
              width: '200px',
              height: '320px',
              borderRadius: '12px',
              display: showBack ? 'none' : 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              background: '#1a1a2e',
            }}
          >
            {/* Org name */}
            <div className="flex flex-col items-center pt-4 pb-0 px-4 text-center">
              <p className="text-[10px] font-black text-white uppercase tracking-[1.5px] leading-tight">{orgName}</p>
              <p className="text-[7px] text-amber-400 uppercase tracking-widest mt-0.5">Student Identity Card</p>
            </div>

            {/* Gold wave + avatar */}
            <div className="relative mt-2" style={{ height: '70px' }}>
              <div className="absolute inset-x-0 bottom-0">
                <GoldWave />
              </div>
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full border-2 border-amber-400 overflow-hidden flex items-center justify-center font-black text-amber-400"
                style={{
                  width: '72px',
                  height: '72px',
                  top: '-10px',
                  fontSize: '22px',
                  background: avatarBg,
                  boxShadow: '0 4px 16px rgba(212,175,55,0.3)',
                }}
              >
                {student.avatar_url ? (
                  <img src={student.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 bg-[#1a1a2e] flex flex-col items-center px-4 pt-10 pb-3">
              <p className="text-sm font-black text-white text-center leading-tight">{fullName}</p>
              <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mt-0.5 text-center">
                {classLabel}
              </p>
              <div className="mt-3 w-full space-y-1">
                {[
                  { label: 'Adm No', value: student.admission_number },
                  { label: 'Class', value: student.className },
                  { label: 'Guardian', value: student.guardian_name ?? '—' },
                  { label: 'Phone', value: student.guardian_phone ?? '—' },
                  { label: 'Email', value: student.email ?? '—' },
                  { label: 'Expire', value: expireDate },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-baseline gap-1">
                    <span className="text-[8px] text-gray-400 w-12 flex-shrink-0 font-semibold">{label}</span>
                    <span className="text-[8px] text-gray-300 truncate">: {value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            style={{
              width: '200px',
              height: '320px',
              borderRadius: '12px',
              display: showBack ? 'flex' : 'none',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              background: '#ffffff',
            }}
          >
            <div className="bg-[#1a1a2e] px-4 py-2.5 flex items-center justify-center">
              <p className="text-[8px] font-black text-white uppercase tracking-[1px]">Terms &amp; Conditions</p>
            </div>
            <div style={{ transform: 'scaleY(-1)', marginBottom: '-2px' }}>
              <GoldWave />
            </div>

            <div className="flex-1 px-4 py-2 flex flex-col">
              <p className="text-[7px] text-center text-gray-500 leading-relaxed">
                This card is the property of <strong>{orgName}</strong>. It must be worn visibly on school premises at all times. Report loss to administration immediately.
              </p>
              <div className="mt-2 space-y-0.5">
                {[
                  { label: 'Admitted', value: admittedDate },
                  { label: 'Expire', value: expireDate },
                  { label: 'Guardian', value: student.guardian_name ?? '—' },
                  { label: 'Contact', value: student.guardian_phone ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-baseline gap-1">
                    <span className="text-[8px] text-gray-500 w-12 flex-shrink-0">{label}</span>
                    <span className="text-[8px] text-gray-800">: {value}</span>
                  </div>
                ))}
              </div>

              {/* Signature + QR */}
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="font-['Brush_Script_MT',_cursive] text-[14px] text-[#1a1a2e] italic leading-tight">
                    {fullName}
                  </p>
                  <p className="text-[7px] font-bold text-gray-700 mt-0.5">{fullName}</p>
                  <p className="text-[6px] text-gray-500">Student — {student.className}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-[#1a1a2e]">
                    <MiniQR value={student.admission_number ?? student.id} size={44} />
                  </div>
                  <span className="text-[6px] text-gray-400 mt-0.5">QR</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div>
              <GoldWave flip />
              <div className="bg-[#1a1a2e] px-4 py-2 flex flex-col items-center">
                <p className="text-[8px] font-black text-white uppercase tracking-[1px]">{orgName}</p>
                <p className="text-[6px] text-amber-400 uppercase tracking-widest">Student Identity Card</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={() => setShowBack((v) => !v)}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {showBack ? 'Show Front' : 'Flip to Back'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Card
          </button>
        </div>
      </div>
    </div>
  );
}
