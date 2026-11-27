/* I-1-1 Chart 구조 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, server, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  // YAML·템플릿 한 줄 색칠: 주석 회색, 키 검정, 값 파랑, {{ }} 주황
  function yspans(line) {
    if (/^\s*#/.test(line)) return [[line, { fill: MUT }]];
    if (/^\s*\$/.test(line)) return [[line, { fill: INFO, 'font-weight': 700 }]];
    let body = line, com = ''; const ci = line.search(/\s+#\s/); if (ci > 0) { body = line.slice(0, ci); com = line.slice(ci); }
    const out = []; let first = true;
    body.split(/(\{\{.*?\}\})/).forEach((p) => { if (!p) return;
      if (p.startsWith('{{')) out.push([p, { fill: WARN, 'font-weight': 700 }]);
      else if (first) { const m = p.match(/^(\s*-?\s*)([^:\s{][^:]*:)(.*)$/); if (m) { out.push([m[1] + m[2], { fill: INK, 'font-weight': 600 }]); if (m[3]) out.push([m[3], { fill: ACC }]); } else out.push([p, { fill: INK }]); }
      else out.push([p, { fill: ACC }]);
      first = false; });
    if (com) out.push([com, { fill: MUT }]);
    return out; }
  // 코드 판: lines 배열, o.show(보이는 줄 수, 소수면 마지막 줄이 서서히), o.hi(강조 줄 번호 배열), o.title
  function codeBox(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, top = o.title ? 32 : 12, h = o.h || top + lines.length * lh + 8, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, opacity: op });
    if (o.title) { el('line', { x1: x, y1: y + 26, x2: x + w, y2: y + 26, stroke: GRID, 'stroke-width': 1.2, opacity: op }); mono(x + 12, y + 18, o.title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); }
    lines.forEach((ln, i) => { const a = o.show == null ? 1 : clamp(o.show - i); if (a <= 0) return; const by = y + top + i * lh;
      if (o.hi && o.hi.includes(i)) el('rect', { x: x + 4, y: by + 1, width: w - 8, height: lh, rx: 4, fill: o.hiCol || ACCBG, opacity: op * a });
      spans(x + 12, by + fs + 1, yspans(ln), { 'font-size': fs, opacity: op * a }); });
    return { h, y: (i) => y + top + i * lh + fs * 0.65 }; }
  // 폴더·파일 아이콘 (왼쪽 위 기준 18×14)
  function folderIc(x, y, col, op) { el('path', { d: `M${x},${y + 3} h6 l2,-3 h10 v14 h-18 z`, fill: col === ACC ? ACCBG : PANEL, stroke: col || INK, 'stroke-width': 1.8, opacity: op ?? 1 }); }
  function fileIc(x, y, col, op) { el('path', { d: `M${x + 2},${y - 1} h9 l5,5 v12 h-14 z`, fill: PANEL, stroke: col || INK, 'stroke-width': 1.8, opacity: op ?? 1 }); }
  const chip = (x, y, s, col, sc, o) => pill(x, y, s, col, sc, Object.assign({ mono: true, fs: 13.5 }, o || {}));
  // 스위치 (on/off)
  function toggle(x, y, on, s) { const g = R.G(x, y, s ?? 1); el('rect', { x: -18, y: -10, width: 36, height: 20, rx: 10, fill: on ? GOOD : OFF }, g); el('circle', { cx: on ? 8 : -8, cy: 0, r: 7, fill: PANEL }, g); }
  // 클러스터 아이콘 (조타륜 대신 둥근 판 + 이름)
  function cluster(cx, cy, w, h, name, o) { o = o || {}; card(cx, cy, w, h, { rx: 14, stroke: o.stroke || INFO, sw: 2, fill: o.fill || INFOBG, dash: o.dash, s: o.s, op: o.op });
    tx(cx, cy + 5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: o.stroke || INFO, opacity: o.op ?? 1 }); }

  // =========================================================
  // 1. helm create — 폴더가 하나씩 생긴다
  // =========================================================
  const ROOT = [ // [이름, 폴더?, 나타나는 beat, 역할]
    ['webapp/', 1, 0, ''], ['Chart.yaml', 0, 1, '신원 (이름·버전)'], ['values.yaml', 0, 1, '기본 설정값'], ['charts/', 1, 1, '의존 차트 자리'],
    ['templates/', 1, 2, ''], ['.helmignore', 0, 4, 'package 때 뺄 목록']];
  const TPL = [['deployment.yaml', 2], ['service.yaml', 2], ['ingress.yaml', 2], ['httproute.yaml', 2], ['serviceaccount.yaml', 2], ['hpa.yaml', 2],
    ['NOTES.txt', 3, '설치 후 안내문'], ['_helpers.tpl', 3, '재사용 블록'], ['tests/', 3, ''], ['test-connection.yaml', 3, 'helm test 용']];
  function s1(t, c) { const { k, u } = c, A = (b) => (k === b ? E(u, 0.2, 1.0) : k > b ? 1 : 0);
    R.terminal(24, 16, 330, 100, ['$ helm create webapp', 'Creating webapp'], k === 0 ? Math.min(2, lerp(0.3, 2, E(u, 0.1, 1.4))) : 2, { title: 'bash' });
    // 왼쪽: 루트
    const ys = [150, 184, 214, 244, 274, 304];
    if (A(1) > 0) el('line', { x1: 49, y1: 166, x2: 49, y2: lerp(166, k >= 4 ? 304 : k >= 2 ? 274 : 244, A(k >= 4 ? 4 : k >= 2 ? 2 : 1)), stroke: GRID, 'stroke-width': 2 });
    ROOT.forEach(([nm, isDir, b, role], i) => { const a = A(b); if (a <= 0) return; const x = i ? 70 : 40, y = ys[i], dx = (1 - a) * -24;
      if (i) el('line', { x1: 49, y1: y, x2: 64, y2: y, stroke: GRID, 'stroke-width': 2, opacity: a });
      (isDir ? folderIc : fileIc)(x + dx, y - 8, i === 4 ? WARN : INK, a);
      mono(x + 26 + dx, y + 5, nm, { 'font-size': 15, 'font-weight': 700, opacity: a, fill: k === 5 && i > 0 ? (i === 4 ? WARN : ACC) : INK });
      if (role) tx(212, y + 5, role, { 'font-size': 13.5, fill: k === 5 ? INK : MUT, 'font-weight': k === 5 ? 700 : 400, opacity: a }); });
    // 오른쪽: templates/ 안
    if (k >= 2) { const a = A(2); zone(410, 22, 530, 306, 'templates/ 안', { stroke: WARN, sw: 1.8, fill: WARNBG, op: a, color: WARN });
      grow(180, 274, 404, 274, A(2), WARN); }
    TPL.forEach(([nm, b, role], i) => { const a = k === b ? E(u, 0.3 + (i % 6) * 0.15, 0.9 + (i % 6) * 0.15) : k > b ? 1 : 0; if (a <= 0) return;
      const x = i === 9 ? 460 : 430, y = 66 + i * 26.5, aux = b === 3;
      (i === 8 ? folderIc : fileIc)(x, y - 8, aux ? MUT : INK, a);
      mono(x + 26, y + 5, nm, { 'font-size': 14.5, 'font-weight': 700, fill: aux ? MUT : INK, opacity: a });
      if (role) tx(700, y + 5, role, { 'font-size': 13.5, fill: MUT, opacity: a }); });
    if (k >= 2) { const a = A(2); el('path', { d: 'M668,58 h10 v150 h-10', fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: a });
      tx(690, 138, '렌더하면', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: a }); tx(690, 158, 'K8s 리소스가 된다', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: a }); }
    if (k >= 3) { const a = A(3); el('path', { d: 'M850,218 h10 v58 h-10', fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: a });
      tx(872, 244, 'K8s로', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: a }); tx(872, 262, '안 감', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: a }); }
    if (k === 4) { ['.git/', '.DS_Store', '*.swp'].forEach((s, i) => { const x = 90 + i * 100, y = lerp(336, 372, E(u, 0.8 + i * 0.25, 1.6 + i * 0.25)), a = fade(u, 0.8 + i * 0.25);
        chip(x, y, s, MUT, a, { color: MUT }); if (u > 1.7 + i * 0.25) cross(x + tw(s, 13.5) / 2 + 18, y - 12, 7, 1); });
      sub(170, 408, 'helm package로 묶을 때 빠진다', fade(u, 2.0), { 'font-size': 14, fill: INK }); }
    if (k === 5) [['Chart.yaml', '≈ package.json'], ['values.yaml', '≈ 설정 파일'], ['templates/', '≈ 소스 코드']].forEach(([a, b], i) => {
      const x = 170 + i * 300, s = pop(u, 0.3 + i * 0.35); card(x, 378, 270, 48, { rx: 12, stroke: ACC, sw: 2, s });
      mono(x - 116, 384, a, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.35) }); tx(x + 12, 384, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.35) }); });
    if (k === 6) { el('rect', { x: 14, y: 132, width: 932, height: 202, rx: 16, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.2) });
      chip(170, 378, '$ helm install web ./webapp', INFO, pop(u, 0.6), { color: INFO });
      grow(330, 378, 560, 378, E(u, 1.0, 1.7), ACC); dot([[330, 378], [560, 378]], seg(u, 1.0, 1.9), ACC, 7);
      cluster(690, 378, 240, 46, '클러스터에 배포', { s: pop(u, 1.7) });
      tx(40, 352, '이 폴더 하나 = 배포 단위', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) }); } }

  // =========================================================
  // 2. Chart.yaml — 신분증 칸이 하나씩 채워진다
  // =========================================================
  const CHART = [ // [줄, beat]
    ['apiVersion: v2', 0], ['name: webapp', 1], ['description: A Helm chart for my web application', 1], ['type: application', 2], ['version: 0.1.0', 3],
    ['appVersion: "1.16.0"', 4], ['kubeVersion: ">=1.24.0-0"', 5], ['home: https://example.com/webapp', 5], ['maintainers:', 5], ['  - name: dev-team', 5],
    ['dependencies:', 6], ['  - name: postgresql', 6], ['    version: 12.5.8', 6], ['  - name: redis', 6], ['    version: 17.4.0', 6]];
  function s2(t, c) { const { k, u } = c;
    const vis = CHART.filter(([, b]) => b <= k), cur = vis.map(([, b], i) => (b === k ? i : -1)).filter((i) => i >= 0);
    const first = cur[0] ?? 0, show = k === 7 ? vis.length : first + (cur.length) * E(u, 0.15, 0.9);
    codeBox(16, 14, 430, vis.map(([l]) => l), { title: 'webapp/Chart.yaml', fs: 13.5, lh: 21.5, show, hi: k === 7 ? [4, 5] : cur });
    const RX = 700;
    if (k === 0) { card(RX, 130, 380, 70, { rx: 12, stroke: GRID, s: pop(u, 0.4) }); mono(RX - 170, 125, 'apiVersion: v1', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.5) }); tx(RX - 170, 149, 'Helm 2 시절 차트', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      card(RX, 230, 380, 70, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 1.0) }); mono(RX - 170, 225, 'apiVersion: v2', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) }); tx(RX - 170, 249, 'Helm 3 표준 차트', { 'font-size': 14, fill: INK, opacity: fade(u, 1.1) });
      check(RX + 150, 230, 12, pop(u, 1.5)); sub(RX, 318, 'v2 여야 dependencies를 Chart.yaml 안에 적는다', fade(u, 1.9), { 'font-size': 14, fill: INK }); return; }
    if (k === 1) { folderIc(530, 92, INK); mono(556, 105, 'webapp/', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      mono(720, 105, '=', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6), 'text-anchor': 'middle' }); mono(760, 105, 'name: webapp', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      sub(700, 138, '폴더 이름과 차트 이름을 같게 둔다', fade(u, 0.9), { 'font-size': 14, fill: INK });
      R.terminal(480, 186, 450, 100, ['$ helm search repo webapp', ['repo/webapp  0.1.0  A Helm chart for my web…', 'var(--term)']], Math.min(2, lerp(0, 2, E(u, 1.0, 2.2))), { title: '검색 결과 (예시)' });
      sub(705, 312, 'description은 검색 결과 한 줄로 보인다', fade(u, 2.2), { 'font-size': 14, fill: INK }); return; }
    if (k === 2) { [['application', '배포용 차트 (기본값)', 'helm install 가능', ACC, 1], ['library', '다른 차트가 가져다 쓰는 블록', 'install 불가', MUT, 0]].forEach(([a, b, d, col, ok], i) => {
        const y = 110 + i * 130, s = pop(u, 0.3 + i * 0.6); card(RX, y, 400, 100, { rx: 12, stroke: col, sw: 2.2, fill: ok ? ACCBG : PANEL, s });
        mono(RX - 180, y - 16, 'type: ' + a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.6) }); tx(RX - 180, y + 10, b, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.6) });
        tx(RX - 180, y + 34, d, { 'font-size': 14, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, 0.7 + i * 0.6) }); (ok ? check : cross)(RX + 165, y, 12, pop(u, 0.8 + i * 0.6)); }); return; }
    if (k === 3) { const parts = [['0', 'major'], ['1', 'minor'], ['0', 'patch']];
      parts.forEach(([v, nm], i) => { const x = 560 + i * 120, s = pop(u, 0.3 + i * 0.3); card(x, 140, 84, 70, { rx: 10, stroke: ACC, sw: 2.2, text: v, fs: 30, mono: true, color: ACC, s });
        tx(x, 200, nm, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.3) }); if (i < 2) mono(x + 60, 152, '.', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.3) }); });
      tx(RX - 160, 262, '템플릿·values를 고치면 차트 version을 올린다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(RX - 160, 290, '안 올리면 저장소 캐시가 옛 차트를 내준다', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
      chip(RX - 40, 334, '1.0.0-rc1 같은 prerelease도 된다', MUT, pop(u, 2.2), { color: MUT, mono: false }); return; }
    if (k === 4) { card(RX, 110, 400, 84, { rx: 12, stroke: GOOD, sw: 2.2, s: pop(u, 0.3) }); mono(RX - 180, 104, 'appVersion: "1.16.0"', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      tx(RX - 180, 130, '문자열 "1.16.0" 그대로 남는다', { 'font-size': 14, opacity: fade(u, 0.5) }); check(RX + 165, 110, 12, pop(u, 0.8));
      card(RX, 220, 400, 84, { rx: 12, stroke: BAD, sw: 2.2, s: pop(u, 1.1) }); mono(RX - 180, 214, 'appVersion: 1.0', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      tx(RX - 180, 240, '따옴표가 없으면 숫자로 읽혀 1이 된다', { 'font-size': 14, opacity: fade(u, 1.3) }); cross(RX + 165, 220, 11, pop(u, 1.6));
      sub(RX, 300, '차트 version과 상관없는 앱(이미지)의 버전이다', fade(u, 2.0), { 'font-size': 14, fill: INK }); return; }
    if (k === 5) { card(RX - 110, 120, 200, 70, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 0.3) }); mono(RX - 110, 116, 'kubeVersion', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(RX - 110, 140, 'install 때 검사한다', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      card(RX + 120, 200, 210, 150, { rx: 12, stroke: GRID, s: pop(u, 1.0) }); tx(RX + 120, 152, 'Artifact Hub 카드', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.1) });
      ['home', 'maintainers', 'keywords · icon'].forEach((s, i) => tx(RX + 40, 186 + i * 26, s, { 'font-size': 14, opacity: fade(u, 1.3 + i * 0.25) }));
      sub(RX + 10, 312, '나머지는 사람이 읽는 정보, 렌더에는 영향 없다', fade(u, 2.1), { 'font-size': 14, fill: INK }); return; }
    if (k === 6) { const cx = 780, cy = 230; folderIc(cx - 70, cy - 70, INK); mono(cx - 44, cy - 57, 'charts/', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      card(cx, cy + 10, 240, 120, { rx: 12, stroke: GRID, dash: '5 4', s: 1, op: fade(u, 0.2) });
      [['postgresql-12.5.8.tgz', 'postgresql.enabled'], ['redis-17.4.0.tgz', 'redis.enabled']].forEach(([f, cond], i) => { const y = cy - 12 + i * 44, a = E(u, 0.8 + i * 0.4, 1.6 + i * 0.4);
        fileIc(lerp(520, cx - 104, a), y - 8, ACC, a); mono(lerp(546, cx - 80, a), y + 5, f, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: a }); });
      chip(560, 130, 'helm dependency update', INFO, pop(u, 0.4), { color: INFO });
      tx(530, 348, 'condition 값으로 의존 차트를 켜고 끈다', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.0) }); toggle(500, 343, true, pop(u, 2.0)); return; }
    // k7 두 버전
    [['version', '0.1.0', '차트(템플릿)', '템플릿·values가 바뀌면', ACC], ['appVersion', '"1.16.0"', '앱(이미지)', '앱 코드가 바뀌면', WARN]].forEach(([a, v, who, when, col], i) => {
      const y = 110 + i * 140, s = pop(u, 0.3 + i * 0.6); card(RX, y, 420, 110, { rx: 14, stroke: col, sw: 2.5, s });
      mono(RX - 190, y - 20, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.6) }); mono(RX + 190, y - 20, v, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.6) });
      tx(RX - 190, y + 10, who + '의 버전', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.6) }); tx(RX - 190, y + 36, when + ' 올린다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8 + i * 0.6) }); }); }

  // =========================================================
  // 3. values.yaml — .Values 나무가 자란다
  // =========================================================
  const VB = [ // [키, 왼쪽에 보일 yaml, 잎 두 줄]
    ['replicaCount', ['replicaCount: 2'], ['2', '']],
    ['image', ['image:', '  repository: nginx', '  tag: "1.25"', '  pullPolicy: IfNotPresent'], ['repository: nginx  tag: "1.25"', 'pullPolicy: IfNotPresent']],
    ['service', ['service:', '  type: ClusterIP', '  port: 80', '  targetPort: 8080'], ['type: ClusterIP  port: 80', 'targetPort: 8080']],
    ['ingress', ['ingress:', '  enabled: false', '  className: nginx', '  hosts:', '    - host: webapp.example.com', '      paths:', '        - path: /', '          pathType: Prefix'], ['enabled: false', 'hosts[0].host: webapp.example.com']],
    ['resources', ['resources:', '  limits:', '    cpu: 500m', '    memory: 256Mi', '  requests:', '    cpu: 100m', '    memory: 128Mi'], ['limits.cpu 500m · memory 256Mi', 'requests.cpu 100m · memory 128Mi']],
    ['autoscaling', ['autoscaling:', '  enabled: false', '  minReplicas: 1', '  maxReplicas: 5', '  targetCPUUtilizationPercentage: 80'], ['enabled: false  min 1 · max 5', 'targetCPU 80%']],
    ['env', ['env:', '  - name: APP_ENV', '    value: production', '  - name: LOG_LEVEL', '    value: info'], ['[0] APP_ENV = production', '[1] LOG_LEVEL = info']]];
  function vtree(k, u, o) { o = o || {}; const rx = 448, ry = 210;
    pill(rx, ry, '.Values', ACC, 1, { mono: true, fs: 15, fill: ACCBG });
    VB.forEach(([key, , leaf], i) => { const b = i, y = 34 + i * 54; if (k < b && !o.all) return;
      const a = k === b && !o.all ? E(u, 0.2, 0.9) : 1, on = k === b || (o.hot && o.hot(i));
      el('path', { d: `M${rx + 44},${ry} C${rx + 70},${ry} ${rx + 60},${y} ${lerp(rx + 44, 520, a)},${lerp(ry, y, a)}`, fill: 'none', stroke: on ? ACC : GRID, 'stroke-width': on ? 2.4 : 1.6 });
      if (a < 0.6) return;
      const w = tw(key, 14) + 22; card(520 + w / 2, y, w, 28, { rx: 14, stroke: on ? ACC : INK, sw: on ? 2.4 : 1.6, text: key, fs: 14, mono: true, fw: 700, color: on ? ACC : INK, fill: on ? ACCBG : PANEL });
      const lx = 520 + w + 14, la = k === b && !o.all ? fade(u, 0.9) : 1;
      const l0 = o.leaf && o.leaf(i) ? o.leaf(i) : leaf;
      mono(lx, y - 1 + (l0[1] ? 0 : 5), l0[0], { 'font-size': 13.5, fill: on ? INK : MUT, 'font-weight': on ? 700 : 400, opacity: la });
      if (l0[1]) mono(lx, y + 17, l0[1], { 'font-size': 13.5, fill: on ? INK : MUT, opacity: la }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k < 7) { const lines = VB[k][1]; codeBox(16, 14, 370, lines, { title: 'values.yaml', fs: 14, lh: 22, show: lines.length * E(u, 0.1, 0.8), hi: [0] });
      vtree(k, u);
      const ny = 30 + lines.length * 22 + 40, nx = 200;
      if (k === 0) sub(nx, ny, '최상위 키 = .Values의 1단계', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      if (k === 1) { chip(110, ny, 'tag: 1.25', BAD, pop(u, 1.1), { color: BAD }); tx(170, ny + 5, '→ 숫자', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.2) });
        chip(110, ny + 42, 'tag: "1.25"', GOOD, pop(u, 1.6), { color: GOOD }); tx(180, ny + 47, '→ 문자열', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.7) }); }
      if (k === 2) { card(90, ny + 10, 120, 48, { rx: 10, stroke: INFO, text: 'Service :80', fs: 14, mono: true, color: INFO, s: pop(u, 1.0) });
        grow(152, ny + 10, 226, ny + 10, E(u, 1.4, 1.9), ACC); card(300, ny + 10, 140, 48, { rx: 10, stroke: ACC, text: '컨테이너 :8080', fs: 14, color: ACC, s: pop(u, 1.8) }); }
      if (k === 3) { toggle(60, ny + 150, false, pop(u, 1.2)); tx(90, ny + 155, 'Ingress는 렌더되지 않는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) }); }
      if (k === 4) { ['.Values', '.resources', '.limits', '.cpu'].forEach((s, i) => chip(56 + i * 88 + (i ? 8 : 0), ny, s, ACC, pop(u, 1.0 + i * 0.25), { color: ACC }));
        mono(200, ny + 40, '→ 500m', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) }); }
      if (k === 5) { toggle(60, ny, false, pop(u, 1.2)); tx(90, ny + 5, 'HPA를 만들지 않는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) });
        tx(40, ny + 36, '켜면 replicaCount는 무시된다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
      if (k === 6) { chip(150, ny, '--set env[0].value=dev', WARN, pop(u, 1.2), { color: WARN }); tx(40, ny + 38, '배열은 -f 파일로 넘기는 편이 쉽다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
      return; }
    // k7 덮어쓰기
    codeBox(16, 14, 370, ['$ helm install web ./webapp \\', '    -f prod-values.yaml', '$ helm install web ./webapp \\', '    --set image.tag=2.0 \\', '    --set replicaCount=5'], { title: '사용자가 덮어쓰는 법', fs: 14, lh: 22, show: 5 * E(u, 0.1, 0.9), hi: [3, 4] });
    const lad = ['values.yaml', '-f 파일', '--set', '--set-string'];
    lad.forEach((s, i) => { const y = 330 - i * 30, w = 170 + i * 22, a = pop(u, 0.6 + i * 0.25); card(200, y, w, 26, { rx: 6, stroke: i === 3 ? ACC : GRID, text: s, fs: 13.5, mono: true, fw: 700, color: i >= 2 ? ACC : INK, s: a }); });
    tx(200, 382, '아래 → 위로 갈수록 세다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
    const f = E(u, 1.4, 2.2);
    vtree(7, u, { all: true, hot: (i) => i <= 1, leaf: (i) => i === 0 ? [f > 0.5 ? '5   (기본값 2)' : '2', ''] : i === 1 ? [f > 0.5 ? 'tag: "2.0"  (기본값 "1.25")' : 'repository: nginx  tag: "1.25"', 'pullPolicy: IfNotPresent'] : null }); }

  // =========================================================
  // 4. templates/ — 표현식이 하나씩 풀린다
  // =========================================================
  const top = (lines, u, o) => codeBox(16, 12, 928, lines, Object.assign({ title: 'templates/deployment.yaml', fs: 15, lh: 24, show: lines.length * E(u, 0.1, 0.7) }, o || {}));
  function arrowDn(x, y1, y2, u, col) { grow(x, y1, x, y2, u, col || ACC); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // 파일이 이름 규칙대로 상자에 떨어진다
      const bins = [['*.yaml', '렌더 → K8s 전송', ACC], ['_*.tpl', '보조 (전송 안 함)', MUT], ['NOTES.txt', '설치 후 안내', MUT], ['tests/*.yaml', 'helm test 때만', WARN]];
      bins.forEach(([n, d, col], i) => { const x = 130 + i * 233, s = pop(u, 0.2 + i * 0.15); card(x, 320, 200, 96, { rx: 12, stroke: col, sw: 2.2, fill: i === 0 ? ACCBG : PANEL, s });
        mono(x, 312, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.15) }); tx(x, 338, d, { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.3 + i * 0.15) }); });
      [['deployment.yaml', 0], ['_helpers.tpl', 1], ['service.yaml', 0], ['NOTES.txt', 2], ['test-connection.yaml', 3]].forEach(([f, b], i) => {
        const t0 = 0.6 + i * 0.3, a = E(u, t0, t0 + 0.8), x0 = 120 + i * 175, x1 = 130 + b * 233, y = lerp(60, f === 'service.yaml' ? 216 : 250, a);
        chip(lerp(x0, x1, a), y, f, b === 0 ? ACC : b === 3 ? WARN : MUT, u > t0 ? 1 : 0, { color: b === 0 ? ACC : b === 3 ? WARN : MUT }); });
      tx(480, 200, '파일 이름이 처리 방식을 정한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { top(['metadata:', '  name: {{ include "webapp.fullname" . }}', '  labels:', '    {{- include "webapp.labels" . | nindent 4 }}'], u, { hi: [1, 3] });
      codeBox(16, 150, 400, ['{{- define "webapp.fullname" -}}', '  web-webapp를 만든다', '{{- define "webapp.labels" -}}', '  표준 라벨 5줄을 만든다'], { title: '_helpers.tpl', fs: 14, lh: 22, show: 4 * E(u, 0.5, 1.2), hiCol: WARNBG, hi: [0, 2] });
      grow(420, 210, 520, 210, E(u, 1.3, 1.8), ACC); tx(470, 200, 'include', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      const out = ['metadata:', '  name: web-webapp', '  labels:', '    helm.sh/chart: webapp-0.1.0', '    app.kubernetes.io/name: webapp', '    app.kubernetes.io/instance: web', '    app.kubernetes.io/version: "1.16.0"', '    app.kubernetes.io/managed-by: Helm'];
      codeBox(530, 150, 414, out, { title: '결과', fs: 13.5, lh: 20, show: out.length * E(u, 1.6, 2.5), hi: [1] }); return; }
    if (k === 2) { top(['spec:', '  replicas: {{ .Values.replicaCount }}'], u, { hi: [1] });
      const y = 220; chip(250, y, '{{ .Values.replicaCount }}', WARN, pop(u, 0.6), { color: WARN, fs: 15 });
      grow(390, y, 560, y, E(u, 1.0, 1.6), MUT, { dash: '6 5' }); tx(475, y - 12, '경로만 적는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      codeBox(580, y - 38, 250, ['replicaCount: 2'], { title: 'values.yaml', fs: 15, lh: 24, op: fade(u, 1.3) });
      tx(480, 330, '값은 렌더하는 순간 정해진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { top(['image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"'], u, { hi: [0] });
      const y = 150; chip(180, y, '.Values.image.repository', ACC, pop(u, 0.4), { color: ACC }); mono(180, y + 40, '"nginx"', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.7) });
      chip(560, y, '.Values.image.tag | default .Chart.AppVersion', WARN, pop(u, 0.8), { color: WARN });
      // 두 갈래: tag 가 있으면 / 비었으면
      [['tag = "1.25"', 'nginx:1.25', GOOD], ['tag 비어 있음', 'nginx:1.16.0', WARN]].forEach(([cond, res, col], i) => { const x = 420 + i * 300, yy = 250, a = E(u, 1.2 + i * 0.5, 1.8 + i * 0.5);
        grow(560, y + 18, x, yy - 26, a, col === GOOD ? ACC : MUT); tx(x, yy - 34 - 0, '', {});
        card(x, yy + 8, 230, 66, { rx: 12, stroke: col, sw: 2.2, s: a > 0.9 ? 1 : 0 }); tx(x, yy - 2, cond, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7 + i * 0.5) });
        mono(x, yy + 26, res, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 1.8 + i * 0.5) }); });
      sub(480, 372, 'default는 앞 값이 비었을 때만 뒤 값(appVersion "1.16.0")을 쓴다', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { top(['resources:', '  {{- toYaml .Values.resources | nindent 12 }}'], u, { hi: [1] });
      codeBox(16, 116, 290, ['limits: {cpu: 500m, memory: 256Mi}', 'requests: {cpu: 100m, memory: 128Mi}'], { title: '.Values.resources (맵)', fs: 13.5, lh: 22, op: fade(u, 0.4) });
      grow(310, 160, 370, 160, E(u, 0.8, 1.2), ACC); tx(340, 150, 'toYaml', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      const out = ['limits:', '  cpu: 500m', '  memory: 256Mi', 'requests:', '  cpu: 100m', '  memory: 128Mi'], sh = E(u, 1.4, 2.4) * 12;
      el('rect', { x: 380, y: 116, width: 564, height: 170, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
      for (let i = 0; i < 12; i++) el('circle', { cx: 396 + i * 8.4 + 4, cy: 132, r: 2.2, fill: i < sh ? WARN : GRID });
      tx(510, 137, 'nindent 12 = 줄마다 앞에 12칸', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.3) });
      out.forEach((l, i) => mono(392 + sh * 8.4, 162 + i * 20, l, { 'font-size': 14, fill: INK, opacity: fade(u, 1.0 + i * 0.08) }));
      sub(480, 330, '들여쓰기 숫자가 틀리면 YAML이 깨진다. 계산은 함수에 맡긴다', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { top(['{{- if .Values.env }}', 'env:', '  {{- toYaml .Values.env | nindent 12 }}', '{{- end }}'], u, { hi: [0, 3] });
      [['env가 2개', ['env:', '  - name: APP_ENV', '    value: production', '  - name: LOG_LEVEL', '    value: info'], true], ['env: []', [], false]].forEach(([cond, out, on], i) => {
        const x = 30 + i * 470, a = fade(u, 0.8 + i * 0.6); toggle(x + 20, 158, on, a); tx(x + 48, 163, cond, { 'font-size': 15, 'font-weight': 700, opacity: a, class: 'mono' });
        if (on) codeBox(x, 180, 420, out, { fs: 13.5, lh: 20, show: out.length * E(u, 1.2, 2.0), stroke: GOOD });
        else { el('rect', { x, y: 180, width: 420, height: 112, rx: 10, fill: 'none', stroke: GRID, 'stroke-dasharray': '6 5', opacity: a });
          tx(x + 210, 242, '블록이 통째로 빠진다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.8) }); } });
      sub(480, 336, '{{- 의 - 는 앞쪽 공백·줄바꿈을 먹어 빈 줄을 남기지 않는다', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 6) { top(['{{- with .Values.nodeSelector }}', 'nodeSelector:', '  {{- toYaml . | nindent 8 }}', '{{- end }}'], u, { hi: [0, 2] });
      const bx = 120, by = 270; pill(bx, by, '$ = 맨 위 (루트)', MUT, pop(u, 0.5), { fs: 14 }); pill(bx + 300, by, '.Values', INK, pop(u, 0.6), { mono: true, fs: 14 }); pill(bx + 520, by, '.nodeSelector', ACC, pop(u, 0.7), { mono: true, fs: 14, fill: ACCBG });
      grow(bx + 70, by, bx + 250, by, E(u, 0.8, 1.1), GRID, { plain: true }); grow(bx + 350, by, bx + 455, by, E(u, 0.9, 1.2), GRID, { plain: true });
      const p = E(u, 1.2, 2.0), px = lerp(bx + 300, bx + 520, p); el('circle', { cx: px, cy: by - 34, r: 9, fill: ACC }); mono(px, by - 50, '.', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC });
      tx(480, 340, 'with 안에서 . 은 nodeSelector 자신. 밖의 값은 $.Values로 부른다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) });
      chip(820, 380, 'nodeSelector: {} → 렌더 안 됨', MUT, pop(u, 2.3), { color: MUT }); return; }
    if (k === 7) { // 내장 객체 다섯 갈래
      const src = [['.Values', 'values.yaml + -f + --set', ACC], ['.Chart', 'Chart.yaml', INK], ['.Release', 'helm install 명령 (이름·ns)', WARN], ['.Files', '차트 안 파일', MUT], ['.Capabilities', '클러스터 버전·API', INFO]];
      card(480, 210, 170, 70, { rx: 14, stroke: ACC, sw: 2.5, fill: ACCBG, text: '템플릿', fs: 17, color: ACC, s: pop(u, 0.2) });
      src.forEach(([o, from, col], i) => { const left = i < 3, y = left ? 90 + i * 120 : 130 + (i - 3) * 160, x = left ? 170 : 800, a = E(u, 0.4 + i * 0.3, 1.0 + i * 0.3);
        card(x, y, 240, 62, { rx: 12, stroke: col, sw: 2, s: a > 0.5 ? 1 : 0 }); mono(x, y - 4, o, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: a });
        tx(x, y + 19, from, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: a });
        grow(left ? x + 120 : x - 120, y, left ? 395 : 565, 210, E(u, 0.8 + i * 0.3, 1.3 + i * 0.3), col === INK ? MUT : col === MUT ? MUT : ACC); });
      sub(480, 400, '.Release는 차트 안에 없다. install 명령에서 온다', fade(u, 2.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k8 함수 체인과 trim
    top(['          resources:⏎', '            {{- toYaml .Values.resources | nindent 12 }}'], u, { hi: [1] });
    const st = [['.Values.resources', ACC], ['toYaml', WARN], ['nindent 12', WARN]];
    st.forEach(([s, col], i) => { const x = 170 + i * 300; card(x, 190, 230, 54, { rx: 12, stroke: col, sw: 2.2, text: s, fs: 15, mono: true, color: col, s: pop(u, 0.4 + i * 0.35) });
      if (i < 2) { grow(x + 118, 190, x + 182, 190, E(u, 0.7 + i * 0.35, 1.0 + i * 0.35), ACC); mono(x + 150, 180, '|', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.7) }); } });
    for (let i = 0; i < 4; i++) dot([[55, 190], [885, 190]], ((u * 0.5 + i / 4) % 1) * (u > 1.4 ? 1 : 0), ACC, 5);
    const eat = E(u, 1.6, 2.4); ['⎵', '⎵', '⏎'].forEach((s, i) => mono(330 + i * 26, 300, s, { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: 1 - eat, 'text-anchor': 'middle' }));
    mono(420 - eat * 40, 302, '{{-', { 'font-size': 20, 'font-weight': 800, fill: WARN });
    tx(520, 302, '앞의 공백과 줄바꿈을 먹는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    sub(480, 370, 'Go text/template 문법 위에 sprig 함수들이 붙어 있다', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); }

  // =========================================================
  // 5. helm template — 문서가 하나씩 나온다
  // =========================================================
  const DOCS = [
    ['ServiceAccount', ['# Source: webapp/templates/serviceaccount.yaml', 'kind: ServiceAccount', 'metadata:', '  name: web-webapp', '  labels:', '    helm.sh/chart: webapp-0.1.0', '    app.kubernetes.io/name: webapp', '    app.kubernetes.io/instance: web', '    app.kubernetes.io/version: "1.16.0"', '    app.kubernetes.io/managed-by: Helm']],
    ['Service', ['# Source: webapp/templates/service.yaml', 'kind: Service', 'metadata:', '  name: web-webapp', '  labels: (같은 5줄)', 'spec:', '  type: ClusterIP', '  ports:', '    - port: 80', '      targetPort: 8080', '      protocol: TCP']],
    ['Deployment', ['# Source: webapp/templates/deployment.yaml', 'kind: Deployment', 'metadata:', '  name: web-webapp', '  labels: (같은 5줄)', 'spec:', '  replicas: 2', '  template.spec.containers:', '    - name: webapp', '      image: "nginx:1.25"', '      containerPort: 8080']]];
  function engine(u0, o) { o = o || {}; const ins = [['Chart.yaml', 60], ['values.yaml', 110], ['templates/', 160]];
    ins.forEach(([s, y], i) => { const a = o.fly ? E(u0, 0.2 + i * 0.25, 0.9 + i * 0.25) : 1; chip(lerp(90, 90, a), y, s, i === 1 ? ACC : i === 2 ? WARN : INK, 1, { color: i === 1 ? ACC : i === 2 ? WARN : INK });
      if (o.fly) dot([[160, y], [228, 110]], seg(u0, 0.5 + i * 0.25, 1.2 + i * 0.25), ACC, 6); else grow(160, y, 222, 110, 1, GRID, { plain: true }); });
    card(268, 110, 86, 62, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'helm\ntemplate', fs: 14, color: ACC }); }
  function docCard(d, u, o) { o = o || {}; const [kind, lines] = DOCS[d], x = 340, y = 56;
    // 문서 탭 (몇 번째 문서인지)
    DOCS.forEach(([kn], i) => { if (i > d) return; const on = i === d; card(410 + i * 190, 30, 170, 30, { rx: 8, stroke: on ? ACC : GRID, sw: on ? 2.2 : 1.4, text: '--- ' + kn, fs: 13.5, mono: true, color: on ? ACC : MUT, fill: on ? ACCBG : PANEL }); });
    grow(312, 110, 336, 110, 1, ACC);
    return codeBox(x, y, 604, lines, Object.assign({ fs: 14.5, lh: 23.5 }, o)); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { engine(u, { fly: true });
      cluster(640, 230, 280, 80, '클러스터', { stroke: MUT, fill: SOFT, dash: '6 5', s: pop(u, 0.5) }); cross(790, 196, 12, pop(u, 1.4));
      tx(640, 310, '아무것도 보내지 않는다. 문자열만 만든다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      chip(640, 120, '-f / --set 값도 여기서 합쳐진다', ACC, pop(u, 2.0), { color: ACC, mono: false }); return; }
    if (k === 8) return s5end(u);
    engine(u);
    if (k === 1) { docCard(0, u, { show: 4 * E(u, 0.3, 1.4), hi: [1] }); sub(640, 410, '--- 로 나뉜 문서들이 한 스트림으로 나온다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { docCard(0, u, { show: 4 + 6 * E(u, 0.2, 1.4), hi: [7, 9] });
      chip(150, 280, '.Release.Name = web', WARN, pop(u, 1.5), { color: WARN }); chip(150, 330, '.Release.Service = Helm', WARN, pop(u, 1.9), { color: WARN }); return; }
    if (k === 3) { docCard(1, u, { show: 5 * E(u, 0.2, 1.0), hi: [3] });
      const y = 240; chip(80, y, 'web', WARN, pop(u, 1.0), { color: WARN }); mono(122, y + 5, '+ "-" +', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); chip(222, y, 'webapp', INK, pop(u, 1.3));
      mono(150, y + 46, '= web-webapp', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      tx(150, y + 80, 'release 이름 + 차트 이름', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 4) { const b = docCard(1, u, { show: 11, hi: [8, 9] }), f = E(u, 0.8, 1.6);
      [['{{ .Values.service.port }}', '80', 8], ['{{ .Values.service.targetPort }}', '8080', 9]].forEach(([ph, v, li], i) => {
        const y = 250 + i * 60; if (f < 0.5) chip(150, y, ph, WARN, 1, { color: WARN, fs: 13.5 }); else mono(150, y + 6, v, { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: (f - 0.5) * 2 }); });
      sub(150, 392, '숫자가 박힌 뒤에는 출처가 안 보인다', fade(u, 2.0), { 'font-size': 13.5, fill: INK }); return; }
    if (k === 5) { docCard(2, u, { show: 5 * E(u, 0.2, 1.0), hi: [1, 3] }); sub(150, 300, '같은 라벨 블록을', fade(u, 1.4), { 'font-size': 14, fill: INK }); sub(150, 322, '모든 리소스가 공유한다', fade(u, 1.5), { 'font-size': 14, fill: INK }); return; }
    if (k === 6) { docCard(2, u, { show: 7 + 0 * u, hi: [6] }); const f = E(u, 0.7, 1.4);
      if (f < 0.5) chip(150, 270, '{{ .Values.replicaCount }}', WARN, 1, { color: WARN }); else mono(150, 279, '2', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: (f - 0.5) * 2 });
      chip(150, 340, '--set replicaCount=5 → 5', INFO, pop(u, 1.9), { color: INFO }); return; }
    if (k === 7) { docCard(2, u, { show: 7 + 4 * E(u, 0.2, 1.0), hi: [9, 10] });
      chip(150, 270, 'nginx', ACC, pop(u, 1.0), { color: ACC }); mono(150, 300, '+ ":" +', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); chip(150, 330, '"1.25"', ACC, pop(u, 1.4), { color: ACC });
      sub(150, 380, 'kubectl apply로 바로 넣을 수 있다', fade(u, 2.0), { 'font-size': 13.5, fill: INK }); return; }
  }
  function s5end(u) {
    [['Chart', '디렉터리', '템플릿 + 값', INK], ['Manifest', '렌더 결과 YAML', 'kubectl이 보는 것', WARN], ['Release', '클러스터의 인스턴스', '이름 = web', ACC]].forEach(([a, b, d, col], i) => {
      const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.5); card(x, 200, 240, 150, { rx: 16, stroke: col, sw: 2.5, fill: i === 2 ? ACCBG : PANEL, s });
      tx(x, 170, a, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) });
      tx(x, 206, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.5) }); tx(x, 232, d, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) });
      if (i < 2) grow(x + 124, 200, x + 184, 200, E(u, 0.7 + i * 0.5, 1.0 + i * 0.5), ACC); });
    tx(325, 106, 'helm template', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9), class: 'mono' });
    tx(635, 106, 'helm install', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4), class: 'mono' }); }

  const quiz = [
    { q: 'helm create webapp가 만든 파일 중 렌더한 뒤 K8s로 보내지 않는 것은 무엇인가?',
      o: ['templates/deployment.yaml', 'templates/_helpers.tpl', 'templates/service.yaml'], a: 1,
      why: '이름이 _로 시작하는 파일과 NOTES.txt는 매니페스트가 아니다. _helpers.tpl은 다른 템플릿이 include로 불러 쓰는 블록만 담는다.' },
    { q: '앱 이미지를 1.16.0에서 1.17.0으로 바꿨다. Chart.yaml에서 바꿀 필드는 무엇인가?',
      o: ['version', 'apiVersion', 'appVersion'], a: 2,
      why: 'appVersion은 차트가 배포하는 앱의 버전이고 version은 차트 자체의 버전이다. 템플릿을 고쳤다면 version도 함께 올린다.' },
    { q: 'values.yaml에 tag: 1.25를 따옴표 없이 적으면 무엇이 문제인가?',
      o: ['숫자 1.25로 읽혀 문자열 태그가 아니게 된다', 'helm이 그 키를 무시한다', '.Values.tag 경로로 바뀐다'], a: 0,
      why: 'YAML은 따옴표 없는 1.25를 숫자로 읽는다. 태그처럼 글자로 다뤄야 하는 값은 "1.25"로 적는다.' },
    { q: 'image.tag가 비어 있을 때 {{ .Values.image.tag | default .Chart.AppVersion }}의 결과는 무엇인가?',
      o: ['빈 문자열', 'Chart.yaml의 appVersion 값', '렌더 오류'], a: 1,
      why: 'default는 앞 값이 비었을 때만 뒤 값을 쓴다. 이 차트에서는 "nginx:1.16.0"이 된다.' },
    { q: 'helm template web ./webapp으로 나온 Service의 이름이 web-webapp인 이유는 무엇인가?',
      o: ['_helpers.tpl의 fullname이 release 이름과 차트 이름을 이어 붙여서', 'values.yaml에 web-webapp이 적혀 있어서', 'Kubernetes가 이름 뒤에 차트 이름을 붙여서'], a: 0,
      why: 'webapp.fullname은 release 이름 web과 차트 이름 webapp을 - 로 잇는다. 그래서 같은 차트를 다른 이름으로 여러 번 설치해도 겹치지 않는다.' },
  ];

  const summary = [
    'helm create는 Chart.yaml, values.yaml, templates/, charts/가 든 폴더 하나를 만든다.',
    'Chart.yaml의 version은 차트의 버전이고 appVersion은 배포하는 앱의 버전이다.',
    '템플릿에는 .Values 경로만 적고, 값은 렌더할 때 values.yaml과 -f, --set에서 정해진다.',
    'helm template은 클러스터 없이 렌더만 해서 web-webapp 같은 평범한 YAML을 보여 준다.',
  ];
  const review = [
    { q: 'values.yaml의 replicaCount를 2에서 5로 바꿨는데 helm template 결과의 replicas가 그대로 2다. 먼저 확인할 것은?',
      o: ['템플릿이 .Values.replicaCount 대신 숫자를 직접 적었는지', 'Chart.yaml의 appVersion을 올렸는지', '_helpers.tpl 파일 이름이 _로 시작하는지'], a: 0,
      why: '템플릿이 값의 경로를 읽어야 values.yaml을 바꾼 효과가 난다. 숫자를 박아 두면 값 파일을 바꿔도 렌더 결과는 그대로다.' },
    { q: '렌더 결과에서 env 블록이 통째로 사라졌다. values.yaml을 보니 env: [] 였다. 왜 그런가?',
      o: ['toYaml이 빈 배열을 지워서', '{{- if .Values.env }}가 빈 배열을 거짓으로 보아서', 'nindent 12가 줄을 밀어내서'], a: 1,
      why: 'if는 빈 배열을 거짓으로 본다. 그래서 env: 줄부터 end까지 블록 전체가 렌더되지 않는다.' },
    { q: '템플릿을 고친 차트를 저장소에 다시 올렸는데 사용자들이 옛 템플릿으로 설치된다고 한다. 먼저 의심할 것은?',
      o: ['appVersion에 따옴표를 빠뜨린 것', '.helmignore에 templates/를 적은 것', 'Chart.yaml의 version을 올리지 않은 것'], a: 2,
      why: '차트를 고치면 version을 올려야 한다. 같은 version이면 저장소 캐시가 옛 차트를 내줄 수 있다.' },
  ];

  R.page({ title: 'Helm 차트 구조', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
