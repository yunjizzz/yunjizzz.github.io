# 💡 해봄 (haebom.app) 주간 유틸리티 아이디어 리포트

> 매주 월요일 오전 6시(KST) GitHub Actions와 Gemini (`google_search` 그라운딩)가 **전 세계(글로벌) 및 한국 검색 트렌드**를 분석하여, **수요 대비 공급이 부족하고 100% 브라우저 로컬 처리로 구현 가능한 신규 웹 유틸리티 아이디어들**을 상단에 누적 기록합니다.

---

## 📅 2026-11-13 주간 유틸리티 아이디어 리포트

### 1. 텍스트 대소문자 변환기 (`/text-case-converter/`) — ⭐ 추천도: 상 (예상 트래픽: 매우 높음 / 구현 난이도: 하)
- **추천 분류**: `일상`
- **한 줄 요약**: 대문자, 소문자, 문장 시작 대문자, 각 단어 첫 글자 대문자, 카멜 케이스, 스네이크 케이스 등 다양한 텍스트 대소문자 형식을 브라우저 내에서 즉시 변환하여 복사 또는 다운로드할 수 있는 도구입니다. 글 작성, 코드 변수명 통일 등 일상 및 업무에서 자주 발생하는 텍스트 형식 변경 니즈를 서버 업로드 없이 안전하고 빠르게 해결합니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `case converter online free`, `text capitalization tool no upload`, `uppercase lowercase converter browser`, `camelcase snakecase converter client side` (전 세계 학생, 작가, 개발자, 일반 사용자)
  - **한국 (KO)**: `대소문자 변환기`, `텍스트 케이스 변경`, `영문 대문자 소문자 변환`, `카멜 케이스 스네이크 케이스 변환`
- **수요 대비 공급 분석**: 전 세계적으로 글쓰기, 코딩, 데이터 입력 등 다양한 상황에서 텍스트의 대소문자 형식을 빠르게 변경해야 할 필요가 많습니다. 기존 웹 서비스들은 대부분 서버 업로드를 요구하거나, 불필요한 광고, 사용 제한 등의 불편함이 있습니다. 해봄은 100% 클라이언트 사이드 처리로 개인정보 유출 걱정 없이 빠르고 무제한으로 다양한 케이스(Sentence case, Title Case, UPPERCASE, lowercase, Capitalized Case, aLtErNaTiNg cAsE, InVeRsE cAsE, camelCase, snake_case, kebab-case 등)를 지원하여 사용자 만족도를 높일 수 있습니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: 순수 JavaScript의 문자열 처리(String.prototype.toLowerCase(), toUpperCase(), replace(), split(), map(), join() 등) 및 DOM 조작으로 충분히 구현 가능합니다. 별도의 Web API나 복잡한 라이브러리 없이도 높은 성능을 낼 수 있습니다.
  - **다국어 SEO & 핵심 UX**: `/text-case-converter/ko`, `/text-case-converter/en` 등으로 랜딩 페이지를 구성하고, 각 언어별로 핵심 키워드를 최적화합니다. 직관적인 버튼 UI로 다양한 케이스 변환을 원클릭으로 제공하고, 실시간 미리 보기와 원본 복원 기능을 추가하여 UX를 강화합니다.

### 2. 텍스트 중복 라인 제거기 (`/text-deduplicator/`) — ⭐ 추천도: 상 (예상 트래픽: 높음 / 구현 난이도: 하)
- **추천 분류**: `업무`
- **한 줄 요약**: 긴 텍스트 목록이나 코드, 데이터에서 중복되는 줄을 효율적으로 찾아 제거하고, 고유한 줄만 남겨주어 데이터 정리 및 분석 작업을 간소화하는 브라우저 기반 유틸리티입니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `remove duplicate lines text online free`, `deduplicate text client side`, `unique lines extractor browser`, `text list cleaner no upload` (개발자, 데이터 분석가, 마케터, 학생, 일반 사용자)
  - **한국 (KO)**: `중복 라인 제거`, `텍스트 중복 제거`, `줄 중복 없애기`, `고유한 텍스트 추출`
- **수요 대비 공급 분석**: 로그 파일, 이메일 목록, 코드 스니펫, 데이터 리스트 등에서 중복된 정보를 제거해야 하는 경우가 빈번합니다. 기존 온라인 도구들은 서버 업로드를 요구하거나, 고급 옵션이 부족하여 사용자들이 불편함을 느낍니다. 해봄은 클라이언트 사이드에서 대소문자 구분, 공백 제거, 순서 유지, 연속 중복 제거, 완전 고유 라인 남기기 등 세밀한 옵션을 제공하여 데이터 프라이버시를 완벽하게 보호하면서 사용자 만족도를 높일 수 있습니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: JavaScript의 `Set` 객체를 활용한 효율적인 중복 제거 로직과 `String.prototype.split('
')`, `Array.prototype.filter()`, `Array.prototype.map()` 등의 배열 및 문자열 메서드를 통해 구현합니다.
  - **다국어 SEO & 핵심 UX**: `/text-deduplicator/ko`, `/text-deduplicator/en` 등의 랜딩 페이지를 구축하고, 다양한 옵션(Case Sensitive, Trim Spaces, Keep First/Last, Remove Empty Lines)을 체크박스 또는 토글로 제공하여 사용자가 원하는 방식으로 중복을 처리할 수 있도록 직관적인 UX를 제공합니다.

### 3. 파일 해시 계산기 (`/file-hash-calculator/`) — ⭐ 추천도: 상 (예상 트래픽: 높음 / 구현 난이도: 중)
- **추천 분류**: `업무`
- **한 줄 요약**: 다운로드한 파일의 무결성 검증, 데이터 변조 여부 확인 등을 위해 MD5, SHA1, SHA256, SHA512 등 다양한 암호화 해시 값을 브라우저 내에서 안전하게 계산해주는 도구입니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `file hash calculator online free no upload`, `checksum generator client side`, `MD5 SHA256 browser tool`, `verify file integrity offline` (개발자, 보안 전문가, 일반 사용자)
  - **한국 (KO)**: `파일 해시 계산기`, `체크섬 확인`, `MD5 SHA256 생성`, `파일 무결성 검사`
- **수요 대비 공급 분석**: 소프트웨어 다운로드 후 원본 파일과 일치하는지 확인하거나, 중요한 문서의 변조 여부를 검증할 때 해시 값 비교는 필수적입니다. 기존 온라인 해시 계산기는 파일을 서버에 업로드해야 하는 경우가 많아 보안에 민감한 사용자들에게 큰 부담이 됩니다. 해봄은 Web Crypto API와 WebAssembly를 활용하여 파일을 서버에 전송하지 않고 브라우저 내에서 모든 계산을 수행함으로써, 빠르고 안전하며 개인정보 보호에 완벽한 솔루션을 제공합니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: `Web Crypto API` (특히 `crypto.subtle.digest()` for SHA-*, MD5는 WASM 라이브러리 또는 JS 구현) 및 `File API` (`FileReader` for large files)를 활용하여 대용량 파일도 처리 가능하게 합니다. WebAssembly를 사용하여 성능 최적화도 고려합니다.
  - **다국어 SEO & 핵심 UX**: `/file-hash-calculator/ko`, `/file-hash-calculator/en` 등으로 랜딩 페이지를 구축하고, 드래그 앤 드롭으로 파일을 쉽게 추가할 수 있도록 합니다. 여러 해시 알고리즘을 동시에 계산하고 결과를 명확하게 표시하며, 한 번의 클릭으로 해시 값을 복사할 수 있는 기능을 제공합니다.

### 4. UUID 생성기 (`/uuid-generator/`) — ⭐ 추천도: 상 (예상 트래픽: 중간 / 구현 난이도: 하)
- **추천 분류**: `업무`
- **한 줄 요약**: 개발자 및 시스템 관리자가 분산 시스템에서 고유한 식별자를 생성할 때 필요한 UUID(Universally Unique Identifier)를 다양한 버전(v1, v4, v7) 및 형식으로 브라우저 내에서 빠르고 안전하게 생성하는 도구입니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `UUID generator online free`, `client side UUID v4 generator`, `UUID v7 browser`, `cryptographically secure UUID no upload`, `GUID generator` (개발자, 시스템 관리자)
  - **한국 (KO)**: `UUID 생성기`, `고유 ID 만들기`, `GUID 생성`, `랜덤 UUID`
- **수요 대비 공급 분석**: 개발 과정에서 데이터베이스 키, API 토큰, 세션 ID 등 고유한 식별자가 필요한 경우가 많습니다. 특히 보안이 중요한 환경에서는 암호학적으로 안전한 UUID 생성이 요구됩니다. 기존 온라인 도구 중 일부는 서버 의존적이거나, 모든 UUID 버전을 지원하지 않는 경우가 있습니다. 해봄은 Web Crypto API를 사용하여 100% 클라이언트 사이드에서 암호학적으로 안전한 UUID v4/v7을 포함한 다양한 버전과 NanoID, GUID까지 지원하여 개발자들의 니즈를 충족시킬 수 있습니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: `Web Crypto API`의 `crypto.randomUUID()`를 활용하여 UUID v4를 생성하고, 타임스탬프 기반 UUID v7 또는 다른 버전은 JavaScript 라이브러리(예: `uuid` 라이브러리의 클라이언트 사이드 번들 버전)를 통해 구현합니다.
  - **다국어 SEO & 핵심 UX**: `/uuid-generator/ko`, `/uuid-generator/en` 등으로 랜딩 페이지를 구성하고, 원하는 UUID 버전 및 생성 개수, 대소문자/하이픈 포함 여부 등의 옵션을 선택하여 즉시 생성하고 복사할 수 있는 간결한 UI를 제공합니다.

### 5. 마크다운-HTML 변환기 (`/markdown-to-html/`) — ⭐ 추천도: 중 (예상 트래픽: 중간 / 구현 난이도: 중)
- **추천 분류**: `업무`
- **한 줄 요약**: 마크다운(Markdown) 문법으로 작성된 텍스트를 웹 페이지에 바로 사용할 수 있는 HTML 코드로 변환하고 실시간 미리 보기를 제공하여, 콘텐츠 제작 및 웹 퍼블리싱 작업을 효율적으로 돕는 도구입니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `markdown to html converter online free`, `live markdown preview browser`, `GFM to HTML client side`, `convert md to html no upload` (블로거, 개발자, 기술 문서 작성자, 콘텐츠 마케터)
  - **한국 (KO)**: `마크다운 HTML 변환`, `MD HTML 변환기`, `마크다운 미리보기`, `마크다운 웹 변환`
- **수요 대비 공급 분석**: 기술 블로그, GitHub README, 온라인 문서 등 마크다운으로 콘텐츠를 작성하는 경우가 많지만, 최종적으로 웹에 게시하기 위해 HTML 변환이 필요합니다. 기존 변환기들은 서버 업로드 방식이거나, 라이브 미리 보기 기능이 부족하거나, GitHub Flavored Markdown(GFM)과 같은 확장 문법을 제대로 지원하지 않는 경우가 있습니다. 해봄은 클라이언트 사이드에서 작동하며 실시간 미리 보기와 GFM 지원으로 사용자들이 빠르고 편리하게 고품질의 HTML을 얻을 수 있도록 합니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: JavaScript 마크다운 파서 라이브러리(예: `marked.js` 또는 `markdown-it`)를 사용하여 마크다운을 HTML로 변환합니다. `DOMPurify`와 같은 라이브러리로 XSS 공격 방지를 위한 HTML 새니타이징 기능을 추가할 수 있습니다.
  - **다국어 SEO & 핵심 UX**: `/markdown-to-html/ko`, `/markdown-to-html/en` 등의 랜딩 페이지를 구축하고, 좌측에는 마크다운 입력창, 우측에는 실시간 HTML 미리 보기 및 생성된 HTML 코드 탭을 두어 직관적인 편집 환경을 제공합니다. 파일 업로드 및 다운로드 기능도 포함합니다.

### 6. 동영상 자르기 & 회전하기 (`/video-cropper-rotator/`) — ⭐ 추천도: 중 (예상 트래픽: 중간 / 구현 난이도: 중~상)
- **추천 분류**: `일상`
- **한 줄 요약**: 동영상 파일을 원하는 비율로 자르거나(Crop), 가로/세로로 회전(Rotate) 및 뒤집기(Flip)하여 소셜 미디어 업로드, 개인 소장 등을 위한 편집을 브라우저 내에서 안전하게 수행하는 도구입니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `crop video online free no upload`, `rotate video browser client side`, `flip video online private`, `video aspect ratio changer` (소셜 미디어 사용자, 콘텐츠 크리에이터, 일반 사용자)
  - **한국 (KO)**: `동영상 자르기`, `영상 회전`, `동영상 크롭`, `비디오 뒤집기`
- **수요 대비 공급 분석**: 스마트폰으로 촬영한 동영상을 인스타그램, 틱톡, 유튜브 쇼츠 등 다양한 플랫폼에 맞게 편집해야 하는 경우가 많습니다. 특히 세로로 찍힌 영상을 가로로 회전하거나 특정 부분만 잘라내야 할 때, 대다수의 온라인 서비스는 서버 업로드를 강제하거나 워터마크, 유료 결제 등을 요구합니다. 해봄은 WebCodecs API와 WebAssembly 기반 FFmpeg 구현을 통해 동영상을 서버 업로드 없이 브라우저 내에서 처리하여 개인정보 보호와 속도 면에서 강력한 차별점을 제공합니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: `WebCodecs API`를 활용하여 동영상을 디코딩 및 인코딩하고, `WebAssembly` 기반 FFmpeg 포트를 사용하여 더 넓은 코덱 지원 및 안정적인 처리를 보장합니다. `Canvas API`를 통해 미리 보기 및 크롭 영역 선택을 구현합니다.
  - **다국어 SEO & 핵심 UX**: `/video-cropper-rotator/ko`, `/video-cropper-rotator/en` 등으로 랜딩 페이지를 구성하고, 직관적인 드래그 앤 드롭 크롭 박스, 1:1, 9:16, 16:9 등 다양한 종횡비 프리셋, 원클릭 회전/뒤집기 버튼, 실시간 미리 보기 기능을 제공하여 사용자 편의성을 극대화합니다.

### 7. JSON-YAML 상호 변환기 (`/json-yaml-converter/`) — ⭐ 추천도: 중 (예상 트래픽: 중간 / 구현 난이도: 중)
- **추천 분류**: `업무`
- **한 줄 요약**: JSON(JavaScript Object Notation)과 YAML(YAML Ain't Markup Language) 데이터를 상호 변환하여 개발자, DevOps 엔지니어, 데이터 분석가 등이 설정 파일, API 명세 등을 다루는 작업을 용이하게 하는 클라이언트 사이드 도구입니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `JSON to YAML converter online no upload`, `YAML to JSON browser client side`, `OpenAPI spec converter`, `config file format changer` (개발자, DevOps 엔지니어, 시스템 관리자)
  - **한국 (KO)**: `JSON YAML 변환기`, `YAML JSON 변환`, `오픈API YAML`, `쿠버네티스 YAML`
- **수요 대비 공급 분석**: JSON과 YAML은 설정 파일, API 명세(OpenAPI/Swagger), 데이터 교환 등 IT 분야에서 널리 사용되는 데이터 직렬화 형식입니다. 많은 개발자가 두 형식 간의 변환을 자주 필요로 하지만, 기존 온라인 변환기는 서버 업로드를 요구하거나, 복잡한 UI, 기능 제한 등의 문제가 있습니다. 해봄은 100% 클라이언트 사이드에서 작동하며, 양방향 변환, 들여쓰기 옵션, 플로우 배열 지원 등 개발자들이 필요로 하는 세밀한 기능을 제공하여 높은 만족도를 얻을 수 있습니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: JavaScript 라이브러리(예: `js-yaml`의 클라이언트 사이드 번들)를 활용하여 JSON과 YAML 데이터를 파싱하고 직렬화합니다. `CodeMirror` 또는 `Monaco Editor`와 같은 웹 기반 코드 에디터를 통합하여 문법 강조 및 코드 포맷팅 기능을 제공할 수 있습니다.
  - **다국어 SEO & 핵심 UX**: `/json-yaml-converter/ko`, `/json-yaml-converter/en` 등으로 랜딩 페이지를 구성하고, JSON/YAML 입력 및 출력 패널을 명확히 구분하여 양방향 변환을 지원합니다. 들여쓰기 크기, 배열 스타일 등 변환 옵션을 쉽게 설정할 수 있는 UI를 제공합니다.

---
