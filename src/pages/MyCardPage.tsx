import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardBody } from '../ui';
import { Button } from '../ui';
import { Input, TextArea } from '../ui';
import { InterestBadge } from '../components/InterestBadge';
import { INTEREST_LABELS, INTENT_LABELS } from '../data/mockData';
import { useGamification } from '../lib/gamification';
import { ACHIEVEMENTS } from '../lib/gamificationLogic';
import { clearAll, getOrCreateUid } from '../lib/storage';
import {
  CONTACT_FIELDS, loadProfile, saveProfile,
  type StoredProfile, type ContactField,
} from '../lib/profile';
import { useT } from '../i18n';
import { FACETS } from '../data/mockData';
import type { Interest, Intent } from '../types';

const ALL_INTERESTS: Interest[] = ['sport', 'design', 'startup', 'travel', 'health', 'ai', 'networking', 'business', 'programming', 'frontend', 'backend', 'mobile', 'data', 'gamedev'];
const ALL_INTENTS: Intent[] = ['hiring', 'job', 'cofounder', 'clients', 'invest', 'mentor', 'learning'];

const MAX_INTERESTS = 10;

interface Props {
  mySessionIds: Set<string>;
  onProfileSaved?: (p: StoredProfile) => void;
}

export function MyCardPage({ mySessionIds, onProfileSaved }: Props) {
  const { t } = useT();
  const game = useGamification();
  // Load a saved profile from localStorage so a returning visitor keeps their card.
  const [uid] = useState(() => getOrCreateUid());
  const [profile, setProfile] = useState<StoredProfile>(() => loadProfile());
  const [draft, setDraft] = useState<StoredProfile>(profile);
  const [editing, setEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const f = t.mycard.fields;

  function handleSave() {
    setProfile(draft);
    saveProfile(draft); // persist locally
    onProfileSaved?.(draft); // publish to the backend (no-op when cloud sync is off)
    setEditing(false);
    game.award('profile_completed', true); // once-only
  }

  function toggleShowOnMatch(field: ContactField) {
    setDraft(d => ({
      ...d,
      showOnMatch: d.showOnMatch.includes(field)
        ? d.showOnMatch.filter(x => x !== field)
        : [...d.showOnMatch, field],
    }));
  }

  // Shareable link: the card (incl. only the contacts you chose to reveal) is base64-encoded
  // into the URL — no backend needed. Opening it on another device shows this card + Connect.
  function shareLink(): string {
    try {
      const contacts: Record<string, string> = {};
      if (profile.showOnMatch.includes('telegram') && profile.telegram) contacts.twitter = profile.telegram;
      if (profile.showOnMatch.includes('instagram') && profile.instagram) contacts.instagram = profile.instagram;
      if (profile.showOnMatch.includes('linkedin') && profile.linkedin) contacts.linkedin = profile.linkedin;
      if (profile.showOnMatch.includes('whatsapp') && profile.whatsapp) contacts.whatsapp = profile.whatsapp;
      if (profile.showOnMatch.includes('other') && profile.otherContact) contacts[profile.otherLabel || 'other'] = profile.otherContact;
      const payload = {
        uid,
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        role: profile.role,
        company: profile.company,
        bio: profile.bio,
        interests: profile.interests,
        skills: profile.skills,
        contacts,
      };
      const data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      return `${location.origin}${location.pathname}#card=${data}`;
    } catch {
      return location.href;
    }
  }

  function copyShareLink() {
    navigator.clipboard?.writeText(shareLink()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function deleteAllData() {
    if (!confirm('Delete all your data (profile, points, tasks)? This cannot be undone.')) return;
    clearAll();
    location.reload();
  }

  function toggleQR() {
    setShowQR(v => {
      if (!v) game.award('qr_shown', true);
      return !v;
    });
  }

  function toggleIntent(intent: Intent) {
    setDraft(d => ({
      ...d,
      intents: d.intents.includes(intent)
        ? d.intents.filter(i => i !== intent)
        : [...d.intents, intent],
    }));
  }

  function toggleSkill(skill: string) {
    setDraft(d => ({
      ...d,
      skills: d.skills.includes(skill) ? d.skills.filter(s => s !== skill) : [...d.skills, skill],
    }));
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setDraft(d => ({ ...d, photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function toggleInterest(interest: Interest) {
    setDraft(d => {
      const has = d.interests.includes(interest);
      if (!has && d.interests.length >= MAX_INTERESTS) return d; // cap at 10
      return {
        ...d,
        interests: has ? d.interests.filter(i => i !== interest) : [...d.interests, interest],
      };
    });
  }

  // QR encodes the shareable link so scanning opens this person's card directly.
  const qrContent = shareLink();

  if (editing) {
    return (
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{t.mycard.edit}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button fillMode="outline" onClick={() => { setDraft(profile); setEditing(false); }}>{t.mycard.cancel}</Button>
            <Button themeColor="primary" onClick={handleSave}>{t.mycard.save}</Button>
          </div>
        </div>

        <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0', marginBottom: 16 }}>
          <CardBody>
            {/* Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                background: draft.photo ? 'transparent' : 'linear-gradient(135deg, #6c63ff, #f06292)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }} onClick={() => fileRef.current?.click()}>
                {draft.photo
                  ? <img src={draft.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="profile" />
                  : <span style={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>{draft.firstName[0] || '?'}</span>
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                <Button size="small" fillMode="outline" onClick={() => fileRef.current?.click()}>{f.uploadPhoto}</Button>
                {draft.photo && <Button size="small" fillMode="flat" themeColor="error" onClick={() => setDraft(d => ({ ...d, photo: null }))}>{f.removePhoto}</Button>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={f.firstName} value={draft.firstName} onChange={v => setDraft(d => ({ ...d, firstName: v }))} />
              <Field label={f.lastName} value={draft.lastName} onChange={v => setDraft(d => ({ ...d, lastName: v }))} />
            </div>

            <div style={{ marginTop: 12 }}>
              <Field label="Role / Title" value={draft.role} onChange={v => setDraft(d => ({ ...d, role: v }))} placeholder="iOS Developer" />
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>{f.bio}</label>
              <TextArea value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.value as string }))} rows={2} style={{ width: '100%' }} />
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={f.company} value={draft.company} onChange={v => setDraft(d => ({ ...d, company: v }))} />
              <Field label={f.city} value={draft.city} onChange={v => setDraft(d => ({ ...d, city: v }))} />
              <Field label={f.country} value={draft.country} onChange={v => setDraft(d => ({ ...d, country: v }))} />
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0', marginBottom: 16 }}>
          <CardBody>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>🎯 Networking</div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>🎯 Hobbies (comma separated)</label>
              <Input value={draft.hobbies} onChange={e => setDraft(d => ({ ...d, hobbies: e.value as string }))} placeholder="Running, Photography, Chess" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>🔎 What I'm looking for</label>
              <TextArea value={draft.lookingFor} onChange={e => setDraft(d => ({ ...d, lookingFor: e.value as string }))} rows={2} placeholder="A backend dev to pair with…" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={labelStyle}>🤝 How I can help others</label>
              <TextArea value={draft.canHelp} onChange={e => setDraft(d => ({ ...d, canHelp: e.value as string }))} rows={2} placeholder="iOS, App Store, design feedback…" style={{ width: '100%' }} />
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0', marginBottom: 16 }}>
          <CardBody>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>🔗 Contacts</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={f.telegram} value={draft.telegram} onChange={v => setDraft(d => ({ ...d, telegram: v }))} placeholder="@username" />
              <Field label={f.instagram} value={draft.instagram} onChange={v => setDraft(d => ({ ...d, instagram: v }))} placeholder="@handle" />
              <Field label={f.linkedin} value={draft.linkedin} onChange={v => setDraft(d => ({ ...d, linkedin: v }))} placeholder="username" />
              <Field label={f.whatsapp} value={draft.whatsapp} onChange={v => setDraft(d => ({ ...d, whatsapp: v }))} placeholder="+31..." />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>{f.other}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                <Input value={draft.otherLabel} onChange={e => setDraft(d => ({ ...d, otherLabel: e.value as string }))} placeholder="e.g. Twitter" style={{ width: '100%' }} />
                <Input value={draft.otherContact} onChange={e => setDraft(d => ({ ...d, otherContact: e.value as string }))} placeholder="@handle or link" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Which contacts to reveal on match */}
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>👁 Show these when you match (others see only the checked ones)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CONTACT_FIELDS.map(field => {
                  const on = draft.showOnMatch.includes(field);
                  const label = field === 'other' ? (draft.otherLabel || 'Other') : field;
                  return (
                    <button
                      key={field}
                      onClick={() => toggleShowOnMatch(field)}
                      style={{
                        padding: '5px 11px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5, textTransform: 'capitalize',
                        background: on ? '#2e7d32' : '#f0f0f0', color: on ? '#fff' : '#888', fontWeight: on ? 600 : 400,
                      }}
                    >
                      {on ? '✓ ' : ''}{label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
          <CardBody>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{f.interests}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_INTERESTS.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
                    background: draft.interests.includes(interest) ? '#6c63ff' : '#f0f0f0',
                    color: draft.interests.includes(interest) ? '#fff' : '#333',
                    fontWeight: draft.interests.includes(interest) ? 600 : 400,
                  }}
                >
                  {(INTEREST_LABELS as Record<string, string>)[interest]}
                </button>
              ))}
            </div>

            <div style={{ fontWeight: 600, fontSize: 14, margin: '16px 0 4px' }}>🎯 Why are you here?</div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>Drives complementary matches (e.g. hiring ↔ open to work)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_INTENTS.map(intent => (
                <button
                  key={intent}
                  onClick={() => toggleIntent(intent)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
                    background: draft.intents.includes(intent) ? '#e65100' : '#f0f0f0',
                    color: draft.intents.includes(intent) ? '#fff' : '#333',
                    fontWeight: draft.intents.includes(intent) ? 600 : 400,
                  }}
                >
                  {INTENT_LABELS[intent]}
                </button>
              ))}
            </div>

            {/* Skills — exact languages / design / sport, multi-select; feeds matching */}
            <div style={{ fontWeight: 600, fontSize: 14, margin: '16px 0 4px' }}>🧩 Skills</div>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>Pick specifics — these also drive who you match with.</div>
            {FACETS.map(facet => (
              <div key={facet.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#777', marginBottom: 5 }}>{facet.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {facet.options.map(opt => {
                    const on = draft.skills.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleSkill(opt)}
                        style={{
                          padding: '5px 11px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12.5,
                          background: on ? '#2e7d32' : '#f0f0f0', color: on ? '#fff' : '#555', fontWeight: on ? 600 : 400,
                        }}
                      >{on ? '✓ ' : ''}{opt}</button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Speaker */}
            <div style={{ fontWeight: 600, fontSize: 14, margin: '16px 0 8px' }}>🎤 Speaker</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={draft.speaker}
                onChange={e => setDraft(d => ({ ...d, speaker: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13.5 }}>I'm a speaker at this event</span>
            </label>
            {draft.speaker && (
              <Field label="Your talk title" value={draft.speakerTopic} onChange={v => setDraft(d => ({ ...d, speakerTopic: v }))} placeholder="e.g. Designing for focus" />
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{t.mycard.title}</h2>
      <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>{t.mycard.subtitle}</p>

      <Card style={{ borderRadius: 16, border: '2px solid #6c63ff', marginBottom: 16 }}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
              background: profile.photo ? 'transparent' : 'linear-gradient(135deg, #6c63ff, #f06292)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {profile.photo
                ? <img src={profile.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="profile" />
                : <span style={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>{profile.firstName[0]}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {profile.firstName} {profile.lastName}
                {profile.speaker && <span style={{ fontSize: 11, background: '#fff3e0', color: '#e65100', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>🎤 Speaker</span>}
              </div>
              {profile.role && <div style={{ color: '#6c63ff', fontSize: 13, fontWeight: 600 }}>{profile.role}</div>}
              {profile.company && <div style={{ color: '#666', fontSize: 13 }}>🏢 {profile.company}</div>}
              {profile.city && <div style={{ color: '#666', fontSize: 13 }}>📍 {profile.city}, {profile.country}</div>}
            </div>
          </div>

          {profile.speaker && profile.speakerTopic && (
            <div style={{ margin: '0 0 12px', padding: '8px 10px', background: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 8, fontSize: 13 }}>
              <strong style={{ color: '#e65100' }}>🎤 Speaking:</strong> {profile.speakerTopic}
            </div>
          )}

          {profile.bio && <p style={{ margin: '0 0 12px', color: '#444', fontSize: 14 }}>{profile.bio}</p>}

          <div style={{ marginBottom: 10 }}>
            {profile.interests.map(i => <InterestBadge key={i} interest={i} />)}
          </div>

          {profile.skills.length > 0 && (
            <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {profile.skills.map(s => (
                <span key={s} style={{ fontSize: 11.5, background: '#e8f5e9', color: '#2e7d32', borderRadius: 12, padding: '2px 9px', fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          )}

          {profile.intents.length > 0 && (
            <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {profile.intents.map(it => (
                <span key={it} style={{ fontSize: 12, background: '#fff3e0', color: '#e65100', borderRadius: 12, padding: '3px 10px', fontWeight: 600 }}>
                  {INTENT_LABELS[it]}
                </span>
              ))}
            </div>
          )}

          {(profile.hobbies || profile.lookingFor || profile.canHelp) && (
            <div style={{ background: '#fafaff', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              {profile.hobbies && <div style={{ fontSize: 13, marginBottom: 6 }}><strong>🎯 Hobbies:</strong> {profile.hobbies}</div>}
              {profile.lookingFor && <div style={{ fontSize: 13, marginBottom: 6 }}><strong style={{ color: '#e65100' }}>🔎 Looking for:</strong> {profile.lookingFor}</div>}
              {profile.canHelp && <div style={{ fontSize: 13 }}><strong style={{ color: '#2e7d32' }}>🤝 Can help with:</strong> {profile.canHelp}</div>}
            </div>
          )}

          <div style={{ background: '#f8f8ff', borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🔗 Contacts</div>
            {[
              { label: 'Telegram', value: profile.telegram },
              { label: 'Instagram', value: profile.instagram },
              { label: 'LinkedIn', value: profile.linkedin },
              { label: 'WhatsApp', value: profile.whatsapp },
              { label: profile.otherLabel || 'Other', value: profile.otherContact },
            ].filter(c => c.value).map(c => (
              <div key={c.label} style={{ fontSize: 14, marginBottom: 3 }}>
                <span style={{ color: '#999' }}>{c.label}:</span> <strong>{c.value}</strong>
              </div>
            ))}
          </div>

          {mySessionIds.size > 0 && (
            <div style={{ background: '#f0fff4', borderRadius: 10, padding: 10, marginTop: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#2d6a4f', marginBottom: 4 }}>📅 {f.sessions}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{mySessionIds.size} sessions selected</div>
            </div>
          )}
        </CardBody>
      </Card>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Button themeColor="primary" fillMode="outline" style={{ flex: 1, borderRadius: 10 }} onClick={() => { setDraft(profile); setEditing(true); }}>
          ✏️ {t.mycard.edit}
        </Button>
        <Button themeColor="primary" style={{ flex: 1, borderRadius: 10 }} onClick={toggleQR}>
          {showQR ? t.mycard.hideQR : t.mycard.showQR}
        </Button>
      </div>

      {showQR && (
        <Card style={{ borderRadius: 16, border: '1px solid #e0e0e0', textAlign: 'center', marginBottom: 16 }}>
          <CardBody>
            <p style={{ margin: '0 0 16px', color: '#555', fontSize: 14 }}>{t.mycard.qrHint}</p>
            <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <QRCodeSVG value={qrContent} size={200} fgColor="#6c63ff" level="M" />
            </div>
            <p style={{ margin: '16px 0 8px', color: '#999', fontSize: 12 }}>{t.mycard.qrNote}</p>
            <Button fillMode="outline" size="small" onClick={copyShareLink}>
              {copied ? '✓ Copied!' : '🔗 Copy share link'}
            </Button>
            <p style={{ margin: '8px 0 0', color: '#bbb', fontSize: 11 }}>Paste into LinkedIn / WhatsApp to share your card</p>
          </CardBody>
        </Card>
      )}

      {/* Rewards / gamification */}
      <Card style={{ borderRadius: 16, border: '1px solid #e0e0e0', marginBottom: 16, background: 'linear-gradient(135deg, #f8f7ff, #fff0f6)' }}>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>🏆 ⭐ {game.points} points · Level {game.level}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{game.unlocked.length}/{ACHIEVEMENTS.length} badges unlocked</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Privacy / data */}
      <Card style={{ borderRadius: 14, border: '1px solid #f0d0d0' }}>
        <CardBody>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
            Your profile is saved on this device only (no server). Your ID: <strong>{uid}</strong>
          </div>
          <Button fillMode="outline" themeColor="error" size="small" onClick={deleteAllData}>
            🗑 Delete all my data
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <Input value={value} onChange={e => onChange(e.value as string)} placeholder={placeholder} style={{ width: '100%' }} />
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 12, color: '#666', display: 'block', marginBottom: 4 };
