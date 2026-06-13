/**
 * EventMatch cloud backend (Supabase) — thin async data layer for the CORE entities:
 * profiles, connections and meeting requests. Tasks and points stay device-local.
 *
 * Every function is a safe no-op when the backend is disabled (no env keys), returning
 * empty data so the caller transparently falls back to its localStorage / in-memory state.
 */
import { getClient, isBackendEnabled } from './client';
import { rowToUser, userToRow, rowToRequest, type ProfileRow, type RequestRow } from './mappers';
import type { User } from '../../types';
import type { MeetRequest } from '../../components/RequestsInbox';

export { isBackendEnabled };

let sessionUid: string | null = null;

/** The current device's auth uid (null until initSession resolves, or when disabled). */
export function currentUid(): string | null {
  return sessionUid;
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
