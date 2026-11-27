/* IV-2-1 라이브러리 차트 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * Deployment 골격의 빈칸과 채워진 값은 페이지 코드(_deployment.tpl·_labels.tpl·_probes.tpl·values.yaml)를
 * Go 템플릿 규칙대로 python 으로 렌더해 확인한 결과다(helm template 결과 탭과 같다). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  // Chart.yaml 같은 파일 카드: rows [[text, o]]  o = {op, col, strike, hot}
  function fileCard(x, y, w, title, rows, o) { o = o || {}; const lh = o.lh || 26, h = 40 + rows.length * lh;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    el('path', { d: `M${x},${y + 30} h${w}`, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    mono(x + 14, y + 21, title, { 'font-size': 13.5, 'font-weight': 700, fill: o.stroke || MUT, opacity: o.op ?? 1 });
    rows.forEach(([s, ro], i) => { ro = ro || {}; const yy = y + 30 + (i + 0.5) * lh + 5;
      if (ro.hot) el('rect', { x: x + 6, y: yy - lh / 2 - 4, width: w - 12, height: lh - 2, rx: 5, fill: ro.hotFill || ACCBG, opacity: ro.op ?? 1 });
      mono(x + 14, yy, s, { 'font-size': ro.fs || 14.5, 'font-weight': ro.hot ? 700 : 400, fill: ro.col || INK, opacity: ro.op ?? 1, 'text-decoration': ro.strike ? 'line-through' : null }); });
    return h; }
  function folderIco(x, y, name, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('path', { d: 'M-10,-9 h7 l3,3 h10 v15 h-20 Z', fill: SOFT, stroke: col, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    mono(16, 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: col }, g); return g; }
  function fileIco(x, y, name, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('path', { d: 'M-8,-11 h11 l5,5 v17 h-16 Z', fill: PANEL, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round' }, g);
    mono(16, 5, name, { 'font-size': 14.5, 'font-weight': 600, fill: col }, g); return g; }
  const SRC = { rel: INFO, val: WARN, chart: INFO, inc: ACC };

  // ---------- Deployment 골격 (빈칸 있는 YAML) ----------
  // [들여쓰기, 키, 빈칸 표현, 빈칸 출처, 채워진 값, 나타나는 beat]
  const SK = [
    [0, 'apiVersion: apps/v1'], [0, 'kind: Deployment'], [0, 'metadata:'],
    [2, 'name:', '.Release.Name', 'rel', 'web-app', 1], [2, 'labels:', 'common.labels | nindent 4', 'inc', '라벨 5줄', 1],
    [0, 'spec:'], [2, 'replicas:', '.Values.replicaCount | default 1', 'val', '3', 1],
    [4, 'matchLabels: instance=', '.Release.Name', 'rel', 'web-app', 2], [4, 'template.labels:', 'common.labels | nindent 8', 'inc', '라벨 5줄', 2],
    [6, '- name:', '.Chart.Name', 'chart', 'web-app', 3], [8, 'image:', '.Values.image.repository:tag', 'val', 'registry.mycorp.io/web-app:2.3.0', 3],
    [8, 'containerPort:', '.Values.service.port', 'val', '8080', 3], [8, '', 'common.probes | nindent 10', 'inc', 'liveness · readiness', 3],
  ];
  const SKY = (i) => 64 + i * 26, CWD = 9;
  // reveal(i) → 0..1, fill(i) → 0..1 (빈칸에 값이 들어간 정도)
  function skeleton(x, reveal, fill, o) { o = o || {};
    el('rect', { x: x - 14, y: 22, width: o.w || 560, height: 30 + SK.length * 26, rx: 12, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.6 });
    R.spans(x, 44, [['define ', { fill: INFO, 'font-weight': 700 }], ['"common.deployment"', { fill: ACC, 'font-weight': 700 }]], { 'font-size': 14.5 });
    SK.forEach(([d, key, expr, src, val], i) => { const r = reveal(i); if (r <= 0.02) return; const y = SKY(i) + 8, kx = x + d * CWD;
      mono(kx, y, key, { 'font-size': 14, opacity: r, fill: INK });
      if (!expr) return; const f = fill ? fill(i) : 0, sx = kx + (key ? tw(key, 14) * 0.92 + 8 : 0), col = SRC[src];
      const txt = f > 0.5 ? val : expr, w = tw(txt, 13.5) * 0.92 + 16;
      el('rect', { x: sx, y: y - 15, width: w, height: 21, rx: 4, fill: f > 0.5 ? ACCBG : PANEL, stroke: f > 0.5 ? ACC : col, 'stroke-width': 1.5, 'stroke-dasharray': f > 0.5 ? null : '4 3', opacity: r });
      mono(sx + 8, y, txt, { 'font-size': 13.5, 'font-weight': 700, fill: f > 0.5 ? ACC : col, opacity: r * (f > 0.4 && f < 0.6 ? 0.3 : 1) }); }); }
  function legend(x, y, op) { [['.Release', SRC.rel, '릴리스'], ['.Values', SRC.val, '앱의 values'], ['.Chart', SRC.chart, '부르는 차트'], ['include', SRC.inc, '다른 조각']].forEach(([k, col, d], i) => {
      el('rect', { x, y: y + i * 30 - 13, width: 18, height: 16, rx: 3, fill: PANEL, stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', opacity: op });
      mono(x + 28, y + i * 30, k, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); tx(x + 120, y + i * 30, d, { 'font-size': 14, fill: MUT, opacity: op }); }); }

  // ---------- 1. type: library ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { const flip = k === 0 ? E(u, 1.0, 1.6) : 1;
      const rows = [['apiVersion: v2'], ['name: common'], ['description: 조직 공통 템플릿 라이브러리'], [flip < 0.5 ? 'type: application' : 'type: library', { hot: flip >= 0.5, col: flip >= 0.5 ? ACC : MUT, strike: flip > 0.2 && flip < 0.5 }], ['version: 1.0.0', { hot: k === 1, hotFill: INFOBG, col: k === 1 ? INFO : INK }], ['appVersion: (없음)', { col: BAD, strike: true, op: k === 1 ? fade(u, 0.3) : 0 }]];
      fileCard(40, 40, 430, 'common/Chart.yaml', rows.map((r, i) => [r[0], Object.assign({ op: k === 0 ? fade(u, 0.1 + i * 0.15) : 1 }, r[1] || {}, i === 5 ? { op: k === 1 ? fade(u, 0.3) : 0 } : {})]), { lh: 30 });
      if (k === 0) { [['application', '설치하면 리소스가 생긴다', INK, 0.4], ['library', '다른 차트가 가져다 쓴다', ACC, 1.6]].forEach(([a, b, col, at], i) => { const y = 110 + i * 110;
          card(720, y, 360, 80, { rx: 12, stroke: col, sw: i ? 2.6 : 1.8, fill: i ? ACCBG : PANEL, s: pop(u, at) });
          mono(560, y - 8, 'type: ' + a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, at + 0.2) }); tx(560, y + 20, b, { 'font-size': 14.5, opacity: fade(u, at + 0.2) }); });
        note(540, 360, 'type 한 줄이 차트의 성격을 가른다', fade(u, 2.2)); return; }
      // k1: 버전 번호가 소비자와 묶인다
      card(720, 140, 360, 110, { rx: 12, stroke: INFO, s: pop(u, 0.8) });
      mono(560, 112, 'web-app/Chart.yaml', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
      mono(560, 140, '- name: common', { 'font-size': 14.5, opacity: fade(u, 1.0) }); mono(560, 166, '  version: 1.0.0', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.1) });
      el('path', { d: 'M470,206 C520,206 520,162 548,162', fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.4) });
      note(540, 300, 'version = 라이브러리 자체의 버전', fade(u, 1.8), { fill: INFO }); note(540, 330, '배포되는 앱이 아니라 appVersion은 없다', fade(u, 2.1)); return; }
    if (k === 2) { terminal(40, 50, 880, 170, [['$ helm install common ./common', null], ['Error: library charts are not installable', '#fca5a5']], lerp(0, 2, E(u, 0.2, 1.6)), { title: 'bash', lh: 34, fs: 16 });
      cross(480, 300, 24, pop(u, 1.8)); note(540, 306, '버그가 아니라 library의 정의다', fade(u, 2.0)); return; }
    // k3: 렌더 대상 0개
    folderIco(60, 70, 'common/templates/', {});
    ['_deployment.tpl', '_labels.tpl', '_probes.tpl'].forEach((f, i) => { fileIco(100, 112 + i * 40, f, { col: MUT, dash: '3 3', op: fade(u, 0.2 + i * 0.2) });
      mono(300, 117 + i * 40, 'define "common.' + ['deployment', 'labels', 'probes'][i] + '"', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.6 + i * 0.2) }); });
    card(700, 140, 160, 70, { rx: 14, stroke: INK, text: '템플릿 엔진', fs: 15, s: pop(u, 1.0) });
    dot([[260, 150], [620, 140]], seg(u, 1.1, 1.8), MUT, 7); cross(640, 140, 10, pop(u, 1.8));
    mono(860, 150, '0개', { 'font-size': 34, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); sub(860, 178, '매니페스트', fade(u, 1.9), { 'font-size': 14 });
    note(60, 300, '밑줄 파일만 있고 렌더할 리소스가 없다', fade(u, 2.0)); note(60, 330, '→ 다른 차트가 dependency로 가져와야 쓸 수 있다', fade(u, 2.3), { fill: ACC }); }

  // ---------- 2. 골격 정의 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 4) { skeleton(54, () => 1, null, { w: 520 });
      fileCard(610, 40, 330, 'common/templates/_labels.tpl', [['define "common.labels"', { col: INFO, hot: true, hotFill: INFOBG }], ['app.kubernetes.io/name: .Chart.Name'], ['app.kubernetes.io/instance: .Release.Name'], ['app.kubernetes.io/managed-by: Helm'], ['team: platform', { col: ACC, hot: true }], ['cost-center: engineering', { col: ACC, hot: true }]].map(([s, o], i) => [s, Object.assign({ fs: 13.5, op: fade(u, 0.2 + i * 0.2) }, o || {})]), { lh: 28 });
      [4, 8].forEach((r, i) => { const f = E(u, 1.5 + i * 0.3, 2.1 + i * 0.3); el('path', { d: `M610,${120 + i * 30} C590,${120 + i * 30} 590,${SKY(r) + 2} ${[0,0,0,0,340,0,0,0,440][r]},${SKY(r) + 2}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '1 1', pathLength: 1, 'stroke-dashoffset': 1 - f }); });
      note(610, 290, '쿠버네티스 표준 라벨 + 조직 라벨', fade(u, 2.2)); return; }
    skeleton(54, (i) => { const at = SK[i][5]; if (at == null) return k === 0 ? fade(u, 0.3 + i * 0.15) : 1; if (at < k) return 1; if (at > k) return 0; return fade(u, 0.3 + (i % 4) * 0.3); }, null, { w: 560 });
    // 아직 안 나온 줄은 회색 줄로
    SK.forEach((r, i) => { if (r[5] != null && r[5] > k) el('rect', { x: 54 + r[0] * CWD, y: SKY(i) - 4, width: 180, height: 8, rx: 4, fill: SOFT }); });
    legend(660, 80, k === 0 ? fade(u, 1.2) : 1);
    if (k === 0) { note(660, 220, '빈칸이 있는 Deployment 한 벌', fade(u, 1.6)); sub(780, 250, '밑줄 파일이라 이 자체는 렌더되지 않는다', fade(u, 2.0), { 'font-size': 14 }); }
    if (k === 1) note(660, 230, '이름은 릴리스에서, 라벨은 조각에서', fade(u, 1.6));
    if (k === 2) { const f = E(u, 1.4, 2.0); el('path', { d: `M392,${SKY(7) + 4} C460,${SKY(7) + 4} 460,${SKY(8) + 4} 436,${SKY(8) + 4}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, opacity: f });
      note(660, 230, 'selector의 instance 라벨이', fade(u, 1.6)); note(660, 256, 'Pod 라벨 안에 들어 있어야 한다', fade(u, 1.8), { fill: GOOD }); }
    if (k === 3) { note(660, 230, '값은 부르는 앱의 values에서', fade(u, 1.6), { fill: WARN }); note(660, 256, 'probe는 또 다른 조각에서', fade(u, 1.9), { fill: ACC }); } }

  // ---------- 3. dependency 로 가져오기 ----------
  function s3(t, c) { const { k, u } = c;
    const rows = [['apiVersion: v2'], ['name: web-app'], ['type: application', { hot: k === 0, col: k === 0 ? INFO : INK, hotFill: INFOBG }], ['version: 0.1.0'], ['appVersion: "2.3.0"'],
      ['dependencies:', { op: k >= 1 ? (k === 1 ? fade(u, 0.3) : 1) : 0 }], ['  - name: common', { op: k >= 1 ? (k === 1 ? fade(u, 0.5) : 1) : 0, hot: k === 1 }], ['    version: 1.0.0', { op: k >= 1 ? (k === 1 ? fade(u, 0.7) : 1) : 0, hot: k === 1 }],
      ['    repository: oci://…', { op: k >= 2 ? (k === 2 ? fade(u, 0.3) : 1) : 0, hot: k === 2, hotFill: WARNBG }]];
    fileCard(40, 40, 360, 'web-app/Chart.yaml', rows.map(([s, o], i) => [s, Object.assign({ op: k === 0 ? fade(u, 0.1 + i * 0.15) : 1 }, o || {})]), { lh: 30 });
    if (k === 0) { note(460, 120, '실제로 배포되는 쪽', fade(u, 1.2)); note(460, 150, '= 평범한 application 차트', fade(u, 1.5), { fill: INFO }); return; }
    // 오른쪽: 라이브러리 출처
    const REG = [680, 90], LOC = [680, 300];
    if (k === 1) { card(700, 200, 220, 70, { rx: 12, stroke: ACC, fill: ACCBG, text: 'common\ntype: library · 1.0.0', fs: 14.5, color: ACC, s: pop(u, 0.9) });
      el('path', { d: 'M400,250 C500,250 500,200 590,200', fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '1 1', pathLength: 1, 'stroke-dashoffset': 1 - E(u, 1.0, 1.6) });
      note(440, 340, 'subchart를 붙일 때와 같은 문법', fade(u, 1.8)); return; }
    // 레지스트리(구름)와 로컬 폴더
    el('path', { d: `M${REG[0] - 90},${REG[1] + 24} a30,30 0 0 1 20,-50 a42,42 0 0 1 76,-10 a34,34 0 0 1 64,16 a28,28 0 0 1 20,44 Z`, fill: k === 2 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 2.2 });
    mono(REG[0], REG[1] + 8, 'registry.mycorp.io', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
    mono(REG[0] + 110, REG[1] + 54, 'oci://… (배포)', { 'font-size': 14, 'text-anchor': 'end', fill: ACC });
    if (k === 2) { folderIco(LOC[0] - 80, LOC[1], 'file://../common', { col: MUT, op: fade(u, 1.0) }); sub(LOC[0], LOC[1] + 34, '로컬 개발 때 옆 폴더를 바로', fade(u, 1.2), { 'font-size': 14 });
      grow(400, 290, LOC[0] - 100, LOC[1], E(u, 1.3, 1.8), MUT, { dash: '5 4' }); grow(400, 290, REG[0] - 100, REG[1] + 20, E(u, 0.5, 1.0), ACC); return; }
    // k3, k4: charts/ 로 내려받기
    folderIco(470, 330, 'web-app/charts/', {});
    const f = k === 3 ? E(u, 0.6, 1.8) : 1;
    const px = lerp(REG[0], 720, f), py = lerp(REG[1] + 40, 330, f);
    card(px, py, 170, 34, { rx: 6, stroke: ACC, fill: ACCBG, text: 'common-1.0.0.tgz', fs: 14, mono: true, color: ACC });
    if (k === 3) { mono(440, 230, '$ helm dependency update', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); sub(560, 262, 'Chart.yaml에 적기만 해서는 안 된다', fade(u, 1.9), { 'font-size': 14 }); return; }
    // k4: 렌더 결과 수
    [['web-app 템플릿', 'Deployment 1개', INK], ['common (library)', '0개 · 조각만 제공', ACC]].forEach(([a, b, col], i) => { const y = 200 + i * 44, op = fade(u, 0.4 + i * 0.4);
      tx(440, y, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); mono(920, y, b, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: col, opacity: op }); });
    note(440, 160, '이제 common.* 을 include 할 수 있다', fade(u, 1.4), { fill: ACC }); }

  // ---------- 4. include 한 줄로 렌더 ----------
  const OUTL = ['labels:', '  app.kubernetes.io/name: web-app', '  app.kubernetes.io/instance: web-app', '  app.kubernetes.io/managed-by: Helm', '  team: platform', '  cost-center: engineering'];
  function s4(t, c) { const { k, u } = c;
    const filled = k >= 2 ? (k === 2 ? (i) => E(u, 0.8 + i * 0.08, 1.2 + i * 0.08) : () => 1) : null;
    if (k <= 2) { skeleton(410, () => (k === 0 ? 0.35 + 0.65 * fade(u, 1.4) : 1), filled, { w: 540, stroke: k >= 1 ? ACC : GRID });
      el('rect', { x: 20, y: 40, width: 350, height: 100, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      mono(34, 62, 'web-app/templates/deployment.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      R.spans(34, 104, [['{{ ', { fill: MUT }], ['include ', { fill: INFO, 'font-weight': 700 }], ['"common.deployment" ', { fill: ACC }], ['.', { fill: BAD, 'font-weight': 800 }], [' }}', { fill: MUT }]], { 'font-size': 15 });
      grow(370, 96, 396, 96, E(u, 0.6, 1.0), ACC);
      if (k === 0) { note(30, 190, '앱 쪽에 남는 건 이 한 줄', fade(u, 1.2)); sub(150, 220, '복붙하던 Deployment가 사라진다', fade(u, 1.6), { 'font-size': 14 }); }
      if (k === 1) { const CT = [['.Release.Name', 'web-app'], ['.Chart.Name', 'web-app'], ['.Values', 'values.yaml']];
        el('rect', { x: 20, y: 170, width: 350, height: 140, rx: 10, fill: PANEL, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.3) });
        mono(34, 194, '.  (web-app의 컨텍스트)', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
        CT.forEach(([a, b], i) => { mono(34, 226 + i * 28, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.2) }); mono(356, 226 + i * 28, b, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.2) }); });
        dot([[195, 170], [195, 150], [400, 100]], seg(u, 1.2, 2.0), BAD, 8);
        sub(195, 340, '.Chart는 라이브러리가 아니라 부르는 web-app', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 600 }); }
      if (k === 2) { fileCard(20, 170, 350, 'web-app/values.yaml', [['replicaCount: 3'], ['image.repository: …/web-app'], ['image.tag: "2.3.0"'], ['service.port: 8080']].map(([s], i) => [s, { op: fade(u, 0.2 + i * 0.15), col: WARN }]), { lh: 28 });
        sub(195, 390, '빈칸이 이 앱의 값으로 채워진다', fade(u, 2.0), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); }
      return; }
    // k3, k4: 렌더 결과
    terminal(30, 30, 560, 360, ['$ helm template web-app ./web-app'].concat(k === 3 ? OUTL : ['spec:', '  replicas: 3', '  …', '  image: registry.mycorp.io/web-app:2.3.0', '  ports:', '    - containerPort: 8080']), lerp(1, 7, E(u, 0.2, 1.6)), { title: 'helm template (발췌)', lh: 32, fs: 14.5 });
    if (k === 3) { [[4, 5]].forEach(() => { el('path', { d: 'M600,206 h10 V262 h-10', fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 1.7) }); });
      note(626, 240, '앱은 라벨을 한 줄도 안 썼다', fade(u, 1.8), { fill: ACC }); note(626, 120, 'name·instance·managed-by', fade(u, 1.4)); sub(760, 150, '쿠버네티스 표준 라벨도 함께', fade(u, 1.5), { 'font-size': 14 }); return; }
    [['replicas', '3', 'replicaCount'], ['image', 'web-app:2.3.0', 'image.repository·tag'], ['containerPort', '8080', 'service.port']].forEach(([a, b, from], i) => { const y = 90 + i * 90, s = pop(u, 1.0 + i * 0.35);
      card(770, y, 300, 66, { rx: 10, stroke: ACC, fill: ACCBG, s }); mono(632, y - 6, a, { 'font-size': 14, fill: MUT, opacity: s > 0.5 ? 1 : 0 });
      mono(632, y + 20, b, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: s > 0.5 ? 1 : 0 }); mono(908, y - 6, '← ' + from, { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', opacity: s > 0.5 ? 1 : 0 }); });
    sub(770, 372, 'values만 바꾸면 다른 앱의 Deployment', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 5. 조직 표준 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { fileCard(30, 30, 330, 'common/templates/_probes.tpl', [['define "common.probes"', { col: INFO, hot: true, hotFill: INFOBG }], ['livenessProbe: /healthz', { op: k >= 1 ? 1 : 0.25 }], ['  initialDelaySeconds: 10', { op: k >= 1 ? 1 : 0.25 }], ['readinessProbe: /ready', { op: k >= 2 ? 1 : 0.25 }], ['  initialDelaySeconds: 5', { op: k >= 2 ? 1 : 0.25 }], ['port: .Values.service.port', { col: WARN, op: k >= 1 ? 1 : 0.25 }]].map(([s, o]) => [s, Object.assign({ fs: 13.5 }, o)]), { lh: 28 });
      // 시간축: 컨테이너 시작 후 초
      const ax = R.axes(430, 100, 470, 200, { x: [0, 15], y: [0, 2], xt: [0, 5, 10, 15], xl: '컨테이너 시작 후 (초)' });
      [['liveness', 10, '/healthz', 1, ACC], ['readiness', 5, '/ready', 2, INFO]].forEach(([nm, d, path, at, col], i) => { if (k < at) return; const y = 100 + 60 + i * 90, now = k === at;
        const g = now ? E(u, 0.3, 1.4) : 1; el('line', { x1: ax.X(0), y1: y, x2: ax.X(d * g), y2: y, stroke: OFF, 'stroke-width': 8, 'stroke-linecap': 'round' });
        tx(ax.X(0), y - 14, nm, { 'font-size': 14.5, 'font-weight': 700, fill: col });
        if (g > 0.98) { el('circle', { cx: ax.X(d), cy: y, r: 8, fill: col }); mono(ax.X(d) + 14, y + 5, `GET ${path} :8080`, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: now ? fade(u, 1.4) : 1 }); } });
      if (k === 0) { note(440, 360, '헬스체크 골격도 라벨처럼 조각으로 뺀다', fade(u, 0.8)); }
      if (k === 2) sub(660, 380, '두 probe를 한 조각으로 함께 물려준다', fade(u, 2.0), { 'font-size': 14.5 });
      return; }
    if (k === 3) { const steps = [['vim common/templates/_labels.tpl', '라벨 규칙 변경'], ['helm package common --version 1.1.0', '1.1.0으로 패키징'], ['helm push common-1.1.0.tgz oci://…', '레지스트리에 올림']];
      steps.forEach(([cmd, why], i) => { const y = 80 + i * 70, op = fade(u, 0.2 + i * 0.5); mono(40, y, '$ ' + cmd, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); tx(40, y + 24, why, { 'font-size': 14, fill: MUT, opacity: op }); });
      const v = E(u, 1.0, 1.6); card(760, 150, 220, 90, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.4 });
      tx(760, 130, 'common 버전', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(760, 168, v > 0.5 ? '1.1.0' : '1.0.0', { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: Math.abs(v - 0.5) * 2 });
      note(560, 330, '고치는 곳은 라이브러리 한 곳', fade(u, 2.1), { fill: ACC }); return; }
    // k4: 앱마다 버전만 올린다
    const APPS = ['web-app', 'api-app', 'worker-app'];
    card(480, 70, 220, 50, { rx: 12, stroke: ACC, fill: ACCBG, text: 'common 1.1.0', fs: 16, mono: true, color: ACC });
    APPS.forEach((a, i) => { const x = 180 + i * 300, at = 0.4 + i * 0.55, f = E(u, at, at + 0.4);
      el('path', { d: `M480,95 C480,150 ${x},140 ${x},190`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: f });
      card(x, 240, 220, 96, { rx: 12, stroke: f > 0.5 ? ACC : INK, sw: 2 }); mono(x, 222, a, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle' });
      mono(x, 254, 'common ' + (f > 0.5 ? '1.1.0' : '1.0.0'), { 'font-size': 14.5, 'text-anchor': 'middle', fill: f > 0.5 ? ACC : MUT, 'font-weight': 700 });
      if (f > 0.9) check(x + 80, 226, 8, pop(u, at + 0.4)); });
    mono(40, 340, '$ sed -i s/1.0.0/1.1.0/ web-app/Chart.yaml', { 'font-size': 14, opacity: fade(u, 0.3) });
    mono(40, 366, '$ helm dependency update web-app && helm upgrade web-app ./web-app', { 'font-size': 14, opacity: fade(u, 0.6) });
    sub(480, 404, '앱은 dependency 버전만 올리고 업그레이드한다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 600 }); }

  const quiz = [
    { q: 'helm install common ./common이 "library charts are not installable"로 거절되는 까닭은 무엇인가?',
      o: ['Chart.yaml에 appVersion이 없어서', 'type: library라 렌더할 매니페스트 없이 조각만 담고 있어서', 'OCI 레지스트리에 아직 올리지 않아서'], a: 1,
      why: 'library 차트는 밑줄 파일의 define 조각만 담는다. 렌더할 리소스가 0개라 Helm이 설치를 거절하고, 다른 차트가 가져다 쓴다.' },
    { q: 'common.deployment 골격에서 selector의 matchLabels로 쓸 수 있는 라벨은 무엇인가?',
      o: ['common.labels가 Pod에 붙이는 라벨 중 하나', 'common.labels에 없는 app 라벨', 'values.yaml의 아무 키'], a: 0,
      why: 'Deployment는 selector가 Pod 템플릿 라벨과 맞아야 받아들여진다. 그래서 common.labels 안에 있는 instance 라벨을 골랐다.' },
    { q: 'web-app의 Chart.yaml에 common을 적은 뒤 include를 쓰려면 먼저 무엇을 해야 하는가?',
      o: ['helm package common', 'helm dependency update로 charts/에 내려받기', 'common의 type을 application으로 바꾸기'], a: 1,
      why: 'dependencies는 적기만 해서는 안 된다. helm dependency update가 common-1.0.0.tgz를 charts/에 넣어야 common.* 조각을 부를 수 있다.' },
    { q: 'web-app이 include "common.deployment" .로 렌더하면 컨테이너 이름(.Chart.Name)은 무엇이 되는가?',
      o: ['common', 'web-app', '빈 문자열'], a: 1,
      why: '넘긴 점(.)은 부르는 차트 web-app의 컨텍스트다. 라이브러리 조각 안의 .Chart도 web-app을 가리킨다.' },
    { q: '조직 라벨 규칙을 바꿀 때 각 앱 팀이 할 일은 무엇인가?',
      o: ['자기 deployment.yaml의 labels를 직접 고친다', 'common 의존 버전을 1.1.0으로 올리고 dependency update·upgrade 한다', 'common 차트를 helm install 한다'], a: 1,
      why: '라벨 규칙은 라이브러리 한 곳에서 고쳐 1.1.0으로 올린다. 앱은 버전만 올려 받아 가면 된다.' },
  ];

  const summary = [
    'Chart.yaml의 type: library는 설치할 수 없고 define 조각만 담는 차트를 뜻한다.',
    '라이브러리에는 빈칸이 있는 Deployment 골격을 한 벌 두고, 값은 부르는 앱에서 받는다.',
    '앱은 dependencies에 적고 helm dependency update로 받은 뒤 include 한 줄로 부른다.',
    '라벨·probe 같은 표준은 라이브러리만 1.1.0으로 올리면 앱이 버전을 바꿔 받아 간다.',
  ];
  const review = [
    { q: '라이브러리 골격으로 만든 Deployment를 적용했더니 selector가 템플릿 라벨과 맞지 않는다는 에러가 났다. 먼저 볼 곳은?',
      o: ['matchLabels의 라벨이 common.labels 안에 있는지', 'helm dependency update를 다시 돌렸는지', 'appVersion을 적었는지'], a: 0,
      why: 'selector는 Pod 템플릿 라벨의 일부여야 한다. Pod 라벨을 common.labels가 붙이므로 matchLabels는 그 안의 instance 라벨처럼 골라야 한다.' },
    { q: 'api-app이 include "common.deployment"를 쓰는데 렌더 결과에 web-app의 이미지가 나온다. 가장 의심할 것은?',
      o: ['common 라이브러리 버전이 낮다', 'api-app의 values.yaml에 image 값을 web-app 것으로 적었다', 'include 대신 template을 썼다'], a: 1,
      why: '골격의 빈칸은 부르는 앱의 .Values로 채워진다. 이미지가 틀렸다면 그 앱의 values.yaml부터 본다.' },
    { q: 'common의 _labels.tpl을 고친 뒤 helm package common만 했더니 common-1.0.0.tgz가 다시 나왔다. 빠진 것은?',
      o: ['--version 1.1.0을 주거나 Chart.yaml의 version을 올리는 것', 'type을 application으로 바꾸는 것', 'web-app에서 helm test를 돌리는 것'], a: 0,
      why: 'helm package는 Chart.yaml의 version으로 파일 이름과 버전을 정한다. 번호를 올려야 앱이 새 표준을 1.1.0으로 받아 갈 수 있다.' },
  ];

  R.page({ title: '라이브러리 차트 골격 렌더', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
