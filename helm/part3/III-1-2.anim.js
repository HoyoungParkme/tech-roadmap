/* III-1-2 Helm Repository 관리 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
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
  function ktable(x, y, cols, rows, o) { o = o || {}; const rh = o.rh || 26;
    cols.forEach(([h, dx]) => mono(x + dx, y, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: o.op ?? 1 }));
    rows.forEach((r, i) => { const op = o.show ? o.show(i) : 1; if (op <= 0) return;
      if (o.hi && o.hi(i)) el('rect', { x: x - 8, y: y + 8 + i * rh, width: o.w || 400, height: rh - 2, rx: 5, fill: ACCBG, opacity: op });
      cols.forEach(([h, dx], j) => mono(x + dx, y + rh * (i + 1), r[j], { 'font-size': 14, fill: j === 0 ? INK : o.vcol || INFO, 'font-weight': j === 0 ? 700 : 500, opacity: op })); }); }

  // ---------- 1. repo add / list / update ----------
  const REPOS = [['bitnami', 'charts.bitnami.com/bitnami'], ['ingress-nginx', 'kubernetes.github.io/ingress-nginx'], ['prometheus-community', 'prometheus-community.github.io/helm-charts']];
  const SY = [62, 182, 302];
  function s1(t, c) { const { k, u } = c, n = Math.min(k + 1, 3);
    zone(20, 16, 500, 396, '내 PC · helm', { fill: SOFT, stroke: GRID, sw: 1.8 });
    // 원격 저장소
    REPOS.forEach(([nm], i) => { const on = i < n, s = k === i ? pop(u, 0.2) : 1; if (!on) return;
      server(740, SY[i], null, { s: 0.8 * s, lamp: k === 4 ? GOOD : ACC });
      tx(740, SY[i] + 50, nm, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: s });
      doc(820, SY[i] - 18, 'index.yaml', { op: s, fs: 13.5 }); });
    // repositories.yaml
    el('rect', { x: 36, y: 44, width: 468, height: 186, rx: 10, fill: PANEL, stroke: k === 3 ? ACC : GRID, 'stroke-width': 2 });
    mono(52, 66, 'repositories.yaml · 별명 → URL', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    REPOS.slice(0, n).forEach(([nm, url], i) => { const now = k === i, y = 98 + i * 46;
      mono(56, y, nm, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: now ? fade(u, 0.6) : 1 });
      mono(56, y + 20, typed('https://' + url, now ? E(u, 0.7, 1.6) : 1), { 'font-size': 13.5, fill: INFO });
      if (now) grow(540, y + 4, 680, SY[i], E(u, 0.3, 1.0), ACC); });
    if (k <= 2) pill(270, 262, `"${REPOS[k][0]}" has been added`, GOOD, pop(u, 1.8), { mono: true, fs: 13.5 });
    if (k <= 2) sub(270, 300, k === 0 ? '별명은 내 PC에서만 쓰는 이름 · 출처는 URL' : k === 1 ? 'repo는 여러 개를 함께 둔다' : '세 곳이 등록됐다', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 });
    if (k === 3) { terminal(36, 244, 468, 156, ['$ helm repo list', 'NAME                  URL', 'bitnami               https://charts…', 'ingress-nginx         https://kubernetes…', 'prometheus-community  https://prometheus…'], lerp(1, 5, E(u, 0.2, 1.6)), { fs: 13.5, lh: 21 });
      pill(780, 400, '등록만으로는 목록이 최신이 아니다', WARN, pop(u, 2.0), { fs: 13.5 }); }
    if (k === 4) { folder(60, 270, '~/.cache/helm/repository/', { s: pop(u, 0.2) });
      REPOS.forEach(([nm], i) => { fly(820, SY[i] - 18, 90, 308 + i * 30, seg(u, 0.4 + i * 0.35, 1.2 + i * 0.35), 'index.yaml', { fill: INFO, mono: true });
        doc(92, 308 + i * 30, nm + '-index.yaml', { op: fade(u, 1.1 + i * 0.35), fs: 13.5 });
        if (u > 1.2 + i * 0.35) check(480, 308 + i * 30, 8, pop(u, 1.2 + i * 0.35)); });
      pill(780, 400, 'Update Complete. ⎈Happy Helming!⎈', GOOD, pop(u, 2.2), { mono: true, fs: 13.5 }); } }

  // ---------- 2. helm search ----------
  const NG = [['bitnami/nginx', '15.4.4', '1.25.3'], ['bitnami/nginx-ingress-controller', '9.9.5', '1.9.5'], ['ingress-nginx/ingress-nginx', '4.9.0', '1.9.5']];
  const PGV = [['13.2.0', '16.1.0'], ['13.1.5', '16.0.4'], ['13.1.0', '16.0.2'], ['13.0.0', '15.5.0']];
  function s2(t, c) { const { k, u } = c;
    zone(20, 16, 560, 396, '내 PC · 로컬 캐시만 본다', { fill: SOFT, stroke: k === 3 ? GRID : ACC, sw: 1.8, dash: k === 3 ? '6 5' : null, color: k === 3 ? MUT : ACC });
    const cmd = ['$ helm search repo nginx', '$ helm search repo nginx', '$ helm search repo bitnami/postgresql --versions', '$ helm search hub wordpress', '$ helm show values bitnami/postgresql > custom-values.yaml'][k];
    mono(40, 52, typed(cmd, k === 0 ? E(u, 0.2, 1.0) : 1), { 'font-size': k === 4 ? 13.5 : 14.5, 'font-weight': 700 });
    // 캐시된 index 3개
    REPOS.forEach(([nm], i) => { const y = 92 + i * 32, scan = k === 0 ? seg(u, 1.0 + i * 0.3, 1.4 + i * 0.3) : 0;
      if (scan > 0 && scan < 1) el('rect', { x: 34, y: y - 16, width: 260 * scan, height: 26, rx: 4, fill: ACCBG });
      doc(50, y, nm + '-index.yaml', { fs: 13.5, op: k <= 2 || k === 4 ? 1 : 0.4 }); });
    // 인터넷
    el('ellipse', { cx: 790, cy: 90, rx: 120, ry: 52, fill: PANEL, stroke: k === 3 ? ACC : GRID, 'stroke-width': 2 });
    tx(790, 86, 'Artifact Hub', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: k === 3 ? ACC : MUT });
    mono(790, 108, 'artifacthub.io', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    el('line', { x1: 580, y1: 110, x2: 670, y2: 95, stroke: k === 3 ? ACC : GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    if (k === 0) { cross(625, 102, 9, pop(u, 1.8)); sub(790, 175, '네트워크를 타지 않는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 1) { ktable(40, 210, [['NAME', 0], ['CHART', 290], ['APP', 380]], NG, { show: (i) => fade(u, 0.3 + i * 0.35), w: 520, hi: (i) => false });
      pill(780, 220, 'CHART VERSION = 차트 버전', ACC, pop(u, 1.5), { fs: 13.5 }); pill(780, 262, 'APP VERSION = 담긴 앱 버전', INFO, pop(u, 1.8), { fs: 13.5 });
      sub(780, 320, '이름은 repo/chart 형식', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 2) { tx(40, 200, 'bitnami/postgresql', { 'font-size': 15, 'font-weight': 800 });
      PGV.forEach(([cv, av], i) => { const y = 240 + i * 40, s = pop(u, 0.3 + i * 0.3);
        card(200, y, 150, 32, { rx: 16, stroke: i === 0 ? ACC : GRID, fill: i === 0 ? ACCBG : PANEL, text: cv, mono: true, fs: 14.5, fw: 700, color: i === 0 ? ACC : INK, s });
        mono(300, y + 5, 'app ' + av, { 'font-size': 14, fill: INFO, opacity: fade(u, 0.4 + i * 0.3) }); });
      el('line', { x1: 110, y1: 232, x2: 110, y2: 360, stroke: GRID, 'stroke-width': 2 }); mono(100, 245, '최신', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end', 'font-weight': 700 });
      pill(780, 260, '기본은 최신 1건 · --versions면 전부', ACC, pop(u, 1.8), { fs: 13.5 }); sub(780, 310, '되돌릴 수 있는 버전을 여기서 본다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { dot([[580, 60], [690, 80]], seg(u, 0.2, 0.7), ACC, 7);
      [['artifacthub.io/…/bitnami/wordpress', '18.1.16'], ['artifacthub.io/…/groundhog2k/wordpress', '0.6.1']].forEach(([url, v], i) => { const y = 210 + i * 50;
        fly(790, 110, 300, y - 5, seg(u, 0.8 + i * 0.3, 1.4 + i * 0.3), 'URL', { fill: INFO });
        mono(40, y, url, { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.3 + i * 0.3) }); mono(450, y, v, { 'font-size': 14, opacity: fade(u, 1.3 + i * 0.3) }); });
      pill(300, 340, '설치하려면 그 repo를 add 해야 한다', WARN, pop(u, 2.0), { fs: 13.5 }); sub(790, 200, '등록 안 한 repo까지 찾는다', fade(u, 1.0), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); }
    if (k === 4) { tgz(80, 230, 'bitnami/postgresql', { s: pop(u, 0.2) });
      [['show chart', 'Chart.yaml 메타', 0], ['show values', '기본값 전체', 1]].forEach(([a, b, i]) => { const y = 290 + i * 50; pill(110, y, 'helm ' + a, INK, pop(u, 0.5 + i * 0.3), { mono: true, fs: 13.5 }); tx(210, y + 5, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.3) }); });
      grow(330, 340, 410, 300, E(u, 1.2, 1.7), ACC); doc(440, 300, 'custom-values.yaml', { s: pop(u, 1.7), stroke: ACC });
      sub(780, 260, '설치 전에 기본값을 꺼내 본다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 1 || k === 2) mono(560, 400, '출력 값은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }

  // ---------- 3. private repo ----------
  function s3(t, c) { const { k, u } = c;
    const me = [120, 200], priv = [800, 110], gh = [800, 300];
    person(me[0], me[1], 'devops', {});
    server(priv[0], priv[1], null, { s: 0.8, stroke: k <= 1 ? ACC : GRID });
    tx(priv[0], priv[1] + 52, 'charts.mycompany.com', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: k <= 1 ? INK : MUT }); lock(priv[0] + 70, priv[1] - 30, true, k <= 1 ? ACC : MUT, 0.9);
    card(gh[0], gh[1], 160, 64, { rx: 10, stroke: k >= 2 ? ACC : GRID, fill: k >= 2 ? ACCBG : PANEL, sw: 2.2 }); tx(gh[0], gh[1] - 4, 'ghcr.io', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: k >= 2 ? ACC : MUT });
    mono(gh[0], gh[1] + 18, 'OCI registry', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    if (k === 0) { card(400, 100, 290, 70, { rx: 10, stroke: GRID, s: pop(u, 0.2) }); mono(270, 92, '--username devops', { 'font-size': 14, opacity: fade(u, 0.3) });
      mono(270, 116, '--password "$HELM_REPO_PASSWORD"', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
      grow(160, 190, 700, 120, E(u, 0.9, 1.6), ACC); check(priv[0] + 70, priv[1] + 10, 10, pop(u, 1.8));
      el('rect', { x: 250, y: 260, width: 300, height: 110, rx: 10, fill: INK, opacity: fade(u, 1.6) }); mono(266, 286, '~/.bash_history', { 'font-size': 13.5, fill: OFF, opacity: fade(u, 1.6) });
      mono(266, 314, 'helm repo add … --password', { 'font-size': 13.5, fill: 'var(--term)', opacity: fade(u, 1.8) }); mono(266, 338, '  "$HELM_REPO_PASSWORD"', { 'font-size': 13.5, fill: '#4ade80', opacity: fade(u, 1.9) });
      sub(400, 395, '기록에는 변수 이름만 남는다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 1) { [['ca.crt', '사내 CA'], ['client.crt', '내 인증서'], ['client.key', '내 개인키']].forEach(([f, d], i) => { const y = 70 + i * 52;
        doc(300, y, f, { s: pop(u, 0.2 + i * 0.25), stroke: i === 2 ? WARN : INFO }); tx(420, y + 5, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.25) }); });
      dot([[160, 200], [700, 115]], seg(u, 1.1, 1.7), ACC, 7); dot([[700, 125], [160, 210]], seg(u, 1.6, 2.2), INFO, 7);
      mono(430, 270, 'TLS 서로 확인', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      pill(430, 330, 'key 파일 권한 600 · 저장소에 넣지 않는다', WARN, pop(u, 2.1), { fs: 13.5 }); }
    if (k === 2) { el('rect', { x: 240, y: 260, width: 120, height: 40, rx: 8, fill: PANEL, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.2) });
      mono(300, 286, '$GITHUB_TOKEN', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      el('path', { d: 'M360,280 H460', stroke: GOOD, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: fade(u, 0.6) });
      mono(410, 268, 'stdin', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.7) });
      card(560, 280, 190, 44, { rx: 8, stroke: ACC, text: 'helm registry login', mono: true, fs: 13.5, s: pop(u, 0.8) });
      dot([[460, 280], [655, 280], [720, 300]], seg(u, 1.0, 1.8), GOOD, 6); pill(gh[0], gh[1] + 58, 'Login Succeeded', GOOD, pop(u, 1.9), { mono: true, fs: 13.5 });
      sub(400, 380, '토큰이 명령줄과 프로세스 목록에 보이지 않는다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { zone(240, 230, 360, 170, '클러스터', { fill: SOFT, stroke: GRID, dash: '7 6', sw: 2 });
      card(400, 110, 260, 48, { rx: 10, stroke: BAD, dash: '6 5', text: 'helm repo add', mono: true, fs: 14, color: MUT, s: pop(u, 0.2) }); cross(400, 110, 14, pop(u, 0.6));
      dot([[gh[0] - 80, gh[1]], [600, 320], [430, 320]], seg(u, 0.9, 1.8), ACC, 8);
      mono(420, 300, 'oci://ghcr.io/my-org/charts/my-app', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9) });
      pill(420, 350, 'my-app · --version 1.2.3', GOOD, pop(u, 1.9), { mono: true, fs: 13.5 }); }
    if (k === 4) { folder(300, 300, './my-app', { s: pop(u, 0.2) }); grow(400, 300, 450, 300, E(u, 0.5, 0.9), MUT);
      tgz(480, 300, 'my-app-1.2.3.tgz', { s: pop(u, 0.9) }); mono(380, 270, 'helm package', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
      fly(560, 250, gh[0] - 60, gh[1] - 40, seg(u, 1.4, 2.2), 'helm push', { mono: true });
      pill(gh[0], gh[1] + 58, ':1.2.3', ACC, pop(u, 2.2), { mono: true, fs: 14 });
      sub(400, 395, '이미지 push와 같은 흐름', fade(u, 2.3), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  // ---------- 4. pull / show ----------
  const FILES = ['Chart.lock', 'Chart.yaml', 'README.md', 'charts/', 'templates/', 'values.yaml'];
  function s4(t, c) { const { k, u } = c;
    server(100, 110, 'bitnami', { s: 0.75 });
    zone(220, 16, 420, 396, '내 PC · 작업 폴더', { fill: SOFT, stroke: GRID, sw: 1.8 });
    zone(660, 16, 280, 396, '클러스터', { fill: PANEL, stroke: k === 5 ? GOOD : GRID, dash: '7 6', sw: 2 });
    if (k < 5) { check(800, 190, 12, 1); tx(800, 230, '변경 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD }); }
    if (k === 0) { fly(140, 110, 270, 90, seg(u, 0.3, 1.2), 'helm pull', { mono: true }); tgz(260, 90, 'postgresql-13.2.0.tgz', { s: pop(u, 1.2) });
      sub(430, 150, 'pull은 파일만 만든다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k >= 1) { const sp = k === 1 ? E(u, 0.3, 1.4) : 1;
      if (k === 1) tgz(260, 90, null, { op: 1 - sp });
      folder(260, 80, 'postgresql/', { op: sp });
      FILES.forEach((f, i) => { const y = 112 + i * 28, op = k === 1 ? fade(u, 0.6 + i * 0.18) : 1, hot = (k === 2 && f === 'Chart.yaml') || (k === 3 && f === 'values.yaml') || (k === 4 && (f === 'templates/' || f === 'README.md' || f === 'values.yaml'));
        if (hot) el('rect', { x: 268, y: y - 17, width: 170, height: 24, rx: 5, fill: ACCBG });
        if (f.endsWith('/')) folder(292, y - 5, f, { op, fs: 13.5 }); else doc(290, y - 3, f, { op, fs: 13.5, stroke: hot ? ACC : INFO, color: hot ? ACC : INK }); }); }
    if (k === 2) { card(530, 140, 180, 110, { rx: 10, stroke: ACC, s: pop(u, 0.4) });
      [['name', 'postgresql'], ['version', '13.2.0'], ['appVersion', '16.1.0']].forEach(([a, b], i) => yl(450, 112 + i * 26, a + ': ' + b, { op: fade(u, 0.6 + i * 0.25), fs: 13.5, vc: i === 2 ? WARN : INFO }));
      sub(430, 300, 'version은 차트, appVersion은 PostgreSQL', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { fly(430, 252, 470, 330, seg(u, 0.4, 1.2), 'helm show values', { mono: true }); doc(400, 340, 'my-values.yaml', { s: pop(u, 1.2), stroke: ACC });
      sub(430, 390, '기본값에서 필요한 줄만 남긴다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 4) { const sy = lerp(110, 260, (Math.sin(t * 2.2) + 1) / 2);
      el('circle', { cx: 470, cy: sy, r: 16, fill: 'none', stroke: INK, 'stroke-width': 2.5 }); el('line', { x1: 482, y1: sy + 12, x2: 494, y2: sy + 24, stroke: INK, 'stroke-width': 3 });
      [['hostPath', '노드 디스크를 직접 연다'], ['NodePort', '노드 포트를 연다']].forEach(([a, b], i) => { const y = 320 + i * 40;
        pill(310, y, a, WARN, pop(u, 0.8 + i * 0.4), { mono: true, fs: 13.5 }); tx(380, y + 5, b, { 'font-size': 14, opacity: fade(u, 0.9 + i * 0.4) }); }); }
    if (k === 5) { doc(330, 330, 'my-values.yaml', { stroke: ACC });
      dot([[470, 330], [700, 250], [800, 250]], seg(u, 0.3, 1.3), ACC, 8);
      card(800, 250, 170, 70, { rx: 10, stroke: GOOD, fill: C.GOODBG, s: pop(u, 1.3) }); tx(800, 246, '릴리스 pg', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      mono(800, 268, 'postgresql 13.2.0', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 1.5) });
      sub(800, 340, '확인한 차트를 내 값으로', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  // ---------- 5. index.yaml ----------
  function vcard(x, y, ver, app, o) { o = o || {}; const g = card(x, y, 200, 46, { rx: 8, stroke: o.stroke || ACC, fill: PANEL, sw: 2, s: o.s });
    mono(x - 88, y + 5, ver, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || ACC, opacity: o.op ?? 1 }); if (app) mono(x + 88, y + 5, 'app ' + app, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: o.op ?? 1 }); return g; }
  function s5(t, c) { const { k, u } = c;
    // 왼쪽: 정적 서버의 파일들
    zone(20, 16, 300, 396, 'charts.bitnami.com/bitnami', { fill: SOFT, stroke: GRID, dash: '6 5' });
    doc(52, 70, 'index.yaml', { stroke: ACC, color: ACC });
    const T = [['postgresql-13.2.0.tgz', 2], ['postgresql-13.1.5.tgz', 3], ['redis-18.1.0.tgz', 4]];
    T.forEach(([f, b], i) => tgz(56, 140 + i * 50, f, { op: k >= b ? 1 : 0.35, fs: 13.5 }));
    // 오른쪽: index.yaml 구조
    yl(360, 52, 'apiVersion: v1', { op: k === 0 ? fade(u, 0.2) : 1 }); yl(360, 80, 'entries:', { op: k === 0 ? fade(u, 0.5) : 1, kc: ACC });
    if (k === 0) { [['postgresql', 120], ['redis', 300]].forEach(([n, y], i) => { el('rect', { x: 390, y: y - 20, width: 520, height: 60, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.0 + i * 0.3) });
        mono(410, y + 15, '<차트 이름>: [버전 목록]', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.1 + i * 0.3) }); });
      sub(640, 400, '차트 이름 하나에 버전이 배열로 붙는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    el('line', { x1: 372, y1: 90, x2: 372, y2: k >= 4 ? 310 : 210, stroke: GRID, 'stroke-width': 2 });
    yl(392, 120, 'postgresql:', { kc: INK, op: k === 1 ? fade(u, 0.2) : 1 });
    vcard(620, 150, '13.2.0', '16.1.0', { s: k === 1 ? pop(u, 0.6) : 1 });
    if (k === 1) { pill(820, 110, '첫 항목 = 최신', ACC, pop(u, 1.3), { fs: 13.5 }); sub(640, 400, '버전별 항목이 배열로 쌓인다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k >= 2) { const g = k === 2 ? E(u, 0.3, 1.2) : 1;
      el('path', { d: `M520,150 C420,150 400,140 ${lerp(520, 260, g)},140`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
      if (k === 2) { mono(730, 194, 'digest: sha256:abc123…', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) });
        mono(440, 176, 'urls', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
        dot([[260, 140], [400, 150], [520, 150]], seg(u, 1.3, 2.0), ACC, 7); if (u > 2.0) check(740, 150, 9, pop(u, 2.0));
        sub(640, 400, 'urls로 받고 digest로 맞는지 본다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }
    if (k >= 3) { vcard(620, 204, '13.1.5', null, { stroke: INFO, s: k === 3 ? pop(u, 0.4) : 1 });
      el('path', { d: 'M520,204 C420,204 400,190 260,190', fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k === 3 ? E(u, 0.8, 1.4) : 1 });
      if (k === 3) { pill(830, 204, '--versions가 읽는 곳', INFO, pop(u, 1.4), { fs: 13.5 }); sub(640, 400, '과거 버전도 나란히 · 롤백 대상', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }
    if (k >= 4) { yl(530, 268, 'redis:', { kc: INK, op: k === 4 ? fade(u, 0.3) : 1 }); vcard(620, 300, '18.1.0', null, { s: k === 4 ? pop(u, 0.7) : 1 });
      el('path', { d: 'M520,300 C420,300 400,240 260,240', fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k === 4 ? E(u, 1.0, 1.6) : 1 });
      if (k === 4) sub(640, 400, '한 파일이 저장소 전체를 담는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 5) { yl(360, 356, 'generated: "2026-05-20T00:00:00Z"', { op: fade(u, 0.3), vc: WARN });
      banner(640, 400, 'index.yaml + .tgz를 정적 호스팅하면 저장소가 된다', pop(u, 1.2)); } }

  const quiz = [
    { q: 'helm repo update가 하는 일은 무엇인가?',
      o: ['등록한 저장소마다 index.yaml을 새로 받아 로컬 캐시를 갱신한다', '설치된 릴리스를 최신 차트로 올린다', '저장소 별명과 URL을 새로 등록한다'], a: 0,
      why: 'add는 별명과 URL만 적는다. update가 세 저장소의 index.yaml을 받아 와야 검색 결과가 최신이 된다.' },
    { q: 'helm search repo와 helm search hub의 차이는 무엇인가?',
      o: ['repo는 Artifact Hub를, hub는 로컬 캐시를 본다', 'repo는 로컬 캐시만, hub는 Artifact Hub 전체를 본다', '둘 다 같고 출력 모양만 다르다'], a: 1,
      why: 'search repo는 캐시된 index.yaml만 읽어 네트워크를 쓰지 않는다. search hub는 등록하지 않은 저장소의 차트까지 URL로 보여 준다.' },
    { q: 'CI에서 저장소 토큰을 helm registry login에 넘길 때 가장 안전한 방법은?',
      o: ['--password 뒤에 토큰을 그대로 적는다', '토큰을 values.yaml에 넣는다', '--password-stdin으로 파이프로 넘긴다'], a: 2,
      why: 'stdin으로 넘기면 토큰이 명령줄, 셸 기록, 프로세스 목록에 남지 않는다.' },
    { q: 'helm pull bitnami/postgresql --version 13.2.0을 실행하면 클러스터에는 무슨 일이 생기나?',
      o: ['아무 변화가 없다', '릴리스 pg가 만들어진다', 'postgresql Pod가 새로 뜬다'], a: 0,
      why: 'pull은 postgresql-13.2.0.tgz 파일만 만든다. 클러스터에 배포하는 것은 install이다.' },
    { q: 'index.yaml에서 차트 파일을 어디서 받을지 알려 주는 필드는 무엇인가?',
      o: ['digest', 'urls', 'generated'], a: 1,
      why: 'urls가 .tgz의 주소를 가리킨다. digest는 받은 파일이 맞는지 확인하는 해시이고 generated는 만든 시각이다.' },
  ];

  const summary = [
    'helm repo add로 별명과 URL을 등록하고, repo update로 각 저장소의 index.yaml을 받아 둔다.',
    'search repo는 받아 둔 캐시에서, search hub는 Artifact Hub 전체에서 차트를 찾는다.',
    '사내 저장소는 비밀번호를 환경변수나 stdin으로 넘기고, OCI는 repo add 없이 주소로 설치한다.',
    '외부 차트는 pull로 받아 풀어 보고, 저장소의 실체는 index.yaml과 .tgz 파일이다.',
  ];
  const review = [
    { q: '새로 나온 차트 버전이 search repo 결과에 보이지 않는다. 먼저 해 볼 것은?',
      o: ['helm repo update로 index.yaml을 다시 받는다', 'helm search hub로 바꿔 검색한다', '저장소를 지우고 다른 별명으로 다시 add한다'], a: 0,
      why: 'search repo는 로컬에 받아 둔 index.yaml만 읽는다. 캐시가 오래되면 새 버전이 없으므로 update부터 돌린다.' },
    { q: 'search hub에서 찾은 차트를 helm install로 바로 설치하려 했더니 차트를 못 찾는다. 이유는?',
      o: ['hub 결과는 OCI 전용이라서', 'hub는 URL만 알려 주고 그 저장소는 아직 add하지 않아서', 'index.yaml에 digest가 없어서'], a: 1,
      why: 'hub 검색은 Artifact Hub의 목록을 보여 줄 뿐이다. 설치하려면 그 차트의 저장소를 add하고 update해야 한다.' },
    { q: 'GitHub Pages에 차트 저장소를 직접 만들 때 꼭 올려야 하는 것은?',
      o: ['Chart.yaml 하나', '클러스터 접속 정보', 'index.yaml과 차트 .tgz 파일들'], a: 2,
      why: 'helm은 URL 뒤의 index.yaml로 목록을 읽고 urls가 가리키는 .tgz를 받는다. 이 둘만 HTTP로 열려 있으면 저장소가 된다.' },
  ];

  R.page({ title: 'Helm 저장소', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
