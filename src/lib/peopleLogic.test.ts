import { describe, it, expect } from 'vitest';
import {
  commonInterests, commonSkills, affinity, interestFrequency, topInterests, sortUsers, matchesSearch, filterAndSort,
} from './peopleLogic';
import type { User, Interest } from '../types';

const me: Interest[] = ['health', 'mobile', 'startup', 'design'];
const mySkills = ['Swift', 'UI/UX', 'Running'];

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

describe('commonSkills', () => {
  it('returns shared skills, case-insensitive', () => {
    const x = u('s', 'Skilled', ['ai'], { skills: ['swift', 'Go', 'Running'] });
    expect(commonSkills(x, mySkills).sort()).toEqual(['Running', 'swift']);
  });
  it('returns empty when no skills or no overlap', () => {
    expect(commonSkills(u('a', 'A', ['ai']), mySkills)).toEqual([]);
    expect(commonSkills(u('b', 'B', ['ai'], { skills: ['Rust'] }), mySkills)).toEqual([]);
  });
});

describe('affinity', () => {
  it('sums shared interests and shared skills', () => {
    const x = u('x', 'X', ['health', 'mobile'], { skills: ['Swift', 'Rust'] }); // 2 interests + 1 skill
    expect(affinity(x, me, mySkills)).toBe(3);
  });
  it('is zero with no overlap at all', () => {
    expect(affinity(u('z', 'Z', ['travel']), me, mySkills)).toBe(0);
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
  it('match=true keeps only people with shared interests, sorted by most common', () => {
    const res = filterAndSort(USERS, { match: true, search: '', sort: 'common', myInterests: me });
    expect(res.map(x => x.name)).toEqual(['Charlie', 'Dave', 'Bob']); // Alice (0 common) excluded
  });

  it('a single interest filter narrows to that interest', () => {
    const res = filterAndSort(USERS, { interests: ['sport'], search: '', sort: 'name', myInterests: me });
    expect(res.map(x => x.name)).toEqual(['Alice', 'Bob']);
  });

  it('MULTIPLE interest filters are OR-combined (anyone with any of them)', () => {
    const res = filterAndSort(USERS, { interests: ['sport', 'startup'], search: '', sort: 'name', myInterests: me });
    // Alice(travel,sport) Bob(design,sport) Charlie(health,mobile,startup)
    expect(res.map(x => x.name).sort()).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('multiple skill filters are AND-combined', () => {
    const a = u('a', 'Ann', ['ai'], { skills: ['Swift', 'Running'] });
    const b = u('b', 'Ben', ['ai'], { skills: ['Swift'] });
    const res = filterAndSort([a, b], { skills: ['Swift', 'Running'], search: '', sort: 'name', myInterests: me });
    expect(res.map(x => x.name)).toEqual(['Ann']); // Ben lacks Running
  });

  it('interest OR + skill AND + match all combine', () => {
    const x = u('x', 'Xena', ['startup'], { skills: ['Swift'] }); // startup ✓, swift ✓, shares startup with me
    const y = u('y', 'Yan', ['startup'], { skills: [] });          // startup ✓ but no Swift
    const res = filterAndSort([x, y], { interests: ['startup'], skills: ['Swift'], match: true, search: '', sort: 'name', myInterests: me, mySkills });
    expect(res.map(x => x.name)).toEqual(['Xena']);
  });

  it('search composes with filters', () => {
    const res = filterAndSort(USERS, { search: 'alice', sort: 'name', myInterests: me });
    expect(res.map(x => x.name)).toEqual(['Alice']);
  });

  it('match=true includes someone with 0 shared interests but a shared skill', () => {
    const skillOnly = u('5', 'Eve', ['travel'], { skills: ['Swift'] }); // 0 interest, 1 skill
    const res = filterAndSort([...USERS, skillOnly], { match: true, search: '', sort: 'common', myInterests: me, mySkills });
    expect(res.map(x => x.name)).toContain('Eve');
  });

  it('search matches by skill text', () => {
    const skilled = u('6', 'Frank', ['ai'], { skills: ['Kotlin'] });
    const res = filterAndSort([...USERS, skilled], { search: 'kotlin', sort: 'name', myInterests: me });
    expect(res.map(x => x.name)).toEqual(['Frank']);
  });
});
