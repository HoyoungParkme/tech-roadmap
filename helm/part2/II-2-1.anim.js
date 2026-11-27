/* II-2-1 템플릿 함수와 파이프 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 도우미 ----------
  function paper(x, y, w, h, title, o) { o = o || {};
    el('path', { d: `M${x},${y} h${w - 22} l22,22 v${h - 22} h${-w} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round', opacity: o.op ?? 1 });
    el('path', { d: `M${x + w - 22},${y} v22 h22`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    mono(x + 14, y + 21, title, { 'font-size': 13.5, 'font-weight': 800, fill: o.tcol || MUT, opacity: o.op ?? 1 }); }
  // 고정폭 글: 조각마다 폭을 맞춰 이어 쓴다. parts = [[글, 색?, 굵게?]]
  function line(x, y, parts, o) { o = o || {}; const fs = o.fs || 15; let cx = x;
    parts.forEach(([p, col, b]) => { const w = tw(p, fs); mono(cx, y, p, { 'font-size': fs, fill: col || INK, 'font-weight': b ? 800 : 400, opacity: o.op ?? 1, textLength: w, lengthAdjust: 'spacing' }); cx += w; }); return cx; }
  function fnBox(cx, cy, s, o) { o = o || {}; card(cx, cy, tw(s, 14) + 28, 40, { rx: 8, text: s, fs: 14, mono: true, fw: 800, stroke: o.col || ACC, color: o.col || ACC, fill: o.fill || ACCBG, s: o.s, op: o.op }); }
  function tube(x1, x2, y, u) { if (u <= 0) return; el('line', { x1, y1: y, x2: lerp(x1, x2, clamp(u)), y2: y, stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' }); }
  function capsule(cx, cy, s, o) { o = o || {}; card(cx, cy, tw(s, 14) + 24, 30, { rx: 15, text: s, fs: 14, mono: true, fw: 800, fill: o.fill || PANEL, stroke: o.col || INK, color: o.col || INK, dash: o.dash, s: o.s, op: o.op }); }
  function tag(cx, cy, s, col, op, a) { mono(cx, cy, s, Object.assign({ 'font-size': 13.5, 'font-weight': 700, fill: col || MUT, 'text-anchor': 'middle', opacity: op ?? 1 }, a || {})); }
  // 값이 파이프를 타고 흐른다: stages = [[함수 이름, 결과]], 첫 값 v0. 함수 상자 사이를 지나며 글이 바뀐다
  function flow(y, v0, stages, u, o) { o = o || {}; const x0 = o.x0 || 90, x1 = o.x1 || 880, n = stages.length, xs = stages.map((_, i) => lerp(x0, x1, (i + 1) / (n + 1)));
    const a = o.a ?? 0.2; tube(x0, x1, y, E(u, a, a + 0.5));
    stages.forEach(([f], i) => fnBox(xs[i], y, f, { s: pop(u, a + 0.1 + i * 0.12) }));
    const p = E(u, a + 0.4, o.b ?? 2.2), x = lerp(x0 - 10, x1, p); let v = v0, k = -1; xs.forEach((sx, i) => { if (x > sx) { v = stages[i][1]; k = i; } });
    const empty = v === '' || v == null, show = empty ? '(빈 값)' : v;
    const inside = stages.some(([f], i) => Math.abs(x - xs[i]) < (tw(f, 14) + 28) / 2 + (tw(show, 14) + 24) / 2 - 6);
    if (p > 0 && !inside) capsule(x, y, show, { dash: empty ? '4 4' : null, col: k < 0 ? (o.c0 || INFO) : ACC, fill: k < 0 ? (o.f0 || INFOBG) : ACCBG });
    return { xs, done: p >= 1 }; }
  // 글자 칸: 공백은 · 로
  function charRow(x, y, s, fs, st) { const cw = fs * 0.6; [...s].forEach((ch, i) => { const o = (st && st(i, ch)) || {};
      if (o.bg) el('rect', { x: x + i * cw, y: y - fs + 1, width: cw, height: fs + 6, fill: o.bg, opacity: o.op ?? 1 });
      tx(x + i * cw + cw / 2, y, ch === ' ' ? '·' : ch, { 'text-anchor': 'middle', class: 'mono', 'font-size': fs, fill: o.fill || (ch === ' ' ? OFF : INK), 'font-weight': o.fw || 700, opacity: o.op ?? 1 }); }); return cw; }

  // ---------- 1. 파이프 ----------
  function s1(t, c) { const { k, u } = c;
    paper(30, 24, 220, 70, 'values.yaml', { tcol: INFO, stroke: INFO }); line(46, 76, [['name: '], ['myApp', INFO, 1]]);
    if (k === 0) { fly(200, 70, 480, 210, seg(u, 0.5, 1.4), 'myApp', { mono: true, fill: INFO, stay: true });
      tag(480, 260, '.Values.name', INFO, fade(u, 1.3), { 'font-size': 16 }); tag(480, 300, '아직 아무 함수도 거치지 않은 날 값', MUT, fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { // 중첩: 상자 안에 상자
      line(300, 70, [['{{ ', MUT], ['quote', ACC, 1], [' ('], ['upper', WARN, 1], [' .Values.name', INFO, 1], [')'], [' }}', MUT]], { fs: 17 });
      card(480, 230, 560, 150, { rx: 14, stroke: ACC, sw: 2.5, fill: PANEL }); mono(220, 178, 'quote', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      card(500, 240, 380, 80, { rx: 12, stroke: WARN, sw: 2.5, fill: WARNBG, s: pop(u, 0.2) }); mono(330, 222, 'upper', { 'font-size': 16, 'font-weight': 800, fill: WARN });
      const inner = u > 1.0 ? 'MYAPP' : 'myApp'; mono(500, 254, inner, { 'font-size': 20, 'font-weight': 800, fill: u > 1.0 ? WARN : INFO, 'text-anchor': 'middle' });
      if (u > 1.8) mono(740, 254, '→ "MYAPP"', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      [[500, 345, '① 안쪽 upper 먼저', 0.6], [220, 345, '② 바깥 quote 나중', 1.4]].forEach(([x, y, s, a]) => tag(x, y, s, INK, fade(u, a), { 'font-size': 15 }));
      tag(480, 400, '읽는 순서가 쓴 순서와 반대다', BAD, fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { line(300, 70, [['{{ '], ['.Values.name', INFO, 1], [' | '], ['upper', ACC, 1], [' }}']], { fs: 17 });
      flow(220, 'myApp', [['upper', 'MYAPP']], u, { x0: 120, x1: 840 });
      tag(480, 300, '왼쪽 값이 오른쪽 함수로 흘러간다', INK, fade(u, 1.8), { 'font-size': 16 });
      grow(260, 340, 700, 340, E(u, 0.3, 1.6), MUT); tag(480, 370, '읽는 방향 = 흐르는 방향', MUT, fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 3) { line(300, 70, [['{{ '], ['.Values.name', INFO, 1], [' | '], ['upper', ACC, 1], [' | '], ['quote', ACC, 1], [' }}']], { fs: 17 });
      flow(170, 'myApp', [['upper', 'MYAPP'], ['quote', '"MYAPP"']], u, { x0: 120, x1: 840, b: 1.6 });
      [['app1:', 'quote (upper .Values.name)', 280], ['app2:', '.Values.name | upper | quote', 330]].forEach(([a, b, y], i) => {
        line(150, y, [[a + ' '], [b, MUT]], { fs: 15, op: fade(u, 1.5 + i * 0.2) }); mono(700, y, '"MYAPP"', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9 + i * 0.2) }); });
      tx(810, 312, '같다', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.3) }); check(860, 306, 11, pop(u, 2.3)); return; }
    // k === 4: 마지막 인자 규칙
    [['value | printf "%s-svc"', 'printf "%s-svc" ', 150, 0.2], ['.Values.name | upper', 'upper ', 290, 1.1]].forEach(([a, b, y, d]) => {
      mono(60, y, a, { 'font-size': 18, 'font-weight': 800, fill: INK, opacity: fade(u, d) }); mono(470, y, '==', { 'font-size': 18, fill: MUT, opacity: fade(u, d + 0.3) });
      const end = line(540, y, [[b, ACC, 1]], { fs: 18, op: fade(u, d + 0.3) });
      el('rect', { x: end + 2, y: y - 20, width: 86, height: 28, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, d + 0.3) });
      const from = a.startsWith('value') ? [80, y - 24] : [110, y - 24];
      el('path', { d: `M${from[0]},${from[1]} Q${(from[0] + end + 40) / 2},${y - 90 * E(u, d + 0.4, d + 1.0)} ${end + 44},${y - 22}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, d + 0.4) });
      tag(end + 45, y + 30, '마지막 인자', ACC, fade(u, d + 0.8)); });
    tag(480, 390, '파이프로 넘어온 값은 오른쪽 함수의 맨 끝 칸에 들어간다', INK, fade(u, 2.2), { 'font-size': 15 }); }

  // ---------- 2. 자주 쓰는 함수 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { paper(60, 60, 420, 140, 'values.yaml', { tcol: INFO, stroke: INFO });
      line(80, 116, [['fullName: '], ['""', INFO, 1]], { op: fade(u, 0.3) }); line(80, 150, [['name: '], ['My-Long-Service-Name', INFO, 1]], { op: fade(u, 0.7) });
      capsule(680, 110, '(빈 값)', { dash: '4 4', col: WARN, s: pop(u, 1.0) }); tag(680, 150, '그대로 쓰면 이름이 없다', WARN, fade(u, 1.2));
      capsule(680, 220, 'My-Long-Service-Name', { col: WARN, s: pop(u, 1.4) }); tag(680, 260, '대문자 섞임 · 라벨에 쓰기 전 다듬기', WARN, fade(u, 1.6));
      tag(480, 340, '빈 값 · 대소문자 · 길이 · 공백을 함수 한 줄로 다듬는다', INK, fade(u, 2.0), { 'font-size': 15.5 }); return; }
    if (k === 1) { line(40, 60, [['{{ '], ['.Values.fullName', INFO, 1], [' | default "app" | printf "%s-svc" | quote }}']], { fs: 15 });
      flow(180, '', [['default "app"', 'app'], ['printf "%s-svc"', 'app-svc'], ['quote', '"app-svc"']], u, { x0: 80, x1: 900, b: 2.2 });
      line(330, 300, [['name: '], ['"app-svc"', ACC, 1]], { fs: 18, op: fade(u, 2.2) }); return; }
    if (k === 2) { const NM = 'My-Long-Service-Name', low = NM.toLowerCase(), fs = 15, cw = fs * 0.6, x0 = 60, X = (i) => x0 + i * cw;
      line(40, 50, [['{{ '], ['.Values.name', INFO, 1], [' | lower | trunc 63 | trimSuffix "-" | quote }}']], { fs: 15 });
      const lo = E(u, 0.3, 1.1); charRow(x0, 130, NM, fs, (i, ch) => { const up = ch !== low[i]; return up ? { fill: lo > (i / NM.length) ? ACC : WARN } : null; });
      if (lo > 0.95) { el('rect', { x: x0 - 4, y: 112, width: NM.length * cw + 8, height: 26, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 1.5 }); }
      tag(x0 + NM.length * cw + 60, 130, lo < 1 ? 'lower' : '→ ' + low, ACC, 1, { 'text-anchor': 'start' });
      // 63칸 자
      const ry = 220, f = E(u, 1.0, 1.8); el('rect', { x: x0, y: ry, width: 63 * cw * f, height: 20, rx: 3, fill: SOFT, stroke: GRID });
      for (let i = 0; i <= 63; i += 9) if (i / 63 <= f) { el('line', { x1: X(i), y1: ry + 20, x2: X(i), y2: ry + 28, stroke: MUT }); }
      el('rect', { x: x0, y: ry, width: low.length * cw * E(u, 1.4, 2.0), height: 20, rx: 3, fill: ACC, opacity: 0.8 });
      el('line', { x1: X(63), y1: ry - 12, x2: X(63), y2: ry + 34, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.6) });
      tag(X(63), ry + 52, '63자 한도', BAD, fade(u, 1.6)); tag(X(20), ry + 52, '20자', ACC, fade(u, 2.0));
      tag(480, 340, '넘으면 앞 63자만 남기고, 끝에 -가 남으면 trimSuffix가 뗀다', INK, fade(u, 2.2), { 'font-size': 15 });
      tag(480, 372, '라벨 값은 63자 이하, 영숫자로 시작하고 끝나야 한다', MUT, fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 3) { line(40, 60, [['{{ printf '], ['"https://%s.%s"', ACC, 1], [' '], ['.Values.host', INFO, 1], [' '], ['.Values.domain', INFO, 1], [' | quote }}']], { fs: 15 });
      const fs = 24, x0 = 230, y = 200; const parts = [['https://', INK], ['%s', ACC], ['.', INK], ['%s', ACC]]; let cx = x0; const slots = [];
      parts.forEach(([p, col]) => { const w = tw(p, fs); if (p === '%s') { el('rect', { x: cx - 3, y: y - fs, width: w + 6, height: fs + 10, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); slots.push(cx + w / 2); }
        mono(cx, y, p, { 'font-size': fs, 'font-weight': 800, fill: col, textLength: w, lengthAdjust: 'spacing', opacity: p === '%s' && u > 1.25 ? 0.15 : 1 }); cx += w; });
      fly(200, 320, slots[0], y - 8, seg(u, 0.4, 1.3), 'app', { mono: true, fill: INFO, stay: true }); fly(560, 320, slots[1] + 30, y - 8, seg(u, 0.9, 1.8), 'example.com', { mono: true, fill: INFO, stay: true });
      tag(200, 350, 'host = app', INFO, fade(u, 0.2)); tag(560, 350, 'domain = example.com', INFO, fade(u, 0.2));
      if (u > 1.7) line(230, 270, [['url: '], ['"https://app.example.com"', ACC, 1]], { fs: 18, op: fade(u, 1.8) }); return; }
    if (k === 4) { line(40, 60, [['{{ '], ['.Values.owner', INFO, 1], [' | trim | quote }}']], { fs: 15 });
      const S = '  devops  ', fs = 24, x0 = 300, cw = fs * 0.6, f = E(u, 0.5, 1.5);
      charRow(x0, 180, S, fs, (i, ch) => ch === ' ' ? { fill: BAD, op: 1 - f } : null);
      if (f > 0) [[0, 2], [8, 10]].forEach(([a, b]) => el('line', { x1: x0 + a * cw, y1: 172, x2: x0 + (a + (b - a) * f) * cw, y2: 172, stroke: BAD, 'stroke-width': 2.5 }));
      tag(x0 + S.length * cw / 2, 220, '앞뒤 공백 · 두 칸씩', BAD, fade(u, 0.4));
      grow(480, 240, 480, 280, E(u, 1.5, 1.8), MUT);
      line(370, 320, [['owner: '], ['"devops"', ACC, 1]], { fs: 20, op: fade(u, 1.9) });
      tag(480, 380, '공백이 남은 값은 라벨·이름 비교에서 조용히 어긋난다', WARN, fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k === 5: 함수 목록
    const F = [['upper', '"myApp"', 'MYAPP'], ['lower', '"MyApp"', 'myapp'], ['title', '"my app"', 'My App'], ['trim', '" a "', 'a'],
      ['trimSuffix "-"', '"app-"', 'app'], ['trimPrefix "v"', '"v1.0"', '1.0'], ['trunc 3', '"hello"', 'hel'], ['replace "-" "_"', '"a-b"', 'a_b'], ['contains "app"', '"myapp"', 'true']];
    F.forEach(([f, a, b], i) => { const col = i % 3, row = Math.floor(i / 3), cx = 170 + col * 310, cy = 90 + row * 110, s = pop(u, 0.2 + i * 0.18);
      card(cx, cy, 290, 90, { rx: 12, stroke: GRID, sw: 2, s }); mono(cx, cy - 16, f, { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.18) });
      mono(cx, cy + 20, `${a} → ${b}`, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.18) }); });
    tag(480, 405, '대소문자 · 공백 · 길이 · 치환 · 포함 여부', MUT, fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 3. toYaml · nindent ----------
  const RES = ['limits:', '  cpu: 1', '  memory: 1Gi', 'requests:', '  cpu: 250m', '  memory: 512Mi'];
  function guides(x, y, h, cols, cw, op) { cols.forEach((n) => { el('line', { x1: x + n * cw, y1: y, x2: x + n * cw, y2: y + h, stroke: INFO, 'stroke-width': 1.2, 'stroke-dasharray': '3 4', opacity: op });
      mono(x + n * cw, y - 6, String(n), { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: op }); }); }
  function s3(t, c) { const { k, u } = c, fs = 15, cw = fs * 0.6;
    if (k === 0) { // values 의 맵 나무
      paper(40, 40, 330, 180, 'values.yaml', { tcol: INFO, stroke: INFO });
      ['resources:', '  requests: {cpu: 250m, memory: 512Mi}', '  limits:   {cpu: 1, memory: 1Gi}'].forEach((s, i) => mono(56, 92 + i * 30, s, { 'font-size': 14, opacity: fade(u, 0.2 + i * 0.2) }));
      const N = (x, y, s, a, col) => card(x, y, tw(s, 14) + 22, 32, { rx: 8, text: s, fs: 14, mono: true, fw: 800, stroke: col || INFO, color: col || INFO, fill: PANEL, s: pop(u, a) });
      N(560, 90, 'resources', 0.6); [['requests', 170, 0.9], ['limits', 290, 1.0]].forEach(([s, y, a]) => { grow(560, 108, 520, y - 18, E(u, a - 0.1, a + 0.2), GRID, { plain: true }); N(520, y, s, a);
        [['cpu', 0], ['memory', 1]].forEach(([kk, j]) => { const x = 690 + j * 140, v = s === 'requests' ? ['250m', '512Mi'][j] : ['1', '1Gi'][j]; grow(560, y, x - 50, y, E(u, a + 0.2, a + 0.5), GRID, { plain: true }); N(x, y, `${kk}: ${v}`, a + 0.4 + j * 0.15, INK); }); });
      tag(560, 380, '한 줄 값이 아니라 가지 달린 맵이다', WARN, fade(u, 2.0), { 'font-size': 15.5 }); return; }
    if (k === 1) { const L = ['      containers:', '        - name: app', '          image: my-app:1.0.0', '          resources:'];
      L.forEach((s, i) => line(80, 80 + i * 40, [[s, i === 2 ? INK : INK, i === 2]], { fs: 16, op: fade(u, 0.2 + i * 0.25) }));
      el('rect', { x: 80 + tw('          resources: ', 16), y: 80 + 3 * 40 - 20, width: 200, height: 28, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.3) });
      tag(80 + tw('          resources: ', 16) + 100, 80 + 3 * 40, '맵 하나 = 여러 줄', WARN, fade(u, 1.5));
      tag(600, 300, 'name · image 같은 한 줄 값은 {{ .Values.x }}로 끝난다', INK, fade(u, 1.8), { 'font-size': 15 });
      tag(600, 334, 'resources는 다른 방법이 필요하다', WARN, fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { const isEnv = k === 3, rows = isEnv ? ['- name: LOG_LEVEL', '  value: …'] : RES, key = isEnv ? '          env:' : '          resources:';
      line(40, 46, [['{{- '], ['toYaml', ACC, 1], [isEnv ? ' .Values.env' : ' .Values.resources', INFO, 1], [' | '], ['nindent 12', ACC, 1], [' }}']], { fs: 15 });
      const X0 = 60, sh = E(u, 1.0, 2.0) * 12;     // 12칸 밀기
      tag(X0 + 140, 78, 'toYaml이 만든 글 (0칸에서 시작)', ACC, fade(u, 0.3), { 'text-anchor': 'start' });
      guides(X0, 110, rows.length * 30 + 10, [0, 10, 12], cw, fade(u, 0.9));
      rows.forEach((s, i) => mono(X0 + sh * cw, 132 + i * 30, s, { 'font-size': fs, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3 + i * 0.1) }));
      if (u > 1.0) for (let i = 0; i < rows.length; i++) el('rect', { x: X0, y: 117 + i * 30, width: sh * cw, height: 20, fill: INFOBG, opacity: 0.8 });
      // 오른쪽: 들어간 자리
      const RX = 560; mono(RX, 132, key.trim(), { 'font-size': fs, 'font-weight': 700 }); tag(RX + 6, 112, '10칸', MUT, 1, { 'text-anchor': 'start' });
      if (u > 2.0) rows.forEach((s, i) => mono(RX + 2 * cw, 162 + i * 30, s, { 'font-size': fs, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0 + i * 0.05) }));
      tag(RX + 160, 150 + rows.length * 30 + 30, '12칸 = 키 깊이 10 + 2', INK, fade(u, 2.2), { 'font-size': 15 });
      tag(X0 + 200, 150 + rows.length * 30 + 30, 'nindent: 맨 앞 줄바꿈 + 모든 줄 12칸', INFO, fade(u, 1.6), { 'font-size': 14.5 });
      if (!isEnv) tag(480, 404, '키는 알파벳순: limits가 requests보다 먼저', MUT, fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 4) { const L = [['          resources:', INK], ...RES.map((s) => ['            ' + s, ACC]), ['          env:', INK], ['            - name: LOG_LEVEL', ACC]];
      paper(40, 20, 520, 380, 'helm template 결과', { tcol: ACC }); guides(56, 70, 320, [10, 12, 14], cw, fade(u, 0.3));
      L.forEach(([s, col], i) => mono(56, 92 + i * 33, s, { 'font-size': fs, fill: col, 'font-weight': col === ACC ? 700 : 400, opacity: fade(u, 0.2 + i * 0.15) }));
      card(770, 160, 300, 120, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 1.8) }); check(650, 130, 11, pop(u, 1.9));
      tx(675, 136, 'YAML 파싱 통과', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      tx(640, 170, 'values의 계층이 그대로 남았다', { 'font-size': 14.5, opacity: fade(u, 2.0) }); tx(640, 196, 'resources 아래 12칸에서 시작', { 'font-size': 14.5, opacity: fade(u, 2.1) }); return; }
    // k === 5: indent 와 nindent
    [['indent 12', 60, BAD], ['nindent 12', 250, GOOD]].forEach(([f, y, col], i) => { const a = 0.3 + i * 1.0;
      line(40, y, [['          resources:'], ['{{- toYaml .Values.resources | ', MUT], [f, col, 1], [' }}', MUT]], { fs: 14, op: fade(u, a) });
      if (i === 0) { line(40, y + 40, [['          resources:'], ['            limits:', BAD, 1]], { fs: 14, op: fade(u, a + 0.5) });
        line(40, y + 66, [['              cpu: 1 …', MUT]], { fs: 14, op: fade(u, a + 0.5) }); cross(690, y + 34, 11, pop(u, a + 0.7));
        tx(712, y + 40, '첫 줄이 resources: 뒤에 붙었다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, a + 0.7) });
        tx(712, y + 66, 'YAML 오류', { 'font-size': 14.5, fill: BAD, opacity: fade(u, a + 0.8) }); }
      else { line(40, y + 40, [['          resources:']], { fs: 14, op: fade(u, a + 0.5) }); line(40, y + 66, [['            limits:', GOOD, 1]], { fs: 14, op: fade(u, a + 0.5) });
        check(690, y + 50, 11, pop(u, a + 0.7)); tx(712, y + 56, '줄바꿈부터 넣어 제자리에 앉는다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, a + 0.7) }); } });
    tag(480, 400, '{{-가 앞 줄바꿈을 먹으니, 그 자리에는 nindent', INK, fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 4. Sprig ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { paper(40, 50, 300, 100, 'values.yaml', { tcol: INFO, stroke: INFO }); line(60, 110, [['password: '], ['s3cr3t', INFO, 1]], { fs: 16 });
      card(680, 120, 380, 120, { rx: 12, stroke: GRID, sw: 2, s: pop(u, 0.5) }); mono(510, 92, 'kind: Secret', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.6) });
      mono(510, 124, 'data:', { 'font-size': 15, opacity: fade(u, 0.7) }); mono(530, 154, 'password: ', { 'font-size': 15, opacity: fade(u, 0.8) });
      el('rect', { x: 630, y: 136, width: 150, height: 26, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.9) });
      fly(260, 110, 700, 148, seg(u, 1.1, 1.9), 's3cr3t', { mono: true, fill: INFO });
      if (u > 1.9) { cross(810, 150, 10, pop(u, 1.9)); tag(680, 220, 'data에는 base64로 바꾼 값만 넣는다', BAD, fade(u, 2.0), { 'font-size': 15 }); } return; }
    if (k === 1) { const L = [['apiVersion: v1'], ['kind: Secret', 1], ['metadata:'], ['  name: '], ['type: Opaque', 1], ['data:', 1]];
      paper(60, 40, 440, 300, 'templates/secret.yaml'); L.forEach(([s, b], i) => mono(80, 96 + i * 36, s, { 'font-size': 16, 'font-weight': b ? 800 : 400, opacity: fade(u, 0.2 + i * 0.2) }));
      const x = 80 + tw('  name: ', 16); line(x, 96 + 3 * 36, [['{{ .Release.Name }}', ACC, 1], ['-secret']], { fs: 16, op: u < 1.4 ? 1 : 0 });
      if (u >= 1.4) line(x, 96 + 3 * 36, [['my-app', ACC, 1], ['-secret']], { fs: 16 });
      el('rect', { x: 100, y: 96 + 5 * 36 + 14, width: 260, height: 30, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.8) });
      tag(230, 96 + 5 * 36 + 34, '키: base64 값', ACC, fade(u, 1.9));
      tag(720, 160, 'Opaque = 형식 없는 키·값', INK, fade(u, 1.0), { 'font-size': 15 }); tag(720, 200, '이름에도 릴리스 이름을 붙인다', MUT, fade(u, 1.5), { 'font-size': 15 }); return; }
    if (k === 2) { // base64: 3바이트 → 6비트 4조각
      line(40, 46, [['{{ '], ['.Values.password', INFO, 1], [' | '], ['b64enc', ACC, 1], [' | quote }}']], { fs: 15 });
      const G = [['s3c', 'czNj'], ['r3t', 'cjN0']];
      G.forEach(([a, b], gi) => { const x = 110 + gi * 400, sp = E(u, 0.7 + gi * 0.5, 1.4 + gi * 0.5);
        [...a].forEach((ch, i) => card(x + i * 64, 120, 56, 44, { rx: 6, text: ch, fs: 20, mono: true, fw: 800, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.2 + gi * 0.3 + i * 0.08) }));
        tag(x + 64, 162, '3바이트 = 24비트', MUT, fade(u, 0.5 + gi * 0.3));
        [...b].forEach((ch, i) => { const bx = x - 8 + i * 52 * sp + 0 * (1 - sp); card(lerp(x + 64, x - 16 + i * 64 * 0.86, sp), 240, 46, 44, { rx: 6, text: ch, fs: 20, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, op: fade(u, 0.7 + gi * 0.5) }); });
        tag(x + 64, 286, '6비트 × 4 = 글자 4개', ACC, fade(u, 1.3 + gi * 0.5)); grow(x + 64, 170, x + 64, 214, E(u, 0.6 + gi * 0.5, 0.9 + gi * 0.5), MUT); });
      line(250, 350, [['password: '], ['"czNjcjN0"', ACC, 1]], { fs: 19, op: fade(u, 2.0) });
      tag(480, 398, 'b64dec 한 번이면 s3cr3t가 돌아온다. 암호화가 아니다', BAD, fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 3) { line(30, 46, [['{{ '], ['.Values.token', INFO, 1], [' | default (randAlphaNum 16) | b64enc | quote }}']], { fs: 14.5 });
      flow(150, '', [['default (randAlphaNum 16)', 'a8Kd2Lp9QzX1mVbN'], ['b64enc', 'YThLZDJMcDlRelgxbVZiTg==']], u, { x0: 70, x1: 740, b: 2.0 });
      tag(480, 205, '값은 예시 · 렌더할 때마다 다르다', MUT, fade(u, 1.0), { 'font-size': 14 });
      [['install  (rev 1)', 'a8Kd2Lp9…', 0], ['upgrade  (rev 2)', '새로운 16자', 1]].forEach(([a, b, i]) => { const y = 280 + i * 50, op = fade(u, 1.6 + i * 0.3);
        mono(200, y, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(420, y, b, { 'font-size': 15, 'font-weight': 800, fill: i ? WARN : ACC, opacity: op }); });
      if (u > 2.1) { tag(740, 305, '앱이 알던 비밀번호와', BAD, fade(u, 2.1), { 'font-size': 14.5 }); tag(740, 330, '어긋난다', BAD, fade(u, 2.2), { 'font-size': 14.5 }); } return; }
    if (k === 4) { line(40, 60, [['{{- $ports := '], ['list 80 443 8080', ACC, 1], [' }}']], { fs: 17 });
      [80, 443, 8080].forEach((v, i) => card(150 + i * 90, 150, 80, 50, { rx: 8, text: String(v), mono: true, fs: 18, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.3 + i * 0.15) }));
      mono(60, 156, '$ports', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      [['{{- range $ports }}', INK], ['- {{ . }}', ACC], ['{{- end }}', INK]].forEach(([q, col], i) => line(60, 240 + i * 28, [[q, col, col === ACC]], { fs: 15, op: fade(u, 1.0) }));
      const hot = Math.floor(clamp((u - 1.2) / 0.35, 0, 3)); [80, 443, 8080].forEach((v, i) => { if (i < hot) mono(640, 140 + i * 40, '- ' + v, { 'font-size': 18, 'font-weight': 800, fill: ACC }); });
      if (hot < 3 && u > 1.2) el('rect', { x: 110 + hot * 90, y: 125, width: 80, height: 50, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 3 });
      tag(480, 360, 'values에 없는 배열도 템플릿 안에서 만들어 쓴다', INK, fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 5) { line(30, 50, [['{{- $labels := '], ['dict "app" "web" "tier" "front"', ACC, 1], [' }}']], { fs: 16 });
      [['app', 'web'], ['tier', 'front']].forEach(([a, b], i) => { const y = 120 + i * 50, s = pop(u, 0.3 + i * 0.2);
        card(150, y, 120, 40, { rx: 8, text: a, mono: true, fs: 16, fw: 800, stroke: INFO, color: INFO, fill: INFOBG, s }); card(290, y, 120, 40, { rx: 8, text: b, mono: true, fs: 16, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s }); });
      [['get $labels "app"', 'web', 0.9], ['hasKey $labels "app"', 'true', 1.3], ['keys $labels | sortAlpha', '[app tier]', 1.7], ['toYaml | nindent 4', 'app: web / tier: front', 2.1]].forEach(([a, b, d], i) => {
        const y = 100 + i * 64; mono(480, y, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, d) }); mono(480, y + 26, '→ ' + b, { 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: fade(u, d + 0.2) }); });
      tag(220, 250, 'keys 순서는 정해져 있지 않다', MUT, fade(u, 2.0), { 'font-size': 14 }); return; }
    // k === 6: Sprig 지도
    const CAT = [['해시·인코딩', 'sha256sum  b64enc  b64dec'], ['리스트', 'list  first  last  uniq'], ['딕셔너리', 'dict  get  hasKey  merge'], ['날짜·수학', 'now  date  add  mul']];
    CAT.forEach(([a, b], i) => { const cx = 250 + (i % 2) * 430, cy = 90 + Math.floor(i / 2) * 120, s = pop(u, 0.2 + i * 0.25);
      card(cx, cy, 400, 96, { rx: 12, stroke: ACC, sw: 2, s }); tx(cx, cy - 12, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.25) });
      mono(cx, cy + 22, b, { 'text-anchor': 'middle', 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.25) }); });
    card(480, 350, 640, 70, { rx: 12, stroke: BAD, sw: 2, dash: '6 5', s: pop(u, 1.5) });
    mono(240, 345, 'env  expandenv', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6), 'text-decoration': 'line-through' });
    tx(430, 344, 'Helm이 뺐다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
    tx(430, 368, '렌더 결과가 실행 머신의 환경에 따라 달라지지 않게', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); }

  // ---------- 5. include · template · required ----------
  const LBL = ['app.kubernetes.io/name: mychart', 'app.kubernetes.io/instance: my-app'];
  function shelf(o) { o = o || {}; paper(30, 30, 380, 150, '_helpers.tpl', { op: o.op });
    mono(46, 82, '{{- define "app.labels" -}}', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: o.op ?? 1 });
    LBL.forEach((s, i) => mono(62, 108 + i * 22, s.replace(': mychart', ': {{ .Chart.Name }}').replace(': my-app', ': {{ .Release.Name }}'), { 'font-size': 13.5, opacity: o.op ?? 1 }));
    mono(46, 162, '{{- end -}}', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: o.op ?? 1 }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { shelf(); paper(520, 30, 400, 200, 'rendered', { tcol: ACC });
      tag(720, 130, '(아무것도 없다)', OFF, fade(u, 1.2), { 'font-size': 16 });
      card(220, 270, 290, 52, { rx: 26, stroke: ACC, sw: 2.2, fill: ACCBG, s: pop(u, 0.6) }); mono(220, 276, '"app.labels"', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      tag(220, 320, '이름 붙여 선반에 올려 둔 조각', MUT, fade(u, 1.0), { 'font-size': 14.5 }); tag(720, 290, '_로 시작하는 파일은 매니페스트로 안 나온다', INK, fade(u, 1.6), { 'font-size': 14.5 });
      tag(720, 320, 'define은 정의일 뿐, 불러야 렌더된다', INK, fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1 || k === 2) { shelf({ op: 0.55 }); const inc = k === 1;
      line(450, 60, inc ? [['{{- '], ['include "app.labels" .', ACC, 1], [' | '], ['nindent 4', ACC, 1], [' }}']] : [['{{ '], ['template "app.labels" .', WARN, 1], [' }}']], { fs: 15 });
      if (inc) { capsule(640, 120, '"app.kubernetes.io/name: … ↵ …instance: my-app"', { col: ACC, fill: ACCBG, s: pop(u, 0.4) }); tag(640, 156, '문자열로 돌려준다', ACC, fade(u, 0.6)); grow(640, 170, 640, 200, E(u, 0.8, 1.1), MUT); }
      else { tag(640, 120, '돌려주는 값 없이 그 자리에 바로 찍는다', WARN, fade(u, 0.5), { 'font-size': 15 }); }
      const y0 = 236, cw = 13.5 * 0.6; mono(440, y0, 'metadata:', { 'font-size': 14 }); mono(440, y0 + 24, '  labels:', { 'font-size': 14 });
      el('line', { x1: 440 + 4 * cw, y1: y0 + 32, x2: 440 + 4 * cw, y2: y0 + 90, stroke: INFO, 'stroke-width': 1.2, 'stroke-dasharray': '3 4', opacity: fade(u, 1.0) });
      LBL.forEach((s, i) => { const ind = inc || i === 0 ? 4 : 0, bad = !inc && i === 1;
        if (bad) el('rect', { x: 436, y: y0 + 34 + i * 24, width: tw(s, 13.5) + 8, height: 22, rx: 4, fill: BADBG, opacity: fade(u, 1.6) });
        mono(440 + ind * cw, y0 + 50 + i * 24, s, { 'font-size': 13.5, 'font-weight': 700, fill: bad ? BAD : ACC, opacity: fade(u, 1.2 + i * 0.3) }); });
      if (inc) { check(830, y0 + 60, 11, pop(u, 1.9)); tag(640, 380, 'nindent 4가 두 줄 모두 labels 아래로', GOOD, fade(u, 2.0), { 'font-size': 15 }); }
      else { cross(830, y0 + 74, 11, pop(u, 1.9)); tag(640, 360, '둘째 줄이 맨 앞 칸으로 밀려 labels를 벗어났다', BAD, fade(u, 1.9), { 'font-size': 15 });
        tag(640, 392, '| nindent 4를 붙이면 렌더 오류', BAD, fade(u, 2.3), { 'font-size': 14.5 }); } return; }
    if (k === 3) { line(40, 60, [['{{ '], ['required "image.repo는 필수입니다"', WARN, 1], [' .Values.image.repo }}']], { fs: 15 });
      [['default', '빈 값 → 대신 채우고 계속', GOOD, 150], ['required', '빈 값 → 렌더를 멈춘다', BAD, 270]].forEach(([f, s, col, y], i) => { const a = 0.3 + i * 0.7;
        capsule(110, y, '(빈 값)', { dash: '4 4', col: MUT, s: pop(u, a) }); tube(170, 520, y, E(u, a, a + 0.4)); fnBox(360, y, f, { col, fill: i ? BADBG : GOODBG, s: pop(u, a + 0.1) });
        if (i === 0) capsule(lerp(360, 600, E(u, a + 0.5, a + 1.0)), y, '"app"', { col: GOOD, fill: GOODBG, op: fade(u, a + 0.5) });
        else { el('rect', { x: 470, y: y - 36, width: 12, height: 72, rx: 3, fill: BAD, opacity: fade(u, a + 0.6) }); }
        tag(720, y + 5, s, col, fade(u, a + 0.8), { 'font-size': 15, 'text-anchor': 'start' }); });
      tag(480, 380, '잘못된 설정이 클러스터에 닿기 전에 막는다', INK, fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 4) { terminal(30, 40, 620, 150, ['$ helm template my-app .', ['Error: execution error at', '#f87171'], ['  (mychart/templates/deployment.yaml:…):', '#f87171'], ['  image.repo는 필수입니다', '#f87171']], lerp(1, 4, E(u, 0.3, 1.4)), { title: '출력 예시' });
      el('rect', { x: 690, y: 50, width: 240, height: 130, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: fade(u, 1.4) });
      tx(810, 106, '클러스터', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) }); tx(810, 134, '적용된 것 없음', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
      [['어느 파일인지', 'deployment.yaml', 250], ['무엇이 빠졌는지', 'required에 적은 문장 그대로', 300]].forEach(([a, b, y], i) => { tx(80, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6 + i * 0.3) }); mono(260, y, b, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.3) }); });
      tag(480, 380, 'install·upgrade도 같은 오류로 시작하지 않는다', BAD, fade(u, 2.2), { 'font-size': 15 }); return; }
    // k === 5: 비교표
    const H = [['', 'include', 'template'], ['결과', '문자열 반환', '그 자리에 출력'], ['| nindent', '된다', '안 된다'], ['둘째 줄 들여쓰기', '맞춘다', '못 맞춘다']];
    H.forEach((row, r) => row.forEach((s, ci) => { const x = 200 + ci * 260, y = 80 + r * 70, op = fade(u, 0.2 + r * 0.3);
      if (r === 0 && ci) card(x, y - 6, 200, 44, { rx: 10, text: s, fs: 17, mono: true, fw: 800, stroke: ci === 1 ? ACC : WARN, color: ci === 1 ? ACC : WARN, fill: ci === 1 ? ACCBG : WARNBG, op });
      else if (s) tx(x, y, s, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': ci ? 700 : 600, fill: ci === 0 ? MUT : INK, opacity: op });
      if (r > 0 && ci === 1) check(x + 90, y - 6, 9, pop(u, 0.4 + r * 0.3)); if (r > 1 && ci === 2) cross(x + 90, y - 6, 8, pop(u, 0.4 + r * 0.3)); }));
    banner(480, 380, '조각을 끼워 넣을 때는 include', pop(u, 1.8)); }

  const quiz = [
    { q: '.Values.name이 myApp일 때 {{ .Values.name | upper | quote }}의 결과는 무엇인가?',
      o: ['MYAPP', '"MYAPP"', '"myApp"'], a: 1,
      why: 'myApp이 upper를 지나 MYAPP이 되고, 그 결과가 quote로 넘어가 큰따옴표가 붙는다. 중첩으로 쓴 quote (upper .Values.name)와 같다.' },
    { q: 'fullName이 빈 문자열일 때 {{ .Values.fullName | default "app" | printf "%s-svc" | quote }}의 결과는 무엇인가?',
      o: ['"app-svc"', '"-svc"', '"%s-svc"'], a: 0,
      why: 'default가 빈 값을 app으로 바꾸고, 그 값이 printf의 마지막 인자로 들어가 app-svc가 된 뒤 quote로 감싸진다.' },
    { q: 'resources: 아래(10칸)에 맵을 넣을 때 {{- toYaml .Values.resources | ? }}의 ?에 맞는 것은 무엇인가?',
      o: ['indent 12', 'nindent 10', 'nindent 12'], a: 2,
      why: '{{-가 앞 줄바꿈을 먹었으니 nindent가 줄바꿈부터 넣어야 하고, 칸수는 키 깊이 10에 2를 더한 12다.' },
    { q: 'values의 password가 s3cr3t일 때 b64enc를 거친 Secret data 값은 무엇인가?',
      o: ['czNjcjN0', 's3cr3t를 암호화한 값', 'c3NjcmV0'], a: 0,
      why: '3바이트씩 6비트 4조각으로 바꿔 s3c는 czNj, r3t는 cjN0이 된다. 암호화가 아니라서 b64dec로 바로 되돌아간다.' },
    { q: '두 줄짜리 라벨 조각을 labels 아래에 넣을 때 include를 쓰는 이유는 무엇인가?',
      o: ['template보다 렌더가 빠르다', '결과를 문자열로 돌려줘 nindent 4로 두 줄 모두 들여쓸 수 있다', 'template은 _helpers.tpl의 조각을 못 부른다'], a: 1,
      why: 'template은 그 자리에 찍기만 해서 둘째 줄이 맨 앞 칸으로 밀려난다. include는 문자열을 돌려줘 파이프로 nindent를 붙일 수 있다.' },
  ];

  const summary = [
    '중첩 함수는 안쪽부터 읽어야 해서, 파이프로 왼쪽에서 오른쪽으로 이어 쓴다.',
    '파이프로 넘어온 값은 오른쪽 함수의 마지막 인자가 된다. printf도 그렇게 채워진다.',
    '맵이나 리스트는 toYaml로 글로 바꾸고, 키 깊이에 2를 더한 칸수로 nindent한다.',
    '조각은 include로 불러 nindent를 붙이고, 꼭 필요한 값은 required로 막는다.',
  ];
  const review = [
    { q: 'resources 블록을 넣었더니 렌더 결과가 resources:            limits: 처럼 한 줄에 붙었다. 먼저 고칠 곳은?',
      o: ['toYaml을 toJson으로 바꾼다', 'indent를 nindent로 바꾼다', 'values.yaml의 limits 순서를 바꾼다'], a: 1,
      why: '{{-가 앞 줄바꿈을 먹은 자리에 indent를 쓰면 줄바꿈이 없어 첫 줄이 붙는다. nindent는 줄바꿈부터 넣는다.' },
    { q: 'token에 default (randAlphaNum 16)을 걸었더니 helm upgrade 뒤 앱이 DB 접속에 실패했다. 가장 그럴듯한 원인은?',
      o: ['upgrade 때 다시 렌더되며 새 무작위 값이 들어갔다', 'b64enc가 upgrade 때 다른 방식으로 인코딩했다', 'randAlphaNum이 16자보다 짧게 만들었다'], a: 0,
      why: '랜덤 기본값은 렌더할 때마다 새로 만들어진다. 앱과 DB가 알던 값과 Secret의 값이 어긋나게 된다.' },
    { q: '_helpers.tpl의 라벨 조각을 template으로 불렀더니 둘째 라벨이 metadata 밖 최상위 키가 됐다. 어떻게 고치나?',
      o: ['조각 이름을 차트 이름으로 바꾼다', 'template 뒤에 | nindent 4를 붙인다', 'include로 부르고 | nindent 4를 붙인다'], a: 2,
      why: 'template은 결과를 파이프로 넘길 수 없어 | nindent를 붙이면 렌더 오류가 난다. include는 문자열을 돌려줘 두 줄 모두 4칸 들여쓸 수 있다.' },
  ];

  R.page({ title: '값이 함수를 지나는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
