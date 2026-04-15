# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub Pages 기반 프로젝트 포트폴리오 사이트 (https://yunjizzz.github.io). `main` 브랜치에 push하면 GitHub Actions(`static.yml`)가 자동 배포한다. UI 언어는 전체 한국어.

## Development

```bash
# 루트 사이트 (정적 파일)
npx serve .
# or
python3 -m http.server

# move 프로젝트 (Next.js)
cd move && npm run dev          # Turbopack 개발 서버
cd move && npm run build        # 정적 빌드 (output: "export")
cd move && npm run lint         # ESLint
cd move && npx tsc --noEmit     # 타입 체크만
```

move 프로젝트 빌드 후 `move/out/` 결과물을 `move/` 루트에 복사해야 GitHub Pages에서 서빙된다.

## Architecture

루트 `index.html`이 프로젝트 목록 랜딩 페이지이고, 각 프로젝트는 하위 폴더에 독립적으로 존재한다.

### 루트 랜딩 페이지 (`/index.html`)
- 순수 HTML/CSS/JS (빌드 도구 없음), 인라인 스타일 + 스크립트
- 라이트 기본 + 다크 모드 토글 (`data-theme="dark"` on `<html>`, localStorage 저장)
- Canvas 파티클 배경 애니메이션 (마우스 인터랙션)
- 프로젝트 추가 시 `.projects` 영역에 `<a class="project">` 카드를 추가하면 된다

### review-check (`/review-check/`)
"이 집.. 진짜 맛집일까?" — 네이버 리뷰 기반 맛집 신뢰도 분석 데모. 순수 정적 파일 3개 구성.

1. **`data.js`** — 전역 `RESTAURANTS` 배열. 각 항목에 메타데이터와 `reviews[]` 배열. 리뷰 스키마 필드는 파일 상단에 문서화.

2. **`app.js`** — 분석 로직 + DOM 렌더링:
   - 5가지 지표: `reviewCredibility()` (0–100), `regularRatio()`, `photoAuthenticity()`, `visitHourHistogram()`, `ratingVariance()`
   - `verdict()` — 종합 판정 (credibility 45%, regular 25%, photo 20% + 평점분포 보정)
   - `reviewFlag()` — 개별 리뷰 의심 태그
   - 검색: `name`, `category`, `address` 대소문자 무시 부분 매칭

3. **`styles.css`** — CSS custom properties 기반 테마. traffic-light 컬러링 (`--good`, `--warn`, `--bad`). 640px 이하 반응형.

### move (`/move/`)
이사 도우미 — 이사 날짜 기반 체크리스트 자동 생성 & 업체 링크 모음.

- **Next.js 16** App Router + **React 19** + **TypeScript 5** + **Tailwind CSS v4** (`@import "tailwindcss"` 구문)
- **shadcn/ui** — `@base-ui/react` 기반 (Radix 아님). 컴포넌트: `src/components/ui/`
- `next.config.ts`: `output: "export"` + `basePath: "/move"` (GitHub Pages 정적 배포용)
- Import alias: `@/*` → `./src/*`

**데이터 흐름 (백엔드/DB 없음):**
- 정적 데이터: `src/data/checklist-template.ts` (35개 항목), `src/data/vendors.ts` (25개 업체)
- 사용자 상태: `localStorage` — `src/lib/storage.ts`로 관리 (`schemaVersion` 필드 포함)
- 핵심 로직: `src/lib/checklist.ts` — `generateChecklist()`, `getSections()`, `getProgress()`, `toggleItem()`

**페이지 구조:**
- `/` (page.tsx) — 이사 날짜 입력 → `/checklist?date=` 라우팅
- `/checklist` (page.tsx) — D-30~D+7 시점별 체크리스트, `useSearchParams()` 사용으로 `<Suspense>` 래핑 필수
- `/vendors` (page.tsx) — 카테고리별 업체 탭 (이사업체, 청소, 인테리어, 관공서)
- `layout.tsx`는 서버 컴포넌트, 나머지 페이지는 `"use client"`

## Key Design Decisions

- 모든 scoring 가중치/임계값은 `app.js` 함수 내부에 하드코딩. 튜닝 시 직접 수정 필요.
- 사진 해시 중복 탐지: 서로 다른 리뷰에서 동일 `photoHashes`가 반복되면 홍보용 이미지 재사용으로 판정.
- move 프로젝트: 체크리스트 항목은 priority 순 정렬 (high → medium → low). 이사일 기준 지난 섹션은 자동 접힘.
- move 프로젝트: primary 색상은 파란색 (`oklch(0.546 0.245 262.881)`). 헤더 로고는 의도적으로 `text-foreground` 사용.
- 새 프로젝트 추가: 루트에 폴더 생성 → `index.html` 배치 → 루트 `index.html`에 링크 카드 추가.
