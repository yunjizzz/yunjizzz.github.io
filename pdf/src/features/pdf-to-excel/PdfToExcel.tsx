'use client';

import { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { FileList } from '@/components/FileList';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ProcessingState } from '@/types';
import { pdfToExcel, downloadBlob } from '@/lib/pdf-utils';
import { useTranslation } from '@/lib/i18n-context';

export function PdfToExcel() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>({ status: 'idle' });

  const handleDrop = (newFiles: File[]) => {
    setFiles(newFiles);
    setState({ status: 'idle' });
  };

  const handleRemove = () => {
    setFiles([]);
    setState({ status: 'idle' });
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setState({ status: 'error', message: t('pdfToExcelError') });
      return;
    }

    setState({ status: 'processing', message: t('convertingToExcel') });

    try {
      const blob = await pdfToExcel(files[0]);
      const filename = files[0].name.replace(/\.pdf$/i, '.xlsx');
      downloadBlob(blob, filename);
      setState({ status: 'done', message: t('pdfToExcelSuccess') });
    } catch (error) {
      setState({
        status: 'error',
        message: `변환 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      });
    }
  };

  const handleReset = () => {
    setFiles([]);
    setState({ status: 'idle' });
  };

  return (
    <div>
      <FileDropzone onDrop={handleDrop} accept={['.pdf']} multiple={false} disabled={state.status === 'processing'} />
      <FileList files={files} onRemove={handleRemove} />

      <ProcessingStatus state={state} />

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleConvert}
          disabled={files.length === 0 || state.status === 'processing'}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('convertToExcel')}
        </button>
        {state.status === 'done' && (
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            {t('convertNewFile')}
          </button>
        )}
      </div>

      {files.length === 0 && state.status === 'idle' && (
        <p className="mt-4 text-sm text-gray-400">
          {t('pdfToExcelHelp')}
        </p>
      )}
    </div>
  );
}
