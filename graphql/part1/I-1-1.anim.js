/* I-1-1 REST 한계 (over/under-fetching) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 페이지 STEPS 의 bytes · calls · fieldsTotal · fieldsUsed 를 읽는다. 크기·RTT 는 페이지가 든 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, spans, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    server, cross, check, meters, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, WARN, WARNBG, INFO, INFOBG } = C;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 휴대폰 틀: 가운데 (cx, cy), 크기 w×h
  function phone(cx, cy, w, h, label) {
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 16, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    el('line', { x1: cx - 14, y1: cy - h / 2 + 12, x2: cx + 14, y2: cy - h / 2 + 12, stroke: GRID, 'stroke-width': 4, 'stroke-linecap': 'round' });
    if (label) tx(cx, cy + h / 2 + 22, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
  }
  // 코드 줄: L = [문자열 | [문자열, 속성]], n 줄까지 보임(소수면 마지막 줄을 치는 중)
  function codeLines(x, y, L, n, o) { o = o || {}; const lh = o.lh || 24, fs = o.fs || 14.5;
    L.forEach((ln, i) => { if (i >= n) return; const [s, a] = Array.isArray(ln) ? ln : [ln, {}];
      const part = i === Math.floor(n) && n % 1 ? s.slice(0, Math.round(s.length * (n % 1))) : s;
      mono(x, y + i * lh, part, Object.assign({ 'font-size': fs, fill: INK }, a)); }); }

  // ---------- 1. GET /users/1 → 100 필드 ----------
  const FIELDS = [['id', '1'], ['name', '"박호영"'], ['email', '"hoyoung@…"'], ['phone', '"+82-10-…"'], ['address', '{ city, zip, … }'],
    ['profile_image_url', '"https://cdn…"'], ['locale', '"ko-KR"'], ['timezone', '"Asia/Seoul"'], ['preferences', '{ theme, … }'],
    ['billing', '{ card_last4, … }'], ['last_login', '"2026-05-19…"'], ['created_at', '"2024-08-12…"'], ['updated_at', '"2026-05-18…"']];
  const USED_AT = { id: 4, name: 1, profile_image_url: 2 };          // 화면이 이 필드를 쓰기 시작하는 beat
  const GRID_USED = { 0: 'id', 1: 'name', 5: 'profile_image_url' };   // 필드 칸 번호 → 필드
  const GX = 612, GY = 58, GS = 28;
  function fieldGrid(total, k, u) {
    tx(GX, 42, '받은 필드', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    mono(GX + 10 * GS - 3, 42, `${Math.round(total)} / 100`, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end', fill: total >= 99.5 ? BAD : INK });
    for (let i = 0; i < 100; i++) { const x = GX + (i % 10) * GS, y = GY + Math.floor(i / 10) * GS, got = i < total - 0.001, f = GRID_USED[i], used = f && USED_AT[f] <= k;
      el('rect', { x, y, width: GS - 4, height: GS - 4, rx: 4, fill: !got ? 'none' : used ? ACC : k >= 4 ? OFF : SOFT, stroke: got ? (used ? ACC : MUT) : GRID, 'stroke-width': got ? 1.4 : 1, opacity: !got ? 0.6 : k >= 4 && !used ? 0.55 : 1 }); } }
  function gauges1(c) { const b = c.beat, p = c.prev || {};
    const by = tween(p.bytes, b.bytes, c.u), tot = tween(p.fieldsTotal, b.fieldsTotal, c.u), used = tween(p.fieldsUsed, b.fieldsUsed, c.u), r = tot ? used / tot * 100 : 0;
    meters(40, 346, 880, [
      { name: '응답 크기', val: fmt(by) + ' B', hot: by >= 10000 },
      { name: 'HTTP 호출', val: b.calls + '회' },
      { name: '쓰는 필드 / 받은 필드', val: `${Math.round(used)} / ${Math.round(tot)}`, bar: r, hot: tot >= 99.5 },
    ], { h: 66 }); }
  function s1(t, c) { const { k, u } = c;
    phone(95, 182, 120, 236, '프로필 화면');
    const hasName = k >= 1, hasImg = k >= 2, hasId = k >= 4;
    el('circle', { cx: 95, cy: 128, r: 24, fill: hasImg ? ACC : 'none', stroke: hasImg ? ACC : GRID, 'stroke-width': 2, 'stroke-dasharray': hasImg ? null : '4 4', opacity: k === 2 ? fade(u, 1.4) * 0.8 + 0.2 : 1 });
    if (hasName) note(95, 182, '박호영', k === 1 ? fade(u, 1.5) : 1, { 'text-anchor': 'middle', 'font-weight': 800 });
    if (hasId) mono(95, 210, '#1', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 4 ? fade(u, 1.5) : 1 });
    if (k === 0) {
      server(440, 182, 'api.example.com');
      el('line', { x1: 155, y1: 182, x2: 382, y2: 182, stroke: GRID, 'stroke-width': 2.5 });
      pill(268, 140, 'GET /api/users/1', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      dot([[158, 182], [380, 182]], seg(u, 0.7, 1.8), ACC, 7);
      sub(440, 282, 'URL 에는 자원만, 필드를 고를 자리는 없다', fade(u, 1.8), { 'font-size': 14 });
      fieldGrid(0, k, u); gauges1(c); return; }
    // 응답 본문
    zone(186, 34, 400, 300, '200 OK · application/json', { fill: SOFT });
    const tgt = [0, 2, 10, 13, 13][k], from = [0, 0, 2, 10, 13][k], n = lerp(from, tgt, E(u, 0.2, 1.6));
    FIELDS.forEach(([key, v], i) => { if (i >= n) return; const y = 74 + i * 19, used = USED_AT[key] != null && USED_AT[key] <= k, dead = k >= 4 && !used;
      const op = clamp(n - i);
      spans(206, y, [[`"${key}": `, { fill: used ? ACC : dead ? OFF : INK, 'font-weight': used ? 800 : 500 }], [v, { fill: dead ? OFF : MUT }]],
        { 'font-size': 14, opacity: op, 'text-decoration': dead ? 'line-through' : null }); });
    if (k >= 3) mono(206, 74 + 13 * 19, '… 87 fields more', { 'font-size': 14, 'font-weight': 700, fill: k >= 4 ? OFF : BAD, opacity: k === 3 ? fade(u, 1.3) : 1 });
    // 화면이 쓰는 필드 → 휴대폰
    const link = (i, ty, a) => { const y = 74 + i * 19 - 5; grow(200, y, 158, ty, a, ACC, { sw: 2, plain: true }); };
    if (k >= 1) link(1, 182, k === 1 ? E(u, 1.4, 2.2) : 1);
    if (k >= 2) link(5, 128, k === 2 ? E(u, 1.6, 2.4) : 1);
    if (k >= 4) link(0, 206, E(u, 0.8, 1.6));
    fieldGrid(tween(c.prev && c.prev.fieldsTotal, c.beat.fieldsTotal, u, 1.6), k, u);
    if (k === 4) { el('rect', { x: GX - 6, y: 150, width: 10 * GS + 8, height: 44, rx: 8, fill: PANEL, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.8) });
      tx(GX + 5 * GS - 2, 178, '97칸은 받자마자 버린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }
    gauges1(c); }

  // ---------- 2. 친구 30명 = 호출 30번 ----------
  const CX0 = 300, CY0 = 66, CW = 72, CH = 40, CG = 8;
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    phone(90, 205, 116, 250, '친구 목록');
    for (let i = 0; i < 9; i++) { const y = 108 + i * 22, on = k >= 2;
      el('circle', { cx: 58, cy: y, r: 6, fill: OFF });
      if (on) mono(70, y + 5, '이름', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.6 + i * 0.05) : 1 });
      else el('rect', { x: 70, y: y - 4, width: 50, height: 8, rx: 4, fill: GRID }); }
    mono(90, 316, '… 30명', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    // 위 계기
    const calls = b.calls, by = tween(p.bytes, b.bytes, u, 1.6);
    spans(CX0, 40, [['HTTP 호출 ', { fill: MUT, 'font-family': 'inherit' }], [String(calls), { 'font-weight': 800, fill: BAD }], ['   받은 바이트 ', { fill: MUT }], [fmt(by) + ' B', { 'font-weight': 800, fill: by > 100000 ? BAD : INK }]], { 'font-size': 15 });
    // 30칸: 한 칸 = 한 사람의 GET /users/{id} 응답 (14.2 KB)
    const fillU = k === 1 ? E(u, 0.3, 2.0) : k >= 1 ? 1 : 0;
    for (let i = 0; i < 30; i++) { const x = CX0 + (i % 6) * (CW + CG), y = CY0 + Math.floor(i / 6) * (CH + CG);
      const s = k === 0 ? pop(u, 0.2 + i * 0.045, 0.4) : 1; if (s <= 0) continue;
      const g = R.G(x + CW / 2, y + CH / 2, s);
      el('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 6, fill: PANEL, stroke: k === 0 ? MUT : INK, 'stroke-width': 1.6, 'stroke-dasharray': k === 0 ? '4 4' : null }, g);
      if (fillU > 0) { const drop = k >= 2 ? (k === 2 ? E(u, 0.4, 1.8) : 1) : 0;
        el('rect', { x: -CW / 2 + 2, y: -CH / 2 + 2, width: (CW - 4) * fillU, height: CH - 4, rx: 4, fill: k >= 2 ? OFF : INFO, opacity: k >= 2 ? 0.75 - 0.45 * drop : 0.55 }, g);
        if (k >= 2) el('rect', { x: -CW / 2 + 2, y: -CH / 2 + 2, width: 4, height: CH - 4, rx: 2, fill: ACC }, g); }
      if (k <= 1) mono(0, 5, '#' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: k === 0 ? MUT : INK, 'font-weight': 700 }, g); }
    if (k === 0) note(CX0, 330, 'URL 1개 = 사람 1명. 30명이면 GET 30번', fade(u, 1.8));
    if (k === 1) note(CX0, 330, 'Promise.all: 30개가 동시에, 하지만 칸마다 14.2 KB', fade(u, 1.6));
    if (k === 2) { pill(CX0 + 38, 330, 'f.name', ACC, pop(u, 0.3), { mono: true, fs: 14 }); note(CX0 + 100, 335, '칸마다 앞쪽 한 줄만 쓰고 나머지 98 필드는 버린다', fade(u, 1.0)); }
    if (k >= 3) { const g = k === 3 ? E(u, 0.2, 1.4) : 1, W = 360;
      tx(CX0, 334, '받은 것', { 'font-size': 14, 'font-weight': 700, fill: MUT }); el('rect', { x: CX0 + 70, y: 320, width: W * g, height: 20, rx: 4, fill: OFF });
      mono(CX0 + 70 + W * g + 8, 336, '426 KB', { 'font-size': 14, 'font-weight': 700, opacity: g });
      tx(CX0, 368, '쓴 것', { 'font-size': 14, 'font-weight': 700, fill: ACC }); el('rect', { x: CX0 + 70, y: 354, width: Math.max(2, W * 0.9 / 426 * g), height: 20, rx: 2, fill: ACC });
      mono(CX0 + 82, 370, '0.9 KB', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: g });
      if (k === 3) { mono(890, 360, '99.8%', { 'font-size': 30, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.4) }); tx(890, 386, '버려지는 비율', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) }); } }
    if (k === 4) {
      const items = [['LTE 다운로드', '약 2.1 초'], ['배터리', '라디오가 오래 켜짐'], ['메인 스레드', 'JSON.parse × 30']];
      items.forEach(([a, v], i) => { const y = 92 + i * 74, s = pop(u, 0.3 + i * 0.3);
        card(870, y, 150, 62, { rx: 10, stroke: BAD, sw: 2, s, text: a + '\n' + v, fs: 13.5 }); });
      pill(870, 322, '?fields=id,name', WARN, pop(u, 1.4), { mono: true, fs: 13.5 });
      tx(870, 352, '팀마다 다른 규칙', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.7) }); }
  }

  // ---------- 3. waterfall: 호출 3번이 줄을 선다 ----------
  const ROWS = [['GET /api/users/1', 0, 50, '14.2 KB'], ['GET /api/users/1/posts', 50, 100, '2.4 KB'], ['GET /api/comments/count?…', 100, 150, '1.4 KB']];
  const RY = [84, 134, 184], GQY = 234;
  function s3(t, c) { const { k, u } = c;
    const ax = axes(400, 56, 480, 200, { x: [0, 200], y: [0, 1], xt: [0, 50, 100, 150, 200] });
    tx(880, 296, '시간 (ms, RTT 50ms 예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    ROWS.forEach(([name, a, b, size], i) => { if (i > k) return; const g = i === k ? E(u, 0.2, 1.4) : 1, y = RY[i];
      mono(40, y + 5, name, { 'font-size': 14, 'font-weight': 700, opacity: i === k ? fade(u, 0, 0.3) : 1 });
      el('rect', { x: ax.X(a), y: y - 14, width: (ax.X(b) - ax.X(a)) * g, height: 28, rx: 5, fill: INFO, opacity: 0.85 });
      if (g > 0.6) mono((ax.X(a) + ax.X(b)) / 2, y + 5, '50ms', { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
      if (g >= 1) mono(ax.X(b) + 8, y + 5, size, { 'font-size': 13.5, fill: MUT, opacity: i === k ? fade(u, 1.4) : 1 }); });
    const dep = (i, label, a) => { const x = ax.X(50 * (i + 1)); grow(x, RY[i] + 14, x, RY[i + 1] - 14, a, BAD, { sw: 2.2 });
      tx(x - 8, (RY[i] + RY[i + 1]) / 2 + 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: a }); };
    if (k >= 1) dep(0, 'user.id', k === 1 ? E(u, 0, 0.5) : 1);
    if (k >= 2) dep(1, 'postIds', k === 2 ? E(u, 0, 0.5) : 1);
    if (k === 1) note(ax.X(100) + 70, RY[1] + 5, '앞 응답 없이는 출발 못 한다', fade(u, 1.5), { fill: BAD, 'font-size': 14 });
    if (k >= 3) { const g = k === 3 ? E(u, 0.2, 1.2) : 1, y = 316;
      el('path', { d: `M${ax.X(0)},${y - 8} V${y} H${ax.X(0) + (ax.X(150) - ax.X(0)) * g} V${y - 8}`, fill: 'none', stroke: BAD, 'stroke-width': 2.2 });
      mono((ax.X(0) + ax.X(150)) / 2, y + 24, '150ms · 호출 3번 · 18 KB', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, k === 3 ? 1.2 : 0) });
      if (k === 3) { pill(160, 316, '{ user, posts, counts }', INK, pop(u, 1.6), { mono: true, fs: 13.5 }); } }
    if (k === 4) { const g = E(u, 0.2, 1.2);
      mono(40, GQY + 5, 'POST /graphql', { 'font-size': 14, 'font-weight': 800, fill: ACC });
      el('rect', { x: ax.X(0), y: GQY - 14, width: (ax.X(50) - ax.X(0)) * g, height: 28, rx: 5, fill: ACC });
      mono(ax.X(50) + 8, GQY + 5, '쿼리 1번에 셋 다', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      [['BFF', '화면마다 엔드포인트'], ['?expand=', '팀마다 다른 규칙'], ['JSON:API', '보일러플레이트']].forEach(([a, b2], i) => { const cx = 170 + i * 190, s = pop(u, 1.0 + i * 0.25);
        card(cx, 384, 170, 52, { rx: 10, stroke: WARN, sw: 2, s, text: a + '\n' + b2, fs: 13.5 }); });
      tx(780, 390, '우회로마다 대가가 남는다', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
  }

  // ---------- 4. /v1 /v2 /v3 ----------
  const VX = [400, 590, 780], VW = 176;
  const VROWS = [['/users', ['/api/v1/users', '/api/v2/users', '/api/v3/users'], ['iOS 1.0~1.4', 'iOS 2.0~2.6', 'iOS 3.0~']],
    ['/users/:id/posts', ['/v1/users/:id/posts', '/v2/users/:id/posts', '/v3/users/:id/posts'], ['', 'shape 변경', 'cursor 추가']]];
  function s4(t, c) { const { k, u } = c;
    const count = k === 0 ? Math.round(lerp(0, 3, E(u, 0.2, 1.4))) : k === 1 ? 3 + Math.round(lerp(0, 3, E(u, 0.2, 1.4))) : 6;
    tx(40, 50, '엔드포인트', { 'font-size': 15, 'font-weight': 700, fill: MUT }); mono(150, 51, String(count), { 'font-size': 22, 'font-weight': 800, fill: count >= 6 ? BAD : INK });
    ['v1', 'v2', 'v3'].forEach((v, j) => { lbl(VX[j], 50, v, 1, { 'font-size': 16, fill: j < 2 && k >= 2 ? BAD : INK });
      if (j < 2 && k >= 2) R.lock(VX[j] + 34, 45, true, BAD, k === 2 ? pop(u, 1.8) : 1); });
    VROWS.forEach(([name, urls, who], r) => { if (r > k) return; const y = 100 + r * 66;
      mono(40, y + 5, name, { 'font-size': 14.5, 'font-weight': 700 });
      urls.forEach((s, j) => { const sc = r === k ? pop(u, 0.2 + j * 0.3) : 1; const g = R.G(VX[j], y, sc);
        el('rect', { x: -VW / 2, y: -26, width: VW, height: 52, rx: 8, fill: PANEL, stroke: r === 1 && j > 0 ? WARN : INK, 'stroke-width': 1.8 }, g);
        mono(0, who[j] ? -3 : 5, s, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 }, g);
        if (who[j]) tx(0, 17, who[j], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g); }); });
    if (k === 2) { const rows = [['"address": "Seoul …"', '"address": { city, zip }', 'v1 앱은 문자열로 읽는다'], ['?page=2', '?cursor=…', 'v2 앱은 page 를 보낸다']];
      rows.forEach(([a, b, why], i) => { const y = 252 + i * 64, s = pop(u, 0.2 + i * 0.6);
        card(170, y, 240, 40, { rx: 8, text: a, fs: 13.5, mono: true, s, stroke: MUT });
        grow(296, y, 356, y, E(u, 0.5 + i * 0.6, 0.9 + i * 0.6), MUT);
        card(480, y, 240, 40, { rx: 8, text: b, fs: 13.5, mono: true, s: pop(u, 0.7 + i * 0.6), stroke: WARN });
        cross(625, y, 10, pop(u, 1.1 + i * 0.6)); note(645, y + 5, why, fade(u, 1.2 + i * 0.6), { 'font-size': 14 }); });
      return; }
    if (k === 3) { card(480, 248, 260, 38, { rx: 19, text: 'email → emailVerified', fs: 14.5, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.1) });
      const jobs = ['① v3 컨트롤러', '② v1·v2 어댑터', '③ OpenAPI × 3', '④ 테스트 × 3', '⑤ 문서 × 3', '⑥ 앱 업데이트 협의'];
      jobs.forEach((s, i) => { const cx = 220 + (i % 3) * 260, cy = i < 3 ? 322 : 382, a = E(u, 0.4 + i * 0.25, 0.8 + i * 0.25);
        grow(480, 267, cx, cy - 22, a, BAD, { sw: 1.6, plain: true });
        card(cx, cy, 200, 44, { rx: 8, text: s, fs: 14, stroke: BAD, s: a > 0.98 ? 1 : a * 0.9 }); });
      mono(900, 254, '1건 → 6곳', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.0) }); return; }
    if (k === 4) { zone(40, 226, 420, 180, 'REST 엔드포인트 = 필드 묶음', { fill: SOFT });
      const chips = ['id', 'name', 'email', 'address', 'posts'];
      el('rect', { x: 62, y: 262, width: 376, height: 54, rx: 27, fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.6) });
      chips.forEach((s, i) => card(105 + i * 72, 289, 64, 32, { rx: 16, text: s, fs: 13.5, mono: true, stroke: s === 'email' ? BAD : MUT, color: s === 'email' ? BAD : INK, s: pop(u, 0.2 + i * 0.1) }));
      note(62, 352, '한 필드가 바뀌면 묶음 전체가', fade(u, 1.0)); note(62, 378, '새 버전 URL 로 끊긴다', fade(u, 1.0), { fill: BAD });
      zone(500, 226, 420, 180, 'GraphQL 스키마 = 필드 하나씩', { fill: ACCBG });
      codeLines(522, 270, ['type User {', '  name: String!', ['  email: String @deprecated', { fill: OFF, 'text-decoration': 'line-through' }], ['  emailVerified: Boolean!', { fill: ACC, 'font-weight': 800 }], '}'],
        lerp(0, 5, E(u, 0.9, 2.0)), { lh: 24, fs: 14.5 });
      tx(900, 394, 'URL 은 그대로', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 2.2) }); }
  }

  // ---------- 5. GraphQL 쿼리 한 번 ----------
  const Q = ['query ProfileScreen($userId: ID!) {', '  user(id: $userId) {', '    name', '    profileImageUrl', '    posts(first: 5) {', '      id', '      title', '      commentCount', '    }', '  }', '}'];
  const A = ['{ "data": {', '  "user": {', '    "name": "박호영",', '    "profileImageUrl": "https://cdn…",', '    "posts": [ {', '      "id": "p1",', '      "title": "GraphQL 시작",', '      "commentCount": 12', '    }, … ]', '  }', '} }'];
  const LEAF = [2, 3, 5, 6, 7];
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 4) { // 같은 화면, 같은 데이터: REST 와 GraphQL
      const rows = [['응답 크기', 14.2, 0.95, ' KB'], ['HTTP 호출', 3, 1, '회'], ['네트워크 RTT', 150, 50, ' ms'], ['버리는 필드', 97, 0, '개']];
      tx(330, 44, 'REST', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); el('rect', { x: 372, y: 33, width: 16, height: 12, rx: 2, fill: OFF });
      tx(420, 44, 'GraphQL', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); el('rect', { x: 488, y: 33, width: 16, height: 12, rx: 2, fill: ACC });
      rows.forEach(([name, a, bb, unit], i) => { const y = 86 + i * 78, g = E(u, 0.2 + i * 0.3, 1.2 + i * 0.3), W = 480;
        tx(60, y + 18, name, { 'font-size': 16, 'font-weight': 700 });
        el('rect', { x: 330, y: y - 4, width: Math.max(3, W * g), height: 20, rx: 4, fill: OFF });
        el('rect', { x: 330, y: y + 22, width: Math.max(3, W * bb / a * g), height: 20, rx: 4, fill: ACC });
        mono(330 + W - 6, y + 12, String(a) + unit, { 'font-size': 14, 'text-anchor': 'end', fill: PANEL, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.3) });
        mono(330 + Math.max(3, W * bb / a) + 8, y + 38, bb + unit, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0 + i * 0.3) }); });
      tx(480, 404, '버전도 URL 대신 스키마의 @deprecated 로 필드 하나씩 바꾼다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      return; }
    zone(30, 30, 430, 300, '보내는 쿼리', { fill: SOFT }); zone(500, 30, 430, 300, '돌아온 JSON', { fill: k >= 2 ? ACCBG : SOFT });
    const qn = k === 0 ? lerp(0, 4, E(u, 0.2, 1.8)) : k === 1 ? lerp(4, 11, E(u, 0.2, 2.0)) : 11;
    codeLines(48, 72, Q.map((s, i) => [s, { fill: LEAF.includes(i) ? ACC : INK, 'font-weight': LEAF.includes(i) ? 700 : 500 }]), qn, { lh: 23, fs: 14 });
    if (k === 1) [['2차 호출 /posts', 120], ['3차 호출 /comments/count', 180]].forEach(([s, y], i) => {
      const sc = pop(u, 0.5 + i * 0.4); card(715, y, 270, 40, { rx: 20, text: s, fs: 14, mono: true, stroke: OFF, color: OFF, s: sc, dash: '5 4' }); cross(870, y, 12, pop(u, 1.5 + i * 0.3)); });
    if (k === 1) note(715, 250, '추가 왕복 없이 중첩으로 따라간다', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC });
    if (k >= 2) { const an = k === 2 ? lerp(0, 4, E(u, 0.2, 1.4)) : k === 3 ? lerp(4, 11, E(u, 0.2, 1.6)) : 11;
      codeLines(518, 72, A.map((s, i) => [s, { fill: LEAF.includes(i) ? ACC : INK }]), an, { lh: 23, fs: 14 });
      LEAF.forEach((i) => { if (i >= an) return; const y = 72 + i * 23 - 5, x1 = 48 + tw(Q[i], 14) + 8;
        grow(x1, y, 512, y, E(u, k === 2 || (k === 3 && i >= 4) ? 0.6 + i * 0.12 : 0, k === 2 || (k === 3 && i >= 4) ? 1.4 + i * 0.12 : 0.01), ACC, { sw: 1.4, dash: '3 4', plain: true }); }); }
    const by = tween(p.bytes, b.bytes, u), tot = tween(p.fieldsTotal, b.fieldsTotal, u);
    spans(40, 372, [['HTTP 호출 ', { fill: MUT }], ['1', { 'font-weight': 800, fill: ACC }], ['    응답 ', { fill: MUT }], [fmt(by) + ' B', { 'font-weight': 800, fill: ACC }], ['    적은 필드 ', { fill: MUT }], [String(Math.round(tot)), { 'font-weight': 800, fill: ACC }], ['    버린 필드 ', { fill: MUT }], ['0', { 'font-weight': 800, fill: ACC }]], { 'font-size': 16 });
    if (k === 3) tx(920, 404, '응답 950 B 는 페이지가 든 예시 값', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) });
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'GET /api/users/1 응답에서 화면이 안 쓰는 필드를 빼 달라고 할 수 없는 까닭은 무엇인가?',
      o: ['URL에는 자원만 적을 뿐 필드를 고를 자리가 없어서', '응답이 14.2 KB를 넘으면 HTTP가 잘라서', '클라이언트가 JSON 필드를 하나씩 읽지 못해서'], a: 0,
      why: 'REST 요청은 어떤 자원을 원하는지만 말한다. 필드 100개 묶음은 서버가 정하고, 화면은 3개만 쓰고 97개를 버린다.' },
    { q: '친구 30명 목록을 Promise.all로 병렬 호출해도 줄지 않는 것은 무엇인가?',
      o: ['모든 응답을 기다리는 시간', '내려받는 바이트 수', '호출이 끝나는 순서'], a: 1,
      why: '병렬화는 기다림을 겹칠 뿐이다. 30 × 14.2 KB = 426 KB를 그대로 받고 그중 0.9 KB만 쓴다.' },
    { q: '프로필 화면의 세 호출이 동시에 나가지 못하는 까닭은 무엇인가?',
      o: ['서버가 같은 사용자의 동시 요청을 막아서', '브라우저가 한 번에 요청 하나만 보내서', '뒤 요청 URL에 앞 응답의 user.id와 postIds가 들어가서'], a: 2,
      why: '/posts는 user.id를, /comments/count는 postIds를 알아야 만들 수 있다. 그래서 RTT 50ms가 세 번 쌓여 150ms가 된다.' },
    { q: 'REST API에서 /v1, /v2, /v3가 함께 살아남는 까닭은 무엇인가?',
      o: ['옛 앱을 강제로 올릴 수 없어 옛 응답 모양을 계속 줘야 해서', '버전이 많을수록 HTTP 캐시가 잘 맞아서', 'URL 하나에 담을 수 있는 필드 수가 정해져 있어서'], a: 0,
      why: 'address를 문자열에서 객체로 바꾸자 v1 앱이 깨졌다. 엔드포인트가 필드 묶음을 돌려주니 필드 하나 바뀌어도 버전 하나가 통째로 생긴다.' },
    { q: 'ProfileScreen 쿼리에 적지 않은 필드는 응답에서 어떻게 되는가?',
      o: ['null로 채워져 온다', '아예 오지 않는다', '응답 맨 뒤에 따로 묶여 온다'], a: 1,
      why: '응답 JSON은 쿼리와 같은 모양이다. 적은 필드 5개만 오므로 버릴 필드가 0개다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    'REST 요청은 자원만 고른다. 프로필 하나에 필드 100개가 오고 화면은 3개만 쓴다.',
    '친구 30명을 부르면 호출 30번에 426 KB를 받아 0.9 KB만 쓴다.',
    '앞 응답 값이 다음 URL에 들어가면 호출이 줄을 서고 RTT 50ms가 세 번 쌓인다.',
    'GraphQL은 필요한 필드를 쿼리 하나에 적어 받고, 필드는 @deprecated로 하나씩 바꾼다.',
  ];
  const review = [
    { q: '상세 화면을 그리려고 REST 호출 3번이 차례로 나가 150ms가 걸린다. 이 시간을 줄이는 가장 직접적인 방법은?',
      o: ['응답마다 필드 수를 줄인다', 'user, posts, 댓글 수를 중첩한 쿼리 하나로 받는다', '세 호출의 순서를 바꾼다'], a: 1,
      why: '느린 원인은 응답 크기보다 앞 응답을 기다리는 왕복이다. 쿼리 하나로 받으면 왕복이 1번(50ms)으로 준다.' },
    { q: '목록 화면을 Promise.all로 바꿨더니 화면은 빨라졌는데 데이터 사용량 불만은 그대로다. 먼저 의심할 것은?',
      o: ['응답마다 화면이 안 쓰는 필드가 대부분이다', '병렬로 보내는 요청 수가 모자라다', 'JSON.parse가 너무 빠르다'], a: 0,
      why: '병렬화는 바이트를 줄이지 못한다. 30명분 426 KB 가운데 화면이 쓰는 것은 0.9 KB다.' },
    { q: 'v2 앱 사용자가 아직 많은데 User의 email을 새 필드로 바꿔야 한다. GraphQL 스키마에서 할 일은?',
      o: ['email 필드를 바로 지운다', '/v2/graphql 엔드포인트를 새로 연다', 'email에 @deprecated를 붙이고 새 필드를 더한다'], a: 2,
      why: '옛 앱은 email을 계속 읽고 새 앱은 새 필드를 쓴다. URL과 버전은 그대로 두고 필드 하나만 물린다.' },
  ];
  R.page({ title: 'REST 호출과 GraphQL 쿼리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
