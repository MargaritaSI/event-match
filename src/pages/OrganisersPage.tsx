import { Card, CardBody } from '@progress/kendo-react-layout';
import { MOCK_USERS, INTEREST_LABELS } from '../data/mockData';
import { GROUPS } from '../data/groups';
import { SESSIONS } from '../data/schedule';
import { topInterests } from '../lib/peopleLogic';
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

export function OrganisersPage() {
  const game = useGamification();

  // Top interests across the crowd
  const interests = topInterests(MOCK_USERS).slice(0, 8);
  const maxInterest = interests[0]?.count || 1;

  // Match activity: seeded ambient + your real matches this session
  const ambientMatches = 128;
  const totalMatches = ambientMatches + (game.counts.match || 0);

  // Zone crowd heatmap: sum group "going" + session presence per zone
  const zoneLoad: Record<string, number> = {};
  for (const g of GROUPS) {
    const z = locationToZoneId(g.meetPlace);
    if (z) zoneLoad[z] = (zoneLoad[z] || 0) + g.going;
  }
  for (const s of SESSIONS) {
    const z = locationToZoneId(s.location);
    if (z) zoneLoad[z] = (zoneLoad[z] || 0) + 8;
  }
  const zones = Object.entries(zoneLoad).sort((a, b) => b[1] - a[1]);
  const maxZone = zones[0]?.[1] || 1;

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>📊 Organiser Dashboard</h2>
      <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>Live pulse of DevConnect 2026</p>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Attendees', value: MOCK_USERS.length + 1, icon: '👥' },
          { label: 'Matches made', value: totalMatches, icon: '🤝' },
          { label: 'Active groups', value: GROUPS.length, icon: '🏘' },
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

      {/* Top interests */}
      <Card style={{ borderRadius: 14, border: '1px solid #e0e0e0', marginBottom: 16 }}>
        <CardBody>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🔥 Top interests in the crowd</div>
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
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🗺 Zone heatmap</div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>Where the crowd is concentrating right now</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {zones.map(([zone, load]) => {
              const intensity = load / maxZone;
              return (
                <div key={zone} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 170, fontSize: 12.5, flexShrink: 0 }}>{ZONE_NAMES[zone] || zone}</div>
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
        </CardBody>
      </Card>
    </div>
  );
}
