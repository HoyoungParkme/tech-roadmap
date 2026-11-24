/* V-1-2 보안 헤더 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 응답 헤더가 브라우저에 닿아 무엇을 막는지 그린다. 헤더 값은 페이지 코드(CODE) 그대로다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, person, server, browser, lock, terminal, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ln = (x1, y1, x2, y2, col, sw, dash, op) => el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': sw || 2, 'stroke-dasharray': dash, opacity: op ?? 1 });
  // 응답 카드: 상태줄 + 헤더 줄들
  function resp(x, y, w, lines, o) { o = o || {}; const h = 22 + lines.length * 24, s = o.s ?? 1; if (s <= 0) return;
    const g = R.G(x, y, s, o.op); el('rect', { x: 0, y: 0, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    lines.forEach(([t, col, fw], i) => { const e = tx(14, 26 + i * 24, t, { 'font-size': 14, class: 'mono', fill: col || INK, 'font-weight': fw || 500, style: 'white-space:pre' }, g); }); }
  // 주소창 있는 브라우저 (왼쪽 위 기준)
  function addr(x, y, w, url, col, op) { el('rect', { x, y, width: w, height: 34, rx: 17, fill: SOFT, stroke: col || GRID, 'stroke-width': 2, opacity: op ?? 1 }); mono(x + 16, y + 22, url, { 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: op ?? 1 }); }
  // 자원 줄: ✓ 허용 / ✗ 차단
  function resRow(x, y, s, ok, a) { const op = fade(a.u, a.t); if (op <= 0) return; mono(x + 30, y + 5, s, { 'font-size': 14, fill: ok ? INK : MUT, opacity: op, 'text-decoration': ok ? null : 'line-through' });
    if (ok) check(x + 10, y, 8, pop(a.u, a.t + 0.2)); else cross(x + 10, y, 7, pop(a.u, a.t + 0.2)); }

  // ---------- 1. HSTS ----------
  const STS = 'Strict-Transport-Security:';
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { server(110, 200, 'nginx :443', {});
      browser(830, 200, 190, 150, 'example.com', {});
      const f = E(u, 0.3, 1.3); resp(lerp(190, 250, f), 70, 470, [['HTTP/1.1 200 OK', MUT], [STS, ACC, 700], ['  max-age=31536000; includeSubDomains;', ACC], ['  preload', ACC]], { s: pop(u, 0.2) });
      resp(250, 250, 470, [['HTTP/1.1 404 Not Found', BAD], [STS + ' …', ACC, 700]], { s: pop(u, 1.4) });
      pill(640, 270, 'always', GOOD, pop(u, 1.9), { mono: true });
      note(250, 380, 'always 가 있어야 4xx·5xx 응답에도 실린다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 1) { const P = [['max-age=31536000', '31,536,000초 = 365일', '기간', INFO], ['includeSubDomains', '*.example.com 까지', '범위', ACC], ['preload', '내장 목록 등록 자격', '등록', WARN]];
      P.forEach(([v, d, n, col], i) => { const cx = 170 + i * 310, s = pop(u, 0.3 + i * 0.5);
        card(cx, 150, 280, 56, { text: v, fs: 16, mono: true, stroke: col, color: col, s });
        lbl(cx, 100, n, fade(u, 0.4 + i * 0.5), { fill: col });
        grow(cx, 182, cx, 236, E(u, 0.6 + i * 0.5, 1.0 + i * 0.5), col);
        note(cx, 270, d, fade(u, 0.9 + i * 0.5), { 'text-anchor': 'middle' }); });
      note(480, 380, '세 조각이 기간 · 범위 · 등록 자격을 정한다', fade(u, 2.3), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 2) { browser(300, 210, 460, 300, null, {});
      const typed = 'http://example.com', s1t = E(u, 0.2, 1.0), sw = u > 1.3;
      addr(90, 90, 420, sw ? 'https://example.com' : typed.slice(0, Math.round(typed.length * s1t)), sw ? GOOD : INK);
      if (sw) lock(500, 107, true, GOOD, pop(u, 1.3));
      zone(110, 160, 380, 120, '브라우저 HSTS 기록', { stroke: INFO, fill: INFOBG, op: fade(u, 0.6) });
      mono(130, 214, 'example.com', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7) }); mono(130, 244, '만료: 1년 뒤 · 하위 도메인 포함', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      if (u > 1.5) { ln(530, 107, 760, 107, GOOD, 3); dot([[530, 107], [760, 107]], seg(u, 1.5, 2.3), GOOD, 7); }
      server(820, 120, 'nginx :443', { s: 0.8 });
      ln(530, 330, 760, 330, BAD, 2.5, '7 6', fade(u, 1.8)); cross(645, 330, 12, pop(u, 1.8)); mono(645, 368, 'http:// 요청은 아예 안 나간다', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    if (k === 3) { // SSL strip
      [[110, false], [300, true]].forEach(([y, hsts], r) => { const s = fade(u, 0.2 + r * 1.0); if (s <= 0) return;
        tx(30, y - 52, hsts ? 'HSTS 있음' : 'HSTS 없음', { 'font-size': 15, 'font-weight': 800, fill: hsts ? GOOD : BAD, opacity: s });
        browser(110, y, 120, 80, null, { op: s }); person(480, y - 6, '중간자', { stroke: BAD, op: s }); server(840, y, null, { s: 0.7, op: s });
        if (!hsts) { ln(175, y, 450, y, BAD, 3, null, s); mono(310, y - 12, 'http (평문)', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: s }); ln(510, y, 780, y, GOOD, 3, null, s); mono(650, y - 12, 'https', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: s });
          fly(180, y + 30, 330, y + 30, seg(u, 0.6, 1.3), 'password=…', { fill: BAD, mono: true, stay: true }); }
        else { ln(175, y, 780, y, GOOD, 4, null, s); lock(620, y - 22, true, GOOD, pop(u, 1.6)); cross(480, y - 6, 26, pop(u, 1.9)); mono(320, y - 12, 'https 로 바로 연결', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: s }); } });
      note(480, 406, '사용자가 자물쇠를 확인하지 않아도 되게 만든다', fade(u, 2.4), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 4) { browser(300, 210, 420, 300, '처음 방문하는 브라우저', {});
      zone(120, 100, 360, 210, '브라우저에 내장된 preload 목록', { stroke: WARN, fill: WARNBG });
      ['google.com', 'github.com', 'example.com', '…'].forEach((d, i) => { const s = pop(u, 0.3 + i * 0.25); card(300, 150 + i * 40, 240, 32, { rx: 6, text: d, fs: 14.5, mono: true, stroke: d === 'example.com' ? ACC : GRID, color: d === 'example.com' ? ACC : INK, s }); });
      ln(520, 210, 760, 210, GOOD, 3, null, fade(u, 1.4)); dot([[520, 210], [760, 210]], seg(u, 1.4, 2.0), GOOD, 7); mono(640, 196, 'https', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      server(820, 210, 'example.com', { s: 0.8 });
      note(560, 320, '헤더를 한 번도 못 받은 첫 방문도 보호', fade(u, 1.8), { fill: GOOD });
      note(560, 350, '목록에서 빼는 데는 수개월이 걸린다', fade(u, 2.2), { fill: BAD }); return; }
    // k5: max-age 계단
    tx(60, 52, 'max-age 를 계단식으로 올린다', { 'font-size': 17, 'font-weight': 700 });
    const S = [['300', '5분', 2.48], ['86400', '1일', 4.94], ['31536000', '1년', 7.5]], base = 360;
    S.forEach(([v, d, lg], i) => { const h = (lg / 7.5) * 230 * E(u, 0.3 + i * 0.5, 0.9 + i * 0.5), x = 140 + i * 200;
      el('rect', { x, y: base - h, width: 170, height: h, rx: 6, fill: i === 2 ? ACC : INFO, opacity: 0.75 });
      mono(x + 85, base - h - 28, v, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.5) });
      tx(x + 85, base - h - 8, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.5) }); });
    ln(120, base, 760, base, MUT, 1.8); sub(450, 386, '세로는 로그 눈금', fade(u, 0.5));
    pill(830, 200, 'includeSubDomains', ACC, pop(u, 1.9), { mono: true, fs: 13.5 }); pill(830, 250, 'preload', WARN, pop(u, 2.2), { mono: true, fs: 13.5 });
    sub(830, 290, '마지막에 붙인다', fade(u, 2.3)); }

  // ---------- 2. CSP ----------
  function page(x, y, title) { browser(x + 190, y + 150, 380, 300, null, {}); mono(x + 70, y + 20, title, { 'font-size': 14, fill: MUT }); }
  function policy(x, y, lines, u, a0) { lines.forEach(([s, col], i) => mono(x, y + i * 26, s, { 'font-size': 14.5, 'font-weight': 700, fill: col || INK, opacity: fade(u, a0 + i * 0.25) })); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { page(40, 50, 'example.com');
      const rows = [
        [["<script src=/app.js>", 1], ["<script src=evil.com/x.js>", 0], ["<img src=cdn.example.net/a.png>", 0]],
        [["<script src=cdn.jsdelivr.net/…>", 1], ['<script nonce="r4nD">…', 1], ['<script>…</script>', 0], ["<link href=fonts.googleapis.com>", 1]],
        [["fetch(api.example.com)", 1], ["new WebSocket(wss://realtime…)", 1], ["fetch(evil.com/steal)", 0], ["evil.com 이 우리를 iframe", 0]]][k];
      rows.forEach(([s, ok], i) => resRow(60, 130 + i * 48, s, !!ok, { u, t: 0.4 + i * 0.35 }));
      const P = [[["Content-Security-Policy:", MUT], ["default-src 'self'", ACC]],
        [["script-src 'self'", ACC], ["  https://cdn.jsdelivr.net", ACC], ["  'nonce-r4nD'", ACC], ["style-src … fonts.googleapis.com", ACC]],
        [["connect-src 'self' api… wss://…", ACC], ["frame-ancestors 'none'", ACC], ["base-uri 'self'; form-action 'self'", ACC], ["upgrade-insecure-requests", ACC]]][k];
      policy(470, 100, P, u, 0.2);
      note(470, 300, ['다른 출처 자원은 이 순간 전부 막힌다', 'nonce 가 맞는 inline 만 실행된다', '빠뜨리면 fetch·WebSocket 이 조용히 막힌다'][k], fade(u, 2.0), { fill: k === 1 ? GOOD : WARN });
      if (k === 1) note(470, 330, 'nonce 는 요청마다 새 값이어야 의미가 있다', fade(u, 2.3), { fill: MUT });
      return; }
    if (k === 3) { tx(60, 50, '디렉티브가 맡는 자원', { 'font-size': 17, 'font-weight': 700 });
      const D = [['script-src', '<script>'], ['style-src', '<style>, <link>'], ['img-src', '<img>, 배경 이미지'], ['font-src', '@font-face'], ['connect-src', 'fetch · XHR · WebSocket'], ['frame-ancestors', '나를 감싸는 iframe']];
      D.forEach(([d, w], i) => { const y = 92 + i * 44, s = pop(u, 0.2 + i * 0.2); card(200, y, 220, 34, { rx: 6, text: d, fs: 14.5, mono: true, stroke: ACC, color: ACC, s }); grow(312, y, 420, y, E(u, 0.4 + i * 0.2, 0.7 + i * 0.2), MUT); tx(432, y + 5, w, { 'font-size': 14.5, opacity: fade(u, 0.5 + i * 0.2) }); });
      card(780, 200, 200, 60, { text: "default-src 'self'", fs: 15, mono: true, stroke: INK, s: pop(u, 1.6) });
      el('path', { d: 'M570,180 C620,180 650,195 680,200', fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.9) });
      note(640, 300, '안 적은 항목은 default-src 를 따른다', fade(u, 2.1), { fill: WARN }); return; }
    if (k === 4) { tx(60, 50, '출처 키워드 — 왼쪽일수록 안전하다', { 'font-size': 17, 'font-weight': 700 });
      for (let i = 0; i < 40; i++) el('rect', { x: 60 + i * 21, y: 180, width: 21, height: 18, fill: i < 20 ? GOOD : i < 30 ? WARN : BAD, opacity: 0.25 + 0.6 * clamp(E(u, 0.2, 1.2) * 40 - i) });
      [["'none'", 90, GOOD], ["'self'", 230, GOOD], ["'nonce-…'", 380, GOOD], ["'sha256-…'", 380, GOOD], ["https:", 580, WARN], ["'unsafe-inline'", 720, BAD], ["'unsafe-eval'", 820, BAD]].forEach(([s, x, col], i) => {
        const y = i === 3 ? 270 : (i % 2 ? 140 : 240); pill(x, i === 3 ? 270 : (i === 2 ? 236 : y), s, col, pop(u, 0.5 + i * 0.22), { mono: true, fs: 13.5 }); });
      note(60, 350, 'inline 스크립트는 nonce 나 hash 로 연다', fade(u, 2.1), { fill: GOOD });
      note(60, 380, "'unsafe-inline' 을 쓰면 XSS 방어력이 거의 사라진다", fade(u, 2.3), { fill: BAD }); return; }
    // k5: Report-Only
    browser(190, 200, 300, 230, null, {}); resRow(60, 170, '<script src=evil.com>', true, { u, t: 0.3 }); mono(90, 210, '실행된다 (보고만)', { 'font-size': 14, fill: WARN, opacity: fade(u, 0.6) });
    card(560, 100, 400, 44, { text: 'Content-Security-Policy-Report-Only', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.2) });
    dot([[340, 190], [700, 190]], seg(u, 0.8, 1.6), WARN, 7); card(760, 190, 150, 44, { text: 'POST /csp', fs: 14.5, mono: true, s: pop(u, 1.4) });
    mono(560, 260, '위반 보고서가 쌓인다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
    const X = (d) => 120 + d * 110; ln(120, 340, 880, 340, MUT, 1.8, null, fade(u, 1.7));
    ['1일', '2일', '3일', '…', '전환'].forEach((s, i) => { mono(X(i * 1.6), 368, s, { 'font-size': 14, fill: i === 4 ? GOOD : MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8 + i * 0.1) }); el('circle', { cx: X(i * 1.6), cy: 340, r: 6, fill: i === 4 ? GOOD : WARN, opacity: fade(u, 1.8 + i * 0.1) }); });
    note(560, 300, '정상 자원이 안 막히는 걸 확인한 뒤 정식 헤더로', fade(u, 2.3), { fill: GOOD }); }

  // ---------- 3. X-Frame-Options ----------
  function frame(x, y, w, h, label, st) { // st: 'show' | 'block'
    el('rect', { x, y, width: w, height: h, rx: 6, fill: st === 'block' ? BADBG : PANEL, stroke: st === 'block' ? BAD : INFO, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
    mono(x + 10, y + 22, label, { 'font-size': 13.5, fill: st === 'block' ? BAD : INFO });
    if (st === 'block') cross(x + w / 2, y + h / 2 + 8, 22, 1); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { browser(300, 210, 480, 320, 'evil.com', { stroke: BAD });
      frame(110, 110, 380, 220, '<iframe src=bank.example.com>', u > 1.2 ? 'block' : 'show');
      if (u <= 1.2) mono(300, 230, '은행 화면', { 'font-size': 16, 'text-anchor': 'middle', fill: INFO });
      card(740, 160, 300, 46, { text: 'X-Frame-Options: DENY', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.5) });
      grow(590, 170, 500, 200, E(u, 0.8, 1.2), ACC);
      note(600, 290, '어떤 사이트도 우리를 iframe 에 못 넣는다', fade(u, 1.6), { fill: GOOD });
      note(600, 320, '결제 · 로그인 페이지는 예외 없이', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 1) { [['example.com/admin', true, 150], ['evil.com', false, 480]].forEach(([n, ok, x], i) => { browser(x, 200, 290, 230, n, { stroke: ok ? INK : BAD, op: fade(u, 0.2 + i * 0.4) });
        frame(x - 120, 120, 240, 150, 'example.com', u > 0.9 + i * 0.4 ? (ok ? 'show' : 'block') : 'show'); if (ok && u > 0.9) check(x, 210, 18, pop(u, 0.9)); });
      card(800, 120, 260, 42, { text: 'XFO: SAMEORIGIN', fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.3) });
      card(800, 190, 260, 42, { text: "frame-ancestors 'self'", fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.4) });
      note(680, 270, '옛 브라우저는 XFO', fade(u, 1.8), { fill: MUT }); note(680, 298, '새 브라우저는 CSP 를 본다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 2) { browser(330, 210, 560, 320, 'evil.com', { stroke: BAD });
      const op = 0.1 + 0.9 * E(u, 1.4, 2.2);
      card(330, 210, 200, 56, { text: '쿠폰 받기', fs: 18, fill: WARNBG, stroke: WARN, color: WARN, op: 1 - 0.9 * E(u, 1.4, 2.2) });
      el('rect', { x: 70, y: 70, width: 520, height: 290, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: op });
      card(330, 210, 200, 56, { text: '송금 실행', fs: 18, stroke: BAD, color: BAD, op });
      mono(90, 96, '투명한 iframe · bank.example.com', { 'font-size': 13.5, fill: INFO, opacity: op });
      const cx = lerp(560, 345, E(u, 0.2, 1.0)), cy = lerp(330, 222, E(u, 0.2, 1.0));
      el('path', { d: `M${cx},${cy} l0,24 l7,-6 l6,12 l5,-3 l-6,-11 l9,-1 z`, fill: INK });
      if (u > 1.05 && u < 1.5) el('circle', { cx, cy, r: 18 * seg(u, 1.05, 1.5), fill: 'none', stroke: BAD, 'stroke-width': 2 });
      note(660, 200, '사용자는 쿠폰을 눌렀다고', fade(u, 1.2)); note(660, 228, '생각하지만 실제로는 송금', fade(u, 1.6), { fill: BAD }); return; }
    if (k === 3) { server(110, 200, 'nginx', {}); ln(180, 200, 420, 200, MUT, 2.5); dot([[180, 200], [420, 200]], seg(u, 0.2, 0.9), INFO, 7);
      mono(300, 182, '응답은 이미 보냈다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      browser(670, 210, 440, 300, 'evil.com', { stroke: BAD }); frame(490, 110, 360, 210, 'bank.example.com', u > 1.3 ? 'block' : 'show');
      pill(250, 320, '브라우저가 그리기를 거부', BAD, pop(u, 1.6), { fs: 14 }); return; }
    if (k === 4) { tx(60, 50, '값 고르기', { 'font-size': 17, 'font-weight': 700 });
      const rows = [['DENY', "'none'", true], ['SAMEORIGIN', "'self'", true], ['ALLOW-FROM uri', 'https://partner.com', false]];
      tx(200, 100, 'X-Frame-Options', { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) }); tx(640, 100, 'CSP frame-ancestors', { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      rows.forEach(([a, b, ok], i) => { const y = 150 + i * 70, s = pop(u, 0.4 + i * 0.4);
        card(200, y, 260, 48, { text: a, fs: 15, mono: true, stroke: ok ? INK : BAD, color: ok ? INK : BAD, s }); if (!ok) ln(80, y, 320, y, BAD, 3, null, s);
        card(640, y, 280, 48, { text: b, fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.6 + i * 0.4) }); ln(335, y, 495, y, GRID, 2, '4 4', s); });
      note(80, 380, 'ALLOW-FROM 은 브라우저가 지원하지 않는다', fade(u, 1.9), { fill: BAD }); note(520, 380, '특정 파트너만 허용은 CSP 로', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 5) { [['결제', "'none'", BAD], ['로그인', "'none'", BAD], ['사내 대시보드', "'self'", WARN], ['영상 임베드', '허용', GOOD]].forEach(([n, v, col], i) => {
        const x = 130 + i * 230, s = pop(u, 0.3 + i * 0.35); card(x, 170, 200, 150, { stroke: col, s }); lbl(x, 140, n, fade(u, 0.4 + i * 0.35));
        mono(x, 185, v, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.5 + i * 0.35) }); lock(x, 225, v !== '허용', col, s * 0.9); });
      note(480, 330, '전역은 DENY 로 깔고, 임베드가 필요한 location 만 푼다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    terminal(80, 80, 800, 200, ['$ curl -I https://example.com', ['HTTP/2 200', 'var(--term)'], ['x-frame-options: DENY', 'var(--term)'], ["content-security-policy: frame-ancestors 'none'", 'var(--term)']], E(u, 0.2, 1.8) * 4, { title: 'terminal', fs: 15 });
    check(140, 340, 14, pop(u, 2.0)); note(170, 346, '두 줄이 실제 응답에 실려 나가면 끝', fade(u, 2.0)); }

  // ---------- 4. nosniff ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { resp(60, 70, 400, [['Content-Type: image/png', INFO, 700], ['', MUT], ['<html><script>alert(1)…', BAD]], { s: pop(u, 0.2) });
      [[620, 110, '추측(sniffing) 함', 'text/html 로 해석', BAD], [620, 290, 'nosniff', 'image/png 그대로', GOOD]].forEach(([x, y, a, b, col], i) => { const s = pop(u, 0.8 + i * 0.6);
        card(x + 120, y, 300, 70, { stroke: col, s }); tx(x, y - 6, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.9 + i * 0.6) }); mono(x, y + 20, b, { 'font-size': 14.5, opacity: fade(u, 1.0 + i * 0.6) });
        grow(460, 120, x - 20, y, E(u, 0.6 + i * 0.6, 1.0 + i * 0.6), col); });
      note(60, 390, '응답에 적힌 Content-Type 을 그대로 믿게 한다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 1) { person(80, 120, '공격자', { stroke: BAD }); fly(120, 120, 330, 120, seg(u, 0.2, 0.9), 'evil.png 업로드', { fill: BAD, stay: true });
      server(480, 130, '/uploads/', { s: 0.8 }); person(80, 310, '피해자', {});
      dot([[120, 310], [480, 200]], seg(u, 0.9, 1.4), INFO, 7);
      const s = fade(u, 1.5); card(720, 200, 260, 70, { stroke: BAD, op: s }); tx(610, 194, '옛 브라우저 · sniff', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: s }); mono(610, 218, 'script 실행 → XSS', { 'font-size': 14, fill: BAD, opacity: s });
      const g = fade(u, 2.0); card(720, 320, 260, 70, { stroke: GOOD, op: g }); tx(610, 314, 'nosniff', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: g }); mono(610, 338, '깨진 이미지로 끝', { 'font-size': 14, fill: GOOD, opacity: g });
      grow(560, 160, 590, 190, fade(u, 1.5), BAD); grow(560, 200, 590, 310, fade(u, 2.0), GOOD); return; }
    if (k === 2) { zone(80, 70, 560, 260, 'server {', { stroke: GRID, fill: PANEL });
      mono(110, 130, 'add_header X-Content-Type-Options nosniff always;', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) });
      mono(110, 190, '# add_header X-XSS-Protection "1; mode=block";', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) });
      ln(110, 186, 110 + 520 * E(u, 1.2, 1.8), 186, BAD, 3);
      note(110, 250, 'XSS Auditor 는 새 브라우저에서 사라졌다', fade(u, 1.8), { fill: MUT });
      card(800, 190, 220, 70, { text: '그 자리는\nCSP 가 맡는다', fs: 15, stroke: ACC, color: ACC, s: pop(u, 2.0) }); return; }
    if (k === 3) { browser(480, 210, 260, 200, null, {}); lbl(480, 225, 'example.com', 1);
      [['CORP same-site', 150, 110, '다른 사이트가 우리 자원을 못 끌어감'], ['COOP same-origin', 810, 110, '팝업 창과 연결을 끊음'], ['COEP require-corp', 480, 365, '허락 받은 외부 자원만 싣는다']].forEach(([h, x, y, d], i) => {
        const s = pop(u, 0.3 + i * 0.6); card(x, y, 230, 40, { text: h, fs: 14, mono: true, stroke: ACC, color: ACC, s });
        sub(x, y + (i === 2 ? -32 : 40), d, fade(u, 0.5 + i * 0.6), { 'font-size': 14 }); });
      ln(265, 130, 350, 170, BAD, 2.5, '6 5', fade(u, 0.6)); ln(695, 130, 610, 170, BAD, 2.5, '6 5', fade(u, 1.2));
      note(40, 300, 'COEP 는 SharedArrayBuffer 가 필요할 때만', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 4) { mono(480, 70, 'Permissions-Policy: geolocation=(), camera=(), microphone=()', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
      [['위치', 'geolocation'], ['카메라', 'camera'], ['마이크', 'microphone']].forEach(([n, a], i) => { const x = 200 + i * 280, s = pop(u, 0.5 + i * 0.3);
        el('circle', { cx: x, cy: 190, r: 52 * s, fill: SOFT, stroke: MUT, 'stroke-width': 2 }); lbl(x, 196, n, s); lock(x + 40, 228, true, BAD, pop(u, 1.2 + i * 0.2)); mono(x, 280, a, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
      mono(140, 350, 'navigator.geolocation.getCurrentPosition()', { 'font-size': 14.5, opacity: fade(u, 1.8) }); mono(640, 350, '→ 거부', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); return; }
    tx(60, 50, '허용 범위 표기', { 'font-size': 17, 'font-weight': 700 });
    for (let i = 0; i < 40; i++) el('rect', { x: 80 + i * 20, y: 200, width: 20, height: 16, fill: i < 14 ? GOOD : i < 30 ? WARN : BAD, opacity: 0.25 + 0.6 * clamp(E(u, 0.2, 1.0) * 40 - i) });
    [['()', '차단', 140, GOOD], ['(self)', '자기 origin', 350, GOOD], ['("https://x.com")', '그 사이트만', 600, WARN], ['*', '전부 허용', 840, BAD]].forEach(([s, d, x, col], i) => {
      pill(x, 150, s, col, pop(u, 0.6 + i * 0.35), { mono: true, fs: 14 }); sub(x, 250, d, fade(u, 0.8 + i * 0.35), { 'font-size': 14.5, fill: col, 'font-weight': 700 }); });
    note(80, 340, '* 는 사실상 무방비다', fade(u, 2.2), { fill: BAD }); }

  // ---------- 5. Referrer-Policy + 종합 ----------
  const SNIP = [['# HSTS', MUT], ['add_header Strict-Transport-Security "… preload" always;', ACC], ["add_header Content-Security-Policy \"default-src 'self';", INFO], ["  script-src 'self' 'unsafe-inline'; …", WARN], ["  frame-ancestors 'none'; upgrade-insecure-requests\";", INFO], ['add_header X-Frame-Options DENY always;', INK], ['add_header X-Content-Type-Options nosniff always;', INK], ['add_header Referrer-Policy "strict-origin-when-cross-origin";', ACC], ['add_header Permissions-Policy "geolocation=(), …";', INK]];
  function snippetFile(n, hot, u) { zone(40, 40, 880, 50 + n * 32, 'snippets/security-headers.conf', { stroke: GRID, fill: PANEL });
    SNIP.slice(0, n).forEach(([s, col], i) => { const isNew = hot.includes(i); if (isNew) el('rect', { x: 50, y: 66 + i * 32, width: 860, height: 28, rx: 5, fill: ACCBG, opacity: fade(u, 0.2 + hot.indexOf(i) * 0.3) });
      mono(64, 86 + i * 32, s, { 'font-size': 14, fill: col, opacity: isNew ? fade(u, 0.3 + hot.indexOf(i) * 0.3) : 1 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { const n = [2, 4, 9][k], hot = [[0, 1], [2, 3], [4, 5, 6, 7, 8]][k]; snippetFile(n, hot, u);
      if (k === 0) note(60, 210, 'server 마다 복사하지 않고 파일 하나에 모은다', fade(u, 1.6), { fill: MUT });
      if (k === 1) { pill(700, 250, "'unsafe-inline' 은 개선 숙제", WARN, pop(u, 1.4), { fs: 14 }); note(60, 260, '운영 현실을 반영한 완화판, 정리되면 nonce 로', fade(u, 1.9), { fill: MUT }); }
      if (k === 2) note(60, 395, '네 헤더를 한 줄씩. 이 장의 주인공은 Referrer-Policy', fade(u, 2.0), { fill: MUT });
      return; }
    if (k === 3) { tx(60, 50, 'Referrer-Policy: strict-origin-when-cross-origin', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      card(200, 210, 300, 64, { text: 'https://example.com\n/orders/123?token=abc', fs: 14, mono: true, s: pop(u, 0.2) });
      const D = [['같은 origin', 'https://example.com/orders/123?token=abc', GOOD, 110], ['다른 origin (https)', 'https://example.com/', WARN, 210], ['https → http', '(보내지 않음)', BAD, 310]];
      D.forEach(([n, r, col, y], i) => { grow(350, 210, 470, y, E(u, 0.5 + i * 0.5, 0.9 + i * 0.5), col); tx(480, y - 8, n, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.7 + i * 0.5) });
        mono(480, y + 16, 'Referer: ' + r, { 'font-size': 13.5, opacity: fade(u, 0.8 + i * 0.5) }); });
      note(60, 395, '다른 사이트로는 경로와 토큰이 새지 않는다', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 4) { resp(90, 90, 380, [['HTTP/1.1 200 OK', MUT], ['Server: nginx/1.27.x', BAD, 700]], { s: pop(u, 0.2) });
      resp(520, 90, 340, [['HTTP/1.1 200 OK', MUT], ['Server: nginx', GOOD, 700]], { s: pop(u, 1.3) });
      grow(470, 120, 518, 120, E(u, 1.0, 1.3), MUT); mono(690, 200, 'server_tokens off;', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      person(200, 290, '취약점 스캐너', { stroke: BAD, op: fade(u, 0.6) }); note(260, 296, '버전을 보고 알려진 취약점을 찾는다', fade(u, 0.8), { fill: BAD });
      note(520, 360, 'CORP · COOP 도 이 파일에 함께 둔다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 5) { card(150, 200, 220, 70, { text: 'security-\nheaders.conf', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      ['api.example.com', 'www.example.com', 'admin.example.com'].forEach((n, i) => { const y = 90 + i * 110, s = pop(u, 0.5 + i * 0.3);
        card(620, y, 330, 70, { stroke: INK, s }); mono(470, y - 8, 'server ' + n, { 'font-size': 14, 'font-weight': 700, opacity: s }); mono(470, y + 18, 'include snippets/…;', { 'font-size': 14, fill: ACC, opacity: s });
        grow(262, 200, 452, y, E(u, 0.7 + i * 0.3, 1.1 + i * 0.3), ACC); });
      note(60, 395, 'location 안에 add_header 를 하나라도 쓰면 위 헤더가 모두 빠진다', fade(u, 2.2), { fill: BAD }); return; }
    [['securityheaders.com', 'A+'], ['ssllabs.com', 'A+'], ['hstspreload.org', '등록']].forEach(([n, g], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.5);
      el('circle', { cx: x, cy: 180, r: 70 * s, fill: GOODBG, stroke: GOOD, 'stroke-width': 3 });
      tx(x, 194, g, { 'text-anchor': 'middle', 'font-size': g === 'A+' ? 40 : 24, 'font-weight': 800, fill: GOOD, opacity: s }); mono(x, 290, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.5) }); });
    note(480, 370, '외부 채점에서 A+ 가 나오면 기본선은 통과', fade(u, 2.1), { 'text-anchor': 'middle', fill: MUT }); }

  const quiz = [
    { q: 'HSTS를 받아 둔 브라우저에 사용자가 http://example.com을 치면 무슨 일이 일어나는가?',
      o: ['서버가 301로 https에 보내 준다', '브라우저가 요청을 보내기 전에 https로 바꾼다', '평문으로 한 번 보낸 뒤 https로 바꾼다'], a: 1,
      why: '변환은 브라우저 안에서 일어난다. 평문 요청이 아예 나가지 않으니 중간자가 끼어들 틈이 없다.' },
    { q: "CSP에 default-src 'self'만 두고 img-src를 안 적었다. 다른 도메인 이미지는?",
      o: ['default-src를 따라 막힌다', 'img-src가 없으니 모두 허용된다', '경고만 뜨고 표시된다'], a: 0,
      why: '적지 않은 디렉티브는 default-src를 따른다. 그래서 막히는 자원을 보고 하나씩 열어 나간다.' },
    { q: 'X-Frame-Options: DENY가 붙은 페이지를 evil.com이 iframe에 넣으면 누가 막는가?',
      o: ['nginx가 응답을 보내지 않는다', '방화벽이 iframe 요청을 끊는다', '브라우저가 받은 문서를 그리지 않는다'], a: 2,
      why: '서버는 응답을 이미 보냈다. 헤더를 읽은 브라우저가 렌더링을 거부한다.' },
    { q: '업로드된 evil.png 안에 script가 들어 있다. nosniff가 있으면 어떻게 되는가?',
      o: ['image/png로 처리되어 깨진 이미지로 끝난다', 'HTML로 실행된다', '업로드 자체가 거부된다'], a: 0,
      why: 'nosniff는 브라우저가 본문을 보고 형식을 추측하지 못하게 한다. 응답에 적힌 image/png 그대로 다룬다.' },
    { q: 'strict-origin-when-cross-origin에서 https 페이지가 다른 https 사이트로 이동하면 Referer에 무엇이 실리는가?',
      o: ['경로와 쿼리를 포함한 전체 URL', 'origin만 (https://example.com/)', '아무것도 안 실린다'], a: 1,
      why: '같은 origin이면 전체 URL, 다른 origin이면 origin만, https에서 http로 내려갈 때는 보내지 않는다.' },
  ];
  const summary = [
    '보안 헤더는 서버가 보내고 브라우저가 지킨다. 헤더가 없으면 아무도 막지 않는다.',
    'add_header에 always를 빼면 4xx·5xx 응답에는 헤더가 빠진다.',
    "CSP는 default-src 'self'로 시작해 Report-Only로 지켜본 뒤 출처를 하나씩 연다.",
    'HSTS preload는 되돌리는 데 수개월이 걸리니 max-age를 5분, 1일, 1년 순으로 올린다.',
  ];
  const review = [
    { q: '보안 헤더를 snippet으로 include 했는데 /api/ 응답에만 헤더가 하나도 없다. 먼저 볼 곳은?',
      o: ['/api/ location 안에 다른 add_header가 있는지', 'ssl_protocols 설정', 'server_tokens off 위치'], a: 0,
      why: 'add_header는 현재 블록에 하나라도 있으면 위 블록의 것을 물려받지 않는다. 그 location에도 include를 넣어야 한다.' },
    { q: '결제 페이지를 협력사 한 곳에서만 iframe으로 띄우게 하고 싶다. 어떻게 하는가?',
      o: ['X-Frame-Options: ALLOW-FROM을 쓴다', 'CSP frame-ancestors에 그 도메인을 적는다', 'X-Frame-Options: SAMEORIGIN을 쓴다'], a: 1,
      why: 'ALLOW-FROM은 브라우저가 지원하지 않는다. 특정 도메인 허용은 CSP frame-ancestors 로만 된다.' },
    { q: "CSP를 켰더니 화면은 멀쩡한데 실시간 알림이 안 온다. 먼저 의심할 것은?",
      o: ["script-src에 'unsafe-eval'이 없다", 'img-src가 없다', 'connect-src에 wss 주소가 빠졌다'], a: 2,
      why: 'fetch·XHR·WebSocket은 connect-src가 맡는다. 빠뜨리면 오류 화면 없이 조용히 막힌다.' },
  ];

  R.page({ title: '헤더가 막는 공격', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
