/* II-1-1 Prometheus — 메트릭 시각화 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 시계열 모양은 페이지 STEPS 의 series(base·amp·wave)를 예전 패널과 같은 식으로 그린다. 값 축 숫자는 없다(모양만).
 * step 계산·histogram 분위수 숫자는 예시이며 python 으로 다시 계산해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const SER = { green: GOOD, blue: INFO, red: BAD, orange: WARN, purple: ACC };
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 시계열 값 (예전 TimeseriesPanel 과 같은 식, 0~100 눈금) ----------
  const N = 40;
  function rateVals(s) { const out = [];
    for (let i = 0; i < N; i++) { const t = i / (N - 1), noise = Math.sin(i * (1.7 + s.wave)) * (s.amp * 0.25), swell = Math.sin(t * Math.PI * (1 + s.wave * 0.6) + s.wave) * s.amp;
      out.push(clamp(s.base + swell + noise, 2, 98)); } return out; }
  // counter = 초당 값을 쌓은 누적값 → 오른쪽으로 갈수록 커진다
  function cumVals(s, top) { const r = rateVals({ base: 30, amp: 10, wave: s.wave }); let acc = 0; const cs = r.map((v) => (acc += v)), m = cs[cs.length - 1];
    return cs.map((v) => 6 + (top - 6) * v / m); }
  const mix = (a, b, m) => a.map((v, i) => lerp(v, b[i], m));
  function plot(bx, vals, u, col, o) { o = o || {}; if (u <= 0) return; const n = vals.length, k = clamp(u) * (n - 1), i = Math.floor(k);
    const P = (j, v) => [bx.x + (j / (n - 1)) * bx.w, bx.y + bx.h - (v / 100) * bx.h];
    const ps = vals.slice(0, i + 1).map((v, j) => P(j, v)); if (i < n - 1) { const f = k - i; ps.push(P(i + f, lerp(vals[i], vals[i + 1], f))); }
    el('polyline', { points: ps.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': o.sw || 2.6, 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }
  const yAt = (bx, v) => bx.y + bx.h - (v / 100) * bx.h, xAt = (bx, j) => bx.x + (j / (N - 1)) * bx.w;
  function tsBox(bx, o) { o = o || {};
    [0.25, 0.5, 0.75].forEach((g) => el('line', { x1: bx.x, y1: bx.y + bx.h * g, x2: bx.x + bx.w, y2: bx.y + bx.h * g, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '3 4' }));
    el('line', { x1: bx.x, y1: bx.y + bx.h, x2: bx.x + bx.w, y2: bx.y + bx.h, stroke: MUT, 'stroke-width': 1.6 });
    if (o.ticks !== false) [['-1h', 0], ['-30m', 0.5], ['now', 1]].forEach(([s, f]) => mono(bx.x + bx.w * f, bx.y + bx.h + 19, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': f === 0 ? 'start' : f === 1 ? 'end' : 'middle' })); }
  // Grafana 패널 틀: 제목 막대 + 본문
  function frame(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, opacity: o.op ?? 1 });
    if (title) tx(x + 14, y + 22, title, { 'font-size': 15, 'font-weight': 700, opacity: o.op ?? 1 });
    if (o.right) mono(x + w - 12, y + 22, o.right, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: o.op ?? 1 }); }
  // 쿼리 에디터 한 줄 (어두운 판 + refId)
  function qbar(x, y, w, text, o) { o = o || {};
    el('rect', { x, y, width: w, height: 40, rx: 8, fill: INK, opacity: o.op ?? 1 });
    mono(x + 14, y + 26, o.ref || 'A', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: o.op ?? 1 });
    if (text) mono(x + 38, y + 26, text, { 'font-size': o.fs || 14, fill: PANEL, opacity: o.op ?? 1 });
    else mono(x + 38, y + 26, o.empty || '쿼리를 입력하세요', { 'font-size': 14, fill: OFF, opacity: o.op ?? 1 }); }
  function legend(x, y, items, o) { o = o || {}; const lh = o.lh || 22;
    items.forEach(([name, col], i) => { const op = o.op ? o.op(i) : 1; if (op <= 0) return;
      el('rect', { x, y: y + i * lh - 10, width: 13, height: 13, rx: 2, fill: col, opacity: op });
      mono(x + 21, y + i * lh + 2, name, { 'font-size': 13.5, fill: o.raw ? MUT : INK, 'font-weight': o.raw ? 400 : 700, opacity: op }); }); }

  // ================= 1. 데이터소스 · counter · rate =================
  const B1 = { x: 66, y: 120, w: 560, h: 150 };
  function s1(t, c) { const { k, u, beat: b } = c, p = c.prev || {};
    // 데이터소스 선택 칩 + 쿼리 에디터
    const dsS = k === 0 ? pop(u, 0.2) : 1;
    card(110, 46, 140, 40, { rx: 8, text: 'Prometheus ▾', fs: 15, fw: 700, stroke: WARN, color: WARN, fill: WARNBG, s: dsS });
    const qtext = b.query, prevQ = p.query || '';
    qbar(190, 26, 470, k === 0 ? '' : typed(qtext, qtext === prevQ ? 1 : seg(u, 0.1, 0.9)), { fs: 14 });
    // 패널
    frame(40, 84, 620, 300, '요청 처리율', { right: 'last 1h · range' });
    tsBox(B1);
    // 오른쪽: Prometheus 저장소와 연결선
    const ds = k === 0 ? E(u, 0.6, 1.6) : 1;
    el('line', { x1: 660, y1: 160, x2: lerp(660, 760, ds), y2: 160, stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '6 5' });
    dbIcon(820, 160, 'Prometheus', { stroke: WARN, s: k === 0 ? pop(u, 0.5) : 1 });
    if (k === 0) { sub(350, 210, '쿼리가 없어 그릴 것이 없다', fade(u, 1.6), { 'font-size': 15 });
      sub(820, 250, '쿼리를 보낼 곳', fade(u, 1.4), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    const sers = b.series;
    // 범례
    const raw = sers.map((s) => [s.name, SER[s.color]]);
    if (k === 1) { // 원본 counter: 누적이라 계속 올라간다
      sers.forEach((s, i) => plot(B1, cumVals(s, s.base), E(u, 0.6 + i * 0.2, 2.2 + i * 0.2), SER[s.color]));
      legend(70, 318, raw, { raw: true, op: (i) => fade(u, 1.2 + i * 0.25) });
      dot([[660, 160], [760, 160]].reverse(), seg(u, 0.1, 0.6), WARN, 6);
      note(700, 300, '계속 올라가기만 한다', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 2) { // [5m] 창이 counter 위를 지나며 기울기를 잰다 → rate 곡선으로 바뀐다
      const win = 0.12, pos = lerp(0.08, 0.86, E(u, 0.1, 1.3)), m = E(u, 1.4, 2.5), cum = cumVals(sers[0], p.series ? p.series[0].base : 84);
      sers.forEach((s, i) => { const prevS = (p.series || [])[i] || s; plot(B1, mix(cumVals(s, prevS.base), rateVals(s), m), 1, SER[s.color], { op: 0.35 + 0.65 * m }); });
      if (u < 1.5) { const x0 = B1.x + B1.w * pos, x1 = B1.x + B1.w * (pos + win);
        el('rect', { x: x0, y: B1.y, width: x1 - x0, height: B1.h, fill: WARNBG, opacity: 0.8 });
        const j0 = Math.round(pos * (N - 1)), j1 = Math.round((pos + win) * (N - 1));
        el('line', { x1: xAt(B1, j0), y1: yAt(B1, cum[j0]), x2: xAt(B1, j1), y2: yAt(B1, cum[j1]), stroke: WARN, 'stroke-width': 3.5 });
        mono(x0 + 4, B1.y + 16, '[5m]', { 'font-size': 14, 'font-weight': 800, fill: WARN }); }
      card(820, 300, 210, 64, { rx: 10, text: '늘어난 양 ÷ 300초\n= 초당 증가율', fs: 14.5, stroke: WARN, s: pop(u, 0.4) });
      legend(70, 318, raw, { raw: true }); return; }
    if (k === 3) { // 창을 [1m] 로 줄이면 곡선이 뾰족해진다
      sers.forEach((s, i) => { const ps = (p.series || [])[i] || s; plot(B1, rateVals({ base: s.base, amp: tween(ps.amp, s.amp, u), wave: s.wave }), 1, SER[s.color]); });
      const wv = tween(0.12, 0.024, u, 1.2), x0 = B1.x + B1.w * 0.5;
      el('rect', { x: x0, y: B1.y, width: B1.w * wv, height: B1.h, fill: WARNBG, opacity: 0.85 });
      mono(x0 + 4, B1.y - 6, u < 0.8 ? '[5m]' : '[1m]', { 'font-size': 14, 'font-weight': 800, fill: WARN });
      [['[1m]', '뾰족 · 스파이크가 보인다', BAD], ['[10m]', '완만 · 추세만 남는다', INFO]].forEach(([a, d, col], i) => {
        const y = 262 + i * 54, s = pop(u, 1.0 + i * 0.4); card(820, y, 220, 44, { rx: 8, stroke: col, s }); mono(726, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.1 + i * 0.4) });
        tx(774, y + 5, d, { 'font-size': 13.5, opacity: fade(u, 1.1 + i * 0.4) }); });
      legend(70, 318, raw, { raw: true }); return; }
    // k4: label 조합만큼 선이 생긴다
    sers.forEach((s) => plot(B1, rateVals(s), 1, SER[s.color]));
    legend(70, 318, raw, { raw: true });
    const hx = 688, cols = [['job', 52], ['instance', 104], ['status', 62]];
    let cx = hx + 20; cols.forEach(([h, w]) => { tx(cx + w / 2, 268, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) }); cx += w + 4; });
    sers.forEach((s, i) => { const y = 278 + i * 36, sc = pop(u, 0.4 + i * 0.35), m = s.name.match(/job="([^"]*)", instance="([^"]*)", status="([^"]*)"/) || [];
      el('rect', { x: hx, y: y + 9, width: 13, height: 13, rx: 2, fill: SER[s.color], opacity: sc > 0 ? 1 : 0 });
      let x = hx + 20; cols.forEach(([, w], j) => { card(x + w / 2, y + 16, w, 32, { rx: 5, text: m[j + 1] || '', fs: 13.5, mono: true, stroke: GRID, s: sc }); x += w + 4; }); });
    note(700, 404, '조합 3개 = 선 3개', fade(u, 1.8), { fill: ACC, 'font-weight': 800 }); }

  // ================= 2. sum by =================
  const B2 = { x: 520, y: 92, w: 400, h: 190 };
  const COLS = [['job', 70], ['instance', 120], ['status', 80]];
  function labRow(x, y, vals, col, o) { o = o || {}; let cx = x + 22;
    el('rect', { x, y: y + 10, width: 13, height: 13, rx: 2, fill: col, opacity: o.op ?? 1 });
    COLS.forEach(([h, w], j) => { const gone = o.gone && o.gone(j); card(cx + w / 2, y + 17, w, 34, { rx: 5, text: vals[j], fs: 14, mono: true, stroke: gone ? GRID : INK, color: gone ? OFF : INK, sw: 1.6, op: (o.op ?? 1) * (gone ? o.goneOp ?? 1 : 1) });
      if (gone && o.strike) el('line', { x1: cx + 8, y1: y + 17, x2: cx + w - 8, y2: y + 17, stroke: BAD, 'stroke-width': 2.4, opacity: o.strike }); cx += w + 6; }); }
  function heads(x, y, st) { let cx = x + 22; COLS.forEach(([h, w], j) => { const s = st ? st(j) : {}; tx(cx + w / 2, y, h, { 'font-size': 15, 'font-weight': 700, fill: s.col || MUT, 'text-anchor': 'middle' }); if (s.mark === 'x') cross(cx + w / 2 + tw(h, 15) / 2 + 14, y - 5, 7); if (s.mark === 'v') check(cx + w / 2 + tw(h, 15) / 2 + 14, y - 5, 7); cx += w + 6; }); }
  const RAW3 = [['api', '10.0.0.1', '200', 'green'], ['api', '10.0.0.2', '200', 'blue'], ['api', '10.0.0.1', '500', 'red']];
  function s2(t, c) { const { k, u, beat: b } = c, p = c.prev || {};
    if (k === 4) return s2ops(t, c);
    frame(500, 60, 440, 310, null); tsBox(B2);
    const x0 = 40;
    if (k === 0) { heads(x0, 84);
      RAW3.forEach((r, i) => labRow(x0, 104 + i * 50, r, SER[r[3]], { op: fade(u, 0.2 + i * 0.25) }));
      b.series.forEach((s, i) => plot(B2, rateVals(s), E(u, 0.4 + i * 0.25, 1.8 + i * 0.25), SER[s.color]));
      card(x0 + 160, 290, 300, 44, { rx: 22, text: '서버마다 선이 갈라진다', fs: 15, stroke: WARN, color: WARN, s: pop(u, 1.8) }); return; }
    // k ≥ 1: instance 를 접어 200 두 줄을 합친다
    const m = k === 1 ? E(u, 0.6, 1.8) : 1;
    heads(x0, 84, (j) => (j === 1 ? { col: k >= 2 ? BAD : MUT, mark: k >= 2 ? 'x' : null } : { col: k >= 2 ? GOOD : MUT, mark: k >= 2 ? 'v' : null }));
    const ys = [lerp(104, 129, m), lerp(154, 129, m), lerp(204, 194, m)];
    RAW3.forEach((r, i) => { if (i === 1 && m >= 1) return;
      labRow(x0, ys[i], i === 0 && m >= 1 ? ['api', '', '200'] : i === 2 && m >= 1 ? ['api', '', '500'] : r, i === 0 && m > 0.5 ? GOOD : SER[r[3]], { op: i === 1 ? Math.pow(1 - m, 2) : 1, gone: (j) => j === 1, goneOp: 1 - m, strike: k === 1 ? fade(u, 0.2) * (1 - m) : 0 }); });
    if (k === 1 && m > 0.3 && m < 1) mono(x0 + 300, 150, '+', { 'font-size': 24, 'font-weight': 800, fill: GOOD, opacity: 1 - m });
    // 선: 앞 beat 3줄에서 2줄로
    if (k === 1) { const prevS = p.series, merged = rateVals(b.series[0]);
      plot(B2, mix(rateVals(prevS[0]), merged, m), 1, GOOD); plot(B2, mix(rateVals(prevS[1]), merged, m), 1, INFO, { op: 1 - m * 0.9 }); plot(B2, rateVals(b.series[1]), 1, BAD); }
    else b.series.forEach((s) => plot(B2, rateVals(s), 1, SER[s.color]));
    legend(530, 330, b.series.map((s) => [s.name, SER[s.color]]), { raw: true, op: () => (k === 1 ? fade(u, 1.8) : 1) });
    const expr = k === 3 ? 'sum without (instance) (…)' : 'sum by (job, status) (…)';
    if (k === 1) { pill(250, 280, 'sum by (job, status) (…)', GOOD, pop(u, 0.2), { mono: true }); mono(250, 330, '시계열 3 → 2', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 2) { pill(250, 280, expr, GOOD, 1, { mono: true });
      note(60, 336, 'by 목록에 적은 label만 결과에 남는다', fade(u, 0.5));
      note(60, 364, '나머지는 모두 더해서 접힌다', fade(u, 1.2), { fill: MUT }); return; }
    if (k === 3) { pill(250, 262, 'sum by (job, status) (…)', GOOD, 1, { mono: true, op: 0.55 });
      mono(250, 302, '≡', { 'font-size': 22, 'font-weight': 800, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      pill(250, 340, expr, ACC, pop(u, 0.9), { mono: true });
      note(530, 386, 'without은 버릴 label만 적는다', fade(u, 1.6), { fill: ACC }); return; }
  }
  function s2ops(t, c) { const { u } = c, p = c.prev || {}, x0 = 40;
    heads(x0, 84, (j) => (j === 1 ? { col: BAD, mark: 'x' } : { col: GOOD, mark: 'v' }));
    labRow(x0, 104, ['api', '', '200'], GOOD, { gone: (j) => j === 1, goneOp: 0 }); labRow(x0, 154, ['api', '', '500'], BAD, { gone: (j) => j === 1, goneOp: 0 });
    pill(720, 120, 'sum · avg · max · count', ACC, pop(u, 0.1), { mono: true, fs: 15 });
    tx(720, 168, '지표 성격에 맞는 집계를 고른다', { 'font-size': 15, 'font-weight': 600, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    // 같은 입력(서버 3대의 값)에 집계 연산자 네 개를 걸어 본다
    const vals = (p.series && p.series.length === 3 ? p.series : [{ base: 40 }, { base: 34 }, { base: 8 }]).map((s) => s.base);
    const ops = [['sum', '합계'], ['avg', '평균'], ['max', '최댓값'], ['count', '시계열 개수']];
    el('rect', { x: 20, y: 250, width: 920, height: 160, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1) });
    ops.forEach(([op, ko], i) => { const cx = 130 + i * 230, base = 390, s = fade(u, 0.3 + i * 0.4), sc = 1.1;
      mono(cx, 276, op, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: s }); tx(cx, 296, ko, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
      const cols3 = [GOOD, INFO, BAD];
      if (op === 'sum') { let y = base; vals.forEach((v, j) => { const h = v * sc * E(u, 0.4 + i * 0.4, 1.2 + i * 0.4) * 0.9; el('rect', { x: cx - 18, y: y - h, width: 36, height: h, fill: cols3[j], opacity: 0.85 }); y -= h; }); }
      else if (op === 'count') { vals.forEach((v, j) => el('circle', { cx: cx - 30 + j * 30, cy: base - 30, r: 10 * s, fill: cols3[j] })); mono(cx, base - 56, '3', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
      else { vals.forEach((v, j) => { const hi = op === 'max' && j === 0; el('rect', { x: cx - 46 + j * 32, y: base - v * sc * s, width: 26, height: v * sc * s, fill: cols3[j], opacity: op === 'max' && !hi ? 0.3 : 0.85 }); });
        if (op === 'avg') { const a = (vals[0] + vals[1] + vals[2]) / 3; el('line', { x1: cx - 54, y1: base - a * sc, x2: cx + 52, y2: base - a * sc, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) }); } } }); }


  // ================= 3. 패널 JSON · legend · 단위 · step =================
  const JS = [
    ['{', 10], ['  "type": "timeseries",', 10], ['  "title": "요청 처리율 (RPS)",', 10], ['  "datasource": { "uid": "prom-default" },', 10],
    ['  "targets": [{ "refId": "A",', 11], ['    "expr": "sum by (job, status) (…)",', 11], ['    "range": true, "instant": false,', 12],
    ['    "legendFormat": "{{job}} · {{status}}" }],', 13], ['  "fieldConfig": { "defaults":', 14], ['      { "unit": "reqps" } }', 14], ['}', 10]];
  const B3 = { x: 590, y: 98, w: 320, h: 120 };
  function s3(t, c) { const { k, u, beat: b } = c, at = 10 + k;
    // 왼쪽: 패널 JSON 모델 — 이번 beat 의 줄이 새로 써진다
    el('rect', { x: 20, y: 20, width: 470, height: 290, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(36, 44, 'panel.json', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    JS.forEach(([s, bt], i) => { const shown = bt < at || (bt === at && i === JS.length - 1) ? 1 : bt === at ? seg(u, 0.1 + (i % 4) * 0.25, 0.9 + (i % 4) * 0.25) : (i === JS.length - 1 ? 1 : 0);
      if (shown <= 0) return; const y = 70 + i * 22, now = bt === at;
      if (now) el('rect', { x: 26, y: y - 15, width: 458, height: 21, rx: 3, fill: C.HL, opacity: 0.6 });
      mono(36, y, typed(s, shown), { 'font-size': 13.5, fill: now ? INK : MUT, 'font-weight': now ? 700 : 400 }); });
    // 오른쪽: 이 JSON 이 그리는 패널
    const titleOn = k === 0 ? fade(u, 0.9) : 1;
    frame(560, 20, 380, 290, b && titleOn > 0.5 ? '요청 처리율 (RPS)' : null, { right: 'prom-default', stroke: k === 0 ? WARN : GRID });
    if (k >= 1) { el('rect', { x: 572, y: 52, width: 356, height: 30, rx: 6, fill: INK, opacity: k === 1 ? fade(u, 0.3) : 1 });
      mono(582, 72, 'A', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: k === 1 ? fade(u, 0.3) : 1 });
      mono(604, 72, k === 1 ? typed('sum by (job, status) (…)', seg(u, 0.5, 1.5)) : 'sum by (job, status) (…)', { 'font-size': 13.5, fill: PANEL }); }
    const lineOn = k === 0 ? 0 : k === 1 ? E(u, 1.4, 2.6) : 1;
    tsBox(B3, { ticks: k !== 3 });
    b.series.forEach((s) => plot(B3, rateVals(s), lineOn, SER[s.color]));
    // 범례: legendFormat 전에는 중괄호, 뒤에는 사람 말
    if (k === 3) { const m = E(u, 0.6, 1.8), p = c.prev;
      [[p.series[0].name, b.series[0].name, GOOD], [p.series[1].name, b.series[1].name, BAD]].forEach(([a, z, col], i) => {
        const y = 266 + i * 22; el('rect', { x: 580, y: y - 10, width: 13, height: 13, rx: 2, fill: col });
        mono(602, y + 2, m < 0.5 ? a : z, { 'font-size': 13.5, fill: m < 0.5 ? MUT : INK, 'font-weight': m < 0.5 ? 400 : 800, opacity: Math.abs(m - 0.5) * 2 }); });
      fly(250, 230, 700, 260, seg(u, 0.2, 0.9), '{{job}} · {{status}}', { mono: true, fill: ACC });
      note(40, 350, '값은 그대로, 범례 이름만 바뀐다', fade(u, 1.9), { fill: ACC }); return; }
    if (k >= 4) legend(580, 266, b.series.map((s) => [s.name, SER[s.color]]));
    else if (k >= 1) legend(580, 266, b.series.map((s) => [s.name, SER[s.color]]), { raw: true, op: () => lineOn });
    if (k === 0) { note(40, 350, '패널 종류 · 제목 · 보낼 데이터소스', fade(u, 1.4)); return; }
    if (k === 1) { note(40, 350, 'refId A가 이 쿼리의 이름표다', fade(u, 1.6)); return; }
    if (k === 2) { // range 와 instant 가 받는 점
      const ax = 60, aw = 400, ay = 386;
      el('line', { x1: ax, y1: ay, x2: ax + aw, y2: ay, stroke: MUT, 'stroke-width': 1.6 });
      mono(ax, ay + 22, 'from', { 'font-size': 13.5, fill: MUT }); mono(ax + aw, ay + 22, 'to', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const n = 16, shown = Math.floor(E(u, 0.2, 1.4) * n);
      for (let i = 0; i < shown; i++) el('circle', { cx: ax + (i / (n - 1)) * aw, cy: ay - 14, r: 4.5, fill: INFO });
      tx(ax - 4, ay - 30, 'range: step마다 한 점 → 선', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      el('circle', { cx: ax + aw, cy: ay - 40, r: 7 * pop(u, 1.6), fill: WARN });
      tx(ax + aw - 12, ay - 52, 'instant: 끝 한 점 → Stat', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.7) });
      return; }
    if (k === 3) return;
    if (k === 4) { // 단위 reqps → req/s
      const x = xAt(B3, 26), v = rateVals(b.series[0])[26], y = yAt(B3, v);
      el('circle', { cx: x, cy: y, r: 5, fill: GOOD });
      card(x - 20, y + 36, 156, 34, { rx: 6, fill: INK, stroke: 'none' });
      mono(x - 88, y + 41, 'api · 200', { 'font-size': 13.5, fill: OFF });
      mono(x + 46, y + 41, u < 1.0 ? '72' : '72 req/s', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end' });
      pill(250, 360, 'unit: reqps', ACC, pop(u, 0.3), { mono: true });
      sub(250, 400, '툴팁 값 72는 예시', fade(u, 1.4)); return; }
    // k5: step 자동 계산 (예시: last 1h, 패널 폭 1000px)
    const chain = [['1h ÷ 1000점', '= 3.6s'], ['반올림', '→ 5s'], ['scrape 최소', '→ 15s']];
    chain.forEach(([a, z], i) => { const x = 90 + i * 150, s = pop(u, 0.3 + i * 0.55);
      card(x, 358, 136, 54, { rx: 8, stroke: i === 2 ? ACC : GRID, s }); tx(x, 352, a, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.35 + i * 0.55) });
      mono(x, 374, z, { 'font-size': 15, 'font-weight': 800, fill: i === 2 ? ACC : INK, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.55) });
      if (i < 2) grow(x + 70, 358, x + 80, 358, E(u, 0.6 + i * 0.55, 0.8 + i * 0.55), MUT); });
    tx(40, 410, '예시 · 패널 폭 1000px, scrape 15s → 1시간에 240점', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
    const n = 24, sh = Math.floor(E(u, 1.6, 2.5) * n);
    for (let i = 0; i < sh; i++) el('line', { x1: B3.x + (i / (n - 1)) * B3.w, y1: B3.y + B3.h - 4, x2: B3.x + (i / (n - 1)) * B3.w, y2: B3.y + B3.h + 4, stroke: ACC, 'stroke-width': 2 }); }

  // ================= 4. histogram_quantile =================
  // 예시 bucket (초당, sum by (le) 뒤): le 0.1 → 900, 0.25 → 960, 0.5 → 985, 1 → 998, +Inf → 1000
  const LE = ['0.1', '0.25', '0.5', '1', '+Inf'], CUM = [900, 960, 985, 998, 1000];
  const HB = { x: 70, y: 70, w: 420, h: 260 };
  const hx = (i) => HB.x + 20 + i * 82, hy = (v, top) => HB.y + HB.h - (v / top) * HB.h;
  function bars(u, o) { o = o || {}; const top = 1000;
    el('line', { x1: HB.x, y1: HB.y + HB.h, x2: HB.x + HB.w, y2: HB.y + HB.h, stroke: MUT, 'stroke-width': 1.6 });
    LE.forEach((le, i) => { const g = o.grow ? E(u, 0.2 + i * 0.25, 0.9 + i * 0.25) : 1, v = CUM[i] * (o.scale || 1), h = (v / top) * HB.h * g;
      if (o.split) { const a = 0.55, w = 26; [a, 1 - a].forEach((f, j) => { const hh = h * f * (1 - o.merge) + h * (j === 0 ? o.merge : 0);
          if (hh > 0.5) el('rect', { x: hx(i) + (1 - o.merge) * j * 30, y: HB.y + HB.h - hh - (j === 1 ? 0 : 0), width: w + o.merge * 30, height: hh, rx: 3, fill: j === 0 ? INFO : ACC, opacity: 0.8 }); }); }
      else el('rect', { x: hx(i), y: HB.y + HB.h - h, width: 56, height: h, rx: 3, fill: o.col || INFO, opacity: 0.8 });
      mono(hx(i) + 28, HB.y + HB.h + 20, 'le=' + le, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (o.vals) mono(hx(i) + 28, HB.y + HB.h - h - 8, String(CUM[i]), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: o.vals }); }); }
  function pipe(x, y, items, active, o) { o = o || {}; items.forEach((s, i) => { const on = i <= active, cx = x + i * 150;
    card(cx, y, 136, 40, { rx: 20, text: s, fs: 14, mono: true, stroke: on ? ACC : GRID, color: on ? ACC : OFF, fill: i === active ? ACCBG : PANEL, s: o.s ? o.s(i) : 1 });
    if (i < items.length - 1) grow(cx + 68, y, cx + 82, y, on ? 1 : 0.0001, on ? ACC : GRID); }); }
  const STAGES = ['rate()', 'sum by (le)', 'quantile'];
  function s4(t, c) { const { k, u, beat: b } = c;
    if (k <= 3) pipe(580, 40, STAGES, k - 1, { s: (i) => (i === k - 1 && k >= 1 ? pop(u, 0.2) : 1) });
    if (k === 0) { bars(u, { grow: true, col: OFF });
      tx(HB.x, HB.y - 30, '_bucket: le 이하 요청을 센 누적 counter', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      note(560, 160, '왼쪽 칸이 오른쪽 칸에 포함된다', fade(u, 1.6));
      note(560, 192, 'le="+Inf" = 전체 요청 수', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 1) { const m = E(u, 0.4, 1.6); bars(u, { col: m < 0.5 ? OFF : INFO, scale: lerp(1, 1, m) });
      clock(640, 170, 26, E(u, 0.4, 2.2), WARN, '[5m]'); note(690, 176, '→ 초당 증가율', fade(u, 1.2), { fill: WARN });
      tx(HB.x, HB.y - 30, 'bucket도 counter → 먼저 rate()', { 'font-size': 15, 'font-weight': 700 }); return; }
    if (k === 2) { const m = E(u, 0.5, 1.8); bars(u, { split: true, merge: m, vals: fade(u, 2.0) });
      [['instance A', INFO], ['instance B', ACC]].forEach(([s, col], i) => { el('rect', { x: 600, y: 150 + i * 28, width: 13, height: 13, rx: 2, fill: col, opacity: 1 - m * 0.6 }); tx(620, 162 + i * 28, s, { 'font-size': 14, opacity: 1 - m * 0.6 }); });
      note(600, 250, 'le만 남기고 서버를 더한다', fade(u, 1.0));
      tx(600, 280, '숫자는 초당 요청 수 (예시)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
      tx(HB.x, HB.y - 30, 'le 칸마다 한 막대', { 'font-size': 15, 'font-weight': 700 }); return; }
    if (k === 3) { bars(u, { vals: 1 });
      // 0.99 × 1000 = 990 이 걸리는 칸(0.5~1)을 찾아 그 안에서 직선 보간 → 0.69s
      const yq = hy(990, 1000), lineU = E(u, 0.2, 1.0);
      el('line', { x1: HB.x, y1: yq, x2: lerp(HB.x, HB.x + HB.w, lineU), y2: yq, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' });
      mono(HB.x - 6, yq + 5, '990', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.3) });
      const hiU = fade(u, 1.0); el('rect', { x: hx(2) - 4, y: HB.y - 4, width: 2 * 82 + 4 - 18, height: HB.h + 8, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: hiU });
      const lines = ['0.99 × 1000 = 990번째 요청', '985 < 990 ≤ 998 → 0.5~1초 칸', '0.5 + (990−985)/(998−985) × 0.5', '= 0.69s'];
      lines.forEach((s, i) => mono(560, 130 + i * 34, s, { 'font-size': i === 3 ? 22 : 14.5, 'font-weight': i === 3 ? 800 : 600, fill: i === 3 ? BAD : INK, opacity: fade(u, 0.6 + i * 0.45) }));
      tx(560, 290, '칸 안은 고르게 퍼졌다고 보고 직선으로 잇는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) });
      tx(560, 316, '예시 숫자 · python으로 같은 값 확인', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 4) { // 순서
      pipe(180, 120, STAGES, 2, { s: (i) => pop(u, 0.2 + i * 0.3) });
      mono(330, 172, 'histogram_quantile(0.99, sum by (le) (rate(…[5m])))', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      const wy = 270; card(480, wy, 760, 92, { rx: 12, stroke: BAD, dash: '6 5', s: pop(u, 1.4) });
      mono(480, wy - 12, 'sum by (le)을 빼면 → 서버마다 따로 분위수', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(480, wy + 20, 'rate 없이 counter 그대로 → 누적 전체의 분위수', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.9) });
      note(480, 370, '두 경우 모두 에러 없이 숫자가 나온다', fade(u, 2.3), { fill: BAD, 'text-anchor': 'middle' }); return; }
    // k5: p50 과 p99 를 한 패널에
    const B4 = { x: 80, y: 80, w: 800, h: 230 }; tsBox(B4);
    b.series.forEach((s, i) => plot(B4, rateVals(s), i === 0 ? 1 : E(u, 0.3, 1.8), SER[s.color], { sw: 3 }));
    legend(90, 370, b.series.map((s) => [s.name, SER[s.color]]));
    note(560, 372, '중앙값은 평평한데 꼬리만 튄다', fade(u, 1.9), { fill: WARN }); }

  // ================= 5. recording rule · 변수 · exemplar =================
  function tsdb(x, y, n, o) { o = o || {}; el('rect', { x: x - 80, y: y - 70, width: 160, height: 150, rx: 12, fill: WARNBG, stroke: WARN, 'stroke-width': 2 });
    tx(x, y - 46, 'Prometheus', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    for (let i = 0; i < n; i++) el('line', { x1: x - 60, y1: y - 26 + i * 9, x2: x + 60, y2: y - 26 + i * 9, stroke: i === o.hot ? ACC : OFF, 'stroke-width': i === o.hot ? 4 : 2.4 }); }
  function s5(t, c) { const { k, u, beat: b } = c;
    if (k === 0) { tsdb(160, 200, 10);
      el('rect', { x: 330, y: 60, width: 330, height: 132, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1) });
      ['groups:', '  - name: http_latency', '    interval: 30s', '    rules: …'].forEach((s, i) => mono(346, 90 + i * 26, s, { 'font-size': 14.5, fill: i === 2 ? WARN : INK, 'font-weight': i === 2 ? 800 : 400, opacity: fade(u, 0.2 + i * 0.2) }));
      // 30초마다 평가
      const ax = 330, aw = 560, ay = 300; el('line', { x1: ax, y1: ay, x2: ax + aw, y2: ay, stroke: MUT, 'stroke-width': 1.6 });
      ['0s', '30s', '60s', '90s', '120s'].forEach((s, i) => { const x = ax + i * aw / 4, on = E(u, 0.6 + i * 0.4, 0.9 + i * 0.4);
        el('circle', { cx: x, cy: ay, r: 9 * on, fill: WARN }); mono(x, ay + 30, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); if (on > 0.9) grow(x, ay - 12, x, ay - 48, 1, WARN, { plain: true }); });
      tx(ax, ay - 64, '평가할 때마다 결과 한 점을 새로 저장한다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { tsdb(160, 200, 10, { hot: E(u, 1.6, 2.2) > 0.5 ? 9 : -1 });
      const m = E(u, 0.5, 1.6);
      const long = 'histogram_quantile(0.99, sum by (job, le) (rate(…_bucket[5m])))';
      card(lerp(590, 520, m), 110, lerp(620, 280, m), 46, { rx: 8, stroke: GRID, fill: SOFT });
      mono(lerp(590, 520, m), 116, m < 0.5 ? long : 'job:http_latency_p99:5m', { 'font-size': 14, 'font-weight': m < 0.5 ? 400 : 800, fill: m < 0.5 ? INK : ACC, 'text-anchor': 'middle', opacity: Math.abs(m - 0.5) * 2 });
      fly(400, 140, 230, 210, seg(u, 1.6, 2.3), 'record', { mono: true });
      ['level', 'metric', 'window'].forEach((s, i) => { const x = 420 + i * 110; tx(x, 200, ['job', 'http_latency_p99', '5m'][i], { 'font-size': 14, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8 + i * 0.15) }); sub(x, 222, s, fade(u, 1.9 + i * 0.15)); });
      note(330, 300, '계산은 Prometheus가 한 번, 조회는 몇 번이든', fade(u, 2.2)); return; }
    if (k === 2) { tsdb(160, 200, 10, { hot: 9 });
      // 예전: 원본 bucket 을 매번 훑기 / 이제: 저장된 한 줄만 읽기
      frame(560, 40, 360, 140, '예전 패널', { stroke: BAD });
      for (let i = 0; i < 9; i++) dot([[240, 174 + i * 9 - 72 + 0], [560, 110]], ((t * 0.9 + i / 9) % 1), BAD, 4);
      sub(740, 120, '원본 bucket을 새로고침마다 훑는다', 1, { fill: BAD, 'font-size': 14 });
      frame(560, 230, 360, 150, '지금 패널', { stroke: GOOD, op: fade(u, 0.6) });
      dot([[240, 255], [560, 300]], seg(u, 1.0, 1.6), GOOD, 7);
      mono(740, 296, 'job:http_latency_p99:5m{job="api"}', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      check(740, 340, 12, pop(u, 1.8)); return; }
    if (k === 3) { // 변수 $job
      const opts = b.variable.options; card(150, 60, 200, 44, { rx: 8, stroke: ACC, fill: ACCBG, s: pop(u, 0.2) });
      mono(66, 66, '$job', { 'font-size': 15, 'font-weight': 800, fill: ACC }); mono(150, 66, 'api ▾', { 'font-size': 15, 'font-weight': 700 });
      opts.forEach((o, i) => { const s = E(u, 0.4 + i * 0.2, 0.7 + i * 0.2); card(150, 112 + i * 38, 200, 36, { rx: 4, text: o, fs: 14.5, mono: true, stroke: GRID, fill: o === b.variable.value ? ACCBG : PANEL, s }); });
      mono(60, 270, 'label_values(http_requests_total, job)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      const q0 = 'job:http_latency_p99:5m{job="$job"}', q1 = 'job:http_latency_p99:5m{job="api"}', m = E(u, 1.4, 2.0);
      qbar(420, 80, 500, m < 0.5 ? q0 : q1, { fs: 14 });
      fly(150, 40, 700, 40, seg(u, 1.1, 1.7), 'api', { mono: true });
      tx(430, 150, '패널 쿼리 속 $job이 고른 값으로 바뀐다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) });
      ['api', 'checkout', 'search'].forEach((s, i) => card(510 + i * 140, 260, 124, 70, { rx: 8, text: '보드 · ' + s, fs: 14, stroke: BAD, dash: '5 5', op: 0.8 * fade(u, 2.2) }));
      ['api', 'checkout', 'search'].forEach((s, i) => cross(560 + i * 140, 232, 10, pop(u, 2.4)));
      sub(650, 330, '서비스마다 보드를 복제할 필요가 없다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 4) { // exemplar → 트레이스
      const B5 = { x: 60, y: 70, w: 460, h: 220 }; tsBox(B5); plot(B5, rateVals(b.series[0]), 1, WARN, { sw: 3 });
      [11, 24, 33].forEach((j, i) => { const v = rateVals(b.series[0])[j], x = xAt(B5, j), y = yAt(B5, v) - 8, s = pop(u, 0.3 + i * 0.25);
        el('rect', { x: x - 6, y: y - 6, width: 12, height: 12, fill: i === 1 ? BAD : WARN, transform: `rotate(45 ${x} ${y})`, opacity: s }); });
      const j = 24, x = xAt(B5, j), y = yAt(B5, rateVals(b.series[0])[j]) - 8;
      if (u > 1.2) el('circle', { cx: x, cy: y, r: 16 * E(u, 1.2, 1.5), fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: 1 - E(u, 1.5, 2) });
      grow(x + 12, y, 600, 110, E(u, 1.3, 1.8), BAD);
      frame(600, 60, 330, 250, 'Tempo · trace', { stroke: BAD, op: fade(u, 1.6) });
      [['GET /checkout', 0, 1], ['auth', 0.02, 0.12], ['db query', 0.15, 0.85], ['render', 0.88, 0.98]].forEach(([n, a, z], i) => {
        const y2 = 110 + i * 46, x0 = 616 + a * 300, w = (z - a) * 300 * E(u, 1.8 + i * 0.15, 2.4 + i * 0.15);
        el('rect', { x: x0, y: y2, width: Math.max(1, w), height: 18, rx: 3, fill: i === 2 ? BAD : INFO, opacity: 0.8 }); tx(x0, y2 + 36, n, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9 + i * 0.15) }); });
      sub(290, 360, '◆ 점 하나 = 실제 요청 하나의 trace_id (span 이름은 예시)', fade(u, 0.8), { 'font-size': 14 }); return; }
    // k5: 점검 목록
    const items = [['무거운 쿼리', 'recording rule로 미리 계산'], ['범례가 중괄호', 'legendFormat으로 이름 짓기'], ['step이 안 맞음', '촘촘하면 느리고 성기면 스파이크를 놓친다'], ['30d 원본 쿼리', '타임아웃 → rule 결과를 읽는다']];
    tx(480, 50, '대시보드가 느려지거나 못 읽게 되는 네 가지', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    items.forEach(([a, z], i) => { const y = 100 + i * 74, s = pop(u, 0.2 + i * 0.4);
      card(480, y, 760, 60, { rx: 10, stroke: i === 3 ? BAD : WARN, s }); tx(130, y + 6, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.4) });
      tx(330, y + 6, z, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); }); }

  const quiz = [
    { q: 'http_requests_total을 그대로 그리면 거의 우상향 직선이 된다. 그 까닭은 무엇인가?',
      o: ['scrape 간격이 너무 길어서', 'counter는 계속 쌓이기만 하는 누적값이라서', 'legendFormat을 지정하지 않아서'], a: 1,
      why: 'counter는 줄지 않고 커지기만 한다. rate()로 [5m] 창의 초당 증가율로 바꿔야 트래픽 곡선이 된다.' },
    { q: 'rate(http_requests_total[5m]) 결과가 job·instance·status 조합마다 3줄일 때 sum by (job, status)를 씌우면 몇 줄이 되는가?',
      o: ['1줄', '2줄', '3줄'], a: 1,
      why: 'by 뒤의 label만 남고 instance는 더해서 접힌다. status 200 두 대가 한 줄로 합쳐져 200과 500 두 줄이 남는다.' },
    { q: 'Stat 패널처럼 숫자 하나만 보일 때 알맞은 쿼리 모드는 무엇인가?',
      o: ['instant', 'range', 'legendFormat'], a: 0,
      why: 'instant는 끝 시점 한 점만 받는다. range는 from~to 구간을 step마다 받아 선을 그린다.' },
    { q: 'p99 지연을 뽑을 때 histogram_quantile 안쪽에 반드시 있어야 하는 집계는 무엇인가?',
      o: ['sum by (instance)', 'avg by (le)', 'sum by (le)'], a: 2,
      why: 'bucket 경계 le만 남겨 서버들을 더해야 분포 하나가 된다. 이 순서를 어겨도 에러 없이 틀린 값이 나온다.' },
    { q: 'recording rule을 쓰면 대시보드 새로고침이 빨라지는 까닭은 무엇인가?',
      o: ['Prometheus가 미리 계산해 둔 결과 메트릭만 읽으니까', '패널이 브라우저에서 결과를 캐시하니까', '쿼리를 instant로 바꿔 주니까'], a: 0,
      why: 'rule 그룹이 30초마다 무거운 식을 계산해 job:http_latency_p99:5m으로 저장한다. 패널은 그 한 줄만 읽는다.' },
  ];

  const summary = [
    'counter는 쌓이기만 하므로 rate()로 [5m] 창의 초당 증가율로 바꿔 그린다.',
    'sum by (job, status)는 적은 label만 남기고 나머지를 더해 선 3개를 2개로 줄인다.',
    'legendFormat의 {{label}}과 unit은 값을 건드리지 않고 읽기만 쉽게 한다.',
    'p99는 rate, sum by (le), histogram_quantile 순서로 구하고, 무거우면 rule로 미리 계산한다.',
  ];
  const review = [
    { q: 'p99 패널 값이 서버를 늘린 뒤 이상하게 들쭉날쭉해졌다. 쿼리는 histogram_quantile(0.99, rate(…_bucket[5m]))이다. 먼저 고칠 곳은?',
      o: ['rate 창을 [1m]으로 줄이기', 'rate 결과를 sum by (le)로 묶고 그 위에 histogram_quantile을 씌우기', 'legendFormat에 {{instance}} 넣기'], a: 1,
      why: 'le만 남겨 서버들을 더하지 않으면 instance마다 따로 분위수를 계산한다. 에러가 없어서 놓치기 쉽다.' },
    { q: '30일 범위로 p99 패널을 열었더니 타임아웃이 난다. 가장 알맞은 대응은?',
      o: ['recording rule로 p99를 미리 저장하고 패널은 그 메트릭을 읽게 한다', '패널 종류를 Stat으로 바꾼다', 'range를 끄고 legendFormat을 지운다'], a: 0,
      why: '원본 bucket을 넓은 범위로 훑는 계산이 문제다. 미리 계산한 결과를 읽으면 새로고침마다 다시 계산하지 않는다.' },
    { q: '회의 화면에 띄운 RPS 그래프 범례가 {job="api", status="200"}이고 숫자에 단위도 없다. 값은 맞다. 무엇을 바꾸면 되는가?',
      o: ['쿼리에 sum by를 하나 더 씌운다', 'rate 창을 [10m]으로 늘린다', 'legendFormat을 {{job}} · {{status}}로, unit을 reqps로 둔다'], a: 2,
      why: '둘 다 표시 설정이라 값은 그대로다. 범례는 사람 말이 되고 축과 툴팁에 req/s가 붙는다.' },
  ];

  R.page({ title: 'Prometheus 쿼리가 패널이 되기까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
