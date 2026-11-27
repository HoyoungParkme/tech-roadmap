/* V-2-1 멀티 환경 — 차트 하나 + 환경별 values. 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function fileCard(x, y, w, name, lines, o) {
    o = o || {}; const lh = o.lh || 23, op = o.op ?? 1, h = o.h || lines.length * lh + 46;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, opacity: op });
    el('path', { d: `M${x},${y + 30} V${y + 10} Q${x},${y} ${x + 10},${y} H${x + w - 10} Q${x + w},${y} ${x + w},${y + 10} V${y + 30} Z`, fill: SOFT, opacity: op });
    mono(x + 14, y + 20, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    lines.forEach((ln, i) => { if (ln == null) return; const [s, a0] = Array.isArray(ln) ? ln : [ln, null], a = a0 || {}, yy = y + 38 + i * lh, lop = op * (a.op ?? 1);
      if (lop <= 0.001) return;
      if (a.hi) el('rect', { x: x + 6, y: yy, width: w - 12, height: lh - 2, rx: 5, fill: a.hi === true ? ACCBG : a.hi, opacity: lop });
      mono(x + 14 + (a.ind || 0), yy + lh / 2 + 5, s, { 'font-size': o.fs || 14, fill: a.col || INK, 'font-weight': a.b ? 700 : 400, opacity: lop, 'text-decoration': a.strike ? 'line-through' : null }); });
    return { h, row: (i) => y + 38 + i * lh + lh / 2 }; }
  const T = (x, y, s, a) => tx(x, y, s, Object.assign({ 'font-size': 14 }, a || {}));
  const M = (x, y, s, a) => mono(x, y, s, Object.assign({ 'font-size': 14 }, a || {}));
  const ENVC = { dev: INFO, staging: WARN, prod: GOOD };
  // 폴더 아이콘
  function folder(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), col = o.stroke || INK;
    el('path', { d: 'M-44,-26 H-12 L-4,-18 H44 V28 H-44 Z', fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    if (name) tx(0, 50, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: col }, g); return g; }
  // 겹친 values 종이 (아래부터 쌓임): sheets [[이름, 색]]
  function stack(x, y, sheets, g) { sheets.forEach(([n, col], i) => { const sy = y - i * 34, s = i === sheets.length - 1 ? g : 1; if (s <= 0) return;
      card(x + i * 14, lerp(sy - 60, sy, E(s, 0, 1)), 230, 54, { rx: 8, stroke: col, sw: 2.2, fill: PANEL, text: n, fs: 14, mono: true, color: col, op: s }); }); }

  // ---------- 1. 하나의 차트, 여러 환경 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { const L = [['myapp/', 0], ['├── Chart.yaml', 0], ['├── templates/', 1], ['│   ├── deployment.yaml', 1], ['│   ├── service.yaml', 1], ['│   ├── ingress.yaml', 1], ['│   └── hpa.yaml', 1],
        ['├── values.yaml', 2], ['├── values-dev.yaml', 2], ['├── values-staging.yaml', 2], ['└── values-prod.yaml', 2]];
      fileCard(30, 22, 330, 'chart-layout', L.map(([s, kk], i) => kk > k ? null : [s, { b: kk === k, hi: kk === k, op: kk === k ? fade(u, 0.2 + (i % 7) * 0.15) : 1 }]), { h: 318, lh: 24 }); }
    if (k === 0) { folder(620, 150, 'myapp/', { s: pop(u, 0.4) }); T(620, 250, '환경이 셋이어도 차트는 하나', { 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) });
      ['dev', 'staging', 'prod'].forEach((e, i) => pill(500 + i * 120, 300, e, ENVC[e], pop(u, 1.4 + i * 0.2), { mono: true })); }
    if (k === 1) { ['deployment', 'service', 'ingress', 'hpa'].forEach((n, i) => { const s = pop(u, 0.3 + i * 0.25); card(470 + i * 120, 110, 100, 120, { rx: 8, stroke: INK, s });
        for (let j = 0; j < 4; j++) el('line', { x1: 435 + i * 120, y1: 80 + j * 18, x2: 505 + i * 120 - (j % 2) * 20, y2: 80 + j * 18, stroke: OFF, 'stroke-width': 3, opacity: s });
        M(470 + i * 120, 196, n, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, opacity: s }); });
      M(480, 240, '{{- if eq .Values.env "prod" }}', { fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.5) });
      T(480, 290, '템플릿 안에 환경 분기를 두지 않는다', { 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 2) { card(560, 90, 260, 60, { rx: 10, stroke: ACC, sw: 2.6, fill: ACCBG, text: 'values.yaml (base)', fs: 15, mono: true, s: pop(u, 0.3) });
      ['dev', 'staging', 'prod'].forEach((e, i) => { const x = 440 + i * 170, s = pop(u, 0.9 + i * 0.3); card(x, 220, 150, 50, { rx: 8, stroke: ENVC[e], text: 'values-' + e, fs: 14, mono: true, s }); grow(560, 122, x, 192, E(u, 1.0 + i * 0.3, 1.4 + i * 0.3), MUT, { plain: true }); });
      T(440, 300, 'base 1 + 환경 3. 환경 파일은 차이만 담는다', { fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 3) { ['myapp-dev/', 'myapp-staging/', 'myapp-prod/'].forEach((n, i) => { const x = 170 + i * 300, s = pop(u, 0.2 + i * 0.25); folder(x, 110, n, { s, stroke: BAD });
        if (i === 0) { card(x, 230, 200, 40, { rx: 8, stroke: GOOD, fill: GOODBG, text: '버그 수정 반영', fs: 14, s: pop(u, 1.2) }); }
        else { card(x, 230, 200, 40, { rx: 8, stroke: BAD, fill: BADBG, text: '수정 빠짐', fs: 14, color: BAD, s: pop(u, 1.5 + i * 0.25) }); } });
      T(480, 310, '공통 수정 한 번이 세 곳으로 흩어지고 결국 어긋난다', { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 4) { folder(150, 170, './myapp', { s: pop(u, 0.2), stroke: ACC });
      ['dev', 'staging', 'prod'].forEach((e, i) => { const y = 70 + i * 100, g = E(u, 0.5 + i * 0.35, 1.2 + i * 0.35);
        grow(210, 170, 470, y, g, ENVC[e]); M(712, y + 5, '-f values-' + e + '.yaml', { fill: ENVC[e], 'font-weight': 700, 'font-size': 13.5, opacity: fade(u, 0.8 + i * 0.35) });
        card(590, y, 220, 56, { rx: 10, stroke: ENVC[e], sw: 2.4, text: 'myapp-' + e, fs: 14, mono: true, s: pop(u, 1.1 + i * 0.35) }); });
      T(740, 340, '차트는 그대로, -f 파일만 바뀐다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); } }

  // ---------- 2. base values.yaml ----------
  const BL = [['image:', 1], ['  repository: registry.myapp.io/myapp', 1], ['  pullPolicy: IfNotPresent', 1], ['  tag: ""', 1], ['service: ClusterIP · 8080', 2], ['ingress:', 3], ['  enabled: true · nginx', 3], ['  host: ""', 3],
    ['replicaCount: 1', 4], ['requests: 100m / 128Mi', 4], ['limits:   250m / 256Mi', 5], ['autoscaling:', 6], ['  enabled: false · 2~12 · 70%', 6]];
  // 칩: [글, 통(0 공통 · 1 비움 · 2 기본값), 등장 beat, 파일 줄 번호]
  const CHIPS = [['repository', 0, 1, 1], ['pullPolicy', 0, 1, 2], ['tag ""', 1, 1, 3], ['service.type', 0, 2, 4], ['service.port 8080', 0, 2, 4], ['ingress.enabled', 0, 3, 6], ['className nginx', 0, 3, 6], ['host ""', 1, 3, 7],
    ['replicaCount 1', 2, 4, 8], ['req 100m/128Mi', 2, 4, 9], ['lim 250m/256Mi', 2, 5, 10], ['autoscaling off', 2, 6, 12]];
  const BINS = [['모든 환경이 같은 값 · 여기서 끝', GOOD, 30, 112], ['비워 둠 · 환경 파일이 채운다', WARN, 152, 74], ['안전한 기본값 · 덮어쓸 수 있다', INFO, 236, 104]];
  function s2(t, c) { const { k, u } = c;
    const fc = fileCard(24, 22, 400, 'values.yaml (base)', BL.map(([s, kk]) => kk > k ? null : [s, { hi: kk === k, b: kk === k, col: s.includes('""') ? WARN : INK }]), { h: 340, lh: 22.5 });
    BINS.forEach(([n, col, y, h], i) => { zone(460, y, 476, h, n, { stroke: col, fill: PANEL, color: col, op: k === 0 ? fade(u, 0.3 + i * 0.3) : 1 }); });
    const slot = [0, 0, 0];
    let j = 0;
    CHIPS.forEach(([s, bin, kk, row]) => { const idx = slot[bin]++; if (kk > k) return; const jj = kk === k ? j++ : 0;
      const per = 3, bx = 470 + (idx % per) * 156 + 76, by = BINS[bin][2] + 46 + Math.floor(idx / per) * 36;
      const t0 = 0.2 + jj * 0.45; if (kk === k) dot([[410, fc.row(row)], [bx - 74, by]], seg(u, t0, t0 + 0.6), BINS[bin][1], 6);
      const sc = kk === k ? pop(u, t0 + 0.6) : 1; if (sc <= 0) return;
      card(bx, by, 148, 30, { s: sc, rx: 15, stroke: BINS[bin][1], fill: bin === 1 ? 'none' : PANEL, dash: bin === 1 ? '5 4' : null, text: s, fs: 13.5, mono: true, color: INK, sw: 1.8 }); });
    if (k === 0) { T(700, 370, '판단이 서지 않으면 base에 확정하지 않는다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 4) T(700, 370, '오버라이드가 없을 때 쓰이므로 가장 작은 dev 수준', { 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 1.6) });
    if (k === 5) { const y = 374, W = 300, x = 560; el('rect', { x, y: y - 10, width: W, height: 18, rx: 4, fill: SOFT, stroke: WARN, 'stroke-dasharray': '4 3', 'stroke-width': 1.8 });
      el('rect', { x, y: y - 10, width: W * 0.4 * E(u, 0.8, 1.6), height: 18, rx: 4, fill: INFO });
      M(x - 10, y + 4, 'CPU', { 'text-anchor': 'end', 'font-weight': 700 }); M(x + W + 10, y + 4, '100m / 250m', { fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 6) T(700, 370, '파라미터는 미리 적고 스위치는 꺼 둔다. prod만 켠다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); }

  // ---------- 3. 환경 override ----------
  const OV = [['replicaCount', '1', '4', 0], ['image.tag', '""', '"1.4.0"', 1], ['ingress.host', '""', 'myapp.io', 2], ['requests', '100m/128Mi', '500m/512Mi', 3], ['limits', '250m/256Mi', '1000m/1Gi', 3],
    ['autoscaling.enabled', 'false', 'true', 4], ['autoscaling min~max', '2~12', '', 9], ['service.port', '8080', '', 9]];
  const DEV = { 'image.tag': 'dev-latest', 'ingress.host': 'dev.myapp.local' };
  function s3(t, c) { const { k, u } = c, dev = k === 5, X = [40, 270, 470, 690], y0 = 70, rh = 36;
    const heads = ['key', 'base', dev ? 'values-dev' : 'values-prod', '최종 값'];
    heads.forEach((h, i) => T(X[i], y0 - 26, h, { 'font-weight': 800, fill: i === 2 ? (dev ? INFO : GOOD) : i === 3 ? ACC : MUT, 'font-size': 15 }));
    el('line', { x1: 30, y1: y0 - 16, x2: 940, y2: y0 - 16, stroke: GRID, 'stroke-width': 1.5 });
    let n = 0;
    OV.forEach(([key, b, p, kk], i) => { const y = y0 + i * rh + 14, ov = dev ? DEV[key] : (kk <= k ? p : ''), now = !dev && kk === k, gg = now ? E(u, 0.3, 1.1) : 1;
      if (ov) n++;
      if (now || (dev && ov)) el('rect', { x: 30, y: y - 22, width: 910, height: rh - 4, rx: 6, fill: dev ? INFOBG : GOODBG, opacity: now ? fade(u, 0.1) : 1 });
      M(X[0], y, key, { 'font-weight': 700 }); M(X[1], y, b, { fill: ov ? MUT : INK, 'text-decoration': ov && gg >= 1 ? 'line-through' : null });
      if (ov) { const x = lerp(X[2] + 80, X[2], gg); M(x, y, ov, { fill: dev ? INFO : GOOD, 'font-weight': 700, opacity: gg }); }
      else M(X[2], y, '·', { fill: OFF });
      const fin = ov && gg >= 1 ? ov : b; M(X[3], y, fin, { fill: ov && gg >= 1 ? ACC : INK, 'font-weight': ov ? 700 : 400 }); });
    const cnt = dev ? 2 : Math.min(5, [1, 2, 3, 4, 5][Math.min(k, 4)]);
    card(840, 370, 190, 40, { rx: 20, stroke: dev ? INFO : GOOD, text: (dev ? 'dev가 덮은 키 ' : '덮은 최상위 키 ') + cnt + '개', fs: 14, s: 1 + bump(u, 0.3) });
    if (k === 1) T(40, 382, 'dev-latest 같은 움직이는 태그는 prod에서 금지', { fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) });
    if (k === 4) T(40, 382, 'HPA 범위는 base의 2~12를 그대로 쓴다', { fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) });
    if (k === 0 || k === 2 || k === 3) T(40, 382, '적은 키만 덮고, 안 적은 키는 base 값 그대로', { fill: MUT, opacity: fade(u, 1.4) });
    if (dev) T(40, 382, 'dev는 tag와 host 두 키뿐. 나머지는 base', { fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) }); }

  // ---------- 4. 병합 순서 ----------
  function lanes(k, u, on) { zone(560, 26, 380, 330, '클러스터', { stroke: GRID });
    ['dev', 'staging', 'prod'].forEach((e, i) => { const y = 80 + i * 96; el('rect', { x: 576, y: y - 28, width: 348, height: 78, rx: 8, fill: PANEL, stroke: ENVC[e], 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
      M(590, y - 8, 'ns: ' + e, { 'font-size': 13.5, fill: ENVC[e], 'font-weight': 700 });
      if (on[i]) card(750, y + 18, 220, 36, { rx: 8, stroke: ENVC[e], sw: 2.2, text: 'myapp-' + e, fs: 14, mono: true, s: on[i] }); }); }
  function s4(t, c) { const { k, u } = c;
    const on = [k >= 1 ? (k === 1 ? pop(u, 1.6) : 1) : 0, k >= 2 ? (k === 2 ? pop(u, 1.6) : 1) : 0, k >= 3 ? (k === 3 ? pop(u, 1.6) : 1) : 0];
    if (k <= 3) lanes(k, u, on);
    if (k === 0) { T(40, 80, 'release 이름', { 'font-weight': 700, fill: MUT }); M(40, 110, 'myapp-<env>', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      T(40, 170, 'namespace', { 'font-weight': 700, fill: MUT }); M(40, 200, '-n <env>', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) });
      T(40, 290, '한 클러스터 안에서도 섞이지 않는다', { opacity: fade(u, 1.4) }); }
    if (k >= 1 && k <= 3) { const e = ['dev', 'staging', 'prod'][k - 1];
      M(30, 50, '-f values.yaml -f values-' + e + '.yaml', { 'font-weight': 700, opacity: fade(u, 0.1) });
      stack(150, 250, [['values.yaml', ACC], ['values-' + e + '.yaml', ENVC[e]]], E(u, 0.4, 1.2));
      M(40, 330, '왼쪽 → 오른쪽, 뒤가 이긴다', { 'font-weight': 700, fill: ENVC[e], opacity: fade(u, 1.0) });
      if (k === 3) { const r = Math.round(tween(1, 4, u, 1.0));
        card(430, 210, 150, 64, { rx: 10, stroke: GOOD, sw: 2.4, s: pop(u, 1.2) }); M(430, 204, 'replicas', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); M(430, 228, String(u > 1.2 ? r : 1), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD });
        T(30, 86, '순서를 뒤집으면 (python으로 병합해 본 결과)', { fill: BAD, 'font-weight': 700, 'font-size': 13.5, opacity: fade(u, 1.9) });
        M(30, 110, 'replicaCount 1 · tag "" · HPA false', { fill: BAD, 'font-size': 13.5, opacity: fade(u, 2.1) }); } }
    if (k === 4) { // 우선순위 사다리: 아래가 바닥, 위가 이긴다
      const L = [['차트 안 values.yaml', 'tag ""', MUT, '-f 없이도 깔린다'], ['-f values.yaml', 'tag ""', ACC, ''], ['-f values-prod.yaml', 'tag "1.4.0"', GOOD, ''], ['--set image.tag=1.4.1', 'tag "1.4.1"', WARN, '마지막에 적용']];
      L.forEach(([n, v, col, note], i) => { const y = 320 - i * 70, s = pop(u, 0.2 + i * 0.4);
        card(250, y, 380, 54, { rx: 10, stroke: col, sw: i === 3 ? 2.8 : 2, fill: PANEL, s }); M(80, y + 5, n, { 'font-weight': 700, fill: col === MUT ? INK : col, opacity: s });
        M(420, y + 5, v, { 'text-anchor': 'end', opacity: s }); if (note) T(460, y + 5, note, { fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); });
      grow(40, 340, 40, 90, E(u, 0.3, 1.8), INK); T(30, 66, '이긴다', { 'font-weight': 800, opacity: fade(u, 1.6) });
      card(760, 110, 280, 64, { rx: 12, stroke: WARN, fill: WARNBG, s: pop(u, 2.0) }); M(760, 104, '최종 image.tag', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: pop(u, 2.0) });
      M(760, 128, '"1.4.1"', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: pop(u, 2.0) });
      T(640, 250, '1.4.1은 설명용 값이다', { fill: MUT, 'font-size': 13.5, opacity: fade(u, 2.2) }); }
    if (k === 5) { terminal(40, 40, 600, 150, ['$ helm template myapp-prod ./myapp \\', '    -f values.yaml -f values-prod.yaml | grep replicas', ['  replicas: 4', '#4ade80']], lerp(0, 3, E(u, 0.2, 1.6)), { title: 'deploy.sh · 손으로 맞춘 출력' });
      stack(250, 330, [['values.yaml', ACC], ['values-prod.yaml', GOOD]], 1);
      T(700, 110, '설치 없이', { 'font-weight': 700, opacity: fade(u, 1.4) }); T(700, 136, '병합 결과를 먼저 본다', { opacity: fade(u, 1.6) }); }
    if (k === 6) { M(40, 60, '$ helm list -n prod', { 'font-weight': 700 });
      const H = ['NAME', 'NAMESPACE', 'REVISION', 'STATUS', 'CHART'], V = ['myapp-prod', 'prod', '3', 'deployed', 'myapp-0.1.0'], xs = [60, 230, 380, 520, 680];
      H.forEach((h, i) => M(xs[i], 110, h, { fill: MUT, 'font-weight': 700 })); V.forEach((v, i) => M(xs[i], 150, v, { 'font-weight': 700, fill: i === 3 ? GOOD : i === 2 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.2) }));
      T(60, 196, '예시 출력. 실제 표에는 UPDATED · APP VERSION 열도 있다', { fill: MUT, 'font-size': 13.5, opacity: fade(u, 1.4) });
      card(480, 290, 520, 56, { rx: 12, stroke: GOOD, fill: GOODBG, text: 'STATUS deployed면 배포가 끝난 것이다', fs: 15, s: pop(u, 1.8) }); } }

  // ---------- 5. 한눈에 정리 ----------
  const RES = [['dev', 1, 'dev-latest', 'dev.myapp.local', 'off'], ['staging', 2, '1.4.0-rc.1', 'staging.myapp.io', 'off'], ['prod', 4, '1.4.0', 'myapp.io', 'on 2~12']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { M(40, 50, 'for env in dev staging prod', { 'font-weight': 700, opacity: fade(u, 0.1) });
      folder(480, 170, './myapp', { stroke: ACC });
      RES.forEach(([e], i) => { const s = k === 0 ? pop(u, 0.4 + i * 0.4) : 1; pill(200 + i * 280, 300, e, ENVC[e], s, { mono: true, fs: 15 }); });
      if (k === 1) { const cur = Math.min(2, Math.floor(u / 0.9)), e = RES[cur][0];
        M(480, 90, '-f values-' + e + '.yaml', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ENVC[e] });
        dot([[480, 210], [200 + cur * 280, 280]], (u % 0.9) / 0.9, ENVC[e], 7);
        T(760, 170, '움직이는 건 이 이름 하나', { fill: MUT, opacity: fade(u, 0.5) }); } }
    if (k === 2) { RES.forEach(([e, r], i) => { const y = 80 + i * 100; M(60, y + 8, e + ':', { 'font-size': 16, 'font-weight': 800, fill: ENVC[e] });
        for (let j = 0; j < r; j++) card(230 + j * 90, y, 70, 60, { rx: 10, stroke: ENVC[e], fill: PANEL, text: 'Pod', fs: 14, color: ENVC[e], s: pop(u, 0.3 + i * 0.4 + j * 0.12) });
        M(620, y + 8, 'replicas: ' + r, { 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.4) }); });
      T(480, 380, '템플릿은 한 글자도 다르지 않다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 3) { M(40, 60, '$ helm list -A | grep myapp', { 'font-weight': 700 });
      RES.forEach(([e], i) => { const y = 120 + i * 60; card(480, y, 820, 46, { rx: 8, stroke: ENVC[e], s: pop(u, 0.3 + i * 0.35) });
        M(100, y + 5, 'myapp-' + e, { 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.35) }); M(330, y + 5, e, { fill: MUT, opacity: fade(u, 0.4 + i * 0.35) });
        M(500, y + 5, 'deployed', { fill: GOOD, opacity: fade(u, 0.4 + i * 0.35) }); M(680, y + 5, 'myapp-0.1.0', { fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.35) }); });
      T(480, 340, '차트 버전이 셋 다 같다. 예시 출력', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { const xs = [40, 190, 330, 500, 690];
      ['env', 'replicas', 'image.tag', 'ingress.host', 'HPA'].forEach((h, i) => M(xs[i], 60, h, { fill: MUT, 'font-weight': 700 }));
      RES.forEach((r, i) => { const y = 110 + i * 52; el('rect', { x: 30, y: y - 26, width: 900, height: 40, rx: 8, fill: PANEL, stroke: ENVC[r[0]], 'stroke-width': 1.6, opacity: fade(u, 0.2 + i * 0.3) });
        r.forEach((v, j) => M(xs[j], y, String(v), { 'font-weight': j === 0 ? 800 : 500, fill: j === 0 ? ENVC[r[0]] : INK, opacity: fade(u, 0.3 + i * 0.3) })); });
      banner(480, 330, '차트는 하나, values만 환경별로 갈아끼운다', pop(u, 1.6)); } }

  const quiz = [
    { q: 'dev·staging·prod를 위해 차트 폴더를 세 벌 복사하면 생기는 문제는 무엇인가?',
      o: ['helm이 같은 이름의 차트를 거부한다', '공통 수정이 세 곳으로 흩어져 결국 어긋난다', 'values 파일을 쓸 수 없게 된다'], a: 1,
      why: '버그 하나를 고쳐도 세 폴더를 다 고쳐야 한다. 차트는 하나로 두고 values만 환경별로 나눈다.' },
    { q: 'base values.yaml에서 image.tag를 빈 문자열로 두는 이유는 무엇인가?',
      o: ['환경마다 다른 값이라 환경 파일이 채우게 하려고', '빈 태그면 helm이 latest를 알아서 넣어 주므로', 'YAML 문법상 tag는 비워야 하므로'], a: 0,
      why: 'base에 태그를 확정하면 모든 환경이 같은 이미지로 묶인다. 환경마다 달라지는 값은 base에서 확정하지 않는다.' },
    { q: 'values-prod.yaml이 autoscaling.enabled: true 한 줄만 적었을 때 최종 minReplicas는 얼마인가?',
      o: ['4', '0', '2'], a: 2,
      why: 'prod 파일에 없는 키는 base 값이 남는다. base의 minReplicas 2와 maxReplicas 12가 그대로 쓰인다.' },
    { q: 'helm upgrade에 -f values-prod.yaml -f values.yaml 순서로 주면 replicaCount는 얼마가 되는가?',
      o: ['4', '1', '오류가 난다'], a: 1,
      why: '-f는 왼쪽에서 오른쪽으로 병합하고 뒤가 이긴다. 뒤에 온 base가 prod의 4를 1로 덮는다.' },
    { q: '세 환경의 helm template 결과에서 replicas가 1 / 2 / 4로 갈린 원인은 무엇인가?',
      o: ['환경마다 다른 템플릿을 썼다', '차트 버전이 달랐다', 'values 파일만 달랐다'], a: 2,
      why: '차트 인자 ./myapp과 차트 버전 myapp-0.1.0은 셋 다 같다. 다른 것은 -f로 준 values 파일뿐이다.' },
  ];
  const summary = [
    '차트를 환경마다 복사하면 공통 수정이 세 곳으로 흩어져 어긋난다.',
    '모든 환경이 같은 값은 base에 두고, 태그와 host처럼 다른 값은 비워 둔다.',
    '환경 파일에는 차이만 적는다. 안 적은 키는 base 값이 그대로 남는다.',
    '-f는 왼쪽부터 병합하고 뒤가 이긴다. base를 먼저, 환경 파일을 나중에 준다.',
  ];
  const review = [
    { q: 'prod에 배포했는데 Pod가 1개만 떴다. deploy.sh에서 먼저 볼 곳은?',
      o: ['-f 파일 순서가 뒤집혔는지', '--create-namespace를 붙였는지', 'release 이름이 myapp-prod 인지'], a: 0,
      why: 'base를 뒤에 주면 base의 replicaCount 1이 prod의 4를 덮는다. base를 먼저, 환경 파일을 나중에 줘야 한다.' },
    { q: 'staging에만 HPA를 켜려고 한다. 가장 손이 덜 가는 방법은?',
      o: ['templates/hpa.yaml에 if staging 조건을 넣는다', 'staging 용 차트를 하나 더 만든다', 'values-staging.yaml에 autoscaling.enabled: true를 적는다'], a: 2,
      why: '파라미터는 base에 이미 있으므로 스위치 한 줄이면 된다. 템플릿 분기나 차트 복사는 유지보수를 무너뜨린다.' },
    { q: 'dev와 prod가 같은 클러스터에 있다. 둘이 섞이지 않게 하는 장치로 이 장에서 쓴 것은?',
      o: ['values.yaml을 두 벌 두기', 'release 이름 myapp-<env> 와 namespace 분리', '차트 버전을 환경마다 다르게'], a: 1,
      why: 'release와 namespace를 환경별로 나누면 같은 차트, 같은 클러스터에서도 리소스가 겹치지 않는다.' },
  ];

  R.page({ title: '차트 하나, values 여러 벌', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
