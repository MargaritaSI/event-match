// Tiny localStorage helpers. All EventMatch keys are prefixed so "Delete all my data" can wipe them.
const PREFIX = 'em_';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full / disabled — ignore */
  }
}

/** Remove every EventMatch key from localStorage. */
export function clearAll(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** Stable unique id for this attendee, created once and persisted. */
export function getOrCreateUid(): string {
  let uid = load<string>('uid', '');
  if (!uid) {
    const rand = Math.floor(Math.random() * 1e9).toString(36);
    uid = `${Date.now().toString(36)}${rand}`.slice(0, 10);
    save('uid', uid);
  }
  return uid;
}
