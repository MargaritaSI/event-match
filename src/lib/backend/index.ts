/**
 * EventMatch cloud backend (Supabase) — thin async data layer for the CORE entities:
 * profiles, connections and meeting requests. Tasks and points stay device-local.
 *
 * Every function is a safe no-op when the backend is disabled (no env keys), returning
 * empty data so the caller transparently falls back to its localStorage / in-memory state.
 */
import { getClient, isBackendEnabled } from './client';
import {
  rowToUser, userToRow, rowToRequest, serializeTask, reviveTask,
  type ProfileRow, type RequestRow,
} from './mappers';
import type { Task, User } from '../../types';
import type { MeetRequest } from '../../components/RequestsInbox';

export { isBackendEnabled };

let sessionUid: string | null = null;

export interface AuthStatus {
  signedIn: boolean;     // has any session (anonymous counts)
  isAnonymous: boolean;  // anonymous device account (not yet email-verified)
  email: string | null;  // present once signed in with email
}

/** The current device's auth uid (null until initSession resolves, or when disabled). */
export function currentUid(): string | null {
  return sessionUid;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toStatus(session: any): AuthStatus {
  const user = session?.user;
  return {
    signedIn: Boolean(user),
    isAnonymous: Boolean(user?.is_anonymous),
    email: user?.email ?? null,
  };
}

function appRedirectUrl(): string {
  // Strip any existing hash/query so the magic link returns cleanly to the app.
  return window.location.href.split('#')[0].split('?')[0];
}

/** Current auth status (anonymous when backend is on but not yet signed in with email). */
export async function getAuthStatus(): Promise<AuthStatus> {
  const client = await getClient();
  if (!client) return { signedIn: false, isAnonymous: false, email: null };
  const { data: { session } } = await client.auth.getSession();
  return toStatus(session);
}

/**
 * Send a magic link. If the current account is anonymous, this CONVERTS it to a permanent
 * account tied to the email (same uid → all existing data is preserved). Otherwise it's a
 * normal sign-in to that email's account. The user finishes by clicking the link in the email.
 */
export async function signInWithEmail(email: string): Promise<{ ok: boolean; error?: string; converting?: boolean }> {
  const client = await getClient();
  if (!client) return { ok: false, error: 'Cloud sync is not configured.' };
  const { data: { session } } = await client.auth.getSession();
  const emailRedirectTo = appRedirectUrl();
  if (session?.user?.is_anonymous) {
    const { error } = await client.auth.updateUser({ email }, { emailRedirectTo });
    return error ? { ok: false, error: error.message } : { ok: true, converting: true };
  }
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo } });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Sign out and start a fresh anonymous session. */
export async function signOut(): Promise<void> {
  const client = await getClient();
  if (!client) return;
  await client.auth.signOut();
  sessionUid = null;
  await initSession();
}

/** Subscribe to auth changes (sign-in, email-confirmed). Returns an unsubscribe fn. */
export function onAuthChange(cb: (status: AuthStatus) => void): () => void {
  if (!isBackendEnabled) return () => {};
  let unsub: (() => void) | null = null;
  let cancelled = false;
  void getClient().then(client => {
    if (!client || cancelled) return;
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) sessionUid = session.user.id;
      cb(toStatus(session));
    });
    unsub = () => data.subscription.unsubscribe();
  });
  return () => { cancelled = true; unsub?.(); };
}

/** The current user's own profile row (used to restore the card after signing in). */
export async function fetchMyProfile(): Promise<User | null> {
  const client = await getClient();
  if (!client || !sessionUid) return null;
  const { data, error } = await client.from('profiles').select('id, name, data').eq('id', sessionUid).maybeSingle();
  if (error || !data) return null;
  return rowToUser(data as ProfileRow);
}

/** Ensure an anonymous auth session exists. Returns the uid, or null when disabled/failed. */
export async function initSession(): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const { data: { session } } = await client.auth.getSession();
    if (session?.user) {
      sessionUid = session.user.id;
      return sessionUid;
    }
    const { data, error } = await client.auth.signInAnonymously();
    if (error) {
      console.warn('[backend] anonymous sign-in failed:', error.message);
      return null;
    }
    sessionUid = data.user?.id ?? null;
    return sessionUid;
  } catch (e) {
    console.warn('[backend] initSession error:', e);
    return null;
  }
}

/** All attendee profiles from the cloud (the app merges these with the built-in demo crowd). */
export async function fetchProfiles(): Promise<User[]> {
  const client = await getClient();
  if (!client) return [];
  const { data, error } = await client.from('profiles').select('id, name, data');
  if (error) {
    console.warn('[backend] fetchProfiles:', error.message);
    return [];
  }
  return (data as ProfileRow[]).map(rowToUser);
}

/** Insert/update THIS device's own profile row. */
export async function upsertMyProfile(user: User): Promise<void> {
  const client = await getClient();
  if (!client || !sessionUid) return;
  const row = { ...userToRow(user, sessionUid), updated_at: new Date().toISOString() };
  const { error } = await client.from('profiles').upsert(row);
  if (error) console.warn('[backend] upsertMyProfile:', error.message);
}

/** Ids of everyone this device has matched with. */
export async function fetchConnections(): Promise<string[]> {
  const client = await getClient();
  if (!client) return [];
  const { data, error } = await client.from('connections').select('target_id');
  if (error) {
    console.warn('[backend] fetchConnections:', error.message);
    return [];
  }
  return (data as { target_id: string }[]).map(r => r.target_id);
}

/** Record a match with `targetId` (idempotent on (owner, target_id)). */
export async function addConnection(targetId: string, card?: unknown): Promise<void> {
  const client = await getClient();
  if (!client || !sessionUid) return;
  const { error } = await client
    .from('connections')
    .upsert({ owner: sessionUid, target_id: targetId, target_card: card ?? null }, { onConflict: 'owner,target_id' });
  if (error) console.warn('[backend] addConnection:', error.message);
}

/** Meeting requests addressed to this device. */
export async function fetchRequests(): Promise<MeetRequest[]> {
  const client = await getClient();
  if (!client || !sessionUid) return [];
  const { data, error } = await client.from('requests').select('*').eq('to_id', sessionUid);
  if (error) {
    console.warn('[backend] fetchRequests:', error.message);
    return [];
  }
  return (data as RequestRow[]).map(rowToRequest);
}

/** Send a meeting request to `toId`. */
export async function sendRequest(toId: string, note: string): Promise<void> {
  const client = await getClient();
  if (!client || !sessionUid) return;
  const { error } = await client.from('requests').insert({ from_id: sessionUid, to_id: toId, note });
  if (error) console.warn('[backend] sendRequest:', error.message);
}

/** Accept / decline a request that `fromId` sent to me. */
export async function updateRequest(fromId: string, status: 'accepted' | 'declined'): Promise<void> {
  const client = await getClient();
  if (!client || !sessionUid) return;
  const { error } = await client
    .from('requests')
    .update({ status })
    .eq('from_id', fromId)
    .eq('to_id', sessionUid);
  if (error) console.warn('[backend] updateRequest:', error.message);
}

/** This device's follow-up tasks (keyed to the auth user, so they follow a logged-in account). */
export async function fetchTasks(): Promise<Task[]> {
  const client = await getClient();
  if (!client || !sessionUid) return [];
  const { data, error } = await client.from('tasks').select('data');
  if (error) {
    console.warn('[backend] fetchTasks:', error.message);
    return [];
  }
  return (data as { data: Record<string, unknown> }[]).map(r => reviveTask(r.data));
}

/** Insert/update one task. */
export async function upsertTask(task: Task): Promise<void> {
  const client = await getClient();
  if (!client || !sessionUid) return;
  const { error } = await client
    .from('tasks')
    .upsert({ id: task.id, owner: sessionUid, data: serializeTask(task), updated_at: new Date().toISOString() }, { onConflict: 'owner,id' });
  if (error) console.warn('[backend] upsertTask:', error.message);
}

/** Delete one task by id. */
export async function deleteTask(id: string): Promise<void> {
  const client = await getClient();
  if (!client || !sessionUid) return;
  const { error } = await client.from('tasks').delete().eq('owner', sessionUid).eq('id', id);
  if (error) console.warn('[backend] deleteTask:', error.message);
}

/** Subscribe to live request changes (returns an unsubscribe fn). No-op when disabled. */
export function subscribeRequests(onChange: () => void): () => void {
  return subscribeTable('requests', 'em-requests', onChange);
}

/** Subscribe to live profile changes (new/edited attendees). No-op when disabled. */
export function subscribeProfiles(onChange: () => void): () => void {
  return subscribeTable('profiles', 'em-profiles', onChange);
}

function subscribeTable(table: string, channelName: string, onChange: () => void): () => void {
  if (!isBackendEnabled) return () => {};
  let cancelled = false;
  // Use `unknown` for the channel handle to avoid importing supabase types at runtime.
  let channel: unknown = null;
  void getClient().then(client => {
    if (!client || cancelled) return;
    channel = client
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange())
      .subscribe();
  });
  return () => {
    cancelled = true;
    if (channel) void getClient().then(client => client?.removeChannel(channel as never));
  };
}
