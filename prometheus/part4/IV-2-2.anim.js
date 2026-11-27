/* IV-2-2 Kubernetes SD — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 파드 5개(이름·네임스페이스·scrape·포트)는 예전 패널의 DISCOVERED 데이터, 파드 IP 는 예시 값.
 * 주소 조립 regex 결과는 파이썬 re.fullmatch(RE2 완전 일치와 같은 규칙)로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, clock, spans, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, k0, a) => (c.k > k0 ? 1 : c.k === k0 ? pop(c.u, a ?? 0.2) : 0);
  const fa = (c, k0, a) => (c.k > k0 ? 1 : c.k === k0 ? fade(c.u, a ?? 0.2) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const PODS = [['payment-api-7c9f-aa', 'payment', 1, '8080', '10.244.1.7'], ['payment-api-7c9f-bb', 'payment', 1, '8080', '10.244.1.8'],
    ['redis-cache-55d-x1', 'payment', 0, '6379', '10.244.2.3'], ['order-api-9ab-c2', 'order', 1, '9090', '10.244.2.9'], ['batch-job-3ff-zz', 'order', 0, '—', '10.244.3.4']];
  const apiBox = (cx, cy, s) => card(cx, cy, 170, 56, { rx: 10, text: 'kube-apiserver', fs: 15, mono: true, fw: 800, stroke: INFO, fill: INFOBG, color: INFO, s });
  const podCard = (cx, cy, name, o) => { o = o || {}; card(cx, cy, o.w || 190, o.h || 34, { rx: 17, text: name, fs: 13.5, mono: true, fw: 700, stroke: o.stroke || GRID, fill: o.fill, color: o.color, s: o.s ?? 1, op: o.op, dash: o.dash, sw: o.sw }); };

  // ---------- 1. kubernetes_sd_configs · role ----------
  const N1 = [[595, 130, 0], [595, 180, 1], [595, 230, 2]], N2 = [[825, 130, 3], [825, 180, 4]];
  function s1(t, c) { const { k, u } = c;
    server(90, 190, 'Prometheus', { lamp: k >= 1 ? ACC : OFF });
    apiBox(300, 190, at(c, 0, 0.4));
    zone(480, 30, 460, 370, '클러스터', { stroke: GRID, sw: 1.5 });
    zone(495, 70, 210, 200, 'node-1', { fill: PANEL, stroke: GRID, sw: 1.2 }); zone(725, 70, 205, 200, 'node-2', { fill: PANEL, stroke: GRID, sw: 1.2 });
    const role = k === 3 ? ['service', 'endpoints', 'node', 'ingress'][Math.min(3, Math.floor(seg(u, 0.2, 2.6) * 4))] : k === 2 || k === 4 || k === 5 ? 'pod' : null;
    [...N1, ...N2].forEach(([x, y, i]) => { const p = PODS[i], hot = role === 'pod' || (role === 'endpoints' && (i === 0 || i === 1));
      const s = k === 2 ? pop(u, 0.5 + i * 0.25) : 1;
      podCard(x, y, p[0], { w: 196, stroke: hot ? ACC : GRID, sw: hot ? 2.6 : 1.5, color: hot ? ACC : INK, s: hot && k === 2 ? 0.8 + 0.2 * s : 1 }); });
    card(600, 330, 200, 46, { rx: 8, text: 'svc payment-api', fs: 14, mono: true, fw: 700, stroke: role === 'service' ? ACC : GRID, sw: role === 'service' ? 2.6 : 1.5, color: role === 'service' ? ACC : INK });
    card(830, 330, 170, 46, { rx: 8, text: 'ingress shop', fs: 14, mono: true, fw: 700, stroke: role === 'ingress' ? ACC : GRID, sw: role === 'ingress' ? 2.6 : 1.5, color: role === 'ingress' ? ACC : INK });
    if (role === 'node') { [[600, 70, 210, 200], [828, 70, 205, 200]].forEach(([x, y, w, h]) => el('rect', { x: x - w / 2, y, width: w, height: h, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 3 })); }
    if (role === 'endpoints') { grow(600, 307, 600, 196, 1, ACC); }
    // 왼쪽 아래: 지금 잡힌 대상 수
    const cnt = { pod: 5, service: 1, endpoints: 2, node: 2, ingress: 1 }[role] ?? 0;
    if (k === 0) { note(30, 330, 'job "kubernetes-pods"', fade(u, 0.2), { class: 'mono' }); note(30, 362, '대상: 아직 비어 있다', fade(u, 0.8), { fill: MUT }); return; }
    grow(148, 190, 214, 190, k === 1 ? E(u, 0.3, 1.0) : 1, INFO);
    if (k === 1) { note(30, 330, 'kubernetes_sd_configs:', fade(u, 0.4), { class: 'mono' }); note(30, 362, '목록은 API 서버가 준다', fade(u, 1.2), { fill: INFO });
      dot([[148, 190], [214, 190]], seg(u, 1.2, 1.8), INFO, 6); return; }
    if (k === 2 || k === 3) { mono(30, 330, 'role: ' + role, { 'font-size': 18, 'font-weight': 800, fill: ACC });
      mono(30, 366, '대상 ' + cnt + '개', { 'font-size': 18, 'font-weight': 800, fill: INK, opacity: k === 2 ? fade(u, 1.8) : 1 });
      if (k === 3) note(30, 398, 'role을 바꾸면 발견 단위가 통째로 바뀐다', fade(u, 0.4), { 'font-size': 14 }); return; }
    if (k === 4) { fly(90, 250, 300, 230, seg(u, 0.4, 1.4), 'serviceaccount token', { mono: true, fill: INFO });
      note(30, 320, '클러스터 안에서 돌면', fade(u, 0.4)); note(30, 350, 'API 주소·토큰이 자동으로 채워진다', fade(u, 1.2), { fill: INFO });
      mono(30, 384, '/var/run/secrets/kubernetes.io/…', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    [['pod', '파드를 직접'], ['endpoints', 'Service 뒤 앱'], ['node', '노드·kubelet']].forEach(([r, d], i) => { const x = 80 + i * 136, s = pop(u, 0.3 + i * 0.3);
      card(x, 340, 126, 64, { rx: 10, stroke: i === 1 ? ACC : GRID, sw: 2, s }); mono(x, 334, r, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 1 ? ACC : INK, opacity: s > 0.3 ? 1 : 0 });
      tx(x, 356, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s > 0.3 ? 1 : 0 }); });
    tx(214, 290, '실무에서 가장 흔한 것: endpoints', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); }

  // ---------- 2. 어노테이션 ----------
  function s2(t, c) { const { k, u } = c;
    const M = [['Deployment payment-api', INK, at(c, 0, 0.2), 0], ['spec.template.metadata', INFO, fa(c, 1), 1], ['  annotations:', INFO, fa(c, 1, 0.5), 1],
      ['    prometheus.io/scrape: "true"', ACC, fa(c, 2), 2], ['    prometheus.io/port: "8080"', ACC, fa(c, 3), 3], ['    prometheus.io/path: "/actuator/prometheus"', ACC, fa(c, 4), 4],
      ['spec.containers[0]', INFO, fa(c, 5), 5], ['  containerPort: 8080', k === 5 ? WARN : INK, fa(c, 5, 0.4), 5]];
    el('rect', { x: 16, y: 30, width: 420, height: 300, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(30, 54, 'deployment.yaml', { 'font-size': 14, 'font-weight': 800, class: 'mono' });
    M.forEach(([s, col, op, k0], i) => mono(30, 88 + i * 30, s, { 'font-size': 13.5, fill: col, opacity: op, 'font-weight': k === k0 ? 800 : 500 }));
    // 오른쪽: 파드들
    tx(470, 46, 'API 서버가 준 파드 (IP는 예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    PODS.forEach(([n, ns, sc, port, ip], i) => { const y = 84 + i * 62, pay = n.startsWith('payment');
      const gone = k >= 2 && !sc, gOp = gone ? 1 - 0.65 * (k === 2 ? E(u, 0.8, 1.4) : 1) : 1;
      card(705, y, 470, 52, { rx: 10, stroke: k === 0 ? INFO : sc && k >= 2 ? ACC : GRID, sw: k >= 2 && sc ? 2.2 : 1.5, op: gOp, s: k === 0 ? pop(u, 0.3 + i * 0.15) : 1 });
      mono(484, y - 4, n, { 'font-size': 14, 'font-weight': 700, opacity: gOp });
      mono(484, y + 16, 'ns=' + ns, { 'font-size': 13.5, fill: MUT, opacity: gOp });
      if (k === 1 && pay) pill(860, y, 'annotations', INFO, pop(u, 1.0 + i * 0.2), { fs: 13, mono: true });
      if (k >= 2 && sc && k < 3) pill(860, y, 'scrape=true', ACC, k === 2 ? pop(u, 0.4 + i * 0.15) : 1, { fs: 13, mono: true });
      if (k >= 3 && sc) { const addr = ip + ':' + port, bad = k === 5 && i === 0;
        mono(700, y + 16, addr, { 'font-size': 13.5, 'font-weight': 700, fill: bad ? BAD : INFO, opacity: k === 3 ? fade(u, 0.6 + i * 0.2) : 1 });
        if (k >= 4 && pay) mono(700, y - 4, '/actuator/prometheus', { 'font-size': 13.5, fill: ACC, opacity: k === 4 ? fade(u, 0.8) : 1 });
        else mono(700, y - 4, '/metrics', { 'font-size': 13.5, fill: MUT }); }
      if (k >= 2 && !sc) mono(920, y + 5, 'drop', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: k === 2 ? fade(u, 1.4) : 0.5 }); });
    if (k === 0) note(30, 380, '아직 아무 표시가 없다 — 다섯 파드 모두 후보', fade(u, 1.4));
    if (k === 1) note(30, 380, 'Deployment가 아니라 파드 템플릿에 달아야 파드에 붙는다', fade(u, 1.4), { 'font-size': 14.5 });
    if (k === 2) note(30, 380, '앱이 스스로 "나를 긁어라"를 선언한다', fade(u, 1.6));
    if (k === 3) note(30, 380, 'IP는 API 서버가, 포트는 앱만 안다', fade(u, 1.6));
    if (k === 4) note(30, 380, '/metrics가 아닌 앱은 경로를 직접 알린다', fade(u, 1.4));
    if (k === 5) { el('rect', { x: 16, y: 344, width: 420, height: 66, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: fade(u, 0.8) });
      mono(30, 370, 'port: "8080"  ≠  containerPort: 9090', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      tx(30, 396, '대상은 잡히는데 연결이 안 된다 → up = 0 (예시)', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.5) }); }
    if (k === 6) { card(226, 375, 300, 52, { rx: 10, stroke: WARN, dash: '6 5', s: pop(u, 0.3) });
      tx(226, 382, '읽어 줄 relabel이 아직 없다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
      tx(470, 398, '어노테이션은 그냥 문자열이다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); } }

  // ---------- 3. relabel_configs ----------
  const RULES = [['keep', 'scrape == "true"'], ['replace', 'path → __metrics_path__'], ['replace', 'IP;port → __address__'], ['replace', 'namespace'], ['replace', 'pod']];
  function s3(t, c) { const { k, u } = c;
    const act = [null, 0, 1, 2, 3][k];
    tx(30, 40, 'relabel_configs (위에서 아래로)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    RULES.forEach(([a, d], i) => { const y = 82 + i * 58, on = act === i || (k === 4 && i === 4), done = act != null && i < act;
      card(170, y, 290, 46, { rx: 8, stroke: on ? ACC : done ? GOOD : GRID, fill: on ? ACCBG : PANEL, sw: on ? 2.6 : 1.5, s: k === 0 ? pop(u, 0.3 + i * 0.15) : 1 });
      mono(40, y + 5, a, { 'font-size': 14, 'font-weight': 800, fill: a === 'keep' ? WARN : INFO });
      tx(116, y + 5, d, { 'font-size': 14, class: 'mono' }); if (done) check(300, y, 8, 1); });
    // 후보 수
    const n = k === 0 ? 5 : k === 1 ? Math.round(lerp(5, 3, E(u, 0.8, 1.6))) : 3;
    mono(30, 392, '후보 ' + n + '개', { 'font-size': 20, 'font-weight': 800, fill: k === 1 ? ACC : INK });
    if (k <= 1) PODS.forEach(([nm, , sc], i) => { const x = 150 + i * 34, fall = k === 1 && !sc ? E(u, 0.8, 1.6) : 0;
      el('circle', { cx: x, cy: 386 + fall * 20, r: 9, fill: sc ? ACC : BAD, opacity: k === 0 ? fade(u, 0.5 + i * 0.1) : 1 - fall * 0.8 }); });
    // 오른쪽: payment-api-7c9f-aa 의 라벨 표
    tx(370, 40, 'payment-api-7c9f-aa의 라벨', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const fin = k === 4 ? E(u, 1.6, 2.4) : 0;
    const rows = [['__meta_…_prometheus_io_scrape', '"true"', 'm'], ['__meta_…_prometheus_io_path', '"/actuator/prometheus"', 'm'], ['__meta_…_prometheus_io_port', '"8080"', 'm'],
      ['__meta_kubernetes_namespace', '"payment"', 'm'], ['__address__', '', 'a'], ['__metrics_path__', '', 'p'], ['namespace', '', 'n'], ['pod', '', 'o']];
    rows.forEach(([nm, v, ty], i) => { const y = 74 + i * 41, meta = nm.startsWith('__meta'), hot = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && (i === 2 || i === 4)) || (k === 4 && i === 3);
      const op = meta ? 1 - 0.8 * fin : 1;
      if ((ty === 'n' || ty === 'o') && k < 4) return;
      el('rect', { x: 360, y: y - 18, width: 584, height: 36, rx: 6, fill: hot ? ACCBG : i % 2 ? PANEL : SOFT, opacity: op });
      mono(372, y + 5, nm, { 'font-size': 13.5, 'font-weight': 700, fill: meta ? MUT : INK, opacity: op });
      let val = v, col = INK;
      if (ty === 'a') { val = '10.244.1.7:8080'; col = k >= 3 ? ACC : INK; }
      if (ty === 'p') { val = k >= 2 ? '/actuator/prometheus' : '/metrics'; col = k >= 2 ? ACC : MUT; }
      if (ty === 'n') { val = '"payment"'; col = GOOD; } if (ty === 'o') { val = '"payment-api-7c9f-aa"'; col = GOOD; }
      const vop = (ty === 'p' && k === 2) ? fade(u, 1.0) : (ty === 'n' || ty === 'o') && k === 4 ? fade(u, 0.6 + (ty === 'o' ? 0.4 : 0)) : 1;
      mono(668, y + 5, val, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op * vop }); });
    if (k === 2) fly(860, 150, 860, 260, seg(u, 0.3, 1.0), '(.+) 매칭', { fill: ACC });
    if (k === 3) { // 세미콜론으로 이어 붙이고 regex 로 다시 조립
      el('rect', { x: 360, y: 356, width: 584, height: 56, rx: 8, fill: INK, opacity: fade(u, 0.2) });
      spans(374, 380, [['10.244.1.7', { fill: 'var(--info)', 'font-weight': 700 }], [':8080', { fill: OFF }], [';', { fill: 'var(--warn)', 'font-weight': 800 }], ['8080', { fill: 'var(--good)', 'font-weight': 700 }]], { 'font-size': 14.5, opacity: fade(u, 0.4) });
      mono(374, 402, '([^:]+)(?::\\d+)?;(\\d+)', { 'font-size': 13.5, fill: 'var(--term)', opacity: fade(u, 1.0) });
      spans(700, 391, [['→ $1:$2 = ', { fill: 'var(--term)' }], ['10.244.1.7', { fill: 'var(--info)', 'font-weight': 700 }], [':8080', { fill: 'var(--good)', 'font-weight': 700 }]], { 'font-size': 14.5, opacity: fade(u, 1.6) }); }
    if (k === 4) { tx(370, 404, '__로 시작하는 라벨은 스크랩 뒤 사라진다 — 남길 값은 승격', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 2.0) }); } }

  // ---------- 4. 동적 반영 ----------
  const SL = ['aa', 'bb', 'cc', 'dd', 'abcde'];
  function s4(t, c) { const { k, u } = c;
    apiBox(100, 70, 1); server(100, 250, 'Prometheus', { lamp: GOOD, s: 0.85 });
    tx(220, 40, 'payment-api-7c9f-…', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    const born = (i) => i < 3 ? 1 : k === 0 ? pop(u, 0.6 + (i - 3) * 0.3) : 1;
    const dead = k >= 3 ? (k === 3 ? E(u, 0.6, 1.4) : 1) : 0;
    SL.forEach((s, i) => { const x = 290 + i * 140, isNew = i >= 3, del = i === 4 ? dead : 0;
      podCard(x, 70, s, { w: 120, stroke: del > 0.5 ? BAD : isNew ? GOOD : GRID, color: del > 0.5 ? BAD : isNew ? GOOD : INK, s: born(i), op: 1 - 0.6 * del, dash: del > 0.5 ? '5 4' : null });
      if (i === 4 && k === 3) cross(x, 70, 12, pop(u, 0.4)); });
    if (k === 0) { mono(290, 128, '$ kubectl scale deploy/payment-api --replicas=5', { 'font-size': 14, fill: INK, opacity: fade(u, 0.2) });
      mono(290, 156, 'replicas 3 → 5', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); }
    if (k === 3) mono(290, 128, '$ kubectl delete pod payment-api-7c9f-abcde', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.2) });
    // watch 이벤트
    if (k === 1) { fly(100, 100, 100, 200, seg(u, 0.3, 1.0), 'ADD dd', { mono: true, fill: GOOD }); fly(100, 100, 100, 200, seg(u, 0.9, 1.6), 'ADD abcde', { mono: true, fill: GOOD }); }
    if (k === 4) fly(100, 100, 100, 200, seg(u, 0.3, 1.1), 'DELETE abcde', { mono: true, fill: BAD });
    if (k === 2) { card(100, 362, 170, 60, { rx: 10, stroke: INFO, s: pop(u, 0.3) }); tx(100, 356, 'activeTargets', { 'font-size': 13.5, 'text-anchor': 'middle', class: 'mono', fill: MUT });
      mono(100, 380, '5', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.7) }); }
    if (k === 5) { // 정적 SD 와 비교
      el('rect', { x: 220, y: 190, width: 720, height: 220, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      const X = (v) => 360 + v * 5.4; // 0~100 (상대 시간)
      [['static_configs', 240, [[0, 8, '새 파드', GOOD], [8, 70, '사람이 yml 수정 → reload 기다림', BAD], [70, 100, '수집', ACC]]], ['kubernetes_sd', 330, [[0, 8, '새 파드', GOOD], [8, 14, 'watch', INFO], [14, 100, '수집', ACC]]]].forEach(([nm, y, segs], j) => {
        mono(236, y + 5, nm, { 'font-size': 14, 'font-weight': 800, opacity: fade(u, 0.3 + j * 0.8) });
        segs.forEach(([a, b, s, col], i) => { const g = E(u, 0.4 + j * 0.8 + i * 0.25, 0.8 + j * 0.8 + i * 0.25); if (g <= 0) return;
          el('rect', { x: X(a), y: y - 16, width: Math.max(1, (X(b) - X(a)) * g - 2), height: 32, rx: 4, fill: col, opacity: col === BAD ? 0.25 : 0.85 });
          if (b - a > 20) tx((X(a) + X(b)) / 2, y + 5, s, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col === BAD ? BAD : PANEL, opacity: g }); }); });
      note(236, 396, '리로드를 깜빡할 일이 없으니 관측 공백도 없다', fade(u, 2.2), { fill: GOOD }); return; }
    // 아래: up 시계열
    tx(220, 196, 'up 시계열', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const nowX = Math.min(930, 300 + (k + u / 3) * 140);
    SL.forEach((s, i) => { const y = 226 + i * 36;
      mono(220, y + 5, s, { 'font-size': 13.5, fill: MUT });
      if (i >= 3 && k < 1) return; const st = i < 3 ? 300 : 440;
      const e = i === 4 && k >= 4 ? Math.min(nowX, 300 + 140 * 4.2) : nowX;
      el('line', { x1: st, y1: y, x2: e, y2: y, stroke: i === 4 && k >= 4 ? BAD : i >= 3 ? GOOD : ACC, 'stroke-width': 4, 'stroke-linecap': 'round' });
      if (i === 4 && k >= 4) { const sx = 300 + 140 * 4.2; mono(sx + 10, y + 5, 'stale', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: k === 4 ? fade(u, 1.2) : 1 }); } });
    mono(nowX, 400, 'now', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    if (k === 1) note(470, 160, '다음 scrape부터 새 파드 2개가 들어온다', fade(u, 1.8), { 'font-size': 14.5, fill: GOOD });
    if (k === 4) note(470, 160, '대상에서 빠지고 시계열은 stale로 끊긴다', fade(u, 1.4), { 'font-size': 14.5, fill: BAD }); }

  // ---------- 5. Operator · ServiceMonitor ----------
  function s5(t, c) { const { k, u } = c;
    const L = [['kind: ServiceMonitor', INK, 0], ['labels:', INFO, 1], ['  release: kube-prometheus-stack', ACC, 1], ['selector.matchLabels:', INFO, 2], ['  app: payment-api', ACC, 2],
      ['endpoints:', INFO, 3], ['  - port: http-metrics', ACC, 3], ['    path: /actuator/prometheus', INK, 3], ['    interval: 15s', INK, 3]];
    el('rect', { x: 16, y: 30, width: 350, height: 316, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(30, 54, 'servicemonitor.yaml', { 'font-size': 14, 'font-weight': 800, class: 'mono' });
    L.forEach(([s, col, k0], i) => mono(30, 88 + i * 29, s, { 'font-size': 13.5, fill: col, opacity: fa(c, k0, 0.2 + i * 0.05), 'font-weight': k === k0 ? 800 : 500 }));
    card(470, 190, 160, 60, { rx: 30, text: 'Operator', fs: 16, fw: 800, stroke: INFO, fill: INFOBG, color: INFO, s: at(c, 0, 0.6) });
    if (k === 0) { fly(200, 100, 470, 160, seg(u, 0.9, 1.7), 'kubectl apply', { mono: true, fill: INK });
      note(560, 120, 'relabel 대신 쿠버네티스 리소스', fade(u, 1.6)); note(560, 150, 'Git으로 관리한다 (GitOps)', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 1) { mono(600, 60, 'serviceMonitorSelector:', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
      mono(620, 86, 'release: kube-prometheus-stack', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.4) });
      card(720, 200, 300, 50, { rx: 8, text: 'SM payment-api  (release ✓)', fs: 14, stroke: GOOD, s: pop(u, 0.8) }); check(890, 200, 10, pop(u, 1.1));
      card(720, 280, 300, 50, { rx: 8, text: 'SM order-api  (라벨 없음)', fs: 14, stroke: BAD, dash: '6 4', color: MUT, s: pop(u, 1.4) }); cross(890, 280, 10, pop(u, 1.7));
      note(560, 360, '라벨이 안 맞으면 에러 없이 조용히 무시된다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 2) { card(720, 110, 220, 50, { rx: 8, text: 'Service payment-api', fs: 14, mono: true, stroke: ACC, s: pop(u, 0.4) });
      tx(720, 150, 'app=payment-api', { 'font-size': 13.5, 'text-anchor': 'middle', class: 'mono', fill: ACC, opacity: fade(u, 0.6) });
      grow(550, 190, 610, 120, E(u, 0.3, 0.7), ACC);
      ['aa', 'bb', 'cc'].forEach((s, i) => { const x = 640 + i * 80; grow(720, 135, x, 230, E(u, 1.0 + i * 0.2, 1.4 + i * 0.2), GRID, { plain: true }); podCard(x, 250, s, { w: 64, s: pop(u, 1.3 + i * 0.2) }); });
      note(560, 320, '파드가 아니라 Service를 고르고', fade(u, 1.8)); note(560, 350, '그 뒤 엔드포인트가 대상이 된다', fade(u, 2.1)); return; }
    if (k === 3) { el('rect', { x: 560, y: 60, width: 380, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(576, 86, 'Service payment-api의 ports', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      mono(576, 120, '- name: http-metrics', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); mono(596, 146, 'port: 8080', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      card(650, 270, 180, 46, { rx: 8, text: 'port: http-metrics', fs: 14, mono: true, stroke: GOOD, s: pop(u, 0.9) }); check(760, 270, 10, pop(u, 1.2));
      card(860, 270, 150, 46, { rx: 8, text: 'port: 8080', fs: 14, mono: true, stroke: BAD, s: pop(u, 1.5) }); cross(950 - 10, 248, 9, pop(u, 1.8));
      note(560, 350, 'port는 숫자가 아니라 Service 포트의 이름', fade(u, 2.0)); return; }
    // k4: 설정 생성·주입
    el('rect', { x: 600, y: 60, width: 340, height: 250, rx: 10, fill: INK });
    tx(614, 84, 'Prometheus 설정 (Operator가 생성)', { 'font-size': 13.5, fill: OFF, 'font-weight': 700 });
    ['- job_name: serviceMonitor/', '    payment/payment-api/0', '  kubernetes_sd_configs: …', '  relabel_configs:', '    (keep · 주소 · 경로 · 라벨', '     규칙 자동 생성)'].forEach((s, i) =>
      mono(614, 116 + i * 30, s, { 'font-size': 13.5, fill: 'var(--term)', opacity: fade(u, 0.8 + i * 0.25) }));
    for (let i = 0; i < 4; i++) dot([[550, 190], [600, 190]], (u * 0.8 + i / 4) % 1, ACC, 5);
    note(400, 380, '앱 팀은 relabel 문법을 몰라도 된다', fade(u, 2.2), { fill: GOOD }); }

  // ---------- 6. 실무 함정 ----------
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { // 과다 발견 · namespaces
      const NS = ['prod', 'payment', 'kube-system', 'monitoring', 'dev', 'batch'];
      NS.forEach((ns, j) => { const x = 30 + (j % 3) * 310, y = 40 + Math.floor(j / 3) * 170, keep = j < 2, op = k === 1 && !keep ? 1 - 0.7 * E(u, 0.6, 1.4) : 1;
        zone(x, y, 290, 150, 'ns ' + ns, { stroke: k === 1 && keep ? ACC : GRID, sw: k === 1 && keep ? 2.5 : 1.2, op });
        for (let i = 0; i < 12; i++) { const px = x + 30 + (i % 6) * 44, py = y + 60 + Math.floor(i / 6) * 44, hit = k === 0 ? E(u, 0.3 + (j * 12 + i) * 0.02, 0.5 + (j * 12 + i) * 0.02) : 0;
          el('circle', { cx: px, cy: py, r: 10, fill: k === 0 ? (hit > 0.5 ? BAD : OFF) : keep ? ACC : OFF, opacity: op }); } });
      if (k === 0) banner(480, 396, 'keep이 없으면 72개 파드 전부가 대상 (예시)', pop(u, 2.0));
      if (k === 1) banner(480, 396, 'namespaces: [prod, payment] — 발견 자체를 줄인다', pop(u, 1.6));
      return; }
    if (k === 5) return churn(t, c);
    server(110, 160, 'Prometheus', { lamp: k >= 4 ? GOOD : BAD }); apiBox(420, 160, 1);
    if (k === 2) { grow(170, 160, 334, 160, E(u, 0.2, 0.7), MUT); fly(334, 190, 170, 190, seg(u, 0.8, 1.5), '403 forbidden', { mono: true, fill: BAD });
      el('rect', { x: 600, y: 80, width: 330, height: 160, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(616, 106, 'Status → Targets', { 'font-size': 14, 'font-weight': 700, fill: MUT }); mono(765, 170, '0', { 'font-size': 40, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.4) });
      tx(765, 214, '빈 화면 — 이유는 로그에만', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      note(40, 330, '설정은 맞는데 대상이 0이면 십중팔구 권한 문제', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 3 || k === 4) { const L = ['kind: ClusterRole', 'name: prometheus', 'resources: pods, services,', '           endpoints, nodes', 'verbs: get, list, watch'];
      el('rect', { x: 40, y: 250, width: 420, height: 160, rx: 10, fill: SOFT, stroke: ACC, 'stroke-width': 1.8, opacity: fa(c, 3) });
      L.forEach((s, i) => mono(56, 278 + i * 28, s, { 'font-size': 14, 'font-weight': i === 4 ? 800 : 500, fill: i === 4 ? (k === 4 ? GOOD : MUT) : INK, opacity: k === 3 ? fade(u, 0.3 + i * 0.3) : 1 }));
      if (k === 3) { note(520, 300, '네임스페이스를 가로질러 보므로', fade(u, 1.6)); note(520, 330, 'Role이 아니라 ClusterRole', fade(u, 1.9), { fill: ACC }); return; }
      grow(170, 160, 334, 160, E(u, 0.2, 0.6), GOOD);
      fly(334, 190, 170, 190, seg(u, 0.6, 1.2), 'list', { mono: true, fill: INFO });
      for (let i = 0; i < 3; i++) fly(334, 130, 170, 130, seg(u, 1.3 + i * 0.35, 1.8 + i * 0.35), 'watch', { mono: true, fill: GOOD });
      el('rect', { x: 600, y: 80, width: 330, height: 160, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(616, 106, 'Status → Targets', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      mono(765, 170, String(Math.round(lerp(0, 3, E(u, 0.8, 1.6)))), { 'font-size': 40, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
      note(520, 300, 'list로 처음 목록을, watch로 변화를', fade(u, 2.0)); note(520, 330, '하나만 빠져도 동적 반영이 죽는다', fade(u, 2.3), { fill: BAD }); return; }
  }
  function churn(t, c) { const { u } = c;   // k5: 고유값 승격과 시계열 churn (예시)
    const ax = R.axes(110, 60, 520, 260, { x: [0, 10], y: [0, 16000], xt: [0, 2, 4, 6, 8, 10], yt: [0, 5000, 10000, 15000], xl: '하루 배포 횟수', grid: true });
    tx(20, 40, '새로 생긴 시계열 수 (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const pts = []; for (let d = 0; d <= 10; d++) pts.push([d, d * 1500]);
    line(ax, pts, E(u, 0.3, 2.0), BAD, { sw: 3 });
    mono(ax.X(10), ax.Y(15000) - 10, '15000', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.0) });
    const L = [['파드 3개 × 500 시계열', 0.4], ['= 배포 한 번에 1500 새로', 0.9], ['배포 10번 = 15000', 1.6]];
    L.forEach(([s, a], i) => mono(670, 110 + i * 34, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }));
    note(670, 250, '파드마다 다른 값은 재배포마다', fade(u, 2.0), { 'font-size': 14.5 }); note(670, 278, '시계열을 새로 만든다', fade(u, 2.1), { 'font-size': 14.5 });
    note(670, 320, 'pod 하나면 충분 — pod_ip는 올리지 않는다', fade(u, 2.4), { fill: GOOD, 'font-size': 14 }); }
  const line = R.line;

  const quiz = [
    { q: 'kubernetes_sd_configs에서 role: pod를 고르면 무엇이 발견 단위가 되는가?',
      o: ['노드(kubelet) 하나하나', 'Service의 ClusterIP', '파드 하나하나'], a: 2,
      why: 'role이 발견 단위를 정한다. pod를 고르면 API 서버가 준 파드 5개가 각각 후보가 된다.' },
    { q: 'prometheus.io/scrape 어노테이션은 어디에 달아야 파드에 붙는가?',
      o: ['Deployment의 metadata', 'spec.template.metadata의 annotations', 'Service의 spec.ports'], a: 1,
      why: '파드는 템플릿에서 만들어진다. Deployment 자체가 아니라 파드 템플릿에 달아야 파드 어노테이션이 된다.' },
    { q: '__address__가 10.244.1.7:8080이고 port 어노테이션이 "8080" 이다. 주소 조립 규칙의 결과는 무엇인가?',
      o: ['10.244.1.7:8080', '10.244.1.7:8080:8080', '8080:10.244.1.7'], a: 0,
      why: '두 값이 ; 로 이어져 10.244.1.7:8080;8080이 되고, regex의 $1(IP)과 $2(포트)로 다시 조립된다.' },
    { q: 'payment-api 파드 하나를 지우면 Prometheus 대상 목록에는 어떤 일이 생기는가?',
      o: ['yml을 고쳐 리로드할 때까지 그대로 남는다', 'watch DELETE 이벤트로 빠지고 up 시계열은 stale로 끊긴다', 'Prometheus가 다시 시작된다'], a: 1,
      why: 'Prometheus는 API 서버의 watch 스트림을 열어 두고 있어 삭제를 바로 받는다. 리로드가 필요 없다.' },
    { q: 'ServiceMonitor를 만들었는데 대상이 하나도 안 생긴다. 실무에서 가장 먼저 확인할 것은 무엇인가?',
      o: ['interval이 15s 인지', 'path가 /metrics 인지', 'release 라벨이 Operator의 serviceMonitorSelector와 맞는지'], a: 2,
      why: 'Operator는 셀렉터에 맞는 ServiceMonitor만 줍는다. 라벨이 다르면 에러 없이 조용히 무시된다.' },
    { q: '설정은 맞아 보이는데 Targets 화면이 비어 있고 눈에 띄는 오류도 없다. 무엇을 의심해야 하는가?',
      o: ['서비스 어카운트에 pods·endpoints의 list/watch 권한이 없다', 'keep 필터가 너무 넓다', 'pod_ip를 레이블로 올렸다'], a: 0,
      why: '권한이 없으면 API 서버가 403을 돌려주고 대상은 0개가 된다. ClusterRole에 get·list·watch를 주면 0 → 3이 된다.' },
  ];

  const summary = [
    '파드가 뜨고 질 때마다 목록을 손으로 고칠 수 없어서 API 서버에게 대상을 받는다.',
    'role이 발견 단위를 정하고, 앱은 파드 템플릿 어노테이션으로 긁을지·포트·경로를 알린다.',
    'relabel이 __meta 라벨을 읽어 keep으로 거르고 주소·경로를 만든 뒤 남길 값을 승격한다.',
    'watch로 대상이 바로 바뀌지만 RBAC가 없으면 0개이고, 고유값 레이블은 시계열을 불린다.',
  ];
  const review = [
    { q: '새 앱에 prometheus.io/scrape="true" 를 달았는데 대상 화면에 up=0으로만 보인다. 먼저 의심할 것은?',
      o: ['port 어노테이션과 containerPort가 어긋났다', 'RBAC 권한이 없다', 'role을 node로 골랐다'], a: 0,
      why: '대상으로 잡혔다는 것은 발견과 keep은 됐다는 뜻이다. 조립된 주소의 포트가 실제 컨테이너 포트와 다르면 연결이 안 된다.' },
    { q: 'keep 규칙을 지웠더니 Prometheus 메모리와 scrape 부하가 크게 늘었다. 가장 알맞은 대응은?',
      o: ['scrape_interval을 1초로 줄인다', 'namespaces로 발견 범위를 줄이고 keep을 되살린다', 'pod_ip를 레이블로 올린다'], a: 1,
      why: 'keep이 없으면 클러스터 모든 파드가 대상이 된다. namespaces로 발견 자체를 좁히면 API 부하까지 줄어든다.' },
    { q: '하루 10번 배포하는 서비스에서 시계열 수가 계속 늘어난다. 무엇을 손봐야 하나?',
      o: ['refresh_interval을 늘린다', 'ServiceMonitor의 interval을 15s로 둔다', '파드마다 다른 값(pod_ip 등)을 레이블로 올리지 않는다'], a: 2,
      why: '파드마다 다른 값은 재배포마다 새 시계열을 만든다. 그림의 예시에서는 배포 한 번에 1500개, 10번이면 15000개다.' },
  ];

  R.page({ title: 'Kubernetes 자동 발견', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
