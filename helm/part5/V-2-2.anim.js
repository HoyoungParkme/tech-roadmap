/* V-2-2 프로덕션 체크리스트 — 품질 · 안정성 · 배포 안전 · 보안 · 운영. 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone,
    cross, check, lock, clock, terminal, person, dbIcon } = R;
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

  // 오른쪽 위 배포 준비도 (페이지 데이터 score). 앞 beat 값에서 이어진다
  function gauge(c, o) { o = o || {}; const p = c.prev ? c.prev.score : c.beat.score, v = tween(p, c.beat.score, c.u), x = o.x ?? 720, y = o.y ?? 18, w = o.w ?? 220;
    T(x, y + 14, '배포 준비도', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); M(x + w, y + 14, Math.round(v) + '%', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: v >= 100 ? GOOD : ACC });
    el('rect', { x, y: y + 22, width: w, height: 8, rx: 4, fill: SOFT }); el('rect', { x, y: y + 22, width: w * clamp(v / 100), height: 8, rx: 4, fill: v >= 100 ? GOOD : ACC }); }
  // Pod 상자
  function pod(cx, cy, label, o) { o = o || {}; const col = o.col || ACC;
    card(cx, cy, o.w || 74, o.h || 54, { rx: 10, stroke: col, fill: o.fill || PANEL, sw: 2.2, s: o.s, op: o.op, text: label, fs: 13.5, color: col, mono: true }); }

  // ---------- 1. 품질 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { const files = ['Chart.yaml', 'values.yaml', 'templates/', '  deployment.yaml'];
      fileCard(40, 60, 300, './my-app', files.map((f, i) => [f, { b: k === 1 && i === 0 }]), { h: 150 });
      if (k === 0) { el('rect', { x: 46, y: lerp(98, 186, E(u, 0.3, 2.0)), width: 288, height: 4, rx: 2, fill: ACC, opacity: u < 2.1 ? 0.8 : 0 });
        M(40, 250, '$ helm lint ./my-app', { 'font-weight': 700, opacity: fade(u, 0.1) }); T(420, 120, 'CI의 첫 관문', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.0) });
        T(420, 150, '문법과 구조를 먼저 본다. 여기서 막히면 뒤는 없다', { fill: MUT, opacity: fade(u, 1.3) }); }
      if (k === 1) { terminal(380, 70, 560, 140, ['==> Linting ./my-app', ['[INFO] Chart.yaml: icon is recommended', '#93c5fd'], '', ['1 chart(s) linted, 0 chart(s) failed', '#4ade80']], lerp(0, 4, E(u, 0.2, 1.6)), { title: 'helm lint · 예시 출력' });
        card(500, 270, 200, 44, { rx: 10, stroke: INFO, fill: INFOBG, text: '[INFO] = 권고', fs: 14, s: pop(u, 1.7) });
        card(760, 270, 220, 44, { rx: 10, stroke: GOOD, fill: GOODBG, text: '통과 기준 = failed 0', fs: 14, s: pop(u, 2.0) }); } }
    if (k >= 2 && k <= 4) { // 스키마 문
      fileCard(40, 40, 380, 'values.schema.json', [['required: [image, replicaCount]', { hi: k === 2, b: k === 2 }], ['replicaCount: integer, minimum 1', { hi: k === 3, b: k === 3, op: k >= 3 ? 1 : 0.25 }], ['image: { repository, tag } string', { hi: k === 3, op: k >= 3 ? 1 : 0.25 }]], { h: 120 });
      if (k === 2) { ['image', 'replicaCount'].forEach((n, i) => { const s = pop(u, 0.6 + i * 0.4); card(560 + i * 200, 120, 170, 60, { rx: 10, stroke: ACC, sw: 2.4, s }); M(560 + i * 200, 116, n, { 'text-anchor': 'middle', 'font-weight': 700, opacity: s }); T(560 + i * 200, 140, '필수', { 'text-anchor': 'middle', fill: ACC, 'font-size': 13.5, opacity: s }); });
        T(470, 260, '이 키가 빠지면 install 단계에서 바로 걸린다', { opacity: fade(u, 1.6) }); }
      if (k === 3) { const ax = R.axes(500, 120, 380, 60, { x: [0, 4], y: [0, 1], xt: [0, 1, 2, 3, 4] });
        el('rect', { x: ax.X(1), y: 120, width: (ax.X(4) - ax.X(1)) * E(u, 0.4, 1.2), height: 60, fill: GOODBG }); el('rect', { x: ax.X(0) - 10, y: 120, width: 20, height: 60 * E(u, 0.8, 1.2), fill: BADBG });
        [0, 1, 2, 3, 4].forEach((v) => el('circle', { cx: ax.X(v), cy: 150, r: 7, fill: v >= 1 ? GOOD : BAD, opacity: fade(u, 1.0 + v * 0.1) }));
        T(500, 100, 'replicaCount로 받을 수 있는 값', { 'font-weight': 700, opacity: fade(u, 0.2) });
        T(470, 270, '1.5 같은 소수도 integer가 아니라 거절된다', { fill: MUT, opacity: fade(u, 1.8) }); }
      if (k === 4) { el('rect', { x: 600, y: 60, width: 12, height: 160, rx: 6, fill: ACC }); T(606, 244, 'schema', { 'text-anchor': 'middle', class: 'mono', fill: ACC, 'font-weight': 700 });
        const g = seg(u, 0.3, 1.0), b = seg(u, 1.0, 1.6), x = g < 1 ? lerp(470, 530, E(g, 0, 1)) : lerp(530, 490, E(b, 0, 1));
        card(x, 140, 120, 40, { rx: 8, stroke: BAD, fill: BADBG, text: 'replicas=0', fs: 13.5, mono: true, color: BAD });
        if (u > 1.0) cross(606, 100, 12, pop(u, 1.0));
        R.server(800, 140, '클러스터', { s: 0.8 }); T(800, 236, '아무것도 안 만든다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) });
        terminal(40, 280, 900, 92, ['$ helm install my-app ./my-app --set replicaCount=0', ['Error: INSTALLATION FAILED: values don\'t meet the specifications … my-app:', '#f87171'], ['- replicaCount: Must be greater than or equal to 1', '#f87171']], lerp(0, 3, E(u, 1.2, 2.4)), { title: '예시 출력 · helm v3.15 소스 형식', fs: 13.5, lh: 18 }); } }
    if (k === 5) { [['README.md', '무엇을 하는 차트인지, 값 설명'], ['templates/NOTES.txt', 'install 직후 터미널에 찍히는 안내']].forEach(([f, d], i) => { const s = pop(u, 0.3 + i * 0.5), x = 220 + i * 420;
        card(x, 150, 300, 150, { rx: 10, stroke: GOOD, sw: 2.2, s }); for (let j = 0; j < 4; j++) el('line', { x1: x - 110, y1: 120 + j * 22, x2: x + 110 - (j % 2) * 60, y2: 120 + j * 22, stroke: OFF, 'stroke-width': 3, opacity: s });
        M(x, 100, f, { 'text-anchor': 'middle', 'font-weight': 800, opacity: s }); T(x, 260, d, { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); });
      T(480, 340, '6개월 뒤의 나도 이 문서로 차트를 다시 쓴다', { 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) }); }
    gauge(c); }

  // ---------- 2. 안정성 ----------
  function node(x, y, w, h, name) { el('rect', { x, y, width: w, height: h, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 2 }); tx(x + 12, y + 22, name, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { card(200, 180, 240, 70, { rx: 12, stroke: INK, sw: 2.6, text: 'Deployment', fs: 18, s: pop(u, 0.2) });
      [['resources', '자리 확보'], ['probe', '상태 확인'], ['replica', '여유분']].forEach(([a, b], i) => { const y = 90 + i * 90, s = pop(u, 0.7 + i * 0.35);
        grow(322, 180, 498, y, E(u, 0.5 + i * 0.35, 0.9 + i * 0.35), MUT, { plain: true });
        card(640, y, 260, 56, { rx: 10, stroke: ACC, dash: '6 4', s }); M(530, y - 2, a, { 'font-weight': 800, fill: ACC, opacity: s }); T(530, y + 20, b, { fill: MUT, opacity: s }); }); }
    if (k === 1) { M(40, 50, 'replicas: {{ .Values.replicaCount }}', { 'font-weight': 700 });
      [['replicaCount 1', 1, 150], ['replicaCount 2', 2, 590]].forEach(([n, r, x], i) => { node(x - 130, 90, 300, 200, n);
        for (let j = 0; j < r; j++) { const dead = j === 0 && u > 1.2; pod(x - (r - 1) * 50 + j * 100, 180, dead ? '죽음' : 'Pod', { col: dead ? BAD : GOOD, fill: dead ? BADBG : PANEL }); }
        const down = r === 1 && u > 1.4; T(x + 20, 320, down ? '서비스 끊김' : r === 1 ? '' : u > 1.4 ? '나머지 1개가 받는다' : '', { 'text-anchor': 'middle', 'font-weight': 700, fill: r === 1 ? BAD : GOOD }); }); }
    if (k === 2 || k === 3) { node(40, 50, 420, 300, 'node');
      const bars = [['CPU', 100, 500, 'm', 1000], ['메모리', 128, 256, 'Mi', 512]];
      bars.forEach(([n, rq, lm, unit, full], i) => { const y = 120 + i * 110, W = 340, x = 80;
        T(x, y - 12, n + ' (노드 일부)', { 'font-weight': 700, fill: MUT, 'font-size': 13.5 });
        el('rect', { x, y, width: W, height: 26, rx: 5, fill: PANEL, stroke: GRID });
        const rw = W * rq / full * (k === 2 ? E(u, 0.3 + i * 0.3, 1.1 + i * 0.3) : 1); el('rect', { x, y, width: rw, height: 26, rx: 5, fill: ACC, opacity: 0.85 });
        M(x + 4, y + 46, 'requests ' + rq + unit, { fill: ACC, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.0 + i * 0.3) : 1 });
        if (k === 3) { const lx = x + W * lm / full; el('line', { x1: lx, y1: y - 8, x2: lx, y2: y + 34, stroke: WARN, 'stroke-width': 3 });
          M(lx, y + 46, 'limits ' + lm + unit, { fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
          const use = Math.min(W * lm / full + (i ? 14 : 0), W * lerp(rq / full, lm / full + (i ? 0.03 : 0), E(u, 0.6, 1.8)));
          el('rect', { x, y: y + 8, width: use, height: 10, rx: 3, fill: i && u > 1.8 ? BAD : INK, opacity: 0.7 }); } });
      if (k === 2) { T(500, 130, '스케줄러는 requests만큼', { 'font-weight': 700, opacity: fade(u, 1.2) }); T(500, 156, '빈자리가 있는 노드에만 놓는다', { opacity: fade(u, 1.4) });
        T(500, 210, 'requests가 없으면 0으로 보고 아무 데나', { fill: MUT, opacity: fade(u, 1.8) }); }
      if (k === 3) { T(500, 130, 'CPU가 limits에 닿으면 느려지고(스로틀)', { 'font-weight': 700, opacity: fade(u, 1.4) });
        T(500, 160, '메모리가 넘으면 컨테이너가 OOMKilled', { 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); T(500, 200, '이웃 파드로 번지지 않는다', { fill: MUT, opacity: fade(u, 2.2) }); } }
    if (k === 4) { M(40, 50, 'livenessProbe: GET /healthz · 10초마다', { 'font-weight': 700 });
      const ax = R.axes(80, 110, 760, 120, { x: [0, 70], y: [0, 1], xt: [0, 10, 20, 30, 40, 50, 60, 70], xl: '초' });
      [[10, 1], [20, 1], [30, 0], [40, 0], [50, 0]].forEach(([s, ok], i) => { const op = fade(u, 0.3 + i * 0.3); el('line', { x1: ax.X(s), y1: 130, x2: ax.X(s), y2: 230, stroke: ok ? GOOD : BAD, 'stroke-width': 3, opacity: op });
        (ok ? check : cross)(ax.X(s), 160, 9, op); });
      if (u > 1.9) { card(ax.X(50) + 80, 170, 150, 44, { rx: 10, stroke: BAD, fill: BADBG, text: '재시작', fs: 15, color: BAD, s: pop(u, 1.9) }); }
      T(80, 300, '실패가 연달아 3번(쿠버네티스 기본값)이면 컨테이너를 다시 띄운다', { fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 5) { card(170, 180, 180, 70, { rx: 35, stroke: INFO, sw: 2.4, text: 'Service', fs: 16, s: pop(u, 0.2) });
      [['pod-a', true, 110], ['pod-b 부팅 중', u > 2.0, 250]].forEach(([n, ready, y], i) => { pod(640, y, n, { w: 180, col: ready ? GOOD : WARN, fill: ready ? GOODBG : WARNBG });
        if (ready) { grow(262, 180, 548, y, i ? E(u, 2.0, 2.4) : 1, GOOD); dot([[262, 180], [548, y]], (t * 0.6 + i * 0.5) % 1, GOOD, 5); }
        else { el('line', { x1: 262, y1: 180, x2: 548, y2: y, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); cross(420, 220, 9, 1); } });
      T(640, 330, '/ready가 통과해야 엔드포인트에 들어간다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) }); }
    if (k === 6 || k === 7) { node(40, 70, 380, 220, 'node-1'); node(520, 70, 380, 220, 'node-2');
      fileCard(300, 300, 360, 'PodDisruptionBudget (policy/v1)', [], { h: 36, op: k === 6 ? fade(u, 0.3) : 1 });
      if (k === 6) { pod(230, 180, 'Pod', { col: GOOD }); pod(710, 180, 'Pod', { col: GOOD });
        T(480, 30, '노드 정리(드레인) 같은 자발적 중단에 대비', { 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8) }); }
      if (k === 7) { const drained = u > 0.6; el('rect', { x: 40, y: 70, width: 380, height: 220, rx: 12, fill: WARNBG, opacity: drained ? 0.6 : 0 }); if (drained) T(230, 270, 'drain 중', { 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 });
        const mv = E(u, 0.9, 1.9); pod(lerp(230, 800, mv), lerp(180, 130, mv), 'Pod', { col: mv >= 1 ? GOOD : WARN }); pod(640, 230, 'Pod', { col: GOOD });
        card(480, 30, 340, 40, { rx: 20, stroke: GOOD, fill: GOODBG, text: 'minAvailable: 1 · 늘 1개는 떠 있다', fs: 14, s: pop(u, 0.3) }); } }
    gauge(c); }

  // ---------- 3. 배포 안전 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { M(40, 70, '$ helm upgrade --install my-app ./my-app --namespace prod', { 'font-weight': 700, 'font-size': 15 });
      card(260, 190, 300, 60, { rx: 10, stroke: GOOD, text: '없으면 install · 있으면 upgrade', fs: 14, s: pop(u, 0.5) });
      card(700, 190, 300, 60, { rx: 10, stroke: WARN, dash: '6 4', text: '실패하면 무엇을 하나?', fs: 15, color: WARN, s: pop(u, 1.3) });
      T(480, 300, '아직 실패했을 때의 행동이 없다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 1) { M(40, 50, '--atomic --wait --timeout 5m0s', { 'font-weight': 800, fill: ACC, 'font-size': 16 });
      const back = u > 2.0; ['v1', 'v1', 'v1'].forEach((v, i) => { const isNew = !back && u > 0.4; pod(150 + i * 110, 170, isNew ? 'v2 …' : 'v1', { col: isNew ? WARN : GOOD, fill: isNew ? WARNBG : PANEL }); });
      clock(560, 170, 40, Math.min(1, E(u, 0.4, 2.0)), WARN, '5m0s');
      if (back) { card(780, 170, 220, 50, { rx: 10, stroke: BAD, fill: BADBG, text: 'Ready 실패 → 롤백', fs: 14, color: BAD, s: pop(u, 2.0) }); }
      T(40, 290, '--atomic을 주면 --wait가 자동으로 켜진다', { opacity: fade(u, 1.0) }); T(40, 316, '시간 안에 Ready가 안 되면 직전 성공본으로 되돌린다', { fill: MUT, opacity: fade(u, 1.3) }); }
    if (k === 2 || k === 3) { M(40, 50, k === 2 ? '$ helm history my-app -n prod' : '$ helm rollback my-app 1 -n prod', { 'font-weight': 700 });
      const rows = [['1', k === 3 ? 'superseded' : 'superseded', 'Install complete'], ['2', k === 3 && u > 1.0 ? 'superseded' : 'deployed', 'Upgrade complete']];
      if (k === 3) rows.push(['3', 'deployed', 'Rollback to 1']);
      ['REVISION', 'STATUS', 'DESCRIPTION'].forEach((h, i) => M([60, 220, 420][i], 100, h, { fill: MUT, 'font-weight': 700 }));
      rows.forEach(([r, st, d], i) => { const y = 140 + i * 44, isNew = k === 3 && i === 2, op = isNew ? fade(u, 1.0) : k === 2 ? fade(u, 0.3 + i * 0.4) : 1;
        if (isNew) el('rect', { x: 44, y: y - 26, width: 640, height: 38, rx: 6, fill: GOODBG, opacity: op });
        M(60, y, r, { 'font-weight': 800, opacity: op }); M(220, y, st, { fill: st === 'deployed' ? GOOD : MUT, 'font-weight': 700, opacity: op }); M(420, y, d, { opacity: op }); });
      if (k === 2) T(720, 160, '되돌아갈 번호부터 확인', { 'font-weight': 700, opacity: fade(u, 1.4) });
      if (k === 3) { T(720, 150, '롤백도 새 리비전이다', { 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); T(720, 176, '2 → 1로 바뀌지 않고', { fill: MUT, opacity: fade(u, 1.8) }); T(720, 200, '1의 내용으로 3이 생긴다', { fill: MUT, opacity: fade(u, 2.0) }); }
      T(60, 320, '예시 출력. 실제 표에는 UPDATED · CHART · APP VERSION 열도 있다', { fill: MUT, 'font-size': 13.5, opacity: fade(u, 1.0) }); }
    if (k === 4) { const L = [['pre-upgrade hook', 'migration Job · weight -5', WARN, 0.3], ['앱 리소스', 'Deployment · Service …', ACC, 1.3], ['post-upgrade hook', '(있다면)', OFF, 2.0]];
      el('line', { x1: 60, y1: 200, x2: lerp(60, 900, E(u, 0.1, 2.3)), y2: 200, stroke: GRID, 'stroke-width': 3 });
      L.forEach(([a, b, col, t0], i) => { const x = 170 + i * 300, s = pop(u, t0); card(x, 200, 240, 70, { rx: 10, stroke: col, sw: 2.4, s, fill: PANEL });
        T(x, 194, a, { 'text-anchor': 'middle', 'font-weight': 800, fill: col === OFF ? MUT : col, opacity: s }); M(x, 218, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); });
      if (u > 1.0) check(170, 150, 10, pop(u, 1.0));
      M(40, 60, '"helm.sh/hook": pre-install,pre-upgrade', { 'font-weight': 700, opacity: fade(u, 0.1) });
      T(40, 300, '마이그레이션이 끝나야 새 앱이 뜬다. 첫 설치 때도 돌도록 pre-install을 함께 단다', { fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 5) { M(40, 50, '$ helm test my-app -n prod', { 'font-weight': 700 });
      pod(220, 170, 'test Pod', { w: 160, h: 70, col: u > 1.5 ? GOOD : WARN, s: pop(u, 0.3) });
      R.server(560, 170, 'my-app', { s: 0.75 }); dot([[300, 170], [500, 170]], seg(u, 0.6, 1.4), ACC, 7);
      M(40, 290, 'TEST SUITE:  my-app-connection-test', { opacity: fade(u, 1.5) }); M(40, 316, 'Phase:       Succeeded', { fill: GOOD, 'font-weight': 800, opacity: fade(u, 1.8) });
      T(700, 300, '예시 출력', { fill: MUT, 'font-size': 13.5, opacity: fade(u, 1.8) }); }
    gauge(c); }

  // ---------- 4. 보안 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const imgs = [['이미지 A', 150], ['이미지 B', 420]];
      imgs.forEach(([n, x]) => card(x, 230, 200, 70, { rx: 10, stroke: INK, text: n, fs: 15 }));
      const lx = lerp(150, 420, E(u, 1.0, 1.8)); pill(lx, 140, 'latest', BAD, 1, { mono: true }); grow(lx, 160, lx, 190, 1, BAD);
      pill(150, 90, '1.4.2', GOOD, pop(u, 0.3), { mono: true }); el('line', { x1: 150, y1: 108, x2: 150, y2: 190, stroke: GOOD, 'stroke-width': 2.4 });
      T(620, 120, '다음 빌드가 나오면 latest는 옮겨 간다', { opacity: fade(u, 1.2) }); T(620, 150, '1.4.2는 언제나 같은 이미지', { fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) });
      T(620, 200, '어제 그 버전을 다시 띄우려면 고정 태그', { fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 1) { [['root (uid 0)', BAD, 200, false], ['uid 1000', GOOD, 600, true]].forEach(([n, col, x, ok], i) => { const s = pop(u, 0.3 + i * 0.6);
        card(x, 170, 260, 150, { rx: 12, stroke: col, sw: 2.4, s }); person(x, 160, null, { s: s * 0.9, stroke: col }); M(x, 225, n, { 'text-anchor': 'middle', 'font-weight': 800, fill: col, opacity: s }); });
      T(480, 310, 'runAsNonRoot: true · 탈취돼도 root 권한이 없다', { 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 2) { card(220, 180, 300, 220, { rx: 14, stroke: INK, sw: 2.4 }); T(90, 92, '컨테이너', { 'font-weight': 800 });
      ['NET_RAW', 'CHOWN', 'SETUID', 'KILL'].forEach((cp, i) => { const g = E(u, 0.4 + i * 0.2, 1.2 + i * 0.2); card(150 + (i % 2) * 140, lerp(140 + Math.floor(i / 2) * 50, 380, g), 120, 34, { rx: 17, stroke: WARN, text: cp, fs: 13.5, mono: true, op: 1 - g }); });
      M(220, 260, 'drop: ["ALL"]', { 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      fly(700, 140, 330, 230, seg(u, 0.6, 1.4), 'write /', { mono: true, fill: BAD });
      if (u > 1.4) cross(350, 230, 10, pop(u, 1.4));
      T(560, 110, 'readOnlyRootFilesystem: true', { class: 'mono', 'font-weight': 700, opacity: fade(u, 0.3) });
      T(560, 290, 'allowPrivilegeEscalation: false', { class: 'mono', 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 3) { fileCard(40, 60, 420, 'values.yaml', ['database:', ['  password: "supersecret123"', { col: BAD, b: true, hi: BADBG }]], { h: 100 });
      el('line', { x1: 520, y1: 110, x2: 900, y2: 110, stroke: INK, 'stroke-width': 3 });
      [560, 680, 800].forEach((x, i) => el('circle', { cx: x, cy: 110, r: 11 * pop(u, 0.3 + i * 0.3), fill: i === 0 ? BAD : PANEL, stroke: i === 0 ? BAD : INK, 'stroke-width': 3 }));
      T(560, 160, '한 번 커밋되면', { 'font-weight': 700, opacity: fade(u, 1.2) }); T(560, 186, '지워도 히스토리에 남는다', { fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      T(40, 260, '애초에 넣지 않는 것이 유일한 방법이다', { opacity: fade(u, 1.9) }); }
    if (k === 4) { fileCard(40, 60, 420, 'values.yaml', ['database:', ['  existingSecret: my-app-db-credentials', { hi: true, b: true }], '  secretKeys:', ['    passwordKey: db-password', { hi: true }]], { h: 150 });
      card(730, 135, 300, 110, { rx: 12, stroke: INK, sw: 2.4, s: pop(u, 0.8) }); M(600, 110, 'Secret', { 'font-weight': 800, opacity: pop(u, 0.8) }); M(600, 136, 'my-app-db-credentials', { 'font-size': 13.5, opacity: pop(u, 0.8) }); M(600, 164, 'db-password: ••••', { 'font-size': 13.5, fill: ACC, opacity: pop(u, 0.8) });
      grow(470, 135, 572, 135, E(u, 1.1, 1.6), ACC);
      T(40, 270, 'values에는 이름만. 값은 클러스터에 따로 만든 Secret에서 읽는다', { fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 5) { dbIcon(150, 160, 'Vault', { stroke: INFO }); card(480, 160, 220, 60, { rx: 10, stroke: ACC, text: 'ExternalSecret\n(또는 SOPS)', fs: 14, s: pop(u, 0.4) });
      card(800, 160, 200, 60, { rx: 10, stroke: INK, text: 'k8s Secret', fs: 15, s: pop(u, 1.0) });
      dot([[200, 160], [370, 160]], seg(u, 0.6, 1.2), INFO, 7); dot([[590, 160], [700, 160]], seg(u, 1.2, 1.8), ACC, 7);
      M(40, 300, 'externalSecrets: { enabled: true, backend: vault }', { 'font-weight': 700, opacity: fade(u, 1.6) }); }
    gauge(c); }

  // ---------- 5. 종합 체크리스트 ----------
  const CATX = { '품질': 0, '안정성': 1, '배포 안전': 2, '보안': 3, '운영': 4 };
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev || b;
    const cw = 176, gap = 10, x0 = 30, focusCat = ['품질', '안정성', '배포 안전', '보안', '운영', '운영'][k];
    b.checks.forEach((cat, ci) => { const x = x0 + ci * (cw + gap), on = cat.cat === focusCat, h = 300, prevCat = (p.checks || [])[ci];
      el('rect', { x, y: 70, width: cw, height: h, rx: 12, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.6 : 1.6 });
      T(x + 12, 96, cat.cat, { 'font-weight': 800, 'font-size': 15, fill: on ? ACC : INK });
      cat.items.forEach((it, j) => { const y = 132 + j * 58, was = prevCat && prevCat.items[j] && prevCat.items[j].ok, flip = it.ok && !was;
        const s = flip ? pop(u, 0.4 + j * 0.3) : 1;
        el('circle', { cx: x + 22, cy: y, r: 11, fill: it.ok ? GOODBG : PANEL, stroke: it.ok ? GOOD : OFF, 'stroke-width': 2 }); if (it.ok) check(x + 22, y, 6, s);
        const words = it.label.split(' '), l1 = [], l2 = []; words.forEach((w) => ((!l1.length || (tw(l1.concat(w).join(' '), 13.5) * 0.9 < cw - 46 && !l2.length)) ? l1 : l2).push(w));
        T(x + 40, y - 2, l1.join(' '), { 'font-size': 13.5, fill: it.ok ? INK : MUT }); if (l2.length) T(x + 40, y + 16, l2.join(' '), { 'font-size': 13.5, fill: it.ok ? INK : MUT }); }); });
    if (b.checks.length < 5) { const x = x0 + 4 * (cw + gap); el('rect', { x, y: 70, width: cw, height: 300, rx: 12, fill: 'none', stroke: OFF, 'stroke-dasharray': '6 5', 'stroke-width': 1.6 }); T(x + cw / 2, 220, '운영', { 'text-anchor': 'middle', fill: OFF, 'font-weight': 800 }); }
    gauge(c, { x: 30, y: 16, w: 900 });
    const NOTE = ['quality: helm_lint_pass · values_schema_json · documented', 'stability: … pdb_defined: true · replica_count: 3 (≥ 2)',
      'deploy_safety: atomic_wait · rollback_plan · hook_ordering · helm_test', 'security: 하나라도 false면 나머지가 초록이어도 배포하지 않는다', 'operations: semver_versioning · monitoring_labels'];
    if (k < 5) mono(480, 400, NOTE[k], { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: k === 3 ? BAD : INK, opacity: fade(u, 1.2) });
    if (k === 5 && u > 1.8) banner(480, 395, '모든 카테고리 통과 · helm upgrade --install --atomic', pop(u, 1.8)); }

  const quiz = [
    { q: 'values.schema.json에 replicaCount를 integer, minimum 1로 적었다. --set replicaCount=0으로 install 하면 어떻게 되는가?',
      o: ['클러스터에 아무것도 만들기 전에 install이 실패한다', 'Pod 0개로 배포된다', 'lint 경고만 나고 배포된다'], a: 0,
      why: 'helm은 렌더하기 전에 병합된 values를 스키마로 검사한다. minimum 1을 어긴 값은 그 자리에서 막힌다.' },
    { q: 'readinessProbe가 없는 Pod에서 생기는 일은 무엇인가?',
      o: ['죽은 컨테이너가 재시작되지 않는다', '부팅 중인 Pod에도 트래픽이 들어가 오류가 난다', '노드 드레인 때 모든 Pod가 동시에 내려간다'], a: 1,
      why: 'readiness는 받을 준비가 됐는지를 본다. 통과 전까지 Service 엔드포인트에서 빠지므로, 없으면 준비 안 된 Pod가 요청을 받는다.' },
    { q: 'history가 1 superseded, 2 deployed일 때 helm rollback my-app 1을 하면 history는 어떻게 되는가?',
      o: ['1이 다시 deployed가 되고 2는 지워진다', '2가 1로 이름이 바뀐다', '1의 내용으로 3이 생기고 deployed가 된다'], a: 2,
      why: '롤백도 새 리비전을 만든다. 기록은 그대로 남고 3의 설명이 Rollback to 1이 된다.' },
    { q: 'image.tag를 latest 대신 1.4.2로 고정하는 이유는 무엇인가?',
      o: ['내려받기가 더 빠르다', '같은 태그가 늘 같은 이미지를 가리켜 다시 띄우고 롤백할 수 있다', 'securityContext가 latest를 거부한다'], a: 1,
      why: 'latest는 새 빌드가 나올 때마다 옮겨 간다. 고정 태그여야 어제 배포한 그 버전을 다시 띄울 수 있다.' },
    { q: '체크리스트에서 replica_count를 true가 아니라 3처럼 숫자로 적은 이유는 무엇인가?',
      o: ['기준(2 이상)을 눈으로 바로 확인하게 하려고', 'YAML이 true를 읽지 못해서', 'helm이 이 파일을 values로 읽어서'], a: 0,
      why: '숫자로 남기면 2 이상인지 한눈에 보인다. 체크리스트는 사람이 기억하지 않아도 되게 만드는 파일이다.' },
  ];
  const summary = [
    'helm lint와 values.schema.json이 잘못된 차트와 값을 배포 전에 막는다.',
    'requests·limits, 두 가지 probe, PDB, replica 2 이상이 있어야 Pod 하나가 죽어도 버틴다.',
    '--atomic은 실패하면 되돌리고, helm rollback은 이전 내용을 새 리비전으로 다시 배포한다.',
    '시크릿은 이름만 values에 두고, root를 막고, 이미지 태그는 1.4.2처럼 고정한다.',
  ];
  const review = [
    { q: '첫 설치에서 앱이 DB 테이블이 없다는 오류로 죽었다. 마이그레이션 Job의 annotation에서 먼저 볼 것은?',
      o: ['hook 값에 pre-install이 빠졌는지', 'hook-weight가 양수인지', 'hook-delete-policy가 있는지'], a: 0,
      why: 'pre-upgrade만 달면 upgrade 때만 돈다. 첫 설치에도 돌게 하려면 pre-install을 함께 단다.' },
    { q: '노드를 정리하자 서비스가 잠깐 완전히 끊겼다. 먼저 의심할 조합은?',
      o: ['limits가 너무 크다', 'replica 1 개에 PodDisruptionBudget이 없다', 'NOTES.txt가 없다'], a: 1,
      why: 'Pod가 하나뿐이고 PDB도 없으면 드레인이 그 Pod를 바로 내린다. replica 2 이상과 minAvailable 1이 같이 있어야 버틴다.' },
    { q: '배포 실패 뒤 어제 버전으로 rollback 했는데 다른 이미지가 떴다. 원인으로 가장 그럴듯한 것은?',
      o: ['--atomic을 썼다', 'helm history를 먼저 봤다', 'image.tag가 latest 였다'], a: 2,
      why: '롤백은 그 리비전의 values를 다시 쓴다. 태그가 latest면 지금 latest가 가리키는 새 이미지가 뜬다.' },
  ];

  R.page({ title: '프로덕션 배포 준비도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
