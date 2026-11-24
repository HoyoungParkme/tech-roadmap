/* V-1-1 HA — 같은 설정 2대 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, browser } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, INFO, INFOBG } = C;

  // Prometheus 서버 한 대: 이름 + 아래 한 줄(mono). o.dead 면 빨간 테두리
  function prom(cx, cy, name, o) { o = o || {}; const w = o.w || 160, h = o.h || 62, g = G(cx, cy, o.s, o.op), col = o.dead ? BAD : (o.stroke || ACC);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: o.dead ? BADBG : (o.fill || PANEL), stroke: col, 'stroke-width': 2.5 }, g);
    el('circle', { cx: -w / 2 + 18, cy: -h / 2 + 21, r: 6.5, fill: o.dead ? BAD : (o.lamp || ACC) }, g);
    tx(-w / 2 + 32, -h / 2 + 26, name, { 'font-size': 16, 'font-weight': 800, fill: o.dead ? BAD : INK }, g);
    if (o.sub) tx(-w / 2 + 14, h / 2 - 11, o.sub, { 'font-size': 13.5, fill: MUT, class: 'mono' }, g);
    return g; }
  // 글자를 frac 만큼 타이핑
  const typed = (x, y, s, frac, a) => { const n = Math.round(s.length * clamp(frac)); if (n > 0) mono(x, y, s.slice(0, n), a); };
  const flow = (route, t, n, col, r, sp) => { for (let i = 0; i < n; i++) dot(route, ((t * (sp || 0.6) + i / n) % 1), col, r || 5); };

  // ── 1. 같은 설정 한 벌, 서버 2대
  const A = [190, 200], Bs = [770, 200], T1 = [380, 62], T2 = [580, 62];
  function s1(t, c) { const { k, u } = c;
    // 타깃 두 개
    [[T1, 'api-1:9100'], [T2, 'api-2:9100']].forEach(([p, s]) => card(p[0], p[1], 150, 40, { rx: 8, text: s, fs: 14.5, mono: true, stroke: GRID, sw: 1.8 }));
    // 설정 파일: beat 마다 한 줄씩 채워진다
    const fx = 480, fy = 268, fw = 236, fh = 128;
    el('rect', { x: fx - fw / 2, y: fy - fh / 2, width: fw, height: fh, rx: 8, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: k === 0 ? fade(u, 0.1) : 1 });
    tx(fx - fw / 2 + 12, fy - fh / 2 + 20, 'prometheus.yml (한 벌)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: k === 0 ? fade(u, 0.1) : 1 });
    const rows = [[1, 'scrape_interval: 15s'], [1, 'evaluation_interval: 15s'], [2, 'replica: A | B'], [3, 'targets: api-1, api-2']];
    rows.forEach(([kk, s], i) => { if (k < kk) return; typed(fx - fw / 2 + 14, fy - fh / 2 + 46 + i * 22, s, k === kk ? seg(u, 0.2 + (i % 2) * 0.6, 1.0 + (i % 2) * 0.6) : 1, { 'font-size': 13.5, fill: kk === 2 ? ACC : INK, 'font-weight': kk === 2 ? 700 : 400 }); });
    // 파일 → 두 서버 (같은 파일을 읽는다)
    const gl = k === 0 ? E(u, 0.6, 1.4) : 1;
    grow(fx - fw / 2, fy - 20, A[0] + 82, A[1] + 12, gl, GRID, { plain: true, dash: '5 5' });
    grow(fx + fw / 2, fy - 20, Bs[0] - 82, Bs[1] + 12, gl, GRID, { plain: true, dash: '5 5' });
    const dead = k === 5 && u > 0.6;
    prom(A[0], A[1], 'prom-a', { s: k === 0 ? pop(u, 0.2) : 1, dead });
    prom(Bs[0], Bs[1], 'prom-b', { s: k === 0 ? pop(u, 0.35) : 1 });
    // 15초 시계
    if (k >= 1) [[A[0] - 118, A[1]], [Bs[0] + 118, Bs[1]]].forEach(([x, y], i) => { const sw = k === 1 ? (seg(u, 0.4, 2.8) * 2) % 1 : 1;
      if (i === 0 && dead) return; R.clock(x, y, 20, sw, ACC, '15s'); });
    // replica / cluster 라벨
    if (k >= 2) { const s = k === 2 ? pop(u, 0.4) : 1, s2 = k === 2 ? pop(u, 0.9) : 1;
      pill(A[0], A[1] + 56, 'replica="A"', ACC, s, { mono: true }); pill(Bs[0], Bs[1] + 56, 'replica="B"', ACC, s, { mono: true });
      pill(A[0], A[1] + 92, 'cluster="prod"', MUT, s2, { mono: true, fs: 13.5 }); pill(Bs[0], Bs[1] + 92, 'cluster="prod"', MUT, s2, { mono: true, fs: 13.5 }); }
    // 같은 타깃을 각자 긁는다 (pull)
    if (k >= 3) { const lines = [[A, T1], [A, T2], [Bs, T1], [Bs, T2]];
      lines.forEach(([s, d], i) => { const top = [s[0] + (s === A ? 40 : -40), s[1] - 31], bot = [d[0], d[1] + 20], gu = k === 3 ? E(u, 0.2 + i * 0.15, 0.9 + i * 0.15) : 1;
        const off = s === A && dead; if (off) { el('line', { x1: top[0], y1: top[1], x2: bot[0], y2: bot[1], stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 6' }); return; }
        grow(top[0], top[1], bot[0], bot[1], gu, s === A ? ACC : INFO, { plain: true, op: 0.8 });
        if (k > 3 || u > 1.2) flow([bot, top], t, 2, s === A ? ACC : INFO, 4.5, 0.5); });
      sub(480, 152, 'pull · GET /metrics', k === 3 ? fade(u, 1.0) : 1, { 'font-weight': 700, fill: INK }); }
    // 배포: 같은 명령 두 번
    if (k === 4) { const cmd = '$ prometheus --config.file=prometheus.yml';
      typed(A[0] - 168, 380, cmd, seg(u, 0.3, 1.4), { 'font-size': 13.5, fill: INK }); typed(Bs[0] - 168, 380, cmd, seg(u, 1.2, 2.3), { 'font-size': 13.5, fill: INK }); }
    // 공유 스토리지 없음
    if (k <= 3) { const s = k === 0 ? pop(u, 1.4) : 1; pill(480, 392, '공유 스토리지 · 조율 계층', MUT, s, { fs: 13.5 }); el('line', { x1: 380, y1: 392, x2: 580, y2: 392, stroke: BAD, 'stroke-width': 2.5, opacity: s > 0.5 ? (k === 0 ? fade(u, 1.8) : 1) : 0 }); }
    if (k === 5) { if (dead) cross(A[0], A[1], 22, pop(u, 0.6)); banner(480, 392, '조율이 없으니 prom-b 는 하던 수집을 계속한다', pop(u, 1.3)); } }

  // ── 2. 각자 스크랩한 두 벌 — 타임스탬프가 어긋난다
  const T0 = 175, TS = 40, X0 = 140, XW = 660, XT = (v) => X0 + ((v - T0) / TS) * XW, RA_ = 150, RB = 270;
  const SA = [186.114, 201.114], SB = [177.902, 192.902, 207.902], NOW = 212;
  function s2(t, c) { const { k, u } = c;
    [[RA_, 'prom-a', ACC], [RB, 'prom-b', INFO]].forEach(([y, n, col]) => { lbl(70, y + 5, n, 1, { fill: col });
      el('line', { x1: X0, y1: y, x2: X0 + XW, y2: y, stroke: GRID, 'stroke-width': 2 }); });
    [180, 190, 200, 210].forEach((v) => { mono(XT(v), 352, '…' + v, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); el('line', { x1: XT(v), y1: RB + 14, x2: XT(v), y2: 336, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '2 5' }); });
    tx(X0 + XW, 376, '시각 (초, 1723363 다음 자리)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (k === 0) { tx(480, 46, '같은 순간, 두 서버에 같은 질의를 던진다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
      [RA_, RB].forEach((y, i) => sub(X0 + XW / 2, y - 18, '15초마다 스크랩', fade(u, 0.9 + i * 0.4))); }
    // 질의: 범위 벡터 [30s]
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1; pill(480, 42, "up{job='api'}[30s]", ACC, s, { mono: true, fs: 15 });
      const xn = XT(NOW), x30 = XT(NOW - 30), w = k === 1 ? E(u, 0.8, 1.8) : 1;
      [RA_, RB].forEach((y) => el('rect', { x: xn - (xn - x30) * w, y: y - 26, width: (xn - x30) * w, height: 52, rx: 6, fill: ACCBG, opacity: 0.6 }));
      el('line', { x1: xn, y1: 70, x2: xn, y2: 336, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4' }); sub(xn, 86, '질의 시각', 1, { fill: ACC, 'font-weight': 700, 'text-anchor': 'start', x: xn + 6 }); }
    // 샘플 점: prom-a / prom-b
    const samples = (arr, y, col, on, uu) => arr.forEach((v, i) => { const s = on ? pop(uu, 0.2 + i * 0.3) : 1; if (s <= 0) return;
      el('circle', { cx: XT(v), cy: y, r: 7 * s, fill: col }); mono(XT(v), y - 14, '1', { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: Math.min(1, s) }); });
    if (k >= 2) { samples(SA, RA_, ACC, k === 2, u); const op = k === 2 ? fade(u, 1.2) : 1;
      el('circle', { cx: XT(SA[1]), cy: RA_, r: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: op }); mono(XT(SA[1]) - 4, RA_ + 34, 'api-1:9100  1  @…201.114', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: op }); }
    if (k >= 3) { samples(SB, RB, INFO, k === 3, u); const op = k === 3 ? fade(u, 1.4) : 1;
      el('circle', { cx: XT(SB[2]), cy: RB, r: 12, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: op }); mono(XT(SB[2]) - 4, RB + 34, 'api-1:9100  1  @…207.902', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'end', opacity: op }); }
    // 차이 6.788초
    if (k >= 4) { const g = k === 4 ? E(u, 0.2, 1.0) : 1, xa = XT(SA[1]), xb = XT(SB[2]);
      el('line', { x1: xa, y1: RA_ + 12, x2: xa, y2: lerp(RA_ + 12, 318, g), stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': '3 3' });
      el('line', { x1: xb, y1: RB + 12, x2: xb, y2: lerp(RB + 12, 318, g), stroke: INFO, 'stroke-width': 1.8, 'stroke-dasharray': '3 3' });
      if (g > 0.95) { el('path', { d: `M${xa},310 V318 H${xb} V310`, fill: 'none', stroke: INK, 'stroke-width': 2.2 });
        const d = k === 4 ? lerp(0, 6.788, E(u, 1.0, 2.0)) : 6.788; mono((xa + xb) / 2, 336, d.toFixed(3) + '초', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INK }); }
      if (k === 4) sub(480, 400, '값은 둘 다 1, 다른 건 스크랩한 시각뿐이다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }
    // 합치지 않는다: 공유 스토리지는 새 SPOF
    if (k === 5) { [[RA_, ACC, 'TSDB A'], [RB, INFO, 'TSDB B']].forEach(([y, col, n]) => card(880, y, 96, 38, { rx: 8, text: n, fs: 14, stroke: col, s: pop(u, 0.2) }));
      const gs = E(u, 0.7, 1.4); el('line', { x1: 880, y1: RA_ + 19, x2: 880, y2: lerp(RA_ + 19, 196, gs), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      el('line', { x1: 880, y1: RB - 19, x2: 880, y2: lerp(RB - 19, 234, gs), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      card(880, 215, 112, 34, { rx: 8, text: '공유 스토리지', fs: 13.5, stroke: MUT, dash: '5 4', s: pop(u, 1.1) }); cross(946, 215, 11, pop(u, 1.7));
      sub(880, 384, '합치면 새 SPOF', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); } }

  // ── 3. Alertmanager 클러스터 — 알림 2건을 1건으로
  const PA = [118, 110], PB = [118, 300], M1 = [470, 110], M2 = [470, 300], IN = [830, 205];
  function amBox(p, name, s, o) { o = o || {}; card(p[0], p[1], 150, 62, { rx: 10, stroke: o.bad ? BAD : WARN, sw: 2.5, fill: PANEL, s, text: name, fs: 16, fw: 800 }); }
  function inbox(n, col, uu) { card(IN[0], IN[1], 190, 190, { rx: 12, stroke: GRID, sw: 1.8 }); tx(IN[0], IN[1] - 70, '담당자 메신저', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
    for (let i = 0; i < Math.round(n); i++) { const y = IN[1] - 38 + i * 44; el('rect', { x: IN[0] - 76, y, width: 152, height: 34, rx: 8, fill: col === BAD ? BADBG : SOFT, stroke: col, 'stroke-width': 1.8 });
      tx(IN[0] - 64, y + 22, '🔔 HighErrorRate', { 'font-size': 13.5, 'font-weight': 700, fill: col }); }
    mono(IN[0], IN[1] + 82, Math.round(n) + '건 도착', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }
  function s3(t, c) { const { k, u } = c;
    prom(PA[0], PA[1], 'prom-a', { w: 150, sub: 'replica=A' }); prom(PB[0], PB[1], 'prom-b', { w: 150, sub: 'replica=B' });
    if (k === 0) { fly(PA[0] + 76, PA[1], IN[0] - 96, IN[1] - 20, seg(u, 0.3, 1.3), 'HighErrorRate'); fly(PB[0] + 76, PB[1], IN[0] - 96, IN[1] + 24, seg(u, 0.6, 1.6), 'HighErrorRate');
      inbox(u < 1.3 ? 0 : u < 1.6 ? 1 : 2, BAD); sub(300, 205, '같은 규칙을 둘 다 평가한다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    amBox(M1, 'am-1', k === 1 ? pop(u, 0.2) : 1);
    if (k === 1) { pill(M1[0] - 6, M1[1] + 62, ':9093 알림 받기', INK, pop(u, 0.8), { mono: true, fs: 13.5 }); pill(M1[0] + 4, M1[1] + 100, ':9094 gossip', WARN, pop(u, 1.3), { mono: true, fs: 13.5 }); }
    if (k >= 2) { amBox(M2, 'am-2', k === 2 ? pop(u, 0.2) : 1);
      const cut = k === 5, g = k === 2 ? E(u, 0.6, 1.4) : 1, y1 = M1[1] + 31, y2 = M2[1] - 31;
      el('line', { x1: M1[0], y1, x2: M1[0], y2: lerp(y1, y2, g), stroke: cut ? OFF : WARN, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
      if (!cut && (k > 2 || u > 1.4)) { dot([[M1[0], y1], [M1[0], y2]], (t * 0.7) % 1, WARN, 5); dot([[M1[0], y2], [M1[0], y1]], (t * 0.7 + 0.5) % 1, WARN, 5); }
      tx(M1[0] + 14, 210, cut ? 'peer 없음' : 'gossip', { 'font-size': 14, 'font-weight': 700, fill: cut ? BAD : WARN, opacity: k === 2 ? fade(u, 1.2) : 1 });
      if (!cut) sub(M1[0] + 14, 230, '보낸 이력 공유', k === 2 ? fade(u, 1.5) : 1, { 'text-anchor': 'start' });
      if (cut) cross(M1[0], 205, 16, pop(u, 0.4)); }
    // 두 서버 → 두 Alertmanager 모두
    if (k >= 3) { const L = [[PA, M1], [PA, M2], [PB, M1], [PB, M2]];
      L.forEach(([a, b], i) => grow(a[0] + 76, a[1] + (b[1] - a[1]) * 0.12, b[0] - 76, b[1] - (b[1] - a[1]) * 0.12, k === 3 ? E(u, 0.2 + i * 0.2, 0.9 + i * 0.2) : 1, k === 4 ? OFF : MUT, { sw: 2, op: k === 4 ? 0.5 : 1 })); }
    if (k === 3) { pill(300, 180, 'replica="A"', ACC, pop(u, 1.4), { mono: true, fs: 13.5 }); pill(300, 230, 'replica="B"', INFO, pop(u, 1.6), { mono: true, fs: 13.5 });
      inbox(2, BAD); return; }
    // replica 를 떼면 두 알림이 같아진다
    if (k === 4) { const strip = E(u, 0.6, 1.4), merge = E(u, 1.5, 2.2);
      [[ACC, '"A"', -1], [INFO, '"B"', 1]].forEach(([col, r, sgn]) => { if (sgn > 0 && merge > 0.9) return; const y = 205 + sgn * 22 * (1 - merge);
        el('rect', { x: 170, y: y - 16, width: 250, height: 32, rx: 8, fill: PANEL, stroke: merge > 0.9 ? GOOD : INK, 'stroke-width': 1.8 });
        mono(182, y + 5, 'alertname=HighErrorRate', { 'font-size': 13.5, fill: INK });
        mono(lerp(420, 470, strip), y + 5 - strip * 18 * sgn, 'replica=' + r, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: 1 - strip }); });
      if (merge > 0.9) check(150, 205, 9, pop(u, 2.2));
      inbox(u < 2.2 ? 2 : 1, u < 2.2 ? BAD : GOOD); return; }
    inbox(k <= 2 ? 2 : 2, BAD);
    if (k === 5) sub(300, 392, '--cluster.peer 를 빼면 gossip 이 끊긴다', fade(u, 0.8), { fill: BAD, 'font-weight': 700 }); }

  // ── 4. 로드밸런서 뒤에서 조회
  const GF = [120, 170], LB = [430, 170], SA4 = [790, 90], SB4 = [790, 250];
  function s4(t, c) { const { k, u } = c;
    browser(GF[0], GF[1], 170, 110, 'Grafana', {});
    el('polyline', { points: `${GF[0] - 60},${GF[1] + 36} ${GF[0] - 30},${GF[1] + 10} ${GF[0]},${GF[1] + 24} ${GF[0] + 30},${GF[1] - 4} ${GF[0] + 60},${GF[1] + 8}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
    const g0 = k === 0 ? E(u, 0.4, 1.2) : 1; grow(GF[0] + 86, GF[1], LB[0] - 82, LB[1], g0, INK, {});
    card(LB[0], LB[1], 160, 66, { rx: 10, stroke: INK, sw: 2.5, s: k === 0 ? pop(u, 0.2) : 1 }); tx(LB[0], LB[1] - 4, 'prom-lb', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    sub(LB[0], LB[1] + 18, 'nginx', 1);
    const aDead = k >= 4, aOp = k === 0 ? 0.35 : 1;
    prom(SA4[0], SA4[1], 'prom-a', { w: 150, op: aOp, dead: aDead && (k > 4 || u > 1.6) }); prom(SB4[0], SB4[1], 'prom-b', { w: 150, op: aOp });
    if (k === 0) sub(LB[0], LB[1] + 62, 'Grafana 가 아는 주소는 이것 하나', fade(u, 1.3), { 'font-weight': 700, fill: INK });
    if (k >= 1) { const g = k === 1 ? E(u, 0.2, 1.0) : 1;
      [[SA4, aDead && (k > 4 || u > 1.6)], [SB4, false]].forEach(([p, off]) => el('line', { x1: LB[0] + 80, y1: LB[1], x2: lerp(LB[0] + 80, p[0] - 76, g), y2: lerp(LB[1], p[1], g), stroke: off ? OFF : INK, 'stroke-width': 2.2, 'stroke-dasharray': off ? '4 6' : null }));
      [SA4, SB4].forEach((p, i) => mono(p[0] - 76, p[1] + 50, 'max_fails=2 fail_timeout=10s', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 1.0 + i * 0.3) : 1 })); }
    if (k >= 2) pill(LB[0], LB[1] - 56, 'listen 9090', ACC, k === 2 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5 });
    const toA = [[GF[0] + 86, GF[1]], [LB[0] - 80, LB[1]], [LB[0] + 80, LB[1]], [SA4[0] - 76, SA4[1]]], toB = [[GF[0] + 86, GF[1]], [LB[0] - 80, LB[1]], [LB[0] + 80, LB[1]], [SB4[0] - 76, SB4[1]]];
    if (k === 2) { for (let i = 0; i < 4; i++) dot(i % 2 ? toB : toA, seg(u, 0.5 + i * 0.5, 1.5 + i * 0.5), ACC, 6); }
    if (k === 3) { dot(toA, seg(u, 0.2, 1.1), ACC, 7); if (u > 1.1 && u < 1.7) { pill(SA4[0] - 120, SA4[1] - 36, '502', BAD, pop(u, 1.1), { mono: true }); }
      dot([[SA4[0] - 76, SA4[1]], [LB[0] + 80, LB[1]], [SB4[0] - 76, SB4[1]]], seg(u, 1.2, 2.2), BAD, 7);
      if (u > 2.2) check(SB4[0] - 100, SB4[1] - 36, 10, pop(u, 2.2));
      sub(LB[0], LB[1] + 62, 'proxy_next_upstream → 다음 서버로', fade(u, 1.4), { 'font-weight': 700, fill: INK }); }
    if (k === 4) { const f = u < 0.6 ? 0 : u < 1.1 ? 1 : 2; mono(SA4[0], SA4[1] - 46, `실패 ${f} / 2 (10s 안)`, { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      if (u > 1.6) cross(SA4[0], SA4[1], 18, pop(u, 1.6)); for (let i = 0; i < 3; i++) dot(toB, seg(u, 1.6 + i * 0.3, 2.6 + i * 0.3), GOOD, 6); }
    if (k === 5) { for (let i = 0; i < 3; i++) dot(toB, ((t * 0.5 + i / 3) % 1), GOOD, 5);
      // 새로고침마다 다른 서버의 값 — 그래프가 살짝 흔들린다
      const ax = 60, ay = 300, aw = 560, ah = 90; el('rect', { x: ax - 10, y: ay - 26, width: aw + 20, height: ah + 40, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(ax, ay - 8, '같은 패널, 새로고침 두 번', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const curve = (off) => Array.from({ length: 13 }, (_, i) => [ax + i * aw / 12, ay + 58 - 22 * Math.sin(i * 0.7) - (i % 3) * 4 + off]);
      const pa = curve(0), pb = curve(5), g = E(u, 0.3, 1.5), sw = E(u, 1.6, 2.4);
      const draw = (pts, col, op) => { const n = Math.max(2, Math.round(pts.length * g)); el('polyline', { points: pts.slice(0, n).map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.6, opacity: op }); };
      draw(pa, ACC, 1 - sw * 0.7); draw(pb, INFO, 0.3 + sw * 0.7);
      tx(ax + aw - 4, ay - 8, sw < 0.5 ? '응답: prom-a' : '응답: prom-b', { 'font-size': 13.5, 'font-weight': 700, fill: sw < 0.5 ? ACC : INFO, 'text-anchor': 'end' });
      sub(800, 384, '두 벌의 작은 차이 = 정상 비용', fade(u, 2.2), { 'font-weight': 700, fill: INK }); } }

  // ── 5. 함정 정리 — 네 칸이 차례로 채워진다
  function panel(cx, cy, title, s, col) { card(cx, cy, 440, 142, { rx: 12, stroke: col || GRID, sw: 1.8, s }); if (s > 0.6) tx(cx - 204, cy - 46, title, { 'font-size': 15, 'font-weight': 800, fill: col || INK }); }
  function s5(t, c) { const { k, u } = c, P = [[240, 92], [720, 92], [240, 256], [720, 256]];
    const sOf = (i) => (k === i ? pop(u, 0.2) : k > i ? 1 : 0);
    // 1) 리소스 2배
    if (k >= 0) { panel(P[0][0], P[0][1], '① 리소스가 2배', sOf(0), WARN);
      if (sOf(0) > 0.6) ['CPU', 'MEM', 'DISK'].forEach((n, i) => { const y = P[0][1] - 18 + i * 28, x = P[0][0] - 150, g = k === 0 ? E(u, 0.8 + i * 0.2, 1.8 + i * 0.2) : 1;
        tx(x - 12, y + 14, n, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end' });
        el('rect', { x, y, width: 130, height: 18, rx: 4, fill: OFF }); el('rect', { x: x + 132, y, width: 130 * g, height: 18, rx: 4, fill: WARN });
        if (g > 0.95) mono(x + 272, y + 14, '×2', { 'font-size': 14, 'font-weight': 800, fill: WARN }); }); }
    // 2) replica 로 구분
    if (k >= 1) { panel(P[1][0], P[1][1], '② 값이 다른 건 정상', sOf(1), ACC);
      if (sOf(1) > 0.6) [['up{replica="A"}  1  @…201.114', ACC], ['up{replica="B"}  1  @…207.902', INFO]].forEach(([s, col], i) =>
        typed(P[1][0] - 200, P[1][1] - 6 + i * 30, s, k === 1 ? seg(u, 0.7 + i * 0.6, 1.4 + i * 0.6) : 1, { 'font-size': 14, fill: col, 'font-weight': 700 }));
      if (sOf(1) > 0.6) sub(P[1][0], P[1][1] + 56, '라벨이 있어야 어느 서버 값인지 답한다', k === 1 ? fade(u, 2) : 1); }
    // 3) 알림 중복
    if (k >= 2) { panel(P[2][0], P[2][1], '③ 알림은 하나로', sOf(2), BAD);
      if (sOf(2) > 0.6) { card(P[2][0] - 120, P[2][1] + 4, 96, 40, { rx: 8, text: 'am-1', fs: 15, stroke: WARN }); card(P[2][0] + 20, P[2][1] + 4, 96, 40, { rx: 8, text: 'am-2', fs: 15, stroke: WARN });
        el('line', { x1: P[2][0] - 72, y1: P[2][1] + 4, x2: P[2][0] - 28, y2: P[2][1] + 4, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
        if (k > 2 || u > 1.0) cross(P[2][0] - 50, P[2][1] + 4, 9, k === 2 ? pop(u, 1.0) : 1);
        mono(P[2][0] + 90, P[2][1] + 10, '알림 ×2', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: k === 2 ? fade(u, 1.4) : 1 });
        sub(P[2][0], P[2][1] + 52, '--cluster.peer 누락이 가장 흔한 실수', k === 2 ? fade(u, 1.8) : 1); } }
    // 4) 장기 저장은 밖으로
    if (k >= 3) { panel(P[3][0], P[3][1], '④ 장기 저장은 밖으로', sOf(3), INFO);
      if (sOf(3) > 0.6) { card(P[3][0] - 140, P[3][1] + 4, 120, 44, { rx: 8, text: '로컬 TSDB', fs: 14.5, stroke: INK });
        grow(P[3][0] - 78, P[3][1] + 4, P[3][0] + 20, P[3][1] + 4, k === 3 ? E(u, 0.8, 1.6) : 1, ACC, {});
        card(P[3][0] + 110, P[3][1] + 4, 170, 44, { rx: 8, text: 'mimir:9009', fs: 14.5, mono: true, stroke: ACC, s: k === 3 ? pop(u, 1.5) : 1 });
        sub(P[3][0], P[3][1] + 52, 'remote_write 는 V-2-1 에서', k === 3 ? fade(u, 1.9) : 1); } }
    if (k === 4) { banner(480, 372, '동일 설정 2대 + Alertmanager 클러스터 + LB 조회', pop(u, 0.4)); sub(480, 408, '단순함이 곧 튼튼함', fade(u, 1.2), { 'font-weight': 700, fill: INK }); } }

  const quiz = [
    { q: 'Prometheus HA에서 prom-a와 prom-b 설정이 서로 다른 곳은 무엇인가?',
      o: ['scrape_interval 값', 'external_labels의 replica 값', '스크랩할 타깃 목록'], a: 1,
      why: '두 서버는 같은 파일을 쓰고 replica만 A와 B로 다르다. 타깃까지 같아야 한 대가 빠져도 공백이 없다.' },
    { q: '두 서버의 같은 시계열 타임스탬프가 6.8초 어긋나는 까닭은 무엇인가?',
      o: ['한 서버의 시계가 틀려서', '공유 스토리지에 늦게 써서', '각자 다른 시각에 스크랩을 시작해서'], a: 2,
      why: '두 서버는 서로를 모르고 각자 15초 주기로 긁는다. 시작 시각이 달라 201.114와 207.902처럼 어긋나며 이것은 버그가 아니다.' },
    { q: '두 Alertmanager를 묶었는데도 같은 알림이 2건 온다면 무엇을 빠뜨린 것인가?',
      o: ['알림에서 replica 라벨 떼기', 'Grafana 앞 로드밸런서', 'evaluation_interval 맞추기'], a: 0,
      why: 'external_labels는 알림에도 붙는다. replica가 A와 B로 남으면 다른 알림이 되므로 alert_relabel_configs로 떼야 한다.' },
    { q: 'nginx가 prom-a를 upstream에서 빼는 조건은 무엇인가?',
      o: ['10초 안에 2번 실패할 때', '응답이 prom-b보다 느릴 때', 'Grafana가 새로고침할 때'], a: 0,
      why: 'max_fails=2 fail_timeout=10s이다. 그 전에 들어온 요청도 proxy_next_upstream이 502·503이면 prom-b로 다시 보낸다.' },
    { q: '이 HA 구성이 풀지 못하는 문제는 무엇인가?',
      o: ['한 대가 죽었을 때 수집 공백', '같은 알림의 중복 발송', '로컬 TSDB의 짧은 보존 기간'], a: 2,
      why: 'HA는 가용성만 푼다. 오래 보관하려면 remote_write로 Mimir 같은 백엔드에 넘겨야 하며 이는 V-2-1에서 다룬다.' },
  ];

  const summary = [
    'Prometheus 한 대가 죽으면 그동안의 수집이 빈다. 같은 설정의 서버 2대가 같은 타깃을 각자 긁어 공백을 없앤다.',
    '두 서버는 서로를 몰라서 스크랩 시각이 어긋난다. 6.8초 차이 같은 미세한 차이는 정상이고 replica 라벨로 구분한다.',
    '알림은 replica 라벨을 떼고 두 Alertmanager에 모두 보낸다. gossip으로 묶인 Alertmanager가 1건만 발송한다.',
    '조회는 LB 뒤에서 살아 있는 쪽으로 넘어간다. 대가는 리소스 2배이고 장기 보관은 따로 풀어야 한다.',
  ];
  const review = [
    { q: 'prom-a를 재시작하는 동안 대시보드에 빈 구간이 생겼다. 먼저 의심할 것은?',
      o: ['Grafana가 prom-a 주소를 직접 보고 있다', 'prom-b의 scrape_interval이 15s다', '두 서버의 타임스탬프가 어긋나 있다'], a: 0,
      why: '데이터는 prom-b에 그대로 있다. Grafana가 prom-lb 대신 prom-a를 직접 가리키면 페일오버가 일어나지 않는다.' },
    { q: 'HA를 켠 뒤 슬랙에 같은 알림이 두 번씩 온다. am-1과 am-2는 서로 peer로 묶여 있다. 다음으로 볼 곳은?',
      o: ['nginx의 max_fails 값', 'Prometheus의 alert_relabel_configs', 'prom-b의 스크랩 타깃 목록'], a: 1,
      why: 'gossip이 정상이어도 replica=A와 replica=B가 붙은 두 알림은 서로 다른 알림이다. labeldrop으로 replica를 떼야 1건이 된다.' },
    { q: '팀원이 두 서버 값이 다르니 공유 스토리지 하나로 합치자고 한다. 알맞은 답은?',
      o: ['값을 맞추려면 반드시 합쳐야 한다', 'scrape_interval을 1s로 줄이면 같아진다', '그 스토리지가 새 장애점이 되니 두 벌을 둔다'], a: 2,
      why: '공유 스토리지는 새 단일 장애점이 된다. 스크랩 시각이 다른 두 벌은 정상이며 replica 라벨로 어느 쪽 값인지 구분한다.' },
  ];

  R.page({ title: 'Prometheus HA — 같은 설정 2대', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
