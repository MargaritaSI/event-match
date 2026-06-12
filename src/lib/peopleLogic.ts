import type { User, Interest } from '../types';
import { INTEREST_LABELS } from '../data/mockData';

/** Interests the current user shares with `user`. */
export function commonInterests(user: User, myInterests: Interest[]): Interest[] {
  return user.interests.filter(i => myInterests.includes(i));
}

/** Specific skills (languages/design/sport) the current user shares with `user`. */
export function commonSkills(user: User, mySkills: string[] = []): string[] {
  const mine = new Set(mySkills.map(s => s.toLowerCase()));
  return (user.skills || []).filter(s => mine.has(s.toLowerCase()));
}

/** Combined affinity score = shared interests + shared skills. */
export function affinity(user: User, myInterests: Interest[], mySkills: string[] = []): number {
  return commonInterests(user, myInterests).length + commonSkills(user, mySkills).length;
}

/** Count how often each interest appears across a set of people (popularity). */
export function interestFrequency(users: User[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const u of users) {
    for (const i of u.interests) {
      freq[i] = (freq[i] || 0) + 1;
    }
  }
  return freq;
}

/** Interests sorted from most to least common across the crowd. */
export function topInterests(users: User[]): { interest: Interest; count: number }[] {
  const freq = interestFrequency(users);
  return (Object.entries(freq) as [Interest, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([interest, count]) => ({ interest, count }));
}

export type SortMode = 'common' | 'name';

/**
 * Sort users. 'common' = highest affinity (shared interests + skills) first; 'name' = alphabetical.
 */
export function sortUsers(
  users: User[],
  mode: SortMode,
  myInterests: Interest[],
  mySkills: string[] = [],
): User[] {
  const copy = [...users];
  if (mode === 'name') {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  // common — by combined affinity
  return copy.sort((a, b) => {
    const diff = affinity(b, myInterests, mySkills) - affinity(a, myInterests, mySkills);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

/** Free-text search across the networking-relevant fields. */
export function matchesSearch(user: User, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    user.name.toLowerCase().includes(q) ||
    (user.role || '').toLowerCase().includes(q) ||
    (user.company || '').toLowerCase().includes(q) ||
    user.bio.toLowerCase().includes(q) ||
    (user.lookingFor || '').toLowerCase().includes(q) ||
    (user.canHelp || '').toLowerCase().includes(q) ||
    (user.hobbies || []).join(' ').toLowerCase().includes(q) ||
    (user.skills || []).join(' ').toLowerCase().includes(q) ||
    user.interests.some(i => (INTEREST_LABELS[i] || i).toLowerCase().includes(q))
  );
}

/** Does the user have this specific skill — in their skills list or anywhere in their text? */
export function userHasSkill(user: User, skill: string): boolean {
  const s = skill.toLowerCase();
  if ((user.skills || []).some(k => k.toLowerCase() === s)) return true;
  const blob = [user.role, user.company, user.bio, user.lookingFor, user.canHelp, (user.hobbies || []).join(' ')]
    .join(' ').toLowerCase();
  return blob.includes(s);
}

export type PeopleFilter = Interest | 'all' | 'match' | 'speaker';

/**
 * Combine several filters at once, then sort:
 *  - `interests`: OR — keep people who have ANY of the selected interests (empty = no interest filter)
 *  - `skills`:    AND — keep people who have EVERY selected skill (from the facet dropdowns)
 *  - `match`:     keep only people who share an interest or skill with me
 *  - `speaker`:   keep only speakers
 *  - `search`:    free‑text, ANDed with everything
 */
export function filterAndSort(
  users: User[],
  opts: {
    interests?: Interest[];
    skills?: string[];
    match?: boolean;
    speaker?: boolean;
    search: string;
    sort: SortMode;
    myInterests: Interest[];
    mySkills?: string[];
  },
): User[] {
  const mySkills = opts.mySkills || [];
  const wantInterests = opts.interests || [];
  const wantSkills = opts.skills || [];
  const filtered = users.filter(u => {
    if (opts.match && affinity(u, opts.myInterests, mySkills) === 0) return false;
    if (opts.speaker && !u.speaker) return false;
    if (wantInterests.length > 0 && !wantInterests.some(i => u.interests.includes(i))) return false; // OR
    if (wantSkills.length > 0 && !wantSkills.every(s => userHasSkill(u, s))) return false;            // AND
    return matchesSearch(u, opts.search);
  });
  return sortUsers(filtered, opts.sort, opts.myInterests, mySkills);
}
