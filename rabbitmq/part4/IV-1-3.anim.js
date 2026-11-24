/* IV-1-3 Streams (로그 기반) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * append-only 로그 칸과 소비자 커서를 그린다. 로그·커서 위치는 beat 의 log · consumers · highlightOffsets 에서 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    person, cross, check, clock, dbIcon, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const CCOL = { sky: INFO, green: GOOD, amber: WARN };
  // ---------- 로그 칸 ----------
  const LX = 130, LW = 118, LG = 8, LY = 100;
  const lx = (o) => LX + o * (LW + LG) + LW / 2;
  function logCell(o, e, st) { st = st || {}; const s = st.s ?? 1; if (s <= 0) return; const x = lx(o), gone = st.gone, hot = st.hot;
    card(x, st.y ?? LY, LW, 70, { rx: 8, fill: gone ? 'none' : hot ? ACCBG : PANEL, stroke: gone ? OFF : hot ? ACC : INK, sw: hot ? 2.6 : 2, dash: gone ? '5 5' : null, s: 0.7 + 0.3 * s, op: (st.op ?? 1) * s });
    const y = st.y ?? LY, op = (st.op ?? 1) * s * (gone ? 0.45 : 1);
    mono(x, y - 10, String(e.offset), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: gone ? OFF : hot ? ACC : INK, opacity: op });
    mono(x, y + 12, e.key, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op });
    mono(x, y + 28, e.body, { 'font-size': 13.5, 'text-anchor': 'middle', fill: gone ? OFF : INK, opacity: op });
    if (gone) el('line', { x1: x - LW / 2 + 10, y1: y - 26, x2: x + LW / 2 - 10, y2: y + 26, stroke: BAD, 'stroke-width': 2.5, opacity: s }); }
  function log(c, o) { o = o || {}; const b = c.beat, hi = new Set(b.highlightOffsets || []);
    b.log.forEach((e, i) => logCell(e.offset, e, { gone: e.evicted && !(o.revive), hot: o.noHot ? false : hi.has(e.offset), s: o.s ? o.s(i, e) : 1 }));
    if (o.arrow !== false) { const end = lx(b.log.length) - LW / 2 + 6; grow(end, LY, end + 34, LY, 1, MUT); } }
  // 커서: 로그 아래 삼각 + 이름표 (row 번째 줄)
  function cursor(off, name, col, row, o) { o = o || {}; const x = lx(off), y = 172 + row * 50, op = o.op ?? 1; if (op <= 0) return;
    el('path', { d: `M${x},${LY + 40} l-9,14 h18 z`, fill: col, opacity: op });
    el('line', { x1: x, y1: LY + 54, x2: x, y2: y - 12, stroke: col, 'stroke-width': 2, 'stroke-dasharray': '3 3', opacity: op });
    pill(x, y, `${name} · ${off}`, col, o.s ?? 1, { mono: true, fs: 13.5, op, fill: PANEL }); }
  const offOf = (c, name) => { const f = (s) => ((s && s.consumers) || []).find((x) => x.name === name); return [f(c.prev) ? f(c.prev).offset : null, f(c.beat) ? f(c.beat).offset : null]; };

  // ---------- 1. append-only 로그 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 1) { // 일반 큐라면: 두 소비자가 나눠 가져 ack → 삭제
      b.log.forEach((e, i) => logCell(e.offset, e, { gone: e.evicted && u > 1.6, hot: false }));
      person(lx(0), 250, '소비자 A', {}); person(lx(1), 250, '소비자 B', {});
      [0, 1].forEach((i) => { dot([[lx(i), LY + 36], [lx(i), 222]], seg(u, 0.3 + i * 0.3, 1.0 + i * 0.3), ACC, 7); pill(lx(i) + 70, 330, 'ack', GOOD, pop(u, 1.2 + i * 0.2), { mono: true, fs: 13.5 }); });
      note(lx(2) - 50, 250, 'ack 한 0 · 1은 사라져 다시 읽을 수 없다', fade(u, 1.8), { fill: BAD });
      note(lx(2) - 50, 286, '여러 소비자가 메시지를 나눠 가진다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 2) { log(c, { arrow: true });
      [['소비자 A', INFO, 0], ['소비자 B', GOOD, 1]].forEach(([n, col, r]) => { const v = E(u, 0.3 + r * 0.3, 2.2 + r * 0.2) * 3; cursor(Math.round(v), n, col, r, {}); });
      note(40, 320, '0 · 1도 그대로 남고, 두 소비자가 각자 전체를 읽는다', fade(u, 1.6), { fill: GOOD }); return; }
    if (k === 3) { log(c, { arrow: false });
      mono(LX - 40, LY + 10, '[', { 'font-size': 60, fill: MUT, opacity: fade(u, 0.2) }); mono(lx(3) + LW / 2 + 8, LY + 10, ']', { 'font-size': 60, fill: MUT, opacity: fade(u, 0.2) });
      [0, 1, 2, 3].forEach((i) => mono(lx(i), LY + 64, `LOG[${i}]`, { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.25) }));
      note(40, 260, 'offset이 곧 배열 인덱스다', fade(u, 1.6));
      note(40, 296, 'offset은 그 Stream 안에서만 의미가 있는 번호다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 4) { log(c, { s: (i) => (i === 4 ? pop(u, 0.9) : 1) });
      if (u < 0.9) fly(lx(4) + 120, LY - 70, lx(4), LY, seg(u, 0.1, 0.9), 'order_id=44', { mono: true });
      mono(lx(4), LY + 64, 'offset = len(LOG) = 4', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      const len = tween(4, 5, u); mono(40, 270, `len(LOG) ${Math.round(len)}`, { 'font-size': 20, 'font-weight': 800, fill: INK });
      note(40, 320, '중간에 끼우거나 지우는 연산이 없다 · 순서가 흔들리지 않는다', fade(u, 1.8), { fill: GOOD }); return; }
    if (k === 5) { log(c);
      [['이벤트 소싱', '전체 이력 보관'], ['대용량 fan-out', '여러 소비자가 같은 데이터'], ['재처리', 'offset 되감기']].forEach(([a, d], i) => { const x = 180 + i * 300, s = pop(u, 0.3 + i * 0.4);
        card(x, 300, 260, 70, { rx: 12, stroke: ACC, sw: 2, s }); tx(x, 296, a, { 'text-anchor': 'middle', 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) });
        tx(x, 320, d, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); });
      note(40, 395, '과거가 필요한 곳이 Stream의 자리다', fade(u, 2.0)); return; }
    // k0: 0..3 이 끝에 차례로 붙는다
    log(c, { s: (i) => pop(u, 0.2 + i * 0.35), noHot: true });
    [['일반 큐', '소비 = 삭제', BAD, 260], ['Stream', '소비 = 읽기 · 그대로 남음', GOOD, 660]].forEach(([a, d, col, x], i) => { const s = pop(u, 1.6 + i * 0.4);
      card(x, 300, 330, 70, { rx: 12, stroke: col, sw: 2.2, s }); tx(x, 294, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 1.7 + i * 0.4) });
      tx(x, 318, d, { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.7 + i * 0.4) }); }); }

  // ---------- 2. 선언과 retention ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { log(c, { noHot: true });
      const s = pop(u, 0.2); card(330, 300, 520, 110, { rx: 12, stroke: ACC, sw: 2.2, fill: ACCBG, s });
      mono(90, 274, '"x-queue-type": "stream"', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      mono(90, 306, '"x-max-age" / "x-max-length-bytes"', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      tx(90, 336, 'retention을 같이 정하지 않으면 디스크가 찬다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
      dbIcon(760, 300, '디스크', { s: pop(u, 1.6), stroke: WARN }); const f = E(u, 1.8, 2.8); el('rect', { x: 718, y: 326 - 50 * f, width: 84, height: 50 * f, fill: WARN, opacity: 0.35 }); return; }
    if (k === 1) { log(c, { s: (i) => fade(u, 0.1 + i * 0.12) });
      mono(LX - 70, LY - 50, 'orders.stream', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      pill(340, 260, 'durable=True', INK, pop(u, 0.8), { mono: true, fs: 14 }); pill(560, 260, 'x-queue-type: stream', ACC, pop(u, 1.1), { mono: true, fs: 14 });
      note(40, 330, 'Stream은 항상 durable · 메모리 전용 Stream은 없다', fade(u, 1.8)); return; }
    if (k === 2) { b.log.forEach((e, i) => logCell(e.offset, e, { gone: e.evicted && u > 1.6, hot: false }));
      clock(200, 300, 38, E(u, 0.3, 1.5), WARN, 'x-max-age 7D');
      el('rect', { x: 330, y: 280, width: 260, height: 26, rx: 5, fill: SOFT }); el('rect', { x: 330, y: 280, width: 260 * E(u, 0.5, 1.5), height: 26, rx: 5, fill: WARN, opacity: 0.8 });
      mono(460, 330, 'x-max-length-bytes 5GB', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      note(640, 300, '먼저 걸리는 쪽 때문에', fade(u, 1.5), { fill: BAD }); note(640, 330, '가장 오래된 쪽부터 잘린다', fade(u, 1.7), { fill: BAD }); return; }
    if (k === 3) { b.log.forEach((e) => logCell(e.offset, e, { gone: e.evicted, hot: false }));
      const segs = [[0, 0, '세그먼트 1'], [1, 3, '세그먼트 2'], [4, 4, '세그먼트 3 (쓰는 중)']];   // 배치는 예시
      segs.forEach(([a, z, n], i) => { const x0 = lx(a) - LW / 2 - 2, x1 = lx(z) + LW / 2 + 2, s = fade(u, 0.3 + i * 0.4), y = LY + 50;
        el('path', { d: `M${x0},${y} v10 H${x1} v-10`, fill: 'none', stroke: i === 0 ? BAD : INFO, 'stroke-width': 2.5, opacity: s });
        tx((x0 + x1) / 2, y + 30, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: i === 0 ? BAD : INFO, opacity: s }); });
      mono(40, 260, 'x-stream-max-segment-size-bytes = 100MB', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      note(40, 300, '삭제는 세그먼트 파일 통째로 일어난다 · 가장 오래된 offset = 1', fade(u, 1.6), { fill: MUT });
      note(40, 336, '기본값은 500MB · 예시는 100MB로 줄였다', fade(u, 2.1), { fill: MUT });
      tx(920, 404, '세그먼트 배치는 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); return; }
    if (k === 4) { log(c, { s: (i) => (i === 5 ? pop(u, 1.0) : 1) });
      if (u < 1.0) fly(lx(5), LY + 170, lx(5), LY, seg(u, 0.2, 1.0), 'order_id=45', { mono: true });
      mono(40, 300, 'basic_publish(routing_key="orders.stream", delivery_mode=2)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.1) });
      note(40, 340, '발행 코드는 일반 큐와 똑같다 · 달라지는 것은 소비 쪽', fade(u, 1.6), { fill: GOOD }); return; }
    // k5: 잘린 offset 은 못 읽는다
    log(c, { noHot: true });
    person(lx(0), 300, '재처리', {}); dot([[lx(0), 272], [lx(0), LY + 40]], seg(u, 0.3, 1.0), WARN, 7); cross(lx(0), LY + 50, 12, pop(u, 1.0));
    note(lx(1) - 40, 280, 'offset 0은 영영 읽을 수 없다', fade(u, 1.2), { fill: BAD });
    note(lx(1) - 40, 316, '보존 기간을 재처리 요구에 맞춘다', fade(u, 1.7));
    mono(lx(1) - 40, 356, 'x-max-age 단위: Y M D h m s', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) }); }

  // ---------- 3. offset 으로 시작점 고르기 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { server(760, 220, 'RabbitMQ 노드', {});
      [['AMQP 0-9-1', '5672', 160, MUT], ['Stream 프로토콜', '5552', 280, ACC]].forEach(([a, p, y, col], i) => { const g = E(u, 0.3 + i * 0.6, 1.0 + i * 0.6);
        el('line', { x1: 220, y1: y, x2: lerp(220, 700, g), y2: lerp(y, 220, g), stroke: col, 'stroke-width': i ? 4 : 2.5 });
        tx(60, y + 5, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.6) }); mono(440, y + (i ? 34 : -14), p, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.8 + i * 0.6) }); });
      note(40, 380, 'rstream은 전용 프로토콜(5552) · offset 제어와 성능이 낫다', fade(u, 2.0)); return; }
    log(c, { noHot: k === 3 || k === 5 });
    if (k === 1 || k === 2) { const [p0, p1] = offOf(c, 'analytics'), v = tween(p0, p1, u); cursor(Math.round(v), 'analytics', INFO, 0, {});
      if (k === 1) { mono(40, 300, 'message_context.offset → 0', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) }); note(40, 340, 'offset은 메시지와 함께 온다', fade(u, 1.5), { fill: MUT }); return; }
      card(720, 300, 300, 76, { rx: 12, stroke: GOOD, sw: 2.2, fill: GOODBG, s: pop(u, 1.0) });
      tx(720, 292, '서버에 저장된 위치', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) });
      mono(720, 318, 'analytics → 1', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(40, 300, 'store_offset(subscriber_name="analytics")', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      note(40, 340, '재접속하면 저장된 위치부터 이어 읽는다', fade(u, 1.8), { fill: GOOD }); return; }
    if (k === 3) { // 시작점 다섯 가지 (LAST 의 청크 경계와 TIMESTAMP 위치는 예시)
      const marks = [['FIRST', 0, INFO], ['OFFSET 2', 2, WARN], ['LAST', 4, MUT], ['NEXT', 5, GOOD]];
      marks.forEach(([n, o, col], i) => { const s = pop(u, 0.2 + i * 0.4), x = lx(o) - (o === 5 ? LW / 2 - 10 : 0);
        el('path', { d: `M${x},${LY - 42} l-9,-14 h18 z`, fill: col, opacity: s }); mono(x, LY - 62, n, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); });
      el('line', { x1: LX, y1: 220, x2: lx(4) + LW / 2, y2: 220, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 1.8) });
      el('path', { d: `M${lx(3) - 30},214 v12`, stroke: ACC, 'stroke-width': 3, opacity: fade(u, 2.0) }); mono(lx(3) - 30, 248, 'TIMESTAMP', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(LX, 248, '시각 →', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) });
      note(40, 320, 'LAST는 마지막 청크(메시지 묶음)부터 · NEXT는 지금 이후만', fade(u, 2.2), { fill: MUT });
      tx(920, 404, 'LAST·TIMESTAMP 위치는 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); return; }
    if (k === 4) { cursor(0, 'FIRST ← 선택', INFO, 0, { s: pop(u, 0.2) }); cursor(2, 'OFFSET 2 (주석)', WARN, 1, { op: 0.45 });
      mono(40, 340, 'spec = ConsumerOffsetSpecification(OffsetType.FIRST)', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      note(40, 376, 'TIMESTAMP는 밀리초 정수 · 장애 시각을 알 때 쓰기 좋다', fade(u, 1.6), { fill: MUT }); return; }
    // k5: 구독 — 각 시작점부터 메시지가 흘러온다
    (b.consumers || []).map((cs, r) => [cs, r]).reverse().forEach(([cs, r]) => { const col = CCOL[cs.color] || INFO; cursor(cs.offset, cs.name, col, r, {});
      if (cs.offset < 5) for (let m = 0; m < 2; m++) dot([[lx(cs.offset), LY + 36], [lx(cs.offset) + 60, 172 + r * 50]], ((t * 0.7 + m / 2 + r * 0.2) % 1), col, 5); });
    note(560, 360, '소비자마다 독립 커서', fade(u, 1.4), { fill: ACC }); }

  // ---------- 4. 독립 재생 ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { // 일반 큐 라운드로빈 vs Stream 전체 읽기 (5건, 소비자 3)
      const who = ['A', 'B', 'C'], col = [INFO, GOOD, WARN];
      tx(40, 70, '일반 큐: 나눠 가짐', { 'font-size': 16, 'font-weight': 800 });
      for (let i = 0; i < 5; i++) { const s = pop(u, 0.2 + i * 0.2); card(280 + i * 70, 64, 56, 40, { rx: 6, fill: col[i % 3], stroke: 'none', text: `${i}`, fs: 15, mono: true, fw: 800, color: PANEL, s });
        mono(280 + i * 70, 104, who[i % 3], { 'font-size': 14, 'font-weight': 800, fill: col[i % 3], 'text-anchor': 'middle', opacity: s }); }
      tx(40, 190, 'Stream: 각자 전부', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      who.forEach((w, r) => { mono(240, 170 + r * 50, w, { 'font-size': 15, 'font-weight': 800, fill: col[r], opacity: fade(u, 1.3) });
        for (let i = 0; i < 5; i++) card(280 + i * 70, 164 + r * 50, 56, 36, { rx: 6, fill: PANEL, stroke: col[r], sw: 2, text: `${i}`, fs: 14.5, mono: true, fw: 700, s: pop(u, 1.4 + r * 0.25 + i * 0.05) }); });
      note(640, 210, '소비자끼리 영향이 없다', fade(u, 2.2), { fill: ACC }); return; }
    log(c, { noHot: true, arrow: !(k === 3 || k === 5) });
    if (k === 1) { card(480, 300, 420, 64, { rx: 32, stroke: INK, sw: 2.5, s: pop(u, 0.2) });
      mono(480, 306, 'Environment · localhost:5552', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      ['analytics', 'live-feed', 'reprocess'].forEach((n, i) => { const x = 240 + i * 240; grow(x, 352, x, 334, 1, MUT, { plain: true }); pill(x, 372, n, [INFO, GOOD, WARN][i], pop(u, 0.9 + i * 0.3), { mono: true, fs: 13.5 }); });
      note(40, 230, '연결은 하나를 같이 쓰고 커서만 각자 갖는다', fade(u, 1.8), { fill: MUT }); return; }
    const cs = b.consumers || [];
    cs.map((x, r) => [x, r]).reverse().forEach(([x, r]) => { const col = CCOL[x.color] || INFO, [p0, p1] = offOf(c, x.name), isNew = p0 == null;
      const v = isNew ? x.offset : tween(p0, p1, u, 1.8); cursor(Math.round(v), x.name, col, r, { s: isNew ? pop(u, 0.3) : 1 }); });
    if (k === 3) { el('path', { d: `M${lx(0) - LW / 2},${LY - 46} v-8 H${lx(4) + LW / 2} v8`, fill: 'none', stroke: OFF, 'stroke-width': 2.5, opacity: fade(u, 0.8) });
      tx(lx(2), LY - 62, '과거 0~4는 건너뛴다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
      card(lx(5), LY, LW, 70, { rx: 8, fill: 'none', stroke: GOOD, dash: '5 5', text: '5 (다음)', fs: 15, mono: true, color: GOOD, s: pop(u, 0.5) }); }
    if (k === 5) card(lx(5), LY, LW, 70, { rx: 8, fill: 'none', stroke: GOOD, dash: '5 5', text: '5 (대기)', fs: 15, mono: true, color: GOOD });
    if (k === 2) note(560, 380, 'first() = 남아 있는 가장 오래된 offset', fade(u, 1.4), { fill: INFO });
    if (k === 4) note(560, 380, '되감아도 다른 소비자는 그대로', fade(u, 1.4), { fill: WARN });
    if (k === 5) note(560, 380, '로그는 그대로 · 새 소비자도 처음부터 재생 가능', fade(u, 2.0), { fill: GOOD }); }

  // ---------- 5. super stream ----------
  const PY = [90, 170, 250], PX = 300, PW = 96;
  function prow(p, cells, o) { o = o || {}; const y = PY[p];
    mono(40, y + 5, `orders.events-${p}`, { 'font-size': 15, 'font-weight': 700, opacity: o.op ?? 1 });
    cells.forEach((e, i) => card(PX + i * (PW + 8) + PW / 2, y, PW, 50, { rx: 8, fill: o.hot === e.offset ? ACCBG : PANEL, stroke: o.hot === e.offset ? ACC : INK, sw: 2,
      text: `${e.offset} · ${e.body.split(' · ')[0]}`, fs: 14, mono: true, fw: 700, s: o.s ? o.s(i) : 1, op: o.op })); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const parts = [0, 1, 2].map((p) => b.log.filter((e) => e.partition === p));
    if (k === 0) { // 키 해시로 파티션 나누기
      person(890, 170, '프로듀서', {}); card(720, 170, 120, 64, { rx: 10, stroke: INFO, sw: 2.5, fill: INFOBG, text: 'hash(키)\n% 3', fs: 15, mono: true, s: pop(u, 0.2) });
      b.log.forEach((e, i) => { const v = seg(u, 0.4 + i * 0.35, 0.9 + i * 0.35); if (v > 0 && v < 1) dot([[860, 170], [780, 170], [660, 170], [PX + (e.offset + 1) * (PW + 8) + 16, PY[e.partition]]], v, ACC, 7); });
      parts.forEach((cells, p) => prow(p, cells, { s: (i) => { const idx = b.log.indexOf(cells[i]); return pop(u, 0.9 + idx * 0.35); } }));
      note(40, 340, '같은 키는 같은 파티션 · 순서는 파티션 안에서만 보장', fade(u, 2.2)); tx(920, 404, '키 → 파티션 배정은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); return; }
    parts.forEach((cells, p) => prow(p, cells, { s: k === 1 ? () => pop(u, 0.3 + p * 0.3) : null, hot: k === 3 && p === 0 ? 1 : null }));
    const ws = (b.consumers || []);
    ws.forEach((w, i) => { const col = CCOL[w.color] || INFO, p = w.partition != null ? w.partition : i, pw = (c.prev && c.prev.consumers || []).find((x) => x.name === w.name);
      const off = pw ? tween(pw.offset, w.offset, u) : w.offset, x = PX + Math.round(off) * (PW + 8) + PW / 2;
      el('path', { d: `M${x},${PY[p] + 26} l-8,12 h16 z`, fill: col }); pill(800, PY[p], w.name, col, k === 1 ? pop(u, 1.2 + i * 0.2) : 1, { mono: true, fs: 13.5 }); });
    if (k === 1) { mono(40, 330, 'add_super_stream orders.events --partitions 3 --max-age 7D', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.1) });
      note(40, 370, '파티션 수는 나중에 늘리기 까다롭다 · 여유 있게', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 2) { [1240, 1187, 1203].forEach((n, p) => R.hbar(560, PY[p] - 8, 120, n, 1240, { u: E(u, 0.3 + p * 0.2, 1.3 + p * 0.2), h: 16, text: String(n), col: INFO }));
      note(40, 330, 'list_queues: 파티션마다 stream 하나씩', fade(u, 1.2)); note(40, 366, '크게 치우치면 라우팅 키 선택을 의심한다', fade(u, 1.8), { fill: MUT });
      tx(920, 404, '메시지 수는 코드 주석의 예시 출력', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); return; }
    if (k === 3) { [0, 1, 2].forEach((p) => pill(700, PY[p] - 30, 'max-age 7D', WARN, pop(u, 0.3 + p * 0.2), { mono: true, fs: 13.5 }));
      mono(40, 330, 'stream_status orders.events-0', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      note(40, 366, 'retention은 파티션마다 따로 걸린다', fade(u, 1.6), { fill: WARN }); return; }
    if (k === 4) { pill(560, PY[0] - 32, 'TIMESTAMP로 되감기', INFO, pop(u, 0.3), { mono: true, fs: 13.5 });
      [['1) 잘못 처리된 시각 확보', INK], ['2) TIMESTAMP로 재구독', INFO], ['3) 멱등 처리로 중복 견디기', GOOD], ['4) store_offset으로 위치 저장', INK]].forEach(([s, col], i) =>
        tx(40 + (i % 2) * 440, 330 + Math.floor(i / 2) * 36, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.6 + i * 0.35) })); return; }
    // k5: Kafka 와 견주기
    [['같은 점', ['append-only 로그', 'offset으로 재생'], GOOD, 250], ['RabbitMQ Stream', ['AMQP · Stream 프로토콜 둘 다', '기존 RabbitMQ에 로그 기능 추가'], ACC, 700]].forEach(([h, items, col, x], j) => {
      card(x, 360, 400, 90, { rx: 12, stroke: col, sw: 2, s: pop(u, 0.2 + j * 0.6) });
      tx(x - 180, 340, h, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + j * 0.6) });
      items.forEach((s, i) => tx(x - 180, 364 + i * 24, '· ' + s, { 'font-size': 14.5, opacity: fade(u, 0.4 + j * 0.6 + i * 0.2) })); }); }

  const quiz = [
    { q: '일반 큐와 Stream에서 ack한 offset 0·1은 각각 어떻게 되나?',
      o: ['둘 다 삭제된다', '둘 다 남는다', '큐에서는 사라지고 Stream에는 그대로 남는다'], a: 2,
      why: '일반 큐는 소비가 곧 삭제다. Stream은 append-only 로그라 소비해도 지우지 않아 몇 번이고 다시 읽을 수 있다.' },
    { q: 'x-max-age 7D와 x-max-length-bytes 5GB를 함께 건 Stream에서 잘리는 것은 무엇인가?',
      o: ['둘 중 먼저 걸리는 조건에 따라 가장 오래된 세그먼트', '가장 최근 메시지', '소비자가 읽은 메시지만'], a: 0,
      why: 'retention은 앞쪽(offset 낮은 쪽)부터 세그먼트 단위로 잘라 낸다. 잘린 offset은 다시 읽을 수 없다.' },
    { q: 'NEXT로 구독한 소비자가 받는 메시지는 무엇인가?',
      o: ['offset 0부터 전부', '구독 이후 새로 들어오는 메시지만', '마지막 청크부터'], a: 1,
      why: 'NEXT는 지금 이후만 본다. 마지막 청크부터는 LAST, 처음부터는 FIRST다.' },
    { q: 'reprocess 소비자가 offset 2로 되감으면 analytics 커서는 어떻게 되나?',
      o: ['함께 2로 돌아간다', '0으로 초기화된다', '아무 영향이 없다'], a: 2,
      why: 'Stream 소비자는 각자 커서를 갖는다. 한 소비자의 되감기는 다른 소비자에게 영향을 주지 않는다.' },
    { q: 'super stream에서 같은 사용자 이벤트의 순서를 지키려면 무엇을 해야 하나?',
      o: ['같은 사용자 키를 라우팅 키로 써서 같은 파티션에 보낸다', '파티션을 하나 더 만든다', 'max-age를 늘린다'], a: 0,
      why: '순서는 파티션 안에서만 보장된다. 같은 키는 해시로 같은 파티션에 가므로 그 키 안에서는 순서가 지켜진다.' },
  ];

  const summary = [
    '일반 큐는 ack하면 지우지만, Stream은 offset을 붙여 끝에 쌓기만 한다.',
    '로그가 디스크를 채우지 않게 x-max-age나 x-max-length-bytes로 오래된 세그먼트를 잘라 낸다.',
    '소비자는 FIRST, NEXT, OFFSET 같은 시작점을 고르고 store_offset으로 위치를 남긴다.',
    '여러 소비자가 같은 로그를 각자 읽고, super stream은 키 해시로 파티션을 나눠 확장한다.',
  ];
  const review = [
    { q: '버그 배포 뒤 3시간 동안 잘못 처리된 주문을 다시 돌리려 한다. 그런데 x-max-age가 1h였다. 무엇이 문제인가?',
      o: ['필요한 앞부분이 이미 잘려 다시 읽을 수 없다', 'TIMESTAMP 구독이 지원되지 않는다', 'store_offset이 덮어써졌다'], a: 0,
      why: '잘린 offset은 영영 읽을 수 없다. 보존 기간은 재처리에 필요한 기간보다 길게 잡는다.' },
    { q: '대시보드용 소비자를 붙였더니 과거 주문까지 처음부터 쏟아져 들어온다. 어떻게 고칠까?',
      o: ['큐 타입을 quorum으로 바꾼다', 'x-max-length-bytes를 줄인다', '시작점을 NEXT로 바꾼다'], a: 2,
      why: 'FIRST는 남아 있는 가장 오래된 offset부터 읽는다. 지금 이후만 필요하면 NEXT로 구독한다.' },
    { q: '재처리 소비자를 TIMESTAMP로 되감아 돌렸더니 같은 결제가 두 번 기록됐다. 먼저 손볼 곳은?',
      o: ['파티션 수', '처리 로직을 멱등으로 만들기', 'Stream 프로토콜 포트'], a: 1,
      why: '되감으면 같은 이벤트를 다시 읽는다. 재처리는 같은 이벤트를 두 번 받아도 결과가 같도록 멱등이어야 한다.' },
  ];

  R.page({ title: 'Stream 로그와 offset', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
