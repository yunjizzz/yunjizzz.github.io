#!/usr/bin/env python3
"""photo-resize 다국어(ko/en/id/pt) 검색 랜딩 페이지 생성기.

실행: python3 scripts/gen_photo_resize.py   (저장소 루트에서)
- 문구·규격·FAQ·페이지 정의는 scripts/photo_resize_i18n.py, 틀은 scripts/photo_resize_template.html
- 도구 본체(photo-resize/app.js, style.css)는 모든 페이지가 공유
- sitemap.xml의 photo-resize 구간(언어별 hreflang 포함)도 함께 갱신
"""
import hashlib
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import photo_resize_i18n as I  # noqa: E402

OUT = ROOT / "photo-resize"
BASE = "https://haebom.app"


def esc(s):
    return html.escape(s, quote=True)


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s)


def page_path(lang, p):
    return I.BASE_PATH[lang] + (p["slug"] + "/" if p["slug"] else "")


def collect_groups():
    """group -> {lang: path}"""
    g = {}
    for lang in I.LANGS:
        for p in I.PAGES[lang]:
            g.setdefault(p["group"], {})[lang] = page_path(lang, p)
    return g


def render(lang, p, tpl, groups, ver):
    S = I.S[lang]
    path = page_path(lang, p)
    url = BASE + path
    alts = groups[p["group"]]

    # hreflang (같은 내용의 다른 언어 페이지가 있을 때만)
    hreflangs = ""
    if len(alts) > 1:
        lines = [f'  <link rel="alternate" hreflang="{I.HREFLANG[l]}" href="{BASE}{alts[l]}" />' for l in I.LANGS if l in alts]
        xd = alts.get("ko") or alts[next(iter(alts))]
        lines.append(f'  <link rel="alternate" hreflang="x-default" href="{BASE}{xd}" />')
        hreflangs = "\n".join(lines)

    # 언어 선택 (같은 내용 페이지가 없으면 그 언어의 대표 페이지로)
    opts = []
    for l in I.LANGS:
        dest = alts.get(l) or I.BASE_PATH[l]
        sel = " selected" if l == lang else ""
        opts.append(f'          <option value="{dest}"{sel}>{I.LANG_NAME[l]}</option>')

    # 규격
    presets = I.PRESETS[lang]
    pids = [x[0] for x in presets]
    want = p["data"]["preset"]
    assert want in pids, (lang, p["slug"], want)
    radios = "\n".join(
        f'            <label class="opt"><input type="radio" name="preset" value="{pid}"{" checked" if pid == want else ""} />'
        f'<span>{esc(big)}<small>{esc(small)}</small></span></label>'
        for pid, big, small, w, h, tag in presets)
    first = presets[0]

    # FAQ
    faq = ([p["faq_first"]] if p.get("faq_first") else []) + I.FAQ[lang]
    faq_html = "\n".join(
        f"<details{' open' if i == 0 else ''}><summary>{esc(q)}</summary><p>{esc(a)}</p></details>"
        for i, (q, a) in enumerate(faq))

    # 구조화 데이터
    crumbs = [(S["brand"], f"{BASE}/"), (S["tool"], BASE + I.BASE_PATH[lang])]
    if p["slug"]:
        crumbs.append((p["crumb"], url))
    ld = [
        {
            "@context": "https://schema.org", "@type": "WebApplication",
            "name": f"{strip_tags(p['h1'])} | {S['brand']}", "url": url, "description": p["desc"],
            "applicationCategory": "MultimediaApplication", "operatingSystem": "Any", "inLanguage": I.HREFLANG[lang],
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "KRW" if lang == "ko" else "USD"},
        },
        {
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq],
        },
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)],
        },
    ]
    pr = {
        "t": S,
        "presets": {pid: {"w": w, "h": h, "tag": tag} for pid, big, small, w, h, tag in presets},
        "first": first[0],
    }
    d = p["data"]
    repl = {
        "LANG": I.HREFLANG[lang].split("-")[0], "OGLOCALE": I.OG_LOCALE[lang],
        "TITLE": esc(p["title"]), "DESC": esc(p["desc"]), "KEYWORDS": esc(p["kw"]), "URL": url,
        "HREFLANGS": hreflangs, "LANGSELECT": "\n".join(opts),
        "H1": p["h1"], "LEAD": p["lead"], "SECTION_TITLE": esc(p["section_title"]), "SECTION_HTML": p["section_html"],
        "DATA_KB": d["kb"], "DATA_MODE": d["mode"], "DATA_PRESET": d["preset"],
        "PRESET_RADIOS": radios, "FIRST_W": str(first[3]), "FIRST_H": str(first[4]),
        "PR_JSON": json.dumps(pr, ensure_ascii=False).replace("</", "<\\/"),
        "JSONLD": "\n".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + "</script>" for x in ld),
        "FAQ": faq_html, "HEADER_TITLE": esc(S["tool"]), "VER": ver,
    }
    out = tpl
    for k, v in repl.items():
        out = out.replace("%%" + k + "%%", v)
    out = re.sub(r"%%s_(\w+)%%", lambda m: esc(S[m.group(1)]), out)   # 화면 문구
    left = re.findall(r"%%\w+%%", out)
    assert not left, (lang, p["slug"], left)
    return out


def update_sitemap(groups):
    sm = ROOT / "sitemap.xml"
    text = sm.read_text(encoding="utf-8")
    text = re.sub(r"  <!-- photo-resize:start -->.*?<!-- photo-resize:end -->\n", "", text, flags=re.S)
    block = "  <!-- photo-resize:start -->\n"
    for lang in I.LANGS:
        for p in I.PAGES[lang]:
            alts = groups[p["group"]]
            pri = "0.9" if (not p["slug"] and lang == "ko") else ("0.8" if not p["slug"] else "0.7")
            block += f"  <url>\n    <loc>{BASE}{page_path(lang, p)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>{pri}</priority>\n"
            if len(alts) > 1:
                for l in I.LANGS:
                    if l in alts:
                        block += f'    <xhtml:link rel="alternate" hreflang="{I.HREFLANG[l]}" href="{BASE}{alts[l]}" />\n'
                xd = alts.get("ko") or alts[next(iter(alts))]
                block += f'    <xhtml:link rel="alternate" hreflang="x-default" href="{BASE}{xd}" />\n'
            block += "  </url>\n"
    block += "  <!-- photo-resize:end -->\n"
    text = text.replace("  <!-- PDF Tool - Korean (default) -->", block + "  <!-- PDF Tool - Korean (default) -->", 1)
    sm.write_text(text, encoding="utf-8")


def main():
    tpl = (ROOT / "scripts" / "photo_resize_template.html").read_text(encoding="utf-8")
    ver = hashlib.md5((OUT / "style.css").read_bytes() + (OUT / "app.js").read_bytes()).hexdigest()[:8]  # 파일이 바뀌면 주소도 바뀌어 캐시가 갱신됨
    groups = collect_groups()
    n = 0
    for lang in I.LANGS:
        for p in I.PAGES[lang]:
            target = ROOT / page_path(lang, p).lstrip("/") / "index.html"
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(render(lang, p, tpl, groups, ver), encoding="utf-8")
            n += 1
    update_sitemap(groups)
    print(f"{n} pages generated")


if __name__ == "__main__":
    main()
