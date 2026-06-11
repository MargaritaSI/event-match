export type GameAction =
  | 'match' | 'session_added' | 'contact_saved' | 'group_joined'
  | 'coffee_meetup' | 'profile_completed' | 'qr_shown';

export type Counts = Partial<Record<GameAction, number>>;

// Tuned so points accrue gradually — a meaningful match is worth more than a tap.
export const POINTS: Record<GameAction, number> = {
  match: 20,
  session_added: 3,
  contact_saved: 8,
  group_joined: 5,
  coffee_meetup: 10,
  profile_completed: 15,
  qr_shown: 2,
};

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  check: (c: Counts) => boolean;
}

const n = (c: Counts, k: GameAction) => c[k] || 0;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_match',    icon: '🤝', name: 'First Connection', desc: 'Make your first match',        check: c => n(c, 'match') >= 1 },
  { id: 'social',         icon: '🦋', name: 'Social Butterfly', desc: 'Make 5 matches',                check: c => n(c, 'match') >= 5 },
  { id: 'planner',        icon: '📅', name: 'Planner',          desc: 'Add 3 sessions to your schedule', check: c => n(c, 'session_added') >= 3 },
  { id: 'networker',      icon: '📇', name: 'Networker',        desc: 'Save 3 contacts',               check: c => n(c, 'contact_saved') >= 3 },
  { id: 'joiner',         icon: '🏘', name: 'Joiner',           desc: 'Join 2 groups',                 check: c => n(c, 'group_joined') >= 2 },
  { id: 'coffee',         icon: '☕', name: 'Coffee Lover',     desc: 'Do a coffee meetup',            check: c => n(c, 'coffee_meetup') >= 1 },
  { id: 'profile',        icon: '✨', name: 'All Set',          desc: 'Complete your profile',         check: c => n(c, 'profile_completed') >= 1 },
  { id: 'all_rounder',    icon: '🌟', name: 'All-Rounder',      desc: 'Try every core feature',
    check: c => (['match', 'session_added', 'contact_saved', 'group_joined', 'coffee_meetup'] as GameAction[]).every(k => n(c, k) >= 1) },
];

export function totalPoints(c: Counts): number {
  return (Object.keys(POINTS) as GameAction[]).reduce((sum, k) => sum + n(c, k) * POINTS[k], 0);
}

export function unlockedAchievements(c: Counts): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.check(c));
}

/** Achievements newly satisfied going from `prev` to `next` counts. */
export function newlyUnlocked(prev: Counts, next: Counts): Achievement[] {
  const before = new Set(unlockedAchievements(prev).map(a => a.id));
  return unlockedAchievements(next).filter(a => !before.has(a.id));
}

/** Simple level from points (every 100 pts = 1 level, starting at 1). */
export function levelFromPoints(points: number): number {
  return Math.floor(points / 100) + 1;
}
