'use client';

import { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { FileList } from '@/components/FileList';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ProcessingState } from '@/types';
import { pdfToImages, downloadBlob, downloadAsZip } from '@/lib/pdf-utils';
import { useTranslation } from '@/lib/i18n-context';

export function PdfToImage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>({ status: 'idle' });
  const [results, setResults] = useState<{ blob: Blob; name: string }[]>([]);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');

  const handleDrop = (newFiles: File[]) => {
    setFiles(newFiles);
    setResults([]);
    setState({ status: 'idle' });
  };

  const handleRemove = () => {
    setFiles([]);
    setResults([]);
    setState({ status: 'idle' });
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setState({ status: 'error', message: 'PDF 파일을 선택해주세요' });
      return;
    }

    setState({ status: 'processing', message: 'PDF를 이미지로 변환하는 중...' });

    try {
      const images = await pdfToImages(files[0], format);
      setResults(images);
      setState({ status: 'done', message: `${images.length}개 페이지 변환 완료!` });
    } catch (error) {
      setState({ status: 'error', message: `변환 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` });
    }
  };

  const handleDownloadAll = async () => {
    if (results.length === 1) {
      downloadBlob(results[0].blob, results[0].name);
    } else {
      const baseName = files[0].name.replace('.pdf', '');
      await downloadAsZip(results, `${baseName}_images.zip`);
    }
  };

  const handleDownloadOne = (index: number) => {
    downloadBlob(results[index].blob, results[index].name);
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setState({ status: 'idle' });
  };

  return (
    <div>
      <FileDropzone onDrop={handleDrop} accept={['.pdf']} multiple={false} disabled={state.status === 'processing'} />
      <FileList files={files} onRemove={handleRemove} />

      {files.length > 0 && results.length === 0 && (
        <div className="mt-4 flex items-center gap-4">
          <label className="text-sm text-gray-600">{t('outputFormat')}</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
          </select>
        </div>
      )}

      <ProcessingStatus state={state} />

      {results.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">{t('conversionResults')} ({results.length}{t('pages')})</p>
            <button
              onClick={handleDownloadAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {results.length > 1 ? t('downloadAllZip') : t('download')}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="relative group border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleDownloadOne(index)}
              >
                <img
                  src={URL.createObjectURL(result.blob)}
                  alt={result.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">{t('download')}</span>
                </div>
                <p className="p-1 text-xs text-gray-500 truncate text-center">{index + 1}{t('page')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3 justify-end">
        {results.length === 0 ? (
          <button
            onClick={handleConvert}
            disabled={files.length === 0 || state.status === 'processing'}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('convertToImage')}
          </button>
        ) : (
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
          {t('pdfToImageHelp')}
        </p>
      )}
    </div>
  );
}
