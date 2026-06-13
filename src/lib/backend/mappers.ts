/**
 * Pure row <-> domain mappings for the Supabase backend. No client import here,
 * so these stay trivially unit-testable.
 */
import type { Task, User } from '../../types';
import type { MeetRequest } from '../../components/RequestsInbox';

export interface ProfileRow {
  id: string;
  name?: string | null;
  data: Partial<User>;
  updated_at?: string;
}

export interface RequestRow {
  id?: string;
  from_id: string;
  to_id: string;
  note?: string | null;
  status?: string | null;
  created_at?: string;
}

/** DB profile row → discovery `User`. The row id is authoritative over any id inside `data`. */
export function rowToUser(row: ProfileRow): User {
  return {
    bio: '',
    interests: [],
    socials: {},
    event: '',
    ...row.data,
    id: row.id,
    name: row.data.name ?? row.name ?? 'Someone',
  } as User;
}

/**
 * `User` → DB profile row. Contact handles (`socials`) are intentionally NOT stored:
 * the profiles table is world-readable, so contacts stay private and are exchanged only
 * via the share-link / QR (which encodes just the handles you chose to reveal).
 */
export function userToRow(user: User, id: string): ProfileRow {
  const { socials: _socials, ...rest } = user;
  return {
    id,
    name: user.name,
    data: { ...rest, id, socials: {} },
  };
}

/** DB request row → inbox `MeetRequest`. `userId` is the OTHER person (the sender). */
export function rowToRequest(row: RequestRow): MeetRequest {
  const status = row.status === 'accepted' || row.status === 'declined' ? row.status : 'pending';
  return { userId: row.from_id, status, note: row.note ?? undefined };
}

/** Task → JSON-safe object (Date → ISO) for storage/transport. */
export function serializeTask(t: Task): Record<string, unknown> {
  return { ...t, dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString() : t.dueDate };
}

/** JSON object → Task (ISO → Date). Tolerant of an already-Date or missing value. */
export function reviveTask(data: Record<string, unknown>): Task {
  const due = data.dueDate;
  return { ...(data as unknown as Task), dueDate: due ? new Date(due as string) : new Date() };
}
