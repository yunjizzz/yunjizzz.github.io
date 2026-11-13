#!/usr/bin/env python3
"""pdf-compress(PDF 용량 줄이기, KB 맞추기) 한국어·영어 페이지 생성기.

실행: python3 scripts/gen_pdf_compress.py   (저장소 루트에서)
- 디자인은 photo-resize/style.css를 공유하고, 이 도구만의 스타일은 pdf-compress/style.css에 둠
- 화면 문구·FAQ·페이지 정의는 이 파일 안에 있음. sitemap.xml의 pdf-compress 구간도 함께 갱신
"""
import hashlib
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "pdf-compress"
BASE = "https://haebom.app"
LANGS = ["ko", "en"]
PATH = {"ko": "/pdf-compress/", "en": "/pdf-compress/en/"}
HREFLANG = {"ko": "ko", "en": "en"}
OG = {"ko": "ko_KR", "en": "en_US"}
LANG_NAME = {"ko": "한국어", "en": "English"}
WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

S = {
    "ko": dict(
        brand="해봄", tool="PDF 용량 줄이기", home_aria="해봄 홈", theme_aria="테마 전환",
        eyebrow="업로드 없이, 이 브라우저에서만 안전하게",
        noscript="이 도구는 JavaScript가 필요해요. 브라우저에서 JavaScript를 켜 주세요.",
        dz_aria="PDF를 끌어다 놓거나 눌러서 선택", file_aria="PDF 파일 선택",
        dz_title="PDF를 끌어다 놓으세요", dz_more="PDF 더 추가하기",
        dz_sub="여러 개도 한 번에 · 휴대폰 파일에서도 선택해요", dz_btn="PDF 선택하기", dz_formats="PDF (최대 60쪽)",
        list_title="선택한 PDF", list_total="{n}개 · {size}", remove="삭제",
        panel_aria="변환 설정", step1="용량 (이하로)", kb_hint="1KB = 1,000바이트", kb_aria="목표 용량",
        custom="직접 입력", kb_ph="예: 300", kb_custom_aria="목표 용량(KB)", kb_suffix="KB 이하",
        step2="색상", color_aria="색상", color_keep="색 그대로", color_gray="흑백(더 작게)",
        note="각 쪽을 이미지로 바꿔 압축하기 때문에, 줄인 PDF는 글자를 선택·복사할 수 없어요. 스캔본·제출용 서류에 알맞아요.",
        btn_empty="PDF를 먼저 선택하세요", btn_need_kb="용량을 선택하세요", btn_one="PDF 용량 줄이기", btn_many="{n}개 한꺼번에 줄이기",
        processing="줄이는 중입니다...", results_aria="변환 결과", results_title="완료됐어요", zip="ZIP으로 한 번에 받기",
        why_kicker="Why 해봄", why_h2="왜 해봄에서 줄이면 안전할까요?",
        why1_t="업로드 없음", why1_p="PDF는 내 기기 안에서만 처리돼서 서버로 전송되지 않아요. 서류도 안심하세요.",
        why2_t="목표 용량에 맞춰서", why2_p="용량 이하가 되는 가장 선명한 화질을 찾아서 맞춰요.",
        why3_t="가입·워터마크 없음", why3_p="링크만 열면 바로 쓰고, 사용 횟수 제한도 유료 플랜도 없어요.",
        faq_h2="자주 묻는 질문",
        msg_bad="{n}개 파일은 PDF가 아니라서 제외했어요.",
        sum_label="설정", sum_kb="{kb} 이하", sum_kb_none="용량을 선택하세요", sum_color="색 그대로", sum_gray="흑백",
        st_read="파일 읽는 중", st_page="{i}/{n}쪽 변환", st_fit="용량에 맞추는 중",
        err_pages="{name}: {n}쪽이라서 줄일 수 없어요. 한 번에 {max}쪽까지 가능해요. 나눠서 줄여 주세요.",
        err_open="{name}: 열 수 없는 PDF예요. 암호가 걸렸거나 손상된 파일일 수 있어요.",
        pages="{n}쪽", kept="이미 목표보다 작아서 원본 그대로예요", ok_target="✓ {kb} 이하로 맞췄어요",
        warn_res="⚠ {kb}까지는 줄이지 못했어요. 목표 용량을 키우거나 ‘흑백’을 선택해 보세요",
        save="저장", zip_name="PDF_용량줄이기.zip",
    ),
    "en": dict(
        brand="Haebom", tool="Resize PDF to KB", home_aria="Haebom home", theme_aria="Toggle theme",
        eyebrow="No upload. Your PDF stays in this browser.",
        noscript="This tool needs JavaScript. Please enable it in your browser.",
        dz_aria="Drop PDFs here or click to choose", file_aria="Choose PDF files",
        dz_title="Drop your PDFs here", dz_more="Add more PDFs",
        dz_sub="Several at once · works with files on your phone too", dz_btn="Choose PDFs", dz_formats="PDF (up to 60 pages)",
        list_title="Selected PDFs", list_total="{n} files · {size}", remove="Remove",
        panel_aria="Settings", step1="File size (up to)", kb_hint="1KB = 1,000 bytes", kb_aria="Target file size",
        custom="Custom", kb_ph="e.g. 300", kb_custom_aria="Target size in KB", kb_suffix="KB or less",
        step2="Color", color_aria="Color", color_keep="Keep color", color_gray="Grayscale (smaller)",
        note="Each page is converted to an image and compressed, so the resized PDF no longer has selectable or searchable text. Best for scanned documents and files you only need to submit.",
        btn_empty="Choose a PDF first", btn_need_kb="Choose a file size", btn_one="Resize PDF", btn_many="Resize all {n} PDFs",
        processing="Working on it...", results_aria="Results", results_title="All done", zip="Download all as ZIP",
        why_kicker="Why Haebom", why_h2="Why is it safe to use?",
        why1_t="No upload", why1_p="Your PDF is processed only inside your device and never sent to a server. Safe for documents.",
        why2_t="Fits your limit", why2_p="We find the sharpest quality that stays within the size you choose.",
        why3_t="No sign-up, no watermark", why3_p="Open the link and use it. No usage limits and no paid plan.",
        faq_h2="Frequently asked questions",
        msg_bad="{n} file(s) were skipped because they are not PDFs.",
        sum_label="Settings", sum_kb="{kb} or less", sum_kb_none="Choose a file size", sum_color="Keep color", sum_gray="Grayscale",
        st_read="Reading file", st_page="Page {i}/{n}", st_fit="Fitting to the limit",
        err_pages="{name}: {n} pages is too many. Up to {max} pages at a time. Please split it first.",
        err_open="{name}: could not open this PDF. It may be password-protected or damaged.",
        pages="{n} pages", kept="Already smaller than the limit, so the original is kept", ok_target="✓ Fits within {kb}",
        warn_res="⚠ Could not get under {kb}. Try a higher limit or choose Grayscale.",
        save="Save", zip_name="pdf-resized.zip",
    ),
}

FAQ = {
    "ko": [
        ("PDF 용량을 줄이면 화질이 나빠지나요?", "용량을 줄이는 만큼 어느 정도 선명도는 낮아져요. 해봄은 목표 용량을 넘지 않는 선에서 가장 높은 화질을 찾아 저장하고, 필요할 때만 해상도를 낮춰요. 화면에서 읽는 서류는 대부분 문제없어요."),
        ("PDF를 100KB·200KB·500KB로 줄이려면 어떻게 하나요?", "PDF를 올리고 목표 용량(100KB~5MB 또는 직접 입력)을 고른 뒤 ‘PDF 용량 줄이기’를 누르면 돼요. 쪽 수가 많거나 색이 많은 문서는 ‘흑백’을 고르면 더 작아져요."),
        ("제 PDF가 서버에 올라가나요?", "아니요. 변환은 모두 내 브라우저 안에서 이뤄지고 파일은 외부로 전송되지 않아요. 신분증 사본이나 증빙 서류도 안심하고 쓰세요."),
        ("줄인 PDF에서 글자를 복사하거나 검색할 수 있나요?", "아니요. 각 쪽을 이미지로 바꿔 압축하기 때문에 글자를 선택·복사·검색할 수 없어요. 제출용·스캔본에 알맞고, 글자 복사가 필요하면 원본을 쓰세요."),
        ("KB와 MB는 어떻게 계산하나요?", "접수 사이트마다 1KB를 1,000바이트로 세기도, 1,024바이트로 세기도 해요. 해봄은 1KB를 1,000바이트로 계산해서 어느 기준에서도 목표 용량을 넘지 않게 맞춰요. 1MB는 1,000KB예요."),
        ("“목표 용량까지 줄이지 못했어요”가 나오면 어떻게 하나요?", "쪽 수가 많은데 목표가 너무 작으면 맞추기 어려워요. 목표 용량을 조금 키우거나, ‘흑백’을 선택하거나, PDF를 나눠서 줄여 보세요."),
        ("암호가 걸린 PDF도 되나요?", "아니요. 암호가 걸린 PDF는 열 수 없어요. 암호를 해제한 파일을 올려 주세요."),
        ("몇 쪽까지 되나요?", "브라우저 메모리를 지키기 위해 한 파일에 최대 60쪽까지 줄일 수 있어요. 더 많으면 나눠서 줄여 주세요."),
        ("스마트폰에서도 쓸 수 있나요?", "네. 휴대폰의 파일에서 PDF를 선택해 줄이고 바로 저장할 수 있어요."),
    ],
    "en": [
        ("Does reducing the PDF size hurt quality?", "A smaller file always means some loss of sharpness. Haebom finds the highest quality that stays within your limit and lowers the resolution only when it has to. Documents read on screen are usually fine."),
        ("How do I resize a PDF to 100KB, 200KB or 500KB?", "Add your PDF, pick the size limit (100KB to 5MB, or type your own) and press Resize PDF. For documents with many pages or colors, choose Grayscale to get a smaller file."),
        ("Is my PDF uploaded to a server?", "No. Everything happens inside your browser and the file is never sent anywhere. That makes it safe for ID copies and supporting documents."),
        ("Can I copy or search text in the resized PDF?", "No. Each page is converted to an image and compressed, so the text can no longer be selected, copied or searched. It suits files you only submit, and scans. Keep the original if you need the text."),
        ("How are KB and MB counted?", "Some portals count 1KB as 1,000 bytes and others as 1,024. Haebom uses 1,000 bytes per KB, so the result stays under the limit either way. 1MB is 1,000KB."),
        ("What if it says it could not get under my limit?", "A document with many pages and a very small limit is hard to fit. Raise the limit a little, choose Grayscale, or split the PDF and resize the parts."),
        ("Does it work with password-protected PDFs?", "No. A password-protected PDF cannot be opened. Please remove the password first."),
        ("How many pages can it handle?", "To protect your browser's memory, up to 60 pages per file. For longer documents, split them first."),
        ("Can I use it on my phone?", "Yes. Pick a PDF from your phone's files, resize it and save the result directly."),
    ],
}

PAGES = {
    "ko": dict(
        title="PDF 용량 줄이기 (KB 맞추기) — 100KB·200KB·500KB 무료 | 해봄",
        h1="PDF 용량, <em>원하는 KB</em>로 줄이기",
        desc="PDF 용량을 100KB·200KB·500KB·1MB 등 원하는 크기 이하로 줄이세요. 회원가입·업로드 없이 브라우저에서 무료로 바로, 파일은 내 기기 밖으로 나가지 않아요.",
        lead="접수 사이트에서 <strong>“PDF는 200KB 이하”</strong>라는 안내 때문에 막혔나요? PDF를 올리고 용량만 고르면 그 용량 <strong>이하로 가장 선명하게</strong> 줄여 드려요. 파일은 내 기기 밖으로 나가지 않아요.",
        section_title="이럴 때 쓰세요",
        section_html="<ul><li><strong>온라인 접수·지원서</strong>의 PDF 첨부에서 “용량 초과” 오류가 날 때</li><li>스캔한 <strong>증빙 서류·신분증 사본</strong>을 KB 제한에 맞춰야 할 때</li><li>메일·게시판에 올릴 PDF가 너무 커서 <strong>용량만 줄이고 싶을 때</strong></li></ul><p>쪽을 이미지로 바꿔 압축하는 방식이라 줄인 PDF에서는 글자를 선택·복사할 수 없어요.</p>",
        kw="PDF 용량 줄이기, PDF 용량 줄이는 법, PDF 100KB, PDF 200KB, PDF 압축, PDF 파일 크기 줄이기, PDF KB 줄이기",
        crumb="PDF 용량 줄이기", kb="200",
    ),
    "en": dict(
        title="Resize PDF to KB Online — Compress PDF to 100KB, 200KB | Haebom",
        h1="Resize a PDF to <em>exact KB</em> online",
        desc="Free online PDF resizer in KB. Resize or compress a PDF to 100KB, 200KB, 500KB or any size. No upload, no sign-up: it works inside your browser.",
        lead="Stuck on a form that says <strong>“PDF must be under 200KB”</strong>? Add your PDF, pick the KB limit, and get the <strong>sharpest result that fits</strong>. Your file never leaves your device.",
        section_title="When to use it",
        section_html="<ul><li>An <strong>application form or exam portal</strong> rejects your PDF for being too large</li><li>You need to fit <strong>scanned documents or ID copies</strong> into a KB limit</li><li>A PDF is too big to email or upload and you just want to <strong>shrink the file size</strong></li></ul><p>Pages are converted to images and compressed, so text in the resized PDF can no longer be selected or copied.</p>",
        kw="resize pdf, pdf resize, resize pdf to 200kb, resize pdf kb, compress pdf to 100kb, resize image pdf, online resize pdf, reduce pdf size in kb",
        crumb="Resize PDF to KB", kb="200",
    ),
}


def esc(s):
    return html.escape(s, quote=True)


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s)


def render(lang, tpl, ver):
    St, P = S[lang], PAGES[lang]
    url = BASE + PATH[lang]
    hreflangs = "\n".join(
        [f'  <link rel="alternate" hreflang="{HREFLANG[l]}" href="{BASE}{PATH[l]}" />' for l in LANGS]
        + [f'  <link rel="alternate" hreflang="x-default" href="{BASE}{PATH["ko"]}" />'])
    opts = "\n".join(f'          <option value="{PATH[l]}"{" selected" if l == lang else ""}>{LANG_NAME[l]}</option>' for l in LANGS)
    faq = FAQ[lang]
    faq_html = "\n".join(f"<details{' open' if i == 0 else ''}><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for i, (q, a) in enumerate(faq))
    ld = [
        {"@context": "https://schema.org", "@type": "WebApplication", "name": f"{strip_tags(P['h1'])} | {St['brand']}", "url": url,
         "description": P["desc"], "applicationCategory": "BusinessApplication", "operatingSystem": "Any", "inLanguage": HREFLANG[lang],
         "offers": {"@type": "Offer", "price": "0", "priceCurrency": "KRW" if lang == "ko" else "USD"}},
        {"@context": "https://schema.org", "@type": "FAQPage",
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]},
        {"@context": "https://schema.org", "@type": "BreadcrumbList",
         "itemListElement": [{"@type": "ListItem", "position": 1, "name": St["brand"], "item": BASE + "/"},
                             {"@type": "ListItem", "position": 2, "name": P["crumb"], "item": url}]},
    ]
    pr = {"t": St, "worker": WORKER}
    repl = {
        "LANG": HREFLANG[lang], "OGLOCALE": OG[lang], "TITLE": esc(P["title"]), "DESC": esc(P["desc"]), "KEYWORDS": esc(P["kw"]), "URL": url,
        "HREFLANGS": hreflangs, "LANGSELECT": opts, "H1": P["h1"], "LEAD": P["lead"], "SECTION_TITLE": esc(P["section_title"]),
        "SECTION_HTML": P["section_html"], "DATA_KB": P["kb"], "PR_JSON": json.dumps(pr, ensure_ascii=False).replace("</", "<\\/"),
        "JSONLD": "\n".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + "</script>" for x in ld),
        "FAQ": faq_html, "HEADER_TITLE": esc(St["tool"]), "VER": ver,
    }
    out = tpl
    for k, v in repl.items():
        out = out.replace("%%" + k + "%%", v)
    out = re.sub(r"%%s_(\w+)%%", lambda m: esc(St[m.group(1)]), out)
    left = re.findall(r"%%\w+%%", out)
    assert not left, (lang, left)
    return out


def update_sitemap():
    sm = ROOT / "sitemap.xml"
    text = sm.read_text(encoding="utf-8")
    text = re.sub(r"  <!-- pdf-compress:start -->.*?<!-- pdf-compress:end -->\n", "", text, flags=re.S)
    block = "  <!-- pdf-compress:start -->\n"
    for lang in LANGS:
        block += f"  <url>\n    <loc>{BASE}{PATH[lang]}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n"
        for l in LANGS:
            block += f'    <xhtml:link rel="alternate" hreflang="{HREFLANG[l]}" href="{BASE}{PATH[l]}" />\n'
        block += f'    <xhtml:link rel="alternate" hreflang="x-default" href="{BASE}{PATH["ko"]}" />\n  </url>\n'
    block += "  <!-- pdf-compress:end -->\n"
    text = text.replace("  <!-- PDF Tool - Korean (default) -->", block + "  <!-- PDF Tool - Korean (default) -->", 1)
    sm.write_text(text, encoding="utf-8")


def main():
    tpl = (ROOT / "scripts" / "pdf_compress_template.html").read_text(encoding="utf-8")
    ver = hashlib.md5(b"".join((p).read_bytes() for p in (ROOT / "photo-resize" / "style.css", OUT / "style.css", OUT / "app.js"))).hexdigest()[:8]
    for lang in LANGS:
        target = ROOT / PATH[lang].lstrip("/") / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render(lang, tpl, ver), encoding="utf-8")
    update_sitemap()
    print(f"{len(LANGS)} pages generated")


if __name__ == "__main__":
    main()
