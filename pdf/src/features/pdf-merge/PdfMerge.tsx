'use client';

import { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { FileList } from '@/components/FileList';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ProcessingState } from '@/types';
import { mergePDFs, downloadBlob } from '@/lib/pdf-utils';

export function PdfMerge() {
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
      setState({ status: 'error', message: 'PDF 파일을 2개 이상 선택해주세요' });
      return;
    }

    setState({ status: 'processing', message: 'PDF 파일을 병합하는 중...' });

    try {
      const merged = await mergePDFs(files);
      downloadBlob(merged, 'merged.pdf');
      setState({ status: 'done', message: '병합 완료! 다운로드가 시작됩니다.' });
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
          PDF 병합하기
        </button>
        {files.length > 0 && (
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {files.length === 0 && state.status === 'idle' && (
        <p className="mt-4 text-sm text-gray-400">
          여러 PDF 파일을 업로드하면 순서대로 하나의 PDF로 합쳐집니다.
        </p>
      )}
    </div>
  );
}
