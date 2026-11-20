/* I-1-1 규칙 vs 학습 — 스팸 필터 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, meters, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통: 메일 한 줄 ----------
  const VD = { caught: ['차단', GOOD], missed: ['미탐', BAD], ok: ['통과', GOOD], falsepos: ['오탐', BAD] };
  const RY = 66, RH = 40;                       // 첫 줄 가운데 y, 줄 간격
  const ry = (i) => RY + i * RH;
  function head(cols) { cols.forEach(([x, s, a]) => tx(x, 40, s, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': a || 'start' })); }
  // m: {title, sender, label, verdict}  o: {op, dx, hl, hlCol, verdict, vs(크기), sender:false, x1}
  function mailRow(m, i, o) { o = o || {}; const y = ry(i), op = o.op ?? 1, dx = o.dx || 0;
    if (o.hl) el('rect', { x: 18 + dx, y: y - 17, width: (o.x1 || 592) - 18, height: 34, rx: 7, fill: o.hlCol || ACCBG, opacity: o.hl * op });
    pill(52 + dx, y, m.label === 'spam' ? '스팸' : '정상', m.label === 'spam' ? WARN : INFO, 1, { fs: 13.5, op });
    tx(88 + dx, y + 5, m.title, { 'font-size': 15, 'font-weight': 600, opacity: op });
    if (o.sender !== false) mono(336 + dx, y + 5, m.sender, { 'font-size': 13.5, fill: MUT, opacity: op });
    const v = o.verdict || m.verdict; if (VD[v]) { const [s, col] = VD[v]; pill(556 + dx, y, s, col, (o.vs ?? 1) * (1 + (o.bump || 0)), { fs: 13.5, op }); } }
  // 제목 안 부분 문자열 밑칠 (글자 폭 어림)
  function mark(i, title, part, col, op, x0) { const at = title.indexOf(part); if (at < 0) return; x0 = x0 ?? 88;
    const x = x0 + tw(title.slice(0, at), 15) - 2, w = tw(part, 15) + 4;
    el('rect', { x, y: ry(i) - 13, width: w, height: 24, rx: 4, fill: 'none', stroke: col || ACC, 'stroke-width': 2.2, opacity: op ?? 1 }); }
  // 위에서 아래로 훑는 막대: i 번째 줄에 닿는 시각
  const scanAt = (i, a) => a + i * 0.2;
  function scanBar(u, a, n) { const p = (u - a) / (n * 0.2); if (p < 0 || p > 1.05) return;
    const y = lerp(ry(0) - 20, ry(n - 1) + 20, clamp(p)); el('line', { x1: 14, y1: y, x2: 596, y2: y, stroke: ACC, 'stroke-width': 2.5, opacity: 0.8 }); }
  // 앞 beat → 이 beat 로 판정이 바뀌는 줄은 훑는 막대가 닿을 때 바뀐다
  function rowsScan(c, a, o) { o = o || {}; const ms = c.beat.mails, pm = c.prev && c.prev.mails, u = c.u;
    ms.forEach((m, i) => { const pv = pm && pm[i] && pm[i].id === m.id ? pm[i].verdict : m.verdict, hit = u >= scanAt(i, a), v = hit ? m.verdict : pv;
      const changed = pv !== m.verdict, extra = (o.row && o.row(i, m)) || {};
      mailRow(m, i, Object.assign({ verdict: v, bump: changed ? bump(u, scanAt(i, a)) * 3 : 0, hl: changed && hit ? 1 : 0, hlCol: VD[m.verdict][1] === BAD ? C.BADBG : C.GOODBG }, extra)); });
    scanBar(u, a, ms.length); }
  function score(c, x, y, w) { const b = c.beat.stats, p = (c.prev && c.prev.stats) || b, u = c.u;
    const cor = tween(p.correct, b.correct, u), mis = tween(p.missed, b.missed, u), fp = tween(p.falsepos, b.falsepos, u);
    meters(x, y, w, [
      { name: '정확', val: `${Math.round(cor)}/${b.total}`, good: b.correct === b.total },
      { name: '미탐', val: String(Math.round(mis)), hot: b.missed > 0 },
      { name: '오탐', val: String(Math.round(fp)), hot: b.falsepos > 0 },
    ], { h: 62 }); }
  // 둥근 띠 한 줄 (규칙 카드 등)
  function rule(x, y, w, name, code, o) { o = o || {}; const g = R.G(x, y, o.s, o.op);
    el('rect', { x: 0, y: -15, width: w, height: 30, rx: 7, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 1.8 }, g);
    tx(10, 5, name, { 'font-size': 13.5, 'font-weight': 800, fill: o.stroke || INK }, g);
    mono(10 + tw(name, 13.5) + 10, 5, code, { 'font-size': 13.5, fill: INK }, g); return g; }
  // 봉투
  function env(cx, cy, s, col, op) { const g = R.G(cx, cy, s, op);
    el('rect', { x: -14, y: -10, width: 28, height: 20, rx: 3, fill: PANEL, stroke: col || INK, 'stroke-width': 2 }, g);
    el('path', { d: 'M-14,-10 L0,2 L14,-10', fill: 'none', stroke: col || INK, 'stroke-width': 2 }, g); return g; }

  // =========================================================
  // 1. 규칙 3개 — 메일함을 if-else 로 거른다
  // =========================================================
  const PX = 626, PW = 314;
  function s1(t, c) { const { k, u } = c, ms = c.beat.mails;
    head([[30, '정답'], [88, '제목'], [336, '발신자'], [556, '판정', 'middle']]);
    // 오른쪽: spam_filter.py
    zone(PX, 26, PW, 262, 'spam_filter.py', { fill: SOFT });
    mono(PX + 14, 70, 'BLOCKED_DOMAINS', { 'font-size': 13.5, 'font-weight': 700, opacity: k === 0 ? fade(u, 1.4) : 1 });
    mono(PX + 14, 90, '= {"spam-mall.com"}', { 'font-size': 13.5, fill: ACC, opacity: k === 0 ? fade(u, 1.6) : 1 });
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1; card(PX + PW / 2, 120, PW - 28, 30, { rx: 8, text: 'is_spam(mail) → bool', mono: true, fs: 14, stroke: ACC, color: ACC, s }); }
    if (k >= 2) { const a = k === 2 ? 1.0 : -1; pill(PX + 70, 158, 'title', INK, pop(u, a), { mono: true, fs: 13.5 }); pill(PX + 160, 158, 'sender', INK, pop(u, a + 0.3), { mono: true, fs: 13.5 }); }
    const rules = [['규칙 1', '"광고" in title'], ['규칙 2', '"무료" and "쿠폰"'], ['규칙 3', 'domain ∈ BLOCKED']];
    rules.forEach(([n, s], i) => { if (k < 3 + i) return; const now = k === 3 + i; rule(PX + 14, 194 + i * 34, PW - 28, n, s, { s: now ? pop(u, 0.2) : 1, stroke: now ? ACC : INK, fill: now ? ACCBG : PANEL }); });
    if (k >= 6) rule(PX + 14, 296 - 0, PW - 28, 'else', 'return False', { s: k === 6 ? pop(u, 0.2) : 1, stroke: BAD });
    // 왼쪽: 메일함
    if (k === 0) ms.forEach((m, i) => { const a = 0.15 + i * 0.12; mailRow(m, i, { op: fade(u, a, 0.3), dx: -30 * (1 - E(u, a, a + 0.4)), vs: pop(u, 1.4 + i * 0.08) }); });
    else if (k === 3 || k === 4) rowsScan(c, 0.7, { row: (i, m) => { const w = k === 3 ? ['광고'] : ['무료', '쿠폰']; if (u > scanAt(i, 0.7) && w.every((x) => m.title.includes(x))) w.forEach((x) => mark(i, m.title, x, ACC, 1)); } });
    else ms.forEach((m, i) => mailRow(m, i, { hl: k === 6 && m.verdict === 'missed' ? fade(u, 0.6) : 0, hlCol: C.BADBG }));
    if (k === 1) { const i0 = 0; fly(560, ry(i0), PX + 60, 120, seg(u, 0.7, 1.5), 'mail', { mono: true }); fly(PX + 60, 120, 470, ry(i0), seg(u, 1.6, 2.4), 'False', { mono: true, fill: INK }); }
    if (k === 2) { const h = (ry(7) + 20 - (ry(0) - 20)) * E(u, 0.2, 1.0);
      el('rect', { x: 84, y: ry(0) - 20, width: 236, height: h, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      el('rect', { x: 332, y: ry(0) - 20, width: 176, height: h, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      sub(330, 398, '본문은 아직 안 본다 — 재료는 제목과 발신자 두 개', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 5) { ms.forEach((m, i) => { if (!m.sender.endsWith('spam-mall.com')) return; const a = 0.6 + i * 0.15;
        el('rect', { x: 336 + tw(m.sender.split('@')[0] + '@', 13.5) - 3, y: ry(i) - 12, width: tw('spam-mall.com', 13.5) + 6, height: 22, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, a) });
        pill(608, ry(i), '중복', WARN, pop(u, a + 0.5), { fs: 13.5 }); });
      sub(330, 398, '규칙 3 이 새로 잡은 메일: 0통 — 규칙 1 과 겹친다', fade(u, 1.6), { 'font-weight': 700, fill: WARN }); }
    if (k === 6) { const i = ms.findIndex((m) => m.verdict === 'missed'); grow(PX + 10, 296, 600, ry(i), E(u, 0.6, 1.3), BAD);
      sub(330, 398, '"초특가" 는 어느 규칙에도 없다 → False → 통과', fade(u, 1.4), { 'font-weight': 700, fill: BAD }); }
    score(c, PX, 332, PW); }

  // =========================================================
  // 2. 규칙 폭발 — 우회와 hotfix, 정확도는 내려간다
  // =========================================================
  const RULES = [3, 3, 11, 11, 19, 27, 27];
  function s2(t, c) { const { k, u } = c, ms = c.beat.mails, rows = c.beat.ruleGrowth.rows, prow = c.prev ? c.prev.ruleGrowth.rows : rows;
    head([[30, '정답'], [88, '제목 (스패머의 우회)'], [336, '발신자'], [556, '판정', 'middle']]);
    // 메일함
    if (k === 0) ms.forEach((m, i) => { const a = 0.15 + i * 0.12; mailRow(m, i, { op: fade(u, a, 0.3), dx: -30 * (1 - E(u, a, a + 0.4)) }); });
    else rowsScan(c, k === 1 ? 1.4 : 0.6, { row: (i, m) => {
      if (k === 2 && m.id === 'm-12') return { hl: fade(u, 0.8), hlCol: C.BADBG };
      if (k === 4 && m.id === 'm-13') return { hl: fade(u, 0.8), hlCol: C.BADBG };
      return null; } });
    if (k === 1) { const y = ry(0); // "~" 가 털려 나간다
      const p = E(u, 0.3, 1.2); mono(266 + 40 * p, y + 4 - 30 * p, '~', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: 1 - p });
      pill(220, 392, 'normalize: "[광~고]" → "[광고]" → 규칙 1 에 걸림', ACC, pop(u, 0.4), { fs: 13.5 }); }
    if (k === 2) { mark(1, ms[1].title, '광/고', BAD, fade(u, 0.9)); pill(250, 392, '"/" 는 정규화 목록에 없다 → 그대로 통과', BAD, pop(u, 1.2), { fs: 13.5 }); }
    if (k === 3) { pill(250, 392, 'hotfix #412 · #418 — "무료" 예외가 엉켜 정상 메일을 막는다', BAD, pop(u, 1.6), { fs: 13.5 }); }
    if (k === 4) { pill(250, 392, 'image_ratio > 0.8 and len(body) < 50 — 근거 없는 기준값', WARN, pop(u, 1.0), { fs: 13.5 }); }
    // 오른쪽: 규칙 수 vs 정확도
    const n = Math.round(tween(RULES[k - 1], RULES[k], u));
    tx(PX, 42, '규칙', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    mono(PX + 44, 44, `${n}개`, { 'font-size': 22, 'font-weight': 800, fill: n > 3 ? BAD : INK });
    const dom = k === 0 ? Math.round(lerp(1, 43, E(u, 0.4, 1.6))) : 43;
    tx(PX + 150, 42, '차단 도메인', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(PX + 236, 44, `${dom}개`, { 'font-size': 18, 'font-weight': 800, fill: WARN });
    if (k !== 5) { const ax = axes(PX + 40, 84, 250, 168, { x: [0, 10], y: [0, 100], xt: [1, 3, 6, 9], yt: [0, 50, 100], grid: true, xl: '주차', yl: '정확도 %' });
    const pts = rows.map((r) => [parseInt(r.week, 10), r.acc]), had = prow.length;
    if (k === 6) { line(ax, pts.slice(0, -1), 1, ACC); line(ax, pts.slice(-2), E(u, 0.3, 1.3), BAD, { sw: 3.2 }); } else line(ax, pts, had < pts.length ? lerp((had - 1) / Math.max(1, pts.length - 1), 1, E(u, 0.2, 1.0)) : 1, ACC);
    pts.forEach(([w, a], i) => { const fresh = i >= had && k !== 0, s = fresh ? pop(u, 0.9) : 1, col = a >= 80 ? GOOD : a >= 60 ? WARN : BAD;
      el('circle', { cx: ax.X(w), cy: ax.Y(a), r: 6 * s, fill: col });
      if (s > 0.2) { mono(ax.X(w), ax.Y(a) - 12, `${a}%`, { 'font-size': 13.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
        mono(ax.X(w), ax.Y(a) + 26, `${rows[i].rules}개`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); } }); }
    if (k === 5) { // 규칙 더미: 아무도 못 읽는다
      for (let i = 0; i < 9; i++) { const a = 0.2 + i * 0.12, x = PX + 24 + (i % 3) * 92 + ((i * 37) % 13), y = 110 + Math.floor(i / 3) * 52 + ((i * 23) % 11), id = [5, 7, 9, 12, 15, 18, 22, 25, 27][i];
        card(x + 38, y, 84, 30, { rx: 6, text: `규칙 ${id}`, fs: 13.5, stroke: id === 7 || id === 22 ? BAD : GRID, color: id === 7 || id === 22 ? BAD : INK, s: pop(u, a) }); }
      const p7 = [PX + 24 + 92 + 38 + ((1 * 37) % 13), 110 + ((23) % 11)], p22 = [PX + 24 + 0 * 92 + 38 + ((6 * 37) % 13), 110 + 2 * 52 + ((6 * 23) % 11)];
      grow(p7[0], p7[1] + 15, p22[0], p22[1] - 15, E(u, 1.4, 2.0), BAD);
      tx(PX + PW / 2, 280, '규칙 7 이 규칙 22 를 무력화 (원인 불명)', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 6) banner(PX + PW / 2, 392 - 80, '규칙 3 → 27개 · 정확도 88% → 38%', pop(u, 1.4));
    score(c, PX, k === 6 ? 340 : 314, PW); }

  // =========================================================
  // 3. 발상 전환 — 입력 + 출력 → 규칙(모델)
  // =========================================================
  function slot(cx, cy, w, s, o) { return card(cx, cy, w, 40, Object.assign({ rx: 9, text: s, fs: 14 }, o || {})); }
  function s3(t, c) { const { k, u } = c, fb = c.beat.flowBox, ms = c.beat.mails;
    if (k === 0) { // 위: 전통, 아래: ML. 규칙 카드가 맨 앞에서 맨 뒤로 옮겨 간다
      tx(40, 70, '전통 프로그래밍', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      tx(40, 250, '머신러닝', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      const top = [190, 480, 770], y1 = 120, y2 = 300;
      slot(top[1], y1, 230, fb.traditional[1], { s: pop(u, 0.2) });
      slot(top[2], y1, 230, fb.traditional[2], { s: pop(u, 0.4) });
      grow(top[0] + 120, y1, top[1] - 122, y1, E(u, 0.3, 0.6)); grow(top[1] + 120, y1, top[2] - 122, y1, E(u, 0.4, 0.7));
      // 규칙 카드: 위 왼쪽 → 아래 오른쪽
      const p = E(u, 1.0, 2.2), cx = lerp(top[0], top[2], p), cy = lerp(y1, y2, p);
      slot(top[1] - 290 + 0, y2, 230, fb.ml[0], { s: pop(u, 1.4), stroke: ACC });
      slot(top[1], y2, 230, fb.ml[1], { s: pop(u, 1.6), stroke: ACC });
      grow(top[0] + 120, y2, top[1] - 122, y2, E(u, 1.6, 1.9), ACC); grow(top[1] + 120, y2, top[2] - 122, y2, E(u, 1.9, 2.2), ACC);
      if (p < 1) slot(cx, cy, 230, fb.traditional[0], { stroke: INK, fill: PANEL });
      if (u > 2.0) slot(top[2], y2, 230, fb.ml[2], { s: pop(u, 2.0), stroke: ACC, fill: ACCBG, color: ACC });
      if (p > 0.05) el('rect', { x: top[0] - 115, y: y1 - 20, width: 230, height: 40, rx: 9, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5', 'stroke-width': 2 });
      sub(480, 380, '사람이 하던 일(규칙 작성)이 기계 쪽으로 넘어간다', fade(u, 2.2), { 'font-weight': 700, fill: INK, 'font-size': 15 });
      return; }
    banner(480, 34, '입력 + 출력(라벨) → 규칙(모델)', 1);
    if (k === 1) { // 신고 버튼이 9주 동안 쌓은 라벨: 점 하나 = 100건
      const cols = 20, rws = 6, x0 = 270, y0 = 110, sp = 22, n = Math.round(lerp(0, 120, E(u, 0.3, 2.2)));
      card(120, 190, 150, 56, { rx: 12, text: '🚩 스팸 신고', fs: 15, stroke: BAD, color: BAD, s: pop(u, 0.1) });
      for (let i = 0; i < n; i++) el('circle', { cx: x0 + (i % cols) * sp, cy: y0 + Math.floor(i / cols) * sp, r: 7, fill: ACC, opacity: 0.85 });
      dot([[195, 190], [x0 - 14, 190]], (t * 1.2) % 1, BAD, 6);
      mono(x0, y0 + rws * sp + 30, `${Math.round(n * 100).toLocaleString('en-US')} 건`, { 'font-size': 22, 'font-weight': 800, fill: ACC });
      sub(x0 + 330, y0 + rws * sp + 26, '● 하나 = 메일 100건 (라벨 달림)', fade(u, 0.6), { 'text-anchor': 'start' });
      sub(480, 390, '9주 동안 사용자가 매일 공짜로 정답을 달아 주었다', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 15 });
      return; }
    // k >= 2: CSV → (texts, labels)
    const T0 = 100, cx0 = 30;
    tx(cx0, T0 - 14, 'mail_reports.csv', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono' });
    mono(cx0 + 10, T0 + 12, 'title', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); mono(cx0 + 330, T0 + 12, 'label', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    ms.forEach((m, i) => { const y = T0 + 42 + i * 38, a = k === 2 ? 0.2 + i * 0.12 : -1, op = k === 2 ? fade(u, a) : 1;
      const hl = k === 4 && i < 2;
      if (hl) el('rect', { x: cx0, y: y - 18, width: 400, height: 34, rx: 6, fill: ACCBG, opacity: fade(u, 0.3 + i * 0.6) });
      tx(cx0 + 10, y + 5, m.title, { 'font-size': 15, opacity: op, 'font-weight': 600 });
      mono(cx0 + 330, y + 5, m.label, { 'font-size': 15, 'font-weight': 700, fill: m.label === 'spam' ? WARN : INFO, opacity: op }); });
    mono(cx0 + 10, T0 + 42 + 6 * 38, '… 총 12,000 행', { 'font-size': 13.5, fill: MUT });
    // 오른쪽: 로더와 두 리스트
    const LX = 520;
    card(LX + 200, 76, 380, 38, { rx: 9, text: 'load_labeled_mails(path) → (texts, labels)', mono: true, fs: 13.5, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 1.2) : 1 });
    if (k === 2) { pill(LX + 120, 140, 'spam → 1', WARN, pop(u, 1.8), { mono: true }); pill(LX + 280, 140, 'ham → 0', INFO, pop(u, 2.0), { mono: true }); }
    if (k >= 3 && k < 5) { mono(LX + 10, T0 + 12, 'texts', { 'font-size': 15, 'font-weight': 800 }); mono(LX + 330, T0 + 12, 'labels', { 'font-size': 15, 'font-weight': 800 });
      ms.forEach((m, i) => { const y = T0 + 42 + i * 38, a = 0.2 + i * 0.3, go = k === 3 ? seg(u, a, a + 0.6) : 1;
        if (k === 3 && go > 0 && go < 1) { fly(cx0 + 120, y, LX + 120, y, go, '제목', { fill: INK }); fly(cx0 + 345, y, LX + 345, y, go, m.label === 'spam' ? '1' : '0', { fill: m.label === 'spam' ? WARN : INFO, mono: true }); }
        if (go >= 1) { mono(LX - 6, y + 5, `[${i}]`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
          tx(LX + 10, y + 5, m.title.length > 13 ? m.title.slice(0, 12) + '…' : m.title, { 'font-size': 14 });
          card(LX + 345, y, 34, 28, { rx: 6, text: m.label === 'spam' ? '1' : '0', mono: true, fs: 15, stroke: m.label === 'spam' ? WARN : INFO, color: m.label === 'spam' ? WARN : INFO });
          if (k === 4 && i < 2) grow(LX + 230, y, LX + 324, y, E(u, 0.5 + i * 0.6, 0.9 + i * 0.6), ACC); } });
      if (k === 3) sub(LX + 200, 380, 'i 번째 제목의 정답 = i 번째 라벨 · 길이 12,000 으로 같다', fade(u, 2.2), { 'font-weight': 700, fill: INK });
      if (k === 4) sub(LX + 200, 380, '"광~고" 는 1, "무료 나눔" 은 0 — 규칙이 못 적던 경계가 예시로 들어 있다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 5) { // 재학습 고리
      el('rect', { x: LX - 30, y: 120, width: 440, height: 290, rx: 14, fill: PANEL, opacity: 0.94 * E(u, 0.1, 0.5) });
      const cx = LX + 190, cy = 262, rr = 98, nodes = ['신고 라벨', '학습 fit', '모델', '예측'];
      el('circle', { cx, cy, r: rr, fill: 'none', stroke: GRID, 'stroke-width': 3, opacity: fade(u, 0.3) });
      nodes.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; card(cx + rr * Math.cos(a), cy + rr * Math.sin(a), 96, 32, { rx: 8, text: s, fs: 14, stroke: ACC, s: pop(u, 0.4 + i * 0.2) }); });
      if (u > 1.2) { const a = -Math.PI / 2 + ((t * 1.3) % (2 * Math.PI)); el('circle', { cx: cx + rr * Math.cos(a), cy: cy + rr * Math.sin(a), r: 7, fill: ACC }); }
      tx(cx, cy - 4, '새 우회', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(cx, cy + 18, '→ 재학습', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
  }

  // =========================================================
  // 4. 첫 ML — 나누고, 벡터로 바꾸고, fit, 확률, 임계값
  // =========================================================
  const DX = 46, DY = 110, SP = 15;
  function dataDots(k, u) { // 120 점 (점 하나 = 100건). 아래 2줄 = 시험 20%
    for (let i = 0; i < 120; i++) { const col = i % 12, row = Math.floor(i / 12), test = row >= 8;
      const drop = test ? (k === 1 ? E(u, 0.3, 1.2) : k > 1 ? 1 : 0) * 40 : 0;
      el('circle', { cx: DX + col * SP, cy: DY + row * SP + drop, r: 5.2, fill: test && drop > 0 ? WARN : ACC, opacity: k === 0 ? fade(u, 0.1 + i * 0.008, 0.2) : 0.9 }); }
    if (k >= 1) { const op = k === 1 ? fade(u, 1.0) : 1;
      el('line', { x1: DX - 12, y1: DY + 7.5 * SP + 18, x2: DX + 12 * SP, y2: DY + 7.5 * SP + 18, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: op });
      mono(DX + 12 * SP + 4, DY + 3.5 * SP + 5, '학습 9,600', { 'font-size': 14, 'font-weight': 700, opacity: op });
      mono(DX + 12 * SP + 4, DY + 8.5 * SP + 45, '시험 2,400', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: op }); }
    else mono(DX, DY - 22, '12,000 쌍 · ● = 100건', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) }); }
  const VEC = { x: 470, y: 150 }, MOD = { x: 760, y: 150 };
  function pipeBoxes(k, u) { card(VEC.x, VEC.y, 200, 56, { rx: 10, text: 'CountVectorizer\nchar_wb · 1~3', fs: 14, mono: true, stroke: INFO, s: k === 2 ? pop(u, 0.2) : 1 });
    card(MOD.x, MOD.y, 220, 56, { rx: 10, text: 'LogisticRegression\nmax_iter=1000', fs: 14, mono: true, stroke: ACC, s: k === 2 ? pop(u, 0.4) : 1 });
    grow(VEC.x + 102, VEC.y, MOD.x - 112, VEC.y, k === 2 ? E(u, 0.6, 0.9) : 1, ACC); }
  // 확률 줄 (k >= 5)
  const BX = 300, BW = 230;
  function probRows(c, thr, o) { o = o || {}; const ms = c.beat.mails, u = c.u;
    head([[30, '정답'], [88, '오늘 받은 메일'], [BX, '스팸 확률 p'], [BX + BW + 96, '판정', 'middle']]);
    ms.forEach((m, i) => { const y = ry(i), g = o.grow ? E(u, 0.3 + i * 0.15, 0.9 + i * 0.15) : 1;
      pill(52, y, m.label === 'spam' ? '스팸' : '정상', m.label === 'spam' ? WARN : INFO, 1, { fs: 13.5 });
      tx(88, y + 5, m.title, { 'font-size': 15, 'font-weight': 600 });
      el('rect', { x: BX, y: y - 9, width: BW, height: 18, rx: 4, fill: SOFT });
      const spam = m.prob >= (thr ?? 0.5);
      el('rect', { x: BX, y: y - 9, width: Math.max(2, BW * m.prob * g), height: 18, rx: 4, fill: thr == null ? ACC : spam ? BAD : GOOD, opacity: 0.85 });
      mono(BX + BW + 8, y + 5, m.prob.toFixed(2), { 'font-size': 14, 'font-weight': 700, opacity: g > 0.5 ? 1 : 0 });
      if (thr != null) { const right = (m.label === 'spam') === spam; pill(BX + BW + 96, y, spam ? 'SPAM' : 'ham', right ? GOOD : BAD, o.vs ? o.vs(i, m) : 1, { fs: 13.5, mono: true }); }
      if (o.row) o.row(i, m, y); }); }
  function thrLine(v, op) { const x = BX + BW * v; el('line', { x1: x, y1: ry(0) - 24, x2: x, y2: ry(7) + 22, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: op ?? 1 });
    mono(x, ry(7) + 40, `임계값 ${v.toFixed(1)}`, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: op ?? 1 }); }
  // 혼동 행렬 2×2
  function confusion(x, y, cm, pcm, u, o) { o = o || {}; const cs = 92, v = (key) => Math.round(tween(pcm ? pcm[key] : null, cm[key], u));
    tx(x + cs, y - 34, '판정', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    mono(x + cs / 2, y - 10, 'SPAM', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }); mono(x + cs * 1.5, y - 10, 'ham', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    tx(x - 10, y + cs / 2 + 5, '스팸', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end' }); tx(x - 10, y + cs * 1.5 + 5, '정상', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'end' });
    [['tp', 0, 0, 'TP', GOOD, '막음'], ['fn', 0, 1, 'FN', BAD, '미탐'], ['fp', 1, 0, 'FP', BAD, '오탐'], ['tn', 1, 1, 'TN', GOOD, '통과']].forEach(([key, r, cc, name, col, kr], i) => {
      const s = o.pop ? pop(u, o.pop + i * 0.25) : 1, cx = x + cc * cs + cs / 2, cy = y + r * cs + cs / 2, n = v(key);
      const g = R.G(cx, cy, s * (1 + (o.flash && o.flash.includes(key) ? bump(u, 1.2) * 2 : 0)));
      el('rect', { x: -cs / 2 + 3, y: -cs / 2 + 3, width: cs - 6, height: cs - 6, rx: 8, fill: n > 0 ? (col === GOOD ? C.GOODBG : C.BADBG) : PANEL, stroke: col, 'stroke-width': 2 }, g);
      mono(0, -14, `${name}`, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }, g);
      mono(0, 14, String(n), { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle' }, g);
      tx(0, 34, kr, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g); });
    tx(x - 52, y - 10, '정답', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 4) { dataDots(k, u);
      if (k === 0) { ['CountVectorizer', 'LogisticRegression', 'train_test_split', 'make_pipeline'].forEach((s, i) => pill(640, 110 + i * 50, s, i < 2 ? ACC : INK, pop(u, 0.5 + i * 0.3), { mono: true }));
        mono(640, 330, 'load_labeled_mails("mail_reports.csv")', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
      if (k === 1) { lockTag(DX + 12 * SP + 120, DY + 8.5 * SP + 40, fade(u, 1.2));
        pill(640, 150, 'test_size=0.2', WARN, pop(u, 0.4), { mono: true }); pill(640, 200, 'stratify=labels', INK, pop(u, 0.8), { mono: true });
        sub(640, 232, 'spam/ham 비율을 두 쪽에 똑같이', fade(u, 1.0));
        sub(480, 392, '학습에 한 번도 안 쓴 2,400건 = "본 적 없는 메일"', fade(u, 1.6), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
      pipeBoxes(k, u); lockTag(DX + 12 * SP + 120, DY + 8.5 * SP + 40, 1);
      if (k === 2) { // 제목 → 글자 조각 → 숫자 벡터
        tx(330, 262, '"[광~고] 겨울 세일 연장!"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
        const grams = ['광', '~', '고', '광~', '~고', '광~고'];
        grams.forEach((g, i) => { const p = E(u, 0.9 + i * 0.1, 1.5 + i * 0.1), x = 340 + i * 58, y = lerp(282, 296, p);
          if (p > 0) card(x + 20, y, 50, 28, { rx: 6, text: g, fs: 14, mono: true, stroke: INFO, op: p }); });
        R.cells(330, 322, [1, 1, 1, 1, 1, 1, 0, 0], { w: 30, h: 30, gap: 4, fs: 14, style: (i) => ({ s: pop(u, 1.8 + i * 0.05), stroke: i < 6 ? ACC : GRID }) });
        sub(620, 343, '각 조각의 등장 횟수 = 숫자 벡터', fade(u, 2.0), { 'text-anchor': 'start' });
        grow(VEC.x, VEC.y + 30, VEC.x, 252, E(u, 0.4, 0.8), INFO, { plain: true }); return; }
      if (k === 3) { // fit: 학습 점이 흘러 들어가 가중치가 생긴다
        for (let i = 0; i < 10; i++) dot([[DX + 90, DY + 50], [VEC.x - 100, VEC.y], [VEC.x + 100, VEC.y], [MOD.x - 110, MOD.y]], ((t * 0.5 + i / 10) % 1) * (u < 2.2 ? 1 : 0), ACC, 5);
        const bars = [['광', 0.9], ['무료', 0.55], ['쿠폰', 0.5], ['회의', -0.4], ['정산', -0.5]];
        tx(MOD.x - 100, 216, '학습된 가중치 w (모양만 예시)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8) });
        bars.forEach(([s, w], i) => { const y = 236 + i * 26, L = 70 * Math.abs(w) * E(u, 1.0 + i * 0.15, 1.8 + i * 0.15);
          mono(MOD.x - 70, y + 10, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.0) });
          el('line', { x1: MOD.x - 50, y1: y, x2: MOD.x - 50, y2: y + 20, stroke: GRID });
          el('rect', { x: w > 0 ? MOD.x - 50 : MOD.x - 50 - L, y: y + 2, width: L, height: 16, rx: 3, fill: w > 0 ? BAD : GOOD, opacity: 0.8 }); });
        sub(MOD.x + 70, 290, '빨강 = 스팸 쪽', fade(u, 1.8), { 'text-anchor': 'start', fill: BAD }); sub(MOD.x + 70, 312, '초록 = 정상 쪽', fade(u, 1.8), { 'text-anchor': 'start', fill: GOOD });
        // 손으로 쓴 규칙 27개는 지운다
        card(470, 300, 170, 40, { rx: 9, text: '손으로 쓴 규칙 27개', fs: 14, stroke: GRID, color: MUT, op: fade(u, 0.3) }); if (u > 1.6) cross(470, 300, 18, pop(u, 1.6));
        mono(MOD.x, 96, 'model.fit(X_train, y_train)', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); return; }
      // k === 4: 시험셋 채점
      for (let i = 0; i < 6; i++) dot([[DX + 90, DY + 8.5 * SP + 40], [VEC.x - 100, VEC.y + 10], [MOD.x - 110, MOD.y + 10]], (t * 0.6 + i / 6) % 1 * (u < 2.3 ? 1 : 0), WARN, 5);
      mono(MOD.x, 96, 'model.score(X_test, y_test)', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      const acc = lerp(0, 0.96, E(u, 0.6, 1.8));
      tx(400, 262, '시험 2,400건 정확도', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      R.hbar(400, 274, 360, acc * 100, 100, { h: 22, col: GOOD, text: acc.toFixed(2) });
      tx(400, 330, '규칙 27개 (오늘 8통)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      if (u > 1.6) R.hbar(400, 342, 360, 38, 100, { h: 22, col: BAD, text: '38%', u: E(u, 1.6, 2.2) });
      return; }
    // k >= 5: 확률 · 임계값 · 혼동 행렬
    const b = c.beat, p = c.prev;
    if (k === 5) { probRows(c, null, { grow: true }); mono(BX + BW + 96, 392, 'model.predict_proba(todays)[:, 1]', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(BX + BW + 300, 160, '참/거짓이 아니라', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(BX + BW + 300, 186, '0~1 사이의 정도', fade(u, 2.0), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    if (k === 6) { probRows(c, 0.5, { vs: (i) => pop(u, 0.9 + i * 0.1) }); thrLine(0.5, fade(u, 0.3));
      pill(BX + BW + 300, 160, 'p >= 0.5 → SPAM', INK, pop(u, 0.5), { mono: true }); sub(BX + BW + 300, 196, '임계값은 정책이 정하는 손잡이', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 7 || k === 8) { const thr = k === 8 ? lerp(0.5, 0.4, E(u, 0.3, 1.2)) : 0.5;
      probRows(c, thr, { vs: (i, m) => (k === 8 && m.id === 'p-08' ? 1 + bump(u, 1.2) * 3 : 1) }); thrLine(thr, 1);
      confusion(744, 150, b.cm, k === 8 ? p.cm : null, k === 8 ? Math.max(0, u - 1.0) : u, { pop: k === 7 ? 0.3 : null, flash: k === 8 ? ['tp', 'fn'] : null });
      if (k === 7) sub(790, 392, '정확도 7/8 = 두 칸(TP·TN)의 합', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      if (k === 8) sub(790, 392, '내리면 미탐↓ 오탐↑ — 이번 8통은 오탐 0 유지', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      return; }
    // k === 9: 변형이 왜 잡히나 — "광" 조각 공유
    probRows(c, 0.5, { row: (i, m, y) => { if (m.title.includes('광')) mark(i, m.title, '광', ACC, fade(u, 0.4 + i * 0.3)); if (m.id === 'p-08') el('rect', { x: 18, y: y - 17, width: 690, height: 34, rx: 7, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.6) }); } });
    thrLine(0.5, 1);
    card(830, 130, 170, 48, { rx: 10, text: 'char n-gram "광"\n가중치 ↑', fs: 14, stroke: ACC, color: ACC, s: pop(u, 0.9) });
    grow(744, 130, 300, ry(1) - 6, E(u, 1.1, 1.6), ACC, { dash: '5 4' });
    pill(830, ry(7), '0.42 → 재학습', BAD, pop(u, 1.8), { fs: 13.5 }); }
  function lockTag(cx, cy, op) { if (op <= 0) return; R.lock(cx, cy, true, WARN, op); }

  // =========================================================
  // 5. 하이브리드 — 1층 규칙, 2층 모델, 그리고 선택 기준
  // =========================================================
  const L1 = 430, L2 = 610, OUT = 820;
  function s5(t, c) { const { k, u } = c, ms = c.beat.mails;
    if (k <= 4) {
      const hy = 52;
      [[L1, '1층 규칙', 'domain · 첨부 > 25MB', WARN], [L2, '2층 모델', 'spam_model · θ 0.5', ACC], [OUT, '판정', '{is_spam, by, prob}', INK]].forEach(([x, n, s, col], i) => {
        const show = i < 2 ? (k === 0 ? pop(u, 0.2 + i * 0.3) : 1) : k >= 2 ? (k === 2 ? pop(u, 0.2) : 1) : 0; if (show <= 0) return;
        const g = R.G(x, hy, show);
        el('rect', { x: -88, y: -26, width: 176, height: 52, rx: 10, fill: i === 1 ? ACCBG : i === 0 ? C.WARNBG : PANEL, stroke: col, 'stroke-width': 2.2 }, g);
        tx(0, i === 2 ? 5 : -4, i === 2 ? s : n, { 'font-size': i === 2 ? 13.5 : 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', class: i === 2 ? 'mono' : null }, g);
        if (i < 2) mono(0, 16, s, { 'font-size': 13.5, fill: INK, 'text-anchor': 'middle', opacity: k === 0 ? 0 : k === 1 ? fade(u, 0.6 + i * 0.5) : 1 }, g); });
      // 세로 칸
      [L1, L2].forEach((x) => el('line', { x1: x, y1: 82, x2: x, y2: 390, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 6' }));
      ms.forEach((m, i) => { const y = 112 + i * 46, op = k === 0 ? fade(u, 0.6 + i * 0.1) : 1;
        pill(44, y, m.label === 'spam' ? '스팸' : '정상', m.label === 'spam' ? WARN : INFO, 1, { fs: 13.5, op });
        tx(80, y + 5, m.title, { 'font-size': 14.5, 'font-weight': 600, opacity: op });
        const byRule = m.by === '규칙', byModel = m.by === '모델';
        // 1층
        if (k >= 3 && byRule) { const a = k === 3 ? 0.3 + i * 0.5 : -1; dot([[320, y], [L1, y]], k === 3 ? seg(u, a, a + 0.5) : 0, WARN, 6);
          pill(L1, y, '차단', WARN, k === 3 ? pop(u, a + 0.5) : 1, { fs: 13.5 }); }
        if (k >= 4 && byModel) { const a = 0.2 + (i - 2) * 0.35;
          grow(L1 - 30, y, L2 - 70, y, k === 4 ? E(u, a, a + 0.3) : 1, GRID, { plain: true });
          const pr = m.prob * (k === 4 ? E(u, a + 0.3, a + 0.9) : 1), spam = m.prob >= 0.5;
          el('rect', { x: L2 - 60, y: y - 8, width: 120, height: 16, rx: 4, fill: SOFT });
          el('rect', { x: L2 - 60, y: y - 8, width: Math.max(2, 120 * pr), height: 16, rx: 4, fill: spam ? BAD : GOOD, opacity: 0.85 });
          el('line', { x1: L2, y1: y - 12, x2: L2, y2: y + 12, stroke: INK, 'stroke-width': 1.5 });
          mono(L2 + 66, y + 5, m.prob.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, opacity: k === 4 ? fade(u, a + 0.8) : 1 }); }
        // 판정 칸
        const done = (byRule && k >= 3 && (k > 3 || u > 0.8 + i * 0.5)) || (byModel && k >= 4 && (k > 4 || u > 1.2 + (i - 2) * 0.35));
        if (done) { const spam = m.verdict === 'caught' || (m.label === 'spam' && m.verdict !== 'missed'); const res = m.label === 'spam' ? 'True' : 'False';
          mono(OUT, y + 5, `${res} · ${byRule ? 'rule' : 'model'}`, { 'font-size': 14, 'font-weight': 700, fill: m.label === 'spam' ? BAD : GOOD, 'text-anchor': 'middle' }); }
        else if (k < 3) mono(OUT, y + 5, k >= 2 ? '?' : '', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); });
      if (k === 1) sub(L1, 400, '차단 목록 43개 → 1개', fade(u, 1.6), { 'font-weight': 700, fill: WARN });
      if (k === 2) sub(OUT, 400, 'by 를 남기면 규칙 탓·모델 탓이 바로 갈린다', fade(u, 1.0), { 'font-weight': 700, fill: INK });
      if (k === 3) sub(L1, 400, '모델에 묻지 않고 즉시 차단', fade(u, 1.8), { 'font-weight': 700, fill: WARN });
      if (k === 4) sub(L2 + 60, 400, '나머지 4통은 확률로 · 6/6 정확, 오탐 0', fade(u, 2.0), { 'font-weight': 700, fill: GOOD });
      return; }
    // k >= 5: 선택 기준표
    const rows = c.beat.compareBox.rows, had = c.prev && c.prev.compareBox ? c.prev.compareBox.rows.length : 0;
    const y0 = 52, rh = 46, cR = 640, cM = 830;
    tx(30, y0, '상황', { 'font-size': 14, 'font-weight': 700, fill: MUT }); lbl(cR, y0, '규칙', 1, { fill: WARN }); lbl(cM, y0, 'ML', 1, { fill: ACC });
    el('line', { x1: 24, y1: y0 + 12, x2: 936, y2: y0 + 12, stroke: GRID, 'stroke-width': 2 });
    const col = (s) => (s.startsWith('◎') ? GOOD : s.startsWith('✗') ? BAD : MUT);
    rows.forEach((r, i) => { const y = y0 + 40 + i * rh, fresh = i >= had, a = fresh ? 0.2 + (i - had) * 0.6 : -1, op = fresh ? fade(u, a) : 1, dx = fresh ? -24 * (1 - E(u, a, a + 0.4)) : 0;
      tx(30 + dx, y + 5, r.crit, { 'font-size': 15, 'font-weight': 600, opacity: op });
      pill(cR, y, r.rule, col(r.rule), fresh ? pop(u, a + 0.25) : 1, { fs: 14 });
      pill(cM, y, r.ml, col(r.ml), fresh ? pop(u, a + 0.4) : 1, { fs: 14 });
      el('line', { x1: 24, y1: y + rh / 2, x2: 936, y2: y + rh / 2, stroke: GRID, 'stroke-width': 1, opacity: op }); });
    if (k === 7) banner(480, 388, '정답 조건을 종이에 다 적을 수 있나? → 예: 규칙 · 아니오(+라벨): ML', pop(u, 1.6)); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'v1 규칙 3개가 "초특가 건강식품" 메일을 놓친 이유는 무엇인가?',
      o: ['세 규칙 어디에도 없는 표현이라 그대로 통과해서', '발신 도메인이 차단 목록에 있어서', '본문이 이미지 한 장이라서'], a: 0,
      why: '세 규칙 중 어느 것에도 걸리지 않으면 False 다. 규칙에 없는 표현은 모두 통과하므로 8통 중 7통만 맞혔다.' },
    { q: '9주 동안 규칙을 3개에서 27개로 늘린 뒤 정확도는 어떻게 되었나?',
      o: ['88%에서 96%로 올랐다', '88%에서 38%로 떨어졌다', '거의 그대로였다'], a: 1,
      why: '"무료" hotfix 처럼 새 규칙이 기존 규칙과 충돌해 정상 메일까지 막기(오탐) 시작했다. 패턴은 무한한데 규칙은 유한하다.' },
    { q: '머신러닝에서 프로그래밍의 방향은 어떻게 바뀌나?',
      o: ['규칙 + 입력 → 출력', '규칙 + 출력 → 입력', '입력 + 출력(라벨) → 규칙(모델)'], a: 2,
      why: '사람이 규칙을 적는 대신 (메일, 정답 라벨) 쌍 12,000건을 주고 기계가 규칙(모델)을 유도하게 한다.' },
    { q: '학습 전에 데이터의 20%(2,400건)를 따로 떼어 두는 이유는 무엇인가?',
      o: ['본 적 없는 메일로 채점해야 거짓 성적표를 피할 수 있어서', '학습 시간을 줄이려고', '그 메일들에는 라벨이 없어서'], a: 0,
      why: '학습에 쓴 데이터로 채점하면 무조건 잘 나온다. 학습에 한 번도 쓰지 않은 2,400건으로 매긴 점수가 0.96 이다.' },
    { q: '하이브리드 필터에서 "첨부 파일 용량 초과" 판단은 누가 맡나?',
      o: ['2층 모델 — 스팸 확률로 판단한다', '사용자 신고를 기다린다', '1층 정책 규칙 — 즉시 차단하고 근거를 남긴다'], a: 2,
      why: '정답 조건을 종이에 다 적을 수 있고 감사에 답해야 하는 판단은 규칙이 맡는다. 모델은 1층에서 걸러지지 않은 애매한 나머지를 확률로 판단한다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '규칙 3개짜리 스팸 필터는 처음엔 잘 듣지만, 규칙에 없는 표현은 그대로 통과한다.',
    '스패머가 우회할 때마다 규칙을 덧붙여 27개가 됐고, 규칙끼리 부딪혀 정확도가 38%로 떨어졌다.',
    '메일과 정답 라벨 12,000건을 주자 모델이 규칙을 스스로 찾았고, 떼어 둔 시험셋에서 96%를 맞혔다.',
    '정답 조건을 다 적을 수 있는 정책은 규칙에 두고, 애매한 나머지는 모델이 확률로 판단한다.',
  ];
  const review = [
    { q: '새 스팸 표현 럭키박스가 퍼져 모델이 놓치고 있다. 가장 알맞은 대응은?',
      o: ['럭키박스를 막는 if 규칙을 하나 더 붙인다', '신고된 메일을 라벨로 모아 모델을 다시 학습한다', '임계값을 0으로 내려 모든 메일을 막는다'], a: 1,
      why: '규칙을 덧붙일수록 충돌이 늘어 정확도가 떨어졌다. 새 데이터로 재학습하자 럭키박스가 0.87로 잡혔고 규칙은 한 줄도 고치지 않았다.' },
    { q: '모델을 붙인 뒤 정상 메일이 스팸함으로 간다는 항의가 늘었다. 먼저 손볼 것은?',
      o: ['판정 임계값을 0.7 쪽으로 올린다', '판정 임계값을 0.3 쪽으로 내린다', '차단 도메인을 다시 43개로 늘린다'], a: 0,
      why: '오탐이 무서우면 임계값을 올리고 미탐이 무서우면 내린다. 임계값은 학습이 정해 주지 않고, 오류 비용을 보고 사람이 고르는 값이다.' },
    { q: '규칙 필터를 ML로 바꾸려 한다. 반드시 먼저 갖춰야 할 것은?',
      o: ['더 촘촘한 정규식 전처리', '이미지 비율 같은 새 판단 기준값', '스팸인지 정상인지 표시된 과거 메일'], a: 2,
      why: 'ML은 입력과 정답 라벨을 주고 규칙을 기계가 찾게 한다. 이 팀은 사용자 신고 버튼 덕분에 라벨이 이미 매일 쌓이고 있었다.' },
  ];

  RA.page({ title: '스팸 필터 — 규칙에서 학습으로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
