/* IV-2-2 pandas 5분 훑기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 직원 5명 DataFrame 표 자체(인덱스 칸 + 열 4개)를 열·행·칸 단위로 꺼내고, 바꾸고, 묶는다.
 * 값은 페이지의 표와 코드 주석, 그리고 pandas 3.1.1 로 직접 실행한 결과(정렬 순서, groupby 키 순서, 측정 시간)만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, fly, dot, cells, zone, cross, check, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const COLS = ['name', 'dept', 'salary', 'age'];
  const DATA = [['kim', 'eng', 5000, 29], ['lee', 'sales', 4200, 35], ['park', 'eng', 6100, 41], ['choi', 'sales', 3900, 26], ['jung', 'hr', 4800, null]];
  const DCOL = { eng: INFO, sales: WARN, hr: GOOD };
  const fmtAge = (v) => (v == null ? 'NaN' : Number.isInteger(v) ? v.toFixed(1) : String(v));
  const rowsOf = (extra) => DATA.map((d, i) => ({ i, v: d.map((x, c) => (c === 3 ? fmtAge(x) : String(x))).concat(extra ? extra(i) : []) }));
  // DataFrame 표. rows [{ i, v:[...], op, y(위치 덮어쓰기), hl }]  o = { cols, cw, colHi:{이름:색}, cell(r,c)→{fill,col,fw}, idxCol }
  function table(x, y, rows, o) { o = o || {}; const cols = o.cols || COLS, cw = o.cw || 92, rh = o.rh || 34, iw = 44, W = iw + cw * cols.length;
    const colX = (c) => x + iw + c * cw;
    if (o.frame !== false) el('rect', { x, y, width: W, height: rh * (rows.length + 1) + (o.extraH || 0), rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    cols.forEach((cn, c) => { const hc = o.colHi && o.colHi[cn], cop = (o.colOp ? o.colOp(c) : 1) * (o.op ?? 1);
      if (hc) el('rect', { x: colX(c) + 2, y: y + 2, width: cw - 4, height: rh * (rows.length + 1) - 4, rx: 6, fill: hc === BAD ? BADBG : hc === GOOD ? GOODBG : hc === WARN ? WARNBG : ACCBG, opacity: cop });
      mono(colX(c) + cw / 2, y + 23, cn, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: hc || INK, opacity: cop }); });
    el('line', { x1: x + 6, y1: y + rh, x2: x + W - 6, y2: y + rh, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    rows.forEach((r, k) => { const ry = r.y ?? y + rh * (k + 1), op = (r.op ?? 1) * (o.op ?? 1); if (op <= 0.02) return;
      if (r.hl) el('rect', { x: x + 3, y: ry + 2, width: W - 6, height: rh - 4, rx: 5, fill: r.hl === BAD ? BADBG : r.hl === GOOD ? GOODBG : ACCBG, opacity: op });
      mono(x + iw / 2, ry + 23, String(r.i), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700, opacity: op });
      r.v.forEach((s, c) => { const st = (o.cell && o.cell(r, c)) || {}, cop = (o.colOp ? o.colOp(c) : 1);
        if (st.fill) el('rect', { x: colX(c) + 4, y: ry + 4, width: cw - 8, height: rh - 8, rx: 4, fill: st.fill, opacity: op * cop });
        if (s == null || s === '') return;
        mono(colX(c) + cw / 2, ry + 23, s, { 'font-size': 14.5, 'text-anchor': 'middle', fill: st.col || (s === 'NaN' ? BAD : INK), 'font-weight': st.fw || (s === 'NaN' ? 800 : 400), 'font-style': s === 'NaN' ? 'italic' : null, opacity: op * cop }); }); });
    return { colX, cw, rh, W, rowY: (k) => y + rh * (k + 1) }; }

  // ---------- 1. Series · DataFrame ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 50, 's = pd.Series([5000, 4200, 6100], name="salary")', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      table(120, 80, [5000, 4200, 6100].map((v, i) => ({ i, v: [String(v)], op: fade(u, 0.4 + i * 0.3) })), { cols: ['salary'], cw: 120 });
      [['index', '0 · 1 · 2 (왼쪽 칸)', 0.6], ['values', '5000 · 4200 · 6100', 1.2], ['name', '"salary"', 1.6], ['dtype', 'int64', 2.0]].forEach(([a, b, at], i) => { const y = 120 + i * 44;
        mono(400, y, a, { 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: fade(u, at) }); tx(500, y, b, { 'font-size': 15, opacity: fade(u, at + 0.1) }); });
      sub(480, 340, 'Series = 인덱스가 붙은 1차원 · 표의 한 열', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const g = (c2) => E(u, 0.3 + c2 * 0.35, 0.9 + c2 * 0.35);
      table(220, 60, rowsOf(), { colOp: (c2) => g(c2), cell: (r, c2) => (r.i === 4 && c2 === 3 ? { fill: BADBG } : null) });
      mono(220, 290, '5 rows × 4 columns', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) });
      sub(700, 300, '같은 인덱스를 나누어 쓰는 Series 4개', fade(u, 2.1), { 'font-size': 15, fill: INK });
      sub(480, 350, 'None 하나는 NaN 으로 바뀌어 들어간다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 2) { const lines = ['name,dept,salary,age', 'kim,eng,5000,29', 'lee,sales,4200,35', 'park,eng,6100,41', 'choi,sales,3900,26', 'jung,hr,4800,'];
      el('rect', { x: 30, y: 50, width: 270, height: 220, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      lines.forEach((s, i) => mono(46, 82 + i * 30, s, { 'font-size': 14.5, fill: i ? INK : ACC, 'font-weight': i ? 400 : 800, opacity: fade(u, 0.1 + i * 0.1) }));
      mono(165, 296, 'employees.csv', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      grow(310, 160, 380, 160, E(u, 0.8, 1.2), ACC); mono(345, 148, 'read_csv', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) });
      table(390, 60, rowsOf(), { op: fade(u, 1.2) });
      sub(640, 300, 'dtype 은 파일 내용을 보고 추론한다', fade(u, 1.8), { 'font-size': 15, fill: INK });
      sub(640, 334, '숫자 열에 글자가 섞이면 문자열 열로 읽힌다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD }); return; }
    const rows = rowsOf();
    if (k === 3) { const n = Math.floor(E(u, 0.2, 1.5) * 5.99); table(40, 60, rows.map((r, i) => ({ ...r, hl: i < n ? ACC : null })));
      el('path', { d: 'M470,96 h14 V262 h-14', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.5) });
      mono(500, 186, 'df.head() → 앞 5행', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      sub(700, 300, '값의 생김새를 눈으로 본다 · 결측과 dtype 은 눈으로 다 안 잡힌다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 4) { table(40, 60, rows, { colHi: { age: u > 1.4 ? BAD : null } });
      tx(520, 62, 'df.info()', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      [['name', 5, 'str'], ['dept', 5, 'str'], ['salary', 5, 'int64'], ['age', 4, 'float64']].forEach(([n, v, ty], i) => { const y = 90 + i * 44, bad = v < 5;
        mono(520, y + 15, n, { 'font-size': 15, 'font-weight': 700, fill: bad ? BAD : INK, opacity: fade(u, 0.3 + i * 0.2) });
        R.hbar(600, y, 150, v * E(u, 0.3 + i * 0.2, 0.9 + i * 0.2), 5, { h: 20, col: bad ? BAD : ACC, label: false });
        mono(760, y + 16, v + ' non-null', { 'font-size': 14, fill: bad ? BAD : INK, 'font-weight': bad ? 800 : 400, opacity: fade(u, 0.7 + i * 0.2) });
        mono(900, y + 16, ty, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.8 + i * 0.2) }); });
      sub(700, 300, '결측 1개가 드러난다 (pandas 3 은 글자 열을 str 로 표시)', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { table(40, 60, rows, { colHi: { salary: ACC, age: WARN } });
      tx(520, 62, 'df.describe()', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      const st = [['count', '5', '4'], ['mean', '4800.0', '32.75'], ['min', '3900.0', '26.0'], ['max', '6100.0', '41.0']];
      el('rect', { x: 520, y: 80, width: 400, height: 200, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(720, 106, 'salary', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); mono(850, 106, 'age', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      st.forEach(([a, b, c2], i) => { const y = 142 + i * 36, op = fade(u, 0.3 + i * 0.35);
        mono(540, y, a, { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: op }); mono(720, y, b, { 'font-size': 15, 'text-anchor': 'middle', opacity: op });
        mono(850, y, c2, { 'font-size': 15, 'text-anchor': 'middle', fill: i === 0 ? BAD : INK, 'font-weight': i === 0 ? 800 : 400, opacity: op }); });
      sub(720, 310, 'age count 4 < 행 수 5 → 결측이 있다', fade(u, 1.9), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    // k6 열 하나 = Series
    const lift = E(u, 0.3, 1.2);
    table(40, 60, rows.map((r) => ({ ...r, v: r.v.map((s, c2) => (c2 === 2 ? '' : s)) })), { cols: ['name', 'dept', '', 'age'], colHi: { '': OFF } });
    table(lerp(40 + 44 + 184 - 44, 600, lift), lerp(60, 70, lift), rows.map((r) => ({ i: r.i, v: [r.v[2]] })), { cols: ['salary'], cw: 92 });
    mono(600, 300, 'df["salary"] → Series', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
    sub(700, 340, '처음에 만든 것과 같은 1차원 Series 다', fade(u, 1.8), { 'font-size': 14.5 }); }

  // ---------- 2. 선택 ----------
  function s2(t, c) { const { k, u } = c, rows = rowsOf();
    if (k === 0) { table(40, 60, rows, { colHi: { salary: ACC } });
      table(640, 60, rows.map((r) => ({ i: r.i, v: [r.v[2]], op: fade(u, 0.6 + r.i * 0.1) })), { cols: ['salary'], op: fade(u, 0.5) });
      grow(520, 150, 630, 150, E(u, 0.3, 0.6), ACC); mono(560, 300, 'df["salary"]', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      pill(830, 150, 'Series', ACC, pop(u, 1.3), { fs: 15 }); sub(580, 336, '대괄호 한 겹 = 1차원', fade(u, 1.7), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { table(40, 60, rows, { colHi: { name: ACC, salary: ACC } });
      table(600, 60, rows.map((r) => ({ i: r.i, v: [r.v[0], r.v[2]], op: fade(u, 0.6 + r.i * 0.1) })), { cols: ['name', 'salary'], cw: 86, op: fade(u, 0.5) });
      mono(560, 300, 'df[["name", "salary"]]', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      pill(880, 290, 'DataFrame', ACC, pop(u, 1.3), { fs: 15 }); sub(600, 336, '두 겹 = 열 목록 → 2차원 · df[["salary"]] 도 DataFrame', fade(u, 1.7), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { const g = table(40, 80, rows, { cell: (r, c2) => (r.i === 0 && c2 === 0 ? { fill: ACCBG, fw: 800, col: ACC } : null) });
      COLS.forEach((_, c2) => mono(g.colX(c2) + 46, 70, String(c2), { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) }));
      [0, 1, 2, 3, 4].forEach((r) => mono(26, g.rowY(r) + 23, String(r), { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) }));
      mono(540, 120, 'df.loc[0, "name"]', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) }); tx(540, 148, '인덱스 라벨 0 · 열 이름 "name"', { 'font-size': 14.5, opacity: fade(u, 0.5) });
      mono(540, 200, 'df.iloc[0, 0]', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.1) }); tx(540, 228, '0부터 센 위치 (주황 숫자)', { 'font-size': 14.5, opacity: fade(u, 1.3) });
      pill(640, 280, '둘 다 → "kim"', GOOD, pop(u, 1.8), { mono: true, fs: 15 });
      sub(700, 330, '지금은 라벨과 위치가 같아 보일 뿐이다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { const g = table(40, 60, rows, { cell: (r) => (r.i <= 2 ? { fill: ACCBG } : null) });
      el('path', { d: `M520,${g.rowY(0) + 2} h14 V${g.rowY(3) - 2} h-14`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.4) });
      el('path', { d: `M550,${g.rowY(0) + 2} h14 V${g.rowY(2) - 2} h-14`, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.1) });
      mono(600, 130, 'df.loc[0:2]  → 3행', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) }); tx(600, 158, '라벨 슬라이스: 끝(2) 포함', { 'font-size': 14.5, opacity: fade(u, 0.7) });
      mono(600, 210, 'df.iloc[0:2] → 2행', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) }); tx(600, 238, '위치 슬라이스: 끝(2) 제외', { 'font-size': 14.5, opacity: fade(u, 1.4) });
      sub(700, 300, 'len() 으로 행 수를 찍어 보면 바로 보인다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    const mask = DATA.map((d) => d[2] >= 4500);
    if (k === 4 || k === 5) { const drop = k === 5 ? E(u, 0.3, 1.1) : 0;
      table(40, 60, rows.map((r, i) => ({ ...r, v: r.v.concat([mask[i] ? 'True' : 'False']), op: mask[i] ? 1 : 1 - 0.8 * drop, hl: k === 5 && mask[i] && u > 1.1 ? GOOD : null })),
        { cols: COLS.concat(['>=4500']), cw: 84, colHi: { '>=4500': k === 4 ? INFO : null }, colOp: (c2) => (c2 === 4 && k === 4 ? E(u, 0.3, 1.2) : 1), cell: (r, c2) => (c2 === 4 ? { col: mask[r.i] ? GOOD : BAD, fw: 800 } : null) });
      mono(540, 300, k === 4 ? 'df["salary"] >= 4500' : 'df[df["salary"] >= 4500]', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      sub(700, 340, k === 4 ? '값 하나가 아니라 행마다 True/False · 길이는 원본과 같다' : 'True 인 행만 남는다 · lee·choi 탈락 → 3행', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); return; }
    // k6 두 조건
    const a = DATA.map((d) => d[1] === 'eng'), b = DATA.map((d) => d[2] > 5000);
    table(30, 60, rows.map((r, i) => ({ ...r, v: r.v.concat([a[i] ? 'T' : 'F', b[i] ? 'T' : 'F', a[i] && b[i] ? 'T' : 'F']), hl: a[i] && b[i] && u > 1.6 ? GOOD : null })),
      { cols: COLS.concat(['eng', '>5000', '&']), cw: 78, colOp: (c2) => (c2 === 4 ? fade(u, 0.3) : c2 === 5 ? fade(u, 0.7) : c2 === 6 ? fade(u, 1.2) : 1), cell: (r, c2) => (c2 >= 4 ? { col: r.v[c2] === 'T' ? GOOD : MUT, fw: 800 } : null) });
    mono(30, 296, 'df[(df["dept"] == "eng") & (df["salary"] > 5000)]  → park', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4) });
    mono(30, 332, '괄호를 빼면 → TypeError (& 가 == 보다 먼저 묶인다)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) });
    sub(480, 372, '직접 실행: Cannot perform \'rand_\' with a dtyped [int64] array and scalar of type [bool]', fade(u, 2.3), { 'font-size': 13.5 }); }

  // ---------- 3. 변환 ----------
  const BONUS = ['500.0', '420.0', '610.0', '390.0', '480.0'], GRADE = ['A', 'B', 'A', 'B', 'B'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const g = E(u, 0.6, 1.1);
      table(40, 60, rowsOf((i) => [g > 0.5 ? BONUS[i] : '']), { cols: COLS.concat(['bonus']), cw: 90, colHi: { bonus: GOOD }, colOp: (c2) => (c2 === 4 ? fade(u, 0.3) : 1) });
      if (u > 0.5 && u < 1.2) el('rect', { x: 40 + 44 + 2 * 90, y: 94, width: 90, height: 170, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: 1 - E(u, 0.9, 1.2) });
      mono(40, 300, 'df["bonus"] = df["salary"] * 0.1', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      sub(700, 300, '다섯 칸이 한 번에 채워진다 · 루프 없음', fade(u, 1.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const n = E(u, 0.3, 2.3) * 5;
      table(40, 60, rowsOf((i) => [BONUS[i], i < Math.floor(n) ? GRADE[i] : '']).map((r, i) => ({ ...r, hl: Math.floor(n) === i ? WARN : null })), { cols: COLS.concat(['bonus', 'grade']), cw: 80, colHi: { grade: WARN } });
      card(800, 150, 230, 70, { rx: 12, stroke: WARN, sw: 2.2, text: 'lambda x:\n"A" if x >= 5000 else "B"', fs: 14, mono: true });
      sub(800, 220, '값마다 한 번씩 부른다', 1, { 'font-size': 14.5 });
      mono(40, 300, 'df["salary"].apply(lambda x: ...)', { 'font-size': 16, 'font-weight': 800 });
      sub(700, 340, 'apply 는 안쪽이 파이썬 루프다 · 단순 산술이면 벡터 연산을 먼저', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    const ext = (i) => [BONUS[i], GRADE[i]], cols = COLS.concat(['bonus', 'grade']);
    if (k === 2) { table(40, 60, rowsOf(ext).map((r) => ({ ...r, v: r.v.map((s, c2) => (c2 === 3 && u > 0.8 ? (s === 'NaN' ? 'True' : 'False') : s)) })), { cols, cw: 80, colHi: { age: BAD },
        cell: (r, c2) => (c2 === 3 && u > 0.8 ? { col: r.i === 4 ? BAD : MUT, fw: r.i === 4 ? 800 : 400 } : null) });
      mono(40, 300, 'df["age"].isna()', { 'font-size': 16, 'font-weight': 800 }); sub(700, 300, 'jung 행만 True · isna().sum() 이면 개수 1', fade(u, 1.4), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { const g = table(40, 60, rowsOf(ext), { cols, cw: 80, colHi: { age: WARN } });
      for (let i = 0; i < 4; i++) dot([[g.colX(3) + 40, g.rowY(i) + 18], [690, 150]], seg(u, 0.3 + i * 0.2, 0.9 + i * 0.2), WARN, 6);
      cross(g.colX(3) + 64, g.rowY(4) + 17, 8, pop(u, 0.4));
      card(780, 150, 240, 80, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 1.1), text: '(29+35+41+26) / 4\n= 32.75', fs: 16, mono: true });
      mono(40, 300, 'mean_age = df["age"].mean()', { 'font-size': 16, 'font-weight': 800 });
      sub(700, 300, 'NaN 은 빼고 분모도 4 로 줄어든다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    if (k === 4) { table(40, 60, rowsOf(ext).map((r) => ({ ...r, v: r.v.map((s) => (s === 'NaN' ? (u > 1.0 ? '32.75' : 'NaN') : s)) })), { cols, cw: 80,
        cell: (r, c2) => (r.i === 4 && c2 === 3 && u > 1.0 ? { fill: GOODBG, col: GOOD, fw: 800 } : null) });
      fly(800, 150, 330, 240, seg(u, 0.3, 1.0), '32.75', { mono: true, fill: GOOD });
      mono(40, 300, 'df["age"] = df["age"].fillna(mean_age)', { 'font-size': 16, 'font-weight': 800 }); sub(700, 340, '결측 0개 · 행 수는 그대로 5', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    if (k === 5) { const g = E(u, 0.4, 1.3);
      table(40, 60, rowsOf(ext).map((r) => ({ ...r, op: r.i === 4 ? 1 - g : 1, y: r.i === 4 ? 60 + 34 * 5 + 40 * g : undefined, hl: r.i === 4 ? BAD : null })), { cols, cw: 80 });
      mono(40, 330, '# df = df.dropna()   # 채우는 대신 버린다면', { 'font-size': 15, 'font-weight': 700 });
      pill(720, 160, '5행 → 4행', BAD, pop(u, 1.4), { fs: 16 }); sub(720, 210, '채울 근거가 없을 때 고른다', fade(u, 1.7), { 'font-size': 14.5 }); return; }
    // k6 astype
    table(40, 60, rowsOf(ext).map((r) => ({ ...r, v: r.v.map((s, c2) => (c2 === 3 ? (s === 'NaN' ? (u > 1.0 ? '32' : '32.75') : (u > 1.0 ? s.replace('.0', '') : s)) : s)) })), { cols, cw: 80, colHi: { age: INFO },
      cell: (r, c2) => (r.i === 4 && c2 === 3 ? { fill: u > 1.0 ? WARNBG : null, col: WARN, fw: 800 } : null) });
    mono(40, 300, 'df["age"] = df["age"].astype(int)', { 'font-size': 16, 'font-weight': 800 });
    pill(760, 150, 'float64 → int64', INFO, pop(u, 0.6), { mono: true, fs: 15 });
    tx(660, 220, '32.75 → 32', { 'font-size': 18, 'font-weight': 800, fill: WARN, class: 'mono', opacity: fade(u, 1.2) }); sub(760, 254, '반올림이 아니라 버림 (직접 실행)', fade(u, 1.5), { 'font-size': 14.5 }); }

  // ---------- 4. 집계 ----------
  const GRP = [['eng', [0, 2], 5550, 11100, 2], ['hr', [4], 4800, 4800, 1], ['sales', [1, 3], 4050, 8100, 2]];   // groupby 결과는 키 이름순
  function s4(t, c) { const { k, u } = c, rows = rowsOf();
    if (k <= 2) { const g = table(30, 60, rows, { cell: (r, c2) => (c2 === 1 ? { col: DCOL[r.v[1]], fw: 800 } : null) });
      GRP.forEach(([d, idx, mean, sum, cnt], j) => { const by = 70 + j * 96, s = k === 0 ? pop(u, 0.9 + j * 0.25) : 1;
        idx.forEach((ri, m) => dot([[480, g.rowY(ri) + 17], [560, by + 30]], k === 0 ? seg(u, 0.3 + j * 0.2 + m * 0.1, 0.9 + j * 0.2 + m * 0.1) : 0, DCOL[d], 6));
        card(640, by + 30, 150, 78, { rx: 10, stroke: DCOL[d], sw: 2.2, s });
        mono(580, by + 18, d, { 'font-size': 15, 'font-weight': 800, fill: DCOL[d], opacity: s > 0.5 ? 1 : 0 }); mono(580, by + 46, idx.map((i) => DATA[i][2]).join(', '), { 'font-size': 13.5, fill: MUT, opacity: s > 0.5 ? 1 : 0 });
        const vals = k === 0 ? [['mean', mean]] : k === 1 ? [['head_count', cnt]] : [['head_count', cnt], ['total_pay', sum], ['avg_pay', mean]];
        vals.forEach(([nm, v], m) => { const op = k === 0 ? fade(u, 1.5 + j * 0.2) : fade(u, 0.4 + j * 0.2 + m * 0.3);
          mono(730 + m * 0, by + 22 + m * 22 - (vals.length > 1 ? 10 : 0), nm + ' ' + (nm.includes('avg') || nm === 'mean' ? v.toFixed(1) : v), { 'font-size': 14, 'font-weight': 700, opacity: op }); }); });
      sub(480, 380, k === 0 ? 'split → apply(mean) → combine · 결과 행은 키 이름순 eng, hr, sales' : k === 1 ? 'agg(head_count=("name", "count")) · 키워드 이름이 결과 열 이름' : '한 번의 agg 로 세 지표를 한 표에', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3) { tx(60, 60, 'df["dept"].value_counts()', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      [['eng', 2], ['sales', 2], ['hr', 1]].forEach(([d, v], i) => { const y = 100 + i * 60;
        mono(60, y + 18, d, { 'font-size': 16, 'font-weight': 800, fill: DCOL[d] }); R.hbar(150, y, 360, v * E(u, 0.3 + i * 0.3, 1.0 + i * 0.3), 2, { h: 26, col: DCOL[d], label: false });
        mono(530, y + 19, String(v), { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.9 + i * 0.3) }); });
      sub(300, 320, '많은 순으로 개수만 돌려준다 · sum·mean 은 없다', fade(u, 1.9), { 'font-size': 15, fill: INK });
      card(780, 180, 260, 90, { rx: 12, stroke: GRID, sw: 1.5, s: pop(u, 2.0), text: '합계·평균도 필요하면\ngroupby().agg()', fs: 15 }); return; }
    if (k === 4) { const order = [2, 0, 4, 1, 3], g = E(u, 0.4, 1.6);
      table(40, 60, rows.map((r, i) => ({ ...r, y: lerp(60 + 34 * (i + 1), 60 + 34 * (order.indexOf(i) + 1), g), hl: i === 2 && u > 1.6 ? ACC : null })), { colHi: { salary: ACC } });
      mono(540, 90, 'df.sort_values("salary",', { 'font-size': 15.5, 'font-weight': 800 }); mono(540, 116, '               ascending=False)', { 'font-size': 15.5, 'font-weight': 800 });
      tx(540, 180, '행이 통째로 자리를 옮긴다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(540, 220, '인덱스: 2, 0, 4, 1, 3', { 'font-size': 15.5, fill: ACC, 'font-weight': 800, opacity: fade(u, 1.8) });
      sub(700, 280, '인덱스 라벨은 행을 따라간다 · 새 번호가 필요하면 reset_index()', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k5 merge
    const FL = { eng: 3, sales: 2, hr: 1 }, g = E(u, 1.0, 1.8);
    table(30, 60, rowsOf((i) => [g > 0.5 ? String(FL[DATA[i][1]]) : '']), { cols: COLS.concat(['floor']), cw: 84, colHi: { floor: g > 0.5 ? GOOD : null }, cell: (r, c2) => (c2 === 1 ? { col: DCOL[r.v[1]], fw: 800 } : null) });
    table(660, 60, [['eng', '3'], ['sales', '2'], ['hr', '1']].map((v, i) => ({ i, v })), { cols: ['dept', 'floor'], cw: 90, op: fade(u, 0.2) });
    mono(660, 50, 'dept_info', { 'font-size': 14.5, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.2) });
    for (let i = 0; i < 5; i++) dot([[700, 100 + ['eng', 'sales', 'hr'].indexOf(DATA[i][1]) * 34 + 17 + 34], [460, 60 + 34 * (i + 1) + 17]], seg(u, 0.6 + i * 0.12, 1.2 + i * 0.12), DCOL[DATA[i][1]], 6);
    mono(30, 300, 'df.merge(dept_info, on="dept", how="left")', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.3) });
    sub(480, 340, 'left 는 왼쪽 행을 모두 남긴다 · 조인 뒤 행 수(5)를 꼭 확인한다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); }

  // ---------- 5. 벡터화와 함정 ----------
  function s5(t, c) { const { k, u } = c, rows = rowsOf();
    if (k === 0) { const step = Math.floor(t * 2.2) % 5;
      table(40, 60, rows.map((r, i) => ({ i: r.i, v: [r.v[2]], hl: i === step ? WARN : null })), { cols: ['salary'], cw: 100 });
      mono(60, 284, 'iterrows', { 'font-size': 15, 'font-weight': 800, fill: WARN }); sub(110, 310, '한 행씩', 1, { 'font-size': 14 });
      table(220, 60, rows.map((r) => ({ i: r.i, v: [r.v[2]], hl: Math.floor(t * 2.2) % 2 ? ACC : null })), { cols: ['salary'], cw: 100 });
      mono(240, 284, '* 1.1', { 'font-size': 15, 'font-weight': 800, fill: ACC }); sub(290, 310, '열 전체를 한 번에', 1, { 'font-size': 14 });
      tx(440, 70, '같은 계산의 시간 (이 PC에서 측정, pandas 3.1)', { 'font-size': 15, 'font-weight': 700 });
      [['5행', '약 3배', 0.3], ['1만 행', '0.13ms vs 457ms', 1.0]].forEach(([a, b, at], i) => { const y = 110 + i * 100;
        tx(440, y + 14, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, at) });
        el('rect', { x: 530, y, width: 220 * E(u, at, at + 0.6), height: 22, rx: 4, fill: WARN, opacity: 0.85 }); mono(530, y + 42, 'iterrows', { 'font-size': 13.5, fill: WARN, opacity: fade(u, at + 0.3) });
        el('rect', { x: 530, y: y + 52, width: i ? 3 : 73 * E(u, at, at + 0.6), height: 22, rx: 3, fill: ACC }); mono(i ? 545 : 615, y + 69, '벡터화', { 'font-size': 13.5, fill: ACC, opacity: fade(u, at + 0.3) });
        mono(920, y + 16, b, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, at + 0.5) }); });
      sub(660, 340, '행이 많을수록 차이가 커진다 (1만 행에서 수천 배)', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { const bonus = (v) => rows.map((r, i) => ({ i: r.i, v: [r.v[0], r.v[2], v(i)] }));
      tx(40, 46, '원본 df', { 'font-size': 14.5, 'font-weight': 800, fill: MUT });
      table(40, 56, bonus((i) => (i === 2 && u > 2.0 ? '0.0' : BONUS[i])), { cols: ['name', 'salary', 'bonus'], cw: 86, cell: (r, c2) => (r.i === 2 && c2 === 2 ? { fill: u > 2.0 ? GOODBG : BADBG, col: u > 2.0 ? GOOD : BAD, fw: 800 } : null) });
      const g = E(u, 0.3, 0.8); el('rect', { x: 400, y: 70, width: 260 * g, height: 80, rx: 8, fill: SOFT, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      if (g > 0.9) { mono(414, 96, 'df[df.salary > 5000] 의 복사본', { 'font-size': 13.5, fill: MUT }); mono(414, 130, 'park  6100  0', { 'font-size': 15, 'font-weight': 800, fill: OFF, opacity: fade(u, 0.9) }); }
      mono(690, 110, '["bonus"] = 0', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.7) });
      tx(400, 186, '원본의 park bonus 는 610.0 그대로', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
      mono(400, 214, 'pandas 3: ChainedAssignmentError 경고', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) }); mono(400, 238, 'pandas 2: SettingWithCopyWarning', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      mono(400, 286, 'df.loc[df.salary > 5000, "bonus"] = 0', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      tx(400, 316, '한 번에 쓰면 원본이 610.0 → 0.0 (직접 실행)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { const g = table(40, 60, rows, { cell: (r) => (r.i <= 2 ? { fill: ACCBG } : null) });
      el('path', { d: `M520,${g.rowY(0) + 2} h14 V${g.rowY(3) - 2} h-14`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 }); el('path', { d: `M550,${g.rowY(0) + 2} h14 V${g.rowY(2) - 2} h-14`, fill: 'none', stroke: WARN, 'stroke-width': 2.5 });
      [['df.loc[0:2]', 'len → 3', ACC], ['df.iloc[0:2]', 'len → 2', WARN]].forEach(([a, b, col], i) => { mono(600, 120 + i * 70, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.5) }); mono(780, 120 + i * 70, b, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6 + i * 0.5) }); });
      sub(700, 300, '헷갈리면 행 수를 찍어 본다', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    // k3 결측 개수
    table(40, 60, rows, { colHi: { age: BAD } });
    tx(540, 70, 'df.isna().sum()', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    [['name', 0], ['dept', 0], ['salary', 0], ['age', 1]].forEach(([n, v], i) => { const y = 100 + i * 44;
      mono(540, y + 16, n, { 'font-size': 15, 'font-weight': 700, fill: v ? BAD : INK, opacity: fade(u, 0.3 + i * 0.25) });
      R.hbar(630, y, 200, v * E(u, 0.4 + i * 0.25, 0.9 + i * 0.25), 1, { h: 20, col: BAD, label: false }); mono(850, y + 16, String(v), { 'font-size': 16, 'font-weight': 800, fill: v ? BAD : INK, opacity: fade(u, 0.6 + i * 0.25) }); });
    sub(700, 300, 'df["age"] + 0 도 jung 칸은 NaN 으로 남는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); sub(700, 330, '로드 직후 결측부터 센다', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  const quiz = [
    { q: 'df.info()에서 age만 4 non-null로 나왔다. 무엇을 뜻하나?',
      o: ['age 열의 dtype이 잘못됐다', 'age에 결측(NaN)이 1개 있다', 'age 열이 4번째 열이다'], a: 1,
      why: '행은 5개인데 값이 있는 칸이 4개다. describe()의 age count도 4로 같은 사실을 보여 준다.' },
    { q: 'df.loc[0:2]와 df.iloc[0:2]는 각각 몇 행을 돌려주나?',
      o: ['3행과 2행', '2행과 2행', '3행과 3행'], a: 0,
      why: 'loc의 라벨 슬라이스는 끝(2)을 포함하고, iloc의 위치 슬라이스는 파이썬처럼 끝을 뺀다.' },
    { q: 'age의 NaN을 평균으로 채운 뒤 astype(int) 하면 jung의 age는 몇이 되나?',
      o: ['33', '32.75', '32'], a: 2,
      why: '평균은 NaN을 뺀 네 명으로 32.75이고, astype(int)는 반올림 없이 소수점을 버려 32가 된다.' },
    { q: 'df.groupby("dept")["salary"].mean()의 결과 행 순서는 무엇인가?',
      o: ['eng, sales, hr (처음 나온 순)', 'eng, hr, sales (키 이름순)', '평균이 큰 순'], a: 1,
      why: 'groupby는 기본으로 키를 정렬한다. 직접 실행하면 eng 5550, hr 4800, sales 4050 순이다.' },
    { q: 'df[df.salary > 5000]["bonus"] = 0을 실행한 뒤 원본 df의 park bonus는 무엇인가?',
      o: ['610.0 그대로', '0', 'NaN'], a: 0,
      why: '앞의 필터가 만든 복사본에 썼기 때문에 원본은 바뀌지 않는다. df.loc[조건, "bonus"] = 0으로 한 번에 써야 한다.' },
  ];
  const summary = [
    'DataFrame은 같은 인덱스를 나눠 쓰는 Series 묶음이다. 로드 직후 head, info, describe로 결측과 dtype을 본다.',
    '열은 df["col"], 행은 loc(라벨)과 iloc(위치)로 고른다. loc[0:2]는 3행, iloc[0:2]는 2행이다.',
    '조건식은 행마다 True/False를 만든다. 두 조건은 괄호로 감싸 &로 잇는다.',
    '값 바꾸기는 벡터 연산과 df.loc 한 번에 한다. 1만 행에서 iterrows는 벡터화보다 수천 배 느렸다.',
  ];
  const review = [
    { q: 'read_csv로 읽은 salary를 정렬했더니 "10000" 이 "9000" 보다 앞에 온다. 먼저 할 일은?',
      o: ['info()로 dtype을 보고 astype으로 숫자로 바꾼다', 'sort_values에 ascending=False를 준다', 'iterrows로 한 행씩 비교한다'], a: 0,
      why: '숫자 열이 글자로 읽히면 사전순으로 정렬된다. info()로 확인하고 astype으로 숫자 dtype을 맞춘다.' },
    { q: '부서별 평균 급여를 구했는데 age 평균이 예상보다 높다. 데이터에 NaN이 있다. 알맞은 순서는?',
      o: ['groupby 먼저, 결측은 나중에 본다', 'isna().sum()으로 결측을 세고 fillna나 dropna를 정한 뒤 집계한다', 'NaN을 0으로 바꾸고 바로 평균을 낸다'], a: 1,
      why: 'mean()은 NaN을 빼고 분모도 줄인다. 결측 개수를 먼저 보고 채울지 버릴지 데이터 뜻에 맞게 정해야 집계가 조용히 틀리지 않는다.' },
    { q: '급여 5000 초과 직원의 bonus를 0으로 고쳤는데 저장된 파일에는 그대로다. 고칠 코드는?',
      o: ['for 루프와 iterrows로 한 행씩 고친다', 'df[df.salary > 5000]["bonus"] = 0을 두 번 실행한다', 'df.loc[df.salary > 5000, "bonus"] = 0으로 바꾼다'], a: 2,
      why: '대괄호를 이어 쓴 대입은 복사본에 쓴다. loc 한 번에 쓰면 원본이 바뀌고 벡터 연산이라 빠르다.' },
  ];

  R.page({ title: '표를 꺼내고 바꾸고 묶기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
