/* V-1-1 rate limiting — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 거부·지연 개수는 nginx limit_req 모듈의 계산식(excess = excess - rate*ms/1000 + 1000, burst 비교)을
 * 파이썬으로 다시 만들어 돌린 결과다. 메모리 수치는 nginx 문서(64비트 상태 128바이트)를 따른다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, person, crowd, server, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ln = (x1, y1, x2, y2, col, sw, dash, op) => el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': sw || 2, 'stroke-dasharray': dash, opacity: op ?? 1 });
  // 코드 조각 칩 (고정폭)
  const chip = (x, y, s, col, sc, o) => { o = o || {}; const w = tw(s, 15) + 22; card(x + w / 2, y, w, 34, { rx: 8, text: s, fs: 15, mono: true, stroke: col, color: col === INK ? INK : col, fill: o.fill || PANEL, sw: 2, s: sc, op: o.op }); return w; };
  function chips(x, y, parts, sc) { let cx = x; const xs = []; parts.forEach(([s, col], i) => { const w = chip(cx, y, s, col, sc ? sc(i) : 1); xs.push(cx + w / 2); cx += w + 12; }); return xs; }

  // 양동이: 위가 넓은 사다리꼴, level 0→1 만큼 물이 찬다. drip 이 있으면 바닥 구멍에서 물방울이 떨어진다
  function bucket(cx, top, w, h, level, o) { o = o || {}; const bw = w * 0.72, bot = top + h, lv = clamp(level);
    const xAt = (y) => { const f = (bot - y) / h; return lerp(bw, w, f) / 2; };
    if (lv > 0) { const wy = bot - lv * h, a = xAt(wy); el('path', { d: `M${cx - bw / 2},${bot} L${cx - a},${wy} L${cx + a},${wy} L${cx + bw / 2},${bot} Z`, fill: o.water || INFO, opacity: 0.55 }); }
    el('path', { d: `M${cx - w / 2},${top} L${cx - bw / 2},${bot} L${cx + bw / 2},${bot} L${cx + w / 2},${top}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 3, 'stroke-linejoin': 'round' });
    el('rect', { x: cx - 7, y: bot - 2, width: 14, height: 6, rx: 2, fill: o.stroke || INK });
    if (o.drip != null) for (let i = 0; i < 3; i++) { const f = (o.drip + i / 3) % 1; el('circle', { cx, cy: bot + 10 + f * 46, r: 5, fill: INFO, opacity: 1 - f * 0.7 }); }
    if (o.label) lbl(cx, top - 14, o.label, 1, { fill: o.stroke || INK }); }
  // 시간축: [m0, m1] ms 를 x..x+w 로. ticks 간격마다 눈금
  function axis(x, y, w, m0, m1, ticks, o) { o = o || {}; const X = (m) => x + ((m - m0) / (m1 - m0)) * w;
    ln(x, y, x + w, y, MUT, 1.8);
    (ticks || []).forEach((m) => { ln(X(m), y, X(m), y + 6, MUT, 1.5); mono(X(m), y + 23, o.fmt ? o.fmt(m) : String(m), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    if (o.unit) tx(x + w + 10, y + 5, o.unit, { 'font-size': 13.5, fill: MUT });
    return X; }
  // 요청 하나의 결과 표시: pass 초록 점, delay 주황 점, reject 빨간 X
  function verdict(x, y, kind, s) { if (s <= 0) return; if (kind === 'R') cross(x, y, 8, s); else el('circle', { cx: x, cy: y, r: 8 * s, fill: kind === 'D' ? WARN : GOOD }); }

  // ---------- 1. zone 정의 ----------
  const Z1 = [['limit_req_zone', INK], ['$binary_remote_addr', INFO], ['zone=per_ip:10m', ACC], ['rate=10r/s', WARN]];
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { const xs = chips(150, 58, Z1, (i) => (k === 0 ? pop(u, 0.2 + i * 0.4) : 1));
      [['키', INFO], ['이름:메모리', ACC], ['평균 속도', WARN]].forEach(([s, col], i) => sub(xs[i + 1], 98, s, k === 0 ? fade(u, 1.8) : 1, { fill: col, 'font-weight': 700 }));
      if (k === 0) { zone(220, 130, 520, 220, '공유 메모리 zone per_ip · 10MB', { stroke: ACC, fill: ACCBG });
        for (let r = 0; r < 6; r++) for (let q = 0; q < 16; q++) { const s = clamp(E(u, 0.6, 2.0) * 6 - r); if (s <= 0) continue;
          el('rect', { x: 240 + q * 30, y: 170 + r * 28, width: 24, height: 20, rx: 3, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: s }); }
        note(480, 390, '아직 빈 칸뿐. location 에서 limit_req 로 불러야 세기 시작한다', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
      // k1: 세 인자의 뜻
      const a = E(u, 0.2, 0.9), b = E(u, 0.9, 1.7), d = E(u, 1.6, 2.5);
      tx(70, 150, '텍스트 $remote_addr', { 'font-size': 14, fill: MUT, opacity: a });
      [...'1.2.3.4'].forEach((ch, i) => card(84 + i * 30, 180, 26, 28, { rx: 4, text: ch, fs: 14, mono: true, stroke: GRID, op: a }));
      mono(300, 186, '7바이트', { 'font-size': 14, fill: MUT, opacity: a });
      tx(70, 236, '$binary_remote_addr', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: a });
      ['01', '02', '03', '04'].forEach((ch, i) => card(92 + i * 46, 266, 40, 30, { rx: 4, text: ch, fs: 14, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.4 + i * 0.12) }));
      mono(300, 272, '4바이트', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: a });
      sub(190, 322, 'IPv6 는 16바이트', a);
      for (let r = 0; r < 6; r++) for (let q = 0; q < 8; q++) { const s = clamp(b * 48 - (r * 8 + q)); el('rect', { x: 400 + q * 22, y: 140 + r * 22, width: 18, height: 18, rx: 2, fill: s > 0 ? ACC : PANEL, stroke: GRID, opacity: 0.25 + 0.75 * Math.max(s, 0.3) }); }
      mono(487, 300, '1MB ≈ 8,192 IP', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: b });
      sub(487, 324, '64비트, 상태 하나 128바이트', b);
      mono(487, 350, '10MB ≈ 8만 IP', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: b });
      sub(487, 372, '32비트면 16만', b);
      const X = axis(640, 260, 270, 0, 1000, [0, 500, 1000], { unit: 'ms' });
      for (let i = 0; i < 10; i++) { const s = clamp(d * 10 - i); if (s > 0) el('circle', { cx: X(i * 100), cy: 236 - (1 - s) * 30, r: 6, fill: WARN, opacity: s }); }
      mono(775, 190, '10r/s = 100ms 에 1개', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: d });
      return; }
    if (k === 2) { tx(60, 52, '같은 1초 안에 통과할 수 있는 자리', { 'font-size': 16, 'font-weight': 700 });
      const X = axis(330, 380, 460, 0, 1000, [0, 500, 1000], { unit: 'ms' });
      const rows = [['api_low', '5r/s', 200, '200ms'], ['per_ip', '10r/s', 100, '100ms'], ['api_high', '100r/s', 10, '10ms'], ['per_token', '60r/m', 1000, '1000ms'], ['global', '1000r/s', 1, '1ms']];
      rows.forEach(([n, r, gap, s], i) => { const y = 100 + i * 52, g = E(u, 0.2 + i * 0.35, 1.0 + i * 0.35), hot = n === 'api_high';
        if (hot) el('rect', { x: 40, y: y - 22, width: 880, height: 40, rx: 8, fill: ACCBG, opacity: fade(u, 2.0) });
        mono(60, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : INK, opacity: fade(u, 0.1 + i * 0.35) });
        mono(200, y + 5, r, { 'font-size': 15, fill: WARN, opacity: fade(u, 0.1 + i * 0.35) });
        ln(330, y, 790, y, GRID, 1.5);
        if (gap === 1) el('rect', { x: 330, y: y - 7, width: 460 * g, height: 14, rx: 3, fill: WARN, opacity: 0.7 });
        else for (let m = 0; m < 1000; m += gap) { if (m / 1000 > g) break; ln(X(m), y - 9, X(m), y + 9, WARN, gap <= 10 ? 1.4 : 3); }
        mono(810, y + 5, s, { 'font-size': 14.5, fill: MUT, opacity: g }); });
      return; }
    if (k === 3) { tx(60, 60, 'r/s 와 r/m 은 같은 양동이를 다르게 적을 뿐이다', { 'font-size': 16, 'font-weight': 700 });
      const X = axis(260, 330, 600, 0, 3000, [0, 1000, 2000, 3000], { unit: 'ms' });
      [['rate=1r/s', 150], ['rate=60r/m', 220]].forEach(([s, y], i) => { mono(60, y + 5, s, { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2 + i * 0.6) }); ln(260, y, 860, y, GRID, 1.5);
        [0, 1000, 2000, 3000].forEach((m, j) => { const s2 = pop(u, 0.4 + i * 0.6 + j * 0.12); el('circle', { cx: X(m), cy: y, r: 9 * s2, fill: WARN }); }); });
      for (const m of [0, 1000, 2000, 3000]) ln(X(m), 160, X(m), 210, GOOD, 2, '4 4', fade(u, 1.8));
      sub(560, 280, '두 줄 모두 1000ms 에 1개', fade(u, 1.8), { fill: GOOD, 'font-weight': 700, 'font-size': 15 });
      note(60, 400, '로그인처럼 1초에 한 번도 안 되는 동작은 5r/m (12초에 1개) 처럼 적는다', fade(u, 2.3), { fill: MUT });
      return; }
    if (k === 4) { // leaky bucket
      const arr = [0.3, 0.55, 0.75, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5], cap = 5, leak = (x) => Math.max(0, Math.floor((x - 0.3) / 0.45));
      let acc = 0; const fate = arr.map((a) => { if (acc - Math.min(acc, leak(a + 0.25)) >= cap) return 'R'; acc++; return 'P'; });
      const accepted = arr.filter((a, i) => u >= a + 0.25 && fate[i] === 'P').length, lvl = clamp((accepted - Math.min(accepted, leak(u))) / cap);
      bucket(480, 140, 210, 190, lvl, { drip: u > 0.3 ? t * 1.6 : null, label: '양동이 = burst' });
      arr.forEach((a, i) => { const f = seg(u, a, a + 0.25); if (f <= 0) return;
        if (fate[i] === 'P') { if (f < 1) el('circle', { cx: 480 + ((i % 3) - 1) * 30, cy: lerp(60, 150, f), r: 8, fill: INFO }); }
        else { const g = seg(u, a, a + 0.7); el('circle', { cx: lerp(480, 700, g), cy: lerp(80, 150, g) - Math.sin(g * Math.PI) * 30, r: 8, fill: BAD, opacity: 1 - g * 0.3 }); } });
      if (arr.some((a, i) => fate[i] === 'R' && u >= a + 0.7)) mono(720, 150, '429', { 'font-size': 18, 'font-weight': 800, fill: BAD });
      note(170, 90, '요청 = 물', fade(u, 0.2), { fill: INFO, 'font-size': 16 }); grow(260, 86, 420, 86, E(u, 0.3, 0.8), INFO);
      note(560, 400, '구멍 = rate · 100ms 에 1개씩 샌다', fade(u, 0.9), { fill: INFO });
      note(680, 220, '가득 차면 넘친 요청은 거부', fade(u, 1.6), { fill: BAD });
      return; }
    // k5: 메모리
    tx(60, 52, 'zone 10MB = 1MB 칸 10개', { 'font-size': 16, 'font-weight': 700 });
    const fill = E(u, 0.2, 1.4);
    for (let col = 0; col < 10; col++) for (let r = 0; r < 7; r++) { const i = col * 7 + r, s = clamp(fill * 70 - i);
      const evict = i === 0 && u > 1.6, fresh = i === 0 && u > 2.0;
      el('rect', { x: 90 + col * 56, y: 80 + r * 30, width: 48, height: 24, rx: 3, fill: fresh ? GOOD : evict ? WARN : s > 0 ? ACC : PANEL, stroke: GRID, opacity: s > 0 ? 0.35 + 0.5 * s : 1 }); }
    for (let col = 0; col < 10; col++) mono(114 + col * 56, 310, '1MB', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    mono(720, 110, '1MB ≈ 8,192 IP', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
    sub(800, 134, '64비트 · 상태 128바이트', fade(u, 0.6));
    mono(720, 180, '10MB ≈ 81,920', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) });
    sub(800, 204, '32비트면 163,840', fade(u, 1.0));
    if (u > 1.6) { fly(114, 92, 114, 30, seg(u, 1.6, 2.2), '가장 오래된 IP 밀려남', { fill: WARN }); }
    note(90, 360, '가득 차면 가장 오래 안 쓴 IP 부터 지운다', fade(u, 1.7), { fill: WARN });
    note(90, 392, '그래도 새 칸을 못 만들면 그 요청은 오류(기본 503)', fade(u, 2.3), { fill: BAD }); }
  const fly = R.fly;

  // ---------- 2. 키 고르기 ----------
  // 오른쪽 zone 카운터: rows [[key, level, col]]
  function counters(x, y, rows, title, o) { o = o || {}; zone(x, y, 300, 40 + rows.length * 46, title, { stroke: o.stroke || GRID, fill: PANEL });
    rows.forEach(([key, lv, col, op], i) => { const yy = y + 52 + i * 46;
      mono(x + 16, yy + 5, key, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: op ?? 1 });
      el('rect', { x: x + 196, y: yy - 9, width: 88, height: 18, rx: 4, fill: SOFT, opacity: op ?? 1 }); el('rect', { x: x + 196, y: yy - 9, width: 88 * clamp(lv), height: 18, rx: 4, fill: lv >= 1 ? BAD : col || INFO, opacity: op ?? 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const ips = ['1.2.3.4', '5.6.7.8', '9.9.9.9'];
      ips.forEach((ip, i) => { const y = 90 + i * 90; person(90, y, null, { s: pop(u, 0.1 + i * 0.15) }); mono(140, y + 5, ip, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.15) });
        dot([[230, y], [600, 120 + i * 46]], seg(u, 0.6 + i * 0.25, 1.5 + i * 0.25), INFO, 7); });
      counters(600, 50, ips.map((ip, i) => [ip, E(u, 1.4 + i * 0.25, 2.0 + i * 0.25) * 0.3, INFO]), 'zone per_ip · 키마다 따로 센다');
      note(60, 400, 'IP 는 로그인 안 한 사용자까지 덮는 유일한 키다', fade(u, 2.2), { fill: MUT });
      return; }
    if (k === 1) { const who = [['Bearer eyJa…', true], ['Bearer eyJb…', true], ['토큰 없음', false]];
      who.forEach(([s, ok], i) => { const y = 90 + i * 90; person(80, y, null, { s: pop(u, 0.1 + i * 0.15), stroke: ok ? INK : WARN }); mono(122, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: ok ? INK : WARN, opacity: fade(u, 0.2 + i * 0.15) });
        if (ok) dot([[250, y], [600, 120 + i * 46]], seg(u, 0.6 + i * 0.25, 1.5 + i * 0.25), INFO, 7); });
      counters(600, 50, [['eyJa…', E(u, 1.4, 2) * 0.4, INFO], ['eyJb…', E(u, 1.6, 2.2) * 0.4, INFO]], 'zone per_token · 60r/m');
      ln(250, 270, 880, 330, WARN, 2.5, '7 6', fade(u, 1.2)); dot([[250, 270], [880, 330]], seg(u, 1.2, 2.4), WARN, 7);
      tx(470, 340, '키가 빈 값이면 아예 세지 않는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(470, 364, '토큰 없는 요청은 한도 없이 백엔드로', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.1) });
      return; }
    if (k === 2) { person(90, 120, '브라우저 사용자', { s: pop(u, 0.1) }); server(90, 290, null, { s: 0.7 * pop(u, 0.3) }); lbl(90, 350, '서버 간 호출', fade(u, 0.3));
      pill(270, 120, 'Cookie: user_id=42', INFO, pop(u, 0.6), { mono: true, fs: 13.5 }); pill(270, 290, 'X-Api-Key: k_9f…', ACC, pop(u, 0.8), { mono: true, fs: 13.5 });
      dot([[380, 120], [580, 120]], seg(u, 1.0, 1.8), INFO, 7); dot([[380, 290], [580, 290]], seg(u, 1.2, 2.0), ACC, 7);
      counters(580, 60, [['42', E(u, 1.8, 2.4) * 0.3, INFO]], 'per_user · 10r/s', { stroke: INFO });
      counters(580, 230, [['k_9f…', E(u, 2.0, 2.6) * 0.1, ACC]], 'per_api_key · 100r/s', { stroke: ACC });
      return; }
    if (k === 3) { // map 으로 키 고르기
      const D = [480, 200]; el('path', { d: `M${D[0]},${D[1] - 70} L${D[0] + 130},${D[1]} L${D[0]},${D[1] + 70} L${D[0] - 130},${D[1]} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      tx(D[0], D[1] - 6, 'Authorization 이', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(D[0], D[1] + 18, '~Bearer ?', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.2) });
      pill(150, 130, 'Bearer eyJa…', INFO, pop(u, 0.4), { mono: true, fs: 13.5 }); pill(150, 270, '헤더 없음 · 1.2.3.4', WARN, pop(u, 0.6), { fs: 13.5 });
      grow(240, 140, 360, 180, E(u, 0.7, 1.1), MUT); grow(250, 260, 360, 220, E(u, 0.9, 1.3), MUT);
      grow(610, 200, 700, 120, E(u, 1.2, 1.6), INFO); grow(610, 200, 700, 290, E(u, 1.4, 1.8), WARN);
      tx(640, 140, '예', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.4) }); tx(640, 275, 'default', { 'font-size': 14, fill: WARN, opacity: fade(u, 1.6) });
      card(810, 110, 200, 52, { text: '$rate_key = 토큰', fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 1.6) });
      card(810, 300, 200, 52, { text: '$rate_key = IP', fs: 14.5, stroke: WARN, color: WARN, s: pop(u, 1.8) });
      note(480, 395, 'zone=smart 20r/s 하나가 두 경우를 다 센다', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT });
      return; }
    if (k === 4) { for (let i = 0; i < 6; i++) { const y = 70 + i * 52; person(80, y, null, { s: 0.7 * pop(u, 0.1 + i * 0.08) }); dot([[110, y], [560, 200]], ((t * 0.7 + i / 6) % 1) * (u > 0.6 ? 1 : 0), INFO, 6); }
      bucket(680, 120, 200, 170, 0.35 + 0.2 * Math.sin(t * 2), { drip: t * 3, label: 'global · 1000r/s', stroke: ACC });
      card(680, 360, 260, 38, { rx: 19, text: '키 = $server_name (하나뿐)', fs: 14, stroke: ACC, color: ACC, s: pop(u, 1.0) });
      note(150, 400, 'IP 마다 따로 세는 zone 과 함께 걸어 서버 전체 상한으로 쓴다', fade(u, 1.8), { fill: MUT });
      return; }
    if (k === 5) { crowd(90, 190, 14, '서로 다른 사용자'); server(330, 190, 'CDN edge', { s: pop(u, 0.2) });
      for (let i = 0; i < 6; i++) dot([[130, 190], [270, 190]], (t * 0.9 + i / 6) % 1, INFO, 5);
      dot([[390, 190], [560, 190]], u > 0.5 ? (t * 1.2) % 1 : 0, INFO, 6);
      counters(580, 120, [['104.16.0.1', clamp(E(u, 0.6, 1.6) * 1.2), BAD]], 'nginx 가 보는 키 = CDN IP', { stroke: BAD });
      if (u > 1.4) { const g = seg(u, 1.4, 2.0); el('circle', { cx: lerp(560, 360, g), cy: 270, r: 7, fill: BAD }); mono(330, 300, '429', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
      tx(580, 300, '정상 사용자까지 한 키로 묶여 거부', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      card(480, 380, 520, 40, { rx: 20, text: 'set_real_ip_from + real_ip_header 로 원래 IP 를 먼저 복원', fs: 14.5, stroke: GOOD, color: GOOD, s: pop(u, 2.1) });
      return; }
    // k6: IPv6 /64
    tx(60, 54, 'IPv6 주소 128비트 = 16비트 묶음 8개', { 'font-size': 16, 'font-weight': 700 });
    const head = ['2001', 'db8', 'abcd', '12'], tails = [['1', '0', '0', '5'], ['9f2c', '77', 'a1', '3'], ['44', 'beef', '0', '1d']];
    tails.forEach((tl, r) => { const y = 110 + r * 70, s = pop(u, 0.2 + r * 0.4);
      head.concat(tl).forEach((g, i) => card(90 + i * 82 + (i >= 4 ? 16 : 0), y, 74, 40, { rx: 6, text: g, fs: 15, mono: true, stroke: i < 4 ? ACC : GRID, color: i < 4 ? ACC : MUT, fill: i < 4 ? ACCBG : PANEL, s }));
      grow(770, y, 820, y, E(u, 1.2 + r * 0.2, 1.6 + r * 0.2), ACC); });
    card(880, 180, 110, 60, { text: '키 하나', fs: 15, stroke: ACC, color: ACC, s: pop(u, 1.9) });
    sub(250, 340, '앞 4묶음 = /64 · 한 가입자 망', fade(u, 0.8), { fill: ACC, 'font-weight': 700 });
    sub(590, 340, '뒤 64비트는 사용자가 마음대로 바꾼다', fade(u, 1.0));
    note(60, 395, 'map 으로 /64 를 뽑아 그 값을 키로 쓴다', fade(u, 2.2), { fill: MUT }); }

  // ---------- 3. location 에 적용 (burst 없음) ----------
  function tree(k, u) { // 왼쪽 설정 트리
    const on = (i) => (i === k ? ACC : INK);
    zone(24, 40, 400, 340, 'http', { stroke: GRID, fill: PANEL });
    mono(44, 86, 'limit_req_zone … per_ip 10r/s;', { 'font-size': 14, fill: k === 0 ? ACC : MUT });
    const sv = k === 0 ? E(u, 0.6, 1.4) : 1; if (sv <= 0) return;
    zone(44, 104, 360, 260 * sv, 'server  api.example.com', { stroke: k === 0 ? ACC : GRID, fill: SOFT });
    if (sv < 1) return;
    if (k >= 1) { mono(62, 154, 'limit_req_status 429;', { 'font-size': 14, fill: on(1) }); mono(62, 180, 'limit_req_log_level warn;', { 'font-size': 14, fill: on(1) }); }
    if (k >= 2) { const s = k === 2 ? E(u, 0.2, 0.9) : 1; zone(62, 200, 324, 140 * s, 'location /api/', { stroke: k === 2 ? ACC : GRID, fill: PANEL });
      if (s >= 1) { mono(80, 252, 'limit_req zone=per_ip;', { 'font-size': 14, 'font-weight': 700, fill: on(2) }); mono(80, 278, 'proxy_pass http://backend;', { 'font-size': 14, fill: MUT }); sub(224, 316, 'burst 없음 = 엄격 모드', 1, { fill: WARN, 'font-weight': 700 }); } } }
  // 시뮬레이션 결과 (10r/s, burst 0)
  const EVEN11 = [[0, 'P'], [91, 'R'], [182, 'P'], [273, 'R'], [364, 'P'], [455, 'R'], [545, 'P'], [636, 'R'], [727, 'P'], [818, 'R'], [909, 'P']];
  const FAST5 = [[0, 'P'], [20, 'R'], [40, 'R'], [60, 'R'], [80, 'R']];
  function s3(t, c) { const { k, u } = c;
    if (k <= 2 || k === 5) tree(k === 5 ? 9 : k, u);
    if (k === 0) { server(700, 200, 'api.example.com', { s: pop(u, 1.2) }); note(560, 330, 'zone 은 http, 적용은 location', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 1) { const f = E(u, 0.6, 1.3);
      card(690, 130, 340, 64, { text: '503 Service Unavailable', fs: 17, mono: true, stroke: MUT, color: MUT, op: 1 - f * 0.6 });
      if (f > 0.5) ln(530, 130, 850, 130, BAD, 3, null, f);
      card(690, 230, 340, 64, { text: '429 Too Many Requests', fs: 17, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.2) });
      note(520, 310, '503 은 "서버 고장", 429 는 "너무 빠름"', fade(u, 1.7));
      note(520, 340, '거부는 warn 으로 error.log 에 남는다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 2) { bucket(690, 150, 160, 24, 0, { label: '양동이 0칸' });
      const X = axis(500, 300, 400, 0, 500, [0, 100, 200, 300, 400, 500], { unit: 'ms' });
      for (let m = 0; m <= 500; m += 100) el('rect', { x: X(m) - 6, y: 262, width: 12, height: 26, rx: 3, fill: GOOD, opacity: fade(u, 0.8 + m / 500) });
      sub(700, 240, '100ms 마다 한 자리만', fade(u, 1.6), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 3 || k === 4) { const data = k === 3 ? EVEN11 : FAST5, m1 = k === 3 ? 1000 : 200;
      tx(60, 56, k === 3 ? '1초에 11개를 고르게 (91ms 간격)' : '자동완성 요청 5개가 100ms 안에', { 'font-size': 17, 'font-weight': 700 });
      const X = axis(100, 250, 760, 0, m1, k === 3 ? [0, 200, 400, 600, 800, 1000] : [0, 50, 100, 150, 200], { unit: 'ms' });
      if (k === 3) for (let m = 0; m <= 1000; m += 100) ln(X(m), 120, X(m), 250, GOOD, 1.5, '3 5', fade(u, 0.2));
      else { ln(X(100), 120, X(100), 250, GOOD, 1.5, '3 5', fade(u, 0.2)); sub(X(100), 112, '다음 자리', fade(u, 0.2), { fill: GOOD }); }
      data.forEach(([m, v], i) => { const a = 0.3 + i * (k === 3 ? 0.15 : 0.3), s = pop(u, a);
        el('circle', { cx: X(m), cy: lerp(110, 200, clamp(s)), r: 7, fill: INFO, opacity: clamp(s) * (1 - fade(u, a + 0.4)) });
        verdict(X(m), 200, v, pop(u, a + 0.4)); });
      const P = data.filter((d) => d[1] === 'P').length, Rj = data.length - P;
      mono(100, 330, `통과 ${P}`, { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) });
      mono(250, 330, `429 ${Rj}`, { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) });
      note(400, 330, k === 3 ? '평균 11rps 인데 절반 가까이 거부' : '사람 눈에는 "검색이 고장났다"', fade(u, 2.3), { fill: MUT });
      sub(480, 400, 'nginx limit_req 계산식을 그대로 재현해 센 결과', fade(u, 2.3)); return; }
    if (k === 5) { [['burst 는 기본으로 붙인다', GOOD], ['API 마다 zone 을 따로', INFO], ['/login 은 따로 강하게', WARN]].forEach(([s, col], i) => {
        card(690, 110 + i * 90, 400, 62, { text: s, fs: 16, stroke: col, color: col, s: pop(u, 0.3 + i * 0.4) }); });
      note(500, 390, '엄격 모드는 봇 차단용, 사람이 쓰는 길에는 burst', fade(u, 2.0), { fill: MUT }); return; }
    // k6: 로그
    terminal(60, 90, 840, 200, ['$ tail -f /var/log/nginx/error.log', ['[warn] 12345#67890: limiting requests,', 'var(--term)'], ['  excess: 1.000 by zone "per_ip", client: 1.2.3.4', 'var(--term)']], E(u, 0.2, 1.8) * 3, { title: 'error.log', fs: 15 });
    [['excess', 330, 'rate 를 넘은 양'], ['zone', 590, '어느 한도'], ['client', 800, '누가']].forEach(([s, x, d], i) => { sub(x, 330, d, fade(u, 1.9 + i * 0.2), { fill: ACC, 'font-weight': 700, 'font-size': 15 }); });
    sub(480, 392, '로그 줄은 코드 주석의 예시', fade(u, 2.3)); }

  // ---------- 4. burst · nodelay · delay ----------
  // 동시에 25개가 올 때 (10r/s, burst 20): 시뮬레이션 결과
  const FATE = { burst: { P: 1, D: 20, R: 4, wait: 100 }, nodelay: { P: 21, D: 0, R: 4 }, delay: { P: 11, D: 10, R: 4, wait: 100 } };
  function lane25(f, u, y) { // 요청 25칸: 즉시(초록) · 지연(주황) · 거부(빨강)
    for (let i = 0; i < 25; i++) { const kind = i < f.P ? 'P' : i < f.P + f.D ? 'D' : 'R', s = pop(u, 0.2 + i * 0.04, 0.4);
      const col = kind === 'P' ? GOOD : kind === 'D' ? WARN : BAD;
      card(70 + i * 34, y, 28, 34, { rx: 4, text: String(i + 1), fs: 13.5, mono: true, fw: 700, stroke: col, color: kind === 'P' ? PANEL : col, fill: kind === 'P' ? GOOD : kind === 'D' ? WARNBG : BADBG, s }); }
    mono(70, y + 44, `즉시 ${f.P}`, { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
    mono(200, y + 44, `지연 ${f.D}`, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
    mono(330, y + 44, `429 ${f.R}`, { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); }
  function departures(f, u, y) { // 통과 시각 (ms)
    const X = axis(70, y, 800, 0, 2000, [0, 500, 1000, 1500, 2000], { unit: 'ms' }); const g = E(u, 1.3, 2.6);
    for (let i = 0; i < f.P; i++) el('circle', { cx: X(0), cy: y - 14 - (i % 6) * 9, r: 5, fill: GOOD, opacity: fade(u, 1.2) });
    for (let j = 1; j <= f.D; j++) { const m = j * f.wait; if (m <= g * f.D * f.wait) el('circle', { cx: X(m), cy: y - 14, r: 6, fill: WARN }); }
    if (f.D) mono(X(f.D * f.wait), y - 34, `${f.D * f.wait}ms`, { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.4) }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(480, 60, 'limit_req_zone … rate=10r/s;   limit_req_status 429;', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.2) });
      [['/api/normal', 'burst=20', WARN], ['/api/fast', 'burst=20 nodelay', GOOD], ['/api/smart', 'burst=20 delay=10', INFO]].forEach(([p, o, col], i) => {
        const y = 140 + i * 80, s = pop(u, 0.5 + i * 0.4); card(250, y, 260, 52, { text: 'location ' + p, fs: 15, mono: true, s }); grow(385, y, 520, y, E(u, 0.8 + i * 0.4, 1.2 + i * 0.4), col);
        card(680, y, 290, 52, { text: 'limit_req … ' + o, fs: 14.5, mono: true, stroke: col, color: col, s: pop(u, 1.0 + i * 0.4) }); });
      note(480, 400, 'zone 은 그대로, limit_req 뒤 옵션만 바꿔 비교한다', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k >= 1 && k <= 3) { const key = ['', 'burst', 'nodelay', 'delay'][k], f = FATE[key];
      tx(60, 50, ['', 'burst=20 · 같은 IP 에서 25개가 동시에', 'burst=20 nodelay · 같은 25개', 'burst=20 delay=10 · 같은 25개'][k], { 'font-size': 17, 'font-weight': 700 });
      lane25(f, u, 110);
      if (k === 2) { tx(500, 168, '양동이 20칸', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
        for (let i = 0; i < 20; i++) { const back = clamp((u - 1.6) * 6 - i); el('rect', { x: 600 + i * 15, y: 156, width: 12, height: 16, rx: 2, fill: back > 0 ? PANEL : WARN, stroke: WARN, opacity: fade(u, 1.4) }); }
        sub(750, 196, '빈칸은 100ms 마다 1칸씩 회복', fade(u, 1.8), { fill: WARN }); }
      departures(f, u, 330);
      sub(480, 404, ['', '나머지 20개는 100ms 간격으로 천천히 나간다', '21개가 기다림 없이 통과, 평균은 그대로 10rps', '11개 즉시, 10개는 지연, 그 뒤는 거부'][k], fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 600 }); return; }
    if (k === 4) { tx(60, 50, '자동완성 5요청이 100ms 안에 (0·20·40·60·80ms)', { 'font-size': 17, 'font-weight': 700 });
      const L = [['burst 없음', [[0, 'P'], [20, 'R'], [40, 'R'], [60, 'R'], [80, 'R']], '429 4개', BAD], ['burst=20', [[0, 'P', 0], [20, 'D', 100], [40, 'D', 200], [60, 'D', 300], [80, 'D', 400]], '최대 320ms 대기', WARN], ['nodelay', [[0, 'P'], [20, 'P'], [40, 'P'], [60, 'P'], [80, 'P']], '대기 0', GOOD]];
      L.forEach(([name, ev, res, col], r) => { const y = 120 + r * 90, X = (m) => 230 + m * 1.1;
        mono(60, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + r * 0.5) }); ln(230, y, 700, y, GRID, 1.5, null, fade(u, 0.2 + r * 0.5));
        ev.forEach(([m, v, out], i) => { const s = pop(u, 0.4 + r * 0.5 + i * 0.08); if (v === 'D') { el('circle', { cx: X(m), cy: y, r: 5, fill: OFF, opacity: s }); ln(X(m), y, X(out), y - 18, WARN, 1.5, null, s); verdict(X(out), y - 18, 'D', s); } else verdict(X(m), y, v, s); });
        mono(730, y + 5, res, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.8 + r * 0.2) }); });
      axis(230, 380, 440, 0, 400, [0, 100, 200, 300, 400], { unit: 'ms' }); return; }
    // k5: 용도별 권장값
    tx(60, 50, '용도별 권장 조합', { 'font-size': 17, 'font-weight': 700 });
    [['검색 · 자동완성', 'rate=10r/s burst=20 nodelay', 0.5, INFO], ['일반 API', 'rate=30r/s burst=50 nodelay', 0.9, GOOD], ['로그인', 'rate=5r/m burst=5', 0.25, WARN], ['정적 자산', '제한 없음', 0, MUT]].forEach(([n, o, lv, col], i) => {
      const y = 110 + i * 76, s = pop(u, 0.3 + i * 0.4); tx(60, y + 6, n, { 'font-size': 16, 'font-weight': 700, opacity: s });
      mono(250, y + 6, o, { 'font-size': 15, fill: col, opacity: fade(u, 0.4 + i * 0.4) });
      if (lv > 0) bucket(800, y - 22, 60 + lv * 40, 40, 0.5, { stroke: col }); else tx(790, y + 6, '—', { 'font-size': 18, fill: MUT, opacity: s }); }); }

  // ---------- 5. 운영 종합 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['login', '5r/m', '12초에 1개', WARN, 0.18], ['api', '30r/s', '33ms 에 1개', GOOD, 0.5], ['search', '10r/s', '100ms 에 1개', INFO, 0.35], ['global', '1000r/s', '1ms 에 1개', ACC, 0.6]].forEach(([n, r, d, col, lv], i) => {
        const cx = 140 + i * 225, s = E(u, 0.2 + i * 0.4, 0.8 + i * 0.4); if (s <= 0) return;
        bucket(cx, 130, 130, 140 * s, 0.4 * s, { stroke: col, drip: s >= 1 ? t * (0.6 + i * 0.5) : null });
        mono(cx, 100, n, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); mono(cx, 350, r, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.4) });
        sub(cx, 376, d, fade(u, 0.7 + i * 0.4)); });
      return; }
    if (k === 1) { const nodes = [['http', 480, 80], ['server', 480, 170], ['= /login', 180, 290], ['/api/search', 400, 290], ['/api/', 600, 290], ['/assets/', 800, 290]];
      nodes.forEach(([n, x, y], i) => { const s = pop(u, 0.1 + i * 0.12); card(x, y, i < 2 ? 160 : 150, 44, { text: n, fs: 15, mono: true, s, stroke: i === 0 ? ACC : INK, color: i === 0 ? ACC : INK }); });
      ln(480, 102, 480, 148, MUT, 2, null, fade(u, 0.4)); [180, 400, 600, 800].forEach((x) => ln(480, 192, x, 268, MUT, 2, null, fade(u, 0.7)));
      mono(600, 85, 'limit_req_status 429;', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.3) });
      [480, 180, 400, 600, 800].forEach((x, i) => { const y = i === 0 ? 170 : 290; const g = seg(u, 0.9 + i * 0.2, 1.4 + i * 0.2); if (g > 0) pill(x, y + 44, '429', ACC, spring(g), { fs: 13.5, mono: true }); });
      note(480, 400, '위에 한 번 쓰면 아래 블록이 모두 물려받는다', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 2) { pill(150, 70, 'POST /login × 10 (동시에)', INK, pop(u, 0.2), { mono: true, fs: 14 });
      card(150, 160, 200, 44, { text: 'location = /login', fs: 14.5, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.5) }); grow(150, 88, 150, 136, E(u, 0.4, 0.7), MUT);
      bucket(470, 110, 150, 120, E(u, 0.9, 1.6) * 0.9, { stroke: WARN, label: 'login · burst 5' });
      for (let i = 0; i < 10; i++) { const ok = i < 6, s = pop(u, 1.0 + i * 0.12); card(650 + (i % 5) * 54, 140 + Math.floor(i / 5) * 56, 46, 42, { rx: 6, text: ok ? '통과' : '429', fs: 13.5, fw: 700, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, s }); }
      note(640, 290, '1 + burst 5 = 6개만 즉시 통과', fade(u, 2.0), { fill: GOOD }); note(640, 320, '그 뒤는 12초에 1개씩만', fade(u, 2.2), { fill: WARN });
      sub(480, 400, '같은 계산식으로 센 결과 · 무차별 대입은 분당 5번으로 묶인다', fade(u, 2.3)); return; }
    if (k === 3) { pill(160, 70, 'GET /api/search?q=ng…', INK, pop(u, 0.2), { mono: true, fs: 14 });
      card(160, 160, 220, 44, { text: 'location /api/search', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.5) }); grow(160, 88, 160, 136, E(u, 0.4, 0.7), MUT);
      bucket(480, 110, 200, 140, E(u, 0.9, 1.5) * 0.22, { stroke: INFO, label: 'search · burst 20 nodelay' });
      for (let i = 0; i < 5; i++) { const s = pop(u, 1.0 + i * 0.15); card(680 + i * 50, 170, 42, 42, { rx: 6, text: '✓', fs: 16, fw: 800, stroke: GOOD, color: GOOD, s }); }
      note(660, 240, '자동완성 5개가 모두 기다림 없이', fade(u, 1.9), { fill: GOOD });
      note(80, 380, '사용자 입력에 바로 반응하는 길은 burst 를 넉넉히', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 4) { pill(130, 70, 'GET /api/orders', INK, pop(u, 0.2), { mono: true, fs: 14 });
      bucket(380, 120, 150, 130, 0.45, { stroke: GOOD, label: 'api · burst 50' }); bucket(650, 120, 150, 130, 0.3, { stroke: ACC, label: 'global' });
      const route = [[130, 90], [130, 280], [380, 280], [650, 280], [870, 280]]; dot(route, seg(u, 0.4, 2.2), INFO, 8);
      [380, 650].forEach((x, i) => { if (u > 0.9 + i * 0.6) check(x, 300, 12, pop(u, 0.9 + i * 0.6)); });
      server(870, 180, 'backend', { s: 0.8 });
      note(200, 360, '두 zone 을 모두 통과해야 백엔드로 간다', fade(u, 2.0)); note(200, 392, '둘 중 하나만 넘쳐도 429', fade(u, 2.3), { fill: BAD }); return; }
    if (k === 5) { pill(150, 90, 'GET /assets/app.3f9a.js', INK, pop(u, 0.2), { mono: true, fs: 14 });
      card(150, 180, 200, 44, { text: 'location /assets/', fs: 14.5, mono: true, s: pop(u, 0.5) });
      ln(260, 180, 840, 180, GOOD, 3, null, fade(u, 0.8)); dot([[260, 180], [840, 180]], seg(u, 0.9, 1.8), GOOD, 8);
      tx(560, 160, 'limit_req 없음 · 양동이를 거치지 않는다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      card(560, 290, 560, 46, { text: 'Cache-Control: public, max-age=31536000, immutable', fs: 14, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.6) });
      note(560, 360, '페이지 하나에 파일 수십 개, 제한하면 한도가 금세 동난다', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 6) { card(170, 120, 230, 52, { text: 'limit_req 거부', fs: 15, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      grow(290, 120, 380, 120, E(u, 0.4, 0.8), BAD); card(500, 120, 220, 52, { text: 'error_page 429 =\n@rate_limit', fs: 14, mono: true, s: pop(u, 0.7) });
      const s = pop(u, 1.2); card(480, 280, 640, 150, { rx: 10, stroke: INK, s });
      if (s > 0.6) { mono(180, 236, 'HTTP/1.1 429 Too Many Requests', { 'font-size': 15, 'font-weight': 800, fill: BAD });
        mono(180, 262, 'Retry-After: 60', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
        mono(180, 288, 'Content-Type: application/json', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.7) });
        mono(180, 322, '{"error":"rate_limit_exceeded","retry_after":60}', { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.9) }); }
      note(480, 395, '클라이언트가 60초 뒤에 다시 오면 된다는 것을 안다', fade(u, 2.3), { 'text-anchor': 'middle', fill: MUT }); return; }
    // k7: 거부율 감시 (값은 예시)
    const L = [['PASSED', GOOD], ['PASSED', GOOD], ['DELAYED', WARN], ['PASSED', GOOD], ['REJECTED', BAD], ['PASSED', GOOD]];
    tx(60, 52, 'access 로그에 $limit_req_status', { 'font-size': 16, 'font-weight': 700 });
    L.forEach(([s, col], i) => { const op = fade(u, 0.2 + i * 0.2); mono(60, 92 + i * 30, `"/api/…" 2xx  ${s}`, { 'font-size': 14.5, fill: col, opacity: op }); });
    const v = E(u, 1.2, 2.2) * 0.6; tx(560, 110, 'REJECTED 비율', { 'font-size': 15, 'font-weight': 700 });
    el('rect', { x: 560, y: 130, width: 340, height: 26, rx: 5, fill: SOFT }); el('rect', { x: 560, y: 130, width: 340 * v / 2, height: 26, rx: 5, fill: GOOD });
    ln(560 + 340 / 2, 120, 560 + 340 / 2, 168, BAD, 2.5); mono(560 + 170, 190, '알람 1%', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
    mono(560, 230, (v).toFixed(1) + '% · 예시', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
    note(560, 300, '1% 를 넘으면 한도가 너무 빡빡하지 않은지', fade(u, 2.0)); note(560, 326, '정상 사용자 차단부터 의심한다', fade(u, 2.2)); }
  const spring = R.spring;

  const quiz = [
    { q: 'limit_req_zone만 http 블록에 적고 location에는 아무것도 안 적었다. 요청은 어떻게 되는가?',
      o: ['10r/s를 넘는 요청이 모두 429를 받는다', '아무것도 제한되지 않는다', 'nginx가 설정 오류로 시작하지 않는다'], a: 1,
      why: 'zone은 카운터를 담을 공유 메모리를 만들 뿐이다. location에서 limit_req zone=per_ip로 불러야 세기 시작한다.' },
    { q: 'Authorization 헤더를 키로 쓴 zone에서, 토큰 없이 온 요청은 어떻게 되는가?',
      o: ['모두 한 키로 묶여 같이 제한된다', '바로 429를 받는다', '키가 비어 아예 세지 않고 그대로 통과한다'], a: 2,
      why: 'nginx는 키가 빈 요청을 세지 않는다. 그래서 map으로 토큰이 없으면 IP를 쓰게 하는 fallback이 필요하다.' },
    { q: 'rate=10r/s, burst 없이 걸었을 때 자동완성 요청 5개가 100ms 안에 오면 몇 개가 통과하는가?',
      o: ['1개', '5개', '10개'], a: 0,
      why: '10r/s는 100ms에 1개라는 뜻이다. 양동이가 0칸이라 첫 요청 뒤 100ms 안에 온 4개는 기다림 없이 429를 받는다.' },
    { q: 'rate=10r/s burst=20 nodelay에 같은 IP에서 25개가 동시에 오면 결과는?',
      o: ['10개 통과, 15개 거부', '21개 즉시 통과, 4개 거부', '25개 모두 100ms 간격으로 지연 통과'], a: 1,
      why: '첫 요청 1개에 burst 20칸을 더해 21개가 기다림 없이 나가고, 넘친 4개는 거부된다. 빈칸은 100ms마다 하나씩 돌아온다.' },
    { q: '/api/에 limit_req를 두 번(zone=api, zone=global) 걸면 언제 429가 나가는가?',
      o: ['두 zone이 모두 넘쳤을 때만', '마지막에 적은 zone만 본다', '둘 중 하나라도 넘치면'], a: 2,
      why: '같은 location의 limit_req 들은 동시에 검사된다. IP 한도와 서버 전체 한도 중 하나만 넘어도 거부된다.' },
  ];

  const summary = [
    'limit_req_zone은 키별 카운터를 담는 공유 메모리다. location에서 limit_req로 불러야 동작한다.',
    '10r/s는 100ms에 1개라는 뜻이라 burst가 없으면 100ms 안의 두 번째 요청부터 429다.',
    'burst는 양동이 칸 수다. nodelay를 붙이면 1 + burst 개가 기다림 없이 나간다.',
    '로그인은 분당 5회로 조이고 정적 자산은 풀어 두며, REJECTED 비율로 한도를 다시 본다.',
  ];
  const review = [
    { q: 'CDN 뒤에 nginx를 두고 IP 별 10r/s를 걸었더니 정상 사용자가 429를 자주 받는다. 먼저 의심할 것은?',
      o: ['rate 값이 너무 크다', '모든 요청의 키가 CDN edge IP로 묶였다', 'zone 메모리 10m이 너무 크다'], a: 1,
      why: '프록시 뒤에서는 $binary_remote_addr가 CDN 주소가 된다. set_real_ip_from과 real_ip_header로 원래 IP를 복원한 뒤 세야 한다.' },
    { q: '검색 API에 burst=20만 걸었더니 거부는 사라졌지만 "검색이 느리다"는 말이 나온다. 무엇을 더하면 되는가?',
      o: ['nodelay를 붙인다', 'burst를 0으로 줄인다', 'limit_req_status를 503으로 되돌린다'], a: 0,
      why: 'burst만 주면 넘친 요청이 100ms 간격으로 줄을 서서 늦게 나간다. nodelay를 붙이면 burst 안의 요청은 바로 통과한다.' },
    { q: '로그인 API를 rate=5r/m burst=5 nodelay로 묶었다. 공격자가 같은 IP로 10번을 한꺼번에 보내면?',
      o: ['10번 모두 통과한다', '5번 통과하고 5번 거부된다', '6번 통과하고 4번 거부된다'], a: 2,
      why: '첫 요청 1개와 burst 5칸이 즉시 나가고 나머지 4개는 거부된다. 그 뒤로는 12초에 1번만 시도할 수 있다.' },
  ];

  R.page({ title: 'rate limit 양동이', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
