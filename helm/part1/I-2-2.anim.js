/* I-2-2 helm CLI 핵심 명령어 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, dot, zone, cross, check, lock, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  const chip = (x, y, s, col, sc, o) => pill(x, y, s, col, sc, Object.assign({ mono: true, fs: 13.5 }, o || {}));
  const ST = { deployed: GOOD, superseded: MUT, failed: BAD, 'pending-install': WARN };
  const term = (x, y, w, h, lines, u, t0, o) => R.terminal(x, y, w, h, lines, Math.min(lines.length, lerp(0.5, lines.length, E(u, t0 ?? 0.1, (t0 ?? 0.1) + 0.25 * lines.length))), Object.assign({ fs: 13.5, lh: 21, title: '터미널 (출력은 예시)' }, o || {}));
  function rev(x, y, n, status, note, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const col = ST[status] || INK, g = R.G(x, y, s);
    el('circle', { cx: 0, cy: 0, r: 28, fill: status === 'deployed' ? GOODBG : PANEL, stroke: col, 'stroke-width': o.hot ? 3.5 : 2.5 }, g);
    tx(0, -3, 'rev', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); mono(0, 15, String(n), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col }, g);
    if (status) chip(x, y + 48, status, col, s, { color: col });
    if (note) mono(x, y + 80, note, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.noteCol || MUT, opacity: s, 'font-weight': 700 }); }
  function gate(x, y, name, state, s) { const col = state === 'ok' ? GOOD : state === 'run' ? ACC : GRID;
    card(x, y, 170, 92, { rx: 14, stroke: col, sw: 2.5, fill: state === 'ok' ? GOODBG : state === 'run' ? ACCBG : PANEL, s: s ?? 1 });
    mono(x, y + 6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: state ? col : MUT, opacity: (s ?? 1) > 0.6 ? 1 : 0 });
    if (state === 'ok') check(x + 64, y - 30, 10, 1); }
  function podRow(x, y, n, ok, o) { o = o || {}; for (let i = 0; i < n; i++) { const on = typeof ok === 'number' ? i < ok : ok;
      card(x + i * 60, y, 48, 40, { rx: 8, stroke: on ? GOOD : GRID, fill: on ? GOODBG : PANEL, text: 'Pod', fs: 13.5, color: on ? GOOD : MUT, s: o.s ? o.s(i) : 1, op: o.op }); } }
  function nsWeb(op, dash) { zone(560, 150, 384, 250, 'namespace web', { stroke: INFO, sw: 2, fill: INFOBG, op, dash, color: INFO }); }

  // =========================================================
  // 1. 준비 — 저장소를 등록하고 찾는다
  // =========================================================
  function local(k, u) { zone(16, 16, 330, 388, '내 PC (helm)', { stroke: INK, sw: 1.6, fill: SOFT });
    tx(32, 70, 'repositories.yaml', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    if (k >= 0 && k < 6) { const a = k === 0 ? E(u, 1.2, 1.8) : 1; card(181, 102, 298, 40, { rx: 8, stroke: ACC, sw: 2, fill: ACCBG, op: a });
      mono(42, 107, 'bitnami', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: a }); mono(124, 107, '→ charts.bitnami.com/…', { 'font-size': 13.5, opacity: a }); }
    tx(32, 170, '캐시된 index', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 6) { zone(16, 16, 330, 388, '내 PC (helm)', { stroke: INK, sw: 1.6, fill: SOFT }); tx(181, 130, '저장소 등록 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
      card(760, 140, 340, 130, { rx: 14, stroke: INFO, sw: 2.5, fill: INFOBG, s: pop(u, 0.4) }); tx(760, 104, 'OCI 레지스트리', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.5) });
      mono(760, 134, 'registry-1.docker.io', { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.6) }); mono(760, 158, 'bitnamicharts/nginx : 18.2.1', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.7) });
      tx(760, 186, 'index.yaml이 없다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      grow(586, 200, 350, 250, E(u, 1.2, 1.8), ACC); dot([[586, 200], [350, 250]], seg(u, 1.3, 2.2), ACC, 7);
      chip(480, 330, 'oci://registry-1.docker.io/bitnamicharts/nginx --version 18.2.1', ACC, pop(u, 1.6), { color: ACC, fs: 13.5 });
      tx(480, 380, '주소와 버전을 직접 적는다 (helm search로는 못 찾는다)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    local(k, u);
    // 원격 저장소
    const RX = 780; card(RX, 110, 300, 110, { rx: 14, stroke: ACC, sw: 2.2 }); tx(RX, 82, '차트 저장소 (HTTP)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
    mono(RX, 108, 'charts.bitnami.com/bitnami', { 'text-anchor': 'middle', 'font-size': 13.5 }); R.G(0, 0, 1);
    mono(RX, 136, 'index.yaml', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN });
    if (k === 0) { chip(480, 300, '$ helm repo add bitnami https://charts.bitnami.com/bitnami', INFO, pop(u, 0.2), { color: INFO, fs: 13 });
      grow(630, 120, 350, 110, E(u, 0.6, 1.2), ACC); tx(480, 350, 'URL에 이름 bitnami를 붙여 둔다. 한 번만 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // 캐시된 index (update 뒤)
    const idx = k === 1 ? E(u, 0.9, 1.6) : 1; card(181, 250, 298, 120, { rx: 8, stroke: WARN, sw: 2, op: idx });
    [['nginx', '18.2.1'], ['nginx', '18.2.0'], ['…', '']].forEach(([a, b], i) => { mono(44, 226 + i * 26, a, { 'font-size': 14, opacity: idx, 'font-weight': 700 }); mono(160, 226 + i * 26, b, { 'font-size': 14, opacity: idx, fill: ACC }); });
    if (k === 1) { for (let i = 0; i < 4; i++) dot([[630, 136], [350, 250]], ((u * 0.7 + i / 4) % 1) * (u > 0.3 && u < 1.8 ? 1 : 0), WARN, 6);
      chip(560, 330, '$ helm repo update', INFO, pop(u, 0.2), { color: INFO }); tx(560, 376, '새 버전이 안 보이면 인덱스부터 새로 받는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { term(400, 220, 544, 110, ['$ helm repo list', 'NAME     URL', 'bitnami  https://charts.bitnami.com/bitnami'], u, 0.2); return; }
    if (k === 3) { term(400, 196, 544, 120, ['$ helm search repo nginx', 'NAME           CHART VERSION  APP VERSION', 'bitnami/nginx  18.2.1         1.27.0'], u, 0.2);
      chip(600, 350, 'CHART VERSION = 차트', ACC, pop(u, 1.4), { color: ACC, mono: false }); chip(820, 350, 'APP VERSION = nginx', WARN, pop(u, 1.7), { color: WARN, mono: false });
      el('rect', { x: 18, y: 206, width: 326, height: 30, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.8) }); return; }
    if (k === 4) { term(400, 196, 544, 120, ['$ helm search repo bitnami/nginx --versions', 'bitnami/nginx  18.2.1  1.27.0', 'bitnami/nginx  18.2.0  1.27.0'], u, 0.2);
      lock(420, 360, true, WARN, pop(u, 1.4)); tx(446, 366, '운영은 --version 18.2.1처럼 버전을 고정한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    // k5 Artifact Hub
    card(560, 300, 220, 80, { rx: 40, stroke: INFO, sw: 2.5, fill: INFOBG, s: pop(u, 0.3) }); tx(560, 296, 'Artifact Hub', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.4) });
    tx(560, 318, '여러 저장소를 모은 목록', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 0.4) });
    [[760, 260], [820, 330], [740, 390]].forEach(([x, y], i) => { card(x + 60, y, 110, 34, { rx: 8, stroke: GRID, text: '저장소 ' + (i + 1), fs: 13.5, color: MUT, s: pop(u, 0.8 + i * 0.2) }); grow(670, 300, x, y, E(u, 1.0 + i * 0.2, 1.4 + i * 0.2), MUT, { plain: true }); });
    chip(560, 230, '$ helm search hub wordpress', INFO, pop(u, 1.4), { color: INFO }); }

  // =========================================================
  // 2. 검증 — 세 관문을 지나도 클러스터는 그대로
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    const st = (i) => (k >= [1, 3, 5][i] ? 'ok' : k >= [0, 2, 4][i] ? 'run' : '');
    ['helm lint', 'helm template', 'install --dry-run'].forEach((n, i) => gate(130 + i * 230, 110, n, st(i), 1));
    [0, 1].forEach((i) => grow(215 + i * 230, 110, 275 + i * 230, 110, 1, GRID));
    // 클러스터는 손대지 않는다
    card(860, 110, 150, 92, { rx: 14, stroke: MUT, dash: '6 5', fill: SOFT }); tx(860, 106, '클러스터', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(860, 128, '변화 없음', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    const pos = [130, 130, 360, 360, 590, 590][k]; card(lerp(k ? [130, 130, 130, 360, 360, 590][k] : 40, pos, E(u, 0.1, 0.8)), 40, 110, 32, { rx: 16, stroke: ACC, fill: ACCBG, text: './my-web', fs: 14, mono: true, color: ACC });
    if (k === 0) { term(16, 196, 600, 110, ['$ helm lint ./my-web', '==> Linting ./my-web', '[INFO] Chart.yaml: icon is recommended'], u, 0.4);
      tx(660, 260, '문법과 필수 필드를 먼저 거른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { term(16, 196, 600, 110, ['$ helm lint ./my-web', '[INFO] Chart.yaml: icon is recommended', '1 chart(s) linted, 0 chart(s) failed'], u, 0.2);
      tx(660, 250, 'failed 0이면 통과', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) }); tx(660, 276, 'CI의 첫 관문', { 'font-size': 14.5, opacity: fade(u, 1.3) }); return; }
    if (k === 2) { chip(360, 230, '--values values-prod.yaml', ACC, pop(u, 0.4), { color: ACC }); grow(360, 252, 360, 300, E(u, 0.8, 1.3), ACC);
      R.snippet(200, 300, ['--- (렌더된 YAML)'], { fs: 14, w: 320, op: fade(u, 1.2) }); grow(450, 176, 790, 176, E(u, 1.4, 1.9), MUT, { dash: '5 4', plain: true }); cross(700, 176, 10, pop(u, 1.9));
      tx(620, 360, '클러스터에 연결하지 않아도 돈다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { R.snippet(30, 190, ['# Source: my-web/templates/deployment.yaml', 'apiVersion: apps/v1', 'kind: Deployment', 'metadata:', '  name: my-web', 'spec:', '  replicas: 3'], { fs: 14.5, w: 480, op: fade(u, 0.2) });
      el('rect', { x: 34, y: 190 + 14 + 6 * 22.5 - 2, width: 472, height: 24, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.0) });
      tx(560, 230, '어느 템플릿에서 나왔는지', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); tx(560, 256, '값이 제자리에 꽂혔는지 본다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(560, 300, '이름 my-web = release 이름에 차트 이름이 들어 있어서', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { term(16, 196, 520, 110, ['$ helm install my-web ./my-web \\', '    --namespace web --create-namespace \\', '    --dry-run --debug'], u, 0.2);
      [['--dry-run (기본 client)', '클러스터에 연결하지 않는다', ACC], ['--dry-run=server', '클러스터에 물어보며 흉내 낸다', INFO]].forEach(([a, b, col], i) => { const y = 340 + i * 36; chip(120 + 0, y, a, col, pop(u, 1.2 + i * 0.4), { color: col }); tx(260, y + 5, b, { 'font-size': 14.5, opacity: fade(u, 1.3 + i * 0.4) }); });
      tx(780, 230, '어느 쪽이든', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.8) }); tx(780, 256, '적용하지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) }); return; }
    term(16, 196, 520, 180, ['NAME: my-web', 'NAMESPACE: web', ['STATUS: pending-install', 'var(--warn)'], 'REVISION: 1', 'HOOKS: …', 'MANIFEST: …'], u, 0.2);
    tx(560, 250, '기록되는 release는 없다', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 1.6) }); tx(560, 278, 'lint → template → dry-run을 CI에 넣는다', { 'font-size': 14.5, opacity: fade(u, 2.0) }); }

  // =========================================================
  // 3. 배포 — 명령이 조립되고 release 가 태어난다
  // =========================================================
  const FLAGS = [['helm install', INK], ['my-web', ACC], ['bitnami/nginx', WARN], ['-n web --create-namespace', INFO], ['--version 18.2.1', WARN], ['--values values-prod.yaml', ACC], ['--wait --atomic --timeout 5m', GOOD]];
  const UPTO3 = [3, 4, 6, 7, 7, 7, 7];
  function s3(t, c) { const { k, u } = c, n = UPTO3[k], prev = k ? UPTO3[k - 1] : 0;
    let x = 24, y = 40; FLAGS.slice(0, n).forEach(([s, col], i) => { const w = tw(s, 14) + 26; if (x + w > 540) { x = 24; y += 44; } const a = i >= prev ? pop(u, 0.2 + (i - prev) * 0.35) : 1;
      chip(x + w / 2, y, s, col, a, { color: col, fs: 14 }); x += w + 10; });
    if (k === 0) { tx(140, 120, '↑ release 이름', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) }); tx(300, 120, '↑ 차트', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      tx(30, 200, '이름은 같은 namespace 안에서 하나뿐이어야 한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    nsWeb(k === 1 ? E(u, 0.5, 1.1) : 1, k === 1 && u < 1.1 ? '6 5' : null);
    if (k === 1) { tx(752, 270, '없으면 새로 만든다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) }); tx(752, 296, '(--create-namespace 없이는 실패)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 2) { lock(600, 240, true, WARN, pop(u, 0.9)); tx(624, 246, '차트 18.2.1로 고정', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(580, 300, '빼면 그때의 최신 차트가 깔린다', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { const r = Math.floor(E(u, 0.5, 2.0) * 3 + 0.001); podRow(620, 230, 3, r); tx(752, 290, `ready ${r} / 3까지 기다린다`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      chip(752, 340, '실패하면 --atomic이 되돌린다', BAD, pop(u, 1.6), { color: BAD, mono: false }); return; }
    podRow(620, 230, 3, true);
    if (k === 4) { rev(200, 260, 1, 'deployed', 'nginx-18.2.1', { s: pop(u, 0.4), hot: true }); term(300, 210, 240, 110, ['NAME: my-web', 'STATUS: deployed', 'REVISION: 1'], u, 0.6, { title: '출력 (예시)' });
      tx(752, 290, 'release my-web 탄생', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) }); return; }
    rev(200, 260, 1, 'deployed', 'nginx-18.2.1');
    if (k === 5) { chip(400, 200, '$ helm status my-web -n web', INFO, pop(u, 0.3), { color: INFO }); tx(320, 260, 'Helm의 기록', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); tx(320, 284, 'STATUS: deployed', { 'font-size': 14.5, class: 'mono', fill: GOOD, opacity: fade(u, 1.0) });
      tx(752, 340, '기록과 실제가 다를 수 있다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
    chip(400, 200, '$ kubectl get pods -n web', INFO, pop(u, 0.3), { color: INFO });
    el('rect', { x: 606, y: 202, width: 172, height: 56, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.8) });
    mono(752, 300, 'my-web-nginx-…  1/1 Running', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.1) });
    tx(752, 340, 'Pod가 Running 이어야 배포 완료', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6) }); }

  // =========================================================
  // 4. 변경 — upgrade 와 조회 명령
  // =========================================================
  function s4(t, c) { const { k, u } = c, up = k >= 2, f = k === 2 ? E(u, 0.6, 1.3) : up ? 1 : 0;
    el('line', { x1: 120, y1: 92, x2: up ? 380 : 250, y2: 92, stroke: GRID, 'stroke-width': 3 });
    rev(120, 92, 1, f > 0.5 ? 'superseded' : 'deployed', 'replicas 3');
    if (up) rev(380, 92, 2, 'deployed', 'replicas 5', { s: k === 2 ? pop(u, 0.3) : 1, noteCol: ACC, hot: k === 2 });
    if (k === 0) { chip(700, 70, '--set replicaCount=5', ACC, pop(u, 0.3), { color: ACC }); const n = Math.round(lerp(3, 5, E(u, 0.9, 1.8)));
      podRow(560, 250, 5, 0, { s: (i) => (i < n ? 1 : 0) }); tx(560, 320, `Pod ${n}개로`, { 'font-size': 15, 'font-weight': 700 });
      tx(560, 360, '같은 release 이름과 차트, 값만 바꾼다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { [['values-prod.yaml (rev1 값)', GOODBG, GOOD, 300], ['replicaCount=5', ACCBG, ACC, 170]].forEach(([s, bg, col, w], i) => { const x = 60 + (i ? 312 : 0), a = E(u, 0.4 + i * 0.4, 1.0 + i * 0.4);
        el('rect', { x, y: 230, width: w * a, height: 40, rx: 8, fill: bg, stroke: col, 'stroke-width': 1.8 }); if (a > 0.7) tx(x + 12, 256, s, { 'font-size': 14, 'font-weight': 700, fill: col, class: 'mono' }); });
      chip(170, 200, '--reuse-values', GOOD, pop(u, 0.2), { color: GOOD });
      tx(60, 320, '빼면 예전에 준 값이 조용히 사라진다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { term(560, 180, 384, 110, ['NAME: my-web', 'STATUS: deployed', 'REVISION: 2'], u, 0.8);
      tx(120, 230, 'rev1은 지워지지 않고 남는다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 3) { chip(480, 230, '$ helm upgrade --install my-web bitnami/nginx -n web', INFO, pop(u, 0.3), { color: INFO });
      [['없으면', 'install', 300], ['있으면', 'upgrade', 660]].forEach(([a, b, x], i) => { grow(480, 250, x, 300, E(u, 0.8 + i * 0.3, 1.3 + i * 0.3), MUT); card(x, 320, 160, 40, { rx: 10, stroke: ACC, text: a + ' ' + b, fs: 15, color: ACC, s: pop(u, 1.2 + i * 0.3) }); });
      tx(480, 390, 'CI 스크립트에서 분기가 사라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { term(16, 210, 600, 96, ['$ helm list -n web', 'NAME    NAMESPACE  REVISION  STATUS    CHART', 'my-web  web        2         deployed  nginx-18.2.1'], u, 0.2);
      chip(780, 260, '-A = 모든 namespace', INFO, pop(u, 1.4), { color: INFO, mono: false }); return; }
    if (k === 5) { term(16, 210, 600, 76, ['$ helm status my-web -n web', 'STATUS: deployed   REVISION: 2'], u, 0.2);
      tx(660, 240, 'list = 여러 release', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); tx(660, 268, 'status = release 하나', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); return; }
    term(16, 200, 640, 120, ['$ helm history my-web -n web', 'REVISION  STATUS      CHART         DESCRIPTION', '1         superseded  nginx-18.2.1  Install complete', '2         deployed    nginx-18.2.1  Upgrade complete'], u, 0.2);
    tx(700, 360, '이 이력이 되돌리기의 근거', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) }); }

  // =========================================================
  // 5. 되돌리기 · 정리
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 6) { const F = ['lint', 'template', 'dry-run', 'install', 'upgrade', 'rollback', 'uninstall'];
      el('line', { x1: 70, y1: 200, x2: lerp(70, 890, E(u, 0.2, 2.2)), y2: 200, stroke: GRID, 'stroke-width': 3 });
      F.forEach((s, i) => { const x = 70 + i * 137, col = i < 3 ? INFO : i === 5 ? WARN : i === 6 ? BAD : ACC; card(x, 200, 118, 44, { rx: 22, stroke: col, sw: 2.2, text: s, fs: 15, mono: true, color: col, s: pop(u, 0.3 + i * 0.3) }); });
      tx(206, 260, '검증', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.2) }); tx(480, 260, '배포 · 변경', { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(755, 260, '문제 시 · 정리', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    const gone = k === 4 ? E(u, 0.6, 1.4) : 0, keep = k === 5;
    if (k < 4 || keep) { el('line', { x1: 120, y1: 92, x2: 640, y2: 92, stroke: GRID, 'stroke-width': 3, opacity: 1 });
      rev(120, 92, 1, 'superseded', 'replicas 3'); rev(380, 92, 2, k === 0 && u < 1.2 ? 'deployed' : 'superseded', 'replicas 5');
      rev(640, 92, 3, keep ? null : 'deployed', 'Rollback to 1', { s: k === 0 ? pop(u, 1.1) : 1, noteCol: ACC, hot: k === 0 });
      if (keep) chip(640, 140, 'uninstalled', WARN, 1, { color: WARN });
      if (k === 0) { el('path', { d: 'M120,58 C200,4 560,4 640,58', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': `${E(u, 0.2, 1.1) * 700} 700` }); dot([[120, 58], [380, 18], [640, 58]], seg(u, 0.2, 1.1), ACC, 7); } }
    if (k === 0) { chip(480, 260, '$ helm rollback my-web 1 --namespace web --wait', INFO, pop(u, 0.2), { color: INFO });
      tx(480, 320, '내용은 rev1과 같고 번호는 3으로 쌓인다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 1.7) }); return; }
    if (k === 1) { term(16, 210, 600, 140, ['$ helm history my-web -n web', 'REVISION  STATUS      DESCRIPTION', '1         superseded  Install complete', '2         superseded  Upgrade complete', '3         deployed    Rollback to 1'], u, 0.2);
      tx(660, 300, '과거를 지우지 않는다', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { [['helm get manifest', '클러스터에 들어간 YAML', WARN], ['helm get values', '적용된 값', ACC]].forEach(([a, b, col], i) => { const x = 250 + i * 460, s = pop(u, 0.4 + i * 0.5);
        card(x, 290, 380, 90, { rx: 14, stroke: col, sw: 2.2, s }); mono(x, 284, a + ' my-web', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.5) });
        tx(x, 310, b, { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.6 + i * 0.5) }); });
      tx(480, 380, '템플릿이 아니라 실제 결과를 본다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { const n = Math.round(lerp(5, 3, E(u, 0.8, 1.8)));
      term(16, 210, 440, 96, ['$ helm get values my-web -n web', 'USER-SUPPLIED VALUES:', 'replicaCount: 3'], u, 0.2); podRow(520, 260, 5, true, { s: (i) => (i < n ? 1 : 0) });
      mono(660, 330, `replicaCount ${Math.round(tween(5, 3, u))}`, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC }); return; }
    if (k === 4) { chip(200, 60, '$ helm uninstall my-web --namespace web', BAD, pop(u, 0.2), { color: BAD });
      podRow(80, 200, 3, true, { op: 1 - gone }); [1, 2, 3].forEach((n, i) => card(560 + i * 130, 200, 110, 36, { rx: 8, stroke: INFO, text: 'v' + n + ' Secret', fs: 13.5, color: INFO, op: 1 - E(u, 1.0, 1.7) }));
      tx(480, 300, '리소스도, revision 이력도 지운다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      tx(480, 330, '실행 전에 release 이름과 -n을 두 번 확인한다', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 2.0) }); return; }
    // k5 --keep-history
    chip(240, 250, '$ helm uninstall my-web -n web --keep-history', WARN, pop(u, 0.2), { color: WARN });
    tx(30, 310, '리소스는 지우고 이력은 남긴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) }); tx(30, 336, '나중에 helm rollback으로 되살린다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3) });
    [1, 2, 3].forEach((n, i) => card(620 + i * 116, 300, 104, 36, { rx: 8, stroke: INFO, text: 'v' + n + ' Secret', fs: 13.5, color: INFO, s: 1 })); check(910, 260, 10, pop(u, 1.6)); }

  const quiz = [
    { q: 'helm search repo nginx에서 새로 나온 차트 버전이 안 보인다. 먼저 할 일은 무엇인가?',
      o: ['helm repo update로 인덱스를 새로 받는다', 'helm repo add를 다시 한다', 'helm search hub로 바꾼다'], a: 0,
      why: 'search repo는 내 PC에 캐시된 index를 뒤진다. 인덱스가 낡았으면 repo update로 새로 받는다.' },
    { q: 'helm install --dry-run --debug를 기본 모드로 돌리면 무슨 일이 일어나는가?',
      o: ['클러스터에 적용하고 바로 지운다', '설치를 흉내 내 결과만 보여 주고 아무것도 적용하지 않는다', 'release를 pending-install 상태로 저장한다'], a: 1,
      why: '--dry-run은 렌더 결과와 값만 보여 준다. 출력에 STATUS: pending-install이 찍혀도 release는 기록되지 않는다.' },
    { q: 'helm install에 --version 18.2.1을 빼면 어떻게 되는가?',
      o: ['설치가 거부된다', '18.2.1이 기본으로 설치된다', '그때의 최신 차트 버전이 설치된다'], a: 2,
      why: '버전을 주지 않으면 저장소의 최신 차트를 쓴다. 운영에서는 버전을 고정해 같은 결과를 얻는다.' },
    { q: 'replicaCount를 3에서 5로 올린 upgrade가 성공했다. helm history의 rev1 상태는 무엇인가?',
      o: ['deleted', 'superseded', 'deployed'], a: 1,
      why: 'upgrade는 rev2를 deployed로 만들고 rev1은 superseded로 남긴다. 이 기록이 rollback의 근거다.' },
    { q: 'helm rollback my-web 1 뒤 helm get values에서 replicaCount는 얼마인가?',
      o: ['3', '5', '값이 비어 있다'], a: 0,
      why: 'rollback은 rev1의 값과 매니페스트를 복사해 rev3을 만든다. 그래서 replicaCount가 다시 3이 된다.' },
  ];

  const summary = [
    'repo add로 저장소에 이름을 붙이고 repo update로 인덱스를 받은 뒤 search repo로 찾는다.',
    'lint, template, install --dry-run은 클러스터에 아무것도 적용하지 않고 미리 확인한다.',
    'install은 --version으로 차트를 고정하고 --wait --atomic으로 실패를 되돌린다.',
    'upgrade와 rollback은 revision을 하나씩 쌓고, get values로 실제 값을 확인한다.',
  ];
  const review = [
    { q: '같은 명령으로 설치했는데 어제와 오늘 다른 차트가 깔렸다. 먼저 의심할 것은?',
      o: ['--version 없이 설치해 그때의 최신 차트가 쓰였다', '--create-namespace를 빼서', 'helm lint를 돌리지 않아서'], a: 0,
      why: '버전을 주지 않으면 저장소의 최신 차트를 받는다. --version으로 고정하면 같은 차트가 깔린다.' },
    { q: 'helm upgrade --set replicaCount=5를 돌렸더니 values-prod.yaml에 있던 설정이 빠졌다. 무엇을 붙였어야 하나?',
      o: ['--atomic', '--reuse-values', '--keep-history'], a: 1,
      why: '--reuse-values가 있어야 이전 값 위에 이번 --set만 덮는다. 없으면 기본값에 이번 값만 얹힌다.' },
    { q: 'helm status는 deployed 인데 서비스가 응답하지 않는다. 다음으로 볼 것은?',
      o: ['helm repo update를 돌린다', 'helm search hub로 차트를 찾는다', 'kubectl get pods로 Pod가 Running인지 본다'], a: 2,
      why: 'status는 Helm이 남긴 기록이다. 실제 Pod 상태는 kubectl로 교차 확인해야 한다.' },
  ];

  R.page({ title: 'helm 명령 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
