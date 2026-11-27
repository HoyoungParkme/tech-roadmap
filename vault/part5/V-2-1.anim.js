/* V-2-1 감사 로그(audit device) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    server, dbIcon, person, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 문서(로그 파일) 그림: n 줄이 차 있다
  function doc(cx, cy, n, o) { o = o || {}; const w = o.w || 56, h = o.h || 68, x = cx - w / 2, y = cy - h / 2, col = o.col || INK, s = o.s ?? 1;
    if (s <= 0) return; const g = R.G(cx, cy, s, o.op);
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash }, g);
    for (let i = 0; i < Math.min(n, 5); i++) el('line', { x1: -w / 2 + 9, y1: -h / 2 + 18 + i * 10, x2: w / 2 - 10, y2: -h / 2 + 18 + i * 10, stroke: o.lineCol || ACC, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: clamp(n - i) }, g);
    if (o.name) tx(0, h / 2 + 20, o.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: col }, g); }
  const stamp = (x, y, s, op) => tx(x, y, s, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: op, transform: `rotate(-8 ${x} ${y})` });
  const hash = (i) => { const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); };

  // 1. 기록이 없다
  function s1(t, c) { const { k, u } = c, VX = 330, VY = 170;
    for (let i = 0; i < 4; i++) dot([[40, VY], [270, VY]], ((t * 0.6 + i / 4) % 1), ACC, 5);
    server(VX, VY, null, {}); lbl(VX, VY + 62, 'Vault', 1);
    pill(480, 36, 'vault audit list', INK, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
    mono(480, 74, 'No audit devices are enabled.', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 0 ? fade(u, 0.7) : 1 });
    if (k < 3) { grow(392, VY, 680, VY, 1, OFF, { dash: '6 6', plain: true });
      doc(720, VY, 0, { col: OFF, dash: '5 4', name: 'audit.log' }); sub(620, VY - 14, '기록 0줄', k === 0 ? fade(u, 1.2) : 1, { 'font-size': 15, 'font-weight': 700, fill: BAD }); }
    if (k === 1) fly(VX + 40, VY - 30, 860, 110, seg(u, 0.2, 1.1), 'prod DB 비밀번호', { fill: BAD });
    if (k === 1 || k === 2) [['Q1', '누가 읽었나'], ['Q2', '언제 · 어느 IP · 어떤 토큰'], ['Q3', '정상 접근인가']].forEach(([a, b], i) => {
      const x = 170 + i * 310, s = k === 1 ? pop(u, 1.0 + i * 0.35) : 1; card(x, 330, 280, 60, { rx: 10, stroke: k === 2 ? BAD : WARN, sw: 2, s });
      if (s > 0.3) { mono(x - 120, 336, a, { 'font-size': 16, 'font-weight': 800, fill: WARN }); tx(x - 80, 336, b, { 'font-size': 15, 'font-weight': 700 }); }
      if (k === 2) stamp(x + 90, 372, '모른다', fade(u, 0.3 + i * 0.35)); });
    if (k === 2) { card(830, 100, 200, 52, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.4) });
      tx(830, 106, '감사관: 접근 이력 제출', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.5) }); cross(930, 100, 10, pop(u, 1.8)); }
    if (k >= 3) { const D = [['file', '로컬 파일에 append', 90], ['syslog', 'OS syslog 데몬으로', 190], ['socket', '원격 수집기로 스트리밍', 290]];
      D.forEach(([a, b, y], i) => { const g = k === 3 ? E(u, 0.2 + i * 0.4, 0.8 + i * 0.4) : 1, hi = k === 4 && i !== 1;
        grow(392, VY, 600, y, g, hi ? ACC : MUT, { plain: true });
        if (i === 0) doc(640, y, 3, { s: k === 3 ? pop(u, 0.6) : 1, col: hi ? ACC : INK, h: 60, w: 48 });
        else card(640, y, 70, 50, { rx: 8, s: k === 3 ? pop(u, 0.6 + i * 0.4) : 1, stroke: hi ? ACC : INK, sw: 2.5, text: i === 1 ? 'syslogd' : ':9000', fs: 13.5, mono: true });
        mono(700, y - 4, a, { 'font-size': 17, 'font-weight': 800, fill: hi ? ACC : INK, opacity: k === 3 ? fade(u, 0.7 + i * 0.4) : 1 });
        tx(700, y + 20, b, { 'font-size': 14, fill: MUT, opacity: k === 3 ? fade(u, 0.8 + i * 0.4) : 1 }); }); }
    if (k === 4) banner(330, 340, '프로덕션 필수 · 목적지가 다른 device 2개 이상', pop(u, 0.6)); }

  // 2. audit enable — 세 갈래
  const DY = [70, 150, 230];
  function s2(t, c) { const { k, u } = c, VX = 130, VY = 150, on = Math.min(k + 1, 3);
    server(VX, VY, null, {}); lbl(VX, VY + 62, 'Vault', 1);
    const D = [['file/', '/var/log/vault/audit.log'], ['syslog/', 'tag=vault facility=AUTH'], ['socket/', 'collector.internal:9000']];
    D.forEach(([p, d], i) => { if (i >= on) return; const fresh = i === k, g = fresh ? E(u, 0.2, 1.0) : 1, y = DY[i];
      grow(190, VY, 596, y, g, ACC, { plain: true });
      if (g >= 1) for (let j = 0; j < 3; j++) dot([[190, VY], [596, y]], ((t * 0.7 + j / 3 + i * 0.1) % 1), ACC, 4.5);
      pill(390, lerp(VY, y, 0.5), p, ACC, fresh ? pop(u, 0.6) : 1, { mono: true, fs: 14, fill: PANEL });
      if (i === 0) doc(632, y, k === 0 ? E(u, 1.0, 2.6) * 5 : 5, { w: 44, h: 54, s: fresh ? pop(u, 0.9) : 1 });
      else card(632, y, 64, 50, { rx: 8, sw: 2.5, text: i === 1 ? 'syslog' : 'TCP', fs: 13.5, mono: true, s: fresh ? pop(u, 0.9) : 1 });
      mono(680, y + 5, d, { 'font-size': 14.5, 'font-weight': 700, opacity: fresh ? fade(u, 1.2) : 1 }); });
    if (k === 1) sub(760, 196, 'Linux 한정', fade(u, 1.5), { 'font-size': 13.5 });
    if (k === 2) sub(480, 320, '로컬 디스크와 운명을 같이하지 않는 목적지', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 3) terminal(40, 272, 880, 140, ['$ vault audit list -detailed', 'Path     Type     Options', 'file/    file     file_path=/var/log/vault/audit.log', 'syslog/  syslog   facility=AUTH tag=vault', 'socket/  socket   address=collector.internal:9000'], lerp(0.5, 5, E(u, 0.2, 1.8)), { fs: 14, lh: 20 });
    if (k === 4) { card(150, 350, 140, 48, { rx: 8, stroke: INFO, sw: 2, text: 'logrotate', mono: true, fs: 15, color: INFO, s: pop(u, 0.2) });
      const m = E(u, 0.5, 1.2); doc(lerp(420, 640, m), 345, 5, { w: 44, h: 54, col: m > 0.5 ? MUT : INK, lineCol: m > 0.5 ? OFF : ACC });
      mono(lerp(420, 640, m) + 32, 350, m > 0.5 ? 'audit.log.1' : 'audit.log', { 'font-size': 14, 'font-weight': 700, fill: m > 0.5 ? MUT : INK });
      doc(420, 345, 0, { w: 44, h: 54, s: pop(u, 1.2) }); mono(452, 350, 'audit.log', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.3) });
      grow(150, 324, 150, 222, E(u, 1.5, 2.0), WARN); mono(162, 276, 'SIGHUP', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      sub(480, 408, 'SIGHUP을 받아야 Vault가 새 audit.log를 연다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // 3. 로그 한 줄의 구조
  const SEG = [['time', 200, '언제'], ['auth', 220, '누가'], ['request', 240, '무엇을'], ['response', 220, '결과']];
  function hmacBox(cx, cy, s) { card(cx, cy, 150, 52, { rx: 10, fill: INK, stroke: 'none', text: 'HMAC-SHA256', fs: 15, mono: true, color: PANEL, s }); }
  function s3(t, c) { const { k, u } = c; let x = 40;
    SEG.forEach(([n, w, d], i) => { const cur = i === k, done = i < k;
      el('rect', { x, y: 24, width: w - 6, height: 50, rx: 8, fill: cur ? ACCBG : done ? SOFT : PANEL, stroke: cur ? ACC : GRID, 'stroke-width': cur ? 2.5 : 1.5 });
      mono(x + 14, 55, `"${n}"`, { 'font-size': 15, 'font-weight': 800, fill: cur ? ACC : done ? INK : MUT });
      tx(x + w - 18, 55, d, { 'text-anchor': 'end', 'font-size': 14, fill: cur ? ACC : MUT, 'font-weight': 700 }); x += w; });
    if (k === 0) { clock(150, 220, 44, E(u, 0.2, 1.4) * 0.55, ACC, null);
      mono(240, 206, '"time": "2026-08-11T03:12:45.812Z"', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(240, 246, '"type": "response"', { 'font-size': 17, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
      sub(480, 340, '요청마다 JSON 한 줄. 모든 추적은 이 시각에서 시작한다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 1) { [['"display_name": "approle-app"', 140], ['"policies": ["default", "read-db"]', 180]].forEach(([s, y], i) => {
        mono(60, y, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) });
        pill(520, y - 5, '평문', GOOD, pop(u, 0.4 + i * 0.3), { fs: 13.5 }); });
      card(150, 290, 200, 52, { rx: 10, stroke: WARN, sw: 2, text: 'client_token 원문', fs: 15, s: pop(u, 0.9) });
      grow(252, 290, 400, 290, E(u, 1.2, 1.6), MUT); hmacBox(480, 290, pop(u, 1.4)); grow(558, 290, 600, 290, E(u, 1.8, 2.0), MUT);
      mono(610, 296, '"hmac-sha256:5b1e0c9a..."', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      sub(480, 370, '토큰 원문은 로그에 남지 않는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 2) { pill(110, 140, 'operation: read', INFO, pop(u, 0.2), { mono: true, fs: 15 });
      tx(60, 220, 'path', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.5) });
      cells(120, 196, ['secret', 'data', 'prod', 'db'], { w: 92, h: 40, gap: 10, style: (i) => ({ s: pop(u, 0.6 + i * 0.2), stroke: i === 2 ? BAD : INK, color: i === 2 ? BAD : INK }) });
      tx(60, 300, 'IP', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      mono(120, 300, '"remote_address": "10.0.3.14"', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
      [['누가', 'auth'], ['언제', 'time'], ['어디서', 'IP'], ['무엇을', 'path']].forEach(([a, b], i) => { const y = 140 + i * 50;
        card(800, y, 180, 40, { rx: 20, stroke: ACC, sw: 2, s: pop(u, 1.8 + i * 0.15), text: `${a} · ${b}`, fs: 15, color: ACC }); }); }
    if (k === 3) { [['password', '"hmac-sha256:9f2c7a..."', 150], ['username', '"hmac-sha256:3ad81b..."', 230]].forEach(([f, h, y], i) => {
        card(140, y, 180, 50, { rx: 10, stroke: WARN, sw: 2, text: f + ' 원문', fs: 15, s: pop(u, 0.2 + i * 0.3) });
        grow(232, y, 400, y, E(u, 0.5 + i * 0.3, 0.9 + i * 0.3), MUT); hmacBox(480, y, pop(u, 0.6 + i * 0.3)); grow(558, y, 596, y, E(u, 0.9 + i * 0.3, 1.1 + i * 0.3), MUT);
        mono(604, y + 6, h, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1 + i * 0.3) }); });
      const g = fade(u, 1.8); mono(180, 330, '같은 값', { 'font-size': 15, 'font-weight': 700, opacity: g }); mono(320, 330, '→ 언제나 같은 해시', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: g });
      tx(180, 370, '로그가 새도 평문은 없고, 같은 값인지 비교는 된다', { 'font-size': 15, fill: INK, opacity: fade(u, 2.2) });
      tx(940, 410, '해시 값은 예시', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT }); } }

  // 4. fail-closed 와 이중화
  function s4(t, c) { const { k, u } = c, CY = 200, VX = 300, FY = 110, SY = 290;
    const two = k >= 2, sockDown = k === 3 && u > 0.6, okN = two && !sockDown ? 1 : 0, total = two ? 2 : 1;
    person(70, CY, null, {}); lbl(70, CY + 54, '클라이언트', 1);
    el('line', { x1: 100, y1: CY, x2: VX - 60, y2: CY, stroke: GRID, 'stroke-width': 2.2 });
    server(VX, CY, null, {}); lbl(VX, CY + 62, 'Vault', 1);
    el('line', { x1: VX + 58, y1: CY, x2: 660, y2: FY, stroke: GRID, 'stroke-width': 2.2 });
    doc(700, FY, 5, { w: 50, h: 62, col: BAD, lineCol: BAD }); mono(740, FY - 12, 'file-local', { 'font-size': 15, 'font-weight': 800 });
    const full = k === 0 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: 740, y: FY + 2, width: 170, height: 14, rx: 7, fill: SOFT }); el('rect', { x: 740, y: FY + 2, width: 170 * full, height: 14, rx: 7, fill: BAD });
    mono(740, FY + 38, `디스크 ${Math.round(full * 100)}%`, { 'font-size': 14, 'font-weight': 700, fill: BAD });
    cross(700, FY, 14, k === 0 ? pop(u, 1.4) : 1);
    if (two) { el('line', { x1: VX + 58, y1: CY, x2: 650, y2: SY, stroke: GRID, 'stroke-width': 2.2, opacity: k === 2 ? fade(u, 0.2) : 1 });
      card(700, SY, 90, 56, { rx: 8, sw: 2.5, stroke: sockDown ? BAD : GOOD, text: ':9000', mono: true, fs: 14, s: k === 2 ? pop(u, 0.2) : 1 });
      mono(760, SY - 6, 'socket-siem', { 'font-size': 15, 'font-weight': 800, opacity: k === 2 ? fade(u, 0.4) : 1 });
      mono(760, SY + 18, sockDown ? 'collector 다운' : 'collector 정상', { 'font-size': 14, 'font-weight': 700, fill: sockDown ? BAD : GOOD });
      if (sockDown) cross(700, SY, 14, pop(u, 0.6)); else if (k === 2) check(700, SY + 46, 10, pop(u, 1.3)); }
    // 요청 하나: 클라이언트 → Vault → device 기록 → 응답
    dot([[100, CY], [VX - 60, CY]], seg(u, 0.3, 0.8), ACC, 7);
    dot([[VX + 58, CY], [660, FY]], seg(u, 0.9, 1.4), ACC, 6);
    if (two) dot([[VX + 58, CY], [650, SY]], seg(u, 0.9, 1.4), ACC, 6);
    const pass = okN >= 1;
    pill(VX, 72, `기록 성공 ${okN} / ${total}`, pass ? GOOD : BAD, fade(u, 1.4) > 0 ? 1 + bump(u, 1.4) : 0.001, { mono: true, fs: 15 });
    fly(VX - 60, CY - 56, 150, CY - 56, seg(u, 1.6, 2.3), pass ? '200 OK' : '500 internal error', { stay: true, fill: pass ? GOOD : BAD, mono: true });
    if (k === 1) { card(480, 372, 600, 58, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.4) });
      tx(480, 378, '기록한 device가 하나라도 있으면 처리, 하나도 없으면 거부', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) }); }
    if (k === 0) sub(480, 380, 'device가 하나뿐이면 디스크 하나가 Vault 전체를 세운다', fade(u, 2.3), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    if (k === 2) sub(480, 390, 'file이 죽어도 socket이 기록하니 요청이 흐른다', fade(u, 2.3), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
    if (k === 3) { pill(880, 186, '디스크 알람', WARN, pop(u, 2.0), { fs: 14 }); pill(880, 226, '네트워크 알람', WARN, pop(u, 2.2), { fs: 14 });
      sub(480, 390, '둘 다 실패하면 다시 막힌다. 두 목적지를 모두 감시한다', fade(u, 2.4), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); } }

  // 5. SIEM 으로 모아 분석
  function mini(o) { [['audit.log', 150], ['Fluent Bit', 400], ['OpenSearch', 650]].forEach(([s, x], i) => { pill(x, 34, s, i === 2 ? INFO : INK, 1, { mono: true, fs: 13.5 }); if (i < 2) grow(x + 62, 34, x + 180, 34, 1, MUT); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { doc(120, 170, 5, { name: 'audit.log', s: pop(u, 0.2) });
      card(400, 170, 170, 70, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 0.5) }); mono(400, 166, 'Fluent Bit', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.6) });
      tx(400, 190, 'tail · json 파서', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.7) });
      dbIcon(700, 170, 'OpenSearch (SIEM)', { s: pop(u, 0.8), stroke: INFO });
      grow(160, 170, 312, 170, E(u, 0.6, 1.0), MUT); grow(488, 170, 650, 170, E(u, 1.0, 1.4), MUT);
      for (let i = 0; i < 5; i++) dot([[160, 170], [312, 170], [488, 170], [650, 170]], ((t * 0.5 + i / 5) % 1), ACC, 5);
      sub(480, 320, 'socket device로 수집기에 바로 보내도 된다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    mini();
    if (k === 1) { const X = (h) => 80 + (h / 24) * 800, y0 = 330;
      el('rect', { x: X(0), y: 140, width: X(5) - X(0), height: 190, fill: WARNBG, opacity: fade(u, 0.8) });
      el('line', { x1: X(0), y1: y0, x2: X(24), y2: y0, stroke: MUT, 'stroke-width': 1.8 });
      [0, 6, 12, 18, 24].forEach((h) => mono(X(h), y0 + 22, String(h).padStart(2, '0') + ':00', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }));
      for (let i = 0; i < 46; i++) { const h = hash(i) * 24, prod = i % 6 === 0, inWin = h < 5, hot = prod && inWin && u > 1.2;
        el('circle', { cx: X(h), cy: y0 - 20 - hash(i + 99) * 160, r: hot ? 7 : 4.5, fill: hot ? BAD : prod ? INK : OFF, opacity: fade(u, 0.1 + i * 0.012) }); }
      mono(480, 96, 'path:"secret/data/prod/*" AND operation:"read" AND 00:00~05:00', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
      tx(940, 410, '점은 예시 이벤트', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT }); }
    if (k === 2) { const H = [8, 12, 6, 10, 9, 14, 11, 7, 63, 72, 12, 9], base = 340, sc = 2.6, th = 50;
      H.forEach((v, i) => { const g = E(u, 0.1 + i * 0.08, 0.6 + i * 0.08), over = v > th;
        el('rect', { x: 120 + i * 60, y: base - v * sc * g, width: 40, height: v * sc * g, rx: 4, fill: over ? BAD : OFF }); });
      el('line', { x1: 100, y1: base - th * sc, x2: 840, y2: base - th * sc, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.9) });
      mono(850, base - th * sc + 5, '> 50 / 1m', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0) });
      el('line', { x1: 100, y1: base, x2: 840, y2: base, stroke: MUT, 'stroke-width': 1.8 }); tx(470, base + 26, '분당 실패 응답 수 (막대는 예시)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      pill(640, 100, 'brute force 의심 알림', BAD, pop(u, 1.8), { fs: 15 }); }
    if (k === 3) { card(150, 220, 220, 92, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 0.2) });
      mono(150, 210, 'sys/audit-hash', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      tx(150, 238, 'input = 유출된 값', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.4) });
      grow(262, 220, 340, 220, E(u, 0.6, 1.0), MUT);
      pill(470, 220, 'hmac-sha256:9f2c7a...', ACC, pop(u, 1.0), { mono: true, fs: 15 });
      [['approle-app · read', 120], ['토큰 B · read', 220], ['토큰 C · read', 320]].forEach(([s, y], i) => { const g = E(u, 1.3 + i * 0.3, 1.8 + i * 0.3);
        grow(600, 220, 680, y, g, ACC, { plain: true }); card(790, y, 210, 44, { rx: 8, stroke: ACC, sw: 2, text: s, fs: 14.5, mono: true, s: g >= 1 ? 1 : g }); });
      sub(470, 290, '그 값을 본 요청 전부', fade(u, 2.3), { 'font-size': 15, 'font-weight': 700, fill: ACC }); sub(470, 314, '평문 없이 묶는다', fade(u, 2.3), { 'font-size': 15, fill: INK }); }
    if (k === 4) { [['남기기', 'audit device'], ['모으기', 'SIEM'], ['분석', '탐지 규칙']].forEach(([a, b], i) => { const x = 180 + i * 300, s = pop(u, 0.2 + i * 0.4);
        card(x, 200, 220, 96, { rx: 12, stroke: ACC, sw: 2.5, s }); if (s > 0.3) { tx(x, 194, a, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800 }); mono(x, 222, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT }); }
        check(x + 86, 166, 10, pop(u, 0.6 + i * 0.4)); if (i < 2) grow(x + 112, 200, x + 186, 200, E(u, 0.5 + i * 0.4, 0.8 + i * 0.4), ACC); });
      banner(480, 340, '세 박자가 갖춰져야 접근 이력 보고(PCI · ISO)를 낸다', pop(u, 1.8)); } }

  const quiz = [
    { q: 'audit device가 하나도 없는 Vault에서 유출 사고가 났을 때 답할 수 없는 것은 무엇인가?',
      o: ['누가 언제 어떤 토큰으로 그 시크릿을 읽었는지', '유출된 시크릿이 들어 있던 경로 이름', '지금 켜진 Vault 노드 수'], a: 0,
      why: 'vault audit list가 "No audit devices are enabled."면 요청은 처리돼도 흔적이 남지 않는다. Q1~Q3 모두 "모른다"가 된다.' },
    { q: '세 audit device 중 원격 수집기로 TCP/UDP 스트리밍을 하는 것은 무엇인가?',
      o: ['file', 'syslog', 'socket'], a: 2,
      why: 'socket device는 collector.internal:9000 같은 원격 주소로 실시간 보낸다. 로컬 디스크와 함께 죽지 않는 목적지다.' },
    { q: '감사 로그에서 response.data.password가 남는 모양은 무엇인가?',
      o: ['평문 그대로', 'hmac-sha256:로 시작하는 해시', '필드째 빠진다'], a: 1,
      why: '토큰과 시크릿 값 같은 문자열은 HMAC-SHA256으로 해시돼 남는다. 같은 값은 같은 해시가 되어 비교만 할 수 있다.' },
    { q: 'file-local과 socket-siem 중 file-local만 디스크가 꽉 차 실패했을 때 요청의 결과는 무엇인가?',
      o: ['socket-siem이 기록했으니 요청은 처리된다', '하나라도 실패했으니 500으로 거부된다', 'Vault가 file-local을 스스로 끈다'], a: 0,
      why: 'Vault는 적어도 하나의 device에 기록되면 응답한다. 기록한 device가 0개일 때만 요청을 막는다.' },
    { q: 'SIEM에서 HMAC 해시로 할 수 있는 일은 무엇인가?',
      o: ['해시를 풀어 비밀번호 평문을 얻는다', '같은 값을 읽은 요청을 평문 없이 묶어 찾는다', '해시로 새 토큰을 발급한다'], a: 1,
      why: '같은 시크릿의 해시는 늘 같다. sys/audit-hash로 아는 값의 해시를 구해 검색하면 그 값을 본 요청이 모인다.' },
  ];

  const summary = [
    'audit device가 없으면 시크릿이 새도 누가 언제 어떤 토큰으로 읽었는지 답할 수 없다.',
    'audit enable로 file, syslog, socket을 켜고, file은 logrotate 뒤 SIGHUP으로 다시 연다.',
    '로그 한 줄에 time, auth, request, response가 남고 토큰과 시크릿 값은 HMAC 해시로만 남는다.',
    '기록한 device가 하나도 없으면 요청이 거부되므로 목적지가 다른 device 2개를 켜고 둘 다 감시한다.',
  ];
  const review = [
    { q: 'file device 하나만 켠 Vault가 갑자기 모든 요청에 500을 낸다. 먼저 볼 것은?',
      o: ['감사 로그가 쌓이는 디스크가 꽉 찼는지', '정책에서 read 권한이 빠졌는지', 'HMAC 해시 형식이 바뀌었는지'], a: 0,
      why: '기록할 device가 하나도 없으면 Vault는 요청을 거부한다. 하나뿐인 file device의 디스크가 차면 모든 요청이 막힌다.' },
    { q: 'logrotate로 audit.log를 돌렸더니 새 audit.log가 계속 비어 있다. 빠진 것은?',
      o: ['socket device 추가', '회전 뒤 Vault에 SIGHUP 보내기', 'policies 필드 평문 저장'], a: 1,
      why: 'Vault는 SIGHUP을 받아야 파일을 닫고 다시 연다. 그 전까지는 이름이 바뀐 audit.log.1에 계속 쓴다.' },
    { q: '유출된 DB 비밀번호를 누가 읽었는지 SIEM에서 찾으려 한다. 검색어로 쓸 것은?',
      o: ['평문 비밀번호 문자열', 'display_name 목록 전체', 'sys/audit-hash로 구한 그 값의 해시'], a: 2,
      why: '로그에는 평문이 없고 hmac-sha256 해시만 있다. 같은 키로 구한 해시로 검색해야 그 값을 본 요청이 걸린다.' },
  ];

  R.page({ title: '감사 로그', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
