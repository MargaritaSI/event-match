import type { Contact, Task } from '../types';

export interface CaptureForm {
  name: string;
  context: string;
  talkedAbout: string;
  nextStep: string;
  followUpDays: number;
  tag: Contact['tag'];
  linkedUserId?: string;
}

/** Which optional fields are still empty — used to nudge the user before saving. */
export function emptyCaptureFields(form: CaptureForm): string[] {
  const missing: string[] = [];
  if (!form.nextStep.trim()) missing.push('nextStep');
  if (!form.context.trim()) missing.push('context');
  if (!form.talkedAbout.trim()) missing.push('talkedAbout');
  return missing;
}

/** Date `days` from `from` (defaults to now), normalised to midnight is NOT done — keeps time. */
export function followUpDate(days: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Build the task that a saved capture produces.
 * A task is ALWAYS created. If no explicit next step, it defaults to a follow-up reminder.
 */
export function buildTaskFromCapture(form: CaptureForm, now: Date = new Date(), idSeed = now.getTime()): Task {
  return {
    id: `task-${idSeed}`,
    title: form.nextStep.trim() || `Follow up with ${form.name}`,
    contactName: form.name + (form.context ? ` — ${form.context}` : ''),
    dueDate: followUpDate(form.followUpDays, now),
    tag: form.tag,
    done: false,
    notes: form.talkedAbout || undefined,
    linkedUserId: form.linkedUserId,
  };
}

/** Whether the capture form is valid enough to save (name is required). */
export function canSaveCapture(form: Pick<CaptureForm, 'name'>): boolean {
  return form.name.trim().length > 0;
}
