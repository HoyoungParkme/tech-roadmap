/* V-1-2 seal / unseal — Shamir 조각과 auto-unseal — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    server, person, cross, check, lock, terminal, snippet, axes, scatter, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, INFO, INFOBG } = C;

  // 열쇠 그림
  function keyIcon(cx, cy, s, col, o) { o = o || {}; const g = G(cx, cy, s, o.op), c = col || ACC;
    el('circle', { cx: -16, cy: 0, r: 11, fill: o.fill || PANEL, stroke: c, 'stroke-width': 3.5, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: -5, y1: 0, x2: 24, y2: 0, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash }, g);
    [14, 21].forEach((x) => el('line', { x1: x, y1: 0, x2: x, y2: 8, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash }, g)); return g; }
  // 키 조각
  const piece = (cx, cy, label, col, s, o) => card(cx, cy, 54, 32, Object.assign({ rx: 6, stroke: col || ACC, sw: 2.2, fill: (o && o.fill) || PANEL, text: label, fs: 14.5, mono: true, color: col || ACC, s }, o || {}));
  // 클라우드 KMS
  function cloud(cx, cy, name, op) { const g = G(cx, cy, 1, op);
    [[-34, 6, 26], [0, -10, 34], [36, 6, 24]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5 }, g));
    el('rect', { x: -58, y: 4, width: 118, height: 28, fill: INFOBG }, g);
    el('line', { x1: -58, y1: 32, x2: 60, y2: 32, stroke: INFO, 'stroke-width': 2.5 }, g);
    tx(0, 22, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO }, g); return g; }
  const CIPH = ['9f', '2c', 'a1', '07', 'e4', '5b'];
  function storage(x, y, n, o) { o = o || {}; const vals = o.vals || CIPH.slice(0, n);
    cells(x, y, vals, { w: o.w || 44, h: 34, gap: 6, style: (i) => ({ stroke: o.col || OFF, color: o.color || MUT, op: o.op ? o.op(i) : 1, fill: o.fill }) }); }

  // 1. sealed — 3중 잠금
  function s1(t, c) { const { k, u } = c, VX = 480, VY = 150;
    server(VX, VY, null, { stroke: BAD, lamp: BAD }); lbl(VX, VY + 62, 'Vault', 1); lock(VX + 74, VY - 36, true, BAD, 1.3);
    pill(390, 46, 'Sealed = true', BAD, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
    pill(590, 46, 'Seal Type shamir', INK, k === 0 ? pop(u, 0.5) : 1, { mono: true, fs: 14 });
    storage(610, 320, 6, { op: (i) => (k === 0 ? fade(u, 0.6 + i * 0.15) : 1) });
    lbl(757, 385, 'storage (디스크)', k === 0 ? fade(u, 1.4) : 1);
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1; keyIcon(400, 336, 1.5 * s, INFO); lock(430, 352, true, INFO, 0.8 * s);
      lbl(400, 385, 'encryption key', k === 1 ? fade(u, 0.4) : 1, { fill: INFO });
      tx(770, 82, 'Total Shares 5', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', 'font-weight': 700, opacity: k === 1 ? fade(u, 0.8) : 1 });
      for (let i = 0; i < 5; i++) piece(650 + i * 60, 118, 'K' + (i + 1), OFF, k === 1 ? pop(u, 0.9 + i * 0.12) : 1, { dash: '4 4', color: MUT });
      for (let i = 0; i < 3; i++) el('rect', { x: 710 + i * 40, y: 152, width: 32, height: 16, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 2, opacity: k === 1 ? fade(u, 1.6) : 1 });
      mono(770, 196, 'Unseal Progress 0/3', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: k === 1 ? fade(u, 1.8) : 1 }); }
    if (k >= 2) { const s = k === 2 ? pop(u, 1.6) : 1; keyIcon(160, 336, 1.5 * s, BAD, { dash: '4 4', fill: 'none' });
      lbl(160, 385, 'master key', k === 2 ? fade(u, 1.7) : 1, { fill: BAD });
      sub(160, 408, '메모리에 없음', k === 2 ? fade(u, 1.9) : 1, { fill: BAD, 'font-weight': 700 }); }
    if (k === 2) [['kv get secret/app/db', 100], ['vault login', 170]].forEach(([s, y], i) => { const a = 0.2 + i * 0.4, go = seg(u, a, a + 0.6), back = seg(u, a + 0.6, a + 1.1);
      const x = back > 0 ? lerp(320, 150, E(back, 0, 1)) : lerp(30, 320, E(go, 0, 1));
      if (go > 0) card(x, y, tw(s, 13.5) + 24, 28, { rx: 14, fill: back > 0 ? BAD : ACC, stroke: 'none', text: s, fs: 13.5, fw: 700, color: PANEL, mono: true });
      mono(150, y + 32, 'Error: Vault is sealed', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, a + 1.1) }); });
    if (k >= 3) { const g1 = k === 3 ? E(u, 0.3, 1.0) : 1, g2 = k === 3 ? E(u, 1.1, 1.8) : 1;
      grow(205, 336, 345, 336, g1, BAD); grow(455, 336, 600, 336, g2, INFO);
      sub(275, 322, '감싼다', k === 3 ? fade(u, 0.9) : 1, { 'font-weight': 700, fill: BAD }); sub(528, 322, '암호화', k === 3 ? fade(u, 1.7) : 1, { 'font-weight': 700, fill: INFO }); }
    if (k === 3) sub(160, 120, '열쇠가 서버 어디에도', fade(u, 2.0), { 'font-size': 15, fill: INK }), sub(160, 144, '저장돼 있지 않다', fade(u, 2.0), { 'font-size': 15, fill: INK });
    if (k === 4) { person(110, 130, null, { s: pop(u, 0.2) }); lbl(110, 186, '디스크를 떠 간 사람', fade(u, 0.3));
      fly(757, 320, 260, 120, seg(u, 0.5, 1.5), '9f 2c a1 07 e4 5b', { stay: true, fill: OFF, color: INK, mono: true });
      cross(345, 120, 12, pop(u, 1.7)); sub(260, 158, '평문을 볼 수 없다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); } }

  // 2. Shamir — 5조각, 아무 3개
  const PX = [300, 450, 600, 750, 890], WHO = ['보안팀 A', '인프라 B', '리드 C', '매니저 D', '금고(비상)'];
  const SH = [[1, 53], [2, 60], [3, 63], [4, 62], [5, 57]];
  const poly = (a, b, cc) => { const pts = []; for (let x = 0; x <= 5.3; x += 0.05) { const y = a + b * x + cc * x * x; if (y >= 0 && y <= 80) pts.push([x, y]); } return pts; };
  function s2(t, c) { const { k, u } = c;
    if (k >= 4) { const ax = axes(80, 60, 380, 280, { x: [0, 5.5], y: [0, 80], xt: [0, 1, 2, 3, 4, 5], yt: [0, 20, 40, 60, 80], grid: true, xl: '조각 번호 x', yl: 'y' });
      if (k === 4) { scatter(ax, SH.map(([x, y]) => [x, y, ACC]), { u: E(u, 0.1, 0.7), r: 7 });
        line(ax, poly(42, 13, -2), E(u, 0.6, 1.6), ACC);
        [0, 2, 4].forEach((i) => el('circle', { cx: ax.X(SH[i][0]), cy: ax.Y(SH[i][1]), r: 13, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.5) }));
        const p = pop(u, 1.6); if (p > 0) { el('circle', { cx: ax.X(0), cy: ax.Y(42), r: 9 * p, fill: GOOD });
          mono(ax.X(0) + 14, ax.Y(42) + 28, '비밀 = 42', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) }); }
        tx(730, 62, '아무 3개 · C(5,3) = 10가지', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8) });
        const cmb = []; for (let a = 1; a <= 5; a++) for (let b = a + 1; b <= 5; b++) for (let d = b + 1; d <= 5; d++) cmb.push([a, b, d]);
        cmb.forEach((cm, i) => { const x = 640 + (i % 2) * 180, y = 100 + Math.floor(i / 2) * 46, s = pop(u, 1.0 + i * 0.11);
          card(x, y, 160, 34, { rx: 8, stroke: GOOD, sw: 1.8, s, text: `{${cm.join(',')}} → 42`, fs: 14.5, mono: true, color: INK }); }); }
      if (k === 5) { scatter(ax, SH.slice(0, 2).map(([x, y]) => [x, y, ACC]), { r: 7 });
        [[30, 31, -8, BAD], [42, 13, -2, ACC], [50, 1, 2, INFO]].forEach(([a, b, cc, col], i) => { const g = E(u, 0.3 + i * 0.5, 1.0 + i * 0.5);
          line(ax, poly(a, b, cc), g, col, { sw: 2.4 });
          if (g > 0.9) { el('circle', { cx: ax.X(0), cy: ax.Y(a), r: 7, fill: col }); mono(ax.X(0) + 14, ax.Y(a) + 5, String(a), { 'font-size': 15, 'font-weight': 800, fill: col }); } });
        tx(700, 90, '조각 2개: (1, 53) (2, 60)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) });
        [['절편 30', BAD], ['절편 42', ACC], ['절편 50', INFO]].forEach(([s, col], i) => { mono(620, 150 + i * 36, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.5) });
          tx(710, 150 + i * 36, '도 두 점을 지난다', { 'font-size': 15, fill: INK, opacity: fade(u, 1.0 + i * 0.5) }); });
        banner(700, 300, '2개로는 비밀을 하나도 좁히지 못한다', pop(u, 2.2)); }
      tx(480, 410, '예시 다항식 f(x) = 42 + 13x − 2x². Vault는 키의 바이트마다 GF(2⁸)에서 같은 계산을 한다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      return; }
    pill(480, 38, 'operator init -key-shares=5 -key-threshold=3', INK, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
    const kop = k === 0 ? 1 : k === 1 ? 1 - E(u, 1.4, 2.2) * 0.8 : 0.2;
    keyIcon(110, 190, 2.2 * (k === 0 ? pop(u, 0.5) : 1), ACC, { op: kop });
    if (k === 0) { lbl(110, 250, 'master key', fade(u, 0.7));
      [['shares 5', '다섯 조각으로 나눈다'], ['threshold 3', '아무 세 조각이면 복원']].forEach(([a, b], i) => {
        mono(300, 160 + i * 50, a, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0 + i * 0.5) });
        tx(430, 160 + i * 50, b, { 'font-size': 16, fill: INK, opacity: fade(u, 1.0 + i * 0.5) }); }); return; }
    PX.forEach((x, i) => { const s = k === 1 ? pop(u, 0.2 + i * 0.12) : 1;
      if (i < 4) person(x, 200, null, { s }); else { card(x, 200, 56, 56, { rx: 8, s, sw: 2.5 }); el('circle', { cx: x, cy: 200, r: 12 * s, fill: 'none', stroke: INK, 'stroke-width': 2.5 }); }
      lbl(x, 252, WHO[i], Math.min(1, s), { 'font-size': 15 });
      if (k === 1) fly(110, 190, x, 120, seg(u, 0.5 + i * 0.25, 1.3 + i * 0.25), 'K' + (i + 1), { stay: true, mono: true });
      else piece(x, 120, 'K' + (i + 1), ACC, 1); });
    if (k === 1) sub(480, 300, '한 사람이 여러 조각을 들면 나눈 의미가 사라진다', fade(u, 2.2), { 'font-size': 15, fill: INK });
    if (k === 2) { card(480, 330, 560, 58, { rx: 10, stroke: WARN, sw: 2.2, s: pop(u, 0.3) });
      mono(220, 336, 'Initial Root Token', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(430, 336, 'hvs.CAESIJ...', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.7) });
      tx(580, 336, '전권 토큰 · 초기 설정에만', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.1) }); }
    if (k === 3) { terminal(180, 286, 600, 106, ['Unseal Key 1: nYbQ4x...AA', 'Unseal Key 2: 7mKp2v...BB', 'Unseal Key 3: qR9sLd...CC'], lerp(0.5, 3, E(u, 0.1, 0.9)), { fs: 14, lh: 20 });
      const g = E(u, 1.2, 1.8); if (g > 0) el('line', { x1: 180, y1: 340, x2: lerp(180, 780, g), y2: 340, stroke: BAD, 'stroke-width': 4 });
      sub(480, 412, '다시 출력되지 않는다. 지금 나눠 보관한다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); } }

  // 3. unseal — 조각 셋을 넣는다
  const UY = [80, 190, 300], PC = ['K1', 'K2', 'K3'];
  function s3(t, c) { const { k, u, beat } = c, have = beat.seal.have, ph = c.prev ? c.prev.seal.have : 0;
    const resealing = k === 4 && u > 0.9, open = !beat.seal.sealed && !resealing;
    ['보안팀 A', '인프라 B', '리드 C'].forEach((n, i) => { person(80, UY[i], null, {}); lbl(80, UY[i] + 52, n, 1, { 'font-size': 15 }); });
    card(420, 160, 150, 130, { rx: 14, stroke: open ? GOOD : BAD, sw: 3 }); lock(420, 160, !open, open ? GOOD : BAD, 2.2);
    pill(420, 46, open ? 'Sealed = false' : 'Sealed = true', open ? GOOD : BAD, k === 2 ? 1 + bump(u, 1.4) : 1, { mono: true, fs: 14 });
    for (let i = 0; i < 3; i++) { const filled = i < ph || (i < have && (k > 2 || seg(u, 0.2, 1.2) >= 1)) || (k >= 3 && !resealing);
      el('rect', { x: 345 + i * 52, y: 248, width: 46, height: 30, rx: 5, fill: filled ? ACC : PANEL, stroke: filled ? ACC : GRID, 'stroke-width': 2, 'stroke-dasharray': filled ? null : '4 3' });
      if (filled) mono(368 + i * 52, 268, PC[i], { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: PANEL }); }
    if (k < 3) fly(120, UY[k], 368 + k * 52, 263, seg(u, 0.2, 1.2), PC[k], { mono: true });
    const shown = k < 3 ? Math.round(tween(ph, have, u, 1.0)) : resealing ? 0 : 3;
    mono(420, 316, `Unseal Progress ${Math.min(shown, 3)}/3`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: shown >= 3 ? GOOD : WARN });
    if (k >= 2) { const gk = k === 2 ? pop(u, 1.4) : 1, go = k === 2 ? E(u, 1.8, 2.4) : 1;
      if (!resealing) keyIcon(700, 80, 1.5 * gk, GOOD);
      lbl(790, 86, 'master key', resealing ? 1 - fade(u, 1.0) : 1, { fill: GOOD, 'text-anchor': 'start' });
      if (resealing) for (let i = 0; i < 5; i++) { const a = i * 1.26, d = 60 * E(u, 1.0, 2.0); el('rect', { x: 700 + Math.cos(a) * d - 6, y: 80 + Math.sin(a) * d - 4, width: 12, height: 8, fill: GOOD, opacity: 1 - fade(u, 1.6, 0.8) }); }
      grow(700, 110, 700, 152, go, GOOD); keyIcon(700, 180, 1.3, INFO); lock(730, 196, !(go >= 1 && !resealing), INFO, 0.7); lbl(790, 186, 'encryption key', 1, { fill: INFO, 'text-anchor': 'start' });
      grow(700, 210, 700, 250, k === 2 ? E(u, 2.2, 2.6) : 1, INFO);
      const plain = (k > 2 || u > 2.5) && !resealing;
      storage(600, 262, 5, { w: 52, vals: plain ? ['db', 'pw', 'api', 'tls', 'cfg'] : CIPH.slice(0, 5), col: plain ? GOOD : OFF, color: plain ? INK : MUT });
      sub(750, 322, plain ? '저장소를 읽을 수 있다' : 'storage', 1, { 'font-size': 15, fill: plain ? GOOD : MUT, 'font-weight': 700 }); }
    if (k === 3) { dot([[495, 160], [600, 279]], seg(u, 0.3, 1.0), ACC, 7); dot([[600, 279], [495, 160]], seg(u, 1.1, 1.8), GOOD, 7);
      pill(420, 380, 'kv get secret/app/db', GOOD, pop(u, 1.6), { mono: true, fs: 14 }); check(560, 380, 12, pop(u, 1.9)); }
    if (k === 4) { const p = 1 + bump(u, 0.7); el('circle', { cx: 880, cy: 380, r: 26 * p, fill: BAD });
      tx(880, 386, 'seal', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL });
      mono(600, 386, 'vault operator seal', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) }); } }

  // 4. auto-unseal — KMS 가 푼다
  function nightClock(cx, cy) { el('circle', { cx, cy, r: 30, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    el('line', { x1: cx, y1: cy, x2: cx, y2: cy - 22, stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
    el('line', { x1: cx, y1: cy, x2: cx + 16, y2: cy, stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' }); mono(cx, cy + 50, '03:00', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); }
  function s4(t, c) { const { k, u, beat } = c, open = !beat.seal.sealed && !(k === 2 && u < 2.1);
    nightClock(90, 70);
    server(300, 190, null, { stroke: open ? GOOD : BAD, lamp: k === 0 ? (Math.floor(t * 3) % 2 ? WARN : OFF) : open ? GOOD : BAD }); lbl(300, 252, k === 0 ? '노드 재시작' : 'Vault', 1);
    pill(300, 112, open ? 'Sealed = false' : 'Sealed = true', open ? GOOD : BAD, k === 2 ? 1 + bump(u, 2.1) : 1, { mono: true, fs: 14 });
    if (k === 0) { [620, 730, 840].forEach((x, i) => { person(x, 200, null, { s: pop(u, 0.4 + i * 0.2) });
        mono(x + 22, 158 - 6 * Math.sin(t * 3 + i), 'Zz', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) }); });
      lbl(730, 270, '담당자 3명을 깨워 모은다?', fade(u, 1.2), { fill: WARN });
      grow(370, 190, 570, 190, E(u, 1.6, 2.4), WARN, { dash: '6 5' }); return; }
    cloud(760, 190, 'AWS KMS', k === 1 ? fade(u, 0.3) : 1);
    if (k <= 2) snippet(70, 296, ['seal "awskms" {', '  region     = "ap-northeast-2"', '  kms_key_id = "arn:aws:kms:...:key/abc-123"', '}'], { fs: 14, op: k === 1 ? fade(u, 0.8) : 1 });
    if (k === 1) { grow(370, 190, 680, 190, E(u, 1.2, 2.0), INFO, { dash: '6 5' }); sub(760, 250, '마스터 키 보호를 KMS에 맡긴다', fade(u, 1.6), { 'font-size': 15, fill: INFO, 'font-weight': 700 }); }
    if (k >= 2) el('line', { x1: 370, y1: 190, x2: 680, y2: 190, stroke: GRID, 'stroke-width': 2.2 });
    if (k === 2) { fly(380, 160, 650, 160, seg(u, 0.2, 1.1), 'Decrypt(암호화된 root key)', { mono: true, fill: INFO });
      fly(680, 220, 380, 220, seg(u, 1.2, 2.0), 'root key', { mono: true, fill: GOOD });
      sub(560, 280, '사람 개입 없이 바로 서비스', fade(u, 2.2), { 'font-size': 15, fill: GOOD, 'font-weight': 700, 'text-anchor': 'start' }); }
    if (k === 3) [['awskms', 'AWS KMS'], ['gcpckms', 'GCP KMS'], ['azurekeyvault', 'Azure Key Vault'], ['pkcs11', 'HSM'], ['transit', '다른 Vault']].forEach(([a, b], i) => {
      const x = 110 + i * 185, s = pop(u, 0.2 + i * 0.3); pill(x, 330, a, i ? INK : INFO, s, { mono: true, fs: 14 });
      sub(x, 370, b, fade(u, 0.4 + i * 0.3), { 'font-size': 14 }); }); }

  // 5. recovery key · rekey · rotate · seal
  function s5(t, c) { const { k, u } = c, sealedNow = k === 3 && u > 1.0;
    cloud(110, 110, 'KMS', 1); grow(185, 110, 255, 110, 1, INFO);
    server(330, 110, null, { stroke: sealedNow ? BAD : GOOD, lamp: sealedNow ? BAD : GOOD, s: 0.8 }); lock(390, 72, sealedNow, sealedNow ? BAD : GOOD, 0.9);
    sub(330, 175, sealedNow ? 'sealed' : 'unseal = KMS', 1, { 'font-size': 14, 'font-weight': 700, fill: sealedNow ? BAD : GOOD });
    tx(700, 52, 'Recovery Key × 5 (아무 3개)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k === 0 ? fade(u, 0.2) : 1 });
    const rekeyed = k > 1 || (k === 1 && u > 2.0);
    for (let i = 0; i < 5; i++) piece(580 + i * 60, 98, (rekeyed ? 'N' : 'R') + (i + 1), INFO, k === 0 ? pop(u, 0.4 + i * 0.12) : 1, { fill: rekeyed ? INFOBG : PANEL });
    sub(700, 145, 'root token 재생성 같은 비상 작업용', k === 0 ? fade(u, 1.3) : 1, { 'font-size': 14, fill: INK });
    el('line', { x1: 40, y1: 205, x2: 920, y2: 205, stroke: GRID, 'stroke-width': 1.5, opacity: k === 0 ? 0 : 1 });
    if (k === 0) sub(480, 300, '봉인 해제는 KMS가, 비상 열쇠는 여전히 사람이 나눠 든다', fade(u, 1.8), { 'font-size': 15, fill: INK });
    if (k === 1) { pill(120, 250, 'operator rekey', INFO, pop(u, 0.1), { mono: true, fs: 14 });
      for (let i = 0; i < 5; i++) { const ok = i < 3 && u > 0.5 + i * 0.25;
        piece(80 + i * 62, 320, 'R' + (i + 1), ok ? GOOD : OFF, 1, { color: ok ? GOOD : MUT });
        if (ok) check(80 + i * 62, 355, 7, pop(u, 0.5 + i * 0.25)); }
      sub(204, 392, '기존 조각 3개가 승인', fade(u, 1.2), { 'font-size': 14, 'font-weight': 700, fill: GOOD });
      grow(400, 320, 520, 320, E(u, 1.4, 1.9), INFO);
      for (let i = 0; i < 5; i++) piece(580 + i * 62, 320, 'N' + (i + 1), INFO, pop(u, 1.9 + i * 0.1), { fill: INFOBG });
      sub(704, 370, '새 조각을 새 담당자에게', fade(u, 2.3), { 'font-size': 14, 'font-weight': 700, fill: INFO }); }
    if (k === 2) { pill(120, 250, 'operator rotate', ACC, pop(u, 0.1), { mono: true, fs: 14 });
      keyIcon(100, 330, 1.2, OFF); mono(100, 372, 'Term 1', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      const g = pop(u, 0.6); keyIcon(210, 330, 1.2 * g, ACC); mono(210, 372, 'Term 2', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
      ['T1', 'T1', 'T1', 'T1', 'T2', 'T2'].forEach((v, i) => { const isNew = i >= 4, s = isNew ? pop(u, 1.3 + (i - 4) * 0.4) : 1;
        card(380 + i * 72, 320, 62, 44, { rx: 6, text: v, mono: true, fs: 15, stroke: isNew ? ACC : OFF, color: isNew ? ACC : MUT, fill: isNew ? ACCBG : PANEL, s }); });
      sub(560, 372, '옛 블록은 T1 그대로', fade(u, 1.0), { 'font-size': 14, fill: MUT }); sub(812, 372, '새 쓰기부터 T2', fade(u, 1.6), { 'font-size': 14, 'font-weight': 700, fill: ACC }); }
    if (k === 3) { const p = 1 + bump(u, 0.8); el('circle', { cx: 300, cy: 310, r: 44 * p, fill: BAD });
      tx(300, 316, 'seal', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: PANEL });
      mono(380, 300, 'vault operator seal', { 'font-size': 16, 'font-weight': 700, fill: BAD });
      tx(380, 330, '한 줄로 즉시 봉인. 여는 일은 다시 절차를 밟는다', { 'font-size': 15, fill: INK, opacity: fade(u, 1.2) }); }
    if (k === 4) { [['rekey', '조각을 다시 나눈다', 'unseal · recovery 조각', INFO, 250], ['rotate', 'encryption key를 바꾼다', 'Key Term 1 → 2', ACC, 710]].forEach(([a, b, d, col, cx], i) => {
        const s = pop(u, 0.2 + i * 0.4); card(cx, 288, 380, 104, { rx: 12, stroke: col, sw: 2.5, s });
        if (s > 0.3) { mono(cx, 266, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col });
          tx(cx, 294, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); mono(cx, 320, d, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); } });
      tx(480, 294, '≠', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      banner(480, 380, 'auto-unseal + recovery key 보관 + 정기 rekey · rotate', pop(u, 1.6)); } }

  const quiz = [
    { q: 'Vault가 sealed 상태일 때 거부되는 요청은 무엇인가?',
      o: ['시크릿 쓰기만', '로그인과 시크릿 읽기·쓰기 전부', '아무것도 거부되지 않고 느려지기만 한다'], a: 1,
      why: 'sealed는 마스터 키가 메모리에 없어 저장소를 풀 수 없는 상태다. kv get도 vault login도 "Vault is sealed"로 끝난다.' },
    { q: '5조각·threshold 3으로 나눈 키에서 조각 2개를 가진 사람이 알 수 있는 것은 무엇인가?',
      o: ['마스터 키에 대해 아무것도 모른다', '마스터 키의 3분의 2', '마스터 키의 앞쪽 절반'], a: 0,
      why: '두 점을 지나는 포물선은 절편이 30이든 42든 50이든 있다. threshold 미만의 조각은 비밀을 하나도 좁히지 못한다.' },
    { q: '세 번째 조각이 들어간 순간 일어나는 일은 무엇인가?',
      o: ['조각 3개가 디스크에 저장된다', 'Vault가 다시 operator init을 요구한다', '마스터 키가 메모리에서 조립되고 Sealed가 false가 된다'], a: 2,
      why: 'threshold 3에 닿으면 마스터 키로 encryption key를 풀고 저장소를 읽는다. 진행률 1/3, 2/3 단계에서는 여전히 sealed다.' },
    { q: 'auto-unseal 환경에서 재시작한 Vault가 봉인을 푸는 방법은 무엇인가?',
      o: ['담당자 3명이 조각을 하나씩 낸다', 'seal 스탠자에 적힌 KMS에 Decrypt를 요청한다', 'root token으로 로그인한다'], a: 1,
      why: 'seal "awskms" 블록이 있으면 Vault가 시작하며 KMS로 root key를 풀어 받는다. 새벽 3시에도 사람을 깨울 필요가 없다.' },
    { q: 'rekey와 rotate의 차이로 맞는 것은 무엇인가?',
      o: ['rekey는 조각을 새로 나누고, rotate는 encryption key를 바꾼다', '둘 다 저장소 전체를 다시 암호화한다', 'rotate는 조각을 새로 나누고, rekey는 encryption key를 바꾼다'], a: 0,
      why: 'rekey는 unseal·recovery 조각을 다시 나눠 담당자를 바꾸고, rotate는 Key Term 2를 만들어 이후 쓰기부터 새 키를 쓴다.' },
  ];

  const summary = [
    '막 띄운 Vault는 마스터 키가 메모리에 없는 sealed 상태라 로그인과 읽기가 모두 거부된다.',
    'operator init은 마스터 키를 5조각으로 나누고, 아무 3조각이면 복원되며 2조각으로는 아무것도 모른다.',
    '세 번째 조각이 들어오면 메모리에서 키가 조립되고 Sealed가 false로 바뀐다.',
    'auto-unseal은 재시작 때 KMS가 키를 풀어 주고, 사람 몫은 비상용 recovery key로 남는다.',
  ];
  const review = [
    { q: '새벽에 노드가 재시작됐는데 담당자 셋이 모일 때까지 서비스가 멈췄다. 먼저 바꿀 것은?',
      o: ['key-threshold를 1로 낮춘다', 'seal 스탠자로 KMS auto-unseal을 붙인다', '조각을 한 사람에게 모두 맡긴다'], a: 1,
      why: 'auto-unseal이면 재시작한 Vault가 KMS에 Decrypt를 요청해 스스로 열린다. threshold를 낮추거나 조각을 몰면 나눈 의미가 사라진다.' },
    { q: '조각을 들고 있던 담당자 한 명이 퇴사했다. 할 일은?',
      o: ['operator rotate로 encryption key를 바꾼다', 'operator seal로 봉인해 둔다', 'operator rekey로 조각을 새로 나눠 다시 분배한다'], a: 2,
      why: '퇴사자 손의 조각을 무효로 만들려면 조각 자체를 새로 나눠야 한다. rotate는 저장소 키를 바꿀 뿐 조각은 그대로다.' },
    { q: 'sealed 상태로 꺼져 있던 서버의 디스크를 도난당했다. 가장 먼저 확인할 것은?',
      o: ['조각 3개가 함께 새어 나가지 않았는지', '디스크 안의 시크릿이 평문으로 보이는지', 'encryption key가 평문으로 저장돼 있는지'], a: 0,
      why: '저장소는 encryption key로, 그 키는 마스터 키로 감싸여 있다. 마스터 키는 조각 3개가 모여야 나오므로 조각이 안전하면 디스크는 읽히지 않는다.' },
  ];

  R.page({ title: 'seal · unseal', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
