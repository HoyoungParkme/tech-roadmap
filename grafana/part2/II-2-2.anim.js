/* II-2-2 Variable & Template — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 변수 목록·쿼리·치환값·패널·공유 URL 은 STEPS 의 variables · query · resolved · panels · shareUrl 에서 읽는다.
 * (web-01|web-02) 치환과 =~ 일치 여부, repeat 줄 수(ceil(선택 수 ÷ maxPerRow))는 Grafana 소스의 규칙을 node 로 다시 만들어 확인했다.
 * 패널의 CPU 값(0.34 등)과 옵션 3,214개는 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, browser, cross, check, lock, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const COL = { amber: WARN, sky: INFO, emerald: GOOD, red: BAD };
  let CW = 0.6;                                     // 고정폭 글자 폭 / 글자 크기 (그릴 때마다 실제 글꼴로 잰다)
  function measure() { const e = mono(0, -200, "MMMMMMMMMM", { "font-size": 100 }); try { const w = e.getComputedTextLength(); if (w > 0) CW = w / 1000; } catch (x) {} e.remove(); }
  const M = (fn) => (t, c) => { measure(); fn(t, c); };
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const V = (b, name) => (b.variables || []).find((v) => v.name === name) || {};
  const names = (b) => (b.variables || []).map((v) => v.name);

  // 대시보드 상단 변수 손잡이: "$name  값 ▾". 돌려주는 값은 다음 x 와 각 칩의 가운데
  function chip(x, y, name, val, o) { o = o || {}; const fs = 14.5, a = '$' + name, bv = String(val == null || val === '' ? ' ' : val);
    const w = tw(a, fs) + tw(bv, fs) + 46, s = o.s ?? 1, on = o.on;
    const g = R.G(x, y, s, o.op);
    el('rect', { x: 0, y: -17, width: w, height: 34, rx: 7, fill: on ? ACCBG : PANEL, stroke: o.stroke || (on ? ACC : GRID), 'stroke-width': on ? 2.2 : 1.6, 'stroke-dasharray': o.dash }, g);
    el('rect', { x: 1, y: -16, width: tw(a, fs) + 14, height: 32, rx: 6, fill: SOFT, opacity: 0.9 }, g);
    mono(8, 5, a, { 'font-size': fs, 'font-weight': 700, fill: on ? ACC : MUT }, g);
    if (o.input) { el('rect', { x: tw(a, fs) + 20, y: -11, width: tw(bv, fs) + 16, height: 22, rx: 4, fill: PANEL, stroke: GRID }, g); }
    mono(tw(a, fs) + 24, 5, bv, { 'font-size': fs, 'font-weight': 700, fill: o.valCol || INK }, g);
    if (!o.input) tx(w - 14, 5, '▾', { 'font-size': 13.5, fill: MUT }, g);
    return { w, cx: x + w / 2, vx: x + tw(a, fs) + 24 + tw(bv, fs) / 2, ve: x + tw(a, fs) + 24 + tw(bv, fs) }; }
  // 변수 막대: beat.variables 를 왼쪽부터. 새로 생긴 변수는 튀어나온다
  function varBar(c, x, y, o) { o = o || {}; const b = c.beat, prevN = c.prev ? names(c.prev) : [], out = {}; let cx = x;
    (b.variables || []).forEach((v, i) => { const fresh = !prevN.includes(v.name) && c.k > 0, s = fresh ? pop(c.u, 0.2) : 1;
      const val = v.type === 'textbox' ? (v.current || '') : v.current;
      const r = chip(cx, y, v.name, val, { s, on: b.activeVar === v.name, input: v.type === 'textbox', valCol: /로딩|생성 전|비어|옵션/.test(String(v.current)) ? MUT : null });
      out[v.name] = { x: cx, w: r.w, cx: cx + r.w / 2, vx: r.vx, ve: r.ve }; cx += r.w + 8; });
    return out; }

  // 쿼리 한 줄: $토큰은 ACC, o.hard 의 하드코딩 값은 WARN. 돌려주는 값: 토큰 이름 → 가운데 x
  function qline(x, y, q, o) { o = o || {}; const fs = o.fs || 15, w = o.w || 900, pos = {};
    el('rect', { x, y, width: w, height: 40, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 26, o.tag || 'PromQL', { 'font-size': 13.5, 'font-weight': 800, fill: MUT });
    const x0 = x + 14 + tw(o.tag || 'PromQL', 13.5) + 14, hard = o.hard || [];
    const re = new RegExp('(\\$\\w+' + hard.map((h) => '|' + h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + ')');
    let at = 0; q.split(re).forEach((p) => { if (!p) return; const px = x0 + at * fs * CW, pw = p.length * fs * CW;
      const isTok = p[0] === '$', isHard = hard.includes(p);
      if (isTok || isHard) { const hop = isTok && o.fresh && o.fresh.includes(p) ? fade(o.u ?? 1, 1.1, 0.3) : 1;
        el('rect', { x: px - 2, y: y + 9, width: pw + 4, height: 23, rx: 4, fill: isTok ? ACCBG : WARNBG, opacity: hop });
        pos[p] = px + pw / 2; }
      mono(px, y + 26, p, { 'font-size': fs, fill: isTok ? ACC : isHard ? WARN : INK, 'font-weight': isTok || isHard ? 800 : 400,
        opacity: isTok && o.fresh && o.fresh.includes(p) ? fade(o.u ?? 1, 1.1, 0.3) : 1 });
      at += p.length; });
    return pos; }

  // 작은 시계열 패널 (모양만 나타내는 예시 곡선)
  const wave = (y, h, i, seed) => { const v = Math.sin(i * 0.32 + seed) * 0.24 + Math.sin(i * 0.85 + seed * 2) * 0.1 + Math.sin(i * 2.3 + seed) * 0.04; return y + h / 2 - v * Math.min(h, 90); };
  function spark(x, y, w, h, seed, col, u, o) { o = o || {}; if (u <= 0) return; const n = 40, m = Math.max(2, Math.round(n * clamp(u)));
    const pts = []; for (let i = 0; i < m; i++) { const f = i / (n - 1); pts.push([x + f * w, wave(y, h, i, seed)]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': o.sw || 2.4, 'stroke-linejoin': 'round', opacity: o.op ?? 1 }); }
  function panel(x, y, w, h, p, o) { o = o || {}; const col = COL[p.color] || WARN, op = o.op ?? 1, s = o.s ?? 1;
    const g = R.G(x + w / 2, y + h / 2, s, op), gx = -w / 2, gy = -h / 2;
    el('rect', { x: gx, y: gy, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.stroke ? 2.2 : 1.6 }, g);
    tx(gx + 12, gy + 22, o.title ?? p.title, { 'font-size': o.fs || 15, 'font-weight': 700, fill: p.color === 'red' ? BAD : INK }, g);
    if (o.badge) mono(gx + w - 10, gy + 22, o.badge, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g);
    if (h >= 80 && p.value && p.value !== '—' && p.color !== 'red')
      spark2(g, gx + 12, gy + 34, w - (o.noVal ? 24 : 90), h - 50, (p.id || 1) * 1.7, col, o.u ?? 1);
    if (!o.noVal && p.value) mono(gx + w - 12, gy + h - 14, (o.val ?? p.value), { 'font-size': o.vfs || 20, 'font-weight': 800, fill: col, 'text-anchor': 'end' }, g);
    return g; }
  function spark2(g, x, y, w, h, seed, col, u) { if (u <= 0) return; const n = 40, m = Math.max(2, Math.round(n * clamp(u))), pts = [];
    for (let i = 0; i < m; i++) { const f = i / (n - 1); pts.push([x + f * w, wave(y, h, i, seed)]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g); }
  // 열린 드롭다운 목록
  function ddList(x, y, w, opts, sel, o) { o = o || {}; const rh = o.rh || 30, n = opts.length, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: rh * n + 10, rx: 7, fill: PANEL, stroke: INK, 'stroke-width': 1.6, opacity: op });
    opts.forEach((s, i) => { const yy = y + 5 + i * rh, on = Array.isArray(sel) ? sel.includes(s) : sel === s, a = o.rowOp ? o.rowOp(i) : 1;
      if (a <= 0) return;
      if (on) el('rect', { x: x + 4, y: yy + 1, width: w - 8, height: rh - 2, rx: 5, fill: ACCBG, opacity: a * op });
      if (o.box) { el('rect', { x: x + 12, y: yy + rh / 2 - 7, width: 14, height: 14, rx: 3, fill: on ? ACC : PANEL, stroke: on ? ACC : MUT, 'stroke-width': 1.6, opacity: a * op });
        if (on) el('path', { d: `M${x + 15},${yy + rh / 2} l3,4 l6,-8`, stroke: PANEL, 'stroke-width': 2, fill: 'none', opacity: a * op }); }
      mono(x + (o.box ? 36 : 14), yy + rh / 2 + 5, s, { 'font-size': 14.5, 'font-weight': on ? 800 : 500, fill: on ? ACC : INK, opacity: a * op }); });
    return (i) => [x + w / 2, y + 5 + i * rh + rh / 2]; }
  function spinner(cx, cy, r, t, op) { const a = t * 6; el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3, opacity: op ?? 1 });
    el('path', { d: `M${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a + 1.6)},${cy + r * Math.sin(a + 1.6)}`, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: op ?? 1 }); }
  const panelsOf = (b) => b.panels || [];
  const valOf = (c, i) => { const p = panelsOf(c.beat)[i] || {}, q = c.prev ? panelsOf(c.prev)[i] : null, n = +p.value;
    if (!isFinite(n)) return p.value; const pv = q && isFinite(+q.value) ? +q.value : n; return tween(pv, n, c.u).toFixed(2); };

  // ================= 1. 변수 5종 =================
  const SLOT = { datasource: '데이터소스 전환', custom: '고정 목록', query: '쿼리로 목록 생성', interval: '시간 구간', textbox: '자유 입력' };
  function s1(t, c) { const { k, u, beat: b } = c, vars = b.variables || [], prevN = c.prev ? names(c.prev) : [];
    const bar = varBar(c, 30, 34);
    if (!vars.length) { el('rect', { x: 30, y: 17, width: 470, height: 34, rx: 7, fill: 'none', stroke: GRID, 'stroke-dasharray': '6 5', 'stroke-width': 1.6 });
      tx(46, 40, '변수 손잡이가 놓일 자리 (아직 비어 있다)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) }); }
    // templating.list 칸 5개
    zone(30, 72, 400, 240, 'templating.list', { fill: SOFT });
    for (let i = 0; i < 5; i++) { const v = vars[i], y = 106 + i * 40, fresh = v && !prevN.includes(v.name) && k > 0;
      if (!v) { el('rect', { x: 46, y, width: 368, height: 32, rx: 6, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5', 'stroke-width': 1.5 }); continue; }
      const f = fresh ? E(u, 0.2, 0.9) : 1;
      el('rect', { x: 46, y, width: 368 * f, height: 32, rx: 6, fill: PANEL, stroke: fresh ? ACC : GRID, 'stroke-width': fresh ? 2 : 1.5 });
      if (f > 0.6) { mono(58, y + 21, v.name, { 'font-size': 14.5, 'font-weight': 800, fill: fresh ? ACC : INK });
        mono(170, y + 21, v.type, { 'font-size': 14, fill: INFO, 'font-weight': 700 }); tx(270, y + 21, SLOT[v.type] || '', { 'font-size': 13.5, fill: MUT }); } }
    // 패널
    const p = panelsOf(b)[0] || {};
    panel(470, 72, 460, 200, p, { badge: vars.find((v) => v.type === 'datasource') ? V(b, 'datasource').current : 'prometheus', val: valOf(c, 0) });
    tx(925, 296, '패널 값은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    // 쿼리
    const prevQ = c.prev ? c.prev.query : b.query, fresh = (b.query.match(/\$\w+/g) || []).filter((x) => !prevQ.includes(x));
    const pos = qline(30, 330, b.query, { hard: ['prod', 'web-01', '5m'], fresh, u });
    // 새 토큰: 손잡이에서 쿼리 자리로 날아간다
    fresh.forEach((tok) => { const nm = tok.slice(1), from = bar[nm]; if (from && pos[tok]) fly(from.cx, 50, pos[tok], 350, seg(u, 0.4, 1.2), tok, { mono: true }); });
    if (k === 0) note(30, 400, '값이 쿼리에 박혀 있다. 대상이 바뀌면 보드를 복제해야 한다', fade(u, 0.8), { fill: WARN });
    if (k === 1) { const d = bar.datasource; grow(d.x + d.w + 4, 34, 760, 34, E(u, 0.3, 0.8), ACC, { plain: true }); grow(760, 34, 760, 100, E(u, 0.8, 1.1), ACC);
      ddList(640, 104, 250, V(b, 'datasource').options, V(b, 'datasource').current, { op: fade(u, 1.0) });
      note(30, 400, '데이터소스를 바꾸면 같은 보드가 staging을 본다', fade(u, 1.6)); }
    if (k === 2) note(30, 400, 'prod 자리를 $env가 차지한다', fade(u, 1.5));
    if (k === 3) note(30, 400, '목록은 아직 비어 있다. 다음 Step에서 쿼리로 채운다', fade(u, 1.5), { fill: MUT });
    if (k === 4) note(30, 400, '마지막 하드코딩 5m도 $interval이 된다', fade(u, 1.5));
    if (k === 5) { const s = bar.search; if (s && Math.floor(t * 2) % 2 === 0) el('line', { x1: s.vx - 2, y1: 25, x2: s.vx - 2, y2: 43, stroke: INK, 'stroke-width': 2 });
      note(30, 400, 'textbox는 목록이 없다. 무엇이든 적지만 오타는 못 거른다', fade(u, 1.0)); }
    if (k === 6) { ['env', 'host', 'interval'].forEach((nm, i) => { const from = bar[nm], to = pos['$' + nm]; if (!from || !to) return;
        dot([[from.cx, 52], [from.cx, 320], [to, 334]], seg(u, 0.2 + i * 0.25, 1.2 + i * 0.25), ACC, 6);
        dot([[to, 330], [to, 300], [700, 280]], seg(u, 1.4 + i * 0.2, 2.2 + i * 0.2), ACC, 5); });
      note(30, 400, '손잡이를 돌리면 토큰이 바뀌고 패널이 다시 그려진다', fade(u, 1.8)); } }

  // ================= 2. label_values 쿼리 변수 =================
  const SER = [['0', 'web-01', 'prod'], ['1', 'web-01', 'prod'], ['0', 'web-02', 'prod'], ['0', 'web-03', 'prod']];
  const SER_X = [['0', '…', 'staging'], ['0', '…', 'dev']];
  function serRow(x, y, r, o) { o = o || {}; const fs = 13.5, cw = fs * CW, op = o.op ?? 1;
    const s1 = 'node_cpu_seconds_total{cpu="' + r[0] + '", instance="', s2 = r[1], s3 = '", env="' + r[2] + '"}';
    if (o.hi) el('rect', { x: x + s1.length * cw - 2, y: y - 14, width: s2.length * cw + 4, height: 19, rx: 3, fill: C.HL, opacity: op });
    mono(x, y, s1 + s2 + s3, { 'font-size': fs, fill: o.off ? OFF : INK, opacity: op, 'text-decoration': o.off ? 'line-through' : null });
    return x + s1.length * cw + s2.length * cw / 2; }
  function s2(t, c) { const { k, u, beat: b } = c, host = V(b, 'host'), opts = host.options || [];
    const bar = varBar(c, 30, 34);
    const q = k >= 3 && k < 5 ? 'label_values(node_cpu_seconds_total{env="prod"}, instance)' : 'label_values(node_cpu_seconds_total, instance)';
    // Query 필드
    el('rect', { x: 30, y: 70, width: 560, height: 40, rx: 8, fill: PANEL, stroke: INFO, 'stroke-width': 1.8 });
    mono(44, 96, 'Query', { 'font-size': 13.5, 'font-weight': 800, fill: INFO });
    if (k === 3) el('rect', { x: 100 + 'label_values(node_cpu_seconds_total'.length * 13.5 * CW - 2, y: 80, width: '{env="prod"}'.length * 13.5 * CW * E(u, 0.2, 0.8) + 4, height: 21, rx: 3, fill: C.HL });
    mono(100, 96, k === 0 ? typed(q, E(u, 0.2, 1.4)) : q, { 'font-size': 13.5, fill: INK });
    // 오른쪽: 드롭다운 + 패널
    const hb = bar.host;
    const p = panelsOf(b)[0] || {};
    if (k === 0) { spinner(660, 120, 10, t); note(680, 126, '$host 목록을 받는 중', fade(u, 0.6), { fill: MUT }); }
    if (k >= 1 && k !== 4) { const sel = host.current, at = ddList(640, 70, 200, opts, sel, { rowOp: (i) => (k === 1 ? fade(u, 1.2 + i * 0.25) : 1) });
      if (k === 2) { const i = opts.indexOf(sel), [px, py] = at(i); el('path', { d: `M${px + 60},${py + 2} l0,16 l4,-4 l5,8 l3,-2 l-5,-7 l6,0 z`, fill: INK, opacity: fade(u, 0.3) }); } }
    panel(640, 200, 290, 130, p, { val: valOf(c, 0), op: k === 0 ? 0.5 : 1 });
    tx(930, 352, '패널 값은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    // 왼쪽 아래: 시계열 목록 → 라벨 값 뽑기
    if (k === 4) { // 카디널리티
      const n = Math.round(E(u, 0.2, 2.0) * 180);
      for (let i = 0; i < n; i++) el('circle', { cx: 44 + (i % 30) * 18, cy: 140 + Math.floor(i / 30) * 22, r: 5, fill: i % 7 === 0 ? WARN : OFF });
      mono(30, 290, '옵션 ' + Math.round(tween(0, 3214, u, 1.9)).toLocaleString('en-US') + '개 (예시)', { 'font-size': 20, 'font-weight': 800, fill: BAD });
      [['Regex로 목록 좁히기', INFO], ['refresh: On dashboard load', INFO]].forEach(([s, col], i) => pill(150 + i * 250, 336, s, col, pop(u, 1.6 + i * 0.3), { mono: true, fs: 13.5 }));
      note(30, 400, '변수 쿼리도 쿼리다. 무거우면 보드 전체가 늦게 뜬다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 5) { // 치환
      const raw = 'instance="$host"', done = 'instance="' + host.current + '"', f = E(u, 0.6, 1.3);
      mono(30, 170, 'rate(node_cpu_seconds_total{env="$env", ', { 'font-size': 15, fill: MUT });
      const cur = f < 0.5 ? raw : done, sq = 1 - Math.abs(f - 0.5) * 2;   // 가운데서 접혔다 펴지며 바뀐다
      el('rect', { x: 28, y: 186 + 14 * sq, width: cur.length * 17 * CW + 6, height: 28 * (1 - sq) + 1, rx: 5, fill: f < 0.5 ? ACCBG : GOODBG });
      mono(31, 206, cur, { 'font-size': 17, 'font-weight': 800, fill: f < 0.5 ? ACC : GOOD, opacity: 1 - sq });
      mono(31 + cur.length * 17 * CW + 10, 206, '}[$interval])', { 'font-size': 15, fill: MUT });
      note(30, 270, '$host 자리에 고른 값이 들어간 쿼리가 나간다', fade(u, 1.5));
      note(30, 300, '서버가 늘면 목록도 저절로 따라온다', fade(u, 1.9), { fill: MUT }); return; }
    const rows = k === 3 ? SER.concat(SER_X) : SER;
    rows.forEach((r, i) => { const y = 150 + i * 30, off = r[2] !== 'prod';
      const op = k === 3 && i >= SER.length ? fade(u, 0.4 + (i - SER.length) * 0.2) : 1;
      const mid = serRow(30, y, r, { hi: k >= 1 && !off, off: off && k === 3 && u > 1.4, op });
      if (k === 1 && !off) { const j = opts.indexOf(r[1]); fly(590, y - 5, 740, 90 + j * 30, seg(u, 0.5 + i * 0.15, 1.2 + i * 0.15), r[1], { mono: true }); }
      if (off && k === 3) cross(565, y - 5, 7, pop(u, 1.4)); });
    if (k === 1) note(30, 300, '시계열 4개, instance 값은 3가지. 겹치는 값은 하나로 합친다', fade(u, 1.8));
    if (k === 2) note(30, 300, '고르는 즉시 같은 패널이 web-02를 그린다', fade(u, 1.0));
    if (k === 3) note(30, 340, 'env="prod" 셀렉터가 목록 자체를 좁힌다', fade(u, 1.6)); }

  // ================= 3. 다중 선택 · All · 정규식 =================
  const INST = ['web-01', 'web-02', 'web-03'];
  const selOf = (cur) => (cur === 'All' ? ['All'] : String(cur).split(' + '));
  function s3(t, c) { const { k, u, beat: b } = c, host = V(b, 'host'), multi = !!host.multi, res = (b.resolved || {}).host || '';
    const eq = !/=~/.test(b.query), sel = selOf(host.current);
    // 드롭다운
    chip(30, 34, 'host', host.current, { on: true });
    const opts = k >= 2 ? host.options : host.options;
    ddList(30, 60, 220, opts, sel, { box: multi, rowOp: (i) => (k === 1 ? fade(u, 0.2 + i * 0.15) : 1) });
    const tags = [];
    if (k >= 1) tags.push(['multi: true', ACC], ['includeAll: true', ACC], ['allValue: ".*"', ACC]);
    if (k >= 2) tags.push(['regex: /^web-.*/', INFO]);
    tags.forEach(([s, col], i) => pill(30 + (tw(s, 13.5) + 26) / 2, 216 + i * 34, s, col, k === 1 && i < 3 ? pop(u, 0.6 + i * 0.2) : k === 2 && i === 3 ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 }));
    // 치환 결과
    tx(290, 50, '$host가 바뀌는 값', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const fresh = c.prev && ((c.prev.resolved || {}).host !== res);
    el('rect', { x: 290, y: 62, width: 280, height: 44, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    if (k === 2 && fresh) { // 고른 값이 날아와 (a|b) 로 묶인다
      sel.forEach((s, i) => fly(140, 80 + opts.indexOf(s) * 30, 340 + i * 80, 84, seg(u, 0.3 + i * 0.3, 1.0 + i * 0.3), s, { mono: true }));
      mono(304, 91, typed(res, E(u, 1.3, 1.9)), { 'font-size': 18, 'font-weight': 800, fill: ACC });
    } else mono(304, 91, res, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fresh ? fade(u, 0.4) : 1 });
    // 일치 검사: 세 시계열의 instance 를 쿼리 연산자로 비교
    const op = eq ? '=' : '=~', reOk = (v) => { try { return new RegExp('^(?:' + res + ')$').test(v); } catch (e) { return false; } };
    mono(290, 140, 'instance' + op + '"' + res + '"', { 'font-size': 15, 'font-weight': 800, fill: eq ? BAD : INK });
    INST.forEach((v, i) => { const y = 160 + i * 40, ok = eq ? v === res : reOk(v), s = pop(u, 0.8 + i * 0.25);
      card(370, y + 16, 150, 32, { rx: 6, text: v, fs: 14.5, mono: true, stroke: ok ? GOOD : GRID, color: ok ? INK : MUT });
      if (ok) check(470, y + 16, 9, s); else cross(470, y + 16, 8, s); });
    if (eq) tx(290, 300, '괄호와 | 까지 글자로 비교한다', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.5) });
    // 패널: 일치한 시계열만 선이 된다
    const hit = eq ? INST.filter((v) => v === res) : INST.filter(reOk);
    el('rect', { x: 600, y: 34, width: 330, height: 270, rx: 8, fill: PANEL, stroke: eq ? BAD : GRID, 'stroke-width': eq ? 2.2 : 1.6 });
    tx(614, 58, 'CPU — $host', { 'font-size': 15, 'font-weight': 700 }); mono(916, 58, '선 ' + hit.length + '개', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    if (!hit.length) { tx(765, 175, 'No data', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(765, 200, '에러가 아니라 빈 그래프다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
    const pRes = c.prev ? (c.prev.resolved || {}).host : res, pEq = c.prev ? !/=~/.test(c.prev.query) : eq, same = pRes === res && pEq === eq;
    hit.forEach((v) => { const i = INST.indexOf(v), col = [WARN, INFO, GOOD][i];
      spark(620, 100 + i * 65, 220, 40, (i + 1) * 1.7, col, same ? 1 : Math.max(0.04, E(u, 1.0, 2.0)));
      mono(850, 125 + i * 65, v, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: same ? 1 : fade(u, 1.6) }); });
    if (k === 0) note(30, 400, '단일 선택: 한 번에 한 대만 볼 수 있다', fade(u, 1.0));
    if (k === 1) note(290, 400, 'All은 allValue 문자열 .* 로 바뀐다', fade(u, 1.6));
    if (k === 3) note(290, 400, '하나만 골라도 =~ 는 그대로 맞는다', fade(u, 1.6));
    if (k === 5) note(290, 400, '=~ 로 되돌리자 두 대가 함께 그려진다. allValue는 좁게', fade(u, 1.4)); }

  // ================= 4. 체인 변수 =================
  const DC = [['us-east', ['web-01', 'web-02']], ['us-west', ['web-11', 'web-12']], ['eu-central', ['…']]];
  function s4(t, c) { const { k, u, beat: b } = c, dcV = V(b, 'datacenter'), hostV = V(b, 'host'), cyc = b.chain && b.chain.parent === 'host';
    const dcCur = dcV.current, prevDc = c.prev ? V(c.prev, 'datacenter').current : dcCur;
    // 왼쪽: 데이터센터 → 호스트 나무
    tx(30, 34, 'node_cpu_seconds_total의 라벨', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    DC.forEach(([dc, hs], i) => { const y = 90 + i * 110, on = dc === dcCur && !cyc;
      card(100, y, 130, 38, { rx: 8, text: dc, fs: 15, mono: true, stroke: on ? ACC : GRID, fill: on ? ACCBG : PANEL, color: on ? ACC : INK, op: cyc ? 0.45 : 1 });
      hs.forEach((h, j) => { const yy = y - 18 + j * 38, hit = on && (hostV.options || []).includes(h);
        grow(166, y, 236, yy, 1, hit ? ACC : GRID, { plain: true, sw: hit ? 2.4 : 1.5 });
        card(290, yy, 104, 30, { rx: 6, text: h, fs: 14, mono: true, stroke: hit ? ACC : GRID, color: hit ? ACC : MUT, op: cyc ? 0.45 : 1 }); }); });
    // 오른쪽 위: 두 손잡이
    const d1 = chip(420, 40, 'datacenter', dcCur, { on: b.activeVar === 'datacenter', valCol: cyc ? BAD : null, stroke: cyc ? BAD : null });
    const h1 = chip(440 + d1.w, 40, 'host', hostV.current, { on: b.activeVar === 'host', valCol: /로딩/.test(hostV.current) ? MUT : null });
    // 자식 쿼리: $datacenter 가 부모 값으로 바뀐다
    const childQ = cyc ? ['label_values(node_cpu_seconds_total{instance="$host"},', '  datacenter)'] : ['label_values(node_cpu_seconds_total{datacenter="$datacenter"},', '  instance)'];
    tx(420, 92, cyc ? 'datacenter 변수의 쿼리 (잘못 만든 예)' : 'host 변수의 쿼리', { 'font-size': 14, 'font-weight': 700, fill: cyc ? BAD : MUT });
    childQ.forEach((s, i) => mono(420, 116 + i * 22, s, { 'font-size': 13.5, fill: INK }));
    if (!cyc && k >= 1) { const res = 'datacenter="' + dcCur + '"';
      el('rect', { x: 508, y: 125, width: res.length * 14.5 * CW + 6, height: 24, rx: 4, fill: GOODBG, opacity: fade(u, 0.3) });
      mono(511, 143, res, { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
      mono(511 + res.length * 14.5 * CW + 14, 143, '로 실행', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) }); }
    // 부모 → 자식 화살표
    if (!cyc) grow(420 + d1.w / 2, 60, 440 + d1.w + h1.w / 2 - 20, 60, k === 0 ? E(u, 1.0, 1.6) : 1, ACC);
    if (k === 0) { spinner(440 + d1.w + h1.w + 22, 40, 10, t); note(420, 200, 'host는 부모 값을 기다린다', fade(u, 1.2), { fill: MUT }); }
    if (k === 1) { (hostV.options || []).forEach((h, j) => dot([[340, 72 + j * 38], [400, 200], [440 + d1.w + 40, 56]], seg(u, 0.8 + j * 0.3, 1.8 + j * 0.3), ACC, 6)); }
    if (k === 2) { const sw = prevDc !== dcCur; if (sw) { spinner(440 + d1.w + h1.w + 22, 40, 10, t, 1 - seg(u, 1.2, 1.4));
        mono(420, 200, '목록 재로드: ' + (V(c.prev, 'host').options || []).join(', ') + ' → ' + (hostV.options || []).join(', '), { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); } }
    if (k === 3) { zone(420, 180, 300, 110, 'templating.list 순서', { fill: SOFT });
      [['1', 'datacenter'], ['2', 'host']].forEach(([n, s], i) => { card(470, 222 + i * 38, 34, 28, { rx: 6, text: n, fs: 14, mono: true, s: pop(u, 0.3 + i * 0.3) }); mono(500, 228 + i * 38, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) }); });
      grow(660, 216, 660, 266, E(u, 1.0, 1.5), ACC); note(740, 246, '부모가 위', fade(u, 1.5)); }
    if (k === 4) { const a = E(u, 0.3, 1.2);
      el('path', { d: `M${420 + d1.w * 0.5},60 C${420 + d1.w * 0.5},80 ${440 + d1.w + h1.w * 0.5},80 ${440 + d1.w + h1.w * 0.5},60`, fill: 'none', stroke: BAD, 'stroke-width': 2.6, 'stroke-dasharray': '7 5', opacity: a, 'marker-end': 'url(#ra-ahr)' });
      el('path', { d: `M${440 + d1.w + h1.w * 0.5},21 C${440 + d1.w + h1.w * 0.5},2 ${420 + d1.w * 0.5},2 ${420 + d1.w * 0.5},21`, fill: 'none', stroke: BAD, 'stroke-width': 2.6, 'stroke-dasharray': '7 5', opacity: a, 'marker-end': 'url(#ra-ahr)' });
      note(420, 200, '서로 상대 값이 먼저 있어야 목록을 정한다', fade(u, 1.4), { fill: BAD }); }
    if (k === 5) { zone(420, 172, 510, 130, '부모가 바뀔 때마다 자식 쿼리가 다시 돈다', { fill: SOFT });
      [['datacenter', 3, GOOD, '값 3개: 다시 도는 일이 드물다'], ['host를 부모로', 40, BAD, '값이 많을수록 자주 다시 돈다']].forEach(([s, n, col, d], i) => { const y = 214 + i * 44;
        mono(436, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: col }); const m = Math.round(n * E(u, 0.3 + i * 0.4, 1.4 + i * 0.4));
        for (let j = 0; j < m; j++) el('circle', { cx: 580 + (j % 40) * 8, cy: y, r: 3.2, fill: col });
        tx(580, y + 22, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2 + i * 0.4) }); }); }
    // 패널
    const p = panelsOf(b)[0] || {};
    panel(420, 316, 510, 86, p, { val: valOf(c, 0) });
    if (k === 4) cross(900, 340, 9, pop(u, 1.0)); }

  // ================= 5. repeat =================
  function s5(t, c) { const { k, u, beat: b } = c, ps = panelsOf(b), prevPs = c.prev ? panelsOf(c.prev) : ps;
    const bar = varBar(c, 30, 30);
    const tags = []; if (k >= 1) tags.push('repeat: "host"'); if (k >= 2) tags.push('repeatDirection: "h"', 'maxPerRow: 3');
    let tx0 = 930; tags.slice().reverse().forEach((s, i) => { const w = tw(s, 13.5) + 26; tx0 -= w; pill(tx0 + w / 2, 360, s, ACC, (k === 1 && s.startsWith('repeat:')) || (k === 2 && i < 2) ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 }); tx0 -= 8; });
    // 24칸 격자 자
    const X0 = 30, W = 900, cw = W / 24;
    for (let i = 0; i <= 24; i++) el('line', { x1: X0 + i * cw, y1: 62, x2: X0 + i * cw, y2: i % 6 ? 68 : 72, stroke: MUT, 'stroke-width': 1.2 });
    mono(X0 + W, 88, '대시보드 폭 24칸', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (k === 4) { // 20대 → 7줄
      const n = 20, per = 3, rows = Math.ceil(n / per), m = Math.round(E(u, 0.2, 1.8) * n), pw = W / per;
      for (let i = 0; i < m; i++) { const r = Math.floor(i / per), cl = i % per; el('rect', { x: X0 + cl * pw + 3, y: 96 + r * 36, width: pw - 6, height: 30, rx: 5, fill: i >= 3 ? BADBG : PANEL, stroke: i >= 3 ? BAD : GRID, 'stroke-width': 1.4 });
        mono(X0 + cl * pw + 14, 116 + r * 36, 'CPU — host ' + (i + 1), { 'font-size': 13.5, fill: i >= 3 ? BAD : INK }); }
      banner(480, 400, '20개 ÷ maxPerRow 3 = ' + rows + '줄, 패널 20개를 한꺼번에 그린다', pop(u, 1.9)); return; }
    const n = ps.length, pn = prevPs.length, per = k >= 2 ? 3 : 4, prevPer = k >= 3 ? 3 : 4, h = 190, mv = k > 0 && n !== pn ? E(u, 0.4, 1.2) : 1;
    const pw = W / Math.min(n, per), ow = W / Math.min(pn, prevPer);
    ps.forEach((p, i) => { const isNew = i >= pn && k > 0, f = isNew ? Math.max(0.15, E(u, 0.4 + (i - pn) * 0.3, 1.2 + (i - pn) * 0.3)) : 1;
      const ox = X0 + Math.min(i, pn - 1) * ow, x = lerp(ox, X0 + i * pw, mv), w = lerp(ow, pw, mv);
      const title = k === 0 ? (u < 1.2 ? 'CPU — $host' : p.title) : p.title;
      panel(x + 4, 100, w - 8, h, p, { title, val: valOf(c, i), op: f, stroke: isNew ? ACC : null });
      if (k === 3 || k === 5) { lock(x + 24, 316, true, ACC, pop(u, 0.4 + i * 0.2)); mono(x + 42, 322, '$host = ' + p.title.split('— ')[1], { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5 + i * 0.2) }); } });
    if (k === 0) { el('rect', { x: X0 + 70, y: 106, width: 70, height: 24, rx: 4, fill: ACC, opacity: 0.25 * (1 - fade(u, 1.2)) }); note(30, 400, '제목의 $host도 고른 값으로 바뀐다', fade(u, 1.4)); }
    if (k === 1) note(30, 400, '두 대를 고르니 패널 정의 하나가 두 개로 펼쳐진다', fade(u, 1.4));
    if (k === 2) note(30, 400, '가로로 한 줄에 최대 3개. 세 대면 정확히 한 줄이다', fade(u, 1.4));
    if (k === 3) { const iv = bar.interval; if (iv) ps.forEach((p, i) => dot([[iv.cx, 48], [30 + (i + 0.5) * pw, 100]], seg(u, 0.2 + i * 0.15, 1.0 + i * 0.15), INFO, 6));
      note(30, 400, '$interval은 모든 복제본에 함께, $host는 복제본마다 따로', fade(u, 1.4)); }
    if (k === 5) note(30, 400, '패널 하나의 정의가 고른 대상 수만큼 펼쳐진다', fade(u, 1.4)); }

  // ================= 6. URL 공유 =================
  function miniBoard(x, y, w, b, o) { o = o || {}; const ps = panelsOf(b), op = o.op ?? 1;
    browser(x + w / 2, y + 100, w, 200, null, { op });
    let cx = x + 12; ['env', 'host'].forEach((nm) => { const v = V(b, nm); if (!v.name) return;
      const r = chip(cx, y + 48, nm, v.current === 'web-01 + web-02 + web-03' ? 'web-01..03' : v.current, { op: op * (o.chipOp ?? 1) }); cx += r.w + 8; });
    const n = Math.max(1, ps.length), pw = (w - 24) / n;
    ps.forEach((p, i) => panel(x + 12 + i * pw + 2, y + 76, pw - 4, 112, p, { op: op * (o.panelOp ? o.panelOp(i) : 1), fs: n > 2 ? 13.5 : 15, title: n > 2 ? p.title.split('— ')[1] : p.title, vfs: 16, noVal: n > 2 })); }
  function s6(t, c) { const { k, u, beat: b } = c, url = b.shareUrl || '', prevUrl = c.prev ? c.prev.shareUrl : url;
    const [base, qs] = url.split('?'), params = qs ? qs.split('&') : [], prevParams = (prevUrl.split('?')[1] || '').split('&').filter(Boolean);
    tx(30, 26, '내 화면', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(510, 26, '링크를 받은 동료 화면', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    if (k === 6) { // 팀별 복제 보드 vs 템플릿 하나
      ['팀 A 복사본', '팀 B 복사본', '팀 C 복사본'].forEach((s, i) => { const x = 40 + i * 150, s0 = pop(u, 0.2 + i * 0.2);
        card(x + 65, 120, 130, 90, { rx: 8, stroke: GRID, s: s0, text: s + '\n따로 고친 판', fs: 14 }); });
      [0, 1, 2].forEach((i) => cross(165 + i * 150, 75, 9, pop(u, 1.0 + i * 0.15)));
      note(40, 210, '고칠 때마다 세 군데가 따로 바뀐다', fade(u, 1.2), { fill: BAD });
      card(720, 120, 200, 90, { rx: 8, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'Node Health\n템플릿 하나', fs: 15, color: ACC, s: pop(u, 1.4) });
      ['var-env=prod', 'var-host=web-01'].forEach((s, i) => fly(720, 170, 600 + i * 240, 260, seg(u, 1.7 + i * 0.2, 2.4 + i * 0.2), s, { mono: true, stay: true }));
    } else {
      miniBoard(30, 40, 450, b);
      const arrive = seg(u, 1.4, 2.0), same = params.length > 0;
      miniBoard(510, 40, 420, same ? b : { variables: [], panels: [] }, { op: same ? (url !== prevUrl ? Math.max(0.25, arrive) : 1) : 0.35 });
      if (!same) { tx(720, 150, '?', { 'font-size': 40, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        tx(720, 190, '상태가 없는 링크라 무엇을 볼지 모른다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); }
      if (url !== prevUrl && same) fly(480, 300, 720, 150, seg(u, 0.8, 1.5), '링크', {});
    }
    // 주소 줄: 파라미터가 하나씩 붙는다
    const y = 286; el('rect', { x: 30, y, width: 900, height: 44, rx: 22, fill: PANEL, stroke: INK, 'stroke-width': 1.8 });
    const fs = 15; let x = 54; mono(x, y + 28, base + (params.length ? '?' : ''), { 'font-size': fs, 'font-weight': 700 }); x += (base.length + (params.length ? 1 : 0)) * fs * CW;
    let same0 = 0; while (same0 < params.length && params[same0] === prevParams[same0]) same0++;
    params.forEach((pp, i) => { const isNew = i >= same0, s = isNew && k > 0 ? fade(u, 0.2 + (i - same0) * 0.3, 0.3) : 1;
      const txt = (i ? '&' : '') + pp, [kk, vv] = pp.split('='), w = txt.length * fs * CW;
      if (isNew && k > 0) el('rect', { x: x - 2, y: y + 10, width: w + 4, height: 25, rx: 4, fill: ACCBG, opacity: s });
      spans(x, y + 28, [[(i ? '&' : ''), { fill: MUT }], [kk + '=', { fill: INFO, 'font-weight': 700 }], [vv, { fill: vv === '$__all' ? WARN : ACC, 'font-weight': 800 }]], { 'font-size': fs, opacity: s });
      x += w; });
    const msg = ['변수 값이 주소에 없으면 받은 사람은 같은 화면을 못 본다', '변수마다 var-이름=값 하나씩', '여러 값은 같은 이름을 되풀이한다', 'env만 staging으로 바꾼 같은 보드', 'All을 고르면 var-host=$__all', 'repeat와 =~ 덕에 세 대가 세 패널로', '보드는 하나, 링크는 여럿'][k];
    note(30, 380, msg, fade(u, 1.0), { fill: k === 0 ? WARN : INK }); }

  const quiz = [
    { q: '쿼리의 prod를 $env로 바꾸기 위해 대시보드에 만드는 custom 변수는 무엇인가?',
      o: ['데이터소스를 통째로 바꾸는 손잡이', '직접 적어 둔 고정 목록(prod, staging, dev)', '아무 문자열이나 받는 자유 입력 칸'], a: 1,
      why: 'custom은 "prod, staging, dev" 처럼 값을 직접 적은 목록이다. 데이터소스 전환은 datasource, 자유 입력은 textbox가 맡는다.' },
    { q: 'label_values(node_cpu_seconds_total, instance)는 드롭다운에 무엇을 채우는가?',
      o: ['그 메트릭의 instance 라벨 값들', '그 메트릭의 최근 값', '대시보드에 있는 패널 이름'], a: 0,
      why: '시계열 4개에 instance 값이 web-01·web-02·web-03 세 가지라면 옵션도 그 세 개다. 서버가 늘면 목록도 따라 늘어난다.' },
    { q: 'host를 web-01, web-02 두 개 골랐을 때 instance="$host"(등호)로 쓴 패널이 빈 그래프가 되는 까닭은 무엇인가?',
      o: ['다중 선택이 켜지면 Prometheus가 쿼리를 거부해서', 'host 변수가 목록을 아직 못 받아서', '$host가 (web-01|web-02)로 바뀌는데 = 는 이를 글자 그대로 비교해서'], a: 2,
      why: '= 는 괄호와 | 까지 문자열로 비교하므로 맞는 instance가 없다. =~ 로 쓰면 web-01, web-02 두 대가 맞는다.' },
    { q: 'host 변수 쿼리에 {datacenter="$datacenter"}를 넣은 뒤 datacenter를 us-west로 바꾸면 무슨 일이 일어나는가?',
      o: ['host 목록은 그대로고 패널만 바뀐다', 'host 쿼리가 다시 돌아 목록이 web-11, web-12로 바뀐다', 'datacenter 목록이 비어 버린다'], a: 1,
      why: '부모 값이 자식 쿼리의 필터로 들어가므로 부모가 바뀌면 자식 목록을 다시 불러온다. us-east일 때는 web-01, web-02 였다.' },
    { q: 'repeat: "host", maxPerRow 3인 패널에서 host를 세 대 고르면 화면은 어떻게 되는가?',
      o: ['패널 하나에 선 세 개가 겹친다', '패널 세 개가 세로로 한 줄씩 쌓인다', '패널 세 개가 가로 한 줄에 놓이고 각자 자기 $host를 쓴다'], a: 2,
      why: '가로 방향이고 한 줄에 최대 3개라 세 복제본이 한 줄을 채운다. 각 복제본 안에서 $host는 web-01, web-02, web-03으로 고정된다.' },
    { q: '동료에게 web-01과 web-02를 함께 고른 화면을 보내려면 URL에 무엇이 있어야 하는가?',
      o: ['var-host=web-01&var-host=web-02', 'var-host=web-01|web-02', 'host=web-01,web-02'], a: 0,
      why: '변수는 var-이름=값으로 실리고, 여러 값은 같은 파라미터를 되풀이한다. 받은 사람은 같은 두 패널을 본다.' },
  ];

  const summary = [
    '값을 쿼리에 박으면 대상이 바뀔 때마다 대시보드를 복제하게 된다.',
    '변수를 만들고 쿼리에 $env, $host 같은 토큰을 심으면 손잡이 하나로 모든 패널이 바뀐다.',
    'query 변수는 label_values로 목록을 만들고, 체인은 부모 값을 자식 쿼리 필터로 넣는다.',
    '다중 선택은 (web-01|web-02)가 되므로 =~를 쓰고, 상태는 var-host=web-01 같은 URL로 공유한다.',
  ];
  const review = [
    { q: 'host에 multi와 includeAll을 켠 뒤 All을 고르자 대시보드가 느려졌다. allValue는 .* 이다. 먼저 바꿀 것은?',
      o: ['instance=~ 를 instance= 로 바꾼다', 'allValue를 대상만 맞는 좁은 정규식으로 바꾼다', 'repeat를 켜서 패널을 나눈다'], a: 1,
      why: 'All은 allValue 문자열로 바뀔 뿐이라 .* 이면 모든 instance를 훑는다. = 로 바꾸면 다중 선택이 0건이 된다.' },
    { q: 'repeat: "host" 패널에 All을 걸었더니 host가 20대라 패널 20개가 7줄로 그려지며 화면이 멈췄다. 알맞은 조치는?',
      o: ['maxPerRow를 1로 줄인다', '$interval을 1h로 늘린다', 'datacenter 같은 부모 변수로 host 목록을 좁히고 고를 수 있는 개수를 줄인다'], a: 2,
      why: '복제본 수는 고른 값 수와 같다. 체인으로 목록을 좁히면 고를 대상과 패널이 함께 준다.' },
    { q: '장애 채널에 /d/node-health 링크만 올렸더니 동료가 다른 서버를 보고 있었다. 무엇이 빠졌나?',
      o: ['var-env=prod&var-host=web-01 같은 변수 파라미터', '대시보드 JSON의 panels 배열', 'host 변수의 regex'], a: 0,
      why: '변수 상태는 URL 쿼리스트링에 실린다. 파라미터가 없으면 받은 사람은 저장된 기본값으로 보드를 연다.' },
  ];

  R.page({ title: '변수가 쿼리에 끼워지는 과정', scenes: [s1, s2, s3, s4, s5, s6].map(M), quiz, summary, review });
})();
