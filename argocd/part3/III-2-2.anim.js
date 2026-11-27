/* III-2-2 멀티 테넌시 설계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 네임스페이스·repo·역할 이름과 창 시간은 페이지 YAML 의 값이다. 권한 칸은 argocd-rbac-cm 을 규칙대로 평가한 결과다
 * (policy.default readonly 는 모두에게 더해지고, allow 가 하나라도 있고 deny 가 없으면 통과). 조합 수 3·200 은 곱셈 결과다.
 * acme/team-b-api, 다른 조직 repo, widgets CRD 이름은 그림을 위한 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, person, terminal, lock, clock, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function yml(x, y, w, lines, o) { o = o || {}; const lh = o.lh || 23, fs = o.fs || 14, n = o.n ?? lines.length;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    lines.slice(0, Math.ceil(n)).forEach((s, i) => { const yy = y + 12 + fs + i * lh, last = i === Math.ceil(n) - 1 && n % 1, part = last ? s.slice(0, Math.round(s.length * (n % 1))) : s;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: yy - fs, width: w - 8, height: lh, rx: 4, fill: ACCBG });
      const m = part.match(/^(\s*-?\s*)([\w.\-/"]+:)(.*)$/), parts = [];
      if (m && !part.trim().startsWith('#')) parts.push([m[1], {}], [m[2], { fill: INFO, 'font-weight': 700 }]);
      (m && !part.trim().startsWith('#') ? m[3] : part).split(/(\{\{[^}]+\}\})/).forEach((p) => { if (p) parts.push([p, /^\{\{/.test(p) ? { fill: ACC, 'font-weight': 800 } : { fill: part.trim().startsWith('#') ? MUT : INK }]); });
      R.spans(x + 14, yy, parts, { 'font-size': fs }); }); }
  // Argo CD 컨트롤 플레인 상자
  function argo(cx, cy, w, name, o) { o = o || {}; const g = card(cx, cy, w, o.h || 56, { rx: 12, stroke: o.col || ACC, fill: o.fill || ACCBG, sw: 2.4, s: o.s, op: o.op });
    el('circle', { cx: -w / 2 + 24, cy: 0, r: 11, fill: PANEL, stroke: o.col || ACC, 'stroke-width': 2.2 }, g); el('circle', { cx: -w / 2 + 24, cy: 0, r: 4, fill: o.col || ACC }, g);
    tx(-w / 2 + 44, 6, name, { 'font-size': 15, 'font-weight': 800, fill: o.col || ACC }, g); return g; }
  const nsBox = (x, y, w, h, name, o) => { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    mono(x + w / 2, y + h / 2 + 5, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: o.color || INK, opacity: o.op ?? 1 }); };

  // ---------- 1. 왜 멀티 테넌시 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { ['team-a', 'team-b', 'team-c'].forEach((n, i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3);
        argo(x, 90, 230, n + '-argocd', { s, col: INK, fill: PANEL });
        ['업그레이드', '백업', 'SSO·RBAC'].forEach((j, q) => { card(x, 160 + q * 46, 170, 36, { rx: 8, text: j, fs: 14, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.8 + i * 0.25 + q * 0.12) }); }); });
      tx(480, 352, '관리 포인트 × 3', { 'font-size': 24, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(480, 384, '팀이 늘면 같은 일이 팀 수만큼 반복된다 · 전체를 한눈에 볼 수 없다', fade(u, 2.2)); return; }
    // 공유 1대
    const sh = k === 1 ? E(u, 0.2, 1.0) : 1;
    if (k === 1) ['team-a', 'team-b', 'team-c'].forEach((n, i) => { const x = lerp(170 + i * 310, 480, sh); argo(x, 70, 230, n + '-argocd', { col: INK, fill: PANEL, op: 1 - sh }); });
    argo(480, 70, 300, '공유 Argo CD 1대', { op: k === 1 ? sh : 1 });
    const teams = ['team-a', 'team-b', 'platform'];
    teams.forEach((n, i) => { const x = 180 + i * 300;
      el('line', { x1: 480, y1: 98, x2: x, y2: 150, stroke: GRID, 'stroke-width': 2, opacity: k === 1 ? fade(u, 1.0) : 1 });
      card(x, 174, 200, 46, { rx: 10, text: n, fs: 15, mono: true, stroke: k === 4 ? ACC : INK, color: k === 4 ? ACC : INK, s: k === 1 ? pop(u, 1.0 + i * 0.2) : 1 }); });
    if (k === 1) { sub(480, 260, '격리 방법은 아직 정하지 않았다', fade(u, 1.8), { 'font-size': 15, fill: MUT, 'font-weight': 700 }); return; }
    if (k === 2) { [['AppProject', '배포 경계', ACC], ['ApplicationSet', '앱 자동 생성', INFO], ['RBAC', '사람 권한', WARN]].forEach(([a, b, col], i) => { const x = 180 + i * 300, s = pop(u, 0.3 + i * 0.4);
        el('rect', { x: x - 90, y: 230, width: 180, height: lerp(0, 150, E(u, 0.3 + i * 0.4, 1.0 + i * 0.4)), rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.4 });
        lbl(x, 268, a, fade(u, 0.8 + i * 0.4), { fill: col, 'font-size': 16 }); sub(x, 296, b, fade(u, 0.9 + i * 0.4), { 'font-size': 14.5, fill: INK, 'font-weight': 600 }); }); return; }
    if (k === 3) { [['A팀 → B팀 ns 배포', 'AppProject가 비었다', ACC], ['CRD·ClusterRole 충돌', '클러스터 리소스 무제한', ACC], ['아무나 sync·rollback', 'RBAC가 비었다', WARN]].forEach(([a, b, col], i) => { const x = 180 + i * 300, y = 300;
        card(x, y, 260, 84, { rx: 10, stroke: BAD, sw: 2.2, fill: BADBG, s: pop(u, 0.3 + i * 0.45) }); note(x - 116, y - 6, a, fade(u, 0.4 + i * 0.45), { fill: BAD }); sub(x, y + 22, '← ' + b, fade(u, 0.6 + i * 0.45), { fill: col, 'font-weight': 700 }); });
      return; }
    // k4: 공유하되 침범 불가
    [0, 1].forEach((i) => { const x = 330 + i * 300; el('line', { x1: x, y1: 140, x2: x, y2: lerp(140, 260, E(u, 0.3 + i * 0.3, 1.0 + i * 0.3)), stroke: ACC, 'stroke-width': 4, 'stroke-dasharray': '10 6' }); });
    ['AppProject 격리', 'AppProject 격리', '관리자 project'].forEach((s, i) => sub(180 + i * 300, 230, s, fade(u, 1.0 + i * 0.2), { 'font-weight': 700, fill: ACC }));
    tx(480, 340, '공유하되, 경계 밖은 손대지 못하게', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, opacity: fade(u, 1.6) }); }

  // ---------- 2. 팀별 AppProject ----------
  const NSX = [430, 560, 690], NSY = [170, 270];
  function cl2(c, o) { o = o || {}; const { k, u } = c;
    zone(380, 110, 550, 300, '공유 클러스터', { fill: SOFT });
    ['a', 'b'].forEach((t, r) => ['dev', 'stg', 'prd'].forEach((e, j) => nsBox(NSX[j] - 58 + 60, NSY[r] - 30, 116, 60, `${t}-${e}`, { stroke: t === 'a' && k >= 2 ? ACC : GRID, color: t === 'a' && k >= 2 ? ACC : INK })));
    // 클러스터 범위 띠
    el('rect', { x: 396, y: 340, width: 518, height: 52, rx: 8, fill: k >= 3 ? WARNBG : PANEL, stroke: k >= 3 ? WARN : GRID, 'stroke-width': 1.8 });
    tx(412, 371, '클러스터 범위: ClusterRole · CRD', { 'font-size': 14, 'font-weight': 700, fill: k >= 3 ? WARN : MUT });
    if (k >= 3) lock(890, 366, true, WARN, k === 3 ? pop(u, 0.3) : 1);
    // 팀 A 울타리
    if (k >= 2) { const g = k === 2 ? E(u, 0.2, 1.0) : 1; el('rect', { x: 408, y: 135, width: 422 * g, height: 76, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '10 5' });
      tx(828, 129, 'team-a', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: g }); } }
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: AppProject 규칙 목록 (쌓인다)
    const rules = [['sourceRepos', 'acme/team-a-*'], ['destinations', 'a-dev · a-stg · a-prd'], ['clusterResource', '[] 전부 금지'], ['namespaceResource', '* / * 허용'], ['syncWindow', '평일 09시 · 8h'], ['role developer', 'sync · get']];
    card(185, 50, 310, 44, { rx: 10, text: 'AppProject: team-a', fs: 15, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.2) : 1 });
    const nR = k === 7 ? 6 : Math.min(k, 6);
    for (let i = 0; i < 6; i++) { const y = 96 + i * 48, on = i < nR, fresh = on && i === k - 1;
      el('rect', { x: 30, y, width: 310, height: 40, rx: 8, fill: on ? PANEL : 'none', stroke: on ? (fresh ? ACC : GRID) : GRID, 'stroke-width': fresh ? 2.4 : 1.5, 'stroke-dasharray': on ? null : '5 4' });
      if (!on) continue; const op = fresh ? fade(u, 0.2) : 1;
      mono(44, y + 17, rules[i][0], { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: op }); tx(44, y + 34, rules[i][1], { 'font-size': 13.5, fill: INK, 'font-weight': 600, opacity: op }); }
    if (k === 0) sub(185, 400, '규칙이 없으면 아무것도 걸러 내지 않는다', fade(u, 0.8), { fill: MUT, 'font-weight': 700 });
    if (k === 5) { // 하루 시간 막대
      zone(380, 30, 550, 380, '공유 클러스터', { fill: SOFT });
      const X = (h) => 420 + h * 19;
      tx(420, 120, '평일 하루', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      el('rect', { x: X(0), y: 140, width: X(24) - X(0), height: 40, rx: 6, fill: WARNBG });
      el('rect', { x: X(9), y: 140, width: (X(17) - X(9)) * E(u, 0.3, 1.2), height: 40, rx: 6, fill: GOOD, opacity: 0.85 });
      [0, 9, 17, 24].forEach((h) => mono(X(h), 204, String(h), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      note(420, 250, '09~17시: 자동 sync', fade(u, 1.2), { fill: GOOD }); note(420, 282, '그 밖: 자동 sync 멈춤, 수동은 허용 (manualSync)', fade(u, 1.6), { fill: WARN });
      clock(860, 90, 26, (t * 0.2) % 1, INFO); return; }
    if (k === 6) { zone(380, 30, 550, 380, '공유 클러스터', { fill: SOFT });
      person(460, 160, 'acme:team-a', { s: pop(u, 0.2) }); grow(500, 150, 590, 150, E(u, 0.5, 0.9), ACC);
      card(680, 150, 170, 46, { rx: 10, text: 'developer', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.8) });
      [['sync', 'team-a/*', GOOD], ['get', 'team-a/*', GOOD]].forEach(([a, b, col], i) => { pill(620 + i * 130, 240, a + ' ' + b, col, pop(u, 1.3 + i * 0.3), { fs: 13.5, mono: true }); });
      sub(655, 320, '팀이 자기 프로젝트를 스스로 굴린다', fade(u, 1.9), { fill: ACC, 'font-weight': 700 }); return; }
    cl2(c);
    if (k === 1) { [['acme/team-a-web', true], ['acme/team-b-api', false], ['다른 조직 repo', false]].forEach(([s, ok], i) => { const x = 470 + i * 160, s0 = pop(u, 0.3 + i * 0.35);
        card(x, 80, 150, 34, { rx: 8, text: s, fs: 13.5, mono: true, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, s: s0 });
        if (!ok) cross(x + 66, 64, 7, pop(u, 0.8 + i * 0.35)); else check(x + 66, 64, 7, pop(u, 0.8)); }); }
    if (k === 2) { dot([[520, 80], [490, 170]], seg(u, 1.0, 1.5), GOOD, 6); dot([[520, 80], [530, 220]], seg(u, 1.4, 1.9), BAD, 6); if (u > 1.9) cross(530, 228, 10, pop(u, 1.9));
      sub(655, 80, 'b-* 로 가는 앱은 거부', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); }
    if (k === 3) { dot([[850, 70], [850, 345]], seg(u, 0.6, 1.3), BAD, 6); if (u > 1.3) cross(850, 352, 11, pop(u, 1.3)); sub(655, 80, 'ClusterRole 생성 → 거부', fade(u, 1.4), { fill: BAD, 'font-weight': 700 }); }
    if (k === 4) { ['Deployment', 'ConfigMap', 'Service'].forEach((s, i) => { card(500 + i * 130, 85, 118, 30, { rx: 6, text: s, fs: 13.5, mono: true, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.3 + i * 0.3) }); check(500 + i * 130 + 52, 68, 6, pop(u, 0.9 + i * 0.3)); });
      sub(655, 232, '자기 ns 안에서는 자유', fade(u, 1.4), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 7) { [['team-a repo 밖 소스', 80], ['a-* 밖 네임스페이스', 238], ['클러스터 범위 리소스', 318]].forEach(([s, y], i) => { cross(860, y, 8, pop(u, 0.3 + i * 0.3)); });
      sub(655, 80, '네 가지가 모두 거부 조건이다 (시간대 포함)', fade(u, 1.2), { fill: ACC, 'font-weight': 700 }); } }

  // ---------- 3. ApplicationSet 매트릭스 ----------
  const ENV = [['dev', 'main'], ['stg', 'main'], ['prd', 'v2.3.1']];
  function s3(t, c) { const { k, u } = c;
    if (k === 8) { tx(480, 46, '환경 5 × 리전 4 × 서비스 10', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      const n = Math.round(200 * E(u, 0.2, 2.0));
      for (let i = 0; i < n; i++) { const x = 160 + (i % 25) * 26, y = 80 + Math.floor(i / 25) * 30; el('rect', { x, y, width: 19, height: 20, rx: 3, fill: i < 3 ? ACC : WARN, opacity: 0.8 }); }
      mono(480, 362, `${n} Application`, { 'font-size': 26, 'font-weight': 800, fill: n > 150 ? BAD : WARN, 'text-anchor': 'middle' });
      sub(480, 396, 'generator 범위를 좁히고 project로 가둔다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    card(190, 40, 320, 40, { rx: 10, text: 'ApplicationSet: team-a-web', fs: 14.5, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { pill(190, 96, 'goTemplate: true', INFO, pop(u, 0.8), { fs: 14, mono: true }); mono(190, 150, '{{.env}}', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); sub(190, 180, '치환에 점(.)을 쓴다', fade(u, 1.6)); }
    // 목록 1: 환경
    const nEnv = k === 0 ? 0 : k === 1 ? 1 : 3;
    if (k >= 1) tx(40, 110, '목록 1 · env', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < nEnv; i++) { const y = 140 + i * 50, fresh = (k === 1 && i === 0) || (k === 2 && i > 0);
      card(130, y, 180, 40, { rx: 8, text: `${ENV[i][0]} · ${ENV[i][1]}`, fs: 14, mono: true, stroke: i === 2 ? WARN : INFO, color: i === 2 ? WARN : INFO, fill: i === 2 ? WARNBG : INFOBG, s: fresh ? pop(u, 0.3 + i * 0.3) : 1 }); }
    // 목록 2: 리전
    if (k >= 3) { tx(260, 110, '목록 2 · region', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); card(320, 140, 120, 40, { rx: 8, text: 'seoul', fs: 14, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: k === 3 ? pop(u, 0.3) : 1 });
      mono(320, 194, '× 1', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 0.8) : 1 }); }
    if (k === 1 || k === 2) sub(130, 330, k === 1 ? 'dev는 main을 따라간다' : 'prd만 태그로 고정', fade(u, 1.0), { fill: k === 1 ? INFO : WARN, 'font-weight': 700 });
    // 결과
    if (k >= 3) { const fence = k >= 5;
      if (fence) { const g = k === 5 ? E(u, 0.2, 1.0) : 1; el('rect', { x: 470, y: 60, width: 460 * g, height: 300, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '10 5' }); tx(490, 84, 'project: team-a', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, class: 'mono', opacity: g }); }
      counter(930, k >= 5 ? 400 : 60, k === 3 ? '조합 3 × 1' : '앱', 3);
      ENV.forEach(([e, r], i) => { const y = 130 + i * 76, nm = k >= 4 ? `a-web-${e}-seoul` : '';
        el('rect', { x: 500, y: y - 24, width: 270, height: 48, rx: 8, fill: PANEL, stroke: k === 7 ? GOOD : INK, 'stroke-width': 2, opacity: k === 3 ? fade(u, 0.6 + i * 0.3) : 1 });
        if (k === 3) mono(635, y + 5, `${e} × seoul`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.3) });
        if (nm) mono(515, y + (k >= 6 ? -2 : 5), nm, { 'font-size': 14.5, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.4 + i * 0.3) : 1 });
        if (k >= 6) mono(515, y + 17, `ns a-${e}`, { 'font-size': 13.5, fill: k === 6 ? ACC : MUT, 'font-weight': 700, opacity: k === 6 ? fade(u, 0.4 + i * 0.3) : 1 });
        if (k === 6) check(800, y, 8, pop(u, 1.0 + i * 0.3));
        if (k === 7) pill(850, y, 'Synced', GOOD, pop(u, 0.3 + i * 0.3), { fs: 13.5 });
        if (k === 4) dot([[220, 140 + i * 50], [500, y]], seg(u, 0.2 + i * 0.3, 0.7 + i * 0.3), ACC, 5); });
      if (k === 4) { yml(40, 300, 410, ['name: "a-web-{{.env}}-{{.region}}"'], { n: 1 }); sub(245, 380, '두 축을 다 넣어야 이름이 안 겹친다', fade(u, 1.4), { fill: BAD, 'font-weight': 700 }); }
      if (k === 5) { yml(40, 300, 410, ['project: team-a', 'repoURL: acme/team-a-web.git'], { n: lerp(1, 2, E(u, 0.1, 0.8)) }); }
      if (k === 6) { yml(40, 300, 410, ['namespace: "a-{{.env}}"', '# AppProject 화이트리스트 a-dev·a-stg·a-prd'], { n: 2 }); }
      if (k === 7) sub(245, 330, '목록에서 환경을 빼면 그 앱은 회수된다', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 }); } }
  function counter(x, y, label, v, col) { tx(x, y - 22, label, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, 'text-anchor': 'end' }); mono(x, y + 8, String(v), { 'font-size': 28, 'font-weight': 800, fill: col || ACC, 'text-anchor': 'end' }); }

  // ---------- 4. RBAC ----------
  const COLS = [['team-a 앱', 'get'], ['', 'sync'], ['', 'delete'], ['team-b 앱', 'get'], ['', 'sync'], ['', 'delete']];
  // 행: [이름(역할 → k≥5 에서 그룹), 칸 6개]. 1 허용, 0 거부(allow 없음), -1 명시적 deny, null 미정
  const R4 = {
    roles: ['role:team-a-dev', 'role:team-b-dev', 'role:platform-admin', '그 밖의 사람'],
    groups: ['acme:team-a', 'acme:team-b', 'acme:platform', '그 밖의 사람'],
    full: [[1, 1, -1, 1, 0, 0], [1, 0, 0, 1, 1, 0], [1, 1, 1, 1, 1, 1], [1, 0, 0, 1, 0, 0]],
  };
  function rowsAt(k) { // beat 별로 정책이 쌓인다 (policy.default readonly 는 k≥1 부터 모두에게)
    const ro = (k >= 1) ? [1, 0, 0, 1, 0, 0] : [null, null, null, null, null, null];
    const show = [k >= 2, k >= 3, k >= 4, k >= 1];
    return R4.full.map((v, i) => (show[i] ? (i === 3 ? ro : v) : null)); }
  function grid(c, only) { const { k, u } = c, rows = rowsAt(k).map((v, i) => (only != null && i !== only ? undefined : v)), prev = k > 0 ? rowsAt(k - 1) : [null, null, null, null], x0 = 330, cw = 96, y0 = 120, rh = 56;
    COLS.forEach(([g, a], j) => { if (g) tx(x0 + j * cw + cw * 1.5, y0 - 44, g, { 'font-size': 14, 'font-weight': 700, fill: j < 3 ? ACC : INFO, 'text-anchor': 'middle' }); mono(x0 + j * cw + cw / 2, y0 - 16, a, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' }); });
    el('line', { x1: x0 + 3 * cw, y1: y0 - 56, x2: x0 + 3 * cw, y2: y0 + 4 * rh, stroke: GRID, 'stroke-width': 2 });
    rows.forEach((v, i) => { if (v === undefined) return; const y = y0 + i * rh, name = k >= 5 ? R4.groups[i] : R4.roles[i], fresh = !prev[i] && v;
      if (!v) { el('rect', { x: x0 + 4, y: y + 4, width: 6 * cw - 8, height: rh - 10, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 4' }); mono(x0 - 14, y + rh / 2 + 4, name, { 'font-size': 14, fill: OFF, 'text-anchor': 'end' }); return; }
      const nameOp = k === 5 && i < 3 ? fade(u, 0.4 + i * 0.3) : fresh ? fade(u, 0.2) : 1;
      mono(x0 - 14, y + rh / 2 + 4, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: k === 5 && i < 3 ? ACC : INK, opacity: nameOp });
      v.forEach((s, j) => { const x = x0 + j * cw + 4, a = 0.3 + j * 0.12, changed = fresh || (prev[i] && prev[i][j] !== s), on = changed ? seg(u, a, a + 0.3) : 1, hi = k === 7 && ((i === 0 && (j === 1 || j === 4 || j === 2)));
        const fill = s === 1 ? GOODBG : s === -1 ? BAD : BADBG, stroke = s === 1 ? GOOD : BAD;
        el('rect', { x, y: y + 4, width: cw - 8, height: rh - 10, rx: 8, fill, stroke: hi ? INK : stroke, 'stroke-width': hi ? 3 : 1.6, opacity: on * (s === -1 ? 0.85 : 1) });
        if (on > 0.5) { if (s === 1) check(x + (cw - 8) / 2, y + rh / 2 - 1, 9, 1); else if (s === -1) mono(x + (cw - 8) / 2, y + rh / 2 + 4, 'deny', { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); else cross(x + (cw - 8) / 2, y + rh / 2 - 1, 7, 1); } }); });
    return { y0, rh }; }
  function s4(t, c) { const { k, u } = c;
    if (k === 8) { tx(480, 50, '세 가지 원칙', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['최소 권한', '개발자는 get · sync까지', GOOD], ['위험 동작은 관리자만', 'delete · project 수정은 platform-admin', WARN], ['애매하면 deny', '명시적 deny가 allow를 이긴다', BAD]].forEach(([a, b, col], i) => { const x = 170 + i * 310;
        card(x, 200, 270, 150, { rx: 14, stroke: col, sw: 2.4, s: pop(u, 0.3 + i * 0.4) }); lbl(x, 180, a, fade(u, 0.5 + i * 0.4), { fill: col, 'font-size': 17 }); sub(x, 214, b, fade(u, 0.7 + i * 0.4), { 'font-size': 14, fill: INK }); });
      return; }
    if (k === 6) { card(240, 150, 340, 170, { rx: 12, stroke: INFO, sw: 2.2, s: pop(u, 0.2) }); tx(90, 90, 'SSO 토큰 (예시)', { 'font-size': 14, 'font-weight': 700, fill: INFO });
      mono(90, 130, '"sub": "kim",', { 'font-size': 14.5 }); mono(90, 160, '"groups": ["acme:team-a"]', { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); el('rect', { x: 84, y: 142, width: 300, height: 26, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.8) });
      grow(420, 155, 560, 155, E(u, 1.0, 1.5), ACC); card(720, 155, 280, 56, { rx: 10, text: 'g, acme:team-a, role:team-a-dev', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.5) });
      yml(90, 280, 420, ['scopes: "[groups]"   # 생략해도 기본값이 같다'], { n: 1 }); sub(480, 390, '그룹을 다른 클레임에 담는 IdP면 scopes를 그 이름으로 바꾼다', fade(u, 1.8), { fill: INFO, 'font-weight': 700 }); return; }
    const gr = grid(c, k === 7 ? 0 : null);
    const txt = { 0: '정책이 아직 없다', 1: 'policy.default: role:readonly → 모든 사람에게 읽기가 더해진다', 2: 'team-a/* get·sync allow, delete는 명시적 deny', 3: 'team-b/* 도 같은 모양 · 남의 앱은 sync 불가 (조회는 readonly로 된다)', 4: 'platform-admin은 applications·projects·clusters 전권', 5: 'g, 그룹, 역할: 그룹이 있어야 역할이 사람에게 붙는다', 7: 'can-i로 확인: team-a 개발자 기준' }[k];
    sub(480, 384, txt, fade(u, 1.2), { fill: k === 2 || k === 3 ? WARN : k === 1 ? INFO : INK, 'font-weight': 700 });
    if (k === 0) { yml(20, 20, 280, ['kind: ConfigMap', 'name: argocd-rbac-cm'], { n: lerp(1, 2, E(u, 0.1, 0.6)) }); }
    if (k === 7) { terminal(20, 190, 920, 170, ['$ argocd account can-i sync applications team-a/a-web-prd-seoul', 'yes', '$ argocd account can-i sync applications team-b/b-api-prd', 'no', '$ argocd account can-i delete applications team-a/a-web-prd-seoul', 'no'].map((s) => (s === 'yes' ? [s, 'var(--good)'] : s === 'no' ? [s, '#f87171'] : s)), lerp(1, 6, E(u, 0.1, 2.0)), { fs: 13.5, lh: 21 }); }
    if (k === 5) { [0, 1, 2].forEach((i) => grow(40, gr.y0 + i * gr.rh + gr.rh / 2, 120, gr.y0 + i * gr.rh + gr.rh / 2, E(u, 0.3 + i * 0.3, 0.7 + i * 0.3), ACC)); person(40, 110, null, { s: pop(u, 0.2) }); } }

  // ---------- 5. 실무 함정 ----------
  function pit(c, title, col) { lbl(480, 40, title, 1, { fill: col || BAD, 'font-size': 18 }); }
  function s5(t, c) { const { k, u } = c;
    if (k >= 5) { const items = k === 5 ? ['모든 앱이 팀 AppProject 소속 (default 0건)', 'destinations가 팀 ns로 제한', 'clusterResourceWhitelist가 비었는지']
        : ['ApplicationSet 조합 수 미리 계산', 'can-i로 팀 간 차단 검증', 'sync window로 시간대 제한'];
      pit(c, k === 5 ? '배포 전 체크리스트 · 경계' : '배포 전 체크리스트 · 규모와 권한', ACC);
      items.forEach((s, i) => { const y = 120 + i * 80, a = 0.3 + i * 0.5, on = u > a + 0.3;
        el('rect', { x: 180, y: y - 22, width: 44, height: 44, rx: 8, fill: on ? GOODBG : PANEL, stroke: on ? GOOD : GRID, 'stroke-width': 2.4 }); if (on) check(202, y, 12, pop(u, a + 0.3));
        note(250, y + 7, s, fade(u, a), { 'font-size': 17 }); });
      sub(480, 395, k === 5 ? '경계 세 줄만 봐도 큰 사고 대부분이 걸러진다' : '느슨한 한 줄이 격리 전체를 무너뜨린다', fade(u, 2.0), { fill: k === 5 ? INFO : BAD, 'font-weight': 700 }); return; }
    const T = ['함정 1 · 경계가 느슨함', '함정 2 · ApplicationSet 폭발', '함정 3 · RBAC 미흡', '함정 4 · 공유 클러스터 충돌', '함정 5 · 야간 자동배포'][k];
    pit(c, T, k === 1 || k === 2 || k === 4 ? WARN : BAD);
    zone(30, 70, 430, 320, '증상', { fill: BADBG, color: BAD });
    zone(500, 70, 430, 320, '방어', { fill: GOODBG, color: GOOD });
    const def = [['default destinations 비우기', 'spec.project를 팀 project로', 'template.spec.project 지정'], ['generator 범위를 좁게', '필요한 조합만 명시', 'preserveResourcesOnDeletion'], ['policy.default: role:readonly', '위험 동작은 deny로 명시', 'can-i로 배포 전 검증'], ['clusterResourceWhitelist: []', 'CRD·Operator는 platform이', 'ns를 팀 prefix로 (a-*, b-*)'], ['syncWindows 업무시간만 allow', '창 밖은 수동 sync로']][k];
    def.forEach((s, i) => { const y = 140 + i * 70; check(530, y, 9, pop(u, 1.2 + i * 0.35)); note(552, y + 6, s, fade(u, 1.2 + i * 0.35), { 'font-size': 15.5 }); });
    if (k === 0) { card(140, 160, 150, 40, { rx: 8, text: 'project: default', fs: 13.5, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      ['a-dev', 'b-dev', 'payment'].forEach((n, i) => { const x = 120 + i * 120; el('rect', { x: x - 50, y: 290, width: 100, height: 44, rx: 8, fill: PANEL, stroke: BAD, 'stroke-width': 1.8 }); mono(x, 317, n, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
        grow(140, 182, x, 288, E(u, 0.4 + i * 0.25, 0.9 + i * 0.25), BAD); }); }
    if (k === 1) { const n = Math.round(lerp(3, 200, E(u, 0.2, 1.6))); for (let i = 0; i < Math.min(n, 120); i++) el('rect', { x: 60 + (i % 20) * 19, y: 110 + Math.floor(i / 20) * 22, width: 14, height: 16, rx: 2, fill: WARN, opacity: 0.75 });
      tx(245, 270, `${n} 앱 (5 × 4 × 10)`, { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); sub(245, 310, '컨트롤러·UI가 느려진다', fade(u, 1.6), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); }
    if (k === 2) { person(120, 190, '아무나', { s: pop(u, 0.2) }); grow(160, 180, 290, 180, E(u, 0.5, 1.0), BAD); card(360, 180, 140, 44, { rx: 8, text: 'team-b 앱', fs: 14, stroke: BAD, color: BAD, s: pop(u, 0.9) });
      ['sync', 'rollback', 'delete'].forEach((s, i) => pill(140 + i * 110, 300, s, BAD, pop(u, 1.0 + i * 0.2), { fs: 14, mono: true })); }
    if (k === 3) { [['team-a', 140], ['team-b', 350]].forEach(([n, x], i) => { card(x, 150, 140, 40, { rx: 8, text: n, fs: 14, mono: true, stroke: INK, s: pop(u, 0.2 + i * 0.2) }); grow(x, 172, 245, 270, E(u, 0.5 + i * 0.3, 1.0 + i * 0.3), BAD); });
      card(245, 300, 220, 44, { rx: 8, text: 'CRD widgets.acme.io', fs: 14, mono: true, stroke: BAD, color: BAD, fill: PANEL, s: pop(u, 1.3) }); sub(245, 350, '같은 이름을 두 팀이 만든다 (예시)', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); }
    if (k === 4) { clock(245, 200, 60, 3 / 12 + 0.02 * Math.sin(t * 2), BAD); tx(245, 300, '03:00 자동 sync', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); sub(245, 330, '대응할 사람이 없다', fade(u, 1.0), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); } }

  const quiz = [
    { q: '팀마다 Argo CD를 따로 세우는 방식의 가장 큰 문제는 무엇인가?',
      o: ['격리가 전혀 되지 않는다', '업그레이드·백업·SSO 설정이 팀 수만큼 반복되고 전체를 한눈에 못 본다', 'Application을 만들 수 없다'], a: 1,
      why: '격리는 되지만 운영 비용이 팀 수에 비례한다. 그래서 한 대를 공유하고 그 안을 세 축으로 나눈다.' },
    { q: 'team-a AppProject에서 b-dev 네임스페이스로 가는 앱은 왜 거부되는가?',
      o: ['destinations에 a-dev·a-stg·a-prd만 있어서', 'sourceRepos가 비어 있어서', 'syncWindow 밖이라서'], a: 0,
      why: 'destinations 화이트리스트 밖은 배포 자체가 거부된다. b-*는 목록에 없다.' },
    { q: 'team-a-web ApplicationSet에서 project: team-a 줄을 빼면 어떻게 되는가?',
      o: ['앱이 하나도 생기지 않는다', '생성된 앱이 default 프로젝트로 떨어져 경계가 풀린다', '이름이 겹쳐 앱이 덮인다'], a: 1,
      why: 'project를 비우면 default로 들어가고 default는 무엇이든 허용한다. 공장을 경계 안에 묶는 줄이 그 한 줄이다.' },
    { q: 'policy.default가 role:readonly일 때 team-a 개발자가 team-b 앱에 할 수 있는 것은?',
      o: ['아무것도 못 하고 목록에서도 안 보인다', 'sync까지 된다', '조회는 되지만 sync와 delete는 안 된다'], a: 2,
      why: '기본 역할은 모든 사람에게 더해지므로 조회(get)는 된다. sync·delete는 team-b/*에 대한 allow가 없어 거부된다.' },
    { q: '새벽 3시에 자동 sync가 돌아 장애 대응이 늦어졌다. 맞는 방어는 무엇인가?',
      o: ['syncWindows로 업무시간만 allow로 둔다', 'retry limit을 늘린다', 'clusterResourceWhitelist를 비운다'], a: 0,
      why: 'allow 창이 있으면 창 밖 자동 sync는 멈춘다. manualSync를 켜 두면 사람이 승인한 수동 sync는 나갈 수 있다.' },
  ];

  const summary = [
    '팀마다 Argo CD를 세우면 업그레이드와 SSO 설정이 팀 수만큼 반복된다. 한 대를 공유하고 안을 나눈다.',
    'AppProject는 repo와 네임스페이스, 클러스터 리소스, 배포 시간을 화이트리스트로 묶는 경계다.',
    'ApplicationSet은 경계 안에서 env × region 조합만큼 앱을 찍어 내고, project 한 줄로 경계에 묶인다.',
    'RBAC은 그룹을 역할에 붙여 권한을 나눈다. readonly 기본값은 모두에게 더해지고 deny가 allow를 이긴다.',
  ];
  const review = [
    { q: 'ApplicationSet이 만든 앱 하나가 b-prd 네임스페이스에 배포됐다. 그 앱의 project는 default였다. 먼저 고칠 곳은?',
      o: ['ApplicationSet template.spec.project를 team-a로 지정한다', 'argocd-rbac-cm의 policy.default를 바꾼다', 'syncWindows를 추가한다'], a: 0,
      why: 'template에 project를 적지 않으면 생성된 앱이 default로 떨어진다. team-a로 묶으면 destinations 관문이 b-prd를 막는다.' },
    { q: '환경 5개 × 리전 4개 × 서비스 10개로 matrix를 넓혔더니 UI가 느려졌다. 몇 개의 앱이 생겼고 무엇을 할까?',
      o: ['20개, 서비스를 더 늘린다', '200개, generator 범위를 좁혀 필요한 조합만 만든다', '50개, retry를 줄인다'], a: 1,
      why: '5 × 4 × 10 = 200개다. 곱셈은 금방 커지므로 필요한 조합만 명시하고 범위를 팀 단위로 좁힌다.' },
    { q: 'team-a 개발자가 실수로 자기 앱을 delete했다. 정책에는 team-a/* get·sync allow만 있고 deny 줄은 없었다. 가능한 원인은?',
      o: ['다른 정책(예: 넓은 글로벌 role)이 delete allow를 주고 있었다', 'policy.default readonly가 delete를 허용한다', 'scopes를 적지 않아서'], a: 0,
      why: 'allow가 하나라도 맞으면 통과한다. 다른 곳에서 delete가 열려 있었다면 막히지 않으므로, 위험 동작은 deny로 적어 두고 can-i로 확인한다.' },
  ];

  R.page({ title: '멀티 테넌시 경계', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
