import { useState, useEffect } from 'react';
import '@progress/kendo-theme-default/dist/all.css';
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
import type { Task, User } from './types';

// Seeded incoming meeting requests (in a real app these arrive from the backend).
const SEED_REQUESTS: MeetRequest[] = [
  { userId: '3', status: 'pending', note: "Loved your health app idea — can we chat about roles?" },
  { userId: '21', status: 'pending', note: "I invest in health-tech, would love to hear more." },
  { userId: '13', status: 'pending', note: "Want to feature your project in a talk!" },
];

type Tab = 'people' | 'connections' | 'schedule' | 'map' | 'groups' | 'connect' | 'capture' | 'tasks' | 'sponsors' | 'organisers' | 'leaderboard' | 'mycard';

// Background illustration per tab (files in public/bg). Every tab gets one (images reused).
const TAB_BG: Record<Tab, string> = {
  people: 'people.jpg',
  connections: 'connect.jpg',
  groups: 'groups.jpg',
  connect: 'connect.jpg',
  leaderboard: 'leaderboard.jpg',
  map: 'map.jpg',
  organisers: 'organisers.jpg',
  schedule: 'leaderboard.jpg',
  capture: 'connect.jpg',
  tasks: 'organisers.jpg',
  sponsors: 'groups.jpg',
  mycard: 'people.jpg',
};

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'people',      icon: '👥', label: 'People' },
  { id: 'connections', icon: '🤝', label: 'Connections' },
  { id: 'schedule',    icon: '📅', label: 'Schedule' },
  { id: 'map',         icon: '🗺', label: 'Map' },
  { id: 'groups',      icon: '🏘', label: 'Groups' },
  { id: 'connect',     icon: '☕', label: 'Connect' },
  { id: 'capture',     icon: '⚡', label: 'Quick Capture' },
  { id: 'tasks',       icon: '📋', label: 'Tasks' },
  { id: 'sponsors',    icon: '🏢', label: 'Sponsors' },
  { id: 'organisers',  icon: '📊', label: 'Organisers' },
  { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
  { id: 'mycard',      icon: '🪪', label: 'My Card' },
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mapHighlight, setMapHighlight] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [requests, setRequests] = useState<MeetRequest[]>(SEED_REQUESTS);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [sharedCard, setSharedCard] = useState<SharedCard | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());

  // Central match registry — used by People, the requests inbox and the Connections tab.
  function addMatch(userId: string) {
    if (matchedIds.has(userId)) return;
    setMatchedIds(prev => new Set(prev).add(userId));
    game.award('match');
  }

  // If opened via a shared link (#card=...), show that person's card.
  useEffect(() => {
    const card = decodeSharedCard(window.location.hash);
    if (card) setSharedCard(card);
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  function acceptRequest(userId: string) {
    setRequests(prev => prev.map(r => r.userId === userId ? { ...r, status: 'accepted' } : r));
    addMatch(userId); // awards points + registers the connection
  }
  function declineRequest(userId: string) {
    setRequests(prev => prev.map(r => r.userId === userId ? { ...r, status: 'declined' } : r));
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

  function addTask(task: Task) {
    setTasks(prev => [task, ...prev]);
    game.award('contact_saved');
    setTab('tasks');
  }
  function toggleTaskDone(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function openMapForLocation(location: string) {
    setMapHighlight(locationToZoneId(location));
    setTab('map');
  }

  const pendingTaskCount = tasks.filter(t => !t.done).length;

  return (
    <I18nContext.Provider value={i18n}>
      <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

        {/* Header — title + bell + points */}
        <div style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #f06292 100%)', padding: '12px 14px 0', color: '#fff', position: 'sticky', top: 0, zIndex: 30 }}>
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

          {/* Scrollable tab ribbon — persistent, scrolls horizontally if it overflows */}
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 2, overflowX: 'auto', marginTop: 8, paddingBottom: 0, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {TABS.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)} style={{
                position: 'relative', flexShrink: 0, padding: '8px 12px', border: 'none', cursor: 'pointer',
                background: 'none', color: '#fff', fontSize: 13, whiteSpace: 'nowrap',
                fontWeight: tab === tb.id ? 800 : 500,
                opacity: tab === tb.id ? 1 : 0.8,
                borderBottom: tab === tb.id ? '3px solid #fff' : '3px solid transparent',
              }}>
                {tb.icon} {tb.label}
                {tb.id === 'tasks' && pendingTaskCount > 0 && (
                  <span style={{ marginLeft: 5, background: '#fff', color: '#f06292', borderRadius: 10, padding: '0 6px', fontSize: 10, fontWeight: 800 }}>{pendingTaskCount}</span>
                )}
              </button>
            ))}
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

        {/* Per-tab background illustration (only a 10% white veil so the image stays visible) */}
        {TAB_BG[tab] && (
          <div style={{
            position: 'fixed', inset: 0, top: 96, zIndex: 0, pointerEvents: 'none',
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)), url(${import.meta.env.BASE_URL}bg/${TAB_BG[tab]})`,
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
          }} />
        )}

        {/* Page content */}
        <div className="page-content" style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '0 16px 40px' }}>
          {tab === 'people'      && <PeoplePage mySessionIds={mySessionIds} matchedIds={matchedIds} onMatch={addMatch} onOpenProfile={setProfileUser} />}
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
          {tab === 'mycard'      && <MyCardPage mySessionIds={mySessionIds} />}
        </div>
      </div>
    </I18nContext.Provider>
  );
}
