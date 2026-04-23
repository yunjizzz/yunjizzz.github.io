import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "이사 도우미",
  description: "이사 준비를 체크리스트로 한눈에 관리하세요",
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

        <footer className="border-t bg-white">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>이사 도우미 — 이사 준비를 더 쉽게</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
