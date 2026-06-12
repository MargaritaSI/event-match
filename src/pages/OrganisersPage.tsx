import { Card, CardBody } from '@progress/kendo-react-layout';
import { MOCK_USERS, INTEREST_LABELS } from '../data/mockData';
import { GROUPS } from '../data/groups';
import { SESSIONS } from '../data/schedule';
import { topInterests, commonInterests } from '../lib/peopleLogic';
import { locationToZoneId } from '../lib/scheduleLogic';
import { useGamification } from '../lib/gamification';

const ZONE_NAMES: Record<string, string> = {
  webtrack: '🎤 Web Engineering Track',
  working: '💻 Working Zone',
  hackathon: '💡 Hackathon Zone',
  coffee: '☕ Coffee Point',
  food: '🍽 Food Court',
  registration: '📋 Registration',
};

interface Props {
  myMatches: number;
}

export function OrganisersPage({ myMatches }: Props) {
  const game = useGamification();
  const attendees = MOCK_USERS.length + 1;

  // Top interests — actually counted across all attendee profiles.
  const interests = topInterests(MOCK_USERS).slice(0, 8);
  const maxInterest = interests[0]?.count || 1;

  // "High-affinity pairs": real count of attendee pairs sharing >= 2 interests.
  let affinityPairs = 0;
  for (let i = 0; i < MOCK_USERS.length; i++) {
    for (let j = i + 1; j < MOCK_USERS.length; j++) {
      if (commonInterests(MOCK_USERS[i], MOCK_USERS[j].interests).length >= 2) affinityPairs++;
    }
  }

  // Speakers — counted from profiles.
  const speakerCount = MOCK_USERS.filter(u => u.speaker).length;

  // Zone crowd index: sum of group attendees + sessions scheduled there (all from real data).
  const zoneGoing: Record<string, number> = {};
  const zoneSessions: Record<string, number> = {};
  for (const g of GROUPS) {
    const z = locationToZoneId(g.meetPlace);
    if (z) zoneGoing[z] = (zoneGoing[z] || 0) + g.going;
  }
  for (const s of SESSIONS) {
    const z = locationToZoneId(s.location);
    if (z) zoneSessions[z] = (zoneSessions[z] || 0) + 1;
  }
  const zoneKeys = Array.from(new Set([...Object.keys(zoneGoing), ...Object.keys(zoneSessions)]));
  const zones = zoneKeys
    .map(z => ({ z, going: zoneGoing[z] || 0, sessions: zoneSessions[z] || 0, load: (zoneGoing[z] || 0) + (zoneSessions[z] || 0) * 10 }))
    .sort((a, b) => b.load - a.load);
  const maxZone = zones[0]?.load || 1;

  const totalGroupGoing = GROUPS.reduce((s, g) => s + g.going, 0);

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>📊 Organiser Dashboard</h2>
      <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>All figures computed live from attendee, group & session data</p>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Attendees', value: attendees, icon: '👥' },
          { label: 'Speakers', value: speakerCount, icon: '🎤' },
          { label: 'Groups', value: GROUPS.length, icon: '🏘' },
        ].map(kpi => (
          <Card key={kpi.label} style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <CardBody style={{ padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{kpi.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#6c63ff' }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{kpi.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'High-affinity pairs', value: affinityPairs, icon: '✨', hint: '≥2 shared interests' },
          { label: 'Group RSVPs', value: totalGroupGoing, icon: '🎟' },
          { label: 'Your matches', value: myMatches, icon: '🤝' },
        ].map(kpi => (
          <Card key={kpi.label} style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
            <CardBody style={{ padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{kpi.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#6c63ff' }}>{kpi.value}</div>
              <div style={{ fontSize: 10.5, color: '#888', lineHeight: 1.2 }}>{kpi.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Top interests */}
      <Card style={{ borderRadius: 14, border: '1px solid #e0e0e0', marginBottom: 16 }}>
        <CardBody>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🔥 Top interests in the crowd</div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 12 }}>Counted across {attendees} attendee profiles</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {interests.map(({ interest, count }) => (
              <div key={interest} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 110, fontSize: 12.5, flexShrink: 0 }}>{INTEREST_LABELS[interest] || interest}</div>
                <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 6, height: 16, overflow: 'hidden' }}>
                  <div style={{ width: `${(count / maxInterest) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6c63ff, #f06292)' }} />
                </div>
                <div style={{ width: 22, textAlign: 'right', fontSize: 12, color: '#888' }}>{count}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Zone heatmap */}
      <Card style={{ borderRadius: 14, border: '1px solid #e0e0e0' }}>
        <CardBody>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🗺 Zone crowd index</div>
          <div style={{ fontSize: 11, color: '#999', marginBottom: 12 }}>Group RSVPs + sessions scheduled per zone</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {zones.map(({ z, going, sessions, load }) => {
              const intensity = load / maxZone;
              return (
                <div key={z} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 170, fontSize: 12, flexShrink: 0 }}>
                    {ZONE_NAMES[z] || z}
                    <div style={{ fontSize: 10, color: '#aaa' }}>{going} RSVPs · {sessions} sessions</div>
                  </div>
                  <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 6, height: 18, overflow: 'hidden' }}>
                    <div style={{
                      width: `${intensity * 100}%`, height: '100%',
                      background: intensity > 0.66 ? '#e53935' : intensity > 0.33 ? '#fb8c00' : '#43a047',
                    }} />
                  </div>
                  <div style={{ width: 28, textAlign: 'right', fontSize: 12, color: '#888' }}>{load}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: '#888' }}>
            <span>🟢 Quiet</span><span>🟠 Busy</span><span>🔴 Packed</span>
          </div>
          <div style={{ fontSize: 10.5, color: '#bbb', marginTop: 8 }}>
            Index = RSVPs + sessions×10 · live from {GROUPS.length} groups & {SESSIONS.length} sessions
            {game.counts.match ? ` · +${game.counts.match} match this session` : ''}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
