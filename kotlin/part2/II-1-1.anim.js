/* II-1-1 lambda + 고차함수 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 리스트 칸(원소), 람다 카드(λ, 값으로 다루는 함수), map/filter 작업대(원소가 통과하며 바뀐다),
   누적 변수 칸, 즉시/지연 평가의 중간 리스트 막대. 숫자는 코드 주석과 파이썬 재계산 값(24, 56, 30, 142,857, 70) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미: Kotlin 코드 색칠 ----------
  const KW = /^(fun|val|var|when|is|if|else|for|in|return|class|data|sealed|object|enum|interface|null|true|false|open|private|this|it)$/;
  function toks(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  const kt = (x, y, s, o) => { o = o || {}; return spans(x, y, toks(s), { 'font-size': o.fs || 15, opacity: o.op ?? 1, 'text-anchor': o.anchor }, o.p); };
  // 왼쪽 정렬 코드 칩
  function chip(x, y, s, o) { o = o || {}; const fs = o.fs || 14.5, w = o.w || tw(s, fs) + 22, op = o.op ?? 1;
    el('rect', { x, y: y - 16, width: w, height: 32, rx: 7, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash, opacity: op });
    if (o.strike) { mono(x + 11, y + 5, s, { 'font-size': fs, fill: o.col || MUT, opacity: op, 'text-decoration': 'line-through' }); }
    else kt(x + 11, y + 5, s, { fs, op });
    return { x, y, w, x1: x + w }; }
  // 람다 카드: λ 표시 + 본문. 함수가 "값" 이라는 것을 한 덩어리 칩으로 보인다
  function lam(cx, cy, s, o) { o = o || {}; const fs = o.fs || 16, w = o.w || tw(s, fs) + 58, h = o.h || 46, g = G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: o.fill || ACCBG, stroke: o.stroke || ACC, 'stroke-width': 2.2 }, g);
    tx(-w / 2 + 14, 7, 'λ', { 'font-size': 19, 'font-weight': 800, fill: o.stroke || ACC }, g);
    spans(-w / 2 + 38, 6, toks(s), { 'font-size': fs }, g); return { w, h }; }
  // 값 칸 하나 (가운데 기준)
  const box = (cx, cy, v, o) => { o = o || {}; return card(cx, cy, o.w || 54, o.h || 42, { rx: 7, text: String(v), mono: true, fs: o.fs || 16, fw: 700, stroke: o.stroke || INK, fill: o.fill, color: o.color, s: o.s, op: o.op, dash: o.dash, sw: o.sw }); };
  // 작업대(벨트 위 공정): 왼쪽에 코드 이름표, 오른쪽으로 원소가 지나간다
  function station(y, label, o) { o = o || {}; const h = o.h || 40, op = o.op ?? 1;
    el('rect', { x: 20, y: y - h / 2, width: 900, height: h, rx: 9, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': 1.6, opacity: op });
    String(label).split('\n').forEach((s, i, a) => kt(32, y + 5 + (i - (a.length - 1) / 2) * 20, s, { fs: o.fs || 14.5, op })); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 명령형 for ----------
  const NUMS = [1, 2, 3, 4, 5, 6], X0 = 250, CW = 58, GAP = 10;
  const cx1 = (i) => X0 + i * (CW + GAP) + CW / 2;
  const T1 = (i) => 0.25 + i * 0.37;                                  // beat 2: n 이 i 번째 칸에 닿는 시각
  function s1(t, c) { const { k, u } = c;
    kt(230, 93, 'val nums', { anchor: 'end' });
    NUMS.forEach((v, i) => box(cx1(i), 88, v, { s: k === 0 ? pop(u, 0.3 + i * 0.22) : 1, w: CW, stroke: k >= 1 ? INK : ACC, fill: k === 0 ? ACCBG : PANEL }));
    if (k === 0) { note(X0, 160, '리스트 6칸만 있다', fade(u, 1.8), { fill: MUT });
      sub(X0 + 200, 196, '거르기·변환·합산은 아직 아무것도 일어나지 않았다', fade(u, 2.1), { 'text-anchor': 'start', 'font-size': 14.5 }); return; }
    // 누적 변수 칸
    const rg = { x: 700, y: 92, w: 230, h: 116 }, hot = k === 4;
    el('rect', { x: rg.x, y: rg.y, width: rg.w, height: rg.h, rx: 12, fill: hot ? BADBG : WARNBG, stroke: hot ? BAD : WARN, 'stroke-width': 2.4, opacity: k === 1 ? fade(u, 0.2) : 1 });
    kt(rg.x + 16, rg.y + 28, 'var total', { op: k === 1 ? fade(u, 0.2) : 1 });
    let total = 0;
    if (k === 2) NUMS.forEach((n, i) => { if (n % 2 === 0) total += n * 2 * clamp((u - T1(i) - 0.3) / 0.2); });
    else if (k >= 3) total = 24;
    mono(rg.x + rg.w / 2, rg.y + 86, String(Math.round(total)), { 'font-size': 38, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? BAD : WARN, opacity: k === 1 ? fade(u, 0.5) : 1 });
    // 루프 변수 n (커서)
    let ci = 0; if (k === 2) { ci = 0; for (let i = 0; i < 6; i++) if (u >= T1(i) - 0.18) ci = i; }
    if (k >= 3) ci = 5;
    const curX = k === 2 ? lerp(cx1(Math.max(0, ci - 1)), cx1(ci), E(u, T1(ci) - 0.18, T1(ci))) : cx1(ci);
    if (k !== 3) { const op = k === 1 ? fade(u, 0.7) : 1;
      el('path', { d: `M${curX - 9},${50} L${curX + 9},${50} L${curX},${62} Z`, fill: hot ? BAD : INFO, opacity: op });
      mono(curX, 42, 'n', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? BAD : INFO, opacity: op }); }
    kt(230, 47, 'for (n in nums)', { anchor: 'end', op: k === 1 ? fade(u, 0.7) : 1 });
    if (k === 1) { note(X0, 160, '사람이 직접 관리할 상태가 생겼다', fade(u, 1.4));
      sub(rg.x + rg.w / 2, rg.y + rg.h + 24, '루프가 끝나야 값이 정해진다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // 거르기 줄 + 임시 칸 줄
    kt(230, 175, 'if (n % 2 == 0)', { anchor: 'end', op: k === 2 ? fade(u, 0.1) : 1 });
    kt(230, 255, 'val doubled = n * 2', { anchor: 'end', op: k === 2 ? fade(u, 0.1) : 1 });
    NUMS.forEach((n, i) => { const at = k === 2 ? T1(i) : -9, x = cx1(i);
      if (k === 2) dot([[x, 112], [x, 158]], seg(u, at, at + 0.14), INFO, 6);
      const mk = k === 2 ? pop(u, at + 0.12) : 1;
      if (n % 2) cross(x, 170, 9, mk); else check(x, 170, 10, mk);
      if (n % 2 === 0) { const gone = k >= 3, s = k === 2 ? pop(u, at + 0.22) : 1;
        box(x, 250, n * 2, { w: CW, s, stroke: gone ? OFF : WARN, color: gone ? OFF : INK, dash: gone ? '5 4' : null, fill: gone ? PANEL : WARNBG });
        if (k === 2) fly(x, 250, rg.x + 30, rg.y + 70, seg(u, at + 0.3, at + 0.62), '+' + n * 2, { mono: true, fill: WARN }); } });
    if (k === 2) { sub(X0 + 200, 312, '거르기 · 두 배 · 누적이 한 블록 안에 섞여 돈다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 3) { note(cx1(5) + 40, 47, '순회 종료', fade(u, 0.2), { fill: MUT });
      sub(cx1(3), 296, 'doubled 칸은 블록을 나가며 사라진다', fade(u, 0.5), { 'font-size': 14.5 });
      terminal(700, 250, 230, 96, ['> println(total)', ['24', 'var(--term)']], 1 + E(u, 0.8, 1.6), { title: 'stdout' });
      sub(380, 380, '결과는 맞다. 10줄이 무엇을 하려는지가 안 보일 뿐이다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k === 4 : 버그 표면적
    const ring = (x, y, w, h, at) => el('rect', { x, y, width: w, height: h, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 2.6, 'stroke-dasharray': '7 5', opacity: fade(u, at) });
    ring(curX - 22, 26, 44, 42, 0.2); note(curX + 30, 44, '루프 변수', fade(u, 0.3), { fill: BAD, 'font-size': 15 });
    ring(cx1(1) - CW / 2 - 10, 222, cx1(5) - cx1(1) + CW + 20, 56, 0.5);
    note(cx1(2), 300, '임시 변수', fade(u, 0.6), { fill: BAD, 'text-anchor': 'middle' });
    note(rg.x + rg.w / 2, rg.y - 12, '누적 변수', fade(u, 0.8), { fill: BAD, 'text-anchor': 'middle' });
    // 같은 패턴이 여기저기 복사된다
    [0, 1, 2].forEach((j) => { const x = 40 + j * 210, y = 330, s = pop(u, 1.3 + j * 0.25);
      const g = G(x + 90, y + 34, s); el('rect', { x: -90, y: -34, width: 180, height: 68, rx: 8, fill: PANEL, stroke: BAD, 'stroke-width': 1.8 }, g);
      [0, 1, 2, 3].forEach((r) => el('rect', { x: -76 + (r % 2) * 14, y: -24 + r * 13, width: 120 - (r % 2) * 30, height: 6, rx: 3, fill: OFF }, g)); });
    sub(735, 362, '같은 for 블록이', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    sub(735, 386, '곳곳에 복사된다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. lambda — 함수도 값이다 ----------
  function slotBox(x, y, w, h, title, op) { el('rect', { x, y, width: w, height: h, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
    kt(x + 14, y - 12, title, { op }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const SX = 400, SY = 70, SW = 330, SH = 110, scx = SX + SW / 2, scy = SY + SH / 2;
      slotBox(SX, SY, SW, SH, k === 0 ? 'val double: (Int) -> Int' : 'val triple: (Int) -> Int', k === 0 ? fade(u, 0.1) : 1);
      if (k === 0) { const m = E(u, 0.6, 1.2), x = lerp(170, scx, m), y = lerp(130, scy, m);
        lam(x, y, '{ x -> x * 2 }', { s: pop(u, 0.2) });
        sub(170, 185, '이름 없는 함수 = 값', 1 - fade(u, 0.6), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }
      else { const old = 1 - fade(u, 0.7, 0.3);
        if (old > 0.02) { lam(scx, scy, '{ x -> x * 3 }', { op: old });
          el('line', { x1: scx - 47, y1: scy - 1, x2: lerp(scx - 47, scx + 1, E(u, 0.2, 0.55)), y2: scy - 1, stroke: BAD, 'stroke-width': 3, opacity: old }); }
        lam(scx, scy, '{ it * 3 }', { op: fade(u, 0.75), s: 1 + bump(u, 0.75) });
        pill(scx, SY + SH + 30, 'it = 하나뿐인 인자의 자동 이름', INFO, pop(u, 1.0), { fs: 14 }); }
      // 호출: 인자가 카드로 들어가고 결과가 나온다
      const [arg, res, call] = k === 0 ? [3, 6, 'double(3)'] : [4, 12, 'triple(4)'];
      chip(80, 300, `println(${call})`, { op: fade(u, 1.3), fs: 15 });
      fly(170, 284, scx - 40, scy, seg(u, 1.45, 1.9), String(arg), { mono: true, fill: INFO });
      fly(scx + 40, scy, 840, scy, seg(u, 1.95, 2.35), String(res), { mono: true, fill: GOOD });
      if (u > 2.35) { box(840, scy, res, { w: 70, h: 54, fs: 24, stroke: GOOD, fill: GOODBG, s: pop(u, 2.35) }); }
      mono(380, 305, `// ${res}`, { 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) });
      if (k === 0) sub(840, scy + 50, '결과', fade(u, 2.4), { 'font-size': 14.5 });
      return; }
    if (k === 2) { slotBox(70, 70, 820, 130, 'val ops = listOf<(Int) -> Int>(...)', fade(u, 0.1));
      const L = [['{ it + 1 }', 6], ['{ it * 2 }', 10], ['{ it * it }', 25]];
      L.forEach(([s, r], i) => { const cx = 210 + i * 270, at = 0.9 + i * 0.5;
        lam(cx, 135, s, { s: pop(u, 0.2 + i * 0.18) });
        mono(cx, 230, `[${i}]`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
        fly(cx, 300, cx, 150, seg(u, at, at + 0.3), '5', { mono: true, fill: INFO });
        fly(cx, 160, cx, 330, seg(u, at + 0.3, at + 0.55), String(r), { mono: true, fill: GOOD });
        if (u > at + 0.55) box(cx, 330, r, { w: 64, h: 48, fs: 22, stroke: GOOD, fill: GOODBG, s: pop(u, at + 0.55) }); });
      chip(70, 390, 'for (op in ops) println(op(5))', { op: fade(u, 0.6), fs: 14.5 });
      note(620, 396, '함수를 리스트 칸에 담고 돌린다', fade(u, 2.4), { fill: ACC }); return; }
    // k === 3 : 고차함수 — op 자리에 람다를 꽂는다
    const MX = 330, MY = 160, MW = 360, MH = 150;
    el('rect', { x: MX, y: MY, width: MW, height: MH, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.4 });
    kt(MX + 16, MY - 14, 'fun apply(x: Int, op: (Int) -> Int): Int = op(x)', { fs: 14.5 });
    // 두 꽂는 자리
    const sx = { x: MX + 70, y: MY + 52 }, so = { x: MX + 230, y: MY + 52 };
    el('rect', { x: sx.x - 40, y: sx.y - 24, width: 80, height: 48, rx: 8, fill: PANEL, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    el('rect', { x: so.x - 95, y: so.y - 26, width: 190, height: 52, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    mono(sx.x, MY + 108, 'x: Int', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO });
    mono(so.x, MY + 108, 'op: (Int) -> Int', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC });
    const m = E(u, 0.3, 1.0); lam(lerp(140, so.x, m), lerp(80, so.y, m), '{ it + 100 }', { s: pop(u, 0.15), fs: 15 });
    sub(140, 120, '호출부가 고른 동작', 1 - fade(u, 0.4), { 'font-size': 14.5, fill: ACC });
    fly(140, 250, sx.x, sx.y, seg(u, 1.05, 1.45), '7', { mono: true, fill: INFO, stay: true });
    if (u > 1.5) { mono(MX + MW / 2, MY + 138, 'op(7) = 7 + 100', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.5) }); }
    grow(MX + MW + 6, MY + MH / 2, 800, MY + MH / 2, E(u, 1.8, 2.1), GOOD);
    if (u > 2.1) box(850, MY + MH / 2, 107, { w: 76, h: 54, fs: 24, stroke: GOOD, fill: GOODBG, s: pop(u, 2.1) });
    pill(170, 380, '고차함수 = 함수를 인자로 받는 함수', ACC, pop(u, 2.3), { fs: 15 });
    sub(720, 386, 'map · filter 가 전부 이 모양이다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 3. map — 각 원소 변환 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 2) { // ID → User 객체
      const ids = [1, 2, 3], cx = (i) => 330 + i * 220;
      kt(230, 85, 'val ids', { anchor: 'end' });
      ids.forEach((v, i) => box(cx(i), 80, v + 'L', { w: 70, s: pop(u, 0.15 + i * 0.12) }));
      mono(890, 85, 'List<Long>', { 'font-size': 14.5, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.3) });
      station(170, 'map { User(it,\n  "User$it") }', { h: 56, fs: 14 });
      ids.forEach((v, i) => { const at = 0.7 + i * 0.4, x = cx(i);
        dot([[x, 102], [x, 248]], seg(u, at, at + 0.35), ACC, 7);
        const s = pop(u, at + 0.35); if (s <= 0.01) return;
        const g = G(x, 300, s); el('rect', { x: -95, y: -42, width: 190, height: 84, rx: 9, fill: PANEL, stroke: ACC, 'stroke-width': 2.2 }, g);
        el('line', { x1: -95, y1: -14, x2: 95, y2: -14, stroke: ACC, 'stroke-width': 1.4 }, g);
        mono(-82, -22, 'User', { 'font-size': 15, 'font-weight': 700, fill: ACC }, g);
        mono(-82, 8, 'id', { 'font-size': 14.5 }, g); mono(82, 8, v, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' }, g);
        mono(-82, 32, 'name', { 'font-size': 14.5 }, g); mono(82, 32, `"User${v}"`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC }, g); });
      kt(230, 305, 'val users', { anchor: 'end', op: fade(u, 1.2) });
      mono(890, 395, 'List<User>', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 2.2) });
      sub(470, 395, '식별자 목록이 도메인 객체 목록으로 올라간다', fade(u, 2.3), { 'font-size': 15 }); return; }
    kt(230, 85, 'val nums', { anchor: 'end' });
    NUMS.forEach((v, i) => box(cx1(i), 80, v, { w: CW, stroke: k === 3 ? GOOD : INK, fill: k === 3 ? GOODBG : PANEL, s: k === 0 ? pop(u, 0.15 + i * 0.08) : 1 }));
    if (k !== 3) mono(700, 85, 'List<Int>', { 'font-size': 14.5, fill: MUT });
    const lab = k === 1 ? 'map { "#$it" }' : 'map { it * 2 }';
    station(170, lab, { fill: k === 1 ? ACCBG : SOFT, stroke: k === 1 ? ACC : GRID });
    const outv = (v) => (k === 1 ? '#' + v : v * 2);
    kt(230, 265, k === 1 ? 'val strs' : 'val doubled', { anchor: 'end' });
    NUMS.forEach((v, i) => { const at = 0.35 + i * 0.3, x = cx1(i), live = k === 0 || k === 1;
      if (live) dot([[x, 102], [x, 238]], seg(u, at, at + 0.3), ACC, 7);
      const s = live ? pop(u, at + 0.3) : 1; box(x, 260, outv(v), { w: CW, s, stroke: ACC, fill: ACCBG }); });
    if (k === 0) { mono(700, 265, '길이 6 → 6', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) });
      sub(450, 340, 'for 도 임시 리스트도 없이, 원소마다 같은 변환', fade(u, 2.4), { 'font-size': 15 }); return; }
    if (k === 1) { mono(700, 265, 'List<String>', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      grow(745, 100, 745, 240, E(u, 2.0, 2.4), ACC);
      sub(450, 340, '변환 함수가 String 을 돌려주니 새 리스트도 String 리스트', fade(u, 2.3), { 'font-size': 15 }); return; }
    // k === 3 : 원본은 그대로
    check(cx1(5) + 60, 80, 12, pop(u, 0.3));
    note(cx1(5) + 80, 86, '원본 그대로', fade(u, 0.4), { fill: GOOD });
    [['val tmp = mutableListOf()', 0.9], ['for (n in nums)', 1.2], ['tmp.add(n * 2)', 1.5]].forEach(([s, at], i) => {
      const y = 330 + i * 0, x = 40 + i * 300;
      chip(x, 345, s, { op: fade(u, at - 0.5), strike: u > at });
      if (u > at) el('line', { x1: x, y1: 345, x2: x + lerp(0, tw(s, 14.5) + 22, E(u, at, at + 0.3)), y2: 345, stroke: BAD, 'stroke-width': 2.5 }); });
    sub(480, 400, 'for + 임시 리스트 + add 세 단계가 map 한 번으로 사라진다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 4. filter — 조건에 맞는 원소만 ----------
  const TEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], W10 = 50, G10 = 8;
  const cx10 = (i) => 250 + i * (W10 + G10) + W10 / 2;
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { kt(230, 85, 'val nums', { anchor: 'end' });
      TEN.forEach((v, i) => box(cx10(i), 80, v, { w: W10, s: pop(u, 0.1 + i * 0.05) }));
      station(170, 'filter { it % 2 == 0 }');
      kt(230, 275, 'val even', { anchor: 'end', op: fade(u, 0.6) });
      let j = 0;
      TEN.forEach((v, i) => { const at = 0.6 + i * 0.16;
        if (v % 2) { const f = E(u, at, at + 0.4); if (f > 0) box(cx10(i), lerp(80, 170, f), v, { w: W10, stroke: OFF, color: OFF, op: 1 - f * 0.85 });
          if (u > at + 0.3) cross(cx10(i), 210, 8, pop(u, at + 0.3)); return; }
        const f = E(u, at, at + 0.45), tx2 = cx10(j); j++;
        box(lerp(cx10(i), tx2, f), lerp(80, 270, f), v, { w: W10, stroke: f > 0.98 ? ACC : INK, fill: f > 0.98 ? ACCBG : PANEL, op: f > 0 ? 1 : 0 }); });
      mono(560, 275, '길이 10 → 5', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) });
      sub(480, 350, 'map 과 달리 길이가 줄어든다. 값 자체는 바꾸지 않는다', fade(u, 2.4), { 'font-size': 15 }); return; }
    if (k === 1) { // filter → map → take 세 공정
      const rows = [[TEN, 50], [[2, 4, 6, 8, 10], 140], [[20, 40, 60, 80, 100], 230], [[20, 40, 60], 320]];
      const st = [['filter { it % 2 == 0 }', 95], ['.map { it * 10 }', 185], ['.take(3)', 275]];
      st.forEach(([s, y], i) => station(y, s, { h: 30, op: fade(u, 0.15 + i * 0.6) }));
      kt(230, 55, 'nums', { anchor: 'end' });
      rows.forEach(([vals, y], r) => { const at = r === 0 ? 0 : 0.3 + (r - 1) * 0.6;
        vals.forEach((v, i) => { const s = r === 0 ? 1 : pop(u, at + i * 0.07), dropped = r === 2 && i >= 3 && u > 2.0;
          box(cx10(i), y, v, { w: W10, h: 36, fs: 15, s, stroke: r === 3 ? ACC : dropped ? OFF : INK, fill: r === 3 ? ACCBG : PANEL, color: dropped ? OFF : INK }); }); });
      if (u > 2.0) { cross(cx10(3), 275, 7, pop(u, 2.0)); cross(cx10(4), 275, 7, pop(u, 2.05)); }
      mono(560, 325, 'out = [20, 40, 60]', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) });
      sub(560, 382, '한 줄이 한 처리 단계. 위에서 아래로 읽으면 문장이 된다', fade(u, 2.4), { 'font-size': 15 }); return; }
    // k === 2 : 자주 쓰는 변형 셋
    const P = [20, 330, 640];
    P.forEach((x, i) => el('rect', { x, y: 40, width: 300, height: 340, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1 + i * 0.1) }));
    // ① filterNotNull
    kt(P[0] + 14, 70, 'filterNotNull()', { op: fade(u, 0.2) });
    const NN = [1, null, 2, null, 3]; let j = 0;
    NN.forEach((v, i) => { const x = P[0] + 40 + i * 55, f = E(u, 0.5 + i * 0.1, 1.0 + i * 0.1);
      if (v == null) { box(x, lerp(130, 175, f), 'null', { w: 50, fs: 13.5, stroke: OFF, color: OFF, op: 1 - 0.8 * f }); return; }
      const tx2 = P[0] + 95 + j * 55; j++; box(lerp(x, tx2, f), lerp(130, 250, f), v, { w: 50, stroke: f > 0.98 ? GOOD : INK, fill: f > 0.98 ? GOODBG : PANEL }); });
    mono(P[0] + 150, 320, '[1, 2, 3]', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.3) });
    // ② partition
    kt(P[1] + 14, 70, 'partition { it > 5 }', { op: fade(u, 0.6) });
    TEN.forEach((v, i) => { const hi = v > 5, f = E(u, 0.9 + i * 0.05, 1.4 + i * 0.05), x0 = P[1] + 26 + i * 28;
      const x1 = P[1] + 60 + (hi ? v - 6 : v - 1) * 40, y1 = hi ? 220 : 300;
      box(lerp(x0, x1, f), lerp(130, y1, f), v, { w: 26, h: 30, fs: 13.5, stroke: hi ? GOOD : WARN, fill: f > 0.98 ? (hi ? GOODBG : WARNBG) : PANEL }); });
    note(P[1] + 14, 196, 'pass', fade(u, 1.5), { fill: GOOD }); note(P[1] + 14, 276, 'fail', fade(u, 1.5), { fill: WARN });
    // ③ firstOrNull
    kt(P[2] + 14, 70, 'firstOrNull { it > 100 }', { op: fade(u, 1.2), fs: 14 });
    const sc = clamp((u - 1.5) / 0.8) * 10;
    TEN.forEach((v, i) => box(P[2] + 26 + i * 28, 130, v, { w: 26, h: 30, fs: 13.5, op: fade(u, 1.2), stroke: i < sc ? OFF : INK, color: i < sc ? OFF : INK }));
    if (u > 1.5 && u < 2.3) el('rect', { x: P[2] + 12 + Math.min(9, Math.floor(sc)) * 28, y: 110, width: 28, height: 40, rx: 5, fill: 'none', stroke: INFO, 'stroke-width': 2.5 });
    if (u > 2.3) box(P[2] + 150, 250, 'null', { w: 90, h: 50, fs: 20, stroke: WARN, fill: WARNBG, s: pop(u, 2.3) });
    sub(P[2] + 150, 320, '끝까지 없으면 null', fade(u, 2.4), { 'font-size': 14.5 });
    sub(480, 405, '이름이 곧 의도라서 주석 없이도 읽힌다', fade(u, 2.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 5. 체이닝 + 집계 + 지연 평가 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const rows = [[[1, 2, 3, 4, 5, 6], 50], [[2, 4, 6], 140], [[4, 16, 36], 230]];
      const st = [['.filter { it % 2 == 0 }', 95], ['.map { it * it }', 185], ['.sum()', 275]];
      kt(230, 55, 'listOf(1..6)', { anchor: 'end' });
      st.forEach(([s, y], i) => station(y, s, { h: 30, op: fade(u, 0.15 + i * 0.6) }));
      rows.forEach(([vals, y], r) => vals.forEach((v, i) => box(cx1(i), y, v, { w: CW, h: 36, fs: 15, s: r === 0 ? 1 : pop(u, 0.3 + (r - 1) * 0.6 + i * 0.1) })));
      [[2, 4, 6], [4, 16, 36]].forEach((vals, r) => vals.forEach((v, i) => dot([[cx1(i), r ? 158 : 68], [cx1(i), r ? 212 : 122]], seg(u, 0.2 + r * 0.6 + i * 0.1, 0.45 + r * 0.6 + i * 0.1), ACC, 5)));
      const tot = Math.round(lerp(0, 56, E(u, 1.6, 2.3)));
      if (u > 1.5) box(cx1(1), 330, tot, { w: 120, h: 52, fs: 24, stroke: ACC, fill: ACCBG, s: pop(u, 1.5) });
      mono(cx1(2) + 30, 336, '= 4 + 16 + 36', { 'font-size': 16, fill: MUT, opacity: fade(u, 2.0) });
      kt(930, 336, 'val total', { anchor: 'end', op: fade(u, 1.5) });
      note(700, 140, 'var · for · if 가', fade(u, 2.3), { fill: GOOD }); note(700, 165, '하나도 없다', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 1) { const P = [20, 330, 640];
      P.forEach((x, i) => el('rect', { x, y: 40, width: 300, height: 340, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1 + i * 0.1) }));
      kt(P[0] + 14, 70, 'joinToString(",")', { op: fade(u, 0.2) });
      ['a', 'b', 'c'].forEach((s, i) => { const f = E(u, 0.5, 1.1); box(lerp(P[0] + 70 + i * 80, P[0] + 110 + i * 40, f), lerp(140, 250, f), `"${s}"`, { w: 54, op: 1 - f * 0.9 }); });
      if (u > 1.0) box(P[0] + 150, 250, '"a,b,c"', { w: 130, h: 50, fs: 19, stroke: GOOD, fill: GOODBG, s: pop(u, 1.0) });
      kt(P[1] + 14, 70, 'groupBy { it % 2 }', { op: fade(u, 0.6) });
      el('rect', { x: P[1] + 14, y: 200, width: 130, height: 160, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.8) });
      el('rect', { x: P[1] + 156, y: 200, width: 130, height: 160, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.8) });
      mono(P[1] + 79, 224, 'key 1', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) });
      mono(P[1] + 221, 224, 'key 0', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.8) });
      TEN.forEach((v, i) => { const odd = v % 2, f = E(u, 0.9 + i * 0.07, 1.4 + i * 0.07), slot = Math.floor(i / 2);
        const x1 = (odd ? P[1] + 50 : P[1] + 192) + (slot % 2) * 58, y1 = 256 + Math.floor(slot / 2) * 38;
        box(lerp(P[1] + 26 + i * 28, x1, f), lerp(130, y1, f), v, { w: f > 0.5 ? 46 : 26, h: 30, fs: 13.5, stroke: odd ? INFO : WARN }); });
      kt(P[2] + 14, 70, 'sumOf { if (it % 2 == 0)', { op: fade(u, 1.3), fs: 14 }); kt(P[2] + 14, 94, '        it else 0 }', { op: fade(u, 1.3), fs: 14 });
      const s = [2, 4, 6, 8, 10].reduce((a, v, i) => a + v * clamp((u - 1.5 - i * 0.15) / 0.15), 0);
      TEN.forEach((v, i) => box(P[2] + 26 + i * 28, 140, v, { w: 26, h: 30, fs: 13.5, op: fade(u, 1.3), stroke: v % 2 ? OFF : GOOD, color: v % 2 ? OFF : INK }));
      box(P[2] + 150, 250, Math.round(s), { w: 100, h: 54, fs: 24, stroke: GOOD, fill: GOODBG, op: fade(u, 1.5) });
      sub(480, 405, '모두 람다 하나로 동작을 정하는 표준 어휘다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { // 즉시 평가 vs 지연 평가
      el('rect', { x: 20, y: 40, width: 430, height: 330, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: 470, y: 40, width: 470, height: 330, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      lbl(235, 72, 'List (즉시 평가)', 1, { fill: INK }); lbl(705, 72, '.asSequence() (지연 평가)', 1, { fill: ACC });
      [['filter 결과 List', 0.3], ['map 결과 List', 0.8]].forEach(([s, at], i) => { const y = 120 + i * 80, g = E(u, at, at + 0.6);
        tx(40, y, s, { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: 40, y: y + 10, width: 390, height: 22, rx: 5, fill: PANEL, stroke: GRID });
        el('rect', { x: 40, y: y + 10, width: Math.max(2, 390 * g), height: 22, rx: 5, fill: WARN, opacity: 0.85 });
        mono(430, y, Math.round(142857 * g).toLocaleString('en-US') + '개', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: WARN }); });
      tx(40, 300, 'take(10) 전에 원소 142,857개짜리', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(40, 324, '중간 리스트가 두 번 만들어진다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      // 오른쪽: 원소 하나씩 끌려 나온다
      const S = [['filter', 540], ['map', 680], ['take', 820]];
      S.forEach(([s, x]) => card(x, 150, 104, 46, { rx: 9, text: s, mono: true, fs: 15, stroke: ACC }));
      grow(592, 150, 626, 150, 1, MUT); grow(732, 150, 766, 150, 1, MUT);
      const p = clamp((u - 0.3) / 2.0), fc = Math.round(70 * p), mc = Math.floor(fc / 7), rc = mc;
      if (u > 0.3 && u < 2.3) { const ph = (fc % 7) / 7; dot([[500, 150], [590, 150]], ph, INFO, 6); if (fc % 7 === 6) dot([[590, 150], [870, 150]], (p * 70 % 1), ACC, 6); }
      [['filter 검사', fc, 70], ['map 호출', mc, 10], ['결과', rc, 10]].forEach(([s, v, m], i) => { const y = 235 + i * 40;
        tx(500, y, s, { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: 610, y: y - 14, width: 220, height: 18, rx: 4, fill: PANEL, stroke: GRID });
        el('rect', { x: 610, y: y - 14, width: Math.max(2, 220 * v / 70), height: 18, rx: 4, fill: ACC });
        mono(920, y, v + '번', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC }); });
      sub(480, 400, 'take(10)이 필요한 10개를 채우면 1..1,000,000 의 71번째부터는 꺼내지도 않는다', fade(u, 2.3), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k === 3 : 남는 한 문장
    const m = E(u, 0.6, 1.5);
    for (let i = 0; i < 10; i++) { const y = lerp(60 + i * 30, 150 + Math.min(i, 3) * 4, m), w = [150, 200, 150, 190, 230, 260, 220, 60, 40, 170][i];
      el('rect', { x: 40, y, width: w, height: 14, rx: 4, fill: i >= 3 && i <= 8 ? WARN : OFF, opacity: 1 - m }); }
    tx(lerp(40, 150, m), lerp(44, 205, m), '명령형 10줄', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: 1 - m * 0.4, 'text-decoration': m > 0.9 ? 'line-through' : null });
    grow(300, 200, 400, 200, E(u, 1.0, 1.4), ACC);
    const L = ['val total = listOf(1, 2, 3, 4, 5, 6)', '    .filter { it % 2 == 0 }', '    .map { it * it }', '    .sum()'];
    L.forEach((s, i) => kt(420, 140 + i * 32, s, { op: fade(u, 1.2 + i * 0.18), fs: 15.5 }));
    ['짝수만', '제곱', '합산'].forEach((s, i) => pill(870, 172 + i * 32, s, ACC, pop(u, 1.8 + i * 0.15), { fs: 13.5 }));
    banner(480, 350, '코드가 곧 "무엇을 한다" 는 문장이 된다', pop(u, 2.3)); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: '명령형 for 코드에서 "버그 표면적"으로 지목된 것은 무엇인가?',
      o: ['println 호출', '누적 변수·루프 변수·임시 변수 같은 손으로 관리하는 상태', 'listOf로 만든 입력 리스트'], a: 1,
      why: 'var total, 루프 변수 n, doubled 같은 상태를 사람이 직접 관리한다. 결과 24는 맞아도 상태가 많을수록 실수할 자리가 늘어난다.' },
    { q: '람다 { it * 3 }에서 it은 무엇인가?',
      o: ['인자가 정확히 하나일 때 그 인자에 붙는 자동 이름', '람다가 돌려주는 값', '람다를 담은 변수 이름'], a: 0,
      why: '인자가 하나면 이름을 생략하고 it으로 받는다. 그래서 triple(4)는 4 * 3 = 12가 된다.' },
    { q: 'nums.map { it * 2 }를 실행한 뒤 nums는 어떻게 되는가?',
      o: ['[2, 4, 6, 8, 10, 12]로 바뀐다', '비어 버린다', '[1, 2, 3, 4, 5, 6] 그대로 남는다'], a: 2,
      why: 'map은 새 리스트를 만들 뿐 원본을 건드리지 않는다. 그래서 같은 리스트를 여러 파이프라인에 다시 쓸 수 있다.' },
    { q: '(1..10).filter { it % 2 == 0 }.map { it * 10 }.take(3)의 결과는 무엇인가?',
      o: ['[20, 40, 60]', '[10, 20, 30]', '[2, 4, 6]'], a: 0,
      why: '짝수 5개를 고른 뒤 10배 해서 [20, 40, 60, 80, 100]이 되고, take(3)이 앞의 셋만 남긴다.' },
    { q: '(1..1_000_000)에 asSequence()를 붙이면 filter { it % 7 == 0 }은 몇 번 실행되는가? (뒤에 take(10))',
      o: ['1,000,000번', '70번', '142,857번'], a: 1,
      why: '시퀀스는 원소를 하나씩 끌어온다. 7의 배수 10개는 70까지면 다 모이므로 filter는 70번만 돌고 멈춘다.' },
  ];
  const summary = [
    '명령형 for는 누적 변수와 임시 변수를 사람이 관리해서 의도가 코드에 묻힌다.',
    '람다는 이름 없는 함수 값이고, 람다를 인자로 받는 함수를 고차함수라 한다.',
    'map은 길이를 지키며 원소를 바꾸고, filter는 조건이 참인 원소만 남긴다.',
    'asSequence()를 붙이면 원소를 하나씩 끌어와 중간 리스트 없이 필요한 만큼만 계산한다.',
  ];
  const review = [
    { q: '주문 100만 건에서 조건에 맞는 첫 10건만 필요한데 filter와 map을 이어 쓴 코드가 메모리를 많이 쓴다. 먼저 바꿀 것은?',
      o: ['for 루프로 다시 쓴다', '맨 앞에 asSequence()를 붙인다', 'map을 filter 앞으로 옮긴다'], a: 1,
      why: 'List 체인은 단계마다 중간 리스트를 끝까지 만든다. 시퀀스로 바꾸면 take(10)이 채워지는 순간 더 꺼내지 않는다.' },
    { q: '리스트 길이가 처리 전후로 달라졌다. 체인 안에 있을 가능성이 가장 큰 것은?',
      o: ['filter', 'map', 'sortedBy'], a: 0,
      why: 'map은 원소마다 하나씩 바꾸고 sortedBy는 순서만 바꾸므로 길이가 그대로다. 길이를 줄이는 것은 filter, take 같은 고르는 함수다.' },
    { q: '함수 fun retry(times: Int, op: () -> Unit)를 만들었다. 이 함수를 고차함수라고 부르는 이유는?',
      o: ['이름이 동사라서', 'Int를 돌려줘서', '함수 타입 매개변수 op로 동작을 받아서'], a: 2,
      why: '매개변수 타입이 함수 타입이면 호출부가 람다로 동작을 넘긴다. apply(7, { it + 100 })이 107을 낸 것과 같은 구조다.' },
  ];

  R.page({ title: 'map · filter · reduce 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
