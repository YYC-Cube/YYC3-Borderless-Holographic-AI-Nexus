import { useTranslation, type Locale } from "@/src/i18n";
import { Globe } from "lucide-react";
import { useState } from "react";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
  ko: "한국어",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  "pt-BR": "Português",
  ar: "العربية",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all text-sm"
      >
        <Globe className="w-4 h-4" />
        <span>{LOCALE_LABELS[locale]}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0a1628]/95 border border-cyan-500/20 rounded-lg shadow-lg overflow-hidden z-50">
          {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(([loc, label]) => (
            <button
              key={loc}
              onClick={() => { setLocale(loc); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-cyan-500/10 ${
                locale === loc ? "text-cyan-400 bg-cyan-500/20" : "text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}