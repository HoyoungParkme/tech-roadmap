/* I-1-2 모듈 시스템 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행해 본 값(node v24.14.0): math.add(2,3)=5, math.secret=undefined, exports 재할당 → require 결과 {},
 * 캐시: 로그 1번 · a===b true, ESM add(2,3) PI → 5 3.14159, 이름 틀린 import → 첫 줄 실행 전 SyntaxError,
 * 카운터 500ms 뒤 CJS 0 · ESM 4 (20번 모두 4), require(esm) 가능 · TLA 모듈은 ERR_REQUIRE_ASYNC_MODULE,
 * 확장자 생략 → ERR_MODULE_NOT_FOUND. 경로 /srv/app 은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 파일 카드: 제목 띠가 있는 문서
  function file(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: op });
    el('rect', { x, y, width: w, height: 30, rx: 10, fill: o.head || SOFT, opacity: op }); el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: o.stroke || INK, 'stroke-width': 1.2, opacity: op });
    mono(x + 14, y + 21, name, { 'font-size': 15, 'font-weight': 800, opacity: op, fill: o.stroke === GRID ? MUT : o.stroke && o.stroke !== INK ? o.stroke : INK }); }
  // 화살표 곡선 (u 만큼)
  function curve(x1, y1, x2, y2, bend, u, col, o) { if (u <= 0) return; o = o || {};
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - bend;
    const pth = el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, pathLength: 100,
      'marker-end': u >= 0.98 && !o.plain ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
    if (u < 0.98 && !o.dash) pth.setAttribute('stroke-dasharray', `${u * 100} 100`); }

  // ---------- 1. CommonJS ----------
  const MX = 40, MY = 40, MW = 400, MH = 330, AX = 560;
  const SLOT = { add: [130, 150], sub: [270, 150], secret: [200, 230] };
  function s1(t, c) { const { k, u } = c, D = c.beat.cjs, P = c.prev && c.prev.cjs;
    if (k === 3) { // exports 별칭 함정 — 변수 두 개, 객체 둘
      tx(40, 46, 'exports 는 module.exports 를 가리키는 별명일 뿐이다', { 'font-size': 16, 'font-weight': 800 });
      const OB = [520, 150], NB = [520, 300];
      pill(150, 130, 'module.exports', INK, 1, { mono: true, fs: 15 }); pill(150, 210, 'exports', WARN, 1, { mono: true, fs: 15 });
      card(OB[0], OB[1], 220, 70, { rx: 10, text: '{ }', fs: 16, mono: true, stroke: INK });
      mono(OB[0] + 120, OB[1] - 40, '원래 객체', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      grow(232, 130, OB[0] - 112, OB[1] - 10, 1, MUT);
      const sw = E(u, 1.4, 2.0);   // exports = {…} 로 화살표가 옮겨 간다
      if (u < 1.4) grow(200, 210, OB[0] - 112, OB[1] + 14, 1, WARN);
      if (u > 0.4 && u < 1.4) mono(40, 300, 'exports.add = add 였다면 이 객체에 붙어 나갔다', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
      if (u > 1.4) { card(NB[0], NB[1], 220, 64, { rx: 10, text: '{ add }', fs: 16, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.4) });
        grow(200, 220, NB[0] - 112, NB[1], sw, WARN); mono(NB[0] + 120, NB[1] + 52, '새 객체 — 아무도 안 내보낸다', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end' });
        cross(330, 250, 9, pop(u, 1.9)); }
      if (u > 2.1) { card(810, 150, 240, 70, { rx: 10, text: 'require 결과\n{ }  빈 객체', fs: 15, stroke: BAD, color: BAD, s: pop(u, 2.1) }); }
      sub(480, 396, '실행해 보면: exports = { add } 만 쓴 파일을 require 하면 {} 가 온다', fade(u, 2.3), { 'font-size': 14, fill: INK }); return; }
    file(MX, MY, MW, MH, 'math.js', { stroke: INK });
    el('rect', { x: MX + 12, y: MY + 42, width: MW - 24, height: 200, rx: 8, fill: 'none', stroke: MUT, 'stroke-dasharray': '6 5', 'stroke-width': 1.6 });
    tx(MX + 24, MY + 62, '모듈 스코프 — 밖에서 안 보인다', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    lock(MX + MW - 34, MY + 64, true, MUT, 0.8);
    D.exporter.items.forEach((it, i) => { const [x, y] = SLOT[it.key], isNew = !P || !P.exporter.items.find((q) => q.key === it.key);
      const s = isNew ? pop(u, 0.3 + i * 0.25) : 1, txt = it.key === 'secret' ? 'secret = 42' : `${it.key}()`;
      card(MX + x, MY + y, it.key === 'secret' ? 150 : 110, 42, { rx: 8, text: txt, fs: 15, mono: true, stroke: it.ok ? ACC : INK, color: it.ok ? ACC : INK, fill: it.ok ? ACCBG : PANEL, s }); });
    // module.exports 주머니
    const bagOp = k >= 2 ? (k === 2 ? fade(u, 0.3) : 1) : 0.35;
    card(MX + MW / 2, MY + 290, 300, 50, { rx: 25, text: k >= 2 ? 'module.exports = { add, sub }' : 'module.exports = { }', fs: 14.5, mono: true, stroke: ACC, color: ACC, op: bagOp, dash: k >= 2 ? null : '5 4' });
    if (k === 2) { dot([[MX + 130, MY + 172], [MX + 200, MY + 290]], seg(u, 0.6, 1.4), ACC, 7); dot([[MX + 270, MY + 172], [MX + 200, MY + 290]], seg(u, 0.9, 1.7), ACC, 7); }
    // app.js
    file(AX, MY, 360, MH, 'app.js', { stroke: k === 4 ? ACC : GRID });
    if (k < 4) { note(AX + 24, MY + 80, D.importer.note, fade(u, 0.6), { fill: MUT, 'font-size': 14 });
      if (k === 2) note(AX + 24, MY + 120, 'secret 은 주머니에 없다', fade(u, 2.0), { fill: BAD, 'font-size': 14 }); return; }
    fly(MX + MW / 2, MY + 290, AX + 180, MY + 80, seg(u, 0.2, 1.0), '{ add, sub }', { mono: true });
    if (u > 1.0) card(AX + 180, MY + 80, 200, 40, { rx: 20, text: 'math = { add, sub }', fs: 14.5, mono: true, stroke: ACC, color: ACC });
    [['math.add(2, 3)', '5', GOOD], ['math.secret', 'undefined', BAD]].forEach(([a, b, col], i) => { const y = MY + 150 + i * 64, op = fade(u, 1.3 + i * 0.4);
      mono(AX + 24, y, a, { 'font-size': 16, opacity: op }); mono(AX + 24, y + 26, '→ ' + b, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op }); }); }

  // ---------- 2. 동기 로딩 · 캐시 ----------
  function cacheTable(x, y, hit, op) { zone(x, y, 380, 96, 'require.cache  (키 = 해석된 파일 경로)', { fill: SOFT, op });
    mono(x + 16, y + 56, '/srv/app/config.js', { 'font-size': 14.5, opacity: op }); grow(x + 182, y + 51, x + 224, y + 51, op, MUT);
    card(x + 300, y + 52, 140, 36, { rx: 8, text: 'exports 객체', fs: 14, stroke: hit ? GOOD : INK, color: hit ? GOOD : INK, op });
    if (hit) mono(x + 16, y + 84, '두 번째부터는 여기서 바로 꺼낸다', { 'font-size': 13.5, fill: GOOD, opacity: op }); }
  function s2(t, c) { const { k, u } = c, D = c.beat.cache;
    terminal(560, 260, 370, 130, ['$ node app.js', '[config] 파일 실행!', ...(k === 4 ? ['true'] : [])], k === 0 ? lerp(1, 2, E(u, 1.4, 1.9)) : k === 4 ? lerp(2, 3, E(u, 1.4, 1.9)) : 2, { title: 'console' });
    if (k === 0 || k === 1) { file(40, 40, 440, 330, 'config.js — 처음 require 될 때 실행', { stroke: ACC });
      const lines = ['console.log("[config] 파일 실행!");', 'const path = require("path");', 'module.exports = {', '  env: process.env.NODE_ENV || "dev",', '  dataDir: path.join(__dirname, "data"),', '};'];
      const at = k === 0 ? Math.min(5, Math.floor(E(u, 0.2, 2.2) * 6)) : 5;
      lines.forEach((s, i) => { if (i === at && k === 0) el('rect', { x: 50, y: 82 + i * 30, width: 420, height: 26, rx: 4, fill: ACCBG });
        mono(60, 100 + i * 30, s, { 'font-size': 14, fill: i <= at ? INK : OFF }); });
      if (k === 0) { note(560, 80, 'require 는 동기다', fade(u, 0.4), { fill: ACC }); note(560, 108, '이 파일을 끝까지 돌리고 나서야', fade(u, 0.8), { 'font-size': 14, fill: MUT }); note(560, 132, '다음 줄로 넘어간다', fade(u, 0.8), { 'font-size': 14, fill: MUT }); return; }
      card(720, 140, 330, 120, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 0.3) });
      if (u > 0.5) { mono(574, 112, 'module.exports = {', { 'font-size': 14.5 }); mono(594, 140, "env: 'dev',", { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
        mono(594, 166, 'dataDir: …', { 'font-size': 14.5, opacity: fade(u, 1.1) }); mono(574, 192, '}', { 'font-size': 14.5 }); }
      sub(720, 230, 'NODE_ENV 를 안 주면 "dev"', fade(u, 1.6)); return; }
    if (k === 2) { tx(40, 50, '어디서 실행하든 같은 폴더를 가리킨다', { 'font-size': 16, 'font-weight': 800 });
      [['cd / 에서 실행', '/'], ['cd /srv 에서 실행', '/srv']].forEach(([a, cwd], i) => { const y = 92 + i * 88, op = fade(u, 0.3 + i * 0.5);
        tx(40, y, a, { 'font-size': 14.5, 'font-weight': 700, opacity: op });
        mono(40, y + 28, `"./data" → ${cwd === '/' ? '/data' : '/srv/data'}`, { 'font-size': 14.5, fill: BAD, opacity: op });
        mono(300, y + 28, '__dirname + "data" → /srv/app/data', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.3 + i * 0.3) }); });
      D.globals.forEach((g, i) => pill(140 + i * 270, 300 - 20, g.name, ACC, pop(u, 1.8 + i * 0.2), { mono: true, fs: 14.5 }));
      D.globals.forEach((g, i) => sub(140 + i * 270, 316, g.desc, fade(u, 2.0 + i * 0.2), { 'font-size': 13.5 }));
      sub(250, 400, '경로 /srv/app 은 예시', fade(u, 2.2)); return; }
    // k3, k4: 캐시 적중
    cacheTable(40, 40, true, 1);
    D.calls.forEach((s, i) => { const y = 180 + i * 46, isFirst = i === 0, s0 = k === 3 ? pop(u, 0.2 + i * 0.4) : 1;
      pill(150, y, (i === 0 ? 'a = ' : i === 1 ? 'b = ' : '') + s, isFirst ? INK : GOOD, s0, { mono: true, fs: 13.5 });
      if (k === 3 && !isFirst) { dot([[270, y], [340, 92]], seg(u, 0.4 + i * 0.4, 0.9 + i * 0.4), GOOD, 6); if (u > 0.9 + i * 0.4) mono(300, y + 5, '캐시 적중', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700 }); } });
    if (k === 3) { note(560, 80, '파일은 다시 실행되지 않는다', fade(u, 1.6), { fill: GOOD }); note(560, 108, '로그도 한 번뿐', fade(u, 1.9), { 'font-size': 14, fill: MUT }); return; }
    // k4: a === b
    card(470, 330 - 140, 150, 50, { rx: 10, text: 'config 객체', fs: 15, stroke: ACC, color: ACC });
    curve(260, 180, 400, 184, 20, E(u, 0.2, 0.9), ACC); curve(260, 226, 400, 198, -10, E(u, 0.4, 1.1), ACC);
    pill(700, 110, 'a === b  →  true', GOOD, pop(u, 1.2), { mono: true, fs: 16 });
    sub(700, 150, '프로세스당 인스턴스 하나 (싱글턴)', fade(u, 1.6), { 'font-size': 14, fill: INK }); }

  // ---------- 3. ESM ----------
  function exportSlots(x, y, D, P, u) { file(x, y, 330, 250, 'math.mjs', { stroke: INK });
    tx(x + 16, y + 56, 'export 칸', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    D.exporter.named.forEach((n, i) => { const isNew = !P || !P.exporter.named.includes(n);
      card(x + 90, y + 92 + i * 52, 130, 40, { rx: 8, text: n, fs: 15, mono: true, stroke: INFO, color: INFO, s: isNew ? pop(u, 0.3 + i * 0.3) : 1 }); });
    const hasDef = D.exporter.def !== '(아직 없음)';
    card(x + 250, y + 190, 120, 70, { rx: 10, stroke: hasDef ? GOOD : GRID, dash: hasDef ? null : '5 4', fill: hasDef ? GOODBG : PANEL, s: hasDef && !(P && P.exporter.def !== '(아직 없음)') ? pop(u, 1.0) : 1 });
    tx(x + 250, y + 176, 'default', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: hasDef ? GOOD : MUT });
    if (hasDef) mono(x + 250, y + 202, '3.14159', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700 });
    else tx(x + 250, y + 202, '파일당 1개', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
  function s3(t, c) { const { k, u } = c, D = c.beat.esm, P = c.prev && c.prev.esm;
    if (k <= 2) { exportSlots(40, 50, D, P, u);
      file(560, 50, 360, 250, 'app.mjs', { stroke: k === 2 ? ACC : GRID });
      if (k === 0) note(580, 120, '이름이 곧 계약이다', fade(u, 1.0), { fill: INFO });
      if (k === 1) note(580, 120, 'named 는 여럿, default 는 하나', fade(u, 1.4), { fill: GOOD });
      if (k === 2) { mono(578, 112, 'import PI, { add, sub }', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.2) });
        curve(350, 240, 650, 124, 30, E(u, 0.5, 1.2), GOOD); curve(196, 142, 700, 124, 50, E(u, 0.8, 1.5), INFO); curve(196, 194, 745, 124, 80, E(u, 1.0, 1.7), INFO);
        note(580, 190, 'default → 아무 이름 (PI)', fade(u, 1.4), { fill: GOOD, 'font-size': 14 });
        note(580, 218, 'named → { } 안에 같은 이름', fade(u, 1.7), { fill: INFO, 'font-size': 14 });
        terminal(560, 320, 360, 80, ['$ node app.mjs', '5 3.14159'], lerp(1, 2, E(u, 2.0, 2.4)), { title: 'console' }); }
      return; }
    if (k === 3) { // 링크 → 실행 두 단계
      tx(40, 50, 'ESM 은 실행 전에 import · export 를 먼저 맞춘다', { 'font-size': 16, 'font-weight': 800 });
      const ph = [['① 링크 (실행 전)', 'import 이름 ↔ export 이름', INFO], ['② 실행', '파일 첫 줄부터', GOOD]];
      ph.forEach(([a, b, col], i) => { const x = 60 + i * 300, g = E(u, 0.2 + i * 0.4, 0.9 + i * 0.4);
        el('rect', { x, y: 80, width: 270 * g, height: 56, rx: 8, fill: i ? GOODBG : INFOBG, stroke: col, 'stroke-width': 2 });
        if (g > 0.6) { tx(x + 14, 104, a, { 'font-size': 15, 'font-weight': 800, fill: col }); tx(x + 14, 126, b, { 'font-size': 13.5, fill: MUT }); } });
      mono(60, 190, 'import { ad } from "./math.mjs";', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.0) });
      if (u > 1.3) { cross(400, 184, 12, pop(u, 1.3)); card(360, 250, 600, 54, { rx: 10, text: "SyntaxError: … does not provide an export named 'ad'", fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.5) }); }
      note(60, 310, '② 의 첫 줄 console.log 도 찍히지 않는다', fade(u, 1.9), { fill: BAD, 'font-size': 14 });
      pill(250, 370, 'import.meta.url → file:///…/app.mjs', INFO, pop(u, 2.2), { mono: true, fs: 14 }); return; }
    // k4: top-level await — 모듈 실행이 멈췄다 이어진다
    tx(40, 50, '모듈 최상단의 await', { 'font-size': 16, 'font-weight': 800 });
    const X0 = 60, X1 = 900, Y = 110, pend = [0.32, 0.78];
    el('line', { x1: X0, y1: Y + 20, x2: X1, y2: Y + 20, stroke: GRID, 'stroke-width': 2 });
    const g = E(u, 0.2, 2.4), cur = lerp(X0, X1, g);
    const run1 = Math.min(cur, lerp(X0, X1, pend[0])); el('rect', { x: X0, y: Y + 8, width: run1 - X0, height: 24, rx: 4, fill: GOOD, opacity: 0.8 });
    if (cur > lerp(X0, X1, pend[0])) { const w = Math.min(cur, lerp(X0, X1, pend[1])) - lerp(X0, X1, pend[0]);
      el('rect', { x: lerp(X0, X1, pend[0]), y: Y + 8, width: w, height: 24, rx: 4, fill: 'none', stroke: WARN, 'stroke-dasharray': '5 4', 'stroke-width': 2 });
      mono(lerp(X0, X1, pend[0]) + 10, Y + 25, 'await fetch(…) — 멈춤', { 'font-size': 13.5, fill: WARN, 'font-weight': 700 }); }
    if (cur > lerp(X0, X1, pend[1])) el('rect', { x: lerp(X0, X1, pend[1]), y: Y + 8, width: cur - lerp(X0, X1, pend[1]), height: 24, rx: 4, fill: GOOD, opacity: 0.8 });
    mono(X0, Y - 2, 'app.mjs 실행', { 'font-size': 13.5, fill: MUT });
    const st = g < pend[0] ? null : g < pend[1] ? 'pending' : 'fulfilled';
    if (st) card(lerp(X0, X1, (pend[0] + pend[1]) / 2), Y + 86, 200, 44, { rx: 22, text: 'Promise: ' + st, fs: 15, mono: true, stroke: st === 'pending' ? WARN : GOOD, color: st === 'pending' ? WARN : GOOD });
    card(300, 300, 420, 64, { rx: 10, text: 'CJS: 함수로 감싸야 await 를 쓴다\nESM: 최상단에서 바로 await', fs: 14.5, stroke: ACC, s: pop(u, 2.3) });
    sub(720, 296, '이 모듈을 import 한 쪽도 끝날 때까지 기다린다', fade(u, 2.5), { 'font-size': 13.5 }); }

  // ---------- 4. 값 복사 vs 라이브 바인딩 ----------
  const MS = (ms) => 140 + ms * 1.4;   // 0~500ms → x
  function counterLine(y, u, upTo) { mono(24, y + 6, 'counter', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    el('line', { x1: MS(0), y1: y, x2: MS(560), y2: y, stroke: GRID, 'stroke-width': 2 });
    [0, 100, 200, 300, 400, 500].forEach((ms) => mono(MS(ms), y + 26, ms + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    for (let i = 0; i <= 4; i++) { const ms = i * 100, on = upTo >= ms; if (!on) continue; card(MS(ms), y - 22, 32, 28, { rx: 6, text: String(i), fs: 14, mono: true, stroke: ACC, color: ACC }); }
    mono(MS(530), y - 16, '5', { 'font-size': 14, fill: OFF, 'font-weight': 700 }); mono(MS(530), y + 6, '500ms 직후', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle' }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { const now = k === 0 ? lerp(0, 450, E(u, 0.2, 2.4)) : 500;
      counterLine(90, u, now);
      tx(24, 40, 'n 이 100ms 마다 1씩 오른다', { 'font-size': 15, 'font-weight': 800 });
      el('line', { x1: MS(500), y1: 140, x2: MS(500), y2: 380, stroke: INK, 'stroke-width': 1.6, 'stroke-dasharray': '4 4', opacity: k >= 1 ? 1 : 0 });
      if (k >= 1) mono(MS(500), 396, 'setTimeout 500ms', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: 1 });
      if (k >= 1) { const op = k === 1 ? fade(u, 0.2) : 1; tx(24, 186, 'CJS  const { n } = require(…)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: op });
        fly(MS(0), 68, MS(0) + 40, 230, k === 1 ? seg(u, 0.4, 1.2) : 1, 'n = 0', { mono: true, fill: MUT, stay: true });
        if (k === 1 ? u > 1.2 : true) mono(MS(0) + 90, 236, '그 순간 값을 복사해 왔다', { 'font-size': 13.5, fill: MUT });
        pill(MS(500) + 56, 230, 'log → 0', BAD, k === 1 ? pop(u, 1.8) : 1, { mono: true, fs: 15 }); }
      if (k === 2) { tx(24, 296, 'ESM  import { n } from …', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
        curve(MS(500) - 30, 320, MS(400), 76, 60, E(u, 0.5, 1.3), ACC, { plain: false });
        pill(MS(500) + 56, 330, 'log → 4', GOOD, pop(u, 1.5), { mono: true, fs: 15 });
        sub(560, 380, '원본 n 을 읽는다 · 다섯 번째 증가는 500ms 를 살짝 넘겨 온다', fade(u, 2.0), { 'font-size': 13.5, 'text-anchor': 'middle' }); }
      return; }
    if (k === 3) { tx(40, 50, '번들러가 실행 전에 쓰는 것만 고른다', { 'font-size': 16, 'font-weight': 800 });
      file(40, 80, 300, 200, 'math.mjs', {});
      card(190, 160, 180, 42, { rx: 8, text: 'export add', fs: 15, mono: true, stroke: GOOD, color: GOOD });
      const cut = E(u, 1.0, 1.8); card(190 + cut * 10, 220, 180, 42, { rx: 8, text: 'export sub', fs: 15, mono: true, stroke: BAD, color: BAD, op: 1 - cut * 0.6 });
      if (u > 1.0) { el('line', { x1: 96, y1: 220, x2: lerp(96, 290, cut), y2: 220, stroke: BAD, 'stroke-width': 3 }); }
      mono(420, 120, 'import { add } from "./math.mjs"', { 'font-size': 15, opacity: fade(u, 0.2) });
      file(560, 160, 300, 130, 'bundle.js', { stroke: ACC });
      fly(280, 160, 710, 224, seg(u, 0.4, 1.2), 'add', { mono: true, fill: GOOD, stay: true });
      mono(710, 270, 'sub 는 빠졌다', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    // k4: require 는 실행해 봐야 안다
    tx(40, 50, 'require 의 경로는 실행해 봐야 정해진다', { 'font-size': 16, 'font-weight': 800 });
    mono(40, 110, 'const m = require(flag ? "./a" : "./b");', { 'font-size': 15.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.2) });
    ['./a', './b'].forEach((p, i) => { const y = 180 + i * 80; curve(330, 118, 540, y, -20, E(u, 0.6 + i * 0.3, 1.2 + i * 0.3), WARN, { dash: '6 5' }); card(620, y, 150, 50, { rx: 8, text: p, fs: 15, mono: true, stroke: WARN, s: pop(u, 1.0 + i * 0.3) }); });
    mono(700, 150, '?', { 'font-size': 30, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
    note(40, 360, '번들러는 둘 다 넣어 둘 수밖에 없다', fade(u, 1.9), { fill: WARN }); }

  // ---------- 5. 상호 운용 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { file(40, 40, 400, 320, 'esm-interop.mjs', { stroke: INK });
      [['__dirname', 'undefined'], ['__filename', 'undefined'], ['require', 'undefined']].forEach(([n, v], i) => { const y = 110 + i * 70, s = pop(u, 0.3 + i * 0.35);
        mono(70, y, `typeof ${n}`, { 'font-size': 15.5, 'font-weight': 700, opacity: s }); mono(70, y + 28, '→ ' + v, { 'font-size': 15, fill: BAD, opacity: fade(u, 0.6 + i * 0.35) }); });
      card(700, 140, 380, 90, { rx: 12, text: 'CJS 가 모듈마다 넣어 주던 값\nESM 에는 없다', fs: 15, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.6) });
      pill(700, 260, 'import … from "node:url"', INFO, pop(u, 2.0), { mono: true, fs: 14 }); pill(700, 304, 'import … from "node:path"', INFO, pop(u, 2.2), { mono: true, fs: 14 }); return; }
    if (k === 1) { const st = [['import.meta.url', 'file:///srv/app/esm-interop.mjs', INFO], ['fileURLToPath()', '/srv/app/esm-interop.mjs', ACC], ['dirname()', '/srv/app', GOOD]];
      st.forEach(([a, b, col], i) => { const y = 70 + i * 92, s = pop(u, 0.3 + i * 0.55);
        card(480, y, 760, 58, { rx: 10, stroke: col, s }); if (s > 0.5) { mono(120, y + 6, a, { 'font-size': 15, 'font-weight': 800, fill: col }); mono(360, y + 6, b, { 'font-size': 15 }); }
        if (i) grow(480, y - 62, 480, y - 32, E(u, 0.1 + i * 0.55, 0.4 + i * 0.55), col); });
      pill(480, 380, 'Node 20.11+ : import.meta.dirname 한 줄로도 얻는다', GOOD, pop(u, 2.2), { fs: 14 });
      sub(860, 26 + 0, '경로는 예시', fade(u, 0.5)); return; }
    if (k === 2) { tx(40, 46, '어느 쪽에서 어느 쪽을 부르나', { 'font-size': 16, 'font-weight': 800 });
      card(170, 170, 200, 120, { rx: 12, text: 'ESM\n.mjs · type:module', fs: 15, stroke: INFO, color: INFO });
      card(790, 170, 200, 120, { rx: 12, text: 'CJS\n.js · .cjs', fs: 15, stroke: WARN, color: WARN });
      grow(275, 140, 685, 140, E(u, 0.3, 1.0), GOOD); mono(480, 128, 'import 그대로 · createRequire', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
      grow(685, 200, 275, 200, E(u, 1.0, 1.7), ACC); mono(480, 226, 'import()  ·  require(esm) (Node 22.12+)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
      card(480, 330, 600, 56, { rx: 10, text: 'top-level await 가 있는 ESM 을 require → ERR_REQUIRE_ASYNC_MODULE', fs: 14, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.0) });
      sub(480, 390, 'node v24 에서 실행해 확인', fade(u, 2.3)); return; }
    if (k === 3) { tx(40, 46, 'import() 는 Promise 를 돌려준다', { 'font-size': 16, 'font-weight': 800 });
      card(140, 170, 200, 54, { rx: 27, text: 'HEAVY === "1" ?', fs: 15, mono: true, stroke: INK });
      grow(240, 160, 380, 120, E(u, 0.3, 0.8), ACC); grow(240, 184, 380, 250, E(u, 0.3, 0.8), MUT);
      mono(400, 256, '아니오 → 아예 불러오지 않는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      const g = E(u, 0.9, 2.3), st = g < 0.55 ? 'pending' : 'fulfilled', col = st === 'pending' ? WARN : GOOD;
      if (u > 0.9) { card(520, 118, 240, 50, { rx: 25, text: 'import("./big-tool.mjs")', fs: 14, mono: true, stroke: ACC });
        card(800, 118, 200, 50, { rx: 25, text: st, fs: 16, mono: true, stroke: col, color: col, fill: st === 'pending' ? WARNBG : GOODBG });
        grow(642, 118, 698, 118, 1, MUT); }
      if (st === 'fulfilled') { card(800, 200, 220, 48, { rx: 8, text: '{ bigTool }', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.9) }); mono(690, 290, 'await → 모듈 객체', { 'font-size': 14, fill: GOOD, opacity: fade(u, 2.2) }); }
      return; }
    // k4: 필요할 때만 + 확장자
    tx(40, 46, '시작할 때 읽는 파일이 줄어든다', { 'font-size': 16, 'font-weight': 800 });
    [['HEAVY 없음', ['esm-interop.mjs'], GOOD], ['HEAVY=1', ['esm-interop.mjs', 'big-tool.mjs'], INFO]].forEach(([a, fs, col], i) => { const y = 90 + i * 64;
      tx(40, y + 6, a, { 'font-size': 14.5, 'font-weight': 700, class: 'mono' }); fs.forEach((f, j) => pill(270 + j * 200, y, f, col, pop(u, 0.3 + i * 0.4 + j * 0.2), { mono: true, fs: 13.5 })); });
    [['import "./math"', "ERR_MODULE_NOT_FOUND", BAD, false], ['import "./math.js"', '확장자를 적으면 찾는다', GOOD, true]].forEach(([a, b, col, ok], i) => { const y = 260 + i * 62, s = pop(u, 1.4 + i * 0.4);
      card(480, y, 760, 50, { rx: 10, stroke: col, s }); if (s > 0.5) { (ok ? check : cross)(126, y, 9, 1); mono(150, y + 6, a, { 'font-size': 15, 'font-weight': 700 }); mono(840, y + 6, b, { 'font-size': 14, fill: col, 'text-anchor': 'end', 'font-weight': 700 }); } }); }

  const quiz = [
    { q: 'math.js에서 exports = { add }라고만 쓰고 app.js에서 require하면 무엇을 받나?',
      o: ['{ add }', '빈 객체 {}', 'undefined'], a: 1,
      why: 'exports를 새 객체로 바꾸면 별명만 옮겨 간다. require는 여전히 원래 module.exports를 돌려주므로 {}가 온다.' },
    { q: '같은 config.js를 세 번 require했을 때 "[config] 파일 실행!"은 몇 번 찍히나?',
      o: ['1번', '3번', '0번'], a: 0,
      why: '첫 require만 파일을 실행하고 결과를 require.cache에 둔다. 나머지는 같은 객체를 꺼내 오므로 a === b도 true다.' },
    { q: "ESM에서 import { ad } from './math.mjs'처럼 없는 이름을 쓰면 언제 에러가 나나?",
      o: ['ad()를 부르는 순간', '파일 첫 줄이 실행되기 전 링크 단계에서', '에러 없이 undefined가 들어온다'], a: 1,
      why: 'ESM은 실행 전에 import와 export 이름을 맞춘다. 그래서 첫 줄 console.log도 찍히지 않고 SyntaxError가 난다.' },
    { q: '100ms마다 n을 올리는 모듈에서 500ms 뒤 값을 읽었다. CJS 구조 분해와 ESM import의 결과는?',
      o: ['CJS 0, ESM 4', 'CJS 4, ESM 4', 'CJS 0, ESM 0'], a: 0,
      why: 'CJS는 꺼낸 순간의 값 0을 복사해 둔다. ESM은 원본 변수를 읽어 4가 나온다(다섯 번째 증가는 500ms를 살짝 넘겨 온다).' },
    { q: 'ESM 파일에서 __dirname이 필요할 때 쓰는 방법은 무엇인가?',
      o: ['require("path").__dirname', 'dirname(fileURLToPath(import.meta.url))', 'process.cwd()'], a: 1,
      why: 'import.meta.url을 경로로 바꾸고 폴더만 잘라 낸다. Node 20.11부터는 import.meta.dirname도 있다. process.cwd()는 실행 위치라 다르다.' },
  ];

  const summary = [
    'CommonJS는 module.exports에 담은 것만 내보내고, exports를 새 객체로 바꾸면 아무것도 안 나간다.',
    'require는 동기로 파일을 한 번만 실행하고 결과를 캐시에 둔다. 두 번 불러도 같은 객체다.',
    'ESM은 실행 전에 import와 export 이름을 맞추고, 원본 변수를 읽어 500ms 뒤 값 4를 본다.',
    'ESM에는 __dirname과 require가 없어 import.meta.url과 createRequire로 대신한다.',
  ];
  const review = [
    { q: 'DB 연결 모듈을 여러 파일에서 require했더니 연결이 하나만 생겼다. 그 이유는?',
      o: ['Node가 DB 연결 수를 하나로 제한해서', 'require가 첫 실행 결과를 캐시해 같은 객체를 돌려줘서', 'module.exports가 읽기 전용이라서'], a: 1,
      why: '모듈은 프로세스당 한 번만 실행된다. 그래서 설정이나 연결을 모듈로 두면 자연스럽게 하나만 생긴다.' },
    { q: 'CJS 프로젝트를 ESM으로 바꾸자 "__dirname is not defined"가 났다. 고칠 방법은?',
      o: ['import.meta.url을 fileURLToPath로 바꿔 직접 만든다', 'package.json에서 "type"을 지운다', 'import 경로에서 확장자를 뺀다'], a: 0,
      why: 'ESM은 __dirname을 넣어 주지 않는다. import.meta.url에서 만들거나 Node 20.11 이상이면 import.meta.dirname을 쓴다.' },
    { q: '라이브러리를 배포하는데 쓰는 쪽 번들에서 안 쓰는 함수가 빠지길 바란다. 어떤 형식이 유리한가?',
      o: ['require로 경로를 조건에 따라 고르는 CJS', '모든 함수를 한 객체에 담은 CJS', '실행 전에 import 목록이 정해지는 ESM'], a: 2,
      why: '번들러는 실행 전에 무엇을 가져오는지 알아야 잘라 낼 수 있다. ESM은 정적이라 안 쓰는 export를 뺄 수 있다.' },
  ];

  R.page({ title: '모듈이 오가는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
