import { Suspense } from 'react';
import StudentPortalPage from '../admin/students/portal/page';

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center text-xs text-[hsl(var(--text-tertiary))] font-mono">
        Loading Student Portal...
      </div>
    }>
      <StudentPortalPage />
    </Suspense>
  );
}
