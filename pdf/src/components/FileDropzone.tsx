'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from "@/lib/i18n-context";

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  accept: string[];
  multiple?: boolean;
  disabled?: boolean;
}

export function FileDropzone({ onDrop, accept, multiple = true, disabled = false }: FileDropzoneProps) {
  const { t } = useTranslation();
  const acceptMap: Record<string, string[]> = {};
  accept.forEach((ext) => {
    if (ext === '.pdf') acceptMap['application/pdf'] = ['.pdf'];
    if (ext === '.png') acceptMap['image/png'] = ['.png'];
    if (['.jpg', '.jpeg'].includes(ext)) acceptMap['image/jpeg'] = ['.jpg', '.jpeg'];
    if (ext === '.webp') acceptMap['image/webp'] = ['.webp'];
  });

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    accept: acceptMap,
    multiple,
    disabled,
  });

  const acceptText = accept.map((e) => e.toUpperCase().replace('.', '')).join(', ');

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {isDragActive ? (
          <p className="text-blue-600 font-medium">{t('dropzoneActive')}</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              {t('dropzoneIdle')}
            </p>
            <p className="text-sm text-gray-400">
              {t('supportedFormats')} {acceptText} {multiple && t('multipleFiles')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
