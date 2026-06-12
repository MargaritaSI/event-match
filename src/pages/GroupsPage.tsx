import { useState } from 'react';
import { Card, CardBody } from '../ui';
import { Button } from '../ui';
import { Dialog, DialogActionsBar } from '../ui';
import { GROUPS, CATEGORY_LABELS } from '../data/groups';
import { MOCK_USERS } from '../data/mockData';
import { useGamification } from '../lib/gamification';

import type { EventGroup } from '../data/groups';


const CATEGORY_FILTERS = ['all', 'language', 'role', 'topic', 'interest'] as const;

export function GroupsPage() {
  const { award } = useGamification();
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<EventGroup | null>(null);
  const [filter, setFilter] = useState<typeof CATEGORY_FILTERS[number]>('all');

  function toggleJoin(id: string) {
    const joining = !joined.has(id);
    setJoined(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    if (joining) award('group_joined'); // award outside the updater (no double-fire in StrictMode)
  }

  const visible = GROUPS.filter(g => filter === 'all' || g.category === filter);

  // Mock: groups that are relevant to my interests
  const MY_INTERESTS = ['health', 'mobile', 'startup', 'design', 'ai'];
  const recommended = visible.filter(g => g.tags.some(t => MY_INTERESTS.some(i => t.toLowerCase().includes(i))));
  const others = visible.filter(g => !recommended.includes(g));

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Groups</h2>
      <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>
        <strong>Lasting communities</strong> by stack, role or interest. Meet at a set time & place, then keep in touch on Discord.
        <span style={{ color: '#999' }}> (For quick break chats, see Connect → Topics.)</span>
      </p>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORY_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={chipStyle(filter === f, '#6c63ff')}>
            {f === 'all' ? 'All' : CATEGORY_LABELS[f as keyof typeof CATEGORY_LABELS]}
          </button>
        ))}
      </div>

      {joined.size > 0 && (
        <div style={{ background: '#f0eeff', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#6c63ff', marginBottom: 6 }}>🎟 I'm going to ({joined.size})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GROUPS.filter(g => joined.has(g.id)).map(g => (
              <span key={g.id} style={{ background: g.color + '22', color: g.color, borderRadius: 12, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                {g.icon} {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {recommended.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, color: '#6c63ff', margin: '0 0 10px' }}>✨ Recommended for you</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {recommended.map(g => <GroupCard key={g.id} group={g} isJoined={joined.has(g.id)} onJoin={() => toggleJoin(g.id)} onOpen={() => setSelected(g)} />)}
          </div>
        </>
      )}

      {others.length > 0 && (
        <>
          {recommended.length > 0 && <h3 style={{ fontSize: 14, color: '#555', margin: '0 0 10px' }}>All groups</h3>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {others.map(g => <GroupCard key={g.id} group={g} isJoined={joined.has(g.id)} onJoin={() => toggleJoin(g.id)} onOpen={() => setSelected(g)} />)}
          </div>
        </>
      )}

      {selected && (
        <Dialog title={`${selected.icon} ${selected.name}`} onClose={() => setSelected(null)} width={380}>
          <div style={{ padding: '8px 0' }}>
            <p style={{ margin: '0 0 12px', color: '#444', fontSize: 14 }}>{selected.description}</p>

            <div style={{ background: selected.color + '15', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: selected.color, marginBottom: 8 }}>📍 Where & when to meet</div>
              <div style={{ fontSize: 14 }}>
                <div>📅 {selected.meetDay === 1 ? 'Day 1 (Thu Jun 11)' : 'Day 2 (Fri Jun 12)'} at <strong>{selected.meetTime}</strong></div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: selected.meetPlaceColor, display: 'inline-block', marginRight: 6 }} />
                  <strong>{selected.meetPlace}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>🏷 Topics</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {selected.tags.map(tag => (
                  <span key={tag} style={{ background: '#f0f0f0', borderRadius: 12, padding: '3px 10px', fontSize: 12 }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Example discussions this community gathers around */}
            <div style={{ marginBottom: 12, background: '#f8f8ff', borderRadius: 10, padding: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>💬 Example discussions</div>
              {selected.discussions.map((d, i) => (
                <div key={i} style={{ fontSize: 12.5, color: '#555', marginBottom: 3 }}>• {d}</div>
              ))}
            </div>

            {joined.has(selected.id) && (
              <div style={{ background: '#f0fff4', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#2d6a4f', marginBottom: 8 }}>👥 {selected.going + 1} going</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {MOCK_USERS.slice(0, 3).map(u => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 20, padding: '4px 10px', fontSize: 13 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #f06292)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{u.name[0]}</div>
                      {u.name}
                    </div>
                  ))}
                  <div style={{ fontSize: 13, color: '#888', padding: '4px 10px' }}>+ more</div>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                  Members' cards become visible to each other after you join
                </div>
              </div>
            )}

            {/* Community lives on after the event */}
            <div style={{ background: '#f0eeff', borderRadius: 10, padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#5865F2', marginBottom: 4 }}>🪐 Community lives on</div>
              <div style={{ fontSize: 12.5, color: '#555', marginBottom: 8 }}>
                This group keeps going after {/* event */}the event — join the Discord to stay in touch.
              </div>
              <a href={selected.discord} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <span style={{ display: 'inline-block', background: '#5865F2', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600 }}>
                  💬 Join Discord community
                </span>
              </a>
            </div>
          </div>
          <DialogActionsBar>
            <Button onClick={() => setSelected(null)}>Close</Button>
            <Button
              themeColor={joined.has(selected.id) ? 'error' : 'primary'}
              fillMode={joined.has(selected.id) ? 'outline' : 'solid'}
              onClick={() => { toggleJoin(selected.id); setSelected(null); }}
            >
              {joined.has(selected.id) ? "🚫 Not going" : "✓ I'm going"}
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </div>
  );
}

function GroupCard({ group: g, isJoined, onJoin, onOpen }: { group: EventGroup; isJoined: boolean; onJoin: () => void; onOpen: () => void }) {
  return (
    <Card
      style={{ borderRadius: 12, border: isJoined ? `2px solid ${g.color}` : '1px solid #e0e0e0', cursor: 'pointer' }}
      onClick={onOpen}
    >
      <CardBody style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, background: g.color + '20',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
          }}>{g.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{g.name}</span>
              <span style={{ fontSize: 11, background: g.color + '20', color: g.color, borderRadius: 6, padding: '1px 8px', fontWeight: 600 }}>
                {CATEGORY_LABELS[g.category]}
              </span>
              {isJoined && <span style={{ fontSize: 11, color: '#2d6a4f', fontWeight: 700 }}>✓ Joined</span>}
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#555', lineHeight: 1.4 }}>{g.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {g.meetTime && (
                <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.meetPlaceColor, display: 'inline-block' }} />
                  Day {g.meetDay} · {g.meetTime} · {g.meetPlace}
                </div>
              )}
              <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>👥 {g.going + (isJoined ? 1 : 0)} going</span>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onJoin(); }}
            title={isJoined ? "You're going — tap to leave" : 'Join this group'}
            style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, flexShrink: 0,
              background: isJoined ? g.color : '#f0f0f0', color: isJoined ? '#fff' : '#333', fontWeight: isJoined ? 700 : 400,
            }}
          >
            {isJoined ? "✓ Going" : 'Join'}
          </button>
        </div>
      </CardBody>
    </Card>
  );
}

function chipStyle(active: boolean, color: string): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
    background: active ? color : '#f0f0f0', color: active ? '#fff' : '#555', fontWeight: active ? 700 : 400,
  };
}
