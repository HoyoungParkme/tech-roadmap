/* IV-2-2 DB 연동 — pg 드라이버·풀·바인딩·레이어·트랜잭션. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 바인딩/연결 결과(DROP 이 실제로 실행됨, 바인딩은 0행), RETURNING·rowCount 값은 pg + pg-mem(메모리 PostgreSQL)으로 확인했다.
 * 실제 PostgreSQL 서버가 없어 "연결 1회 수십 ms" 는 페이지 설명 그대로 두었다(그림의 막대 길이는 개념도). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 1. 연결 한 번의 준비 비용 (시퀀스 그림) ----------
  const AX = 200, DX = 760;
  function lifelines(o) { o = o || {};
    card(AX, 50, 170, 46, { rx: 10, text: '앱 (pg 드라이버)', fs: 15, stroke: INK });
    R.dbIcon(DX, 48, null, { s: 0.55 }); tx(DX + 40, 54, 'PostgreSQL', { 'font-size': 15, 'font-weight': 800 });
    [AX, DX].forEach((x) => el('line', { x1: x, y1: 76, x2: x, y2: 400, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' })); }
  function msg(y, dir, label, u, col, o) { o = o || {}; if (u <= 0) return; const a = dir > 0 ? AX : DX, b = dir > 0 ? DX : AX;
    grow(a, y, b, y, u, col || MUT, { op: o.op });
    if (u > 0.5) tx((AX + DX) / 2, y - 7, label, { 'font-size': 14, 'text-anchor': 'middle', fill: col || INK, 'font-weight': 600, opacity: (o.op ?? 1) * fade(u, 0.5, 0.3) }); }
  const PREP = [['TCP 핸드셰이크', 120], ['인증 (비밀번호)', 170], ['세션 셋업', 220]];
  function s1(t, c) { const { k, u } = c;
    if (k === 5) { // 요청마다 처음부터
      tx(40, 50, '요청마다 connect → 쿼리 → end', { 'font-size': 17, 'font-weight': 800 });
      for (let i = 0; i < 3; i++) { const y = 110 + i * 70, g = E(u, 0.2 + i * 0.4, 1.0 + i * 0.4);
        tx(40, y + 6, '요청 ' + (i + 1), { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: 130, y: y - 16, width: 520 * g, height: 30, rx: 5, fill: WARN, opacity: 0.8 });
        if (g > 0.6) tx(140, y + 5, '연결 준비 (수십 ms)', { 'font-size': 14, fill: PANEL, 'font-weight': 700 });
        el('rect', { x: 654, y: y - 16, width: 110 * clamp(g * 3 - 2), height: 30, rx: 5, fill: ACC });
        if (g > 0.95) tx(668, y + 5, '쿼리', { 'font-size': 14, fill: PANEL, 'font-weight': 700 }); }
      sub(400, 340, '막대 길이는 비율을 보이려는 개념도', fade(u, 1.8), { 'font-size': 13.5 });
      banner(480, 386, '준비를 한 번만 하고 재사용하자 → 연결 풀', pop(u, 2.2)); return; }
    lifelines();
    if (k === 0) { sub(480, 150, '연결 0개 · 소켓 없음', fade(u, 0.5), { 'font-size': 16, fill: MUT, 'font-weight': 700 });
      mono(AX, 250, 'const { Client } = require("pg")', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) }); return; }
    if (k === 1) { zone(60, 110, 300, 170, 'process.env', { fill: SOFT, op: fade(u, 0.2) });
      ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].forEach((v, i) => mono(80, 150 + i * 30, v, { 'font-size': 15, 'font-weight': 700, fill: i === 2 ? WARN : INK, opacity: fade(u, 0.4 + i * 0.2) }));
      grow(360, 195, 420, 195, E(u, 1.4, 1.9), MUT); card(520, 195, 180, 50, { rx: 10, text: 'new Client({…})', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.8) });
      sub(520, 250, '설정만 담았다. 소켓은 아직', fade(u, 2.1), { 'font-size': 14.5, fill: INK });
      sub(210, 310, '비밀번호를 코드에 쓰지 않는다', fade(u, 2.3), { 'font-size': 14, fill: WARN }); return; }
    // k2~4: 준비 세 번의 왕복
    const pa = (i) => (k === 2 ? E(u, 0.2 + i * 0.7, 0.8 + i * 0.7) : 1), op = k === 4 ? 1 - 0.65 * fade(u, 0.6) : 1;
    PREP.forEach(([n, y], i) => { msg(y, 1, n, pa(i), WARN, { op }); msg(y + 18, -1, '', clamp(pa(i) * 2 - 1), WARN, { op }); });
    const bk = k === 2 ? fade(u, 2.2) : 1;
    el('path', { d: `M ${DX + 22} 112 h 10 v 136 h -10`, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: bk * op });
    tx(DX + 42, 186, '수십 ms', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: bk * op });
    if (k === 2) mono(AX - 150, 290, 'await client.connect()', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.1) });
    if (k >= 3) { msg(290, 1, 'SELECT NOW()', k === 3 ? E(u, 0.2, 0.9) : 1, ACC, { op });
      msg(320, -1, 'r.rows[0] = { now: … }', k === 3 ? E(u, 1.1, 1.8) : 1, ACC, { op }); }
    if (k === 3) sub(480, 370, '준비 세 단계가 끝난 뒤에야 진짜 일', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
    if (k === 4) { mono(AX - 150, 370, 'await client.end()', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.1) });
      cross((AX + DX) / 2, 360, 14, pop(u, 0.5)); sub(620, 375, '들인 준비가 통째로 버려진다', fade(u, 1.2), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); } }

  // ---------- 2. 연결 풀 ----------
  const PX = 330, PY = 150, SW = 46;   // 풀 칸 10개
  function poolBox(states, o) { o = o || {};
    zone(PX - 20, PY - 60, 10 * (SW + 6) + 34, 120, 'Pool · max: 10', { fill: SOFT, stroke: ACC, op: o.op ?? 1 });
    states.forEach((st, i) => { const x = PX + i * (SW + 6);
      el('rect', { x, y: PY - 22, width: SW, height: 46, rx: 7, fill: st === 'idle' ? GOODBG : st === 'busy' ? WARNBG : st === 'leak' ? BADBG : PANEL, stroke: st === 'idle' ? GOOD : st === 'busy' ? WARN : st === 'leak' ? BAD : GRID, 'stroke-width': st ? 2.2 : 1.4, 'stroke-dasharray': st ? null : '4 4', opacity: o.op ?? 1 });
      if (st) el('circle', { cx: x + SW / 2, cy: PY + 1, r: 7, fill: st === 'idle' ? GOOD : st === 'busy' ? WARN : BAD, opacity: o.op ?? 1 }); });
    const total = states.filter(Boolean).length + (o.out || 0), idle = states.filter((s) => s === 'idle').length;
    mono(PX + 10 * (SW + 6) - 6, PY + 52, `열림 ${total} · 쉬는 중 ${idle}`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: MUT, opacity: o.op ?? 1 }); }
  const slot = (i) => [PX + i * (SW + 6) + SW / 2, PY];
  function s2(t, c) { const { k, u } = c, E10 = Array(10).fill(null);
    R.dbIcon(880, 300, 'PostgreSQL', { s: 0.75 });
    card(90, 150, 120, 50, { rx: 10, text: '앱 코드', fs: 15, stroke: INK });
    if (k === 0) { card(330, 290, 220, 70, { rx: 12, text: 'Client\n연결 하나', fs: 15, stroke: MUT, s: pop(u, 0.2) });
      card(620, 290, 260, 70, { rx: 12, text: 'Pool\n연결 여러 개를 담는 창고', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.8) });
      mono(480, 120, 'const { Pool } = require("pg")', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
      sub(480, 380, '풀은 앱 전체에서 하나만 만든다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { poolBox(E10, { op: fade(u, 0.2) });
      sub(480, 250, 'max 는 상한이다. pg 풀은 비어서 시작해 필요할 때 연결을 연다', fade(u, 0.9), { 'font-size': 14.5, fill: INK });
      mono(70, 320, '앱 3대 × max 10 = 동시 연결 30', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(70, 348, '이 합이 DB 연결 한도 안에 들어야 한다 (3대는 예시)', { 'font-size': 14, fill: WARN, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { // pool.query: 하나 열고 쓰고 자동 반납
      const st = E10.slice(); st[0] = u < 0.7 ? null : u < 2.0 ? 'busy' : 'idle'; poolBox(st);
      mono(90, 220, 'pool.query("SELECT NOW()")', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      const [sx, sy] = slot(0); dot([[150, 150], [sx, sy]], seg(u, 0.2, 0.7), ACC, 7); dot([[sx, sy + 22], [sx, 300], [840, 300]], seg(u, 0.8, 1.4), WARN, 7); dot([[840, 300], [sx, 300], [sx, sy + 22]], seg(u, 1.4, 1.9), WARN, 7);
      sub(560, 380, '빌리고 돌려주는 일을 드라이버가 알아서 한다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    // k3~5: 직접 빌려 쓰고 반납
    const held = k === 3 ? E(u, 0.4, 1.4) : k === 4 ? 1 : 1 - E(u, 0.4, 1.4);
    const st = E10.slice(); st[0] = held > 0.5 ? null : 'idle'; poolBox(st, { out: held > 0.5 ? 1 : 0 });
    const [sx, sy] = slot(0), cx = lerp(sx, 150, held), cy = lerp(sy, 260, held);
    card(cx, cy, 70, 40, { rx: 8, text: 'client', fs: 13.5, mono: true, fw: 800, stroke: WARN, color: WARN, fill: WARNBG });
    mono(40, 330, k === 3 ? 'const client = await pool.connect()' : k === 4 ? 'try { await client.query("SELECT 1") }' : 'finally { client.release() }', { 'font-size': 15, 'font-weight': 700, fill: k === 5 ? GOOD : ACC });
    if (k === 3) sub(560, 280, '이 순간부터 반납은 내 책임', fade(u, 1.6), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
    if (k === 4) { dot([[190, 260], [840, 290]], seg(u, 0.3, 1.0), WARN, 7); dot([[840, 290], [190, 260]], seg(u, 1.1, 1.8), WARN, 7);
      sub(560, 380, '예외가 나도 반납되도록 try 로 감싼다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }
    if (k === 5) { // 반납을 빠뜨린 풀
      const g = fade(u, 1.6); zone(330, 360, 560, 54, null, { fill: BADBG, op: g });
      for (let i = 0; i < 10; i++) el('rect', { x: 344 + i * 22, y: 372, width: 18, height: 30, rx: 3, fill: BAD, opacity: g });
      tx(574, 392, 'release 를 빠뜨리면: 10칸이 다 차고 요청이 줄을 선다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: g }); } }

  // ---------- 3. 문자열 연결 vs $1 바인딩 ----------
  const EVIL = "'; DROP TABLE users; --";
  function sqlLine(y, parts, o) { o = o || {}; spans(40, y, parts, { 'font-size': o.fs || 17, opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    const inp = k === 0 ? 'bob' : EVIL;
    card(150, 46, 220, 40, { rx: 8, text: 'req.query.name', fs: 14.5, mono: true, fw: 700, stroke: MUT, color: MUT });
    card(500, 46, tw('"' + inp + '"', 15) + 30, 40, { rx: 8, text: '"' + inp + '"', fs: 15, mono: true, fw: 800, stroke: k === 0 ? INK : BAD, color: k === 0 ? INK : BAD, s: k === 1 ? pop(u, 0.1) : 1 });
    if (k <= 2) {
      tx(40, 120, '문자열 연결', { 'font-size': 14.5, 'font-weight': 800, fill: BAD });
      const syn = { fill: INFO, 'font-weight': 700 }, dat = { fill: k === 0 ? GOOD : BAD, 'font-weight': 800 };
      const ins = k === 1 ? inp.slice(0, Math.round(inp.length * E(u, 0.4, 1.6))) : inp;
      sqlLine(160, [["SELECT * FROM users WHERE name = '", syn], [ins, dat], ["'", syn]]);
      if (k === 0) { sub(480, 220, "값 bob 이 따옴표 안에 얌전히 들어갔다", fade(u, 1.0), { 'font-size': 15, fill: INK }); return; }
      if (k === 1) { sub(480, 220, '값과 SQL 문법이 한 문자열로 섞였다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
      // k2: DB 가 읽는 방식으로 쪼갠다
      const parts = [["SELECT * FROM users WHERE name = ''", INFO, '조건: 이름이 빈 문자열'], ['; DROP TABLE users;', BAD, '새 명령'], [" --'", MUT, '나머지는 주석']];
      parts.forEach(([s, col, d], i) => { const y = 230 + i * 48, a = fade(u, 0.3 + i * 0.5);
        el('rect', { x: 34, y: y - 26, width: tw(s, 17) + 20, height: 36, rx: 6, fill: i === 1 ? BADBG : SOFT, opacity: a });
        mono(44, y, s, { 'font-size': 17, 'font-weight': 700, fill: col, opacity: a }); tx(560, y, d, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: a }); });
      R.dbIcon(850, 300, 'users', { stroke: BAD, s: 0.7 }); cross(850, 290, 26, pop(u, 1.8));
      return; }
    // k3~5: 자리표시자
    tx(40, 120, '파라미터 바인딩', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD });
    const syn = { fill: INFO, 'font-weight': 700 }, ph = { fill: ACC, 'font-weight': 800 };
    if (k === 5) { sqlLine(160, [['INSERT INTO users(name, email) VALUES (', syn], ['$1', ph], [', ', syn], ['$2', ph], [')', syn]]);
      card(300, 260, 120, 40, { rx: 8, text: 'name', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.4) });
      card(450, 260, 120, 40, { rx: 8, text: 'email', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      mono(220, 266, '[', { 'font-size': 22, 'font-weight': 700 }); mono(522, 266, ']', { 'font-size': 22, 'font-weight': 700 });
      grow(458, 170, 300, 238, E(u, 1.0, 1.6), ACC); grow(498, 170, 450, 238, E(u, 1.3, 1.9), ACC);
      sub(480, 340, '자리표시자 번호와 배열 순서를 맞춘다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    sqlLine(160, [['SELECT * FROM users WHERE name = ', syn], ['$1', ph]]);
    const vy = 236; mono(40, vy, '값 배열', { 'font-size': 14.5, 'font-weight': 800, fill: MUT });
    card(380, vy - 6, tw('[ "' + EVIL + '" ]', 15) + 30, 40, { rx: 8, text: '[ "' + EVIL + '" ]', fs: 15, mono: true, fw: 700, stroke: GOOD, color: INK, s: k === 3 ? pop(u, 0.6) : 1 });
    if (k === 3) { sub(480, 310, '쿼리 문자열은 고정, 바뀌는 것은 값뿐', fade(u, 1.4), { 'font-size': 15, fill: INK }); return; }
    // k4: 두 통로로 따로 간다
    dot([[420, 170], [840, 260]], seg(u, 0.2, 1.0), INFO, 7); dot([[560, 246], [840, 270]], seg(u, 0.5, 1.3), GOOD, 7);
    R.dbIcon(860, 280, 'users', { stroke: GOOD, s: 0.7 });
    mono(40, 330, 'r.rows  →  []', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
    tx(40, 362, '그런 이름의 사용자가 없을 뿐, 테이블은 그대로', { 'font-size': 15, fill: INK, opacity: fade(u, 1.9) }); }

  // ---------- 4. 라우트 → 서비스 → 저장소 ----------
  const LY = [70, 150, 230, 320], LN = [['Route', 'HTTP 요청·응답만'], ['Service', '업무 규칙·검증'], ['Repository', 'SQL · DB 접근'], ['DB (Pool)', '쿼리 실행·행 반환']];
  const CRUD = [['CREATE', 'INSERT INTO users(name, email) … RETURNING *'], ['READ', 'SELECT * FROM users WHERE id = $1'], ['UPDATE', 'UPDATE …'], ['DELETE', 'DELETE FROM users WHERE id = $1']];
  function s4(t, c) { const { k, u } = c;
    LN.forEach(([n, d], i) => { const y = LY[i], hot = i === 2 || (i === 3 && k === 0);
      card(210, y, 340, 56, { rx: 10, stroke: hot ? ACC : GRID, sw: hot ? 2.6 : 1.6, fill: i === 3 ? SOFT : PANEL });
      tx(60, y + 6, n, { 'font-size': 16, 'font-weight': 800, fill: hot ? ACC : INK }); tx(200, y + 6, d, { 'font-size': 14, fill: MUT });
      if (i < 3) el('line', { x1: 210, y1: y + 28, x2: 210, y2: LY[i + 1] - 28, stroke: GRID, 'stroke-width': 2 }); });
    if (k === 0) { [0, 1].forEach((i) => tx(372, LY[i] + 6, 'pool 모름', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'end', opacity: fade(u, 0.6) }));
      mono(470, 236, 'require("./pool")', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      sub(660, 300, 'DB 를 아는 파일은 저장소 하나', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    // 오른쪽: CRUD ↔ SQL 표
    const at = [1, 3, 9, 4];
    CRUD.forEach(([op, sql], i) => { const y = 66 + i * 44, on = k >= at[i] || (k === 5), a = k === at[i] ? fade(u, 0.3) : 1;
      tx(420, y, op, { 'font-size': 14.5, 'font-weight': 800, fill: on ? ACC : OFF });
      mono(500, y, on ? sql : '…', { 'font-size': 13.5, fill: on ? INK : OFF, opacity: on ? a : 1 }); });
    const down = [[210, LY[0]], [210, LY[3]]], up = down.slice().reverse();
    if (k === 2) { dot(down, seg(u, 0.2, 1.0), ACC, 7); dot(up, seg(u, 1.1, 1.8), GOOD, 7);
      card(660, 290, 360, 46, { rx: 10, text: 'r.rows[0] = { id: 1, name, email }', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.8) });
      sub(660, 336, 'RETURNING * 덕에 다시 조회하지 않는다', fade(u, 2.1), { 'font-size': 14, fill: INK }); }
    if (k === 1) sub(660, 290, '값 자리는 $1 · $2', fade(u, 1.0), { 'font-size': 15, fill: INK });
    if (k === 3) { dot([[210, LY[1]], [210, LY[3]]], seg(u, 0.2, 0.9), ACC, 7);
      mono(450, 260, 'findUser("999")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(450, 290, 'rows = []  →  return null', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0) });
      mono(450, 330, 'Service 가 판단: null → 404', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.7) }); }
    if (k === 4) { mono(450, 260, 'deleteUser(1)   → rowCount 1', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.4) });
      mono(450, 292, 'deleteUser(1) 또 → rowCount 0', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) });
      sub(660, 336, '0 은 "지울 게 없었다". 성공과 나눠 다룬다', fade(u, 1.9), { 'font-size': 14, fill: INK }); }
    if (k === 5) { ['createUser', 'findUser', 'deleteUser'].forEach((f, i) => card(470 + i * 150, 290, 136, 36, { rx: 18, text: f, fs: 14, mono: true, fw: 700, stroke: ACC, color: ACC, s: pop(u, 0.3 + i * 0.25) }));
      grow(470, 272, 390, LY[2], E(u, 1.2, 1.8), ACC, { plain: true });
      sub(620, 352, 'module.exports 로 이 셋만 밖에 보인다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); } }

  // ---------- 5. 트랜잭션 ----------
  function s5(t, c) { const { k, u } = c, ops = (c.beat.tx && c.beat.tx.ops) || [], pops = (c.prev && c.prev.tx && c.prev.tx.ops) || [];
    // 왼쪽 위: 풀에서 꺼낸 전용 커넥션
    const out = k === 0 ? E(u, 0.3, 1.2) : k === 6 ? 1 - E(u, 0.5, 1.5) : 1;
    zone(30, 20, 220, 70, 'Pool', { fill: SOFT });
    card(lerp(140, 140, out), lerp(62, 140, out), 90, 36, { rx: 8, text: 'client', fs: 14, mono: true, fw: 800, stroke: WARN, color: WARN, fill: WARNBG });
    // 가운데: 같은 커넥션 위의 명령 줄
    const OPS = ops.filter((o) => o !== 'acquire client');
    tx(300, 50, '같은 커넥션에서 차례로', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    OPS.forEach((o, i) => { const isNew = !pops.includes(o) || (o === 'ROLLBACK' && k === 5) || (o === 'COMMIT' && k === 4), y = 80 + i * 50;
      const col = o === 'BEGIN' ? INFO : o === 'COMMIT' ? GOOD : o === 'ROLLBACK' ? BAD : WARN;
      card(400, y + 10, 200, 40, { rx: 8, text: o.replace('-', '−'), fs: 15, mono: true, fw: 800, stroke: col, color: col, s: isNew ? pop(u, 0.2) : 1 }); });
    if (OPS.includes('BEGIN')) { const n = OPS.length; el('path', { d: `M 290 76 h -10 v ${n * 50 - 12} h 10`, fill: 'none', stroke: INFO, 'stroke-width': 2.5 }); }
    // 오른쪽: 두 시점 — 이 커넥션 안 / 다른 세션
    const hasA = ops.includes('UPDATE A -50'), hasB = ops.includes('UPDATE B +50'), commit = ops.includes('COMMIT'), rb = ops.includes('ROLLBACK');
    const pend = (on, isNewHere) => (on && !commit ? (rb ? 1 - fade(u, 0.4) : isNewHere ? fade(u, 0.5) : 1) : 0);
    function view(x, title, mine) {
      zone(x, 40, 160, 260, title, { fill: SOFT });
      [['A', hasA, '−50', k === 2], ['B', hasB, '+50', k === 3]].forEach(([n, on, d, nw], i) => { const y = 120 + i * 100;
        card(x + 80, y, 110, 60, { rx: 10, stroke: INK, text: '계좌 ' + n, fs: 15 });
        const shown = mine ? (commit ? (on ? 1 : 0) : pend(on, nw)) : (commit ? (k === 4 ? fade(u, 1.0) : 1) * (on ? 1 : 0) : 0);
        if (shown > 0) card(x + 80, y + 42, 62, 26, { rx: 13, text: d, fs: 14, mono: true, fw: 800, stroke: commit ? GOOD : WARN, color: commit ? GOOD : WARN, dash: commit ? null : '4 3', op: shown }); }); }
    view(560, '이 커넥션 안', true); view(760, '다른 세션', false);
    if (k === 1) sub(660, 340, 'BEGIN 이후의 쿼리는 한 묶음', fade(u, 0.8), { 'font-size': 14.5, fill: INK });
    if (k === 2) sub(660, 340, '아직 미확정: 다른 세션에는 안 보인다', fade(u, 1.0), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
    if (k === 3) sub(660, 340, '여기서 예외가 나면 catch 로 간다', fade(u, 1.0), { 'font-size': 14.5, fill: INK });
    if (k === 4) sub(660, 340, 'COMMIT 뒤에야 밖에서도 보인다', fade(u, 1.2), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 });
    if (k === 5) sub(660, 340, '하나라도 실패하면 두 변경 모두 없던 일', fade(u, 1.0), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
    if (k === 6) { mono(40, 380, 'finally { client.release() }', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
      sub(660, 340, '커밋이든 롤백이든 마지막은 반납', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); }
    if (k === 0) mono(40, 200, 'await pool.connect()', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) }); }

  const quiz = [
    { q: 'await client.connect() 한 줄이 하는 일로 맞는 것은 무엇인가?',
      o: ['접속 정보를 객체에 저장만 한다', 'TCP 핸드셰이크, 인증, 세션 셋업을 차례로 치른다', '첫 쿼리를 미리 실행해 둔다'], a: 1,
      why: 'new Client()는 설정만 담고, connect()에서 여러 번의 왕복으로 연결을 준비한다. 이 준비에 수십 ms가 든다.' },
    { q: 'pool.connect()로 꺼낸 client를 release하지 않으면 어떻게 되나?',
      o: ['다음 요청이 같은 client를 자동으로 나눠 쓴다', '풀이 새 연결을 무한히 연다', 'max개가 다 묶이면 나머지 요청이 빈 연결을 기다리며 멈춘다'], a: 2,
      why: '반납하지 않은 연결은 풀로 돌아가지 않는다. max: 10이면 열 번 새면 더 빌려줄 연결이 없다.' },
    { q: 'name에 "\'; DROP TABLE users; --"가 들어왔다. pool.query("… WHERE name = $1", [name])의 결과는 무엇인가?',
      o: ['users 테이블이 지워진다', '그런 이름이 없어 빈 rows가 돌아온다', '문법 오류로 서버가 멈춘다'], a: 1,
      why: '바인딩한 값은 SQL 문법으로 해석되지 않고 문자열 그대로 비교된다. 쿼리 구조는 바뀌지 않는다.' },
    { q: 'DELETE 쿼리 결과로 성공 여부를 판단할 때 볼 값은 무엇인가?',
      o: ['r.rows[0]', 'r.rowCount', 'r.command'], a: 1,
      why: '삭제·수정은 돌려받는 행이 없다. rowCount가 1이면 지워졌고 0이면 지울 행이 없었다.' },
    { q: '이체 트랜잭션을 pool.query("BEGIN"), pool.query("UPDATE …")처럼 짜면 생기는 문제는 무엇인가?',
      o: ['BEGIN과 UPDATE가 서로 다른 커넥션에서 실행될 수 있다', '쿼리가 두 번씩 실행된다', 'COMMIT이 자동으로 붙는다'], a: 0,
      why: 'pool.query는 부를 때마다 아무 연결이나 빌린다. 트랜잭션은 한 커넥션 안에서만 묶이므로 pool.connect()로 하나를 잡고 써야 한다.' },
  ];
  const summary = [
    '연결 하나를 여는 데는 핸드셰이크, 인증, 세션 셋업이 들어서 요청마다 열고 닫으면 낭비다.',
    '풀은 연 연결을 돌려 쓴다. pool.connect()로 직접 빌렸다면 finally에서 release한다.',
    '사용자 입력은 문자열로 붙이지 않고 $1, $2 자리에 값 배열로 넘긴다.',
    'SQL은 저장소에 모으고, 여러 쿼리는 한 커넥션에서 BEGIN과 COMMIT 또는 ROLLBACK으로 묶는다.',
  ];
  const review = [
    { q: '트래픽이 몰리자 모든 API가 응답 없이 멈췄고 DB는 한가하다. 먼저 의심할 것은?',
      o: ['pool.connect() 뒤 release가 빠진 경로', 'SQL 바인딩을 쓴 쿼리', 'RETURNING *를 쓴 INSERT'], a: 0,
      why: '반납되지 않은 커넥션이 쌓이면 풀이 비어 요청이 연결을 기다린다. DB가 한가한데 앱만 멈추는 것이 그 신호다.' },
    { q: '이체 중 입금 UPDATE에서 예외가 났는데 출금만 반영됐다. 무엇이 빠졌나?',
      o: ['바인딩 $1', '같은 커넥션의 BEGIN과 catch의 ROLLBACK', 'Pool의 max 설정'], a: 1,
      why: '두 UPDATE를 한 트랜잭션으로 묶고 실패 때 ROLLBACK해야 둘 다 취소된다. 묶지 않으면 앞의 출금만 남는다.' },
    { q: '검색 API에 이름 대신 \' OR \'1\'=\'1을 넣었더니 모든 사용자가 나왔다. 고칠 방법은?',
      o: ['입력에서 따옴표만 지운다', '사용자 수를 limit로 줄인다', 'WHERE name = $1로 바꾸고 값은 배열로 넘긴다'], a: 2,
      why: '문자열 연결 때문에 입력이 조건문의 일부가 됐다. 바인딩하면 값은 값으로만 비교되어 구조를 바꾸지 못한다.' },
  ];

  R.page({ title: 'Node와 PostgreSQL', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
