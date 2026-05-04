import type { Metadata } from "next";
import Script from "next/script";
import { locales, metadata as i18nMeta, type Locale } from "@/lib/i18n";
import "../../globals.css";

const localeToHtmlLang: Record<string, string> = {
  en: "en",
  es: "es",
  pt: "pt",
};

const localeToOgLocale: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
  pt: "pt_BR",
};

export function generateStaticParams() {
  return locales.filter((l) => l !== "ko").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const meta = i18nMeta[loc] ?? i18nMeta.ko;
  const url = `https://haebom.app/pdf/${locale}/`;

  const alternateLanguages: Record<string, string> = {};
  alternateLanguages["ko"] = "https://haebom.app/pdf/";
  for (const l of locales) {
    if (l !== "ko") alternateLanguages[l] = `https://haebom.app/pdf/${l}/`;
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: "website",
      locale: localeToOgLocale[loc] ?? "ko_KR",
      url,
      images: ["https://haebom.app/haebom.png"],
      siteName: "Haebom",
    },
    twitter: {
      card: "summary",
      title: meta.twitterTitle,
      description: meta.twitterDescription,
      images: ["https://haebom.app/haebom.png"],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: alternateLanguages,
    },
  };
}

export default async function IntlLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = localeToHtmlLang[locale] ?? "ko";
  const loc = locale as Locale;
  const meta = i18nMeta[loc] ?? i18nMeta.ko;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: meta.ogTitle,
    description: meta.description,
    url: `https://haebom.app/pdf/${locale}/`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: ["PDF Merge", "PDF Split", "PDF to Image", "Image to PDF", "PDF to Excel"],
  };

  return (
    <html lang={lang}>
      <head>
        <link rel="icon" href="/pdf/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y644EYN1VZ"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y644EYN1VZ');
          `}
        </Script>
        {children}
        <Script src="/footer.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
