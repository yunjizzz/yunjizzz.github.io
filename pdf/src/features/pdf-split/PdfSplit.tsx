'use client';

import { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { FileList } from '@/components/FileList';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ProcessingState } from '@/types';
import { splitPDF, downloadBlob, getPDFPageCount } from '@/lib/pdf-utils';
import { useTranslation } from "@/lib/i18n-context";

export function PdfSplit() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>({ status: 'idle' });
  const [pageRange, setPageRange] = useState('');
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const handleDrop = async (newFiles: File[]) => {
    setFiles(newFiles);
    setState({ status: 'idle' });
    setPageRange('');

    try {
      const count = await getPDFPageCount(newFiles[0]);
      setTotalPages(count);
    } catch {
      setTotalPages(null);
    }
  };

  const handleRemove = () => {
    setFiles([]);
    setTotalPages(null);
    setPageRange('');
    setState({ status: 'idle' });
  };

  const handleSplit = async () => {
    if (files.length === 0) {
      setState({ status: 'error', message: t('splitErrorNoFile') });
      return;
    }
    if (!pageRange.trim()) {
      setState({ status: 'error', message: t('splitErrorNoRange') });
      return;
    }

    setState({ status: 'processing', message: t('splitting') });

    try {
      const result = await splitPDF(files[0], pageRange);
      const baseName = files[0].name.replace('.pdf', '');
      downloadBlob(result, `${baseName}_split.pdf`);
      setState({ status: 'done', message: t('splitSuccess') });
    } catch (error) {
      setState({ status: 'error', message: `분할 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` });
    }
  };

  const handleReset = () => {
    setFiles([]);
    setTotalPages(null);
    setPageRange('');
    setState({ status: 'idle' });
  };

  return (
    <div>
      <FileDropzone onDrop={handleDrop} accept={['.pdf']} multiple={false} disabled={state.status === 'processing'} />
      <FileList files={files} onRemove={handleRemove} />

      {files.length > 0 && totalPages !== null && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-600">
            {t('totalPages')} <span className="font-semibold">{totalPages}</span>{t('pagesUnit')}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pageRange')}
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder={t('pageRangePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              {t('pageRangeHelper')}
            </p>
          </div>
        </div>
      )}

      <ProcessingStatus state={state} />

      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={handleSplit}
          disabled={files.length === 0 || !pageRange.trim() || state.status === 'processing'}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('splitButton')}
        </button>
        {files.length > 0 && (
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            {t('reset')}
          </button>
        )}
      </div>

      {files.length === 0 && state.status === 'idle' && (
        <p className="mt-4 text-sm text-gray-400">
          {t('splitHelp')}
        </p>
      )}
    </div>
  );
}
