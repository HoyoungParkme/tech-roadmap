/* III-1-1 Chart 의존성 (subchart) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    G, cross, check, lock, terminal, hbar, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- Helm 부품 ----------
  const ap = (k, n, u, a, d) => (k > n ? 1 : k === n ? pop(u, a, d) : 0);   // n 번째 beat 에 튀어나와 남는다
  const af = (k, n, u, a) => (k > n ? 1 : k === n ? fade(u, a) : 0);         // n 번째 beat 에 서서히 보이고 남는다
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  // YAML 한 줄: 키는 잉크, 값은 파랑, 주석은 회색, $ 명령은 굵게
  function yl(x, y, s, o) { o = o || {}; const fs = o.fs || 14, op = o.op ?? 1;
    if (!s) return;
    if (s.trim().startsWith('#')) return mono(x, y, s, { 'font-size': fs, fill: MUT, opacity: op });
    if (s.startsWith('$')) return mono(x, y, s, { 'font-size': fs, fill: o.kc || INK, 'font-weight': 700, opacity: op });
    const i = s.indexOf(':'), parts = i < 0 ? [[s, { fill: o.vc || INFO }]] : [[s.slice(0, i + 1), { fill: o.kc || INK, 'font-weight': 600 }], [s.slice(i + 1), { fill: o.vc || INFO }]];
    return R.spans(x, y, parts, { 'font-size': fs, opacity: op }); }
  // 차트 묶음(.tgz): 끈 두른 상자
  function tgz(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.stroke || INK, w = o.w || 30, h = o.h || 24;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 4, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: -w / 2, y1: -h / 2 + 8, x2: w / 2, y2: -h / 2 + 8, stroke: col, 'stroke-width': 1.6 }, g);
    el('rect', { x: -4, y: -h / 2, width: 8, height: 9, fill: col, opacity: 0.55 }, g);
    if (name) mono(w / 2 + 10, 5, name, { 'font-size': o.fs || 14, fill: o.color || INK, 'font-weight': 600 }, g);
    return g; }
  // 파일 트리: rows [{d, name, kind:'dir'|'file'|'tgz'|'lock', op, col, dash, note}]
  function tree(x, y, rows, o) { o = o || {}; const rh = o.rh || 22;
    rows.forEach((r, i) => { const op = r.op ?? 1; if (op <= 0) return; const yy = y + i * rh, xx = x + r.d * 22, col = r.col || INK;
      if (r.d > 0) el('path', { d: `M${xx - 14},${yy - rh + 6} V${yy - 4} H${xx - 4}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: op });
      if (r.kind === 'dir') el('path', { d: `M${xx},${yy - 11} h7 l3,3 h10 v12 h-20 z`, fill: SOFT, stroke: col, 'stroke-width': 1.6, opacity: op, 'stroke-dasharray': r.dash });
      else if (r.kind === 'tgz') tgz(xx + 10, yy - 4, null, { w: 20, h: 16, op, stroke: col });
      else el('path', { d: `M${xx + 2},${yy - 12} h11 l5,5 v12 h-16 z`, fill: PANEL, stroke: col, 'stroke-width': 1.6, opacity: op, 'stroke-dasharray': r.dash });
      mono(xx + 28, yy, r.name, { 'font-size': 14, fill: col, 'font-weight': r.kind === 'dir' ? 700 : 500, opacity: op });
      if (r.note) tx(xx + 40 + r.name.length * 8.4, yy, r.note, { 'font-size': 13.5, fill: r.ncol || MUT, opacity: op }); }); }
  // 코드 판: 제목 + YAML 줄들
  function codePanel(x, y, w, h, title, lines, o) { o = o || {}; const lh = o.lh || 24;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 22, title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    lines.forEach((ln, i) => { const L = typeof ln === 'string' ? { s: ln } : ln; const op = L.op ?? 1; if (op <= 0) return;
      if (L.hi) el('rect', { x: x + 6, y: y + 34 + i * lh, width: w - 12, height: lh - 2, rx: 5, fill: ACCBG, opacity: op });
      yl(x + 16, y + 51 + i * lh, L.s, { op, fs: L.fs || 14, kc: L.kc, vc: L.vc }); }); }

  // ---------- 1. 의존성 선언 ----------
  const CH = [['apiVersion: v2', 0], ['name: my-app', 0], ['version: 0.1.0', 0], ['appVersion: "1.0.0"', 0],
    ['icon: …/icon.png', 1], ['home: github.com/my-org/my-app', 1], ['maintainers: DevOps Team', 1],
    ['dependencies:', 2], ['  - name: postgresql', 2], ['    version: 13.2.0', 2], ['    repository: …/bitnami', 2],
    ['  - name: redis       # 18.1.0', 3], ['  - name: rabbitmq    # 12.5.0', 3]];
  const DEPS = [['postgresql', '13.2.0'], ['redis', '18.1.0'], ['rabbitmq', '12.5.0']];
  function repoZone(x, y, w, lit, o) { o = o || {};
    zone(x, y, w, 128, 'charts.bitnami.com/bitnami', { fill: SOFT, stroke: GRID, dash: '6 5', op: o.op });
    DEPS.forEach(([n, v], i) => { const cx = x + 66 + i * ((w - 40) / 3), on = lit(i);
      card(cx, y + 76, (w - 60) / 3, 58, { rx: 8, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.5, fill: on ? ACCBG : PANEL, op: o.op });
      tx(cx, y + 72, n, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: on ? ACC : MUT, opacity: o.op ?? 1 });
      mono(cx, y + 93, v, { 'text-anchor': 'middle', 'font-size': 13.5, fill: on ? INK : MUT, opacity: o.op ?? 1 }); }); }
  function s1(t, c) { const { k, u } = c;
    codePanel(20, 20, 410, 30 + 13 * 24 + 12, 'my-app/Chart.yaml', CH.map(([s, b], i) => ({ s, op: k > b ? 1 : k === b ? fade(u, 0.2 + (i - CH.findIndex((r) => r[1] === b)) * 0.22) : 0,
      hi: b === k, vc: b === 1 ? MUT : null, kc: b === 1 ? MUT : null })));
    if (k === 0) { const a = E(u, 1.0, 1.6), b = E(u, 1.5, 2.1);
      grow(170, 114, 536, 120, a, ACC); grow(215, 138, 536, 250, b, INFO);
      card(690, 120, 300, 70, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 1.2) }); mono(690, 113, 'version 0.1.0', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      sub(690, 138, '차트 버전 · 차트를 고치면 올린다', fade(u, 1.4), { fill: INK });
      card(690, 250, 300, 70, { rx: 12, stroke: INFO, fill: C.INFOBG, s: pop(u, 1.7) }); mono(690, 243, 'appVersion "1.0.0"', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) });
      sub(690, 268, '담긴 앱 버전 · 보통 이미지 태그', fade(u, 1.9), { fill: INK });
      sub(690, 340, 'apiVersion v2 = Helm 3 형식', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); }
    if (k === 1) { browser(690, 190, 380, 250, '차트 저장소 화면', { s: pop(u, 0.9) });
      el('circle', { cx: 548, cy: 120, r: 20, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.1) });
      tx(580, 116, 'my-app', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.1) }); mono(580, 136, '0.1.0', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1) });
      [['home', 'github.com/my-org/my-app'], ['sources', 'github.com/my-org/my-app'], ['maintainers', 'DevOps Team']].forEach(([a, b], i) => {
        tx(528, 182 + i * 30, a, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.3 + i * 0.2) }); mono(626, 182 + i * 30, b, { 'font-size': 13.5, opacity: fade(u, 1.3 + i * 0.2) }); });
      pill(690, 360, '렌더 결과에는 영향 없음', MUT, pop(u, 2.0), { fs: 14 }); }
    if (k >= 2) { const lit = (i) => (k === 2 ? i === 0 : true);
      repoZone(500, 20, 440, lit, { op: k >= 4 ? 0.55 : 1 });
      DEPS.forEach((d, i) => { if (!lit(i)) return; const g = k === 2 ? E(u, 0.7, 1.6) : k === 3 && i > 0 ? E(u, 0.4 + (i - 1) * 0.4, 1.2 + (i - 1) * 0.4) : 1;
        const fy = i === 0 ? 258 : 330 + (i - 1) * 24; grow(330, fy, 566 + i * 133, 128, g, ACC, { dash: '6 5', plain: true, op: k >= 4 ? 0.4 : 1 }); });
      if (k === 2) pill(720, 200, 'name · version · repository', ACC, pop(u, 1.6), { fs: 14, mono: true });
      if (k === 3) pill(720, 200, 'subchart 3개 선언', ACC, pop(u, 1.6), { fs: 14.5 });
      if (k <= 3) sub(720, 250, '선언만 했다 · 아직 아무것도 받지 않았다', k === 2 ? fade(u, 2.0) : 1, { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); }
    if (k >= 4) { const rows = [{ d: 0, name: 'my-app/', kind: 'dir' }, { d: 1, name: 'Chart.yaml', kind: 'file', col: ACC }, { d: 1, name: 'Chart.lock', kind: 'file', dash: '3 3', col: MUT, note: 'update 후 생긴다' },
        { d: 1, name: 'values.yaml', kind: 'file' }, { d: 1, name: 'templates/', kind: 'dir', note: 'deployment · service' }, { d: 1, name: 'charts/', kind: 'dir', note: k === 4 ? '비어 있다' : '', ncol: WARN }];
      if (k === 5) DEPS.forEach(([n, v]) => rows.push({ d: 2, name: `${n}-${v}.tgz`, kind: 'tgz', col: ACC }));
      rows.forEach((r, i) => { r.op = k === 4 ? fade(u, 0.2 + i * 0.25) : i < 6 ? 1 : fade(u, 1.1 + (i - 6) * 0.35); });
      tree(520, 190, rows, { rh: 23 });
      if (k === 5) DEPS.forEach(([n, v], i) => fly(566 + i * 133, 140, 860, 324 + i * 23, seg(u, 0.2 + i * 0.3, 1.2 + i * 0.3), `${n}.tgz`, { mono: true }));
      if (k === 5) pill(830, 400, 'vendoring', ACC, pop(u, 2.0), { fs: 14 }); } }

  // ---------- 2. helm dependency update ----------
  const T2 = ['$ cd my-app', '$ helm dependency update', 'Hang tight while we grab the latest…', '...Successfully got an update from "bitnami"', 'Saving 3 charts',
    'Downloading postgresql from repo …/bitnami', 'Downloading redis from repo …/bitnami', 'Downloading rabbitmq from repo …/bitnami', 'Deleting outdated charts'];
  const LS = ['$ helm dependency list', 'NAME        VERSION   STATUS', 'postgresql  13.2.0    ok', 'redis       18.1.0    ok', 'rabbitmq    12.5.0    ok'];
  const LOCK = ['dependencies:', '- name: postgresql', '  version: 13.2.0', '- name: redis', '  version: 18.1.0', '- name: rabbitmq', '  version: 12.5.0', 'digest: sha256:abc123def456789…', 'generated: "2026-05-20T10:00:00Z"'];
  const REPO2 = { x: 560, y: 20, w: 380 };
  function charts2(c, n, o) { o = o || {}; zone(20, 248, 470, 160, 'my-app/charts/', { fill: SOFT, stroke: o.hot ? ACC : GRID, sw: 2 });
    DEPS.slice(0, n).forEach(([nm, v], i) => tgz(56, 296 + i * 38, `${nm}-${v}.tgz`, { op: o.op ? o.op(i) : 1, s: o.s ? o.s(i) : 1 })); }
  function s2(t, c) { const { k, u } = c;
    // 저장소
    zone(REPO2.x, REPO2.y, REPO2.w, 112, 'charts.bitnami.com/bitnami', { fill: SOFT, stroke: GRID, dash: '6 5' });
    el('path', { d: `M${REPO2.x + 26},48 h20 l7,7 v26 h-27 z`, fill: PANEL, stroke: INFO, 'stroke-width': 2 }); mono(REPO2.x + 62, 70, 'index.yaml', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
    DEPS.forEach(([n], i) => tgz(REPO2.x + 196, 50 + i * 26, n, { w: 22, h: 17, fs: 13.5 }));
    if (k <= 1) { terminal(20, 20, 470, 214, k === 0 ? T2.slice(0, 2) : T2.slice(0, 9), k === 0 ? lerp(0.3, 2, E(u, 0.2, 1.4)) : lerp(2, 9, E(u, 0.2, 2.4)), { title: 'bash', fs: 13.5, lh: 19.5 }); }
    if (k === 0) { codePanel(520, 160, 420, 150, 'Chart.yaml', ['dependencies:', '  - postgresql 13.2.0', '  - redis 18.1.0', '  - rabbitmq 12.5.0'].map((s) => ({ s, op: fade(u, 1.0) })), { lh: 22 });
      grow(520, 230, 494, 120, E(u, 1.5, 2.2), ACC); sub(730, 340, '선언을 읽어 실제 파일로 바꾼다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      charts2(c, 0); sub(255, 340, '비어 있다', 1, { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); }
    if (k === 1) { const g1 = seg(u, 0.2, 0.7);
      dot([[490, 60], [REPO2.x + 40, 64]], g1, INFO, 7);
      fly(REPO2.x + 40, 64, 470, 120, seg(u, 0.7, 1.2), 'index.yaml', { fill: INFO, mono: true });
      charts2(c, 3, { op: (i) => fade(u, 1.5 + i * 0.3), s: (i) => pop(u, 1.4 + i * 0.3) });
      DEPS.forEach(([n], i) => fly(REPO2.x + 196, 50 + i * 26, 70, 296 + i * 38, seg(u, 1.1 + i * 0.3, 1.7 + i * 0.3), n + '.tgz', { mono: true }));
      const gx = 330, gy = 334, gone = E(u, 2.1, 2.6); tgz(gx, gy, '이전 .tgz', { op: 1 - gone * 0.7, stroke: MUT, fill: PANEL, color: MUT }); if (u > 2.1) cross(gx, gy, 12, pop(u, 2.1)); }
    if (k >= 2) charts2(c, 3, { hot: k === 2 });
    if (k === 2) { terminal(20, 20, 470, 214, ['$ tree charts/', 'charts/', '├── postgresql-13.2.0.tgz', '├── redis-18.1.0.tgz', '└── rabbitmq-12.5.0.tgz', '0 directories, 3 files'], lerp(1, 6, E(u, 0.2, 1.6)), { title: 'bash', fs: 13.5 });
      pill(370, 270, '이름-버전.tgz', ACC, pop(u, 1.8), { fs: 13.5, mono: true });
      card(730, 290, 360, 96, { rx: 10, stroke: GRID, text: 'charts/는 결과물\n보통 .gitignore, CI에서 다시 만든다', fs: 14.5, fw: 600, s: pop(u, 2.0) }); }
    if (k >= 3) { const n = k === 3 ? 3 : 9, sh = k === 3 ? lerp(0, 3, E(u, 0.4, 1.6)) : k === 4 ? lerp(3, 9, E(u, 0.2, 2.0)) : 9;
      el('rect', { x: 520, y: 150, width: 420, height: 258, rx: 10, fill: PANEL, stroke: k >= 4 ? ACC : GRID, 'stroke-width': 2 });
      mono(536, 174, 'Chart.lock', { 'font-size': 14.5, fill: ACC, 'font-weight': 800 }); lock(912, 168, k >= 4 && (k > 4 || u > 2.0), k >= 4 ? ACC : MUT, 0.8);
      LOCK.slice(0, Math.ceil(sh)).forEach((s, i) => { const f = i === Math.ceil(sh) - 1 && sh % 1 ? sh % 1 : 1; yl(540, 200 + i * 23, typed(s, f), { fs: 13.5, vc: i >= 7 ? WARN : INFO }); });
      if (k === 3) sub(730, 330, '범위로 적어도 여기엔 확정 버전', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      if (k === 3) terminal(20, 20, 470, 214, ['$ cat Chart.lock', '# 실제로 받은 버전을 적는다', '# package-lock.json과 같은 역할'], lerp(1, 3, E(u, 0.2, 1.2)), { title: 'bash', fs: 13.5 }); }
    if (k === 4) { terminal(20, 20, 470, 214, ['# digest = 의존성 목록 전체의 해시', '# Chart.yaml을 고치면 어긋난다', '$ helm dependency build', 'Error: the lock file (Chart.lock) is out', '  of sync with the dependencies file'], lerp(1, 5, E(u, 0.4, 2.4)), { title: 'bash', fs: 13.5 }); }
    if (k === 5) { terminal(20, 20, 470, 214, LS, lerp(1, 5, E(u, 0.2, 1.6)), { title: 'bash', fs: 13.5 });
      DEPS.forEach((d, i) => { if (u > 1.3 + i * 0.3) check(460, 296 + i * 38, 9, pop(u, 1.3 + i * 0.3)); });
      mono(400, 270, 'ok × 3', { 'font-size': 14.5, fill: GOOD, 'font-weight': 800, opacity: fade(u, 2.2) }); }
    if (k === 6) { const lanes = [['update', 'Chart.yaml', '버전 고르기', 'lock 새로 쓰기', WARN], ['build', 'Chart.lock', '적힌 버전 그대로', 'charts/ 채우기', GOOD]];
      lanes.forEach(([nm, a, b, d, col], i) => { const y = 56 + i * 92, s = pop(u, 0.2 + i * 0.6);
        pill(68, y, nm, col, s, { mono: true, fs: 15 });
        [a, b, d].forEach((tt, j) => { const x = 180 + j * 126; card(x, y, 116, 56, { rx: 8, text: tt, fs: 13.5, fw: 700, stroke: col, sw: 1.8, s: pop(u, 0.4 + i * 0.6 + j * 0.15) });
          if (j < 2) grow(x + 58, y, x + 68, y, E(u, 0.6 + i * 0.6 + j * 0.15, 0.9 + i * 0.6 + j * 0.15), col, { plain: true }); }); });
      pill(255, 212, 'build --skip-refresh면 인덱스 갱신도 생략', INK, pop(u, 1.9), { fs: 13.5 }); } }

  // ---------- 3. subchart values 덮어쓰기 ----------
  const VROWS = [['replicaCount: 3', 0], ['image: my-app:1.0.0', 0], ['service: ClusterIP 8080', 1], ['ingress: app.example.com', 1], ['global: storageClass gp3', 2],
    ['postgresql: auth · primary', 3], ['redis: architecture · master', 6], ['rabbitmq: auth · persistence', 8]];
  const VY = (i) => 74 + i * 42;   // 왼쪽 values.yaml 줄의 글자 기준선
  const BOX = { app: [470, 14, 470, 76], postgresql: [470, 98, 470, 140], redis: [470, 246, 470, 84], rabbitmq: [470, 338, 470, 70] };
  const PG = [['.Values.auth.username', 'appuser', 3], ['.Values.auth.password', 'changeme', 3], ['.Values.auth.database', 'appdb', 3],
    ['.Values.primary.persistence.size', '20Gi', 4], ['.Values.primary.resources.requests', '250m / 512Mi', 5], ['.Values.primary.resources.limits', '1000m / 2Gi', 5]];
  const RD = [['.Values.architecture', 'standalone', 6], ['.Values.auth.enabled', 'false', 6], ['.Values.master.persistence.size', '8Gi', 7]];
  const RB = [['.Values.auth.username', 'rmq'], ['.Values.persistence.size', '10Gi']];
  function vbox(key, title, on, gl) { const [x, y, w, h] = BOX[key];
    el('rect', { x, y, width: w, height: h, rx: 10, fill: on ? PANEL : SOFT, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.5 : 1.5 });
    tx(x + 14, y + 22, title, { 'font-size': 14.5, 'font-weight': 800, fill: on ? ACC : MUT });
    if (gl > 0) pill(x + w - 70, y + 17, 'global gp3', GOOD, gl, { fs: 13.5, mono: true }); }
  function vline(key, i, a, b, op, o) { o = o || {}; const [x, y] = BOX[key], yy = y + 42 + i * 18;
    if (o.mark) el('rect', { x: x + 8, y: yy - 14, width: 454, height: 19, rx: 4, fill: o.mark, opacity: op * 0.5 });
    mono(x + 18, yy, a, { 'font-size': 13.5, fill: MUT, opacity: op }); mono(x + 330, yy, b, { 'font-size': 13.5, fill: o.col || INK, 'font-weight': 700, opacity: op }); }
  function s3(t, c) { const { k, u } = c;
    el('rect', { x: 20, y: 14, width: 410, height: 400, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(34, 36, 'my-app/values.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    VROWS.forEach(([s, b], i) => { const cur = b === k || (b === 3 && k >= 3 && k <= 5) || (b === 6 && (k === 6 || k === 7)), op = k > b ? 1 : k === b ? fade(u, 0.2 + (i % 2) * 0.3) : 0; if (op <= 0) return;
      if (cur) el('rect', { x: 28, y: VY(i) - 24, width: 394, height: 34, rx: 6, fill: ACCBG, opacity: op });
      yl(42, VY(i), s, { op, fs: 14.5 }); });
    const gl = (n) => (k > 2 ? 1 : k === 2 ? pop(u, 1.1 + n * 0.2) : 0);
    vbox('app', 'my-app templates/', k <= 1, gl(0));
    [['replicaCount', '3', 0], ['image', 'my-app:1.0.0', 0], ['service', 'ClusterIP:8080', 1], ['ingress.host', 'app.example.com', 1]].forEach(([a, b, bb], i) => {
      const op = af(k, bb, u, 1.0 + (i % 2) * 0.3), col = i % 2; const [x, y] = BOX.app, yy = y + 46 + (bb ? 20 : 0);
      mono(x + 18 + col * 232, yy, a, { 'font-size': 13.5, fill: MUT, opacity: op }); mono(x + 128 + col * 232, yy, b, { 'font-size': 13.5, 'font-weight': 700, opacity: op }); });
    vbox('postgresql', 'subchart postgresql', k >= 3 && k <= 5, gl(1));
    vbox('redis', 'subchart redis', k === 6 || k === 7, gl(2));
    vbox('rabbitmq', 'subchart rabbitmq', k === 8, gl(3));
    if (k <= 1) { ['postgresql', 'redis', 'rabbitmq'].forEach((key, i) => { const [x, y] = BOX[key]; cross(x + 30, y + 48, 7, pop(u, 1.5 + i * 0.15));
        tx(x + 46, y + 53, k === 0 ? 'replicaCount를 못 본다' : 'service를 못 본다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6 + i * 0.15) }); });
      [0, 1].forEach((i) => fly(300, VY(k * 2 + i) - 5, 560 + i * 232, 54, seg(u, 0.5 + i * 0.25, 1.3 + i * 0.25), k === 0 ? (i ? 'image' : 'replicaCount') : (i ? 'ingress' : 'service'), { mono: true })); }
    if (k === 2) { ['app', 'postgresql', 'redis', 'rabbitmq'].forEach((key, i) => { const [x, y, w] = BOX[key]; dot([[400, VY(4) - 5], [448, VY(4) - 5], [448, y + 17], [x + w - 120, y + 17]], seg(u, 0.2 + i * 0.1, 1.1 + i * 0.1), GOOD, 6); });
      sub(225, 402, 'global은 부모와 모든 subchart가 함께 읽는다', fade(u, 1.6), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
    // postgresql 이 받는 값
    if (k >= 3) PG.forEach(([a, b, bb], i) => vline('postgresql', i, a, b, af(k, bb, u, 1.3 + (i % 3) * 0.25), { col: a.includes('password') ? BAD : INK, mark: k === 7 && i === 3 ? OFF : null }));
    if (k === 3 && u < 1.4) { const f = E(u, 0.2, 1.0), strike = E(u, 0.9, 1.3);
      R.spans(lerp(120, 488, f), lerp(VY(5) + 30, 140, f), [['postgresql.', { fill: BAD, opacity: 1 - strike, 'text-decoration': 'line-through' }], ['auth.username', { fill: ACC, 'font-weight': 700 }]], { 'font-size': 14.5, opacity: 1 - seg(u, 1.2, 1.4) }); }
    if (k === 3) sub(225, 402, '앞의 subchart 이름이 떨어져 .Values가 된다', fade(u, 1.5), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    if (k === 4) grow(880, 128, 846, 188, E(u, 1.6, 2.2), GOOD);
    if (k === 4 || k === 5) sub(225, 402, k === 4 ? '경로가 한 글자만 틀려도 조용히 무시된다' : 'subchart를 고치지 않고 값만 바꾼다', fade(u, 1.8), { 'font-size': 14, fill: k === 4 ? WARN : GOOD, 'font-weight': 700 });
    // redis · rabbitmq
    if (k >= 6) RD.forEach(([a, b, bb], i) => { if (bb > k) return; vline('redis', i, a, b, af(k, bb, u, 1.0 + i * 0.25), { mark: k === 7 && i === 2 ? ACCBG : null }); });
    if (k === 7) sub(225, 402, 'pg는 primary, redis는 master · 경로를 추측하지 않는다', fade(u, 1.9), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
    if (k >= 8) { RB.forEach(([a, b], i) => vline('rabbitmq', i, a, b, fade(u, 1.0 + i * 0.3)));
      sub(225, 402, 'subchart는 자기 이름 아래 값만 본다', fade(u, 1.8), { 'font-size': 14.5, fill: ACC, 'font-weight': 800 }); } }

  // ---------- 4. condition / tags ----------
  const D4 = [{ n: 'postgresql', v: '13.2.0', cond: 'postgresql.enabled', tags: ['database', 'persistence'], ext: 'RDS' },
    { n: 'redis', v: '18.1.0', cond: 'redis.enabled', tags: ['cache'], ext: 'ElastiCache' },
    { n: 'rabbitmq', v: '12.5.0', cond: 'rabbitmq.enabled', tags: ['messaging'], ext: '외부 MQ' }];
  // 판정 결과 (verify_values.py 로 Helm 규칙을 재현해 확인: tags 먼저, condition 이 덮어쓴다)
  const ENV = { dev: [true, true, true], prod: [false, false, false], staging: [true, true, false] };
  const ST4 = { 4: ENV.dev, 5: ENV.prod, 6: ENV.staging, 8: [true, true, true] }, PV4 = { 4: [true, true, true], 5: ENV.dev, 6: ENV.prod, 8: ENV.staging };
  function sw(cx, cy, on, s) { const g = G(cx, cy, s ?? 1); el('rect', { x: -18, y: -10, width: 36, height: 20, rx: 10, fill: on ? GOOD : OFF }, g);
    el('circle', { cx: on ? 8 : -8, cy: 0, r: 7, fill: PANEL }, g); return g; }
  function pod4(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), r = 22, col = o.stroke || INK;
    const pts = [0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 3 * i + Math.PI / 6; return (r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1); }).join(' ');
    el('polygon', { points: pts, fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g); el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 3, fill: 'none', stroke: col, 'stroke-width': 1.8 }, g);
    if (name) tx(0, r + 19, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col }, g); return g; }
  function s4(t, c) { const { k, u } = c, state = ST4[k] || null;
    D4.forEach((d, i) => { const cx = 165 + i * 315, cy = 76, sI = k === i + 1 ? pop(u, 0.3) : 1;
      card(cx, cy, 290, 118, { rx: 12, stroke: state ? (state[i] ? GOOD : BAD) : GRID, sw: state ? 2.5 : 1.8 });
      tx(cx - 128, cy - 32, d.n, { 'font-size': 16, 'font-weight': 800 }); mono(cx + 10, cy - 32, d.v, { 'font-size': 13.5, fill: MUT });
      if (k >= i + 1) { pill(cx, cy + 4, 'condition: ' + d.cond, INFO, sI, { fs: 13.5, mono: true });
        d.tags.forEach((tg, j) => { const tagCol = k === 6 || k === 8 ? (ENV.staging[i] ? GOOD : BAD) : WARN; pill(cx - 80 + j * 120, cy + 38, '#' + tg, tagCol, k === i + 1 ? pop(u, 0.7 + j * 0.25) : 1, { fs: 13.5, mono: true }); }); }
      else tx(cx - 128, cy + 8, '조건 없음 · 항상 설치', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      if (k >= 3 && k !== 7) sw(cx + 112, cy - 37, state ? state[i] : true, k === 3 ? pop(u, 1.4) : 1); });
    const file = k === 4 ? '-f values-dev.yaml' : k === 5 ? '-f values-prod.yaml' : k === 6 ? '-f values-staging.yaml' : k === 8 ? 'values.yaml 기본값 + -f values-staging.yaml' : null;
    if (file) pill(480, 170, file, INK, pop(u, 0.2), { mono: true, fs: 14 });
    if (k === 7) { // 환경 × 의존성 결과표
      const y0 = 194, cols = [330, 480, 630];
      D4.forEach((d, j) => tx(cols[j], y0, d.n, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT }));
      ['dev', 'prod', 'staging'].forEach((env, r) => { const y = y0 + 34 + r * 54; mono(40, y + 5, '-f values-' + env, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2 + r * 0.3) });
        ENV[env].forEach((on, j) => { const s = pop(u, 0.4 + r * 0.3 + j * 0.1); card(cols[j], y, 120, 40, { rx: 8, fill: on ? C.GOODBG : C.BADBG, stroke: on ? GOOD : BAD, sw: 1.8, text: on ? '설치' : '제외', fs: 14.5, fw: 700, color: on ? GOOD : BAD, s }); }); });
      card(830, 282, 200, 150, { rx: 10, stroke: GRID, s: pop(u, 1.6) });
      [['1', 'tags로 먼저 정한다'], ['2', 'condition 값이 있으면'], ['', '그 값으로 덮는다']].forEach(([n, s], i) => {
        if (n) mono(748, 236 + i * 36, n, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8 + i * 0.2) });
        tx(768, 236 + i * 36 - (n ? 0 : 14), s, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8 + i * 0.2) }); });
      return; }
    zone(20, 196, 600, 214, '클러스터 · release my-app', { fill: SOFT, stroke: GRID, dash: '7 6', sw: 2 });
    zone(640, 196, 300, 214, '클러스터 밖 · 관리형 서비스', { fill: PANEL, stroke: GRID, dash: '4 5' });
    pod4(140, 300, 'my-app', {});
    D4.forEach((d, i) => { const x = 270 + i * 115;
      if (k <= 3) { pod4(x, 300, d.n, {}); return; }
      const on = state[i], was = PV4[k][i];
      const sc = on === was ? (on ? 1 : 0) : on ? pop(u, 0.9 + i * 0.2) : 1 - E(u, 0.9 + i * 0.2, 1.5 + i * 0.2);
      if (sc > 0.02) pod4(x, 300, d.n, { s: sc, stroke: ACC });
      if (!on) { el('polygon', { points: '0,-22 19,-11 19,11 0,22 -19,11 -19,-11'.split(' ').map((p) => p.split(',').map((v, j) => +v + (j ? 300 : x)).join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: on === was ? 1 : fade(u, 1.4 + i * 0.2) });
        tx(x, 341, '꺼짐', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: on === was ? 1 : fade(u, 1.4 + i * 0.2) }); }
      if (k === 5) { R.dbIcon(700 + i * 92, 290, null, { s: 0.55 * pop(u, 1.6 + i * 0.2), stroke: INFO }); tx(700 + i * 92, 346, d.ext, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8 + i * 0.2) }); } });
    if (k <= 3) sub(320, 395, k === 0 ? '조건이 없으면 운영에서도 DB 컨테이너가 뜬다' : '켜고 끌 손잡이를 단다', k === 0 ? fade(u, 1.2) : 1, { 'font-size': 14, fill: k === 0 ? WARN : INK, 'font-weight': 700 });
    if (k === 4) sub(320, 395, '세 개 모두 클러스터 안에서 뜬다', fade(u, 1.8), { 'font-size': 14, 'font-weight': 700, fill: GOOD });
    if (k === 5) sub(320, 395, '차트는 그대로, 값 파일만 바꿨다', fade(u, 2.2), { 'font-size': 14, 'font-weight': 700, fill: INK });
    if (k === 6) sub(320, 395, 'messaging 태그만 false · 기본 values에 enabled가 없을 때', fade(u, 1.8), { 'font-size': 14, 'font-weight': 700, fill: INK });
    if (k === 8) { const x = 790, y = 286; card(x, y, 270, 116, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.4) });
      mono(x - 120, y - 30, 'values.yaml (기본값)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) });
      yl(x - 120, y - 4, 'rabbitmq:', { op: fade(u, 0.6) }); yl(x - 120, y + 18, '  enabled: true', { op: fade(u, 0.7), vc: GOOD }); yl(x - 120, y + 42, 'tags.messaging: false', { op: fade(u, 0.8), vc: BAD });
      grow(x - 136, y + 14, 528, 300, E(u, 1.2, 1.8), GOOD);
      sub(320, 395, 'condition 값이 있으면 tags는 무시된다', fade(u, 1.9), { 'font-size': 14.5, 'font-weight': 800, fill: BAD }); } }

  // ---------- 5. alias ----------
  const INST = [{ a: 'pg-master', disk: 50, cpu: 1000, mem: 2, db: 'writes', user: 'writer', col: ACC }, { a: 'pg-replica', disk: 100, cpu: 500, mem: 1, db: 'reads', user: 'reader', col: INFO }];
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { // 선언 쪽
      codePanel(20, 20, 380, 230, 'Chart.yaml dependencies', [
        { s: '- name: postgresql' }, { s: k >= 1 ? '  alias: pg-master' : '  version: 13.2.0', vc: k >= 1 ? ACC : null, hi: k === 1 },
        { s: k >= 1 ? '  condition: pg-master.enabled' : '', hi: k === 1 },
        { s: '- name: postgresql' }, { s: k >= 2 ? '  alias: pg-replica' : '  version: 13.2.0', vc: k >= 2 ? INFO : null, hi: k === 2 },
        { s: k >= 2 ? '  condition: pg-replica.enabled' : '', hi: k === 2 }].map((L) => ({ ...L, op: L.hi ? fade(u, 0.3) : 1 })), { lh: 30 });
      if (k === 0) { card(650, 120, 220, 80, { rx: 10, stroke: BAD, sw: 2.5, s: 1 + R.bump(u, 0.6) }); mono(650, 116, 'postgresql:', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD });
        sub(650, 142, 'values 키가 하나뿐', 1, { fill: BAD, 'font-weight': 700 });
        grow(230, 66, 538, 108, E(u, 0.3, 1.0), BAD); grow(230, 156, 538, 132, E(u, 0.5, 1.2), BAD);
        tx(650, 222, '?', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
        sub(650, 290, '두 번 적으면 어느 쪽 값인지 구분할 수 없다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      if (k >= 1) { const sp = k === 2 ? E(u, 0.5, 1.6) : 0, g1 = k === 1 ? E(u, 0.4, 1.3) : 1;
        tgz(560, 210, null, { w: 56, h: 44 }); mono(560, 262, 'postgresql-13.2.0.tgz', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
        INST.forEach((it, i) => { if (i === 1 && k < 2) return; const y = i === 0 ? lerp(210, 120, g1) : lerp(210, 300, sp), x = 820;
          grow(592, 210, x - 90, y, i === 0 ? g1 : sp, it.col);
          card(x, y, 170, 56, { rx: 10, stroke: it.col, fill: PANEL, sw: 2.5, s: (i === 0 && k === 1) || (i === 1) ? pop(u, i ? 1.2 : 1.0) : 1 });
          mono(x, y + 6, it.a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: it.col }); });
        sub(480, 390, k === 1 ? 'name은 그대로, 별명이 values 키와 리소스 이름이 된다' : '같은 차트 · 같은 버전 · 이름만 둘', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k <= 6) { // 값 비교 (k 3~6)
      INST.forEach((it, i) => { const on = k >= 5 || i === 0; card(110, 130 + i * 150, 176, 60, { rx: 10, stroke: it.col, sw: 2.5, op: on ? 1 : 0.35 });
        mono(110, 136 + i * 150, it.a + ':', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: it.col, opacity: on ? 1 : 0.35 });
        const show = i === 0 ? k >= 4 : k >= 6, now = (i === 0 && k === 4) || (i === 1 && k === 6);
        if (show) mono(110, 182 + i * 150, 'db ' + it.db + ' · ' + it.user, { 'text-anchor': 'middle', 'font-size': 14, fill: INK, 'font-weight': 700, opacity: now ? fade(u, 1.6) : 1 }); });
      const rows = [['디스크 · primary.persistence.size', 'disk', 100, (v) => v + 'Gi'], ['CPU · resources.requests.cpu', 'cpu', 1000, (v) => v + 'm'], ['메모리 · resources.requests.memory', 'mem', 2, (v) => v + 'Gi']];
      rows.forEach(([name, key, max, fmt], r) => { const y = 52 + r * 104; tx(330, y, name, { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
        INST.forEach((it, i) => { const show = i === 0 ? (r === 0 ? k >= 3 : k >= 4) : (r === 0 ? k >= 5 : k >= 6), now = i === 0 ? (r === 0 ? k === 3 : k === 4) : (r === 0 ? k === 5 : k === 6);
          if (!show) return; hbar(330, y + 16 + i * 30, 420, it[key], max, { col: it.col, u: now ? E(u, 0.3 + r * 0.2, 1.4 + r * 0.2) : 1, text: it.a + '  ' + fmt(it[key]) }); }); });
      if (k === 3 || k === 5) sub(560, 392, k === 3 ? 'pg-master 아래 값은 첫 인스턴스에만 간다' : '같은 차트지만 값은 서로 별개다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      return; }
    // 결과 (k 7~8)
    zone(20, 20, 920, 390, '클러스터 · release my-app', { fill: SOFT, stroke: GRID, dash: '7 6', sw: 2 });
    INST.forEach((it, i) => { const y = 120 + i * 170; pod4(540, y, 'my-app-' + it.a + '-0', { s: k === 7 ? pop(u, 0.4 + i * 0.4) : 1, stroke: it.col });
      if (k === 8) { card(725, y, 150, 40, { rx: 20, stroke: it.col, fill: PANEL, text: 'Service', fs: 14, fw: 700, color: it.col, s: pop(u, 0.3 + i * 0.3) });
        mono(725, y + 42, 'my-app-' + it.a, { 'text-anchor': 'middle', 'font-size': 13.5, fill: it.col, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.3) });
        R.dbIcon(870, y, null, { s: 0.55, stroke: it.col }); } });
    if (k === 7) { mono(220, 150, 'my-app', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); sub(220, 176, '릴리스 이름', fade(u, 1.2));
      tx(300, 156, '+', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      mono(370, 150, 'alias', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) }); sub(370, 176, 'pg-master · pg-replica', fade(u, 1.5));
      R.terminal(60, 230, 380, 130, ['$ kubectl get pods', 'my-app-pg-master-0    1/1  Running', 'my-app-pg-replica-0   1/1  Running'], lerp(1, 3, E(u, 1.0, 2.2)), { fs: 13.5 });
      sub(480, 395, 'install 한 번에 Pod 두 개', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 8) { R.person(150, 205, '앱', {});
      grow(180, 190, 648, 120, E(u, 0.8, 1.4), ACC); grow(180, 220, 648, 290, E(u, 1.0, 1.6), INFO);
      mono(330, 148, '쓰기', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) }); mono(330, 280, '읽기', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.6) });
      el('line', { x1: 870, y1: 148, x2: 870, y2: 262, stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.8) }); cross(870, 205, 9, pop(u, 2.0));
      sub(480, 395, '두 DB는 서로 복제하지 않는다 · 진짜 복제는 architecture: replication', fade(u, 2.1), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'Chart.yaml의 dependencies에 의존성 하나를 적을 때 꼭 필요한 세 필드는 무엇인가?',
      o: ['name · alias · condition', 'name · version · repository', 'apiVersion · appVersion · icon'], a: 1,
      why: 'postgresql 13.2.0을 bitnami 저장소에서 가져온다는 세 가지가 의존성 하나의 최소 단위다. alias와 condition은 필요할 때만 붙인다.' },
    { q: 'helm dependency build가 update와 다른 점은 무엇인가?',
      o: ['Chart.lock에 적힌 버전을 그대로 받는다', '저장소에 전혀 접속하지 않는다', 'Chart.lock을 새로 만든다'], a: 0,
      why: 'build는 lock의 13.2.0, 18.1.0, 12.5.0을 그대로 받아 charts/를 채운다. .tgz는 여전히 저장소에서 받으므로 접속은 필요하다.' },
    { q: '부모 values.yaml에서 postgresql subchart의 비밀번호를 바꾸려면 어떻게 적나?',
      o: ['최상위에 password: 를 적는다', 'global.password를 적는다', 'postgresql: 아래에 auth.password를 적는다'], a: 2,
      why: 'subchart 이름 아래에 적은 값이 그 차트의 .Values가 된다. 최상위 키는 subchart에 전달되지 않는다.' },
    { q: 'values.yaml에 rabbitmq.enabled: true가 있는데 tags.messaging: false로 설치하면 rabbitmq는 어떻게 되나?',
      o: ['설치된다', '설치되지 않는다', '설치가 오류로 멈춘다'], a: 0,
      why: 'Helm은 tags를 먼저 보고 condition 값으로 덮어쓴다. condition 경로에 true가 있으니 rabbitmq는 그대로 설치된다.' },
    { q: 'alias로 postgresql을 pg-master와 pg-replica 두 번 쓰면 values 키는 무엇이 되나?',
      o: ['둘 다 postgresql', 'pg-master와 pg-replica', 'postgresql-0과 postgresql-1'], a: 1,
      why: 'alias를 붙이면 values 키, condition 경로, 리소스 이름이 모두 별명을 따른다. 그래서 50Gi와 100Gi를 따로 줄 수 있다.' },
  ];

  const summary = [
    'Chart.yaml의 dependencies에 name, version, repository를 적어 다른 차트를 부속으로 가져온다.',
    'helm dependency update가 charts/에 .tgz를 받고 Chart.lock에 받은 버전을 적는다.',
    'subchart 값은 부모 values.yaml에서 subchart 이름 아래에 적고, global은 모두가 함께 읽는다.',
    'condition과 tags로 환경별로 켜고 끄며, 같은 차트를 두 번 쓰려면 alias를 붙인다.',
  ];
  const review = [
    { q: 'CI에서 helm dependency build가 lock 파일이 어긋났다며 멈췄다. 먼저 의심할 것은?',
      o: ['저장소 주소가 바뀌었다', 'Chart.yaml을 고치고 helm dependency update를 다시 돌리지 않았다', 'charts/ 폴더를 커밋하지 않았다'], a: 1,
      why: 'Chart.lock의 digest는 의존성 목록의 해시라 Chart.yaml을 바꾸면 어긋난다. update를 다시 돌려 lock을 새로 쓰고 커밋한다.' },
    { q: 'redis subchart의 디스크를 키우려고 redis.primary.persistence.size: 20Gi를 적었는데 그대로 8Gi다. 원인은?',
      o: ['redis 차트는 그 경로가 아니라 master.persistence를 쓴다', 'global.storageClass가 값을 막았다', 'condition이 꺼져 있다'], a: 0,
      why: '경로는 subchart가 정한 이름을 따라야 한다. 없는 경로는 오류 없이 무시되므로 helm show values로 확인한다.' },
    { q: '운영은 외부 RDS를 쓰고 개발은 클러스터 안 DB를 쓰려 한다. 가장 알맞은 방법은?',
      o: ['환경마다 차트를 복사해 dependencies를 지운다', 'alias로 postgresql을 하나 더 만든다', 'condition: postgresql.enabled를 달고 값 파일에서 true와 false를 준다'], a: 2,
      why: '선언은 한 번 두고 -f values-dev.yaml, -f values-prod.yaml로 켜고 끈다. 템플릿은 고치지 않는다.' },
  ];

  R.page({ title: 'Chart 의존성', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
