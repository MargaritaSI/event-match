import { useState } from 'react';
import { Dialog } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { Avatar } from './Avatar';
import { InterestBadge } from './InterestBadge';
import type { Interest } from '../types';

export interface SharedCard {
  uid: string;
  name: string;
  role?: string;
  company?: string;
  bio?: string;
  interests?: Interest[];
  contacts?: Record<string, string>;
}

/** Decode a #card=<base64> payload into a SharedCard, or null if invalid. */
export function decodeSharedCard(hash: string): SharedCard | null {
  const m = hash.match(/card=([^&]+)/);
  if (!m) return null;
  try {
    const json = decodeURIComponent(escape(atob(m[1])));
    const obj = JSON.parse(json);
    if (obj && obj.name) return obj as SharedCard;
  } catch { /* invalid */ }
  return null;
}

export function SharedCardDialog({ card, onClose }: { card: SharedCard; onClose: () => void }) {
  const [connected, setConnected] = useState(false);

  return (
    <Dialog title="📇 Shared card" onClose={onClose} width={360}>
      <div style={{ padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <Avatar name={card.name} size={60} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{card.name}</div>
            {card.role && <div style={{ color: '#6c63ff', fontSize: 13, fontWeight: 600 }}>{card.role}{card.company ? ` · ${card.company}` : ''}</div>}
          </div>
        </div>

        {card.bio && <p style={{ margin: '0 0 12px', color: '#444', fontSize: 14 }}>{card.bio}</p>}

        {card.interests && card.interests.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {card.interests.map(i => <InterestBadge key={i} interest={i} small />)}
          </div>
        )}

        {!connected ? (
          <div style={{ background: '#f8f8ff', borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>Someone shared their card with you. Connect to see their contacts.</div>
            <Button themeColor="primary" onClick={() => setConnected(true)}>🤝 Connect</Button>
          </div>
        ) : (
          <div style={{ background: '#f0fff4', borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#2d6a4f', marginBottom: 8 }}>🎉 Connected · Contacts</div>
            {card.contacts && Object.keys(card.contacts).length > 0 ? (
              Object.entries(card.contacts).map(([k, v]) => (
                <div key={k} style={{ fontSize: 13, marginBottom: 3 }}>
                  <span style={{ color: '#999', textTransform: 'capitalize' }}>{k}:</span> <strong>{v}</strong>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 13, color: '#888' }}>They didn't share any contacts on this link.</div>
            )}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', paddingTop: 12 }}>
        <Button onClick={onClose}>Close</Button>
      </div>
    </Dialog>
  );
}
