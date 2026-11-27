/* II-2-2 histogram_quantile (p95) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: le 경계마다 쌓이는 누적 버킷 막대, 그 끝을 이은 누적 분포(CDF), 950번째 순위가 걸치는 버킷 안 직선 보간.
 * 숫자: 페이지의 /metrics 예시(200·550·780·970·995·1000, _sum 420)와, Prometheus 의 bucketQuantile 규칙을
 *       파이썬으로 재현한 값(p95 0.947s, p99 2.2s, 1.0 버킷이 없을 때 p95 2.08s). prometheus_client 로 같은 버킷을 찍어 노출 형식도 확인했다.
 *       pod 3대로 나눈 버킷 값과 카디널리티 계산(경로 20개·pod 3대)은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, spans, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const LE = ['0.1', '0.25', '0.5', '1.0', '2.5', '+Inf'], CUM = [200, 550, 780, 970, 995, 1000];
  const PER = CUM.map((v, i) => v - (i ? CUM[i - 1] : 0));      // 200 350 230 190 25 5
  const PODS = { 'pod-a': [90, 240, 330, 395, 398, 400], 'pod-b': [70, 190, 270, 335, 347, 350], 'pod-c': [40, 120, 180, 240, 250, 250] };

  // 누적 버킷 막대 6개. o.n: 보일 막대 수(소수면 마지막이 자람), o.hi(i), o.x0, o.w(칸 폭), o.base, o.h(1000 의 높이)
  function buckets(vals, o) { o = o || {}; const x0 = o.x0 ?? 130, w = o.w ?? 100, base = o.base ?? 330, H = o.h ?? 230, n = o.n ?? 6, max = o.max ?? 1000;
    el('line', { x1: x0 - 10, y1: base, x2: x0 + w * 6, y2: base, stroke: MUT, 'stroke-width': 1.8 });
    vals.forEach((v, i) => { const g = clamp(n - i); const cx = x0 + i * w + w / 2, bw = w * 0.62;
      if (o.lab !== false) mono(cx, base + 22, o.lab ? o.lab[i] : `le=${LE[i]}`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      if (g <= 0) return; const h = (v / max) * H * g, prev = i ? (vals[i - 1] / max) * H * g : 0, hi = o.hi && o.hi(i);
      el('rect', { x: cx - bw / 2, y: base - h, width: bw, height: h, rx: 3, fill: hi ? (o.hiCol || BAD) : (o.col || ACC), opacity: 0.35 });
      if (o.nest !== false && i) el('rect', { x: cx - bw / 2, y: base - prev, width: bw, height: prev, rx: 3, fill: o.col || ACC, opacity: 0.45 });
      el('rect', { x: cx - bw / 2, y: base - h, width: bw, height: Math.max(0, h - (o.nest !== false && i ? prev : 0)), rx: 3, fill: hi ? (o.hiCol || BAD) : (o.col || ACC), opacity: 0.9 });
      if (o.val !== false && g > 0.9) mono(cx, base - h - 8, String(v), { 'font-size': o.fs || 15, 'font-weight': 800, 'text-anchor': 'middle', fill: hi ? (o.hiCol || BAD) : INK }); }); }
  // CDF 좌표축 (지연 0~2.5초, 누적 0~1000)
  function cdfAxes(o) { o = o || {}; return R.axes(o.x ?? 100, o.y ?? 60, o.w ?? 560, o.h ?? 270, { x: [0, 2.5], y: [0, 1000], xt: [0, 0.5, 1, 1.5, 2, 2.5], yt: [0, 500, 1000], xl: '지연(초) = le', yl: '누적 건수', grid: true }); }
  const PTS = [[0, 0], [0.1, 200], [0.25, 550], [0.5, 780], [1.0, 970], [2.5, 995]];
  function cdf(ax, u, o) { o = o || {}; const pts = o.pts || PTS; R.line(ax, pts, u, o.col || ACC, { sw: 3 }); R.scatter(ax, pts.slice(1).map((p) => [p[0], p[1], o.col || ACC]), { u, r: 5.5 }); }

  // ---------- 1. 3형제 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(170, 200, 290, 90, { rx: 12, stroke: ACC, sw: 2.5, text: 'histogram\nhttp_request_duration_seconds', fs: 14, s: pop(u, 0.1) });
      [['_bucket{le="…"}', '경계별 누적 건수 · 여러 줄', 110], ['_sum', '지연 총합(초)', 220], ['_count', '전체 건수', 310]].forEach(([a, b, y], i) => { const g = E(u, 0.7 + i * 0.35, 1.3 + i * 0.35);
        grow(317, 200, 470, y, g, ACC, { plain: true });
        if (g > 0.1) { card(lerp(330, 640, g), lerp(200, y, g), 300, 64, { rx: 10, stroke: i ? WARN : ACC, sw: 2 });
          mono(lerp(330, 640, g) - 135, lerp(200, y, g) - 4, a, { 'font-size': 16, 'font-weight': 800, fill: i ? WARN : ACC, opacity: g });
          tx(lerp(330, 640, g) - 135, lerp(200, y, g) + 20, b, { 'font-size': 14, fill: MUT, opacity: g }); } });
      tx(480, 395, 'le = less than or equal, "이 경계 이하"', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const L = ['# HELP http_request_duration_seconds Request latency', '# TYPE http_request_duration_seconds histogram', 'http_request_duration_seconds_bucket{le="0.1"}   200', 'http_request_duration_seconds_bucket{le="0.25"}  550', '…'];
      terminal(60, 50, 840, 230, L, lerp(0, 5, E(u, 0.1, 1.6)), { title: 'GET /metrics', fs: 15, lh: 34 });
      el('rect', { x: 66, y: 110, width: 828, height: 28, rx: 4, fill: 'none', stroke: 'var(--hl)', 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      tx(480, 330, 'TYPE을 histogram으로 선언해야 버킷 묶음으로 읽힌다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { buckets(CUM, { n: lerp(0, 4, E(u, 0.2, 2.0)) });
      tx(480, 50, '누적: 0.25 막대 안에 0.1 막대가 들어 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(480, 395, 'le가 커질수록 값이 줄지 않는다 (200 → 550 → 780 → 970)', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3) { buckets(CUM, { n: lerp(4, 6, E(u, 0.2, 1.2)), hi: (i) => i === 5, hiCol: WARN });
      card(820, 60, 220, 44, { rx: 10, stroke: WARN, text: '+Inf = 1000 = _count', fs: 15, color: WARN, mono: true, s: pop(u, 1.4) });
      sub(480, 395, '+Inf 버킷은 모든 관측을 담는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 4) {
      [['_sum', '420', '초'], ['_count', '1000', '건']].forEach(([a, b, unit], i) => { const cx = 300 + i * 360, s = pop(u, 0.2 + i * 0.4);
        card(cx, 150, 220, 74, { rx: 12, stroke: WARN, sw: 2.5, fill: PANEL, s });
        mono(cx - 90, 140, a, { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) });
        mono(cx - 90, 170, b + ' ' + unit, { 'font-size': 24, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3 + i * 0.4) }); });
      el('line', { x1: 430, y1: 150, x2: 530, y2: 150, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.2) }); mono(480, 140, '÷', { 'font-size': 20, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      banner(480, 270, '평균 = 420 ÷ 1000 = 0.42초', pop(u, 1.6)); return; }
    // k5: 평균은 꼬리를 감춘다 — 버킷별 건수(비누적)
    buckets(PER, { nest: false, max: 400, col: INFO, hi: (i) => i >= 4, lab: ['~0.1', '~0.25', '~0.5', '~1.0', '~2.5', '2.5~'] });
    tx(480, 46, '버킷별 건수 (누적을 풀어 놓은 값)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 });
    const mx = 330 - 31 + ((0.42 - 0.25) / 0.25) * 62;   // 0.42초는 (0.25, 0.5] 막대 안 68% 지점
    el('line', { x1: mx, y1: 70, x2: mx, y2: 330, stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: fade(u, 0.6) });
    mono(mx + 8, 88, '평균 0.42초', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.7) });
    card(800, 150, 230, 56, { rx: 10, stroke: BAD, fill: BADBG, text: '1초 넘는 요청 30건', fs: 16, color: BAD, s: pop(u, 1.4) });
    sub(480, 395, '평균 한 숫자로는 이 꼬리가 보이지 않는다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 2. sum by (le) ----------
  function podSet(name, vals, x0, o) { o = o || {};
    zone(x0 - 10, 50, 300, 210, null, { fill: SOFT, op: o.op ?? 1 });
    tx(x0 + 4, 74, name, { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1 });
    if (o.tag) pill(x0 + 210, 72, o.tag, ACC, o.tagS ?? 1, { mono: true, fs: 13.5 });
    buckets(vals, { x0: x0 + 4, w: 46, base: 230, h: 130, max: 400, val: false, lab: false, col: o.col }); }
  function s2(t, c) { const { k, u } = c, xs = [40, 350, 660];
    if (k <= 1) { Object.entries(PODS).forEach(([n, v], i) => { const s = k === 0 ? fade(u, 0.2 + i * 0.4) : 1; if (s <= 0) return;
        podSet(n, v, xs[i], { op: s, tag: k === 1 ? 'rate()' : null, tagS: k === 1 ? pop(u, 0.3 + i * 0.3) : 0 });
        mono(xs[i] + 4, 255, `+Inf ${v[5]}`, { 'font-size': 14, fill: MUT, opacity: s }); });
      if (k === 0) tx(480, 320, '세 pod가 같은 histogram을 따로 노출한다 (버킷 값은 예시)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      else { tx(480, 310, '버킷도 counter다. 먼저 rate로 초당 증가율로 바꾼다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
        sub(480, 340, '모양은 그대로, 단위만 건 → 건/초', fade(u, 1.8), { 'font-size': 15 }); }
      return; }
    if (k === 2) { const m = E(u, 0.2, 1.4);
      Object.entries(PODS).forEach(([n, v], i) => podSet(n, v, xs[i], { op: 1 - m * 0.75 }));
      for (let j = 0; j < 6; j++) Object.values(PODS).forEach((v, i) => { const f = seg(u, 0.4 + j * 0.12, 1.2 + j * 0.12); if (f > 0 && f < 1) dot([[xs[i] + 27 + j * 46, 200], [130 + j * 100 + 50, 300]], f, ACC, 5); });
      const n = lerp(0, 6, E(u, 1.2, 2.3));
      buckets(CUM, { base: 400, h: 110, n, fs: 14, lab: false });
      mono(900, 300, 'sum by (le)', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      tx(900, 324, 'le 축은 남고 pod는 합산', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.3) }); return; }
    // k3: le 를 빼면
    mono(480, 56, 'sum(rate(http_request_duration_seconds_bucket[5m]))', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD });
    const m = E(u, 0.3, 1.5), x1 = 300; let acc = 0;
    CUM.forEach((v, i) => { const x0 = 130 + i * 100 + 19, w0 = 62, h0 = v / 1000 * 200, w = lerp(w0, v / 4495 * 560, m), x = lerp(x0, 200 + acc / 4495 * 560, m), y = lerp(320 - h0, 200, m), h = lerp(h0, 50, m);
      el('rect', { x, y, width: w, height: h, rx: 3, fill: BAD, opacity: 0.35 + (i % 2) * 0.3 }); acc += v; });
    mono(780, 232, '4495', { 'font-size': 24, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
    tx(480, 320, '모든 버킷이 한 숫자로 뭉쳐 le 축이 사라진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
    sub(480, 350, 'histogram_quantile이 분포를 되살릴 수 없다', fade(u, 2.1), { 'font-size': 15 }); }

  // ---------- 3. 누적 분포에서 p95 ----------
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { // 1000건을 지연 순으로 줄 세운 띠 (한 칸 = 25건)
      tx(480, 60, '요청 1000건을 지연 오름차순으로 줄 세우면', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700 });
      const cols = [ACC, ACC, ACC, ACC, ACC, ACC, ACC, ACC];
      for (let i = 0; i < 40; i++) { const s = k === 0 ? clamp(E(u, 0.2, 1.4) * 40 - i) : 1, rk = (i + 1) * 25, bi = CUM.findIndex((cc) => cc >= rk);
        el('rect', { x: 80 + i * 20, y: 120, width: 17, height: 60 * s, rx: 2, fill: bi >= 4 ? BAD : bi === 3 ? WARN : ACC, opacity: 0.35 + bi * 0.12 }); }
      const x950 = 80 + 38 * 20 + 8;
      grow(x950, 240, x950, 186, k === 0 ? E(u, 1.5, 2.0) : 1, BAD);
      mono(x950, 262, '950번째', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.8) : 1 });
      mono(80, 108, '1번째', { 'font-size': 14, fill: MUT }); mono(880, 108, '1000번째', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      if (k === 0) tx(480, 330, 'p95 = 950번째 요청의 지연', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 2.1) });
      if (k === 1) { spans(190, 340, [['histogram_quantile(', {}], ['0.95', { fill: BAD, 'font-weight': 800 }], [', sum by (le) (…))', {}]], { 'font-size': 18, opacity: fade(u, 0.3) });
        sub(480, 380, '분위 0.95 × 전체 1000 = 목표 순위 950', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      return; }
    const ax = cdfAxes();
    cdf(ax, k === 2 ? E(u, 0.3, 1.8) : 1);
    if (k === 2) { PTS.slice(1).forEach(([x, y], i) => mono(ax.X(x) + 8, ax.Y(y) + (i < 3 ? 16 : -8), String(y), { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.25) }));
      tx(700, 130, '입력 = sum by (le)로', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(700, 156, '합친 버킷 분포', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7) });
      sub(700, 190, '(+Inf 1000은 그림 밖)', fade(u, 1.9), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    const y950 = ax.Y(950), xp = ax.X(0.9474);
    const g = k === 3 ? E(u, 0.2, 1.0) : 1; grow(ax.X(0), y950, lerp(ax.X(0), xp, g), y950, g, BAD, { plain: true, dash: '6 4' });
    mono(ax.X(0) + 6, y950 - 8, '950', { 'font-size': 14, fill: BAD, 'font-weight': 800 });
    const g2 = k === 3 ? E(u, 1.1, 1.7) : 1; grow(xp, y950, xp, lerp(y950, ax.Y(0), g2), g2, BAD, { plain: true });
    if (k === 3) { el('circle', { cx: ax.X(0.5), cy: ax.Y(780), r: 9, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.8) }); el('circle', { cx: ax.X(1.0), cy: ax.Y(970), r: 9, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.8) });
      [['780 @ le=0.5', INK], ['970 @ le=1.0', INK], ['950은 그 사이', BAD], ['p95 ≈ 0.95초', BAD]].forEach(([s, col], i) => (/[가-힣]/.test(s) ? tx : mono)(700, 120 + i * 38, s, { 'font-size': i === 3 ? 20 : 16, 'font-weight': i >= 2 ? 800 : 600, fill: col, opacity: fade(u, 0.6 + i * 0.35) })); return; }
    // k4: 평균과 비교
    const xm = ax.X(0.42), g3 = E(u, 0.2, 0.9); el('line', { x1: xm, y1: ax.Y(0), x2: xm, y2: lerp(ax.Y(0), ax.Y(1000), g3), stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
    mono(xm + 8, ax.Y(450), '평균 0.42', { 'font-size': 15, fill: WARN, 'font-weight': 800, opacity: fade(u, 0.8) });
    mono(xp + 8, ax.Y(0) - 10, 'p95 0.947', { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 0.5) });
    card(790, 170, 220, 76, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 1.3) });
    mono(790, 166, '0.947 ÷ 0.42', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    tx(790, 192, '≈ 평균의 2.25배', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }

  // ---------- 4. 직선 보간 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(480, 140, 'rank = 0.95 × 1000', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(480, 210, `= ${Math.round(lerp(0, 950, E(u, 0.8, 1.8)))}`, { 'font-size': 44, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(480, 290, '분위 × 전체 건수(+Inf 버킷)로 목표 순위부터 정한다', fade(u, 1.9), { 'font-size': 16 }); return; }
    if (k === 1 || k === 2) { // 버킷 표를 위에서부터 훑는다
      tx(140, 60, 'le', { 'font-size': 15, fill: MUT, 'font-weight': 700 }); tx(300, 60, '누적', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      const scan = k === 1 ? E(u, 0.5, 2.2) * 4 : 4;
      [0, 1, 2, 3, 4].forEach((i) => { const y = 100 + i * 52, s = k === 1 ? pop(u, 0.1 + i * 0.1) : 1, hit = (k === 2 && (i === 2 || i === 3)) || (k === 1 && i === 3 && scan >= 3), past = scan >= i;
        card(250, y, 300, 44, { rx: 8, stroke: hit ? BAD : GRID, sw: hit ? 2.5 : 1.5, fill: hit ? BADBG : PANEL, s });
        mono(140, y + 6, LE[i], { 'font-size': 17, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 }); mono(300, y + 6, String(CUM[i]), { 'font-size': 17, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 });
        if (k === 1 && past && i < 3) mono(420, y + 6, '< 950', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5 + i * 0.42) });
        if (k === 1 && i === 3 && scan >= 3) mono(420, y + 6, '≥ 950', { 'font-size': 15, fill: BAD, 'font-weight': 800 }); });
      if (k === 1) { const y = 100 + Math.min(scan, 3) * 52; el('path', { d: `M80,${y} l-14,-9 v18 z`, fill: BAD }); }
      if (k === 2) { [['하한 (lower)', 'le 0.5 · 누적 780'], ['상한 (upper)', 'le 1.0 · 누적 970']].forEach(([a, b], i) => { const y = 160 + i * 90, s = pop(u, 0.4 + i * 0.4);
          card(700, y, 300, 70, { rx: 10, stroke: BAD, sw: 2, s }); tx(570, y - 6, a, { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) });
          mono(570, y + 20, b, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.4) }); });
        grow(400, 204, 545, 160, E(u, 0.6, 1.0), BAD); grow(400, 256, 545, 250, E(u, 1.0, 1.4), BAD); }
      return; }
    // k3, k4: 버킷 하나 확대
    const ax = R.axes(120, 70, 480, 270, { x: [0.5, 1.0], y: [760, 980], xt: [0.5, 0.75, 1.0], yt: [780, 950, 970], xl: '지연(초)', yl: '누적 건수', grid: true });
    const g = k === 3 ? E(u, 0.2, 0.9) : 1; grow(ax.X(0.5), ax.Y(780), lerp(ax.X(0.5), ax.X(1.0), g), lerp(ax.Y(780), ax.Y(970), g), g, k === 4 ? OFF : ACC, { plain: true, sw: 3.5 });
    el('circle', { cx: ax.X(0.5), cy: ax.Y(780), r: 7, fill: INK }); el('circle', { cx: ax.X(1.0), cy: ax.Y(970), r: 7, fill: INK });
    el('line', { x1: ax.X(0.5), y1: ax.Y(950), x2: ax.X(1.0), y2: ax.Y(950), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    if (k === 3) { const xp = ax.X(0.9474), g2 = E(u, 1.0, 1.5); grow(xp, ax.Y(950), xp, lerp(ax.Y(950), ax.Y(760), g2), g2, BAD, { plain: true, sw: 2.5 });
      [['(950 − 780) / (970 − 780)', INK], ['= 170 / 190 = 0.895', INK], ['0.5 + 0.895 × 0.5', INK], ['p95 ≈ 0.947초', BAD]].forEach(([s, col], i) => (/[가-힣]/.test(s) ? tx : mono)(630, 120 + i * 44, s, { 'font-size': i === 3 ? 21 : 16, 'font-weight': i === 3 ? 800 : 600, fill: col, opacity: fade(u, 0.8 + i * 0.4) })); return; }
    // k4: 버킷 안 실제 분포는 모른다
    const A = [[0.5, 780], [0.55, 860], [0.62, 930], [0.75, 960], [1.0, 970]], Bc = [[0.5, 780], [0.8, 800], [0.92, 860], [0.98, 950], [1.0, 970]];
    R.line(ax, A, E(u, 0.2, 1.0), INFO, { sw: 2.5, dash: '5 4' }); R.line(ax, Bc, E(u, 0.6, 1.4), WARN, { sw: 2.5, dash: '5 4' });
    tx(630, 130, '버킷 안 모양은 알 수 없다', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.0) });
    tx(630, 166, '두 점선 모두 같은 버킷 값을 낸다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
    tx(630, 230, 'Prometheus는 균등하다고 보고', { 'font-size': 15, opacity: fade(u, 1.8) });
    tx(630, 256, '직선으로 보간한 근사치를 낸다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); }

  // ---------- 5. SLO · 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const ax = R.axes(200, 80, 560, 220, { x: [0, 2.5], y: [0, 3], xt: [0, 0.5, 1, 1.5, 2, 2.5], xl: '초' });
      const rows = [['평균', 0.42, WARN], ['p95', 0.947, ACC], ['p99', 2.2, BAD]];
      rows.forEach(([n, v, col], i) => { const y = 112 + i * 64, g = k === 0 ? E(u, 0.2 + i * 0.4, 1.0 + i * 0.4) : 1;
        tx(185, y + 6, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: col });
        el('rect', { x: 200, y: y - 14, width: (ax.X(v) - 200) * g, height: 28, rx: 4, fill: col, opacity: 0.8 });
        mono(ax.X(v) * g + 200 * (1 - g) + 10, y + 6, `${v}s`, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: g > 0.9 ? 1 : 0 }); });
      const sl = ax.X(1.0); el('line', { x1: sl, y1: 74, x2: sl, y2: 300, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: k === 1 ? 1 : fade(u, 1.8) });
      mono(sl, 66, 'SLO 1.0s', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 1 ? 1 : fade(u, 1.8) });
      if (k === 0) sub(480, 360, 'rank 990은 970@1.0과 995@2.5 사이 → 1.0 + 0.8 × 1.5 = 2.2초', fade(u, 2.1), { 'font-size': 15, fill: INK });
      if (k === 1) { mono(480, 360, 'histogram_quantile(0.99, sum by (le) (…)) > 1.0', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        banner(480, 396, '2.2 > 1.0 → SLO 위반', pop(u, 1.2)); }
      return; }
    if (k === 2) { mono(480, 52, 'histogram_quantile(0.95, sum by (le, path) (…))', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      [['/api/orders', ACC, [[0, 0], [0.25, 500], [0.5, 800], [1, 960], [2.5, 995]]], ['/api/search', INFO, [[0, 0], [0.25, 250], [0.5, 520], [1, 860], [2.5, 990]]]].forEach(([p, col, pts], i) => {
        const ax = R.axes(80 + i * 440, 100, 360, 210, { x: [0, 2.5], y: [0, 1000], xt: [0, 1, 2.5] });
        R.line(ax, pts, E(u, 0.3 + i * 0.4, 1.3 + i * 0.4), col, { sw: 3 });
        mono(80 + i * 440, 90, p, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) }); });
      tx(480, 380, 'path를 남기면 경로마다 분포가 따로 생겨 p95도 따로 나온다 (모양은 예시)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { const ax = cdfAxes({ w: 520 });
      cdf(ax, 1, { col: OFF });
      const coarse = [[0, 0], [0.1, 200], [0.25, 550], [0.5, 780], [2.5, 995]];
      R.line(ax, coarse, E(u, 0.3, 1.2), BAD, { sw: 3 });
      el('line', { x1: ax.X(0), y1: ax.Y(950), x2: ax.X(2.5), y2: ax.Y(950), stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) });
      [[0.9474, ACC, '0.947'], [2.081, BAD, '2.08']].forEach(([x, col, s], i) => { const g = E(u, 1.2 + i * 0.4, 1.7 + i * 0.4);
        grow(ax.X(x), ax.Y(950), ax.X(x), lerp(ax.Y(950), ax.Y(0), g), g, col, { plain: true, sw: 2.5 });
        mono(ax.X(x), ax.Y(0) - 8 - i * 20, s, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: g }); });
      tx(650, 120, 'le=1.0 버킷을 뺐더니', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(650, 148, 'p95가 0.947 → 2.08초', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      sub(650, 182, 'SLO 근처에 경계를 촘촘히 둔다', fade(u, 2.3), { 'text-anchor': 'start', 'font-size': 15, fill: INK }); return; }
    // k4: 순서와 카디널리티
    [['rate', '버킷 counter → 초당'], ['sum by (le)', 'pod·instance 합산'], ['histogram_quantile', '보간해서 분위']].forEach(([a, b], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
      card(cx, 110, 250, 78, { rx: 12, stroke: ACC, sw: 2, s }); mono(cx, 104, a, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
      tx(cx, 130, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
      if (i < 2) grow(cx + 128, 110, cx + 180, 110, E(u, 0.5 + i * 0.4, 0.8 + i * 0.4), MUT); });
    spans(130, 250, [['(버킷 6 + _sum + _count)', {}], [' × 경로 20 × pod 3', { fill: WARN }], [' = 480 시계열', { fill: BAD, 'font-weight': 800 }]], { 'font-size': 18, opacity: fade(u, 1.5) });
    tx(480, 300, '버킷을 잘게 나눌수록, 레이블이 늘수록 곱으로 불어난다 (예시 계산)', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'http_request_duration_seconds_bucket{le="+Inf"}의 값은 무엇과 같은가?',
      o: ['_sum', 'le="2.5" 버킷', '_count'], a: 2,
      why: '+Inf 버킷은 모든 관측을 담으므로 전체 건수 1000으로 _count와 같다. 누적이라 le가 커질수록 값이 줄지 않는다.' },
    { q: 'pod 3대의 histogram을 합쳐 p95를 구할 때 sum에 반드시 붙여야 하는 것은 무엇인가?',
      o: ['by (le)', 'by (pod)', 'without (le)'], a: 0,
      why: 'le는 버킷 경계 축이다. le를 남기지 않으면 버킷이 한 숫자(예시에서 4495)로 뭉쳐 분포를 되살릴 수 없다.' },
    { q: '누적 780@0.5초, 970@1.0초인 분포에서 p95(950번째)는 어느 구간에 있는가?',
      o: ['0.25초~0.5초', '0.5초~1.0초', '1.0초~2.5초'], a: 1,
      why: '950은 780과 970 사이에 걸치므로 p95는 0.5초에서 1.0초 사이에 있고, 보간하면 약 0.95초다.' },
    { q: 'histogram_quantile이 버킷 안에서 p95를 정하는 방식은 무엇인가?',
      o: ['버킷 상한값을 그대로 돌려준다', '실제 요청 지연을 다시 읽어 정확히 계산한다', '버킷 안 관측이 고르게 퍼졌다고 보고 직선으로 보간한다'], a: 2,
      why: '(950−780)/(970−780) = 0.895 지점을 버킷 폭에 곱해 0.5 + 0.895×0.5 ≈ 0.947초를 낸다. 버킷 해상도에 묶인 근사치다.' },
    { q: '같은 버킷에서 p99를 구하면 SLO 1초에 대해 어떻게 판정되는가?',
      o: ['약 0.95초로 지킨다', '2.2초로 위반한다', '+Inf라서 계산할 수 없다'], a: 1,
      why: '990번째는 970@1.0과 995@2.5 사이라 1.0 + 0.8×1.5 = 2.2초다. 1.0보다 크므로 위반이다.' },
  ];

  const summary = [
    'histogram은 le 경계별 누적 버킷과 _sum, _count로 노출되고, +Inf 버킷은 _count와 같다.',
    '평균 0.42초는 1초 넘는 요청 30건을 감춰서 백분위수를 따로 봐야 한다.',
    'rate를 먼저 구하고 sum by (le)로 le를 남겨 합친 뒤 histogram_quantile에 넣는다.',
    'p95 0.947초는 버킷 안을 직선으로 본 근사치라 SLO 근처 경계가 성기면 크게 틀어진다.',
  ];
  const review = [
    { q: 'p95 패널이 갑자기 비었다. 쿼리를 보니 histogram_quantile(0.95, sum(rate(x_bucket[5m])))였다. 먼저 고칠 곳은?',
      o: ['sum을 sum by (le)로 바꾼다', '0.95를 0.99로 바꾼다', 'rate를 irate로 바꾼다'], a: 0,
      why: 'le 없이 더하면 모든 버킷이 한 숫자로 뭉쳐 분포 축이 사라진다. le를 남겨야 보간할 버킷이 생긴다.' },
    { q: 'SLO가 1초인데 버킷 경계가 0.5와 2.5뿐이다. p95가 2초 넘게 나와 경보가 울렸다. 먼저 의심할 것은?',
      o: ['_sum 값이 틀렸다', '1초 근처에 경계가 없어 보간 오차가 크다', 'pod 수가 너무 많다'], a: 1,
      why: '예시에서 le=1.0 버킷을 빼면 같은 데이터로 p95가 0.947초에서 2.08초로 바뀐다. SLO 근처에 경계를 둬야 한다.' },
    { q: '각 pod가 Summary로 p95를 미리 계산해 노출한다. 서비스 전체 p95를 구하려면 어떻게 해야 하나?',
      o: ['pod별 p95를 avg로 평균 낸다', 'pod별 p95를 sum으로 더한다', 'Histogram 버킷으로 노출하고 sum by (le) 뒤 quantile을 구한다'], a: 2,
      why: '미리 계산된 분위수는 더하거나 평균 내도 전체 분위수가 되지 않는다. 버킷은 더할 수 있어서 서버에서 합친 뒤 계산한다.' },
  ];

  R.page({ title: '버킷에서 p95 꺼내기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
