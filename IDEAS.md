# 💡 해봄 (haebom.app) 주간 유틸리티 아이디어 리포트

> 매주 월요일 오전 6시(KST) GitHub Actions와 Gemini (`google_search` 그라운딩)가 **전 세계(글로벌) 및 한국 검색 트렌드**를 분석하여, **수요 대비 공급이 부족하고 100% 브라우저 로컬 처리로 구현 가능한 신규 웹 유틸리티 아이디어들**을 상단에 누적 기록합니다.

---

## 📅 2026-11-13 주간 유틸리티 아이디어 리포트

### 1. 규격 준수 문서/이미지 조합 및 검증기 (`/compliance-assembler/`) — ⭐ 추천도: 상 (예상 트래픽: 높음 / 구현 난이도: 중)
- **추천 분류**: `업무`
- **한 줄 요약**: 비자, 여권, 공공기관 신청 등 복잡한 규격의 문서에 여러 이미지(사진, 서명) 및 텍스트 요소를 브라우저에서 로컬로 조합하고, 전체 규격 준수 여부를 검증하여 개인정보 유출 우려 없이 최종 문서를 생성합니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `visa document builder no upload`, `passport application form combiner local`, `USCIS photo signature merger browser`, `document compliance checker private`, `combine photos for application with validation` (주요 수요 국가/지역: 인도, 미국, 동남아, 유럽)
  - **한국 (KO)**: `비자 서류 조합 로컬`, `여권 신청 이미지 합치기 규격`, `공공기관 서류 규격 검사 웹`, `서명 사진 합치기 검증`, `로컬 문서 규격 검증 무료`
- **수요 대비 공급 분석**:
  - `visa document builder` 및 `passport application form combiner` 검색 시, PhotoAiD, PhotoGov와 같은 서비스가 상위에 노출되지만, 대부분 서버 업로드를 요구하거나 인쇄본 구매를 유도하며, 복합 문서 조합 및 전체 규격 검증 기능은 제한적입니다. Immplify와 같은 도구는 여러 문서를 하나의 PDF로 합치는 기능을 로컬로 제공하지만, 사진, 서명, 특정 텍스트 블록 등 다양한 요소들을 하나의 복합 문서로 '조합'하고 '전체 규격'을 검증하는 기능은 미흡합니다. Photo Compliance Checker는 사진 규격 검사에 특화되어 있지만, 여러 문서 요소를 복합적으로 조합하는 기능은 제공하지 않습니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: Web API (Canvas API, File API), JS 라이브러리 (PDF.js for PDF 렌더링/조작, Fabric.js 또는 Konva.js for 대화형 이미지/문서 요소 배치), 잠재적으로 WASM (복잡한 이미지 분석 또는 PDF 생성 가속화).
  - **다국어 SEO & 핵심 UX**: 규격별 템플릿(예: USCIS, 한국 공공기관)을 제공하고, 각 요소(사진, 서명, 텍스트)를 드래그 앤 드롭으로 배치하며 실시간으로 규격 준수 여부를 시각적으로 피드백합니다. `ko`/`en` 하위 프리셋 랜딩 페이지를 통해 특정 국가/기관별 수요를 타겟팅합니다.

### 2. 로컬 인터랙티브 파형 자막 편집기 (`/interactive-waveform-subtitle-editor/`) — ⭐ 추천도: 중 (예상 트래픽: 중간 / 구현 난이도: 중~상)
- **추천 분류**: `일상`
- **한 줄 요약**: 사용자가 업로드한 SRT/VTT 자막 파일과 로컬 비디오를 기반으로, 파형을 시각적으로 편집하고 개별 자막 큐의 타이밍을 정밀하게 조정하며, 여러 스피커/언어 트랙을 지원하는 고급 자막 편집을 브라우저에서 제공합니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `interactive srt editor waveform local`, `multi track vtt editor browser`, `precise subtitle timing adjustment offline`, `local video subtitle sync editor`, `free speaker separation subtitle editor` (주요 수요 국가/지역: 미국, 유럽, 인도, 동남아)
  - **한국 (KO)**: `온라인 자막 파형 편집기 로컬`, `멀티 트랙 자막 편집 웹`, `정밀 자막 시간 조절 브라우저`, `로컬 영상 자막 싱크 편집`, `무료 화자 분리 자막 편집`
- **수요 대비 공급 분석**:
  - `online srt editor no upload` 검색 시, SpeechText.AI, MeetWave, RecordMeeting, WaveSpeed AI 등 많은 무료 로컬 자막 편집기가 기본적인 텍스트 편집, 시간 이동, 로컬 비디오 미리보기 기능을 제공합니다. SubtitleFlow는 자동 줄바꿈 기능을 제공합니다. 그러나 이들 대부분은 '파형'을 통한 정밀한 개별 큐 타이밍 조작, 그리고 여러 스피커나 언어를 위한 '멀티 트랙' 편집 기능을 동시에 제공하는 데는 한계가 있습니다. GitHub의 `vtt-editor-pro` 프로젝트는 '인터랙티브 파형'과 '멀티 트랙 자막 지원'을 언급하며 기술적 가능성을 보여주지만, 일반 사용자를 위한 완성된 웹 유틸리티는 아닙니다. CapCut과 같은 일부 서비스는 자동 자막 생성 및 편집 기능을 제공하지만, 유료 구독 모델이거나 서버 기반 처리입니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: Web API (File API, Web Audio API for 파형 렌더링/동기화, Web Workers for 텍스트 처리), JS 라이브러리 (SRT/VTT 파싱 및 직렬화, 파형 시각화 라이브러리, 텍스트 편집 프레임워크).
  - **다국어 SEO & 핵심 UX**: 직관적인 파형 인터페이스를 통해 자막 큐를 드래그 앤 드롭으로 이동 및 크기 조정하고, 여러 트랙을 시각적으로 구분하여 편집할 수 있도록 합니다. `ko`/`en` 및 주요 언어별 랜딩 페이지를 통해 접근성을 높입니다.

### 3. 로컬 데이터 기반 인쇄용 양식/플래너 생성기 (`/data-driven-planner/`) — ⭐ 추천도: 상 (예상 트래픽: 중간~높음 / 구현 난이도: 중)
- **추천 분류**: `업무`
- **한 줄 요약**: CSV, JSON 등 구조화된 사용자 데이터를 업로드하여 근무표, 프로젝트 타임라인, 재고 관리 시트 등 복잡한 맞춤형 인쇄용 양식 및 플래너를 브라우저에서 로컬로 디자인하고 생성합니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `custom printable forms from csv local`, `data driven planner generator browser`, `dynamic report pdf maker offline`, `employee shift schedule from json private`, `inventory sheet generator data` (주요 수요 국가/지역: 미국, 유럽, 인도, 동남아)
  - **한국 (KO)**: `CSV 근무표 자동 생성기 로컬`, `데이터 기반 인쇄 양식 웹`, `맞춤형 플래너 만들기 브라우저`, `JSON 프로젝트 차트 생성`, `지출 내역서 PDF 데이터`
- **수요 대비 공급 분석**:
  - `printable shift schedule generator from csv` 검색 시, RosterMates, LapsoWork, ClockOut, Haruduty 등 여러 무료 로컬 근무표 생성기가 존재하며 CSV/PDF 다운로드를 지원합니다. `project timeline planner from json` 검색 시, Taskip, EverGantt, iLoveGantt 등 무료 로컬 타임라인/간트 차트 생성기가 CSV/JSON 가져오기 및 PDF/PNG 내보내기를 지원합니다. Convert My Docs와 Taskip는 로컬에서 지출 내역을 관리하고 PDF로 내보내는 기능을 제공합니다. 그러나 이러한 도구들은 대부분 특정 목적(근무표, 타임라인)에 고정된 템플릿 기반이며, 사용자가 직접 업로드한 *다양한 형태의 구조화된 데이터(CSV, JSON 등)를 기반으로 복잡한 레이아웃의 '맞춤형 인쇄용 양식'을 자유롭게 디자인하고 생성하는 '범용적인' 기능*은 제한적입니다. AI 기반 양식 생성기(Kizeo Forms, Template.net)는 온라인 서비스이거나 유료 플랜을 요구합니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: Web API (File API, Blob API for PDF 생성), JS 라이브러리 (CSV/JSON 파싱, jsPDF 또는 PDF-lib와 같은 PDF 생성 라이브러리, 레이아웃을 위한 템플릿 엔진 또는 드래그 앤 드롭 UI 빌더).
  - **다국어 SEO & 핵심 UX**: 사용자가 데이터 필드를 템플릿에 매핑하고, 드래그 앤 드롭으로 레이아웃을 구성하며, 실시간 미리보기를 통해 인쇄용 양식을 디자인할 수 있도록 합니다. 다양한 데이터 소스(CSV, JSON)와 출력 형식(PDF, 이미지)을 지원하고, `ko`/`en` 및 주요 언어별 랜딩 페이지를 통해 다양한 비즈니스 및 개인 사용자 수요를 충족합니다.

### 4. 로컬 고급 인터랙티브 SVG 모션 그래픽 편집기 (`/interactive-svg-motion-editor/`) — ⭐ 추천도: 중 (예상 트래픽: 중간 / 구현 난이도: 상)
- **추천 분류**: `업무`
- **한 줄 요약**: 복잡한 SVG 경로 모핑, 고급 이징 곡선, 그리고 마우스 오버/클릭/스크롤과 같은 인터랙티브 트리거를 포함한 SVG 애니메이션을 코딩 없이 시각적인 타임라인 편집기로 브라우저에서 로컬로 생성하고 편집합니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `interactive svg animation editor local free`, `svg path morphing tool browser`, `no code svg motion graphics offline`, `advanced svg easing editor`, `local svg interactive triggers` (주요 수요 국가/지역: 미국, 유럽, 인도)
  - **한국 (KO)**: `인터랙티브 SVG 애니메이션 편집기 로컬`, `SVG 경로 모핑 웹 무료`, `노코드 SVG 모션 그래픽 브라우저`, `고급 SVG 이징 편집`, `로컬 SVG 인터랙티브 트리거`
- **수요 대비 공급 분석**:
  - `online svg animation editor local` 검색 시, CSSVG, svgvector.com, SketchValley, SVG AI 등 여러 무료 브라우저 기반 SVG 애니메이션 편집기가 존재하며 CSS/SMIL 기반의 변환, 회전, 크기 조정, 불투명도 효과를 지원합니다. 그러나 이러한 도구들은 주로 기본적인 변환 애니메이션에 중점을 두며, '복잡한 경로 모핑'이나 '고급 이징 곡선'을 시각적으로 편집하는 기능, 그리고 '마우스 오버/클릭/스크롤'과 같은 '인터랙티브 트리거'를 코딩 없이 구현하는 기능은 제한적입니다. SVGator는 이러한 고급 기능을 제공하지만, 애니메이션 내보내기에 유료 구독을 요구합니다. GSAP는 강력한 JavaScript 라이브러리이지만, 코딩 지식이 필요하며 시각적 편집기가 아닙니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: Web API (File API, DOM 조작, requestAnimationFrame), JS 라이브러리 (SVG.js 또는 Snap.svg for SVG 조작, GreenSock (GSAP) 또는 anime.js와 같은 애니메이션 라이브러리(클라이언트 번들), UI 프레임워크 for 애니메이션 타임라인/컨트롤). WASM을 활용하여 복잡한 경로 계산을 가속화할 수 있습니다.
  - **다국어 SEO & 핵심 UX**: 드래그 앤 드롭 기반의 타임라인 에디터에서 SVG 요소를 선택하고, 키프레임을 추가하여 경로 모핑, 이징, 인터랙티브 트리거를 설정할 수 있도록 합니다. 실시간 미리보기와 함께 `ko`/`en` 및 주요 언어별 튜토리얼 및 템플릿을 제공하여 사용성을 높입니다.

### 5. 로컬 포괄적 PDF 접근성 도구 키트 (WCAG/PDF/UA) (`/pdf-accessibility/`) — ⭐ 추천도: 상 (예상 트래픽: 높음 / 구현 난이도: 상)
- **추천 분류**: `업무`
- **한 줄 요약**: PDF 문서의 WCAG 및 PDF/UA 접근성 준수 여부를 검사하고, 누락된 태그, 대체 텍스트, 논리적 읽기 순서 등을 브라우저에서 로컬로 직접 수정하여 접근 가능한 PDF를 생성하는 포괄적인 도구 키트를 제공합니다.
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `pdf accessibility checker local free`, `wcag pdf remediation tool browser`, `pdf/ua editor offline`, `add alt text to pdf structure`, `pdf reading order editor local` (주요 수요 국가/지역: 미국, 유럽, 캐나다, 호주, 한국)
  - **한국 (KO)**: `PDF 접근성 검사기 로컬 무료`, `WCAG PDF 수정 도구 웹`, `PDF/UA 편집 오프라인`, `PDF 대체 텍스트 구조 편집`, `PDF 읽기 순서 편집 브라우저`
- **수요 대비 공급 분석**:
  - `pdf accessibility checker local free` 검색 시, Polotno, Underleaf, axesCheck, 데브데이 등 여러 무료 로컬 PDF 접근성 검사기가 존재하며, WCAG 및 PDF/UA 기준에 따라 문서 구조, 언어, 제목, 대체 텍스트 유무 등을 확인합니다. 그러나 이들 대부분은 '검사' 기능에 중점을 두며, '누락된 태그를 추가'하거나 '대체 텍스트를 직접 편집'하고 '논리적 읽기 순서를 시각적으로 재구성'하는 등 '포괄적인 수정(remediation)' 기능은 제한적입니다. PDFix는 데스크톱 버전에서 자동 수정 기능을 제공하지만, 무료 버전은 워터마크가 포함됩니다. Adobe Acrobat Pro는 이러한 고급 편집 기능을 제공하지만, 유료 데스크톱 소프트웨어입니다. Smallpdf는 Word 변환을 통한 간접적인 대체 텍스트 추가 방법을 제시합니다.
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: Web API (File API, Canvas API for PDF 렌더링, DOM 조작 for 대화형 UI), JS 라이브러리 (PDF.js for PDF 파싱/렌더링, 접근성 검사 라이브러리, WASM for PDF 태깅/재구성 및 콘텐츠 조작).
  - **다국어 SEO & 핵심 UX**: PDF의 논리적 구조(태그 트리)를 시각적으로 보여주고, 드래그 앤 드롭으로 읽기 순서를 변경하며, 이미지에 대한 대체 텍스트를 직접 입력할 수 있는 편집기를 제공합니다. WCAG 및 PDF/UA 가이드라인에 따른 실시간 피드백을 제공하고, `ko`/`en` 및 주요 언어별 접근성 표준에 대한 설명과 함께 랜딩 페이지를 구축합니다.
