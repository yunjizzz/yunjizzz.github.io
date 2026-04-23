"use client";

import { useTranslation } from "@/lib/i18n-context";
import { locales, localeNames } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
            locale === loc
              ? "bg-blue-600 text-white"
              : "bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900"
          }`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
