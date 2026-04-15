# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이사 준비 도우미 (Movement) — 이사 날짜를 입력하면 시점별 체크리스트를 자동 생성하고, 이사 관련 업체 링크를 카테고리별로 보여주는 웹서비스 MVP.

## 주요 명령어

```bash
npm run dev          # 개발 서버 실행 (Turbopack)
npm run build        # 프로덕션 빌드 (TypeScript 체크 포함)
npm run lint         # ESLint 실행
npx tsc --noEmit     # 타입 체크만 실행
```

테스트 프레임워크는 아직 설정되지 않음.

## 아키텍처

- **Next.js 15** App Router + Turbopack, **React 19**, **TypeScript 5**
- **Tailwind CSS v4** — `@import "tailwindcss"` 구문 사용 (v3의 `@tailwind` 아님)
- **shadcn/ui** — `@base-ui/react` 기반 (Radix 아님). 컴포넌트: `src/components/ui/`
- Import alias: `@/*` → `./src/*`

### 데이터 흐름 (백엔드/DB 없음)

모든 데이터는 정적이거나 클라이언트 사이드:
- **정적 데이터**: `src/data/checklist-template.ts` (체크리스트 35개 항목), `src/data/vendors.ts` (업체 25개) — TypeScript 배열
- **사용자 상태**: `localStorage` — `src/lib/storage.ts`로 관리. `schemaVersion` 필드 포함
- **API Route 없음**: 모든 로직은 `src/lib/checklist.ts`에서 클라이언트 사이드로 실행

### 핵심 설계 결정

- **`--primary` 색상은 파란색** (`oklch(0.546 0.245 262.881)`) — `globals.css`의 `:root`에서 설정. 헤더 로고는 의도적으로 `text-foreground` (검정) 사용
- **체크리스트 항목은 priority 순 정렬**: high → medium → low (`getSections()` 내부)
- **지난 시점 섹션 자동 접기**: 체크리스트 로드 시 이사일 기준 이미 지난 섹션은 접힌 상태로 표시
- **업체 탭**: shadcn TabsList의 고정 높이(`h-8`)를 `!h-auto`로 오버라이드 필요
- **클라이언트 컴포넌트**: `checklist/page.tsx`, `vendors/page.tsx`는 `"use client"`. `layout.tsx`는 서버 컴포넌트
- `checklist/page.tsx`는 `useSearchParams()` 사용으로 `<Suspense>` 래핑 필수 (Next.js 15 요구사항)

### 한국어 콘텐츠

모든 UI 텍스트는 한국어. `<html lang="ko">` 설정됨. 체크리스트 템플릿과 업체 데이터 모두 한국어.
