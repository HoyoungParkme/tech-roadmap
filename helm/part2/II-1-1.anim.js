/* II-1-1 Go 템플릿 문법 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 도우미 ----------
  // 종이(파일) 한 장
  function paper(x, y, w, h, title, o) { o = o || {};
    el('path', { d: `M${x},${y} h${w - 22} l22,22 v${h - 22} h${-w} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round', opacity: o.op ?? 1 });
    el('path', { d: `M${x + w - 22},${y} v22 h22`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    mono(x + 14, y + 21, title, { 'font-size': 13.5, 'font-weight': 800, fill: o.tcol || MUT, opacity: o.op ?? 1 }); }
  // 템플릿 한 줄: {{ … }} 부분은 액션 색. 돌려줌: 액션 조각 [{x0, x1, cx}]
  function tpl(x, y, s, o) { o = o || {}; const fs = o.fs || 14, op = o.op ?? 1, hi = o.hi ?? 1, segs = []; let cx = x;
    String(s).split(/(\{\{.*?\}\})/).forEach((p) => { if (!p) return; const w = tw(p, fs), act = /^\{\{/.test(p);
      if (act) { if (hi > 0) el('rect', { x: cx - 2, y: y - fs + 1, width: w + 4, height: fs + 7, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.4, opacity: op * hi });
        segs.push({ x0: cx, x1: cx + w, cx: cx + w / 2 }); }
      mono(cx, y, p, { 'font-size': fs, fill: act ? (o.act || ACC) : (o.col || INK), 'font-weight': act ? 700 : 400, opacity: op, textLength: w, lengthAdjust: 'spacing' }); cx += w; });
    return segs; }
  // 렌더된 한 줄: parts = [[글, 값이면 true]]
  function out(x, y, parts, o) { o = o || {}; const fs = o.fs || 14; let cx = x;
    parts.forEach(([p, v]) => { const w = tw(p, fs); mono(cx, y, p, { 'font-size': fs, fill: v ? (o.vcol || ACC) : (o.col || INK), 'font-weight': v ? 800 : 400, opacity: o.op ?? 1, textLength: w, lengthAdjust: 'spacing' }); cx += w; }); }
  // 글자를 한 칸씩: 공백은 ·, 줄바꿈은 ↵ (o.st(i, ch) → {fill, op, strike, bg})
  function chars(x, y, s, o) { o = o || {}; const fs = o.fs || 15, cw = fs * 0.6, lh = o.lh || fs + 11; let col = 0, row = 0;
    [...s].forEach((ch, i) => { const st = (o.st && o.st(i, ch)) || {}, px = x + col * cw, py = y + row * lh, ws = ch === ' ' || ch === '\n';
      if (st.bg) el('rect', { x: px, y: py - fs + 1, width: cw, height: fs + 6, fill: st.bg, opacity: st.op ?? 1 });
      tx(px + cw / 2, py, ch === ' ' ? '·' : ch === '\n' ? '↵' : ch, { 'text-anchor': 'middle', 'font-size': ch === '\n' ? fs * 0.9 : fs, class: 'mono', fill: st.fill || (ws ? OFF : INK), 'font-weight': st.fw || (ws ? 700 : 400), opacity: st.op ?? 1 });
      if (st.strike) el('line', { x1: px + 1, y1: py - fs * 0.3, x2: px + 1 + (cw - 2) * st.strike, y2: py - fs * 0.3, stroke: BAD, 'stroke-width': 2.2 });
      if (ch === '\n' && !o.inline) { row++; col = 0; } else col++; });
    return { cw, lh }; }
  // {{- 앞, -}} 뒤에서 먹히는 공백 구간 [시작, 끝) 목록 (나오는 순서대로)
  function eaten(s) { const r = [];
    for (let i = s.indexOf('{{- '); i >= 0; i = s.indexOf('{{- ', i + 1)) { let a = i; while (a > 0 && /\s/.test(s[a - 1])) a--; if (a < i) r.push([a, i]); }
    for (let i = s.indexOf(' -}}'); i >= 0; i = s.indexOf(' -}}', i + 1)) { let b = i + 4; while (b < s.length && /\s/.test(s[b])) b++; if (b > i + 4) r.push([i + 4, b]); }
    return r.sort((p, q) => p[0] - q[0]); }
  const inAct = (s, i) => { const re = /\{\{.*?\}\}/g; let m; while ((m = re.exec(s))) if (i >= m.index && i < m.index + m[0].length) return true; return false; };
  // 값 상자 (values 나 변수)
  function slotBox(cx, cy, w, name, val, o) { o = o || {}; const col = o.col || INFO;
    card(cx, cy, w, 50, { rx: 10, stroke: col, sw: 2.2, fill: o.fill || PANEL, s: o.s, op: o.op });
    mono(cx - w / 2 + 12, cy - 31, name, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: o.op ?? 1 });
    if (val != null) mono(cx, cy + 6, val, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: o.vcol || INK, opacity: o.vop ?? (o.op ?? 1) }); }
  // 파이프 위 함수 상자
  function fnBox(cx, cy, s, o) { o = o || {}; card(cx, cy, tw(s, 14) + 30, 42, { rx: 8, text: s, fs: 14, mono: true, fw: 800, stroke: o.col || ACC, color: o.col || ACC, fill: o.fill || ACCBG, s: o.s }); }
  function tube(x1, x2, y, u) { if (u <= 0) return; el('line', { x1, y1: y, x2: lerp(x1, x2, clamp(u)), y2: y, stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' }); }
  function capsule(cx, cy, s, o) { o = o || {}; const w = tw(s, 14) + 24; card(cx, cy, w, 30, { rx: 15, text: s, fs: 14, mono: true, fw: 800, fill: o.fill || PANEL, stroke: o.col || INK, color: o.col || INK, dash: o.dash, s: o.s, op: o.op }); }
  function tag(cx, cy, s, col, o) { o = o || {}; mono(cx, cy, s, { 'font-size': 13.5, 'font-weight': 700, fill: col || MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }

  // ---------- 1. 액션 구분자 ----------
  const TL = ['apiVersion: apps/v1', 'kind: Deployment', 'metadata:', '  name: {{ .Release.Name }}-web', 'spec:', '  replicas: {{ .Values.replicaCount }}',
    '  image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"'];
  const RL = [[['apiVersion: apps/v1']], [['kind: Deployment']], [['metadata:']], [['  name: '], ['my-app', 1], ['-web']], [['spec:']], [['  replicas: '], ['3', 1]],
    [['  image: "'], ['nginx', 1], [':'], ['1.27', 1], ['"']]];
  const DONE = [[], [0, 1, 2, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 6], [0, 1, 2, 3, 4, 5, 6]];
  const LY = (i) => 68 + i * 21;
  function s1(t, c) { const { k, u } = c, done = DONE[k], fresh = done.filter((i) => !(DONE[k - 1] || []).includes(i));
    paper(20, 20, 548, 196, 'templates/deployment.yaml'); paper(612, 20, 328, 196, 'rendered manifest', { tcol: ACC });
    grow(574, 118, 606, 118, k === 0 ? E(u, 0.3, 0.8) : 1, ACC);
    const segs = TL.map((s, i) => tpl(34, LY(i), s, { fs: 13.5, hi: k === 0 ? pop(u, 0.3 + i * 0.12) : 1, op: k === 1 && !/\{\{/.test(s) ? 1 : 1 }));
    // 렌더 결과: 이전 beat 까지는 보이고, 이번 beat 에 새로 생긴 줄은 늦게 나타난다
    RL.forEach((p, i) => { if (!done.includes(i)) return; const isNew = fresh.includes(i), at = k === 1 ? 0.5 + done.indexOf(i) * 0.35 : 1.5;
      if (isNew && k === 1) { const f = E(u, at - 0.4, at + 0.4); if (f > 0.25 && f < 0.92) mono(lerp(34, 626, f), LY(i), TL[i], { 'font-size': 13.5, fill: MUT, opacity: 0.8 }); }
      out(626, LY(i), p, { fs: 13.5, op: isNew ? fade(u, at) : 1 }); });
    if (k === 0) { [['kind: Deployment', [['kind: Deployment']], '그대로', MUT], ['replicas: {{ .Values.replicaCount }}', [['replicas: '], ['3', 1]], '실행됨', ACC]].forEach(([a, b, lab, col], i) => {
        const y = 290 + i * 70, f = fade(u, 0.9 + i * 0.5); tpl(60, y, a, { fs: 16, op: f }); grow(440, y - 5, 560, y - 5, E(u, 1.1 + i * 0.5, 1.6 + i * 0.5), col === ACC ? ACC : MUT);
        out(580, y, b, { fs: 16, op: fade(u, 1.5 + i * 0.5) }); pill(840, y - 6, lab, col, pop(u, 1.6 + i * 0.5), { fs: 14 }); });
      return; }
    if (k === 1) { sub(480, 300, '액션이 없는 줄 4개는 한 글자도 안 바뀌고 그대로 옮겨진다', fade(u, 1.8), { 'font-size': 16, 'font-weight': 700, fill: INK });
      sub(480, 330, '차트 대부분은 이런 평범한 YAML이다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 2) { terminal(40, 250, 440, 92, ['$ helm install my-app ./mychart'], 1, { title: 'bash' });
      const sg = segs[3][0]; fly(186, 238, sg.cx, LY(3) - 5, seg(u, 0.3, 1.2), 'my-app', { mono: true });
      grow(sg.cx, LY(3) + 8, sg.cx, 230, 0); card(720, 300, 300, 56, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.0) });
      mono(720, 306, '.Release.Name = "my-app"', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      sub(720, 352, '설치할 때 준 이름이 늘 들어온다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // 3·4·5: 값의 나무
    const T = { x0: 70, x1: 210, x2: 380, y: 320 };
    function tree(path, hot) { const node = (x, y, s, on) => card(x, y, tw(s, 14) + 22, 32, { rx: 8, text: s, fs: 14, mono: true, fw: 800, stroke: on ? ACC : GRID, color: on ? ACC : MUT, fill: on ? ACCBG : PANEL });
      [['Values', 270], ['Release', 320], ['Chart', 370]].forEach(([n, y]) => { el('line', { x1: T.x0 + 18, y1: 320, x2: T.x1 - 40, y2: y, stroke: GRID, 'stroke-width': 2 }); node(T.x1, y, n, path.includes(n)); });
      node(T.x0, 320, '.', true);
      hot.forEach(([s, y], i) => { el('line', { x1: T.x1 + 40, y1: 270, x2: T.x2 - 70, y2: y, stroke: GRID, 'stroke-width': 2 }); node(T.x2 + 10, y, s, true); }); }
    if (k === 3) { tree(['Values'], [['replicaCount: 3', 270]]); mono(T.x0 - 30, 246, '.Values.replicaCount', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      dot([[T.x0, 320], [T.x1, 270], [T.x2 + 10, 270]], seg(u, 0.3, 1.2), ACC, 7);
      fly(T.x2 + 60, 270, 626 + tw('  replicas: ', 13.5) + 5, LY(5) - 5, seg(u, 1.2, 1.9), '3', { mono: true });
      sub(760, 320, '점 뒤 경로 = values.yaml의 구조 그대로', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { tree(['Values'], [['image.repository: nginx', 260], ['image.tag: "1.27"', 300]]);
      const sg = segs[6]; [[260, 'nginx', 0.3, sg[0]], [300, '1.27', 1.0, sg[1]]].forEach(([y, v, a, sgi]) => fly(T.x2 + 190, y, sgi.cx, LY(6) - 5, seg(u, a, a + 0.8), v, { mono: true }));
      sub(760, 330, '따옴표 안이라도 액션은 실행된다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK });
      sub(760, 356, '두 액션이 이어 붙어 문자열 하나가 된다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k === 5: 출처 세 곳에서 빈칸으로
    paper(30, 236, 300, 168, 'values.yaml', { tcol: INFO, stroke: INFO });
    ['replicaCount: 3', 'image:', '  repository: nginx', '  tag: "1.27"'].forEach((s, i) => mono(44, 284 + i * 26, s, { 'font-size': 14.5, opacity: fade(u, 0.2 + i * 0.15) }));
    card(500, 300, 230, 50, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.4) }); mono(500, 306, 'Release.Name: my-app', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
    const NUM = [[[310, 284], segs[5][0], 5], [[310, 336], segs[6][0], 6], [[310, 362], segs[6][1], 6], [[630, 300], segs[3][0], 3]];
    NUM.forEach(([[x, y], sg, li], i) => { const s0 = pop(u, 0.8 + i * 0.3);
      [[x, y - 5], [sg.cx, li === 6 ? LY(li) + 19 : LY(li) - 22]].forEach(([cx, cy]) => { card(cx, cy, 24, 24, { rx: 12, fill: ACC, stroke: 'none', text: String(i + 1), fs: 13.5, color: PANEL, s: s0 }); }); });
    banner(800, 330, '밖은 그대로 · 안은 실행', pop(u, 2.0)); }

  // ---------- 2. 공백 제어 ----------
  const WS_DASH = '    app: web\n    {{- if .Values.env }}\n    env: {{ .Values.env }}\n    {{- end }}\n';
  const WS_NO = '    app: web\n    {{ if .Values.env }}\n    env: {{ .Values.env }}\n    {{ end }}\n';
  const OV = '    app: web\n    env: {{- .Values.env }}\n';
  // 공백 먹기 진행: 구간 j 가 u 시각 a+j*d 부터 먹힌다
  function eatStyle(s, u, a, d) { const rs = eaten(s); return (i, ch) => { const j = rs.findIndex(([p, q]) => i >= p && i < q);
      const act = inAct(s, i) && ch !== ' ' && ch !== '\n';
      if (j >= 0) { const f = E(u, a + j * d, a + j * d + 0.6); return { fill: BAD, op: 1 - 0.75 * f, strike: f, fw: 800 }; }
      return act ? { fill: ACC, fw: 700 } : null; }; }
  function result(x, y, s, o) { o = o || {}; return chars(x, y, s, { fs: o.fs || 15, op: o.op, st: (i, ch) => {
      const ls = s.lastIndexOf('\n', i - 1) + 1, le = s.indexOf('\n', i), line = s.slice(ls, le < 0 ? s.length : le), blank = !line.trim();
      const st = { op: o.op ?? 1 }; if (blank && o.warn) { st.bg = WARNBG; } if (o.vals && o.vals.some(([p, q]) => i >= p && i < q)) { st.fill = ACC; st.fw = 800; } return st; } }); }
  function head(x, y, s, col, op) { tx(x, y, s, { 'font-size': 15, 'font-weight': 800, fill: col || MUT, opacity: op ?? 1 }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const A = 'a: 1\n    {{- .x }}', B = '{{ .x -}}    \nb: 2', fs = 22, cw = fs * 0.6;
      [[A, 130, '여는 대시: 왼쪽을 먹는다', -1], [B, 290, '닫는 대시: 오른쪽을 먹는다', 1]].forEach(([s, y, lab, dir], i) => { const x = 200, a = 0.5 + i * 0.9;
        chars(x, y, s, { fs, inline: true, st: eatStyle(s, u, a, 0.3) });
        const [p, q] = eaten(s)[0], mid = x + ((p + q) / 2) * cw, dx = x + (dir < 0 ? s.indexOf('{{-') + 2.5 : s.indexOf('-}}') + 0.5) * cw;
        el('path', { d: `M${dx},${y + 14} Q${(dx + mid) / 2},${y + 44} ${mid},${y + 16}`, fill: 'none', stroke: BAD, 'stroke-width': 2.2, opacity: fade(u, a), 'marker-end': 'url(#ra-ahr)' });
        tx(x + s.length * cw + 40, y - 4, lab, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, a + 0.4) }); });
      sub(480, 390, '공백·탭·줄바꿈(↵)을 모두 먹는다. 대시와 내용 사이엔 공백 한 칸이 필요하다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { const S = 'metadata:\n  labels:\n    app: web\n';
      head(60, 70, 'template', MUT); head(540, 70, 'rendered', ACC);
      [0, 2, 4].forEach((col, i) => { const x = 60 + col * 9; el('line', { x1: x, y1: 92, x2: x, y2: 92 + (3 - i) * 26 * E(u, 0.3, 1), stroke: INFO, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', transform: `translate(0 ${i * 26})` }); });
      chars(60, 110, S, { fs: 15 }); result(540, 110, S, { op: fade(u, 1.0) }); grow(330, 136, 510, 136, E(u, 0.6, 1.2), MUT);
      sub(480, 260, '액션이 없으면 들여쓰기 공백도 그대로 옮겨진다', fade(u, 1.5), { 'font-size': 16, 'font-weight': 700, fill: INK });
      sub(480, 290, '문제는 액션이 한 줄을 통째로 차지할 때 생긴다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { const S = k === 2 ? WS_DASH : WS_NO, R2 = k === 2 ? '    app: web\n    env: prod\n' : '    app: web\n    \n    env: prod\n    \n';
      head(40, 60, k === 2 ? 'template (대시 있음)' : 'template (대시 없음)', MUT); head(560, 60, 'rendered', ACC);
      chars(40, 100, S, { fs: 15, lh: 34, st: k === 2 ? eatStyle(S, u, 0.4, 0.7) : (i, ch) => { const act = inAct(S, i) && ch !== ' ' && ch !== '\n'; return act ? { fill: ACC, op: 1 - 0.85 * E(u, 0.5, 1.4), fw: 700 } : null; } });
      grow(470, 150, 540, 150, E(u, 1.6, 2.0), MUT);
      const vi = R2.indexOf('prod'); result(560, 100, R2, { lh: 34, op: fade(u, 1.9), warn: k === 3, vals: [[vi, vi + 4]] });
      if (k === 3) sub(720, 290, '액션이 사라진 자리에 · · · · ↵ 만 남았다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: WARN });
      else sub(720, 260, '↵ 와 · · · · 가 두 번 먹혔다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      return; }
    if (k === 4) { head(40, 50, '대시 없음', WARN); head(40, 240, '대시 있음', GOOD);
      result(40, 86, '    app: web\n    \n    env: prod\n    \n', { lh: 30, warn: true }); result(40, 276, '    app: web\n    env: prod\n', { lh: 30 });
      grow(300, 130, 560, 200, E(u, 0.4, 1.0), MUT); grow(300, 300, 560, 230, E(u, 0.7, 1.3), MUT);
      card(720, 215, 290, 130, { rx: 12, stroke: GOOD, sw: 2.2, s: pop(u, 1.2) });
      head(600, 180, 'YAML 파서가 읽은 값', MUT, fade(u, 1.3));
      ['labels:', '  app: web', '  env: prod'].forEach((s, i) => mono(610, 208 + i * 24, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.15) }));
      check(840, 228, 12, pop(u, 1.9)); sub(720, 310, '둘 다 같은 값이다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      sub(720, 340, '빈 줄은 건너뛰고, 모양만 지저분하다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 5) { const T = c.beat.transform || { src: [], out: [] };
      head(60, 46, 'template', MUT); head(600, 46, 'rendered', ACC);
      T.src.forEach((s, i) => { const y = 76 + i * 31, cm = s.startsWith('#'); tpl(60, y, s, { fs: 15, col: cm ? MUT : INK, op: fade(u, 0.2 + i * 0.08) }); });
      let blank = 0; T.out.forEach((s, i) => { const y = i < 3 ? 76 + (i + 1) * 31 : 76 + (i + 3) * 31;
        if (!s) { if (i === 1) { el('rect', { x: 600, y: y - 17, width: 200, height: 24, rx: 4, fill: WARNBG, opacity: fade(u, 1.2) }); tag(700, y, '빈 줄', WARN, { op: fade(u, 1.3) }); } return; }
        mono(600, y, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.15) }); });
      grow(420, 120, 580, 120, E(u, 0.8, 1.2), MUT); grow(420, 290, 580, 290, E(u, 1.4, 1.8), MUT);
      tag(700, 360, '대시가 빈 줄까지 정리했다', GOOD, { op: fade(u, 2.0) }); return; }
    // k === 6: 너무 먹으면 깨진다
    head(40, 60, 'template', MUT); head(560, 60, 'rendered', ACC);
    chars(40, 100, OV, { fs: 17, lh: 40, st: eatStyle(OV, u, 0.4, 0.7) });
    const R3 = '    app: web\n    env:prod\n', ci = R3.indexOf('env:prod');
    result(560, 100, R3, { fs: 17, lh: 40, op: fade(u, 1.3), vals: [[ci + 4, ci + 8]] });
    el('rect', { x: 560 + 7 * 10.2 - 3, y: 115, width: 26, height: 26, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 2.2, opacity: fade(u, 1.6) });
    card(700, 290, 380, 96, { rx: 12, stroke: BAD, sw: 2.2, fill: BADBG, s: pop(u, 1.8) }); cross(548, 290, 12, pop(u, 1.8));
    tx(578, 282, 'YAML 파싱 오류', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
    mono(578, 308, "could not find expected ':'", { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) });
    sub(250, 290, '콜론 뒤 공백까지 먹었다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: BAD }); }

  // ---------- 3. 주석과 기본 함수 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const L = ['{{/*', '  이 주석은 렌더 결과에 남지 않는다', '*/}}', '# 내부 메모 (YAML 주석)', 'apiVersion: apps/v1'];
      paper(30, 30, 440, 230, 'templates/functions.yaml'); paper(520, 30, 410, 230, 'rendered', { tcol: ACC });
      const f = E(u, 0.6, 1.5);
      L.forEach((s, i) => { const y = 82 + i * 34, cm = i < 3;
        mono(46, y, s, { 'font-size': 15, fill: cm ? ACC : i === 3 ? MUT : INK, 'font-weight': cm ? 700 : 400, opacity: cm ? 1 - 0.7 * f : 1 });
        if (cm && f > 0) el('line', { x1: 44, y1: y - 5, x2: 44 + tw(s, 15) * f, y2: y - 5, stroke: BAD, 'stroke-width': 2 }); });
      const R = [['', null], ['# 내부 메모 (YAML 주석)', MUT], ['apiVersion: apps/v1', INK]];
      R.forEach(([s, col], i) => { const y = 82 + i * 34; if (!s) { tag(640, y, '(빈 줄)', OFF, { op: fade(u, 1.6) }); return; } mono(536, y, s, { 'font-size': 15, fill: col, opacity: fade(u, 1.6 + i * 0.2) }); });
      pill(250, 320, '{{/* */}} = 결과에서 사라진다', ACC, pop(u, 1.8), { fs: 15 }); pill(700, 320, '# = 결과에 그대로 남는다', MUT, pop(u, 2.1), { fs: 15 });
      return; }
    if (k === 1) { const L = ['apiVersion: apps/v1', 'kind: Deployment', 'spec:', '  template:', '    spec:', '      containers:', '        - name: web', '          image: ', '          env: '];
      L.forEach((s, i) => { const y = 60 + i * 34, f = E(u, 0.2 + i * 0.12, 0.6 + i * 0.12), ind = s.match(/^ */)[0].length;
        if (ind) el('line', { x1: 160 + 2, y1: y - 6, x2: 160 + ind * 8.4 * f, y2: y - 6, stroke: GRID, 'stroke-width': 3, 'stroke-linecap': 'round' });
        mono(160, y, s, { 'font-size': 15, opacity: f }); });
      [[7, 'image 값'], [8, 'env 목록']].forEach(([i, s], j) => { const y = 60 + i * 34, x = 160 + tw(L[i], 15) + 6;
        el('rect', { x, y: y - 18, width: 150, height: 26, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: fade(u, 1.5 + j * 0.3) });
        tag(x + 75, y, s, ACC, { op: fade(u, 1.6 + j * 0.3) }); });
      sub(720, 200, '여기까지는 평범한 Deployment YAML', fade(u, 1.4), { 'font-size': 15.5, 'font-weight': 700, fill: INK });
      sub(720, 230, '액션은 값이 들어갈 자리에만 쓴다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) { tx(40, 50, '.Values.image.tag | default "latest"', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.1) });
      [['tag 없음', '(빈 값)', 'latest', 140, true], ['tag: "1.27"', '"1.27"', '1.27', 290, false]].forEach(([nm, v, o2, y, empt], i) => { const a = 0.3 + i * 0.8;
        tx(40, y - 30, nm, { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, a) });
        tube(150, 690, y, E(u, a, a + 0.5)); fnBox(440, y, 'default "latest"', { s: pop(u, a + 0.1) });
        const p = E(u, a + 0.3, a + 1.2), x = lerp(110, 690, p), out1 = p > 0.5;
        capsule(x, y, out1 ? o2 : v, { dash: !out1 && empt ? '4 4' : null, col: out1 && empt ? ACC : INK, fill: out1 && empt ? ACCBG : PANEL });
        mono(840, y + 5, `image: "nginx:${o2}"`, { 'font-size': 14.5, 'font-weight': 700, fill: empt ? ACC : INK, opacity: fade(u, a + 1.2), 'text-anchor': 'middle' });
        tag(440, y + 42, empt ? '비었으니 대신 넣는다' : '값이 있으면 그대로 통과', empt ? ACC : MUT, { op: fade(u, a + 1.0) }); });
      return; }
    if (k === 3) { tx(40, 60, '.Values.port | quote', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.1) });
      const y = 140; tube(120, 640, y, E(u, 0.2, 0.6)); fnBox(380, y, 'quote', { s: pop(u, 0.3) });
      const p = E(u, 0.5, 1.5), x = lerp(110, 640, p), q = p > 0.5;
      capsule(x, y, q ? '"8080"' : '8080', { col: q ? ACC : INFO, fill: q ? ACCBG : INFOBG }); tag(x, y + 36, q ? 'string' : 'number', q ? ACC : INFO);
      card(480, 300, 600, 120, { rx: 12, stroke: GRID, sw: 2, s: pop(u, 1.4) });
      mono(200, 266, 'env[].value는 문자열만 받는다', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.5) });
      mono(220, 300, 'value: 8080', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.7) }); cross(420, 295, 10, pop(u, 1.8)); tag(560, 300, '숫자라서 거부된다', BAD, { op: fade(u, 1.8) });
      mono(220, 336, 'value: "8080"', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) }); check(420, 331, 10, pop(u, 2.1)); tag(560, 336, '문자열이라 통과', GOOD, { op: fade(u, 2.1) });
      return; }
    if (k === 4) { tpl(40, 90, '- name: APP_NAME', { fs: 16 }); const sg = tpl(40, 126, '  value: {{ .Values.appName }}', { fs: 16 });
      grow(390, 110, 500, 110, E(u, 0.3, 0.8), MUT);
      mono(520, 90, '- name: APP_NAME', { 'font-size': 16, opacity: fade(u, 0.8) }); mono(520, 126, '  value:', { 'font-size': 16, opacity: fade(u, 0.9) });
      el('rect', { x: 610, y: 108, width: 90, height: 26, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.1) });
      tag(655, 160, 'appName이 없다', WARN, { op: fade(u, 1.2) });
      card(480, 290, 520, 110, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 1.5) });
      tx(240, 270, 'Pod 안의 환경 변수', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      mono(240, 304, 'APP_NAME = ""', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      tx(520, 304, '오류 없이 빈 값으로 배포된다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    // k === 5: 파이프 두 단
    tx(40, 50, '.Values.appName | default "web" | quote', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.1) });
    const y = 150; tube(90, 880, y, E(u, 0.2, 0.7)); fnBox(330, y, 'default "web"', { s: pop(u, 0.3) }); fnBox(640, y, 'quote', { s: pop(u, 0.5) });
    const p = E(u, 0.6, 2.0), x = lerp(80, 880, p), v = x < 330 ? '(빈 값)' : x < 640 ? 'web' : '"web"';
    capsule(x, y, v, { dash: x < 330 ? '4 4' : null, col: x < 330 ? MUT : ACC, fill: x < 330 ? PANEL : ACCBG });
    [[330, 'default "web" ', 1.0], [640, 'quote ', 1.7]].forEach(([cx, s, a]) => { const w = tw(s, 15);
      mono(cx - (w + 40) / 2, 250, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
      el('rect', { x: cx - (w + 40) / 2 + w, y: 233, width: 40, height: 24, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8, opacity: fade(u, a) });
      grow(cx, 182, cx, 228, E(u, a, a + 0.4), ACC); });
    tag(480, 300, '왼쪽 결과가 오른쪽 함수의 마지막 인자 칸에 들어간다', INK, { op: fade(u, 2.1) });
    mono(480, 350, 'value: "web"', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); }

  // ---------- 4. 변수 ----------
  function s4(t, c) { const { k, u } = c, BX = 720;
    if (k === 0) { tpl(40, 100, '{{- $name := .Release.Name }}', { fs: 16 }); tpl(40, 200, '{{- $name = "other" }}', { fs: 16 }); tpl(40, 300, '{{ $x = 1 }}', { fs: 16, op: fade(u, 1.8) });
      grow(400, 94, 590, 120, E(u, 0.3, 0.8), ACC); const ch = u > 1.4;
      slotBox(BX, 140, 220, '$name', ch ? '"other"' : '"my-app"', { s: pop(u, 0.6), vcol: ch ? ACC : INK });
      if (ch) { mono(BX + 90, 186, '"my-app"', { 'font-size': 14, fill: OFF, 'text-anchor': 'end', 'text-decoration': 'line-through' }); }
      tag(BX, 84, ':= 새로 만든다', GOOD, { op: fade(u, 0.8) }); grow(330, 194, 590, 150, E(u, 1.0, 1.4), ACC); tag(470, 236, '= 이미 있는 것에 다시 넣는다', ACC, { op: fade(u, 1.3) });
      cross(210, 295, 10, pop(u, 2.0)); mono(240, 300, 'undefined variable: $x', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
      sub(480, 390, '선언·대입 액션은 아무것도 출력하지 않는다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { tpl(30, 80, '{{- $fullName := printf "%s-web" .Release.Name }}', { fs: 15 }); tpl(30, 250, '{{- $replicas := .Values.replicaCount | default 1 }}', { fs: 15 });
      const f = E(u, 0.4, 1.2); mono(70, 130, '"%s-web"', { 'font-size': 18, 'font-weight': 800, fill: MUT, opacity: 1 - f * 0.7 });
      fly(150, 170, 92, 124, seg(u, 0.2, 0.9), 'my-app', { mono: true });
      mono(220, 130, '→', { 'font-size': 18, fill: MUT, opacity: fade(u, 1.0) }); mono(250, 130, '"my-app-web"', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      slotBox(BX, 120, 260, '$fullName', 'my-app-web', { s: pop(u, 1.3) });
      mono(70, 300, '3', { 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) }); mono(110, 300, '| default 1 →  3', { 'font-size': 18, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      slotBox(BX, 290, 260, '$replicas', '3', { s: pop(u, 1.9) }); return; }
    if (k === 2 || k === 3) { const nm = k === 2 ? '$fullName' : '$replicas', v = k === 2 ? 'my-app-web' : '3', line = k === 2 ? '  name: {{ $fullName }}' : '  replicas: {{ $replicas }}', key = k === 2 ? '  name: ' : '  replicas: ';
      slotBox(BX, 90, 260, '$fullName', 'my-app-web', { op: k === 2 ? 1 : 0.45 }); slotBox(BX, 190, 260, '$replicas', '3', { op: k === 3 ? 1 : 0.45 });
      const sg = tpl(60, 120, line, { fs: 17 })[0];
      fly(BX, k === 2 ? 128 : 228, sg.cx, 115, seg(u, 0.3, 1.2), v, { mono: true });
      grow(300, 200, 300, 260, E(u, 1.2, 1.5), MUT);
      out(60, 310, [[key], [v, 1]], { fs: 18, op: fade(u, 1.5) });
      sub(BX, 330, k === 2 ? '긴 식 대신 이름 한 단어' : 'default는 선언할 때 한 번만', fade(u, 1.9), { 'font-size': 15.5, 'font-weight': 700, fill: INK }); return; }
    // 4·5: range 와 점
    const ROOT = [170, 140], P80 = [110, 330], P443 = [230, 330];
    function data(hotCell) { card(ROOT[0], ROOT[1], 220, 110, { rx: 12, stroke: GRID, sw: 2 });
      ['Values', 'Release', 'Chart'].forEach((s, i) => mono(ROOT[0] - 90, ROOT[1] - 22 + i * 26, s, { 'font-size': 15, 'font-weight': 700 }));
      mono(ROOT[0] + 4, ROOT[1] - 22, '.ports', { 'font-size': 14, fill: MUT });
      el('line', { x1: ROOT[0] + 40, y1: ROOT[1] - 14, x2: 170, y2: 300, stroke: GRID, 'stroke-width': 2 });
      [[P80, '80'], [P443, '443']].forEach(([p, s], i) => card(p[0], p[1], 90, 44, { rx: 8, text: s, mono: true, fs: 17, fw: 800, stroke: hotCell === i ? ACC : GRID, fill: hotCell === i ? ACCBG : PANEL, color: hotCell === i ? ACC : INK })); }
    function pointer(name, to, col, dy) { const x = to[0], y = to[1] - dy; el('line', { x1: x, y1: y - 30, x2: x, y2: y - 4, stroke: col, 'stroke-width': 3, 'marker-end': col === ACC ? 'url(#ra-ahb)' : 'url(#ra-ah)' });
      mono(x, y - 38, name, { 'font-size': 18, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); }
    if (k === 4) { const ph = u < 0.9 ? -1 : u < 1.5 ? 0 : 1; data(ph);
      pointer('$', [ROOT[0] - 60, ROOT[1] - 55], INFO, 0);
      const to = ph < 0 ? [ROOT[0] + 60, ROOT[1] - 55] : ph === 0 ? [P80[0], P80[1] - 22] : [P443[0], P443[1] - 22]; pointer('.', to, ACC, 0);
      tpl(420, 80, '{{- range .Values.ports }}', { fs: 16 }); mono(420, 120, ph < 0 ? 'range 밖: . = 루트' : `${ph + 1}회차: . = ${ph ? 443 : 80}`, { 'font-size': 17, 'font-weight': 800, fill: ACC });
      tpl(420, 200, '  {{ .Release.Name }}', { fs: 16, op: fade(u, 1.8) }); cross(430, 245, 10, pop(u, 2.1));
      mono(456, 250, "can't evaluate field Release", { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) });
      tag(640, 290, '80이라는 숫자에서 Release를 찾았다', BAD, { op: fade(u, 2.3) });
      tag(640, 340, '$ 는 range 안에서도 그대로 루트', INFO, { op: fade(u, 2.4) }); return; }
    // k === 5
    data(Math.floor(u / 0.9) % 2); pointer('$', [ROOT[0] - 60, ROOT[1] - 55], INFO, 0);
    slotBox(560, 60, 230, '$fullName', 'my-app-web', {});
    [[80, 150, 0.4], [443, 290, 1.2]].forEach(([p, y, a]) => { const op = fade(u, a);
      card(700, y, 460, 74, { rx: 10, stroke: ACC, sw: 2, op });
      out(486, y - 6, [['- name: '], ['my-app-web', 1], [`-${p}`, 1]], { fs: 15.5, op }); out(486, y + 22, [['  containerPort: '], [String(p), 1]], { fs: 15.5, op });
      if (op > 0) el('path', { d: `M560,85 Q${560},${y - 30} ${560 + 10},${y - 37}`, stroke: INFO, 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '5 4', opacity: op });
      grow(p === 80 ? P80[0] + 45 : P443[0] + 45, 330, 466, y + 16, E(u, a, a + 0.5), ACC); });
    tag(700, 390, '. 은 포트 값으로, 이름은 변수로', INK, { op: fade(u, 2.0) }); }

  // ---------- 5. 전체 흐름 ----------
  const MAN = ['apiVersion: apps/v1', 'kind: Deployment', 'metadata:', '  name: my-app-web', '  labels:', '    app: mychart', 'spec:', '  replicas: 3', '  selector:', '    matchLabels:',
    '      app: my-app-web', '  template:', '    metadata:', '      labels:', '        app: my-app-web', '    spec:', '      containers:', '        - name: web', '          image: "nginx:1.27"',
    '          ports:', '            - containerPort: 80', '            - containerPort: 443'];
  const UPTO = [3, 6, 8, 8, 15, 19, 22, 22];          // beat 별로 채워진 매니페스트 줄 수
  const REP = [3, 3, 3, 1, 3, 3, 3, 3];               // 그 beat 의 replicas 값 (replicaCount 0 실험은 1)
  const VALS = (b) => ['replicaCount: ' + (b === 3 ? 0 : 3), 'image:', '  repository: nginx', '  tag: "1.27"', 'ports: [80, 443]'];
  const SRC = [[], [['rel', 0], ['chart', 0]], [['val', 0]], [['val', 0]], [['rel', 0]], [['val', 2], ['val', 3]], [['val', 4]], []];
  const CHIP = [[['{{/* … */}}', '(사라짐)'], ['$fullName := printf …', 'my-app-web']], [['{{ $fullName }}', 'my-app-web'], ['{{ .Chart.Name }}', 'mychart']],
    [['.Values.replicaCount', '3'], ['| default 1', '3']], [['.Values.replicaCount', '0'], ['| default 1', '1']], [['{{ $fullName }}', 'my-app-web'], ['(selector · Pod 라벨)', '같은 값']],
    [['.Values.image.repository', 'nginx'], ['.Values.image.tag | default …', '1.27']], [['range .Values.ports', '80, 443'], ['- containerPort: {{ . }}', '2줄']], []];
  function s5(t, c) { const { k, u } = c, n = UPTO[k], n0 = k ? UPTO[k - 1] : 0, rep = Math.round(tween(k ? REP[k - 1] : 3, REP[k], u));
    // 오른쪽: 매니페스트
    paper(590, 12, 356, 400, 'rendered manifest', { tcol: ACC });
    MAN.forEach((s, i) => { if (i >= n) return; const y = 46 + i * 16.4, isNew = i >= n0, op = isNew ? fade(u, 1.2 + (i - n0) * 0.08) : 1;
      let line = s; if (i === 7) line = '  replicas: ' + rep;
      const bad = i === 7 && k === 3;
      if (bad) el('rect', { x: 598, y: y - 13, width: 200, height: 17, rx: 3, fill: BADBG });
      mono(604, y, line, { 'font-size': 13.5, opacity: op, fill: bad ? BAD : (isNew && k < 7 ? ACC : INK), 'font-weight': isNew && k < 7 ? 700 : 400 }); });
    if (k === 7) { // helm template
      terminal(16, 20, 556, 250, ['$ helm template my-app ./mychart', '---', ['# Source: mychart/templates/deployment.yaml', 'var(--off)'], 'apiVersion: apps/v1', 'kind: Deployment', 'metadata:', '  name: my-app-web', '…'], lerp(1, 8, E(u, 0.2, 1.6)), { title: '출력 예시' });
      el('rect', { x: 40, y: 300, width: 220, height: 100, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: fade(u, 1.6) });
      tx(150, 340, '클러스터', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) }); tx(150, 368, '바뀐 것 없음', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      sub(430, 350, '적용 전에 결과를 눈으로 확인한다', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // 왼쪽: 데이터 출처
    paper(14, 12, 210, 160, 'values.yaml', { tcol: INFO, stroke: INFO });
    const hotV = SRC[k].filter(([a]) => a === 'val').map(([, i]) => i);
    VALS(k).forEach((s, i) => mono(26, 56 + i * 22, s, { 'font-size': 13.5, 'font-weight': hotV.includes(i) ? 800 : 400, fill: hotV.includes(i) ? (k === 3 ? WARN : INFO) : INK }));
    const relHot = SRC[k].some(([a]) => a === 'rel'), chHot = SRC[k].some(([a]) => a === 'chart');
    card(119, 214, 210, 44, { rx: 10, stroke: relHot ? ACC : GRID, sw: 2, fill: relHot ? ACCBG : PANEL }); mono(119, 220, '.Release.Name  my-app', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: relHot ? ACC : MUT });
    card(119, 270, 210, 44, { rx: 10, stroke: chHot ? ACC : GRID, sw: 2, fill: chHot ? ACCBG : PANEL }); mono(119, 276, '.Chart.Name  mychart', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: chHot ? ACC : MUT });
    // 가운데: 이번 beat 의 액션 평가
    CHIP[k].forEach(([a, b], i) => { const y = 70 + i * 92, s = pop(u, 0.3 + i * 0.4), w = Math.min(330, tw(a, 13.5) + 24);
      card(408, y, w, 34, { rx: 8, text: a, fs: 13.5, mono: true, fw: 700, stroke: ACC, color: ACC, fill: ACCBG, s });
      grow(408, y + 20, 408, y + 44, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), MUT);
      mono(408, y + 62, b, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 3 && i === 1 ? BAD : INK, opacity: fade(u, 0.9 + i * 0.4) }); });
    SRC[k].forEach(([a, i], j) => { const from = a === 'val' ? [224, 52 + i * 22] : a === 'rel' ? [224, 214] : [224, 270]; dot([from, [250, 70 + Math.min(j, 1) * 92]], seg(u, 0.1 + j * 0.2, 0.6 + j * 0.2), INFO, 6); });
    if (k === 3) { cross(408, 300, 11, pop(u, 1.8)); tx(408, 336, '0도 빈 값이라 1로 바뀌었다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
      tx(408, 362, '기본값은 values.yaml에 두고 default는 뺀다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 4) { check(300, 330, 11, pop(u, 1.8)); tx(320, 335, 'selector = Pod 라벨', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      tx(270, 365, '어긋나면 Deployment가 Pod를 못 찾는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 0) tx(408, 300, '이름 규칙을 맨 위에서 한 번 정한다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
    if (k === 6) tx(408, 300, '대시로 range 자리 빈 줄도 없다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: 'name: {{ .Release.Name }}-web을 helm install my-app ./mychart로 렌더하면 결과는 무엇인가?',
      o: ['name: {{ .Release.Name }}-web', 'name: my-app-web', 'name: mychart-web'], a: 1,
      why: '이중 중괄호 안만 실행되어 릴리스 이름 my-app이 들어가고, 밖에 있던 -web은 글자 그대로 붙는다.' },
    { q: '{{- if .Values.env }}의 여는 대시가 먹는 것은 무엇인가?',
      o: ['액션 앞의 들여쓰기와 앞 줄 끝 줄바꿈', '액션 뒤의 공백과 줄바꿈', '조건이 거짓일 때 블록 전체'], a: 0,
      why: '여는 쪽 대시는 왼쪽을 먹는다. 앞 줄 끝 ↵와 공백 네 칸이 사라져 app: web 바로 다음 줄에 env: prod가 온다.' },
    { q: 'appName이 비어 있을 때 value: {{ .Values.appName | default "web" | quote }}의 결과는 무엇인가?',
      o: ['value: web', 'value: ""', 'value: "web"'], a: 2,
      why: 'default가 빈 값을 web으로 바꾸고, 그 결과가 quote의 마지막 인자로 넘어가 따옴표가 붙는다.' },
    { q: 'range .Values.ports 안에서 릴리스 이름이 필요할 때 맞는 방법은 무엇인가?',
      o: ['블록 안에서 .Release.Name을 그대로 쓴다', 'range 앞에서 변수에 담거나 $.Release.Name으로 쓴다', 'range 안에서 quote로 감싸 쓴다'], a: 1,
      why: 'range 안의 점은 80, 443 같은 각 항목이라 .Release를 찾지 못해 렌더 오류가 난다. 변수와 $는 블록 안에서도 그대로다.' },
    { q: 'values에 replicaCount: 0을 주었는데 replicas: 1이 렌더됐다. 원인은 무엇인가?',
      o: ['helm template이 0을 허용하지 않아서', 'Deployment가 0을 1로 고쳐서', 'default 1이 0을 빈 값으로 보고 1을 넣어서'], a: 2,
      why: 'default는 0, false, 빈 문자열을 모두 빈 값으로 본다. 0을 쓰려면 default를 빼고 기본값 1은 values.yaml에 둔다.' },
  ];

  const summary = [
    '템플릿은 이중 중괄호 안만 실행하고, 나머지 글자는 그대로 매니페스트로 내보낸다.',
    '대시는 액션 옆 공백과 줄바꿈을 먹고, 값 앞에 잘못 붙이면 줄이 붙어 YAML이 깨진다.',
    'default는 빈 값을 채우고 quote는 문자열로 감싼다. 0과 false도 빈 값으로 본다.',
    'range 안에서 점은 각 항목이 되므로, 바깥 값은 미리 담은 변수나 $로 가져온다.',
  ];
  const review = [
    { q: 'if 블록의 대시를 모두 지웠더니 렌더 결과에 공백만 있는 줄이 두 개 생겼다. 배포는 어떻게 되나?',
      o: ['YAML이 그 줄을 건너뛰어 같은 값으로 배포된다', 'YAML 파싱 오류로 배포가 멈춘다', 'env 줄까지 빠진 채 배포된다'], a: 0,
      why: '공백만 있는 줄은 YAML이 무시해 app과 env 값은 그대로다. 파싱 오류는 env:prod처럼 필요한 공백까지 먹었을 때 난다.' },
    { q: 'env에 PORT를 넣었더니 value: 8080이 숫자라서 거부됐다. 템플릿에서 고칠 곳은?',
      o: ['value 앞에 {{-를 붙인다', 'value를 {{ .Values.port | quote }}로 바꾼다', 'value를 {{ .Values.port | default 8080 }}으로 바꾼다'], a: 1,
      why: 'env의 value는 문자열만 받는다. quote가 8080을 "8080"으로 감싸야 YAML이 문자열로 읽는다.' },
    { q: '포트마다 이름을 my-app-web-80처럼 만들다가 range 안에서 렌더 오류가 났다. 먼저 볼 곳은?',
      o: ['quote를 빠뜨렸는지', 'values.yaml의 ports 순서', 'range 안에서 점으로 .Release.Name을 찾았는지'], a: 2,
      why: 'range 안의 점은 포트 번호라 Release 필드가 없다. 바깥에서 담아 둔 $fullName이나 $.Release.Name을 쓴다.' },
  ];

  R.page({ title: '템플릿이 매니페스트가 되기까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
