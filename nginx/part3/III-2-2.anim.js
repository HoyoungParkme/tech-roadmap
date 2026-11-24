/* III-2-2 세션과 로드 밸런싱 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, crowd, cross, check, clock, lock, snippet, redisBox, kvTable, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  function ngx(cx, cy, o) { o = o || {}; const w = o.w || 112, h = o.h || 60;
    const g = card(cx, cy, w, h, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: o.s, op: o.op });
    tx(0, o.sub ? -3 : 6, 'nginx', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC }, g);
    if (o.sub) mono(0, 17, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  function node(cx, cy, name, o) { o = o || {}; const w = o.w || 100, h = 42, col = o.bad ? BAD : o.hot ? ACC : o.good ? GOOD : INK;
    const g = card(cx, cy, w, h, { rx: 8, stroke: col, sw: o.hot || o.bad || o.good ? 3 : 2, fill: o.bad ? C.BADBG : o.hot ? ACCBG : PANEL, s: o.s, op: o.op, dash: o.dash });
    el('circle', { cx: -w / 2 + 14, cy: 0, r: 5, fill: o.bad ? BAD : GOOD }, g);
    mono(-w / 2 + 26, 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: o.bad ? BAD : INK }, g); return g; }
  // 프로세스 하나 = 이름 + 메모리 안의 SESSIONS dict
  function proc(cx, cy, name, rows, o) { o = o || {}; const w = 300, h = 120;
    card(cx, cy, w, h, { rx: 12, stroke: o.bad ? BAD : o.hot ? ACC : INK, sw: o.hot || o.bad ? 3 : 2, s: o.s, op: o.op });
    if ((o.s ?? 1) < 0.3) return;
    tx(cx - w / 2 + 14, cy - h / 2 + 24, name, { 'font-size': 15, 'font-weight': 800, fill: o.bad ? BAD : INK });
    tx(cx + w / 2 - 14, cy - h / 2 + 24, '프로세스 메모리', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    el('rect', { x: cx - w / 2 + 14, y: cy - 20, width: w - 28, height: 66, rx: 8, fill: SOFT });
    mono(cx - w / 2 + 26, cy + 2, 'SESSIONS = {', { 'font-size': 14.5, 'font-weight': 700 });
    rows.forEach((r, i) => mono(cx - w / 2 + 44, cy + 24 + i * 20, r, { 'font-size': 14, fill: o.gone ? OFF : ACC, 'font-weight': 700, 'text-decoration': o.gone ? 'line-through' : null }));
    mono(cx - w / 2 + 26 + (rows.length ? 0 : 117), cy + (rows.length ? 42 : 2), '}', { 'font-size': 14.5, 'font-weight': 700 }); }
  // nginx ip_hash (ngx_http_upstream_ip_hash_module.c): 앞 세 옥텟, h=89, h=(h*113+b)%6271, 고른 노드가 down 이면 다시 해시
  function ipPick(ip, n, down) { const a = ip.split('.').map(Number).slice(0, 3); let h = 89;
    for (let tries = 0; tries < 20; tries++) { a.forEach((b) => { h = (h * 113 + b) % 6271; }); const p = h % n; if (!(down || []).includes(p)) return p; }
    return -1; }

  const NX = 200;

  // ---------- 1. in-memory 세션 ----------
  const TOK = 'abc';    // 예시 토큰 이름 (코드 주석의 예)
  function s1(t, c) { const { k, u } = c;
    if (k === 4) { // 재시작 → 전부 증발
      proc(300, 130, 'app1 (재시작)', ['"abc" 외 전부'], { bad: true, gone: u > 0.6 });
      if (u > 0.4) clock(470, 70, 16, E(u, 0.4, 1.2), BAD);
      crowd(640, 300, lerp(1, 24, E(u, 0.8, 1.8)), '동시 로그아웃 (예시 10만 명)');
      card(860, 300, 130, 64, { rx: 10, text: 'Auth\n서비스', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.4) });
      for (let j = 0; j < 8; j++) dot([[690, 300], [792, 300]], (t * 1.2 + j / 8) % 1, BAD, 5);
      tx(300, 260, '세션이 사라지면 전부 다시 로그인', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      ['sticky (ip_hash)', 'JWT', 'Redis 세션'].forEach((s, i) => pill(140 + i * 150, 390, s, i ? GOOD : WARN, pop(u, 1.9 + i * 0.2), { fs: 14 }));
      return; }
    person(50, 210, null, {}); ngx(NX, 210);
    const has1 = k >= 1 && (k > 1 || u > 1.4);
    const rows1 = has1 ? [`"${TOK}": {user_id: 42}`] : [];
    proc(600, 110, 'app1', rows1, { s: k === 0 ? pop(u, 0.2) : 1, hot: k === 1 || k === 2 });
    proc(600, 310, 'app2', [], { s: k === 0 ? pop(u, 0.5) : 1, bad: k === 3 && u > 1.4 });
    grow(NX + 56, 200, 448, 110, 1, GRID, { plain: true }); grow(NX + 56, 220, 448, 310, 1, GRID, { plain: true });
    if (k === 0) tx(820, 210, '두 dict 는 남남', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
    if (k === 1) { fly(80, 190, NX - 50, 190, seg(u, 0.2, 0.7), 'POST /login', { mono: true }); dot([[NX + 56, 200], [448, 110]], seg(u, 0.8, 1.4), ACC, 7);
      fly(440, 140, 80, 250, seg(u, 1.6, 2.4), 'token = abc', { mono: true, fill: INK, stay: true }); }
    if (k === 2) { dot([[NX + 56, 200], [448, 110]], seg(u, 0.2, 0.8), ACC, 7);
      el('circle', { cx: 600, cy: 134, r: 30 + 4 * Math.sin(t * 6), fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.8) });
      tx(820, 110, '자기 dict 만 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); }
    if (k === 3) { fly(80, 190, NX - 50, 190, seg(u, 0.2, 0.7), 'GET /me (abc)', { mono: true }); dot([[NX + 56, 220], [448, 310]], seg(u, 0.8, 1.4), ACC, 7);
      if (u > 1.4) card(600, 400, 260, 34, { rx: 17, text: '{"error": "not logged in"}', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.4) });
      tx(820, 310, '세션 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
  }

  // ---------- 2. ip_hash 로 sticky ----------
  const NODES3 = ['app1', 'app2', 'app3'];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { snippet(24, 30, ['upstream backend {', '    ip_hash;', '    server app1~3:8000;', '}'], { fs: 14.5 });
      const steps = [['IP', '203.0.113.45'], ['앞 세 옥텟', '203.0.113'], ['nginx 해시', 'h mod 3'], ['노드', 'app' + (ipPick('203.0.113.45', 3) + 1)]];
      steps.forEach(([h, v], i) => { const x = 140 + i * 220, s = pop(u, 0.4 + i * 0.4); card(x, 290, 180, 70, { rx: 10, stroke: i === 3 ? ACC : INK, sw: 2, s });
        if (s < 0.3) return; tx(x, 276, h, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); mono(x, 302, v, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: i === 3 ? ACC : INK });
        if (i < 3) grow(x + 92, 290, x + 128, 290, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), MUT); });
      return; }
    if (k === 1 || k === 2) { ngx(NX + 80, 210, { sub: 'ip_hash' }); NODES3.forEach((n, i) => node(760, 110 + i * 100, n, { hot: k === 1 ? (i === 0 && u > 1.0) || (i === 2 && u > 2.0) : i === 0 }));
      if (k === 1) { [['203.0.113.45', 0.3, 120], ['198.51.102.30', 1.3, 300]].forEach(([ip, a, y]) => { const p = ipPick(ip, 3);
          person(50, y, null, {}); mono(90, y + 5, ip, { 'font-size': 14.5, 'font-weight': 700 });
          for (let j = 0; j < 2; j++) dot([[90, y], [NX + 24, 210], [NX + 136, 210], [708, 110 + p * 100]], seg(u, a + j * 0.35, a + j * 0.35 + 0.7), ACC, 6);
          mono(860, 110 + p * 100 + 5, '늘 여기', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, a + 0.8) }); });
        pill(760, 30, '세션 유지', GOOD, pop(u, 2.2), { fs: 14 }); return; }
      crowd(80, 210, 24, 'NAT 뒤 100명'); sub(80, 290, 'IP 1개', 1, { 'font-weight': 700 });
      for (let j = 0; j < 10; j++) dot([[120, 210], [NX + 24, 210], [NX + 136, 210], [708, 110]], (t * 0.6 + j / 10) % 1, BAD, 5);
      el('rect', { x: 820, y: 98, width: 110 * E(u, 0.3, 1.6), height: 24, rx: 4, fill: BAD, opacity: 0.8 }); mono(830, 150, '100명', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      mono(830, 250, '0', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); mono(830, 350, '0', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) });
      return; }
    if (k === 3) { // 노드 추가로 재매핑: 이웃한 /24 대역 12개 (10.0.0 ~ 10.0.11)
      const ips = Array.from({ length: 12 }, (_, i) => `10.0.${i}.x`);
      tx(30, 46, '/24 대역', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(300, 46, '노드 3대', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' }); tx(420, 46, '4대 (app4 추가)', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      let moved = 0;
      ips.forEach((ip, i) => { const a = ipPick(ip.replace('x', '1'), 3), b = ipPick(ip.replace('x', '1'), 4), y = 72 + i * 28, mv = a !== b; if (mv) moved++;
        const op = fade(u, 0.1 + i * 0.05); mono(30, y + 5, ip, { 'font-size': 14, opacity: op }); mono(300, y + 5, 'app' + (a + 1), { 'font-size': 14, 'text-anchor': 'middle', opacity: op });
        const s2o = fade(u, 0.7 + i * 0.1); mono(420, y + 5, 'app' + (b + 1), { 'font-size': 14, 'font-weight': mv ? 800 : 400, 'text-anchor': 'middle', fill: mv ? BAD : GOOD, opacity: s2o });
        if (mv && s2o > 0.5) el('line', { x1: 466, y1: y, x2: 490, y2: y, stroke: BAD, 'stroke-width': 3, opacity: s2o }); });
      card(720, 170, 330, 120, { rx: 14, stroke: BAD, sw: 2.5, s: pop(u, 2.0) });
      if (u > 2.1) { mono(720, 160, `${moved} / 12 이동`, { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: BAD }); tx(720, 192, '전체 IP 대역으로는 약 75%', { 'text-anchor': 'middle', 'font-size': 15, fill: INK }); }
      tx(720, 300, '옮겨 간 사용자는 세션을 잃는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.4) });
      return; }
    if (k === 4) { // app1 다운
      const ip = '203.0.113.45', before = ipPick(ip, 3), after = ipPick(ip, 3, [0]);
      ngx(NX + 80, 210, { sub: 'ip_hash' }); person(50, 210, null, {}); mono(24, 260, ip, { 'font-size': 14, 'font-weight': 700 });
      NODES3.forEach((n, i) => node(760, 110 + i * 100, n, { bad: i === 0 && u > 0.4, hot: i === after && u > 1.6 }));
      if (u > 0.4) cross(760, 110, 14, pop(u, 0.4));
      dot([[76, 210], [NX + 24, 210], [NX + 136, 210], [708, 110 + after * 100]], seg(u, 0.9, 1.6), ACC, 7);
      mono(560, 70, `다시 해시 → app${after + 1}`, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4), 'text-anchor': 'middle' });
      if (u > 1.9) card(760, 390, 230, 34, { rx: 17, text: '세션 없음 → 재로그인', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 1.9) });
      return; }
    // k === 5 조건 세 개
    const conds = ['노드가 죽지 않는다', '노드를 추가하지 않는다', 'NAT 뒤 사용자가 없다'];
    conds.forEach((s, i) => { const y = 100 + i * 80; card(400, y, 440, 60, { rx: 30, stroke: GRID, sw: 2, s: pop(u, 0.2 + i * 0.2) });
      tx(250, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.2) });
      if (u < 1.0 + i * 0.35) check(580, y, 11, pop(u, 0.5 + i * 0.2)); else cross(580, y, 10, pop(u, 1.0 + i * 0.35)); });
    tx(400, 360, '세 조건은 언젠가 깨진다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
    pill(800, 220, '→ stateless', GOOD, pop(u, 2.2), { fs: 16 });
  }

  // ---------- 3. stateless JWT ----------
  // 예시 SECRET 'demo-secret' 으로 HS256 서명해 계산한 실제 토큰 (sub="42", exp=1767229200)
  const JWT = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', 'eyJzdWIiOiI0MiIsImV4cCI6MTc2NzIyOTIwMH0', 'gfv4BntHoGPtj16QZqjSG_txXW_m0BMCEqPJzNZmGj0'];
  function keyIcon(x, y, s, col) { const g = R.G(x, y, s ?? 1); el('circle', { cx: -8, cy: 0, r: 7, fill: 'none', stroke: col || WARN, 'stroke-width': 3 }, g); el('path', { d: 'M-1,0 H14 M10,0 V6 M14,0 V6', stroke: col || WARN, 'stroke-width': 3, fill: 'none' }, g); }
  function tokenBar(x, y, u0, u, o) { o = o || {}; const cols = [INFO, ACC, WARN], names = ['header', 'payload', 'signature'];
    JWT.forEach((p, i) => { const s = pop(u, u0 + i * 0.3), w = 190, cx = x + i * 200 + w / 2;
      card(cx, y, w, 40, { rx: 8, stroke: cols[i], sw: 2.5, s, fill: o.bad && i === 1 ? C.BADBG : PANEL });
      if (s < 0.3) return; mono(cx, y + 5, p.slice(0, 15) + '…', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: cols[i] });
      tx(cx, y + 38, names[i], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      if (i < 2) mono(x + i * 200 + w + 5, y + 6, '.', { 'font-size': 18, 'font-weight': 800 }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { NODES3.forEach((n, i) => { const x = 220 + i * 260; node(x, 200, n, { s: pop(u, 0.2 + i * 0.2) }); keyIcon(x - 10, 250, pop(u, 0.8 + i * 0.2)); mono(x + 12, 256, 'SECRET', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.2) }); });
      dbIcon(480, 80, '세션 저장소', { stroke: OFF }); if (u > 1.4) cross(480, 80, 22, pop(u, 1.4));
      tx(480, 340, '같은 서명 키 하나만 나눠 가진다 (ALGO = HS256)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { mono(30, 60, 'jwt.encode({"sub": "42", "exp": …}, SECRET, "HS256")', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.1) });
      tokenBar(180, 150, 0.4, u);
      card(480, 280, 420, 76, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 1.4) });
      if (u > 1.5) { tx(286, 266, 'payload 를 풀면', { 'font-size': 13.5, fill: MUT }); mono(286, 294, '{"sub":"42","exp":1767229200}', { 'font-size': 15, 'font-weight': 700, fill: ACC }); }
      tx(480, 380, '서버 메모리에 남는 것: 0 바이트 · SECRET 은 예시 값', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { tokenBar(180, 80, 0, 3);
      [[false, 0.3], [true, 1.4]].forEach(([bad, a], r) => { const y = 200 + r * 110, s = pop(u, a); card(480, y, 640, 80, { rx: 12, stroke: bad ? BAD : GOOD, sw: 2, s });
        if (s < 0.3) return; tx(180, y - 8, bad ? 'payload 를 고친 토큰' : '받은 그대로', { 'font-size': 15, 'font-weight': 700 });
        mono(180, y + 20, 'HMAC(header.payload, SECRET) == signature ?', { 'font-size': 14, fill: MUT });
        if (bad) { cross(700, y, 12, pop(u, a + 0.6)); mono(740, y + 6, '401', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, a + 0.6) }); }
        else { check(700, y, 13, pop(u, a + 0.6)); mono(740, y + 6, 'sub 42', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, a + 0.6) }); } });
      tx(480, 400, 'DB 도, 다른 노드도 묻지 않는 순수 계산', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { snippet(40, 60, ['@app.get("/me")', 'def me(user_id: int = Depends(get_current_user)):', '    return {"user_id": user_id}'], { fs: 15, op: fade(u, 0.2) });
      fly(150, 260, 600, 260, seg(u, 0.6, 1.4), 'Bearer eyJhbGci…', { mono: true });
      card(760, 260, 220, 44, { rx: 22, text: '{"user_id": 42}', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.6) });
      tx(480, 370, '핸들러 안에서 세션 코드가 사라졌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { person(60, 210, null, {}); card(60, 290, 90, 30, { rx: 6, text: 'JWT', fs: 14, mono: true, stroke: ACC, color: ACC });
      ngx(NX + 80, 210, { sub: 'round-robin' });
      NODES3.forEach((n, i) => { const y = 110 + i * 100, a = 0.2 + i * 0.6; node(720, y, n, { good: u > a + 0.7 }); keyIcon(800, y, 0.8);
        dot([[86, 210], [NX + 24, 210], [NX + 136, 210], [670, y]], seg(u, a, a + 0.7), ACC, 7); if (u > a + 0.7) check(870, y, 10, pop(u, a + 0.7)); });
      tx(NX + 80, 330, 'sticky 필요 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    // k === 5 주의 세 가지
    [['SECRET 관리', '모든 노드 같은 값, Vault 나 환경변수'], ['짧은 만료 + refresh', 'exp 가 지나기 전에는 막을 수 없다'], ['logout 은 blacklist', '서버가 기억하지 않으니 따로 적어 둔다']].forEach(([a, b], i) => {
      const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.5); card(cx, 210, 280, 170, { rx: 14, stroke: WARN, sw: 2, s }); if (s < 0.3) return;
      lbl(cx, 180, a, 1, { 'font-size': 16.5 }); tx(cx, 222, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
  }

  // ---------- 4. Redis 세션 공유 ----------
  const HEX = '9f2c4e7a1b3d5f6081a2c3e4f5061728';   // token_hex(16) 의 생김새 예시 (32자리)
  function base4(o) { o = o || {}; node(160, 120, 'app1', { hot: o.h1 }); node(160, 300, 'app2', { hot: o.h2 });
    redisBox(470, 210, { name: 'Redis', sub: 'session-redis:6379', w: 170, h: 64 });
    el('line', { x1: 212, y1: 130, x2: 384, y2: 196, stroke: ACC, 'stroke-width': 2 }); el('line', { x1: 212, y1: 290, x2: 384, y2: 224, stroke: ACC, 'stroke-width': 2 }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 6) { // JWT vs Redis
      const rows = [['서버 메모리', '0', 'Redis 에 저장'], ['즉시 폐기', '어려움 (blacklist)', 'DEL 한 번'], ['토큰 크기', '큼 (payload 포함)', '작음 (32자)'], ['의존성', '없음', 'Redis']];
      ['', 'JWT', 'Redis 세션'].forEach((h, j) => lbl(j === 0 ? 170 : j === 1 ? 470 : 760, 60, h, fade(u, 0.1), { 'font-size': 17, fill: j === 2 ? ACC : j === 1 ? INFO : INK }));
      rows.forEach(([a, b, d], i) => { const y = 110 + i * 64, op = fade(u, 0.3 + i * 0.35); el('line', { x1: 40, y1: y + 28, x2: 920, y2: y + 28, stroke: GRID, opacity: op });
        tx(170, y + 6, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: op }); tx(470, y + 6, b, { 'text-anchor': 'middle', 'font-size': 15, opacity: op }); tx(760, y + 6, d, { 'text-anchor': 'middle', 'font-size': 15, opacity: op }); });
      tx(480, 396, '실전은 둘을 섞는다: JWT access + Redis refresh·blacklist', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    base4({ h1: k === 1 || k === 2, h2: k === 3 || k === 4 });
    const has = k >= 2 && !(k === 5 && u > 1.0), wrote = k > 2 || (k === 2 && u > 0.9);
    if (k >= 2) kvTable(610, 60, 330, has && wrote ? [['sess:9f2c…', '{"user_id": 42}', { ttl: '3600s', hot: k === 4 && u > 0.9 }]] : k === 5 ? [['sess:9f2c…', '(삭제됨)', { gone: true }]] : [], { title: 'Redis 메모리', kw: 150 });
    if (k === 0) { tx(470, 330, '모든 노드가 같은 Redis 를 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); return; }
    if (k === 1) { const n = Math.round(E(u, 0.4, 1.8) * HEX.length); card(470, 340, 420, 54, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5 });
      mono(280, 346, 'token = ' + HEX.slice(0, n), { 'font-size': 14.5, 'font-weight': 700 });
      tx(470, 392, '랜덤 16바이트 = hex 32자리 (값은 예시)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { dot([[212, 130], [384, 196]], seg(u, 0.2, 0.9), ACC, 7); mono(250, 60, 'SETEX sess:{token} 3600 {…}', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      pill(470, 360, 'Set-Cookie: token=…; HttpOnly; Secure', INK, pop(u, 1.6), { mono: true, fs: 13.5 }); return; }
    if (k === 3) { person(40, 380, null, { s: 0.8 }); fly(70, 370, 140, 330, seg(u, 0.2, 0.9), 'cookie token', { mono: true });
      tx(160, 380, '다음 요청은 app2 로', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); return; }
    if (k === 4) { dot([[212, 290], [384, 224]], seg(u, 0.2, 0.9), ACC, 7); dot([[384, 224], [212, 290]], seg(u, 1.0, 1.7), GOOD, 7);
      card(160, 380, 200, 36, { rx: 18, text: '{"user_id": 42}', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.7) });
      tx(760, 220, 'app1 이 쓴 세션을 app2 가 읽는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) }); return; }
    // k === 5 logout
    dot([[212, 130], [384, 196]], seg(u, 0.2, 0.9), BAD, 7); mono(250, 60, 'DEL sess:{token}', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
    tx(760, 220, '모든 노드에서 즉시 무효', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
    if (u > 1.4) { cross(240, 300, 9, pop(u, 1.4)); cross(240, 120, 9, pop(u, 1.4)); }
  }

  // ---------- 5. 어떤 선택? ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(240, 200, 280, 70, { rx: 35, stroke: INK, sw: 2.5, text: 'Q1 신규 프로젝트인가?', fs: 16, s: pop(u, 0.2) });
      grow(382, 200, 520, 200, E(u, 0.6, 1.1), GOOD); tx(450, 188, '예', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      card(700, 200, 320, 70, { rx: 14, stroke: GOOD, sw: 2.5, text: 'stateless 로 시작\nJWT 또는 Redis', fs: 15.5, s: pop(u, 1.2) });
      tx(480, 340, 'in-memory 는 후보에 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { lbl(480, 60, 'Q2 in-memory 코드가 이미 있다면', fade(u, 0.1), { 'font-size': 17 });
      [['단기', 'ip_hash 로 버티기', WARN], ['중기', 'Redis 세션으로 이전', ACC], ['장기', 'JWT 도입', GOOD]].forEach(([a, b, col], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.5);
        card(x, 200, 260, 110, { rx: 14, stroke: col, sw: 2.5, s }); if (s > 0.3) { lbl(x, 186, a, 1, { fill: col, 'font-size': 16 }); tx(x, 218, b, { 'text-anchor': 'middle', 'font-size': 15 }); }
        if (i < 2) grow(x + 132, 200, x + 178, 200, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), MUT); });
      tx(480, 340, 'ip_hash 는 목적지가 아니라 다리', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { [['Q3 즉시 폐기가 필요한가?', '강제 로그아웃, 권한 변경'], ['Q4 세션 데이터가 큰가?', '장바구니, 검색 맥락']].forEach(([q, ex], i) => { const y = 110 + i * 130, s = pop(u, 0.2 + i * 0.6);
        card(250, y, 340, 70, { rx: 35, stroke: INK, sw: 2, s }); if (s > 0.3) { tx(250, y - 2, q, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700 }); tx(250, y + 20, ex, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
        grow(422, y, 600, y, E(u, 0.6 + i * 0.6, 1.0 + i * 0.6), ACC); tx(510, y - 10, '예', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.6) });
        pill(680, y, 'Redis 세션', ACC, pop(u, 1.0 + i * 0.6), { fs: 15 }); });
      pill(480, 370, '둘 다 아니오 → JWT', GOOD, pop(u, 2.0), { fs: 16 }); return; }
    if (k === 3) { lbl(480, 60, '실전 하이브리드', 1, { 'font-size': 17 });
      [['access token', 'JWT · 15분', INFO, '검증은 계산만'], ['refresh token', 'Redis · 7일', ACC, '서버가 관리'], ['blacklist', 'Redis', BAD, '폐기는 확실하게']].forEach(([a, b, col, d], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.5);
        card(x, 210, 270, 150, { rx: 14, stroke: col, sw: 2.5, s }); if (s < 0.3) return;
        lbl(x, 170, a, 1, { fill: col, 'font-size': 16 }); mono(x, 210, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); tx(x, 246, d, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
      return; }
    // k === 4 nginx 설정과의 관계
    ngx(200, 210, { sub: 'upstream' });
    [['round-robin', GOOD], ['least_conn', GOOD], ['random', GOOD], ['ip_hash 강제', BAD]].forEach(([a, col], i) => { const y = 75 + i * 90, s = pop(u, 0.3 + i * 0.35);
      grow(258, 210, 470, y, E(u, 0.3 + i * 0.35, 0.7 + i * 0.35), col === BAD ? BAD : MUT); pill(560, y, a, col, s, { mono: true, fs: 15 });
      if (col === BAD && u > 1.8) cross(680, y, 10, pop(u, 1.8)); else if (u > 1.0 + i * 0.35) check(680, y, 10, pop(u, 1.0 + i * 0.35)); });
    tx(830, 200, '세션이 LB 를', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) });
    tx(830, 224, '묶지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) });
  }

  const quiz = [
    { q: 'in-memory 세션에서 같은 사용자가 로그아웃된 것처럼 보이는 이유는 무엇인가?',
      o: ['토큰이 만료돼서', '다음 요청이 세션이 없는 다른 노드로 가서', '쿠키가 지워져서'], a: 1,
      why: 'SESSIONS는 노드마다 따로 있는 dict다. app1에 저장한 세션을 app2는 볼 수 없다.' },
    { q: 'ip_hash 풀을 3대에서 4대로 늘리면 IP 대역의 몇 %쯤이 다른 노드로 옮겨 가는가?',
      o: ['약 75%', '약 25%', '0%'], a: 0,
      why: '노드 수로 나눈 나머지가 바뀌므로 대부분이 옮겨 간다. nginx 해시 식으로 /24 대역 전체를 계산하면 약 75%다.' },
    { q: 'JWT를 받은 노드가 토큰을 검증할 때 필요한 것은 무엇인가?',
      o: ['로그인을 처리한 노드에 묻기', 'DB의 세션 테이블', '모든 노드가 공유하는 SECRET'], a: 2,
      why: '헤더와 payload를 SECRET으로 다시 서명해 signature와 맞는지 본다. 순수 계산이라 어느 노드든 결과가 같다.' },
    { q: 'Redis 세션 방식에서 로그아웃을 즉시 모든 노드에 반영하는 방법은 무엇인가?',
      o: ['sess:{token} 키를 DEL 한다', '토큰의 exp를 기다린다', 'nginx를 reload 한다'], a: 0,
      why: '세션의 원본이 Redis 한 곳에 있으니 키를 지우는 순간 모든 노드가 같은 결과를 본다. JWT로는 이렇게 못 한다.' },
    { q: '세션을 stateless로 바꾸면 nginx upstream 설정에서 무엇이 달라지는가?',
      o: ['ip_hash를 반드시 써야 한다', '알고리즘을 자유롭게 고를 수 있다', 'upstream 블록이 필요 없다'], a: 1,
      why: '어느 노드로 가도 같은 결과가 나오므로 round-robin, least_conn, random 중 무엇이든 쓸 수 있다.' },
  ];

  const summary = [
    '세션을 노드 메모리에 두면 다른 노드로 가거나 재시작할 때 로그인이 풀린다.',
    'ip_hash는 응급 처치다. NAT 뒤에서 몰리고, 3대를 4대로 늘리면 약 75%가 옮겨 간다.',
    'JWT는 서명 키만 나눠 가지면 어느 노드든 계산만으로 검증한다.',
    '즉시 폐기가 필요하면 Redis 세션을 쓰고, 실전은 JWT access와 Redis refresh를 섞는다.',
  ];
  const review = [
    { q: '오토스케일로 노드가 늘 때마다 일부 사용자가 로그아웃된다는 문의가 왔다. 현재 ip_hash와 in-memory 세션을 쓴다. 근본 해결은?',
      o: ['세션을 Redis나 JWT로 노드 밖에 둔다', 'ip_hash를 least_conn으로만 바꾼다', '노드를 늘리지 않는다'], a: 0,
      why: '노드 수가 바뀌면 IP와 노드의 짝이 다시 계산된다. 세션이 노드 밖에 있어야 어디로 가도 로그인이 유지된다.' },
    { q: '권한을 뺏은 사용자가 JWT로 1시간 동안 계속 접근했다. 먼저 손볼 것은?',
      o: ['SECRET을 더 길게 만든다', 'access token 만료를 짧게 하고 blacklist를 둔다', 'nginx에 ip_hash를 켠다'], a: 1,
      why: 'JWT는 exp 전까지 유효하다. 짧은 만료와 Redis refresh·blacklist를 함께 써야 폐기가 빨라진다.' },
    { q: 'Redis 세션으로 옮긴 뒤 app2로 간 요청이 {"error": "expired"}를 받았다. 가장 먼저 볼 것은?',
      o: ['nginx upstream 알고리즘', 'app2의 SESSIONS dict', 'sess:{token} 키의 TTL이 이미 지났는지'], a: 2,
      why: '세션은 setex로 TTL 3600초와 함께 저장된다. 키가 만료됐으면 어느 노드에서 읽어도 expired가 나온다.' },
  ];

  R.page({ title: '세션과 로드 밸런싱', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
