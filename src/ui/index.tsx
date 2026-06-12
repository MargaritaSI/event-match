/**
 * EventMatch UI kit — lightweight, dependency-free replacements for the handful of
 * KendoReact components the app used (Button, Input, TextArea, Card, Dialog).
 * Same prop shapes as Kendo (e.g. inputs fire onChange with `{ value }`) so call
 * sites stay unchanged. Styling is on-brand (purple #6c63ff) and mobile-first.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes } from 'react';

/* ------------------------------------------------------------------ Button */

type ThemeColor = 'primary' | 'error' | 'success' | 'base';
type FillMode = 'solid' | 'outline' | 'flat';
type Size = 'small' | 'medium' | 'large';

const ACCENT: Record<ThemeColor, string> = {
  primary: '#6c63ff',
  error: '#e53935',
  success: '#22a06b',
  base: '#2f2f33',
};

const SIZES: Record<Size, { padding: string; fontSize: number; radius: number }> = {
  small: { padding: '5px 11px', fontSize: 13, radius: 8 },
  medium: { padding: '7px 15px', fontSize: 14, radius: 9 },
  large: { padding: '11px 20px', fontSize: 16, radius: 10 },
};

export interface ButtonProps {
  themeColor?: ThemeColor;
  fillMode?: FillMode;
  size?: Size;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
}

export function Button({
  themeColor = 'base',
  fillMode = 'solid',
  size = 'medium',
  disabled,
  title,
  style,
  onClick,
  children,
}: ButtonProps) {
  const s = SIZES[size];
  const accent = ACCENT[themeColor];

  let base: CSSProperties;
  if (fillMode === 'outline') {
    base = { background: 'transparent', color: accent, border: `1px solid ${accent}` };
  } else if (fillMode === 'flat') {
    base = { background: 'transparent', color: accent, border: '1px solid transparent' };
  } else if (themeColor === 'base') {
    base = { background: '#f1f0f5', color: '#2f2f33', border: '1px solid rgba(0,0,0,0.12)' };
  } else {
    base = { background: accent, color: '#fff', border: '1px solid transparent' };
  }

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        borderRadius: s.radius,
        fontWeight: 600,
        lineHeight: 1.2,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'filter 0.15s ease, opacity 0.15s ease',
        fontFamily: 'inherit',
        ...base,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------- Input */

const fieldStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 11px',
  fontSize: 16, // 16px+ stops iOS Safari auto-zoom (and the horizontal jitter it causes)
  fontFamily: 'inherit',
  color: '#222',
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.18)',
  borderRadius: 8,
  outline: 'none',
};

type ChangeArg = { value: string };

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'value'> {
  value?: string;
  onChange?: (e: ChangeArg) => void;
}

export function Input({ value, onChange, style, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      value={value}
      onChange={e => onChange?.({ value: e.target.value })}
      style={{ ...fieldStyle, ...style }}
    />
  );
}

/* ---------------------------------------------------------------- TextArea */

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (e: ChangeArg) => void;
}

export function TextArea({ value, onChange, style, rows = 3, ...rest }: TextAreaProps) {
  return (
    <textarea
      {...rest}
      rows={rows}
      value={value}
      onChange={e => onChange?.({ value: e.target.value })}
      style={{ ...fieldStyle, resize: 'vertical', ...style }}
    />
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({ style, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 4,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardBody({ style, children }: { style?: CSSProperties; children?: ReactNode }) {
  return <div style={{ padding: 16, ...style }}>{children}</div>;
}

/* ------------------------------------------------------------------ Dialog */

export interface DialogProps {
  title?: ReactNode;
  onClose?: () => void;
  width?: number;
  children?: ReactNode;
}

export function Dialog({ title, onClose, width = 380, children }: DialogProps) {
  // Close on Escape, like Kendo's dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Portal to <body> so the overlay escapes any parent stacking context (e.g. the page
  // column's z-index) and reliably covers the sticky header — matching Kendo's behaviour.
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 14,
          width: `min(${width}px, calc(100vw - 32px))`,
          maxHeight: 'calc(100dvh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 14px',
            borderBottom: '1px solid #eee',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              color: '#999',
              padding: 4,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 16, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function DialogActionsBar({ children }: { children?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'flex-end',
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid #eee',
      }}
    >
      {children}
    </div>
  );
}
