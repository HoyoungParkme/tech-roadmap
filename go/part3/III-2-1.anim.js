/* III-2-1 미들웨어 패턴 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 위쪽 띠는 이 장의 체인 Recovery → Logger → CORS → Auth → RateLimit → Handler, 장면마다 한 겹을 연다.
 * 로그 값(latency 12, ip 1.2.3.4)은 logger.go 주석의 예시, JWT 문자열은 auth.go 의 비밀키로 python 에서 만든 실제 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, pill, grow, fly, dot, zone, cross, check, clock, terminal, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const KW = /^(func|package|import|return|if|else|switch|case|default|go|defer|type|struct|var|nil|make|chan)$/;
  function goTok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '"' || ch === '`') { flush(); const e = line.indexOf(ch, i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  const code = (x, y, s, o) => { o = o || {}; return R.spans(x, y, goTok(s), { 'font-size': o.fs || 15, opacity: o.op ?? 1, 'text-anchor': o.anchor }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 14.5, fill: MUT, opacity: op ?? 1 }, a || {}));

  // 위쪽 띠: 체인 6칸, on 번째가 이 장면의 주인공
  const LAY = ['Recovery', 'Logger', 'CORS', 'Auth', 'RateLimit', 'Handler'];
  function strip(on) { LAY.forEach((s, i) => { const cx = 86 + i * 158, me = i === on;
    card(cx, 30, 146, 34, { rx: 17, stroke: me ? ACC : GRID, sw: me ? 2.6 : 1.5, fill: me ? ACCBG : PANEL, text: s, fs: 14.5, mono: true, color: me ? ACC : MUT });
    if (i < 5) el('path', { d: `M${cx + 75},30 l6,-5 v10 z`, fill: OFF }); }); }

  // ---------- 1. Logger ----------
  function timeline(k, u) { const y = 120, x0 = 70, a = 200, b = 690, x1 = 900;
    el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 2 });
    tx(x0, y - 22, 'Logger 한 번이 보는 시간', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    clock(x0 + 30, y, 16, k === 0 ? E(u, 0.3, 1.0) * 0.25 : 0.25, INFO, null); mono(x0 + 30, y + 36, 'start', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: INFO });
    const g = k < 2 ? 0 : k === 2 ? E(u, 0.3, 1.6) : 1;
    if (g > 0) { el('rect', { x: a, y: y - 16, width: (b - a) * g, height: 32, rx: 8, fill: SOFT, stroke: GRID });
      if (g > 0.6) tx((a + b) / 2, y + 5, 'c.Next()  ·  CORS · Auth · RateLimit · Handler', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: seg(g, 0.6, 1) }); }
    if (k >= 2 && (k > 2 || u > 1.7)) { el('line', { x1: b + 10, y1: y, x2: b + 70, y2: y, stroke: INFO, 'stroke-width': 3 }); mono(b + 90, y + 5, 'slog.Info', { 'font-size': 14, 'font-weight': 700, fill: INFO }); }
    if (k === 2) note(480, y + 46, '이 줄 안에서 체인 나머지가 다 돈다', fade(u, 1.8), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); }
  const REC = [['reqID', '"…"'], ['method', '"GET"'], ['path', '"/api/v1/users"'], ['status', '200'], ['latency', '12'], ['ip', '"1.2.3.4"'], ['ua', '"curl/…"']];
  function record(n, f) { zone(40, 196, 430, 214, '로그 레코드 (key, value)', { fill: PANEL, stroke: INFO, sw: 2, color: INFO });
    REC.forEach(([kk, v], i) => { const op = clamp(n - i); if (op <= 0) return; const col = i < 4 ? 0 : 1, row = i < 4 ? i : i - 4, x = 58 + col * 214, y = 246 + row * 38;
      mono(x, y, kk, { 'font-size': 14.5, fill: MUT, opacity: op }); mono(x + 76, y, v, { 'font-size': 14.5, 'font-weight': 700, opacity: op, fill: i === 3 ? GOOD : INK }); }); }
  function s1(t, c) { const { k, u } = c; strip(1); timeline(k, u);
    if (k === 0) { card(480, 290, 560, 60, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 0.6) }); code(220, 297, 'start := time.Now()', { fs: 16, op: fade(u, 0.7) });
      note(450, 297, '지연은 c.Next() 전후 차이로만 잰다', fade(u, 1.2), { fill: INK }); return; }
    if (k === 1) {
      zone(40, 190, 300, 120, '들어온 요청 헤더', { fill: SOFT }); mono(58, 246, 'X-Request-Id: (없음)', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); note(58, 282, '게이트웨이가 줬다면 그대로 쓴다', 1);
      grow(340, 250, 400, 250, E(u, 0.3, 0.7), WARN);
      card(520, 250, 220, 52, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.6) }); code(430, 256, 'uuid.New().String()', { fs: 14.5, op: fade(u, 0.7) });
      card(520, 320, 300, 40, { rx: 8, stroke: GRID, sw: 1.5, text: 'xxxxxxxx-xxxx-xxxx-xxxx-…', mono: true, fs: 14, color: MUT, s: pop(u, 1.0) });
      [['c.Set("reqID", reqID)', '로그·핸들러가 꺼내 쓴다', 220], ['c.Header("X-Request-Id", …)', '응답 헤더로 돌려준다', 330]].forEach(([a, b2, y], i) => { const at = 1.4 + i * 0.4;
        grow(630, 250, 690, y, E(u, at, at + 0.3), ACC); code(700, y + 5, a, { fs: 14, op: fade(u, at + 0.2) }); note(700, y + 28, b2, fade(u, at + 0.3)); });
      return; }
    if (k === 2) { record(0); return; }
    if (k === 3) { record(4 * E(u, 0.2, 1.6)); note(500, 260, 'status 는 c.Next() 가 돌아온 뒤라 확정값', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { record(4 + 3 * E(u, 0.2, 1.4));
      [['time.Since(start).Milliseconds()', 'latency (ms)'], ['c.ClientIP()', '프록시 헤더까지 보고 고른 IP'], ['c.Request.UserAgent()', 'ua']].forEach(([a, b2], i) => { const y = 230 + i * 56, op = fade(u, 0.4 + i * 0.4);
        code(500, y, a, { fs: 14, op }); note(500, y + 22, b2, op); });
      return; }
    record(7);
    terminal(500, 200, 430, 210, [['{"time":"…","level":"INFO",', 'var(--term)'], '"msg":"http","reqID":"…",', '"method":"GET",', '"path":"/api/v1/users",', '"status":200,"latency":12,', '"ip":"1.2.3.4","ua":"curl/…"}'], 1 + 5 * E(u, 0.3, 1.8), { title: 'JSONHandler 를 걸었을 때 · 값은 예시', fs: 13.5 }); }

  // ---------- 2. Recovery ----------
  const FR = [['Recovery', 'defer 등록 · c.Next()'], ['Logger', 'c.Next()'], ['CORS · Auth · RateLimit', 'c.Next()'], ['handler', 'user.Name  ← user 가 nil']];
  function stack(n, o) { o = o || {}; FR.forEach(([a, b2], i) => { const f = clamp(n - i); if (f <= 0) return; const y = 90 + i * 62, bad = o.bad === i, dim = o.dim && i > 0;
    el('rect', { x: 40 + i * 14, y, width: 440 - i * 28, height: 50, rx: 8, fill: bad ? BADBG : i === 0 ? ACCBG : PANEL, stroke: bad ? BAD : i === 0 ? ACC : GRID, 'stroke-width': 2, opacity: (dim ? 0.35 : 1) * f });
    tx(56 + i * 14, y + 22, a, { 'font-size': 14.5, 'font-weight': 700, fill: bad ? BAD : i === 0 ? ACC : INK, opacity: (dim ? 0.35 : 1) * f });
    mono(56 + i * 14, y + 41, b2, { 'font-size': 13.5, fill: MUT, opacity: (dim ? 0.35 : 1) * f }); });
    tx(40, 72, '요청 goroutine 의 호출 스택 (아래가 안쪽)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
  function deferBox(on, op) { zone(520, 70, 400, 90, 'Recovery 의 defer 목록', { fill: PANEL, stroke: on ? ACC : GRID, sw: 2, color: on ? ACC : MUT, op });
    if (on) card(720, 128, 360, 36, { rx: 8, stroke: ACC, sw: 2, fill: ACCBG, text: 'func() { if r := recover(); … }', mono: true, fs: 14, color: ACC, op }); }
  function bolt(x, y, s) { const g = R.G(x, y, s); el('path', { d: 'M4,-16 L-8,2 L0,2 L-4,16 L8,-2 L0,-2 Z', fill: BAD }, g); }
  function s2(t, c) { const { k, u } = c; strip(0);
    if (k === 0) { stack(1); deferBox(u > 0.6, fade(u, 0.6)); fly(260, 130, 720, 128, seg(u, 0.2, 0.7), 'defer func(){…}()', { mono: true });
      note(520, 210, '함수가 어떻게 끝나든 마지막에 실행된다', fade(u, 1.2), { fill: INK, 'font-weight': 700 }); note(520, 236, 'panic 으로 끝나도 마찬가지', fade(u, 1.5)); return; }
    if (k === 1) { stack(1 + 3 * E(u, 0.2, 1.4), { bad: u > 1.8 ? 3 : null }); deferBox(true);
      if (u > 1.8) { bolt(440, 300, pop(u, 1.8)); note(520, 300, 'panic: nil 포인터 역참조', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); }
      return; }
    if (k === 2) { stack(4, { bad: 3 }); deferBox(true);
      const p = seg(u, 0.2, 1.3); if (p < 1) bolt(lerp(440, 440, p), lerp(300, 110, p), 1);
      if (u > 1.3) { card(720, 260, 400, 104, { rx: 10, stroke: BAD, sw: 2.4, fill: PANEL, s: pop(u, 1.3) });
        mono(536, 236, 'r := recover()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
        mono(536, 264, 'runtime error: invalid memory', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.5) }); mono(536, 286, 'address or nil pointer dereference', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.5) });
        note(520, 352, '여기서 panic 이 더 위로 올라가지 않는다', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 3) { stack(1); zone(40, 170, 880, 230, 'slog.Error("panic recovered", …)', { fill: PANEL, stroke: BAD, sw: 2, color: BAD });
      [['error', 'runtime error: invalid memory address or nil pointer dereference'], ['stack', 'debug.Stack() · 어느 줄에서 터졌는지 여러 줄'], ['path', 'c.Request.URL.Path']].forEach(([a, b2], i) => { const y = 226 + i * 50, op = fade(u, 0.3 + i * 0.5);
        mono(60, y, a, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: op }); mono(150, y, b2, { 'font-size': 14, opacity: op }); });
      note(60, 380, '스택이 없으면 500 만 보이고 원인은 알 수 없다', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); deferBox(true); return; }
    if (k === 4) { stack(1); deferBox(true);
      card(270, 290, 420, 60, { rx: 12, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 0.3) }); mono(80, 296, 'runtime error: invalid memory …', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 0.3) });
      if (u > 1.0) cross(450, 290, 12, pop(u, 1.0)); note(270, 340, '내부 메시지는 밖으로 내보내지 않는다', fade(u, 1.1), { 'text-anchor': 'middle' });
      grow(490, 290, 540, 290, E(u, 1.2, 1.5), MUT);
      card(735, 290, 380, 60, { rx: 30, stroke: GOOD, sw: 2.4, fill: GOODBG, text: '500 {"error":"internal server error"}', mono: true, fs: 14, color: GOOD, s: pop(u, 1.5) });
      note(735, 340, '클라이언트는 끊긴 연결 대신 답을 받는다', fade(u, 1.9), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { code(40, 90, 'r := gin.New()', { fs: 15, op: fade(u, 0.1) }); code(40, 120, 'r.Use(Recovery())', { fs: 15, op: fade(u, 0.4) }); code(40, 150, 'r.Use(Logger())', { fs: 15, op: fade(u, 0.7) });
      const rings = [['Recovery', ACC, 300], ['Logger', INFO, 210], ['…handler', MUT, 120]];
      rings.forEach(([s, col, w], i) => { const sc = pop(u, 0.3 + i * 0.35); el('rect', { x: 640 - w * sc, y: 250 - (w * 0.55) * sc, width: 2 * w * sc, height: 1.1 * w * sc, rx: 18, fill: i === 2 ? SOFT : 'none', stroke: col, 'stroke-width': 2.6 });
        if (sc > 0.8) tx(640, 250 - w * 0.55 + 24, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col }); });
      note(40, 210, 'Use 순서 = 바깥에서 안쪽', fade(u, 1.4), { fill: INK, 'font-weight': 700 });
      note(40, 240, 'Logger 코드에서 난 panic 도', fade(u, 1.6)); note(40, 264, 'Recovery 가 잡는다', fade(u, 1.6));
      note(40, 320, 'gin.Default() 는 반대로', fade(u, 2.0)); note(40, 344, 'Logger, Recovery 순서다', fade(u, 2.0)); return; }
    // k === 6: Recovery 가 없으면
    tx(40, 84, 'Recovery 가 없을 때', { 'font-size': 16, 'font-weight': 800 });
    zone(40, 104, 430, 290, '① 요청 goroutine 의 panic', { fill: PANEL, stroke: WARN, sw: 2, color: WARN });
    [['net/http 의 연결 goroutine 이 recover', 0.3], ['서버 로그: http: panic serving …', 0.7], ['연결을 끊는다 · 응답은 없다', 1.1]].forEach(([s, at], i) => { const y = 160 + i * 64;
      card(255, y, 390, 46, { rx: 8, stroke: i === 2 ? BAD : GRID, sw: 2, text: s, fs: 14, color: i === 2 ? BAD : INK, s: pop(u, at) }); if (i < 2) grow(255, y + 24, 255, y + 40, E(u, at + 0.3, at + 0.5), MUT); });
    note(255, 375, '서버는 살아 있다', fade(u, 1.5), { 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 });
    zone(490, 104, 430, 290, '② 핸들러가 go 로 띄운 goroutine 의 panic', { fill: PANEL, stroke: BAD, sw: 2, color: BAD });
    [['그 goroutine 에는 recover 가 없다', 1.2], ['Recovery 미들웨어도 못 잡는다', 1.6], ['프로세스 전체 종료 (exit 2)', 2.0]].forEach(([s, at], i) => { const y = 160 + i * 64;
      card(705, y, 390, 46, { rx: 8, stroke: i === 2 ? BAD : GRID, sw: 2, fill: i === 2 ? BADBG : PANEL, text: s, fs: 14, color: i === 2 ? BAD : INK, s: pop(u, at) }); if (i < 2) grow(705, y + 24, 705, y + 40, E(u, at + 0.3, at + 0.5), MUT); });
    note(705, 375, '그 goroutine 안에서 직접 recover 한다', fade(u, 2.3), { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 }); }

  // ---------- 3. CORS ----------
  const ALLOW = ['https://app.example.com', 'https://admin.example.com', 'http://localhost:3000'];
  function allowMap(hot, op) { zone(40, 70, 400, 170, 'allowedOrigins  (map[string]bool)', { fill: PANEL, stroke: GRID, sw: 1.5, op });
    ALLOW.forEach((s, i) => { const y = 120 + i * 38, h = hot === i; if (h) el('rect', { x: 50, y: y - 22, width: 380, height: 32, rx: 6, fill: GOODBG });
      mono(60, y, s, { 'font-size': 14, 'font-weight': h ? 700 : 400, opacity: op }); mono(420, y, 'true', { 'font-size': 14, fill: GOOD, 'text-anchor': 'end', opacity: op }); }); }
  function respHeaders(rows, n) { zone(480, 70, 440, 40 + rows.length * 32, '응답 헤더', { fill: SOFT });
    rows.forEach((s, i) => { const op = clamp(n - i); if (op > 0) mono(496, 122 + i * 32, s, { 'font-size': 13.5, opacity: op, 'font-weight': 600 }); }); }
  function s3(t, c) { const { k, u } = c; strip(2);
    if (k === 0) { allowMap(null, 1);
      card(680, 130, 240, 52, { rx: 10, stroke: BAD, sw: 2, dash: '6 5', s: pop(u, 0.8), text: 'Allow-Origin: *', mono: true, fs: 15, color: BAD }); if (u > 1.2) cross(800, 130, 10, pop(u, 1.2));
      note(560, 190, '와일드카드는 쓰지 않는다', fade(u, 1.4), { fill: BAD, 'font-weight': 700 });
      note(40, 280, '운영에서는 이 목록을 환경변수로 주입한다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { allowMap(null, 0.5);
      card(240, 320, 400, 70, { rx: 12, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 0.2) }); tx(60, 312, '브라우저 · https://app.example.com 의 페이지', { 'font-size': 14, 'font-weight': 700, fill: INFO });
      mono(60, 340, 'Origin: https://app.example.com', { 'font-size': 14.5, 'font-weight': 700 });
      fly(240, 340, 700, 300, seg(u, 0.7, 1.4), 'Origin', { fill: INFO });
      card(700, 300, 380, 52, { rx: 10, stroke: INK, sw: 2, s: pop(u, 1.3) }); code(530, 306, 'origin := c.GetHeader("Origin")', { fs: 14.5, op: fade(u, 1.4) });
      note(510, 360, '브라우저가 다른 출처로 보낼 때 자동으로 붙인다', fade(u, 1.8), { fill: INK }); return; }
    const rows = ['Access-Control-Allow-Origin: https://app…', 'Access-Control-Allow-Methods: GET, POST, …', 'Access-Control-Allow-Headers: …Authorization', 'Access-Control-Allow-Credentials: true', 'Access-Control-Max-Age: 86400'];
    if (k === 2 || k === 3) { allowMap(0, 1); grow(440, 120, 476, 120, E(u, 0.2, 0.5), GOOD);
      respHeaders(rows, k === 2 ? 2 * E(u, 0.4, 1.4) : 2 + 3 * E(u, 0.2, 1.6));
      if (k === 2) note(40, 290, '목록에 있는 Origin 을 그대로 돌려준다', fade(u, 1.6), { fill: INK, 'font-weight': 700 });
      if (k === 3) { clock(110, 320, 26, E(u, 1.6, 2.4), INFO, '86400s');
        note(160, 306, 'preflight 결과를 이만큼 기억하라는 요청', fade(u, 1.8)); note(160, 332, '브라우저마다 상한이 있다 (Chrome 7200초)', fade(u, 2.0), { fill: WARN, 'font-weight': 700 }); }
      return; }
    if (k === 4) { // preflight
      const lanes = [['OPTIONS /api/v1/users', '204 No Content · 여기서 끝', WARN, 130], ['POST /api/v1/users', 'c.Next() → 핸들러', GOOD, 280]];
      LAY.slice(2).forEach((s, i) => card(440 + i * 130, 205, 116, 36, { rx: 8, stroke: GRID, sw: 1.5, text: s, mono: true, fs: 13.5, color: MUT }));
      lanes.forEach(([a, b2, col, y], i) => { const at = 0.2 + i * 1.0; card(170, y, 280, 44, { rx: 22, stroke: col, sw: 2.4, text: a, mono: true, fs: 14, color: col, s: pop(u, at) });
        const end = i === 0 ? 440 : 830; dot([[310, y], [end, y]], seg(u, at + 0.2, at + 0.8), col, 7);
        if (u > at + 0.8) { if (i === 0) { cross(470, y, 10, 1); note(500, y + 5, b2, 1, { fill: col, 'font-weight': 700 }); } else { check(850, y, 10, 1); note(600, y + 34, b2, 1, { fill: col, 'font-weight': 700 }); } } });
      note(40, 380, '사전 질의는 헤더만 확인하고 끊는다 · 핸들러까지 가면 라우트가 없어 404', fade(u, 2.2), { fill: INK }); return; }
    // k === 5: 허용 안 된 출처
    allowMap(null, 1);
    card(680, 120, 380, 52, { rx: 26, stroke: BAD, sw: 2.4, fill: BADBG, text: 'Origin: https://evil.example', mono: true, fs: 14.5, color: BAD, s: pop(u, 0.2) });
    note(500, 196, '목록에 없다 · CORS 헤더를 붙이지 않는다', fade(u, 0.8), { fill: BAD, 'font-weight': 700 });
    note(500, 222, '브라우저가 응답을 페이지 스크립트에 넘기지 않는다', fade(u, 1.1), { fill: INK });
    ['* 금지 (Credentials 와는 함께 쓸 수도 없다)', 'origin 목록은 env 로 주입', 'Max-Age 로 OPTIONS 횟수 줄이기', '대안: github.com/gin-contrib/cors'].forEach((s, i) => { const y = 280 + i * 34;
      check(56, y - 5, 7, pop(u, 1.4 + i * 0.2)); tx(76, y, s, { 'font-size': 14.5, opacity: fade(u, 1.4 + i * 0.2) }); }); }

  // ---------- 4. Auth (JWT) ----------
  const JH = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', JP = 'eyJ1c2VyX2lkIjo3LCJyb2xlIjoidXNlciJ9', JS = 'XNkRN0i7fbP-EpKqQxoAnhHrxeV4kIc16il4dB1ucd8';
  function token3(y, f, o) { o = o || {}; const cut = (s) => s.slice(0, 16) + '…', parts = [[cut(JH), INFO], [cut(JP), ACC], [cut(JS), WARN]], fs = 15, gap = 60 * f;
    let x = 480 - (tw(parts.map((p) => p[0]).join('.'), fs) + 2 * gap) / 2;
    parts.forEach(([s, col], i) => { mono(x, y, s, { 'font-size': fs, 'font-weight': 700, fill: col, opacity: o.op ?? 1 }); x += tw(s, fs);
      if (i < 2) { mono(x + gap / 2, y, '.', { 'font-size': fs, fill: MUT, 'text-anchor': 'middle', opacity: 1 - f }); x += gap + (f < 0.5 ? tw('.', fs) : 0); } }); }
  function s4(t, c) { const { k, u } = c; strip(3);
    if (k === 0) { card(240, 190, 400, 190, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) });
      ['type Claims struct {', '  UserID int    `json:"user_id"`', '  Role   string `json:"role"`', '  jwt.RegisteredClaims', '}'].forEach((s, i) => code(58, 130 + i * 30, s, { fs: 14.5, op: fade(u, 0.3 + i * 0.15) }));
      note(70, 310, '임베딩으로 exp · iat · sub 같은 표준 필드를 받는다', fade(u, 1.3));
      card(700, 160, 340, 70, { rx: 12, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 1.0) }); lock(560, 158, true, BAD, 0.9); code(590, 166, 'jwtSecret = "change-me…"', { fs: 14, op: fade(u, 1.1) });
      note(700, 222, '소스에 두지 말고 환경변수·시크릿 매니저로', fade(u, 1.6), { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { tx(40, 100, '요청 헤더', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      mono(40, 140, 'Authorization: Bearer ' + JH.slice(0, 20) + '…', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      fly(300, 150, 300, 250, seg(u, 0.8, 1.4), 'h', { mono: true, stay: true });
      code(340, 256, 'h := c.GetHeader("Authorization")', { fs: 15, op: fade(u, 1.2) });
      note(40, 340, '쿼리스트링으로 받으면 접속 로그에 토큰이 남는다 · 헤더로 받는다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const f = E(u, 0.6, 1.4);
      card(250, 120, 140, 44, { rx: 8, stroke: MUT, sw: 2, text: 'Bearer ', mono: true, fs: 16, color: MUT, op: 1 - f * 0.8 });
      card(lerp(530, 560, f), lerp(120, 120, f), 400, 44, { rx: 8, stroke: ACC, sw: 2.4, text: JH.slice(0, 26) + '…', mono: true, fs: 14.5, color: ACC });
      if (f > 0.5) { mono(250, 182, 'TrimPrefix', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); mono(560, 182, 'raw', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC }); }
      card(480, 300, 600, 58, { rx: 12, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 1.6) });
      mono(200, 306, 'Bearer 가 없으면', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) }); mono(370, 306, '→ 401 missing bearer token', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.7) });
      note(480, 380, '싼 검사를 앞에 두면 서명 검증을 아낀다', fade(u, 2.1), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const f = E(u, 0.3, 1.1); token3(110, f);
      if (f > 0.9) { [['헤더', INFO, 190], ['페이로드', ACC, 480], ['서명', WARN, 780]].forEach(([s, col, x]) => tx(x, 142, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col })); }
      grow(480, 156, 480, 210, E(u, 1.2, 1.6), ACC);
      card(480, 260, 420, 80, { rx: 12, stroke: ACC, sw: 2.4, fill: ACCBG, s: pop(u, 1.5) });
      mono(300, 254, 'claims = &Claims{', { 'font-size': 15, opacity: fade(u, 1.6) }); mono(320, 280, 'UserID: 7, Role: "user" }', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      note(480, 330, '빈 Claims 를 넘기면 파싱 결과가 그 포인터에 채워진다 (값은 예시)', fade(u, 2.0), { 'text-anchor': 'middle' });
      note(480, 390, 'base64url 이라 누구나 읽을 수 있다 · 믿는 근거는 서명뿐', fade(u, 2.3), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { token3(80, 1, { op: 0.35 });
      card(260, 170, 380, 56, { rx: 10, stroke: INFO, sw: 2, text: '{"alg":"HS256","typ":"JWT"}', mono: true, fs: 15, color: INFO, s: pop(u, 0.2) });
      note(260, 214, '헤더를 풀면', fade(u, 0.4), { 'text-anchor': 'middle' });
      [['HS256', 'SigningMethodHMAC', true], ['none', '서명 없음', false], ['RS256', '다른 방식', false]].forEach(([a, b2, ok], i) => { const y = 150 + i * 60, at = 0.8 + i * 0.4;
        card(640, y, 120, 44, { rx: 8, stroke: ok ? GOOD : BAD, sw: 2.2, text: a, mono: true, fs: 15, color: ok ? GOOD : BAD, s: pop(u, at) });
        tx(710, y + 5, b2, { 'font-size': 14, opacity: fade(u, at) }); (ok ? check : cross)(880, y, 10, pop(u, at + 0.2)); });
      note(480, 360, '토큰이 말한 알고리즘을 믿지 않고 서버가 정한 것만 받는다', fade(u, 2.1), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { [['서명이 다르다', 'signature is invalid'], ['exp 가 지났다', 'token is expired'], ['형식이 틀렸다', 'token is malformed']].forEach(([a, b2], i) => { const y = 110 + i * 70, at = 0.2 + i * 0.4;
        card(200, y, 300, 50, { rx: 10, stroke: BAD, sw: 2, s: pop(u, at), text: a, fs: 15, color: BAD }); grow(352, y, 470, 220, E(u, at + 0.3, at + 0.7), BAD); note(56, y + 34, b2, fade(u, at + 0.2), { 'font-size': 13.5 }); });
      card(650, 220, 330, 60, { rx: 30, stroke: BAD, sw: 2.4, fill: BADBG, s: pop(u, 1.5), text: '401 invalid token: …', mono: true, fs: 15, color: BAD });
      note(650, 290, 'Abort · 핸들러에 도달하지 않는다', fade(u, 1.9), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); return; }
    if (k === 6) { zone(300, 90, 360, 130, 'c.Keys', { fill: PANEL, stroke: ACC, sw: 2.4, color: ACC });
      [['"userID"', '7'], ['"role"', '"user"']].forEach(([a, b2], i) => { const y = 146 + i * 40, f = E(u, 0.3 + i * 0.4, 0.8 + i * 0.4); if (f <= 0) return;
        el('rect', { x: 312, y: y - 24, width: 336 * f, height: 34, rx: 6, fill: ACCBG }); mono(326, y, a, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: f }); mono(470, y, b2, { 'font-size': 15, opacity: f }); });
      note(480, 250, '검증이 끝난 신원만 다음으로 넘긴다 (값은 예시)', fade(u, 1.2), { 'text-anchor': 'middle' });
      dot([[480, 280], [480, 340]], seg(u, 1.6, 2.2), ACC, 8); card(480, 360, 220, 44, { rx: 22, stroke: ACC, sw: 2.4, text: 'c.Next()', mono: true, fs: 16, color: ACC, s: pop(u, 2.1) }); return; }
    // k === 7: 인가
    code(40, 90, 'if c.GetString("role") != "admin" {', { fs: 15, op: fade(u, 0.1) });
    [['role = "admin"', '200 {"ok":true}', GOOD, 170], ['role = "user"', '403 {"error":"admin only"}', WARN, 250], ['토큰 없음 · 틀림', '401 (Auth 에서 이미)', BAD, 330]].forEach(([a, b2, col, y], i) => { const at = 0.4 + i * 0.45;
      card(170, y, 240, 48, { rx: 24, stroke: col, sw: 2.2, text: a, mono: true, fs: 14.5, color: col, s: pop(u, at) }); grow(292, y, 470, y, E(u, at + 0.2, at + 0.5), col);
      card(640, y, 330, 48, { rx: 10, stroke: col, sw: 2.2, fill: PANEL, text: b2, mono: true, fs: 14.5, color: col, s: pop(u, at + 0.4) }); });
    note(820, 380, '401 누군지 모른다 · 403 알지만 권한 없음', fade(u, 2.1), { 'text-anchor': 'end', fill: INK, 'font-weight': 700 }); }

  // ---------- 5. RateLimit (토큰 버킷) ----------
  function bucket(cx, cy, tok, o) { o = o || {}; const w = o.w || 150, h = o.h || 170, cap = 20, sc = o.s ?? 1;
    const g = R.G(cx, cy, sc);
    el('path', { d: `M${-w / 2},${-h / 2} L${-w / 2 + 10},${h / 2} L${w / 2 - 10},${h / 2} L${w / 2},${-h / 2}`, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < cap; i++) { const r = Math.floor(i / 4), cI = i % 4, x = -48 + cI * 32, y = h / 2 - 18 - r * 30, on = i < tok;
      el('circle', { cx: x, cy: y, r: 11, fill: on ? WARN : 'none', stroke: on ? 'none' : GRID, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: on ? clamp(tok - i) : 1 }, g); }
    if (o.label) tx(0, h / 2 + 26, o.label, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }, g);
    if (o.count !== false) mono(0, -h / 2 - 12, `${Math.round(tok)} / ${cap}`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: tok < 1 ? BAD : INK }, g); }
  function ipMap(rows, o) { o = o || {}; zone(40, 70, 330, 60 + rows.length * 40, 'limiters  map[ip]*rate.Limiter', { fill: PANEL, stroke: GRID, sw: 1.5 });
    lock(340, 92, !!o.locked, o.locked ? WARN : MUT, 0.8);
    rows.forEach(([ip, st], i) => { const y = 124 + i * 40, hot = o.hot === i; if (hot) el('rect', { x: 50, y: y - 24, width: 310, height: 34, rx: 6, fill: o.hotCol || GOODBG });
      mono(62, y, ip, { 'font-size': 15, 'font-weight': 700, opacity: st ?? 1 }); mono(240, y, '→ 버킷', { 'font-size': 14, fill: MUT, opacity: st ?? 1 }); }); }
  function s5(t, c) { const { k, u } = c; strip(4);
    if (k === 0) { card(220, 200, 360, 200, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.1) });
      [['type IPRateLimiter struct {', ''], ['  mu       sync.RWMutex', '잠금'], ['  limiters map[string]*rate.Limiter', ''], ['  r        rate.Limit', '초당 보충'], ['  b        int', '버킷 크기'], ['}', '']].forEach(([s, d], i) => { code(52, 126 + i * 30, s, { fs: 14, op: fade(u, 0.2 + i * 0.15) }); });
      lock(560, 140, true, WARN, pop(u, 1.2)); note(590, 146, '요청마다 다른 goroutine 이 맵을 만진다', fade(u, 1.3), { fill: INK, 'font-weight': 700 });
      note(590, 172, '그래서 잠금을 같이 둔다', fade(u, 1.5));
      note(560, 240, 'r = 지속 처리량, b = 순간 폭주 허용량', fade(u, 1.9), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { code(40, 90, 'NewIPRateLimiter(rate.Limit(10), 20)', { fs: 16, op: fade(u, 0.1) });
      bucket(480, 260, 20 * E(u, 0.4, 1.8), { label: '새 버킷은 가득 찬 채로 시작' });
      for (let i = 0; i < 3; i++) dot([[700, 120], [560, 170]], (t * 0.9 + i / 3) % 1, WARN, 6);
      note(700, 110, '초당 토큰 10개 보충', 1, { fill: WARN, 'font-weight': 700 }); note(700, 330, '최대 20개까지 쌓인다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { ipMap([['1.2.3.4'], ['10.0.0.8']], { locked: u > 0.3, hot: u > 1.0 ? 0 : null });
      card(640, 130, 380, 52, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.2) }); code(470, 136, 'l.mu.Lock(); defer l.mu.Unlock()', { fs: 14, op: fade(u, 0.3) });
      fly(640, 250, 210, 124, seg(u, 0.6, 1.0), '1.2.3.4', { mono: true, fill: INFO });
      if (u > 1.1) { bucket(640, 300, 14, { s: 0.6, count: false }); note(720, 270, '있으면 그 버킷을 그대로', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 }); }
      note(40, 300, '요청마다 새로 만들면 제한이 걸리지 않는다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { const f = E(u, 1.0, 1.6); ipMap(f > 0.5 ? [['1.2.3.4'], ['10.0.0.8'], ['5.6.7.8', f]] : [['1.2.3.4'], ['10.0.0.8']], { locked: true, hot: f > 0.5 ? 2 : null, hotCol: ACCBG });
      fly(640, 250, 210, 204, seg(u, 0.2, 0.6), '5.6.7.8', { mono: true, fill: INFO });
      if (u > 0.6) note(470, 120, '맵에 없다', fade(u, 0.6), { fill: WARN, 'font-weight': 700 });
      card(650, 150, 300, 48, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.7) }); code(520, 156, 'rate.NewLimiter(l.r, l.b)', { fs: 14.5, op: fade(u, 0.8) });
      bucket(650, 310, 20, { s: 0.6, count: false, col: ACC }); note(740, 300, '20개로 시작', fade(u, 1.3), { fill: ACC, 'font-weight': 700 });
      note(40, 330, '맵이 계속 자라므로 운영에서는 오래된 IP 를 지운다', fade(u, 2.0), { fill: INK }); return; }
    if (k === 4) { card(200, 120, 300, 50, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.2) }); code(70, 126, 'c.ClientIP()', { fs: 15 }); mono(250, 126, '"1.2.3.4"', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) });
      grow(352, 120, 470, 220, E(u, 0.7, 1.1), INFO); bucket(600, 250, 20, { label: '1.2.3.4 의 버킷', s: pop(u, 1.0) });
      note(40, 300, '로그인 사용자라면 IP 대신 userID 를 키로', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); note(40, 326, 'IP 하나에 여러 사람이 있을 수 있다', fade(u, 2.0)); return; }
    if (k === 5) { // 동시에 25건
      const n = Math.floor(25 * E(u, 0.2, 2.2)), tok = Math.max(0, 20 - n);
      bucket(480, 240, tok, { label: 'Allow() 가 토큰 1개씩 쓴다' });
      for (let i = 0; i < 25; i++) { const x = 60 + (i % 5) * 30, y = 120 + Math.floor(i / 5) * 34, done = i < n, ok = i < 20;
        el('circle', { cx: x, cy: y, r: 10, fill: done ? (ok ? GOOD : BAD) : PANEL, stroke: done ? 'none' : MUT, 'stroke-width': 1.5 }); }
      tx(60, 300, '같은 IP 동시 요청 25건 (예시)', { 'font-size': 14, 'font-weight': 700 });
      if (n > 20) { card(760, 180, 220, 50, { rx: 25, stroke: BAD, sw: 2.4, fill: BADBG, text: `429 × ${n - 20}`, mono: true, fs: 17, color: BAD });
        note(760, 226, 'rate limit exceeded', 1, { 'text-anchor': 'middle', fill: BAD }); }
      if (n >= 20) card(760, 110, 220, 50, { rx: 25, stroke: GOOD, sw: 2.4, fill: GOODBG, text: '통과 20', mono: true, fs: 17, color: GOOD });
      return; }
    if (k === 6) { bucket(200, 250, 6, { label: '토큰이 남아 있다' });
      dot([[290, 200], [520, 200]], seg(u, 0.2, 0.9), GOOD, 8);
      card(620, 200, 200, 48, { rx: 24, stroke: GOOD, sw: 2.4, text: 'c.Next()', mono: true, fs: 16, color: GOOD, s: pop(u, 0.8) });
      grow(722, 200, 790, 200, E(u, 1.0, 1.3), GOOD); card(860, 200, 130, 48, { rx: 8, stroke: INK, sw: 2, text: 'Handler', mono: true, fs: 15, s: pop(u, 1.2) });
      note(480, 330, '막힌 요청은 DB 도 외부 API 도 건드리지 않는다', fade(u, 1.8), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); return; }
    // k === 7: 서버 여러 대
    tx(40, 86, '서버 3대 예시 · 로드밸런서가 요청을 고르게 나눈다', { 'font-size': 15, 'font-weight': 700 });
    [0, 1, 2].forEach((i) => { const cx = 170 + i * 180; R.server(cx, 170, '서버 ' + (i + 1), { s: pop(u, 0.2 + i * 0.2) }); bucket(cx, 310, 20, { s: 0.42 * pop(u, 0.5 + i * 0.2), count: false }); });
    note(350, 400, '버킷이 서버마다 따로 → IP 당 초당 10 × 3 = 30', fade(u, 1.4), { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
    card(800, 220, 220, 120, { rx: 12, stroke: GOOD, sw: 2.4, fill: GOODBG, s: pop(u, 1.8) });
    tx(800, 206, 'redis 공유 카운터', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
    tx(800, 236, '모든 서버가 같은 값을 본다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: INK, opacity: fade(u, 2.0) });
    mono(800, 262, 'ulule/limiter', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: 'Logger가 status와 latency를 c.Next() 뒤에서 읽는 이유는 무엇인가?',
      o: ['c.Next()가 돌아와야 핸들러가 끝나 값이 확정되기 때문', 'c.Next() 앞에서는 slog를 부를 수 없기 때문', '요청 ID가 c.Next() 안에서 만들어지기 때문'], a: 0,
      why: 'c.Next() 한 줄 안에서 안쪽 체인과 핸들러가 다 돈다. 돌아온 뒤에야 c.Writer.Status()와 경과 시간이 확정된다.' },
    { q: 'Recovery 없이 gin 핸들러에서 nil 포인터 panic이 나면 어떻게 되나?',
      o: ['서버 프로세스가 바로 종료된다', 'net/http가 panic을 잡아 로그를 남기고 그 연결을 끊는다', '클라이언트가 500 응답을 받는다'], a: 1,
      why: 'net/http는 연결마다 recover를 걸어 두고 panic을 로그로 남긴 뒤 연결을 끊는다. 서버는 살지만 클라이언트는 응답을 못 받는다.' },
    { q: 'Origin이 https://evil.example인 요청에 이 CORS 미들웨어는 무엇을 하나?',
      o: ['Allow-Origin에 *를 넣어 준다', '403 응답을 돌려준다', 'CORS 헤더를 붙이지 않아 브라우저가 응답을 막게 한다'], a: 2,
      why: 'allowedOrigins에 없는 출처라 헤더를 붙이지 않는다. 브라우저는 허용 헤더가 없는 응답을 페이지 스크립트에 넘기지 않는다.' },
    { q: 'ParseWithClaims 콜백에서 t.Method가 HMAC인지 먼저 확인하는 이유는 무엇인가?',
      o: ['토큰이 내세운 알고리즘을 그대로 믿으면 바꿔치기 공격에 뚫리기 때문', '확인하지 않으면 exp 검사가 꺼지기 때문', 'HMAC이 아니면 Claims 구조체를 채울 수 없기 때문'], a: 0,
      why: 'alg 값은 토큰을 보낸 쪽이 정한다. 서버가 HS256만 받도록 막아야 none이나 다른 방식으로 위조한 토큰을 거른다.' },
    { q: 'NewIPRateLimiter(rate.Limit(10), 20)인 서버에 한 IP가 동시에 25건을 보냈다. 몇 건이 429를 받나?',
      o: ['0건', '5건', '15건'], a: 1,
      why: '새 버킷은 토큰 20개로 시작한다. 동시에 온 25건 중 20건이 토큰을 하나씩 쓰고, 남은 5건은 Allow()가 false라 429를 받는다.' },
  ];

  const summary = [
    '미들웨어는 c.Next() 앞에서 요청을 보고, 뒤에서 확정된 상태 코드와 걸린 시간을 본다.',
    'Recovery는 defer recover()로 panic을 잡아 500으로 바꾼다. 없으면 연결이 응답 없이 끊긴다.',
    'CORS는 허용 목록에 있는 Origin에만 헤더를 붙이고, preflight OPTIONS는 204로 끝낸다.',
    'Auth는 서명과 알고리즘을 확인해 아니면 401을 주고, RateLimit은 토큰이 떨어지면 429를 준다.',
  ];
  const review = [
    { q: '체인이 Recovery, Logger 순서다. panic이 난 요청만 접근 로그에 없고 클라이언트는 500을 받았다. 왜 그럴까?',
      o: ['CORS가 그 요청의 헤더를 지웠다', 'panic이 Logger의 c.Next() 뒤 코드를 건너뛰고 바깥 Recovery에서 잡혔다', 'RateLimit이 429로 바꿨다'], a: 1,
      why: 'panic은 Logger 함수를 거쳐 위로 올라가므로 c.Next() 다음 줄의 로그가 실행되지 않는다. 500은 바깥 Recovery가 쓴 것이다.' },
    { q: '서버를 3대로 늘렸더니 IP당 제한이 3배로 느슨해졌다. 먼저 바꿀 것은?',
      o: ['버킷 크기 b를 0으로 둔다', 'Allow() 전에 c.Next()를 부른다', '카운터를 redis 같은 공유 저장소로 옮긴다'], a: 2,
      why: '메모리 버킷은 서버마다 따로라 허용량이 대수만큼 곱해진다. 모든 서버가 같은 카운터를 봐야 한도가 지켜진다.' },
    { q: '유효한 토큰을 가진 일반 사용자가 /admin에서 403을 받았다. 이 응답을 쓴 곳은?',
      o: ['adminOnly 핸들러의 role 검사', 'JWT 미들웨어의 서명 검증', 'CORS 미들웨어의 preflight 처리'], a: 0,
      why: '서명 검증을 통과했으니 401은 아니다. 신원은 맞지만 role이 admin이 아니라서 핸들러가 403을 돌려준 것이다.' },
  ];

  R.page({ title: '미들웨어 체인 · gin', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
