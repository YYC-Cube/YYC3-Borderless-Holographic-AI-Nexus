import type { Locale } from "./types";

/** Get the user's preferred locale from browser */
export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";

  // Check localStorage first
  try {
    const stored = window.localStorage.getItem("yyc-locale");
    if (stored) return stored as Locale;
  } catch { /* ignore */ }

  // Check navigator
  const nav = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "en";
  const lang = nav.toLowerCase();

  if (lang.startsWith("zh")) {
    return lang.includes("tw") || lang.includes("hk") ? "zh-TW" : "zh-CN";
  }
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("pt")) return "pt-BR";
  if (lang.startsWith("ar")) return "ar";

  return "en";
}

/** Save locale preference to localStorage */
export function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem("yyc-locale", locale);
  } catch { /* ignore */ }
}