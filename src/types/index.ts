export type Interest =
  | 'sport' | 'design' | 'startup' | 'travel' | 'health' | 'ai' | 'networking'
  | 'business' | 'programming' | 'frontend' | 'backend' | 'mobile' | 'devops'
  | 'data' | 'security' | 'gamedev' | 'web3' | 'music' | 'reading' | 'gaming' | 'food';

/** Why someone is at the event — drives complementary matchmaking (Brella-style). */
export type Intent = 'hiring' | 'job' | 'cofounder' | 'clients' | 'invest' | 'mentor' | 'learning';

export interface User {
  id: string;
  name: string;
  role?: string;
  company?: string;
  bio: string;
  interests: Interest[];
  intents?: Intent[];
  skills?: string[];        // specific picks: languages, design types, sports (drive matching too)
  hobbies?: string[];
  lookingFor?: string;
  canHelp?: string;
  speaker?: boolean;        // true if this person is a speaker at the event
  speakerTopic?: string;    // their talk title
  socials: { telegram?: string; instagram?: string; linkedin?: string; whatsapp?: string; twitter?: string };
  event: string;
  photoColor?: string;
}

export interface MatchRequest {
  fromId: string;
  toId: string;
  status: 'pending' | 'matched' | 'declined';
}

export interface Contact {
  id: string;
  name: string;
  context: string;
  talkedAbout: string;
  nextStep: string;
  followUpDays: number;
  tag: 'networking' | 'client' | 'collab' | 'other';
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  contactName: string;
  dueDate: Date;
  tag: Contact['tag'];
  done: boolean;
  notes?: string;
  linkedUserId?: string; // attendee this task is about — lets you jump to their profile
}
