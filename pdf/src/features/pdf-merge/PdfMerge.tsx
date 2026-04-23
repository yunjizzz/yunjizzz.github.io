'use client';

import { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { FileList } from '@/components/FileList';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ProcessingState } from '@/types';
import { mergePDFs, downloadBlob } from '@/lib/pdf-utils';
import { useTranslation } from "@/lib/i18n-context";

export function PdfMerge() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>({ status: 'idle' });

  const handleDrop = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setState({ status: 'idle' });
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setState({ status: 'error', message: t('mergeError') });
      return;
    }

    setState({ status: 'processing', message: t('merging') });

    try {
      const merged = await mergePDFs(files);
      downloadBlob(merged, 'merged.pdf');
      setState({ status: 'done', message: t('mergeSuccess') });
    } catch (error) {
      setState({ status: 'error', message: `병합 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` });
    }
  };

  const handleReset = () => {
    setFiles([]);
    setState({ status: 'idle' });
  };

  return (
    <div>
      <FileDropzone onDrop={handleDrop} accept={['.pdf']} multiple disabled={state.status === 'processing'} />
      <FileList files={files} onRemove={handleRemove} />
      <ProcessingStatus state={state} />

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleMerge}
          disabled={files.length < 2 || state.status === 'processing'}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('mergeButton')}
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
          {t('mergeHelp')}
        </p>
      )}
    </div>
  );
}
