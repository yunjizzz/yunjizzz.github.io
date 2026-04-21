'use client';

import { ProcessingState } from '@/types';

interface ProcessingStatusProps {
  state: ProcessingState;
}

export function ProcessingStatus({ state }: ProcessingStatusProps) {
  if (state.status === 'idle') return null;

  return (
    <div className="mt-6">
      {state.status === 'processing' && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-blue-700 font-medium">
            {state.message || '처리 중...'}
          </span>
        </div>
      )}

      {state.status === 'done' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-700 font-medium">
            {state.message || '완료되었습니다!'}
          </span>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-700 font-medium">
            {state.message || '오류가 발생했습니다'}
          </span>
        </div>
      )}
    </div>
  );
}
