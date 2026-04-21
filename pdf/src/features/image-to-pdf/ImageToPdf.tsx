'use client';

import { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { FileList } from '@/components/FileList';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ProcessingState } from '@/types';
import { imagesToPDF, downloadBlob } from '@/lib/pdf-utils';

export function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>({ status: 'idle' });

  const handleDrop = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setState({ status: 'idle' });
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setState({ status: 'error', message: '이미지 파일을 선택해주세요' });
      return;
    }

    setState({ status: 'processing', message: '이미지를 PDF로 변환하는 중...' });

    try {
      const pdfBytes = await imagesToPDF(files);
      downloadBlob(pdfBytes, 'images.pdf');
      setState({ status: 'done', message: 'PDF 변환 완료! 다운로드가 시작됩니다.' });
    } catch (error) {
      setState({ status: 'error', message: `변환 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` });
    }
  };

  const handleReset = () => {
    setFiles([]);
    setState({ status: 'idle' });
  };

  return (
    <div>
      <FileDropzone onDrop={handleDrop} accept={['.png', '.jpg', '.jpeg', '.webp']} multiple disabled={state.status === 'processing'} />
      <FileList files={files} onRemove={handleRemove} />
      <ProcessingStatus state={state} />

      {files.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            이미지가 나열된 순서대로 PDF 페이지로 변환됩니다.
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleConvert}
          disabled={files.length === 0 || state.status === 'processing'}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          PDF로 변환
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
          PNG, JPG, WEBP 이미지를 업로드하면 하나의 PDF 파일로 합쳐집니다.
        </p>
      )}
    </div>
  );
}
