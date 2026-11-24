/* III-1-2 로드 밸런싱 알고리즘 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, crowd, cross, check, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  function ngx(cx, cy, o) { o = o || {}; const w = o.w || 112, h = o.h || 60;
    const g = card(cx, cy, w, h, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: o.s, op: o.op });
    tx(0, o.sub ? -3 : 6, 'nginx', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC }, g);
    if (o.sub) mono(0, 17, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  function node(cx, cy, name, o) { o = o || {}; const w = o.w || 112, h = 42, col = o.bad ? BAD : o.hot ? ACC : INK;
    const g = card(cx, cy, w, h, { rx: 8, stroke: col, sw: o.hot || o.bad ? 3 : 2, fill: o.hot ? ACCBG : o.bad ? C.BADBG : PANEL, s: o.s, op: o.op });
    el('circle', { cx: -w / 2 + 14, cy: 0, r: 5, fill: o.bad ? BAD : GOOD }, g);
    mono(-w / 2 + 26, 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: col }, g); return g; }
  // 현재 연결 수 막대: 앞 beat 값에서 이어진다
  function conns(x, y, v, max, o) { o = o || {}; const w = o.w || 230, h = 18;
    el('rect', { x, y: y - h / 2, width: w, height: h, rx: 4, fill: SOFT });
    el('rect', { x, y: y - h / 2, width: Math.max(2, w * clamp(v / max)), height: h, rx: 4, fill: o.col || (o.hot ? ACC : OFF) });
    mono(x + w + 10, y + 5, o.text != null ? o.text : String(Math.round(v)), { 'font-size': 15, 'font-weight': 800, fill: o.hot ? ACC : INK }); }
  // nginx ip_hash 계산 그대로: 앞 세 옥텟, h = (h*113 + b) % 6271, 초기값 89 (ngx_http_upstream_ip_hash_module.c)
  function ipHash(ip) { const a = ip.split('.').map(Number).slice(0, 3); let h = 89; const steps = [];
    a.forEach((b) => { h = (h * 113 + b) % 6271; steps.push(h); }); return { steps, h }; }
  // 결정적 난수 (그림이 매 프레임 같도록)
  function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

  const YS = [110, 210, 310], NX = 230, DX = 470, BX = 548;

  // ---------- 1. least_conn ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || b;
    if (k <= 2) {
      if (k === 0) snippet(24, 24, ['upstream backend {', '    least_conn;', '    server app1~3:8000;', '}'].slice(0, 1 + Math.floor(E(u, 0.2, 1.4) * 3)), { fs: 14 });
      ngx(NX, 210, { sub: 'least_conn', s: k === 0 ? pop(u, 0.4) : 1 });
      const vs = b.nodes.map((n, i) => tween(p.nodes[i] && p.nodes[i].conns, n.conns, u)), min = vs.indexOf(Math.min(...vs));
      const pick = k >= 1 && u > 1.0;
      b.nodes.forEach((n, i) => { node(DX, YS[i], n.name, { hot: pick && i === min, s: k === 0 ? pop(u, 0.6 + i * 0.2) : 1 });
        conns(BX, YS[i], vs[i], 15, { hot: pick && i === min }); });
      mono(BX, 64, '처리 중인 연결 수', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      if (k >= 1) { grow(NX + 58, 210, DX - 58, YS[min], E(u, 1.0, 1.6), ACC);
        dot([[40, 210], [NX - 56, 210]], seg(u, 0.2, 0.8), ACC, 7); dot([[NX + 58, 210], [DX - 58, YS[min]]], seg(u, 1.6, 2.3), ACC, 7);
        person(40, 280, null, { s: 0.8 }); }
      if (k === 1) tx(BX + 120, 380, '12 / 8 / 5 중 가장 적은 app3', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      if (k === 2) ['느린 쿼리', '외부 API', 'AI 추론'].forEach((s, i) => pill(170 + i * 130, 380, s, WARN, pop(u, 0.4 + i * 0.3), { fs: 14 }));
      return; }
    if (k === 3) { // RR 과 비교
      const st = [12, 8, 5];
      [['round-robin', '정해진 차례', 0, BAD], ['least_conn', '지금 연결 수', 2, ACC]].forEach(([h, d, pickI, col], r) => { const y0 = 70 + r * 170, s = pop(u, 0.2 + r * 0.6);
        zone(30, y0 - 40, 900, 150, null, { fill: SOFT, stroke: r ? ACC : GRID, sw: 2, op: s });
        mono(50, y0 - 12, h, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: s }); tx(50, y0 + 14, d, { 'font-size': 14, fill: MUT, opacity: s });
        st.forEach((v, i) => { const cx = 330 + i * 200; node(cx, y0 + 16, 'app' + (i + 1), { w: 96, hot: r === 1 && u > 1.2 + r * 0.3 && i === pickI, bad: r === 0 && u > 1.2 && i === pickI, op: s });
          mono(cx, y0 + 60, v + '개', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: s }); });
        tx(910, y0 + 22, r ? '덜 바쁜 곳' : '바빠도 차례', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.4 + r * 0.3) }); });
      tx(480, 400, '처리 시간이 고르면 두 방식의 결과는 거의 같다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    // k === 4 weight 와 함께
    ngx(NX, 210, { sub: 'least_conn' });
    const rows = [['app1', 2, 12], ['app2', 1, 8]];
    rows.forEach(([n, w, v], i) => { const y = 140 + i * 140, sc = v / w, win = i === 0;
      node(DX, y, `${n} w=${w}`, { w: 130, hot: win && u > 1.8, s: pop(u, 0.2 + i * 0.2) });
      const op = fade(u, 0.6 + i * 0.3);
      mono(DX + 100, y + 6, `${v} 연결`, { 'font-size': 16, opacity: op });
      mono(DX + 210, y + 6, `÷ ${w}`, { 'font-size': 16, fill: MUT, opacity: fade(u, 1.0 + i * 0.3) });
      mono(DX + 290, y + 6, `= ${sc}`, { 'font-size': 20, 'font-weight': 800, fill: win ? ACC : INK, opacity: fade(u, 1.4 + i * 0.2) }); });
    grow(NX + 58, 200, DX - 66, 140, E(u, 1.8, 2.3), ACC);
    tx(DX + 210, 390, '6 < 8 이라 app1 을 고른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) });
  }

  // ---------- 2. ip_hash ----------
  const IP = '203.0.113.45';
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || b;
    if (k === 1) { const { steps, h } = ipHash(IP), oct = IP.split('.');
      // IP 쪼개기
      oct.forEach((o, i) => { const s = pop(u, 0.2 + i * 0.1); card(110 + i * 92, 70, 76, 40, { rx: 8, text: o, fs: 17, mono: true, s, stroke: i < 3 ? ACC : GRID, color: i < 3 ? INK : OFF }); });
      if (u > 0.6) { cross(110 + 3 * 92, 70, 12, pop(u, 0.6)); sub(110 + 3 * 92, 108, '쓰지 않음', fade(u, 0.7), { fill: BAD }); }
      sub(202, 30, '앞 세 옥텟만 쓴다 (IPv4)', fade(u, 0.3), { 'font-weight': 700, fill: INK });
      let prev = 89; steps.forEach((v, i) => { const y = 160 + i * 52, op = fade(u, 0.8 + i * 0.35);
        R.spans(60, y, [['h = (', { fill: MUT }], [String(prev), {}], [' × 113 + ', { fill: MUT }], [oct[i], { fill: ACC, 'font-weight': 800 }], [') mod 6271 = ', { fill: MUT }], [String(v), { 'font-weight': 800 }]], { 'font-size': 16, opacity: op }); prev = v; });
      R.spans(60, 330, [['노드 = ', { fill: MUT }], [String(h), { 'font-weight': 800 }], [' mod 3 = ', { fill: MUT }], [String(h % 3), { 'font-weight': 800, fill: ACC }]], { 'font-size': 18, opacity: fade(u, 2.0) });
      sub(170, 372, '처음 h = 89 (nginx 소스의 시작값)', fade(u, 0.8));
      ['app1', 'app2', 'app3'].forEach((n, i) => node(800, YS[i], n + ':8000', { w: 140, hot: i === h % 3 && u > 2.2 }));
      grow(330, 324, 726, YS[h % 3] + 10, E(u, 2.1, 2.6), ACC);
      return; }
    if (k === 5) { // CDN 뒤
      person(60, 210, null, {}); sub(60, 268, '203.0.113.45', 1, { class: 'mono', fill: INK });
      card(250, 210, 120, 60, { rx: 12, text: 'CDN', fs: 17, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      ngx(470, 210, { sub: 'ip_hash' }); node(800, 210, 'app1:8000', { w: 140, hot: u > 2.3 });
      grow(88, 210, 188, 210, E(u, 0.2, 0.5), MUT); grow(312, 210, 412, 210, E(u, 0.5, 0.8), MUT); grow(528, 210, 728, 210, E(u, 2.1, 2.5), ACC);
      const sw = E(u, 1.2, 1.8);
      card(470, 110, 300, 64, { rx: 10, stroke: sw < 0.5 ? BAD : GOOD, sw: 2, s: pop(u, 0.8) });
      if (u > 0.9) { tx(330, 98, '$remote_addr', { 'font-size': 13.5, fill: MUT, class: 'mono' });
        mono(470, 128, sw < 0.5 ? '173.245.48.10 (CDN)' : '203.0.113.45 (진짜)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: sw < 0.5 ? BAD : GOOD, opacity: Math.abs(sw - 0.5) * 2 }); }
      mono(470, 316, 'set_real_ip_from 173.245.48.0/20;', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.0) });
      mono(470, 342, 'real_ip_header CF-Connecting-IP;', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.2) });
      sub(470, 384, 'CDN IP 는 예시. 복원하지 않으면 모든 사용자가 CDN 몇 개 IP 로 보인다', fade(u, 2.2), { 'font-size': 14 });
      return; }
    // k 0, 2, 3, 4 : 노드와 연결 수
    ngx(NX, 210, { sub: 'ip_hash', s: k === 0 ? pop(u, 0.3) : 1 });
    const vs = b.nodes.map((n, i) => tween(p.nodes[i] && p.nodes[i].conns, n.conns, u)), max = 34;
    b.nodes.forEach((n, i) => { node(DX, YS[i], n.name, { hot: k !== 4 && k !== 0 && i === 0, bad: k === 3 && i === 0 && u > 1.2 }); conns(BX, YS[i], vs[i], max, { hot: k !== 4 && k !== 0 && i === 0, col: k === 3 && i === 0 ? BAD : null }); });
    mono(BX, 64, '처리 중인 연결 수 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k === 0) { snippet(24, 24, ['upstream backend {', '    ip_hash;', '}'].slice(0, 1 + Math.floor(E(u, 0.2, 1.2) * 2)), { fs: 14 });
      tx(NX, 300, '고르는 기준 = 클라이언트 IP', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { person(50, 210, null, {}); sub(50, 270, IP, 1, { class: 'mono', fill: INK });
      for (let j = 0; j < 3; j++) dot([[76, 210], [NX - 56, 210], [NX + 56, 210], [DX - 56, YS[0]]], seg(u, 0.2 + j * 0.5, 0.9 + j * 0.5), ACC, 6);
      [['세션', 0.9], ['캐시', 1.5]].forEach(([s, a], i) => pill(DX - 110, YS[0] - 20 + i * 36, s, GOOD, pop(u, a), { fs: 13.5 }));
      tx(NX, 330, '같은 IP 는 늘 app1', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { crowd(60, 200, 24, 'NAT 뒤 사무실'); sub(60, 278, '외부 IP 1개', 1, { 'font-weight': 700 });
      for (let j = 0; j < 8; j++) dot([[100, 200], [NX - 56, 210], [NX + 56, 210], [DX - 56, YS[0]]], (t * 0.6 + j / 8) % 1, BAD, 5);
      card(NX, 340, 250, 56, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 1.6) });
      if (u > 1.7) { tx(NX, 336, '노드를 3 → 4대로 늘리면', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); tx(NX, 358, 'IP 대역의 약 75% 가 다른 노드로', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN }); }
      return; }
    // k === 4 세션을 밖으로
    card(NX, 340, 200, 56, { rx: 10, text: 'Redis / JWT', fs: 16, stroke: GOOD, color: GOOD, s: pop(u, 0.4) });
    for (let j = 0; j < 6; j++) { const w = j % 3; dot([[40, 210], [NX - 56, 210], [NX + 56, 210], [DX - 56, YS[w]]], (t * 0.7 + j / 6) % 1, ACC, 5); }
    tx(NX, 110, '노드가 상태를 갖지 않으면', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    tx(NX, 134, '알고리즘을 마음대로 고른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
  }

  // ---------- 3. weight ----------
  const WRR6 = [0, 0, 1, 0, 2, 0];   // weight 4:1:1 에 nginx smooth WRR 를 그대로 돌린 순서 (sim.py)
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) {
      const W = [4, 1, 1];
      W.forEach((w, i) => { const y = YS[i]; node(160, y, `app${i + 1} w=${w}`, { w: 140, hot: k === 1 && u > 0.3 && WRR6[Math.min(5, Math.floor(seg(u, 0.3, 2.4) * 6))] === i });
        for (let j = 0; j < w; j++) el('rect', { x: 250 + j * 30, y: y - 12, width: 24, height: 24, rx: 4, fill: ACC, opacity: k === 0 ? fade(u, 0.3 + i * 0.25 + j * 0.1) : 1 }); });
      const tot = k === 0 ? Math.round(tween(3, 6, u)) : 6;
      card(310, 390, 200, 38, { rx: 19, fill: INK, stroke: 'none', text: `총 가중치 ${tot}`, fs: 15, color: PANEL, mono: true });
      if (k === 1) { tx(470, 60, '요청 6개가 가는 곳', { 'font-size': 15, 'font-weight': 700, fill: MUT });
        WRR6.forEach((w, j) => { const a = 0.3 + j * 0.35, s = pop(u, a), x = 500 + j * 72;
          mono(x, 98, String(j + 1), { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
          card(x, 140, 62, 40, { rx: 8, text: 'app' + (w + 1), fs: 14, mono: true, s, stroke: w === 0 ? ACC : INK, fill: w === 0 ? ACCBG : PANEL, color: w === 0 ? ACC : INK }); });
        const cnt = [0, 0, 0]; WRR6.forEach((w, j) => { if (u > 0.3 + j * 0.35 + 0.3) cnt[w]++; });
        cnt.forEach((n, i) => { el('rect', { x: 500, y: 214 + i * 50, width: 60 * n, height: 26, rx: 4, fill: i === 0 ? ACC : OFF }); mono(510 + 60 * n, 233 + i * 50, `app${i + 1}  ${n}`, { 'font-size': 15, 'font-weight': 700 }); });
        tx(690, 384, '4 : 1 : 1, 한쪽으로 몰아 보내지 않고 섞는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.4) }); }
      return; }
    if (k === 2) { // 쓰임새 넷
      const uses = [['스펙 차이', '8 core : 4 core', [2, 1]], ['Canary', 'v1 : v2', [9, 1]], ['A/B 테스트', 'A : B', [90, 10]], ['데이터센터', '메인 : 보조', [70, 30]]];
      uses.forEach(([h, d, r], i) => { const y = 70 + i * 86, s = E(u, 0.2 + i * 0.4, 0.9 + i * 0.4), tot = r[0] + r[1];
        tx(40, y + 6, h, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) }); tx(40, y + 30, d, { 'font-size': 13.5, fill: MUT, class: 'mono', opacity: fade(u, 0.2 + i * 0.4) });
        el('rect', { x: 260, y: y - 10, width: 560 * s * r[0] / tot, height: 30, rx: 4, fill: ACC });
        el('rect', { x: 260 + 560 * s * r[0] / tot, y: y - 10, width: 560 * s * r[1] / tot, height: 30, rx: 4, fill: WARN });
        mono(840, y + 11, `${r[0]}:${r[1]}`, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8 + i * 0.4) }); });
      tx(480, 404, '비율을 숫자로 적을 수 있으면 배포 도구가 된다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) });
      return; }
    if (k === 3) { // Canary
      ['app-v1-1', 'app-v1-2', 'app-v1-3'].forEach((n, i) => node(150, 100 + i * 70, n + ' w=3', { w: 190, s: pop(u, 0.2 + i * 0.15) }));
      node(150, 330, 'app-v2   w=1', { w: 190, hot: true, s: pop(u, 0.8) });
      const s = E(u, 1.0, 2.0);
      el('rect', { x: 330, y: 190, width: 540 * 0.9 * s, height: 50, rx: 6, fill: OFF }); el('rect', { x: 330 + 540 * 0.9 * s, y: 190, width: 540 * 0.1 * s, height: 50, rx: 6, fill: ACC });
      mono(330 + 243, 222, 'v1 합 9 · 90%', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.8) });
      mono(870, 270, 'v2 1 / 10 = 10%', { 'text-anchor': 'end', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      tx(600, 140, '총 가중치 3+3+3+1 = 10', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) });
      return; }
    // k === 4 점진 롤아웃 (v1 합 9 기준)
    const days = [['Day 0', 9, 1], ['Day 1', 9, 3], ['Day 2', 9, 9], ['Day 3', 1, 9], ['Day 4', 0, 9]];
    days.forEach(([d, a, v2], i) => { const y = 60 + i * 72, s = E(u, 0.2 + i * 0.35, 0.8 + i * 0.35), pct = Math.round(100 * v2 / (a + v2));
      tx(40, y + 8, d, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.35) });
      mono(130, y + 8, a ? `v1 ${a} : v2 ${v2}` : `v1 down`, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.2 + i * 0.35) });
      el('rect', { x: 330, y: y - 12, width: 500 * s * (100 - pct) / 100, height: 30, rx: 4, fill: OFF });
      el('rect', { x: 330 + 500 * s * (100 - pct) / 100, y: y - 12, width: 500 * s * pct / 100, height: 30, rx: 4, fill: ACC });
      mono(846, y + 9, `v2 ${pct}%`, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6 + i * 0.35) }); });
    tx(480, 406, '재배포 없이 숫자만 고치고 reload', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) });
  }

  // ---------- 4. random ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 1) {
      ngx(NX, 210, { sub: 'random', s: k === 0 ? pop(u, 0.2) : 1 });
      b.nodes.forEach((n, i) => node(DX, YS[i], n.name, { hot: k === 1 && i === 0 && u > 0.9 }));
      if (k === 0) { [['worker 1', 70], ['worker 2', 350]].forEach(([w, y]) => { card(NX, y, 150, 40, { rx: 8, text: w, fs: 14, stroke: GRID, s: pop(u, 0.6) }); });
        tx(NX, 132, '공유할 순번이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); return; }
      // 주사위 + 표본 크기별 분포 (결정적 난수, 예시)
      const die = card(NX, 110, 50, 50, { rx: 10, stroke: INK, sw: 2.5, s: 1 + R.bump(u, 0.2) * 2 });
      [[-10, -10], [10, 10], [0, 0]].forEach(([dx, dy]) => el('circle', { cx: NX + dx, cy: 110 + dy, r: 4, fill: INK }));
      dot([[NX + 56, 210], [DX - 56, YS[0]]], seg(u, 0.4, 0.9), ACC, 7);
      [[6, 0], [600, 1]].forEach(([n, r]) => { const rnd = lcg(42), cnt = [0, 0, 0]; for (let j = 0; j < n; j++) cnt[Math.floor(rnd() * 3)]++;
        const x0 = 620, y0 = 80 + r * 170, op = fade(u, 1.0 + r * 0.6);
        tx(x0, y0, `요청 ${n}개`, { 'font-size': 15, 'font-weight': 700, opacity: op });
        cnt.forEach((v, i) => { el('rect', { x: x0, y: y0 + 16 + i * 30, width: Math.max(2, 200 * v / n * E(u, 1.0 + r * 0.6, 1.8 + r * 0.6)), height: 20, rx: 4, fill: ACC, opacity: op });
          mono(x0 + 210, y0 + 32 + i * 30, `app${i + 1} ${Math.round(100 * v / n)}%`, { 'font-size': 14, opacity: op }); }); });
      sub(720, 400, '고정 시드 난수로 뽑은 예시', fade(u, 2), {});
      return; }
    // k 2, 3: 다섯 대 중 둘
    ngx(NX - 80, 210, { sub: 'random two' });
    const Y5 = [60, 135, 210, 285, 360], picked = [1, 2];
    b.nodes.forEach((n, i) => { const isP = picked.includes(i), win = k === 3 && i === 2 && u > 1.2;
      node(DX, Y5[i], n.name, { hot: (k === 2 && isP && u > 1.0) || win, op: isP || k === 2 && u < 1.0 ? 1 : 0.45 });
      conns(BX, Y5[i], n.conns, 12, { hot: win, w: 200 }); });
    if (k === 2) { const sh = Math.floor(seg(u, 0.1, 1.0) * 8) % 5; if (u < 1.0) el('rect', { x: DX - 62, y: Y5[sh] - 25, width: 124, height: 50, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.5 });
      tx(NX - 80, 300, '무작위로 두 대만 뽑는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); return; }
    R.spans(NX - 150, 300, [['app2 ', {}], ['11', { 'font-weight': 800 }], ['  vs  ', { fill: MUT }], ['app3 ', {}], ['4', { 'font-weight': 800, fill: ACC }]], { 'font-size': 17, opacity: fade(u, 0.3) });
    grow(NX - 22, 210, DX - 58, Y5[2], E(u, 1.2, 1.8), ACC);
    tx(NX - 80, 340, '둘 중 적은 쪽 = app3', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
  }
  function s4guide(u) { const rows = [['round-robin', '일반 stateless API (기본)'], ['least_conn', '처리 시간 편차가 큼'], ['ip_hash', 'in-memory 세션 (레거시)'], ['weight', '스펙 차이, Canary'], ['random', '단순, worker 동기화 없음'], ['random two LC', '큰 풀에서 least_conn 근사']];
    rows.forEach(([a, b2], i) => { const y = 58 + i * 58, s = pop(u, 0.2 + i * 0.25); card(480, y, 760, 48, { rx: 10, stroke: i === 0 ? ACC : GRID, sw: i === 0 ? 2.5 : 1.5, s });
      if (s < 0.3) return; mono(130, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: i === 0 ? ACC : INK }); tx(420, y + 6, b2, { 'font-size': 15 }); });
    tx(480, 404, '고민이 길어지면 round-robin 으로 시작한다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2) }); }
  function s4w(t, c) { if (c.k === 4) return s4guide(c.u); return s4(t, c); }

  // ---------- 5. 의사결정 트리 ----------
  const QS = [['Q1 노드가 세션을 들고 있나?', '예', 'ip_hash (세션은 밖으로 빼기)', BAD], ['Q2 스펙이 다른가?', '예', 'weight= 로 비율', ACC], ['Q3 응답 시간이 들쭉날쭉한가?', '예', 'least_conn · 큰 풀은 random two', ACC], ['Q4 Canary / A-B 가 필요한가?', '예', 'weight 결합 · split_clients', WARN]];
  function s5(t, c) { const { k, u } = c, shown = Math.min(k, 3);
    QS.forEach(([q, y, r, col], i) => { if (i > shown) return; const cy = 52 + i * 84, s = i === shown && k <= 3 ? pop(u, 0.2) : 1;
      card(170, cy, 300, 48, { rx: 24, stroke: INK, sw: 2, text: q, fs: 14.5, s });
      if (i < 3 && (i < shown || k >= 3)) grow(170, cy + 25, 170, cy + 58, i === shown - 1 && k <= 3 ? E(u, 0, 0.3) : 1, MUT);
      if (i < shown && i < 3) mono(186, cy + 48, '아니오', { 'font-size': 13.5, fill: MUT });
      const ga = i === shown && k <= 3 ? E(u, 0.6, 1.1) : 1; grow(322, cy, 400, cy, ga, col); tx(358, cy - 8, y, { 'text-anchor': 'middle', 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: ga });
      pill(410 + tw(r, 14.5) / 2 + 13, cy, r, col, i === shown && k <= 3 ? pop(u, 1.0) : 1, { fs: 14.5 }); });
    if (k >= 2) { const s = k === 2 ? pop(u, 1.6) : 1; grow(170, 2 * 84 + 77, 170, 2 * 84 + 77 + 1, 1, MUT, { plain: true });
      if (k === 2) { pill(170, 380, '아니오 → round-robin (기본값)', INK, s, { fs: 14.5 }); } }
    if (k >= 3) pill(170, 392, '전부 아니오 → round-robin', INK, 1, { fs: 14.5 });
    if (k === 4) { card(680, 380, 400, 66, { rx: 14, fill: INK, stroke: 'none', s: pop(u, 0.3) });
      if (u > 0.4) { tx(500, 374, '실전 80% 의 답', { 'font-size': 14, fill: OFF, 'font-weight': 700 });
        mono(500, 398, 'round-robin + max_fails / fail_timeout', { 'font-size': 14.5, 'font-weight': 800, fill: PANEL }); } }
    if (k === 5) { const cases = [['REST API', 'round-robin'], ['LLM 추론', 'least_conn'], ['게임 매치메이킹', 'ip_hash'], ['Canary', 'weight'], ['대규모 풀', 'random two']];
      cases.forEach(([a, b2], i) => { const y = 60 + i * 64, s = pop(u, 0.2 + i * 0.3); card(845, y, 200, 50, { rx: 10, stroke: GRID, sw: 1.5, s });
        if (s < 0.3) return; tx(756, y - 4, a, { 'font-size': 14, 'font-weight': 700 }); mono(934, y + 16, b2, { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); }); }
  }

  const quiz = [
    { q: 'least_conn이 다음 노드를 고르는 기준은 무엇인가?',
      o: ['정해진 순서', '요청이 도착한 순간 처리 중인 연결 수가 가장 적은 노드', '지난 1분 동안의 평균 응답 시간'], a: 1,
      why: '도착 순간의 연결 수를 비교한다. 12, 8, 5개면 5개인 app3으로 보낸다. weight가 있으면 연결 수를 weight로 나눈 값을 본다.' },
    { q: 'ip_hash는 IPv4 주소의 어느 부분으로 노드를 정하는가?',
      o: ['앞 세 옥텟', '마지막 옥텟', '포트 번호까지 포함한 전체'], a: 0,
      why: '앞 세 옥텟만 해시한다. 그래서 203.0.113.45와 203.0.113.7처럼 같은 /24 대역은 늘 같은 노드(app1)로 간다.' },
    { q: 'v1 세 대에 weight=3씩, v2 한 대에 weight=1을 주면 v2가 받는 비율은 얼마인가?',
      o: ['25%', '약 3.6%', '10%'], a: 2,
      why: '총 가중치는 3+3+3+1=10이고 v2는 1이다. 1/10이라 10%를 받는다.' },
    { q: 'random two least_conn은 어떻게 노드를 고르는가?',
      o: ['무작위로 두 대를 뽑아 연결 수가 적은 쪽', '모든 노드 중 연결 수가 가장 적은 두 대에 나눠 보낸다', '두 번 무작위로 뽑아 나중 것'], a: 0,
      why: '다섯 대 전부를 비교하지 않고 두 대만 본다. app2(11)와 app3(4)이 뽑히면 app3으로 보낸다.' },
    { q: '노드 스펙이 모두 같고 응답 시간도 고른 stateless API에 맞는 기본값은 무엇인가?',
      o: ['ip_hash', 'round-robin', 'least_conn'], a: 1,
      why: '세션도 없고 스펙과 처리 시간이 고르면 순서대로 나누는 round-robin으로 충분하다. 여기에 max_fails와 fail_timeout을 잘 잡는다.' },
  ];

  const summary = [
    'round-robin은 순서만 보므로 스펙이나 처리 시간이 다르면 한쪽이 먼저 지친다.',
    'least_conn은 도착 순간 연결 수가 가장 적은 노드로 보낸다.',
    'ip_hash는 IP 앞 세 옥텟으로 노드를 고정하지만 NAT 뒤에서는 한 노드로 몰린다.',
    'weight는 비율을 숫자로 정한다. v1 합 9에 v2 1이면 v2가 10%를 받는다.',
  ];
  const review = [
    { q: 'AI 추론 서버 3대를 RR로 묶었더니 한 대에만 긴 요청이 쌓여 응답이 늦다. 먼저 바꿀 것은?',
      o: ['ip_hash로 바꾼다', 'least_conn으로 바꾼다', '모든 노드 weight를 2로 올린다'], a: 1,
      why: '처리 시간 편차가 크면 지금 연결 수를 보는 least_conn이 바쁜 노드를 건너뛴다. 모든 weight를 같이 올리면 비율은 그대로다.' },
    { q: 'ip_hash를 쓰는 서비스에서 한 회사 직원 전체가 app1로만 몰렸다. 원인으로 가장 그럴듯한 것은?',
      o: ['직원들이 NAT 뒤에서 같은 외부 IP를 쓴다', 'app1의 weight가 높다', 'least_conn이 켜져 있다'], a: 0,
      why: 'ip_hash의 단위는 사용자가 아니라 IP다. 같은 외부 IP 뒤의 사람들은 모두 같은 노드로 간다.' },
    { q: 'v2를 10%만 노출하다가 50%로 늘리려 한다. v1 합이 9일 때 v2 weight를 얼마로 바꾸면 되는가?',
      o: ['3', '5', '9'], a: 2,
      why: '9 : 9면 v2가 절반을 받는다. 3이면 3/12로 25%다.' },
  ];

  R.page({ title: '로드 밸런싱 알고리즘', scenes: [s1, s2, s3, s4w, s5], quiz, summary, review });
})();
