/**
 * 모듈: check_pages
 * 경로: scripts/check_pages.js
 * 목적: 시각화 HTML 페이지가 "브라우저에서 실제로 보이는지"를 브라우저 없이 검사한다.
 *
 * 기존 regression.yml 의 문자열 검사(atom-one-dark / LiveDataPane 등)는
 * 아래 세 가지 실제 장애를 하나도 잡지 못했다. 그래서 추가한다.
 *
 *   1) Babel 구문 오류      → 페이지가 통째로 빈 화면이 된다 (HTTP 200 이라 눈에 안 띔)
 *   2) hljs 가 React 자식 덮어쓰기 → 코드 패널이 통째로 빈다
 *   3) textContent 리셋 누락  → 스텝을 넘겨도 코드가 한 박자 뒤처진다
 *
 * 주요 의존성: @babel/standalone (CI 에서 npm i 로 설치, 페이지와 같은 7.25.6)
 * 실행: node scripts/check_pages.js
 * 종료 코드: 위반이 하나라도 있으면 1
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BABEL_SCRIPT = /<script type="text\/babel">([\s\S]*?)<\/script>/;

/** 루트 index.html 의 CATS 배열에 등록된 주제 폴더만 검사 대상으로 삼는다 */
function registeredTopics() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/\['([a-z0-9-]+)','[^']*','[^']*',\d+,\d+\]/g)].map((m) => m[1]);
}

/** 주제 폴더 아래 시각화 HTML 을 모은다 (허브·뷰어 제외) */
function collectPages() {
  const skip = /index\.html$|curriculum-viewer|viewer\.html$|project-viewer/;
  const out = [];
  const walk = (dir, rel) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      const r = rel + e.name;
      if (e.isDirectory()) {
        if (e.name !== 'node_modules') walk(full, r + '/');
      } else if (e.name.endsWith('.html') && !skip.test(r)) {
        out.push({ full, rel: r });
      }
    }
  };
  for (const t of registeredTopics()) walk(path.join(ROOT, t), t + '/');
  return out;
}

/** 1) text/babel 스크립트가 실제로 파싱되는가 */
function checkSyntax(Babel, src, rel) {
  const m = src.match(BABEL_SCRIPT);
  if (!m) return null;
  try {
    Babel.transform(m[1], { presets: ['react'], filename: rel });
    return null;
  } catch (e) {
    return 'Babel 구문 오류 — ' + String(e.message).split('\n')[0];
  }
}

/** 2) hljs 대상 노드가 React 가 그린 줄들을 자식으로 갖고 있지 않은가 */
function checkHljsTarget(src) {
  if (!src.includes('hljs.highlightElement(codeRef.current)')) return null;
  const i = src.indexOf('ref={codeRef}');
  if (i === -1) return null;
  const gt = src.indexOf('>', i);
  if (gt === -1) return null;
  const after = src.slice(gt + 1, gt + 400);
  const mapAt = after.indexOf('.map(');
  const joinAt = after.indexOf(".join('");
  if (mapAt > -1 && (joinAt === -1 || mapAt < joinAt)) {
    return 'hljs 대상 노드가 React 자식(.map)을 갖고 있다 — 하이라이팅이 줄 div 를 덮어써 코드 패널이 빈다. 숨은 <pre> 에 걸어라';
  }
  return null;
}

/** 3) 하이라이팅 직전에 textContent 를 현재 코드로 되돌리는가 */
function checkTextContentReset(src) {
  const call = 'window.hljs.highlightElement(codeRef.current);';
  const i = src.indexOf(call);
  if (i === -1) return null;
  // codeRef 가 어떤 요소에도 붙어 있지 않으면 hljs 가 아예 동작하지 않으므로 대상이 아니다
  if (!src.includes('ref={codeRef}')) return null;
  const before = src.slice(Math.max(0, i - 400), i);
  if (!before.includes('codeRef.current.textContent')) {
    return 'highlightElement 앞에 codeRef.current.textContent 리셋이 없다 — 스텝을 넘겨도 코드가 한 박자 뒤처진다';
  }
  return null;
}

function main() {
  let Babel;
  try {
    Babel = require('@babel/standalone');
  } catch (e) {
    console.error('@babel/standalone 이 없습니다. `npm i @babel/standalone@7.25.6 --no-save` 후 다시 실행하세요.');
    process.exit(2);
  }

  const pages = collectPages();
  const violations = [];
  for (const { full, rel } of pages) {
    const src = fs.readFileSync(full, 'utf8');
    for (const check of [
      () => checkSyntax(Babel, src, rel),
      () => checkHljsTarget(src),
      () => checkTextContentReset(src),
    ]) {
      const msg = check();
      if (msg) violations.push(rel + '\n      ' + msg);
    }
  }

  console.log('검사 페이지: ' + pages.length);
  if (violations.length === 0) {
    console.log('위반 0건 — 통과');
    return;
  }
  console.log('위반 ' + violations.length + '건:');
  violations.forEach((v) => console.log('  - ' + v));
  process.exit(1);
}

main();
