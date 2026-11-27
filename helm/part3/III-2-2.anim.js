/* III-2-2 OCI 레지스트리 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, zone,
    G, cross, check, lock, terminal, server, person, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- Helm 부품 ----------
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  function yl(x, y, s, o) { o = o || {}; const fs = o.fs || 14, op = o.op ?? 1;
    if (!s) return;
    if (s.trim().startsWith('#')) return mono(x, y, s, { 'font-size': fs, fill: MUT, opacity: op });
    const i = s.indexOf(':'), parts = i < 0 ? [[s, { fill: o.vc || INFO }]] : [[s.slice(0, i + 1), { fill: o.kc || INK, 'font-weight': 600 }], [s.slice(i + 1), { fill: o.vc || INFO }]];
    return R.spans(x, y, parts, { 'font-size': fs, opacity: op }); }
  function tgz(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.stroke || INK, w = o.w || 30, h = o.h || 24;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 4, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2 }, g);
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
  // 컨테이너 이미지 조각 (겹친 판)
  function img(cx, cy, s, col) { const g = G(cx, cy, s ?? 1); [6, 0].forEach((d) => el('rect', { x: -12 + d, y: -10 - d, width: 22, height: 18, rx: 3, fill: PANEL, stroke: col || INFO, 'stroke-width': 1.8 }, g)); return g; }
  // 레지스트리 판: 이름 + 태그 줄
  function registry(x, y, w, h, title, repo, tags, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || SOFT, stroke: o.stroke || ACC, 'stroke-width': 2.2 });
    tx(x + 16, y + 26, title, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || ACC });
    if (repo) mono(x + 16, y + 52, repo, { 'font-size': 14, fill: INK, 'font-weight': 700 });
    tags.forEach((t, i) => { const s = o.tagS ? o.tagS(i) : 1; if (s <= 0) return; pill(x + 50 + i * 100, y + 86, ':' + t, ACC, s, { mono: true, fs: 14, fill: PANEL }); }); }

  // ---------- 1. OCI 란 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const ax = (v) => 120 + (v - 3.0) * 520 / 1.4; // 3.0 ~ 4.4
      el('line', { x1: 100, y1: 180, x2: 860, y2: 180, stroke: GRID, 'stroke-width': 4 });
      [3.0, 3.4, 3.8, 4.2].forEach((v) => { el('line', { x1: ax(v), y1: 172, x2: ax(v), y2: 188, stroke: MUT, 'stroke-width': 2 }); mono(ax(v), 212, 'v' + v.toFixed(1), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); });
      el('rect', { x: ax(3.0), y: 172, width: (ax(3.8) - ax(3.0)) * E(u, 0.2, 0.9), height: 16, fill: C.WARNBG });
      el('rect', { x: ax(3.8), y: 172, width: (ax(4.4) - ax(3.8)) * E(u, 0.8, 1.5), height: 16, fill: C.GOODBG });
      mono(ax(3.8) - 64, 145, 'HELM_EXPERIMENTAL_OCI=1', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.6) });
      pill(ax(3.8), 140, '3.8 정식(GA)', GOOD, pop(u, 1.2), { fs: 14 });
      card(ax(3.0) + 420, 290, 280, 64, { rx: 10, stroke: ACC, s: pop(u, 1.7) }); mono(ax(3.0) + 420, 284, '$ helm version', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      mono(ax(3.0) + 420, 306, 'Version: "v3.14.0"', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 800, opacity: fade(u, 1.9) });
      sub(480, 380, '3.8 이상이면 설정 없이 바로 쓴다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { server(200, 170, 'charts.example.com', { s: 0.9 }); doc(330, 110, 'index.yaml', { s: pop(u, 0.3), stroke: WARN, color: WARN });
      ['mychart', 'redis', 'nginx', '…'].forEach((n, i) => mono(350, 146 + i * 24, '· ' + n, { 'font-size': 14, fill: INK, opacity: fade(u, 0.6 + i * 0.2) }));
      [0, 1, 2].forEach((i) => tgz(560 + i * 90, 170, null, { s: pop(u, 0.9 + i * 0.15) })); mono(650, 215, '.tgz 파일들', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      sub(480, 320, '목록 파일 index.yaml을 늘 만들고 갱신해야 했다', fade(u, 1.8), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 2) { const parts = [['oci://', MUT, '스킴'], ['registry.example.com', INFO, '레지스트리'], ['/charts', INK, '네임스페이스'], ['/mychart', ACC, '차트 이름'], [':1.0.0', WARN, '태그 = 버전']];
      let x = 90; parts.forEach(([s, col, lab], i) => { const w = s.length * 12.6, op = fade(u, 0.2 + i * 0.35);
        mono(x, 170, s, { 'font-size': 21, 'font-weight': 800, fill: col, opacity: op });
        el('path', { d: `M${x + 2},184 v8 h${w - 4} v-8`, fill: 'none', stroke: col === MUT ? GRID : col, 'stroke-width': 2, opacity: op });
        tx(x + w / 2, 216, lab, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col === MUT ? MUT : col, opacity: op }); x += w; });
      doc(380, 300, 'index.yaml', { stroke: MUT, color: MUT, op: fade(u, 1.8) }); if (u > 2.0) cross(372, 300, 12, pop(u, 2.0));
      tx(500, 305, '목록 파일이 필요 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { const regs = ['AWS ECR', 'GitHub GHCR', 'Harbor', 'Docker Hub', 'Azure ACR', 'GCP Artifact Registry'];
      regs.forEach((n, i) => { const x = 170 + (i % 3) * 310, y = 110 + Math.floor(i / 3) * 140, s = pop(u, 0.2 + i * 0.2);
        card(x, y, 270, 100, { rx: 12, stroke: GRID, s }); tx(x, y - 22, n, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.2) });
        img(x - 40, y + 18, s); tgz(x + 40, y + 18, null, { s: pop(u, 0.9 + i * 0.15), w: 26, h: 20 }); });
      sub(480, 395, '이미지 넣던 곳에 차트도 함께 · 권한·스캔·백업을 한 번에', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k4: 흐름
    const ST = [['login', 'helm registry login'], ['package', 'helm package'], ['push', 'helm push'], ['install', 'helm install oci://']];
    ST.forEach(([a, b], i) => { const x = 130 + i * 230, s = pop(u, 0.2 + i * 0.35); card(x, 150, 190, 80, { rx: 12, stroke: ACC, fill: ACCBG, s });
      tx(x, 144, (i + 1) + '. ' + a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.35) });
      mono(x, 168, b, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 0.3 + i * 0.35) });
      if (i < 3) grow(x + 96, 150, x + 134, 150, E(u, 0.5 + i * 0.35, 0.8 + i * 0.35), ACC); });
    card(480, 300, 240, 50, { rx: 10, stroke: BAD, dash: '6 5', text: 'helm repo add', mono: true, fs: 15, color: MUT, s: pop(u, 1.8) }); cross(480, 300, 14, pop(u, 2.1));
    sub(480, 370, '등록 단계가 없다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // ---------- 2. login · package ----------
  function s2(t, c) { const { k, u } = c;
    person(90, 150, k <= 2 ? '나 / CI' : '나', {});
    const reg = k === 1 ? 'ghcr.io' : k === 2 ? '123456789012.dkr.ecr…' : 'registry.example.com';
    card(760, 150, 300, 80, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.2 }); mono(760, 146, reg, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
    mono(760, 170, 'OCI registry', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    if (k === 0) { card(330, 110, 200, 60, { rx: 10, stroke: GRID, s: pop(u, 0.2) }); mono(250, 104, 'Username: myuser', { 'font-size': 13.5, opacity: fade(u, 0.3) }); mono(250, 126, 'Password: ●●●●', { 'font-size': 13.5, opacity: fade(u, 0.5) });
      grow(130, 150, 605, 150, E(u, 0.8, 1.5), ACC); pill(760, 222, 'Login Succeeded', GOOD, pop(u, 1.5), { mono: true, fs: 14 });
      doc(300, 300, '~/.config/helm/registry/config.json', { s: pop(u, 1.9), stroke: INFO, fs: 14 }); grow(700, 200, 640, 285, E(u, 1.7, 2.1), INFO);
      sub(480, 380, '이후 push · pull이 이 자격증명을 쓴다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 1) { el('rect', { x: 170, y: 132, width: 120, height: 36, rx: 8, fill: PANEL, stroke: GOOD, 'stroke-width': 2 }); mono(230, 156, '$GH_TOKEN', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle' });
      el('path', { d: 'M290,150 H400', stroke: GOOD, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: fade(u, 0.3) }); mono(345, 138, '|', { 'font-size': 16, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 800 });
      card(490, 150, 170, 44, { rx: 8, stroke: ACC, text: '--password-stdin', mono: true, fs: 13.5, s: pop(u, 0.5) }); dot([[290, 150], [575, 150], [610, 150]], seg(u, 0.8, 1.6), GOOD, 7);
      pill(760, 222, 'Login Succeeded', GOOD, pop(u, 1.6), { mono: true, fs: 14 });
      sub(480, 320, 'CI에서는 토큰을 파이프로 넘긴다 · 명령 기록에 남지 않는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 2) { card(300, 280, 300, 46, { rx: 8, stroke: WARN, text: 'aws ecr get-login-password', mono: true, fs: 13.5, s: pop(u, 0.2) });
      fly(300, 260, 640, 160, seg(u, 0.6, 1.4), '임시 토큰', { fill: WARN });
      clock(760, 300, 32, 1 - E(u, 1.4, 2.6) * 0.25, WARN, '12시간'); pill(760, 222, 'Login Succeeded', GOOD, pop(u, 1.4), { mono: true, fs: 14 });
      sub(480, 395, 'ECR 토큰은 12시간 뒤 만료 · CI는 실행마다 다시 받는다', fade(u, 2.0), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); }
    if (k >= 3) { folder(140, 300, './mychart', {}); const g = k === 3 ? E(u, 0.4, 1.1) : 1; grow(270, 300, lerp(270, 370, g), 300, g, ACC);
      mono(320, 286, 'helm package', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      tgz(410, 300, null, { w: 40, h: 32, s: k === 3 ? pop(u, 1.1) : 1 });
      R.spans(445, 306, [['mychart', { fill: INK }], ['-', { fill: INK }], ['1.0.0', { fill: WARN, 'font-weight': 800 }], ['.tgz', { fill: INK }]], { 'font-size': 17, 'font-weight': 700 });
      if (k === 3) sub(480, 380, '올릴 대상은 이 파일 하나', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      if (k === 4) { fly(530, 300, 800, 220, seg(u, 0.4, 1.3), '1.0.0', { fill: WARN, mono: true }); pill(800, 222, ':1.0.0', WARN, pop(u, 1.3), { mono: true, fs: 15 });
        sub(480, 380, '파일명의 버전이 그대로 OCI 태그가 된다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } } }

  // ---------- 3. helm push ----------
  function s3(t, c) { const { k, u } = c;
    const tags = k >= 3 ? ['1.0.0', '1.1.0'] : ['1.0.0'];
    if (k !== 2) registry(480, 40, 440, 130, 'registry.example.com', 'charts/mychart', tags, { tagS: (i) => (k === 0 && i === 0 ? pop(u, 1.4) : k === 3 && i === 1 ? pop(u, 1.4) : 1) });
    else registry(480, 40, 440, 130, 'ghcr.io', 'my-org/charts/mychart', ['1.0.0'], { tagS: () => pop(u, 1.4) });
    const ver = k === 3 ? '1.1.0' : '1.0.0';
    tgz(80, 105, 'mychart-' + ver + '.tgz', { w: 36, h: 28, fs: 15 });
    if (k === 0 || k === 2 || k === 3) { fly(140, 105, 560, 125, seg(u, 0.4, 1.3), 'helm push', { mono: true });
      mono(40, 230, typed(`$ helm push mychart-${ver}.tgz oci://${k === 2 ? 'ghcr.io/my-org' : 'registry.example.com'}/charts`, E(u, 0.1, 0.8)), { 'font-size': 14, 'font-weight': 700 });
      mono(40, 262, `Pushed: ${k === 2 ? 'ghcr.io/my-org' : 'registry.example.com'}/charts/mychart:${ver}`, { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.4) });
      if (k !== 3) mono(40, 290, k === 2 ? 'Digest: sha256:a1b2c3…' : 'Digest: sha256:9f2c4a1b7e3d8c6f…', { 'font-size': 14, fill: WARN, opacity: fade(u, 1.7) }); }
    if (k === 0) sub(480, 370, 'digest는 올린 내용의 sha256이다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k === 1) { const parts = [['oci://registry.example.com/charts', INFO, '내가 준 경로'], ['/mychart', ACC, '.tgz의 name'], [':1.0.0', WARN, '.tgz의 version']];
      let x = 110; parts.forEach(([s, col, lab], i) => { const w = s.length * 11.4, op = fade(u, 0.3 + i * 0.5);
        mono(x, 260, s, { 'font-size': 19, 'font-weight': 800, fill: col, opacity: op }); tx(x + w / 2, 296 + (i === 2 ? 24 : 0), lab, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); x += w; });
      sub(480, 370, '경로에 차트 이름을 직접 적지 않는다', fade(u, 2.0), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }
    if (k === 2) sub(480, 370, '레지스트리만 바꾸면 명령은 같다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k === 3) { doc(640, 300, 'index.yaml 갱신', { stroke: MUT, color: MUT, op: fade(u, 1.6) }); if (u > 1.9) cross(632, 300, 11, pop(u, 1.9));
      sub(480, 370, '새 버전 = 새 태그 · 목록 파일을 고칠 일이 없다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { [['registry.example.com/charts/mychart:1.0.0', 0], ['registry.example.com/charts/mychart:1.1.0', 1]].forEach(([s, i]) => mono(120, 250 + i * 36, s, { 'font-size': 16, 'font-weight': 700, fill: i ? ACC : INK, opacity: fade(u, 0.3 + i * 0.4) }));
      banner(480, 360, '같은 레포 안에 버전이 태그로 공존한다', pop(u, 1.2)); } }

  // ---------- 4. pull / install ----------
  function s4(t, c) { const { k, u } = c;
    registry(20, 20, 330, 130, 'registry.example.com', 'charts/mychart', ['1.0.0', '1.1.0']);
    zone(380, 20, 260, 390, '내 PC', { fill: SOFT, stroke: GRID, sw: 1.8 });
    zone(660, 20, 280, 390, '클러스터', { fill: PANEL, stroke: k >= 2 ? GOOD : GRID, dash: '7 6', sw: 2 });
    if (k <= 1) { check(800, 200, 12, 1); tx(800, 240, '변경 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD }); }
    if (k === 0) { fly(300, 150, 420, 90, seg(u, 0.3, 1.2), 'helm pull', { mono: true }); tgz(410, 90, 'mychart-1.0.0.tgz', { s: pop(u, 1.2), fs: 13.5 });
      mono(400, 140, 'Digest: sha256:9f2c4a1b…', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.5) });
      sub(510, 380, 'pull은 파일만 · 릴리스는 생기지 않는다', fade(u, 1.9), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
    if (k === 1) { folder(410, 90, 'mychart/', { s: pop(u, 0.3) });
      ['Chart.yaml', 'values.yaml', 'templates/', 'charts/'].forEach((f, i) => { const y = 130 + i * 32; if (f.endsWith('/')) folder(440, y, f, { op: fade(u, 0.6 + i * 0.2), fs: 13.5 }); else doc(440, y, f, { op: fade(u, 0.6 + i * 0.2), fs: 13.5 }); });
      sub(510, 380, '설치 전에 풀어서 읽어 본다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k >= 2) { const s = k === 2 ? pop(u, 1.3) : 1;
      if (k === 2) { dot([[350, 90], [700, 160], [800, 170]], seg(u, 0.3, 1.3), ACC, 8); card(510, 70, 220, 44, { rx: 8, stroke: BAD, dash: '6 5', text: 'helm repo add', mono: true, fs: 14, color: MUT, s: pop(u, 0.2) }); cross(510, 70, 12, pop(u, 0.6)); }
      card(800, 170, 230, 110, { rx: 12, stroke: GOOD, fill: C.GOODBG, s });
      [['NAME:', 'myrel'], ['STATUS:', 'deployed'], ['REVISION:', '1']].forEach(([a, b], i) => { mono(710, 140 + i * 26, a, { 'font-size': 14, fill: MUT, opacity: s }); mono(810, 140 + i * 26, b, { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: s }); });
      mono(800, 248, k === 4 ? 'chart 1.0.0' : 'chart 1.0.0', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: s }); }
    if (k === 2) sub(510, 380, 'oci:// 주소 + --version이면 된다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k === 3) { doc(420, 260, 'values-prod.yaml', { s: pop(u, 0.3), stroke: ACC }); dot([[560, 260], [700, 210]], seg(u, 0.8, 1.6), ACC, 7);
      sub(510, 380, '-f로 값을 얹는 법은 전통 저장소와 같다', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { ['helm show values oci://…', 'helm template myrel oci://…', 'helm upgrade myrel oci://… --version 1.1.0'].forEach((s, i) => { const y = 240 + i * 40;
        pill(i < 2 ? 510 : 660, y, s, i < 2 ? INFO : ACC, pop(u, 0.3 + i * 0.4), { mono: true, fs: 13.5, fill: PANEL }); });
      fly(270, 130, 800, 280, seg(u, 1.6, 2.4), ':1.1.0', { fill: ACC, mono: true }); } }

  // ---------- 5. 의존성 + 비교 ----------
  const CMP = [['목록 파일', 'index.yaml 필수', '없음 (레지스트리 API)'], ['버전 관리', 'index.yaml의 entries', '태그 = 버전'], ['등록', 'helm repo add 필요', '주소 직접 사용'], ['저장소', '별도 정적 HTTP 서버', '이미지 레지스트리 공용'], ['스킴', 'https://', 'oci://']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) {
      el('rect', { x: 20, y: 16, width: 440, height: 250, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); mono(34, 38, 'my-app/Chart.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const L = [['apiVersion: v2', 0], ['name: my-app', 0], ['dependencies:', 0], ['  - name: mychart', 1], ['    version: 1.0.0', 1], ['    repository: oci://registry.example.com/charts', 1], ['  - name: postgresql', 2], ['    version: 13.2.0', 2], ['    repository: oci://registry-1.docker.io/bitnamicharts', 2]];
      L.forEach(([s, b], i) => { const op = k > b ? 1 : k === b ? fade(u, 0.2 + (i % 3) * 0.2) : 0; if (op <= 0) return; yl(36, 64 + i * 22, s, { fs: 13, op, vc: s.includes('oci://') ? ACC : INFO }); });
      registry(520, 20, 420, 110, 'registry.example.com', 'charts/mychart', ['1.0.0', '1.1.0'], { stroke: k >= 1 ? ACC : GRID });
      registry(520, 150, 420, 110, 'registry-1.docker.io', 'bitnamicharts/postgresql', ['13.2.0'], { stroke: k >= 2 ? ACC : GRID });
      if (k === 0) sub(240, 330, '의존성을 쓰는 부모 차트', fade(u, 0.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      if (k === 1) { grow(440, 174, 514, 110, E(u, 0.8, 1.5), ACC); sub(240, 330, 'https:// 대신 oci://로 적는다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      if (k === 2) { grow(440, 240, 514, 230, E(u, 0.8, 1.5), ACC); sub(240, 330, 'Docker Hub의 공개 차트도 OCI 경로로', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      if (k === 3) { zone(20, 290, 440, 120, 'my-app/charts/', { fill: PANEL, stroke: ACC, sw: 2, color: ACC });
        [['mychart-1.0.0.tgz', 106, 0], ['postgresql-13.2.0.tgz', 236, 1]].forEach(([f, sy, i]) => { fly(620, sy, 70, 336 + i * 36, seg(u, 0.4 + i * 0.4, 1.2 + i * 0.4), f.split('-')[0], { mono: true });
          tgz(56, 336 + i * 36, f, { op: fade(u, 1.2 + i * 0.4), fs: 13.5 }); });
        mono(730, 330, '$ helm dependency update', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.2) });
        mono(730, 360, 'Saving 2 charts', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); }
      return; }
    // 비교표
    const x0 = 60, cw = [170, 330, 330], rh = 58;
    [['', 0], ['전통 (HTTP repo)', 1], ['OCI 레지스트리', 2]].forEach(([h, j]) => tx(x0 + cw.slice(0, j).reduce((a, b) => a + b, 0) + 14, 44, h, { 'font-size': 15, 'font-weight': 800, fill: j === 2 ? ACC : MUT }));
    CMP.forEach(([a, b, d], i) => { const show = i < 2 ? 1 : k === 5 ? 1 : 0; if (!show) return; const y = 64 + i * rh, now = (k === 4 && i < 2) || (k === 5 && i >= 2), op = now ? fade(u, 0.3 + (i % 3) * 0.4) : 1;
      el('rect', { x: x0, y, width: 830, height: rh - 8, rx: 8, fill: i % 2 ? PANEL : SOFT, opacity: op });
      tx(x0 + 14, y + 31, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(x0 + 184, y + 31, b, { 'font-size': 14.5, fill: MUT, opacity: op, 'text-decoration': 'line-through' });
      mono(x0 + 514, y + 31, d, { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: now ? fade(u, 0.6 + (i % 3) * 0.4) : 1 }); });
    if (k === 5) banner(480, 385, 'login → package → push → install · 의존성도 oci://', pop(u, 1.8)); }

  const quiz = [
    { q: 'oci://registry.example.com/charts/mychart:1.0.0에서 1.0.0은 무엇인가?',
      o: ['레지스트리 포트 번호', '태그이자 차트 버전', 'index.yaml의 버전'], a: 1,
      why: 'OCI에서는 태그가 곧 차트 버전이다. 그래서 index.yaml 같은 목록 파일이 필요 없다.' },
    { q: 'helm package ./mychart로 만든 mychart-1.0.0.tgz를 push하면 태그는 어디서 정해지나?',
      o: ['push 명령에 직접 적은 태그', '레지스트리가 자동으로 매긴 번호', 'Chart.yaml의 version(파일명의 1.0.0)'], a: 2,
      why: 'push 경로에는 태그를 적지 않는다. .tgz의 name과 version을 읽어 mychart:1.0.0으로 저장한다.' },
    { q: 'helm push mychart-1.0.0.tgz에 넘기는 경로로 맞는 것은?',
      o: ['oci://registry.example.com/charts', 'oci://registry.example.com/charts/mychart:1.0.0', 'https://registry.example.com/charts/index.yaml'], a: 0,
      why: '경로는 네임스페이스(charts)까지만 준다. 차트 이름과 태그는 .tgz에서 읽어 뒤에 붙인다.' },
    { q: 'OCI 차트를 설치할 때 helm repo add 대신 필요한 것은?',
      o: ['index.yaml 주소', 'oci:// 주소와 --version', 'Chart.lock 파일'], a: 1,
      why: 'helm install myrel oci://registry.example.com/charts/mychart --version 1.0.0처럼 주소를 바로 준다. 등록 단계가 없다.' },
    { q: 'Chart.yaml의 dependencies에서 OCI 레지스트리의 차트를 쓰려면 repository를 어떻게 적나?',
      o: ['oci://registry.example.com/charts', 'oci://registry.example.com/charts/mychart:1.0.0', 'https://registry.example.com/index.yaml'], a: 0,
      why: 'repository에는 네임스페이스까지만 적는다. 차트 이름은 name, 버전은 version 필드가 채운다.' },
  ];

  const summary = [
    'Helm 3.8부터 차트를 OCI 아티팩트로 이미지 레지스트리에 함께 저장한다.',
    'helm registry login으로 인증하고, package로 만든 .tgz의 버전이 그대로 태그가 된다.',
    'push 경로는 네임스페이스까지만 주고, 설치는 repo add 없이 oci:// 주소와 --version으로 한다.',
    '의존성 repository도 oci://로 적을 수 있고, 목록 파일 index.yaml은 필요 없다.',
  ];
  const review = [
    { q: 'helm push mychart-1.0.0.tgz oci://registry.example.com/charts/mychart를 실행했더니 주소가 charts/mychart/mychart:1.0.0이 됐다. 원인은?',
      o: ['경로에 차트 이름까지 적어서 이름이 한 번 더 붙었다', '레지스트리 로그인이 풀렸다', 'Chart.yaml의 appVersion이 비었다'], a: 0,
      why: 'push는 준 경로 뒤에 .tgz의 name과 version을 붙인다. 경로는 네임스페이스 charts까지만 준다.' },
    { q: 'CI에서 ECR로 차트 push가 어제까지 되다가 오늘 인증 오류로 멈췄다. 먼저 의심할 것은?',
      o: ['index.yaml이 오래됐다', '12시간짜리 ECR 토큰을 다시 받지 않았다', '차트 버전이 같아서'], a: 1,
      why: 'get-login-password로 받은 토큰은 12시간 뒤 만료된다. CI는 실행할 때마다 새로 받아 helm registry login에 넘긴다.' },
    { q: '전통 저장소에서 OCI로 옮긴 뒤 새 버전을 낼 때 없어지는 작업은?',
      o: ['helm package로 .tgz 만들기', 'Chart.yaml의 version 올리기', 'helm repo index로 index.yaml 다시 만들기'], a: 2,
      why: 'OCI는 태그가 버전 목록 역할을 한다. 패키징과 버전 올리기는 그대로 하고 push만 하면 새 태그가 나란히 생긴다.' },
  ];

  R.page({ title: 'OCI 레지스트리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
