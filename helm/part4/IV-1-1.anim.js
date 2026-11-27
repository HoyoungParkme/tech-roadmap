/* IV-1-1 _helpers.tpl · define · include · nindent — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 렌더 결과(라벨 줄, 들여쓰기 칸, 에러 문구)는 페이지 코드(_helpers.tpl, deployment.yaml)를
 * Go 템플릿 규칙대로 python 으로 다시 렌더해 확인한 값이다. 릴리스 myrel · 차트 mychart 0.1.0 · appVersion "1.16.0"(helm create 기본). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  // 템플릿 한 줄 색칠: {{ }} 안의 함수·문자열·점
  const TT = /("[^"]*"|\{\{-?|-?\}\}|\|\s*nindent\s*\d+|\b(?:include|define|template|with|end|dict|default|printf)\b|\$\w*|\.[A-Z]\w*(?:\.\w+)*|(?<![\w"])\.(?![\w]))/;
  function tline(x, y, s, o) { o = o || {};
    const parts = s.split(TT).filter((p) => p !== '' && p !== undefined).map((p) => {
      if (/^"/.test(p)) return [p, { fill: ACC }];
      if (/^\{\{|\}\}$/.test(p)) return [p, { fill: MUT }];
      if (/^\|/.test(p)) return [p, { fill: WARN, 'font-weight': 700 }];
      if (/^(include|define|template|with|end|dict|default|printf)$/.test(p)) return [p, { fill: INFO, 'font-weight': 700 }];
      if (/^\$|^\.$/.test(p)) return [p, { fill: BAD, 'font-weight': 800 }];
      if (/^\./.test(p)) return [p, { fill: INK, 'font-weight': 700 }];
      return [p, {}]; });
    return R.spans(x, y, parts, { 'font-size': o.fs || 15, opacity: o.op ?? 1 }); }
  // 파일 아이콘 + 이름
  function file(x, y, name, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('path', { d: 'M-8,-11 h11 l5,5 v17 h-16 Z', fill: o.fill || PANEL, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round' }, g);
    mono(16, 5, name, { 'font-size': o.fs || 15, 'font-weight': o.fw || 600, fill: col, 'text-decoration': o.strike ? 'line-through' : null }, g); return g; }
  function folder(x, y, name, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('path', { d: 'M-10,-9 h7 l3,3 h10 v15 h-20 Z', fill: o.fill || SOFT, stroke: col, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    mono(16, 5, name, { 'font-size': 15, 'font-weight': 700, fill: col }, g); return g; }
  // 매니페스트 카드 (kind 이름)
  const manifest = (cx, cy, kind, s, o) => { o = o || {}; card(cx, cy, 170, 40, { rx: 6, s, stroke: o.stroke || ACC, fill: o.fill || ACCBG, text: kind, fs: 15, mono: true, color: o.color || ACC, op: o.op }); };
  // "." 컨텍스트 꾸러미
  const CTX = [['.Chart.Name', 'mychart'], ['.Chart.Version', '0.1.0'], ['.Chart.AppVersion', '"1.16.0"'], ['.Release.Name', 'myrel'], ['.Release.Service', 'Helm'], ['.Values.nameOverride', '""']];
  function ctxCard(x, y, o) { o = o || {}; const rh = o.rh || 34, rows = o.rows || CTX, w = o.w || 270;
    el('rect', { x, y, width: w, height: 34 + rh * rows.length, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 14, y + 23, o.title || '.  (현재 컨텍스트)', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: o.op ?? 1 });
    rows.forEach(([k, v], i) => { const yy = y + 34 + i * rh + rh / 2 + 5, hot = o.hot && o.hot.includes(i);
      if (hot) el('rect', { x: x + 6, y: yy - rh / 2 - 4, width: w - 12, height: rh - 4, rx: 5, fill: ACCBG });
      mono(x + 14, yy, k, { 'font-size': 13.5, fill: hot ? ACC : MUT, 'font-weight': hot ? 700 : 400, opacity: o.op ?? 1 });
      mono(x + w - 12, yy, v, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: hot ? ACC : INK, opacity: o.op ?? 1 }); });
    return (i) => [x + w, y + 34 + i * rh + rh / 2]; }
  const curve = (a, b, u, col, o) => { if (u <= 0) return; o = o || {}; const mx = (a[0] + b[0]) / 2;
    const p = el('path', { d: `M${a[0]},${a[1]} C${mx},${a[1]} ${mx},${b[1]} ${b[0]},${b[1]}`, fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, pathLength: 1 });
    if (!o.dash) { p.setAttribute('stroke-dasharray', '1 1'); p.setAttribute('stroke-dashoffset', String(1 - clamp(u))); } };

  // ---------- 1. 차트 뼈대와 밑줄 파일 ----------
  const TREE = [[0, 'mychart/', 'dir'], [1, 'Chart.yaml'], [1, 'values.yaml'], [1, 'templates/', 'dir'], [2, '_helpers.tpl'], [2, 'deployment.yaml'], [2, 'service.yaml'], [2, 'serviceaccount.yaml'], [2, 'NOTES.txt']];
  const TY = (i) => 66 + i * 38, TX = (d) => 54 + d * 30;
  const OUTS = [['Deployment', 5], ['Service', 6], ['ServiceAccount', 7]];
  function tree(c, show) { const { k, u } = c;
    TREE.forEach(([d, name, kind], i) => { const vis = show(i); if (vis <= 0 || (c.skip === i)) return;
      const helper = name === '_helpers.tpl', x = TX(d) + (1 - vis) * -18;
      if (d > 0) el('path', { d: `M${TX(d - 1)},${TY(i) - 24} V${TY(i)} H${TX(d) - 14}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: vis });
      if (kind === 'dir') folder(x, TY(i), name, { op: vis });
      else file(x, TY(i), name, { op: vis, col: helper ? MUT : INK, dash: helper ? '3 3' : null }); }); }
  function s1(t, c) { const { k, u } = c;
    const g0 = k === 0 ? (i) => (i <= 3 ? seg(u, 0.2 + i * 0.35, 0.5 + i * 0.35) : 0) : k === 1 ? (i) => (i <= 3 ? 1 : seg(u, 0.2 + (i - 4) * 0.25, 0.5 + (i - 4) * 0.25)) : () => 1;
    // templates/ 렌더 대상 영역
    const zop = k === 0 ? fade(u, 1.6) : 1;
    el('rect', { x: 66, y: TY(3) - 20, width: 270, height: TY(8) - TY(3) + 40, rx: 10, fill: ACCBG, opacity: 0.55 * zop });
    tree(k === 2 ? Object.assign({}, c, { skip: 4 }) : c, g0);
    if (k === 0) { sub(250, TY(1) + 5, '메타', fade(u, 0.7), { 'text-anchor': 'start' }); sub(250, TY(2) + 5, '기본 values', fade(u, 1.0), { 'text-anchor': 'start' });
      note(380, 210, 'templates/ 아래 파일이 렌더 대상', fade(u, 1.8), { fill: ACC }); grow(374, 204, 270, TY(3) + 2, E(u, 1.9, 2.4), ACC); return; }
    // 엔진과 출력
    const EX = 520, EY = 250;
    const eop = k === 3 ? 0.35 : 1;
    card(EX, EY, 120, 64, { rx: 14, stroke: INK, sw: 2.2, text: '템플릿\n엔진', fs: 15, op: eop });
    OUTS.forEach(([kind, row], i) => { const y = 180 + i * 56, s = k === 1 ? pop(u, 1.3 + i * 0.25) : 1;
      if (k === 1) { dot([[300, TY(row)], [EX - 60, EY], [EX + 60, EY], [690, y]], seg(u, 0.4 + i * 0.25, 1.4 + i * 0.25), ACC, 6); }
      manifest(790, y, kind, s, { op: eop }); });
    if (k <= 2) { sub(790, 370, 'NOTES.txt는 설치 후 안내 문구', k === 1 ? fade(u, 2.0) : 1, { 'font-size': 14 }); }
    // _helpers.tpl 은 엔진 앞에서 막힌다
    if (k === 1) { const f = seg(u, 0.5, 1.5); if (f > 0 && f < 1) dot([[260, TY(4)], [EX - 60, EY - 18]], f, MUT, 6);
      cross(EX - 86, EY - 26, 9, pop(u, 1.5)); note(370, 120, '_로 시작하면 출력하지 않는다', fade(u, 1.7), { fill: BAD }); }
    if (k === 2) { const RULES = [['*.yaml', '매니페스트로 출력', ACC], ['_*.tpl', '출력 없음 · define 보관', MUT], ['NOTES.txt', '설치 후 안내', INFO]];
      el('rect', { x: 600, y: 40, width: 340, height: 124, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      RULES.forEach(([a, b, col], i) => { const y = 72 + i * 34, op = fade(u, 0.3 + i * 0.4);
        mono(616, y, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); grow(712, y - 5, 744, y - 5, E(u, 0.4 + i * 0.4, 0.8 + i * 0.4), col);
        tx(752, y, b, { 'font-size': 14.5, 'font-weight': 600, opacity: op }); });
      // _helpers.tpl 을 고쳐도 매니페스트 수는 그대로
      const w = E(u, 1.6, 2.0); file(TX(2), TY(4), '_helpers.tpl', { col: WARN, s: 1 + bump(u, 1.6) });
      if (w > 0) { mono(410, 330, '매니페스트', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: w }); mono(410, 368, '3개', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: w }); }
      return; }
    if (k === 3) { const DEF = ['mychart.name', 'mychart.fullname', 'mychart.labels', 'mychart.selectorLabels'];
      el('rect', { x: 360, y: 40, width: 330, height: 40 + DEF.length * 34, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.2) });
      mono(376, 64, '_helpers.tpl 안', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.2) });
      curve([260, TY(4)], [360, 60], E(u, 0.2, 0.7), WARN);
      DEF.forEach((d, i) => { const y = 96 + i * 34; R.spans(380, y, [['define ', { fill: INFO, 'font-weight': 700 }], [`"${d}"`, { fill: ACC }]], { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.25) }); });
      [5, 6, 7].forEach((row, i) => curve([400 + i * 60, 216], [TX(2) + 16 + tw(TREE[row][1], 15) * 0.92 + 10, TY(row)], E(u, 1.6 + i * 0.2, 2.2 + i * 0.2), INFO, { dash: '5 4', op: E(u, 1.6 + i * 0.2, 2.2 + i * 0.2) }));
      note(380, 330, 'include로 꺼내 쓴다', fade(u, 2.1), { fill: INFO }); } }

  // ---------- 2. define 보관함 ----------
  const SLOT = [
    ['mychart.name', 'default .Chart.Name .Values.nameOverride', 'mychart', [0, 5]],
    ['mychart.fullname', 'printf "%s-%s" .Release.Name (include name)', 'myrel-mychart', [3]],
    ['mychart.labels', 'chart · (selectorLabels) · version · managed-by', '4줄 블록', [1, 2, 4]],
    ['mychart.selectorLabels', 'name: (include name) · instance: .Release.Name', '2줄 블록', [3]],
  ];
  const SY = (i) => 66 + i * 84;
  function s2(t, c) { const { k, u } = c;
    const port = ctxCard(30, 50, { hot: SLOT[k][3], rh: 36 });
    SLOT.forEach(([name, body, val, refs], i) => { if (i > k) { el('rect', { x: 360, y: SY(i) - 30, width: 530, height: 70, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }); return; }
      const cur = i === k, s = cur ? E(u, 0.1, 0.6) : 1, x = 360 + (1 - s) * 80;
      el('rect', { x, y: SY(i) - 30, width: 530, height: 70, rx: 10, fill: cur ? PANEL : SOFT, stroke: cur ? ACC : GRID, 'stroke-width': cur ? 2.4 : 1.5, opacity: s });
      R.spans(x + 16, SY(i) - 6, [['define ', { fill: INFO, 'font-weight': 700 }], [`"${name}"`, { fill: ACC, 'font-weight': 700 }]], { 'font-size': 15, opacity: s });
      mono(x + 16, SY(i) + 22, body, { 'font-size': 13.5, fill: MUT, opacity: s });
      const vop = cur ? fade(u, 1.7) : 1;
      if (val) { el('rect', { x: x + 380, y: SY(i) - 22, width: 136, height: 30, rx: 6, fill: cur ? ACCBG : PANEL, stroke: cur ? ACC : GRID, 'stroke-width': 1.5, opacity: vop });
        mono(x + 448, SY(i) - 2, val, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: cur ? ACC : INK, opacity: vop }); }
      if (cur) refs.forEach((r, j) => curve(port(r), [360, SY(i) - 4 + j * 8], E(u, 0.6 + j * 0.2, 1.3 + j * 0.2), ACC)); });
    // 조각이 조각을 부른다
    if (k === 0) { const d = E(u, 1.0, 1.5); el('line', { x1: 52, y1: 50 + 34 + 5 * 36 + 18, x2: lerp(52, 262, d), y2: 50 + 34 + 5 * 36 + 18, stroke: BAD, 'stroke-width': 2, opacity: d });
      sub(150, 330, '"" 는 비어 있어 default가 .Chart.Name을 고른다', fade(u, 1.3), { 'font-size': 13.5, 'text-anchor': 'start', x: 34 }); }
    if (k === 1 || k === 3) { const f = E(u, 1.0, 1.6), from = [890, SY(0) + 4], to = [890, SY(k) - 4];
      el('path', { d: `M${from[0]},${from[1]} C${from[0] + 26},${from[1]} ${to[0] + 26},${to[1]} ${to[0]},${to[1]}`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: f });
      mono(936, (SY(0) + SY(k)) / 2, 'include', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: f, transform: `rotate(-90 936 ${(SY(0) + SY(k)) / 2})` }); }
    if (k === 3) { const f = E(u, 1.8, 2.3); el('path', { d: `M360,${SY(3) - 14} C330,${SY(3) - 14} 330,${SY(2) + 10} 360,${SY(2) + 10}`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: f }); }
    // 출력 줄 수는 끝까지 0
    el('rect', { x: 30, y: 352, width: 270, height: 50, rx: 10, fill: SOFT, stroke: 'none' });
    tx(46, 383, '렌더 출력', { 'font-size': 15, fill: MUT, 'font-weight': 600 });
    mono(284, 386, '0줄', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'end', fill: INK }); }

  // ---------- 3. include · template · 스코프 ----------
  const LAB5 = ['helm.sh/chart: mychart-0.1.0', 'app.kubernetes.io/name: mychart', 'app.kubernetes.io/instance: myrel', 'app.kubernetes.io/version: "1.16.0"', 'app.kubernetes.io/managed-by: Helm'];
  function errBox(cx, cy, title, msg, s) { card(cx, cy, Math.max(300, tw(msg, 13.5) + 40), 70, { rx: 10, stroke: BAD, fill: BADBG, sw: 2.2, s });
    tx(cx, cy - 8, title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: s > 0.5 ? 1 : 0 });
    mono(cx, cy + 18, msg, { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, opacity: s > 0.5 ? 1 : 0 }); }
  function defBox(cx, cy, name, o) { o = o || {}; card(cx, cy, o.w || 230, 54, { rx: 10, stroke: INFO, fill: INFOBG, sw: 2, s: o.s, text: name, fs: 15, mono: true, color: INFO }); }
  function s3(t, c) { const { k, u } = c;
    const TOP = ['{{- include "mychart.labels" . | nindent 4 }}', '{{ template "mychart.labels" . | nindent 4 }}', '{{ include "mychart.name" . }}', '{{ include "mychart.name" }}',
      '{{ include "mychart.labels" (dict "Chart" .Chart "Release" .Release "Values" .Values) }}', '{{- with .Values.image }}{{ include "mychart.fullname" $ }}{{ end }}'][k];
    el('rect', { x: 20, y: 22, width: 920, height: 46, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tline(36, 52, TOP, { fs: k === 4 ? 14 : 15.5, op: fade(u, 0.1, 0.3) });
    if (k === 0) { defBox(150, 170, 'mychart.labels', { s: pop(u, 0.2) });
      const f = E(u, 0.7, 1.3), px = lerp(150, 380, f);
      el('rect', { x: px - 70, y: 210, width: 140, height: 96, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 1.6, opacity: fade(u, 0.6) });
      for (let i = 0; i < 5; i++) el('line', { x1: px - 58, y1: 226 + i * 16, x2: px - 58 + [96, 104, 108, 112, 100][i], y2: 226 + i * 16, stroke: INK, 'stroke-width': 3, opacity: fade(u, 0.6) });
      sub(380, 330, 'include 결과 = 문자열', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      // 파이프 관
      el('rect', { x: 470, y: 238, width: 130, height: 40, rx: 20, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.2) });
      mono(535, 263, '| nindent 4', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      const g = E(u, 1.6, 2.4);
      mono(650, 140, 'metadata:', { 'font-size': 15, opacity: fade(u, 1.5) }); mono(650, 162, '  labels:', { 'font-size': 15, opacity: fade(u, 1.5) });
      LAB5.forEach((l, i) => mono(650 + 36 * g, 184 + i * 22, l, { 'font-size': 13.5, fill: ACC, opacity: g }));
      if (g > 0.2) { el('rect', { x: 650, y: 172, width: 36 * g - 2, height: 110, fill: WARNBG, opacity: 0.8 }); mono(650, 304, '4칸', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: g }); }
      return; }
    if (k === 1) { defBox(150, 170, 'mychart.labels', { s: pop(u, 0.2) });
      // 파이프가 . 쪽에 걸린다
      const a = fade(u, 0.6); el('path', { d: 'M318,72 C318,110 400,110 400,72', fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: a });
      sub(358, 122, '파이프는 . 에 걸린다', a, { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
      grow(150, 200, 150, 300, E(u, 0.9, 1.4), INK);
      sub(150, 324, '출력은 그 자리에 바로', fade(u, 1.3), { 'font-size': 14.5 });
      card(560, 210, 150, 44, { rx: 8, stroke: INK, text: '.  → nindent', fs: 15, mono: true, s: pop(u, 1.4) });
      errBox(560, 300, '렌더 에러', 'wrong type for value; expected string', pop(u, 1.9));
      tx(780, 200, '출력을 파이프로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); tx(780, 224, '넘길 수 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    if (k === 2) { const port = ctxCard(30, 92, { rows: CTX.slice(0, 5), hot: [0], rh: 32 });
      defBox(560, 200, 'mychart.name', { s: pop(u, 0.3) });
      const f = E(u, 0.6, 1.6); el('rect', { x: lerp(300, 440, f), y: 186, width: 22, height: 28, rx: 4, fill: BAD, opacity: 0.85 * (f < 1 ? 1 : 0) });
      curve(port(0), [445, 200], E(u, 0.5, 1.4), ACC);
      grow(675, 200, 760, 200, E(u, 1.6, 2.0), ACC);
      card(840, 200, 140, 46, { rx: 8, stroke: ACC, fill: ACCBG, text: 'mychart', fs: 17, mono: true, color: ACC, s: pop(u, 2.0) });
      sub(560, 260, '. 를 통째로 넘겨야 조각이 .Chart를 읽는다', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { tx(60, 130, 'include의 자리', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      [['이름', '"mychart.name"', 1], ['스코프', '(없음)', 0]].forEach(([h, v, ok], i) => { const x = 60 + i * 260, s = pop(u, 0.3 + i * 0.4);
        card(x + 110, 190, 220, 64, { rx: 10, stroke: ok ? ACC : BAD, sw: 2.2, dash: ok ? null : '6 5', fill: ok ? ACCBG : PANEL, s });
        tx(x + 20, 182, h, { 'font-size': 14, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); mono(x + 20, 208, v, { 'font-size': 15, 'font-weight': 700, fill: ok ? ACC : BAD, opacity: s > 0.5 ? 1 : 0 }); });
      errBox(320, 320, '렌더가 멈춘다', 'wrong number of args for include: want 2 got 1', pop(u, 1.4));
      note(640, 190, '조용히 비는 게 아니라', fade(u, 2.0)); note(640, 216, 'helm template에서 바로 드러난다', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 4) { const KEYS = [['Chart', '.Chart'], ['Release', '.Release'], ['Values', '.Values']];
      el('rect', { x: 330, y: 110, width: 210, height: 150, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      mono(346, 134, 'dict', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      KEYS.forEach(([kk, v], i) => { const f = E(u, 0.3 + i * 0.4, 0.8 + i * 0.4), y = 166 + i * 32;
        if (f < 1) fly(80, y, 360, y, f, kk, { mono: true, fill: i === 2 ? WARN : ACC });
        else mono(350, y + 5, `"${kk}" ${v}`, { 'font-size': 14.5, 'font-weight': 700, fill: i === 2 ? WARN : INK }); });
      defBox(700, 185, 'mychart.labels', { s: pop(u, 1.6) }); grow(540, 185, 582, 185, E(u, 1.7, 2.0), ACC);
      sub(700, 236, '→ 라벨 5줄', fade(u, 2.0), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      card(250, 340, 420, 50, { rx: 10, stroke: BAD, fill: BADBG, sw: 1.8, s: pop(u, 2.2) });
      tx(56, 346, 'Values를 빼면', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); mono(170, 346, 'nil pointer … .nameOverride', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.3) });
      card(750, 340, 260, 50, { rx: 10, stroke: INFO, s: pop(u, 2.4) }); mono(750, 345, '$labels := include …', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 2.5) });
      return; }
    // k5: with 안의 점
    el('rect', { x: 40, y: 96, width: 880, height: 290, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' });
    mono(56, 120, '$  = 루트 (.Chart · .Release · .Values)', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
    const w = E(u, 0.5, 1.1);
    el('rect', { x: 70, y: 140, width: lerp(820, 380, w), height: 220, rx: 12, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.4) });
    mono(86, 164, 'with .Values.image', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
    mono(86, 190, '.  = image 값', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
    mono(86, 212, '(repository · tag만 있다)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) });
    const lanes = [['include "mychart.fullname" .', BAD, 'nil pointer … .Name', 0], ['include "mychart.fullname" $', GOOD, 'myrel-mychart', 1]];
    lanes.forEach(([call, col, out, ok], i) => { const y = 260 + i * 56, at = 1.2 + i * 0.6;
      mono(90, y, call, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, at) });
      grow(400, y - 5, 560, y - 5, E(u, at + 0.2, at + 0.6), col);
      card(700, y - 5, 240, 40, { rx: 8, stroke: col, fill: ok ? GOODBG : BADBG, text: out, fs: 14.5, mono: true, color: col, s: pop(u, at + 0.6) }); }); }

  // ---------- 4. nindent 와 들여쓰기 칸 ----------
  const CW = 10.2, RX = 470;
  const FRAG = [
    { tpl: '    {{- include "mychart.labels" . | nindent 4 }}', ctx: [[0, 'metadata:'], [2, 'name: myrel-mychart'], [2, 'labels:']], ins: LAB5, n: 4 },
    { tpl: '      {{- include "mychart.selectorLabels" . | nindent 6 }}', ctx: [[0, 'spec:'], [2, 'replicas: 1'], [2, 'selector:'], [4, 'matchLabels:']], ins: LAB5.slice(1, 3), n: 6 },
    { tpl: '        {{- include "mychart.selectorLabels" . | nindent 8 }}', ctx: [[2, 'template:'], [4, 'metadata:'], [6, 'labels:']], ins: LAB5.slice(1, 3), n: 8 },
  ];
  function ruler(y, top) { for (let n = 0; n <= 12; n += 2) { const x = RX + n * CW;
      el('line', { x1: x, y1: y, x2: x, y2: top, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '2 4' }); mono(x, y - 6, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { const F = FRAG[k];
      el('rect', { x: 20, y: 22, width: 920, height: 46, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); tline(36, 52, F.tpl.trim(), { fs: 15.5 });
      ruler(104, 380);
      tx(40, 110, 'include 결과 (0칸)', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      const g = E(u, 1.0, 1.9);
      F.ctx.forEach(([d, s], i) => mono(RX + d * CW, 136 + i * 26, s, { 'font-size': 15, fill: INK, opacity: fade(u, 0.2 + i * 0.15) }));
      const y0 = 136 + F.ctx.length * 26;
      F.ins.forEach((s, i) => { const fy = 136 + i * 26;
        mono(40, fy, s, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) * (1 - g) + 0.35 * g });
        mono(lerp(RX, RX + F.n * CW, g), lerp(fy, y0 + i * 26, E(u, 0.8, 1.2)), s, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) }); });
      if (g > 0.1) { el('rect', { x: RX + 1, y: y0 - 18, width: F.n * CW * g - 2, height: F.ins.length * 26 + 4, fill: WARNBG, opacity: 0.85 });
        mono(RX + F.n * CW / 2, y0 + F.ins.length * 26 + 18, `${F.n}칸`, { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: g }); }
      sub(160, 380, 'nindent = 앞에 줄바꿈 + 모든 줄 n칸', fade(u, 2.0), { 'font-size': 14.5 });
      if (k === 2) { const ok = fade(u, 2.2); pill(770, 380, 'selector = Pod 라벨', GOOD, ok, { fs: 14 }); check(660, 380, 9, ok); }
      return; }
    if (k === 3) { // 골격은 조각, 값은 values
      el('rect', { x: 40, y: 60, width: 300, height: 130, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2 });
      mono(56, 86, 'values.yaml (예시 값)', { 'font-size': 14, 'font-weight': 700, fill: INFO });
      [['image:', 0], ['repository: nginx', 2], ['tag: "1.16.0"', 2]].forEach(([s, d], i) => mono(56 + d * CW, 118 + i * 24, s, { 'font-size': 14.5, opacity: fade(u, 0.2 + i * 0.2) }));
      const L = [[6, 'containers:', INK], [8, '- name: mychart', INK], [10, 'image: "nginx:1.16.0"', ACC]];
      ruler(250, 400);
      L.forEach(([d, s, col], i) => mono(RX + d * CW, 290 + i * 34, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.6 + i * 0.3) }));
      curve([340, 142], [RX + 10 * CW - 6, 358], E(u, 1.4, 2.1), INFO);
      note(500, 120, '골격 = _helpers.tpl · 템플릿', fade(u, 1.6)); note(500, 150, '값 = values.yaml', fade(u, 1.9), { fill: INFO });
      sub(RX + 8 * CW + 180, 324, '.Chart.Name', fade(u, 1.2), { 'text-anchor': 'start', class: 'mono' }); return; }
    // k4: 들여쓰기 지도
    const MAP = [[0], [0], [0], [2], [2], [4, 'L'], [4, 'L'], [4, 'S'], [4, 'S'], [4, 'L'], [4, 'L'], [0], [2], [2], [4], [6, 'S'], [6, 'S'], [2], [4], [6], [8, 'S'], [8, 'S'], [4], [6]];
    const ty = (i) => 40 + i * 14.5;
    tx(40, 30, 'deployment.yaml 렌더 결과 — 줄마다 들여쓰기만', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    const hl = E(u, 0.8, 1.3), pulse = 1 + bump(u, 2.0);
    MAP.forEach(([d, kind], i) => { const x = 60 + d * 14, w = 160 - d * 6, col = kind === 'S' ? ACC : kind === 'L' ? WARN : OFF;
      el('rect', { x, y: ty(i), width: w * E(u, 0.1 + i * 0.02, 0.5 + i * 0.02), height: 9, rx: 3, fill: kind ? col : OFF, opacity: kind ? 0.35 + 0.65 * hl : 0.7 }); });
    [[6, 10.3, '4칸 · labels', WARN], [15, 16, '6칸 · selectorLabels', ACC], [20, 21, '8칸 · selectorLabels', ACC]].forEach(([a, b, s, col], i) => { const y = (ty(a) + ty(b) + 9) / 2;
      grow(270, y, 340, y, E(u, 0.9 + i * 0.25, 1.3 + i * 0.25), col, { plain: true }); tx(350, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.25) }); });
    card(750, 200, 230, 90, { rx: 12, stroke: WARN, sw: 2.4, s: pulse * pop(u, 1.6) }); file(668, 186, '_helpers.tpl', { col: WARN, op: fade(u, 1.7) });
    tx(750, 226, '고칠 곳은 여기 한 곳', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    [[ty(8), WARN], [ty(16), ACC], [ty(21), ACC]].forEach(([y, col], i) => curve([635, 200], [560, y + 4], E(u, 2.0 + i * 0.1, 2.5 + i * 0.1), col, { dash: '5 4', op: 0.9 })); }

  // ---------- 5. 표준 조각과 렌더 확인 ----------
  function nest(cx, cy, outer, inner, u0, u, o) { o = o || {}; const s = E(u, u0, u0 + 0.6), si = E(u, u0 + 0.6, u0 + 1.2);
    el('rect', { x: cx - 190, y: cy - 90, width: 380, height: 180, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 2.4, opacity: s });
    mono(cx - 172, cy - 62, outer, { 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: s });
    (o.lines || []).forEach((l, i) => mono(cx - 172, cy - 34 + i * 22, l, { 'font-size': 13.5, fill: MUT, opacity: s }));
    el('rect', { x: cx - 160, y: cy + 4, width: 320, height: 66, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.2, opacity: si });
    mono(cx - 144, cy + 30, inner, { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: si });
    mono(cx - 144, cy + 54, o.innerLine || '', { 'font-size': 13.5, fill: MUT, opacity: si });
    lbl(cx, cy + 116, o.tag || '', fade(u, u0 + 1.3), { fill: INK }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const show0 = k === 0 ? 0.2 : -9, show1 = k === 1 ? 0.2 : -9;
      nest(250, 170, 'mychart.labels', 'mychart.selectorLabels', show0, k === 0 ? u : 3, { lines: ['helm.sh/chart · version · managed-by'], innerLine: 'name · instance', tag: '라벨 계층' });
      if (k === 1) nest(700, 170, 'mychart.fullname', 'mychart.name', show1, u, { lines: ['.Release.Name + "-" + …'], innerLine: 'default .Chart.Name …', tag: '이름 계층' });
      else { el('rect', { x: 510, y: 80, width: 380, height: 180, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }); }
      sub(480, 380, '안쪽 부품을 바깥 조각이 include로 감싼다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 2) { const COLS = ['fullname', 'labels', 'selectorLabels'], ROWS = [['deployment.yaml', [1, 1, 1]], ['service.yaml', [1, 1, 1]], ['serviceaccount.yaml', [1, 1, 0]]];
      file(60, 60, '_helpers.tpl', { col: WARN }); tx(220, 65, '한 곳에서 정의', { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
      COLS.forEach((h, j) => mono(420 + j * 170, 120, h, { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
      let n = 0; ROWS.forEach(([f, cells], i) => { const y = 170 + i * 62; file(70, y, f, { op: fade(u, 0.2 + i * 0.2) });
        cells.forEach((on, j) => { const at = 0.5 + (i * 3 + j) * 0.15, s = pop(u, at);
          el('rect', { x: 420 + j * 170 - 60, y: y - 22, width: 120, height: 44, rx: 8, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': 1.6, opacity: s > 0.5 ? 1 : 0.3 });
          if (on) { check(420 + j * 170, y, 10, s); if (u > at + 0.2) n++; } else mono(420 + j * 170, y + 5, '—', { 'font-size': 15, fill: OFF, 'text-anchor': 'middle' }); }); });
      tx(60, 380, '여러 곳에서 소비', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      mono(900, 380, `${Math.min(8, n)}곳 사용`, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.0) }); return; }
    const LINES = ['$ helm template myrel ./mychart | grep -A5 "labels:"', '  labels:'].concat(LAB5.map((l) => '    ' + l));
    const shown = k === 3 ? lerp(0, 1, E(u, 0.2, 1.8)) : 1 + lerp(1, 6, E(u, 0.2, 1.8));
    terminal(30, 40, 640, 300, LINES, shown, { title: 'helm template', lh: 34, fs: 14.5 });
    if (k === 3) { note(700, 120, '설치 전에', fade(u, 1.6)); note(700, 148, '렌더 결과만 본다', fade(u, 1.8)); sub(800, 200, '클러스터에 아무것도 안 보낸다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // 줄마다 어느 조각에서 왔나
    const SRC = [['labels', WARN, 0, 0], ['selectorLabels', ACC, 1, 2], ['labels', WARN, 3, 4]];
    SRC.forEach(([s, col, a, b], i) => { const y0 = 40 + 44 + (a + 1) * 34 - 18, y1 = 40 + 44 + (b + 1) * 34 + 2, op = fade(u, 1.2 + i * 0.3);
      el('path', { d: `M684,${y0} h10 V${y1} h-10`, fill: 'none', stroke: col, 'stroke-width': 2.4, opacity: op });
      mono(704, (y0 + y1) / 2 + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op }); });
    mono(350, 372, '라벨 5줄 · 모든 매니페스트에 같게', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) });
    sub(480, 404, 'helm create 조각은 6개 (chart · serviceAccountName 포함)', fade(u, 2.3), { 'font-size': 13.5 }); }

  const quiz = [
    { q: 'templates/ 안의 _helpers.tpl이 매니페스트로 출력되지 않는 이유는 무엇인가?',
      o: ['확장자가 .yaml이 아니어서', '파일 이름이 밑줄(_)로 시작해서', 'NOTES.txt처럼 안내 문구로 취급돼서'], a: 1,
      why: '밑줄로 시작하는 파일은 Helm이 렌더 출력에서 뺀다. 그래서 _helpers.tpl을 고쳐도 매니페스트는 Deployment·Service·ServiceAccount 3개 그대로다.' },
    { q: '_helpers.tpl에 define 블록을 네 개 써 두기만 하면 렌더 결과는 어떻게 되는가?',
      o: ['조각마다 매니페스트가 하나씩 생긴다', '아무 줄도 출력되지 않는다', 'labels 조각만 자동으로 붙는다'], a: 1,
      why: 'define은 이름 붙은 조각을 보관만 한다. include로 부르기 전까지 출력은 0줄이다.' },
    { q: 'with .Values.image 블록 안에서 include "mychart.fullname"에 넘겨야 하는 값은 무엇인가?',
      o: ['. (점)', '$', '.Values.image'], a: 1,
      why: 'with 안에서는 점이 image 값으로 바뀌어 조각이 .Chart를 찾지 못한다. $는 어디서든 루트 컨텍스트를 가리켜 myrel-mychart가 나온다.' },
    { q: 'matchLabels 아래에 selectorLabels를 넣을 때 nindent 6을 쓰는 까닭은 무엇인가?',
      o: ['matchLabels 키가 4칸에 있어 그 아래 값은 6칸이어야 해서', '조각 안 줄 수가 6줄이라서', 'indent 6과 결과가 완전히 같아서'], a: 0,
      why: 'YAML은 들여쓰기가 구조다. nindent n은 앞에 줄바꿈을 넣고 모든 줄을 n칸 밀어 부모 키 아래에 맞춘다.' },
    { q: 'helm create 차트를 helm template으로 렌더하면 labels 아래에 찍히는 줄 수는 몇 줄인가?',
      o: ['4줄', '5줄', '2줄'], a: 1,
      why: 'chart, name, instance, version, managed-by 다섯 줄이다. name과 instance는 labels 안에서 include한 selectorLabels가 넣는다.' },
  ];

  const summary = [
    'templates/ 안에서 밑줄로 시작하는 파일은 출력되지 않아 조각을 모아 두는 곳이 된다.',
    'define으로 이름 붙인 조각은 include "이름" .으로 불러야 비로소 출력된다.',
    'include는 인자 두 개를 받고, with·range 안에서는 점 대신 $를 넘긴다.',
    'nindent n은 줄을 바꾸고 모든 줄을 n칸 밀어 같은 조각을 4·6·8칸 자리에 끼운다.',
  ];
  const review = [
    { q: 'service.yaml에서 labels 조각을 template으로 부르고 | nindent 4를 붙였더니 렌더가 실패했다. 먼저 고칠 것은?',
      o: ['nindent 숫자를 2로 줄인다', 'template을 include로 바꾼다', '_helpers.tpl 이름에서 밑줄을 뺀다'], a: 1,
      why: 'template은 출력을 파이프로 넘기지 못해 | nindent가 넘기는 값(.)에 걸린다. 결과를 문자열로 돌려주는 include로 바꾸면 들여쓰기를 붙일 수 있다.' },
    { q: 'dict "Chart" .Chart "Release" .Release로 스코프를 만들어 labels 조각을 불렀더니 nil pointer 에러가 났다. 원인은?',
      o: ['조각 속 mychart.name이 읽는 .Values가 dict에 없다', 'dict는 include에 넘길 수 없다', 'Release 키 이름은 소문자여야 한다'], a: 0,
      why: 'labels는 selectorLabels를, selectorLabels는 name을 부르고 name은 .Values.nameOverride를 읽는다. 조각 계층이 읽는 키는 dict에 모두 넣어야 한다.' },
    { q: '팀 라벨 한 줄을 Deployment·Service·ServiceAccount에 모두 붙이려 한다. 가장 적은 수정은?',
      o: ['세 매니페스트 파일에 같은 줄을 각각 쓴다', 'values.yaml에 라벨 세 벌을 둔다', '_helpers.tpl의 mychart.labels 조각에 한 줄을 더한다'], a: 2,
      why: '세 매니페스트가 모두 mychart.labels를 include하므로 그 조각 하나만 고치면 된다. 정의는 한 곳, 소비는 여러 곳이다.' },
  ];

  R.page({ title: '_helpers.tpl 렌더 과정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
