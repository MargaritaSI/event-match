import type { Session } from '../data/schedule';

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export interface ScheduleGap {
  afterSessionId: string;
  beforeSessionId: string;
  day: 1 | 2;
  startTime: string; // when you're free (prev end)
  endTime: string;   // when next starts
  minutes: number;
}

/**
 * Free gaps between consecutive sessions in MY schedule (per day, sorted by start time).
 * Only positive gaps are returned. Overlapping/back-to-back sessions yield no gap.
 */
export function computeGaps(mySessions: Session[]): ScheduleGap[] {
  const byDay = new Map<number, Session[]>();
  for (const s of mySessions) {
    if (!byDay.has(s.day)) byDay.set(s.day, []);
    byDay.get(s.day)!.push(s);
  }

  const gaps: ScheduleGap[] = [];
  for (const [day, sessions] of byDay) {
    const sorted = [...sessions].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    for (let i = 0; i < sorted.length - 1; i++) {
      const prev = sorted[i];
      const next = sorted[i + 1];
      const gapMin = timeToMinutes(next.time) - timeToMinutes(prev.endTime);
      if (gapMin > 0) {
        gaps.push({
          afterSessionId: prev.id,
          beforeSessionId: next.id,
          day: day as 1 | 2,
          startTime: prev.endTime,
          endTime: next.time,
          minutes: gapMin,
        });
      }
    }
  }
  return gaps;
}

/** Suggested activity copy for a gap, scaled by how much free time there is. */
export function gapSuggestion(minutes: number): { emoji: string; text: string; cta: string } {
  if (minutes < 15) return { emoji: '⚡', text: 'Quick break — grab a coffee', cta: 'Open Connect' };
  if (minutes < 40) return { emoji: '🎲', text: 'Time for a Random Coffee match', cta: '🎲 Random Coffee' };
  return { emoji: '🤝', text: 'Plenty of time — meet someone new or join a group', cta: 'Find people' };
}

/** Map a session's location string to a venue-map zone id (for the schedule→map link). */
export function locationToZoneId(location: string): string | null {
  const l = location.toLowerCase();
  if (l.includes('web engineering')) return 'webtrack';
  if (l.includes('working')) return 'working';
  if (l.includes('registration')) return 'registration';
  if (l.includes('coffee')) return 'coffee';
  if (l.includes('food')) return 'food';
  if (l.includes('hackathon')) return 'hackathon';
  return null; // e.g. "Online"
}
