export type FeatureType = 'pdf-merge' | 'pdf-to-image' | 'image-to-pdf' | 'pdf-split';

export interface FeatureInfo {
  id: FeatureType;
  title: string;
  description: string;
  acceptedFiles: string[];
  multiple: boolean;
}

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
  progress?: number;
  message?: string;
}

export interface FileWithPreview extends File {
  preview?: string;
}
