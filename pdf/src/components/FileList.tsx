'use client';

import { useTranslation } from "@/lib/i18n-context";

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileList({ files, onRemove }: FileListProps) {
  const { t } = useTranslation();

  if (files.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium text-gray-700">
        {t('selectedFiles')} ({files.length}{t('fileUnit')})
      </p>
      <ul className="space-y-1">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${index}`}
            className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-700 truncate">{file.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{formatSize(file.size)}</span>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
