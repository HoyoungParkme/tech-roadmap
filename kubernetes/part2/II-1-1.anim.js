/* II-1-1 Deployment & ReplicaSet — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * Pod 목록·desired 는 각 beat 의 pods / desired 데이터에서 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  const ST = { running: [GOOD, GOODBG, 'Running'], spawning: [WARN, WARNBG, 'Creating'], dying: [BAD, BADBG, 'Terminating'], idle: [OFF, PANEL, ''] };
  // Pod 한 개: 이름 + 상태. o.s 크기, o.op 투명도
  function pod(cx, cy, id, st, o) { o = o || {}; const [col, bg, word] = ST[st] || ST.idle, w = o.w || 118, h = o.h || 56;
    const g = card(cx, cy, w, h, { rx: 10, stroke: col, fill: bg, sw: 2.2, dash: st === 'spawning' || st === 'idle' ? '6 4' : null, s: o.s, op: (o.op ?? 1) * (st === 'dying' ? 0.65 : 1) });
    if (id) mono(0, -3, id, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: st === 'dying' ? BAD : INK, 'text-decoration': st === 'dying' ? 'line-through' : null }, g);
    if (word) tx(0, 18, word, { 'font-size': 13.5, 'font-weight': 600, 'text-anchor': 'middle', fill: col }, g);
    return g; }
  // 쿠버네티스 객체 카드: 종류(굵게) + 이름(고정폭)
  function obj(cx, cy, w, kind, name, o) { o = o || {}; const g = card(cx, cy, w, o.h || 50, { rx: 10, stroke: o.col || INK, fill: o.fill || PANEL, sw: 2.4, dash: o.dash, s: o.s, op: o.op });
    tx(-w / 2 + 16, 6, kind, { 'font-size': 15.5, 'font-weight': 800, fill: o.col || INK }, g);
    if (name) mono(-w / 2 + 22 + tw(kind, 15.5) + 6, 6, name, { 'font-size': 14.5, fill: INK }, g); return g; }
  // desired · actual 저울
  function scale2(x, y, desired, actual, op) { op = op ?? 1; const ok = Math.round(desired) === Math.round(actual);
    tx(x, y - 30, 'desired', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
    mono(x, y + 6, String(Math.round(desired)), { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: op });
    tx(x + 150, y - 30, 'actual', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
    mono(x + 150, y + 6, String(Math.round(actual)), { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: ok ? GOOD : WARN, opacity: op });
    tx(x + 75, y + 2, ok ? '=' : '≠', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: ok ? GOOD : BAD, opacity: op }); }
  const running = (b) => (b.pods || []).filter((p) => p.state === 'running').length;
  const short = (id) => id.replace('web-7d9-', '');

  // ---------- 1. Deployment 생성 ----------
  const YAML = [
    ['apiVersion: apps/v1', 'kind: Deployment', 'metadata:', '  name: web'],
    ['spec:', '  replicas: 3   # 항상 3개'],
    ['  selector:', '    matchLabels:', '      app: web', '  template:', '    metadata:', '      labels:', '        app: web'],
    ['    spec:', '      containers:', '        - name: app', '          image: myapp:v1', '          ports:', '            - containerPort: 8080'],
  ];
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    // 왼쪽: 이 beat 의 yaml 줄 / 마지막 beat 는 터미널
    if (k < 4) { tx(36, 40, 'deployment.yaml', { 'font-size': 14, 'font-weight': 700, fill: MUT }); snippet(36, 56, YAML[k], { fs: 14.5, op: fade(u, 0.1, 0.5) }); }
    else terminal(36, 56, 360, 150, ['$ kubectl apply -f deployment.yaml', ['deployment.apps/web created', 'var(--term)']], E(u, 0.1, 0.9) * 2, { title: 'bash' });
    // 오른쪽: 객체 나무
    const X = 690;
    obj(X, 66, 360, 'Deployment', 'web', { col: INFO, s: k === 0 ? pop(u, 0.4) : 1 });
    const dsr = tween(p.desired, b.desired, u);
    if (k >= 1) { pill(X + 128, 66, 'replicas ' + Math.round(dsr), ACC, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 14 }); }
    if (k >= 2) { const s = k === 2 ? pop(u, 0.5) : 1;
      obj(X, 164, 360, 'ReplicaSet', null, { col: ACC, s });
      pill(X + 60, 164, 'selector app=web', ACC, s, { mono: true, fs: 13.5, fill: ACCBG });
      grow(X, 92, X, 138, k === 2 ? E(u, 0.2, 0.6) : 1, MUT); }
    // Pod 설계도 (template)
    if (k === 3) { const s = pop(u, 0.3);
      card(X, 290, 300, 110, { rx: 12, stroke: INFO, dash: '7 5', fill: INFOBG, sw: 2, s });
      tx(X - 132, 258, 'template = Pod 한 개의 설계도', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      mono(X - 132, 292, 'image  myapp:v1', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) });
      mono(X - 132, 320, 'port   8080', { 'font-size': 15, opacity: fade(u, 1.2) });
      pill(X + 92, 306, 'app=web', ACC, pop(u, 1.5), { mono: true, fs: 13.5 }); }
    if (k === 4) { const pods = b.pods;
      grow(X, 190, X, 240, E(u, 0.1, 0.5), MUT);
      pods.forEach((q, i) => { const cx = X - 135 + i * 135, s = pop(u, 0.5 + i * 0.35);
        grow(X, 240, cx, 256, E(u, 0.4 + i * 0.35, 0.7 + i * 0.35), GRID, { plain: true });
        pod(cx, 290, q.id, q.state, { s }); }); }
    if (k >= 1) scale2(130, 340, dsr, k === 4 ? Math.round(lerp(0, running(b), E(u, 0.6, 1.6))) : 0, k === 1 ? fade(u, 0.4) : 1);
    if (k === 4) sub(X, 400, '사용자가 만든 것은 Deployment 하나, 나머지는 컨트롤러가 만들었다', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 600 }); }

  // ---------- 2. 자동 복구 ----------
  const PX2 = { 'web-7d9-aa1': 220, 'web-7d9-aa2': 380, 'web-7d9-aa3': 540, 'web-7d9-bb4': 700 };
  // 조정 루프: 원 위를 도는 점
  function loop(cx, cy, r, spin, on) { el('circle', { cx, cy, r, fill: 'none', stroke: on ? ACC : GRID, 'stroke-width': 2.5, 'stroke-dasharray': '5 6' });
    [['관찰', -90], ['비교', 30], ['조치', 150]].forEach(([s, a]) => { const q = (a * Math.PI) / 180; tx(cx + Math.cos(q) * (r + 26), cy + Math.sin(q) * (r + 22) + 5, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? ACC : MUT }); });
    if (on) { const q = spin * Math.PI * 2 - Math.PI / 2; el('circle', { cx: cx + Math.cos(q) * r, cy: cy + Math.sin(q) * r, r: 7, fill: ACC }); }
    tx(cx, cy + 5, 'ReplicaSet', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT }); }
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    obj(460, 50, 600, 'ReplicaSet', 'web-7d9  ·  selector app=web', { col: ACC });
    b.pods.forEach((q) => { const x = PX2[q.id]; let st = q.state, op = 1, s = 1;
      if (k === 2 && q.id.endsWith('bb4')) s = pop(u, 1.1);
      pod(x, 150, short(q.id), st, { s, op }); });
    // k3: 사라지는 aa2
    if (k === 3) pod(PX2['web-7d9-aa2'], 150, 'aa2', 'dying', { op: 1 - fade(u, 0.2, 0.9) });
    if (k === 0) { // 라벨로 세기: 왼쪽부터 번호가 붙는다
      b.pods.forEach((q, i) => { const x = PX2[q.id]; dot([[x - 60, 196], [x + 60, 196]], seg(u, 0.2 + i * 0.5, 0.7 + i * 0.5), ACC, 5);
        card(x, 210, 34, 26, { rx: 13, fill: ACC, stroke: 'none', text: String(i + 1), fs: 14, mono: true, color: PANEL, s: pop(u, 0.6 + i * 0.5) }); });
      pill(780, 150, 'get pods -l app=web', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); }
    if (k === 1) { cross(PX2['web-7d9-aa2'] + 46, 128, 11, pop(u, 0.5));
      fly(800, 240, PX2['web-7d9-aa2'], 190, seg(u, 0.1, 0.6), 'kubectl delete pod aa2', { fill: BAD, mono: true }); }
    if (k === 2) { fly(460, 76, PX2['web-7d9-bb4'], 150, seg(u, 0.3, 1.1), 'template', { fill: INFO, mono: true }); }
    const act = k === 1 ? Math.round(lerp(3, 2, E(u, 0.5, 1))) : k === 3 ? Math.round(lerp(2, 3, E(u, 0.4, 1.2))) : running(b) - 0;
    scale2(160, 320, b.desired, k === 2 ? 2 : act);
    loop(720, 320, 58, (t * 0.6) % 1, k === 1 || k === 2);
    if (k === 3) { check(470, 318, 16, pop(u, 1.3)); sub(560, 400, '사람은 아무것도 하지 않았다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 2) sub(470, 400, '차이 1 → template 대로 새 Pod 하나', fade(u, 1.4), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); }

  // ---------- 3. scale 3 → 5 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    terminal(36, 30, 470, 96, ['$ kubectl scale deployment/web --replicas=5', ['deployment.apps/web scaled', 'var(--term)']], k === 0 ? E(u, 0.1, 1.0) * 2 : 2, { title: 'bash' });
    const dsr = k === 0 ? Math.round(lerp(3, 5, E(u, 1.0, 1.6))) : 5;
    scale2(640, 84, dsr, running(b) === 5 && k === 2 ? Math.round(lerp(3, 5, E(u, 0.3, 1.2))) : 3);
    obj(480, 176, 880, 'ReplicaSet', 'web-7d9   desired ' + dsr, { col: ACC, h: 44 });
    for (let i = 0; i < 5; i++) { const x = 140 + i * 170, q = b.pods[i];
      if (i >= 3) { const sl = k === 0 ? E(u, 1.2 + (i - 3) * 0.3, 1.6 + (i - 3) * 0.3) : 1; if (sl > 0) card(x, 270, 132, 70, { rx: 12, stroke: ACC, dash: '4 5', sw: 1.8, fill: 'none', op: sl }); }
      if (q) pod(x, 270, short(q.id), q.state, { s: k === 1 && i >= 3 ? pop(u, 0.9 + (i - 3) * 0.3) : 1 }); }
    if (k === 1) { banner(480, 360, 'desired 5 − actual 3 = 2 개 더', pop(u, 0.2)); }
    if (k === 2) { const s = pop(u, 1.4);
      pill(650, 370, '줄일 때는 보통 최근에 만든 Pod부터 지운다', WARN, s, { fs: 14 });
      grow(800, 352, 820, 306, E(u, 1.6, 2.0), WARN); } }

  // ---------- 4. selector 와 ownerReferences ----------
  const P5 = (b) => b.pods.map((q) => [short(q.id), q.state]);
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const rsY = 160, pods = P5(b);
    if (k >= 1) { obj(300, 50, 300, 'Deployment', 'web', { col: INFO, s: k === 1 ? pop(u, 0.2) : 1 });
      const g = k === 1 ? E(u, 0.6, 1.3) : 1;   // ownerReferences: 자식 → 부모
      grow(300, rsY - 25, 300, 77, g, INFO, { dash: '6 4' });
      if (k === 1) tx(316, 112, 'ownerReferences', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.1), class: 'mono' }); }
    const rsS = k === 0 ? pop(u, 0.2) : 1;
    obj(300, rsY, 420, 'ReplicaSet', 'web-7d9f8c5b', { col: ACC, s: rsS });
    if (k === 0) { el('line', { x1: 260, y1: rsY + 30, x2: 470, y2: rsY + 30, stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.9) });
      tx(380, rsY + 56, '↑ Deployment template의 해시', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.1), 'text-anchor': 'middle' }); }
    // Pod 들 (아래 줄)
    pods.forEach(([id, st], i) => { const x = 110 + i * 130, y = 320, counted = k >= 2;
      pod(x, y, id, st, { w: 112, s: k === 0 ? pop(u, 0.4 + i * 0.1) : 1 });
      if (k >= 1 && k !== 3) grow(x, y - 30, 300 + (x - 300) * 0.25, rsY + 26, k === 1 ? E(u, 0.9 + i * 0.1, 1.4 + i * 0.1) : 1, GRID, { plain: true, dash: '4 4' });
      if (k >= 2) { const sel = k === 2 ? pop(u, 0.4 + i * 0.25) : 1; pill(x, y + 50, 'app=web', ACC, sel, { mono: true, fs: 13.5, fill: counted ? ACCBG : PANEL }); } });
    if (k === 2) { // 다른 라벨의 Pod 는 세지 않는다
      pod(800, 320, 'api-1', 'running', { w: 112, op: 0.55 }); pill(800, 370, 'app=api', MUT, pop(u, 1.0), { mono: true, fs: 13.5 });
      card(790, 160, 250, 92, { rx: 12, stroke: ACC, sw: 2, fill: ACCBG, s: pop(u, 1.6) });
      tx(680, 150, 'app=web 개수', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); mono(880, 152, '5', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      tx(680, 184, 'spec.replicas', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); mono(880, 186, '5', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }
    if (k === 3) { // template 라벨이 selector 와 다르면 API 가 거부
      card(750, 168, 330, 128, { rx: 12, stroke: BAD, fill: BADBG, sw: 2.2, s: pop(u, 0.3) });
      mono(600, 136, 'selector  app=web', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      mono(600, 162, 'template  app=webb', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      mono(600, 192, 'selector does not match', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.4) });
      mono(600, 212, 'template labels', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.4) });
      banner(750, 256, 'apps/v1 API 서버가 생성 거부', pop(u, 1.8)); }
    if (k === 4) { // 컨트롤 루프 세 줄
      snippet(600, 112, ['while True:', '  actual = count(app=web)', '  if actual < desired: create', '  elif actual > desired: delete'], { fs: 14 });
      const a = tween(p.pods ? running(p) : 5, running(b), u);
      mono(620, 262, `actual ${Math.round(a)} / desired ${b.desired}`, { 'font-size': 17, 'font-weight': 800, fill: running(b) < b.desired ? WARN : GOOD });
      fly(300, rsY + 20, 630, 300, seg(u, 0.9, 1.7), 'create_pod(template)', { fill: INFO, mono: true }); } }

  // ---------- 5. 책임 분리 ----------
  function column(cx, title, col, items, from, u, on) { card(cx, 58, 380, 46, { rx: 10, stroke: col, fill: col === INFO ? INFOBG : ACCBG, sw: 2.4, s: on ? pop(u, from) : 1 });
    tx(cx, 64, title, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: on ? fade(u, from + 0.1) : 1 });
    items.forEach((s, i) => { const y = 116 + i * 40, sc = on ? pop(u, from + 0.4 + i * 0.25) : 1; card(cx, y, 340, 32, { rx: 8, stroke: GRID, sw: 1.5, s: sc, text: s, fs: 14, fw: 600 }); }); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    column(250, 'Deployment = 버전', INFO, ['image v1 → v2 교체 (rollout)', 'rollback · 히스토리', 'pause / resume', 'strategy RollingUpdate · Recreate'], 0.2, u, k === 0);
    if (k >= 1) column(710, 'ReplicaSet = 갯수', ACC, ['replicas N 개 유지', 'Pod 죽으면 즉시 재생성', 'selector로 라벨 매칭', 'Deployment가 자동 생성·관리'], 0.2, u, k === 1);
    // 아래: 지금 돌고 있는 Pod 5개
    if (k <= 1) b.pods.forEach((q, i) => pod(230 + i * 125, 340, short(q.id), q.state, { w: 108, h: 50, s: k === 0 ? pop(u, 1.4 + i * 0.12) : 1 }));
    if (k === 2) { ['kubectl apply -f deployment.yaml', 'kubectl scale deployment/web', 'kubectl rollout undo deployment/web'].forEach((s, i) => {
        const y = 300 + i * 40; pill(250, y, s, INFO, pop(u, 0.2 + i * 0.35), { mono: true, fs: 13.5 });
        grow(80, y, 80, 82, E(u, 0.6 + i * 0.35, 1.1 + i * 0.35), INFO, { plain: i > 0 }); });
      sub(710, 330, '세 명령의 대상은 모두 deployment', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { pill(710, 300, 'kubectl get rs  (읽기만)', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      const s = pop(u, 0.8); pill(710, 350, 'RS replicas 직접 2로', BAD, s, { fs: 13.5 }); cross(570, 350, 10, s);
      grow(570, 350, 340, 262, E(u, 1.3, 1.9), INFO, { dash: '6 5' });
      tx(60, 330, 'Deployment가 다시 5로 맞춘다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.7) }); }
    if (k === 4) { // 다음 장 맛보기: 옛 RS 줄고 새 RS 늘고
      const g = E(u, 0.3, 2.3), v1 = Math.round(lerp(5, 0, g)), v2 = Math.round(lerp(0, 5, g));
      [['RS v1', v1, OFF], ['RS v2', v2, ACC]].forEach(([n, v, col], i) => { const y = 300 + i * 50;
        tx(150, y + 6, n, { 'font-size': 15, 'font-weight': 700 });
        for (let j = 0; j < 5; j++) el('rect', { x: 230 + j * 52, y: y - 14, width: 44, height: 28, rx: 6, fill: j < v ? col : 'none', stroke: col === OFF ? MUT : ACC, 'stroke-width': 1.6, 'stroke-dasharray': j < v ? null : '3 4' });
        mono(510, y + 6, String(v), { 'font-size': 18, 'font-weight': 800, fill: col === OFF ? MUT : ACC }); });
      sub(720, 330, '다음 장: 갯수 5는 그대로, 버전만 교체', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'replicas: 3인 Deployment를 apply하면 사용자가 직접 만든 객체는 몇 종류인가?',
      o: ['Deployment·ReplicaSet·Pod 세 종류', 'Deployment 한 종류', 'Pod 한 종류'], a: 1,
      why: '사용자는 Deployment 파일 하나만 apply한다. ReplicaSet과 Pod 3개는 컨트롤러가 연쇄로 만든다.' },
    { q: 'Pod 하나를 kubectl delete pod로 지운 뒤 새 Pod가 뜨는 이유는 무엇인가?',
      o: ['kubelet이 같은 컨테이너를 다시 시작해서', 'Deployment 파일이 자동으로 다시 apply되어서', 'ReplicaSet이 desired 3과 actual 2의 차이를 보고 template대로 하나를 만들어서'], a: 2,
      why: '조정 루프는 세고, 비교하고, 모자라면 만든다. actual이 2로 떨어지자 새 Pod bb4가 생겼다.' },
    { q: 'replicas를 3에서 5로 올리면 기존 Pod 3개는 어떻게 되는가?',
      o: ['그대로 두고 2개만 새로 만든다', '모두 지우고 5개를 새로 만든다', '재시작한 뒤 2개를 더한다'], a: 0,
      why: 'ReplicaSet은 5 − 3 = 2만큼만 채운다. 기존 aa1~aa3은 건드리지 않는다.' },
    { q: 'ReplicaSet이 자기 Pod를 셀 때 쓰는 기준은 무엇인가?',
      o: ['Pod 이름의 접두어 web-', 'selector에 맞는 라벨(app=web)', 'Pod가 떠 있는 노드'], a: 1,
      why: 'selector app=web에 맞는 Pod를 센다. 그래서 template 라벨이 selector와 어긋난 매니페스트는 API가 거부한다.' },
    { q: 'Deployment가 맡고 ReplicaSet은 맡지 않는 일은 무엇인가?',
      o: ['Pod가 죽으면 다시 만들기', 'replicas 개수 유지', 'image v1 → v2 교체와 rollback'], a: 2,
      why: '버전 교체·히스토리·rollback은 Deployment 몫이다. 개수 유지와 재생성은 ReplicaSet이 한다.' },
  ];

  const summary = [
    '사용자는 Deployment 파일 하나만 apply하고, ReplicaSet과 Pod는 컨트롤러가 만든다.',
    'ReplicaSet은 app=web 라벨로 Pod를 세어 desired와 다르면 만들거나 지운다.',
    'Pod 하나가 지워지면 사람이 없어도 template대로 새 Pod가 뜬다.',
    '개수는 ReplicaSet, 버전 교체와 rollback은 Deployment가 맡는다.',
  ];
  const review = [
    { q: '급하게 kubectl scale rs/web-7d9f8c5b --replicas=8을 쳤는데 잠시 뒤 다시 5개가 되었다. 이유로 가장 맞는 것은?',
      o: ['ReplicaSet이 Pod 8개를 만들 자원이 없어서', 'ReplicaSet의 replicas는 Deployment가 관리해서 다시 5로 맞춰서', 'HPA가 자동으로 줄여서'], a: 1,
      why: 'Deployment가 만든 ReplicaSet의 개수는 Deployment의 replicas를 따른다. 개수를 바꾸려면 deployment를 scale해야 한다.' },
    { q: '노드 장애로 Pod 2개가 사라졌다. 사람이 아무것도 안 했을 때 일어나는 일은?',
      o: ['ReplicaSet이 actual 3을 보고 template대로 2개를 새로 만든다', 'Deployment가 새 revision을 만들어 다시 배포한다', 'Pod 수가 3으로 줄어든 채 유지된다'], a: 0,
      why: '조정 루프는 desired 5와 actual 3의 차이 2를 채운다. 버전이 바뀐 것이 아니므로 새 revision은 생기지 않는다.' },
    { q: '두 팀이 같은 네임스페이스에서 둘 다 selector app=web인 Deployment를 만들었다. 먼저 걱정할 일은?',
      o: ['Pod 이름이 겹쳐 생성이 실패한다', '라벨 문자열이 너무 짧다', '두 컨트롤러가 같은 Pod를 두고 충돌해 개수가 예상과 다르게 움직인다'], a: 2,
      why: 'ReplicaSet은 라벨이 맞으면 누가 만든 Pod든 센다. 공식 문서도 selector가 겹치는 컨트롤러는 서로 충돌할 수 있다고 경고한다.' },
  ];

  R.page({ title: 'Deployment → ReplicaSet → Pod', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
