/* III-1-1 Alert Rule 만들기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 값(5xx 비율·for 누적·상태)은 페이지 STEPS 의 valueNow · threshold · forDuration · currentFor · state 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 도우미 ----------
  const pct = (v) => (v * 100).toFixed(v * 100 < 10 && v * 100 % 1 ? 1 : 0) + '%';
  const secs = (s) => { if (!s || /미설정|per/.test(s)) return null; const m = String(s).match(/(?:(\d+)m)?(?:(\d+)s)?/); return (+(m[1] || 0)) * 60 + (+(m[2] || 0)); };
  const fmtS = (v) => { v = Math.round(v); const m = Math.floor(v / 60), s = v % 60; return m ? `${m}m${String(s).padStart(2, '0')}s` : `${s}s`; };
  // 왼쪽 기준 알약
  function tagL(x, y, s, col, o) { o = o || {}; const fs = o.fs || 14, w = tw(s, fs) + 24; card(x + w / 2, y, w, fs + 14, { rx: (fs + 14) / 2, stroke: col || INK, sw: 1.8, text: s, fs, fw: 700, color: o.color || col || INK, fill: o.fill, s: o.s, op: o.op, mono: o.mono }); return w; }
  // 종: muted 면 사선
  function bell(cx, cy, s, col, muted) { const g = R.G(cx, cy, s ?? 1); col = col || INK;
    el('path', { d: 'M-13,7 Q-13,-15 0,-15 Q13,-15 13,7 L17,12 H-17 Z', fill: PANEL, stroke: col, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: 0, cy: 16, r: 3.6, fill: col }, g);
    if (muted) el('line', { x1: -20, y1: -18, x2: 20, y2: 20, stroke: BAD, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g); return g; }
  // 봉투
  function env(cx, cy, s, col, o) { o = o || {}; const g = R.G(cx, cy, s ?? 1, o.op); col = col || ACC;
    el('rect', { x: -19, y: -13, width: 38, height: 26, rx: 3, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.4 }, g);
    el('path', { d: 'M-19,-13 L0,3 L19,-13', fill: 'none', stroke: col, 'stroke-width': 2.2 }, g); return g; }
  // 빈 칸 → 채워진 칸
  function slot(cx, cy, w, h, title, on, o) { o = o || {};
    card(cx, cy, w, h, { rx: 12, stroke: on ? (o.col || ACC) : GRID, sw: on ? 2.6 : 2, dash: on ? null : '7 6', fill: on ? (o.bg || PANEL) : 'none', s: o.s });
    tx(cx - w / 2 + 14, cy - h / 2 + 22, title, { 'font-size': 14, 'font-weight': 700, fill: on ? (o.col || ACC) : MUT }); }

  // ---------- 1. 알람의 뼈대 ----------
  const SL = [{ x: 170, t: '(1) Query' }, { x: 480, t: '(2) Condition' }, { x: 790, t: '(3) For' }], SY = 190, SW = 270, SH = 104;
  function s1(t, c) { const { k, u } = c;
    // 그룹 띠 + 평가 눈금 (1분마다)
    zone(24, 16, 912, 64, null, { fill: SOFT, op: k === 0 ? fade(u, 0.1) : 1 });
    tx(44, 54, 'group: api-health', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
    tx(250, 54, 'folder: production', { 'font-size': 14, fill: MUT, class: 'mono', opacity: k === 0 ? fade(u, 0.4) : 1 });
    const T0 = 470, TW = 430, ticks = 6;
    el('line', { x1: T0, y1: 48, x2: T0 + TW, y2: 48, stroke: GRID, 'stroke-width': 2 });
    const run = k === 0 ? E(u, 0.4, 2.4) : 1;
    for (let i = 0; i < ticks; i++) { const x = T0 + (i * TW) / (ticks - 1), hit = run * (ticks - 1) >= i;
      el('circle', { cx: x, cy: 48, r: hit ? 7 : 5, fill: hit ? ACC : PANEL, stroke: hit ? ACC : GRID, 'stroke-width': 2 });
      if (i > 0 && i < ticks) mono((x + T0 + ((i - 1) * TW) / (ticks - 1)) / 2, 70, '1m', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: hit ? 1 : 0.3 }); }
    tx(T0 - 10, 30, 'interval: 1m — 이 간격으로 규칙을 평가', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: k === 0 ? fade(u, 1.2) : 1 });
    if (k === 0) { SL.forEach((p, i) => slot(p.x, SY, SW, SH, p.t, false, { s: pop(u, 1.4 + i * 0.25) }));
      sub(480, 300, '평가할 때마다 그룹 안의 규칙이 한 번씩 실행된다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // 규칙 머리
    const typ = k === 1 ? E(u, 0.3, 1.6) : 1, title = 'API 5xx 비율 높음';
    card(480, 112, 600, 40, { rx: 8, fill: PANEL, stroke: INK, sw: 2 });
    mono(196, 118, 'uid: high-error-rate'.slice(0, Math.round(20 * Math.min(1, typ * 1.6))), { 'font-size': 14.5, 'font-weight': 700 });
    tx(470, 118, 'title: ' + title.slice(0, Math.round(title.length * clamp(typ * 1.6 - 0.6))), { 'font-size': 14.5, 'font-weight': 700 });
    // 세 칸
    const on = [k >= 2, k >= 4, k >= 5];
    SL.forEach((p, i) => slot(p.x, SY, SW, SH, p.t, on[i], { col: k === 7 ? GOOD : ACC, bg: k === 7 ? GOODBG : PANEL, s: (k === 2 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 2) ? 1 + R.bump(u, 0.2) : 1 }));
    if (k >= 2) { mono(SL[0].x - SW / 2 + 14, SY + 8, 'refId: A', { 'font-size': 17, 'font-weight': 800 });
      tx(SL[0].x - SW / 2 + 14, SY + 34, k >= 3 ? '5xx ÷ 전체 = 비율 1개' : 'datasource: Prometheus', { 'font-size': 14, fill: MUT }); }
    if (k >= 4) { mono(SL[1].x - SW / 2 + 14, SY + 8, 'refId: C (threshold)', { 'font-size': 16, 'font-weight': 800 });
      mono(SL[1].x - SW / 2 + 14, SY + 34, 'A  gt  0.05', { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
    if (k >= 5) { mono(SL[2].x - SW / 2 + 14, SY + 8, 'for: 5m', { 'font-size': 19, 'font-weight': 800 });
      tx(SL[2].x - SW / 2 + 14, SY + 34, 'noData · execErr 정책', { 'font-size': 14, fill: MUT }); }
    if (k >= 4) grow(SL[0].x + SW / 2, SY, SL[1].x - SW / 2, SY, k === 4 ? E(u, 0.2, 0.8) : 1, ACC);
    if (k >= 5) grow(SL[1].x + SW / 2, SY, SL[2].x - SW / 2, SY, k === 5 ? E(u, 0.2, 0.8) : 1, ACC);
    // 아래 칸: beat 마다 하나
    const BY = 262;
    if (k === 1) { tagL(150, BY + 30, 'uid', INFO, { mono: true, s: pop(u, 1.4) }); tx(220, BY + 35, '기계가 규칙을 찾는 키 · 바꾸면 다른 규칙', { 'font-size': 15, opacity: fade(u, 1.5) });
      tagL(150, BY + 84, 'title', ACC, { mono: true, s: pop(u, 1.9) }); tx(220, BY + 89, '알림에 찍히는 사람용 이름', { 'font-size': 15, opacity: fade(u, 2.0) }); }
    if (k === 2) { el('rect', { x: SL[1].x - SW / 2 - 4, y: SY - SH / 2 - 4, width: SW + 8, height: SH + 8, rx: 14, fill: 'none', stroke: INFO, 'stroke-width': 2.6, opacity: fade(u, 0.8) });
      mono(SL[1].x - SW / 2 + 14, SY + 8, 'condition: C', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.0) });
      tx(SL[1].x - SW / 2 + 14, SY + 34, '판정할 노드 C 를 가리킨다', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.6) });
      sub(480, BY + 70, '알람은 패널 그림이 아니라 쿼리가 돌려준 숫자를 본다', fade(u, 2.0), { 'font-size': 15 }); }
    if (k === 3) { const cx = 330, g = E(u, 0.3, 1.2);
      mono(cx, BY + 30, 'sum(rate(http_requests_total{status=~"5.."}[5m]))', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.2) });
      el('line', { x1: cx - 230 * g, y1: BY + 48, x2: cx + 230 * g, y2: BY + 48, stroke: INK, 'stroke-width': 2.5 });
      mono(cx, BY + 74, 'sum(rate(http_requests_total[5m]))', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      grow(590, BY + 48, 660, BY + 48, E(u, 1.4, 1.9), ACC);
      card(760, BY + 48, 180, 56, { rx: 10, stroke: ACC, sw: 2.5, text: '비율 1개', fs: 17, fw: 800, color: ACC, s: pop(u, 1.9) });
      sub(760, BY + 96, 'instant: true — 한 시점 값', fade(u, 2.2)); }
    if (k === 4) { const ax = axes(110, BY + 20, 620, 40, { x: [0, 15], y: [0, 1], xt: [0, 5, 10, 15] }), X = ax.X, g = E(u, 0.4, 1.2);
      el('rect', { x: X(5), y: BY + 14, width: (X(15) - X(5)) * g, height: 46, fill: BADBG, opacity: 0.9 });
      el('line', { x1: X(5), y1: BY + 8, x2: X(5), y2: BY + 64, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
      mono(X(5), BY + 2, '임계 5%', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
      tx(X(15) + 10, BY + 66, '%', { 'font-size': 14, fill: MUT });
      [[0.5, GOOD, '평소 0.5%', 1.2], [12, BAD, '사고 12%', 1.8]].forEach(([v, col, s, a]) => { el('circle', { cx: X(v), cy: BY + 38, r: 9 * pop(u, a), fill: col });
        tx(X(v), BY + 100, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, a + 0.2) }); });
      tx(780, BY + 44, 'gt 0.05 → 참', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); }
    if (k === 5) { const x0 = 120, w = 520, f = E(u, 0.3, 2.2);
      tx(x0, BY + 18, '임계를 넘은 채로', { 'font-size': 14, fill: MUT });
      el('rect', { x: x0, y: BY + 30, width: w, height: 22, rx: 6, fill: SOFT }); el('rect', { x: x0, y: BY + 30, width: w * f, height: 22, rx: 6, fill: WARN });
      ['0', '1m', '2m', '3m', '4m', '5m'].forEach((s, i) => mono(x0 + (w * i) / 5, BY + 74, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      if (f > 0.98) tx(x0 + w + 14, BY + 47, 'Firing', { 'font-size': 16, 'font-weight': 800, fill: BAD });
      tagL(x0, BY + 108, 'noDataState: NoData', INFO, { mono: true, fs: 13.5, s: pop(u, 1.6) });
      tagL(x0 + 230, BY + 108, 'execErrState: Error', INFO, { mono: true, fs: 13.5, s: pop(u, 1.9) }); }
    if (k === 6) { const ls = [['severity: warning', 0.3], ['team: backend', 0.6]];
      ls.forEach(([s, a], i) => tagL(80, BY + 22 + i * 40, s, ACC, { mono: true, fs: 13.5, s: pop(u, a) }));
      grow(290, BY + 42, 380, BY + 42, E(u, 0.9, 1.3), ACC); card(450, BY + 42, 130, 44, { rx: 8, text: '라우팅', fs: 15, stroke: ACC, color: ACC, s: pop(u, 1.3) });
      sub(450, BY + 86, '기계가 읽는다', fade(u, 1.4));
      card(660, BY + 42, 200, 70, { rx: 6, fill: WARNBG, stroke: WARN, sw: 2, s: pop(u, 1.6) });
      tx(574, BY + 32, 'summary', { 'font-size': 13.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.7) }); tx(574, BY + 58, 'runbook_url', { 'font-size': 13.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.8) });
      grow(762, BY + 42, 820, BY + 42, E(u, 2.0, 2.3), MUT); R.person(870, BY + 30, null, { s: 0.8, op: fade(u, 2.2) }); sub(870, BY + 86, '사람이 읽는다', fade(u, 2.3)); }
    if (k === 7) { banner(480, BY + 50, 'Query + Condition + For → 규칙이 산다', pop(u, 0.5)); check(480 + 190, BY + 50, 12, pop(u, 1.2));
      sub(480, BY + 104, 'for 길이가 알람 품질을 좌우한다 · 짧으면 깜빡이, 길면 늦다', fade(u, 1.5), { 'font-size': 15 }); } }

  // ---------- 2. 상태 전이 ----------
  const ST = [{ id: 'idle', n: 'Normal', x: 120, col: GOOD }, { id: 'pending', n: 'Pending', x: 360, col: WARN }, { id: 'firing', n: 'Firing', x: 600, col: BAD }, { id: 'resolved', n: 'Normal', x: 840, col: GOOD, s2: '(Resolved)' }];
  const SX = (id) => (ST.find((s) => s.id === id) || ST[0]).x;
  function machine(c, opIn) { const { k, u } = c, cur = c.beat.state, prev = c.prev ? c.prev.state : cur;
    ST.forEach((s, i) => { const a = opIn(i), on = s.id === cur;
      card(s.x, 62, 170, 54, { rx: 27, stroke: on ? s.col : GRID, sw: on ? 3 : 2, fill: on ? (s.col === GOOD ? GOODBG : s.col === WARN ? WARNBG : BADBG) : PANEL, s: a });
      tx(s.x, s.s2 ? 60 : 68, s.n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: on ? s.col : MUT, opacity: a });
      if (s.s2) tx(s.x, 79, s.s2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: on ? s.col : MUT, opacity: a });
      if (i < 3) grow(s.x + 86, 62, ST[i + 1].x - 88, 62, opIn(i + 0.6), MUT); });
    // 토큰: 앞 beat 상태에서 지금 상태로
    const x = lerp(SX(prev), SX(cur), E(u, 0.3, 1.3));
    el('circle', { cx: x, cy: 100, r: 8, fill: INK, opacity: opIn(3) }); }
  function gauge(c, y) { const b = c.beat, p = c.prev || b, v = tween(p.valueNow, b.valueNow, c.u), th = b.threshold, x0 = 70, w = 390, max = 0.1, X = (q) => x0 + (w * clamp(q / max));
    tx(x0, y - 16, '5xx 비율', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    el('rect', { x: x0, y, width: w, height: 26, rx: 6, fill: SOFT });
    el('rect', { x: x0, y, width: X(v) - x0, height: 26, rx: 6, fill: v > th ? BAD : GOOD });
    el('line', { x1: X(th), y1: y - 8, x2: X(th), y2: y + 34, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
    mono(X(th), y + 52, '임계 ' + pct(th), { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
    mono(x0 + w + 12, y + 19, pct(v), { 'font-size': 20, 'font-weight': 800, fill: v > th ? BAD : GOOD }); }
  function forBar(c, y) { const b = c.beat, p = c.prev || b, F = secs(b.forDuration) || 300, cur = tween(secs(p.currentFor) ?? 0, secs(b.currentFor) ?? 0, c.u), x0 = 560, w = 330, f = clamp(cur / F);
    tx(x0, y - 16, 'for ' + b.forDuration + ' 카운트', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    el('rect', { x: x0, y, width: w, height: 26, rx: 6, fill: SOFT }); el('rect', { x: x0, y, width: w * f, height: 26, rx: 6, fill: f >= 1 ? BAD : WARN });
    mono(x0 + w, y + 52, fmtS(cur) + ' / ' + b.forDuration, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, fill: f >= 1 ? BAD : INK }); }
  function s2(t, c) { const { k, u } = c;
    machine(c, (i) => (k === 0 ? pop(u, 0.2 + i * 0.35) : 1));
    if (k === 0) { const p = el('path', { d: 'M 840 92 C 820 140, 150 140, 122 92', fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.9) });
      sub(480, 150, '해소되면 다시 Normal — 그 순간을 Resolved 라고 부른다', fade(u, 2.1), { 'font-size': 15 });
      sub(480, 240, '상태는 평가 주기(1m)마다 다시 계산된다', fade(u, 2.3), { 'font-size': 15 }); return; }
    gauge(c, 170); forBar(c, 170);
    const Y = 300;
    if (k === 1) { bell(480, Y + 20, pop(u, 0.4), MUT, true); sub(480, Y + 70, '2~3% < 5% — 알림 없음, 카운트 0', fade(u, 0.8), { 'font-size': 15 }); }
    if (k === 2) { pill(480, Y + 10, 'for 카운트 시작 · 아직 알림 안 보냄', WARN, pop(u, 1.2), { fs: 15 }); sub(480, Y + 54, '넘긴 했는데 아직 못 믿겠다', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 3) { bell(200, Y + 24, 1 + R.bump(u, 1.3), BAD); fly(240, Y + 24, 620, Y + 24, seg(u, 1.4, 2.4), 'firing', { fill: BAD, stay: true });
      card(800, Y + 24, 180, 50, { rx: 10, text: 'Notification\nPolicy', fs: 14, stroke: INK, s: pop(u, 0.6) }); }
    if (k === 4) { fly(240, Y + 24, 600, Y + 24, seg(u, 1.2, 2.2), 'resolved', { fill: GOOD, stay: true });
      card(800, Y + 24, 180, 50, { rx: 10, text: '해소 알림', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 0.6) }); sub(380, Y + 76, '사람이 상황 종료를 안다', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 5) { // 깜빡이: 짧게 튄 값마다 알람
      const x0 = 80, w = 800, pk = [0.15, 0.42, 0.7], g = E(u, 0.2, 2.2);
      el('line', { x1: x0, y1: Y + 50, x2: x0 + w * g, y2: Y + 50, stroke: MUT, 'stroke-width': 2 });
      pk.forEach((p, i) => { if (g < p) return; const x = x0 + w * p; el('path', { d: `M${x - 18},${Y + 50} L${x},${Y + 8} L${x + 18},${Y + 50}`, fill: 'none', stroke: BAD, 'stroke-width': 2.6 }); bell(x + 38, Y + 30, 0.7, BAD); });
      tx(x0 + w, Y + 86, 'for 1m — 잠깐 튄 값마다 알람', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }
    if (k === 6) { const x0 = 80, gap = E(u, 0.2, 0.8);
      el('polyline', { points: `${x0},${Y + 40} ${x0 + 60},${Y + 30} ${x0 + 120},${Y + 36} ${x0 + 180},${Y + 28}`, fill: 'none', stroke: ACC, 'stroke-width': 2.6 });
      el('line', { x1: x0 + 190, y1: Y + 30, x2: x0 + 330, y2: Y + 30, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 6', opacity: gap });
      tx(x0 + 260, Y + 64, '데이터 끊김', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: gap });
      tagL(470, Y + 14, 'noDataState: NoData', INFO, { mono: true, fs: 13.5, s: pop(u, 1.0) });
      tagL(470, Y + 58, 'execErrState: Alerting', BAD, { mono: true, fs: 13.5, s: pop(u, 1.5) });
      sub(480, Y + 104, '안 정하면 수집이 끊긴 것과 정상인 것이 똑같이 조용하다', fade(u, 2.0), { 'font-size': 15 }); }
    if (k === 7) { [['critical', '1m', BAD], ['warning', '5m', WARN], ['info', '10m', INFO]].forEach(([s, f, col], i) => { const y = Y - 6 + i * 36, w = 46 * (secs(f) / 60) * E(u, 0.2 + i * 0.3, 1.2 + i * 0.3);
        tx(80, y + 17, s, { 'font-size': 15, 'font-weight': 700, fill: col }); el('rect', { x: 180, y: y + 4, width: Math.max(2, w), height: 18, rx: 4, fill: col, opacity: 0.85 });
        mono(190 + Math.max(2, w), y + 18, 'for ' + f, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.3) }); });
      tx(820, Y + 40, '심할수록 짧게', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.8) }); } }

  // ---------- 3. Firing payload ----------
  const JS = [
    ['{', 0], ['"receiver": "slack-backend",', 1], ['"status": "firing",', 1], ['"alerts": [{', 1],
    ['"labels": { severity, team, instance },', 2], ['"annotations": { summary, … },', 2], ['"startsAt": "2026-05-20T10:23:15Z",', 2], ['"endsAt": "0001-01-01T00:00:00Z",', 2],
    ['"values": { "A": 0.12, "C": 1 },', 2], ['"fingerprint": "f7a9b2c3d4e5f6a7",', 2], ['"generatorURL": "…/abc123/view"', 2], ['}],', 1],
    ['"groupLabels": { alertname },', 1], ['"commonLabels": { alertname, severity, team }', 1], ['}', 0]];
  const HI = [[1, 2], [4], [5], [6, 7], [8], [12, 13], [2, 4, 5], [9, 10]];
  function jsonCard(k, u) { const x = 24, y = 18, lh = 25;
    el('rect', { x, y, width: 430, height: JS.length * lh + 24, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    JS.forEach(([s, ind], i) => { const hot = HI[k].includes(i), yy = y + 20 + i * lh;
      if (hot) el('rect', { x: x + 6, y: yy - 2, width: 418 * E(u, 0.1, 0.6), height: lh - 2, rx: 5, fill: ACCBG });
      mono(x + 16 + ind * 18, yy + 16, s, { 'font-size': 13.5, fill: hot ? INK : MUT, 'font-weight': hot ? 700 : 400 }); }); }
  function slackMsg(cx, cy, w, h, lines, s) { const g = card(cx, cy, w, h, { rx: 10, stroke: GRID, sw: 1.5, s });
    el('rect', { x: -w / 2, y: -h / 2, width: 6, height: h, rx: 3, fill: BAD }, g);
    lines.forEach(([str, a], i) => tx(-w / 2 + 20, -h / 2 + 26 + i * 24, str, Object.assign({ 'font-size': 14 }, a || {}), g)); }
  function s3(t, c) { const { k, u } = c, RX = 700;
    jsonCard(k, u);
    if (k === 0) { card(560, 120, 140, 50, { rx: 25, text: 'Firing', fs: 17, fw: 800, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.2) });
      fly(560, 160, 820, 260, seg(u, 0.8, 2.0), '{ JSON }', { fill: ACC, stay: true, mono: true });
      card(830, 300, 190, 54, { rx: 10, text: 'slack-backend', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.6) });
      sub(RX, 390, '채널이 받는 것은 그래프가 아니라 이 JSON 이다', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 1) { [['severity=warning', 70], ['team=backend', 120], ['instance=api-prod-3:8080', 170]].forEach(([s, y], i) => tagL(480, y, s, ACC, { mono: true, fs: 13.5, s: pop(u, 0.2 + i * 0.25) }));
      const sx = 560, sy = 270; card(sx, sy, 110, 40, { rx: 8, text: '정책 트리', fs: 14, s: pop(u, 1.0) });
      [['team=backend', 230, GOOD], ['team=database', 320, MUT]].forEach(([s, y, col], i) => { grow(sx + 55, sy, 700, y, E(u, 1.2 + i * 0.2, 1.7 + i * 0.2), col);
        card(800, y, 190, 38, { rx: 8, text: s, fs: 13.5, mono: true, stroke: col, color: col, s: pop(u, 1.7 + i * 0.2) }); });
      dot([[sx + 55, sy], [700, 230]], seg(u, 1.9, 2.7), GOOD, 7); }
    if (k === 2) { slackMsg(RX, 200, 440, 150, [['5xx 비율이 5%를 5분 이상 넘었다', { 'font-weight': 800 }], ['현재 12% — 평소 0.5% 대비 24배'], ['runbook: wiki.local/runbooks/api-5xx', { fill: INFO, class: 'mono', 'font-size': 13.5 }]], pop(u, 0.3));
      sub(RX, 320, 'summary · description · runbook_url', fade(u, 1.2), { 'font-size': 15 }); sub(RX, 350, '무슨 일인지, 얼마나 심한지, 어디를 볼지', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 3) { const x0 = 490, w = 420, y = 180, g = E(u, 0.2, 1.4);
      el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: MUT, 'stroke-width': 2 });
      el('rect', { x: x0 + 60, y: y - 14, width: (w - 80) * g, height: 28, rx: 6, fill: BAD, opacity: 0.8 });
      el('circle', { cx: x0 + 60, cy: y, r: 7, fill: BAD });
      mono(x0 + 60, y - 26, 'startsAt 10:23:15', { 'font-size': 14, 'font-weight': 700, fill: BAD });
      tx(x0 + w, y + 40, 'endsAt 비어 있음 → 진행 중', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      sub(RX, 300, '0001-01-01 은 "아직 없음" 자리표시', fade(u, 2.0), { 'font-size': 15 }); }
    if (k === 4) { const x0 = 500, w = 380, X = (v) => x0 + (w * v) / 0.15;
      tx(x0, 100, 'A (쿼리 값)', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: x0, y: 116, width: w, height: 28, rx: 6, fill: SOFT }); el('rect', { x: x0, y: 116, width: (X(0.12) - x0) * E(u, 0.2, 1.2), height: 28, rx: 6, fill: BAD });
      el('line', { x1: X(0.05), y1: 106, x2: X(0.05), y2: 154, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); mono(X(0.05), 174, '0.05', { 'font-size': 13.5, 'text-anchor': 'middle' });
      mono(X(0.12) + 10, 136, '0.12', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      tx(x0, 240, 'C (조건 판정)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      el('circle', { cx: x0 + 160, cy: 235, r: 18 * pop(u, 1.6), fill: BAD }); mono(x0 + 192, 241, '1 = 참', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }
    if (k === 5) { for (let i = 0; i < 3; i++) { const yy = 90 + i * 60, g = E(u, 0.8, 1.8); env(lerp(520, 640, g), lerp(yy, 190, g), 1, ACC, { op: 1 - g * 0.6 }); }
      grow(670, 190, 720, 190, E(u, 1.6, 2.0), ACC);
      slackMsg(820, 190, 190, 90, [['alertname:', { 'font-size': 13.5, fill: MUT }], ['API 5xx 비율 높음', { 'font-weight': 800, 'font-size': 13.5 }]], pop(u, 1.9));
      sub(RX, 330, '같은 그룹 알람은 공통 라벨 아래 한 메시지로', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 6) { card(590, 110, 190, 46, { rx: 23, text: 'status: firing', mono: true, fs: 14, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      card(810, 110, 210, 46, { rx: 23, text: 'status: resolved', mono: true, fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 0.5) });
      card(590, 250, 190, 90, { rx: 10, text: 'labels\n기계 · 라우팅', fs: 15, stroke: ACC, color: ACC, s: pop(u, 1.0) });
      card(810, 250, 210, 90, { rx: 10, text: 'annotations\n사람 · 메시지', fs: 15, stroke: WARN, color: INK, s: pop(u, 1.4) }); }
    if (k === 7) { mono(490, 100, 'fingerprint f7a9b2c3d4e5f6a7', { 'font-size': 14, 'font-weight': 700 });
      env(540, 160, pop(u, 0.4), ACC); env(540, 220, pop(u, 0.8), ACC, { op: 1 - E(u, 1.2, 1.8) * 0.7 });
      grow(570, 190, 660, 190, E(u, 1.0, 1.4), ACC); card(740, 190, 140, 44, { rx: 8, text: '같은 알람 1건', fs: 14, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      const ax = { X: (v) => 520 + v * 36, Y: (v) => 360 - v * 8 }; el('rect', { x: 500, y: 290, width: 400, height: 90, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.8) });
      line(ax, [[0, 1], [1, 2], [2, 1.5], [3, 3], [4, 6], [5, 8], [6, 7.5], [7, 8.5], [8, 8], [9, 9], [10, 8.6]], E(u, 1.9, 2.6), BAD);
      tx(890, 312, 'generatorURL → 원본 화면', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 2.0) }); } }

  // ---------- 4. 인스턴스별 알람 ----------
  const IN = [{ n: 'api-1', v: 82, y: 130 }, { n: 'api-2', v: 45, y: 220 }, { n: 'api-3', v: 91, y: 310 }];
  function s4(t, c) { const { k, u } = c;
    if (k === 6) { // 차원 폭발: 곱하기
      tx(480, 40, 'by (instance, container, pod, path)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono' });
      const fs = ['instance', 'container', 'pod', 'path']; fs.forEach((f, i) => { pill(150 + i * 220, 90, f, ACC, pop(u, 0.2 + i * 0.2), { mono: true }); if (i) tx(150 + i * 220 - 110, 96, '×', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3 + i * 0.2) }); });
      const n = Math.floor(E(u, 0.9, 2.4) * 360); for (let i = 0; i < n; i++) { const r = Math.floor(i / 36), q = i % 36; el('rect', { x: 120 + q * 20, y: 130 + r * 22, width: 16, height: 18, rx: 3, fill: BAD, opacity: 0.25 + 0.6 * ((i * 37) % 11) / 11 }); }
      banner(480, 388, '시계열이 곱으로 늘면 알람도 같이 터진다', pop(u, 2.2)); return; }
    // 규칙 하나
    card(130, 220, 200, 120, { rx: 12, stroke: ACC, sw: 2.5, s: k === 0 ? pop(u, 0.2) : 1 });
    tx(130, 196, '규칙 1개', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.4) : 1 });
    tx(130, 222, 'CPU 높음', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.5) : 1 });
    tx(130, 246, '(인스턴스별)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
    if (k === 0) { grow(230, 220, 330, 220, E(u, 1.0, 1.6), MUT); tx(350, 214, '제목은 하나로 고정', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(350, 240, '알람이 몇 개가 될지는 쿼리 결과가 정한다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    const sp = k === 1 ? E(u, 0.2, 1.4) : 1, BX = 420, BW = 300, X = (v) => BX + (BW * v) / 100;
    mono(240, 100, 'by (instance)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.2) : 1 });
    IN.forEach((m, i) => { const y = lerp(220, m.y, sp), firing = k >= 4 && m.v > 80, pend = k >= 2 && m.v > 80;
      el('path', { d: `M230,220 C280,220 280,${y} 330,${y}`, fill: 'none', stroke: firing ? BAD : pend ? WARN : MUT, 'stroke-width': 2.4 });
      mono(340, y + 6, m.n, { 'font-size': 16, 'font-weight': 800, opacity: sp });
      el('rect', { x: BX, y: y - 13, width: BW, height: 26, rx: 6, fill: SOFT, opacity: sp });
      el('rect', { x: BX, y: y - 13, width: (X(m.v) - BX) * sp, height: 26, rx: 6, fill: pend ? (firing ? BAD : WARN) : GOOD, opacity: 0.9 });
      mono(X(m.v) + 8, y + 6, m.v + '%', { 'font-size': 15, 'font-weight': 800, opacity: sp });
      if (k >= 2) { el('line', { x1: X(80), y1: y - 20, x2: X(80), y2: y + 20, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '5 4' }); }
      const st = firing ? ['Firing', BAD] : pend ? ['Pending', WARN] : ['Normal', GOOD];
      if (k >= 2) pill(k === 7 ? 790 : 830, y, st[0], st[1], k === 2 && m.v > 80 ? pop(u, 0.6 + i * 0.2) : k === 4 && m.v > 80 ? 1 + R.bump(u, 1.0) : 1, { fs: 14 });
      if (k === 3 && m.v > 80) { const F = 300, cur = m.n === 'api-3' ? secs(c.beat.currentFor) : null, f = cur != null ? cur / F : 0.22;
        el('rect', { x: BX, y: y + 18, width: BW * f * E(u, 0.3, 1.6), height: 8, rx: 3, fill: WARN });
        if (cur != null) mono(BX + BW + 10, y + 28, fmtS(cur) + ' / 5m', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); }
      if (k === 4 && m.v > 80) tagL(BX, y + 34, 'host=' + m.n, ACC, { mono: true, fs: 13.5, s: pop(u, 0.4 + i * 0.2) }); });
    if (k === 2) tx(X(80), 80, '임계 80', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.3) });
    if (k === 3) sub(560, 392, '카운트도 시계열마다 따로 흐른다 · 먼저 넘은 쪽이 먼저 발화', fade(u, 1.8), { 'font-size': 15 });
    if (k === 5) { sub(560, 392, '알람 3개가 각자 전이하고 알림도 따로 간다', fade(u, 0.6), { 'font-size': 15 });
      IN.forEach((m, i) => { if (m.v > 80) env(905, m.y, pop(u, 1.0 + i * 0.2), BAD); }); }
    if (k === 7) { const g = E(u, 0.5, 1.6);
      [IN[0], IN[2]].forEach((m) => env(lerp(905, 905, g), lerp(m.y, 220, g), 1, BAD, { op: 1 - g * 0.5 }));
      card(900, 220, 100, 50, { rx: 10, text: '메시지 1건', fs: 14, stroke: BAD, color: BAD, fill: PANEL, s: pop(u, 1.6) });
      mono(945, 274, 'group_by: [alertname]', { 'font-size': 13.5, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 1.8) });
      clock(880, 330, 18, E(u, 0.3, 2.4), WARN, 'group_wait 30s'); } }

  // ---------- 5. 해소까지 한 사이클 ----------
  const OUT = ['group prod-critical · 1m', 'A = 5xx ÷ 전체', 'C: A gt 0.05', 'for: 5m', 'noData · execErr: Alerting', 'labels: severity · team · service', 'annotations: runbook · dashboard'];
  function s5(t, c) { const { k, u, steps } = c, vals = steps.map((s) => s.valueNow), ax = axes(70, 50, 430, 230, { x: [0, 8], y: [0, 0.1], yt: [0, 0.05, 0.1], grid: true, yl: '5xx 비율' });
    el('line', { x1: ax.X(0), y1: ax.Y(0.05), x2: ax.X(8), y2: ax.Y(0.05), stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
    tx(ax.X(8), ax.Y(0.05) - 8, '임계 0.05', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 });
    const pts = vals.map((v, i) => [i, v]);
    line(ax, pts.slice(0, k + 1), k === 0 ? 1 : (k - 1 + E(u, 0.2, 1.2)) / k, INK, { sw: 2.6 });
    pts.slice(0, k + 1).forEach(([i, v]) => { const s = i === k && k ? pop(u, 1.1) : 1; if (s <= 0) return; el('circle', { cx: ax.X(i), cy: ax.Y(v), r: (i === k ? 7 : 5) * s, fill: v > 0.05 ? BAD : GOOD }); });
    mono(ax.X(k) + 12, ax.Y(vals[k]) - 10, pct(vals[k]), { 'font-size': 16, 'font-weight': 800, fill: vals[k] > 0.05 ? BAD : GOOD, opacity: k === 0 ? 1 : fade(u, 1.0) });
    // 상태 띠
    for (let i = 0; i <= k; i++) { const s = steps[i].state, x = ax.X(i) - 24, op = i === k && k ? fade(u, 1.0) : 1;
      el('rect', { x: Math.max(70, x), y: 318, width: 48 - (x < 70 ? 70 - x : 0), height: 24, fill: s === 'firing' ? BAD : GOOD, opacity: 0.85 * op }); }
    tx(70, 364, '상태', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    tx(120, 364, 'Firing', { 'font-size': 14, fill: BAD, 'font-weight': 700 }); tx(186, 364, 'Normal (Resolved)', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: k >= 6 ? 1 : 0.35 });
    // 오른쪽: 규칙 한 줄씩
    const x0 = 560;
    if (k <= 6) { OUT.forEach((s, i) => { const y = 54 + i * 44, on = i === k, past = i < k;
        if (on) el('rect', { x: x0 - 10, y: y - 22, width: 380 * E(u, 0.1, 0.6), height: 36, rx: 8, fill: ACCBG });
        mono(x0, y + 2, s, { 'font-size': 14.5, 'font-weight': on ? 800 : 500, fill: on ? INK : past ? INK : OFF }); });
      if (k === 3) sub(750, 380, 'for 는 발화 쪽에만 · 내려오면 바로 Normal', fade(u, 1.4), { 'font-size': 14.5 });
      if (k === 6) { env(840, 380, pop(u, 1.2), GOOD); tx(810, 386, 'resolved 알림', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.4) }); } return; }
    if (k === 7) { tx(x0, 50, '좋은 알람 5가지', { 'font-size': 17, 'font-weight': 800 });
      ['할 일이 있다', '제때 온다', '조용하다 (for 5m+)', '런북 링크가 있다', 'severity 가 나뉜다'].forEach((s, i) => { const y = 96 + i * 52; check(x0 + 12, y, 10, pop(u, 0.3 + i * 0.3)); tx(x0 + 36, y + 6, s, { 'font-size': 15.5, 'font-weight': 600, opacity: fade(u, 0.35 + i * 0.3) }); }); return; }
    tx(x0, 50, '피할 것 4가지', { 'font-size': 17, 'font-weight': 800 });
    ['for: 0 → 깜빡임', 'severity 없음 → 무뎌짐', '런북 없음 → 새벽에 헤맴', '차원 폭발 → 알람 100개'].forEach((s, i) => { const y = 96 + i * 56; cross(x0 + 12, y, 9, pop(u, 0.3 + i * 0.3)); tx(x0 + 36, y + 6, s, { 'font-size': 15.5, 'font-weight': 600, opacity: fade(u, 0.35 + i * 0.3) }); });
    banner(740, 360, '사이클 끝 — 다시 Normal', pop(u, 1.8)); }

  const quiz = [
    { q: 'condition: C가 가리키는 것은 무엇인가?',
      o: ['알람을 보낼 채널 이름', '판정에 쓸 노드(refId C)의 결과', '평가 주기 1분'], a: 1,
      why: 'condition은 data 노드 중 어느 결과로 알람 여부를 정할지 가리킨다. 여기서는 A 값을 gt 0.05로 비교하는 threshold 노드 C다.' },
    { q: '5xx 비율이 임계를 막 넘어 for 5m 중 20초가 지났다. 지금 상태는 무엇인가?',
      o: ['Firing', 'Normal', 'Pending'], a: 2,
      why: '임계를 넘으면 먼저 Pending이 되고 for 카운트가 시작된다. 5분을 채워야 Firing이 되어 알림이 나간다.' },
    { q: 'Firing payload에서 알림을 어느 채널로 보낼지 정하는 데 쓰이는 것은 무엇인가?',
      o: ['labels의 severity·team', 'annotations의 runbook_url', 'startsAt 시각'], a: 0,
      why: 'labels는 기계가 읽는 라우팅 키다. annotations는 사람이 읽는 메시지, startsAt은 발화 시각이다.' },
    { q: 'avg by (instance) 규칙에서 api-1 82%, api-2 45%, api-3 91%이고 임계가 80이면 알람은 어떻게 되나?',
      o: ['평균 72.7%라 알람이 하나도 없다', 'api-1과 api-3 알람만 따로 발화한다', '규칙 하나라 알람도 하나만 발화한다'], a: 1,
      why: 'by (instance)로 시계열이 셋으로 갈라지고 판정도 시계열마다 따로 한다. 80을 넘은 두 인스턴스만 각자 Firing이 된다.' },
    { q: 'Firing 중이던 에러율이 임계 아래로 내려오면 Grafana는 언제 Normal로 바꾸나?',
      o: ['다음 평가에서 바로 바꾼다', 'for 5m 동안 더 지켜본 뒤 바꾼다', '사람이 직접 해소 버튼을 눌러야 바꾼다'], a: 0,
      why: 'for는 발화 쪽에만 걸린다. 조건이 거짓이 되면 다음 평가에서 Normal이 되고 resolved 알림이 나간다.' },
  ];

  const summary = [
    '알람 규칙은 쿼리 A, 판정 노드 C, 지속 시간 for 세 칸으로 만든다.',
    '임계를 넘으면 Pending이 되고, for 5m을 채워야 Firing이 되어 알림이 나간다.',
    '알림 JSON에서 labels는 라우팅에 쓰이고 annotations는 사람이 읽는 메시지가 된다.',
    'by (instance)로 쪼갠 시계열은 각자 판정되고, 값이 내려오면 다음 평가에서 Normal이 된다.',
  ];
  const review = [
    { q: '새벽에 5xx가 10초쯤 튈 때마다 알람이 왔다. 먼저 손볼 곳은?',
      o: ['labels에 team 라벨 추가', 'for를 0에서 5m 정도로 늘리기', 'annotations에 runbook_url 추가'], a: 1,
      why: 'for가 너무 짧으면 잠깐 튄 값에도 Firing이 된다. for를 늘리면 그 시간 동안 계속 넘어야만 알림이 나간다.' },
    { q: 'api 세 대 중 한 대만 CPU 95%인데 알람이 안 왔다. 쿼리에서 먼저 의심할 것은?',
      o: ['for가 너무 길다', 'noDataState가 OK로 되어 있다', 'by (instance) 없이 전체 평균만 본다'], a: 2,
      why: '전체 평균은 한 대의 이상을 묻어 버린다. by (instance)로 나눠야 인스턴스마다 따로 판정된다.' },
    { q: 'Slack에 온 알림을 보고 무엇을 해야 할지 몰라 대응이 늦었다. 규칙에서 채울 곳은?',
      o: ['annotations의 summary와 runbook_url', 'labels의 severity', 'interval을 1m에서 30s로 줄이기'], a: 0,
      why: '사람이 읽는 메시지와 런북 링크는 annotations에 들어간다. labels는 라우팅용이라 대응 방법을 알려 주지 않는다.' },
  ];

  R.page({ title: 'Alert Rule 동작', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
