/* III-1-2 remote state (S3 + 잠금) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, terminal, snippet } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 지역 도우미 ----------
  function bucket(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-38,-24 L38,-24 L30,28 L-30,28 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash }, g);
    el('ellipse', { cx: 0, cy: -24, rx: 38, ry: 8, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    if (name) tx(0, 50, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  function fileIc(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-18,-24 H8 L18,-14 V24 H-18 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M8,-24 V-14 H18', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-6, 2, 10].forEach((y) => el('line', { x1: -11, y1: y, x2: 11, y2: y, stroke: o.lines || OFF, 'stroke-width': 2.5 }, g));
    if (name) tx(0, 44, name, { 'text-anchor': 'middle', 'font-size': o.fs || 14, 'font-weight': 700, class: 'mono', fill: o.color || c }, g); return g; }
  function laptop(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('rect', { x: -44, y: -32, width: 88, height: 54, rx: 6, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-56,22 H56 L50,31 H-50 Z', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    if (name) tx(0, 52, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: c }, g); return g; }
  function keyIc(cx, cy, col, s) { const g = G(cx, cy, s ?? 1);
    el('circle', { cx: -8, cy: 0, r: 7, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
    el('path', { d: 'M-1,0 H17 M11,0 V7 M16,0 V6', stroke: col, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g); return g; }
  // DynamoDB 잠금 테이블: 머리 LockID | 정보, 줄 하나
  function lockTable(x, y, w, rowTxt, o) { o = o || {}; const col = o.col || INK;
    el('rect', { x, y, width: w, height: 96, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    tx(x + 14, y + 22, o.title || 'DynamoDB  tf-state-lock', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    el('line', { x1: x, y1: y + 34, x2: x + w, y2: y + 34, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    mono(x + 14, y + 54, 'LockID (S)', { 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); mono(x + w * 0.66, y + 54, 'Who', { 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 });
    if (rowTxt) { const ro = o.rowOp ?? 1;
      el('rect', { x: x + 6, y: y + 62, width: w - 12, height: 26, rx: 5, fill: o.rowBg || ACCBG, opacity: ro });
      mono(x + 14, y + 80, rowTxt[0], { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: ro }); mono(x + w * 0.66, y + 80, rowTxt[1], { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: ro }); } }
  function cloudShape(cx, cy, w, h, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INFO;
    el('path', { d: `M${-w / 2 + 30},${h / 2} H${w / 2 - 30} A30,30 0 0 0 ${w / 2 - 30},${-h / 2 + 30} A40,40 0 0 0 ${w / 2 - 110},${-h / 2 + 10} A50,50 0 0 0 ${-w / 2 + 60},${-h / 2 + 30} A30,30 0 0 0 ${-w / 2 + 30},${h / 2} Z`, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    if (o.text) tx(0, 10, o.text, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: c }, g); return g; }

  // ---------- 1. backend "s3" 선언 ----------
  const BK = ['terraform {', '  backend "s3" {', '    bucket = "tf-state-prod-acme"', '    key    = "network/terraform.tfstate"', '    region = "ap-northeast-2"', '  }', '}'];
  function s1(t, c) { const { k, u } = c;
    laptop(110, 150, '개발자 PC', {}); fileIc(110, 146, null, { s: 0.7, stroke: k >= 3 ? OFF : WARN });
    sub(110, 230, 'terraform.tfstate', 1, { class: 'mono', fill: WARN, 'font-weight': 700 });
    const S = [800, 150]; bucket(S[0], S[1], k >= 1 ? 'tf-state-prod-acme' : 'S3 (아직 미사용)', { s: 1.2, stroke: k >= 1 ? ACC : OFF, dash: k === 0 ? '6 5' : null });
    if (k === 0) { person(330, 330, 'B', {}); person(450, 330, 'C', {});
      grow(160, 190, 310, 300, E(u, 0.4, 1.2), OFF, { dash: '5 6', plain: true }); grow(165, 190, 430, 300, E(u, 0.5, 1.3), OFF, { dash: '5 6', plain: true });
      cross(240, 248, 12, pop(u, 1.3)); cross(300, 248, 12, pop(u, 1.4));
      lbl(390, 400, '팀원과 공유할 방법이 없다', fade(u, 1.6), { fill: WARN });
      lockTable(600, 280, 330, null, { dash: '6 5', op: 0.5, title: 'DynamoDB (아직 미사용)' }); return; }
    const shown = k === 1 ? lerp(1, 3, E(u, 0.2, 1.4)) : k === 2 ? lerp(3, 5, E(u, 0.2, 1.2)) : 7;
    const lines = BK.slice(0, Math.ceil(shown)).concat(k >= 2 ? [] : []);
    snippet(250, 26, lines.concat(k >= 3 ? [] : ['  …']), { fs: 14.5, w: 420 });
    if (k === 1) { grow(640, 96, 752, 140, E(u, 1.4, 2.0), ACC, { sw: 2 }); sub(800, 238, '버킷은 미리 따로 만든다', fade(u, 1.9), { fill: INK, 'font-weight': 700 }); }
    if (k === 2) { pill(800, 250, 'network/terraform.tfstate', ACC, pop(u, 1.2), { mono: true, fs: 13.5 }); pill(800, 292, 'ap-northeast-2', INK, pop(u, 1.5), { mono: true, fs: 13.5 });
      sub(470, 330, 'key = 버킷 안 경로, 환경·컴포넌트로 나눈다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { terminal(250, 250, 440, 140, [['$ terraform init -migrate-state', null], ['Initializing the backend...', null], ['Do you want to copy existing state', 'var(--warn)'], ['to the new backend?', 'var(--warn)']], E(u, 0.1, 1.6) * 4, { fs: 14, title: '출력 예시' });
      pill(800, 250, 'yes / no를 묻는다', WARN, pop(u, 1.9), { fs: 14 }); } }

  // ---------- 2. S3 에 저장 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { bucket(250, 190, 'state 버킷', { s: 1.7, stroke: ACC });
      ['AZ-a', 'AZ-b', 'AZ-c'].forEach((a, i) => { const y = 90 + i * 100, s = pop(u, 0.3 + i * 0.3);
        card(560, y, 130, 64, { rx: 10, stroke: GOOD, sw: 2, s }); fileIc(530, y, null, { s: 0.6 * s, stroke: GOOD }); mono(575, y + 5, a, { 'font-size': 14, 'font-weight': 700, opacity: s });
        grow(320, 190, 492, y, E(u, 0.2 + i * 0.3, 0.7 + i * 0.3), GOOD, { plain: true }); });
      mono(810, 150, '99.999999999%', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.3) });
      sub(810, 178, '내구성 (11 nines)', fade(u, 1.4), { 'font-size': 15 });
      pill(810, 250, 'IAM으로 권한 분리', INK, pop(u, 1.8), { fs: 14 }); pill(810, 300, '버전 관리 내장', INK, pop(u, 2.1), { fs: 14 }); return; }
    if (k === 1) { mono(60, 60, 's3://tf-state-prod-acme/', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      const T = [['prod/', 0, 100], ['network/terraform.tfstate', 1, 140], ['compute/terraform.tfstate', 1, 180], ['data/terraform.tfstate', 1, 220], ['stage/', 0, 270], ['dev/', 0, 320]];
      T.forEach(([n, d, y], i) => { const g = E(u, 0.2 + i * 0.2, 0.6 + i * 0.2), x = 90 + d * 40;
        el('path', { d: `M${x - 20},${y - 34} V${y - 5} H${x - 4}`, fill: 'none', stroke: MUT, 'stroke-width': 1.8, opacity: g });
        const hit = i === 1 && u > 1.8; mono(x, y, n, { 'font-size': 14.5, 'font-weight': 700, fill: hit ? BAD : d ? GOOD : INK, opacity: g }); if (d) check(x + 260, y - 5, 8, g * (i === 1 && u > 1.8 ? 0 : 1)); });
      cross(390, 135, 10, pop(u, 1.8)); card(700, 160, 300, 110, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 1.9) });
      tx(700, 150, 'network가 깨져도', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      tx(700, 178, 'compute · data는 무사', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) });
      sub(700, 300, '잘게 나눌수록 사고 범위(blast radius)가 작다', fade(u, 2.3), { fill: INK }); return; }
    const L = [['$ terraform init -migrate-state', null], ['Initializing the backend...', null], ['Do you want to copy existing state to the new backend?', 'var(--warn)'], ['  Enter "yes" to copy and "no" to start with an empty state.', null], ['yes', 'var(--panel)'], ['Successfully configured the backend "s3"!', 'var(--good)']];
    if (k === 2 || k === 3) { terminal(24, 24, 560, 180, L, k === 2 ? E(u, 0.1, 1.8) * 4 : lerp(4, 6, E(u, 0.2, 1.0)), { fs: 13.5, title: '출력 예시' });
      laptop(110, 300, null, {}); fileIc(110, 296, null, { s: 0.7, stroke: k === 3 && u > 1.6 ? OFF : WARN });
      bucket(800, 290, 'network/terraform.tfstate', { s: 1.2, stroke: ACC });
      if (k === 2) { pill(380, 300, 'backend 변경 감지', WARN, pop(u, 1.8), { fs: 15 }); return; }
      fly(110, 296, 800, 290, seg(u, 0.9, 2.0), 'terraform.tfstate', { mono: true }); if (u > 2.0) fileIc(800, 292, null, { s: 0.7 * pop(u, 2.0), stroke: ACC });
      sub(110, 360, '로컬은 비었다', fade(u, 2.0), { 'font-weight': 700 });
      return; }
    // k === 4: 최소 IAM
    lbl(480, 46, 'state를 다루는 데 필요한 권한', 1, { 'font-size': 17 });
    [['s3:ListBucket', '버킷'], ['s3:GetObject · PutObject · DeleteObject', 'state 객체'], ['dynamodb:GetItem · PutItem · DeleteItem', '잠금 테이블']].forEach(([a, b], i) => {
      const y = 110 + i * 70, s = pop(u, 0.2 + i * 0.35); card(480, y, 680, 54, { rx: 10, stroke: GOOD, sw: 2, s });
      check(166, y, 10, s); mono(190, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); tx(800, y + 5, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.35) }); });
    ['ec2:*', 's3:*', 'iam:*'].forEach((s, i) => { pill(300 + i * 180, 340, s, OFF, pop(u, 1.4 + i * 0.2), { mono: true, color: MUT }); cross(300 + i * 180 + 44, 340, 8, pop(u, 1.6 + i * 0.2)); });
    sub(480, 392, '그 외 권한은 필요 없다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 3. 잠금 ----------
  const A = [100, 110], B = [100, 310], S = [470, 110], T = [610, 260];
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { // S3 자체 잠금
      bucket(260, 180, 'tf-state-prod-acme', { s: 1.6, stroke: GOOD });
      fileIc(520, 120, null, { s: 0.9 }); mono(550, 126, 'network/terraform.tfstate', { 'font-size': 14.5, 'font-weight': 700 });
      fileIc(520, 210, null, { s: 0.9 * pop(u, 0.5), stroke: GOOD }); mono(550, 216, 'network/terraform.tfstate.tflock', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
      lock(500, 190, true, GOOD, 0.8 * pop(u, 0.8));
      snippet(470, 260, ['backend "s3" {', '  use_lockfile = true', '}'], { fs: 14, op: fade(u, 1.0) });
      lockTable(40, 300, 360, null, { op: 1 - E(u, 1.4, 2.2) * 0.6, title: 'DynamoDB tf-state-lock' });
      pill(500, 370, 'deprecated', BAD, pop(u, 1.8), { mono: true, fs: 14 }); return; }
    laptop(A[0], A[1], '개발자 A', { stroke: k === 4 ? BAD : INK }); laptop(B[0], B[1], '개발자 B', {});
    bucket(S[0], S[1], 'state', { s: 1.1 });
    if (k === 0) { // lost update
      dot([[160, 110], [430, 110]], seg(u, 0.2, 1.0), ACC, 7); dot([[160, 300], [430, 130]], seg(u, 0.3, 1.1), WARN, 7);
      const v = u < 1.2 ? 'v7' : u < 1.9 ? 'v8 (A: + db)' : 'v8 (B의 것)';
      card(760, 110, 260, 60, { rx: 10, text: v, fs: 16, mono: true, stroke: u > 1.9 ? BAD : INK, color: u > 1.9 ? BAD : INK });
      tx(760, 70, '버킷 안 state', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700 });
      fly(470, 110, 760, 110, seg(u, 1.0, 1.5), 'A PUT', {}); fly(470, 130, 760, 120, seg(u, 1.6, 2.1), 'B PUT', { fill: WARN });
      sub(760, 170, 'A의 변경이 조용히 사라진다', fade(u, 2.1), { fill: BAD, 'font-weight': 700, 'font-size': 15 });
      lockTable(T[0] - 40, T[1], 360, null, { dash: '6 5', op: 0.5, title: '잠금 테이블 없음' }); return; }
    const row0 = ['…/network/…tfstate', 'alice'], rowB = ['…/network/…tfstate', 'bob'];
    if (k === 1) { lockTable(T[0] - 40, T[1], 360, row0, { rowOp: fade(u, 1.3), stroke: ACC });
      dot([[160, 120], [380, 300], [560, 300]], seg(u, 0.2, 1.2), ACC, 7);
      snippet(200, 170, ['PutItem(LockID)', 'if attribute_not_exists'], { fs: 13.5, op: fade(u, 0.3) });
      lock(940 - 40, 300, true, ACC, pop(u, 1.4)); pill(T[0] + 140, T[1] - 30, 'A가 잠금 획득', ACC, pop(u, 1.6), { fs: 14 }); return; }
    if (k === 2) { lockTable(T[0] - 40, T[1], 360, row0, { stroke: ACC });
      dot([[160, 300], [540, 300]], seg(u, 0.1, 0.8), WARN, 7); cross(550, 300, 14, pop(u, 0.8));
      terminal(560, 20, 380, 140, [['Error: Error acquiring the state lock', '#f87171'], ['  ID:   9c2f1f2a-...', null], ['  Path: tf-state-prod-acme/network/...', null], ['  Who:  alice@laptop-01', null]], E(u, 0.9, 2.0) * 4, { fs: 13.5, title: 'B의 터미널' });
      return; }
    if (k === 3) { const del = E(u, 0.3, 1.0);
      lockTable(T[0] - 40, T[1], 360, u < 1.3 ? row0 : rowB, { rowOp: u < 1.3 ? 1 - del : fade(u, 1.4), stroke: GOOD, col: u < 1.3 ? INK : GOOD, rowBg: u < 1.3 ? ACCBG : GOODBG });
      pill(330, 190, 'A: DeleteItem', INK, pop(u, 0.2), { mono: true, fs: 13.5 }); pill(330, 250, 'B: PutItem → 성공', GOOD, pop(u, 1.3), { mono: true, fs: 13.5 });
      dot([[160, 300], [560, 300]], seg(u, 1.0, 1.6), GOOD, 7); sub(T[0] + 140, 390, '한 번에 한 사람씩 쓴다', fade(u, 1.9), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    // k === 4: force-unlock
    cross(A[0], A[1] - 4, 22, pop(u, 0.2)); lockTable(T[0] - 40, T[1], 360, row0, { stroke: WARN, col: WARN, rowBg: WARNBG });
    sub(T[0] + 140, T[1] - 14, '주인 없는 잠금', fade(u, 0.5), { fill: WARN, 'font-weight': 700 });
    terminal(560, 20, 380, 70, [['$ terraform force-unlock 9c2f1f2a-...', null]], E(u, 0.8, 1.5), { fs: 13.5 });
    card(750, 160, 280, 70, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.6) });
    tx(750, 154, '보유자가 정말 죽었을 때만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
    tx(750, 178, '작업 중이면 state가 깨진다', { 'text-anchor': 'middle', 'font-size': 14, fill: INK, opacity: fade(u, 1.8) }); }

  // ---------- 4. 암호화 + 버전 관리 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { zone(60, 40, 420, 250, 'terraform.tfstate', { fill: PANEL, stroke: BAD, color: BAD });
      [['master_password', '"pr0d-S3cret!"'], ['secret', '"wJalrXUtnFEMI/K7..."'], ['private_key', '"-----BEGIN RSA..."'], ['api_token', '"tok_9f2..."']].forEach(([a, b], i) => {
        const y = 100 + i * 46, s = fade(u, 0.3 + i * 0.35); el('rect', { x: 72, y: y - 18, width: 396, height: 28, rx: 5, fill: BADBG, opacity: s });
        mono(84, y, a, { 'font-size': 14, 'font-weight': 700, opacity: s }); mono(260, y, b, { 'font-size': 14, fill: BAD, opacity: s }); });
      sub(270, 312, '값은 예시', 1);
      card(730, 170, 300, 120, { rx: 14, stroke: BAD, sw: 2.5, s: pop(u, 1.8) });
      tx(730, 160, 'state 유출 =', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(730, 190, '자격증명 유출', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { laptop(110, 200, null, {}); fileIc(110, 196, null, { s: 0.7, stroke: BAD });
      bucket(720, 210, 'AES-256', { s: 1.6, stroke: GOOD });
      const p = seg(u, 0.4, 1.6); if (p > 0 && p < 1) fly(110, 196, 720, 210, p, '"pr0d-S3cret!"', { mono: true, fill: BAD });
      if (u > 1.6) { mono(720, 205, '▓▒░▓▒░', { 'text-anchor': 'middle', 'font-size': 15, fill: GOOD, opacity: fade(u, 1.6) }); lock(720, 140, true, GOOD, pop(u, 1.7)); }
      snippet(250, 300, ['encrypt = true', '# kms_key_id = "arn:aws:kms:..."'], { fs: 14 });
      keyIc(880, 120, INFO, pop(u, 2.0)); sub(880, 150, 'KMS는 선택', fade(u, 2.1)); return; }
    if (k === 2) { const vs = ['v1', 'v2', 'v3', 'v4'];
      vs.forEach((v, i) => { const bad = i === 3 && u > 1.0, y = 330 - i * 66, s = pop(u, 0.1 + i * 0.2);
        card(300, y, 240, 52, { rx: 8, stroke: bad ? BAD : i === 2 && u > 1.7 ? GOOD : INK, sw: 2, s, fill: bad ? BADBG : null });
        mono(300, y + 6, v + (bad ? '  손상' : i === 3 ? '  최신' : ''), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: bad ? BAD : INK, opacity: clamp(s) }); });
      pill(560, 132, '잘못된 apply', BAD, pop(u, 0.9), { fs: 14 });
      grow(430, 132, 430, 198, E(u, 1.6, 2.2), GOOD, { sw: 3 }); pill(640, 198, '직전 버전으로 복구', GOOD, pop(u, 2.0), { fs: 15 });
      sub(300, 400, 'aws_s3_bucket_versioning = Enabled', fade(u, 0.5), { class: 'mono' }); return; }
    if (k === 3) { bucket(760, 200, 'tf-state-prod-acme', { s: 1.4, stroke: GOOD });
      el('rect', { x: 600, y: 60, width: 10, height: 290, rx: 4, fill: GOOD, opacity: fade(u, 0.2) }); sub(605, 380, '버킷 정책', fade(u, 0.3), { fill: GOOD, 'font-weight': 700 });
      dot([[120, 140], [600, 140], [690, 190]], seg(u, 0.4, 1.4), GOOD, 7); pill(250, 110, 'HTTPS (TLS)', GOOD, pop(u, 0.4), { fs: 14 });
      dot([[120, 280], [590, 280]], seg(u, 1.0, 1.8), BAD, 7); pill(250, 250, 'HTTP 평문', BAD, pop(u, 1.0), { fs: 14 }); cross(570, 280, 14, pop(u, 1.8));
      snippet(40, 320, ['"aws:SecureTransport": "false"  → Deny'], { fs: 13.5, op: fade(u, 2.0) }); return; }
    // k === 4: 체크리스트
    lbl(480, 46, '운영 체크리스트', 1, { 'font-size': 18 });
    [['encrypt = true', true], ['versioning Enabled', true], ['block_public_access', true], ['SSL-only 버킷 정책', true], ['CloudTrail로 GetObject 추적', true], ['KMS CMK (선택)', false]].forEach(([a, on], i) => {
      const x = i < 3 ? 140 : 520, y = 110 + (i % 3) * 80, s = pop(u, 0.2 + i * 0.3);
      el('rect', { x, y: y - 18, width: 30, height: 30, rx: 6, fill: PANEL, stroke: on ? GOOD : OFF, 'stroke-width': 2.5 });
      if (on) check(x + 15, y - 3, 9, s); mono(x + 44, y + 3, a, { 'font-size': 15, 'font-weight': 700, fill: on ? INK : MUT, opacity: fade(u, 0.2 + i * 0.3) }); }); }

  // ---------- 5. Terraform Cloud ----------
  const PARTS = ['S3 버킷', '잠금', 'IAM', 'KMS', '버전 관리'];
  function s5(t, c) { const { k, u } = c;
    const TC = [680, 180];
    if (k <= 1) {
      if (k === 0) { lbl(180, 36, '직접 만들고 지켜야 할 것', 1, { 'font-size': 15 });
        cloudShape(TC[0], TC[1], 360, 170, { text: 'HCP Terraform', s: pop(u, 1.0) });
        ['Atlas', 'Terraform Cloud', 'HCP Terraform'].forEach((n, i) => { pill(560 + i * 140, 340, n, i === 2 ? INFO : MUT, pop(u, 1.4 + i * 0.3), { fs: 13.5 }); }); }
      else { cloudShape(TC[0], TC[1] + 30, 380, 230, {}); tx(TC[0], TC[1] + 120, '기본 제공', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO });
        tx(180, 380, '직접 운영할 것이 사라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }
      PARTS.forEach((p, i) => { const y = 80 + i * 60, moved = k === 1 ? E(u, 0.3 + i * 0.25, 1.0 + i * 0.25) : 0;
        const x = lerp(180, TC[0] - 64 + (i % 2) * 128, moved), yy = lerp(y, TC[1] - 30 + Math.floor(i / 2) * 44, moved);
        if (k === 1) card(x, yy, 116, 34, { rx: 17, text: p, fs: 13.5, stroke: moved > 0.98 ? GOOD : INK, color: moved > 0.98 ? GOOD : INK, sw: 1.8 });
        else card(x, yy, 150, 44, { rx: 8, text: p, fs: 15, stroke: INK, s: pop(u, 0.2 + i * 0.15) }); });
      return; }
    if (k === 2) { const cut = E(u, 0.2, 1.0);
      snippet(40, 40, ['backend "s3" {', '  bucket         = "tf-state-prod-acme"', '  key            = "network/terraform.tfstate"', '  dynamodb_table = "tf-state-lock"', '}'], { fs: 14, op: 1 - cut * 0.55 });
      [78, 100, 122].forEach((y) => el('line', { x1: 56, y1: y + 18, x2: lerp(56, 440, cut), y2: y + 18, stroke: BAD, 'stroke-width': 2.5 }));
      const sh = E(u, 1.0, 2.0); snippet(500, 40, ['terraform {', '  cloud {', '    organization = "acme"', '    workspaces {', '      name = "prod-network"', '    }', '  }', '}'].slice(0, Math.max(1, Math.ceil(sh * 8))), { fs: 14, w: 330 });
      grow(460, 100, 492, 100, E(u, 0.9, 1.2), ACC, {}); return; }
    if (k === 3) { laptop(110, 230, '개발자 PC', {});
      ['terraform login', 'terraform init', 'terraform apply'].forEach((s, i) => pill(330, 120 + i * 60, s, i === 2 ? ACC : INK, pop(u, 0.2 + i * 0.5), { mono: true, fs: 14 }));
      cloudShape(700, 220, 340, 240, { stroke: INFO });
      server(700, 210, 'Cloud runner', { s: 0.9 * pop(u, 1.4), lamp: GOOD });
      dot([[170, 230], [560, 230], [640, 210]], seg(u, 1.4, 2.2), ACC, 7);
      sub(700, 380, 'plan·apply가 클라우드에서 돈다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k === 4: 단점
    [['vendor lock-in', 'backend를 바꾸려면 이관 비용'], ['사설망 리소스', 'Cloud Agent를 따로 둬야 한다']].forEach(([a, b], i) => { const y = 100 + i * 110, s = pop(u, 0.2 + i * 0.5);
      card(270, y, 420, 86, { rx: 12, stroke: WARN, sw: 2.2, s }); lbl(270, y - 6, a, fade(u, 0.3 + i * 0.5), { fill: WARN }); sub(270, y + 22, b, fade(u, 0.4 + i * 0.5), { 'font-size': 14.5, fill: INK }); });
    lbl(730, 70, '다른 선택지', fade(u, 1.2), {});
    ['GitLab managed state', 'Spacelift · Env0 · Scalr', 'Atlantis (self-hosted)'].forEach((s, i) => pill(730, 120 + i * 54, s, INK, pop(u, 1.4 + i * 0.3), { fs: 14 }));
    sub(480, 380, '자체 운영 S3와 매니지드, 어느 쪽이든 잠금·암호화·버전 관리는 필수', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'backend "s3" 블록을 추가한 뒤 기존 로컬 state를 S3로 옮기는 명령은 무엇인가?',
      o: ['terraform apply -migrate', 'terraform init -migrate-state', 'terraform state push'], a: 1,
      why: 'init이 backend 변경을 감지하고 기존 state를 새 backend로 복사할지 yes/no로 묻는다.' },
    { q: 'key를 prod/network, prod/compute, prod/data처럼 잘게 나누는 가장 큰 이유는 무엇인가?',
      o: ['S3 요금이 줄어든다', 'apply 속도가 빨라진다', '한 state가 깨져도 나머지는 영향을 받지 않는다'], a: 2,
      why: 'network state가 망가져도 compute와 data state는 무사하다. 사고 범위가 key 단위로 갇힌다.' },
    { q: 'A가 잠금을 잡은 동안 B가 apply하면 기본 동작은 무엇인가?',
      o: ['A가 끝날 때까지 자동으로 줄을 서서 기다린다', 'Error acquiring the state lock을 내고 바로 멈춘다', 'B의 변경이 A의 변경 위에 덮어써진다'], a: 1,
      why: '조건부 쓰기가 실패하면 terraform은 즉시 에러를 내고 ID, Who, Created를 보여 준다. 조용한 덮어쓰기가 드러나는 에러로 바뀐다.' },
    { q: 'backend 블록의 encrypt = true가 해 주는 일은 무엇인가?',
      o: ['state 파일을 S3에 저장할 때 서버 측 암호화를 건다', 'HTTP 전송을 막는다', '이전 state 버전을 보관한다'], a: 0,
      why: 'encrypt는 저장 시 암호화(SSE)다. 전송 암호화는 SSL-only 버킷 정책, 롤백은 versioning이 따로 맡는다.' },
    { q: 'S3 backend 대신 cloud 블록으로 HCP Terraform을 쓰면 가장 크게 달라지는 것은 무엇인가?',
      o: ['state 파일 형식이 바뀐다', 'plan과 apply가 로컬이 아니라 클라우드 runner에서 실행된다', 'provider를 쓰지 않게 된다'], a: 1,
      why: 'login과 init으로 워크스페이스에 붙으면 실행 위치가 클라우드로 옮겨 간다. 잠금, 암호화, 버전 관리도 기본으로 따라온다.' },
  ];

  const summary = [
    '로컬 state는 팀원과 나눌 수 없어서 backend "s3"로 버킷의 key 경로에 둔다.',
    '공유 state는 동시에 쓰면 나중 쓰기가 앞을 덮으므로 apply마다 잠금을 잡는다.',
    '잠금은 DynamoDB 조건부 쓰기였고, 최신 Terraform은 use_lockfile로 S3에 잠금 파일을 둔다.',
    'state에는 비밀이 들어 있으니 encrypt, versioning, SSL-only 정책을 함께 켠다.',
  ];
  const review = [
    { q: '두 사람이 같은 S3 state로 거의 동시에 apply했는데 에러 없이 끝났고, 나중에 한쪽 리소스가 state에서 빠져 있었다. 먼저 확인할 것은?',
      o: ['backend에 잠금 설정이 있는지', 'S3 버킷의 리전이 맞는지', 'provider 버전이 같은지'], a: 0,
      why: '잠금이 없으면 lost update가 에러 없이 일어난다. dynamodb_table이나 use_lockfile이 빠졌는지부터 본다.' },
    { q: '잘못된 apply로 S3의 state가 깨졌다. 바로 되돌릴 수 있게 미리 켜 뒀어야 하는 것은?',
      o: ['encrypt = true', '버킷 versioning', 'SSL-only 버킷 정책'], a: 1,
      why: 'versioning이 켜져 있으면 직전 버전 객체로 복구할 수 있다. 암호화와 SSL 정책은 유출을 막을 뿐 롤백은 못 한다.' },
    { q: '새 프로젝트에서 S3 backend를 만든다. 잠금은 어떻게 거는 것이 최신 문서에 맞나?',
      o: ['잠금 없이 쓰고 사람끼리 순서를 정한다', 'DynamoDB 테이블을 새로 만들어 dynamodb_table에 적는다', 'use_lockfile = true로 S3 잠금 파일을 쓴다'], a: 2,
      why: '최신 문서는 DynamoDB 잠금을 deprecated로 표시한다. use_lockfile은 state 옆에 .tflock 파일을 만들어 같은 역할을 한다.' },
  ];

  R.page({ title: 'remote state 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
