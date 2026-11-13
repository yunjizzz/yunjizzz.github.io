#!/usr/bin/env python3
"""주간 글로벌·한국 검색 수요 & 경쟁도 기반 해봄(haebom.app) 웹 유틸리티 아이디어 발굴 및 IDEAS.md 자동 갱신 스크립트.

실행 방법:
    GEMINI_API_KEY="your-api-key" python3 scripts/update_ideas.py

동작 요약:
    1. Google Suggest(자동완성) API로 미국·인도·영국·한국의 실제 유틸리티 검색어 신호를 수집한다.
    2. 1차 Gemini + google_search 그라운딩으로 글로벌·한국 시장의 유료벽/워터마크/업로드 강제 틈새 후보를 발굴한다.
    3. 2차 Gemini + google_search 그라운딩으로 1페이지 실제 경쟁 사이트의 한계를 검증하고 뻔한 레드오션을 탈락시켜
       수요 대비 공급이 부족한 5~7개 이상의 100% 브라우저 로컬 처리 유틸리티를 선별한다.
    4. 한국 시간(KST) 기준 `## 📅 YYYY-MM-DD 주간 유틸리티 아이디어 리포트` 섹션을 생성해 `IDEAS.md` 상단에 기록한다.
"""
import datetime
import json
import os
import pathlib
import re
import sys
import urllib.parse
import urllib.request

from google import genai
from google.genai import types

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDEAS_PATH = ROOT / "IDEAS.md"
PRIVATE_NEW_PATH = ROOT.parent / "haebom-private" / "new" / "index.html"
KST = datetime.timezone(datetime.timedelta(hours=9))

DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

# 현재 해봄(haebom.app)에 이미 구현되어 있는 기본 서비스 목록
BUILTIN_TOOLS = [
    "글자수 세기 (/text-count/): 글자수, 공백 제외 글자수, 단어수, 줄수, 바이트수 실시간 계산 (다국어 지원)",
    "이미지 변환기 (/image-convert/): JPG, PNG, WEBP 포맷 상호 변환 및 일괄 ZIP 다운로드 (다국어 지원)",
    "사진 용량 줄이기 & 증명/여권사진 규격 자르기 (/photo-resize/): 목표 KB(50KB, 100KB 등) 맞춤 압축 및 증명사진·여권사진 크롭 (ko, en 다국어 SEO 랜딩)",
    "PDF 용량 줄이기 (/pdf-compress/): PDF를 목표 KB(100KB, 200KB 등) 이하로 이미지 기반 압축 (ko, en 다국어 SEO 랜딩)",
    "PDF 종합 도구 (/pdf/): PDF 병합, 분할, PDF↔이미지 변환, PDF→Excel 변환 (ko, en, es, pt 다국어)",
    "영상 압축 (/compress/): WebCodecs 기반 MP4 하드웨어 가속 동영상 압축 (최대 2GB)",
    "이사 도우미 (/move/): 이사 날짜(D-Day) 기반 체크리스트 자동 생성 및 업체 링크 모음",
    "맛집 리뷰 신뢰도 분석 (/review-check/): 네이버 리뷰 데이터 기반 광고/진짜 맛집 판별 데모",
    "어느 날, 내가 없는 아침 (/well-ending/): 웰엔딩·엔딩노트 인터랙티브 스토리",
]

# 구현 난이도가 너무 높거나(상) 트래픽·차별화 여지가 극히 낮은 제외 대상
AVOID_PATTERNS = [
    "구현 난이도 '상' 복합 에디터: 타임라인 모션 그래픽, 멀티트랙 파형/DAW, PDF 내부 태그트리(PDF/UA) 구조 편집기, 노코드 폼 빌더 등 개발 기간 3일 이상 걸리는 무거운 앱",
    "수십 MB 이상 대용량 AI/WASM 모델을 초기 다운로드해야 동작하는 도구 (예: 고해상도 AI 업스케일러, 대형 로컬 LLM/OCR 모델)",
    "검색 볼륨이 매우 작거나 차별화 여지가 전혀 없는 단순 개발자 장난감 (예: Lorem Ipsum 생성기, 단순 HEX↔RGB 변환기, 단순 정규식 테스터)",
]

# 실제 사용자 검색 수요 파악을 위한 Google Suggest 시드 쿼리
SUGGEST_SEEDS = [
    ("en", "us", "online tool to "),
    ("en", "us", "without watermark "),
    ("en", "us", "pdf without login "),
    ("en", "in", "resize photo for "),
    ("en", "in", "compress pdf to "),
    ("en", "gb", "free online converter "),
    ("ko", "kr", "pdf 무료 "),
    ("ko", "kr", "온라인 무료 "),
    ("ko", "kr", "사진 크기 "),
    ("ko", "kr", "계산기 "),
]

DOC_HEADER = """# 💡 해봄 (haebom.app) 주간 유틸리티 아이디어 리포트

> 매주 월요일 오전 6시(KST) GitHub Actions와 Gemini (`google_search` 그라운딩)가 **전 세계(글로벌) 및 한국 검색 트렌드**를 분석하여, **수요 대비 공급이 부족하고 100% 브라우저 로컬 처리로 구현 가능한 신규 웹 유틸리티 아이디어들**을 상단에 누적 기록합니다.

---
"""


def fetch_google_suggest_signals() -> str:
    """Google 검색 자동완성 API에서 글로벌·한국 실제 검색어 신호를 수집한다."""
    collected: list[str] = []
    for hl, gl, query in SUGGEST_SEEDS:
        params = urllib.parse.urlencode(
            {"client": "firefox", "hl": hl, "gl": gl, "q": query}
        )
        url = f"https://suggestqueries.google.com/complete/search?{params}"
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; HaebomIdeasBot/1.0)"},
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            suggestions = payload[1][:6] if isinstance(payload, list) and len(payload) > 1 else []
            if suggestions:
                collected.append(f"- [{hl}/{gl}] `{query.strip()}` → {', '.join(suggestions)}")
        except Exception as exc:
            print(f"[update_ideas] Google Suggest 조회 생략 ({hl}/{gl} {query!r}): {exc}")

    return "\n".join(collected)


def get_existing_tools_and_ideas() -> tuple[list[str], str]:
    """저장소 내 디렉토리, 기존 IDEAS.md, 비공개 작업 목록에서 중복 금지 대상을 추출한다."""
    ignore_dirs = {
        ".git",
        ".github",
        ".omc",
        "scripts",
        "private",
        "resume",
        "jimin",
        "node_modules",
    }
    repo_dirs = sorted(
        p.name
        for p in ROOT.iterdir()
        if p.is_dir() and not p.name.startswith(".") and p.name not in ignore_dirs
    )

    existing_ideas_text = ""
    if IDEAS_PATH.exists():
        content = IDEAS_PATH.read_text(encoding="utf-8")
        summary_lines = []
        for line in content.splitlines():
            stripped = line.strip()
            if (
                stripped.startswith("## 📅")
                or stripped.startswith("### ")
                or "타겟 키워드" in stripped
                or "글로벌" in stripped
                or "한국 (KO)" in stripped
            ):
                summary_lines.append(stripped)
        existing_ideas_text = "\n".join(summary_lines[:200])

    # 비공개 작업 목록(../haebom-private/new/index.html)이 있으면 중복 방지를 위해 런타임에만 제목 참고
    if PRIVATE_NEW_PATH.exists():
        private_html = PRIVATE_NEW_PATH.read_text(encoding="utf-8")
        private_titles = re.findall(
            r"\[\s*['\"](?:tool|idea)-[^'\"]+['\"]\s*,\s*['\"]([^'\"]+)['\"]",
            private_html,
        )
        if private_titles:
            extra = "\n".join(f"- {t}" for t in private_titles[:120])
            existing_ideas_text = (
                f"{existing_ideas_text}\n\n[비공개 백로그에 이미 등록된 도구]\n{extra}"
            ).strip()

    return repo_dirs, existing_ideas_text


def log_grounding_queries(step_name: str, response) -> None:
    """Gemini가 google_search 그라운딩에서 실제로 실행한 검색 쿼리를 로그로 남긴다."""
    try:
        candidates = getattr(response, "candidates", None) or []
        if not candidates:
            return
        meta = getattr(candidates[0], "grounding_metadata", None)
        queries = getattr(meta, "web_search_queries", None) or []
        if queries:
            print(f"[update_ideas] {step_name} Google 검색 쿼리 ({len(queries)}건): {queries}")
    except Exception:
        pass


def build_discovery_prompt(
    today_str: str,
    repo_dirs: list[str],
    existing_ideas_summary: str,
    suggest_signals: str,
) -> str:
    """1차 후보 발굴 프롬프트: 구현 난이도(하~중)와 검색 수요(폭발적 대량 수요 포함)를 균형 있게 탐색한다."""
    builtin_str = "\n".join(f"- {item}" for item in BUILTIN_TOOLS)
    avoid_str = "\n".join(f"- {item}" for item in AVOID_PATTERNS)
    dirs_str = ", ".join(f"/{d}/" for d in repo_dirs)
    prev_section = (
        f"\n### 이미 구현/제안되어 중복 금지 대상\n{existing_ideas_summary}\n"
        if existing_ideas_summary
        else ""
    )
    suggest_section = (
        f"\n### 실시간 Google Suggest 검색어 신호 (참고용)\n{suggest_signals}\n"
        if suggest_signals
        else ""
    )

    return f"""당신은 글로벌 & 한국 무료 웹 유틸리티 서비스 **'해봄 (https://haebom.app/)'**의 리서처입니다.
오늘 날짜는 한국 시간(KST) 기준 **{today_str}**입니다.

`google_search` 도구를 **반드시 여러 차례 직접 호출**하여, 전 세계(미국, 인도·남아시아, 동남아, 유럽 등)와 한국에서 **100% 브라우저 로컬(HTML/JS/Canvas/pdf-lib/Web API 등)로 1~2일 안에 가볍게 구현 가능(난이도 하~중)**하면서도 트래픽 잠재력이 큰 **단일 목적(Single-purpose) 웹 유틸리티 후보 10~12개**를 조사해 주세요.

### 핵심 선별 철학 (두 가지 트랙을 모두 균형 있게 발굴)
1. **트랙 A — 폭발적 대량 검색 수요 + 기존 사이트 불편함 공략 (경쟁이 있더라도 도전할 만한 대형 시장)**:
   - 기존 사이트가 많더라도 검색량이 폭발적으로 크고, 상위 검색 결과들이 **서버 업로드 강제, 유료 낚시(예: 무료인 척하다가 만료/결제 유도), 일일 횟수 제한, 워터마크, 광고 도배·구식 UX, 모바일 불편**을 겪고 있어 해봄의 "깔끔한 UX + 서버 업로드 없음 + 다국어 프리셋 랜딩(`/50kb/`, `/passport/` 스타일)"으로 충분히 뺏어올 수 있는 도구
2. **트랙 B — 수요 대비 공급이 비어있는 틈새 규격/실무/생활 도구**:
   - 국가/시험/비자/서류 규격 맞춤(인도·미국·한국 제출 서류), 종이 서명 배경 투명화 PNG, 민감 문서 로컬 처리, 실무·세금·연차·생활 계산기처럼 깔끔한 무료 웹 도구가 부족한 니치 도구

### 반드시 지킬 난이도 기준 (매우 중요!)
- **구현 난이도 `하` 또는 `중`만 허용**: 순수 HTML/CSS/JS, Canvas API, Web Crypto/Audio, `pdf-lib`/`pdf.js` 같은 가벼운 라이브러리 1~2개로 **1~2일 안에 완성 가능한 단일 기능**이어야 합니다.
- **제외 대상**:
{avoid_str}

### 기존 해봄 도구 & 중복 금지 목록
- 구현 완료:
{builtin_str}
- 저장소 폴더: {dirs_str}
{prev_section}
{suggest_section}

### 출력 요청
후보 10~12개 각각에 대해 아래 항목을 간결히 정리해 주세요:
1. 도구 이름 / 추천 슬러그 / 분류(`업무` 또는 `일상`) / 구현 난이도(`하`, `하~중`, `중` 중 하나)
2. 트랙 구분 (`트랙 A: 대량 수요` 또는 `트랙 B: 틈새 공략`) 및 타겟 키워드 (글로벌 EN + 한국 KO)
3. `google_search`로 확인한 실제 상위 경쟁 사이트 이름들과 해봄이 파고들 수 있는 불편함/차별점
4. 1~2일 내 구현 가능한 가벼운 클라이언트 사이드 기술 스택
"""


def build_verification_prompt(today_str: str, candidates_text: str) -> str:
    """2차 검증 및 리포트 생성 프롬프트: 구현 난이도(하~중)와 검색 수요/경쟁 틈새를 검증해 5~7개 이상을 엄선한다."""
    avoid_str = "\n".join(f"- {item}" for item in AVOID_PATTERNS)
    return f"""당신은 글로벌 & 한국 무료 웹 유틸리티 서비스 **'해봄 (https://haebom.app/)'**의 수석 프로덕트 전략가입니다.
오늘 날짜는 **{today_str}**입니다.

아래 1차 후보 목록을 검토하되, **`google_search` 도구로 각 후보의 핵심 영문/한국어 키워드를 직접 다시 검색해 검증**하세요.

[1차 후보 목록]
{candidates_text}

### 엄격한 탈락(필터링) 기준
다음 중 하나라도 해당하면 **반드시 탈락**시키세요:
1. **구현 난이도 `상` 탈락**: 타임라인 편집기, 멀티트랙 오디오/영상 편집기, PDF 내부 구조(PDF/UA 태그 트리) 편집기, 노코드 빌더, 수십 MB AI 모델 등 1~2일 내 가볍게 만들기 어려운 무거운 도구
2. 아래 제외 대상에 해당하는 경우:
{avoid_str}
3. 경쟁이 치열한데 검색량마저 작거나, 기존 상위 사이트들이 이미 광고도 적고 무료·무제한·로컬로 너무 완벽해 해봄만의 차별점(로컬 보안·UX·무료·규격 랜딩)을 찾기 어려운 경우

### 합격(선정) 기준 — **(구현 가성비 × 검색 수요 규모 × 차별화 여지)** 순으로 **5~7개 이상** 최종 선정
- **난이도는 반드시 `하`, `하~중`, 또는 `중`만 포함**하세요 (`상` 금지).
- 대량 수요 시장(트랙 A)이라도 검색 수요가 매우 크고 상위 사이트의 유료벽·워터마크·서버 업로드·광고 도배·구식 UX를 이길 수 있다면 적극 선정하세요.
- 실제 `google_search`로 확인한 **구체적 상위 경쟁 사이트 이름과 한계**를 반드시 근거로 적으세요.

### 출력 형식 (Markdown)
반드시 아래 마크다운 구조를 지켜서 본문만 출력하세요 (인사말이나 코드블록 래퍼 없이 바로 `## 📅 {today_str} 주간 유틸리티 아이디어 리포트`로 시작, 각 불릿은 한 줄로 깔끔하게 작성):

## 📅 {today_str} 주간 유틸리티 아이디어 리포트

### 1. [아이디어 이름] (`/추천-슬러그/`) — ⭐ 추천도: 상 (예상 트래픽: 높음 / 구현 난이도: 하~중)
- **추천 분류**: `업무` 또는 `일상` 중 택1
- **한 줄 요약**: 이 도구가 무엇을 해결하고 어떻게 브라우저 로컬로 처리하는지 1~2문장(70~120자 내외) 요약
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `영문 핵심 키워드 1`, `영문 롱테일 키워드 2`, `영문 롱테일 키워드 3` (주요 수요 국가/지역 명시)
  - **한국 (KO)**: `한국어 핵심 키워드 1`, `한국어 롱테일 키워드 2`
- **수요 대비 공급 분석**:
  - 트랙(폭발적 대량 수요 공략 vs 틈새 규격 공략), 검색 수요 배경, `google_search`로 확인한 실제 상위 검색 결과(경쟁 사이트 이름·유료벽·워터마크·서버 업로드·구식 UX 등)의 구체적 한계
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: 1~2일 내 구현 가능한 가벼운 Web API / JS 라이브러리
  - **다국어 SEO & 핵심 UX**: 해봄 디자인 시스템 및 다국어(`ko`/`en` 하위 프리셋 랜딩 페이지) 확장 전략

### 2. [아이디어 이름] (`/추천-슬러그/`) — ⭐ 추천도: ...
(위와 동일한 형식으로 난이도 하~중의 알짜 아이디어 5~7개 이상 작성)
"""


def generate_weekly_report(today_str: str) -> str:
    """Google Suggest + 2단계 Gemini Google Search Grounding으로 주간 리포트를 생성한다."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("[update_ideas] 오류: GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.")

    repo_dirs, existing_ideas_summary = get_existing_tools_and_ideas()
    suggest_signals = fetch_google_suggest_signals()

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(api_version="v1beta"),
    )
    search_tool = [types.Tool(google_search=types.GoogleSearch())]

    # 1단계: 실제 검색 신호 + Google Search 기반 틈새 후보 발굴
    discovery_prompt = build_discovery_prompt(
        today_str, repo_dirs, existing_ideas_summary, suggest_signals
    )
    discovery_resp = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=discovery_prompt,
        config=types.GenerateContentConfig(tools=search_tool, temperature=0.6),
    )
    log_grounding_queries("1단계 발굴", discovery_resp)
    candidates_text = (discovery_resp.text or "").strip()
    if not candidates_text:
        sys.exit("[update_ideas] 오류: 1단계 후보 발굴에서 빈 응답을 받았습니다.")

    # 2단계: SERP 경쟁도 재검증 및 레드오션 필터링 후 최종 리포트 작성
    verify_prompt = build_verification_prompt(today_str, candidates_text)
    verify_resp = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=verify_prompt,
        config=types.GenerateContentConfig(tools=search_tool, temperature=0.4),
    )
    log_grounding_queries("2단계 검증", verify_resp)

    text = (verify_resp.text or "").strip()
    if not text:
        sys.exit("[update_ideas] 오류: 2단계 검증에서 빈 응답을 받았습니다.")

    text = re.sub(r"^```(?:markdown|md)?\s*\n", "", text)
    text = re.sub(r"\n```\s*$", "", text).strip()

    expected_heading = f"## 📅 {today_str} 주간 유틸리티 아이디어 리포트"
    if not text.startswith("## 📅"):
        idx = text.find("## 📅")
        if idx != -1:
            text = text[idx:].strip()
        else:
            text = f"{expected_heading}\n\n{text}"

    return text


def prepend_report_to_ideas_md(report_md: str, today_str: str) -> bool:
    """생성된 리포트를 루트 IDEAS.md 파일 상단에 누적 추가한다."""
    heading_prefix = f"## 📅 {today_str}"

    if not IDEAS_PATH.exists():
        new_content = f"{DOC_HEADER}\n{report_md}\n"
        IDEAS_PATH.write_text(new_content, encoding="utf-8")
        print(f"[update_ideas] 새 {IDEAS_PATH.name} 파일을 생성하고 {today_str} 리포트를 기록했습니다.")
        return True

    existing = IDEAS_PATH.read_text(encoding="utf-8")

    if heading_prefix in existing:
        print(f"[update_ideas] 이미 {today_str} 날짜의 리포트가 존재하여 해당 섹션을 최신 내용으로 갱신합니다.")
        pattern = re.compile(
            rf"{re.escape(heading_prefix)}.*?(?=\n## 📅 |\Z)",
            re.DOTALL,
        )
        updated = pattern.sub(f"{report_md}\n\n---\n", existing, count=1)
        IDEAS_PATH.write_text(updated.rstrip() + "\n", encoding="utf-8")
        return True

    first_report_match = re.search(r"^## 📅 ", existing, flags=re.MULTILINE)
    if first_report_match:
        insert_pos = first_report_match.start()
        updated = (
            existing[:insert_pos].rstrip()
            + f"\n\n{report_md}\n\n---\n\n"
            + existing[insert_pos:].lstrip()
        )
    elif existing.strip():
        updated = f"{DOC_HEADER}\n{report_md}\n"
    else:
        updated = f"{DOC_HEADER}\n{report_md}\n"

    IDEAS_PATH.write_text(updated, encoding="utf-8")
    print(f"[update_ideas] {IDEAS_PATH.name} 상단에 {today_str} 리포트를 추가했습니다.")
    return True


def main():
    today_str = datetime.datetime.now(KST).strftime("%Y-%m-%d")
    report_md = generate_weekly_report(today_str)
    prepend_report_to_ideas_md(report_md, today_str)


if __name__ == "__main__":
    main()
