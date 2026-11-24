/* I-1-2 Pod와 Container의 관계 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // Pod = 도시락통: 둥근 통 + 위 손잡이 + 이름표
  function pod(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: x + w / 2 - 40, y: y - 12, width: 80, height: 18, rx: 9, fill: 'none', stroke: o.stroke || INFO, 'stroke-width': 3, opacity: op });
    el('rect', { x, y, width: w, height: h, rx: 20, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 3, 'stroke-dasharray': o.dash, opacity: op });
    if (name) mono(x + 18, y + 28, name, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INFO, opacity: op }); }
  // 컨테이너(반찬 칸): 이름 + 이미지, lamp: 'run' | 'wait' | 'dead' | null
  const COL = { app: [ACC, ACCBG], ship: [WARN, WARNBG], init: [MUT, SOFT] };
  function box(cx, cy, name, image, kind, o) { o = o || {}; const [st, bg] = COL[kind] || COL.app, w = o.w || 170, h = o.h || 74, g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: o.dead ? SOFT : bg, stroke: o.dead ? BAD : st, 'stroke-width': 2.5, 'stroke-dasharray': o.ghost ? '6 5' : null }, g);
    tx(-w / 2 + 14, -6, name, { 'font-size': 16, 'font-weight': 800, fill: o.dead ? BAD : INK }, g);
    if (image) mono(-w / 2 + 14, 18, image, { 'font-size': 13.5, fill: MUT }, g);
    if (o.lamp) el('circle', { cx: w / 2 - 16, cy: -h / 2 + 16, r: 7, fill: o.lamp === 'run' ? GOOD : o.lamp === 'dead' ? BAD : OFF }, g);
    return g; }
  // 포트 꼭지
  function port(x, y, s, col, op) { card(x, y, tw(s, 13.5) + 18, 26, { rx: 6, text: s, fs: 13.5, mono: true, stroke: col || INK, color: col || INK, fill: PANEL, op }); }

  // 1. 컨테이너 1개짜리 Pod
  function s1(t, c) { const { k, u } = c;
    const g = k === 0 ? E(u, 0.2, 1.0) : 1;
    pod(480 - 230 * g, 70, 460 * g, 250, g > 0.6 ? 'Pod web' : null, { op: g });
    if (k === 0) { pill(640, 98, 'app: web', INFO, pop(u, 1.2), { mono: true, fs: 13.5 }); sub(480, 210, '아직 컨테이너 없음', fade(u, 1.6), { 'font-size': 15 }); }
    else pill(640, 98, 'app: web', INFO, 1, { mono: true, fs: 13.5 });
    if (k >= 1) { const d = k === 1 ? E(u, 0.2, 1.1) : 1;
      box(480, lerp(60, 200, d), 'app', 'myapp:v1', 'app', { op: k === 1 ? fade(u, 0.2) : 1, lamp: k === 2 ? (u > 1.4 ? 'run' : 'wait') : null });
      if (d > 0.95) port(565 + 30, 200, ':80', ACC, k === 1 ? fade(u, 1.3) : 1); }
    if (k === 2) { const X = [250, 380, 500, 640], H = ['NAME', 'READY', 'STATUS', 'RESTARTS'], V = ['web', u > 1.4 ? '1/1' : '0/1', u > 1.4 ? 'Running' : 'ContainerCreating', '0'];
      el('rect', { x: 200, y: 342, width: 560, height: 66, rx: 8, fill: SOFT, opacity: fade(u, 0.2) });
      H.forEach((h, i) => { mono(X[i], 366, h, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) }); mono(X[i], 394, V[i], { 'font-size': 15, 'font-weight': 700, fill: i === 1 || i === 2 ? (u > 1.4 ? GOOD : WARN) : INK, opacity: fade(u, 0.4) }); });
      el('rect', { x: X[1] - 6, y: 376, width: 52, height: 26, rx: 5, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.6) });
      sub(855, 383, '컨테이너 1개 중 1개 준비', fade(u, 1.9), { 'font-weight': 700, fill: GOOD }); } }

  // 2. 사이드카
  function s2(t, c) { const { k, u } = c;
    pod(150, 70, 660, 250, 'Pod web-with-logger');
    mono(370, 128, 'containers[0]', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    mono(600, 128, 'containers[1]', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1) : 1 });
    const crash = k === 2 && u > 0.5 && u < 1.6;
    box(370, 200, 'app', 'myapp:v1', 'app', { lamp: crash ? 'dead' : 'run', dead: crash, s: k === 0 ? 1 + R.bump(u, 0.2) : 1 });
    if (k === 0) { el('rect', { x: 515, y: 163, width: 170, height: 74, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1) }); sub(600, 206, '빈 자리', fade(u, 1.2)); }
    if (k >= 1) { const a = k === 1 ? E(u, 0.2, 1.2) : 1; box(lerp(900, 600, a), 200, 'log-shipper', 'fluentd:latest', 'ship', { lamp: 'run' });
      if (k === 1) mono(480, 290, '컨테이너 ' + (u < 1.2 ? 1 : 2) + '개 · Pod 1개', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO }); }
    if (k === 2) { if (u > 0.5) cross(440, 175, 10, pop(u, 0.5));
      if (u > 1.6) mono(370, 272, '↻ 재시작 · RESTARTS 1', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(600, 272, '계속 실행', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      ['logging', 'proxy', 'sync'].forEach((s, i) => pill(330 + i * 150, 372, s, WARN, pop(u, 2.0 + i * 0.15), { mono: true, fs: 14 }));
      sub(480, 408, '늘 함께 떠 있어야 하는 짝', fade(u, 2.3), { 'font-weight': 700 }); } }

  // 3. init 컨테이너: 시간 막대
  function s3(t, c) { const { k, u } = c, X0 = 210, XI = 520, X1 = 900;
    el('line', { x1: X0, y1: 330, x2: X1, y2: 330, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' }); tx(X1, 354, '시간', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    const rows = [['wait-db', 'busybox:1.36', 90, 'init'], ['app', 'myapp:v1', 190, 'app'], ['log-shipper', 'fluentd:latest', 260, 'ship']];
    rows.forEach(([n, im, y, kd], i) => { const col = COL[kd][0]; tx(30, y + 4, n, { 'font-size': 15.5, 'font-weight': 800, fill: i === 0 ? MUT : INK }); mono(30, y + 24, im, { 'font-size': 13.5, fill: MUT }); });
    if (k === 0 || k >= 1) { const g = k === 0 ? E(u, 0.2, 2.2) : 1, xe = lerp(X0, XI, g);
      el('rect', { x: X0, y: 74, width: xe - X0, height: 32, rx: 6, fill: SOFT, stroke: MUT, 'stroke-width': 2 });
      for (let i = 0; i < 5; i++) { const xx = X0 + 30 + i * 62; if (xx > xe - 10) break; const ok = i === 4;
        if (ok) check(xx, 90, 8); else cross(xx, 90, 6); }
      if (k === 0) mono(X0 + 4, 60, 'until nc -z db 5432; do sleep 2; done', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) });
      if (g > 0.98) mono(XI + 10, 96, 'Exit 0', { 'font-size': 14, 'font-weight': 800, fill: GOOD }); }
    if (k >= 1) { const g = k === 1 ? E(u, 0.9, 2.4) : 1;
      [190, 260].forEach((y, i) => { el('rect', { x: X0, y: y - 16, width: XI - X0, height: 32, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
        mono((X0 + XI) / 2, y + 5, '대기', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
        if (g > 0) el('rect', { x: XI, y: y - 16, width: (X1 - 30 - XI) * g, height: 32, rx: 6, fill: COL[i ? 'ship' : 'app'][1], stroke: COL[i ? 'ship' : 'app'][0], 'stroke-width': 2 }); });
      el('line', { x1: XI, y1: 60, x2: XI, y2: 320, stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: k === 1 ? fade(u, 0.3) : 1 });
      if (k === 1) tx(XI + 8, 140, 'init 성공 뒤에야 시작', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
      if (k === 1) sub(560, 395, 'init이 실패하면 메인 두 개는 뜨지 않는다', fade(u, 2.2), { 'font-weight': 700, fill: BAD, 'font-size': 14.5 }); }
    if (k === 2) [['Terminated · Exit 0', MUT, 90], ['Running', GOOD, 190], ['Running', GOOD, 260]].forEach(([s, col, y], i) => {
      pill(730, y, s, col, pop(u, 0.3 + i * 0.4), { fs: 14 }); });
    if (k === 2) sub(560, 395, 'kubectl describe pod web-with-init', fade(u, 1.6), { class: 'mono' }); }

  // 4. emptyDir 공유
  function s4(t, c) { const { k, u } = c, A = [220, 115], S = [560, 115], V = [390, 255];
    pod(40, 40, 700, 300, 'Pod web-shared-vol');
    box(A[0], A[1], 'app', 'myapp:v1', 'app', { lamp: 'run' }); box(S[0], S[1], 'log-shipper', 'fluentd:latest', 'ship', { lamp: 'run' });
    const vs = k === 0 ? pop(u, 0.3) : 1;
    dbIcon(V[0], V[1], 'logs (emptyDir)', { s: vs * 0.8, stroke: WARN, fill: WARNBG });
    if (k === 0) sub(V[0], 330, 'Pod가 사는 동안만 있는 빈 디렉터리', fade(u, 1.2), { 'font-weight': 700 });
    if (k >= 1) { grow(A[0], A[1] + 38, V[0] - 30, V[1] - 22, k === 1 ? E(u, 0.2, 0.9) : 1, ACC, { plain: true, sw: 3 });
      mono(A[0] - 64, 210, '/var/log/app', { 'font-size': 13.5, fill: ACC, opacity: k === 1 ? fade(u, 0.8) : 1 }); }
    if (k >= 2) { grow(S[0], S[1] + 38, V[0] + 30, V[1] - 22, k === 2 ? E(u, 0.2, 0.9) : 1, WARN, { plain: true, sw: 3 });
      mono(S[0] - 30, 210, '/var/log/app', { 'font-size': 13.5, fill: WARN, opacity: k === 2 ? fade(u, 0.8) : 1 }); }
    // access.log 파일
    if (k >= 1) { const n = k === 1 ? Math.floor(lerp(0, 4, E(u, 0.6, 2.4))) : 4;
      el('rect', { x: 790, y: 60, width: 150, height: 130, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 2 }); mono(802, 82, 'access.log', { 'font-size': 13.5, 'font-weight': 700 });
      for (let i = 0; i < n; i++) el('rect', { x: 802, y: 96 + i * 20, width: 90 + (i * 23) % 36, height: 8, rx: 3, fill: ACC, opacity: 0.6 });
      if (k === 1) for (let i = 0; i < 3; i++) dot([[A[0], A[1] + 38], [V[0] - 30, V[1] - 22]], seg(u, 0.6 + i * 0.6, 1.2 + i * 0.6), ACC, 5);
      if (k === 2) el('rect', { x: 786, y: 56, width: 158, height: 138, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1) }); }
    if (k === 2) sub(560, 330, '같은 볼륨, 같은 경로', fade(u, 1.2), { 'font-weight': 700, fill: WARN });
    if (k === 3) { dbIcon(865, 300, 'Elasticsearch', { s: 0.7 });
      for (let i = 0; i < 6; i++) { const ph = (t * 0.55 + i / 6) % 1;
        dot([[A[0], A[1] + 38], [V[0] - 30, V[1] - 22], [V[0] + 30, V[1] - 22], [S[0], S[1] + 38], [S[0] + 85, S[1]], [800, 290]], ph, i % 2 ? WARN : ACC, 5); }
      card(560, 375, 330, 44, { rx: 22, stroke: GOOD, sw: 2, s: pop(u, 0.4) });
      tx(410, 382, '컨테이너 사이 네트워크 호출', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) }); mono(700, 383, '0회', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.5) }); } }

  // 5. 같은 네트워크 네임스페이스
  function s5(t, c) { const { k, u } = c, A = [190, 165], S = [470, 165], BUS = 262;
    if (k < 4) pod(40, 60, 580, 280, 'Pod web-shared-vol'); else pod(40, 60, 580, 280, 'Pod web-shared-vol', { op: 0.35 });
    pill(500, 88, 'IP 10.244.1.7', INFO, k === 0 ? pop(u, 0.3) : 1, { mono: true, fs: 14 });
    box(A[0], A[1], 'app', null, 'app', { lamp: 'run', w: 150, h: 62 }); box(S[0], S[1], 'log-shipper', null, 'ship', { lamp: 'run', w: 150, h: 62 });
    port(A[0], 214, ':80', ACC); port(S[0], 214, ':24220', WARN);
    const bg = k === 0 ? E(u, 0.8, 1.8) : 1;
    el('line', { x1: 90, y1: BUS, x2: 90 + 480 * bg, y2: BUS, stroke: INFO, 'stroke-width': 4, 'stroke-linecap': 'round' });
    [A[0], S[0]].forEach((x) => el('line', { x1: x, y1: 227, x2: x, y2: BUS, stroke: INFO, 'stroke-width': 2.5, opacity: bg }));
    mono(330, 290, 'localhost (한 네트워크 네임스페이스)', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.6) : 1 });
    if (k === 0) sub(330, 320, 'READY 2/2 · IP는 1개', fade(u, 2), { 'font-weight': 700 });
    const go = (from, to, a, b, col) => dot([[from, 227], [from, BUS], [to, BUS], [to, 227]], seg(u, a, b), col, 7);
    if (k === 1) { go(A[0], S[0], 0.3, 1.3, ACC); pill(330, 320, 'curl localhost:24220', ACC, pop(u, 0.2), { mono: true, fs: 14 }); go(S[0], A[0], 1.5, 2.5, WARN); }
    if (k === 2) { go(S[0], A[0], 0.3, 1.3, WARN); pill(330, 320, 'curl localhost:80', WARN, pop(u, 0.2), { mono: true, fs: 14 });
      const op = fade(u, 1.5); card(800, 165, 240, 82, { rx: 10, stroke: BAD, sw: 2, dash: '6 5', op });
      tx(696, 158, '둘 다 :80을 열면?', { 'font-size': 15, 'font-weight': 700, opacity: op }); tx(696, 184, '포트 공간이 하나라 충돌', { 'font-size': 14, fill: BAD, opacity: op }); }
    if (k === 3) { el('rect', { x: 700, y: 120, width: 220, height: 170, rx: 20, fill: SOFT, stroke: MUT, 'stroke-width': 2.5, opacity: fade(u, 0.1) });
      mono(716, 148, '다른 Pod', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.1) });
      const a = seg(u, 0.4, 1.2); if (a > 0 && a < 1) dot([[740, 200], [700 - 30 * Math.sin(a * Math.PI), 200]], a, BAD, 7);
      if (u > 1.2) { cross(740, 200, 10, pop(u, 1.2)); mono(810, 206, 'localhost:80', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle' }); mono(810, 228, 'Failed to connect', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); }
      dot([[740, 262], [620, 262], [A[0] + 76, A[1]]], seg(u, 1.6, 2.5), GOOD, 7);
      mono(810, 268, 'Pod IP / Service', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 4) [['같은 IP', '네트워크 네임스페이스 하나'], ['같은 볼륨', 'emptyDir 함께 마운트'], ['같은 라이프사이클', '함께 배치, 함께 삭제']].forEach(([a, b], i) => {
      const y = 110 + i * 92, s = pop(u, 0.3 + i * 0.4); card(800, y, 250, 72, { rx: 12, stroke: INFO, sw: 2.5, s });
      tx(690, y - 4, a, { 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) }); tx(690, y + 20, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); }); }

  const quiz = [
    { q: 'kubectl get pod에서 READY 1/1이 뜻하는 것은 무엇인가?',
      o: ['노드 1대 중 1대에 배치됐다', 'Pod 안 컨테이너 1개 중 1개가 준비됐다', 'Pod가 1번 재시작됐다'], a: 1,
      why: 'READY는 Pod 안 컨테이너 수 기준이다. 사이드카를 붙이면 2/2가 된다.' },
    { q: '한 Pod 안에서 app 컨테이너가 죽으면 옆의 log-shipper는 어떻게 되나?',
      o: ['계속 실행되고, 죽은 app만 다시 시작된다', '함께 종료된 뒤 Pod째로 새로 만들어진다', 'Pod가 다른 노드로 옮겨진다'], a: 0,
      why: '재시작은 컨테이너 단위다. 두 컨테이너가 함께하는 것은 같은 노드 배치와 Pod 삭제다.' },
    { q: 'initContainers의 wait-db가 끝나지 않으면 app과 log-shipper는 어떻게 되나?',
      o: ['먼저 떠서 DB를 기다린다', 'log-shipper만 먼저 뜬다', '둘 다 시작하지 않고 기다린다'], a: 2,
      why: 'init 컨테이너는 순서대로 실행되고 모두 성공해야 메인 컨테이너가 시작된다.' },
    { q: 'app이 /var/log/app에 쓴 access.log를 log-shipper가 읽을 수 있는 이유는 무엇인가?',
      o: ['같은 Pod의 logs(emptyDir) 볼륨을 두 컨테이너가 같은 경로에 마운트했기 때문이다', '컨테이너끼리는 파일 시스템을 원래 공유하기 때문이다', 'log-shipper가 HTTP로 파일을 받아 오기 때문이다'], a: 0,
      why: '컨테이너 파일 시스템은 따로다. Pod 수준 볼륨을 둘 다 마운트해야 같은 파일을 본다.' },
    { q: '다른 Pod에서 curl localhost:80을 부르면 app에 닿지 않는 이유는 무엇인가?',
      o: ['80 포트가 막혀 있어서', 'localhost는 자기 Pod의 네트워크 네임스페이스 안만 가리켜서', 'Service가 아직 없어서 DNS가 실패해서'], a: 1,
      why: 'Pod마다 네트워크 네임스페이스가 하나씩이다. 밖에서는 Pod IP(10.244.1.7)나 Service로 불러야 한다.' },
  ];

  const summary = [
    'Kubernetes는 컨테이너를 직접 배치하지 않고 Pod 단위로 배치하고 관리한다.',
    '사이드카는 같은 Pod에 넣지만 재시작은 컨테이너마다 따로 일어난다.',
    'init 컨테이너가 모두 성공해야 메인 컨테이너가 시작된다.',
    '한 Pod 안 컨테이너는 IP 하나와 볼륨을 나눠 쓰고 서로 localhost로 부른다.',
  ];
  const review = [
    { q: 'log-shipper가 앱 로그를 못 읽는다. 매니페스트를 보니 app만 logs 볼륨을 마운트했다. 먼저 고칠 것은?',
      o: ['log-shipper에도 같은 logs 볼륨을 같은 경로로 마운트한다', 'log-shipper를 initContainers로 옮긴다', 'log-shipper에 Service를 붙인다'], a: 0,
      why: '컨테이너 파일 시스템은 따로라 볼륨을 함께 마운트해야 한다. 볼륨만 맞추면 네트워크 호출 없이 파일로 넘어간다.' },
    { q: 'envoy 사이드카를 붙였더니 envoy가 address already in use로 계속 죽는다. app과 envoy가 둘 다 80을 연다면 원인은?',
      o: ['init 컨테이너가 먼저 실패해서', 'envoy 이미지가 너무 커서', '한 Pod는 포트 공간이 하나라 같은 포트를 둘이 못 쓴다'], a: 2,
      why: '같은 네트워크 네임스페이스라 localhost로 서로 부를 수 있는 대신 포트가 겹치면 안 된다.' },
    { q: 'DB가 늦게 떠서 app이 시작 직후 계속 죽는다. 이 장에서 본 방법 중 맞는 것은?',
      o: ['DB를 app과 같은 Pod의 사이드카로 넣는다', 'wait-db 같은 init 컨테이너로 DB 포트가 열릴 때까지 기다린다', 'emptyDir로 DB 파일을 공유한다'], a: 1,
      why: 'init 컨테이너가 성공해야 메인이 뜬다. nc -z db 5432가 통할 때까지 기다리게 하면 순서가 보장된다.' },
  ];

  R.page({ title: 'Pod 속 컨테이너', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
