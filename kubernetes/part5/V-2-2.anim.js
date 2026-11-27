/* V-2-2 트러블슈팅 체크리스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone,
    cells, cross, check, lock, clock, dbIcon, person, terminal, snippet, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const TW = 'var(--warn)', TB = 'var(--bad)', TO = 'var(--off)', TG = 'var(--good)';

  // ── 위쪽 띠: 다섯 환자 체크리스트 (scenarioStates · focus 를 읽는다) ──
  const KEYS = [['pending', 'Pending'], ['imagepull', 'ImagePullBackOff'], ['crashloop', 'CrashLoopBackOff'], ['oomkilled', 'OOMKilled'], ['notready', 'NotReady']];
  function strip(c) { const b = c.beat, p = c.prev || b, u = c.u;
    KEYS.forEach(([key, name], i) => { const cx = 104 + i * 188, done = b.scenarioStates[key] === 'done', fresh = done && p.scenarioStates[key] !== 'done';
      const foc = b.focus === key, col = done && (!fresh || u > 1.8) ? GOOD : foc ? ACC : GRID;
      card(cx, 26, 176, 32, { rx: 16, stroke: col, sw: foc ? 2.5 : 1.6, fill: foc ? ACCBG : PANEL });
      tx(cx + (done ? 8 : 0), 31, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: foc || done ? INK : MUT, class: 'mono' });
      if (done) check(cx - tw(name, 13.5) / 2 - 6, 26, 6, fresh ? pop(u, 1.8) : 1); }); }
  // 파일 모양
  function fileIcon(cx, cy, name, col, s) { const g = R.G(cx, cy, s ?? 1);
    el('path', { d: 'M-20,-26 h28 l12,12 v40 h-40 z', fill: PANEL, stroke: col || INK, 'stroke-width': 2.2 }, g);
    [-6, 2, 10].forEach((y) => el('line', { x1: -12, y1: y, x2: 12, y2: y, stroke: OFF, 'stroke-width': 2.5 }, g));
    if (name) tx(0, 46, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: col || INK }, g); }
  const strike = (x1, x2, y, u) => { if (u > 0) el('line', { x1, y1: y, x2: lerp(x1, x2, u), y2: y, stroke: BAD, 'stroke-width': 2.2 }); };

  // 1. Pending — 스케줄러가 자리를 못 찾는다
  const NODES = [140, 240, 340];
  function s1(t, c) { const { k, u } = c;
    strip(c);
    if (k <= 1) {
      const L = k === 0
        ? ['$ kubectl get pods', ['NAME      READY  STATUS   RESTARTS  AGE', TO], ['web-aa1   0/1    Pending  0         5m', TW]]
        : ['$ kubectl describe pod web-aa1', ['Events:', TO], ['  Warning  FailedScheduling', TW], ['  0/3 nodes are available:', null], ['  3 Insufficient memory.', TB]];
      terminal(30, 70, 450, 168, L, 1 + (L.length - 1) * E(u, 0.2, 1.4), { title: 'zsh', fs: 14 });
      if (k === 0) { tx(40, 290, 'RESTARTS 0', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.4) });
        tx(40, 316, '컨테이너가 아직 한 번도 뜨지 않았다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) }); }
      if (k === 1) { tx(40, 290, '0/3', { 'font-size': 30, 'font-weight': 800, class: 'mono', fill: BAD, opacity: fade(u, 1.8) });
        tx(110, 288, '들어갈 수 있는 노드가 하나도 없다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) }); }
      zone(520, 64, 420, 340, '스케줄러 대기열', { fill: SOFT });
      el('circle', { cx: 610, cy: 240, r: 36, fill: PANEL, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      tx(610, 245, 'web-aa1', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' });
      clock(610, 140, 22, k === 0 ? E(u, 0.3, 1.8) * 0.85 : 0.85, WARN, k === 0 && u < 1.8 ? null : '5m');
      tx(610, 300, 'Pending', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN });
      NODES.forEach((y, i) => { const hit = k === 1 ? seg(u, 0.3 + i * 0.4, 0.7 + i * 0.4) : 0;
        card(840, y, 150, 60, { rx: 10, stroke: k === 1 && hit >= 1 ? BAD : INK, sw: 2, text: 'node-' + (i + 1), fs: 15, mono: true });
        if (k === 1) { grow(650, 240, 762, y, hit, BAD, { dash: '6 4' }); if (hit >= 1) cross(905, y - 18, 9, pop(u, 0.7 + i * 0.4)); } });
      return; }
    if (k === 2) { const x0 = 500, sc = 50, fill = tween(0, 7.2, u, 1.2);
      terminal(30, 70, 420, 168, ['$ kubectl describe node node-1', '  Allocated resources:', ['  Resource   Requests', TO], ['  memory     7.2Gi (90%)', TW]], 1 + 3 * E(u, 0.2, 1.2), { title: 'zsh', fs: 14 });
      tx(x0, 176, 'node-1 메모리 8Gi', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: x0, y: 200, width: 8 * sc, height: 46, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: x0, y: 200, width: fill * sc, height: 46, rx: 6, fill: WARN, opacity: 0.8 });
      mono(x0 + 12, 229, `requests ${fill.toFixed(1)}Gi`, { 'font-size': 14.5, 'font-weight': 700, fill: PANEL });
      [0, 2, 4, 6, 8].forEach((g) => mono(x0 + g * sc, 270, g + 'Gi', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      el('rect', { x: x0 + 7.2 * sc, y: 196, width: 0.8 * sc, height: 54, rx: 4, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': '4 3', opacity: fade(u, 1.3) });
      tx(x0 + 7.6 * sc, 300, '남은 0.8Gi', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      const dy = lerp(92, 140, E(u, 1.5, 2.1)) + Math.sin(seg(u, 2.1, 2.6) * Math.PI) * -8;
      card(860, dy, 150, 40, { rx: 8, stroke: ACC, sw: 2.2, dash: '6 4', fill: ACCBG, text: '새 Pod requests', fs: 13.5, op: fade(u, 1.5) });
      if (u > 2.1) cross(768, dy, 10, pop(u, 2.1));
      tx(40, 300, '스케줄러는 실제 사용량이 아니라', { 'font-size': 14.5, opacity: fade(u, 1.8) });
      tx(40, 326, '노드에 이미 잡힌 requests 합으로 자리를 본다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2) }); return; }
    if (k === 3) { const rows = [['노드 자원 부족', 'FailedScheduling · Insufficient memory', true], ['nodeSelector 불일치', 'spec.nodeSelector', false], ['PVC 미바인딩', 'kubectl get pvc', false], ['taint/toleration 불일치', 'describe node의 Taints', false]];
      tx(480, 92, '같은 Pending을 만드는 원인 넷', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      rows.forEach(([a, cmd, hit], i) => { const y = 140 + i * 68, s = pop(u, 0.2 + i * 0.3), op = fade(u, 0.3 + i * 0.3);
        card(480, y, 800, 54, { rx: 10, stroke: hit ? BAD : GRID, sw: hit ? 2.5 : 1.6, s });
        tx(130, y + 6, a, { 'font-size': 15.5, 'font-weight': 700, opacity: op }); mono(450, y + 6, cmd, { 'font-size': 14, fill: MUT, opacity: op });
        if (hit) pill(810, y, '이번 원인', BAD, pop(u, 1.4), { fs: 13.5 });
        else { strike(124, 420, y + 1, E(u, 1.3 + i * 0.25, 1.8 + i * 0.25)); pill(810, y, '해당 없음', MUT, pop(u, 1.6 + i * 0.25), { fs: 13.5 }); } });
      return; }
    // k4: 자리를 만드는 두 방법
    zone(30, 64, 430, 300, 'replicas 줄이기', { fill: SOFT }); zone(490, 64, 440, 300, 'requests 낮추기', { fill: SOFT });
    mono(245, 120, 'replicas ' + Math.round(tween(3, 2, u, 1.4)), { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    [0, 1, 2].forEach((i) => { const cx = 120 + i * 125, pend = i === 2, s = pend ? 1 - E(u, 1.2, 2) : 1; if (s <= 0.01) return;
      el('circle', { cx, cy: 220, r: 36 * s, fill: pend ? PANEL : 'var(--goodbg)', stroke: pend ? WARN : GOOD, 'stroke-width': 2.5, 'stroke-dasharray': pend ? '6 4' : null });
      tx(cx, 225, pend ? 'Pending' : 'Running', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: pend ? WARN : GOOD, opacity: s }); });
    tx(245, 310, '대기 중이던 Pod가 사라진다', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.9) });
    const x0 = 510, sc = 50;
    el('rect', { x: x0, y: 150, width: 8 * sc, height: 40, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    el('rect', { x: x0, y: 150, width: 7.2 * sc, height: 40, rx: 6, fill: WARN, opacity: 0.8 });
    mono(x0 + 12, 176, 'node-1 7.2Gi', { 'font-size': 14, 'font-weight': 700, fill: PANEL });
    const w = lerp(150, 36, E(u, 0.4, 1.3)), drop = E(u, 1.4, 1.9), bx = lerp(800, x0 + 7.6 * sc, E(u, 0.4, 1.3)), by = lerp(250, 170, drop);
    el('rect', { x: bx - w / 2, y: by - 17, width: w, height: 34, rx: 6, fill: drop >= 1 ? GOOD : ACCBG, stroke: drop >= 1 ? GOOD : ACC, 'stroke-width': 2, 'stroke-dasharray': drop >= 1 ? null : '5 3' });
    if (drop >= 1) check(x0 + 7.6 * sc, 120, 10, pop(u, 1.9));
    tx(710, 310, '작아진 requests가 남은 칸에 들어간다', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.9) });
    banner(480, 392, '자리가 생기면 Pending이 풀린다', pop(u, 2.1)); }

  // 2. ImagePullBackOff — 이미지를 못 받는다
  function s2(t, c) { const { k, u } = c;
    strip(c);
    if (k === 0) { const X = (s) => 90 + s * 5, ay = 270, tries = [0, 10, 30, 70, 150];
      tx(90, 96, 'STATUS', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      pill(240, 92, 'ErrImagePull', BAD, pop(u, 0.2), { mono: true, fs: 14 }); grow(330, 92, 390, 92, E(u, 0.6, 1), MUT); pill(500, 92, 'ImagePullBackOff', WARN, pop(u, 0.9), { mono: true, fs: 14 });
      el('line', { x1: X(0), y1: ay, x2: X(160), y2: ay, stroke: MUT, 'stroke-width': 2 });
      [0, 30, 60, 90, 120, 150].forEach((s) => mono(X(s), ay + 30, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      tries.forEach((s, i) => { const a = 0.4 + i * 0.35, future = s > 120, op = fade(u, a);
        el('circle', { cx: X(s), cy: ay, r: 9 * (future ? 1 : pop(u, a)), fill: future ? PANEL : BAD, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': future ? '3 3' : null, opacity: future ? op : 1 });
        if (i > 0) { const m = (X(tries[i - 1]) + X(s)) / 2, half = (X(s) - X(tries[i - 1])) / 2;
          el('path', { d: `M${X(tries[i - 1]) + 9},${ay - 6} Q${m},${ay - 30 - half * 0.25} ${X(s) - 9},${ay - 6}`, fill: 'none', stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', opacity: op });
          mono(m, ay - 22 - half * 0.13 - (i === 1 ? 8 : 0), (s - tries[i - 1]) + 's', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: op }); } });
      el('line', { x1: X(120), y1: ay - 120, x2: X(120), y2: ay + 12, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.9) });
      tx(X(120), ay - 128, '지금 AGE 2m', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(480, 350, '기다리는 간격이 두 배씩 늘고, 최대 5분에서 멈춘다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { card(170, 230, 170, 60, { rx: 10, stroke: INK, sw: 2, text: 'kubelet\nnode-3', fs: 14.5 });
      zone(560, 80, 370, 310, 'registry.company.com', { fill: SOFT });
      tx(590, 136, 'myapp', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      [['1.5', GOOD], ['…', MUT]].forEach(([tg, col], i) => card(700 + i * 90, 180, 76, 36, { rx: 8, stroke: col, sw: 2, text: tg, fs: 15, mono: true, color: col }));
      pill(400, 150, '인증 통과', GOOD, pop(u, 0.3), { fs: 13.5 });
      fly(260, 230, 660, 270, seg(u, 0.5, 1.4), 'pull myapp:v1.5', { mono: true, stay: true });
      if (u > 1.4) { cross(810, 270, 12, pop(u, 1.4)); }
      fly(660, 330, 260, 330, seg(u, 1.6, 2.5), 'manifest unknown', { fill: BAD, mono: true, stay: true });
      tx(745, 360, 'NotFound: 그 태그가 없다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const A = 'myapp:v1.5'.split(''), Bc = 'myapp:1.5'.split('');
      mono(140, 112, '$ docker pull myapp:v1.5', { 'font-size': 15, fill: MUT }); mono(140, 252, '$ docker pull myapp:1.5', { 'font-size': 15, fill: MUT });
      cells(140, 130, A, { w: 50, h: 52, fs: 20, style: (i) => i === 6 ? { stroke: BAD, fill: 'var(--badbg)', color: BAD, sw: 3, s: 1 + R.bump(u, 0.9) * 3 } : { s: pop(u, 0.1 + i * 0.06) } });
      cells(140, 270, Bc, { w: 50, h: 52, fs: 20, style: (i) => ({ s: pop(u, 0.5 + i * 0.06), stroke: i === 5 ? GOOD : INK }) });
      cross(760, 156, 14, pop(u, 1.3)); tx(790, 162, 'not found', { 'font-size': 15, 'font-weight': 700, fill: BAD, class: 'mono', opacity: fade(u, 1.3) });
      check(760, 296, 14, pop(u, 1.6)); tx(790, 302, 'pulled', { 'font-size': 15, 'font-weight': 700, fill: GOOD, class: 'mono', opacity: fade(u, 1.6) });
      tx(480, 380, '글자 하나 v가 원인이었다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2) }); return; }
    if (k === 3) { card(190, 200, 300, 120, { rx: 12, stroke: INFO, sw: 2.2, s: pop(u, 0.2) });
      tx(60, 172, 'Secret regcred', { 'font-size': 15.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      mono(60, 204, 'type: kubernetes.io/', { 'font-size': 13.5, opacity: fade(u, 0.4) }); mono(60, 226, '      dockerconfigjson', { 'font-size': 13.5, opacity: fade(u, 0.4) });
      mono(60, 248, 'data: .dockerconfigjson', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
      zone(600, 110, 320, 200, '비공개 registry', { fill: SOFT });
      const open = u > 1.7; lock(760, 220, !open, open ? GOOD : INK, 2);
      fly(340, 200, 740, 220, seg(u, 0.8, 1.7), 'regcred', { mono: true, fill: INFO });
      tx(760, 290, open ? '열림' : '잠김', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: open ? GOOD : INK });
      tx(480, 370, 'secret이 없거나 만료면 같은 BackOff가 난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2) }); return; }
    // k4: 고친 spec 으로 다시
    snippet(40, 90, ['spec:', '  imagePullSecrets:', '    - name: regcred', '  containers:', '    - name: web', '      image: myapp:1.5'], { fs: 15, w: 360 });
    tx(560, 110, 'node-3 kubelet이 레이어를 받는다', { 'font-size': 15, 'font-weight': 700 });
    [0, 1, 2].forEach((i) => { const y = 140 + i * 44, f = E(u, 0.3 + i * 0.35, 1.1 + i * 0.35);
      el('rect', { x: 560, y, width: 330, height: 22, rx: 5, fill: SOFT }); el('rect', { x: 560, y, width: 330 * f, height: 22, rx: 5, fill: ACC });
      mono(548, y + 16, 'layer ' + (i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); if (f >= 1) check(905, y + 11, 7, 1); });
    pill(725, 310, 'Running', GOOD, pop(u, 2), { mono: true, fs: 15 });
    tx(220, 360, '태그는 1.5, 인증은 regcred', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) }); }

  // 3. CrashLoopBackOff — 뜨자마자 죽는다
  const RUNS = [0, 11, 32, 73, 154, 315];   // v22_check.py: 1초 실행 뒤 10s·20s·40s·80s·160s 대기
  function s3(t, c) { const { k, u } = c;
    strip(c);
    if (k === 0) { const X = (s) => 80 + s * (800 / 360), ay = 250;
      el('line', { x1: X(0), y1: ay + 18, x2: X(360), y2: ay + 18, stroke: MUT, 'stroke-width': 2 });
      [0, 60, 120, 180, 240, 300, 360].forEach((s) => mono(X(s), ay + 42, (s / 60) + 'm', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      let n = 0;
      RUNS.forEach((s, i) => { const a = 0.2 + i * 0.32, sh = seg(u, a, a + 0.25); if (sh <= 0) return; if (i > 0 && sh >= 1) n = i;
        el('rect', { x: X(s) - 3, y: ay - 8, width: 7, height: 26, rx: 2, fill: GOOD, opacity: sh }); cross(X(s) + 1, ay - 24, 6, pop(u, a + 0.15));
        if (i > 0) { const pe = RUNS[i - 1] + 1, m = (X(pe) + X(s)) / 2;
          el('path', { d: `M${X(pe) + 4},${ay + 4} Q${m},${ay - 60 - i * 6} ${X(s) - 4},${ay + 4}`, fill: 'none', stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', opacity: sh });
          mono(m, ay - 40 - i * 6 - (i === 1 ? 16 : 0), (s - pe) + 's', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: sh }); } });
      mono(700, 110, 'RESTARTS ' + n, { 'font-size': 22, 'font-weight': 800, fill: BAD });
      el('line', { x1: X(360), y1: ay - 90, x2: X(360), y2: ay + 18, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 2) });
      mono(X(360), ay - 98, 'AGE 6m', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2) });
      tx(80, 110, '1초 실행하고 죽는다', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      tx(480, 360, '다음 재시작은 300초 뒤 (최대 5분)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { card(150, 150, 230, 70, { rx: 10, stroke: GRID, sw: 1.8, text: '지금 컨테이너\n막 다시 떠서 비어 있음', fs: 14, color: MUT });
      card(150, 290, 230, 70, { rx: 10, stroke: BAD, sw: 2.2, dash: '6 4', text: '이전 컨테이너\n죽기 직전 출력', fs: 14, color: BAD, s: pop(u, 0.3) });
      grow(270, 290, 330, 230, E(u, 0.5, 1), BAD);
      terminal(340, 80, 590, 290, ['$ kubectl logs --previous web-aa1', 'Traceback (most recent call last):', '  File "/app/config.py", line 14, in <module>', '    DB_URL = os.environ["DB_URL"]', ["KeyError: 'DB_URL'", TB]], 1 + 4 * E(u, 0.6, 2.2), { title: 'zsh', fs: 14 });
      return; }
    if (k === 2) { const L = [['Last State:', 'Terminated', INK], ['  Reason:', 'Error', WARN], ['  Exit Code:', '1', BAD], ['  Started:', '09:12:34', INK], ['  Finished:', '09:12:35', INK], ['Restart Count:', '5', BAD]];
      zone(30, 70, 430, 260, 'describe pod web-aa1', { fill: SOFT });
      L.forEach(([a, v, col], i) => { const op = fade(u, 0.2 + i * 0.2); mono(50, 120 + i * 32, a, { 'font-size': 14.5, fill: MUT, opacity: op }); mono(220, 120 + i * 32, v, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); });
      el('rect', { x: 330, y: 226, width: 70 * E(u, 1.4, 1.9), height: 32, rx: 5, fill: WARN, opacity: 0.3 }); tx(365, 280, '1초', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.9) });
      [['0', '정상 종료', GOOD], ['1', '앱이 에러로 스스로 끝남', BAD], ['137', '128+9, SIGKILL로 강제 종료', MUT]].forEach(([code, d, col], i) => { const y = 120 + i * 90, hit = i === 1, s = pop(u, 0.6 + i * 0.25);
        card(700, y, 400, 66, { rx: 10, stroke: hit ? BAD : GRID, sw: hit ? 2.8 : 1.6, s });
        mono(540, y + 8, code, { 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, 0.7 + i * 0.25) }); tx(610, y + 6, d, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.25) }); });
      grow(470, 196, 494, 210, E(u, 1.6, 2), BAD); return; }
    if (k === 3) { card(140, 230, 170, 64, { rx: 10, stroke: BAD, sw: 2.5, text: 'Exit Code 1', fs: 16, mono: true, color: BAD });
      [['환경변수 누락', true], ['DB 연결 실패', false], ['probe path 오류', false], ['앱 자체 버그', false]].forEach(([a, hit], i) => { const y = 110 + i * 80, g = E(u, 0.2 + i * 0.2, 0.6 + i * 0.2);
        el('path', { d: `M225,230 C300,230 300,${y} ${lerp(225, 380, g)},${lerp(230, y, g)}`, fill: 'none', stroke: hit ? BAD : GRID, 'stroke-width': hit ? 2.8 : 2 });
        card(530, y, 300, 52, { rx: 10, stroke: hit ? BAD : GRID, sw: hit ? 2.5 : 1.6, text: a, fs: 15, s: pop(u, 0.4 + i * 0.2) });
        if (!hit) strike(420, 640, y, E(u, 1.4 + i * 0.2, 1.9 + i * 0.2)); });
      pill(800, 110, "KeyError: 'DB_URL'", BAD, pop(u, 1.1), { mono: true, fs: 13.5 });
      tx(800, 160, 'stack trace가 가리킨다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) }); return; }
    // k4: ConfigMap 연결
    card(150, 140, 230, 90, { rx: 10, stroke: INFO, sw: 2.2, s: pop(u, 0.2) });
    tx(50, 124, 'ConfigMap app-cfg', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) }); mono(50, 158, 'DB_URL: …', { 'font-size': 14.5, opacity: fade(u, 0.4) });
    card(480, 140, 250, 90, { rx: 10, stroke: INK, sw: 2.2 });
    tx(370, 124, 'Deployment web', { 'font-size': 15, 'font-weight': 800 }); mono(370, 158, 'env ← app-cfg', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) });
    dot([[265, 140], [355, 140]], seg(u, 0.6, 1.1), INFO, 7);
    const old = 1 - E(u, 1.4, 2); if (old > 0.02) card(810, 140, 200, 60, { rx: 30, stroke: BAD, sw: 2, text: 'CrashLoopBackOff', fs: 13.5, mono: true, color: BAD, op: old });
    grow(605, 160, 700, 280, E(u, 1.3, 1.8), ACC);
    card(810, 290, 200, 60, { rx: 30, stroke: GOOD, sw: 2.5, fill: 'var(--goodbg)', text: '새 Pod Running', fs: 14, s: pop(u, 1.8) });
    const X = (s) => 80 + s * 2.2; el('rect', { x: X(0), y: 360, width: Math.max(4, 640 * E(u, 1.9, 2.7)), height: 18, rx: 4, fill: GOOD, opacity: 0.8 });
    tx(80, 350, '재시작 없이 계속 실행', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) }); }

  // 4. OOMKilled — limits 를 넘어 커널이 죽인다
  const MY = (m) => 380 - m * (260 / 1024);   // 기둥 그래프 세로 눈금 (0 ~ 1024Mi)
  function column(o) { const x = 380, w = 140;
    el('rect', { x, y: MY(1024) - 10, width: w, height: MY(0) - MY(1024) + 10, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    [0, 256, 512, 768, 1024].forEach((m) => mono(x - 10, MY(m) + 5, m + 'Mi', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }));
    if (o.heap) { el('rect', { x: x + 2, y: MY(o.heap), width: w - 4, height: MY(0) - MY(o.heap), rx: 4, fill: ACC, opacity: 0.85 });
      el('rect', { x: x + 2, y: MY(1024), width: w - 4, height: (MY(o.heap) - MY(1024)) * o.rest, rx: 4, fill: WARN, opacity: 0.35 }); }
    if (o.req != null) { el('line', { x1: x - 6, y1: MY(256), x2: lerp(x - 6, x + w + 6, o.req), y2: MY(256), stroke: GOOD, 'stroke-width': 3 }); }
    el('line', { x1: x - 6, y1: MY(o.lim), x2: x + w + 6, y2: MY(o.lim), stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 4' });
    mono(x + w + 14, MY(o.lim) + 5, 'limits ' + Math.round(o.lim) + 'Mi', { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); }
  function s4(t, c) { const { k, u } = c;
    strip(c);
    if (k <= 1) { const ax = axes(110, 80, 600, 270, { x: [0, 10], y: [0, 1024], yt: [0, 256, 512, 1024], yl: '메모리 (Mi)', xl: '시간' });
      el('line', { x1: ax.X(0), y1: ax.Y(512), x2: ax.X(10), y2: ax.Y(512), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 4' });
      mono(ax.X(0) + 10, ax.Y(512) - 10, 'limits 512Mi', { 'font-size': 14, 'font-weight': 700, fill: BAD });
      if (k === 0) { const P = [[0, 120], [3, 512], [3.05, 0], [3.1, 120], [6.1, 512], [6.15, 0], [6.2, 120], [9.2, 512], [9.25, 0]], g = E(u, 0.2, 2.2);
        line(ax, P, g, ACC); [3, 6.1, 9.2].forEach((x, i) => { if (g * 8 >= [1, 4, 7][i]) cross(ax.X(x), ax.Y(512) - 20, 8, pop(u, 0.2 + 2 * [1, 4, 7][i] / 8)); });
        pill(830, 150, 'OOMKilled', BAD, pop(u, 0.9), { mono: true, fs: 14.5 });
        mono(830, 200, 'Exit 137', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
        mono(830, 228, '= 128 + 9', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); tx(830, 254, 'SIGKILL', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
        mono(830, 300, 'Restart Count 8', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) });
        sub(410, 412, '선 모양은 예시', fade(u, 2)); return; }
      mono(270, 72, 'container_memory_working_set_bytes', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      line(ax, [[0, 220], [2, 220], [2.6, 470], [3.2, 220], [10, 230]], E(u, 0.2, 1.2), OFF, { dash: '6 4' });
      line(ax, [[0, 130], [2, 190], [4, 260], [6, 330], [8, 410], [10, 490]], E(u, 1, 2.2), ACC, { sw: 3.2 });
      pill(830, 170, '단발 스파이크', MUT, pop(u, 0.9), { fs: 13.5 }); pill(830, 230, '우상향 = 누수 의심', ACC, pop(u, 2.1), { fs: 13.5 });
      sub(410, 412, '선 모양은 예시', fade(u, 2)); return; }
    if (k === 2) { column({ lim: 512, req: E(u, 0.3, 1) });
      mono(560, 380 - 256 * (260 / 1024) + 5, 'requests 256Mi', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      tx(40, 140, 'requests', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) }); tx(40, 166, '스케줄러가 자리를 잡는 기준', { 'font-size': 14, opacity: fade(u, 0.7) });
      tx(40, 230, 'limits', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); tx(40, 256, '넘으면 OOMKilled', { 'font-size': 14, opacity: fade(u, 1.3) });
      snippet(720, 120, ['requests:', '  memory: 256Mi', '  cpu: 200m'], { fs: 14.5, w: 210, op: fade(u, 1.6) }); return; }
    if (k === 3) { const lim = tween(512, 1024, u, 1.2); column({ lim, req: 1 });
      const ax = axes(690, 110, 230, 220, { x: [0, 10], y: [0, 1024] });
      [512, 1024].forEach((m, i) => el('line', { x1: ax.X(0), y1: ax.Y(m), x2: ax.X(10), y2: ax.Y(m), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: i === 0 ? 0.4 : fade(u, 1.2) }));
      line(ax, [[0, 150], [10, 1024]], E(u, 0.4, 2.2), ACC);
      const t5 = (512 - 150) / (874 / 10); if (u > 0.4 + 1.8 * t5 / 10) { cross(ax.X(t5), ax.Y(512), 7, 1); }
      if (u > 2.2) cross(ax.X(10), ax.Y(1024), 8, pop(u, 2.2));
      tx(805, 100, '누수는 그대로라 나중에 또 죽는다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2) });
      tx(40, 140, '응급 처치', { 'font-size': 16, 'font-weight': 800, fill: WARN }); tx(40, 166, 'limits 512Mi → 1Gi', { 'font-size': 14.5, class: 'mono', opacity: fade(u, 0.3) });
      tx(40, 196, '시간을 버는 조치다', { 'font-size': 14.5, opacity: fade(u, 1) }); return; }
    if (k === 4) { column({ lim: 1024, heap: 768 * E(u, 0.2, 1.2), rest: E(u, 1.3, 1.9) });
      tx(560, MY(768 / 2) + 5, '힙 -Xmx768m', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      tx(560, MY(896) + 18, '힙 밖 256Mi', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      tx(560, MY(896) + 42, '메타스페이스 · 스레드 스택 등', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7) });
      tx(40, 140, 'JVM', { 'font-size': 16, 'font-weight': 800 }); tx(40, 166, '힙 상한을 limit 안쪽에 둔다', { 'font-size': 14.5 });
      mono(40, 200, '768 / 1024 = 75%', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2) }); return; }
    // k5: 힙 덤프
    zone(40, 80, 360, 290, 'Pod web-aa1', { fill: SOFT });
    card(220, 150, 200, 50, { rx: 10, stroke: INK, sw: 2, text: 'JVM (PID 1)', fs: 15 });
    pill(220, 220, 'jcmd 1 GC.heap_dump', ACC, pop(u, 0.3), { mono: true, fs: 13.5 });
    fileIcon(220, 300, '/tmp/h.hprof', ACC, pop(u, 0.8));
    grow(300, 300, 610, 300, E(u, 1.1, 1.7), ACC); pill(455, 270, 'kubectl cp', ACC, pop(u, 1.2), { mono: true, fs: 14 });
    zone(600, 80, 320, 290, '내 PC', { fill: SOFT });
    fileIcon(680, 300, './h.hprof', INK, pop(u, 1.7));
    card(810, 200, 180, 70, { rx: 10, stroke: GOOD, sw: 2.2, text: '힙 분석\n누수 지점 수정', fs: 14.5, s: pop(u, 2.1) }); }

  // 5. Running 인데 Not Ready — readinessProbe 실패
  function s5(t, c) { const { k, u } = c;
    strip(c);
    if (k === 0) { terminal(30, 70, 520, 130, ['$ kubectl get pods', ['NAME      READY  STATUS   RESTARTS  AGE', TO], ['web-aa1   0/1    Running  0         2m', TW]], 1 + 2 * E(u, 0.2, 1.2), { title: 'zsh', fs: 14 });
      card(760, 150, 320, 160, { rx: 14, stroke: INK, sw: 2.2 }); tx(620, 100, 'Pod web-aa1', { 'font-size': 15, 'font-weight': 800 });
      [['STATUS Running', '프로세스가 떠 있다', GOOD], ['READY 0/1', '트래픽 받을 준비가 안 됐다', BAD]].forEach(([a, d, col], i) => { const y = 140 + i * 56, op = fade(u, 0.8 + i * 0.5);
        el('circle', { cx: 630, cy: y - 5, r: 9 * pop(u, 0.8 + i * 0.5), fill: col }); mono(650, y, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); tx(650, y + 22, d, { 'font-size': 13.5, fill: MUT, opacity: op }); });
      tx(480, 300, 'RESTARTS 0이라 재시작 문제도 아니다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { card(470, 190, 220, 110, { rx: 14, stroke: INK, sw: 2.2, text: 'web-aa1\n:8080', fs: 15, mono: true });
      card(830, 190, 150, 60, { rx: 10, stroke: INK, sw: 2, text: 'kubelet', fs: 15 });
      for (let i = 0; i < 3; i++) { const a = 0.2 + i * 0.75; fly(755, 172, 585, 172, seg(u, a, a + 0.35), 'GET /healthz', { mono: true }); fly(585, 212, 755, 212, seg(u, a + 0.38, a + 0.72), '503', { fill: BAD, mono: true }); }
      mono(830, 250, 'periodSeconds 10', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      terminal(30, 290, 900, 100, ['$ kubectl describe pod web-aa1  # Events', ['Warning  Unhealthy  Readiness probe failed: HTTP probe failed with statuscode: 503', TW]], 1 + E(u, 1.4, 2.4), { fs: 14 });
      return; }
    if (k === 2) { person(90, 200, '사용자', {});
      card(320, 200, 170, 60, { rx: 10, stroke: INK, sw: 2.2, text: 'Service web', fs: 15 });
      card(700, 200, 170, 70, { rx: 14, stroke: BAD, sw: 2, text: 'web-aa1\nREADY 0/1', fs: 14, dash: '6 4' });
      for (let i = 0; i < 3; i++) dot([[120, 200], [228, 200]], (u * 0.7 + i / 3) % 1, ACC, 6);
      grow(410, 200, 610, 200, 1, OFF, { dash: '6 5', plain: true }); cross(510, 200, 11, pop(u, 0.8));
      zone(220, 250, 200, 110, 'endpoints', { fill: SOFT });
      mono(240, 300, 'web-aa1 IP', { 'font-size': 14.5, fill: u > 1 ? OFF : INK }); strike(236, 330, 295, E(u, 0.9, 1.4));
      tx(320, 340, '목록이 비었다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
      terminal(540, 270, 390, 110, ['$ kubectl get endpoints web', ['NAME   ENDPOINTS', TO], ['web    <none>', TW]], 1 + 2 * E(u, 1.4, 2.2), { fs: 14 }); return; }
    if (k === 3) { zone(300, 80, 330, 300, '앱 컨테이너 :8080', { fill: SOFT });
      card(465, 160, 260, 64, { rx: 10, stroke: GOOD, sw: 2.2, text: '/healthz\n프로세스가 답하는지만', fs: 14, s: pop(u, 0.2) });
      card(465, 300, 260, 64, { rx: 10, stroke: ACC, sw: 2.5, text: '/readyz\nDB 연결까지 확인', fs: 14, s: pop(u, 0.7) });
      pill(150, 160, 'liveness', GOOD, pop(u, 0.3), { fs: 14 }); pill(150, 300, 'readiness', ACC, pop(u, 0.8), { fs: 14 });
      grow(205, 160, 330, 160, E(u, 0.4, 0.8), MUT); grow(212, 300, 330, 300, E(u, 0.9, 1.3), ACC);
      grow(600, 300, 760, 300, E(u, 1.4, 1.9), ACC); dbIcon(820, 300, 'DB', { s: 0.8, op: fade(u, 1.4) });
      tx(800, 160, '무거운 검사는 readiness에만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2) }); return; }
    if (k === 4) { const X = (s) => 170 + s * 12, warm = 27;
      [['initialDelay 5', 165, [5, 15, 25, 35, 45, 55]], ['initialDelay 30', 305, [30, 40, 50]]].forEach(([name, y, ps], r) => {
        mono(150, y + 5, name, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: r ? ACC : MUT });
        el('line', { x1: X(0), y1: y, x2: X(60), y2: y, stroke: MUT, 'stroke-width': 2 });
        el('rect', { x: X(0), y: y - 34, width: (X(warm) - X(0)) * E(u, 0.2, 0.8), height: 14, rx: 4, fill: WARN, opacity: 0.5 });
        ps.forEach((s, i) => { const a = 0.9 + r * 0.6 + i * 0.18, ok = s > warm; if (u < a) return;
          if (ok) check(X(s), y, 9, pop(u, a)); else cross(X(s), y, 8, pop(u, a)); if (!ok) mono(X(s), y + 28, '503', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 }); }); });
      tx(X(0), 116, 'DB 워밍업 (길이는 예시)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
      [0, 10, 20, 30, 40, 50, 60].forEach((s) => mono(X(s), 372, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      tx(X(60), 220, '워밍업 뒤 첫 검사가 통과', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { const X = (s) => 190 + s * 5.5;
      [['readiness /readyz', 150, 30, 10, ACC, '실패하면 endpoints에서 빠진다 (재시작 없음)'], ['liveness /healthz', 290, 60, 30, GOOD, '실패하면 kubelet이 컨테이너를 재시작한다']].forEach(([name, y, d0, per, col, res], r) => {
        mono(170, y + 5, name, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: col });
        el('line', { x1: X(0), y1: y, x2: X(120), y2: y, stroke: MUT, 'stroke-width': 2 });
        for (let s = d0, i = 0; s <= 120; s += per, i++) el('circle', { cx: X(s), cy: y, r: 7 * pop(u, 0.3 + r * 0.6 + i * 0.08), fill: col });
        tx(X(0), y + 40, res, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4 + r * 0.4) }); });
      [0, 30, 60, 90, 120].forEach((s) => mono(X(s), 390, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      return; }
    // k6: 다섯 증상 갈림길
    card(120, 235, 180, 70, { rx: 12, stroke: INK, sw: 2.5, text: 'kubectl get pods\nSTATUS 보기', fs: 14.5 });
    [['Pending', 'Events: FailedScheduling'], ['ImagePullBackOff', 'Events: Failed to pull'], ['CrashLoopBackOff', 'logs --previous'], ['OOMKilled', 'Last State · Exit 137'], ['Running · 0/1', 'Readiness probe failed']].forEach(([a, h], i) => {
      const y = 95 + i * 72, g = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3);
      el('path', { d: `M210,235 C280,235 280,${y} ${lerp(210, 345, g)},${lerp(235, y, g)}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2 });
      card(460, y, 230, 48, { rx: 10, stroke: ACC, sw: 2, text: a, fs: 14.5, mono: true, s: pop(u, 0.5 + i * 0.3) });
      mono(600, y + 5, h, { 'font-size': 14, fill: INK, opacity: fade(u, 0.7 + i * 0.3) }); }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'describe에 "0/3 nodes are available: 3 Insufficient memory"가 찍혔다. 스케줄러가 자리를 따질 때 보는 값은 무엇인가?',
      o: ['노드의 실제 메모리 사용량', '노드에 이미 잡힌 requests 합', '컨테이너들의 limits 합'], a: 1,
      why: '스케줄러는 requests 합으로 자리를 본다. node-1은 8Gi 중 7.2Gi가 이미 잡혀 있어 새 Pod의 requests가 들어가지 못했다.' },
    { q: 'describe가 "manifest unknown"을 알려 줄 때 먼저 의심할 것은 무엇인가?',
      o: ['그 이미지 태그가 레지스트리에 없다', '레지스트리 인증 secret이 만료됐다', '노드의 디스크가 찼다'], a: 0,
      why: 'manifest unknown은 NotFound다. 이 장에서는 myapp:v1.5의 v 한 글자가 오타였고 myapp:1.5는 받아졌다.' },
    { q: '재시작을 반복하는 컨테이너가 죽기 직전에 남긴 출력을 보는 명령은 무엇인가?',
      o: ['kubectl logs web-aa1', 'kubectl get events', 'kubectl logs --previous web-aa1'], a: 2,
      why: '지금 컨테이너는 막 다시 떠서 로그가 비어 있다. --previous가 이전 컨테이너의 KeyError DB_URL을 보여 준다.' },
    { q: 'describe의 Last State에 Exit Code 137이 찍혔다. 이것이 뜻하는 것은 무엇인가?',
      o: ['앱이 에러를 내고 스스로 끝났다', '128+9, SIGKILL로 강제 종료됐다', '이미지를 받지 못했다'], a: 1,
      why: '137은 128에 SIGKILL 번호 9를 더한 값이다. Reason이 OOMKilled면 limits를 넘어 커널이 죽인 것이다.' },
    { q: 'readinessProbe가 계속 실패하는 Pod에는 무슨 일이 일어나는가?',
      o: ['Service endpoints에서 빠져 트래픽을 받지 못한다', 'kubelet이 컨테이너를 재시작한다', 'STATUS가 Pending으로 바뀐다'], a: 0,
      why: 'readiness 실패는 재시작이 아니라 endpoints에서 빼는 것이다. 그래서 STATUS는 Running인데 READY가 0/1로 남는다.' },
  ];

  const summary = [
    'Pod가 이상하면 get pods로 STATUS를 보고 describe의 Events에서 단서를 찾는다.',
    'Pending은 requests가 노드에 안 들어간 것이고, ImagePullBackOff는 태그나 인증 문제다.',
    'CrashLoopBackOff는 logs --previous로, OOMKilled는 Exit 137과 limits로 원인을 좁힌다.',
    'Running인데 READY가 0/1이면 readinessProbe가 실패해 endpoints에서 빠진 상태다.',
  ];
  const review = [
    { q: 'limits.memory를 512Mi에서 1Gi로 올렸더니 OOMKilled가 한동안 멈췄다가 다시 났다. 다음에 할 일은?',
      o: ['limits를 한 번 더 올린다', '힙 덤프를 받아 누수 지점을 고친다', 'requests를 지운다'], a: 1,
      why: 'working set이 우상향이면 누수라서 limits 상향은 시간만 번다. jcmd로 힙 덤프를 받아 원인을 고쳐야 멈춘다.' },
    { q: '배포 뒤 새 Pod가 Pending에 머물고 Events에 Insufficient memory가 찍힌다. 손볼 곳으로 맞는 것은?',
      o: ['readinessProbe의 initialDelaySeconds', 'Pod spec의 imagePullSecrets', 'Pod의 requests나 노드 수'], a: 2,
      why: '스케줄러는 노드에 잡힌 requests 합으로 자리를 본다. requests를 낮추거나 replicas를 줄이거나 노드를 더해야 들어간다.' },
    { q: 'readiness와 liveness가 둘 다 DB 연결까지 확인하는 무거운 검사를 쓴다. DB가 느려지면 생길 수 있는 일은?',
      o: ['liveness도 실패해 컨테이너가 계속 재시작된다', 'Pod가 Pending 상태로 돌아간다', '노드가 이미지를 다시 받는다'], a: 0,
      why: 'liveness 실패는 재시작으로 이어진다. 그래서 liveness는 /healthz처럼 가볍게 두고 무거운 검사는 readiness에만 넣는다.' },
  ];

  R.page({ title: 'Pod 응급실 진단', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
