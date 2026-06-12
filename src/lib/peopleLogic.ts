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

/** Apply interest/match filter + search, then sort. */
export type PeopleFilter = Interest | 'all' | 'match' | 'speaker';

export function filterAndSort(
  users: User[],
  opts: {
    filter: PeopleFilter;
    search: string;
    sort: SortMode;
    myInterests: Interest[];
    mySkills?: string[];
  },
): User[] {
  const mySkills = opts.mySkills || [];
  const filtered = users.filter(u => {
    if (opts.filter === 'match') {
      if (affinity(u, opts.myInterests, mySkills) === 0) return false; // shared interest OR skill
    } else if (opts.filter === 'speaker') {
      if (!u.speaker) return false;
    } else if (opts.filter !== 'all') {
      if (!u.interests.includes(opts.filter)) return false;
    }
    return matchesSearch(u, opts.search);
  });
  return sortUsers(filtered, opts.sort, opts.myInterests, mySkills);
}
