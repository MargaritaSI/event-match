import { Card, CardBody } from '@progress/kendo-react-layout';
import { useGamification } from '../lib/gamification';
import { ACHIEVEMENTS } from '../lib/gamificationLogic';
import { CURRENT_USER } from '../data/mockData';

const PEERS = [
  { name: 'Alex Chen', points: 215 },
  { name: 'Sasha Petrova', points: 180 },
  { name: 'Dima Volkov', points: 95 },
  { name: 'Priya Sharma', points: 60 },
  { name: 'Tom Bakker', points: 45 },
];

export function LeaderboardPage() {
  const game = useGamification();

  const rows = [...PEERS, { name: `${CURRENT_USER.name} (you)`, points: game.points, me: true }]
    .sort((a, b) => b.points - a.points);
  const myRank = rows.findIndex(r => (r as any).me) + 1;

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>🏆 Leaderboard</h2>
      <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>Earn points by connecting, planning & exploring</p>

      {/* My standing */}
      <Card style={{ borderRadius: 16, border: '2px solid #6c63ff', marginBottom: 16, background: 'linear-gradient(135deg, #f8f7ff, #fff0f6)' }}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#6c63ff' }}>#{myRank}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Your rank</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#6c63ff' }}>⭐ {game.points}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Points</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#6c63ff' }}>Lv {game.level}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Level</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Ranking */}
      <Card style={{ borderRadius: 14, border: '1px solid #e0e0e0', marginBottom: 16 }}>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rows.map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '9px 8px', borderRadius: 8,
                background: (row as any).me ? '#f0eeff' : 'transparent',
                fontWeight: (row as any).me ? 700 : 400,
              }}>
                <span style={{ fontSize: 14, color: i < 3 ? '#e65100' : '#aaa', minWidth: 26, fontWeight: 700 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span style={{ flex: 1, fontSize: 14 }}>{row.name}</span>
                <span style={{ fontSize: 14, color: '#6c63ff', fontWeight: 700 }}>⭐ {row.points}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Badges */}
      <Card style={{ borderRadius: 14, border: '1px solid #e0e0e0' }}>
        <CardBody>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            🎖 Badges ({game.unlocked.length}/{ACHIEVEMENTS.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {ACHIEVEMENTS.map(a => {
              const got = game.unlocked.some(u => u.id === a.id);
              return (
                <div key={a.id} title={`${a.name} — ${a.desc}`} style={{
                  textAlign: 'center', padding: '12px 4px', borderRadius: 10,
                  background: got ? '#f0eeff' : '#f7f7f7', opacity: got ? 1 : 0.5,
                  border: got ? '1px solid #d4cdff' : '1px solid #eee',
                }}>
                  <div style={{ fontSize: 26, filter: got ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                  <div style={{ fontSize: 9.5, color: got ? '#6c63ff' : '#aaa', fontWeight: 600, marginTop: 4, lineHeight: 1.2 }}>{a.name}</div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
