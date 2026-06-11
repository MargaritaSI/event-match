import { describe, it, expect } from 'vitest';
import { intentSynergies, hasIntentSynergy } from './intentLogic';

describe('intentSynergies', () => {
  it('matches hiring with open-to-work (both directions)', () => {
    expect(hasIntentSynergy(['hiring'], ['job'])).toBe(true);
    expect(hasIntentSynergy(['job'], ['hiring'])).toBe(true);
  });

  it('matches two co-founders', () => {
    expect(hasIntentSynergy(['cofounder'], ['cofounder'])).toBe(true);
  });

  it('matches mentor with learner and investor with client-seeker', () => {
    expect(hasIntentSynergy(['mentor'], ['learning'])).toBe(true);
    expect(hasIntentSynergy(['invest'], ['clients'])).toBe(true);
  });

  it('does not match non-complementary intents', () => {
    expect(hasIntentSynergy(['hiring'], ['hiring'])).toBe(false);
    expect(hasIntentSynergy(['learning'], ['job'])).toBe(false);
  });

  it('handles missing intents gracefully', () => {
    expect(hasIntentSynergy(undefined, ['job'])).toBe(false);
    expect(hasIntentSynergy(['hiring'], undefined)).toBe(false);
    expect(intentSynergies()).toEqual([]);
  });

  it('produces a human-readable label', () => {
    const [s] = intentSynergies(['hiring'], ['job']);
    expect(s.label).toContain('↔');
    expect(s.mine).toBe('hiring');
    expect(s.theirs).toBe('job');
  });

  it('finds multiple synergies at once', () => {
    const res = intentSynergies(['hiring', 'cofounder'], ['job', 'cofounder']);
    expect(res.length).toBe(2);
  });
});
