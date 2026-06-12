import { useState, useMemo } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { MOCK_USERS, ICE_BREAKERS, INTEREST_LABELS, INTENT_LABELS, CURRENT_USER, FACETS, EVENT_NAME } from '../data/mockData';
import { InterestBadge } from '../components/InterestBadge';
import { Avatar } from '../components/Avatar';
import { filterAndSort, commonInterests, commonSkills, affinity, topInterests } from '../lib/peopleLogic';
import type { SortMode, PeopleFilter } from '../lib/peopleLogic';
import { intentSynergies } from '../lib/intentLogic';
import { useT } from '../i18n';
import type { User, Interest } from '../types';

const MY_INTERESTS: Interest[] = ['health', 'mobile', 'startup', 'design'];
const MY_SKILLS = CURRENT_USER.skills || [];
const MY_INTENTS = CURRENT_USER.intents || [];
// Filter chips ordered by how common each interest is in this crowd (most popular first)
const FILTER_INTERESTS: Interest[] = topInterests(MOCK_USERS).map(x => x.interest);

interface Props {
  mySessionIds: Set<string>;
  matchedIds: Set<string>;
  onMatch: (userId: string) => void;
  onOpenProfile: (u: User) => void;
}

export function PeoplePage({ matchedIds, onMatch, onOpenProfile: _onOpenProfile }: Props) {
  const { t } = useT();
  const matched = matchedIds;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingSent, setPendingSent] = useState<Set<string>>(new Set());
  const [matchDialog, setMatchDialog] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PeopleFilter>('all');
  const [sort, setSort] = useState<SortMode>('common');

  function getCommonInterests(user: User): Interest[] {
    return commonInterests(user, MY_INTERESTS);
  }

  function getIceBreakers(user: User): string[] {
    const common = getCommonInterests(user);
    if (common.length === 0) return ['Tell me about your project?'];
    return ICE_BREAKERS[common[0]] || [];
  }

  function handleConnect(user: User) {
    if (matched.has(user.id) || pendingSent.has(user.id)) return;
    setPendingSent(prev => new Set(prev).add(user.id));
    setTimeout(() => {
      onMatch(user.id); // central registry awards points + adds to Connections
      setPendingSent(prev => { const s = new Set(prev); s.delete(user.id); return s; });
      setMatchDialog(user);
    }, 1000);
  }

  const filtered = useMemo(
    () => filterAndSort(MOCK_USERS, { filter, search, sort, myInterests: MY_INTERESTS, mySkills: MY_SKILLS }),
    [search, filter, sort],
  );

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{t.people.title}</h2>
      <p style={{ margin: '0 0 14px', color: '#666', fontSize: 14 }}>
        {EVENT_NAME} · {MOCK_USERS.length} {t.people.subtitle}
      </p>

      {/* Search */}
      <div style={{ marginBottom: 8 }}>
        <Input
          value={search}
          onChange={e => setSearch(e.value as string)}
          placeholder="🔍  Search name, role, company, skill…"
          style={{ width: '100%' }}
        />
      </div>

      {/* Facet dropdowns — pick a specific language / design / sport */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {FACETS.map(facet => (
          <select
            key={facet.key}
            value={facet.options.includes(search) ? search : ''}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 100, padding: '7px 8px', borderRadius: 8, border: '1px solid #ddd',
              fontSize: 12.5, background: '#fff', color: '#555', cursor: 'pointer',
            }}
          >
            <option value="">{facet.label}</option>
            {facet.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {search && (
          <button onClick={() => setSearch('')} style={{ background: '#f0f0f0', border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', fontSize: 12, color: '#888' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Filter chips — ordered by popularity, scrollable on iPhone */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>All</Chip>
        <Chip active={filter === 'match'} onClick={() => setFilter('match')} color="#6c63ff">✨ For me</Chip>
        <Chip active={filter === 'speaker'} onClick={() => setFilter('speaker')} color="#e65100">🎤 Speakers</Chip>
        {FILTER_INTERESTS.map(i => (
          <Chip key={i} active={filter === i} onClick={() => setFilter(i)}>
            {INTEREST_LABELS[i]}
          </Chip>
        ))}
      </div>

      {/* Sort + count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <span style={{ fontSize: 12, color: '#999' }}>Showing {filtered.length} of {MOCK_USERS.length}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>Sort:</span>
          {([
            ['common', '✨ Best match'],
            ['name', 'A–Z'],
          ] as [SortMode, string][]).map(([mode, label]) => (
            <button key={mode} onClick={() => setSort(mode)} style={{
              padding: '3px 8px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap',
              background: sort === mode ? '#6c63ff' : '#f0f0f0', color: sort === mode ? '#fff' : '#666', fontWeight: sort === mode ? 600 : 400,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Compact list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(user => {
          const common = getCommonInterests(user);
          const skillsCommon = commonSkills(user, MY_SKILLS);
          const aff = affinity(user, MY_INTERESTS, MY_SKILLS);
          const isMatched = matched.has(user.id);
          const isPending = pendingSent.has(user.id);
          const isOpen = expanded === user.id;

          return (
            <div
              key={user.id}
              style={{
                border: isMatched ? '1.5px solid #6c63ff' : '1px solid #e8e8e8',
                borderRadius: 12, background: '#fff', overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Compact row */}
              <div
                onClick={() => setExpanded(isOpen ? null : user.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', cursor: 'pointer' }}
              >
                <Avatar name={user.name} color={user.photoColor} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </span>
                    {user.speaker && <span title="Speaker" style={{ fontSize: 12, flexShrink: 0 }}>🎤</span>}
                    {isMatched && <span style={{ fontSize: 13 }}>✅</span>}
                    {aff > 0 && !isMatched && (
                      <span style={{ fontSize: 11, color: '#6c63ff', whiteSpace: 'nowrap' }}>· {aff} common</span>
                    )}
                    {intentSynergies(MY_INTENTS, user.intents).length > 0 && (
                      <span title="Intent match" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>🎯</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.role}{user.company ? ` · ${user.company}` : ''}
                  </div>
                </div>
                {/* mini interest dots */}
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {user.interests.slice(0, 3).map(i => (
                    <span key={i} title={INTEREST_LABELS[i]} style={{ fontSize: 13 }}>
                      {INTEREST_LABELS[i].split(' ')[0]}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#bbb', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f0f0f0' }}>
                  {user.speaker && user.speakerTopic && (
                    <div style={{ margin: '10px 0', padding: '8px 10px', background: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 8, fontSize: 12.5 }}>
                      <strong style={{ color: '#e65100' }}>🎤 Speaking:</strong> {user.speakerTopic}
                    </div>
                  )}
                  <p style={{ margin: '12px 0 10px', fontSize: 13.5, color: '#444', lineHeight: 1.5 }}>{user.bio}</p>

                  <div style={{ marginBottom: 10 }}>
                    {user.interests.map(i => <InterestBadge key={i} interest={i} small />)}
                  </div>

                  {/* Skills, shared ones highlighted */}
                  {user.skills && user.skills.length > 0 && (
                    <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {user.skills.map(s => {
                        const shared = skillsCommon.includes(s);
                        return (
                          <span key={s} style={{
                            fontSize: 11.5, borderRadius: 12, padding: '2px 9px', fontWeight: shared ? 700 : 500,
                            background: shared ? '#e8f5e9' : '#f0f0f0', color: shared ? '#2e7d32' : '#666',
                          }}>{shared ? '✓ ' : ''}{s}</span>
                        );
                      })}
                    </div>
                  )}

                  {/* Intent badges */}
                  {user.intents && user.intents.length > 0 && (
                    <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {user.intents.map(it => (
                        <span key={it} style={{ fontSize: 11.5, background: '#fff3e0', color: '#e65100', borderRadius: 12, padding: '2px 9px', fontWeight: 600 }}>
                          {INTENT_LABELS[it]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Intent synergy callout */}
                  {intentSynergies(MY_INTENTS, user.intents).length > 0 && (
                    <div style={{ background: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#e65100', marginBottom: 4 }}>🎯 Intent match</div>
                      {intentSynergies(MY_INTENTS, user.intents).map((s, i) => (
                        <div key={i} style={{ fontSize: 12.5, color: '#555' }}>• {s.label}</div>
                      ))}
                    </div>
                  )}

                  {common.length > 0 && (
                    <InfoRow icon="✨" label={t.people.commonTopics} color="#6c63ff">
                      {common.map(i => INTEREST_LABELS[i]).join(', ')}
                    </InfoRow>
                  )}
                  {user.hobbies && user.hobbies.length > 0 && (
                    <InfoRow icon="🎯" label="Hobbies">{user.hobbies.join(' · ')}</InfoRow>
                  )}
                  {user.lookingFor && (
                    <InfoRow icon="🔎" label="Looking for" color="#e65100">{user.lookingFor}</InfoRow>
                  )}
                  {user.canHelp && (
                    <InfoRow icon="🤝" label="Can help with" color="#2e7d32">{user.canHelp}</InfoRow>
                  )}

                  <div style={{ background: '#f8f8ff', borderRadius: 10, padding: 10, margin: '10px 0' }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 6 }}>💬 {t.people.icebreakers}</div>
                    {getIceBreakers(user).map((q, i) => (
                      <div key={i} style={{ fontSize: 12.5, color: '#555', marginBottom: 3 }}>• {q}</div>
                    ))}
                  </div>

                  {isMatched && (
                    <div style={{ background: '#f0fff4', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 6 }}>🔗 {t.people.contacts}</div>
                      {Object.entries(user.socials).map(([k, v]) => (
                        <div key={k} style={{ fontSize: 12.5, color: '#555' }}>{k}: {v}</div>
                      ))}
                    </div>
                  )}

                  <Button
                    themeColor={isMatched ? 'success' : 'primary'}
                    fillMode={isMatched ? 'solid' : 'solid'}
                    disabled={isPending || isMatched}
                    onClick={e => { e.stopPropagation(); handleConnect(user); }}
                    style={{ width: '100%', borderRadius: 10 }}
                  >
                    {isMatched ? t.people.matched : isPending ? t.people.pending : t.people.wantToMeet}
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bbb' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div>No one matches "{search}"</div>
          </div>
        )}
      </div>

      {/* Match celebration */}
      {matchDialog && (
        <div
          onClick={() => setMatchDialog(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🤝</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t.people.matchTitle}</div>
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 2px' }}>{matchDialog.name} {t.people.matchSubtitle}</p>
            <p style={{ color: '#666', fontSize: 13, marginTop: 0 }}>{t.people.matchPrompt}</p>

            {getCommonInterests(matchDialog).length > 0 && (
              <div style={{ background: '#f0eeff', borderRadius: 10, padding: 10, margin: '12px 0', textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#6c63ff', marginBottom: 6 }}>✨ {t.people.commonTopics}</div>
                <div>{getCommonInterests(matchDialog).map(i => <InterestBadge key={i} interest={i} small />)}</div>
              </div>
            )}

            <div style={{ background: '#f8f8ff', borderRadius: 10, padding: 12, textAlign: 'left', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 6 }}>💬 {t.people.matchIce}</div>
              <div style={{ fontSize: 13.5, color: '#555', fontStyle: 'italic' }}>"{getIceBreakers(matchDialog)[0]}"</div>
            </div>

            <Button themeColor="primary" onClick={() => setMatchDialog(null)} style={{ width: '100%', borderRadius: 10 }}>
              {t.people.great}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, color = '#333', children }: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, whiteSpace: 'nowrap', flexShrink: 0,
      background: active ? (color === '#333' ? '#333' : color) : '#f0f0f0',
      color: active ? '#fff' : '#555', fontWeight: active ? 600 : 400,
    }}>
      {children}
    </button>
  );
}

function InfoRow({ icon, label, color = '#555', children }: { icon: string; label: string; color?: string; children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, marginBottom: 7, lineHeight: 1.4 }}>
      <span style={{ fontWeight: 600, color }}>{icon} {label}:</span>{' '}
      <span style={{ color: '#444' }}>{children}</span>
    </div>
  );
}
