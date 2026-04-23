import type { Metadata } from "next";
import { locales, metadata as i18nMeta, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.filter((l) => l !== "ko").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const meta = i18nMeta[loc] ?? i18nMeta.ko;
  const url = `https://yoginhae.com/pdf/${locale}/`;

  const alternateLanguages: Record<string, string> = {};
  alternateLanguages["ko"] = "https://yoginhae.com/pdf/";
  for (const l of locales) {
    if (l !== "ko") alternateLanguages[l] = `https://yoginhae.com/pdf/${l}/`;
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: "website",
      locale: loc,
      url,
      siteName: meta.ogTitle.split(" - ")[0],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.twitterTitle,
      description: meta.twitterDescription,
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: alternateLanguages,
    },
  };
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
