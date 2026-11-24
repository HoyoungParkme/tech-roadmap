/* I-1-2 타입 시스템 — 값 vs 참조 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono: monoRaw, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, terminal, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 한글이 섞인 글은 고정폭 글꼴에서 자간이 벌어지므로 보통 글꼴로 쓴다
  const mono = (x, y, s, a, p) => (/[가-힣]/.test(String(s)) ? tx(x, y, s, Object.assign({ style: 'white-space:pre' }, a || {}), p) : monoRaw(x, y, s, a, p));
  // 스택 칸: 이름 + 값 칸들(값 타입) 또는 화살표 시작점(참조 타입)
  function vslot(x, y, name, vals, o) { o = o || {}; const s = o.s ?? 1, cw = o.cw || 52;
    mono(x, y + 25, name, { 'font-size': 15, 'font-weight': 700, opacity: s, fill: o.ncol || INK });
    const x0 = x + (o.nw || 62);
    vals.forEach((v, i) => { const st = (o.style && o.style(i)) || {};
      card(x0 + i * (cw + 4) + cw / 2, y + 20, cw, 36, { rx: 6, text: v == null ? '' : String(v), fs: 15, mono: true, stroke: st.stroke || INFO, fill: st.fill || INFOBG, color: st.color || INK, s: st.s ?? s }); });
    return x0 + vals.length * (cw + 4); }
  function rslot(x, y, name, o) { o = o || {}; const s = o.s ?? 1;
    mono(x, y + 25, name, { 'font-size': 15, 'font-weight': 700, opacity: s });
    const x0 = x + (o.nw || 62); el('rect', { x: x0, y: y + 2, width: 56, height: 36, rx: 6, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: s });
    if (o.empty) { mono(x0 + 28, y + 25, o.empty, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); return null; }
    el('circle', { cx: x0 + 28, cy: y + 20, r: 5, fill: o.stroke || INK, opacity: s }); return [x0 + 28, y + 20]; }
  // 힙 객체: 머리 + 필드 줄
  function hobj(x, y, w, title, rows, o) { o = o || {}; const rh = 26, h = 32 + rows.length * rh, s = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 9, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, opacity: s, 'stroke-dasharray': o.dash });
    tx(x + 12, y + 21, title, { 'font-size': 14, 'font-weight': 800, fill: o.stroke || INK, opacity: s });
    rows.forEach((r, i) => { const [k, v, hot] = Array.isArray(r) ? r : [r, null];
      mono(x + 14, y + 46 + i * rh, k, { 'font-size': 14, fill: MUT, opacity: s });
      if (v != null) mono(x + w - 14, y + 46 + i * rh, v, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: hot ? BAD : INK, opacity: s }); });
    return { x, y, w, h, l: [x, y + h / 2] }; }
  // 참조 화살표: 점에서 시작해 u 만큼 자란다 (꺾인 곡선)
  function arrow(a, b, u, col, o) { if (!a || u <= 0) return; o = o || {}; const [x1, y1] = a, [x2, y2] = b, mx = (x1 + x2) / 2 + (o.bend || 0);
    const n = 24, pts = []; for (let i = 0; i <= Math.ceil(n * clamp(u)); i++) { const t = Math.min(i / n, u), q = 1 - t;
      pts.push([q * q * q * x1 + 3 * q * q * t * mx + 3 * q * t * t * mx + t * t * t * x2, q * q * q * y1 + 3 * q * q * t * y1 + 3 * q * t * t * y2 + t * t * t * y2]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, 'marker-end': u >= 0.98 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null, opacity: o.op ?? 1 }); }
  function zones(o) { o = o || {}; zone(30, o.y || 160, o.sw || 370, 405 - (o.y || 160), o.st || '스택', { fill: SOFT }); zone(o.hx || 440, o.y || 160, 930 - (o.hx || 440), 405 - (o.y || 160), o.ht || '힙 (GC 가 관리)', { fill: SOFT }); }
  const out = (x, y, w, lines, shown) => terminal(x, y, w, 30 + lines.length * 22 + 14, lines.map((l) => [l, 'var(--term)']), Math.max(0.001, shown), { title: 'console', fs: 14 });

  // ================= 장면 1. 두 부족: 스택과 힙 =================
  function blueprints(k, u) {
    const a = k === 0 ? pop(u, 0.2) : 1;
    card(220, 82, 360, 92, { rx: 10, stroke: INFO, sw: 2, dash: '6 4', s: a });
    tx(56, 58, 'struct Point', { 'font-size': 15, 'font-weight': 800, fill: INFO, class: 'mono', opacity: a });
    [['X', 'int'], ['Y', 'int']].forEach(([n, t], i) => { const g = k === 0 ? E(u, 0.6 + i * 0.35, 1.0 + i * 0.35) : 1;
      el('rect', { x: 60 + i * 124, y: 72, width: 118 * g, height: 34, rx: 5, fill: INFOBG, stroke: INFO, 'stroke-width': 1.6 });
      if (g > 0.6) mono(72 + i * 124, 95, n + ' · 4B', { 'font-size': 14, 'font-weight': 700 }); });
    mono(312, 95, '= 8바이트', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: k === 0 ? fade(u, 1.6) : 1 });
    if (k === 0) sub(220, 150, '값 자체가 변수 자리에 들어간다', fade(u, 2.0), { 'font-size': 14, fill: INK });
    if (k < 1) return;
    const b = k === 1 ? pop(u, 0.2) : 1;
    card(720, 82, 380, 92, { rx: 10, stroke: ACC, sw: 2, dash: '6 4', s: b });
    tx(544, 58, 'class Person', { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono', opacity: b });
    mono(560, 92, 'Name: string', { 'font-size': 14, opacity: k === 1 ? fade(u, 0.7) : 1 }); mono(560, 116, 'Age: int', { 'font-size': 14, opacity: k === 1 ? fade(u, 0.9) : 1 });
    tx(890, 104, 'new 하면 힙에', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 1.3) : 1 });
    if (k === 1) sub(720, 150, '변수에는 객체 주소만 담긴다', fade(u, 1.8), { 'font-size': 14, fill: INK }); }
  function s1(t, c) { const { k, u } = c;
    blueprints(k, u);
    zones({ y: 170 });
    if (k <= 1) { sub(215, 300, '(아직 변수 없음)', 1); sub(685, 300, '(아직 객체 없음)', 1); return; }
    // Main 프레임
    const fh = k === 2 ? E(u, 0.2, 1.2) : 1;
    el('rect', { x: 46, y: 200, width: 338, height: 190 * fh, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    if (fh > 0.3) tx(58, 222, 'Main 프레임', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k === 2) { sub(215, 310, '지역 변수가 들어올 자리', fade(u, 1.2), { 'font-size': 14 }); sub(215, 334, '메서드가 끝나면 프레임째 사라진다', fade(u, 1.6), { 'font-size': 14 }); sub(685, 300, '(비어 있음)', 1); return; }
    // p: 값이 통째로
    vslot(64, 240, 'p', [k === 3 ? (u > 0.6 ? 1 : '') : 1, k === 3 ? (u > 1.0 ? 2 : '') : 2], { style: (i) => ({ s: k === 3 ? pop(u, 0.4 + i * 0.4) : 1 }) });
    if (k === 3) { pill(250, 340, '힙 할당 없음', GOOD, pop(u, 1.6), { fs: 14 }); sub(685, 300, '(비어 있음)', 1); return; }
    // q: 주소만, 객체는 힙에
    const a = rslot(64, 300, 'q', { s: pop(u, 0.2) });
    const O = hobj(500, 230, 220, 'Person  obj#1', [['Name', '●'], ['Age', '30']], { op: fade(u, 0.5) });
    hobj(770, 300, 130, 'String', [['"Kim"', null]], { op: fade(u, 1.1) });
    arrow([700, 270], [770, 330], seg(u, 1.1, 1.6), MUT, { sw: 2 });
    arrow(a, [498, 270], E(u, 0.6, 1.4), INK);
    sub(215, 372, 'q 에는 주소만', fade(u, 1.6), { 'font-size': 14, fill: INK, 'font-weight': 700 });
    sub(685, 395, 'Name 도 string 이라 또 다른 힙 객체를 가리킨다', fade(u, 2.0), { 'font-size': 13.5 });
  }

  // ================= 장면 2. 대입: 복제 vs 공유 =================
  function s2(t, c) { const { k, u } = c;
    zone(30, 40, 410, 365, 'struct  b = a', { fill: SOFT, color: INFO });
    zone(470, 40, 460, 365, 'class  b2 = a2', { fill: SOFT, color: ACC });
    // 왼쪽: 값 복제
    vslot(60, 80, 'a', [1, 2], { style: (i) => (k === 1 && i === 0 ? { stroke: GOOD, fill: GOODBG } : {}) });
    const copy = k === 0 ? E(u, 0.3, 1.2) : 1, bx = k === 0 ? (u < 1.6 ? 1 : u < 2.0 ? '' : 99) : 99;
    if (k === 0 && copy < 1) { fly(150, 136, 150, 170, copy, '1', { fill: INFO, mono: true }); fly(206, 136, 206, 170, copy, '2', { fill: INFO, mono: true }); }
    if (copy >= 1) vslot(60, 150, 'b', [bx, 2], { style: (i) => (i === 0 && (k > 0 || u > 1.6) ? { stroke: BAD, fill: BADBG } : {}) });
    if (k === 0) sub(235, 250, 'X·Y 가 통째로 복사된다', fade(u, 1.0), { 'font-size': 14, fill: INK });
    if (k >= 1) { out(60, 250, 360, ['a.X → 1', 'b.X → 99'], k === 1 ? 2 * seg(u, 0.3, 1.2) : 2);
      if (k === 1) pill(235, 380, '서로 남남', GOOD, pop(u, 1.5), { fs: 14 }); }
    if (k < 2) { sub(700, 230, '(곧 실행)', 1); return; }
    // 오른쪽: 참조 공유
    const a2 = rslot(490, 80, 'a2'); const b2 = rslot(490, 150, 'b2', { s: k === 2 ? pop(u, 0.2) : 1 });
    const age = k === 2 ? (u < 1.4 ? '30' : '99') : '99';
    const O = hobj(700, 76, 200, 'Person  obj#1', [['Name', '"Kim"'], ['Age', age, k === 2 ? u > 1.4 : k === 3]], { stroke: k === 4 ? GOOD : INK });
    arrow(a2, [698, 110], 1, INK);
    if (k === 2) { if (u < 0.9) fly(600, 100, 600, 170, seg(u, 0.3, 0.9), '주소', { fill: INK }); arrow(b2, [698, 130], seg(u, 0.9, 1.3), INK); }
    else arrow(b2, [698, 130], 1, k >= 3 ? (k === 4 ? GOOD : BAD) : INK);
    if (k === 3) { arrow(a2, [698, 110], 1, BAD); out(490, 250, 420, ['a2.Age → 99   (고친 적 없는데)', 'b2.Age → 99'], 2 * seg(u, 0.3, 1.2)); pill(700, 386, '같은 객체 하나', BAD, pop(u, 1.6), { fs: 14 }); }
    if (k === 4) { arrow(a2, [698, 110], 1, GOOD); card(700, 280, 340, 50, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 0.5) });
      mono(545, 286, 'ReferenceEquals(a2, b2)', { 'font-size': 14.5, opacity: fade(u, 0.7) }); mono(860, 286, 'True', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      sub(700, 340, '복사된 것은 주소뿐이었다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 5) { const cS = rslot(490, 250, 'c', { s: pop(u, 0.2) });
      hobj(700, 236, 200, 'Person  obj#2', [['Name', '"Kim"'], ['Age', u < 1.5 ? '99' : '7', u >= 1.5]], { op: fade(u, 0.3), stroke: ACC });
      arrow(cS, [698, 270], E(u, 0.6, 1.2), ACC);
      sub(700, 385, 'c.Age = 7 · a2.Age 는 99 그대로', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
  }

  // ================= 장면 3. 인자 전달 =================
  // 호출 스택: 아래 Main, 위 호출된 메서드
  function frame(y, h, name, col, s) { el('rect', { x: 40, y, width: 400, height: h, rx: 9, fill: PANEL, stroke: col || INK, 'stroke-width': 2, opacity: s ?? 1 }); tx(54, y + 22, name, { 'font-size': 14, 'font-weight': 800, fill: col || MUT, opacity: s ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    zone(26, 40, 428, 365, '호출 스택 (위로 쌓인다)', { fill: SOFT });
    frame(250, 140, 'Main', MUT);
    if (k === 0) { vslot(70, 300, 'x', [u < 2.2 ? 10 : 10], { style: () => (u > 2.2 ? { stroke: GOOD, fill: GOODBG } : {}) });
      const on = 1 - seg(u, 2.0, 2.4);
      if (on > 0) { frame(90, 120, 'AddOne(int n)', INFO, on);
        if (u > 0.9) vslot(70, 140, 'n', [u < 1.5 ? 10 : 11], { s: on, style: () => (u > 1.5 ? { stroke: BAD, fill: BADBG, s: on } : { s: on }) });
        if (u < 0.9) fly(160, 282, 160, 160, seg(u, 0.3, 0.9), '10 복사', { fill: INFO }); }
      out(500, 120, 400, ['x → 10'], seg(u, 2.3, 2.6) * 1.0 || 0);
      tx(700, 280, '사본을 고쳐도 원본은 그대로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) });
      sub(700, 310, '프레임이 끝나면 n 도 사라진다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 1 || k === 2) { const sw = k === 2 ? E(u, 0.3, 1.3) : 0;
      const pv = k === 2 && sw >= 1 ? 2 : 1, qv = k === 2 && sw >= 1 ? 1 : 2;
      vslot(70, 296, 'p', [pv], { style: () => (k === 2 && sw >= 1 ? { stroke: GOOD, fill: GOODBG } : {}) }); vslot(250, 296, 'q', [qv], { style: () => (k === 2 && sw >= 1 ? { stroke: GOOD, fill: GOODBG } : {}) });
      frame(90, 120, 'Swap(ref int a, ref int b)', ACC, k === 1 ? fade(u, 0.2) : 1);
      const A = rslot(70, 140, 'a', { stroke: ACC, s: k === 1 ? fade(u, 0.4) : 1 }), B = rslot(250, 140, 'b', { stroke: ACC, s: k === 1 ? fade(u, 0.4) : 1 });
      arrow(A, [158, 300], k === 1 ? E(u, 0.7, 1.4) : 1, ACC, { bend: -20 }); arrow(B, [338, 300], k === 1 ? E(u, 0.9, 1.6) : 1, ACC, { bend: -20 });
      if (k === 1) { tx(700, 200, 'ref = 변수 자리 자체를 넘긴다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
        sub(700, 232, '호출부에도 Swap(ref p, ref q) 로 적는다', fade(u, 1.9), { 'font-size': 14 }); }
      if (k === 2) { if (sw > 0 && sw < 1) { fly(158, 268, 338, 268, sw, '1', { fill: ACC, mono: true }); fly(338, 268, 158, 268, sw, '2', { fill: ACC, mono: true }); }
        out(500, 120, 400, ['$"{p},{q}" → 2,1'], seg(u, 1.6, 2.1));
        sub(700, 260, '호출 전에 p, q 는 값이 있어야 한다 (초기화 필수)', fade(u, 1.9), { 'font-size': 14 }); }
      return; }
    if (k === 3) { const w = seg(u, 1.0, 1.6);
      vslot(70, 296, 'parsed', [w >= 1 ? 42 : '?'], { nw: 78, style: () => (w >= 1 ? { stroke: GOOD, fill: GOODBG } : { stroke: GRID, fill: PANEL, color: MUT }) });
      frame(90, 120, 'int.TryParse(string s, out int result)', GOOD, fade(u, 0.2));
      mono(70, 160, 's = "42"', { 'font-size': 14.5, opacity: fade(u, 0.3) });
      const A = rslot(250, 140, 'result', { stroke: GOOD, s: fade(u, 0.4), nw: 70 });
      arrow(A, [178, 300], E(u, 0.5, 1.0), GOOD, { bend: -20 });
      if (w > 0 && w < 1) fly(348, 160, 178, 316, w, '42', { fill: GOOD, mono: true });
      pill(700, 160, '반환값 true = 성공 여부', GOOD, pop(u, 1.7), { fs: 14 });
      tx(700, 230, 'out = 메서드가 반드시 채워 돌려준다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) });
      sub(700, 262, '호출 전에 비어 있어도 된다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k4, k5: in
    vslot(70, 296, 'big', [3, 4], { nw: 52 });
    mono(194, 286, 'X', { 'font-size': 13.5, fill: MUT }); mono(250, 286, 'Y', { 'font-size': 13.5, fill: MUT });
    frame(90, 120, 'LenSq(in Point v)', INFO, k === 4 ? fade(u, 0.2) : 1);
    const A = rslot(70, 140, 'v', { stroke: INFO, s: k === 4 ? fade(u, 0.4) : 1 });
    arrow(A, [180, 300], k === 4 ? E(u, 0.6, 1.3) : 1, INFO, { bend: -20 });
    lock(190, 220, true, INFO, k === 4 ? pop(u, 1.3) : 1);
    if (k === 4) { tx(700, 170, 'in = 읽기 전용 참조', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) });
      sub(700, 202, '복사 없이 원본을 읽고, 안에서 수정은 막힌다', fade(u, 1.5), { 'font-size': 14.5, fill: INK });
      pill(700, 260, 'struct 통째 복사 0번', GOOD, pop(u, 1.9), { fs: 14 });
      sub(700, 310, '작은 int 에는 오히려 손해, 큰 struct 일 때 쓴다', fade(u, 2.2), { 'font-size': 14 }); return; }
    const sq = [['3 × 3', 9], ['4 × 4', 16]];
    sq.forEach(([a, v], i) => { const s = pop(u, 0.3 + i * 0.4); card(640 + i * 160, 160, 130, 50, { rx: 8, stroke: INFO, sw: 2, s, text: a + ' = ' + v, fs: 15, mono: true }); });
    tx(720, 230, '+', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, opacity: fade(u, 1.0) });
    card(720, 270, 150, 50, { rx: 8, stroke: GOOD, sw: 2.5, s: pop(u, 1.2), text: '25', fs: 20, mono: true, color: GOOD });
    out(560, 320, 340, ['LenSq(in big) → 25'], seg(u, 1.8, 2.4));
  }

  // ================= 장면 4. 박싱 =================
  function s4(t, c) { const { k, u } = c;
    zones({ y: 40, sw: 330, hx: 400, ht: '힙' });
    if (k >= 4) { // 컬렉션 1000개
      const arr = k === 4;
      tx(60, 90, arr ? 'ArrayList old' : 'List<int> fast', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: arr ? BAD : GOOD });
      mono(60, 118, 'for i in 0..999: Add(i)', { 'font-size': 14, fill: MUT });
      const n = Math.round(lerp(0, 1000, E(u, 0.2, 2.0)));
      if (arr) { // object[] + 상자 1000개
        hobj(420, 70, 230, 'object[] (참조 칸)', [], { stroke: MUT });
        for (let i = 0; i < 10; i++) el('rect', { x: 432 + i * 21, y: 110, width: 17, height: 17, rx: 2, fill: i < n / 100 ? INK : SOFT });
        const shown = Math.min(120, Math.round(n * 0.12));
        for (let i = 0; i < shown; i++) { const cx = 680 + (i % 12) * 20, cy = 80 + Math.floor(i / 12) * 22; el('rect', { x: cx, y: cy, width: 15, height: 15, rx: 3, fill: WARN, opacity: 0.85 }); }
        sub(800, 320, '상자 하나에 int 하나 (그림은 일부만)', fade(u, 1.0), { 'font-size': 13.5 });
        card(160, 220, 230, 70, { rx: 10, stroke: BAD, sw: 2 }); mono(60, 210, '박싱 횟수', { 'font-size': 14, fill: MUT });
        mono(60, 240, n.toLocaleString('en-US'), { 'font-size': 22, 'font-weight': 800, fill: BAD });
        card(560, 360, 300, 56, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 2.0) });
        mono(560, 356, '40,624 B 할당', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
        sub(560, 378, '.NET 10 에서 잰 값', fade(u, 2.1));
        sub(180, 330, '루프 안 박싱 = GC 가 치울 쓰레기', fade(u, 2.2), { 'font-size': 14, fill: INK }); return; }
      hobj(420, 70, 490, 'int[] (값이 칸에 바로)', [], { stroke: GOOD });
      const vals = [0, 1, 2, 3, 4, 5, 6, 7, '…', 999];
      vals.forEach((v, i) => { const on = i < 9 ? n > i : n >= 1000;
        card(456 + i * 47, 120, 40, 30, { rx: 4, text: on ? String(v) : '', fs: 13.5, mono: true, stroke: GOOD, fill: on ? GOODBG : PANEL }); });
      card(160, 220, 230, 70, { rx: 10, stroke: GOOD, sw: 2 }); mono(60, 210, '박싱 횟수', { 'font-size': 14, fill: MUT });
      mono(60, 240, '0', { 'font-size': 22, 'font-weight': 800, fill: GOOD });
      // 두 막대 비교
      const ax = 430, mx = 470; tx(ax, 250, '할당 바이트 (.NET 10 에서 잰 값)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      [['ArrayList', 40624, BAD], ['List<int>', 8424, GOOD]].forEach(([nm, v, col], i) => { const y = 272 + i * 52, g = E(u, 1.5 + i * 0.3, 2.3 + i * 0.3);
        mono(ax, y + 16, nm, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.5) });
        el('rect', { x: ax + 100, y, width: Math.max(2, 300 * v / 40624 * g), height: 24, rx: 4, fill: col });
        mono(ax + 108 + 300 * v / 40624 * g, y + 17, v.toLocaleString('en-US') + ' B', { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 2.2) }); });
      return; }
    const n = vslot(60, 80, 'n', [42]);
    if (k === 0) { pill(180, 180, '힙 할당 0', GOOD, pop(u, 0.6), { fs: 14 }); sub(665, 220, '(비어 있음)', 1);
      sub(180, 230, '값 타입끼리 쓰는 동안 힙은 관여하지 않는다', fade(u, 1.2), { 'font-size': 13.5 }); return; }
    // 상자
    const bx = k === 1 ? seg(u, 0.9, 1.4) : 1;
    const o = rslot(60, 150, 'o', { s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1 && u < 1.4) fly(150, 100, 560, 150, seg(u, 0.4, 1.4), '42 복사', { fill: WARN });
    if (bx > 0) { hobj(480, 100, 200, k === 3 ? '상자 · Int32' : '상자 (object)', [['머리·타입', 'Int32'], ['값', '42']], { stroke: WARN, op: bx });
      arrow(o, [478, 150], k === 1 ? seg(u, 1.3, 1.7) : 1, WARN); }
    if (k === 1) { pill(580, 240, 'new 없이 힙 할당', WARN, pop(u, 1.8), { fs: 14 });
      sub(580, 290, '상자 하나 24바이트 (.NET 10 x64 에서 잰 값)', fade(u, 2.1), { 'font-size': 14, fill: INK }); return; }
    if (k === 2) { if (u < 1.3) fly(560, 160, 150, 240, seg(u, 0.3, 1.3), '42 복사', { fill: INFO });
      if (u >= 1.3) vslot(60, 220, 'back', [42], { nw: 62, style: () => ({ s: pop(u, 1.3) }) });
      sub(580, 260, '언박싱도 복사다. 상자는 그대로 남는다', fade(u, 1.6), { 'font-size': 14, fill: INK });
      sub(580, 286, '상자는 참조가 끊기면 GC 가 회수한다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k3 (long)o
    vslot(60, 220, 'back', [42], { nw: 62 });
    card(180, 320, 260, 44, { rx: 8, text: 'long bad = (long)o;', fs: 15, mono: true, stroke: INFO, s: pop(u, 0.2) });
    mono(520, 260, 'Int64?', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
    mono(600, 260, '≠ Int32', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) });
    pill(600, 320, 'InvalidCastException', BAD, pop(u, 1.4), { fs: 15, mono: true });
    sub(600, 360, '넣은 타입 그대로만 꺼낼 수 있다 (long 확대도 안 된다)', fade(u, 1.9), { 'font-size': 14, fill: INK });
  }

  // ================= 장면 5. 동등성 · nullable · 불변 =================
  function cmp(x, y, a, b, res, u0, u) { card(x, y, 360, 50, { rx: 10, stroke: res ? GOOD : BAD, sw: 2, s: pop(u, u0) });
    mono(x - 160, y + 6, a, { 'font-size': 15, opacity: fade(u, u0 + 0.1) }); mono(x + 160, y + 6, String(res ? 'True' : 'False'), { 'font-size': 16, 'font-weight': 800, fill: res ? GOOD : BAD, 'text-anchor': 'end', opacity: fade(u, u0 + 0.6) });
    if (b) sub(x, y + 46, b, fade(u, u0 + 0.8), { 'font-size': 14 }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { zones({ y: 40, sw: 300, hx: 380 });
      const A = rslot(56, 90, 'k1'), B = rslot(56, 160, 'k2');
      hobj(420, 70, 200, 'Person', [['Name', '"Kim"'], ['Age', '30']], { op: fade(u, 0.2) });
      hobj(680, 150, 200, 'Person', [['Name', '"Kim"'], ['Age', '30']], { op: fade(u, 0.4) });
      arrow(A, [418, 110], E(u, 0.3, 0.8)); arrow(B, [678, 190], E(u, 0.5, 1.0), INK, { bend: 40 });
      cmp(480, 320, 'k1 == k2', '내용은 같아도 객체가 둘, == 는 주소를 비교한다', false, 1.2, u); return; }
    if (k === 1) {
      cmp(480, 80, '1 == 1', '값 타입: 값을 비교', true, 0.2, u);
      const L = 'ab'.split(''); tx(480, 170, '"ab" == "a" + "b"', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.9) });
      L.forEach((ch, i) => { const s = pop(u, 1.1 + i * 0.3);
        cells(390 + i * 100, 196, [ch], { w: 50, h: 40, style: () => ({ s, stroke: ACC }) }); cells(390 + i * 100, 270, [ch], { w: 50, h: 40, style: () => ({ s, stroke: ACC }) });
        if (s > 0.5) mono(415 + i * 100, 258, '=', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); });
      pill(480, 350, 'string 은 참조 타입이지만 == 는 글자 내용을 비교한다 → True', GOOD, pop(u, 1.9), { fs: 14 });
      sub(480, 395, '직접 만든 struct 에는 == 가 없다 (CS0019). Equals 는 필드를 비교한다', fade(u, 2.3), { 'font-size': 13.5 }); return; }
    if (k === 2 || k === 3) {
      card(480, 70, 420, 50, { rx: 10, stroke: INFO, sw: 2, text: 'record struct Coord(int X, int Y);', fs: 16, mono: true, s: k === 2 ? pop(u, 0.2) : 1 });
      const gen = ['Equals', '==', '!=', 'GetHashCode', 'ToString'];
      gen.forEach((g, i) => pill(170 + i * 155, 140, g, INFO, k === 2 ? pop(u, 0.8 + i * 0.25) : 1, { fs: 14, mono: true }));
      if (k === 2) { sub(480, 190, '컴파일러가 대신 만든 멤버', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 });
        sub(480, 220, '값을 바꿀 수는 있다. 불변이 필요하면 readonly record struct', fade(u, 2.3), { 'font-size': 14 }); return; }
      vslot(250, 220, 'c1', [1, 2]); vslot(250, 290, 'c2', [1, 2]);
      [0, 1].forEach((i) => { const on = seg(u, 0.4 + i * 0.6, 0.8 + i * 0.6); if (on > 0) { el('line', { x1: 338 + i * 56, y1: 260, x2: 338 + i * 56, y2: 290, stroke: GOOD, 'stroke-width': 3, opacity: on }); check(338 + i * 56 + 18, 275, 8, on); } });
      card(680, 280, 220, 60, { rx: 10, stroke: GOOD, sw: 2.5, s: pop(u, 1.7) }); mono(600, 287, 'c1 == c2', { 'font-size': 15, opacity: fade(u, 1.8) }); mono(770, 287, 'True', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      sub(480, 380, '필드를 하나씩 비교한다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { tx(480, 70, 'int? maybe = null;', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      card(480, 160, 380, 100, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.4) }); tx(310, 128, 'Nullable<int> (값 타입)', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
      cells(340, 148, ['false', '—'], { w: 120, h: 40, gap: 20, style: (i) => ({ s: pop(u, 0.7 + i * 0.3), stroke: i ? GRID : WARN, color: i ? MUT : INK }) });
      sub(400, 206, 'HasValue', fade(u, 0.9)); sub(540, 206, 'Value', fade(u, 1.1));
      out(240, 260, 480, ['maybe.HasValue → False', 'maybe ?? -1 → -1'], 2 * seg(u, 1.3, 2.2));
      sub(480, 395, '.Value 를 바로 쓰지 말고 HasValue 나 ?? 로 받는다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k5 string 불변
    zones({ y: 40, sw: 300, hx: 380 });
    const S = rslot(56, 90, 's'); const U = rslot(56, 170, 'upper', { s: pop(u, 1.0), nw: 70 });
    hobj(440, 70, 160, 'String', [['"go"', null]], {});
    arrow(S, [438, 105], 1);
    const mk = seg(u, 0.4, 1.0); hobj(680, 160, 160, 'String (새것)', [['"GO"', null]], { op: mk, stroke: ACC });
    if (mk > 0 && mk < 1) fly(520, 120, 760, 180, mk, 'ToUpper()', { fill: ACC });
    arrow(U, [678, 195], seg(u, 1.1, 1.6), ACC);
    out(60, 280, 300, ['$"{s},{upper}" → go,GO'], seg(u, 1.8, 2.3));
    sub(640, 300, '"go" 는 그대로. 변형은 늘 새 문자열을 만든다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
  }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'Point p(struct)와 Person q(class)를 Main 안에서 만들면 스택의 두 변수 칸에는 각각 무엇이 들어가는가?',
      o: ['둘 다 힙 객체의 주소', 'p에는 X=1, Y=2 값 자체, q에는 힙 객체의 주소', 'p에는 주소, q에는 Name과 Age 값 자체'], a: 1,
      why: '값 타입은 값이 변수 자리에 그대로 들어간다. 참조 타입은 new가 힙에 객체를 만들고 변수에는 그 주소만 담는다.' },
    { q: 'Person b2 = a2; b2.Age = 99; 를 실행한 뒤 a2.Age는 얼마인가?',
      o: ['30', '99', '0'], a: 1,
      why: '대입으로 복사된 것은 주소뿐이라 a2와 b2가 같은 객체를 가리킨다. ReferenceEquals(a2, b2)도 True였다.' },
    { q: 'int.TryParse("42", out int parsed)에서 out의 역할은 무엇인가?',
      o: ['메서드가 parsed 칸에 결과를 반드시 채워 돌려준다', 'parsed를 읽기 전용으로 넘긴다', 'parsed를 복사해서 넘긴다'], a: 0,
      why: 'out은 결과를 밖으로 내보내는 통로다. 호출 전에는 비어 있어도 되고, 메서드가 42를 채우며 반환값은 성공 여부를 알린다.' },
    { q: 'object o = 42; 로 박싱한 값을 (long)o로 꺼내면 어떻게 되는가?',
      o: ['42L이 나온다', 'InvalidCastException이 난다', '0이 나온다'], a: 1,
      why: '상자는 넣을 때의 타입(Int32)을 기억한다. 언박싱은 그 타입 그대로만 되고, long으로의 확대 변환도 허용되지 않는다.' },
    { q: '내용이 같은 Person 객체 두 개를 == 로 비교하면 False가 나오는 이유는 무엇인가?',
      o: ['class의 기본 ==는 같은 객체인지(주소)를 비교해서', 'string 필드는 비교할 수 없어서', 'Age가 int라서'], a: 0,
      why: 'class의 기본 ==는 참조 동등이다. 필드 값으로 비교하고 싶으면 record나 record struct가 Equals와 ==를 만들어 준다.' },
  ];

  const summary = [
    '같은 대입 b = a도 struct면 값이 통째로 복사되고 class면 주소만 복사된다.',
    'class 변수 두 개가 한 객체를 가리키면 한쪽에서 고친 내용이 다른 쪽에도 보인다.',
    '인자도 기본은 복사이고 ref는 원본을, out은 결과를, in은 읽기 전용 참조를 넘긴다.',
    'int를 object에 담으면 힙에 24바이트 상자가 생기니 컬렉션은 List<int>처럼 제네릭을 쓴다.',
  ];
  const review = [
    { q: 'DTO 리스트를 다른 메서드에 넘겼더니 그 메서드가 고친 값이 원본 화면에도 반영됐다. 무엇을 의심해야 하나?',
      o: ['GC가 객체를 잘못 회수했다', '복사한 줄 알았던 것이 같은 객체의 주소였다', 'out 매개변수가 값을 덮어썼다'], a: 1,
      why: 'class 인자는 주소가 복사되어 넘어간다. 진짜 독립 사본이 필요하면 새 객체를 만들어 필드를 옮기는 명시적 복사를 한다.' },
    { q: '로그 루프에서 int를 ArrayList에 1,000번 넣는 코드가 느리다. 가장 효과적인 고침은?',
      o: ['List<int>로 바꿔 박싱을 없앤다', 'ref로 넘겨 복사를 줄인다', 'int?로 바꿔 null을 허용한다'], a: 0,
      why: 'ArrayList는 object로 받아 넣을 때마다 상자를 만든다. 직접 재 보니 ArrayList가 40,624바이트, List<int>가 8,424바이트를 할당했다.' },
    { q: 'record struct Coord로 만든 c1, c2가 둘 다 (1, 2)다. 다음 중 맞는 것은?',
      o: ['c1 == c2는 False다. 서로 다른 변수라서', 'c1 == c2는 True이고, 그래도 c1.X = 5처럼 값을 바꿀 수는 있다', 'c1 == c2는 True이고, 값은 절대 바꿀 수 없다'], a: 1,
      why: 'record struct는 필드를 비교하는 ==를 만들어 준다. 하지만 그대로는 값을 바꿀 수 있고, 불변이 필요하면 readonly record struct로 쓴다.' },
  ];

  R.page({ title: '스택과 힙 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
