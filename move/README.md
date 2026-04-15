# 📦 이사 도우미 (Movement)

이사 준비를 체크리스트로 한눈에 관리할 수 있는 웹서비스입니다.

## 주요 기능

- **체크리스트 자동 생성** — 이사 날짜를 입력하면 D-30 ~ D+7 시점별 할 일 목록을 자동 생성
- **진행률 관리** — 항목별 체크 + 전체 진행률 표시, 브라우저에 자동 저장
- **업체 링크 모음** — 이사업체, 청소, 인테리어, 관공서 등 카테고리별 추천 링크

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| UI | Tailwind CSS v4 + shadcn/ui |
| 언어 | TypeScript 5 |
| 상태 저장 | localStorage |
| 배포 | Vercel |

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 — 이사 날짜 입력 |
| `/checklist?date=YYYY-MM-DD` | 체크리스트 메인 — 시점별 할 일 관리 |
| `/vendors` | 업체 링크 — 카테고리별 추천 서비스 |

## 프로젝트 구조

```
src/
├── app/                 # Next.js 페이지
│   ├── layout.tsx       # 공통 레이아웃 (헤더/푸터)
│   ├── page.tsx         # 랜딩 페이지
│   ├── checklist/       # 체크리스트 페이지
│   └── vendors/         # 업체 링크 페이지
├── components/ui/       # shadcn/ui 컴포넌트
├── data/                # 정적 데이터 (체크리스트 템플릿, 업체)
├── lib/                 # 비즈니스 로직 (생성, 저장, 유틸)
└── types/               # TypeScript 타입 정의
```

## 빌드 & 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

Vercel에 연결하면 `main` 브랜치 push 시 자동 배포됩니다.

## 라이선스

MIT
