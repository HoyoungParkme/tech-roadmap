/* II-2-2 흐름 제어 (if / range / with) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 도우미 ----------
  function paper(x, y, w, h, title, o) { o = o || {};
    el('path', { d: `M${x},${y} h${w - 22} l22,22 v${h - 22} h${-w} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round', opacity: o.op ?? 1 });
    el('path', { d: `M${x + w - 22},${y} v22 h22`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    mono(x + 14, y + 21, title, { 'font-size': 13.5, 'font-weight': 800, fill: o.tcol || MUT, opacity: o.op ?? 1 }); }
  function line(x, y, parts, o) { o = o || {}; const fs = o.fs || 15; let cx = x;
    parts.forEach(([p, col, b]) => { const w = tw(p, fs); mono(cx, y, p, { 'font-size': fs, fill: col || INK, 'font-weight': b ? 800 : 400, opacity: o.op ?? 1, textLength: w, lengthAdjust: 'spacing' }); cx += w; }); return cx; }
  function tag(cx, cy, s, col, op, a) { mono(cx, cy, s, Object.assign({ 'font-size': 13.5, 'font-weight': 700, fill: col || MUT, 'text-anchor': 'middle', opacity: op ?? 1 }, a || {})); }
  // values 카드: rows = [[글, 강조?]]
  function vals(x, y, w, rows, o) { o = o || {}; paper(x, y, w, 40 + rows.length * 24, o.title || 'values.yaml', { tcol: INFO, stroke: INFO });
    rows.forEach(([s, hot], i) => mono(x + 14, y + 50 + i * 24, s, { 'font-size': 14, 'font-weight': hot ? 800 : 400, fill: hot === 'bad' ? BAD : hot ? INFO : INK, opacity: o.op ?? 1 })); }
  // 렌더 결과 줄들: rows = [[글, 상태]] 상태: 'on' 새로 생김, 'off' 빠짐(접힘), 'loop' 반복으로 생김
  function manifest(x, y, w, rows, u, o) { o = o || {}; let yy = y + 44;
    paper(x, y, w, o.h || 40 + rows.length * 23, o.title || 'rendered', { tcol: ACC });
    rows.forEach(([s, st], i) => { const a = (o.a ?? 0.6) + i * 0.1;
      if (st === 'off') { const f = E(u, o.offAt ?? 0.8, (o.offAt ?? 0.8) + 0.8), h = 23 * (1 - f);
        if (h > 3) { mono(x + 14, yy + 2, s, { 'font-size': 14, fill: BAD, opacity: 1 - f });
          el('line', { x1: x + 12, y1: yy - 3, x2: x + 12 + tw(s, 14) * clamp(f * 2), y2: yy - 3, stroke: BAD, 'stroke-width': 2 }); }
        yy += h; return; }
      const col = st === 'on' ? ACC : st === 'loop' ? INFO : INK, op = st === 'on' || st === 'loop' ? fade(u, a) : 1;
      mono(x + 14, yy, s, { 'font-size': 14, fill: col, 'font-weight': st ? 700 : 400, opacity: op }); yy += 23; }); }
  // 판단 램프: 참이면 GOOD, 거짓이면 BAD
  function lamp(cx, cy, on, s, lab) { card(cx, cy, 34, 34, { rx: 17, fill: on ? GOODBG : BADBG, stroke: on ? GOOD : BAD, sw: 2.5, s });
    if (s > 0.5) (on ? check : cross)(cx, cy, 9, 1); if (lab) tag(cx, cy + 36, lab, on ? GOOD : BAD, s > 0.5 ? 1 : 0); }
  function gate(cx, cy, name, on, s) { card(cx, cy, 96, 64, { rx: 32, text: name, fs: 17, mono: true, fw: 800, stroke: on ? GOOD : BAD, color: on ? GOOD : BAD, fill: on ? GOODBG : BADBG, s }); }
  // 글자 칸: 공백 ·, 줄바꿈 ↵
  function chars(x, y, s, o) { o = o || {}; const fs = o.fs || 15, cw = fs * 0.6, lh = o.lh || fs + 12; let col = 0, row = 0;
    [...s].forEach((ch, i) => { const st = (o.st && o.st(i, ch)) || {}, px = x + col * cw, py = y + row * lh, ws = ch === ' ' || ch === '\n';
      if (st.bg) el('rect', { x: px, y: py - fs + 1, width: cw, height: fs + 6, fill: st.bg });
      tx(px + cw / 2, py, ch === ' ' ? '·' : ch === '\n' ? '↵' : ch, { 'text-anchor': 'middle', 'font-size': ch === '\n' ? fs * 0.9 : fs, class: 'mono', fill: st.fill || (ws ? OFF : INK), 'font-weight': st.fw || (ws ? 700 : 400), opacity: st.op ?? 1 });
      if (st.strike) el('line', { x1: px + 1, y1: py - fs * 0.3, x2: px + 1 + (cw - 2) * st.strike, y2: py - fs * 0.3, stroke: BAD, 'stroke-width': 2.2 });
      if (ch === '\n') { row++; col = 0; } else col++; }); }
  function eaten(s) { const r = [];
    for (let i = s.indexOf('{{- '); i >= 0; i = s.indexOf('{{- ', i + 1)) { let a = i; while (a > 0 && /\s/.test(s[a - 1])) a--; if (a < i) r.push([a, i]); }
    for (let i = s.indexOf(' -}}'); i >= 0; i = s.indexOf(' -}}', i + 1)) { let b = i + 4; while (b < s.length && /\s/.test(s[b])) b++; if (b > i + 4) r.push([i + 4, b]); }
    return r.sort((p, q) => p[0] - q[0]); }
  const inAct = (s, i) => { const re = /\{\{.*?\}\}/g; let m; while ((m = re.exec(s))) if (i >= m.index && i < m.index + m[0].length) return true; return false; };
  function eatStyle(s, u, a, d) { const rs = eaten(s); return (i, ch) => { const j = rs.findIndex(([p, q]) => i >= p && i < q);
      if (j >= 0) { const f = E(u, a + j * d, a + j * d + 0.5); return { fill: BAD, op: 1 - 0.75 * f, strike: f, fw: 800 }; }
      return inAct(s, i) && ch !== ' ' && ch !== '\n' ? { fill: ACC, fw: 700 } : null; }; }
  function blankLines(s) { return (i) => { const ls = s.lastIndexOf('\n', i - 1) + 1, le = s.indexOf('\n', i), l = s.slice(ls, le < 0 ? s.length : le); return !l.trim() && l.length ? { bg: WARNBG } : null; }; }

  // ---------- 1. if / else ----------
  const ING = [['apiVersion: networking.k8s.io/v1'], ['kind: Ingress'], ['spec:'], ['  rules:'], ['  - host: app.example.com', 'on']];
  const TLS = [['  tls:'], ['  - hosts: [app.example.com]'], ['    secretName: my-app-tls']];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { vals(30, 40, 300, [['ingress:'], ['  enabled: true'], ['  tls: true'], ['  host: app.example.com', 1]]);
      fly(250, 162, 690, 182, seg(u, 0.4, 1.3), 'app.example.com', { mono: true, fill: INFO });
      manifest(470, 40, 440, ING, u, { a: 1.3 }); tag(690, 330, '조건 없이 늘 렌더되는 부분', MUT, fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1 || k === 5) { const on = k === 5; vals(30, 40, 300, [['ingress:'], ['  enabled: true'], [`  tls: ${on}`, on ? 1 : 'bad'], ['  host: app.example.com']]);
      line(40, 250, [['{{- if '], ['.Values.ingress.tls', INFO, 1], [' }}']], { fs: 15 });
      lamp(180, 300, on, pop(u, 0.3), on ? 'tls = true → 블록 렌더' : 'tls = false → 통째로 건너뜀');
      manifest(470, 40, 440, ING.map(([s]) => [s]).concat(TLS.map(([s]) => [s, on ? 'on' : 'off'])), u, { a: 0.4, offAt: 0.7, h: 40 + 8 * 23 });
      if (k === 5) { line(40, 380, [['{{- if '], ['or (eq .Values.env "prod") (eq .Values.env "staging")', ACC, 1], [' }}']], { fs: 13.5, op: fade(u, 1.4) });
        gate(780, 310, 'or', true, pop(u, 1.6)); lamp(640, 290, false, pop(u, 1.8)); lamp(640, 340, true, pop(u, 2.0));
        tag(560, 295, 'prod', MUT, fade(u, 1.8), { 'text-anchor': 'end' }); tag(560, 345, 'staging', GOOD, fade(u, 2.0), { 'text-anchor': 'end' });
        tag(780, 370, '하나만 참이어도 참', GOOD, fade(u, 2.2)); } return; }
    if (k === 2) { line(40, 50, [['{{- if '], ['not (empty .Values.ingress.annotations)', ACC, 1], [' }}']], { fs: 15 });
      const EM = [['false', 0], ['0', 0], ['""', 0], ['nil', 0], ['{}', 0], ['[]', 0]], NE = [['true', 1], ['"web"', 1], ['{a: b}', 1]];
      el('rect', { x: 40, y: 90, width: 420, height: 200, rx: 14, fill: SOFT, stroke: GRID, 'stroke-width': 2 }); tx(60, 116, 'empty = 참 (빈 값)', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      el('rect', { x: 500, y: 90, width: 420, height: 200, rx: 14, fill: SOFT, stroke: GRID, 'stroke-width': 2 }); tx(520, 116, 'empty = 거짓 (값 있음)', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      EM.forEach(([s], i) => card(110 + (i % 3) * 130, 150 + Math.floor(i / 3) * 56, 100, 40, { rx: 20, text: s, fs: 16, mono: true, fw: 800, stroke: WARN, color: WARN, s: pop(u, 0.3 + i * 0.12) }));
      NE.forEach(([s], i) => card(580 + i * 130, 160, 110, 40, { rx: 20, text: s, fs: 16, mono: true, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.0 + i * 0.12) }));
      fly(480, 360, 250, 260, seg(u, 1.4, 2.0), 'annotations: {}', { mono: true, fill: INFO, stay: true });
      tag(480, 330, 'not (empty {}) = 거짓 → 블록 없음', BAD, fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 3) { vals(30, 40, 230, [['env: staging', 1]]);
      const B = [['eq .Values.env "prod"', '# 운영 전용 설정', false], ['eq .Values.env "staging"', '# 스테이징 설정', true], ['else', '# 개발 기본값', null]];
      B.forEach(([cond, body, ok], i) => { const y = 170 + i * 80, a = 0.3 + i * 0.5, reached = i <= 1, hit = ok === true;
        card(400, y, 300, 46, { rx: 10, text: (i === 0 ? 'if ' : i === 1 ? 'else if ' : '') + cond, fs: 14, mono: true, fw: 700, stroke: hit ? GOOD : reached ? BAD : GRID, color: hit ? GOOD : reached ? INK : MUT, s: pop(u, a) });
        if (reached && ok !== null) lamp(580, y, ok, pop(u, a + 0.4));
        mono(640, y + 5, body, { 'font-size': 15, 'font-weight': 700, fill: hit ? ACC : OFF, 'text-decoration': hit ? null : 'line-through', opacity: fade(u, a + 0.5) }); });
      dot([[150, 110], [150, 170], [250, 170], [250, 250], [380, 250]], seg(u, 0.3, 1.5), INFO, 8);
      tag(480, 400, '위에서부터 처음 참인 가지 하나만 남는다', INK, fade(u, 2.0), { 'font-size': 15 }); return; }
    // k === 4: and
    vals(30, 40, 260, [['ingress:'], ['  enabled: true', 1], ['  tls: false', 'bad']]);
    line(330, 70, [['{{- if '], ['and .Values.ingress.enabled .Values.ingress.tls', ACC, 1], [' }}']], { fs: 14 });
    lamp(420, 200, true, pop(u, 0.4), 'enabled'); lamp(420, 290, false, pop(u, 0.7), 'tls');
    grow(440, 200, 600, 240, E(u, 0.9, 1.3), GOOD); grow(440, 290, 600, 252, E(u, 1.0, 1.4), BAD);
    gate(650, 245, 'and', false, pop(u, 1.4)); grow(700, 245, 760, 270, E(u, 1.6, 1.9), BAD);
    mono(720, 290, '# enabled 이면서 tls인 경우만', { 'font-size': 14, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.9) });
    tag(650, 340, '둘 다 참이어야 참', BAD, fade(u, 2.0), { 'font-size': 15 }); tag(480, 390, 'and·or는 함수처럼 맨 앞에 쓴다', MUT, fade(u, 2.3), { 'font-size': 14.5 }); }

  // ---------- 2. range ----------
  const HOSTS = ['a.example.com', 'b.example.com', 'c.example.com'];
  function hostCells(n, hot, o) { o = o || {}; HOSTS.concat(n > 3 ? ['d.example.com'] : []).forEach((h, i) => card(150, 110 + i * 52, 200, 40, { rx: 8, text: h, fs: 14.5, mono: true, fw: 800, stroke: i === hot ? ACC : i === 3 ? GOOD : INFO, color: i === hot ? ACC : i === 3 ? GOOD : INFO, fill: i === hot ? ACCBG : PANEL, s: o.s ? o.s(i) : 1 }));
    tx(50, 80, 'ingress.hosts', { 'font-size': 15, 'font-weight': 800, fill: INFO }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { line(440, 70, [['spec:']], { fs: 17 }); line(440, 102, [['  rules:']], { fs: 17 });
      el('rect', { x: 500, y: 122, width: 360, height: 150, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: fade(u, 0.4) });
      tag(680, 205, '항목 0개', OFF, fade(u, 0.6), { 'font-size': 17 }); hostCells(3, -1, { s: (i) => pop(u, 1.0 + i * 0.2) });
      tag(250, 300, 'host가 여러 개면?', WARN, fade(u, 1.8), { 'font-size': 15.5 }); tag(680, 320, '개수만큼 블록을 찍어 낼 반복이 필요하다', INK, fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1 || k === 4 || k === 5) { const n = k === 4 ? 4 : 3, it = Math.min(n - 1, Math.floor(clamp((u - 0.3) / (k === 4 ? 0.5 : 0.6), 0, n))), shown = k === 5 ? n : it + (u > 0.3 ? 1 : 0);
      hostCells(n, k === 5 ? -1 : it); line(40, 390, [['{{- range '], ['.Values.ingress.hosts', INFO, 1], [' }}  - host: '], ['{{ . }}', ACC, 1], ['  …  {{- end }}']], { fs: 13.5 });
      if (k !== 5) { el('line', { x1: 270, y1: 110 + it * 52, x2: 300, y2: 110 + it * 52, stroke: ACC, 'stroke-width': 3, 'marker-end': 'url(#ra-ahb)' }); mono(320, 116 + it * 52, '.', { 'font-size': 24, 'font-weight': 800, fill: ACC }); }
      mono(440, 70, '  rules:', { 'font-size': 15 });
      for (let i = 0; i < Math.min(shown, n); i++) { const y = 100 + i * (k === 5 ? 72 : 60), fresh = k === 4 ? i === 3 : true, op = k === 5 ? 1 : fade(u, 0.35 + i * (k === 4 ? 0.5 : 0.6));
        card(680, y + 14, 420, k === 5 ? 64 : 48, { rx: 10, stroke: i === 3 ? GOOD : INFO, sw: 2, op: op * 0.9 });
        mono(484, y + 10, '- host: ' + (HOSTS[i] || 'd.example.com'), { 'font-size': 15, 'font-weight': 700, fill: i === 3 ? GOOD : INFO, opacity: op });
        mono(484, y + 32, k === 5 ? '  http: paths: [ / Prefix ]' : '  http: …', { 'font-size': 13.5, fill: MUT, opacity: op }); }
      if (k === 4) tag(680, 370, '값 한 줄을 더하면 rule도 하나 는다', GOOD, fade(u, 2.2), { 'font-size': 15 });
      if (k === 5) tag(680, 330, 'hosts 3개 = rule 3개', ACC, fade(u, 0.6), { 'font-size': 16 });
      return; }
    if (k === 2) { hostCells(3, -1); line(420, 70, [['{{- range '], ['$index, $host', ACC, 1], [' := .Values.ingress.hosts }}']], { fs: 14 });
      HOSTS.forEach((h, i) => { const y = 160 + i * 70, a = 0.4 + i * 0.5;
        card(470, y - 6, 50, 40, { rx: 8, text: String(i), fs: 18, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, a) });
        mono(510, y, '→', { 'font-size': 16, fill: MUT, opacity: fade(u, a) }); mono(540, y, `# ${i} 번째: ${h}`, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, a + 0.2) });
        grow(250, 110 + i * 52, 444, y - 6, E(u, a, a + 0.4), GRID, { plain: true }); });
      tag(640, 380, '앞 변수 = 0부터 순번, 뒤 변수 = 값', INK, fade(u, 2.0), { 'font-size': 15 }); return; }
    // k === 3: 맵
    vals(40, 60, 280, [['env:'], ['  LOG_LEVEL: info', 1], ['  TIMEOUT: "30"', 1]]);
    line(360, 70, [['{{- range '], ['$key, $val', ACC, 1], [' := .Values.env }}']], { fs: 14.5 });
    [['LOG_LEVEL', 'info'], ['TIMEOUT', '30']].forEach(([kk, v], i) => { const y = 150 + i * 100, a = 0.5 + i * 0.7;
      card(420, y, 130, 36, { rx: 8, text: kk, fs: 14, mono: true, fw: 800, stroke: INFO, color: INFO, s: pop(u, a) }); card(560, y, 80, 36, { rx: 8, text: v, fs: 14, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, a + 0.1) });
      mono(660, y - 6, `- name: ${kk}`, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, a + 0.4) }); mono(660, y + 18, `  value: "${v}"`, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, a + 0.5) }); });
    tag(530, 370, '맵은 키 알파벳순으로 돈다', MUT, fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 3. with ----------
  const TREE = { root: [110, 230], res: [290, 140], lim: [450, 100], req: [450, 180], pod: [290, 320], team: [450, 290], tier: [450, 350] };
  function tree(hot) { const n = (key, s, col) => card(TREE[key][0], TREE[key][1], tw(s, 14) + 22, 32, { rx: 8, text: s, fs: 14, mono: true, fw: 800, stroke: hot.includes(key) ? ACC : GRID, color: hot.includes(key) ? ACC : (col || MUT), fill: hot.includes(key) ? ACCBG : PANEL });
    [['root', 'res'], ['res', 'lim'], ['res', 'req'], ['root', 'pod'], ['pod', 'team'], ['pod', 'tier']].forEach(([a, b]) => el('line', { x1: TREE[a][0] + 30, y1: TREE[a][1], x2: TREE[b][0] - 50, y2: TREE[b][1], stroke: GRID, 'stroke-width': 2 }));
    n('root', '$ (루트)', INK); n('res', '.Values.resources'); n('lim', 'limits'); n('req', 'requests'); n('pod', '.Values.podLabels'); n('team', 'team: platform'); n('tier', 'tier: web'); }
  function dotPtr(key, u, from) { const [x, y] = from && u < 1 ? [lerp(TREE[from][0], TREE[key][0], E(u, 0, 1)), lerp(TREE[from][1], TREE[key][1], E(u, 0, 1))] : TREE[key];
    el('circle', { cx: x, cy: y - 30, r: 13, fill: ACC }); tx(x, y - 25, '.', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: PANEL }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const P = ['.Values', '.image', '.repository'];
      P.forEach((s, i) => card(150 + i * 170, 110, 150, 40, { rx: 8, text: s, fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO, s: pop(u, 0.2 + i * 0.2) }));
      P.forEach((s, i) => card(150 + i * 170, 180, 150, 40, { rx: 8, text: i === 2 ? '.tag' : s, fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO, s: pop(u, 0.8 + i * 0.2) }));
      line(70, 280, [['image: '], ['my-app', ACC, 1], [':'], ['1.0.0', ACC, 1]], { fs: 20, op: fade(u, 1.6) });
      tag(740, 150, '같은 앞부분을', WARN, fade(u, 1.4), { 'font-size': 15 }); tag(740, 175, '줄마다 다시 적는다', WARN, fade(u, 1.5), { 'font-size': 15 });
      tag(480, 360, '경로가 깊을수록 길고 반복된다', INK, fade(u, 2.0), { 'font-size': 15.5 }); return; }
    if (k === 1 || k === 2) { tree(k === 1 ? ['res', 'lim'] : ['res', 'req']); dotPtr('res', k === 1 ? seg(u, 0.2, 0.9) : (u < 1.8 ? 1 : 1), k === 1 ? 'root' : null);
      if (k === 2 && u > 1.8) { el('circle', { cx: TREE.root[0], cy: TREE.root[1] - 30, r: 13, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }); tag(TREE.root[0], TREE.root[1] + 40, 'end 뒤 . 은 원래대로', ACC, fade(u, 1.9)); }
      line(560, 60, [['{{- with '], ['.Values.resources', ACC, 1], [' }}']], { fs: 15 });
      const L = [['resources:'], ['  limits:'], ['    cpu: ', '{{ .limits.cpu | quote }}', '"1"'], ['    memory: ', '{{ .limits.memory }}', '512Mi'], ['  requests:'], ['    cpu: ', '{{ .requests.cpu | quote }}', '"250m"'], ['    memory: ', '{{ .requests.memory }}', '256Mi']];
      L.forEach(([a, act, v], i) => { if (k === 1 && i > 3) return; const y = 100 + i * 34, isNew = k === 1 ? i >= 0 : i >= 4, at = 0.6 + (k === 1 ? i : i - 4) * 0.3, done = !act || !isNew || u > at + 0.5;
        line(560, y, act ? [[a], [done ? v : act, done ? ACC : MUT, done]] : [[a]], { fs: 14.5, op: isNew ? fade(u, at) : 1 }); });
      if (k === 2) line(560, 100 + 7 * 34, [['{{- end }}', ACC, 1]], { fs: 14.5, op: fade(u, 1.6) });
      tag(720, 400, k === 1 ? '.Values.resources를 . 하나로' : 'end를 만나면 스코프가 끝난다', INK, fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 3 || k === 4) { tree(k === 3 ? ['pod', 'team', 'tier'] : ['pod', 'root']);
      if (k === 3) { const ph = u < 0.8 ? 0 : u < 1.6 ? 1 : 2; dotPtr(ph === 0 ? 'pod' : ph === 1 ? 'team' : 'tier', ph === 0 ? seg(u, 0.1, 0.7) : 1, ph === 0 ? 'root' : null);
        line(560, 60, [['{{- with '], ['.Values.podLabels', ACC, 1], [' }}']], { fs: 14.5 }); line(580, 90, [['{{- range '], ['$k, $v', ACC, 1], [' := . }}']], { fs: 14.5 });
        mono(560, 150, 'labels:', { 'font-size': 15 }); [['team: platform', 0.9], ['tier: web', 1.7]].forEach(([s, a]) => mono(580, 150 + (a > 1 ? 2 : 1) * 30, s, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, a) }));
        tag(720, 330, '. 이 두 번 바뀌었다', ACC, fade(u, 2.0), { 'font-size': 15 }); tag(720, 356, 'podLabels → 각 라벨 값', MUT, fade(u, 2.1), { 'font-size': 14.5 }); return; }
      dotPtr('pod', 1); mono(560, 70, 'with .Values.podLabels 안에서', { 'font-size': 14.5, fill: MUT });
      line(560, 120, [['app: {{ '], ['.Release.Name', BAD, 1], [' }}']], { fs: 15, op: fade(u, 0.3) }); cross(900, 114, 10, pop(u, 0.8));
      tag(720, 150, 'podLabels 안에서 Release를 찾다가 렌더 오류', BAD, fade(u, 0.9), { 'font-size': 14 });
      line(560, 220, [['app: {{ '], ['$.Release.Name', GOOD, 1], [' }}']], { fs: 15, op: fade(u, 1.3) }); check(900, 214, 10, pop(u, 1.7));
      el('path', { d: `M${TREE.root[0] + 10},${TREE.root[1] - 46} Q300,30 555,205`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
      line(560, 280, [['app: '], ['my-app', ACC, 1]], { fs: 16, op: fade(u, 1.9) }); line(560, 310, [['chart: '], ['mychart', ACC, 1]], { fs: 16, op: fade(u, 2.1) });
      tag(720, 370, '$ 는 실행 내내 루트를 가리킨다', GOOD, fade(u, 2.3), { 'font-size': 15 }); return; }
    // k === 5: 값이 없으면 통째로 빠진다
    [['podLabels 있음', true, 60], ['podLabels 없음', false, 500]].forEach(([nm, has, x], i) => { const a = 0.3 + i * 0.8;
      tx(x, 60, nm, { 'font-size': 16, 'font-weight': 800, fill: has ? INFO : WARN, opacity: fade(u, a) });
      paper(x, 80, 380, 230, 'rendered', { tcol: ACC, op: fade(u, a) });
      const L = ['metadata:', '  labels:', '    team: platform', '    tier: web', '    app: my-app', '    chart: mychart'];
      L.forEach((s, j) => { if (!has && j > 0) { if (j === 1) { const f = E(u, a + 0.5, a + 1.2); el('rect', { x: x + 14, y: 140, width: 320 * (1 - f) + 4, height: 120 * (1 - f) + 4, rx: 6, fill: BADBG, opacity: 1 - f }); } return; }
        mono(x + 16, 128 + j * 26, s, { 'font-size': 14.5, fill: j > 1 ? ACC : INK, 'font-weight': j > 1 ? 700 : 400, opacity: fade(u, a + 0.1 + j * 0.08) }); });
      if (!has) tag(x + 190, 200, 'with 블록이 통째로 빠졌다', WARN, fade(u, a + 1.2), { 'font-size': 15 }); });
    tag(480, 370, 'with = 빈 값 검사 + 스코프 바꾸기. if를 따로 쓸 필요가 없다', INK, fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 4. 실무 조합: prod 와 dev ----------
  const PROD = [['- name: app', 0], ['  image: my-app:1.0.0', 0], ['  env:', 1], ['  - name: RELEASE', 1], ['  - name: LOG_LEVEL', 1, 'loop'], ['  - name: FEATURE_X', 1, 'loop'],
    ['  resources:', 2], ['    limits: { cpu: "1" }', 2], ['  livenessProbe:', 3], ['    httpGet: /healthz', 3], ['volumes:', 4], ['- name: tls  (secret)', 4]];
  const DEV = { 0: 'same', 1: 'release', 2: 'none', 3: 'none', 4: 'none' };
  function s4(t, c) { const { k, u } = c;
    const head = [['prod', 'env: prod · tls: true', ACC, 40], ['dev', 'env: dev · tls: false', MUT, 500]];
    head.forEach(([nm, v, col, x]) => { tx(x, 36, nm, { 'font-size': 18, 'font-weight': 800, fill: col }); mono(x + 60, 36, v, { 'font-size': 13.5, fill: MUT }); el('rect', { x, y: 50, width: 420, height: 350, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 2 }); });
    let yp = 80, yd = 80;
    PROD.forEach(([s, step, kind]) => { if (step > k) return; const isNew = step === k, op = isNew ? fade(u, 0.3 + (kind ? 0.5 : 0)) : 1;
      mono(56, yp, s, { 'font-size': 14.5, fill: isNew ? (kind ? INFO : ACC) : INK, 'font-weight': isNew ? 700 : 400, opacity: op }); yp += 26;
      const dv = DEV[step]; if (dv === 'same' || (dv === 'release' && !kind)) { mono(516, yd, s, { 'font-size': 14.5, fill: isNew ? ACC : INK, 'font-weight': isNew ? 700 : 400, opacity: op }); yd += 26; } });
    const miss = { 1: 'extraEnv 없음 → 반복 0번', 2: 'resources 없음 → with 건너뜀', 3: 'env = dev → if 거짓', 4: 'tls = false → if 거짓' }[k];
    if (miss) { el('rect', { x: 516, y: yd - 16, width: 380, height: 34, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.0) });
      tag(706, yd + 6, miss, BAD, fade(u, 1.1), { 'font-size': 14.5 }); }
    const KW = { 1: 'range', 2: 'with', 3: 'if eq "prod"', 4: 'if .tls' }[k];
    if (KW) pill(400, 30, KW, ACC, pop(u, 0.2), { mono: true, fs: 14 });
    if (k === 0) tag(480, 380, '여기까지는 dev든 prod든 똑같다', INK, fade(u, 1.0), { 'font-size': 15 });
    if (k === 4) { mono(260, 395, `${PROD.length}줄`, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); mono(720, 395, '4줄', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.8) }); } }

  // ---------- 5. 공백 제어 ----------
  const BADT = '  - host: app\n  {{ if .Values.tls }}\n  tls: enabled\n  {{ end }}\n';
  const GOODT = '  - host: app\n  {{- if .Values.tls }}\n  tls: enabled\n  {{- end }}\n';
  function s5(t, c) { const { k, u } = c, fs = 15, lh = 30;
    if (k <= 1) { const on = k === 0; tx(40, 50, `template (대시 없음) · tls: ${on}`, { 'font-size': 15, 'font-weight': 800, fill: MUT });
      chars(40, 100, BADT, { fs, lh, st: (i, ch) => inAct(BADT, i) && ch !== ' ' && ch !== '\n' ? { fill: ACC, op: 1 - 0.85 * E(u, 0.4, 1.2), fw: 700 } : (!on && i >= BADT.indexOf('\n  tls') + 3 && i < BADT.indexOf('  {{ end') ? { op: 1 - 0.85 * E(u, 0.4, 1.2) } : null) });
      const RES = on ? '  - host: app\n  \n  tls: enabled\n  \n' : '  - host: app\n  \n';
      tx(560, 50, 'rendered', { 'font-size': 15, 'font-weight': 800, fill: ACC }); grow(400, 150, 540, 150, E(u, 1.2, 1.6), MUT);
      if (u > 1.5) chars(560, 100, RES, { fs, lh, st: blankLines(RES) });
      tag(720, 300, on ? '참이어도 tls 위아래에 공백만 있는 줄' : '공백만 있는 줄 하나가 남는다', WARN, fade(u, 2.0), { 'font-size': 15 });
      tag(720, 330, on ? '값은 맞으니 문제는 거짓일 때 더 눈에 띈다' : 'YAML은 이 줄을 건너뛰어 읽는다', MUT, fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 2 || k === 3) { tx(40, 50, `template (대시 있음) · tls: false`, { 'font-size': 15, 'font-weight': 800, fill: MUT });
      chars(40, 100, GOODT, { fs, lh, st: k === 3 ? eatStyle(GOODT, u, 0.4, 0.6) : (i, ch) => inAct(GOODT, i) && ch !== ' ' && ch !== '\n' ? { fill: ACC, fw: 700 } : null });
      if (k === 2) { tag(560, 200, '앞부분은 나쁜 예와 같다', INK, fade(u, 0.6), { 'font-size': 15, 'text-anchor': 'start' }); tag(560, 230, '여는 태그 앞에 대시를 붙였다', ACC, fade(u, 1.2), { 'font-size': 15, 'text-anchor': 'start' }); return; }
      tx(560, 50, 'rendered', { 'font-size': 15, 'font-weight': 800, fill: ACC }); grow(400, 150, 540, 150, E(u, 1.6, 1.9), MUT);
      if (u > 1.8) chars(560, 100, '  - host: app\n', { fs, lh }); tag(720, 230, '빈 줄 없이 다음 키로 이어진다', GOOD, fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 4) { const S = '  hosts: "{{- range .Values.items -}}\n  {{ . }},\n  {{- end -}}"';
      tx(40, 50, 'template · items: [a, b, c]', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      chars(40, 100, S, { fs, lh: 34, st: eatStyle(S, u, 0.3, 0.4) });
      ['a', 'b', 'c'].forEach((v, i) => { const a = 1.3 + i * 0.3; card(560 + i * 70, 230, 56, 40, { rx: 8, text: v + ',', fs: 17, mono: true, fw: 800, stroke: INFO, color: INFO, s: pop(u, a) }); });
      line(560, 310, [['hosts: '], ['"a,b,c,"', ACC, 1]], { fs: 19, op: fade(u, 2.2) });
      tag(480, 390, '양쪽 대시는 한 줄로 붙여도 되는 자리에만', WARN, fade(u, 2.4), { 'font-size': 15 }); return; }
    // k === 5: 검증
    terminal(30, 30, 560, 190, ['$ helm template my-app . \\', '    --show-only templates/whitespace.yaml', 'spec:', '  rules:', '  - host: app.example.com', '…'], lerp(1, 6, E(u, 0.2, 1.4)), { title: '출력 예시' });
    [['빈 줄이 남았나', '눈으로 본다', WARN, 270], ['YAML이 깨졌나', 'kubectl apply --dry-run=client', BAD, 330]].forEach(([a, b, col, y], i) => {
      tx(60, y, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.4 + i * 0.4) }); mono(250, y, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5 + i * 0.4) }); });
    card(780, 130, 260, 120, { rx: 12, stroke: ACC, sw: 2, s: pop(u, 1.0) }); tx(780, 112, 'helm lint .', { 'text-anchor': 'middle', 'class': 'mono', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
    tx(780, 146, '렌더 오류를 미리 잡는다', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.2) }); }

  const quiz = [
    { q: 'env가 staging일 때 if eq prod / else if eq staging / else 구조에서 렌더되는 것은 무엇인가?',
      o: ['운영 전용 설정과 스테이징 설정 둘 다', '스테이징 설정 하나만', '개발 기본값 하나만'], a: 1,
      why: '위에서부터 검사해 처음 참인 가지 하나만 렌더한다. prod 비교는 거짓, staging 비교가 참이라 두 번째 가지만 남는다.' },
    { q: 'hosts에 d.example.com을 더하면 range로 만든 rules는 어떻게 되나?',
      o: ['템플릿을 고쳐야 4번째 rule이 생긴다', '그대로 3개다', 'rule이 4개가 된다'], a: 2,
      why: 'range는 리스트 항목 수만큼 블록을 찍는다. 값 한 줄을 더하면 템플릿을 건드리지 않아도 rule이 하나 는다.' },
    { q: 'with .Values.podLabels 안에서 릴리스 이름을 넣으려면 무엇을 써야 하는가?',
      o: ['$.Release.Name', '.Release.Name', '.podLabels.Release.Name'], a: 0,
      why: 'with 안에서 . 은 podLabels라 .Release를 찾지 못한다. $는 실행 내내 루트라서 $.Release.Name이 my-app을 준다.' },
    { q: 'dev values에 resources가 없을 때, with .Values.resources 블록은 어떻게 되나?',
      o: ['resources: 한 줄만 남는다', '블록이 통째로 렌더되지 않는다', '렌더 오류가 난다'], a: 1,
      why: 'with는 빈 값이면 블록을 건너뛴다. 그래서 dev 매니페스트에는 resources 키 자체가 없다.' },
    { q: 'tls가 false일 때 대시 없이 쓴 if 블록 자리에 남는 것은 무엇인가?',
      o: ['tls: enabled 줄', 'YAML 파싱 오류', '공백만 있는 줄 하나'], a: 2,
      why: 'if부터 end까지는 빠지지만 if 앞 들여쓰기와 end 뒤 줄바꿈이 남아 빈 줄이 생긴다. YAML은 이 줄을 건너뛴다.' },
  ];

  const summary = [
    'if는 조건이 거짓이면 블록을 통째로 빼고, else if는 처음 참인 가지 하나만 남긴다.',
    'range는 리스트 항목 수만큼 블록을 찍고, 맵은 키와 값을 함께 준다.',
    'with는 빈 값이면 건너뛰고 안에서 점을 바꾼다. 루트 값은 $로 꺼낸다.',
    '태그 줄에 대시가 없으면 빈 줄이 남고, 렌더 결과는 helm template으로 확인한다.',
  ];
  const review = [
    { q: 'dev와 prod를 한 차트로 쓰는데 dev 매니페스트에 livenessProbe가 붙어 나왔다. 먼저 볼 것은?',
      o: ['dev values의 env 값이 prod로 들어갔는지', 'range가 extraEnv를 몇 번 돌았는지', 'with .Values.resources가 비었는지'], a: 0,
      why: 'probe는 if eq .Values.env "prod"일 때만 붙는다. dev에 붙었다면 그 values의 env가 prod인지부터 본다.' },
    { q: 'with .Values.podLabels 안에서 app: {{ .Release.Name }}을 썼더니 렌더 오류가 났다. 어떻게 고치나?',
      o: ['with를 range로 바꾼다', '.Release.Name을 $.Release.Name으로 바꾼다', 'podLabels에 Release 키를 더한다'], a: 1,
      why: 'with 안의 점은 podLabels 맵이라 Release가 없다. $는 스코프와 상관없이 루트라 릴리스 이름에 닿는다.' },
    { q: 'items를 한 줄로 잇는다며 data: | 다음 줄에 {{- range … -}}를 썼더니 YAML 오류가 났다. 원인은?',
      o: ['range가 리스트를 못 돌아서', 'items에 쉼표가 없어서', '대시가 줄바꿈을 먹어 | 바로 뒤에 글이 붙어서'], a: 2,
      why: '{{-가 앞 줄바꿈까지 먹어 data: |abc가 된다. 블록 표시자 | 뒤에 글이 붙으면 YAML이 읽지 못한다.' },
  ];

  R.page({ title: '값에 따라 달라지는 매니페스트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
