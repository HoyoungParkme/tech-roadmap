/* IV-1-1 RBAC 접근 제어 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 요청(누가·무엇을·어디에)과 판정은 STEPS 의 request 를 읽는다. 판정은 rbac.go 규칙(p 6칸, glob 매칭, deny 우선,
 * policy.default 역할은 모든 로그인 사용자에게 붙는다)을 파이썬으로 재현해 맞췄다. 터미널 출력은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    person, cross, check, lock, terminal, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const reqChanged = (c) => !c.prev || !same(c.prev.request, c.beat.request);
  // 판정 도장
  function stamp(cx, cy, res, s) { const ok = res === 'allow';
    card(cx, cy, 112, 42, { rx: 8, stroke: ok ? GOOD : BAD, sw: 3, fill: ok ? GOODBG : BADBG, text: ok ? 'ALLOW' : 'DENY', fs: 18, fw: 800, color: ok ? GOOD : BAD, s, mono: true }); }
  // 가로로 이어지는 알약들. items [[글, 색]] → 끝 x
  function pills(x, y, items, o) { o = o || {}; let cx = x;
    items.forEach(([s, col], i) => { const w = tw(s, 14) + 26; pill(cx + w / 2, y, s, col, o.s ? o.s(i) : 1, { mono: true, fs: 14 }); cx += w + 8; });
    return cx; }
  // 아래 띠: 이 beat 의 요청과 판정
  function reqStrip(c, o) { o = o || {}; const r = c.beat.request, y = o.y || 386, ch = reqChanged(c), u = c.u;
    tx(30, y + 5, '요청', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const end = pills(72, y, [[r.user, INFO], [r.action, WARN], [r.resource, INK], [r.object, ACC]], { s: (i) => ch ? pop(u, 0.15 + i * 0.12) : 1 });
    mono(end + 4, y + 5, r.role, { 'font-size': 13.5, fill: MUT, opacity: ch ? fade(u, 0.7) : 1 });
    stamp(o.sx || 870, y, r.result, ch ? pop(u, 1.3) : 1); }
  // CSV 한 줄: toks 를 색칠해 쉼표로 잇는다
  const TCOL = [MUT, INFO, INK, WARN, ACC];
  function csv(x, y, toks, o) { o = o || {}; const parts = [];
    toks.forEach((t, i) => { const col = i === 5 ? (t === 'deny' ? BAD : GOOD) : (TCOL[i] || INK);
      parts.push([t, { fill: o.dim ? OFF : col, 'font-weight': o.hi === i ? 800 : 600 }]); if (i < toks.length - 1) parts.push([', ', { fill: MUT }]); });
    return spans(x, y, parts, { 'font-size': o.fs || 14.5, opacity: o.op ?? 1 }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 왜 RBAC ----------
  const PPL = [['admin', 110], ['dev-alice', 260], ['ops-bob', 410]];
  function s1(t, c) { const { k, u } = c, rows = c.beat.rows;
    if (k <= 1) {
      PPL.forEach(([n, x], i) => { person(x, 96, n, {});
        const role = k === 0 ? 'role:admin' : (i === 0 ? 'role:admin' : '(배정 전)'), col = role === 'role:admin' ? BAD : INFO;
        pill(x, 170, role, col, k === 1 && i ? pop(u, 0.4 + i * 0.2) : 1, { mono: true, fs: 13.5 }); });
      const acc = [260, 268];
      if (k === 0) { PPL.forEach(([, x], i) => grow(x, 186, acc[0], acc[1] - 22, E(u, 0.2 + i * 0.2, 1.0 + i * 0.2), BAD, { plain: true }));
        card(acc[0], acc[1], 200, 44, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, text: 'admin 계정 하나', fs: 15, color: BAD, s: pop(u, 0.9) }); }
      else { card(acc[0], acc[1], 300, 52, { rx: 10, stroke: INFO, sw: 2, text: '누가 · 무엇을 · 어떻게', fs: 16, color: INFO, s: pop(u, 0.3) });
        sub(acc[0], acc[1] + 46, '각자에게 필요한 만큼만 정책으로 적는다', fade(u, 0.9)); }
      // 오른쪽: 감사 로그
      const lines = k === 0 ? ['$ 감사 로그', 'admin   delete  payment', 'admin   sync    web', 'admin   delete  api', ['→ 세 명 중 누구인지 모른다', 'var(--bad)']]
        : ['$ 감사 로그', 'dev-alice  sync  web   거부', ['→ 사람마다 따로 남는다', 'var(--good)']];
      terminal(540, 40, 390, 230, lines, k === 0 ? 1 + E(u, 0.3, 2.2) * 4 : 1 + E(u, 0.6, 1.8) * 2, { fs: 14 });
      reqStrip(c); return; }
    if (k <= 3) {   // p 줄의 6칸
      const cols = [['p', '고정 접두어', MUT], ['subject', '누가', INFO], ['resource', '어디에', INK], ['action', '무엇을', WARN], ['object', '어느 대상', ACC], ['effect', 'allow / deny', GOOD]];
      const fill = ['p', 'role:이름', 'applications', 'sync', '<project>/<app>', 'allow'];
      const W = [70, 150, 150, 110, 180, 110], x0 = 50; let x = x0;
      tx(x0, 60, '권한 규칙 한 줄 = 칸 6개', { 'font-size': 16, 'font-weight': 800 });
      cols.forEach(([name, what, col], i) => { const w = W[i], cx = x + w / 2, known = i === 0 || i === 5, on = known || k === 3;
        const s = known ? (k === 2 ? pop(u, 0.2 + (i ? 0.4 : 0)) : 1) : (k === 3 ? pop(u, 0.2 + (i - 1) * 0.3) : 1);
        card(cx, 140, w - 8, 56, { rx: 8, stroke: on ? col : GRID, sw: on ? 2.5 : 1.8, dash: on ? null : '6 5', fill: on ? PANEL : SOFT,
          text: on ? fill[i] : '?', fs: i === 4 ? 13.5 : 15, mono: true, color: on ? col : OFF, s: on ? s : 1 });
        mono(cx, 196, name, { 'font-size': 14, 'font-weight': 700, fill: on ? col : MUT, 'text-anchor': 'middle' });
        const lop = on ? (k === 3 && !known ? fade(u, 0.5 + (i - 1) * 0.3) : 1) : 0.35;
        grow(cx, 206, cx, 236, on ? 1 : 0.6, on ? col : GRID, { plain: true });
        tx(cx, 256, what, { 'font-size': 14, 'text-anchor': 'middle', fill: on ? INK : OFF, 'font-weight': 600, opacity: lop });
        x += w; });
      if (k === 2) note(50, 312, '맨 뒤 effect가 허용인지 거부인지 정한다', fade(u, 1.2));
      if (k === 3) note(50, 312, '네 칸을 채우면 "누가 무엇을 어디에" 한 줄이 된다', fade(u, 1.6));
      reqStrip(c); return; }
    if (k === 4) {   // 내장 역할 둘
      const acts = ['get', 'create', 'update', 'delete', 'sync'], ress = ['applications', 'projects', 'clusters'];
      [['role:admin', 230, BAD, () => true], ['role:readonly', 640, GOOD, (a) => a === 'get']].forEach(([name, cx, col, okf], j) => {
        const s = pop(u, 0.2 + j * 0.4); card(cx, 160, 360, 200, { rx: 12, stroke: col, sw: 2.5, s });
        mono(cx, 84, name, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
        acts.forEach((a, i) => mono(cx - 48 + i * 48, 116, a, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }));
        ress.forEach((r, ri) => { tx(cx - 170, 148 + ri * 34, r, { 'font-size': 13.5, fill: MUT, opacity: s, class: 'mono' });
          acts.forEach((a, i) => { const on = okf(a), f = E(u, 0.6 + j * 0.4 + (ri * 5 + i) * 0.03, 1.0 + j * 0.4 + (ri * 5 + i) * 0.03);
            el('rect', { x: cx - 60 + i * 48, y: 132 + ri * 34, width: 24, height: 22, rx: 4, fill: on ? col : SOFT, opacity: on ? 0.2 + 0.65 * f : 1, stroke: GRID }); }); }); });
      person(640, 302, null, { s: pop(u, 1.4) }); pill(720, 300, 'dev-alice', INFO, pop(u, 1.5), { mono: true, fs: 13.5 });
      reqStrip(c); return; }
    // k5: 사고 반경
    const apps = []; for (let i = 0; i < 18; i++) apps.push([480 + (i % 6) * 62 - 155, 110 + Math.floor(i / 6) * 70]);
    const who = [['admin', 'role:admin', 230, BAD, 18], ['ops-bob', 'role:deployer · sync', 120, WARN, 6], ['dev-alice', 'role:readonly · get', 70, GOOD, 0]];
    who.forEach(([n, r, rad, col], i) => { const rr = rad * E(u, 0.2 + i * 0.5, 1.0 + i * 0.5);
      el('ellipse', { cx: 480, cy: 180, rx: rr * 1.5, ry: rr * 0.75, fill: col, opacity: 0.08, stroke: col, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); });
    apps.forEach(([x, y], i) => { el('rect', { x: x - 14, y: y - 12, width: 28, height: 24, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 1.6 }); });
    who.forEach(([n, r, rad, col], i) => { const y = 58 + i * 26; tx(40, y, n, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.5), class: 'mono' });
      tx(140, y, r, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); });
    note(620, 330, '실수가 나도 그 사람의 범위 안에서 끝난다', fade(u, 2.0), { 'text-anchor': 'middle' });
    reqStrip(c); }

  // ---------- 2. policy.csv 문법 ----------
  const DOC = [
    [0, 'kind: ConfigMap'], [0, 'metadata:  name: argocd-rbac-cm'], [0, '          namespace: argocd'], [0, 'data:'],
    [1, '  policy.default: role:readonly'],
    [2, '  policy.csv: |'], [2, '    # p, subject, resource, action, object, effect'],
    [3, ['p', 'role:deployer', 'applications', 'get', 'default/*', 'allow']], [3, ['p', 'role:deployer', 'applications', 'sync', 'default/*', 'allow']],
    [4, ['p', 'role:viewer', 'applications', 'get', '*/*', 'allow']],
    [5, ['g', 'ops-bob', 'role:deployer']], [5, ['g', 'dev-team', 'role:viewer']],
  ];
  function s2(t, c) { const { k, u } = c, r = c.beat.request;
    el('rect', { x: 24, y: 24, width: 556, height: 344, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(40, 48, 'argocd-rbac-cm.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    // 이 beat 에 맞는 줄 (판정에 쓰인 줄)
    const hit = k === 3 ? 8 : k === 4 ? 9 : k === 5 ? 10 : k === 6 ? 8 : k === 1 ? 4 : -1;
    DOC.forEach(([b, s], i) => { if (b > k) return; const y = 78 + i * 24, isNew = b === k, op = isNew ? fade(u, 0.2 + (i % 3) * 0.25) : 1;
      if (i === hit) el('rect', { x: 32, y: y - 16, width: 540, height: 22, rx: 4, fill: k === 4 ? WARNBG : ACCBG, opacity: fade(u, 1.0) });
      if (Array.isArray(s)) csv(44, y, s, { fs: 14, op, hi: k === 3 && i === 8 ? 3 : k === 4 && i === 9 ? 3 : null });
      else mono(40, y, s, { 'font-size': 14, fill: s.includes('#') ? MUT : INK, opacity: op, 'font-weight': s.includes('policy.default') ? 700 : 500 }); });
    if (k === 2) { ['p', 'subject', 'resource', 'action', 'object', 'effect'].forEach((n, i) => { const x = 60 + i * 84;
      card(x + 30, 260, 76, 34, { rx: 6, text: n, fs: 13.5, mono: true, stroke: i === 5 ? GOOD : (TCOL[i] || INK), color: i === 5 ? GOOD : (TCOL[i] || INK), s: pop(u, 0.5 + i * 0.15) }); });
      note(44, 312, '칸은 반드시 6개다. effect를 빼면 정책 오류가 난다', fade(u, 1.6), { fill: BAD }); }
    // 오른쪽: argocd-server 가 판정
    if (k < 6) {
      card(760, 70, 300, 44, { rx: 10, stroke: INK, text: 'argocd-server (판정)', fs: 15 });
      for (let i = 0; i < 3; i++) dot([[580, 120], [610, 90], [612, 70]], (t * 0.5 + i / 3) % 1, OFF, 4);
      tx(620, 150, '요청', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const ch = reqChanged(c);
      [['subject', r.user, INFO], ['action', r.action, WARN], ['object', r.object, ACC], ['role', r.role, INK]].forEach(([a, b, col], i) => { const y = 180 + i * 30;
        tx(620, y, a, { 'font-size': 13.5, fill: MUT }); mono(700, y, b, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: ch ? fade(u, 0.2 + i * 0.15) : 1 }); });
      stamp(760, 318, r.result, ch ? pop(u, 1.3) : 1);
      if (k === 4) sub(760, 356, 'sync를 허용하는 줄이 없다', fade(u, 1.6), { fill: WARN, 'font-weight': 700 });
      if (k === 5) sub(760, 356, 'g 줄로 deployer 권한을 상속', fade(u, 1.6), { fill: ACC, 'font-weight': 700 });
      return; }
    terminal(600, 40, 340, 250, ['$ kubectl apply -f argocd-rbac-cm.yaml', 'configmap/argocd-rbac-cm configured', '  (argocd-server가 바로 다시 읽음)', '$ argocd account can-i sync \\', '    applications default/web', ['yes', 'var(--good)']], 1 + E(u, 0.2, 2.4) * 5, { fs: 13.5 });
    sub(770, 312, '출력은 예시', fade(u, 2.2)); stamp(770, 350, r.result, pop(u, 2.0)); }

  // ---------- 3. 리소스와 액션 ----------
  const ACTS = ['get', 'create', 'update', 'delete', 'sync', 'override', 'action'];
  const RES = [['applications', 'gcudsoa'], ['applicationsets', 'gcud'], ['projects', 'gcud'], ['clusters', 'gcud'], ['repositories', 'gcud'],
    ['accounts', 'gu'], ['certificates', 'gcd'], ['logs', 'g'], ['exec', 'c']];
  const AK = { get: 'g', create: 'c', update: 'u', delete: 'd', sync: 's', override: 'o', action: 'a' };
  const ROLES = [['role:viewer', '*/*'], ['role:deployer', 'team-a/*'], ['role:ci', 'team-a/* · */*']];
  const RCOL = [['get', 'applications'], ['get', 'logs'], ['create', 'applications'], ['update', 'applications'], ['sync', 'applications'], ['delete', 'applications'], ['create', 'exec']];
  const GRANT = { 2: [[0, 0, 1], [0, 1, 1]], 3: [[1, 0, 1], [1, 4, 1]], 4: [[2, 2, 1], [2, 3, 1]], 5: [[2, 5, -1], [2, 6, -1]] };
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const x0 = 230, y0 = 70, cw = 54, rh = 30;
      ACTS.forEach((a, i) => mono(x0 + i * cw + cw / 2, y0 - 12, a, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 }));
      RES.forEach(([r, acts], ri) => { const show = ri < 5 || k === 1, y = y0 + ri * rh, isNew = k === 1 && ri >= 5; if (!show) return;
        const op = isNew ? fade(u, 0.2 + (ri - 5) * 0.3) : 1, danger = r === 'exec';
        mono(x0 - 12, y + 19, r, { 'font-size': 14, 'text-anchor': 'end', fill: danger ? BAD : INK, 'font-weight': 700, opacity: op });
        ACTS.forEach((a, i) => { const on = acts.includes(AK[a]), d = (isNew ? 0.3 + (ri - 5) * 0.3 : 0.2 + ri * 0.12) + i * 0.04, f = k === 0 || isNew ? E(u, d, d + 0.4) : 1;
          el('rect', { x: x0 + i * cw + 6, y: y + 4, width: cw - 12, height: rh - 8, rx: 5, fill: on ? (danger ? BAD : ACC) : SOFT, opacity: on ? 0.15 + 0.7 * f : op, stroke: GRID }); }); });
      if (k === 0) { note(640, 120, 'applications만 sync · override', fade(u, 1.6)); note(640, 146, '나머지는 get · create · update · delete', fade(u, 1.8)); }
      else { card(780, 296, 250, 64, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s: pop(u, 1.3), text: 'exec create\n= 파드 셸로 들어가는 문', fs: 14.5, color: BAD });
        note(640, 120, 'logs는 get 하나뿐, 바꾸는 것이 없다', fade(u, 0.8)); }
      return; }
    if (k <= 5) { const x0 = 250, y0 = 96, cw = 74, rh = 62;
      RCOL.forEach(([a, r], i) => { mono(x0 + i * cw + cw / 2, y0 - 34, a, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: a === 'delete' || r === 'exec' ? BAD : INK });
        mono(x0 + i * cw + cw / 2, y0 - 14, r === 'exec' ? 'exec' : r === 'logs' ? 'logs' : 'apps', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      ROLES.forEach(([n, obj], ri) => { const y = y0 + ri * rh; mono(x0 - 14, y + 26, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' });
        mono(x0 - 14, y + 46, obj, { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end' });
        RCOL.forEach((_, i) => el('rect', { x: x0 + i * cw + 5, y: y + 6, width: cw - 10, height: rh - 12, rx: 8, fill: SOFT, stroke: GRID })); });
      for (let b = 2; b <= k; b++) (GRANT[b] || []).forEach(([ri, ci, v], j) => { const now = b === k, sc = now ? pop(u, 0.3 + j * 0.3) : 1, cx = x0 + ci * cw + cw / 2, cy = y0 + ri * rh + rh / 2;
        if (v > 0) { el('rect', { x: cx - cw / 2 + 5, y: cy - rh / 2 + 6, width: cw - 10, height: rh - 12, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: sc }); check(cx, cy, 11, sc); }
        else { el('rect', { x: cx - cw / 2 + 5, y: cy - rh / 2 + 6, width: cw - 10, height: rh - 12, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: sc }); cross(cx, cy, 10, sc); mono(cx, cy + 24, 'deny', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: sc }); } });
      if (k === 2) note(250, 300, '조회는 상태를 안 바꾼다. 온콜에게 넓게 연다', fade(u, 1.2));
      if (k === 3) note(250, 300, 'sync는 team-a/* 안에서만', fade(u, 1.2));
      if (k === 4) note(250, 300, 'CI 봇은 만들고 고치는 데까지', fade(u, 1.2));
      if (k === 5) note(250, 300, 'deny를 박아 두면 넓은 allow가 생겨도 안 뚫린다', fade(u, 1.2), { fill: BAD });
      reqStrip(c); return; }
    // k6: 위험도 사다리
    const L = [80, 880], y = 150;
    el('rect', { x: L[0], y: y - 6, width: L[1] - L[0], height: 12, rx: 6, fill: SOFT });
    el('rect', { x: L[0], y: y - 6, width: (L[1] - L[0]) * E(u, 0.2, 1.4), height: 12, rx: 6, fill: WARN, opacity: 0.5 });
    tx(L[0], y - 22, '안전', { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); tx(L[1], y - 22, '위험', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'end' });
    [['get / list', '넓게 허용', GOOD, 0.08], ['sync', '배포 담당자만', WARN, 0.36], ['delete', '운영 리드 극소수', BAD, 0.58], ['override', '거의 금지', BAD, 0.76], ['exec', '원칙 금지', BAD, 0.94]].forEach(([a, w, col, f], i) => {
      const x = lerp(L[0], L[1], f), s = pop(u, 0.4 + i * 0.3); el('circle', { cx: x, cy: y, r: 9 * s, fill: col });
      mono(x, y + 40, a, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); tx(x, y + 64, w, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    card(480, 300, 420, 48, { rx: 10, stroke: BAD, text: 'clusters create → 인프라 팀만', fs: 15, color: BAD, s: pop(u, 2.0) });
    reqStrip(c); }

  // ---------- 4. 프로젝트 스코프 ----------
  const ZA = { x: 40, y: 70, w: 270, h: 200, name: 'team-a', apps: [['web', 110], ['api', 240]] };
  const ZB = { x: 340, y: 70, w: 270, h: 200, name: 'team-b', apps: [['api', 410], ['worker', 540]] };
  function zoneDraw(Z, o) { o = o || {};
    el('rect', { x: Z.x, y: Z.y, width: Z.w, height: Z.h, rx: 14, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash });
    mono(Z.x + 14, Z.y + 24, 'project ' + Z.name, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    Z.apps.forEach(([n, x]) => card(x, Z.y + 110, 92, 50, { rx: 8, text: n, fs: 15, mono: true, stroke: INK })); }
  const appPos = (obj) => { const [p, a] = obj.split('/'), Z = p === 'team-a' ? ZA : ZB, ap = Z.apps.find((x) => x[0] === a) || Z.apps[0]; return [ap[1], Z.y + 110, Z]; };
  function s4(t, c) { const { k, u } = c, r = c.beat.request;
    zoneDraw(ZA, { stroke: k >= 1 && k !== 2 ? ACC : GRID, sw: k >= 1 ? 2.5 : 2 }); zoneDraw(ZB, { stroke: k === 2 ? ACC : GRID });
    if (k === 0) { [['team-a/*', { x: ZA.x - 6, y: ZA.y - 6, width: ZA.w + 12, height: ZA.h + 12, rx: 18, stroke: ACC }, 0.3],
        ['team-a/web', { x: 58, y: 145, width: 104, height: 70, rx: 12, stroke: INFO }, 1.0],
        ['*/*', { x: 28, y: 52, width: 594, height: 230, rx: 20, stroke: WARN, 'stroke-dasharray': '8 6' }, 1.7]].forEach(([n, a0, a], i) => {
        if (u < a) return; el('rect', Object.assign({ fill: 'none', 'stroke-width': 3, opacity: fade(u, a, 0.3) }, a0));
        mono(660, 120 + i * 60, n, { 'font-size': 17, 'font-weight': 800, fill: [ACC, INFO, WARN][i], opacity: fade(u, a) });
        tx(660, 142 + i * 60, ['team-a의 모든 앱', '앱 하나만', '전 프로젝트 · 전 앱'][i], { 'font-size': 13.5, fill: MUT, opacity: fade(u, a) }); });
      reqStrip(c); return; }
    // 오른쪽: 사람과 역할
    const who = r.user === 'bob' ? ['bob', 'role:team-b-dev'] : ['alice', 'role:team-a-dev'];
    person(760, 120, who[0], {}); pill(760, 196, who[1], INFO, reqChanged(c) ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 });
    if (r.resource === 'applications' && k !== 5) { const [ax, ay, Z] = appPos(r.object), ok = r.result === 'allow', fu = seg(u, 0.4, 1.6);
      const end = ok ? [ax, ay - 30] : [Z.x + Z.w + 4, ay - 30], route = [[730, 140], [Z.x + Z.w + 40, 60], end];
      if (fu < 1) dot(route, fu, ok ? ACC : BAD, 8); else if (ok) el('circle', { cx: ax, cy: ay - 30, r: 8, fill: ACC });
      if (!ok) { cross(Z.x + Z.w - 4, ay - 30, 12, pop(u, 1.6)); if (k === 3) { sub(Z.x + Z.w / 2, Z.y + Z.h + 22, 'team-b 규칙 없음 → readonly 권한만', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); } } }
    if (k === 4 || k === 5) {   // AppProject 와 RBAC
      el('rect', { x: ZA.x - 6, y: ZA.y - 6, width: ZA.w + 12, height: ZA.h + 12, rx: 18, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: k === 4 ? fade(u, 0.3) : 1 });
      lock(ZA.x + ZA.w - 18, ZA.y + 26, true, ACC, k === 4 ? pop(u, 1.0) : 1);
      if (k === 4) { note(40, 316, 'AppProject 울타리: 무엇을 배포할 수 있나', fade(u, 0.5)); note(40, 342, 'RBAC object 자물쇠: 누가 만질 수 있나', fade(u, 1.2), { fill: ACC }); } }
    if (k === 5) { [['acme/team-a-*', 110, true], ['acme/team-b-api', 300, false]].forEach(([n, x, ok], i) => { const s = pop(u, 0.2 + i * 0.4);
        pill(x, 300, n, ok ? GOOD : BAD, s, { mono: true, fs: 13.5 }); grow(x, 285, ok ? 110 : 300, ok ? 245 : 280, ok ? E(u, 0.6, 1.4) : 0, GOOD);
        if (!ok) cross(x + 90, 300, 10, pop(u, 1.4)); });
      pill(175, 340, 'namespace team-a-*', ACC, pop(u, 1.6), { mono: true, fs: 13.5 });
      note(420, 340, '소스 repo · 대상 ns까지 묶는다', fade(u, 1.8)); }
    if (k === 6) { el('rect', { x: 28, y: 52, width: 594, height: 230, rx: 20, fill: 'none', stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: fade(u, 1.4) });
      cross(625, 56, 12, pop(u, 1.8)); mono(470, 306, '*/* 로 열면 울타리가 사라진다', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8), 'text-anchor': 'middle' });
      card(175, 330, 250, 46, { rx: 8, stroke: ACC, s: pop(u, 0.3), text: 'proj:team-a:developer', fs: 14, mono: true, color: ACC });
      pill(370, 330, 'SSO 그룹 acme:team-a', INFO, pop(u, 0.8), { fs: 13.5 }); }
    if (k === 1 || k === 2) sub(760, 248, r.result === 'allow' ? '자기 프로젝트 안에서는 자유' : '', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 });
    reqStrip(c); }

  // ---------- 5. SSO 그룹 매핑 ----------
  const GR = [['acme:platform-team', 'role:deployer', WARN], ['acme:sre', 'role:admin', BAD], ['acme:developers', 'role:viewer', GOOD]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['alice', 'role:deployer'], ['bob', 'role:viewer'], ['퇴사자 dan', 'role:deployer']].forEach(([n, rl], i) => { const y = 80 + i * 90, gone = i === 2;
        person(110, y, null, { op: gone ? lerp(1, 0.25, E(u, 1.0, 1.8)) : 1, stroke: gone ? BAD : INK }); tx(150, y + 6, n, { 'font-size': 15, 'font-weight': 700, fill: gone ? BAD : INK });
        grow(270, y, 560, y, E(u, 0.2 + i * 0.2, 0.9 + i * 0.2), gone ? BAD : MUT, { plain: true }); csv(280, y - 10, ['g', n === '퇴사자 dan' ? 'dan' : n, rl], { fs: 14, op: fade(u, 0.5 + i * 0.2) });
        pill(660, y, rl, INK, 1, { mono: true, fs: 13.5 }); });
      note(280, 356, '사람이 바뀔 때마다 이 줄을 고쳐야 한다', fade(u, 1.8), { fill: BAD });
      reqStrip(c, { y: 396 }); return; }
    if (k === 1) { tx(40, 60, 'oidc.config → requestedScopes', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      ['openid', 'profile', 'email', 'groups'].forEach((s, i) => pill(80 + i * 100, 100, s, i === 3 ? ACC : MUT, pop(u, 0.2 + i * 0.2), { mono: true, fs: 14 }));
      grow(240, 130, 560, 190, E(u, 1.0, 1.6), ACC);
      card(700, 200, 360, 160, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 1.4) });
      tx(536, 148, 'ID 토큰 (JWT)', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      mono(536, 186, '"email": "carol@acme"', { 'font-size': 14.5, opacity: fade(u, 1.6) });
      mono(536, 220, '"groups": [', { 'font-size': 14.5, opacity: fade(u, 1.8) }); mono(560, 248, '"acme:platform-team"', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) }); mono(536, 274, ']', { 'font-size': 14.5, opacity: fade(u, 2.0) });
      reqStrip(c, { y: 396 }); return; }
    // 그룹 → 역할 → 권한
    GR.forEach(([g, rl, col], i) => { const y = 80 + i * 78, ln = k === 2 ? E(u, 0.2 + i * 0.3, 0.9 + i * 0.3) : 1;
      el('rect', { x: 30, y: y - 26, width: 230, height: 52, rx: 10, fill: SOFT, stroke: GRID }); mono(145, y + 5, g, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      grow(262, y, 400, y, ln, MUT); pill(470, y, rl, col, 1, { mono: true, fs: 14 }); });
    // carol 은 platform-team 안
    const out = k === 4 ? E(u, 0.8, 1.8) : 0;
    el('circle', { cx: 52, cy: 56, r: 9, fill: INFO }); mono(68, 46, 'carol', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
    if (k === 4) { const gx = lerp(220, 120, out), gy = lerp(80, 330, out); el('circle', { cx: gx, cy: gy, r: 9, fill: BAD, opacity: 1 - out * 0.5 }); tx(gx + 16, gy + 5, '퇴사자', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 }); }
    if (k >= 3) { [['applications, get,  */*', 0], ['applications, sync, */*', 1]].forEach(([s, i]) => { const sc = k === 3 ? pop(u, 0.3 + i * 0.3) : 1;
        card(720, 70 + i * 38, 300, 30, { rx: 6, stroke: GOOD, text: s, fs: 13.5, mono: true, color: GOOD, s: sc }); });
      grow(540, 80, 568, 80, k === 3 ? E(u, 0.2, 0.6) : 1, GOOD, { plain: true }); }
    if (k === 2) note(560, 200, 'p 규칙이 아직 없어 판정은 거부', fade(u, 1.4), { fill: WARN });
    if (k === 4) { card(720, 220, 300, 52, { rx: 10, stroke: GOOD, text: 'argocd-rbac-cm은 그대로', fs: 15, color: GOOD, s: pop(u, 1.6) }); check(588, 220, 10, pop(u, 1.6)); sub(720, 262, '그룹에서 빠지면 다음 로그인부터 권한이 없다', fade(u, 2.0)); }
    if (k === 5) terminal(560, 170, 380, 160, ['$ argocd account can-i sync applications \'*/*\'', ['yes', 'var(--good)'], '$ argocd account get-user-info', 'Groups: acme:platform-team'], 1 + E(u, 0.2, 2.2) * 3, { fs: 13.5 });
    if (k === 6) { [['groups 스코프 누락', '토큰에 groups가 없다'], ['그룹 이름 오타', 'acme:platfrom-team']].forEach(([a, b], i) => { const y = 200 + i * 66, s = pop(u, 0.3 + i * 0.5);
        card(740, y, 320, 54, { rx: 10, stroke: BAD, sw: 2, s }); tx(600, y - 4, a, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: s }); mono(600, y + 18, b, { 'font-size': 13.5, fill: MUT, opacity: s }); });
      sub(740, 340, '에러 없이 권한만 사라진다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); }
    reqStrip(c, { y: 396 }); }

  // ---------- 6. 평가 순서 ----------
  const RULES = [['p', 'role:deployer', 'applications', '*', 'prod/*', 'allow'], ['p', 'role:deployer', 'applications', 'delete', 'prod/payment', 'deny']];
  const glob = (pat, s) => new RegExp('^' + pat.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\/]/g, '\\$&')).join('.*') + '$').test(s);
  const match = (rule, r) => glob(rule[3], r.action) && glob(rule[4], r.object);
  function ruleList(r, y0, o) { o = o || {}; RULES.forEach((rl, i) => { const y = y0 + i * 40, m = r.role === 'role:deployer' && match(rl, r), op = o.op ? o.op(i) : 1;
      el('rect', { x: 34, y: y - 22, width: 560, height: 32, rx: 6, fill: m ? (rl[5] === 'deny' ? BADBG : GOODBG) : PANEL, stroke: m ? (rl[5] === 'deny' ? BAD : GOOD) : GRID, 'stroke-width': m ? 2 : 1.5, opacity: op });
      csv(46, y, rl, { fs: 14, op, dim: !m && r.role === 'role:deployer' }); if (m) mono(604, y, '매칭', { 'font-size': 13.5, fill: rl[5] === 'deny' ? BAD : GOOD, 'font-weight': 700, opacity: op }); }); }
  function s6(t, c) { const { k, u } = c, r = c.beat.request;
    if (k === 0) { tx(40, 60, 'dave의 역할', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      card(170, 110, 230, 46, { rx: 10, stroke: GOOD, text: 'role:readonly', fs: 15, mono: true, color: GOOD, s: pop(u, 0.3) }); sub(170, 154, 'policy.default로 자동으로 붙음', fade(u, 0.6));
      ['get', 'delete'].forEach((a, i) => { const y = 220 + i * 50, ok = a === 'get';
        mono(80, y, 'applications ' + a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) });
        (ok ? check : cross)(320, y - 5, 10, pop(u, 1.0 + i * 0.4)); });
      note(480, 120, '다른 규칙이 없으면 이 권한만 남는다', fade(u, 1.6)); note(480, 146, 'policy.default는 deny로도 못 뺀다', fade(u, 1.9), { fill: MUT });
      reqStrip(c); return; }
    if (k === 1) {   // 저울
      const tilt = E(u, 0.9, 1.8) * 0.22, cx = 480, cy = 150, L = 200;
      el('path', { d: `M${cx - 30},300 L${cx},170 L${cx + 30},300 Z`, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      const ax = cx - L * Math.cos(tilt), ay = cy - L * Math.sin(tilt), bx = cx + L * Math.cos(tilt), by = cy + L * Math.sin(tilt);
      el('line', { x1: ax, y1: ay, x2: bx, y2: by, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
      card(ax, ay + 36, 130, 46, { rx: 8, stroke: GOOD, fill: GOODBG, text: 'allow', fs: 17, mono: true, color: GOOD, s: pop(u, 0.2) });
      card(bx, by + 36, 130, 46, { rx: 8, stroke: BAD, fill: BADBG, text: 'deny', fs: 17, mono: true, color: BAD, s: pop(u, 0.5) });
      note(480, 350, '둘 다 맞으면 deny가 이긴다', fade(u, 1.8), { 'text-anchor': 'middle', 'font-size': 17, fill: BAD });
      reqStrip(c); return; }
    if (k === 2) { tx(40, 60, 'policy.csv', { 'font-size': 14, 'font-weight': 700, fill: MUT }); ruleList(r, 104, { op: (i) => fade(u, 0.2 + i * 0.5) });
      note(40, 220, 'prod/* 는 넓게 열고', fade(u, 1.2), { fill: GOOD }); note(40, 248, 'prod/payment의 delete만 콕 막는다', fade(u, 1.5), { fill: BAD });
      reqStrip(c); return; }
    if (k === 3) { [['prod/payment', 'deny', 245], ['prod/web', 'allow', 715]].forEach(([obj, res, cx], j) => { const rq = { role: 'role:deployer', action: 'delete', object: obj }, s = pop(u, 0.2 + j * 0.6);
        card(cx, 70, 340, 40, { rx: 8, stroke: ACC, text: 'delete  ' + obj, fs: 15, mono: true, color: ACC, s });
        RULES.forEach((rl, i) => { const m = match(rl, rq), y = 126 + i * 46, op = fade(u, 0.5 + j * 0.6 + i * 0.2);
          card(cx, y, 340, 36, { rx: 6, stroke: m ? (rl[5] === 'deny' ? BAD : GOOD) : GRID, fill: m ? (rl[5] === 'deny' ? BADBG : GOODBG) : PANEL, text: rl[4] + ' → ' + rl[5], fs: 14, mono: true, color: m ? (rl[5] === 'deny' ? BAD : GOOD) : OFF, op }); });
        stamp(cx, 250, res, pop(u, 1.4 + j * 0.4)); });
      note(480, 320, 'object 한 칸이 판정을 가른다', fade(u, 2.2), { 'text-anchor': 'middle' });
      reqStrip(c); return; }
    if (k === 4) { const st = ['role 수집', 'p 규칙 탐색', 'deny 있나?', 'allow 있나?', '없으면 거부'], xs = st.map((_, i) => 110 + i * 185);
      st.forEach((s, i) => { card(xs[i], 140, 160, 56, { rx: 10, stroke: i === 2 ? BAD : INK, text: s, fs: 15, s: pop(u, 0.1 + i * 0.12) }); mono(xs[i], 96, String(i + 1), { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', 'font-weight': 800 });
        if (i < 4) grow(xs[i] + 82, 140, xs[i + 1] - 82, 140, E(u, 0.6, 0.9), MUT); });
      dot([[xs[0], 196], [xs[1], 196], [xs[2], 196]], seg(u, 0.9, 1.9), ACC, 9);
      if (u > 1.9) el('circle', { cx: xs[2], cy: 196, r: 9, fill: BAD });
      note(xs[2] - 70, 244, 'prod/payment delete는 3단계에서 거부', fade(u, 2.0), { fill: BAD });
      sub(xs[0], 186, '+ policy.default', fade(u, 0.5));
      reqStrip(c); return; }
    if (k === 5) { tx(40, 60, '콤마 하나가 빠진 줄', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const toks = ['p', 'role:deployer', 'applications', 'delete prod/payment', 'deny'];
      let x = 40; toks.forEach((s, i) => { const w = tw(s, 14) + 22, sc = pop(u, 0.2 + i * 0.15); card(x + w / 2, 104, w, 34, { rx: 6, text: s, fs: 14, mono: true, stroke: i === 3 ? BAD : GRID, color: i === 3 ? BAD : INK, s: sc });
        mono(x + w / 2, 142, String(i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: sc }); x += w + 8; });
      mono(x + 10, 110, '5칸 ≠ 6칸', { 'font-size': 16, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.2) });
      terminal(40, 176, 560, 110, ['argocd-server 로그', ['invalid RBAC policy: p, role:deployer, …', 'var(--bad)'], '→ 정책 전체가 적용되지 않는다'], 1 + E(u, 1.3, 2.4) * 2, { fs: 13.5 });
      card(780, 200, 260, 120, { rx: 10, stroke: GRID, s: pop(u, 1.6) }); tx(668, 168, 'Argo CD 화면', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(780, 220, '경고 없음', { 'font-size': 16, 'font-weight': 700, fill: OFF, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      reqStrip(c); return; }
    terminal(40, 50, 600, 200, ['$ argocd account can-i delete applications prod/payment', ['no', 'var(--bad)'], '$ argocd account can-i sync applications prod/web', ['yes', 'var(--good)']], 1 + E(u, 0.2, 2.2) * 3, { fs: 14 });
    sub(340, 274, '출력은 예시', fade(u, 2.0));
    card(800, 150, 230, 90, { rx: 10, stroke: ACC, text: 'CI에 넣는다\n정책 회귀 방지', fs: 15, color: ACC, s: pop(u, 1.8) });
    reqStrip(c); }

  const quiz = [
    { q: 'admin 계정 하나를 온 팀이 같이 쓸 때 생기는 가장 큰 문제는 무엇인가?',
      o: ['로그인 속도가 느려진다', '누가 무엇을 했는지 감사 로그로 가릴 수 없다', 'sync가 자동으로 꺼진다'], a: 1,
      why: '로그에는 전부 admin으로 찍힌다. 사람마다 필요한 권한만 주면 사고 반경도 좁아지고 기록도 사람별로 남는다.' },
    { q: 'p, role:deployer, applications, sync, default/* 처럼 effect 칸을 빼고 적으면 어떻게 되는가?',
      o: ['allow로 간주된다', 'deny로 간주된다', '칸 수가 6개가 아니라서 정책 오류가 난다'], a: 2,
      why: 'Argo CD는 p 줄이 6칸이 아니면 invalid RBAC policy 오류를 낸다. effect는 생략할 수 없다.' },
    { q: 'role:ci에 delete와 exec을 deny로 따로 적어 두는 이유는 무엇인가?',
      o: ['나중에 넓은 allow가 생겨도 이 두 액션은 막히게 하려고', 'deny를 쓰면 판정이 빨라져서', 'create를 쓰려면 deny가 있어야 해서'], a: 0,
      why: 'deny는 allow보다 우선한다. 위험한 액션을 deny로 박아 두면 다른 규칙이 넓어져도 뚫리지 않는다.' },
    { q: 'alice(role:team-a-dev)가 team-b/api를 sync 하면 판정은 무엇인가?',
      o: ['거부된다. team-b 규칙이 없어 기본 역할 readonly 권한만 남는다', '허용된다. 같은 클러스터라서', '에러가 나고 argocd-server가 멈춘다'], a: 0,
      why: 'object가 team-a/* 인 규칙만 있으니 team-b는 범위 밖이다. 에러는 없고 조회 권한만 남는다.' },
    { q: 'carol이 퇴사해 IdP의 acme:platform-team 그룹에서 빠졌다. argocd-rbac-cm에서 할 일은 무엇인가?',
      o: ['carol의 g 줄을 지운다', '아무것도 고치지 않는다', 'policy.default를 바꾼다'], a: 1,
      why: '권한은 그룹 → 역할로만 이어져 있다. 그룹에서 빠지면 다음 로그인부터 권한이 사라지고 정책은 그대로다.' },
    { q: 'allow prod/* 와 deny prod/payment(delete)가 있을 때 dave가 prod/payment를 delete 하면 결과는 무엇인가?',
      o: ['허용된다. allow가 먼저 적혀 있어서', '거부된다. 둘 다 맞으면 deny가 이긴다', '규칙 순서에 따라 달라진다'], a: 1,
      why: 'deny는 줄 순서와 상관없이 우선한다. 같은 delete라도 deny가 없는 prod/web은 허용된다.' },
  ];

  const summary = [
    'admin 하나를 같이 쓰면 누가 무엇을 했는지 가릴 수 없고 실수 한 번이 전체로 번진다.',
    '권한은 argocd-rbac-cm의 policy.csv에 p 줄(6칸)과 g 줄(3칸)로 적는다.',
    'object의 <project>/<app> 패턴이 범위를 정하고, */* 로 열면 프로젝트 분리가 사라진다.',
    'allow와 deny가 함께 맞으면 deny가 이기고, 배포 뒤에는 can-i로 판정을 확인한다.',
  ];
  const review = [
    { q: 'policy.csv를 고쳐 apply 했는데 아무 권한도 바뀌지 않았다. 먼저 의심할 것은?',
      o: ['argocd-server를 재시작하지 않았다', 'p 줄 하나의 칸 수가 틀려 정책 로드가 실패했다', 'policy.default가 readonly라서'], a: 1,
      why: '칸 수가 틀린 줄이 있으면 정책이 통째로 적용되지 않고 서버 로그에만 에러가 남는다. 변경 자체는 재시작 없이 다시 읽힌다.' },
    { q: 'team-a 개발자에게 자기 앱만 배포하게 하려 한다. 가장 알맞은 규칙은?',
      o: ['p, role:team-a-dev, applications, sync, */*, allow', 'p, role:team-a-dev, *, *, team-a, allow', 'p, role:team-a-dev, applications, sync, team-a/*, allow'], a: 2,
      why: 'object를 team-a/* 로 두어야 범위가 프로젝트에 묶인다. */* 는 모든 프로젝트를 연다.' },
    { q: 'SSO 그룹을 g 줄로 역할에 붙였는데 로그인한 사람에게 권한이 하나도 없다. 오류 메시지도 없다. 먼저 볼 것은?',
      o: ['토큰에 groups가 실려 오는지와 그룹 이름 철자', 'Argo CD 버전', 'Application의 sync 정책'], a: 0,
      why: 'groups 스코프 누락이나 그룹 이름 오타는 에러 없이 매칭만 빗나간다. get-user-info로 실제 그룹을 확인한다.' },
  ];

  R.page({ title: 'RBAC 접근 판정', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
