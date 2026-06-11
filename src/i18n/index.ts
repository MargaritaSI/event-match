import { createContext, useContext, useState } from 'react';
import en from './locales/en';
import ru from './locales/ru';
import nl from './locales/nl';
import { de, fr, es, pt, it, pl, cs, tr, zh, ja, ko, uk } from './locales/others';

export const LOCALES = {
  en: { label: 'English', flag: '🇬🇧', t: en },
  nl: { label: 'Nederlands', flag: '🇳🇱', t: nl },
  ru: { label: 'Русский', flag: '🇷🇺', t: ru },
  de: { label: 'Deutsch', flag: '🇩🇪', t: de },
  fr: { label: 'Français', flag: '🇫🇷', t: fr },
  es: { label: 'Español', flag: '🇪🇸', t: es },
  pt: { label: 'Português', flag: '🇵🇹', t: pt },
  it: { label: 'Italiano', flag: '🇮🇹', t: it },
  pl: { label: 'Polski', flag: '🇵🇱', t: pl },
  cs: { label: 'Čeština', flag: '🇨🇿', t: cs },
  tr: { label: 'Türkçe', flag: '🇹🇷', t: tr },
  zh: { label: '中文', flag: '🇨🇳', t: zh },
  ja: { label: '日本語', flag: '🇯🇵', t: ja },
  ko: { label: '한국어', flag: '🇰🇷', t: ko },
  uk: { label: 'Українська', flag: '🇺🇦', t: uk },
} as const;

export type LocaleKey = keyof typeof LOCALES;
export type Translations = typeof en;

import { createContext as _cc } from 'react';
export const I18nContext = createContext<{
  locale: LocaleKey;
  t: Translations;
  setLocale: (l: LocaleKey) => void;
}>({ locale: 'en', t: en, setLocale: () => {} });

export function useT() {
  return useContext(I18nContext);
}

export function useI18nState() {
  const [locale, setLocale] = useState<LocaleKey>('en');
  const t = LOCALES[locale].t as Translations;
  return { locale, t, setLocale };
}
