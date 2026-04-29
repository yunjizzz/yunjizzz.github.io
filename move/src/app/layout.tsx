import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "이사 도우미 | 해봄",
    template: "%s | 해봄",
  },
  description: "이사 준비를 체크리스트로 한눈에 관리하세요. D-30부터 D+7까지 시점별 할 일과 이사 업체 링크를 한곳에서.",
  openGraph: {
    title: "이사 도우미 | 해봄",
    description: "이사 준비를 체크리스트로 한눈에 관리하세요. D-30부터 D+7까지 시점별 할 일과 이사 업체 링크를 한곳에서.",
    type: "website",
    url: "https://yoginhae.com/move/",
    images: ["https://yoginhae.com/haebom.png"],
    locale: "ko_KR",
    siteName: "해봄",
  },
  twitter: {
    card: "summary",
    title: "이사 도우미 | 해봄",
    description: "이사 준비를 체크리스트로 한눈에 관리하세요. D-30부터 D+7까지 시점별 할 일과 이사 업체 링크를 한곳에서.",
    images: ["https://yoginhae.com/haebom.png"],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://yoginhae.com/move/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-[var(--font-noto-sans-kr)]">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-foreground hover:opacity-80 transition-opacity flex items-center gap-1.5">
              <span>📦</span> 이사 도우미
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/checklist"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                체크리스트
              </Link>
              <Link
                href="/vendors"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                업체 링크
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

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

        <footer className="border-t bg-white">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>이사 도우미 — 이사 준비를 더 쉽게</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
