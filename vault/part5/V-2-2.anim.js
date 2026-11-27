/* V-2-2 백업 — raft snapshot · 오프사이트 · restore · 운영 체크리스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    server, dbIcon, person, cross, check, lock, clock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 스냅샷 파일 그림
  function snap(cx, cy, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return; const w = o.w || 54, h = o.h || 66, col = o.col || ACC, g = G(cx, cy, s, o.op);
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    tx(0, 6, '.snap', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, class: 'mono', fill: col }, g);
    if (o.name) tx(0, h / 2 + 20, o.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INK }, g); }
  function folder(cx, cy, s, col) { const g = G(cx, cy, s); el('path', { d: 'M-60,-36 H-18 L-8,-26 H60 V40 H-60 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g); }
  function bucket(cx, cy, name, s) { const g = G(cx, cy, s ?? 1);
    el('path', { d: 'M-54,-34 L-42,40 H42 L54,-34 Z', fill: INFOBG, stroke: INFO, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: 0, cy: -34, rx: 54, ry: 11, fill: PANEL, stroke: INFO, 'stroke-width': 2.5 }, g);
    tx(0, 12, 'S3', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO }, g);
    if (name) tx(0, 64, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono' }, g); }
  function keyIcon(cx, cy, s, col, dash) { const g = G(cx, cy, s), c = col || ACC;
    el('circle', { cx: -16, cy: 0, r: 11, fill: PANEL, stroke: c, 'stroke-width': 3.5, 'stroke-dasharray': dash }, g);
    el('line', { x1: -5, y1: 0, x2: 24, y2: 0, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': dash }, g);
    [14, 21].forEach((x) => el('line', { x1: x, y1: 0, x2: x, y2: 8, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g)); }
  function kmsCloud(cx, cy, s) { const g = G(cx, cy, s ?? 1);
    [[-26, 6, 20], [0, -8, 26], [28, 6, 18]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: INFOBG, stroke: INFO, 'stroke-width': 2.2 }, g));
    el('rect', { x: -44, y: 4, width: 90, height: 22, fill: INFOBG }, g); el('line', { x1: -44, y1: 26, x2: 46, y2: 26, stroke: INFO, 'stroke-width': 2.2 }, g);
    tx(0, 18, 'KMS', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO }, g); }

  // 1. 상태는 raft 안에만 있다
  const NX = [140, 300, 460];
  function s1(t, c) { const { k, u } = c, hit = k >= 2;
    pill(300, 34, 'Storage Type = raft', INK, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
    NX.forEach((x, i) => { const down = hit && (k > 2 || u > 0.4 + i * 0.4);
      server(x, 120, null, { s: 0.85, stroke: down ? BAD : INK, lamp: down ? BAD : GOOD }); lbl(x, 178, `노드 ${i + 1}`, 1, { 'font-size': 15 });
      dbIcon(x, 238, null, { s: 0.55, stroke: down ? BAD : INK });
      if (k === 0) { const f = E(u, 0.4 + i * 0.2, 1.4 + i * 0.2); el('rect', { x: x - 20, y: 248 - 26 * f, width: 40, height: 26 * f, fill: ACC, opacity: 0.6 }); } });
    if (k === 0) sub(300, 300, '외부 DB 없이 노드마다 자기 디스크에 상태를 둔다', fade(u, 1.6), { 'font-size': 15, fill: INK });
    if (k >= 1 && k <= 2) { folder(760, 120, k === 1 ? pop(u, 0.2) : 1, hit ? BAD : INK); mono(760, 186, '/opt/vault/data', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      if (k === 1) NX.forEach((x, i) => grow(x + 30, 238, 690, 140, E(u, 0.4, 1.0), GRID, { plain: true }));
      ['시크릿', '정책', '토큰', '마운트 설정'].forEach((s, i) => { const y = 222 + i * 40, gone = hit;
        card(760, y, 150, 32, { rx: 16, stroke: gone ? OFF : ACC, sw: 2, text: s, fs: 15, color: gone ? OFF : INK, op: gone ? 1 - E(u, 1.4, 2.2) * 0.6 : 1, s: k === 1 ? pop(u, 0.8 + i * 0.3) : 1 });
        if (gone && u > 1.4) el('line', { x1: 690, y1: y, x2: lerp(690, 830, E(u, 1.4, 2.0)), y2: y, stroke: BAD, 'stroke-width': 2.5 }); }); }
    if (k === 2) { [['디스크 손상', 140], ['잘못된 삭제', 300], ['전 노드 다운', 460]].forEach(([s, x], i) => pill(x, 330, s, BAD, pop(u, 0.4 + i * 0.4), { fs: 14.5 }));
      keyIcon(180, 392, 1.1, MUT); tx(220, 398, 'unseal 키가 있어도 열 데이터가 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
    if (k === 3) { zone(50, 60, 500, 300, '클러스터', { stroke: MUT, dash: '6 5', fill: 'none', op: fade(u, 0.2) });
      const g = seg(u, 0.6, 1.6); snap(lerp(300, 790, E(g, 0, 1)), lerp(200, 190, g), { s: pop(u, 0.4), w: 70, h: 86 });
      sub(790, 268, '클러스터 밖에 보관', fade(u, 1.6), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      mono(790, 300, 'snapshot save / restore', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); } }

  // 2. snapshot save
  const CELLS = ['kv 시크릿', '정책', 'auth 설정', '토큰', 'lease', '마운트 테이블'];
  function s2(t, c) { const { k, u } = c, LX = 210, LY = 160;
    [[80, 90], [80, 230]].forEach(([x, y]) => { server(x, y, null, { s: 0.55, op: 0.6 }); });
    server(LX, LY, null, { stroke: ACC }); pill(LX, LY - 62, 'LEADER', ACC, 1, { fs: 13.5 }); lbl(LX, LY + 62, 'vault-0', 1, { class: 'mono' });
    person(90, 340, null, {}); lbl(90, 394, 'operator', 1, { class: 'mono' });
    if (k === 0) { fly(110, 320, LX + 20, LY + 108, seg(u, 0.3, 1.3), 'hvs.… (스냅샷 권한)', { mono: true, fill: INFO, stay: true });
      check(LX + 120, LY + 108, 11, pop(u, 1.6)); sub(560, 170, '권한 없는 토큰은 클러스터 전체를 떠 갈 수 없다', fade(u, 1.8), { 'font-size': 15, fill: INK }); }
    const big = k === 3 || k === 4;
    if (k >= 1 && !big) { const s = k === 1 ? pop(u, 0.6) : 1; snap(600, LY, { s, w: 90, h: 110, name: 'vault-2026-08-11.snap' });
      if (k === 1) { for (let i = 0; i < 6; i++) dot([[LX + 58, LY], [552, LY]], clamp(u * 0.9 - 0.2 - i * 0.12), ACC, 5);
        pill(600, 50, 'raft snapshot save', ACC, pop(u, 0.2), { mono: true, fs: 14 });
        sub(600, 270, '끝나면 조용히 돌아온다. 종료 코드로 확인', fade(u, 2.0), { 'font-size': 15, fill: INK }); }
      if (k === 2) { mono(700, LY + 10, '42M', { 'font-size': 34, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) }); sub(740, LY + 40, '(크기는 예시)', fade(u, 1.0));
        terminal(300, 300, 620, 90, ['$ ls -lh vault-2026-08-11.snap', '-rw-------  1 vault vault  42M  vault-2026-08-11.snap'], lerp(0.5, 2, E(u, 0.2, 1.4)), { fs: 14, lh: 20 }); } }
    if (big) { zone(470, 50, 460, 290, 'vault-2026-08-11.snap 안', { fill: ACCBG, stroke: ACC, op: k === 3 ? fade(u, 0.1) : 1 });
      CELLS.forEach((s, i) => { const x = 590 + (i % 2) * 220, y = 120 + Math.floor(i / 2) * 70, p = k === 3 ? pop(u, 0.3 + i * 0.2) : 1;
        card(x, y, 200, 52, { rx: 8, stroke: ACC, sw: 2, fill: PANEL, s: p }); if (p > 0.3) { tx(x - 80, y + 6, s, { 'font-size': 15, 'font-weight': 700 }); lock(x + 74, y + 2, true, ACC, 0.7); } });
      if (k === 3) sub(700, 380, '전부 암호화된 상태 그대로 담긴다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 4) { grow(LX + 58, LY, 466, LY, 1, MUT);
        keyIcon(540, 385, 1.3, BAD, '4 4'); tx(580, 392, '열려면 원래 unseal · recovery 키가 필요', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
        fly(700, 200, 340, 300, seg(u, 1.0, 1.8), '.snap 사본', { fill: OFF, color: INK, mono: true, stay: true });
        cross(410, 300, 11, pop(u, 2.0)); sub(340, 340, '파일만으로는 못 읽는다', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); } } }

  // 3. cron + 오프사이트
  function s3(t, c) { const { k, u } = c, BX = 740, BY = 140;
    zone(30, 30, 400, 360, '클러스터 리전', { stroke: GRID, sw: 1.5 }); zone(530, 30, 400, 360, '다른 리전', { stroke: INFO, sw: 1.5, fill: 'none', color: INFO });
    server(120, 120, null, { s: 0.85 }); lbl(120, 176, 'Vault', 1); mono(300, 66, '/backup', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    bucket(BX, BY, 's3://vault-backups/prod', 1);
    if (k === 0) snippet(60, 220, ['STAMP="2026-08-11-0300"', 'SNAP="/backup/vault-${STAMP}.snap"', 'BUCKET="s3://vault-backups/prod"'], { fs: 14, op: fade(u, 0.3) });
    if (k === 1 || k === 2) { const up = k === 1 ? seg(u, 0.9, 1.9) : 1;
      if (k === 1) { snap(300, 120, { s: pop(u, 0.2) }); fly(300, 120, BX, BY, up, 'vault-…-0300.snap', { mono: true }); }
      if (up >= 1) { snap(BX + 100, BY, { s: 0.6 }); lock(BX + 136, BY - 18, true, INFO, 0.8); }
      pill(BX, 260, '--sse aws:kms', INFO, k === 1 ? pop(u, 1.9) : 1, { mono: true, fs: 14 }); }
    if (k === 2) { const g = E(u, 0.3, 1.0); snap(300, 120, { s: 1 - g * 0.7, op: 1 - g * 0.8 });
      el('path', { d: 'M282,214 L288,262 H312 L318,214 Z M278,208 H322', fill: PANEL, stroke: MUT, 'stroke-width': 2.5 });
      pill(300, 300, 'rm -f "$SNAP"', INK, pop(u, 0.9), { mono: true, fs: 14 }); sub(230, 350, '로컬 사본은 관리 사각지대가 된다', fade(u, 1.4), { 'font-size': 15, fill: INK }); }
    if (k === 3) { const cx = 230, cy = 270, r = 70, hr = E(u, 0.1, 2.6) * 6;
      el('circle', { cx, cy, r, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
      for (let h = 0; h < 24; h++) { const a = -Math.PI / 2 + h / 24 * 2 * Math.PI; el('line', { x1: cx + Math.cos(a) * (r - 8), y1: cy + Math.sin(a) * (r - 8), x2: cx + Math.cos(a) * r, y2: cy + Math.sin(a) * r, stroke: h < hr ? ACC : GRID, 'stroke-width': h < hr ? 3 : 1.5 }); }
      const a = -Math.PI / 2 + hr / 24 * 2 * Math.PI; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * (r - 18), y2: cy + Math.sin(a) * (r - 18), stroke: ACC, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
      mono(cx, cy + r + 22, '0 * * * *', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
      for (let h = 0; h < 6; h++) { const p = clamp((hr - h) * 1.5); if (p <= 0) continue; dot([[cx + 70, cy], [BX - 60, 300]], p < 1 ? p : 0, ACC, 6);
        if (p >= 1) card(BX, 230 + h * 26, 200, 22, { rx: 4, stroke: ACC, sw: 1.5, text: `vault-…-0${3 + h}00.snap`, fs: 13.5, mono: true }); }
      sub(BX, 412, '매시간 하나씩 쌓인다', fade(u, 1.0), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }
    if (k === 4) { ['Versioning', 'Lifecycle 30일', 'IAM 최소 권한', '리전 간 복제(CRR)'].forEach((s, i) => pill(230, 220 + i * 44, s, INFO, pop(u, 0.2 + i * 0.25), { fs: 14.5 }));
      const X = (d) => 580 + d * 10.5; el('line', { x1: X(0), y1: 320, x2: X(33), y2: 320, stroke: MUT, 'stroke-width': 1.8 });
      [0, 10, 20, 30].forEach((d) => mono(X(d), 344, `${d}일`, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }));
      el('line', { x1: X(30), y1: 250, x2: X(30), y2: 326, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.2) });
      for (let d = 0; d <= 33; d += 3) { const old = d > 30, op = old ? 1 - E(u, 1.4, 2.2) * 0.85 : 1; el('rect', { x: X(d) - 8, y: 290, width: 16, height: 22, rx: 3, fill: old ? BAD : ACC, opacity: op * fade(u, 0.6 + d * 0.02) }); }
      sub(X(16), 380, '30일 지난 스냅샷은 자동 삭제', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // 4. restore
  const NEW = [600, 730, 860];
  function s4(t, c) { const { k, u } = c;
    if (k === 4) { const cx = 480, cy = 210, r = 135, rx = 250, st = ['스냅샷 받기', '테스트 클러스터에 restore', 'unseal · 시크릿 확인', '걸린 시간 기록'];
      el('ellipse', { cx, cy, rx, ry: r, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
      const p = (t * 0.25) % 1, a = -Math.PI / 2 + p * 2 * Math.PI; el('circle', { cx: cx + Math.cos(a) * rx, cy: cy + Math.sin(a) * r, r: 8, fill: ACC });
      st.forEach((s, i) => { const a2 = -Math.PI / 2 + i * Math.PI / 2, x = cx + Math.cos(a2) * rx, y = cy + Math.sin(a2) * r, sc = pop(u, 0.2 + i * 0.35);
        card(x, y, tw(s, 15) + 34, 44, { rx: 22, stroke: ACC, sw: 2.2, text: s, fs: 15, s: sc }); });
      tx(cx, cy + 6, '정기 리허설', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.6) });
      sub(cx, 404, '절차를 모르는 스냅샷은 재해 때 쓰지 못한다', fade(u, 1.9), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    [100, 230, 360].forEach((x) => { server(x, 210, null, { s: 0.8, stroke: BAD, lamp: BAD, op: 0.55 }); }); cross(230, 210, 22, k === 0 ? pop(u, 0.2) : 1);
    lbl(230, 268, '무너진 클러스터', 1, { fill: BAD });
    const restored = k > 1 || (k === 1 && u > 1.6), unsealed = k >= 3 || (k === 2 && u > 2.0);
    NEW.forEach((x, i) => { server(x, 210, null, { s: 0.8, stroke: unsealed ? GOOD : INK, lamp: unsealed ? GOOD : OFF, op: k === 0 ? fade(u, 0.3 + i * 0.15) : 1 });
      const f = k === 1 ? E(u, 0.8 + i * 0.15, 1.6 + i * 0.15) : restored ? 1 : 0;
      el('rect', { x: x - 30, y: 254, width: 60, height: 12, rx: 3, fill: SOFT, stroke: GRID }); el('rect', { x: x - 30, y: 254, width: 60 * f, height: 12, rx: 3, fill: ACC }); });
    lbl(730, 290, '새 클러스터', 1);
    bucket(480, 74, null, 0.8);
    if (k === 0) { fly(480, 80, 730, 140, seg(u, 0.8, 1.8), 'vault-2026-08-11.snap', { mono: true, stay: true }); sub(480, 345, '같은 auto-unseal 설정으로 새로 띄운다', fade(u, 1.8), { 'font-size': 15, fill: INK }); }
    if (k === 1) { pill(730, 50, 'snapshot restore -force', WARN, pop(u, 0.2), { mono: true, fs: 14 });
      NEW.forEach((x, i) => dot([[730, 120], [x, 170]], seg(u, 0.6 + i * 0.15, 1.3 + i * 0.15), ACC, 6));
      sub(480, 340, '새로 init한 클러스터는 키가 달라 -force로 검사를 건너뛴다', fade(u, 1.4), { 'font-size': 15, fill: INK });
      sub(480, 372, '대상 클러스터의 지금 데이터는 스냅샷 내용으로 덮어써진다', fade(u, 1.9), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
    if (k === 2) { zone(40, 316, 420, 96, '(a) Shamir', { stroke: INK, sw: 1.5, fill: 'none', op: fade(u, 0.2) }); zone(500, 316, 420, 96, '(b) auto-unseal', { stroke: INFO, sw: 1.5, fill: 'none', color: INFO, op: fade(u, 0.6) });
      [0, 1, 2].forEach((i) => { card(110 + i * 64, 372, 50, 30, { rx: 6, stroke: ACC, text: 'K' + (i + 1), mono: true, fs: 14, color: ACC, s: pop(u, 0.4 + i * 0.2) }); });
      tx(310, 378, '원래 키로 수동', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      kmsCloud(590, 384, 0.8 * pop(u, 0.9)); tx(660, 378, '같은 KMS 키면 자동', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) }); }
    if (k === 3) { terminal(40, 312, 560, 104, ['$ vault status | grep Sealed', 'Sealed          false', '$ vault kv get secret/prod/db'], lerp(0.5, 3, E(u, 0.2, 1.4)), { fs: 14, lh: 20 });
      check(660, 340, 12, pop(u, 1.0)); tx(690, 346, 'Sealed=false', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.0) });
      check(660, 386, 12, pop(u, 1.6)); tx(690, 392, '시크릿이 실제로 읽힌다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); } }

  // 5. 운영 체크리스트
  function areaIcon(area, x, y, col) { if (area === 'seal') lock(x, y + 4, true, col, 0.8);
    else if (area === 'HA') [-12, 0, 12].forEach((d, i) => el('circle', { cx: x + d, cy: y + (i === 1 ? -6 : 5), r: 6, fill: col }));
    else if (area === 'audit') { el('rect', { x: x - 10, y: y - 13, width: 20, height: 26, rx: 3, fill: PANEL, stroke: col, 'stroke-width': 2 }); [0, 1, 2].forEach((i) => el('line', { x1: x - 5, y1: y - 6 + i * 6, x2: x + 5, y2: y - 6 + i * 6, stroke: col, 'stroke-width': 2 })); }
    else if (area === 'backup') snap(x, y, { s: 0.42, col });
    else [-9, 9].forEach((d) => el('rect', { x: x + d - 7, y: y - 10, width: 14, height: 20, rx: 2, fill: PANEL, stroke: col, 'stroke-width': 2 })); }
  function s5(t, c) { const { k, u, beat } = c, rows = beat.checklist, prevN = c.prev ? c.prev.checklist.length : 0;
    rows.forEach((r, i) => { const y = 60 + i * 54, fresh = i >= prevN, s = fresh ? pop(u, 0.2 + (i - prevN) * 0.4) : 1, col = r.ok ? GOOD : WARN;
      if (s <= 0.02) return;
      card(480, y, 880, 44, { rx: 10, stroke: r.ok ? GRID : WARN, sw: r.ok ? 1.5 : 2, fill: r.ok ? PANEL : WARNBG, s });
      if (s < 0.5) return;
      areaIcon(r.area, 76, y, r.ok ? INK : WARN); mono(110, y + 6, r.area, { 'font-size': 15, 'font-weight': 800, fill: r.ok ? INK : WARN });
      tx(200, y + 6, r.label, { 'font-size': 15, 'font-weight': 700 });
      tx(800, y + 6, r.note.replace(/^⚠️\s*/, ''), { 'text-anchor': 'end', 'font-size': 14, fill: MUT });
      if (r.ok) check(888, y, 10, fresh ? pop(u, 0.6 + (i - prevN) * 0.4) : 1); else mono(888, y + 5, '미완', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN }); });
    const done = rows.filter((r) => r.ok).length;
    pill(480, 392, `${done} / ${rows.length} 갖춤`, done === rows.length ? GOOD : WARN, 1, { mono: true, fs: 15 }); }

  const quiz = [
    { q: '3노드 Raft HA가 있어도 스냅샷 백업이 따로 필요한 이유는 무엇인가?',
      o: ['잘못된 삭제나 전 노드 손상까지 복제가 막아 주지 못해서', 'HA 클러스터는 디스크에 데이터를 두지 않아서', 'unseal 키만 있으면 데이터를 되살릴 수 있어서'], a: 0,
      why: '복제는 노드 1~2대 장애를 막을 뿐, secrets disable 같은 삭제는 모든 노드에 그대로 퍼진다. 그때는 밖에 둔 스냅샷만 남는다.' },
    { q: '유출된 스냅샷 파일만으로 시크릿을 읽을 수 없는 이유는 무엇인가?',
      o: ['파일이 압축돼 있어서', '암호화된 상태로 담겨 원래 키가 있어야 열려서', '스냅샷에는 시크릿이 빠져 있어서'], a: 1,
      why: 'snapshot save는 저장소를 암호화된 상태 그대로 떠낸다. 복구하려면 원래 unseal 또는 recovery 키가 있어야 한다.' },
    { q: '스냅샷을 Vault 서버의 /backup에만 쌓아 둘 때 생기는 문제는 무엇인가?',
      o: ['파일 이름이 겹친다', 'cron이 돌지 않는다', '그 서버가 죽을 때 스냅샷도 같이 사라진다'], a: 2,
      why: '같은 서버에 둔 백업은 그 서버와 운명을 같이한다. 그래서 다른 리전의 S3로 올리고 로컬 사본은 지운다.' },
    { q: 'snapshot restore를 마친 대상 클러스터에 남는 데이터는 무엇인가?',
      o: ['스냅샷을 뜬 시점의 데이터', '기존 데이터와 스냅샷을 합친 것', '기존 데이터만'], a: 0,
      why: 'restore는 덮어쓰기다. 대상 클러스터의 지금 상태는 사라지고 vault-2026-08-11.snap 시점으로 돌아간다.' },
    { q: '이 장의 운영 체크리스트에서 끝까지 미완으로 남은 두 칸은 무엇인가?',
      o: ['auto-unseal과 audit 이중화', '복구 리허설과 DR replication', 'cron 등록과 S3 업로드'], a: 1,
      why: 'seal·HA·audit·backup은 갖췄지만 복구 리허설은 아직 안 했고, DR replication은 Enterprise 선택 항목으로 남았다.' },
  ];

  const summary = [
    'Raft 클러스터가 통째로 망가지거나 삭제 실수가 복제되면 시크릿이 전부 사라진다.',
    'raft snapshot save는 리더가 상태를 암호화된 파일 하나로 떠내고, 열려면 원래 키가 필요하다.',
    '스냅샷은 cron으로 매시간 떠서 다른 리전 S3에 올리고, 30일 지난 것은 lifecycle로 지운다.',
    'restore는 지금 데이터를 덮어쓰므로 리허설로 절차와 키 준비를 미리 맞춰 둔다.',
  ];
  const review = [
    { q: '누군가 vault secrets disable로 엔진을 지웠다. 3노드 HA인데 되살릴 방법은?',
      o: ['리더를 재시작한다', '삭제 전에 떠 둔 스냅샷으로 restore한다', '팔로워에서 지운 데이터를 읽어 온다'], a: 1,
      why: '삭제도 쓰기라 과반 커밋을 거쳐 모든 노드에 퍼진다. 지우기 전 시점의 스냅샷만이 그 상태를 되돌린다.' },
    { q: 'Shamir 클러스터를 스냅샷으로 새로 세웠다. unseal에 쓸 조각은?',
      o: ['스냅샷을 뜬 원래 클러스터의 조각', '새 클러스터를 init할 때 받은 조각', 'auto-unseal의 recovery key 조각'], a: 0,
      why: 'restore 뒤에는 스냅샷 안의 키 체계가 쓰인다. 그래서 원래 클러스터의 unseal 키를 백업 계획에 함께 넣는다.' },
    { q: '매시간 백업이 돈다고 믿었는데 재해 때 S3에 최근 파일이 없었다. 미리 했어야 할 것은?',
      o: ['audit device를 하나 더 켠다', 'operator rotate로 encryption key를 바꾼다', 'S3 최신 파일 확인과 복구 리허설을 정기적으로 한다'], a: 2,
      why: '설정만 보고 안심하면 안 된다. aws s3 ls로 최신 스냅샷이 쌓이는지 보고, 리허설로 실제 복구까지 확인해야 한다.' },
  ];

  R.page({ title: '백업과 복구', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
