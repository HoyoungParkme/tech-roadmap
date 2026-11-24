/* III-1-1 upstream + round-robin — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, clock, terminal, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN } = C;

  // ---------- 지역 도우미 ----------
  // nginx 상자
  function ngx(cx, cy, o) { o = o || {}; const w = o.w || 118, h = o.h || 64;
    const g = card(cx, cy, w, h, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: o.s, op: o.op });
    tx(0, o.sub ? -3 : 6, 'nginx', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC }, g);
    if (o.sub) mono(0, 18, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // 백엔드 노드 한 대. st: up | down | standby, hot: 지금 고른 노드
  function node(cx, cy, name, o) { o = o || {}; const st = o.st || 'up', w = o.w || 124, h = 44;
    const col = st === 'down' ? BAD : o.hot ? ACC : st === 'standby' ? MUT : INK;
    const g = card(cx, cy, w, h, { rx: 8, stroke: col, sw: o.hot ? 3 : 2, fill: o.hot ? ACCBG : st === 'down' ? C.BADBG : PANEL, dash: st === 'standby' ? '6 5' : null, s: o.s, op: o.op });
    el('circle', { cx: -w / 2 + 15, cy: 0, r: 5, fill: st === 'down' ? BAD : st === 'standby' ? OFF : GOOD }, g);
    mono(-w / 2 + 28, 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: st === 'down' ? BAD : INK }, g); return g; }
  // 꺾인 선이 u 만큼 자라기
  function trace(pts, u, col, o) { o = o || {}; if (u <= 0) return; const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), L = segs.reduce((a, b) => a + b, 0);
    el('path', { d: 'M' + pts.map((p) => p.join(',')).join(' L'), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': L * (1 - clamp(u)), 'marker-end': u >= 0.98 ? (col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ahb)') : null, 'stroke-linejoin': 'round' }); }
  // 값이 쌓이는 칸 (요청 몇 개 받았나)
  function tally(x, cy, n, col) { for (let i = 0; i < n; i++) el('rect', { x: x + i * 24, y: cy - 10, width: 20, height: 20, rx: 4, fill: col || ACC, opacity: 0.85 }); }
  // nginx proxy_pass 의 URI 변환 규칙: URI 가 붙어 있으면 location 이 잡은 앞부분을 그 URI 로 바꾸고, 없으면 그대로 넘긴다
  function passUri(loc, pass, uri) { const m = pass.match(/^https?:\/\/[^/]+(\/.*)?$/); if (!m || m[1] == null) return uri; return m[1] + uri.slice(loc.length); }

  // ---------- 1. upstream 블록 정의 ----------
  const P1 = { cl: 530, nx: 662, px: 862, ys: [130, 210, 290] };
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      // 왼쪽: 설정 블록 트리
      zone(30, 26, 440, 368, null, { fill: 'none', stroke: GRID, sw: 2 }); mono(46, 50, 'http {', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      zone(50, 62, 400, 140, null, { fill: SOFT, stroke: k === 0 ? ACC : GRID, sw: 2 });
      R.spans(66, 88, [['upstream ', {}], ['backend', { 'font-weight': 800, fill: ACC }], [' {', {}]], { 'font-size': 15, 'font-weight': 700 });
      ['app1', 'app2', 'app3'].forEach((n, i) => { const op = k === 0 ? fade(u, 0.3 + i * 0.45) : 1;
        mono(86, 118 + i * 28, `server ${n}:8000;`, { 'font-size': 15, opacity: op }); });
      if (k >= 1) { const op = k === 1 ? fade(u, 0.2) : 1;
        zone(50, 214, 400, 166, null, { fill: SOFT, stroke: k === 1 ? ACC : GRID, sw: 2, op });
        mono(66, 238, 'server {', { 'font-size': 15, 'font-weight': 700, opacity: op });
        mono(86, 264, 'listen 80;', { 'font-size': 15, opacity: k === 1 ? fade(u, 0.4) : 1 });
        mono(86, 288, 'server_name api.example.com;', { 'font-size': 15, opacity: k === 1 ? fade(u, 0.6) : 1 });
        zone(70, 302, 360, 64, null, { fill: PANEL, stroke: GRID, sw: 1.5, op: k === 1 ? fade(u, 0.8) : 1 });
        mono(86, 326, 'location / {', { 'font-size': 15, opacity: k === 1 ? fade(u, 0.8) : 1 });
        R.spans(100, 352, [['proxy_pass http://', {}], ['backend', { 'font-weight': 800, fill: ACC }], [';', {}]], { 'font-size': 15, opacity: k === 1 ? fade(u, 1.0) : 1 });
        trace([[334, 346], [458, 346], [458, 82], [228, 82]], k === 1 ? E(u, 1.3, 2.3) : 1, ACC);
        if (k === 1) sub(380, 398, '이름으로 풀을 가리킨다', fade(u, 2.1), { fill: ACC, 'font-weight': 700 }); }
      // 오른쪽: 실제 모습
      zone(P1.px - 78, 70, 156, 270, 'backend', { fill: SOFT, stroke: GRID, sw: 1.5, color: ACC });
      ['app1:8000', 'app2:8000', 'app3:8000'].forEach((n, i) => node(P1.px, P1.ys[i], n, { s: k === 0 ? pop(u, 0.3 + i * 0.45) : 1, hot: k === 2 && ((i === 0 && u > 1.1 && u < 1.6) || (i === 1 && u > 2.2)) }));
      if (k >= 1) { const s = k === 1 ? pop(u, 0.3) : 1;
        ngx(P1.nx, 210, { sub: ':80', s }); person(P1.cl, 210, null, { s });
        pill(P1.nx - 40, 140, 'api.example.com', INK, k === 1 ? pop(u, 0.6) : 1, { mono: true, fs: 13.5 });
        grow(P1.cl + 28, 210, P1.nx - 62, 210, k === 1 ? E(u, 0.6, 1.0) : 1, MUT);
        grow(P1.nx + 60, 210, P1.px - 80, 210, k === 1 ? E(u, 1.3, 2.3) : 1, ACC); }
      if (k === 2) { const r1 = [[P1.cl + 28, 210], [P1.nx, 210], [P1.px - 80, 210], [P1.px - 62, P1.ys[0]]], r2 = [[P1.cl + 28, 210], [P1.nx, 210], [P1.px - 80, 210], [P1.px - 62, P1.ys[1]]];
        dot(r1, seg(u, 0.2, 1.1), ACC, 7); dot(r2, seg(u, 1.3, 2.2), ACC, 7);
        [[0, 1.1], [1, 2.2]].forEach(([i, a]) => { const s = pop(u, a); if (s > 0) card(P1.px - 100, P1.ys[i] - 26, 30, 24, { rx: 12, fill: ACC, stroke: 'none', text: String(i + 1), fs: 13.5, color: PANEL, mono: true, s }); });
        sub(P1.px, 368, '요청 1 → app1, 요청 2 → app2', fade(u, 2.3), { 'font-weight': 700, fill: INK }); }
      return; }
    if (k === 3) { // server 줄 옵션
      mono(480, 50, 'server app1:8000  [옵션…];', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700 });
      const opts = [['weight=2', '가중치 (기본 1)'], ['max_fails=3', '실패 몇 번이면 뺄지'], ['fail_timeout=10s', '판정 창이자 제외 기간'],
        ['backup', '메인이 다 빠질 때만'], ['down', '영구 비활성'], ['max_conns=50', '노드당 동시 연결 한도']];
      opts.forEach(([o, d], i) => { const cx = 170 + (i % 3) * 310, cy = 138 + Math.floor(i / 3) * 140, s = pop(u, 0.2 + i * 0.3);
        card(cx, cy, 280, 108, { rx: 12, stroke: i < 3 ? ACC : GRID, sw: 2, s });
        if (s <= 0.05) return; const op = fade(u, 0.3 + i * 0.3);
        mono(cx - 124, cy - 14, o, { 'font-size': 16.5, 'font-weight': 800, fill: ACC, opacity: op });
        tx(cx - 124, cy + 20, d, { 'font-size': 14, fill: MUT, opacity: op });
        const gx = cx + 98, gy = cy - 18;
        if (i === 0) { el('rect', { x: gx - 14, y: gy - 22, width: 12, height: 36, rx: 2, fill: ACC, opacity: op }); el('rect', { x: gx + 4, y: gy - 4, width: 12, height: 18, rx: 2, fill: OFF, opacity: op }); }
        if (i === 1) [0, 1, 2].forEach((j) => cross(gx - 14 + j * 15, gy, 5, op));
        if (i === 2 && op > 0) clock(gx, gy, 16, 0.3 + 0.5 * E(u, 1, 2.4), WARN);
        if (i === 3) el('rect', { x: gx - 20, y: gy - 14, width: 40, height: 28, rx: 5, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: op });
        if (i === 4 && op > 0) cross(gx, gy, 10, op);
        if (i === 5) for (let j = 0; j < 5; j++) el('rect', { x: gx - 24 + j * 10, y: gy - 8, width: 8, height: 16, rx: 2, fill: j < 4 ? ACC : SOFT, opacity: op }); });
      tx(480, 384, '아무것도 적지 않으면 weight=1, 활성 상태', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.2) });
      return; }
    // k === 4 백엔드 주소 세 가지
    const kinds = [['IP:포트', '192.168.1.10:8000', '가장 안전', GOOD], ['DNS 이름', 'app.internal:8000', '시작할 때 한 번 해석', WARN], ['Unix socket', 'unix:/var/run/app.sock', '같은 서버 안, TCP 없이', INK]];
    kinds.forEach(([a, b, d, col], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
      card(cx, 190, 290, 190, { rx: 14, stroke: col, sw: 2.5, s }); if (s < 0.1) return; const op = fade(u, 0.3 + i * 0.4);
      lbl(cx, 128, a, op, { 'font-size': 17 });
      mono(cx, 178, 'server ' + (i === 2 ? '' : ''), { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op });
      mono(cx, 204, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col === INK ? ACC : col, opacity: op });
      sub(cx, 250, d, op, { 'font-size': 14 }); });
    if (u > 1.2) { const s = pop(u, 1.4); clock(480, 340, 20, E(u, 1.5, 2.6), WARN); tx(510, 346, 'IP 가 바뀌어도 nginx 는 모른다 (재시작·reload 전까지)', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: s }); }
  }

  // ---------- 2. 동일 가중치 round-robin ----------
  const P2 = { qx: 70, nx: 320, ndx: 600, ys: [110, 210, 310], tx: 680 };
  const RR9 = [0, 1, 2, 0, 1, 2, 0, 1, 2];      // nginx 의 smooth weighted RR 를 1:1:1 로 재현한 결과 (sim.py)
  function rrStage(u, k, upto, from) {
    ngx(P2.nx, 210, { sub: 'round-robin' });
    ['app1:8000', 'app2:8000', 'app3:8000'].forEach((n, i) => node(P2.ndx, P2.ys[i], n));
    // 순번 표시 (nginx 아래)
    let sent = from; for (let j = from; j < upto; j++) if (u > 0.25 + (j - from) * (k === 1 ? 0.5 : 0.4) + 0.4) sent = j + 1;
    const idx = sent % 3;
    ['1', '2', '3'].forEach((s, i) => card(P2.nx - 52 + i * 52, 278, 46, 28, { rx: 6, text: 'app' + s, fs: 13.5, mono: true, stroke: i === idx ? ACC : GRID, fill: i === idx ? ACCBG : PANEL, color: i === idx ? ACC : MUT, sw: i === idx ? 2.5 : 1.5 }));
    sub(P2.nx, 318, '다음 차례', 1, { fill: ACC, 'font-weight': 700 });
    // 대기 중인 요청
    for (let j = sent; j < 9; j++) if (j >= from || k > 2) card(P2.qx, 46 + j * 37, 52, 30, { rx: 7, text: String(j + 1), fs: 14, mono: true, stroke: GRID, sw: 1.5 });
    // 날아가는 요청
    for (let j = from; j < upto; j++) { const a = 0.25 + (j - from) * (k === 1 ? 0.5 : 0.4), w = RR9[j];
      fly(P2.qx, 46 + j * 37, P2.ndx - 62, P2.ys[w], seg(u, a, a + 0.4), String(j + 1), { mono: true }); }
    const cnt = [0, 0, 0]; for (let j = 0; j < sent; j++) cnt[RR9[j]]++;
    cnt.forEach((n, i) => { tally(P2.tx, P2.ys[i], n); if (n) mono(P2.tx + n * 24 + 8, P2.ys[i] + 5, String(n), { 'font-size': 15, 'font-weight': 800, fill: ACC }); });
    return cnt; }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { ngx(P2.nx, 210, { sub: 'round-robin' });
      ['app1:8000', 'app2:8000', 'app3:8000'].forEach((n, i) => { node(P2.ndx, P2.ys[i], n, { s: pop(u, 0.2 + i * 0.25) });
        mono(P2.tx, P2.ys[i] - 14, 'weight=1', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.25) });
        R.hbar(P2.tx, P2.ys[i] - 2, 180, 1, 3, { u: E(u, 1.0, 2.0), text: '33.3%', col: ACC, h: 16 }); });
      grow(P2.nx + 60, 210, P2.ndx - 64, P2.ys[1], E(u, 0.4, 1), MUT); grow(P2.nx + 60, 200, P2.ndx - 64, P2.ys[0], E(u, 0.4, 1), MUT); grow(P2.nx + 60, 220, P2.ndx - 64, P2.ys[2], E(u, 0.4, 1), MUT);
      card(P2.nx, 300, 210, 40, { rx: 20, fill: INK, stroke: 'none', text: '총 가중치 3 = 1+1+1', fs: 15, color: PANEL, s: pop(u, 1.6) });
      return; }
    if (k === 1) { rrStage(u, k, 4, 0); return; }
    if (k === 2) { rrStage(u, k, 9, 4); if (u > 2.3) banner(P2.nx, 380, '3 : 3 : 3', pop(u, 2.3)); return; }
    if (k === 3) { rrStage(3, 3, 9, 9);
      card(P2.nx, 380, 300, 40, { rx: 20, fill: INK, stroke: 'none', text: '다음 = (지금 + 1) mod 3', fs: 15, color: PANEL, mono: true, s: pop(u, 0.3) });
      tx(P2.tx + 120, 60, '기억할 것은 순번 하나뿐', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1) });
      tx(P2.tx + 120, 378, '요청 3n개면 노드마다 정확히 n개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      return; }
    // k === 4 단점 세 가지와 해법
    const panels = [['스펙 차이', 'weight'], ['세션 고정 없음', 'ip_hash'], ['요청 무게 무시', 'least_conn']];
    panels.forEach(([h, fix], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.5); card(cx, 200, 290, 300, { rx: 14, stroke: GRID, sw: 1.5, s });
      if (s < 0.2) return; const op = fade(u, 0.3 + i * 0.5); lbl(cx, 80, h, op, { 'font-size': 16 });
      if (i === 0) { card(cx - 60, 160, 100, 70, { rx: 8, text: '8 core', fs: 14, mono: true, op }); card(cx + 70, 172, 70, 46, { rx: 8, text: '4 core', fs: 13.5, mono: true, op, stroke: BAD });
        tally(cx - 86, 225, 3); tally(cx + 36, 225, 3, BAD); sub(cx + 70, 258, '과부하', op, { fill: BAD, 'font-weight': 700 }); }
      if (i === 1) { person(cx - 95, 170, null, { op }); node(cx + 55, 140, 'app1', { w: 100, op }); node(cx + 55, 210, 'app2', { w: 100, op });
        grow(cx - 70, 160, cx + 2, 140, E(u, 1.0, 1.4), GOOD); grow(cx - 70, 180, cx + 2, 210, E(u, 1.5, 1.9), BAD);
        mono(cx + 55, 112, '로그인 ✓', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.4) }); sub(cx + 55, 250, '세션 없음', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); }
      if (i === 2) { node(cx - 10, 140, 'app1', { w: 100, op }); el('rect', { x: cx + 48, y: 132, width: 80 * E(u, 1.2, 2.6), height: 16, rx: 4, fill: BAD, opacity: 0.8 });
        sub(cx + 70, 172, '무거운 요청 처리 중', fade(u, 1.4), { fill: BAD }); node(cx - 10, 210, 'app2', { w: 100, op }); sub(cx + 60, 216, '한가함', fade(u, 1.4));
        sub(cx, 256, '그래도 차례면 app1 로', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
      pill(cx, 310, '→ ' + fix, ACC, pop(u, 1.6 + i * 0.25), { mono: true, fs: 15 }); });
    tx(480, 392, '세 가지 해법은 다음 장(III-1-2)에서', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) });
  }

  // ---------- 3. 정말 순서대로 도는지 확인 ----------
  const P3 = { nx: 560, ndx: 790, ys: [110, 210, 310] };
  const CMD = ['$ for i in $(seq 1 10); do', '    curl -s api.example.com/who; echo', '  done'];
  const OUT10 = RR9.concat([0]).map((w) => `{"host":"app${w + 1}"}`);
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) {
      let shown = 0, cur = -1;
      if (k === 1) { shown = Math.min(3, E(u, 0.2, 1.4) * 3); if (u > 2.0) { shown = 4; cur = 0; } }
      if (k === 2) { const m = Math.min(8, Math.floor(seg(u, 0.1, 2.3) * 8)); shown = 4 + m; cur = RR9[m]; }
      if (k === 3) { shown = 13; cur = u > 0.5 ? 0 : 2; }
      if (k >= 1) terminal(24, 30, 420, 340, CMD.concat(OUT10), shown, { title: 'verify-rr.sh', lh: 22 });
      if (k >= 1) { ngx(P3.nx, 210, { w: 104 }); grow(446, 210, P3.nx - 54, 210, 1, MUT);
        if (k === 2) for (let m = 0; m < 8; m++) { const a = 0.1 + m * 0.275; dot([[446, 210], [P3.nx, 210], [P3.ndx - 64, P3.ys[RR9[m + 1]]]], seg(u, a, a + 0.27), ACC, 6); }
        if (k === 1) dot([[446, 210], [P3.nx, 210], [P3.ndx - 64, P3.ys[0]]], seg(u, 1.4, 2.0), ACC, 7);
        if (k === 3) dot([[446, 210], [P3.nx, 210], [P3.ndx - 64, P3.ys[0]]], seg(u, 0.1, 0.5), ACC, 7); }
      ['app1', 'app2', 'app3'].forEach((n, i) => { node(P3.ndx, P3.ys[i], n + ':8000', { hot: i === cur, s: k === 0 ? pop(u, 0.2 + i * 0.3) : 1 });
        mono(P3.ndx, P3.ys[i] + 40, `/who → {"host":"${n}"}`, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.6 + i * 0.3) : 1 }); });
      if (k === 0) { snippetBox(); }
      if (k === 3) { [4, 3, 3].forEach((n, i) => mono(P3.ndx + 72, P3.ys[i] + 6, '×' + n, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8 + i * 0.2) }));
        banner(620, 396, '10번째는 다시 app1 · 4 : 3 : 3', pop(u, 1.5)); }
      return; }
    // k 4~5: worker 가 둘일 때
    const W = [[340, 110], [340, 310]];
    W.forEach(([x, y], w) => { card(x, y, 220, 96, { rx: 12, stroke: INK, sw: 2 }); tx(x - 96, y - 26, `worker ${w + 1}`, { 'font-size': 15, 'font-weight': 700 });
      const own = k === 4 || u < 0.8, idx = 0, op = k === 5 ? 1 - fade(u, 0.4, 0.6) * 0.75 : 1;
      ['1', '2', '3'].forEach((s, i) => card(x - 60 + i * 52, y + 16, 44, 30, { rx: 6, text: 'app' + s, fs: 13.5, mono: true, op, stroke: i === idx && own ? ACC : GRID, fill: i === idx && own ? ACCBG : PANEL, color: i === idx && own ? ACC : MUT })); });
    person(70, 110, null, {}); person(70, 310, null, {});
    ['app1', 'app2', 'app3'].forEach((n, i) => node(P3.ndx + 40, P3.ys[i], n + ':8000', { hot: k === 4 ? i === 0 && u > 1.6 : (i === 0 || i === 1) && u > 2.0 }));
    if (k === 4) { dot([[96, 110], [228, 110], [452, 110], [P3.ndx - 24, P3.ys[0]]], seg(u, 0.4, 1.6), ACC, 7); dot([[96, 310], [228, 310], [452, 310], [P3.ndx - 24, P3.ys[0]]], seg(u, 0.4, 1.6), BAD, 7);
      sub(P3.ndx + 40, 160, '동시에 2건이 app1 로', fade(u, 1.7), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
      tx(560, 400, '순번을 worker 마다 따로 들고 있다 · 길게 보면 균등', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k === 5 zone 으로 공유
    const s = pop(u, 0.5); card(340, 210, 250, 62, { rx: 10, fill: ACCBG, stroke: ACC, sw: 2.5, s });
    if (s > 0.2) { mono(340, 204, 'zone backend_zone 64k', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC }); sub(340, 226, '공유 메모리 · 순번 하나', 1, { fill: INK }); }
    grow(340, 158, 340, 178, E(u, 0.8, 1.1), ACC, { plain: true }); grow(340, 262, 340, 242, E(u, 0.8, 1.1), ACC, { plain: true });
    dot([[96, 110], [228, 110], [452, 110], [P3.ndx - 24, P3.ys[0]]], seg(u, 1.0, 2.0), ACC, 7); dot([[96, 310], [228, 310], [452, 310], [P3.ndx - 24, P3.ys[1]]], seg(u, 1.0, 2.0), ACC, 7);
    tx(560, 400, 'worker 1 → app1, worker 2 → app2', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) });
  }
  function snippetBox() { R.snippet(40, 120, ['import socket', '@app.get("/who")', 'def who():', '    return {"host": socket.gethostname()}'], { fs: 14.5 }); }

  // ---------- 4. proxy_pass 로 풀 연결 ----------
  const P4 = { nx: 440, ax: 690, bx: 845 };
  function pools(k, u, o) { o = o || {};
    const showA = k > 0 || pop(u, 0.2) > 0, sA = k === 0 ? pop(u, 0.2) : 1, sB = k === 1 ? pop(u, 0.2) : 1;
    if (showA) { zone(600, 40, 330, 150, 'upstream api_backend', { fill: SOFT, stroke: o.hiA ? ACC : GRID, sw: 2, color: ACC, op: sA });
      node(P4.ax, 120, 'app1:8000', { w: 140, s: sA, hot: o.hotA === 0 }); node(P4.bx, 120, 'app2:8000', { w: 140, s: sA, hot: o.hotA === 1 }); }
    if (k >= 1) { zone(600, 230, 330, 150, 'upstream admin_backend', { fill: SOFT, stroke: o.hiB ? ACC : GRID, sw: 2, color: ACC, op: sB });
      node(P4.ax, 310, 'admin1:8001', { w: 140, s: sB, hot: o.hotB === 0 }); node(P4.bx, 310, 'admin2:8001', { w: 140, s: sB, hot: o.hotB === 1 }); } }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) {
      pools(k, u, { hotA: k === 2 && u > 2.2 ? 1 : k === 3 && u > 1.6 ? 0 : -1, hotB: k === 3 && u > 1.6 ? 0 : -1, hiA: k === 2, hiB: k === 3 });
      if (k >= 2) { ngx(P4.nx, 210, { w: 110 }); grow(P4.nx + 56, 196, 598, 120, 1, MUT); grow(P4.nx + 56, 224, 598, 300, 1, MUT); }
      if (k <= 1) { mono(300, 120, 'upstream api_backend {', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.3) : 0.45 });
        mono(300, 148, '    server app1:8000;  server app2:8000;', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: k === 0 ? fade(u, 0.6) : 0.45 });
        if (k === 1) { mono(300, 300, 'upstream admin_backend {', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
          mono(300, 328, '    server admin1:8001;  server admin2:8001;', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 0.6) });
          tx(300, 210, '풀을 나누면 장애가 옮겨 가지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); }
        return; }
      if (k === 2) { const uri = '/api/users', out = passUri('/api/', 'http://api_backend/', uri);
        const rows = [['요청 URI', [[uri.slice(0, 5), { fill: ACC, 'font-weight': 800 }], [uri.slice(5), {}]]],
          ['location /api/ 가 잡은 앞부분', [['/api/', { fill: BAD, 'text-decoration': 'line-through', 'font-weight': 700 }], [uri.slice(5), {}]]],
          ['proxy_pass http://api_backend/ 의 URI', [['/', { fill: ACC, 'font-weight': 800 }], [' 로 바꿔 끼움', { fill: MUT }]]],
          ['백엔드가 받는 URI', [[out, { 'font-weight': 800, fill: GOOD }]]]];
        rows.forEach(([h, sp], i) => { const y = 66 + i * 84, op = fade(u, 0.2 + i * 0.45);
          tx(30, y, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op }); R.spans(30, y + 30, sp, { 'font-size': 18, opacity: op }); });
        dot([[P4.nx, 210], [598, 120], [P4.bx - 72, 120]], seg(u, 1.8, 2.4), ACC, 7);
        return; }
      // k === 3 path 로 갈라짐
      const reqs = [['/api/orders', '/api/', 'http://api_backend/', 120, P4.ax], ['/admin/stats', '/admin/', 'http://admin_backend/', 310, P4.ax]];
      person(60, 210, null, {});
      reqs.forEach(([uri, loc, pass, y, x], i) => { const out = passUri(loc, pass, uri);
        fly(110, 210 + (i ? 24 : -24), P4.nx - 56, 210, seg(u, 0.2 + i * 0.3, 0.9 + i * 0.3), uri, { mono: true, stay: false });
        dot([[P4.nx, 210], [598, y], [x - 72, y]], seg(u, 1.0 + i * 0.2, 1.6 + i * 0.2), ACC, 7);
        mono(200, 120 + i * 190 - 30, `location ${loc}`, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
        mono(200, 120 + i * 190 - 6, `${uri} → ${out}`, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7 + i * 0.2) }); });
      return; }
    if (k === 4) { // HTTPS 백엔드
      ngx(P4.nx, 210, { w: 110 });
      zone(600, 110, 330, 200, 'upstream secure_backend', { fill: SOFT, stroke: GRID, sw: 2, color: ACC, op: fade(u, 0.1) });
      node(765, 175, 'svc1.internal:8443', { w: 220, s: pop(u, 0.2) }); node(765, 250, 'svc2.internal:8443', { w: 220, s: pop(u, 0.35) });
      grow(P4.nx + 56, 210, 598, 210, E(u, 0.5, 1.1), ACC); if (u > 1.0) lock(530, 184, true, ACC, pop(u, 1.0));
      mono(530, 240, 'https://', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      [['proxy_ssl_verify off;', '인증서 검증 안 함 (기본값도 off)'], ['proxy_ssl_server_name on;', 'SNI 로 보내는 이름 = secure_backend']].forEach(([a, b], i) => {
        const y = 140 + i * 110, op = fade(u, 1.4 + i * 0.5); mono(30, y, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); tx(30, y + 26, b, { 'font-size': 14, fill: MUT, opacity: op }); });
      tx(30, 380, 'SNI 이름은 proxy_pass 의 호스트($proxy_host)다', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.3) });
      return; }
    // k === 5 한 풀 + 여러 path
    ngx(P4.nx, 210, { w: 110 }); zone(640, 150, 260, 120, 'upstream backend', { fill: SOFT, stroke: GRID, sw: 2, color: ACC });
    node(770, 220, 'app:8000', { w: 140, hot: u > 2.0 }); grow(P4.nx + 56, 210, 638, 210, 1, MUT);
    const rows = [['/v1/', 'http://backend/v1/', '/v1/users'], ['/v2/', 'http://backend/v2/', '/v2/items'], ['/health', 'http://backend/health', '/health']];
    rows.forEach(([loc, pass, uri], i) => { const y = 92 + i * 110, op = fade(u, 0.2 + i * 0.45), out = passUri(loc, pass, uri);
      mono(24, y, `location ${loc}`, { 'font-size': 14, fill: MUT, opacity: op });
      mono(24, y + 26, `${uri} → ${out}`, { 'font-size': 15.5, 'font-weight': 700, opacity: op });
      grow(250, y + 8, P4.nx - 58, 210, E(u, 0.5 + i * 0.45, 1.0 + i * 0.45), GRID, { plain: true }); });
    sub(770, 300, '노드 목록은 한 번만 적는다', fade(u, 1.8), { fill: ACC, 'font-weight': 700 });
  }

  // ---------- 5. 운영용 종합 설정 ----------
  const P5 = { cl: 70, nx: 250, ndx: 560, ys: [90, 180, 270], by: 360 };
  function base5(o) { o = o || {};
    person(P5.cl, 180, null, {}); ngx(P5.nx, 180, { w: 110, sub: o.sub });
    ['app1:8000', 'app2:8000', 'app3:8000'].forEach((n, i) => node(P5.ndx, P5.ys[i], n, { st: (o.down || [])[i] ? 'down' : 'up', hot: (o.hot || [])[i] }));
    if (o.backup) node(P5.ndx, P5.by, 'backup1:8000', { w: 150, st: 'standby', s: o.backup }); }
  function stream(t, col) { for (let i = 0; i < 6; i++) { const w = i % 3, f = (t * 0.7 + i / 6) % 1; dot([[P5.cl + 26, 180], [P5.nx, 180], [P5.ndx - 64, P5.ys[w]]], f, col || ACC, 5); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { base5(); stream(t);
      P5.ys.forEach((y, i) => { const op = fade(u, 0.3 + i * 0.3); mono(640, y - 4, 'max_fails=3 fail_timeout=10s', { 'font-size': 14, opacity: op });
        [0, 1, 2].forEach((j) => el('circle', { cx: 650 + j * 18, cy: y + 16, r: 6, fill: 'none', stroke: MUT, 'stroke-width': 1.8, opacity: op }));
        mono(712, y + 21, '실패 0 / 3', { 'font-size': 13.5, fill: MUT, opacity: op }); });
      tx(480, 400, '10초 안에 3번 실패하면 10초 동안 뺀다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { base5({ backup: pop(u, 0.3) });
      sub(P5.ndx + 140, P5.by + 5, '메인이 다 빠질 때만', fade(u, 0.6), { 'text-anchor': 'start', 'font-weight': 700 });
      for (let i = 0; i < 4; i++) { const y = 150 + i * 20; el('line', { x1: P5.nx + 56, y1: y, x2: P5.ndx - 64, y2: lerp(P5.ys[0], P5.ys[2], i / 3), stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.0 + i * 0.15) * 0.7 }); }
      dot([[P5.nx + 56, 170], [P5.ndx - 64, P5.ys[1] - 30]], seg(u, 1.8, 2.4), ACC, 6);
      card(800, 180, 220, 76, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.2) });
      if (u > 1.3) { mono(800, 174, 'keepalive 32;', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC }); sub(800, 198, 'worker 마다 유휴 연결 재사용', 1); }
      return; }
    if (k === 2) { base5({ sub: ':80' }); stream(t);
      pill(P5.nx, 110, 'api.example.com', INK, pop(u, 0.3), { mono: true, fs: 13.5 });
      mono(395, 160, 'location /', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      mono(395, 232, 'proxy_pass http://backend', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(480, 390, '풀이 바뀌어도 server 블록은 그대로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2) }); return; }
    if (k === 3) { base5(); dot([[P5.cl + 26, 180], [P5.nx, 180], [P5.ndx - 64, P5.ys[2]]], seg(u, 0.2, 1.0), ACC, 7);
      card(800, 196, 270, 290, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.4) }); if (u < 0.5) return;
      tx(680, 92, '백엔드로 가는 요청', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const L = [['GET / HTTP/', '1.1', 'proxy_http_version'], ['Host: ', 'api.example.com', '$host'], ['X-Real-IP: ', '<클라이언트 IP>', '$remote_addr'], ['Connection: ', '(비움)', 'keepalive 용']];
      L.forEach(([a, b, why], i) => { const y = 132 + i * 54, op = fade(u, 0.7 + i * 0.4);
        R.spans(680, y, [[a, {}], [b, { fill: ACC, 'font-weight': 800 }]], { 'font-size': 14.5, opacity: op }); tx(680, y + 21, why, { 'font-size': 13.5, fill: MUT, opacity: op }); });
      return; }
    if (k === 4) { base5({ hot: [u > 1.9, false, false], down: [false, false, u > 0.9 && u < 1.9] });
      dot([[P5.cl + 26, 180], [P5.nx, 180], [P5.ndx - 64, P5.ys[2]]], seg(u, 0.1, 0.9), ACC, 7);
      if (u > 0.9) { pill(P5.ndx + 120, P5.ys[2], '502', BAD, pop(u, 0.9), { mono: true }); }
      dot([[P5.ndx - 64, P5.ys[2]], [P5.nx + 56, 180], [P5.ndx - 64, P5.ys[0]]], seg(u, 1.2, 1.9), WARN, 7);
      if (u > 1.9) check(P5.ndx + 100, P5.ys[0], 12, pop(u, 1.9));
      mono(P5.nx, 260, u < 1.2 ? '시도 1 / 2' : '시도 2 / 2', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: u < 1.2 ? ACC : WARN });
      mono(480, 380, 'proxy_next_upstream error timeout http_502 http_503;', { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.3) });
      tx(480, 406, '사용자는 app1 의 정상 응답만 본다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); return; }
    // k === 5 평소 · 장애 · 전부 장애 · 복구
    const cases = [['평소', [33, 33, 33, 0]], ['app1 다운', [0, 50, 50, 0]], ['전부 다운', [0, 0, 0, 100]], ['살아난 뒤', [33, 33, 33, 0]]];
    cases.forEach(([h, sh], i) => { const cx = 125 + i * 237, s = pop(u, 0.2 + i * 0.45); card(cx, 210, 218, 300, { rx: 12, stroke: i === 2 ? WARN : i === 1 ? BAD : GRID, sw: 2, s });
      if (s < 0.2) return; const op = fade(u, 0.3 + i * 0.45); lbl(cx, 90, h, op, { 'font-size': 16 });
      ['app1', 'app2', 'app3', 'backup1'].forEach((n, j) => { const y = 130 + j * 54, v = sh[j], dead = (i === 1 && j === 0) || (i === 2 && j < 3);
        mono(cx - 92, y + 5, n, { 'font-size': 14, 'font-weight': 700, fill: dead ? BAD : j === 3 ? MUT : INK, opacity: op, 'text-decoration': dead ? 'line-through' : null });
        el('rect', { x: cx - 18, y: y - 8, width: 70, height: 16, rx: 4, fill: SOFT, opacity: op }); el('rect', { x: cx - 18, y: y - 8, width: Math.max(1, 70 * v / 100 * E(u, 0.5 + i * 0.45, 1.3 + i * 0.45)), height: 16, rx: 4, fill: j === 3 ? WARN : ACC, opacity: op });
        mono(cx + 92, y + 5, v + '%', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: op }); }); });
    tx(480, 398, '노드를 늘릴 때는 server 한 줄만 더한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) });
  }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'proxy_pass http://backend; 에서 backend는 무엇을 가리키는가?',
      o: ['백엔드 서버의 DNS 호스트 이름', 'http {} 안에 정의한 upstream 풀의 이름', 'location 블록의 이름'], a: 1,
      why: 'upstream backend { … }로 만든 풀 이름을 호스트 자리에 그대로 쓴다. nginx는 이 풀에서 노드 하나를 골라 보낸다.' },
    { q: '옵션 없이 server 세 줄만 적었을 때 요청 9개는 어떻게 나뉘는가?',
      o: ['첫 노드가 모두 받는다', '3 : 3 : 3', '무작위라 매번 다르다'], a: 1,
      why: '모든 노드가 weight=1이라 총 가중치 3을 1:1:1로 나눈다. 9개면 노드마다 정확히 3개다.' },
    { q: 'worker가 여러 개일 때 zone을 선언하면 무엇이 달라지는가?',
      o: ['worker들이 순번을 공유 메모리로 함께 쓴다', '요청이 무작위로 바뀐다', 'worker 수가 하나로 줄어든다'], a: 0,
      why: 'zone이 없으면 worker마다 순번을 따로 들고 있어 동시에 같은 노드를 고를 수 있다. zone은 그 상태를 worker 사이에 공유한다.' },
    { q: 'location /api/ 안에서 proxy_pass http://api_backend/; 일 때 /api/users 요청은 백엔드에 어떤 URI로 가는가?',
      o: ['/api/users', '/users', '/api_backend/users'], a: 1,
      why: 'proxy_pass에 URI(끝의 /)가 붙어 있으면 location이 잡은 /api/ 부분을 그 URI로 바꿔 끼운다. 그래서 /users가 된다.' },
    { q: 'app3이 502를 돌려줬을 때 proxy_next_upstream이 하는 일은 무엇인가?',
      o: ['사용자에게 502를 그대로 돌려준다', 'app3을 즉시 영구 제외한다', '같은 요청을 다음 노드로 다시 보낸다'], a: 2,
      why: 'error, timeout, http_502, http_503에 해당하면 tries 한도(여기서는 2) 안에서 다른 노드로 다시 시도한다. 사용자는 정상 응답을 받는다.' },
  ];

  const summary = [
    '백엔드 여러 대를 upstream 블록 하나로 묶고 proxy_pass에 그 이름을 적는다.',
    '옵션이 없으면 모두 weight=1이라 요청이 1:1:1 순서대로 돈다.',
    'worker마다 순번을 따로 가지므로 정확히 맞추려면 zone으로 공유한다.',
    'max_fails, backup, proxy_next_upstream을 더하면 한 대가 죽어도 응답이 이어진다.',
  ];
  const review = [
    { q: '노드 3대를 RR로 묶었는데 테스트에서 동시 요청 두 건이 모두 app1로 갔다. 먼저 의심할 것은?',
      o: ['upstream 이름 오타', 'worker가 여러 개라 순번을 따로 들고 있다', 'app2, app3이 죽었다'], a: 1,
      why: 'zone이 없으면 worker마다 순번이 따로라 동시에 들어온 요청이 같은 노드로 갈 수 있다. 길게 보면 균등하다.' },
    { q: 'location /api/에 proxy_pass http://api_backend; (끝 슬래시 없음)로 바꾸면 /api/users는 어떻게 전달되는가?',
      o: ['/api/users 그대로', '/users', '/api_backend/api/users'], a: 0,
      why: 'proxy_pass에 URI가 없으면 요청 URI를 바꾸지 않고 넘긴다. 끝 슬래시 하나가 앞부분을 자를지 정한다.' },
    { q: '8 core 한 대와 4 core 두 대를 옵션 없이 RR로 묶었더니 4 core 노드만 느려졌다. 가장 알맞은 조치는?',
      o: ['proxy_next_upstream_tries를 늘린다', 'keepalive를 끈다', '8 core 노드에 weight를 더 준다'], a: 2,
      why: 'RR은 스펙 차이를 모르고 똑같이 나눈다. 큰 노드에 weight를 더 주면 비율대로 더 받아 작은 노드의 짐이 준다.' },
  ];

  R.page({ title: 'upstream 풀과 round-robin', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
