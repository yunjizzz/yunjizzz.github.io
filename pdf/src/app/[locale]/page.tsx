'use client';

import { use } from 'react';
import { I18nProvider } from '@/lib/i18n-context';
import PdfToolPage from '@/components/PdfToolPage';
import type { Locale } from '@/lib/i18n';

export default function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <I18nProvider initialLocale={locale as Locale}>
      <PdfToolPage />
    </I18nProvider>
  );
}
