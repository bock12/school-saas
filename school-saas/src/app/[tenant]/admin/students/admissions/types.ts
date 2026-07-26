/**
 * Shared Applicant type used across the admissions pipeline.
 * Imported by:
 *  - applications/_components/pipeline-client.tsx
 *  - applications/_components/applications-client.tsx
 *  - applications/page.tsx
 */
export interface Applicant {
  id: string;
  name: string;
  grade: string;
  parentName: string;
  appliedDate: string;
  dob: string;
  stage: 'Application' | 'Verification' | 'Interview' | 'Assessment' | 'Acceptance' | 'Enrollment' | 'Allocation';
  docsVerified: boolean;
  interviewScore: number | null;
  assessmentScore: number | null;
  comment: string;
  photoUrl?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  prevSchool?: string;
  documents?: Array<{ type: string; name: string; url: string }>;
  status?: 'active' | 'rejected';
  rejectionReason?: string;
  interviewDate?: string;
  interviewLocation?: string;
  assessmentDate?: string;
  assessmentLocation?: string;
  assessmentDetails?: {
    mathScore?: number;
    englishScore?: number;
    scienceScore?: number;
    overallScore?: number;
  };
  offerAccepted?: boolean;
  acceptedAt?: string;
  parentSignature?: string;
  paymentCleared?: boolean;
  receiptNumber?: string;
  paymentMethod?: string;
  paymentReceiptUrl?: string;
  paymentPhone?: string;
  transactionId?: string;
}
