#!/usr/bin/env node
/**
 * 비공개 페이지 암호화 (해봄 /private/)
 *
 * 저장소가 공개라서 원문은 절대 이 저장소에 두지 않는다.
 * 원문 HTML은 저장소 밖 폴더(기본: ../haebom-private)에 두고, 이 스크립트가 암호화한 결과만 /private/ 아래에 만든다.
 * 비밀번호는 실행할 때 직접 입력한다(어디에도 저장하지 않음).
 *
 * 사용:
 *   node scripts/encrypt_private.mjs                  # 저장소 루트에서. 비밀번호를 두 번 입력
 *   node scripts/encrypt_private.mjs --src <원문폴더> --out <출력폴더>
 *
 * 방식: PBKDF2-SHA256(600,000회)로 비밀번호에서 키를 만들고 AES-256-GCM으로 암호화.
 *       브라우저는 같은 방식(Web Crypto)으로 풀어서 원래 페이지를 그대로 보여준다.
 * 주의: .html만 암호화한다. 이미지 등 다른 파일은 암호화되지 않으므로 복사하지 않는다(필요하면 HTML 안에 data URI로 넣기).
 *       파일·폴더 이름은 저장소에서 보이므로 내용을 짐작할 수 없는 이름을 쓴다.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const SRC = path.resolve(opt('--src', path.join(ROOT, '..', 'haebom-private')));
const OUT = path.resolve(opt('--out', path.join(ROOT, 'private')));
const ITER = 600000;
const MIN_LEN = 10;

function ask(q) {   // 입력한 글자를 화면에 표시하지 않음
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(q)) rl.output.write(s); };
    rl.question(q, (a) => { rl.close(); process.stdout.write('\n'); resolve(a); });
  });
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.name.startsWith('.')) return [];
    return e.isDirectory() ? walk(p) : [p];
  });
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function wrapper({ salt, iv, data }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow, noarchive" />
<title>비공개 페이지 | 해봄</title>
<link rel="icon" href="data:," />
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
<style>
  :root { --bg:#fafdfb; --card:#fff; --border:#e2efe8; --text:#0f1a14; --muted:#5d7469; --accent:#10b981; --accent-hover:#059669; --danger:#dc2626; }
  @media (prefers-color-scheme: dark) { :root { --bg:#09100d; --card:#121c17; --border:#1f3028; --text:#ecf3ef; --muted:#8aa196; --accent:#34d399; --accent-hover:#10b981; --danger:#f87171; } }
  * { box-sizing: border-box; margin: 0; }
  body { min-height: 100dvh; display: grid; place-items: center; padding: 24px 16px; background: var(--bg); color: var(--text); font-family: "Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", sans-serif; -webkit-font-smoothing: antialiased; }
  form { width: min(100%, 360px); background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 28px 24px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 12px 40px rgba(16,185,129,.12); }
  .ico { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; background: rgba(16,185,129,.12); color: var(--accent); }
  h1 { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
  p { font-size: 14px; color: var(--muted); line-height: 1.6; }
  input[type=password] { height: 46px; border: 1.5px solid var(--border); border-radius: 12px; padding: 0 14px; font: inherit; font-size: 16px; background: var(--bg); color: var(--text); }
  input[type=password]:focus { outline: none; border-color: var(--accent); }
  label { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--muted); cursor: pointer; }
  label input { accent-color: var(--accent); width: 16px; height: 16px; }
  button { height: 48px; border: 0; border-radius: 12px; background: var(--accent); color: #fff; font: inherit; font-weight: 800; font-size: 15px; cursor: pointer; }
  button:hover { background: var(--accent-hover); }
  button:disabled { opacity: .6; cursor: wait; }
  .err { color: var(--danger); font-size: 13.5px; font-weight: 600; min-height: 1em; }
</style>
</head>
<body>
<form id="f" autocomplete="off">
  <div class="ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
  <h1>비공개 페이지</h1>
  <p>비밀번호를 입력해야 볼 수 있어요.</p>
  <input type="password" id="pw" placeholder="비밀번호" aria-label="비밀번호" autocomplete="current-password" autofocus />
  <label><input type="checkbox" id="remember" /> 이 기기에서 기억하기</label>
  <button id="go" type="submit">열기</button>
  <div class="err" id="err" role="alert"></div>
</form>
<script>
(function () {
  var P = { salt: "${salt}", iv: "${iv}", data: "${data}", iter: ${ITER} };
  var KEY = 'haebom-private:' + P.salt;   // 비밀번호를 다시 암호화하면 salt가 바뀌어 기억한 값이 자동으로 무효가 됨
  function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function toB64(buf) { var u = new Uint8Array(buf), s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  async function derive(pw) {
    var base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(P.salt), iterations: P.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
  }
  async function open(key) {
    var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(P.iv) }, key, b64(P.data));
    var html = new TextDecoder().decode(plain);
    document.open(); document.write(html); document.close();
  }
  if (/[?&]lock\\b/.test(location.search)) { try { localStorage.removeItem(KEY); } catch (e) {} }
  // 기억한 키가 있으면 바로 열기
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      // 페이지를 다 읽은 뒤에 바꿔야 document.write가 화면 전체를 교체함
      var ready = new Promise(function (r) { if (document.readyState === 'complete') r(); else window.addEventListener('load', function () { r(); }); });
      ready.then(function () { return crypto.subtle.importKey('raw', b64(saved), { name: 'AES-GCM' }, false, ['decrypt']); })
        .then(open).catch(function () { try { localStorage.removeItem(KEY); } catch (e) {} });
    }
  } catch (e) {}
  document.getElementById('f').addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = document.getElementById('go'), err = document.getElementById('err'), pw = document.getElementById('pw').value;
    if (!pw) return;
    btn.disabled = true; btn.textContent = '여는 중…'; err.textContent = '';
    try {
      var key = await derive(pw);
      if (document.getElementById('remember').checked) {
        try { localStorage.setItem(KEY, toB64(await crypto.subtle.exportKey('raw', key))); } catch (e2) {}
      }
      await open(key);
    } catch (x) {
      err.textContent = '비밀번호가 맞지 않아요.'; btn.disabled = false; btn.textContent = '열기';
    }
  });
})();
</script>
</body>
</html>
`;
}

async function main() {
  if (!fs.existsSync(SRC)) { console.error(`원문 폴더가 없습니다: ${SRC}`); process.exit(1); }
  if (SRC.startsWith(ROOT + path.sep)) { console.error('원문 폴더가 공개 저장소 안에 있습니다. 저장소 밖으로 옮겨 주세요.'); process.exit(1); }
  const files = walk(SRC);
  const html = files.filter((f) => /\.html?$/i.test(f));
  const skipped = files.filter((f) => !/\.html?$/i.test(f));
  if (!html.length) { console.error(`암호화할 .html 파일이 없습니다: ${SRC}`); process.exit(1); }

  let pw = process.env.HAEBOM_PRIVATE_PASSWORD;   // 자동 테스트용. 평소에는 직접 입력
  if (!pw) {
    pw = await ask('비밀번호: ');
    const again = await ask('한 번 더: ');
    if (pw !== again) { console.error('두 비밀번호가 다릅니다.'); process.exit(1); }
  }
  if (pw.length < MIN_LEN) { console.error(`비밀번호는 ${MIN_LEN}자 이상으로 해 주세요. (예: 단어 2~3개와 숫자를 이어 쓰기)`); process.exit(1); }

  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(pw, salt, ITER, 32, 'sha256');
  fs.rmSync(OUT, { recursive: true, force: true });   // 지운 원문이 남지 않도록 출력 폴더를 새로 만듦
  for (const f of html) {
    const rel = path.relative(SRC, f);
    const iv = crypto.randomBytes(12);
    const c = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([c.update(fs.readFileSync(f)), c.final(), c.getAuthTag()]);
    const dest = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, wrapper({ salt: salt.toString('base64'), iv: iv.toString('base64'), data: enc.toString('base64') }));
    console.log('암호화:', path.relative(ROOT, dest));
  }
  if (skipped.length) console.log(`\n건너뜀(.html이 아님, 암호화되지 않으므로 올리지 않음): ${skipped.map((f) => path.relative(SRC, f)).join(', ')}`);
  console.log(`\n완료: ${html.length}개. 확인 후 커밋하세요. (원문 폴더 ${SRC} 는 커밋하지 않습니다)`);
}

main();
