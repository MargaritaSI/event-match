import { useState } from 'react';
import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { Dialog } from '@progress/kendo-react-dialogs';
import { getUserById, userCode } from '../data/mockData';
import { UserProfileDialog } from '../components/UserProfileDialog';
import { Avatar } from '../components/Avatar';
import type { Task, User } from '../types';

interface Props {
  tasks: Task[];
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  userEmail: string;
  setUserEmail: (e: string) => void;
}

const TAG_COLORS: Record<string, string> = {
  networking: '#e3f2fd',
  client: '#fff3e0',
  collab: '#f3e5f5',
  other: '#f5f5f5',
};

const TAG_TEXT: Record<string, string> = {
  networking: '#1565c0',
  client: '#e65100',
  collab: '#6a1b9a',
  other: '#555',
};

const TAG_LABELS: Record<string, string> = {
  networking: '🤝 Networking',
  client: '💼 Client',
  collab: '🚀 Collab',
  other: '📌 Other',
};

function getDayLabel(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function isOverdue(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/** mailto: link that drafts a reminder email for a task, with a deep link back to it. */
export function emailReminderHref(task: Task, email: string): string {
  const link = `${location.origin}/#/task/${task.id}`;
  const subject = `Reminder: ${task.title}`;
  const body = [
    `Reminder for your EventMatch task:`,
    ``,
    `• ${task.title}`,
    `• Contact: ${task.contactName}`,
    `• Due: ${task.dueDate.toDateString()}`,
    task.notes ? `• Notes: ${task.notes}` : '',
    ``,
    `Open the task: ${link}`,
  ].filter(Boolean).join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function exportToICS(tasks: Task[]): void {
  const pending = tasks.filter(t => !t.done);
  if (pending.length === 0) return;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventMatch//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  pending.forEach(t => {
    const d = t.dueDate;
    const dtStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${t.id}@eventmatch`,
      `DTSTART;VALUE=DATE:${dtStr}`,
      `DTEND;VALUE=DATE:${dtStr}`,
      `SUMMARY:${t.title}`,
      t.notes ? `DESCRIPTION:${t.notes}` : '',
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.filter(Boolean).join('\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'eventmatch-tasks.ics';
  a.click();
  URL.revokeObjectURL(url);
}

// Group tasks by due date
function groupByDate(tasks: Task[]): { label: string; tasks: Task[] }[] {
  const map = new Map<string, Task[]>();
  tasks.forEach(t => {
    const key = t.dueDate.toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([, tasks]) => ({ label: getDayLabel(tasks[0].dueDate), tasks }));
}

export function TasksPage({ tasks, onToggleDone, onDelete, userEmail, setUserEmail }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);

  const filtered = tasks.filter(t =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );
  const grouped = groupByDate(filtered);

  const pending = tasks.filter(t => !t.done).length;

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Tasks</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setView(v => v === 'list' ? 'calendar' : 'list')}
            title={view === 'list' ? 'Switch to date-grouped calendar view' : 'Switch to flat list view'}
            style={{ background: '#f0f0f0', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}
          >
            {view === 'list' ? '📅 Calendar view' : '📋 List view'}
          </button>
          {pending > 0 && (
            <button
              onClick={() => exportToICS(tasks)}
              title="Export to Apple Calendar / Google Calendar"
              style={{ background: '#f0eeff', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 13, color: '#6c63ff', fontWeight: 600 }}
            >
              ↓ .ics
            </button>
          )}
        </div>
      </div>
      <p style={{ margin: '0 0 16px', color: '#888', fontSize: 13 }}>
        {pending > 0 ? `${pending} pending` : 'All done! 🎉'}
        {' · '}
        <span style={{ fontSize: 11, color: '#aaa' }}>Export .ics to add to Apple / Google Calendar</span>
      </p>

      {/* Email reminders setup */}
      <Card style={{ borderRadius: 10, border: '1px solid #e0e0e0', marginBottom: 16 }}>
        <CardBody style={{ padding: '10px 12px' }}>
          <button onClick={() => setEmailOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6c63ff', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            📧 Email reminders {userEmail ? `· ${userEmail}` : ''} <span style={{ fontSize: 10 }}>{emailOpen ? '▴' : '▾'}</span>
          </button>
          {emailOpen && (
            <div style={{ marginTop: 8 }}>
              <Input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.value as string)}
                placeholder="you@email.com"
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: 11, color: '#999', marginTop: 6, lineHeight: 1.4 }}>
                Set your email, then tap <strong>📧 Email me</strong> on any task to get a reminder with a link back to it.
                <br />For automatic delivery on the due date, connect a backend (this prototype drafts the email in your mail app).
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['pending', 'all', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={tabStyle(filter === f)}>
            {f === 'pending' ? `⏳ Pending (${tasks.filter(t=>!t.done).length})` : f === 'done' ? `✅ Done (${tasks.filter(t=>t.done).length})` : 'All'}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#bbb' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 15 }}>No tasks yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Save a contact in Quick Capture to create tasks</div>
        </div>
      ) : view === 'calendar' ? (
        <CalendarView grouped={grouped} onToggleDone={onToggleDone} onDelete={onDelete} onOpenDetail={setDetailTask} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {grouped.map(group => (
            <div key={group.label}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 8, paddingLeft: 2 }}>{group.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.tasks.map(task => (
                  <TaskCard key={task.id} task={task} onToggleDone={onToggleDone} onDelete={onDelete} onOpenDetail={setDetailTask} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task detail dialog */}
      {detailTask && (
        <TaskDetailDialog
          task={detailTask}
          userEmail={userEmail}
          onClose={() => setDetailTask(null)}
          onViewProfile={u => { setDetailTask(null); setProfileUser(u); }}
          onToggleDone={onToggleDone}
        />
      )}

      {profileUser && <UserProfileDialog user={profileUser} onClose={() => setProfileUser(null)} />}
    </div>
  );
}

function TaskDetailDialog({ task, userEmail, onClose, onViewProfile, onToggleDone }: {
  task: Task; userEmail: string; onClose: () => void; onViewProfile: (u: User) => void; onToggleDone: (id: string) => void;
}) {
  const linkedUser = getUserById(task.linkedUserId);
  return (
    <Dialog title="Task" onClose={onClose} width={360}>
      <div style={{ padding: '4px 0' }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 11, borderRadius: 6, padding: '2px 9px', background: TAG_COLORS[task.tag], color: TAG_TEXT[task.tag], fontWeight: 600 }}>{TAG_LABELS[task.tag]}</span>
          <span style={{ fontSize: 11, borderRadius: 6, padding: '2px 9px', background: '#f0f0f0', color: '#666' }}>📅 {getDayLabel(task.dueDate)} · {task.dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>

        <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}><strong>Contact:</strong> {task.contactName}</div>
        {task.notes && <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}><strong>Notes:</strong> {task.notes}</div>}

        {/* Linked attendee card */}
        {linkedUser && (
          <div style={{ background: '#f8f8ff', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Avatar name={linkedUser.name} color={linkedUser.photoColor} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{linkedUser.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{linkedUser.role}{linkedUser.company ? ` · ${linkedUser.company}` : ''} · {userCode(linkedUser.id)}</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: '#555' }}>
              {Object.entries(linkedUser.socials).map(([k, v]) => <span key={k} style={{ marginRight: 10 }}>{k}: <strong>{v}</strong></span>)}
            </div>
            <Button size="small" fillMode="outline" themeColor="primary" style={{ marginTop: 8 }} onClick={() => onViewProfile(linkedUser)}>
              👤 View full profile
            </Button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => { onToggleDone(task.id); onClose(); }}>
            {task.done ? '↩ Mark undone' : '✓ Mark done'}
          </Button>
          {userEmail ? (
            <a href={emailReminderHref(task, userEmail)} style={{ textDecoration: 'none' }}>
              <Button size="small" themeColor="primary">📧 Email me this</Button>
            </a>
          ) : (
            <span style={{ fontSize: 11, color: '#aaa', alignSelf: 'center' }}>Set email above to enable 📧</span>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function TaskCard({ task, onToggleDone, onDelete, onOpenDetail }: { task: Task; onToggleDone: (id: string) => void; onDelete: (id: string) => void; onOpenDetail: (t: Task) => void }) {
  const overdue = !task.done && isOverdue(task.dueDate);
  const linkedUser = getUserById(task.linkedUserId);
  return (
    <Card style={{
      borderRadius: 10,
      border: overdue ? '1px solid #ffcdd2' : task.done ? '1px solid #e8f5e9' : '1px solid #e0e0e0',
      background: task.done ? '#fafafa' : overdue ? '#fff5f5' : '#fff',
      opacity: task.done ? 0.7 : 1,
    }}>
      <CardBody style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <button
            onClick={() => onToggleDone(task.id)}
            style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1, cursor: 'pointer',
              border: task.done ? 'none' : '2px solid #ccc', background: task.done ? '#4caf50' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13,
            }}
          >{task.done ? '✓' : ''}</button>
          <div onClick={() => onOpenDetail(task)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
            <div style={{ fontWeight: 600, fontSize: 14, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#aaa' : '#222' }}>
              {task.title}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{task.contactName}</div>
            {task.notes && <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>{task.notes}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, borderRadius: 6, padding: '1px 8px',
                background: TAG_COLORS[task.tag], color: TAG_TEXT[task.tag], fontWeight: 600,
              }}>{TAG_LABELS[task.tag]}</span>
              {linkedUser && (
                <span style={{ fontSize: 11, borderRadius: 6, padding: '1px 8px', background: '#ede7f6', color: '#6c63ff', fontWeight: 600 }}>
                  👤 {linkedUser.name.split(' ')[0]}
                </span>
              )}
              {overdue && <span style={{ fontSize: 11, color: '#e53935', fontWeight: 600 }}>⚠ Overdue</span>}
              <span style={{ fontSize: 11, color: '#bbb' }}>· tap for details ›</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(task.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16, padding: '0 2px', flexShrink: 0 }}
          >✕</button>
        </div>
      </CardBody>
    </Card>
  );
}

function CalendarView({ grouped, onToggleDone, onDelete, onOpenDetail }: { grouped: { label: string; tasks: Task[] }[]; onToggleDone: (id: string) => void; onDelete: (id: string) => void; onOpenDetail: (t: Task) => void }) {
  return (
    <div>
      {grouped.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#bbb' }}>No tasks to show</div>
      ) : (
        grouped.map(group => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
            }}>
              <div style={{
                background: '#6c63ff', color: '#fff', borderRadius: 10, padding: '4px 14px',
                fontSize: 13, fontWeight: 700,
              }}>{group.label}</div>
              <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
              <div style={{ fontSize: 12, color: '#aaa' }}>{group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.tasks.map(task => (
                <TaskCard key={task.id} task={task} onToggleDone={onToggleDone} onDelete={onDelete} onOpenDetail={onOpenDetail} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
    background: active ? '#6c63ff' : '#f0f0f0', color: active ? '#fff' : '#555',
    fontWeight: active ? 700 : 400,
  };
}
