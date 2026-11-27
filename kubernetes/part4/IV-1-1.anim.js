/* IV-1-1 Volume · PV · PVC — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * PV 상태·PVC 요청·Pod 상태는 STEPS 의 pvs · pvcs · pod 를 읽는다. 용량·사용량 숫자는 코드(pv.yaml, df/du 예시 출력)의 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    dbIcon, server, cross, check, lock, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const ST = { available: ['Available', INFO], bound: ['Bound', ACC], pending: ['Pending', WARN], idle: ['미등록', OFF] };
  const stPill = (cx, cy, s, sc) => { const [t, col] = ST[s] || ST.idle; return pill(cx, cy, t, col, sc, { fs: 13.5 }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 폴더 모양 (emptyDir · 마운트 디렉터리)
  function folder(cx, cy, w, h, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), x = -w / 2, y = -h / 2;
    el('path', { d: `M${x},${y + 8} h${w * 0.34} l8,-8 h${w * 0.66 - 8} v${h} h${-w} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round' }, g);
    if (o.text) tx(0, 6, o.text, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: o.color || INK }, g); return g; }
  // PVC 신청서 카드
  function claim(cx, cy, o) { o = o || {}; const w = o.w || 230, h = o.h || 200, g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2 }, g);
    el('path', { d: `M${w / 2 - 26},${-h / 2} v18 h18`, fill: 'none', stroke: GRID, 'stroke-width': 2 }, g);
    tx(-w / 2 + 14, -h / 2 + 26, 'PVC', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }, g);
    mono(-w / 2 + 52, -h / 2 + 26, 'pvc-data', { 'font-size': 15, 'font-weight': 800 }, g);
    (o.rows || []).forEach(([k, v, on], i) => { const y = -h / 2 + 62 + i * 32;
      tx(-w / 2 + 14, y, k, { 'font-size': 13.5, fill: MUT }, g);
      el('line', { x1: -w / 2 + 112, y1: y + 6, x2: w / 2 - 14, y2: y + 6, stroke: GRID, 'stroke-width': 1.5 }, g);
      if (on > 0) mono(-w / 2 + 116, y, v, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: on }, g); });
    return g; }

  // ---------- 1. emptyDir ----------
  function s1(t, c) { const { k, u } = c;
    zone(30, 30, 540, 360, 'node-1');
    const dead = k === 3, pk = dead ? BAD : INK;
    el('rect', { x: 60, y: 62, width: 480, height: 300, rx: 14, fill: PANEL, stroke: pk, 'stroke-width': 2.4, 'stroke-dasharray': dead ? '7 6' : null, opacity: dead ? lerp(1, 0.55, E(u, 1.0, 2.0)) : 1 });
    tx(78, 88, 'Pod web', { 'font-size': 15, 'font-weight': 700, fill: pk });
    card(180, 150, 150, 58, { rx: 8, text: 'app\nmyapp:v1', fs: 14, mono: true });
    // 마운트 지점
    const mu = k === 0 ? E(u, 0.3, 1.2) : 1;
    grow(180, 179, 180, 252, mu, ACC, { plain: true });
    if (mu > 0.5) mono(192, 222, '/tmp/cache', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.9) : 1 });
    // 볼륨
    const made = k >= 1, vs = k === 1 ? pop(u, 0.2) : 1;
    folder(180, 290, 150, 64, { dash: made ? null : '6 5', stroke: made ? ACC : MUT, fill: made ? ACCBG : PANEL, text: made ? 'cache' : 'cache ?', color: made ? ACC : MUT, s: made ? vs : (k === 0 ? fade(u, 1.2) : 1) });
    if (k === 0) sub(180, 346, 'emptyDir 이름만 참조', fade(u, 1.6));
    if (k >= 1) sub(180, 346, 'emptyDir: {}', 1, { class: 'mono', fill: ACC, 'font-weight': 700 });
    // sidecar
    if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1;
      card(410, 150, 150, 58, { rx: 8, text: 'sidecar\n로그 전달', fs: 14, s, stroke: INFO });
      R.el('path', { d: 'M410,179 C410,250 300,290 258,290', fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: s });
      if (k === 2) { for (let i = 0; i < 4; i++) dot([[180, 182], [180, 255]], (t * 0.7 + i / 4) % 1, ACC, 5);
        for (let i = 0; i < 4; i++) dot([[258, 290], [330, 280], [410, 182]], (t * 0.7 + i / 4) % 1, INFO, 5); } }
    if (dead) cross(300, 212, 26, pop(u, 0.3));
    // 오른쪽: 사용량과 수명
    tx(610, 70, 'cache 볼륨 사용량', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const mb = k === 0 ? 0 : k === 1 ? 50 * E(u, 0.6, 1.8) : k === 2 ? 50 : 50 * (1 - E(u, 0.9, 2.0));
    mono(610, 124, k === 0 ? '—' : Math.round(mb) + ' MB', { 'font-size': 40, 'font-weight': 800, fill: dead && u > 1.6 ? BAD : ACC });
    hbar(610, 146, 250, mb, 50, { label: false, col: dead ? BAD : ACC });
    if (k === 2) note(610, 214, '두 컨테이너가 같은 디렉터리를', fade(u, 1.2)), note(610, 238, '읽고 쓴다', fade(u, 1.2));
    if (dead) [['컨테이너 재시작', '유지', GOOD], ['Pod 삭제', '0', BAD], ['다른 노드로 재배치', '0', BAD]].forEach(([a, b, col], i) => {
      const y = 214 + i * 46, op = fade(u, 1.2 + i * 0.35);
      note(610, y, a, op); mono(900, y, b, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: op });
      el('line', { x1: 610, y1: y + 14, x2: 900, y2: y + 14, stroke: GRID, 'stroke-width': 1, opacity: op }); });
    // 수명 줄
    const L = [600, 900], ly = 378, pos = [0.12, 0.35, 0.6, 1][k];
    el('line', { x1: L[0], y1: ly, x2: L[1], y2: ly, stroke: GRID, 'stroke-width': 3 });
    tx(L[0], ly + 22, 'Pod 생성', { 'font-size': 13.5, fill: MUT }); tx(L[1], ly + 22, 'Pod 삭제', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    el('circle', { cx: lerp(L[0], L[1], tween(c.prev ? [0.12, 0.35, 0.6, 1][k - 1] : 0.12, pos, u)), cy: ly, r: 7, fill: dead ? BAD : ACC }); }

  // ---------- 2. PV 풀 ----------
  const XS = [190, 480, 770];
  function pvPool(c, o) { o = o || {}; const pvs = c.beat.pvs, names = ['pv-small-10gi', 'pv-medium-100gi', 'pv-large-500gi'];
    pvs.forEach((p, i) => { const prev = c.prev ? c.prev.pvs[i].status : 'idle', isNew = prev === 'idle' && p.status !== 'idle';
      if (p.status === 'idle') { dbIcon(XS[i], 140, null, { stroke: GRID, fill: SOFT }); mono(XS[i], 210, names[i], { 'font-size': 14, fill: OFF, 'text-anchor': 'middle' }); return; }
      const s = isNew ? pop(c.u, 0.2) : 1;
      dbIcon(XS[i], 140, null, { s, stroke: p.status === 'bound' ? ACC : INK });
      mono(XS[i], 210, names[i], { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
      hbar(XS[i] - 110, 226, 180, parseInt(p.size, 10), 500, { u: isNew ? E(c.u, 0.6, 1.6) : 1, text: p.size, h: 16 });
      if (!o.noPill) stPill(XS[i], 282, p.status, isNew ? pop(c.u, 1.2) : 1); }); }
  function s2(t, c) { const { k, u } = c, pvs = c.beat.pvs;
    tx(40, 40, 'PV 풀 · 관리자가 미리 등록', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const n = pvs.filter((p) => p.status === 'available').length, n0 = c.prev ? c.prev.pvs.filter((p) => p.status === 'available').length : 0;
    mono(920, 42, 'Available ' + Math.round(tween(n0, n, u)), { 'font-size': 18, 'font-weight': 800, fill: INFO, 'text-anchor': 'end' });
    pvPool(c, { noPill: k === 3 });
    if (k === 3) { terminal(110, 262, 740, 150, ['$ kubectl get pv', 'NAME              CAPACITY   STATUS      STORAGECLASS',
      ['pv-small-10gi     10Gi       Available   standard', 'var(--term)'], ['pv-medium-100gi   100Gi      Available   standard', 'var(--term)'], ['pv-large-500gi    500Gi      Available   standard', 'var(--term)']], 1 + E(u, 0.2, 2.0) * 4, { fs: 13.5, lh: 21 }); return; }
    // NFS 서버와 연결
    const nfs = [480, 370], on = (i) => pvs[i].status !== 'idle';
    pill(nfs[0], nfs[1], 'nfs.example.com  /exports/…', MUT, k === 0 ? fade(u, 1.4) : 1, { mono: true, fs: 13.5 });
    XS.forEach((x, i) => { if (!on(i)) return; const isNew = (!c.prev || c.prev.pvs[i].status === 'idle');
      el('line', { x1: x, y1: 300, x2: lerp(x, nfs[0], 0.7), y2: nfs[1] - 16, stroke: GRID, 'stroke-width': 1.8, 'stroke-dasharray': '4 5', opacity: isNew ? fade(u, 1.5) : 1 }); }); }

  // ---------- 3. PVC 매칭 ----------
  const PX = 470, PW = 260, gx = (v) => PX + (PW * v) / 500;
  function s3(t, c) { const { k, u } = c, pvc = c.beat.pvcs[0], pvs = c.beat.pvs;
    const rows = [['accessModes', 'RWO'], ['class', 'standard'], ['storage', '50Gi']].map(([a, b]) => [a, b, k === 0 ? 0 : k === 1 ? fade(u, 0.3, 0.5) : 1]);
    if (k === 1) rows.forEach((r, i) => { r[2] = fade(u, 0.3 + i * 0.45); });
    claim(150, 200, { rows, s: k === 0 ? pop(u, 0.2) : 1, stroke: pvc.status === 'bound' ? ACC : INK });
    stPill(150, 330, pvc.status, k === 3 ? pop(u, 0.9) : 1);
    if (pvc.status === 'bound') mono(150, 370, 'VOLUME pv-medium-100gi', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.3) : 1 });
    // PV 줄
    tx(PX, 62, '용량', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(790, 62, 'class · 모드 · 용량', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' });
    const names = ['pv-small-10gi', 'pv-medium-100gi', 'pv-large-500gi'];
    pvs.forEach((p, i) => { const y = 120 + i * 92, pick = p.status === 'bound';
      if (pick) el('rect', { x: PX - 14, y: y - 38, width: 474, height: 76, rx: 10, fill: ACCBG, opacity: k === 2 ? fade(u, 1.9) : 1 });
      mono(PX, y - 12, names[i], { 'font-size': 14.5, 'font-weight': 700, fill: k >= 2 && i === 0 ? OFF : INK });
      hbar(PX, y + 2, PW, parseInt(p.size, 10), 500, { h: 14, label: false, col: pick ? ACC : i === 0 && k >= 2 ? OFF : INFO });
      mono(PX + PW - 2, y - 12, p.size, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      if (k >= 2) { const a = k === 2 ? 0.2 : -9;
        check(765, y, 8, pop(u, a + 0.0)); check(790, y, 8, pop(u, a + 0.4));
        if (i === 0) R.cross(815, y, 8, pop(u, a + 0.8)); else check(815, y, 8, pop(u, a + 0.8));
        const tag = i === 0 ? ['용량 부족', BAD] : i === 1 ? ['가장 작은 후보', ACC] : ['더 큼 · 대기', MUT];
        tx(836, y + 5, tag[0], { 'font-size': 13.5, 'font-weight': 700, fill: tag[1], opacity: fade(u, a + 1.2) }); } });
    // 50Gi 기준선
    if (k >= 1) { const op = k === 1 ? fade(u, 1.6) : 1;
      [120, 212, 304].forEach((y) => el('line', { x1: gx(50), y1: y - 6, x2: gx(50), y2: y + 26, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: op }));
      mono(gx(50) + 6, 356, '요청 50Gi', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: op }); }
    if (k === 3) { grow(268, 200, PX - 18, 212, E(u, 0.2, 0.9), ACC);
      mono(700, 400, 'Available 2 그대로', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); } }

  // ---------- 4. Pod 마운트 ----------
  const PODX = 160, PVCX = 450, PVX = 660, NFSX = 860, Y4 = 190;
  function podDb(cx, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1;
    const g = R.G(cx, Y4, s, op);
    el('rect', { x: -130, y: -120, width: 260, height: 250, rx: 14, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.4, 'stroke-dasharray': o.dash }, g);
    tx(-114, -94, o.name || 'Pod db', { 'font-size': 15, 'font-weight': 700, fill: o.stroke || INK }, g);
    el('rect', { x: -100, y: -74, width: 200, height: 52, rx: 8, fill: SOFT, stroke: INK, 'stroke-width': 2 }, g);
    tx(0, -42, 'postgres:16', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' }, g);
    return g; }
  function s4(t, c) { const { k, u } = c;
    podDb(PODX, { s: k === 0 ? pop(u, 0.2) : 1 });
    folder(PODX, Y4 + 52, 170, 54, { stroke: k >= 2 ? ACC : MUT, fill: k >= 2 ? ACCBG : PANEL, dash: k >= 1 ? null : '6 5', text: 'data', color: k >= 2 ? ACC : MUT, op: k === 0 ? fade(u, 0.8) : 1 });
    mono(PODX, Y4 + 110, '/var/lib/postgresql/data', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: k === 0 ? fade(u, 1.2) : 1 });
    // PVC · PV · NFS (앞 장면에서 이미 Bound)
    card(PVCX, Y4, 150, 66, { rx: 8, text: 'PVC\npvc-data', fs: 14.5, mono: true, stroke: ACC });
    dbIcon(PVX, Y4 - 6, null, { stroke: ACC });
    mono(PVX, Y4 + 56, 'pv-medium-100gi', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    server(NFSX, Y4 - 10, 'NFS 디스크', {});
    el('line', { x1: PVCX + 76, y1: Y4, x2: PVX - 46, y2: Y4, stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' });
    tx((PVCX + 76 + PVX - 46) / 2, Y4 - 14, 'Bound', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    el('line', { x1: PVX + 46, y1: Y4, x2: NFSX - 58, y2: Y4, stroke: GRID, 'stroke-width': 2.2 });
    // claimName 연결
    if (k >= 1) { grow(PODX + 131, Y4 + 20, PVCX - 76, Y4 + 4, k === 1 ? E(u, 0.2, 1.0) : 1, ACC);
      mono((PODX + PVCX) / 2 + 30, Y4 - 30, 'claimName', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.9) : 1 }); }
    if (k === 2) { dot([[NFSX - 58, Y4], [PVX + 46, Y4], [PVX - 46, Y4], [PVCX + 76, Y4], [PVCX - 76, Y4 + 4], [PODX + 85, Y4 + 52]], seg(u, 0.2, 1.6), ACC, 8);
      pill(PVX + 80, Y4 - 92, 'kubelet: NFS 마운트 → bind mount', ACC, pop(u, 1.4), { fs: 13.5 });
      for (let i = 0; i < 3; i++) dot([[PODX + 85, Y4 + 52], [PVCX - 76, Y4 + 4], [PVCX + 76, Y4], [PVX - 46, Y4], [PVX + 46, Y4], [NFSX - 58, Y4]], seg(u, 1.8 + i * 0.2, 2.6 + i * 0.1), INFO, 5); }
    if (k === 3) { const g = tween(0, 12, u, 1.4);
      tx(PVX - 110, 330, 'df -h  (예시 출력)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      hbar(PVX - 110, 344, 300, g, 100, { h: 20, text: Math.round(g) + 'G / 100G' });
      sub(PVX + 40, 396, '컨테이너 경로 뒤에 있는 것은 PV의 NFS 디스크', fade(u, 1.6), { 'font-size': 14 }); } }

  // ---------- 5. 재기동해도 남는다 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { const layers = [['Pod', 'stateless · 언제든 교체된다', INK, PANEL], ['PVC', '신청서 · Pod가 없어도 Bound', ACC, ACCBG], ['PV', '실제 디스크 · 100Gi NFS', INFO, INFOBG]];
      layers.forEach(([a, b, col, bg], i) => { const y = 80 + i * 92, s = pop(u, 0.2 + i * 0.35);
        card(480, y, 640, 72, { rx: 12, stroke: col, fill: bg, sw: 2.4, s });
        tx(200, y + 7, a, { 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.35) });
        tx(300, y + 6, b, { 'font-size': 16, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.35) }); });
      grow(480, 116, 480, 136, fade(u, 1.4), MUT); grow(480, 208, 480, 228, fade(u, 1.5), MUT);
      banner(480, 378, 'StatefulSet은 Pod와 PVC 짝을 자동으로 만든다', pop(u, 1.8)); return; }
    zone(24, 40, 290, 300, 'node-1'); zone(330, 40, 290, 300, 'node-2');
    // 영속 계층 (오른쪽)
    const glow = k === 1 ? 0.5 + 0.5 * Math.sin(u * 6) : 0;
    card(720, 120, 160, 60, { rx: 8, text: 'pvc-data', fs: 15, mono: true, stroke: ACC, sw: 2.4 + glow * 2 });
    stPill(720, 172, 'bound', 1);
    dbIcon(720, 262, null, { stroke: ACC }); mono(720, 330, 'pv-medium-100gi', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    el('line', { x1: 720, y1: 186, x2: 720, y2: 222, stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' });
    mono(720, 368, '12G 사용 중', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    if (k === 1) { check(820, 120, 10, pop(u, 0.4)); check(800, 262, 10, pop(u, 0.7)); note(780, 410, 'Pod가 없어도 둘 다 Bound', fade(u, 1.0), { 'text-anchor': 'middle', fill: ACC }); }
    // 옛 Pod (node-1)
    const old = k === 0 ? 1 - E(u, 1.0, 2.2) * 0.65 : 0.35;
    podMini(169, 190, 'db (삭제됨)', old, BAD, true);
    if (k === 0) { cross(169, 190, 26, pop(u, 0.5)); el('line', { x1: 250, y1: 190, x2: 638, y2: 128, stroke: ACC, 'stroke-width': 2.4, opacity: 1 - E(u, 0.6, 1.4) }); }
    // 새 Pod (node-2)
    if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1;
      podMini(475, 190, 'db (새 Pod)', s, ACC, false);
      grow(555, 182, 638, 130, k === 2 ? E(u, 0.8, 1.6) : 1, ACC);
      if (k === 2) mono(475, 290, 'claimName: pvc-data', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 3) { ['PG_VERSION', 'base/', 'global/', 'pg_wal/'].forEach((f, i) => { const s = pop(u, 0.2 + i * 0.25);
        card(410 + (i % 2) * 130, 260 + Math.floor(i / 2) * 36, 120, 30, { rx: 6, text: f, fs: 13.5, mono: true, s, stroke: GRID }); });
      pill(475, 106, 'du -sh → 12G', GOOD, pop(u, 1.4), { mono: true, fs: 14 }); sub(475, 378, '예시 출력 · 죽기 전 데이터 그대로', fade(u, 1.8)); } }
  function podMini(cx, cy, name, op, col, gone) { const g = R.G(cx, cy, 1, op);
    el('rect', { x: -80, y: -56, width: 160, height: 112, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': gone ? '6 5' : null }, g);
    tx(0, -30, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col }, g);
    tx(0, -2, 'postgres:16', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g);
    el('rect', { x: -50, y: 14, width: 100, height: 26, rx: 5, fill: gone ? SOFT : ACCBG, stroke: gone ? GRID : ACC, 'stroke-width': 1.6 }, g);
    tx(0, 32, '/data', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: gone ? OFF : ACC, 'font-weight': 700 }, g); }

  const quiz = [
    { q: 'emptyDir 볼륨의 데이터가 사라지는 경우는 무엇인가?',
      o: ['컨테이너 하나가 죽었다가 다시 뜰 때', 'Pod가 지워지거나 다른 노드로 옮겨질 때', '같은 Pod의 sidecar가 그 디렉터리를 읽을 때'], a: 1,
      why: 'emptyDir은 Pod와 수명이 같다. 컨테이너 재시작에는 남지만 Pod가 노드에서 지워지면 50MB 캐시도 함께 0이 된다.' },
    { q: 'PV 세 개를 막 등록했을 때 kubectl get pv의 STATUS는 무엇인가?',
      o: ['Bound', 'Pending', 'Available'], a: 2,
      why: '관리자가 만든 PV는 신청서(PVC)가 오기 전까지 Available로 기다린다. 10Gi, 100Gi, 500Gi 셋 다 그렇다.' },
    { q: '50Gi를 요청한 PVC는 10Gi · 100Gi · 500Gi PV 중 어디에 붙는가?',
      o: ['100Gi PV', '500Gi PV', '10Gi PV 다섯 개'], a: 0,
      why: 'class와 accessModes가 맞는 PV 중 요청 이상인 가장 작은 것을 고른다. 10Gi는 모자라고 500Gi보다 100Gi가 작다.' },
    { q: 'Pod가 PV를 쓰려면 volumes에 무엇을 적는가?',
      o: ['PV 이름 pv-medium-100gi', 'NFS 서버 주소', 'PVC 이름 claimName: pvc-data'], a: 2,
      why: 'Pod는 PVC만 안다. kubelet이 pvc-data에서 pv-medium-100gi를 찾아 NFS를 붙인 뒤 컨테이너 경로에 연결한다.' },
    { q: 'db Pod를 지우고 같은 매니페스트로 다시 만들면 /data는 어떻게 되는가?',
      o: ['빈 디렉터리로 새로 시작한다', '같은 PVC를 가리키므로 12G 데이터가 그대로 있다', '새 PV가 자동으로 하나 더 생긴다'], a: 1,
      why: 'Pod를 지워도 PVC는 Bound를 유지한다. 새 Pod가 같은 claimName으로 뜨면 같은 디스크가 붙는다.' },
  ];

  const summary = [
    'emptyDir는 Pod와 수명이 같아서 Pod가 지워지면 데이터도 사라진다.',
    '관리자는 PV를 풀에 미리 올려 두고, 개발자는 필요한 용량을 PVC로 신청한다.',
    'PVC는 class와 접근 모드가 맞고 용량이 충분한 PV 중 가장 작은 것에 묶인다.',
    'Pod는 claimName으로 PVC를 가리키므로 Pod를 다시 만들어도 같은 디스크를 쓴다.',
  ];
  const review = [
    { q: 'PVC를 만들었는데 STATUS가 계속 Pending이다. 먼저 의심할 것은?',
      o: ['Pod가 아직 PVC를 마운트하지 않았다', '조건(class, 접근 모드, 용량)에 맞는 Available PV가 없다', 'emptyDir 용량이 모자란다'], a: 1,
      why: 'PVC는 Pod와 상관없이 맞는 PV를 찾으면 Bound가 된다. 50Gi 요청에 10Gi PV만 있으면 묶일 곳이 없다.' },
    { q: 'DB 데이터를 emptyDir에 두었더니 배포 뒤 데이터가 모두 사라졌다. 고칠 방법은?',
      o: ['PVC를 만들고 Pod의 volumes를 persistentVolumeClaim으로 바꾼다', 'emptyDir에 sidecar를 하나 더 붙인다', 'mountPath를 /tmp 아래로 옮긴다'], a: 0,
      why: '배포는 Pod를 새로 만든다. Pod와 수명이 같은 emptyDir 대신 Pod 밖에서 살아 있는 PVC와 PV에 써야 한다.' },
    { q: '100Gi PV에 묶인 PVC를 쓰던 Pod가 지워졌다. 이 PV 상태는?',
      o: ['Available로 돌아가 다른 PVC가 가져간다', 'Pod와 함께 삭제된다', 'PVC가 남아 있으니 Bound 그대로다'], a: 2,
      why: '바인딩은 PV와 PVC 사이의 일이다. Pod가 사라져도 pvc-data가 있으면 PV는 Bound로 남는다.' },
  ];

  R.page({ title: 'PV · PVC 바인딩', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
