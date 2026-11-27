/* I-2-1 source — repo·path·targetRevision — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, person, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- Argo CD 그림 부품 ----------
  const SC = { Synced: GOOD, OutOfSync: WARN, Syncing: INFO, Unknown: MUT };
  const BG = (c) => (c === GOOD ? GOODBG : c === WARN ? WARNBG : c === INFO ? INFOBG : c === BAD ? BADBG : c === ACC ? ACCBG : SOFT);
  const val = (arr, key) => { const r = (arr || []).find((x) => x.key === key); return r ? r.val : null; };
  const num = (s, d) => { const m = s == null ? null : String(s).match(/\d+/); return m ? +m[0] : d; };
  function stat(cx, cy, s, sc) { const col = SC[s] || MUT; return pill(cx, cy, s, col, sc, { fs: 15, fill: BG(col), mono: true }); }
  function branchIcon(cx, cy, col, op) { const a = { fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op ?? 1 };
    el('path', { d: `M${cx - 5},${cy - 6} V${cy + 6} M${cx + 6},${cy - 2} Q${cx + 6},${cy + 5} ${cx - 3},${cy + 5}`, fill: 'none', stroke: col, 'stroke-width': 2, opacity: op ?? 1 });
    el('circle', Object.assign({ cx: cx - 5, cy: cy - 8, r: 3.5 }, a)); el('circle', Object.assign({ cx: cx - 5, cy: cy + 8, r: 3.5 }, a)); el('circle', Object.assign({ cx: cx + 6, cy: cy - 5, r: 3.5 }, a)); }
  // Git 저장소 판 (위에 갈래 아이콘 + 이름)
  function repo(x, y, w, h, name, o) { o = o || {}; const col = o.stroke || INK, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    branchIcon(x + 20, y + 20, col, op); mono(x + 36, y + 25, name, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op });
    el('line', { x1: x, y1: y + 38, x2: x + w, y2: y + 38, stroke: GRID, 'stroke-width': 1.5, opacity: op }); }
  function wheel(cx, cy, r, col, op) { const a = { stroke: col, 'stroke-width': 1.8, opacity: op ?? 1 };
    el('circle', Object.assign({ cx, cy, r, fill: 'none' }, a));
    for (let i = 0; i < 7; i++) { const t = -Math.PI / 2 + i * 2 * Math.PI / 7; el('line', Object.assign({ x1: cx + Math.cos(t) * r * 0.3, y1: cy + Math.sin(t) * r * 0.3, x2: cx + Math.cos(t) * r, y2: cy + Math.sin(t) * r }, a)); }
    el('circle', Object.assign({ cx, cy, r: r * 0.3, fill: PANEL }, a)); }
  // 클러스터 판 (키잡이 바퀴 + 이름)
  function clusterBox(x, y, w, h, name, o) { o = o || {}; const col = o.stroke || INFO, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    wheel(x + 22, y + 21, 10, col, op); tx(x + 40, y + 27, name, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); }
  function pod(cx, cy, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op), c = o.ghost ? MUT : (o.col || GOOD);
    el('rect', { x: -20, y: -18, width: 40, height: 36, rx: 9, fill: o.ghost ? 'none' : BG(c), stroke: c, 'stroke-width': 2.2, 'stroke-dasharray': o.ghost ? '4 4' : null }, g);
    if (!o.ghost) el('rect', { x: -8, y: -7, width: 16, height: 14, rx: 3, fill: c, opacity: 0.85 }, g); }
  // n 개 파드 (소수면 마지막 하나가 자라는 중). ghost = 목표 개수까지 빈 칸
  function pods(x0, y0, n, o) { o = o || {}; const cols = o.cols || 5, gx = o.gx || 54, gy = o.gy || 50, full = Math.floor(n + 1e-6);
    const at = (i) => [x0 + (i % cols) * gx, y0 + Math.floor(i / cols) * gy];
    for (let i = 0; i < Math.max(o.ghost || 0, Math.ceil(n - 1e-6)); i++) { const [x, y] = at(i);
      if (i < full) pod(x, y, { col: o.col }); else if (i < n) pod(x, y, { col: o.col, s: n - full }); else pod(x, y, { ghost: true }); } }
  function argo(cx, cy, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op), c = o.col || ACC;
    el('rect', { x: -70, y: -30, width: 140, height: 60, rx: 14, fill: ACCBG, stroke: c, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-58,6 Q-58,-20 -42,-20 Q-26,-20 -26,6 Z', fill: PANEL, stroke: c, 'stroke-width': 2 }, g);
    [-54, -46, -38, -30].forEach((x, i) => el('path', { d: `M${x},6 q${i % 2 ? 3 : -3},8 0,14`, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-linecap': 'round' }, g));
    el('circle', { cx: -47, cy: -6, r: 2.6, fill: c }, g); el('circle', { cx: -37, cy: -6, r: 2.6, fill: c }, g);
    tx(16, 6, o.name || 'Argo CD', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: c }, g); }
  function toggle(x, y, on, label, o) { o = o || {}; const c = on > 0.5 ? GOOD : OFF;
    el('rect', { x, y: y - 11, width: 40, height: 22, rx: 11, fill: c, opacity: o.op ?? 1 });
    el('circle', { cx: x + 11 + 18 * clamp(on), cy: y, r: 8, fill: PANEL, opacity: o.op ?? 1 });
    mono(x + 50, y + 5, label, { 'font-size': o.fs || 14.5, 'font-weight': 700, fill: on > 0.5 ? INK : MUT, opacity: o.op ?? 1 }); }
  // 파일 줄: arr [text, color?], shown 개(소수면 마지막 줄 타이핑), hi(i) 강조
  function rows(x, y, arr, shown, o) { o = o || {}; const lh = o.lh || 24, fs = o.fs || 14.5;
    arr.forEach(([s, col], i) => { if (i >= Math.ceil(shown)) return; const part = i === Math.ceil(shown) - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s, hot = o.hi && o.hi(i);
      if (hot) el('rect', { x: x - 8, y: y + i * lh - fs + 1, width: o.w || 300, height: lh - 2, rx: 5, fill: ACCBG });
      mono(x, y + i * lh, part, { 'font-size': fs, fill: hot ? ACC : col || INK, 'font-weight': hot ? 700 : 400 }); }); }
  const typed = (c, a, b, t0, t1) => (c.prev == null || a === b ? b : lerp(a, b, E(c.u, t0 ?? 0.2, t1 ?? 1.6)));


  const TOOL = { plain: ['Directory', INK, 'YAML 그대로 apply'], helm: ['Helm', INFO, 'helm template'], kustomize: ['Kustomize', GOOD, 'kustomize build'] };
  const unset = (v) => !v || /아직 미지정/.test(v);

  // 1. source 3대 좌표
  const TREE = [['k8s/', 0], ['deployment.yaml', 1], ['service.yaml', 1], ['ingress.yaml', 1], ['chart/', 0]];
  function coords(c, o) { o = o || {}; const b = c.beat, p = c.prev || {};
    el('rect', { x: 30, y: 40, width: 410, height: 210, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(48, 66, 'spec.source', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    [['repoURL', 'repo'], ['path', 'path'], ['targetRevision', 'rev']].forEach(([n, key], i) => { const y = 108 + i * 48, v = b[key], fresh = p[key] !== v && !unset(v);
      tx(48, y, n, { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      if (unset(v)) card(320, y - 5, 200, 32, { rx: 6, text: '?', fs: 15, dash: '5 4', stroke: GRID, color: MUT });
      else { const s = String(v).replace('github.com/', '').replace(/ \(.*\)$/, ''); el('rect', { x: 210, y: y - 21, width: 220, height: 32, rx: 6, fill: fresh ? ACCBG : SOFT, opacity: fresh ? fade(c.u, 0.2) : 1 });
        mono(220, y, s, { 'font-size': 14, 'font-weight': 700, fill: fresh ? ACC : INK, opacity: fresh ? fade(c.u, 0.3) : 1 }); } }); }
  function s1(t, c) { const { k, u } = c, b = c.beat;
    coords(c);
    if (k >= 1) { repo(480, 40, 450, 210, 'acme/web.git', { stroke: k === 1 ? ACC : INK });
      TREE.forEach(([s, d], i) => { const on = k >= 2 && i <= 3, file = d === 1; if (file && k < 3) return;
        mono(506 + d * 28, 104 + i * 30, s, { 'font-size': 15, 'font-weight': on && !file ? 800 : 400, fill: on ? (file ? INK : ACC) : MUT, opacity: k === 3 && file ? fade(u, 0.6 + i * 0.2) : 1 }); });
      if (k === 2) { el('rect', { x: 496, y: 84, width: 120, height: 28, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.4) }); tx(640, 104, '← path (저장소 루트 기준 상대 경로)', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.6) }); } }
    if (k === 0) tx(700, 150, '좌표가 비면 무엇을 배포할지 모른다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
    if (k === 3) { const X = (i) => 140 + i * 80; el('line', { x1: X(0), y1: 330, x2: X(4), y2: 330, stroke: GRID, 'stroke-width': 3 }); for (let i = 0; i < 5; i++) el('circle', { cx: X(i), cy: 330, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      pill(X(4), 290, 'main', ACC, pop(u, 0.4), { fs: 14, mono: true }); el('line', { x1: X(4), y1: 304, x2: X(4), y2: 320, stroke: ACC, 'stroke-width': 2.5 });
      tx(640, 336, '세 좌표가 채워져 clone 대상이 하나로 정해진다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); }
    if (k === 4) { clusterBox(560, 290, 360, 110, 'ns web'); grow(700, 252, 700, 286, E(u, 0.2, 0.6), ACC); [0, 1, 2].forEach((i) => pod(660 + i * 70, 350, { s: pop(u, 0.7 + i * 0.25) }));
      [['source', '무엇을'], ['destination', '어디에'], ['syncPolicy', '어떻게']].forEach(([a, bb], i) => { mono(48, 300 + i * 34, a, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3 + i * 0.3) }); tx(200, 300 + i * 34, bb, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.3) }); }); }
    if (k === 5) banner(480, 330, 'acme/web 저장소의 k8s 폴더를 main 기준으로 배포하라', pop(u, 0.3));
    if (k === 6) { card(240, 340, 200, 56, { rx: 10, text: 'repo-server', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) }); grow(700, 254, 345, 330, E(u, 0.4, 1.0), ACC, { dash: '6 4' }); mono(560, 300, 'git clone', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.8) });
      const mx = 506 + ((t * 60) % 140); el('circle', { cx: mx + 30, cy: 150, r: 16, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 1.2) }); el('line', { x1: mx + 42, y1: 162, x2: mx + 54, y2: 174, stroke: WARN, 'stroke-width': 4, opacity: fade(u, 1.2) });
      tx(700, 380, '폴더 안을 보고 렌더링 도구를 고른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); } }

  // 2. 도구 자동 감지
  function folder(x, y, w, path, files, o) { o = o || {}; el('rect', { x, y, width: w, height: 40 + files.length * 32, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(x + 16, y + 26, path, { 'font-size': 15, 'font-weight': 800, fill: ACC });
    files.forEach((f, i) => { const mk = o.marker && o.marker(f), op = o.op ? o.op(i) : 1; if (mk) el('rect', { x: x + 10, y: y + 38 + i * 32, width: w - 20, height: 28, rx: 6, fill: mk === 'bad' ? BADBG : WARNBG, opacity: op });
      mono(x + 22, y + 58 + i * 32, f, { 'font-size': 14.5, 'font-weight': mk ? 800 : 400, fill: mk === 'bad' ? BAD : mk ? WARN : INK, opacity: op }); }); }
  function result(tool, u, o) { o = o || {}; const [name, col, cmd] = TOOL[tool], s = pop(u, o.at ?? 1.0);
    grow(400, 170, 520, 170, E(u, (o.at ?? 1.0) - 0.4, o.at ?? 1.0), col, { sw: 3 });
    card(640, 170, 220, 70, { rx: 12, stroke: col, fill: BG(col), s, sw: 3 }); tx(640, 166, name, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: s });
    mono(640, 190, cmd, { 'font-size': 14, 'text-anchor': 'middle', opacity: s });
    if (o.out) { grow(752, 170, 800, 170, E(u, (o.at ?? 1) + 0.4, (o.at ?? 1) + 0.7), col); ['Deployment', 'Service'].forEach((n, i) => card(870, 140 + i * 60, 120, 40, { rx: 8, text: n, fs: 14, mono: true, stroke: GRID, s: pop(u, (o.at ?? 1) + 0.6 + i * 0.2) })); } }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k === 1) { const RW = [['Chart.yaml', 'Helm', 'helm template', INFO], ['kustomization.yaml', 'Kustomize', 'kustomize build', GOOD], ['(둘 다 없음)', 'Directory', 'YAML 그대로', INK], ['*.jsonnet', 'Directory 안', 'Jsonnet 평가', INK]];
      ['폴더 안 파일', '도구', '렌더링'].forEach((h, j) => tx([80, 420, 640][j], 70, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
      RW.forEach(([a, bb, cc, col], i) => { const y = 120 + i * 64, s = pop(u, 0.2 + i * 0.35); card(480, y, 860, 52, { rx: 10, stroke: i < 2 ? col : GRID, s, sw: i < 2 ? 2.2 : 1.5 });
        mono(80, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: s }); grow(330, y, 400, y, E(u, 0.4 + i * 0.35, 0.7 + i * 0.35), col);
        tx(420, y + 6, bb, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: s }); mono(640, y + 6, cc, { 'font-size': 15, opacity: s }); });
      return; }
    const files = k === 0 ? ['deployment.yaml', 'service.yaml', 'ingress.yaml'] : k === 5 ? ['Chart.yaml', 'kustomization.yaml', 'values.yaml'] : b.files.filter((f) => !/^\(/.test(f)).map((f) => f.replace(/ .*$/, ''));
    const path = b.path;
    if (k === 0) { folder(40, 90, 340, path, files); const my = 90 + 40 + ((t * 50) % 96); el('rect', { x: 50, y: my, width: 320, height: 28, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2.5 });
      card(640, 170, 300, 90, { rx: 12, text: '마커 파일만 본다\n(설정으로 고르는 게 아니다)', fs: 15, stroke: WARN, s: pop(u, 0.8) });
      sub(210, 300, 'path 폴더 안만 스캔', fade(u, 0.4), { 'font-size': 15, 'font-weight': 700 }); return; }
    const marker = (f) => (k === 5 ? (f === 'kustomization.yaml' ? 'bad' : f === 'Chart.yaml' ? 'm' : null) : /^(Chart\.yaml|kustomization\.yaml)$/.test(f) ? 'm' : null);
    folder(40, 90, 340, path, files, { marker, op: (i) => fade(u, 0.1 + i * 0.15) });
    if (k === 2) { result('plain', u, { out: true }); sub(210, 300, '마커가 없으니 파일이 곧 결과', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 3) { result('helm', u, { out: true }); sub(210, 300, 'Chart.yaml 발견 → Helm', fade(u, 0.8), { 'font-size': 15, 'font-weight': 700, fill: INFO }); }
    if (k === 4) { result('kustomize', u, { out: true }); sub(210, 300, '환경별 overlay 폴더를 path로 가리킨다', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 5) { [['1. Chart.yaml → Helm', INFO], ['2. kustomization.yaml → Kustomize (덮어씀)', BAD]].forEach(([s, col], i) => mono(40, 290 + i * 30, s, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.6) }));
      result('kustomize', u, { at: 1.6 }); cross(640, 240, 12, pop(u, 2.0)); mono(680, 246, 'helm template 안 돈다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 390, '파일을 이름순으로 훑고, 같은 폴더면 나중에 본 마커가 이긴다', fade(u, 2.2), { 'font-size': 14 }); }
    if (k === 6) { snippet(40, 300, ['source:', '  helm:', '    valueFiles: [values.yaml]'], { op: fade(u, 0.2) }); result('helm', u, { at: 1.0 });
      sub(640, 260, '명시 블록이 있으면 감지에 기대지 않는다', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700 }); } }

  // 3. Helm values · Kustomize overlay
  const LAYER = [['차트 기본값', 'chart/values.yaml', MUT], ['valueFiles[0]', 'values.yaml (공통)', INK], ['valueFiles[1]', 'values-prd.yaml', ACC], ['parameters', 'image.tag=v2.3.1 · replicaCount=5', WARN]];
  function stack(n, u, o) { o = o || {}; for (let i = 0; i < n; i++) { const y = 330 - i * 62, [a, bb, col] = LAYER[i], s = o.anim && i >= o.from ? E(u, 0.2 + (i - o.from) * 0.5, 0.7 + (i - o.from) * 0.5) : 1;
      el('rect', { x: 300, y: y - 26 - (1 - s) * 30, width: 380, height: 50, rx: 10, fill: BG(col === INK ? GRID : col), stroke: o.bad && i > 0 ? BAD : col, 'stroke-width': 2, opacity: s });
      mono(316, y + 5 - (1 - s) * 30, bb, { 'font-size': 14, 'font-weight': 700, fill: INK, opacity: s }); tx(286, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: s, class: 'mono' }); }
    tx(490, 380, '↑ 위로 갈수록 우선', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { mono(40, 50, 'chart/ @ v2.3.1  (Helm)', { 'font-size': 16, 'font-weight': 800, fill: INFO });
      stack(k === 0 ? 1 : k === 1 ? 3 : 4, u, { anim: k > 0, from: k === 1 ? 1 : 3 });
      if (k === 2) { el('rect', { x: 720, y: 100, width: 210, height: 150, rx: 12, fill: PANEL, stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.2) }); tx(736, 128, '최종값', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
        mono(736, 170, 'image.tag', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); mono(914, 170, 'v2.3.1', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.4) });
        mono(736, 210, 'replicaCount', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); mono(914, 210, '5', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.6) }); }
      if (k === 0) sub(820, 330, '감지만 된 상태 = 차트 기본값 그대로', fade(u, 0.8), { 'font-size': 14.5, 'font-weight': 700 });
      if (k === 1) sub(820, 200, '배열에서 뒤에 온 파일이 앞을 덮는다', fade(u, 1.4), { 'font-size': 14.5, 'font-weight': 700 });
      return; }
    if (k === 3 || k === 4) { mono(40, 50, 'k8s/overlays/prd @ v2.3.1  (Kustomize)', { 'font-size': 16, 'font-weight': 800, fill: GOOD });
      folder(40, 80, 260, 'k8s/base/', ['deployment.yaml', 'service.yaml']); folder(40, 230, 260, 'k8s/overlays/prd/', ['kustomization.yaml', 'patch.yaml'], { marker: (f) => (f === 'kustomization.yaml' ? 'm' : null) });
      grow(170, 196, 170, 226, 1, GOOD); mono(318, 290, '← path', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: k === 3 ? fade(u, 0.5) : 1 });
      if (k === 3) { tx(640, 200, 'overlay 폴더만 바꾸면 환경이 갈린다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
      const R0 = [['images', 'acme/web:v2.3.1'], ['namePrefix', 'prd-'], ['commonLabels', 'env: prd']];
      R0.forEach(([a, bb], i) => { const y = 110 + i * 46; mono(420, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2 + i * 0.4) }); mono(560, y, bb, { 'font-size': 14.5, opacity: fade(u, 0.2 + i * 0.4) }); });
      const g = E(u, 1.4, 2.0); card(680, 320, 360, 100, { rx: 12, stroke: GOOD, fill: GOODBG, s: pop(u, 1.2) });
      mono(520, 300, 'name: ' + (g > 0.5 ? 'prd-web' : 'web'), { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.3) }); mono(520, 326, 'labels: ' + (g > 0.5 ? 'env=prd' : '—'), { 'font-size': 14.5, opacity: fade(u, 1.3) });
      mono(520, 352, 'image: ' + (g > 0.5 ? 'acme/web:v2.3.1' : 'acme/web'), { 'font-size': 14.5, opacity: fade(u, 1.3) }); tx(848, 300, '예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.3) }); return; }
    if (k === 5) { stack(4, u, { bad: true }); [['values.yaml', 268], ['values-prd.yaml', 206], ['parameters', 144]].forEach(([s, y], i) => { mono(710, y + 6, 'image.tag ?', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3 + i * 0.4) }); });
      tx(490, 60, '같은 키가 세 군데 → 최종값을 아무도 모른다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); return; }
    stack(3, u, {}); el('rect', { x: 300, y: 118, width: 380, height: 50, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.4) });
    mono(316, 148, 'parameters: CI가 넣는 image.tag만', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.5) });
    check(720, 206, 14, pop(u, 0.9)); tx(745, 212, '환경 override는 여기 한 곳', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) }); }

  // 4. targetRevision — 시점 고정
  function tline(n, y, o) { o = o || {}; const X = (i) => (o.x0 || 120) + i * (o.gap || 80); el('line', { x1: X(0), y1: y, x2: X(n - 1), y2: y, stroke: GRID, 'stroke-width': 3 });
    for (let i = 0; i < n; i++) el('circle', { cx: X(i), cy: y, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 }); return X; }
  function flag(x, y, s, col, sc, up) { pill(x, y + (up ? -38 : 38), s, col, sc, { fs: 14, mono: true, fill: BG(col) }); el('line', { x1: x, y1: y + (up ? -24 : 24), x2: x, y2: y + (up ? -9 : 9), stroke: col, 'stroke-width': 2.5, opacity: sc }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 3) { [['dev', 'main', ACC, '빠른 반영'], ['stg', 'release-1', INFO, '릴리스 브랜치 추적'], ['prd', 'v2.3.1', GOOD, '태그 고정 → 재현']].forEach(([env, rev, col, note], i) => { const y = 100 + i * 110, s = pop(u, 0.2 + i * 0.4);
        clusterBox(40, y - 40, 200, 80, env, { stroke: col, fill: BG(col), op: s }); grow(244, y, 380, y, E(u, 0.4 + i * 0.4, 0.8 + i * 0.4), col); mono(400, y + 6, 'targetRevision: ' + rev, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s }); tx(760, y + 6, note, { 'font-size': 15, opacity: s }); });
      return; }
    if (k === 4) { const X = tline(6, 200, { x0: 100, gap: 150 });
      [['main 개발 → dev', 0], ['QA 통과', 1], ['git tag v2.3.1', 2], ['운영 rev → v2.3.1 (PR)', 3], ['sync: 그 시점만 배포', 4]].forEach(([s, i]) => { const up = i % 2 === 0; tx(X(i), up ? 140 : 270, (i + 1) + '. ' + s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.35) }); });
      flag(X(2), 200, 'v2.3.1', GOOD, pop(u, 1.0), false);
      pill(480, 360, '롤백 = targetRevision을 v2.3.0으로 되돌리는 PR', WARN, pop(u, 2.0), { fs: 15 }); return; }
    const X = tline(6, 210), mv = k === 1 ? E(u, 0.4, 1.2) : k === 5 ? (t * 0.4) % 1 : 0;
    const tip = k === 1 ? lerp(X(4), X(5), mv) : k === 5 ? lerp(X(3), X(5), mv) : X(4);
    if (k === 1) fly(X(5), 110, X(5), 210, seg(u, 0.1, 0.5), 'git push', {});
    flag(tip, 210, k === 5 ? 'HEAD' : 'main', BAD, k === 0 ? pop(u, 0.2) : 1, true);
    if (k === 0 || k === 5) { flag(X(2), 210, 'v2.3.1', GOOD, k === 0 ? pop(u, 0.6) : 1, false); }
    if (k === 0) { flag(X(1), 210, '9f2c1a3…', GOOD, pop(u, 1.0), true); tx(860, 140, '브랜치 · HEAD: 움직인다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.4) }); tx(860, 300, '태그 · SHA: 고정', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.6) }); }
    if (k === 1) { clusterBox(640, 300, 280, 100, '배포 내용'); [0, 1, 2].forEach((i) => pod(700 + i * 60, 360, { col: mv > 0.5 ? WARN : GOOD })); sub(300, 360, 'push마다 배포 내용이 조용히 바뀐다', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700, fill: WARN }); }
    if (k === 2) { [['어제 sync', GOOD, 3], ['오늘 sync', WARN, 4]].forEach(([s, col, at], i) => { const x = 260 + i * 440; card(x, 340, 300, 90, { rx: 12, stroke: col, s: pop(u, 0.3 + i * 0.5) }); tx(x, 320, s, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) }); mono(x, 348, 'main = ' + ['커밋 4', '커밋 5'][i], { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.5) }); grow(X(at - 1 + i), 222, x, 294, E(u, 0.3 + i * 0.5, 0.8 + i * 0.5), col); });
      tx(480, 400, '같은 Application인데 결과가 다르다 → 재현 불가', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k === 5) { tx(480, 340, 'HEAD는 "지금 기본 브랜치의 끝" — 시점이 아니다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) }); pill(480, 385, '운영은 태그 · 커밋 SHA로 고정', GOOD, pop(u, 1.2), { fs: 15 }); } }

  // 5. 다중 source + 프라이빗 인증
  function s5(t, c) { const { k, u } = c;
    const priv = k >= 4;
    repo(40, 40, 330, 120, 'deploy-values.git'); mono(60, 106, 'env/prd/values.yaml', { 'font-size': 14.5 }); pill(205, 140, 'ref: valuesRepo', ACC, k === 0 ? pop(u, 0.6) : 1, { fs: 14, mono: true, fill: ACCBG });
    if (k >= 1) { repo(40, 200, 330, 120, 'web-chart.git @ v2.3.1', { stroke: k >= 4 && k < 8 ? WARN : INK }); mono(60, 266, 'chart/Chart.yaml', { 'font-size': 14.5, opacity: k === 1 ? fade(u, 0.4) : 1 }); if (priv) lock(345, 220, k < 5, k < 5 ? BAD : GOOD, 0.9); }
    if (k === 0) { tx(650, 100, 'sources: (복수형 배열)', { 'font-size': 16, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 0.3) }); tx(650, 140, 'ref는 아래에서 $별칭으로 꺼내 쓰는 이름표', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 1) tx(650, 260, '같은 배열의 두 번째 항목', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
    if (k === 2 || k === 3 || k === 8) { card(580, 180, 220, 80, { rx: 12, text: 'helm template', fs: 16, mono: true, stroke: INFO, color: INFO });
      grow(372, 100, 470, 165, k === 2 ? E(u, 0.8, 1.3) : 1, ACC); grow(372, 260, 470, 195, k === 2 ? E(u, 0.3, 0.8) : 1, INK);
      if (k === 2) { fly(205, 100, 560, 160, seg(u, 0.6, 1.8), '$valuesRepo/env/prd/values.yaml', { mono: true }); sub(580, 250, '차트는 저 저장소, 값은 우리 저장소', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700 }); } }
    if (k === 3 || k === 8) { grow(692, 180, 760, 180, k === 3 ? E(u, 0.2, 0.6) : 1, INFO); clusterBox(770, 120, 160, 120, 'ns web'); [0, 1].forEach((i) => pod(820 + i * 60, 190, { s: k === 3 ? pop(u, 0.7 + i * 0.2) : 1 }));
      if (k === 3) sub(600, 300, '조합은 여러 곳에서, 배포는 한 곳으로', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700 }); }
    if (k >= 4 && k <= 7) { zone(470, 40, 460, 350, 'ns argocd', { fill: ACCBG, color: ACC });
      const F = k === 6 ? [['type', 'git'], ['url', 'https://github.com/acme/web-chart.git'], ['username', 'git'], ['password', 'ghp_xxxx… (PAT)']] : k === 7 ? [['type', 'git'], ['url', 'git@github.com:acme/web-chart.git'], ['sshPrivateKey', '(개인키)']] : [];
      card(700, 100, 400, 56, { rx: 10, text: 'Secret  repo-web', fs: 16, mono: true, stroke: ACC, s: k === 4 ? pop(u, 0.4) : 1 });
      if (k === 4) { grow(372, 260, 470, 260, E(u, 0.8, 1.2), BAD); tx(700, 220, 'clone 전에 먼저 등록한다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); tx(700, 260, '없으면 clone부터 실패', { 'font-size': 15, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
      if (k >= 5) { mono(500, 160, 'argocd.argoproj.io/secret-type: repository', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: k === 5 ? fade(u, 0.3) : 1 });
        if (k === 5) { argo(700, 260, { s: pop(u, 0.9) }); check(800, 252, 12, pop(u, 1.4)); tx(700, 330, '라벨이 없으면 그냥 무시된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); } }
      F.forEach(([a, bb], i) => { const y = 210 + i * 34; mono(490, y, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.2 + i * 0.2) }); mono(604, y, bb, { 'font-size': 13.5, 'font-weight': 700, fill: i === 1 ? ACC : INK, opacity: fade(u, 0.2 + i * 0.2) }); });
      if (k === 6) { el('rect', { x: 596, y: 226, width: 318, height: 26, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.0) }); tx(700, 370, 'url = Application의 repoURL이어야 매칭', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
      if (k === 7) tx(700, 370, 'url 형식과 인증 방식은 짝이 맞아야 한다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 8) { [['인증', '저장소 단위 (url = repoURL)'], ['도구 감지', '폴더 단위 (path)']].forEach(([a, bb], i) => { tx(470, 300 + i * 34, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2 + i * 0.3) }); tx(570, 300 + i * 34, bb, { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.3) }); });
      pill(205, 380, '미등록 → repository not found', BAD, pop(u, 1.2), { fs: 14 }); } }

  const quiz = [
    { q: 'repoURL · path · targetRevision 중 "저장소 안 어느 폴더"를 가리키는 것은 무엇인가?',
      o: ['repoURL', 'path', 'targetRevision'], a: 1,
      why: 'path는 저장소 루트 기준 상대 경로다. 도구 감지도 이 폴더 안만 본다.' },
    { q: 'path 폴더에 Chart.yaml과 kustomization.yaml이 함께 있으면 어떤 도구로 감지되나?',
      o: ['Helm', 'Directory', 'Kustomize'], a: 2,
      why: '같은 폴더에서는 나중에 본 kustomization.yaml이 이겨 Kustomize가 된다. 그러면 helm template은 돌지 않는다.' },
    { q: 'valueFiles가 [values.yaml, values-prd.yaml]이고 parameters에 image.tag=v2.3.1이 있으면 최종 image.tag는 어디서 오나?',
      o: ['parameters', 'values-prd.yaml', '차트 기본값'], a: 0,
      why: '우선순위는 parameters > valueFiles 뒤쪽 > 앞쪽 > 차트 기본값이다.' },
    { q: '운영 Application의 targetRevision을 main으로 두면 생기는 문제는 무엇인가?',
      o: ['clone이 실패한다', 'push 때마다 배포 내용이 바뀌어 재현이 안 된다', 'Helm 감지가 꺼진다'], a: 1,
      why: '브랜치는 움직이는 포인터다. 어제 sync와 오늘 sync 결과가 달라질 수 있어 운영은 태그나 SHA로 고정한다.' },
    { q: '프라이빗 저장소용 Secret을 argocd 네임스페이스에 만들었는데 Argo CD가 쓰지 않는다. 빠졌을 가능성이 큰 것은?',
      o: ['argocd.argoproj.io/secret-type: repository 라벨', 'destination.namespace', 'syncPolicy.automated'], a: 0,
      why: '이 라벨이 있어야 저장소 자격증명으로 읽는다. url도 Application의 repoURL과 같아야 매칭된다.' },
  ];

  const summary = [
    'source는 저장소, 폴더, 시점 세 좌표로 배포할 매니페스트를 하나로 정한다.',
    'Argo CD는 폴더 안 Chart.yaml이나 kustomization.yaml을 보고 렌더링 도구를 고른다.',
    'Helm 값은 parameters가 가장 강하니 환경 값은 values-prd.yaml 한 곳에 모은다.',
    '운영은 태그로 고정하고, 프라이빗 저장소는 라벨 붙인 Secret을 먼저 등록한다.',
  ];
  const review = [
    { q: 'Helm 차트로 배포하던 앱이 어느 날부터 helm template 없이 렌더링된다. 먼저 의심할 것은?',
      o: ['targetRevision이 태그로 고정된 것', 'chart/ 폴더에 kustomization.yaml이 섞여 들어간 것', 'repo Secret의 비밀번호가 바뀐 것'], a: 1,
      why: '같은 폴더에 kustomization.yaml이 있으면 Kustomize로 감지된다. 지우거나 source.helm 블록으로 도구를 못 박는다.' },
    { q: '운영에 배포된 image.tag가 values-prd.yaml에 적은 값과 다르다. 먼저 볼 곳은?',
      o: ['Application의 helm.parameters', '차트의 Chart.yaml', 'destination.server'], a: 0,
      why: 'parameters는 valueFiles를 덮어쓴다. 같은 키를 여러 곳에 두면 최종값을 찾기 어렵다.' },
    { q: '공개 차트 저장소의 차트에 우리 프라이빗 저장소의 values를 얹으려 한다. 알맞은 구성은?',
      o: ['source 하나에 helm과 kustomize를 함께 쓴다', 'targetRevision을 HEAD로 둔다', 'sources 배열에 ref를 붙이고 $별칭 경로로 values를 지정한다'], a: 2,
      why: 'ref로 이름표를 붙인 저장소의 파일을 $valuesRepo/… 로 꺼내 쓴다. 프라이빗 쪽은 repository 라벨이 붙은 Secret이 먼저 있어야 한다.' },
  ];

  R.page({ title: 'source 좌표와 렌더링', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
