/* V-1-2 gRPC — protobuf — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 바이트 수와 태그 값은 python 으로 다시 셌다: {"id":1,"name":"Alice","active":true} = 37B, protobuf = 11B,
 * 태그 = 필드 번호×8 + 형식 (08·12·18·22·0a). 행·rpc·필드·타입 목록은 STEPS 의 rows·rpcs·message·types·pitfalls 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const JSON_S = '{"id":1,"name":"Alice","active":true}';
  const PB = ['08', '01', '12', '05', '41', '6c', '69', '63', '65', '18', '01'];
  const grpOf = (i) => (i < 2 ? 0 : i < 9 ? 1 : 2);
  const GCOL = [INFO, ACC, GOOD], GBG = [INFOBG, ACCBG, GOODBG];
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // JSON 의 필드명 칸("id" "name" "active" 와 따옴표)
  const nameIdx = (() => { const set = new Set(); for (const k of ['"id"', '"name"', '"active"']) { const i = JSON_S.indexOf(k); for (let j = 0; j < k.length; j++) set.add(i + j); } return set; })();

  function jsonRow(y, u, op) { const x0 = 36, w = 23;
    for (let i = 0; i < JSON_S.length; i++) { const s = clamp(u * JSON_S.length - i); if (s <= 0) continue; const hot = nameIdx.has(i);
      card(x0 + i * 24 + w / 2, y + 18, w, 36, { rx: 4, text: JSON_S[i], fs: 15, mono: true, fw: 700, fill: hot ? WARNBG : PANEL, stroke: hot ? WARN : GRID, sw: 1.5, color: hot ? WARN : INK, op: op * (0.4 + 0.6 * s) }); } }
  function pbRow(x0, y, w, u, o) { o = o || {};
    PB.forEach((b, i) => { const s = clamp(u * PB.length - i); if (s <= 0) return; const g = grpOf(i);
      card(x0 + i * (w + 6) + w / 2, y + 22, w, 44, { rx: 6, text: b, fs: 15, mono: true, fw: 700, fill: o.plain ? PANEL : GBG[g], stroke: o.plain ? GRID : GCOL[g], sw: 2, color: o.plain ? INK : GCOL[g], s: 0.7 + 0.3 * s, op: o.op ?? 1 }); }); }

  // ---------- 1. REST vs gRPC ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k <= 1) {
      lbl(36, 50, 'REST · JSON', 1, { 'text-anchor': 'start' });
      jsonRow(64, k === 0 ? E(u, 0.2, 1.6) : 1, k === 0 ? 1 : 0.55);
      if (k === 0) { const n = Math.round(E(u, 0.2, 1.6) * JSON_S.length);
        mono(36, 142, n + ' B', { 'font-size': 24, 'font-weight': 800, fill: INK });
        note(150, 140, '그중 주황 칸 18B가 필드명이다', fade(u, 1.7), { fill: WARN });
        note(36, 200, '값이 하나 늘 때마다 "이름": 이 같이 실려 간다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 });
        return; }
      lbl(36, 172, 'gRPC · protobuf', 1, { 'text-anchor': 'start', fill: ACC });
      pbRow(36, 186, 56, E(u, 0.2, 1.2));
      [[0, 1, 'id = 1'], [2, 8, 'name = "Alice"'], [9, 10, 'active = true']].forEach(([a, z, s], g) => { const x1 = 36 + a * 62, x2 = 36 + z * 62 + 56, op = fade(u, 1.0 + g * 0.2);
        el('path', { d: `M${x1},240 V248 H${x2} V240`, fill: 'none', stroke: GCOL[g], 'stroke-width': 2, opacity: op });
        mono((x1 + x2) / 2, 270, s, { 'font-size': 14, 'font-weight': 700, fill: GCOL[g], 'text-anchor': 'middle', opacity: op }); });
      const big = tween(p.payload ? p.payload.restBytes : 37, b.payload.restBytes, u), sm = lerp(big, b.payload.grpcBytes, E(u, 1.2, 2.2));
      tx(36, 322, 'JSON', { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 130, y: 306, width: big * 16, height: 22, rx: 4, fill: WARN, opacity: 0.8 });
      mono(130 + big * 16 + 10, 323, Math.round(big) + ' B', { 'font-size': 15, 'font-weight': 700 });
      tx(36, 362, 'protobuf', { 'font-size': 15, 'font-weight': 700, fill: ACC }); el('rect', { x: 130, y: 346, width: sm * 16, height: 22, rx: 4, fill: ACC });
      mono(130 + sm * 16 + 10, 363, Math.round(sm) + ' B', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      note(780, 345, '약 3분의 1', fade(u, 2.2), { 'font-size': 20, 'font-weight': 800, fill: ACC });
      return; }
    if (k === 2) {
      note(40, 40, '태그 바이트 = 필드 번호 × 8 + 형식', 1);
      [['08', '0x08 = 8 = 1×8 + 0', '필드 1 · varint', 0], ['12', '0x12 = 18 = 2×8 + 2', '필드 2 · 길이 붙은 값', 1], ['18', '0x18 = 24 = 3×8 + 0', '필드 3 · varint', 2]].forEach(([h, f, m, g], i) => {
        const y = 80 + i * 48, s = pop(u, 0.2 + i * 0.3);
        card(66, y, 50, 38, { rx: 6, text: h, fs: 15, mono: true, fw: 800, fill: GBG[g], stroke: GCOL[g], color: GCOL[g], s });
        mono(104, y + 5, f, { 'font-size': 14, opacity: fade(u, 0.3 + i * 0.3) });
        tx(300, y + 5, m, { 'font-size': 14, 'font-weight': 700, fill: GCOL[g], opacity: fade(u, 0.4 + i * 0.3) }); });
      // .proto 해석표
      el('rect', { x: 560, y: 50, width: 360, height: 150, rx: 10, fill: SOFT, opacity: fade(u, 1.0) });
      tx(580, 76, '받는 쪽은 .proto로 이름을 찾는다', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
      [['1', 'id'], ['2', 'name'], ['3', 'active']].forEach(([n, s], i) => { const op = fade(u, 1.2 + i * 0.15);
        mono(600, 110 + i * 30, n, { 'font-size': 15, 'font-weight': 800, fill: GCOL[i], opacity: op }); grow(620, 105 + i * 30, 690, 105 + i * 30, op, MUT);
        mono(704, 110 + i * 30, s, { 'font-size': 15, 'font-weight': 700, opacity: op }); });
      // HTTP/1.1 vs HTTP/2
      const hy = 290; note(40, 248, 'HTTP/1.1 · 커넥션 하나에 요청 하나씩', fade(u, 1.4), { 'font-size': 14 });
      [0, 1, 2].forEach((i) => { const y = hy + i * 38, op = fade(u, 1.4);
        el('rect', { x: 50, y: y - 9, width: 360, height: 18, rx: 9, fill: SOFT, stroke: GRID, opacity: op });
        const f = ((t * 0.35 + i * 0.3) % 1); if (op > 0.5) el('rect', { x: 56 + f * 300, y: y - 6, width: 44, height: 12, rx: 3, fill: MUT }); });
      note(520, 248, 'HTTP/2 · 커넥션 1개에 스트림 여러 개', fade(u, 1.8), { 'font-size': 14, fill: ACC });
      el('rect', { x: 530, y: hy + 20, width: 390, height: 34, rx: 17, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.8) });
      if (u > 1.8) for (let j = 0; j < 9; j++) { const f = ((t * 0.25 + j / 9) % 1), sid = [1, 3, 5][j % 3];
        el('rect', { x: 540 + f * 340, y: hy + 27, width: 30, height: 20, rx: 4, fill: [INFO, ACC, GOOD][j % 3] }); mono(555 + f * 340, hy + 42, String(sid), { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); }
      sub(725, hy + 82, '요청마다 스트림 번호(1·3·5…)를 달고 섞여 흐른다', fade(u, 2.1));
      return; }
    // k3: 비교표
    const rows = b.rows, np = p.rows ? p.rows.length : 0;
    tx(40, 44, '항목', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(200, 44, 'REST', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(520, 44, 'gRPC', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    el('line', { x1: 30, y1: 56, x2: 930, y2: 56, stroke: GRID, 'stroke-width': 1.5 });
    rows.forEach((r, i) => { const y = 92 + i * 56, isNew = i >= np, s = isNew ? pop(u, 0.3 + (i - np) * 0.4) : 1; if (s <= 0.01) return;
      if (isNew) el('rect', { x: 30, y: y - 24, width: 900, height: 46, rx: 8, fill: r.win ? ACCBG : WARNBG, opacity: 0.7 * clamp(s) });
      tx(40, y + 5, r.field, { 'font-size': 16, 'font-weight': 800, opacity: clamp(s) });
      tx(200, y + 5, r.rest, { 'font-size': 15, fill: MUT, opacity: clamp(s) });
      tx(520, y + 5, r.grpc, { 'font-size': 15, 'font-weight': 700, fill: r.win ? ACC : WARN, opacity: clamp(s) });
      if (r.win) check(900, y, 10, s); else tx(900, y + 6, '△', { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: clamp(s) }); });
    note(40, 395, '서비스끼리는 gRPC, 브라우저·공개 API는 REST가 기본값이다', fade(u, 1.6), { fill: INK }); }

  // ---------- 2. .proto 계약 ----------
  function svcCard(b, k, u, p, t) { const rpcs = b.rpcs, np = p.rpcs ? p.rpcs.length : 0;
    el('rect', { x: 30, y: 30, width: 440, height: 250, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
    mono(50, 58, 'service UserService', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    tx(452, 58, '클라이언트 ⇄ 서버', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    rpcs.forEach((r, i) => { const y = 100 + i * 92, isNew = i >= np, s = isNew ? pop(u, 0.2) : 1;
      mono(50, y, 'rpc ' + r.name, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) });
      const ly = y + 36; el('line', { x1: 60, y1: ly, x2: 440, y2: ly, stroke: GRID, 'stroke-width': 2, opacity: clamp(s) });
      el('circle', { cx: 60, cy: ly, r: 6, fill: INK, opacity: clamp(s) }); el('circle', { cx: 440, cy: ly, r: 6, fill: ACC, opacity: clamp(s) });
      const go = isNew ? seg(u, 0.6, 1.4) : 1;
      if (go > 0 && go < 1) fly(80, ly, 420, ly, go, r.in, { mono: true, fill: INFO });
      if (go >= 1) pill(150, ly - 20, r.in, INFO, 1, { mono: true, fs: 13.5, fill: PANEL });
      const stream = r.out.startsWith('stream');
      if (!stream) { const bk = isNew ? seg(u, 1.5, 2.3) : 1; if (bk > 0 && bk < 1) fly(420, ly, 80, ly, bk, r.out, { mono: true });
        if (bk >= 1) pill(360, ly + 20, r.out, ACC, 1, { mono: true, fs: 13.5, fill: PANEL }); }
      else { const on = isNew ? fade(u, 1.5) : 1; for (let j = 0; j < 4; j++) dot([[420, ly + 4], [80, ly + 4]], ((t * 0.5 + j / 4) % 1), ACC, 6);
        pill(340, ly + 20, 'stream User · N개', ACC, on, { mono: true, fs: 13.5, fill: PANEL }); } }); }
  function msgCard(m, u, fresh, o) { o = o || {};
    el('rect', { x: 500, y: 30, width: 430, height: 250, rx: 12, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: fresh ? fade(u, 0.1) : 1 });
    mono(520, 58, 'message ' + m.name, { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fresh ? fade(u, 0.2) : 1 });
    const tags = { 1: ['08'], 2: ['12'], 3: ['18'] };
    m.fields.forEach((f, i) => { const y = 100 + i * 46, s = fresh ? pop(u, 0.4 + i * 0.3) : 1;
      el('circle', { cx: 538, cy: y, r: 16 * clamp(s), fill: INFO });
      mono(538, y + 5, String(f.n), { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: clamp(s) });
      mono(568, y + 5, f.type, { 'font-size': 15, fill: INFO, opacity: clamp(s) }); mono(648, y + 5, f.name, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) });
      card(886, y, 50, 32, { rx: 6, text: tags[f.n][0], fs: 14, mono: true, fw: 800, fill: GBG[f.n - 1], stroke: GCOL[f.n - 1], color: GCOL[f.n - 1], s: fresh ? pop(u, 0.9 + i * 0.3) : 1 }); });
    if (o.next) { const y = 100 + m.fields.length * 46, op = fade(u, 2.0);
      el('rect', { x: 518, y: y - 18, width: 394, height: 36, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: op });
      mono(538, y + 5, '4', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: op });
      tx(568, y + 5, '새 필드는 여기, 다음 번호로만', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: op }); }
    tx(886, 62, '태그', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fresh ? fade(u, 0.9) : 1 }); }
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) {
      ['syntax = "proto3";', 'package user.v1;', 'option go_package = "example.com/gen/userpb";'].forEach((s, i) => {
        const y = 70 + i * 54, w = tw(s, 15) + 30, sh = clamp(u * 1.6 - i * 0.35);
        el('rect', { x: 40, y: y - 22, width: w, height: 38, rx: 8, fill: i === 2 ? ACCBG : SOFT, stroke: i === 2 ? ACC : GRID, 'stroke-width': 1.5, opacity: clamp(sh * 3) });
        mono(55, y + 3, s.slice(0, Math.round(s.length * clamp(sh * 1.5))), { 'font-size': 15, fill: i === 2 ? ACC : INK, 'font-weight': 700 }); });
      grow(500, 178, 600, 178, seg(u, 1.6, 2.0), ACC);
      card(760, 178, 300, 62, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.9) });
      mono(760, 172, 'import pb', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      mono(760, 194, '"example.com/gen/userpb"', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      [['service ?', 240], ['message ?', 700]].forEach(([s, x]) => { el('rect', { x: x - 200, y: 270, width: 400, height: 110, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '7 6' });
        mono(x, 330, s, { 'font-size': 15, fill: OFF, 'text-anchor': 'middle' }); });
      return; }
    svcCard(b, k, u, k <= 2 ? p : b, t);
    const m = b.message;
    if (!m.fields.length) { el('rect', { x: 500, y: 30, width: 430, height: 250, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '7 6' }); mono(715, 160, 'message ?', { 'font-size': 15, fill: OFF, 'text-anchor': 'middle' }); }
    else msgCard(m, u, p.message && p.message.name !== m.name || (p.message && !p.message.fields.length), { next: k === 5 });
    // 아래: 전송 바이트
    if (k >= 3) { tx(36, 322, '전송되는 바이트', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      if (k === 3) { card(90, 366, 50, 40, { rx: 6, text: '08', fs: 15, mono: true, fw: 800, fill: INFOBG, stroke: INFO, color: INFO, s: pop(u, 1.4) }); card(146, 366, 50, 40, { rx: 6, text: '01', fs: 15, mono: true, fw: 800, fill: INFOBG, stroke: INFO, color: INFO, s: pop(u, 1.6) });
        note(200, 372, 'GetUserRequest{Id: 1} → 필드 1의 태그 08, 값 01', fade(u, 1.8), { 'font-size': 14 }); }
      if (k === 4) { card(90, 366, 50, 40, { rx: 6, text: '08', fs: 15, mono: true, fw: 800, fill: INFOBG, stroke: INFO, color: INFO, s: pop(u, 1.2) }); card(146, 366, 50, 40, { rx: 6, text: '…', fs: 15, mono: true, fw: 800, stroke: GRID, s: pop(u, 1.4) });
        note(200, 372, 'page_size도 1번이라 태그는 똑같이 08이다. 메시지가 달라 섞이지 않는다', fade(u, 1.7), { 'font-size': 14 }); }
      if (k === 5) { pbRow(40, 344, 44, E(u, 1.2, 2.0)); note(614, 372,'id·name·active = 08 · 12 · 18', fade(u, 2.0), { 'font-size': 14 }); } } }

  // ---------- 3. protoc 코드 생성 ----------
  function docIcon(cx, cy, name, col, s, op) { const g = R.G(cx, cy, s ?? 1, op ?? 1);
    el('path', { d: 'M-30,-38 H14 L30,-22 V38 H-30 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M14,-38 V-22 H30', fill: 'none', stroke: col || INK, 'stroke-width': 2 }, g);
    [-12, 0, 12].forEach((y) => el('line', { x1: -20, y1: y, x2: 18, y2: y, stroke: GRID, 'stroke-width': 3, 'stroke-linecap': 'round' }, g));
    tx(0, 60, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: col || INK }, g); return g; }
  function gear(cx, cy, r, ang, col, op) { const pts = []; for (let i = 0; i < 24; i++) { const a = ang + (i / 24) * Math.PI * 2, rr = i % 2 ? r : r * 0.78; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    el('polygon', { points: pts.map((q) => q.join(',')).join(' '), fill: INFOBG, stroke: col || INFO, 'stroke-width': 2.4, 'stroke-linejoin': 'round', opacity: op ?? 1 });
    el('circle', { cx, cy, r: r * 0.3, fill: PANEL, stroke: col || INFO, 'stroke-width': 2.4, opacity: op ?? 1 }); }
  const P3 = { doc: [90, 92], gear: [270, 92], pb: [460, 92], grpc: [640, 92], app: [850, 92] };
  function arc(d, u, col) { if (u <= 0) return; const e = el('path', { d, fill: 'none', stroke: col || MUT, 'stroke-width': 2.2, pathLength: 100, 'stroke-dasharray': `${u * 100} 100`, 'marker-end': u > 0.98 ? 'url(#ra-ah)' : null }); return e; }
  function pipeline(k, u, t) {
    docIcon(P3.doc[0], P3.doc[1], 'user.proto', WARN);
    grow(126, 92, 222, 92, k === 0 ? seg(u, 0.2, 0.8) : 1, MUT);
    gear(P3.gear[0], P3.gear[1], 42, k === 0 ? t * 1.2 : 0.4, INFO);
    tx(P3.gear[0], 160, 'protoc', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO });
    if (k === 0) for (let j = 0; j < 3; j++) dot([[126, 92], [228, 92]], ((t * 0.6 + j / 3) % 1), WARN, 5);
    const gen = k === 0 ? 0 : k === 1 ? pop(u, 0.2) : 1;
    if (k >= 1) { grow(314, 92, 422, 92, k === 1 ? seg(u, 0.1, 0.5) : 1, MUT); arc('M292,56 Q470,-6 602,50', k === 1 ? seg(u, 0.1, 0.6) : 1, MUT);
      docIcon(P3.pb[0], P3.pb[1], 'user.pb.go', GOOD, gen); docIcon(P3.grpc[0], P3.grpc[1], 'user_grpc.pb.go', GOOD, gen); }
    if (k >= 2) { grow(676, 92, 788, 92, k === 2 ? seg(u, 0.1, 0.5) : 1, ACC); card(P3.app[0], P3.app[1], 120, 64, { rx: 10, text: 'server.go\n내 코드', fs: 14, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 0.3) : 1 }); } }
  function methods(rows, y0, u, hot) { rows.forEach(([n, v, col, sub2], i) => { const y = y0 + i * 52;
      el('rect', { x: 520, y: y - 22, width: 410, height: 44, rx: 8, fill: col === ACC ? ACCBG : SOFT, stroke: col, 'stroke-width': 1.8 });
      mono(536, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: col });
      tx(720, y + 5, v, { 'font-size': 14, fill: col === ACC ? ACC : MUT, 'font-weight': 700, opacity: hot === i ? fade(u, 0.6) : 1 });
      if (sub2) mono(920, y + 5, sub2, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }); }
  function s3(t, c) { const { k, u } = c;
    pipeline(k, u, t);
    if (k === 0) { R.terminal(60, 230, 840, 96, ['$ protoc --go_out=. --go-grpc_out=. user.proto'], 0.15 + E(u, 0.3, 1.8) * 0.85, { title: 'Makefile', fs: 15 });
      note(60, 370, '--go_out은 message 코드, --go-grpc_out은 service 코드를 만든다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 1) { const lines = ['type User struct {', '    Id     int64', '    Name   string', '    Active bool', '}'];
      el('rect', { x: 60, y: 210, width: 380, height: 180, rx: 10, fill: SOFT, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.6) });
      tx(76, 236, 'user.pb.go 안 (생성됨)', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.6) });
      lines.forEach((s, i) => mono(76, 268 + i * 24, s, { 'font-size': 15, opacity: fade(u, 0.8 + i * 0.15) }));
      el('rect', { x: 480, y: 210, width: 440, height: 180, rx: 10, fill: SOFT, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.2) });
      tx(496, 236, 'user_grpc.pb.go 안 (생성됨)', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) });
      ['UserServiceServer  (서버 인터페이스)', 'UserServiceClient  (클라이언트 스텁)', 'UnimplementedUserServiceServer'].forEach((s, i) => mono(496, 274 + i * 32, s, { 'font-size': 14, opacity: fade(u, 1.4 + i * 0.2) }));
      note(496, 376, 'import 할 때는 pb 별칭 하나로 둘 다 쓴다', fade(u, 2.1), { 'font-size': 13.5, fill: MUT }); return; }
    // k2~: server struct
    el('rect', { x: 40, y: 200, width: 440, height: 160, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: k === 2 ? fade(u, 0.2) : 1 });
    mono(60, 228, 'type server struct {', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 0.2) : 1 });
    card(260, 282, 380, 56, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.8, s: k === 2 ? pop(u, 0.6) : 1 });
    mono(260, 288, 'pb.UnimplementedUserServiceServer', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: k === 2 ? fade(u, 0.8) : 1 });
    mono(60, 346, '}', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 2) { methods([['GetUser', '기본 구현 (Unimplemented)', MUT], ['ListUsers', '기본 구현 (Unimplemented)', MUT]], 234, u);
      note(520, 360, 'rpc를 다 안 채워도 컴파일된다', fade(u, 1.6), { 'font-size': 15, fill: GOOD }); return; }
    if (k === 3) { methods([['GetUser', 'server.GetUser (내 구현)', ACC], ['ListUsers', '기본 구현 (Unimplemented)', MUT]], 234, u, 0);
      check(900, 234, 9, pop(u, 0.8));
      mono(520, 336, 'return &pb.User{Id: req.Id,', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.2) });
      mono(520, 358, '    Name: "Alice", Active: true}', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.3) });
      note(520, 396, '안 채운 ListUsers는 codes.Unimplemented를 돌려준다', fade(u, 1.9), { 'font-size': 13.5, fill: MUT }); return; }
    // k4: 등록하고 Serve
    methods([['GetUser', 'server.GetUser (내 구현)', ACC]], 234, u);
    card(725, 312, 170, 46, { rx: 23, text: 'lis :50051', fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO, s: pop(u, 0.2) });
    pill(725, 392, '/user.v1.UserService/GetUser', INFO, pop(u, 0.5), { mono: true, fs: 13.5, fill: PANEL });
    grow(725, 376, 725, 338, seg(u, 0.9, 1.3), INFO); grow(725, 289, 725, 260, seg(u, 1.4, 1.8), INFO);
    dot([[725, 376], [725, 258]], seg(u, 1.0, 2.0), ACC, 7);
    sub(260, 394, '경로를 보고 생성 코드가 알맞은 메서드로 보낸다', fade(u, 2.0), { 'font-size': 13.5 }); }

  // ---------- 4. 4가지 RPC · 데드라인 ----------
  const P4 = { cx: 100, sx: 520, y: 120 };
  function typeCard(tp, i, s, t) { const y = 66 + i * 84, n = tp.name, nReq = /Client|Bidi/.test(n) ? 3 : 1, nRes = /Server|Bidi/.test(n) ? 3 : 1;
    card(790, y, 300, 74, { rx: 10, stroke: GRID, sw: 1.6, s }); if (s < 0.6) return;
    tx(652, y - 8, n, { 'font-size': 15, 'font-weight': 800 }); mono(652, y + 20, tp.flow, { 'font-size': 13.5, fill: MUT });
    el('circle', { cx: 850, cy: y, r: 6, fill: INK }); el('circle', { cx: 920, cy: y, r: 6, fill: INK });
    for (let j = 0; j < nReq; j++) { const f = nReq === 1 ? (t * 0.5) % 1 : (t * 0.5 + j / 3) % 1; el('circle', { cx: 856 + f * 58, cy: y - 12, r: 4, fill: INFO }); }
    for (let j = 0; j < nRes; j++) { const f = nRes === 1 ? (t * 0.5 + 0.5) % 1 : (t * 0.5 + j / 3) % 1; el('circle', { cx: 914 - f * 58, cy: y + 12, r: 4, fill: ACC }); } }
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {}, np = p.types ? p.types.length : 0;
    b.types.forEach((tp, i) => typeCard(tp, i, i >= np ? pop(u, 0.3) : 1, t));
    card(P4.cx, P4.y, 130, 70, { rx: 10, text: 'client', fs: 15, stroke: INK });
    card(P4.sx, P4.y, 150, 70, { rx: 10, text: 'UserService\n:50051', fs: 14.5, mono: true, stroke: ACC, color: ACC });
    const pg = k === 0 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: 168, y: P4.y - 13, width: (442 - 168) * pg, height: 26, rx: 13, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8 });
    sub(305, P4.y - 24, 'HTTP/2 커넥션 1개', pg, { fill: ACC, 'font-weight': 700 });
    pill(P4.cx + 62, P4.y + 54, 'pb.NewUserServiceClient(conn)', INK, k === 0 ? pop(u, 1.0) : 1, { mono: true, fs: 13.5, fill: PANEL });
    if (k === 0) { note(40, 300, '커넥션은 한 번 열어 두고 재사용한다', fade(u, 1.6)); note(40, 334, '네 가지 호출 방식이 모두 이 스텁에서 나온다', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); return; }
    // 데드라인 막대 (k 1·2)
    const dy = 262, dw = 420, fill = k === 1 ? E(u, 0.3, 2.3) : E(u, 0.2, 1.2) * 0.35;
    if (k <= 2) {
    tx(40, dy - 14, 'ctx 데드라인 2s', { 'font-size': 15, 'font-weight': 700, fill: WARN });
    el('rect', { x: 40, y: dy, width: dw, height: 20, rx: 4, fill: SOFT, stroke: GRID }); el('rect', { x: 40, y: dy, width: dw * fill, height: 20, rx: 4, fill: k === 1 && fill > 0.97 ? BAD : WARN, opacity: 0.85 });
    ['0s', '1s', '2s'].forEach((s, i) => mono(40 + i * dw / 2, dy + 40, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': i === 0 ? 'start' : i === 2 ? 'end' : 'middle' })); }
    if (k === 1) { pill(250, dy + 92, '2s를 넘기면 codes.DeadlineExceeded', BAD, pop(u, 2.3), { fs: 13.5, mono: false, fill: PANEL }); return; }
    if (k === 2) { const go = seg(u, 0.3, 1.2), bk = seg(u, 1.4, 2.2);
      if (go > 0 && go < 1) fly(268, P4.y, 345, P4.y, go, 'GetUserRequest{Id: 1}', { mono: true, fill: INFO });
      if (bk > 0 && bk < 1) fly(370, P4.y, 240, P4.y, bk, 'codes.NotFound', { mono: true, fill: BAD });
      if (bk >= 1) pill(420, 210, 'err = status: codes.NotFound', BAD, 1, { mono: true, fs: 13.5, fill: PANEL });
      note(40, 360, '에러는 예외가 아니라 상태 코드로 돌아온다', fade(u, 2.0)); return; }
    // k3: 분기
    pill(420, 210, 'err = status: codes.NotFound', BAD, 1, { mono: true, fs: 13.5, fill: PANEL });
    const by = 310; card(130, by, 210, 44, { rx: 8, text: 'status.Code(err)', fs: 14, mono: true, stroke: INK, s: pop(u, 0.2) });
    grow(236, by - 8, 300, by - 34, seg(u, 0.6, 1.0), MUT); grow(236, by + 8, 300, by + 34, seg(u, 0.9, 1.3), MUT);
    mono(310, by - 32, 'NotFound → log "유저 없음"', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
    mono(310, by + 44, '그 밖 → return err', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
    mono(40, 410, '성공이면 user.Name을 그냥 쓴다 → Alice', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ---------- 5. 하위 호환 · 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) {
      el('rect', { x: 30, y: 40, width: 330, height: 230, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
      tx(48, 68, '새 서버 · User (필드 4개)', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      [['1', 'int64 id'], ['2', 'string name'], ['3', 'bool active'], ['4', 'string email']].forEach(([n, s], i) => { const y = 104 + i * 42, nw = i === 3, sc = nw ? pop(u, 0.3) : 1;
        el('circle', { cx: 64, cy: y, r: 14 * sc, fill: nw ? ACC : INFO }); mono(64, y + 5, n, { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: clamp(sc) });
        mono(90, y + 5, s, { 'font-size': 15, fill: nw ? ACC : INK, 'font-weight': nw ? 800 : 500, opacity: clamp(sc) }); });
      const cells = PB.concat(['22', '…']); const x0 = 30, w = 52;
      tx(30, 312, '보내는 바이트', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.8) });
      cells.forEach((h, i) => { const s = clamp(E(u, 0.8, 1.6) * cells.length - i); if (s <= 0) return; const f4 = i >= 11, g = f4 ? 0 : grpOf(i);
        card(x0 + i * (w + 4) + w / 2, 348, w, 40, { rx: 6, text: h, fs: 14.5, mono: true, fw: 800, fill: f4 ? (u > 2 ? SOFT : ACCBG) : GBG[g], stroke: f4 ? ACC : GCOL[g], color: f4 ? (u > 2 ? OFF : ACC) : GCOL[g], dash: f4 && u > 2 ? '4 4' : null, op: s }); });
      el('rect', { x: 600, y: 40, width: 330, height: 230, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.2) });
      tx(618, 68, '옛 클라이언트 (1~3만 안다)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.2) });
      [['id', '1'], ['name', '"Alice"'], ['active', 'true']].forEach(([n, v], i) => { const op = fade(u, 1.4 + i * 0.15); mono(630, 108 + i * 38, n + ' = ' + v, { 'font-size': 15, opacity: op }); check(900, 103 + i * 38, 8, op); });
      mono(630, 230, '22 … → 모르는 필드, 건너뜀', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(30 + 11 * 56 + 54, 402, '0x22 = 4×8 + 2', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); return; }
    if (k === 1) {
      tx(40, 50, 'message User의 번호 칸', { 'font-size': 15, 'font-weight': 800 });
      ['id', 'name', 'active', 'email', 'reserved'].forEach((s, i) => { const x = 60 + i * 168, lockd = i === 4;
        card(x + 70, 130, 150, 90, { rx: 10, fill: lockd ? BADBG : PANEL, stroke: lockd ? BAD : i === 3 ? ACC : INFO, sw: 2, s: lockd ? pop(u, 0.2) : 1 });
        mono(x + 22, 108, String(i + 1), { 'font-size': 20, 'font-weight': 800, fill: lockd ? BAD : INFO });
        mono(x + 70, 160, lockd ? '"phone"' : s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: lockd ? BAD : INK }); });
      lock(820, 108, true, BAD, pop(u, 0.5));
      const go = seg(u, 0.9, 1.6), at = lerp(560, 760, E(go, 0, 1)), bounce = u > 1.6 ? lerp(760, 640, E(u, 1.6, 2.1)) : at;
      if (u > 0.9) pill(bounce, 260, 'string nickname = 5;', u > 1.6 ? BAD : INK, 1, { mono: true, fs: 14, fill: PANEL });
      if (u > 1.6) cross(860, 260, 12, pop(u, 1.6));
      note(40, 340, 'protoc가 예약된 번호 5를 쓰는 줄을 거부한다', fade(u, 1.9), { fill: BAD });
      note(40, 376, '지운 번호를 잠가야 언젠가 다시 쓰는 사고를 막는다', fade(u, 2.3), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 2) {
      browser(110, 150, 150, 110, '브라우저', {});
      card(480, 150, 200, 80, { rx: 10, text: 'grpc-gateway\n(REST → gRPC)', fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      card(840, 150, 170, 80, { rx: 10, text: 'UserService\nGetUser', fs: 14.5, mono: true, stroke: ACC, color: ACC });
      grow(190, 150, 376, 150, seg(u, 0.4, 1.0), MUT); grow(584, 150, 752, 150, seg(u, 1.2, 1.7), ACC);
      dot([[190, 150], [378, 150]], seg(u, 0.5, 1.2), WARN, 7); dot([[584, 150], [754, 150]], seg(u, 1.3, 1.9), ACC, 7);
      mono(283, 128, 'GET /v1/users/{id}', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
      sub(283, 180, 'JSON', fade(u, 0.6)); sub(668, 180, 'protobuf', fade(u, 1.4)); mono(668, 128, 'GetUser', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) });
      note(40, 290, 'option (google.api.http) 한 줄로 같은 rpc를 REST 경로로도 연다', fade(u, 2.0), { 'font-size': 14.5 });
      note(40, 330, '내부는 gRPC, 외부·브라우저는 REST', fade(u, 2.3), { fill: MUT, 'font-weight': 500 }); return; }
    // k3: 금지 3가지
    const boxes = [['타입 변경', ['int64 id = 1', '→ string id = 1'], '태그 08 → 0a, 옛 쪽이 오독'], ['번호 재사용', ['name = 2 지우고', '→ email = 2'], '옛 쪽은 email을 name으로 읽는다'], ['스트림 미정리', ['CloseSend · cancel', '없이 끝냄'], 'goroutine과 커넥션이 샌다']];
    boxes.forEach(([h, ls, why], i) => { const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.4), op = fade(u, 0.3 + i * 0.4);
      card(cx, 190, 280, 280, { rx: 12, stroke: BAD, sw: 2, fill: PANEL, s }); cross(cx - 110, 82, 10, s);
      tx(cx - 88, 88, h, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: op });
      ls.forEach((l, j) => mono(cx - 120, 140 + j * 28, l, { 'font-size': 14.5, opacity: op }));
      tx(cx - 120, 300, why, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op });
      if (i === 2) for (let j = 0; j < Math.floor(E(u, 1.0, 2.4) * 8); j++) el('circle', { cx: cx - 110 + (j % 8) * 30, cy: 240, r: 7, fill: WARN, opacity: 0.85 }); });
    note(40, 400, 'CI에서 buf breaking으로 검사하면 배포 전에 잡힌다', fade(u, 2.3), { 'font-size': 14.5 }); }

  const quiz = [
    { q: '같은 유저 응답이 JSON으로 37B, protobuf로 11B가 되는 가장 큰 이유는 무엇인가?',
      o: ['protobuf가 값을 압축 알고리즘으로 줄여서', '필드명 대신 필드 번호가 든 태그 1바이트만 보내서', 'HTTP/2가 헤더를 생략해서'], a: 1,
      why: 'JSON 37B 중 18B가 "id" "name" "active" 같은 필드명이다. protobuf는 이름 대신 번호×8+형식인 태그 바이트(08·12·18)만 보낸다.' },
    { q: '.proto의 필드에서 배포 뒤 절대 바꾸면 안 되는 것은 무엇인가?',
      o: ['필드 이름', '주석', '필드 번호'], a: 2,
      why: '바이트에는 이름이 없고 번호만 태그로 실린다. 이름을 바꿔도 통신은 그대로지만 번호가 바뀌면 옛 클라이언트가 다른 필드로 읽는다.' },
    { q: '서버 struct에 pb.UnimplementedUserServiceServer를 embed하면 얻는 것은 무엇인가?',
      o: ['아직 구현하지 않은 rpc가 있어도 컴파일이 된다', '모든 rpc가 자동으로 구현된다', 'JSON으로도 응답할 수 있다'], a: 0,
      why: '구현하지 않은 메서드는 기본 구현이 채워 codes.Unimplemented를 돌려준다. 그래서 .proto에 rpc를 더해도 기존 서버가 바로 깨지지 않는다.' },
    { q: 'gRPC 호출에 데드라인을 걸지 않으면 생기는 일은 무엇인가?',
      o: ['응답이 JSON으로 바뀐다', '상대가 느려질 때 호출하는 goroutine이 끝없이 붙잡힌다', '커넥션이 요청마다 새로 열린다'], a: 1,
      why: 'context.WithTimeout으로 2초 상한을 걸면 넘는 순간 codes.DeadlineExceeded로 끝난다. 상한이 없으면 대기가 쌓인다.' },
    { q: '배포된 User 메시지에 email을 추가하는 안전한 방법은 무엇인가?',
      o: ['안 쓰는 2번 자리를 email로 바꾼다', 'id의 타입을 string으로 바꾸고 email을 넣는다', '다음 번호인 4번으로 추가한다'], a: 2,
      why: '새 번호로 추가하면 옛 클라이언트는 태그 22를 모르는 필드로 보고 건너뛴다. 번호 재사용이나 타입 변경은 오독을 만든다.' },
  ];

  const summary = [
    'JSON은 필드명까지 실어 보내서 같은 응답이 37B, protobuf는 번호만 보내 11B다.',
    '.proto의 필드 번호가 바이트의 태그가 된다. 이름은 바꿔도 되지만 번호는 못 바꾼다.',
    'protoc가 message struct와 서버 인터페이스·클라이언트 스텁을 만들고 나는 로직만 채운다.',
    '모든 호출에 데드라인을 걸고, 에러는 status 코드로 나눠 처리한다.',
  ];
  const review = [
    { q: '옛 클라이언트가 배포 뒤 name 자리에 이메일을 보여 주기 시작했다. 먼저 의심할 것은?',
      o: ['서버가 JSON으로 응답했다', '누가 지운 번호 2를 다른 필드에 다시 썼다', 'HTTP/2 커넥션이 끊겼다'], a: 1,
      why: '옛 클라이언트는 태그 번호 2를 name으로 읽는다. 지운 번호는 reserved로 잠가야 이런 재사용을 protoc가 막는다.' },
    { q: '브라우저 화면에서 UserService.GetUser를 불러야 한다. 알맞은 방법은?',
      o: ['grpc-gateway로 같은 rpc를 REST 경로로 연다', '브라우저에서 grpc.Dial을 직접 호출한다', '.proto를 버리고 REST 서버를 따로 만든다'], a: 0,
      why: '브라우저는 gRPC를 직접 부르지 못한다. google.api.http 옵션으로 GET /v1/users/{id}를 열면 한 계약에서 두 표면을 얻는다.' },
    { q: 'user.pb.go를 손으로 고쳐 필드를 더했는데 다음 빌드에서 사라졌다. 왜 그런가?',
      o: ['Go 컴파일러가 생성 파일을 무시해서', 'Unimplemented를 embed하지 않아서', 'protoc를 다시 돌리면 생성 파일이 통째로 덮어써져서'], a: 2,
      why: '생성 코드는 .proto에서 매번 새로 만든다. 고칠 곳은 .proto이고, protoc를 다시 돌려 struct를 얻는다.' },
  ];

  R.page({ title: 'gRPC 통신', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
