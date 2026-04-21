# PDF 도구

브라우저에서 바로 PDF를 변환하고 편집할 수 있는 웹 유틸리티입니다.
모든 파일 처리는 클라이언트(브라우저)에서 이루어지며, 서버에 업로드되지 않습니다.

## 핵심 기능

| 기능 | 설명 |
|------|------|
| PDF 병합 | 여러 PDF 파일을 하나로 합치기 |
| PDF → 이미지 | PDF 각 페이지를 PNG/JPG로 변환 |
| 이미지 → PDF | 여러 이미지를 하나의 PDF로 합치기 |
| PDF 분할 | 특정 페이지 범위만 추출 |

## 실행 방법

```bash
# 패키지 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build
```

## 기술 스택

- **Next.js 16** (App Router, Static Export)
- **TypeScript**
- **Tailwind CSS v4**
- **pdf-lib** — PDF 생성/병합/분할
- **pdfjs-dist** — PDF → 이미지 렌더링
- **react-dropzone** — 드래그 앤 드롭 파일 업로드
- **file-saver** — 파일 다운로드
- **jszip** — 여러 이미지 ZIP 다운로드

## 폴더 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지 (기능 탭 + 라우팅)
│   └── globals.css         # 글로벌 스타일
├── components/             # 공통 컴포넌트
│   ├── FileDropzone.tsx    # 드래그 앤 드롭 업로드 영역
│   ├── FileList.tsx        # 선택된 파일 목록
│   └── ProcessingStatus.tsx # 처리 상태 표시
├── features/               # 기능별 모듈
│   ├── pdf-merge/          # PDF 병합
│   ├── pdf-to-image/       # PDF → 이미지
│   ├── image-to-pdf/       # 이미지 → PDF
│   └── pdf-split/          # PDF 분할
├── lib/                    # 유틸리티
│   ├── features.ts         # 기능 정의 데이터
│   └── pdf-utils.ts        # PDF 처리 핵심 로직
└── types/                  # TypeScript 타입 정의
    └── index.ts
```

## 배포

GitHub Pages 정적 배포용으로 설정되어 있습니다.

```bash
npm run build
# out/ 폴더가 생성됨
```

`next.config.ts`에 `basePath: "/pdf"`가 설정되어 있어 `https://yunjizzz.github.io/pdf/`에서 서빙됩니다.

## 추후 개선 포인트

- PDF 압축 (파일 크기 줄이기)
- PDF 페이지 회전
- PDF 워터마크 추가
- 드래그로 파일 순서 변경 (병합 시)
- PDF 미리보기 (변환 전 페이지 썸네일)
- 다크 모드 지원
- PWA 지원 (오프라인 사용)
- 다국어 지원
