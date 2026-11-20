/* V-1-1 피처 엔지니어링과 데이터 누수 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const TW = (a, b, u, s = 0.1, d = 1.2) => (a == null ? b : lerp(a, b, E(u, s, s + d)));
  const KIND = { raw: [INK, SOFT], derived: [ACC, ACCBG], leak: [BAD, BADBG], target: [WARN, WARNBG] };

  // 피처 표: beat.table 그대로. 앞 beat 에 없던 열은 위에서 아래로 채워진다
  function table(x, y, tb, prevTb, u, o) { o = o || {}; const W = o.w || {}, rh = o.rh || 32, hh = 30;
    const had = new Set(prevTb ? prevTb.cols.map((c) => c.key) : []); let cx = x;
    tb.cols.forEach((col) => { const w = W[col.key] || Math.max(tw(col.label, 13.5) + 20, 70), [fg, bg] = KIND[col.kind] || KIND.raw, fresh = !had.has(col.key) && prevTb;
      const p = fresh ? E(u, o.at ?? 0.3, (o.at ?? 0.3) + 0.9) : 1, hot = o.hot && o.hot(col.key);
      if (p <= 0) { cx += w + 4; return; }
      el('rect', { x: cx, y, width: w, height: hh, rx: 5, fill: bg, stroke: hot ? fg : 'none', 'stroke-width': 2.5, opacity: p });
      mono(cx + w / 2, y + 20, col.label, { 'font-size': 13.5, 'font-weight': 700, fill: fg, 'text-anchor': 'middle', opacity: p });
      tb.rows.forEach((r, i) => { const yy = y + hh + 4 + i * rh, cp = fresh ? E(u, (o.at ?? 0.3) + 0.4 + i * 0.25, (o.at ?? 0.3) + 0.7 + i * 0.25) : 1, cell = o.cell && o.cell(col.key, i);
        el('rect', { x: cx, y: yy, width: w, height: rh - 3, rx: 4, fill: cell && cell.fill ? cell.fill : PANEL, stroke: hot ? fg : GRID, 'stroke-width': hot ? 1.8 : 1, opacity: Math.max(cp, 0.001) });
        mono(cx + w / 2, yy + rh / 2 + 4, cell && cell.text != null ? cell.text : r[col.key], { 'font-size': 14, 'text-anchor': 'middle', fill: cell && cell.col ? cell.col : col.kind === 'raw' ? INK : fg, 'font-weight': col.kind === 'raw' ? 400 : 700, opacity: cp }); });
      cx += w + 4; });
    return cx; }
  // AUC 막대: rows [{name, auc, tone, note}] 앞 beat 에서 이어지게. 0.5 = 동전 던지기 선
  function aucBars(x, y, w, m, pm, u, o) { o = o || {}; const lw = o.lw || 250, bw = w - lw - 70, rh = o.rh || 34;
    if (o.title !== false) tx(x, y - 10, o.title || 'AUC', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    const X = (v) => x + lw + bw * v;
    m.rows.forEach((r, i) => { const pr = pm && pm.rows.find((q) => q.name === r.name), v = pr ? TW(pr.auc, r.auc, u, 0.3, 1.2) : r.auc * E(u, 0.3 + (o.stagger ? i * 0.3 : 0), 1.2 + (o.stagger ? i * 0.3 : 0));
      const yy = y + i * rh, col = r.tone === 'good' ? GOOD : r.tone === 'fake' ? WARN : BAD, fresh = !pr && pm;
      const op = fresh || !pm ? fade(u, 0.2 + (o.stagger ? i * 0.3 : 0)) : 1;
      tx(x, yy + 18, r.name, { 'font-size': 14, 'font-weight': 600, opacity: op });
      el('rect', { x: X(0), y: yy + 4, width: bw, height: 20, rx: 4, fill: SOFT, opacity: op });
      el('rect', { x: X(0), y: yy + 4, width: Math.max(0, bw * v), height: 20, rx: 4, fill: col, opacity: (r.tone === 'fake' ? 0.55 : 0.85) * op, stroke: r.tone === 'fake' ? WARN : 'none', 'stroke-dasharray': r.tone === 'fake' ? '5 4' : null, 'stroke-width': 2 });
      mono(X(0) + bw * v + 8, yy + 19, v.toFixed(2), { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); });
    const n = m.rows.length; el('line', { x1: X(0.5), y1: y, x2: X(0.5), y2: y + n * rh, stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    if (o.coin !== false) mono(X(0.5), o.coinTop ? y - 10 : y + n * rh + 15, '0.5 = 동전', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    return X; }

  // =========================================================
  // 1. 피처가 왕 — timestamp 하나를 쪼갠다
  // =========================================================
  const W1 = { uid: 80, ts: 120, days: 160, wknd: 160, hour: 160, bill: 140 };
  const DATES = ['2025-06-29 (일) 02시', '2025-12-17 (수) 14시', '2026-05-23 (토) 03시'];
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    const newKey = { 2: 'days', 3: 'wknd', 4: 'hour', 5: 'bill' }[k];
    table(30, 24, b.table, p ? p.table : null, u, { w: W1, hot: (key) => key === newKey || (k === 0 && key === 'ts') });
    // 표 아래 설명 줄 (y 160~236)
    if (k === 0) { mono(165, 182, '1751162400', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(290, 182, '→ 주말?  시간대?  결제일?', { 'font-size': 17, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      sub(165, 210, '모델에게는 그냥 큰 정수', fade(u, 1.6), { 'font-size': 15 }); }
    if (k === 1) { DATES.forEach((d, i) => fly(300, 72 + i * 32, 600, 72 + i * 32, seg(u, 0.3 + i * 0.2, 0.9 + i * 0.2), d, { stay: true, fill: INFO }));
      pill(600, 186, 'NOW = 2026-08-06', ACC, pop(u, 1.5), { mono: true, fs: 15 }); sub(600, 222, 'to_datetime(unit="s") — 정수가 날짜가 된다', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 2) { pill(260, 190, 'NOW − signup_ts', ACC, pop(u, 0.2), { mono: true, fs: 15 }); sub(260, 222, '"오래된 유저는 이탈 패턴이 다르다"', fade(u, 1.4), { 'font-size': 14.5 }); }
    if (k === 3) { pill(420, 190, 'dayofweek >= 5 → 1', ACC, pop(u, 0.2), { mono: true, fs: 15 }); sub(420, 222, '"주말 충동 가입은 해지율이 높다"', fade(u, 1.4), { 'font-size': 14.5 }); }
    if (k === 4) { const x0 = 380, ww = 360, bands = [['night', 0, 6], ['morning', 6, 12], ['day', 12, 18], ['evening', 18, 24]];
      bands.forEach(([nm, a, z], i) => { const op = fade(u, 0.2 + i * 0.2), xa = x0 + ww * a / 24, xz = x0 + ww * z / 24;
        el('rect', { x: xa, y: 172, width: xz - xa - 2, height: 26, rx: 4, fill: [INFOBG, WARNBG, GOODBG, ACCBG][i], stroke: [INFO, WARN, GOOD, ACC][i], opacity: op });
        mono((xa + xz) / 2, 190, nm, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: [INFO, WARN, GOOD, ACC][i], opacity: op });
        mono(xa, 216, String(a), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); });
      mono(x0 + ww, 216, '24', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      sub(x0 - 90, 190, 'pd.cut(hour)', fade(u, 0.2), { 'font-size': 14.5, fill: INK }); }
    if (k === 5) { pill(760, 190, 'next_billing_date − NOW', ACC, pop(u, 0.2), { mono: true, fs: 14.5 }); sub(760, 222, '"해지는 결제일 직전에 몰린다" · clip(lower=0)', fade(u, 1.4), { 'font-size': 14.5 }); }
    if (k === 6) { banner(480, 196, '같은 로지스틱 회귀 · 입력만 바꿨다', pop(u, 0.2)); }
    const X = aucBars(30, 268, 930, b.metric, p ? p.metric : null, u, { lw: 290, title: '검증 AUC — 같은 데이터 · 다른 피처' });
    if (k === 6) { const n = b.metric.rows; mono(900, 268 + 2 * 34 + 19, '+0.17', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      mono(900, 268 + 34 + 19, '+0.02', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }
  }

  // =========================================================
  // 2. 기법 카탈로그 — 언제 무엇을 쓰나
  // =========================================================
  const W2 = { uid: 80, plan: 120, pay: 120, city: 150, visits: 110, gap: 130 };
  function hist(x, y, w, h, hs, col, p, lab) { const n = hs.length, bw = w / n, mx = Math.max(...hs);
    hs.forEach((v, i) => { const hh = (h * v / mx) * clamp(p * n - i); el('rect', { x: x + i * bw + 1, y: y + h - hh, width: bw - 2, height: hh, fill: col, opacity: 0.8 }); });
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.5 }); if (lab) sub(x + w / 2, y + h + 20, lab, 1, { 'font-size': 14 }); }
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    const newKey = { 1: 'pay', 3: 'plan', 5: 'city', 7: 'visits', 8: 'visits' }[k];
    tx(30, 288, b.table.caption, { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    table(30, 298, b.table, p ? p.table : null, u, { w: W2, rh: 28, at: 1.0, hot: (key) => key === newKey || (k === 7 && key === 'gap'),
      cell: k === 8 ? (key, i) => (key === 'visits' && i === 2 ? { fill: 'var(--hl)' } : null) : null });
    // 위쪽: 이 beat 의 기법
    if (k === 0) { [['수치', '스케일 · 로그 · 구간'], ['범주', '원핫 · 타깃 인코딩'], ['시간', '요일 · 시간대 · 경과일'], ['집계', '로그 → 유저 1행']].forEach(([a, s], i) => {
        card(130 + i * 230, 90, 200, 76, { text: a + '\n' + s, fs: 15, stroke: i === 3 ? WARN : ACC, fill: PANEL, s: pop(u, 0.2 + i * 0.3) }); });
      pill(480, 180, '기준: "언제" 쓰나', INK, pop(u, 1.6), { fs: 15 });
      sub(480, 226, '스케일링은 거리·경사 모델(KNN·SVM·로지스틱·NN)용 — 트리엔 불필요', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 1) { const sk = [9, 6, 4, 3, 2, 1.5, 1, 0.8, 0.6, 0.5, 0.4, 0.3, 0.3, 0.2], lg = [1, 2, 3.5, 5, 6, 6.5, 6, 5, 3.5, 2.2, 1.2, 0.6];
      hist(60, 60, 300, 150, sk, WARN, E(u, 0.2, 1.0), 'monthly_payment — 꼬리가 길다');
      grow(390, 140, 520, 140, E(u, 1.0, 1.4), ACC); mono(455, 126, 'log1p', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      hist(560, 60, 300, 150, lg, ACC, E(u, 1.4, 2.2), 'log_payment — 완만해졌다');
      sub(480, 262, '0 이하 값 때문에 log 가 아니라 log1p', fade(u, 2.2), { 'font-size': 14.5 }); }
    if (k === 2) { const x0 = 90, ww = 780, A = (v) => x0 + ww * v / 120, bands = [['young', 0, 25], ['mid', 25, 40], ['senior', 40, 60], ['elder', 60, 120]];
      tx(x0, 60, 'age  →  age_band', { 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.1) });
      bands.forEach(([nm, a, z], i) => { const op = fade(u, 0.3 + i * 0.35); el('rect', { x: A(a), y: 100, width: A(z) - A(a) - 3, height: 50, rx: 6, fill: [INFOBG, GOODBG, WARNBG, ACCBG][i], stroke: [INFO, GOOD, WARN, ACC][i], 'stroke-width': 2, opacity: op });
        mono((A(a) + A(z)) / 2, 131, nm, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: [INFO, GOOD, WARN, ACC][i], opacity: op }); });
      [0, 25, 40, 60, 120].forEach((v, i) => mono(A(v), 176, String(v), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }));
      sub(480, 226, '선형 모델도 나이의 비선형 효과를 잡는다 · 경계는 도메인이 정한다', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 3) { tx(80, 70, 'plan (요금제 3종)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      ['요금제 B', '요금제 A', '요금제 C'].forEach((s, i) => { card(150, 108 + i * 40, 120, 32, { text: s, fs: 14, stroke: GRID, op: fade(u, 0.2 + i * 0.1) });
        grow(222, 108 + i * 40, 330, 108 + i * 40, E(u, 0.8 + i * 0.2, 1.1 + i * 0.2), ACC);
        R.cells(350, 92 + i * 40, b.table.rows[i].plan.replace(/[\[\]]/g, '').split(','), { w: 40, h: 32, fs: 15, style: (j, v) => (v === '1' ? { fill: ACCBG, stroke: ACC, color: ACC, op: fade(u, 1.0 + i * 0.2) } : { op: fade(u, 1.0 + i * 0.2), color: MUT }) }); });
      ['plan_A', 'plan_B', 'plan_C'].forEach((s, j) => mono(370 + j * 46, 84, s.slice(5), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) }));
      pill(700, 120, '카디널리티 낮을 때의 기본기', ACC, pop(u, 1.8), { fs: 14.5 }); sub(700, 166, '수천 개면 컬럼 폭발', fade(u, 2.2), { fill: BAD, 'font-size': 15 }); }
    if (k === 4 || k === 5) { // 도시별 평균 해지율 — train 통계만
      const ax = { x: 80, w: 500, y: 60, h: 170 }, Y = (v) => ax.y + ax.h - v * ax.h / 0.5, G = 0.2;
      el('line', { x1: ax.x, y1: ax.y + ax.h, x2: ax.x + ax.w, y2: ax.y + ax.h, stroke: MUT, 'stroke-width': 1.5 }); el('line', { x1: ax.x, y1: ax.y, x2: ax.x, y2: ax.y + ax.h, stroke: MUT, 'stroke-width': 1.5 });
      tx(ax.x, ax.y - 10, '도시별 평균 해지율 (churned 의 평균)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const cities = [[0.31, 9], [0.12, 6], [0.28, 8], [0.45, 2], [0.18, 7], [0.05, 1.5], [0.24, 5]];
      el('line', { x1: ax.x, y1: Y(G), x2: ax.x + ax.w, y2: Y(G), stroke: INK, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: k === 5 ? 1 : fade(u, 1.6) });
      mono(ax.x + ax.w + 6, Y(G) + 5, 'GLOBAL', { 'font-size': 13.5, 'font-weight': 700, opacity: k === 5 ? 1 : fade(u, 1.6) });
      cities.forEach(([m, n], i) => { const cx = ax.x + 40 + i * 66, small = n < 3, pull = k === 5 && small ? E(u, 0.6, 1.8) : 0, v = lerp(m, G + (m - G) * n / (n + 20 / 6), pull);
        el('circle', { cx, cy: Y(v), r: 4 + n * 1.3, fill: small && k === 5 ? WARN : INFO, opacity: fade(u, 0.3 + i * 0.12) * 0.85 });
        if (pull > 0.05) grow(cx, Y(m), cx, Y(v) + (v > m ? -8 : 8), 1, WARN); });
      if (k === 4) { pill(780, 80, '⚠ 정답 y 를 재료로 쓴다', BAD, pop(u, 1.2), { fs: 14.5 }); pill(780, 130, 'train 통계만 사용', GOOD, pop(u, 1.7), { fs: 14.5 });
        sub(780, 176, '도시 500개 → 컬럼 1개', fade(u, 2.1), { 'font-size': 15, fill: INK }); }
      else { mono(770, 84, '(mean·count + GLOBAL·K)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        mono(770, 108, '/ (count + K)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.2) }); pill(770, 146, 'K = 20', WARN, pop(u, 0.5), { mono: true, fs: 15 });
        sub(770, 190, '표본 적은 도시 → 전체 평균 쪽으로', fade(u, 1.8), { 'font-size': 14.5, fill: WARN }); sub(770, 216, '미등장 도시 → GLOBAL', fade(u, 2.2), { 'font-size': 14.5 }); } }
    if (k === 6 || k === 7) { const x0 = 70, x1 = 700, Tx = (d) => lerp(x0, x1, d / 60), lanes = [['u-101', [5, 17, 34, 40, 48, 57]], ['u-102', [31, 33, 35, 36, 38, 40, 41, 43, 44, 46, 47, 49, 51, 52, 54, 55, 56, 58, 59]], ['u-103', [3, 12, 22]]];
      const win = k === 6 ? E(u, 0.8, 1.6) : 1;
      tx(x0, 46, 'visit_logs.csv', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      el('rect', { x: Tx(30), y: 56, width: (Tx(60) - Tx(30)) * win, height: 150, rx: 6, fill: ACCBG, opacity: 0.7 });
      lanes.forEach(([id, ds], i) => { const y = 84 + i * 46; mono(x0 - 8, y + 5, id, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 1.5 });
        const keep = ds.filter((d) => d >= 30);
        if (k === 6) ds.forEach((d) => el('line', { x1: Tx(d), y1: y - 11, x2: Tx(d), y2: y + 11, stroke: d >= 30 ? ACC : OFF, 'stroke-width': 3, opacity: d >= 30 || u < 1.6 ? 1 : 1 - 0.6 * E(u, 1.6, 2.2) }));
        else { const col = E(u, 0.3, 1.4); keep.forEach((d, j) => { const xx = lerp(Tx(d), 770, col); el('line', { x1: xx, y1: y - 11, x2: xx, y2: y + 11, stroke: ACC, 'stroke-width': 3, opacity: 1 - 0.8 * col }); });
          const r = b.table.rows[i]; card(810, y, 80, 30, { text: r.visits, fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4) }); card(900, y, 74, 30, { text: r.gap, fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.7) }); } });
      mono(Tx(30), 228, 'NOW − 30일', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) }); mono(Tx(60), 228, 'NOW', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
      if (k === 7) { mono(810, 56, 'visits', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); mono(900, 56, 'gap(일)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) });
        sub(560, 258, 'groupby(user_id) — 로그 여러 행이 유저 1행으로', fade(u, 2.0), { 'font-size': 14.5 }); }
      else sub(560, 258, '기준 시점 = NOW — 이 선택이 다음 사고로 이어진다', fade(u, 2.0), { 'font-size': 14.5, fill: WARN }); }
    if (k === 8) { mono(250, 90, 'users  ⟕  agg   on user_id', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(250, 126, 'how="left" — 유저는 하나도 빠지지 않는다', fade(u, 0.6), { 'font-size': 14.5 });
      pill(250, 180, '접속 없는 u-103 → visits_30d 0', ACC, pop(u, 1.2), { fs: 14.5 });
      card(700, 130, 330, 90, { text: '집계의 기준 시점 = NOW ?\n→ 다음 단계의 지뢰', fs: 16, stroke: WARN, fill: WARNBG, color: WARN, s: pop(u, 1.8) }); }
  }

  // =========================================================
  // 3. 미래 정보 누수 — 차단선 CUTOFF
  // =========================================================
  const TL = { y: 120, x0: 40, x1: 920, cut: 470 };
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev, tl = b.timeline, ptl = p ? p.timeline : null;
    // 타임라인
    el('line', { x1: TL.x0, y1: TL.y, x2: TL.x1, y2: TL.y, stroke: MUT, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' });
    mono(TL.x0, TL.y + 24, '7월', { 'font-size': 14, fill: MUT }); mono(TL.x1 - 40, TL.y + 24, '8월', { 'font-size': 14, fill: MUT });
    const cutP = k === 0 ? 0 : k === 1 ? E(u, 0.2, 0.9) : 1;
    if (cutP > 0) { el('line', { x1: TL.cut, y1: lerp(TL.y, 20, cutP), x2: TL.cut, y2: lerp(TL.y, 236, cutP), stroke: BAD, 'stroke-width': 3.5 });
      pill(TL.cut, 20 + 0 * cutP, 'CUTOFF 8/1 00:00', BAD, pop(u + (k > 1 ? 9 : 0), 0.6), { mono: true, fs: 13.5, fill: PANEL }); }
    tl.left.items.forEach((s, i) => { const had = ptl && ptl.left.items.includes(s), op = had ? 1 : fade(u, 0.5 + i * 0.1);
      pill(TL.cut - 18 - (tw(s, 13.5) + 26) / 2, 58 + i * 34 + (i > 0 ? 0 : 0), s, GOOD, op, { fs: 13.5 }); });
    tl.right.items.forEach((s, i) => { const had = ptl && ptl.right.items.includes(s), op = had ? 1 : fade(u, 0.4 + i * 0.4), w = tw(s, 13.5) + 26, cx = TL.cut + 18 + w / 2, y = 152 + i * 34 - (i === 2 ? 102 : 0) + (i === 2 ? -0 : 0);
      const yy = i < 2 ? 160 + i * 34 : 58; pill(cx, yy, s, BAD, op, { fs: 13.5, fill: BADBG }); if (k >= 2) cross(cx + w / 2 + 14, yy, 8, had ? 1 : pop(u, 1.2 + i * 0.3)); });
    if (k === 0) { mono(700, 70, 'AUC 0.99 ?', { 'font-size': 30, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(700, 104, '"있다" ≠ 예측 시점에 "쓸 수 있다"', fade(u, 1.2), { 'font-size': 15, fill: INK }); }
    if (k === 3) { const n = tl.left.items.length; tx(40, 214, 'CLEAN 5컬럼 (+ is_weekend_signup · city_target_enc)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) }); }
    // 아래 왼쪽: 누수 컬럼과 정답
    const showTbl = k >= 2, tb = b.table;
    if (showTbl) { const cols = ['uid', 'usage', 'ticket', 'y'], lab = { uid: 'user_id', usage: 'usage_this_month', ticket: 'cancel_ticket', y: 'churned' }, wd = { uid: 70, usage: 150, ticket: 120, y: 80 };
      let x = 30; cols.forEach((key) => { const col = tb.cols.find((q) => q.key === key) || { kind: key === 'y' ? 'target' : 'leak' }, [fg, bg] = KIND[col.kind], show = key !== 'y' || tb.cols.some((q) => q.key === 'y'), op = show ? (k === 2 || (key === 'y' && k === 4) ? fade(u, 0.6) : 1) : 0;
        if (op > 0) { el('rect', { x, y: 262, width: wd[key], height: 28, rx: 5, fill: bg, opacity: op }); mono(x + wd[key] / 2, 281, lab[key], { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: fg, opacity: op });
          tb.rows.forEach((r, i) => mono(x + wd[key] / 2, 316 + i * 30, r[key], { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: key === 'uid' ? MUT : fg, opacity: op })); }
        x += wd[key] + 4; });
      if (k >= 4) { [0, 2].forEach((i) => el('rect', { x: 102, y: 300 + i * 30, width: 360, height: 24, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: k === 4 ? fade(u, 1.0) : 1 }));
        if (k === 4) sub(250, 404, '해지 → 사용량 0: 피처가 정답을 복사', fade(u, 1.6), { fill: BAD, 'font-size': 14.5 }); } }
    // 아래 오른쪽: AUC
    if (k === 4) { card(720, 330, 300, 70, { text: 'eval_auc(feature_cols)\n모델·분할 고정, 피처만 바꾼다', fs: 14.5, stroke: INK, s: pop(u, 0.2) });
      fly(720, 250, 720, 300, seg(u, 0.8, 1.4), 'CLEAN + LEAKY', { fill: BAD }); fly(720, 250, 720, 300, seg(u, 1.6, 2.2), 'CLEAN', { fill: GOOD }); }
    else if (k >= 5 || k === 0 || k === 1 || k === 2 || k === 3) {
      aucBars(500, 284, 450, b.metric, p ? p.metric : null, u, { lw: 230, rh: 34, coin: k >= 6, title: k >= 6 ? 'AUC — 오프라인 vs 실전' : 'AUC' }); }
    if (k === 5) { const X = (v) => 500 + 230 + 150 * v; el('path', { d: `M${X(0.81)},${284 + 34 + 30} V${284 + 34 + 40} H${X(0.99)} V${284 + 30}`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.4) });
      mono((X(0.81) + X(0.99)) / 2, 284 + 34 + 58, '0.18 = 가짜', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 7) { pill(700, 230, 'build_features(logs, as_of)', ACC, pop(u, 0.3), { mono: true, fs: 14 }); }
  }

  // =========================================================
  // 4. 전처리 누수 — 스케일러가 test 를 훔쳐볼 때
  // =========================================================
  function strip(x, y, o) { o = o || {}; for (let i = 0; i < 10; i++) { const te = i >= 8, gap = te ? (o.split || 0) * 18 : 0;
      el('rect', { x: x + i * 26 + gap, y, width: 22, height: 26, rx: 4, fill: te ? WARNBG : INFOBG, stroke: te ? WARN : INFO, 'stroke-width': 2, opacity: o.op ?? 1 }); }
    if (o.labels) { mono(x + 104, y + 44, 'train', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: o.op ?? 1 }); mono(x + 8 * 26 + (o.split || 0) * 18 + 24, y + 44, 'test', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: o.op ?? 1 }); } }
  function scaler(cx, cy, mixTest, o) { o = o || {}; card(cx, cy, 140, 48, { text: o.text || 'scaler μ · σ', fs: 14.5, mono: true, stroke: mixTest ? BAD : GOOD, fill: mixTest ? BADBG : GOODBG, color: mixTest ? BAD : GOOD, s: o.s, op: o.op }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev, pl = b.pipeline, ppl = p ? p.pipeline : null;
    // 잘못 레인
    zone(20, 14, 600, 128, '❌ 잘못 — 전체에 fit 후 split', { stroke: BAD, fill: PANEL, color: BAD });
    const wn = pl.wrong.steps.length, wp = ppl ? ppl.wrong.steps.length : 0, wNew = (i) => (i >= wp ? fade(u, 0.3) : 1);
    strip(40, 52, { split: wn >= 2 ? (wp >= 2 ? 1 : E(u, 0.6, 1.2)) : 0, labels: wn >= 2 });
    if (wn >= 1) { const into = k === 0 ? seg(u, 0.4, 1.4) : 1; for (let i = 0; i < 10; i++) if (into < 1) dot([[52 + i * 26, 64], [398, 64]], clamp(into * 1.4 - i * 0.04), i >= 8 ? WARN : INFO, 5);
      scaler(398, 64, true, { s: k === 0 ? pop(u, 0.3) : 1 }); if (into >= 1) el('circle', { cx: 455, cy: 52, r: 6, fill: WARN }); }
    if (wn >= 1) sub(398, 114, 'test 값이 평균·σ 에 섞였다', wNew(0), { fill: BAD });
    if (wn >= 3) { pill(550, 64, '학습 → 평가', BAD, wNew(2) * 1, { fs: 13.5 }); }
    // 올바른 레인
    const rn = pl.right.steps.length, rp = ppl ? ppl.right.steps.length : 0;
    zone(20, 156, 600, 128, '✅ 올바름 — split 먼저, fit 은 train 에서만', { stroke: rn ? GOOD : GRID, fill: PANEL, color: rn ? GOOD : MUT, op: rn ? 1 : 0.6 });
    if (rn >= 1) { strip(40, 196, { split: rp >= 1 ? 1 : E(u, 0.3, 0.9), labels: true }); }
    if (rn >= 2) { const into = rp >= 2 ? 1 : seg(u, 0.4, 1.4); for (let i = 0; i < 8; i++) if (into < 1) dot([[52 + i * 26, 208], [398, 208]], clamp(into * 1.3 - i * 0.04), INFO, 5);
      scaler(398, 208, false, { s: rp >= 2 ? 1 : pop(u, 0.3), text: 'fit(train)' }); }
    if (rn >= 3) { const pp = rp >= 3 ? 1 : E(u, 0.5, 1.3); el('path', { d: 'M300,240 C330,266 470,266 500,224', fill: 'none', stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: pp });
      pill(550, 208, 'test: transform 만', WARN, rp >= 3 ? 1 : pop(u, 1.0), { fs: 13.5 }); }
    // 오른쪽: beat 별 부품
    if (k === 1) { [['visits_30d', 'num'], ['days_to_billing', 'num'], ['log_payment', 'num'], ['plan', 'cat'], ['signup_hour_band', 'cat']].forEach(([s, g], i) => {
        const y = 40 + i * 40; pill(790, y, s, g === 'num' ? INFO : ACC, pop(u, 0.2 + i * 0.15), { mono: true, fs: 13.5 }); });
      tx(940, 100, 'NUM_COLS', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.2) }); tx(940, 200, 'CAT_COLS', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.4) }); }
    if (k === 2) { card(790, 90, 280, 64, { text: 'target encoding 을 전체에 fit\n→ test 의 y 가 평균에 섞인다', fs: 14, stroke: BAD, fill: BADBG, color: BAD, s: pop(u, 0.3) }); }
    if (k === 3) { card(790, 40, 210, 36, { text: 'ColumnTransformer', fs: 14.5, mono: true, stroke: INK, s: pop(u, 0.2) });
      grow(740, 60, 700, 100, E(u, 0.6, 1.0)); grow(840, 60, 880, 100, E(u, 0.6, 1.0));
      card(700, 124, 170, 40, { text: 'StandardScaler\nnum', fs: 13.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.0) });
      card(880, 124, 150, 40, { text: 'OneHotEncoder\ncat', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.2) });
      mono(800, 180, 'handle_unknown="ignore"', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); sub(800, 202, '서빙에서 처음 보는 범주도 안전', fade(u, 2.0), { 'font-size': 13.5 }); }
    if (k >= 4) { const sc = k === 4 ? pop(u, 0.2) : 1; el('rect', { x: 650, y: 20, width: 290, height: 56, rx: 28, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: sc });
      card(725, 48, 120, 34, { text: 'prep', fs: 15, mono: true, stroke: INFO, color: INFO, op: sc }); grow(788, 48, 812, 48, sc, ACC); card(870, 48, 110, 34, { text: 'model', fs: 15, mono: true, stroke: INK, op: sc });
      tx(795, 98, 'clf = Pipeline([prep, model])', { 'font-size': 14, class: 'mono', 'text-anchor': 'middle', opacity: sc }); }
    if (k === 5 || k === 6) { // 5-fold
      for (let f = 0; f < 5; f++) { const y = 122 + f * 30, on = k === 6 ? 1 : fade(u, 0.3 + f * 0.3);
        mono(696, y + 17, 'fold ' + (f + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: on });
        for (let j = 0; j < 5; j++) el('rect', { x: 704 + j * 45, y, width: 41, height: 24, rx: 4, fill: j === f ? WARNBG : INFOBG, stroke: j === f ? WARN : INFO, 'stroke-width': 1.5, opacity: on }); }
      if (k === 5) sub(800, 284, 'fold 마다 prep.fit(train fold) · val 은 transform 만', fade(u, 1.8), { 'font-size': 13.5 }); }
    if (k === 6) { mono(795, 296, 'clf.fit(X_tr, y_tr)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); }
    if (k === 7) { [['누수 방지', GOOD], ['배포 일관성', INFO], ['joblib.dump(clf)', ACC]].forEach(([s, col], i) => pill(795, 130 + i * 44, s, col, pop(u, 0.3 + i * 0.5), { fs: 15, mono: i === 2 }));
      sub(795, 270, '전처리 + 모델이 한 파일로', fade(u, 1.9), { 'font-size': 14.5 }); }
    aucBars(30, 322, 620, b.metric, p ? p.metric : null, u, { lw: 230, rh: 28, title: 'AUC — 전처리 순서별', coinTop: true });
  }

  // =========================================================
  // 5. 실무 체크리스트 — as_of 를 강제하는 파이프라인
  // =========================================================
  const fit = (s, fs, w) => { if (tw(s, fs) <= w) return s; let t = s; while (t.length && tw(t + '…', fs) > w) t = t.slice(0, -1); return t + '…'; };
  function checklist(items, pitems, u) { tx(30, 30, '누수 점검표', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    items.forEach((it, i) => { const had = pitems && pitems.length > i, op = had || !pitems ? (pitems ? 1 : fade(u, 0.2 + i * 0.3)) : fade(u, 0.3), y = 44 + i * 50, g = it.tone === 'guard';
      el('rect', { x: 30, y, width: 430, height: 44, rx: 8, fill: g ? GOODBG : WARNBG, stroke: g ? GOOD : WARN, 'stroke-width': 1.5, opacity: op });
      tx(42, y + 19, fit((g ? '방어 · ' : '신호 · ') + it.q, 13.5, 410), { 'font-size': 13.5, 'font-weight': 700, fill: g ? GOOD : WARN, opacity: op });
      tx(42, y + 37, it.hint, { 'font-size': 13.5, fill: INK, opacity: op }); }); }
  function logLine(x0, x1, y, asOf, o) { o = o || {}; const Tx = (d) => lerp(x0, x1, d / 40); // d: 6/1 부터 날짜 (0~40 → 6/1 ~ 7/11 같은 상대 눈금)
    el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 2 });
    for (let d = 1; d < 40; d += 2.3) { const after = d >= asOf, gone = after && o.cut > 0; el('line', { x1: Tx(d), y1: y - 10, x2: Tx(d), y2: y + 10, stroke: after ? BAD : d >= asOf - 12 && o.win ? ACC : OFF, 'stroke-width': 3, opacity: gone ? 1 - o.cut : 1 }); }
    return Tx; }
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    checklist(b.checklist.items, p ? p.checklist.items : null, u);
    aucBars(500, 300, 450, b.metric, p ? p.metric : null, u, { lw: 200, rh: 30, title: 'AUC' });
    // 오른쪽 위: 함수와 로그
    if (k >= 1) { const sig = k === 1 ? pop(u, 0.3) : 1; card(720, 40, 420, 40, { text: 'build_features(users, logs, as_of)', fs: 15, mono: true, stroke: ACC, fill: ACCBG, color: INK, s: sig });
      if (k === 1) el('rect', { x: 836, y: 26, width: 76, height: 28, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.0) }); }
    if (k === 0) { mono(720, 90, '0.7대 문제에서 0.95+ ?', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) });
      sub(720, 126, '원칙: as_of 강제 · fit 은 Pipeline 안 · 학습=서빙 같은 파일', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 1) sub(720, 100, 'as_of 없이는 호출 자체가 안 된다', fade(u, 1.2), { 'font-size': 14.5 });
    if (k === 2) { card(720, 120, 300, 66, { text: 'as_of: 이 선 이후 데이터는 차단\nRaises: ValueError', fs: 14, mono: true, stroke: WARN, fill: WARNBG, s: pop(u, 0.4) }); }
    if (k >= 3 && k <= 5) { const asOf = 30, Tx = logLine(520, 920, 150, asOf, { cut: k === 3 ? 0 : k === 4 ? E(u, 0.4, 1.2) : 1, win: k >= 4 });
      el('line', { x1: Tx(asOf), y1: 112, x2: Tx(asOf), y2: 186, stroke: BAD, 'stroke-width': 3 }); mono(Tx(asOf), 206, 'as_of', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
      mono(520, 128, 'logs', { 'font-size': 13.5, fill: MUT });
      if (k === 3) { pill(760, 250, 'ValueError: 누수 감지', BAD, pop(u, 1.2), { mono: true, fs: 14 }); cross(Tx(36), 150, 12, pop(u, 0.8)); }
      if (k === 4) { el('rect', { x: Tx(asOf - 12), y: 132, width: Tx(asOf) - Tx(asOf - 12), height: 36, rx: 4, fill: ACCBG, opacity: 0.5 * fade(u, 1.2) });
        sub(Tx(asOf - 6), 230, 'as_of − 30일 ~ as_of', fade(u, 1.4), { fill: ACC, 'font-weight': 700 }); }
      if (k === 5) { ['visits_30d', 'days_since_signup'].forEach((s, i) => pill(640 + i * 170, 256, s, ACC, pop(u, 0.4 + i * 0.4), { mono: true, fs: 13.5 }));
        sub(720, 292, '전처리 fit 은 여기 없다 — Pipeline 몫', fade(u, 1.6)); } }
    if (k >= 6) { // 학습/서빙 두 시점
      const x0 = 520, x1 = 920, D = (m, d) => lerp(x0, x1, ((m - 6) * 31 + d) / 70), y = 170;
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: MUT, 'stroke-width': 2 }); [['6/1', 6, 1], ['7/1', 7, 1], ['8/1', 8, 1]].forEach(([s, m, d]) => mono(D(m, d), y + 24, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      const tr = k === 6 ? E(u, 0.2, 0.8) : 1; el('line', { x1: D(7, 1), y1: y - 50 * tr, x2: D(7, 1), y2: y, stroke: INFO, 'stroke-width': 3 });
      el('rect', { x: D(7, 1), y: y - 14, width: D(8, 1) - D(7, 1), height: 28, fill: WARNBG, opacity: tr * 0.8 }); mono((D(7, 1) + D(8, 1)) / 2, y + 5, '라벨 1달', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: tr });
      pill(D(7, 1) - 40, y - 64, 'X_train · as_of 7/1', INFO, tr, { fs: 13.5 });
      if (k >= 7) { const sv = k === 7 ? E(u, 0.3, 0.9) : 1; el('line', { x1: D(8, 6), y1: y - 50 * sv, x2: D(8, 6), y2: y, stroke: ACC, 'stroke-width': 3 });
        pill(820, y - 96, 'X_serve · as_of 8/6', ACC, sv, { fs: 13.5 }); if (k === 7) sub(720, 234, '같은 함수 — as_of 만 바뀐다', fade(u, 1.4), { 'font-size': 14.5, fill: ACC }); }
      if (k === 8) { card(720, 256, 260, 40, { text: '피처 스토어 → mlops', fs: 15, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.6) });
        grow(620, 116, 680, 234, E(u, 0.2, 0.6), INFO); grow(860, 84, 780, 234, E(u, 0.3, 0.7), ACC); } }
  }

  RA.page({ title: '피처 실험실 — 표 · 차단선 · 파이프라인', scenes: [s1, s2, s3, s4, s5] });
})();
