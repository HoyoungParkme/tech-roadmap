/* II-2-1 StatefulSet — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 좌석(0·1·2)마다 DNS · Pod · PVC 를 세로로 놓는다. 상태는 각 beat 의 dataState 에서 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, terminal, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const SX = [230, 430, 630], Y = { dns: 92, pod: 168, pvc: 268, dep: 382 };
  const ST = { none: [OFF, PANEL, '빈 좌석'], creating: [WARN, WARNBG, 'Creating'], running: [GOOD, GOODBG, 'Running'], terminating: [BAD, BADBG, 'Terminating'], recovering: [WARN, WARNBG, '다시 만드는 중'] };
  function heads(op) { [['DNS', Y.dns], ['Pod', Y.pod], ['PVC', Y.pvc]].forEach(([s, y]) => tx(34, y + 5, s, { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: op ?? 1 })); }
  // 좌석 하나의 Pod
  function seat(i, st, o) { o = o || {}; const [col, bg, word] = ST[st] || ST.none, x = SX[i];
    const g = card(x, Y.pod, 156, 62, { rx: 12, stroke: col, fill: bg, sw: st === 'none' ? 1.8 : 2.4, dash: st === 'none' || st === 'recovering' || st === 'creating' ? '6 4' : null, s: o.s, op: o.op });
    mono(0, -4, 'app-' + i, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: st === 'none' ? MUT : INK }, g);
    tx(0, 18, o.word || word, { 'font-size': 13.5, 'font-weight': 600, 'text-anchor': 'middle', fill: col }, g); }
  // PVC 원통 + 이름 (bound 면 채운다)
  function pvc(i, bound, o) { o = o || {}; const x = SX[i], col = bound ? ACC : OFF;
    dbIcon(x, Y.pvc, null, { s: 0.62 * (o.s ?? 1), stroke: col, fill: bound ? ACCBG : PANEL, op: o.op });
    mono(x, Y.pvc + 50, 'data-app-' + i, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: bound ? INK : MUT, opacity: o.op ?? 1 });
    if (bound) mono(x, Y.pvc + 68, o.pv || '10Gi · Bound', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: o.op ?? 1 });
    if (bound && o.mount !== 0) grow(x, Y.pod + 31, x, Y.pvc - 30, o.mount ?? 1, ACC, { plain: true, sw: 3 }); }
  const dns = (i, s, col) => pill(SX[i], Y.dns, `app-${i}.app-headless`, col || INFO, s, { mono: true, fs: 13.5, fill: PANEL });
  function depRow(names, o) { o = o || {}; tx(34, Y.dep - 4, 'Deployment', { 'font-size': 14, 'font-weight': 800, fill: MUT }); tx(34, Y.dep + 14, '였다면', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    names.forEach((n, i) => { if (n === 'none') return; const hot = o.hot === i; card(SX[i], Y.dep, 150, 34, { rx: 8, stroke: hot ? BAD : GRID, fill: hot ? BADBG : SOFT, text: n, fs: 14, mono: true, color: hot ? BAD : MUT, s: o.s ? o.s(i) : 1 }); }); }
  // 데이터에 따라 세 좌석을 그린다 (o.pod/o.pvc/o.dns 로 좌석별 등장 조절)
  function seats(b, o) { o = o || {}; const d = b.dataState;
    d.pods.forEach((q, i) => { seat(i, q.status, { s: o.podS ? o.podS(i) : 1, word: o.word && o.word(i) });
      if (q.pvc !== 'none') pvc(i, true, { s: o.pvcS ? o.pvcS(i) : 1, mount: o.mount ? o.mount(i) : 1, pv: o.pv && o.pv(i) });
      else if (o.ghostPvc) pvc(i, false, { op: o.ghostPvc(i) });
      if (o.dns && o.dns(i)) dns(i, o.dns(i)); });
    depRow(d.deployment, { s: o.depS, hot: o.depHot }); heads(); }
  const RX = 738;   // 오른쪽 설명 칸 x

  // ---------- 1. 매니페스트 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { card(430, 168, 300, 90, { rx: 14, stroke: ACC, fill: ACCBG, sw: 2.6, s: pop(u, 0.3) });
      tx(430, 160, 'kind: StatefulSet', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5), class: 'mono' });
      mono(430, 190, 'name: app', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      pill(430, 264, 'Deployment가 아니다', BAD, pop(u, 1.4), { fs: 14 }); return; }
    heads(fade(u, 0.1));
    for (let i = 0; i < 3; i++) seat(i, 'none', { s: k === 1 ? pop(u, 0.3 + i * 0.3) : 1, word: k >= 2 ? 'postgres:16' : '빈 좌석' });
    if (k === 1) pill(430, Y.dns, 'Service app-headless  (clusterIP: None)', INFO, pop(u, 1.3), { mono: true, fs: 13.5 });
    if (k === 2) { tx(RX, 140, 'template', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      mono(RX, 168, 'image postgres:16', { 'font-size': 14, opacity: fade(u, 0.5) }); mono(RX, 190, 'port 5432', { 'font-size': 14, opacity: fade(u, 0.7) });
      mono(RX, 222, 'mount', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) }); mono(RX, 242, '/var/lib/', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) }); mono(RX, 262, '  postgresql/data', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) }); }
    if (k >= 3) for (let i = 0; i < 3; i++) pvc(i, false, { s: k === 3 ? pop(u, 0.4 + i * 0.35) : 1 });
    if (k === 3) { tx(RX, 250, 'volumeClaimTemplates', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      mono(RX, 274, '좌석 하나에 PVC 하나', { 'font-size': 14, opacity: fade(u, 0.5) }); mono(RX, 296, '10Gi · ReadWriteOnce', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.8) }); }
    if (k === 4) { grow(SX[0], 40, SX[0], 132, E(u, 0.3, 1.0), ACC);
      tx(SX[0] + 14, 50, '0번부터 차례로', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      mono(RX, 170, 'Pod 0 · PVC 0', { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) }); } }

  // ---------- 2. app-0 ----------
  const WATCH0 = [['Pending', '1s'], ['ContainerCreating', '3s'], ['Running', '8s']];
  function watch(rows, shown, y0) { rows.forEach(([s, a], i) => { const op = clamp(shown - i); if (op <= 0) return;
      mono(RX, y0 + i * 24, s, { 'font-size': 14, 'font-weight': 700, fill: s === 'Running' ? GOOD : WARN, opacity: op }); mono(940, y0 + i * 24, a, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: op }); }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    seats(b, { podS: (i) => (k === 0 && i === 0 ? pop(u, 0.3) : 1), mount: (i) => (k === 2 ? E(u, 0.3, 1.0) : 1), pvcS: (i) => (k === 2 ? pop(u, 0.2) : 1),
      pv: () => (k >= 2 ? 'pv-xxx-001' : null), dns: (i) => (i === 0 && k >= 3 ? (k === 3 ? pop(u, 0.3) : 1) : 0), ghostPvc: () => 0.5, depS: (i) => (k === 4 ? pop(u, 0.4) : 1) });
    if (k <= 1) { tx(RX, 130, 'get pods -w', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' }); watch(WATCH0, k === 0 ? 1 + E(u, 0.6, 1.8) : 3, 160); }
    if (k === 1) pill(SX[0], 222, '랜덤 해시 없이 app-0', ACC, pop(u, 0.6), { fs: 13.5 });
    if (k === 2) { tx(RX, 250, 'PVC data-app-0', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(RX, 274, '→ pv-xxx-001', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.9) }); mono(RX, 296, '10Gi · Bound', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.2) }); }
    if (k === 3) { mono(SX[0] - 70, 40, 'app-0.app-headless.default.svc.cluster.local', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      grow(SX[0] + 90, Y.dns, RX - 10, Y.dns, E(u, 1.0, 1.5), INFO); mono(RX, Y.dns + 5, '10.244.1.5', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(RX, Y.dns + 30, 'Pod IP는 이름 뒤에 숨는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { tx(RX, 372, '이름이 랜덤이라', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) }); tx(RX, 394, '지목해 부를 수 없다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) }); } }

  // ---------- 3. app-1 (app-0 Ready 다음) ----------
  const WATCH1 = [['Pending', '1s'], ['ContainerCreating', '3s'], ['Running', '8s']];
  function s3(t, c) { const { k, u } = c, b = c.beat;
    seats(b, { podS: (i) => (k === 1 && i === 1 ? pop(u, 0.3) : 1), pvcS: (i) => (k === 3 && i === 1 ? pop(u, 0.2) : 1), mount: (i) => (k === 3 && i === 1 ? E(u, 0.3, 1.0) : 1),
      pv: (i) => (i === 1 ? 'pv-xxx-002' : 'pv-xxx-001'), dns: (i) => (i === 0 ? 1 : i === 1 && k >= 4 ? (k === 4 ? pop(u, 0.3) : 1) : 0), ghostPvc: () => 0.5, depS: (i) => (k === 5 && i === 1 ? pop(u, 0.6) : 1) });
    if (k === 0) { check(SX[0] + 64, Y.pod - 30, 12, pop(u, 0.3));
      const gx = (SX[0] + SX[1]) / 2, lift = E(u, 0.9, 1.6);   // 차단봉이 올라가고 1번 쪽으로 화살표
      el('rect', { x: gx - 5, y: Y.pod - 34 - lift * 40, width: 10, height: 68, rx: 4, fill: BAD, opacity: 1 - lift * 0.85 });
      grow(SX[0] + 82, Y.pod, SX[1] - 84, Y.pod, E(u, 1.6, 2.2), GOOD);
      tx(RX, 150, 'app-0 1/1 Running', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, class: 'mono', opacity: fade(u, 0.4) }); tx(RX, 176, '확인한 뒤에야 1번', { 'font-size': 14, fill: INK, opacity: fade(u, 1.4) }); }
    if (k === 1 || k === 2) { tx(RX, 130, 'app-1', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' }); watch(WATCH1, k === 1 ? 1 + E(u, 0.6, 1.8) : 3, 160); }
    if (k === 3) { tx(RX, 250, '좌석마다 따로', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(RX, 274, 'app-0 → pv-xxx-001', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) }); mono(RX, 296, 'app-1 → pv-xxx-002', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.1) }); }
    if (k === 4) { grow(SX[1] + 90, Y.dns, RX - 10, Y.dns, E(u, 0.8, 1.3), INFO); mono(RX, Y.dns + 5, '10.244.1.6', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    if (k === 5) { pill(SX[0], 46, 'primary', ACC, pop(u, 0.2), { fs: 14 }); pill(SX[1], 46, 'replica', INFO, pop(u, 0.6), { fs: 14 });
      const pth = `M ${SX[1] - 40},${Y.pod - 30} Q ${(SX[0] + SX[1]) / 2},${Y.pod - 70} ${SX[0] + 40},${Y.pod - 32}`;
      const e = el('path', { d: pth, fill: 'none', stroke: INFO, 'stroke-width': 2.6, 'marker-end': 'url(#ra-ah)', pathLength: 100, 'stroke-dasharray': `${E(u, 0.9, 1.7) * 100} 100` });
      tx(RX, 150, '0번이 먼저 초기화', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.2) }); tx(RX, 174, '1번이 join', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) }); } }

  // ---------- 4. app-2 · 3/3 · 역순 종료 ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    const order = k === 3 ? [2, 1, 0].map((i, n) => [i, E(u, 0.4 + n * 0.7, 0.9 + n * 0.7)]) : [];
    seats(b, { podS: (i) => (k === 0 && i === 2 ? pop(u, 0.3) : 1), pvcS: (i) => (k === 1 && i === 2 ? pop(u, 0.2) : 1), mount: (i) => (k === 1 && i === 2 ? E(u, 0.3, 1.0) : 1),
      pv: (i) => `pv-xxx-00${i + 1}`, dns: (i) => (i < 2 || k >= 1 ? 1 : 0), ghostPvc: () => 0.5, depS: (i) => (k === 0 && i === 2 ? pop(u, 0.6) : 1),
      word: (i) => { const o = order.find(([j]) => j === i); return o && o[1] > 0.5 ? 'Terminating' : null; } });
    if (k === 2) { card(RX + 95, 170, 190, 90, { rx: 12, stroke: GOOD, fill: GOODBG, sw: 2.2, s: pop(u, 0.3) });
      mono(RX + 18, 160, 'sts app', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) }); mono(RX + 18, 196, 'READY 3/3', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) }); }
    if (k === 3) { order.forEach(([i, g], n) => { card(SX[i] + 64, Y.pod - 34, 30, 30, { rx: 15, fill: BAD, stroke: 'none', text: String(n + 1), fs: 14, mono: true, color: PANEL, s: pop(u, 0.2 + n * 0.7) }); });
      tx(RX, 150, 'replicas=0이면', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(RX, 176, '2 → 1 → 0', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.5) });
      tx(RX, 202, '앞 번호가 끝나야 다음', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 4) { card(RX + 95, 40, 170, 44, { rx: 10, stroke: INK, text: 'client Pod', fs: 15, s: pop(u, 0.2) });
      [0, 1, 2].forEach((i) => { const g = E(u, 0.6 + i * 0.4, 1.2 + i * 0.4); if (g <= 0) return;
        el('path', { d: `M ${RX + 8},${40} Q ${SX[i] + 60},${8} ${SX[i] + 30},${Y.dns - 18}`, fill: 'none', stroke: i === 0 ? ACC : INFO, 'stroke-width': 2.4, pathLength: 100, 'stroke-dasharray': `${g * 100} 100`, 'marker-end': g > 0.98 ? 'url(#ra-ah)' : null }); });
      tx(RX, 150, '쓰기 → app-0', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); tx(RX, 174, '읽기 → app-1 · app-2', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); } }

  // ---------- 5. app-1 복구 ----------
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const ip = k < 4 ? '10.244.1.6' : '10.244.2.7';
    seats(b, { pv: (i) => `pv-xxx-00${i + 1}`, dns: () => 1, mount: (i) => (i === 1 ? (k === 0 || k === 1 ? 0 : k === 2 ? E(u, 0.3, 1.1) : 1) : 1), depHot: k === 5 ? 1 : null });
    if (k === 0) { cross(SX[1] + 64, Y.pod - 30, 11, pop(u, 0.3)); tx(RX, 150, '노드 장애', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
      tx(RX, 176, 'PVC data-app-1은 남는다', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); }
    if (k === 1) { pill(SX[1], 228, '같은 이름 app-1', ACC, pop(u, 0.4), { fs: 13.5 });
      tx(RX, 140, '옛 app-1이', { 'font-size': 14, fill: INK, opacity: fade(u, 1.0) }); tx(RX, 162, 'API에서 지워진 뒤', { 'font-size': 14, fill: INK, opacity: fade(u, 1.0) }); tx(RX, 184, '새로 만든다', { 'font-size': 14, fill: INK, opacity: fade(u, 1.0) }); }
    if (k === 2) { tx(RX, 250, '같은 볼륨 다시 마운트', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(RX, 274, 'pv-xxx-002', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); }
    if (k === 3) terminal(RX - 10, 210, 222, 120, ['$ ls .../data', ['PG_VERSION base/', 'var(--term)'], ['global/ pg_wal/', 'var(--term)']], E(u, 0.1, 1.4) * 3, { title: 'app-1' });
    if (k >= 4) { mono(RX, Y.dns + 5, 'IP', { 'font-size': 14, fill: MUT });
      mono(RX + 30, Y.dns + 5, k === 4 ? (u < 1 ? '10.244.1.6' : '10.244.2.7') : ip, { 'font-size': 15, 'font-weight': 800, fill: k === 4 && u >= 1 ? WARN : INK });
      if (k === 4) tx(RX, Y.dns + 30, '이름은 그대로', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) }); }
    if (k === 5) { tx(RX, 340, 'bb2 → zx9', { 'font-size': 15, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 0.5) });
      tx(RX, 364, '멤버 주소가 바뀐다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) }); } }

  const quiz = [
    { q: 'StatefulSet 매니페스트에서 Pod마다 PVC를 하나씩 자동으로 만들게 하는 필드는 무엇인가?',
      o: ['serviceName', 'volumeClaimTemplates', 'replicas'], a: 1,
      why: 'volumeClaimTemplates가 좌석마다 10Gi PVC를 하나씩 찍어낸다. serviceName은 DNS용 Headless Service를 가리킨다.' },
    { q: 'StatefulSet이 만든 첫 Pod의 이름은 무엇인가?',
      o: ['app-0', 'app-7d9f-aa1', 'app-headless-0'], a: 0,
      why: '이름은 StatefulSet 이름 뒤에 번호가 붙는다. 그래서 app-0.app-headless로 지목해 부를 수 있다.' },
    { q: '기본 설정의 StatefulSet에서 app-1은 언제 만들어지기 시작하는가?',
      o: ['app-0과 동시에', 'app-0이 Running이고 Ready가 된 뒤', 'app-2가 먼저 뜬 뒤'], a: 1,
      why: '순서를 지키는 것이 기본이다. 0번이 primary로 먼저 떠야 1번이 replica로 join할 수 있다.' },
    { q: 'replicas를 3에서 0으로 줄이면 Pod는 어떤 순서로 내려가는가?',
      o: ['0 → 1 → 2', '셋이 한꺼번에', '2 → 1 → 0'], a: 2,
      why: '만들 때의 역순이다. 앞 번호가 남아 있어야 뒤 번호가 안전하게 빠진다.' },
    { q: 'app-1이 다시 만들어졌을 때 바뀌는 것은 무엇인가?',
      o: ['Pod IP', 'Pod 이름', '붙는 PVC'], a: 0,
      why: 'IP는 10.244.1.6에서 10.244.2.7로 바뀌지만 이름 app-1과 PVC data-app-1은 그대로다.' },
  ];

  const summary = [
    'Deployment Pod는 이름이 랜덤이라 DB 멤버처럼 지목해 부를 수 없다.',
    'StatefulSet은 app-0, app-1, app-2처럼 번호가 붙은 이름과 Pod마다 전용 PVC를 준다.',
    'Pod는 0번부터 앞 번호가 Ready가 된 뒤에 만들어지고, 내릴 때는 2번부터 거꾸로 내린다.',
    'app-1이 다시 떠도 이름, DNS, PVC는 그대로이고 IP만 바뀐다.',
  ];
  const review = [
    { q: 'PostgreSQL 3대를 Deployment로 띄웠더니 재시작 뒤 replica가 primary를 못 찾았다. 먼저 바꿀 것은?',
      o: ['replicas를 5로 늘린다', 'StatefulSet과 Headless Service로 고정 이름을 준다', 'Pod IP를 설정 파일에 적어 둔다'], a: 1,
      why: 'Deployment Pod 이름과 IP는 다시 뜰 때마다 바뀐다. StatefulSet은 app-0.app-headless 같은 바뀌지 않는 주소를 준다.' },
    { q: 'app-1이 사라졌다가 다시 떴는데 데이터가 그대로 있었다. 이유로 맞는 것은?',
      o: ['컨테이너 이미지 안에 데이터가 들어 있어서', 'app-0이 데이터를 복사해 줘서', '좌석 1번 전용 PVC data-app-1이 남아 새 Pod에 다시 붙어서'], a: 2,
      why: 'Pod가 지워져도 PVC는 남는다. 같은 번호로 다시 만든 Pod에 같은 볼륨 pv-xxx-002가 붙는다.' },
    { q: 'StatefulSet을 apply했는데 app-0만 오래 Pending이고 app-1은 아예 없다. 먼저 의심할 것은?',
      o: ['app-0이 Ready가 되지 않아 다음 번호로 넘어가지 못하는 것', 'Headless Service가 너무 많아서', 'app-1 이름이 이미 쓰여서'], a: 0,
      why: '기본 순서 규칙에서는 앞 번호가 Ready가 되어야 다음 Pod를 만든다. app-0의 PVC 바인딩이나 스케줄링부터 본다.' },
  ];

  R.page({ title: 'StatefulSet 지정석', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
