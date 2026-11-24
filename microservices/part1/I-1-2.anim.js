/* I-1-2 언제 MSA (Conway's Law) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 사람(점)과 소통선이 왼쪽, 그 조직이 만든 시스템 조각이 오른쪽. 아래 계기판은 STEPS 의 teamCount · teamSize · coupling.
 * 숫자: 페이지 데이터·문서만. 채널 수 n(n-1)/2, SLA 월 허용 중단(30일 기준), 10명/8서비스 = 1.25 는 node 로 계산했다.
 * 결합도(%)와 인원별 생산성 표는 페이지가 든 어림값이라 그림에도 "어림", "예시 값"으로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, meters, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;
  const TC = [ACC, INFO, WARN, GOOD, BAD, MUT, ACC, INFO];
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };

  function gauges(c) { const b = c.beat, p = c.prev || {};
    const tc = tween(p.teamCount, b.teamCount, c.u), ts = tween(p.teamSize, b.teamSize, c.u), cp = tween(p.coupling, b.coupling, c.u);
    meters(150, 334, 660, [
      { name: '팀 수', val: Math.round(tc) + '개', bar: tc / 8 * 100 },
      { name: '팀당 인원', val: (Math.abs(ts - Math.round(ts)) > 0.01 ? ts.toFixed(2) : Math.round(ts)) + '명', bar: ts / 30 * 100 },
      { name: '결합도 (어림)', val: Math.round(cp) + '%', bar: cp, hot: cp >= 70, good: cp <= 35 },
    ], { h: 64 }); }
  // 팀 하나: 가운데 (cx,cy) 둘레 n명, 안쪽 소통선(mesh)
  function team(cx, cy, n, col, o) { o = o || {}; const r = o.r ?? (n > 12 ? 52 : 26), op = o.op ?? 1, pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 - Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    if (o.mesh) { const m = o.mesh; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if (n > 12 && (i + j) % 3) continue;
      el('line', { x1: pts[i][0], y1: pts[i][1], x2: pts[j][0], y2: pts[j][1], stroke: col, 'stroke-width': 1, opacity: 0.35 * m * op }); } }
    pts.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: o.dr || 5.5, fill: col, opacity: op }));
    return pts; }
  // 시스템 조각
  function block(cx, cy, w, h, s, o) { o = o || {}; return card(cx, cy, w, h, { rx: 8, text: s, fs: o.fs || 14, mono: o.mono !== false, stroke: o.stroke || INK, fill: o.fill || SOFT, color: o.color, dash: o.dash, s: o.s, op: o.op }); }

  // ---------- 1. Conway's Law ----------
  const Q4 = [[130, 110], [290, 110], [130, 230], [290, 230]];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const lines = ['"Any organization that designs a system', ' will produce a design whose structure', ' is a copy of the organization\'s', ' communication structure."'];
      const n = E(u, 0.1, 1.8) * lines.length;
      if (u > 1.9) el('rect', { x: 100, y: 172, width: tw('communication structure', 19) * E(u, 1.9, 2.4), height: 26, rx: 3, fill: HL, opacity: 0.9 });
      lines.forEach((s, i) => { const f = clamp(n - i); if (f <= 0) return; mono(90, 76 + i * 38, s.slice(0, Math.round(s.length * f)), { 'font-size': 19, 'font-weight': 600 }); });
      tx(860, 240, '— Melvin Conway, 1968', { 'font-size': 15, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      note(90, 290, '조직도가 아니라 "누가 누구와 말하는가"', fade(u, 2.3), { fill: ACC });
      gauges(c); return; }
    if (k === 1) { team(230, 170, 30, INK, { mesh: E(u, 0.2, 1.2), r: 92, dr: 5 });
      tx(230, 300, '30명 · 한 팀', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      grow(400, 170, 540, 170, E(u, 1.0, 1.6), ACC); note(470, 156, '닮는다', fade(u, 1.4), { 'text-anchor': 'middle', fill: ACC });
      block(720, 170, 260, 190, '모놀리스 1개', { s: pop(u, 1.6), fs: 16 });
      gauges(c); return; }
    if (k === 2) { // 한 덩어리가 네 팀으로 쪼개진다 → 시스템도 4조각
      const f = E(u, 0.2, 1.2);
      for (let g = 0; g < 4; g++) for (let i = 0; i < 8; i++) { const a = (g * 8 + i) / 32 * Math.PI * 2, x0 = 210 + Math.cos(a) * 92, y0 = 170 + Math.sin(a) * 92;
        const b = i / 8 * Math.PI * 2, x1 = Q4[g][0] + Math.cos(b) * 26, y1 = Q4[g][1] + Math.sin(b) * 26;
        el('circle', { cx: lerp(x0, x1, f), cy: lerp(y0, y1, f), r: 5.5, fill: f > 0.5 ? TC[g] : INK }); }
      ['pass 1', 'pass 2', 'pass 3', 'pass 4'].forEach((s, i) => { const x = 560 + i * 100, sp = E(u, 1.2, 1.9);
        block(lerp(720, x + 40, sp), 170, lerp(260, 84, sp), lerp(190, 84, sp), sp > 0.6 ? s : '', { stroke: sp > 0.6 ? TC[i] : INK });
        if (i && sp >= 1) grow(x - 58 + 40, 170, x - 2, 170, E(u, 1.9 + i * 0.1, 2.1 + i * 0.1), MUT); });
      note(720, 270, '컴파일러 팀 4개 → 4-pass 컴파일러', fade(u, 2.1), { 'text-anchor': 'middle', fill: ACC });
      gauges(c); return; }
    if (k === 3) { // 팀 안은 싸고 팀 간은 비싸다 → 코드도 그렇게 붙는다
      team(140, 150, 8, ACC, { mesh: E(u, 0.2, 0.9), r: 46 }); team(330, 150, 8, INFO, { mesh: E(u, 0.2, 0.9), r: 46 });
      sub(140, 228, '팀 안: 슬랙 한 줄', fade(u, 0.7), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      const g = E(u, 1.0, 1.6); el('line', { x1: 186, y1: 150, x2: lerp(186, 284, g), y2: 150, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      sub(235, 98, '팀 간: 미팅 · 문서', fade(u, 1.4), { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      // 코드 모듈: 안은 굵게, 사이는 점선
      const m = [[620, 150], [820, 150]];
      m.forEach(([x, y], j) => { zone(x - 80, y - 70, 160, 140, j ? 'team B 코드' : 'team A 코드', { fill: j ? INFOBG : ACCBG, op: fade(u, 1.5) });
        [[-35, -15], [35, -15], [0, 40]].forEach(([dx, dy], i, a) => { const [ex, ey] = a[(i + 1) % 3]; el('line', { x1: x + dx, y1: y + dy, x2: x + ex, y2: y + ey, stroke: j ? INFO : ACC, 'stroke-width': 4, opacity: fade(u, 1.7) }); });
        [[-35, -15], [35, -15], [0, 40]].forEach(([dx, dy]) => el('rect', { x: x + dx - 14, y: y + dy - 10, width: 28, height: 20, rx: 4, fill: PANEL, stroke: j ? INFO : ACC, 'stroke-width': 2, opacity: fade(u, 1.7) })); });
      el('line', { x1: 655, y1: 135, x2: 785, y2: 135, stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '5 5', opacity: fade(u, 2.0) });
      note(720, 268, '비용 차이가 결합도로 굳는다', fade(u, 2.2), { 'text-anchor': 'middle', fill: ACC });
      gauges(c); return; }
    if (k === 4) { // 아키텍처를 먼저 그리고 팀을 맞춘다
      const S6 = [[600, 90], [720, 90], [840, 90], [600, 210], [720, 210], [840, 210]];
      S6.forEach(([x, y], i) => block(x, y, 100, 80, 'svc ' + (i + 1), { dash: '6 5', stroke: TC[i], s: pop(u, 0.2 + i * 0.12) }));
      note(720, 286, '① 원하는 서비스 모양을 먼저 그린다', fade(u, 0.8), { 'text-anchor': 'middle', fill: MUT, 'font-size': 14.5 });
      for (let g = 0; g < 6; g++) for (let i = 0; i < 8; i++) { const id = g * 8 + i, x0 = 90 + (id % 8) * 34, y0 = 70 + Math.floor(id / 8) * 36;
        const tx0 = 120 + (g % 3) * 120, ty0 = 110 + Math.floor(g / 3) * 120, b = i / 8 * Math.PI * 2, x1 = tx0 + Math.cos(b) * 24, y1 = ty0 + Math.sin(b) * 24, f = E(u, 1.1 + g * 0.08, 1.9 + g * 0.08);
        el('circle', { cx: lerp(x0, x1, f), cy: lerp(y0, y1, f), r: 5, fill: f > 0.5 ? TC[g] : OFF }); }
      note(240, 300, '② 팀을 그 모양대로 짠다', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC, 'font-size': 14.5 });
      gauges(c); return; }
    // k5: 한 팀이 여러 서비스 → 다시 한 덩어리
    team(150, 120, 8, ACC, { mesh: 1, r: 34 });
    const mg = E(u, 0.9, 1.8);
    [0, 1, 2, 3].forEach((i) => { const x = lerp(420 + i * 120, 600, mg), w = lerp(100, 300, mg);
      if (mg < 0.98 || i === 0) block(x, 120, mg >= 0.98 ? 300 : 100, 70, mg >= 0.98 ? '사실상 모놀리스' : mg > 0.05 ? '' : 'svc ' + (i + 1), { stroke: mg >= 0.98 ? BAD : ACC, op: mg >= 0.98 ? 1 : 1 - 0.3 * mg }); });
    grow(200, 120, 360, 120, E(u, 0.2, 0.7), MUT);
    if (mg >= 0.98) cross(770, 96, 11, pop(u, 1.9));
    sub(150, 186, '한 팀이 서비스 4개', fade(u, 0.3), { 'font-size': 14.5 });
    tx(80, 260, 'MSA 로 가려면 조직부터 도메인 단위로', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
    tx(80, 290, '모놀리스를 지키려면 팀을 합친다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.3) });
    gauges(c); }

  // ---------- 2. 10명 이하 팀 ----------
  const SV8 = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [560 + (i % 4) * 100, 90 + Math.floor(i / 4) * 120]);
  function s2(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { const sp = k === 1 ? E(u, 0.3, 1.3) : 0;
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, x0 = 210 + Math.cos(a) * 70, y0 = 160 + Math.sin(a) * 70, sv = SV8[i % 8], x1 = sv[0] + (i >= 8 ? 24 : -10), y1 = sv[1] + 52;
        el('circle', { cx: lerp(x0, x1, sp), cy: lerp(y0, y1, sp), r: 7, fill: INK, opacity: k === 0 ? pop(u, 0.1 + i * 0.05) : 1 }); }
      if (k === 0) { el('circle', { cx: 210, cy: 160, r: 38, fill: SOFT, stroke: GRID, 'stroke-width': 2 }); tx(210, 165, 'standup', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
        block(640, 110, 220, 110, 'shop.jar\n(repo 1개)', { s: pop(u, 0.6), fs: 15 });
        ['grep 한 번', '통합 테스트 1번', '매일 17:00 배포'].forEach((s, i) => pill(640, 200 + i * 38, s, GOOD, pop(u, 1.2 + i * 0.3), { fs: 14 }));
        tx(210, 268, '10명 · 한 팀', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
        gauges(c); return; }
      SV8.forEach(([x, y], i) => { block(x, y, 84, 56, 'svc ' + (i + 1), { s: pop(u, 0.1 + i * 0.06), stroke: WARN, fs: 13.5 }); });
      for (let i = 0; i < 6; i++) dot([[210, 160], SV8[(i * 3) % 8]], ((t * 0.5 + i / 6) % 1), WARN, 5);
      pill(210, 60, 'PR 이 repo 8개로', WARN, pop(u, 1.4), { fs: 14 });
      pill(210, 270, 'docker-compose 컨테이너 8개', WARN, pop(u, 1.8), { fs: 14 });
      mono(710, 300, '10명 ÷ 8개 = 서비스당 1.25명', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.2) });
      gauges(c); return; }
    if (k === 2) { // 인원별 생산성 (페이지의 예시 값)
      const xs = [5, 10, 20, 50, 100], mono_ = [100, 100, 100, 80, 50], msa = [60, 75, 100, 140, 180];
      const ax = axes(160, 50, 600, 230, { x: [0, 4], y: [0, 200], yt: [0, 50, 100, 150, 200], grid: true, yl: '생산성 %' });
      xs.forEach((v, i) => mono(ax.X(i), 300, v + '명', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      line(ax, mono_.map((v, i) => [i, v]), E(u, 0.2, 1.4), INFO, { sw: 3 }); line(ax, msa.map((v, i) => [i, v]), E(u, 0.5, 1.7), ACC, { sw: 3 });
      if (u > 1.4) mono(ax.X(4) + 10, ax.Y(50) + 5, '모놀리스', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
      if (u > 1.7) mono(ax.X(4) + 10, ax.Y(180) + 5, 'MSA', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      el('circle', { cx: ax.X(2), cy: ax.Y(100), r: 10, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.9) });
      tx(ax.X(2), ax.Y(100) - 20, '20명 비등', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      pill(480, 30, '예시 값 · 실측 아님', MUT, pop(u, 0.3), { fs: 13.5 });
      gauges(c); return; }
    if (k === 3) { // 인원 구간
      const X = (n) => 100 + n / 60 * 760;
      const Z = [[0, 10, '모놀리스', GOOD], [10, 30, '모듈러 모놀리스', INFO], [30, 50, 'MSA 검토', WARN], [50, 60, 'MSA 보통 이득', ACC]];
      Z.forEach(([a, b, s, col], i) => { const f = E(u, 0.2 + i * 0.35, 0.6 + i * 0.35);
        el('rect', { x: X(a), y: 120, width: (X(b) - X(a) - 4) * f, height: 54, rx: 6, fill: col, opacity: 0.85 });
        tx((X(a) + X(b)) / 2, 206, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.5 + i * 0.35) }); });
      [0, 10, 30, 50].forEach((n) => mono(X(n), 108, n + '명', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      mono(X(60) - 4, 108, '…', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const m = X(8); el('path', { d: `M${m},236 l-9,16 h18 z`, fill: INK, opacity: fade(u, 1.9) }); tx(m, 276, '우리 팀 8명', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      gauges(c); return; }
    // k4: 미리 쪼갬 vs 나중에 쪼갬
    el('line', { x1: 160, y1: 250, x2: 880, y2: 250, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' }); tx(880, 274, '시간', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    tx(40, 110, '미리 MSA', { 'font-size': 15, 'font-weight': 700, fill: BAD }); tx(40, 200, '나중에 분리', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
    const f = E(u, 0.2, 1.8);
    el('rect', { x: 160, y: 92, width: 720 * f, height: 26, rx: 4, fill: BAD, opacity: 0.75 });
    sub(220, 140, '첫날부터 repo·CI·운영 고정비', fade(u, 0.5), { 'text-anchor': 'start', 'font-size': 14 });
    el('rect', { x: 160, y: 190, width: Math.min(460, 720 * f), height: 8, rx: 4, fill: GOOD });
    if (720 * f > 460) el('rect', { x: 620, y: 182, width: 720 * f - 460, height: 26, rx: 4, fill: WARN, opacity: 0.75 });
    el('line', { x1: 620, y1: 80, x2: 620, y2: 250, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.3) });
    tx(626, 74, '실제로 커졌을 때', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.3) });
    note(480, 300, '대부분은 그 시점 전에 문을 닫는다 · YAGNI', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT });
    gauges(c); }

  // ---------- 3. 경계가 분명한 도메인 4개 ----------
  const DM = [
    { n: 'catalog', team: 8, r: 95, p95: 100, sla: 99.9, down: '43.2분', st: 'PostgreSQL + ES' },
    { n: 'order', team: 8, r: 50, p95: 200, sla: 99.95, down: '21.6분', st: 'PostgreSQL' },
    { n: 'shipping', team: 6, r: 70, p95: 500, sla: 99, down: '7.2시간', st: 'PostgreSQL + DynamoDB' },
    { n: 'recommendation', team: 5, r: 100, p95: 50, sla: 99, down: '7.2시간', st: 'Redis + Feature Store' },
  ];
  const DX = [130, 360, 590, 820];
  function domain(i, a, o) { o = o || {}; const d = DM[i], x = DX[i], s = pop(a, 0), op = fade(a, 0.2);
    if (s <= 0) return;
    card(x, 52, 200, 52, { rx: 10, stroke: TC[i], fill: PANEL, sw: 2.5, s });
    mono(x, 50, d.n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: TC[i], opacity: op });
    tx(x, 70, `팀 ${d.team}명${i === 3 ? ' · Python' : ''}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op });
    const bw = 190, rf = E(a, 0.2, 0.9), x0 = x - bw / 2;
    el('rect', { x: x0, y: 96, width: bw, height: 20, rx: 4, fill: WARN, opacity: 0.75 * op });
    el('rect', { x: x0, y: 96, width: bw * d.r / 100 * rf, height: 20, rx: 4, fill: INFO });
    mono(x0, 138, `read ${d.r}%`, { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: op }); if (d.r < 100) mono(x0 + bw, 138, `write ${100 - d.r}%`, { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
    const pf = E(a, 0.5, 1.2); el('rect', { x: x0, y: 154, width: bw * d.p95 / 500 * pf, height: 14, rx: 3, fill: d.p95 >= 500 ? BAD : MUT });
    mono(x0, 190, `p95 ${d.p95}ms`, { 'font-size': 14, 'font-weight': 700, fill: d.p95 >= 500 ? BAD : INK, opacity: fade(a, 0.9) });
    mono(x0, 216, `SLA ${d.sla}%`, { 'font-size': 14, 'font-weight': 700, opacity: fade(a, 1.0) });
    tx(x0, 238, `한 달 ${d.down} 중단 허용`, { 'font-size': 13.5, fill: MUT, opacity: fade(a, 1.1) });
    tx(x, 270, d.st, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, 'font-weight': 600, opacity: fade(a, 1.2) }); }
  function s3(t, c) { const { k, u } = c;
    for (let i = 0; i < 4; i++) { if (i > k && k < 4) continue; domain(i, i === k ? u : 3); }
    if (k === 2) { for (let i = 0; i < 3; i++) dot([[DX[2] + 100, 300], [DX[2] + 100, 190]], ((t * 0.18 + i / 3) % 1), BAD, 5); tx(DX[2] + 96, 310, '택배사 API', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 }); }
    if (k === 3) pill(DX[3], 300, 'Java jar 에는 못 들어간다', BAD, pop(u, 1.5), { fs: 13.5 });
    if (k === 4) { DX.forEach((x, i) => { el('rect', { x: x - 108, y: 20, width: 216, height: 264, rx: 14, fill: 'none', stroke: TC[i], 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 0.2 + i * 0.15) }); });
      [0, 1, 2].forEach((i) => { const f = E(u, 1.0 + i * 0.3, 1.4 + i * 0.3); el('line', { x1: DX[i] + 108, y1: 300, x2: lerp(DX[i] + 108, DX[i + 1] - 108, f), y2: 300, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 5' }); });
      tx(480, 318, '도메인 사이는 REST + 이벤트로 느슨하게', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) }); }
    gauges(c); }

  // ---------- 4. Two-Pizza Team ----------
  function pizza(cx, cy, r, s) { const g = R.G(cx, cy, s); el('circle', { cx: 0, cy: 0, r, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; el('line', { x1: -Math.cos(a) * r, y1: -Math.sin(a) * r, x2: Math.cos(a) * r, y2: Math.sin(a) * r, stroke: WARN, 'stroke-width': 1.5 }, g); } }
  function graph(cx, cy, n, r, f, col) { const P = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 - Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    const E2 = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) E2.push([i, j]);
    const m = Math.floor(f * E2.length); E2.slice(0, m).forEach(([i, j]) => el('line', { x1: P[i][0], y1: P[i][1], x2: P[j][0], y2: P[j][1], stroke: col, 'stroke-width': 1, opacity: 0.45 }));
    P.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 5, fill: INK })); return m; }
  const CH = ['요구 파악', '설계', '구현', '테스트', '배포', '모니터링', '24x7 on-call', '사용자 지원', 'SLO'];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { pizza(440, 150, 40, pop(u, 0.2)); pizza(530, 150, 40, pop(u, 0.4));
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, s = pop(u, 0.7 + i * 0.1); el('circle', { cx: 485 + Math.cos(a) * 140, cy: 150 + Math.sin(a) * 92, r: 11 * s, fill: ACC }); }
      tx(485, 286, '피자 두 판 = 6~10명', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      pill(820, 110, 'build', INFO, pop(u, 1.9), { fs: 15 }); pill(820, 160, '+ run', ACC, pop(u, 2.1), { fs: 15 });
      gauges(c); return; }
    if (k === 1) { const f1 = E(u, 0.2, 1.0), f2 = E(u, 0.9, 2.3);
      const m1 = graph(200, 150, 8, 92, f1, INFO), m2 = graph(600, 150, 20, 118, f2, BAD);
      mono(200, 280, `8명 · ${m1}개`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      mono(600, 300, `20명 · ${m2}개`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      mono(860, 120, 'n(n-1)/2', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      [['5명', '10'], ['10명', '45'], ['50명', '1225']].forEach(([a, b], i) => mono(860, 160 + i * 28, `${a} → ${b}`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2 + i * 0.1) }));
      gauges(c); return; }
    if (k === 2) { const TP = [[150, 110], [370, 110], [590, 110], [810, 110]];
      TP.forEach(([x, y], i) => { card(x, y, 150, 104, { rx: 12, stroke: TC[i], s: pop(u, 0.2 + i * 0.12) }); team(x, y - 8, 8, TC[i], { r: 24, dr: 4.5, op: fade(u, 0.4 + i * 0.12) });
        el('rect', { x: x - 26, y: y + 52, width: 52, height: 20, rx: 4, fill: TC[i], opacity: fade(u, 0.9) }); mono(x, y + 67, 'API', { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 0.9) }); });
      [[0, 1], [1, 2], [2, 3], [0, 2]].forEach(([a, b], i) => { const f = E(u, 1.2 + i * 0.2, 1.6 + i * 0.2), y = 200 + (i === 3 ? 40 : 0);
        el('path', { d: `M${TP[a][0]},182 V${y} H${lerp(TP[a][0], TP[b][0], f)}${f >= 1 ? ` V182` : ''}`, fill: 'none', stroke: MUT, 'stroke-width': 2 }); });
      note(480, 290, 'Mandate 2002 · 팀 간은 service interface 로만', fade(u, 2.1), { 'text-anchor': 'middle', fill: ACC });
      gauges(c); return; }
    if (k === 3 || k === 4) { const n = k === 3 ? 4 : 9, w = 96;
      CH.forEach((s, i) => { const x = 50 + i * (w + 4) + w / 2, on = i < n, a = k === 3 ? 0.2 + i * 0.25 : i < 4 ? 0 : 0.2 + (i - 4) * 0.25;
        card(x, 150, w, 56, { rx: 8, text: s.replace(' on-call', '\non-call').replace(' 지원', '\n지원'), fs: 13.5, stroke: on ? (i < 4 ? INFO : ACC) : GRID, color: on ? INK : OFF, fill: on ? (i < 4 ? INFOBG : ACCBG) : PANEL, s: on ? pop(u, a) : 1 }); });
      const bx = 50 + (n * (w + 4)) - 4, bf = E(u, 0.3, 1.5);
      el('path', { d: `M50,${110} V100 H${lerp(50, bx, bf)} ${bf >= 1 ? 'V110' : ''}`, fill: 'none', stroke: k === 3 ? INFO : ACC, 'stroke-width': 3 });
      tx(50 + (bx - 50) / 2, 88, k === 3 ? 'build — 어느 조직이나 맡기는 일' : 'build + run — 같은 팀이 끝까지', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: k === 3 ? INFO : ACC, opacity: fade(u, 1.2) });
      if (k === 4) { el('rect', { x: 680, y: 210, width: 48, height: 70, rx: 8, fill: PANEL, stroke: BAD, 'stroke-width': 2.5, transform: `rotate(${Math.sin(t * 20) * 4 * fade(u, 1.5)} 704 245)` });
        mono(704, 252, 'ON', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); tx(750, 250, '새벽 장애도 이 팀이 받는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
      gauges(c); return; }
    if (k === 5) { // Spotify: squad(세로) × chapter(가로)
      const cols = 4, rows = 3, x0 = 280, y0 = 80, cw = 110, rh = 62;
      for (let q = 0; q < cols; q++) { el('rect', { x: x0 + q * cw - 40, y: y0 - 30, width: 80, height: rows * rh + 20, rx: 10, fill: TC[q], opacity: 0.12 * fade(u, 0.2 + q * 0.1) });
        mono(x0 + q * cw, y0 - 40, 'Squad ' + (q + 1), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: TC[q], opacity: fade(u, 0.2 + q * 0.1) });
        for (let r = 0; r < rows; r++) el('circle', { cx: x0 + q * cw, cy: y0 + r * rh, r: 9 * pop(u, 0.4 + q * 0.1 + r * 0.05), fill: TC[q] }); }
      ['backend', 'ios', 'data'].forEach((s, r) => { const f = E(u, 1.0 + r * 0.2, 1.5 + r * 0.2); el('line', { x1: x0 - 50, y1: y0 + r * rh, x2: lerp(x0 - 50, x0 + 3 * cw + 50, f), y2: y0 + r * rh, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '2 4' });
        tx(x0 - 60, y0 + r * rh + 5, 'Chapter: ' + s, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 600, opacity: f }); });
      el('path', { d: `M${x0 - 40},${y0 + rows * rh + 4} H${x0 + 3 * cw + 40}`, stroke: ACC, 'stroke-width': 3, opacity: fade(u, 1.8) });
      tx(x0 + 1.5 * cw, y0 + rows * rh + 28, 'Tribe = squad 묶음 · Guild = 느슨한 관심사 모임', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
      gauges(c); return; }
    // k6: lifecycle 을 한 팀이 가진다
    const cx = 260, cy = 160, rr = 80, f = E(u, 0.2, 1.4);
    el('circle', { cx, cy, r: rr, fill: 'none', stroke: GRID, 'stroke-width': 10 });
    el('circle', { cx, cy, r: rr, fill: 'none', stroke: GOOD, 'stroke-width': 10, 'stroke-dasharray': `${2 * Math.PI * rr * f} 999`, transform: `rotate(-90 ${cx} ${cy})` });
    ['build', 'deploy', 'run', 'on-call'].forEach((s, i) => { const a = i / 4 * Math.PI * 2 - Math.PI / 2; pill(cx + Math.cos(a) * (rr + 6), cy + Math.sin(a) * (rr + 6), s, GOOD, pop(u, 0.3 + i * 0.25), { fs: 13.5, fill: PANEL }); });
    block(cx, cy, 90, 44, 'svc', { stroke: GOOD });
    if (f >= 1) check(cx, cy + 128, 12, pop(u, 1.4));
    block(700, cy, 110, 56, 'svc', { stroke: BAD, s: pop(u, 1.4) });
    [[560, 70], [840, 70], [700, 300]].forEach(([x, y], i) => { team(x, y, 6, TC[i], { r: 18, dr: 4, op: fade(u, 1.5 + i * 0.1) }); grow(x, y + (y > cy ? -26 : 26), lerp(x, 700, 0.6), lerp(y + (y > cy ? -26 : 26), cy, 0.6), E(u, 1.7, 2.1), BAD); });
    if (u > 2.1) cross(760, cy - 34, 10, pop(u, 2.1));
    gauges(c); }

  // ---------- 5. 의사결정 트리 ----------
  const QN = [['Q1', '팀 30명 이상?'], ['Q2', '도메인 경계 명확?'], ['Q3', '트래픽 · SLA 격차?'], ['Q4', 'DevOps 역량?']];
  const LEAF = ['모놀리스 유지', '모듈러 모놀리스', '모놀리스로 충분', '인프라부터 키운다'];
  const QP = (i) => [110 + i * 165, 54 + i * 80];
  function tree(n, op) {
    for (let i = 0; i < n; i++) { const [x, y] = QP(i);
      card(x, y, 176, 52, { rx: 10, stroke: INK, fill: PANEL, op });
      mono(x - 76, y + 6, QN[i][0], { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op }); tx(x - 44, y + 6, QN[i][1], { 'font-size': 14.5, 'font-weight': 600, opacity: op });
      el('line', { x1: x + 88, y1: y, x2: x + 140, y2: y, stroke: BAD, 'stroke-width': 2, opacity: op }); mono(x + 114, y - 8, 'NO', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: op });
      card(x + 220, y, 150, 40, { rx: 20, text: LEAF[i], fs: 14, stroke: i === 3 ? BAD : INFO, color: i === 3 ? BAD : INFO, op });
      const ny = i < 3 ? QP(i + 1) : [x, y + 80];
      el('path', { d: `M${x},${y + 26} V${ny[1]} H${ny[0] - 88}`, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: op * (i < 3 ? 1 : 0) });
      if (i < 3) mono(x + 8, y + 50, 'YES', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: op }); }
    if (n >= 4) { const [x, y] = QP(3); el('line', { x1: x, y1: y + 26, x2: x, y2: y + 62, stroke: GOOD, 'stroke-width': 2, opacity: op }); mono(x + 8, y + 50, 'YES', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: op });
      card(x, y + 84, 150, 40, { rx: 20, text: 'MSA 도입', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, op }); } }
  // 사례 토큰이 질문을 따라 내려간다: stop = 멈추는 질문 번호(NO), 4 = MSA
  function token(name, stop, u, a, off) { const pts = [];
    for (let i = 0; i <= Math.min(stop, 3); i++) { const [x, y] = QP(i); pts.push([x, y]); if (i < Math.min(stop, 3) || stop === 4) { const ny = i < 3 ? QP(i + 1) : [x, y + 84]; pts.push([x, ny[1]]); } }
    if (stop < 4) { const [x, y] = QP(stop); pts.push([x + 220, y]); }
    const f = E(u, a, a + 1.1); if (f <= 0) return;
    const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = segs.reduce((s, v) => s + v, 0);
    let d = f * tot, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const q = segs[i] ? d / segs[i] : 0, x = lerp(pts[i][0], pts[i + 1][0], q), y = lerp(pts[i][1], pts[i + 1][1], q);
    if (typeof off === 'function') off = off(f);
    if (f < 1) { el('circle', { cx: x, cy: y, r: 7, fill: INK }); return; }
    card(x + off[0], y + off[1], tw(name, 13.5) + 22, 26, { rx: 13, fill: INK, stroke: 'none', text: name, fs: 13.5, fw: 700, color: PANEL }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tree(2, 1); [0, 1].forEach((i) => { const [x, y] = QP(i); el('rect', { x: x - 92, y: y - 30, width: 184 + 300 * (1 - E(u, 0.2 + i * 0.6, 0.9 + i * 0.6)), height: 60, fill: PANEL, opacity: 1 - E(u, 0.2 + i * 0.6, 0.9 + i * 0.6) }); });
      note(700, 300, '30명이 안 되면 여기서 끝난다', fade(u, 1.8), { 'text-anchor': 'middle', fill: INFO }); return; }
    if (k === 1) { tree(4, 1); [2, 3].forEach((i, j) => { const [x, y] = QP(i), h = fade(u, 0.2 + j * 0.6, 0.6); if (h < 1) el('rect', { x: x - 92, y: y - 30, width: 420, height: i === 3 ? 160 : 60, fill: PANEL, opacity: 1 - h }); });
      return; }
    if (k === 2 || k === 3) { tree(4, 1);
      if (k === 2) { token('A · 5명', 0, u, 0.2, [0, -34]); token('B · 25명', 0, u, 1.0, [0, 34]); }
      else { token('C · 50명', 4, u, 0.1, [-130, 0]); token('D · 80명', 1, u, 0.6, [0, -34]); token('E · 100명', 3, u, 1.2, [0, -34]); }
      return; }
    tree(4, 0.1);
    card(260, 200, 340, 120, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 0.2) }); cross(130, 200, 12, pop(u, 0.4));
    tx(160, 194, '"유행이라서"', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4) }); tx(160, 222, '"면접에서 물어봐서"', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5) });
    card(700, 200, 340, 120, { rx: 12, stroke: GOOD, fill: GOODBG, s: pop(u, 1.0) }); check(570, 200, 12, pop(u, 1.2));
    tx(600, 194, '"지금 모놀리스가', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) }); tx(600, 222, ' 실제로 깨지고 있다"', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.3) });
    note(480, 320, 'MSA 는 통증을 푸는 도구다', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC }); }

  const quiz = [
    { q: '콘웨이 법칙에서 시스템 구조가 닮는 대상은 무엇인가?',
      o: ['회사의 공식 조직도', '조직의 의사소통 구조', '사용하는 프로그래밍 언어'], a: 1,
      why: '원문은 "communication structure"다. 누가 누구와 싸게 말하는지가 코드의 결합을 정한다.' },
    { q: '10명 팀이 서비스 8개를 맡으면 생기는 일은 무엇인가?',
      o: ['서비스당 1.25명꼴이라 사람이 서비스를 오가며 결합을 다시 만든다', '팀당 인원이 줄어 소통 비용이 0이 된다', '통합 테스트가 한 번으로 줄어든다'], a: 0,
      why: '팀보다 서비스가 많으면 PR은 repo 8개로 흩어지고 로컬 테스트는 컨테이너 8개를 띄운다.' },
    { q: 'shipping을 order와 같은 프로세스에 두면 안 되는 이유는 무엇인가?',
      o: ['shipping 팀 인원이 6명이라서', '읽기 비율이 70%라서', '택배사 API에 묶여 p95가 500ms라 그 지연이 order로 번져서'], a: 2,
      why: 'SLA 99.95%인 order와 99%인 shipping을 한 프로세스에 묶으면 느린 쪽이 빠른 쪽을 끌어내린다.' },
    { q: '팀 인원이 8명에서 20명이 되면 소통 채널은 몇 개가 되나?',
      o: ['28개에서 190개', '28개에서 70개', '8개에서 20개'], a: 0,
      why: '채널 수는 n(n-1)/2라서 8명은 28개, 20명은 190개다. 인원보다 훨씬 빨리 는다.' },
    { q: '100명 조직인데 DevOps가 1명이면 의사결정 트리는 어디서 멈추나?',
      o: ['Q1, 인원이 많아서', 'Q4, 운영 역량이 없어서', 'Q2, 도메인이 커서'], a: 1,
      why: '규모는 필요조건일 뿐이다. Q4에서 NO가 나오면 MSA보다 인프라와 DevOps 팀을 먼저 키운다.' },
  ];

  const summary = [
    '시스템은 그것을 만든 조직의 의사소통 구조를 닮는다.',
    '10명이 서비스 8개를 맡으면 서비스당 1.25명꼴이 되어 효율이 떨어진다.',
    '소통 채널은 n(n-1)/2로 늘어 8명이면 28개, 20명이면 190개다.',
    '팀 30명, 분명한 경계, 트래픽 격차, 운영 역량이 모두 있을 때 MSA로 간다.',
  ];
  const review = [
    { q: '25명이 한 팀으로 일하는 회사가 아키텍처를 서비스 6개로 바꾸려 한다. 먼저 손댈 것은?',
      o: ['서비스 6개의 repo부터 만든다', '6개 서비스 모양에 맞춰 팀부터 나눈다', 'Kafka를 먼저 도입한다'], a: 1,
      why: '한 팀이 여러 서비스를 만들면 다시 한 덩어리가 된다. Inverse Conway처럼 조직을 먼저 맞춘다.' },
    { q: '50명, 도메인 4개, 운영 5명인 회사가 팀을 20명씩 두 팀으로 묶었다. 생길 문제는?',
      o: ['팀마다 소통 채널이 190개라 팀 안부터 소통이 무너진다', '팀 수가 줄어 배포가 빨라진다', '도메인 경계가 저절로 뚜렷해진다'], a: 0,
      why: 'two-pizza 크기는 6~10명이다. 20명 팀은 채널이 190개라 코드보다 소통이 먼저 무너진다.' },
    { q: '서비스를 나눴는데 배포와 on-call은 다른 운영팀이 맡는다. 무엇이 사라지나?',
      o: ['도메인 이벤트', 'API 계약', '독립 배포'], a: 2,
      why: '운영 책임이 다른 팀에 있으면 배포 결정권도 그쪽으로 간다. build와 run을 같은 팀이 가져야 독립 배포가 된다.' },
  ];

  R.page({ title: '조직 구조 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
