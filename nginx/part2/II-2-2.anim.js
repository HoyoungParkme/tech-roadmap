/* II-2-2 타임아웃·버퍼·재시도 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 504/502 구분은 nginx 소스(ngx_http_upstream_next: 시간 초과 → 504, 그 밖의 오류 → 502)로 확인했다.
 * 재시도 최악 대기 70초는 tries 3 · next_upstream_timeout 30s · connect 5s · read 60s 로 경우를 모두 돌려 계산한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, redisBox, person, browser, cross, check, lock, clock, terminal, snippet, spans, cells, axes, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const nginx = (cx, cy, sub, o) => redisBox(cx, cy, Object.assign({ name: 'Nginx', sub }, o || {}));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const msg = (x1, x2, y, u, label, col, o) => { o = o || {}; grow(x1, y, x2, y, u, col || MUT, { sw: 2.4, dash: o.dash });
    if (label && u > 0.3) tx((x1 + x2) / 2, y - 8, label, { 'font-size': 13.5, 'text-anchor': 'middle', class: 'mono', 'font-weight': 700, fill: col || INK, opacity: clamp(u * 2 - 0.6) }); };
  // 초 단위 막대 축 (x0 ~ x0+w 가 0 ~ max 초)
  function secAxis(x0, y, w, max, ticks) { el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: MUT, 'stroke-width': 1.8 });
    ticks.forEach((v) => { const x = x0 + w * v / max; el('line', { x1: x, y1: y, x2: x, y2: y + 5, stroke: MUT }); mono(x, y + 21, v + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    return (v) => x0 + w * v / max; }

  // ---------- 1. proxy_connect_timeout ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { nginx(150, 150, 'connect'); server(800, 142, '백엔드', {});
      msg(214, 744, 150, E(u, 0.2, 1.0), 'SYN', INK);
      const v = Math.round(lerp(60, 5, E(u, 0.8, 2.0)));
      clock(480, 270, 46, v / 60, WARN); mono(480, 352, 'proxy_connect_timeout ' + v + 's', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: v === 5 ? ACC : WARN });
      sub(480, 380, '기본 60s → 5s', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { const rows = [['백엔드 무응답', 190, false], ['포트 닫힘', 320, true]];
      rows.forEach(([name, y, rst], i) => { nginx(110, y, null, { w: 110, h: 50 }); server(820, y - 6, null, { s: 0.7, stroke: rst ? INK : OFF });
        tx(60, y - 50, name, { 'font-size': 14.5, 'font-weight': 700 });
        msg(170, 770, y - 10, E(u, 0.1 + i * 0.2, 0.7 + i * 0.2), 'SYN', INK);
        if (rst) { msg(770, 170, y + 18, E(u, 0.9, 1.3), 'RST', BAD); pill(470, y + 52, '바로 502 Bad Gateway', BAD, pop(u, 1.4), { mono: true, fs: 13.5 }); }
        else { const f = E(u, 0.7, 2.3); clock(470, y + 34, 18, f, WARN); mono(500, y + 40, (5 * f).toFixed(1) + 's', { 'font-size': 14, 'font-weight': 700, fill: WARN });
          if (f >= 1) pill(650, y + 34, '504 Gateway Time-out', BAD, pop(u, 2.3), { mono: true, fs: 13.5 }); } });
      return; }
    if (k === 2) { nginx(150, 130, '60s 대기'); server(800, 122, '백엔드 장애', { stroke: BAD, lamp: BAD });
      const n = Math.round(lerp(1, 14, E(u, 0.2, 2.2)));
      for (let i = 0; i < n; i++) el('circle', { cx: 230 + (i % 7) * 30, cy: 200 + Math.floor(i / 7) * 30, r: 9, fill: WARN, opacity: 0.85 });
      tx(230, 280, '60초 동안 물려 있는 연결', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
      tx(60, 330, 'worker_connections', { 'font-size': 14, 'font-weight': 700, class: 'mono' });
      hbar(260, 316, 520, n, 14, { col: n > 11 ? BAD : WARN, label: false, h: 20 });
      note(60, 390, '장애가 한 요청에서 끝나지 않고 서버 전체로 번진다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 3) { nginx(150, 130, 'connect 1s'); server(800, 122, '콜드 스타트', { lamp: WARN });
      const T = secAxis(150, 300, 640, 3, [0, 1, 2, 3]);
      const a = E(u, 0.2, 2.4); el('rect', { x: 150, y: 250, width: (T(1) - 150) * clamp(a * 3), height: 22, rx: 4, fill: WARN, opacity: 0.85 });
      tx(150, 240, 'connect 타이머 1s', { 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
      if (a > 0.34) { pill(T(1) + 10, 214, '504 (정상 요청인데)', BAD, pop(u, 1.1), { mono: true, fs: 13.5 }); }
      tx(T(3), 240, '백엔드가 늦게 깨어나 응답', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      el('circle', { cx: T(1.8), cy: 261, r: 8, fill: GOOD, opacity: fade(u, 1.8) });
      note(60, 380, '줄이는 목적은 빨리 포기하기지, 멀쩡한 요청을 끊는 것이 아니다', fade(u, 2.2)); return; }
    if (k === 4) { const T = secAxis(260, 360, 620, 10, [0, 1, 3, 5, 10]);
      [['같은 LAN · 도커', 1, 3], ['다른 데이터센터', 3, 5], ['인터넷 외부 API', 5, 10]].forEach(([n, a, b], i) => { const y = 90 + i * 80, g = E(u, 0.2 + i * 0.4, 0.9 + i * 0.4);
        tx(40, y + 16, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) });
        el('rect', { x: T(a), y, width: (T(b) - T(a)) * g, height: 26, rx: 5, fill: ACC, opacity: 0.85 });
        mono(T(b) + 8, y + 18, a + '~' + b + 's', { 'font-size': 14, 'font-weight': 700, opacity: g }); });
      sub(480, 408, '기준은 왕복 시간(RTT)이다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    // k5 75초 상한
    const T = secAxis(80, 250, 800, 120, [0, 5, 30, 60, 75, 120]);
    el('rect', { x: T(75), y: 200, width: T(120) - T(75), height: 40, rx: 4, fill: SOFT, stroke: GRID, 'stroke-dasharray': '5 5' });
    tx((T(75) + T(120)) / 2, 226, '적어도 효과 없음', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8) });
    el('rect', { x: T(1), y: 200, width: (T(5) - T(1)) * E(u, 0.3, 1.0), height: 40, rx: 4, fill: ACC });
    tx(T(1), 186, '실무 1~5s', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
    note(80, 340, '공식 문서: 이 값은 보통 75초를 넘을 수 없다', fade(u, 1.4)); }

  // ---------- 2. proxy_read_timeout ----------
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { tx(40, 46, k === 0 ? '백엔드 → Nginx 응답 패킷' : '패킷 사이 공백만 잰다', { 'font-size': 15, 'font-weight': 700 });
      const T = secAxis(60, 200, 840, 150, [0, 30, 60, 90, 120, 150]);
      const pk = k === 0 ? [0, 20, 45, 70, 100, 130] : [0, 10, 20, 30, 40, 50];
      pk.forEach((s, i) => { if (u * 60 >= s * 0.4) el('rect', { x: T(s) - 4, y: 110, width: 8, height: 50, rx: 2, fill: ACC }); });
      // 타이머 톱니: 패킷마다 0 으로
      const now = Math.min(150, u * 60), pts = []; let last = 0;
      for (let s = 0; s <= now; s += 1) { if (pk.some((p) => Math.abs(p - s) < 0.5)) last = s; pts.push([T(s), 190 - Math.min(60, s - last) * 1.2]); }
      if (pts.length > 1) el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: WARN, 'stroke-width': 2.4 });
      el('line', { x1: 60, y1: 118, x2: 900, y2: 118, stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '5 5', opacity: 0.6 });
      tx(900, 112, '60s 공백', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end' });
      if (k === 1) { const cut = 50 + 60; if (now >= cut) { cross(T(cut), 150, 11, pop(u, cut / 60)); pill(T(cut), 260, '504 Gateway Time-out', BAD, pop(u, cut / 60 + 0.1), { mono: true, fs: 13.5 }); }
        note(60, 320, '1초마다 한 줄 보내는 SSE는 한 시간이 걸려도 안 끊긴다', fade(u, 0.4), { 'font-size': 14.5 }); }
      else note(60, 320, '공백이 60초를 넘지 않으면 계속 받는다', fade(u, 1.6), { 'font-size': 14.5 });
      tx(60, 246, '주황 선 = 마지막 패킷 뒤 흐른 시간', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 0.5) }); return; }
    if (k === 2) { tx(40, 46, '용도별 proxy_read_timeout (로그 눈금)', { 'font-size': 15, 'font-weight': 700 });
      const L = (v) => 280 + 600 * Math.log10(v / 10) / Math.log10(3600 / 10);
      [['일반 REST', 30, 60], ['무거운 리포트', 300, 300], ['LLM 스트리밍', 600, 600], ['WebSocket · SSE', 3600, 3600]].forEach(([n, a, b], i) => { const y = 90 + i * 66, g = E(u, 0.2 + i * 0.35, 0.9 + i * 0.35);
        tx(40, y + 18, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.35) });
        el('rect', { x: 280, y, width: (L(b) - 280) * g + 6, height: 26, rx: 5, fill: i === 0 ? ACC : i === 3 ? INFO : WARN, opacity: 0.85 });
        mono(Math.min(L(b) * 1, 880) + 12 - (i === 3 ? 120 : 0), y + 18, (a === b ? a : a + '~' + b) + 's', { 'font-size': 14, 'font-weight': 700, fill: i === 3 ? PANEL : INK, opacity: g }); });
      note(40, 380, 'LLM은 총 시간이 아니라 토큰 사이 간격만 보면 된다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { browser(90, 160, 110, 80, '클라이언트'); nginx(450, 160, null); server(820, 152, '백엔드', {});
      grow(148, 160, 386, 160, 1, GRID, { plain: true, sw: 2.5 }); grow(514, 160, 762, 160, 1, GRID, { plain: true, sw: 2.5 });
      pill(267, 120, 'keepalive_timeout 75s', INFO, pop(u, 0.3), { mono: true, fs: 13.5 }); sub(267, 214, '클라이언트 구간 (기본 75s)', fade(u, 0.5));
      ['proxy_connect 5s', 'proxy_send 60s', 'proxy_read 60s'].forEach((s, i) => pill(638, 250 + i * 40, s, ACC, pop(u, 0.8 + i * 0.3), { mono: true, fs: 13.5 }));
      sub(638, 214, '백엔드 구간', fade(u, 0.8));
      note(40, 380, 'proxy_가 붙으면 백엔드 쪽이다', fade(u, 2.0)); return; }
    // k4 무거운 경로만
    [['location /api/', '60s', ACC], ['location /api/heavy-report', '300s', WARN]].forEach(([n, v, col], i) => { const y = 110 + i * 110, g = E(u, 0.2 + i * 0.6, 1.0 + i * 0.6);
      mono(40, y, n, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1 + i * 0.6) });
      el('rect', { x: 40, y: y + 16, width: 800 * (i ? 1 : 0.2) * g, height: 26, rx: 5, fill: col, opacity: 0.85 });
      mono(40 + 800 * (i ? 1 : 0.2) * g + 10, y + 35, v, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: g }); });
    note(40, 360, '한 경로 때문에 전체를 늘리면 장애 감지가 늦어진다', fade(u, 2.0)); }

  // ---------- 3. 업로드와 네 방향 ----------
  const DIR = [['client_body_timeout', '클라 → Nginx', 1, 0], ['proxy_send_timeout', 'Nginx → 백엔드', 1, 1], ['proxy_read_timeout', '백엔드 → Nginx', -1, 1], ['send_timeout', 'Nginx → 클라', -1, 0]];
  function lanes(o) { o = o || {}; browser(90, 150, 110, 80, '클라이언트'); nginx(470, 150, o.sub || '/upload'); server(840, 142, '백엔드', {}); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { lanes(); grow(148, 150, 406, 150, 1, GRID, { plain: true, sw: 2.5 }); grow(534, 150, 782, 150, 1, GRID, { plain: true, sw: 2.5 });
      tx(60, 280, 'client_max_body_size', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      const g = E(u, 0.4, 1.8); hbar(280, 266, 520, 500 * g, 500, { col: ACC, h: 22, text: Math.round(1 + 499 * g) + 'm' });
      mono(280, 312, '기본 1m', { 'font-size': 13.5, fill: MUT }); mono(800, 312, '500m', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end' });
      note(60, 380, '크기 상한과 타임아웃은 세트다', fade(u, 2.0)); return; }
    if (k === 1 || k === 2) { lanes();
      const show = k === 1 ? DIR.slice(0, 3) : DIR;
      show.forEach(([n, d, dir, side], i) => { const y = dir > 0 ? 128 - (i === 1 ? 0 : 0) : 176, x1 = side ? 534 : 148, x2 = side ? 782 : 406;
        const a = E(u, 0.2 + i * 0.4, 0.8 + i * 0.4), yy = dir > 0 ? 128 : 176;
        msg(dir > 0 ? x1 : x2, dir > 0 ? x2 : x1, yy, a, null, dir > 0 ? ACC : INFO);
        const ly = 262 + i * 36; mono(60, ly, n, { 'font-size': 14.5, 'font-weight': 800, fill: dir > 0 ? ACC : INFO, opacity: fade(u, 0.4 + i * 0.4) });
        tx(330, ly, d, { 'font-size': 14.5, opacity: fade(u, 0.5 + i * 0.4) });
        if (k === 1) mono(520, ly, '300s', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.4) }); });
      if (k === 2) note(560, 330, 'proxy_가 붙으면 백엔드 쪽', fade(u, 2.0), { 'font-size': 14.5 });
      return; }
    if (k === 3) { lanes({ sub: '500MB 업로드' });
      const ST = [['1 업로드 시작', null], ['2 Nginx가 body 받기', 'client_body_timeout'], ['3 다 받은 뒤 백엔드로', 'proxy_send_timeout'], ['4 백엔드 응답', 'proxy_read_timeout'], ['5 클라로 응답', 'send_timeout']];
      const cur = Math.min(4, Math.floor(E(u, 0.1, 2.5) * 5));
      ST.forEach(([s, tmo], i) => { const y = 236 + i * 34, on = i === cur, done = i < cur;
        el('rect', { x: 50, y: y - 20, width: 860, height: 30, rx: 6, fill: on ? ACCBG : 'none' });
        tx(64, y, s, { 'font-size': 14.5, 'font-weight': on ? 800 : 500, fill: done ? MUT : INK });
        if (tmo) mono(890, y, tmo, { 'font-size': 14, 'text-anchor': 'end', fill: on ? ACC : MUT, 'font-weight': 700 }); });
      const pos = [[148, 406], [148, 406], [534, 782], [782, 534], [406, 148]][cur]; dot([[pos[0], 150], [pos[1], 150]], (u * 1.7) % 1, ACC, 7); return; }
    if (k === 4) { [['일반 JSON POST', 30, 60, ACC], ['파일 업로드', 300, 300, WARN]].forEach(([n, a, b, col], i) => { const y = 110 + i * 100, g = E(u, 0.2 + i * 0.6, 1.0 + i * 0.6);
        tx(40, y, n, { 'font-size': 16, 'font-weight': 800 }); el('rect', { x: 40, y: y + 16, width: 700 * b / 300 * g, height: 26, rx: 5, fill: col, opacity: 0.85 });
        mono(40 + 700 * b / 300 * g + 10, y + 35, (a === b ? a + 's 이상' : a + '~' + b + 's'), { 'font-size': 15, 'font-weight': 800, fill: col, opacity: g }); });
      note(40, 360, '작은 POST까지 300초를 주면 느린 백엔드를 알아채지 못한다', fade(u, 2.0)); return; }
    // k5 413
    lanes(); grow(148, 150, 406, 150, 1, GRID, { plain: true, sw: 2.5 });
    fly(148, 110, 406, 110, seg(u, 0.2, 1.0), '본문 > 500m', { fill: WARN, stay: u < 1.2 });
    if (u > 1.1) { msg(406, 148, 196, E(u, 1.1, 1.6), '413 Payload Too Large', BAD); }
    note(60, 300, '타이머가 돌기도 전에 크기 검사에서 바로 거절된다', fade(u, 1.8), { fill: BAD });
    note(60, 330, '즉시 실패면 타임아웃보다 client_max_body_size를 먼저 본다', fade(u, 2.1), { 'font-size': 14.5 }); }

  // ---------- 4. proxy_buffers ----------
  function bufRow(x, y, fill, o) { o = o || {};
    card(x - 70, y + 22, 92, 44, { rx: 6, text: '4K', mono: true, fs: 14, stroke: INFO, color: INFO }); tx(x - 70, y + 64, '헤더', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    for (let i = 0; i < 8; i++) { const f = clamp(fill - i); el('rect', { x: x + i * 62, y, width: 56, height: 44, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 });
      if (f > 0) el('rect', { x: x + i * 62, y: y + 44 * (1 - f), width: 56, height: 44 * f, rx: 6, fill: ACC, opacity: 0.8 });
      mono(x + i * 62 + 28, y + 28, '4K', { 'font-size': 14, 'text-anchor': 'middle', fill: f > 0.6 ? PANEL : INK }); }
    tx(x, y + 64, '본문 버퍼 8 × 4K = 32KB', { 'font-size': 13.5, fill: MUT }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { tx(40, 50, 'proxy_buffering on (기본)', { 'font-size': 15, 'font-weight': 700 });
      bufRow(190, 90, k === 0 ? 8 * E(u, 0.4, 2.2) : 8);
      if (k === 0) { note(40, 260, '백엔드 응답을 일단 메모리에 받아 둔다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      // 넘치면 디스크
      const g = E(u, 0.3, 2.0); for (let i = 0; i < 5; i++) dot([[680, 112], [760, 112], [800, 250]], ((t * 0.9 + i / 5) % 1) * (g > 0 ? 1 : 0), WARN, 6);
      R.dbIcon(800, 280, 'temp 파일 (최대 1024m)', { stroke: WARN });
      note(40, 260, '32KB를 넘는 응답은 디스크로 흘린다', fade(u, 1.2), { 'font-size': 14.5 });
      note(40, 290, '디스크로 가면 느려진다. 버퍼 크기부터 맞춘다', fade(u, 1.8), { 'font-size': 14.5, fill: WARN }); return; }
    if (k === 2) { tx(40, 46, '느린 클라이언트에게 큰 응답을 보낼 때', { 'font-size': 15, 'font-weight': 700 });
      const T = secAxis(240, 320, 640, 10, [0, 2, 4, 6, 8, 10]), g = E(u, 0.2, 2.2);
      [['버퍼링 on', 1, GOOD], ['버퍼링 off', 10, BAD]].forEach(([n, busy, col], i) => { const y = 110 + i * 100;
        tx(40, y + 16, n, { 'font-size': 15, 'font-weight': 800, fill: col });
        tx(40, y + 40, '백엔드 worker 점유', { 'font-size': 13.5, fill: MUT });
        el('rect', { x: 240, y, width: (T(busy) - 240) * clamp(g * 10 / busy), height: 26, rx: 5, fill: col, opacity: 0.85 });
        el('rect', { x: 240, y: y + 32, width: (T(10) - 240) * g, height: 10, rx: 3, fill: OFF }); });
      tx(880, 104, '회색 = 클라이언트로 전송', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.8) });
      note(40, 390, '목적은 속도가 아니라 백엔드 동시성 보호다 (시간 눈금은 예시)', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { tx(40, 46, 'location /stream: buffering off', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      [['on이면', 0], ['off면', 1]].forEach(([n, off], i) => { const y = 130 + i * 130; tx(40, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: off ? GOOD : BAD });
        server(200, y - 8, null, { s: 0.6 }); nginx(500, y, null, { w: 110, h: 50 }); browser(820, y, 100, 64, null);
        for (let j = 0; j < 6; j++) { const tt = (t * 0.6 + j / 6) % 1;
          if (off) dot([[240, y], [770, y]], tt, ACC, 6);
          else dot([[240, y], [460, y]], tt, ACC, 6); }
        if (!off) { mono(700, y - 30, '…아무것도 안 온다', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); }
        else mono(700, y - 30, '토큰이 생기는 즉시', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); });
      note(40, 400, 'SSE·LLM 스트리밍은 버퍼링을 끈다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k4 X-Accel-Buffering
    server(160, 160, '백엔드', {}); nginx(500, 160, 'buffering on'); browser(820, 160, 110, 80, '클라이언트');
    fly(220, 110, 440, 110, seg(u, 0.2, 1.2), 'X-Accel-Buffering: no', { mono: true, fill: INFO, stay: true });
    pill(500, 230, '이 응답만 버퍼링 off', GOOD, pop(u, 1.4), { fs: 14 });
    for (let j = 0; j < 4; j++) if (u > 1.6) dot([[220, 160], [760, 160]], ((t * 0.6 + j / 4) % 1), ACC, 6);
    note(40, 330, 'location을 나누기 애매하면 백엔드가 헤더 하나로 정한다', fade(u, 2.0)); }

  // ---------- 5. proxy_next_upstream ----------
  const NODES = [['app1', 160], ['app2', 220], ['app3', 280]];
  function pool(o) { o = o || {}; el('rect', { x: 560, y: 110, width: 380, height: 220, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(576, 134, 'upstream backend', { 'font-size': 14, 'font-weight': 800, fill: ACC });
    NODES.forEach(([n, y], i) => { const st = (o.st && o.st[i]) || {}; card(660, y + 6, 160, 40, { rx: 8, text: n + ':8000', mono: true, fs: 14, stroke: st.col || INK, color: st.col || INK, op: st.op ?? 1, dash: st.dash });
      if (st.tag) mono(760, y + 11, st.tag, { 'font-size': 14, 'font-weight': 800, fill: st.col || INK }); });
    tx(576, 318, 'max_fails=3 fail_timeout=10s', { 'font-size': 13.5, class: 'mono', fill: MUT }); }
  function s5(t, c) { const { k, u } = c;
    if (k !== 2) { nginx(330, 220, 'next_upstream'); browser(90, 220, 100, 70, null); }
    if (k === 0) { pool({ st: NODES.map((_, i) => ({ op: pop(u, 0.3 + i * 0.3) })) }); grow(140, 220, 266, 220, 1, GRID, { plain: true });
      note(40, 380, '10초 안에 3번 실패하면 10초 동안 뺀다', fade(u, 1.6)); return; }
    if (k === 1) { const a1 = seg(u, 0.2, 0.8), a2 = seg(u, 1.0, 1.6);
      pool({ st: [{ col: u > 0.8 ? BAD : INK, tag: u > 0.8 ? 'error' : '' }, { col: u > 1.6 ? GOOD : INK, tag: u > 1.6 ? '200' : '' }, {}] });
      dot([[394, 220], [580, 166]], a1, ACC, 7); dot([[394, 220], [580, 226]], a2, ACC, 7);
      ['error', 'timeout', 'http_502', 'http_503', 'http_504'].forEach((s, i) => pill(80 + i * 98, 60, s, ACC, pop(u, 0.2 + i * 0.12), { mono: true, fs: 13.5 }));
      mono(40, 110, 'tries 3 · next_upstream_timeout 30s', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.9) });
      note(40, 380, '사용자는 실패를 모른 채 app2의 200을 받는다', fade(u, 2.0)); return; }
    if (k === 2) { tx(40, 46, '최악의 대기 (계산)', { 'font-size': 15, 'font-weight': 700 });
      const T = secAxis(60, 350, 860, 80, [0, 5, 10, 30, 70, 80]), segs = [['app1 connect', 0, 5, WARN], ['app2 connect', 5, 10, WARN], ['app3 read', 10, 70, BAD]];
      segs.forEach(([n, a, b, col], i) => { const g = E(u, 0.2 + i * 0.4, 0.8 + i * 0.6), y = 280 - i * 0;
        el('rect', { x: T(a), y: 290, width: Math.max(0, (T(b) - T(a)) * g - 2), height: 30, rx: 4, fill: col, opacity: 0.85 });
        if (g > 0.9 && i === 2) tx((T(a) + T(b)) / 2, 278, n, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col }); });
      tx(T(0), 250, 'app1 · app2 connect 5s씩', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      el('line', { x1: T(30), y1: 140, x2: T(30), y2: 336, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
      tx(T(30) + 8, 150, '30s: 이후로는 새 노드로 안 넘긴다', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(T(30) + 8, 172, '진행 중인 시도는 끊지 않는다', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 1.6) });
      mono(T(70), 110, '5 + 5 + 60 = 70s', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.2) }); return; }
    if (k === 3) { pool();
      [['error · timeout · invalid_header', INK], ['http_500 / 502 / 503 / 504 / 429', INK], ['non_idempotent  (POST도 재시도)', BAD], ['off  (재시도 안 함)', MUT]].forEach(([s, col], i) => {
        mono(40, 60 + i * 34, s, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.35) }); });
      note(40, 370, 'http_429를 넣으면 rate limit 맞은 요청이 다른 노드로 번진다', fade(u, 1.8), { 'font-size': 14.5, fill: WARN }); return; }
    if (k === 4) { pool({ st: [{ col: WARN, tag: '처리 완료' }, { col: BAD, dash: '6 5', tag: '중복?' }, {}] });
      pill(330, 140, 'POST /pay', INK, 1, { mono: true, fs: 14 });
      dot([[394, 220], [580, 166]], seg(u, 0.2, 0.8), ACC, 7);
      if (u > 0.9) msg(580, 394, 190, E(u, 0.9, 1.4), '504', BAD);
      if (u > 1.5) { dot([[394, 220], [580, 226]], seg(u, 1.5, 2.0), BAD, 7); cross(520, 214, 10, pop(u, 2.0)); }
      note(40, 340, '응답만 늦었을 뿐 결제는 끝났을 수 있다', fade(u, 1.0), { 'font-size': 14.5 });
      note(40, 370, '기본값: 이미 보낸 POST는 다음 노드로 넘기지 않는다', fade(u, 2.1), { 'font-size': 14.5, fill: GOOD }); return; }
    // k5 passive health check
    const n = Math.min(3, Math.floor(E(u, 0.2, 1.4) * 3.99)), out = n >= 3;
    pool({ st: [{ col: out ? OFF : BAD, op: out ? 0.5 : 1, tag: out ? '제외' : n + '/3', dash: out ? '6 5' : null }, { col: GOOD }, { col: GOOD }] });
    for (let i = 0; i < n; i++) cross(500 + i * 20, 166, 7, 1);
    if (out) { clock(510, 260, 18, E(u, 1.5, 2.8), WARN); mono(486, 300, '10s 쉬기', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', 'font-weight': 700 }); }
    note(40, 370, '실패 횟수만으로 노드를 잠시 뺀다. 요청이 흘러야 갱신된다', fade(u, 2.0), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'proxy_connect_timeout 5s 동안 백엔드에서 SYN-ACK이 오지 않으면 클라이언트가 받는 상태 코드는 무엇인가?',
      o: ['502 Bad Gateway', '504 Gateway Time-out', '503 Service Unavailable'], a: 1,
      why: 'Nginx는 시간 초과를 504로 돌려준다. 포트가 닫혀 RST가 바로 오면 기다리지 않고 502다.' },
    { q: 'proxy_read_timeout 60s가 재는 것은 무엇인가?',
      o: ['응답 전체가 끝나기까지 걸린 시간', '백엔드 응답 패킷과 패킷 사이의 공백', '클라이언트가 요청을 보내는 시간'], a: 1,
      why: '두 번의 읽기 사이 공백만 잰다. 1초마다 한 줄 보내는 SSE는 한 시간이 걸려도 끊기지 않는다.' },
    { q: 'Nginx가 백엔드로 요청 본문을 보내는 동안의 공백을 재는 지시자는 무엇인가?',
      o: ['send_timeout', 'client_body_timeout', 'proxy_send_timeout'], a: 2,
      why: 'proxy_가 붙으면 백엔드 쪽이다. 이름이 비슷한 send_timeout은 Nginx에서 클라이언트로 보낼 때다.' },
    { q: 'LLM 토큰 스트리밍 경로에서 proxy_buffering을 켜 두면 어떻게 보이는가?',
      o: ['토큰이 버퍼에 고여 한동안 아무것도 안 오는 것처럼 보인다', '토큰이 더 빨리 도착한다', '백엔드 연결이 끊긴다'], a: 0,
      why: '버퍼링은 응답을 모아 두었다 보낸다. 즉시성이 필요한 /stream은 off로 두거나 X-Accel-Buffering: no를 보낸다.' },
    { q: '기본 설정에서 결제 POST가 app1로 전송된 뒤 시간 초과가 났다. Nginx는 어떻게 하는가?',
      o: ['app2로 같은 POST를 다시 보낸다', '다음 노드로 넘기지 않고 오류를 돌려준다', 'GET으로 바꿔 다시 보낸다'], a: 1,
      why: '이미 보낸 POST·LOCK·PATCH는 non_idempotent를 켜지 않으면 다음 노드로 넘기지 않는다. 중복 결제를 막기 위해서다.' },
  ];

  const summary = [
    '백엔드가 죽으면 connect 기본 60초 동안 연결이 쌓이니 5초쯤으로 줄인다.',
    '연결 거부는 502, 연결이나 응답의 시간 초과는 504로 돌아온다.',
    'read와 send 타임아웃은 패킷 사이 공백을 재므로 용도와 경로별로 따로 잡는다.',
    '스트리밍 경로는 버퍼링을 끄고, 재시도는 횟수와 시간 상한을 함께 둔다.',
  ];
  const review = [
    { q: '리포트 API만 가끔 504가 나서 전체 proxy_read_timeout을 300s로 올리려 한다. 더 나은 방법은?',
      o: ['/api/heavy-report location에만 300s를 준다', 'proxy_connect_timeout을 300s로 올린다', 'proxy_buffering을 끈다'], a: 0,
      why: '전체를 늘리면 다른 경로의 장애 감지도 늦어진다. 무거운 경로만 따로 떼어 300초를 준다.' },
    { q: '500MB 업로드가 시작하자마자 실패한다. 로그에는 413이 찍혔다. 먼저 고칠 것은?',
      o: ['proxy_send_timeout을 늘린다', 'client_max_body_size를 올린다', 'proxy_next_upstream에 http_413을 넣는다'], a: 1,
      why: '413은 크기 상한에 걸린 것이라 타이머와 무관하다. client_max_body_size를 업로드 크기에 맞춘다.' },
    { q: 'tries 3, next_upstream_timeout 30s, connect 5s, read 60s일 때 사용자가 70초를 기다렸다. 왜인가?',
      o: ['30s 상한이 고장 나서', 'keepalive가 꺼져서', '30초 전에 시작한 세 번째 시도가 read 60초를 다 썼다'], a: 2,
      why: 'next_upstream_timeout은 새 노드로 넘길지 정할 때만 본다. 10초에 시작한 시도는 read 60초를 채울 수 있어 5+5+60=70초가 된다.' },
  ];

  R.page({ title: '타임아웃 · 버퍼 · 재시도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
