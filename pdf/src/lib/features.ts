import { FeatureInfo } from '@/types';

export const features: FeatureInfo[] = [
  {
    id: 'pdf-merge',
    title: 'PDF 병합',
    description: '여러 PDF 파일을 하나로 합칩니다',
    acceptedFiles: ['.pdf'],
    multiple: true,
  },
  {
    id: 'pdf-to-image',
    title: 'PDF → 이미지',
    description: 'PDF 페이지를 PNG 이미지로 변환합니다',
    acceptedFiles: ['.pdf'],
    multiple: false,
  },
  {
    id: 'image-to-pdf',
    title: '이미지 → PDF',
    description: '여러 이미지를 하나의 PDF로 만듭니다',
    acceptedFiles: ['.png', '.jpg', '.jpeg', '.webp'],
    multiple: true,
  },
  {
    id: 'pdf-split',
    title: 'PDF 분할',
    description: '특정 페이지만 추출하여 새 PDF를 만듭니다',
    acceptedFiles: ['.pdf'],
    multiple: false,
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF → Excel',
    description: 'PDF의 표 데이터를 Excel 파일로 변환합니다',
    acceptedFiles: ['.pdf'],
    multiple: false,
  },
];
