/* V-2-2 통합 테스트 — testcontainers — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 단계 번호는 STEPS 의 active(0 기동 ~ 4 정리), 함정 목록은 pitfalls 를 읽는다.
 * 이미지 태그·DB 이름·계정·포트(postgres:16-alpine, app_test, test/test, 5432)는 페이지 코드 값이다.
 * 호스트 포트, 사용자 id, 테스트 개수와 길이는 정해지지 않은 값이라 "예시"로 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, dbIcon, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op) => pill(x, y, '예시', MUT, 1, { fs: 13.5, op: op ?? 1 });
  // 컨테이너 상자 (고래 대신 칸이 쌓인 상자)
  function box(cx, cy, w, h, title, o) { o = o || {}; const g = card(cx, cy, w, h, { rx: 10, stroke: o.stroke || INFO, sw: 2.4, fill: o.fill || PANEL, s: o.s, op: o.op });
    if ((o.s ?? 1) < 0.5) return g;
    for (let i = 0; i < 3; i++) el('rect', { x: cx - w / 2 + 12 + i * 22, y: cy - h / 2 + 10, width: 18, height: 12, rx: 2, fill: o.stroke || INFO, opacity: 0.5 * (o.op ?? 1) });
    mono(cx - w / 2 + 84, cy - h / 2 + 21, title, { 'font-size': 14, 'font-weight': 800, fill: o.stroke || INFO, opacity: o.op ?? 1 }); return g; }
  // users 표
  function table(x, y, rows, o) { o = o || {}; const cw = [70, 200];
    el('rect', { x, y, width: 280, height: 34, rx: 6, fill: SOFT, stroke: GRID });
    mono(x + 12, y + 22, 'id', { 'font-size': 14, 'font-weight': 800 }); mono(x + 82, y + 22, 'email  UNIQUE', { 'font-size': 14, 'font-weight': 800, fill: ACC });
    rows.forEach((r, i) => { const yy = y + 34 + i * 34, op = r.op ?? 1; el('rect', { x, y: yy, width: 280, height: 34, fill: r.bad ? BADBG : PANEL, stroke: r.bad ? BAD : GRID, opacity: op });
      mono(x + 12, yy + 22, r.id, { 'font-size': 14, opacity: op, fill: r.bad ? BAD : INK }); mono(x + 82, yy + 22, r.email, { 'font-size': 14, opacity: op, fill: r.bad ? BAD : INK }); }); }

  // ---------- 1. mock 의 한계 ----------
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: mockRepo 의 map
    zone(30, 40, 400, 240, 'mockRepo · users map[int]User', { fill: SOFT, color: INK });
    for (let i = 0; i < 4; i++) { const y = 80 + i * 46; el('rect', { x: 50, y, width: 60, height: 36, rx: 5, fill: PANEL, stroke: GRID }); mono(80, y + 23, 'b' + i, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    if (k === 0) { sub(270, 150, '버킷만 있는 해시 맵', fade(u, 0.6), { 'font-size': 14, 'font-weight': 700, fill: INK }); sub(270, 176, 'SQL도 스키마도 제약도 없다', fade(u, 1.2), { 'font-size': 14 });
      ['UNIQUE', 'NOT NULL', '트랜잭션'].forEach((s, i) => { pill(600 + i * 110, 150, s, MUT, pop(u, 1.6 + i * 0.2), { fs: 13.5 }); el('line', { x1: 560 + i * 110, y1: 150, x2: 640 + i * 110, y2: 150, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.9 + i * 0.2) }); });
      note(560, 230, 'mock에는 이것들이 없다', fade(u, 2.3), { 'font-size': 14 }); return; }
    const ent = [[1, 1, 'ID 1 · a@x.com'], [2, 3, 'ID 2 · a@x.com']];
    const show = k === 1 ? [seg(u, 0.3, 1.0), seg(u, 1.2, 1.9)] : [1, 1];
    ent.forEach(([id, bk, s], i) => { const f = show[i]; if (f <= 0) return; const y = 98 + bk * 46;
      if (f < 1) fly(560, y, 200, y, f, s, { fill: INFO }); else { grow(112, y, 150, y, 1, MUT, { plain: true }); card(250, y, 190, 32, { rx: 6, text: s, fs: 13.5, mono: true, fw: 700, stroke: i ? WARN : INFO, color: i ? WARN : INFO }); }
      if (f >= 1) { check(440, y, 8, k === 1 ? pop(u, i ? 2.0 : 1.1) : 1); } });
    if (k === 1) { pill(560, 60, 'Save의 반환값 = nil, nil', GOOD, pop(u, 2.0), { mono: true, fs: 13.5, fill: PANEL }); ex(330, 316, fade(u, 0.4));
      note(40, 350, '같은 email이 두 번 들어가도 조용히 통과한다', fade(u, 2.2), { fill: WARN }); return; }
    // k≥2: 진짜 Postgres
    dbIcon(560, 110, 'Postgres', { stroke: ACC, s: k === 2 ? pop(u, 0.2) : 1 });
    table(640, 60, [{ id: '1', email: 'a@x.com' }, { id: '2', email: 'a@x.com', bad: true, op: k === 2 ? fade(u, 0.6) : 1 }]);
    if (k === 2) cross(940, 145, 8, pop(u, 0.9));
    if (k === 2) { const chips = ['UNIQUE 위반', 'NOT NULL 누락', '트랜잭션 롤백', '"SELCT" 오타', '타임존 · JSONB'];
      chips.forEach((s, i) => pill(110 + (i % 3) * 200, 320 + Math.floor(i / 3) * 48, s, ACC, pop(u, 1.2 + i * 0.2), { fs: 14, fill: PANEL }));
      tx(650, 330, '실제 DB만 잡는다', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); return; }
    // k3: 핵심 경로만 진짜 DB
    [['결제 · 계정 (핵심 경로)', '통합테스트 · 진짜 Postgres', ACC], ['나머지 대부분', '단위 테스트 · mock 유지', MUT]].forEach(([a, b2, col], i) => { const y = 330 + i * 46, s = pop(u, 0.3 + i * 0.4);
      card(170, y, 280, 38, { rx: 19, text: a, fs: 14, fw: 700, stroke: col, color: col, s }); grow(312, y, 440, y, seg(u, 0.6 + i * 0.4, 1.0 + i * 0.4), col);
      tx(452, y + 5, b2, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.9 + i * 0.4) }); }); }

  // ---------- 2. 컨테이너 띄우기 ----------
  const HOST = { x: 330, y: 40, w: 600, h: 300 };
  function s2(t, c) { const { k, u } = c;
    zone(HOST.x, HOST.y, HOST.w, HOST.h, 'Docker 데몬', { fill: SOFT, stroke: GRID, color: MUT });
    // 왼쪽: 테스트 코드
    card(150, 120, 230, 120, { rx: 12, stroke: INK, sw: 2.2 }); mono(50, 82, 'go test', { 'font-size': 15, 'font-weight': 800 });
    ['testcontainers', 'modules/postgres', 'wait'].forEach((s, i) => pill(150, 112 + i * 30, s, INFO, k === 0 ? pop(u, 0.3 + i * 0.3) : 1, { mono: true, fs: 13.5, fill: PANEL }));
    if (k === 0) { sub(630, 200, '아직 아무 컨테이너도 없다', fade(u, 1.4), { 'font-size': 14 }); note(30, 400, '필요한 건 Docker 데몬 하나다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // 이미지 층 → 컨테이너
    const layers = k === 1 ? Math.floor(E(u, 0.2, 1.2) * 3.99) : 3;
    tx(360, 80, 'postgres:16-alpine', { 'font-size': 14, 'font-weight': 800, class: 'mono' });
    for (let i = 0; i < layers; i++) el('rect', { x: 360, y: 200 - i * 26, width: 150, height: 22, rx: 4, fill: INFO, opacity: 0.35 + i * 0.2 });
    grow(400, 260, 400, 296, 0, MUT);
    if (k === 1) grow(296, 150, 352, 150, seg(u, 0.1, 0.4), MUT);
    const cs = k === 1 ? pop(u, 1.4) : 1;
    box(720, 190, 300, 200, 'postgres', { s: cs, stroke: k >= 3 ? GOOD : INFO });
    if (k === 1) { sub(720, 316, '컨테이너가 실제로 뜬다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k >= 2) ['POSTGRES_DB=app_test', 'POSTGRES_USER=test', 'POSTGRES_PASSWORD=test'].forEach((s, i) => { const f = k === 2 ? seg(u, 0.3 + i * 0.35, 0.9 + i * 0.35) : 1, y = 150 + i * 32;
      if (f > 0 && f < 1) fly(150, 230, 720, y, f, s, { mono: true, fill: ACC }); if (f >= 1) mono(590, y + 5, s, { 'font-size': 13.5, 'font-weight': 700, fill: ACC }); });
    if (k === 2) { note(30, 400, 'WithDatabase · WithUsername · WithPassword가 이 값을 넣는다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // 포트 5432
    const ready = k === 3 ? u > 1.8 : true;
    card(720, 290, 120, 34, { rx: 17, text: '5432/tcp', fs: 14, mono: true, fw: 800, stroke: ready ? GOOD : BAD, color: ready ? GOOD : BAD });
    if (k === 3) { for (let j = 0; j < 4; j++) { const f = seg(u, 0.2 + j * 0.4, 0.55 + j * 0.4); dot([[150, 300], [650, 290]], f, j < 3 ? BAD : GOOD, 6); }
      mono(380, 330, ready ? '열렸다 → 다음 단계로' : '아직 안 열림 · 다시 확인', { 'font-size': 14, 'font-weight': 700, fill: ready ? GOOD : BAD, 'text-anchor': 'middle' });
      note(30, 400, 'wait.ForListeningPort가 포트가 열릴 때까지 기다린다', fade(u, 2.1), { 'font-size': 14 }); return; }
    // k4: 핸들 반환
    grow(720, 307, 720, 370, seg(u, 0.2, 0.5), MUT, { plain: true }); mono(740, 378, '호스트의 무작위 포트로 연결', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
    el('path', { d: 'M570,150 Q450,250 270,190', fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ahb)', pathLength: 100, 'stroke-dasharray': `${E(u, 0.6, 1.4) * 100} 100` });
    pill(150, 210, '*postgres.PostgresContainer', ACC, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL });
    note(30, 400, '로컬에 Postgres를 깔 필요가 없다', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 3. 생명주기 ----------
  const PH = ['기동', '연결', '마이그레이션', '테스트', '정리'];
  function phases(active, u, fresh) { PH.forEach((s, i) => { const x = 40 + i * 180, on = i === active, done = i < active;
      el('rect', { x, y: 30, width: 168, height: 38, rx: 19, fill: on ? ACC : done ? ACCBG : PANEL, stroke: on || done ? ACC : GRID, 'stroke-width': 2 });
      tx(x + 84, 54, (i + 1) + '. ' + s, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? PANEL : done ? ACC : MUT }); });
    if (fresh) el('rect', { x: 40 + active * 180, y: 30, width: 168, height: 38, rx: 19, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: 1 - fade(u, 0.2, 1.0) }); }
  function deferStack(items, u, popU) { zone(720, 100, 210, 220, 'run의 defer 스택', { fill: SOFT, color: MUT });
    items.forEach((s, i) => { const y = 280 - i * 44, f = popU != null ? popU : 0; card(825, y - f * 200, 180, 36, { rx: 6, text: s, fs: 13.5, mono: true, fw: 700, stroke: WARN, color: WARN, op: 1 - f }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    phases(b.active, u, !p || p.active !== b.active);
    const gone = k === 4 ? E(u, 1.0, 1.8) : 0;
    box(200, 200, 280, 140, 'postgres', { s: k === 0 ? pop(u, 0.2) : 1, op: 1 - gone, stroke: k === 4 ? OFF : INFO });
    if (k === 0) { const f = seg(u, 0.9, 1.6); deferStack(f >= 1 ? ['pg.Terminate(ctx)'] : [], u); if (f > 0 && f < 1) fly(200, 280, 825, 280, f, 'pg.Terminate(ctx)', { mono: true, fill: WARN });
      note(30, 380, 'defer는 run이 끝날 때 거꾸로 꺼내 실행된다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k < 4) deferStack(['pg.Terminate(ctx)'], u);
    if (k === 1) { const dsn = 'postgres://test:test@localhost:<포트>/app_test?sslmode=disable';
      el('rect', { x: 30, y: 300, width: 670, height: 40, rx: 8, fill: INK, opacity: fade(u, 0.3) });
      mono(44, 326, dsn.slice(0, Math.round(dsn.length * E(u, 0.3, 1.6))), { 'font-size': 14, fill: PANEL });
      ex(640, 366, fade(u, 1.0)); grow(200, 300, 200, 272, seg(u, 1.8, 2.1), ACC);
      pill(420, 366, 'db, err = sql.Open("pgx", dsn)', ACC, pop(u, 2.0), { mono: true, fs: 13.5, fill: PANEL }); return; }
    if (k === 2) { card(200, 210, 220, 70, { rx: 6, fill: PANEL, stroke: ACC, sw: 2, s: pop(u, 0.6) });
      mono(110, 202, 'users', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) });
      mono(110, 228, 'id · email UNIQUE', { 'font-size': 13.5, opacity: fade(u, 0.9) });
      note(30, 380, '운영과 같은 마이그레이션을 돌린다. 실패하면 테스트는 시작도 안 한다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 3) { ['TestSave', 'TestFind', 'TestDup', 'TestList'].forEach((s, i) => { const x = 60 + i * 160, y = 360;
        card(x + 60, y, 130, 36, { rx: 8, text: s, fs: 13.5, mono: true, fw: 700, s: pop(u, 0.3 + i * 0.2) }); grow(x + 60, y - 20, 200 + (i - 1.5) * 30, 272, seg(u, 0.6 + i * 0.2, 1.0 + i * 0.2), MUT); });
      ex(680, 318, fade(u, 0.4));
      mono(470, 120, 'os.Exit(run(m))', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6) }); sub(540, 146, 'm.Run의 결과 코드로 끝낸다', fade(u, 1.8)); return; }
    // k4: defer 가 꺼내지고 컨테이너 사라짐
    deferStack(['pg.Terminate(ctx)'], u, E(u, 0.3, 1.0));
    if (u > 1.0) mono(200, 205, 'Terminate', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    pill(470, 120, 'run 반환 → os.Exit(code)', GOOD, pop(u, 1.9), { mono: true, fs: 14, fill: PANEL });
    zone(30, 300, 670, 100, '하면 안 되는 모양', { fill: BADBG, stroke: BAD, color: BAD, op: fade(u, 1.4) });
    mono(50, 350, 'TestMain { defer pg.Terminate(ctx); …; os.Exit(code) }', { 'font-size': 14, opacity: fade(u, 1.5) });
    tx(50, 380, 'os.Exit은 defer를 건너뛰어 컨테이너가 남는다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); }

  // ---------- 4. 실제 테스트 ----------
  function s4(t, c) { const { k, u } = c;
    dbIcon(590, 110, 'Postgres', { stroke: ACC });
    card(170, 110, 260, 90, { rx: 12, stroke: INK, sw: 2.2 }); mono(60, 86, 'TestSaveUser_DuplicateEmail', { 'font-size': 13.5, 'font-weight': 800 });
    mono(60, 120, 'repo := NewUserRepo(db)', { 'font-size': 13.5, fill: ACC });
    grow(302, 110, 540, 110, k === 0 ? seg(u, 0.3, 0.8) : 1, ACC);
    zone(30, 210, 260, 110, 't.Cleanup 예약', { fill: SOFT, color: MUT });
    const cleaned = k === 3 && u > 2.0;
    card(160, 280, 220, 36, { rx: 6, text: 'TRUNCATE users', fs: 14, mono: true, fw: 700, stroke: WARN, color: WARN, s: k === 0 ? pop(u, 1.2) : 1, op: cleaned ? 0.35 : 1 });
    const rows = [];
    if (k >= 1 && !cleaned) rows.push({ id: '1', email: 'a@x.com', op: k === 1 ? fade(u, 1.0) : 1 });
    if (k === 2) rows.push({ id: '…', email: 'a@x.com', bad: true, op: fade(u, 0.8) });
    table(660, 160, rows);
    if (k === 0) { note(340, 380, '끝나면 표를 비우도록 먼저 걸어 둔다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 1) { fly(420, 160, 760, 220, seg(u, 0.2, 1.0), 'INSERT a@x.com', { mono: true, fill: INFO });
      pill(470, 300, 'err == nil', GOOD, pop(u, 1.4), { mono: true, fs: 14, fill: PANEL });
      note(340, 380, '진짜 SQL이 돌아 문법과 컬럼 이름까지 확인된다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 2) { fly(420, 160, 760, 254, seg(u, 0.2, 0.8), 'INSERT a@x.com', { mono: true, fill: WARN }); cross(950, 254, 8, pop(u, 1.0));
      pill(470, 300, 'err != nil → 기대대로', GOOD, pop(u, 1.5), { mono: true, fs: 14, fill: PANEL });
      note(340, 380, 'mock이면 nil이라 통과했을 자리다', fade(u, 2.0), { 'font-size': 14.5, fill: WARN }); return; }
    // k3: 에러 문구 → 정리
    el('rect', { x: 30, y: 340, width: 900, height: 44, rx: 8, fill: INK, opacity: fade(u, 0.2) });
    const msg = 'ERROR: duplicate key value violates unique constraint ... (SQLSTATE 23505)';
    mono(46, 368, msg.slice(0, Math.round(msg.length * E(u, 0.2, 1.5))), { 'font-size': 14, fill: PANEL });
    if (cleaned) mono(800, 230, '(빈 표)', { 'font-size': 14, fill: OFF, 'text-anchor': 'middle' });
    sub(160, 336, cleaned ? 'Cleanup 실행됨' : '', 1, { fill: WARN, 'font-weight': 700 }); }

  // ---------- 5. CI 와 함정 ----------
  function s5(t, c) { const { k, u } = c;
    zone(30, 40, 340, 280, 'runs-on: ubuntu-latest', { fill: SOFT, stroke: GRID, color: INK });
    card(200, 120, 220, 50, { rx: 10, text: 'Docker 데몬', fs: 15, fw: 800, stroke: GOOD, color: GOOD, s: k === 0 ? pop(u, 0.4) : 1 });
    mono(60, 200, 'go test ./... -race -parallel 4', { 'font-size': 13.5, 'font-weight': 700, opacity: k === 0 ? fade(u, 1.0) : 1 });
    if (k === 0) { zone(430, 40, 500, 160, 'Docker 없는 러너', { fill: BADBG, stroke: BAD, color: BAD, op: fade(u, 1.4) });
      cross(480, 120, 12, pop(u, 1.6)); tx(510, 126, 'testcontainers가 시작조차 못 한다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      note(430, 270, '러너 선택이 첫 조건이다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { tx(430, 60, 't.Parallel()을 부른 테스트, 4칸에 동시에', { 'font-size': 14.5, 'font-weight': 700 }); ex(880, 54);
      const lens = [3, 2, 4, 2, 3, 2, 3, 1]; const lane = [0, 0, 0, 0]; const W = 54;
      lens.forEach((L, i) => { let j = lane.indexOf(Math.min(...lane)); const x0 = 440 + lane[j] * W, y = 90 + j * 44; lane[j] += L;
        const f = E(u, 0.2 + i * 0.12, 0.6 + i * 0.12); el('rect', { x: x0, y, width: (L * W - 4) * f, height: 34, rx: 6, fill: i % 2 ? INFO : ACC, opacity: 0.8 });
        if (f > 0.9) mono(x0 + 8, y + 22, 'T' + (i + 1), { 'font-size': 13.5, 'font-weight': 800, fill: PANEL }); });
      note(430, 300, '서로의 데이터를 건드리지 않아야 동시에 돌릴 수 있다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 2) { zone(430, 40, 240, 260, 'Terminate 빠뜨림', { fill: BADBG, stroke: BAD, color: BAD });
      const n = Math.floor(E(u, 0.2, 2.0) * 6);
      for (let i = 0; i < n; i++) box(550, 270 - i * 34, 180, 28, '', { stroke: BAD, op: 0.9 });
      zone(690, 40, 240, 260, 'defer Terminate', { fill: GOODBG, stroke: GOOD, color: GOOD });
      box(810, 160, 180, 40, '', { stroke: GOOD, op: 1 - E(u, 0.8, 1.6) }); if (u > 1.6) check(810, 160, 12, pop(u, 1.6));
      note(430, 340, '러너에 컨테이너가 쌓여 디스크가 찬다', fade(u, 1.8), { 'font-size': 14.5, fill: BAD });
      note(430, 372, 'TestMain에서 한 번 띄워 같이 쓰면 빠르다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k3: 포트
    tx(430, 64, '고정 포트 5432', { 'font-size': 15, 'font-weight': 800, fill: BAD });
    [0, 1].forEach((i) => { const y = 100 + i * 50; card(520, y, 160, 36, { rx: 8, text: 'pkg ' + (i + 1) + ' → 5432', fs: 14, mono: true, stroke: i ? BAD : INK, color: i ? BAD : INK, s: pop(u, 0.2 + i * 0.3) }); });
    cross(620, 150, 9, pop(u, 0.9));
    tx(700, 64, '매핑 포트', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
    [0, 1].forEach((i) => { const y = 100 + i * 50; card(800, y, 180, 36, { rx: 8, text: 'pkg ' + (i + 1) + ' → 포트 ' + 'AB'[i], fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.1 + i * 0.3) }); });
    ['defer Terminate', 'TestMain 1회 기동', '매핑 포트 사용', 'CI에 Docker'].forEach((s, i) => { const x = 440 + (i % 2) * 250, y = 240 + Math.floor(i / 2) * 44;
      check(x, y, 8, pop(u, 1.6 + i * 0.2)); tx(x + 18, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6 + i * 0.2) }); }); }

  const quiz = [
    { q: 'mockRepo.Save가 같은 email을 두 번 받아도 nil을 돌려주는 이유는 무엇인가?',
      o: ['map에 넣기만 하고 UNIQUE 같은 제약이 없어서', 'email 필드를 비교하는 버그가 있어서', 'Go map이 중복 키를 허용해서'], a: 0,
      why: 'mock은 인터페이스만 맞춘 map이다. 실제 DB의 UNIQUE·NOT NULL·트랜잭션은 흉내 내지 않으므로 중복도 조용히 통과한다.' },
    { q: 'postgres.Run에 wait.ForListeningPort("5432/tcp")를 주는 이유는 무엇인가?',
      o: ['포트 번호를 5432로 고정하려고', '컨테이너가 떠도 Postgres가 아직 연결을 받지 않을 수 있어서', '이미지를 더 빨리 받으려고'], a: 1,
      why: '컨테이너 시작과 DB 준비는 다른 시점이다. 대기 전략을 빼면 CI에서만 가끔 연결이 실패하는 테스트가 된다.' },
    { q: 'TestMain에서 defer pg.Terminate(ctx)를 걸고 마지막에 os.Exit(code)를 부르면 어떻게 되나?',
      o: ['Terminate가 os.Exit 직전에 실행된다', 'os.Exit이 실패한다', 'Terminate가 실행되지 않고 컨테이너가 남는다'], a: 2,
      why: 'os.Exit은 defer를 실행하지 않고 바로 끝낸다. 그래서 정리는 run 함수 안의 defer에 두고 TestMain은 os.Exit(run(m))만 한다.' },
    { q: '두 번째 repo.Save(User{Email: "a@x.com"})에서 err가 nil이 아니면 이 테스트는 어떻게 되나?',
      o: ['통과한다. 중복을 DB가 막았다는 뜻이라서', '실패한다. 에러가 났으니까', '건너뛴다'], a: 0,
      why: '테스트는 UNIQUE 위반을 기대한다. err == nil일 때만 t.Fatal로 실패하고, 진짜 Postgres는 SQLSTATE 23505 에러를 돌려준다.' },
    { q: '두 패키지의 테스트가 각자 Postgres를 띄울 때 포트 충돌을 피하는 방법은 무엇인가?',
      o: ['둘 다 5432를 쓰고 순서대로 돌린다', 'ConnectionString이 준 매핑 포트만 쓴다', '포트를 코드에 하드코딩한다'], a: 1,
      why: '컨테이너 안은 5432여도 호스트 쪽 포트는 매번 따로 잡힌다. DSN에 담긴 그 포트를 쓰면 동시에 떠도 겹치지 않는다.' },
  ];

  const summary = [
    'mock은 map에 넣기만 해서 UNIQUE 위반이나 SQL 오타를 잡지 못한다.',
    'testcontainers는 테스트 안에서 postgres:16-alpine 컨테이너를 띄우고 포트가 열릴 때까지 기다린다.',
    '컨테이너는 한 번 띄워 공유하고, Terminate는 run 안에 defer로 둔다. os.Exit은 defer를 건너뛴다.',
    '진짜 DB에서는 중복 email이 SQLSTATE 23505 에러로 돌아와 배포 전에 잡힌다.',
  ];
  const review = [
    { q: 'CI 러너의 디스크가 점점 차고 docker ps에 postgres 컨테이너가 수십 개 남아 있다. 먼저 볼 곳은?',
      o: ['TestMain에서 defer 뒤에 os.Exit을 부르는지', 'wait 전략의 포트 번호', 'go-version 값'], a: 0,
      why: 'os.Exit은 defer를 건너뛴다. 정리가 돌지 않으면 실행마다 컨테이너가 남으니 run 함수로 옮겨 defer가 돌게 한다.' },
    { q: 't.Parallel()을 붙인 뒤 테스트가 가끔 남의 행을 못 찾고 실패한다. 의심할 것은?',
      o: ['-race 옵션', '각 테스트의 Cleanup이 TRUNCATE로 표 전체를 비운다', '이미지 태그 고정'], a: 1,
      why: 'TRUNCATE users는 다른 테스트의 데이터까지 지운다. 병렬로 돌리려면 자기 행만 지우거나 테스트마다 스키마를 나눈다.' },
    { q: 'mock 단위 테스트는 모두 초록인데 배포하자 "SELCT" 문법 오류가 났다. 다음에 할 일은?',
      o: ['mock에 문법 검사 코드를 넣는다', '테스트를 더 자주 돌린다', '핵심 경로를 진짜 Postgres 컨테이너로 검증한다'], a: 2,
      why: 'SQL 문법은 실제 DB만 판정한다. testcontainers로 같은 쿼리를 진짜 Postgres에 돌리면 배포 전에 드러난다.' },
  ];

  R.page({ title: '통합 테스트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
