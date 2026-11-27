/* II-1-2 Aggregation (sum/by) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 시계열 한 줄 = 레이블 칩(job·region·instance) + 값 막대. 집계는 칩이 떨어져 나가고 막대가 같은 job끼리 쌓이는 모습.
 * 숫자: 페이지 코드 주석(120·95·140·60·80, 355·140, 215, 118.3, 495)과 그 계산을 파이썬으로 다시 낸 값.
 *       평균의 평균(1,000건 0.1초, 10건 2.0초 → 1.05초 / 0.119초)과 up 경보 장면은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, snippet, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const SER = [
    { job: 'api', region: 'us', inst: '10.0.0.1', v: 120 },
    { job: 'api', region: 'us', inst: '10.0.0.2', v: 95 },
    { job: 'api', region: 'eu', inst: '10.0.0.3', v: 140 },
    { job: 'web', region: 'us', inst: '10.0.1.1', v: 60 },
    { job: 'web', region: 'eu', inst: '10.0.1.2', v: 80 },
  ];
  const JC = { api: ACC, web: INFO };
  // 레이블 칩 하나 (가운데 기준). o.gone 이면 흐리게 줄 긋기
  function chip(cx, cy, s, col, o) { o = o || {}; const w = tw(s, 14) + 20;
    card(cx, cy, w, 28, { rx: 14, stroke: o.gone ? OFF : col, sw: 1.8, fill: o.gone ? PANEL : (o.fill || PANEL), text: s, fs: 14, fw: 700, mono: true, color: o.gone ? OFF : col, s: o.s, op: o.op });
    if (o.gone) el('line', { x1: cx - w / 2 + 6, y1: cy, x2: cx + w / 2 - 6, y2: cy, stroke: OFF, 'stroke-width': 2, opacity: o.op ?? 1 }); return w; }
  const BX = 520, SC = 300 / 355;      // 막대 시작점, 355 = 300px
  function bar(x, y, v, col, o) { o = o || {}; const w = Math.max(2, v * SC * (o.g ?? 1));
    el('rect', { x, y: y - 11, width: w, height: 22, rx: 4, fill: col, opacity: o.op ?? 0.85 });
    if (o.label !== false) mono(x + w + 10, y + 5, o.text ?? String(v), { 'font-size': 15, 'font-weight': 800, fill: col, opacity: o.lop ?? 1 }); return w; }
  // 원시 시계열 한 줄: 칩 3개 + 막대
  function rawRow(r, y, o) { o = o || {}; const col = JC[r.job], op = o.op ?? 1;
    chip(108, y, `job="${r.job}"`, col, { op, fill: o.hiJob ? (r.job === 'api' ? ACCBG : INFOBG) : null });
    chip(242, y, `region="${r.region}"`, MUT, { op: op * (o.lop ?? 1), gone: o.goneR });
    chip(408, y, `instance="${r.inst}"`, MUT, { op: op * (o.lop ?? 1), gone: o.goneI });
    if (o.bar !== false) bar(BX + 40, y, r.v, col, { g: o.g, op: 0.85 * op, lop: op }); }
  const RY = (i) => 112 + i * 54;

  // ---------- 1. 인스턴스마다 한 줄 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { SER.forEach((r, i) => { const cx = 120 + i * 180, s = pop(u, 0.2 + i * 0.2);
        server(cx, 110, null, { s: s * 0.8, lamp: JC[r.job] });
        mono(cx, 172, `${r.job} ${r.inst.split('.').slice(-1)}`, { 'font-size': 14, 'text-anchor': 'middle', fill: JC[r.job], 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.2) });
        const g = E(u, 1.2 + i * 0.12, 1.8 + i * 0.12); grow(cx, 188, cx, lerp(188, 300, g), g, JC[r.job], { plain: true, sw: 3 });
        if (g > 0.9) mono(cx, 324, `시계열 ${i + 1}`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
      tx(480, 380, 'target 하나 = 시계열 하나 · api 3대 + web 2대 = 5개', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.2) }); return; }
    mono(60, 60, 'rate(http_requests_total[5m])', { 'font-size': 17, 'font-weight': 700 });
    if (k === 1) sub(560, 60, '집계 없음 · 레이블 전부 붙은 채로', fade(u, 0.4), { 'text-anchor': 'start', 'font-size': 15 });
    const n = k === 2 ? 3 : 5;
    SER.slice(0, n).forEach((r, i) => { const at = k === 1 ? 0.3 + i * 0.3 : k === 3 && i >= 3 ? 0.3 + (i - 3) * 0.4 : -1;
      const op = at < 0 ? (k === 4 ? 0.35 : 1) : fade(u, at); if (op <= 0) return;
      rawRow(r, RY(i), { op, g: at < 0 ? 1 : E(u, at, at + 0.6), hiJob: k === 2 }); });
    if (k === 2) { el('rect', { x: 176, y: RY(0) - 24, width: 370, height: RY(2) - RY(0) + 48, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      tx(360, RY(2) + 52, 'job이 같아도 instance가 다르면 다른 시계열', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) }); }
    if (k === 3) { mono(900, 396, '5개 · 합 495', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.4) }); }
    if (k === 4) { const ax = R.axes(560, 110, 340, 200, { x: [0, 10], y: [0, 160] });
      SER.forEach((r, i) => R.line(ax, Array.from({ length: 11 }, (_, j) => [j, r.v + Math.sin(j * 0.9 + i * 1.7) * 18]), E(u, 0.2 + i * 0.1, 1.2 + i * 0.1), JC[r.job], { sw: 2 }));
      card(730, 360, 340, 46, { rx: 10, stroke: BAD, fill: BADBG, text: '선이 늘수록 서비스 전체가 안 보인다', fs: 15, color: BAD, s: pop(u, 1.6) }); } }

  // ---------- 2. sum by(job) ----------
  function s2(t, c) { const { k, u } = c;
    spans(60, 56, [['sum by (', {}], ['job', { fill: ACC, 'font-weight': 800 }], [') (rate(http_requests_total[5m]))', {}]], { 'font-size': 17, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { SER.forEach((r, i) => rawRow(r, RY(i), { hiJob: true, lop: lerp(1, 0.55, E(u, 0.8, 1.4)) }));
      pill(820, 100, '남김: job', ACC, pop(u, 1.2), { fs: 14 }); pill(820, 140, '접힘: region · instance', MUT, pop(u, 1.6), { fs: 14 }); return; }
    if (k === 1) { SER.forEach((r, i) => { const y = RY(i), f = E(u, 0.3 + i * 0.12, 1.3 + i * 0.12);
        rawRow(r, y, { hiJob: true, lop: 0 });
        if (f < 1) { chip(242 + 30 * f, y - 40 * f, `region="${r.region}"`, MUT, { op: 1 - f }); chip(408 + 60 * f, y - 40 * f, `instance="${r.inst}"`, MUT, { op: 1 - f }); } });
      tx(330, 400, 'by에 없는 레이블은 결과에서 사라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k2~k4: 막대가 job끼리 쌓인다
    const m = k === 2 ? E(u, 0.3, 1.6) : 1;
    const target = { api: 150, web: 250 };
    let accX = { api: BX - 140, web: BX - 140 };
    SER.forEach((r, i) => { const y = lerp(RY(i), target[r.job], m), x0 = lerp(BX + 40, accX[r.job], m), w = r.v * SC;
      el('rect', { x: x0, y: y - 15, width: w, height: 30, rx: 4, fill: JC[r.job], opacity: 0.55 + 0.3 * ((i % 2)), stroke: PANEL, 'stroke-width': 2 });
      if (k === 2) mono(x0 + w / 2, y + 5, String(r.v), { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: 1 - fade(u, 2.0) });
      accX[r.job] += w;
      if (m < 0.98) chip(108, RY(i), `job="${r.job}"`, JC[r.job], { op: 1 - m }); });
    ['api', 'web'].forEach((j) => { const y = target[j], op = k === 2 ? fade(u, 1.5) : 1;
      chip(150, y, `{job="${j}"}`, JC[j], { op, fill: j === 'api' ? ACCBG : INFOBG });
      mono(accX[j] + 12, y + 6, j === 'api' ? '355' : '140', { 'font-size': 20, 'font-weight': 800, fill: JC[j], opacity: op });
      if (k === 2) mono(accX[j] + 70, y + 6, j === 'api' ? '= 120 + 95 + 140' : '= 60 + 80', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); });
    if (k === 2) mono(880, 340, '5개 → 2개', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 2.1) });
    if (k === 3) { snippet(480, 300, ['SELECT job, sum(value)', 'FROM   metrics', 'GROUP  BY job'], { op: fade(u, 0.3) });
      grow(300, 70, 560, 300, E(u, 0.9, 1.6), ACC, { dash: '5 4' });
      sub(250, 336, 'by(job) = GROUP BY job', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: ACC });
      sub(250, 362, 'sum = sum(value)', fade(u, 1.9), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k === 4) { ['region', 'instance'].forEach((s, i) => chip(560 + i * 130, 340, s, MUT, { gone: true, s: pop(u, 0.4 + i * 0.3) }));
      tx(120, 345, '결과 레이블 = job 하나뿐', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      sub(480, 395, '적지 않은 레이블은 예외 없이 접힌다', fade(u, 1.2), { 'font-size': 15 }); } }

  // ---------- 3. by vs without ----------
  function s3(t, c) { const { k, u } = c;
    zone(30, 30, 430, 360, null, { fill: SOFT, op: 1 }); zone(500, 30, 430, 360, null, { fill: SOFT, op: k >= 2 ? 1 : 0.35 });
    mono(50, 64, 'sum by (job)', { 'font-size': 18, 'font-weight': 800, fill: ACC });
    tx(440, 64, '남길 것을 적는다', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    // 왼쪽: 칩 화이트리스트
    [['job', true], ['region', false], ['instance', false]].forEach(([s, keep], i) => chip(100 + i * 120, 110, s, keep ? ACC : MUT, { gone: !keep && (k > 0 || u > 0.9), s: k === 0 ? pop(u, 0.2 + i * 0.25) : 1, fill: keep ? ACCBG : null }));
    if (k >= 1) [['{job="api"}', 355], ['{job="web"}', 140]].forEach(([s, v], i) => { const y = 180 + i * 56, g = k === 1 ? E(u, 0.3 + i * 0.4, 1.2 + i * 0.4) : 1;
      mono(50, y + 5, s, { 'font-size': 15, 'font-weight': 700, fill: i ? INFO : ACC, opacity: g > 0 ? 1 : 0 });
      bar(190, y, v, i ? INFO : ACC, { g: g * 0.62, text: String(v), lop: g }); });
    if (k >= 1 && k < 4) mono(440, 370, '2개', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 1.6) : 1 });
    // 오른쪽
    if (k >= 2) { mono(520, 64, 'sum without (instance)', { 'font-size': 18, 'font-weight': 800, fill: WARN });
      tx(910, 64, '버릴 것만 적는다', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      [['job', true], ['region', true], ['instance', false]].forEach(([s, keep], i) => chip(570 + i * 120, 110, s, keep ? WARN : MUT, { gone: !keep && (k > 2 || u > 0.9), s: k === 2 ? pop(u, 0.2 + i * 0.25) : 1 })); }
    if (k >= 3) [['api', 'us', 215], ['api', 'eu', 140], ['web', 'us', 60], ['web', 'eu', 80]].forEach(([j, r, v], i) => { const y = 168 + i * 46, g = k === 3 ? E(u, 0.3 + i * 0.3, 1.0 + i * 0.3) : 1;
      mono(520, y + 5, `${j}·${r}`, { 'font-size': 15, 'font-weight': 700, fill: JC[j], opacity: g > 0 ? 1 : 0 });
      bar(600, y, v, JC[j], { g: g * 0.62, text: v === 215 ? '215 = 120+95' : String(v), lop: g }); });
    if (k === 3) mono(910, 370, '4개', { 'font-size': 22, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: k === 3 ? fade(u, 1.8) : 1 });
    if (k === 2) tx(715, 200, 'job · region은 그대로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
    if (k === 4) { card(245, 360, 380, 50, { rx: 10, stroke: ACC, fill: PANEL, text: '보고 싶은 차원이 몇 개뿐 → by', fs: 15, color: ACC, s: pop(u, 0.3) });
      card(715, 360, 380, 50, { rx: 10, stroke: WARN, fill: PANEL, text: 'instance 하나만 접고 싶다 → without', fs: 15, color: WARN, s: pop(u, 0.8) }); } }

  // ---------- 4. 연산자 바꿔 끼우기 ----------
  const API = SER.slice(0, 3);
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { const base = 330, sc = 1.35, xs = [140, 230, 320];
      el('line', { x1: 90, y1: base, x2: 380, y2: base, stroke: MUT, 'stroke-width': 1.8 });
      API.forEach((r, i) => { const g = k === 0 ? E(u, 0.2 + i * 0.3, 0.9 + i * 0.3) : 1, h = r.v * sc * g;
        const hi = (k === 2 && ((i === 2 && u > 0.3) || (i === 1 && u > 0.9)));
        el('rect', { x: xs[i] - 30, y: base - h, width: 60, height: h, rx: 4, fill: hi ? (i === 2 ? BAD : INFO) : ACC, opacity: 0.85 });
        mono(xs[i], base - h - 10, String(r.v), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: g > 0.5 ? 1 : 0 });
        mono(xs[i], base + 22, `.${r.inst.split('.')[3]}`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
        if (k === 2) { const s = pop(u, 1.6 + i * 0.2); el('circle', { cx: xs[i], cy: base + 50, r: 14 * s, fill: INK }); mono(xs[i], base + 55, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: s > 0.6 ? 1 : 0 }); } });
      tx(90, 70, 'api 그룹 시계열 3개', { 'font-size': 16, 'font-weight': 700 });
      if (k === 1) { const a = E(u, 1.0, 1.6), y = base - 118.33 * sc; el('line', { x1: 100, y1: y, x2: lerp(100, 380, a), y2: y, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }); }
      const ops = k === 0 ? [] : k === 1 ? [['sum', '355', '전체 처리량', ACC], ['avg', '118.3', '한 대 평균', WARN]] : [['max', '140', '가장 바쁜 한 대', BAD], ['min', '95', '가장 한가한 한 대', INFO], ['count', '3', '시계열 수 = 대수', INK]];
      ops.forEach(([op, v, d, col], i) => { const y = 120 + i * 82, s = pop(u, 0.4 + i * 0.4);
        card(680, y, 420, 64, { rx: 10, stroke: col, sw: 2, s });
        mono(500, y + 7, op, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.4) });
        mono(640, y + 8, v, { 'font-size': 24, 'font-weight': 800, opacity: fade(u, 0.6 + i * 0.4) });
        tx(870, y + 6, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.4) }); });
      if (k === 0) tx(680, 210, '같은 그룹, 앞의 연산자만 바꿔 본다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.4) });
      return; }
    if (k === 3) { mono(60, 56, 'topk(3, rate(http_requests_total[5m]))', { 'font-size': 17, 'font-weight': 700 });
      const sorted = SER.slice().sort((a, b) => b.v - a.v), m = E(u, 0.2, 1.0);
      sorted.forEach((r, i) => { const i0 = SER.indexOf(r), y = lerp(RY(i0), RY(i), m), cut = i >= 3, op = cut ? lerp(1, 0.25, E(u, 1.4, 2.0)) : 1;
        rawRow(r, y, { op, bar: true }); });
      el('line', { x1: 50, y1: (RY(2) + RY(3)) / 2, x2: 910, y2: (RY(2) + RY(3)) / 2, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', opacity: fade(u, 1.2) });
      tx(905, RY(2) + 22, '여기서 자른다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      sub(480, 398, '값을 합치지 않고, 레이블도 그대로 둔 채 큰 순 3개만 남긴다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k4: count by (job) (up == 1) < 2  (예시 상황)
    mono(60, 56, 'count by (job) (up == 1) < 2', { 'font-size': 17, 'font-weight': 700 });
    const down = [false, u > 1.0, u > 1.6];
    API.forEach((r, i) => { const cx = 200 + i * 200; server(cx, 170, `api .${r.inst.split('.')[3]}`, { lamp: down[i] ? BAD : GOOD, stroke: down[i] ? BAD : INK });
      mono(cx, 262, down[i] ? 'up = 0' : 'up = 1', { 'font-size': 15, 'font-weight': 700, fill: down[i] ? BAD : GOOD, 'text-anchor': 'middle' }); });
    const cnt = down.filter((d) => !d).length;
    mono(800, 160, `count = ${cnt}`, { 'font-size': 24, 'font-weight': 800, fill: cnt < 2 ? BAD : INK, 'text-anchor': 'middle' });
    if (cnt < 2) banner(480, 340, '살아 있는 api 1대 < 2 → 경보 (예시)', pop(u, 1.7));
    else sub(480, 340, '2대 미만이면 경보를 울리게 걸어 둔다', fade(u, 0.3), { 'font-size': 15 }); }

  // ---------- 5. 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 56, 'sum(rate(http_requests_total[5m]))', { 'font-size': 17, 'font-weight': 700 });
      const m = E(u, 0.3, 1.5), sc2 = 520 / 495; let acc = 220;
      SER.forEach((r, i) => { const y = lerp(RY(i), 220, m), x0 = lerp(BX + 40, acc, m), w = lerp(r.v * SC, r.v * sc2, m);
        el('rect', { x: x0, y: y - 15, width: w, height: 30, rx: 4, fill: JC[r.job], opacity: lerp(0.85, 0.4, E(u, 1.6, 2.2)), stroke: PANEL, 'stroke-width': 2 }); acc += r.v * sc2; });
      chip(130, 220, '{ }', MUT, { op: fade(u, 1.5) }); mono(750, 226, '495', { 'font-size': 24, 'font-weight': 800, opacity: fade(u, 1.6) });
      tx(480, 320, 'job 구분이 사라져 api와 web이 한 줄로 뭉친다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { mono(60, 56, 'sum by (user_id) (rate(http_requests_total[5m]))', { 'font-size': 17, 'font-weight': 700, fill: BAD });
      const n = Math.floor(lerp(2, 360, E(u, 0.3, 2.2) ** 2));
      for (let i = 0; i < n; i++) { const col = i % 30, rw = Math.floor(i / 30); el('rect', { x: 120 + col * 24, y: 90 + rw * 22, width: 18, height: 16, rx: 3, fill: BAD, opacity: 0.25 + 0.5 * ((i * 37) % 7) / 7 }); }
      tx(480, 380, 'user_id 값 하나마다 결과 시계열 하나 → 수만 개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    // k2, k3: 평균의 평균 (예시 숫자)
    const ax = R.axes(120, 250, 720, 0.1, { x: [0, 2], xt: [0, 0.5, 1, 1.5, 2], xl: '평균 지연(초)' });
    [['인스턴스 A', 1000, 0.1, '1,000건 · 평균 0.1초'], ['인스턴스 B', 10, 2.0, '10건 · 평균 2.0초']].forEach(([n, cnt, avg, d], i) => { const y = 90 + i * 70, s = k === 2 ? pop(u, 0.2 + i * 0.3) : 1;
      tx(120, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 });
      el('rect', { x: 230, y: y - 12, width: Math.max(4, cnt / 1000 * 300) * s, height: 24, rx: 4, fill: INFO, opacity: 0.8 });
      tx(560, y + 5, d, { 'font-size': 15, fill: MUT, opacity: s > 0.5 ? 1 : 0 });
      el('circle', { cx: ax.X(avg), cy: 250, r: 7 * s, fill: INFO }); });
    sub(380, 50, '막대 = 요청 수 (예시 숫자)', 1, { 'font-size': 14 });
    const wrong = 1.05, right = 0.119;
    if (k === 2) { const s = pop(u, 1.2); el('path', { d: `M${ax.X(wrong)},244 l-9,-16 h18 z`, fill: BAD, opacity: s });
      mono(ax.X(wrong), 300, 'avg(평균) = 1.05초', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(480, 360, '10건짜리 B가 1,000건짜리 A와 같은 무게로 들어간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    const x = lerp(ax.X(wrong), ax.X(right), E(u, 0.8, 1.8));
    el('path', { d: `M${x},244 l-9,-16 h18 z`, fill: GOOD });
    mono(560, 300, 'sum(latency_sum) / sum(latency_count)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    mono(560, 330, '(100 + 20)초 / 1,010건 = 0.119초', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    tx(480, 380, '합을 합으로 나누면 요청 수만큼 자연히 가중된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'api 3대와 web 2대가 http_requests_total을 노출할 때, 집계 없이 rate를 걸면 시계열이 몇 개 나오는가?',
      o: ['2개', '5개', '1개'], a: 1,
      why: 'Prometheus는 target마다 따로 저장한다. instance 레이블이 달라 api 3개와 web 2개, 모두 5개의 시계열이 그대로 나온다.' },
    { q: 'sum by (job)을 걸었을 때 결과에 남는 레이블은 무엇인가?',
      o: ['job, region, instance 모두', 'region과 instance', 'job 하나'], a: 2,
      why: 'by에 적은 레이블만 남고 나머지는 접힌다. 그래서 api는 120+95+140 = 355, web은 60+80 = 140인 두 줄이 된다.' },
    { q: 'sum without (instance)의 결과가 4줄인 이유는 무엇인가?',
      o: ['instance만 버리고 job과 region 조합이 남아서', 'by(job)과 똑같이 job만 남아서', 'region도 함께 버려져서'], a: 0,
      why: 'without은 적은 레이블만 버린다. job×region 조합 4개가 남고, api·us는 120+95 = 215로 합쳐진다.' },
    { q: 'api 그룹 값 120·95·140에서 count by (job)이 돌려주는 값은 무엇인가?',
      o: ['355', '3', '118.3'], a: 1,
      why: 'count는 값을 더하지 않고 그룹 안 시계열 수를 센다. 살아 있는 인스턴스 수를 볼 때 쓴다.' },
    { q: '인스턴스마다 이미 평균 지연이 있을 때 서비스 평균을 바르게 구하는 식은 무엇인가?',
      o: ['avg by (job) (request_latency_avg)', 'max by (job) (request_latency_avg)', 'sum by (job) (rate(latency_sum[5m])) / sum by (job) (rate(latency_count[5m]))'], a: 2,
      why: '평균을 다시 평균 내면 요청이 적은 인스턴스가 과하게 반영된다. 합을 합으로 나누면 요청 수만큼 가중된다.' },
  ];

  const summary = [
    'Prometheus는 target마다 시계열을 따로 둬서 api 3대와 web 2대면 5줄이 나온다.',
    'sum by (job)은 job만 남기고 접어 api 355, web 140 두 줄로 만든다.',
    'without은 적은 레이블만 버리므로 without (instance)는 job과 region 조합 4줄을 남긴다.',
    '평균을 다시 평균 내지 말고 합을 합으로 나눠 요청 수만큼 가중한다.',
  ];
  const review = [
    { q: '대시보드에 sum(rate(http_requests_total[5m]))를 올렸더니 api와 web을 구분할 수 없다. 먼저 고칠 것은?',
      o: ['rate 창을 [1m]로 줄인다', 'sum by (job)으로 job을 남긴다', 'topk(2, ...)로 바꾼다'], a: 1,
      why: 'by나 without이 없으면 모든 시계열이 495 한 줄로 뭉친다. by (job)을 적어야 job별 두 줄이 남는다.' },
    { q: '레이블이 많은 메트릭에서 instance만 접고 region 구분은 그대로 보고 싶다. 알맞은 식은?',
      o: ['sum without (instance) (...)', 'sum by (instance) (...)', 'count by (job) (...)'], a: 0,
      why: 'without은 적은 레이블만 버리고 나머지를 둔다. by (instance)는 거꾸로 instance만 남긴다.' },
    { q: 'sum by (user_id)로 바꾼 뒤 Prometheus 쿼리가 눈에 띄게 느려졌다. 먼저 의심할 것은?',
      o: ['avg 대신 sum을 써서', 'rate 창이 너무 넓어서', 'user_id 값 수만큼 결과 시계열이 늘어나서'], a: 2,
      why: '그룹 레이블의 값 종류가 곧 결과 시계열 수다. 값이 수만 개인 레이블로 묶으면 결과도 수만 개가 된다.' },
  ];

  R.page({ title: '레이블을 접어 합치기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
