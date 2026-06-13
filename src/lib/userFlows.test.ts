/**
 * User-behaviour tests — realistic attendee journeys exercised against the real demo data
 * (MOCK_USERS, FACETS, SESSIONS) and the pure domain logic. No backend is involved: these
 * cover the offline / fallback experience exactly as a real user would hit it.
 */
import { describe, it, expect } from 'vitest';
import {
  affinity, filterAndSort, matchesSearch, userHasSkill, topInterests,
} from './peopleLogic';
import { intentSynergies, hasIntentSynergy } from './intentLogic';
import {
  buildTaskFromCapture, canSaveCapture, emptyCaptureFields, followUpDate, type CaptureForm,
} from './captureLogic';
import { computeGaps, gapSuggestion, locationToZoneId, timeToMinutes } from './scheduleLogic';
import {
  totalPoints, levelFromPoints, unlockedAchievements, newlyUnlocked, type Counts,
} from './gamificationLogic';
import { profileToUser, userToProfile, DEFAULT_PROFILE, type StoredProfile } from './profile';
import { MOCK_USERS, getUserById, findUsers, userCode, FACETS } from '../data/mockData';
import { SESSIONS } from '../data/schedule';
import type { Interest } from '../types';

// A representative attendee ("me").
const MY_INTERESTS: Interest[] = ['health', 'mobile', 'design', 'ai'];
const MY_SKILLS = ['Swift', 'UI/UX'];

describe('Discover: "For me" surfaces only relevant people, best match first', () => {
  const results = filterAndSort(MOCK_USERS, {
    match: true, search: '', sort: 'common', myInterests: MY_INTERESTS, mySkills: MY_SKILLS,
  });

  it('excludes anyone with zero shared interests AND skills', () => {
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(u => affinity(u, MY_INTERESTS, MY_SKILLS) > 0)).toBe(true);
  });

  it('is sorted by descending affinity', () => {
    for (let i = 0; i < results.length - 1; i++) {
      expect(affinity(results[i], MY_INTERESTS, MY_SKILLS))
        .toBeGreaterThanOrEqual(affinity(results[i + 1], MY_INTERESTS, MY_SKILLS));
    }
  });

  it('surfaces Liam (shares mobile/health/ai + Swift) as a strong match', () => {
    expect(results.find(u => u.id === '4')).toBeTruthy();
  });
});

describe('"For me" reflects YOUR card, not a fixed persona', () => {
  it('a narrow card (only gamedev) makes "For me" far smaller than "All"', () => {
    const all = filterAndSort(MOCK_USERS, { search: '', sort: 'name', myInterests: ['gamedev'] });
    const forMe = filterAndSort(MOCK_USERS, { match: true, search: '', sort: 'common', myInterests: ['gamedev'], mySkills: [] });
    expect(forMe.length).toBeLessThan(all.length);
    expect(forMe.every(u => u.interests.includes('gamedev'))).toBe(true); // only the game dev(s)
  });
});

describe('A unique skill on your card is selectable and discoverable', () => {
  it('the sport facet now includes Basketball', () => {
    const sport = FACETS.find(f => f.key === 'sport')!;
    expect(sport.options).toContain('Basketball');
  });

  it('filtering by a unique skill surfaces the attendee who has it', () => {
    const baller = { ...getUserById('1')!, id: 'baller', name: 'Bea Baller', skills: ['Basketball'] };
    const res = filterAndSort([...MOCK_USERS, baller], { skills: ['Basketball'], search: '', sort: 'name', myInterests: [] });
    expect(res.map(u => u.id)).toContain('baller');
    expect(res.every(u => userHasSkill(u, 'Basketball'))).toBe(true);
  });
});

describe('Filter by a specific skill facet', () => {
  it('"Swift" keeps people who can do Swift and drops those who cannot', () => {
    const res = filterAndSort(MOCK_USERS, { skills: ['Swift'], search: '', sort: 'name', myInterests: MY_INTERESTS });
    expect(res.find(u => u.id === '4')).toBeTruthy();   // Liam — Swift
    expect(res.find(u => u.id === '3')).toBeFalsy();    // Olivia — recruiter, no Swift
    expect(res.every(u => userHasSkill(u, 'Swift'))).toBe(true);
  });
});

describe('Combine interest (OR) + skill (AND)', () => {
  it('health + UI/UX returns only health people who do UI/UX', () => {
    const res = filterAndSort(MOCK_USERS, {
      interests: ['health'], skills: ['UI/UX'], search: '', sort: 'name', myInterests: MY_INTERESTS,
    });
    expect(res.length).toBeGreaterThan(0);
    expect(res.every(u => u.interests.includes('health') && userHasSkill(u, 'UI/UX'))).toBe(true);
    expect(res.find(u => u.id === '4')).toBeFalsy(); // Liam: health but no UI/UX
  });
});

describe('Search by name, code and skill', () => {
  it('finds an attendee by their EM code', () => {
    expect(findUsers('EM-004')[0]?.id).toBe('4');
    expect(findUsers('4').some(u => u.id === '4')).toBe(true);
  });
  it('matches free text against skills', () => {
    const yuki = getUserById('9')!;
    expect(matchesSearch(yuki, 'kotlin')).toBe(true);
  });
  it('userCode formats ids as EM-00N', () => {
    expect(userCode('4')).toBe('EM-004');
  });
});

describe('Intent matching surfaces complementary pairs', () => {
  it('open-to-work ↔ a hiring recruiter is a synergy', () => {
    const recruiter = getUserById('3')!; // Olivia — hiring
    expect(hasIntentSynergy(['job'], recruiter.intents)).toBe(true);
  });
  it('co-founder ↔ co-founder is a synergy', () => {
    const marco = getUserById('8')!; // cofounder, invest
    const syn = intentSynergies(['cofounder'], marco.intents);
    expect(syn.some(s => s.mine === 'cofounder' && s.theirs === 'cofounder')).toBe(true);
  });
  it('two pure learners have no synergy', () => {
    expect(hasIntentSynergy(['learning'], ['learning'])).toBe(false);
  });
});

describe('Quick Capture → follow-up task', () => {
  const now = new Date('2026-06-12T10:00:00Z');
  const form: CaptureForm = {
    name: 'Liam Walsh', context: 'iOS dev', talkedAbout: 'health app collab',
    nextStep: 'Send portfolio', followUpDays: 3, tag: 'networking', linkedUserId: '4',
  };

  it('creates a dated task linked to the attendee', () => {
    const task = buildTaskFromCapture(form, now);
    expect(task.title).toBe('Send portfolio');
    expect(task.linkedUserId).toBe('4');
    expect(getUserById(task.linkedUserId)!.name).toBe('Liam Walsh'); // jump-to-profile works
    expect(task.dueDate.getTime()).toBe(followUpDate(3, now).getTime());
    expect(task.done).toBe(false);
  });

  it('defaults to a follow-up reminder when no next step is given', () => {
    const task = buildTaskFromCapture({ ...form, nextStep: '' }, now);
    expect(task.title).toBe('Follow up with Liam Walsh');
  });

  it('requires a name to save and flags empty optional fields', () => {
    expect(canSaveCapture({ name: 'Liam' })).toBe(true);
    expect(canSaveCapture({ name: '   ' })).toBe(false);
    expect(emptyCaptureFields({ ...form, nextStep: '', context: '' })).toEqual(
      expect.arrayContaining(['nextStep', 'context']),
    );
  });
});

describe('Schedule: free gaps between my sessions, and jump-to-map', () => {
  it('computes a positive gap between two of my chosen sessions', () => {
    const mine = SESSIONS.filter(s => s.id === 'd1-1' || s.id === 'd1-4'); // 09:30-10:00 and 12:30-13:30
    const gaps = computeGaps(mine);
    expect(gaps.length).toBe(1);
    expect(gaps[0].minutes).toBe(timeToMinutes('12:30') - timeToMinutes('10:00')); // 150
    expect(gapSuggestion(gaps[0].minutes).text.length).toBeGreaterThan(0);
  });

  it('maps a session location to a map zone (and Online to none)', () => {
    expect(locationToZoneId('Food Court')).toBe('food');
    expect(locationToZoneId('Working Zone')).toBe('working');
    expect(locationToZoneId('Online')).toBeNull();
  });
});

describe('Gamification: a productive attendee levels up and unlocks badges', () => {
  // Made 5 matches, added 3 sessions, saved 3 contacts, joined 2 groups, 1 coffee, profile done.
  const counts: Counts = {
    match: 5, session_added: 3, contact_saved: 3, group_joined: 2, coffee_meetup: 1, profile_completed: 1,
  };

  it('totals points deterministically (no double counting)', () => {
    // 5*20 + 3*3 + 3*8 + 2*5 + 1*10 + 1*15 = 100+9+24+10+10+15 = 168
    expect(totalPoints(counts)).toBe(168);
    expect(levelFromPoints(totalPoints(counts))).toBe(2);
  });

  it('unlocks the expected achievements including All-Rounder', () => {
    const ids = unlockedAchievements(counts).map(a => a.id);
    expect(ids).toEqual(expect.arrayContaining([
      'first_match', 'social', 'planner', 'networker', 'joiner', 'coffee', 'profile', 'all_rounder',
    ]));
  });

  it('reports only the newly-unlocked badge on an incremental action', () => {
    const prev: Counts = { ...counts, match: 4 };  // one short of "Social Butterfly"
    const fresh = newlyUnlocked(prev, counts);     // 5th match crosses the threshold
    expect(fresh.map(a => a.id)).toEqual(['social']);
  });
});

describe('My Card profile round-trips through the domain model', () => {
  const mine: StoredProfile = {
    ...DEFAULT_PROFILE,
    firstName: 'Ada', lastName: 'Lovelace', role: 'Engineer', company: 'Analytical',
    bio: 'Computing pioneer', interests: ['ai', 'data'], intents: ['cofounder'],
    skills: ['Math'], hobbies: 'Chess, Writing',
  };

  it('profileToUser → userToProfile preserves the discovery fields', () => {
    const back = userToProfile(profileToUser(mine, 'uid-1'));
    expect(back.firstName).toBe('Ada');
    expect(back.lastName).toBe('Lovelace');
    expect(back.role).toBe('Engineer');
    expect(back.interests).toEqual(['ai', 'data']);
    expect(back.skills).toEqual(['Math']);
    expect(back.hobbies).toBe('Chess, Writing');
  });

  it('the crowd has a sensible spread of interests to filter by', () => {
    const top = topInterests(MOCK_USERS);
    expect(top.length).toBeGreaterThan(5);
    expect(top[0].count).toBeGreaterThanOrEqual(top[top.length - 1].count);
  });
});
