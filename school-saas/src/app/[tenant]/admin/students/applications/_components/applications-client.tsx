'use client';

/**
 * ApplicationsClient — Online Applications Pipeline
 * 
 * Processes student applications submitted through the public /apply portal.
 * Shows the full 7-stage Kanban/List pipeline, pre-filtered to source='online'
 * applicants by the server page.
 */

export { type Applicant } from '../../admissions/types';

// Re-export the pipeline-ready component with mode="applications"
// Note: The pipeline logic lives in pipeline-client.tsx
export { ApplicationsPipeline as ApplicationsClient } from './pipeline-client';
