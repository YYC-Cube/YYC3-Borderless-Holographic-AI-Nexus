import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { detectLocale, persistLocale } from "./detector";
import { I18nEngine } from "./engine";
import type { Locale, TranslationMap } from "./types";

// --- Locale imports ---
import { ar } from "./locales/ar";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { pt_BR } from "./locales/pt-BR";
import { zh_CN } from "./locales/zh-CN";
import { zh_TW } from "./locales/zh-TW";

const translations: Partial<Record<Locale, TranslationMap>> = {
  en: en as unknown as TranslationMap,
  "zh-CN": zh_CN as unknown as TranslationMap,
  "zh-TW": zh_TW as unknown as TranslationMap,
  ja: ja as unknown as TranslationMap,
  ko: ko as unknown as TranslationMap,
  fr: fr as unknown as TranslationMap,
  de: de as unknown as TranslationMap,
  es: es as unknown as TranslationMap,
  "pt-BR": pt_BR as unknown as TranslationMap,
  ar: ar as unknown as TranslationMap,
};

// --- Context ---
interface I18nContextValue {
  engine: I18nEngine;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// --- Provider ---
let globalEngine: I18nEngine | null = null;

function getEngine(): I18nEngine {
  if (!globalEngine) {
    globalEngine = new I18nEngine({
      locale: detectLocale(),
      fallbackLocale: "en",
      translations,
      debug: process.env.NODE_ENV === "development",
      missingKeyHandler: (key, locale) => {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[i18n] Missing key: "${key}" (${locale})`);
        }
        return key;
      },
    });
  }
  return globalEngine;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const engine = useMemo(() => getEngine(), []);
  const [locale, setLocaleState] = useState<Locale>(engine.locale);

  const setLocale = useCallback((newLocale: Locale) => {
    engine.setLocale(newLocale);
    persistLocale(newLocale);
    setLocaleState(newLocale);
  }, [engine]);

  useEffect(() => {
    return engine.onLocaleChange((newLocale) => {
      setLocaleState(newLocale);
    });
  }, [engine]);

  const value = useMemo<I18nContextValue>(
    () => ({
      engine,
      locale,
      setLocale,
      t: (key, params) => engine.t(key, params),
    }),
    [engine, locale, setLocale]
  );

  return React.createElement(I18nContext.Provider, { value }, children);
}

// --- Hook ---
export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}

// --- Trans component ---
interface TransProps {
  id: string;
  params?: Record<string, unknown>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function Trans({ id, params, className, as: Tag = "span" }: TransProps) {
  const { t } = useTranslation();
  const text = t(id, params);
  return React.createElement(Tag, { className }, text);
}

// --- Re-export types ---
export { I18nEngine } from "./engine";
export type { Locale, TranslationMap } from "./types";
