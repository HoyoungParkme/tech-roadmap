/* V-1-2 시크릿 관리 — 평문 금지 · SOPS · Secret 템플릿 · ESO. 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, pill, banner, grow, fly, dot, zone,
    cross, check, lock, clock, person, dbIcon, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function fileCard(x, y, w, name, lines, o) {
    o = o || {}; const lh = o.lh || 23, op = o.op ?? 1, h = o.h || lines.length * lh + 46;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, opacity: op });
    el('path', { d: `M${x},${y + 30} V${y + 10} Q${x},${y} ${x + 10},${y} H${x + w - 10} Q${x + w},${y} ${x + w},${y + 10} V${y + 30} Z`, fill: SOFT, opacity: op });
    mono(x + 14, y + 20, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    lines.forEach((ln, i) => { if (ln == null) return; const [s, a0] = Array.isArray(ln) ? ln : [ln, null], a = a0 || {}, yy = y + 38 + i * lh, lop = op * (a.op ?? 1);
      if (lop <= 0.001) return;
      if (a.hi) el('rect', { x: x + 6, y: yy, width: w - 12, height: lh - 2, rx: 5, fill: a.hi === true ? ACCBG : a.hi, opacity: lop });
      mono(x + 14 + (a.ind || 0), yy + lh / 2 + 5, s, { 'font-size': o.fs || 14, fill: a.col || INK, 'font-weight': a.b ? 700 : 400, opacity: lop, 'text-decoration': a.strike ? 'line-through' : null }); });
    return { h, row: (i) => y + 38 + i * lh + lh / 2 }; }
  const T = (x, y, s, a) => tx(x, y, s, Object.assign({ 'font-size': 14 }, a || {}));
  const M = (x, y, s, a) => mono(x, y, s, Object.assign({ 'font-size': 14 }, a || {}));
  // 저장소 상자 (git)
  function repo(cx, cy, w, h, title, o) { o = o || {}; card(cx, cy, w, h, { rx: 12, stroke: o.stroke || INK, sw: 2.2, s: o.s, op: o.op, fill: o.fill });
    tx(cx - w / 2 + 14, cy - h / 2 + 22, title, { 'font-size': 13.5, 'font-weight': 700, fill: o.stroke || MUT, opacity: o.op ?? 1 }); }
  // 글자 뒤섞기: 평문이 u 만큼 암호문으로 바뀐다 (결정적)
  const GLY = 'Hn4tZ0LmKd83xY7pLqRb1cVe9pKk2A';
  function scramble(a, b, g) { const n = Math.round(lerp(a.length, b.length, g)), cut = Math.floor(g * n);
    let s = b.slice(0, cut); for (let i = cut; i < n; i++) s += g > 0 && g < 1 ? GLY[(i * 7 + cut) % GLY.length] : (a[i] || ''); return g >= 1 ? b : s; }

  // 아래 생애주기 띠: beat.stage (0~4)
  const FL = ['평문 values', 'SOPS 암호화', 'git 커밋', '배포 시 복호화', 'Secret 주입'];
  function rail(c) { const st = c.beat.stage, w = 160, g = 22, x0 = (960 - (5 * w + 4 * g)) / 2, y = 390;
    FL.forEach((s, i) => { const cx = x0 + i * (w + g) + w / 2, on = i === st, past = i < st;
      if (i < 4) el('line', { x1: cx + w / 2 + 3, y1: y, x2: cx + w / 2 + g - 3, y2: y, stroke: past ? ACC : GRID, 'stroke-width': 2.5 });
      card(cx, y, w, 34, { rx: 17, stroke: on ? (i === 0 ? BAD : ACC) : past ? ACC : GRID, sw: on ? 2.6 : 1.6, fill: on ? (i === 0 ? BADBG : ACCBG) : PANEL, text: s, fs: 13.5, color: on || past ? INK : MUT,
        s: on && c.k === 0 ? 1 + bump(c.u, 0.2) : 1 }); }); }

  // ---------- 1. 평문 시크릿의 위험 ----------
  function s1(t, c) { const { k, u } = c;
    const L = [['postgresql:', 0], ['  auth:', 0], ['    username: appuser', 0], ['    password: SuperSecret123!', 0, 1], ['app:', 1], ['  jwtSecret: my-jwt-signing-key', 1, 1], ['  stripeApiKey: sk_live_51Hxxxx', 1, 1], ['  awsSecretAccessKey: wJalrXUtnFEMI', 1, 1]];
    fileCard(24, 22, 420, 'values.yaml', L.map(([s, kk, red], i) => kk > k ? null : [s, { col: red ? BAD : INK, b: !!red, hi: red ? BADBG : null, op: kk === k && k <= 1 ? fade(u, 0.2 + i * 0.12) : 1 }]), { h: 238 });
    if (k === 0) { repo(730, 150, 300, 150, 'git 저장소', { s: pop(u, 0.4) });
      fly(380, 125, 730, 165, seg(u, 0.9, 2.0), 'password: SuperSecret123!', { mono: true, fill: BAD, stay: true });
      T(490, 290, 'values.yaml은 차트와 함께 커밋되는 파일이다', { fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 1) { [['jwtSecret', '토큰 위조'], ['stripeApiKey', '결제 키 → 금전 피해'], ['awsSecretAccessKey', '클라우드 계정 장악']].forEach(([a, b], i) => {
        const y = 70 + i * 74, s = pop(u, 0.4 + i * 0.4); card(700, y, 400, 56, { rx: 10, stroke: BAD, fill: BADBG, s });
        M(520, y - 4, a, { 'font-weight': 700, opacity: s }); T(520, y + 18, b, { fill: BAD, opacity: s }); });
      T(500, 300, '하나만 새도 피해가 크다', { 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 2) { repo(640, 170, 190, 90, 'private repo', { stroke: INK });
      lock(640, 182, true, INK, 1);
      const D = [['협업자 PC', 880, 70], ['CI 로그', 880, 170], ['fork', 880, 270]];
      D.forEach(([n, x, y], i) => { const s = pop(u, 0.3 + i * 0.3); card(x - 10, y, 120, 44, { rx: 10, stroke: WARN, text: n, fs: 14, s });
        for (let j = 0; j < 3; j++) dot([[735, 170], [x - 70, y]], ((t * 0.7 + j / 3 + i * 0.2) % 1) * clamp(u - 0.5), BAD, 5); });
      T(480, 320, '권한 있는 사람이 늘수록 새는 길도 는다', { fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 3) { const cs = [['c1', INK], ['c2', BAD], ['c3', INK], ['c4', INK]];
      el('line', { x1: 500, y1: 110, x2: lerp(500, 900, E(u, 0.1, 0.9)), y2: 110, stroke: INK, 'stroke-width': 3 });
      cs.forEach(([n, col], i) => { const x = 520 + i * 120, s = pop(u, 0.2 + i * 0.2); el('circle', { cx: x, cy: 110, r: 12 * s, fill: col === BAD ? BAD : PANEL, stroke: col, 'stroke-width': 3 }); M(x, 80, n, { 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: s }); });
      T(520, 160, 'c2: password 추가', { fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) }); T(760, 160, 'c3: password 삭제', { opacity: fade(u, 1.2) });
      el('path', { d: 'M760,170 C700,220 660,220 640,140', fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.5), 'marker-end': 'url(#ra-ahr)' });
      T(500, 260, 'c2를 열면 비밀번호가 그대로 보인다', { 'font-weight': 700, opacity: fade(u, 1.8) });
      T(500, 288, '이미 받아 간 복제본은 rebase로 못 지운다', { fill: MUT, opacity: fade(u, 2.0) });
      T(500, 316, '그래서 지우기보다 키를 바꾼다(로테이션)', { fill: BAD, opacity: fade(u, 2.3) }); }
    if (k === 4) { repo(620, 120, 300, 110, 'git 저장소', { stroke: GOOD, fill: GOODBG });
      M(620, 140, 'password: ENC[…]', { 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); lock(740, 100, true, GOOD, pop(u, 0.5));
      grow(620, 180, 620, 236, E(u, 0.8, 1.3), ACC);
      card(620, 270, 300, 56, { rx: 10, stroke: ACC, fill: ACCBG, text: '배포할 때만 풀어 쓴다', fs: 15, s: pop(u, 1.3) });
      T(820, 280, '다음 장면부터', { fill: MUT, opacity: fade(u, 1.8) }); }
    rail(c); }

  // ---------- 2. helm-secrets + SOPS ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { card(260, 160, 260, 200, { rx: 14, stroke: INK, sw: 2.4 });
      tx(150, 86, 'helm', { 'font-size': 20, 'font-weight': 800 });
      ['install', 'upgrade', 'template'].forEach((s, i) => M(160, 126 + i * 30, s, { fill: MUT }));
      const s = pop(u, 0.8); card(260, 226, 200, 36, { rx: 8, stroke: ACC, fill: ACCBG, text: 'secrets', fs: 15, mono: true, color: ACC, s });
      fly(720, 180, 260, 226, seg(u, 0.2, 0.9), 'helm-secrets', { mono: true });
      M(520, 70, 'helm plugin install', { opacity: fade(u, 0.2), fill: MUT }); M(520, 96, '  …/jkroepke/helm-secrets', { opacity: fade(u, 0.2), fill: MUT });
      T(520, 240, 'helm 명령에 secrets 하위 명령이 생긴다', { opacity: fade(u, 1.4) }); T(520, 266, '안쪽에서 SOPS를 불러 암호화·복호화한다', { fill: MUT, opacity: fade(u, 1.7) }); }
    if (k === 1) { M(60, 60, '$ age-keygen -o ~/.config/sops/age/keys.txt', { 'font-weight': 700, opacity: fade(u, 0.1) });
      const a = pop(u, 0.6), b = pop(u, 1.1);
      card(260, 170, 380, 96, { rx: 12, stroke: GOOD, fill: GOODBG, s: a }); T(90, 150, '공개키 · 암호화용', { 'font-weight': 700, fill: GOOD, opacity: a });
      M(90, 180, 'age1ql3z7hjy54pw3hyww5…', { opacity: a }); T(90, 204, '팀에 나눠 줘도 된다', { fill: MUT, opacity: a, 'font-size': 13.5 });
      card(700, 170, 380, 96, { rx: 12, stroke: BAD, fill: BADBG, s: b }); T(530, 150, '개인키 · 복호화용', { 'font-weight': 700, fill: BAD, opacity: b });
      M(530, 180, 'keys.txt', { opacity: b }); lock(860, 176, true, BAD, b);
      T(480, 290, 'keys.txt를 잃으면 커밋된 암호문을 아무도 못 푼다', { 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 2) { fileCard(40, 40, 400, '.sops.yaml', ['creation_rules:', ['  - path_regex: secrets.*\\.yaml$', { hi: true, b: true }], '    age: age1ql3z7hjy54…'], { op: fade(u, 0.1) });
      [['secrets.yaml', true], ['secrets-prod.yaml', true], ['values.yaml', false]].forEach(([f, ok], i) => { const y = 80 + i * 70, g = E(u, 0.6 + i * 0.4, 1.2 + i * 0.4);
        card(lerp(520, 640, g), y, 210, 44, { rx: 8, text: f, fs: 14, mono: true, stroke: g >= 1 ? (ok ? GOOD : OFF) : INK, color: g >= 1 && !ok ? MUT : INK });
        if (g >= 1) (ok ? check : cross)(780, y, 10, pop(u, 1.2 + i * 0.4)); });
      T(560, 310, '파일명이 규칙에 맞으면 공개키가 자동 적용된다', { fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 3) { M(40, 50, '$ helm secrets encrypt secrets.yaml > secrets.enc.yaml', { 'font-weight': 700, opacity: fade(u, 0.1) });
      const rows = [['password', 'SuperSecret123!', 'ENC[AES256_GCM,data:Hn4tZ0Lm,…]'], ['jwtSecret', 'my-jwt-signing-key', 'ENC[AES256_GCM,data:xY7pLq,…]']];
      T(60, 100, 'key', { fill: MUT, 'font-weight': 700 }); T(300, 100, 'value', { fill: MUT, 'font-weight': 700 });
      rows.forEach(([kk, a, b], i) => { const y = 140 + i * 60, g = E(u, 0.6 + i * 0.4, 1.8 + i * 0.4);
        M(60, y, kk + ':', { 'font-weight': 700, 'font-size': 16 }); M(300, y, scramble(a, b, g), { 'font-size': 16, fill: g >= 1 ? GOOD : g > 0 ? WARN : BAD, 'font-weight': 700 }); });
      T(60, 290, 'key는 그대로, 값만 암호문이 된다', { 'font-weight': 700, opacity: fade(u, 2.2) });
      T(60, 316, '출력 파일로 원래 secrets.yaml을 바꿔 끼운다', { fill: MUT, opacity: fade(u, 2.4) }); }
    if (k === 4 || k === 5) { repo(720, 170, 360, 240, 'git 저장소', { stroke: GOOD });
      const files = [['secrets.yaml', 'ENC'], ['.sops.yaml', '규칙']];
      files.forEach(([f, tag], i) => { const y = 120 + i * 56; if (k === 4) fly(160, y, 680, y, seg(u, 0.3 + i * 0.4, 1.3 + i * 0.4), f, { mono: true, fill: GOOD, stay: true });
        else card(680, y, tw(f, 13.5) + 24, 28, { rx: 14, fill: GOOD, stroke: 'none', text: f, fs: 13.5, mono: true, color: PANEL }); });
      if (k === 4) { M(40, 300, '$ git add secrets.yaml .sops.yaml', { opacity: fade(u, 0.1) }); T(40, 326, '저장소에 남는 값은 모두 암호문이다', { fill: MUT, opacity: fade(u, 1.8) }); }
      if (k === 5) { el('rect', { x: 520, y: 80, width: 10, height: 190, rx: 5, fill: BAD, opacity: fade(u, 0.1) }); T(525, 300, '.gitignore', { 'text-anchor': 'middle', class: 'mono', fill: BAD, 'font-weight': 700 });
        const g = seg(u, 0.4, 1.4), back = seg(u, 1.4, 2.2), x = g < 1 ? lerp(140, 470, E(g, 0, 1)) : lerp(470, 220, E(back, 0, 1));
        card(x, 230, 120, 36, { rx: 8, stroke: BAD, fill: BADBG, text: 'keys.txt', fs: 14, mono: true, color: BAD });
        if (u > 1.4) cross(470, 196, 10, pop(u, 1.4));
        T(40, 330, '개인키가 같이 올라가면 암호화한 의미가 사라진다', { fill: BAD, opacity: fade(u, 2.0) }); } }
    rail(c); }

  // ---------- 3. 커밋되는 secrets.yaml ----------
  const ENCROWS = [['postgresql:', null, 0], ['  auth:', null, 0], ['    username:', 'ENC[…data:9pKk2A==…]', 1], ['    password:', 'ENC[…data:Hn4tZ0Lm…]', 1], ['    database:', 'ENC[…data:Kd83==…]', 1],
    ['app:', null, 0], ['  jwtSecret:', 'ENC[…data:xY7pLq…]', 2], ['  stripeApiKey:', 'ENC[…data:Rb1cVe…]', 2]];
  function s3(t, c) { const { k, u } = c, x0 = 30, y0 = 30, lh = 30;
    el('rect', { x: x0, y: y0, width: 470, height: ENCROWS.length * lh + 20, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 });
    ENCROWS.forEach(([kk, v, kb], i) => { const y = y0 + 30 + i * lh;
      M(x0 + 14, y, kk, { 'font-weight': 700, fill: k === 0 ? ACC : INK, opacity: k === 0 ? fade(u, 0.2 + i * 0.1) : 1 });
      if (v && kb <= Math.max(k, 0) && k >= 1) { const tamper = k === 4 && i === 3 && u > 0.6;
        M(x0 + 180, y, tamper ? 'ENC[…data:Hn4tX0Lm…]' : v, { fill: tamper ? BAD : GOOD, 'font-weight': 700, opacity: kb === k ? fade(u, 0.3 + i * 0.12) : 1 });
        if (tamper) el('rect', { x: x0 + 176, y: y - 18, width: 220, height: 26, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 2 }); } });
    const X = 540;
    if (k === 0) { T(X, 80, 'key 이름은 평문으로 남는다', { 'font-weight': 700, 'font-size': 16, opacity: fade(u, 0.6) });
      T(X, 110, '그래서 파일을 읽고 리뷰할 수 있다', { fill: MUT, opacity: fade(u, 0.9) }); }
    if (k === 1) { T(X, 80, 'DB 값 셋이 ENC[AES256_GCM,…]로', { 'font-weight': 700, opacity: fade(u, 0.5) });
      M(X, 140, 'SuperSecret123!', { fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 0.8) }); T(X, 170, '평문은 파일 어디에도 없다', { fill: MUT, opacity: fade(u, 1.1) }); }
    if (k === 2) { T(X, 60, 'jwtSecret만 바꾸면 diff는', { 'font-weight': 700, opacity: fade(u, 0.5) });
      const d = [['-  jwtSecret: ENC[…xY7pLq…]', BAD, BADBG], ['+  jwtSecret: ENC[…Qw3eRt…]', GOOD, GOODBG]];
      d.forEach(([s, col, bg], i) => { const op = fade(u, 1.0 + i * 0.4); el('rect', { x: X - 6, y: 90 + i * 34, width: 390, height: 28, rx: 5, fill: bg, opacity: op }); M(X, 109 + i * 34, s, { fill: col, 'font-weight': 700, opacity: op }); });
      T(X, 200, '그 줄만 바뀐다. 값마다 따로 암호화한다', { fill: MUT, opacity: fade(u, 1.9) }); sub(X + 190, 232, '새 암호문 글자는 예시', fade(u, 2.0), { 'text-anchor': 'start', fill: MUT }); }
    if (k === 3) { fileCard(X, 40, 390, 'sops: (자동 생성)', ['  age:', ['    - recipient: age1ql3z7hjy54…', { hi: true, b: true }], '      enc: |  (데이터 키, 암호화됨)', '  version: 3.8.1'], { op: fade(u, 0.2) });
      T(X, 230, '이 공개키의 짝(개인키)을 가진 사람만 푼다', { 'font-weight': 700, opacity: fade(u, 1.2) });
      T(X, 258, '수신자를 여럿 넣으면 팀원 각자 키로 푼다', { fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 4) { T(X, 70, '암호문 한 글자를 손으로 고치면', { 'font-weight': 700, opacity: fade(u, 0.4) });
      card(X + 150, 140, 300, 50, { rx: 10, stroke: INFO, text: 'mac: ENC[…] 검증', fs: 15, mono: true, s: pop(u, 1.0) });
      cross(X + 330, 140, 12, pop(u, 1.6)); T(X, 220, '값이 맞지 않아 복호화가 막힌다', { fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      T(X, 248, 'mac은 파일 전체의 무결성 검증값이다', { fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 5) { [['리뷰어', '키 이름 ✓ · 값 ✗', 90], ['keys.txt 가진 배포 환경', '값까지 복호화', 200]].forEach(([n, d, y], i) => { const s = pop(u, 0.3 + i * 0.6);
        person(X + 30, y, null, { s: 0.8 * s, stroke: i ? GOOD : INK }); T(X + 70, y - 4, n, { 'font-weight': 700, opacity: s }); T(X + 70, y + 20, d, { fill: i ? GOOD : MUT, opacity: s }); });
      T(X, 300, '커밋해도 안전한 이유', { 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); }
    rail(c); }

  // ---------- 4. 배포 시 복호화 + Secret 템플릿 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { fileCard(60, 40, 440, 'templates/secret.yaml', ['apiVersion: v1', ['kind: Secret', { b: true, hi: true }], 'metadata:', '  name: {{ include "my-app.fullname" . }}-secret', 'type: Opaque'].map((s, i) => Array.isArray(s) ? [s[0], Object.assign({ op: fade(u, 0.2 + i * 0.25) }, s[1])] : [s, { op: fade(u, 0.2 + i * 0.25) }]));
      T(560, 120, '복호화된 값이 끝내 담기는 곳', { 'font-weight': 700, opacity: fade(u, 1.4) }); T(560, 148, '이름은 fullname 헬퍼로 릴리스마다 다르게', { fill: MUT, opacity: fade(u, 1.7) }); }
    if (k === 1 || k === 2) { const isB = k === 2;
      M(40, 50, isB ? 'stringData:' : 'data:', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      const parts = isB ? [['"SuperSecret123!"', INK], ['| quote', INFO]] : [['"my-jwt-signing-key"', INK], ['| b64enc', ACC], ['| quote', INFO]];
      parts.forEach(([s, col], i) => { const x = 60 + i * 250, sc = pop(u, 0.3 + i * 0.4); card(x + 100, 110, 220, 44, { rx: 10, stroke: col, text: s, fs: 14, mono: true, s: sc });
        if (i) grow(x - 30, 110, x - 12, 110, E(u, 0.2 + i * 0.4, 0.5 + i * 0.4), MUT); });
      if (!isB) { M(60, 200, 'jwt-secret: "bXktand0LXNpZ25pbmcta2V5"', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
        T(60, 240, 'data에는 base64로 넣어야 한다. b64enc를 빠뜨리면 값이 깨진다', { fill: WARN, opacity: fade(u, 2.0) }); }
      else { M(60, 200, 'db-password: "SuperSecret123!"', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
        grow(500, 194, 600, 194, E(u, 1.4, 1.9), ACC); T(612, 186, 'API 서버가 저장할 때', { opacity: fade(u, 1.7) });
        M(612, 214, 'data: U3VwZXJTZWNyZXQxMjMh', { fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) });
        T(60, 270, '평문을 넣으면 쿠버네티스가 인코딩한다. 실수가 적다', { fill: MUT, opacity: fade(u, 2.2) }); } }
    if (k === 3) { repo(150, 120, 220, 100, 'git', { stroke: GOOD }); M(150, 140, 'ENC[…]', { 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 });
      card(450, 120, 220, 70, { rx: 10, stroke: WARN, fill: WARNBG, text: 'secrets.yaml.dec\n(임시 평문)', fs: 14, mono: true, s: pop(u, 0.7), op: 1 - seg(u, 2.0, 2.4) });
      grow(262, 120, 336, 120, E(u, 0.3, 0.7), ACC); M(300, 104, 'sops 복호화', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
      R.server(780, 120, 'helm install', { s: 0.8 }); grow(562, 120, 716, 120, E(u, 1.0, 1.6), ACC);
      if (u > 2.1) { cross(450, 120, 14, pop(u, 2.1)); T(450, 196, '끝나면 자동 삭제 (실패해도)', { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 }); }
      M(60, 270, '$ helm secrets install my-app . -f secrets.yaml', { 'font-weight': 700, opacity: fade(u, 0.1) });
      T(60, 300, '복호화는 배포하는 그 순간에만 일어난다', { fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { M(40, 50, '$ kubectl get secret my-app-secret -o yaml', { 'font-weight': 700 });
      M(60, 100, 'db-password: U3VwZXJTZWNyZXQxMjMh', { 'font-size': 16, opacity: fade(u, 0.3) });
      grow(200, 120, 200, 170, E(u, 0.8, 1.3), WARN); M(212, 150, 'base64 -d', { fill: WARN, 'font-weight': 700, opacity: fade(u, 0.9) });
      M(60, 200, 'SuperSecret123!', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      card(680, 140, 380, 90, { rx: 12, stroke: WARN, fill: WARNBG, text: 'base64는 인코딩이다\n암호화가 아니다', fs: 16, s: pop(u, 1.8) });
      T(60, 290, 'Secret을 읽을 수 있으면 값도 본다고 봐야 한다', { fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 5) { dbIcon(250, 160, 'etcd', { s: pop(u, 0.2) }); lock(250, 160, true, GOOD, pop(u, 0.8));
      T(250, 260, '저장 암호화', { 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) }); M(250, 284, 'EncryptionConfiguration', { 'text-anchor': 'middle', fill: MUT, 'font-size': 13.5, opacity: fade(u, 1.0) });
      el('rect', { x: 560, y: 60, width: 10, height: 220, rx: 5, fill: INFO, opacity: fade(u, 1.0) }); T(565, 304, 'RBAC', { 'text-anchor': 'middle', 'font-weight': 800, fill: INFO, opacity: fade(u, 1.0) });
      [['앱 ServiceAccount', true, 110], ['아무 개발자', false, 210]].forEach(([n, ok, y], i) => { const g = seg(u, 1.2 + i * 0.5, 2.0 + i * 0.5);
        const x = ok ? lerp(820, 470, E(g, 0, 1)) : lerp(820, 690, E(g, 0, 1)); card(x, y, 180, 40, { rx: 8, text: n, fs: 14, stroke: ok ? GOOD : BAD });
        if (g >= 1) (ok ? check(370, y, 10, 1) : cross(690, y - 40, 10, 1)); }); }
    rail(c); }

  // ---------- 5. External Secrets Operator / Vault ----------
  function s5(t, c) { const { k, u } = c;
    // 왼쪽 Vault, 가운데 클러스터, 오른쪽 아래 git
    dbIcon(110, 120, 'Vault', { stroke: INFO });
    M(40, 230, 'secret/', { fill: MUT }); M(60, 254, 'database/my-app', { fill: k === 5 ? ACC : MUT, 'font-weight': k === 5 ? 700 : 400 });
    M(80, 278, 'password: ' + (k >= 3 && u > 1.0 || k > 3 ? 'v2…' : 'v1…'), { fill: k === 5 ? ACC : MUT, 'font-weight': k === 5 ? 700 : 400 });
    zone(260, 26, 440, 300, '클러스터', { stroke: GRID });
    const ss = k === 0 ? pop(u, 0.3) : 1;
    card(400, 90, 220, 50, { rx: 10, stroke: INFO, text: 'SecretStore\nvault-backend', fs: 14, mono: true, s: ss });
    el('line', { x1: 160, y1: 110, x2: 290, y2: 95, stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': k === 0 ? `${E(u, 0.6, 1.3) * 140} 400` : null });
    if (k === 0) { T(290, 170, 'server: https://vault.example.com', { class: 'mono', 'font-size': 13.5, opacity: fade(u, 1.2) }); T(290, 196, 'path: secret · version: v2', { class: 'mono', 'font-size': 13.5, opacity: fade(u, 1.4) });
      T(730, 120, '외부 저장소를 한 번 등록해 두고', { opacity: fade(u, 1.8) }); T(730, 146, '여러 ExternalSecret이 같이 쓴다', { fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 1) { person(560, 200, 'ServiceAccount', { s: pop(u, 0.2) });
      dot([[530, 190], [300, 120], [160, 120]], seg(u, 0.6, 1.6), INFO, 7); M(300, 290, 'auth.kubernetes · role: my-app', { 'font-size': 13.5, opacity: fade(u, 1.2) });
      T(730, 120, '토큰을 심지 않고', { opacity: fade(u, 1.6) }); T(730, 146, 'SA로 Vault에 인증한다', { fill: MUT, opacity: fade(u, 1.8) }); }
    if (k >= 2) { const es = k === 2 ? pop(u, 0.3) : 1; card(540, 190, 220, 50, { rx: 10, stroke: ACC, text: 'ExternalSecret\nmy-app-db', fs: 14, mono: true, s: es });
      grow(470, 115, 520, 163, k === 2 ? E(u, 0.6, 1.0) : 1, MUT, { plain: true }); }
    // git: 참조만
    if (k >= 2) { repo(830, 260, 200, 110, 'git', { stroke: GOOD, op: k === 2 ? fade(u, 1.0) : 1 });
      M(830, 270, 'external-secret.yaml', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: k === 2 ? fade(u, 1.2) : 1 }); M(830, 294, '민감값 없음', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.5) : 1 }); }
    if (k === 2) { T(730, 70, '차트에는 이 참조만 들어간다', { opacity: fade(u, 1.8) }); T(730, 96, '암호문조차 저장소에 없다', { fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k >= 3) { const sv = k === 4 ? pop(u, 0.3) : k > 4 ? 1 : 0;
      if (sv) { card(400, 280, 230, 54, { rx: 10, stroke: INK, sw: 2.4, s: sv }); M(300, 274, 'Secret my-app-secret', { 'font-size': 13.5, 'font-weight': 700, opacity: sv }); M(300, 296, 'db-password: ••••', { 'font-size': 13.5, fill: ACC, opacity: sv }); grow(520, 216, 470, 250, k === 4 ? E(u, 0.4, 0.9) : 1, MUT); } }
    if (k === 3) { clock(560, 280, 30, (u / 3), WARN, 'refreshInterval 1h');
      fly(160, 270, 540, 200, seg(u, 1.0, 2.0), 'password v2', { mono: true, fill: INFO });
      T(730, 70, 'Vault에서 값을 바꾸면', { opacity: fade(u, 0.3) }); T(730, 96, '한 시간 안에 다시 당겨 온다', { fill: MUT, opacity: fade(u, 0.6) }); }
    if (k === 4) { T(730, 70, 'target.name이 만들 Secret 이름', { opacity: fade(u, 0.8) }); T(730, 96, 'secretKey가 그 안의 키 이름', { fill: MUT, opacity: fade(u, 1.1) });
      T(730, 150, '앱은 평소처럼', { opacity: fade(u, 1.6) }); T(730, 174, 'Secret만 읽으면 된다', { opacity: fade(u, 1.8) }); }
    if (k === 5) { dot([[160, 254], [520, 200], [400, 260]], seg(u, 0.4, 2.0), ACC, 8);
      T(730, 70, 'remoteRef', { class: 'mono', 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      M(730, 98, 'key: database/my-app', { 'font-size': 13.5, opacity: fade(u, 0.5) }); M(730, 122, 'property: password', { 'font-size': 13.5, opacity: fade(u, 0.7) });
      T(730, 170, '경로만 가리킨다', { fill: MUT, opacity: fade(u, 1.6) }); }
    rail(c); }

  const quiz = [
    { q: '평문 비밀번호를 커밋한 뒤 다음 커밋에서 지웠다. 이제 해야 할 일은 무엇인가?',
      o: ['그대로 두어도 된다', 'rebase로 히스토리를 고치면 끝난다', '노출된 것으로 보고 그 비밀번호를 바꾼다'], a: 2,
      why: '이전 커밋과 이미 받아 간 복제본에 값이 남는다. 지우기보다 키를 바꾸는 로테이션이 답이다.' },
    { q: '.sops.yaml의 path_regex가 secrets.*\\.yaml$ 일 때 자동으로 암호화 규칙이 붙지 않는 파일은 무엇인가?',
      o: ['secrets.yaml', 'values.yaml', 'secrets-prod.yaml'], a: 1,
      why: '파일명이 secrets로 시작해 .yaml로 끝나야 규칙에 맞는다. values.yaml은 대상이 아니다.' },
    { q: 'SOPS로 암호화한 secrets.yaml을 리뷰어가 열면 무엇을 볼 수 있는가?',
      o: ['키 이름은 보이고 값은 ENC[…] 암호문이다', '파일 전체가 한 덩어리 암호문이다', '값은 보이고 키 이름만 가려진다'], a: 0,
      why: 'SOPS는 값만 암호화하고 key 구조는 평문으로 둔다. 그래서 diff와 리뷰가 된다.' },
    { q: 'kubectl get secret으로 본 db-password: U3VwZXJTZWNyZXQxMjMh는 어떤 상태인가?',
      o: ['AES로 암호화돼 개인키가 있어야 풀린다', 'base64로 인코딩만 돼 누구나 풀 수 있다', '해시라서 원래 값을 알 수 없다'], a: 1,
      why: 'base64 -d 한 번이면 SuperSecret123! 이 나온다. 그래서 RBAC과 etcd 저장 암호화를 함께 건다.' },
    { q: 'External Secrets Operator 방식에서 git 저장소에 들어가는 것은 무엇인가?',
      o: ['Vault 경로를 가리키는 ExternalSecret 참조', 'SOPS로 암호화한 비밀번호', 'base64로 인코딩한 비밀번호'], a: 0,
      why: '값은 Vault에만 있고, 저장소에는 remoteRef 경로뿐이다. 클러스터가 refreshInterval마다 값을 당겨 온다.' },
  ];

  const summary = [
    'values.yaml에 적은 비밀번호는 git 히스토리와 복제본에 남는다. 새면 지우지 말고 바꾼다.',
    'SOPS는 값만 age 공개키로 암호화하고 키 이름은 남겨 리뷰가 되게 한다.',
    'helm secrets는 배포할 때만 임시 파일로 풀고 끝나면 지운다. Secret의 base64는 암호화가 아니다.',
    'ESO는 값을 Vault에 두고 저장소에는 경로만 남긴다. 값은 refreshInterval마다 다시 당겨 온다.',
  ];
  const review = [
    { q: 'secrets.yaml을 SOPS로 암호화해 커밋했는데 keys.txt도 같이 올라갔다. 가장 먼저 할 일은?',
      o: ['secrets.yaml을 한 번 더 암호화한다', '새 age 키로 다시 암호화하고 안의 비밀값도 바꾼다', '.gitignore에 keys.txt를 추가하면 끝난다'], a: 1,
      why: '개인키가 공개되면 지금까지의 암호문을 누구나 푼다. 키를 새로 만들고 노출된 값도 로테이션해야 한다.' },
    { q: '배포한 Secret의 jwt-secret 값이 깨져서 앱이 토큰을 검증하지 못한다. 템플릿에서 먼저 볼 곳은?',
      o: ['data에 넣으면서 b64enc를 빠뜨렸는지', 'stringData를 썼는지', 'Secret 이름에 fullname 헬퍼를 썼는지'], a: 0,
      why: 'data 필드는 base64 값을 기대한다. 평문을 그대로 넣으면 쿠버네티스가 엉뚱하게 해석한다. stringData는 평문이 맞다.' },
    { q: 'DB 비밀번호를 한 달마다 바꾸고 세 팀이 같이 쓴다. 어느 방식이 손이 덜 가는가?',
      o: ['values.yaml에 평문으로 두고 저장소를 private으로', '팀마다 SOPS 파일을 따로 만들어 커밋', 'Vault에 두고 ESO로 refreshInterval마다 동기화'], a: 2,
      why: '값을 Vault 한 곳에서 바꾸면 ESO가 각 클러스터의 Secret을 갱신한다. SOPS는 바꿀 때마다 다시 암호화해 커밋해야 한다.' },
  ];

  R.page({ title: '시크릿이 지나는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
