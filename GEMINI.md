# GEMINI.md — 해봄 (haebom.app) 프로젝트 가이드

이 문서는 **해봄 (https://haebom.app / GitHub Pages: https://yunjizzz.github.io)** 저장소에서 작업할 때 항상 참고해야 하는 아키텍처, 기술 스택, 빌드/배포 절차, 공통 디자인 패턴 및 컨벤션 가이드입니다.

---

## 1. 프로젝트 개요

- **서비스명**: 해봄 (Haebom) — 직장인·일상 무료 웹 유틸리티 모음
- **도메인**: `https://haebom.app` (`yunjizzz.github.io`)
- **핵심 철학**:
  1. **가입/설치 불필요**: 링크만 열면 즉시 사용 가능
  2. **100% 클라이언트 사이드 처리**: 모든 파일(PDF, 이미지, 영상, 텍스트)은 브라우저 내에서만 처리하며 서버로 업로드하지 않음
  3. **100% 무료**: 워터마크 및 횟수 제한 없음

---

## 2. 전체 디렉토리 구조

루트 `index.html`이 전체 도구 목록을 보여주는 랜딩 페이지 역할을 하며, 각 유틸리티 및 하위 페이지는 독립된 서브 디렉토리로 구성됩니다.

```text
/
├── index.html                  # 메인 랜딩 페이지 (Hero + 도구 그리드 + 특징/제안)
├── footer.js                   # 전 페이지 공통 푸터 및 '제안하기' 모달 주입 스크립트 (다국어 지원)
├── haebom.png / flat.png       # OG 이미지 및 파비콘/에셋
├── robots.txt                  # 검색엔진 크롤링 규칙 (/private/, /resume/ 일부 차단)
├── sitemap.xml                 # 전체 URL 및 다국어 hreflang 사이트맵
├── .github/workflows/
│   └── static.yml              # main 브랜치 push 시 루트 전체(.)를 GitHub Pages에 배포
├── scripts/                    # 정적 페이지 생성기 및 유틸리티 스크립트
│   ├── gen_photo_resize.py     # /photo-resize/ 다국어·규격별 HTML 및 sitemap 자동 생성
│   ├── photo_resize_i18n.py    # 사진 용량 줄이기 다국어 문구·프리셋·FAQ 데이터
│   ├── photo_resize_template.html
│   ├── gen_pdf_compress.py     # /pdf-compress/ 다국어 HTML 및 sitemap 자동 생성
│   ├── pdf_compress_template.html
│   ├── encrypt_private.mjs     # 비공개 저장소 HTML을 PBKDF2 + AES-256-GCM으로 암호화해 /private/에 출력
│   └── kakao_notify.py / kakao_token.py
│
├── [빌드 스크립트 기반 정적 유틸리티]
├── photo-resize/               # 사진 용량 줄이기 & 증명/여권사진 규격 자르기 (ko, en 및 세부 랜딩)
│   ├── style.css               # 최신 해봄 표준 디자인 시스템 CSS (/pdf-compress/와 공유)
│   ├── app.js                  # Canvas 기반 리사이즈/크롭/용량 이분 탐색 로직
│   └── (생성된 index.html 및 하위 폴더들: 100kb/, passport/, id-photo/, en/ 등)
├── pdf-compress/               # PDF 용량 줄이기 (ko, en) — pdf.js + pdf-lib 기반 이미지 압축
│   ├── style.css               # photo-resize/style.css를 보조하는 전용 스타일
│   ├── app.js                  # PDF 페이지 렌더링 및 목표 KB 이분 탐색 압축
│   └── index.html, en/index.html
│
├── [순수 정적(Vanilla) 유틸리티]
├── text-count/                 # 글자수 세기 (index.html, app.js, i18n.js)
├── image-convert/              # 이미지 포맷 변환기 JPG/PNG/WEBP (index.html, app.js, i18n.js)
├── compress/                   # MP4 영상 압축 — WebCodecs API + MP4Box.js + mp4-muxer
├── review-check/               # 맛집 리뷰 신뢰도 분석 데모 (index.html, app.js, data.js, styles.css)
├── well-ending/                # '어느 날, 내가 없는 아침' 인터랙티브 스토리 (index.html, img/)
│
├── [Next.js 정적 Export 유틸리티]
├── pdf/                        # PDF 종합 도구 (병합, 분할, 이미지 변환, Excel 변환)
│   ├── src/                    # Next.js 16 App Router 소스코드 (ko/en/es/pt 다국어)
│   └── (_next/, index.html 등 빌드 후 루트로 복사된 정적 산출물)
├── move/                       # 이사 도우미 (D-Day 체크리스트 & 업체 모음)
│   ├── src/                    # Next.js 16 + shadcn/ui (@base-ui/react) 소스코드
│   └── (_next/, index.html, checklist.html, vendors.html 등 정적 산출물)
│
└── [개인/비공개 페이지]
    ├── resume/                 # 개인 이력서 및 포트폴리오 (robots.txt에서 민감 파일 차단)
    ├── jimin/                  # 개인 페이지/체크리스트
    └── private/                # AES-256-GCM 암호화된 비공개 페이지 (원문 커밋 절대 금지)
```

---

## 3. 기술 스택 분류

저장소 내 프로젝트는 성격에 따라 3가지 아키텍처 패턴으로 나뉩니다.

### A. 순수 Vanilla HTML/CSS/JS 유틸리티 (`/`, `/text-count/`, `/image-convert/`, `/compress/`, `/review-check/`, `/well-ending/`)
- **특징**: 별도 번들러/빌드 도구 없이 브라우저에서 즉시 실행.
- **외부 라이브러리**: 필요 시 CDN(`jsdelivr`, `cdnjs`)으로 로드.
  - `/compress/`: WebCodecs API + `mp4box@0.5.3` + `mp4-muxer` (최대 2GB, 1MB 청크 스트리밍 & 디코더 큐 백프레셔 제어)
  - `/image-convert/`: Canvas API + `jszip` (일괄 ZIP 다운로드)

### B. Python 템플릿 생성형 유틸리티 (`/photo-resize/`, `/pdf-compress/`)
- **특징**: SEO(검색어별/규격별 랜딩 페이지, 다국어 `hreflang`, JSON-LD `WebApplication` + `FAQPage` + `BreadcrumbList`) 극대화를 위해 **Python 스크립트로 정적 HTML과 `sitemap.xml`을 자동 생성**합니다.
- **주의사항**: `/photo-resize/**/index.html` 및 `/pdf-compress/**/index.html`은 **절대 직접 수정하지 말고**, 반드시 `scripts/` 내의 템플릿(`*_template.html`)이나 데이터/생성기(`photo_resize_i18n.py`, `gen_*.py`)를 수정한 뒤 생성 스크립트를 실행해야 합니다.
  ```bash
  python3 scripts/gen_photo_resize.py
  python3 scripts/gen_pdf_compress.py
  ```

### C. Next.js 정적 Export 앱 (`/pdf/`, `/move/`)
- **공통 스택**: **Next.js 16** (App Router) + **React 19** + **TypeScript 5** + **Tailwind CSS v4** (`@import "tailwindcss"`).
- **설정 (`next.config.ts`)**: `output: "export"`, 각 폴더 경로에 맞춘 `basePath` (`"/pdf"`, `"/move"`).
- **`/pdf/` 주요 패키지**: `pdf-lib`, `pdfjs-dist`, `jszip`, `file-saver`, `xlsx`. 라우트 그룹 `(ko)` 및 `(intl)/[locale]`로 4개 국어(ko, en, es, pt) 지원.
- **`/move/` 주요 패키지**: `shadcn/ui` (`@base-ui/react` 기반, Radix 아님), `lucide-react`. 상태는 `localStorage`(`src/lib/storage.ts`)로 관리. `useSearchParams()` 사용 페이지는 `<Suspense>` 래핑 필수.

---

## 4. 빌드 및 GitHub Pages 배포 방식

### GitHub Actions 워크플로우 (`.github/workflows/static.yml`)
- `main` 브랜치에 push되면 별도의 빌드 과정 없이 **저장소 루트(`path: '.'`) 전체를 그대로 GitHub Pages 아티팩트로 업로드하여 배포**합니다.

### 작업 유형별 빌드 & 배포 절차
1. **순수 정적 페이지 (`/`, `/text-count/`, `/compress/` 등)**
   - 파일 수정 후 바로 커밋 & `main` push.
   - 로컬 테스트: 루트에서 `npx serve .` 또는 `python3 -m http.server`.
2. **Python 템플릿 기반 페이지 (`/photo-resize/`, `/pdf-compress/`)**
   - `scripts/` 수정 → `python3 scripts/gen_photo_resize.py` (또는 `gen_pdf_compress.py`) 실행 → 생성된 HTML 및 갱신된 `sitemap.xml`을 함께 커밋.
3. **Next.js 프로젝트 (`/pdf/`, `/move/`)**
   - GitHub Actions가 `npm run build`를 대신 실행하지 않으므로, **로컬에서 빌드 후 `out/` 디렉토리 내부 결과물을 해당 서브 프로젝트 루트(`/pdf/` 또는 `/move/`)에 복사하여 커밋**해야 합니다.
   ```bash
   # 예: pdf 또는 move 빌드 반영
   cd pdf && npm run build
   cp -r out/* .
   ```

---

## 5. 유틸리티 페이지 공통 디자인 패턴 및 컨벤션

새 유틸리티를 만들거나 기존 페이지를 개선할 때 다음 디자인 시스템과 필수 규칙을 준수합니다.

### 5.1. 컬러 시스템 (에메랄드 그린 테마)
해봄의 브랜드 컬러는 **에메랄드 그린(`#10b981`)**과 서브 **시안(`#06b6d4`)**입니다 (`/move/`만 예외적으로 블루 테마 사용).
최신 표준 토큰(`index.html`, `photo-resize/style.css` 기준):

| 토큰 | 라이트 모드 (`:root`) | 다크 모드 (`[data-theme="dark"]`) | 용도 |
| :--- | :--- | :--- | :--- |
| `--bg` | `#fafdfb` (또는 `#f7fdf9`) | `#09100d` | 페이지 기본 배경 |
| `--bg-soft` | `#f0f8f4` (또는 `#edf7f2`) | `#101915` | 보조 배경, 세그먼트 컨트롤/리스트 아이템 배경 |
| `--card` | `#ffffff` | `#121c17` | 카드, 패널, 모달 표면 |
| `--border` | `#e2efe8` (또는 `#d0eadf`) | `#1f3028` | 기본 테두리 및 구분선 |
| `--border-strong` | `#cfe5d9` | `#2a4036` | 강조 테두리, 드롭존 점선 |
| `--text` | `#0f1a14` (또는 `#111c16`) | `#ecf3ef` | 본문 및 제목 텍스트 |
| `--muted` | `#5d7469` (또는 `#607a6e`) | `#8aa196` | 부제목, 설명, 캡션 텍스트 |
| `--accent` | `#10b981` | `#34d399` | 메인 브랜드 포인트, 기본 버튼, 활성 상태 |
| `--accent-hover` | `#059669` | `#10b981` | 버튼 호버 상태 |
| `--accent-soft` | `rgba(16, 185, 129, 0.1)` | `rgba(52, 211, 153, 0.14)` | 뱃지, 아이콘 배경, 선택된 항목 배경 |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | 동일 | 공통 트랜지션/애니메이션 이징 |

### 5.2. 타이포그래피 및 한국어 조판
- **폰트**: 최신 페이지(`/`, `/photo-resize/`, `/pdf-compress/`)는 **Pretendard Variable** CDN을 사용하며, 일부 초기 페이지는 `Noto Sans KR`을 사용합니다. 신규 제작 시 Pretendard Variable 권장:
  ```html
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
  ```
- **한글 줄바꿈**: 제목과 설명 문구에는 `word-break: keep-all`을 적용해 단어가 중간에 끊기지 않도록 합니다.

### 5.3. 레이아웃 & UI 컴포넌트 패턴
1. **상단 고정 헤더 (`.header` / `.page-header`)**
   - 높이 `60px`(`--header-h`), `position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12~14px)`.
   - 좌측: 홈(`/`)으로 이동하는 브랜드 로고(초록색 체크 박스 아이콘 + `해봄`) 또는 뒤로가기 링크 + 현재 도구 이름(`.crumb` 또는 `.header-title`).
   - 우측: 다국어 선택(`<select id="lang-select">`) 및 다크 모드 토글 버튼(`#theme-toggle`).
2. **프라이버시 안심 배너 / Eyebrow**
   - 도구 상단(히어로 영역 `.eyebrow` 또는 `.privacy-banner`)에 **"업로드 없이, 이 브라우저에서만 안전하게"** / **"파일이 서버로 전송되지 않습니다"** 문구를 명시해 사용자 신뢰를 확보합니다.
3. **도구 작업 영역**
   - **단일 컬럼형** (`max-width: 760px`, 예: `text-count`, `image-convert`, `compress`): 상단 입력/드롭존 → 옵션 카드 → 실행 버튼 → 결과 리스트.
   - **2컬럼 분할형** (`max-width: 1080px`, `.tool` 그리드, 예: `photo-resize`, `pdf-compress`): 좌측(`.pane-left`)에 드롭존·파일목록·미리보기/크롭 캔버스, 우측(`aside.panel`, sticky)에 번호가 매겨진 단계별 설정(`.step-no` 1, 2, 3) + 요약(`.summary`) + 변환 버튼(`.convert-btn`).
4. **파일 드롭존 (`.dropzone`)**
   - `2px dashed` 테두리, 호버 및 `dragover` 시 `--accent` 테두리 + `--accent-soft` 배경 하이라이트.
   - 파일이 추가된 후에는 `.dropzone.compact` 클래스로 높이를 줄여 화면 공간을 절약하는 패턴 사용.
5. **공통 푸터 및 제안 모달 (`/footer.js`)**
   - 모든 정적 HTML 페이지의 `</body>` 직전에 `<script src="/footer.js"></script>`를 포함합니다.
   - `<html lang="...">` 속성(MutationObserver 감지) 또는 `localStorage.getItem('lang')`을 읽어 한국어(`ko`), 영어(`en`), 스페인어(`es`), 포르투갈어(`pt`), 인도네시아어(`id`)로 푸터와 '제안하기' 모달을 자동 렌더링합니다.

### 5.4. 필수 메타데이터, SEO, 애널리틱스 규칙
모든 페이지 생성/수정 시 아래 항목이 누락되지 않았는지 반드시 확인합니다:
1. **Google Analytics (필수)**: 측정 ID `G-Y644EYN1VZ`
   - 정적 HTML: `<head>` 내부에 `gtag.js` 스크립트 삽입.
   - Next.js: `layout.tsx`의 `<body>` 내부에 `<Script strategy="afterInteractive" ... />`로 삽입.
2. **파비콘**: 인라인 SVG 데이터 URI 파비콘(`#10b981` 배경 + 흰색 체크 아이콘) 공통 사용.
3. **SEO 태그**: `<link rel="canonical" href="https://haebom.app/..." />`, Open Graph (`og:title`, `og:description`, `og:url`, `og:image`), Twitter Card, JSON-LD 구조화 데이터(`@type: "WebApplication"` 등).
4. **용량 계산 기준**: 파일 크기 제한이 있는 도구(`photo-resize`, `pdf-compress` 등)는 접수처 호환성을 위해 **1KB = 1,000 bytes** 기준으로 계산합니다.

---

## 6. 새 유틸리티 추가 체크리스트

새로운 도구(예: `/new-tool/`)를 추가할 때는 아래 순서를 따릅니다:

1. **폴더 및 페이지 생성**: `/new-tool/index.html` 생성 (공통 디자인 토큰, GA4 `G-Y644EYN1VZ`, JSON-LD, `<script src="/footer.js"></script>` 적용).
2. **메인 랜딩 페이지(`/index.html`) 등록**:
   - `#tools` 섹션의 `.grid` 안에 `<a class="card reveal" href="/new-tool/" data-category="work|daily">` 카드 추가 (`NEW` 또는 `LIVE` 배지, 카드는 상단/앞쪽에 배치).
   - 필요 시 Hero 영역의 `.chips`에 바로가기 칩 추가.
3. **사이트맵(`/sitemap.xml`) 업데이트**: 새 도구 URL을 `<urlset>`에 추가.
4. **문서 업데이트**: `README.md`, `CLAUDE.md`, `GEMINI.md`의 프로젝트 목록 표 갱신.
