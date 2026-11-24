/* IV-1-2 Stream API — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 정거장(filter·map·collect)을 지나는 원소, 세로로 내려가는 지연평가 격자, groupingBy가 채우는 HashMap 16칸,
 *       Spliterator 분할 나무와 병합, 같은 ArrayList 칸을 덮어쓰는 두 스레드, 순서에 따라 달라지는 변환 횟수. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 자바 코드 조각 ----------
  const JKW = /^(abstract|boolean|case|catch|class|default|double|else|extends|final|for|if|implements|import|instanceof|int|interface|long|new|null|permits|private|public|record|return|sealed|static|switch|this|throw|throws|try|var|void|yield|true|false)$/;
  function jtok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(@?\b\w+\b)/).forEach((w) => { if (w) out.push([w, JKW.test(w) ? { 'font-weight': 700, fill: INFO } : w[0] === '@' ? { 'font-weight': 700, fill: WARN } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if (ch === '/' && s[i + 1] === '/') { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // o.hl(i) → 'hl' | 'bad' | 'good' | 'dim', o.show = 보이는 줄 수(소수면 마지막 줄을 타이핑)
  function jcode(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + 30, h = lines.length * lh + 16, op = o.op ?? 1, show = o.show ?? lines.length;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': o.stroke ? 2 : 1.5, opacity: op });
    lines.forEach((s, i) => { if (i >= Math.ceil(show)) return; const part = i === Math.ceil(show) - 1 && show % 1 ? s.slice(0, Math.round(s.length * (show % 1))) : s;
      const st = o.hl ? o.hl(i) : null, ly = y + 8 + i * lh;
      if (st === 'hl' || st === 'bad' || st === 'good') el('rect', { x: x + 4, y: ly, width: w - 8, height: lh, rx: 4, fill: st === 'bad' ? BADBG : st === 'good' ? GOODBG : ACCBG, opacity: op });
      spans(x + 14, ly + lh / 2 + fs * 0.36, jtok(part), { 'font-size': fs, opacity: op * (st === 'dim' ? 0.35 : 1) }); });
    return { x, y, w, h, lh, cx: (col) => x + 14 + col * fs * 0.55, cy: (i) => y + 8 + i * lh + lh / 2 }; }
  // 참조 화살표 (구부러진 선이 자란다). 시작점에 점
  const MK = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function qp(x1, y1, x2, y2, b) { return [(x1 + x2) / 2 - (y2 - y1) * b, (y1 + y2) / 2 + (x2 - x1) * b]; }
  function arc(x1, y1, x2, y2, u, col, o) { o = o || {}; if (u <= 0) return; const [qx, qy] = qp(x1, y1, x2, y2, o.bend || 0);
    if (!o.nodot) el('circle', { cx: x1, cy: y1, r: 5, fill: col || INK, opacity: o.op ?? 1 });
    const a = { d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`, fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, opacity: o.op ?? 1, 'marker-end': u >= 0.98 ? MK(col) : null };
    if (u < 1) { a.pathLength = 1; a['stroke-dasharray'] = `${u} 1`; } else if (o.dash) a['stroke-dasharray'] = o.dash;
    el('path', a); }
  function along(x1, y1, x2, y2, b, f) { const [qx, qy] = qp(x1, y1, x2, y2, b), g = 1 - f; return [g * g * x1 + 2 * g * f * qx + f * f * x2, g * g * y1 + 2 * g * f * qy + f * f * y2]; }
  // 스택 프레임: rows [[이름, 값(null 이면 참조 점), {col, bg}]] → 값 칸 가운데 좌표
  function frame(x, y, w, title, rows, o) { o = o || {}; const rh = 42, h = 40 + rows.length * rh;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 });
    mono(x + 12, y + 24, title, { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    return rows.map(([n, v, ro], i) => { ro = ro || {}; const yy = y + 36 + i * rh, vx = x + w * 0.46, vw = w * 0.54 - 12, col = ro.col || INK;
      mono(x + 14, yy + rh / 2 + 5, n, { 'font-size': 15, 'font-weight': 700, fill: col });
      el('rect', { x: vx, y: yy + 5, width: vw, height: rh - 10, rx: 5, fill: ro.bg || SOFT, stroke: ro.col || GRID, 'stroke-width': 1.5 });
      if (v != null) mono(vx + vw / 2, yy + rh / 2 + 5, v, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col });
      else el('circle', { cx: vx + vw / 2, cy: yy + rh / 2, r: 5, fill: col });
      return { x: vx + vw / 2, y: yy + rh / 2, r: vx + vw }; }); }
  // 힙 객체: 머리(클래스) + 필드 줄
  function obj(cx, cy, w, head, rows, o) { o = o || {}; const h = 38 + rows.length * 26, col = o.stroke || INK;
    const g = card(cx, cy, w, h, { rx: 10, stroke: col, sw: 2.2, fill: o.fill || PANEL, s: o.s, op: o.op });
    mono(0, -h / 2 + 24, head, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    if (rows.length) el('line', { x1: -w / 2 + 8, y1: -h / 2 + 34, x2: w / 2 - 8, y2: -h / 2 + 34, stroke: GRID, 'stroke-width': 1.5 }, g);
    rows.forEach(([s, rc], i) => mono(-w / 2 + 14, -h / 2 + 56 + i * 26, s, { 'font-size': 14.5, fill: rc || INK }, g));
    return { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2, h }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const strike = (x, y, len, u, col) => { if (u > 0) el('line', { x1: x, y1: y, x2: x + len * clamp(u), y2: y, stroke: col || BAD, 'stroke-width': 2.4, 'stroke-linecap': 'round' }); };
  const heapZones = (sx, hx) => { zone(20, 34, sx - 30, 372, '스택', { fill: SOFT }); zone(sx, 34, hx - sx, 372, '힙', { fill: INFOBG }); };
  // 경로(점 배열) 위 f(0→1) 지점과 그 지점이 몇 번째 구간인지
  function posOn(route, f) { const segs = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1])), tot = segs.reduce((a, b) => a + b, 0);
    let d = clamp(f) * tot, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const q = segs[i] ? d / segs[i] : 0; return { x: lerp(route[i][0], route[i + 1][0], q), y: lerp(route[i][1], route[i + 1][1], q), i }; }
  const chip = (x, y, s, col, o) => { o = o || {}; return card(x, y, tw(s, 14) + 22, 30, { rx: 8, text: s, mono: true, fs: 14, fw: 700, fill: o.fill || PANEL, stroke: col || INK, color: col || INK, s: o.s, op: o.op }); };

  // ---------- 1. 파이프라인 ----------
  const ST1 = [{ cx: 120, w: 150, a: 'stream()', b: '', tag: '소스' }, { cx: 345, w: 230, a: 'filter', b: 'n -> n % 2 == 0', tag: '중간연산 · Stream 반환' },
    { cx: 585, w: 200, a: 'map', b: 'n -> n * 10', tag: '중간연산 · Stream 반환' }, { cx: 820, w: 200, a: 'collect', b: 'toList()', tag: '최종연산 · 값 반환' }];
  const PY = 226, NX = (i) => 63 + i * 52;
  function nums(op) { mono(40, 50, 'nums', { 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }); cells(40, 60, [1, 2, 3, 4, 5, 6], { w: 46, h: 40, gap: 6, style: () => ({ op: op ?? 1 }) }); }
  function stations(n, u, k, live) {
    for (let j = 0; j < n; j++) { const s = ST1[j], isNew = j === n - 1 && k === n - 1, sc = isNew ? pop(u, 0.2) : 1, col = j === 3 ? ACC : j === 0 ? INFO : INK;
      if (j > 0) el('line', { x1: ST1[j - 1].cx + ST1[j - 1].w / 2, y1: PY, x2: s.cx - s.w / 2, y2: PY, stroke: live ? ACC : GRID, 'stroke-width': 4, 'stroke-dasharray': live ? null : '8 6', opacity: isNew ? fade(u, 0.4) : 1 });
      card(s.cx, PY, s.w, 70, { rx: 12, stroke: col, sw: 2.4, s: sc });
      if (sc > 0.4) { mono(s.cx, s.b ? PY - 6 : PY + 6, s.a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col });
        if (s.b) mono(s.cx, PY + 18, s.b, { 'font-size': 14, 'text-anchor': 'middle' });
        sub(s.cx, PY + 58, s.tag, isNew ? fade(u, 0.7) : 1, { fill: j === 3 ? ACC : MUT, 'font-weight': 700 }); } } }
  function s1(t, c) { const { k, u } = c;
    if (k === 5) { // for 루프와 대비
      const f = jcode(30, 70, ['List<Integer> out = new ArrayList<>();', 'for (int n : nums) {', '  if (n % 2 == 0) out.add(n * 10);', '}'], { fs: 14.5, show: lerp(0, 4, E(u, 0.2, 1.0)) });
      const s = jcode(510, 70, ['nums.stream()', '    .filter(n -> n % 2 == 0)', '    .map(n -> n * 10)', '    .collect(Collectors.toList());'], { fs: 14.5, stroke: ACC, show: lerp(0, 4, E(u, 0.6, 1.4)) });
      lbl(f.x + f.w / 2, 44, '명령형 · 어떻게', fade(u, 0.2), { fill: MUT }); lbl(s.x + s.w / 2, 44, '선언형 · 무엇을', fade(u, 0.6), { fill: ACC });
      ['리스트 생성', '순회', '조건', 'add'].forEach((w, i) => pill(70 + i * 92, 236, w, WARN, pop(u, 1.4 + i * 0.15), { fs: 14 }));
      ['걸러라', '바꿔라', '모아라'].forEach((w, i) => pill(560 + i * 110, 236, w, ACC, pop(u, 1.9 + i * 0.15), { fs: 14 }));
      note(30, 300, '반복 제어를 손으로 조립한다', fade(u, 2.2), { fill: WARN }); note(510, 300, '반복 제어는 라이브러리에 맡긴다', fade(u, 2.3), { fill: ACC });
      return; }
    nums(1); el('line', { x1: 63, y1: 102, x2: 63, y2: PY - 36, stroke: INFO, 'stroke-width': 2.4, opacity: k === 0 ? fade(u, 0.5) : 1 });
    const live = k >= 3; stations(Math.min(k + 1, 4), u, k, live);
    if (k === 0) { note(400, 86, 'stream()은 원본을 바꾸지 않고 통로만 연다', fade(u, 0.9), { fill: INFO }); return; }
    if (k <= 2) { const calls = '람다 실행 0회'; pill(480, 360, calls, WARN, pop(u, 1.2), { fs: 15 });
      if (k === 2) sub(480, 398, '중간연산만으로는 아무 일도 일어나지 않는다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    // k3, k4: 실행
    const RX = (j) => 700 + j * 62;
    mono(700, 334, 'result', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    const got = [];
    [1, 2, 3, 4, 5, 6].forEach((v, i) => { const even = v % 2 === 0, j = v / 2 - 1, t0 = 0.2 + i * 0.27, f = k === 3 ? seg(u, t0, t0 + 1.0) : 1;
      const route = even ? [[NX(i), 102], [NX(i), 150], [345, PY], [585, PY], [820, PY], [RX(j) + 28, 370]] : [[NX(i), 102], [NX(i), 150], [345, PY], [345, 330]];
      if (f >= 1) { if (even) got.push(j); else if (k === 3) { cross(345 + (i - 2) * 14, 340, 7, 1); } return; }
      if (f <= 0) return; const p = posOn(route, f), txt = even && p.i >= 3 ? String(v * 10) : String(v);
      if (Math.abs(p.y - PY) < 40 && ST1.some((s) => Math.abs(p.x - s.cx) < s.w / 2 + 8)) return;   // 정거장 안에서는 가려진다
      chip(p.x, p.y, txt, even ? (p.i >= 3 ? ACC : INFO) : BAD, { fill: PANEL }); });
    cells(700, 350, [20, 40, 60].map((v, j) => (got.includes(j) ? v : '')), { w: 56, h: 40, style: (j) => (got.includes(j) ? { stroke: ACC, color: ACC, fill: ACCBG } : { stroke: GRID }) });
    if (k === 3) { sub(345, 386, '홀수는 filter에서 멈춘다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); return; }
    el('rect', { x: 34, y: 54, width: 318, height: 52, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.4, opacity: fade(u, 0.3) });
    note(80, 140, 'nums 원본은 그대로', fade(u, 0.5), { fill: INFO });
    el('rect', { x: 692, y: 342, width: 194, height: 56, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.9) });
    note(560, 410, '새 리스트', fade(u, 1.1), { fill: ACC }); pill(160, 380, '[20, 40, 60]', ACC, pop(u, 1.6), { mono: true }); }

  // ---------- 2. 지연평가 ----------
  const LX = (i) => 300 + i * 72, LANES = [['peek', 150, MUT], ['filter', 222, INK], ['map', 294, INK], ['findFirst', 366, ACC]];
  const LOG = ['filter 검사: 1', 'filter 검사: 2', '결과: 20'];
  function lanes(n, o) { o = o || {};
    LANES.slice(0, n).forEach(([nm, y, col], j) => { const dash = o.dash && o.dash(j), op = o.op ? o.op(j) : 1;
      el('line', { x1: 230, y1: y, x2: 700, y2: y, stroke: dash ? GRID : col === ACC ? ACC : OFF, 'stroke-width': 2.4, 'stroke-dasharray': dash ? '6 6' : null, opacity: op });
      card(140, y, 150, 44, { rx: 8, text: nm, mono: true, fs: 15, stroke: dash ? GRID : col, color: dash ? MUT : col, dash: dash ? '6 4' : null, op }); }); }
  function elems(st) { tx(140, 76, '요소', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    [1, 2, 3, 4, 5, 6].forEach((v, i) => { const s = st ? st(i) : {}; card(LX(i), 76, 46, 40, { rx: 6, text: String(v), mono: true, fs: 16, stroke: s.col || INK, color: s.col || INK, op: s.op ?? 1 }); }); }
  function drop(i, f, stopAt, out) { // 요소 i 가 세로로 내려간다. stopAt = 멈출 칸 번호
    const ys = [76, 150, 222, 294, 366].slice(0, stopAt + 2), p = posOn(ys.map((y) => [LX(i), y]), f), v = i + 1;
    const txt = p.i >= 3 || (f >= 1 && stopAt >= 2) ? String(out) : String(v);
    chip(p.x, p.y, txt, p.i >= 3 || (f >= 1 && stopAt >= 2) ? ACC : INFO); return p; }
  function s2(t, c) { const { k, u } = c;
    if (k === 5) { // 최종연산이 없으면
      elems(); el('line', { x1: 230, y1: 222, x2: 700, y2: 222, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 6' });
      card(140, 222, 150, 44, { rx: 8, text: 'map', mono: true, fs: 15, stroke: BAD, color: BAD });
      mono(480, 210, 'n -> { throw new RuntimeException(); }', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 0.3) });
      card(140, 330, 150, 44, { rx: 8, text: '최종연산', fs: 15, stroke: GRID, color: MUT, dash: '6 4', s: pop(u, 0.7) });
      tx(250, 336, '없음', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
      sub(480, 130, '요소는 한 칸도 움직이지 않는다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK });
      terminal(740, 70, 200, 150, [['예외 안 남', null], ['map 은 실행', null], ['예약만 됨', null]], u < 1.6 ? 0 : lerp(1, 3, E(u, 1.6, 2.4)), { title: '출력', fs: 14 });
      pill(820, 300, '람다 호출 0회', WARN, pop(u, 2.2), { fs: 15 }); return; }
    const gone = (i) => (k === 4 && i >= 2 ? { col: OFF, op: 1 } : {});
    elems(gone);
    lanes(k >= 2 ? 4 : k === 1 ? 3 : 1, { dash: (j) => k <= 1 && j >= 1, op: (j) => (j === 3 && k === 2 ? fade(u, 0.2) : j >= 1 && j < 3 && k === 1 ? fade(u, 0.3) : 1) });
    let shown = 0;
    if (k <= 1) { pill(480, 400, '람다 호출 0회', WARN, k === 1 ? pop(u, 0.9) : pop(u, 1.0), { fs: 15 }); if (k === 1) sub(470, 260, '무엇을 할지 예약만 쌓인다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k >= 2) { const f1 = k === 2 ? seg(u, 0.6, 1.8) : 1; if (f1 > 0) drop(0, f1, 1, null); if (f1 >= 1) cross(LX(0) + 30, 222, 8, k === 2 ? pop(u, 1.8) : 1);
      shown = k === 2 ? (u > 0.9 ? 1 : 0) : 1; }
    if (k >= 3) { const f2 = k === 3 ? seg(u, 0.3, 2.0) : 1; drop(1, f2, 3, 20); if (f2 >= 0.4 || k > 3) check(LX(1) + 30, 222, 8, 1);
      shown = k === 3 ? (u > 0.5 ? 2 : 1) + (u > 2.0 ? 1 : 0) : 3;
      if (f2 >= 1) pill(LX(1) + 120, 366, 'Optional[20]', ACC, k === 3 ? pop(u, 2.0) : 1, { mono: true, fs: 14 }); }
    if (k === 4) { el('rect', { x: LX(2) - 30, y: 52, width: 4 * 72 - 12, height: 340, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      tx(LX(3) + 36, 190, '3~6은 검사조차', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(LX(3) + 36, 212, '안 한다', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      banner(470, 400, '쇼트서킷: 첫 값을 얻는 순간 멈춘다', pop(u, 1.4)); }
    terminal(740, 70, 200, 150, LOG, shown, { title: '출력', fs: 14 });
    if (k >= 2 && k <= 3) note(740, 260, '요소 하나가 세로로', fade(u, 0.4), { 'font-size': 14.5, fill: INFO });
    if (k >= 2 && k <= 3) note(740, 284, '끝까지 내려간 뒤 다음', fade(u, 0.4), { 'font-size': 14.5, fill: INFO }); }

  // ---------- 3. 집계 ----------
  const EMP = [['Kim', 'DEV', 5000], ['Lee', 'DEV', 5300], ['Park', 'SALES', 5000]];
  const EY = (i) => 110 + i * 60;
  function emps(sc, hot) { tx(30, 70, 'emps : List<Employee>', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: MUT });
    EMP.forEach(([n, d, s], i) => card(140, EY(i), 220, 44, { rx: 8, text: `${n} · ${d} · ${s}`, mono: true, fs: 14.5, stroke: hot && hot(i) ? ACC : INK, color: hot && hot(i) ? ACC : INK, s: sc ? sc(i) : 1 })); }
  function s3(t, c) { const { k, u } = c;
    emps(k === 0 ? (i) => pop(u, 0.2 + i * 0.25) : null, k === 4 || k === 5 ? (i) => i === 1 : null);
    if (k === 0) { note(330, 100, '이 스트림을 어떤 모양으로 뽑을까', fade(u, 1.0));
      [['List', 'toList()'], ['Map', 'groupingBy'], ['String', 'joining'], ['int', 'mapToInt().sum()'], ['Optional', 'max']].forEach(([a, b], i) => { const s = pop(u, 1.3 + i * 0.2), x = 330 + (i % 3) * 205, y = 160 + Math.floor(i / 3) * 70;
        card(x + 92, y, 190, 52, { rx: 10, stroke: i === 0 ? ACC : GRID, sw: 2, s }); if (s > 0.4) { mono(x + 14, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: i === 0 ? ACC : INK }); mono(x + 178, y + 6, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } });
      sub(560, 330, '모양은 최종연산이 정한다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { // HashMap 16칸
      const BX = (b) => 290 + b * 40; tx(290, 66, 'groupingBy가 만드는 HashMap (칸 16개)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      for (let b = 0; b < 16; b++) { const hot = b === 4 || b === 12; el('rect', { x: BX(b), y: 80, width: 36, height: 36, rx: 5, fill: hot && u > 1.0 ? ACCBG : PANEL, stroke: hot && u > 1.0 ? ACC : GRID, 'stroke-width': 1.8 });
        mono(BX(b) + 18, 134, String(b), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
      mono(BX(4) + 18, 104, 'DEV', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      mono(BX(12) + 18, 104, 'SALES', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      mono(BX(4) + 32, 176, '"DEV" → 칸 4', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.6) }); mono(BX(12) + 32, 176, '"SALES" → 칸 12', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.6) });
      const tgt = [[BX(4) + 18, 220], [BX(4) + 18, 270], [BX(12) + 18, 220]];
      EMP.forEach(([n], i) => { const f = seg(u, 1.0 + i * 0.35, 1.7 + i * 0.35); if (f > 0 && f < 1) fly(250, EY(i), tgt[i][0], tgt[i][1], f, n, { mono: true, fill: INFO });
        if (f >= 1) card(tgt[i][0], tgt[i][1], 80, 38, { rx: 7, text: n, mono: true, fs: 15, stroke: ACC, color: ACC }); });
      grow(BX(4) + 18, 118, BX(4) + 18, 199, E(u, 1.3, 1.6), ACC); grow(BX(12) + 18, 118, BX(12) + 18, 199, E(u, 2.0, 2.3), ACC);
      pill(560, 360, 'byDept → {DEV=[Kim, Lee], SALES=[Park]}', ACC, pop(u, 2.4), { mono: true, fs: 14 });
      sub(560, 398, '칸 번호는 키의 hashCode로 정해진다 (Employee는 이름만 적음)', fade(u, 2.5)); return; }
    if (k === 2) { // joining
      const parts = ['"Kim', ', ', 'Lee', ', ', 'Park"'];
      mono(450, 92, 'map(Employee::name)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.2) });
      EMP.forEach(([n], i) => { const f = seg(u, 0.4 + i * 0.3, 0.9 + i * 0.3); if (f > 0) chip(lerp(250, 450, E(f, 0, 1)), EY(i), n, INFO); });
      mono(700, 92, 'joining(", ")', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      const x0 = 520, x = x0 + parts.join('').length * 18 * 0.55;
      spans(x0, 250, parts.map((p, i) => [p, { fill: i % 2 ? WARN : ACC, opacity: fade(u, 1.4 + i * 0.2) }]), { 'font-size': 18, 'font-weight': 800 });
      el('rect', { x: x0 - 12, y: 222, width: x - x0 + 24, height: 42, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 2.3) });
      note(x0 - 12, 300, 'names → Kim, Lee, Park', fade(u, 2.4), { fill: ACC, class: 'mono' });
      sub(700, 340, '구분자 ", "는 사이에만 들어간다', fade(u, 2.5), { 'font-size': 14.5 }); return; }
    if (k === 3) { // mapToInt().sum()
      mono(450, 92, 'mapToInt(Employee::salary)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.2) });
      let sum = 0; EMP.forEach(([, , s], i) => { const f = seg(u, 0.4 + i * 0.45, 1.0 + i * 0.45);
        if (f > 0 && f < 1) chip(lerp(250, 640, E(f, 0, 1)), lerp(EY(i), 230, E(f, 0, 1)), String(s), INFO); if (f >= 1) sum += s;
        if (f > 0) chip(450, EY(i), 'int ' + s, INFO, { op: f >= 1 ? 0.45 : 1 }); });
      card(720, 230, 170, 76, { rx: 12, stroke: ACC, sw: 2.4 }); tx(720, 214, 'sum()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, class: 'mono' });
      mono(720, 250, String(Math.round(tween(0, sum, 1, 0.01))), { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      note(330, 330, 'IntStream은 int 그대로 흐른다', fade(u, 1.8), { fill: INFO });
      card(450, 380, 170, 36, { rx: 8, text: 'Integer 객체', fs: 14, stroke: GRID, color: MUT, op: fade(u, 2.1) }); cross(545, 380, 8, pop(u, 2.2));
      tx(570, 386, '박싱 없음 · total = 15300', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) }); return; }
    // k4, k5: max → Optional
    const ax = 300; tx(ax, 66, 'salary 비교', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    EMP.forEach(([n, , s], i) => hbar(ax, EY(i) - 9, 260, s, 5300, { col: i === 1 ? ACC : OFF, u: k === 4 ? E(u, 0.2 + i * 0.15, 0.9 + i * 0.15) : 1, text: String(s) }));
    const box = (cx, cy, inner, col, s) => { card(cx, cy, 200, 80, { rx: 16, stroke: col, sw: 2.6, dash: '8 5', s }); tx(cx, cy - 50, inner ? 'Optional[Lee]' : 'Optional.empty', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', fill: col, opacity: clamp(s) });
      if (inner) card(cx, cy, 110, 40, { rx: 8, text: 'Lee', mono: true, fs: 16, stroke: ACC, color: ACC, s }); };
    if (k === 4) { box(760, 140, true, ACC, pop(u, 1.2)); fly(560, EY(1), 760, 140, seg(u, 0.9, 1.4), 'Lee', { mono: true });
      box(760, 300, false, MUT, pop(u, 1.9)); sub(760, 362, '리스트가 비면 값이 없다', fade(u, 2.1), { 'font-size': 14.5 });
      note(300, 330, 'max는 Employee가 아니라', fade(u, 2.2)); note(300, 356, 'Optional<Employee>를 돌려준다', fade(u, 2.3), { fill: ACC }); return; }
    box(560, 315, true, ACC, 1); box(820, 315, false, MUT, 1);
    mono(560, 405, 'e -> println("최고: " + e.name())', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
    grow(560, 359, 560, 387, E(u, 0.4, 0.7), INFO);
    terminal(320, 270, 140, 90, ['최고: Lee'], u > 1.3 ? 1 : 0, { fs: 14 });
    dot([[560, 315], [460, 315]], seg(u, 0.8, 1.3), ACC, 7);
    sub(820, 375, 'ifPresent 람다 호출 안 됨', fade(u, 1.6), { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
    note(620, 76, 'null 검사 없이 값이 있을 때만 실행', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC, 'font-size': 14.5 }); }

  // ---------- 4. 병렬 ----------
  const TREE = { root: [480, 76], mid: [[300, 146], [660, 146]], leaf: [[210, 216], [390, 216], [570, 216], [750, 216]] };
  const CH = [[1, 2], [3, 4], [5, 6], [7, 8]], PART = CH.map(([a, b]) => a * a + b * b);   // heavy(n) = n*n
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { const g = k === 0 ? E(u, 0.3, 1.4) : 1;
      let cx0 = 110; ['IntStream.rangeClosed(1, 1_000_000)', '.boxed()', '.toList()'].forEach((s, i) => { const w = tw(s, 14) + 22; chip(cx0 + w / 2, 70, s, i ? INFO : INK, { s: k === 0 ? pop(u, 0.2 + i * 0.35) : 1 }); cx0 += w + 16; });
      el('rect', { x: 60, y: 140, width: 840 * g, height: 40, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
      for (let i = 0; i <= 10; i++) if (i / 10 <= g) el('line', { x1: 60 + i * 84, y1: 180, x2: 60 + i * 84, y2: 188, stroke: MUT, 'stroke-width': 1.5 });
      mono(60, 210, '1', { 'font-size': 14, fill: MUT }); mono(900, 210, '1,000,000', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: g });
      tx(480, 128, 'big : Integer 100만 개', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      if (k === 0) { note(480, 280, '아직 아무 연산도 돌지 않았다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); return; }
      const p = E(u, 0.3, 2.2); el('rect', { x: 60, y: 140, width: 840 * p, height: 40, rx: 6, fill: ACC, opacity: 0.55 });
      const tx0 = 60 + 840 * p; card(tx0, 250, 110, 40, { rx: 8, text: 'main', mono: true, fs: 15, stroke: ACC, color: ACC }); grow(tx0, 230, tx0, 184, 1, ACC, { plain: true });
      tx(480, 320, '스레드 하나가 처음부터 끝까지 heavy(n) = n × n을 더한다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      pill(480, 376, 'seq = 333,333,833,333,500,000', ACC, pop(u, 2.3), { mono: true, fs: 15 }); return; }
    if (k === 2 || k === 3) { const sp = k === 2 ? (x) => E(u, x, x + 0.4) : () => 1;
      tx(30, 30 + 4, '예: 1~8을 4조각으로', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      chip(TREE.root[0], TREE.root[1], '[1..8]', INK);
      TREE.mid.forEach((p, i) => { const g = sp(0.3); grow(TREE.root[0], TREE.root[1] + 16, p[0], p[1] - 16, g, MUT); if (g >= 1) chip(p[0], p[1], i ? '[5..8]' : '[1..4]', INK); });
      TREE.leaf.forEach((p, i) => { const g = sp(0.8), m = TREE.mid[i >> 1]; grow(m[0], m[1] + 16, p[0], p[1] - 16, g, MUT); if (g >= 1) chip(p[0], p[1], `[${CH[i][0]}, ${CH[i][1]}]`, INK); });
      TREE.leaf.forEach((p, i) => { const s = k === 2 ? pop(u, 1.3 + i * 0.12) : 1; card(p[0], 282, 136, 46, { rx: 8, stroke: INFO, sw: 2, s });
        if (s > 0.4) { mono(p[0], 278, `worker ${i + 1}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 }); mono(p[0], 296, `${CH[i][0]}²+${CH[i][1]}²`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } });
      const ps = k === 2 ? (i) => pop(u, 1.9 + i * 0.12) : () => 1;
      TREE.leaf.forEach((p, i) => card(p[0], 350, 70, 38, { rx: 8, text: String(PART[i]), mono: true, fs: 17, stroke: ACC, color: ACC, s: ps(i) }));
      if (k === 2) { sub(480, 404, 'Spliterator가 반씩 쪼개고 공용 ForkJoinPool 스레드가 나눠 맡는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      // k3: 병합 (아래 → 오른쪽)
      const m1 = PART[0] + PART[1], m2 = PART[2] + PART[3];
      grow(210, 370, 300, 392, E(u, 0.3, 0.6), ACC); grow(390, 370, 300, 392, E(u, 0.3, 0.6), ACC);
      grow(570, 370, 660, 392, E(u, 0.3, 0.6), ACC); grow(750, 370, 660, 392, E(u, 0.3, 0.6), ACC);
      chip(300, 404, `${PART[0]} + ${PART[1]} = ${m1}`, ACC, { s: pop(u, 0.6) }); chip(660, 404, `${PART[2]} + ${PART[3]} = ${m2}`, ACC, { s: pop(u, 0.9) });
      card(870, 140, 150, 96, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: pop(u, 1.5) });
      if (u > 1.6) { mono(870, 128, `${m1} + ${m2}`, { 'font-size': 15, 'text-anchor': 'middle' }); mono(870, 160, `= ${m1 + m2}`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); }
      pill(110, 140, 'seq == par → true', GOOD, pop(u, 2.2), { mono: true, fs: 14 });
      sub(110, 176, '덧셈은 묶는 순서와 무관', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 4) { // 공유 리스트에 동시에 add
      tx(30, 34, '예: 스레드 4개가 같은 ArrayList에 add', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      const SL = (j) => 330 + j * 66;
      el('rect', { x: 316, y: 290, width: 66 * 8 + 10, height: 62, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(316, 374, 'shared (ArrayList)', { 'font-size': 14.5, 'font-weight': 700 });
      const land = [0, 1, 1, 2, 3, 3, 4, 5];   // 여러 스레드가 같은 칸에 쓴다 (예)
      [0, 1, 2, 3].forEach((w) => { card(120, 90 + w * 62, 150, 44, { rx: 8, text: `Thread-${w + 1}`, mono: true, fs: 14.5, stroke: INFO, color: INFO }); mono(205, 96 + w * 62, `[${CH[w][0]}, ${CH[w][1]}]`, { 'font-size': 14, fill: MUT }); });
      const filled = {};
      [0, 1, 2, 3, 4, 5, 6, 7].forEach((n) => { const w = n >> 1, f = seg(u, 0.2 + (n % 2) * 0.9 + w * 0.22, 0.7 + (n % 2) * 0.9 + w * 0.22), to = [SL(land[n]) + 28, 321];
        if (f > 0 && f < 1) fly(270, 90 + w * 62, to[0], to[1], f, String(n + 1), { mono: true, fill: INFO }); if (f >= 1) filled[land[n]] = (filled[land[n]] || 0) + 1; });
      for (let j = 0; j < 8; j++) { const cnt = filled[j] || 0; card(SL(j) + 28, 321, 56, 44, { rx: 6, text: cnt ? (cnt > 1 ? '덮임' : '값') : '', fs: 14, stroke: cnt > 1 ? BAD : cnt ? INFO : GRID, color: cnt > 1 ? BAD : INFO, fill: cnt > 1 ? BADBG : PANEL }); }
      note(316, 404, '두 스레드가 같은 칸에 쓰면 값 하나가 사라진다', fade(u, 2.0), { fill: BAD });
      pill(700, 200, '결과 개수 < 8 (실행마다 다름)', BAD, pop(u, 2.3), { fs: 14 }); return; }
    // k5: collect — 스레드마다 자기 컨테이너
    tx(30, 34, '예: filter(짝수).collect(toList()) 를 4조각으로', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    [0, 1, 2, 3].forEach((w) => { const x = 140 + w * 225; card(x, 90, 150, 44, { rx: 8, text: `Thread-${w + 1}`, mono: true, fs: 14.5, stroke: INFO, color: INFO });
      card(x, 170, 110, 44, { rx: 8, text: `[${CH[w][1]}]`, mono: true, fs: 16, stroke: ACC, color: ACC, s: pop(u, 0.3 + w * 0.1) }); sub(x, 210, '자기 리스트', fade(u, 0.5), { 'font-size': 13.5 }); });
    [[140, 365, 252], [590, 815, 702]].forEach(([a, b, m], i) => { grow(a, 194, m, 262, E(u, 1.0, 1.4), ACC); grow(b, 194, m, 262, E(u, 1.0, 1.4), ACC);
      chip(m, 278, i ? '[6, 8]' : '[2, 4]', ACC, { s: pop(u, 1.4) }); });
    grow(252, 296, 470, 350, E(u, 1.8, 2.1), ACC); grow(702, 296, 490, 350, E(u, 1.8, 2.1), ACC);
    card(480, 370, 180, 46, { rx: 10, text: '[2, 4, 6, 8]', mono: true, fs: 18, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.1) });
    note(600, 376, '공유 상태 없이 마지막에 합친다', fade(u, 2.4), { fill: ACC, 'font-size': 14.5 }); }

  // ---------- 5. 실무 함정 ----------
  const NM = ['Kim', 'Lee', 'Park'];
  function pipe(x, y, w, label, col, o) { o = o || {}; const g = o.s ?? 1; if (g <= 0) return;
    el('rect', { x, y: y - 22, width: w * Math.min(1, g), height: 44, rx: 22, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': o.dash });
    if (g >= 1) mono(x + w / 2, y + 6, label, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const closed = u > 1.7;
      pipe(60, 150, 280, closed ? 's (소비됨)' : 's = names.stream()', closed ? OFF : INFO, { fill: closed ? SOFT : PANEL });
      mono(380, 110, 's.forEach(println)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      NM.forEach((n, i) => { const f = seg(u, 0.3 + i * 0.3, 1.0 + i * 0.3); if (f > 0 && f < 1) fly(360, 150, 640, 150, f, n, { mono: true, fill: ACC }); });
      terminal(660, 70, 270, 160, ['Kim', 'Lee', 'Park', ['> s.count()', null], ['IllegalStateException', '#fca5a5']], u < 0.9 ? 0 : u < 2.0 ? Math.min(3, Math.floor((u - 0.6) / 0.3)) : lerp(4, 5, E(u, 2.0, 2.4)), { title: '출력', fs: 14 });
      mono(380, 260, 's.count()', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      fly(400, 280, 200, 175, seg(u, 1.9, 2.3), 'count()', { mono: true, fill: BAD }); if (u > 2.3) cross(200, 150, 14, pop(u, 2.3));
      sub(480, 350, 'stream has already been operated upon or closed', fade(u, 2.4), { class: 'mono', fill: BAD, 'font-size': 14 });
      note(60, 400, '스트림은 최종연산 한 번으로 소비된다', fade(u, 2.5), { 'font-size': 14.5 }); return; }
    if (k === 1) { card(150, 200, 220, 90, { rx: 14, stroke: ACC, sw: 2.6, fill: ACCBG, s: pop(u, 0.2) }); mono(150, 192, 'gen', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      mono(150, 218, 'names::stream', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      sub(150, 270, 'Supplier<Stream<String>>', fade(u, 0.5), { class: 'mono' });
      [[120, 'gen.get().forEach(println)', 'Kim · Lee · Park', 0.7], [290, 'gen.get().count()', '3', 1.5]].forEach(([y, cmd, res, t0]) => { const g = E(u, t0, t0 + 0.5);
        grow(262, 200, 330, y, g, ACC); pipe(340, y, 260, '새 스트림', INFO, { s: g });
        mono(470, y - 34, cmd, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, t0) });
        if (u > t0 + 0.6) { grow(602, y, 660, y, E(u, t0 + 0.6, t0 + 0.8), ACC); chip(660 + tw(res, 14) / 2 + 20, y, res, ACC, { s: pop(u, t0 + 0.8) }); } });
      note(340, 400, '스트림 대신 스트림을 만드는 방법을 들고 있는다', fade(u, 2.3), { fill: ACC, 'font-size': 14.5 }); return; }
    if (k === 2) { // ArrayList add 경쟁 (예)
      tx(30, 34, '예: parallelStream().forEach(out::add) 의 한 순간', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      el('rect', { x: 330, y: 70, width: 300, height: 150, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(346, 96, 'out (ArrayList)', { 'font-size': 15, 'font-weight': 700 });
      const sz = u < 1.9 ? 1 : 2; mono(346, 126, `size = ${sz}`, { 'font-size': 15, fill: sz === 2 ? BAD : INK, 'font-weight': 700 });
      const v1 = u > 1.4 ? (u > 1.7 ? 'Park' : 'Lee') : '';
      cells(346, 146, ['Kim', v1, '', ''], { w: 62, h: 40, gap: 6, fs: 14, style: (j) => (j === 1 && u > 1.7 ? { stroke: BAD, color: BAD, fill: BADBG } : {}) });
      [['Thread-A', 'Lee', 120], ['Thread-B', 'Park', 300]].forEach(([n, v, y], i) => { card(110, y, 150, 46, { rx: 8, text: n, mono: true, fs: 15, stroke: INFO, color: INFO });
        note(40, y + 46, `size 읽음 → 1`, fade(u, 0.5 + i * 0.2), { 'font-size': 14.5, fill: INFO });
        fly(190, y, 450, 166, seg(u, 0.9 + i * 0.3, 1.4 + i * 0.3), v, { mono: true, fill: i ? BAD : INFO }); });
      note(660, 120, '둘 다 1번 칸에 쓴다', fade(u, 1.6), { fill: BAD }); note(660, 150, 'Lee가 Park에 덮인다', fade(u, 1.8), { fill: BAD });
      note(660, 180, '예외 없이 값이 사라진다', fade(u, 2.1));
      pill(480, 300, '순차에서는 멀쩡해서 더 위험하다', WARN, pop(u, 2.4), { fs: 14.5 }); return; }
    if (k === 3) { // collect 로 수집
      mono(480, 60, 'names.stream().filter(n -> n.length() == 3).collect(toList())', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.2) });
      card(470, 200, 210, 70, { rx: 12, text: 'filter\nlength() == 3', fs: 15, mono: true, stroke: INK });
      NM.forEach((n, i) => { const y = 130 + i * 70, f = seg(u, 0.4 + i * 0.4, 1.3 + i * 0.4), ok = n.length === 3;
        card(110, y, 100, 40, { rx: 8, text: n, mono: true, fs: 15, stroke: f > 0 ? GRID : INK, color: f > 0 ? OFF : INK });
        if (f > 0 && f < 1) { const p = posOn(ok ? [[160, y], [365, 200], [575, 200], [760, 160 + i * 52]] : [[160, y], [365, 200], [470, 250], [470, 330]], f); chip(p.x, p.y, n, ok ? INFO : BAD); }
        if (f >= 1 && !ok) { mono(470, 350, 'Park (4글자)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD }); cross(540, 344, 7, 1); } });
      el('rect', { x: 690, y: 120, width: 150, height: 120, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 }); mono(765, 112, 'collect가 만든 리스트', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
      NM.slice(0, 2).forEach((n, i) => { if (seg(u, 0.4 + i * 0.4, 1.3 + i * 0.4) >= 1) chip(765, 160 + i * 52, n, ACC); });
      pill(765, 300, 'out → [Kim, Lee]', GOOD, pop(u, 2.4), { mono: true, fs: 14 });
      note(30, 400, '컨테이너 준비와 병합은 collect가 맡는다', fade(u, 2.3), { fill: ACC, 'font-size': 14.5 }); return; }
    // k4: map 먼저 (낭비) / k5: filter 먼저
    const bad = k === 4, A = bad ? ['map', 'toUpperCase'] : ['filter', 'startsWith("K")'], B = bad ? ['filter', 'startsWith("K")'] : ['map', 'toUpperCase'];
    tx(30, 40, bad ? '순서 A: map 먼저 → filter' : '순서 B: filter 먼저 → map', { 'font-size': 15.5, 'font-weight': 800, fill: bad ? BAD : GOOD });
    card(360, 200, 200, 70, { rx: 12, text: A.join('\n'), fs: 15, mono: true, stroke: A[0] === 'map' ? WARN : INK });
    card(620, 200, 200, 70, { rx: 12, text: B.join('\n'), fs: 15, mono: true, stroke: B[0] === 'map' ? WARN : INK });
    let calls = 0;
    NM.forEach((n, i) => { const y = 130 + i * 70, f = seg(u, 0.3 + i * 0.5, 1.3 + i * 0.5), keep = i === 0;
      card(110, y, 100, 40, { rx: 8, text: n, mono: true, fs: 15, stroke: f > 0 ? GRID : INK, color: f > 0 ? OFF : INK });
      const route = bad ? (keep ? [[160, y], [260, 200], [460, 200], [720, 200], [840, 200]] : [[160, y], [260, 200], [460, 200], [560, 200], [560, 320]])
        : (keep ? [[160, y], [260, 200], [460, 200], [720, 200], [840, 200]] : [[160, y], [260, 200], [300, 200], [300, 320]]);
      const mapSeg = bad ? 2 : 3; if (f > 0) { const p = posOn(route, f), up = p.i >= mapSeg || f >= 1; if (up && (bad || keep)) calls++;
        if (f < 1) chip(p.x, p.y, up && (bad || keep) ? n.toUpperCase() : n, keep ? INFO : BAD);
        else if (!keep) { cross(bad ? 560 : 300, 330 + (i - 1) * 24, 7, 1); mono(bad ? 590 : 330, 336 + (i - 1) * 24, bad ? n.toUpperCase() + ' (버림)' : n, { 'font-size': 14, fill: BAD }); } } });
    pill(860, 200, '[KIM]', ACC, u > 1.3 ? pop(u, 1.3) : 0, { mono: true, fs: 15 });
    const shown = Math.min(calls, bad ? 3 : 1);
    card(820, 330, 220, 62, { rx: 10, stroke: bad ? BAD : GOOD, sw: 2.2 }); tx(820, 322, 'toUpperCase 호출', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 });
    mono(820, 350, `${shown}회`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: bad ? BAD : GOOD });
    note(30, 400, bad ? '버릴 Lee·Park까지 변환했다' : '버릴 값은 변환 전에 걸러진다. up → [KIM]', fade(u, 2.3), { fill: bad ? BAD : GOOD, 'font-size': 14.5 }); }

  const quiz = [
    { q: 'filter와 map만 이어 붙이고 collect를 쓰지 않으면 어떻게 되는가?',
      o: ['filter까지만 실행된다', '람다가 한 번도 실행되지 않는다', '컴파일 에러가 난다'], a: 1,
      why: '중간연산은 할 일을 등록만 한다. 최종연산이 붙어야 nums의 요소가 흘러 [20, 40, 60] 같은 결과가 나온다.' },
    { q: '[1..6]에 peek·filter(짝수)·map·findFirst를 걸면 "filter 검사" 로그는 몇 줄 찍히는가?',
      o: ['6줄', '3줄', '2줄'], a: 2,
      why: '요소가 하나씩 세로로 끝까지 내려가므로 1은 탈락, 2는 통과해 20이 되는 순간 findFirst가 멈춘다. 3~6은 검사조차 하지 않는다.' },
    { q: '급여 합계를 구할 때 mapToInt(Employee::salary).sum()을 쓰는 까닭은 무엇인가?',
      o: ['IntStream에 sum()이 있고 Integer 박싱이 없어서', 'Stream<Integer>보다 결과가 정확해서', 'Optional을 피하려고'], a: 0,
      why: '일반 Stream<Integer>에는 sum()이 없다. IntStream은 int를 그대로 흘려 15300을 박싱 없이 더한다.' },
    { q: 'parallelStream().forEach(shared::add)로 ArrayList에 모으면 무엇이 문제인가?',
      o: ['항상 예외가 나서 바로 알 수 있다', '순서만 바뀌고 개수는 늘 맞다', '여러 스레드가 같은 칸에 써서 값이 조용히 사라질 수 있다'], a: 2,
      why: 'ArrayList는 스레드 안전하지 않다. 예외 없이 개수가 모자랄 수 있어서 collect로 스레드마다 따로 모은 뒤 합쳐야 한다.' },
    { q: 'filter(startsWith("K"))를 map(toUpperCase) 앞에 두면 3명 가운데 toUpperCase는 몇 번 불리는가?',
      o: ['3번', '1번', '0번'], a: 1,
      why: '먼저 걸러 Kim만 남으므로 변환은 1번이다. map을 앞에 두면 버릴 Lee와 Park까지 3번 변환한다.' },
  ];

  const summary = [
    '중간연산은 할 일을 등록만 하고, collect 같은 최종연산이 붙어야 파이프라인이 실제로 돈다.',
    '요소는 하나씩 세로로 끝까지 내려가므로 findFirst는 1, 2만 보고 멈춘다.',
    '최종연산이 결과 모양을 정한다. 묶으면 Map, 이어 붙이면 String, 없을 수 있으면 Optional이다.',
    '스트림은 한 번 쓰면 닫히고, 바깥 리스트에 add하지 말고 collect로 모아야 병렬에서도 안전하다.',
  ];
  const review = [
    { q: '스트림 변수 s로 forEach를 돌린 뒤 s.count()를 불렀더니 예외가 났다. 알맞은 고침은?',
      o: ['s.reset()을 먼저 부른다', 'Supplier<Stream<String>> gen = names::stream으로 매번 새로 연다', 'forEach를 parallel()로 바꾼다'], a: 1,
      why: '스트림은 최종연산 한 번으로 소비된다. 만드는 방법을 들고 있다가 gen.get()으로 새 스트림을 열면 count()가 3을 돌려준다.' },
    { q: '100만 건을 map으로 무겁게 바꾼 뒤 filter로 대부분 버리는 코드가 느리다. 먼저 해 볼 일은?',
      o: ['filter를 map 앞으로 옮긴다', 'parallelStream으로 바꾼다', 'peek로 로그를 더 찍는다'], a: 0,
      why: '먼저 걸러 내면 버릴 요소는 변환을 거치지 않는다. 순서만 바꾸는 공짜 최적화이고 병렬은 측정한 뒤 고려한다.' },
    { q: '부서별 직원 목록이 필요하다. 가장 알맞은 최종연산은?',
      o: ['collect(joining(", "))', 'mapToInt(...).sum()', 'collect(groupingBy(Employee::dept))'], a: 2,
      why: 'groupingBy는 분류 함수의 결과를 키로 HashMap에 묶는다. 예제에서 {DEV=[Kim, Lee], SALES=[Park]}가 나온다.' },
  ];

  R.page({ title: '스트림 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
