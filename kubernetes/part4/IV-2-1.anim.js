/* IV-2-1 Secret — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * Secret 키·값(평문/base64), Pod 의 env·파일, Vault 연동 여부는 STEPS 의 secret · pod · vault 를 읽는다.
 * base64 값은 kubectl create secret generic --dry-run=client -o yaml 출력과 같다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, server, person, cross, check, lock, clock, terminal, kvTable, cells, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const short = (v, n) => (v.length > n ? v.slice(0, n - 1) + '…' : v);
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const PW = 'P@ssw0rd123!', B64 = 'UEBzc3cwcmQxMjMh';

  // ---------- 1. ConfigMap 에 평문 ----------
  function s1(t, c) { const { k, u } = c, rows = c.beat.secret.rows;
    const r = rows.map((x, i) => { const v = x.plain, f = k === 1 ? E(u, 0.3 + i * 0.6, 1.0 + i * 0.6) : 1; return [x.key, v.startsWith('(') ? v : typed(v, f), { hot: k >= 2 && !v.startsWith('(') }]; });
    kvTable(40, 60, 420, r, { title: 'ConfigMap app-config', kw: 170 });
    if (k >= 1) { const op = k === 1 ? fade(u, 1.8) : 1; pill(250, 190, '평문 · 인코딩조차 없다', BAD, op > 0 ? pop(u, k === 1 ? 1.8 : -1) : 0, { fs: 13.5 }); }
    if (k === 0) note(40, 200, 'IV-1-2의 설정 분리와 같은 모양', fade(u, 1.0), { fill: MUT });
    if (k === 2) { terminal(500, 50, 430, 140, ['$ kubectl get cm app-config -o yaml', 'data:', ['  API_KEY: sk-XYZABC123', '#f87171'], ['  DB_PASSWORD: P@ssw0rd123!', '#f87171']], 1 + E(u, 0.2, 1.4) * 3, { fs: 13.5 });
      ['개발자', '인턴', 'CI 봇'].forEach((n, i) => { const s = pop(u, 1.4 + i * 0.25); person(560 + i * 130, 290, n, { s, stroke: BAD });
        grow(560 + i * 130, 262, 640 + i * 20, 196, E(u, 1.7 + i * 0.25, 2.3 + i * 0.25), BAD, { dash: '4 4' }); });
      sub(715, 378, 'get configmaps 권한만 있으면 다 보인다', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); }
    if (k === 3) { const y = 320, x0 = 70, n = 7, gap = 125, f = E(u, 0.2, 2.0);
      el('line', { x1: x0, y1: y, x2: lerp(x0, x0 + gap * (n - 1), f), y2: y, stroke: GRID, 'stroke-width': 3 });
      const lab = ['init', 'api', 'add cm', 'fix', 'rm 비번', 'feat', 'HEAD'];
      for (let i = 0; i < n; i++) { const s = clamp(f * (n - 1) - i + 1); if (s <= 0) continue; const red = i === 2;
        el('circle', { cx: x0 + i * gap, cy: y, r: red ? 13 : 9, fill: red ? BAD : PANEL, stroke: red ? BAD : INK, 'stroke-width': 2.5, opacity: s });
        tx(x0 + i * gap, y + 34, lab[i], { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: red ? BAD : MUT, opacity: s }); }
      grow(x0 + 4 * gap, y - 20, x0 + 2 * gap + 18, y - 20, E(u, 1.8, 2.5), BAD, { dash: '5 4' });
      tx(x0 + 3 * gap, y - 32, '지워도 옛 커밋에 남는다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      pill(700, 120, 'Secret 리소스로 옮긴다', ACC, pop(u, 2.3), { fs: 14 }); } }

  // ---------- 2. base64 ----------
  function b64(y, f, rev) { // 평문 12칸 → base64 16칸 (3바이트 → 4글자)
    const pw = [...PW], bb = [...B64], top = rev ? 300 : 90, bot = rev ? 90 : 300, src = rev ? bb : pw, dst = rev ? pw : bb;
    const W1 = 44, W2 = 40;
    const xs1 = (i) => 480 - (12 * W1 + 3 * 18) / 2 + i * W1 + Math.floor(i / 3) * 18, xs2 = (i) => 480 - (16 * W2 + 3 * 18) / 2 + i * W2 + Math.floor(i / 4) * 18;
    const X1 = rev ? xs2 : xs1, X2 = rev ? xs1 : xs2, w1 = rev ? W2 - 4 : W1 - 4, w2 = rev ? W1 - 4 : W2 - 4;
    const ya = rev ? top - 22 : top + 22, yb = rev ? bot + 22 : bot - 22;
    for (let g = 0; g < 4; g++) { const gu = clamp(f * 4 - g), a = rev ? [X1(g * 4), X1(g * 4 + 3) + w1] : [X1(g * 3), X1(g * 3 + 2) + w1], b = rev ? [X2(g * 3), X2(g * 3 + 2) + w2] : [X2(g * 4), X2(g * 4 + 3) + w2];
      if (gu > 0) el('path', { d: `M${a[0]},${ya} L${b[0]},${yb} L${b[1]},${yb} L${a[1]},${ya} Z`, fill: rev ? GOODBG : ACCBG, opacity: 0.8 * gu }); }
    src.forEach((ch, i) => card(X1(i) + w1 / 2, top, w1, 40, { rx: 5, text: ch, fs: 15, mono: true, stroke: rev ? ACC : BAD, color: rev ? ACC : BAD }));
    for (let g = 0; g < 4; g++) { const gu = clamp(f * 4 - g);
      dst.forEach((ch, i) => { const grp = rev ? Math.floor(i / 3) : Math.floor(i / 4); if (grp !== g || gu <= 0.5) return;
        card(X2(i) + w2 / 2, bot, w2, 40, { rx: 5, text: ch, fs: 15, mono: true, stroke: rev ? BAD : ACC, color: rev ? BAD : ACC, s: pop(gu, 0.5, 0.5) }); }); }
    tx(70, top + 5, rev ? 'base64' : '평문', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    tx(70, bot + 5, rev ? '평문' : 'base64', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { b64(0, E(u, 0.3, 2.2), false); sub(480, 200, '3바이트를 6비트씩 쪼개 4글자로 · 12바이트 → 16글자', fade(u, 0.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      mono(480, 380, 'kubectl create secret generic db-creds --from-literal=…', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { b64(0, E(u, 0.3, 2.0), true); lock(480, 200, false, BAD, pop(u, 0.4) * 1.3);
      mono(480, 380, '... -o jsonpath="{.data.DB_PASSWORD}" | base64 -d', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
      banner(760, 200, 'base64 ≠ 암호화', pop(u, 2.0)); return; }
    const rows = c.beat.secret.rows.map((r) => [r.key, r.encoded, {}]);
    if (k === 1) { kvTable(40, 60, 460, rows, { title: 'Secret db-creds · data', kw: 170 });
      terminal(540, 60, 390, 120, ['$ kubectl get secret db-creds -o yaml', 'data:', '  API_KEY: c2stWFlaQUJDMTIz', '  DB_PASSWORD: UEBzc3cwcmQxMjMh'], 1 + E(u, 0.2, 1.4) * 3, { fs: 13.5 });
      dbIcon(270, 290, 'etcd (기본: 암호화 없음)', { s: pop(u, 1.4), stroke: WARN });
      note(380, 296, 'API로 볼 때 base64로 보일 뿐', fade(u, 1.8)); return; }
    if (k === 3) { el('rect', { x: 120, y: 50, width: 420, height: 230, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      ['apiVersion: v1', 'kind: Secret', 'metadata:', '  name: db-creds', 'type: Opaque', 'data:', '  DB_PASSWORD: UEBzc3cwcmQxMjMh', '  API_KEY: c2stWFlaQUJDMTIz'].forEach((l, i) =>
        mono(140, 80 + i * 25, l, { 'font-size': 14, fill: i === 4 ? INFO : i >= 6 ? ACC : INK, 'font-weight': i === 4 || i >= 6 ? 700 : 400, opacity: fade(u, 0.1 + i * 0.15) }));
      pill(720, 175, 'type: Opaque = 일반 키-값', INFO, pop(u, 1.2), { fs: 14 });
      pill(720, 230, 'data 칸에는 base64만', ACC, pop(u, 1.6), { fs: 14 });
      sub(330, 320, '평문을 data에 넣으면 디코딩 오류로 거부된다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k4: stringData 와 type
    card(150, 110, 220, 70, { rx: 8, text: 'stringData:\nDB_PASSWORD: P@ssw0rd123!', fs: 13.5, mono: true, stroke: WARN, s: pop(u, 0.2) });
    server(480, 100, 'API 서버', { s: pop(u, 0.4) });
    card(800, 110, 220, 70, { rx: 8, text: 'data:\nDB_PASSWORD: UEBzc3cw…', fs: 13.5, mono: true, stroke: ACC, s: pop(u, 1.4) });
    dot([[262, 110], [420, 100]], seg(u, 0.6, 1.0), WARN, 7); dot([[540, 100], [688, 110]], seg(u, 1.0, 1.4), ACC, 7);
    [['Opaque', '일반 키-값 (기본)'], ['kubernetes.io/tls', 'tls.crt + tls.key'], ['kubernetes.io/dockerconfigjson', '레지스트리 인증'], ['kubernetes.io/service-account-token', 'SA 토큰']].forEach(([a, b], i) => {
      const y = 232 + i * 44, s = pop(u, 1.6 + i * 0.2); card(480, y, 760, 36, { rx: 8, stroke: GRID, s });
      mono(116, y + 5, a, { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: s }); tx(844, y + 5, b, { 'font-size': 14, 'text-anchor': 'end', fill: MUT, opacity: s }); }); }

  // ---------- 3. env 주입 ----------
  function podBox(x, y, w, h, name, img) {
    el('rect', { x, y, width: w, height: h, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.4 });
    tx(x + 16, y + 26, 'Pod ' + name, { 'font-size': 15, 'font-weight': 700 });
    card(x + w / 2, y + 62, w - 40, 38, { rx: 8, text: img, fs: 14, mono: true, fill: SOFT }); }
  function s3(t, c) { const { k, u } = c, envs = c.beat.pod.envVars || [], n0 = c.prev ? (c.prev.pod.envVars || []).length : 0;
    const rows = c.beat.secret.rows.map((r) => [r.key, r.encoded, { hot: envs.slice(n0).some((e) => e.name === r.key) && u < 2.4 }]);
    kvTable(30, 70, 400, rows, { title: 'Secret db-creds (base64)', kw: 160 });
    podBox(530, 40, 400, 290, 'app-pod', 'app · myapp:v1');
    tx(550, 142, 'env', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    if (!envs.length) mono(600, 142, '(Secret 미주입)', { 'font-size': 14, fill: OFF });
    envs.forEach((e, i) => { const isNew = i >= n0 && k !== 3, yy = 154 + i * 40, op = isNew ? fade(u, 1.4) : 1;
      el('rect', { x: 550, y: yy, width: 360, height: 32, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: op });
      mono(562, yy + 21, '$' + e.name + '=' + e.value, { 'font-size': 14, 'font-weight': 700, opacity: op });
      if (isNew) { const ry = 70 + 30 + c.beat.secret.rows.findIndex((r) => r.key === e.name) * 34 + 17, f = seg(u, 0.3, 1.3);
        fly(380, ry, 700, yy + 16, f, f < 0.6 ? short(c.beat.secret.rows[0].key === e.name ? B64 : 'c2stWFlaQUJDMTIz', 12) : '디코딩 →', { mono: true }); } });
    if (k === 1 || k === 2) { pill(230, 260, 'secretKeyRef · 키 하나씩', ACC, pop(u, 0.2), { fs: 13.5 }); sub(230, 300, 'kubelet이 base64를 풀어 넣는다', fade(u, 1.5), { 'font-size': 14 }); }
    if (k === 2) sub(230, 330, '키마다 다섯 줄, 이름은 바꿔 붙일 수 있다', fade(u, 1.8), { 'font-size': 14 });
    if (k === 3) { pill(230, 260, 'envFrom · secretRef (전부)', ACC, pop(u, 0.2), { fs: 13.5 });
      grow(400, 117, 548, 187, E(u, 0.6, 1.4), ACC, { dash: '4 4' }); grow(400, 151, 548, 227, E(u, 0.8, 1.6), ACC, { dash: '4 4' });
      sub(230, 300, 'Secret의 key 이름이 그대로 변수 이름', fade(u, 1.5), { 'font-size': 14 }); }
    if (k === 4) { snippet(30, 250, ['process.env.DB_PASSWORD     # Node.js', 'os.environ["DB_PASSWORD"]   # Python'], { fs: 14, op: fade(u, 0.3) });
      grow(440, 290, 548, 175, E(u, 1.0, 1.7), ACC); note(560, 300, '앱 코드는 Secret을 몰라도 된다', fade(u, 1.8), { fill: ACC }); } }

  // ---------- 4. TLS 를 파일로 ----------
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-22,-28 H10 L22,-16 V28 H-22 Z', fill: PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M10,-28 V-16 H22', fill: 'none', stroke: c, 'stroke-width': 1.8 }, g);
    if (name) tx(0, 48, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  function perm(x, y, bits, op) { [...bits].forEach((b, i) => { const on = b !== '-';
    el('rect', { x: x + i * 22 + Math.floor(i / 3) * 6, y, width: 20, height: 24, rx: 3, fill: on ? ACCBG : SOFT, stroke: on ? ACC : GRID, 'stroke-width': 1.4, opacity: op });
    mono(x + i * 22 + Math.floor(i / 3) * 6 + 10, y + 17, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: on ? ACC : OFF, 'font-weight': 700, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c, files = c.beat.pod.volumeFiles || [];
    if (k <= 1) { fileIcon(110, 110, 'server.crt', { s: pop(u, k === 0 ? 0.2 : -1) }); fileIcon(110, 250, 'server.key', { s: pop(u, k === 0 ? 0.4 : -1), stroke: WARN });
      if (k === 0) { dot([[140, 110], [330, 180]], seg(u, 0.8, 1.6), ACC, 7); dot([[140, 250], [330, 190]], seg(u, 0.9, 1.7), WARN, 7);
        mono(240, 380, 'kubectl create secret tls tls-cert --cert=… --key=…', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) }); }
      const rows = c.beat.secret.rows.map((r) => [r.key, r.encoded, { hot: k === 1 }]);
      if (k === 1 || u > 1.6) kvTable(340, 110, 460, rows, { title: 'Secret tls-cert', kw: 120 });
      if (k === 1) { pill(570, 70, 'type: kubernetes.io/tls', INFO, pop(u, 0.3), { mono: true, fs: 14 });
        note(340, 250, '키 이름은 tls.crt · tls.key로 정해져 있다', fade(u, 1.0));
        mono(340, 290, 'LS0tLS1CRUdJTi…  =  "-----BEGIN" 의 base64', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
      return; }
    // k2~4: 마운트
    kvTable(30, 70, 300, c.beat.secret.rows.map((r) => [r.key, short(r.encoded, 12), {}]), { title: 'Secret tls-cert', kw: 100 });
    podBox(420, 40, 510, 340, 'nginx-pod', 'nginx:1.27 · :443');
    grow(330, 120, 440, 160, k === 2 ? E(u, 0.2, 0.9) : 1, ACC);
    mono(450, 140, '/etc/tls', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 0.8) : 1 });
    files.forEach((f, i) => { const y = 180 + i * 62, s = k === 2 ? pop(u, 1.0 + i * 0.3) : 1, prevMode = c.prev && c.prev.pod.volumeFiles && c.prev.pod.volumeFiles[i] ? c.prev.pod.volumeFiles[i].mode : f.mode;
      fileIcon(480, y + 6, null, { s: s * 0.7, stroke: i ? WARN : INK }); mono(510, y + 12, f.path.split('/').pop(), { 'font-size': 15, 'font-weight': 700, opacity: s });
      const mode = k === 3 && u < 1.2 ? prevMode : f.mode, bits = mode === '0400' ? 'r--------' : 'rw-r--r--';
      if (k >= 2) { perm(630, y - 4, bits, s); mono(860, y + 13, mode, { 'font-size': 15, 'font-weight': 800, fill: mode === '0400' ? GOOD : WARN, opacity: s }); } });
    if (k === 2) sub(745, 330, '기본 권한 0644 · 누구나 읽는다', fade(u, 1.8), { fill: WARN, 'font-weight': 700 });
    if (k === 3) { sub(745, 330, 'defaultMode: 0400 · 소유자(root)만 읽는다', fade(u, 1.4), { fill: GOOD, 'font-weight': 700 }); sub(180, 210, 'items로 노출할 키만 고른다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 4) { snippet(440, 280, ['ssl_certificate     /etc/tls/tls.crt;', 'ssl_certificate_key /etc/tls/tls.key;'], { fs: 13.5, op: fade(u, 0.2) });
      grow(604, 284, 604, 206, E(u, 0.9, 1.5), ACC); lock(175, 330, true, GOOD, pop(u, 1.6) * 1.4); tx(205, 336, 'HTTPS :443', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) }); } }

  // ---------- 5. etcd 암호화 · SealedSecret · Vault ----------
  const scramble = (n, seed) => { let s = ''; for (let i = 0; i < n; i++) { const v = Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233)) * 43758.5453; s += 'ab8f3c9e1d07a4f6'[Math.floor((v - Math.floor(v)) * 16)]; } return s; };
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { tx(40, 50, 'EncryptionConfiguration · resources', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ['secrets', 'configmaps', 'pods', 'deployments'].forEach((r, i) => { const on = i === 0;
        pill(90 + i * 150, 90, r, on ? ACC : OFF, 1, { mono: true, fs: 14, fill: on && (k === 1 || u > 1) ? ACCBG : null }); });
      if (k === 0) { check(90, 128, 9, pop(u, 1.2)); note(40, 180, '암호화 대상은 secrets 하나만 고른다', fade(u, 1.6)); return; }
      dbIcon(110, 280, 'etcd', {});
      mono(190, 238, '/registry/secrets/default/db-creds', { 'font-size': 14, fill: MUT });
      const after = u > 1.0;
      el('rect', { x: 190, y: 254, width: 720, height: 40, rx: 6, fill: after ? GOODBG : BADBG, stroke: after ? GOOD : BAD, 'stroke-width': 1.6 });
      mono(204, 280, after ? 'k8s:enc:aescbc:v1:key1:' + scramble(Math.round(24 * E(u, 1.0, 1.8)), 3) : '…db-creds…DB_PASSWORD…P@ssw0rd123!…', { 'font-size': 14, 'font-weight': 700, fill: after ? GOOD : BAD });
      tx(204, 322, after ? 'aescbc (32바이트 키 = AES-256)로 디스크에 암호문' : '설정 전: 디스크를 읽으면 평문이 보인다', { 'font-size': 14, 'font-weight': 600, fill: after ? GOOD : BAD });
      mono(204, 356, 'providers: aescbc(key1) → identity {}', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      sub(560, 390, 'identity는 아직 암호화 안 된 옛 데이터를 읽기 위한 대비책', fade(u, 2.0)); return; }
    if (k === 2 || k === 3) { card(140, 120, 200, 110, { rx: 10, stroke: INK, text: 'kubeseal\n+ 공개키', fs: 15 });
      const sealed = 'AgBy8h4FZ9...', s1 = k === 2 ? E(u, 0.3, 1.2) : 1;
      card(480, 120, 230, 70, { rx: 8, text: 'SealedSecret\nDB_PASSWORD: ' + sealed, fs: 13.5, mono: true, stroke: ACC, s: pop(u, k === 2 ? 0.8 : -1) });
      grow(240, 120, 362, 120, s1, ACC);
      zone(660, 60, 270, 120, 'git 저장소', { stroke: GRID });
      grow(598, 120, 680, 120, k === 2 ? E(u, 1.3, 1.8) : 1, ACC);
      if (k === 2) { check(820, 130, 12, pop(u, 1.9)); tx(745, 136, '커밋 OK', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) }); return; }
      zone(330, 230, 600, 170, '클러스터', { stroke: ACC });
      card(480, 310, 200, 70, { rx: 10, text: 'controller\n+ 개인키', fs: 15, stroke: ACC, s: pop(u, 0.2) });
      dot([[480, 156], [480, 274]], seg(u, 0.5, 1.2), ACC, 7);
      card(780, 310, 210, 70, { rx: 10, text: 'Secret db-creds\nP@ssw0rd123!', fs: 14, mono: true, stroke: INK, s: pop(u, 1.4) });
      grow(582, 310, 672, 310, E(u, 1.2, 1.6), ACC);
      person(130, 320, '클러스터 밖', { s: pop(u, 1.6) }); cross(180, 300, 12, pop(u, 1.9));
      sub(150, 392, '공개키로는 못 푼다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); return; }
    // k4~5: Vault → ESO → Secret → Pod
    const P = [[110, 'Vault', 'prod/db'], [340, 'ESO', 'controller'], [580, 'K8s Secret', 'db-creds'], [820, 'Pod', 'app-pod']];
    P.forEach(([x, a, b], i) => { const s = k === 4 ? pop(u, 0.2 + i * 0.3) : 1; card(x, 110, 170, 74, { rx: 10, text: a + '\n' + b, fs: 15, stroke: i === 0 ? INFO : i === 2 ? ACC : INK, s });
      if (i) grow(P[i - 1][0] + 86, 110, x - 86, 110, k === 4 ? E(u, 0.4 + i * 0.3, 0.8 + i * 0.3) : 1, i === 3 ? MUT : ACC); });
    const cyc = k === 4 ? 0.8 * E(u, 1.4, 2.6) : 0.2 + 0.6 * E(u, 0.2, 2.6);
    clock(340, 240, 28, cyc, INFO, 'refreshInterval 1h');
    if (k === 4) { sub(580, 170, 'Secret을 자동으로 만들어 준다', fade(u, 1.8), { 'font-size': 14 }); return; }
    [['prod/db · password', 'DB_PASSWORD'], ['prod/api · key', 'API_KEY']].forEach(([a, b], i) => { const y = 320 + i * 40, op = fade(u, 0.2 + i * 0.3);
      mono(40, y, a, { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: op }); grow(230, y - 5, 300, y - 5, op, MUT); mono(310, y, b, { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: op }); });
    note(520, 250, 'Vault 값을 바꾸면', fade(u, 0.9)); note(520, 276, '다음 refresh 때 Secret이 바뀐다', fade(u, 1.1), { fill: ACC });
    pill(720, 330, 'env로 받는 Pod는 재시작해야 새 값', WARN, pop(u, 1.6), { fs: 13.5 });
    sub(720, 380, '볼륨으로 받으면 kubelet 동기화 뒤 파일이 바뀐다', fade(u, 2.0), { 'font-size': 13.5 }); }

  const quiz = [
    { q: 'DB 비번을 ConfigMap data에 적었을 때 가장 큰 문제는 무엇인가?',
      o: ['Pod가 그 값을 env로 받지 못한다', 'get cm 권한만 있어도 평문이 보이고, git에 들어가면 지울 수 없다', 'ConfigMap이 값의 길이를 제한한다'], a: 1,
      why: 'ConfigMap은 비밀이 아닌 설정용이다. P@ssw0rd123! 이 kubectl get cm 한 번에 그대로 나오고 커밋 history에 영구히 남는다.' },
    { q: 'Secret의 data에 보이는 UEBzc3cwcmQxMjMh는 무엇인가?',
      o: ['P@ssw0rd123! 을 base64로 인코딩한 값', 'AES-256으로 암호화한 값', 'etcd가 만든 해시값'], a: 0,
      why: 'base64 -d 한 줄이면 평문으로 돌아온다. 인코딩일 뿐이라 보안은 RBAC과 etcd 암호화가 맡는다.' },
    { q: 'envFrom.secretRef로 Secret을 주입하면 환경 변수 이름은 어떻게 정해지는가?',
      o: ['컨테이너 이름이 앞에 붙는다', '직접 정한 이름으로 바뀐다', 'Secret의 key 이름이 그대로 쓰인다'], a: 2,
      why: '통째로 주입하면 DB_PASSWORD, API_KEY가 그대로 변수가 된다. 이름을 바꾸려면 secretKeyRef로 하나씩 매핑한다.' },
    { q: 'TLS 키 파일을 볼륨으로 마운트할 때 defaultMode: 0400을 주는 이유는 무엇인가?',
      o: ['nginx가 0400이 아니면 시작하지 않아서', '기본 0644 대신 소유자만 읽게 해 키 노출을 줄이려고', '파일 크기를 줄이려고'], a: 1,
      why: '마운트된 Secret 파일은 기본 0644라 누구나 읽는다. 0400이면 root만 tls.key를 읽는다.' },
    { q: 'ExternalSecret의 refreshInterval: 1h는 무엇을 뜻하는가?',
      o: ['Vault 값을 1시간마다 다시 읽어 K8s Secret을 갱신한다', '1시간 뒤 Secret을 지운다', 'Pod를 1시간마다 재시작한다'], a: 0,
      why: 'ESO가 주기마다 Vault를 읽어 Secret을 맞춘다. env로 받는 Pod는 그 값을 쓰려면 재시작이 필요하다.' },
  ];

  const summary = [
    '비밀번호를 ConfigMap에 두면 조회 권한만으로 평문이 보이고 git에 영구히 남는다.',
    'Secret의 data는 base64로 보일 뿐 암호화가 아니며 etcd에도 기본은 암호화 없이 저장된다.',
    'Secret은 env로 키를 골라 받거나, TLS처럼 파일이 필요하면 0400 권한으로 마운트한다.',
    '운영에서는 etcd 암호화와 RBAC 위에 SealedSecrets나 Vault 연동을 더한다.',
  ];
  const review = [
    { q: '개발자 누구나 kubectl get secret으로 DB 비번을 꺼내 볼 수 있다. 먼저 손댈 곳은?',
      o: ['Secret 값을 base64로 한 번 더 인코딩한다', 'RBAC로 그 네임스페이스의 secrets 조회 권한을 좁힌다', 'Secret을 ConfigMap으로 옮긴다'], a: 1,
      why: 'base64는 인코딩이라 몇 번을 감싸도 풀린다. 꺼내 보는 권한 자체를 막아야 한다.' },
    { q: 'Vault에서 DB 비번을 바꿨고 K8s Secret도 갱신됐는데 앱은 옛 비번으로 접속한다. 앱은 env로 값을 받는다. 이유는?',
      o: ['env는 컨테이너 시작 때 채워져 재시작 전까지 옛 값이다', 'ExternalSecret이 env를 지원하지 않는다', 'base64 디코딩이 실패했다'], a: 0,
      why: 'Secret이 바뀌어도 실행 중인 컨테이너의 환경 변수는 그대로다. Pod를 다시 띄우거나 파일 마운트로 받아야 한다.' },
    { q: 'Secret 매니페스트를 git으로 관리하고 싶다. 저장소에 올려도 되는 것은?',
      o: ['data에 base64 값을 넣은 Secret YAML', 'stringData에 평문을 넣은 Secret YAML', 'kubeseal로 공개키 암호화한 SealedSecret YAML'], a: 2,
      why: 'SealedSecret은 클러스터 안 controller의 개인키로만 풀린다. base64나 stringData는 저장소를 본 사람 누구나 읽는다.' },
  ];

  R.page({ title: 'Secret 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
