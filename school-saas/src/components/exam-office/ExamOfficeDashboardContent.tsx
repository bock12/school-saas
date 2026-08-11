'use client';

import { Suspense } from 'react';
import {
  ExamDashboardTab,
  SessionsTab,
  GradingSystemsTab,
  QuestionBankTab,
  EligibilityTab,
  AdmitCardsTab,
  TimetablesTab,
  RoomsTab,
  SeatingTab,
  InvigilationTab,
  HallAttendanceTab,
  MalpracticeTab,
  ScoreEntryTab,
  MissingMarksTab,
  ModerationTab,
  ValidationTab,
  ApprovalTab,
  PublicationTab,
  AnalyticsTab,
  ReportsTab,
  AppealsTab,
  BroadsheetsTab,
  TranscriptsTab,
  AuditTab,
  CalendarTab,
  NotificationsTab,
  SettingsTab,
  CommunicationsTab,
  AdmissionsTab,
} from './tabs';

export type OfficerData = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantSlug: string;
  tenantName: string;
  primaryColor: string;
  schoolLevel: string;
};

const TAB_MAP: Record<string, React.ComponentType<{ officer: OfficerData }>> = {
  dashboard: ExamDashboardTab,
  communications: CommunicationsTab,
  sessions: SessionsTab,
  'grading-systems': GradingSystemsTab,
  'question-bank': QuestionBankTab,
  eligibility: EligibilityTab,
  'admit-cards': AdmitCardsTab,
  timetables: TimetablesTab,
  rooms: RoomsTab,
  seating: SeatingTab,
  invigilation: InvigilationTab,
  'hall-attendance': HallAttendanceTab,
  malpractice: MalpracticeTab,
  'score-entry': ScoreEntryTab,
  'missing-marks': MissingMarksTab,
  moderation: ModerationTab,
  validation: ValidationTab,
  approval: ApprovalTab,
  publication: PublicationTab,
  analytics: AnalyticsTab,
  reports: ReportsTab,
  appeals: AppealsTab,
  broadsheets: BroadsheetsTab,
  transcripts: TranscriptsTab,
  audit: AuditTab,
  calendar: CalendarTab,
  notifications: NotificationsTab,
  settings: SettingsTab,
  admissions: AdmissionsTab,
};

function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-sm text-[hsl(var(--text-tertiary))]">Loading...</p>
      </div>
    </div>
  );
}

export function ExamOfficeDashboardContent({
  tab,
  officer,
}: {
  tab: string;
  officer: OfficerData;
}) {
  const Component = TAB_MAP[tab] ?? ExamDashboardTab;

  return (
    <Suspense fallback={<TabLoadingFallback />}>
      <Component officer={officer} />
    </Suspense>
  );
}
