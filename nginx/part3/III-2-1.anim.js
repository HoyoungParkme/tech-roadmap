/* III-2-1 health check — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, clock, terminal, snippet, dbIcon, redisBox } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  function ngx(cx, cy, o) { o = o || {}; const w = o.w || 112, h = o.h || 60;
    const g = card(cx, cy, w, h, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: o.s, op: o.op });
    tx(0, o.sub ? -3 : 6, 'nginx', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC }, g);
    if (o.sub) mono(0, 17, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // st: up | down | standby | recovering
  function node(cx, cy, name, o) { o = o || {}; const st = o.st || 'up', w = o.w || 120, h = 42;
    const col = st === 'down' ? BAD : st === 'recovering' ? WARN : o.hot ? ACC : st === 'standby' ? MUT : INK;
    const g = card(cx, cy, w, h, { rx: 8, stroke: col, sw: o.hot || st === 'down' ? 3 : 2, fill: st === 'down' ? C.BADBG : o.hot ? ACCBG : PANEL, dash: st === 'standby' ? '6 5' : null, s: o.s, op: o.op });
    el('circle', { cx: -w / 2 + 14, cy: 0, r: 5, fill: st === 'down' ? BAD : st === 'recovering' ? WARN : st === 'standby' ? OFF : GOOD }, g);
    mono(-w / 2 + 26, 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: st === 'down' ? BAD : INK }, g); return g; }
  // 실패 칸 n / max
  function fails(x, y, n, max, o) { o = o || {}; for (let j = 0; j < max; j++) { const f = clamp(n - j);
      el('circle', { cx: x + j * 20, cy: y, r: 7, fill: PANEL, stroke: f > 0 ? BAD : MUT, 'stroke-width': 2, opacity: o.op ?? 1 });
      if (f > 0) el('circle', { cx: x + j * 20, cy: y, r: 7 * f, fill: BAD, opacity: o.op ?? 1 }); }
    mono(x + max * 20 + 4, y + 5, `${Math.round(n)}/${max}`, { 'font-size': 14, 'font-weight': 700, fill: n >= max ? BAD : MUT, opacity: o.op ?? 1 }); }
  // 결과 칸 (✓ ✗)
  function marks(x, y, seq, shown, gap) { seq.forEach((ok, j) => { if (j >= shown) return; const s = clamp(shown - j); if (ok) check(x + j * (gap || 34), y, 9, s); else cross(x + j * (gap || 34), y, 8, s); }); }

  const NX = 220, DX = 470, YS = [110, 210, 310];

  // ---------- 1. passive ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || b;
    if (k <= 1) {
      if (k === 0) snippet(24, 24, ['server app1:8000 max_fails=3 fail_timeout=10s;'], { fs: 14 });
      ngx(NX, 210, { s: k === 0 ? pop(u, 0.3) : 1 }); person(60, 210, null, {});
      b.nodes.forEach((n, i) => { node(DX, YS[i], n.name, { s: k === 0 ? pop(u, 0.5 + i * 0.2) : 1 });
        fails(560, YS[i], tween(p.nodes[i].fails, n.fails, u, 1.8), 3, { op: k === 0 ? fade(u, 1.0) : 1 }); });
      if (k === 0) tx(700, 380, '사용자 요청이 곧 검사 재료', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      if (k === 1) { [0.2, 1.1].forEach((a) => { dot([[86, 210], [NX - 56, 210], [NX + 56, 210], [DX - 60, YS[1]]], seg(u, a, a + 0.7), ACC, 7); if (u > a + 0.7) cross(DX + 76, YS[1] - 26, 8, pop(u, a + 0.7)); });
        // 10초 창
        el('line', { x1: 560, y1: 380, x2: 900, y2: 380, stroke: MUT, 'stroke-width': 2 }); [0, 5, 10].forEach((s) => mono(560 + s * 34, 402, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
        el('rect', { x: 560, y: 362, width: 340 * E(u, 0.2, 1.0), height: 12, rx: 3, fill: WARN, opacity: 0.35 });
        [[0.9, 1], [1.8, 2.6]].forEach(([a, s]) => { if (u > a) el('line', { x1: 560 + s * 34, y1: 356, x2: 560 + s * 34, y2: 380, stroke: BAD, 'stroke-width': 3 }); });
        tx(900, 346, '3번 차면 10초간 뺀다', { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 2) { // 무엇이 실패인가
      const yes = ['TCP 연결 실패', 'connect / read timeout', 'proxy_next_upstream 에 적은 응답 코드'], no = ['403, 404 (문서: 절대 실패로 안 셈)', '400 같은 목록에 없는 코드'];
      card(250, 210, 420, 300, { rx: 14, stroke: BAD, sw: 2, s: pop(u, 0.2) }); card(720, 210, 400, 300, { rx: 14, stroke: GRID, sw: 2, s: pop(u, 1.2) });
      lbl(250, 92, 'fails 를 올린다', fade(u, 0.3), { fill: BAD, 'font-size': 17 }); lbl(720, 92, '세지 않는다', fade(u, 1.3), { fill: MUT, 'font-size': 17 });
      yes.forEach((s, i) => { const y = 150 + i * 62; cross(70, y - 5, 8, pop(u, 0.4 + i * 0.3)); tx(92, y, s, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.3), class: i === 2 ? null : null }); });
      no.forEach((s, i) => { const y = 150 + i * 62; check(540, y - 5, 9, pop(u, 1.4 + i * 0.3)); tx(562, y, s, { 'font-size': 15, opacity: fade(u, 1.4 + i * 0.3) }); });
      return; }
    if (k === 3) { // 민감도 비교: 같은 사건(2초, 7초의 실패)을 세 설정으로
      const ev = [2, 7], X = (s) => 330 + s * 26;
      el('line', { x1: X(0), y1: 62, x2: X(20), y2: 62, stroke: MUT, 'stroke-width': 1.8 }); [0, 5, 10, 15, 20].forEach((s) => mono(X(s), 50, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      const rows = [['max_fails=1 fail_timeout=10s', 1, 10, '너무 민감'], ['max_fails=3 fail_timeout=10s', 3, 10, '일반 권장'], ['max_fails=2 fail_timeout=20s', 2, 20, '민감 서비스']];
      rows.forEach(([cfg, mf, ft, h], i) => { const y = 120 + i * 100, op = fade(u, 0.2 + i * 0.5);
        tx(24, y - 4, h, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(24, y + 18, cfg, { 'font-size': 13.5, fill: MUT, opacity: op });
        el('line', { x1: X(0), y1: y, x2: X(20), y2: y, stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: op });
        let out = null; ev.forEach((s, j) => { if (j + 1 >= mf && out == null) out = s; });
        ev.forEach((s) => { if (u > 0.4 + i * 0.5) el('line', { x1: X(s), y1: y - 14, x2: X(s), y2: y + 14, stroke: BAD, 'stroke-width': 3 }); });
        if (out != null) { const w = E(u, 0.8 + i * 0.5, 1.6 + i * 0.5); el('rect', { x: X(out), y: y - 6, width: (Math.min(X(20), X(out + ft)) - X(out)) * w, height: 12, rx: 4, fill: BAD, opacity: 0.55 });
          tx(X(Math.min(20, out + ft)) + 8, y + 5, `${ft}초 제외`, { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4 + i * 0.5) }); }
        else { tx(X(20) + 8, y + 5, '계속 사용', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4 + i * 0.5) }); } });
      tx(480, 400, '같은 글리치 두 번 (2초, 7초)을 설정마다 다르게 판정한다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    // k === 4 트래픽이 없으면 모른다
    ngx(NX, 210); b.nodes.forEach((n, i) => node(DX, YS[i], n.name, { st: i === 1 && u > 0.6 ? 'down' : 'up' }));
    if (u > 1.0) { const s = pop(u, 1.0); card(DX + 110, YS[1], 44, 44, { rx: 22, text: '?', fs: 22, stroke: WARN, color: WARN, s }); }
    const X = (s) => 600 + s * 10;
    el('line', { x1: 600, y1: 370, x2: 920, y2: 370, stroke: MUT, 'stroke-width': 1.8 }); tx(600, 396, '요청 수', { 'font-size': 13.5, fill: MUT });
    const H = [9, 8, 9, 7, 8, 5, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0];
    H.forEach((h, i) => { const g = E(u, 0.2 + i * 0.08, 0.6 + i * 0.08); if (h) el('rect', { x: 604 + i * 20, y: 370 - h * 8 * g, width: 14, height: h * 8 * g, rx: 2, fill: ACC, opacity: 0.8 }); });
    tx(840, 300, '새벽: 요청 0', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
    tx(NX, 320, '판정 재료가 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
  }

  // ---------- 2. active ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { // zone 공유
      [['worker 1', 110], ['worker 2', 310]].forEach(([w, y], i) => card(150, y, 150, 50, { rx: 10, text: w, fs: 15, stroke: INK, s: pop(u, 0.2 + i * 0.2) }));
      card(420, 210, 230, 110, { rx: 12, fill: ACCBG, stroke: ACC, sw: 2.5, s: pop(u, 0.7) });
      if (u > 0.8) { mono(420, 180, 'zone backend 64k', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
        b.nodes.forEach((n, i) => { mono(350, 208 + i * 22, n.name, { 'font-size': 14 }); mono(490, 208 + i * 22, 'up', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end' }); }); }
      grow(226, 120, 304, 180, E(u, 1.2, 1.6), ACC); grow(226, 300, 304, 240, E(u, 1.2, 1.6), ACC);
      b.nodes.forEach((n, i) => node(780, YS[i], n.name, { s: pop(u, 0.4 + i * 0.15) }));
      tx(420, 380, '노드 상태를 worker 들이 같이 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      return; }
    if (k === 1) { // 5초마다 찌른다
      ngx(NX, 200, { sub: 'health_check' }); b.nodes.forEach((n, i) => node(DX + 60, YS[i] - 10, n.name));
      const X = (s) => 120 + s * 24;
      el('line', { x1: X(0), y1: 380, x2: X(30), y2: 380, stroke: MUT, 'stroke-width': 1.8 });
      for (let s = 0; s <= 30; s += 5) { mono(X(s), 404, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); if (s && u > s / 30 * 2.4) el('circle', { cx: X(s), cy: 380, r: 6, fill: ACC }); }
      const ph = (u * 2.5) % 1; YS.forEach((y) => dot([[NX + 56, 200], [DX, y - 10]], ph, ACC, 6));
      mono(800, 200, 'GET /health', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
      [['interval=5s', '5초마다'], ['fails=3', '3번 실패 → 제외'], ['passes=2', '2번 성공 → 복귀']].forEach(([a, d], i) => { const op = fade(u, 0.8 + i * 0.35);
        mono(24, 60 + i * 44, a, { 'font-size': 15, 'font-weight': 800, opacity: op }); tx(24, 80 + i * 44, d, { 'font-size': 13.5, fill: MUT, opacity: op }); });
      tx(800, 240, '사용자 요청과 무관', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      return; }
    if (k === 2) { // match
      snippet(30, 40, ['match server_ok {', '    status 200;', '    body ~ "ok";', '}'], { fs: 15, op: fade(u, 0.2) });
      [['200', '{"status":"ok"}', true], ['200', '{"status":"error"}', false]].forEach(([s, body, ok], i) => { const y = 130 + i * 130, sc = pop(u, 0.6 + i * 0.6);
        card(620, y, 420, 90, { rx: 12, stroke: ok ? GOOD : BAD, sw: 2.5, s: sc }); if (sc < 0.3) return;
        mono(430, y - 10, 'HTTP ' + s, { 'font-size': 16, 'font-weight': 800 }); mono(430, y + 20, body, { 'font-size': 15, fill: MUT });
        if (ok) check(800, y, 14, pop(u, 1.0 + i * 0.6)); else cross(800, y, 12, pop(u, 1.0 + i * 0.6)); });
      tx(620, 380, '상태 코드만 200이어도 본문이 틀리면 탈락', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      return; }
    if (k === 3 || k === 4) { // OpenResty
      card(170, 110, 260, 70, { rx: 10, fill: ACCBG, stroke: ACC, sw: 2, s: pop(u, k === 3 ? 0.2 : 0) });
      mono(170, 106, 'lua_shared_dict', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: k === 3 ? fade(u, 0.3) : 1 });
      mono(170, 128, 'healthcheck 1m', { 'text-anchor': 'middle', 'font-size': 14, opacity: k === 3 ? fade(u, 0.3) : 1 });
      [['worker 1', 260], ['worker 2', 350]].forEach(([w, y], i) => { const s = k === 3 ? pop(u, 0.8 + i * 0.3) : 1;
        card(170, y, 260, 64, { rx: 10, stroke: INK, sw: 2, s }); if (s < 0.3) return;
        tx(60, y - 6, w, { 'font-size': 14.5, 'font-weight': 700 }); mono(60, y + 18, 'init_worker → spawn_checker', { 'font-size': 13.5, fill: MUT });
        grow(270, y - 34, 270, 148, k === 3 ? E(u, 1.4, 1.8) : 1, ACC); });
      ['app1', 'app2', 'app3'].forEach((n, i) => node(800, YS[i], n));
      if (k === 4) { const req = 'GET /health HTTP/1.0\\r\\n\\r\\n', n = Math.round(E(u, 0.2, 1.4) * req.length);
        card(560, 210, 330, 70, { rx: 10, stroke: INK, sw: 2 }); tx(410, 196, 'http_req (원문 그대로 보낸다)', { 'font-size': 13.5, fill: MUT });
        mono(410, 226, req.slice(0, n), { 'font-size': 15, 'font-weight': 700 });
        mono(560, 300, 'upstream = "backend"', { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
        YS.forEach((y, i) => dot([[730, 210], [740, y]], seg(u, 1.6 + i * 0.2, 2.2 + i * 0.2), ACC, 6)); }
      else { grow(300, 110, 734, YS[1], E(u, 1.8, 2.4), ACC, { dash: '6 5' }); sub(560, 390, 'OSS 에는 health_check 가 없어서', fade(u, 2.0), { 'font-weight': 700 }); }
      return; }
    // k === 5 fall=3, rise=2 판정 흐름
    const seq = [1, 1, 0, 0, 0, 0, 1, 1, 1], X = (j) => 120 + j * 86;
    let state = 'up', bad = 0, good = 0; const st = seq.map((ok) => { if (ok) { good++; bad = 0; if (state === 'down' && good >= 2) state = 'up'; } else { bad++; good = 0; if (state === 'up' && bad >= 3) state = 'down'; } return state; });
    const shown = seg(u, 0.2, 2.2) * seq.length;
    el('line', { x1: X(0) - 30, y1: 220, x2: X(8) + 30, y2: 220, stroke: MUT, 'stroke-width': 1.8 });
    seq.forEach((ok, j) => { if (j >= shown) return; const s = clamp(shown - j);
      mono(X(j), 250, (j * 5) + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); if (ok) check(X(j), 190, 11, s); else cross(X(j), 190, 9, s);
      el('rect', { x: X(j) - 40, y: 290, width: 80, height: 34, rx: 6, fill: st[j] === 'up' ? C.GOODBG : C.BADBG, stroke: st[j] === 'up' ? GOOD : BAD, 'stroke-width': 1.5, opacity: s });
      mono(X(j), 312, st[j], { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: st[j] === 'up' ? GOOD : BAD, opacity: s }); });
    R.spans(60, 70, [['interval = 5000', { 'font-weight': 700 }], ['  timeout = 2000  ', { fill: MUT }], ['fall = 3', { fill: BAD, 'font-weight': 700 }], ['  rise = 2', { fill: GOOD, 'font-weight': 700 }]], { 'font-size': 15.5 });
    tx(480, 380, '실패 3번 연속에 down, 성공 2번 연속에 up', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
  }

  // ---------- 3. /health 엔드포인트 ----------
  function s3(t, c) { const { k, u } = c;
    const AX = 300, AY = 210;
    card(AX, AY, 220, 190, { rx: 14, stroke: INK, sw: 2.5, s: k === 0 ? pop(u, 0.2) : 1 });
    tx(AX - 96, AY - 70, 'FastAPI app', { 'font-size': 15, 'font-weight': 800 });
    if (k === 0) { if (u > 0.6) clock(AX, AY + 10, 34, ((u - 0.6) / 2) % 1, ACC); mono(AX, AY + 74, 'START_TIME', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      tx(700, 200, 'uptime = 지금 − START_TIME', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
      tx(700, 230, '값이 작으면 방금 재시작했다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    const eps = k >= 2 ? ['/health', '/health/ready'] : ['/health'];
    eps.forEach((e, i) => card(AX, AY - 30 + i * 56, 170, 40, { rx: 8, text: 'GET ' + e, fs: 14, mono: true, stroke: (k === 1 && i === 0) || (k >= 2 && i === 1) ? ACC : GRID, s: k === 2 && i === 1 ? pop(u, 0.3) : 1 }));
    dbIcon(760, 120, 'DB', { s: 0.8 }); redisBox(760, 310, { w: 110, h: 50, s: 0.9 });
    if (k === 1) { el('line', { x1: AX + 112, y1: AY - 30, x2: 700, y2: 130, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); cross(560, 160, 10, pop(u, 0.8));
      fly(40, AY - 30, AX - 90, AY - 30, seg(u, 0.2, 0.8), 'GET /health', { mono: true });
      card(540, 380, 260, 40, { rx: 8, text: '200 {"status":"ok"}', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.2) });
      sub(560, 190, 'DB 를 건드리지 않는다', fade(u, 1.0), { fill: BAD, 'font-weight': 700 }); return; }
    // readiness: checks 딕셔너리
    const db = k >= 3 ? (k === 3 ? (u < 1.4 ? 'ok' : 'fail') : 'ok') : null, rd = k >= 4 ? (k === 4 ? (u < 1.4 ? 'ok' : 'fail') : 'ok') : null;
    const lines = ['checks = {'];
    if (db) lines.push(`  "db": "${db}",`); if (rd) lines.push(`  "redis": "${rd}",`); lines.push('}');
    card(560, 70, 230, 24 * lines.length + 22, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.5, s: k === 2 ? pop(u, 0.8) : 1 });
    lines.forEach((l, i) => mono(460, 70 - (24 * lines.length) / 2 + 22 + i * 24, l, { 'font-size': 14.5, fill: l.includes('fail') ? BAD : INK, opacity: k === 2 ? fade(u, 0.9) : 1 }));
    if (k === 3) { grow(AX + 112, AY + 26, 710, 130, E(u, 0.3, 0.9), ACC); if (u > 1.4) cross(760, 70, 10, pop(u, 1.4)); }
    if (k === 4) { grow(AX + 112, AY + 26, 700, 300, E(u, 0.3, 0.9), ACC); if (u > 1.4) cross(830, 280, 10, pop(u, 1.4)); }
    const fail = (k === 3 || k === 4) && u > 1.4, ok5 = k === 5;
    if (fail) { card(300, 370, 300, 44, { rx: 8, text: '503 → LB 가 잠시 뺀다', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.6) }); }
    if (ok5) { card(560, 380, 520, 44, { rx: 8, text: '200 {"status":"ready","uptime":…,"checks":{…}}', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.5) });
      pill(150, 76, 'access_log off', MUT, pop(u, 1.4), { mono: true, fs: 13.5 }); }
  }

  // ---------- 4. 노드 down → 자동 제외 ----------
  // nginx 라운드로빈을 그대로 돌린 결과 (worker 1개, app2 down, max_fails=3): 요청 2·5·8 은 app2 를 먼저 시도하다 실패
  const SERVED = [1, 3, 3, 1, 3, 1, 3, 1].concat(Array.from({ length: 22 }, (_, i) => (i % 2 ? 1 : 3)));
  const TRIED2 = new Set([1, 4, 7]);
  function grid(n, o) { o = o || {}; for (let i = 0; i < 30; i++) { const x = 60 + (i % 10) * 60, y = 64 + Math.floor(i / 10) * 56, on = i < n;
      card(x, y, 52, 44, { rx: 6, stroke: on ? (SERVED[i] === 1 ? ACC : INFO) : GRID, sw: 1.8, fill: on ? PANEL : SOFT, op: o.op ?? 1 });
      mono(x - 20, y - 8, String(i + 1), { 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 });
      if (on) mono(x, y + 14, 'app' + SERVED[i], { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: SERVED[i] === 1 ? ACC : INFO, opacity: o.op ?? 1 });
      if (on && TRIED2.has(i)) cross(x + 18, y - 14, 5, o.op ?? 1); } }
  function right4(f, down, o) { o = o || {}; ['app1', 'app2', 'app3'].forEach((n, i) => { const y = 70 + i * 80; node(800, y, n + ':8000', { w: 140, st: i === 1 && down ? 'down' : 'up' });
      if (i === 1) fails(745, y + 36, f, 3); });
    if (o.cnt) o.cnt.forEach((v, i) => mono(890, 75 + i * 80, '×' + v, { 'font-size': 16, 'font-weight': 800, fill: i === 1 ? BAD : ACC })); }
  function s4(t, c) { const { k, u } = c;
    const upto = [0, 5, 8, 30, 30, 30][k], from = [0, 0, 5, 8, 30, 30][k], n = Math.round(lerp(from, upto, E(u, 0.2, 2.2))), f = Math.min(3, [...TRIED2].filter((i) => i < n).length);
    grid(k === 0 ? 0 : n, { op: k >= 4 ? 0.35 : 1 });
    right4(k === 0 ? 0 : f, k === 0 ? u > 0.8 : true, { cnt: k === 3 && u > 2.2 ? [15, 0, 15] : null });
    if (k === 0) { pill(320, 280, '$ docker stop app2', INK, pop(u, 0.3), { mono: true, fs: 15 });
      tx(320, 340, '요청 30번을 보낸다. nginx 는 아직 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) }); return; }
    if (k === 1) tx(330, 260, '✕ = app2 를 먼저 시도했다가 실패, 다음 노드가 응답', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
    if (k === 2 && u > 2.0) { card(800, 300, 200, 40, { rx: 8, text: '10초 동안 제외', fs: 15, fill: C.BADBG, stroke: BAD, color: BAD, s: pop(u, 2.0) }); }
    if (k === 3) tx(330, 260, '8번째 요청 뒤로는 app1, app3 만 번갈아', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
    if (k === 4) terminal(30, 220, 640, 170, ['[error] connect() failed (111: Connection refused)', '        while connecting to upstream, upstream: app2 ×3', '[warn]  upstream server temporarily disabled', '        while connecting to upstream'], E(u, 0.2, 1.8) * 4, { title: 'error.log', fs: 13.5 });
    if (k === 5) { banner(330, 270, '사용자가 받은 응답 30 / 30 성공', pop(u, 0.3));
      card(330, 360, 560, 70, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, 1.0) });
      if (u > 1.1) { mono(70, 352, 'stub_status: Active connections, accepts, handled,', { 'font-size': 13.5 }); mono(70, 374, '             requests, Reading, Writing, Waiting', { 'font-size': 13.5 });
        tx(620, 300, '노드별 상태는 없다', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); } }
  }

  // ---------- 5. 복구 시 자동 복귀 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // fail_timeout 의 두 역할
      const X = (s) => 120 + s * 30;
      el('line', { x1: X(0), y1: 250, x2: X(25), y2: 250, stroke: MUT, 'stroke-width': 1.8 }); [0, 5, 10, 15, 20, 25].forEach((s) => mono(X(s), 274, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      [1, 2, 3].forEach((s, i) => { if (u > 0.3 + i * 0.3) cross(X(s), 230, 7, pop(u, 0.3 + i * 0.3)); });
      el('rect', { x: X(0), y: 170, width: 300 * E(u, 0.4, 1.0), height: 18, rx: 4, fill: WARN, opacity: 0.4 }); tx(X(0), 160, '판정 창 10s · 3번 차면', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
      el('rect', { x: X(3), y: 300, width: 300 * E(u, 1.2, 1.9), height: 18, rx: 4, fill: BAD, opacity: 0.5 }); tx(X(3), 340, '제외 10s', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      if (u > 2.0) { dot([[X(13), 380], [X(13), 260]], seg(u, 2.0, 2.5), ACC, 7); tx(X(13) + 12, 392, '끝나면 요청 하나로 다시 확인', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); }
      snippet(30, 30, ['server app2:8000 max_fails=3 fail_timeout=10s;'], { fs: 14 });
      return; }
    if (k === 1) { ngx(NX, 200); ['app1', 'app2', 'app3'].forEach((n, i) => node(DX, 90 + i * 80, n + ':8000', { w: 140 }));
      node(DX, 340, 'backup1:8000', { w: 150, st: 'standby', s: pop(u, 0.3) }); sub(DX + 90, 345, '메인이 전부 빠졌을 때만', fade(u, 0.6), { 'text-anchor': 'start', 'font-weight': 700 });
      for (let i = 0; i < 4; i++) el('line', { x1: NX + 56, y1: 185 + i * 10, x2: DX - 72, y2: 90 + i * 53, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.0 + i * 0.15) * 0.7 });
      card(780, 150, 220, 64, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.4) }); if (u > 1.5) { mono(780, 146, 'keepalive 32;', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC }); sub(780, 168, '연결 재사용', 1); }
      return; }
    if (k === 2) { ngx(NX + 120, 210); person(60, 210, null, {});
      fly(90, 190, NX + 60, 190, seg(u, 0.2, 0.9), '/health', { mono: true }); if (u > 0.9) fly(NX + 120, 170, 90, 120, seg(u, 0.9, 1.6), '200 nginx ok', { mono: true, fill: GOOD, stay: true });
      fly(90, 236, NX + 60, 236, seg(u, 1.4, 2.0), '/api/users', { mono: true }); grow(NX + 176, 210, 720, 210, E(u, 1.9, 2.3), ACC); node(800, 210, 'backend', { w: 140 });
      mono(NX + 120, 300, 'location = /health { return 200; }', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.6) });
      sub(NX + 120, 330, '정확히 /health 만, 백엔드로 넘기지 않는다', fade(u, 1.0), { 'font-weight': 700, fill: ACC });
      return; }
    if (k === 3) { ngx(NX, 210); ['app1', 'app2', 'app3'].forEach((n, i) => node(DX + 40, YS[i], n + ':8000', { w: 140, st: i === 1 ? 'down' : 'up', hot: i === 0 && u > 2.0 }));
      dot([[NX + 56, 210], [DX - 32, YS[1]]], seg(u, 0.2, 0.7), ACC, 7); clock(DX + 150, YS[1], 18, E(u, 0.7, 1.5), WARN, '3s'); if (u > 1.5) cross(DX - 50, YS[1] - 20, 8, pop(u, 1.5));
      dot([[DX - 32, YS[1]], [NX + 56, 210], [DX - 32, YS[0]]], seg(u, 1.5, 2.0), WARN, 7);
      mono(NX, 300, u < 1.5 ? '시도 1 / 3' : '시도 2 / 3', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: u < 1.5 ? ACC : WARN });
      mono(30, 390, 'proxy_next_upstream error timeout http_502 http_503 http_504;', { 'font-size': 13.5, opacity: fade(u, 0.3) });
      return; }
    if (k === 4) { // compose healthcheck
      card(160, 200, 220, 120, { rx: 12, stroke: INK, sw: 2 }); tx(70, 166, '컨테이너 app2', { 'font-size': 15, 'font-weight': 700 });
      const seq = [1, 1, 0, 0, 0], X = (j) => 340 + j * 110, shown = seg(u, 0.2, 1.8) * 5;
      el('line', { x1: X(0) - 30, y1: 240, x2: X(4) + 30, y2: 240, stroke: MUT, 'stroke-width': 1.8 });
      seq.forEach((ok, j) => { if (j >= shown) return; mono(X(j), 266, (j * 30) + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); if (ok) check(X(j), 212, 10, clamp(shown - j)); else cross(X(j), 212, 8, clamp(shown - j)); });
      const unh = u > 1.9; card(160, 216, 160, 36, { rx: 18, text: unh ? 'unhealthy' : 'healthy', fs: 15, mono: true, stroke: unh ? BAD : GOOD, color: unh ? BAD : GOOD });
      mono(30, 60, 'healthcheck: curl -f localhost:8000/health', { 'font-size': 14, opacity: fade(u, 0.1) }); mono(30, 84, 'interval 30s · timeout 3s · retries 3', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.1) });
      tx(480, 350, '상태 표시까지만. 재시작은 restart 정책·오케스트레이터 몫', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) });
      return; }
    // k === 5 두 장치 + 복귀: fail_timeout 지난 뒤 app2 가 살아 있으면 순번에 다시 들어온다 (nginx 규칙 재현)
    const AFTER = [3, 1, 2, 3, 1, 2];
    card(190, 110, 300, 90, { rx: 12, stroke: GRID, sw: 2 }); tx(60, 92, 'Docker', { 'font-size': 15, 'font-weight': 700 }); tx(60, 120, '컨테이너 상태 표시·재기동', { 'font-size': 14, fill: MUT });
    card(190, 260, 300, 90, { rx: 12, stroke: ACC, sw: 2 }); tx(60, 242, 'nginx', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(60, 270, 'fail_timeout 뒤 요청으로 확인', { 'font-size': 14, fill: MUT });
    tx(190, 380, '서로 모른 채 각자 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
    node(760, 70, 'app2:8000', { w: 140, st: u < 0.9 ? 'recovering' : 'up' });
    tx(600, 140, '11초 뒤 요청 6개', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
    AFTER.forEach((w, j) => { const s = pop(u, 1.0 + j * 0.2), x = 620 + j * 52; card(x, 190, 46, 40, { rx: 6, text: 'app' + w, fs: 13.5, mono: true, s, stroke: w === 2 ? GOOD : GRID, color: w === 2 ? GOOD : INK, fill: w === 2 ? C.GOODBG : PANEL }); });
    tx(750, 260, 'app2 가 다시 순번에 들어온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) });
  }

  const quiz = [
    { q: 'max_fails=3 fail_timeout=10s에서 fail_timeout이 맡는 두 가지 역할은 무엇인가?',
      o: ['연결 타임아웃과 응답 타임아웃', '실패를 세는 창과 노드를 빼 두는 기간', '재시도 간격과 재시도 횟수'], a: 1,
      why: '10초 안에 3번 실패하면 그 노드를 10초 동안 뺀다. 값 하나가 판정 창과 제외 기간을 함께 정한다.' },
    { q: 'active health check가 passive보다 나은 점은 무엇인가?',
      o: ['사용자 트래픽이 없어도 노드 상태를 안다', '설정이 필요 없다', 'OSS nginx에 기본으로 들어 있다'], a: 0,
      why: '5초마다 /health를 직접 찔러 보므로 요청이 없는 새벽에도 죽은 노드를 찾는다. OSS에서는 OpenResty와 Lua로 대신한다.' },
    { q: 'liveness 경로(/health)에 DB 조회를 넣으면 안 되는 이유는 무엇인가?',
      o: ['응답 JSON이 길어져서', 'DB 장애가 모든 컨테이너 재시작으로 번져서', 'nginx가 /health를 거부해서'], a: 1,
      why: 'liveness가 실패하면 컨테이너를 재시작한다. DB만 아파도 멀쩡한 앱이 모두 재시작된다. DB 확인은 readiness에 둔다.' },
    { q: 'app2를 끈 뒤 요청 30번을 보냈을 때 사용자가 받은 실패 응답은 몇 번인가?',
      o: ['3번', '0번', '10번'], a: 1,
      why: 'app2를 시도한 세 번은 next_upstream이 곧바로 다른 노드로 다시 보냈다. 세 번째 실패 뒤로는 app2를 아예 고르지 않는다.' },
    { q: 'docker compose의 healthcheck가 unhealthy를 표시하면 일반 compose 환경에서 무슨 일이 일어나는가?',
      o: ['컨테이너가 자동으로 재시작된다', 'nginx가 그 노드를 바로 뺀다', '상태만 표시되고 재시작은 하지 않는다'], a: 2,
      why: 'compose healthcheck는 상태를 표시할 뿐이다. nginx는 이를 모르고 자기 max_fails로 따로 판정한다.' },
  ];

  const summary = [
    'passive 검사는 실제 요청 실패를 세고, 10초 안에 3번이면 10초 동안 뺀다.',
    '요청이 없으면 passive는 아무것도 모르므로 active 검사가 5초마다 직접 찌른다.',
    '백엔드는 가벼운 /health와 DB, Redis를 보는 /health/ready를 나눠 둔다.',
    'app2를 꺼도 재시도 덕에 30번 중 실패 응답은 0번이고 fail_timeout 뒤 저절로 돌아온다.',
  ];
  const review = [
    { q: '밤사이 app3이 죽었는데 아침 첫 사용자들이 에러를 겪었다. passive만 쓰는 환경이다. 가장 알맞은 보완은?',
      o: ['active health check 추가', 'max_fails를 10으로 올리기', 'keepalive 끄기'], a: 0,
      why: 'passive는 요청이 실패해야 안다. 트래픽이 없는 시간에는 판정할 재료가 없으니 주기적으로 찌르는 active 검사가 필요하다.' },
    { q: '/health/ready가 Redis 장애로 503을 돌려준다. nginx와 LB 쪽에서 기대하는 동작은?',
      o: ['컨테이너를 지우고 새로 만든다', '그 노드를 잠시 트래픽에서 뺀다', '503을 사용자에게 그대로 보낸다'], a: 1,
      why: '503은 지금은 빼 달라는 신호다. readiness 실패는 재시작이 아니라 일시 제외로 이어져야 한다.' },
    { q: 'max_fails=1로 바꿨더니 순간적인 네트워크 끊김에도 노드가 자주 빠진다. 무엇이 문제인가?',
      o: ['fail_timeout이 너무 길다', 'backup 노드가 없다', '한 번의 글리치로도 제외되는 민감한 설정'], a: 2,
      why: '실패 한 번에 바로 빼면 일시적 오류도 장애로 판정한다. 일반 서비스는 3번에 10초 정도가 무난하다.' },
  ];

  R.page({ title: '노드 상태 검사와 자동 제외', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
