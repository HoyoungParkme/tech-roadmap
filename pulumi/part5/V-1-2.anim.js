/* V-1-2 secret — config 암호화 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, browser, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function cmd(x, y, w, s, u, o) { o = o || {}; const n = Math.round(s.length * clamp((u - (o.t0 ?? 0.1)) / (o.d || 0.9)));
    el('rect', { x, y, width: w, height: 40, rx: 8, fill: INK });
    mono(x + 16, y + 26, '$ ' + s.slice(0, n), { 'font-size': o.fs || 15, fill: PANEL }); }
  // 파일 판: rows = [[글, 색, 굵게]] , o.show(i) = 투명도
  function file(x, y, w, title, rows, o) { o = o || {}; const lh = 28, h = o.h || rows.length * lh + 46;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: o.op ?? 1 });
    mono(x + 14, y + 24, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    rows.forEach(([s, col, b], i) => mono(x + 14, y + 54 + i * lh, s, { 'font-size': 14.5, fill: col || INK, 'font-weight': b ? 800 : 500, opacity: (o.show ? o.show(i) : 1) * (o.op ?? 1) })); }
  // 글자가 왼쪽부터 다른 글로 바뀐다 (가운데는 뒤섞인 글자)
  function morph(a, b, f, seed) { const n = Math.max(a.length, b.length), k = Math.floor(f * n);
    return [...Array(n)].map((_, i) => (i < k ? b[i] || '' : i < k + 3 ? 'x#%&@*'[(i + seed) % 6] : a[i] || '')).join('').trimEnd(); }
  const keyIcon = (x, y, col, s) => { if (s <= 0) return; const g = R.G(x, y, s); el('circle', { cx: -14, cy: 0, r: 11, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
    el('path', { d: 'M-3,0 H26 M18,0 V9 M10,0 V7', stroke: col, 'stroke-width': 3, fill: 'none' }, g); };
  // 암호화 상자: 들어간 글이 암호문이 되어 나온다
  function cryptoBox(cx, cy, label, col, s) { card(cx, cy, 120, 64, { rx: 10, fill: PANEL, stroke: col, sw: 2.5, s }); lock(cx, cy - 6, true, col, 0.9 * s); sub(cx, cy + 22, label, s, { fill: col, 'font-weight': 700 }); }
  const note = (s, a, u, col, y) => tx(480, y || 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, a) });
  const CIPH = 'v1:8fK2nQ9r:d4Xx7c2mZp...9aBc==';

  // =========================================================
  // 1. 평문 config — yaml 에 그대로, git 으로 퍼진다
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    cmd(20, 14, 520, k >= 2 ? 'git add Pulumi.dev.yaml && git commit' : 'pulumi config set dbPassword hunter2', k === 0 || k === 2 ? u : 3, { fs: 14.5 });
    const rows = [['config:'], ['  myapp:dbHost: db.internal.example.com'], ['  myapp:dbPassword: hunter2', BAD, true]];
    const FX = 560, FY = 70, FW = 380;
    if (k === 0) { file(FX, FY, FW, 'Pulumi.dev.yaml', rows, { show: (i) => (i < 2 ? 1 : fade(u, 1.7)) });
      fly(420, FY + 105, FX + 250, FY + 105, seg(u, 1.0, 1.7), 'hunter2', { mono: true, fill: BAD });
      tx(FX + FW / 2, FY + 190, '암호화 없이 그대로 저장', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { file(FX - 300, FY + 20, 560, 'cat Pulumi.dev.yaml', rows.slice(0, 2), { h: 150 });
      el('rect', { x: FX - 294, y: FY + 116, width: 548, height: 30, rx: 6, fill: BADBG, opacity: fade(u, 0.4) });
      mono(FX - 286, FY + 136, '  myapp:dbPassword: hunter2', { 'font-size': 14.5, fill: BAD, 'font-weight': 800 });
      [[170, '리뷰어'], [480, '동료'], [790, '누구든']].forEach(([x, n], i) => { person(x, 330, n, { s: pop(u, 1.0 + i * 0.3) });
        grow(x, 300, lerp(x, 520, 0.3), FY + 172, E(u, 1.3 + i * 0.3, 1.8 + i * 0.3), MUT, { dash: '4 4', plain: true }); });
      return; }
    // git 그래프: 커밋 점이 줄지어 생긴다
    const GY = 150, xs = [140, 300, 460, 620, 780], bad = 1;
    const n = k === 2 ? Math.min(2, 1 + Math.floor(E(u, 0.8, 1.2) * 1.99)) : 5;
    grow(xs[0], GY, xs[n - 1], GY, k === 2 ? E(u, 0.8, 1.2) : 1, GRID, { plain: true, sw: 4 });
    xs.slice(0, n).forEach((x, i) => { el('circle', { cx: x, cy: GY, r: 16, fill: i === bad ? BAD : PANEL, stroke: i === bad ? BAD : INK, 'stroke-width': 2.5 });
      mono(x, GY - 28, i === bad ? 'add config' : 'commit ' + (i + 1), { 'text-anchor': 'middle', 'font-size': 13.5, fill: i === bad ? BAD : MUT, 'font-weight': i === bad ? 700 : 500 }); });
    if (k === 2) { mono(xs[1], GY + 40, 'hunter2', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      [['PR 리뷰', 170], ['CI 로그', 400], ['git clone', 630], ['fork', 860]].forEach(([s, x], i) => {
        dot([[xs[1], GY + 20], [x, 290]], seg(u, 1.4 + i * 0.2, 2.2 + i * 0.2), BAD, 6);
        card(x, 310, 150, 44, { rx: 8, text: s, fs: 15, stroke: BAD, color: INK, s: pop(u, 2.0 + i * 0.15) }); });
      return; }
    // 3: 지우려면 history rewrite
    mono(xs[1], GY + 40, 'hunter2', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: BAD });
    el('path', { d: `M${xs[1] - 22},${GY - 22} L${xs[1] + 22},${GY + 22}`, stroke: WARN, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: fade(u, 0.4), 'stroke-dasharray': '1 0' });
    pill(xs[1], GY + 92, '지우려면 history rewrite', WARN, pop(u, 0.6), { fs: 14 });
    tx(600, 260, '이미 받아 간 사본은 지울 수 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    ['비밀번호', 'API 키', '토큰'].forEach((s, i) => { pill(330 + i * 150, 330, s, INK, pop(u, 1.6 + i * 0.2), { fs: 14.5 }); cross(330 + i * 150 + 56, 316, 7, pop(u, 1.9 + i * 0.2)); });
    note('민감 값은 평문 config에 두지 않는다', 2.2, u, INK, 396); }

  // =========================================================
  // 2. --secret — 넣는 즉시 암호화, yaml 엔 secure: 만
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    cmd(20, 14, 620, k === 2 ? 'pulumi config get dbPassword' : 'pulumi config set --secret dbPassword hunter2', k === 0 || k === 2 ? u : 3, { fs: 14.5 });
    const FX = 300, FY = 160, FW = 640;
    const cip = k === 0 ? morph('hunter2', CIPH, E(u, 1.6, 2.6), Math.floor(u * 9)) : CIPH;
    const rows = [['config:'], ['  myapp:dbHost: db.internal.example.com'], ['  myapp:dbPassword:'], ['    secure: ' + cip, ACC, true]];
    if (k === 0) { cryptoBox(150, 250, '암호화', ACC, pop(u, 0.3));
      fly(330, 40, 150, 250, seg(u, 0.6, 1.3), 'hunter2', { mono: true, fill: BAD });
      file(FX, FY, FW, 'Pulumi.dev.yaml', rows, { show: (i) => (i < 3 ? 0.35 : fade(u, 1.5)) });
      grow(212, 250, FX + 14, FY + 132, E(u, 1.3, 1.7), ACC, {}); note('저장되기 전에 암호화된다', 2.2, u, ACC, 370); return; }
    file(FX - 280, FY - 40, FW + 280, 'Pulumi.dev.yaml', rows, { h: 150 });
    if (k === 1) { pill(820, FY + 33, '평문 그대로', INK, pop(u, 0.4), { fs: 13.5 }); pill(820, FY + 93, '이 값만 암호문', ACC, pop(u, 0.9), { fs: 13.5 });
      mono(480, 330, 'hunter2', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.4) });
      tx(480, 362, '원본 값은 파일 어디에도 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); }
    if (k === 2) { cryptoBox(780, 330, '복호화', WARN, pop(u, 0.4));
      dot([[400, FY + 110], [720, 330]], seg(u, 0.6, 1.3), ACC, 7);
      fly(840, 330, 880, 40, seg(u, 1.4, 2.1), 'hunter2', { mono: true, fill: WARN, stay: true });
      tx(300, 340, '파일은 계속 암호문', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      sub(300, 366, '읽을 때만 잠깐 풀어 보여 준다', fade(u, 2.0)); }
    if (k === 3) { [[170, '리뷰어'], [480, '동료'], [790, '누구든']].forEach(([x, n], i) => { person(x, 340, n, { s: pop(u, 0.3 + i * 0.25) });
        mono(x, 412, 'v1:8fK2…==', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8 + i * 0.25) }); });
      pill(300, 296, 'git commit 해도 된다', GOOD, pop(u, 1.4), { fs: 15 });
      tx(680, 300, '키 없으면 의미 없는 글자', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); } }

  // =========================================================
  // 3. secret provider — 열쇠를 누가 쥐나
  // =========================================================
  function s3(t, c) { const { k, u } = c;
    // 왼쪽 반: passphrase
    zone(16, 16, 430, 388, 'passphrase (DIY backend 기본)', { fill: k === 0 ? WARNBG : SOFT, color: k === 0 ? WARN : MUT });
    zone(470, 16, 474, 388, '클라우드 KMS', { fill: k >= 1 ? INFOBG : SOFT, color: k >= 1 ? INFO : MUT, op: k === 0 ? 0.5 : 1 });
    keyIcon(220, 110, WARN, k === 0 ? pop(u, 0.3) : 1);
    mono(231, 150, 'PULUMI_CONFIG_PASSPHRASE', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: k === 0 ? fade(u, 0.5) : 1 });
    [0, 1, 2].forEach((i) => { const x = 100 + i * 120; person(x, 250, null, { s: k === 0 ? pop(u, 0.9 + i * 0.2) : 1, stroke: k === 0 ? INK : MUT });
      grow(220, 166, x, 214, k === 0 ? E(u, 1.0 + i * 0.2, 1.5 + i * 0.2) : 1, WARN, { dash: '4 4', plain: true }); });
    sub(220, 310, '같은 암호를 사람끼리 나눈다', k === 0 ? fade(u, 1.6) : 1, { 'font-size': 14 });
    if (k === 0) { cross(340, 250, 10, pop(u, 2.1)); tx(220, 350, '잃으면 아무도 못 푼다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) });
      sub(220, 378, 'Pulumi Cloud backend면 Cloud가 키를 관리', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    // 오른쪽 반: KMS
    const KX = 707, KY = 120;
    card(KX, KY, 170, 70, { rx: 12, fill: INFO, stroke: 'none', s: k === 1 ? pop(u, 0.3) : 1 }); keyIcon(KX - 40, KY, PANEL, k === 1 ? pop(u, 0.5) * 0.8 : 0.8);
    tx(KX + 24, KY + 6, 'KMS 키', { 'font-size': 16, 'font-weight': 800, fill: PANEL, opacity: k === 1 ? fade(u, 0.5) : 1 });
    if (k === 1) { mono(KX, 210, 'pulumi stack init prod \\', { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.8) });
      mono(KX, 234, '--secrets-provider="awskms://alias/', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(KX, 256, 'pulumi-prod?region=ap-northeast-2"', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.1) });
      fly(220, 110, KX, KY, seg(u, 1.4, 2.2), '열쇠 보관', { fill: INFO });
      tx(KX, 320, '열쇠를 클라우드가 보관한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.2) });
      sub(KX, 346, '사람끼리 암호를 나눌 일이 없다', fade(u, 2.4)); }
    if (k === 2) { [['awskms://alias/pulumi-prod?region=…', 'AWS'], ['gcpkms://projects/p/locations/global/…', 'GCP'], ['azurekeyvault://myvault.vault.azure.net/…', 'Azure']].forEach(([s, n], i) => {
        const y = 200 + i * 56; fly(KX, KY + 30, KX + 20, y, seg(u, 0.3 + i * 0.35, 0.9 + i * 0.35), s, { mono: true, stay: true, fill: i === 0 ? INFO : INK });
        tx(492, y + 5, n, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9 + i * 0.35) }); });
      tx(KX, 380, 'URL 형식만 다르고 방식은 같다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 3) { const ppl = [[560, 300, true, '배포 역할'], [707, 300, true, 'SRE'], [854, 300, false, '권한 없음']];
      ppl.forEach(([x, y, ok, n], i) => { person(x, y, n, { s: pop(u, 0.2 + i * 0.2), stroke: ok ? INFO : MUT });
        grow(x, y - 40, ok ? KX : x - 30, ok ? KY + 40 : y - 110, E(u, 0.8 + i * 0.3, 1.3 + i * 0.3), ok ? INFO : BAD, { plain: !ok });
        if (!ok) cross(x - 30, y - 118, 9, pop(u, 1.8)); });
      pill(KX, 200, 'IAM으로 복호화 권한을 나눈다', INFO, pop(u, 1.8), { fs: 14 });
      tx(231, 380, '혼자 실습은 passphrase로 충분', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); } }

  // =========================================================
  // 4. 코드에서 읽기 — secret 표시가 Output 을 따라 번진다
  // =========================================================
  const N4 = { cfg: [100, 200], pw: [330, 110], host: [330, 300], db: [610, 70], conn: [610, 210], env: [330, 385], key: [610, 350], o1: [860, 210], o2: [860, 350] };
  function node(id, title, typ, sec, s, o) { o = o || {}; const [x, y] = N4[id], w = o.w || 190, h = 56; if (s <= 0) return;
    const g = R.G(x, y, s); el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: sec ? ACCBG : PANEL, stroke: sec ? ACC : INK, 'stroke-width': sec ? 2.6 : 2 }, g);
    mono(0, -5, title, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: sec ? ACC : INK }, g);
    mono(0, 16, typ, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    if (sec) lock(w / 2 - 6, -h / 2 + 2, true, ACC, 0.7 * (o.ls ?? 1)); }
  function edge(a, b, f, col, o) { const [x1, y1] = N4[a], [x2, y2] = N4[b], dx = Math.sign(x2 - x1); grow(x1 + dx * 95, y1, x2 - dx * 98, y2, f, col, o); }
  function s4(t, c) { const { k, u } = c;
    // 0: Config 객체 + 아직 암호문인 yaml
    node('cfg', 'new Config()', 'cfg', false, k === 0 ? pop(u, 0.3) : 1, { w: 160 });
    if (k === 0) { R.card(100, 330, 180, 64, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 0.8) });
      mono(30, 324, 'secure: v1:8fK2…', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.0) }); mono(30, 346, 'dbHost: db.internal…', { 'font-size': 13.5, opacity: fade(u, 1.1) });
      grow(100, 296, 100, 232, E(u, 1.3, 1.8), MUT, {});
      tx(520, 200, '읽기 전까지 값은 암호문으로만 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // 1: requireSecret / require
    edge('cfg', 'pw', k === 1 ? E(u, 0.3, 0.9) : 1, ACC, {}); node('pw', 'dbPassword', 'Output<string>', true, k === 1 ? pop(u, 0.9) : 1);
    edge('cfg', 'host', k === 1 ? E(u, 1.2, 1.8) : 1, MUT, {}); node('host', 'dbHost', 'string', false, k === 1 ? pop(u, 1.8) : 1);
    if (k === 1) { mono(18, 150, 'requireSecret', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(18, 262, 'require', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); }
    // 2: RDS password
    if (k >= 2) { edge('pw', 'db', k === 2 ? E(u, 0.3, 0.9) : 1, ACC, {}); node('db', 'app-db', 'password: [secret]', k > 2 || u > 1.2, k === 2 ? pop(u, 0.9) : 1, { w: 200, ls: k === 2 ? pop(u, 1.2) : 1 });
      if (k === 2) dot([N4.pw, N4.db], seg(u, 0.3, 1.1), ACC, 7); }
    // 3: apply → connString 도 secret
    if (k >= 3) { edge('pw', 'conn', k === 3 ? E(u, 0.3, 0.9) : 1, ACC, {}); edge('host', 'conn', k === 3 ? E(u, 0.3, 0.9) : 1, MUT, {});
      const lit = k > 3 || u > 1.6; node('conn', 'connString', '.apply(pw => …)', lit, k === 3 ? pop(u, 0.9) : 1, { w: 200, ls: k === 3 ? pop(u, 1.6) : 1 });
      if (k === 3) { dot([N4.pw, N4.conn], seg(u, 0.9, 1.6), ACC, 7); tx(610, 290, '계산을 거쳐도 표시가 따라간다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) }); } }
    // 4: pulumi.secret 으로 감싸기
    if (k >= 4) { node('env', 'process.env.API_KEY', '그냥 string', false, k === 4 ? pop(u, 0.3) : 1, { w: 210 });
      edge('env', 'key', k === 4 ? E(u, 0.8, 1.4) : 1, ACC, {}); node('key', 'apiKey', 'pulumi.secret(…)', k > 4 || u > 1.6, k === 4 ? pop(u, 1.4) : 1, { w: 200 }); }
    // 5: export — 출력에서 가려진다
    if (k === 5) { edge('conn', 'o1', E(u, 0.3, 0.9), ACC, {}); edge('key', 'o2', E(u, 0.6, 1.2), ACC, {});
      node('o1', 'dbConnection', '[secret]', true, pop(u, 0.9), { w: 170 }); node('o2', 'serviceApiKey', '[secret]', true, pop(u, 1.2), { w: 170 });
      tx(860, 290, 'export', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) }); } }

  // =========================================================
  // 5. 출력 · 로그 · state — 어디서나 가려진다
  // =========================================================
  const UP = [['$ pulumi up'], ['Updating (prod):'], [' +  pulumi:pulumi:Stack   myapp-prod  created'], [' +  aws:rds:Instance      app-db      created (94s)'],
    ['Outputs:'], ['    dbConnection : [secret]', 'var(--term)'], ['    serviceApiKey: [secret]', 'var(--term)'], ['Resources:'], ['    + 2 created']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const shown = k === 0 ? lerp(1, 4, E(u, 0.2, 1.4)) : lerp(4, 9, E(u, 0.2, 1.6));
      terminal(20, 20, 560, 270, UP, shown, { title: 'pulumi up (출력은 예시)' });
      // 메모리: 복호화된 값은 여기서만 쓰인다
      card(780, 110, 260, 110, { rx: 12, fill: SOFT, stroke: GRID, sw: 1.5, dash: '6 5' }); tx(670, 72, 'CLI 메모리', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      if (k === 0) { mono(780, 116, 'hunter2', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.4) * (1 - fade(u, 2.2)) });
        dot([[780, 140], [600, 250]], seg(u, 0.8, 1.6), WARN, 7); tx(780, 260, '배포에 쓰이고 화면엔 안 남는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
      // 1: 출력 값이 가림막을 지나 [secret] 이 된다
      card(780, 110, 200, 50, { rx: 25, fill: INK, stroke: 'none', text: '[secret]', color: PANEL, mono: true, s: pop(u, 0.4) });
      [0, 1].forEach((i) => dot([[780, 140], [470, 172 + i * 22]], seg(u, 0.6 + i * 0.4, 1.4 + i * 0.4), ACC, 6));
      tx(780, 260, '별도 설정 없이 기본이 가림', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      return; }
    if (k === 2) { terminal(20, 40, 920, 120, [['$ pulumi stack output dbConnection --show-secrets'], ['postgres://appuser:hunter2@db.internal.example.com:5432/app', 'var(--term)']], lerp(0.2, 2, E(u, 0.2, 1.6)), { title: '플래그를 직접 붙였을 때만' });
      pill(480, 230, '--show-secrets', WARN, pop(u, 1.4), { mono: true, fs: 16 });
      tx(480, 290, '가림 해제는 일부러 하는 행동이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) });
      sub(480, 318, '플래그가 없으면 계속 [secret]', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 3) { file(20, 30, 920, 'pulumi stack export (app-db의 password 부분)', [['"password": {'], ['    "4dabf18193072939515e22adb298388d": "1b47061264138c4ac30d75fd1eb44270",', INFO], ['    "ciphertext": "v1:8fK2..."', ACC, true], ['}']], { show: (i) => fade(u, 0.3 + i * 0.3) });
      pill(300, 250, 'secret 표식', INFO, pop(u, 1.3), { fs: 14 }); pill(560, 250, '암호문만', ACC, pop(u, 1.6), { fs: 14 });
      tx(480, 320, 'state 백업이 새어도 값은 지켜진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); return; }
    // 4: 세 지점 한 세트
    const P5 = [['입력', 'config set --secret', 'secure: v1:…'], ['코드', 'requireSecret · pulumi.secret', 'Output (secret)'], ['출력', 'up · stack output', '[secret]']];
    P5.forEach(([a, b, d], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.4);
      card(x, 190, 260, 130, { rx: 12, fill: ACCBG, stroke: ACC, sw: 2.2, s });
      tx(x, 150, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.4) });
      mono(x, 190, b, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 0.5 + i * 0.4) });
      mono(x, 226, d, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6 + i * 0.4) });
      if (i < 2) grow(x + 132, 190, x + 176, 190, E(u, 0.7 + i * 0.4, 1.0 + i * 0.4), ACC, {}); });
    note('한 곳이라도 빠지면 그 지점에서 평문이 샌다', 1.9, u, INK, 330); }

  const quiz = [
    { q: 'pulumi config set dbPassword hunter2를 --secret 없이 실행하면 Pulumi.dev.yaml에는 무엇이 남는가?',
      o: ['secure: v1:… 암호문', 'myapp:dbPassword: hunter2 평문', '값 없이 키 이름만'], a: 1,
      why: '--secret이 없으면 값을 그대로 저장한다. 이 파일을 커밋하면 비밀번호가 저장소를 보는 모두에게 퍼진다.' },
    { q: '--secret으로 넣은 값을 pulumi config get으로 읽으면 파일에 저장된 형태는 어떻게 되는가?',
      o: ['계속 secure: 암호문이다', '읽은 순간 평문으로 바뀐다', '파일에서 지워진다'], a: 0,
      why: 'config get은 읽을 때만 풀어 보여 준다. 저장된 값은 처음부터 끝까지 암호문이라 yaml을 커밋해도 된다.' },
    { q: '팀이 함께 쓰는 운영 스택에서 KMS를 secret provider로 고르는 가장 큰 이유는 무엇인가?',
      o: ['암호화 속도가 passphrase보다 빨라서', 'yaml 파일 크기가 작아져서', '키를 클라우드가 보관하고 IAM으로 복호화 권한을 나눌 수 있어서'], a: 2,
      why: 'passphrase는 암호 하나를 사람끼리 나눠야 한다. KMS는 열쇠를 클라우드가 쥐고 IAM 권한이 있는 사람만 풀게 한다.' },
    { q: 'requireSecret으로 읽은 dbPassword를 apply로 이어 만든 connString은 어떻게 취급되는가?',
      o: ['평범한 문자열이 된다', '자동으로 secret 표시가 붙은 Output이 된다', 'export 할 수 없게 된다'], a: 1,
      why: 'secret에서 파생된 값에는 secret 표시가 자동으로 따라간다. 그래서 connString을 export 해도 출력에서 가려진다.' },
    { q: 'secret로 표시된 stack output의 실제 값을 보려면 무엇을 해야 하는가?',
      o: ['pulumi stack output에 --show-secrets를 붙인다', 'pulumi up을 다시 실행한다', 'state 파일을 열어 본다'], a: 0,
      why: '출력은 기본이 [secret]이다. state 파일에도 ciphertext만 있으니, 값을 보려면 --show-secrets를 직접 붙여야 한다.' },
  ];

  const summary = [
    '--secret 없이 넣은 config는 Pulumi.<stack>.yaml에 평문으로 남아 git으로 퍼진다.',
    '--secret을 붙이면 값마다 암호화되어 yaml에는 secure: 암호문만 남는다.',
    'DIY backend의 기본 열쇠는 passphrase이고, 팀 운영에서는 KMS로 IAM 통제를 건다.',
    'requireSecret으로 읽은 값과 그 파생값은 출력과 state 어디서나 [secret]으로 가려진다.',
  ];
  const review = [
    { q: '동료가 PULUMI_CONFIG_PASSPHRASE를 슬랙에 올렸다. 스택은 passphrase provider를 쓴다. 가장 먼저 할 일은?',
      o: ['yaml의 secure: 값들을 평문으로 바꾼다', '새 열쇠로 다시 암호화하고 비밀번호도 바꾼다', 'yaml 파일만 git에서 지운다'], a: 1,
      why: '암호가 새면 yaml과 state의 암호문을 누구나 풀 수 있다. 열쇠를 바꾸고 이미 노출된 비밀번호 자체도 바꿔야 한다.' },
    { q: 'CI 로그에 connString 값이 평문으로 찍혔다. 코드에서 먼저 의심할 곳은?',
      o: ['config.require로 읽어 secret 표시 없이 쓴 부분', 'pulumi.secret으로 감싼 apiKey', 'yaml의 secure: 줄'], a: 0,
      why: 'require로 읽은 값은 평범한 문자열이라 표시가 붙지 않는다. requireSecret으로 읽어야 파생값까지 secret으로 가려진다.' },
    { q: 'pulumi stack export 결과를 외부 백업에 올려도 되는지 묻는다. 시크릿 값은 어떤 모습인가?',
      o: ['평문 그대로라 올리면 안 된다', '[secret]이라는 글자만 남는다', 'secret 표식과 ciphertext로만 들어 있다'], a: 2,
      why: 'state 안에서도 시크릿은 암호문으로만 저장된다. 다만 열쇠가 함께 새지 않도록 provider 쪽 관리는 따로 지켜야 한다.' },
  ];

  R.page({ title: '시크릿이 지나가는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
