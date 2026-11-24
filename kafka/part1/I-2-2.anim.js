/* I-2-2 Kafka 설치 + 첫 메시지 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 터미널 줄은 STEPS 의 terminal(설명용 출력 예시), 토픽·로그·읽은 표시는 broker.topics · broker.messages 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  function curve(d, u, col, o) { o = o || {}; if (u <= 0) return; const p = el('path', { d, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 100, opacity: o.op ?? 1 });
    p.setAttribute('stroke-dasharray', u >= 1 ? (o.dash || 'none') : `${u * 100} 100`); }

  // 터미널: 앞 beat 와 같은 앞부분은 그대로, 새 줄만 타이핑. 폭에 맞게 줄임
  const KCOL = { cmd: PANEL, log: 'var(--term)', ok: GOOD, hint: OFF };
  function term(c, x, y, w, h, o) { o = o || {}; const L = c.beat.terminal || [], P = (c.prev && c.prev.terminal) || [];
    let same = 0; while (same < L.length && same < P.length && L[same].text === P[same].text) same++;
    const fit = (s) => fitW(s, w - 30, 13.5);
    const lines = L.map((l) => [fit(l.text), KCOL[l.kind] || 'var(--term)']), shown = same + (L.length - same) * E(c.u, 0.2, o.d || 2.2);
    terminal(x, y, w, h, lines, shown, { title: o.title || 'terminal', fs: 13.5, lh: 20 });
    tx(x + w - 12, y + 20, '출력 예시', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'end' }); }
  // 로그 칸 (partition 0)
  const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  // 글자 폭(한글은 글자 크기, 영문은 0.6배)으로 잘라 칸에 맞춘다
  function fitW(s, w, fs) { if (tw(s, fs) <= w) return s; let t = s; while (t.length > 1 && tw(t + '…', fs) > w) t = t.slice(0, -1); return t + '…'; }
  function plog(x, y, msgs, o) { o = o || {}; const w = o.w || 92, g = 6, n = o.slots || 6;
    for (let i = 0; i < n; i++) { const m = msgs[i], cx = x + i * (w + g);
      if (!m) { el('rect', { x: cx, y, width: w, height: 38, rx: 5, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4' }); }
      else { const s = o.s ? o.s(i) : 1; if (s > 0) card(cx + w / 2, y + 19, w, 38, { rx: 5, s, stroke: m.from ? INFO : ACC, fill: m.from ? INFOBG : ACCBG, sw: 2, text: fitW(m.value, (w - 14) / 1.15, 13.5), fs: 13.5, mono: true }); }
      mono(cx + w / 2, y + 56, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    return (i) => x + i * (w + g) + w / 2; }
  const TX = 520, TW = 424;   // 오른쪽 터미널

  // ================= 1. docker compose =================
  function s1(t, c) { const { k, u } = c;
    zone(20, 40, 480, 360, '내 PC (호스트)', { fill: PANEL, stroke: GRID });
    const net = k === 0 ? E(u, 0.2, 1.2) : 1; el('rect', { x: 50, y: 80, width: 420 * net, height: 210, rx: 12, fill: SOFT, stroke: MUT, 'stroke-width': 1.6, 'stroke-dasharray': '6 5' });
    if (net > 0.9) tx(64, 102, 'kafka-net (bridge)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono' });
    const zk = k >= 1, kf = k >= 2;
    card(150, 180, 160, 80, { rx: 10, stroke: zk ? INK : OFF, dash: zk ? null : '5 4', s: k === 1 ? pop(u, 0.3) : k === 0 ? fade(u, 1.0) : 1 });
    tx(150, 176, 'zookeeper', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: zk ? INK : MUT, opacity: k === 0 ? fade(u, 1.2) : 1 }); mono(150, 198, ':2181', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.2) : 1 });
    card(370, 180, 160, 80, { rx: 10, stroke: kf ? ACC : OFF, dash: kf ? null : '5 4', sw: 2.4, s: k === 2 ? pop(u, 0.9) : k === 0 ? fade(u, 1.4) : 1 });
    tx(370, 176, 'kafka', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: kf ? ACC : MUT, opacity: k === 0 ? fade(u, 1.4) : 1 }); mono(370, 198, 'broker 1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.4) : 1 });
    if (k >= 1) { grow(150, 220, 150, 300, k === 1 ? seg(u, 0.8, 1.3) : 1, MUT); pill(150, 330, '2181:2181', MUT, k === 1 ? pop(u, 1.3) : 1, { mono: true, fs: 13.5 }); }
    if (k >= 2) { grow(290, 180, 232, 180, k === 2 ? seg(u, 0.3, 0.8) : 1, MUT); if (k === 2) tx(260, 166, 'depends_on', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.6) });
      grow(370, 220, 370, 300, k === 2 ? seg(u, 1.4, 1.9) : 1, ACC); pill(370, 330, '9092:9092', ACC, k === 2 ? pop(u, 1.9) : 1, { mono: true, fs: 13.5 }); }
    if (k === 2) tx(260, 380, '기동 순서만 보장한다 (준비 완료는 기다리지 않음)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
    if (k === 3) { card(150, 255, 150, 36, { rx: 8, text: '다른 컨테이너', fs: 14, stroke: INFO, s: pop(u, 0.3) });
      curve('M225,255 C300,255 330,240 352,222', seg(u, 0.6, 1.2), INFO); mono(300, 280, 'kafka:29092', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0), 'text-anchor': 'middle' });
      card(150, 372, 150, 36, { rx: 8, text: '내 PC의 앱', fs: 14, stroke: ACC, s: pop(u, 1.2) });
      curve('M225,372 C300,372 330,345 370,345', seg(u, 1.5, 2.1), ACC); mono(420, 380, 'localhost:9092', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.9), 'text-anchor': 'middle' }); }
    if (k === 4) { [0, 1, 2].forEach((i) => { const on = i === 0; card(300 + i * 62, 255, 52, 30, { rx: 6, text: on ? 'b1' : '?', fs: 13.5, stroke: on ? ACC : OFF, dash: on ? null : '4 4', color: on ? ACC : MUT, s: pop(u, 0.3 + i * 0.2) }); if (!on) cross(300 + i * 62, 255, 7, pop(u, 1.0 + i * 0.2)); });
      tx(80, 260, '내부 토픽 복제본', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(260, 380, 'REPLICATION_FACTOR: 1', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    term(c, TX, 40, TW, 360, { title: 'docker compose' }); }

  // ================= 2. topic 생성 =================
  function brokerBox(c, x, y, o) { o = o || {}; card(x, y, 440, 230, { rx: 12, stroke: ACC, sw: 2.2, fill: PANEL });
    tx(x - 205, y - 92, 'kafka · broker 1', { 'font-size': 15, 'font-weight': 800, fill: ACC }); }
  function s2(t, c) { const { k, u } = c, tp = c.beat.broker.topics;
    brokerBox(c, 260, 220);
    if (k === 0) { pill(140, 60, 'BROKER="localhost:9092"', MUT, pop(u, 0.3), { mono: true, fs: 13.5 }); pill(380, 60, 'TOPIC="hello"', MUT, pop(u, 0.6), { mono: true, fs: 13.5 });
      tx(260, 225, '토픽 없음', { 'font-size': 16, 'font-weight': 700, fill: OFF, 'text-anchor': 'middle' });
      tx(260, 260, '변수만 정했다 · 아직 요청 없음', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k >= 1 && tp.length) { const s = k === 1 ? pop(u, 0.4) : 1; zone(70, 150, 380, 120, 'topic hello', { fill: ACCBG, op: s > 0.5 ? 1 : 0 });
      if (s > 0.5) { tx(90, 200, 'partition 0', { 'font-size': 14, 'font-weight': 700 }); for (let i = 0; i < 5; i++) el('rect', { x: 200 + i * 48, y: 184, width: 42, height: 30, rx: 4, fill: 'none', stroke: ACC, 'stroke-dasharray': '4 4' });
        tx(90, 250, '로그는 아직 비어 있다', { 'font-size': 13.5, fill: MUT }); } }
    if (k === 1) pill(260, 60, '--partitions 1 --replication-factor 1', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
    if (k === 2) { card(260, 310, 300, 40, { rx: 8, dash: '5 4', stroke: OFF, text: '__consumer_offsets (아직 없음)', fs: 14, mono: true, color: MUT, s: pop(u, 0.6) });
      tx(260, 360, 'consumer group이 처음 붙을 때 생긴다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 3) { tx(90, 316, 'Leader', { 'font-size': 14, fill: MUT }); pill(190, 310, 'broker 1', ACC, pop(u, 0.4), { fs: 13.5 });
      tx(90, 352, 'Replicas', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) }); mono(190, 357, '[1]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(260, 352, 'Isr', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); el('circle', { cx: 330, cy: 347, r: 18, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.2) }); mono(330, 352, '1', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) });
      tx(260, 92, '복제본이 하나뿐이라 leader가 곧 ISR 전부다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    term(c, TX, 40, TW, 360, { title: 'kafka-topics' }); }

  // ================= 3. Producer 로 발행 =================
  function s3(t, c) { const { k, u } = c, ms = c.beat.broker.messages, n0 = c.prev ? c.prev.broker.messages.length : ms.length;
    zone(20, 150, 480, 110, null, { fill: SOFT }); tx(490, 170, 'hello · partition 0', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    const X = plog(36, 186, ms, { w: 74, slots: 6, chars: 8, s: (i) => (i >= n0 ? pop(u, 0.9 + (i - n0) * 0.5) : 1) });
    card(90, 70, 150, 50, { rx: 10, text: 'console-producer', fs: 14, stroke: k >= 1 ? INK : OFF, dash: k >= 1 ? null : '5 4', s: k === 1 ? pop(u, 0.3) : 1 });
    if (k === 0) pill(330, 70, 'BROKER · TOPIC은 consumer와 같은 값', MUT, pop(u, 0.3), { fs: 13.5 });
    if (k === 1) { grow(170, 82, X(0) + 10, 180, seg(u, 0.8, 1.4), MUT, { dash: '5 4' }); pill(330, 70, '> 입력을 기다린다', INK, pop(u, 1.4), { mono: true, fs: 13.5 }); }
    ms.forEach((m, i) => { if (i < n0) return; fly(90, 95, X(i), 205, seg(u, 0.3 + (i - n0) * 0.5, 0.9 + (i - n0) * 0.5), short(m.value, 12), { mono: true }); });
    if (k === 2) { dot([[X(0), 175], [100, 96]], seg(u, 1.4, 2.0), GOOD, 7); pill(330, 70, 'acks=all → ISR 전부 확인 뒤 응답', GOOD, pop(u, 1.9), { fs: 13.5 }); }
    if (k === 3) tx(260, 300, '끝에 붙을 뿐 · 중간 수정이나 끼워 넣기는 없다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    if (k === 4) { mono(260, 300, '00000000000000000000.log', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
      tx(260, 324, '디스크에 남는다 · 기본 보존 168시간(7일)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
      tx(40, 360, '운영:', { 'font-size': 14, 'font-weight': 800, opacity: fade(u, 1.0) });
      ['leader', 'follower', 'follower'].forEach((s, i) => { card(140 + i * 110, 356, 96, 32, { rx: 6, text: s, fs: 13.5, stroke: i ? INFO : ACC, s: pop(u, 1.2 + i * 0.2) }); });
      tx(260, 400, 'RF 3 + min.insync.replicas=2 + acks=all', { 'font-size': 13.5, class: 'mono', 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); }
    term(c, TX, 40, TW, 360, { title: 'kafka-console-producer' }); }

  // ================= 4. Consumer 로 수신 =================
  function s4(t, c) { const { k, u } = c, ms = c.beat.broker.messages, rd = ms.filter((m) => m.readBy).length, r0 = c.prev ? c.prev.broker.messages.filter((m) => m.readBy).length : rd;
    zone(20, 150, 480, 110, null, { fill: SOFT }); tx(490, 170, 'hello · partition 0', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    const X = plog(36, 186, ms, { w: 74, slots: 6, chars: 8 });
    card(90, 70, 160, 50, { rx: 10, text: 'learner-cli', fs: 15, mono: true, stroke: k >= 1 ? INFO : OFF, dash: k >= 1 ? null : '5 4', color: k >= 1 ? INFO : MUT, s: k === 1 ? pop(u, 0.3) : 1 });
    if (k === 0) pill(330, 70, 'GROUP = offset을 기억하는 단위', MUT, pop(u, 0.4), { fs: 13.5 });
    if (k >= 1) { const s = k === 1 ? pop(u, 1.2) : 1; card(260, 320, 280, 40, { rx: 8, stroke: INFO, text: '__consumer_offsets', fs: 14, mono: true, color: INFO, s });
      if (k === 1) tx(260, 362, 'group이 처음 붙으면서 생겼다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k >= 2) { const cur = k === 4 ? 3 : tween(r0, rd, u, 1.6), x = cur >= 3 ? X(2) + 49 : X(Math.floor(cur));
      el('path', { d: `M${x - 7},${166} l7,12 l7,-12 z`, fill: INFO }); mono(x, 160, k === 3 && cur > 2.9 ? '끝 · 대기' : 'next', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
      ms.forEach((m, i) => { if (m.readBy && i < Math.floor(cur + 0.001)) check(X(i) + 30, 196, 6); }); }
    if (k === 2) tx(260, 300, '읽기는 커서를 옮기는 일 · 메시지는 그대로', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    if (k === 4) { fly(260, 120, 260, 320, seg(u, 0.4, 1.2), 'learner-cli = 3', { fill: INFO, mono: true });
      if (u > 1.2) mono(260, 370, 'learner-cli → 3 커밋', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700 });
      const a = fade(u, 1.6); el('path', { d: `M${X(0) - 7},${266} l7,-10 l7,10 z`, fill: WARN, opacity: a }); mono(X(0) + 8, 284, '다른 group → 0부터', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: a });
      tx(260, 400, '같은 group은 3부터 이어서 읽는다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
    term(c, TX, 40, TW, 360, { title: 'kafka-console-consumer' }); }

  // ================= 5. kafka-python =================
  function s5(t, c) { const { k, u } = c, ms = c.beat.broker.messages, n0 = c.prev ? c.prev.broker.messages.length : ms.length;
    zone(20, 40, 920, 100, 'hello · partition 0', { fill: SOFT });
    const X = plog(40, 70, ms, { w: 140, slots: 6, chars: 16, s: (i) => (i >= n0 ? pop(u, 0.4 + (i - n0) * 0.6) : 1) });
    if (k === 0) tx(480, 170, 'CLI로 넣은 3건이 남아 있고, Python은 같은 로그에 이어 쓴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    if (k === 1) { card(160, 180, 260, 44, { rx: 8, text: "{'user': 'alice', 'msg': 'hi'}", fs: 13.5, mono: true, s: pop(u, 0.2) });
      grow(296, 180, 370, 180, seg(u, 0.6, 1.0), ACC); tx(333, 170, 'json.dumps', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.8) });
      card(560, 180, 330, 44, { rx: 8, text: 'b\'{"user": "alice", "msg": "hi"}\'', fs: 13.5, mono: true, stroke: ACC, s: pop(u, 1.0) });
      tx(882, 222, 'linger_ms=10', { 'font-size': 13.5, class: 'mono', fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.4) }); clock(900, 217, 12, seg(u, 1.4, 2.4), WARN, null);
      tx(40, 228, 'ensure_ascii=False라 한글이 \\uXXXX로 바뀌지 않는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { card(200, 200, 340, 70, { rx: 10, stroke: INFO, text: 'group_id="learner-py"\nauto_offset_reset="earliest"', fs: 14, mono: true, s: pop(u, 0.2) });
      el('path', { d: `M${X(0) - 7},${54} l7,10 l7,-10 z`, fill: INFO, opacity: fade(u, 0.9) }); mono(X(0) + 70, 56, '새 group → 0', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(420, 196, 'JSON이면 dict, 아니면 문자열로 푼다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(420, 222, 'consumer_timeout_ms=4000 · 4초 조용하면 루프 끝', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); }
    if (k === 3) { ms.forEach((m, i) => { if (i < n0) return; const a = 0.4 + (i - n0) * 0.6; fly(480, 230, X(i), 89, seg(u, a - 0.3, a), short(m.value, 14), { fill: INFO, mono: true }); });
      tx(480, 200, 'send().get()이 돌려준 offset = 3, 4, 5', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k === 4) { const cur = Math.min(6, E(u, 0.3, 2.3) * 6), x = cur >= 6 ? X(5) + 76 : X(Math.floor(cur));
      el('path', { d: `M${x - 7},${54} l7,10 l7,-10 z`, fill: INFO }); for (let i = 0; i < Math.floor(cur); i++) check(X(i) + 56, 80, 6);
      tx(480, 200, 'learner-py는 새 group이라 offset 0부터 6건을 모두 읽는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 5) { [['producer', 180], ['broker', 480], ['consumer', 780]].forEach(([s, x], i) => card(x, 200, 150, 44, { rx: 10, text: s, fs: 15, stroke: [ACC, INK, INFO][i], s: pop(u, 0.2 + i * 0.2) }));
      grow(256, 200, 404, 200, seg(u, 0.8, 1.2), ACC); grow(556, 200, 704, 200, seg(u, 1.3, 1.7), INFO);
      mono(330, 188, 'send', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(630, 188, 'poll', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
    term(c, 20, 250, 920, 160, { title: 'python python-client.py', d: 2.0 }); }

  const quiz = [
    { q: 'docker-compose의 depends_on: [zookeeper]가 보장하는 것은 무엇인가?',
      o: ['zookeeper 컨테이너가 먼저 기동된다는 순서', 'zookeeper가 요청을 받을 준비가 끝났다는 것', 'kafka와 zookeeper가 같은 포트를 쓴다는 것'], a: 0,
      why: 'depends_on은 기동 순서만 보장한다. 준비 완료까지 기다리지는 않으므로 broker가 늦게 붙을 수 있다.' },
    { q: '새로 띄운 broker에서 hello 토픽만 만들고 --list를 하면 무엇이 보이나?',
      o: ['hello와 __consumer_offsets', '아무것도 안 보인다', 'hello 하나'], a: 2,
      why: '__consumer_offsets는 consumer group이 처음 붙을 때 만들어진다. 아직 consumer가 없으니 hello만 보인다.' },
    { q: 'console-producer에 세 줄을 입력하면 partition 0에는 어떻게 쌓이나?',
      o: ['offset 0, 1, 2로 끝에 차례로 붙는다', '마지막 줄이 앞의 줄을 덮어쓴다', '입력한 순서와 상관없이 정렬된다'], a: 0,
      why: '파티션은 append-only 로그다. Enter를 칠 때마다 끝에 붙고 offset이 하나씩 커진다.' },
    { q: 'learner-cli로 3건을 읽고 끝낸 뒤 같은 group으로 다시 실행하면 어디서부터 읽나?',
      o: ['offset 0부터 다시', '커밋된 offset 3부터, 즉 새 메시지만', '가장 최근 메시지 하나만'], a: 1,
      why: '같은 group은 __consumer_offsets에 저장한 위치부터 이어 읽는다. --from-beginning은 처음 붙는 group에만 적용된다.' },
    { q: 'learner-py consumer가 json.loads만 쓰는 역직렬화기로 이 토픽을 처음부터 읽으면 무슨 일이 생기나?',
      o: ['Python이 보낸 3건만 골라 읽는다', 'offset 0의 hello kafka에서 JSONDecodeError가 난다', '평문은 자동으로 건너뛴다'], a: 1,
      why: '새 group에 earliest라 offset 0부터 읽는데, CLI로 넣은 평문은 JSON이 아니다. 그래서 평문이면 문자열로 두는 역직렬화기를 쓴다.' },
  ];

  const summary = [
    'docker compose로 zookeeper와 kafka 컨테이너를 띄우고 호스트는 localhost:9092로 broker에 붙는다.',
    'hello 토픽을 partition 1, replication 1로 만들면 partition 0의 빈 로그가 하나 생긴다.',
    'producer가 한 줄씩 보내면 로그 끝에 offset 0, 1, 2로 붙고 읽어도 지워지지 않는다.',
    'consumer group은 읽은 위치를 커밋해 이어 읽고, 새 group은 earliest로 offset 0부터 다시 읽는다.',
  ];
  const review = [
    { q: '호스트의 Python 앱은 broker에 붙는데, 다른 컨테이너의 앱은 메시지를 못 보낸다. 먼저 볼 것은?',
      o: ['토픽의 partition 수', 'advertised listener가 컨테이너용 주소 kafka:29092를 광고하는지', 'producer의 linger_ms 값'], a: 1,
      why: '클라이언트는 broker가 광고한 주소로 다시 접속한다. 컨테이너 안에서는 kafka:29092, 호스트에서는 localhost:9092를 써야 한다.' },
    { q: 'kafka-python consumer를 group_id="learner-py"로 두 번째 실행했더니 아무것도 출력되지 않았다. 이유는?',
      o: ['첫 실행에서 커밋한 위치 다음에 새 메시지가 없어서', 'broker가 읽은 메시지를 지워서', 'earliest 설정이 무시돼서'], a: 0,
      why: 'kafka-python은 자동 커밋이 기본이라 첫 실행에서 읽은 위치가 저장됐다. earliest는 커밋이 없을 때만 쓰인다.' },
    { q: '브로커 3대로 운영하며 메시지 손실을 막으려 한다. 알맞은 조합은?',
      o: ['replication 1 + acks=0', 'replication 3 + acks=1', 'replication 3 + min.insync.replicas=2 + acks=all'], a: 2,
      why: 'acks=all은 ISR 전부의 확인을 기다리고, min.insync.replicas=2면 최소 두 곳에 써져야 성공한다. 복제본이 1개면 all도 leader 하나뿐이다.' },
  ];

  R.page({ title: 'Kafka 첫 메시지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
