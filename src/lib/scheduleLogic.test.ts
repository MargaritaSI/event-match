import { describe, it, expect } from 'vitest';
import { computeGaps, timeToMinutes, minutesToLabel, gapSuggestion, locationToZoneId } from './scheduleLogic';
import type { Session } from '../data/schedule';

function s(id: string, day: 1 | 2, time: string, endTime: string): Session {
  return { id, day, time, endTime, title: id, location: 'Working Zone', locationColor: '#000', type: 'talk' };
}

describe('timeToMinutes / minutesToLabel', () => {
  it('converts time strings', () => {
    expect(timeToMinutes('10:30')).toBe(630);
    expect(timeToMinutes('00:00')).toBe(0);
  });
  it('formats durations', () => {
    expect(minutesToLabel(30)).toBe('30 min');
    expect(minutesToLabel(60)).toBe('1h');
    expect(minutesToLabel(90)).toBe('1h 30min');
  });
});

describe('computeGaps', () => {
  it('finds the free gap between two sessions', () => {
    const gaps = computeGaps([s('a', 1, '10:00', '11:00'), s('b', 1, '11:30', '12:00')]);
    expect(gaps.length).toBe(1);
    expect(gaps[0]).toMatchObject({ afterSessionId: 'a', beforeSessionId: 'b', startTime: '11:00', endTime: '11:30', minutes: 30 });
  });

  it('sorts unordered sessions before computing', () => {
    const gaps = computeGaps([s('b', 1, '14:00', '15:00'), s('a', 1, '10:00', '11:00')]);
    expect(gaps[0].afterSessionId).toBe('a');
    expect(gaps[0].minutes).toBe(180);
  });

  it('returns no gap for back-to-back or overlapping sessions', () => {
    expect(computeGaps([s('a', 1, '10:00', '11:00'), s('b', 1, '11:00', '12:00')])).toEqual([]);
    expect(computeGaps([s('a', 1, '10:00', '11:30'), s('b', 1, '11:00', '12:00')])).toEqual([]);
  });

  it('does not create gaps across different days', () => {
    const gaps = computeGaps([s('a', 1, '16:00', '17:00'), s('b', 2, '09:00', '10:00')]);
    expect(gaps).toEqual([]);
  });

  it('handles a single session (no gaps)', () => {
    expect(computeGaps([s('a', 1, '10:00', '11:00')])).toEqual([]);
  });
});

describe('gapSuggestion', () => {
  it('scales the suggestion with available time', () => {
    expect(gapSuggestion(10).text).toMatch(/quick/i);
    expect(gapSuggestion(30).cta).toContain('Random Coffee');
    expect(gapSuggestion(90).text).toMatch(/plenty/i);
  });
});

describe('locationToZoneId', () => {
  it('maps known locations to zone ids', () => {
    expect(locationToZoneId('Web Engineering Track')).toBe('webtrack');
    expect(locationToZoneId('Working Zone')).toBe('working');
    expect(locationToZoneId('Food Court')).toBe('food');
    expect(locationToZoneId('Coffee Point')).toBe('coffee');
  });
  it('returns null for non-physical locations', () => {
    expect(locationToZoneId('Online')).toBeNull();
  });
});
