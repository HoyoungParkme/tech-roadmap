/* III-1-2 ApplicationSet — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 생성되는 Application 이름·네임스페이스·리비전·replicas 는 페이지 YAML 을 파이썬으로 치환해 본 결과와 같다
 * (list 3개, cluster 3개, git 3개 + qa-team-a, matrix 9개). sandbox-a 폴더와 PR ①② 는 그림을 위한 예시 이름이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, person, terminal, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공용 부품 ----------
  const SCOL = { Synced: GOOD, Healthy: GOOD, OutOfSync: WARN };
  function app(cx, cy, name, o) { o = o || {}; const w = o.w || 176, h = o.h || (o.st ? 54 : 40), col = o.col || INK;
    const g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash }, g);
    const ix = -w / 2 + 17;
    el('path', { d: `M${ix + 6},-3 A6,6 0 1 0 ${ix + 3},4`, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
    el('path', { d: `M${ix + 2},-5 L${ix + 7},-3 L${ix + 9},-8`, fill: 'none', stroke: col, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    mono(-w / 2 + 31, o.st || o.sub ? -5 : 5, name, { 'font-size': o.fs || 14, 'font-weight': 700, fill: col }, g);
    if (o.sub) mono(-w / 2 + 31, 16, o.sub, { 'font-size': 13.5, fill: o.subCol || MUT, 'font-weight': 700 }, g);
    if (o.st) { let x = -w / 2 + 31; o.st.forEach((s) => { tx(x, 16, s, { 'font-size': 13.5, 'font-weight': 700, fill: SCOL[s] || MUT }, g); x += tw(s, 13.5) + 10; }); }
    return g; }
  function fileIco(cx, cy, col, s) { const g = R.G(cx, cy, s ?? 1); el('path', { d: 'M-5,-7 h7 l4,4 v10 h-11 Z', fill: PANEL, stroke: col || MUT, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g); return g; }
  function dirIco(cx, cy, col) { el('path', { d: `M${cx - 7},${cy - 5} h5 l2,2 h7 v9 h-14 Z`, fill: col === ACC ? ACCBG : SOFT, stroke: col || MUT, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }); }
  function repo(x, y, w, title, br, rows, o) { o = o || {}; const lh = o.lh || 25, h = o.h || 46 + rows.length * lh;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    el('circle', { cx: x + 16, cy: y + 14, r: 3.5, fill: 'none', stroke: MUT, 'stroke-width': 1.8 }); el('circle', { cx: x + 16, cy: y + 28, r: 3.5, fill: 'none', stroke: MUT, 'stroke-width': 1.8 });
    el('path', { d: `M${x + 16},${y + 17.5} V${y + 24.5} M${x + 26},${y + 14} C${x + 26},${y + 22} ${x + 16},${y + 20} ${x + 16},${y + 24}`, fill: 'none', stroke: MUT, 'stroke-width': 1.8 });
    mono(x + 34, y + 26, title, { 'font-size': 14.5, 'font-weight': 700, opacity: o.op ?? 1 });
    if (br) pill(x + w - tw(br, 13.5) / 2 - 22, y + 21, br, INFO, 1, { fs: 13.5, mono: true });
    el('line', { x1: x, y1: y + 40, x2: x + w, y2: y + 40, stroke: GRID, 'stroke-width': 1.5 });
    const Y = (i) => y + 46 + i * lh + lh / 2 - 3;
    rows.forEach((r, i) => { const op = r.op ?? 1; if (op <= 0) return; const yy = Y(i), xx = x + 16 + (r.d || 0) * 18;
      if (r.hi) el('rect', { x: x + 6, y: yy - lh / 2 + 1, width: w - 12, height: lh - 2, rx: 5, fill: r.hi === true ? ACCBG : r.hi, opacity: op });
      if (r.dir) dirIco(xx + 6, yy, r.col); else fileIco(xx + 6, yy, r.col);
      mono(xx + 20, yy + 5, r.t, { 'font-size': 14, fill: r.col || INK, opacity: op, 'font-weight': r.hi ? 700 : 400, 'text-decoration': r.gone ? 'line-through' : null }); });
    return { Y, h }; }
  function yml(x, y, w, lines, o) { o = o || {}; const lh = o.lh || 23, fs = o.fs || 14, n = o.n ?? lines.length;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 8, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    lines.slice(0, Math.ceil(n)).forEach((s, i) => { const yy = y + 12 + fs + i * lh, last = i === Math.ceil(n) - 1 && n % 1, part = last ? s.slice(0, Math.round(s.length * (n % 1))) : s;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: yy - fs, width: w - 8, height: lh, rx: 4, fill: ACCBG });
      const m = part.match(/^(\s*-?\s*)([\w.\-/"]+:)(.*)$/), parts = [];
      if (m) { parts.push([m[1], {}], [m[2], { fill: INFO, 'font-weight': 700 }]); }
      const rest = m ? m[3] : part;
      rest.split(/(\{\{[^}]+\}\})/).forEach((p) => { if (p) parts.push([p, /^\{\{/.test(p) ? { fill: ACC, 'font-weight': 800 } : { fill: part.trim().startsWith('#') ? MUT : INK }]); });
      R.spans(x + 14, yy, parts, { 'font-size': fs, opacity: o.op ?? 1 }); });
    return { h: lines.length * lh + 18 }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 자식 수 계기
  function counter(x, y, label, v, col) { tx(x, y - 22, label, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, 'text-anchor': 'end' }); mono(x, y + 8, String(v), { 'font-size': 30, 'font-weight': 800, fill: col || ACC, 'text-anchor': 'end' }); }
  // ApplicationSet 상자 (명단 + 양식)
  function appset(x, y, w, h, name, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.4, opacity: o.op ?? 1 });
    tx(x + 14, y + 22, 'ApplicationSet', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: o.op ?? 1 }); mono(x + 14 + tw('ApplicationSet', 13.5) + 10, y + 22, name, { 'font-size': 14, 'font-weight': 800, fill: INK, opacity: o.op ?? 1 }); }

  // ---------- 1. 왜 ApplicationSet ----------
  function fileGrid(x0, y0, n, styl) { for (let i = 0; i < n; i++) { const st = styl ? styl(i) : {}; const x = x0 + (i % 2) * 34, y = y0 + Math.floor(i / 2) * 38;
    if ((st.s ?? 1) <= 0) continue; const g = R.G(x, y, st.s ?? 1, st.op ?? 1);
    el('path', { d: 'M-11,-15 h15 l7,7 v23 h-22 Z', fill: st.fill || PANEL, stroke: st.col || INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'stroke-dasharray': st.dash }, g);
    el('line', { x1: -6, y1: -2, x2: 5, y2: -2, stroke: GRID, 'stroke-width': 2 }, g); el('line', { x1: -6, y1: 4, x2: 5, y2: 4, stroke: GRID, 'stroke-width': 2 }, g); } }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { const cols = [['dev', 120], ['stg', 260], ['prd', 400], ['qa', 540]];
      const nCol = k === 0 ? 1 : k === 2 && u > 1.8 ? 4 : 3;
      cols.slice(0, nCol).forEach(([e, x], j) => { const fresh = (k === 1 && j > 0) || (k === 2 && j === 3), a = k === 1 ? 0.3 + (j - 1) * 0.5 : 1.9;
        lbl(x + 17, 60, 'apps/' + e + '/', fresh ? fade(u, a) : 1, { class: 'mono', 'font-size': 15, fill: j === 3 ? WARN : INK });
        fileGrid(x, 100, 10, (i) => { const st = { s: fresh ? pop(u, a + i * 0.04) : k === 0 ? pop(u, 0.2 + i * 0.08) : 1, dash: j === 3 ? '4 3' : null, col: j === 3 ? WARN : INK };
          if (k === 2 && j === 1 && i === 0) { st.col = BAD; st.fill = BADBG; }
          if (k === 2 && j < 3 && u > 1.0 && u < 1.8) { st.col = WARN; st.fill = WARNBG; }
          if (k === 0 && i < 2) st.fill = ACCBG; return st; }); });
      const n = k === 0 ? Math.round(lerp(0, 10, E(u, 0.2, 1.0))) : k === 1 ? Math.round(tween(10, 30, u, 1.4)) : Math.round(tween(30, 40, Math.max(0, u - 1.7), 0.6));
      counter(930, 90, '자식 YAML', n, k === 2 ? BAD : INK);
      if (k === 0) { yml(640, 150, 290, ['# web.yaml', 'name: web-dev', 'path: k8s/overlays/dev', 'env: dev'], { hi: (i) => i === 3 }); sub(785, 290, '두 파일이 다른 곳은 한 줄', fade(u, 1.2), { fill: ACC, 'font-weight': 700 }); }
      if (k === 1) sub(785, 200, '3개 환경 × 10개 서비스', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700, fill: INK });
      if (k === 2) { [['stg 사본에 env: dev 오타', BAD, 0.3], ['공통 변경 = 30곳 수정', WARN, 1.0], ['새 환경 qa = 10개 더', WARN, 1.8]].forEach(([s, col, a], i) => note(660, 170 + i * 44, s, fade(u, a), { fill: col }));
        if (u > 0.3) { el('circle', { cx: 260, cy: 100, r: 22, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.3) }); } }
      return; }
    // k ≥ 3: ApplicationSet
    appset(40, 40, 420, 330, 'web-set');
    tx(58, 84, 'generators · 명단', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const els = [['dev', 'web-dev'], ['stg', 'web-stg'], ['prd', 'web']];
    els.forEach(([e, n], i) => { const y = 110 + i * 38, on = k >= 4, a = 0.2 + i * 0.35;
      el('rect', { x: 58, y: y - 15, width: 384, height: 30, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': on ? null : '5 4' });
      if (on) mono(72, y + 5, `- { env: ${e}, ns: ${n} }`, { 'font-size': 14, fill: INK, opacity: k === 4 ? fade(u, a) : 1 }); });
    tx(58, 244, 'template · 양식', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    yml(58, 256, 384, ['name: "web-{{env}}"', 'destination: { namespace: "{{ns}}" }'], { op: k === 3 ? fade(u, 0.6) : 1 });
    if (k === 3) { sub(250, 400, '명단과 양식을 갈라 둔다', fade(u, 1.4), { fill: ACC, 'font-weight': 700 });
      for (let i = 0; i < 3; i++) app(720, 110 + i * 70, '', { w: 220, dash: '6 5', col: GRID, op: fade(u, 1.0) }); counter(930, 330, '자식', 0, MUT); return; }
    if (k === 4) { els.forEach(([e, n], i) => { const a = 0.3 + i * 0.6, s = pop(u, a + 0.5);
        dot([[442, 110 + i * 38], [560, 300], [600, 110 + i * 70]], seg(u, a, a + 0.6), ACC, 6);
        app(720, 110 + i * 70, 'web-' + e, { w: 220, s, col: ACC }); mono(720, 140 + i * 70, 'ns: ' + n, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a + 0.7) }); });
      counter(930, 330, '자식', Math.min(3, Math.floor(seg(u, 0.8, 2.3) * 3.99)), ACC); return; }
    // k5: 30 → 1
    const X = 560;
    [['App of Apps', 30, 'YAML 30개', BAD], ['ApplicationSet', 1, 'ApplicationSet 1개 + 명단 3줄', ACC]].forEach(([nm, v, s, col], i) => { const y = 120 + i * 120, g = E(u, 0.3 + i * 0.6, 1.2 + i * 0.6);
      tx(X - 20, y + 16, nm, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: X, y, width: Math.max(4, 360 * (v / 30) * g), height: 30, rx: 5, fill: col, opacity: 0.85 });
      mono(X + 8 + Math.max(4, 360 * (v / 30) * g), y + 21, String(v), { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.6) });
      sub(X + 180, y + 56, s, fade(u, 1.0 + i * 0.6)); }); }

  // ---------- 2. List generator ----------
  const LROWS = [['dev', 'web-dev', 'main', '1', 'dev-project'], ['stg', 'web-stg', 'release-v2.3', '2', 'stg-project'], ['prd', 'web', 'v2.3.1', '5', 'prd-project'], ['qa', 'web-qa', 'main', '1', 'qa-project']];
  const LCOL = [['env', 60], ['namespace', 130], ['revision', 260], ['replicas', 400], ['project', 490]];
  function s2(t, c) { const { k, u } = c;
    appset(30, 20, 610, 210, 'web-multi-env', { op: k === 0 ? fade(u, 0.1) : 1 });
    tx(48, 66, 'list.elements', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    LCOL.forEach(([h, x]) => mono(x, 92, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }));
    const nRows = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : k === 8 ? 4 : 3;
    for (let i = 0; i < 4; i++) { const y = 118 + i * 27, fresh = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i === 2) || (k === 8 && i === 3);
      el('rect', { x: 46, y: y - 17, width: 578, height: 24, rx: 5, fill: i < nRows ? (i === 3 ? GOODBG : PANEL) : 'none', stroke: GRID, 'stroke-width': 1.2, 'stroke-dasharray': i < nRows ? null : '4 4', opacity: i === 3 && k !== 8 ? 0 : 1 });
      if (i >= nRows) continue;
      LROWS[i].forEach((v, j) => { const hl = (k === 4 && j === 0) || (k === 5 && (j === 2 || j === 3)) || (k === 6 && j === 1);
        mono(LCOL[j][1], y, v, { 'font-size': 14, fill: hl ? ACC : i === 3 ? GOOD : INK, 'font-weight': hl ? 800 : 400, opacity: fresh ? fade(u, 0.2 + j * 0.2) : 1 }); }); }
    // 양식
    const tl = { 4: ['name: "web-{{env}}"', 'labels: { env: "{{env}}" }'], 5: ['targetRevision: "{{revision}}"', 'path: "k8s/overlays/{{env}}"', 'count: "{{replicas}}"'], 6: ['namespace: "{{namespace}}"', 'automated: prune + selfHeal'] }[k];
    if (tl) yml(30, 250, 500, tl, { n: lerp(1, tl.length, E(u, 0.1, 0.9)) });
    else if (k <= 3 || k >= 7) { tx(40, 272, 'template', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); mono(40, 298, 'web-{{env}}', { 'font-size': 18, 'font-weight': 800, fill: ACC });
      if (k === 1) sub(260, 340, 'replicas는 문자열 "1"', fade(u, 1.2), { class: 'mono', fill: INFO, 'font-weight': 700 }); if (k === 3) sub(260, 340, 'prd만 태그 고정', fade(u, 1.2), { fill: WARN, 'font-weight': 700 }); }
    // 결과 자식
    const nKids = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : k === 8 ? 4 : 3;
    const nPrev = k === 0 ? 0 : k === 1 ? 0 : k === 2 ? 1 : k === 3 ? 2 : k === 8 ? 3 : 3;
    counter(930, 70, '자식 수', Math.round(tween(nPrev, nKids, u, 1.0)), nKids ? ACC : MUT);
    for (let i = 0; i < 4; i++) { const y = 172 + i * 60, on = i < nKids, fresh = on && i >= nPrev && !(k >= 4 && k <= 7);
      if (!on) { if (i < 3) app(800, y, '', { w: 240, h: 50, dash: '6 5', col: GRID }); continue; }
      const r = LROWS[i], name = 'web-' + r[0], st = k === 7 ? ['Synced'] : null;
      const detail = k === 5 ? `${r[2]} · ×${r[3]}` : k === 6 ? `ns ${r[1]}` : k === 7 ? 'Synced' : k === 4 ? r[4] : null;
      app(800, y, name, { w: 240, h: 50, s: fresh ? pop(u, 0.9) : 1, col: i === 3 ? GOOD : ACC, sub: detail, subCol: k === 7 ? GOOD : MUT });
      if (k === 4) { dot([[LCOL[0][1] + 10, 118 + i * 27], [680, y]], seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3), ACC, 5); } }
    if (k === 8) sub(800, 410, '양식은 그대로, 명단 1줄 = 자식 1개', fade(u, 1.4), { fill: GOOD, 'font-weight': 700 }); }

  // ---------- 3. Cluster generator ----------
  const CL = [['in-cluster', null], ['us-east-prd', 'us-east'], ['eu-west-prd', 'eu-west'], ['ap-northeast-prd', 'ap-northeast'], ['sa-east-prd', 'sa-east']];
  function globe(cx, cy, col, s) { const g = R.G(cx, cy, s ?? 1); el('circle', { cx: 0, cy: 0, r: 15, fill: PANEL, stroke: col, 'stroke-width': 2 }, g); el('ellipse', { cx: 0, cy: 0, rx: 6, ry: 15, fill: 'none', stroke: col, 'stroke-width': 1.5 }, g); el('line', { x1: -15, y1: 0, x2: 15, y2: 0, stroke: col, 'stroke-width': 1.5 }, g); return g; }
  function s3(t, c) { const { k, u } = c;
    tx(30, 34, '등록된 클러스터 (cluster secret)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const nCl = k === 8 ? 5 : 4;
    const pass = (i) => i >= 1 && i <= 3 && k >= 1;
    for (let i = 0; i < nCl; i++) { const [nm, rg] = CL[i], y = 72 + i * 66, fresh = k === 8 && i === 4;
      const lab = i === 0 ? '라벨 없음 (secret 없음)' : k >= 7 || k <= 6 ? `env=prd  region=${rg}` : '';
      const labOp = k === 7 ? fade(u, 0.5 + i * 0.5) : 1;
      const col = k >= 1 ? (pass(i) ? GOOD : i === 0 || i === 4 ? OFF : INK) : INK;
      card(170, y, 280, 54, { rx: 8, stroke: col, sw: 2, s: fresh ? pop(u, 0.3) : 1 });
      globe(52, y, col === OFF ? MUT : col); mono(78, y - 4, nm, { 'font-size': 14.5, 'font-weight': 700, fill: col === OFF ? MUT : INK, opacity: fresh ? fade(u, 0.4) : 1 });
      mono(78, y + 17, i === 0 ? lab : (k === 7 ? `env=prd  region=${rg}` : lab), { 'font-size': 13.5, fill: i === 0 ? MUT : INFO, opacity: i === 0 ? 1 : (k === 7 ? labOp : fresh ? fade(u, 0.6) : 1) });
      if (k >= 1 && (i === 0 || i === 4) && !(k === 8 && i === 4 && u < 1.0)) cross(330, y, 9, k === 1 && i === 0 ? pop(u, 1.2) : k === 8 && i === 4 ? pop(u, 1.0) : 1); }
    // selector
    const selLines = k === 0 ? ['generators:', '  # 명단 출처 미정'] : k === 1 ? ['- clusters:', '    selector:', '      matchLabels:', '        env: prd'] : ['matchLabels: { env: prd }', 'matchExpressions:', '  region In [us-east,', '    eu-west, ap-northeast]'];
    appset(350, 20, 300, 44, 'web-multi-cluster');
    if (k <= 2) yml(350, 80, 300, selLines, { n: k === 0 ? 2 : lerp(1, selLines.length, E(u, 0.1, 1.0)), hi: (i) => k === 2 && i >= 1 });
    if (k === 1) { [1, 2, 3].forEach((i, j) => dot([[312, 72 + i * 66], [500, 230], [680, 120 + j * 80]], seg(u, 1.0 + j * 0.3, 1.8 + j * 0.3), GOOD, 6));
      sub(500, 260, 'in-cluster는 secret이 없어 라벨 selector에 안 걸린다', fade(u, 1.8), { fill: MUT }); }
    if (k === 2) { counter(930, 90, '후보', 3, GOOD); sub(500, 260, 'region 목록 안의 세 곳만 남는다', fade(u, 1.0), { fill: GOOD, 'font-weight': 700 }); }
    // 결과 자식
    const shownKids = k >= 3 && k !== 7;
    if (k >= 3 && k <= 6 || k === 8) { const tl = { 3: ['name: "web-{{name}}"', 'region: "{{metadata.labels.region}}"'], 4: ['targetRevision: v2.3.1', 'path: k8s/overlays/prd', 'deployment.cluster: "{{name}}"'], 5: ['server: "{{server}}"', 'namespace: web'], 6: ['automated: prune + selfHeal', 'syncOptions: [CreateNamespace=true]'], 8: ['matchExpressions:', '  region In [... , sa-east]'] }[k];
      yml(350, 80, 300, tl, { n: lerp(1, tl.length, E(u, 0.1, 0.9)), hi: (i) => k === 8 && i === 1 && u > 1.6 }); }
    if (shownKids) [1, 2, 3].forEach((i, j) => { const y = 120 + j * 80, nm = 'web-' + CL[i][0];
      app(800, y, nm, { w: 250, fs: 13.5, s: k === 3 ? pop(u, 0.6 + j * 0.3) : 1, col: ACC, st: k === 8 ? ['Synced'] : null, h: k === 8 ? 52 : 40 });
      if (k === 3) dot([[312, 72 + i * 66], [675, y]], seg(u, 0.2 + j * 0.3, 0.8 + j * 0.3), ACC, 5);
      if (k === 4) { mono(930, y + 32, 'v2.3.1', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 0.8 + j * 0.2) }); }
      if (k === 5) { R.el('path', { d: `M${675},${y} C${520},${y} ${450},${72 + i * 66} ${312},${72 + i * 66}`, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.4 + j * 0.3) }); }
      if (k === 6) for (let d = 0; d < 3; d++) dot([[800, y + 22], [800, y + 44]], (t * 0.8 + d / 3) % 1, GOOD, 4); });
    if (k === 4) { pill(650, 395, 'acme/web · v2.3.1 · overlays/prd (공통)', INFO, pop(u, 0.3), { fs: 13.5, mono: true }); }
    if (k === 5) sub(500, 260, '각 자식이 자기 클러스터 API로 간다', fade(u, 1.4), { fill: INFO, 'font-weight': 700 });
    if (k === 6) sub(800, 380, '세 리전에 동시에 나간다', fade(u, 0.8), { fill: WARN, 'font-weight': 700 });
    if (k === 7) { terminal(360, 70, 580, 190, ['$ argocd cluster add us-east-prd \\', '    --label env=prd --label region=us-east', '$ argocd cluster add eu-west-prd \\', '    --label env=prd --label region=eu-west', '$ argocd cluster add ap-northeast-prd \\', '    --label env=prd --label region=ap-northeast'], lerp(0, 6, E(u, 0.1, 2.2)), { fs: 13.5, lh: 21 });
      sub(650, 300, '라벨이 붙는 순간 selector가 명단에 넣는다', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 8) { sub(500, 300, 'sa-east는 region 목록에 없어 빠진다', fade(u, 1.0), { fill: BAD, 'font-weight': 700 }); sub(500, 326, '목록에 한 줄 더하면 네 번째가 생긴다', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 }); } }

  // ---------- 4. Git generator ----------
  const GD = ['dev/', 'stg/', 'prd/', 'sandbox-a/', 'qa-team-a/'];
  function s4(t, c) { const { k, u } = c;
    const rows = [{ t: 'envs/', dir: true }];
    GD.forEach((d, i) => { if (i === 4 && k < 7) return; const r = { t: d, d: 1, dir: true };
      if (k >= 1 && i < 3) { r.col = ACC; if (k === 1) r.hi = seg(u, 0.3 + i * 0.3, 0.6 + i * 0.3) > 0 ? true : null; }
      if (i === 3 && k >= 1 && (k > 1 || u > 1.6)) { r.gone = true; r.col = BAD; }
      if (i === 4) { r.col = GOOD; r.hi = GOODBG; r.op = fade(u, 0.3); }
      if (k === 2 && i < 3) r.hi = null;
      rows.push(r); if (k === 2 && i === 0) rows.push({ t: 'config.json', d: 2, hi: true, col: INFO }); });
    const rp = repo(30, 30, 290, 'infra-gitops', 'main', rows, { op: k === 0 ? 0.5 : 1 });
    appset(350, 20, 300, 44, 'web-from-git');
    if (k === 0) { yml(350, 80, 300, ['generators:', '  # 명단 출처 미정'], {}); return; }
    if (k === 1) { yml(350, 80, 300, ['- git:', '    directories:', '      - path: envs/*', '      - path: envs/sandbox-*', '        exclude: true'], { n: lerp(1, 5, E(u, 0.1, 1.4)), hi: (i) => i >= 3 && u > 1.5 });
      counter(930, 100, '명단', u > 1.6 ? 3 : Math.min(4, Math.floor(seg(u, 0.3, 1.3) * 4.99)), u > 1.6 ? GOOD : INK); return; }
    if (k === 2) { yml(350, 80, 300, ['{"cluster": "dev-cluster",', ' "replicas": 1,', ' "version": "main"}'], { n: lerp(1, 3, E(u, 0.1, 0.9)) });
      ['{{cluster}}', '{{replicas}}', '{{version}}'].forEach((s, i) => pill(800, 110 + i * 54, s, ACC, pop(u, 1.0 + i * 0.3), { fs: 14, mono: true }));
      sub(500, 220, 'files 모드: JSON 키가 치환 변수', fade(u, 1.6), { fill: INFO, 'font-weight': 700 }); return; }
    if (k === 3) { mono(360, 130, 'envs/dev', { 'font-size': 22, 'font-weight': 700, fill: MUT, opacity: 1 - 0.6 * E(u, 0.6, 1.2) });
      mono(500, 190, 'dev', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(500, 220, '{{path.basename}} = 마지막 폴더 이름', fade(u, 1.0), { class: 'mono', fill: ACC, 'font-weight': 700 });
      grow(540, 186, 690, 186, E(u, 1.3, 1.8), ACC); app(810, 186, 'web-dev', { w: 220, col: ACC, s: pop(u, 1.8) }); return; }
    if (k === 4) { repo(660, 100, 280, 'acme/web', 'HEAD', [{ t: 'k8s/overlays/', dir: true }, { t: '{{path.basename}}/', d: 1, dir: true, col: ACC, hi: true }], { op: fade(u, 0.2) });
      sub(175, 236, '명단 리포', fade(u, 0.6), { fill: MUT, 'font-weight': 700, 'font-size': 15 }); sub(800, 236, '배포 소스 리포', fade(u, 0.9), { fill: MUT, 'font-weight': 700, 'font-size': 15 });
      sub(500, 380, '두 리포는 서로 다르다', fade(u, 1.5), { fill: WARN, 'font-weight': 700 }); return; }
    const names = ['dev', 'stg', 'prd'].concat(k >= 7 ? ['qa-team-a'] : []);
    names.forEach((n, i) => { const y = 130 + i * 66, fresh = k === 7 && i === 3;
      app(800, y, 'web-' + n, { w: 250, col: fresh ? GOOD : ACC, s: k === 6 ? pop(u, 0.3 + i * 0.3) : fresh ? pop(u, 2.2) : 1 });
      if (k === 5) mono(800, y + 34, 'ns web-' + n, { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.3) });
      if (k === 6) dot([[310, rp.Y(i + 1)], [675, y]], seg(u, 0.1 + i * 0.3, 0.6 + i * 0.3), ACC, 5); });
    if (k === 5) yml(350, 80, 300, ['namespace: "web-{{path.basename}}"', 'automated: prune + selfHeal', 'CreateNamespace=true'], { n: lerp(1, 3, E(u, 0.1, 0.9)) });
    if (k === 6) counter(500, 200, '자식', Math.min(3, Math.floor(seg(u, 0.4, 1.6) * 3.99)), ACC);
    if (k === 7) { const st = ['① PR', '② merge', '③ poll', '④ 생성'];
      st.forEach((s, i) => { const x = 370 + (i % 2) * 140, y = 110 + Math.floor(i / 2) * 70, a = 0.2 + i * 0.5; card(x + 50, y, 120, 46, { rx: 8, text: s, fs: 15, stroke: i === 3 ? GOOD : INK, color: i === 3 ? GOOD : INK, s: pop(u, a) }); });
      sub(500, 260, '운영팀 손을 거치지 않는다', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 8) { [['기본 폴링', '3분', 0.06, MUT], ['requeueAfterSeconds', '30초', 0.36, INFO], ['webhook', '즉시', 0, GOOD]].forEach(([a, b, sp, col], i) => { const y = 110 + i * 90;
        if (sp) clock(390, y, 26, (t * sp) % 1, col); else { el('circle', { cx: 390, cy: y, r: 26, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); check(390, y, 11, pop(u, 1.0)); } mono(430, y - 4, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.2 + i * 0.4) }); mono(430, y + 20, b, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) }); }); } }

  // ---------- 5. Matrix generator ----------
  const MA = ['us-east', 'eu-west', 'ap'], MB = [['blue', '3'], ['green', '3'], ['canary', '1']];
  function s5(t, c) { const { k, u } = c;
    const gx = 200, gy = 110, cw = 230, ch = 78;
    if (k === 8) { tx(480, 46, '5 클러스터 × 5 env × 10 서비스', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      const n = Math.round(250 * E(u, 0.2, 2.0));
      for (let i = 0; i < n; i++) { const x = 130 + (i % 25) * 28, y = 90 + Math.floor(i / 25) * 26; el('rect', { x, y, width: 20, height: 18, rx: 3, fill: i < 9 ? ACC : WARN, opacity: 0.8 }); }
      mono(480, 380, `${n} Application`, { 'font-size': 26, 'font-weight': 800, fill: n > 200 ? BAD : WARN, 'text-anchor': 'middle' });
      sub(480, 408, 'selector로 명단을 좁히고 progressive sync로 나눠 낸다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    appset(30, 8, 300, 40, 'web-matrix');
    const pr = k === 7;
    const A = pr ? ['PR ①', 'PR ②'] : MA, B = pr ? [['preview-1', ''], ['preview-2', '']] : MB;
    const showA = k >= 1, showB = k >= 2;
    // 축 머리
    A.forEach((a, i) => { if (!showA) return; const y = gy + i * ch + ch / 2;
      card(110, y, 150, 50, { rx: 8, text: a, fs: 15, mono: true, stroke: INFO, color: INFO, fill: INFOBG, s: k === 1 || pr ? pop(u, 0.2 + i * 0.25) : 1 }); });
    if (showA) tx(110, gy - 12, pr ? 'pullRequest · preview' : 'clusters · env-tier=prd', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
    B.forEach(([b, r], j) => { if (!showB) return; const x = gx + j * cw + cw / 2;
      card(x, gy - 30, 170, 40, { rx: 8, text: b + (k === 4 && r ? `  ×${r}` : ''), fs: 15, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: k === 2 || pr ? pop(u, 0.2 + j * 0.25) : 1 }); });
    if (k === 1) { counter(930, 60, '자식 수', 0, MUT); sub(560, 230, '명단 B를 기다린다', fade(u, 0.8)); return; }
    if (k === 0) { counter(930, 60, '자식 수', 0, MUT); sub(480, 230, 'generators를 담는 generator', fade(u, 0.5), { 'font-size': 15, 'font-weight': 700, fill: ACC }); return; }
    // 칸 채우기
    A.forEach((a, i) => B.forEach(([b, r], j) => { const x = gx + j * cw + 10, y = gy + i * ch + 8, idx = i * 3 + j;
      const on = k === 2 ? seg(u, 0.4 + idx * 0.17, 0.7 + idx * 0.17) : 1;
      const dim = k === 6 && i === 2, hl = k === 5 && i === 1 && j === 2;
      if (on <= 0) { el('rect', { x, y, width: cw - 20, height: ch - 16, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 4' }); return; }
      el('rect', { x, y, width: cw - 20, height: ch - 16, rx: 8, fill: hl ? ACCBG : PANEL, stroke: hl ? ACC : dim ? GRID : INK, 'stroke-width': hl ? 2.6 : 1.8, opacity: on * (dim ? 0.45 : 1) });
      const name = pr ? `${a} · ${b}` : `web-${a}-${b}`;
      if (k === 2) el('circle', { cx: x + (cw - 20) / 2, cy: y + (ch - 16) / 2, r: 9, fill: ACC, opacity: on });
      if (k >= 3) mono(x + (cw - 20) / 2, y + 26, name, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: hl ? ACC : INK, opacity: (k === 3 ? fade(u, 0.2 + idx * 0.12) : 1) * (dim ? 0.45 : 1) });
      if (k === 4) for (let p = 0; p < +r; p++) el('rect', { x: x + 14 + p * 22, y: y + 38, width: 16, height: 14, rx: 3, fill: INFO, opacity: fade(u, 0.6 + p * 0.2) });
      if (k === 4) mono(x + cw - 34, y + 50, 'overlays/' + b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      if (k === 5 || k === 6) mono(x + (cw - 20) / 2, y + 48, 'ns web-' + b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: dim ? 0.45 : 1 });
      if (pr && k === 7) mono(x + (cw - 20) / 2, y + 48, '미리보기 환경', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }));
    const total = A.length * B.length;
    counter(930, 60, '자식 수', k === 2 ? Math.min(9, Math.floor(seg(u, 0.4, 2.1) * 9.99)) : k === 6 ? '6 / 9' : total, ACC);
    if (k === 5) { grow(185, gy + ch * 1.5, gx + 2 * cw + 10, gy + ch * 1.5, E(u, 0.3, 1.0), INFO); grow(gx + 2 * cw + cw / 2, gy - 8, gx + 2 * cw + cw / 2, gy + ch + 8, E(u, 1.0, 1.6), GOOD);
      sub(480, 380, 'server ← 명단 A (클러스터)    namespace ← 명단 B', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 6) sub(gx + 1.5 * cw, 400, 'ap 줄 3개는 목록 아래에 이어진다', 1, { fill: MUT });
    if (k === 3) sub(480, 400, '두 축을 다 이름에 넣어야 겹치지 않는다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
    if (pr) { sub(480, 330, 'PR이 닫히면 그 줄이 통째로 회수된다', fade(u, 1.4), { fill: GOOD, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'ApplicationSet이 30개 YAML을 줄이는 방식은 무엇인가?',
      o: ['YAML 30개를 한 파일에 이어 붙인다', '양식(template) 하나와 명단(generator)을 따로 두고 명단 길이만큼 찍어 낸다', '환경 수를 1개로 줄인다'], a: 1,
      why: '30개 파일에서 실제로 다른 곳은 env와 path 두어 줄이었다. 다른 값만 명단에 모으면 양식은 한 벌이면 된다.' },
    { q: 'list generator에 qa element를 하나 더하면 무엇이 바뀌는가?',
      o: ['web-qa Application이 하나 더 생기고 template은 그대로다', 'template을 qa용으로 하나 더 써야 한다', '기존 web-dev가 web-qa로 이름이 바뀐다'], a: 0,
      why: '자식 수는 명단 길이가 정한다. elements 1줄 추가로 자식이 3개에서 4개가 된다.' },
    { q: 'cluster generator의 selector가 env: prd일 때 ArgoCD 자기 클러스터(in-cluster)가 명단에 안 드는 이유는?',
      o: ['in-cluster에는 기본적으로 cluster secret이 없어 라벨로 고를 수 없어서', 'in-cluster는 배포 대상이 될 수 없어서', 'in-cluster의 region 라벨이 sa-east라서'], a: 0,
      why: '라벨 selector는 cluster secret의 라벨을 본다. 기본 in-cluster는 secret이 없으니 selector를 비웠을 때만 명단에 든다.' },
    { q: 'git directories generator에서 envs/dev 폴더가 web-dev가 되는 이유는?',
      o: ['{{path}}가 dev만 돌려줘서', 'config.json에 name: web-dev가 적혀 있어서', '{{path.basename}}이 경로의 마지막 폴더 이름 dev를 돌려줘서'], a: 2,
      why: '{{path}}는 envs/dev 전체 경로이고, {{path.basename}}은 맨 오른쪽 폴더 이름이다. template의 web-{{path.basename}}이 web-dev가 된다.' },
    { q: 'matrix에서 template 이름을 web-{{name}}으로만 두면 어떻게 되는가?',
      o: ['같은 클러스터의 blue·green·canary 이름이 겹쳐 일부가 만들어지지 않는다', '9개 모두 정상으로 만들어진다', '자식이 3개로 줄어 클러스터당 하나만 남는다'], a: 0,
      why: '3 × 3 = 9개 조합 중 같은 클러스터 세 개가 같은 이름을 갖게 된다. 두 축을 다 이름에 넣어야 9개가 따로 선다.' },
  ];

  const summary = [
    '환경 3개에 서비스 10개면 거의 같은 자식 YAML이 30개 생기고, 실제로 다른 곳은 두어 줄이다.',
    'ApplicationSet은 양식 하나와 명단을 나눠 두고 명단 한 줄마다 Application을 하나 만든다.',
    '명단은 직접 적거나(list), 등록된 클러스터(clusters)나 Git 폴더(git)에서 가져온다.',
    'matrix는 두 명단을 곱하므로 3 × 3이면 9개다. 이름에 두 축을 다 넣고 selector로 범위를 좁힌다.',
  ];
  const review = [
    { q: '새 리전 sa-east-prd를 env=prd 라벨로 등록했는데 web-sa-east-prd가 생기지 않는다. 먼저 볼 것은?',
      o: ['matchExpressions의 region 목록에 sa-east가 있는지', 'template의 targetRevision', 'list generator의 elements'], a: 0,
      why: '페이지의 selector는 region이 us-east, eu-west, ap-northeast일 때만 통과시킨다. sa-east를 목록에 더해야 명단에 든다.' },
    { q: '팀이 envs/qa-team-a 폴더를 merge했는데 몇 분째 앱이 안 생긴다. 맞는 설명은?',
      o: ['git generator는 폴더 추가를 감지하지 못한다', '기본 폴링이 3분이라 기다리거나, webhook으로 바로 반영시킨다', 'exclude 규칙이 모든 폴더를 막고 있다'], a: 1,
      why: 'ApplicationSet 컨트롤러는 기본 3분마다 Git을 본다. requeueAfterSeconds로 줄이거나 webhook을 걸면 바로 반영된다.' },
    { q: 'matrix에 클러스터 1개를 더 등록했더니 Application이 한꺼번에 3개 늘었다. 왜인가?',
      o: ['클러스터마다 기본 앱 3개가 따라오는 규칙이 있어서', 'selector가 in-cluster까지 잡아서', '명단 B(blue·green·canary) 3개와 곱해지기 때문에'], a: 2,
      why: 'matrix 결과는 명단 A × 명단 B다. 클러스터 한 줄이 늘면 명단 B 길이만큼, 여기서는 3개가 늘어난다.' },
  ];

  R.page({ title: 'ApplicationSet 생성기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
