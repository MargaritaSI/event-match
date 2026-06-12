import { Dialog } from '../ui';
import { Button } from '../ui';
import { Avatar } from './Avatar';
import { InterestBadge } from './InterestBadge';
import { userCode } from '../data/mockData';
import type { User } from '../types';

interface Props {
  user: User;
  onClose: () => void;
}

export function UserProfileDialog({ user, onClose }: Props) {
  return (
    <Dialog title={user.name} onClose={onClose} width={380}>
      <div style={{ padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <Avatar name={user.name} color={user.photoColor} size={60} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
            {user.role && <div style={{ color: '#6c63ff', fontSize: 13, fontWeight: 600 }}>{user.role}</div>}
            <div style={{ color: '#aaa', fontSize: 12 }}>🆔 {userCode(user.id)}</div>
          </div>
        </div>

        {user.bio && <p style={{ margin: '0 0 12px', color: '#444', fontSize: 14 }}>{user.bio}</p>}

        <div style={{ marginBottom: 12 }}>
          {user.interests.map(i => <InterestBadge key={i} interest={i} small />)}
        </div>

        {user.lookingFor && (
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            <strong style={{ color: '#e65100' }}>🔎 Looking for:</strong> {user.lookingFor}
          </div>
        )}
        {user.canHelp && (
          <div style={{ fontSize: 13, marginBottom: 12 }}>
            <strong style={{ color: '#2e7d32' }}>🤝 Can help with:</strong> {user.canHelp}
          </div>
        )}

        <div style={{ background: '#f0fff4', borderRadius: 10, padding: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🔗 Contacts</div>
          {Object.entries(user.socials).map(([k, v]) => (
            <div key={k} style={{ fontSize: 13, color: '#555' }}>
              <span style={{ textTransform: 'capitalize', color: '#999' }}>{k}:</span> <strong>{v}</strong>
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'right', paddingTop: 12 }}>
        <Button themeColor="primary" onClick={onClose}>Close</Button>
      </div>
    </Dialog>
  );
}
