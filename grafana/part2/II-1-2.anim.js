/* II-1-2 Loki — 로그 시각화 · 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 예시 로그 6줄(아래 LOGS)은 예전 LOG_LINES 를 logfmt 로 옮긴 것이다. 줄 번호와 통과 여부는 STEPS 의 keptIds 를 따른다.
 * 27줄 / 0.09 / 900·12 같은 메트릭 값은 이 예시 기준이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, browser, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const LOGS = [
    { id: 1, app: 'api', level: 'info', text: 'level=info method=GET path=/users status=200 latency_ms=12 traceID=a1b2c3' },
    { id: 2, app: 'api', level: 'error', text: 'level=error method=POST path=/pay status=500 msg="upstream timeout" traceID=d4e5f6' },
    { id: 3, app: 'api', level: 'error', text: 'level=error msg="DB connection refused" traceID=99aa88' },
    { id: 4, app: 'web', level: 'info', text: 'level=info msg="render /home" status=200' },
    { id: 5, app: 'api', level: 'warn', text: 'level=warn msg="slow query" path=/orders latency_ms=900' },
    { id: 6, app: 'api', level: 'info', text: 'level=info method=GET path=/health status=200 msg=healthcheck' },
  ];
  const LV = { info: INFO, warn: WARN, error: BAD };
  const API = LOGS.filter((l) => l.app === 'api');
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  // 로그 한 줄: 레벨 점 + app 칩 + 본문. o.on(통과)·o.off(탈락)·o.hi(본문에서 강조할 문자열)
  function logRow(x, y, l, o) { o = o || {}; const off = o.off, op = o.op ?? 1, n = o.n || 70, fs = 13.5;
    if (o.on) el('rect', { x: x - 6, y: y - 15, width: o.w || 880, height: 24, rx: 5, fill: o.bg || ACCBG, opacity: op });
    el('circle', { cx: x + 5, cy: y - 4, r: 5, fill: off ? OFF : LV[l.level], opacity: op });
    if (!o.noApp) mono(x + 18, y, l.app, { 'font-size': fs, 'font-weight': 700, fill: off ? OFF : MUT, opacity: op });
    const tx0 = x + (o.noApp ? 18 : 58), body = short(l.text, n);
    if (o.hi && body.includes(o.hi)) { const i = body.indexOf(o.hi), cw = fs * 0.6;
      el('rect', { x: tx0 + i * cw - 2, y: y - 14, width: o.hi.length * cw + 4, height: 19, rx: 3, fill: C.HL, opacity: (o.hiOp ?? 1) * op }); }
    mono(tx0, y, body, { 'font-size': fs, fill: off ? OFF : INK, opacity: op, 'text-decoration': o.strike ? 'line-through' : null }); }
  function qline(x, y, w, text, o) { o = o || {};
    el('rect', { x, y, width: w, height: 38, rx: 8, fill: INK, opacity: o.op ?? 1 });
    mono(x + 14, y + 25, 'LogQL', { 'font-size': 13.5, 'font-weight': 800, fill: WARN, opacity: o.op ?? 1 });
    mono(x + 70, y + 25, text || '', { 'font-size': o.fs || 14, fill: PANEL, opacity: o.op ?? 1 }); }
  function waterfall(x, y, u0, o) { o = o || {};
    [['POST /pay', 0, 1, INFO], ['auth', 0.03, 0.12, INFO], ['upstream call', 0.16, 0.97, BAD]].forEach(([n, a, z, col], i) => {
      const yy = y + i * 40, w = (z - a) * 250 * E(u0, 0.1 + i * 0.15, 0.6 + i * 0.15);
      el('rect', { x: x + a * 250, y: yy, width: Math.max(1, w), height: 16, rx: 3, fill: col, opacity: 0.85 });
      tx(x + a * 250, yy + 32, n, { 'font-size': 13.5, fill: MUT, opacity: fade(u0, 0.4 + i * 0.15) }); }); }

  // ================= 1. Loki 개념 · 데이터 소스 =================
  function s1(t, c) { const { k, u, beat: b } = c;
    if (k === 0) {
      browser(110, 170, 150, 110, '브라우저', { s: pop(u, 0.1) });
      server(400, 170, 'Grafana 서버', { s: pop(u, 0.4), lamp: ACC });
      dbIcon(740, 170, 'Loki', { stroke: WARN, s: pop(u, 0.8) });
      grow(190, 170, 338, 170, E(u, 0.9, 1.4), MUT); grow(460, 170, 690, 170, E(u, 1.3, 1.9), WARN);
      dot([[190, 170], [338, 170]], seg(u, 1.6, 2.1), ACC, 6); dot([[460, 170], [690, 170]], seg(u, 2.0, 2.6), WARN, 6);
      pill(575, 130, 'access: proxy', ACC, pop(u, 1.5), { mono: true });
      mono(740, 262, 'http://loki:3100', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) });
      note(480, 340, '브라우저는 Grafana 서버에만 묻고, Loki 호출은 서버가 대신한다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { // 스트림이 열리고 maxLines 가 상한을 건다
      dbIcon(80, 120, 'Loki', { stroke: WARN });
      LOGS.forEach((l, i) => { const s = seg(u, 0.2 + i * 0.2, 0.6 + i * 0.2); if (s <= 0) return; logRow(170, 70 + i * 34, l, { op: s, n: 62 }); });
      const y = 290, w = 700 * E(u, 1.4, 2.4); el('rect', { x: 170, y, width: 700, height: 14, rx: 7, fill: SOFT });
      el('rect', { x: 170, y, width: w, height: 14, rx: 7, fill: ACC });
      mono(870, y + 40, 'maxLines: 1000', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      tx(170, y + 40, '한 번에 받는 줄 수 상한 · 넘치면 잘라서 브라우저를 지킨다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2 || k === 3) { // derivedFields: traceID=(\w+) 가 본문에서 값을 뽑는다
      pill(300, 34, 'matcherRegex: traceID=(\\w+)', ACC, k === 2 ? pop(u, 0.1) : 1, { mono: true });
      const scan = k === 2 ? E(u, 0.4, 2.0) * 6 : 6;
      LOGS.forEach((l, i) => { const y = 84 + i * 34, hit = /traceID=(\w+)/.exec(l.text), done = scan > i + 0.5;
        logRow(30, y, { ...l, text: l.text.replace(/^level=\w+ /, '') }, { n: 76, hi: done && hit ? 'traceID=' + hit[1] : null, noApp: true, op: k === 3 && i !== 1 ? 0.45 : 1 });
        if (done && hit) { const s = k === 2 ? pop(u, 0.5 + i * 0.27) : 1; card(800, y - 4, 150, 26, { rx: 13, text: 'TraceID ' + hit[1], fs: 13.5, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s }); } });
      if (k === 2) { el('rect', { x: 22, y: 84 + Math.min(scan, 5.6) * 34 - 20, width: 650, height: 4, fill: ACC, opacity: 0.5 });
        note(30, 310, 'traceID가 있는 줄만 링크가 생긴다', fade(u, 2.2)); return; }
      // k3: 링크 → Tempo
      grow(800, 128, 800, 268, E(u, 0.3, 0.8), ACC);
      el('rect', { x: 560, y: 270, width: 380, height: 140, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.6) });
      tx(576, 294, 'Tempo · d4e5f6', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) });
      mono(924, 294, 'datasourceUid: tempo', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      [0, 1, 2].forEach((i) => { const w = [340, 60, 260][i] * E(u, 0.9 + i * 0.2, 1.5 + i * 0.2); el('rect', { x: 580 + [0, 14, 70][i], y: 312 + i * 30, width: w, height: 16, rx: 3, fill: i === 2 ? BAD : INFO, opacity: 0.85 }); });
      note(30, 300, '${__value.raw} 값을 Tempo 쿼리로 넘겨', fade(u, 1.8)); note(30, 326, '그 요청의 트레이스를 연다', fade(u, 2.0)); return; }
    if (k === 4) { // 라벨 인덱스는 작고, 본문은 압축 청크
      zone(40, 50, 220, 260, '인덱스 (라벨만)', { fill: INFOBG, color: INFO });
      ['app="api"', 'app="web"', 'env="prod"', 'level="error"'].forEach((s, i) => mono(60, 104 + i * 34, s, { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.15) }));
      zone(320, 50, 600, 260, '압축 청크 (본문 통째로)', { fill: SOFT });
      for (let i = 0; i < 24; i++) { const s = seg(u, 0.5 + i * 0.03, 0.8 + i * 0.03); el('rect', { x: 340 + (i % 8) * 72, y: 84 + Math.floor(i / 8) * 64, width: 62 * s, height: 50, rx: 6, fill: i < 8 ? WARNBG : PANEL, stroke: i < 8 ? WARN : GRID, 'stroke-width': 1.5 }); }
      dot([[260, 120], [330, 110]], seg(u, 1.4, 1.8), INFO, 7);
      const gx = 340 + E(u, 1.8, 2.7) * 520; el('circle', { cx: gx, cy: 110, r: 16, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 1.8) }); el('line', { x1: gx + 11, y1: 121, x2: gx + 22, y2: 132, stroke: WARN, 'stroke-width': 3.5, opacity: fade(u, 1.8) });
      tx(480, 350, '① 라벨로 스트림 고르기  ② 고른 청크만 풀어서 grep', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); return; }
    // k5: 고카디널리티 라벨이면 스트림이 폭발한다
    zone(40, 50, 400, 290, '라벨 = app, env, level', { fill: GOODBG, color: GOOD });
    [0, 1, 2, 3].forEach((i) => card(140 + (i % 2) * 200, 130 + Math.floor(i / 2) * 90, 170, 60, { rx: 8, text: ['api · info', 'api · error', 'api · warn', 'web · info'][i], fs: 14, mono: true, stroke: GOOD, s: pop(u, 0.2 + i * 0.1) }));
    zone(500, 50, 420, 290, '라벨에 user_id를 넣으면', { fill: BADBG, color: BAD });
    const n = Math.floor(E(u, 0.8, 2.4) * 120); for (let i = 0; i < n; i++) el('rect', { x: 520 + (i % 15) * 26, y: 80 + Math.floor(i / 15) * 30, width: 20, height: 22, rx: 3, fill: BAD, opacity: 0.6 });
    tx(480, 380, 'user_id·request_id는 본문에 두고 쿼리할 때 파싱한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ================= 2. 스트림 셀렉터 =================
  const DR = [
    { key: 'api', lab: '{app="api", env="prod"}', n: 5 }, { key: 'web', lab: '{app="web", env="prod"}', n: 1 },
    { key: 'worker', lab: '{app="worker", env="prod"}', n: 0, maybe: true }, { key: 'dev', lab: '{app="api", env="dev"}', n: 0, maybe: true },
    { key: 'canary', lab: '{app="api", instance="canary-1"}', n: 0, maybe: true }];
  function drawer(i, d, st, u0) { const y = 90 + i * 60, open = st.open, x = 40 + (open ? 30 * st.m : 0), op = st.show ?? 1; if (op <= 0) return;
    el('rect', { x, y, width: 440, height: 46, rx: 8, fill: open ? ACCBG : SOFT, stroke: open ? ACC : d.maybe ? MUT : GRID, 'stroke-width': open ? 2.4 : 1.6, 'stroke-dasharray': d.maybe ? '6 5' : null, opacity: op });
    mono(x + 16, y + 29, d.lab, { 'font-size': 14, fill: open ? ACC : d.maybe ? MUT : INK, 'font-weight': 700, opacity: op });
    if (d.maybe) tx(x + 430, y + 29, '있다면', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
    if (open && d.n) for (let j = 0; j < d.n; j++) { const s = seg(st.m, j * 0.12, 0.4 + j * 0.12); el('rect', { x: 500 + j * 52, y: y + 12, width: 44 * s, height: 22, rx: 4, fill: LV[API[j] ? API[j].level : 'info'], opacity: 0.75 }); }
    if (st.x) cross(500, y + 23, 12, st.x); }
  function s2(t, c) { const { k, u, beat: b } = c, p = c.prev || {};
    qline(40, 24, 880, k === 0 ? typed(b.query, seg(u, 0.1, 0.8)) : b.query === p.query ? b.query : typed(b.query, seg(u, 0.1, 0.8)));
    const m = E(u, 0.8, 1.6);
    if (k <= 3) {
      const rule = (d) => { if (d.key === 'api') return { open: true, m: k === 0 ? m : 1 };
        if (d.key === 'web') return { open: false, x: k === 0 ? pop(u, 1.2) : 1 };
        if (d.key === 'dev') return k === 1 ? { show: fade(u, 0.5), x: pop(u, 1.3) } : { show: 0 };
        if (d.key === 'worker') return k >= 2 ? { show: k === 2 ? fade(u, 0.4) : 1, open: true, m: k === 2 ? m : 1 } : { show: 0 };
        if (d.key === 'canary') return k === 3 ? { show: fade(u, 0.4), x: pop(u, 1.4) } : { show: 0 }; };
      DR.forEach((d, i) => drawer(i, d, rule(d), u));
      const msg = ['= : app과 env가 정확히 같아야 열린다', '!= : dev만 빼고 나머지는 모두 남는다', '=~ : 정규식에 맞는 서랍을 함께 연다', '!~ : 정규식에 맞는 서랍을 뺀다'][k];
      note(40, 404, msg, fade(u, 1.8), { fill: ACC }); return; }
    if (k === 4) { [['=', '같음'], ['!=', '다름'], ['=~', '정규식 일치'], ['!~', '정규식 불일치']].forEach(([op, ko], i) => { const x = 140 + i * 226, s = pop(u, 0.2 + i * 0.3);
        card(x, 200, 200, 130, { rx: 12, stroke: ACC, s }); mono(x, 196, op, { 'font-size': 40, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) });
        tx(x, 240, ko, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.3) }); });
      note(480, 340, '라벨 매처는 이 네 개가 전부다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    // k5: 빈 값과 맞지 않는 매처가 하나는 있어야 한다
    [['{env=~".*"}', '빈 값도 맞는다 → 모든 스트림', BAD, '400 parse error'], ['{app="api", env="prod"}', 'app="api" 가 스트림을 좁힌다', GOOD, '실행']].forEach(([q, d, col, r], i) => {
      const y = 130 + i * 120, s = pop(u, 0.3 + i * 0.7);
      card(330, y, 520, 76, { rx: 10, stroke: col, s }); mono(100, y - 6, q, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.7) });
      tx(100, y + 22, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.7) });
      pill(720, y, r, col, pop(u, 0.8 + i * 0.7), { mono: true }); });
    note(480, 380, '= 또는 =~ 중 빈 값과 맞지 않는 매처가 최소 하나', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  // ================= 3. 라인 필터 =================
  // 게이트 열마다 통과/탈락 표시. 줄은 api 스트림 5줄
  function gateRun(gates, u, start, o) { o = o || {}; const gx0 = 620, gw = 130;
    gates.forEach(([g, fn], j) => { const x = gx0 + j * gw; tx(x, j % 2 ? 80 : 62, g, { 'font-size': 13.5, class: 'mono', 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, start + j * 0.5 - 0.2) });
      el('line', { x1: x, y1: 84, x2: x, y2: 84 + 5 * 40, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }); });
    API.forEach((l, i) => { const y = 110 + i * 40; let alive = true, diedAt = -1;
      gates.forEach(([, fn], j) => { if (alive && !fn(l.text)) { alive = false; diedAt = j; } });
      const shownGates = gates.map((_, j) => u >= start + j * 0.5);
      const decided = diedAt >= 0 ? shownGates[diedAt] : shownGates[gates.length - 1];
      logRow(30, y, l, { n: 64, noApp: true, off: decided && !alive, on: decided && alive, w: 560, hi: o.hi && alive ? o.hi : null });
      gates.forEach((_, j) => { if (!shownGates[j]) return; if (diedAt >= 0 && j > diedAt) return; const x = gx0 + j * gw;
        if (j === diedAt) cross(x, y - 4, 8, pop(u, start + j * 0.5)); else check(x, y - 4, 8, pop(u, start + j * 0.5)); }); });
    return API.filter((l) => gates.every(([, fn]) => fn(l.text))).length; }
  const has = (s) => (x) => x.includes(s), not = (s) => (x) => !x.includes(s), re = (r) => (x) => r.test(x);
  function s3(t, c) { const { k, u, beat: b } = c;
    qline(30, 18, 900, b.query, { fs: 14 });
    if (k === 0) { API.forEach((l, i) => logRow(30, 110 + i * 40, l, { n: 64, noApp: true, op: fade(u, 0.2 + i * 0.2) }));
      note(30, 340, '{app="api"} 만으로는 스트림의 줄이 전부 나온다', fade(u, 1.6)); return; }
    if (k === 1) { const n = gateRun([['|= "error"', has('error')], ['!= "healthcheck"', not('healthcheck')]], u, 0.4, { hi: 'error' });
      mono(900, 340, `통과 ${n}줄`, { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.8) }); return; }
    if (k === 2) { [['|=', '포함', 1.0], ['!=', '미포함', 1.0], ['|~', '정규식 포함', 0.45], ['!~', '정규식 미포함', 0.45]].forEach(([op, ko, sp], i) => { const y = 100 + i * 66, s = fade(u, 0.2 + i * 0.25);
        mono(80, y + 6, op, { 'font-size': 26, 'font-weight': 800, fill: ACC, opacity: s }); tx(150, y + 6, ko, { 'font-size': 16, 'font-weight': 700, opacity: s });
        el('rect', { x: 330, y: y - 10, width: 520, height: 20, rx: 10, fill: SOFT, opacity: s }); el('rect', { x: 330, y: y - 10, width: 520 * sp * E(u, 0.6 + i * 0.25, 1.6 + i * 0.25), height: 20, rx: 10, fill: sp > 0.9 ? GOOD : WARN }); });
      tx(590, 386, '막대 = 같은 시간에 훑는 양 (상대 비교)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 3) { const n = gateRun([['|= "error"', has('error')], ['!= "timeout"', not('timeout')], ['|~ "5[0-9][0-9]"', re(/5[0-9][0-9]/)]], u, 0.3);
      mono(900, 340, `통과 ${n}줄`, { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      note(30, 340, '왼쪽 필터부터 차례로 적용된다', fade(u, 1.8)); return; }
    if (k === 4) { // 같은 결과, 다른 속도
      [['|~ "error"', 0.45, WARN], ['|= "error"', 1.0, GOOD]].forEach(([q, sp, col], i) => { const y = 120 + i * 120;
        mono(60, y, q, { 'font-size': 18, 'font-weight': 800, fill: col });
        el('rect', { x: 260, y: y - 16, width: 440, height: 22, rx: 11, fill: SOFT }); el('rect', { x: 260, y: y - 16, width: 440 * clamp(E(u, 0.2, 2.4) / sp * 0.5), height: 22, rx: 11, fill: col });
        mono(730, y, '결과 2줄', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) }); });
      note(60, 370, '찾는 것이 고정 문자열이면 |= 가 같은 답을 더 빨리 낸다', fade(u, 1.6)); return; }
    // k5: 훑을 양 = 시간 범위 × 스트림 수
    const ax = 90, ay = 360; el('line', { x1: ax, y1: ay, x2: ax + 780, y2: ay, stroke: MUT, 'stroke-width': 1.6 }); el('line', { x1: ax, y1: ay, x2: ax, y2: 80, stroke: MUT, 'stroke-width': 1.6 });
    tx(ax + 780, ay + 28, '시간 범위', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 }); tx(ax, 70, '열린 스트림', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    const bw = 760 * E(u, 0.2, 1.2), bh = 260 * E(u, 0.2, 1.2);
    el('rect', { x: ax, y: ay - bh, width: bw, height: bh, fill: BADBG, stroke: BAD, 'stroke-width': 2 });
    tx(ax + 20, ay - bh + 28, '느슨한 셀렉터 × 7일', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
    const sw = 120 * E(u, 1.4, 2.2), sh = 50 * E(u, 1.4, 2.2); el('rect', { x: ax, y: ay - sh, width: sw, height: sh, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.4 });
    tx(ax + 140, ay - 20, '{app="api"} × 1시간', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) }); }

  // ================= 4. 파싱 · 라벨 필터 =================
  function fields(text) { const out = []; const rx = /(\w+)=("[^"]*"|\S+)/g; let m; while ((m = rx.exec(text))) out.push([m[1], m[2].replace(/"/g, '')]); return out; }
  function s4(t, c) { const { k, u, beat: b } = c, L2 = LOGS[1], L3 = LOGS[2];
    qline(30, 18, 900, short(b.query, 104), { fs: 13.5 });
    if (k === 0 || k === 1) { // logfmt 로 쪼개기 → status 조건
      [L2, L3].forEach((l, r) => { const y0 = 90 + r * 150, fs = fields(l.text);
        logRow(30, y0, l, { noApp: true, n: 100, on: k === 1 ? !!fs.find((f) => f[0] === 'status') : false, off: k === 1 && !fs.find((f) => f[0] === 'status'), w: 900 });
        fs.forEach(([kk, v], j) => { const x = 40 + j * 150, s = k === 0 ? pop(u, 0.4 + r * 0.5 + j * 0.12) : 1, hot = k === 1 && kk === 'status';
          card(x + 66, y0 + 46, 140, 46, { rx: 6, stroke: hot ? ACC : GRID, fill: hot ? ACCBG : PANEL, s, sw: hot ? 2.4 : 1.5 });
          tx(x + 8, y0 + 40, kk, { 'font-size': 13.5, fill: MUT, opacity: s > 0.3 ? 1 : 0 }); mono(x + 8, y0 + 60, short(v, 15), { 'font-size': 14, 'font-weight': 700, fill: hot ? ACC : INK, opacity: s > 0.3 ? 1 : 0 }); });
        if (k === 1 && !fs.find((f) => f[0] === 'status')) { card(840, y0 + 46, 110, 46, { rx: 6, text: 'status 없음', fs: 13.5, stroke: BAD, color: BAD, dash: '5 4', s: pop(u, 0.6) }); cross(905, y0 - 4, 9, pop(u, 1.0)); }
        if (k === 1 && fs.find((f) => f[0] === 'status')) check(905, y0 - 4, 9, pop(u, 0.8)); });
      note(30, 404, k === 0 ? '파서는 줄을 거르지 않고 key=value를 필드로 만든다' : 'status >= 500은 숫자로 비교한다', fade(u, 1.8)); return; }
    if (k === 2) { const fs = fields(L2.text), want = ['method', 'path', 'status'];
      logRow(30, 90, L2, { noApp: true, n: 100 });
      mono(60, 170, 'line_format "{{.method}} {{.path}} status={{.status}}"', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.2) });
      want.forEach((w, i) => { const v = fs.find((f) => f[0] === w)[1]; fly(140 + i * 200, 100, 220 + i * 120, 270, seg(u, 0.7 + i * 0.3, 1.4 + i * 0.3), v, { mono: true }); });
      card(400, 280, 420, 52, { rx: 8, fill: INK, stroke: 'none', s: pop(u, 1.9) }); mono(400, 286, 'POST /pay status=500', { 'font-size': 17, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      note(30, 380, '보이는 모양만 바뀐다. 통과한 줄 수는 그대로 1줄', fade(u, 2.2)); return; }
    if (k === 3) { const js = '{"level":"error","path":"/pay","latency_ms":3012}';
      tx(30, 82, 'JSON 로그라면 (예시 줄)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      mono(30, 112, js, { 'font-size': 15, fill: INK, opacity: fade(u, 0.1) });
      [['level', 'error', 'level="error"'], ['path', '/pay', ''], ['latency_ms', '3012', 'latency_ms > 300']].forEach(([kk, v, cond], j) => { const x = 40 + j * 290, s = pop(u, 0.5 + j * 0.25);
        card(x + 120, 180, 240, 50, { rx: 6, stroke: cond ? ACC : GRID, s }); tx(x + 10, 174, kk, { 'font-size': 13.5, fill: MUT, opacity: s > 0.3 ? 1 : 0 }); mono(x + 10, 196, v, { 'font-size': 15, 'font-weight': 800, opacity: s > 0.3 ? 1 : 0 });
        if (cond) { mono(x + 120, 250, cond, { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.3 + j * 0.3) }); check(x + 120, 280, 10, pop(u, 1.5 + j * 0.3)); } });
      note(30, 360, 'json 파서도 필드를 만들고, 라벨 필터를 이어 붙인다', fade(u, 2.0)); return; }
    if (k === 4) { const ng = '10.0.0.7 - - [24/Nov/2026:10:00:00] "GET /orders"';
      tx(30, 82, 'nginx 접근 로그라면 (예시 줄)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      mono(30, 120, ng, { 'font-size': 16, opacity: fade(u, 0.1) });
      mono(30, 160, '<ip> - - <_> "<method> <path>"', { 'font-size': 16, fill: ACC, 'font-weight': 800, opacity: fade(u, 0.5) });
      [['ip', '10.0.0.7'], ['method', 'GET'], ['path', '/orders']].forEach(([kk, v], j) => { const s = pop(u, 1.0 + j * 0.25); card(140 + j * 220, 230, 190, 50, { rx: 6, stroke: ACC, s }); tx(56 + j * 220, 224, kk, { 'font-size': 13.5, fill: MUT, opacity: s > 0.3 ? 1 : 0 }); mono(56 + j * 220, 246, v, { 'font-size': 15, 'font-weight': 800, opacity: s > 0.3 ? 1 : 0 }); });
      note(30, 330, '자리로 뽑는다. <_> 는 버리는 자리', fade(u, 1.8));
      note(30, 366, '셀렉터가 {app="nginx"}라 지금 api 스트림에서는 0줄', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 5) { // 추출 필드는 쿼리 시점에만 있다
      zone(40, 70, 300, 250, '저장된 인덱스', { fill: INFOBG, color: INFO });
      ['app', 'env', 'level'].forEach((s, i) => mono(64, 124 + i * 36, s, { 'font-size': 16, 'font-weight': 700, fill: INFO }));
      mono(64, 290, '쿼리 전후 크기 같음', { 'font-size': 14, fill: INFO });
      zone(400, 70, 520, 250, '쿼리 실행 중에만', { fill: SOFT });
      const life = u < 2.0 ? fade(u, 0.3) : 1 - E(u, 2.0, 2.6);
      ['method', 'path', 'status', 'msg', 'traceID'].forEach((s, i) => card(490 + (i % 3) * 150, 140 + Math.floor(i / 3) * 70, 130, 44, { rx: 6, text: s, fs: 14.5, mono: true, stroke: ACC, op: life }));
      tx(660, 300, life < 0.5 && u > 2 ? '쿼리가 끝나면 사라진다' : '파서가 만든 필드', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }); return; }
    // k6: 읽기 좋은 로그 패널
    zone(40, 70, 420, 280, '파싱 전', { fill: SOFT });
    [L2, L3].forEach((l, i) => mono(56, 120 + i * 40, short(l.text, 44), { 'font-size': 13.5, fill: MUT }));
    zone(500, 70, 420, 280, '파싱 + line_format', { fill: ACCBG, color: ACC, op: fade(u, 0.5) });
    ['POST /pay status=500', 'DB connection refused'].forEach((s, i) => mono(520, 120 + i * 40, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.3) }));
    note(500, 300, '장애 중에 한눈에 읽힌다', fade(u, 1.8), { fill: ACC }); }

  // ================= 5. 로그 → 메트릭 · 알림 =================
  const TA = { x: 90, y: 300, w: 780 };
  const ticks = Array.from({ length: 27 }, (_, i) => ((Math.sin((i + 1) * 12.9898) * 43758.5453) % 1 + 1) % 1).sort();
  function tline(o) { o = o || {}; el('line', { x1: TA.x, y1: TA.y, x2: TA.x + TA.w, y2: TA.y, stroke: MUT, 'stroke-width': 1.6 });
    mono(TA.x, TA.y + 24, '-5m', { 'font-size': 13.5, fill: MUT }); mono(TA.x + TA.w, TA.y + 24, 'now', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  function s5unwrap(t, c) { const { k, u, beat: b } = c;
      const rows = b.metric; [LOGS[0], LOGS[4]].forEach((l, i) => logRow(60, 90 + i * 34, l, { noApp: true, n: 62, hi: 'latency_ms=' + (i ? '900' : '12') }));
      rows.forEach((r, i) => { const y = 180 + i * 50; mono(80, y + 16, r.level, { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: 200, y, width: 560 * (r.value / 900) * E(u, 0.6 + i * 0.3, 1.6 + i * 0.3) + 2, height: 24, rx: 4, fill: i ? INFO : WARN });
        mono(200 + 560 * (r.value / 900) + 12, y + 18, r.value + ' ms', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.5 + i * 0.3) }); });
    note(80, 320, 'latency_ms가 없는 error 줄은 latency_ms != "" 에서 먼저 빠진다', fade(u, 2.0), { fill: MUT });
    tx(80, 350, 'path 별 평균 ms · 예시 줄의 값', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); }
  function s5(t, c) { const { k, u, beat: b } = c;
    qline(30, 18, 900, short(b.query, 104), { fs: 13.5 });
    if (k === 0) { [LOGS[1], LOGS[2]].forEach((l, i) => logRow(60, 100 + i * 36, l, { noApp: true, n: 60 }));
      tline(); ticks.forEach((f, i) => { const s = seg(u, 0.6 + i * 0.05, 0.9 + i * 0.05); if (s <= 0) return; el('line', { x1: TA.x + f * TA.w, y1: TA.y - 26 * s, x2: TA.x + f * TA.w, y2: TA.y, stroke: BAD, 'stroke-width': 2.4 }); });
      note(60, 220, 'error 줄 하나 = 시간축 위 눈금 하나', fade(u, 1.8)); return; }
    if (k === 3) return s5unwrap(t, c);
    tline(); ticks.forEach((f) => el('line', { x1: TA.x + f * TA.w, y1: TA.y - 26, x2: TA.x + f * TA.w, y2: TA.y, stroke: BAD, 'stroke-width': 2.4 }));
    el('rect', { x: TA.x, y: TA.y - 40, width: TA.w * (k <= 2 ? E(u, 0.1, 0.8) : 1), height: 40, fill: WARNBG, opacity: 0.5 });
    mono(TA.x + 8, TA.y - 48, '[5m]', { 'font-size': 14, 'font-weight': 800, fill: WARN });
    if (k === 1 || k === 2) { const rate = k === 1, val = rate ? '0.09' : '27';
      const lines = rate ? ['5분에 27줄', '27 ÷ 300초', '= 초당 0.09줄'] : ['5분에 27줄', '나누지 않는다', '= 27'];
      lines.forEach((s, i) => mono(90, 96 + i * 34, s, { 'font-size': i === 2 ? 22 : 16, 'font-weight': i === 2 ? 800 : 600, fill: i === 2 ? (rate ? INFO : BAD) : INK, opacity: fade(u, 0.7 + i * 0.4) }));
      // 두 값의 크기 비교 막대
      const bx = 560; [['rate', 0.09, INFO], ['count_over_time', 27, BAD]].forEach(([n, v, col], i) => { if (rate && i === 1) return; const y = 100 + i * 60;
        tx(bx, y - 8, n, { 'font-size': 14, 'font-weight': 700, fill: col }); el('rect', { x: bx, y, width: 320, height: 22, rx: 4, fill: SOFT });
        el('rect', { x: bx, y, width: Math.max(3, 320 * v / 27) * E(u, 1.2, 2.0), height: 22, rx: 4, fill: col }); mono(bx + Math.max(3, 320 * v / 27) + 8, y + 17, String(v), { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.8) }); });
      if (!rate) tx(560, 236, '같은 창인데 300배 차이 · 임계값도 따로 잡는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    // k4: 알림 규칙 — 임계값을 넘고 for 2m 동안 계속되면 발화
    const AX = { x: 90, y: 90, w: 600, h: 150 }, vals = Array.from({ length: 30 }, (_, i) => (i < 12 ? 30 + 8 * Math.sin(i) : 70 + 8 * Math.sin(i * 1.3)));
    el('rect', { x: AX.x - 10, y: AX.y - 20, width: AX.w + 20, height: AX.h + 160, fill: PANEL, opacity: 0.96 });
    const thr = 55, Y = (v) => AX.y + AX.h - v / 100 * AX.h;
    el('line', { x1: AX.x, y1: Y(thr), x2: AX.x + AX.w, y2: Y(thr), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4' }); tx(AX.x + AX.w + 8, Y(thr) + 5, '임계값', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
    const n = Math.max(2, Math.floor(E(u, 0.1, 2.0) * 30)), pts = vals.slice(0, n).map((v, i) => `${AX.x + i / 29 * AX.w},${Y(v)}`).join(' ');
    el('polyline', { points: pts, fill: 'none', stroke: BAD, 'stroke-width': 2.6 });
    el('line', { x1: AX.x, y1: AX.y + AX.h, x2: AX.x + AX.w, y2: AX.y + AX.h, stroke: MUT, 'stroke-width': 1.4 });
    const st = n < 13 ? 0 : n < 22 ? 1 : 2, names = [['Normal', GOOD], ['Pending · for 2m', WARN], ['Firing', BAD]];
    names.forEach(([s, col], i) => card(170 + i * 230, 320, 200, 46, { rx: 23, text: s, fs: 15, stroke: col, color: i === st ? PANEL : col, fill: i === st ? col : PANEL }));
    if (n >= 13) { const x0 = AX.x + 12 / 29 * AX.w, x1 = AX.x + 21 / 29 * AX.w; el('rect', { x: x0, y: AX.y + AX.h + 6, width: Math.min(x1, AX.x + (n - 1) / 29 * AX.w) - x0, height: 10, rx: 5, fill: WARN }); mono(x0, AX.y + AX.h + 36, 'for 2m', { 'font-size': 14, 'font-weight': 700, fill: WARN }); }
    tx(720, 120, '잠깐 튀면', { 'font-size': 14, fill: MUT }); tx(720, 142, 'Pending에서 멈춘다', { 'font-size': 14, fill: MUT }); }

  // ================= 6. Grafana 로그 패널 · 라이브 · 트레이스 =================
  const TIMES = ['10:00:07', '10:00:03'];
  function logsPanel(rows, o) { o = o || {}; const x = 40, y = 70, w = o.w || 560, h = 300;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8 });
    tx(x + 14, y + 24, 'API 에러 로그', { 'font-size': 15, 'font-weight': 700 }); mono(x + w - 12, y + 24, 'logs · Loki', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    rows.forEach((r, i) => { const yy = y + 62 + i * (r.h || 34), op = r.op ?? 1; if (op <= 0) return;
      el('circle', { cx: x + 18, cy: yy - 4, r: 5, fill: BAD, opacity: op });
      let tx0 = x + 30; if (r.time) { mono(tx0, yy, r.time, { 'font-size': 13.5, fill: MUT, opacity: op }); tx0 += 76; }
      const lines = r.wrap ? [r.text.slice(0, 42), r.text.slice(42)] : [short(r.text, r.time ? 50 : 58)];
      lines.forEach((ln, j) => mono(tx0, yy + j * 20, ln, { 'font-size': 13.5, opacity: op }));
      if (r.trace) { const i0 = r.text.indexOf('traceID'); if (i0 >= 0 && !r.wrap) el('rect', { x: tx0 + i0 * 8.1 - 2, y: yy - 14, width: 15 * 8.1, height: 19, rx: 3, fill: 'none', stroke: ACC, 'stroke-width': 2 }); } }); }
  function s6(t, c) { const { k, u, beat: b } = c, L2 = LOGS[1], L3 = LOGS[2];
    if (k === 0) { logsPanel([], { stroke: ACC }); qline(40, 20, 560, '', {}); tx(320, 220, '쿼리가 없어 보일 줄이 없다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      card(800, 160, 220, 110, { rx: 10, stroke: GRID, s: pop(u, 0.4) }); mono(800, 150, '"type": "logs"', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); mono(800, 180, 'uid: loki-default', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.7) }); return; }
    qline(40, 20, 560, k === 1 ? typed('{app="api"} |= "error"', seg(u, 0.1, 0.8)) : '{app="api"} |= "error"');
    if (k === 1) { logsPanel([{ text: L2.text, op: fade(u, 1.0) }, { text: L3.text, op: fade(u, 1.3) }]);
      card(800, 160, 220, 110, { rx: 10, stroke: GRID }); mono(800, 150, 'queryType: range', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); tx(800, 180, '고른 시간 범위 전체', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); return; }
    if (k === 2) { const on = (i) => u > 0.4 + i * 0.5;
      logsPanel([{ text: L2.text, time: on(0) ? TIMES[0] : null, wrap: on(1), h: on(1) ? 48 : 34 }, { text: L3.text, time: on(0) ? TIMES[1] : null }]);
      if (on(2)) { const y = 220; el('rect', { x: 70, y, width: 500, height: 80, rx: 6, fill: SOFT, opacity: fade(u, 1.4) });
        [['level', 'error'], ['path', '/pay'], ['status', '500']].forEach(([kk, v], i) => mono(86, y + 24 + i * 22, `${kk.padEnd(8)}${v}`, { 'font-size': 13.5, opacity: fade(u, 1.5) })); }
      [['showTime', 'true'], ['wrapLogMessage', 'true'], ['enableLogDetails', 'true'], ['sortOrder', 'Descending']].forEach(([kk, v], i) => { const y = 100 + i * 60, a = on(i);
        el('rect', { x: 650, y: y - 18, width: 44, height: 24, rx: 12, fill: a ? ACC : OFF }); el('circle', { cx: a ? 682 : 662, cy: y - 6, r: 9, fill: PANEL });
        mono(706, y - 1, kk, { 'font-size': 14.5, 'font-weight': 700, fill: a ? INK : MUT }); mono(706, y + 19, v, { 'font-size': 13.5, fill: MUT }); });
      return; }
    if (k === 3) { // 라이브 테일: 새 줄이 위에 쌓인다
      const live = [{ text: 'level=error method=POST path=/pay status=502 msg="bad gateway"' }, { text: L2.text }, { text: L3.text }];
      const sh = E(u, 0.6, 1.4); logsPanel(live.map((r, i) => ({ ...r, op: i === 0 ? sh : 1 })).slice(sh > 0.05 ? 0 : 1));
      const pulse = 0.6 + 0.4 * Math.sin(t * 6); card(700, 100, 120, 40, { rx: 20, text: '● Live', fs: 15, stroke: BAD, color: PANEL, fill: BAD, op: pulse });
      tx(640, 180, '필터는 그대로, 새 줄만 흘러든다', { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.2) });
      tx(640, 206, '맨 윗줄은 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { logsPanel([{ text: L2.text, trace: true }, { text: L3.text }]);
      grow(560, 120, 650, 120, E(u, 0.4, 0.9), ACC);
      el('rect', { x: 650, y: 70, width: 290, height: 200, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.8) });
      tx(664, 94, 'Tempo · d4e5f6', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      waterfall(668, 112, u - 1.0);
      tx(650, 300, 'span 이름은 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k5: 같은 LogQL 하나를 세 곳에
    const src = [480, 110]; card(src[0], src[1], 340, 50, { rx: 25, text: '{app="api"} |= "error"', fs: 15, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.1) });
    [['로그 패널', '그대로', 160], ['메트릭 패널', 'sum by (level) (rate(…[5m]))', 480], ['알림 규칙', 'expr + for 2m', 800]].forEach(([n, d, x], i) => {
      grow(src[0], src[1] + 26, x, 236, E(u, 0.5 + i * 0.3, 1.0 + i * 0.3), ACC);
      card(x, 280, 260, 84, { rx: 10, stroke: i === 2 ? BAD : INK, s: pop(u, 1.0 + i * 0.3) });
      tx(x, 272, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.1 + i * 0.3) });
      mono(x, 298, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2 + i * 0.3) }); });
    note(480, 390, '로그 · 메트릭 · 트레이스를 한 화면에서 오간다', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  const quiz = [
    { q: 'Loki가 Elasticsearch보다 인덱스가 가볍고 저장 비용이 싼 까닭은 무엇인가?',
      o: ['로그 본문을 모두 단어 단위로 인덱싱해서', '라벨만 인덱싱하고 본문은 압축 청크로 쌓아서', '오래된 로그를 자동으로 지워서'], a: 1,
      why: '인덱스에는 app·env·level 같은 라벨만 있다. 본문은 압축해 두고, 고른 스트림만 풀어서 grep 한다.' },
    { q: '{app="api", env!="dev"}에서 != 매처가 하는 일은 무엇인가?',
      o: ['env 라벨이 있는 스트림만 남긴다', 'dev를 포함한 모든 env를 연다', 'env가 dev인 스트림만 빼고 나머지는 남긴다'], a: 2,
      why: '!= 는 값 하나만 뺀다. 지금 스트림은 모두 prod라 결과가 = 를 쓸 때와 같다.' },
    { q: '{app="api"} |= "error" != "timeout" |~ "5[0-9][0-9]" 의 결과가 0줄인 까닭은 무엇인가?',
      o: ['필터를 왼쪽부터 차례로 거쳐 남는 줄이 없어서', '정규식 필터는 셀렉터 뒤에 쓸 수 없어서', 'maxLines가 0이라서'], a: 0,
      why: 'error 두 줄 중 하나는 timeout에서 빠지고, 남은 한 줄은 5xx 숫자가 없어 마지막 필터에서 빠진다.' },
    { q: '| logfmt | status >= 500에서 status 필드가 없는 줄은 어떻게 되는가?',
      o: ['status를 0으로 보고 통과시킨다', '조건에서 탈락한다', '쿼리 전체가 에러로 멈춘다'], a: 1,
      why: '파서가 만든 필드로 숫자를 비교한다. "DB connection refused" 줄에는 status가 없어 걸러진다.' },
    { q: '같은 [5m] 창에서 error 줄이 27개일 때 rate 결과는 얼마인가?',
      o: ['27', '0.09', '5.4'], a: 1,
      why: 'rate는 초당 값이라 27 ÷ 300초 = 0.09다. count_over_time이 27을 낸다.' },
    { q: '로그 패널의 TraceID 링크가 Tempo 트레이스로 이어지게 하는 설정은 무엇인가?',
      o: ['Loki 데이터 소스의 derivedFields', '패널의 sortOrder', 'Explore의 Live 버튼'], a: 0,
      why: 'derivedFields가 본문에서 traceID=(\\w+)를 뽑아 datasourceUid tempo로 가는 링크를 만든다.' },
  ];

  const summary = [
    'Loki는 app·env·level 같은 라벨만 인덱싱하고 로그 본문은 압축 청크로 쌓는다.',
    '쿼리는 셀렉터로 스트림을 좁힌 뒤 |= 같은 라인 필터와 파서로 본문을 거른다.',
    'user_id처럼 값이 많은 것은 라벨로 두지 않고 쿼리할 때 파싱해서 쓴다.',
    'rate와 count_over_time으로 로그를 숫자로 바꾸면 패널과 알림을 로그 하나로 만든다.',
  ];
  const review = [
    { q: '7일 범위로 {env="prod"} |~ "error" 를 돌렸더니 한참 걸린다. 먼저 바꿀 것은?',
      o: ['셀렉터에 app="api" 를 더하고 |~ 를 |= 로 바꾼다', '라벨에 request_id를 추가한다', 'maxLines를 크게 늘린다'], a: 0,
      why: '훑는 양은 열린 스트림과 시간 범위로 정해진다. 셀렉터를 좁히고 고정 문자열은 |= 로 찾는 편이 빠르다.' },
    { q: '팀원이 사용자별로 보려고 user_id를 Loki 라벨로 넣자고 한다. 알맞은 답은?',
      o: ['좋다. 라벨이 많을수록 검색이 빨라진다', '라벨 대신 본문에 남기고 | logfmt | user_id="…" 로 거른다', 'user_id를 정규식 셀렉터로만 쓴다'], a: 1,
      why: '값 종류가 많은 라벨은 스트림 수를 폭발시킨다. 파싱으로 만든 필드는 쿼리 시점에만 있어 인덱스가 커지지 않는다.' },
    { q: 'error 로그 급증 알림을 count_over_time([5m]) 기준 임계값 0.5로 만들었더니 계속 울린다. 원인은?',
      o: ['for를 두지 않아서', 'Loki가 라벨을 인덱싱하지 않아서', '0.5는 초당 값 기준인데 구간 누적 개수와 비교해서'], a: 2,
      why: 'count_over_time은 5분 누적 개수(예: 27)를 낸다. 초당 값으로 잡은 임계값이면 rate를 써야 한다.' },
  ];

  R.page({ title: 'LogQL이 로그를 거르고 세는 과정', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
