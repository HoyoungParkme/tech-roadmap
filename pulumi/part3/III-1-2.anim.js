/* III-1-2 Kubernetes provider — manifest 를 코드로 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, person } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function fileIc(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-18,-24 H8 L18,-14 V24 H-18 Z', fill: PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M8,-24 V-14 H18', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-6, 2, 10].forEach((y) => el('line', { x1: -11, y1: y, x2: 11, y2: y, stroke: OFF, 'stroke-width': 2.5 }, g));
    if (name) tx(0, 44, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  // Pod 한 칸: 라벨·이미지는 있으면 적는다
  function pod(cx, cy, o) { o = o || {}; const g = card(cx, cy, 104, 70, { rx: 10, stroke: o.on ? INFO : OFF, dash: o.on ? null : '5 4', fill: o.on ? INFOBG : PANEL, s: o.s });
    tx(0, -14, 'Pod', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: o.on ? INFO : MUT }, g);
    if (o.label) mono(0, 6, 'app=web', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: o.label }, g);
    if (o.img) mono(0, 26, 'nginx:1.27', { 'text-anchor': 'middle', 'font-size': 13.5, fill: INK, opacity: o.img }, g); return g; }
  // 리소스 칩: 종류 + 이름
  function chip(cx, cy, w, kind, name, col, o) { o = o || {}; const g = card(cx, cy, w, 44, { rx: 8, stroke: col, sw: 2, fill: o.fill || PANEL, s: o.s, op: o.op, dash: o.dash });
    tx(-w / 2 + 12, 6, kind, { 'font-size': 14, 'font-weight': 800, fill: col }, g); mono(w / 2 - 12, 6, name, { 'font-size': 14, 'text-anchor': 'end' }, g); return g; }
  // 작성 → 커밋 → apply → 클러스터: 실패가 어느 칸에서 드러나는지
  function pipeline(y, failAt, u, t0) { const xs = [130, 350, 570, 790], ns = ['작성', '커밋 · 리뷰', 'kubectl apply', '클러스터'];
    xs.forEach((x, i) => { card(x, y, 170, 46, { rx: 23, stroke: i === failAt && u > t0 + 0.3 ? BAD : GRID, text: ns[i], fs: 15, s: pop(u, 0.2 + i * 0.15) }); if (i < 3) grow(x + 88, y, xs[i + 1] - 88, y, E(u, 0.5 + i * 0.15, 0.9 + i * 0.15), MUT); });
    const fx = xs[failAt]; dot([[xs[0], y - 34], [fx, y - 34]], seg(u, 0.9, t0), INK, 7);
    if (u > t0) { cross(fx, y - 44, 12, pop(u, t0)); } }

  // ---------- 1. 왜 manifest 를 코드로 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const L = ['apiVersion: apps/v1', 'kind: Deployment', 'metadata:', '  name: web'];
      fileIc(80, 70, 'web-deployment.yaml', { s: pop(u, 0.1) });
      snippet(160, 40, L.slice(0, Math.ceil(E(u, 0.2, 1.4) * 4 + 0.01)), { fs: 16, w: 300 });
      [['API 그룹·버전', 62], ['무엇을 만들지', 88], ['이름', 140]].forEach(([s, y], i) => { const a = fade(u, 1.3 + i * 0.3);
        grow(470, y + 4, 560, y + 4, E(u, 1.3 + i * 0.3, 1.6 + i * 0.3), MUT, { plain: true }); tx(572, y + 9, s, { 'font-size': 15, 'font-weight': 700, opacity: a }); });
      tx(480, 300, '머리 부분은 YAML로도 아무 문제 없다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 1 || k === 3) { const yaml = k === 1;
      if (yaml) { snippet(60, 30, ['spec:', '  replicas: "3"    # 문자열로 잘못 씀', '  selector:', '    matchLabels: { app: web }'], { fs: 15, w: 420 });
        tx(700, 70, 'YAML은 그냥 글자', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.3) }); tx(700, 96, '파일만 보고는 틀린 줄 모른다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.5) }); }
      else { snippet(60, 30, ['spec: {', '  replicas: "3",   // 컴파일 에러', '  selectr: { … }, // 없는 필드명', '}'], { fs: 15, w: 420 });
        el('path', { d: 'M180,84 q4,4 8,0 t8,0 t8,0 t8,0 t8,0 t8,0', fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.5) });
        [['타입 실수', BAD], ['필드명 오타', BAD], ['다른 리소스 값 참조', GOOD]].forEach(([s, col], i) => pill(700, 50 + i * 40, s, col, pop(u, 0.4 + i * 0.25), { fs: 15 })); }
      pipeline(300, yaml ? 3 : 0, u, yaml ? 2.0 : 1.2);
      sub(480, 380, yaml ? 'apply 해서 클러스터가 거절할 때 처음 안다' : '작성하는 자리에서 막힌다 · 실패가 앞으로 당겨진다', fade(u, yaml ? 2.2 : 1.6), { 'font-size': 16, fill: yaml ? BAD : GOOD, 'font-weight': 700 }); return; }
    if (k === 2) { mono(80, 70, 'import * as k8s from "@pulumi/kubernetes";', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      card(150, 220, 100, 50, { rx: 10, stroke: ACC, text: 'k8s', fs: 18, mono: true, color: ACC, s: pop(u, 0.4) });
      [['apps.v1', 'Deployment', 130], ['core.v1', 'Service', 220], ['networking.v1', 'Ingress', 310]].forEach(([ns, kind, y], i) => { const a = 0.8 + i * 0.35;
        grow(200, 220, 330, y, E(u, a, a + 0.3), ACC, { plain: true }); card(410, y, 160, 40, { rx: 8, stroke: ACC, text: ns, fs: 14, mono: true, s: pop(u, a + 0.2) });
        grow(490, y, 600, y, E(u, a + 0.3, a + 0.6), MUT, { plain: true }); card(690, y, 180, 40, { rx: 8, stroke: INK, text: kind, fs: 15, s: pop(u, a + 0.5) }); });
      sub(690, 380, 'K8s 리소스 종류마다 타입이 붙은 클래스', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4: app: web 이 세 군데 → 변수 하나
    const spots = [['Deployment', 'selector.matchLabels', 90], ['Deployment', 'template.metadata.labels', 190], ['Service', 'spec.selector', 290]];
    spots.forEach(([kind, path, y], i) => { const a = 0.2 + i * 0.3; card(190, y, 320, 66, { rx: 10, stroke: GRID, s: pop(u, a) });
      tx(44, y - 8, kind, { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: fade(u, a) }); mono(44, y + 16, path + ':', { 'font-size': 13.5, opacity: fade(u, a) });
      pill(290, y + 11, 'app: web', WARN, pop(u, a + 0.2), { mono: true, fs: 13.5 }); grow(352, y + 11, 590, 190, E(u, 1.4 + i * 0.1, 1.9 + i * 0.1), ACC); });
    card(750, 190, 300, 56, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'const appLabels = { app: "web" }', fs: 14, mono: true, s: pop(u, 1.9) });
    mono(750, 260, '3곳 → 변수 1개', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.2) }); }

  // ---------- 2. Deployment + Service ----------
  const PX = [560, 680, 800];
  function cluster(k, u, o) { zone(470, 30, 470, 370, '클러스터 (선언한 모양)', { fill: SOFT }); }
  function s2(t, c) { const { k, u } = c;
    cluster();
    if (k === 0) { pill(200, 90, 'apiVersion: apps/v1', MUT, pop(u, 0.2), { mono: true, fs: 14 }); pill(200, 150, 'kind: Deployment', MUT, pop(u, 0.4), { mono: true, fs: 14 });
      grow(290, 90, 340, 200, E(u, 0.8, 1.2), ACC, { plain: true }); grow(290, 150, 340, 200, E(u, 0.8, 1.2), ACC, { plain: true });
      card(230, 240, 300, 50, { rx: 10, stroke: ACC, sw: 2.5, text: 'k8s.apps.v1.Deployment', fs: 16, mono: true, color: ACC, s: pop(u, 1.3) });
      sub(230, 290, 'kind 문자열이 클래스 이름이 된다', fade(u, 1.7), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      chip(705, 90, 260, 'Deployment', 'web', ACC, { s: pop(u, 2.0) }); return; }
    chip(705, 80, 260, 'Deployment', 'web', ACC);
    const on = k >= 3;
    PX.forEach((x, i) => pod(x, 190, { s: k === 1 ? pop(u, 0.6 + i * 0.25) : 1, on, label: k >= 2 ? (k === 2 ? fade(u, 1.4 + i * 0.2) : 1) : 0, img: k >= 3 ? (k === 3 ? fade(u, 0.6 + i * 0.25) : 1) : 0 }));
    if (k === 1) { snippet(30, 60, ['replicas: 3,      // number', 'replicas: "3",    // 빨간 줄'], { fs: 15, w: 400 });
      el('path', { d: 'M140,114 q4,4 8,0 t8,0 t8,0 t8,0', fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.2) });
      pill(230, 170, '숫자 자리에 문자열은 컴파일 에러', BAD, pop(u, 1.5), { fs: 14 }); mono(680, 270, 'replicas: 3', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { card(230, 190, 300, 50, { rx: 10, stroke: ACC, fill: ACCBG, text: 'appLabels', fs: 17, mono: true, color: ACC, s: pop(u, 0.2) });
      grow(380, 180, 600, 92, E(u, 0.5, 1.0), ACC); mono(430, 120, 'selector', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
      grow(380, 200, 500, 200, E(u, 0.9, 1.3), ACC); mono(395, 232, 'template.labels', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) });
      sub(230, 300, '같은 변수라 둘이 어긋날 수 없다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { snippet(30, 90, ['containers: [{', '  name: "web",', '  image: "nginx:1.27",', '  ports: [{ containerPort: 80 }],', '}]'], { fs: 14.5, w: 410 });
      PX.forEach((x, i) => pill(x, 252, ':80', INFO, pop(u, 1.4 + i * 0.2), { mono: true, fs: 13.5 })); return; }
    // k4: Service LoadBalancer
    chip(705, 330, 260, 'Service', 'web-svc', WARN, { s: pop(u, 0.2) }); pill(705, 376, 'type: LoadBalancer', WARN, pop(u, 0.5), { mono: true, fs: 13.5 });
    PX.forEach((x, i) => grow(705, 306, x, 228, E(u, 0.9 + i * 0.15, 1.3 + i * 0.15), WARN, { plain: true, dash: '5 4' }));
    person(160, 330, '바깥 사용자', { s: pop(u, 1.2) }); grow(200, 330, 572, 330, E(u, 1.5, 2.1), INK); mono(380, 318, ':80', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) });
    sub(230, 130, 'selector = appLabels로 Pod를 찾는다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 3. ConfigFile / ConfigGroup ----------
  function stateList(x, y, rows, o) { o = o || {}; zone(x, y, 300, 46 + rows.length * 50, 'Pulumi state', { fill: PANEL, stroke: INK, color: INK });
    rows.forEach(([kind, name, col, s], i) => chip(x + 150, y + 62 + i * 50, 270, kind, name, col, { s })); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { snippet(30, 20, ['new k8s.yaml.ConfigFile("cert-manager", {', '  file: "./manifests/cert-manager.yaml" });'], { fs: 14.5, w: 470 });
      const docs = [['Namespace', 'cert-manager'], ['Deployment', 'cert-manager'], ['CRD · RBAC', '… 수백 줄']];
      docs.forEach(([kind, name], i) => { const y = 150 + i * 72, sp = E(u, 0.5 + i * 0.3, 0.9 + i * 0.3);
        card(250, y, 300, 56, { rx: 6, stroke: GRID, s: 1, op: 1 }); tx(116, y - 4, kind, { 'font-size': 15, 'font-weight': 800 }); mono(116, y + 18, name, { 'font-size': 13.5, fill: MUT });
        if (i < 2) mono(250, y + 42, '---', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', 'font-weight': 800, opacity: sp });
        fly(410, y, 740, 160 + i * 60, seg(u, 1.2 + i * 0.3, 1.9 + i * 0.3), kind, { fill: INFO }); });
      zone(590, 110, 300, 210, 'Pulumi state', { fill: PANEL, stroke: INK, color: INK });
      docs.forEach(([kind, name], i) => { if (u > 1.9 + i * 0.3) chip(740, 160 + i * 60, 270, kind, name, INFO, { s: pop(u, 1.9 + i * 0.3) }); });
      sub(480, 400, 'YAML은 손대지 않고 문서 하나가 리소스 하나', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { snippet(30, 20, ['new k8s.yaml.ConfigGroup("monitoring", {', '  files: ["./manifests/monitoring/*.yaml"] });'], { fs: 14.5, w: 490 });
      zone(40, 120, 380, 240, 'manifests/monitoring/', { fill: SOFT });
      for (let i = 0; i < 4; i++) { const yamlF = i !== 2, x = 100 + i * 90, hit = u > 0.8 + i * 0.25;
        fileIc(x, 220, yamlF ? '.yaml' : '.md', { stroke: hit ? (yamlF ? INFO : OFF) : INK }); if (!yamlF && hit) cross(x + 16, 196, 9, pop(u, 0.8 + i * 0.25));
        if (yamlF) grow(x + 20, 220, 568, 240, E(u, 1.4 + i * 0.1, 1.9 + i * 0.1), INFO, { plain: true }); }
      card(700, 240, 260, 60, { rx: 10, stroke: INFO, fill: INFOBG, text: 'monitoring/*\n맞는 파일 전부', fs: 15, color: INFO, s: pop(u, 1.9) });
      sub(230, 330, 'glob에 맞는 파일만', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { snippet(30, 20, ['const nsGroup = new k8s.yaml.ConfigGroup("nsGroup", {', '  files: ["./manifests/app/*.yaml"],'], { fs: 14.5, w: 560 });
      card(250, 230, 280, 120, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.3) }); mono(250, 196, 'nsGroup', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      [0, 1, 2].forEach((i) => el('rect', { x: 150 + i * 70, y: 220, width: 56, height: 40, rx: 6, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.6 + i * 0.2) }));
      sub(250, 316, 'app/*.yaml에서 읽은 리소스', fade(u, 1.0));
      grow(400, 230, 600, 230, E(u, 1.2, 1.8), ACC); card(740, 230, 260, 60, { rx: 10, stroke: INK, text: '다른 코드에서 참조\n조작도 할 수 있다', fs: 15, s: pop(u, 1.8) });
      sub(480, 390, '로드한 결과도 그냥 변수다', fade(u, 2.2), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { fileIc(80, 220, 'app/*.yaml', { stroke: INK }); lock_(80, 150, u);
      card(480, 220, 120, 240, { rx: 12, stroke: WARN, sw: 2.5, fill: WARNBG, s: pop(u, 0.2) });
      mono(480, 64, 'transformations', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); mono(480, 86, 'obj.metadata.namespace = "prod"', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      [0, 1, 2].forEach((i) => { const p = seg(u, 0.6 + i * 0.4, 1.8 + i * 0.4); if (p <= 0) return; const x = lerp(160, 800, p), y = 140 + i * 80, after = p > 0.55;
        card(x, y, 150, 44, { rx: 8, stroke: after ? GOOD : MUT, fill: after ? GOODBG : PANEL, text: after ? 'ns: prod' : 'ns: (없음)', fs: 14, mono: true, color: after ? GOOD : MUT }); });
      sub(480, 390, '원본 YAML은 그대로, 읽어 들일 때만 값이 바뀐다', fade(u, 2.2), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    // k4: 한 stack 에 둘 다
    stateList(330, 40, [['Deployment', 'web', ACC, pop(u, 0.2)], ['Service', 'web-svc', ACC, pop(u, 0.4)], ['ConfigFile', 'cert-manager', INFO, pop(u, 0.7)], ['ConfigGroup', 'monitoring/*', INFO, pop(u, 0.9)]]);
    pill(160, 120, '새로 쓰는 것 = 타입 코드', ACC, pop(u, 1.3), { fs: 15 }); pill(810, 220, '검증된 YAML = 로드', INFO, pop(u, 1.5), { fs: 15 });
    banner(480, 380, '한 번에 다 옮기지 않아도 된다', pop(u, 2.0)); }
  function lock_(cx, cy, u) { R.lock(cx, cy, true, MUT, pop(u, 1.0)); sub(cx, cy + 34, '원본 그대로', fade(u, 1.2), { 'font-weight': 700 }); }

  // ---------- 4. Helm Chart / Release ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) {
      card(130, 70, 220, 48, { rx: 10, stroke: MUT, text: 'charts.bitnami.com', fs: 14, mono: true });
      card(130, 170, 200, 70, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'Chart "redis"\nversion 20.1.0', fs: 15, color: ACC, s: k === 0 ? pop(u, 0.3) : 1 }); grow(130, 96, 130, 132, k === 0 ? E(u, 0.2, 0.6) : 1, MUT);
      card(400, 170, 160, 60, { rx: 10, stroke: INK, text: '템플릿 렌더', fs: 15, s: k === 0 ? pop(u, 0.8) : 1 }); grow(232, 170, 318, 170, k === 0 ? E(u, 0.8, 1.2) : 1, INK);
      zone(560, 40, 380, 300, 'Pulumi state · 리소스 하나씩', { fill: PANEL, stroke: INK, color: INK });
      ['StatefulSet', 'Service', 'Secret', 'ConfigMap'].forEach((n, i) => { const a = k === 0 ? 1.2 + i * 0.25 : -1;
        fly(482, 170, 750, 96 + i * 58, seg(u, a, a + 0.5), n, { fill: INFO }); if (k > 0 || u > a + 0.5) chip(750, 96 + i * 58, 320, n, 'redis', INFO, { s: k === 0 ? pop(u, a + 0.5) : 1 }); });
      if (k === 0) { sub(480, 380, 'helm install 대신 코드 · 버전이 박혀 다시 만들어도 같다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      snippet(30, 250, ['values: {', '  architecture: "standalone",', '  auth: { enabled: true },', '}'], { fs: 14, w: 300, op: fade(u, 0.2) });
      grow(240, 270, 330, 190, E(u, 0.7, 1.2), ACC); sub(480, 400, 'values가 객체라 다른 리소스의 출력도 넣을 수 있다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      pill(400, 236, 'values.yaml과 같은 뜻', MUT, pop(u, 1.3), { fs: 13.5 }); return; }
    if (k === 2) { tx(240, 44, 'helm.v3.Chart', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC }); tx(720, 44, 'helm.v3.Release', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: WARN });
      zone(40, 70, 400, 150, 'Pulumi state', { fill: PANEL, stroke: GRID });
      ['StatefulSet', 'Service', 'Secret', 'ConfigMap'].forEach((n, i) => card(140 + (i % 2) * 200, 130 + Math.floor(i / 2) * 52, 180, 40, { rx: 8, stroke: INFO, text: n, fs: 14, s: pop(u, 0.2 + i * 0.1) }));
      zone(40, 250, 400, 110, 'helm list', { fill: SOFT }); sub(240, 320, '(릴리스 없음)', fade(u, 0.8), { 'font-size': 15 });
      zone(520, 70, 400, 150, 'Pulumi state', { fill: PANEL, stroke: GRID }); card(720, 150, 300, 44, { rx: 8, stroke: WARN, text: 'Release  prometheus', fs: 15, s: pop(u, 1.0) });
      zone(520, 250, 400, 110, 'helm history', { fill: SOFT }); mono(560, 300, 'REVISION 1  deployed', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      sub(720, 340, 'helm rollback도 그대로 쓴다', fade(u, 1.9), { fill: INK, 'font-weight': 700 });
      sub(480, 405, '리소스 단위로 관리하면 Chart, helm 릴리스로 관리하면 Release', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const path = [['values', 120], ['server', 330], ['persistentVolume', 560], ['size: "20Gi"', 800]];
      path.forEach(([n, x], i) => { card(x, 200, i === 3 ? 180 : 190, 50, { rx: 10, stroke: i === 3 ? WARN : INK, sw: i === 3 ? 2.5 : 2, text: n, fs: 15, mono: true, color: i === 3 ? WARN : INK, s: pop(u, 0.2 + i * 0.35) });
        if (i < 3) grow(x + 97, 200, path[i + 1][1] - (i === 2 ? 92 : 97), 200, E(u, 0.4 + i * 0.35, 0.7 + i * 0.35), MUT); });
      card(480, 320, 360, 46, { rx: 23, stroke: GRID, text: 'helm --set server.persistentVolume.size=20Gi', fs: 13.5, mono: true, color: MUT, s: pop(u, 1.8) });
      sub(480, 380, 'CLI 플래그 대신 코드에 남아 리뷰된다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    [['helm.v3.Chart', 'redis', ACC], ['helm.v3.Release', 'prometheus', WARN], ['kustomize.Directory', 'overlays/prod', INFO]].forEach(([cls, n, col], i) => { const y = 90 + i * 110;
      card(200, y, 300, 60, { rx: 10, stroke: col, sw: 2.5, text: cls + '\n' + n, fs: 15, mono: true, color: col, s: pop(u, 0.2 + i * 0.35) }); grow(352, y, 600, 200, E(u, 0.8 + i * 0.3, 1.3 + i * 0.3), col); });
    card(760, 200, 300, 80, { rx: 12, stroke: INK, sw: 2.5, text: '한 stack\n같은 방식으로 관리', fs: 16, s: pop(u, 1.8) }); }

  // ---------- 5. provider · endpoint Output ----------
  function s5(t, c) { const { k, u } = c;
    zone(30, 200, 420, 200, 'staging 클러스터', { fill: SOFT }); zone(510, 200, 420, 200, 'prod 클러스터', { fill: SOFT });
    if (k <= 1 || k === 2) { fileIc(80, 80, 'kubeconfig', { stroke: k === 0 ? ACC : INK });
      chip(270, 80, 260, 'Provider', 'staging', ACC, { s: k === 0 ? pop(u, 0.6) : 1 }); grow(110, 80, 138, 80, k === 0 ? E(u, 0.3, 0.6) : 1, ACC);
      if (k === 0) { grow(270, 104, 240, 250, E(u, 1.2, 1.8), ACC); sub(640, 84, 'stagingKubeconfig · 다른 stack의 출력이어도 된다', fade(u, 1.6), { fill: INK, 'font-weight': 700, 'font-size': 15 }); } }
    if (k >= 1 && k <= 2) { card(620, 70, 220, 74, { rx: 8, stroke: GRID, s: k === 1 ? pop(u, 0.2) : 1 }); mono(520, 56, '~/.kube/config', { 'font-size': 13.5, fill: MUT });
      mono(530, 80, 'context: staging', { 'font-size': 14, fill: MUT }); mono(530, 104, 'context: prod-cluster', { 'font-size': 14, 'font-weight': 700, fill: k === 1 ? lerp(0, 1, fade(u, 0.8)) > 0.5 ? WARN : INK : WARN });
      chip(830, 160, 200, 'Provider', 'prod', WARN, { s: k === 1 ? pop(u, 1.2) : 1 }); grow(730, 100, 800, 136, k === 1 ? E(u, 1.0, 1.3) : 1, WARN);
      if (k === 1) sub(720, 300, '한 프로그램이 두 클러스터를 가리킨다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 2) { const p = E(u, 0.6, 1.6); chip(lerp(480, 720, p), lerp(140, 300, p), 230, 'Service', 'web-svc', WARN);
      pill(480, 180, '{ provider: prod }', WARN, pop(u, 0.2), { mono: true, fs: 14 }); sub(240, 300, '여기에는 만들어지지 않는다', fade(u, 1.8), { fill: MUT, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k <= 1) return;
    chip(720, 290, 230, 'Service', 'web-svc', WARN);
    if (k === 3) { R.card(720, 360, 240, 34, { rx: 17, stroke: WARN, dash: '5 4', text: 'LoadBalancer 주소 기다림', fs: 13.5, color: WARN });
      const g = card(330, 90, 300, 44, { rx: 22, stroke: INFO, dash: '5 4', fill: INFOBG, s: pop(u, 0.2) }); mono(0, 6, 'status.loadBalancer…  ?', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 }, g);
      grow(482, 90, 560, 90, E(u, 0.8, 1.2), INFO); mono(500, 74, '.apply', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.9) });
      card(760, 90, 340, 44, { rx: 22, stroke: INFO, dash: '5 4', text: 'http://${hostname}', fs: 14, mono: true, color: INFO, s: pop(u, 1.3) });
      sub(560, 150, 'export const url · 결과도 Output', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    // k4: up 이 주소를 채운다
    const rows = ['+ Stack k8s-app', '+ Provider staging', '+ Provider prod', '+ Deployment web', '+ Service web-svc'];
    rows.forEach((r, i) => mono(60, 50 + i * 26, r, { 'font-size': 14.5, fill: i === 4 && u < 1.6 ? WARN : GOOD, 'font-weight': 700, opacity: fade(u, 0.1 + i * 0.15) }));
    const open = E(u, 1.5, 2.0);
    card(720, 360, 300, 36, { rx: 18, stroke: open > 0.5 ? GOOD : WARN, dash: open > 0.5 ? null : '5 4', text: open > 0.5 ? 'a1b2c3.elb.ap-northeast-2.amazonaws.com' : 'LoadBalancer 주소 기다림', fs: 13.5, mono: open > 0.5, color: open > 0.5 ? GOOD : WARN });
    card(640, 110, 520, 44, { rx: 22, stroke: INFO, dash: open > 0.5 ? null : '5 4', fill: INFOBG }); mono(640, 116, open > 0.5 ? 'url: "http://a1b2c3.elb.ap-northeast-2.amazonaws.com"' : 'url: ?', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
    mono(60, 186, 'Resources: + 5 created', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) });
    sub(640, 170, '주소가 나올 때까지 기다렸다가 채운다 · 값은 예시', fade(u, 2.2), { fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'replicas에 "3" 처럼 문자열을 넣었을 때 YAML과 타입 코드의 차이는 무엇인가?',
      o: ['둘 다 작성할 때 바로 에러가 난다', 'YAML은 apply 해서야 알고, 타입 코드는 작성할 때 컴파일 에러가 난다', '타입 코드는 문자열을 숫자로 알아서 바꿔 준다'], a: 1,
      why: 'YAML은 그냥 글자라 클러스터에 보내야 거절당한다. 타입 코드는 replicas가 number라서 작성하는 자리에서 막힌다.' },
    { q: 'selector와 template.metadata.labels에 같은 appLabels 변수를 넣는 이유는 무엇인가?',
      o: ['두 값이 어긋나면 Deployment가 Pod를 못 잡기 때문이다', 'K8s가 변수를 따로 저장하기 때문이다', 'Service를 만들 때 반드시 필요하기 때문이다'], a: 0,
      why: 'selector는 같은 라벨을 가진 Pod를 찾는다. 한 변수를 쓰면 두 곳이 늘 같아서 이 실수가 사라진다.' },
    { q: '수백 줄짜리 cert-manager.yaml을 Pulumi로 관리하는 가장 알맞은 방법은 무엇인가?',
      o: ['한 줄씩 TypeScript로 옮긴다', 'ConfigFile로 파일 경로만 주고 그대로 로드한다', 'kubectl apply로 따로 적용하고 Pulumi는 모른 척한다'], a: 1,
      why: 'ConfigFile은 YAML을 고치지 않고 읽어 문서마다 리소스로 state에 넣는다. 검증된 서드파티 YAML을 다시 쓸 필요가 없다.' },
    { q: 'helm history와 helm rollback을 그대로 쓰고 싶다면 무엇을 써야 하나?',
      o: ['helm.v3.Chart', 'kustomize.Directory', 'helm.v3.Release'], a: 2,
      why: 'Release는 실제 helm 릴리스로 설치되어 helm list·history에 보인다. Chart는 템플릿을 렌더해 리소스로만 관리한다.' },
    { q: 'LoadBalancer Service의 외부 주소를 URL로 내보낼 때 apply를 쓰는 이유는 무엇인가?',
      o: ['주소가 배포 뒤에야 생기는 Output이라서', 'Service가 문자열을 돌려주지 않아서 영원히 못 읽기 때문에', 'kubectl이 없으면 주소를 읽을 수 없어서'], a: 0,
      why: 'hostname은 클라우드가 LoadBalancer를 만든 뒤에 정해진다. apply로 그 미래 값에 http://를 붙이고, up이 주소가 나올 때까지 기다려 채운다.' },
  ];
  const summary = [
    'YAML manifest는 오타나 타입 실수를 클러스터에 보내야 알지만, @pulumi/kubernetes 코드는 작성할 때 잡는다.',
    'Deployment와 Service를 클래스로 쓰고, 세 번 나오던 app: web 라벨은 변수 하나로 묶는다.',
    '검증된 YAML은 ConfigFile·ConfigGroup으로 그대로 로드하고, Helm 차트는 Chart나 Release로 배포한다.',
    'k8s.Provider로 클러스터를 고르고, LoadBalancer 주소는 Output이라 apply로 이어 쓴다.',
  ];
  const review = [
    { q: '팀이 cert-manager YAML을 그대로 두고 namespace만 prod로 바꾸고 싶어 한다. 알맞은 방법은?',
      o: ['YAML을 복사해 namespace를 고친다', 'ConfigGroup에 transformations를 주어 읽을 때 바꾼다', 'Helm Release로 다시 설치한다'], a: 1,
      why: 'transformations는 파싱한 객체를 가로채 값을 넣는다. 원본 파일을 고치거나 복제하지 않아도 된다.' },
    { q: 'Service를 만들었는데 staging 클러스터에 생겼다. 먼저 확인할 것은?',
      o: ['리소스 옵션에 { provider: prod }를 넘겼는지', 'replicas 값이 number 인지', 'Helm 차트 버전이 맞는지'], a: 0,
      why: '리소스가 어느 클러스터에 생길지는 옵션의 provider가 정한다. 빠지면 의도한 prod가 아닌 곳에 만들어질 수 있다.' },
    { q: 'up이 끝났는데 url 출력에 주소가 들어 있다. 이 값을 DNS 레코드 입력에 넣으면 생기는 일은?',
      o: ['DNS 레코드가 Service보다 먼저 만들어진다', 'Output은 다른 리소스에 넣을 수 없어 에러가 난다', '주소가 정해진 뒤에 DNS 레코드가 만들어지도록 순서가 생긴다'], a: 2,
      why: 'Output을 다른 리소스 입력에 넣으면 의존이 생긴다. 엔진은 LoadBalancer 주소가 나온 뒤에 DNS 레코드를 만든다.' },
  ];

  R.page({ title: 'manifest를 코드로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
