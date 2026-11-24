/* III-1-1 메시지 전달 보장 (at-most / at-least / exactly-once) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 공통 부품: 파티션 로그(오프셋이 붙은 append-only 칸) ──
  const STY = {
    ok: { stroke: INK }, dup: { stroke: WARN, fill: WARNBG, color: WARN }, lost: { stroke: BAD, color: BAD, dash: '5 4' },
    pend: { stroke: MUT, color: MUT, dash: '5 4' }, good: { stroke: GOOD, fill: GOODBG, color: GOOD }, acc: { stroke: ACC, fill: ACCBG, color: ACC },
    bad: { stroke: BAD, fill: BADBG, color: BAD },
  };
  // items: [{ t, st, s }] — s 는 나타나는 정도(0→1). 빈 칸(slots)은 점선
  function plog(x, y, items, o) { o = o || {}; const w = o.w || 64, h = o.h || 40, g = 4, n = o.slots || items.length;
    if (o.label) tx(x - 12, y + h / 2 + 5, o.label, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, class: 'mono', fill: o.lcol || INK });
    for (let i = 0; i < n; i++) el('rect', { x: x + i * (w + g), y, width: w, height: h, rx: 5, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    items.forEach((it, i) => { const s = it.s ?? 1; if (s <= 0) return; const st = STY[it.st || 'ok'], cx = x + i * (w + g) + w / 2;
      card(cx, y + h / 2, w, h, { rx: 5, text: it.t, fs: o.fs || 14, mono: true, stroke: st.stroke, fill: st.fill, color: st.color, dash: st.dash, s: Math.min(s, 1.15) });
      if (o.offsets !== false) mono(cx, y + h + 17, String((o.off0 || 0) + i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) }); });
    return { cx: (i) => x + i * (w + g) + w / 2, w, h, y }; }
  const chip = (cx, cy, t, st, s, fs) => { const S = STY[st || 'ok']; fs = fs || 13.5; return card(cx, cy, tw(t, fs) + 20, fs + 14, { rx: 7, text: t, fs, mono: true, stroke: S.stroke, fill: S.fill || PANEL, color: S.color, dash: S.dash, s, sw: 1.8 }); };
  const short = (m) => String(m).replace(/^msg-/, 'm').replace(' (재시도)', "'").replace(' (중복!)', "'");
  const strip = (s) => String(s || '').replace(/^[^\s가-힣A-Za-z0-9"]+\s*/, '');
  function actorBox(c, y) { const a = strip(c.beat.actor); if (a) tx(480, y || 32, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT }); }
  function prodBox(cx, cy, o) { o = o || {}; const g = card(cx, cy, 150, 70, { rx: 10, sw: 2.5, stroke: o.stroke || INK });
    tx(0, -6, 'Producer', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }, g); tx(0, 16, o.sub || '', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  function consBox(cx, cy, o) { o = o || {}; const g = card(cx, cy, 150, 70, { rx: 10, sw: 2.5, stroke: o.stroke || INK });
    tx(0, -6, 'Consumer', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }, g); tx(0, 16, o.sub || '', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // 보냄 / 브로커 / 처리 / 손실 / 중복 계기판 — 앞 beat 값에서 이어진다
  function counts(c, y, extra) { const b = c.beat, p = c.prev || {};
    const n = (o, k) => (o && o[k] ? o[k].length : 0);
    const br = tween(n(p.broker, 'received'), n(b.broker, 'received'), c.u), pr = tween(n(p.consumer, 'processed'), n(b.consumer, 'processed'), c.u);
    const lo = n(b.consumer, 'lost'), du = b.consumer && b.consumer.processed ? b.consumer.processed.filter((x) => /중복/.test(x)).length : 0;
    meters(110, y, 740, [
      { name: '보낸 메시지', val: '5' },
      { name: '브로커 기록', val: String(Math.round(br)) },
      { name: '컨슈머 처리', val: String(Math.round(pr)) },
      { name: '손실', val: String(lo), hot: lo > 0 },
      { name: extra || '중복 처리', val: String(du), hot: du > 0 },
    ]); }

  const PX = 110, PY = 150, LX = 300, CX = 860;

  // 1. At-most-once: acks=0, 보내고 잊는다
  function s1(t, c) { const { k, u } = c, b = c.beat;
    actorBox(c);
    if (k === 3) {   // 쓸 곳과 쓰면 안 되는 곳
      const good = b.timeline.filter((x) => x.state === 'amo'), bad = b.timeline.filter((x) => x.state === 'lost');
      zone(70, 70, 400, 300, '손실을 감수해도 되는 곳', { fill: GOODBG, color: GOOD });
      zone(490, 70, 400, 300, '절대 쓰면 안 되는 곳', { fill: BADBG, color: BAD });
      good.forEach((x, i) => { const [a, r] = x.label.split(' — '), y = 130 + i * 78, s = pop(u, 0.2 + i * 0.3);
        check(104, y, 10, s); tx(126, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) });
        tx(126, y + 30, r || '', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); });
      bad.forEach((x, i) => { const [a, r] = x.label.split(' — '), y = 130 + i * 78, s = pop(u, 1.2 + i * 0.3);
        cross(524, y, 9, s); tx(546, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.3 + i * 0.3) });
        tx(546, y + 30, (r || '').replace(/\s*→\s*금지$/, ''), { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4 + i * 0.3) }); });
      tx(480, 400, 'acks=0은 빠른 대신 손실을 받아들이는 설정이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2) });
      return; }
    prodBox(PX, PY, { sub: 'fire-and-forget' });
    pill(PX, PY + 62, 'acks=0', ACC, k === 0 ? pop(u, 0.3) : 1, { mono: true });
    pill(PX, PY + 98, 'retries=0', ACC, k === 0 ? pop(u, 0.7) : 1, { mono: true });
    tx(LX + 170, 92, 'Broker · metrics 파티션', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    const got = b.broker.received, L = plog(LX, PY - 20, got.map((m, i) => ({ t: short(m), s: k === 1 ? pop(u, 0.45 + (i >= 2 ? i + 1 : i) * 0.38) : 1 })), { slots: 5 });
    // ack 이 돌아오지 않는다
    el('line', { x1: LX - 10, y1: PY + 40, x2: PX + 80, y2: PY + 40, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, k === 0 ? 1.2 : 0) });
    cross(212, PY + 40, 8, k === 0 ? pop(u, 1.4) : 1); sub(212, PY + 70, 'ack 없음', k === 0 ? fade(u, 1.5) : 1, { 'font-weight': 700, fill: BAD });
    if (k === 1) { ['msg-1', 'msg-2', 'msg-3', 'msg-4', 'msg-5'].forEach((m, i) => { const a = 0.1 + i * 0.38;
        if (m === 'msg-3') { const f = seg(u, a, a + 0.5); if (f > 0 && f < 1) chip(lerp(PX + 80, 240, f), PY - 30 + f * f * 60, 'm3', 'lost', 1); }
        else fly(PX + 80, PY - 30, L.cx(i > 2 ? i - 1 : i), PY - 30, seg(u, a, a + 0.4), short(m), { mono: true }); });
      cross(250, PY - 30, 10, pop(u, 0.9)); sub(250, PY - 52, '네트워크 끊김', fade(u, 1), { fill: BAD, 'font-weight': 700 }); }
    if (k >= 1) { chip(250, 268, 'msg-3 유실', 'lost', k === 1 ? pop(u, 1.6) : 1, 14); }
    if (k >= 2) { consBox(CX, PY, { sub: '받은 것만 처리' });
      if (k === 2) for (let i = 0; i < 4; i++) dot([[L.cx(i), PY + 20], [L.cx(3) + 60, PY], [CX - 76, PY]], seg(u, 0.2 + i * 0.3, 1.0 + i * 0.3), ACC, 6);
      pill(570, 256, 'for i in range(1000): produce()', INK, k === 2 ? pop(u, 1.2) : 1, { mono: true, fs: 13.5 });
      sub(570, 290, '응답을 안 기다려 루프가 막히지 않는다', k === 2 ? fade(u, 1.5) : 1); }
    counts(c, 312); }

  // 2. At-least-once: acks=all + 재시도 → 손실 0, 중복 가능
  function replicas(u, mode) {   // mode 'all' | 'one'
    const rows = [['리더', 96], ['팔로워 1', 166], ['팔로워 2', 236]], x0 = 400;
    zone(300, 70, 330, 220, '', { fill: SOFT });
    el('rect', { x: 306, y: 82, width: 318, height: 202, rx: 10, fill: 'none', stroke: mode === 'all' ? ACC : OFF, 'stroke-width': 1.8, 'stroke-dasharray': '6 5' });
    tx(618, 104, 'ISR', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: mode === 'all' ? ACC : MUT });
    const dead = mode === 'one' ? seg(u, 1.5, 1.8) : 0;
    rows.forEach(([n, y], i) => { const has = i === 0 ? seg(u, 0.6, 0.9) : mode === 'all' ? seg(u, 1.0 + i * 0.25, 1.3 + i * 0.25) : 0;
      tx(x0 - 14, y + 26, n, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: i === 0 && dead ? BAD : INK });
      plog(x0, y, has > 0 && !(i === 0 && dead >= 1) ? [{ t: 'm1', s: has, st: i === 0 ? 'acc' : 'ok' }] : [], { slots: 3, w: 60, h: 40, offsets: false });
      if (i > 0 && mode === 'all') dot([[x0 + 30, 136], [x0 + 30, y + 20]], seg(u, 0.9 + i * 0.25, 1.25 + i * 0.25), ACC, 5); });
    fly(PX + 80, PY - 20, x0 + 30, 116, seg(u, 0.15, 0.6), 'm1', { mono: true });
    const ackAt = mode === 'all' ? 1.7 : 0.95;
    grow(x0 - 110, 262, PX + 60, PY + 40, seg(u, ackAt, ackAt + 0.5), GOOD, { sw: 2.4 });
    pill(215, 300, mode === 'all' ? 'ISR 3/3 기록 → ack' : '리더 1대 기록 → ack', GOOD, pop(u, ackAt + 0.4), { fs: 13.5 });
    if (mode === 'one') { cross(x0 - 60, 116, 12, pop(u, 1.6)); sub(x0 + 100, 312, '리더 다운 → 팔로워 1이 새 리더, m1 없음', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); }
    else sub(x0 + 70, 312, '세 복제본이 다 받은 뒤에야 ack', fade(u, 2), { fill: ACC, 'font-weight': 700 }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    actorBox(c);
    prodBox(PX, PY, { sub: k <= 1 ? 'ack을 기다린다' : '재시도 포함' });
    pill(PX, PY + 62, k === 1 ? 'acks=1' : 'acks=all', k === 1 ? WARN : ACC, k === 0 ? pop(u, 0.3) : 1, { mono: true });
    pill(PX, PY + 98, 'retries=∞', ACC, k === 0 ? pop(u, 0.5) : 1, { mono: true });
    if (k === 0) { replicas(u, 'all'); return; }
    if (k === 1) { replicas(u, 'one'); tx(800, 150, 'acks=1', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono', fill: WARN, opacity: fade(u, 0.2) });
      sub(800, 178, '리더만 받으면 ack', fade(u, 0.3)); tx(800, 230, 'acks=all', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 2.1) });
      sub(800, 258, 'ISR 전원이 받아야 ack', fade(u, 2.2)); return; }
    const got = b.broker.received, x0 = 290;
    tx(x0 + 220, 92, 'Broker · orders 파티션', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    const L = plog(x0, PY - 20, got.map((m, i) => ({ t: short(m), st: /재시도/.test(m) ? 'dup' : 'ok', s: k === 2 ? pop(u, 0.2 + i * 0.32) : 1 })), { slots: 7, w: 58 });
    if (k === 2) { [1, 4].forEach((i, j) => { const a = 0.2 + i * 0.32 + 0.1;
        grow(L.cx(i), PY - 32, PX + 80, PY - 32, seg(u, a, a + 0.25), OFF, { plain: true, sw: 2 });
        cross(lerp(L.cx(i), PX + 80, 0.5), PY - 32, 8, pop(u, a + 0.25)); });
      sub(180, PY + 140, 'ack 유실 → 같은 메시지를 다시 보냄', fade(u, 1.2), { fill: WARN, 'font-weight': 700 }); }
    if (k >= 3) { consBox(CX, PY - 60, { sub: k === 4 ? '멱등 처리' : '처리 후 commit' });
      const ptr = k === 3 ? E(u, 0.2, 2.2) * 7 : 7;
      if (k === 3) { const i = Math.min(6, Math.floor(ptr)); dot([[L.cx(i), PY - 20], [CX - 76, PY - 60]], (ptr % 1), got[i] && /재시도/.test(got[i]) ? WARN : ACC, 6); }
      const mx = x0 + ptr * 62 - 2; if (k === 3) { el('path', { d: `M${mx},${PY + 44} l-8,14 h16 z`, fill: INFO });
      sub(mx, PY + 78, 'committed', 1, { fill: INFO, 'font-weight': 700 }); }
      if (k === 3) sub(480, PY + 104, 'commit 전에 죽으면 이 위치부터 다시 읽는다 → 중복', fade(u, 1.6), { fill: WARN, 'font-weight': 700 }); }
    if (k === 4) {   // DB: order_id 가 PK
      const tx0 = 620, ty = 196; zone(tx0, ty, 300, 136, 'orders 테이블 (PK = order_id)', { fill: PANEL, stroke: GRID, sw: 1.5 });
      ['msg-1', 'msg-2', 'msg-3', 'msg-4', 'msg-5'].forEach((m, i) => { const s = pop(u, 0.2 + i * 0.3);
        card(tx0 + 32 + i * 58, ty + 62, 50, 36, { rx: 5, text: short(m), fs: 14, mono: true, stroke: GOOD, fill: GOODBG, color: GOOD, s }); });
      [[2, 1], [5, 3]].forEach(([i, slot], j) => { const a = 1.0 + j * 0.6, f = seg(u, a, a + 0.6);
        if (f > 0) { const cx = lerp(L.cx(i), tx0 + 32 + slot * 58, Math.min(f, 0.85)), cy = lerp(PY, ty + 62, Math.min(f, 0.85)) - Math.sin(f * Math.PI) * 20;
          if (f < 1) chip(cx, cy, short(got[i]), 'dup', 1); }
        cross(tx0 + 32 + slot * 58, ty + 96, 7, pop(u, a + 0.55)); });
      sub(tx0 + 150, ty + 124, 'ON CONFLICT DO NOTHING', fade(u, 2.2), { fill: WARN, 'font-weight': 700, class: 'mono' }); }
    counts(c, 342); }

  // 3. 같은 5건, 두 결과
  function s3(t, c) { const { k, u } = c, b = c.beat, rows = b.compare.rows, val = (m, side) => (rows.find((r) => r.metric === m) || {})[side];
    actorBox(c);
    const lanes = [['At-most-once', 112, ['msg-1', 'msg-2', 'msg-4', 'msg-5'], 'amo', [2]], ['At-least-once', 242, ['msg-1', 'msg-2', 'msg-2 (재시도)', 'msg-3', 'msg-4', 'msg-4 (재시도)', 'msg-5'], 'alo', []]];
    lanes.forEach(([name, y, out, side, holes], li) => {
      tx(36, y - 34, name, { 'font-size': 16, 'font-weight': 800, fill: li ? ACC : WARN });
      chip(90, y + 20, '5건', 'ok', 1, 14);
      grow(124, y + 20, 186, y + 20, k === 0 ? seg(u, 0.2 + li * 0.5, 0.6 + li * 0.5) : 1, MUT);
      const items = out.map((m, i) => ({ t: short(m), st: k >= 1 && /재시도/.test(m) ? 'dup' : 'ok', s: k === 0 ? pop(u, 0.5 + li * 0.5 + i * 0.12) : 1 }));
      if (side === 'amo' && k >= 1) items.splice(2, 0, { t: 'm3', st: 'lost', s: k === 1 ? pop(u, 0.3) : 1 });
      plog(200, y, items, { slots: 7, w: 56, offsets: false });
      const tot = val('컨슈머 도착 (총)', side), uni = val('컨슈머 도착 (고유)', side);
      mono(640, y + 18, '총 ' + tot, { 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 1.3 + li * 0.4) : 1 });
      mono(640, y + 42, '고유 ' + uni, { 'font-size': 15, fill: MUT, opacity: k === 0 ? fade(u, 1.5 + li * 0.4) : 1 });
      if (k >= 1) { const lo = val('손실', side), du = val('중복', side), bad = side === 'amo' ? lo : du;
        pill(820, y + 20, side === 'amo' ? '손실 ' + bad : '중복 ' + bad, side === 'amo' ? BAD : WARN, k === 1 ? pop(u, 0.6 + li * 0.5) : 1, { fs: 13.5 }); }
      if (k === 2) { const q = val(li ? '처리량' : '처리량', side).replace(/[^\s가-힣()a-z]/g, '').trim();
        if (side === 'amo') for (let i = 0; i < 6; i++) dot([[124, y - 6], [600, y - 6]], ((t * 0.9 + i / 6) % 1), WARN, 4);
        else for (let i = 0; i < 2; i++) { const f = ((t * 0.35 + i / 2) % 1); dot([[124, y - 6], [600, y - 6], [124, y - 6]], f, ACC, 4); }
        sub(370, y - 14, q, fade(u, 0.3 + li * 0.4), { fill: li ? ACC : WARN, 'font-weight': 700 });
        mono(640, y + 66, '부담: ' + val('컨슈머 추가 부담', side), { 'font-size': 14, fill: li ? BAD : MUT, 'font-weight': 700, opacity: fade(u, 1 + li * 0.4) }); }
    });
    if (k === 1) tx(480, 368, '손실은 되돌릴 수 없고, 중복은 멱등 키로 흡수할 수 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    if (k === 3) { el('rect', { x: 20, y: 300, width: 920, height: 112, rx: 10, fill: PANEL, opacity: 0.96 });
      b.timeline.slice(0, 3).forEach((x, i) => { const [a, r] = x.label.split(' — '), col = [WARN, ACC, GOOD][i], cx = 175 + i * 305, s = pop(u, 0.2 + i * 0.35);
        card(cx, 340, 286, 50, { rx: 10, stroke: col, sw: 2.2, s }); tx(cx, 336, x.id + ' · ' + a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.35) });
        tx(cx, 356, (r || '').slice(0, 22), { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.35) }); });
      tx(480, 400, 'acks=all만으로는 exactly-once가 아니다. 그것은 at-least-once다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); } }

  // 4. Exactly-once: idempotent + 트랜잭션 + read_committed
  function s4(t, c) { const { k, u } = c, b = c.beat, feats = (b.eosBox && b.eosBox.features) || [], pf = (c.prev && c.prev.eosBox && c.prev.eosBox.features.length) || 0;
    actorBox(c);
    prodBox(PX, 130, { sub: 'tx.id = tx-1' });
    const x0 = 290, y0 = 100, n = b.broker.received.length, committed = k === 4;
    tx(x0 + 222, y0 + 112, 'processed-payments 파티션', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    const items = b.broker.received.map((m, i) => ({ t: short(m), st: committed ? 'good' : 'pend', s: k === 2 && i >= 2 ? pop(u, 0.4 + (i - 2) * 0.3) : 1 }));
    if (committed) items.push({ t: 'COMMIT', st: 'acc', s: pop(u, 0.3) });
    const L = plog(x0, y0, items, { slots: 6, w: 70, fs: 13.5 });
    if (k === 0) { ['seq 0', 'seq 1'].forEach((s, i) => mono(L.cx(i), y0 + 78, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 0.3) }));
      const f = seg(u, 0.8, 1.8); if (f > 0 && f < 1) chip(lerp(PX + 80, L.cx(2) + 14, f), y0 - 26, 'm2 재전송', 'dup', 1);
      cross(L.cx(2) + 14, y0 - 26, 10, pop(u, 1.8)); tx(L.cx(2) + 36, y0 - 20, 'PID·seq가 같아 거절', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    // 트랜잭션 괄호
    if (k >= 2) { const s = k === 2 ? E(u, 0.1, 0.6) : 1; el('path', { d: `M${x0 - 6},${y0 - 14} v-10 h${(5 * 74 - 2) * s} v10`, fill: 'none', stroke: committed ? GOOD : WARN, 'stroke-width': 2.2 });
      tx(x0 + 184, y0 - 30, committed ? 'commit_transaction() — 한꺼번에 노출' : 'begin_transaction() … 아직 커밋 전', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: committed ? GOOD : WARN, opacity: s }); }
    // LSO: read_committed 컨슈머가 읽을 수 있는 끝
    if (k >= 1) { const lx = committed ? lerp(x0 - 2, x0 + 6 * 74 - 2, E(u, 0.6, 1.4)) : x0 - 2;
      el('line', { x1: lx, y1: y0 - 6, x2: lx, y2: y0 + 66, stroke: INFO, 'stroke-width': 3, opacity: k === 1 ? fade(u, 0.3) : 1 });
      mono(lx, y0 + 84, 'LSO', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.3) : 1 }); }
    // offset 도 같은 트랜잭션에
    if (k >= 3) { const f = k === 3 ? seg(u, 0.3, 1.4) : 1; const cx = lerp(PX, 845, E(f, 0, 1)), cy = lerp(200, 120, E(f, 0, 1));
      if (k === 3) chip(PX + 20, 200, 'raw-payments offset+1', 'ok', pop(u, 0.1), 13.5);
      card(cx, cy, 150, 34, { rx: 8, text: 'offset commit', fs: 13.5, mono: true, stroke: INFO, fill: INFOBG, color: INFO, s: k === 3 ? pop(u, 0.4) : 1 });
      if (k === 3) sub(845, 162, 'produce와 같은 묶음', fade(u, 1.5), { fill: INFO, 'font-weight': 700 }); }
    // read_committed 컨슈머
    consBox(CX, 300, { sub: 'read_committed' });
    const seen = committed ? Math.round(tween(0, b.consumer.processed.length, u)) : 0;
    mono(CX, 362, '보이는 메시지 ' + seen + '건', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: seen ? GOOD : MUT });
    if (committed) sub(CX, 386, '실패하면 abort → 5건 모두 취소', fade(u, 1.8), { fill: BAD, 'font-weight': 700 });
    // EOS 기둥: 지금까지 켠 것
    tx(40, 236, 'EOS를 이루는 것', { 'font-size': 15, 'font-weight': 800 });
    feats.slice(0, 4).forEach((f, i) => { const y = 262 + i * 36, on = i < pf ? 1 : pop(u, 0.4 + (i - pf) * 0.3), name = f.split(' — ')[0];
      check(52, y - 5, 8, on); tx(70, y, name, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(on) }); }); }

  // 5. 도메인별 선택
  function s5(t, c) { const { k, u } = c, b = c.beat, rows = b.chooseBox.rows, pr = (c.prev && c.prev.chooseBox) ? c.prev.chooseBox.rows.length : 0;
    const B = [['At-most-once', 170, WARN, 'acks=0'], ['At-least-once + 멱등', 480, ACC, 'acks=all + 멱등 키'], ['Exactly-once', 790, GOOD, 'idempotent + tx']];
    tx(480, 32, strip(b.actor), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    B.forEach(([name, cx, col, cfg]) => { zone(cx - 145, 210, 290, 196, '', { fill: SOFT, stroke: col, sw: 2 });
      tx(cx, 236, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col }); mono(cx, 258, cfg, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    rows.forEach((r, i) => { const bi = B.findIndex((x) => x[0] === r.level), [, cx, col] = B[bi], j = rows.filter((x, q) => q < i && x.level === r.level).length, y = 296 + j * 56;
      const s = i < pr ? 1 : pop(u, 0.2 + (i - pr) * 0.45);
      card(cx, y, 270, 46, { rx: 8, stroke: col, sw: 1.8, s }); tx(cx, y - 3, r.domain.length > 18 ? r.domain.slice(0, 18) + '…' : r.domain, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s) });
      tx(cx, y + 16, r.why.length > 20 ? r.why.slice(0, 20) + '…' : r.why, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); });
    if (k < 3) { b.timeline.slice(0, 3).forEach((x, i) => { const col = { amo: WARN, alo: ACC, eos: GOOD }[x.state] || OFF, y = 76 + i * 44, on = x.state !== 'note';
        card(480, y, 520, 36, { rx: 18, stroke: col, sw: on ? 2.2 : 1.5, dash: on ? null : '5 4', text: x.label, fs: 15, color: on ? INK : MUT, s: on && c.prev && c.prev.timeline[i].state === 'note' ? pop(u, 0.3) : 1 }); });
      return; }
    // 결정 트리: 질문 두 개
    card(300, 84, 300, 46, { rx: 23, stroke: INK, sw: 2, text: '1건 손실 비용이 큰가?', fs: 15, s: pop(u, 0.2) });
    card(640, 150, 300, 46, { rx: 23, stroke: INK, sw: 2, text: '1건 중복 비용이 큰가?', fs: 15, s: pop(u, 0.8) });
    grow(220, 108, 170, 208, seg(u, 0.4, 0.8), WARN); sub(176, 156, 'NO', fade(u, 0.6), { fill: WARN, 'font-weight': 800 });
    grow(420, 96, 530, 140, seg(u, 0.5, 0.9), MUT); sub(486, 108, 'YES', fade(u, 0.7), { fill: MUT, 'font-weight': 800 });
    grow(560, 172, 500, 208, seg(u, 1.1, 1.5), ACC); sub(510, 186, 'NO', fade(u, 1.3), { fill: ACC, 'font-weight': 800 });
    grow(720, 172, 780, 208, seg(u, 1.3, 1.7), GOOD); sub(770, 186, 'YES', fade(u, 1.5), { fill: GOOD, 'font-weight': 800 });
    pill(820, 70, '의심되면 at-least-once + 멱등', ACC, pop(u, 2), { fs: 14 }); }

  const quiz = [
    { q: 'acks=0, retries=0 프로듀서에서 msg-3이 네트워크에서 사라졌다. 결과는 무엇인가?',
      o: ['프로듀서가 알아채고 다시 보낸다', '아무도 모른 채 msg-3만 빠진다', '브로커가 빈 칸을 남겨 컨슈머가 기다린다'], a: 1,
      why: 'acks=0이면 성공 여부를 알 길이 없고 재전송도 없다. 컨슈머는 도착한 4건만 처리한다.' },
    { q: 'acks=all과 무한 재시도를 켰는데 브로커에 msg-2가 두 번 쌓였다. 왜인가?',
      o: ['메시지는 저장됐지만 ack이 유실돼 프로듀서가 다시 보냈다', 'ISR 팔로워가 메시지를 한 번 더 복사했다', '컨슈머가 commit을 두 번 했다'], a: 0,
      why: '프로듀서는 ack이 안 오면 실패로 보고 재전송한다. 실제로는 저장된 뒤라 7건이 쌓인다.' },
    { q: '같은 5건을 흘렸을 때 at-least-once 쪽 컨슈머 도착 총 건수와 고유 건수는 무엇인가?',
      o: ['총 7, 고유 5', '총 5, 고유 5', '총 4, 고유 4'], a: 0,
      why: 'msg-2와 msg-4가 두 번씩 와서 총 7건이지만 서로 다른 메시지는 5개다. 손실은 0이다.' },
    { q: 'exactly-once에서 컨슈머 offset을 send_offsets_to_transaction으로 묶는 이유는 무엇인가?',
      o: ['offset 커밋을 더 빨리 하려고', 'read_committed를 켜지 않아도 되게 하려고', '결과 produce와 offset 커밋이 함께 성공하거나 함께 취소되게 하려고'], a: 2,
      why: 'offset을 따로 커밋하면 결과는 썼는데 offset은 안 밀린 틈이 생긴다. 한 트랜잭션에 넣으면 그 틈이 없다.' },
    { q: '결정 트리에서 1건 손실은 비싸지만 중복은 멱등 키로 막을 수 있는 주문 이벤트는 어디로 가는가?',
      o: ['At-most-once', 'Exactly-once', 'At-least-once + 멱등'], a: 2,
      why: '손실 비용이 크면 YES, 중복 비용이 감당되면 NO로 내려가 at-least-once + 멱등이 된다.' },
  ];

  const summary = [
    'acks=0은 ack도 재전송도 없어서 빠르지만, 네트워크에서 사라진 메시지는 아무도 모른다.',
    'acks=all과 재시도를 켜면 손실은 없지만 ack이 유실된 메시지가 다시 와서 중복이 생긴다.',
    '같은 5건에서 at-most-once는 4건, at-least-once는 7건(고유 5건)이 컨슈머에 닿았다.',
    'exactly-once는 idempotent 프로듀서, 트랜잭션, read_committed를 함께 켜야 성립한다.',
  ];
  const review = [
    { q: '주문 이벤트를 acks=all로 바꿨더니 손실은 사라졌지만 같은 주문이 가끔 두 번 처리된다. 먼저 손볼 곳은?',
      o: ['acks를 0으로 되돌린다', '컨슈머 쪽에 order_id 기준 멱등 처리를 넣는다', 'retries를 더 크게 늘린다'], a: 1,
      why: 'at-least-once의 중복은 정상 동작이다. order_id를 PK로 두고 ON CONFLICT DO NOTHING을 쓰면 DB에는 한 번만 남는다.' },
    { q: 'EOS 트랜잭션을 켰는데 다운스트림 컨슈머가 abort된 결제 메시지를 처리했다. 먼저 의심할 것은?',
      o: ['컨슈머 isolation.level이 read_committed가 아니다', '프로듀서 acks가 all이 아니다', '파티션 수가 너무 적다'], a: 0,
      why: '트랜잭션은 프로듀서만으로 끝나지 않는다. read_uncommitted 컨슈머는 커밋 전이나 abort된 메시지까지 본다.' },
    { q: 'CPU 메트릭 수집 토픽에 exactly-once를 쓰자는 제안이 나왔다. 가장 알맞은 판단은?',
      o: ['몇 건 빠져도 결론이 같으니 at-most-once로 처리량을 챙긴다', '메트릭도 돈이니 exactly-once가 맞다', 'at-least-once에 멱등 키를 붙여 반드시 중복을 없앤다'], a: 0,
      why: '손실 비용이 낮은 데이터에 트랜잭션 비용을 낼 이유가 없다. 결정 트리의 첫 질문에서 NO로 끝난다.' },
  ];

  R.page({ title: '메시지 전달 보장 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
