/* IV-1-1 Option — null 의 부재 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 값의 유무를 "상자"로 그린다: Some = 값이 든 상자(초록), None = 빈 점선 상자.
 * 출력·에러 문구는 rustc 1.100 으로 실제 컴파일·실행해 확인한 것이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const RK = /^(fn|let|mut|match|if|else|while|for|in|loop|return|impl|enum|struct|use|pub|Some|None|Ok|Err|Self|self|as|ref|dyn|type|trait)$/;
  function rtok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, RK.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // 러스트 코드 한 줄 (색칠). o.anchor 'middle' 이면 가운데 기준
  function rs(x, y, s, o) { o = o || {}; const fs = o.fs || 15, x0 = o.anchor === 'middle' ? x - tw(s, fs) / 2 : x;
    return R.spans(x0, y, rtok(s), { 'font-size': fs, opacity: o.op ?? 1, 'font-weight': o.fw || 600 }); }
  // 값 상자. kind: some | none | ok | err. val 은 안에 든 값(빈 상자면 null)
  function parcel(cx, cy, w, h, kind, val, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1; if (s <= 0.01 || op <= 0.01) return;
    const g = R.G(cx, cy, s, op), on = kind === 'some' || kind === 'ok', col = o.col || (on ? GOOD : kind === 'err' ? BAD : MUT);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || (on ? GOODBG : kind === 'err' ? BADBG : PANEL), stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': kind === 'none' ? '6 5' : null }, g);
    const tag = o.tag ?? ({ some: 'Some', none: 'None', ok: 'Ok', err: 'Err' })[kind], tg = tw(tag, 14) + 16;
    el('rect', { x: -w / 2 + 8, y: -h / 2 - 13, width: tg, height: 24, rx: 6, fill: kind === 'none' ? PANEL : col, stroke: col, 'stroke-width': 2 }, g);
    tx(-w / 2 + 8 + tg / 2, -h / 2 + 4, tag, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, class: 'mono', fill: kind === 'none' ? MUT : PANEL }, g);
    if (val != null && val !== '') tx(0, 6 + (o.dy || 0), val, { 'text-anchor': 'middle', 'font-size': o.fs || 16, 'font-weight': 700, class: 'mono', fill: o.vcol || INK }, g);
    return g; }
  // 컴파일러·실행 출력 판. lines: [글, 색], shown: 보이는 줄 수(소수면 마지막 줄을 타이핑)
  function out(x, y, w, head, lines, shown, o) { o = o || {}; const lh = o.lh || 23, h = 36 + lines.length * lh, col = o.col || BAD, op = o.op ?? 1; if (op <= 0.01) return;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    el('rect', { x, y, width: w, height: 26, rx: 8, fill: col, opacity: op }); el('rect', { x, y: y + 16, width: w, height: 10, fill: col, opacity: op });
    mono(x + 12, y + 18, head, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: op });
    lines.forEach(([s, c], i) => { if (i >= Math.ceil(shown)) return; const part = i === Math.ceil(shown) - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s;
      mono(x + 14, y + 48 + i * lh, part, { 'font-size': o.fs || 14, 'font-weight': 600, fill: c || INK, opacity: op }); });
    return { x, y, w, h }; }
  const typed = (u, a, b, n) => clamp((u - a) / (b - a)) * n;   // a~b 초 동안 n 줄을 친다
  // 단계 칩 줄 (콤비네이터 위치 표시)
  function chips(names, cur, y, op) { const ws = names.map((n) => tw(n, 14) + 24), gap = 12, total = ws.reduce((a, b) => a + b, 0) + gap * (names.length - 1); let x = 480 - total / 2;
    names.forEach((n, i) => { const on = i === cur, past = i < cur;
      card(x + ws[i] / 2, y, ws[i], 28, { rx: 14, text: n, fs: 14, mono: true, fw: 700, stroke: on ? ACC : GRID, color: on ? ACC : past ? INK : MUT, fill: on ? ACCBG : PANEL, sw: on ? 2.4 : 1.5, op });
      x += ws[i] + gap; }); }

  // ---------- 1. Option 은 타입이다 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      rs(480, 66, 'enum Option<T> { Some(T), None }', { anchor: 'middle', fs: 19, op: fade(u, 0.1) });
      const sp = E(u, 0.5, 1.4);
      grow(430, 84, lerp(430, 320, sp), lerp(84, 150, sp), sp, GOOD, { plain: sp < 1 }); grow(530, 84, lerp(530, 640, sp), lerp(84, 150, sp), sp, MUT, { plain: sp < 1 });
      parcel(300, 200, 170, 76, 'some', 'T', { s: pop(u, 1.1), fs: 22 });
      parcel(660, 200, 170, 76, 'none', null, { s: pop(u, 1.4) });
      sub(300, 268, '값 T 가 든 상자', fade(u, 1.5), { 'font-size': 15 }); sub(660, 268, '비어 있는 상자', fade(u, 1.7), { 'font-size': 15 });
      const no = fade(u, 2.0);
      mono(410, 350, 'null', { 'font-size': 22, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: no, 'text-decoration': 'line-through' });
      cross(410, 343, 14, pop(u, 2.1));
      tx(450, 356, '이라는 값은 Rust 에 없다', { 'font-size': 16, 'font-weight': 700, opacity: no });
      return; }
    if (k === 1) {
      const sig = 'fn find_user(id: u32) -> Option<String>', fs = 18, x0 = 480 - tw(sig, fs) / 2, rx = x0 + tw('fn find_user(id: u32) -> ', fs), rw = tw('Option<String>', fs);
      el('rect', { x: rx - 6, y: 44, width: (rw + 12) * E(u, 0.3, 0.9), height: 32, rx: 6, fill: R.C.HL, opacity: 0.8 });
      rs(x0, 66, sig, { fs });
      const b = E(u, 0.8, 1.6), mx = rx + rw / 2;
      grow(mx - 20, 82, lerp(mx - 20, 330, b), lerp(82, 160, b), b, GOOD, { plain: b < 1 }); grow(mx + 20, 82, lerp(mx + 20, 650, b), lerp(82, 160, b), b, MUT, { plain: b < 1 });
      parcel(330, 205, 200, 70, 'some', 'String', { s: pop(u, 1.4) }); parcel(650, 205, 200, 70, 'none', null, { s: pop(u, 1.6) });
      sub(330, 268, '찾았다', fade(u, 1.7), { 'font-size': 15 }); sub(650, 268, '못 찾았다', fade(u, 1.8), { 'font-size': 15 });
      tx(480, 330, '두 결과가 반환 타입에 다 적혀 있다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
      tx(480, 370, '다른 언어의 -> String 은 null 이 올 수 있어도 타입에 안 보인다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) });
      return; }
    if (k === 2 || k === 3) { // if id == 1 갈림길
      const some = k === 2, id = some ? '1' : '99';
      pill(110, 200, `id = ${id}`, INK, pop(u, 0.2), { mono: true, fs: 16 });
      const dm = [[330, 160], [390, 200], [330, 240], [270, 200]];
      el('path', { d: 'M' + dm.map((p) => p.join(',')).join(' L') + ' Z', fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: fade(u, 0.3) });
      mono(330, 205, 'id == 1', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      el('line', { x1: 160, y1: 200, x2: 268, y2: 200, stroke: GRID, 'stroke-width': 2.5 });
      el('path', { d: 'M390,200 L470,200 L470,120 L560,120', fill: 'none', stroke: some ? GOOD : GRID, 'stroke-width': 2.5 });
      el('path', { d: 'M330,240 L330,300 L560,300', fill: 'none', stroke: some ? GRID : MUT, 'stroke-width': 2.5, 'stroke-dasharray': some ? null : '6 5' });
      mono(478, 108, '참', { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); mono(342, 288, '거짓 (else)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const route = some ? [[160, 200], [270, 200], [390, 200], [470, 200], [470, 120], [560, 120]] : [[160, 200], [270, 200], [330, 240], [330, 300], [560, 300]];
      dot(route, seg(u, 0.4, 1.3), some ? GOOD : MUT, 7);
      if (some) { const f = seg(u, 1.3, 2.0);
        parcel(680, 120, 200, 70, 'some', f >= 1 ? '"Alice"' : '', { s: pop(u, 1.1) });
        if (f > 0 && f < 1) R.fly(680, 30, 680, 120, f, 'String::from("Alice")', { mono: true });
        parcel(680, 300, 200, 70, 'none', null, { op: 0.35 }); mono(680, 352, '아직 평가 안 함', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
        tx(680, 186, '값을 상자에 담아 돌려준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) });
      } else {
        parcel(680, 120, 200, 70, 'some', '"Alice"', { op: 0.35 });
        parcel(680, 300, 200, 70, 'none', null, { s: pop(u, 1.3) });
        tx(680, 366, '빈 상자도 정상적인 값이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
        sub(680, 392, '예외도 에러도 아니다', fade(u, 2.2), { 'font-size': 14 });
      }
      return; }
    if (k === 4) {
      [['found', 'find_user(1)', 'some', '"Alice"', 130, 0.2], ['missing', 'find_user(99)', 'none', null, 280, 0.8]].forEach(([n, call, kind, v, y, at]) => {
        rs(60, y + 6, `let ${n} = ${call};`, { fs: 16, op: fade(u, at) });
        grow(360, y, 470, y, seg(u, at + 0.3, at + 0.7), MUT);
        parcel(580, y, 190, 66, kind, v, { s: pop(u, at + 0.6) }); });
      const b = fade(u, 1.8);
      el('path', { d: 'M700,110 Q730,110 730,140 L730,195 Q730,205 745,205 Q730,205 730,215 L730,270 Q730,300 700,300', fill: 'none', stroke: INFO, 'stroke-width': 2.4, opacity: b });
      mono(760, 200, 'Option<String>', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: b });
      tx(760, 226, '타입은 같고 내용만 다르다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) });
      return; }
    // k5: 열지 않고 쓰면 컴파일 에러 — 실행 전에 막힌다
    rs(480, 44, 'println!("{}", found);', { anchor: 'middle', fs: 17, op: fade(u, 0.1) });
    const x0 = 140, xc = 340, xr = 760;
    tx(x0 - 10, 108, 'Rust', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: GOOD }); tx(x0 - 10, 318, 'Java 등', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: MUT });
    [['컴파일', xc], ['실행', xr]].forEach(([s, x]) => { el('line', { x1: x, y1: 70, x2: x, y2: 400, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' }); sub(x, 84, s, 1, { 'font-weight': 700 }); });
    const a = E(u, 0.3, 0.9); el('line', { x1: x0, y1: 103, x2: lerp(x0, xc - 8, a), y2: 103, stroke: GOOD, 'stroke-width': 4 });
    if (a >= 1) { el('rect', { x: xc - 8, y: 86, width: 10, height: 34, rx: 2, fill: BAD }); }
    out(xc + 20, 116, 560, 'rustc', [['error[E0277]: `Option<String>` doesn\'t', BAD], ['  implement `std::fmt::Display`', BAD], ['= note: you may be able to use `{:?}`', MUT]], typed(u, 0.9, 1.7, 3));
    const b = E(u, 1.6, 2.4); el('line', { x1: x0, y1: 318, x2: lerp(x0, xr, b), y2: 318, stroke: MUT, 'stroke-width': 4 });
    if (b >= 1) { const s = pop(u, 2.4); el('circle', { cx: xr, cy: 318, r: 18 * s, fill: BADBG, stroke: BAD, 'stroke-width': 2.5 }); cross(xr, 318, 8, s);
      mono(xr - 30, 360, 'NullPointerException', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: s }); }
    sub(xc + 210, 348, '사용자 앞에서 터진다', fade(u, 2.5), { 'font-size': 14.5 });
  }

  // ---------- 2. match · if let · while let ----------
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) {
      const nonePath = k === 1;
      rs(380, 40, 'match name {', { fs: 16 });
      // 갈래 두 칸
      card(470, 130, 230, 58, { rx: 10, stroke: GOOD, sw: 2.4, fill: GOODBG });
      rs(372, 136, 'Some(n) =>', { fs: 16 });
      const noneReady = k === 1 ? pop(u, 0.2) : 0;
      card(470, 280, 230, 58, { rx: 10, stroke: k === 1 ? MUT : BAD, sw: 2.4, dash: '7 5', fill: PANEL });
      if (k === 0) { mono(470, 287, '갈래 없음', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); }
      else rs(372, 286, 'None =>', { fs: 16, op: noneReady });
      el('path', { d: 'M180,205 L260,205 L300,130 L352,130', fill: 'none', stroke: GRID, 'stroke-width': 2.5 });
      el('path', { d: 'M260,205 L300,280 L352,280', fill: 'none', stroke: GRID, 'stroke-width': 2.5 });
      if (!nonePath) { // Some("Alice") 가 Some 갈래로
        const m = E(u, 0.2, 1.1); parcel(lerp(110, 300, m), lerp(205, 130, Math.max(0, m * 2 - 1)), 140, 60, 'some', '"Alice"', { fs: 15, op: 1 - fade(u, 1.1, 0.3) });
        const o = seg(u, 1.2, 1.8); if (o > 0) { pill(670, 130, 'n = "Alice"', GOOD, pop(u, 1.2), { mono: true, fs: 15 }); grow(586, 130, 600, 130, o, GOOD); }
        mono(810, 136, '"Hello, Alice"', { 'font-size': 15, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        out(560, 318, 380, 'rustc', [['error[E0004]: non-exhaustive', BAD], ['  patterns: `None` not covered', BAD]], typed(u, 1.9, 2.6, 2));
      } else {
        parcel(110, 205, 140, 60, 'none', null, { op: 1 - fade(u, 1.1, 0.3), s: 1 });
        dot([[180, 205], [260, 205], [300, 280], [352, 280]], seg(u, 0.5, 1.3), MUT, 7);
        mono(810, 136, '"Hello, Alice"', { 'font-size': 15, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: 0.45 });
        mono(780, 287, '"Hello, stranger"', { 'font-size': 15, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
        grow(586, 280, 680, 280, seg(u, 1.3, 1.6), MUT);
        check(160, 360, 13, pop(u, 1.9)); tx(185, 366, '두 갈래가 다 덮여야 컴파일된다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
      }
      return; }
    if (k === 2) {
      rs(60, 50, 'let config: Option<u16> = Some(8080);', { fs: 16, op: fade(u, 0.1) });
      parcel(130, 200, 150, 64, 'some', '8080', { s: pop(u, 0.2) });
      // 문 하나
      el('rect', { x: 340, y: 150, width: 24, height: 100, rx: 4, fill: GOOD, opacity: fade(u, 0.4) });
      rs(250, 132, 'if let Some(port) = config', { fs: 15, op: fade(u, 0.4) });
      el('path', { d: 'M205,200 L340,200', stroke: GOOD, 'stroke-width': 2.5 }); el('path', { d: 'M364,200 L520,200', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.6) });
      dot([[205, 200], [520, 200]], seg(u, 0.7, 1.5), GOOD, 7);
      card(680, 200, 300, 70, { rx: 10, stroke: GOOD, sw: 2.2, s: pop(u, 1.4) });
      mono(680, 196, 'port = 8080', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(680, 220, '포트 8080 로 시작', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      el('path', { d: 'M130,236 L130,330 L860,330', fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 2.0) });
      tx(480, 360, 'None 이었다면 블록을 건너뛰고 조용히 지나간다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) });
      return; }
    // k3: while let — 빌 때까지
    rs(60, 44, 'while let Some(top) = stack.pop() {', { fs: 16 });
    const T = [0.3, 0.9, 1.5], left = (x) => 3 - T.filter((a) => u > a).length;
    const n = left();
    tx(110, 100, 'stack', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle' });
    el('path', { d: 'M60,110 L60,330 L160,330 L160,110', fill: 'none', stroke: INK, 'stroke-width': 2.5 });
    [1, 2, 3].forEach((v, i) => { if (i >= n) return; card(110, 304 - i * 56, 80, 46, { rx: 6, text: String(v), fs: 18, mono: true, fw: 800 }); });
    T.forEach((a, i) => { const v = 3 - i, f = seg(u, a, a + 0.5), y = 200 + i * 64;
      if (f > 0 && f < 1) R.fly(110, 192 + i * 56, 420, y, f, `Some(${v})`, { fill: GOOD });
      if (f >= 1) { parcel(420, y, 120, 46, 'some', String(v), { fs: 17 }); mono(560, y + 6, `pop ${v}`, { 'font-size': 16, 'font-weight': 700 }); } });
    const nf = seg(u, 2.1, 2.5);
    if (nf > 0) { parcel(420, 140, 120, 46, 'none', null, { s: pop(u, 2.1) }); }
    if (nf >= 1) { card(700, 140, 170, 46, { rx: 23, text: '반복 종료', fs: 16, stroke: BAD, color: BAD, fill: BADBG }); grow(484, 140, 612, 140, 1, BAD); }
    tx(560, 112, '빈 상자가 곧 멈춤 신호', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) });
  }

  // ---------- 3. 콤비네이터 ----------
  const OPS = ['map', 'and_then', 'unwrap_or', 'filter', 'ok_or'];
  function lane(y, inKind, inVal, op, outDraw, u, at, o) { o = o || {};
    parcel(130, y, 150, 60, inKind, inVal, { fs: 17, op: o.op });
    const g = E(u, at, at + 0.5); grow(208, y, lerp(208, 300, g), y, g, MUT, { plain: true });
    const opW = tw(op, 15) + 30; card(300 + opW / 2, y, opW, 44, { rx: 8, text: op, fs: 15, mono: true, fw: 700, stroke: o.opCol || ACC, color: o.opCol || ACC, fill: PANEL, op: o.op ?? fade(u, at) });
    const g2 = seg(u, at + 0.5, at + 0.9); grow(300 + opW + 4, y, 690, y, g2, MUT);
    if (u > at + 0.9) outDraw(); }
  function s3(t, c) { const { k, u } = c;
    chips(OPS, k - 1, 398, k === 0 ? fade(u, 1.0) : 1);
    if (k === 0) { rs(60, 48, 'let price: Option<u32> = Some(1200);', { fs: 17, op: fade(u, 0.1) });
      parcel(480, 200, 200, 80, 'some', '1200', { s: pop(u, 0.4), fs: 22 });
      tx(480, 280, '상자를 받아 상자를 돌려준다 — 중간에 열지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(480, 340, '아래 다섯 메서드가 모두 이 상자 하나에서 출발한다', fade(u, 1.8), { 'font-size': 15 });
      return; }
    const lbl2 = (y, s, col, op) => tx(30, y - 50, s, { 'font-size': 14.5, 'font-weight': 700, fill: col || MUT, opacity: op ?? 1 });
    if (k === 1) {
      lbl2(140, 'price = Some(1200)', INK);
      lane(140, 'some', u < 1.2 ? '1200' : String(Math.round(tween(1200, 1320, u - 1.2, 0.8))), '.map(|p| p * 110 / 100)', () => parcel(780, 140, 150, 60, 'some', '1320', { fs: 17, s: pop(u, 1.3) }), u, 0.2);
      lbl2(290, 'None 이었다면');
      lane(290, 'none', null, '.map(...)', () => parcel(780, 290, 150, 60, 'none', null, { s: pop(u, 1.9) }), u, 1.2, { opCol: MUT });
      tx(860, 340, '건드리지 않고 흘려보낸다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.3) });
      return; }
    if (k === 2) {
      lbl2(140, 'and_then — Option 을 돌려주는 함수', INK);
      lane(140, 'some', '1200', '.and_then(|p| Some(p / 2))', () => parcel(790, 140, 150, 60, 'some', '600', { fs: 17, s: pop(u, 1.3) }), u, 0.2);
      lbl2(290, 'map 이었다면 — 상자 속 상자', WARN);
      lane(290, 'some', '1200', '.map(|p| Some(p / 2))', () => { parcel(800, 290, 200, 78, 'some', '', { s: pop(u, 1.9) }); parcel(810, 296, 120, 44, 'some', '600', { s: pop(u, 2.1), fs: 15 }); }, u, 1.2, { opCol: WARN });
      mono(800, 360, 'Some(Some(600))', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.3) });
      return; }
    if (k === 3) {
      lbl2(140, 'display — Some 이면 안의 값', INK);
      lane(140, 'some', '1200', '.unwrap_or(0)', () => { card(780, 140, 110, 52, { rx: 8, text: '1200', fs: 20, mono: true, fw: 800, stroke: INK, s: pop(u, 1.3) }); }, u, 0.2);
      lbl2(290, 'backup — None 이면 준비한 기본값', INK);
      lane(290, 'none', null, '.unwrap_or_else(expensive_default)', () => { card(800, 290, 110, 52, { rx: 8, text: '500', fs: 20, mono: true, fw: 800, stroke: WARN, color: WARN, s: pop(u, 1.9) }); }, u, 1.2, { opCol: WARN });
      tx(940, 360, '여기서 처음 상자가 열린다 — 결과는 맨 값 u32', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.3) });
      return; }
    if (k === 4) {
      lbl2(160, 'cheap = price.filter(|&p| p < 1000)', INK);
      parcel(130, 160, 150, 60, 'some', '1200', { fs: 17 });
      grow(208, 160, 330, 160, E(u, 0.2, 0.6), MUT);
      // 저울: 1200 < 1000 ?
      card(450, 160, 220, 70, { rx: 10, stroke: ACC, sw: 2.2, s: pop(u, 0.5) });
      mono(450, 154, '1200 < 1000 ?', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      mono(450, 180, 'false', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      grow(564, 160, 690, 160, seg(u, 1.2, 1.5), MUT);
      const d = seg(u, 1.6, 2.4);
      parcel(780, 160, 150, 60, d > 0.3 ? 'none' : 'some', d > 0 ? null : '1200', { fs: 17, s: pop(u, 1.4) });
      if (d > 0) mono(780, 166 + d * 140, '1200', { 'font-size': 17, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: 1 - d });
      tx(480, 360, '조건을 어기면 Some 이 None 으로 떨어진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) });
      return; }
    // k5 ok_or
    lbl2(140, 'Some(1200)', INK);
    lane(140, 'some', '1200', '.ok_or("가격 없음")', () => parcel(790, 140, 160, 60, 'ok', '1200', { fs: 17, s: pop(u, 1.3) }), u, 0.2);
    lbl2(290, 'None 이었다면');
    lane(290, 'none', null, '.ok_or("가격 없음")', () => parcel(810, 290, 200, 60, 'err', '"가격 없음"', { fs: 15, s: pop(u, 1.9) }), u, 1.2, { opCol: MUT });
    mono(940, 360, 'Option<u32>  →  Result<u32, &str>', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 2.3) });
  }

  // ---------- 4. ? 와 체이닝 ----------
  // 왼쪽: User 안의 두 겹 상자
  function nest(o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: 30, y: 70, width: 330, height: 300, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2.2, opacity: op * (o.a ?? 1) });
    mono(46, 94, o.title || 'u: User', { 'font-size': 15, 'font-weight': 800, opacity: op * (o.a ?? 1) });
    const pk = o.profileNone ? 'none' : 'some';
    if ((o.b ?? 1) > 0) { parcel(195, 225, 290, 220, pk, null, { tag: o.profileNone ? 'None' : 'Some(Profile)', s: o.b ?? 1, op, fill: o.lens1 ? INFOBG : null });
      mono(200, 142, 'profile', { 'font-size': 14, fill: MUT, opacity: op * (o.b ?? 1) }); }
    if (!o.profileNone && (o.c ?? 1) > 0) { const ck = o.cityNone ? 'none' : 'some';
      parcel(195, 250, 220, 100, ck, o.cityNone ? null : '"seoul"', { tag: o.cityNone ? 'None' : 'Some(String)', s: o.c ?? 1, op, fs: 18, fill: o.lens2 ? INFOBG : null });
      mono(226, 226, 'city', { 'font-size': 14, fill: MUT, opacity: op * (o.c ?? 1) }); } }
  function gate(x, y, line, u, at, o) { o = o || {};
    rs(x, y, line, { fs: 15, op: fade(u, at) });
    const qx = x + tw(line.slice(0, line.lastIndexOf('?')), 15) + 4.5; el('circle', { cx: qx, cy: y - 5, r: 15 * pop(u, at + 0.3), fill: 'none', stroke: WARN, 'stroke-width': 2.4 });
    return qx; }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { nest({ a: fade(u, 0.1), b: pop(u, 0.6), c: pop(u, 1.2) });
      const x = 420; mono(x, 140, 'struct User    { profile: Option<Profile> }', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(x, 175, 'struct Profile { city: Option<String> }', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(x, 260, 'city 에 닿으려면 상자를 두 번 열어야 한다', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
      sub(x + 200, 300, 'match 로 열면 두 겹으로 중첩된다', fade(u, 2.2), { 'font-size': 15 });
      return; }
    if (k === 1 || k === 2) {
      nest({ lens1: true, lens2: k === 2 });
      const x = 410;
      const q1 = gate(x, 90, 'let profile = user.profile.as_ref()?;', u, k === 1 ? 0.2 : -1);
      if (k === 1) {
        grow(q1, 108, q1, 170, seg(u, 0.9, 1.4), GOOD); pill(q1, 196, 'Some → &Profile', GOOD, pop(u, 1.4), { mono: true, fs: 14 });
        grow(q1 + 18, 85, 900, 85, seg(u, 1.4, 1.9), BAD);
        tx(905, 62, 'None → 함수가 None 반환', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.9) });
        out(410, 268, 530, 'as_ref 를 빼면', [['error[E0507]: cannot move out of', BAD], ['  `user.profile` (shared reference)', BAD]], typed(u, 2.0, 2.6, 2), { col: WARN });
        return; }
      grow(q1, 108, q1, 130, 1, GOOD);
      const q2 = gate(x, 160, 'let city = profile.city.as_ref()?;', u, 0.2);
      grow(q2, 178, q2, 236, seg(u, 0.9, 1.3), GOOD); pill(q2, 258, 'Some → &String', GOOD, pop(u, 1.3), { mono: true, fs: 14 });
      grow(q2 + 18, 160, 900, 160, seg(u, 1.0, 1.4), BAD); tx(905, 194, 'None → None 반환', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      rs(x, 320, 'Some(city.to_uppercase())', { fs: 15, op: fade(u, 1.6) });
      parcel(800, 314, 170, 56, 'some', '"SEOUL"', { s: pop(u, 2.0), fs: 16 });
      tx(480, 404, '중첩 match 두 겹이 ? 두 번으로 납작해졌다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) });
      return; }
    if (k === 3) {
      nest({});
      mono(420, 90, 'let u = User {', { 'font-size': 15, 'font-weight': 700 });
      mono(440, 116, 'profile: Some(Profile { city: Some("seoul".into()) }),', { 'font-size': 14, 'font-weight': 600, opacity: fade(u, 0.4) });
      mono(420, 142, '};', { 'font-size': 15, 'font-weight': 700 });
      const gx = [520, 700], y = 250;
      el('line', { x1: 420, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 3 });
      gx.forEach((x, i) => { el('rect', { x: x - 12, y: y - 30, width: 24, height: 60, rx: 4, fill: u > 1.0 + i * 0.6 ? GOOD : WARN, opacity: fade(u, 0.6) }); mono(x, y - 40, i ? 'city?' : 'profile?', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); });
      dot([[420, y], [900, y]], seg(u, 0.8, 2.2), GOOD, 8);
      pill(830, y + 56, 'Some("SEOUL")', GOOD, pop(u, 2.2), { mono: true, fs: 15 });
      tx(650, 380, '두 겹이 모두 Some 이라 ? 두 번이 다 통과한다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.3) });
      return; }
    if (k === 4) {
      const steps = [['u.profile.as_ref()', 'Some(&Profile)'], ['.and_then(|p| p.city.as_ref())', 'Some(&String)'], ['.map(|c| c.to_uppercase())', 'Some("SEOUL")']];
      steps.forEach(([s, r], i) => { const y = 90 + i * 100, at = 0.2 + i * 0.6;
        rs(60, y + 6, s, { fs: 16, op: fade(u, at) });
        grow(470, y, 600, y, seg(u, at + 0.2, at + 0.5), MUT);
        parcel(730, y, 230, 54, 'some', r.slice(5, -1), { s: pop(u, at + 0.4), fs: 15, tag: 'Some' });
        if (i < 2) grow(730, y + 34, 730, y + 64, seg(u, at + 0.5, at + 0.7), MUT, { plain: true }); });
      tx(60, 380, '중간은 Option 을 돌려주니 and_then, 마지막은 값을 돌려주니 map', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    // k5: 결과 — 세 사용자
    const rows = [['u (profile·city 모두 Some)', 'Some("SEOUL")', GOOD], ['profile 이 None', 'None', MUT], ['city 가 None', 'None', MUT]];
    tx(60, 60, 'city_of(&user) 결과 · 실행 출력', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.1) });
    rows.forEach(([who, r, col], i) => { const y = 120 + i * 80, at = 0.3 + i * 0.6;
      tx(60, y + 6, who, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, at) });
      grow(330, y, 520, y, seg(u, at + 0.1, at + 0.4), col === GOOD ? GOOD : MUT);
      parcel(650, y, 200, 54, col === GOOD ? 'some' : 'none', col === GOOD ? '"SEOUL"' : null, { s: pop(u, at + 0.4), fs: 16 });
      if (i) tx(790, y + 6, '? 가 즉시 반환', { 'font-size': 14.5, fill: MUT, opacity: fade(u, at + 0.5) }); });
    sub(480, 380, '체이닝 버전도 같은 값을 낸다 — 첫 번째 줄 Some("SEOUL") 두 번', fade(u, 2.3), { 'font-size': 15 });
  }

  // ---------- 5. 실무 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { rs(480, 60, 'let input: Option<i32> = None;', { anchor: 'middle', fs: 18, op: fade(u, 0.1) });
      parcel(480, 190, 180, 84, 'none', null, { s: pop(u, 0.4) });
      [['함정 1', 'unwrap 남발', 200], ['함정 2', '장황한 match', 480], ['함정 3', '상자 속 상자', 760]].forEach(([a, b, x], i) => {
        card(x, 330, 200, 64, { rx: 10, text: a + '\n' + b, fs: 15, stroke: WARN, s: pop(u, 1.0 + i * 0.3) });
        grow(480, 236, lerp(480, x, 0.9), 296, seg(u, 0.9 + i * 0.3, 1.3 + i * 0.3), GRID, { plain: true }); });
      return; }
    if (k === 1) { rs(60, 54, 'let x = input.unwrap();', { fs: 18 });
      const bl = seg(u, 0.6, 1.2);
      if (bl < 0.4) parcel(200, 180, 160, 76, 'none', null, { s: 1 + R.bump(u, 0.3) * 2 });
      else for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, d = 20 + bl * 70;
        el('rect', { x: 200 + Math.cos(a) * d - 9, y: 180 + Math.sin(a) * d - 6, width: 18, height: 12, rx: 2, fill: BAD, opacity: 1 - bl * 0.5, transform: `rotate(${i * 40} ${200 + Math.cos(a) * d} ${180 + Math.sin(a) * d})` }); }
      out(380, 100, 560, 'stderr · 실행 결과', [["thread 'main' panicked at …", INK], ['called `Option::unwrap()` on a', BAD], ['`None` value', BAD]], typed(u, 1.2, 2.2, 3));
      tx(480, 330, 'None 을 만나는 순간 프로세스가 죽는다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) });
      sub(480, 365, '에러 처리가 아니라 처리 포기다', fade(u, 2.4), { 'font-size': 15 });
      return; }
    const LINES = ['let v = match input {', '    Some(n) => n * 2,', '    None => 0,', '};'];
    if (k === 2) { const n = typed(u, 0.2, 1.4, 4);
      LINES.forEach((s, i) => { if (i < Math.ceil(n)) rs(80, 90 + i * 34, s, { fs: 17, op: clamp(n - i) }); });
      el('path', { d: 'M500,70 Q520,70 520,90 L520,120 Q520,135 535,135 Q520,135 520,150 L520,180 Q520,200 500,200', fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 1.5) });
      tx(550, 141, '값 하나 꺼내려고 네 줄', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      pill(240, 300, 'v = 0', INK, pop(u, 1.9), { mono: true, fs: 17 });
      sub(480, 370, '동작은 맞지만 읽는 비용이 크다', fade(u, 2.2), { 'font-size': 15 });
      return; }
    if (k === 3) { const sq = E(u, 0.2, 1.2);
      LINES.forEach((s, i) => { const y = lerp(90 + i * 34, 140, sq); rs(80, y, s, { fs: 17, op: 1 - sq }); });
      rs(80, 140, 'let v = input.map(|n| n * 2).unwrap_or(0);', { fs: 17, op: fade(u, 1.0) });
      pill(240, 230, 'v = 0', INK, pop(u, 1.4), { mono: true, fs: 17 });
      check(320, 230, 12, pop(u, 1.6)); tx(345, 236, '위 match 와 같은 값', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
      tx(480, 330, 'map 이 Some 갈래, unwrap_or 가 None 갈래를 맡는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
      return; }
    if (k === 4) { rs(60, 54, 'let nested: Option<Option<i32>> = Some(Some(5));', { fs: 16 });
      const f = E(u, 1.0, 2.0);
      parcel(lerp(250, 420, f), 200, lerp(240, 150, f), lerp(130, 64, f), 'some', '', { op: 1 - f });
      parcel(lerp(260, 420, f), 210, 150, 64, 'some', '5', { fs: 20 });
      if (f > 0 && f < 1) mono(480, 330, '.flatten()', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      if (f >= 1) { mono(620, 216, 'Some(5)', { 'font-size': 18, 'font-weight': 800, fill: GOOD }); tx(480, 330, '.flatten() 이 바깥 상자 한 겹을 벗겼다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 }); }
      sub(480, 380, 'and_then 자리에 map 을 쓰면 이렇게 겹친다', fade(u, 2.2), { 'font-size': 15 });
      return; }
    // k5: 원칙 — 두 갈래를 코드로
    parcel(140, 170, 150, 66, 'some', 'n', { fs: 18 }); parcel(140, 300, 150, 66, 'none', null, {});
    [[170, 'n 을 써서 계산', 0.3], [300, '기본값 · 에러 · 로그', 0.8]].forEach(([y, s, at]) => { grow(220, y, 380, y, seg(u, at, at + 0.4), GOOD);
      card(500, y, 220, 52, { rx: 10, text: s, fs: 15, stroke: GOOD, fill: GOODBG, s: pop(u, at + 0.3) }); check(632, y, 11, pop(u, at + 0.5)); });
    out(680, 120, 260, 'expect 의 panic', [['설정 없음', BAD]], typed(u, 1.5, 1.9, 1), { col: WARN });
    tx(810, 232, '죽어도 이유가 남는다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) });
    tx(480, 395, '두 갈래가 모두 코드에 있으면 깜빡한 null 이 생길 자리가 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) });
  }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'fn find_user(id: u32) -> Option<String>의 반환 타입이 호출자에게 알려 주는 것은 무엇인가?',
      o: ['함수가 실패하면 예외를 던진다', '결과가 문자열이 있는 Some이거나 비어 있는 None일 수 있다', '항상 String 하나를 돌려준다'], a: 1,
      why: 'Option<String>은 Some(String)과 None 두 경우를 타입에 적는다. 그래서 found를 String처럼 바로 출력하면 E0277로 컴파일이 막힌다.' },
    { q: 'match name { Some(n) => ... }처럼 None 갈래를 빼고 쓰면 어떻게 되는가?',
      o: ['None이 오면 실행 중에 panic한다', 'None일 때는 아무 일도 없이 지나간다', 'E0004 non-exhaustive patterns로 컴파일되지 않는다'], a: 2,
      why: 'match는 모든 경우를 덮어야 한다. 한 갈래만 보고 싶으면 None을 조용히 넘기는 if let을 쓴다.' },
    { q: 'price가 Some(1200)일 때 price.map(|p| Some(p / 2))의 결과는 무엇인가?',
      o: ['Some(Some(600))', 'Some(600)', '600'], a: 0,
      why: 'map은 클로저가 돌려준 값을 다시 상자에 담는다. 클로저가 Option을 돌려주면 두 겹이 되므로 이럴 때는 and_then을 쓴다.' },
    { q: 'city_of 안의 user.profile.as_ref()?에서 profile이 None이면 무엇이 일어나는가?',
      o: ['None을 빈 Profile로 바꿔 계속 진행한다', '함수가 그 자리에서 None을 돌려주고 끝난다', 'panic이 일어난다'], a: 1,
      why: '?는 Some이면 값을 꺼내 다음 줄로 가고 None이면 즉시 None을 반환한다. 실행해 보면 profile이 None인 사용자는 None이 나온다.' },
    { q: 'Option<i32> 값 input이 None일 때 input.unwrap()은 어떻게 되는가?',
      o: ['0을 돌려준다', '컴파일 에러가 난다', 'called `Option::unwrap()` on a `None` value로 panic한다'], a: 2,
      why: 'unwrap은 None이면 프로세스를 멈춘다. 기본값이 있으면 unwrap_or, 정말 확신하면 이유를 남기는 expect를 쓴다.' },
  ];

  const summary = [
    'Rust에는 null이 없다. 값이 없을 수 있으면 Option으로 감싸 Some 또는 None을 돌려준다.',
    'Option<String>을 String처럼 쓰면 E0277로 컴파일이 멈춘다. 상자를 먼저 열어야 한다.',
    'match는 Some과 None을 모두 적어야 하고, 한 갈래만 볼 때는 if let을 쓴다.',
    'map, and_then, unwrap_or, ?를 쓰면 match 없이 상자를 이어 처리하고, unwrap은 None에서 panic한다.',
  ];
  const review = [
    { q: '설정값 timeout: Option<u64>를 읽어 없으면 30을 쓰고 싶다. 가장 알맞은 코드는?',
      o: ['timeout.unwrap()', 'timeout.unwrap_or(30)', 'timeout.map(|t| 30)'], a: 1,
      why: 'unwrap_or는 Some이면 안의 값, None이면 기본값을 준다. unwrap은 None에서 panic하고, map은 None을 그대로 둔다.' },
    { q: 'user.profile.map(|p| p.city)를 했더니 Option<Option<String>>이 나왔다. 먼저 바꿀 것은?',
      o: ['map을 and_then으로 바꾼다', 'unwrap을 두 번 붙인다', 'Profile의 city를 String으로 바꿔 None을 없앤다'], a: 0,
      why: '클로저가 Option을 돌려주면 map은 두 겹을 만든다. and_then을 쓰거나 이미 겹쳤다면 flatten으로 한 겹을 벗긴다.' },
    { q: '배포한 서버가 설정 파일 없이 시작되자 panicked: called `Option::unwrap()` on a `None` value로 죽었다. 고칠 방향으로 가장 알맞은 것은?',
      o: ['unwrap을 그대로 두고 설정 파일만 다시 넣는다', 'Option을 없애고 빈 문자열로 초기화한다', 'None 갈래를 코드로 처리하고, 죽어야 한다면 expect로 이유를 남긴다'], a: 2,
      why: 'unwrap은 None에서 이유 없이 죽는다. 기본값이나 에러로 None 갈래를 처리하고, 정말 계속할 수 없을 때만 expect에 기대한 내용을 적는다.' },
  ];

  R.page({ title: 'Option — 값의 유무를 상자로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
