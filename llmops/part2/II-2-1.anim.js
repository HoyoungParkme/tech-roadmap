/* II-2-1 A/B 테스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    person, cross, check, clock, lock, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const A = INFO, B = ACC;   // control = A, treatment = B

  function flag(x, y, label, col, s) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s ?? 1})` });
    el('line', { x1: 0, y1: 0, x2: 0, y2: -34, stroke: col, 'stroke-width': 2.5 }, g);
    const w = tw(label, 13.5) + 18; el('path', { d: `M0,-34 H${w} L${w - 8},-25 L${w},-16 H0 Z`, fill: col }, g);
    mono(8, -20.5, label, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL }, g); }
  // 두 버전 카드
  function variants(o) { o = o || {}; [['control', 'v1.0.0', A], ['treatment', 'v2.0.0', B]].forEach(([n, v, col], i) => {
      const y = 110 + i * 150, s = o.s ? o.s(i) : 1; card(o.x || 760, y, 260, 92, { rx: 14, stroke: col, sw: 2.5, fill: i ? ACCBG : INFOBG, s });
      mono((o.x || 760) - 110, y - 8, v, { 'font-size': 18, 'font-weight': 800, opacity: clamp(s) }); pill((o.x || 760) - 50, y + 22, n, col, clamp(s), { mono: true, fs: 14 }); }); }
  // 정규분포 곡선 (평균 m, 표준편차 sd) 을 축 위에
  const npdf = (x, m, sd) => Math.exp(-0.5 * ((x - m) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
  function bell(ax, m, sd, col, u, fill) { const P = []; for (let x = 0.4; x <= 1.3001; x += 0.01) P.push([x, npdf(x, m, sd)]);
    if (fill) { const k = Math.floor(P.length * clamp(u)); if (k > 1) el('path', { d: 'M' + P.slice(0, k).map(([a, b]) => `${ax.X(a)},${ax.Y(b)}`).join(' L') + ` L${ax.X(P[k - 1][0])},${ax.Y(0)} L${ax.X(P[0][0])},${ax.Y(0)} Z`, fill: col, opacity: 0.18 }); }
    line(ax, P, u, col, { sw: 3 }); }

  // ───────── 1. 두 프롬프트 동시 운영 ─────────
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { variants({ s: (i) => pop(u, 0.3 + i * 0.5) });
      tx(300, 160, '같은 이름 customer_bot 아래', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(300, 190, '지금 운영본 옆에 새 후보를 나란히', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) });
      flag(640, 76, 'production', GOOD, pop(u, 1.8)); return; }
    if (k === 1) { variants({});
      card(200, 185, 280, 56, { rx: 10, text: 'get_prompt(variant)', mono: true, fs: 15, stroke: INK, s: pop(u, 0.2) });
      grow(342, 175, 628, 115, seg(u, 0.6, 1.1), A); grow(342, 195, 628, 255, seg(u, 0.9, 1.4), B);
      mono(470, 128, 'tag="control"', { 'font-size': 14, fill: A, 'font-weight': 700, opacity: fade(u, 1.0) }); mono(470, 254, 'tag="treatment"', { 'font-size': 14, fill: B, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(480, 370, '코드에는 프롬프트 본문이 없다 · 태그 이름 하나로 바꿔 낀다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { // 요청이 갈린다
      card(330, 200, 210, 60, { rx: 10, text: 'assign_variant()', mono: true, fs: 15, stroke: INK, s: pop(u, 0.1) });
      for (let i = 0; i < 4; i++) person(60, 70 + i * 95, null, { s: 0.7 });
      const up = [1, 0, 1, 1, 0, 0, 1, 0];
      up.forEach((g, i) => dot([[90, 70 + (i % 4) * 95], [225, 200], [440, 200], [600, g ? 110 : 290], [700, g ? 110 : 290]], seg(u, 0.2 + i * 0.25, 1.0 + i * 0.25), g ? A : B, 7));
      card(780, 110, 200, 64, { rx: 12, text: 'control · v1', fs: 16, stroke: A, color: A, s: pop(u, 0.5) }); card(780, 290, 200, 64, { rx: 12, text: 'treatment · v2', fs: 16, stroke: B, color: B, s: pop(u, 0.7) });
      tx(330, 268, '분기점은 이 한 줄', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    if (k === 3) { const F = [['model', '"gpt-4"', 0], ['context', 'ctx', 0], ['question', 'q', 0], ['system', null, 1]];
      [['control', 'v1.0.0 본문', A], ['treatment', 'v2.0.0 본문', B]].forEach(([n, v, col], j) => { const x = 40 + j * 460;
        el('rect', { x, y: 40, width: 420, height: 270, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2 }); mono(x + 16, 68, n, { 'font-size': 15, 'font-weight': 800, fill: col });
        F.forEach(([a, b, diff], i) => { const y = 112 + i * 52, op = fade(u, 0.2 + i * 0.3);
          if (diff) el('rect', { x: x + 10, y: y - 22, width: 400, height: 38, rx: 6, fill: j ? ACCBG : INFOBG, opacity: op });
          mono(x + 22, y + 4, a, { 'font-size': 15, fill: MUT, opacity: op }); mono(x + 140, y + 4, diff ? v : b, { 'font-size': 15, 'font-weight': diff ? 800 : 400, fill: diff ? col : INK, opacity: op });
          if (!diff) mono(x + 396, y + 4, '=', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.3) }); }); });
      tx(480, 360, '변수를 하나만 남겨야 차이를 프롬프트 탓으로 돌릴 수 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { const F = [['user_id', 'u_31', 0], ['variant', '"treatment"', 2], ['question', '"환불 정책…"', 0], ['answer', '"…"', 0], ['tokens_in', 'usage.prompt_tokens', 1], ['tokens_out', 'usage.completion_tokens', 1], ['latency_ms', 'perf_counter 차이', 1], ['ts', 'now()', 0]];
      el('rect', { x: 120, y: 30, width: 720, height: 340, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); mono(140, 58, 'log_to_warehouse({ … })', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      F.forEach(([a, b, h], i) => { const y = 92 + i * 34, a1 = seg(u, 0.2 + i * 0.2, 0.5 + i * 0.2); if (a1 <= 0) return;
        if (h) el('rect', { x: 132, y: y - 21, width: 696, height: 30, rx: 6, fill: h === 2 ? ACCBG : WARNBG, opacity: a1 });
        mono(150, y, a, { 'font-size': 15, 'font-weight': 700, fill: h === 2 ? ACC : INK, opacity: a1 }); mono(330, y, b, { 'font-size': 15, fill: MUT, opacity: a1 }); });
      tx(940, 250, '지표 세 가지의', { 'text-anchor': 'end', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(940, 272, '재료', { 'text-anchor': 'end', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(480, 400, '로그에 없는 값은 나중에 분석할 수 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    [['한 사용자는 한 그룹', '해시로 고정 배정'], ['충분한 표본', '보통 1000+ 호출 / variant'], ['같은 조건', '모델 · 컨텍스트 · 환경'], ['고정 기간', '보통 1~2주']].forEach(([a, b], i) => {
      const x = 130 + i * 233, s = pop(u, 0.2 + i * 0.35); card(x, 190, 210, 150, { rx: 14, stroke: GOOD, sw: 2, s }); check(x, 145, 13, s);
      tx(x, 200, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: clamp(s) }); tx(x, 228, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); });
    tx(480, 340, '하나만 깨져도 결과를 믿을 수 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); }

  // ───────── 2. 해시 분할 ─────────
  // sha256(id) / 16**64 — python hashlib 로 계산한 값
  const BK = [['user_4', 0.0424], ['user_3', 0.4202], ['user_1', 0.4754], ['user_2', 0.8266], ['alice@…', 0.9983]];
  function numline(ratio, u, o) { o = o || {}; const ax = axes(80, 170, 800, 0, { x: [0, 1], xt: [0, 0.25, 0.5, 0.75, 1] }); const cx = ax.X(ratio);
    el('rect', { x: 80, y: 150, width: cx - 80, height: 20, fill: B, opacity: 0.2 }); el('rect', { x: cx, y: 150, width: 880 - cx, height: 20, fill: A, opacity: 0.15 });
    el('line', { x1: cx, y1: 110, x2: cx, y2: 200, stroke: INK, 'stroke-width': 2.5 }); mono(cx, 100, `ratio ${ratio.toFixed(2)}`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
    BK.forEach(([id, b], i) => { const a = o.show ? o.show(i) : 1; if (a <= 0) return; const col = b < ratio ? B : A, x = ax.X(b);
      el('circle', { cx: x, cy: 160, r: 8 * a, fill: col }); mono(x, 236 + (i % 2) * 22, id, { 'text-anchor': 'middle', 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: clamp(a) }); });
    tx(84, 290, '← treatment', { 'font-size': 14, fill: B, 'font-weight': 700 }); tx(876, 290, 'control →', { 'text-anchor': 'end', 'font-size': 14, fill: A, 'font-weight': 700 }); return ax; }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(480, 120, 'assign_variant(user_id, ratio=0.5)', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, opacity: fade(u, 0.2) });
      [['user_id', '이메일 · UUID', 290], ['ratio', 'treatment 비율', 640]].forEach(([a, b, x], i) => { pill(x, 200, a, i ? ACC : INK, pop(u, 0.7 + i * 0.4), { mono: true, fs: 15 }); tx(x, 240, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9 + i * 0.4) }); });
      const r = lerp(0.5, 0.05, E(u, 1.6, 2.6));
      el('rect', { x: 230, y: 300, width: 500, height: 14, rx: 7, fill: SOFT }); el('rect', { x: 230, y: 300, width: 500 * r, height: 14, rx: 7, fill: ACC });
      el('circle', { cx: 230 + 500 * r, cy: 307, r: 11, fill: PANEL, stroke: ACC, 'stroke-width': 3 }); mono(760, 312, r.toFixed(2), { 'font-size': 16, 'font-weight': 800, fill: ACC });
      tx(480, 360, 'ratio 하나로 노출 비율을 조절한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { numline(0.5, u, { show: (i) => pop(u, 0.4 + i * 0.3) });
      mono(480, 50, 'bucket = int(sha256(id), 16) / 16**64', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      tx(480, 360, '같은 ID 는 늘 같은 점에 떨어진다 · random 과 다른 점', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const days = [[0.05, 'Day 1', 507], [0.25, 'Day 3', 2518], [0.5, 'Day 7', 5021]], ph = Math.min(2, Math.floor(clamp((u - 0.2) / 0.8, 0, 2.99)));
      const r = ph === 0 ? 0.05 : lerp(days[ph - 1][0], days[ph][0], E(u - 0.2 - ph * 0.8, 0, 0.5)); numline(r, u);
      days.forEach(([d, n, cnt], i) => { const on = i <= ph, x = 200 + i * 280; card(x, 360, 240, 56, { rx: 12, stroke: on ? ACC : GRID, sw: 2, op: on ? 1 : 0.4 });
        tx(x - 100, 366, n, { 'font-size': 15, 'font-weight': 800, opacity: on ? 1 : 0.4 }); mono(x + 100, 366, `${cnt.toLocaleString('en-US')} / 10,000`, { 'text-anchor': 'end', 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: on ? 1 : 0.4 }); });
      tx(480, 56, '해시 1만 명에 돌린 treatment 수', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.2) }); return; }
    if (k === 3) { [['치명적 실패 가능성', '처음엔 5% 만 노출', '95% 를 보호'], ['핵심 고객 보호', 'enterprise · VIP 는', 'control 고정'], ['구역 제한', 'KR 만 · 새벽만', '신규 가입자만']].forEach(([a, b, d], i) => {
        const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.45); card(x, 200, 270, 170, { rx: 14, stroke: WARN, sw: 2, s });
        tx(x, 150, a, { 'text-anchor': 'middle', 'font-size': 16.5, 'font-weight': 800, fill: WARN, opacity: clamp(s) });
        tx(x, 205, b, { 'text-anchor': 'middle', 'font-size': 15, opacity: clamp(s) }); tx(x, 232, d, { 'text-anchor': 'middle', 'font-size': 15, opacity: clamp(s) }); });
      tx(480, 350, '실험 전에 뺄 사용자를 먼저 문서로 정한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { person(80, 210, 'user', { s: pop(u, 0.1) });
      el('path', { d: 'M300,150 L380,210 L300,270 L220,210 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.3) }); mono(300, 216, 'vip?', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      grow(110, 210, 214, 210, seg(u, 0.3, 0.7), INK);
      grow(300, 146, 300, 90, seg(u, 0.8, 1.2), A); tx(312, 120, '예', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.9) });
      card(300, 64, 200, 46, { rx: 10, text: 'return "control"', mono: true, fs: 14, stroke: A, color: A, s: pop(u, 1.1) });
      grow(384, 210, 520, 210, seg(u, 1.3, 1.7), B); tx(440, 198, '아니오', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.4) });
      card(700, 210, 340, 56, { rx: 10, text: 'assign_variant(id, CURRENT_RATIO)', mono: true, fs: 14, stroke: B, s: pop(u, 1.7) });
      tx(480, 350, '규칙을 해시 앞에 두면 예외가 코드에 그대로 보인다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k 5: 1만 명 분포 (실행 결과)
    const N = [['control', 4979, A], ['treatment', 5021, B]];
    N.forEach(([n, v, col], i) => { const y = 120 + i * 100; tx(60, y + 16, n, { 'font-size': 16, 'font-weight': 800, fill: col, class: 'mono' });
      hbar(230, y, 560, Math.round(lerp(0, v, E(u, 0.2, 1.6))), 10000, { h: 30, col, text: Math.round(lerp(0, v, E(u, 0.2, 1.6))).toLocaleString('en-US') }); });
    el('line', { x1: 230 + 280, y1: 100, x2: 230 + 280, y2: 270, stroke: INK, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }); mono(510, 92, '5,000', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    mono(480, 330, 'Counter(sample) · 1만 명 실행 결과', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
    tx(480, 366, '거의 50 대 50 · 배포 전에 눈으로 확인한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); }

  // ───────── 3. Quality · Latency · Cost ─────────
  const M = { q: [0.82, 0.89], p95: [1200, 1800], cost: [0.005, 0.008], n: [4979, 5021] };
  function pair(x, y, w, vals, max, fmt, u, lab) { tx(x, y - 16, lab, { 'font-size': 15, 'font-weight': 800 });
    vals.forEach((v, i) => hbar(x, y + i * 40, w, v, max, { h: 26, col: i ? B : A, u: E(u, 0.3 + i * 0.3, 1.2 + i * 0.3), text: fmt(v) })); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { [['컨텍스트', INFO], ['답변', INK], ['기대 답', GOOD]].forEach(([s, col], i) => card(110, 90 + i * 74, 160, 50, { rx: 10, text: s, fs: 15, stroke: col, s: pop(u, 0.2 + i * 0.2) }));
      card(390, 164, 170, 120, { rx: 14, text: '심판 LLM\nrubric 0~10', fs: 15, stroke: WARN, s: pop(u, 0.8) });
      [0, 1, 2].forEach((i) => dot([[190, 90 + i * 74], [305, 164]], seg(u, 0.9 + i * 0.1, 1.4 + i * 0.1), ACC, 6));
      grow(476, 164, 560, 164, seg(u, 1.4, 1.7), MUT); mono(600, 170, '"8"', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, 1.6), 'text-anchor': 'middle' });
      mono(660, 170, '÷ 10 = 0.8', { 'font-size': 16, fill: MUT, opacity: fade(u, 1.8) }); sub(640, 204, '한 건 채점 (예시)', fade(u, 1.8));
      pair(560, 280, 280, M.q, 1, (v) => v.toFixed(2), u > 1.9 ? u - 1.9 + 0.3 : 0, '평균 Quality');
      return; }
    if (k === 1) { const ax = axes(80, 60, 460, 260, { x: [0, 4000], y: [0, 1], xt: [0, 1000, 2000, 3000, 4000], xl: '응답 시간 (ms)' });
      const P = []; for (let x = 100; x <= 4000; x += 50) { const l = Math.log(x / 900); P.push([x, Math.exp(-l * l / 0.32) * 0.95]); }
      line(ax, P, E(u, 0.2, 1.4), MUT, { sw: 2.5 }); sub(310, 80, '분포 모양은 예시 · 오른쪽 꼬리가 길다', fade(u, 0.6));
      [['p50', 900], ['p95', 1800], ['p99', 2700]].forEach(([n, x], i) => { const a = fade(u, 1.0 + i * 0.3); el('line', { x1: ax.X(x), y1: 110, x2: ax.X(x), y2: 320, stroke: i === 1 ? BAD : INK, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: a });
        mono(ax.X(x), 104, n, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: i === 1 ? BAD : INK, opacity: a }); });
      pair(620, 170, 200, M.p95, 2500, (v) => (v / 1000).toFixed(1) + 's', u > 1.6 ? u - 1.6 + 0.3 : 0, 'p95 지연');
      tx(740, 310, '평균은 느린 소수를 감춘다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { mono(480, 70, 'cost = tokens_in × $30/1M + tokens_out × $60/1M', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.1) });
      [['v1', 100, 33, A], ['v2', 200, 33, B]].forEach(([n, ti, to, col], i) => { const y = 150 + i * 100, s = fade(u, 0.5 + i * 0.5);
        mono(60, y + 18, n, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: s });
        el('rect', { x: 110, y, width: ti * 2.2 * E(u, 0.5 + i * 0.5, 1.2 + i * 0.5), height: 28, rx: 4, fill: col, opacity: 0.85 });
        el('rect', { x: 110 + ti * 2.2 + 4, y, width: to * 2.2 * E(u, 0.9 + i * 0.5, 1.4 + i * 0.5), height: 28, rx: 4, fill: WARN, opacity: 0.85 });
        mono(116, y + 50, `in ${ti} · out ${to} 토큰`, { 'font-size': 14, fill: MUT, opacity: s });
        mono(820, y + 20, '$' + (ti * 30 / 1e6 + to * 60 / 1e6).toFixed(3), { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 1.3 + i * 0.5) }); });
      sub(480, 380, '토큰 수는 예시 · 프롬프트가 길어진 만큼 입력 비용이 매 호출 붙는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { for (let i = 0; i < 24; i++) { const g = i % 2 === (i % 5 === 0 ? 0 : 1) ? 1 : 0; dot([[480, 40], [480, 120], [g ? 700 : 260, 250]], seg(u, 0.1 + i * 0.07, 0.8 + i * 0.07), g ? B : A, 6); }
      card(480, 90, 260, 52, { rx: 10, text: 'events (variant 필드)', fs: 15, stroke: INK });
      [['control', 260, 0, A], ['treatment', 700, 1, B]].forEach(([n, x, i, col]) => { el('path', { d: `M${x - 110},250 V340 H${x + 110} V250`, fill: 'none', stroke: col, 'stroke-width': 3 });
        mono(x, 320, 'n=' + Math.round(lerp(0, M.n[i], E(u, 0.6, 2.2))).toLocaleString('en-US'), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col });
        mono(x, 372, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col }); }); return; }
    if (k === 4) { const cols = [80, 300, 440, 610, 780], H = ['variant', 'n', 'quality', 'p95 (ms)', 'avg_cost'];
      el('rect', { x: 50, y: 70, width: 860, height: 190, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      H.forEach((h, i) => mono(cols[i], 106, h, { 'font-size': 14.5, fill: MUT, 'font-weight': 800 })); el('line', { x1: 60, y1: 120, x2: 900, y2: 120, stroke: GRID });
      [['control', A, 0], ['treatment', B, 1]].forEach(([n, col, i]) => { const y = 168 + i * 56, vals = [n, M.n[i].toLocaleString('en-US'), M.q[i].toFixed(2), String(M.p95[i]), '$' + M.cost[i].toFixed(3)];
        vals.forEach((v, j) => mono(cols[j], y, v, { 'font-size': 16, 'font-weight': j === 0 ? 800 : 600, fill: j === 0 ? col : INK, opacity: fade(u, 0.3 + i * 0.4 + j * 0.15) })); });
      tx(480, 320, '그룹마다 한 줄 · 비교표가 저절로 만들어진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 352, '결과 수치는 페이지의 예시', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k 5: trade-off
    [['Quality', '+7%p', '0.82 → 0.89', GOOD, '좋음'], ['Latency p95', '+50%', '1.2s → 1.8s', BAD, '나쁨'], ['Cost / call', '+60%', '$0.005 → $0.008', BAD, '나쁨']].forEach(([a, d, b, col, w], i) => {
      const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4); card(x, 180, 270, 170, { rx: 14, stroke: col, sw: 2.5, s });
      tx(x, 128, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: clamp(s) }); mono(x, 188, d, { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 800, fill: col, opacity: clamp(s) });
      mono(x, 226, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: clamp(s) }); tx(x, 252, w, { 'text-anchor': 'middle', 'font-size': 14, fill: col, 'font-weight': 700, opacity: clamp(s) }); });
    tx(480, 330, '지표 하나로는 판정할 수 없다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.8) });
    sub(480, 362, '품질이 중요한 사용자에게만 v2 를 쓰는 식의 결정이 남는다', fade(u, 2.1), { 'font-size': 14.5 }); }

  // ───────── 4. 통계적 유의성 ─────────
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { const ax = axes(80, 60, 600, 270, { x: [0.4, 1.3], y: [0, 4.4], xt: [0.5, 0.7, 0.82, 0.89, 1.1, 1.3], xl: '품질 점수' });
      bell(ax, 0.82, 0.10, A, k === 0 ? E(u, 0.2, 1.3) : 1, true); bell(ax, 0.89, 0.10, B, k === 0 ? E(u, 0.8, 1.9) : 1, true);
      if (k < 2) mono(ax.X(0.82) - 8, ax.Y(3.99) - 10, 'control', { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 800, fill: A, opacity: k === 0 ? fade(u, 1.2) : 1 });
      if (k < 2) mono(ax.X(0.89) + 8, ax.Y(3.99) - 10, 'treatment', { 'font-size': 14.5, 'font-weight': 800, fill: B, opacity: k === 0 ? fade(u, 1.8) : 1 });
      if (k === 0) { [['평균', '0.82 · 0.89'], ['표준편차', '0.10'], ['표본', '5000개씩']].forEach(([a, b], i) => { tx(730, 130 + i * 56, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5 + i * 0.2) }); mono(730, 154 + i * 56, b, { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.5 + i * 0.2) }); });
        sub(830, 330, 'seed 42 시뮬레이션', fade(u, 2.2)); return; }
      if (k === 1) { card(820, 140, 230, 110, { rx: 14, stroke: GOOD, sw: 2.5, s: pop(u, 0.3) }); mono(820, 128, 't = ' + lerp(0, 34.11, E(u, 0.5, 1.5)).toFixed(2), { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, opacity: fade(u, 0.4) });
        mono(820, 166, 'p < 0.000001', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
        tx(820, 240, '기준 p < 0.05', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
        tx(820, 300, 'p 는 우연일 확률이지', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(820, 324, '좋아진 폭이 아니다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
      // k 2: 효과 크기 = 평균 차 / 표준편차
      const y = ax.Y(4.2); el('line', { x1: ax.X(0.82), y1: y, x2: ax.X(0.89), y2: y, stroke: INK, 'stroke-width': 3, opacity: fade(u, 0.3) });
      mono((ax.X(0.82) + ax.X(0.89)) / 2, y - 10, '0.07', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.4) });
      mono(840, 130, 'd = 평균 차', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.8) }); el('line', { x1: 740, y1: 142, x2: 940, y2: 142, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.9) });
      mono(840, 168, '합친 표준편차', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.0) });
      tx(840, 250, 'n 이 크면 작은 차이도', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); tx(840, 274, 'p < 0.05 가 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) }); return; }
    if (k === 3) { const ax = axes(110, 180, 740, 0, { x: [0, 1.0], xt: [0, 0.2, 0.5, 0.8, 1.0] });
      [[0, 0.2, '무시', GRID], [0.2, 0.5, 'small', INFOBG], [0.5, 0.8, 'medium', ACCBG], [0.8, 1.0, 'large', GOODBG]].forEach(([a, b, n, col], i) => {
        el('rect', { x: ax.X(a), y: 130, width: (ax.X(b) - ax.X(a)) * E(u, 0.1 + i * 0.15, 0.5 + i * 0.15), height: 50, fill: col, opacity: 0.9 });
        tx((ax.X(a) + ax.X(b)) / 2, 112, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4 + i * 0.15) }); });
      const d = lerp(0, 0.68, E(u, 1.0, 2.0)); el('path', { d: `M${ax.X(d)},186 l-10,18 h20 Z`, fill: INK }); el('line', { x1: ax.X(d), y1: 124, x2: ax.X(d), y2: 186, stroke: INK, 'stroke-width': 3 });
      mono(ax.X(d), 236, 'd = ' + d.toFixed(2), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800 });
      tx(480, 320, 'p 도 작고 d 도 medium · 진짜 개선으로 본다', { 'text-anchor': 'middle', 'font-size': 16.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { [['effect_size', '0.3'], ['alpha', '0.05'], ['power', '0.8']].forEach(([a, b], i) => { const y = 90 + i * 62; card(180, y, 260, 48, { rx: 10, stroke: INK, s: pop(u, 0.2 + i * 0.25) });
        mono(70, y + 5, a, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.3 + i * 0.25) }); mono(296, y + 5, b, { 'text-anchor': 'end', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.25) }); grow(312, y, 420, 150, seg(u, 0.9, 1.3), MUT, { plain: true }); });
      card(520, 150, 180, 64, { rx: 12, text: 'tt_ind_solve_power', mono: true, fs: 13.5, stroke: ACC, s: pop(u, 1.2) }); grow(612, 150, 680, 150, seg(u, 1.4, 1.7), ACC);
      mono(800, 160, String(Math.round(lerp(0, 175, E(u, 1.6, 2.4)))), { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: ACC }); tx(800, 196, '호출 / variant', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT });
      tx(480, 320, '목표 N 을 먼저 정해야 언제 멈출지가 정해진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(480, 350, 'statsmodels 실행 결과 175.38', fade(u, 2.4), { 'font-size': 14 }); return; }
    ['표본 수 계산', 'N 까지 안 보기', 't-test + d', 'p<0.05 AND d>0.2', '아니면 보류'].forEach((s, i) => { const x = 100 + i * 190, a = pop(u, 0.2 + i * 0.35);
      card(x, 190, 160, 84, { rx: 12, stroke: i === 4 ? WARN : i === 3 ? GOOD : INK, sw: 2, s: a }); mono(x, 160, String(i + 1), { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: clamp(a) });
      tx(x, 196, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: clamp(a) }); if (i < 4) grow(x + 82, 190, x + 106, 190, seg(u, 0.5 + i * 0.35, 0.8 + i * 0.35), MUT); });
    tx(480, 300, '결과를 보면서 기준을 바꾸지 않는다 (peeking 금지)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ───────── 5. winner 자동 승격 ─────────
  const GATES = [['① 표본', 'min n ≥ 1000'], ['② 유의성', 'p < 0.05'], ['③ 악화 금지', 'p95 · cost'], ['④ 방향', 'treat > ctrl']];
  function gates(on, u, k) { GATES.forEach(([a, b], i) => { const x = 140 + i * 200, st = i < on ? 2 : i === on ? 1 : 0, col = st === 2 ? GOOD : st === 1 ? ACC : GRID;
      card(x, 100, 170, 76, { rx: 12, stroke: col, sw: st ? 2.5 : 1.5, fill: st === 2 ? GOODBG : PANEL });
      tx(x, 96, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: st ? INK : MUT }); mono(x, 120, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      if (st === 2) check(x + 66, 76, 8, 1); if (i < 3) grow(x + 86, 100, x + 114, 100, 1, GRID); });
    card(890, 100, 110, 50, { rx: 25, text: 'winner', fs: 15, fill: on >= 4 ? GOOD : PANEL, stroke: on >= 4 ? 'none' : GRID, color: on >= 4 ? PANEL : MUT }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const L = [['"min_duration":', 'timedelta(days=7)'], ['"min_n":', '1000'], ['"alpha":', '0.05'], ['"primary_metric":', '"quality"']];
      el('rect', { x: 140, y: 50, width: 680, height: 260, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); mono(160, 82, 'EXPERIMENT = {  # 시작 전에 고정', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      L.forEach(([a, b], i) => { const y = 130 + i * 44, s = seg(u, 0.3 + i * 0.35, 0.6 + i * 0.35); mono(190, y, a, { 'font-size': 16, opacity: s }); mono(450, y, b, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: s }); });
      lock(780, 100, true, ACC, pop(u, 1.9)); tx(480, 360, '결과를 보고 기준을 바꾸는 일이 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { [['latency_p95_ms', 1800, 2500, (v) => v + 'ms'], ['cost_per_call', 0.008, 0.015, (v) => '$' + v.toFixed(3)]].forEach(([n, v, lim, f], i) => { const y = 110 + i * 130;
        mono(80, y - 16, n, { 'font-size': 16, 'font-weight': 800 }); el('rect', { x: 80, y, width: 700, height: 34, rx: 6, fill: SOFT });
        el('rect', { x: 80, y, width: 700 * (v / lim) * 0.8 * E(u, 0.4 + i * 0.4, 1.3 + i * 0.4), height: 34, rx: 6, fill: B, opacity: 0.85 });
        el('line', { x1: 80 + 560, y1: y - 10, x2: 640, y2: y + 44, stroke: BAD, 'stroke-width': 3 }); mono(640, y + 64, '상한 ' + f(lim), { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 800 });
        mono(90 + 700 * (v / lim) * 0.8, y + 23, 'treatment ' + f(v), { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: fade(u, 1.2 + i * 0.4) }); });
      tx(480, 380, '품질이 올라도 상한을 넘으면 승격하지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k >= 2 && k <= 5) { const g = k - 2; gates(g + (u > 1.6 ? 1 : 0), u, k);
      const D = [
        () => { [['control', 4979, A], ['treatment', 5021, B]].forEach(([n, v, col], i) => hbar(240, 220 + i * 50, 480, v, 6000, { h: 28, col, u: E(u, 0.2, 1.2), text: v.toLocaleString('en-US') }));
          el('line', { x1: 240 + 480 / 6, y1: 205, x2: 240 + 480 / 6, y2: 310, stroke: BAD, 'stroke-width': 2.5 }); mono(240 + 480 / 6, 336, '1000', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 800 }); },
        () => { mono(480, 250, '_, p = stats.ttest_ind(q_treat, q_ctrl)', { 'text-anchor': 'middle', 'font-size': 16, opacity: fade(u, 0.2) });
          mono(480, 300, 'p < 0.000001  <  alpha 0.05', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) }); },
        () => { [['p95', '1800ms ≤ 2500ms'], ['cost', '$0.008 ≤ $0.015']].forEach(([a, b], i) => { tx(300, 240 + i * 50, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.4) }); mono(380, 240 + i * 50, b, { 'font-size': 18, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.4 + i * 0.4) }); check(660, 234 + i * 50, 9, pop(u, 0.8 + i * 0.4)); }); },
        () => { [['ctrl 평균', 0.82, A], ['treat 평균', 0.89, B]].forEach(([n, v, col], i) => hbar(300, 220 + i * 50, 400, v, 1, { h: 28, col, u: E(u, 0.2 + i * 0.3, 1.0 + i * 0.3), text: v.toFixed(2) }));
          ['ctrl 평균', 'treat 평균'].forEach((n, i) => tx(286, 240 + i * 50, n, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700 }));
          tx(480, 350, 'p 는 차이만 말한다 · 어느 쪽이 나은지는 따로 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); },
      ]; D[g](); sub(480, 400, '조건 값은 페이지의 예시 결과', fade(u, 0.5), { 'font-size': 13.5 }); return; }
    // k 6: 태그 이동
    const m = E(u, 0.4, 1.4);
    [['v1.0.0', A, m < 0.5 ? 'production' : 'archive'], ['v2.0.0', B, m < 0.5 ? 'experimental' : 'production']].forEach(([v, col, tg], i) => { const y = 110 + i * 120;
      card(330, y, 340, 80, { rx: 12, stroke: col, sw: 2.5 }); mono(200, y + 6, v, { 'font-size': 18, 'font-weight': 800 }); pill(400, y, tg, tg === 'production' ? GOOD : tg === 'archive' ? OFF : MUT, 1, { mono: true, fs: 14 }); });
    if (m > 0.05 && m < 0.95) fly(400, 110, 400, 230, m, 'production', { mono: true, fill: GOOD });
    card(760, 170, 280, 60, { rx: 12, text: 'notify_team(Winner promoted)', fs: 14, mono: true, stroke: GOOD, s: pop(u, 1.6) });
    mono(480, 330, '0 9 * * *  python -m experiments.evaluate_all', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
    tx(480, 372, '사람은 실험을 설계하고, 승격은 매일 아침 cron 이 한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'A/B 결과 차이를 프롬프트 탓으로 돌리려면 두 그룹 호출에서 무엇이 달라야 하는가?',
      o: ['모델과 컨텍스트', 'system 프롬프트 하나만', '실험 기간'], a: 1,
      why: 'ab_setup.py는 모델·컨텍스트·질문을 똑같이 두고 system 프롬프트만 바꾼다. 변수가 하나여야 원인이 하나로 좁혀진다.' },
    { q: 'assign_variant가 random.random() 대신 SHA-256 해시를 쓰는 이유는 무엇인가?',
      o: ['같은 사용자가 늘 같은 그룹에 들어가게 하려고', '계산이 더 빨라서', 'treatment 비율을 정확히 50.00%로 맞추려고'], a: 0,
      why: '해시는 같은 ID에 늘 같은 bucket을 준다. 1만 명을 돌려도 4979 대 5021처럼 정확히 반반은 아니다.' },
    { q: 'v2가 품질 0.89로 v1보다 7%p 높을 때 바로 채택하면 안 되는 이유는 무엇인가?',
      o: ['n이 5000을 넘지 않아서', '품질 점수를 LLM이 매겨서 믿을 수 없어서', 'p95 지연이 50%, 비용이 60% 늘었기 때문에'], a: 2,
      why: '품질·지연·비용은 함께 움직인다. 1.2s에서 1.8s, $0.005에서 $0.008로 나빠진 만큼을 같이 따져야 한다.' },
    { q: 'p가 아주 작게 나왔는데도 Cohen\'s d를 따로 보는 이유는 무엇인가?',
      o: ['n이 크면 작은 차이도 p < 0.05가 되기 때문에', 'd가 p보다 계산이 쉬워서', 'p는 0.05보다 크면 계산할 수 없어서'], a: 0,
      why: 'p는 우연일 확률만 말한다. 차이의 크기는 d로 보며, 이 실험은 d = 0.68로 medium이다.' },
    { q: 'evaluate_experiment에서 treatment의 p95가 2.5초를 넘으면 결과는 무엇인가?',
      o: ['winner', 'inconclusive', 'loser'], a: 2,
      why: '조건 3의 guardrail에 걸려 latency 초과로 loser를 돌려준다. 품질이 올라도 승격되지 않는다.' },
  ];

  const summary = [
    'A/B는 운영본 v1과 후보 v2를 같은 조건에 두고 system 프롬프트 하나만 바꿔 돌린다.',
    '사용자는 SHA-256 해시로 나눠 늘 같은 그룹에 두고, 노출은 5%에서 50%로 천천히 올린다.',
    '품질 0.82에서 0.89로 올랐지만 p95 지연 50%, 비용 60%가 함께 늘어 표 하나로 따진다.',
    'p와 d를 같이 보고 표본, 유의성, 악화 금지, 방향을 다 통과할 때만 태그를 옮긴다.',
  ];
  const review = [
    { q: '실험 사흘째 대시보드에서 v2가 앞서 보여 바로 승격하자는 의견이 나왔다. 먼저 확인할 것은?',
      o: ['미리 정한 표본 수와 기간에 도달했는지', 'v2의 프롬프트 길이가 더 긴지', 'Registry 캐시 TTL이 5분인지'], a: 0,
      why: '목표 N에 닿기 전에 결과를 보고 결정하면 peeking이 된다. EXPERIMENT의 min_n과 min_duration을 먼저 채워야 한다.' },
    { q: '같은 사용자가 새로고침할 때마다 다른 답 스타일을 본다는 문의가 왔다. 의심할 곳은?',
      o: ['Cohen\'s d 계산식', '그룹 배정을 해시 대신 매번 random으로 하고 있다', 'guardrail 상한이 너무 낮다'], a: 1,
      why: 'random 배정은 요청마다 그룹이 바뀐다. user_id 해시로 배정해야 한 사용자가 한 variant에 머문다.' },
    { q: 'treatment 품질이 높고 p도 작지만 평균 비용이 $0.016 이었다. auto_promote는 어떻게 판정하나?',
      o: ['winner로 production 태그를 옮긴다', 'inconclusive로 두고 표본을 더 모은다', 'cost 초과로 loser를 돌려준다'], a: 2,
      why: 'cost_per_call 상한이 0.015라서 조건 3에서 걸린다. 주 지표가 좋아도 guardrail을 넘으면 승격하지 않는다.' },
  ];

  R.page({ title: 'A/B 테스트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
