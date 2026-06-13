import { useState, useEffect } from 'react';
import './App.css';
import { PeoplePage } from './pages/PeoplePage';
import { SchedulePage } from './pages/SchedulePage';
import { MapPage } from './pages/MapPage';
import { QuickCapturePage } from './pages/QuickCapturePage';
import { TasksPage } from './pages/TasksPage';
import { SponsorsPage } from './pages/SponsorsPage';
import { GroupsPage } from './pages/GroupsPage';
import { ConnectPage } from './pages/ConnectPage';
import { MyCardPage } from './pages/MyCardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { OrganisersPage } from './pages/OrganisersPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { RequestsInbox } from './components/RequestsInbox';
import type { MeetRequest } from './components/RequestsInbox';
import { UserProfileDialog } from './components/UserProfileDialog';
import { SharedCardDialog, decodeSharedCard } from './components/SharedCardDialog';
import type { SharedCard } from './components/SharedCardDialog';
import { I18nContext, useI18nState } from './i18n';
import { GamificationProvider, useGamification } from './lib/gamification';
import { locationToZoneId } from './lib/scheduleLogic';
import * as backend from './lib/backend';
import { loadProfile, saveProfile, profileToUser, userToProfile, hasProfile, type StoredProfile } from './lib/profile';
import { loadTasks, saveTasks } from './lib/tasks';
import { MOCK_USERS, setExtraUsers } from './data/mockData';
import { Dialog, Button } from './ui';
import type { Task, User } from './types';

const MOCK_IDS = new Set(MOCK_USERS.map(u => u.id));

// Seeded incoming meeting requests (in a real app these arrive from the backend).
const SEED_REQUESTS: MeetRequest[] = [
  { userId: '3', status: 'pending', note: "Loved your health app idea — can we chat about roles?" },
  { userId: '21', status: 'pending', note: "I invest in health-tech, would love to hear more." },
  { userId: '13', status: 'pending', note: "Want to feature your project in a talk!" },
];

type Tab = 'people' | 'connections' | 'schedule' | 'map' | 'groups' | 'connect' | 'capture' | 'tasks' | 'sponsors' | 'organisers' | 'leaderboard' | 'mycard';

// Per-tab: footer illustration + a fill colour. Colour matches the illustration's background
// so it blends; for the transparent (background-removed) people/refer art the fill is black.
const BG_V = 2; // bump to cache-bust footer illustrations when the files change
const TAB_BG: Record<Tab, { img: string; fill: string }> = {
  people:      { img: 'people.png',     fill: '#fed0af' }, // exact peach from the illustration bg
  connections: { img: 'refer.png',      fill: '#ffffff' }, // art has white areas → white fill
  schedule:    { img: 'leadership.jpg', fill: '#eae0df' },
  map:         { img: 'ferm.jpg',       fill: '#ffb003' },
  groups:      { img: 'teams.jpg',      fill: '#39a2fe' },
  connect:     { img: 'orange.jpg',     fill: '#ffb003' },
  capture:     { img: 'blue.jpg',       fill: '#39a2fe' },
  tasks:       { img: 'scene.jpg',      fill: '#ffffff' },
  sponsors:    { img: 'teams.jpg',      fill: '#39a2fe' },
  organisers:  { img: 'blue.jpg',       fill: '#39a2fe' },
  leaderboard: { img: 'leadership.jpg', fill: '#eae0df' },
  mycard:      { img: 'people.png',     fill: '#fed0af' },
};

const TAB_META: Record<Tab, { icon: string; label: string }> = {
  people:      { icon: '👥', label: 'People' },
  connections: { icon: '🤝', label: 'Connections' },
  schedule:    { icon: '📅', label: 'Schedule' },
  map:         { icon: '🗺', label: 'Map' },
  groups:      { icon: '🏘', label: 'Groups' },
  connect:     { icon: '☕', label: 'Connect' },
  capture:     { icon: '⚡', label: 'Capture' },
  tasks:       { icon: '📋', label: 'Tasks' },
  sponsors:    { icon: '🏢', label: 'Sponsors' },
  organisers:  { icon: '📊', label: 'Dashboard' },
  leaderboard: { icon: '🏆', label: 'Leaderboard' },
  mycard:      { icon: '🪪', label: 'My Card' },
};

// Two-level nav: a few logical groups in the header, each opening to thematic sub-tabs.
const NAV_GROUPS: { id: string; icon: string; label: string; tabs: Tab[] }[] = [
  { id: 'me',    icon: '🪪', label: 'Me',    tabs: ['mycard', 'capture', 'tasks', 'leaderboard'] },
  { id: 'meet',  icon: '🧑‍🤝‍🧑', label: 'Meet',  tabs: ['people', 'connections', 'groups', 'connect'] },
  { id: 'event', icon: '📅',     label: 'Event', tabs: ['schedule', 'map', 'sponsors', 'organisers'] },
];

export default function App() {
  return (
    <GamificationProvider>
      <AppInner />
    </GamificationProvider>
  );
}

function AppInner() {
  const i18n = useI18nState();
  const game = useGamification();
  const [tab, setTab] = useState<Tab>('people');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [mySessionIds, setMySessionIds] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks()); // restore offline tasks
  const [mapHighlight, setMapHighlight] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [requests, setRequests] = useState<MeetRequest[]>(SEED_REQUESTS);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [sharedCard, setSharedCard] = useState<SharedCard | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  // Attendee list shown in Discover: the built-in demo crowd, merged with live backend
  // profiles when cloud sync is on. Stays just the demo crowd when the backend is off.
  const [people, setPeople] = useState<User[]>(MOCK_USERS);
  // First-visit onboarding: a new user has no card yet, so we nudge them to create their
  // own (rather than silently inheriting a pre-filled one).
  const [showWelcome, setShowWelcome] = useState(() => !hasProfile(loadProfile()));
  // Auth (cloud only): anonymous by default; becomes a real account after magic-link sign-in.
  const [auth, setAuth] = useState<backend.AuthStatus>({ signedIn: false, isAnonymous: false, email: null });
  // Bumped to remount My Card after the profile is restored from the cloud on sign-in.
  const [profileNonce, setProfileNonce] = useState(0);

  // Central match registry — used by People, the requests inbox and the Connections tab.
  function addMatch(userId: string) {
    if (matchedIds.has(userId)) return;
    setMatchedIds(prev => new Set(prev).add(userId));
    game.award('match');
    // Persist the match and, for a real (non-demo) attendee, notify them with a request.
    backend.addConnection(userId);
    if (backend.isBackendEnabled && !MOCK_IDS.has(userId)) {
      backend.sendRequest(userId, 'Wants to connect on EventMatch');
    }
  }

  // If opened via a shared link (#card=...), show that person's card.
  useEffect(() => {
    const card = decodeSharedCard(window.location.hash);
    if (card) setSharedCard(card);
  }, []);

  // Cloud sync (opt-in): anonymous session → publish my card → load the crowd, my
  // connections and incoming requests → subscribe to live changes. All no-ops when the
  // backend has no keys, so the app keeps working purely on localStorage.
  useEffect(() => {
    if (!backend.isBackendEnabled) return;
    let cancelled = false;
    let cleanup = () => {};

    async function refreshProfiles() {
      const profs = await backend.fetchProfiles();
      if (cancelled) return;
      setExtraUsers(profs);
      const extra = profs.filter(p => !MOCK_IDS.has(p.id));
      setPeople(extra.length ? [...MOCK_USERS, ...extra] : MOCK_USERS);
    }
    async function refreshRequests() {
      const reqs = await backend.fetchRequests();
      if (cancelled) return;
      setRequests(prev => {
        const byId = new Map(SEED_REQUESTS.map(r => [r.userId, r]));
        for (const r of prev) byId.set(r.userId, r); // keep local accept/decline edits
        for (const r of reqs) byId.set(r.userId, r); // backend is source of truth for cloud reqs
        return Array.from(byId.values());
      });
    }

    // When the user finishes the magic-link sign-in, restore their account's card and re-sync.
    async function onSignedIn() {
      const mine = await backend.fetchMyProfile();
      if (cancelled) return;
      if (mine) {
        saveProfile({ ...loadProfile(), ...userToProfile(mine) }); // restore card (contacts stay local)
        setProfileNonce(n => n + 1);
        setShowWelcome(false);
      } else if (hasProfile(loadProfile())) {
        const uid = backend.currentUid();
        if (uid) backend.upsertMyProfile(profileToUser(loadProfile(), uid)); // carry my local card into the account
      }
      await refreshProfiles();
      await refreshRequests();
      const ct = await backend.fetchTasks();
      if (!cancelled && ct.length) {
        setTasks(prev => { const m = new Map(prev.map(t => [t.id, t])); ct.forEach(t => m.set(t.id, t)); return Array.from(m.values()); });
      }
    }

    (async () => {
      const uid = await backend.initSession();
      if (!uid || cancelled) return;
      setAuth(await backend.getAuthStatus());
      const myProfile = loadProfile();
      if (hasProfile(myProfile)) backend.upsertMyProfile(profileToUser(myProfile, uid)); // don't publish a blank card
      await refreshProfiles();
      const conns = await backend.fetchConnections();
      if (!cancelled && conns.length) setMatchedIds(prev => new Set([...prev, ...conns]));
      const cloudTasks = await backend.fetchTasks();
      if (!cancelled && cloudTasks.length) {
        setTasks(prev => {
          const byId = new Map(prev.map(t => [t.id, t]));
          for (const t of cloudTasks) byId.set(t.id, t); // cloud is source of truth across devices
          return Array.from(byId.values());
        });
      }
      await refreshRequests();
      const unsubReq = backend.subscribeRequests(refreshRequests);
      const unsubProf = backend.subscribeProfiles(refreshProfiles);
      const unsubAuth = backend.onAuthChange(status => {
        if (cancelled) return;
        setAuth(status);
        if (status.email) void onSignedIn(); // email present → just signed in / confirmed
      });
      cleanup = () => { unsubReq(); unsubProf(); unsubAuth(); };
    })();

    return () => { cancelled = true; cleanup(); };
  }, []);

  // Publish my edited card to the backend so others can discover me.
  function handleProfileSaved(p: StoredProfile) {
    setShowWelcome(false);
    const uid = backend.currentUid();
    if (uid && hasProfile(p)) backend.upsertMyProfile(profileToUser(p, uid));
  }

  // Paint BOTH the root and body with the tab fill so no strip of a different colour ever
  // shows at the very bottom (home-indicator area) or during the keyboard transition. The
  // purple top notch is painted by the sticky header itself (its top safe-area padding).
  useEffect(() => {
    const fill = TAB_BG[tab].fill;
    document.documentElement.style.background = fill;
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.background = fill;
  }, [tab]);

  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  function acceptRequest(userId: string) {
    setRequests(prev => prev.map(r => r.userId === userId ? { ...r, status: 'accepted' } : r));
    backend.updateRequest(userId, 'accepted');
    addMatch(userId); // awards points + registers the connection
  }
  function declineRequest(userId: string) {
    setRequests(prev => prev.map(r => r.userId === userId ? { ...r, status: 'declined' } : r));
    backend.updateRequest(userId, 'declined');
  }

  function toggleSession(id: string) {
    const adding = !mySessionIds.has(id);
    setMySessionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    if (adding) game.award('session_added');
  }

  // Persist tasks offline on every change (cloud sync is handled per-op below).
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  function addTask(task: Task) {
    setTasks(prev => [task, ...prev]);
    backend.upsertTask(task);
    game.award('contact_saved');
    setTab('tasks');
  }
  function toggleTaskDone(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    const t = tasks.find(x => x.id === id);
    if (t) backend.upsertTask({ ...t, done: !t.done });
  }
  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
    backend.deleteTask(id);
  }

  function openMapForLocation(location: string) {
    setMapHighlight(locationToZoneId(location));
    setTab('map');
  }

  const pendingTaskCount = tasks.filter(t => !t.done).length;
  const currentGroup = NAV_GROUPS.find(g => g.tabs.includes(tab)) || NAV_GROUPS[0];

  return (
    <I18nContext.Provider value={i18n}>
      <div style={{ minHeight: '100dvh', background: TAB_BG[tab].fill, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

        {/* Header — title + bell + points. Extends into the top safe area (notch) so it never shows a gap. */}
        <div style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #f06292 100%)', padding: 'calc(env(safe-area-inset-top) + 12px) 14px 0', color: '#fff', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: 'nowrap' }}>EventMatch 🤝</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>DevConnect 2026 · Amsterdam</div>
            </div>
            <button
              onClick={() => setInboxOpen(true)}
              title="Meeting requests"
              style={{ position: 'relative', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: 10, width: 38, height: 38, color: '#fff', cursor: 'pointer', fontSize: 17, flexShrink: 0 }}
            >
              🔔
              {pendingRequests > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff1744', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingRequests}</span>
              )}
            </button>
            <button
              onClick={() => setTab('leaderboard')}
              title="Your points"
              style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '5px 11px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
            >
              ⭐ {game.points}<span style={{ fontSize: 10, opacity: 0.85 }}>Lv{game.level}</span>
            </button>
          </div>

          {/* Level 1 — logical groups (few, clear) */}
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 8, marginTop: 10 }}>
            {NAV_GROUPS.map(g => {
              const active = g.id === currentGroup.id;
              const groupHasTasks = g.tabs.includes('tasks') && pendingTaskCount > 0;
              return (
                <button key={g.id} onClick={() => setTab(g.tabs[0])} style={{
                  position: 'relative', flex: 1, padding: '8px 6px', border: 'none', cursor: 'pointer',
                  borderRadius: 16, fontSize: 14, whiteSpace: 'nowrap',
                  background: active ? '#fff' : 'rgba(255,255,255,0.14)',
                  color: active ? '#6c63ff' : '#fff',
                  fontWeight: active ? 800 : 600,
                  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                }}>
                  {g.icon} {g.label}
                  {groupHasTasks && !active && (
                    <span style={{ position: 'absolute', top: 4, right: 8, background: '#ff1744', color: '#fff', borderRadius: 10, padding: '0 5px', fontSize: 9, fontWeight: 800 }}>{pendingTaskCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Level 2 — thematic sub-tabs within the active group (centered, wraps if needed) */}
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginTop: 8, padding: '0 0 9px' }}>
            {currentGroup.tabs.map(id => {
              const active = tab === id;
              const meta = TAB_META[id];
              return (
                <button key={id} onClick={() => setTab(id)} style={{
                  flexShrink: 0, padding: '4px 9px', border: 'none', cursor: 'pointer',
                  borderRadius: 13, fontSize: 11.5, whiteSpace: 'nowrap',
                  background: active ? 'rgba(255,255,255,0.95)' : 'transparent',
                  color: active ? '#6c63ff' : 'rgba(255,255,255,0.92)',
                  fontWeight: active ? 800 : 600,
                }}>
                  {meta.icon} {meta.label}
                  {id === 'tasks' && pendingTaskCount > 0 && (
                    <span style={{ marginLeft: 5, background: active ? '#f06292' : '#fff', color: active ? '#fff' : '#f06292', borderRadius: 10, padding: '0 6px', fontSize: 10, fontWeight: 800 }}>{pendingTaskCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meeting requests inbox */}
        {inboxOpen && (
          <RequestsInbox
            requests={requests}
            onAccept={acceptRequest}
            onDecline={declineRequest}
            onOpenProfile={u => setProfileUser(u)}
            onClose={() => setInboxOpen(false)}
          />
        )}

        {profileUser && <UserProfileDialog user={profileUser} onClose={() => setProfileUser(null)} />}

        {sharedCard && <SharedCardDialog card={sharedCard} onClose={() => { setSharedCard(null); history.replaceState(null, '', window.location.pathname); }} />}

        {/* First-visit onboarding — create your own card (never inherit a pre-filled one). */}
        {showWelcome && !sharedCard && (
          <Dialog title="👋 Welcome to EventMatch" onClose={() => setShowWelcome(false)} width={360}>
            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#444', lineHeight: 1.5 }}>
              Create your card so the right people can find you — your interests, skills and what
              you're looking for. It lives on your device; you choose which contacts to reveal.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button themeColor="primary" style={{ width: '100%', borderRadius: 10 }} onClick={() => { setShowWelcome(false); setTab('mycard'); }}>
                Create my card
              </Button>
              <Button fillMode="flat" themeColor="primary" style={{ width: '100%' }} onClick={() => setShowWelcome(false)}>
                Browse for now
              </Button>
            </div>
          </Dialog>
        )}

        {/* Achievement toast */}
        {game.toast && (
          <div onClick={game.clearToast} style={{
            position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
            background: '#fff', borderRadius: 14, boxShadow: '0 6px 28px rgba(0,0,0,0.18)',
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            border: '2px solid #6c63ff', maxWidth: 340,
          }}>
            <span style={{ fontSize: 28 }}>{game.toast.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: '#6c63ff', fontWeight: 700 }}>🎉 Badge unlocked!</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{game.toast.name}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{game.toast.desc}</div>
            </div>
          </div>
        )}

        {/* Per-tab background: the fill colour, which stretches across the whole screen */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundColor: TAB_BG[tab].fill }} />

        {/* Page column: white panel behind the text, then the footer illustration on the fill */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '12px 12px 0' }}>
          <div className="page-content" style={{
            background: 'rgba(255,255,255,0.92)', borderRadius: 18,
            boxShadow: '0 6px 24px rgba(0,0,0,0.10)', padding: '4px 16px 20px',
          }}>
          {tab === 'people'      && <PeoplePage mySessionIds={mySessionIds} matchedIds={matchedIds} onMatch={addMatch} onOpenProfile={setProfileUser} users={people} />}
          {tab === 'connections' && <ConnectionsPage matchedIds={matchedIds} onOpenProfile={setProfileUser} />}
          {tab === 'schedule'    && <SchedulePage mySessionIds={mySessionIds} onToggleSession={toggleSession} onOpenMap={openMapForLocation} onOpenConnect={() => setTab('connect')} />}
          {tab === 'map'         && <MapPage highlight={mapHighlight} />}
          {tab === 'groups'      && <GroupsPage />}
          {tab === 'connect'     && <ConnectPage />}
          {tab === 'capture'     && <QuickCapturePage onAddTask={addTask} />}
          {tab === 'tasks'       && <TasksPage tasks={tasks} onToggleDone={toggleTaskDone} onDelete={deleteTask} userEmail={userEmail} setUserEmail={setUserEmail} />}
          {tab === 'sponsors'    && <SponsorsPage onOpenMap={openMapForLocation} />}
          {tab === 'organisers'  && <OrganisersPage myMatches={matchedIds.size} />}
          {tab === 'leaderboard' && <LeaderboardPage />}
          {tab === 'mycard'      && <MyCardPage key={profileNonce} mySessionIds={mySessionIds} onProfileSaved={handleProfileSaved} backendEnabled={backend.isBackendEnabled} auth={auth} onSignIn={backend.signInWithEmail} onSignOut={backend.signOut} />}
          </div>

          {/* Footer illustration — bigger, centered at the bottom on the fill colour (outside the white panel) */}
          <img
            src={`${import.meta.env.BASE_URL}bg/${TAB_BG[tab].img}?v=${BG_V}`}
            alt=""
            style={{ display: 'block', width: 'min(1000px, 96%)', margin: '36px auto 0', userSelect: 'none', pointerEvents: 'none' }}
          />
        </div>
      </div>
    </I18nContext.Provider>
  );
}
