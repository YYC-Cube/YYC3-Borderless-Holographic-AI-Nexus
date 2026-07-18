import { LRUCache } from "./cache";
import { interpolate, type TranslateParams } from "./formatter";
import type { I18nConfig, Locale } from "./types";

export class I18nEngine {
  private config: I18nConfig;
  private cache = new LRUCache<string>({ maxSize: 500, defaultTTL: 10 * 60 * 1000 });
  private localeListeners = new Set<(locale: Locale) => void>();

  constructor(config: I18nConfig) {
    this.config = {
      locale: config.locale ?? "en",
      fallbackLocale: config.fallbackLocale ?? "en",
      translations: config.translations,
      debug: config.debug,
      onError: config.onError,
      missingKeyHandler: config.missingKeyHandler,
    };
  }

  get locale(): Locale {
    return this.config.locale;
  }

  get fallbackLocale(): Locale {
    return this.config.fallbackLocale;
  }

  /** Change locale and notify all listeners */
  async setLocale(locale: Locale): Promise<void> {
    const oldLocale = this.config.locale;
    this.config.locale = locale;
    this.cache.clear();

    if (locale !== oldLocale) {
      this.localeListeners.forEach((fn) => fn(locale));
    }

    if (this.config.debug) {
      console.log(`[i18n] Locale changed: ${oldLocale} → ${locale}`);
    }
  }

  /** Subscribe to locale changes */
  onLocaleChange(fn: (locale: Locale) => void): () => void {
    this.localeListeners.add(fn);
    return () => { this.localeListeners.delete(fn); };
  }

  /** Translate a key with optional parameters */
  t(key: string, params?: TranslateParams): string {
    const cacheKey = `${this.config.locale}:${key}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return params ? interpolate(cached, params) : cached;
    }

    const value = this.resolveKey(key, this.config.locale, params);
    this.cache.set(cacheKey, value);
    return value;
  }

  /** Check if a key exists */
  hasKey(key: string): boolean {
    return this.resolveValue(key, this.config.locale) !== undefined;
  }

  // --- Internal ---

  private resolveKey(key: string, locale: Locale, params?: TranslateParams): string {
    const value = this.resolveValue(key, locale);
    if (value !== undefined) {
      return params ? interpolate(value, params) : value;
    }

    // Fallback
    if (locale !== this.config.fallbackLocale) {
      const fallback = this.resolveValue(key, this.config.fallbackLocale);
      if (fallback !== undefined) {
        return params ? interpolate(fallback, params) : fallback;
      }
    }

    // Missing key
    if (this.config.missingKeyHandler) {
      return this.config.missingKeyHandler(key, locale);
    }

    if (this.config.debug) {
      console.warn(`[i18n] Missing key: "${key}" (locale: ${locale})`);
    }

    return key;
  }

  private resolveValue(key: string, locale: Locale): string | undefined {
    const translations = this.config.translations[locale];
    if (!translations) return undefined;

    const parts = key.split(".");
    let current: unknown = translations;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== "object") return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return typeof current === "string" ? current : undefined;
  }

  /** Get all translation keys (for debugging) */
  getKeys(locale?: Locale): string[] {
    const keys: string[] = [];
    const translations = this.config.translations[locale ?? this.config.locale];
    if (!translations) return keys;

    const walk = (obj: Record<string, unknown>, prefix: string) => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "string") {
          keys.push(fullKey);
        } else if (typeof value === "object" && value !== null) {
          walk(value as Record<string, unknown>, fullKey);
        }
      }
    };

    walk(translations, "");
    return keys;
  }
}
