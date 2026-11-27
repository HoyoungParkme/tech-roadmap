/* II-2-1 lease — TTL·renew·revoke — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 자격증명에 붙는 계약서(lease), 줄어드는 TTL 고리, renew 마다 다시 차오르는 톱니 그래프와 max_ttl 울타리,
 *       42개 lease 가 한 번에 꺼지는 prefix 회수, Pod 안 Vault Agent 사이드카.
 * 남은 초(remain)는 STEPS 의 lease 데이터에서 읽는다. 24h 동안의 톱니 모양은 renew 간격을 50분으로 둔 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    server, dbIcon, person, cross, check, lock, clock, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function vault(cx, cy, w, h, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    const dx = -w / 2 + 26, dy = -h / 2 + 26;
    el('circle', { cx: dx, cy: dy, r: 13, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + (o.spin || 0); el('line', { x1: dx, y1: dy, x2: dx + Math.cos(a) * 9, y2: dy + Math.sin(a) * 9, stroke: ACC, 'stroke-width': 2 }, g); }
    tx(dx + 22, dy + 6, 'Vault', { 'font-size': 17, 'font-weight': 800, fill: ACC }, g); return g; }
  function cmd(x, y, s, u, o) { o = o || {}; const w = o.w || tw('$ ' + s, 14) + 28; el('rect', { x, y: y - 20, width: w, height: 30, rx: 7, fill: INK });
    mono(x + 12, y, '$ ' + s.slice(0, Math.round(s.length * clamp(u ?? 1))), { 'font-size': 14, fill: PANEL }); }
  // TTL 고리: 남은 초 / 3600
  function ring(cx, cy, r, sec, o) { o = o || {}; const f = clamp(sec / 3600);
    el('circle', { cx, cy, r, fill: 'none', stroke: SOFT, 'stroke-width': 16 });
    if (f > 0.001) { const a = -Math.PI / 2 + f * 2 * Math.PI, big = f > 0.5 ? 1 : 0;
      el('path', { d: f >= 0.999 ? `M${cx},${cy - r} A${r},${r} 0 1 1 ${cx - 0.01},${cy - r}` : `M${cx},${cy - r} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`, fill: 'none', stroke: o.col || (f < 0.34 ? WARN : ACC), 'stroke-width': 16, 'stroke-linecap': 'round' }); }
    mono(cx, cy + 4, String(Math.round(sec)), { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: o.col || INK });
    tx(cx, cy + 28, o.label || '남은 초 (ttl)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
  // 계약서: 접힌 귀퉁이가 있는 종이 + 줄
  function contract(x, y, w, h, rows, o) { o = o || {}; const op = o.op ?? 1;
    el('path', { d: `M${x},${y} H${x + w - 22} L${x + w},${y + 22} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: o.col || ACC, 'stroke-width': 2.2, opacity: op });
    el('path', { d: `M${x + w - 22},${y} V${y + 22} H${x + w}`, fill: 'none', stroke: o.col || ACC, 'stroke-width': 2, opacity: op });
    tx(x + 14, y + 26, o.title || 'lease', { 'font-size': 15, 'font-weight': 800, fill: o.col || ACC, opacity: op });
    rows.forEach(([a, b, f], i) => { const ro = f == null ? op : Math.min(op, f);
      mono(x + 14, y + 56 + i * 28, a, { 'font-size': 13.5, fill: MUT, opacity: ro }); mono(x + 150, y + 56 + i * 28, b, { 'font-size': 14, 'font-weight': 700, opacity: ro, fill: o.dead ? OFF : INK }); }); }
  const remain = (c) => { const p = c.prev && c.prev.lease, b = c.beat.lease; return tween(p ? p.remain : null, b.remain, c.u); };

  // ---------- 1. lease = 기간 계약서 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) {
      server(90, 110, 'app', { s: 0.8 });
      vault(380, 110, 200, 120);
      if (k === 0) { pill(230, 30, 'vault read database/creds/app', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); dot([[135, 110], [280, 110]], seg(u, 0.5, 1.1), ACC, 7); }
      const sp = k === 0 ? E(u, 1.2, 2.0) : 1; // 응답이 두 장으로 갈라진다
      card(lerp(380, 200, sp), lerp(200, 290, sp), 300, 92, { rx: 10, stroke: INK, sw: 2, op: k === 0 ? fade(u, 1.1) : 1 });
      tx(lerp(380, 200, sp) - 134, lerp(200, 290, sp) - 18, '자격증명', { 'font-size': 15, 'font-weight': 800, opacity: k === 0 ? fade(u, 1.1) : 1 });
      mono(lerp(380, 200, sp) - 134, lerp(200, 290, sp) + 16, 'v-token-app-8xk2 / A1!xYz9', { 'font-size': 14, opacity: k === 0 ? fade(u, 1.1) : 1 });
      contract(lerp(380, 560, sp) - 0, lerp(160, 200, sp), 340, k === 1 ? 160 : 92, k === 1 ? [['lease_id', 'database/creds/app/8xk2aB…', fade(u, 0.3)], ['lease_duration', '1h', fade(u, 0.8)], ['lease_renewable', 'true', fade(u, 1.3)]] : [],
        { op: k === 0 ? fade(u, 1.1) : 1 });
      if (k === 0) { el('line', { x1: 350, y1: 290, x2: 560, y2: 240, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '5 5', opacity: fade(u, 2.0) });
        tx(560, 330, '자격증명과 계약서가 한 몸으로 나온다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      if (k === 1) { el('line', { x1: 350, y1: 290, x2: 560, y2: 260, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '5 5' });
        tx(560, 395, '렌트카 계약처럼 번호·기한·연장 여부가 적힌다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 2) { // 세 값: lease_id · ttl · max_ttl
      const ax = R.axes(80, 230, 800, 60, { x: [0, 24], y: [0, 1], xt: [0, 1, 6, 12, 18, 24], xl: '발급 후 시간 (h)' });
      pill(200, 80, 'lease_id', ACC, pop(u, 0.2), { mono: true, fs: 15 }); tx(200, 124, '발급마다 하나, 감사·회수 단위', { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.4) });
      el('rect', { x: ax.X(0), y: 244, width: (ax.X(1) - ax.X(0)) * E(u, 0.7, 1.2), height: 26, rx: 4, fill: ACC });
      mono(ax.X(1) + 10, 263, 'ttl 1h = 3600초', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) });
      el('line', { x1: ax.X(24), y1: 160, x2: ax.X(24), y2: 290, stroke: BAD, 'stroke-width': 3.5, opacity: fade(u, 1.6) });
      mono(ax.X(24), 150, 'max_ttl 24h = 86400초', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      tx(ax.X(24) - 4, 200, '연장해도 못 넘는 울타리', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.0) }); return; }
    // k3: KV 와 차이
    [['secret/ (KV 정적 값)', MUT, 'api_key = …', '그대로 남는다', false], ['database/creds (동적)', ACC, 'v-token-app-8xk2', 'lease 1h 뒤 회수', true]].forEach(([h, col, v, d, dyn], j) => {
      const x = 60 + j * 450, s = pop(u, 0.2 + j * 0.7);
      card(x + 190, 200, 380, 220, { rx: 12, stroke: col, sw: 2.5, s });
      tx(x + 30, 120, h, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: s });
      mono(x + 30, 172, v, { 'font-size': 16, 'font-weight': 700, opacity: s });
      if (dyn) clock(x + 80, 240, 28, 1 - E(u, 1.2, 2.8) * 0.5, WARN); else tx(x + 80, 254, '∞', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: MUT, opacity: s });
      tx(x + 140, 248, d, { 'font-size': 16, opacity: fade(u, 0.5 + j * 0.7) }); });
    tx(480, 370, 'lease는 동적 시크릿에만 붙어 짧은 수명을 강제한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // ---------- 2. TTL 시계가 흐른다 ----------
  function s2(t, c) { const { k, u } = c, sec = remain(c);
    ring(800, 150, 78, k === 4 ? lerp(2400, 0, E(u, 0.4, 2.4)) : sec, { label: k === 4 ? '방치하면' : '남은 초 (ttl)' });
    if (k === 0) { server(90, 130, 'app', { s: 0.8 }); dbIcon(430, 130, 'PostgreSQL');
      grow(140, 130, 380, 130, E(u, 0.3, 1.1), ACC); pill(260, 90, 'user=v-token-app-8xk2', ACC, pop(u, 0.9), { mono: true, fs: 13.5 });
      tx(40, 300, '일을 하는 동안에도 시계는 흐른다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(800, 270, '3600에서 줄어드는 중', fade(u, 1.8)); return; }
    if (k <= 2) { cmd(30, 50, 'vault lease lookup database/creds/app/8xk2aB…', E(u, 0.1, 0.8));
      const rows = [['id', 'database/creds/app/8xk2aB…'], ['ttl', String(Math.round(sec))], ['issue_time', '2026-08-11T09:00:00Z'], ['expire_time', '2026-08-11T10:00:00Z'], ['renewable', 'true']];
      el('rect', { x: 30, y: 80, width: 560, height: 170, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      rows.forEach(([a, b], i) => { const op = k === 1 ? fade(u, 0.6 + i * 0.2) : 1, hot = (k === 2 && (i === 1 || i === 3));
        if (hot) el('rect', { x: 36, y: 88 + i * 30, width: 548, height: 28, rx: 5, fill: i === 1 ? WARNBG : ACCBG });
        mono(46, 107 + i * 30, a, { 'font-size': 14, fill: MUT, opacity: op }); mono(190, 107 + i * 30, b, { 'font-size': 14, 'font-weight': 700, opacity: op, fill: i === 1 ? WARN : INK }); });
      if (k === 2) { const ax = R.axes(60, 320, 520, 1, { x: [0, 60], y: [0, 1], xt: [0, 20, 40, 60], xl: '09:00부터 분' });
        el('rect', { x: ax.X(0), y: 300, width: ax.X(60) - ax.X(0), height: 20, rx: 4, fill: SOFT });
        el('rect', { x: ax.X(0), y: 300, width: (ax.X(20) - ax.X(0)) * E(u, 0.3, 1.2), height: 20, rx: 4, fill: OFF });
        el('line', { x1: ax.X(20), y1: 290, x2: ax.X(20), y2: 328, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.2) }); mono(ax.X(20), 284, '지금', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 1.2) });
        mono(ax.X(60), 284, 'expire_time', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) }); }
      else tx(30, 300, 'lease_id 하나로 언제든 상태를 본다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) { cmd(30, 50, 'vault lease lookup -format=json …/8xk2aB… | jq .data', E(u, 0.1, 0.8));
      const J = ['{', '  "ttl": 2400,', '  "renewable": true,', '  "expire_time": "2026-08-11T10:00:00Z"', '}'];
      el('rect', { x: 30, y: 80, width: 520, height: 150, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      J.forEach((s, i) => mono(46, 106 + i * 26, s, { 'font-size': 14.5, 'font-weight': i === 1 ? 800 : 500, fill: i === 1 ? WARN : INK, opacity: fade(u, 0.5 + i * 0.15) }));
      // 감시 스크립트가 ttl 을 집어 간다
      card(300, 320, 220, 60, { rx: 10, stroke: INFO, sw: 2, text: '감시 스크립트', fs: 15, s: pop(u, 1.3) });
      fly(140, 132, 300, 300, seg(u, 1.5, 2.2), 'ttl 2400', { fill: WARN, mono: true });
      tx(560, 330, '사람 대신 스크립트가 만료를 본다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k4
    server(90, 130, 'app', { s: 0.8 }); dbIcon(430, 130, 'PostgreSQL');
    const cut = E(u, 2.2, 2.6); el('line', { x1: 140, y1: 130, x2: 380, y2: 130, stroke: cut > 0.5 ? OFF : ACC, 'stroke-width': 2.5, 'stroke-dasharray': cut > 0.5 ? '6 6' : null });
    if (cut > 0.5) cross(260, 130, 12, pop(u, 2.2));
    tx(40, 300, '아무 조치가 없으면 0이 되고 자동 폐기된다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
    tx(40, 330, '갈림길: renew 하거나, 그냥 두거나', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); }

  // ---------- 3. renew 와 max_ttl ----------
  // 톱니: 시각 t0 에 TTL 이 v0 에서 시작해 초당 1씩 줄어든다(그래프 단위 h, 초)
  function saw(ax, pts, u, col, o) { R.line(ax, pts, u, col || ACC, Object.assign({ sw: 3 }, o || {})); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const ax = R.axes(90, 70, 520, 230, { x: [0, 2], y: [0, 3600], xt: [0, 0.5, 1, 1.5, 2], yt: [0, 1800, 3600], grid: true, xl: '발급 후 시간 (h)', yl: '남은 ttl (초)' });
      const A = [[0, 3600], [0.333, 2400]], B = [[0.333, 3600], [0.5, 3000]], Cc = [[0.5, 1800], [1, 0]];
      saw(ax, A, k === 0 ? E(u, 0.1, 0.7) : 1, OFF);
      if (k === 0) { const j = E(u, 0.8, 1.3); el('line', { x1: ax.X(0.333), y1: ax.Y(2400), x2: ax.X(0.333), y2: ax.Y(lerp(2400, 3600, j)), stroke: ACC, 'stroke-width': 3 });
        if (j >= 1) saw(ax, [[0.333, 3600], [1.333, 0]], E(u, 1.3, 2.3), ACC, { dash: '6 5' });
        mono(ax.X(0.333) + 8, ax.Y(3600) - 8, 'renew', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
        cmd(640, 120, 'vault lease renew …/8xk2aB…', E(u, 0.2, 0.9), { w: 300 });
        mono(640, 165, 'lease_duration   1h', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
        tx(640, 210, '2400에서 3600으로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
        tx(640, 236, '계정과 lease_id는 그대로', { 'font-size': 15, opacity: fade(u, 2.0) }); return; }
      saw(ax, B, E(u, 0.1, 0.6), OFF);
      const j = E(u, 0.7, 1.2); el('line', { x1: ax.X(0.5), y1: ax.Y(3000), x2: ax.X(0.5), y2: ax.Y(lerp(3000, 1800, j)), stroke: INFO, 'stroke-width': 3 });
      if (j >= 1) saw(ax, Cc, E(u, 1.2, 2.2), INFO, { dash: '6 5' });
      mono(ax.X(0.5) + 8, ax.Y(1800) - 10, '-increment=1800', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
      tx(640, 140, '지금부터 30m만', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.3) });
      tx(640, 168, '끝에 더하는 게 아니라', { 'font-size': 15, opacity: fade(u, 1.6) }); tx(640, 194, '지금 시각에서 센다', { 'font-size': 15, opacity: fade(u, 1.6) });
      tx(640, 240, '필요한 만큼만 열어 둔다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k2·k3: 하루 전체. renew 를 50분마다 했다고 치면(예시) 톱니가 24h 울타리까지 간다
    const ax = R.axes(90, 70, 640, 230, { x: [0, 26], y: [0, 3600], xt: [0, 6, 12, 18, 24], yt: [0, 1800, 3600], grid: true, xl: '발급 후 시간 (h)', yl: '남은 ttl (초)' });
    // 50분마다 renew(예시): 22.5h 까지는 3600 으로 다시 찬다. 23h20m 에는 24h 까지 남은 2400 초로 잘리고, 23h45m 의 renew 는 남은 900 초(15m) 그대로다
    const P = []; for (let i = 0; i < 27; i++) { P.push([i * 0.8333, 3600]); P.push([(i + 1) * 0.8333, 600]); } P.push([23.333, 600], [23.333, 2400], [24, 0]);
    el('line', { x1: ax.X(24), y1: 60, x2: ax.X(24), y2: 300, stroke: BAD, 'stroke-width': 3.5 }); mono(ax.X(24), 54, 'max_ttl 24h', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
    saw(ax, P, k === 2 ? E(u, 0.1, 1.6) : 1, ACC, { sw: 2 });
    if (k === 2) { const w = fade(u, 1.7);
      el('rect', { x: 300, y: 330, width: 640, height: 74, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: w });
      mono(316, 356, 'WARNING! TTL of "1h" exceeded the effective', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: w });
      mono(316, 382, 'max_ttl of "15m"; TTL value is capped accordingly', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: w });
      pill(ax.X(23.75) - 70, ax.Y(900) - 34, '15m (900초)', WARN, pop(u, 1.6), { mono: true, fs: 13.5 });
      tx(30, 356, '23h45m에 renew', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(30, 382, '→ 남은 15m로 잘린다', { 'font-size': 15, opacity: fade(u, 1.9) }); return; }
    // k3: 울타리에서 재발급
    saw(ax, [[24, 3600], [26, 3600 - 2 * 3600 * 0.25]], E(u, 0.5, 1.6), INFO, { sw: 3 });
    pill(ax.X(26) + 80, ax.Y(3600), '새 자격증명', INFO, pop(u, 0.5), { fs: 13.5 });
    tx(30, 356, '만료 직전마다 renew, 24h 울타리에 닿으면 새로 발급받는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
    sub(560, 396, '톱니 간격(50분)은 예시', fade(u, 2.0)); }

  // ---------- 4. 만료와 회수 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { vault(160, 120, 220, 130); dbIcon(800, 120, 'PostgreSQL');
      ring(160, 300, 52, lerp(60, 0, E(u, 0.1, 0.9)), { label: 'ttl' });
      fly(270, 120, 750, 120, seg(u, 1.0, 1.8), 'DROP ROLE "v-token-app-8xk2"', { fill: BAD, mono: true });
      el('rect', { x: 560, y: 220, width: 340, height: 90, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); mono(576, 246, 'pg_roles', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      mono(576, 284, 'v-token-app-8xk2', { 'font-size': 15, 'font-weight': 700, fill: u > 1.8 ? OFF : GOOD, 'text-decoration': u > 1.8 ? 'line-through' : null });
      tx(300, 320, 'TTL 0에서 Vault가 백엔드에 회수를 지시한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { const ax = R.axes(80, 120, 760, 1, { x: [0, 60], y: [0, 1], xt: [0, 20, 40, 60], xl: '발급 후 분' });
      el('rect', { x: ax.X(0), y: 92, width: ax.X(60) - ax.X(0), height: 26, rx: 4, fill: SOFT });
      const cut = E(u, 1.0, 1.4); el('rect', { x: ax.X(0), y: 92, width: ax.X(lerp(60, 13, cut)) - ax.X(0), height: 26, rx: 4, fill: cut > 0.9 ? BAD : ACC });
      if (cut > 0.9) { el('line', { x1: ax.X(13), y1: 80, x2: ax.X(13), y2: 130, stroke: BAD, 'stroke-width': 3 }); mono(ax.X(13) + 8, 76, 'revoke', { 'font-size': 14, 'font-weight': 700, fill: BAD }); }
      cmd(80, 220, 'vault lease revoke database/creds/app/8xk2aB…', E(u, 0.1, 0.9));
      mono(80, 262, 'Success! Revoked lease: database/creds/app/8xk2aB…', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      tx(80, 320, '만료를 기다리지 않고 그 자리에서 끊는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(560, 360, '끊는 시각(13분)은 그림 예시', fade(u, 2.1)); return; }
    if (k === 2) { cmd(40, 50, 'vault lease revoke -prefix database/creds/app', E(u, 0.1, 0.8));
      mono(60, 104, 'database/creds/app/', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      for (let i = 0; i < 42; i++) { const x = 80 + (i % 14) * 56, y = 150 + Math.floor(i / 14) * 56, off = E(u, 1.0 + (i % 14) * 0.07, 1.3 + (i % 14) * 0.07);
        el('line', { x1: 70, y1: 112, x2: 70, y2: y, stroke: GRID, 'stroke-width': 1.5 });
        el('rect', { x: x - 20, y: y - 18, width: 40, height: 36, rx: 6, fill: off > 0.5 ? SOFT : ACCBG, stroke: off > 0.5 ? OFF : ACC, 'stroke-width': 1.8 });
        if (off > 0.5) cross(x, y, 7, 0.7); }
      mono(40, 340, 'Success! Revoked any leases with prefix: database/creds/app', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) });
      tx(40, 380, '이 role이 발급한 42개를 한 번에', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { const d = E(u, 0.8, 1.6);
      contract(80, 70, 360, 150, [['lease_id', 'database/creds/app/8xk2aB…'], ['lease_duration', '—'], ['lease_renewable', '—']], { col: d > 0.5 ? OFF : ACC, dead: d > 0.5 });
      if (d > 0.5) { el('line', { x1: 70, y1: 230, x2: 450, y2: 60, stroke: BAD, 'stroke-width': 4 }); }
      cmd(500, 100, 'vault lease lookup …/8xk2aB…', E(u, 0.1, 0.6), { w: 330 });
      mono(500, 145, 'Error looking up lease: …', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      mono(500, 170, '* invalid lease', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      tx(80, 300, '계약서가 사라졌다', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.8) });
      tx(80, 330, '연결된 DB 사용자도 함께 지워진 상태다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k4: 위험 창
    const ax = R.axes(200, 110, 680, 200, { x: [0, 6], y: [0, 3], xt: [0, 1, 2, 3, 4, 5, 6], xl: '유출 후 시간 (h)' });
    [['정적 비밀번호', 6, BAD, '바꾸기 전까지 계속'], ['짧은 TTL', 1, WARN, '1h 뒤 무효'], ['revoke', 0.08, GOOD, '바로 차단']].forEach(([n, h, col, d], i) => {
      const y = 130 + i * 60, g = E(u, 0.3 + i * 0.5, 1.0 + i * 0.5);
      tx(185, y + 19, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: ax.X(0), y, width: Math.max(4, (ax.X(h) - ax.X(0)) * g), height: 28, rx: 4, fill: col });
      tx(ax.X(Math.min(h, 4.2)) + 12, y + 20, d, { 'font-size': 14.5, 'font-weight': 700, fill: i === 0 ? PANEL : col, opacity: fade(u, 1.0 + i * 0.5), 'text-anchor': i === 0 ? 'end' : 'start' }); });
    tx(480, 395, '재배포 없이 위험 창을 좁힌다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // ---------- 5. Vault Agent 사이드카 ----------
  function pod(o) { o = o || {};
    el('rect', { x: 30, y: 40, width: 560, height: 340, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
    tx(50, 66, 'Pod', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    card(160, 170, 200, 110, { rx: 10, stroke: INK, sw: 2.5, text: '앱', fs: 18 });
    card(450, 170, 200, 110, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: o.agent ?? 1 });
    tx(450, 160, 'Vault Agent', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: o.agent ?? 1 });
    tx(450, 186, '사이드카', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: o.agent ?? 1 });
    vault(820, 170, 220, 140); }
  function file(x, y, n, o) { o = o || {}; const op = o.op ?? 1;
    el('path', { d: `M${x},${y} H${x + 150} L${x + 170},${y + 20} V${y + 70} H${x} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
    mono(x + 10, y + 22, 'db.json', { 'font-size': 14, 'font-weight': 700, opacity: op });
    for (let i = 0; i < 3; i++) el('rect', { x: x + 10, y: y + 34 + i * 11, width: 130 * clamp(n - i), height: 6, rx: 3, fill: o.col || ACC, opacity: op }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { vault(480, 120, 360, 150);
      mono(340, 140, 'database/roles/app', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      pill(380, 172, 'default_ttl 1h', ACC, pop(u, 0.4), { mono: true, fs: 14 }); pill(560, 172, 'max_ttl 24h', BAD, pop(u, 0.8), { mono: true, fs: 14 });
      tx(480, 270, '짧게 발급하고, 하루가 지나면 반드시 새로 받는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(480, 300, '대신 renew를 사람이 아닌 프로그램이 맡아야 한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    pod({ agent: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { dot([[550, 150], [710, 150]], seg(u, 0.6, 1.2), ACC, 7); pill(630, 116, 'auto_auth', ACC, pop(u, 0.6), { mono: true, fs: 13.5 });
      fly(710, 196, 550, 196, seg(u, 1.4, 2.1), 'token', { mono: true });
      tx(40, 410, '앱 코드는 Vault 로그인조차 모른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { fly(710, 196, 550, 196, seg(u, 0.2, 0.9), 'database/creds/app', { mono: true });
      file(380, 280, E(u, 1.0, 2.0)); mono(380, 270, '/vault/secrets/', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
      tx(40, 410, '자격증명이 공유 볼륨의 파일로 내려온다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    file(380, 280, 1);
    if (k === 3) { const ph = (t * 0.9) % 1; dot([[550, 150], [710, 150]], ph, ACC, 6); dot([[710, 196], [550, 196]], (ph + 0.5) % 1, ACC, 6);
      pill(630, 116, 'renew', ACC, 1, { mono: true, fs: 13.5 });
      ring(830, 330, 52, remain(c), { label: '' });
      grow(380, 300, 240, 230, E(u, 0.6, 1.2), INK); tx(150, 300, '파일만 읽는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(40, 410, '만료 전 renew, 안 되면 재발급해 파일을 바꾼다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k4
    const ph = (t * 0.9) % 1; dot([[550, 150], [710, 150]], ph, ACC, 6);
    grow(380, 300, 240, 230, 1, INK);
    [['TTL 짧게', '위험 창이 작다', ACC], ['Agent가 renew', '사람 손이 안 간다', ACC], ['24h에 교체', '앱은 모른다', BAD]].forEach(([a, b], i) => { const y = 290 + i * 42, s = fade(u, 0.3 + i * 0.4);
      el('rect', { x: 620, y: y - 20, width: 320, height: 34, rx: 17, fill: PANEL, stroke: a ? GRID : GRID, 'stroke-width': 1.5, opacity: s });
      tx(638, y + 3, a, { 'font-size': 15, 'font-weight': 800, fill: i === 2 ? BAD : ACC, opacity: s }); tx(780, y + 3, b, { 'font-size': 14, opacity: s }); });
    tx(40, 410, '짧은 수명의 안전함과 무중단을 함께 얻는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: 'database/creds/app을 읽으면 자격증명과 함께 무엇이 붙어 나오는가?',
      o: ['lease_id, lease_duration, lease_renewable이 적힌 lease', 'KV 버전 번호', '관리자 비밀번호'], a: 0,
      why: '동적 시크릿은 발급될 때 반드시 lease가 붙는다. 이 장의 예에서는 lease_duration이 1h, 연장 가능 여부는 true다.' },
    { q: 'vault lease lookup의 ttl이 2400이라면 무슨 뜻인가?',
      o: ['2400번 더 renew 할 수 있다', '만료까지 2400초 남았다', '발급 후 2400초가 지났다'], a: 1,
      why: 'ttl은 남은 시간(초)이다. 3600에서 시작해 계속 줄고 expire_time이 만료 시각을 못박는다.' },
    { q: '발급 후 23h45m에 renew를 요청하면 어떻게 되는가? (max_ttl 24h)',
      o: ['TTL이 다시 1h로 찬다', 'TTL이 남은 15m로 잘리고 경고가 붙는다', 'max_ttl이 25h로 늘어난다'], a: 1,
      why: 'renew는 max_ttl을 넘길 수 없다. Vault는 요청한 1h 대신 상한까지 남은 시간만 주고 그 사실을 경고로 알린다.' },
    { q: 'vault lease revoke -prefix database/creds/app은 무엇을 회수하는가?',
      o: ['database/ 마운트의 모든 lease', '가장 최근 lease 하나', 'app role이 발급한 모든 lease (이 예에서는 42개)'], a: 2,
      why: '-prefix는 그 경로 아래 lease를 전부 회수한다. app role 경로를 주었으니 그 role이 발급한 42개가 대상이다.' },
    { q: 'Vault Agent 사이드카를 쓰면 앱은 무엇을 하면 되는가?',
      o: ['/vault/secrets/db.json 파일을 읽기만 한다', '만료 직전마다 vault lease renew를 호출한다', 'max_ttl마다 직접 다시 로그인한다'], a: 0,
      why: 'Agent가 auto_auth로 로그인하고 template으로 파일을 쓰며 renew와 재발급도 맡는다.' },
  ];

  const summary = [
    '동적 시크릿은 발급될 때 lease_id와 TTL이 적힌 lease가 함께 붙는다.',
    'TTL은 발급 순간부터 줄어들고 lookup으로 남은 초와 만료 시각을 볼 수 있다.',
    'renew는 같은 자격증명의 TTL을 다시 채우지만 max_ttl 24h를 넘기지는 못한다.',
    '그냥 두면 TTL 0에서 DROP ROLE로 회수되고 급하면 revoke로 바로 끊는다.',
  ];
  const review = [
    { q: '배치가 매일 25시간째에 DB 접속 오류를 낸다. renew 코드는 잘 돈다. 먼저 의심할 것은?',
      o: ['max_ttl 24h에 닿아 lease가 끝났는데 새로 발급받지 않는다', 'lookup 권한이 없다', 'KV 값이 바뀌었다'], a: 0,
      why: 'renew를 아무리 해도 발급 후 24h를 넘길 수 없다. 울타리에 닿으면 새 자격증명을 읽어 바꿔 끼워야 한다.' },
    { q: '앱 하나의 DB 비밀번호가 로그에 찍혔다. ttl은 2400초 남았다. 가장 알맞은 조치는?',
      o: ['renew를 멈추고 40분 기다린다', 'database/ 마운트 전체를 회수한다', '그 lease_id를 revoke 한다'], a: 2,
      why: 'revoke는 재배포 없이 그 lease만 바로 끊고 DB 사용자를 지운다. 기다리면 그동안 계정이 살아 있고, 마운트 전체 회수는 다른 서비스까지 끊는다.' },
    { q: 'TTL을 1h로 줄였더니 앱이 자주 끊긴다. 짧은 TTL은 지키면서 고치는 방법은?',
      o: ['TTL을 768h로 늘린다', 'Vault Agent가 renew와 재발급을 맡고 앱은 파일을 읽게 한다', 'KV에 비밀번호를 넣어 lease를 없앤다'], a: 1,
      why: '짧은 TTL과 무중단을 함께 얻는 방법은 renew를 자동화하는 것이다. Agent가 만료 전에 renew하고 24h에는 새로 받아 파일을 바꾼다.' },
  ];

  R.page({ title: 'lease 타임라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
