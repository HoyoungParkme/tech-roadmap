/* V-2-2 모델 모니터링 — 드리프트·재학습 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  const rect = (x, y, w, h, a) => el('rect', Object.assign({ x, y, width: Math.max(0, w), height: Math.max(0, h), rx: 4 }, a || {}));
  const clean = (s) => String(s).replace(/\s*[\u{1F300}-\u{1FAFF}☀-➿]️?/gu, '').trim();   // 그림 글자 빼기
  // 종 모양 분포 곡선 (값 없이 모양만): 중심 mu(0~1), 폭 sd, 높이 h
  function bell(x0, y0, w, h, mu, sd, col, o) { o = o || {}; const pts = [];
    for (let i = 0; i <= 48; i++) { const t = i / 48, v = Math.exp(-0.5 * Math.pow((t - mu) / sd, 2)); pts.push(`${x0 + t * w},${y0 - v * h * (o.u ?? 1)}`); }
    el('path', { d: `M${x0},${y0} L${pts.join(' L')} L${x0 + w},${y0} Z`, fill: col, opacity: (o.op ?? 1) * (o.fillOp ?? 0.18), stroke: 'none' });
    el('polyline', { points: pts.join(' '), fill: 'none', stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }

  // =========================================================
  // 1. 조용한 성능 저하 — 월별 정확도 + 30일 늦게 오는 라벨
  // =========================================================
  const MX = (m) => 90 + (m - 0.5) * 60, AY = (v) => 300 - ((v - 65) / 25) * 220;     // 월 1~7, 정확도 65~90
  function perfChart(c, u) { const tl = c.beat.timeline || [], pn = c.prev ? (c.prev.timeline || []).length : 0;
    el('line', { x1: 90, y1: 300, x2: 510, y2: 300, stroke: MUT, 'stroke-width': 1.8 }); el('line', { x1: 90, y1: 70, x2: 90, y2: 300, stroke: MUT, 'stroke-width': 1.8 });
    [70, 80, 90].forEach((v) => { el('line', { x1: 90, y1: AY(v), x2: 510, y2: AY(v), stroke: GRID, 'stroke-dasharray': '3 4' }); mono(82, AY(v) + 5, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    for (let m = 1; m <= 7; m++) tx(MX(m), 322, `${m}월`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 });
    tx(90, 56, '월별 정확도(%) — 라벨 확정분만', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
    const pts = tl.map((r, i) => [MX(i + 1), AY(r.acc)]), from = Math.max(1, pn), g = tl.length > pn ? E(u, 0.3, 1.6) : 1;
    const shown = tl.length > pn && pn > 0 ? lerp(pn - 1, tl.length - 1, g) : tl.length - 1;
    if (pts.length > 1 && shown > 0) { const i = Math.floor(shown), f = shown - i, ps = pts.slice(0, i + 1); if (i < pts.length - 1) ps.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]);
      el('polyline', { points: ps.map((p) => p.join(',')).join(' '), fill: 'none', stroke: BAD, 'stroke-width': 2.8, 'stroke-linejoin': 'round' }); }
    tl.forEach((r, i) => { const a = i < pn || pn === 0 && i === 0 ? (pn === 0 ? pop(u, 0.4) : 1) : clamp((shown - i + 1) * 1.5 - 0.5);
      if (a <= 0) return; el('circle', { cx: pts[i][0], cy: pts[i][1], r: 6 * a, fill: i === 0 ? GOOD : BAD });
      mono(pts[i][0], pts[i][1] - 13, String(r.acc), { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: a, fill: i === 0 ? GOOD : INK }); });
    return pts; }
  function s1(t, c) { const { k, u } = c, tl = c.beat.timeline || [];
    if (k === 5) el('rect', { x: MX(6), y: 70, width: MX(7) - MX(6) + 20, height: 230, fill: C.WARNBG, opacity: 0.7 * fade(u, 1.2) });
    const pts = perfChart(c, u);
    pill(MX(1) + 20, 352, '배포', GOOD, k === 0 ? pop(u, 0.6) : 1, { fs: 14 });
    if (k === 0) { // 1월 예측 → 30일 뒤 라벨 도착
      const g = E(u, 0.9, 1.9), x1 = MX(1), x2 = MX(2), mid = (x1 + x2) / 2;
      el('path', { d: `M${x1},300 Q${mid},${300 - 90} ${lerp(x1, x2, g)},${300 - 90 * 4 * g * (1 - g) * (g < 1 ? 1 : 0)}`, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: g > 0 ? 1 : 0 });
      tx(mid + 18, 230, '라벨 +30일', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      clock(730, 170, 70, E(u, 0.4, 2.0), WARN, null);
      mono(730, 280, 'LABEL_DELAY_DAYS = 30', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) });
      tx(730, 318, '오늘의 정확도는 오늘 알 수 없다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
    if (k >= 1 && k <= 3) { // pred_log 표
      const x0 = 560, y0 = 60, cols = ['user_id', 'pred_date', 'churn_prob', 'actual_churn'], cw = [80, 92, 100, 108];
      mono(x0, y0 - 8, 'pred_log', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.2) : 1 });
      let cx = x0; cols.forEach((h, j) => { mono(cx + 4, y0 + 18, h, { 'font-size': 13.5, 'font-weight': 700, fill: j === 3 ? WARN : MUT, opacity: k === 1 ? fade(u, 0.3 + j * 0.15) : 1 }); cx += cw[j]; });
      const drop = k >= 2 ? E(k === 2 ? u : 3, 0.4, 1.2) : 0, MONTH = ['1월', '1월', '2월', '2월', '6월', '6월'];
      for (let i = 0; i < 6; i++) { const nan = i >= 4, a = (k === 1 ? fade(u, 0.6 + i * 0.12) : 1) * (nan ? (k === 2 ? 1 - drop * 0.7 : k >= 3 ? 0 : 1) : 1), y = y0 + 32 + i * 34;
        let xx = x0; cw.forEach((w, j) => { if (j === 3 && nan) mono(xx + 4, y + 18, 'NaN', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: a });
          else if (j === 1 && k >= 2 && !nan) mono(xx + 4, y + 18, MONTH[i], { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: a * fade(k === 2 ? u : 3, 1.3) });
          else rect(xx + 4, y + 6, w - 14, 16, { rx: 3, fill: j === 3 ? C.GOODBG : SOFT, stroke: GRID, opacity: a }); xx += w; });
        if (nan && drop > 0 && k === 2) el('line', { x1: x0, y1: y + 14, x2: x0 + 370, y2: y + 14, stroke: OFF, 'stroke-width': 2, opacity: drop }); }
      if (k === 1) tx(x0, 300, 'actual_churn 은 30일 뒤 배치가 채운다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
      if (k === 2) { mono(x0, 300, 'dropna(actual_churn) → groupby(month)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
        tx(x0, 330, '최근 30일 예측은 아직 채점 대상이 아니다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); }
      if (k === 3) { const ry = 300; el('rect', { x: x0 - 6, y: ry - 22, width: 390, height: 70, rx: 8, fill: ACCBG, opacity: fade(u, 0.4) });
        ['month', 'n', 'accuracy', 'auc'].forEach((h, j) => mono(x0 + [4, 110, 180, 290][j], ry, h, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4) }));
        ['2026-01', '9.2k', '0.84', '0.88'].forEach((v, j) => mono(x0 + [4, 110, 180, 290][j], ry + 30, v, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.8 + j * 0.25) }));
        tx(x0, 396, 'churn_prob ≥ 0.5 → 이탈 예측 → accuracy', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); } }
    if (k >= 4) { const ev = tl.filter((r) => r.event && !/배포/.test(r.event));
      tx(580, 70, '그 사이 세상에 생긴 일', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      ev.forEach((r, i) => { const pn = c.prev ? (c.prev.timeline || []).filter((x) => x.event && !/배포/.test(x.event)).length : 0, a = i < pn ? 1 : pop(u, 0.6 + (i - pn) * 0.4);
        card(745, 104 + i * 46, 330, 38, { rx: 8, stroke: i === 3 ? BAD : GRID, text: `${r.label} · ${clean(r.event)} · ${r.acc}%`, fs: 15, fw: 600, color: i === 3 ? BAD : INK, s: a }); });
      if (k === 4) tx(580, 330, '서버 지표는 전부 정상 — 코드는 그대로', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 5) { const x6 = MX(6), x7 = MX(7);
      el('line', { x1: x7, y1: 70, x2: x7, y2: 300, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.2) });
      tx(x7, 64, '오늘', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(580, 330, '6월 0.71 은 7월에야 보인다 — 한 달 늦은 발견', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      tx(580, 362, '라벨 없이 먼저 알아챌 방법이 필요하다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); } }

  // =========================================================
  // 2. 데이터 드리프트 — age 히스토그램 · PSI 게이지 · 피처 스캔
  // =========================================================
  const HX = 70, HB = 320, HW = 66;     // 막대 묶음 폭
  const HY = (v) => (v / 40) * 220;
  function hist(c, u) { const h = c.beat.histogram, bins = h.bins, pn = c.prev ? c.prev.histogram.bins.length : 0, k = c.k;
    el('line', { x1: HX - 10, y1: HB, x2: HX + 6 * HW + 6, y2: HB, stroke: MUT, 'stroke-width': 1.8 });
    tx(HX - 10, 44, 'age 연령대별 (%)', { 'font-size': 15, 'font-weight': 800 });
    rect(HX + 120, 32, 14, 14, { fill: INFO }); tx(HX + 140, 44, '학습 시점', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
    rect(HX + 230, 32, 14, 14, { fill: WARN }); tx(HX + 250, 44, '최근 7일', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
    bins.forEach((b, i) => { const g = i < pn ? 1 : E(u, 0.3 + (i - pn) * 0.3, 0.8 + (i - pn) * 0.3), x = HX + i * HW, hot = b.label === '20대' && k >= 2;
      if (hot) rect(x - 2, HB - HY(b.now) - 30, HW - 6, HY(b.now) + 30, { fill: C.WARNBG, opacity: fade(k === 2 ? u : 3, 1.0) });
      rect(x + 4, HB - HY(b.train) * g, 26, HY(b.train) * g, { fill: INFO, opacity: 0.85 });
      rect(x + 32, HB - HY(b.now) * g, 26, HY(b.now) * g, { fill: WARN, opacity: 0.9 });
      if (g > 0.6) { mono(x + 17, HB - HY(b.train) - 6, String(b.train), { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
        mono(x + 45, HB - HY(b.now) - 6, String(b.now), { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' }); }
      tx(x + 31, HB + 20, b.label, { 'font-size': 14, 'font-weight': 600, 'text-anchor': 'middle', fill: MUT, opacity: g > 0 ? 1 : 0 }); });
    if (k >= 2) { // 학습 분포의 10분위 경계(구간 안은 고르게 퍼졌다고 보고 누적 비율로 위치를 잡는다) — 이 경계로 PSI 를 잰다
      const a = k === 2 ? 1 : 0.6, cum = [0]; bins.forEach((b) => cum.push(cum[cum.length - 1] + b.train));
      for (let q = 10; q < 100; q += 10) { const i = cum.findIndex((v, j) => j > 0 && v >= q) - 1, age = i + (q - cum[i]) / bins[i].train, x = HX - 3 + age * HW, g = k === 2 ? E(u, 0.3 + q * 0.008, 0.6 + q * 0.008) : 1;
        el('line', { x1: x, y1: 66, x2: x, y2: 66 + 18 * g, stroke: INK, 'stroke-width': 2, opacity: a }); }
      el('line', { x1: HX - 3, y1: 75, x2: HX - 3 + 6 * HW, y2: 75, stroke: INK, 'stroke-width': 1.2, opacity: a * 0.6 });
      tx(HX - 10, HB + 48, '위 눈금 = 학습 분포 10분위 경계 (PSI 구간, 고정)', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: k === 2 ? fade(u, 1.2) : a }); } }
  const GX = (v) => 560 + (v / 0.5) * 360;
  function gauge(c, u) { const p = c.beat.psi, pp = c.prev ? c.prev.psi.value : p.value, k = c.k, v = tween(pp, p.value, u, 1.2), on = v >= 0.25;
    tx(560, 44, 'age 피처 PSI', { 'font-size': 15, 'font-weight': 800 });
    [[0, 0.1, GOOD, '안정'], [0.1, 0.25, WARN, '주의'], [0.25, 0.5, BAD, '드리프트']].forEach(([a, b, col, s]) => { rect(GX(a), 60, GX(b) - GX(a), 22, { rx: 0, fill: col, opacity: 0.25 }); tx((GX(a) + GX(b)) / 2, 76, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }); });
    [0, 0.1, 0.25, 0.5].forEach((t) => mono(GX(t), 100, String(t), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    if (p.value > 0 || pp > 0) { el('path', { d: `M${GX(v)},56 l-8,-12 h16 Z`, fill: on ? BAD : INK });
      mono(920, 44, v.toFixed(2), { 'font-size': 18, 'font-weight': 800, fill: on ? BAD : INK, 'text-anchor': 'end' }); }
    else mono(920, 44, '실행 전', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); }
  const SCAN = [['age', '0.35', '6.4e-108', 'ALERT', BAD], ['monthly_visits', '0.18', '1.1e-02', 'WARN', WARN], ['plan_price', '0.07', '2.1e-01', 'OK', GOOD]];
  function s2(t, c) { const { k, u } = c;
    hist(c, u); gauge(c, u);
    if (k === 0) { mono(560, 170, 'PSI = Σ (now% − train%)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5) });
      mono(560, 198, '      × ln(now% / train%)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8) });
      tx(560, 250, '라벨이 필요 없다 — 입력만 본다', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      tx(560, 280, '실무 관례: 0.10 / 0.25 경계', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 1 || k === 2 || k === 3) { mono(560, 160, 'psi(train, now, bins=10)', { 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.4) : 1 });
      pill(640, 205, 'ks_2samp', INFO, k === 1 ? pop(u, 1.1) : 1, { mono: true, fs: 14.5 });
      tx(712, 210, '분포가 같은가 검정', { 'font-size': 14.5, fill: MUT, opacity: k === 1 ? fade(u, 1.3) : 1 }); }
    if (k === 2) tx(560, 260, '20대: 14% → 38%', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
    if (k === 3) { mono(560, 260, '0% 구간 → 1e-6 (log 0 방지)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3) });
      mono(560, 296, '학습 10분위 구간 합 → 0.35', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(560, 324, '(그림의 연령대 6구간으로 합하면 0.37)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) });
      pill(740, 350, 'PSI 0.35 ≥ 0.25 → 드리프트 확정', BAD, pop(u, 1.6), { fs: 15 }); }
    if (k >= 4) { const x0 = 560, y0 = 150;
      ['feature', 'psi', 'ks_pvalue', 'status'].forEach((h, j) => mono(x0 + [0, 140, 200, 300][j], y0, h, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }));
      SCAN.forEach(([f, p, ks, st, col], i) => { const y = y0 + 40 + i * 44, a = k === 4 ? fade(u, 0.4 + i * 0.4) : 1, hot = k === 6 && i === 0;
        if (hot) rect(x0 - 8, y - 26, 384, 40, { rx: 8, fill: C.BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.3) });
        mono(x0, y, f, { 'font-size': 14.5, 'font-weight': 700, opacity: a });
        mono(x0 + 140, y, p, { 'font-size': 14.5, 'font-weight': 800, opacity: a * (k === 4 ? fade(u, 0.7 + i * 0.4) : 1) });
        mono(x0 + 200, y, ks, { 'font-size': 14.5, opacity: a * (k === 4 ? fade(u, 1.0 + i * 0.4) : 1) });
        if (k >= 5) pill(x0 + 334, y - 5, st, col, k === 5 ? pop(u, 0.4 + i * 0.35) : 1, { mono: true, fs: 13.5 }); });
      if (k === 4) tx(x0, 340, '매일 배치 · 피처마다 PSI + KS', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      if (k >= 4) tx(x0, 396, '학습 10,000건 · 최근 7일 2,000건 기준', { 'font-size': 13.5, fill: MUT, opacity: k === 4 ? fade(u, 2.2) : 1 });
      if (k === 5) { tx(x0, 340, '≥ 0.25 ALERT · ≥ 0.10 WARN · 나머지 OK', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
        tx(x0, 368, 'PSI 큰 순 정렬 → 맨 윗줄이 오늘 가장 변한 것', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); }
      if (k === 6) { tx(x0, 340, '원인: 20대 유입으로 age 분포 이동', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
        tx(x0, 370, '라벨(성능 하락)보다 한 달 먼저 울리는 경보', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); } } }

  // =========================================================
  // 3. 컨셉 드리프트 — 입력은 그대로, 예측 분포 이동, 옛 관계 붕괴
  // =========================================================
  function s3(t, c) { const { k, u } = c, cc = c.beat.conceptCompare.rows, pcc = c.prev ? c.prev.conceptCompare.rows.length : 0, mat = c.beat.driftMatrix.rows;
    // (A) 입력 분포: 학습 vs 최근 — 겹친다
    const aOp = k === 0 ? fade(u, 0.2) : 1;
    tx(40, 40, '입력 X 분포', { 'font-size': 15, 'font-weight': 800, opacity: aOp });
    bell(40, 170, 400, 100, 0.45, 0.16, INFO, { op: aOp }); bell(40, 170, 400, 100, 0.46, 0.165, WARN, { op: aOp * (k === 0 ? fade(u, 0.7) : 1), dash: '6 4', fillOp: 0 });
    el('line', { x1: 40, y1: 170, x2: 440, y2: 170, stroke: MUT, 'stroke-width': 1.5, opacity: aOp });
    pill(380, 46, '입력 PSI 전부 OK', GOOD, k === 0 ? pop(u, 1.0) : 1, { fs: 14 });
    // (B) 예측 확률 분포
    const bOn = k >= 1, bOp = k === 1 ? fade(u, 0.2) : bOn ? 1 : 0, shift = k >= 5 ? E(k === 5 ? u : 3, 0.4, 1.4) : 0;
    if (!bOn) { tx(240, 270, '컨셉 드리프트는 정답(라벨)이 있어야 보인다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(240, 300, '→ 프록시 + 지연 백테스트로 우회', { 'font-size': 15, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (bOn) { tx(40, 214, '예측 확률 분포 (프록시 1 · 라벨 불필요)', { 'font-size': 15, 'font-weight': 800, opacity: bOp });
      bell(40, 330, 400, 90, 0.42, 0.14, INFO, { op: bOp });
      bell(40, 330, 400, 90, 0.42 - 0.12 * shift, 0.14, WARN, { op: bOp * (k >= 2 ? 1 : fade(u, 1.0)), dash: '6 4', fillOp: k >= 5 ? 0.18 : 0 });
      el('line', { x1: 40, y1: 330, x2: 440, y2: 330, stroke: MUT, 'stroke-width': 1.5, opacity: bOp });
      mono(40, 350, '0', { 'font-size': 13.5, fill: MUT, opacity: bOp }); mono(440, 350, '1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: bOp });
      if (k >= 2) { const ma = 40 + 0.42 * 400, mb = 40 + (0.42 - 0.12 * shift) * 400, a = k === 2 ? fade(u, 0.5) : 1;
        el('line', { x1: ma, y1: 236, x2: ma, y2: 330, stroke: INFO, 'stroke-width': 2, opacity: a });
        el('line', { x1: mb, y1: 236, x2: mb, y2: 330, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: a });
        const done = k >= 5, v1 = done ? tween(0, 0.27, k === 5 ? u : 3).toFixed(2) : '?', v2 = done ? '−' + tween(0, 0.12, k === 5 ? u : 3).toFixed(2) : '?';
        R.spans(40, 386, [['pred_psi = ', { fill: MUT }], [v1, { fill: done ? BAD : MUT, 'font-weight': 800 }], ['   mean_shift = ', { fill: MUT }], [v2, { fill: done ? BAD : MUT, 'font-weight': 800 }]], { 'font-size': 15.5, opacity: a }); } }
    // (C) 오른쪽 위: 같은 행동, 달라진 의미 — 월 방문 3회 이하 유저의 실제 이탈률
    tx(490, 40, '"월 방문 3회 이하" 유저의 실제 이탈률', { 'font-size': 15, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.4) : 1 });
    cc.forEach((r, i) => { const y = 66 + i * 52, g = i < pcc ? 1 : E(u, 0.5, 1.4), col = i === 0 ? INFO : WARN;
      tx(490, y + 14, r.era, { 'font-size': 14, 'font-weight': 600, fill: MUT, opacity: g > 0 ? 1 : 0 });
      rect(700, y, 180 * (r.rate / 70) * g, 22, { fill: col, opacity: 0.85 });
      mono(706 + 180 * (r.rate / 70) * g, y + 17, `${Math.round(r.rate * g)}%`, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: g > 0 ? 1 : 0 }); });
    if (k === 3) tx(490, 196, '같은 행동, 달라진 의미 → X→y 관계가 변했다', { 'font-size': 15.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
    if (k === 6) { tx(490, 196, '"방문 적음 = 이탈" 신호가 죽었다', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) }); cross(902, 186, 9, pop(u, 0.5)); }
    // (D) 오른쪽 아래: 지연 백테스트 → 두 드리프트 구분 표
    if (k === 3) { tx(490, 250, 'delayed_backtest()', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.9) });
      tx(490, 280, '라벨 도착분으로 옛 신호를 주 단위로 다시 채점', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3) }); }
    if (k === 4) { const x0 = 490, y0 = 240;
      ['week', 'auc', 'low_visit_churn'].forEach((h, j) => mono(x0 + [0, 90, 180][j], y0, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) }));
      [['W22', '0.79', '0.41'], ['W26', '0.72', '0.24']].forEach((r, i) => r.forEach((v, j) => mono(x0 + [0, 90, 180][j], y0 + 36 + i * 34, v, { 'font-size': 16, 'font-weight': 800, fill: j === 2 && i === 1 ? BAD : INK, opacity: fade(u, 0.6 + i * 0.6 + j * 0.1) })));
      grow(x0 + 250, y0 + 30, x0 + 250, y0 + 64, E(u, 1.6, 2.0), BAD); tx(x0 + 270, y0 + 52, '신호가 약해진다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }
    if (k >= 5) { tx(490, 238, '두 드리프트 — 진단이 다르면 처방이 다르다', { 'font-size': 14.5, 'font-weight': 800, opacity: k === 5 ? fade(u, 1.2) : 1 });
      mat.forEach((m, i) => { const y = 252 + i * 80, a = k === 5 && i === 1 ? pop(u, 1.6) : k === 5 ? pop(u, 1.2) : 1, col = i ? WARN : INFO, op = k === 5 && i === 1 ? fade(u, 1.6) : k === 5 ? fade(u, 1.2) : 1;
        card(715, y + 34, 450, 72, { rx: 10, stroke: col, s: a });
        tx(500, y + 20, `${m.kind} · ${m.rel}`, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: op });
        tx(500, y + 41, `탐지: ${m.detect}`, { 'font-size': 13.5, opacity: op }); tx(500, y + 60, `처방: ${m.fix}`, { 'font-size': 13.5, 'font-weight': 700, opacity: op }); });
      if (k === 5) pill(225, 46, '컨셉 드리프트 의심', BAD, pop(u, 1.9), { fs: 14 }); }
    if (k === 6) R.spans(40, 412, [['W22 0.41 → W26 ', { fill: MUT }], ['0.24', { fill: BAD, 'font-weight': 800 }], ['  (저방문 이탈률)', { fill: MUT }]], { 'font-size': 15, opacity: fade(u, 0.8) }); }

  // =========================================================
  // 4. 재학습 — 트리거 · 6개월 윈도우 · 섀도 · 챔피언-챌린저
  // =========================================================
  const DX = (d) => 70 + (d / 17) * 830;
  function triggerLine(c, u) { const items = c.beat.triggerLog.items, pn = c.prev ? c.prev.triggerLog.items.length : 0, dd = (s) => +String(s).replace('D-', '');
    el('line', { x1: DX(0), y1: 44, x2: DX(17), y2: 44, stroke: GRID, 'stroke-width': 3 });
    [0, 1, 2, 16, 17].forEach((d) => mono(DX(d), 30, `D-${d}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    items.forEach((it, i) => { const a = i < pn ? 1 : pop(u, 0.2 + (i - pn) * 0.3), col = it.tone === 'alert' ? BAD : it.tone === 'win' ? GOOD : ACC;
      el('circle', { cx: DX(dd(it.t)) + (i === 1 ? 12 : 0), cy: 44, r: 7 * a, fill: col }); });
    const last = items[items.length - 1], col = last.tone === 'alert' ? BAD : last.tone === 'win' ? GOOD : ACC;
    tx(70, 80, `${last.t} · ${clean(last.msg)}`, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: items.length > pn ? fade(u, 0.4) : 1 }); }
  function model(cx, cy, name, col, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -95, y: -34, width: 190, height: 68, rx: 12, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    tx(0, -6, name, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: col }, g);
    if (o.sub) tx(0, 17, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); }
  function s4(t, c) { const { k, u } = c, bt = c.beat.battle;
    triggerLine(c, u);
    if (k === 0) { card(220, 230, 300, 120, { rx: 12, stroke: INFO, s: pop(u, 0.2) });
      mono(220, 205, 'drift_monitor', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(220, 240, 'scan_features', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); mono(220, 266, 'prediction_drift', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      grow(375, 230, 575, 230, E(u, 0.9, 1.5), ACC); tx(475, 218, 'import', { 'font-size': 14, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      card(740, 230, 300, 120, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 1.4) });
      mono(740, 222, 'retrain_pipeline', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(740, 252, '재학습은 탐지 신호로 시작한다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 1) [['PSI_ALERT', '0.25', '트리거 임계'], ['TRAIN_WINDOW_MONTHS', '6', '최근 6개월만 학습'], ['SHADOW_DAYS', '14', '섀도 대결 2주']].forEach(([n, v, d], i) => {
      const cx = 170 + i * 310, a = pop(u, 0.3 + i * 0.5); card(cx, 230, 280, 140, { rx: 12, stroke: ACC, s: a });
      mono(cx, 196, n, { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.5) });
      mono(cx, 244, v, { 'font-size': 32, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.5) });
      tx(cx, 280, d, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.5) }); });
    if (k === 2) { const VX = (v) => 210 + (v / 0.4) * 400;
      [['피처 PSI (age)', 0.35], ['예측분포 PSI', 0.27]].forEach(([n, v], i) => { const y = 150 + i * 60, g = E(u, 0.3 + i * 0.4, 0.9 + i * 0.4);
        tx(196, y + 15, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); rect(210, y, (VX(v) - 210) * g, 22, { fill: BAD, opacity: 0.85 });
        mono(VX(v) * g + 210 * (1 - g) + 8, y + 17, v.toFixed(2), { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: g }); });
      el('line', { x1: VX(0.25), y1: 136, x2: VX(0.25), y2: 236, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      mono(VX(0.25), 254, '0.25', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      card(770, 186, 150, 60, { rx: 12, stroke: GOOD, fill: C.GOODBG, text: 'OR → True', fs: 17, mono: true, color: GOOD, s: pop(u, 1.4) });
      tx(210, 320, '달력(매달 정기)이 아니라 신호가 방아쇠', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) });
      tx(210, 352, '정기 재학습은 조용한 달엔 낭비, 급변엔 늦다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 3) { // 데이터 월 블록 + 6개월 윈도우
      const n = 12, bx = (i) => 70 + i * 66;
      for (let i = 0; i < n; i++) { const old = i < 6; rect(bx(i), 150, 58, 44, { rx: 6, fill: old ? SOFT : ACCBG, stroke: old ? GRID : ACC, opacity: pop(u, 0.1 + i * 0.04) }); }
      tx(bx(0), 222, '팬데믹 전 — 죽은 관계', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.6) });
      const wx = lerp(bx(0), bx(6), E(u, 0.6, 1.4)) - 6;
      el('rect', { x: wx, y: 140, width: 6 * 66 + 4, height: 64, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 3 });
      tx(wx + 6 * 66 - 6, 132, '최근 6개월 윈도우', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      for (let i = 0; i < 3; i++) dot([[bx(9), 200], [bx(9), 290]], seg(u, 1.4 + i * 0.2, 1.9 + i * 0.2), ACC, 5);
      model(bx(9) + 29, 320, '챌린저', ACC, { sub: '최근 6개월로 학습', s: pop(u, 1.9) });
      model(220, 320, '챔피언', INK, { sub: '1월 학습 · 서비스 중' }); }
    if (k === 4) { // 섀도: 같은 트래픽, 챌린저는 기록만
      tx(70, 150, '실 트래픽', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 6; i++) { const p = (u * 0.55 + i / 6) % 1; dot([[110, 200], [300, 200], [430, 150]], p, INK, 5); dot([[110, 200], [300, 200], [430, 300]], (p + 0.08) % 1, ACC, 5); }
      model(530, 150, '챔피언', INK, { sub: '응답 → 사용자' });
      model(530, 300, '챌린저', ACC, { sub: '예측만 기록', dash: '6 4' });
      grow(625, 150, 760, 150, E(u, 0.4, 0.9), GOOD); tx(770, 156, '서비스 반영', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
      grow(625, 300, 760, 300, E(u, 0.8, 1.3), MUT, { dash: '5 4' }); tx(770, 306, '로그만', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.3) });
      tx(70, 390, '14일 뒤 지연 라벨이 도착하면 둘 다 AUC 로 채점', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 5) { const VX = (v) => 300 + ((v - 0.5) / 0.5) * 500;
      [[bt.champion, INK], [bt.challenger, ACC]].forEach(([m, col], i) => { const y = 150 + i * 80, g = E(u, 0.3 + i * 0.4, 1.1 + i * 0.4);
        tx(280, y + 6, m.name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(280, y + 28, clean(m.note), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
        rect(300, y - 8, (VX(m.auc) - 300) * g, 30, { fill: col, opacity: 0.85 });
        mono(300 + (VX(m.auc) - 300) * g + 10, y + 13, `AUC ${(0.5 + (m.auc - 0.5) * g).toFixed(2)}`, { 'font-size': 16, 'font-weight': 800, fill: col }); });
      mono(300, 326, 'chall > champ + 0.01  →  "promote"', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      tx(300, 360, '재학습이 항상 이기지는 않는다 — 채점으로 정한다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) });
    }
    if (k === 6 || k === 7) { const sw = k === 7 ? E(u, 0.4, 1.4) : 0;
      zone(560, 110, 370, 150, '서비스 슬롯', { fill: C.GOODBG, color: GOOD });
      model(lerp(745, 260, sw), lerp(190, 330, sw), '챔피언', k === 7 ? MUT : INK, { sub: k === 7 && sw > 0.5 ? 'champion_prev.joblib' : '1월 학습' });
      model(lerp(260, 745, sw), lerp(190, 190, sw), '챌린저', ACC, { sub: sw > 0.5 ? '승격 · 서비스 중' : 'challenger.joblib', dash: sw > 0.5 ? null : '6 4', fill: sw > 0.5 ? ACCBG : PANEL });
      if (k === 6) { el('line', { x1: 355, y1: 190, x2: 560, y2: 190, stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }); cross(458, 190, 10, pop(u, 0.8));
        tx(260, 270, '저장은 하되 서비스에는 붙이지 않는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
        tx(260, 300, '즉시 교체 = 장애의 원인', { 'font-size': 15, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
      if (k === 7) { pill(745, 290, '승격 확정 (D-17)', GOOD, pop(u, 1.5), { fs: 15 });
        tx(260, 400, '진 챔피언은 롤백 카드로 보관', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); } } }

  // =========================================================
  // 5. 운영 배치 — 4층 모니터링 · 알림 · 롤백
  // =========================================================
  const LAYERS = [['① 입력 분포', '피처별 PSI · KS', '즉시'], ['② 예측 분포', '예측 평균·분포 PSI', '즉시'], ['③ 지연 성능', 'Accuracy · AUC', '+30일'], ['④ 비즈니스', '캠페인 전환율·매출', '+주 단위']];
  const RUNBOOK = ['runbook/data-drift.md', 'runbook/concept-drift.md', 'runbook/perf-degradation.md'];
  const LY = (i) => 66 + i * 82;
  function layers(c, u) { const rows = c.beat.dashboard.rows, pn = c.prev ? c.prev.dashboard.rows.length : 0, k = c.k;
    tx(30, 40, '운영 대시보드 — 4층', { 'font-size': 15, 'font-weight': 800 });
    LAYERS.forEach(([n, m, lag], i) => { const y = LY(i), r = rows[i], a = k === 0 ? fade(u, 0.3 + i * 0.3) : 1, fresh = r && i >= pn, g = fresh ? E(u, 0.3, 0.9) : r ? 1 : 0;
      el('rect', { x: 30, y, width: 570, height: 70, rx: 10, fill: r ? PANEL : SOFT, stroke: r ? (r.status === 'ok' ? GOOD : BAD) : GRID, 'stroke-width': r ? 2.2 : 1.5, opacity: a });
      tx(46, y + 26, n, { 'font-size': 15.5, 'font-weight': 800, opacity: a });
      tx(170, y + 26, m, { 'font-size': 14, fill: MUT, opacity: a });
      pill(548, y + 21, lag, lag === '즉시' ? ACC : WARN, a, { fs: 13.5 });
      if (r) { tx(46, y + 54, r.now, { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: g }); check(578, y + 50, 8, g); } }); }
  function s5(t, c) { const { k, u } = c;
    layers(c, u);
    const RX = 785;
    if (k === 0) { clock(RX, 170, 70, E(u, 0.3, 1.6) * (4 / 12), ACC, null);
      mono(RX, 280, '매일 새벽 04:00', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      tx(RX, 312, '배치 하나가 4층을 위에서 아래로', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 1) { card(RX, 70, 300, 46, { rx: 10, stroke: ACC, fill: ACCBG, text: 'daily_ops_batch()', fs: 16, mono: true, color: ACC, s: pop(u, 0.2) });
      ['scan_features', 'prediction_drift', 'score_matured_predictions', 'should_retrain', 'train_challenger'].forEach((f, i) => {
        const y = 124 + i * 38, s = seg(u, 0.4 + i * 0.2, 0.9 + i * 0.2); if (s < 1) fly(RX, 410, RX, y, s, f, { mono: true, fill: INFO });
        else card(RX, y, tw(f, 14) + 24, 30, { rx: 15, stroke: INFO, text: f, fs: 14, mono: true, color: INFO }); });
      mono(RX, 340, 'PSI_ALERT = 0.25', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(RX, 368, 'AUC_FLOOR = 0.78', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.1) }); }
    if (k === 2) { const x0 = 630; tx(x0, 80, 'notify(text, runbook)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.2) });
      el('rect', { x: x0, y: 100, width: 310, height: 170, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.3) });
      pill(x0 + 70, 132, '@ml-oncall', ACC, pop(u, 0.6), { fs: 14.5, mono: true });
      tx(x0 + 16, 180, '입력 드리프트: age …', { 'font-size': 15, opacity: fade(u, 1.0) });
      mono(x0 + 16, 230, '대응 절차: runbook/…', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(x0, 312, '담당자 + 메시지 + 절차', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      tx(x0, 344, '"뭔가 이상함"만 던지면 알림 피로', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k >= 3 && k <= 5) { const i = k - 3, y = LY(i) + 35;
      el('rect', { x: 26, y: LY(i) - 4, width: 578, height: 78, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.1) });
      grow(606, y, 640, y, E(u, 0.9, 1.2), ACC);
      card(RX, y, 280, 60, { rx: 10, stroke: GRID, s: pop(u, 1.1) });
      tx(RX, y - 6, '임계 넘으면 알림', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(RX, y + 16, RUNBOOK[i], { 'font-size': 13.5, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(RX, y + 66, i === 2 ? 'AUC 0.86 ≥ 하한 0.78 → 알림 없음' : '오늘은 OK → 알림 없음', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k === 6) { const steps = ['should_retrain()', 'train_challenger()', '섀도 배포 · 기록만', '2주 뒤 채점 → 승격'];
      steps.forEach((s, i) => { const y = 80 + i * 76; card(RX, y, 270, 46, { rx: 10, stroke: i === 3 ? GOOD : ACC, text: s, fs: 15, mono: i < 2, color: i === 3 ? GOOD : ACC, s: pop(u, 0.3 + i * 0.4) });
        if (i < 3) grow(RX, y + 24, RX, y + 52, E(u, 0.5 + i * 0.4, 0.7 + i * 0.4), ACC); });
      tx(RX, 400, '재학습 일정을 사람이 기억하지 않는다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 7) { const ops = c.beat.opsChecklist.items, gr = c.beat.graduate.items;
      el('rect', { x: 625, y: 28, width: 320, height: 40, rx: 8, fill: INK, opacity: fade(u, 0.2) });
      mono(637, 54, '$ mlctl rollback --to v12', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(625, 90, '원버튼 롤백 — 배포 전에 리허설', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      tx(625, 122, '배포 전 체크리스트', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.8) });
      ops.forEach((o, i) => { const s = clean(o.text).split(' (')[0], y = 150 + i * 30, a = fade(u, 0.9 + i * 0.15);
        check(636, y - 5, 6, a); tx(652, y, s, { 'font-size': 13.5, opacity: a }); });
      tx(625, 320, '다음 여정', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      gr.forEach((g, i) => pill(680 + i * 140, 356, g.name, ACC, pop(u, 2.0 + i * 0.2), { fs: 15, mono: true }));
      tx(625, 400, '늙음을 재고, 안전하게 되돌린다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.4) }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "이탈 예측 모델의 정확도 하락을 실시간으로 볼 수 없는 이유는 무엇인가?",
      o: ["서버 지표가 모두 초록불이라서", "이탈 라벨이 30일 뒤에야 확정되기 때문", "정확도는 분기 단위로만 계산할 수 있어서"], a: 1,
      why: "LABEL_DELAY_DAYS = 30이라 가장 최근 한 달은 늘 채점할 수 없다. 6월 정확도 0.71도 한 달 늦게야 알게 된다." },
    { q: "age 피처의 PSI가 0.35로 나왔다. 실무 관례로 어떻게 판정하나?",
      o: ["안정 — 1보다 작으면 괜찮다", "주의 — 0.1~0.25 구간이다", "드리프트 확정 — 0.25 이상이다"], a: 2,
      why: "관례상 0.1 미만은 안정, 0.1~0.25는 주의, 0.25 이상은 드리프트다. PSI는 라벨이 필요 없어 성능 하락보다 한 달 먼저 울린다." },
    { q: "입력 PSI는 전부 OK인데 예측 분포 PSI가 0.27이고 저방문 그룹 이탈률이 0.41에서 0.24로 떨어졌다. 무엇을 의심해야 하나?",
      o: ["컨셉 드리프트 — 입력→정답 관계 자체가 변했다", "데이터 드리프트 — 입력 분포가 변했다", "예측 로그가 저장되지 않는 버그"], a: 0,
      why: "입력은 그대로인데 \"방문 적음 = 이탈\" 관계가 무너졌다. 컨셉 드리프트는 정답이 있어야 보이므로 예측 분포와 지연 백테스트 같은 프록시로 감시한다." },
    { q: "재학습한 챌린저 모델은 어떻게 교체하나?",
      o: ["학습이 끝나면 바로 챔피언과 갈아끼운다", "14일 섀도 배포 후 지연 라벨 채점에서 0.01 이상 앞설 때만 승격한다", "누적 전체 데이터로 다시 학습해 데이터가 많은 쪽을 쓴다"], a: 1,
      why: "재학습이 항상 이기지는 않는다. 섀도로 나란히 달린 뒤 champion 0.76, challenger 0.86처럼 지연 라벨로 판정하고, 진 챔피언도 롤백 카드로 보관한다." },
    { q: "4층 모니터링에서 가장 정직하지만 가장 느린 층은 무엇인가?",
      o: ["입력 분포 — 피처별 PSI", "예측 분포 — 예측 PSI", "지연 성능 — 라벨이 도착한 만큼의 AUC"], a: 2,
      why: "라벨이 30일 뒤에야 오므로 지연 AUC는 늦게 울린다. 그래서 라벨 없이 즉시 볼 수 있는 입력·예측 분포 층을 앞에 둔다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '코드는 그대로인데 정확도가 84%에서 71%로 조용히 내려갔다. 라벨은 30일 뒤에야 온다.',
    '입력 분포의 변화는 PSI로 라벨 없이 바로 잡는다. age는 0.35로 경보였다.',
    '입력은 그대로인데 관계가 바뀌면 예측 분포와 지연 채점으로 감시한다.',
    '신호가 오면 최근 6개월로 재학습하고, 14일 섀도 대결에서 이긴 모델만 올린다.',
  ];
  const review = [
    { q: '컨셉 드리프트가 의심돼 쌓인 데이터 전체로 재학습했다. 무엇이 문제인가?',
      o: ['데이터가 많아 학습이 끝나지 않는다', '이미 죽은 관계까지 다시 배운다', 'PSI를 계산할 수 없게 된다'], a: 1,
      why: '관계가 바뀌었다면 옛 데이터는 틀린 답을 가르친다. 최근 6개월 슬라이딩 윈도우로 학습해 죽은 관계를 잊게 한다.' },
    { q: 'PSI를 계산하면서 구간 경계를 현재 데이터의 분위수로 다시 잡았다. 결과는?',
      o: ['변화가 더 크게 보인다', '라벨이 있어야 계산된다', '변화가 사라져 보인다'], a: 2,
      why: '두 분포는 같은 자로 재야 한다. 경계를 현재 분포로 잡으면 자가 같이 움직여 변화가 지워지므로, 경계는 학습 분포의 분위수로 고정한다.' },
    { q: '새벽 배치가 피처 PSI 경보와 예측 분포 PSI 경보를 서로 다른 런북으로 보낸다. 이유는?',
      o: ['원인이 달라 대응 절차도 달라서', '알림 개수를 늘리려고', '두 경보의 PSI 임계가 서로 달라서'], a: 0,
      why: '입력 분포가 변한 경우와 입력과 정답의 관계가 변한 경우는 진단도 처방도 다르다. 그래서 경보 종류마다 맞는 런북을 붙여 보낸다.' },
  ];

  RA.page({ title: '이탈 예측 모델 — 운영 모니터', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
