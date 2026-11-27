/* V-1-1 state backend 비교 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 공통 부품 ----------
  // 한 줄 터미널: s 를 u0 부터 타이핑한다
  function cmd(x, y, w, s, t0, u, o) { o = o || {}; const n = Math.round(s.length * clamp((u - t0) / (o.d || 0.9)));
    el('rect', { x, y, width: w, height: 40, rx: 8, fill: INK });
    mono(x + 16, y + 26, '$ ' + s.slice(0, n), { 'font-size': o.fs || 15, fill: PANEL }); }
  // 구름 (Pulumi Cloud)
  function cloud(cx, cy, w, h, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op), W = w / 2, H = h / 2;
    el('path', { d: `M${-W + 0.3 * h},${H} H${W - 0.3 * h} A${0.3 * h},${0.3 * h} 0 0 0 ${W - 0.22 * h},${H - 0.58 * h} A${0.36 * h},${0.36 * h} 0 0 0 ${W * 0.3},${-H + 0.08 * h} A${0.42 * h},${0.42 * h} 0 0 0 ${-W * 0.35},${-H + 0.2 * h} A${0.32 * h},${0.32 * h} 0 0 0 ${-W + 0.12 * h},${H - 0.5 * h} A${0.27 * h},${0.27 * h} 0 0 0 ${-W + 0.3 * h},${H} Z`,
      fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2.5, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round' }, g);
    if (o.text) tx(0, o.ty ?? 14, o.text, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: o.color || INK, class: o.mono ? 'mono' : null }, g); }
  // 버킷 (오브젝트 스토리지)
  function bucket(cx, cy, w, h, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op), W = w / 2, H = h / 2, c = o.stroke || INK;
    el('path', { d: `M${-W},${-H} L${-W * 0.82},${H} Q0,${H + 12} ${W * 0.82},${H} L${W},${-H}`, fill: o.fill || PANEL, stroke: c, 'stroke-width': o.sw || 2.5, 'stroke-dasharray': o.dash }, g);
    el('ellipse', { cx: 0, cy: -H, rx: W, ry: 10, fill: o.fill || PANEL, stroke: c, 'stroke-width': o.sw || 2.5, 'stroke-dasharray': o.dash }, g);
    if (o.text) tx(0, o.ty ?? 10, o.text, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: o.color || c, class: o.mono ? 'mono' : null }, g); }
  // 노트북
  function laptop(cx, cy, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op), c = o.stroke || INK;
    el('rect', { x: -70, y: -50, width: 140, height: 88, rx: 7, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    el('path', { d: 'M-90,44 H90 L80,56 H-80 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash }, g);
    if (o.text) mono(0, -2, o.text, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: o.color || c }, g); }
  // state 파일 (접힌 귀퉁이 + 줄)
  function stateDoc(cx, cy, s, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s, o.op), w = o.w || 64, h = o.h || 78, c = o.stroke || ACC;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || ACCBG, stroke: c, 'stroke-width': 2.2 }, g);
    [0, 1, 2].forEach((i) => el('line', { x1: -w / 2 + 10, y1: -h / 2 + 24 + i * 14, x2: w / 2 - 12 - (i === 2 ? 12 : 0), y2: -h / 2 + 24 + i * 14, stroke: c, 'stroke-width': 2, opacity: 0.6 }, g));
    if (o.text) tx(0, h / 2 + 20, o.text, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: c }, g); }
  const note = (s, a, u, col, y) => tx(480, y || 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, a) });

  // =========================================================
  // 1. backend 는 URL 하나로 정한다 — state 파일이 갈 곳 세 군데
  // =========================================================
  const D1 = { cloud: [170, 255], bucket: [480, 255], laptop: [790, 255] };
  function s1(t, c) { const { k, u } = c;
    const cmds = ['pulumi login <URL>', 'pulumi login', 'pulumi login s3://team-pulumi-state', 'pulumi login file://~', 'pulumi whoami --verbose', 'pulumi login <URL>'];
    cmd(190, 14, 580, cmds[k], 0.1, k === 5 ? 3 : u);
    stateDoc(480, 118, k === 0 ? pop(u, 0.9) : 1, { w: 50, h: 58 });
    mono(526, 112, 'state', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 1.1) : 1 });
    mono(526, 130, '(체크포인트)', { 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 1.2) : 1 });
    const on = { cloud: k >= 1, bucket: k >= 2, laptop: k >= 3 }, pick = k === 1 ? 'cloud' : k === 2 ? 'bucket' : k === 3 ? 'laptop' : k === 4 ? 'bucket' : null;
    // 길: state → 세 곳 (점선이 자란다)
    Object.entries(D1).forEach(([key, [x, y]], i) => grow(480, 150, x, y - 70, k === 0 ? E(u, 1.3 + i * 0.25, 2.0 + i * 0.25) : 1, pick === key ? ACC : GRID, { dash: '5 5', plain: true, sw: pick === key ? 2.6 : 2 }));
    const hot = (key) => (pick === key ? ACC : on[key] ? INK : OFF), fillOf = (key) => (pick === key ? ACCBG : PANEL);
    cloud(D1.cloud[0], D1.cloud[1], 210, 108, { stroke: hot('cloud'), fill: fillOf('cloud'), dash: on.cloud ? null : '6 5', text: on.cloud ? 'Pulumi Cloud' : '?', color: hot('cloud'), s: k === 1 ? 1 + R.bump(u, 0.9) : 1 });
    bucket(D1.bucket[0], D1.bucket[1], 150, 96, { stroke: hot('bucket'), fill: fillOf('bucket'), dash: on.bucket ? null : '6 5', text: on.bucket ? '버킷' : '?', color: hot('bucket'), s: k === 2 ? 1 + R.bump(u, 0.9) : 1 });
    laptop(D1.laptop[0], D1.laptop[1], { stroke: hot('laptop'), fill: fillOf('laptop'), dash: on.laptop ? null : '6 5', text: on.laptop ? '~/.pulumi' : '?', color: hot('laptop'), s: k === 3 ? 1 + R.bump(u, 0.9) : 1 });
    // 이름표
    const tag = (key, a, b, show) => { const [x, y] = D1[key]; lbl(x, y + 82, a, show, { fill: hot(key) }); sub(x, y + 102, b, show); };
    if (on.cloud) tag('cloud', '관리형 (기본값)', '잠금 · 이력 · RBAC 기본', k === 1 ? fade(u, 1.3) : 1);
    if (on.bucket) tag('bucket', 'DIY 오브젝트 스토리지', '우리 클라우드 계정 안', k === 2 ? fade(u, 1.6) : 1);
    if (on.laptop) tag('laptop', '로컬 파일', '내 PC 안에서만', k === 3 ? fade(u, 1.3) : 1);
    if (k >= 1 && k <= 3) fly(480, 118, D1[pick][0], D1[pick][1] - 6, seg(u, 0.9, 1.7), 'state', { mono: true });
    if (k === 2) ['s3://', 'gs://', 'azblob://'].forEach((p, i) => pill(400 + i * 80, 178, p, ACC, pop(u, 1.0 + i * 0.3), { mono: true, fs: 13.5 }));
    if (k === 3) { [[905, 190], [905, 300]].forEach(([x, y], i) => { person(x, y, null, { s: pop(u, 1.4 + i * 0.2), stroke: MUT });
        grow(x - 30, y, 880, 255, E(u, 1.8, 2.3), BAD, { dash: '4 4', plain: true }); });
      cross(872, 255, 9, pop(u, 2.3)); sub(905, 360, '팀원은 닿지 못한다', fade(u, 2.3), { fill: BAD, 'font-weight': 700 }); }
    if (k === 4) { el('rect', { x: 610, y: 66, width: 330, height: 66, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.9) });
      mono(624, 92, 'User: alice', { 'font-size': 14, opacity: fade(u, 1.1) });
      mono(624, 116, 'Backend URL: s3://team-pulumi-state', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      tx(934, 150, '출력은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      el('rect', { x: D1.bucket[0] - 96, y: D1.bucket[1] - 66, width: 192, height: 128, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.8) }); }
    if (k === 5) { ['① 공유 · 잠금', '② 이력 · RBAC · 암호화', '③ 비용 · 보관 위치'].forEach((s, i) => pill(250 + i * 230, 400, s, INK, pop(u, 0.3 + i * 0.3), { fs: 14 }));
      cross(D1.laptop[0] + 60, D1.laptop[1] - 50, 12, pop(u, 1.6)); tx(D1.laptop[0], 160, '팀이면 탈락', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); } }

  // =========================================================
  // 2. Pulumi Cloud — 로그인 한 줄로 잠금·이력·RBAC
  // =========================================================
  function s2(t, c) { const { k, u } = c, CX = 610, CY = 140;
    const cmds = ['pulumi login', 'pulumi stack init myorg/app/prod', 'pulumi login', 'pulumi up', 'pulumi stack history', 'pulumi login'];
    cmd(20, 14, 380, cmds[k], 0.1, k >= 2 && k !== 3 && k !== 4 ? 3 : u, { fs: 14.5 });
    if (k === 5) zone(14, 70, 300, 320, '우리 회사', { fill: 'none', stroke: MUT, dash: '6 5', op: fade(u, 0.3) });
    cloud(CX, CY, 400, 190, { stroke: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.6) : 1 });
    mono(CX, CY - 40, 'app.pulumi.com', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.9) : 1 });
    if (k === 0) { tx(CX, CY + 6, '설정할 인프라 0개', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.3) });
      sub(CX, CY + 32, '로그인만 하면 backend 준비 끝', fade(u, 1.6)); }
    // 스택 이름이 세 조각으로 쪼개진다
    if (k >= 1) { const parts = [['myorg', '조직'], ['app', '프로젝트'], ['prod', '스택']], sp = k === 1 ? E(u, 0.9, 1.8) : 1;
      parts.forEach(([p, d], i) => { const x0 = CX - 70 + i * 62, x1 = CX - 120 + i * 120, x = lerp(x0, x1, sp);
        pill(x, CY + 4, p, i === 2 ? ACC : INK, k === 1 ? pop(u, 0.3) : 1, { mono: true, fs: 15 });
        if (sp > 0.05 && i < 2) mono(lerp(x0, x1, sp) + lerp(30, 60, sp), CY + 9, '/', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: 1 - sp });
        sub(x1, CY + 38, d, k === 1 ? fade(u, 1.8 + i * 0.15) : 1); }); }
    // 기본으로 딸려 오는 네 가지 — 칸이 채워진다
    if (k >= 2) { const F = [['state 잠금', 'lock'], ['업데이트 이력', 'hist'], ['조직·팀 RBAC', 'rbac'], ['시크릿 암호화', 'key']];
      F.forEach(([s, ic], i) => { const x = 420 + i * 132, y = 270, f = k === 2 ? E(u, 0.3 + i * 0.35, 0.9 + i * 0.35) : 1, hi = (k === 3 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 2);
        el('rect', { x: x - 58, y: y - 28, width: 116, height: 56, rx: 9, fill: PANEL, stroke: hi ? ACC : GRID, 'stroke-width': hi ? 2.6 : 1.6 });
        el('rect', { x: x - 58, y: y + 22, width: 116 * f, height: 6, rx: 3, fill: GOOD });
        if (ic === 'lock') lock(x, y - 6, true, hi ? ACC : INK, 0.7 * f); else if (ic === 'key') { el('circle', { cx: x - 8, cy: y - 8, r: 6 * f, fill: 'none', stroke: INK, 'stroke-width': 2.5 }); el('line', { x1: x - 2, y1: y - 8, x2: x + 14 * f, y2: y - 8, stroke: INK, 'stroke-width': 2.5 }); }
        else if (ic === 'hist') [0, 1, 2].forEach((j) => el('circle', { cx: x - 14 + j * 14, cy: y - 8, r: 4, fill: INK, opacity: f > j / 3 ? 1 : 0.15 }));
        else { el('circle', { cx: x, cy: y - 14, r: 5 * f, fill: INK }); el('path', { d: `M${x - 9},${y} Q${x},${y - 10} ${x + 9},${y}`, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: f }); }
        tx(x, y + 14, s, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, k === 2 ? 0.5 + i * 0.35 : 0) }); }); }
    // 두 사람이 동시에 up → 두 번째는 409
    const A = [90, 140], Bp = [90, 300];
    if (k >= 3) { person(A[0], A[1], '개발자 A', {}); person(Bp[0], Bp[1], '개발자 B', {}); }
    if (k === 3) { dot([[A[0] + 30, A[1]], [CX - 190, CY]], seg(u, 0.2, 0.9), ACC, 7);
      lock(CX + 150, CY - 40, seg(u, 0.9, 1) >= 1, ACC, pop(u, 0.9));
      dot([[Bp[0] + 30, Bp[1]], [CX - 200, CY + 40], [Bp[0] + 60, Bp[1] + 6]], seg(u, 0.9, 2.1), BAD, 7);
      pill(240, 352, '[409] conflict', BAD, pop(u, 2.0), { mono: true, fs: 14 });
      tx(240, 386, '다른 update가 진행 중', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.2) }); }
    // 이력 타임라인
    if (k === 4) { const y = 360, x0 = 420, x1 = 900; grow(x0, y, x1, y, E(u, 0.2, 1.4), MUT, { plain: true });
      ['update 1', 'update 2', 'update 3'].forEach((s, i) => { const x = x0 + 70 + i * 160, sh = pop(u, 0.6 + i * 0.35);
        el('circle', { cx: x, cy: y, r: 8 * sh, fill: i === 2 ? ACC : INK }); mono(x, y + 28, s, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 0.8 + i * 0.35) }); });
      tx(x0, y - 18, '모든 update의 diff가 쌓인다', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) }); }
    // 권한과 트레이드오프
    if (k === 5) { ['read', 'write', 'admin'].forEach((p, i) => pill(170, 140 + i * 46, p, i === 1 ? ACC : INK, pop(u, 0.4 + i * 0.25), { mono: true, fs: 14 }));
      sub(170, 268, 'Settings > Teams', fade(u, 1.0));
      fly(170, 330, CX + 100, CY - 78, seg(u, 1.2, 2.0), 'state 메타데이터', { stay: true, fill: WARN });
      tx(CX, 365, '편하지만 state는 회사 밖(SaaS)에 저장된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); } }

  // =========================================================
  // 3. DIY 오브젝트 스토리지 — 버킷 안 .pulumi/ 폴더
  // =========================================================
  const TREE = [['.pulumi/', 0], ['├ stacks/app/prod.json', 1], ['├ history/', 2], ['└ locks/', 3]];
  function tree(x, y, k, u, o) { o = o || {};
    TREE.forEach(([s, i]) => { const hi = (o.hi === i), op = o.show ? o.show(i) : 1;
      mono(x, y + i * 24, s, { 'font-size': 14.5, 'font-weight': hi ? 800 : 600, fill: hi ? (o.col || ACC) : INK, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c, BX = 220, BY = 238;
    if (k === 0) { cmd(40, 20, 880, 'pulumi login "s3://team-pulumi-state?region=ap-northeast-2&profile=infra"', 0.1, u, { fs: 14.5, d: 1.0 });
      const parts = [['s3://', '스킴 = 어떤 스토리지', 190], ['team-pulumi-state', '버킷 이름', 450], ['?region=…&profile=…', 'URL 쿼리 옵션', 740]];
      parts.forEach(([p, d, x], i) => { const s = pop(u, 1.2 + i * 0.3); fly(300 + i * 220, 76, x, 150, seg(u, 1.1 + i * 0.3, 1.7 + i * 0.3), p, { mono: true, stay: true, fill: i === 0 ? ACC : INK });
        sub(x, 190, d, fade(u, 1.7 + i * 0.3), { 'font-size': 14 }); });
      bucket(480, 310, 170, 80, { stroke: ACC, fill: ACCBG, s: pop(u, 2.0), text: 'state가 여기에', fs: 14 }); return; }
    bucket(BX, BY, 300, 250, { stroke: ACC, fill: PANEL, s: k === 1 ? pop(u, 0.2) : 1 });
    mono(BX, 96, 's3://team-pulumi-state', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 0.4) : 1 });
    const hi = k === 1 ? 2 : k === 2 || k === 3 || k === 5 ? 3 : -1;
    tree(BX - 120, 160, k, u, { hi, col: k === 5 ? WARN : ACC, show: (i) => (k === 1 ? fade(u, 0.5 + i * 0.25) : 1) });
    // 1: 버전관리 = 이전 판이 쌓인다
    if (k === 1) { tx(640, 110, '버전관리 ON', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) });
      ['v1', 'v2', 'v3 (지금)'].forEach((v, i) => { const x = 600 + i * 26, y = 160 + i * 26, s = pop(u, 1.2 + i * 0.35);
        card(x + 60, y + 40, 150, 64, { rx: 8, fill: i === 2 ? ACCBG : PANEL, stroke: i === 2 ? ACC : GRID, s });
        mono(x + 4, y + 30, 'prod.json', { 'font-size': 13.5, opacity: s > 0.5 ? 1 : 0 }); mono(x + 4, y + 52, v, { 'font-size': 13.5, 'font-weight': 700, fill: i === 2 ? ACC : MUT, opacity: s > 0.5 ? 1 : 0 }); });
      sub(690, 330, '이전 판으로 되돌릴 수 있다', fade(u, 2.2), { 'font-size': 14.5 }); }
    // 2: lock 파일로 동시 up 차단
    const A = [790, 140], Bq = [790, 310];
    if (k === 2) { person(A[0], A[1], '개발자 A', { s: pop(u, 0.2) }); person(Bq[0], Bq[1], '개발자 B', { s: pop(u, 0.3) });
      dot([[A[0] - 30, A[1]], [BX + 150, 232]], seg(u, 0.4, 1.1), ACC, 7);
      fly(BX + 150, 250, BX - 30, 252, seg(u, 1.1, 1.6), 'prod/<id>.json', { mono: true });
      dot([[Bq[0] - 30, Bq[1]], [BX + 170, 280], [Bq[0] - 40, Bq[1] - 10]], seg(u, 1.4, 2.5), BAD, 7);
      cross(Bq[0] - 90, Bq[1] - 30, 9, pop(u, 2.1)); tx(Bq[0] - 60, Bq[1] + 66, 'lock 파일이 있으면 대기', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
    // locks/ 아래 lock 파일 (A 의 update 가 쓴 것)
    if (k >= 2 && k <= 4) mono(BX - 96, 256, '  prod/<id>.json', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 2 ? fade(u, 1.55, 0.2) : 1 });
    // 3: DynamoDB 는 필요 없다
    if (k === 3) { dbIcon(700, 190, 'DynamoDB 잠금 테이블', { s: pop(u, 0.3), stroke: MUT });
      cross(700, 190, 34, pop(u, 1.2)); tx(700, 300, 'Terraform S3 backend 방식', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) });
      tx(700, 330, 'Pulumi는 버킷 안 lock 파일로 끝', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); }
    // 4: GCS · Azure 도 같은 폴더
    if (k === 4) { [['s3://', 'AWS S3'], ['gs://', 'GCS'], ['azblob://', 'Azure Blob']].forEach(([p, n], i) => { const x = 560 + i * 135, s = pop(u, 0.3 + i * 0.35);
        bucket(x, 210, 100, 78, { stroke: i === 0 ? ACC : INK, s, text: p, mono: true, fs: 14 });
        sub(x, 276, n, fade(u, 0.5 + i * 0.35), { 'font-size': 14, fill: INK, 'font-weight': 700 }); mono(x, 300, 'locks/ ✓', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.2 + i * 0.3) }); });
      note('URL 스킴만 바뀌고 잠금 방식은 같다', 2.0, u, INK, 360); }
    // 5: 고아 lock 과 운영 책임
    if (k === 5) { mono(BX - 96, 256, '  prod/<id>.json', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: 1 - 0.8 * fade(u, 1.4), 'text-decoration': u > 1.3 ? 'line-through' : null });
      pill(640, 130, '주인 없는 lock', WARN, pop(u, 0.2), { fs: 14 });
      fly(640, 180, BX + 20, 252, seg(u, 0.6, 1.4), 'pulumi cancel', { mono: true });
      tx(640, 210, '또는 update가 없음을 확인하고 파일 삭제', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
      ['버킷 · IAM', '백업', '스토리지 비용'].forEach((s, i) => pill(520 + i * 130, 300, s, INK, pop(u, 1.6 + i * 0.25), { fs: 14 }));
      tx(650, 344, '운영 책임은 우리 몫', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.3) }); } }

  // =========================================================
  // 4. secret provider — passphrase 와 KMS, yaml 에 남는 것
  // =========================================================
  const Y4 = [['secretsprovider: awskms://alias/pulumi?…', 3], ['encryptedkey: AQICAHj…==', 3], ['config:', 4], ['  app:region: ap-northeast-2', 4], ['  app:dbPassword:', 4], ['    secure: v1:9Xk2Qm…:oP3q7Zt…', 4]];
  function scramble(s, f, seed) { return [...s].map((ch, i) => (ch === ' ' || i / s.length < f ? ch : 'x#%&@*'[(i + seed) % 6])).join(''); }
  function s4(t, c) { const { k, u } = c;
    // 오른쪽: Pulumi.prod.yaml
    const DX = 560, DY = 30, DW = 384, DH = 300;
    if (k >= 3) { el('rect', { x: DX, y: DY, width: DW, height: DH, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(DX + 14, DY + 24, 'Pulumi.prod.yaml', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      Y4.forEach(([s, at], i) => { if (at > k) return; const op = at === k ? fade(u, 0.3 + (at === 3 ? i : i - 2) * 0.35) : 1, last = i === 5;
        const txt = last && k === 4 ? scramble('    secure: v1:9Xk2Qm…:oP3q7Zt…', E(u, 1.6, 2.5), Math.floor(u * 8)) : s;
        mono(DX + 14, DY + 58 + i * 30, txt.length > 40 ? txt.slice(0, 39) + '…' : txt, { 'font-size': 14, fill: last ? ACC : i === 3 ? INK : i < 2 ? INFO : INK, 'font-weight': last || i < 2 ? 700 : 500, opacity: op }); });
      if (k === 4) { pill(DX + 290, DY + 148, '평문', INK, pop(u, 0.4), { fs: 13.5 }); pill(DX + 290, DY + 238, '값마다 암호화', ACC, pop(u, 1.8), { fs: 13.5 }); } }
    if (k === 0) { bucket(250, 200, 200, 150, { stroke: ACC, text: 's3://…', mono: true, s: pop(u, 0.2) });
      tx(250, 90, '시크릿 키는?', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.7) });
      mono(250, 118, '?', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9) });
      fly(480, 60, 680, 200, seg(u, 1.2, 2.0), '--secrets-provider', { mono: true, stay: true });
      tx(680, 250, '스택을 만들 때 직접 고른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(680, 276, 'Pulumi Cloud는 Cloud가 키를 관리한다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // 왼쪽: 두 갈래 열쇠
    const PK = [150, 120], KM = [400, 120], fork = k === 1 ? E(u, 0.2, 1.0) : 1;
    // passphrase: 열쇠 하나를 세 사람이 나눠 든다
    const keyIcon = (x, y, col, s) => { if (s <= 0) return; el('circle', { cx: x - 14 * s, cy: y, r: 11 * s, fill: 'none', stroke: col, 'stroke-width': 3 }); el('path', { d: `M${x - 3 * s},${y} H${x + 26 * s} M${x + 18 * s},${y} V${y + 9 * s} M${x + 10 * s},${y} V${y + 7 * s}`, stroke: col, 'stroke-width': 3, fill: 'none' }); };
    keyIcon(PK[0], PK[1] - 10, WARN, k === 1 ? pop(u, 0.3) : 1);
    lbl(PK[0], PK[1] + 30, 'passphrase', k === 1 ? fade(u, 0.5) : 1, { class: 'mono' });
    card(KM[0], KM[1] - 10, 120, 52, { rx: 8, fill: INFO, stroke: 'none', text: 'KMS 키', color: PANEL, s: k === 1 ? pop(u, 0.8) : 1 });
    lbl(KM[0], KM[1] + 30, 'awskms · gcpkms · …', k === 1 ? fade(u, 1.0) : 1, { class: 'mono', 'font-size': 14.5 });
    if (k === 1) { [0, 1, 2].forEach((i) => { person(70 + i * 80, 270, null, { s: pop(u, 1.2 + i * 0.2), stroke: MUT }); grow(PK[0], PK[1] + 40, 70 + i * 80, 236, E(u, 1.4 + i * 0.2, 1.9 + i * 0.2), WARN, { dash: '4 4', plain: true }); });
      sub(150, 330, '같은 암호를 나눠 가진다', fade(u, 2.0), { 'font-size': 14 });
      ['IAM 권한', '키 회전', '감사 로그'].forEach((s, i) => pill(KM[0], 200 + i * 44, s, INFO, pop(u, 1.4 + i * 0.25), { fs: 14 })); }
    // 스택마다 다른 provider
    if (k === 2) { const st = [['prod', KM, INFO], ['dev', PK, WARN]];
      st.forEach(([n, [x, y], col], i) => { const sx = x, sy = 300; pill(sx, sy, 'stack ' + n, col, pop(u, 0.3 + i * 0.3), { mono: true, fs: 15 });
        grow(sx, sy - 18, x, y + 46, E(u, 0.9 + i * 0.3, 1.6 + i * 0.3), col, {}); });
      mono(280, 370, 'pulumi stack init prod --secrets-provider awskms://…', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) });
      tx(280, 396, 'provider는 스택 단위로 정해진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    // yaml 에 남는 것: KMS 가 감싼 데이터 키
    if (k === 3) { card(KM[0], 260, 130, 70, { rx: 10, fill: PANEL, stroke: INFO, sw: 2.5, s: pop(u, 0.3) });
      keyIcon(KM[0] - 4, 252, ACC, pop(u, 0.6) * 0.7); sub(KM[0], 286, 'data key', fade(u, 0.7));
      tx(KM[0], 214, 'KMS가 감싼다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      fly(KM[0] + 60, 260, DX + 130, DY + 90, seg(u, 1.0, 1.8), 'encryptedkey', { mono: true, fill: INFO });
      sub(150, 300, 'passphrase면 encryptionsalt가 남는다', fade(u, 2.0), { 'font-size': 14 }); }
    if (k === 4) { fly(PK[0], 260, DX + 250, DY + 178, seg(u, 0.4, 1.3), 'dbPassword', { mono: true });
      tx(250, 330, '평문으로 저장되지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); } }

  // =========================================================
  // 5. 이전 — stack migrate 또는 export → import, 그리고 검증
  // =========================================================
  function s5(t, c) { const { k, u } = c, S = [150, 200], T = [800, 200];
    if (k === 5) { // 선택 기준: 질문 두 개로 가르기
      const q = (x, y, s, sc) => card(x, y, 220, 50, { rx: 25, fill: SOFT, stroke: INK, sw: 2, text: s, fs: 15, s: sc });
      const a = (x, y, s, col, sc) => card(x, y, 210, 50, { rx: 10, fill: PANEL, stroke: col, sw: 2.5, text: s, fs: 15, color: col, mono: /:\/\//.test(s), s: sc });
      q(200, 90, '팀이 함께 쓰나?', pop(u, 0.2));
      grow(200, 116, 200, 300, E(u, 0.6, 1.0), MUT, {}); tx(212, 210, '아니오', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      a(200, 330, 'file://~', MUT, pop(u, 1.0));
      grow(312, 90, 470, 90, E(u, 0.6, 1.0), MUT, {}); tx(380, 80, '예', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      q(590, 90, '사내 보관이 필수인가?', pop(u, 1.0));
      grow(560, 116, 480, 300, E(u, 1.4, 1.8), MUT, {}); grow(620, 116, 720, 300, E(u, 1.4, 1.8), MUT, {});
      tx(488, 210, '아니오', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6), 'text-anchor': 'end' }); tx(690, 210, '예', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      a(480, 330, 'Pulumi Cloud', ACC, pop(u, 1.8)); a(740, 330, 'DIY + KMS', INFO, pop(u, 2.0));
      note('어느 쪽이든 팀이면 모두가 닿는 저장소와 잠금이 있어야 한다', 2.3, u, INK, 404); return; }
    const cmds = ['pulumi login', 'pulumi stack migrate s3://team-pulumi-state prod --target acmecorp/app/prod', 'pulumi stack export --file state.json', 'pulumi stack import --file state.json', 'pulumi preview'];
    cmd(20, 14, 920, cmds[k], 0.1, u, { fs: 14.5 });
    bucket(S[0], S[1], 170, 130, { stroke: k === 0 || k === 3 ? OFF : INK, text: '원본', fs: 15 });
    mono(S[0], S[1] + 96, 's3://team-pulumi-state', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    cloud(T[0], T[1], 250, 140, { stroke: k === 2 ? OFF : ACC, fill: k === 2 ? PANEL : ACCBG, text: '대상', color: k === 2 ? OFF : ACC });
    mono(T[0], T[1] + 96, 'app.pulumi.com', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    if (k === 0) { grow(480, 54, T[0] - 40, T[1] - 70, E(u, 0.8, 1.5), ACC, {}); note('옮겨 갈 쪽에 먼저 로그인한다', 1.6, u, ACC, 330); }
    if (k === 1) { // 체크포인트 + config 가 건너가고, 원본은 남는다
      stateDoc(S[0] + 4, S[1] - 6, 0.6, { op: 0.45 });
      const f = E(u, 0.6, 1.8), x = lerp(S[0], T[0], f), y = S[1] - 6 - Math.sin(f * Math.PI) * 60;
      stateDoc(x, y, 0.8, {}); lock(x + 34, y - 28, true, f < 0.6 ? WARN : ACC, 0.8);
      tx(480, 120, '체크포인트 + config', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(480, 300, '시크릿은 대상 provider로 다시 암호화', { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(S[0], S[1] + 124, '원본 state는 그대로 (롤백 안전)', fade(u, 2.0), { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
      pill(T[0], T[1] + 124, 'acmecorp/app/prod', ACC, pop(u, 1.9), { mono: true, fs: 13.5 }); }
    if (k === 2) { const f = E(u, 0.5, 1.5); stateDoc(lerp(S[0], 480, f), lerp(S[1], 220, f), 0.6 + 0.3 * f, { stroke: INK, fill: PANEL });
      mono(480, 290, 'state.json', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 314, '파일이라 직접 열어 고칠 수도 있다', fade(u, 1.9), { 'font-size': 14 }); }
    if (k === 3) { const f = E(u, 0.5, 1.6); stateDoc(lerp(480, T[0], f), lerp(220, T[1], f), 0.9 - 0.2 * f, { stroke: f > 0.95 ? ACC : INK, fill: f > 0.95 ? ACCBG : PANEL });
      pill(T[0], T[1] + 124, 'stack init acmecorp/app/prod', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); note('state.json을 그대로 넣는다', 1.8, u, INK, 330); }
    if (k === 4) { el('rect', { x: 330, y: 90, width: 300, height: 110, rx: 10, fill: INK, opacity: fade(u, 0.3) });
      mono(350, 122, 'Previewing update (prod):', { 'font-size': 14, fill: PANEL, opacity: fade(u, 0.5) });
      mono(350, 150, 'Resources:', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.8) });
      mono(370, 176, 'N unchanged  (예시)', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 1.0) });
      check(480, 260, 22, pop(u, 1.4)); tx(480, 316, '변경 0 = 이전 성공', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      sub(480, 342, '+ ~ - 가 하나라도 보이면 state가 어긋난 것', fade(u, 2.0), { 'font-size': 14 }); } }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: '팀 프로젝트에서 file://~ backend가 후보에서 빠지는 이유는 무엇인가?',
      o: ['잠금 기능이 아예 없어서', 'state가 내 PC의 ~/.pulumi에만 있어 팀원이 닿을 수 없어서', '시크릿을 암호화할 방법이 없어서'], a: 1,
      why: 'DIY backend는 로컬 파일까지 파일 잠금이 기본이다. 문제는 그 state가 내 PC에만 있어 다른 사람이 같은 state로 작업할 수 없다는 것이다.' },
    { q: 'Pulumi Cloud에서 두 사람이 동시에 pulumi up을 하면 두 번째 사람에게는 무엇이 돌아오는가?',
      o: ['[409] conflict 오류로 막힌다', '두 update가 합쳐져 한 번에 적용된다', '나중에 온 update가 먼저 것을 덮어쓴다'], a: 0,
      why: '관리형 backend는 서버가 스택을 잠근다. 진행 중인 update가 있으면 다음 요청은 409 conflict로 거절되어 state가 깨지지 않는다.' },
    { q: 'S3를 Pulumi DIY backend로 쓸 때 동시 up을 막는 장치는 무엇인가?',
      o: ['DynamoDB 잠금 테이블', 'S3 객체 버전관리', '버킷 안 .pulumi/locks/의 lock 파일'], a: 2,
      why: 'Pulumi DIY backend는 lock 파일 잠금이 기본으로 켜져 있다. DynamoDB 테이블은 Terraform S3 backend 방식이고, 버전관리는 백업용이다.' },
    { q: 'awskms로 만든 스택의 Pulumi.prod.yaml에 남는 것은 무엇인가?',
      o: ['KMS 키 원본과 평문 비밀번호', 'passphrase 문자열과 평문 값', 'provider 이름, 감싼 데이터 키, secure: 암호문'], a: 2,
      why: 'yaml에는 어떤 provider를 쓰는지와 KMS로 감싼 데이터 키만 남는다. 시크릿 값은 secure: v1:… 처럼 값마다 암호화된다.' },
    { q: 'backend를 옮긴 직후 성공 여부는 무엇으로 판단하는가?',
      o: ['대상 backend에 스택 이름이 보이는지', 'pulumi preview가 no changes로 끝나는지', '원본 backend의 state가 지워졌는지'], a: 1,
      why: 'state가 그대로 옮겨졌다면 코드와 비교해 바꿀 것이 없어야 한다. stack migrate는 원본을 남겨 두므로 원본이 지워지는 것은 기준이 아니다.' },
  ];

  const summary = [
    'state를 어디에 둘지는 pulumi login 뒤의 URL 하나로 정해진다.',
    'Pulumi Cloud는 로그인만으로 잠금, 이력, RBAC, 시크릿 암호화가 따라온다.',
    'S3 같은 DIY backend는 버킷 안 lock 파일로 잠그므로 DynamoDB가 필요 없다.',
    'backend는 stack migrate나 export/import로 옮기고, 옮긴 뒤 preview가 no changes면 성공이다.',
  ];
  const review = [
    { q: '사내 규정상 state를 회사 AWS 계정 밖에 둘 수 없다. 팀 backend로 알맞은 조합은?',
      o: ['Pulumi Cloud에 passphrase', 's3:// 버킷에 awskms secret provider', '각자 file://~ 에 두고 git으로 공유'], a: 1,
      why: 'DIY 버킷이면 state가 우리 계정 안에 있고 lock 파일 잠금도 기본이다. 키는 KMS로 두면 IAM으로 복호화 권한을 통제할 수 있다.' },
    { q: 'S3 backend에서 갑자기 모든 pulumi up이 잠겨 있다고 나온다. 아무도 update를 돌리고 있지 않다면 먼저 할 일은?',
      o: ['DynamoDB 테이블의 잠금 행을 지운다', '버킷 버전관리를 끈다', 'pulumi cancel이나 남은 lock 파일 삭제'], a: 2,
      why: '죽은 실행이 남긴 lock 파일이 원인이다. Pulumi DIY 잠금은 DynamoDB가 아니라 버킷 안 파일이라 그 파일을 정리하면 다시 up 할 수 있다.' },
    { q: 'stack migrate로 S3에서 Pulumi Cloud로 옮긴 뒤 preview에 ~ update가 잡혔다. 무엇을 의심해야 하나?',
      o: ['옮긴 state가 코드나 실제와 어긋났다', 'Pulumi Cloud가 잠금을 걸었다', 'preview는 원래 이전 직후에 항상 변경을 보인다'], a: 0,
      why: '제대로 옮겨졌다면 코드와 비교해 바꿀 것이 없어야 한다. 변경이 보이면 옮긴 state를 먼저 살핀다. 원본은 남아 있어 되돌리기도 쉽다.' },
  ];

  R.page({ title: 'state는 어디에 사는가', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
