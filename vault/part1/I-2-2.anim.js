/* I-2-2 token — TTL / renewable / orphan / accessor — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * token 값·accessor·TTL 초는 페이지 STEPS 의 token 데이터(예시 값)를 읽는다. renew 상한 계산은 python 으로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, lock, clock, terminal, axes, kvTable } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const TK = (c) => (c.beat && c.beat.token) || { id: 'hvs.CAESI...4a9f', accessor: 'kR7pMxQ2', policies: ['app-read'], ttl: 3600, renewable: true, uses: '무제한', type: 'service' };
  const mmss = (s) => s >= 3599.5 ? '1h' : Math.floor(s / 60) + 'm' + String(Math.round(s % 60)).padStart(2, '0') + 's';
  function safe(x, y, w, h, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 3 });
    const dx = x + w - 26, dy = y + 24, a = o.dial || 0;
    el('circle', { cx: dx, cy: dy, r: 12, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    el('line', { x1: dx, y1: dy, x2: dx + Math.cos(a) * 8, y2: dy + Math.sin(a) * 8, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' });
    tx(x + 14, y + 29, o.name || 'Vault', { 'font-size': 16, 'font-weight': 800 }); }
  // 큰 출입증: 칸이 위에서부터 채워진다(show 0→1)
  function bigTicket(x, y, tk, o) { o = o || {}; const w = 400, rows = [['token', tk.id, true], ['accessor', tk.accessor, true], ['policies', (o.pol || tk.policies).join(', '), true], ['renewable', String(tk.renewable), false], ['num_uses', tk.uses, false]];
    const n = rows.length, h = 56 + n * 32 + 46, show = o.show ?? 1, hot = o.hot || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5 });
    el('rect', { x, y, width: w, height: 36, rx: 12, fill: WARN }); el('rect', { x, y: y + 24, width: w, height: 12, fill: WARN });
    tx(x + 16, y + 24, '발급된 token', { 'font-size': 15, 'font-weight': 800, fill: PANEL });
    tx(x + w - 16, y + 24, tk.type, { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'end', class: 'mono' });
    rows.forEach(([k, v, m], i) => { const op = clamp(show * (n + 1) - i); if (op <= 0) return; const yy = y + 56 + i * 32;
      if (hot[k]) el('rect', { x: x + 8, y: yy - 20, width: w - 16, height: 28, rx: 6, fill: hot[k] === 'bad' ? BADBG : ACCBG, opacity: op });
      tx(x + 18, yy, k, { 'font-size': 14, fill: MUT, opacity: op });
      tx(x + 128, yy, v, { 'font-size': 14.5, 'font-weight': 700, class: m ? 'mono' : null, fill: hot[k] === 'bad' ? BAD : INK, opacity: op }); });
    const op = clamp(show * (n + 1) - n), yy = y + 56 + n * 32, frac = o.frac ?? (tk.ttl / 3600);
    if (op > 0) { tx(x + 18, yy, 'TTL', { 'font-size': 14, fill: MUT, opacity: op });
      el('rect', { x: x + 128, y: yy - 12, width: 180, height: 12, rx: 6, fill: PANEL, stroke: GRID, opacity: op });
      el('rect', { x: x + 128, y: yy - 12, width: 180 * clamp(frac), height: 12, rx: 6, fill: hot.ttl ? ACC : WARN, opacity: op });
      mono(x + w - 16, yy, o.ttlText || mmss(tk.ttl), { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', fill: hot.ttl ? ACC : WARN, opacity: op }); }
    return h; }
  // 작은 token 노드 (나무용)
  function node(cx, cy, name, o) { o = o || {}; const dead = o.dead, col = dead ? BAD : o.col || GOOD;
    card(cx, cy, o.w || 170, 44, { rx: 10, stroke: col, fill: dead ? BADBG : o.fill || GOODBG, s: o.s, op: o.op });
    if ((o.s ?? 1) > 0.4) { mono(cx - (o.w || 170) / 2 + 14, cy + 5, name, { 'font-size': 14.5, 'font-weight': 800, fill: dead ? OFF : INK, 'text-decoration': dead ? 'line-through' : null, opacity: o.op ?? 1 });
      tx(cx + (o.w || 170) / 2 - 12, cy + 5, dead ? 'revoked' : 'alive', { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: o.op ?? 1 }); } }

  // ---------- 1. 출입증 ----------
  function s1(t, c) { const { k, u } = c, tk = TK(c), p = c.prev && c.prev.token;
    const ttl = tween(p && p.ttl, tk.ttl, u), T = Object.assign({}, tk, { ttl });
    if (k === 0) { person(70, 150, 'alice', {}); safe(150, 90, 150, 120, { dial: t });
      mono(225, 172, 'userpass', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      dot([[100, 150], [150, 150]], seg(u, 0.1, 0.4), INFO, 6);
      grow(300, 150, 400, 150, E(u, 0.4, 0.8), ACC);
      bigTicket(420, 40, T, { show: E(u, 0.7, 2.4), pol: ['app-read', 'default'] }); return; }
    const pol = ['app-read', 'default'];
    bigTicket(30, 40, T, { pol, hot: k === 2 ? { policies: 1, ttl: 1 } : k === 3 ? { policies: 1, ttl: 1 } : { token: 1 } });
    if (k === 1) { safe(700, 110, 220, 180, { dial: t });
      [0, 1, 2].forEach((i) => { const g = seg(u, 0.3 + i * 0.6, 1.0 + i * 0.6), y = 150 + i * 40;
        if (g > 0 && g < 1) fly(440, 70, 760, y, g, 'X-Vault-Token', { mono: true });
        if (g >= 1) check(800, y, 8, 1); });
      mono(560, 340, 'export VAULT_TOKEN=hvs.CAESI...4a9f', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.2) });
      tx(560, 372, '모든 요청에 같은 token이 실린다 · token이 곧 나', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 2) { terminal(470, 40, 460, 150, [['$ vault token lookup', PANEL], ['policies       [app-read default]', null], ['ttl            59m58s', null], ['renewable      true', null]], lerp(0, 4, E(u, 0.1, 1.4)), { fs: 14 });
      tx(700, 240, '값을 다시 꺼내지 않고 속성만 본다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(700, 268, '남은 수명이 흐르고 있다', { 'font-size': 14.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k === 3) { [['policy', '무엇을 할 수 있나', 140, ACC], ['TTL', '언제까지 유효한가', 260, WARN]].forEach(([a, b, y, col], i) => {
        grow(440, y, 560, y, E(u, 0.2 + i * 0.5, 0.7 + i * 0.5), col);
        card(720, y, 300, 58, { rx: 10, stroke: col, s: pop(u, 0.6 + i * 0.5) });
        tx(590, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.7 + i * 0.5) }); tx(850, y + 6, b, { 'font-size': 15, 'text-anchor': 'end', opacity: fade(u, 0.7 + i * 0.5) }); });
      tx(700, 360, '권한과 수명이 묶인 출입증', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); } }

  // ---------- 2. 수명: 0 ~ 24h 시간축 ----------
  function s2(t, c) { const { k, u } = c;
    const ax = axes(70, 230, 820, 90, { x: [0, 24], y: [0, 1], xt: [0, 4, 8, 12, 16, 20, 24], xl: '발급 후 시간 (h)' });
    const wall = ax.X(24);
    el('line', { x1: wall, y1: 200, x2: wall, y2: 320, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
    tx(wall, 192, 'explicit-max-ttl 24h', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
    const bar = (a, b, col, op) => el('rect', { x: ax.X(a), y: 270, width: Math.max(2, ax.X(b) - ax.X(a)), height: 34, rx: 4, fill: col, opacity: op ?? 0.85 });
    if (k === 0) { const g = E(u, 0.3, 1.2); bar(0, 1 * g, WARN);
      tx(ax.X(1) + 8, 292, 'ttl 1h', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0) });
      terminal(70, 30, 520, 140, [['$ vault token create -policy=app-read \\', PANEL], ['    -ttl=1h -explicit-max-ttl=24h', PANEL], ['    -renewable=true', PANEL], ['token_duration   1h', null]], lerp(0, 4, E(u, 0.1, 1.6)), { fs: 14 });
      tx(760, 110, '연장해도 이 벽은', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) });
      tx(760, 136, '넘지 못한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { const g = E(u, 0.9, 1.6);
      bar(0, 0.8, WARN); bar(0.8, 0.8 + 1 * g, ACC);
      clock(ax.X(0.8), 160, 18, 0.8, WARN, null); mono(ax.X(0.8) + 26, 166, '남은 12m에 renew', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) });
      mono(ax.X(1.8) + 8, 292, '→ 1h48m까지', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      // 48분마다 renew 하면: 29번째(23h12m)에서 24h 벽에 닿아 48m 만 받는다
      for (let i = 1; i <= 29; i++) { const h = (i * 48) / 60, on = E(u, 1.7, 2.6) * 29 >= i; if (!on) continue;
        el('line', { x1: ax.X(h), y1: 250, x2: ax.X(h), y2: 262, stroke: i === 29 ? BAD : ACC, 'stroke-width': 2 }); }
      tx(ax.X(23.2), 240, '29번째 renew는 48m만', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.4) });
      return; }
    if (k === 2) { el('rect', { x: 60, y: 20, width: 840, height: 150, rx: 12, fill: PANEL });
      mono(80, 56, 'vault token create -policy=app-read -use-limit=3', { 'font-size': 15, 'font-weight': 700 });
      [0, 1, 2, 3].forEach((i) => { const g = seg(u, 0.3 + i * 0.5, 0.7 + i * 0.5), x = 120 + i * 200, ok = i < 3;
        card(x, 100, 170, 44, { rx: 10, text: '요청 ' + (i + 1), fs: 15, stroke: g >= 1 ? (ok ? GOOD : BAD) : GRID, fill: g >= 1 ? (ok ? GOODBG : BADBG) : PANEL, color: g >= 1 ? (ok ? GOOD : BAD) : MUT });
        if (g >= 1) mono(x, 146, ok ? '남은 횟수 ' + (2 - i) : '403', { 'font-size': 14.5, 'font-weight': 800, fill: ok ? GOOD : BAD, 'text-anchor': 'middle' }); });
      bar(0, 1, WARN, 0.5); tx(ax.X(1) + 8, 292, '시간이 남아 있어도', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    // k3: renew-self 톱니
    const end = lerp(0, 24, E(u, 0.2, 2.6)), pts = [];
    for (let h = 0; h <= end + 1e-6; h += 0.1) { const ph = h % 0.8, left = 1 - ph; pts.push([h, clamp(left) * 0.9]); }
    if (pts.length > 1) R.line(ax, pts, 1, ACC, { sw: 2 });
    server(130, 110, 'app', { s: 0.6 });
    el('path', { d: 'M180,80 A30,30 0 1 1 180,140', fill: 'none', stroke: ACC, 'stroke-width': 3, 'marker-end': 'url(#ra-ahb)' });
    mono(250, 116, 'vault token renew-self', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    tx(640, 100, '짧은 TTL(15m~1h)을 앱이 계속 연장', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
    tx(640, 128, '유출돼도 곧 만료된다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }

  // ---------- 3. 종류 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { const cols = [['service', '관리', GOOD, ['서버에 저장', 'renew · revoke · lookup', '기본값']], ['batch', '성능', INFO, ['서버에 저장 안 함', 'renew · 자식 · accessor 없음', '대량 · 단명']], ['orphan', '수명 독립', WARN, ['부모 없음', '부모 revoke에도 생존', '오래 도는 데몬 · CI 러너']]];
      cols.forEach(([n, why, col, items], j) => { const x = 50 + j * 300, s = pop(u, 0.2 + j * 0.4);
        card(x + 135, 200, 270, 300, { rx: 14, stroke: col, s });
        mono(x + 135, 90, n, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s > 0.5 ? 1 : 0 });
        tx(x + 135, 120, '고르는 이유: ' + why, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5 + j * 0.4) });
        items.forEach((it, i) => tx(x + 135, 180 + i * 50, it, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.7 + j * 0.4 + i * 0.15) })); });
      return; }
    if (k === 3) { terminal(60, 50, 520, 130, [['$ vault token lookup -format=json \\', PANEL], ['    | jq .data.orphan', PANEL], ['true', null]], lerp(0, 3, E(u, 0.1, 1.4)), { fs: 15 });
      node(760, 115, 'orphan token', { col: WARN, fill: WARNBG, w: 240 });
      tx(320, 260, 'lookup으로 이 token의 성격을 확인한다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(320, 290, 'auth method 로그인으로 받은 token도 부모가 없다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    if (k === 2) { node(250, 80, 'parent', {}); grow(250, 102, 250, 180, E(u, 0.2, 0.6), MUT, { plain: true }); node(250, 200, 'child', { s: pop(u, 0.4) });
      node(660, 200, 'orphan', { col: WARN, fill: WARNBG, s: pop(u, 0.9) });
      el('path', { d: 'M335,80 C500,80 560,150 600,178', fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 6' }); cross(500, 105, 11, pop(u, 1.2));
      mono(660, 260, 'vault token create -orphan', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) });
      tx(480, 340, '부모가 없으니 부모가 사라져도 함께 죽지 않는다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      return; }
    // k0, k1: 저장소 비교
    dbIcon(160, 210, 'Vault 저장소', { s: 1.1 });
    const svc = { x: 560, y: 110 };
    card(svc.x, svc.y, 300, 64, { rx: 10, stroke: GOOD, fill: GOODBG, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(svc.x - 136, svc.y - 6, 'service · hvs.…', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    tx(svc.x - 136, svc.y + 18, 'renew · revoke · lookup 모두', { 'font-size': 14, fill: INK });
    if (k === 0) { dot([[svc.x - 150, svc.y], [220, 190]], seg(u, 0.7, 1.3), GOOD, 6);
      ['renew', 'revoke', 'lookup'].forEach((s, i) => { check(470 + i * 110, 190, 8, pop(u, 1.4 + i * 0.2)); mono(484 + i * 110, 196, s, { 'font-size': 14.5, opacity: fade(u, 1.4 + i * 0.2) }); });
      tx(560, 280, '서버에 기록돼 있어 관리가 다 된다 · 기본값', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    const bt = { x: 560, y: 260 };
    card(bt.x, bt.y, 300, 64, { rx: 10, stroke: INFO, fill: INFOBG, s: pop(u, 0.2) });
    mono(bt.x - 136, bt.y - 6, 'batch · hvb.…', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
    tx(bt.x - 136, bt.y + 18, '내용을 token 안에 담는다', { 'font-size': 14, opacity: fade(u, 0.3) });
    grow(bt.x - 150, bt.y, 230, 230, E(u, 0.6, 1.1), BAD, { dash: '5 4', plain: true }); cross(330, 244, 10, pop(u, 1.1));
    tx(260, 330, '저장하지 않는다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    [['renew', false], ['자식 token', false], ['accessor', false]].forEach(([s], i) => { cross(740 + 0, 230 + i * 30, 7, pop(u, 1.5 + i * 0.2)); tx(756, 235 + i * 30, s, { 'font-size': 14.5, opacity: fade(u, 1.5 + i * 0.2) }); });
    mono(560, 360, 'vault token create -type=batch -ttl=5m', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }

  // ---------- 4. accessor ----------
  function s4(t, c) { const { k, u } = c, tk = TK(c);
    // 값과 번호표
    const dead = k === 2 && u > 1.4 || k >= 3;
    card(190, 80, 300, 64, { rx: 10, stroke: dead ? OFF : BAD, fill: dead ? SOFT : BADBG });
    lock(70, 82, true, dead ? OFF : BAD, 0.9);
    mono(96, 74, 'token', { 'font-size': 13.5, fill: MUT }); mono(96, 98, tk.id, { 'font-size': 15, 'font-weight': 800, fill: dead ? OFF : INK, 'text-decoration': dead ? 'line-through' : null });
    card(190, 190, 300, 64, { rx: 10, stroke: dead ? OFF : INFO, fill: dead ? SOFT : INFOBG, s: k === 0 ? pop(u, 0.8) : 1 });
    mono(60, 184, 'accessor', { 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.9) : 1 }); mono(60, 208, tk.accessor, { 'font-size': 16, 'font-weight': 800, fill: dead ? OFF : INFO, opacity: k === 0 ? fade(u, 0.9) : 1, 'text-decoration': dead ? 'line-through' : null });
    el('line', { x1: 190, y1: 112, x2: 190, y2: 158, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '4 4' });
    if (k === 0) { tx(560, 86, '비밀 · 노출 금지', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
      tx(560, 196, '공개해도 되는 번호표', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) });
      tx(480, 320, '같은 token을 가리키지만 accessor로는 값을 알 수 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 1) { safe(420, 40, 200, 220, { dial: t }); fly(340, 190, 430, 150, seg(u, 0.2, 0.8), 'lookup -accessor', { mono: true, fill: INFO });
      const ttl = tween(c.prev && c.prev.token && c.prev.token.ttl, tk.ttl, u, 1.6);
      kvTable(660, 50, 270, [['policies', '[app-read]'], ['ttl', mmss(ttl), { hot: true }], ['accessor', tk.accessor], ['id', '(보이지 않음)', { gone: true }]].map((r, i) => [r[0], r[1], Object.assign({ op: fade(u, 0.9 + i * 0.25) }, r[2] || {})]), { title: '돌아온 속성', kw: 100 });
      tx(480, 340, '속성은 보이고 token 값은 나오지 않는다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 2) { fly(340, 190, 600, 190, seg(u, 0.2, 0.9), 'revoke -accessor kR7pMxQ2', { mono: true, fill: BAD });
      mono(600, 280, 'Success! Revoked token (if it existed)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.5) });
      tx(600, 320, '값을 몰라도 폐기는 된다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { terminal(440, 40, 480, 170, [['$ vault list auth/token/accessors', PANEL], ['9fLm3nZ8', null], ['Tq5wHc1e', null], ['...', null]], lerp(0, 4, E(u, 0.1, 1.5)), { fs: 14.5 });
      tx(680, 260, 'kR7pMxQ2는 이미 폐기돼 목록에 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) });
      tx(680, 290, '살아 있는 token을 번호표로 훑는다', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k4: 감사 로그 vs 운영 기록
    zone(420, 40, 510, 130, '감사 로그 (audit device)', { fill: SOFT });
    mono(440, 96, '"client_token": "hmac-sha256:…"', { 'font-size': 14.5, opacity: fade(u, 0.3) });
    tx(440, 130, 'token 값은 HMAC으로 가려 적힌다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
    zone(420, 200, 510, 130, '사고 티켓 · 운영 기록', { fill: INFOBG });
    mono(440, 256, 'accessor kR7pMxQ2 폐기 완료', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
    tx(440, 290, '사람끼리는 값 대신 accessor로 말한다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) }); }

  // ---------- 5. 계층 ----------
  const TP = { parent: [200, 70], c1: [140, 200], c2: [470, 200], gc: [140, 320], orph: [760, 120] };
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { [['TTL은 짧게, 앱이 renew-self로 연장', ACC], ['유출이 의심되면 accessor로 lookup · revoke', INFO], ['사고 때는 상위 token 하나를 revoke', BAD], ['오래 사는 워크로드만 orphan', WARN]].forEach(([s, col], i) => {
        const y = 80 + i * 76, sc = pop(u, 0.2 + i * 0.35); card(480, y, 640, 58, { rx: 12, stroke: col, s: sc });
        tx(190, y + 6, (i + 1) + '. ' + s, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) }); });
      return; }
    const lnk = (a, b, g, col) => { const [x1, y1] = TP[a], [x2, y2] = TP[b]; if (g <= 0) return; el('path', { d: `M${x1},${y1 + 22} V${lerp(y1 + 22, (y1 + y2) / 2, clamp(g * 2))} H${lerp(x1, x2, clamp(g * 2 - 0.5))} V${lerp((y1 + y2) / 2, y2 - 22, clamp(g * 2 - 1))}`, fill: 'none', stroke: col || MUT, 'stroke-width': 2.2 }); };
    const gs = k === 0 ? [E(u, 0.2, 0.9), E(u, 0.6, 1.3), E(u, 1.2, 1.9)] : [1, 1, 1];
    // 폐기 전파 순서: parent → child-1 → grandchild → child-2
    const dAt = { parent: 0.4, c1: 0.9, gc: 1.4, c2: 1.9 }, isDead = (n) => k >= 3 || (k === 2 && u > dAt[n]);
    lnk('parent', 'c1', gs[0], isDead('c1') ? BAD : MUT); lnk('parent', 'c2', gs[1], isDead('c2') ? BAD : MUT); lnk('c1', 'gc', gs[2], isDead('gc') ? BAD : MUT);
    node(...TP.parent, 'parent', { dead: isDead('parent') });
    node(...TP.c1, 'child-1', { s: k === 0 ? pop(u, 0.6) : 1, dead: isDead('c1') });
    node(...TP.c2, 'child-2', { s: k === 0 ? pop(u, 1.0) : 1, dead: isDead('c2') });
    node(...TP.gc, 'grandchild', { s: k === 0 ? pop(u, 1.6) : 1, dead: isDead('gc') });
    if (k === 0) mono(620, 330, 'VAULT_TOKEN=<parent-token>', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    if (k === 1) { tx(640, 300, '부모 아래에 자식과 손자가 매달린다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(640, 330, '모두 alive', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 2) { mono(640, 300, 'vault token revoke <parent-token>', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      tx(640, 334, '뿌리 하나로 아래가 모두 정리된다', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k === 3) { node(...TP.orph, 'orphan', { col: WARN, fill: WARNBG, s: pop(u, 0.3) });
      tx(760, 190, '나무 밖 · 부모와 무관', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      mono(640, 300, 'vault token create -orphan', { 'font-size': 14.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(640, 334, '부모가 revoke 돼도 살아남는다', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); } }

  const quiz = [
    { q: 'token lookup에 ttl 59m58s가 보였다. 이 값이 알려 주는 것은 무엇인가?',
      o: ['이 token이 만료될 때까지 남은 시간', 'token을 만든 뒤 지난 시간', 'token 값의 길이'], a: 0,
      why: 'TTL은 남은 수명이다. 3600초로 발급된 token이 2초 지나 3598초, 곧 59m58s가 남았다.' },
    { q: 'ttl 1h, explicit-max-ttl 24h로 만든 token을 48분마다 renew하면 어떻게 되나?',
      o: ['영원히 연장된다', '두 번째 renew부터 거부된다', '발급 후 24h가 되는 시각을 넘겨 연장되지 않고 그때 만료된다'], a: 2,
      why: 'renew할 때마다 1h씩 다시 받지만 상한은 발급 시각 + 24h다. 계산하면 29번째 renew는 48m만 받고 24h에 만료된다.' },
    { q: 'batch token에 대한 설명으로 맞는 것은 무엇인가?',
      o: ['서버에 저장되고 renew도 된다', '서버에 저장하지 않아 가볍지만 renew와 자식 token 생성이 안 된다', '부모가 폐기돼도 절대 함께 죽지 않는 token이다'], a: 1,
      why: 'batch는 저장소에 기록하지 않는 경량 token이라 대량 발급에 유리하다. 대신 renew, 자식 token, accessor가 없다.' },
    { q: 'accessor kR7pMxQ2로 할 수 없는 일은 무엇인가?',
      o: ['token 속성 lookup', 'token revoke', 'token 값 알아내기'], a: 2,
      why: 'accessor는 token을 가리키는 번호표다. 속성 조회와 폐기는 되지만 token 값 자체는 돌려주지 않는다.' },
    { q: 'parent 아래에 child-1(→grandchild)과 child-2가 있고, 따로 만든 orphan이 있다. parent를 revoke하면 살아남는 것은?',
      o: ['orphan', 'child-2', 'grandchild'], a: 0,
      why: '부모를 폐기하면 그 아래 자식과 손자가 모두 함께 폐기된다. 부모가 없는 orphan만 영향을 받지 않는다.' },
  ];
  const summary = [
    'token은 정책과 TTL이 묶인 출입증이고, 모든 요청에 X-Vault-Token으로 실린다.',
    'renew로 TTL을 다시 채울 수 있지만 발급 후 max TTL을 넘겨 연장되지는 않는다.',
    'batch는 저장하지 않는 가벼운 token이고, orphan은 부모 폐기에 휩쓸리지 않는다.',
    'accessor로는 값 없이 lookup과 revoke를 하고, 부모를 revoke하면 자식도 함께 사라진다.',
  ];
  const review = [
    { q: 'CI 로그에 token 값이 찍혀 유출이 의심된다. 운영자가 가진 것은 그 token의 accessor뿐이다. 먼저 할 일은?',
      o: ['vault token revoke -accessor로 바로 폐기한다', 'TTL이 끝날 때까지 기다린다', '같은 정책으로 새 token을 하나 더 만든다'], a: 0,
      why: 'accessor만으로 폐기할 수 있다. 값을 몰라도 사고 대응을 바로 시작할 수 있다.' },
    { q: '배포 도구가 만든 token으로 앱 token들을 발급해 왔는데, 배포 도구 token을 revoke하자 앱이 모두 403을 받았다. 원인은?',
      o: ['앱 token이 batch라서', '앱 token이 배포 도구 token의 자식이라 함께 폐기됐다', '앱 token의 num_uses가 3이라서'], a: 1,
      why: '부모를 revoke하면 그 아래 자식이 모두 폐기된다. 오래 살아야 하는 앱 token이라면 orphan이나 앱 자신의 로그인으로 받아야 한다.' },
    { q: '앱이 renew-self를 잘 하는데도 매일 같은 시각에 인증이 끊긴다. 먼저 확인할 값은?',
      o: ['policies 목록', 'accessor 값', 'max TTL 상한'], a: 2,
      why: 'renew는 max TTL을 넘겨 연장하지 못한다. 상한에 닿으면 token이 만료되므로 그 전에 다시 로그인해야 한다.' },
  ];

  R.page({ title: 'token — 발급 · 수명 · 종류 · accessor · 계층', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
