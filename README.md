# yunji.dev

GitHub Pages 기반 프로젝트 포트폴리오 사이트입니다.

**사이트 주소:** https://yunjizzz.github.io

## 구조

```
/
├── index.html          ← 프로젝트 목록 (랜딩 페이지)
└── review-check/       ← "이 집.. 진짜 맛집일까?" 리뷰 분석 데모
    ├── index.html
    ├── app.js
    ├── data.js
    └── styles.css
```

## 프로젝트

| 경로 | 이름 | 설명 |
|------|------|------|
| `/` | yunji.dev | 프로젝트 목록 랜딩 페이지 (라이트/다크 테마 지원) |
| `/review-check/` | 이 집.. 진짜 맛집일까? | 네이버 리뷰 데이터를 분석하여 맛집 신뢰도를 판별하는 데모 |

## 프로젝트 추가 방법

1. 루트에 새 폴더 생성 (예: `new-project/`)
2. 폴더 안에 `index.html` 배치
3. 루트 `index.html`의 `.projects` 영역에 링크 카드 추가
4. `main` 브랜치에 push하면 GitHub Pages가 자동 배포

## 개발

빌드 도구 없이 정적 파일로만 구성되어 있습니다. 로컬에서 확인하려면:

```bash
npx serve .
```
