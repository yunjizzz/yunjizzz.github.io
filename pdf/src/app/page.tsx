'use client';

import { I18nProvider } from '@/lib/i18n-context';
import PdfToolPage from '@/components/PdfToolPage';

export default function Home() {
  return (
    <I18nProvider initialLocale="ko">
      <PdfToolPage />
    </I18nProvider>
  );
}
