/* II-2-1 SQL 데이터 소스 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 결과 행·시계열 값·매크로 치환은 STEPS 의 pane(rows · panel.series · macros)에서 읽는다.
 * 매출·주문 수·실행 계획 비용은 페이지의 예시 값이고, 객단가는 revenue ÷ orders 를 python 으로 다시 계산했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const num = (s) => +String(s).replace(/,/g, '');
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const P = (c) => c.beat.pane || {};

  // 결과 표: cols 머리글 + rows. o.w 열 폭 배열, o.hot(열 번호) 강조, o.rowOp(i)
  function table(x, y, cols, rows, o) { o = o || {}; const ws = o.w || cols.map(() => 110), rh = o.rh || 32;
    let cx = x; cols.forEach((h, j) => { const hot = o.hot === j || (o.hotName && o.hotName === h);
      el('rect', { x: cx, y, width: ws[j] - 4, height: rh, rx: 4, fill: hot ? ACCBG : SOFT, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2 : 1, opacity: o.headOp ?? 1 });
      mono(cx + 10, y + 21, h, { 'font-size': 14, 'font-weight': 800, fill: hot ? ACC : o.headCol || INK, opacity: o.headOp ?? 1 }); cx += ws[j]; });
    rows.forEach((r, i) => { const op = o.rowOp ? o.rowOp(i) : 1; if (op <= 0) return; let cx2 = x;
      r.forEach((v, j) => { el('rect', { x: cx2, y: y + (i + 1) * (rh + 2), width: ws[j] - 4, height: rh, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1, opacity: op });
        mono(j === 0 && o.left0 ? cx2 + 10 : cx2 + ws[j] - 14, y + (i + 1) * (rh + 2) + 21, o.cell ? o.cell(i, j, v) : v, { 'font-size': 14, 'text-anchor': j === 0 && o.left0 ? 'start' : 'end', opacity: op, fill: o.col ? o.col(i, j) : INK }); cx2 += ws[j]; }); }); }
  // 시계열 상자: vals 를 u 만큼, 최대 max
  function chart(x, y, w, h, vals, u, o) { o = o || {}; const max = o.max || Math.max(...vals) * 1.15, n = vals.length;
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.6 }); el('line', { x1: x, y1: y, x2: x, y2: y + h, stroke: MUT, 'stroke-width': 1.6 });
    [0.33, 0.66].forEach((g) => el('line', { x1: x, y1: y + h * g, x2: x + w, y2: y + h * g, stroke: GRID, 'stroke-dasharray': '3 4' }));
    const X = (i) => x + 20 + (n > 1 ? (i / (n - 1)) * (w - 40) : (w - 40) / 2), Y = (v) => y + h - (v / max) * h;
    const k = clamp(u) * (n - 1), m = Math.floor(k), pts = vals.slice(0, m + 1).map((v, i) => [X(i), Y(v)]);
    if (m < n - 1 && u > 0) pts.push([lerp(X(m), X(m + 1), k - m), lerp(Y(vals[m]), Y(vals[m + 1]), k - m)]);
    if (u > 0 && pts.length > 1) el('polyline', { points: pts.map((q) => q.join(',')).join(' '), fill: 'none', stroke: o.col || WARN, 'stroke-width': 2.8, 'stroke-dasharray': o.dash });
    pts.forEach((q, i) => { if (i <= m && u > 0) el('circle', { cx: q[0], cy: q[1], r: 4.5, fill: o.col || WARN }); });
    if (o.labels) o.labels.forEach((s, i) => mono(X(i), y + h + 20, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    if (o.vals) vals.forEach((v, i) => { if (i <= m) mono(X(i), Y(v) - 10, String(v), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.col || WARN }); });
    return { X, Y }; }
  function panelBox(x, y, w, h, title, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    tx(x + 12, y + 22, title, { 'font-size': 15, 'font-weight': 700, opacity: o.op ?? 1 }); if (o.right) mono(x + w - 10, y + 22, o.right, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: o.op ?? 1 }); }
  function sqlBox(x, y, lines, o) { o = o || {}; const lh = 24, w = o.w || 420;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 8, fill: INK, opacity: o.op ?? 1 });
    lines.forEach((l, i) => { const [s, col] = Array.isArray(l) ? l : [l, null]; mono(x + 14, y + 26 + i * lh, s, { 'font-size': o.fs || 14, fill: col || PANEL, opacity: o.op ?? 1 }); }); }

  // ================= 1. 읽기 전용 계정 =================
  const PRIVS = ['CONNECT', 'USAGE', 'SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  function s1(t, c) { const { k, u } = c, rows = P(c).rows || [];
    dbIcon(110, 150, 'shop (PostgreSQL)', { stroke: INFO });
    const tabs = ['orders', 'members'].concat(k >= 3 ? ['orders_2026', 'members_2026'] : []);
    tabs.forEach((n, i) => { const s = i >= 2 && k === 3 ? pop(u, 0.3 + (i - 2) * 0.3) : 1; card(110, 250 + i * 36, 160, 30, { rx: 5, text: n, fs: 13.5, mono: true, stroke: i >= 2 ? ACC : GRID, s }); });
    // 역할 카드
    const rs = k === 0 ? pop(u, 0.2) : 1;
    card(390, 110, 190, 84, { rx: 12, stroke: ACC, fill: ACCBG, s: rs }); lock(330, 104, true, ACC, rs);
    mono(410, 104, 'grafana_ro', { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: rs });
    tx(410, 128, 'LOGIN 전용 역할', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: rs });
    // 권한 표
    const have = {}; PRIVS.forEach((p) => (have[p] = null));
    if (k >= 1) { have.CONNECT = true; have.USAGE = true; }
    if (k >= 2) { have.SELECT = true; have.INSERT = false; have.UPDATE = false; have.DELETE = false; }
    rows.forEach((r) => { if (PRIVS.includes(r[0])) have[r[0]] = r[1] === 't'; });
    tx(640, 56, '권한', { 'font-size': 15, 'font-weight': 800 });
    PRIVS.forEach((p, i) => { const y = 74 + i * 44, v = have[p], fresh = (k === 1 && i < 2) || (k === 2 && i >= 2), s = fresh ? pop(u, 0.3 + (i % 4) * 0.25) : 1;
      card(720, y + 18, 170, 36, { rx: 6, text: p, fs: 14.5, mono: true, stroke: v === true ? GOOD : v === false ? BAD : GRID, color: v === false ? BAD : INK });
      if (v === true) check(830, y + 18, 9, s); else if (v === false) cross(830, y + 18, 8, s); else mono(830, y + 23, '—', { 'font-size': 15, fill: OFF, 'text-anchor': 'middle' }); });
    if (k === 0) note(300, 210, '아직 아무 권한도 없다', fade(u, 1.2), { fill: MUT });
    if (k === 2) { const f = seg(u, 1.2, 2.2), x = lerp(410, 170, E(f, 0, 0.6)) + (f > 0.6 ? (f - 0.6) * 300 : 0);
      if (f > 0 && f < 1) card(x, 200, 150, 30, { rx: 15, text: 'UPDATE orders', fs: 13.5, mono: true, fill: BAD, stroke: 'none', color: PANEL });
      if (u > 2.0) { cross(175, 118, 12); mono(40, 70, 'permission denied', { 'font-size': 14, fill: BAD, 'font-weight': 800 }); } }
    if (k === 3) { mono(300, 360, 'ALTER DEFAULT PRIVILEGES', { 'font-size': 14.5, fill: ACC, 'font-weight': 800, opacity: fade(u, 0.2) });
      tabs.slice(2).forEach((n, i) => check(205, 322 + i * 36, 8, pop(u, 1.0 + i * 0.3)));
      tx(300, 386, '새 테이블도 저절로 SELECT 가능', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 4) { server(410, 300, 'Grafana', { s: pop(u, 0.1), lamp: GOOD });
      grow(352, 290, 160, 190, E(u, 0.3, 0.8), MUT);
      fly(350, 280, 170, 200, seg(u, 0.8, 1.5), 'SELECT 1', { mono: true });
      fly(170, 200, 350, 280, seg(u, 1.6, 2.2), '1', { mono: true, fill: GOOD });
      pill(600, 300, 'Data source is working', GOOD, pop(u, 2.3), { fs: 14 }); } }

  // ================= 2. time 컬럼 → 시계열 =================
  const TL = ['09:00', '09:05', '09:10', '09:15', '09:20', '09:25', '09:30'];
  function s2(t, c) { const { k, u } = c, p = P(c), prev = c.prev ? c.prev.pane || {} : {};
    if (k === 0) { [['time', '시간 축 (x)', ACC], ['숫자 컬럼', '선 하나 (series)', WARN]].forEach(([a, b2, col], i) => { const y = 130 + i * 130, s = pop(u, 0.3 + i * 0.6);
        card(220, y, 220, 70, { rx: 10, text: a, fs: 20, mono: true, stroke: col, color: col, s }); grow(340, y, 520, y, E(u, 0.6 + i * 0.6, 1.1 + i * 0.6), col);
        card(680, y, 260, 70, { rx: 10, text: b2, fs: 17, stroke: col, s: pop(u, 1.0 + i * 0.6) }); });
      note(480, 390, 'Grafana는 컬럼 이름만 보고 판단한다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    const cols = p.columns, rows = p.rows, noTime = !cols.includes('time');
    table(40, 70, cols, rows, { w: cols.map((h) => (h === 'created_at' ? 190 : 110)), hotName: noTime ? null : 'time', rowOp: (i) => (k === 1 || (k === 3 && i >= (prev.rows || []).length) ? fade(u, 0.3 + i * 0.25) : 1) });
    if (k === 4) { // 별칭이 없으면 시간축을 못 찾는다
      el('rect', { x: 500, y: 60, width: 420, height: 260, rx: 8, fill: PANEL, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      cross(710, 170, 26, pop(u, 0.4));
      card(710, 270, 320, 40, { rx: 8, text: 'no time column found', fs: 15, mono: true, fill: BADBG, stroke: BAD, color: BAD, s: pop(u, 0.9) });
      note(40, 300, 'created_at은 그냥 문자열 컬럼으로 보인다', fade(u, 1.4), { fill: BAD });
      note(40, 330, '패널은 표로만 그리거나 에러를 낸다', fade(u, 1.8), { fill: MUT }); return; }
    const series = (p.panel && p.panel.series) || [], hasVal = series.length > 0;
    panelBox(500, 60, 420, 270, (p.panel && p.panel.title) || '시간축', { right: hasVal ? 'timeseries' : 'table' });
    const n = Math.max(series.length, rows.length);
    if (k === 1) { const ax = chart(520, 100, 380, 180, [0, 0, 0], 0, { labels: rows.map((r) => r[0]), max: 1 });
      rows.forEach((r, i) => dot([[250, 70 + (i + 1) * 34 + 16], [ax.X(i), 300]], seg(u, 0.8 + i * 0.3, 1.5 + i * 0.3), ACC, 6));
      note(40, 330, 'time 컬럼 값이 x축 눈금이 된다', fade(u, 1.8)); return; }
    if (k === 3) { // 정렬이 없으면 선이 엉킨다 → ORDER BY 로 바로잡기
      const m = E(u, 0.8, 1.8), order = [2, 0, 4, 1, 3], vals = series;
      const ax = chart(520, 100, 380, 180, vals, 1, { labels: TL.slice(0, vals.length), vals: true, col: m > 0.5 ? WARN : OFF });
      if (m < 1) el('polyline', { points: order.map((i) => [ax.X(i), ax.Y(vals[i])].join(',')).join(' '), fill: 'none', stroke: BAD, 'stroke-width': 2.4, opacity: 1 - m, 'stroke-dasharray': '5 4' });
      pill(260, 330, 'ORDER BY created_at', ACC, pop(u, 0.6), { mono: true });
      pill(260, 378, "WHERE … INTERVAL '1 hour'", INFO, pop(u, 0.3), { mono: true }); return; }
    const vals = series, labels = TL.slice(0, vals.length);
    chart(520, 100, 380, 180, vals, k === 2 ? E(u, 0.6, 1.8) : k === 5 ? E(u, 0.3, 1.6) : 1, { labels, vals: k === 2 });
    if (k === 2) { grow(270, 120, 520, 140, E(u, 0.3, 0.7), WARN); note(40, 330, 'amount 컬럼 하나가 선 하나다', fade(u, 1.9)); }
    if (k === 5) { const ref = vals.map((v) => Math.round(v * 0.12 + 10)); chart(520, 100, 380, 180, ref, E(u, 1.2, 2.2), { col: INFO, dash: '6 4', max: Math.max(...vals) * 1.15 });
      [['amount', WARN], ['refund (예시)', INFO]].forEach(([s, col], i) => { el('rect', { x: 530 + i * 150, y: 306, width: 13, height: 13, rx: 2, fill: col }); mono(550 + i * 150, 318, s, { 'font-size': 13.5, opacity: fade(u, 1.4) }); });
      note(40, 330, '숫자 컬럼을 하나 더 고르면 선도 하나 더', fade(u, 1.8)); } }

  // ================= 3. 매크로 =================
  const TG = "$__timeGroup(created_at, '5m')", TGX = 'floor(extract(epoch from created_at)/300)*300';
  const TF = '$__timeFilter(created_at)', TFX = "created_at BETWEEN '09:00' AND '10:00'";
  function picker(x, y, s, o) { o = o || {}; card(x, y, 190, 40, { rx: 8, text: '⏱ ' + s, fs: 15, stroke: o.col || INFO, color: o.col || INFO, fill: INFOBG, s: o.s }); }
  function timeline(x, y, w, counts, u0, o) { o = o || {}; el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: MUT, 'stroke-width': 1.6 });
    ['09:00', '09:30', '10:00'].forEach((s, i) => mono(x + i * w / 2, y + 22, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': i === 0 ? 'start' : i === 2 ? 'end' : 'middle' }));
    const nb = 12, bw = w / nb;
    if (o.buckets) for (let i = 0; i <= nb; i++) el('line', { x1: x + i * bw, y1: y - 70, x2: x + i * bw, y2: y, stroke: GRID, 'stroke-width': 1.2, opacity: o.buckets });
    counts.forEach((cnt, i) => { const h = cnt * 4.5 * clamp(u0); el('rect', { x: x + i * bw + 6, y: y - h, width: bw - 12, height: h, rx: 3, fill: WARN, opacity: 0.85 });
      if (u0 > 0.8) mono(x + i * bw + bw / 2, y - h - 6, String(cnt), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN }); }); }
  function s3(t, c) { const { k, u } = c, p = P(c), counts = (p.rows || []).map((r) => num(r[1]));
    if (k !== 5) picker(820, 36, 'Last 1 hour');
    if (k === 5) { // 하드코딩 vs 매크로
      card(820, 36, 190, 40, { rx: 8, text: '⏱ Last 6 hours', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.4) });
      sqlBox(40, 90, ["WHERE created_at >= '2026-08-11 09:00'"], { w: 520 }); cross(600, 112, 14, pop(u, 1.0));
      tx(620, 118, '선택기를 바꿔도 그대로', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.1) });
      sqlBox(40, 200, ['WHERE ' + TF], { w: 520 }); check(600, 222, 12, pop(u, 1.6));
      tx(620, 228, '선택기를 따라간다', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.7) });
      grow(820, 58, 560, 214, E(u, 1.5, 2.1), ACC);
      note(40, 330, '시간을 SQL에 박으면 대시보드 시간 선택기가 일을 하지 않는다', fade(u, 2.2)); return; }
    const sql = ['SELECT', [k >= 1 ? '  ' + (k >= 1 && !(k === 1 && u < 1.0) ? TGX + ' AS "time",' : TG + ' AS "time",') : '  ' + TG + ' AS "time",', k >= 1 ? ACCBG : null],
      '  count(*) AS orders', 'FROM orders', ...(k >= 2 ? [[k === 2 && u < 0.9 ? 'WHERE ' + TF : 'WHERE ' + TFX, INFOBG]] : []), ...(k >= 3 ? ['GROUP BY 1 ORDER BY 1'] : [])];
    if (k === 0) { sqlBox(40, 80, ['SELECT', ['  ' + TG + ' AS "time",', C.HL], '  count(*) AS orders', 'FROM orders', ['WHERE ' + TF, C.HL], 'GROUP BY 1 ORDER BY 1'], { w: 560 });
      grow(610, 160, 700, 160, E(u, 0.6, 1.1), MUT); card(780, 160, 140, 70, { rx: 10, text: 'Grafana\n치환', fs: 15, stroke: ACC, s: pop(u, 1.0) });
      note(40, 280, '노란 자리표시자는 실행 직전에 진짜 SQL로 바뀐다', fade(u, 1.6)); return; }
    sqlBox(40, 70, sql, { w: 660, fs: 13.5 });
    if (k === 4) { // 쿼리 인스펙터
      el('rect', { x: 30, y: 60, width: 680, height: 190, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      pill(620, 50, 'Query inspector', ACC, pop(u, 0.2), { fs: 14 }); }
    const tlU = k === 1 ? E(u, 1.2, 2.2) : k === 3 ? 1 : 1;
    timeline(80, 370, 720, counts.slice(0, k === 1 ? 2 : counts.length), tlU, { buckets: k === 1 ? fade(u, 0.8) : 0.6 });
    if (k === 1) { tx(820, 330, '5분 = 300초', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9) }); tx(820, 352, '한 칸이 한 행', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); }
    if (k === 2) { grow(820, 58, 700, 186, E(u, 0.8, 1.4), INFO); el('rect', { x: 80, y: 290, width: 720 * E(u, 1.2, 1.9), height: 84, fill: INFOBG, opacity: 0.6 }); }
    if (k === 3) { tx(820, 330, '버킷마다 1행', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) }); tx(820, 352, '시간 순 정렬', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) }); } }

  // ================= 4. GROUP BY 집계 =================
  const CAT = [['식품', WARN], ['전자', INFO], ['패션', ACC]];
  const RAW = Array.from({ length: 24 }, (_, i) => ({ c: [0, 2, 0, 1, 0, 2, 0, 0, 2, 1, 0, 2, 0, 0, 2, 0, 1, 0, 2, 0, 0, 2, 0, 2][i], unpaid: [3, 10, 17, 22].includes(i) }));
  function s4(t, c) { const { k, u } = c, p = P(c), prev = c.prev ? c.prev.pane || {} : {};
    if (k === 0) { const m = E(u, 1.0, 2.2);
      RAW.forEach((r, i) => { const x0 = 60 + (i % 6) * 60, y0 = 80 + Math.floor(i / 6) * 40, slot = RAW.slice(0, i).filter((q) => q.c === r.c).length;
        const x1 = 540 + r.c * 130, y1 = 80 + slot * 22; el('rect', { x: lerp(x0, x1, m), y: lerp(y0, y1, m), width: lerp(50, 100, m), height: lerp(30, 18, m), rx: 4, fill: CAT[r.c][1], opacity: fade(u, 0.1 + i * 0.03) * 0.85 }); });
      CAT.forEach(([n, col], i) => tx(590 + i * 130, 60, n, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 1.8) }));
      tx(60, 270, 'orders 원본 행', { 'font-size': 15, 'font-weight': 700, fill: MUT }); note(540, 380, 'category로 묶을 더미를 정한다', fade(u, 2.0)); return; }
    if (k === 4) { // 시간축 변형
      const vals = (p.panel.series || []);
      panelBox(40, 50, 560, 300, '시간별 매출 (천원)', { right: 'timeseries' });
      chart(70, 90, 500, 200, vals, E(u, 0.4, 1.8), { labels: (p.rows || []).map((r) => r[0]), vals: true, max: 1200 });
      sqlBox(630, 80, ["$__timeGroup(", "  created_at, '1h')", 'AS "time"'], { w: 300 });
      tx(630, 240, 'GROUP BY 대상을', { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.2) }); tx(630, 264, 'category → time으로', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      tx(630, 320, '값은 예시', { 'font-size': 13.5, fill: MUT }); return; }
    // 표 + 매출 막대
    const cols = p.columns, rows = p.rows, pr = prev.rows || [];
    const cell = (i, j, v) => { if (j === 0) return v; const a = pr[i] && pr[i][j] != null && (prev.columns || [])[j] === cols[j] ? num(pr[i][j]) : null, b = num(v); return a == null || k === 1 ? v : fmt(tween(a, b, u)); };
    const ws = [90, 140, 90, 100].slice(0, cols.length);
    table(40, 60, cols, rows, { w: ws, left0: true, cell, hot: k === 2 ? 3 : k === 1 ? null : null, rowOp: (i) => (k === 1 ? fade(u, 0.3 + i * 0.2) : 1),
      col: (i, j) => (k === 3 && j > 0 ? WARN : j === 3 ? ACC : INK) });
    if (k === 1) { [['sum(amount)', 'revenue'], ['count(*)', 'orders']].forEach(([f, n], i) => pill(170 + i * 150, 220, f, ACC, pop(u, 0.4 + i * 0.3), { mono: true, fs: 13.5 })); }
    if (k === 2) { rows.forEach((r, i) => { const s = fade(u, 0.5 + i * 0.4); mono(480, 120 + i * 34, `${r[1]} ÷ ${r[2]} = ${r[3]}`, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: s }); });
      tx(480, 236, '반올림 · 같은 쿼리 한 번에', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); }
    if (k === 3) { RAW.forEach((r, i) => { const x0 = 480 + (i % 12) * 36, y0 = 90 + Math.floor(i / 12) * 34, drop = r.unpaid ? E(u, 0.3, 1.4) : 0;
        el('rect', { x: x0, y: y0 + drop * 140, width: 28, height: 24, rx: 3, fill: r.unpaid ? OFF : CAT[r.c][1], opacity: r.unpaid ? 1 - drop * 0.6 : 0.85 }); });
      tx(480, 200, "status = 'paid'만 남긴다", { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      sqlBox(480, 260, ['WHERE ' + TFX.replace("'09:00' AND '10:00'", '…'), "  AND status = 'paid'"], { w: 440, fs: 13.5 }); }
    if (k === 5) { // 매출 막대 · 작은 결과만 받는다
      rows.forEach((r, i) => { const v = num(r[1]), y = 80 + i * 60; el('rect', { x: 500, y, width: 360 * v / 1200000 * E(u, 0.3 + i * 0.2, 1.2 + i * 0.2), height: 30, rx: 4, fill: CAT[i][1] });
        tx(492, y + 21, r[0], { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); });
      pill(240, 230, 'ORDER BY revenue DESC', ACC, pop(u, 0.2), { mono: true });
      note(40, 330, '원본 행을 다 받지 않고 DB가 묶은 3행만 받는다', fade(u, 1.8)); } }

  // ================= 5. 변수 · 인덱스 =================
  function btree(u0, o) { o = o || {}; const nodes = [[480, 90, 0], [300, 180, 1], [660, 180, 1]], leaves = Array.from({ length: 8 }, (_, i) => [130 + i * 100, 280]);
    const path = o.path ? [0, 2, 6] : null;
    nodes.forEach(([x, y], i) => { const s = pop(u0, 0.1 + i * 0.25), hot = path && (i === 0 || i === 2); card(x, y, 120, 40, { rx: 6, text: i === 0 ? '10:30' : i === 1 ? '08:00' : '13:00', fs: 14, mono: true, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, s }); });
    leaves.forEach(([x, y], i) => { const s = pop(u0, 0.8 + i * 0.08), hot = path && i === 6; card(x, y, 86, 36, { rx: 5, text: ['07', '08', '09', '10', '11', '12', '13', '14'][i] + '시', fs: 13.5, mono: true, stroke: hot ? ACC : GRID, fill: hot ? ACCBG : PANEL, s });
      const parent = i < 4 ? nodes[1] : nodes[2]; el('line', { x1: parent[0], y1: parent[1] + 20, x2: x, y2: y - 18, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.5 : 1.2, opacity: s }); });
    [1, 2].forEach((i) => el('line', { x1: 480, y1: 110, x2: nodes[i][0], y2: nodes[i][1] - 20, stroke: path && i === 2 ? ACC : GRID, 'stroke-width': path && i === 2 ? 2.5 : 1.2, opacity: pop(u0, 0.4) })); }
  function s5(t, c) { const { k, u } = c, p = P(c), series = (p.panel && p.panel.series) || [];
    if (k === 0 || k === 1 || k === 6) {
      panelBox(40, 50, 520, 320, (p.panel && p.panel.title) || '', { right: '천원' });
      chart(70, 90, 460, 220, series, k === 6 ? E(u, 0.3, 2.0) : E(u, 0.3, 1.6), { labels: ['09', '10', '11', '12', '13', '14'].slice(0, series.length), vals: true, max: 1800 });
      if (k === 0) { note(600, 120, '아직 지역 필터가 없다', fade(u, 1.2)); tx(600, 150, '전 지역 합계 · 값은 예시', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); return; }
      // 지역 드롭다운
      card(740, 80, 260, 44, { rx: 8, stroke: ACC, fill: ACCBG }); mono(624, 86, '$region', { 'font-size': 15, 'font-weight': 800, fill: ACC }); mono(720, 86, 'seoul + busan ▾', { 'font-size': 14.5, 'font-weight': 700 });
      if (k === 6) { mono(600, 180, "region IN ('seoul','busan')", { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) }); note(600, 220, '변수 필터 + 시간 매크로가 다 들어간 한 벌', fade(u, 1.4)); return; }
      const m = E(u, 0.5, 1.2);
      mono(600, 170, m < 0.5 ? 'IN (${region:sqlstring})' : "IN ('seoul','busan')", { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: Math.abs(m - 0.5) * 2 });
      tx(600, 230, '값에 작은따옴표가 섞여도', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(600, 262, "busan' OR '1'='1", { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.5) });
      mono(600, 292, "→ 'busan'' OR ''1''=''1'", { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(600, 322, "'를 ''로 바꿔 문자열 하나로 가둔다", { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { btree(u); mono(480, 360, 'idx_orders_created ON orders (created_at)', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(480, 392, '시간 필터 컬럼을 정렬된 나무로 찾아간다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 3) { btree(3, { path: true }); dot([[480, 90], [660, 180], [730, 280]], seg(u, 0.3, 1.4), ACC, 8);
      card(480, 360, 460, 44, { rx: 8, text: 'Index Scan using idx_orders_created', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
      mono(780, 366, 'cost 32', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) }); tx(780, 392, '비용은 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { const n = 48, sc = E(u, 0.2, 2.2) * n;
      for (let i = 0; i < n; i++) { const x = 70 + (i % 12) * 70, y = 70 + Math.floor(i / 12) * 54; el('rect', { x, y, width: 60, height: 42, rx: 4, fill: i < sc ? WARNBG : PANEL, stroke: i < sc ? WARN : GRID, 'stroke-width': 1.4 }); }
      const cur = Math.min(n - 1, Math.floor(sc)); el('rect', { x: 70 + (cur % 12) * 70 - 3, y: 70 + Math.floor(cur / 12) * 54 - 3, width: 66, height: 48, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 3 });
      card(480, 330, 300, 44, { rx: 8, text: 'Seq Scan on orders', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.4) });
      mono(480, 386, 'cost 32 → 12,400 (예시)', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); return; }
    // k5: 함정 세 가지
    (p.rows || []).forEach(([a, b2], i) => { const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.4);
      card(250, y, 340, 70, { rx: 10, stroke: BAD, s }); tx(250, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) });
      grow(430, y, 520, y, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), GOOD);
      card(700, y, 320, 70, { rx: 10, stroke: GOOD, s: pop(u, 0.8 + i * 0.4) }); tx(700, y + 6, b2, { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.9 + i * 0.4) }); }); }

  const quiz = [
    { q: 'Grafana 전용 grafana_ro 계정에 주는 테이블 권한은 무엇인가?',
      o: ['SELECT와 UPDATE', 'SELECT만', '모든 권한'], a: 1,
      why: '대시보드는 읽기만 한다. INSERT·UPDATE·DELETE 권한이 없으면 실수로 쓰기 쿼리를 보내도 DB가 막는다.' },
    { q: 'SQL 결과가 시계열 그래프가 되려면 어떤 컬럼이 있어야 하는가?',
      o: ['이름이 time인 시간 컬럼', 'id 컬럼', '이름이 value인 컬럼'], a: 0,
      why: 'created_at AS "time" 처럼 별칭을 붙이면 그 컬럼이 x축이 된다. 없으면 no time column found가 난다.' },
    { q: 'last 1h를 고르면 $__timeFilter(created_at)는 무엇으로 바뀌는가?',
      o: ['created_at을 5분 단위로 묶는 식', '아무것도 아니다. 그대로 DB로 간다', "created_at BETWEEN '09:00' AND '10:00' 같은 조건"], a: 2,
      why: '대시보드 시간 범위를 WHERE 조건으로 바꾼다. 5분 묶음은 $__timeGroup이 맡는다.' },
    { q: '식품 매출 1,240,000원, 주문 312건일 때 round(avg(amount))로 구한 객단가는 얼마인가?',
      o: ['3,974', '3,124', '39,744'], a: 0,
      why: 'avg는 합계 ÷ 건수다. 1,240,000 ÷ 312 = 3,974.4를 반올림하면 3,974다.' },
    { q: '변수 $region을 SQL에 끼울 때 ${region:sqlstring}을 쓰는 까닭은 무엇인가?',
      o: ['드롭다운을 여러 개 고를 수 없게 하려고', '각 값을 작은따옴표로 감싸고 안의 \'를 \'\'로 바꿔 인젝션을 막으려고', '인덱스를 타게 하려고'], a: 1,
      why: "seoul, busan은 'seoul','busan'이 된다. 따옴표가 섞인 값도 문자열 하나로 갇힌다." },
  ];

  const summary = [
    'Grafana에는 SELECT만 가진 읽기 전용 계정을 따로 만들어 붙인다.',
    '결과에 time이라는 컬럼이 있으면 x축이 되고 숫자 컬럼은 선 하나씩이 된다.',
    '$__timeFilter와 $__timeGroup은 실행 직전 대시보드 시간 범위로 바뀐다.',
    '집계는 DB에서 끝내고, 변수는 sqlstring으로 감싸고, created_at에는 인덱스를 둔다.',
  ];
  const review = [
    { q: '30초마다 새로고침하는 매출 패널을 붙인 뒤 운영 DB CPU가 올랐다. EXPLAIN에 Seq Scan on orders가 보인다. 먼저 할 일은?',
      o: ['created_at에 인덱스를 만들고 읽기 전용 리플리카로 옮긴다', '패널을 table로 바꾼다', 'time 별칭을 지운다'], a: 0,
      why: '시간 필터 컬럼에 인덱스가 없으면 새로고침마다 테이블 전체를 훑는다. 운영 DB 부담은 리플리카로 덜어낸다.' },
    { q: '시간 범위를 Last 6 hours로 바꿨는데 그래프가 그대로 1시간치만 보인다. 쿼리에서 먼저 볼 곳은?',
      o: ['GROUP BY 1이 빠졌는지', 'WHERE에 시간을 직접 적었는지', 'sum 대신 count를 썼는지'], a: 1,
      why: "created_at >= '…09:00'처럼 박아 두면 선택기를 바꿔도 SQL이 그대로다. $__timeFilter로 바꾸면 따라간다." },
    { q: '카테고리별 매출 표를 시간별 매출 그래프로 바꾸려 한다. 가장 작은 수정은?',
      o: ['읽기 전용 계정을 하나 더 만든다', '원본 주문 행을 모두 가져와 브라우저에서 더한다', 'category 대신 $__timeGroup(created_at, \'1h\') AS "time" 으로 묶는다'], a: 2,
      why: 'GROUP BY 대상만 시간 버킷으로 바꾸면 같은 sum(amount)가 시계열이 된다. 집계는 계속 DB가 한다.' },
  ];

  R.page({ title: 'SQL 결과가 패널이 되는 규칙', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
