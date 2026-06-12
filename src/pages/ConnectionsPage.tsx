import { Card, CardBody } from '../ui';
import { Button } from '../ui';
import { Avatar } from '../components/Avatar';
import { InterestBadge } from '../components/InterestBadge';
import { getUserById, userCode, CURRENT_USER } from '../data/mockData';
import { commonInterests } from '../lib/peopleLogic';
import type { User } from '../types';

const MY_INTERESTS = CURRENT_USER.interests;

interface Props {
  matchedIds: Set<string>;
  onOpenProfile: (u: User) => void;
}

export function ConnectionsPage({ matchedIds, onOpenProfile }: Props) {
  const matches = Array.from(matchedIds).map(getUserById).filter(Boolean) as User[];

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>🤝 My Connections</h2>
      <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>
        Everyone you matched with — contacts unlocked. {matches.length > 0 && `${matches.length} connection${matches.length !== 1 ? 's' : ''}.`}
      </p>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#bbb' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🤝</div>
          <div style={{ fontSize: 15 }}>No connections yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Match with people in People, or accept a request in 🔔</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {matches.map(u => {
            const common = commonInterests(u, MY_INTERESTS);
            return (
              <Card key={u.id} style={{ borderRadius: 12, border: '1.5px solid #6c63ff' }}>
                <CardBody style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Avatar name={u.name} color={u.photoColor} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name} <span style={{ color: '#2d6a4f', fontSize: 12 }}>✓ matched</span></div>
                      <div style={{ fontSize: 12.5, color: '#888' }}>{u.role}{u.company ? ` · ${u.company}` : ''} · {userCode(u.id)}</div>
                    </div>
                  </div>

                  {common.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      {common.map(i => <InterestBadge key={i} interest={i} small />)}
                    </div>
                  )}

                  <div style={{ background: '#f0fff4', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, color: '#555', marginBottom: 8 }}>
                    {Object.entries(u.socials).map(([k, v]) => (
                      <span key={k} style={{ marginRight: 12, whiteSpace: 'nowrap' }}><span style={{ color: '#999', textTransform: 'capitalize' }}>{k}:</span> <strong>{v}</strong></span>
                    ))}
                  </div>

                  <Button size="small" fillMode="outline" themeColor="primary" onClick={() => onOpenProfile(u)}>👤 View profile</Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
