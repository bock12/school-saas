'use client';
import { useState } from 'react';
import { AssignAdminModal } from './assign-admin-modal';

interface School {
  id: string;
  name: string;
  slug: string | null;
}

interface StaffProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

interface AssignAdminButtonProps {
  school: School;
  orgStaff: StaffProfile[];
}

export function AssignAdminButton({ school, orgStaff }: AssignAdminButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--accent))] hover:border-[hsl(var(--accent)/0.3)] transition-all"
      >
        <span>👤</span> Assign Admin
      </button>

      {open && (
        <AssignAdminModal
          schoolId={school.id}
          schoolName={school.name}
          schoolSlug={school.slug ?? school.id}
          orgStaff={orgStaff}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
