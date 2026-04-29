import type { Metadata } from "next";
import Script from "next/script";
import { metadata as i18nMeta, locales } from "@/lib/i18n";
import "../globals.css";

const meta = i18nMeta.ko;

const alternateLanguages: Record<string, string> = {};
alternateLanguages["ko"] = "https://yoginhae.com/pdf/";
for (const l of locales) {
  if (l !== "ko") alternateLanguages[l] = `https://yoginhae.com/pdf/${l}/`;
}

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.ogTitle,
    description: meta.ogDescription,
    type: "website",
    locale: "ko_KR",
    url: "https://yoginhae.com/pdf/",
    images: ["https://yoginhae.com/haebom.png"],
    siteName: "해봄",
  },
  twitter: {
    card: "summary",
    title: meta.twitterTitle,
    description: meta.twitterDescription,
    images: ["https://yoginhae.com/haebom.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://yoginhae.com/pdf/",
    languages: alternateLanguages,
  },
};

export default function KoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "해봄 - PDF 도구",
    description: meta.description,
    url: "https://yoginhae.com/pdf/",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: ["ko", "en", "es", "pt"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    featureList: ["PDF 병합", "PDF 분할", "PDF를 이미지로 변환", "이미지를 PDF로 변환"],
  };

  return (
    <html lang="ko">
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
      </body>
    </html>
  );
}
