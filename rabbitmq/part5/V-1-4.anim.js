/* V-1-4 Memory · Disk Alarm / Flow Control — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 계기 값(메모리·디스크 사용률, 발행/소비 속도, lazy 메모리 비교, 사이징)은 페이지 STEPS 의 gauge 데이터를 읽는다.
 * 사용률·속도 값은 설명용 예시, 사이징 값은 sizing_calc.py 실행 결과다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, terminal, hbar, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const num = (v) => Math.round(v).toLocaleString('en-US');
  const gv = (c, k) => { const g = c.beat.gauge || {}, p = (c.prev && c.prev.gauge) || {}; return tween(p[k] != null && p.kind === g.kind ? p[k] : null, g[k], c.u); };
  // 위쪽 흐름: producer → 큐 → consumer. blocked 면 producer 쪽에 빨간 문
  function pipe(o) { o = o || {}; const y = o.y || 90;
    person(80, y, 'producer', { s: 0.75 }); grow(115, y, 285, y, 1, o.blocked ? BAD : MUT, { plain: true, dash: o.blocked ? '6 6' : null });
    el('rect', { x: 290, y: y - 22, width: 260, height: 44, rx: 22, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    const n = o.depth ?? 6; for (let i = 0; i < n; i++) el('rect', { x: 520 - i * 18, y: y - 10, width: 13, height: 20, rx: 3, fill: OFF });
    mono(300, y - 30, o.qname || 'orders.queue', { 'font-size': 14, 'font-weight': 700 });
    grow(555, y, 640, y, 1, MUT, { plain: true }); for (let i = 0; i < (o.cons || 1); i++) person(680 + i * 50, y, null, { s: 0.6 });
    if (o.flowDots && !o.blocked) for (let i = 0; i < 4; i++) dot([[115, y], [285, y]], ((o.t * 0.7 + i / 4) % 1), ACC, 5);
    if (o.blocked) { el('rect', { x: 192, y: y - 30, width: 8, height: 60, rx: 2, fill: BAD, opacity: o.blockOp ?? 1 }); tx(196, y + 48, 'blocked', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', class: 'mono', opacity: o.blockOp ?? 1 }); } }
  // 세로 사용률 막대 (0~100%), 선 표시
  function vbar(x, y, h, used, lines, title) { el('rect', { x, y, width: 90, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    const hot = lines.some((l) => l.hard && used >= l.v);
    el('rect', { x, y: y + h * (1 - used / 100), width: 90, height: h * used / 100, rx: 8, fill: hot ? BAD : INFO, opacity: 0.8 });
    lines.forEach((l) => { if (l.op === 0) return; const yy = y + h * (1 - l.v / 100); el('line', { x1: x - 10, y1: yy, x2: x + 100, y2: yy, stroke: l.col, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: l.op ?? 1 });
      tx(x + 110, yy + 5, l.label, { 'font-size': 14.5, 'font-weight': 700, fill: l.col, opacity: l.op ?? 1 }); });
    mono(x + 45, y + h + 24, Math.round(used) + '%', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? BAD : INK });
    if (title) tx(x + 45, y - 12, title, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); }

  // ---------- 1. 메모리 워터마크 ----------
  function s1(t, c) { const { k, u } = c, used = gv(c, 'used'), blocked = used >= 40;
    pipe({ blocked, flowDots: true, t, depth: k >= 3 ? 12 : 4 + k * 2, cons: k === 5 ? 3 : 1, blockOp: k === 3 ? fade(u, 1.2) : 1 });
    const lines = [{ v: 40, col: BAD, label: 'watermark 40%', hard: true, op: k === 0 ? fade(u, 0.6) : 1 }];
    if (k >= 2) lines.push({ v: 20, col: WARN, label: 'paging 20%', op: k === 2 ? fade(u, 0.4) : 1 });
    vbar(110, 170, 190, used, lines, 'RAM 사용률');
    if (k === 0) { pill(560, 230, 'vm_memory_high_watermark.relative = 0.4', INFO, pop(u, 1.0), { mono: true, fs: 13.5 }); note(420, 290, '물리 RAM 의 40% 를 발행 차단선으로 삼는다', fade(u, 1.6), { 'font-size': 14.5 }); note(420, 318, '4.0 부터 기본값은 0.6 이다', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 1) { zone(420, 170, 480, 200, '호스트 RAM', { fill: SOFT });
      el('rect', { x: 440, y: 210, width: 200, height: 140, rx: 8, fill: PANEL, stroke: WARN, 'stroke-width': 2.2, opacity: fade(u, 0.3) }); tx(450, 232, '컨테이너 cgroup 한도', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.3) });
      el('line', { x1: 430, y1: 260, x2: 890, y2: 260, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.9) }); tx(660, 252, '호스트 기준 40% 선', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(660, 300, '한도보다 높아 알람 전에 OOM-Kill', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.4) });
      pill(660, 336, 'absolute = 2GB 로 명시', GOOD, pop(u, 1.9), { mono: true, fs: 13.5 }); return; }
    if (k === 2) { dbIcon(560, 280, 'disk', { s: 0.8 }); for (let i = 0; i < 4; i++) fly(210, 260, 560, 270, seg(u, 0.6 + i * 0.35, 1.2 + i * 0.35), 'msg', { mono: true, fill: WARN });
      note(660, 250, 'page-out: 메모리 → 디스크', fade(u, 0.8)); note(660, 280, '상승 속도를 늦출 뿐 블록은 아니다', fade(u, 1.4), { 'font-size': 14 }); note(660, 310, '3.x classic 큐 v1 전용 설정', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 3) { pill(560, 220, 'mem 41% ≥ watermark 40%', BAD, pop(u, 0.6), { mono: true, fs: 14 }); note(420, 280, '모든 publisher 연결이 blocked', fade(u, 1.3), { fill: BAD }); note(420, 310, '메시지를 버리지는 않는다 · 발행만 멈춘다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 4) { terminal(380, 160, 540, 120, ['$ rabbitmq-diagnostics alarms', ['memory alarm on node rabbit@node1', '#f87171'], '$ rabbitmq-diagnostics memory_breakdown'], lerp(0, 3, E(u, 0.2, 1.4)), { fs: 13.5, title: '출력 예시' });
      [['queue_procs', 0.9], ['binary', 0.45], ['connection_other', 0.25]].forEach(([n, v], i) => { const y = 300 + i * 30; mono(390, y + 14, n, { 'font-size': 14, opacity: fade(u, 1.4 + i * 0.2) }); el('rect', { x: 560, y, width: 300 * v * E(u, 1.4 + i * 0.2, 2.0 + i * 0.2), height: 18, rx: 4, fill: i ? OFF : BAD }); });
      sub(710, 404, '막대 길이는 예시', 1); return; }
    pill(560, 220, 'connection.unblocked', GOOD, pop(u, 1.4), { mono: true, fs: 14 }); note(420, 280, '소비자를 늘리자 메모리가 33% 로 내려왔다', fade(u, 0.8), { 'font-size': 14.5 }); note(420, 310, '앱은 blocked 콜백으로 발행을 잠시 멈춘다', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 2. 디스크 free limit ----------
  const FREE = [19, 13, 6, 1.8, 1.8, 14];
  function hdisk(used, free, o) { o = o || {}; const x = 80, y = 200, w = 760;
    el('rect', { x, y, width: w, height: 46, rx: 8, fill: SOFT, stroke: GRID }); const hot = used >= 96;
    el('rect', { x, y, width: w * used / 100, height: 46, rx: 8, fill: hot ? BAD : INFO, opacity: 0.75 });
    if (o.logs) el('rect', { x, y, width: w * used / 100 * 0.55 * o.logs, height: 46, rx: 8, fill: WARN, opacity: 0.85 });
    const lx = x + w * 0.96; el('line', { x1: lx, y1: y - 18, x2: lx, y2: y + 64, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '5 4', opacity: o.limitOp ?? 1 });
    tx(lx, y - 26, 'limit 2GB', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: o.limitOp ?? 1 });
    mono(x, y + 80, `사용 ${Math.round(used)}% · free ${free.toFixed(free < 10 ? 1 : 0)}GB`, { 'font-size': 17, 'font-weight': 800, fill: hot ? BAD : INK });
    tx(x, y - 26, 'data dir 디스크 (약 50GB · 예시)', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 }); }
  function s2(t, c) { const { k, u } = c, used = gv(c, 'used'), free = tween(k ? FREE[k - 1] : null, FREE[k], u);
    hdisk(used, free, { limitOp: k === 0 ? fade(u, 0.5) : 1, logs: k === 4 ? E(u, 0.8, 1.6) : 0 });
    const blocked = k === 3 || k === 4; pipe({ y: 80, blocked, flowDots: true, t, qname: 'persistent 발행', depth: 5, blockOp: k === 3 ? fade(u, 1.0) : 1 });
    if (k === 0) { pill(480, 340, 'disk_free_limit.absolute = 2GB', INFO, pop(u, 1.0), { mono: true, fs: 14 }); note(80, 395, '남은 공간이 2GB 밑이면 발행을 막는다', fade(u, 1.6)); return; }
    if (k === 1) { el('rect', { x: 80 + 760 * 0.84, y: 254, width: 760 * 0.12, height: 22, rx: 4, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.6) });
      tx(720, 310, 'relative 1.0 = RAM 크기만큼 여유', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); note(80, 395, 'RAM 이 크면 요구 여유도 따라 커진다 (현재는 주석)', fade(u, 1.6)); return; }
    if (k === 2) { const lx = 80 + 760 * 0.999; el('line', { x1: lx, y1: 190, x2: lx, y2: 256, stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.4) }); tx(lx - 4, 300, '기본 50MB 선 (거의 끝)', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.6) });
      note(80, 360, '초당 수천 건 persistent 면 50MB 는 몇 초 만에 찬다', fade(u, 1.3), { fill: WARN }); note(80, 392, '알람이 늦게 떠서 복구가 어려워진다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { pill(480, 340, 'free 1.8GB < limit 2GB', BAD, pop(u, 0.8), { mono: true, fs: 14 }); note(80, 395, '메모리 알람과 똑같이 publisher 가 blocked', fade(u, 1.5), { fill: BAD }); return; }
    if (k === 4) { tx(80 + 760 * 0.96 * 0.28, 228, '로그', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      terminal(440, 300, 480, 110, ['$ rabbitmq-diagnostics disk_free', '$ df -h /var/lib/rabbitmq', ['→ 로그가 절반 이상 차지', '#fbbf24']], lerp(0, 3, E(u, 0.2, 1.6)), { fs: 13.5 });
      note(80, 340, '브로커 관점과', fade(u, 1.2), { 'font-size': 14.5 }); note(80, 368, '실제 디스크를 대조', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    ['① df 로 원인', '② 소비자 증설', '③ 디스크 증설', '④ lazy 큐'].forEach((s, i) => { const sc = pop(u, 0.3 + i * 0.35); card(170 + i * 210, 350, 180, 44, { rx: 22, text: s, fs: 15, stroke: GOOD, s: sc }); });
    pill(780, 120, 'unblocked', GOOD, pop(u, 1.9), { mono: true, fs: 14 }); }

  // ---------- 3. credit flow control ----------
  const CH = [['connection', 110], ['channel', 330], ['queue', 550], ['consumer', 780]];
  function chain(t, u, o) { o = o || {}; const y = 120;
    CH.forEach(([n, x], i) => { const hot = o.flow && i === 0; card(x, y, 150, 56, { rx: 12, text: n, fs: 15, mono: true, stroke: hot ? WARN : INK, fill: hot ? WARNBG : PANEL });
      if (i < 3) { grow(x + 78, y - 12, CH[i + 1][1] - 78, y - 12, 1, MUT); for (let j = 0; j < 3; j++) dot([[x + 78, y - 12], [CH[i + 1][1] - 78, y - 12]], ((t * (o.slow && i < 2 ? 0.25 : 0.6) + j / 3) % 1), ACC, 5);
        el('line', { x1: CH[i + 1][1] - 78, y1: y + 14, x2: x + 78, y2: y + 14, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '3 5', opacity: o.noCredit && i < 2 ? 0.25 : 1 }); } });
    tx(110, 70, '메시지 →', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); tx(110, 176, '← credit', { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
    if (o.flow) pill(110, 205, 'state = flow', WARN, 1, { mono: true, fs: 14 }); }
  function rates(c) { const p = gv(c, 'publish'), q = gv(c, 'consume'); const y = 270, w = 520;
    tx(80, y + 15, '발행', { 'font-size': 15, 'font-weight': 700 }); hbar(150, y, w, p, 20000, { col: ACC, text: num(p) + ' msg/s', h: 22 });
    tx(80, y + 55, '소비', { 'font-size': 15, 'font-weight': 700 }); hbar(150, y + 40, w, q, 20000, { col: INFO, text: num(q) + ' msg/s', h: 22 });
    sub(150, y + 90, '속도 값은 예시', 1, { 'text-anchor': 'start' }); }
  function s3(t, c) { const { k, u } = c;
    chain(t, u, { flow: k >= 1 && k <= 4, slow: k >= 1 && k <= 4, noCredit: k >= 1 && k <= 4 }); rates(c);
    if (k === 0) { note(560, 205, '하위가 credit 을 다 쓰면 상위가 멈춘다', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { mono(330, 210, 'list_connections | grep flow', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) }); return; }
    if (k === 2) { pill(330, 210, 'unacked 가 prefetch 한도까지', WARN, pop(u, 0.6), { fs: 14 }); return; }
    if (k === 3) { for (let i = 0; i < 10; i++) el('rect', { x: 490 + (i % 5) * 24, y: 158 + Math.floor(i / 5) * 22, width: 18, height: 18, rx: 3, fill: WARN, opacity: fade(u, 0.3 + i * 0.08) });
      mono(720, 210, 'messages_ready 42만', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) }); return; }
    if (k === 4) { const ty = 210; tx(560, ty, 'prefetch 너무 큼 → 한 소비자가 독점', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
      tx(560, ty + 26, 'prefetch 너무 작음 → 왕복마다 기다림', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) }); tx(560, ty + 52, '발행이 소비 속도에 붙는다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) }); return; }
    for (let i = 0; i < 4; i++) person(880, 60 + i * 28, null, { s: 0.38 * pop(u, 0.2 + i * 0.15), stroke: GOOD });
    pill(560, 210, '소비자 4 → 8 · state = running', GOOD, pop(u, 1.2), { fs: 14 }); }

  // ---------- 4. lazy · quorum ----------
  function memDisk(x, title, mem, diskN, o) { o = o || {}; zone(x, 40, 270, 230, title, { fill: SOFT, color: o.col || MUT });
    tx(x + 20, 86, 'RAM', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); el('rect', { x: x + 70, y: 72, width: 180, height: 22, rx: 5, fill: PANEL, stroke: GRID });
    el('rect', { x: x + 70, y: 72, width: 180 * mem / 100, height: 22, rx: 5, fill: mem > 50 ? BAD : GOOD, opacity: 0.8 });
    mono(x + 160, 120, Math.round(mem) + '% RAM', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: mem > 50 ? BAD : GOOD });
    dbIcon(x + 135, 190, null, { s: 0.75 }); for (let i = 0; i < Math.round(diskN); i++) el('rect', { x: x + 106 + (i % 4) * 15, y: 176 + Math.floor(i / 4) * 16, width: 11, height: 12, rx: 2, fill: INFO });
    tx(x + 135, 254, '디스크', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function s4(t, c) { const { k, u } = c, g = c.beat.gauge, nm = gv(c, 'normalMem'), lm = gv(c, 'lazyMem');
    memDisk(40, k === 5 ? 'classic (3.12+)' : '기본 classic', nm, k === 5 ? 8 : 1, { col: nm > 50 ? BAD : GOOD });
    memDisk(340, k >= 2 && k <= 3 ? 'quorum' : 'lazy (x-queue-mode)', lm, k === 0 ? 1 : 8, { col: GOOD });
    sub(480, 300, '같은 백로그 100만 건 · 사용률은 예시', 1);
    const X = 650;
    if (k === 0) { mono(X, 80, 'connection = pika.Blocking…', { 'font-size': 14 }); mono(X, 106, 'channel = connection.channel()', { 'font-size': 14, opacity: fade(u, 0.6) }); note(X, 150, '아직 선언 전 · 두 큐 조건 동일', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { for (let i = 0; i < 5; i++) fly(600, 90, 530, 178, seg(u, 0.3 + i * 0.25, 0.8 + i * 0.25), 'm', { mono: true, fill: INFO });
      pill(X + 130, 90, '"x-queue-mode": "lazy"', INFO, pop(u, 0.4), { mono: true, fs: 13.5 }); note(X, 150, '처음부터 디스크에 둔다', fade(u, 1.2), { 'font-size': 14.5 }); note(X, 176, '대신 소비 지연·디스크 I/O ↑', fade(u, 1.7), { 'font-size': 14, fill: WARN }); return; }
    if (k === 2) { // quorum: 리더 1 + 팔로워 2, 로그 복제
      const P = [[730, 110, 'leader'], [660, 220, 'follower'], [860, 220, 'follower']];
      P.forEach(([x, y, n], i) => { card(x, y, 110, 50, { rx: 10, text: n, fs: 14.5, stroke: i ? INFO : ACC, color: i ? INFO : ACC, fill: i ? PANEL : ACCBG, s: pop(u, 0.2 + i * 0.25) }); });
      for (let i = 1; i < 3; i++) { grow(730, 136, P[i][0], P[i][1] - 26, E(u, 0.9, 1.4), ACC); dot([[730, 136], [P[i][0], P[i][1] - 26]], ((t * 0.6 + i / 2) % 1), ACC, 5); }
      mono(760, 290, '"x-queue-type": "quorum"', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); sub(760, 318, 'Raft 로 디스크 로그를 복제 · 항상 durable', fade(u, 1.9)); return; }
    if (k === 3) { el('line', { x1: 660, y1: 80, x2: 920, y2: 80, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); mono(660, 70, 'x-max-length 1,000,000', { 'font-size': 14, 'font-weight': 800, fill: BAD });
      for (let i = 0; i < 5; i++) { const s = clamp(E(u, 0.3, 1.8) * 5 - i); el('circle', { cx: 690 + i * 44, cy: 150, r: 14, fill: s > 0 ? WARN : PANEL, stroke: WARN, 'stroke-width': 2, opacity: 0.3 + 0.7 * clamp(s) }); mono(690 + i * 44, 155, String(i + 1), { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: s > 0.5 ? PANEL : WARN }); }
      tx(660, 196, '재전달 5회 (x-delivery-limit)', { 'font-size': 14.5, 'font-weight': 700 }); fly(800, 210, 800, 260, seg(u, 1.9, 2.5), 'DLX', { mono: true, fill: BAD, stay: true });
      note(660, 300, '넘치거나 5회 넘게 실패하면 dead-letter', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) {
      [['classic', '작은 큐 · 빠른 소비', INK], ['lazy', '대량 백로그 · RAM 방어', INFO], ['quorum', '내구성·HA · 신규 설계', GOOD]].forEach(([a, b, col], i) => { const y = 90 + i * 70, sc = pop(u, 0.2 + i * 0.4);
        card(780, y, 260, 56, { rx: 10, stroke: col, s: sc }); mono(670, y - 4, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) }); tx(670, y + 18, b, { 'font-size': 14, opacity: fade(u, 0.3 + i * 0.4) }); }); return; }
    note(X, 100, '3.12 부터 classic 큐가', fade(u, 0.6)); note(X, 126, '사실상 lazy 처럼 동작한다', fade(u, 0.8)); mono(X, 170, 'x-queue-mode → 무시', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.4) }); note(X, 214, '신규 설계는 quorum 이 기본', fade(u, 1.9), { fill: GOOD }); }

  // ---------- 5. Sizing ----------
  function grid(n, x, y, cols, size, col, u, extraFrom) { const shown = Math.round(n * u); for (let i = 0; i < shown; i++) { const r = Math.floor(i / cols), q = i % cols;
      el('rect', { x: x + q * (size + 3), y: y + r * (size + 3), width: size, height: size, rx: Math.min(4, size / 3), fill: extraFrom != null && i >= extraFrom ? WARN : ACC }); } }
  function s5(t, c) { const { k, u } = c, g = c.beat.gauge, need = Math.round(gv(c, 'needConsumers')), per = gv(c, 'perConsumer');
    const head = (a, b) => { mono(60, 60, a, { 'font-size': 17, 'font-weight': 800 }); if (b) mono(60, 92, b, { 'font-size': 15, fill: MUT }); };
    if (k === 0) { ['소비자 1개 처리율 = 동시 처리 건수 / 처리시간', '필요 소비자 수 = ceil(목표 / 1개 처리율)', '피크 메모리 = 피크 깊이 × 메시지 크기'].forEach((s, i) => mono(60, 60 + i * 36, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) }));
      mono(60, 210, `20,000 ÷ 2,500 = ${need}`, { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) }); grid(need, 60, 240, 10, 34, ACC, E(u, 1.6, 2.3)); sub(60, 310, '여유율 적용 전', fade(u, 2.2), { 'text-anchor': 'start' }); return; }
    if (k === 1) { head(`prefetch 50 ÷ 0.04초 = ${num(per)} msg/s`, '처리시간이 20ms → 40ms 로 두 배'); mono(60, 150, `20,000 ÷ ${num(per)} = ${need}개`, { 'font-size': 22, 'font-weight': 800, fill: WARN });
      grid(need, 60, 180, 16, 34, ACC, 1, 8); sub(60, 250, '처리시간이 두 배면 소비자도 두 배', fade(u, 1.6), { 'text-anchor': 'start' }); return; }
    if (k === 2) { head(`한 건씩 처리: 1 ÷ 0.02초 = ${num(per)} msg/s`, 'prefetch 50 은 왕복 지연만 숨긴다'); mono(60, 150, `ceil(20,000 ÷ 50 × 1.25) = ${need}개`, { 'font-size': 22, 'font-weight': 800, fill: BAD });
      grid(500, 60, 180, 50, 12, ACC, E(u, 0.4, 2.2)); sub(60, 400, '점 하나 = 소비자 하나 (sizing_calc 함수로 계산)', fade(u, 2.2), { 'text-anchor': 'start' }); return; }
    if (k === 3) { head('ceil(20,000 ÷ 2,500 × 1.25)', 'safety 1.25 = 25% 여유'); mono(60, 150, `8 → ${need}개`, { 'font-size': 26, 'font-weight': 800, fill: ACC });
      grid(10, 60, 180, 10, 50, ACC, 1, 8); sub(60, 256, '주황 2칸이 여유분', fade(u, 1.2), { 'text-anchor': 'start' }); return; }
    if (k === 4) { head('peak_memory_mb(500_000, 2048)', '피크 깊이 × 평균 메시지 크기 → MB');
      for (let i = 0; i < 50; i++) { const s = clamp(E(u, 0.3, 1.6) * 50 - i); el('rect', { x: 60 + (i % 25) * 22, y: 150 + Math.floor(i / 25) * 22, width: 18, height: 18, rx: 3, fill: INFO, opacity: s }); }
      sub(60, 220, '칸 하나 = 1만 건 × 2KB', fade(u, 1.4), { 'text-anchor': 'start' }); mono(60, 280, '500,000 × 2,048 B ÷ 1,048,576 ≈ 977 MB', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.8) }); return; }
    if (k === 5) { [['TARGET', '20_000', '피크 발행 msg/s'], ['PREFETCH', '50', '동시 처리 50건 가정'], ['PROCESS_MS', '20', '건당 처리 ms']].forEach(([a, b, d], i) => { const x = 180 + i * 300, sc = pop(u, 0.2 + i * 0.4);
        card(x, 160, 250, 120, { rx: 12, stroke: ACC, s: sc }); mono(x, 135, a, { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
        mono(x, 175, b, { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) }); tx(x, 205, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.4) }); });
      note(60, 310, '세 입력이 모든 결과를 정한다', fade(u, 1.8)); return; }
    if (k === 6) { [['rate', 'per_consumer_rate(50, 20)', '2,500'], ['need', 'required_consumers(…)', '10'], ['mem', 'peak_memory_mb(500_000, 2048)', '977 MB']].forEach(([v, f, r], i) => { const y = 90 + i * 80, a = 0.3 + i * 0.5;
        mono(60, y, v + ' = ' + f, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, a) }); grow(560, y - 5, 640, y - 5, E(u, a + 0.2, a + 0.5), ACC); mono(660, y, r, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, a + 0.4) }); }); return; }
    terminal(60, 40, 520, 150, ['$ python sizing_calc.py', '소비자 1개 처리율 : 2,500 msg/s', '필요 소비자 수    : 10 개', '피크 메모리 요구  : 977 MB'], lerp(0, 4, E(u, 0.2, 1.5)), { fs: 14, title: '실행 결과' });
    vbar(680, 70, 200, 977 / 8192 * 100, [{ v: 40, col: BAD, label: '0.4 = 3.2GB', hard: true }], '8GB 노드 (예시)');
    note(60, 240, '10개로 증설 · 977MB 는 워터마크 3.2GB 안', fade(u, 1.6), { fill: GOOD }); note(60, 304, '2GB 노드라면 0.4 선은 819MB 라 넘친다', fade(u, 2.3), { fill: WARN, 'font-size': 14.5 }); note(60, 272, '백프레셔는 최후 방어선으로 남긴다', fade(u, 2.0), { 'font-size': 14.5 }); }

  const quiz = [
    { q: '노드 메모리가 vm_memory_high_watermark를 넘으면 RabbitMQ는 무엇을 하는가?',
      o: ['오래된 메시지부터 버린다', '발행하는 연결을 모두 blocked로 만든다', '소비자 연결을 끊는다'], a: 1,
      why: '워터마크는 백프레셔다. 메시지를 버리지 않고 publisher를 막았다가 메모리가 내려가면 자동으로 풀어 준다.' },
    { q: '디스크가 약 50GB이고 disk_free_limit.absolute = 2GB일 때 발행이 막히는 사용률은 대략 얼마인가?',
      o: ['약 96%', '약 90%', '약 50%'], a: 0,
      why: '남은 공간이 2GB 밑이면 막힌다. 50GB 중 48GB를 쓰는 지점이라 사용률 약 96%다. 예시에서 free 1.8GB가 되자 알람이 떴다.' },
    { q: '연결 state가 flow로 보인다. 무슨 뜻인가?',
      o: ['TLS 협상이 진행 중이다', '메모리 알람이 켜졌다', '하위 큐·소비자가 밀려 credit이 끊겨 발행이 스로틀되고 있다'], a: 2,
      why: 'credit 기반 흐름 제어가 걸린 상태다. 예시에서 발행 20,000이 소비 8,000에 맞춰 내려갔다.' },
    { q: 'RabbitMQ 3.12 이상에서 x-queue-mode=lazy를 classic 큐에 주면 어떻게 되는가?',
      o: ['classic 큐가 이미 lazy처럼 동작해 따로 줄 이유가 거의 없다', '메모리 사용이 절반으로 준다', 'quorum 큐로 바뀐다'], a: 0,
      why: '3.12부터 classic 큐는 메시지를 디스크 쪽에 두는 방식으로 바뀌었다. 신규 설계는 quorum이 기본 권장이다.' },
    { q: '건당 20ms가 걸리는 소비자가 메시지를 한 건씩 처리한다. prefetch 50일 때 1개 처리율은 얼마인가?',
      o: ['2,500 msg/s', '1,250 msg/s', '50 msg/s'], a: 2,
      why: '한 건씩 처리하면 1 ÷ 0.02초 = 50 msg/s다. prefetch ÷ 처리시간은 50건을 동시에 처리할 때만 맞다.' },
  ];

  const summary = [
    '메모리가 워터마크를 넘으면 발행 연결이 blocked 되고, 메시지는 버리지 않는다.',
    '디스크 여유가 disk_free_limit 아래로 내려가도 똑같이 막힌다. 기본 50MB는 너무 작다.',
    '알람 전에도 credit 흐름 제어가 느린 큐의 발행자를 소비 속도에 맞춰 늦춘다.',
    '소비자 수는 목표 처리량을 1개 처리율로 나누고 여유율 1.25를 곱해 올림해서 정한다.',
  ];
  const review = [
    { q: '메모리 한도를 건 컨테이너에서 relative 0.4를 썼는데 알람 없이 OOM-Kill이 났다. 먼저 바꿀 것은?',
      o: ['vm_memory_high_watermark.absolute로 한도 안쪽 값을 직접 준다', 'paging_ratio를 0.9로 올린다', 'disk_free_limit를 늘린다'], a: 0,
      why: 'cgroup 한도를 못 보면 relative가 호스트 RAM 기준으로 잡혀 한도보다 높아진다. 절대값을 주면 알람이 먼저 뜬다.' },
    { q: '발행 20,000, 소비 8,000에서 연결이 flow 상태다. 가장 근본적인 해결은?',
      o: ['prefetch를 1로 줄인다', 'disk_free_limit를 낮춘다', '소비자를 늘려 소비 속도를 끌어올린다'], a: 2,
      why: 'flow는 소비가 못 따라온다는 신호다. 예시에서 소비자를 8개로 늘리자 16,000까지 오르며 flow가 풀렸다.' },
    { q: '사이징 결과가 소비자 10개였는데 실제로 10개를 띄우자 큐가 계속 쌓인다. 먼저 의심할 것은?',
      o: ['peak_memory_mb 계산이 틀렸다', '소비자가 50건을 동시에 처리하지 않고 한 건씩 처리한다', 'safety 1.25가 너무 크다'], a: 1,
      why: '2,500 msg/s는 50건 동시 처리를 가정한 값이다. 한 건씩이면 50 msg/s라 같은 목표에 500개가 필요하다.' },
  ];

  R.page({ title: '백프레셔와 용량 산정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
