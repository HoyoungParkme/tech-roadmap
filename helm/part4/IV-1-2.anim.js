/* IV-1-2 Hooks — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 아래쪽 실행 줄은 STEPS 의 timeline(label·kind·active)을 그린다. weight·backoffLimit·activeDeadlineSeconds 는 페이지 코드 값.
 * 훅 동작(정책 기본값, 실패 시 upgrade 실패·자동 롤백은 --atomic)은 helm.sh Chart Hooks 문서 기준. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, dbIcon, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  const KC = { hook: ACC, sys: INK, test: GOOD, del: WARN };
  // 아래 실행 줄: beat.timeline 을 왼쪽→오른쪽 정거장으로
  function track(c, o) { o = o || {}; const tl = c.beat.timeline || [], ptl = (c.prev && c.prev.timeline) || [], y = o.y || 372, x0 = 110, x1 = 850, n = tl.length;
    el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 3 });
    tl.forEach((st, i) => { const x = n > 1 ? lerp(x0, x1, i / (n - 1)) : x0, col = KC[st.kind] || INK, was = ptl[i] && ptl[i].active, on = st.active ? (was ? 1 : E(c.u, 0.3 + i * 0.2, 0.7 + i * 0.2)) : 0;
      el('circle', { cx: x, cy: y, r: 9, fill: on > 0.5 ? col : PANEL, stroke: on > 0.5 ? col : OFF, 'stroke-width': 2.5 });
      const parts = st.label.split(' · ');
      parts.forEach((p, j) => tx(x, y + 26 + j * 17, p, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': j === 0 ? 700 : 500, fill: on > 0.5 ? col : MUT, class: j === 0 && /^[a-z"-]/.test(p) ? 'mono' : null })); }); }
  // Job · Pod 카드
  function job(cx, cy, name, o) { o = o || {}; const w = o.w || 230, h = o.h || 64, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    tx(-w / 2 + 12, -h / 2 + 20, o.kind || 'Job', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }, g);
    mono(-w / 2 + 12, -h / 2 + 44, name, { 'font-size': 14.5, 'font-weight': 700, fill: col }, g);
    if (o.status) { const sc = { Running: INFO, Complete: GOOD, Succeeded: GOOD, Failed: BAD, Pending: MUT }[o.status] || MUT;
      const pw = tw(o.status, 13.5) + 18; el('rect', { x: w / 2 - pw - 8, y: -h / 2 + 7, width: pw, height: 22, rx: 11, fill: PANEL, stroke: sc, 'stroke-width': 1.6 }, g);
      tx(w / 2 - pw / 2 - 8, -h / 2 + 23, o.status, { 'font-size': 13.5, 'font-weight': 700, fill: sc, 'text-anchor': 'middle' }, g); }
    return g; }
  // annotation 도장
  function stamp(x, y, text, s, col) { if (s <= 0.02) return; const w = tw(text, 14) + 22, g = R.G(x, y, 1 + (1 - s) * 0.6, s);
    el('rect', { x: -w / 2, y: -15, width: w, height: 30, rx: 5, fill: WARNBG, stroke: col || WARN, 'stroke-width': 2 }, g);
    mono(0, 5, text, { 'font-size': 14, 'font-weight': 700, fill: col || WARN, 'text-anchor': 'middle' }, g); }
  const kcard = (cx, cy, kind, s, o) => { o = o || {}; card(cx, cy, o.w || 150, 40, { rx: 6, s, op: o.op, stroke: o.stroke || INK, fill: o.fill, text: kind, fs: 14.5, mono: true, color: o.color }); };

  // ---------- 1. 훅이란 ----------
  function s1(t, c) { const { k, u } = c;
    track(c);
    if (k <= 1) { zone(30, 30, 430, 270, 'helm install이 한꺼번에 적용하는 리소스', { fill: SOFT });
      zone(500, 30, 430, 270, '훅 · 정해진 시점에 따로 실행', { fill: k === 1 ? ACCBG : SOFT, op: k === 1 ? fade(u, 1.0) : 0.5 });
      kcard(140, 110, 'Deployment', 1); kcard(140, 170, 'Service', 1);
      const f = k === 1 ? E(u, 1.2, 2.0) : 0;
      job(lerp(320, 715, f), lerp(236, 170, f), 'myrel-db-init', { s: k === 0 ? pop(u, 0.3) : 1 });
      if (k === 0) { sub(320, 290, '{{ .Release.Name }}-db-init → myrel-db-init', fade(u, 0.9), { 'font-size': 13.5, class: 'mono' }); note(560, 160, '아직은 평범한 Job', fade(u, 1.4), { fill: MUT }); }
      if (k === 1) { stamp(lerp(320, 715, f), lerp(236, 170, f) - 50, '"helm.sh/hook": pre-install', pop(u, 0.3));
        note(560, 260, 'annotation 한 줄이 훅을 만든다', fade(u, 2.1), { fill: ACC }); }
      return; }
    if (k === 2) { job(170, 90, 'myrel-db-init', { status: 'Running' });
      mono(60, 150, 'backoffLimit: 3', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(60, 176, 'restartPolicy: Never', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      tx(60, 212, '첫 시도 + 재시도 3번 = Pod 최대 4개', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.7) });
      for (let i = 0; i < 4; i++) { const x = 400 + i * 135, at = 0.6 + i * 0.4, s = pop(u, at), failed = u > at + 0.3;
        card(x, 110, 116, 66, { rx: 8, stroke: failed ? BAD : GRID, dash: s > 0.5 ? null : '5 4', s: Math.max(s, 0.001) });
        tx(x, 102, i === 0 ? '시도 1' : `재시도 ${i}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 });
        mono(x, 126, failed ? 'Failed' : '…', { 'font-size': 13.5, fill: failed ? BAD : MUT, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 }); }
      sub(605, 170, '실패한 Pod은 지우지 않고 남겨 로그를 본다', fade(u, 1.5), { 'font-size': 14 });
      card(605, 240, 420, 50, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 2.2) });
      tx(605, 246, '끝내 실패하면 훅 실패 → install 실패', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { job(170, 120, 'myrel-db-init', { status: 'Running' });
      dbIcon(720, 130, 'myrel-postgresql', { stroke: INK });
      fly(290, 120, 670, 120, seg(u, 0.4, 1.6), 'CREATE SCHEMA IF NOT EXISTS app;', { mono: true });
      if (u > 1.6) pill(720, 214, 'schema app', ACC, pop(u, 1.6), { mono: true });
      mono(60, 190, 'psql -h {{ .Release.Name }}-postgresql', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) });
      card(480, 280, 860, 48, { rx: 10, stroke: WARN, fill: WARNBG, sw: 1.8, s: pop(u, 2.0) });
      tx(480, 286, 'pre-install 시점엔 이 릴리스 리소스가 0개다. 같은 차트 안의 DB라면 아직 없다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) }); return; }
    // k4: install 순서
    const STAGE = [0.3, 0.9, 1.9, 2.5], cur = STAGE.filter((a) => u > a).length;
    card(150, 110, 170, 60, { rx: 10, stroke: cur >= 1 ? INK : GRID, text: '매니페스트\n렌더', fs: 14.5, op: cur >= 1 ? 1 : 0.4 });
    job(400, 110, 'myrel-db-init', { status: u < 1.6 ? (u > 0.9 ? 'Running' : 'Pending') : 'Complete', op: cur >= 2 ? 1 : 0.4, w: 210 });
    if (u > 0.9 && u < 1.6) { const a = (u - 0.9) * 8; el('path', { d: `M${400 + 22 * Math.cos(a)},${170 + 22 * Math.sin(a)} A22,22 0 0 1 ${400 + 22 * Math.cos(a + 2)},${170 + 22 * Math.sin(a + 2)}`, fill: 'none', stroke: INFO, 'stroke-width': 3.5 }); }
    sub(400, 212, '완료될 때까지 기다린다', fade(u, 1.0), { 'font-size': 14, fill: INFO, 'font-weight': 700 });
    kcard(650, 90, 'Deployment', pop(u, 1.9)); kcard(650, 140, 'Service', pop(u, 2.0));
    sub(820, 115, 'post-install 훅', fade(u, 2.5), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    for (let i = 0; i < 3; i++) grow([235, 505, 725][i], 110, [295, 565, 760][i], 110, E(u, STAGE[i] + 0.2, STAGE[i] + 0.5), MUT);
    dot([[110, 300], [850, 300]], clamp(u / 2.7), ACC, 7); el('line', { x1: 110, y1: 300, x2: 850, y2: 300, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' }); }

  // ---------- 2. 훅 종류 ----------
  const LANES = [['install', 'pre-install', '리소스 생성', 'post-install'], ['upgrade', 'pre-upgrade', '리소스 갱신', 'post-upgrade'], ['uninstall', 'pre-delete', '리소스 삭제', 'post-delete'], ['rollback', 'pre-rollback', '되돌리기', 'post-rollback']];
  const LY = (i) => 56 + i * 76;
  function flag(x, y, name, s, col) { const g = R.G(x, y, s, s > 0.05 ? 1 : 0); el('path', { d: 'M0,-22 V22 M0,-22 L16,-15 L0,-8', fill: col || ACC, stroke: col || ACC, 'stroke-width': 2.5 }, g); mono(0, -30, name, { 'font-size': 13.5, 'font-weight': 700, fill: col || ACC, 'text-anchor': 'middle' }, g); }
  function lane(i, u0, u, dim) { const [cmd, pre, body, post] = LANES[i], y = LY(i), op = dim ? 0.35 : 1, g = E(u, u0, u0 + 0.6);
    mono(30, y + 5, 'helm ' + cmd, { 'font-size': 14.5, 'font-weight': 700, opacity: op * fade(u, u0) });
    el('rect', { x: 250, y: y - 14, width: 210 * g, height: 28, rx: 6, fill: i === 2 ? BADBG : SOFT, stroke: i === 2 ? BAD : INK, 'stroke-width': 1.6, opacity: op });
    tx(355, y + 5, body, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, opacity: op * (g > 0.9 ? 1 : 0) });
    flag(222, y + 6, pre, pop(u, u0 + 0.4) * (dim ? 0.999 : 1), dim ? OFF : ACC); flag(486, y + 6, post, pop(u, u0 + 0.6), dim ? OFF : ACC); }
  function testLane(u0, u, dim) { const y = LY(4); mono(30, y + 5, 'helm test', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: (dim ? 0.35 : 1) * fade(u, u0) });
    el('line', { x1: 250, y1: y, x2: 460, y2: y, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' }); flag(355, y + 6, 'test', pop(u, u0 + 0.3), dim ? OFF : GOOD); }
  function s2(t, c) { const { k, u } = c;
    const L = (i, at) => lane(i, k === 0 ? at : k === 1 && i === 3 ? 0.2 : -9, k === 0 || (k === 1 && i === 3) ? u : 3, k >= 3);
    [0, 1, 2].forEach((i) => L(i, 0.2 + i * 0.5)); if (k >= 1) L(3); if (k >= 1) testLane(k === 1 ? 0.8 : -9, k === 1 ? u : 3, false);
    el('line', { x1: 560, y1: 30, x2: 560, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
    if (k === 0) { note(590, 90, 'pre = 본 작업 앞', fade(u, 1.8), { fill: ACC }); note(590, 120, 'post = 본 작업 뒤', fade(u, 2.0), { fill: ACC });
      note(590, LY(2) - 6, 'pre-delete는 지우기 전', fade(u, 2.2)); note(590, LY(2) + 20, 'post-delete는 다 지운 뒤', fade(u, 2.3)); return; }
    if (k === 1) { note(590, LY(3) + 5, '롤백할 때만', fade(u, 0.8)); note(590, LY(4) + 5, 'helm test를 칠 때만', fade(u, 1.4), { fill: GOOD });
      sub(750, 120, '이벤트마다 pre / post 한 쌍', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { job(750, 80, 'myrel-migrate', { s: pop(u, 0.2), w: 250 });
      stamp(750, 140, '"helm.sh/hook": pre-install,pre-upgrade', pop(u, 0.5));
      [0, 1].forEach((i) => { const f = E(u, 1.0 + i * 0.4, 1.8 + i * 0.4); if (f > 0) { if (f < 1) fly(750, 180, 222, LY(i) + 6, f, 'migrate', { mono: true }); else { el('circle', { cx: 230, cy: LY(i) + 2, r: 27, fill: 'none', stroke: WARN, 'stroke-width': 3 }); el('circle', { cx: 230, cy: LY(i) + 2, r: 27, fill: WARN, opacity: 0.15 }); } } });
      note(610, 240, '같은 Job이 두 시점 모두에서 돈다', fade(u, 2.2)); return; }
    if (k === 3) { job(750, 80, 'myrel-conn-test', { kind: 'Pod', s: pop(u, 0.2), w: 250, col: GOOD });
      stamp(750, 140, '"helm.sh/hook": test', pop(u, 0.5), GOOD);
      const f = E(u, 1.0, 1.8); if (f < 1) fly(750, 180, 355, LY(4) + 26, f, 'conn-test', { mono: true, fill: GOOD }); else pill(355, LY(4) + 30, 'conn-test', GOOD, 1, { mono: true, fs: 13.5 });
      cross(355, LY(0), 12, pop(u, 1.9)); note(610, 240, 'install 흐름에는 끼지 않는다', fade(u, 2.1)); return; }
    // k4 curl
    job(650, 90, 'myrel-conn-test', { kind: 'Pod', w: 190, col: GOOD, status: u > 1.8 ? 'Succeeded' : 'Running' });
    card(860, 90, 120, 56, { rx: 10, stroke: INFO, text: 'Service\nmyrel:8080', fs: 13.5, mono: true, color: INFO });
    dot([[745, 80], [800, 80]], seg(u, 0.4, 0.9), GOOD, 6); dot([[800, 100], [745, 100]], seg(u, 1.0, 1.5), INFO, 6);
    if (u > 1.5) pill(780, 140, '200', GOOD, pop(u, 1.5), { mono: true });
    mono(590, 200, 'curl -sf …/healthz', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
    [['응답 200 → exit 0', GOOD, 'helm test 통과'], ['응답 실패 → exit ≠ 0', BAD, 'helm test 실패']].forEach(([a, col, b], i) => { const y = 250 + i * 50, op = fade(u, 1.9 + i * 0.3);
      mono(590, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op }); tx(930, y, b, { 'font-size': 14, fill: col, 'text-anchor': 'end', opacity: op }); });
    sub(745, 360, '-f를 줘야 4xx·5xx도 실패가 된다', fade(u, 2.4), { 'font-size': 14 }); }

  // ---------- 3. hook-weight ----------
  const HK = [['01-create-db', -5, 'createdb appdb'], ['02-schema', 0, 'alembic upgrade head'], ['03-seed', 5, 'python seed.py']];
  const NX = (w) => 130 + (w + 6) * 60, GX = 210, GW = 150;   // 숫자줄 · 간트
  function s3(t, c) { const { k, u } = c, done = (c.beat.timeline || []).filter((s) => s.active).length, pdone = ((c.prev && c.prev.timeline) || []).filter((s) => s.active).length;
    // 숫자줄
    el('line', { x1: NX(-6), y1: 110, x2: NX(6), y2: 110, stroke: INK, 'stroke-width': 2 });
    for (let w = -5; w <= 5; w++) { el('line', { x1: NX(w), y1: 104, x2: NX(w), y2: 116, stroke: INK, 'stroke-width': w % 5 ? 1 : 2 }); if (w % 5 === 0) mono(NX(w), 136, String(w), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); }
    tx(NX(6) + 14, 115, 'weight', { 'font-size': 14, fill: MUT });
    tx(NX(-6), 136, '먼저', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: 0.9 }); tx(NX(6), 136, '나중', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'end' });
    HK.forEach(([nm, w], i) => { const placed = i < done, now = i === done - 1 && i >= pdone, f = placed ? (now ? E(u, 0.2, 0.9) : 1) : 0;
      const x0 = 300 + i * 190, y0 = 52, x = lerp(x0, NX(w), f), y = lerp(y0, 82, f);
      card(x, y, 150, 34, { rx: 17, stroke: placed ? ACC : MUT, fill: placed ? ACCBG : PANEL, text: nm, fs: 14, mono: true, color: placed ? ACC : MUT, s: k === 0 ? pop(u, 0.3 + i * 0.3) : 1 }); });
    if (k === 0) { note(300, 186, '세 Job 모두 "helm.sh/hook": pre-install', fade(u, 1.2)); note(300, 216, '같은 시점이면 순서는 weight가 정한다', fade(u, 1.6), { fill: ACC }); return; }
    // 간트
    const rows = HK.map(([nm]) => nm).concat(['앱 설치']), gy = (i) => 180 + i * 44;
    rows.forEach((nm, i) => { mono(GX - 12, gy(i) + 5, nm, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, fill: i === 3 ? INK : ACC, opacity: i < done || (k === 4 && i === 3) ? 1 : 0.35 }); });
    HK.forEach((h, i) => { if (i >= done) return; const now = i === done - 1 && i >= pdone, g = now ? E(u, 0.9, 2.0) : 1;
      el('rect', { x: GX + i * GW, y: gy(i) - 14, width: GW * g, height: 28, rx: 5, fill: ACC, opacity: 0.85 });
      if (g > 0.95) check(GX + i * GW + GW - 16, gy(i), 7, 1); });
    if (k === 4) { const g = E(u, 1.0, 2.2); el('line', { x1: GX + 3 * GW, y1: 160, x2: GX + 3 * GW, y2: gy(3) + 20, stroke: INK, 'stroke-width': 1.6, 'stroke-dasharray': '4 4', opacity: fade(u, 0.5) });
      el('rect', { x: GX + 3 * GW, y: gy(3) - 14, width: 220 * g, height: 28, rx: 5, fill: INK, opacity: 0.8 });
      tx(GX + 3 * GW + 8, gy(3) - 24, '세 훅이 모두 끝난 뒤', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.7) });
      mono(GX + 2 * GW + 8, gy(2) + 30, 'python seed.py', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) }); }
    if (k === 1) note(GX + GW + 20, gy(0) + 5, '-5가 가장 작아 먼저', fade(u, 1.8));
    if (k === 2) note(GX + 2 * GW + 20, gy(1) + 5, '앞 훅이 끝나야 시작', fade(u, 1.8));
    if (k === 3) { [['"helm.sh/hook-weight": "5"', GOOD, 1], ['"helm.sh/hook-weight": 5', BAD, 0]].forEach(([s, col, ok], i) => { const x = 40 + i * 470, y = 380, op = fade(u, 1.6 + i * 0.4);
        el('rect', { x, y: y - 22, width: 440, height: 34, rx: 6, fill: ok ? GOODBG : BADBG, stroke: col, 'stroke-width': 1.6, opacity: op });
        mono(x + 40, y, s, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op }); (ok ? check : cross)(x + 20, y - 5, 8, op); });
      tx(500, 340, 'annotation 값은 문자열이어야 한다', { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: fade(u, 1.5) }); } }

  // ---------- 4. hook-delete-policy ----------
  const CL = { x: 520, y: 40, w: 410, h: 270 };
  function cluster(title) { zone(CL.x, CL.y, CL.w, CL.h, title || '클러스터 · Job 목록', { fill: SOFT }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { track(c); cluster();
      const st = k === 0 ? (u < 0.9 ? 'Running' : 'Complete') : 'Complete';
      job(725, 120, 'myrel-migrate', { status: st, s: k === 0 ? pop(u, 0.2) : 1, w: 260 });
      mono(40, 70, 'kind: Job', { 'font-size': 15, opacity: 1 }); mono(40, 96, 'name: {{ .Release.Name }}-migrate', { 'font-size': 15, 'font-weight': 700 });
      if (k === 0) { note(560, 220, '끝나도 남는다', fade(u, 1.2)); note(560, 250, 'helm uninstall도 안 지운다', fade(u, 1.6), { fill: WARN });
        sub(270, 160, '다음 upgrade도 같은 이름을 만든다', fade(u, 2.0), { 'font-size': 14.5 }); }
      if (k === 1) { stamp(240, 150, '"helm.sh/hook": pre-upgrade', pop(u, 0.3)); stamp(240, 200, '"helm.sh/hook-weight": "0"', pop(u, 0.7)); }
      return; }
    if (k === 2) { cluster('클러스터 · 다음 upgrade 때');
      stamp(250, 70, 'before-hook-creation,hook-succeeded', pop(u, 0.2));
      [['before-hook-creation', '새 훅 직전에 이전 Job 삭제', 0.6], ['hook-succeeded', '성공하면 바로 삭제', 0.9], ['hook-failed (뺐다)', '실패 Job은 남겨 로그를 본다', 1.2]].forEach(([a, b, at], i) => { const y = 140 + i * 56, op = fade(u, at);
        mono(40, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: i === 2 ? MUT : WARN, opacity: op, 'text-decoration': i === 2 ? 'line-through' : null }); tx(40, y + 22, b, { 'font-size': 14, fill: MUT, opacity: op }); });
      // 클러스터 안: 이전 Job 삭제 → 새 Job 실행 → 성공 후 삭제
      const gone1 = E(u, 0.6, 1.1); job(725, 110 - gone1 * 20, 'myrel-migrate (이전)', { status: 'Complete', w: 270, op: 1 - gone1 });
      if (u > 0.6 && u < 1.2) cross(725, 110, 14, pop(u, 0.6));
      const born = pop(u, 1.2), done = u > 1.8, gone2 = E(u, 2.1, 2.5);
      if (u > 1.2) job(725, 190 + gone2 * 20, 'myrel-migrate (새)', { status: done ? 'Complete' : 'Running', w: 270, s: born, op: 1 - gone2, col: ACC });
      mono(725, 290, `남은 Job ${u > 2.5 ? 0 : 1}개`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: u > 2.5 ? GOOD : INK }); return; }
    if (k === 3) { cluster('클러스터 · 실패한 경우');
      mono(40, 80, 'backoffLimit: 2', { 'font-size': 15, 'font-weight': 700 }); mono(40, 108, 'activeDeadlineSeconds: 600', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      const f = E(u, 0.4, 2.0); clock(150, 210, 54, f, WARN); mono(150, 215, `${Math.round(600 * f)}s`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      sub(150, 292, '600초 = 10분이 넘으면 실패', fade(u, 1.2), { 'font-size': 14 });
      tx(310, 170, 'Pod', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 3; i++) { const at = 0.5 + i * 0.5, s = pop(u, at); card(380, 196 + i * 38, 110, 30, { rx: 6, stroke: BAD, s, text: i ? `재시도 ${i}` : '시도 1', fs: 13.5 }); }
      job(725, 130, 'myrel-migrate', { status: u > 2.0 ? 'Failed' : 'Running', w: 260, col: u > 2.0 ? BAD : INK });
      note(560, 220, '실패 Job은 남는다', fade(u, 2.1), { fill: BAD }); sub(725, 260, 'kubectl logs로 원인을 본다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k4: 정책별 표
    const COLS = ['성공하면', '실패하면', '다음 실행 직전'], ROWS = [
      ['before-hook-creation', ['남음', '남음', '삭제']], ['hook-succeeded', ['삭제', '남음', '그대로']], ['hook-failed', ['남음', '삭제', '그대로']], ['(정책 없음)', ['남음', '남음', '삭제']]];
    COLS.forEach((h, j) => tx(470 + j * 160, 60, h, { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
    ROWS.forEach(([p, cells], i) => { const y = 110 + i * 62, op = fade(u, 0.2 + i * 0.35);
      mono(40, y + 5, p, { 'font-size': 15, 'font-weight': 700, fill: i === 3 ? MUT : WARN, opacity: op });
      cells.forEach((v, j) => { const s = pop(u, 0.4 + i * 0.35 + j * 0.1), col = v === '삭제' ? GOOD : v === '남음' ? WARN : MUT;
        card(470 + j * 160, y, 130, 40, { rx: 8, stroke: col, fill: v === '삭제' ? GOODBG : v === '남음' ? WARNBG : PANEL, text: v, fs: 14.5, color: col, s }); }); });
    el('path', { d: `M30,${110 + 3 * 62 - 26} h890`, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    sub(480, 398, '정책을 비우면 before-hook-creation과 같다 (Helm 3 기본)', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // ---------- 5. 업그레이드 마이그레이션 ----------
  function pods(x, y, label, n, col, o) { o = o || {}; for (let i = 0; i < n; i++) { const g = R.G(x + i * 48, y, o.s ?? 1, o.op ?? 1);
      el('rect', { x: -18, y: -18, width: 36, height: 36, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2 }, g); el('circle', { cx: 0, cy: 0, r: 6, fill: col }, g); }
    tx(x - 18, y + 38, label, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: o.op ?? 1 }); }
  function s5(t, c) { const { k, u } = c;
    track(c, { y: 360 });
    if (k <= 1) { job(240, 110, 'my-app-migrate', { s: k === 0 ? pop(u, 0.2) : 1, w: 260 });
      mono(60, 186, 'labels:', { 'font-size': 14.5, opacity: k === 0 ? fade(u, 0.6) : 1 });
      mono(80, 210, 'app.kubernetes.io/managed-by: Helm', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.9) : 1 });
      sub(240, 250, '{{ .Release.Service }}는 언제나 Helm', k === 0 ? fade(u, 1.4) : 1, { 'font-size': 14, class: 'mono' });
      if (k === 0) { note(560, 110, 'Helm이 만든 리소스라는 표시', fade(u, 1.8)); sub(700, 150, 'kubectl get job -l … 로 찾기 쉽다', fade(u, 2.1), { 'font-size': 14 }); }
      if (k === 1) [['"helm.sh/hook": pre-upgrade', '시점'], ['"helm.sh/hook-weight": "0"', '순서'], ['"helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded', '정리']].forEach(([s, why], i) => {
        const y = [80, 150, 292][i], x = i === 2 ? 480 : 690; stamp(x, y, s, pop(u, 0.3 + i * 0.5)); tx(x, y + 36, why, { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.5) }); });
      return; }
    if (k === 2) { job(200, 90, 'my-app-migrate', { status: u > 1.4 ? 'Failed' : 'Running', w: 250, col: u > 1.4 ? BAD : INK });
      mono(80, 150, 'backoffLimit: 2 · 600s', { 'font-size': 14.5, 'font-weight': 700 });
      pods(600, 90, '기존 Pod · 계속 돈다', 3, INK); pods(600, 200, '새 Pod · 뜨지 않는다', 3, OFF, { fill: SOFT });
      cross(800, 200, 14, pop(u, 1.6));
      card(250, 240, 380, 50, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 1.6) }); tx(250, 246, 'upgrade 실패 · 새 Deployment 미적용', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      sub(250, 304, '이전 리비전으로 자동 롤백은 --atomic일 때만', fade(u, 2.2), { 'font-size': 14, fill: INK, 'font-weight': 600 }); return; }
    if (k === 3) { lock(90, 110, true, WARN); mono(120, 108, 'Secret my-app-db', { 'font-size': 15, 'font-weight': 700, fill: WARN }); mono(120, 134, 'key: url', { 'font-size': 14, fill: MUT });
      job(560, 120, 'my-app-migrate', { w: 250 });
      fly(240, 120, 450, 160, seg(u, 0.4, 1.4), 'DATABASE_URL', { mono: true, fill: WARN });
      if (u > 1.4) mono(450, 180, 'env: DATABASE_URL', { 'font-size': 14.5, 'font-weight': 700, fill: WARN });
      dbIcon(840, 120, 'DB', {}); grow(690, 120, 790, 120, E(u, 1.5, 2.0), ACC);
      pods(90, 250, '앱 Pod도 같은 Secret을 읽는다', 2, INK, { op: fade(u, 2.0) }); return; }
    // k4: 성공 흐름
    job(170, 80, 'my-app-migrate', { status: u > 0.8 ? 'Complete' : 'Running', w: 230 });
    const sw = E(u, 1.0, 2.0);
    for (let i = 0; i < 3; i++) { const on = sw > (i + 1) / 3 - 0.01; pods(450 + i * 56, 80, '', 1, on ? ACC : INK, { fill: on ? ACCBG : PANEL }); }
    tx(432, 132, sw > 0.99 ? '새 Pod 롤아웃 완료' : '롤아웃 중', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
    mono(40, 200, '$ helm upgrade my-app . --wait', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
    mono(40, 240, '$ helm test my-app', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); if (u > 2.3) check(260, 236, 9, pop(u, 2.3));
    sub(760, 200, '--wait = Ready까지 기다린다', fade(u, 0.6), { 'font-size': 14 }); }

  const quiz = [
    { q: '평범한 Job을 pre-install 훅으로 바꾸는 것은 무엇인가?',
      o: ['templates/hooks/ 폴더로 옮기기', 'metadata.annotations에 "helm.sh/hook": pre-install 한 줄', 'kind를 Hook으로 바꾸기'], a: 1,
      why: '훅도 결국 Kubernetes 리소스다. annotation 한 줄이 붙으면 Helm이 일반 리소스에서 빼서 정해진 시점에 따로 실행하고 완료를 기다린다.' },
    { q: 'helm install을 실행할 때 "helm.sh/hook": test가 붙은 Pod은 어떻게 되는가?',
      o: ['설치 직후 자동으로 실행된다', '실행되지 않고 helm test를 칠 때만 생성된다', 'post-install 훅과 함께 실행된다'], a: 1,
      why: 'test 훅은 helm test 명령 전용이다. 설치·업그레이드 흐름에는 끼어들지 않는다.' },
    { q: 'weight가 "-5", "0", "5"인 pre-install 훅 세 개 중 가장 먼저 도는 것은 무엇인가?',
      o: ['"5"', '"0"', '"-5"'], a: 2,
      why: 'weight는 오름차순이다. 가장 작은 -5가 먼저 돌고 끝나야 0, 그다음 5가 시작한다.' },
    { q: 'hook-delete-policy를 하나도 적지 않은 훅 Job은 어떻게 처리되는가?',
      o: ['before-hook-creation처럼 다음 실행 직전에 지워진다', '성공하자마자 지워진다', '영원히 남아 다음 실행이 이름 충돌로 실패한다'], a: 0,
      why: 'Helm 3은 정책이 비어 있으면 before-hook-creation을 기본으로 쓴다. 끝난 Job은 다음 실행 직전까지 남아 있다.' },
    { q: 'pre-upgrade 마이그레이션 훅이 실패하면 기본 helm upgrade는 어떻게 되는가?',
      o: ['upgrade가 실패로 끝나고 새 Deployment는 적용되지 않는다', '이전 리비전으로 자동 롤백된다', '훅을 건너뛰고 새 Deployment를 적용한다'], a: 0,
      why: 'pre-upgrade는 리소스를 갱신하기 전에 돈다. 실패하면 거기서 멈추고 기존 Pod이 계속 돈다. 자동 롤백은 --atomic을 붙였을 때다.' },
  ];

  const summary = [
    'annotation "helm.sh/hook" 한 줄이 Job을 설치 흐름 밖에서 정해진 시점에 도는 훅으로 만든다.',
    'install·upgrade·delete·rollback마다 pre와 post가 있고, test 훅은 helm test 때만 돈다.',
    '같은 시점의 훅은 문자열 weight 오름차순으로 하나씩 돌고, 다 끝나야 앱 설치가 시작된다.',
    '훅 Job은 끝나도 남는다. 정책을 비우면 다음 실행 직전에 지워지고, hook-succeeded로 바로 치운다.',
  ];
  const review = [
    { q: '차트에 포함된 postgresql 서브차트에 붙어 스키마를 만드는 pre-install 훅이 첫 설치 때마다 실패한다. 먼저 의심할 것은?',
      o: ['훅 시점에 같은 릴리스의 DB가 아직 만들어지지 않았다', 'weight를 따옴표 없이 적었다', 'restartPolicy가 Never라서 재시도가 없다'], a: 0,
      why: 'pre-install은 어떤 리소스도 만들기 전에 돈다. 같은 차트 안의 DB라면 그 시점엔 없으니 외부 DB를 쓰거나 post-install로 옮긴다.' },
    { q: 'hook-delete-policy를 hook-succeeded만 적었더니, 마이그레이션이 한 번 실패한 뒤 다음 upgrade에서 같은 이름 Job이 이미 있다는 에러가 났다. 고칠 방법은?',
      o: ['weight를 더 작게 바꾼다', '정책에 before-hook-creation을 함께 적는다', 'backoffLimit을 0으로 줄인다'], a: 1,
      why: '정책을 하나라도 적으면 기본값이 빠진다. 실패한 Job은 남아 있으니 before-hook-creation을 더해 새 훅 직전에 지우게 한다.' },
    { q: 'CI에서 helm upgrade가 마이그레이션 훅 실패로 끝났는데 릴리스는 이전 리비전으로 돌아가지 않았다. 자동으로 되돌리려면?',
      o: ['post-upgrade 훅을 하나 더 단다', 'activeDeadlineSeconds를 늘린다', 'helm upgrade에 --atomic을 붙인다'], a: 2,
      why: '훅이 실패하면 upgrade는 실패로 끝날 뿐이다. --atomic(Helm 4는 --rollback-on-failure)을 붙여야 실패 시 직전 성공 리비전으로 롤백한다.' },
  ];

  R.page({ title: '릴리스 생명주기와 훅', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
