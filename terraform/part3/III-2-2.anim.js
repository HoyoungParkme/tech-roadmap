/* III-2-2 state lock 충돌과 force-unlock — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   왼쪽: Alice·Bob, 가운데: S3 의 state 와 잠금 칸, 오른쪽: 시간 순 사건 기록 (페이지 데이터 events) */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, server, cross, check, lock, clock, terminal, snippet } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 지역 도우미 ----------
  const UA = [80, 110], UB = [80, 300], ST = [400, 110], LK = [400, 310];
  const UCOL = { apply: ACC, idle: MUT, crashed: BAD, blocked: BAD, wait: WARN };
  function users(b, o) { o = o || {};
    [[UA, 'Alice', b.userA], [UB, 'Bob', b.userB]].forEach(([p, n, us]) => { const col = UCOL[us.state] || INK;
      person(p[0], p[1] - 10, null, { stroke: col }); tx(p[0], p[1] + 36, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col });
      if (us.state === 'crashed') cross(p[0], p[1] - 14, 20, o.crashPop ?? 1); }); }
  function bucket(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-34,-22 L34,-22 L27,26 L-27,26 Z', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: 0, cy: -22, rx: 34, ry: 7, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    if (name) tx(0, 46, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  // 잠금 칸 (DynamoDB 항목 하나)
  function lockSlot(lk, o) { o = o || {}; const [x, y] = LK, st = lk.state, col = st === 'held' ? ACC : st === 'stale' ? WARN : st === 'released' ? GOOD : OFF;
    el('rect', { x: x - 110, y: y - 46, width: 220, height: 92, rx: 12, fill: st === 'stale' ? WARNBG : st === 'held' ? ACCBG : PANEL, stroke: col, 'stroke-width': 2.5 });
    tx(x - 96, y - 24, o.title || 'lock 항목', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    lock(x + 80, y - 22, st === 'held' || st === 'stale', col, 0.8);
    const who = lk.holder || (st === 'released' ? '해제됨' : '비어 있음');
    tx(x - 96, y + 6, who.length > 16 ? who.slice(0, 16) + '…' : who, { 'font-size': 15, 'font-weight': 800, fill: col === OFF ? MUT : col });
    if (lk.lockId) mono(x - 96, y + 30, 'ID ' + (lk.lockId.length > 14 ? lk.lockId.slice(0, 14) + '…' : lk.lockId), { 'font-size': 13.5, fill: INK }); }
  // 사건 기록: 시각 · 누가 · 무엇 (u 에 따라 한 줄씩)
  function clip(s, w, fs) { if (tw(s, fs) <= w) return s; let o = ''; for (const ch of s) { if (tw(o + ch + '…', fs) > w) break; o += ch; } return o + '…'; }
  function evlog(events, u, o) { o = o || {}; const x = 590, y = 22, w = 346, n = events.length;
    el('rect', { x, y, width: w, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 14, y + 24, '사건 기록', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const lh = n > 4 ? 50 : 60;
    events.forEach((e, i) => { const op = o.all ? 1 : fade(u, 0.2 + i * 0.4), yy = y + 54 + i * lh;
      const col = /System/.test(e.who) ? WARN : e.who === 'Bob' ? INFO : e.who === 'Alice' ? ACC : INK;
      mono(x + 14, yy, e.t, { 'font-size': 13.5, fill: MUT, opacity: op }); tx(x + 120, yy, e.who, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: op });
      tx(x + 14, yy + 22, clip(e.msg, w - 28, 13.5), { 'font-size': 13.5, fill: INK, opacity: op }); }); }
  const chip = (p, s, col, sc) => pill(p[0] + 110, p[1] - 4, s, col, sc, { fs: 13.5 });

  // ---------- 1. 동시에 apply ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    users(b, { crashPop: pop(u, 0.6) }); evlog(b.events, u, { all: k === 4 });
    bucket(ST[0], ST[1], 'terraform.tfstate', { s: 1.1, stroke: k === 3 ? BAD : INK });
    const ver = k <= 2 ? 'v7' : u < 1.2 ? 'v8 (Alice)' : 'v8 (Bob)';
    pill(ST[0], ST[1] - 64, ver, k === 3 && u > 1.2 ? BAD : INK, 1, { mono: true, fs: 14 });
    if (k === 0) { chip(UA, 'apply', ACC, pop(u, 0.4)); dot([[UA[0] + 30, UA[1]], [ST[0] - 40, ST[1]]], seg(u, 0.8, 1.6), ACC, 7); }
    if (k === 1) { chip(UA, 'apply', ACC, 1); chip(UB, 'apply (+0.01s)', INFO, pop(u, 0.4)); grow(UB[0] + 30, UB[1] - 20, ST[0] - 40, ST[1] + 10, E(u, 0.8, 1.6), INFO, { dash: '5 5' }); }
    if (k === 2) { chip(UA, 'v7 읽음', ACC, pop(u, 0.9)); chip(UB, 'v7 읽음', INFO, pop(u, 1.1));
      fly(ST[0], ST[1], UA[0] + 60, UA[1] + 40, seg(u, 0.2, 0.9), 'v7', { mono: true }); fly(ST[0], ST[1], UB[0] + 60, UB[1] - 40, seg(u, 0.3, 1.0), 'v7', { mono: true, fill: INFO }); }
    if (k === 3) { fly(UA[0] + 40, UA[1], ST[0], ST[1], seg(u, 0.3, 1.0), 'Alice write', {}); fly(UB[0] + 40, UB[1] - 30, ST[0], ST[1], seg(u, 1.1, 1.8), 'Bob write', { fill: INFO });
      chip(UA, '변경 사라짐', BAD, pop(u, 1.9)); chip(UB, '마지막에 덮어씀', INFO, pop(u, 1.4)); sub(ST[0], 210, '에러 없이 조용히', fade(u, 2.1), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); }
    if (k === 4) { lockSlot(b.lock, { title: 'state lock (도입)' }); grow(ST[0], ST[1] + 50, LK[0], LK[1] - 50, E(u, 0.3, 0.9), ACC, {});
      banner(330, 400 - 18, '쓰기 전에 잠근다', pop(u, 1.2)); } }

  // ---------- 2. 잠금 획득 ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { snippet(24, 30, ['backend "s3" {', '  bucket         = "team-tfstate"', '  key            = "prod/terraform.tfstate"', '  dynamodb_table = "tfstate-lock"', '}'], { fs: 14 });
      el('rect', { x: 30, y: 115, width: 400, height: 22, rx: 4, fill: ACC, opacity: 0.18 * fade(u, 0.4) });
      bucket(640, 110, 'state', { s: 1.2 * pop(u, 0.6) }); lockSlot({ state: 'free' }, {});
      lbl(640, 186, 'S3 = state 파일', fade(u, 0.9), {}); pill(640, 400 - 24, 'DynamoDB = 잠금 항목', ACC, pop(u, 1.3), { fs: 14 });
      grow(440, 125, 588, 110, E(u, 0.8, 1.3), MUT, {}); grow(440, 125, LK[0] - 60, LK[1] - 48, E(u, 1.2, 1.7), ACC, {}); return; }
    if (k !== 3) { users(b, {}); bucket(ST[0], ST[1], 'state', {}); } evlog(b.events, u, { all: k >= 3 });
    lockSlot(b.lock, { title: 'tfstate-lock 항목' });
    if (k === 1) { dot([[UA[0] + 30, UA[1] + 10], [LK[0] - 110, LK[1] - 20]], seg(u, 0.5, 1.5), ACC, 8); dot([[UB[0] + 30, UB[1]], [LK[0] - 110, LK[1]]], seg(u, 0.5, 1.5), INFO, 8);
      chip(UA, 'PutItem', ACC, pop(u, 0.3)); chip(UB, 'PutItem', INFO, pop(u, 0.3)); sub(LK[0], LK[1] + 72, '조건: 항목이 비어 있을 때만', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
    if (k === 2) { chip(UA, '잠금 획득', ACC, pop(u, 0.3)); dot([[UB[0] + 30, UB[1]], [LK[0] - 110, LK[1]], [UB[0] + 40, UB[1] + 20]], seg(u, 0.5, 1.6), INFO, 8);
      cross(LK[0] - 130, LK[1], 12, pop(u, 1.0)); pill(UB[0] + 140, UB[1] + 80, 'ConditionalCheckFailed', BAD, pop(u, 1.4), { fs: 13.5 }); }
    if (k === 3) { terminal(24, 22, 556, 200, [['Error: Error acquiring the state lock', '#f87171'], ['  ID:        a3f1-9c22-4e7b-bc01-…', null], ['  Path:      team-tfstate/prod/terraform.tfstate', null], ['  Operation: OperationTypeApply', null], ['  Who:       alice@team', null]], E(u, 0.2, 1.6) * 5, { fs: 13.5, title: 'Bob의 터미널' });
      pill(LK[0] - 120, 220, 'LOCK_ID를 적어 둔다', WARN, pop(u, 1.9), { fs: 13.5 }); }
    if (k === 4) { // 기본 0s vs -lock-timeout
      chip(UB, '-lock-timeout=5m', INFO, pop(u, 0.3));
      const rt = [[UB[0] + 30, UB[1] + 30], [LK[0] - 110, LK[1] + 30]];
      for (let i = 0; i < 3; i++) dot(rt, seg(u, 0.5 + i * 0.6, 1.0 + i * 0.6), INFO, 6);
      clock(230, 220, 22, E(u, 0.5, 2.6) * 0.5, INFO, '');
      sub(230, 262, '그동안 다시 시도', fade(u, 0.8), { fill: INFO, 'font-weight': 700 });
      pill(LK[0], 32 + 160, '기본값 0s: 바로 실패', BAD, pop(u, 1.4), { fs: 13.5 }); } }

  // ---------- 3. stale lock ----------
  function s3(t, c) { const { k, u } = c, b = c.beat;
    users(b, { crashPop: k === 0 ? pop(u, 0.5) : 1 }); evlog(b.events, u, {}); bucket(ST[0], ST[1], 'state', {});
    lockSlot(b.lock, {});
    if (k === 0) { chip(UA, '노트북 멈춤', BAD, pop(u, 0.8)); grow(UA[0] + 20, UA[1] + 40, LK[0] - 110, LK[1] - 30, 1 - E(u, 1.0, 1.6), OFF, { dash: '5 5', plain: true });
      sub(LK[0], LK[1] + 72, 'DeleteItem을 부를 프로세스가 없다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); }
    if (k === 1) { clock(LK[0] + 140, LK[1] - 120, 26, 0, OFF, ''); tx(LK[0] + 140, LK[1] - 80, 'TTL 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
      pill(LK[0], LK[1] + 72, 'STALE (좀비 잠금)', WARN, pop(u, 1.0), { fs: 14 }); }
    if (k === 2) { clock(LK[0] + 140, LK[1] - 120, 26, E(u, 0.2, 1.4) * 0.5, WARN, '30분'); dot([[UB[0] + 30, UB[1]], [LK[0] - 110, LK[1]]], seg(u, 1.0, 1.6), INFO, 7); cross(LK[0] - 130, LK[1], 12, pop(u, 1.6));
      chip(UB, '또 거절', BAD, pop(u, 1.8)); sub(LK[0], LK[1] + 72, 'Created가 30분 전이면 stale 의심', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
    if (k === 3) { ['콘솔에서 직접 삭제', '-lock=false 우회'].forEach((s, i) => { const y = 190 + i * 46; card(LK[0] - 10, y - 0, 220, 40, { rx: 8, text: s, fs: 14, stroke: BAD, color: BAD, s: pop(u, 0.3 + i * 0.5) }); cross(LK[0] + 116, y, 10, pop(u, 0.6 + i * 0.5)); });
      sub(LK[0], 400 - 4, '실제 작업자의 state를 깨뜨린다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); }
    if (k === 4) { pill(LK[0], 196, 'terraform force-unlock <ID>', GOOD, pop(u, 0.3), { mono: true, fs: 13.5 });
      pill(LK[0], LK[1] + 72, '먼저 보유자 본인에게 확인', GOOD, pop(u, 0.9), { fs: 14 }); } }

  // ---------- 4. force-unlock ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    users(b, {}); evlog(b.events, u, {}); bucket(ST[0], ST[1], 'state', {});
    if (k === 0) { lockSlot(b.lock, {}); ['ID  a3f1-9c22-…', 'Who alice@team'].forEach((s, i) => fly(LK[0], LK[1] + 20, 330, 200, seg(u, 0.4 + i * 0.6, 1.2 + i * 0.6), s, { mono: true, fill: WARN }));
      pill(330, 196, '추측하지 않고 옮겨 적는다', WARN, pop(u, 2.0), { fs: 13.5 }); return; }
    if (k === 1) { lockSlot(b.lock, {});
      card(200, 180, 210, 44, { rx: 14, text: '지금 apply 중?', fs: 14, stroke: INFO, color: INFO, s: pop(u, 0.3) });
      card(200, 232, 250, 44, { rx: 14, text: '아니, 노트북 죽었어요', fs: 14, stroke: ACC, color: ACC, s: pop(u, 1.0) });
      pill(LK[0] + 0, LK[1] + 72, '죽은 잠금으로 확정', GOOD, pop(u, 1.7), { fs: 14 }); return; }
    if (k === 2) { const g = 1 - E(u, 1.0, 1.8); lockSlot(g > 0.5 ? { state: 'stale', holder: 'Alice (crashed)', lockId: 'a3f1-9c22-…' } : b.lock, {});
      terminal(130, 186, 440, 70, [['$ terraform force-unlock "$LOCK_ID"', null]], E(u, 0.1, 0.8), { fs: 14 });
      sub(LK[0], LK[1] + 72, 'DynamoDB 항목을 직접 지운다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    lockSlot(b.lock, {});
    if (k === 3) { terminal(150, 165, 430, 94, [['Do you really want to force-unlock?', '#fbbf24'], ['Enter a value: yes', null], ['Terraform state has been successfully unlocked!', 'var(--good)']], E(u, 0.2, 1.6) * 3, { fs: 13.5, lh: 18, title: '출력 예시' });
      pill(LK[0], LK[1] + 72, '-force를 붙이면 묻지 않는다', WARN, pop(u, 2.0), { fs: 13.5 }); return; }
    if (k === 4) { pill(210, 210, 'terraform plan', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      ['state', '실제'].forEach((s, i) => { card(340 + i * 140, 220, 110, 36, { rx: 8, text: s, fs: 14, stroke: GOOD, s: pop(u, 0.6 + i * 0.3) }); });
      grow(395, 220, 425, 220, E(u, 1.2, 1.5), GOOD, { plain: true });
      sub(LK[0], LK[1] + 72, 'Alice가 어디까지 적용했는지 본다', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); return; }
    // k === 5
    chip(UB, 'apply 재시작', GOOD, pop(u, 0.3)); dot([[UB[0] + 30, UB[1]], [LK[0] - 110, LK[1]]], seg(u, 0.4, 1.2), GOOD, 7);
    pill(330, 210, 'ID가 틀리면: lock id does not match', BAD, pop(u, 1.5), { fs: 13.5 }); }

  // ---------- 5. 예방 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 3) { // 사람은 plan 까지, apply 는 CI
      person(110, 120, 'Alice', {}); person(110, 300, 'Bob', {});
      server(720, 200, 'CI runner', { lamp: GOOD });
      pill(270, 120, 'plan', INK, 1, { mono: true }); pill(270, 300, 'plan', INK, 1, { mono: true });
      if (k === 0) { grow(320, 120, 650, 190, E(u, 0.5, 1.2), OFF, { dash: '5 5' }); cross(480, 155, 12, pop(u, 1.2)); pill(480, 110, '로컬 apply 금지', BAD, pop(u, 1.0), { fs: 14 });
        pill(720, 300, 'apply는 CI만', GOOD, pop(u, 1.6), { fs: 15 }); return; }
      [['사람 user', 's3:PutObject', BAD, 120], ['CI role', 's3:PutObject · dynamodb:PutItem', GOOD, 300]].forEach(([a, p, col, y], i) => {
        card(470, y, 260, 64, { rx: 10, stroke: col, sw: 2, s: pop(u, 0.3 + i * 0.6) }); tx(352, y - 6, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.6) });
        mono(352, y + 18, p, { 'font-size': 13.5, opacity: fade(u, 0.4 + i * 0.6) }); });
      cross(590, 120, 12, pop(u, 0.9)); check(590, 300, 12, pop(u, 1.5)); sub(720, 380, '규칙은 문서가 아니라 IAM으로 강제한다', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { lbl(480, 46, 'concurrency: prod-apply', 1, { class: 'mono', fill: ACC });
      const run = Math.floor(clamp(u / 0.9, 0, 2.99));
      ['PR #12 merge', 'PR #13 merge', 'PR #14 merge'].forEach((s, i) => { const x = 230 + i * 250, on = i === run, done = i < run;
        card(x, 180, 200, 70, { rx: 10, stroke: on ? ACC : done ? GOOD : OFF, sw: 2.5, fill: on ? ACCBG : null });
        tx(x, 176, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); sub(x, 200, done ? '완료' : on ? 'apply 중' : '큐에서 대기', 1, { fill: done ? GOOD : on ? ACC : MUT, 'font-weight': 700 }); });
      sub(480, 290, '같은 그룹 잡은 한 번에 하나만 돈다', fade(u, 0.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { ['checkout', 'setup-terraform', 'init', 'apply -auto-approve'].forEach((s, i) => { const x = 130 + i * 230, sc = pop(u, 0.2 + i * 0.4);
        if (i) grow(x - 230 + 92, 180, x - 92, 180, E(u, 0.2 + i * 0.4, 0.5 + i * 0.4), ACC, {});
        card(x, 180, 180, 60, { rx: 10, text: s, fs: 14, mono: true, stroke: i === 3 ? GOOD : INK, color: i === 3 ? GOOD : INK, s: sc }); });
      sub(480, 280, '실행 주체가 CI 러너 하나로 고정된다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { // Atlantis
      card(250, 190, 300, 240, { rx: 12, stroke: GRID, sw: 2 }); tx(120, 100, 'PR #42', { 'font-size': 16, 'font-weight': 800 });
      [['atlantis', 'plan 결과 댓글', INFO], ['리뷰어', '승인 · atlantis apply', ACC], ['atlantis', 'apply 완료', GOOD]].forEach(([w, m, col], i) => { const y = 140 + i * 66, s = pop(u, 0.3 + i * 0.5);
        card(250, y, 260, 52, { rx: 10, stroke: col, sw: 1.8, s }); tx(134, y - 4, w, { 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: s }); tx(134, y + 16, m, { 'font-size': 14, opacity: s }); });
      lock(560, 190, true, ACC, 1.4 * pop(u, 1.6)); lbl(700, 196, 'PR 단위 잠금', fade(u, 1.7), { fill: ACC });
      sub(700, 230, '기록이 PR에 남는다', fade(u, 2.0)); return; }
    // k === 5
    [['작은 팀', 'Actions + concurrency'], ['큰 팀 · 여러 stack', 'Atlantis 또는 HCP Terraform']].forEach(([a, b2], i) => { const x = 260 + i * 440, s = pop(u, 0.2 + i * 0.5);
      card(x, 170, 380, 130, { rx: 14, stroke: ACC, sw: 2.5, s }); lbl(x, 150, a, fade(u, 0.3 + i * 0.5), { 'font-size': 18 }); mono(x, 186, b2, { 'text-anchor': 'middle', 'font-size': 15, fill: ACC, opacity: fade(u, 0.4 + i * 0.5) }); });
    banner(480, 320, '공통: 로컬 apply 금지', pop(u, 1.4)); sub(480, 370, 'force-unlock을 쓸 일이 거의 없어진다', fade(u, 1.8), { 'font-size': 15 }); }

  const quiz = [
    { q: '잠금 없이 Alice와 Bob이 같은 v7 state를 읽고 차례로 썼다. 결과는 무엇인가?',
      o: ['둘의 변경이 자동으로 합쳐진다', '나중에 쓴 Bob의 state가 Alice의 변경을 덮는다', '두 번째 쓰기가 에러로 거절된다'], a: 1,
      why: 'state는 파일 하나라 마지막 쓰기만 남는다. Alice의 리소스는 state에서 사라지고, 이 일은 에러 없이 조용히 일어난다.' },
    { q: 'DynamoDB 잠금에서 두 사람 중 정확히 한 명만 통과하게 만드는 장치는 무엇인가?',
      o: ['항목이 비어 있을 때만 성공하는 조건부 PutItem', '잠금 항목의 TTL', 'S3 객체의 버전 번호'], a: 0,
      why: '조건부 쓰기는 원자적이라 먼저 도착한 Alice만 성공한다. Bob은 ConditionalCheckFailed로 거절된다.' },
    { q: 'Alice의 노트북이 apply 도중 꺼졌다. 30분 뒤에도 잠금이 남아 있는 이유는 무엇인가?',
      o: ['DynamoDB가 잠금을 30분 단위로 연장해서', 'Bob이 잠금을 다시 잡아서', '잠금은 본인이 풀어야 하는데 프로세스가 죽어 DeleteItem이 불리지 않아서'], a: 2,
      why: 'terraform 잠금에는 TTL이 없다. 끝날 때 본인이 푸는 방식이라 프로세스가 죽으면 좀비 잠금이 된다.' },
    { q: 'force-unlock으로 잠금을 푼 직후, apply를 다시 돌리기 전에 할 일은 무엇인가?',
      o: ['state 파일을 지운다', 'terraform plan으로 어긋난 리소스가 있는지 본다', '-lock=false로 한 번 apply한다'], a: 1,
      why: 'Alice의 apply가 어디까지 적용됐는지 모른다. plan으로 state와 실제가 어긋났는지 확인하고, 깨끗하면 다시 apply한다.' },
    { q: '로컬 apply를 금지하고 CI에서만 apply하게 하면 무엇이 달라지나?',
      o: ['apply 주체가 CI 하나로 줄어 잠금 경쟁과 좀비 잠금이 거의 사라진다', 'state 잠금이 필요 없어진다', 'plan을 돌릴 수 없게 된다'], a: 0,
      why: 'concurrency로 잡이 한 번에 하나만 돌고, 사람 노트북이 꺼져도 잠금이 남지 않는다. 잠금 자체는 그대로 쓴다.' },
  ];

  const summary = [
    '잠금이 없으면 같은 state를 동시에 쓸 때 나중 쓰기가 앞 변경을 조용히 덮는다.',
    'DynamoDB 조건부 쓰기로 한 명만 잠금을 잡고, 다른 사람은 기본값에서 바로 실패한다.',
    '잠금에는 TTL이 없어 apply 중 프로세스가 죽으면 잠금이 남는다.',
    '보유자에게 확인한 뒤 force-unlock하고 plan으로 어긋남을 본다. 평소엔 CI에서만 apply한다.',
  ];
  const review = [
    { q: '팀원 모두에게 같은 LOCK_ID로 Error acquiring the state lock이 뜨고 Created가 어제다. 가장 먼저 할 일은?',
      o: ['DynamoDB 콘솔에서 항목을 지운다', '보유자(Who)에게 지금 작업 중인지 묻는다', '-lock=false로 apply한다'], a: 1,
      why: '오래된 잠금이라도 실제로 작업 중일 수 있다. 본인 확인 뒤에 force-unlock으로 그 ID만 푼다.' },
    { q: 'Bob이 잠금에 막힐 때마다 손으로 다시 실행하는 게 번거롭다. terraform이 정해진 시간 동안 다시 시도하게 하려면?',
      o: ['-lock-timeout=5m 같은 값을 준다', 'force-unlock -force를 스크립트에 넣는다', '잠금 테이블에 TTL을 건다'], a: 0,
      why: '기본값은 0s라 바로 실패한다. -lock-timeout을 주면 그 시간 동안 잠금을 다시 시도한다.' },
    { q: 'force-unlock으로 Alice의 죽은 잠금을 풀었다. apply 전에 plan을 돌렸더니 변경이 몇 개 나온다. 이것이 뜻하는 것은?',
      o: ['force-unlock이 실패했다', 'S3 버킷이 잘못 설정됐다', 'Alice의 apply가 중간까지만 적용돼 state와 실제가 어긋났다'], a: 2,
      why: '중단된 apply는 일부만 반영된 채 멈춘다. plan에 나온 차이를 검토한 뒤 apply를 다시 시작한다.' },
  ];

  R.page({ title: 'state lock 경쟁 타임라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
