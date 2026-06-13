import { describe, it, expect } from 'vitest';
import { rowToUser, userToRow, rowToRequest } from './mappers';
import { profileToUser, DEFAULT_PROFILE, type StoredProfile } from '../profile';
import type { User } from '../../types';

describe('rowToUser', () => {
  it('spreads data and forces the row id to win', () => {
    const u = rowToUser({ id: 'abc', name: 'Zoe', data: { id: 'STALE', name: 'Zoe', interests: ['ai'], bio: 'hi' } });
    expect(u.id).toBe('abc');
    expect(u.name).toBe('Zoe');
    expect(u.interests).toEqual(['ai']);
    expect(u.bio).toBe('hi');
  });

  it('fills safe defaults for a sparse row', () => {
    const u = rowToUser({ id: 'x', data: {} });
    expect(u.id).toBe('x');
    expect(u.interests).toEqual([]);
    expect(u.socials).toEqual({});
    expect(u.name).toBe('Someone');
  });
});

describe('userToRow', () => {
  const user: User = {
    id: 'ignored', name: 'Ann', role: 'Dev', bio: 'b',
    interests: ['ai'], socials: { telegram: '@ann', linkedin: 'ann' }, event: 'e',
  };

  it('keys the row by the passed id, not the user.id', () => {
    const row = userToRow(user, 'real-uid');
    expect(row.id).toBe('real-uid');
    expect(row.data.id).toBe('real-uid');
    expect(row.name).toBe('Ann');
  });

  it('strips contact handles so the world-readable row stays private', () => {
    const row = userToRow(user, 'real-uid');
    expect(row.data.socials).toEqual({});
  });
});

describe('rowToRequest', () => {
  it('maps the sender into userId and keeps a valid status', () => {
    expect(rowToRequest({ from_id: 'sender', to_id: 'me', note: 'hi', status: 'pending' }))
      .toEqual({ userId: 'sender', status: 'pending', note: 'hi' });
  });

  it('falls back to pending for unknown/missing status', () => {
    expect(rowToRequest({ from_id: 's', to_id: 'm', status: 'weird' }).status).toBe('pending');
    expect(rowToRequest({ from_id: 's', to_id: 'm' }).status).toBe('pending');
  });
});

describe('profileToUser', () => {
  const filled: StoredProfile = {
    ...DEFAULT_PROFILE,
    firstName: 'Ada', lastName: 'Lovelace', role: 'Engineer',
    interests: ['health', 'ai'], skills: ['Swift', 'Go'],
    telegram: '@ada', hobbies: 'Running, Chess , ',
  };

  it('builds a User from a filled profile', () => {
    const u = profileToUser(filled, 'uid-1');
    expect(u.id).toBe('uid-1');
    expect(u.name).toBe('Ada Lovelace');
    expect(u.interests).toContain('health');
    expect(u.skills).toContain('Swift');
  });

  it('splits hobbies string into an array and keeps contact handles locally', () => {
    const u = profileToUser(filled, 'uid');
    expect(u.hobbies).toEqual(['Running', 'Chess']);
    expect(u.socials.telegram).toBe('@ada');
  });

  it('falls back to "You" when no name is set (blank default profile)', () => {
    const u = profileToUser(DEFAULT_PROFILE, 'uid');
    expect(u.name).toBe('You');
  });
});
