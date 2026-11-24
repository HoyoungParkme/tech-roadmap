/* I-2-1 Target과 instance — 장면 4개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, axes, line, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const TG = [{ n: 'api-1:9090', job: 'api', up: 1, ms: 42, last: '2s ago' }, { n: 'api-2:9090', job: 'api', up: 1, ms: 38, last: '3s ago' },
    { n: 'api-3:9090', job: 'api', up: 0, ms: 2, last: '12s ago', err: 'connection refused' }, { n: 'db-1:9187', job: 'db', up: 1, ms: 180, last: '1s ago' }];

  // URL 한 줄: scheme · host:port · path 를 색으로 나눈다
  function url(x, y, sch, host, path, o) { o = o || {};
    spans(x, y, [[sch + '://', { fill: o.hotS ? WARN : INFO, 'font-weight': o.hotS ? 800 : 400 }], [host, { fill: INK, 'font-weight': 700 }], [path, { fill: o.hotP ? WARN : ACC, 'font-weight': o.hotP ? 800 : 400 }]], { 'font-size': o.fs || 16, opacity: o.op ?? 1 }); }
  const tag = (cx, cy, s, col, sc) => pill(cx, cy, s, col || GOOD, sc, { mono: true, fs: 13.5 });

  // ───────── 1. Target = endpoint 하나 ─────────
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(200, 120, 200, 56, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.2), text: 'api-1:9090', fs: 17, mono: true });
      lbl(200, 80, 'target = host:port', fade(u, 0.3));
      card(450, 120, 150, 56, { rx: 10, stroke: ACC, sw: 2, dash: '6 4', s: pop(u, 0.7), text: '/metrics', fs: 17, mono: true });
      sub(450, 170, 'path 안 적으면 기본값', fade(u, 0.9));
      grow(200, 152, 300, 232, E(u, 1.2, 1.6), MUT); grow(450, 186, 410, 232, E(u, 1.2, 1.6), MUT);
      url(210, 262, 'http', 'api-1:9090', '/metrics', { op: fade(u, 1.6), fs: 18 });
      tag(700, 255, 'instance="api-1:9090"', GOOD, pop(u, 2.1)); return; }
    // 상자 그림: api job (3대) + db job
    const boxA = k === 1 ? E(u, 0.2, 0.9) : 1;
    el('rect', { x: 40, y: 50, width: 520 * boxA, height: 230, rx: 14, fill: SOFT, stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '8 5' });
    if (boxA > 0.8) tag(110, 50, 'job="api"', ACC, 1);
    if (k === 1) { sub(300, 170, 'job_name이 target들을 한 묶음으로', fade(u, 1.1), { 'font-size': 15 }); sub(300, 196, 'static_configs 블록이 열린다', fade(u, 1.5), { 'font-size': 14 }); }
    if (k >= 2) TG.slice(0, 3).forEach((g, i) => { const s = k === 2 ? pop(u, 0.3 + i * 0.35) : 1, cx = 130 + i * 170;
      server(cx, 140, null, { s: 0.6 * s, lamp: GOOD }); if (s > 0.5) { mono(cx, 200, g.n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }); mono(cx, 226, 'instance', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD }); } });
    if (k >= 3) { const s = k === 3 ? E(u, 0.2, 0.8) : 1;
      el('rect', { x: 600, y: 50, width: 320 * s, height: 230, rx: 14, fill: SOFT, stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '8 5' });
      if (s > 0.8) { tag(660, 50, 'job="db"', INFO, 1); server(760, 140, null, { s: 0.6, lamp: GOOD }); mono(760, 200, 'db-1:9187', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }); }
      if (k === 3) { pill(700, 250, 'scheme: https', WARN, pop(u, 1.0), { mono: true, fs: 13.5 }); pill(840, 250, 'path: /probe', WARN, pop(u, 1.4), { mono: true, fs: 13.5 }); } }
    if (k === 4) { TG.forEach((g, i) => { const db = g.job === 'db', a = 0.3 + i * 0.4;
        url(120, 318 + i * 26, db ? 'https' : 'http', g.n, db ? '/probe' : '/metrics', { op: fade(u, a), fs: 16, hotS: db, hotP: db }); });
      mono(560, 344, 'GET URL 4개', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }
    if (k === 5) { spans(80, 340, [['http_requests_total{method="GET"', { fill: INK }], [u > 1.2 ? ', job="api"' : '', { fill: ACC, 'font-weight': 700 }]], { 'font-size': 16, opacity: fade(u, 0.1) });
      fly(110, 70, 450, 330, seg(u, 0.4, 1.2), 'job="api"', { fill: ACC, mono: true });
      fly(130, 226, 600, 360, seg(u, 0.9, 1.7), 'instance="api-1:9090"', { fill: GOOD, mono: true });
      if (u > 1.7) mono(80, 370, '  , instance="api-1:9090"} 1027', { 'font-size': 16, 'font-weight': 700, fill: GOOD });
      sub(700, 400, '설정에 안 적어도 붙는다', fade(u, 2.1), { 'font-size': 15 }); } }

  // ───────── 2. UI Targets 표 ─────────
  const COLS = [['Endpoint', 30], ['State', 330], ['Last Scrape', 430], ['Duration', 560], ['Error', 680]];
  function row(g, y, s) { if (s <= 0) return; const db = g.job === 'db', up = g.up;
    el('rect', { x: 20, y: y - 22, width: 920 * clamp(s), height: 40, rx: 6, fill: up ? PANEL : C.BADBG, stroke: GRID, 'stroke-width': 1 });
    if (s < 0.6) return;
    url(30, y + 4, db ? 'https' : 'http', g.n, db ? '/probe' : '/metrics', { fs: 14 });
    pill(365, y - 2, up ? 'UP' : 'DOWN', up ? GOOD : BAD, 1, { fs: 13.5 });
    mono(430, y + 4, g.last, { 'font-size': 14, fill: MUT }); mono(560, y + 4, g.ms + 'ms', { 'font-size': 14, 'font-weight': 700, fill: g.ms > 100 ? WARN : INK });
    if (g.err) mono(680, y + 4, g.err, { 'font-size': 14, 'font-weight': 700, fill: BAD }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) { tx(30, 40, 'Status → Targets (예시 화면)', { 'font-size': 15, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.1) : 1 });
      COLS.forEach(([h, x], i) => tx(x, 84, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: k === 0 ? fade(u, 0.3 + i * 0.25) : 1 }));
      el('line', { x1: 20, y1: 96, x2: 20 + 920 * (k === 0 ? E(u, 0.2, 1.4) : 1), y2: 96, stroke: MUT, 'stroke-width': 1.5 });
      const nRow = [0, 2, 3, 4][k];
      TG.slice(0, nRow).forEach((g, i) => { const fresh = (k === 1 && i < 2) || (k === 2 && i === 2) || (k === 3 && i === 3); row(g, 130 + i * 50, fresh ? E(u, 0.3 + (i % 2) * 0.4, 0.9 + (i % 2) * 0.4) : 1); });
      if (k === 0) sub(480, 250, '상태 · 마지막 scrape · 소요시간 · 에러', fade(u, 1.6), { 'font-size': 15 });
      if (k === 1) tx(480, 290, '둘 다 40ms 안팎 · 정상 수집 중', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      if (k === 2) tx(480, 320, 'Error 열에 실패 사유가 그대로 찍힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      if (k === 3) { tx(480, 370, 'https + /probe 라서 180ms로 더 느리다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); }
      return; }
    if (k === 4) { [['UNKNOWN', OFF, '아직 한 번도 안 긁었다', '방금 추가된 직후'], ['UP', GOOD, '마지막 scrape 성공', 'up = 1'], ['DOWN', BAD, '마지막 scrape 실패', 'up = 0 + Error 사유']].forEach(([nm, col, a, b], i) => {
        const cx = 170 + i * 310, s = pop(u, 0.3 + i * 0.5); card(cx, 170, 270, 170, { rx: 14, stroke: col, sw: 2.4, s });
        if (s < 0.6) return; pill(cx, 120, nm, col, 1, { fs: 16 }); tx(cx, 185, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); mono(cx, 220, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: col === OFF ? MUT : col, 'font-weight': 700 }); });
      return; }
    [['connection refused', '포트에 아무것도 안 떠 있다'], ['context deadline exceeded', 'scrape_timeout 초과'], ['server returned HTTP status 500', '앱이 500 응답'], ['x509: certificate signed by unknown authority', 'TLS 인증서 검증 실패']].forEach(([e, why], i) => {
      const y = 70 + i * 82, s = E(u, 0.2 + i * 0.45, 0.6 + i * 0.45);
      el('rect', { x: 30, y: y - 24, width: 900 * s, height: 62, rx: 8, fill: i === 3 ? C.WARNBG : C.BADBG });
      if (s < 0.6) return; mono(48, y + 2, e, { 'font-size': 15, 'font-weight': 700, fill: BAD }); tx(48, y + 26, '→ ' + why, { 'font-size': 14.5, fill: INK }); }); }

  // ───────── 3. instance label ─────────
  const API = TG.slice(0, 3);
  function srows(x, y, f, o) { o = o || {}; API.forEach((g, i) => { const yy = y + i * 46, s = f ? f(i) : 1, keep = o.keep ? o.keep(i) : true; if (s <= 0) return;
      el('rect', { x, y: yy, width: 470, height: 38, rx: 6, fill: keep && o.keep ? ACCBG : PANEL, stroke: GRID, opacity: keep ? s : 0.3 });
      spans(x + 10, yy + 25, [[o.name || 'http_requests_total', { 'font-weight': 700 }], ['{job="api",instance="', { fill: MUT }], [g.n, { fill: GOOD, 'font-weight': 700 }], ['"}', { fill: MUT }], [o.val ? '  ' + o.val(g) : '', { fill: o.valCol ? o.valCol(g) : ACC, 'font-weight': 800 }]], { 'font-size': 13.5, opacity: keep ? s : 0.3 }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { API.forEach((g, i) => { const cx = 200 + i * 280; server(cx, 140, null, { s: 0.7, lamp: GOOD });
        grow(cx, 190, cx, 240, E(u, 0.4 + i * 0.3, 0.8 + i * 0.3), MUT); tag(cx, 262, `instance="${g.n}"`, GOOD, pop(u, 0.8 + i * 0.3)); });
      tx(480, 350, 'target 하나 = instance 하나 = 한 대', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { srows(30, 90, (i) => E(u, 0.1 + i * 0.15, 0.5 + i * 0.15), { keep: (i) => i === 0 || u < 1.0 });
      mono(30, 60, 'http_requests_total{instance="api-1:9090"}', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      tx(720, 130, '3대 → 1대', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); return; }
    if (k <= 3) { const W = [0.55, 0.9, 0.35]; // 막대 길이는 예시
      mono(30, 50, k === 2 ? 'sum by (instance) (rate(http_requests_total{job="api"}[5m]))' : 'topk(5, sum by (instance) (rate(http_requests_total[5m])))', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      const order = k === 3 ? [1, 0, 2] : [0, 1, 2];
      order.forEach((idx, r) => { const g = API[idx], y = 100 + r * 70, s = E(u, 0.3 + r * 0.3, 1.0 + r * 0.3);
        mono(200, y + 22, `{instance="${g.n}"}`, { 'font-size': 14.5, fill: GOOD, 'text-anchor': 'end' });
        el('rect', { x: 220, y, width: 520 * W[idx] * s, height: 32, rx: 5, fill: k === 3 && r === 0 ? WARN : INFO, opacity: 0.85 });
        if (k === 3) mono(760, y + 22, `${r + 1}위`, { 'font-size': 15, 'font-weight': 800, fill: r === 0 ? WARN : MUT, opacity: fade(u, 1.4 + r * 0.2) }); });
      sub(480, 330, k === 2 ? '결과 시계열 수 = instance 수 · 대별 초당 요청' : '가장 바쁜 순서 · 부하가 한 대에 쏠렸는지 바로 보인다', fade(u, 1.8), { 'font-size': 15 });
      sub(480, 360, '(막대 길이는 예시)', fade(u, 2.0)); return; }
    if (k === 4) { mono(30, 60, 'up{job="api"}', { 'font-size': 16, 'font-weight': 700, fill: ACC });
      srows(30, 90, (i) => E(u, 0.3 + i * 0.3, 0.7 + i * 0.3), { name: 'up', val: (g) => String(g.up), valCol: (g) => (g.up ? GOOD : BAD) });
      tx(720, 200, 'api-3 만 0', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); return; }
    if (k === 5) { srows(30, 90, null, { name: 'up', val: (g) => String(g.up), valCol: (g) => (g.up ? GOOD : BAD), keep: (i) => i === 2 || u < 0.6 });
      mono(30, 60, 'up == 0', { 'font-size': 16, 'font-weight': 700, fill: ACC });
      card(740, 110, 300, 56, { rx: 10, stroke: GOOD, sw: 2.2, s: pop(u, 1.0), text: 'count by (job) → 1', fs: 16, mono: true });
      card(740, 200, 300, 56, { rx: 10, stroke: BAD, sw: 1.8, s: pop(u, 1.6), text: 'sum by (job) → 0', fs: 16, mono: true, color: BAD });
      if (u > 1.9) cross(905, 200, 10);
      sub(740, 260, '남은 값이 0이라 더하면 늘 0', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k6 가장 느린 scrape: UI 예시 값
    mono(30, 50, 'topk(5, scrape_duration_seconds)', { 'font-size': 16, 'font-weight': 700, fill: ACC });
    TG.slice().sort((a, b) => b.ms - a.ms).forEach((g, r) => { const y = 90 + r * 64, s = E(u, 0.3 + r * 0.3, 1.0 + r * 0.3);
      mono(200, y + 22, g.n, { 'font-size': 14.5, fill: GOOD, 'text-anchor': 'end' });
      el('rect', { x: 220, y, width: Math.max(3, 520 * g.ms / 180 * s), height: 32, rx: 5, fill: r === 0 ? WARN : INFO, opacity: 0.85 });
      mono(230 + 520 * g.ms / 180 * s, y + 22, g.ms + 'ms', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8 + r * 0.3) }); });
    sub(480, 380, '소요시간 값은 앞의 Targets 예시 화면 값', fade(u, 2.0)); }

  // ───────── 4. Health 라이프사이클 ─────────
  const ST = { UNKNOWN: [150, OFF], UP: [480, GOOD], DOWN: [810, BAD] };
  function node(nm, s) { const [x, col] = ST[nm]; card(x, 110, 170, 60, { rx: 30, stroke: col, sw: 2.6, s, text: nm, fs: 17, color: col === OFF ? MUT : col }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { node('UNKNOWN', k === 0 ? pop(u, 0.2) : 1); node('UP', k === 0 ? pop(u, 0.8) : 1); node('DOWN', k === 0 ? pop(u, 1.4) : 1);
      const g = k === 0 ? E : () => 1;
      grow(238, 110, 392, 110, g(u, 0.6, 1.0), GOOD); grow(568, 100, 722, 100, g(u, 1.2, 1.6), BAD); el('path', { d: 'M722,125 L568,125', stroke: GOOD, 'stroke-width': 2.2, 'marker-end': 'url(#ra-ah)', opacity: k === 0 ? fade(u, 1.8) : 1 });
      tx(315, 96, '첫 scrape', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.9) : 1 });
      tx(645, 86, '실패', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: k === 0 ? fade(u, 1.5) : 1 }); tx(645, 150, '복구', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, opacity: k === 0 ? fade(u, 1.9) : 1 });
      if (k === 0) { sub(480, 230, '그 뒤로는 scrape마다 UP과 DOWN을 오간다', fade(u, 2.1), { 'font-size': 15 }); return; }
      // 시간축: 추가 → 첫 성공 → 장애 → 복구 (점 하나 = scrape 한 번)
      const UPS = [null, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1], f = k === 1 ? E(u, 0.2, 2.2) : 1;
      tx(70, 250, 'up', { 'font-size': 15, 'font-weight': 700, fill: INFO }); tx(70, 330, '대상 시계열', { 'font-size': 14, 'font-weight': 700 });
      UPS.forEach((v, i) => { if (i / UPS.length > f) return; const x = 190 + i * 66;
        if (v == null) { mono(x, 254, '—', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT }); return; }
        el('circle', { cx: x, cy: v ? 230 : 270, r: 8, fill: v ? GOOD : BAD });
        if (k === 2) { if (v) el('circle', { cx: x, cy: 325, r: 7, fill: INK }); } });
      if (k === 1) [['추가', 0], ['첫 성공', 1], ['장애', 4], ['복구', 8]].forEach(([s, i], j) => tx(190 + i * 66, 375, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3 + j * 0.5) }));
      if (k === 2) { el('rect', { x: 190 + 4 * 66 - 24, y: 305, width: 66 * 3 + 48, height: 40, rx: 6, fill: C.BADBG, opacity: fade(u, 0.4) });
        tx(190 + 5.5 * 66, 375, '대상 시계열은 끊겨도 up=0은 매번 찍힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); }
      return; }
    if (k === 3) { [['groups:', 0], ['- name: target-health', 1], ['rules:', 2], ['- alert: …', 3]].forEach(([s, d], i) => { const sc = E(u, 0.2 + i * 0.4, 0.6 + i * 0.4);
        el('rect', { x: 120 + d * 50, y: 70 + i * 70, width: (680 - d * 50) * sc, height: 52, rx: 8, fill: d === 3 ? ACCBG : SOFT, stroke: GRID });
        if (sc > 0.6) mono(140 + d * 50, 102 + i * 70, s, { 'font-size': 16, 'font-weight': 700, fill: d === 3 ? ACC : INK }); });
      sub(480, 380, 'rule 파일 = groups → name → rules', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 4) { snippet(40, 40, ['- alert: InstanceDown', '  expr: up == 0', '  for: 5m'], { op: 1 });
      const X = (m) => 120 + m * 100, f = E(u, 0.4, 2.3) * 7;
      el('line', { x1: X(0), y1: 300, x2: X(7), y2: 300, stroke: MUT, 'stroke-width': 2 });
      [0, 1, 2, 3, 4, 5, 6, 7].forEach((m) => mono(X(m), 324, m + '분', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }));
      el('rect', { x: X(0), y: 240, width: (X(Math.min(f, 5)) - X(0)), height: 40, rx: 6, fill: WARN, opacity: 0.45 });
      if (f > 5) el('rect', { x: X(5), y: 240, width: X(f) - X(5), height: 40, rx: 6, fill: BAD, opacity: 0.9 });
      mono(X(2.5), 266, 'pending', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
      if (f > 5.5) mono(X(6), 266, 'firing', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL });
      tx(620, 100, 'up == 0 인 상태가', { 'font-size': 15, opacity: fade(u, 0.3) }); tx(620, 126, '5분 이어져야 발화', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      sub(480, 380, '재배포 깜빡임은 pending에서 끝난다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 5) { mono(60, 70, 'labels:      severity: critical', { 'font-size': 15, fill: INK, opacity: fade(u, 0.2) });
      mono(60, 110, 'summary:     "{{ $labels.instance }} 다운"', { 'font-size': 15, fill: INK, opacity: fade(u, 0.5) });
      grow(300, 130, 300, 190, E(u, 1.0, 1.4), ACC);
      card(480, 230, 560, 90, { rx: 14, stroke: BAD, sw: 2.4, s: pop(u, 1.4) });
      if (u > 1.7) { tx(480, 222, 'api-3:9090 다운', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD }); mono(480, 252, 'severity="critical"', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT }); }
      sub(480, 340, 'labels는 라우팅에, annotations는 사람이 읽을 문구에', fade(u, 2.1), { 'font-size': 15 }); return; }
    // k6 두 등급
    [['InstanceDown', 'up == 0', 'for 5m', 'critical', WARN], ['JobMajorityDown', 'avg by (job) (up) < 0.5', 'for 2m', 'page', BAD]].forEach(([nm, ex, fr, sv, col], i) => {
      const y = 90 + i * 140, s = pop(u, 0.3 + i * 0.7); card(330, y, 560, 104, { rx: 14, stroke: col, sw: 2.4, s }); if (s < 0.6) return;
      tx(70, y - 18, nm, { 'font-size': 17, 'font-weight': 800, fill: col }); mono(70, y + 10, ex, { 'font-size': 15 }); mono(70, y + 36, fr + ' · severity: ' + sv, { 'font-size': 14.5, fill: MUT }); });
    tx(800, 160, '한 대 다운', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
    tx(800, 300, '절반 넘게 다운', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
    tx(800, 326, '더 빨리, 더 높은 등급', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: 'job "db"에 scheme: https와 metrics_path: /probe를 적었다. Prometheus가 GET 하는 URL은 무엇인가?',
      o: ['http://db-1:9187/metrics', 'https://db-1:9187/probe', 'https://db-1:9187/metrics'], a: 1,
      why: 'URL은 scheme + host:port + metrics_path로 만든다. 적지 않으면 http와 /metrics가 기본값이다.' },
    { q: 'Targets 화면에서 api-3이 DOWN이고 Error가 connection refused다. 무엇을 먼저 의심하나?',
      o: ['그 포트에 앱이 떠 있지 않다', '응답이 scrape_timeout을 넘겼다', 'TLS 인증서가 잘못됐다'], a: 0,
      why: 'connection refused는 연결 자체가 거부된 것이다. timeout은 context deadline exceeded, 인증서는 x509 문구로 나온다.' },
    { q: 'api job에서 다운된 대수를 숫자 하나로 받으려면 어떤 식을 쓰나?',
      o: ['sum by (job) (up == 0)', 'avg by (job) (up)', 'count by (job) (up == 0)'], a: 2,
      why: 'up == 0 필터 뒤 남은 값은 모두 0이라 sum은 늘 0이다. 남은 시계열 수를 세는 count가 다운 대수다.' },
    { q: '새 target을 설정에 막 추가한 직후 Targets 화면의 상태는 무엇인가?',
      o: ['DOWN', 'UNKNOWN', 'UP'], a: 1,
      why: '아직 한 번도 scrape하지 않았으므로 UNKNOWN이다. 첫 scrape 결과에 따라 UP이나 DOWN으로 바뀐다.' },
  ];

  const summary = [
    'target은 Prometheus가 GET 할 host:port 하나이고 path를 안 적으면 /metrics다.',
    '모든 시계열에 job과 instance가 자동으로 붙어 어느 묶음의 어느 한 대인지 가린다.',
    'Targets 화면은 UNKNOWN, UP, DOWN과 실패 사유를 보여 준다. DOWN이어도 up=0은 매번 남는다.',
    'up == 0에 for: 5m을 걸면 재배포 깜빡임은 거르고 오래 죽은 대상만 알린다.',
  ];
  const review = [
    { q: 'api 3대 중 api-2의 초당 요청만 유난히 높은지 보고 싶다. 알맞은 식은?',
      o: ['sum by (job) (rate(http_requests_total[5m]))', 'topk(5, sum by (instance) (rate(http_requests_total[5m])))', 'count by (job) (up == 0)'], a: 1,
      why: 'instance로 묶어야 대별 값이 남는다. job으로 묶으면 3대가 한 줄로 합쳐져 쏠림이 안 보인다.' },
    { q: 'InstanceDown 알람이 왔는데 Targets 화면 Error가 context deadline exceeded다. 다음에 볼 것은?',
      o: ['그 대상의 scrape_duration_seconds가 timeout에 얼마나 가까웠는지', '포트가 열려 있는지', 'CA 인증서 경로'], a: 0,
      why: '이 문구는 scrape_timeout을 넘겼다는 뜻이다. 소요시간이 점점 늘었다면 대상이 느려진 것이고 timeout을 손볼지 정한다.' },
    { q: 'api job 3대가 한꺼번에 내려가 avg by (job) (up)이 0이 됐다. 어떤 알람이 먼저 오나?',
      o: ['InstanceDown이 2분 만에 먼저 온다', '둘 다 5분 뒤에 같이 온다', 'JobMajorityDown이 2분 만에 page로 먼저 온다'], a: 2,
      why: 'JobMajorityDown은 평균이 0.5 미만이면 for 2m 뒤 page로 발화한다. InstanceDown은 for 5m이라 그 뒤에 온다.' },
  ];

  R.page({ title: 'Target과 instance', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
