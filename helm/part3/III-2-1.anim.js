/* III-2-1 패키징 · 배포 (helm package) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, zone,
    G, cross, check, lock, terminal, server, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- Helm 부품 ----------
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  function yl(x, y, s, o) { o = o || {}; const fs = o.fs || 14, op = o.op ?? 1;
    if (!s) return;
    if (s.trim().startsWith('#')) return mono(x, y, s, { 'font-size': fs, fill: MUT, opacity: op });
    const i = s.indexOf(':'), parts = i < 0 ? [[s, { fill: o.vc || INFO }]] : [[s.slice(0, i + 1), { fill: o.kc || INK, 'font-weight': 600 }], [s.slice(i + 1), { fill: o.vc || INFO }]];
    return R.spans(x, y, parts, { 'font-size': fs, opacity: op }); }
  function tgz(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.stroke || INK, w = o.w || 30, h = o.h || 24;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 4, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: -w / 2, y1: -h / 2 + 8, x2: w / 2, y2: -h / 2 + 8, stroke: col, 'stroke-width': 1.6 }, g);
    el('rect', { x: -4, y: -h / 2, width: 8, height: 9, fill: col, opacity: 0.55 }, g);
    if (name) mono(w / 2 + 10, 5, name, { 'font-size': o.fs || 14, fill: o.color || INK, 'font-weight': 600 }, g);
    return g; }
  function doc(x, y, name, o) { o = o || {}; const g = G(x, y, o.s, o.op), col = o.stroke || INFO;
    el('path', { d: 'M-10,-14 h13 l7,7 v21 h-20 z', fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
    if (name) mono(18, 5, name, { 'font-size': o.fs || 14, fill: o.color || col, 'font-weight': 700 }, g); return g; }
  function folder(x, y, name, o) { o = o || {}; const g = G(x, y, o.s, o.op), col = o.stroke || INK;
    el('path', { d: 'M-12,-10 h8 l3,3 h13 v15 h-24 z', fill: SOFT, stroke: col, 'stroke-width': 2 }, g);
    if (name) mono(20, 5, name, { 'font-size': o.fs || 14, fill: o.color || col, 'font-weight': 700 }, g); return g; }
  function key(x, y, col, s) { const g = G(x, y, s ?? 1); el('circle', { cx: -10, cy: 0, r: 9, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
    el('path', { d: 'M-1,0 H20 M14,0 v7 M19,0 v6', stroke: col, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g); return g; }

  // ---------- 1. helm package ----------
  const SRC = ['mychart/', '  Chart.yaml', '  values.yaml', '  templates/deployment.yaml', '  templates/service.yaml'];
  function formula(x, y, ver, o) { o = o || {};
    const parts = [['mychart', ACC], ['-', INK], [ver, WARN], ['.tgz', INK]]; let cx = x;
    parts.forEach(([s, col]) => { mono(cx, y, s, { 'font-size': 22, 'font-weight': 800, fill: col, opacity: o.op ?? 1 }); cx += s.length * 13.2; }); }
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: 원본 디렉터리와 Chart.yaml
    el('rect', { x: 20, y: 16, width: 400, height: 190, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(34, 38, 'mychart/Chart.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    [['apiVersion: v2', null], ['name: mychart', ACC], ['version: 0.1.0', WARN], ['appVersion: "1.0.0"', MUT]].forEach(([s, col], i) => {
      if (k === 0 && i > 0) el('rect', { x: 28, y: 50 + i * 34, width: 384, height: 30, rx: 5, fill: col === MUT ? 'none' : ACCBG, opacity: fade(u, 0.3 + i * 0.2) });
      yl(42, 72 + i * 34, s, { fs: 15, vc: col || INFO }); });
    if (k === 3) { el('line', { x1: 40, y1: 140, x2: 300, y2: 140, stroke: OFF, 'stroke-width': 0 }); pill(330, 140, 'Chart.yaml은 그대로', MUT, pop(u, 1.6), { fs: 13.5 }); }
    // 원본 트리
    const squash = k === 1 ? E(u, 0.5, 1.4) : k >= 1 ? 1 : 0;
    if (squash < 1) SRC.forEach((s, i) => { const y = lerp(236 + i * 34, 300, squash), x = lerp(40, 200, squash), op = 1 - clamp(squash * 2.2);
      if (op <= 0.02) return;
      if (s.endsWith('/')) folder(x + 12, y, s, { op }); else doc(x + 30, y, s.trim(), { op, fs: 14, stroke: INK, color: INK }); });
    else folder(70, 300, 'mychart/ (원본)', { op: 0.45 });
    // 오른쪽
    if (k === 0) { formula(520, 120, '0.1.0', { op: fade(u, 0.8) });
      grow(300, 106, 512, 112, E(u, 0.6, 1.2), ACC); grow(250, 140, 610, 128, E(u, 0.9, 1.5), WARN);
      mono(520, 190, 'appVersion "1.0.0"', { 'font-size': 16, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6) }); el('line', { x1: 516, y1: 184, x2: lerp(516, 700, E(u, 1.9, 2.4)), y2: 184, stroke: BAD, 'stroke-width': 2.5 });
      sub(690, 240, '파일명에는 name과 version만 들어간다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(220, 400, '아직 원본 디렉터리일 뿐이다', fade(u, 1.0), { 'font-size': 14.5, fill: MUT, 'font-weight': 700 }); }
    if (k >= 1) { const s = k === 1 ? pop(u, 1.4) : 1;
      if (k === 1) { grow(260, 300, 560, 300, E(u, 1.3, 1.8), ACC); mono(410, 288, 'helm package ./mychart', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.3) }); }
      tgz(600, 300, k === 4 ? null : 'mychart-0.1.0.tgz', { w: 46, h: 36, s, op: k === 4 ? 0 : 1, fs: 15 });
      if (k === 1) sub(700, 360, 'Successfully packaged chart', fade(u, 1.9), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); }
    if (k === 2) { card(700, 200, 300, 60, { rx: 10, stroke: GRID, s: pop(u, 0.3) }); mono(570, 206, '-rw-r--r--', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      mono(780, 207, '4.2K', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) }); grow(700, 232, 620, 280, E(u, 0.8, 1.3), MUT);
      sub(700, 380, '이 파일 하나가 배포 단위다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { formula(520, 120, '0.2.0', { op: fade(u, 0.3) }); mono(520, 160, '--version 0.2.0', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.2) });
      tgz(600, 360, 'mychart-0.2.0.tgz', { w: 46, h: 36, s: pop(u, 1.0), fs: 15, stroke: WARN }); grow(250, 300, 560, 355, E(u, 0.6, 1.0), WARN);
      sub(690, 410, '같은 버전으로 다시 만들면 파일을 덮어쓴다', fade(u, 2.0), { 'font-size': 14, fill: WARN, 'font-weight': 700 }); }
    if (k === 4) { zone(480, 220, 430, 150, 'dist/', { fill: PANEL, stroke: ACC, sw: 2.2, color: ACC });
      fly(600, 300, 560, 300, 0, ''); tgz(540, 300, 'mychart-0.1.0.tgz', { w: 40, h: 32, s: pop(u, 0.6), fs: 15 });
      mono(500, 120, '--destination ./dist', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      sub(690, 400, '색인하고 올릴 폴더를 하나로 모은다', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 5) { const op = E(u, 0.3, 1.0);
      ['mychart/Chart.yaml', 'mychart/values.yaml', 'mychart/templates/deployment.yaml', 'mychart/templates/service.yaml'].forEach((p, i) => {
        mono(520, 128 + i * 30 - 0, p, { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.6 + i * 0.25) }); });
      mono(520, 96, '$ tar tzf mychart-0.1.0.tgz', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: op });
      sub(700, 380, '원본 디렉터리를 그대로 담는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  // ---------- 2. helm repo index ----------
  const BASE = 'https://myorg.github.io/charts';
  function vitem(x, y, ver, o) { o = o || {}; const lines = o.full ? ['- version: ' + ver, '  appVersion: "1.0.0"', '  created: "2026-08-11T09:00:00Z"', '  digest: sha256:9f1c2a…', '  urls:', '    - …/charts/mychart-' + ver + '.tgz'] : ['- version: ' + ver, '  urls:', '    - …/charts/mychart-' + ver + '.tgz'];
    el('rect', { x, y, width: 500, height: lines.length * 22 + 14, rx: 8, fill: PANEL, stroke: o.col || ACC, 'stroke-width': 2, opacity: o.op ?? 1 });
    lines.forEach((s, i) => yl(x + 14, y + 26 + i * 22, s, { fs: 13.5, op: o.lop ? o.lop(i) : o.op ?? 1, vc: s.includes('digest') ? WARN : INFO })); }
  function s2(t, c) { const { k, u } = c;
    zone(20, 16, 300, 396, 'dist/', { fill: SOFT, stroke: k === 0 || k === 5 ? ACC : GRID, sw: 2, color: ACC });
    tgz(56, 70, 'mychart-0.1.0.tgz', { fs: 13.5 });
    if (k >= 1) tgz(56, 116, 'mychart-0.2.0.tgz', { fs: 13.5, s: k === 1 ? pop(u, 0.3) : 1, stroke: WARN });
    const idxOn = k === 0 ? pop(u, 1.4) : 1; doc(48, k >= 1 ? 164 : 120, 'index.yaml', { s: idxOn, stroke: ACC, color: ACC });
    if (k === 0) { mono(360, 60, '$ helm repo index ./dist --url …', { 'font-size': 14.5, 'font-weight': 700 });
      dot([[120, 70], [120, 120]], seg(u, 0.5, 1.2), ACC, 6);
      mono(360, 140, 'urls = --url + 파일 이름', { 'font-size': 15, 'font-weight': 800, fill: INK, opacity: fade(u, 1.0) });
      R.spans(360, 180, [[BASE, { fill: INFO, 'font-weight': 700 }], ['/mychart-0.1.0.tgz', { fill: ACC, 'font-weight': 700 }]], { 'font-size': 14.5, opacity: fade(u, 1.5) });
      card(640, 290, 560, 84, { rx: 10, stroke: GRID, s: pop(u, 2.1) });
      tx(640, 284, '--url을 빼면 urls에 파일 이름만 들어간다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(640, 308, 'helm은 저장소 주소 기준 상대 경로로 받는다', fade(u, 2.3)); return; }
    if (k === 1) { doc(400, 90, 'index.yaml (기존)', { stroke: INFO, s: pop(u, 0.2) }); mono(420, 130, '- 0.1.0', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.4) });
      card(700, 110, 200, 56, { rx: 10, stroke: WARN, text: '+ 0.2.0', mono: true, fs: 16, fw: 800, color: WARN, s: pop(u, 0.7) });
      const m = E(u, 1.0, 1.8); grow(470, 160, lerp(470, 560, m), lerp(160, 250, m), m, INFO, { plain: true }); grow(700, 140, lerp(700, 620, m), lerp(140, 250, m), m, WARN, { plain: true });
      doc(560, 270, 'index.yaml --merge', { s: pop(u, 1.7), stroke: ACC, color: ACC }); mono(580, 310, '- 0.2.0   - 0.1.0', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(640, 380, '기존 항목은 두고 새 버전만 더한다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k 2~5: index.yaml 구조
    yl(360, 44, 'apiVersion: v1', {}); yl(360, 70, 'entries:', { kc: ACC }); yl(384, 96, 'mychart:', { op: k === 2 ? fade(u, 0.4) : 1 });
    if (k === 2) { el('rect', { x: 400, y: 112, width: 500, height: 120, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.9) });
      mono(420, 176, '[ 버전 항목들 … ]', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.1) });
      sub(640, 300, '차트 이름이 키, 버전 목록이 값', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k >= 3) { vitem(400, 108, '0.2.0', { full: true, col: WARN, lop: k === 3 ? (i) => fade(u, 0.3 + i * 0.28) : null });
      if (k === 3) { dot([[120, 116], [400, 220]], seg(u, 2.0, 2.6), WARN, 6); } }
    if (k >= 4) vitem(400, 262, '0.1.0', { col: INFO, op: k === 4 ? fade(u, 0.4) : 1 });
    if (k === 4) sub(640, 356 + 40, '0.1.0이 남아 있어야 --version으로 되돌린다', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k === 5) { yl(360, 366, 'generated: "2026-08-11T09:00:00Z"', { op: fade(u, 0.3), vc: WARN });
      banner(640, 404, 'dist/ = index.yaml 1개 + .tgz 여러 개', pop(u, 1.2)); } }

  // ---------- 3. 정적 호스팅 ----------
  const HOST = [520, 110];
  function s3(t, c) { const { k, u } = c;
    // 게시자 쪽: git 브랜치
    tx(40, 36, '게시자 저장소', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    el('line', { x1: 50, y1: 80, x2: 300, y2: 80, stroke: GRID, 'stroke-width': 3 }); [70, 130, 190, 250].forEach((x) => el('circle', { cx: x, cy: 80, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }));
    mono(310, 85, 'main', { 'font-size': 14, 'font-weight': 700 });
    const ghOn = k >= 0 ? (k === 0 ? pop(u, 0.4) : 1) : 0;
    el('circle', { cx: 130, cy: 170, r: 9 * ghOn, fill: k >= 1 ? ACC : PANEL, stroke: ACC, 'stroke-width': 2.5 }); mono(150, 175, 'gh-pages', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: ghOn });
    if (k === 0) { sub(160, 214, 'orphan: 부모 없는 새 이력', fade(u, 0.9), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      ['src/', 'mychart/', 'README.md'].forEach((f, i) => { const y = 260 + i * 34; doc(70, y, f, { stroke: MUT, color: MUT, op: 1 - E(u, 1.5, 2.2) * 0.6, fs: 13.5 }); if (u > 1.5) cross(60, y, 8, pop(u, 1.5 + i * 0.15)); });
      mono(200, 380, '$ git rm -rf .', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) }); }
    // 호스팅
    const live = k >= 1;
    card(HOST[0], HOST[1], 230, 90, { rx: 12, stroke: live ? GOOD : GRID, fill: live ? C.GOODBG : PANEL, sw: 2.2 });
    tx(HOST[0], HOST[1] - 12, 'GitHub Pages', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: live ? GOOD : MUT });
    mono(HOST[0], HOST[1] + 14, 'myorg.github.io/charts', { 'text-anchor': 'middle', 'font-size': 13.5, fill: live ? INK : MUT }); if (live) lock(HOST[0] + 100, HOST[1] - 32, true, GOOD, 0.75);
    if (k >= 1) { doc(436, 200, 'index.yaml', { stroke: ACC, color: ACC, fs: 13.5, op: k === 1 ? fade(u, 1.0) : 1 }); tgz(440, 240, '0.1.0 · 0.2.0 .tgz', { fs: 13.5, w: 22, h: 18, op: k === 1 ? fade(u, 1.2) : 1 }); }
    if (k === 1) { dot([[140, 170], [300, 170], [400, 120]], seg(u, 0.3, 1.1), ACC, 7); mono(220, 230, '$ git push origin gh-pages', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2) });
      pill(HOST[0], 300, 'HTTPS로 열렸다', GOOD, pop(u, 1.6), { fs: 14 }); }
    if (k === 2) { R.dbIcon(HOST[0], 300, null, { s: 0.65 * pop(u, 0.3), stroke: WARN }); mono(HOST[0], 352, 's3://my-helm-charts/', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
      folder(120, 300, 'dist/', {}); dot([[160, 300], [480, 300]], seg(u, 0.7, 1.5), WARN, 7); mono(300, 285, 'aws s3 sync', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
      pill(300, 380, '--acl public-read · 민감 파일 확인', WARN, pop(u, 1.8), { fs: 13.5 }); }
    // 소비자
    if (k >= 3) { person(850, 110, '소비자', {});
      if (k === 3) { mono(840, 200, '$ helm repo add myorg …', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.2) });
        fly(HOST[0] + 60, 200, 820, 260, seg(u, 0.8, 1.6), 'index.yaml', { mono: true, fill: ACC }); doc(800, 270, 'myorg-index.yaml', { s: pop(u, 1.6), stroke: ACC, fs: 13.5 });
        sub(800, 330, 'add는 한 번, 그다음은 update', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
      if (k === 4) { terminal(610, 180, 330, 110, ['$ helm search repo myorg', 'NAME           CHART  APP', 'myorg/mychart  0.2.0  1.0.0'], lerp(1, 3, E(u, 0.2, 1.4)), { fs: 13.5 });
        sub(750, 330, '검색 결과는 index.yaml을 읽은 것', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
      if (k === 5) { fly(520, 290, 760, 260, seg(u, 0.3, 1.2), 'mychart-0.2.0.tgz', { mono: true }); zone(640, 230, 300, 150, '클러스터', { fill: SOFT, stroke: GOOD, dash: '7 6', sw: 2 });
        card(790, 310, 160, 54, { rx: 10, stroke: GOOD, fill: C.GOODBG, text: '릴리스 web', fs: 15, fw: 800, color: GOOD, s: pop(u, 1.3) });
        mono(790, 400, '$ helm install web myorg/mychart', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.2) }); } } }

  // ---------- 4. 서명 ----------
  function s4(t, c) { const { k, u } = c;
    const tg = [420, 90], pv = [420, 170];
    if (k <= 3) { key(80, 90, WARN, k === 0 ? pop(u, 0.2) : 1); tx(80, 130, '개인키', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN });
      mono(80, 152, 'devops@myorg.io', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
    tgz(tg[0], tg[1], 'mychart-0.2.0.tgz', { w: 40, h: 32, fs: 15 });
    if (k === 0) { grow(120, 90, 380, 90, E(u, 0.4, 1.2), WARN); mono(250, 76, 'helm package --sign', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.3) });
      el('circle', { cx: tg[0] + 30, cy: tg[1] - 18, r: 12 * pop(u, 1.3), fill: WARN }); mono(640, 250, '--key  --keyring ~/.gnupg/secring.gpg', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(640, 290, '키 이메일과 keyring 경로가 맞아야 서명이 붙는다', fade(u, 2.0), { 'font-size': 14, fill: WARN, 'font-weight': 700 }); }
    if (k >= 1) { doc(pv[0] - 4, pv[1], 'mychart-0.2.0.tgz.prov', { s: k === 1 ? pop(u, 0.4) : 1, stroke: WARN, color: WARN, fs: 15 });
      if (k === 1) { sub(640, 260, '.tgz 옆에 .prov가 하나 더 생긴다', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
        pill(640, 310, '.prov도 따로 올려야 한다', WARN, pop(u, 1.8), { fs: 14 }); } }
    if (k >= 2 && k <= 3) { const x = 150, y = 210, w = 640, h = 190; el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: k === 3 ? WARN : GRID, 'stroke-width': 2 });
      ['name: mychart', 'version: 0.2.0', 'files:', '  mychart-0.2.0.tgz: sha256:9f1c2a…'].forEach((s, i) => yl(x + 20, y + 30 + i * 26, s, { fs: 14.5, op: k === 2 ? fade(u, 0.3 + i * 0.25) : 1, vc: i === 3 ? WARN : INFO }));
      if (k === 2) { el('path', { d: `M${x + 330},${y + 104} C560,160 520,110 ${tg[0] + 30},${tg[1] + 16}`, fill: 'none', stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.4) });
        sub(800, 150, '.tgz의 해시를 적어 둔다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      if (k === 3) { el('rect', { x: x + 14, y: y + 122, width: w - 28, height: 56, rx: 6, fill: C.WARNBG, opacity: fade(u, 0.3) });
        mono(x + 26, y + 144, '-----BEGIN PGP SIGNATURE-----', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.4) });
        mono(x + 26, y + 168, '…개인키로 만든 서명…', { 'font-size': 14, fill: WARN, opacity: fade(u, 0.7) });
        grow(80, 160, x + 20, y + 150, E(u, 1.0, 1.6), WARN); sub(800, 150, '누가 만들었는지를 증명한다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }
    if (k === 4) { person(820, 100, '소비자', {}); key(820, 190, GOOD, pop(u, 0.3)); tx(820, 226, '공개 키링', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD });
      [['.tgz의 sha256 계산', '9f1c2a…'], ['.prov에 적힌 값', '9f1c2a…'], ['PGP 서명', '공개키로 확인']].forEach(([a, b], i) => { const y = 270 + i * 44;
        tx(180, y, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }); mono(420, y, b, { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.4) });
        if (u > 1.0 + i * 0.4) check(600, y - 5, 9, pop(u, 1.0 + i * 0.4)); });
      mono(640, 400, '$ helm install web myorg/mychart --verify', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2) }); }
    if (k === 5) { server(780, 200, 'chartmuseum', { s: 0.85 }); mono(780, 290, 'chartmuseum.myorg.io', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      pill(420, 250, 'helm plugin install …/helm-push', INK, pop(u, 0.3), { mono: true, fs: 13.5 });
      fly(440, 120, 720, 200, seg(u, 0.9, 1.8), 'helm cm-push', { mono: true }); dot([[440, 180], [720, 220]], seg(u, 1.2, 2.0), WARN, 6);
      sub(420, 340, 'HTTP API로 올린다 · .prov도 함께', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  // ---------- 5. CI 전체 흐름 ----------
  const STG = [['태그 push', 'chart-v*'], ['러너', 'setup-helm'], ['package', 'dist/*.tgz'], ['index --merge', 'index.yaml'], ['gh-pages', 'keep_files'], ['소비자', 'upgrade']];
  function s5(t, c) { const { k, u } = c;
    STG.forEach(([a, b], i) => { const x = 90 + i * 156, on = i <= k, now = i === k;
      card(x, 64, 132, 66, { rx: 10, stroke: now ? ACC : on ? GOOD : GRID, fill: now ? ACCBG : PANEL, sw: now ? 2.6 : 1.8, s: now ? 1 + R.bump(u, 0.2) : 1 });
      tx(x, 60, a, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: on ? INK : MUT }); mono(x, 82, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: on ? ACC : MUT });
      if (i < STG.length - 1) grow(x + 66, 64, x + 90, 64, i < k ? 1 : i === k ? E(u, 1.8, 2.3) : 0, GOOD, { plain: true }); });
    if (k > 0) dot([[90 + (k - 1) * 156, 100], [90 + k * 156, 100]], seg(u, 0.1, 0.7), ACC, 7);
    const Y = 150;
    if (k === 0) { el('line', { x1: 80, y1: Y + 80, x2: 540, y2: Y + 80, stroke: GRID, 'stroke-width': 3 }); [120, 220, 320, 420].forEach((x) => el('circle', { cx: x, cy: Y + 80, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }));
      pill(420, Y + 30, 'chart-v0.2.0', ACC, pop(u, 0.5), { mono: true, fs: 14 }); grow(420, Y + 44, 420, Y + 70, E(u, 0.8, 1.1), ACC, { plain: true });
      mono(620, Y + 86, 'on.push.tags: [ "chart-v*" ]', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(480, Y + 180, '태그를 밀면 릴리스 워크플로가 돈다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 1) { zone(80, Y, 500, 200, 'ubuntu-latest 러너', { fill: SOFT, stroke: GRID, sw: 1.8 });
      [['actions/checkout@v4', '차트 소스'], ['azure/setup-helm@v4', 'helm 명령'], ['permissions: contents: write', 'gh-pages push 권한']].forEach(([a, b], i) => { const y = Y + 56 + i * 44;
        mono(100, y, a, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); tx(420, y, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.4) });
        if (u > 0.8 + i * 0.4) check(560, y - 5, 8, pop(u, 0.8 + i * 0.4)); }); }
    if (k === 2) { folder(110, Y + 60, 'mychart/', {}); mono(110, Y + 110, 'charts/ ← dependency update', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.4) });
      grow(300, Y + 60, 420, Y + 60, E(u, 1.0, 1.5), ACC); mono(360, Y + 46, 'package', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      tgz(470, Y + 60, 'dist/mychart-0.2.0.tgz', { s: pop(u, 1.5), fs: 14 });
      card(480, Y + 180, 640, 60, { rx: 10, stroke: WARN, s: pop(u, 1.9) }); tx(480, Y + 176, 'update를 빼면 charts/가 비어 package가 멈춘다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      mono(480, Y + 198, 'missing in charts/ directory', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 3) { doc(110, Y + 50, 'Pages의 index.yaml', { stroke: INFO, s: pop(u, 0.3) }); mono(130, Y + 84, '0.1.0', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(110, Y + 20, 'curl -fsSL …/index.yaml', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      doc(110, Y + 150, 'dist/의 새 .tgz', { stroke: WARN }); mono(130, Y + 184, '0.2.0', { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
      grow(330, Y + 60, 520, Y + 100, E(u, 0.8, 1.4), INFO); grow(300, Y + 160, 520, Y + 120, E(u, 1.0, 1.6), WARN);
      doc(560, Y + 110, 'index.yaml', { stroke: ACC, s: pop(u, 1.6), color: ACC }); mono(580, Y + 148, '0.2.0 · 0.1.0', { 'font-size': 15, fill: ACC, 'font-weight': 800, opacity: fade(u, 1.8) });
      sub(480, Y + 250, '새 러너에는 옛 index.yaml이 없어 먼저 받아 온다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { zone(80, Y, 380, 220, 'gh-pages · keep_files: true', { fill: SOFT, stroke: GOOD, sw: 2, color: GOOD });
      zone(500, Y, 380, 220, 'keep_files 없음', { fill: SOFT, stroke: BAD, sw: 2, dash: '6 5', color: BAD });
      [['mychart-0.1.0.tgz', 0], ['mychart-0.2.0.tgz', 1], ['index.yaml', 1]].forEach(([f, isNew], i) => { const y = Y + 60 + i * 44;
        tgz(116, y, f, { fs: 13.5, s: isNew ? pop(u, 0.5 + i * 0.2) : 1 });
        tgz(536, y, f, { fs: 13.5, s: isNew ? pop(u, 0.5 + i * 0.2) : 1, op: isNew ? 1 : 1 - E(u, 1.0, 1.6) * 0.65 }); if (!isNew && u > 1.4) cross(536, y, 10, pop(u, 1.4)); });
      sub(690, Y + 200, '0.1.0이 지워지면 index의 URL이 깨진다', fade(u, 1.8), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); }
    if (k === 5) { person(140, Y + 90, '소비자', {});
      ['$ helm repo update', '$ helm upgrade --install web myorg/mychart --version 0.2.0'].forEach((s, i) => mono(200, Y + 40 + i * 30, typed(s, E(u, 0.2 + i * 0.6, 0.8 + i * 0.6)), { 'font-size': 14, 'font-weight': 700 }));
      zone(560, Y + 90, 360, 130, '클러스터', { fill: SOFT, stroke: GOOD, dash: '7 6', sw: 2 });
      card(740, Y + 160, 200, 54, { rx: 10, stroke: GOOD, fill: C.GOODBG, text: 'web · 0.2.0', mono: true, fs: 16, fw: 800, color: GOOD, s: pop(u, 1.6) });
      sub(300, Y + 200, '등록은 처음 한 번, 그다음은 반복', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'helm package ./mychart가 만드는 파일 이름을 정하는 값은 무엇인가?',
      o: ['Chart.yaml의 name과 version', 'Chart.yaml의 name과 appVersion', '폴더 이름과 오늘 날짜'], a: 0,
      why: 'name이 mychart, version이 0.1.0이면 mychart-0.1.0.tgz가 된다. appVersion은 파일 이름에 들어가지 않는다.' },
    { q: 'helm repo index ./dist에 --merge를 붙이는 이유는 무엇인가?',
      o: ['.tgz 파일을 압축하려고', '기존 index.yaml의 항목을 두고 새 버전만 더하려고', '--url을 생략하려고'], a: 1,
      why: '--merge 없이 돌리면 폴더에 있는 .tgz만으로 index.yaml을 새로 만든다. 폴더에 0.1.0이 없으면 그 버전이 목록에서 빠진다.' },
    { q: '차트 저장소를 GitHub Pages에 만들 때 필요한 서버 프로그램은 무엇인가?',
      o: ['ChartMuseum 서버', 'Kubernetes 클러스터', '따로 없다, index.yaml과 .tgz만 HTTP로 열리면 된다'], a: 2,
      why: '저장소는 정적 파일 서버면 된다. 소비자는 index.yaml을 읽고 urls가 가리키는 .tgz를 받는다.' },
    { q: 'helm install --verify가 통과하려면 저장소에 무엇이 함께 있어야 하나?',
      o: ['mychart-0.2.0.tgz.prov 파일', 'Chart.lock 파일', '개인키 파일'], a: 0,
      why: '.prov에 .tgz의 sha256과 PGP 서명이 들어 있다. 소비자는 공개 키링으로 이것을 확인한다. 개인키는 절대 올리지 않는다.' },
    { q: 'CI가 새 러너에서 돌 때 index.yaml을 먼저 받아 와야 하는 이유는?',
      o: ['helm 명령이 없어서', 'dist/에는 옛 index.yaml이 없어 --merge할 대상이 없기 때문에', 'gh-pages 권한을 얻으려고'], a: 1,
      why: '새 러너의 dist/에는 방금 만든 .tgz만 있다. 공개 중인 index.yaml을 받아 합쳐야 0.1.0 항목이 남는다.' },
  ];

  const summary = [
    'helm package는 차트 폴더를 name과 version으로 이름 붙인 .tgz 하나로 묶는다.',
    'helm repo index가 .tgz들을 읽어 index.yaml을 만들고, 새 버전은 --merge로 더한다.',
    'index.yaml과 .tgz를 GitHub Pages나 S3에 올리면 그 주소가 바로 저장소가 된다.',
    '--sign으로 .prov를 만들어 --verify로 검증하고, 전체 과정을 태그 push CI로 묶는다.',
  ];
  const review = [
    { q: 'CI로 0.2.0을 올렸더니 helm search repo에 0.1.0이 사라졌다. 먼저 의심할 것은?',
      o: ['공개 중인 index.yaml을 받지 않고 dist/만으로 index를 만들었다', 'appVersion을 올리지 않았다', 'helm package에 --sign을 빼먹었다'], a: 0,
      why: '새 러너의 dist/에는 0.2.0만 있다. 공개 중인 index.yaml을 받아 --merge하고 keep_files로 옛 .tgz를 남겨야 한다.' },
    { q: '차트를 고친 뒤 Chart.yaml의 version을 그대로 두고 다시 패키징했다. 무슨 일이 생기나?',
      o: ['새 이름의 .tgz가 하나 더 생긴다', '같은 이름의 mychart-0.1.0.tgz를 덮어써 이전 내용이 사라진다', 'helm package가 오류로 멈춘다'], a: 1,
      why: '파일 이름은 name과 version으로만 정해진다. 고친 차트는 version을 올려 새 .tgz로 내야 이전 버전으로 되돌릴 수 있다.' },
    { q: 'helm install --verify가 서명 확인 단계에서 실패했다. 저장소에서 먼저 확인할 것은?',
      o: ['index.yaml의 apiVersion', 'values.yaml의 기본값', '.tgz 옆에 같은 이름의 .prov 파일이 올라가 있는지'], a: 2,
      why: '--verify는 .prov의 해시와 서명으로 확인한다. .prov를 올리지 않았거나 .tgz가 바뀌면 검증이 실패한다.' },
  ];

  R.page({ title: '차트 패키징·배포', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
