/* IV-1-2 Self-Attention — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 문장 속 토큰 셋이 서로에게 "응시선"을 긋는다. 선 굵기 = attn 확률.
 *           Q·K·V 는 같은 X 에서 나온 세 벌의 행렬(색으로 구분), 계산은 행렬이 칸 단위로 채워지는 모습.
 * 숫자: self_attention.py 의 Q·K·V 로 여기서 똑같이 계산한다 (scores → ÷√4 → softmax → @V).
 *       "÷2 를 빼면 [0.62, 0.10, 0.28]" "점수 폭 8배면 [1.00, 0.00, 0.00]" 도 같은 Q·K 로 계산한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  const T = ['동물', '길', '그것'];
  const Q = [[1.0, 0.4, 0.2, 0.8], [0.2, 1.0, 0.8, 0.1], [1.0, 0.2, 0.1, 1.0]];
  const K = [[1.2, 0.3, 0.1, 1.0], [0.1, 1.0, 0.9, 0.0], [0.8, 0.2, 0.3, 0.6]];
  const V = [[0.9, 0.1, 0.4, 0.7], [0.2, 0.8, 0.9, 0.1], [0.7, 0.2, 0.3, 0.6]];
  const dotp = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const smax = (xs) => { const m = Math.max(...xs), e = xs.map((x) => Math.exp(x - m)), z = e.reduce((a, b) => a + b, 0); return e.map((v) => v / z); };
  const SC = Q.map((q) => K.map((k) => dotp(q, k)));
  const SS = SC.map((r) => r.map((v) => v / 2));
  const AT = SS.map(smax);
  const OUT = AT.map((a) => [0, 1, 2, 3].map((d) => a.reduce((s, w, j) => s + w * V[j][d], 0)));
  const RAW = smax(SC[2]), HOT = smax(SC[2].map((v) => v * 8));
  // 두 자리 표기 (코드 주석과 같은 반올림: 1.135 → 1.14, 0.735 → 0.74)
  const f2 = (v) => (Math.round(v * 100 + 1e-9) / 100).toFixed(2), f1 = (v) => v.toFixed(1);
  const QC = ACC, KC = WARN, VC = GOOD;

  // ---------- 부품 ----------
  function tok(cx, cy, s, o) { o = o || {}; return card(cx, cy, Math.max(64, tw(s, 16) + 26), 36, { rx: 9, text: s, fs: 16, fw: 700, stroke: o.stroke || INK, fill: o.fill, color: o.color, s: o.s, op: o.op, sw: o.sw }); }
  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op }, a || {})); }
  // 행렬: m 숫자, 칸 cs, 색 colr. o: rows/cols 머리글, hi(r,c), show(r,c)(0~1), num(0~1), fmt, max
  function mat(x, y, m, cs, colr, o) { o = o || {};
    m.forEach((row, r) => row.forEach((v, c) => { const sh = o.show ? o.show(r, c) : 1; if (sh <= 0.01) return; const a = clamp(Math.abs(v) / (o.max || 1)), cx = x + c * cs, cy = y + r * (o.ch || cs), h = (o.ch || cs) - 3, dim = o.dim ? o.dim(r, c) : 1;
      el('rect', { x: cx, y: cy, width: cs - 3, height: h, rx: 4, fill: PANEL, stroke: GRID, opacity: sh });
      el('rect', { x: cx, y: cy, width: cs - 3, height: h, rx: 4, fill: colr, opacity: sh * dim * (0.08 + 0.7 * a) });
      if (o.hi && o.hi(r, c)) el('rect', { x: cx - 1.5, y: cy - 1.5, width: cs, height: h + 3, rx: 5, fill: 'none', stroke: INK, 'stroke-width': 2.6, opacity: sh });
      const nn = o.num == null ? 1 : typeof o.num === 'function' ? o.num(r, c) : o.num; if (nn > 0.01) mono(cx + (cs - 3) / 2, cy + h / 2 + 5, (o.fmt || f2)(v), { 'font-size': o.fs || 14, 'text-anchor': 'middle', 'font-weight': 700, fill: a * dim > 0.65 ? PANEL : INK, opacity: sh * nn * (0.35 + 0.65 * dim) }); }));
    (o.rows || []).forEach((s, r) => tx(x - 8, y + r * (o.ch || cs) + ((o.ch || cs) - 3) / 2 + 5, s, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, fill: MUT }));
    (o.cols || []).forEach((s, c) => tx(x + c * cs + (cs - 3) / 2, y - 9, s, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: MUT })); }
  // "그것" 에서 나가는 응시 아크 (위로 볼록). w=null 이면 물음표 점선
  const AX = [180, 360, 540];
  function arcs(y, w, u, o) { o = o || {}; const src = 2, AX = [180, 360, 540].map((x) => x + (o.dx || 0));
    [0, 1, 2].forEach((j) => { const g = E(u, (o.at || 0.3) + j * 0.15, (o.at || 0.3) + 0.6 + j * 0.15); if (g <= 0) return;
      const x1 = AX[src], x2 = AX[j], hgt = j === src ? 60 : 40 + Math.abs(x1 - x2) * 0.28;
      const d = j === src ? `M${x1 - 14},${y - 18} C ${x1 - 50},${y - 90} ${x1 + 50},${y - 90} ${x1 + 14},${y - 18}` : `M${x1},${y - 18} Q ${(x1 + x2) / 2},${y - 18 - hgt * 2} ${x2},${y - 18}`;
      const a = w ? w[j] : 0.3;
      el('path', { d, fill: 'none', stroke: w ? ACC : MUT, 'stroke-width': w ? Math.max(1.5, a * 16) : 2, 'stroke-dasharray': w ? null : '6 5', opacity: g * (w ? 0.35 + 0.65 * a : 0.8), 'stroke-linecap': 'round' });
      const lx = j === src ? x1 + 62 : x2 - 38, ly = j === src ? y - 66 : y - 30;
      mono(lx, ly, w ? f2(a) : '?', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: w ? ACC : MUT, opacity: fade(u, (o.at || 0.3) + 0.6 + j * 0.15) }); });
    T.forEach((s, i) => tok(AX[i], y, s, { stroke: i === 2 ? ACC : INK, color: i === 2 ? ACC : INK })); }

  // ---------- 1. Self 의 의미 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0 || k === 4) {
      tx(60, 50, '동물이 길을 건너지 못했다. 그것은 너무 피곤했다.', { 'font-size': 17, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
      if (k === 0) { arcs(330, null, u, { at: 1.0 });
        mono(720, 140, 'seq_len = 3', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.8) }); mono(720, 175, 'd_model = 4', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.0) });
        sub(780, 230, '토큰 3개로 끝까지 추적', fade(u, 2.3), { 'font-size': 15 }); return; }
      arcs(330, [0, 0, 0].map((_, j) => lerp(0.3, AT[2][j], E(u, 1.0, 1.8))), u, { at: 0.2 });
      card(780, 170, 220, 64, { rx: 12, stroke: ACC, sw: 3, fill: ACCBG, s: pop(u, 1.8) });
      mono(780, 178, '그것 → 동물 0.49', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      sub(780, 235, '추적 목표 — 중간 숫자 하나도 건너뛰지 않는다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // X 와 Q·K·V
    const xg = [[0.5, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]];
    if (k === 1 || k === 2) { mat(80, 150, xg, 40, MUT, { num: 0, rows: T, show: (r) => (k === 1 ? fade(u, 0.2 + r * 0.1) : 1) }); lbl(158, 290, 'X', 1, { class: 'mono', 'font-size': 18 });
      const outs = [['W_Q', 'Q', QC], ['W_K', 'K', KC], ['W_V', 'V', VC]];
      outs.forEach(([w, o, colr], i) => { const at = 0.6 + i * 0.5, y = 70 + i * 104;
        if (k === 1) { grow(250, 210, 470, y + 30, E(u, at, at + 0.4), colr); mono(320, y + 30 + (i - 1) * 14 - 8, `@ ${w}`, { 'font-size': 15, 'font-weight': 700, fill: colr, opacity: fade(u, at + 0.2) });
          mat(500, y, [[0.5, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]], 30, colr, { num: 0, show: () => fade(u, at + 0.4) });
          lbl(650, y + 52, o, fade(u, at + 0.5), { class: 'mono', fill: colr, 'font-size': 20 }); }
      });
      if (k === 1) { note(720, 405, '입력은 X 하나, 다른 것은 W 뿐', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
      // k2: 모양
      tx(260, 225, '@', { 'font-size': 26, 'font-weight': 800, fill: MUT });
      mat(300, 130, [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]].map((r, i) => r.map((_, j) => 0.3 + 0.15 * ((i + j) % 3))), 40, KC, { num: 0, show: (r, cc) => pop(u, 0.3 + (r * 4 + cc) * 0.03) });
      lbl(378, 312, 'W_*', fade(u, 0.5), { class: 'mono', 'font-size': 18, fill: KC });
      tx(480, 225, '=', { 'font-size': 26, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.0) });
      mat(520, 150, xg, 40, QC, { num: 0, show: () => fade(u, 1.1) });
      mono(158, 330, '(3, 4)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      mono(378, 340, '(4, 4)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: KC, opacity: fade(u, 0.7) });
      mono(598, 330, '(3, 4)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: QC, opacity: fade(u, 1.3) });
      note(700, 160, 'W_Q · W_K · W_V 세 벌', fade(u, 1.7), { fill: KC });
      sub(800, 200, '= 학습 파라미터 (4×4 씩)', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k3: 왜 세 역할로 나누나 — 2차원 화살표 그림
    const pane = (ox, title, sep, at) => { el('rect', { x: ox, y: 70, width: 400, height: 280, rx: 14, fill: SOFT, opacity: fade(u, at) });
      lbl(ox + 200, 100, title, fade(u, at), { fill: sep ? ACC : MUT });
      const O = [ox + 70, 300], arrow = (ang, len, colr, lab, a2) => { const x2 = O[0] + Math.cos(ang) * len, y2 = O[1] - Math.sin(ang) * len, g = E(u, a2, a2 + 0.4); if (g <= 0) return;
        el('line', { x1: O[0], y1: O[1], x2: lerp(O[0], x2, g), y2: lerp(O[1], y2, g), stroke: colr, 'stroke-width': 3, 'marker-end': g > 0.97 ? (colr === ACC ? 'url(#ra-ahb)' : 'url(#ra-ah)') : null });
        tx(x2 + 8, y2 - 4, lab, { 'font-size': 14.5, 'font-weight': 700, fill: colr, opacity: fade(u, a2 + 0.3) }); };
      if (!sep) { arrow(0.95, 200, MUT, '그것: 찾기 = 찾아지기', at + 0.3); arrow(0.2, 170, INK, '동물', at + 0.5);
        sub(ox + 200, 335, '자기와의 내적 ‖x‖² 이 커지기 쉽다', fade(u, at + 0.9), { 'font-size': 14.5 }); }
      else { arrow(0.30, 210, QC, 'Q 그것 (찾기)', at + 0.3); arrow(0.55, 120, KC, 'K 동물', at + 0.5); arrow(1.25, 130, KC, 'K 그것', at + 0.7);
        sub(ox + 200, 335, '찾는 모습과 찾아지는 모습이 따로', fade(u, at + 0.9), { 'font-size': 14.5 }); } };
    pane(40, 'Q = K = V = X', false, 0.2); pane(520, 'Q · K · V 분리', true, 1.2);
    cross(400, 120, 12, pop(u, 1.0)); check(880, 120, 12, pop(u, 2.2)); }

  // ---------- 2. Q·K·V 값 ----------
  const MX = [70, 380, 690], MY = 150, CS = 54;
  function qkv(o) { o = o || {}; [[Q, 'Q 질의', QC], [K, 'K 색인', KC], [V, 'V 내용', VC]].forEach(([m, n, colr], i) => { const op = o.op ? o.op(i) : 1; if (op <= 0.01) return;
      mat(MX[i] + 40, MY, m, CS, colr, { fmt: f1, rows: i === 0 ? T : null, show: o.show ? (r, cc) => o.show(i, r, cc) * op : () => op, hi: o.hi ? (r, cc) => o.hi(i, r, cc) : null, dim: o.dim ? (r, cc) => o.dim(i, r, cc) : null });
      lbl(MX[i] + 146, MY - 22, n, op, { fill: colr, 'font-size': 17 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { qkv({ show: (i, r, cc) => fade(u, 0.3 + i * 0.5 + (r * 4 + cc) * 0.02) });
      note(480, 360, 'W 곱셈은 생략 — 학습이 끝난 Q·K·V 를 상수로', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { qkv({ op: (i) => (i === 0 ? 1 : 0.25), hi: (i, r) => i === 0 && (r === 2 || (r === 0 && u > 1.2)) && u > 0.3, dim: (i, r) => (i === 0 && r === 1 ? 0.35 : 1) });
      mono(MX[0] + 148, 340, '그것  [1.0, 0.2, 0.1, 1.0]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: QC, opacity: fade(u, 0.6) });
      mono(MX[0] + 148, 368, '동물  [1.0, 0.4, 0.2, 0.8]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      note(MX[1] + 30, 400, '"그것" 의 질의 ≈ "동물" 방향', fade(u, 1.9), { fill: QC }); return; }
    if (k === 2) { qkv({ op: (i) => (i === 1 ? 1 : 0.25), hi: (i, r, cc) => i === 1 && r === 0 && (cc === 0 || cc === 3) && u > 0.6, dim: (i, r) => (i === 1 && r !== 0 ? 0.4 : 1) });
      mono(MX[1] + 148, 340, '동물  [1.2, 0.3, 0.1, 1.0]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: KC, opacity: fade(u, 0.5) });
      note(MX[1] + 30, 390, '1·4번 축이 크다 = "나를 이렇게 찾아라"', fade(u, 1.5), { fill: KC }); return; }
    if (k === 3) { qkv({ op: (i) => (i === 2 ? 1 : 0.6) });
      const g = fade(u, 0.5); el('rect', { x: MX[0] + 30, y: MY - 50, width: 560, height: 230, rx: 14, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: g });
      tx(MX[0] + 40, MY + 210, '점수 계산 = Q · K 만 쓴다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: g });
      el('rect', { x: MX[2] + 30, y: MY - 50, width: 240, height: 230, rx: 14, fill: 'none', stroke: VC, 'stroke-width': 3, opacity: fade(u, 1.2) });
      note(MX[2] + 40, MY + 210, '마지막 가중합에서 섞인다', fade(u, 1.6), { fill: VC });
      sub(480, 400, 'V 는 "찾아지면 실어 나를 의미"', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k4: 검색 비유
    card(170, 90, 260, 46, { rx: 23, stroke: QC, sw: 2.6, s: pop(u, 0.2) }); mono(70, 96, '🔍 Q[그것] 앞의 명사?', { 'font-size': 15, 'font-weight': 700, fill: QC, opacity: fade(u, 0.3) });
    T.forEach((s, j) => { const y = 180 + j * 70, sc = SC[2][j], at = 0.6 + j * 0.25;
      card(470, y, 200, 52, { rx: 8, stroke: KC, s: pop(u, at) }); tx(390, y + 6, `🏷 K[${s}]`, { 'font-size': 15, 'font-weight': 700, fill: KC, opacity: fade(u, at) });
      grow(300, 112, 368, y, E(u, at + 0.2, at + 0.5), MUT, { plain: true });
      mono(530, y + 6, f2(sc), { 'font-size': 16, 'font-weight': 800, fill: j === 0 ? ACC : INK, opacity: fade(u, at + 0.5) }); });
    sub(470, 160 - 8, 'Q·K 내적 = 맞는 정도', fade(u, 1.4), { 'font-size': 14 });
    grow(575, 180, 690, 230, E(u, 1.8, 2.2), VC);
    card(800, 240, 200, 70, { rx: 10, stroke: VC, sw: 2.6, fill: PANEL, s: pop(u, 2.1) });
    tx(800, 236, '📦 V[동물] 본문', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: VC, opacity: fade(u, 2.2) });
    mono(800, 260, '[0.9, 0.1, 0.4, 0.7]', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); }

  // ---------- 3. 계산 해부 ----------
  const SX = 330, SY = 120, SCS = 70;
  function scoreMat(m, o) { o = o || {}; mat(SX, SY, m, SCS, ACC, Object.assign({ rows: T, cols: T, max: o.max || 2.3, fs: 15 }, o)); }
  function rowBars(x, y, vals, o) { o = o || {}; T.forEach((s, j) => { tx(x - 10, y + j * 40 + 16, s, { 'font-size': 14.5, 'text-anchor': 'end', fill: MUT, opacity: o.op ?? 1 });
      R.hbar(x, y + j * 40, o.w || 150, vals[j], 1, { h: 22, u: o.u ?? 1, col: o.col || ACC, text: f2(vals[j]) }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { mat(40, SY, Q, 44, QC, { fmt: f1, rows: T, fs: 13.5, show: () => fade(u, 0.2) }); lbl(126, SY - 16, 'Q', 1, { class: 'mono', fill: QC });
      tx(228, SY + 70, '@', { 'font-size': 24, 'font-weight': 800, fill: MUT });
      const KT = [0, 1, 2, 3].map((d) => K.map((r) => r[d]));
      mat(250, SY - 30, KT, 44, KC, { fmt: f1, fs: 13.5, ch: 44, show: () => fade(u, 0.4) }); lbl(315, SY - 40, 'K.T', 1, { class: 'mono', fill: KC });
      tx(400, SY + 70, '=', { 'font-size': 24, 'font-weight': 800, fill: MUT });
      const flash = E(u, 0.9, 1.3);
      mat(440, SY, SC, 64, ACC, { cols: T, max: 2.3, fs: 15, show: () => flash });
      lbl(533, SY + 220, 'scores  (3, 3)', fade(u, 1.4), { class: 'mono' });
      note(700, 140, '행렬곱 한 번 = 9쌍 동시', fade(u, 1.6), { fill: ACC });
      mono(700, 200, 'for i: for j: ...', { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) }); el('line', { x1: 696, y1: 195, x2: 696 + 160 * E(u, 2.2, 2.5), y2: 195, stroke: BAD, 'stroke-width': 3 });
      sub(780, 240, '쌍마다 루프를 돌 필요 없음', fade(u, 2.4), { 'font-size': 15 }); return; }
    if (k === 1) { scoreMat(SC, { dim: (r) => (r === 2 ? 1 : 0.4), hi: (r, cc) => r === 2 && cc === 0 && u > 0.5 });
      const terms = ['1.0×1.2', '0.2×0.3', '0.1×0.1', '1.0×1.0']; terms.forEach((s, i) => mono(600, 140 + i * 34, (i ? '+ ' : '  ') + s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.25) }));
      el('line', { x1: 600, y1: 268, x2: 760, y2: 268, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.8) });
      mono(600, 298, '= 2.27  (최대)', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      sub(700, 340, 'Q[그것] · K[동물] — 방향이 닮았다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 2) { lbl(150, 80, '"그것" 행의 softmax', 1, { 'font-size': 16 });
      const cols = [[RAW, '÷√d_k 없이', WARN, 110, 0.3], [AT[2], '÷√d_k = ÷2', ACC, 420, 1.0], [HOT, '점수 폭 ×8 이면', BAD, 730, 1.7]];
      cols.forEach(([v, n, colr, x, at]) => { lbl(x + 70, 130, n, fade(u, at), { fill: colr }); rowBars(x, 160, v, { w: 120, col: colr, u: E(u, at, at + 0.5), op: fade(u, at) }); });
      sub(800, 310, '(d_k 가 64배 커진 셈)', fade(u, 1.9), { 'font-size': 14 });
      note(480, 360, '내적 분산 ∝ d_k → 포화 → 기울기 소실', fade(u, 2.3), { 'text-anchor': 'middle', fill: BAD }); return; }
    if (k === 3) { const g = E(u, 0.6, 1.6); scoreMat(SC.map((r, i) => r.map((v, j) => lerp(v, SS[i][j], g))), { max: lerp(2.3, 1.2, g), hi: (r, cc) => r === 2 && cc === 0 });
      mono(600, 150, 'd_k = 4,  √d_k = 2', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(600, 200, 'scaled = scores / 2', { 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      mono(600, 260, `2.27 → ${f2(lerp(2.27, SS[2][0], g))}`, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      sub(720, 310, '분포가 완만해진다 (분산을 1 근처로)', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 4) { const r = SS[2], m = Math.max(...r), sh = r.map((v) => v - m), ex = sh.map(Math.exp), z = ex.reduce((a, b) => a + b, 0);
      const rows = [['scaled', r], ['− max', sh], ['exp', ex], ['÷ Σ', ex.map((v) => v / z)]];
      T.forEach((s, j) => lbl(310 + j * 130, 90, s, 1));
      rows.forEach(([n, vals], i) => { const at = 0.3 + i * 0.5, y = 135 + i * 60; mono(200, y + 5, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', fill: i === 3 ? ACC : INK, opacity: fade(u, at) });
        vals.forEach((v, j) => card(310 + j * 130, y, 104, 42, { rx: 8, text: f2(v), fs: 16, mono: true, stroke: i === 3 ? ACC : GRID, color: i === 3 ? ACC : INK, s: pop(u, at + j * 0.08) })); });
      mono(720, 320, `Σ exp = ${f2(z)}`, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      sub(480, 395, 'max 를 빼도 결과는 같고, exp 오버플로만 막는다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 5) { mat(60, 110, AT, 62, ACC, { rows: T, cols: T, max: 0.5, fs: 15, hi: (r, cc) => r === 2 && cc === 0 && u > 0.8, show: (r) => fade(u, 0.2 + r * 0.2) });
      T.forEach((_, r) => mono(60 + 3 * 62 + 8, 110 + r * 62 + 36, 'Σ=1', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9 + r * 0.1) }));
      arcs(370, AT[2].map((v) => v), u, { at: 1.2, dx: 330 }); return; }
    if (k === 6 || k === 7) { mat(40, 110, [AT[2]], 66, ACC, { cols: T, max: 0.5, fs: 15 }); lbl(136, 205, 'attn[그것]', 1, { class: 'mono', 'font-size': 15 });
      mat(330, 110, V, 50, VC, { fmt: f1, rows: T, show: () => (k === 6 ? fade(u, 0.3) : 1), dim: (r) => (k === 7 ? 1 : 0.4 + 0.6 * E(u, 0.8 + r * 0.3, 1.1 + r * 0.3)) }); lbl(428, 92, 'V', k === 6 ? fade(u, 0.3) : 1, { class: 'mono', fill: VC });
      if (k === 6) { AT[2].forEach((w, j) => { const at = 0.8 + j * 0.3; mono(560, 140 + j * 50, `× ${f2(w)}`, { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, at) }); });
        grow(640, 185, 720, 185, E(u, 1.9, 2.2), MUT);
        mono(760, 190, 'out = attn @ V', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
        note(330, 330, '여기서 처음으로 V 가 계산에 쓰인다', fade(u, 2.3), { fill: VC }); return; }
      // k7: 새 벡터
      const g = E(u, 0.4, 1.4);
      mat(660, 160, [V[2].map((v, d) => lerp(v, OUT[2][d], g))], 56, ACC, { cols: ['d1', 'd2', 'd3', 'd4'], fs: 15 });
      lbl(770, 140 - 12, '"그것" 의 새 벡터', 1, { fill: ACC });
      mat(660, 250, [V[0]], 56, VC, { fs: 15, fmt: f2, show: () => fade(u, 1.4) }); tx(650, 280, 'V[동물]', { 'font-size': 14.5, 'font-weight': 700, fill: VC, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      tx(650, 190, g < 0.5 ? 'V[그것]' : 'out[그것]', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'end' });
      note(330, 360, '대명사가 선행사의 의미를 흡수했다', fade(u, 2.0), { fill: ACC }); } }

  // ---------- 4. 병렬성 ----------
  function rnnLane(y, done, o) { o = o || {}; for (let i = 0; i < 8; i++) { const x = 70 + i * 82, on = i < done;
      card(x + 30, y, 60, 38, { rx: 7, text: `t${i + 1}`, fs: 15, mono: true, fill: on ? INK : PANEL, color: on ? PANEL : MUT, stroke: on ? INK : GRID });
      if (i < 7) grow(x + 62, y, x + 80, y, on ? 1 : 0.999, on ? INK : GRID, { plain: true }); } }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 70, 'scores = Q @ K.T', { 'font-size': 20, 'font-weight': 800, fill: ACC });
      const flash = E(u, 0.6, 0.8); mat(120, 130, SC, 72, ACC, { rows: T, cols: T, max: 2.3, fs: 15, show: () => flash });
      pill(250, 375, '곱셈 1번', ACC, pop(u, 1.0), { fs: 16 });
      mono(560, 160, 'for i in range(n):', { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.3) }); mono(560, 190, '    for j in range(n): ...', { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.3) });
      cross(860, 175, 14, pop(u, 1.8));
      note(560, 280, '루프가 없다 — 9칸이 한꺼번에', fade(u, 2.2)); return; }
    if (k === 1) { const N = 32, cs = 9, g = E(u, 1.0, 1.3);
      mat(60, 130, SC, 46, ACC, { max: 2.3, fs: 13.5, num: 1 }); mono(60, 300, '3 × 3 = 9', { 'font-size': 17, 'font-weight': 700 });
      grow(220, 200, 330, 200, E(u, 0.4, 0.8), MUT);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) el('rect', { x: 360 + j * cs, y: 60 + i * cs, width: cs - 1.5, height: cs - 1.5, fill: ACC, opacity: g * (0.25 + 0.5 * (((i * 7 + j * 3) % 5) / 5)) });
      mono(360, 375, '512 × 512 = 262,144 쌍', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      sub(820, 160, '(그림은 32×32 만)', fade(u, 1.4), { 'font-size': 14 });
      note(700, 240, '한 번의 곱셈으로', fade(u, 1.9)); note(700, 272, 'GPU 가 가장 잘하는 연산', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 2) { const done = Math.floor(clamp((u - 0.2) / 2.3) * 8 + 1e-9);
      lbl(80, 70, 'RNN — h_t 는 h_(t-1) 을 기다린다', 1, { 'text-anchor': 'start' }); rnnLane(120, done);
      mono(760, 75, `순차 스텝 ${done} / 8`, { 'font-size': 16, 'font-weight': 700, fill: MUT });
      tx(80, 205, 'GPU 코어', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 4; i++) for (let j = 0; j < 24; j++) { const busy = j === 0 && i === 0; el('rect', { x: 80 + j * 30, y: 225 + i * 26, width: 24, height: 20, rx: 3, fill: busy ? INK : SOFT, stroke: GRID }); }
      note(80, 375, '코어 하나만 일하고 나머지는 논다', fade(u, 1.6), { fill: BAD }); return; }
    if (k === 3) { rnnLane(110, 8); lbl(80, 66, 'RNN: t1 → t8 은 7칸 경유  O(n)', 1, { 'text-anchor': 'start', fill: MUT });
      const pts = []; for (let i = 0; i < 8; i++) pts.push([100 + i * 82, 110]);
      const g = seg(u, 0.3, 1.9); if (g > 0 && g < 1) { const i = Math.min(6, Math.floor(g * 7)), f = g * 7 - i; el('circle', { cx: lerp(pts[i][0], pts[i + 1][0], f), cy: 110, r: 9 * (1 - 0.7 * g), fill: WARN }); }
      sub(400, 160, '거칠수록 기억이 희석', fade(u, 1.0), { 'font-size': 15, fill: WARN });
      lbl(80, 226, 'Self-Attention: 어떤 두 토큰이든 직통  O(1)', fade(u, 1.4), { 'text-anchor': 'start', fill: ACC });
      for (let i = 0; i < 8; i++) card(100 + i * 82, 320, 60, 38, { rx: 7, text: `t${i + 1}`, fs: 15, mono: true, stroke: i === 0 || i === 7 ? ACC : GRID, color: i === 0 || i === 7 ? ACC : MUT, op: fade(u, 1.4) });
      const a = E(u, 1.7, 2.3); if (a > 0) el('path', { d: `M100,300 Q 387,${300 - 140 * a} ${lerp(100, 674, a)},300`, fill: 'none', stroke: ACC, 'stroke-width': 4 });
      R.dot([[100, 300], [387, 230], [674, 300]], seg(u, 2.0, 2.6), ACC, 8); return; }
    // k4: 융합 커널
    const steps = ['② ÷√d_k', '③ softmax', '④ @ V']; steps.forEach((s, i) => { const x = 280 + i * 200;
      card(x, 100, 170, 50, { rx: 10, text: s, fs: 16, mono: true, s: pop(u, 0.2 + i * 0.2), op: 1 - 0.6 * E(u, 1.6, 2.0) }); grow(x, 126, lerp(x, 480, 0.6), 176, E(u, 0.9 + i * 0.15, 1.3 + i * 0.15), MUT); });
    card(480, 210, 560, 64, { rx: 14, stroke: ACC, sw: 3, fill: ACCBG, s: pop(u, 1.6) });
    mono(480, 217, 'F.scaled_dot_product_attention(Q, K, V)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.7) });
    mono(480, 300, `out[그것] = [${OUT[2].map(f2).join(', ')}]`, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    sub(480, 345, '원리는 같다 — 메모리와 속도만 좋아진다', fade(u, 2.4), { 'font-size': 15 }); }

  // ---------- 5. 순서 소실 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { mono(80, 90, 'scores = Q @ K.T', { 'font-size': 20, 'font-weight': 800, fill: ACC });
      mono(80, 130, 'attn = softmax(scores / √d_k)', { 'font-size': 18, 'font-weight': 700 }); mono(80, 165, 'out = attn @ V', { 'font-size': 18, 'font-weight': 700 });
      T.forEach((s, i) => { tok(160 + i * 150, 270, s, { s: pop(u, 0.4 + i * 0.1) }); mono(160 + i * 150, 320, `pos ${i}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) });
        cross(160 + i * 150 + 52, 314, 10, pop(u, 1.3 + i * 0.15)); });
      note(600, 120, '위치 인덱스를 쓰는 줄: 0개', fade(u, 1.8), { fill: BAD });
      sub(720, 170, 'QK^T 는 쌍의 관련도만 본다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { const P = [2, 0, 1], g = E(u, 0.6, 1.6);
      lbl(150, 70, '원래 순서', 1); lbl(560, 70, '행을 섞으면', fade(u, 0.5));
      T.forEach((s, i) => { tok(80, 120 + i * 80, s); mat(140, 102 + i * 80, [OUT[i]], 54, ACC, { fs: 13.5 }); });
      P.forEach((src, i) => { const y = lerp(120 + src * 80, 120 + i * 80, g); tok(490, y, T[src], { op: fade(u, 0.5) }); mat(550, y - 18, [OUT[src]], 54, ACC, { fs: 13.5, show: () => fade(u, 0.5) }); });
      mono(490, 375, 'allclose(out_perm, out[p]) → True', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      sub(240, 375, '각 토큰이 받는 값은 그대로', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 2) { const A = ['동물', '이', '그것', '을', '보았다'], B = ['그것', '이', '동물', '을', '보았다'];
      [[A, 90, '문장 A'], [B, 190, '문장 B']].forEach(([ws, y, n], q) => { tx(40, y + 6, n, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2 + q * 0.3) });
        ws.forEach((w, i) => tok(160 + i * 90, y, w, { s: pop(u, 0.3 + q * 0.3 + i * 0.05), stroke: w === '동물' || w === '그것' ? ACC : INK })); });
      el('path', { d: 'M640,240 L660,330 Q 740,370 820,330 L840,240 Z', fill: SOFT, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 1.2) });
      ['동물', '이', '그것', '을', '보았다'].forEach((w, i) => tx(690 + (i % 3) * 52, 290 + Math.floor(i / 3) * 28, w, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.5) }));
      grow(620, 90, 700, 235, E(u, 1.2, 1.6), MUT); grow(620, 190, 690, 245, E(u, 1.3, 1.7), MUT);
      note(60, 300, '형태소 가방이 똑같다 → 결과도 같다', fade(u, 1.9), { fill: BAD });
      sub(270, 340, '주어·목적어 구분 실패', fade(u, 2.3), { 'font-size': 15, fill: BAD }); return; }
    if (k === 3) { const ax = R.axes(520, 90, 380, 200, { x: [0, 10], y: [-1, 1], xl: '위치 pos' });
      [[1, ACC], [0.5, WARN], [0.25, INFO]].forEach(([f, colr], q) => { const pts = []; for (let i = 0; i <= 50; i++) { const x = i / 5; pts.push([x, Math.sin(f * x)]); } R.line(ax, pts, E(u, 0.8 + q * 0.3, 1.6 + q * 0.3), colr, { sw: 2.4 }); });
      lbl(710, 70, 'PE(pos) — 자리마다 다른 무늬', fade(u, 0.8), { fill: ACC });
      mat(80, 120, [[0.5, 0.5, 0.5, 0.5]], 40, MUT, { num: 0 }); tx(70, 145, '단어', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: MUT });
      tx(150, 205, '+', { 'font-size': 24, 'font-weight': 800, opacity: fade(u, 0.4) });
      mat(80, 230, [[0.2, 0.9, 0.4, 0.7]], 40, ACC, { num: 0, show: () => fade(u, 0.5) }); tx(70, 255, 'PE', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 0.5) });
      mono(80, 330, 'X ← X + PE(pos)', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      sub(700, 360, '어텐션 계산식은 그대로, 입력만 달라진다', fade(u, 2.3), { 'font-size': 15 }); return; }
    // k4
    const items = ['서로를 읽는 Self-Attention', '위치 인코딩', '행렬곱 병렬 학습'];
    items.forEach((s, i) => { check(110, 120 + i * 60, 12, pop(u, 0.3 + i * 0.4)); tx(140, 127 + i * 60, s, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); });
    grow(470, 180, 560, 180, E(u, 1.6, 1.9), ACC);
    card(720, 180, 270, 80, { rx: 14, stroke: ACC, sw: 3, fill: ACCBG, s: pop(u, 1.9) });
    tx(720, 172, 'RNN 없이 전체를?', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
    mono(720, 200, '→ Transformer (IV-2-1)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }

  RA.page({ title: 'Self-Attention — "그것" 은 무엇을 보는가', scenes: [s1, s2, s3, s4, s5] });
})();
