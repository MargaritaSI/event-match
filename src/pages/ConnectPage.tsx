import { useState } from 'react';
import { Card, CardBody } from '../ui';
import { Button } from '../ui';
import { ICE_BREAKERS, MOCK_USERS, CURRENT_USER, INTEREST_LABELS } from '../data/mockData';
import { SESSIONS, getNowAmsterdam, isSessionUpcoming } from '../data/schedule';
import { commonInterests } from '../lib/peopleLogic';
import { useGamification } from '../lib/gamification';

const ALL_ICEBREAKERS = Object.values(ICE_BREAKERS).flat();
const MY_INTERESTS = CURRENT_USER.interests;


const MEETUP_SYSTEMS = [
  {
    id: 'random',
    name: 'Random Match',
    icon: '🎲',
    description: 'Get matched with a random person for a 10-min coffee chat. Pure serendipity.',
    color: '#6c63ff',
  },
  {
    id: 'interest',
    name: 'Interest Match',
    icon: '✨',
    description: 'Meet someone who shares your top interest. Instant talking point guaranteed.',
    color: '#f06292',
  },
  {
    id: 'topic',
    name: 'Topic Table',
    icon: '💬',
    description: 'Join a discussion topic. Small group, 3-5 people, one focused question.',
    color: '#2196f3',
  },
  {
    id: 'silent',
    name: 'Quiet Co-work',
    icon: '🤫',
    description: 'Work alongside someone at the coffee point. No small talk required.',
    color: '#795548',
  },
];

const IB_PAGE = 15;

export function ConnectPage() {
  const { award } = useGamification();
  const [currentIB, setCurrentIB] = useState(0);
  const [chosenSystem, setChosenSystem] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [showAllIB, setShowAllIB] = useState(false);
  const [ibShown, setIbShown] = useState(IB_PAGE);

  const now = getNowAmsterdam();
  const nextSessions = SESSIONS.filter(s => isSessionUpcoming(s, now)).slice(0, 2);

  function nextBreak() {
    if (nextSessions.length === 0) return null;
    const next = nextSessions[0];
    return { time: next.time, before: next.title };
  }
  const nb = nextBreak();

  function handleFindMatch(system: string) {
    setChosenSystem(system);
    setTimeout(() => {
      // 'interest' → match someone who shares at least one of my interests; others → anyone.
      const pool = system === 'interest'
        ? MOCK_USERS.filter(u => commonInterests(u, MY_INTERESTS).length > 0)
        : MOCK_USERS;
      const list = pool.length > 0 ? pool : MOCK_USERS;
      const picked = list[Math.floor(Math.random() * list.length)];
      setMatchedUser(picked);
      award('coffee_meetup');
    }, 1200);
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Connect</h2>
      <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>
        Break the ice · Meet between sessions · Join a discussion
      </p>

      {/* Next break info */}
      {nb && (
        <Card style={{ borderRadius: 12, border: '2px solid #6c63ff', marginBottom: 20, background: '#f8f8ff' }}>
          <CardBody style={{ padding: '12px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#6c63ff', marginBottom: 4 }}>☕ Next break opportunity</div>
            <div style={{ fontSize: 14 }}>Before <strong>{nb.before}</strong> at <strong>{nb.time}</strong></div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Head to the Coffee Point — it's where connections happen</div>
          </CardBody>
        </Card>
      )}

      {/* Ice Breaker Deck */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>🃏 Ice Breaker Card</div>
        <Card style={{ borderRadius: 16, border: '2px dashed #6c63ff', background: 'linear-gradient(135deg, #f8f8ff, #fff0f6)', cursor: 'pointer' }} onClick={() => setCurrentIB(i => (i + 1) % ALL_ICEBREAKERS.length)}>
          <CardBody style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#333', lineHeight: 1.4, marginBottom: 12 }}>
              "{ALL_ICEBREAKERS[currentIB]}"
            </div>
            <div style={{ fontSize: 12, color: '#aaa' }}>Tap to get next question · {currentIB + 1}/{ALL_ICEBREAKERS.length}</div>
          </CardBody>
        </Card>

        {/* Show all toggle */}
        <button
          onClick={() => setShowAllIB(v => !v)}
          style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6c63ff', fontWeight: 600, padding: 0 }}
        >
          {showAllIB ? '▴ Hide list' : `▾ Show all ${ALL_ICEBREAKERS.length} questions`}
        </button>

        {showAllIB && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ALL_ICEBREAKERS.slice(0, ibShown).map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#bbb', fontSize: 12, minWidth: 18 }}>{i + 1}.</span>
                  <span style={{ color: '#444' }}>{q}</span>
                </div>
              ))}
            </div>
            {ibShown < ALL_ICEBREAKERS.length && (
              <button
                onClick={() => setIbShown(n => n + IB_PAGE)}
                style={{ width: '100%', marginTop: 8, padding: '9px', borderRadius: 8, border: '1px solid #6c63ff', background: '#f0eeff', color: '#6c63ff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                Show more (+{Math.min(IB_PAGE, ALL_ICEBREAKERS.length - ibShown)}) · {ibShown}/{ALL_ICEBREAKERS.length}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Coffee meetup systems */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>☕ Coffee Meetup</div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666' }}>
          Pick a system — find someone to meet at the Coffee Point this break
        </p>

        {matchedUser && chosenSystem ? (
          <Card style={{ borderRadius: 12, border: '2px solid #4caf50', background: '#f0fff4' }}>
            <CardBody style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#2d6a4f', marginBottom: 10 }}>🎉 We found someone!</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #f06292)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                  {matchedUser.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{matchedUser.name}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>{matchedUser.role}{matchedUser.company ? ` · ${matchedUser.company}` : ''}</div>
                </div>
              </div>
              {commonInterests(matchedUser, MY_INTERESTS).length > 0 && (
                <div style={{ background: '#f0eeff', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 12.5 }}>
                  <strong style={{ color: '#6c63ff' }}>✨ You both like:</strong>{' '}
                  {commonInterests(matchedUser, MY_INTERESTS).map(i => INTEREST_LABELS[i] || i).join(', ')}
                </div>
              )}
              <div style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 13 }}>
                <strong>Where to meet:</strong> ☕ Coffee Point<br />
                <strong>When:</strong> {nb ? `Before ${nb.before} (${nb.time})` : 'Next break'}
              </div>
              <div style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', fontSize: 13 }}>
                <strong>💬 Start with:</strong><br />
                <em style={{ color: '#555' }}>"{ALL_ICEBREAKERS[Math.floor(Math.random() * ALL_ICEBREAKERS.length)]}"</em>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button size="small" themeColor="primary" onClick={() => handleFindMatch(chosenSystem)}>🔄 Match again</Button>
                <Button fillMode="outline" size="small" onClick={() => { setMatchedUser(null); setChosenSystem(null); }}>← Back to activities</Button>
              </div>
            </CardBody>
          </Card>
        ) : chosenSystem && !matchedUser ? (
          <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0', background: '#fafafa' }}>
            <CardBody style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
              <div style={{ fontSize: 14, color: '#666' }}>Finding a match...</div>
            </CardBody>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {MEETUP_SYSTEMS.map(sys => (
              <Card key={sys.id} style={{ borderRadius: 12, border: `1px solid ${sys.color}30`, cursor: 'pointer' }} onClick={() => handleFindMatch(sys.id)}>
                <CardBody style={{ padding: '14px' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{sys.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: sys.color, marginBottom: 4 }}>{sys.name}</div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>{sys.description}</div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Discussion topics moved into Groups (lasting communities) */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🗣 Discussion Topics</div>
        <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
          <CardBody style={{ padding: '14px' }}>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
              Topics now live inside <strong>Groups</strong> — each community lists its example discussions
              (e.g. “React Native vs Flutter”, “LLM products — what actually ships?”) plus a set time, place and Discord.
              Join one to gather around a shared topic.
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
