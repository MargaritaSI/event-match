/**
 * The "My Card" profile — its type, default, persistence helpers, and the mapping to the
 * domain `User`. Shared by MyCardPage (edits it) and App (syncs it to the backend).
 */
import { load, save } from './storage';
import { EVENT_NAME } from '../data/mockData';
import type { Interest, Intent, User } from '../types';

export const CONTACT_FIELDS = ['telegram', 'instagram', 'linkedin', 'whatsapp', 'other'] as const;
export type ContactField = typeof CONTACT_FIELDS[number];

export interface StoredProfile {
  firstName: string;
  lastName: string;
  role: string;
  bio: string;
  company: string;
  city: string;
  country: string;
  telegram: string;
  instagram: string;
  linkedin: string;
  whatsapp: string;
  otherContact: string;
  otherLabel: string;
  interests: Interest[];
  intents: Intent[];
  skills: string[];
  speaker: boolean;
  speakerTopic: string;
  hobbies: string;
  lookingFor: string;
  canHelp: string;
  photo: string | null;
  showOnMatch: ContactField[]; // which contacts are revealed when you match
}

export const DEFAULT_PROFILE: StoredProfile = {
  firstName: 'Margarita', lastName: '', role: 'iOS Developer',
  bio: 'Building apps for health & productivity. Into wearables, cycle tracking and focus tools.',
  company: '', city: 'Amsterdam', country: 'Netherlands',
  telegram: '@margarita', instagram: '@margarita.dev', linkedin: '', whatsapp: '', otherContact: '', otherLabel: '',
  interests: ['health', 'mobile', 'startup', 'design'],
  intents: ['cofounder', 'learning'],
  skills: ['Swift', 'UI/UX', 'Running'],
  speaker: false,
  speakerTopic: '',
  hobbies: 'Running, Sketching, Cold water swimming',
  lookingFor: 'A backend dev to pair on a health app side-project',
  canHelp: 'iOS/SwiftUI, App Store submission, HealthKit',
  photo: null,
  showOnMatch: ['telegram', 'instagram', 'linkedin', 'whatsapp', 'other'],
};

export function loadProfile(): StoredProfile {
  return { ...DEFAULT_PROFILE, ...load<Partial<StoredProfile>>('profile', {}) };
}

export function saveProfile(p: StoredProfile): void {
  save('profile', p);
}

/** Map the editable profile to a discovery `User`. Used to sync to the backend and to represent "me". */
export function profileToUser(p: StoredProfile, id: string): User {
  const socials: User['socials'] = {};
  if (p.telegram) socials.telegram = p.telegram;
  if (p.instagram) socials.instagram = p.instagram;
  if (p.linkedin) socials.linkedin = p.linkedin;
  if (p.whatsapp) socials.whatsapp = p.whatsapp;
  if (p.otherContact) socials.twitter = p.otherContact;

  return {
    id,
    name: [p.firstName, p.lastName].map(s => s.trim()).filter(Boolean).join(' ') || 'You',
    role: p.role || undefined,
    company: p.company || undefined,
    bio: p.bio || '',
    interests: p.interests || [],
    intents: p.intents || [],
    skills: p.skills || [],
    hobbies: p.hobbies ? p.hobbies.split(',').map(s => s.trim()).filter(Boolean) : [],
    lookingFor: p.lookingFor || undefined,
    canHelp: p.canHelp || undefined,
    speaker: p.speaker || undefined,
    speakerTopic: p.speakerTopic || undefined,
    socials,
    event: EVENT_NAME,
  };
}
