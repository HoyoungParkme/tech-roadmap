/* V-2-1 drift 감지 — refresh / preview — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 코드 · state · 실제 세 칸 표 ----------
  const COL = { code: 330, state: 570, actual: 810 }, KX = 30, RY = [96, 140, 184], HY = 42;
  const NAME = { code: '코드 index.ts', state: 'state 파일', actual: '실제 AWS' };
  // o.flip(col, row) → 그 칸이 바뀌는 시각 (없으면 바로), o.dim(col) → 흐리게, o.hi(col) → 머리 강조
  function table(c, o) { o = o || {}; const rows = c.beat.rows, prev = (c.prev && c.prev.rows) || rows, u = c.u;
    Object.entries(COL).forEach(([key, x]) => { const hi = o.hi && o.hi(key), dim = o.dim && o.dim(key);
      el('rect', { x: x - 105, y: HY - 22, width: 210, height: 206, rx: 10, fill: hi ? ACCBG : SOFT, stroke: hi ? ACC : 'none', 'stroke-width': 2, opacity: dim ? 0.45 : 1 });
      tx(x, HY + 2, NAME[key], { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: hi ? ACC : MUT, opacity: dim ? 0.5 : 1 }); });
    rows.forEach((r, i) => { const y = RY[i] + 20; mono(KX, y + 5, r.key, { 'font-size': 15, 'font-weight': 700 });
      Object.entries(COL).forEach(([key, x]) => { const v = r[key], pv = prev[i] ? prev[i][key] : v, dim = o.dim && o.dim(key);
        const bad = key !== 'code' && v !== r.code, col = key === 'actual' && v !== r.state ? BAD : bad ? WARN : INK;
        const at = o.flip ? o.flip(key, i) : null;
        if (pv !== v && at != null) { const f = E(u, at, at + 0.5);
          mono(x, y + 5 - 16 * f, pv, { 'text-anchor': 'middle', 'font-size': 15.5, fill: MUT, opacity: (1 - f) * (dim ? 0.5 : 1) });
          mono(x, y + 5 + 16 * (1 - f), v, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: col, opacity: f * (dim ? 0.5 : 1) }); }
        else mono(x, y + 5, v, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: col, opacity: dim ? 0.5 : 1 }); }); }); }
  // 두 칸 사이 어긋남 표시 (≠)
  function neq(a, b, i, col, op) { const x = (COL[a] + COL[b]) / 2, y = RY[i] + 25; if (op <= 0) return;
    tx(x, y, '≠', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: op }); }
  function eq(a, b, i, op) { const x = (COL[a] + COL[b]) / 2, y = RY[i] + 25; if (op <= 0) return;
    tx(x, y, '=', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: op }); }
  function cmd(x, y, w, s, u, o) { o = o || {}; const n = Math.round(s.length * clamp((u - (o.t0 ?? 0.1)) / (o.d || 0.8)));
    el('rect', { x, y, width: w, height: 40, rx: 8, fill: INK }); mono(x + 16, y + 26, '$ ' + s.slice(0, n), { 'font-size': o.fs || 15, fill: PANEL }); }
  const note = (s, a, u, col, y, x) => tx(x || 480, y || 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, a) });

  // =========================================================
  // 1. drift — 콘솔 손질이 실제만 바꾼다
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    const fl = k === 2 ? (key, i) => (key === 'actual' ? 0.9 + i * 0.4 : null) : null;
    table(c, { flip: fl, hi: (key) => (k === 2 && key === 'actual') || (k === 3 && key === 'state'), dim: (key) => k === 4 && key === 'actual' });
    if (k === 0) { // 배포: 코드 값이 state, 실제로 흘러간다
      [0, 1].forEach((i) => { dot([[COL.code + 50, RY[i] + 20], [COL.state - 50, RY[i] + 20]], seg(u, 0.3 + i * 0.2, 1.0 + i * 0.2), ACC, 6);
        dot([[COL.state + 50, RY[i] + 20], [COL.actual - 50, RY[i] + 20]], seg(u, 1.1 + i * 0.2, 1.8 + i * 0.2), ACC, 6); });
      pill(480, 280, 'pulumi up 직후', ACC, pop(u, 0.3), { fs: 15 });
      note('세 칸이 모두 같다', 1.9, u, GOOD, 330); }
    if (k === 1) { el('rect', { x: KX - 8, y: RY[2] + 2, width: 910, height: 36, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.3) });
      note('tags까지 state에 그대로 기록된다', 1.0, u, INK, 300); sub(480, 330, 'state = 배포 때 무엇을 만들었는지 적어 둔 스냅샷', fade(u, 1.4), { 'font-size': 14.5 }); }
    if (k === 2) { person(860, 320, 'AWS 콘솔', { s: pop(u, 0.2) });
      [0, 1, 2].forEach((i) => grow(840, 290, COL.actual + 75, RY[i] + 22, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), BAD, { dash: '4 4' }));
      note('코드도 state도 거치지 않고 실제만 바뀐다', 2.0, u, BAD, 300, 400); }
    if (k === 3) { [0, 1, 2].forEach((i) => neq('state', 'actual', i, BAD, fade(u, 0.4 + i * 0.3)));
      pill(COL.state, 250, '옛 값 그대로', WARN, pop(u, 0.3), { fs: 14 });
      card(480, 330, 300, 56, { rx: 12, fill: BADBG, stroke: BAD, sw: 2.2, s: pop(u, 1.4) });
      tx(480, 337, 'drift = state ≠ 실제', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k === 4) { [0, 1, 2].forEach((i) => eq('code', 'state', i, fade(u, 0.6 + i * 0.25)));
      cmd(40, 262, 260, 'pulumi up', u, { t0: 0.1, d: 0.4 });
      el('path', { d: `M${COL.code},${250} V${270} H${COL.state} V${250}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.6) });
      pill((COL.code + COL.state) / 2, 300, '비교: 코드 ↔ state → 변경 0', GOOD, pop(u, 1.3), { fs: 14 });
      tx(COL.actual, 262, '읽지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.6) });
      note('drift는 그대로 남는다', 2.1, u, BAD, 360); } }

  // =========================================================
  // 2. pulumi refresh — 실제를 읽어 state 만 덮는다
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    const fl = k === 3 ? (key, i) => (key === 'state' ? 0.9 + i * 0.3 : null) : null;
    table(c, { flip: fl, hi: (key) => (k <= 2 && key === 'actual') || (k === 3 && key === 'state') || (k === 4 && key === 'code') });
    cmd(40, 262, 300, k === 2 ? 'pulumi refresh  … yes' : 'pulumi refresh', k === 0 || k === 2 ? u : 3);
    if (k <= 2) [0, 1, 2].forEach((i) => neq('state', 'actual', i, BAD, 1));
    if (k === 0) { [0, 1, 2].forEach((i) => dot([[COL.state + 60, RY[i] + 22], [COL.actual - 60, RY[i] + 22], [COL.state + 60, RY[i] + 30]], seg(u, 0.6 + i * 0.3, 2.0 + i * 0.3), INFO, 6));
      note('클라우드 API로 실제 값을 하나씩 읽는다', 1.4, u, INFO, 300, 640); }
    if (k === 1) { mono(390, 290, '~ aws:ec2:Instance  web-server  update', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      ['~instanceType', '~monitoring', '~tags'].forEach((s, i) => pill(470 + i * 150, 336, s, WARN, pop(u, 0.9 + i * 0.3), { mono: true, fs: 14 }));
      sub(640, 384, '미리보기 단계: state는 아직 안 건드린다', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 2) { el('rect', { x: 380, y: 270, width: 540, height: 110, rx: 10, fill: INK, opacity: fade(u, 0.2) });
      mono(400, 300, 'Resources:', { 'font-size': 14.5, fill: PANEL, opacity: fade(u, 0.4) });
      mono(420, 326, '~ 1 to update', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 0.7) });
      mono(400, 360, 'Do you want to perform this refresh? yes', { 'font-size': 14.5, fill: PANEL, opacity: fade(u, 1.3) }); }
    if (k === 3) { [0, 1, 2].forEach((i) => { fly(COL.actual, RY[i] + 20, COL.state, RY[i] + 20, seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3), '', { fill: INFO });
        eq('state', 'actual', i, fade(u, 1.6 + i * 0.2)); });
      note('state가 실제 값으로 바뀌었다', 1.8, u, INFO, 310, 640); }
    if (k === 4) { [0, 1, 2].forEach((i) => { eq('state', 'actual', i, 1); neq('code', 'state', i, WARN, fade(u, 0.4 + i * 0.3)); });
      card(COL.actual, 300, 190, 50, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.2) }); check(COL.actual - 66, 300, 9, pop(u, 1.3));
      tx(COL.actual + 10, 306, '실제는 그대로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      note('이번엔 코드 ≠ state가 드러났다', 1.8, u, WARN, 370, 640); } }

  // =========================================================
  // 3. preview --refresh — 메모리에서만 맞춰 보고 diff
  // =========================================================
  const DIFF = [['instanceType', '"t3.large"', '"t3.small"'], ['monitoring', 'true', 'false'], ['tags.Env', '"staging"', '"prod"']];
  function s3(t, c) { const { k, u } = c;
    table(c, { hi: (key) => (k === 2 && (key === 'actual' || key === 'code')), dim: (key) => k === 0 && key === 'state' });
    cmd(40, 262, 330, 'pulumi preview --refresh', k === 0 ? u : 3);
    if (k === 0) { el('rect', { x: COL.state - 112, y: HY - 30, width: 224, height: 222, rx: 12, fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      pill(COL.state, 250, '메모리에서만 refresh', INFO, pop(u, 1.0), { fs: 14 });
      lock(COL.state + 130, 300, true, MUT, pop(u, 1.6)); tx(COL.state + 150, 306, 'state 파일 저장 안 함', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
    const box = (s) => { el('rect', { x: 400, y: 252, width: 540, height: 160, rx: 10, fill: INK, opacity: s }); };
    box(k === 1 ? fade(u, 0.2) : 1);
    mono(416, 280, ' ~  aws:ec2:Instance  web-server  update', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.5) : 1 });
    if (k === 1) { pill(890, 236, 'Plan', WARN, pop(u, 1.2), { fs: 13.5 }); sub(670, 330, '줄 앞 기호가 계획 종류', fade(u, 1.5), { fill: OFF, 'font-size': 14.5 }); }
    if (k === 2) DIFF.forEach(([key, a, b], i) => { const y = 312 + i * 30, op = fade(u, 0.4 + i * 0.4);
      mono(430, y, '~ ' + key, { 'font-size': 14.5, fill: 'var(--term)', opacity: op }); mono(600, y, a, { 'font-size': 14.5, fill: '#fca5a5', opacity: op });
      mono(700, y, '=>', { 'font-size': 14.5, fill: OFF, opacity: op }); mono(740, y, b, { 'font-size': 14.5, fill: '#86efac', 'font-weight': 700, opacity: op }); });
    if (k === 2) { tx(600, 240, '실제 값', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); tx(740, 240, '코드가 원하는 값', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 3) { mono(430, 316, 'Resources:', { 'font-size': 14.5, fill: PANEL, opacity: fade(u, 0.2) });
      mono(450, 344, '~ 1 to update', { 'font-size': 15, 'font-weight': 800, fill: '#fcd34d', opacity: fade(u, 0.5) });
      mono(450, 372, '1 unchanged   (pulumi:pulumi:Stack)', { 'font-size': 14.5, fill: OFF, opacity: fade(u, 1.0) });
      pill(200, 340, '예상과 같은 범위인가?', INK, pop(u, 1.6), { fs: 14 }); }
    if (k === 4) { el('rect', { x: 400, y: 296, width: 540, height: 116, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      [['+', 'create', GOOD], ['~', 'update', WARN], ['+-', 'replace', BAD], ['-', 'delete', BAD], ['', 'same', MUT]].forEach(([sym, n, col], i) => { const x = 450 + i * 104, on = n === 'update';
        card(x, 350, 92, 70, { rx: 10, fill: on ? WARNBG : PANEL, stroke: col, sw: on ? 3 : 1.8, s: pop(u, 0.3 + i * 0.25) });
        mono(x, 344, sym || '·', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.25) });
        mono(x, 372, n, { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.4 + i * 0.25) }); });
      tx(200, 340, '+- 가 보이면 멈추고 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); } }

  // =========================================================
  // 4. 재수렴 — 실제를 코드로, 또는 코드를 실제로
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 3) { // 판단 카드
      tx(480, 50, '이 변경은 계속 둘 것인가?', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, opacity: fade(u, 0.2) });
      [['임시 긴급 변경 (핫픽스)', 'A. 코드 그대로 pulumi up', '실제가 코드 값으로 돌아간다', ACC, 250], ['의도된 영구 변경', 'B. 코드를 실제 값으로 고친다', '코드가 현실을 기록한다', INFO, 710]].forEach(([q, a, r, col, x], i) => {
        const s = pop(u, 0.5 + i * 0.5); card(x, 200, 380, 200, { rx: 14, fill: PANEL, stroke: col, sw: 2.5, s });
        tx(x, 140, q, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) });
        tx(x, 196, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.8 + i * 0.5) });
        tx(x, 248, r, { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.0 + i * 0.5) }); });
      note('어느 쪽이든 코드가 진실의 원천으로 남는다', 2.0, u, INK, 370); return; }
    const fl = k === 1 ? (key, i) => (key !== 'code' ? 0.6 + i * 0.3 + (key === 'state' ? 0.2 : 0) : null) : k === 2 ? (key, i) => (key === 'code' ? 0.4 + i * 0.3 : null) : null;
    table(c, { flip: fl, hi: (key) => (k <= 1 && key === 'code') || (k === 2 && key === 'code') });
    cmd(40, 262, 280, k === 2 ? 'vi index.ts && pulumi up' : 'pulumi up', k === 0 || k === 2 ? u : 3);
    if (k === 0) { [0, 1, 2].forEach((i) => { neq('code', 'state', i, WARN, 1); dot([[COL.code + 50, RY[i] + 20], [COL.actual - 50, RY[i] + 20]], seg(u, 0.6 + i * 0.3, 1.6 + i * 0.3), ACC, 7); });
      note('코드가 진실이라고 정했다', 1.8, u, ACC, 300, 640); }
    if (k === 1) { [0, 1, 2].forEach((i) => { eq('code', 'state', i, fade(u, 1.8)); eq('state', 'actual', i, fade(u, 1.9)); });
      card(640, 320, 280, 54, { rx: 12, fill: GOODBG, stroke: GOOD, sw: 2.2, s: pop(u, 2.0) });
      tx(640, 327, '세 칸 일치 · drift 0', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) }); }
    if (k === 2) { [0, 1, 2].forEach((i) => { eq('code', 'state', i, fade(u, 1.6)); eq('state', 'actual', i, fade(u, 1.6)); });
      pill(640, 300, 'up 결과: 변경 없음 (no-op)', INFO, pop(u, 1.8), { fs: 15 });
      sub(640, 340, 'refresh로 state가 이미 실제와 같았다', fade(u, 2.1), { 'font-size': 14.5 }); } }

  // =========================================================
  // 5. Pulumi Cloud drift 스케줄 — 매시간 검사, 알림
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    // 시간축: 매시간 정각 검사
    const X0 = 80, X1 = 880, Y = 120, hrs = 7, xs = [...Array(hrs)].map((_, i) => lerp(X0, X1, i / (hrs - 1)));
    tx(X0 - 10, 60, k === 0 ? 'scheduleCron: "0 * * * *"' : '매시간 정각 = 검사 1회', { 'font-size': 15, 'font-weight': 700, fill: MUT, class: k === 0 ? 'mono' : null, opacity: k === 0 ? fade(u, 0.2) : 1 });
    grow(X0, Y, X1, Y, k === 0 ? E(u, 0.3, 1.2) : 1, GRID, { plain: true, sw: 3 });
    const driftAt = 4;
    xs.forEach((x, i) => { const s = k === 0 ? pop(u, 0.6 + i * 0.2) : 1, red = k >= 2 && i === driftAt;
      el('circle', { cx: x, cy: Y, r: 11 * s, fill: red ? BAD : GOODBG, stroke: red ? BAD : GOOD, 'stroke-width': 2 });
      mono(x, Y + 34, String(i).padStart(2, '0') + ':00', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s > 0.3 ? 1 : 0 }); });
    if (k === 0) { note('사람이 매번 refresh 하지 않아도 된다', 1.9, u, INK, 230); mono(480, 270, 'POST …/deployments/drift/schedules', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { // 자동 원복 스위치 꺼짐 + 검사는 미리보기만
      const sx = 250, sy = 260; el('rect', { x: sx - 36, y: sy - 18, width: 72, height: 36, rx: 18, fill: OFF, opacity: fade(u, 0.2) });
      el('circle', { cx: sx - 18, cy: sy, r: 14, fill: PANEL, opacity: fade(u, 0.2) }); mono(sx, sy + 46, 'autoRemediate: false', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) });
      sub(sx, sy + 72, '원복은 사람이 정한다', fade(u, 0.8), { 'font-size': 14 });
      card(680, 262, 330, 56, { rx: 10, fill: INK, stroke: 'none', s: pop(u, 1.2) }); mono(680, 268, 'pulumi refresh --preview-only', { 'text-anchor': 'middle', 'font-size': 14.5, fill: PANEL, opacity: fade(u, 1.4) });
      sub(680, 316, '검사 한 번 = 이것. state는 그대로', fade(u, 1.7), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const x = xs[driftAt]; pill(x, Y - 40, 'Drift detected', BAD, pop(u, 0.3), { fs: 14 });
      dot([[x, Y + 50], [x, 220], [480, 250]], seg(u, 0.6, 1.4), BAD, 7);
      card(480, 260, 170, 48, { rx: 10, fill: INK, stroke: 'none', text: 'Pulumi Webhooks', color: PANEL, fs: 14.5, s: pop(u, 1.2) });
      [['Slack', 300], ['Teams', 660]].forEach(([n, xx], i) => { grow(480 + (i ? 85 : -85), 260, xx + (i ? -60 : 60), 340, E(u, 1.5, 1.9), MUT, {});
        card(xx, 356, 120, 44, { rx: 10, text: n, fs: 15, stroke: INK, s: pop(u, 1.9 + i * 0.2) }); });
      return; }
    if (k === 3) { ['Stack', 'Settings', 'Schedules', 'Drift'].forEach((s, i) => { const x = 170 + i * 200;
        card(x, 240, 150, 46, { rx: 10, text: s, fs: 15, stroke: i === 3 ? ACC : INK, color: i === 3 ? ACC : INK, s: pop(u, 0.3 + i * 0.25) });
        if (i < 3) grow(x + 78, 240, x + 122, 240, E(u, 0.5 + i * 0.25, 0.8 + i * 0.25), MUT, {}); });
      pill(330, 320, 'Deployments 설정 먼저', WARN, pop(u, 1.5), { fs: 14 }); pill(630, 320, 'Pro · Enterprise 기능', INFO, pop(u, 1.8), { fs: 14 });
      note('스택마다 따로 건다. prod부터 챙긴다', 2.2, u, INK, 384); return; }
    [['정기 refresh · preview', '조기 발견'], ['알림 받고 추적', '누가 언제 바꿨나'], ['autoRemediate는 신중히', '스테이징부터'], ['콘솔 수동 변경 최소화', '코드가 진실의 원천']].forEach(([a, b], i) => {
      const x = 130 + i * 233, s = pop(u, 0.3 + i * 0.3); card(x, 280, 210, 92, { rx: 12, fill: PANEL, stroke: ACC, sw: 2, s });
      tx(x, 274, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.3) });
      tx(x, 300, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.3) }); }); }

  const quiz = [
    { q: '콘솔에서 instanceType을 t3.large로 바꾼 뒤 --refresh 없이 pulumi up을 하면 어떻게 되는가?',
      o: ['실제가 t3.small로 되돌아간다', '변경 없음으로 끝나고 drift는 남는다', 'state가 t3.large로 바뀐다'], a: 1,
      why: 'up은 코드와 state를 비교한다. 둘 다 t3.small이라 바꿀 것이 없다고 판단하고, 실제 값은 읽지 않는다.' },
    { q: 'pulumi refresh를 승인하고 끝나면 무엇이 바뀌는가?',
      o: ['state 파일만 실제 값으로 바뀐다', '실제 인스턴스가 코드 값으로 돌아간다', 'index.ts가 실제 값으로 고쳐진다'], a: 0,
      why: 'refresh는 클라우드 API로 실제를 읽어 state 기록만 덮어쓴다. 실제 리소스와 코드는 그대로라 이번엔 코드 ≠ state가 드러난다.' },
    { q: 'preview --refresh 출력의 "t3.large => t3.small" 은 무엇을 뜻하는가?',
      o: ['state가 t3.small로 저장됐다', '코드가 t3.large를 원한다', '지금 실제는 t3.large이고 up 하면 코드 값 t3.small로 바뀐다'], a: 2,
      why: '왼쪽이 메모리에서 읽은 실제 값, 오른쪽이 코드가 원하는 값이다. state 파일은 저장하지 않는다.' },
    { q: '콘솔 변경이 옳은 영구 변경이었다. refresh를 마친 뒤 어떻게 맞추는가?',
      o: ['코드를 실제 값으로 고치고 up 해서 no-op을 확인한다', '그냥 pulumi up으로 원복한다', 'state 파일을 손으로 고친다'], a: 0,
      why: '코드를 현실에 맞추면 코드·state·실제가 같아져 up은 바꿀 것이 없다. 그냥 up 하면 영구 변경이 지워진다.' },
    { q: 'Pulumi Cloud의 drift 검사 한 번은 어떤 명령과 같은가?',
      o: ['pulumi up', 'pulumi refresh --preview-only', 'pulumi destroy --preview-only'], a: 1,
      why: '스케줄 검사는 refresh를 미리보기로만 돌려 state를 바꾸지 않는다. autoRemediate를 켰을 때만 원복까지 한다.' },
  ];

  const summary = [
    'drift는 콘솔 수동 변경 같은 일로 state 기록과 실제 클라우드가 어긋난 상태다.',
    '--refresh 없는 up은 코드와 state만 비교해서 drift를 보지 못한다.',
    'refresh는 state만 실제 값으로 덮고, preview --refresh는 저장 없이 diff만 보여 준다.',
    '핫픽스면 up으로 되돌리고 영구 변경이면 코드를 고친다. Pulumi Cloud는 매시간 검사할 수 있다.',
  ];
  const review = [
    { q: '장애 중 콘솔에서 인스턴스를 t3.large로 키웠다. 이틀 뒤 다른 사람이 태그만 고치고 pulumi up --refresh를 돌리면?',
      o: ['태그만 바뀌고 인스턴스는 t3.large로 남는다', '인스턴스가 코드 값 t3.small로 함께 줄어든다', 'refresh 때문에 코드가 t3.large로 바뀐다'], a: 1,
      why: '--refresh로 실제 t3.large를 읽은 뒤 코드 t3.small과 비교하니 update가 잡힌다. 영구 변경이었다면 먼저 코드에 반영해야 했다.' },
    { q: 'drift가 있는지 보고만 싶고 state 파일은 그대로 두고 싶다. 알맞은 명령은?',
      o: ['pulumi refresh 후 yes', 'pulumi up', 'pulumi preview --refresh'], a: 2,
      why: 'preview --refresh는 메모리에서만 실제를 읽어 코드와 비교한다. refresh를 승인하면 state가 덮어써진다.' },
    { q: 'drift 스케줄을 매시간 걸었는데 Slack에 아무 알림이 오지 않는다. 먼저 확인할 것은?',
      o: ['Pulumi Webhooks에 drift 이벤트를 걸었는지', 'autoRemediate가 true 인지', 'cron이 "0 * * * *" 인지'], a: 0,
      why: '스케줄은 검사만 돌린다. 알림은 웹훅에 Drift detected 같은 이벤트를 걸어야 Slack으로 간다.' },
  ];

  R.page({ title: '코드 · state · 실제', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
