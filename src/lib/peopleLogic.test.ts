import { describe, it, expect } from 'vitest';
import {
  commonInterests, interestFrequency, topInterests, sortUsers, matchesSearch, filterAndSort,
} from './peopleLogic';
import type { User, Interest } from '../types';

const me: Interest[] = ['health', 'mobile', 'startup', 'design'];

function u(id: string, name: string, interests: Interest[], extra: Partial<User> = {}): User {
  return { id, name, bio: '', interests, socials: {}, event: 'e', ...extra };
}

const USERS: User[] = [
  u('1', 'Charlie', ['health', 'mobile', 'startup']),       // 3 common
  u('2', 'Bob', ['design', 'sport']),                      // 1 common
  u('3', 'Alice', ['travel', 'sport']),                    // 0 common
  u('4', 'Dave', ['health', 'design'], { role: 'iOS Dev', lookingFor: 'a backend partner' }),
];

describe('commonInterests', () => {
  it('returns only shared interests', () => {
    expect(commonInterests(USERS[0], me)).toEqual(['health', 'mobile', 'startup']);
    expect(commonInterests(USERS[2], me)).toEqual([]);
  });
});

describe('interestFrequency', () => {
  it('counts interest occurrences across the crowd', () => {
    const freq = interestFrequency(USERS);
    expect(freq.health).toBe(2);
    expect(freq.sport).toBe(2);
    expect(freq.mobile).toBe(1);
  });
});

describe('topInterests', () => {
  it('orders interests most-common first', () => {
    const top = topInterests(USERS);
    expect(top[0].count).toBeGreaterThanOrEqual(top[top.length - 1].count);
    // health and sport both appear twice → among the top
    expect(top.slice(0, 2).map(x => x.interest).sort()).toContain('health');
  });
});

describe('sortUsers', () => {
  it('common mode puts most-shared first', () => {
    const sorted = sortUsers(USERS, 'common', me);
    expect(sorted[0].name).toBe('Charlie'); // 3 common
  });

  it('name mode is alphabetical', () => {
    const sorted = sortUsers(USERS, 'name', me);
    expect(sorted.map(x => x.name)).toEqual(['Alice', 'Bob', 'Charlie', 'Dave']);
  });

  it('does not mutate the input array', () => {
    const before = USERS.map(x => x.id);
    sortUsers(USERS, 'name', me);
    expect(USERS.map(x => x.id)).toEqual(before);
  });
});

describe('matchesSearch', () => {
  it('matches by name, role, lookingFor and interest label', () => {
    expect(matchesSearch(USERS[3], 'dave')).toBe(true);
    expect(matchesSearch(USERS[3], 'iOS')).toBe(true);
    expect(matchesSearch(USERS[3], 'backend')).toBe(true);
    expect(matchesSearch(USERS[3], 'health')).toBe(true);   // via interest label
    expect(matchesSearch(USERS[3], 'zzz')).toBe(false);
  });

  it('empty query matches everyone', () => {
    expect(matchesSearch(USERS[0], '')).toBe(true);
    expect(matchesSearch(USERS[0], '   ')).toBe(true);
  });
});

describe('filterAndSort', () => {
  it('"match" filter keeps only people with shared interests, sorted by most common', () => {
    const res = filterAndSort(USERS, { filter: 'match', search: '', sort: 'common', myInterests: me });
    expect(res.map(x => x.name)).toEqual(['Charlie', 'Dave', 'Bob']); // Alice (0 common) excluded
  });

  it('interest filter narrows to that interest', () => {
    const res = filterAndSort(USERS, { filter: 'sport', search: '', sort: 'name', myInterests: me });
    expect(res.map(x => x.name)).toEqual(['Alice', 'Bob']);
  });

  it('search composes with filter', () => {
    const res = filterAndSort(USERS, { filter: 'all', search: 'alice', sort: 'name', myInterests: me });
    expect(res.map(x => x.name)).toEqual(['Alice']);
  });
});
