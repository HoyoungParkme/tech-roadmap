/* IV-1-1 Container + Kubernetes — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, person, cross, check, clock, hbar, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 파드: 작은 판 + 안의 컨테이너 줄무늬. st: run | pend | dead | empty
  function pod(cx, cy, o) { o = o || {}; const st = o.st || 'run', w = o.w || 88, h = o.h || 50;
    const col = st === 'dead' ? BAD : st === 'run' ? (o.col || ACC) : st === 'warn' ? WARN : GRID;
    const g = card(cx, cy, w, h, { rx: 8, stroke: col, sw: st === 'run' || st === 'warn' ? 2.2 : 1.8, fill: st === 'run' ? (o.bg || ACCBG) : st === 'dead' ? BADBG : st === 'warn' ? WARNBG : PANEL, dash: st === 'pend' || st === 'empty' ? '5 4' : null, s: o.s, op: o.op });
    if (st !== 'empty') { el('rect', { x: -w / 2 + 9, y: -h / 2 + 9, width: 16, height: h - 18, rx: 3, fill: 'none', stroke: col, 'stroke-width': 1.6 }, g);
      [0.3, 0.5, 0.7].forEach((f) => el('line', { x1: -w / 2 + 12, y1: -h / 2 + h * f, x2: -w / 2 + 22, y2: -h / 2 + h * f, stroke: col, 'stroke-width': 1.4 }, g)); }
    if (o.name) tx(-w / 2 + 31, 5, o.name, { 'text-anchor': 'start', 'font-size': 13.5, 'font-weight': 700, fill: st === 'empty' ? OFF : INK, class: 'mono' }, g);
    if (o.sub) tx(0, h / 2 + 18, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.subCol || MUT, class: 'mono' }, g);
    return g; }
  // 숫자 계기 두 개 (desired / running) — 앞 beat 값에서 이어서
  function counters(c, x, y, keys, ov) { const b = c.beat, p = c.prev || {};
    keys.forEach(([k, name, col], i) => { const v = ov && ov[k] != null ? ov[k] : Math.round(tween(p[k], b[k], c.u)), cx = x + i * 118;
      card(cx, y, 106, 52, { rx: 10, stroke: col || GRID, sw: 1.6 });
      tx(cx - 42, y - 6, name, { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      mono(cx - 42, y + 18, String(v) + (k === 'cpu' ? '%' : ''), { 'font-size': 20, 'font-weight': 800, fill: k === 'cpu' && v > 70 ? WARN : INK }); }); }
  const yamlLine = (x, y, s, op, col) => mono(x, y, s, { 'font-size': 14, fill: col || INK, opacity: op });

  // 1. Docker 이미지: 레이어가 아래에서부터 쌓인다
  const LAYERS = [['FROM python:3.12-slim', 'base · OS + 파이썬'], ['RUN apt-get install libpq5 curl', '시스템 의존성'], ['RUN useradd -u 10001 app', '비루트 유저'],
    ['RUN pip install -r requirements.txt', 'site-packages'], ['COPY . .', '앱 코드']];
  function stack(n, k, u, o) { o = o || {}; const x = 50, w = 380, h = 44, y0 = 352;
    for (let i = 0; i < n; i++) { const born = i === k || (k === 3 && i === 4), dl = k === 3 && i === 4 ? 0.9 : 0.2, a = born ? E(u, dl, dl + 0.7) : 1;
      const y = y0 - i * (h + 6) - (1 - a) * 70, hot = born && !o.calm;
      el('rect', { x, y: y - h / 2, width: w, height: h, rx: 7, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : INK, 'stroke-width': hot ? 2.4 : 1.8, opacity: a });
      mono(x + 14, y + 5, LAYERS[i][0], { 'font-size': 14, 'font-weight': 700, fill: INK, opacity: a });
      if (o.badge) o.badge(i, x + w, y); else tx(x + w - 12, y + 5, LAYERS[i][1], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: a * (i === 3 ? 0 : 1) }); }
    tx(x, 40, '이미지 = 읽기 전용 레이어 묶음', { 'font-size': 15, 'font-weight': 700, fill: MUT }); }
  function s1(t, c) { const { k, u } = c;
    if (k < 5) stack([1, 2, 3, 5, 5][k], k, u);
    const RX = 520;
    if (k === 0) { pill(700, 120, 'python:3.12-slim', ACC, pop(u, 0.5), { mono: true, fs: 16 });
      sub(700, 165, 'Debian slim + Python 3.12 를 못 박는다', fade(u, 0.9), { 'font-size': 14 });
      card(700, 260, 300, 70, { rx: 10, stroke: BAD, sw: 1.8, dash: '5 4', s: pop(u, 1.4) });
      mono(600, 254, 'FROM python:latest', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.5) });
      tx(600, 276, '빌드할 때마다 바뀔 수 있다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); cross(830, 260, 10, pop(u, 1.7)); return; }
    if (k === 1) { // 같은 RUN 에서 지우기 vs 따로 지우기
      const col = (cx, title, bad) => { tx(cx, 92, title, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: bad ? BAD : GOOD, opacity: fade(u, bad ? 0.4 : 1.2) });
        const rows = bad ? [['RUN apt-get install', 'apt 캐시 포함', WARN], ['RUN rm -rf lists', '지워도 아래에 남음', BAD]] : [['RUN install && rm -rf', '캐시 없이 한 장', GOOD]];
        rows.forEach(([a, b, cc], i) => { const s = pop(u, (bad ? 0.5 : 1.3) + i * 0.3), y = 132 + i * 62;
          card(cx, y, 200, 50, { rx: 8, stroke: cc, sw: 1.8, s }); mono(cx - 88, y - 3, a, { 'font-size': 13.5, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 }); tx(cx - 88, y + 17, b, { 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); }); };
      col(RX + 90, '설치·정리를 따로', true); col(RX + 320, '같은 RUN 한 줄', false);
      tx(RX + 205, 300, 'RUN 하나 = 레이어 하나', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2) });
      sub(RX + 205, 326, '지운 파일도 앞 레이어에는 그대로 남는다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 2) { person(RX + 70, 160, 'root', { stroke: BAD, s: pop(u, 0.3) }); mono(RX + 70, 236, 'uid 0', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      grow(RX + 120, 160, RX + 250, 160, E(u, 0.8, 1.5), ACC); mono(RX + 185, 146, 'USER app', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      person(RX + 300, 160, 'app', { stroke: GOOD, s: pop(u, 1.4) }); mono(RX + 300, 236, 'uid 10001', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(RX + 185, 300, '이후 RUN · CMD 는 모두 app 권한', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(RX + 185, 326, '컨테이너가 뚫려도 root 가 아니다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { // 코드만 바꿔 다시 빌드: 아래 4장은 캐시
      tx(RX + 20, 92, '코드만 고치고 다시 build', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) });
      [['FROM · apt · useradd', 'CACHED', GOOD], ['pip install (requirements 그대로)', 'CACHED', GOOD], ['COPY . .', '다시 만듦', WARN]].forEach(([a, b, cc], i) => {
        const y = 140 + i * 56, s = pop(u, 1.8 + i * 0.25); card(RX + 200, y, 380, 44, { rx: 8, stroke: cc, sw: 1.8, s });
        mono(RX + 26, y + 5, a, { 'font-size': 13.5, opacity: s > 0.5 ? 1 : 0 }); pill(RX + 340, y, b, cc, s, { fs: 13.5 }); });
      sub(RX + 200, 330, '자주 바뀌는 것을 맨 위에 둔다', fade(u, 2.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { // ENV 와 HEALTHCHECK 은 레이어가 아니라 이미지 설정
      tx(RX, 60, '이미지 설정 (레이어 아님)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      ['PATH=~/.local/bin:…', 'PYTHONUNBUFFERED=1', 'PORT=8000'].forEach((s, i) => pill(RX + 30 + tw(s, 13.5) / 2 + 13 + [0, 0, 0][i], 96 + i * 38, s, INFO, pop(u, 0.3 + i * 0.2), { mono: true, fs: 13.5 }));
      // 심박: 10초마다 /healthz
      const x0 = RX, x1 = RX + 380, y = 270; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 2 });
      const run = E(u, 0.9, 2.4); for (let i = 0; i < 4; i++) { const px = x0 + 30 + i * 110; if (run * 4 < i + 0.2) continue;
        el('path', { d: `M${px - 18},${y} L${px - 6},${y} L${px},${y - 26} L${px + 6},${y + 14} L${px + 12},${y}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.4 }); check(px + 30, y - 22, 7); }
      mono(x0, y + 34, 'HEALTHCHECK 10초마다 curl /healthz (2초 제한)', { 'font-size': 13.5, opacity: fade(u, 1.0) });
      tx(x0, y + 62, 'docker 가 쓰는 표시다. k8s 는 Step 2 의 probe 로 본다', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k5: 레이어 묶음 → 태그 → 레지스트리 → 컨테이너 실행
    const sh = E(u, 0.2, 0.9); for (let i = 0; i < 5; i++) { const y = lerp(352 - i * 50, 230 - i * 10, sh);
      el('rect', { x: lerp(50, 90, sh), y: y - lerp(22, 8, sh), width: lerp(380, 220, sh), height: lerp(44, 16, sh), rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 1.6 }); }
    pill(200, 150, 'registry/orders:1.0.0', ACC, pop(u, 0.8), { mono: true, fs: 14 });
    dbIcon(560, 200, '레지스트리', { s: pop(u, 0.6) }); grow(330, 200, 505, 200, E(u, 1.0, 1.6), ACC); mono(418, 188, 'push', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    grow(615, 200, 735, 200, E(u, 1.6, 2.1), ACC); mono(675, 188, 'run', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    pod(820, 200, { name: 'orders', s: pop(u, 2.0), w: 120, h: 70, sub: '0.0.0.0:8000' });
    counters(c, 680, 340, [['pods', 'running', ACC], ['cpu', 'CPU', GRID]]); }

  // 2. Deployment: 원하는 개수를 적으면 컨트롤러가 맞춘다
  const NODE = [{ x: 400, name: 'node-a' }, { x: 670, name: 'node-b' }], SLOT = [[470, 'node-a'], [745, 'node-b'], [560, 'node-a']];
  const slotXY = (i) => [i === 1 ? 740 : i === 0 ? 470 : 580, 230];
  function nodes(o) { o = o || {}; NODE.forEach((n, i) => { const dead = o.dead === i; zone(n.x, 150, 250, 170, n.name, { fill: dead ? BADBG : SOFT, stroke: dead ? BAD : 'none', color: dead ? BAD : MUT }); }); }
  function specCard(rows, k, u) { el('rect', { x: 30, y: 60, width: 330, height: 350, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(46, 84, 'deployment.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, class: 'mono' });
    rows.forEach(([s, kk], i) => { if (kk > k) return; const now = kk === k, op = now ? fade(u, 0.2 + (i % 3) * 0.15) : 1;
      if (now) el('rect', { x: 36, y: 96 + i * 26, width: 318, height: 24, rx: 4, fill: ACCBG, opacity: op });
      yamlLine(48, 113 + i * 26, s, op, now ? ACC : INK); }); }
  const DROWS = [['kind: Deployment', 0], ['name: orders', 0], ['labels: app=orders', 0], ['replicas: 3', 1], ['selector: app=orders', 1], ['image: orders:1.0.0', 2],
    ['port: 8000', 3], ['DB_URL ← secret', 3], ['requests 100m/256Mi', 4], ['limits   500m/512Mi', 4], ['readiness /readyz 5s', 5], ['liveness  /healthz 10s', 5]];
  function s2(t, c) { const { k, u } = c, b = c.beat;
    specCard(DROWS, k, u);
    if (k === 4) { // 파드 하나를 크게: requests 와 limits
      tx(400, 84, '파드 하나의 자원 칸', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      [['CPU', 100, 500, 'm', 1000], ['메모리', 256, 512, 'Mi', 1024]].forEach(([n, rq, lm, un, mx], i) => { const y = 140 + i * 110, x0 = 420, W = 460, g = E(u, 0.3 + i * 0.4, 1.3 + i * 0.4);
        tx(x0, y - 14, n, { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: x0, y, width: W, height: 26, rx: 5, fill: SOFT });
        el('rect', { x: x0, y, width: W * lm / mx * g, height: 26, rx: 5, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5 });
        el('rect', { x: x0, y, width: W * rq / mx * g, height: 26, rx: 5, fill: ACC, opacity: 0.85 });
        mono(x0 + W * rq / mx + 6, y + 46, `requests ${rq}${un}`, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.4) });
        mono(x0 + W * lm / mx, y - 8, `limits ${lm}${un}`, { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4 + i * 0.4) }); });
      sub(650, 380, 'requests 로 자리를 잡고, limits 를 넘으면 CPU 는 깎이고 메모리는 OOM', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    nodes({ dead: k === 6 ? 1 : null });
    counters(c, 470, 112, [['desired', 'desired', ACC], ['pods', 'running', GRID]], k === 6 ? { pods: u < 0.3 || u > 1.7 ? 3 : 2 } : null);
    const n = k >= 1 ? 3 : 0;
    for (let i = 0; i < n; i++) { const [x, y] = slotXY(i);
      let st = k === 1 ? 'pend' : 'run', s = k === 1 ? pop(u, 0.5 + i * 0.25) : 1;
      if (k === 2) { const f = E(u, 0.4 + i * 0.45, 1.0 + i * 0.45); st = f >= 1 ? 'run' : 'pend';
        dot([[900, 40], [x, y - 30]], seg(u, 0.1 + i * 0.45, 0.6 + i * 0.45), ACC, 6); }
      if (k === 6 && i === 1) { const gone = E(u, 0.3, 0.9); st = 'dead'; pod(x, y, { st, name: 'orders', op: 1 - gone * 0.6 }); cross(x, y, 14, pop(u, 0.3)); continue; }
      pod(x, y, { st, name: 'orders', s, sub: null }); }
    if (k === 2) { mono(900, 30, 'registry/orders:1.0.0', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.2) }); }
    if (k === 1) tx(650, 360, '아직 빈 자리 3개: 원하는 상태만 적혔다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) });
    if (k === 3) { lock(400, 368, true, WARN, pop(u, 0.3)); mono(422, 374, 'Secret orders-db', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) });
      for (let i = 0; i < 3; i++) { const [x, y] = slotXY(i); fly(420, 350, x, y - 42, seg(u, 0.8 + i * 0.3, 1.6 + i * 0.3), 'DB_URL', { mono: true, fill: WARN, stay: true }); }
      tx(900, 374, '매니페스트에는 참조만', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2) }); }
    if (k === 5) { // readiness 실패 파드는 트래픽에서 빠지고, liveness 실패 파드는 재시작
      const ys = 340; [0, 1, 2].forEach((i) => { const [x] = slotXY(i), bad = i === 2;
        grow(x, ys + 20, x, 262, bad ? 0 : E(u, 0.2, 0.8), ACC); });
      const [x2] = slotXY(2), [x1] = slotXY(1);
      card(x2, 180, 112, 28, { rx: 14, stroke: WARN, sw: 1.8, s: pop(u, 0.9), text: 'readyz 실패', fs: 13.5, color: WARN });
      tx(x2, 396, '트래픽만 끊긴다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
      card(x1, 180, 120, 28, { rx: 14, stroke: BAD, sw: 1.8, s: pop(u, 1.6), text: 'healthz 실패', fs: 13.5, color: BAD });
      tx(x1, 396, '컨테이너 재시작', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) });
      const [x0] = slotXY(0); tx(x0, 396, '정상', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.6) }); }
    if (k === 6) { // 컨트롤러 루프: 현재 2 → 새 파드
      const f = E(u, 1.1, 1.8); pod(580, 292, { st: f >= 1 ? 'run' : 'pend', name: 'orders', s: pop(u, 1.1) });
      grow(735, 262, 625, 288, E(u, 0.9, 1.3), ACC, { dash: '5 4' });
      card(560, 376, 260, 34, { rx: 17, stroke: ACC, sw: 1.8, s: pop(u, 0.6), text: u < 1.7 ? '원하는 3 · 현재 2 → 하나 더' : '원하는 3 · 현재 3', fs: 14, color: ACC });
      tx(890, 376, '사람 손 없음', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.1) }); } }

  // 3. Service: 이름 하나가 바뀌는 파드 IP 를 가린다
  const PODY = [118, 210, 302], PX = 790, SX = 450, CX = 110;
  function svcBox(o) { o = o || {}; card(SX, 210, 170, 92, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: o.s });
    tx(SX, 196, 'Service orders', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: o.s == null ? 1 : clamp(o.s) });
    mono(SX, 222, 'ClusterIP', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.s == null ? 1 : clamp(o.s) }); }
  function epList(items, y, op) { tx(SX - 80, y, 'Endpoints', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    items.forEach(([s, st], i) => { const x = SX - 80 + 78 + i * 34; mono(x, y, s, { 'font-size': 15, 'font-weight': 700, fill: st === 'gone' ? OFF : st === 'new' ? ACC : INK, 'text-decoration': st === 'gone' ? 'line-through' : null, opacity: st && st.op != null ? st.op : op }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { // 타입 4가지 + 헤드리스
      tx(480, 46, 'Service 타입: 누가 부를 수 있나', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      [['ClusterIP', '클러스터 안에서만', '기본값'], ['NodePort', '노드 IP:포트로 밖에서', '개발용'], ['LoadBalancer', '클라우드 LB 를 붙인다', '외부 공개'], ['ExternalName', '바깥 DNS 별칭', 'CNAME']].forEach(([a, b2, cc], i) => {
        const x = 130 + i * 233, s = pop(u, 0.3 + i * 0.25), on = i === 0;
        card(x, 140, 210, 100, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.6, fill: on ? ACCBG : PANEL, s });
        mono(x, 118, a, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: on ? ACC : INK, opacity: s > 0.5 ? 1 : 0 });
        tx(x, 146, b2, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: s > 0.5 ? 1 : 0 }); tx(x, 172, cc, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); });
      // 헤드리스: DNS 가 파드 IP 목록을 그대로
      zone(110, 236, 740, 150, 'clusterIP: None (헤드리스)', { fill: SOFT, op: fade(u, 1.4) });
      card(260, 320, 200, 48, { rx: 10, stroke: INK, sw: 1.8, text: 'DNS: orders', fs: 14.5, mono: true, s: pop(u, 1.6) });
      ['IP a', 'IP b', 'IP c'].forEach((s, i) => { const y = 276 + i * 44; grow(362, 320, 540, y, E(u, 1.9 + i * 0.12, 2.3 + i * 0.12), INK); pill(600, y, s, INK, pop(u, 2.1 + i * 0.12), { mono: true, fs: 13.5 }); });
      tx(830, 326, 'StatefulSet 파드를', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.4) }); tx(830, 348, '이름으로 찾을 때', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.4) }); return; }
    // 클러스터 경계
    zone(250, 50, 690, 350, 'cluster', { fill: 'none', stroke: GRID, dash: '6 5', sw: 1.6 });
    svcBox({ s: k === 0 ? pop(u, 0.2) : 1 });
    const ips = k === 5 ? ['a', 'b', 'c'] : ['a', 'b', 'c'];
    PODY.forEach((y, i) => { if (k === 0 && u < 0.1) return; const dead = k === 5 && i === 1;
      pod(PX, y, { name: 'orders', sub: null, st: dead ? 'dead' : 'run', op: dead ? 1 - E(u, 0.4, 1.0) * 0.5 : 1 });
      mono(PX + 54, y + 5, 'IP ' + ips[i], { 'font-size': 14, fill: dead ? BAD : MUT, opacity: dead ? 1 - E(u, 0.4, 1.0) * 0.5 : 1 }); if (dead) cross(PX, y, 13, pop(u, 0.4)); });
    if (k === 0) { // DNS 표에 이름이 생긴다
      card(110, 110, 190, 74, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, 0.8) }); tx(30, 94, '클러스터 DNS', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.9) });
      const s = 'orders.default.svc', n = Math.round(s.length * E(u, 1.0, 2.0)); mono(26, 124, s.slice(0, n), { 'font-size': 14, 'font-weight': 700, fill: ACC });
      tx(110, 300, '이름이 곧 호출 주소', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { // selector 가 라벨로 파드를 고른다
      PODY.forEach((y, i) => { grow(SX + 85, 210, PX - 40, y, E(u, 0.2 + i * 0.25, 0.7 + i * 0.25), ACC, { dash: '4 4', plain: true }); pill(PX - 2, y - 38, 'app=orders', GOOD, pop(u, 0.5 + i * 0.25), { fs: 13.5, mono: true }); });
      epList([['a', null], ['b', null], ['c', null]].map(([s], i) => [s, { op: fade(u, 1.4 + i * 0.25) }]), 290, fade(u, 1.3));
      tx(110, 210, 'IP 대신', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); tx(110, 234, '라벨을 적는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    epList([['a', null], ['b', k === 5 ? 'gone' : null], ['c', null]].concat(k === 5 ? [['d', 'new']] : []), 290, 1);
    if (k === 2) { // 포트 80 → 8000, 바깥은 못 들어온다
      grow(170, 210, SX - 88, 210, E(u, 0.2, 0.7), INK); mono(260, 196, ':80', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5) }); person(110, 210, '앱', { s: pop(u, 0.2) });
      PODY.forEach((y, i) => grow(SX + 85, 210, PX - 40, y, E(u, 0.8 + i * 0.15, 1.3 + i * 0.15), ACC)); mono(640, 150, ':8000', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      person(110, 360, '밖', { stroke: BAD, s: pop(u, 1.6) }); grow(140, 350, 240, 330, E(u, 1.8, 2.2), BAD); cross(256, 328, 9, pop(u, 2.2));
      tx(420, 372, 'ClusterIP 는 안쪽 전용', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k3, k5: 이름으로 부르면 살아 있는 파드로 나눠 간다
    person(110, 150, null, {}); pill(120, 236, 'http://orders/orders', INK, k === 3 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5 });
    grow(160, 200, SX - 88, 210, k === 3 ? E(u, 0.4, 0.8) : 1, INK);
    const live = k === 5 ? [0, 2, 3] : [0, 1, 2];
    if (k === 5) { pod(PX, 380 - 0, { name: 'orders', st: E(u, 1.0, 1.6) >= 1 ? 'run' : 'pend', s: pop(u, 1.0), w: 88, h: 36 }); mono(PX + 54, 385, 'IP d', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    for (let r = 0; r < 6; r++) { const j = live[r % 3], y = j === 3 ? 380 : PODY[j], st = (k === 3 ? 0.9 : 1.7) + r * 0.22;
      dot([[160, 200], [SX - 88, 210], [SX + 85, 210], [PX - 38, y]], seg(u, st, st + 0.6), ACC, 6); }
    if (k === 3) tx(125, 300, 'DNS → 가상 IP → kube-proxy', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
    if (k === 5) { check(30, 236, 8, pop(u, 2.2)); tx(110, 300, '호출 코드는 그대로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); } }

  // 4. Ingress + HPA
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const IX = 250, IY = 150, OS = [460, 100], US = [460, 220];
    person(60, IY, '사용자', {});
    card(IX, IY, 120, 120, { rx: 12, stroke: INK, sw: 2.5, fill: PANEL });
    tx(IX, IY - 30, 'Ingress', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); mono(IX, IY - 8, 'nginx', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: k >= 1 ? 1 : 0 });
    mono(IX, IY + 84, 'api.example.com', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    if (k >= 1) lock(IX, IY + 28, true, GOOD, k === 1 ? pop(u, 0.3) : 1);
    const showSvc = k >= 2;
    if (showSvc) { card(OS[0], OS[1], 128, 46, { rx: 10, stroke: ACC, sw: 2, fill: ACCBG, text: 'orders:80', fs: 14, mono: true, s: k === 2 ? pop(u, 0.3) : 1 }); }
    if (k >= 3) card(US[0], US[1], 128, 46, { rx: 10, stroke: INFO, sw: 2, fill: INFOBG, text: 'users:80', fs: 14, mono: true, s: k === 3 ? pop(u, 0.3) : 1 });
    // orders 파드 칸 12개 (min/max 범위)
    const gx = 600, gy = 70, cw = 50, pods = Math.round(tween(p.pods, b.pods, c.u, 1.6));
    zone(gx - 14, gy - 34, 340, 196, 'orders 파드 (최대 12)', { fill: SOFT });
    for (let i = 0; i < 12; i++) { const x = gx + (i % 6) * cw + 20, y = gy + Math.floor(i / 6) * 70 + 40, on = i < pods;
      pod(x, y, { st: on ? (b.cpu > 70 ? 'warn' : 'run') : 'empty', w: 40, h: 44, s: k === 6 && i >= 5 && i < 8 ? pop(u, 0.9 + (i - 5) * 0.3) : 1 }); }
    if (k >= 2) { grow(OS[0] + 64, OS[1], gx - 16, OS[1], 1, ACC, { plain: true }); }
    if (k === 0) { dot([[90, IY], [IX - 60, IY]], seg(u, 0.2, 0.8), WARN, 7); mono(150, IY - 24, 'http://', { 'font-size': 14, fill: WARN, opacity: fade(u, 0.2) });
      dot([[IX - 60, IY + 20], [90, IY + 20]], seg(u, 0.9, 1.5), GOOD, 7); mono(150, IY + 50, '→ https', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(IX, 300, 'ssl-redirect: http 요청은 https 로 되돌린다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'start', opacity: fade(u, 1.8) }); }
    if (k === 1) { mono(150, IY - 24, 'HTTPS', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); mono(IX + 105, IY - 24, 'HTTP', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      grow(90, IY, IX - 60, IY, E(u, 0.4, 0.9), GOOD); grow(IX + 60, IY, IX + 150, IY, E(u, 0.9, 1.3), MUT, { plain: true });
      lock(IX - 40, 300, true, WARN, pop(u, 1.4)); mono(IX - 20, 306, 'secret api-tls', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(IX - 52, 340, 'TLS 는 입구에서 풀고 뒤는 평범한 HTTP', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); }
    if (k === 2 || k === 3) { const rt = (dst, col, st) => { for (let r = 0; r < 3; r++) dot([[90, IY], [IX - 60, IY], [IX + 60, IY], [dst[0] - 64, dst[1]]], seg(u, st + r * 0.4, st + r * 0.4 + 0.8), col, 6); };
      rt(OS, ACC, 0.6); pill(IX + 0, 300, 'Prefix /orders → orders:80', ACC, k === 2 ? pop(u, 0.4) : 1, { mono: true, fs: 13.5 });
      if (k === 3) { rt(US, INFO, 0.9); pill(IX + 0, 344, 'Prefix /users → users:80', INFO, pop(u, 0.5), { mono: true, fs: 13.5 }); tx(IX + 160, 390, '입구는 하나, 경로로 나눈다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }
    if (k >= 4) { // HPA
      const hx = 470, hy = 330; card(hx, hy, 150, 60, { rx: 10, stroke: WARN, sw: 2.2, fill: WARNBG, s: k === 4 ? pop(u, 0.3) : 1 });
      tx(hx, hy - 4, 'HPA', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN }); mono(hx, hy + 18, 'orders-hpa', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      grow(hx + 75, hy - 10, gx - 16, 200, k === 4 ? E(u, 0.6, 1.1) : 1, WARN);
      if (k === 4) { person(120, 330, '사람', { s: 1, stroke: MUT }); cross(120, 324, 14, pop(u, 1.3)); mono(200, 320, 'kubectl scale', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3), 'text-decoration': 'line-through' });
        tx(200, 344, 'replicas 의 주인이 바뀐다', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.6) }); }
      if (k >= 5) { // CPU 막대: 목표 50 선, 지금 78
        const x0 = 600, W = 300, y = 300, cpu = tween(p.cpu, b.cpu, c.u); tx(x0, y - 12, '평균 CPU', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
        el('rect', { x: x0, y, width: W, height: 22, rx: 4, fill: SOFT }); el('rect', { x: x0, y, width: W * cpu / 100 * (k === 5 ? E(u, 0.3, 1.2) : 1), height: 22, rx: 4, fill: WARN });
        el('line', { x1: x0 + W * 0.5, y1: y - 6, x2: x0 + W * 0.5, y2: y + 30, stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': '4 3' });
        mono(x0 + W * 0.5, y + 46, '목표 50%', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 }); mono(x0 + W * cpu / 100 + 6, y + 17, Math.round(cpu) + '%', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: k === 5 ? fade(u, 1.2) : 1 });
        if (k === 5) { mono(gx + 6, 230, 'min 3', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) }); mono(gx + 306, 230, 'max 12', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.7) }); }
        if (k === 6) { const s = 'ceil(5 × 78 / 50) = ceil(7.8) = 8', n = Math.round(s.length * E(u, 0.2, 1.0));
          mono(30, 272, s.slice(0, n), { 'font-size': 15, 'font-weight': 800, fill: INK });
          tx(30, 298, '같은 부하면 8개 평균 약 49%', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
          tx(30, 390, '부하가 빠지면 min 3 까지 줄인다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) }); } } } }

  // 5. Operator: 운영 지식을 컨트롤러로
  const DBX = [560, 700, 840];
  function s5(t, c) { const { k, u } = c;
    if (k === 6) { // 6층 정리
      tx(480, 40, 'k8s 로 배운 여섯 가지', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['Pod', '실행 단위'], ['Deployment', '원하는 개수 유지'], ['Service', '바뀌지 않는 이름'], ['Ingress', '밖에서 들어오는 입구'], ['HPA', '부하 따라 개수 조절'], ['Operator', '운영 절차를 코드로']].forEach(([a, b2], i) => {
        const y = 370 - i * 54, w = 620 - i * 50, s = E(u, 0.2 + i * 0.3, 0.6 + i * 0.3);
        el('rect', { x: 480 - w / 2, y: y - 22 + (1 - s) * 20, width: w, height: 44, rx: 8, fill: i === 5 ? ACCBG : PANEL, stroke: i === 5 ? ACC : INK, 'stroke-width': 1.8, opacity: s });
        mono(480 - w / 2 + 16, y + 6, a, { 'font-size': 15, 'font-weight': 800, fill: i === 5 ? ACC : INK, opacity: s }); tx(480 + w / 2 - 16, y + 6, b2, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: s }); }); return; }
    if (k === 5) { // 같은 패턴
      tx(480, 50, '같은 방식으로 운영하는 것들', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      [['Strimzi', 'Kafka'], ['kube-prometheus', 'Prometheus'], ['ECK', 'Elasticsearch'], ['직접 만든 컨트롤러', '우리 도메인']].forEach(([a, b2], i) => {
        const y = 110 + i * 70, s = pop(u, 0.3 + i * 0.35); card(330, y, 260, 52, { rx: 10, stroke: ACC, sw: 2, fill: ACCBG, s, text: a, fs: 15, mono: i < 3, color: ACC });
        grow(462, y, 590, y, E(u, 0.6 + i * 0.35, 1.0 + i * 0.35), ACC); card(700, y, 200, 52, { rx: 10, stroke: INK, sw: 1.8, s: pop(u, 0.8 + i * 0.35), text: b2, fs: 15 }); });
      tx(480, 400, 'CRD + 컨트롤러 = 문서 대신 코드로 남은 운영 절차', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // CR 카드
    el('rect', { x: 30, y: 50, width: 330, height: 340, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    const rows = [['kind: postgresql', 0], ['name: orders-db', 0], ['version: "16"', 1], ['numberOfInstances: 3', 1], ['volume: 20Gi', 2], ['databases: orders → app', 2], ['users: app [createdb]', 2], ['pg_hba: hostssl … md5', 2]];
    rows.forEach(([s, kk], i) => { if (kk > k) return; const now = kk === k, op = now ? fade(u, 0.2 + (i % 4) * 0.2) : 1;
      if (now) el('rect', { x: 36, y: 64 + i * 30, width: 318, height: 26, rx: 4, fill: ACCBG, opacity: op }); yamlLine(48, 82 + i * 30, s, op, now ? ACC : INK); });
    if (k === 0) { tx(560, 60, 'k8s 가 아는 리소스 종류', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      ['Pod', 'Deployment', 'Service', 'Ingress', 'HPA'].forEach((s, i) => mono(560, 100 + i * 34, s, { 'font-size': 15 }));
      const s = pop(u, 0.9); pill(560 + tw('postgresql  (CRD 로 추가)', 14) / 2 + 13, 100 + 5 * 34 - 5, 'postgresql  (CRD 로 추가)', ACC, s, { mono: true, fs: 14 });
      tx(560, 330, '어휘가 하나 늘었다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // 오른쪽: DB 파드 3칸
    const made = k >= 3, f = k === 3 ? E(u, 0.9, 1.6) : 1;
    if (made) { zone(470, 60, 460, 290, null, { fill: SOFT, op: k === 3 ? fade(u, 0.7) : 1 }); mono(484, 336, 'StatefulSet orders-db', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.7) : 1 }); }
    DBX.forEach((x, i) => { const dead = k === 4 && i === 0, prim = k === 4 ? i === 1 && u > 1.3 : i === 0;
      if (!made) { card(x, 170, 100, 110, { rx: 10, stroke: GRID, sw: 1.8, dash: '5 4', s: k === 1 ? pop(u, 0.9 + i * 0.25) : 1 }); }
      else dbIcon(x, 160, 'orders-db-' + i, { stroke: dead ? BAD : prim ? ACC : INK, fill: dead ? BADBG : PANEL, s: k === 3 ? f : 1, op: dead ? 0.6 : 1 });
      if (made && f >= 1) pill(x, 92, prim ? 'primary' : dead ? '장애' : 'replica', prim ? ACC : dead ? BAD : MUT, k === 4 && (i === 1 || i === 0) ? pop(u, i === 1 ? 1.3 : 0.4) : 1, { fs: 13.5 });
      if (dead) cross(x, 160, 16, pop(u, 0.3));
      if (k >= 2) { const s2 = k === 2 ? pop(u, 0.8 + i * 0.25) : 1; el('rect', { x: x - 34, y: 260, width: 68, height: 34, rx: 6, fill: PANEL, stroke: WARN, 'stroke-width': 1.8, transform: `translate(${x} 277) scale(${s2}) translate(${-x} -277)` });
        mono(x, 282, '20Gi', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: s2 > 0.5 ? 1 : 0 }); } });
    if (k === 1) tx(700, 300, '"몇 대" 만 적는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    if (k === 2) tx(700, 330, '디스크 · DB · 유저 · 접속 규칙이 한 장에', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
    if (k === 3) { // 컨트롤러 루프
      const cx = 415, cy = 390, a = t * 2.2; el('circle', { cx, cy, r: 18, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '70 44', transform: `rotate(${(a * 57) % 360} ${cx} ${cy})` });
      tx(cx + 30, cy + 5, 'Operator: 원하는 3 ↔ 현재 0 → 만든다', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      [[560, 700], [560, 840]].forEach(([a1, a2], i) => { if (f < 1) return; for (let r = 0; r < 2; r++) dot([[a1 + 44, 150], [a2 - 44, 150]], ((t * 0.7 + r / 2 + i * 0.25) % 1), ACC, 4.5); });
      mono(915, 335, 'PVC + Service + leader 선출', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }
    if (k === 4) { mono(915, 335, 'Patroni 가 replica 를 primary 로', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.4), 'font-weight': 700 });
      for (let r = 0; r < 3; r++) dot([[700, 210], [700, 250], [520, 395]], ((t * 0.5 + r / 3) % 1), WARN, 4.5);
      card(470, 395, 140, 34, { rx: 8, stroke: WARN, sw: 1.8, text: 'WAL · 백업', fs: 13.5, color: WARN, s: pop(u, 1.8) });
      tx(600, 400, '새벽 호출 없이 전환', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); } }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'Dockerfile에서 requirements.txt를 앱 코드보다 먼저 COPY하는 이유는 무엇인가?',
      o: ['코드만 바뀐 빌드에서 pip 설치 레이어를 캐시로 다시 쓰려고', '이미지 안에서 파일 권한을 app 유저로 바꾸려고', 'HEALTHCHECK가 requirements를 읽어야 해서'], a: 0,
      why: '레이어는 위에서 바뀐 곳부터 다시 만든다. 자주 바뀌는 코드를 맨 위에 두면 pip install 레이어는 CACHED로 넘어간다.' },
    { q: 'readinessProbe가 실패한 파드에서 일어나는 일은 무엇인가?',
      o: ['컨테이너가 즉시 재시작된다', '파드는 살아 있고 Service 트래픽에서만 빠진다', 'Deployment가 replicas를 하나 줄인다'], a: 1,
      why: 'readiness는 트래픽을 받을 준비가 됐는지를 본다. 재시작은 liveness(/healthz 10초 주기)가 실패할 때 일어난다.' },
    { q: '파드가 죽고 새로 떠서 IP가 바뀌었을 때, 호출하는 앱은 무엇을 바꿔야 하나?',
      o: ['새 파드 IP로 설정을 고친다', 'Service의 ClusterIP를 다시 조회해 코드에 넣는다', '아무것도 바꾸지 않는다'], a: 2,
      why: 'Service는 라벨 selector로 Endpoints를 알아서 갱신한다. 앱은 http://orders라는 이름만 쓰므로 그대로다.' },
    { q: 'HPA 목표가 CPU 50%이고 파드 5개의 평균이 78%라면 HPA가 맞추는 파드 수는 몇 개인가?',
      o: ['6개', '8개', '12개'], a: 1,
      why: 'ceil(5 × 78 / 50) = ceil(7.8) = 8이다. 결과가 min 3과 max 12 사이라 그대로 8개가 된다.' },
    { q: 'postgresql CR의 numberOfInstances를 3으로 적었을 때 StatefulSet과 failover를 만드는 주체는 무엇인가?',
      o: ['Operator의 컨트롤러', 'kubectl apply 명령 자체', 'HPA'], a: 0,
      why: 'CRD는 새 리소스 종류를 등록할 뿐이고, Operator 컨트롤러가 원하는 상태와 현재 상태의 차이를 계속 메운다.' },
  ];

  const summary = [
    '이미지는 레이어를 쌓은 것이고, 자주 바뀌는 코드를 맨 위에 두면 빌드가 캐시를 탄다.',
    'Deployment에 replicas 3을 적으면 파드가 죽거나 노드가 빠져도 컨트롤러가 3개로 되돌린다.',
    'Service 이름이 파드 IP를 가려서, 파드가 바뀌어도 호출 코드는 http://orders 그대로다.',
    'HPA는 ceil(5 × 78 / 50) = 8처럼 CPU 비율로 파드 수를 정하고 min 3, max 12 안에서만 움직인다.',
  ];
  const review = [
    { q: '배포 직후 새 파드가 준비되기 전부터 5xx가 튀었다. 먼저 확인할 것은?',
      o: ['readinessProbe가 설정돼 있는지', 'Dockerfile의 USER 줄', 'HPA의 maxReplicas'], a: 0,
      why: 'readiness가 없으면 앱이 뜨는 중인 파드도 Endpoints에 들어가 트래픽을 받는다. /readyz가 OK일 때만 넣어야 한다.' },
    { q: '노드 하나가 꺼졌는데 orders 파드 수가 곧 다시 3개가 됐다. 이 일을 한 것은?',
      o: ['Service의 selector', 'Deployment(ReplicaSet) 컨트롤러', 'Ingress 컨트롤러'], a: 1,
      why: '컨트롤러가 원하는 3과 현재 2의 차이를 보고 다른 노드에 파드를 하나 더 만든다. Service는 그 새 파드를 Endpoints에 넣을 뿐이다.' },
    { q: 'Dockerfile에 HEALTHCHECK를 넣었는데 k8s가 망가진 컨테이너를 재시작하지 않는다. 빠진 것은?',
      o: ['EXPOSE 8000', 'ssl-redirect 어노테이션', 'livenessProbe'], a: 2,
      why: 'k8s는 이미지의 HEALTHCHECK를 쓰지 않는다. 재시작 여부는 매니페스트의 livenessProbe(/healthz)로 판단한다.' },
  ];

  R.page({ title: 'orders 서비스를 k8s에 올리기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
