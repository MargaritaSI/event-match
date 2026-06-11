import { describe, it, expect } from 'vitest';
import { buildTaskFromCapture, followUpDate, canSaveCapture, emptyCaptureFields } from './captureLogic';
import type { CaptureForm } from './captureLogic';

const base: CaptureForm = {
  name: 'Alex',
  context: 'Founder',
  talkedAbout: 'Wants UX help',
  nextStep: 'Send portfolio',
  followUpDays: 3,
  tag: 'networking',
};

describe('canSaveCapture', () => {
  it('requires a non-empty name', () => {
    expect(canSaveCapture({ name: 'Alex' })).toBe(true);
    expect(canSaveCapture({ name: '' })).toBe(false);
    expect(canSaveCapture({ name: '   ' })).toBe(false);
  });
});

describe('followUpDate', () => {
  it('adds the right number of days', () => {
    const from = new Date('2026-06-11T10:00:00');
    expect(followUpDate(1, from).getDate()).toBe(12);
    expect(followUpDate(3, from).getDate()).toBe(14);
    expect(followUpDate(7, from).getDate()).toBe(18);
  });

  it('rolls over month boundaries', () => {
    const from = new Date('2026-06-28T10:00:00');
    const d = followUpDate(5, from);
    expect(d.getMonth()).toBe(6); // July (0-indexed)
    expect(d.getDate()).toBe(3);
  });
});

describe('buildTaskFromCapture', () => {
  const now = new Date('2026-06-11T10:00:00');

  it('uses the next step as the task title when provided', () => {
    const task = buildTaskFromCapture(base, now, 1);
    expect(task.title).toBe('Send portfolio');
  });

  it('ALWAYS creates a task — defaults the title when next step is empty', () => {
    const task = buildTaskFromCapture({ ...base, nextStep: '' }, now, 1);
    expect(task.title).toBe('Follow up with Alex');
  });

  it('treats whitespace-only next step as empty', () => {
    const task = buildTaskFromCapture({ ...base, nextStep: '   ' }, now, 1);
    expect(task.title).toBe('Follow up with Alex');
  });

  it('combines name and context into contactName', () => {
    expect(buildTaskFromCapture(base, now, 1).contactName).toBe('Alex — Founder');
    expect(buildTaskFromCapture({ ...base, context: '' }, now, 1).contactName).toBe('Alex');
  });

  it('sets the due date by followUpDays', () => {
    const task = buildTaskFromCapture({ ...base, followUpDays: 7 }, now, 1);
    expect(task.dueDate.getDate()).toBe(18);
  });

  it('starts not done and carries notes + tag', () => {
    const task = buildTaskFromCapture(base, now, 1);
    expect(task.done).toBe(false);
    expect(task.notes).toBe('Wants UX help');
    expect(task.tag).toBe('networking');
  });

  it('omits notes when nothing was discussed', () => {
    const task = buildTaskFromCapture({ ...base, talkedAbout: '' }, now, 1);
    expect(task.notes).toBeUndefined();
  });

  it('carries the linked attendee id so Tasks can show their profile', () => {
    const task = buildTaskFromCapture({ ...base, linkedUserId: '4' }, now, 1);
    expect(task.linkedUserId).toBe('4');
  });
});

describe('emptyCaptureFields', () => {
  it('flags every empty optional field', () => {
    const empty = emptyCaptureFields({ ...base, nextStep: '', context: '', talkedAbout: '' });
    expect(empty).toEqual(['nextStep', 'context', 'talkedAbout']);
  });

  it('flags nothing when all filled', () => {
    expect(emptyCaptureFields(base)).toEqual([]);
  });

  it('treats whitespace as empty', () => {
    expect(emptyCaptureFields({ ...base, nextStep: '   ' })).toContain('nextStep');
  });
});
