#!/usr/bin/env node
/**
 * IDEAS.md의 최신 주간 리포트 항목을 비공개 체크리스트(haebom-private/new/index.html)에
 * 기존 데이터를 보존한 채 추가하고, 해당 주차 항목에 NEW 배지 날짜(LATEST_BATCH)를 반영한다.
 *
 * 사용:
 *   node scripts/sync_ideas_to_private.mjs
 *   node scripts/sync_ideas_to_private.mjs --ideas IDEAS.md --target ../haebom-private/new/index.html
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const IDEAS_PATH = path.resolve(opt('--ideas', path.join(ROOT, 'IDEAS.md')));
const TARGET_PATH = path.resolve(opt('--target', path.join(ROOT, '..', 'haebom-private', 'new', 'index.html')));
const TARGET_DATE = opt('--date', '');

function stripMarkdown(s) {
  return s
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTitle(s) {
  return stripMarkdown(s)
    .toLowerCase()
    .replace(/[\s·\-_/&(),.:;'"!?]/g, '');
}

function makeItemId(slug, title, usedIds) {
  const cleanSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  let base = cleanSlug ? `idea-${cleanSlug}` : 'idea-item';
  if (!usedIds.has(base)) return base;
  let n = 2;
  while (usedIds.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function classifyCategory(explicitCat, fullText) {
  if (explicitCat) {
    if (explicitCat.includes('업무')) return '업무';
    if (explicitCat.includes('일상')) return '일상';
  }
  const lower = fullText.toLowerCase();
  const workKeywords = [
    'csv', 'json', 'xml', 'excel', '엑셀', '개발자', '데이터 분석', '비즈니스',
    '마케터', '소상공인', 'qr 코드', 'qr코드', '비밀번호', 'password', 'pdf',
    '계약서', '명세서', '서명', '도장', '문서', 'api', '정규식', 'regex', '코드',
    '업무', '세무', '회계', '사업자',
  ];
  const dailyKeywords = [
    'heic', 'heif', '아이폰 사진', '사진', 'exif', '메타데이터', 'gif', '움짤',
    '동영상', '오디오', 'mp3', '음원', '벨소리', '팟캐스트', '소셜 미디어',
    '개인 사진', '일상', '여행', '건강', '가계',
  ];

  let workScore = 0;
  let dailyScore = 0;
  for (const kw of workKeywords) {
    if (lower.includes(kw)) workScore += 1;
  }
  for (const kw of dailyKeywords) {
    if (lower.includes(kw)) dailyScore += 1;
  }
  return workScore > dailyScore ? '업무' : '일상';
}

function buildSummary(oneLiner, analysisText, stackText, slug) {
  if (oneLiner) {
    const clean = stripMarkdown(oneLiner);
    return slug && !clean.includes(slug) ? `${clean} · ${slug}` : clean;
  }
  const cleanAnalysis = stripMarkdown(analysisText);
  const firstSentence = cleanAnalysis.split(/(?<=[.!?다요])\s+/)[0] || cleanAnalysis;
  let summary = firstSentence;
  if (summary.length > 105) {
    summary = `${summary.slice(0, 102).trimEnd()}…`;
  }
  if (stackText) {
    const cleanStack = stripMarkdown(stackText).split(/\s*\(/)[0].split(/(?<=[다요.])\s+/)[0].trim().replace(/\.$/, '');
    if (cleanStack && cleanStack.length <= 48 && summary.length + cleanStack.length < 135) {
      summary = `${summary} (${cleanStack})`;
    }
  }
  return slug && !summary.includes(slug) ? `${summary} · ${slug}` : summary;
}

function parseLatestIdeas(mdText, targetDate) {
  const sectionRegex = /^## 📅 (\d{4}-\d{2}-\d{2})[^\n]*$/gm;
  const matches = [...mdText.matchAll(sectionRegex)];
  if (!matches.length) {
    throw new Error('IDEAS.md에서 주간 리포트 섹션(## 📅 YYYY-MM-DD)을 찾을 수 없습니다.');
  }

  let chosenIndex = 0;
  if (targetDate) {
    chosenIndex = matches.findIndex((m) => m[1] === targetDate);
    if (chosenIndex < 0) {
      throw new Error(`IDEAS.md에서 ${targetDate} 날짜의 리포트를 찾을 수 없습니다.`);
    }
  }

  const reportDate = matches[chosenIndex][1];
  const start = matches[chosenIndex].index + matches[chosenIndex][0].length;
  const end = chosenIndex + 1 < matches.length ? matches[chosenIndex + 1].index : mdText.length;
  const sectionBody = mdText.slice(start, end);

  const itemRegex = /^### \d+\.\s+(.+)$/gm;
  const itemMatches = [...sectionBody.matchAll(itemRegex)];
  const parsed = [];

  for (let i = 0; i < itemMatches.length; i += 1) {
    const headLine = itemMatches[i][1].trim();
    const blockStart = itemMatches[i].index + itemMatches[i][0].length;
    const blockEnd = i + 1 < itemMatches.length ? itemMatches[i + 1].index : sectionBody.length;
    const block = sectionBody.slice(blockStart, blockEnd);

    const slugMatch = headLine.match(/`(\/[^`]+\/)`/);
    const slug = slugMatch ? slugMatch[1] : '';
    let title = headLine
      .replace(/\s*\(`\/[^`]+\/`\)/, '')
      .replace(/\s*—.*$/, '')
      .trim();
    title = stripMarkdown(title).replace(/^\[(.*)\]$/, '$1').trim();

    const catMatch = block.match(/-\s*\*\*추천 분류\*\*:\s*([^\n]+)/);
    const oneLinerMatch = block.match(/-\s*\*\*한 줄 요약\*\*:\s*([^\n]+)/);
    const analysisMatch = block.match(/-\s*\*\*수요 대비 공급 분석\*\*:\s*\n\s*-\s*([^\n]+)/);
    const stackMatch = block.match(/-\s*\*\*클라이언트 기술 스택\*\*:\s*([^\n]+)/);

    const category = classifyCategory(catMatch ? catMatch[1] : '', `${title}\n${block}`);
    const desc = buildSummary(
      oneLinerMatch ? oneLinerMatch[1] : '',
      analysisMatch ? analysisMatch[1] : '',
      stackMatch ? stackMatch[1] : '',
      slug,
    );

    if (title) {
      parsed.push({ title, slug, category, desc });
    }
  }

  return { reportDate, items: parsed };
}

function findDataAssignmentBounds(html) {
  const marker = 'var DATA =';
  const startIdx = html.indexOf(marker);
  if (startIdx < 0) {
    throw new Error('대상 HTML에서 `var DATA =` 선언을 찾을 수 없습니다.');
  }
  const arrStart = html.indexOf('[', startIdx);
  if (arrStart < 0) {
    throw new Error('`var DATA =` 뒤에서 배열 시작 `[`를 찾을 수 없습니다.');
  }

  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = arrStart; i < html.length; i += 1) {
    const ch = html[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
    } else if (ch === '[') {
      depth += 1;
    } else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        const semi = html.indexOf(';', i);
        if (semi < 0) {
          throw new Error('`var DATA = [...]` 끝 세미콜론을 찾을 수 없습니다.');
        }
        return { startIdx, arrStart, arrEnd: i + 1, semiIdx: semi };
      }
    }
  }
  throw new Error('`var DATA = [...]` 배열 닫힘 괄호를 찾지 못했습니다.');
}

function jsString(value) {
  return JSON.stringify(String(value));
}

function serializeData(data) {
  const sections = data.map((sec) => {
    const itemsText = sec.items
      .map((it) => {
        const tuple = [jsString(it[0]), jsString(it[1]), jsString(it[2] ?? '')];
        if (it[3]) tuple.push(jsString(it[3]));
        return `      [${tuple.join(', ')}]`;
      })
      .join(',\n');
    return `    { title: ${jsString(sec.title)}, items: [\n${itemsText}\n    ]}`;
  });
  return `var DATA = [\n${sections.join(',\n')}\n  ];`;
}

function main() {
  if (!fs.existsSync(IDEAS_PATH)) {
    throw new Error(`IDEAS.md 파일이 없습니다: ${IDEAS_PATH}`);
  }
  if (!fs.existsSync(TARGET_PATH)) {
    throw new Error(`대상 HTML 파일이 없습니다: ${TARGET_PATH}`);
  }

  const mdText = fs.readFileSync(IDEAS_PATH, 'utf-8');
  const { reportDate, items: weeklyItems } = parseLatestIdeas(mdText, TARGET_DATE);
  if (!weeklyItems.length) {
    console.log(`[sync_ideas] ${reportDate} 리포트에서 추출할 항목이 없습니다.`);
    return;
  }

  let html = fs.readFileSync(TARGET_PATH, 'utf-8');
  const bounds = findDataAssignmentBounds(html);
  const dataExpr = html.slice(bounds.arrStart, bounds.arrEnd);
  const data = vm.runInNewContext(`(${dataExpr})`);
  if (!Array.isArray(data)) {
    throw new Error('파싱된 DATA가 배열이 아닙니다.');
  }

  const usedIds = new Set();
  const existingTitles = new Set();
  const sectionByTitle = new Map();

  for (const sec of data) {
    sectionByTitle.set(sec.title, sec);
    for (const it of sec.items || []) {
      if (it[0]) usedIds.add(it[0]);
      if (it[1]) existingTitles.add(normalizeTitle(it[1]));
    }
  }

  let addedCount = 0;
  for (const item of weeklyItems) {
    const norm = normalizeTitle(item.title);
    if (existingTitles.has(norm)) continue;

    const id = makeItemId(item.slug, item.title, usedIds);
    usedIds.add(id);
    existingTitles.add(norm);

    let sec = sectionByTitle.get(item.category);
    if (!sec) {
      sec = { title: item.category, items: [] };
      data.push(sec);
      sectionByTitle.set(item.category, sec);
    }
    sec.items.push([id, item.title, item.desc, reportDate]);
    addedCount += 1;
  }

  const updatedDataBlock = serializeData(data);
  html = html.slice(0, bounds.startIdx) + updatedDataBlock + html.slice(bounds.semiIdx + 1);

  if (/var\s+LATEST_BATCH\s*=\s*['"][^'"]*['"]\s*;/.test(html)) {
    html = html.replace(
      /var\s+LATEST_BATCH\s*=\s*['"][^'"]*['"]\s*;/,
      `var LATEST_BATCH = '${reportDate}';`,
    );
  } else {
    html = html.replace('var DATA =', `var LATEST_BATCH = '${reportDate}';\n  var DATA =`);
  }

  // 결과 <script> 구문 검증
  const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  for (const m of scriptMatches) {
    new vm.Script(m[1]);
  }

  fs.writeFileSync(TARGET_PATH, html, 'utf-8');
  console.log(
    `[sync_ideas] ${reportDate} 기준 ${addedCount}개 신규 항목을 추가했습니다 (총 ${weeklyItems.length}개 중 중복 ${weeklyItems.length - addedCount}개 제외).`,
  );
}

main();
