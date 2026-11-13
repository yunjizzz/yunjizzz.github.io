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

# 이미 무료·무제한 웹툴이 1페이지에 포화 상태인 레드오션 목록 (절대 추천 금지)
RED_OCEAN_BLACKLIST = [
    "단순 UUID / GUID 생성기",
    "텍스트 대소문자 변환기 (Case Converter)",
    "텍스트 중복 줄 제거기 / 줄바꿈 정리 / 단어 빈도 카운터",
    "단순 해시(MD5, SHA256 등) 계산기",
    "마크다운 ↔ HTML 변환기",
    "JSON ↔ YAML / XML / CSV 단순 포맷 변환기·포맷터",
    "Base64 / URL 인코더·디코더 / JWT 디코더",
    "Lorem Ipsum 생성기 / 정규식(Regex) 테스터 / 색상(HEX↔RGB) 변환기",
    "단순 QR 코드 생성기 / 단순 비밀번호 생성기·강도 측정기",
    "기본 단위 변환기 / 단순 BMI·퍼센트 계산기",
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
    """1차 후보 발굴 프롬프트: Google 검색으로 유료벽·워터마크·업로드 강제 틈새 후보 10~12개를 찾는다."""
    builtin_str = "\n".join(f"- {item}" for item in BUILTIN_TOOLS)
    blacklist_str = "\n".join(f"- {item}" for item in RED_OCEAN_BLACKLIST)
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

`google_search` 도구를 **반드시 여러 차례 직접 호출**하여, 전 세계(미국, 인도·남아시아, 동남아, 유럽 등)와 한국에서 검색 수요는 꾸준히 높지만
기존 검색 1페이지 상위 도구들이 **유료 구독(월 $9~$29), 1일 횟수/용량 제한, 강제 회원가입, 워터마크, 서버 업로드 보안 불안, 혹은 구식 UX** 때문에 사용자 불만(Reddit, 커뮤니티, 후기 등)이 많은 **진짜 틈새 웹 유틸리티 후보 10~12개**를 조사해 주세요.

### 특히 높은 기회 영역 (우선 탐색)
1. **국가/시험/비자/플랫폼 규격 특화 도구**: 인도 UPSC/SSC/PAN/Passport, 미국 USCIS/비자, 한국 공공·채용·금융 서류 등 특정 치수·용량·서명·DPI·여백 규격이 까다로운 틈새
2. **기존 강자가 유료화·횟수제한·워터마크를 거는 작업**: PDF 전자서명/주석/양식채우기/OCR/용량·쪽분할 외 고급 기능, 영상/오디오/자막/SVG/폰트/문서 로컬 처리
3. **민감 정보·프라이버시 로컬 처리 니즈**: 신분증·통장·계약서·의료서류·개인사진을 서버에 올리기 꺼려지는 작업
4. **생활·직장인·크리에이터 고빈도 실무 도구**: 세금·정산·일정·인쇄용 양식·이커머스 판매자용 이미지/표 작업 등

### 절대 추천 금지 (레드오션 블랙리스트)
이미 광고 없는 무료 클라이언트 툴이 구글 1페이지에 수십 개씩 깔려있는 아래 뻔한 유틸리티는 절대 포함하지 마세요:
{blacklist_str}

### 기존 해봄 도구 & 중복 금지 목록
- 구현 완료:
{builtin_str}
- 저장소 폴더: {dirs_str}
{prev_section}
{suggest_section}

### 출력 요청
후보 10~12개 각각에 대해 아래 항목을 간결히 정리해 주세요:
1. 도구 이름 / 추천 슬러그 / 분류(`업무` 또는 `일상`)
2. 타겟 키워드 (글로벌 EN + 한국 KO)
3. `google_search`로 확인한 실제 상위 경쟁 사이트 이름들과 그 한계(유료 플랜, 횟수 제한, 워터마크, 서버 업로드 강제 등)
4. 100% 브라우저 클라이언트 사이드 구현 기술 스택 (Web API / WASM / JS 라이브러리)
"""


def build_verification_prompt(today_str: str, candidates_text: str) -> str:
    """2차 검증 및 리포트 생성 프롬프트: 실제 1페이지 경쟁도를 재검증해 알짜 5~7개 이상을 엄선한다."""
    blacklist_str = "\n".join(f"- {item}" for item in RED_OCEAN_BLACKLIST)
    return f"""당신은 글로벌 & 한국 무료 웹 유틸리티 서비스 **'해봄 (https://haebom.app/)'**의 수석 프로덕트 전략가입니다.
오늘 날짜는 **{today_str}**입니다.

아래 1차 후보 목록을 검토하되, **`google_search` 도구로 각 후보의 핵심 영문/한국어 키워드를 직접 다시 검색해 검증**하세요.

[1차 후보 목록]
{candidates_text}

### 엄격한 탈락(필터링) 기준
다음 중 하나라도 해당하면 **과감히 탈락**시키세요:
1. 구글 1페이지에 이미 무료·무제한·가입불필요·깔끔한 경쟁 웹툴이 3개 이상 포진한 뻔한 레드오션 (특히 아래 블랙리스트 성격의 도구):
{blacklist_str}
2. 100% 브라우저 로컬(클라이언트 사이드) 처리가 현실적으로 불가능하거나 초기 모델 다운로드가 수백 MB 이상이라 웹 유틸 UX가 나쁜 아이디어
3. 구체적인 수요 근거 없이 추상적이거나 검색 볼륨이 너무 미미한 아이디어

### 합격(선정) 기준 — 트래픽 잠재력 × 공급 부족도 순으로 **5~7개 이상** 최종 선정
- 실제 검색 결과 상위 사이트들이 **구체적으로 어떤 불편함**(예: `Smallpdf` 일일 2회 제한, `Canva` Pro 유료벽, `Adobe` 로그인 강제, 특정 사이트 워터마크/서버 업로드 강제, 블로그 글만 뜨고 실제 도구가 없음 등)을 겪는지 **검색으로 확인한 구체적 서비스명/현상**을 반드시 근거로 적으세요.
- 글로벌 시장(인도, 미국, 동남아, 유럽 등)과 한국 시장 모두 또는 어느 한쪽에서 폭발적 실수요가 있는 주제여야 합니다.

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
  - 검색 수요 배경과 `google_search`로 확인한 실제 상위 검색 결과(경쟁 사이트 이름·유료벽·워터마크·서버 업로드 강제·도구 부재 등)의 구체적 한계
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: 브라우저 내 로컬 처리를 위한 구체적인 Web API / JS 라이브러리
  - **다국어 SEO & 핵심 UX**: 해봄 디자인 시스템 및 다국어(`ko`/`en` 하위 프리셋 랜딩 페이지) 확장 전략

### 2. [아이디어 이름] (`/추천-슬러그/`) — ⭐ 추천도: ...
(위와 동일한 형식으로 검증을 통과한 알짜 아이디어 5~7개 이상 작성)
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
