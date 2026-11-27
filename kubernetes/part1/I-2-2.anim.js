/* I-2-2 선언적 매니페스트 (YAML) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, dbIcon, server, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 위 오른쪽 계기: desired / actual / diff (앞 beat 값에서 이어서)
  const act = (b) => (b && b.dataState ? b.dataState.actualPods.length : 0);
  function counters(c, o) { o = o || {}; const a = tween(c.prev ? act(c.prev) : 0, act(c.beat), c.u), d = 1 - a, x = o.x || 640;
    [['desired', '1', INFO], ['actual', String(Math.round(a)), Math.round(a) ? GOOD : BAD], ['diff', Math.round(d) ? '+1' : '0', Math.round(d) ? WARN : GOOD]].forEach(([n, v, col], i) => {
      const cx = x + i * 104; card(cx, 46, 94, 60, { rx: 10, stroke: col, sw: 2 });
      tx(cx, 34, n, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      mono(cx, 64, v, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: col }); }); }
  // 주문서(매니페스트) 종이: lines 는 [글, 색?], n 줄까지 (소수면 마지막 줄을 타이핑)
  function paper(x, y, w, h, lines, n, o) { o = o || {};
    el('path', { d: `M${x},${y} h${w - 26} l26,26 v${h - 26} h${-w} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
    el('path', { d: `M${x + w - 26},${y} v26 h26`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 2 });
    mono(x + 14, y + 22, o.title || 'pod.yaml', { 'font-size': 13.5, 'font-weight': 800, fill: MUT });
    lines.slice(0, Math.ceil(n)).forEach((ln, i) => { const [s, col] = Array.isArray(ln) ? ln : [ln], last = i === Math.ceil(n) - 1 && n % 1;
      mono(x + 14, y + 48 + i * 21, last ? s.slice(0, Math.round(s.length * (n % 1))) : s, { 'font-size': 14, fill: col || INK, 'font-weight': col ? 700 : 400 }); }); }
  const YAML = ['apiVersion: v1', 'kind: Pod', 'metadata:', '  name: web', '  labels: {app: web}', 'spec:', '  containers:', '  - image: nginx:1.25', '    ports: [80]', '    requests: 100m/128Mi', '    limits: 500m/512Mi'];
  // 클러스터 쪽 기호들
  const API = [470, 220], ETCD = [470, 360];
  function apiBox(hot, s) { card(API[0], API[1], 150, 50, { rx: 10, text: 'kube-apiserver', fs: 14.5, fw: 800, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, color: hot ? ACC : INK, s }); }
  function etcdIcon(hot, s) { dbIcon(ETCD[0], ETCD[1] - 10, null, { s: (s ?? 1) * 0.55, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL }); tx(ETCD[0] + 40, ETCD[1] - 4, 'etcd', { 'font-size': 15, 'font-weight': 800, fill: hot ? ACC : INK }); }
  // worker-1 과 그 안의 Pod
  function worker(x, y, o) { o = o || {}; el('rect', { x, y, width: 250, height: 200, rx: 14, fill: PANEL, stroke: o.hot ? ACC : GRID, 'stroke-width': o.hot ? 3 : 2 });
    mono(x + 14, y + 24, 'worker-1', { 'font-size': 15, 'font-weight': 800 }); }
  function podShell(cx, cy, o) { o = o || {}; el('rect', { x: cx - 80, y: cy - 50, width: 160, height: 100, rx: 16, fill: o.fill || INFOBG, stroke: INFO, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    mono(cx - 68, cy - 30, 'Pod web', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: o.op ?? 1 }); }
  function ctrBox(cx, cy, st, o) { o = o || {}; const col = st === 'run' ? GOOD : st === 'dead' ? BAD : MUT;
    card(cx, cy, 120, 40, { rx: 8, text: 'nginx', fs: 15, fw: 800, mono: true, stroke: col, color: col, fill: st === 'run' ? GOODBG : st === 'dead' ? BADBG : PANEL, dash: st === 'wait' ? '5 4' : null, s: o.s, op: o.op }); }

  // 1. YAML 작성
  function s1(t, c) { const { k, u } = c, upto = [2, 5, 9, 11, 11][k], from = [0, 2, 5, 9, 11][k];
    paper(40, 30, 330, 290, YAML.map((s, i) => [s, i >= from && i < upto && k < 4 ? ACC : null]), k < 4 ? lerp(from, upto, E(u, 0.2, 1.8)) : 11);
    counters(c, { x: 620 });
    if (k === 0) { pill(600, 170, 'kind = Pod', ACC, pop(u, 1.4), { fs: 16 }); sub(600, 210, 'apiVersion v1 = 코어 API', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 1) { ['app: web', 'tier: frontend'].forEach((s, i) => { const x = 500 + i * 190, a = pop(u, 1.2 + i * 0.4);
        el('path', { d: `M${x - 60},150 h136 l16,16 l-16,16 h-136 Z`, fill: INFOBG, stroke: INFO, 'stroke-width': 2, transform: `translate(${x} 166) scale(${a}) translate(${-x} -166)` });
        mono(x - 48, 172, s, { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3 + i * 0.4) }); });
      sub(600, 230, 'Service·Deployment가 고를 손잡이', fade(u, 2), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 2) { card(620, 200, 200, 90, { rx: 12, text: 'nginx:1.25\n:80', fs: 17, fw: 800, mono: true, stroke: ACC, s: pop(u, 1.2) }); sub(620, 270, '"무엇이 있어야 하나"만 적는다', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 3) { [['CPU', 100, 500, 'm'], ['MEM', 128, 512, 'Mi']].forEach(([n, rq, lm, un], i) => { const y = 150 + i * 90, X = (v) => 500 + v / lm * 380, g = E(u, 0.4 + i * 0.4, 1.2 + i * 0.4);
        tx(440, y + 14, n, { 'font-size': 15, 'font-weight': 800 }); el('rect', { x: 500, y, width: 380, height: 22, rx: 5, fill: SOFT });
        el('rect', { x: 500, y, width: (X(rq) - 500) * g, height: 22, rx: 5, fill: ACC });
        el('line', { x1: X(lm), y1: y - 8, x2: X(lm), y2: y + 30, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.2 + i * 0.4) });
        mono(X(rq) + 6, y + 44, 'requests ' + rq + un, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: g });
        mono(X(lm), y + 44, 'limits ' + lm + un, { 'font-size': 13.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.3 + i * 0.4) }); });
      sub(690, 360, 'requests = 배치 기준, limits = 넘으면 제한·OOM', fade(u, 2.1), { 'font-size': 14.5, 'font-weight': 700 }); }
    if (k === 4) { el('rect', { x: 450, y: 130, width: 470, height: 230, rx: 16, fill: SOFT, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 0.2) });
      tx(470, 158, '클러스터', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      [560, 690, 820].forEach((x, i) => { tx(x, 260, '?', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: OFF, opacity: fade(u, 0.6 + i * 0.3) }); });
      sub(685, 330, '파일은 아직 내 노트북에만 있다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700 }); } }

  // 2. kubectl apply → apiserver
  function s2(t, c) { const { k, u } = c, L = [130, 220];
    counters(c);
    el('rect', { x: 40, y: 150, width: 180, height: 120, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); el('path', { d: 'M20,280 H240 L228,294 H32 Z', fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
    tx(130, 322, '내 노트북', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
    const G0 = 560; apiBox(k >= 1, 1);
    if (k === 0) { const a = E(u, 0.4, 1.6); mono(L[0], 196, a < 0.5 ? 'kind: Pod' : '{"kind":"Pod"}', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: a < 0.5 ? INK : ACC });
      mono(L[0], 226, a < 0.5 ? 'YAML' : 'JSON', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      lock(300, 120, true, WARN, pop(u, 1.6)); mono(322, 126, '~/.kube/config', { 'font-size': 14, fill: WARN, opacity: fade(u, 1.7) }); mono(322, 148, '주소 + 토큰', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9) }); }
    if (k >= 1) mono(L[0], 210, '{"kind":"Pod"}', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
    if (k === 1) { grow(230, 220, API[0] - 80, 220, E(u, 0.2, 0.9), MUT);
      fly(200, 170, 300, 160, seg(u, 0.6, 1.9), 'POST …/namespaces/default/pods', { mono: true, stay: true });
      pill(300, 270, 'Authorization: Bearer …', WARN, pop(u, 1.6), { mono: true, fs: 13.5 }); }
    if (k === 2) { const G = ['인증', '인가', 'Mutating', '스키마', 'Validating'];
      G.forEach((g, i) => { const x = 580 + i * 76, pass = u > 0.4 + i * 0.4;
        el('rect', { x: x - 30, y: 130, width: 60, height: 150, rx: 8, fill: pass ? GOODBG : SOFT, stroke: pass ? GOOD : GRID, 'stroke-width': 2 });
        tx(x, 300, g, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: pass ? GOOD : MUT });
        tx(x, 120, String(i + 1), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, class: 'mono', fill: MUT });
        if (pass) check(x, 205, 11, pop(u, 0.4 + i * 0.4)); });
      dot([[API[0] + 75, 205], [940, 205]], seg(u, 0.2, 2.4), ACC, 8);
      sub(720, 350, 'RBAC pods:create · OpenAPI 스키마 통과', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700 }); }
    if (k === 3) { fly(API[0] - 80, 250, 240, 250, seg(u, 0.2, 1.2), '201 Created', { fill: GOOD, stay: true });
      el('rect', { x: 600, y: 150, width: 330, height: 60, rx: 8, fill: INK, opacity: fade(u, 1.2) }); mono(616, 186, 'pod/web created', { 'font-size': 16, fill: PANEL, 'font-weight': 700, opacity: fade(u, 1.3) });
      sub(765, 250, '"저장해도 된다" ≠ "컨테이너가 떴다"', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: WARN }); } }

  // 3. etcd 저장
  function s3(t, c) { const { k, u } = c;
    counters(c); apiBox(k === 0 || k === 4, 1);
    const E3 = [[250, 330], [470, 360], [690, 330]];
    if (k === 1) E3.forEach(([x, y], i) => { const dead = i === 2 && u > 1.6; dbIcon(x, y - 10, null, { s: 0.5 * (i === 1 ? 1 : pop(u, 0.2 + i * 0.1)), stroke: dead ? BAD : ACC, fill: dead ? PANEL : ACCBG }); if (dead) cross(x, y - 10, 14, pop(u, 1.6));
        if (i !== 1) dot([[470, 350], [x, y - 10]], seg(u, 0.6, 1.3), ACC, 6); });
    else etcdIcon(k <= 1, 1);
    if (k === 1) { sub(470, 410, '3대 중 2대가 같은 값을 들고 있으면 남는다', fade(u, 1.9), { 'font-size': 14.5, 'font-weight': 700 }); }
    // etcd 키와 객체
    const kx = 90, ky = 80;
    if (k === 0) { dot([[API[0], API[1] + 25], [ETCD[0], ETCD[1] - 40]], seg(u, 0.2, 0.9), ACC, 7);
      el('rect', { x: 600, y: 330, width: 340 * E(u, 1.0, 1.8), height: 40, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      if (u > 1.8) mono(614, 356, '/registry/pods/default/web', { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); }
    if (k >= 2 && k <= 3) { el('rect', { x: 600, y: 110, width: 330, height: k === 3 ? 220 : 180, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
      const rows = [['name', 'web', INK], ['uid', '8a9c7e1f-…', ACC], ['resourceVersion', '12345', ACC]];
      rows.forEach(([a, b, col], i) => { const y = 145 + i * 40, op = i === 0 || k === 3 ? 1 : fade(u, 0.4 + i * 0.5);
        mono(616, y, a, { 'font-size': 14, fill: MUT, opacity: op }); mono(916, y, b, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: op }); });
      if (k === 3) { mono(616, 300, 'status.phase', { 'font-size': 14, fill: MUT }); pill(860, 296, 'Pending', WARN, pop(u, 0.4), { fs: 14.5 }); }
      if (k === 2) sub(765, 320, '내가 쓰지 않은 필드가 붙는다', fade(u, 1.8), { 'font-size': 14.5, 'font-weight': 700 }); }
    if (k === 4) { const r = 40 + ((u * 120) % 160);
      el('circle', { cx: API[0], cy: API[1], r, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: 1 - (r - 40) / 160 });
      card(170, 110, 160, 50, { rx: 10, text: 'kube-scheduler', fs: 14.5, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.8) });
      card(800, 110, 160, 50, { rx: 10, text: 'kubelet', fs: 14.5, fw: 800, mono: true, stroke: GRID, color: MUT, op: fade(u, 0.8) });
      dot([[API[0] - 70, API[1] - 10], [250, 130]], seg(u, 0.3, 1.0), ACC, 7);
      pill(170, 172, 'Pod web ADDED', ACC, pop(u, 1.1), { mono: true, fs: 13.5 });
      sub(800, 160, '배정되기 전이라 조용', fade(u, 1.5), { 'font-size': 14.5 }); } }

  // 4. reconcile: scheduler 와 kubelet
  function s4(t, c) { const { k, u } = c;
    counters(c);
    card(150, 140, 160, 50, { rx: 10, text: 'kube-scheduler', fs: 14.5, fw: 800, stroke: k <= 1 ? ACC : GRID, fill: k <= 1 ? ACCBG : PANEL, color: k <= 1 ? ACC : MUT });
    worker(660, 160, { hot: k === 2 });
    card(785, 210, 110, 34, { rx: 8, text: 'kubelet', fs: 14.5, fw: 800, mono: true, stroke: k === 2 ? ACC : GRID, color: k === 2 ? ACC : INK });
    if (k === 0) { card(150, 240, 200, 70, { rx: 10, text: 'Pod web\nnodeName: ""', fs: 14, mono: true, stroke: WARN, color: WARN, dash: '5 4', s: pop(u, 0.4) });
      sub(150, 300, '배정돼야 하는데 안 됐다', fade(u, 1.2), { 'font-weight': 700, 'font-size': 14.5 });
      sub(470, 260, '맨 Pod는 controller-manager가', fade(u, 1.8), { 'font-size': 14.5 }); sub(470, 282, '맡지 않는다', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 1) { const S = [['worker-1', 92], ['worker-2', 78], ['worker-3', 65]];
      S.forEach(([n, v], i) => { const y = 220 + i * 46, g = E(u, 0.3 + i * 0.2, 1.1 + i * 0.2);
        mono(60, y + 15, n, { 'font-size': 14.5, 'font-weight': 700 }); el('rect', { x: 150, y, width: 300, height: 22, rx: 5, fill: SOFT });
        el('rect', { x: 150, y, width: 300 * v / 100 * g, height: 22, rx: 5, fill: i === 0 ? ACC : OFF }); mono(460, y + 16, String(v), { 'font-size': 14.5, 'font-weight': 800, opacity: g, fill: i === 0 ? ACC : INK }); });
      sub(255, 370, 'Filter → Score (점수는 예시)', fade(u, 0.4), { 'font-size': 14 });
      dot([[460, 230], [660, 230]], seg(u, 1.7, 2.4), ACC, 7); pill(560, 196, 'Binding', ACC, pop(u, 1.8), { fs: 14 }); }
    const P = [785, 300];
    if (k >= 2) { podShell(P[0], P[1]);
      if (k === 2) { ['pull', 'pause', 'start'].forEach((s, i) => pill(370 + i * 100, 300, s, i === 2 ? GOOD : INK, pop(u, 0.3 + i * 0.5), { mono: true, fs: 14 }));
        [0, 1].forEach((i) => grow(410 + i * 100, 300, 430 + i * 100, 300, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), MUT));
        sub(470, 350, '이미지 nginx:1.25 · 네트워크 준비 · 시작', fade(u, 1.6), { 'font-size': 14 }); }
      ctrBox(P[0], P[1] + 12, k === 2 && u < 1.6 ? 'wait' : 'run', { s: k === 2 ? 1 : 1 }); }
    if (k === 3) { dot([[P[0], P[1] - 50], [470, 100], [150, 100]], seg(u, 0.2, 1.4), GOOD, 7);
      card(300, 250, 260, 92, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.2) });
      mono(190, 238, 'phase', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) }); mono(410, 238, u < 1.8 ? 'Pending' : 'Running', { 'font-size': 15, 'font-weight': 800, fill: u < 1.8 ? WARN : GOOD, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      mono(190, 272, 'podIP', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); mono(410, 272, '10.244.1.5', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.5) }); }
    if (k === 4) { banner(400, 260, 'desired 1 = actual 1 · in sync', pop(u, 0.4)); sub(400, 310, 'scheduler·kubelet은 다음 변화까지 대기', fade(u, 1.2), { 'font-size': 14.5 }); } }

  // 5. 컨테이너가 죽으면
  function s5(t, c) { const { k, u } = c, P = [600, 250];
    counters(c);
    if (k <= 2) { worker(470, 130, { hot: k === 1 }); podShell(P[0], P[1]);
      card(720, 168, 100, 30, { rx: 8, text: 'kubelet', fs: 14, fw: 800, mono: true, stroke: k === 1 ? ACC : GRID, color: k === 1 ? ACC : INK }); }
    if (k === 0) { const m = lerp(300, 560, E(u, 0.2, 1.6)), X = (v) => 70 + v / 600 * 330, dead = m >= 512;
      tx(70, 170, '메모리 사용', { 'font-size': 14.5, 'font-weight': 700 }); el('rect', { x: 70, y: 185, width: 330, height: 24, rx: 5, fill: SOFT });
      el('rect', { x: 70, y: 185, width: X(m) - 70, height: 24, rx: 5, fill: dead ? BAD : ACC });
      el('line', { x1: X(512), y1: 175, x2: X(512), y2: 218, stroke: BAD, 'stroke-width': 3 }); mono(X(512), 238, 'limit 512Mi', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
      ctrBox(P[0], P[1] + 12, dead ? 'dead' : 'run'); if (dead) { cross(P[0] + 70, P[1] - 4, 10, pop(u, 1.6)); mono(235, 290, 'OOMKilled (137)', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
      sub(P[0], 380, 'Pod 객체는 그대로 남는다', fade(u, 2.1), { 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 1) { ctrBox(P[0], P[1] + 12, 'dead', { op: 0.6 });
      tx(70, 170, 'restartPolicy: Always (기본값)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      const T = [10, 20, 40, 80, 160, 300], X = (v) => 80 + Math.log2(v / 5) / Math.log2(60) * 320;
      el('line', { x1: 70, y1: 240, x2: 420, y2: 240, stroke: GRID, 'stroke-width': 3 });
      T.forEach((v, i) => { const op = fade(u, 0.5 + i * 0.25); el('circle', { cx: X(v), cy: 240, r: 6, fill: WARN, opacity: op }); mono(X(v), 266, v === 300 ? '5분' : v + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); });
      tx(70, 215, '재시작 대기 (두 배씩)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      dot([[720, 184], [P[0] + 60, P[1] + 12]], seg(u, 1.8, 2.5), ACC, 7); }
    if (k === 2) { ctrBox(P[0], P[1] + 12, 'run', { s: 1 + R.bump(u, 0.4) });
      el('rect', { x: 60, y: 160, width: 370, height: 70, rx: 8, fill: INK }); mono(74, 186, 'NAME RESTARTS     AGE', { 'font-size': 14, fill: OFF });
      mono(74, 212, 'web  ' + (u < 0.8 ? '0           ' : '1 (5s ago)  ') + '12m', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700 });
      sub(245, 262, 'scheduler는 할 일 없음 · 같은 노드, 같은 Pod', fade(u, 1.2), { 'font-size': 14, 'font-weight': 700 });
      sub(245, 288, 'AGE 그대로 = 새 Pod가 아니다', fade(u, 1.8), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
    if (k === 3) { const N = [['desired', 'rs.spec.replicas'], ['actual', 'count_pods(selector)'], ['diff', 'desired - actual'], ['생성 / 삭제', 'create · delete_pods']], cx = 330, cy = 250, r = 120;
      N.forEach(([a, b], i) => { const ang = -Math.PI / 2 + i * Math.PI / 2, x = cx + Math.cos(ang) * r * 1.45, y = cy + Math.sin(ang) * r * 0.82, s = pop(u, 0.2 + i * 0.3);
        card(x, y, 190, 52, { rx: 10, stroke: ACC, sw: 2, s }); tx(x, y - 4, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
        mono(x, y + 16, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      const route = [0, 1, 2, 3, 4].map((i) => { const ang = -Math.PI / 2 + i * Math.PI / 2; return [cx + Math.cos(ang) * r * 0.9, cy + Math.sin(ang) * r * 0.55]; });
      if (u > 1.4) dot(route, ((t * 0.5) % 1), ACC, 7);
      tx(cx, cy + 5, 'ReplicaSet 컨트롤러', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      card(780, 250, 250, 110, { rx: 12, stroke: BAD, sw: 2, dash: '6 5', s: pop(u, 1.6) });
      tx(670, 236, '맨 Pod (kind: Pod)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.7) }); tx(670, 262, '지워지거나 노드가 죽으면', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); tx(670, 284, '돌아오지 않는다', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) }); }
    if (k === 4) { const ax = axes(110, 140, 760, 200, { x: [0, 10], y: [0, 1.4], yt: [0, 1], xl: '시간', yl: '개수' });
      line(ax, [[0, 1], [10, 1]], E(u, 0.2, 1.4), INFO, { sw: 3 });
      line(ax, [[0, 0], [1.5, 0], [1.5, 1], [4, 1], [4, 0], [5, 0], [5, 1], [7.5, 1], [7.5, 0], [8.2, 0], [8.2, 1], [10, 1]].map(([a, b]) => [a, b === 1 ? 0.96 : b]), E(u, 0.6, 2.4), GOOD, { sw: 3 });
      tx(ax.X(10), ax.Y(1) - 14, 'desired (etcd에 남음)', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1) });
      tx(ax.X(6.25), ax.Y(0.5), 'actual (흔들림)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      banner(480, 395, '루프가 둘의 차이를 계속 메운다', pop(u, 2.2)); } }

  const quiz = [
    { q: 'pod.yaml을 다 적었지만 아직 apply하지 않았다. 지금 이 diff +1을 아는 쪽은 어디인가?',
      o: ['클러스터의 어떤 컴포넌트도 모른다', 'etcd가 이미 Pending으로 들고 있다', 'scheduler가 노드를 고르는 중이다'], a: 0,
      why: '파일은 노트북에만 있다. apply로 apiserver에 보내 etcd에 저장되기 전까지 클러스터는 이 desired를 모른다.' },
    { q: 'kubectl apply 뒤 "pod/web created"가 뜻하는 것은 무엇인가?',
      o: ['nginx 컨테이너가 Running이 됐다', 'worker-1에 배치가 끝났다', '인증·인가·admission·스키마 관문을 통과해 저장될 자격을 얻었다'], a: 2,
      why: '201 Created는 객체가 받아들여졌다는 응답이다. 배치와 실행은 그 뒤에 따로 일어난다.' },
    { q: 'etcd에 Pod web이 저장된 순간 status.phase는 무엇인가?',
      o: ['Pending', 'Running', 'Succeeded'], a: 0,
      why: '아직 노드도 정해지지 않았고 컨테이너도 없다. 기록만 생긴 상태라 Pending이다.' },
    { q: '맨 Pod(kind: Pod)를 apply했을 때 nodeName이 빈 Pod를 보고 노드를 정하는 것은 누구인가?',
      o: ['controller-manager의 ReplicaSet 컨트롤러', 'kube-scheduler', 'worker-1의 kubelet'], a: 1,
      why: '맨 Pod에는 개수를 지키는 컨트롤러가 없다. scheduler가 Filter·Score로 worker-1을 정하고, 그 뒤 kubelet이 띄운다.' },
    { q: 'nginx가 limits 512Mi를 넘어 OOMKilled됐다. 맨 Pod에서 이어서 일어나는 일은 무엇인가?',
      o: ['scheduler가 새 노드를 골라 새 Pod를 만든다', 'Pod 객체가 지워지고 다시 생기지 않는다', 'kubelet이 같은 Pod 안에서 컨테이너를 다시 띄우고 RESTARTS가 1이 된다'], a: 2,
      why: 'restartPolicy 기본값 Always라 kubelet이 그 자리에서 재시작한다. AGE가 그대로인 것이 같은 Pod라는 증거다.' },
  ];

  const summary = [
    'YAML에는 무엇이 있어야 하는지만 적고, 파일만으로는 클러스터가 아무것도 모른다.',
    'apply하면 apiserver가 인증과 admission을 거쳐 etcd에 저장하고, 이때는 아직 Pending이다.',
    'scheduler가 노드를 정하고 그 노드의 kubelet이 컨테이너를 띄워 actual을 desired에 맞춘다.',
    '컨테이너가 죽으면 kubelet이 같은 Pod에서 다시 띄우지만, Pod가 사라지면 맨 Pod는 돌아오지 않는다.',
  ];
  const review = [
    { q: 'apply가 created로 끝났는데 몇 분째 Pending이다. 가장 먼저 의심할 것은?',
      o: ['etcd에 저장이 안 됐다', 'requests를 감당할 노드가 없어 scheduler가 배정을 못 했다', 'kubectl의 토큰이 틀렸다'], a: 1,
      why: 'created면 저장까지는 끝났다. Pending에 머무는 흔한 이유는 Filter 단계에서 requests를 받아 줄 노드가 없는 경우다.' },
    { q: '맨 Pod로 띄운 web이 있던 노드가 통째로 꺼졌다. 다시 떠 있게 하려면 어떻게 띄웠어야 했나?',
      o: ['Deployment로 띄워 ReplicaSet이 개수를 지키게 한다', 'restartPolicy를 Always로 바꾼다', 'limits를 더 크게 잡는다'], a: 0,
      why: 'restartPolicy는 같은 Pod 안 컨테이너 재시작만 다룬다. Pod 자체를 다시 만드는 것은 ReplicaSet 컨트롤러의 루프다.' },
    { q: 'kubectl get pod에서 RESTARTS가 계속 늘고 AGE는 그대로다. 이 장면으로 알 수 있는 것은?',
      o: ['scheduler가 매번 다른 노드로 옮기고 있다', '매번 새 Pod 객체가 만들어지고 있다', '같은 Pod 안에서 컨테이너가 죽고 kubelet이 다시 띄우고 있다'], a: 2,
      why: 'AGE가 그대로면 Pod 객체는 같다. OOMKilled 같은 이유로 컨테이너만 반복 재시작되는 중이니 limits와 로그를 본다.' },
  ];

  R.page({ title: 'desired와 actual', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
