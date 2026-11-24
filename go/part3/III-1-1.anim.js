/* III-1-1 net/http 5줄 서버 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 터미널(curl) → :8080 포트 → ServeMux 패턴 표 → 핸들러 func(w, r) → 응답 바이트.
 * 숫자·문자열은 페이지 코드(main.go, handler.go, routes.go, response.go, server.go)에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // Go 코드 한 줄 색칠: 예약어는 굵게, 문자열은 강조색
  const KW = /^(func|package|import|return|if|else|switch|case|default|go|defer|type|struct|var|nil|make|chan)$/;
  function goTok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '"' || ch === '`') { flush(); const e = line.indexOf(ch, i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  const code = (x, y, s, o) => { o = o || {}; return R.spans(x, y, goTok(s), { 'font-size': o.fs || 15, opacity: o.op ?? 1, 'text-anchor': o.anchor }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 14.5, fill: MUT, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 5줄 서버 ----------
  const PORT = [420, 215];
  function port(open, sc, label) { const [x, y] = PORT, g = R.G(x, y, sc ?? 1);
    el('circle', { cx: 0, cy: 0, r: 30, fill: open ? ACCBG : PANEL, stroke: open ? ACC : OFF, 'stroke-width': 3, 'stroke-dasharray': open ? null : '6 5' }, g);
    el('rect', { x: -9, y: -12, width: 18, height: 24, rx: 3, fill: open ? ACC : OFF }, g);
    mono(0, 52, ':8080', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: open ? ACC : MUT }, g);
    if (label) tx(0, 74, label, { 'text-anchor': 'middle', 'font-size': 13.5, fill: open ? ACC : MUT, 'font-weight': 600 }, g); }
  function muxTable(fill, o) { o = o || {}; const x = 500, y = 40, w = 430;
    zone(x, y, w, 100, 'DefaultServeMux · 기본 라우팅 표', { fill: PANEL, stroke: GRID, sw: 1.5 });
    tx(x + 16, y + 48, '패턴', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(x + 120, y + 48, '핸들러', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (fill <= 0) return; const rw = (w - 20) * clamp(fill);
    el('rect', { x: x + 10, y: y + 58, width: rw, height: 32, rx: 6, fill: o.hot ? ACCBG : SOFT, stroke: o.hot ? ACC : 'none', 'stroke-width': 2 });
    const op = seg(fill, 0.5, 1);
    mono(x + 18, y + 80, '"/"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op });
    mono(x + 120, y + 80, 'func(w, r) { Fprintln(…) }', { 'font-size': 14.5, opacity: op }); }
  function handlerCard(sc, hot) { card(735, 232, 330, 78, { rx: 10, stroke: hot ? ACC : INK, sw: hot ? 2.6 : 2, s: sc });
    if (sc < 0.5) return; mono(590, 222, 'func(w, r)', { 'font-size': 15, 'font-weight': 700, fill: INFO });
    code(590, 248, 'fmt.Fprintln(w, "Hello, Go!")', { fs: 14.5 }); }
  function imports(k, u) { zone(20, 214, 330, 182, 'main.go 의 import', { fill: SOFT });
    ['"fmt"', '"net/http"'].forEach((s, i) => { const at = 0.3 + i * 0.5, f = k === 0 ? E(u, at, at + 0.7) : 1;
      const cx = lerp(110 + i * 150, 100 + i * 150, f), cy = lerp(190, 262, f); if (f > 0) pill(cx, cy, s, ACC, 1, { mono: true, fs: 15, fill: PANEL, op: clamp(f * 2) }); });
    note(36, 300, '둘 다 Go 표준 라이브러리', k === 0 ? fade(u, 1.4) : 1, { fill: INK, 'font-weight': 700 });
    card(185, 352, 296, 52, { rx: 8, stroke: GRID, sw: 1.5, s: k === 0 ? pop(u, 1.8) : 1 });
    if (k > 0 || u > 2) { mono(52, 357, 'go.mod  require ( )', { 'font-size': 14.5 }); tx(320, 357, '외부 의존성 0개', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end' }); } }
  function mainLane(k, u) { const y = 372, x0 = 420, x1 = 640, f = k === 2 ? E(u, 0.8, 1.8) : 1;
    tx(x0, y - 20, 'main 고루틴', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    el('line', { x1: x0, y1: y, x2: lerp(x0, x1, f), y2: y, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' });
    if (f > 0.98) { el('rect', { x: x1 + 8, y: y - 10, width: 6, height: 20, rx: 2, fill: WARN }); el('rect', { x: x1 + 19, y: y - 10, width: 6, height: 20, rx: 2, fill: WARN });
      tx(x1 + 36, y + 5, 'ListenAndServe 에서 멈춰 기다린다', { 'font-size': 14, 'font-weight': 700, fill: WARN }); } }
  function s1(t, c) { const { k, u } = c;
    const tl = k < 2 ? [] : k === 2 ? ['$ go run main.go'] : ['$ go run main.go', '$ curl http://localhost:8080/', ['Hello, Go!', 'var(--good)']];
    const shown = k === 2 ? fade(u, 0.2, 0.8) : k === 3 ? (u < 0.3 ? 1 : u < 1.0 ? 1 + seg(u, 0.3, 1.0) : u < 2.2 ? 2 : 3) : 0;
    terminal(20, 36, 330, 150, tl, shown, { title: '터미널' });
    imports(k, u);
    port(k >= 2, k === 2 ? 1 + 0.12 * Math.sin(seg(u, 0.2, 1.0) * Math.PI) : 1, k < 2 ? '아직 닫혀 있다' : k === 2 ? '열림 · 요청 대기' : null);
    muxTable(k === 0 ? 0 : k === 1 ? E(u, 0.2, 1.2) : 1, { hot: k === 3 && u > 0.9 && u < 1.8 });
    if (k === 0) note(715, 160, 'HandleFunc 전 · 표는 비어 있다', fade(u, 1.0), { 'text-anchor': 'middle' });
    handlerCard(k === 0 ? 0 : k === 1 ? pop(u, 1.2) : 1, k === 3 && u > 1.4 && u < 2.2);
    if (k === 1) note(735, 310, '등록만 했다 · 네트워크는 그대로', fade(u, 1.8), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 });
    if (k >= 2) mainLane(k, u);
    if (k === 3) { dot([[340, 112], [PORT[0] - 26, PORT[1] - 16], [506, 114], [600, 196]], seg(u, 0.3, 1.5), ACC, 7);
      fly(600, 270, 300, 150, seg(u, 1.6, 2.3), 'Hello, Go!', { fill: GOOD, mono: true }); } }

  // ---------- 2. Handler 시그니처 ----------
  const RQ = { x: 30, y: 84, w: 290, h: 250 }, WC = { x: 650, y: 84, w: 280, h: 250 };
  function sig(op) { const s = 'func helloHandler(w http.ResponseWriter, r *http.Request)', x = 480 - tw(s, 16) / 2;
    R.spans(x, 44, [['func ', { 'font-weight': 700, fill: INFO }], ['helloHandler(', {}], ['w http.ResponseWriter', { fill: ACC, 'font-weight': 700 }], [', ', {}], ['r *http.Request', { fill: INFO, 'font-weight': 700 }], [')', {}]], { 'font-size': 16, opacity: op ?? 1 }); }
  function reqCard(method, url, hot, op) { zone(RQ.x, RQ.y, RQ.w, RQ.h, 'r  ·  들어온 요청', { fill: INFOBG, stroke: INFO, sw: 2, op, color: INFO });
    [['Method', method], ['URL', url], ['Header', 'User-Agent: curl…'], ['Body', '(비어 있음)']].forEach(([a, b], i) => { const y = RQ.y + 60 + i * 46;
      if (hot === i) el('rect', { x: RQ.x + 8, y: y - 22, width: RQ.w - 16, height: 34, rx: 6, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: op });
      tx(RQ.x + 18, y, a, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); mono(RQ.x + 92, y, b, { 'font-size': 14.5, 'font-weight': hot === i ? 700 : 400, opacity: op }); }); }
  function wCard(status, body, col, f) { zone(WC.x, WC.y, WC.w, WC.h, 'w  ·  내보낼 응답', { fill: ACCBG, stroke: ACC, sw: 2, color: ACC });
    if (!status) { note(WC.x + WC.w / 2, WC.y + 130, '아직 아무것도 안 썼다', 1, { 'text-anchor': 'middle' }); return; }
    const op = clamp(f ?? 1);
    tx(WC.x + 18, WC.y + 64, '상태', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); mono(WC.x + 70, WC.y + 64, status, { 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: op });
    tx(WC.x + 18, WC.y + 110, '본문', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    card(WC.x + WC.w / 2, WC.y + 160, WC.w - 36, 48, { rx: 8, stroke: col || INK, sw: 2, s: pop(op, 0), text: body, mono: true, fs: 15, color: col || INK }); }
  function lanes(pick, u, act) { const L = [['case GET', 'Fprintf "Hello, %s!"'], ['case POST', 'Fprintf "Created %s"'], ['default', 'http.Error … 405']];
    L.forEach(([a, b], i) => { const y = 150 + i * 70, on = pick === i && act > 0;
      card(485, y, 270, 52, { rx: 8, stroke: on ? (i === 2 ? BAD : GOOD) : GRID, sw: on ? 2.6 : 1.5, fill: on ? (i === 2 ? BADBG : GOODBG) : PANEL });
      mono(362, y - 4, a, { 'font-size': 14.5, 'font-weight': 700, fill: i === 2 ? BAD : INFO }); mono(362, y + 17, b, { 'font-size': 13.5, fill: MUT }); });
    mono(485, 112, 'switch r.Method {', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700 }); }
  function s2(t, c) { const { k, u } = c;
    sig(k === 0 ? fade(u, 0.1, 0.5) : 1);
    if (k === 4) { // struct 핸들러
      card(170, 140, 280, 92, { rx: 10, stroke: INK, s: pop(u, 0.2) }); code(48, 124, 'type UserHandler struct {', { fs: 14.5 }); code(70, 148, 'db *DB', { fs: 14.5 }); mono(48, 172, '}', { 'font-size': 14.5 });
      grow(310, 140, 400, 140, E(u, 0.6, 1.1), ACC);
      card(560, 140, 300, 92, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG, s: pop(u, 0.9) });
      if (u > 1.0) { code(422, 126, 'func (h *UserHandler)', { fs: 14.5 }); mono(422, 150, 'ServeHTTP(w, r)', { 'font-size': 14.5, 'font-weight': 700 }); code(422, 174, '  h.db.ListUsers() …', { fs: 13.5 }); }
      card(830, 140, 190, 92, { rx: 10, stroke: GOOD, sw: 2, dash: '6 5', s: pop(u, 1.4) });
      if (u > 1.5) { tx(830, 128, 'http.Handler', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD }); mono(830, 152, 'ServeHTTP 하나', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); check(830, 178, 10, pop(u, 1.7)); }
      tx(40, 268, '등록하는 두 가지 방법', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      code(40, 304, 'http.HandleFunc("/hello", helloHandler)', { fs: 15, op: fade(u, 1.9) }); note(560, 304, '함수 그대로', fade(u, 1.9));
      code(40, 340, 'http.Handle("/users", &UserHandler{db: db})', { fs: 15, op: fade(u, 2.2) }); note(560, 340, 'struct 가 db 를 들고 간다', fade(u, 2.2));
      return; }
    const method = k === 3 ? 'PUT' : 'GET', hot = k === 1 ? 1 : k >= 2 ? 0 : null;
    reqCard(method, '/hello', hot, k === 0 ? fade(u, 0.5) : 1);
    if (k === 0) { grow(RQ.x + RQ.w + 6, 210, 470, 210, E(u, 0.9, 1.5), INFO); grow(500, 210, WC.x - 8, 210, E(u, 1.4, 2.0), ACC);
      note(400, 196, '입력', fade(u, 1.3), { 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 }); note(572, 196, '출력', fade(u, 1.9), { 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
      wCard(null); return; }
    if (k === 1) { code(485, 128, 'r.URL.Query().Get("name")', { fs: 15, anchor: 'middle', op: fade(u, 0.3) });
      grow(RQ.x + RQ.w + 4, 190, 380, 190, E(u, 0.4, 0.9), INFO);
      card(430, 200, 90, 44, { rx: 8, stroke: WARN, sw: 2, s: pop(u, 0.9), text: '""', mono: true, fs: 16, color: WARN });
      note(430, 246, '?name= 이 없다', fade(u, 1.1), { 'text-anchor': 'middle' });
      grow(480, 200, 520, 200, E(u, 1.3, 1.7), MUT);
      card(570, 200, 96, 44, { rx: 8, stroke: GOOD, sw: 2.4, s: pop(u, 1.7), text: '"guest"', mono: true, fs: 15, color: GOOD });
      code(485, 300, 'if name == "" { name = "guest" }', { fs: 14.5, anchor: 'middle', op: fade(u, 2.0) });
      wCard(null); return; }
    const pick = k === 3 ? 2 : 0, act = E(u, 0.9, 1.3);
    lanes(pick, u, act);
    dot([[RQ.x + RQ.w, 130], [350, 112], [360, 150 + pick * 70]], seg(u, 0.2, 1.0), INFO, 7);
    if (k === 2) wCard('200 OK', 'Hello, guest!', GOOD, E(u, 1.4, 2.0));
    else wCard('405 Method Not Allowed', 'method not allowed', BAD, E(u, 1.4, 2.0));
    if (k === 2) note(485, 380, 'Fprintf 가 w 를 io.Writer 로 쓴다 · 상태는 자동 200', fade(u, 2.1), { 'text-anchor': 'middle', fill: INK });
    else note(485, 380, 'http.Error 가 상태·본문·Content-Type 을 한 번에 쓴다', fade(u, 2.1), { 'text-anchor': 'middle', fill: INK }); }

  // ---------- 3. ServeMux 패턴 표 ----------
  const ROWS = [['', '/', 'indexHandler'], ['', '/health', 'healthHandler'], ['GET', '/users', 'listUsers'], ['GET', '/users/{id}', 'getUser'], ['POST', '/users', 'createUser'], ['DELETE', '/users/{id}', 'deleteUser']];
  const TB = { x: 300, y: 50, w: 420 };
  function rowY(i) { return TB.y + 46 + i * 44; }
  function patTable(n, k, u, st) { st = st || {};
    zone(TB.x, TB.y, TB.w, 46 + ROWS.length * 44 + 6, 'mux := http.NewServeMux()', { fill: PANEL, stroke: ACC, sw: 2, color: ACC });
    ROWS.forEach(([m, p, h], i) => { const f = clamp(n - i); if (f <= 0) return; const y = rowY(i), mark = st[i];
      el('rect', { x: TB.x + 10, y, width: (TB.w - 20) * f, height: 36, rx: 6, fill: mark === 'win' ? GOODBG : mark === 'lose' ? WARNBG : SOFT, stroke: mark === 'win' ? GOOD : mark === 'lose' ? WARN : 'none', 'stroke-width': 2.4, 'stroke-dasharray': mark === 'lose' ? '6 4' : null });
      if (f < 0.6) return;
      mono(TB.x + 22, y + 24, m || '(모두)', { 'font-size': 14, 'font-weight': 700, fill: m ? (m === 'DELETE' ? BAD : m === 'POST' ? WARN : INFO) : MUT });
      mono(TB.x + 112, y + 24, p, { 'font-size': 15, 'font-weight': 700 });
      mono(TB.x + 270, y + 24, h, { 'font-size': 14.5, fill: MUT }); }); }
  function s3(t, c) { const { k, u } = c;
    // 왼쪽: 전역 기본 표
    const gOp = k === 0 ? 1 : 0.45;
    card(150, 96, 230, 76, { rx: 10, stroke: k === 0 ? INK : OFF, sw: 2, op: gOp, dash: k === 0 ? null : '6 5' });
    tx(150, 90, 'DefaultServeMux', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: gOp }); note(150, 114, '패키지 전역 · 어디서나 등록', gOp, { 'text-anchor': 'middle' });
    if (k === 0) { cross(284, 96, 13, pop(u, 1.4)); note(150, 160, '테스트마다 새 표를 못 만든다', fade(u, 1.6), { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 }); }
    const n = k === 0 ? 0 : k === 1 ? 2 * E(u, 0.2, 1.4) : k === 2 ? 2 + 4 * E(u, 0.2, 2.0) : 6;
    let st = {};
    if (k === 3) { const sc = seg(u, 0.4, 1.4) * 6; if (u > 1.4) st = { 0: 'lose', 3: 'win' }; else if (sc > 0) { const i = Math.min(5, Math.floor(sc)); el('rect', { x: TB.x + 4, y: rowY(i) - 4, width: TB.w - 8, height: 44, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.5 }); } }
    patTable(n, k, u, st);
    if (k === 0) note(TB.x + TB.w / 2, 200, '내 표 · 아직 비어 있다', fade(u, 0.6), { 'text-anchor': 'middle' });
    if (k === 1) note(840, rowY(0) + 24, '"/" = 남은 요청 전부', fade(u, 1.5), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 });
    if (k === 2) { note(840, rowY(3) + 24, '메서드 + {id}', fade(u, 1.6), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 }); note(840, rowY(3) + 46, 'Go 1.22 부터', fade(u, 1.8), { 'text-anchor': 'middle' }); }
    if (k === 3) { card(150, 250, 220, 48, { rx: 24, stroke: INFO, sw: 2.4, fill: INFOBG, text: 'GET /users/42', mono: true, fs: 15, color: INFO, s: pop(u, 0.1) });
      if (u > 1.4) { note(TB.x + TB.w + 14, rowY(0) + 24, '맞지만 덜 구체적', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); note(TB.x + TB.w + 14, rowY(3) + 24, '더 구체적 · 선택', fade(u, 1.5), { fill: GOOD, 'font-weight': 700 }); }
      fly(TB.x + 200, rowY(3) + 18, 150, 330, seg(u, 1.7, 2.3), 'id = "42"', { mono: true, fill: GOOD, stay: true });
      if (u > 2.3) { mono(150, 372, 'r.PathValue("id")', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
        card(840, 330, 170, 46, { rx: 8, stroke: GOOD, sw: 2.4, text: 'user #42', mono: true, fs: 16, color: GOOD, s: pop(u, 2.4) }); } }
    if (k === 4) {
      const s1 = 'http.ListenAndServe(":8080", ', x0 = 480 - (tw(s1, 16) + 50) / 2, f = E(u, 0.6, 1.4);
      code(x0, 396, s1, { fs: 16 });
      const sx = x0 + tw(s1, 16) + 4;
      mono(sx, 396, 'nil', { 'font-size': 16, fill: MUT, opacity: 1 - f, 'text-decoration': 'line-through' });
      mono(sx, 396 - 22 * (1 - f), 'mux', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: f }); mono(sx + 34, 396, ')', { 'font-size': 16 });
      if (u > 1.5) { cross(284, 96, 13, pop(u, 1.5)); note(150, 160, '이제 안 쓴다', fade(u, 1.6), { 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 }); } } }

  // ---------- 4. ResponseWriter ----------
  const HM = { x: 30, y: 52, w: 390 }, RS = { x: 470, y: 52, w: 460, h: 300 };
  function headerMap(rows, locked, f) { zone(HM.x, HM.y, HM.w, 64 + rows.length * 34, 'w.Header() · 헤더 맵', { fill: PANEL, stroke: locked ? OFF : INFO, sw: 2, color: locked ? MUT : INFO });
    rows.forEach((r, i) => { const op = clamp((f ?? 9) - i); if (op <= 0) return; mono(HM.x + 18, HM.y + 56 + i * 34, r, { 'font-size': 14.5, opacity: op, fill: locked ? MUT : INK }); });
    if (locked) R.lock(HM.x + HM.w - 28, HM.y + 22, true, BAD, 0.9); }
  function wire(lines, shown, o) { o = o || {}; zone(RS.x, RS.y, RS.w, RS.h, o.title || '클라이언트가 받는 응답', { fill: SOFT });
    lines.forEach((ln, i) => { const op = clamp(shown - i); if (op <= 0) return; const [s, col, fw] = Array.isArray(ln) ? ln : [ln];
      mono(RS.x + 18, RS.y + 58 + i * 30, s, { 'font-size': 14.5, fill: col || INK, 'font-weight': fw || 400, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c;
    const H2 = ['Content-Type: application/json', 'X-Request-Id: abc-123'];
    if (k <= 2) { headerMap(H2, k >= 1 && (k > 1 || u > 1.0), k === 0 ? 2 * E(u, 0.2, 1.4) : 9);
      if (k === 0) note(HM.x + 18, HM.y + 150, '지금은 얼마든지 Set/Add 로 바꿀 수 있다', fade(u, 1.6), { fill: INK, 'font-weight': 600 });
      card(HM.x + HM.w / 2, 252, HM.w, 56, { rx: 10, stroke: k >= 1 ? ACC : GRID, sw: 2, fill: k >= 1 ? ACCBG : PANEL });
      mono(HM.x + 18, 258, 'w.WriteHeader(', { 'font-size': 15 }); mono(HM.x + 18 + tw('w.WriteHeader(', 15), 258, k >= 1 ? 'http.StatusCreated' : '…', { 'font-size': 15, 'font-weight': 700, fill: k >= 1 ? ACC : MUT });
      mono(HM.x + 18 + tw('w.WriteHeader(http.StatusCreated', 15), 258, ')', { 'font-size': 15, opacity: k >= 1 ? 1 : 0 });
      card(HM.x + HM.w / 2, 330, HM.w, 56, { rx: 10, stroke: k === 2 ? ACC : GRID, sw: 2, fill: k === 2 ? ACCBG : PANEL });
      code(HM.x + 18, 336, 'json.NewEncoder(w).Encode(user)', { fs: 15, op: k === 2 ? 1 : 0.4 });
      const L = [['HTTP/1.1 201 Created', ACC, 700], 'Content-Type: application/json', 'X-Request-Id: abc-123', ['Date · Content-Length 는 서버가 붙인다', MUT], '', ['{"id":1,"name":"Alice"}', GOOD, 700]];
      const shown = k === 0 ? 0 : k === 1 ? 4 * E(u, 0.6, 1.8) : 4 + 2 * E(u, 0.4, 1.4);
      wire(L, shown);
      if (k === 0) note(RS.x + RS.w / 2, RS.y + 160, '아직 한 바이트도 안 나갔다', 1, { 'text-anchor': 'middle' });
      if (k === 1) { fly(HM.x + HM.w, 252, RS.x + 120, RS.y + 52, seg(u, 0.2, 0.8), '201', { mono: true });
        note(HM.x + 18, HM.y + 150, '이제 헤더를 바꿔도 반영되지 않는다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); }
      if (k === 2) { for (let i = 0; i < 6; i++) dot([[HM.x + HM.w, 330], [RS.x + 60, RS.y + 208]], seg(u, 0.2 + i * 0.12, 0.8 + i * 0.12), GOOD, 5);
        note(HM.x + 18, HM.y + 150, 'Encode 는 끝에 줄바꿈(\\n)을 붙인다', fade(u, 1.5), { fill: INK, 'font-weight': 600 }); }
      return; }
    if (k === 3) { tx(HM.x, 84, 'badExample 의 순서', { 'font-size': 15, 'font-weight': 700 });
      card(HM.x + HM.w / 2, 136, HM.w, 52, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.2) }); code(HM.x + 18, 142, '① w.Write([]byte("hi"))', { fs: 15 });
      card(HM.x + HM.w / 2, 206, HM.w, 52, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.0) }); code(HM.x + 18, 212, '② w.WriteHeader(400)', { fs: 15, op: fade(u, 1.0) });
      const L = [['HTTP/1.1 200 OK', WARN, 700], ['Content-Type: text/plain; charset=utf-8', MUT], '', ['hi', INK, 700]];
      wire(L, 4 * E(u, 0.4, 1.0));
      if (u > 0.5) note(RS.x + 260, RS.y + 58, '← Write 가 자동으로 확정', fade(u, 0.6), { fill: WARN, 'font-weight': 700 });
      const b = seg(u, 1.3, 2.0); if (b > 0 && b < 1) { const bx = lerp(HM.x + HM.w, RS.x + 160, b < 0.6 ? b / 0.6 : 1 - (b - 0.6) / 0.4 * 0.5); card(bx, 206 - 80 * Math.min(1, b / 0.6), 64, 30, { rx: 15, fill: BAD, stroke: 'none', text: '400', mono: true, fs: 14, color: PANEL }); }
      if (u > 1.9) cross(RS.x + 180, RS.y + 52, 13, pop(u, 1.9));
      terminal(HM.x, 262, HM.w, 92, ['서버 로그', ['http: superfluous response.', 'var(--warn)'], ['WriteHeader call …', 'var(--warn)']], u > 2.1 ? 3 : 1, {});
      return; }
    // k === 4: http.Error
    tx(HM.x, 84, 'http.Error(w, "not found", 404) 안에서', { 'font-size': 15, 'font-weight': 700 });
    [['① 헤더', 'Content-Type · nosniff'], ['② 상태', 'WriteHeader(404)'], ['③ 본문', 'Fprintln(w, "not found")']].forEach(([a, b], i) => { const y = 132 + i * 66, s = pop(u, 0.3 + i * 0.4);
      card(HM.x + HM.w / 2, y, HM.w, 54, { rx: 10, stroke: GOOD, sw: 2, s }); tx(HM.x + 18, y + 6, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); code(HM.x + 100, y + 6, b, { fs: 14.5, op: fade(u, 0.4 + i * 0.4) }); });
    const L = [['HTTP/1.1 404 Not Found', BAD, 700], 'Content-Type: text/plain; charset=utf-8', 'X-Content-Type-Options: nosniff', '', ['not found', INK, 700]];
    wire(L, 5 * E(u, 0.6, 2.0));
    note(HM.x, 360, '순서를 틀릴 여지가 없다', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); }

  // ---------- 5. 운영: timeouts · goroutine · signal · Shutdown ----------
  function lane(y, x0, x1, label, f, col) { tx(30, y + 5, label, { 'font-size': 14.5, 'font-weight': 700, fill: col || INK });
    el('line', { x1: x0, y1: y, x2: lerp(x0, x1, clamp(f)), y2: y, stroke: col || INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' }); }
  function pause(x, y) { el('rect', { x: x - 8, y: y - 10, width: 6, height: 20, rx: 2, fill: WARN }); el('rect', { x: x + 3, y: y - 10, width: 6, height: 20, rx: 2, fill: WARN }); }
  function chanBox(x, y, full, op) { zone(x, y, 230, 92, 'quit · chan os.Signal (버퍼 1)', { fill: PANEL, stroke: INFO, sw: 2, color: INFO, op });
    el('rect', { x: x + 70, y: y + 38, width: 90, height: 40, rx: 6, fill: full ? WARNBG : SOFT, stroke: full ? WARN : GRID, 'stroke-width': 2, opacity: op ?? 1 });
    if (full) mono(x + 115, y + 63, 'SIGTERM', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(165, 200, 290, 260, { rx: 12, stroke: INK, s: pop(u, 0.1) });
      ['srv := &http.Server{', '  Addr:    ":8080",', '  Handler: mux,', '  ReadTimeout:  5s', '  WriteTimeout: 10s', '  IdleTimeout:  120s', '}'].forEach((s, i) => code(36, 100 + i * 30, s, { fs: 14.5, op: fade(u, 0.2 + i * 0.08) }));
      const rows = [['ReadTimeout', 5, '요청(헤더+본문)을 다 읽는 시간'], ['WriteTimeout', 10, '응답을 다 쓰는 시간'], ['IdleTimeout', 120, 'keep-alive 연결이 다음 요청을 기다리는 시간']];
      rows.forEach(([n, v, d], i) => { const y = 92 + i * 84, g = E(u, 0.5 + i * 0.4, 1.3 + i * 0.4);
        mono(350, y, n, { 'font-size': 15, 'font-weight': 700 }); R.hbar(350, y + 12, 470, v * g, 120, { h: 18, text: v + 's', col: i === 2 ? INFO : ACC });
        note(350, y + 52, d, fade(u, 0.8 + i * 0.4)); });
      card(640, 375, 560, 40, { rx: 20, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 2.0), text: 'http.ListenAndServe(":8080", nil) 은 셋 다 0 = 제한 없음', fs: 14, color: BAD, mono: false });
      return; }
    if (k <= 2) { const x0 = 170, x1 = 930;
      lane(110, x0, x1, 'main', k === 1 ? E(u, 0.1, 2.0) * 0.55 : 0.55);
      if (k === 1) { grow(260, 114, 260, 214, E(u, 0.5, 0.9), ACC); }
      lane(220, 260, x1, 'go func()', k === 1 ? E(u, 0.8, 2.2) : 1, ACC);
      el('line', { x1: 260, y1: 114, x2: 260, y2: 214, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: k === 1 ? 0 : 1 });
      mono(200, 96, 'srv 생성', { 'font-size': 13.5, fill: MUT }); mono(268, 160, 'go', { 'font-size': 14, 'font-weight': 800, fill: ACC });
      mono(290, 246, 'srv.ListenAndServe()', { 'font-size': 14, fill: ACC, opacity: k === 1 ? fade(u, 1.0) : 1 });
      if (k === 1 || k === 2) for (let i = 0; i < 4; i++) { const ph = ((t * 0.5 + i / 4) % 1); if (k === 2 || u > 1.6) el('circle', { cx: lerp(520, 900, ph), cy: 220, r: 5, fill: ACC, opacity: 0.8 }); }
      mono(360, 96, 'log "server started on :8080"', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 1.4) : 1 });
      const qx = x0 + (x1 - x0) * 0.55;
      if (k === 1) { if (u > 2.0) { pause(qx + 16, 110); mono(qx + 34, 116, '<-quit 에서 대기', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); } chanBox(650, 290, false, fade(u, 1.8)); return; }
      // k === 2: SIGTERM
      const f = E(u, 0.3, 1.0), got = u > 1.5;
      chanBox(650, 290, f > 0.98 && !got);
      if (f < 0.98) fly(420, 340, 765, 348, f, 'SIGTERM', { fill: WARN });
      card(420, 380, 160, 40, { rx: 8, stroke: WARN, sw: 2, text: 'K8s 가 Pod 종료', fs: 14, color: WARN });
      if (!got) { pause(qx + 16, 110); mono(qx + 34, 116, '<-quit 에서 대기', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); }
      else { fly(765, 340, qx + 20, 112, seg(u, 1.5, 2.0), 'SIGTERM', { fill: WARN });
        el('line', { x1: qx, y1: 110, x2: lerp(qx, x1, E(u, 1.9, 2.5)), y2: 110, stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
        mono(qx + 40, 96, 'log "shutting down..."', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 3) { // Shutdown
      tx(30, 60, 'srv.Shutdown(ctx)  ·  ctx 는 최대 10초', { 'font-size': 16, 'font-weight': 700 });
      clock(880, 60, 26, E(u, 0.3, 2.6) * 0.6, WARN, '10s');
      // 리스너 닫힘
      el('circle', { cx: 100, cy: 200, r: 30, fill: PANEL, stroke: u > 0.6 ? OFF : ACC, 'stroke-width': 3 }); mono(100, 252, ':8080', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT });
      if (u > 0.6) cross(100, 200, 16, pop(u, 0.6));
      note(100, 280, '① 리스너부터 닫는다', fade(u, 0.7), { 'text-anchor': 'middle', fill: INK, 'font-weight': 700 });
      fly(20, 140, 70, 180, seg(u, 1.2, 1.7), '새 요청', { fill: BAD });
      if (u > 1.7) note(100, 130, '새 요청은 못 들어온다', fade(u, 1.7), { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
      [0.55, 0.3, 0.75].forEach((p0, i) => { const y = 120 + i * 60, p = lerp(p0, 1, E(u, 0.8, 1.8 + i * 0.3));
        tx(250, y + 5, '처리 중 요청 ' + (i + 1), { 'font-size': 14, fill: MUT, 'font-weight': 600 });
        el('rect', { x: 380, y: y - 9, width: 300, height: 18, rx: 4, fill: SOFT }); el('rect', { x: 380, y: y - 9, width: 300 * p, height: 18, rx: 4, fill: p >= 1 ? GOOD : ACC });
        if (p >= 1) check(705, y, 9, 1); });
      note(380, 316, '② 진행 중 요청이 끝날 때까지 기다린다', fade(u, 1.0), { fill: INK, 'font-weight': 700 });
      card(480, 372, 520, 46, { rx: 10, stroke: GOOD, sw: 2, fill: GOODBG, s: pop(u, 2.2), text: 'ListenAndServe → http.ErrServerClosed (정상 종료 신호)', fs: 14.5, color: GOOD });
      return; }
    // k === 4: K8s 종료 시간표
    const ax = R.axes(90, 150, 780, 120, { x: [0, 30], y: [0, 1], xt: [0, 5, 10, 15, 20, 25, 30], xl: '초' });
    tx(90, 70, 'Pod 종료 요청부터 잰 시간', { 'font-size': 16, 'font-weight': 700 });
    const bar = (a, b, y, col, s, at) => { const g = E(u, at, at + 0.6); if (g <= 0) return; el('rect', { x: ax.X(a), y, width: (ax.X(b) - ax.X(a)) * g, height: 40, rx: 6, fill: col, opacity: 0.85 });
      if (g > 0.9) tx((ax.X(a) + ax.X(b)) / 2, y + 26, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: PANEL }); };
    bar(0, 15, 170, WARN, 'preStop 15초', 0.3);
    bar(15, 25, 220, ACC, 'Shutdown 최대 10초', 1.0);
    if (u > 0.9) { el('line', { x1: ax.X(15), y1: 150, x2: ax.X(15), y2: 275, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); mono(ax.X(15), 142, 'SIGTERM', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: WARN }); }
    if (u > 1.6) { el('line', { x1: ax.X(30), y1: 110, x2: ax.X(30), y2: 270, stroke: BAD, 'stroke-width': 3 }); mono(ax.X(30), 102, 'SIGKILL', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: BAD }); }
    if (u > 1.6) note(ax.X(30) - 8, 128, 'grace 30초', 1, { 'text-anchor': 'end', fill: BAD, 'font-weight': 700 });
    tx(480, 360, '15 + 10 = 25초 < 30초 · 강제 종료 전에 끝난다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: 'http.ListenAndServe(":8080", nil)의 nil은 무엇을 뜻하나?',
      o: ['핸들러가 없어서 모든 요청에 404를 준다', '패키지 전역의 DefaultServeMux를 쓴다', '포트를 운영체제가 골라 준다'], a: 1,
      why: 'Handler 자리에 nil을 넘기면 http.HandleFunc로 채워 둔 DefaultServeMux가 요청을 받는다.' },
    { q: 'helloHandler에 PUT /hello 요청이 오면 클라이언트는 무엇을 받나?',
      o: ['200과 Hello, guest!', '200과 Created guest', '405와 method not allowed'], a: 2,
      why: 'switch r.Method에서 GET과 POST만 다루고 나머지는 default의 http.Error가 405로 거절한다.' },
    { q: 'GET /users/42 요청은 "/"와 "GET /users/{id}" 두 패턴에 모두 맞는다. 누가 받나?',
      o: ['더 구체적인 "GET /users/{id}"의 getUser', '먼저 등록된 "/"의 indexHandler', '두 핸들러가 차례로 실행된다'], a: 0,
      why: 'ServeMux는 등록 순서가 아니라 더 구체적인 패턴을 고른다. "/"는 다른 패턴에 안 걸린 요청만 받는다.' },
    { q: 'w.Write([]byte("hi")) 다음에 w.WriteHeader(400)을 부르면 클라이언트가 받는 상태 코드는?',
      o: ['400', '200', '500'], a: 1,
      why: 'Write가 먼저 불리면 그 순간 200 OK가 확정된다. 뒤늦은 WriteHeader는 superfluous 경고만 남긴다.' },
    { q: 'srv.Shutdown(ctx)를 부른 뒤 백그라운드의 srv.ListenAndServe()는 무엇을 돌려주나?',
      o: ['nil', 'context.DeadlineExceeded', 'http.ErrServerClosed'], a: 2,
      why: 'Shutdown으로 닫힌 서버의 ListenAndServe는 ErrServerClosed를 돌려준다. 그래서 이 값은 에러로 보지 않고 넘긴다.' },
  ];

  const summary = [
    'net/http만으로 서버가 뜬다. HandleFunc로 표에 경로를 적고 ListenAndServe로 포트를 연다.',
    'Go 1.22 ServeMux는 메서드와 {id}를 패턴에 쓰고, 여러 패턴이 맞으면 더 구체적인 쪽이 받는다.',
    '응답은 헤더, WriteHeader, 본문 순서로 쓴다. 본문을 먼저 쓰면 200이 그대로 확정된다.',
    '운영 서버는 타임아웃을 직접 걸고, SIGTERM을 받으면 Shutdown으로 처리 중 요청을 끝낸다.',
  ];
  const review = [
    { q: '"/health"만 등록했는데 GET /healthz 요청이 indexHandler로 갔다. 이유는?',
      o: ['"/" 패턴이 다른 패턴에 안 걸린 요청을 모두 받아서', 'ServeMux가 비슷한 경로를 알아서 고쳐 주어서', 'ListenAndServe에 mux 대신 nil을 넘겨서'], a: 0,
      why: '"/healthz"는 "/health"와 다른 경로다. 어디에도 안 맞은 요청은 전부를 받는 "/" 패턴으로 간다.' },
    { q: '에러 분기에서 w.Write로 메시지를 쓴 뒤 w.WriteHeader(500)을 불렀더니 클라이언트는 200을 받았다. 고치는 방법은?',
      o: ['WriteHeader(500)을 한 번 더 부른다', 'http.Error(w, msg, 500)로 바꾸고 바로 return한다', 'Header().Del("Content-Type")을 먼저 부른다'], a: 1,
      why: 'http.Error는 헤더, 상태, 본문을 올바른 순서로 한 번에 쓴다. return으로 뒤 코드가 더 쓰지 않게 막는다.' },
    { q: '배포할 때마다 처리 중이던 요청이 끊긴다. 먼저 확인할 것은?',
      o: ['ServeMux에 "/" 패턴을 등록했는지', 'IdleTimeout을 120초보다 길게 잡았는지', 'SIGTERM을 받아 srv.Shutdown(ctx)를 부르는지'], a: 2,
      why: '신호를 잡지 않으면 프로세스가 바로 끝나 진행 중 요청이 잘린다. Shutdown은 리스너를 닫고 남은 요청을 기다린다.' },
  ];

  R.page({ title: '요청 흐름 · net/http', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
