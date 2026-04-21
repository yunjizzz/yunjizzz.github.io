import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "매일쓰는 PDF 도구 - 무료 온라인 PDF 변환기 | 브라우저에서 바로 처리",
  description: "직장인이 불편해서 직접 만든 무료 PDF 도구. 회원가입 없이 PDF 병합, 분할, 이미지 변환을 브라우저에서 바로 처리합니다. 서버 업로드 없이 안전하게.",
  keywords: ["PDF 변환", "PDF 병합", "PDF 분할", "PDF to 이미지", "이미지 to PDF", "무료 PDF 도구", "온라인 PDF 편집"],
  openGraph: {
    title: "매일쓰는 PDF 도구 - 무료 온라인 PDF 변환기",
    description: "직장인이 불편해서 직접 만든 무료 PDF 도구. 회원가입 없이 브라우저에서 PDF 병합, 분할, 이미지 변환을 바로 처리하세요.",
    type: "website",
    locale: "ko_KR",
    url: "https://yunjizzz.github.io/pdf/",
    siteName: "매일쓰는 PDF 도구",
  },
  twitter: {
    card: "summary_large_image",
    title: "매일쓰는 PDF 도구 - 무료 온라인 PDF 변환기",
    description: "직장인이 불편해서 직접 만든 무료 PDF 도구. 회원가입 없이 브라우저에서 바로 처리하세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://yunjizzz.github.io/pdf/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "매일쓰는 PDF 도구",
    description: "직장인이 불편해서 직접 만든 무료 PDF 도구. 브라우저에서 PDF 병합, 분할, 이미지 변환을 바로 처리합니다.",
    url: "https://yunjizzz.github.io/pdf/",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
