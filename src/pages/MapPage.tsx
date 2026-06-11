import { Card, CardBody } from '@progress/kendo-react-layout';
import { VenueMap } from '../components/VenueMap';
import { SESSIONS, getNowAmsterdam, isSessionNow } from '../data/schedule';
import { useT } from '../i18n';

export function MapPage({ highlight }: { highlight?: string | null }) {
  const { t } = useT();
  const now = getNowAmsterdam();
  const currentSessions = SESSIONS.filter(s => isSessionNow(s, now));

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{t.map.title}</h2>
      <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>{t.map.subtitle}</p>

      {currentSessions.length > 0 && (
        <Card style={{ borderRadius: 12, marginBottom: 16, border: '2px solid #e65100', background: '#fff8f5' }}>
          <CardBody style={{ padding: '10px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#e65100', marginBottom: 6 }}>🔴 {t.schedule.now}</div>
            {currentSessions.map(s => (
              <div key={s.id} style={{ fontSize: 14, marginBottom: 4 }}>
                <strong>{s.title}</strong>
                <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.locationColor, display: 'inline-block', marginRight: 4 }} />
                  {s.location}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {highlight && (
        <div style={{ background: '#f0eeff', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#6c63ff', fontWeight: 600 }}>
          📍 Highlighting your session's location below
        </div>
      )}

      <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
        <CardBody>
          <VenueMap highlight={highlight} />
        </CardBody>
      </Card>
    </div>
  );
}
