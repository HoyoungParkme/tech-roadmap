/* III-1-2 Idempotent Producer + Transactions — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 공통 부품 ──
  const STY = {
    ok: { stroke: INK }, dup: { stroke: WARN, fill: WARNBG, color: WARN }, lost: { stroke: BAD, color: BAD, dash: '5 4' },
    pend: { stroke: MUT, color: MUT, dash: '5 4' }, good: { stroke: GOOD, fill: GOODBG, color: GOOD }, acc: { stroke: ACC, fill: ACCBG, color: ACC },
    bad: { stroke: BAD, fill: BADBG, color: BAD }, info: { stroke: INFO, fill: INFOBG, color: INFO },
  };
  // 파티션 로그: 오프셋이 붙은 append-only 칸. items [{ t, st, s }]
  function plog(x, y, items, o) { o = o || {}; const w = o.w || 64, h = o.h || 40, g = 4, n = o.slots || items.length;
    if (o.label) tx(x - 12, y + h / 2 + 5, o.label, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, class: 'mono', fill: o.lcol || INK });
    for (let i = 0; i < n; i++) el('rect', { x: x + i * (w + g), y, width: w, height: h, rx: 5, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    items.forEach((it, i) => { const s = it.s ?? 1; if (s <= 0 || !it.t) return; const st = STY[it.st || 'ok'], cx = x + i * (w + g) + w / 2;
      card(cx, y + h / 2, w, h, { rx: 5, text: it.t, fs: o.fs || 14, mono: true, stroke: st.stroke, fill: st.fill, color: st.color, dash: st.dash, s: Math.min(s, 1.15) });
      if (it.x) el('line', { x1: cx - w / 2 + 6, y1: y + h / 2, x2: cx + w / 2 - 6, y2: y + h / 2, stroke: BAD, 'stroke-width': 2.2, opacity: clamp(s) }); });
    if (o.offsets !== false) for (let i = 0; i < n; i++) mono(x + i * (w + g) + w / 2, y + h + 17, String((o.off0 || 0) + i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    return { cx: (i) => x + i * (w + g) + w / 2, edge: (i) => x + i * (w + g) - g / 2, w, h, y }; }
  const chip = (cx, cy, t, st, s, fs) => { const S = STY[st || 'ok']; fs = fs || 13.5; return card(cx, cy, tw(t, fs) + 20, fs + 14, { rx: 7, text: t, fs, mono: true, stroke: S.stroke, fill: S.fill || PANEL, color: S.color, dash: S.dash, s, sw: 1.8 }); };
  const strip = (s) => String(s || '').replace(/^[^\s가-힣A-Za-z0-9"]+\s*/, '');
  function box(cx, cy, title, subt, o) { o = o || {}; const g = card(cx, cy, o.w || 150, 70, { rx: 10, sw: 2.5, stroke: o.stroke || INK, s: o.s, op: o.op });
    tx(0, -6, title, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.stroke || INK }, g); if (subt) tx(0, 16, subt, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // 설정 표: 앞 beat 에 없던 줄은 튀어나온다
  function cfgPanel(x, y, w, c, o) { o = o || {}; const cur = c.beat.producerCfg || {}, prv = (c.prev && c.prev.producerCfg) || {}, keys = Object.keys(cur), rh = 30;
    zone(x, y, w, 40 + keys.length * rh, o.title || 'producer_config', { fill: PANEL, stroke: GRID, sw: 1.5 });
    keys.forEach((kk, i) => { const fresh = !(kk in prv) || prv[kk] !== cur[kk], s = fresh ? pop(c.u, 0.2 + i * 0.15) : 1, yy = y + 52 + i * rh;
      if (fresh) el('rect', { x: x + 6, y: yy - 19, width: w - 12, height: rh - 4, rx: 5, fill: ACCBG, opacity: clamp(s) });
      mono(x + 14, yy, kk, { 'font-size': 14, 'font-weight': 700, fill: fresh ? ACC : INK, opacity: clamp(s) });
      mono(x + w - 14, yy, String(cur[kk]), { 'font-size': 14, 'text-anchor': 'end', opacity: clamp(s) }); });
    return y + 40 + keys.length * rh; }

  // 1. enable.idempotence=true
  function s1(t, c) { const { k, u } = c;
    cfgPanel(40, 60, 380, c);
    const on = k >= 1, lx = 560, ly = 150;
    tx(lx + 134, ly - 22, 'Broker · orders 파티션', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    pill(230, 300, on ? '중복 차단 ON' : '중복 차단 OFF', on ? GOOD : BAD, k === 1 ? pop(u, 0.6) : 1, { fs: 15 });
    if (k === 0) { plog(lx, ly, [{ t: 'm1' }, { t: 'm1', st: 'lost', s: pop(u, 0.8) }], { slots: 4 });
      sub(lx + 134, ly + 84, 'retry가 나면 같은 주문이 두 칸에 쌓인다', fade(u, 1), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { ['acks=all', 'retries=MAX', 'in.flight ≤ 5'].forEach((s, i) => { const cx = 520 + i * 150, sc = pop(u, 0.4 + i * 0.3);
        grow(230, 250, cx, 330, seg(u, 0.2 + i * 0.3, 0.5 + i * 0.3), ACC, { plain: true, sw: 1.8 });
        pill(cx, 350, s, ACC, sc, { mono: true, fs: 14 }); });
      sub(670, 390, 'idempotence가 켜지면 자동으로 강제된다', fade(u, 1.5), { fill: ACC, 'font-weight': 700 });
      plog(lx, ly, [], { slots: 4 }); return; }
    const L = plog(lx, ly, k >= 3 ? [{ t: 'm1', st: 'good', s: k === 3 ? pop(u, 1.3) : 1 }] : [], { slots: 4 });
    box(lx - 90, 300, 'Producer', 'PID 73', { w: 140 });
    if (k === 3) { fly(lx - 20, 270, L.cx(0), ly + 20, seg(u, 0.3, 1.3), '(PID 73, seq 0)', { mono: true }); }
    if (k >= 3) mono(L.cx(0), ly + 82, 'seq 0', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
    if (k === 4) { const f = seg(u, 0.3, 1.2); if (f > 0 && f < 1) chip(lerp(lx - 20, L.cx(1) - 10, f), lerp(270, ly + 20, f), 'retry (73, seq 0)', 'dup', 1);
      cross(L.cx(1), ly + 20, 12, pop(u, 1.2)); grow(L.cx(1), ly + 50, lx - 30, 278, seg(u, 1.5, 2.1), GOOD);
      sub(L.cx(2) + 30, ly + 110, 'seq 0은 이미 있음 → 저장 없이 ack만', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 }); } }

  // 2. PID + sequence
  function s2(t, c) { const { k, u } = c, b = c.beat, pl = b.pipeline;
    const PX = 110, PY = 200, bx = 430;
    box(PX, PY, 'Producer', k >= 5 ? '재시작' : '', { stroke: k >= 5 ? BAD : INK });
    if (k >= 0) { const s = k === 0 ? pop(u, 1.6) : 1; if (k < 5 || u < 0.6) card(PX, PY - 62, 96, 30, { rx: 15, text: 'PID 73', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: k === 5 ? 1 - E(u, 0.2, 0.6) : s });
      if (k === 5) card(PX, PY - 62, 110, 30, { rx: 15, text: '새 PID', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.7) }); }
    tx(bx + 134, 72, 'Broker · orders (파티션 3개)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    const p0 = []; if (k >= 2) p0.push({ t: 'm1', st: 'good', s: k === 2 ? pop(u, 1.8) : 1 }); if (k >= 4) p0.push({ t: 'm3', st: 'good', s: k === 4 ? pop(u, 2.0) : 1 });
    const L0 = plog(bx, 96, p0, { slots: 4, label: 'p0' }); plog(bx, 166, [], { slots: 4, label: 'p1' }); plog(bx, 236, [], { slots: 4, label: 'p2' });
    if (k >= 2) p0.forEach((_, i) => mono(L0.cx(i), 92, 'seq ' + i, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: k === 2 || (k === 4 && i === 1) ? fade(u, 2) : 1 }));
    if (k === 0) { grow(PX + 76, PY - 10, bx - 40, 140, seg(u, 0.2, 0.8), MUT); sub(250, 140, 'InitProducerId', fade(u, 0.3), { class: 'mono', 'font-weight': 700, fill: INK });
      fly(bx - 40, 160, PX, PY - 62, seg(u, 0.9, 1.6), 'PID = 73', { mono: true }); sub(PX, PY + 62, '64bit 번호를 Broker가 준다', fade(u, 1.8)); }
    if (k === 1) { [['transactional.id 있음', 'PID 73 그대로', GOOD], ['transactional.id 없음', '새 PID가 올 수 있다', BAD]].forEach(([a, r, col], i) => { const y = 300 + i * 50, s = pop(u, 0.3 + i * 0.6);
        card(PX + 70, y, 260, 40, { rx: 8, stroke: col, sw: 1.8, s }); tx(PX - 52, y + 5, a, { 'font-size': 14, 'font-weight': 700, opacity: clamp(s) }); tx(PX + 190, y + 5, r, { 'font-size': 13.5, fill: col, 'font-weight': 700, 'text-anchor': 'end', opacity: clamp(s) }); }); }
    if (k === 2) { chip(PX, PY + 70, 'key "A1"', 'ok', pop(u, 0.2), 14); grow(PX + 50, PY + 70, 260, PY + 70, seg(u, 0.4, 0.7), MUT);
      card(310, PY + 70, 100, 40, { rx: 8, text: 'murmur2', fs: 14, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.6) });
      grow(310, PY + 48, bx - 30, 120, seg(u, 0.9, 1.4), INFO); sub(310, PY + 110, '% 3 = p0', fade(u, 1.1), { class: 'mono', 'font-weight': 800, fill: INFO });
      sub(PX, PY + 130, 'Java 기본 파티셔너 기준', fade(u, 1.3)); }
    // Broker 가 기억하는 last_seq
    if (k >= 3) { const tx0 = 740, s = k === 3 ? pop(u, 0.3) : 1;
      zone(tx0, 96, 200, 120, 'Broker 기억', { fill: PANEL, stroke: GRID, sw: 1.5, op: clamp(s) });
      mono(tx0 + 14, 148, '(PID 73, p0)', { 'font-size': 14, 'font-weight': 700, opacity: clamp(s), fill: k >= 5 ? OFF : INK });
      const last = k >= 4 ? Math.round(tween(0, 1, seg(u, 1.6, 2.4) || (k > 4 ? 1 : 0))) : 0;
      mono(tx0 + 14, 182, 'last_seq = ' + last, { 'font-size': 16, 'font-weight': 800, fill: k >= 5 ? OFF : ACC, opacity: clamp(s) });
      if (k >= 5) { cross(tx0 + 100, 160, 14, pop(u, 1)); sub(tx0 + 100, 240, '새 PID 와는 이어지지 않는다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); } }
    if (k === 4) { const rows = [['m2 (73, seq 0)', '≤ last → ack만', 'dup', BAD], ['m3 A2 (73, seq 1)', '= last+1 → 저장', 'good', GOOD], ['(73, seq 3)', '≥ last+2 → 에러', 'pend', MUT]];
      rows.forEach(([a, r, st, col], i) => { const y = 320 + i * 34, s = pop(u, 0.2 + i * 0.5); chip(330, y, a, st, s, 14);
        tx(450, y + 5, r, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.5) }); });
      sub(PX, PY + 70, 'A2도 murmur2 → p0', fade(u, 1.2), { fill: INFO, 'font-weight': 700 });
      dot([[290, 354], [bx - 20, 120], [L0.cx(1), 116]], seg(u, 1.2, 2.0), GOOD, 6); }
    if (k === 5) tx(560, 340, '보장 범위 = 같은 PID + 같은 파티션', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.6) }); }

  // 3. transactional.id
  function s3(t, c) { const { k, u } = c, cfg = c.beat.producerCfg || {};
    const PX = 160, PY = 170, CXo = 740;
    box(PX, PY, 'Producer', k >= 3 ? 'PID 73' : '', { w: 170 });
    const tag = k === 0 ? E(u, 0.2, 1.0) : 1;
    card(lerp(PX, PX, tag), lerp(60, PY - 58, tag), 190, 30, { rx: 6, text: 'order-producer-1', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG });
    if (k === 0) sub(PX, PY + 62, '사람이 정한 고정 이름', fade(u, 1.1), { 'font-weight': 700 });
    server(CXo, PY - 10, 'Transaction Coordinator');
    if (k >= 1) { clock(CXo + 130, PY - 10, 26, k === 1 ? E(u, 0.3, 2.4) : 0, WARN, '60s'); if (k === 1) sub(CXo + 30, PY + 96, '이 안에 commit이 없으면 abort', fade(u, 0.8), { fill: WARN, 'font-weight': 700 }); }
    if (k >= 2) ['idempotence', 'acks=all', 'in.flight ≤ 5'].forEach((s, i) => pill(PX - 70 + i * 120, PY + 74, s, MUT, k === 2 ? pop(u, 0.3 + i * 0.3) : 1, { mono: true, fs: 13.5 }));
    if (k === 2) sub(PX + 50, PY + 112, '적지 않아도 자동으로 켜진다', fade(u, 1.4), { fill: MUT, 'font-weight': 700 });
    // 좀비: 같은 ID 로 떠 있던 옛 Producer
    if (k >= 3) { const zx = 400, zy = 330, fenced = k === 3 ? pop(u, 1.4) : 1;
      box(zx, zy, '옛 Producer', 'epoch 0', { w: 150, stroke: fenced > 0.5 ? OFF : INK });
      cross(zx + 60, zy - 26, 12, fenced);
      const steps = ['ID 등록', 'epoch 0 → 1 (좀비 차단)', 'PID 73 확인', '남은 tx abort'];
      steps.forEach((s, i) => { const y = 280 + i * 30, sc = k === 3 ? pop(u, 0.3 + i * 0.4) : 1; check(620, y - 5, 7, sc); tx(636, y, s, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(sc) }); });
      grow(PX + 90, PY + 10, CXo - 70, PY + 10, k === 3 ? seg(u, 0.1, 0.5) : 1, ACC); sub((PX + CXo) / 2, PY - 2, 'init_transactions()', 1, { class: 'mono', fill: ACC, 'font-weight': 700 }); }
    if (k === 4) { zone(CXo - 120, 54, 290, 58, '', { fill: GOODBG, stroke: GOOD });
      mono(CXo + 25, 90, 'order-producer-1 → PID 73 · epoch 1', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.2) });
      const f = seg(u, 0.6, 1.6); if (f > 0 && f < 1) chip(lerp(470, 560, f), lerp(300, 236, f), 'write (epoch 0)', 'dup', 1);
      cross(560, 236, 12, pop(u, 1.6)); sub(560, 270, 'ProducerFenced', fade(u, 1.7), { class: 'mono', fill: BAD, 'font-weight': 800 });
      pill(PX, 60, 'READY', GOOD, pop(u, 2), { mono: true, fs: 14 }); } }

  // 4. begin → send ×3 → commit / abort
  function s4(t, c) { const { k, u } = c, b = c.beat, pl = b.pipeline, phase = (b.txnState && b.txnState.phase) || 'ready';
    const PX = 110, PY = 200, x0 = 470, topics = [['orders', 110], ['payments', 190], ['inventory', 270]];
    box(PX, PY, 'Producer', phase === 'committed' ? 'COMMITTED' : (b.producerCfg.phase || '').replace('_', ' '), { stroke: phase === 'aborted' ? BAD : phase === 'committed' ? GOOD : INK, w: 170 });
    const find = (name) => pl.find((x) => x.key && x.key.startsWith(name));
    const open = k >= 1 && k <= 4, done = k >= 5, aborted = phase === 'aborted';
    if (k >= 1) { const s = k === 1 ? E(u, 0.2, 0.8) : 1, col = aborted ? BAD : done ? GOOD : WARN;
      el('path', { d: `M${x0 - 120},${70 + 300 * (1 - s) / 2} h-10 v${300 * s} h10`, fill: 'none', stroke: col, 'stroke-width': 2.5 });
      tx(x0 - 136, 400, aborted ? 'ABORTED' : done ? 'COMMITTED' : 'IN_TRANSACTION', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: col, opacity: s }); }
    topics.forEach(([name, y], i) => {
      const m = find(name), has = !!m, appear = has && k === 2 + i ? pop(u, 1.1) : has ? 1 : 0;
      const items = []; if (has) items.push({ t: 'A1', st: done ? (aborted ? 'bad' : 'good') : 'pend', s: appear, x: aborted && pop(u, 0.6) > 0.5 });
      if (done) items.push({ t: aborted ? 'ABORT' : 'COMMIT', st: aborted ? 'bad' : 'acc', s: pop(u, 0.3 + i * 0.25) });
      plog(x0, y, items, { slots: 3, w: 84, label: name, fs: 13.5 });
      if (has && k === 2 + i) fly(PX + 90, PY, x0 + 42, y + 20, seg(u, 0.2, 1.1), 'A1', { mono: true }); });
    if (k === 0) { pill(PX, PY + 70, 'init_transactions() 완료', GOOD, pop(u, 0.3), { fs: 13.5 }); sub(x0 + 120, 380, '아직 묶음이 열리지 않았다', fade(u, 0.8)); }
    if (k === 1) sub(x0 + 120, 380, 'begin_transaction() — 이후 send는 한 묶음', fade(u, 0.8), { fill: WARN, 'font-weight': 700 });
    if (k === 4) { clock(PX, PY + 90, 22, E(u, 0.8, 2.6), BAD, 'timeout'); sub(PX, PY + 146, '지금 죽으면 3건 모두 abort', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); }
    // read_committed 컨슈머가 보는 건수
    const seen = done && !aborted ? Math.round(tween(0, 3, seg(u, 0.8, 1.6))) : 0;
    box(850, 200, 'Consumer', 'read_committed', { w: 160 });
    mono(850, 262, '보이는 건수 ' + seen, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: seen ? GOOD : MUT });
    if (k >= 2 && k <= 4) sub(850, 290, 'pending은 보이지 않는다', 1, { fill: MUT }); }

  // 5. read_committed — LSO 까지만 읽는다
  function s5(t, c) { const { k, u } = c, b = c.beat, cc = b.consumerCfg || {}, rc = cc['isolation.level'] === 'read_committed';
    const x0 = 140, y0 = 120;
    tx(x0 + 190, 92, 'orders 파티션', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    const L = plog(x0, y0, [{ t: 'r1', st: 'good' }, { t: 'COMMIT', st: 'acc' }, { t: 'r2', st: 'pend' }, { t: 'r3', st: rc ? 'bad' : 'ok', x: rc }, { t: 'ABORT', st: 'bad' }], { w: 76, fs: 13.5 });
    tx(L.cx(2), y0 - 10, '진행 중 tx', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
    tx(L.cx(3) + 40, y0 - 10, 'abort 된 tx', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, 'font-weight': 700 });
    const CXc = 820, CYc = 140;
    box(CXc, CYc, 'Consumer', rc ? 'read_committed' : 'read_uncommitted', { w: 180, stroke: rc ? GOOD : BAD });
    const tgt = rc ? [0] : [0, 2, 3];
    tgt.forEach((i, j) => grow(CXc - 92, CYc + 10, L.cx(i), y0 + 44, k <= 1 ? seg(u, 0.3 + j * 0.3, 0.8 + j * 0.3) : 1, i === 0 ? GOOD : BAD, { sw: 2 }));
    if (!rc) sub(L.cx(3), y0 + 84, '유령 메시지', fade(u, 1.4), { fill: BAD, 'font-weight': 800 });
    if (rc) { const lx = L.edge(2); el('line', { x1: lx, y1: y0 - 26, x2: lx, y2: y0 + 66, stroke: INFO, 'stroke-width': 3, opacity: k === 1 ? fade(u, 0.3) : 1 });
      mono(lx, y0 + 84, 'LSO', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: k === 1 ? fade(u, 0.3) : 1 }); }
    if (k === 1) sub(L.cx(2) + 40, y0 + 112, 'LSO 너머는 commit이 끝날 때까지 내주지 않는다', fade(u, 1), { fill: INFO, 'font-weight': 700 });
    // 설정 표
    const keys = Object.keys(cc); keys.forEach((kk, i) => { const pv = (c.prev && c.prev.consumerCfg) || {}, fresh = pv[kk] !== cc[kk], s = fresh ? pop(u, 0.3) : 1;
      mono(40, 280 + i * 28, kk + ' = ' + cc[kk], { 'font-size': 14.5, 'font-weight': fresh ? 800 : 600, fill: fresh ? ACC : INK, opacity: clamp(s) }); });
    if (k === 2) { cross(560, 300, 12, pop(u, 0.6)); clock(560, 300, 24, 0.7, OFF); sub(560, 346, '자동 commit 끔 → 처리 뒤에 직접', fade(u, 1), { fill: WARN, 'font-weight': 700 }); }
    if (k === 3) { el('path', { d: `M${CXc + 100},${CYc - 10} a26,26 0 1 1 0,40`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'marker-end': 'url(#ra-ahb)', opacity: fade(u, 0.2) });
      mono(CXc + 40, CYc + 64, 'poll(1.0)', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      dot([[L.cx(0), y0 + 44], [CXc - 92, CYc + 10]], seg(u, 0.6, 1.6), GOOD, 7); }
    if (k === 4) { zone(560, 250, 380, 100, '여기까지 오는 메시지', { fill: GOODBG, stroke: GOOD });
      ['commit_transaction() 된 메시지', '트랜잭션 없이 보낸 일반 메시지'].forEach((s, i) => { check(586, 296 + i * 28, 7, pop(u, 0.4 + i * 0.4)); tx(602, 301 + i * 28, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }); }); }
    if (k === 5) { const mx = lerp(L.edge(0), L.edge(1), E(u, 0.2, 1)); el('path', { d: `M${mx},${y0 + 62} l-8,14 h16 z`, fill: INFO });
      sub(mx, y0 + 96, 'committed', 1, { fill: INFO, 'font-weight': 700 });
      const f = (b.eosBox && b.eosBox.features) || []; zone(560, 236, 390, 176, 'EOS가 되려면 함께', { fill: PANEL, stroke: GRID, sw: 1.5 });
      f.slice(0, 4).forEach((s, i) => { const y = 280 + i * 32; check(580, y - 5, 7, pop(u, 0.6 + i * 0.3)); tx(596, y, s.replace(/^(Producer|Consumer): /, '$1 · ').split(' (')[0].slice(0, 40), { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.3) }); }); } }

  const quiz = [
    { q: 'enable.idempotence가 켜진 프로듀서가 ack을 못 받고 같은 메시지를 다시 보냈다. Broker는 어떻게 하나?',
      o: ['같은 메시지를 한 칸 더 쌓는다', 'seq 0을 이미 받았으니 저장 없이 ack만 돌려준다', '프로듀서에 에러를 보내 재전송을 멈춘다'], a: 1,
      why: 'Broker는 (PID, seq)로 같은 메시지를 알아본다. 이미 받은 seq면 append 없이 ack만 보낸다.' },
    { q: 'PID 73이 키 A1(seq 0)을 p0에 보낸 뒤, 키 A2도 murmur2 결과 p0에 떨어졌다. A2의 seq는 무엇인가?',
      o: ['0', '2', '1'], a: 2,
      why: 'seq는 키가 아니라 (PID, 파티션)마다 센다. 같은 p0의 다음 메시지라 seq 1이다.' },
    { q: 'init_transactions()가 같은 transactional.id로 떠 있던 옛 Producer를 막는 방법은 무엇인가?',
      o: ['epoch를 1 올려 옛 epoch의 쓰기를 거절한다', '옛 Producer 프로세스를 강제로 종료한다', '옛 PID를 지우고 새 PID를 준다'], a: 0,
      why: 'Coordinator는 같은 PID에 epoch를 올려 준다. epoch 0으로 오는 쓰기는 ProducerFenced로 막힌다.' },
    { q: '3개 토픽에 send를 마친 뒤 commit_transaction() 전에 프로세스가 죽었다. 결과는 무엇인가?',
      o: ['보낸 3건이 그대로 보인다', 'orders만 보이고 나머지는 사라진다', 'timeout 뒤 3건 모두 abort된다'], a: 2,
      why: '트랜잭션은 전부 아니면 전무다. transaction.timeout.ms(60000) 안에 commit이 없으면 Coordinator가 abort한다.' },
    { q: 'read_committed 컨슈머가 진행 중 트랜잭션의 r2를 만나면 어떻게 하나?',
      o: ['LSO에서 멈추고 commit이 끝날 때까지 r2부터는 내주지 않는다', 'r2만 건너뛰고 r3를 먼저 읽는다', 'r2를 읽고 나중에 취소 신호를 받는다'], a: 0,
      why: 'read_committed는 LSO(아직 안 끝난 첫 트랜잭션 위치)까지만 읽는다. abort된 r3는 끝내 보이지 않는다.' },
  ];

  const summary = [
    'ack을 못 받은 프로듀서가 다시 보내면 예전에는 같은 메시지가 두 번 쌓였다.',
    'idempotent 프로듀서는 메시지마다 (PID, seq)를 붙이고 Broker가 파티션별 마지막 seq로 중복을 거른다.',
    'transactional.id는 재시작해도 같은 PID를 받게 하고, epoch를 올려 옛 Producer를 막는다.',
    'commit 전까지 3개 토픽의 쓰기는 보이지 않고, read_committed 컨슈머는 LSO까지만 읽는다.',
  ];
  const review = [
    { q: 'enable.idempotence만 켠 서비스가 재배포 직후 같은 주문을 한 번 더 썼다. 먼저 의심할 것은?',
      o: ['재시작으로 PID가 바뀌어 이전 seq 기록과 이어지지 않았다', 'acks가 all이 아니었다', '파티션 수가 3개라 부족했다'], a: 0,
      why: 'idempotence의 보장은 같은 PID와 같은 파티션 안이다. 재시작 경계를 넘으려면 transactional.id가 필요하다.' },
    { q: '트랜잭션으로 주문 3건을 묶었는데 분석 컨슈머 대시보드에 abort된 주문이 잡힌다. 먼저 확인할 것은?',
      o: ['프로듀서의 transaction.timeout.ms', '컨슈머의 isolation.level 값', 'orders 토픽의 파티션 수'], a: 1,
      why: 'Java 클라이언트 기본값 read_uncommitted는 abort된 메시지까지 넘긴다. read_committed로 바꿔야 한다.' },
    { q: '같은 transactional.id로 두 인스턴스가 동시에 떴다. 어떤 일이 생기나?',
      o: ['두 인스턴스가 번갈아 같은 트랜잭션에 쓴다', '나중에 init한 쪽이 epoch를 올려 먼저 떠 있던 쪽은 fencing된다', 'Broker가 둘 다 거절한다'], a: 1,
      why: 'init_transactions()가 epoch를 올리면 옛 epoch로 오는 쓰기는 ProducerFenced로 막힌다. 그래서 ID는 인스턴스마다 달라야 한다.' },
  ];

  R.page({ title: 'Idempotence · 트랜잭션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
