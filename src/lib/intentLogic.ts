import type { Intent } from '../types';
import { INTENT_LABELS } from '../data/mockData';

/** Which of THEIR intents complement each of MY intents. */
const COMPLEMENTS: Record<Intent, Intent[]> = {
  hiring: ['job'],
  job: ['hiring'],
  cofounder: ['cofounder'],
  invest: ['clients'],
  clients: ['invest'],
  mentor: ['learning'],
  learning: ['mentor'],
};

export interface IntentSynergy {
  mine: Intent;
  theirs: Intent;
  label: string; // human-readable, e.g. "You're hiring ↔ they're open to work"
}

const PHRASE: Record<Intent, { you: string; they: string }> = {
  hiring: { you: "You're hiring", they: "they're hiring" },
  job: { you: "you're open to work", they: "they're open to work" },
  cofounder: { you: "you want a co-founder", they: "they want a co-founder" },
  invest: { you: "you invest", they: "they invest" },
  clients: { you: "you seek clients", they: "they seek clients" },
  mentor: { you: "you mentor", they: "they mentor" },
  learning: { you: "you're here to learn", they: "they're here to learn" },
};

/** All complementary intent pairs between me and another attendee. */
export function intentSynergies(mine: Intent[] = [], theirs: Intent[] = []): IntentSynergy[] {
  const out: IntentSynergy[] = [];
  for (const a of mine) {
    for (const b of (COMPLEMENTS[a] || [])) {
      if (theirs.includes(b)) {
        out.push({ mine: a, theirs: b, label: `${cap(PHRASE[a].you)} ↔ ${PHRASE[b].they}` });
      }
    }
  }
  return out;
}

export function hasIntentSynergy(mine: Intent[] = [], theirs: Intent[] = []): boolean {
  return intentSynergies(mine, theirs).length > 0;
}

export function intentLabel(intent: Intent): string {
  return INTENT_LABELS[intent] || intent;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
