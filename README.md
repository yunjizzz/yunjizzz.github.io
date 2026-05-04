# 해봄 (haebom.app)

일상 업무에 필요한 다양한 무료 유틸리티 사이트입니다. 회원가입 없이 바로 사용할 수 있습니다.

**사이트 주소:** https://haebom.app (GitHub Pages: https://yunjizzz.github.io)

## 구조

```
/
├── index.html              ← 프로젝트 목록 (랜딩 페이지)
├── pdf/                    ← PDF 도구 (Next.js)
│   └── src/
├── review-check/           ← 맛집 리뷰 분석 데모
│   ├── index.html
│   ├── app.js
│   ├── data.js
│   └── styles.css
├── move/                   ← 이사 도우미 (Next.js)
│   └── src/
├── robots.txt
└── sitemap.xml
```

## 프로젝트

| 경로 | 이름 | 설명 | 기술 스택 |
|------|------|------|-----------|
| `/` | 해봄 | 프로젝트 목록 랜딩 페이지 (라이트/다크 테마) | HTML/CSS/JS |
| `/pdf/` | PDF 도구 | PDF 병합, 분할, 이미지 변환 (브라우저 내 처리) | Next.js 16, pdf-lib, pdfjs-dist |
| `/review-check/` | 이 집.. 진짜 맛집일까? | 네이버 리뷰 데이터 기반 맛집 신뢰도 분석 | HTML/CSS/JS |
| `/move/` | 이사 도우미 | 이사 날짜 기반 체크리스트 자동 생성 & 업체 모음 | Next.js 16, shadcn/ui |

## 개발 서버 실행

### 루트 사이트 (정적 파일)

```bash
npx serve .
# or
python3 -m http.server
```

### PDF 도구 (`/pdf/`)

```bash
cd pdf
npm install        # 최초 1회
npm run dev        # 개발 서버 (http://localhost:3000/pdf)
npm run build      # 정적 빌드
npm run lint       # ESLint
```

### 이사 도우미 (`/move/`)

```bash
cd move
npm install        # 최초 1회
npm run dev        # 개발 서버 (http://localhost:3000/move)
npm run build      # 정적 빌드
npm run lint       # ESLint
npx tsc --noEmit   # 타입 체크만
```

## 배포

`main` 브랜치에 push하면 GitHub Actions(`static.yml`)가 자동 배포합니다.

Next.js 프로젝트(pdf, move)는 빌드 후 `out/` 결과물을 해당 프로젝트 루트에 복사해야 GitHub Pages에서 서빙됩니다.

## 프로젝트 추가 방법

1. 루트에 새 폴더 생성 (예: `new-project/`)
2. 폴더 안에 `index.html` 배치
3. 루트 `index.html`의 `.projects` 영역에 링크 카드 추가
4. `main` 브랜치에 push하면 자동 배포
