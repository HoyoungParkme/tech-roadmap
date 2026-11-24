/* II-1-1 generic 함수/구조체 재사용 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 코드 카드와 타입 자리(T), 최댓값을 찾는 리스트 칸, rustc 진단, 트레잇 구현표와 바운드 게이트,
   모노모픽화로 찍혀 나오는 함수(LLVM IR 기호), 구조체·Vec의 메모리 칸 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // ---------- 지역 도우미 ----------
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 코드 한 줄: words에 든 낱말만 색칠 (낱말 경계 기준)
  function cline(x, y, s, o) { o = o || {}; const fs = o.fs || 14, ws = o.words || [];
    const parts = ws.length ? s.split(new RegExp('(?<![\\w])(' + ws.map(esc).join('|') + ')(?![\\w])')).filter((p) => p !== '')
      .map((p) => [p, ws.includes(p) ? { fill: o.wcol || ACC, 'font-weight': 800 } : (o.base ? { fill: o.base } : {})]) : [[s, o.base ? { fill: o.base } : {}]];
    return spans(x, y, parts, { 'font-size': fs, opacity: o.op ?? 1 }); }
  // 코드 카드: 머리 + 줄들. o.show(i) 줄별 보임, o.hl(i) 줄 바탕색, o.strike(i) 줄 긋기
  function codeCard(x, y, w, title, lines, o) { o = o || {}; const lh = o.lh || 22, fs = o.fs || 14, top = title ? 34 : 12, h = top + lines.length * lh + 10, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, 'stroke-dasharray': o.dash, opacity: op });
    if (title) tx(x + 14, y + 22, title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    lines.forEach((s, i) => { const a = (o.show ? o.show(i) : 1) * op; if (a <= 0.01) return; const yy = y + top + i * lh, hl = o.hl && o.hl(i);
      if (hl) el('rect', { x: x + 6, y: yy + 1, width: w - 12, height: lh - 2, rx: 4, fill: hl === true ? HL : hl, opacity: 0.6 * a });
      cline(x + 14, yy + lh * 0.72, s, { fs, words: o.words, wcol: o.wcol, op: a, base: o.base });
      if (o.strike && o.strike(i)) el('line', { x1: x + 12, y1: yy + lh / 2, x2: x + 14 + tw(s, fs), y2: yy + lh / 2, stroke: BAD, 'stroke-width': 2, opacity: a }); });
    return { x, y, w, h, row: (i) => y + top + i * lh + lh / 2 }; }
  // rustc 진단 상자: rows [[글, 색, 굵기]]
  function diag(x, y, w, rows, o) { o = o || {}; const lh = o.lh || 22, h = 16 + rows.length * lh, op = o.op ?? 1, ok = o.ok;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: ok ? GOODBG : BADBG, stroke: ok ? GOOD : BAD, 'stroke-width': 1.8, opacity: op });
    rows.forEach(([s, col, fw], i) => { const a = (o.show ? o.show(i) : 1) * op; if (a <= 0.01) return;
      mono(x + 14, y + 8 + i * lh + lh * 0.72, s, { 'font-size': o.fs || 14, fill: col || INK, 'font-weight': fw || 400, opacity: a }); });
    return h; }
  // 타입 알약
  const tchip = (cx, cy, s, col, sc, o) => pill(cx, cy, s, col, sc, Object.assign({ mono: true, fs: 15 }, o || {}));

  // ---------- 1. 복제: 같은 알고리즘, 타입만 다른 두 함수 ----------
  const BODY = (t) => [`fn largest_${t}(list: &[${t}]) -> &${t} {`, '    let mut largest = &list[0];', '    for item in list {', '        if item > largest { largest = item; }', '    }', '    largest', '}'];
  const L1 = [34, 50, 25, 100], L2 = ["'y'", "'m'", "'a'", "'q'"];
  // 리스트 칸 + largest 화살표 + item 표시
  function scanList(x, y, vals, best, cur, o) { o = o || {}; const w = 70, gap = 6;
    vals.forEach((v, i) => { const on = i === best, at = i === cur;
      card(x + i * (w + gap) + w / 2, y + 22, w, 44, { rx: 6, text: String(v), fs: 17, mono: true, stroke: on ? ACC : at ? WARN : INK, fill: on ? ACCBG : PANEL, sw: on || at ? 2.6 : 2, color: on ? ACC : INK, op: o.op }); });
    if (best >= 0) { const bx = x + best * (w + gap) + w / 2;
      el('path', { d: `M${bx},${y + 92} L${bx},${y + 50}`, stroke: ACC, 'stroke-width': 2.6, 'marker-end': 'url(#ra-ahb)', opacity: o.op ?? 1 });
      mono(bx, y + 110, 'largest', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: o.op ?? 1 }); }
    if (cur >= 0) mono(x + cur * (w + gap) + w / 2, y - 8, 'item', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: o.op ?? 1 }); }
  function s1(t, c) { const { k, u } = c;
    // 왼쪽 i32 판
    const showL = (i) => (k === 0 ? (i <= 1 || i >= 5 ? fade(u, 0.2 + i * 0.08) : 0.25) : 1);
    codeCard(20, 20, 430, 'no_generic.rs · i32 전용', BODY('i32'), { words: ['i32'], wcol: ACC, show: showL, hl: (i) => (k === 0 && i === 1) || (k === 1 && i === 3), stroke: k <= 1 ? ACC : GRID });
    // 최댓값 찾기: k1에서 item이 한 칸씩
    let best = 0, cur = -1, out = '';
    if (k === 1) { const s = seg(u, 0.2, 2.2); cur = Math.min(3, Math.floor(s * 4)); best = [0, 1, 1, 3][cur]; if (s >= 1) { cur = -1; out = '100'; } }
    if (k >= 2) { out = '100'; }
    scanList(40, 262, L1, best, cur, { op: k === 0 ? fade(u, 0.6) : 1 });
    if (k === 1 && cur >= 1) { const ok = [false, true, false, true][cur];
      mono(190, 238, `${L1[cur]} > ${L1[[0, 0, 1, 1][cur]]} ?  ${ok ? 'yes' : 'no'}`, { 'text-anchor': 'middle', 'font-size': 14, fill: ok ? ACC : MUT, 'font-weight': 700 }); }
    if (out) pill(392, 284, '→ 100', ACC, k === 1 ? pop(u, 2.2) : 1, { mono: true, fs: 15 });
    // 오른쪽 char 판: k2에서 복사되어 날아온다
    if (k >= 2) { const s = k === 2 ? E(u, 0.2, 1.1) : 1, x = lerp(20, 510, s);
      codeCard(x, 20, 430, s > 0.95 ? 'no_generic.rs · char 전용' : null, BODY('char'), { words: ['char'], wcol: WARN, stroke: WARN, show: (i) => (k === 2 ? fade(u, 1.0 + i * 0.1) : 1), dash: s < 1 ? '6 5' : null });
      if (s >= 1) scanList(520, 262, L2, 0, -1, { op: k === 2 ? fade(u, 1.7) : 1 });
      if (k === 2) tx(480, 400, '본문 6줄이 글자 하나 다르지 않다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      if (s >= 1) pill(878, 284, "→ 'y'", WARN, k === 2 ? pop(u, 2.2) : 1, { mono: true, fs: 15 }); }
    // k3: 버그 하나를 고치려면 두 곳을
    if (k === 3) { [[235, 0.3], [725, 0.9]].forEach(([x, a]) => { const s = pop(u, a); card(x, 236, 150, 30, { rx: 15, fill: BAD, stroke: 'none', text: '여기도 고친다', fs: 14, color: PANEL, s }); });
      card(480, 398, 360, 36, { rx: 18, fill: INK, stroke: 'none', text: '알고리즘 1개 · 함수 2벌 · 고칠 곳 2곳', fs: 15, color: PANEL, s: pop(u, 1.5) }); } }

  // ---------- 2. 타입 매개변수 T ----------
  const GEN = ['fn largest<T>(list: &[T]) -> &T {', '    let mut largest = &list[0];', '    for item in list {', '        if item > largest { largest = item; }', '    }', '    largest', '}'];
  // T 상자: 지금 T에 대해 컴파일러가 아는 능력
  function tBox(x, y, abil, o) { o = o || {};
    el('rect', { x, y, width: 300, height: 150, rx: 12, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': 2 });
    tx(x + 16, y + 26, '컴파일러가 아는 T', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    card(x + 52, y + 84, 64, 64, { rx: 10, text: 'T', fs: 30, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: o.s });
    if (!abil.length) { tx(x + 100, y + 78, '할 수 있는 연산', { 'font-size': 14, fill: MUT }); tx(x + 100, y + 102, '아무것도 없다', { 'font-size': 16, 'font-weight': 800, fill: o.bad ? BAD : INK }); }
    abil.forEach(([s, a], i) => { if (a <= 0) return; pill(x + 150 + (i % 2) * 90, y + 66 + Math.floor(i / 2) * 38, s, GOOD, a, { mono: true, fs: 14 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { // 두 시그니처의 i32, char가 T 한 자리로 모인다
      const s = E(u, 0.9, 1.8);
      cline(40, 44, 'fn largest_i32(list: &[i32]) -> &i32', { fs: 15, words: ['i32'], wcol: ACC, op: 1 - s * 0.6 });
      cline(40, 74, 'fn largest_char(list: &[char]) -> &char', { fs: 15, words: ['char'], wcol: WARN, op: 1 - s * 0.6 });
      fly(270, 40, 680, 210, seg(u, 0.4, 1.4), 'i32', { mono: true }); fly(290, 70, 680, 210, seg(u, 0.6, 1.6), 'char', { mono: true, fill: WARN });
      tBox(600, 130, [], { s: pop(u, 1.4) }); }
    const card2 = codeCard(20, k === 0 ? 110 : 30, 540, 'generic_fn.rs', k === 0 ? GEN.slice(0, 1) : GEN, { words: ['T'], wcol: ACC, stroke: k === 2 ? BAD : ACC,
      show: (i) => (k === 0 ? (i === 0 ? fade(u, 1.6) : 0) : k === 1 ? (i === 0 ? 1 : fade(u, 0.2 + i * 0.15)) : 1), hl: (i) => (k === 2 && i === 3 ? BADBG : k === 0 && i === 0 && u > 1.8) });
    if (k === 1) { // 중복 함수 한 벌이 사라진다
      const g = E(u, 1.2, 2.2); codeCard(620, 70, 300, '복제본', ['fn largest_i32(…)', 'fn largest_char(…)'], { lh: 26, fs: 15, strike: (i) => i === 1 && g > 0.5, op: 1 });
      mono(770, 190, `함수 ${g > 0.5 ? 1 : 2}벌`, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: g > 0.5 ? ACC : INK });
      tx(770, 220, '본문은 그대로 옮겼다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      pill(290, 250, '아직 컴파일 전', WARN, pop(u, 2.0), { fs: 14 }); }
    if (k === 2) { tBox(600, 30, [], { stroke: BAD, bad: true });
      cross(548, card2.row(3), 7, pop(u, 0.3));
      diag(20, 250, 920, [['error[E0369]: binary operation `>` cannot be applied to type `&T`', BAD, 700], [' --> generic_fn.rs:4:17', MUT], ['help: consider restricting type parameter `T` with trait `PartialOrd`', INK]],
        { show: (i) => fade(u, 0.4 + i * 0.4) });
      tx(480, 400, 'T가 무엇이든 될 수 있으니 >가 된다는 보장도 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); } }

  // ---------- 3. 트레잇 바운드: 구현표를 보고 문을 연다 ----------
  const TYPES = [['i32', true, '34, 50, 25, 100', '100'], ['char', true, "'y' 'm' 'a' 'q'", "'y'"], ['Cfg', false, 'Cfg { level }', '']];
  function implTable(x, y, hot, o) { o = o || {};
    el('rect', { x, y, width: 300, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 14, y + 22, '트레잇 구현표', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); mono(x + 230, y + 22, 'PartialOrd', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 });
    TYPES.forEach(([n, ok], i) => { const yy = y + 52 + i * 34, on = hot === i;
      if (on) el('rect', { x: x + 6, y: yy - 16, width: 288, height: 30, rx: 6, fill: ok ? GOODBG : BADBG });
      mono(x + 20, yy + 5, n, { 'font-size': 16, 'font-weight': 700, fill: on ? (ok ? GOOD : BAD) : INK });
      if (ok) check(x + 230, yy, 9, on ? 1.2 : 1); else cross(x + 230, yy, 8, on ? 1.2 : 1); }); }
  function s3(t, c) { const { k, u } = c;
    // 시그니처: k0에서 ': PartialOrd'가 끼어든다
    const g0 = k === 0 ? E(u, 0.3, 1.2) : 1, bound = ': PartialOrd';
    spans(40, 56, [['fn largest<T', {}], [bound.slice(0, Math.round(bound.length * g0)), { fill: ACC, 'font-weight': 800, 'text-decoration': 'underline' }], ['>(list: &[T]) -> &T', {}]], { 'font-size': 19, 'font-weight': 700 });
    if (k <= 1) { tBox(620, 100, [['>', pop(u, k === 0 ? 1.4 : 0)], ['<', pop(u, k === 0 ? 1.6 : 0)], ['>=', pop(u, k === 0 ? 1.8 : 0)], ['<=', pop(u, k === 0 ? 2.0 : 0)]], { stroke: ACC });
      if (k === 0) tx(40, 120, '바운드 = T에게 요구하는 능력 목록', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      if (k === 0) tx(40, 148, 'PartialOrd를 구현한 타입만 T 자리에 올 수 있다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      if (k === 1) { const sw = E(u, 0.8, 1.4);
        diag(40, 110, 540, [['error[E0369]: binary operation `>` …', BAD, 700]], { op: 1 - sw * 0.75 });
        if (sw > 0) el('line', { x1: 52, y1: 130, x2: 52 + 520 * sw, y2: 130, stroke: BAD, 'stroke-width': 2.5 });
        diag(40, 170, 540, [['        if item > largest { largest = item; }  // OK', GOOD, 700]], { ok: true, op: fade(u, 1.4) });
        check(570, 190, 12, pop(u, 1.8));
        tx(40, 260, '본문은 한 글자도 안 바꿨다. 바뀐 것은 시그니처 한 줄', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }
      return; }
    // k2~4: 호출이 바운드 게이트를 지난다
    const gx = 470, gy = 160, hot = k - 2, [n, ok, vals, res] = TYPES[hot];
    implTable(620, 90, u > 0.9 ? hot : -1);
    el('rect', { x: gx - 9, y: gy - 60, width: 18, height: 120, rx: 5, fill: ACC });
    mono(gx, gy + 86, 'T: PartialOrd', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    // 앞서 통과한 타입들
    TYPES.slice(0, hot).forEach(([m, , , r], i) => { mono(640, 290 + i * 28, `largest(${m} 리스트)`, { 'font-size': 14.5, fill: MUT }); mono(900, 290 + i * 28, '→ ' + r, { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end' }); });
    const s = seg(u, 0.2, 1.4), back = ok ? 0 : E(u, 1.4, 2.0), px = ok ? lerp(110, 560, E(u, 0.2, 2.0)) : lerp(110, gx - 60, E(s, 0, 1)) - back * 90;
    tchip(px, gy, n, ok ? GOOD : BAD, 1, { fill: PANEL });
    mono(110, gy - 34, vals, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.1) });
    if (ok && u > 2.0) pill(560, gy + 44, '→ ' + res, GOOD, pop(u, 2.0), { mono: true, fs: 15 });
    if (!ok) { cross(gx, gy - 80, 11, pop(u, 1.3));
      diag(40, 290, 570, [['error[E0277]: can\'t compare `Cfg` with `Cfg`', BAD, 700], ['note: required by a bound in `largest`  (T: PartialOrd)', INK], ['help: consider annotating `Cfg` with `#[derive(PartialOrd)]`', INK]], { show: (i) => fade(u, 1.5 + i * 0.3) }); } }

  // ---------- 4. 모노모픽화: 소스 한 벌, 기계어는 타입마다 ----------
  function s4(t, c) { const { k, u } = c;
    codeCard(20, 30, 400, '소스 · 사람이 관리하는 것', ['fn largest<T: PartialOrd>(list: &[T])', '    -> &T { … }'], { words: ['T'], wcol: ACC, stroke: ACC, lh: 24, fs: 15 });
    mono(220, 140, '관리 대상 1벌', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.6) : 1 });
    codeCard(20, 170, 400, 'main의 호출', ['largest(&[34, 50, 25, 100])', "largest(&['y', 'm', 'a', 'q'])"], { lh: 26, fs: 15, hl: (i) => (k === 1 && i === 0) || (k === 2 && i === 1), show: (i) => (k === 0 ? fade(u, 1.0 + i * 0.4) : 1) });
    // 컴파일러 상자
    const rx = 520, ry = 130;
    card(rx, ry, 120, 70, { rx: 12, fill: INK, stroke: 'none', text: 'rustc', fs: 18, color: PANEL, mono: true });
    sub(rx, ry + 54, '쓰인 타입마다 찍는다', 1, { 'font-size': 13.5 });
    const outs = [['largest::<i32>', 'fn(&[i32]) -> &i32', '…4mono7largestlE…', 'l = i32'], ['largest::<char>', 'fn(&[char]) -> &char', '…4mono7largestcE…', 'c = char']];
    outs.forEach(([nm, sig, sym, key], i) => { const appear = k > i + 1 ? 1 : k === i + 1 ? E(u, 1.0, 1.8) : 0; if (appear <= 0) return; const y = 40 + i * 130, x = lerp(rx, 640, appear);
      el('rect', { x, y, width: 290, height: 108, rx: 10, fill: i === 0 ? ACCBG : WARNBG, stroke: i === 0 ? ACC : WARN, 'stroke-width': 2, opacity: appear });
      mono(x + 14, y + 26, nm, { 'font-size': 16, 'font-weight': 800, fill: i === 0 ? ACC : WARN, opacity: appear });
      mono(x + 14, y + 52, sig, { 'font-size': 14, opacity: appear });
      mono(x + 14, y + 78, sym, { 'font-size': 13.5, fill: MUT, opacity: appear }); mono(x + 276, y + 78, key, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: appear });
      if (k === i + 1) dot([[400, 205 + i * 26], [rx - 60, ry], [rx + 60, ry], [640, y + 54]], seg(u, 0.1, 1.2), i === 0 ? ACC : WARN, 7); });
    if (k === 1 || k === 2) tx(785, 300, 'LLVM IR의 함수 이름 (rustc 1.100, v0 맹글링)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) });
    if (k === 2) tx(220, 300, 'Step 1에서 손으로 만든 두 벌과 같은 모양', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
    if (k === 3) { // 실행 시점: 고르는 일이 없다
      [['실행 중 타입 검사', 300], ['vtable 조회', 360]].forEach(([s, y], i) => { const a = fade(u, 0.3 + i * 0.4);
        card(220, y, 260, 40, { rx: 8, text: s, fs: 15, stroke: GRID, color: MUT, dash: '6 5', op: a }); if (u > 0.9 + i * 0.4) cross(368, y, 9, pop(u, 0.9 + i * 0.4)); });
      card(785, 340, 300, 56, { rx: 10, fill: INK, stroke: 'none', text: '호출 = 정해진 함수로 바로 점프', fs: 15, color: PANEL, s: pop(u, 1.6) }); } }

  // ---------- 5. 구조체·표준 라이브러리도 제네릭 ----------
  // 바이트 칸 줄: n 바이트, 한 칸 w
  function byteRow(x, y, n, w, col, fill, a) { for (let i = 0; i < n; i++) { const s = clamp(a * n - i); if (s <= 0) return;
    el('rect', { x: x + i * w, y, width: w - 2, height: 34, rx: 3, fill, stroke: col, 'stroke-width': 1.4, opacity: s }); } }
  function s5(t, c) { const { k, u } = c;
    codeCard(20, 20, 420, 'generic_types.rs', ['struct Point<T> { x: T, y: T }'], { words: ['T'], wcol: ACC, stroke: k === 0 ? ACC : GRID, lh: 26, fs: 15 });
    if (k === 0) { // 같은 정의, 다른 크기
      [['Point<i32>', 4, '1', '2', 8, ACC, ACCBG], ['Point<f64>', 8, '1.5', '2.5', 16, WARN, WARNBG]].forEach(([nm, b, xv, yv, tot, col, bg], r) => {
        const y = 150 + r * 120, a = E(u, 0.3 + r * 0.7, 1.1 + r * 0.7), w = 26;
        mono(40, y + 24, nm, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + r * 0.7) });
        byteRow(200, y, b, w, col, bg, clamp(a * 2)); byteRow(200 + b * w + 14, y, b, w, col, bg, clamp(a * 2 - 1));
        if (a > 0.5) mono(200 + b * w / 2, y + 23, 'x=' + xv, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
        if (a >= 1) { mono(200 + b * w + 14 + b * w / 2, y + 23, 'y=' + yv, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
          mono(200 + 2 * b * w + 30, y + 23, `${tot} 바이트`, { 'font-size': 15, 'font-weight': 800, fill: col }); } });
      tx(480, 400, '정의는 하나, 타입마다 크기가 정해진 구조체가 따로 생긴다 (size_of 실측)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { // impl<T: Display>에 show를 단다
      codeCard(20, 80, 560, null, ['impl<T: std::fmt::Display> Point<T> {', '    fn show(&self) { println!("({}, {})", self.x, self.y); }', '}'], { words: ['T', 'Display'], wcol: ACC, stroke: ACC, show: (i) => fade(u, 0.2 + i * 0.3) });
      [['impl<T', '선언'], ['Point<T>', '사용']].forEach(([s, m], i) => { const x = i === 0 ? 70 : 290; pill(x, 200, s + ' · ' + m, i === 0 ? ACC : INK, pop(u, 1.1 + i * 0.3), { mono: true, fs: 13.5 }); });
      terminal(620, 80, 310, 120, ['$ ./generic_types', '(1, 2)', '(1.5, 2.5)'], 1 + seg(u, 1.6, 2.4) * 2, { title: 'show() 실행 예' });
      tx(300, 270, 'T: Display가 있어야 {}로 x, y를 찍을 수 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { // Vec<i32> 머리 칸과 Option<&i32>
      tx(40, 110, 'let v: Vec<i32> = Vec::new();', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      tx(40, 136, '스택에 머리 3칸 (24 바이트)', { 'font-size': 13.5, fill: MUT });
      [['ptr', '•'], ['len', '0'], ['cap', '0']].forEach(([n, v], i) => { const a = pop(u, 0.3 + i * 0.25), x = 60 + i * 110;
        card(x + 50, 190, 100, 50, { rx: 6, text: v, fs: 18, mono: true, stroke: ACC, s: a }); mono(x + 50, 236, n, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.25) }); });
      grow(110, 244, 110, 306, seg(u, 1.1, 1.6), MUT, { dash: '5 5' });
      card(170, 330, 260, 40, { rx: 8, text: '힙: 아직 안 잡음 (cap 0)', fs: 14, stroke: GRID, color: MUT, dash: '6 5', op: fade(u, 1.5) });
      tx(560, 110, 'let first: Option<&i32> = v.first();', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.4) });
      [['Some(&i32)', GRID, MUT], ['None', ACC, ACC]].forEach(([s, st, col], i) => card(640 + i * 170, 200, 150, 52, { rx: 10, text: s, fs: 16, mono: true, stroke: st, color: col, fill: i ? ACCBG : PANEL, s: pop(u, 1.6 + i * 0.3) }));
      tx(725, 280, '빈 Vec이라 None (Option<&i32>도 8 바이트)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { // turbofish
      const s = E(u, 0.9, 1.9);
      spans(40, 130, [['"42".parse', {}], ['::<i32>', { fill: ACC, 'font-weight': 800, 'text-decoration': 'underline', opacity: fade(u, 0.3) }], ['().unwrap()', {}]], { 'font-size': 22, 'font-weight': 700 });
      tx(40, 170, '::<> 모양이 물고기 같아 turbofish라 부른다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      // "42" 문자 두 칸 → i32 칸 하나
      ["'4'", "'2'"].forEach((ch, i) => card(lerp(140 + i * 70, 330, s), 270, 60, 48, { rx: 6, text: ch, fs: 16, mono: true, stroke: INK, op: 1 - s }));
      tx(175, 320, '문자열 2바이트', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: 1 - s });
      grow(420, 270, 560, 270, seg(u, 1.2, 1.8), ACC);
      card(680, 270, 180, 60, { rx: 8, text: '42', fs: 24, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.8) });
      mono(680, 324, 'i32', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) }); return; }
    // k4: where 절
    const s = E(u, 0.5, 1.6);
    tx(40, 100, '바운드를 꺾쇠 안에', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    spans(40, 130, [['fn dump<T', {}], [': std::fmt::Debug', { fill: ACC, 'font-weight': 800 }], ['>(a: T)', {}]], { 'font-size': 19, 'font-weight': 700, opacity: 1 - 0.6 * s });
    tx(40, 186, 'where 절로 뺐을 때', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) });
    mono(40, 216, 'fn dump<T>(a: T)', { 'font-size': 19, 'font-weight': 700, opacity: fade(u, 0.6) });
    spans(lerp(400, 80, s), 248, [['where T: std::fmt::Debug', { fill: ACC, 'font-weight': 800 }]], { 'font-size': 19, opacity: s });
    mono(40, 290, '{ println!("{:?}", a); }', { 'font-size': 17, fill: MUT });
    tx(40, 330, '뜻은 같고, 첫 줄은 이름과 인자만 남는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    tx(40, 356, '바운드가 여럿일수록 where 쪽이 읽기 쉽다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); }

  // ---------- 6. 실무 함정 ----------
  const BLOAT = ['u8', 'u16', 'u32', 'u64', 'u128', 'i8', 'i16', 'i32', 'i64', 'f64'];
  function s6(t, c) { const { k, u } = c;
    if (k === 0) {
      mono(40, 70, 'fn add<T>(a: T, b: T) -> T { a + b }', { 'font-size': 19, 'font-weight': 700 });
      diag(40, 120, 880, [['error[E0369]: cannot add `T` to `T`', BAD, 700], ['help: consider restricting type parameter `T` with trait `Add`', INK], ['fn add<T: std::ops::Add<Output = T>>(a: T, b: T) -> T', GOOD, 700]], { show: (i) => fade(u, 0.4 + i * 0.5) });
      tx(40, 250, '+도 능력이다. Add를 요구해야 쓸 수 있다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(40, 278, 'Output = T까지 적어야 a + b의 결과가 T가 된다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
      tx(40, 302, '(T: Add만 쓰면 E0308 mismatched types)', { 'font-size': 14, fill: MUT, class: 'mono', opacity: fade(u, 2.2) }); return; }
    if (k === 1) { // 코드 팽창: 10 타입 → 10벌
      mono(40, 50, 'add::<T>를 10가지 타입으로 부르면', { 'font-size': 16, 'font-weight': 700 });
      const n = Math.round(lerp(0, 10, E(u, 0.2, 2.0)));
      BLOAT.forEach((ty, i) => { if (i >= n) return; const x = 40 + (i % 5) * 180, y = 80 + Math.floor(i / 5) * 70;
        card(x + 80, y + 26, 166, 48, { rx: 8, text: `add::<${ty}>`, fs: 15, mono: true, stroke: WARN, fill: WARNBG, s: pop(u, 0.2 + i * 0.18, 0.4) }); });
      mono(40, 260, `LLVM IR의 add 정의: ${n}개`, { 'font-size': 18, 'font-weight': 800, fill: WARN });
      R.hbar(40, 285, 600, n, 10, { h: 20, col: WARN, text: `${n} / 10` });
      tx(40, 350, '함수 본문이 클수록 한 벌 값이 커진다. 바이너리와 컴파일 시간이 함께 는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2 || k === 3) { const fix = k === 3;
      mono(40, 70, fix ? 'let parsed = "10".parse::<u32>();' : 'let parsed = "10".parse();', { 'font-size': 19, 'font-weight': 700, fill: fix ? GOOD : INK });
      const cands = ['i32', 'u32', 'f64', 'u8', 'bool'], cx = 480, cy = 210;
      card(cx, cy, 110, 64, { rx: 10, text: fix ? 'u32' : '?', fs: 28, mono: true, stroke: fix ? GOOD : BAD, fill: fix ? GOODBG : BADBG, color: fix ? GOOD : BAD, s: fix ? pop(u, 1.2) : 1 + bump(u, 0.4) });
      cands.forEach((s, i) => { const a = (i / cands.length) * Math.PI * 2 + (fix ? 0 : t * 0.4), r = 150, g = fix ? E(u, 0.3, 1.1) : 0;
        const x = cx + Math.cos(a) * r * (1 - g), y = cy + Math.sin(a) * r * 0.62 * (1 - g);
        if (fix && s === 'u32') return; tchip(x, y, s, fix ? MUT : INK, 1, { op: fix ? 1 - g : fade(u, 0.2 + i * 0.12) }); });
      if (!fix) diag(40, 330, 880, [['error[E0284]: type annotations needed for `Result<_, _>`', BAD, 700], ['help: consider giving `parsed` an explicit type', INK]], { show: (i) => fade(u, 1.2 + i * 0.4) });
      else { pill(480, 300, 'Ok(10)', GOOD, pop(u, 1.6), { mono: true, fs: 16 }); tx(480, 350, '좌변에 let parsed: Result<u32, _> 라고 적어도 된다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); }
      if (!fix) tx(700, 110, 'parse는 반환 타입에 따라 하는 일이 다르다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      return; }
    // k4: 언제 접을까
    tx(480, 50, '다룰 타입 수로 고른다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    el('line', { x1: 80, y1: 130, x2: 80 + 800 * E(u, 0.2, 1.0), y2: 130, stroke: MUT, 'stroke-width': 2.5 });
    ['1', '2~3', '여러 개', '모르는 타입까지'].forEach((s, i) => { const x = 110 + i * 240; el('circle', { cx: x, cy: 130, r: 6, fill: i < 2 ? INFO : ACC, opacity: fade(u, 0.4 + i * 0.2) }); tx(x, 160, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.2) }); });
    card(230, 270, 330, 110, { rx: 12, stroke: INFO, fill: INFOBG, text: '구체 타입 함수\nlargest_i32처럼 단순하게', fs: 15, s: pop(u, 1.2) });
    card(710, 270, 330, 110, { rx: 12, stroke: ACC, fill: ACCBG, text: '제네릭 + 바운드\n라이브러리·공용 코드', fs: 15, s: pop(u, 1.6) }); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'largest_i32와 largest_char를 따로 두면 생기는 문제는 무엇인가?',
      o: ['char 비교가 i32보다 느려진다', '버그 하나를 고칠 때 복사본마다 같은 수정을 해야 한다', '컴파일러가 두 함수 중 하나를 지운다'], a: 1,
      why: '두 함수는 본문 6줄이 똑같고 타입만 다르다. 알고리즘은 하나인데 고칠 곳은 함수 수만큼 생긴다.' },
    { q: 'fn largest<T>(list: &[T])에서 if item > largest가 E0369로 막히는 이유는 무엇인가?',
      o: ['T가 무엇이든 될 수 있어 > 비교가 된다는 보장이 없다', '&list[0]이 빈 리스트에서 터질 수 있다', 'T라는 이름이 이미 표준 라이브러리에 있다'], a: 0,
      why: '제약이 없는 T에 대해 컴파일러가 아는 연산은 없다. rustc도 PartialOrd로 T를 제한하라고 알려 준다.' },
    { q: 'T: PartialOrd 바운드가 걸린 largest에 PartialOrd가 없는 Cfg 리스트를 넘기면 어떻게 되는가?',
      o: ['실행 중에 panic이 난다', '비교를 건너뛰고 첫 값을 돌려준다', '호출하는 줄에서 E0277 컴파일 에러가 난다'], a: 2,
      why: '바운드는 호출 지점에서 검사된다. Cfg는 구현표에 PartialOrd가 없어 can\'t compare `Cfg` with `Cfg`로 막힌다.' },
    { q: 'largest를 i32와 char로 부르면 컴파일 결과물에는 무엇이 남는가?',
      o: ['T를 실행 중에 확인하는 함수 하나', 'largest::<i32>와 largest::<char> 두 함수', 'vtable 하나와 함수 포인터 두 개'], a: 1,
      why: '모노모픽화로 쓰인 타입마다 구체 함수를 따로 만든다. LLVM IR에도 largest 정의가 두 개 있다.' },
    { q: '"42".parse::<i32>()에서 ::<i32>가 하는 일은 무엇인가?',
      o: ['문자열을 i32 크기로 자른다', 'parse의 결과 타입을 i32로 정해 준다', '실패하면 0을 돌려주게 한다'], a: 1,
      why: 'parse는 결과 타입에 따라 동작이 갈린다. turbofish ::<i32>로 그 타입을 직접 알려 주면 42가 나온다.' },
    { q: '제네릭 add를 10가지 타입으로 호출했을 때 생기는 비용은 무엇인가?',
      o: ['add 함수가 10벌 생겨 바이너리와 컴파일 시간이 는다', '호출할 때마다 타입을 검사해 느려진다', 'add가 한 벌뿐이라 비용이 없다'], a: 0,
      why: '모노모픽화는 타입마다 복제한다. 실제로 10개 타입으로 부르면 LLVM IR에 add 정의가 10개 생긴다.' },
  ];

  const summary = [
    '타입만 다른 함수를 복사해 두면 버그 하나를 복사본 수만큼 고쳐야 한다.',
    '<T>로 타입 자리를 비우면 한 벌로 합쳐지지만, 바운드가 없으면 >도 쓸 수 없다.',
    'T: PartialOrd처럼 능력을 요구하면 구현한 타입만 호출 지점에서 통과한다.',
    '컴파일러가 쓰인 타입마다 함수를 찍어 내므로 실행 비용은 없고 바이너리는 커질 수 있다.',
  ];
  const review = [
    { q: '제네릭 함수에서 a + b가 E0369로 막혔다. 고칠 곳은 어디인가?',
      o: ['함수 본문의 + 를 add() 호출로 바꾼다', '시그니처에 T: Add<Output = T> 바운드를 단다', '호출하는 쪽에서 as i32로 바꿔 넘긴다'], a: 1,
      why: '제약 없는 T에는 + 능력이 없다. Add를 요구하고 Output = T까지 적어야 결과 타입도 T로 맞는다.' },
    { q: '내가 만든 Cfg 리스트로 largest를 부르자 E0277이 났다. 가장 간단한 해결은?',
      o: ['largest의 바운드를 지운다', 'largest를 Cfg 전용으로 하나 더 복사한다', 'Cfg에 #[derive(PartialOrd)]를 붙여 구현표를 채운다'], a: 2,
      why: '바운드는 그대로 두고 Cfg가 계약을 지키게 하면 된다. rustc도 derive(PartialOrd)를 붙이라고 제안한다.' },
    { q: '제네릭으로 바꾼 뒤 실행 속도가 손으로 복제한 판과 같은 이유는?',
      o: ['컴파일러가 타입마다 구체 함수를 만들어 바로 호출하기 때문이다', '제네릭 함수는 항상 인라인되기 때문이다', '실행 중 타입 검사가 아주 빠르기 때문이다'], a: 0,
      why: 'largest::<i32>, largest::<char>가 따로 생기고 호출은 그 함수로 곧장 간다. 실행 중에 타입을 고르는 일이 없다.' },
  ];

  R.page({ title: '제네릭 · 바운드 · 모노모픽화', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
