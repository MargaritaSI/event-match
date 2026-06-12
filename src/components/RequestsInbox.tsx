import { Avatar } from './Avatar';
import { Button } from '../ui';
import { getUserById, userCode } from '../data/mockData';
import type { User } from '../types';

export interface MeetRequest {
  userId: string;
  status: 'pending' | 'accepted' | 'declined';
  note?: string;
}

interface Props {
  requests: MeetRequest[];
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  onOpenProfile: (u: User) => void;
  onClose: () => void;
}

export function RequestsInbox({ requests, onAccept, onDecline, onOpenProfile, onClose }: Props) {
  const pending = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 70 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 320, maxWidth: '90vw', background: '#fff', zIndex: 80,
        boxShadow: '-2px 0 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ background: 'linear-gradient(135deg, #6c63ff, #f06292)', color: '#fff', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>🔔 Meeting requests</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: 12 }}>
          {pending.length === 0 && accepted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bbb' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 14 }}>No requests yet</div>
            </div>
          )}

          {pending.length > 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: '#888', margin: '4px 2px 8px' }}>PENDING ({pending.length})</div>
          )}
          {pending.map(r => {
            const u = getUserById(r.userId);
            if (!u) return null;
            return (
              <div key={r.userId} style={{ border: '1px solid #e8e8e8', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Avatar name={u.name} color={u.photoColor} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{u.role}{u.company ? ` · ${u.company}` : ''}</div>
                  </div>
                </div>
                {r.note && <div style={{ fontSize: 12.5, color: '#555', fontStyle: 'italic', marginBottom: 8 }}>"{r.note}"</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button themeColor="primary" size="small" style={{ flex: 1 }} onClick={() => onAccept(r.userId)}>✓ Accept</Button>
                  <Button fillMode="outline" size="small" style={{ flex: 1 }} onClick={() => onDecline(r.userId)}>✕ Decline</Button>
                </div>
              </div>
            );
          })}

          {accepted.length > 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2d6a4f', margin: '14px 2px 8px' }}>MATCHED ({accepted.length})</div>
          )}
          {accepted.map(r => {
            const u = getUserById(r.userId);
            if (!u) return null;
            return (
              <div key={r.userId} onClick={() => onOpenProfile(u)} style={{ border: '1.5px solid #6c63ff', borderRadius: 12, padding: 12, marginBottom: 10, background: '#f8f7ff', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Avatar name={u.name} color={u.photoColor} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name} <span style={{ color: '#2d6a4f', fontSize: 12 }}>✓ matched</span></div>
                    <div style={{ fontSize: 12, color: '#888' }}>{userCode(u.id)} · tap to view profile ›</div>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: '#555' }}>
                  {Object.entries(u.socials).map(([k, v]) => <div key={k}>{k}: <strong>{v}</strong></div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
