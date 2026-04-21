'use client';

import { useState } from 'react';
import { FeatureType } from '@/types';
import { features } from '@/lib/features';
import { PdfMerge } from '@/features/pdf-merge/PdfMerge';
import { PdfToImage } from '@/features/pdf-to-image/PdfToImage';
import { ImageToPdf } from '@/features/image-to-pdf/ImageToPdf';
import { PdfSplit } from '@/features/pdf-split/PdfSplit';

function MergeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M8 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M16 4h-1a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" opacity="0.5" />
      <path d="M20 12h2m-2 0l-1.5 1.5M20 12l-1.5-1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PdfToImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M6 4h8l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M14 4v4h4" />
      <circle cx="8.5" cy="12.5" r="1.5" />
      <path d="M4 17l3-3 2 2 3-4 4 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageToPdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="5" width="12" height="10" rx="1" />
      <circle cx="7" cy="9" r="1.5" />
      <path d="M3 13l3-3 2 2 3-4 4 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 9h4m-2-2v4" strokeLinecap="round" />
      <path d="M17 15h4v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-4z" />
    </svg>
  );
}

function SplitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M12 4v16" strokeDasharray="2 2" />
      <path d="M2 12h2m-2 0l1.5 1.5M2 12l1.5-1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 12h-2m2 0l-1.5 1.5M22 12l-1.5-1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const featureIcons: Record<FeatureType, React.ReactNode> = {
  'pdf-merge': <MergeIcon className="w-7 h-7" />,
  'pdf-to-image': <PdfToImageIcon className="w-7 h-7" />,
  'image-to-pdf': <ImageToPdfIcon className="w-7 h-7" />,
  'pdf-split': <SplitIcon className="w-7 h-7" />,
};

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<FeatureType>('pdf-merge');

  const renderFeature = () => {
    switch (activeFeature) {
      case 'pdf-merge':
        return <PdfMerge />;
      case 'pdf-to-image':
        return <PdfToImage />;
      case 'image-to-pdf':
        return <ImageToPdf />;
      case 'pdf-split':
        return <PdfSplit />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Privacy Banner */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>모든 파일은 브라우저에서 처리되며 서버에 업로드되지 않습니다</p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#2563eb" />
              <path d="M9 7h9l5 5v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" fill="white" opacity="0.9" />
              <path d="M18 7v5h5" stroke="white" strokeWidth="1.5" opacity="0.7" fill="none" />
              <text x="16" y="21.5" textAnchor="middle" fontSize="7" fontWeight="bold" fontFamily="system-ui" fill="#2563eb">PDF</text>
            </svg>
            <h1 className="text-2xl font-bold text-gray-900">매일쓰는 PDF 도구</h1>
          </div>
          <p className="mt-2 text-gray-600">
            회사에서 PDF 변환할 때마다 불편해서 직접 만든 사이트입니다.<br className="hidden sm:inline" />
            회원가입도, 광고도 없으니 무료로 마음껏 쓰세요.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Feature Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                ${
                  activeFeature === feature.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className={activeFeature === feature.id ? 'text-blue-600' : 'text-gray-500'}>
                {featureIcons[feature.id]}
              </div>
              <h3
                className={`mt-2 text-sm font-semibold ${
                  activeFeature === feature.id ? 'text-blue-700' : 'text-gray-800'
                }`}
              >
                {feature.title}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">{feature.description}</p>
            </button>
          ))}
        </div>

        {/* Active Feature */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {features.find((f) => f.id === activeFeature)?.title}
          </h2>
          {renderFeature()}
        </div>

      </div>
    </main>
  );
}
