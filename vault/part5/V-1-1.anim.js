/* V-1-1 HA — Integrated Storage(Raft) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    server, person, cross, check, clock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, WARN, WARNBG, INFO } = C;

  const ROLE = { leader: ['LEADER', ACC], follower: ['FOLLOWER', INFO], single: ['SINGLE', WARN], down: ['DOWN', BAD], candidate: ['CANDIDATE', WARN] };
  // 로그 칸 8개: 커밋된 칸은 채움, 복제 중(log > commit)은 점선
  function strip(cx, y, log, com, op) {
    const N = 8, w = 12, g = 3, x0 = cx - (N * (w + g) - g) / 2;
    for (let i = 0; i < N; i++) { const x = x0 + i * (w + g), f = clamp(com - i), r = clamp(log - i);
      el('rect', { x, y, width: w, height: 14, rx: 2, fill: SOFT, stroke: GRID, 'stroke-width': 1, opacity: op });
      if (r > 0.02 && f < 0.98) el('rect', { x, y, width: w, height: 14, rx: 2, fill: WARNBG, stroke: WARN, 'stroke-width': 1.2, 'stroke-dasharray': '3 2', opacity: r * op });
      if (f > 0.02) el('rect', { x, y, width: w, height: 14, rx: 2, fill: ACC, opacity: f * op }); } }
  // Raft 노드 하나: 역할 배지 · 서버 · 이름 · 로그 칸 · log/commit 숫자
  function node(cx, cy, n, pn, u, o) { o = o || {};
    const role = o.role || n.role, [bt, bc] = ROLE[role], s = o.s ?? 1, op = Math.min(1, s) * (o.op ?? 1), down = role === 'down';
    server(cx, cy, null, { stroke: down ? BAD : role === 'leader' ? ACC : INK, lamp: down ? BAD : GOOD, s, op: o.op });
    pill(cx, cy - 62, bt, bc, s, { fs: 13.5, op: o.op });
    lbl(cx, cy + 62, n.id, op, { class: 'mono' });
    const lg = pn ? tween(pn.log, n.log, u) : n.log, cm = pn ? tween(pn.committed, n.committed, u) : n.committed;
    strip(cx, cy + 74, lg, cm, op);
    mono(cx, cy + 108, `log ${Math.round(lg)} · commit ${Math.round(cm)}`, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op });
    if (down) cross(cx, cy, 20, o.xs ?? 1); }
  const nodesOf = (b) => (b && b.cluster ? b.cluster.nodes : []);
  const prevOf = (c, id) => nodesOf(c.prev).find((m) => m.id === id) || null;
  // 꺾인 길을 u 만큼 그린다
  function route(pts, u, col, o) { o = o || {}; if (u <= 0) return;
    const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = segs.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot; const out = [pts[0]];
    for (let i = 0; i < segs.length && d > 0; i++) { const f = Math.min(1, d / segs[i]); out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); d -= segs[i]; }
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }
  // 작은 노드 무리: n 개 원, alive 개만 살아 있음
  function ring(cx, cy, n, alive, o) { o = o || {}; const r = o.r || 34;
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, on = i < alive;
      el('circle', { cx: x, cy: y, r: 12, fill: on ? ACC : PANEL, stroke: on ? ACC : BAD, 'stroke-width': 2, 'stroke-dasharray': on ? null : '3 3', opacity: o.op ?? 1 }); } }

  // 1. 노드 한 대 — SPOF
  function s1(t, c) { const { k, u, beat } = c, n = beat.cluster.nodes[0], pn = prevOf(c, n.id), VX = 520, VY = 170, up = n.up;
    const svc = [['서비스 A', 100], ['서비스 B', 180], ['서비스 C', 260]];
    if (k === 3) { const g = E(u, 0.3, 1.6); zone(30, 60, 170 + 40 * g, 230, null, { fill: BADBG, stroke: BAD, dash: '6 5', op: g * 0.9 }); }
    svc.forEach(([name, y], i) => { const bad = k === 2 || k === 3;
      el('line', { x1: 170, y1: y, x2: VX - 60, y2: VY, stroke: bad ? BADBG : GRID, 'stroke-width': 2.2 });
      card(110, y, 120, 40, { text: name, fs: 15, stroke: bad && k === 3 ? BAD : GRID, sw: 1.8, color: k === 3 ? BAD : INK });
      if (up) dot([[170, y], [VX - 60, VY]], ((t * 0.7 + i / 3) % 1), ACC, 5);
      else if (k === 2) dot([[170, y], [VX - 60, VY]], seg(u, 0.2 + i * 0.15, 1.0 + i * 0.15), BAD, 5);
      if (k === 3) mono(52, y - 27, 'connection refused', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); });
    node(VX, VY, n, pn, u, { s: k === 0 ? pop(u, 0.2) : 1, xs: k === 2 ? pop(u, 0.4) : 1 });
    if (k === 0) sub(VX, 312, '데이터 사본은 이 디스크 한 곳뿐', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 1) { pill(VX, 40, 'HA Enabled = false', WARN, pop(u, 0.2), { mono: true, fs: 14 });
      sub(VX, 312, '운영 데이터가 쌓여도 복제본은 0벌', fade(u, 1.2), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }
    if (k >= 2) [720, 870].forEach((x, i) => { const s = k === 2 ? pop(u, 1.0 + i * 0.2) : 1, col = k === 4 ? ACC : OFF;
      card(x, VY, 112, 84, { rx: 8, dash: '6 5', stroke: col, sw: 2, fill: 'none', text: k === 4 ? `vault-${i + 1}?` : '없음', fs: 15, color: k === 4 ? ACC : MUT, mono: k === 4, s }); });
    if (k === 2) sub(795, VY + 70, '넘겨받을 노드가 없다', fade(u, 1.4), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    if (k === 3) {
      sub(115, 322, '장애 반경 = Vault를 쓰는 전 서비스', fade(u, 1.6), { 'font-size': 15, fill: BAD, 'font-weight': 700, 'text-anchor': 'start', x: 34 }); }
    if (k === 4) banner(480, 370, '노드 1대 = 단일 장애점(SPOF). 여러 대로 묶는다', pop(u, 0.8)); }

  // 2. storage "raft" 로 3노드 구성
  function s2(t, c) { const { k, u, beat } = c, ns = beat.cluster.nodes, X = [220, 480, 740], VY = 170;
    if (k >= 1) grow(278, VY, 422, VY, k === 1 ? E(u, 0.8, 1.6) : 1, INFO, { plain: true, sw: 3 });
    if (k >= 2) grow(538, VY, 682, VY, k === 2 ? E(u, 0.8, 1.6) : 1, INFO, { plain: true, sw: 3 });
    if (k >= 1) mono(350, VY - 12, ':8201', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.4) : 1 });
    if (k >= 2) mono(610, VY - 12, ':8201', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.4) : 1 });
    ns.forEach((n, i) => { const fresh = i === ns.length - 1 && i === k;
      node(X[i], VY, n, prevOf(c, n.id), u, { s: fresh ? pop(u, 0.2) : 1 }); });
    if (k === 0) { snippet(430, 72, ['storage "raft" {', '  path    = "/opt/vault/data"', '  node_id = "vault-0"', '}'], { op: fade(u, 0.7), fs: 15 });
      sub(220, 312, '데이터는 이 노드 자기 디스크에', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 1) [['8200', 'API — 클라이언트가 부르는 곳'], ['8201', 'cluster_address — 노드 간 복제']].forEach(([p, d], i) => {
      mono(300, 338 + i * 34, p, { 'font-size': 16, 'font-weight': 800, fill: i ? INFO : INK, opacity: fade(u, 1.0 + i * 0.4) });
      tx(352, 338 + i * 34, d, { 'font-size': 15, fill: INK, opacity: fade(u, 1.0 + i * 0.4) }); });
    if (k >= 2) X.forEach((x, i) => mono(x, 302, `10.0.0.1${i}`, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 2 ? fade(u, 1.2 + i * 0.25) : 1 }));
    if (k === 2) sub(480, 360, 'api_addr · cluster_addr로 저마다 자기 주소를 알린다', fade(u, 2.0), { 'font-size': 15, fill: INK });
    if (k === 3) { const g = E(u, 1.2, 2.0);
      tx(60, 350, 'storage "consul"', { 'font-size': 14, class: 'mono', 'font-weight': 700, fill: MUT });
      [0, 1, 2].forEach((i) => { el('rect', { x: 230 + i * 30, y: 336, width: 22, height: 22, rx: 4, fill: PANEL, stroke: INK, 'stroke-width': 2 });
        el('circle', { cx: 350 + i * 28, cy: 347, r: 11, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: 1 - g * 0.6 }); });
      tx(232, 390, 'Vault 3대 + Consul 3대 따로 운영', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      if (g > 0) el('line', { x1: 50, y1: 346, x2: lerp(50, 440, g), y2: 346, stroke: BAD, 'stroke-width': 3 });
      tx(530, 350, 'storage "raft"', { 'font-size': 14, class: 'mono', 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      [0, 1, 2].forEach((i) => el('rect', { x: 680 + i * 30, y: 336, width: 22, height: 22, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.7 + i * 0.15) }));
      tx(532, 390, 'Vault 3대만 — 저장소가 안에 들어 있다', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) }); } }

  // 3. 로그 복제 + 과반 커밋 (삼각 배치)
  const TP = { 'vault-0': [480, 105], 'vault-1': [270, 285], 'vault-2': [690, 285] };
  function links(col) { el('line', { x1: 305, y1: 238, x2: 440, y2: 150, stroke: col || GRID, 'stroke-width': 2.2 }); el('line', { x1: 520, y1: 150, x2: 655, y2: 238, stroke: col || GRID, 'stroke-width': 2.2 }); }
  function seats(x0, y, marks, title, o) { o = o || {};
    tx(x0, y - 40, title, { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: o.op ?? 1 });
    marks.forEach((m, i) => { const cx = x0 + 18 + i * 46, col = m === 1 ? ACC : m === -1 ? BAD : GRID;
      el('circle', { cx, cy: y, r: 15, fill: m === 1 ? ACC : PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': m === -1 ? '3 3' : null, opacity: o.op ?? 1 });
      mono(cx, y + 34, 'v' + i, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); }); }
  function s3(t, c) { const { k, u, beat } = c, ns = beat.cluster.nodes;
    links(); person(80, 285, null, {}); lbl(80, 340, '클라이언트', 1);
    ns.forEach((n) => node(TP[n.id][0], TP[n.id][1], n, prevOf(c, n.id), u));
    if (k === 0) { pill(112, 222, 'kv put pw=abc', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      dot([[112, 285], [212, 285]], seg(u, 0.4, 1.1), ACC, 7);
      dot([[300, 238], [442, 150]], seg(u, 1.2, 2.1), ACC, 7);
      tx(332, 186, 'forward', { 'font-size': 14, class: 'mono', 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      sub(840, 110, '쓰기 입구는', fade(u, 1.8), { 'font-size': 15, fill: INK }); sub(840, 134, '리더 한 곳', fade(u, 1.8), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }
    if (k === 1) { pill(640, 62, 'append index=5', WARN, pop(u, 0.2), { mono: true, fs: 13.5 });
      dot([[440, 150], [305, 238]], seg(u, 0.7, 1.6), WARN, 7); dot([[520, 150], [655, 238]], seg(u, 0.7, 1.9), WARN, 7);
      sub(850, 110, 'log 5 · commit 4', fade(u, 1.6), { 'font-size': 15, fill: WARN, 'font-weight': 700, class: 'mono' }); sub(850, 136, '아직 커밋 전', fade(u, 1.8), { 'font-size': 15, fill: INK }); }
    if (k === 2) { dot([[305, 238], [440, 150]], seg(u, 0.2, 0.9), ACC, 7); tx(330, 186, 'ack', { 'font-size': 14, class: 'mono', 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.5) }); }
    if (k >= 2) { const p = k === 2 ? fade(u, 1.0) : 1;
      seats(790, 110, [1, k === 2 && u < 0.9 ? 0 : 1, 0], '저장 확인', { op: 1 });
      mono(790, 190, '2 / 3 ≥ 과반', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: p }); }
    if (k === 3) terminal(16, 16, 392, 150, ['$ vault operator raft list-peers', 'Node     Address          State     Voter', 'vault-0  10.0.0.10:8201   leader    true', 'vault-1  10.0.0.11:8201   follower  true', 'vault-2  10.0.0.12:8201   follower  true'], lerp(0.5, 5, E(u, 0.2, 1.8)), { fs: 13.5, lh: 21 });
    if (k === 4) {
      tx(30, 60, '정족수(quorum)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      mono(30, 92, 'Voter 3 → ⌊3/2⌋+1 = 2', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      tx(30, 122, 'vault-2가 늦어도 커밋된다', { 'font-size': 15, fill: INK, opacity: fade(u, 1.2) }); } }

  // 4. 리더 장애 → 투표로 새 리더
  function ecg(x0, y, w, cut, col) { const pts = []; for (let x = 0; x <= w; x += 2) { const xx = x0 + x, beatOn = x < cut, ph = (x % 36);
      pts.push([xx, y - (beatOn && ph > 14 && ph < 22 ? (ph < 18 ? (ph - 14) * 7 : (22 - ph) * 7) : 0)]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.4 }); }
  function s4(t, c) { const { k, u, beat } = c, ns = beat.cluster.nodes;
    if (k === 3) { // 홀수 vs 짝수
      tx(480, 44, '과반 = ⌊N/2⌋+1 · 견디는 대수 = N − 과반', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono' });
      [[3, 2, 140], [4, 3, 370], [5, 3, 600]].forEach(([n, q, cx], i) => { const s = pop(u, 0.2 + i * 0.35);
        if (s <= 0) return; ring(cx, 150, n, n, { op: Math.min(1, s) });
        lbl(cx, 222, `${n}노드`, Math.min(1, s), { 'font-size': 16 });
        mono(cx, 250, `과반 ${q} · ${n - q}대 허용`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: n === 4 ? WARN : ACC, opacity: fade(u, 0.5 + i * 0.35) }); });
      const g = fade(u, 1.5); if (g > 0) { [[795, 125], [835, 125], [880, 125], [920, 125]].forEach(([x, y], i) => el('circle', { cx: x + (i < 2 ? -8 : 8), cy: y + 25, r: 12, fill: WARN, opacity: g }));
        el('line', { x1: 857, y1: 100, x2: 857, y2: 200, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: g });
        mono(857, 222, '4노드가 2:2로', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: g });
        mono(857, 246, '갈리면 과반 없음', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: g }); }
      banner(480, 340, '4노드는 3노드처럼 1대만 견딘다. 늘릴 땐 홀수로', pop(u, 2.0)); return; }
    links(k >= 1 ? OFF : GRID);
    ns.forEach((n) => { const role = k === 1 && n.id === 'vault-1' ? 'candidate' : null;
      node(TP[n.id][0], TP[n.id][1], n, prevOf(c, n.id), u, { role, xs: k === 0 && n.id === 'vault-0' ? pop(u, 0.3) : 1, op: k === 2 && n.id === 'vault-0' ? 0.45 : 1 }); });
    if (k === 0) { tx(790, 70, 'heartbeat', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      ecg(790, 130, 150, lerp(150, 40, E(u, 0.3, 1.2)), BAD); sub(865, 170, '끊김 → 쓰기 멈춤', fade(u, 1.3), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
    if (k === 1) { clock(110, 150, 24, E(u, 0.2, 1.0), WARN, null); sub(110, 196, 'election timeout', fade(u, 0.3), { 'font-size': 13.5, class: 'mono', fill: WARN });
      pill(270, 168, 'term + 1', WARN, pop(u, 1.0), { mono: true, fs: 13.5 });
      grow(330, 280, 628, 280, E(u, 1.1, 1.6), WARN, { plain: true, dash: '5 4' });
      dot([[330, 280], [628, 280]], seg(u, 1.1, 1.7), WARN, 7); dot([[628, 296], [330, 296]], seg(u, 1.8, 2.5), ACC, 7);
      mono(480, 270, '투표 요청', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(480, 318, '찬성', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k >= 1) { seats(790, 110, [-1, 1, k === 1 && u < 2.3 ? 0 : 1], '표 (Voter 3)', {});
      mono(790, 190, k === 1 && u < 2.3 ? '1 / 3' : '2 / 3 과반', { 'font-size': 18, 'font-weight': 800, fill: ACC }); }
    if (k === 2) { for (let i = 0; i < 4; i++) dot([[330, 285], [630, 285]], ((t * 0.7 + i / 4) % 1), ACC, 5);
      sub(480, 318, '쓰기 재개', fade(u, 0.6), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      sub(600, 48, '돌아오면 follower로 합류', fade(u, 1.2), { 'font-size': 15, fill: INK, 'text-anchor': 'start' }); } }

  // 5. 운영 — retry_join, 정족수 표, 명령 셋
  function s5(t, c) { const { k, u, beat } = c, ns = beat.cluster.nodes, X = [200, 440, 680], VY = 170;
    ns.forEach((n, i) => node(X[i], VY, n, prevOf(c, n.id), u, { s: k === 1 && i === 2 ? pop(u, 0.2) : 1 }));
    if (k === 0) { card(680, VY, 150, 92, { rx: 8, dash: '6 5', stroke: OFF, fill: 'none', s: pop(u, 0.3) });
      mono(680, VY - 8, 'node_id =', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      mono(680, VY + 16, '"vault-2"', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 0.5) });
      sub(680, VY + 76, '설정만 있고 아직 합류 전', fade(u, 0.8), { 'font-size': 15, fill: MUT });
      ring(330, 360, 2, 2, { r: 22 }); mono(380, 366, '2노드: 과반 2 · 0대 허용', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); }
    if (k === 1) { const g = E(u, 0.6, 2.0);
      route([[700, 102], [700, 62], [440, 62], [440, 98]], g, ACC, { sw: 2.4 }); route([[660, 102], [660, 74], [200, 74], [200, 98]], g, ACC, { sw: 2.4, dash: '6 4' });
      mono(330, 52, '10.0.0.10', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(560, 52, '10.0.0.11', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) });
      pill(830, VY, 'retry_join × 2', ACC, pop(u, 0.4), { mono: true, fs: 14 });
      sub(480, 330, '부팅하면 스스로 클러스터를 찾아 들어오고 로그를 따라잡는다', fade(u, 2.0), { 'font-size': 15, fill: INK }); }
    if (k === 2) [[3, 2, 200], [4, 3, 480], [5, 3, 760]].forEach(([n, q, cx], i) => { const s = fade(u, 1.0 + i * 0.35);
      if (s <= 0) return; ring(cx - 70, 362, n, q, { r: 24, op: s });
      mono(cx - 24, 356, `${n}노드 과반 ${q}`, { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: s });
      mono(cx - 24, 380, `${n - q}대 허용`, { 'font-size': 14.5, 'font-weight': 700, fill: n === 4 ? WARN : ACC, opacity: s }); });
    if (k === 3) [['list-peers', '구성원 · 리더 확인'], ['snapshot save', '백업 (V-2-2)'], ['remove-peer', '노드 빼기']].forEach(([a, b], i) => {
      const cx = 180 + i * 300, s = pop(u, 0.3 + i * 0.4); card(cx, 352, 250, 70, { rx: 10, stroke: INFO, sw: 2, s });
      if (s > 0.2) { mono(cx, 346, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: Math.min(1, s) });
        tx(cx, 370, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: Math.min(1, s) }); } });
    if (k === 4) { const g = E(u, 0.3, 1.2);
      [0, 1, 2].forEach((i) => el('circle', { cx: 800 + i * 34, cy: VY, r: 13, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: 1 - g * 0.75 }));
      sub(834, VY + 40, 'Consul 클러스터', 1 - g * 0.6, { 'font-size': 14 });
      if (g > 0) el('line', { x1: 778, y1: VY, x2: lerp(778, 892, g), y2: VY, stroke: BAD, 'stroke-width': 3 });
      banner(480, 350, 'storage "raft" 내장 · 3노드 1대, 5노드 2대까지 견딘다', pop(u, 1.2)); } }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: '노드 1대로만 운영하던 Vault가 멈췄을 때 생기는 일은 무엇인가?',
      o: ['다른 노드가 이어받아 잠깐 느려지기만 한다', '넘겨받을 노드가 없어 Vault를 쓰는 서비스가 모두 시크릿을 못 읽는다', '읽기는 되고 쓰기만 막힌다'], a: 1,
      why: 'HA Enabled가 false인 노드 1대는 그 자체가 클러스터 전부다. 그 한 대가 멈추면 kv get도 connection refused가 된다.' },
    { q: 'Raft 노드끼리 데이터를 복제할 때 쓰는 포트는 무엇인가?',
      o: ['8201 (cluster_address)', '8200 (API)', '8500 (Consul)'], a: 0,
      why: '8200은 클라이언트가 부르는 API 포트이고, 노드 간 복제는 cluster_address 8201로 오간다. 방화벽에서 이 포트를 열어야 한다.' },
    { q: '3노드 클러스터에서 리더가 index 5를 커밋하는 조건은 무엇인가?',
      o: ['세 노드가 모두 저장했다고 답할 때', '리더가 자기 디스크에 쓰자마자', '리더를 포함해 2대가 저장했을 때'], a: 2,
      why: 'Voter 3대의 과반은 2다. 리더와 vault-1이 저장하면 vault-2가 log 3에 머물러 있어도 커밋된다.' },
    { q: '리더 vault-0이 죽은 뒤 vault-1이 새 리더가 되는 데 필요한 것은 무엇인가?',
      o: ['자기 표 하나', '전체 Voter 3대 중 과반인 2표', '죽은 vault-0의 표까지 포함한 3표'], a: 1,
      why: '과반은 살아 있는 노드가 아니라 전체 Voter 수로 센다. 자기 표와 vault-2의 표로 2/3을 채워 리더가 된다.' },
    { q: '4노드 Raft 클러스터가 견딜 수 있는 장애 대수는 무엇인가?',
      o: ['1대 (과반이 3이라서)', '2대 (절반까지)', '0대 (짝수라서)'], a: 0,
      why: '4노드의 과반은 3이라 1대만 죽어도 된다. 3노드와 같으므로 늘릴 때는 5노드로 간다.' },
  ];

  const summary = [
    '노드 1대짜리 Vault가 멈추면 그 Vault를 쓰는 모든 서비스가 시크릿을 못 읽는다.',
    'storage "raft"를 켜면 노드마다 자기 디스크에 데이터를 두고 8201 포트로 서로 복제한다.',
    '쓰기는 리더가 로그로 만들고 Voter 과반이 저장하면 커밋한다. 3노드에서는 2대다.',
    '리더가 죽으면 과반 표를 받은 노드가 이어받는다. 3노드는 1대, 5노드는 2대까지 견딘다.',
  ];
  const review = [
    { q: '3노드 중 2대가 동시에 죽었다. 남은 1대에 쓰기를 보내면 어떻게 되나?',
      o: ['남은 노드가 리더가 되어 쓰기를 받는다', '과반 2를 못 채워 리더가 없고 쓰기가 멈춘다', 'standby가 쓰기를 직접 처리한다'], a: 1,
      why: '정족수는 Voter 3대의 과반인 2다. 1대만 남으면 표도 커밋도 과반을 채우지 못한다.' },
    { q: '노드를 3대에서 4대로 늘렸는데 견디는 장애 대수가 그대로다. 이유는 무엇인가?',
      o: ['4대의 과반이 3이라 여전히 1대만 죽어도 된다', 'retry_join이 4번째 노드를 Voter로 넣지 않는다', '8201 포트를 4대가 나눠 써서'], a: 0,
      why: '과반은 ⌊N/2⌋+1이다. 3노드와 4노드 모두 1대만 견디고, 5노드가 되어야 2대를 견딘다.' },
    { q: '새 노드 설정에 retry_join을 적었는데 클러스터에 끼지 못한다. 먼저 볼 것은?',
      o: ['노드 수가 홀수인지 짝수인지', 'Consul 에이전트가 떠 있는지', '8201 복제 포트가 방화벽에 막혔는지'], a: 2,
      why: '노드끼리는 cluster_address 8201로 통신한다. 이 포트가 막히면 합류도 복제도 되지 않는다.' },
  ];

  R.page({ title: 'Raft 클러스터', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
