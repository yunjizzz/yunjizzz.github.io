#!/usr/bin/env python3
"""주간 글로벌·한국 검색 트렌드 기반 해봄(haebom.app) 웹 유틸리티 아이디어 발굴 및 IDEAS.md 자동 갱신 스크립트.

실행 방법:
    GEMINI_API_KEY="your-api-key" python3 scripts/update_ideas.py

동작 요약:
    1. google-genai SDK와 google_search 그라운딩 도구를 사용해 최근 전 세계(글로벌) 및 한국 검색 트렌드를 조사한다.
    2. 현재 저장소의 기존 유틸리티 및 기존 IDEAS.md에 수록된 아이디어와 중복되지 않는
       '검색 수요 대비 공급이 부족한' 100% 브라우저 로컬 처리 웹 유틸리티 아이디어 3가지를 선정한다.
    3. 한국 시간(KST) 기준 `## 📅 YYYY-MM-DD 주간 유틸리티 아이디어 리포트` 섹션을 생성하여
       루트 `IDEAS.md` 파일 상단에 누적 추가한다.
"""
import datetime
import os
import pathlib
import re
import sys

from google import genai
from google.genai import types

ROOT = pathlib.Path(__file__).resolve().parent.parent
IDEAS_PATH = ROOT / "IDEAS.md"
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

DOC_HEADER = """# 💡 해봄 (haebom.app) 주간 유틸리티 아이디어 리포트

> 매주 월요일 오전 9시(KST) GitHub Actions와 Gemini (`google_search` 그라운딩)가 **전 세계(글로벌) 및 한국 검색 트렌드**를 분석하여, **수요 대비 공급이 부족하고 100% 브라우저 로컬 처리로 구현 가능한 신규 웹 유틸리티 아이디어 3가지**를 상단에 누적 기록합니다.

---
"""


def get_existing_tools_and_ideas() -> tuple[list[str], str]:
    """저장소 내 디렉토리 및 기존 IDEAS.md에서 이미 다룬 도구/아이디어 목록을 추출한다."""
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
        # 기존 리포트의 제목/헤더 및 타겟 키워드 줄만 요약 추출해 프롬프트 컨텍스트 절약
        summary_lines = []
        for line in content.splitlines():
            stripped = line.strip()
            if (
                stripped.startswith("## 📅")
                or stripped.startswith("### ")
                or "타겟 키워드" in stripped
                or "글로벌" in stripped
                or "한국어" in stripped
            ):
                summary_lines.append(stripped)
        existing_ideas_text = "\n".join(summary_lines[:150])

    return repo_dirs, existing_ideas_text


def build_prompt(today_str: str, repo_dirs: list[str], existing_ideas_summary: str) -> str:
    """Gemini 모델에 전달할 프롬프트를 생성한다."""
    builtin_str = "\n".join(f"- {item}" for item in BUILTIN_TOOLS)
    dirs_str = ", ".join(f"/{d}/" for d in repo_dirs)
    prev_ideas_section = (
        f"\n[기존 IDEAS.md에 이미 제안된 아이디어 요약 (절대 중복 금지)]\n{existing_ideas_summary}\n"
        if existing_ideas_summary
        else ""
    )

    return f"""당신은 글로벌 & 한국 무료 웹 유틸리티 서비스 **'해봄 (https://haebom.app/)'**의 프로덕트 전략가이자 글로벌 SEO 전문가입니다.
오늘 날짜는 한국 시간(KST) 기준 **{today_str}**입니다.

`google_search` 도구를 적극 활용하여 **전 세계(영어권, 인도·남아시아, 동남아, 중남미, 유럽 등 글로벌 시장)와 한국 시장**에서 최근 검색 수요가 높지만,
기존 대형 포털이나 공룡 사이트들이 세밀하게 대응하지 못하거나 유료 결제·서버 업로드·워터마크·무거운 앱 설치를 강요하여 **수요 대비 공급 만족도가 낮은 틈새(Long-tail) 웹 유틸리티 아이디어 3가지**를 선정해 주세요.

### 배경 및 전략 포인트
- 해봄은 이미 `/photo-resize/`, `/pdf-compress/` 등을 한국어(`ko`)와 영어(`en`) 규격별 랜딩 페이지(`50kb`, `100kb`, `passport-photo` 등)로 배포해 글로벌(인도, 방글라데시, 나이지리아, 파키스탄, 미국 등) 및 한국 검색 유입을 동시에 확보하고 있습니다.
- 특히 인터넷 속도가 느린 지역이나 민감한 개인정보/업무 파일을 다루는 사용자들에게 **"서버 업로드 없이 브라우저 안에서 즉시 처리"**되는 도구는 글로벌 시장에서도 강력한 차별점이 됩니다.

### 핵심 제약 조건 (반드시 준수)
1. **100% 브라우저 클라이언트 사이드 처리**:
   - 해봄의 핵심 철학은 "회원가입 없음, 서버 업로드 없음(브라우저 내 로컬 처리로 속도·개인정보·보안 100% 안심), 워터마크·횟수 제한 없는 100% 무료"입니다.
   - 반드시 순수 HTML/CSS/JS, Web API(Canvas, Web Audio, WebCodecs, Web Crypto, File API, WebAssembly 등) 또는 클라이언트 JS 라이브러리만으로 서버 없이 동작 가능한 도구여야 합니다.
2. **글로벌 확장성 + 한국 실용성**:
   - 전 세계적으로 검색량이 풍부한 영문 롱테일 키워드와 한국어 틈새 키워드를 동시에 공략할 수 있는 주제를 우선 선정하세요 (글로벌 단독 고수요 틈새 도구도 가능).
3. **기존 기능 및 과거 아이디어와 중복 절대 금지**:
   - 현재 해봄에 이미 구현된 아래 도구들과 겹치지 않아야 합니다:
{builtin_str}
   - 현재 저장소 폴더 목록: {dirs_str}
{prev_ideas_section}

### 출력 형식 (Markdown)
반드시 아래 마크다운 구조를 정확히 지켜서 본문만 출력하세요 (인사말이나 코드블록 래퍼 없이 바로 `## 📅 {today_str} 주간 유틸리티 아이디어 리포트`로 시작):

## 📅 {today_str} 주간 유틸리티 아이디어 리포트

### 1. [아이디어 이름] (`/추천-슬러그/`)
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: `영문 핵심 키워드 1`, `영문 롱테일 키워드 2`, `영문 롱테일 키워드 3` (주요 수요 국가/지역 명시)
  - **한국 (KO)**: `한국어 핵심 키워드 1`, `한국어 롱테일 키워드 2`
- **수요 대비 공급 분석**:
  - 왜 전 세계 및 한국 사용자들이 이 기능을 자주 검색하는지(구체적인 제출 규격, 실무/일상 페인포인트)와 기존 검색 상위 사이트들(서버 업로드 대기시간, 유료 제한, 워터마크, 개인정보 유출 우려, 세밀한 옵션 부재 등)의 한계를 분석
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: 브라우저 내 로컬 처리를 위한 구체적인 Web API / JS 라이브러리
  - **다국어 SEO & 핵심 UX**: 해봄 디자인 시스템 및 다국어(`ko`/`en` 하위 프리셋 랜딩 페이지) 확장 전략

### 2. [아이디어 이름] (`/추천-슬러그/`)
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: ...
  - **한국 (KO)**: ...
- **수요 대비 공급 분석**:
  - ...
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: ...
  - **다국어 SEO & 핵심 UX**: ...

### 3. [아이디어 이름] (`/추천-슬러그/`)
- **타겟 키워드 & 주요 수요 지역**:
  - **글로벌 (EN)**: ...
  - **한국 (KO)**: ...
- **수요 대비 공급 분석**:
  - ...
- **해봄 구현 포인트**:
  - **클라이언트 기술 스택**: ...
  - **다국어 SEO & 핵심 UX**: ...
"""


def generate_weekly_report(today_str: str) -> str:
    """Gemini API + Google Search Grounding을 호출해 주간 리포트 마크다운을 생성한다."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("[update_ideas] 오류: GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.")

    repo_dirs, existing_ideas_summary = get_existing_tools_and_ideas()
    prompt = build_prompt(today_str, repo_dirs, existing_ideas_summary)

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=0.7,
        ),
    )

    text = (response.text or "").strip()
    if not text:
        sys.exit("[update_ideas] 오류: 모델로부터 빈 응답을 받았습니다.")

    # 혹시 모델이 ```markdown ... ``` 코드블록으로 감쌌다면 제거
    text = re.sub(r"^```(?:markdown|md)?\s*\n", "", text)
    text = re.sub(r"\n```\s*$", "", text).strip()

    expected_heading = f"## 📅 {today_str} 주간 유틸리티 아이디어 리포트"
    if not text.startswith("## 📅"):
        # 앞부분에 불필요한 서문이 섞여 있다면 `## 📅`부터 잘라내거나 헤더를 보정
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

    # 동일 날짜 리포트가 이미 있는 경우 덮어쓰기 또는 중복 방지
    if heading_prefix in existing:
        print(f"[update_ideas] 이미 {today_str} 날짜의 리포트가 존재하여 해당 섹션을 최신 내용으로 갱신합니다.")
        pattern = re.compile(
            rf"{re.escape(heading_prefix)}.*?(?=\n## 📅 |\Z)",
            re.DOTALL,
        )
        updated = pattern.sub(f"{report_md}\n\n---\n", existing, count=1)
        IDEAS_PATH.write_text(updated.rstrip() + "\n", encoding="utf-8")
        return True

    # 첫 번째 `## 📅` 섹션 앞(또는 `---` 구분선 뒤)에 최신 리포트를 상단 삽입
    first_report_match = re.search(r"^## 📅 ", existing, flags=re.MULTILINE)
    if first_report_match:
        insert_pos = first_report_match.start()
        updated = (
            existing[:insert_pos].rstrip()
            + f"\n\n{report_md}\n\n---\n\n"
            + existing[insert_pos:].lstrip()
        )
    elif existing.strip():
        updated = f"{DOC_HEADER}\n{report_md}\n\n---\n\n{existing.strip()}\n"
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
