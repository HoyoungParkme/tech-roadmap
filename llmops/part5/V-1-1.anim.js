/* V-1-1 모니터링 (Latency / Token / Error / Quality) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, clock, lock, axes, line, hbar, dbIcon, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // beat j 에서 나타나는 정도 (지난 beat 면 1)
  const at = (c, j, a = 0.2, d = 0.8) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const mid = (x, y, s, o) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle' }, o || {}));
  const money = (v) => '$' + v.toFixed(4);

  // ───────── 1. Latency 백분위 ─────────
  const BK = ['0.1', '0.5', '1', '2', '3', '5', '10', '30'];
  const SHAPE = [0.05, 0.35, 1.0, 0.7, 0.35, 0.22, 0.12, 0.05];   // 모양만 (예시, 값은 적지 않는다)
  function s1(t, c) { const { k, u } = c, bx = (i) => 40 + i * 54, base = 330, H = 150;
    // 요청 → 미들웨어
    if (k >= 1) pill(90, 60, 'POST /chat', INK, k === 1 ? pop(u, 0.1) : 1, { mono: true, fs: 14 });
    if (k >= 1) { card(300, 60, 210, 46, { rx: 10, text: 'measure_latency', mono: true, fs: 15, stroke: ACC, color: ACC, s: k === 1 ? pop(u, 0.3) : 1 });
      clock(430, 60, 17, k === 1 ? E(u, 0.8, 2.2) : 1, WARN);
      if (k === 1) dot([[140, 60], [195, 60]], seg(u, 0.2, 0.7), ACC, 7);
      mono(300, 106, 'elapsed = 끝 − start', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 1 ? fade(u, 1.4) : 1 }); }
    // 버킷 8칸
    mono(40, 150, 'llm_latency_seconds', { 'font-size': 15, 'font-weight': 700, opacity: at(c, 0, 0.1, 0.4) });
    BK.forEach((b, i) => { const s = k === 0 ? seg(u, 0.3 + i * 0.18, 0.6 + i * 0.18) : 1; if (s <= 0) return;
      el('rect', { x: bx(i), y: base - H, width: 48, height: H, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: s });
      mono(bx(i) + 24, base + 20, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
    sub(256, base + 44, '버킷 상한 (초) · 8칸', at(c, 0, 1.6, 0.5));
    // 관측값이 떨어지며 칸이 찬다
    if (k >= 2) { const f = k === 2 ? E(u, 0.6, 2.4) : 1, tail = k >= 4;
      SHAPE.forEach((h, i) => { const hh = H * h * f; el('rect', { x: bx(i), y: base - hh, width: 48, height: hh, rx: 4, fill: tail && i >= 5 ? BAD : ACC, opacity: 0.8 }); });
      if (k === 2) { [2, 3, 1, 4, 2, 5, 3, 7].forEach((b, j) => dot([[300, 84], [300, 125], [bx(b) + 24, 140], [bx(b) + 24, base - 10]], seg(u, 0.1 + j * 0.2, 0.7 + j * 0.2), ACC, 6));
        pill(560, 60, 'labels(model, endpoint)', INFO, pop(u, 0.4), { mono: true, fs: 14 });
        mid(256, 395, '모양은 예시 · observe() 한 번에 그 칸 카운터 +1', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); } }
    // /metrics → Prometheus → Grafana
    if (k >= 3) { const a = k === 3 ? u : 3;
      pill(560, 60, 'GET /metrics', INK, k === 3 ? pop(a, 0.2) : 1, { mono: true, fs: 14 });
      grow(625, 60, 700, 60, seg(a, 0.5, 0.9), MUT); card(765, 60, 120, 40, { rx: 8, text: 'Prometheus', fs: 14.5, stroke: WARN, color: WARN, s: k === 3 ? pop(a, 0.8) : 1 });
      grow(826, 60, 860, 60, seg(a, 1.1, 1.4), MUT); card(900, 60, 80, 40, { rx: 8, text: 'Grafana', fs: 14, stroke: ACC, color: ACC, s: k === 3 ? pop(a, 1.3) : 1 });
      mono(720, 120, 'histogram_quantile(0.95, …)', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(a, 1.7) : 1 });
      mid(720, 146, '서버는 칸 수만 저장, 백분위는 조회할 때 계산', { 'font-size': 14, fill: MUT, opacity: k === 3 ? fade(a, 2.1) : 1 }); }
    // 평균과 백분위 (예시 분포)
    if (k >= 4) { const rows = [['평균', 1.8, INK, null], ['p50', 1.0, GOOD, 1.5], ['p95', 5.2, BAD, 3.0], ['p99', 15.0, BAD, 10.0]], X0 = 580, W = 270;
      mid(720, 190, '예시 분포 · 코드 주석 값', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: k === 4 ? fade(u, 0.1) : 1 });
      rows.forEach(([n, v, col, slo], i) => { const y = 212 + i * 46, g = k === 4 ? E(u, 0.3 + i * 0.3, 1.1 + i * 0.3) : 1;
        tx(565, y + 14, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: col });
        hbar(X0, y, W, v, 15, { u: g, col, text: v.toFixed(1) + 's', h: 20 });
        if (k === 5 && slo != null) { const xs = X0 + W * slo / 15, s = fade(u, 0.3 + i * 0.3);
          el('line', { x1: xs, y1: y - 5, x2: xs, y2: y + 25, stroke: INK, 'stroke-width': 3, opacity: s });
          mono(xs + 4, y - 7, slo.toFixed(1), { 'font-size': 13.5, 'font-weight': 700, opacity: s });
          (v <= slo ? check : cross)(500, y + 10, 9, pop(u, 0.9 + i * 0.3)); } });
      if (k === 4) mid(720, 405, '평균 1.8초 뒤에 5초 넘게 기다리는 5%가 숨는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      if (k === 5) mono(720, 405, 'p95 > 3s for 5m → HighLatency', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); } }

  // ───────── 2. 토큰과 비용 ─────────
  const PRICE = [['gpt-4', 0.030, 0.060], ['gpt-4o', 0.005, 0.015], ['gpt-4o-mini', 0.00015, 0.0006], ['claude-3-opus', 0.015, 0.075]];
  const IN = 1000, OUT = 500, P4O = PRICE[1], INC = IN / 1000 * P4O[1], OUTC = OUT / 1000 * P4O[2];
  function counter(cx, cy, name, val, o) { o = o || {}; card(cx, cy, 300, 54, { rx: 10, stroke: o.stroke || GRID, sw: o.stroke ? 2.5 : 1.5, s: o.s });
    if ((o.s ?? 1) < 0.3) return; mono(cx - 136, cy - 6, name, { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); mono(cx + 136, cy + 18, val, { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'end', fill: o.col || INK }); }
  function s2(t, c) { const { k, u } = c;
    // 응답 usage (예시 요청)
    card(170, 62, 300, 74, { rx: 10, stroke: INK, sw: 2, s: k === 0 ? pop(u, 0.1) : 1 });
    mono(36, 50, 'response.usage  (예시)', { 'font-size': 13.5, fill: MUT, opacity: at(c, 0, 0.2, 0.3) });
    mono(36, 74, 'prompt_tokens     1,000', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: at(c, 0, 0.3, 0.3) });
    mono(36, 94, 'completion_tokens   500', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: at(c, 0, 0.5, 0.3) });
    const g4 = k >= 4 ? (k === 4 ? E(u, 0.3, 1.8) : 1) : 0;
    counter(170, 170, 'tokens_total{type="input"}', Math.round(IN * g4).toLocaleString('en-US'), { s: k === 0 ? pop(u, 0.8) : 1, col: INFO });
    counter(170, 236, 'tokens_total{type="output"}', Math.round(OUT * g4).toLocaleString('en-US'), { s: k === 0 ? pop(u, 1.1) : 1, col: ACC });
    if (k === 0) mid(170, 290, 'input과 output을 따로 담는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
    if (k >= 1) { counter(170, 302, 'cost_usd_total', money((INC + OUTC) * g4), { s: k === 1 ? pop(u, 0.2) : 1, stroke: WARN, col: WARN });
      ['model', 'user_id'].forEach((n, i) => pill(95 + i * 130, 356, n, INFO, k === 1 ? pop(u, 0.8 + i * 0.3) : 1, { mono: true, fs: 14 }));
      if (k === 1) mid(170, 400, '토큰과 금액을 따로 쌓는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 4) { g4 > 0 && [[96, 170, INFO], [96, 236, ACC]].forEach(([x, y, col], i) => dot([[80, 74 + i * 20], [x, y]], seg(u, 0.1 + i * 0.2, 0.8 + i * 0.2), col, 6)); }
    // 단가표 (1K 토큰당 $)
    if (k === 2 || k === 3) { const X0 = 560, W = 300, a = k === 2 ? u : 3;
      tx(430, 40, '1K 토큰당 단가 ($)', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 640, y: 30, width: 14, height: 11, rx: 2, fill: INFO }); tx(660, 41, '입력', { 'font-size': 13.5, fill: MUT });
      el('rect', { x: 710, y: 30, width: 14, height: 11, rx: 2, fill: ACC }); tx(730, 41, '출력', { 'font-size': 13.5, fill: MUT });
      PRICE.forEach(([m, pi, po], i) => { const y = 70 + i * 66, g = E(a, 0.2 + i * 0.3, 1.0 + i * 0.3), hot = k === 3 && i === 1;
        if (hot) el('rect', { x: 422, y: y - 8, width: 520, height: 58, rx: 8, fill: WARNBG });
        mono(430, y + 20, m, { 'font-size': 15, 'font-weight': 700, fill: hot ? WARN : INK });
        hbar(X0, y, W, pi, 0.075, { u: g, col: INFO, text: String(pi), h: 16 });
        hbar(X0, y + 22, W, po, 0.075, { u: g, col: ACC, text: String(po), h: 16 }); });
      if (k === 2) banner(680, 345, 'gpt-4 ÷ mini · 입력 200배 · 출력 100배', pop(u, 2.0)); }
    if (k === 3) { const ys = [350, 378, 406];
      mono(430, ys[0], `1,000 / 1000 × 0.005 = ${money(INC)}`, { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(430, ys[1], `  500 / 1000 × 0.015 = ${money(OUTC)}`, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) });
      mono(430, ys[2], `합계 ${money(INC + OUTC)} · 출력은 절반 토큰에 1.5배 금액`, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.7) }); }
    // 라벨 카디널리티
    if (k === 4) { tx(440, 50, 'llm_tokens_total의 시계열 수', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['model', '4'], ['type', '2'], ['user_id', 'N명']].forEach(([n, v], i) => { const x = 470 + i * 150, s = pop(u, 0.5 + i * 0.3);
        card(x + 20, 110, 128, 56, { rx: 10, stroke: i === 2 ? BAD : GRID, sw: 2, s }); mono(x + 20, 104, n, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) });
        mono(x + 20, 126, v, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 2 ? BAD : INK, opacity: clamp(s) });
        if (i < 2) mono(x + 95, 116, '×', { 'font-size': 20, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) }); });
      const n = Math.round(lerp(0, 22, E(u, 1.4, 2.6)));
      for (let i = 0; i < n; i++) el('line', { x1: 450, y1: 170 + i * 10, x2: 920, y2: 170 + i * 10 + Math.sin(i * 1.7) * 3, stroke: i % 3 ? GRID : BAD, 'stroke-width': 1.5 });
      mid(690, 405, '사용자가 늘면 시계열도 같이 늘어난다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
    // 비용 alert
    if (k === 5) { const X0 = 440, W = 470;
      tx(X0, 48, '월 예산 $5,000', { 'font-size': 16, 'font-weight': 700 });
      el('rect', { x: X0, y: 62, width: W, height: 26, rx: 6, fill: SOFT });
      el('rect', { x: X0, y: 62, width: W * E(u, 0.2, 1.2) * (1 / 30), height: 26, rx: 6, fill: WARN });
      mono(X0 + W / 30 + 8, 81, '하루 상한 $5000 / 30 = $167', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      [['일 비용 > $200', 'Slack'], ['한 사용자 일 비용 > $10', 'Slack'], ['시간당 토큰 rate 3배 spike', 'Slack']].forEach(([a, b], i) => { const y = 150 + i * 72, s = pop(u, 1.2 + i * 0.35);
        card(675, y, W, 56, { rx: 10, stroke: BAD, sw: 2, s }); tx(X0 + 22, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: clamp(s) });
        pill(X0 + W - 50, y, b, INFO, s, { fs: 13.5 }); });
      mid(675, 400, '월말 청구서보다 먼저 알게 한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); } }

  // ───────── 3. 에러를 종류별로 ─────────
  const ROWS = [['timeout', '네트워크·부하 · fallback 점검'], ['rate_limit', '429 · quota 증설'], ['server_error', '5xx · 벤더 status page'], ['bad_request', '400 · 우리 prompt'], ['other', '그 밖']];
  function s3(t, c) { const { k, u } = c, RX = 560, ry = (i) => 100 + i * 60;
    person(60, 200, '사용자', { s: 0.9 });
    card(250, 200, 196, 50, { rx: 10, text: 'call_with_metrics', mono: true, fs: 14.5, stroke: INK });
    server(430, 200, 'LLM API', { s: 0.75, lamp: k >= 3 ? BAD : GOOD });
    el('line', { x1: 90, y1: 200, x2: 152, y2: 200, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: 348, y1: 200, x2: 386, y2: 200, stroke: GRID, 'stroke-width': 2.5 });
    // 종류별 칸
    mono(RX, 50, 'llm_errors_total{error_type}', { 'font-size': 15, 'font-weight': 700, opacity: at(c, 0, 0.1, 0.4) });
    ROWS.forEach(([n, hint], i) => { const s = k === 0 ? seg(u, 0.4 + i * 0.25, 0.8 + i * 0.25) : 1; if (s <= 0) return;
      const hot = (k === 3 && i < 2) || (k === 4 && i >= 2);
      el('rect', { x: RX, y: ry(i) - 22, width: 380, height: 44, rx: 8, fill: hot ? BADBG : PANEL, stroke: hot ? BAD : GRID, 'stroke-width': 1.5, opacity: s });
      mono(RX + 14, ry(i) + 5, n, { 'font-size': 15, 'font-weight': 700, fill: hot ? BAD : INK, opacity: s });
      if (k < 5 && ((k >= 3 && i < 2) || (k >= 4 && i >= 2))) tx(RX + 366, ry(i) + 5, hint, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: k === 3 || k === 4 ? fade(u, 1.4) : 1 });
      if (k === 5) mono(RX + 366, ry(i) + 5, '< 0.1%', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.15) }); });
    // 분모
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1;
      card(250, 82, 196, 50, { rx: 10, stroke: INFO, sw: 2.5, s }); mono(250, 88, 'requests_total', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: clamp(s) });
      if (k === 1) { mono(250, 330, 'error rate =', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) });
        mono(250, 360, 'errors / requests', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
        sub(250, 392, '분모가 없으면 건수만 보인다', fade(u, 1.7), { 'font-size': 14.5 }); } }
    if (k === 2) { dot([[90, 200], [152, 200]], seg(u, 0.1, 0.6), ACC, 7); mono(330, 70, '+1', { 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) * (1 - fade(u, 2.2)) });
      dot([[348, 200], [386, 200]], seg(u, 0.9, 1.3), ACC, 7); clock(430, 290, 20, E(u, 1.2, 2.6), WARN, 'timeout=30');
      sub(250, 392, '분모 먼저 올리고, 30초 넘으면 끊는다', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (k === 3) { [[0, 0.3], [1, 1.1]].forEach(([r, a]) => dot([[470, 200], [520, ry(r)], [RX + 160, ry(r)]], seg(u, a, a + 0.8), BAD, 7));
      pill(430, 120, 'APITimeoutError', BAD, pop(u, 0.2), { mono: true, fs: 13.5 }); pill(430, 290, 'RateLimitError 429', BAD, pop(u, 1.0), { mono: true, fs: 13.5 });
      sub(250, 392, '원인이 다르면 대응도 다르다', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 4) { pill(430, 290, 'APIStatusError', BAD, pop(u, 0.2), { mono: true, fs: 13.5 });
      [[2, '≥ 500', 0.5], [3, '== 400', 1.0], [4, '그 외', 1.5]].forEach(([r, cond, a]) => { dot([[470, 290], [520, ry(r)], [RX + 160, ry(r)]], seg(u, a, a + 0.7), BAD, 7);
        mono(RX + 170, ry(r) + 5, cond, { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, a + 0.5) }); });
      sub(250, 392, '같은 예외라도 책임이 갈린다', fade(u, 1.9), { 'font-size': 14.5 }); }
    if (k === 5) { banner(250, 330, '전체 error rate < 0.5%', pop(u, 0.4));
      mono(250, 392, 'alert: errors/requests > 1% for 5m', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); } }

  // ───────── 4. 품질 drift ─────────
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['Counter · 누적만', 'llm_tokens_total', 0], ['Gauge · 지금 값', 'llm_quality_score', 1]].forEach(([title, name, g], i) => {
        const x = 60 + i * 460, ax = axes(x + 20, 90, 340, 200, { x: [0, 10], y: [0, 1] });
        tx(x + 20, 60, title, { 'font-size': 17, 'font-weight': 800, fill: g ? ACC : INFO }); mono(x + 360, 60, name, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
        const P = []; for (let j = 0; j <= 10; j++) P.push([j, g ? 0.78 + 0.1 * Math.sin(j * 1.3) - (j > 7 ? 0.12 : 0) : 0.05 + j * 0.088]);
        line(ax, P, E(u, 0.3 + i * 0.6, 1.6 + i * 0.6), g ? ACC : INFO, { sw: 3 }); });
      mid(480, 360, '품질은 쌓이는 값이 아니라 오르내리는 지금 값이다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 388, '선 모양은 예시', fade(u, 2.0)); return; }
    // 위: eval set → production → RAGAS → Gauge
    const Y = 110;
    for (let i = 4; i >= 0; i--) card(100 + i * 5, Y - i * 5, 130, 74, { rx: 8, stroke: GRID, sw: 1.5, s: k === 1 ? pop(u, 0.2 + (4 - i) * 0.1) : 1 });
    mono(110, Y - 4, 'eval_set', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: at(c, 1, 0.6, 0.3) });
    mono(110, Y + 18, 'v1.2 · 100문항', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: at(c, 1, 0.7, 0.3) });
    lock(170, Y - 38, true, ACC, at(c, 1, 0.9, 0.5));
    if (k === 1) { clock(110, 230, 22, E(u, 1.2, 2.6), INFO, '매일 00:00'); mid(480, 300, '문제지가 바뀌면 점수 차이를 모델 탓으로 읽을 수 없다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7) }); }
    if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1;
      card(390, Y, 190, 56, { rx: 10, text: 'production_pipeline', mono: true, fs: 14, stroke: INK, s });
      grow(180, Y, 290, Y, k === 2 ? seg(u, 0.3, 0.8) : 1, MUT);
      if (k === 2) for (let j = 0; j < 5; j++) dot([[180, Y], [295, Y], [485, Y], [560, Y - 26 + (j % 2) * 52]], seg(u, 0.6 + j * 0.25, 1.6 + j * 0.25), ACC, 6);
      pill(600, Y - 26, 'answer', ACC, k === 2 ? pop(u, 1.4) : 1, { mono: true, fs: 14 }); pill(612, Y + 26, 'contexts', INFO, k === 2 ? pop(u, 1.7) : 1, { mono: true, fs: 14 });
      if (k === 2) mid(480, 300, '테스트용 경로가 아니라 운영 경로 그대로 푼다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k >= 3) { const s = k === 3 ? pop(u, 0.2) : 1;
      card(770, Y, 110, 56, { rx: 10, text: 'RAGAS', fs: 16, stroke: ACC, color: ACC, s }); grow(672, Y, 712, Y, k === 3 ? seg(u, 0.1, 0.4) : 1, MUT);
      if (k === 3) { ['faithfulness', 'answer_relevancy', 'context_precision'].forEach((m, j) => { const a = seg(u, 0.6 + j * 0.3, 1.4 + j * 0.3);
          if (a > 0) mono(lerp(730, 690, a), 190 + j * 26, m, { 'font-size': 14, 'font-weight': 700, fill: j ? INFO : ACC, 'text-anchor': 'start', opacity: a }); });
        card(880, 270, 150, 64, { rx: 10, stroke: ACC, sw: 2.5, s: pop(u, 1.8) }); mono(880, 262, 'Gauge.set()', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) });
        mono(880, 288, '0.91', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
        sub(480, 380, 'faithfulness 0.91은 코드 주석의 v1.2 값', fade(u, 2.2), { 'font-size': 14.5 }); } }
    // 아래: 30일 시계열 + 7일 평균 기준선
    if (k === 4) { const ax = axes(110, 200, 760, 150, { x: [1, 30], y: [0.8, 1.0], yt: [0.85, 0.9, 1.0], grid: true, xl: '일자 (30일)', yl: 'faithfulness' });
      const P = []; for (let d = 1; d <= 30; d++) P.push([d, d < 26 ? 0.92 + 0.012 * Math.sin(d * 1.1) : 0.92 - (d - 25) * 0.016]);
      el('line', { x1: ax.X(1), y1: ax.Y(0.85), x2: ax.X(30), y2: ax.Y(0.85), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      line(ax, P, E(u, 0.2, 1.8), ACC, { sw: 3 });
      line(ax, [[1, 0.87], [30, 0.87]], E(u, 0.8, 1.6), WARN, { sw: 2, dash: '3 4' });
      tx(ax.X(2), ax.Y(0.87) - 8, '7일 평균 − 0.05', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
      if (u > 1.9) { el('circle', { cx: ax.X(30), cy: ax.Y(P[29][1]), r: 9, fill: 'none', stroke: BAD, 'stroke-width': 3 }); pill(640, 392, 'QualityDrop', BAD, pop(u, 2.0), { mono: true, fs: 14 }); }
      sub(300, 404, '선 모양은 예시', fade(u, 1.0)); }
    if (k === 5) { [['벤더 silent update', '같은 이름, 다른 모델'], ['prompt 변경', '최근 PR'], ['RAG corpus 손상', '문서 누락·낡음'], ['embedding 모델 변경', ''], ['eval set 자체 drift', '도메인 변화']].forEach(([a, b], i) => {
        const x = 104 + i * 188, s = pop(u, 0.2 + i * 0.3), top = i < 3;
        card(x, 300, 172, 96, { rx: 12, stroke: top ? WARN : GRID, sw: top ? 2.5 : 1.5, fill: top ? WARNBG : PANEL, s });
        mono(x - 72, 270, String(i + 1), { 'font-size': 16, 'font-weight': 800, fill: top ? WARN : MUT, opacity: clamp(s) });
        mid(x, 300, a, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s) }); if (b) mid(x, 324, b, { 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); });
      mid(480, 210, '코드가 그대로여도 점수는 떨어진다', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); } }

  // ───────── 5. 대시보드 ─────────
  const PAN = [[40, 30, 435, 135, '① Latency p50/95/99'], [485, 30, 435, 135, '② Token rate in/out'], [40, 175, 435, 135, '③ Error rate by type'], [485, 175, 435, 135, '④ Quality score'], [40, 320, 880, 80, '⑤ Cost · 월 누적 vs 예산']];
  function mini(x, y, w, h, series, u) { const ax = { X: (v) => x + v * w, Y: (v) => y + h - v * h };
    series.forEach(([pts, col, dash]) => line(ax, pts.map((p, i) => [i / (pts.length - 1), p]), u, col, { sw: 2.5, dash })); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { PAN.forEach(([x, y, w, h, name], i) => { const s = k === 0 ? E(u, 0.2 + i * 0.25, 0.7 + i * 0.25) : 1; if (s <= 0) return;
        el('rect', { x, y: y + (1 - s) * 20, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: s });
        tx(x + 14, y + 24 + (1 - s) * 20, name, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); });
      if (k === 0) { mid(480, 170, '스크롤 없이 한 화면', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); return; }
      const a = k === 1 ? E(u, 0.3, 1.8) : 1;
      mini(60, 66, 395, 84, [[[0.2, 0.22, 0.2, 0.25, 0.22, 0.24], GOOD], [[0.45, 0.5, 0.48, 0.62, 0.55, 0.58], WARN], [[0.7, 0.78, 0.74, 0.92, 0.85, 0.88], BAD]], a);
      mini(505, 66, 250, 84, [[[0.3, 0.5, 0.4, 0.6, 0.55, 0.7], INFO], [[0.15, 0.25, 0.2, 0.3, 0.28, 0.35], ACC]], a);
      ['user_31', 'user_07', 'user_12'].forEach((n, i) => mono(775, 74 + i * 26, `${i + 1}. ${n}`, { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 1.2 + i * 0.2) : 1 }));
      if (k === 1) { pill(480, 170, '6 패널 · PromQL을 문서에 적어 둔다', INK, pop(u, 1.9), { fs: 14 }); return; }
      const b = E(u, 0.3, 1.8), cols = [WARN, BAD, INFO, MUT];
      for (let j = 3; j >= 0; j--) { const H = [0.1, 0.18, 0.25, 0.3][j]; const pts = [0, 1, 2, 3, 4, 5].map((i) => [i / 5, H + 0.08 * Math.sin(i + j)]);
        const ax = { X: (v) => 60 + v * 395, Y: (v) => 295 - v * 84 * b };
        el('path', { d: 'M' + pts.map(([p, q]) => `${ax.X(p)},${ax.Y(q)}`).join(' L') + ` L${ax.X(1)},295 L${ax.X(0)},295 Z`, fill: cols[j], opacity: 0.55 }); }
      mini(505, 211, 395, 84, [[[0.82, 0.84, 0.83, 0.8, 0.7, 0.62], ACC], [[0.7, 0.72, 0.7, 0.71, 0.69, 0.7], INFO]], b);
      el('line', { x1: 505, y1: 228, x2: 900, y2: 228, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.0) });
      mono(900, 222, '0.85', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 1.0) });
      el('rect', { x: 330, y: 352, width: 560, height: 24, rx: 6, fill: SOFT }); el('rect', { x: 330, y: 352, width: 560 * 0.62 * b, height: 24, rx: 6, fill: WARN });
      tx(316, 370, '월 예산 대비', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      pill(480, 170, '총 12 패널 · 4축 전부', ACC, pop(u, 1.9), { fs: 14 });
      sub(780, 395, '모든 선 모양은 예시', fade(u, 2.0)); return; }
    if (k === 3) { card(480, 210, 170, 60, { rx: 12, text: 'Alertmanager', fs: 16, stroke: INK, s: pop(u, 0.1) });
      [['PagerDuty · 즉시', BAD, 170, ['error_rate > 5% for 5m', 'p99 > 30s for 5m', '모든 호출 실패']], ['Slack · 영업시간', INFO, 790, ['p95 > 3s for 15m', 'quality drop > 5%p', '일 비용 > $200']]].forEach(([n, col, x, rules], i) => {
        grow(i ? 565 : 395, 210, i ? 660 : 300, 210, seg(u, 0.4 + i * 0.4, 0.9 + i * 0.4), col);
        card(x, 80, 260, 44, { rx: 22, text: n, fs: 16, stroke: col, color: col, s: pop(u, 0.6 + i * 0.4) });
        rules.forEach((r, j) => { const s = pop(u, 1.0 + i * 0.4 + j * 0.2); card(x, 160 + j * 62, 270, 48, { rx: 8, stroke: col, sw: 1.8, s }); mono(x, 165 + j * 62, r, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: clamp(s) }); }); });
      mid(480, 395, '새벽에 깨울 것은 셋뿐 · 나머지는 아침에', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { [['metric', 'Prometheus', 'Grafana 화면', WARN], ['log', 'Loki / ELK', '검색', INFO], ['trace', 'Langfuse · Helicone · OTel', 'LLM 호출 추적', ACC], ['alert', 'Alertmanager', 'Slack / PagerDuty', BAD]].forEach(([a, b, d, col], i) => {
        const y = 70 + i * 82, s = pop(u, 0.2 + i * 0.4);
        card(130, y, 140, 50, { rx: 25, text: a, fs: 16, mono: true, stroke: col, color: col, s });
        grow(205, y, 300, y, seg(u, 0.4 + i * 0.4, 0.8 + i * 0.4), col);
        card(470, y, 320, 56, { rx: 10, text: b, fs: 16, stroke: col, s }); grow(632, y, 690, y, seg(u, 0.6 + i * 0.4, 1.0 + i * 0.4), MUT);
        tx(700, y + 5, d, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8 + i * 0.4) }); });
      mid(480, 405, '신호마다 어디로 보낼지 먼저 정한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    [['일반 웹', ['Latency', 'Error', 'Throughput'], [], 260], ['LLM 서비스', ['Latency', 'Error', 'Throughput'], ['Token', 'Cost', 'Quality'], 700]].forEach(([n, a, b, x], i) => {
      lbl(x, 50, n, fade(u, 0.1 + i * 0.4), { 'font-size': 18 });
      a.forEach((m, j) => card(x, 100 + j * 52, 220, 42, { rx: 8, text: m, fs: 15, stroke: GRID, s: pop(u, 0.2 + i * 0.3 + j * 0.1) }));
      b.forEach((m, j) => { const q = m === 'Quality'; card(x, 266 + j * 52, 220, 42, { rx: 8, text: '+ ' + m, fs: 15.5, stroke: q ? ACC : WARN, color: q ? ACC : WARN, fill: q ? ACCBG : PANEL, sw: q ? 3 : 2, s: pop(u, 1.2 + j * 0.3) }); }); });
    tx(260, 300, 'Quality drift는 LLM 서비스에만 있는 축', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) }); }

  const quiz = [
    { q: '평균 응답이 1.8초인데도 SLO를 p95로 잡는 이유는 무엇인가?',
      o: ['평균은 계산 비용이 커서', '평균 뒤에 5초 넘게 기다리는 5% 요청이 숨기 때문에', 'Prometheus가 평균을 지원하지 않아서'], a: 1,
      why: '예시 분포에서 평균은 1.8초지만 p95는 5.2초, p99는 15초다. 불만은 이 꼬리에서 나온다.' },
    { q: 'gpt-4o에 입력 1,000토큰, 출력 500토큰을 쓰면 비용은 얼마인가?',
      o: ['$0.0075', '$0.0050', '$0.0125'], a: 2,
      why: '입력 1,000/1000×0.005 = $0.005, 출력 500/1000×0.015 = $0.0075로 합계 $0.0125다. 출력 토큰은 절반인데 금액은 1.5배다.' },
    { q: '400 bad_request 에러가 늘었을 때 먼저 볼 곳은 어디인가?',
      o: ['우리가 보낸 prompt와 요청 값', '벤더 status page', 'quota 한도'], a: 0,
      why: '5xx는 벤더 쪽, 429는 quota 쪽, 400은 우리 요청 쪽 문제다. 그래서 status code로 라벨을 나눠 센다.' },
    { q: '품질 점수를 Counter가 아니라 Gauge로 기록하는 이유는 무엇인가?',
      o: ['Gauge가 저장 공간을 덜 써서', '품질은 쌓이는 값이 아니라 오르내리는 현재 값이라서', 'RAGAS가 Gauge만 받아서'], a: 1,
      why: 'Counter는 늘기만 한다. faithfulness는 매일 새로 재는 지금 값이라 떨어질 수도 있어야 drift가 보인다.' },
    { q: '이 대시보드를 일반 웹 대시보드와 가르는 패널은 무엇인가?',
      o: ['p95 응답 시간', 'error rate', 'Quality score'], a: 2,
      why: 'Latency·Error·Throughput은 어느 서비스나 본다. LLM 서비스에는 Token·Cost·Quality가 붙고 그중 Quality가 가장 다르다.' },
  ];

  const summary = [
    '평균 응답 1.8초 뒤에 p95 5.2초, p99 15초 요청이 숨는다. SLO는 p95, p99로 건다.',
    '토큰은 입력과 출력을 따로 센다. 출력 단가가 입력의 2배에서 5배라 비용은 출력에서 먼저 튄다.',
    '에러는 timeout, 429, 5xx, 400으로 나눠 센다. 종류마다 고칠 곳이 다르다.',
    '같은 eval set을 매일 돌려 품질 점수를 Gauge로 남기면 7일 평균 대비 하락을 잡을 수 있다.',
  ];
  const review = [
    { q: '대시보드에 p95가 3초 아래로 안정적인데 사용자 불만이 늘었다. 먼저 볼 것은?',
      o: ['p99 꼬리와 품질 점수 추이', 'CPU 사용률', '토큰 단가표'], a: 0,
      why: 'p95 아래가 괜찮아도 1% 꼬리가 15초일 수 있고, 응답이 빨라도 답의 품질이 떨어졌을 수 있다. 두 축은 따로 재야 보인다.' },
    { q: '코드는 그대로인데 faithfulness가 7일 평균보다 0.05 넘게 떨어졌다. 가장 먼저 의심할 것은?',
      o: ['Prometheus scrape 주기', '벤더의 조용한 모델 교체', 'Histogram 버킷 경계'], a: 1,
      why: '같은 eval set v1.2로 재므로 문제지는 그대로다. 우리 코드가 안 바뀌었다면 벤더 모델이나 corpus 쪽이 바뀐 것이다.' },
    { q: '한 사용자의 하루 비용이 $10을 넘었다는 Slack 알림이 왔다. 이 알림을 가능하게 한 설계는?',
      o: ['Histogram 버킷을 8개로 둔 것', 'error_type 라벨을 붙인 것', 'cost Counter에 user_id 라벨을 붙인 것'], a: 2,
      why: '금액을 user_id별로 쌓아 두어야 1인 한도를 볼 수 있다. 대신 사용자가 많으면 시계열 수가 함께 늘어난다.' },
  ];

  R.page({ title: 'LLMOps 모니터링 4축', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
