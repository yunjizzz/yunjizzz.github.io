"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, locales, type Locale, type TranslationKey } from "./i18n";

type TranslationFn = (key: TranslationKey) => string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Navigate to the new locale URL
    const basePath = "/pdf";
    const newPath = newLocale === "ko" ? basePath + "/" : `${basePath}/${newLocale}/`;
    window.location.href = newPath;
  };

  const t: TranslationFn = (key) => {
    return translations[locale][key] ?? translations["ko"][key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
