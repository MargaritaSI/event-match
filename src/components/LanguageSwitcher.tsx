import { useState } from 'react';
import { LOCALES } from '../i18n';
import type { LocaleKey } from '../i18n';

interface Props {
  locale: LocaleKey;
  setLocale: (l: LocaleKey) => void;
}

export function LanguageSwitcher({ locale, setLocale }: Props) {
  const [open, setOpen] = useState(false);
  const current = LOCALES[locale];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer',
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        <span>{current.flag}</span>
        <span style={{ maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current.label}</span>
        <span style={{ fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: '110%', zIndex: 100,
            background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            padding: 8, minWidth: 180, maxHeight: 320, overflowY: 'auto',
          }}>
            {(Object.entries(LOCALES) as [LocaleKey, typeof LOCALES[LocaleKey]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setLocale(key); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '7px 10px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  background: key === locale ? '#f0eeff' : 'none', color: key === locale ? '#6c63ff' : '#333',
                  fontWeight: key === locale ? 700 : 400, textAlign: 'left',
                }}
              >
                <span>{val.flag}</span><span>{val.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
