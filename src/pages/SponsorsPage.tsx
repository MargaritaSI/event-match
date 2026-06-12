import { useState } from 'react';
import { Card, CardBody } from '../ui';
import { SPONSORS } from '../data/sponsors';
import { InterestBadge } from '../components/InterestBadge';
import { useT } from '../i18n';
import type { Interest } from '../types';

// Baseline leads/views per sponsor (their ROI dashboard); your badge-drop adds to it.
const BASE_LEADS: Record<string, { leads: number; views: number }> = {};
SPONSORS.forEach((s, i) => { BASE_LEADS[s.id] = { leads: 30 + i * 9, views: 120 + i * 40 }; });

const MY_INTERESTS: Interest[] = ['health', 'mobile', 'startup', 'design'];

const TIER_COLORS = { gold: '#f9a825', silver: '#9e9e9e', partner: '#6c63ff' };
const TIER_LABELS = { gold: '🥇 Gold', silver: '🥈 Silver', partner: '🤝 Partner' };

export function SponsorsPage({ onOpenMap }: { onOpenMap: (location: string) => void }) {
  const { t } = useT();
  const [leads, setLeads] = useState<Set<string>>(new Set());

  function dropBadge(id: string) {
    setLeads(prev => new Set(prev).add(id));
  }

  const recommended = SPONSORS.filter(s => s.tags.some(tag => MY_INTERESTS.includes(tag)));
  const others = SPONSORS.filter(s => !s.tags.some(tag => MY_INTERESTS.includes(tag)));

  return (
    <div style={{ padding: '16px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{t.sponsors.title}</h2>
      <p style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>{t.sponsors.subtitle}</p>

      {/* How it works */}
      <div style={{ background: '#f0eeff', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#6c63ff', marginBottom: 4 }}>🤝 How sponsors & you connect</div>
        <div style={{ fontSize: 12.5, color: '#555', lineHeight: 1.5 }}>
          Reps are at their <strong>booth</strong> during breaks — tap a booth to find it on the map.
          Tap <strong>📲 Share my badge</strong> to send the sponsor your contact (a “lead”) so they can follow up about roles, swag or demos.
          The <strong>📇 leads · 👁 views</strong> line is the sponsor’s ROI dashboard.
        </div>
      </div>

      <h3 style={{ fontSize: 15, margin: '0 0 12px', color: '#6c63ff' }}>✨ {t.sponsors.forYou}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {recommended.map(s => <SponsorCard key={s.id} sponsor={s} t={t.sponsors} highlighted onOpenMap={onOpenMap} leadDropped={leads.has(s.id)} onDropBadge={() => dropBadge(s.id)} />)}
      </div>

      {others.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, margin: '0 0 12px', color: '#555' }}>All sponsors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {others.map(s => <SponsorCard key={s.id} sponsor={s} t={t.sponsors} onOpenMap={onOpenMap} leadDropped={leads.has(s.id)} onDropBadge={() => dropBadge(s.id)} />)}
          </div>
        </>
      )}
    </div>
  );
}

function SponsorCard({ sponsor: s, t, highlighted, onOpenMap, leadDropped, onDropBadge }: { sponsor: typeof SPONSORS[0]; t: any; highlighted?: boolean; onOpenMap: (location: string) => void; leadDropped: boolean; onDropBadge: () => void }) {
  const roi = BASE_LEADS[s.id];
  return (
    <Card style={{
      borderRadius: 12,
      border: highlighted ? `2px solid ${TIER_COLORS[s.tier]}` : '1px solid #e0e0e0',
      background: highlighted ? `${TIER_COLORS[s.tier]}08` : '#fff',
    }}>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, background: `${TIER_COLORS[s.tier]}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>
            {s.logo}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</span>
              <span style={{ fontSize: 11, background: `${TIER_COLORS[s.tier]}33`, color: TIER_COLORS[s.tier], borderRadius: 6, padding: '1px 8px', fontWeight: 600 }}>
                {TIER_LABELS[s.tier]}
              </span>
              {s.hiring && <span style={{ fontSize: 11, background: '#fff3e0', color: '#e65100', borderRadius: 6, padding: '1px 8px', fontWeight: 600 }}>{t.hiring}</span>}
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#555', lineHeight: 1.5 }}>{s.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {s.tags.map(tag => <InterestBadge key={tag} interest={tag} small />)}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {s.booth && (
                <button
                  onClick={() => onOpenMap('Working Zone')}
                  style={{ fontSize: 12, color: '#6c63ff', background: '#f0eeff', border: 'none', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontWeight: 600 }}
                >
                  📍 {t.booth} {s.booth} · find on map
                </button>
              )}
              <span style={{ fontSize: 12, color: '#1976d2' }}>🌐 {s.website}</span>
            </div>

            {/* Lead capture + sponsor ROI mini-dashboard */}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11.5, color: '#888' }}>
                📇 {roi.leads + (leadDropped ? 1 : 0)} leads · 👁 {roi.views} views
              </span>
              <button
                onClick={onDropBadge}
                disabled={leadDropped}
                title={leadDropped ? 'They now have your contact' : 'Share your contact with this sponsor'}
                style={{
                  fontSize: 12, borderRadius: 8, padding: '5px 11px', border: 'none', cursor: leadDropped ? 'default' : 'pointer', fontWeight: 600,
                  background: leadDropped ? '#e8f5e9' : '#6c63ff', color: leadDropped ? '#2e7d32' : '#fff',
                }}
              >
                {leadDropped ? '✓ Shared — they have your contact' : '📲 Share my badge'}
              </button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
