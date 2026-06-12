import { useState } from 'react';
import { useT } from '../i18n';

interface Zone {
  id: string;
  lines: string[];   // label split into lines (already translated)
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: string;
  dashed?: boolean;
  vertical?: boolean; // render label rotated 90° (for tall narrow boxes)
}

// Coordinate system: 440 x 360, matching the photographed floor plan.
// Top: entrance. Upper band: working zone | registration (narrow, dashed) | web engineering track (orange).
// Mid-left: two WCs. Lower hall: hackathon zone + coffee + food.
function buildZones(m: Record<string, string>): Zone[] {
  return [
    { id: 'entrance',     lines: [m.entrance],                  color: '#607d8b', x: 175, y: 12,  w: 90,  h: 34,  icon: '🚪' },
    { id: 'working',      lines: [m.workingZone],               color: '#5b8def', x: 24,  y: 62,  w: 130, h: 96,  icon: '💻' },
    { id: 'registration', lines: [m.registration],             color: '#5b8def', x: 166, y: 62,  w: 70,  h: 150, icon: '📋', dashed: true, vertical: true },
    { id: 'webtrack',     lines: splitTrack(m.mainStage),       color: '#e8703a', x: 250, y: 62,  w: 166, h: 130, icon: '🎤' },
    { id: 'wc1',          lines: [m.wc],                        color: '#78909c', x: 24,  y: 168, w: 58,  h: 44,  icon: '🚻' },
    { id: 'wc2',          lines: [m.wc],                        color: '#78909c', x: 92,  y: 168, w: 58,  h: 44,  icon: '🚻' },
    { id: 'hackathon',    lines: splitTrack(m.hackathon),       color: '#8b7dff', x: 24,  y: 232, w: 230, h: 110, icon: '💡' },
    { id: 'coffee',       lines: [m.coffee],                    color: '#8d6e63', x: 268, y: 232, w: 100, h: 50,  icon: '☕' },
    { id: 'food',         lines: [m.food],                      color: '#66a06b', x: 268, y: 292, w: 148, h: 50,  icon: '🍽' },
  ];
}

// Split a 2-3 word label so it wraps nicely (e.g. "Web Engineering Track").
function splitTrack(label: string): string[] {
  const words = label.split(' ');
  if (words.length <= 1) return [label];
  if (words.length === 2) return words;
  // 3 words: first on its own line, rest on second
  return [words[0], words.slice(1).join(' ')];
}

export function VenueMap({ highlight }: { highlight?: string | null }) {
  const { t } = useT();
  const [hovered, setHovered] = useState<string | null>(null);
  const m = t.map as Record<string, string>;
  const zones = buildZones(m);

  return (
    <div>
      <svg viewBox="0 0 440 360" style={{ width: '100%', display: 'block' }}>
        {/* Floor outline */}
        <rect x={8} y={6} width={424} height={348} rx={10} fill="#f4f4f6" stroke="#d0d0d4" strokeWidth={1.5} />

        {/* Corridor hint between working zone / registration */}
        <line x1={158} y1={62} x2={158} y2={212} stroke="#c4c4cc" strokeWidth={1} strokeDasharray="5,4" />

        {zones.map(z => {
          const isHi = highlight === z.id;
          const active = hovered === z.id || isHi;
          const cx = z.x + z.w / 2;
          const fontSize = z.w < 70 ? 8.5 : z.w < 110 ? 10 : 11;
          // vertically center icon + text block
          const lineH = fontSize + 3;
          const blockH = lineH * z.lines.length + 16; // 16 = icon
          let textY = z.y + z.h / 2 - blockH / 2 + 16;

          return (
            <g key={z.id} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(z.id)} onMouseLeave={() => setHovered(null)}>
              {isHi && (
                <rect
                  x={z.x - 4} y={z.y - 4} width={z.w + 8} height={z.h + 8} rx={9}
                  fill="none" stroke="#6c63ff" strokeWidth={3}
                >
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
                </rect>
              )}
              <rect
                x={z.x} y={z.y} width={z.w} height={z.h} rx={7}
                fill={z.color + (active ? 'ee' : 'c0')}
                stroke={z.color}
                strokeWidth={active ? 2.5 : 1.5}
                strokeDasharray={z.dashed ? '6,4' : undefined}
              />
              {z.vertical ? (
                <>
                  {/* icon near the top, label rotated 90° to fit the tall narrow box */}
                  <text x={cx} y={z.y + 22} textAnchor="middle" fontSize={15} dominantBaseline="middle">{z.icon}</text>
                  <text
                    x={cx} y={z.y + z.h / 2 + 8} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700}
                    transform={`rotate(-90 ${cx} ${z.y + z.h / 2 + 8})`}
                    style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    {z.lines[0]}
                  </text>
                </>
              ) : (
                <>
                  <text x={cx} y={z.y + z.h / 2 - blockH / 2} textAnchor="middle" fontSize={15} dominantBaseline="middle">
                    {z.icon}
                  </text>
                  {z.lines.map((line, i) => (
                    <text
                      key={i}
                      x={cx}
                      y={textY + i * lineH}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill="#fff"
                      fontWeight={700}
                      style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}
                    >
                      {line}
                    </text>
                  ))}
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{t.map.legend}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { color: '#e8703a', label: t.map.mainStage, icon: '🎤' },
            { color: '#8b7dff', label: t.map.hackathon, icon: '💡' },
            { color: '#5b8def', label: t.map.workingZone, icon: '💻' },
            { color: '#5b8def', label: t.map.registration, icon: '📋' },
            { color: '#8d6e63', label: t.map.coffee, icon: '☕' },
            { color: '#66a06b', label: t.map.food, icon: '🍽' },
            { color: '#78909c', label: t.map.wc, icon: '🚻' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: item.color, display: 'inline-block' }} />
              <span>{item.icon} {item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
