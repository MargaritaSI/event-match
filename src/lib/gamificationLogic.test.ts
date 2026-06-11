import { describe, it, expect } from 'vitest';
import {
  totalPoints, unlockedAchievements, newlyUnlocked, levelFromPoints, POINTS,
} from './gamificationLogic';
import type { Counts } from './gamificationLogic';

describe('totalPoints', () => {
  it('sums points across actions', () => {
    const c: Counts = { match: 2, session_added: 3 };
    expect(totalPoints(c)).toBe(2 * POINTS.match + 3 * POINTS.session_added);
  });
  it('is zero for no actions', () => {
    expect(totalPoints({})).toBe(0);
  });
});

describe('unlockedAchievements', () => {
  it('unlocks first match at 1 and social butterfly at 5', () => {
    expect(unlockedAchievements({ match: 1 }).map(a => a.id)).toContain('first_match');
    expect(unlockedAchievements({ match: 1 }).map(a => a.id)).not.toContain('social');
    expect(unlockedAchievements({ match: 5 }).map(a => a.id)).toContain('social');
  });

  it('unlocks all-rounder only when every core action done', () => {
    const partial: Counts = { match: 1, session_added: 1, contact_saved: 1, group_joined: 1 };
    expect(unlockedAchievements(partial).map(a => a.id)).not.toContain('all_rounder');
    const full: Counts = { ...partial, coffee_meetup: 1 };
    expect(unlockedAchievements(full).map(a => a.id)).toContain('all_rounder');
  });
});

describe('newlyUnlocked', () => {
  it('reports only achievements crossed by the latest action', () => {
    const fresh = newlyUnlocked({ match: 0 }, { match: 1 });
    expect(fresh.map(a => a.id)).toEqual(['first_match']);
  });
  it('reports nothing when no new threshold is crossed', () => {
    expect(newlyUnlocked({ match: 2 }, { match: 3 })).toEqual([]);
  });
});

describe('levelFromPoints', () => {
  it('starts at level 1 and rises every 100 points', () => {
    expect(levelFromPoints(0)).toBe(1);
    expect(levelFromPoints(99)).toBe(1);
    expect(levelFromPoints(100)).toBe(2);
    expect(levelFromPoints(250)).toBe(3);
  });
});
