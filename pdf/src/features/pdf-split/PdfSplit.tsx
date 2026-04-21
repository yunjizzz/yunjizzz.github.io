'use client';

import { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { FileList } from '@/components/FileList';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ProcessingState } from '@/types';
import { splitPDF, downloadBlob, getPDFPageCount } from '@/lib/pdf-utils';

export function PdfSplit() {
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
      setState({ status: 'error', message: 'PDF 파일을 선택해주세요' });
      return;
    }
    if (!pageRange.trim()) {
      setState({ status: 'error', message: '추출할 페이지 범위를 입력해주세요' });
      return;
    }

    setState({ status: 'processing', message: 'PDF를 분할하는 중...' });

    try {
      const result = await splitPDF(files[0], pageRange);
      const baseName = files[0].name.replace('.pdf', '');
      downloadBlob(result, `${baseName}_split.pdf`);
      setState({ status: 'done', message: '분할 완료! 다운로드가 시작됩니다.' });
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
            전체 <span className="font-semibold">{totalPages}</span>페이지
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              추출할 페이지 범위
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="예: 1-3, 5, 7-9"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              쉼표로 구분하여 여러 범위를 지정할 수 있습니다
            </p>
          </div>
        </div>
      )}

      <ProcessingStatus state={state} />

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSplit}
          disabled={files.length === 0 || !pageRange.trim() || state.status === 'processing'}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          PDF 분할하기
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
          PDF 파일을 업로드하고 원하는 페이지 범위를 입력하면 해당 페이지만 추출합니다.
        </p>
      )}
    </div>
  );
}
