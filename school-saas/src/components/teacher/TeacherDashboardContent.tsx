'use client';

import { Suspense } from 'react';
import { DashboardTab } from './tabs/DashboardTab';
import { AttendanceTab } from './tabs/AttendanceTab';
import { ClassesTab } from './tabs/ClassesTab';
import { SubjectsTab } from './tabs/SubjectsTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { LessonPlansTab } from './tabs/LessonPlansTab';
import { AssignmentsTab } from './tabs/AssignmentsTab';
import { GradebookTab } from './tabs/GradebookTab';
import { StudentsTab } from './tabs/StudentsTab';
import { BehaviourTab } from './tabs/BehaviourTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { ReportsTab } from './tabs/ReportsTab';
import { MessagesTab } from './tabs/MessagesTab';
import { CalendarTab } from './tabs/CalendarTab';
import { MaterialsTab } from './tabs/MaterialsTab';
import { AIAssistantTab } from './tabs/AIAssistantTab';
import { LeaveTab } from './tabs/LeaveTab';
import { SettingsTab } from './tabs/SettingsTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { ProfileTab } from './tabs/ProfileTab';
import { AnnouncementsTab } from './tabs/AnnouncementsTab';
import { ResourcesTab } from './tabs/ResourcesTab';

export type TeacherData = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  tenantSlug: string;
  tenantName: string;
  primaryColor: string;
  schoolLevel: string;
};

const TAB_MAP: Record<string, React.ComponentType<{ teacher: TeacherData }>> = {
  dashboard: DashboardTab,
  attendance: AttendanceTab,
  'attendance-history': AttendanceTab,
  classes: ClassesTab,
  subjects: SubjectsTab,
  schedule: ScheduleTab,
  timetable: ScheduleTab,
  calendar: CalendarTab,
  'lesson-plans': LessonPlansTab,
  assignments: AssignmentsTab,
  materials: MaterialsTab,
  gradebook: GradebookTab,
  scores: GradebookTab,
  students: StudentsTab,
  behaviour: BehaviourTab,
  analytics: AnalyticsTab,
  reports: ReportsTab,
  messages: MessagesTab,
  announcements: AnnouncementsTab,
  'ai-assistant': AIAssistantTab,
  leave: LeaveTab,
  resources: ResourcesTab,
  settings: SettingsTab,
  notifications: NotificationsTab,
  profile: ProfileTab,
};

function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent animate-spin" />
        <p className="text-sm text-[hsl(var(--text-tertiary))]">Loading...</p>
      </div>
    </div>
  );
}

export function TeacherDashboardContent({
  tab,
  teacher,
}: {
  tab: string;
  teacher: TeacherData;
}) {
  const Component = TAB_MAP[tab] ?? DashboardTab;

  return (
    <Suspense fallback={<TabLoadingFallback />}>
      <Component teacher={teacher} />
    </Suspense>
  );
}
