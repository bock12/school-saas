'use client';

import { useRef } from 'react';
import { X, Printer, CreditCard } from 'lucide-react';

interface StaffForCard {
  id: string;
  full_name: string | null;
  email: string | null;
  job_title: string | null;
  department: string | null;
  staff_id: string | null;
  avatar_url?: string | null;
  schoolName: string;
}

interface IdCardModalProps {
  staff: StaffForCard;
  orgName: string;
  orgLogoUrl?: string | null;
  primaryColor?: string;
  onClose: () => void;
}

/**
 * CR80 Standard Size: 3.375in × 2.125in (85.6mm × 54mm)
 * At 96dpi: 324px × 204px
 */
export function IdCardModal({ staff, orgName, orgLogoUrl, primaryColor = '#6366f1', onClose }: IdCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const initials = (staff.full_name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=500,height=400');
    if (!printWindow) return;

    const cardHtml = cardRef.current?.innerHTML ?? '';

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Staff ID Card — ${staff.full_name}</title>
  <style>
    @page {
      size: 3.375in 2.125in;
      margin: 0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 3.375in;
      height: 2.125in;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      overflow: hidden;
      background: white;
    }
    .card {
      width: 3.375in;
      height: 2.125in;
      background: white;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .card-header {
      background: ${primaryColor};
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: white;
    }
    .org-logo {
      width: 22px;
      height: 22px;
      border-radius: 4px;
      object-fit: contain;
      background: rgba(255,255,255,0.2);
    }
    .org-name {
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: white;
    }
    .card-body {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 8px 10px;
      gap: 10px;
    }
    .avatar {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      border: 2px solid ${primaryColor};
      object-fit: cover;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18pt;
      font-weight: 800;
      color: ${primaryColor};
      flex-shrink: 0;
    }
    .info { flex: 1; }
    .name { font-size: 11pt; font-weight: 800; color: #111; line-height: 1.1; }
    .role { font-size: 7pt; font-weight: 600; color: ${primaryColor}; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.6px; }
    .dept { font-size: 6.5pt; color: #666; margin-top: 1px; }
    .email { font-size: 6pt; color: #888; margin-top: 4px; word-break: break-all; }
    .card-footer {
      background: #f8f8f8;
      border-top: 1px solid #e5e7eb;
      padding: 4px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .staff-id {
      font-size: 6.5pt;
      font-weight: 700;
      font-family: monospace;
      color: #374151;
      letter-spacing: 1px;
    }
    .id-label { font-size: 5pt; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .accent-bar {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: ${primaryColor};
      opacity: 0.3;
    }
  </style>
</head>
<body onload="window.print(); window.close();">
  <div class="card">
    <div class="accent-bar"></div>
    <div class="card-header">
      ${orgLogoUrl ? `<img src="${orgLogoUrl}" class="org-logo" alt="Logo" />` : ''}
      <div class="org-name">${orgName}</div>
    </div>
    <div class="card-body">
      <div class="avatar" style="overflow:hidden;">
        ${staff.avatar_url ? `<img src="${staff.avatar_url}" style="width:54px;height:54px;object-fit:cover;" alt="Photo" />` : initials}
      </div>
      <div class="info">
        <div class="name">${staff.full_name ?? 'Staff Member'}</div>
        <div class="role">${staff.job_title ?? staff.department ?? 'Staff'}</div>
        <div class="dept">${staff.department ?? ''}</div>
        <div class="dept">${staff.schoolName}</div>
        <div class="email">${staff.email ?? ''}</div>
      </div>
    </div>
    <div class="card-footer">
      <div>
        <div class="id-label">Staff ID</div>
        <div class="staff-id">${staff.staff_id ?? 'N/A'}</div>
      </div>
      <div style="text-align:right">
        <div class="id-label">Valid 2026</div>
        <div class="staff-id" style="font-size:5.5pt;letter-spacing:0.5px;">OFFICIAL</div>
      </div>
    </div>
  </div>
</body>
</html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[hsl(var(--accent))]" />
            <h2 className="text-lg font-bold text-[hsl(var(--text-primary))]">Staff ID Card</h2>
            <span className="text-xs text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-tertiary))] px-2 py-0.5 rounded-full">CR80 Format</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            <X className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
          </button>
        </div>

        {/* Card Preview (CR80 proportions: 3.375:2.125 ≈ 1.588:1) */}
        <div className="p-6 flex justify-center">
          <div ref={cardRef}
            style={{ width: '340px', height: '214px', borderRadius: '8px' }}
            className="relative overflow-hidden shadow-xl border border-gray-200 bg-white flex flex-col"
          >
            {/* Accent bar */}
            <div className="absolute right-0 top-0 bottom-0 w-1.5 opacity-30 rounded-r" style={{ backgroundColor: primaryColor }} />

            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: primaryColor }}>
              {orgLogoUrl ? (
                <img src={orgLogoUrl} alt="logo" className="w-6 h-6 rounded object-contain bg-white/20" />
              ) : null}
              <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">{orgName}</span>
            </div>

            {/* Body */}
            <div className="flex-1 flex items-center px-4 py-2 gap-3">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden border-2"
                style={{ borderColor: primaryColor, backgroundColor: '#f3f4f6' }}>
                {(staff as any).avatar_url ? (
                  <img src={(staff as any).avatar_url} alt="photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-black" style={{ color: primaryColor }}>
                    {initials}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 leading-tight truncate">{staff.full_name}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: primaryColor }}>
                  {staff.job_title ?? staff.department ?? 'Staff'}
                </p>
                {staff.department && <p className="text-[9px] text-gray-500 mt-0.5">{staff.department}</p>}
                <p className="text-[9px] text-gray-500">{staff.schoolName}</p>
                {staff.email && <p className="text-[8px] text-gray-400 mt-1 truncate">{staff.email}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50 border-t border-gray-100">
              <div>
                <p className="text-[7px] text-gray-400 uppercase tracking-wider">Staff ID</p>
                <p className="text-[9px] font-bold font-mono text-gray-700 tracking-widest">{staff.staff_id ?? 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] text-gray-400 uppercase tracking-wider">Valid</p>
                <p className="text-[9px] font-bold text-gray-700">2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-[hsl(var(--text-tertiary))] -mt-2 mb-4">
          CR80 — 3.375&quot; × 2.125&quot; (standard credit card size)
        </p>

        {/* Actions */}
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
            Close
          </button>
          <button onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-hover))] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" />
            Print ID Card
          </button>
        </div>
      </div>
    </div>
  );
}
