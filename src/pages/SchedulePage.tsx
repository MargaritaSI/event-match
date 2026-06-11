import { useState, useEffect } from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { SESSIONS, getNowAmsterdam, isSessionNow, isSessionUpcoming } from '../data/schedule';
import { computeGaps, minutesToLabel, gapSuggestion, locationToZoneId, timeToMinutes } from '../lib/scheduleLogic';
import { useT } from '../i18n';
import type { Session } from '../data/schedule';

interface Props {
  mySessionIds: Set<string>;
  onToggleSession: (id: string) => void;
  onOpenMap: (location: string) => void;
  onOpenConnect: () => void;
}

const TYPE_ICONS: Record<Session['type'], string> = {
  keynote: '🎤',
  talk: '💬',
  workshop: '🛠',
  networking: '🤝',
  break: '☕',
  hackathon: '💻',
};

export function SchedulePage({ mySessionIds, onToggleSession, onOpenMap, onOpenConnect }: Props) {
  const { t } = useT();
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [viewMine, setViewMine] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [now, setNow] = useState(getNowAmsterdam());

  useEffect(() => {
    const interval = setInterval(() => setNow(getNowAmsterdam()), 60000);
    return () => clearInterval(interval);
  }, []);

  const sessions = SESSIONS
    .filter(s => viewMine ? mySessionIds.has(s.id) : s.day === activeDay)
    .sort((a, b) => a.day - b.day || timeToMinutes(a.time) - timeToMinutes(b.time));

  // Free gaps between MY sessions → social-time suggestions (only in "My schedule")
  const mySessions = SESSIONS.filter(s => mySessionIds.has(s.id));
  const gaps = viewMine ? computeGaps(mySessions) : [];
  const gapAfter = (sessionId: string) => gaps.find(g => g.afterSessionId === sessionId);

  // Total free social time across my day
  const totalFree = gaps.reduce((sum, g) => sum + g.minutes, 0);

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{t.schedule.title}</h2>
      <p style={{ margin: '0 0 16px', color: '#888', fontSize: 12 }}>{t.schedule.allTimes}</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setViewMine(false); setActiveDay(1); }}
          style={tabStyle(!viewMine && activeDay === 1)}
        >{t.schedule.day1}</button>
        <button
          onClick={() => { setViewMine(false); setActiveDay(2); }}
          style={tabStyle(!viewMine && activeDay === 2)}
        >{t.schedule.day2}</button>
        <button
          onClick={() => setViewMine(true)}
          style={tabStyle(viewMine, '#f06292')}
        >⭐ {t.schedule.mySchedule} {mySessionIds.size > 0 && `(${mySessionIds.size})`}</button>
      </div>

      {viewMine && mySessionIds.size === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
          <div>{t.schedule.emptyMine}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {viewMine && totalFree > 0 && (
            <div style={{ background: '#f0eeff', borderRadius: 12, padding: '12px 14px', marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#6c63ff' }}>
                🕑 {minutesToLabel(totalFree)} free for socializing
              </div>
              <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>
                Time between your sessions — use it to meet people
              </div>
            </div>
          )}
          {sessions.map(session => {
            const isNow = isSessionNow(session, now);
            const isUpcoming = isSessionUpcoming(session, now);
            const isMine = mySessionIds.has(session.id);
            const gap = gapAfter(session.id);

            return (
              <div key={session.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Card
                style={{
                  borderRadius: 12,
                  border: isNow ? `2px solid ${session.locationColor}` : isMine ? '2px solid #6c63ff' : '1px solid #e0e0e0',
                  background: isNow ? `${session.locationColor}08` : '#fff',
                }}
              >
                <CardBody style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ textAlign: 'center', minWidth: 48 }}>
                      <div style={{ fontSize: 18 }}>{TYPE_ICONS[session.type]}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{session.time}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{session.endTime}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                        {isNow && (
                          <span style={{ background: session.locationColor, color: '#fff', borderRadius: 6, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
                            {t.schedule.now}
                          </span>
                        )}
                        {isUpcoming && !isNow && (
                          <span style={{ background: '#fff3e0', color: '#e65100', borderRadius: 6, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
                            ↑ {t.schedule.upcoming}
                          </span>
                        )}
                        {isMine && !isNow && (
                          <span style={{ background: '#ede7f6', color: '#6c63ff', borderRadius: 6, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
                            ⭐
                          </span>
                        )}
                      </div>
                      <div
                        onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{session.title}</div>
                        {session.speaker && (
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 3 }}>
                            🎤 {session.speaker}{session.speakerCompany ? ` · ${session.speakerCompany}` : ''}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: session.locationColor, flexShrink: 0, display: 'inline-block' }} />
                        {locationToZoneId(session.location) ? (
                          <button
                            onClick={() => onOpenMap(session.location)}
                            style={{ fontSize: 12, color: '#6c63ff', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                          >
                            📍 {session.location}
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#666' }}>{session.location}</span>
                        )}
                        {session.description && (
                          <button
                            onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                            style={{ fontSize: 11, color: '#999', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
                          >
                            {expanded === session.id ? 'less ▴' : 'details ▾'}
                          </button>
                        )}
                      </div>
                      {expanded === session.id && session.description && (
                        <div style={{ marginTop: 8, padding: '8px 10px', background: '#f8f8ff', borderRadius: 8, fontSize: 12.5, color: '#555', lineHeight: 1.5 }}>
                          {session.description}
                          {session.speakerCompany && (
                            <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                              Speaker from <strong>{session.speakerCompany}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onToggleSession(session.id)}
                      title={isMine ? t.schedule.remove : t.schedule.addToMine}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                        color: isMine ? '#6c63ff' : '#ccc', padding: '0 4px', flexShrink: 0,
                      }}
                    >
                      {isMine ? '⭐' : '☆'}
                    </button>
                  </div>
                </CardBody>
              </Card>

              {/* Free-time gap card with social suggestion */}
              {gap && (() => {
                const sug = gapSuggestion(gap.minutes);
                return (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'linear-gradient(135deg, #fff8f0, #fff0f6)',
                    border: '1px dashed #f0a0c0', borderRadius: 12, padding: '10px 14px',
                  }}>
                    <span style={{ fontSize: 22 }}>{sug.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#d6336c' }}>
                        {minutesToLabel(gap.minutes)} free · {gap.startTime}–{gap.endTime}
                      </div>
                      <div style={{ fontSize: 12, color: '#777' }}>{sug.text}</div>
                    </div>
                    <button
                      onClick={onOpenConnect}
                      style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      {sug.cta}
                    </button>
                  </div>
                );
              })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function tabStyle(active: boolean, color = '#6c63ff') {
  return {
    padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
    background: active ? color : '#f0f0f0',
    color: active ? '#fff' : '#555',
    fontWeight: active ? 700 : 400,
  } as React.CSSProperties;
}
