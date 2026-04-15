import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
