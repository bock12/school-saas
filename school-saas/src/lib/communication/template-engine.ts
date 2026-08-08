/**
 * Exam Communication Center — Safe Template Engine
 * Whitelisted variable placeholder substitution and validation.
 */

export const WHITELISTED_VARIABLES = [
  'student_name',
  'parent_name',
  'teacher_name',
  'exam_name',
  'subject',
  'class_name',
  'section_name',
  'deadline',
  'result_link',
  'timetable_link',
  'school_name',
  'pending_count',
  'exam_time',
  'exam_date',
  'room_name',
  'incident_type',
] as const;

export type TemplateVariable = (typeof WHITELISTED_VARIABLES)[number];

export interface RenderContext {
  student_name?: string;
  parent_name?: string;
  teacher_name?: string;
  exam_name?: string;
  subject?: string;
  class_name?: string;
  section_name?: string;
  deadline?: string;
  result_link?: string;
  timetable_link?: string;
  school_name?: string;
  pending_count?: number | string;
  exam_time?: string;
  exam_date?: string;
  room_name?: string;
  incident_type?: string;
  [key: string]: string | number | undefined;
}

/**
 * Validates a template string ensuring only whitelisted variables are referenced.
 */
export function validateTemplate(template: string): { valid: boolean; invalidVars: string[] } {
  const matches = template.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || [];
  const invalidVars: string[] = [];

  for (const match of matches) {
    const varName = match.replace(/[\{\}\s]/g, '');
    if (!WHITELISTED_VARIABLES.includes(varName as TemplateVariable)) {
      invalidVars.push(varName);
    }
  }

  return {
    valid: invalidVars.length === 0,
    invalidVars,
  };
}

/**
 * Safely renders a template string by replacing placeholders with context values.
 */
export function renderTemplate(template: string, context: RenderContext): string {
  if (!template) return '';

  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, varName) => {
    if (WHITELISTED_VARIABLES.includes(varName as TemplateVariable)) {
      const val = context[varName];
      return val !== undefined && val !== null ? String(val) : `[${varName}]`;
    }
    return `[Unapproved: ${varName}]`;
  });
}
