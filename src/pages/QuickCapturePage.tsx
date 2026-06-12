import { useState } from 'react';
import { Button } from '../ui';
import { Input, TextArea } from '../ui';
import { Card, CardBody } from '../ui';
import type { Contact, Task, User } from '../types';
import { buildTaskFromCapture, followUpDate, canSaveCapture } from '../lib/captureLogic';
import { findUsers, userCode } from '../data/mockData';
import { Avatar } from '../components/Avatar';
import { useT } from '../i18n';

const TAG_OPTIONS = [
  { value: 'networking', label: '🤝 Networking' },
  { value: 'client', label: '💼 Client' },
  { value: 'collab', label: '🚀 Collab' },
  { value: 'other', label: '📌 Other' },
];

const FOLLOWUP_OPTIONS = [0, 1, 2, 3, 7, 14];

interface Props {
  onAddTask: (task: Task) => void;
}

export function QuickCapturePage({ onAddTask }: Props) {
  const { t } = useT();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({
    name: '', context: '', talkedAbout: '', nextStep: '',
    followUpDays: 3, tag: 'networking' as Contact['tag'],
    customTagLabel: '', linkedUserId: undefined as string | undefined,
  });
  const [saved, setSaved] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');

  function linkAttendee(u: User) {
    setForm(f => ({
      ...f,
      name: u.name,
      context: f.context || u.role || '',
      linkedUserId: u.id,
    }));
    setPickerOpen(false);
    setPickerQuery('');
  }

  function unlinkAttendee() {
    setForm(f => ({ ...f, linkedUserId: undefined }));
  }

  const getFollowUpDate = (days: number): Date => followUpDate(days);

  function formatDate(d: Date): string {
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function handleSave() {
    if (!canSaveCapture(form)) return;

    const contact: Contact = {
      id: Date.now().toString(),
      name: form.name,
      context: form.context,
      talkedAbout: form.talkedAbout,
      nextStep: form.nextStep,
      followUpDays: form.followUpDays,
      tag: form.tag,
      createdAt: new Date(),
    };
    setContacts(prev => [contact, ...prev]);

    // Always create a task (defaults to a follow-up reminder if no explicit step).
    onAddTask(buildTaskFromCapture(form));

    setSaved(contact.id);
    setForm({ name: '', context: '', talkedAbout: '', nextStep: '', followUpDays: 3, tag: 'networking', customTagLabel: '', linkedUserId: undefined });
    setTimeout(() => setSaved(null), 3000);
  }

  const tagLabels: Record<string, string> = {
    networking: t.capture.tags.networking,
    client: t.capture.tags.client,
    collab: t.capture.tags.collab,
    other: t.capture.tags.other,
  };

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{t.capture.title}</h2>
      <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>{t.capture.subtitle}</p>

      <Card style={{ borderRadius: 12, marginBottom: 24, border: '1px solid #e0e0e0' }}>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Attendee picker — link this note to a real person */}
            <div>
              <label style={labelStyle}>Who did you meet?</label>
              {form.linkedUserId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0eeff', borderRadius: 10, padding: '8px 10px' }}>
                  {(() => { const u = findUsers('').find(x => x.id === form.linkedUserId); return u ? <Avatar name={u.name} color={u.photoColor} size={32} /> : null; })()}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{form.name}</div>
                    <div style={{ fontSize: 11, color: '#6c63ff' }}>🔗 Linked · {userCode(form.linkedUserId)}</div>
                  </div>
                  <button onClick={unlinkAttendee} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 14 }}>✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setPickerOpen(o => !o)}
                  style={{ width: '100%', textAlign: 'left', background: '#f7f7fa', border: '1px dashed #ccc', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', fontSize: 13, color: '#666' }}
                >
                  🔗 Link an attendee from the list (or by code) — optional
                </button>
              )}

              {pickerOpen && !form.linkedUserId && (
                <div style={{ border: '1px solid #e0e0e0', borderRadius: 10, marginTop: 6, overflow: 'hidden' }}>
                  <Input
                    value={pickerQuery}
                    onChange={e => setPickerQuery(e.value as string)}
                    placeholder="Search name, role or code (EM-007)…"
                    style={{ width: '100%', border: 'none', borderBottom: '1px solid #eee' }}
                  />
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {findUsers(pickerQuery).slice(0, 20).map(u => (
                      <div
                        key={u.id}
                        onClick={() => linkAttendee(u)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', cursor: 'pointer', borderTop: '1px solid #f5f5f5' }}
                      >
                        <Avatar name={u.name} color={u.photoColor} size={30} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: '#999' }}>{u.role} · {userCode(u.id)}</div>
                        </div>
                      </div>
                    ))}
                    {findUsers(pickerQuery).length === 0 && (
                      <div style={{ padding: '12px', fontSize: 12, color: '#aaa', textAlign: 'center' }}>No attendee found — just type the name below</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>{t.capture.name}</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.value as string, linkedUserId: f.linkedUserId && e.value !== f.name ? undefined : f.linkedUserId }))}
                placeholder="Alex"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={labelStyle}>{t.capture.context} {!form.context.trim() && <EmptyHint />}</label>
              <Input value={form.context} onChange={e => setForm(f => ({ ...f, context: e.value as string }))} placeholder="Founder AI startup" style={{ width: '100%' }} />
            </div>

            <div>
              <label style={labelStyle}>{t.capture.talked} {!form.talkedAbout.trim() && <EmptyHint />}</label>
              <TextArea value={form.talkedAbout} onChange={e => setForm(f => ({ ...f, talkedAbout: e.value as string }))} placeholder="Looking for UX help for mobile app" rows={2} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={labelStyle}>{t.capture.nextStep} {!form.nextStep.trim() && <EmptyHint warn />}</label>
              <Input value={form.nextStep} onChange={e => setForm(f => ({ ...f, nextStep: e.value as string }))} placeholder="Send portfolio" style={{ width: '100%', ...(form.nextStep.trim() ? {} : { borderColor: '#ffc107' }) }} />
              {!form.nextStep.trim() && (
                <div style={{ marginTop: 4, fontSize: 11.5, color: '#b8860b' }}>
                  ⚠ Empty — task will default to "Follow up with {form.name || '…'}"
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>{t.capture.followUp}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FOLLOWUP_OPTIONS.map(days => (
                  <button key={days} onClick={() => setForm(f => ({ ...f, followUpDays: days }))} style={chipStyle(form.followUpDays === days, '#6c63ff')}>
                    {days === 0 ? 'Today' : days === 1 ? t.capture.tomorrow : `${days} ${t.capture.days}`}
                  </button>
                ))}
              </div>
              {form.nextStep && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#6c63ff' }}>
                  → Task on {formatDate(getFollowUpDate(form.followUpDays))}
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>{t.capture.tag}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {TAG_OPTIONS.map(tag => (
                  <button key={tag.value} onClick={() => setForm(f => ({ ...f, tag: tag.value as Contact['tag'] }))} style={chipStyle(form.tag === tag.value, '#f06292')}>
                    {tagLabels[tag.value] || tag.label}
                  </button>
                ))}
              </div>
              {form.tag === 'other' && (
                <Input
                  value={form.customTagLabel}
                  onChange={e => setForm(f => ({ ...f, customTagLabel: e.value as string }))}
                  placeholder="e.g. Investor, Speaker, Press..."
                  style={{ width: '100%', marginTop: 8 }}
                />
              )}
            </div>

            <Button themeColor="primary" size="large" onClick={handleSave} disabled={!form.name.trim()} style={{ borderRadius: 10 }}>
              {t.capture.save}
            </Button>
          </div>
        </CardBody>
      </Card>

      {saved && (
        <div style={{ background: '#f0fff4', border: '1px solid #c3e6cb', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#2d6a4f', fontSize: 14 }}>
          ✅ {t.capture.saved}
          {form.nextStep === '' && contacts[0]?.nextStep && ' Task created in Tasks tab →'}
        </div>
      )}

      {contacts.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, margin: '0 0 12px' }}>{t.capture.contacts}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contacts.map(c => (
              <Card key={c.id} style={{ borderRadius: 10, border: '1px solid #e0e0e0' }}>
                <CardBody>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                      {c.context && <div style={{ color: '#666', fontSize: 13 }}>{c.context}</div>}
                      {c.talkedAbout && <div style={{ color: '#555', fontSize: 13, marginTop: 4 }}>{c.talkedAbout}</div>}
                      {c.nextStep && (
                        <div style={{ marginTop: 8, background: '#f8f8ff', borderRadius: 6, padding: '6px 10px', fontSize: 13 }}>
                          📋 <strong>{c.nextStep}</strong> · {formatDate(getFollowUpDate(c.followUpDays))}
                        </div>
                      )}
                    </div>
                    <span style={{ background: '#f0f0f0', borderRadius: 12, padding: '2px 10px', fontSize: 12, color: '#555', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {tagLabels[c.tag]}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, color: '#666', display: 'block', marginBottom: 4 };

/** Small inline badge marking a not-yet-filled field. `warn` = amber (matters for the task). */
function EmptyHint({ warn }: { warn?: boolean }) {
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 600, borderRadius: 5, padding: '0 5px', marginLeft: 4,
      background: warn ? '#fff3cd' : '#f0f0f0', color: warn ? '#b8860b' : '#aaa',
    }}>
      {warn ? '⚠ empty' : 'empty'}
    </span>
  );
}

function chipStyle(active: boolean, color: string): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
    background: active ? color : '#f0f0f0', color: active ? '#fff' : '#333', fontWeight: active ? 600 : 400,
  };
}
