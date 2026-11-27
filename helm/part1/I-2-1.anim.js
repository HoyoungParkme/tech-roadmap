/* I-2-1 values.yaml — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, dot, zone, cross, check, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function yspans(line) {
    if (/^\s*#/.test(line)) return [[line, { fill: MUT }]];
    if (/^\s*\$/.test(line)) return [[line, { fill: INFO, 'font-weight': 700 }]];
    let body = line, com = ''; const ci = line.search(/\s+#\s/); if (ci > 0) { body = line.slice(0, ci); com = line.slice(ci); }
    const out = []; let first = true;
    body.split(/(\{\{.*?\}\})/).forEach((p) => { if (!p) return;
      if (p.startsWith('{{')) out.push([p, { fill: WARN, 'font-weight': 700 }]);
      else if (first) { const m = p.match(/^(\s*-?\s*)([^:\s{][^:]*:)(.*)$/); if (m) { out.push([m[1] + m[2], { fill: INK, 'font-weight': 600 }]); if (m[3]) out.push([m[3], { fill: ACC }]); } else out.push([p, { fill: INK }]); }
      else out.push([p, { fill: ACC }]);
      first = false; });
    if (com) out.push([com, { fill: MUT }]);
    return out; }
  function codeBox(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, top = o.title ? 32 : 12, h = o.h || top + lines.length * lh + 8, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, opacity: op });
    if (o.title) { el('line', { x1: x, y1: y + 26, x2: x + w, y2: y + 26, stroke: GRID, 'stroke-width': 1.2, opacity: op }); mono(x + 12, y + 18, o.title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); }
    lines.forEach((ln, i) => { const a = o.show == null ? 1 : clamp(o.show - i); if (a <= 0) return; const by = y + top + i * lh;
      if (o.hi && o.hi.includes(i)) el('rect', { x: x + 4, y: by + 1, width: w - 8, height: lh, rx: 4, fill: o.hiCol || ACCBG, opacity: op * a });
      spans(x + 12, by + fs + 1, yspans(ln), { 'font-size': fs, opacity: op * a }); });
    return { h, y: (i) => y + top + i * lh + lh / 2 }; }
  const chip = (x, y, s, col, sc, o) => pill(x, y, s, col, sc, Object.assign({ mono: true, fs: 13.5 }, o || {}));
  function toggle(x, y, on, s) { const g = R.G(x, y, s ?? 1); el('rect', { x: -18, y: -10, width: 36, height: 20, rx: 10, fill: on ? GOOD : OFF }, g); el('circle', { cx: on ? 8 : -8, cy: 0, r: 7, fill: PANEL }, g); }
  // 묶음 상자 (중첩 values 한 블록)
  function nbox(x, y, w, h, title, o) { o = o || {}; const op = o.op ?? 1; if (op <= 0) return;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.hot ? ACC : o.stroke || GRID, 'stroke-width': o.hot ? 2.4 : 1.6, opacity: op });
    mono(x + 10, y + 19, title, { 'font-size': 14, 'font-weight': 800, fill: o.hot ? ACC : INK, opacity: op }); }
  function kv(x, y, k, v, o) { o = o || {}; const op = o.op ?? 1; if (op <= 0) return; mono(x, y, k, { 'font-size': 13.5, fill: MUT, opacity: op }); mono(x + (o.kw || tw(k, 13.5) + 8), y, v, { 'font-size': 13.5, 'font-weight': 700, fill: o.col || INK, opacity: op }); }

  // =========================================================
  // 1. values.yaml — 바뀔 값을 한 파일에 모은다
  // =========================================================
  const V1 = ['replicaCount: 1', 'image:', '  repository: nginx', '  tag: "1.25"', '  pullPolicy: IfNotPresent', 'service:', '  type: ClusterIP', '  port: 80'];
  const UPTO = [0, 1, 5, 8, 8, 8], KEYS = [0, 1, 4, 6, 6, 6];
  function s1(t, c) { const { k, u } = c, n = UPTO[k], prevN = k ? UPTO[k - 1] : 0, sh = prevN + (n - prevN) * E(u, 0.2, 1.0);
    codeBox(16, 14, 370, n ? V1 : ['# (아직 키가 없다)'], { title: 'my-app/values.yaml', fs: 14.5, lh: 25, show: n ? sh : 1, hi: k >= 1 && k <= 3 ? Array.from({ length: n - prevN }, (_, i) => prevN + i) : [] });
    // 노출 키 수
    const nk = tween(k ? KEYS[k - 1] : 0, KEYS[k], u); card(200, 330, 260, 58, { rx: 12, stroke: ACC, sw: 2 });
    tx(90, 336, '노출된 키', { 'font-size': 15, 'font-weight': 700 }); mono(290, 338, Math.round(nk) + '개', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    // 오른쪽: 템플릿
    const filled = k >= 4 ? E(u, 0.4, 1.6) * (k === 4 ? 1 : 1) : 0, f = k > 4 ? 1 : filled;
    const T = [['spec:', ''], ['  replicas: ', '{{ .Values.replicaCount }}', '1'], ['  containers:', ''], ['  - name: app', ''], ['    image: ', '"{{ .Values.image.repository }}:{{ .Values.image.tag }}"', '"nginx:1.25"'], ['    imagePullPolicy: ', '{{ .Values.image.pullPolicy }}', 'IfNotPresent']];
    if (k === 5) { R.terminal(470, 14, 474, 290, ['$ helm show values ./my-app', ...V1.map((l) => [l, 'var(--term)'])], Math.min(9, lerp(0.5, 9, E(u, 0.2, 2.0))), { title: '출력 (예시)', fs: 14, lh: 25 });
      tx(706, 340, '파일을 열지 않고 노출된 값을 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    el('rect', { x: 424, y: 14, width: 528, height: 196, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 }); mono(436, 32, 'templates/deployment.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    T.forEach(([a, ph, v], i) => { const y = 62 + i * 25; mono(436, y, a, { 'font-size': 14, fill: INK, 'font-weight': 600 });
      if (!ph) return; const x = 436 + tw(a, 14), ready = (i === 1 && k >= 1) || (i >= 4 && k >= 2);
      if (k === 0) { mono(x, y, '(값을 직접 적지 않는다)', { 'font-size': 13.5, fill: MUT }); return; }
      if (f < 0.5) mono(x, y, ph, { 'font-size': i === 4 ? 12 : 14, fill: ready ? WARN : MUT, 'font-weight': 700, opacity: ready ? 1 : 0.4 });
      else mono(x, y, v, { 'font-size': 14, fill: ACC, 'font-weight': 800, opacity: (f - 0.5) * 2 }); });
    if (k >= 1 && k <= 3) { const tgt = { 1: [[1, 1]], 2: [[3, 4], [4, 4]], 3: [] }[k] || [];
      tgt.forEach(([li, ti], j) => { const y0 = 46 + 32 + li * 25 - 12, y1 = 62 + ti * 25 - 5; grow(380, y0, 436, y1, E(u, 0.9 + j * 0.2, 1.4 + j * 0.2), ACC); }); }
    if (k === 3) { card(690, 270, 300, 70, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 0.9) }); mono(690, 266, 'templates/service.yaml', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(690, 290, 'port: {{ .Values.service.port }}', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.1) }); grow(380, 214, 538, 270, E(u, 1.2, 1.7), ACC); }
    if (k === 0) { card(690, 290, 380, 80, { rx: 12, stroke: GRID, s: pop(u, 0.5) }); tx(690, 284, '템플릿은 .Values로 읽기로 약속한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7) });
      tx(690, 308, '설정은 values.yaml 한 곳에 모은다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) }); }
    if (k === 4) tx(690, 270, '{{ .Values.xxx }} 자리에 값이 들어간다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 1.8) }); }

  // =========================================================
  // 2. 중첩 values — 들여쓰기가 곧 점(.) 경로
  // =========================================================
  const N2 = [ // [보일 yaml 줄들, beat]
    [['replicaCount: 3'], 0], [['image:', '  repository: my-app', '  tag: "2.1.0"', '  pullPolicy: IfNotPresent'], 1], [['service:', '  type: ClusterIP', '  port: 8080', '  targetPort: 8080'], 2],
    [['resources:', '  requests:', '    cpu: 100m', '    memory: 128Mi', '  limits:', '    cpu: 500m', '    memory: 512Mi'], 3], [['ingress:', '  enabled: true', '  className: nginx', '  host: app.example.com'], 4]];
  function s2(t, c) { const { k, u } = c, A = (b) => (k === b ? E(u, 0.3, 1.1) : k > b ? 1 : 0), H = (b) => k === b;
    const PATH = ['.Values.replicaCount', '.Values.image.tag', '.Values.service.port', '.Values.resources.limits.cpu', '.Values.ingress.host'];
    if (k < 5) { const blk = N2[k][0]; codeBox(16, 14, 380, blk, { title: 'my-app/values.yaml', fs: 15, lh: 27, show: blk.length * E(u, 0.1, 0.8), hi: [0] });
      // 들여쓰기 가이드
      blk.forEach((l, i) => { const d = (l.match(/^ */)[0].length) / 2; for (let j = 0; j < d; j++) el('line', { x1: 32 + j * 18, y1: 46 + i * 27 + 4, x2: 32 + j * 18, y2: 46 + i * 27 + 24, stroke: ACC, 'stroke-width': 2, opacity: 0.5 * fade(u, 0.6) }); });
      const segs = PATH[k].split(/(?=\.)/); segs.forEach((s, i) => chip(56 + segs.slice(0, i).reduce((a, x) => a + tw(x, 14) + 34, 0) + tw(s, 14) / 2, 330, s, i === segs.length - 1 ? ACC : INK, pop(u, 1.0 + i * 0.25), { fs: 14, color: i === segs.length - 1 ? ACC : INK }));
      tx(30, 380, '들여쓰기 한 칸 = 점 하나', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    else { codeBox(16, 14, 380, ['# 템플릿 참조 예 (점 경로)', '{{ .Values.image.repository }}:{{ .Values.image.tag }}', 'cpu: {{ .Values.resources.limits.cpu }}', 'host: {{ .Values.ingress.host }}'], { title: '템플릿에서', fs: 12.8, lh: 30, show: 4 * E(u, 0.1, 0.8) });
      [['my-app:2.1.0', 0.9], ['cpu: 500m', 1.3], ['host: app.example.com', 1.7]].forEach(([s, d], i) => chip(200, 220 + i * 46, s, ACC, pop(u, d), { color: ACC, fs: 14 }));
      tx(30, 380, '묶은 구조가 그대로 참조 경로가 된다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    // 오른쪽: 중첩 상자들
    const hot = (b) => H(b) || (k === 5 && b > 0);
    if (A(0)) { nbox(430, 16, 240, 52, 'replicaCount', { op: A(0), hot: H(0) }); mono(650, 48, String(Math.round(k === 0 ? tween(1, 3, u) : 3)), { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: A(0) }); }
    if (A(1)) { nbox(430, 82, 240, 116, 'image', { op: A(1), hot: hot(1) }); [['repository', 'my-app'], ['tag', '"2.1.0"'], ['pullPolicy', 'IfNotPresent']].forEach(([a, b], i) => kv(446, 128 + i * 24, a, b, { op: A(1), kw: 100, col: i === 1 && hot(1) ? ACC : INK })); }
    if (A(2)) { nbox(430, 212, 240, 116, 'service', { op: A(2), hot: H(2) }); [['type', 'ClusterIP'], ['port', String(Math.round(k === 2 ? tween(80, 8080, u) : 8080))], ['targetPort', '8080']].forEach(([a, b], i) => kv(446, 258 + i * 24, a, b, { op: A(2), kw: 100, col: i === 1 && H(2) ? ACC : INK })); }
    if (A(3)) { const a = A(3); nbox(690, 16, 254, 236, 'resources', { op: a, hot: hot(3) });
      [['requests', '100m', '128Mi'], ['limits', '500m', '512Mi']].forEach(([nm, cpu, mem], i) => { const y = 40 + i * 104, aa = k === 3 ? E(u, 0.6 + i * 0.4, 1.2 + i * 0.4) : 1;
        nbox(704, y, 226, 92, nm, { op: aa, fill: SOFT, hot: hot(3) && i === 1 }); kv(720, y + 48, 'cpu', cpu, { op: aa, kw: 70, col: i === 1 && hot(3) ? ACC : INK }); kv(720, y + 72, 'memory', mem, { op: aa, kw: 70 }); }); }
    if (A(4)) { nbox(690, 266, 254, 116, 'ingress', { op: A(4), hot: hot(4) }); toggle(722, 312, true, A(4)); mono(748, 317, 'enabled', { 'font-size': 13.5, fill: MUT, opacity: A(4) });
      kv(706, 342, 'className', 'nginx', { op: A(4), kw: 90 }); kv(706, 366, 'host', 'app.example.com', { op: A(4), kw: 46, col: hot(4) ? ACC : INK }); } }

  // =========================================================
  // 3. --set — 명령줄 문자열이 값 나무가 된다
  // =========================================================
  const CMD3 = ['--set image.tag=2.2.0', '--set replicaCount=5,service.port=9090', '--set image.repository=my-app --set image.tag=2.3.0 --set ingress.enabled=false', '--set-string image.tag=20240501', "--set 'ingress.hosts[0].host=a.example.com'", '$ helm get values my-app'];
  function typeBadge(x, y, v, type, s) { card(x, y, tw(v, 14) + 80, 34, { rx: 8, stroke: type === 'string' ? ACC : type === 'int' ? WARN : INFO, sw: 2, s });
    mono(x - (tw(v, 14) + 80) / 2 + 12, y + 5, v, { 'font-size': 14, 'font-weight': 800, opacity: s > 0.6 ? 1 : 0 }); tx(x + (tw(v, 14) + 80) / 2 - 10, y + 5, type, { 'font-size': 13.5, fill: type === 'string' ? ACC : type === 'int' ? WARN : INFO, 'text-anchor': 'end', 'font-weight': 700, opacity: s > 0.6 ? 1 : 0 }); }
  function s3(t, c) { const { k, u } = c;
    const cmd = (k === 5 ? '' : '$ helm install my-app ./my-app ') + CMD3[k];
    el('rect', { x: 16, y: 14, width: 928, height: 46, rx: 10, fill: INK }); mono(30, 43, cmd.slice(0, Math.round(cmd.length * E(u, 0.1, 0.9))), { 'font-size': k === 2 ? 12.5 : 15, fill: PANEL });
    if (k === 0) { [['image', INK], ['.', MUT], ['tag', INK], ['=', MUT], ['2.2.0', ACC]].forEach(([s, col], i) => chip(150 + i * 90, 140, s, col, pop(u, 0.8 + i * 0.15), { color: col, fs: 15 }));
      tx(150, 190, '= 앞은 경로, 뒤는 값. 점으로 나무를 내려간다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      nbox(560, 230, 300, 130, 'image', { hot: true, op: fade(u, 1.8) }); kv(580, 290, 'tag:', '2.2.0', { op: fade(u, 2.0), col: ACC }); tx(580, 330, '파일은 그대로, 이 값만 덮는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { const sp = E(u, 0.9, 1.5); chip(lerp(380, 230, sp), 150, 'replicaCount=5', WARN, pop(u, 0.6), { color: WARN }); chip(lerp(590, 640, sp), 150, 'service.port=9090', WARN, pop(u, 0.6), { color: WARN });
      mono(480, 154, ',', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: 1 - sp });
      typeBadge(230, 250, '5', 'int', pop(u, 1.6)); typeBadge(640, 250, '9090', 'int', pop(u, 1.9));
      tx(480, 340, '콤마 한 줄은 길어질수록 읽기 어렵다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { [['image.repository', 'my-app', 'string'], ['image.tag', '2.3.0', 'string'], ['ingress.enabled', 'false', 'bool']].forEach(([p, v, ty], i) => { const y = 120 + i * 62, s = pop(u, 0.8 + i * 0.35);
        chip(170, y, '--set ' + p + '=' + v, INFO, s, { color: INFO }); grow(330, y, 470, y, E(u, 1.0 + i * 0.35, 1.3 + i * 0.35), ACC); mono(490, y + 5, p, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2 + i * 0.35) }); typeBadge(780, y, v, ty, pop(u, 1.3 + i * 0.35)); });
      tx(480, 340, '한 줄에 하나씩 쓰면 diff와 리뷰가 쉽다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { [['--set image.tag=20240501', '20240501', 'int', BAD], ['--set-string image.tag=20240501', '"20240501"', 'string', GOOD]].forEach(([a, v, ty, col], i) => { const y = 130 + i * 96;
        chip(220, y, a, col, pop(u, 0.6 + i * 0.6), { color: col }); grow(410, y, 520, y, E(u, 0.9 + i * 0.6, 1.2 + i * 0.6), col === BAD ? BAD : ACC); typeBadge(670, y, v, ty, pop(u, 1.2 + i * 0.6)); (col === BAD ? cross : check)(800, y, 11, pop(u, 1.4 + i * 0.6)); });
      tx(480, 330, '--set은 0으로 시작하지 않는 숫자를 정수로 바꾼다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(480, 358, '0123처럼 0으로 시작하면 문자열로 둔다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { nbox(300, 110, 360, 210, 'ingress', { hot: true, op: fade(u, 0.6) }); nbox(320, 150, 320, 150, 'hosts  (배열)', { fill: SOFT, op: fade(u, 0.9) });
      nbox(340, 190, 280, 90, '[0]', { op: fade(u, 1.2), hot: true }); kv(360, 250, 'host:', 'a.example.com', { op: fade(u, 1.5), col: ACC });
      card(800, 200, 230, 110, { rx: 12, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.7) }); tx(800, 190, '[ ] , 는 셸이 먼저', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(800, 214, '해석할 수 있다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); tx(800, 240, '따옴표로 감싼다', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, opacity: fade(u, 2.0) }); return; }
    R.terminal(16, 80, 500, 160, ['USER-SUPPLIED VALUES:', 'image:', '  tag: 2.2.0'], Math.min(3, lerp(0.5, 3, E(u, 0.3, 1.3))), { title: '출력 (예시)', fs: 15, lh: 26 });
    card(740, 160, 340, 110, { rx: 12, stroke: GRID, s: pop(u, 1.2) }); tx(740, 150, '사용자가 덮어쓴 값만 보인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
    tx(740, 176, 'values.yaml 기본값은 빠진다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
    tx(480, 330, '추측하지 말고 helm get values로 실제 값을 본다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // =========================================================
  // 4. -f 파일 — 기본값 위에 차이만 겹친다
  // =========================================================
  const ROWS = [ // [키, values.yaml, values-prod.yaml, 덮는 beat]  (병합 결과는 scripts 로 계산한 값과 같다)
    ['replicaCount', '3', '6', 1], ['image.repository', 'my-app', '', 9], ['image.tag', '"2.1.0"', '"2.1.0-prod"', 1], ['image.pullPolicy', 'IfNotPresent', '', 9],
    ['service.port', '8080', '', 9], ['resources.requests.cpu', '100m', '500m', 2], ['resources.requests.memory', '128Mi', '512Mi', 2], ['resources.limits.cpu', '500m', '"2"', 2],
    ['resources.limits.memory', '512Mi', '2Gi', 2], ['ingress.enabled', 'true', 'true', 3], ['ingress.className', 'nginx', '', 9], ['ingress.host', 'app.example.com', 'app.mycompany.com', 3]];
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { // -f 여러 개
      [['values.yaml', '차트 기본값', GRID, 300], ['-f values-common.yaml', '공통 값', INFO, 230], ['-f values-prod.yaml', '운영 값', ACC, 160]].forEach(([a, b, col, y], i) => { const s = pop(u, 0.3 + i * 0.5);
        card(480 + i * 26, y, 420, 56, { rx: 10, stroke: col, sw: 2.2, s, fill: i === 2 ? ACCBG : PANEL }); mono(290 + i * 26, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: i ? col : INK, opacity: s > 0.6 ? 1 : 0 }); tx(670 + i * 26, y + 5, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: s > 0.6 ? 1 : 0 }); });
      grow(130, 330, 130, 140, E(u, 1.6, 2.2), ACC); tx(110, 360, '뒤에 온 파일이', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); tx(110, 384, '앞을 덮는다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(480, 60, '같은 키면 values-prod.yaml 값이 남는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) }); return; }
    const COL = [[300, 'values.yaml'], [500, 'values-prod.yaml'], [730, k >= 4 ? '설치에 쓰일 값' : '병합 결과']];
    COL.forEach(([x, h], i) => tx(x, 30, h, { 'font-size': 14.5, 'font-weight': 800, fill: i === 1 ? ACC : i === 2 ? GOOD : INK, class: 'mono', opacity: i === 1 ? fade(u, k === 0 ? 0.6 : 0) : 1 }));
    el('line', { x1: 16, y1: 40, x2: 944, y2: 40, stroke: GRID, 'stroke-width': 1.5 });
    ROWS.forEach(([key, base, prod, b], i) => { const y = 66 + i * 28.5, on = prod && b <= k, now = b === k, a = now ? E(u, 0.4 + (i % 4) * 0.15, 1.1 + (i % 4) * 0.15) : on ? 1 : 0;
      if (now) el('rect', { x: 12, y: y - 19, width: 936, height: 26, rx: 6, fill: ACCBG, opacity: fade(u, 0.2) });
      mono(24, y, key, { 'font-size': 13.5, fill: MUT });
      mono(300, y, base, { 'font-size': 14, fill: on && a > 0.5 ? MUT : INK, 'text-decoration': on && a > 0.5 ? 'line-through' : null });
      if (on) mono(lerp(300, 500, a), y, prod, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: a });
      const res = on && a > 0.5 ? prod : base, kept = !on || !prod;
      mono(730, y, res, { 'font-size': 14, 'font-weight': on && a > 0.5 ? 800 : 400, fill: on && a > 0.5 ? ACC : k >= 1 && kept && (key.startsWith('image.') || key.startsWith('ingress.')) ? GOOD : INK }); });
    if (k === 0) { el('rect', { x: 480, y: 46, width: 200, height: 344, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.6) });
      tx(580, 220, '바꿀 키만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); tx(580, 244, '적는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); }
    if (k === 1) chip(590, 94, '형제 키는 산다', GOOD, pop(u, 1.6), { color: GOOD, mono: false });
    if (k === 4) { el('rect', { x: 716, y: 46, width: 228, height: 344, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      chip(480, 404, '$ helm install my-app ./my-app -f values-prod.yaml', INFO, pop(u, 0.8), { color: INFO }); } }

  // =========================================================
  // 5. 우선순위 — 위로 갈수록 세다
  // =========================================================
  const LAD = [['subchart의 values.yaml', '(이 예에는 없음)', MUT], ['부모 values.yaml', '"2.1.0"', INK], ['-f values-prod.yaml', '"2.1.0-prod"', ACC], ['--set (명령줄)', '"hotfix"', WARN]];
  function ladder(u, k) { LAD.forEach(([a, v, col], i) => { const y = 340 - i * 76, s = k === 0 ? pop(u, 0.2 + i * 0.35) : 1, w = 300 + i * 30, win = k >= 3 && i === 3;
      card(232, y, w, 58, { rx: 10, stroke: win ? WARN : i ? col : GRID, sw: win ? 3 : 2, fill: win ? WARNBG : PANEL, s });
      mono(232 - w / 2 + 16, y - 4, a, { 'font-size': 15, 'font-weight': 800, fill: i ? col : MUT, opacity: s > 0.6 ? 1 : 0 });
      if (k >= 1) { const vv = k === 1 ? fade(u, 0.4 + i * 0.35) : 1, lose = k >= 3 && i > 0 && i < 3; mono(232 - w / 2 + 16, y + 18, 'image.tag = ' + v, { 'font-size': 14, fill: lose ? MUT : i ? col : MUT, opacity: vv, 'text-decoration': lose ? 'line-through' : null }); } });
    tx(30, 34, '세다 ▲', { 'font-size': 14, 'font-weight': 700, fill: WARN }); tx(30, 404, '약하다', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  function s5(t, c) { const { k, u } = c; ladder(u, k);
    if (k === 0) { tx(690, 190, '명령줄에 가까울수록 세다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { tx(690, 190, '같은 키 image.tag를 세 곳에서', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); tx(690, 216, '서로 다르게 정했다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { R.terminal(450, 60, 494, 110, ['$ helm install my-app ./my-app \\', '    -f values-prod.yaml \\', '    --set image.tag=hotfix'], Math.min(3, lerp(0.5, 3, E(u, 0.2, 1.0))), { title: 'bash', fs: 14, lh: 22 });
      grow(450, 135, 380, 188, E(u, 1.2, 1.7), ACC); grow(450, 157, 400, 112, E(u, 1.5, 2.0), WARN);
      tx(700, 230, '적은 순서와 상관없이', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(700, 256, '--set이 -f 위에 놓인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { R.terminal(450, 60, 494, 200, ['$ helm get values my-app', 'USER-SUPPLIED VALUES:', 'image:', '  tag: hotfix', 'ingress: …', 'replicaCount: 6', 'resources: …'], Math.min(7, lerp(0.5, 7, E(u, 0.2, 1.6))), { title: '출력 (예시)', fs: 14, lh: 21 });
      tx(697, 300, '-f 파일 값도 함께 나오고, 겹친 tag만 hotfix', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    R.terminal(450, 20, 494, 330, ['$ helm get values my-app --all', 'COMPUTED VALUES:', 'image:', '  pullPolicy: IfNotPresent', '  repository: my-app', '  tag: hotfix', 'ingress: {className: nginx, …}', 'replicaCount: 6', 'resources: {limits: {cpu: "2", …}}', 'service: {port: 8080, …}'],
      Math.min(10, lerp(0.5, 10, E(u, 0.2, 2.0))), { title: '출력 (예시, 줄임)', fs: 14, lh: 28 });
    tx(697, 380, '기본값까지 합친 최종 값', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: '템플릿에서 replicas를 values.yaml의 값으로 채우려면 무엇이라고 적는가?',
      o: ['replicas: 1', 'replicas: {{ .Values.replicaCount }}', 'replicas: {{ values.yaml }}'], a: 1,
      why: '템플릿에는 값이 아니라 경로를 적는다. 렌더할 때 values.yaml의 replicaCount: 1이 그 자리에 들어간다.' },
    { q: 'values.yaml의 resources 아래 limits 아래 cpu 값을 템플릿에서 읽는 경로는 무엇인가?',
      o: ['.Values.resources.limits.cpu', '.Values.cpu', '.Values.limits.resources.cpu'], a: 0,
      why: 'YAML의 들여쓰기 한 단계가 점 하나다. resources → limits → cpu 순서 그대로 내려간다.' },
    { q: 'helm install에 --set image.tag=20240501을 주면 image.tag는 어떤 값이 되는가?',
      o: ['문자열 "20240501"', '오류가 난다', '정수 20240501'], a: 2,
      why: '--set은 0으로 시작하지 않는 숫자를 정수로 바꾼다. 문자열로 지키려면 --set-string을 쓴다.' },
    { q: 'values-prod.yaml에 image.tag만 적고 -f로 넘겼다. 기본값 image.repository: my-app은 어떻게 되는가?',
      o: ['그대로 my-app으로 남는다', '빈 값이 된다', 'values-prod.yaml로 통째로 바뀌어 사라진다'], a: 0,
      why: '-f 파일은 키 단위로 병합된다. 적지 않은 형제 키는 기본값이 그대로 남는다.' },
    { q: 'values.yaml에 "2.1.0", -f 파일에 "2.1.0-prod", --set에 hotfix를 줬다. 최종 image.tag는 무엇인가?',
      o: ['"2.1.0"', '"2.1.0-prod"', 'hotfix'], a: 2,
      why: '우선순위는 subchart < 부모 values.yaml < -f < --set이다. 명령줄 --set이 가장 세다.' },
  ];

  const summary = [
    '바뀔 수 있는 값은 values.yaml에 모으고, 템플릿은 .Values 경로로 읽는다.',
    '관련 값은 블록으로 묶고, 들여쓰기 한 단계가 점 경로 한 칸이 된다.',
    '--set은 값 하나를, -f는 바꿀 키만 적은 파일을 기본값 위에 덮는다.',
    '우선순위는 subchart, 부모 values.yaml, -f, --set 순이고 결과는 helm get values로 본다.',
  ];
  const review = [
    { q: 'CI가 --set image.tag=20240501로 설치했더니 태그를 문자열로 다루는 템플릿에서 오류가 났다. 먼저 바꿀 것은?',
      o: ['--set-string image.tag=20240501로 넘긴다', 'values.yaml의 image 블록을 지운다', '-f 파일 순서를 바꾼다'], a: 0,
      why: '--set은 숫자만 있는 값을 정수로 바꾼다. --set-string은 언제나 문자열로 넣는다.' },
    { q: '-f values-common.yaml -f values-prod.yaml 순서로 넘겼는데 운영 도메인이 common 쪽 값으로 나온다. 먼저 의심할 것은?',
      o: ['-f는 첫 파일만 읽는다', 'values-prod.yaml의 키 경로가 common과 달라 같은 키로 겹치지 않았다', '--set이 없으면 -f가 무시된다'], a: 1,
      why: '여러 -f는 뒤 파일이 앞을 덮지만 같은 경로의 키일 때만 그렇다. 경로가 다르면 두 값이 따로 남는다.' },
    { q: '운영 파일로 replicaCount를 6으로 줬는데 Pod가 5개만 떴다. 설치 명령을 보니 끝에 --set replicaCount=5가 있다. 왜인가?',
      o: ['values.yaml 기본값이 이겼다', 'helm이 홀수만 허용한다', '--set이 -f 파일보다 세서 5가 이겼다'], a: 2,
      why: '--set은 -f 파일 값을 덮는다. helm get values로 USER-SUPPLIED 값을 보면 replicaCount: 5가 나온다.' },
  ];

  R.page({ title: 'values와 우선순위', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
