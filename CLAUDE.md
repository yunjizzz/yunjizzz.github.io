# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub Pages 기반 프로젝트 포트폴리오 사이트 (https://yunjizzz.github.io). 빌드 도구 없이 정적 파일로만 구성. `main` 브랜치에 push하면 자동 배포된다.

## Development

```bash
npx serve .
# or
python3 -m http.server
```

## Architecture

루트 `index.html`이 프로젝트 목록 랜딩 페이지이고, 각 프로젝트는 하위 폴더에 독립적으로 존재한다.

### 루트 랜딩 페이지 (`/index.html`)
- 라이트 기본 + 다크 모드 토글 (`data-theme="dark"` on `<html>`, localStorage 저장)
- 프로젝트 추가 시 `.projects` 영역에 `<a class="project">` 카드를 추가하면 된다

### review-check (`/review-check/`)
"이 집.. 진짜 맛집일까?" — 네이버 리뷰 기반 맛집 신뢰도 분석 데모.

3개 파일이 `index.html`에서 순서대로 로드된다:

1. **`data.js`** — 전역 `RESTAURANTS` 배열. 각 항목에 메타데이터와 `reviews[]` 배열. 리뷰 스키마 필드(리뷰어 활동 통계, 영수증 인증, 사진 해시, 방문 횟수 등)는 파일 상단에 문서화되어 있다.

2. **`app.js`** — 분석 로직 + DOM 렌더링:
   - 5가지 지표 함수: `reviewCredibility()` (0–100 신뢰도), `regularRatio()` (재방문 비율), `photoAuthenticity()` (사진 해시 유일성), `visitHourHistogram()` (시간대 분포), `ratingVariance()` (평점 분산)
   - `verdict()` — 종합 판정 (credibility 45%, regular 25%, photo 20% + 평점분포 보정)
   - `reviewFlag()` — 개별 리뷰 의심 태그 (체험단 의심, 찬양 단문, 편향 리뷰어, 검증된 단골)
   - 검색: `name`, `category`, `address` 대소문자 무시 부분 매칭

3. **`styles.css`** — 다크 테마 전용. CSS custom properties로 traffic-light 컬러링 (`--good`, `--warn`, `--bad`). 640px 이하 반응형.

## Key Design Decisions

- 모든 scoring 가중치/임계값은 `app.js` 함수 내부에 하드코딩. 튜닝 시 직접 수정 필요.
- 사진 해시 중복 탐지: 서로 다른 리뷰에서 동일 `photoHashes`가 반복되면 홍보용 이미지 재사용으로 판정.
- UI 언어는 전체 한국어.
- 새 프로젝트 추가: 루트에 폴더 생성 → `index.html` 배치 → 루트 `index.html`에 링크 카드 추가.
