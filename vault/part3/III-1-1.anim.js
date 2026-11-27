/* III-1-1 transit — encryption as a service · 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림 속 암호문·HMAC·서명 값은 python cryptography 로 AES-GCM(12바이트 nonce + 16바이트 tag)·HMAC-SHA256·ed25519 를
   흉내 내 뽑은 예시다(키가 무작위라 실제 Vault 출력과 글자는 다르고 길이·형식만 같다). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    server, dbIcon, person, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  // 금고(Vault): 두꺼운 판 + 안쪽 테두리 + 오른쪽 위 다이얼
  function safe(cx, cy, w, h, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 3 }, g);
    el('rect', { x: -w / 2 + 7, y: -h / 2 + 7, width: w - 14, height: h - 14, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 1.5 }, g);
    el('circle', { cx: w / 2 - 26, cy: -h / 2 + 26, r: 11, fill: SOFT, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    [0, 1, 2, 3].forEach((i) => { const a = i * Math.PI / 2 + (o.spin || 0); el('line', { x1: w / 2 - 26, y1: -h / 2 + 26, x2: w / 2 - 26 + Math.cos(a) * 8, y2: -h / 2 + 26 + Math.sin(a) * 8, stroke: o.stroke || INK, 'stroke-width': 2 }, g); });
    tx(-w / 2 + 18, -h / 2 + 30, o.name || 'Vault', { 'font-size': 16, 'font-weight': 800, fill: o.stroke || INK }, g); return g; }
  // 열쇠 모양: 머리 원 + 몸통 + 이
  function keyIcon(cx, cy, s, col, o) { o = o || {}; const g = G(cx, cy, s, o.op), c = col || ACC;
    el('circle', { cx: -14, cy: 0, r: 9, fill: PANEL, stroke: c, 'stroke-width': 3.5 }, g);
    el('line', { x1: -5, y1: 0, x2: 20, y2: 0, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    [11, 18].forEach((x) => el('line', { x1: x, y1: 0, x2: x, y2: 7, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g));
    if (o.label) tx(0, 26, o.label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  // vault:vN:본문 — 접두사를 색으로 나눈다
  function ctx(x, y, v, body, o) { o = o || {};
    return spans(x, y, [['vault:', { fill: MUT }], ['v' + v + ':', { fill: v > 1 ? INFO : ACC, 'font-weight': 800 }], [body, { fill: o.col || INK }]],
      { 'font-size': o.fs || 14.5, 'text-anchor': o.anchor, opacity: o.op ?? 1 }); }
  const cmd = (x, y, s, f, o) => { o = o || {}; spans(x, y, [['$ ', { fill: MUT }], [typed(s, f), { fill: INK, 'font-weight': 600 }]], { 'font-size': o.fs || 15, opacity: o.op ?? 1 }); };
  // 문서 카드: 제목 줄 + 줄글
  function doc(x, y, w, title, lines, shown, o) { o = o || {}; const lh = 22, h = 40 + lines.length * lh;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    el('rect', { x, y, width: w, height: 26, rx: 8, fill: o.head || SOFT, opacity: o.op ?? 1 });
    mono(x + 12, y + 18, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    lines.forEach((ln, i) => { const f = clamp(shown - i); if (f <= 0) return; const [s, col] = Array.isArray(ln) ? ln : [ln, INK];
      mono(x + 12, y + 46 + i * lh, typed(s, f), { 'font-size': 14, fill: col, opacity: o.op ?? 1 }); }); return h; }

  const CT1 = 'NWdd+qvm…MaCO+gy6', CT2 = 'NFAczWBE…rA6e', RW2 = 'iZR/BTp0…w+g', HM = 'y3+5zoLF…eXWig=', SG = '1NoCMAp9…MmJvWDw==';
  const SSN = '900101-1234567', B64 = 'OTAwMTAxLTEyMzQ1Njc=';

  // 1. 앱이 키를 들고 있다
  function s1(t, c) { const { k, u } = c, A = { x: 220, y: 150 };
    card(A.x, A.y, 250, 130, { rx: 12, stroke: k >= 3 ? BAD : INK, sw: 2.5 });
    lbl(A.x, A.y - 44, '앱 서버', 1);
    const keyIn = k === 0 ? E(u, 1.2, 2.2) : 1, kx = k === 4 ? lerp(A.x, 480, E(u, 0.3, 1.6)) : A.x, ky = k === 4 ? lerp(A.y + 10, 80, E(u, 0.3, 1.6)) : lerp(A.y + 230, A.y + 22, keyIn);
    doc(A.x - 140, 262, 280, 'app.env', [['AES_KEY=3f9a1c…(32 bytes)', BAD]], k === 0 ? E(u, 0.2, 1.1) : 1);
    if (k === 4) { safe(480, 90, 190, 110, { s: pop(u, 0.2) }); }
    if (k < 4 || u < 1.6) keyIcon(kx, ky, 1.15, BAD, { label: k === 4 ? null : 'AES_KEY' });
    else keyIcon(480, 104, 1.15, ACC);
    if (k === 0) sub(A.x, 238, '평문 그대로 파일에 있다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
    // DB 와 표
    const D = { x: 800, y: 130 };
    dbIcon(D.x, D.y, 'users DB', { stroke: k === 3 ? BAD : INK });
    const rows = 3, plain = k === 3 ? Math.floor(lerp(0, rows + 0.99, E(u, 0.9, 2.2))) : 0;
    if (k >= 1) { tx(680, 236, 'ssn_enc', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono' });
      for (let i = 0; i < rows; i++) { const y = 250 + i * 34, on = k > 1 || seg(u, 1.6 + i * 0.25, 1.9 + i * 0.25) > 0, op = on ? 1 : 0;
        el('rect', { x: 680, y, width: 240, height: 28, rx: 5, fill: i < plain ? BADBG : SOFT, stroke: i < plain ? BAD : GRID, opacity: op });
        mono(692, y + 19, i < plain ? (i === 0 ? SSN : '평문 노출') : '▒▒▒▒▒▒▒▒▒▒▒▒', { 'font-size': 14, fill: i < plain ? BAD : MUT, 'font-weight': i < plain ? 700 : 400, opacity: op }); } }
    if (k === 1) { pill(A.x, A.y - 16, 'aesEncrypt(ssn, AES_KEY)', INK, pop(u, 0.2), { mono: true, fs: 13.5 });
      grow(A.x + 128, A.y, 742, A.y, E(u, 0.6, 1.4), INK); fly(A.x + 130, A.y - 24, 760, 240, seg(u, 0.8, 1.8), '암호문', { fill: INK }); }
    if (k === 2) { const x0 = 400, y0 = 46, n = Math.floor(lerp(0, 100, E(u, 0.2, 1.6)));
      for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), q = i % 10, on = i < n;
        el('rect', { x: x0 + q * 22, y: y0 + r * 15, width: 18, height: 11, rx: 2, fill: on ? BAD : 'none', stroke: on ? 'none' : GRID, opacity: on ? 0.75 : 1 }); }
      tx(510, 214, '인스턴스 100개가 같은 키', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      card(510, 300, 210, 62, { rx: 10, stroke: GRID, s: pop(u, 1.6) }); tx(510, 296, '복호화 감사 로그', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      sub(510, 318, '없음', fade(u, 1.7)); cross(600, 282, 9, pop(u, 2)); }
    if (k === 3) { pill(510, 90, 'DB 백업 유출', BAD, pop(u, 0.2), { fs: 14 }); pill(510, 140, '+ 앱 서버 침해', BAD, pop(u, 0.45), { fs: 14 });
      grow(590, 115, 676, 200, E(u, 0.6, 1.0), BAD);
      tx(510, 380, '키와 데이터가 같은 경계 안에 있었다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
    if (k === 4) { sub(480, 166, '키는 Vault 안으로', fade(u, 1.6), { fill: ACC, 'font-weight': 700 });
      banner(480, 390, 'transit = encryption as a service', pop(u, 1.9)); }
  }

  // 2. transit 켜고 키 만들기
  function s2(t, c) { const { k, u } = c, V = { x: 270, y: 240, w: 380, h: 270 };
    const cmds = ['vault secrets enable transit', 'vault write -f transit/keys/my-key', 'vault read transit/keys/my-key', 'vault read transit/keys/my-key', null];
    if (cmds[k]) cmd(60, 46, cmds[k], k === 3 ? 1 : E(u, 0.1, 0.9));
    safe(V.x, V.y, V.w, V.h, { spin: k * 0.4 });
    const m = k === 0 ? pop(u, 1.0) : 1;
    pill(V.x - 80, V.y - 70, 'transit/', ACC, m, { mono: true, fs: 15, fill: ACCBG });
    if (k === 0) sub(V.x - 80, V.y - 36, '새 경로가 마운트됐다', fade(u, 1.5), { fill: ACC, 'font-weight': 700 });
    if (k >= 1) { const s = k === 1 ? pop(u, 1.0) : 1; keyIcon(V.x - 20, V.y + 30, 1.5 * s, ACC);
      mono(V.x + 30, V.y + 36, 'my-key', { 'font-size': 16, 'font-weight': 800, opacity: s ? clamp(s) : 0 });
      pill(V.x + 140, V.y + 30, 'v1', ACC, s, { mono: true });
      lock(V.x - 20, V.y + 95, true, INK, k === 1 ? pop(u, 1.6) : 1);
      sub(V.x + 50, V.y + 100, '키 값은 금고 안에만', k === 1 ? fade(u, 1.8) : 1, { 'font-weight': 700 }); }
    if (k === 2 || k === 3) { const rows = [['name', 'my-key'], ['type', 'aes256-gcm96'], ['latest_version', '1'], ['min_decryption_version', '1'], ['exportable', 'false'], ['deletion_allowed', 'false'], ['키 값', '(응답에 없음)']];
      const x = 500, y = 92; el('rect', { x, y, width: 430, height: 30 + rows.length * 34, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(x + 14, y + 20, 'vault read 응답', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      rows.forEach(([a, b], i) => { const f = k === 2 ? fade(u, 0.6 + i * 0.25, 0.3) : 1, hot = k === 3 && (i === 4 || i === 5), gone = i === 6, yy = y + 30 + i * 34;
        if (hot) el('rect', { x: x + 6, y: yy + 3, width: 418, height: 28, rx: 6, fill: GOODBG });
        mono(x + 16, yy + 22, a, { 'font-size': 14.5, 'font-weight': 700, fill: gone ? MUT : INK, opacity: f });
        mono(x + 250, yy + 22, b, { 'font-size': 14.5, fill: gone ? BAD : hot ? GOOD : INK, 'font-weight': hot || gone ? 700 : 400, opacity: f }); }); }
    if (k === 3) { const out = E(u, 0.3, 1.0), back = E(u, 1.0, 1.6), x = V.x + 100 + 110 * out - 110 * back;
      keyIcon(x, V.y - 8, 0.9, MUT, { op: 0.8 }); if (u > 1.0) cross(V.x + V.w / 2, V.y - 8, 12, pop(u, 1.0));
      sub(V.x + 60, V.y - 34, '밖으로 못 나간다', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 4) { const ax = 780, ay = 240; card(ax, ay, 220, 120, { rx: 12, sw: 2.5, s: pop(u, 0.2) });
      lbl(ax, ay - 30, '앱', fade(u, 0.3)); mono(ax, ay + 2, 'AES_KEY = (없음)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
      sub(ax, ay + 32, '키 대신 이름만 안다', fade(u, 0.6));
      grow(ax - 112, ay, V.x + V.w / 2 + 6, ay, E(u, 0.9, 1.6), ACC);
      pill(610, ay - 40, '"my-key로 암호화해 줘"', ACC, pop(u, 1.4), { fs: 14 });
      tx(480, 400, 'transit은 데이터를 저장하지 않는 암복호화 서비스다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) }); }
  }

  // 3. encrypt / decrypt
  function s3(t, c) { const { k, u } = c, A = { x: 110, y: 120 }, V = { x: 480, y: 120 }, D = { x: 850, y: 120 };
    card(A.x, A.y, 150, 80, { rx: 10, sw: 2.5, text: '앱', fs: 16 });
    safe(V.x, V.y, 240, 140, { spin: k * 0.5 }); mono(V.x, V.y + 14, 'transit/' + (k === 3 || k === 4 ? 'decrypt' : 'encrypt') + '/my-key', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    keyIcon(V.x - 10, V.y + 42, 0.9, ACC);
    dbIcon(D.x, D.y, 'users');
    if (k === 0) { const sw = E(u, 0.8, 1.4);
      mono(A.x, 230, SSN, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: 1 - sw });
      mono(A.x + 40, 230, B64, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: sw });
      sub(A.x + 40, 256, 'base64는 포장일 뿐', fade(u, 1.3), { fill: INFO, 'font-weight': 700 });
      fly(A.x + 76, A.y, V.x - 124, V.y, seg(u, 1.6, 2.5), 'plaintext=OTAw…', { mono: true, fill: INFO }); }
    if (k === 1) { // 바이트 구성: nonce 12 + 암호문 14 + tag 16 = 42바이트 → base64 56자
      const x0 = 150, y = 250, sc = 15, parts = [['nonce', 12, MUT], ['암호문', 14, ACC], ['tag', 16, INFO]]; let x = x0;
      parts.forEach(([n, b, col], i) => { const w = b * sc * E(u, 0.2 + i * 0.35, 0.8 + i * 0.35);
        el('rect', { x, y, width: Math.max(1, w - 4), height: 36, rx: 5, fill: col, opacity: 0.85 });
        if (w > 60) tx(x + (b * sc - 4) / 2, y + 23, n + ' ' + b, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: PANEL });
        x += b * sc; });
      mono(x0 + 42 * sc + 12, y + 24, '= 42바이트', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      grow(480, y + 46, 480, y + 78, E(u, 1.7, 2.0), MUT); sub(560, y + 66, 'base64 → 56자', fade(u, 1.8));
      ctx(480, y + 108, 1, CT1, { anchor: 'middle', fs: 17, op: fade(u, 2.0) });
      grow(V.x, V.y + 72, V.x, y - 8, E(u, 0.1, 0.4), ACC); }
    if (k >= 2 && k < 5) { const tx0 = 600, ty = 230;
      tx(tx0, ty, 'users 테이블', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      el('rect', { x: tx0, y: ty + 10, width: 330, height: 34, rx: 6, fill: SOFT, stroke: GRID });
      mono(tx0 + 12, ty + 32, 'id 1', { 'font-size': 14, fill: MUT });
      const on = k === 2 ? fade(u, 1.6) : 1; ctx(tx0 + 60, ty + 32, 1, CT1, { fs: 14, op: on });
      sub(tx0 + 165, ty + 70, '평문 칸이 없다', on, { 'font-weight': 700, fill: GOOD }); }
    if (k === 2) { fly(V.x + 124, V.y - 30, D.x - 50, D.y - 30, seg(u, 0.2, 1.4), 'vault:v1:NWdd…', { mono: true }); }
    if (k === 3) { dot([[D.x - 46, D.y + 30], [A.x + 76, A.y + 30]], seg(u, 0.1, 0.9), INK, 7);
      fly(A.x + 76, A.y, V.x - 124, V.y, seg(u, 0.9, 1.7), 'ciphertext=vault:v1:…', { mono: true, fill: INK });
      fly(V.x - 124, V.y + 40, A.x, A.y + 66, seg(u, 1.8, 2.6), 'OTAw…', { mono: true, fill: INFO, stay: true });
      tx(300, 330, '오가는 것: 암호문과 base64 평문. 키는 오가지 않는다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 4) { mono(A.x + 40, 330, B64, { 'font-size': 16, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: 1 - E(u, 0.8, 1.4) });
      mono(A.x + 40, 330, SSN, { 'font-size': 18, 'text-anchor': 'middle', 'font-weight': 800, fill: GOOD, opacity: E(u, 0.8, 1.4) });
      sub(A.x + 40, 356, 'base64 --decode', fade(u, 0.3)); check(A.x + 160, 324, 10, pop(u, 1.5)); }
    if (k === 5) { const y = 250, s1 = pop(u, 0.2), s2 = pop(u, 1.2);
      card(250, y + 60, 380, 130, { rx: 10, stroke: INFO, sw: 2, s: s1 });
      ['POST /v1/transit/encrypt/my-key', 'X-Vault-Token: $TOKEN', '{"plaintext":"OTAwMTAx…"}'].forEach((l, i) => mono(76, y + 22 + i * 30, l, { 'font-size': 14, fill: i ? INK : INFO, 'font-weight': i ? 400 : 700, opacity: fade(u, 0.3 + i * 0.2) }));
      grow(446, y + 60, 520, y + 60, E(u, 0.9, 1.3), ACC);
      card(720, y + 60, 380, 100, { rx: 10, stroke: ACC, sw: 2, s: s2 });
      mono(546, y + 46, '{"data":{"ciphertext":', { 'font-size': 14, opacity: fade(u, 1.4) }); ctx(560, y + 76, 1, 'NWdd+qvm…"}}', { fs: 14, op: fade(u, 1.5) }); }
  }

  // 4. 키 회전
  function s4(t, c) { const { k, u } = c, p = c.prev || {};
    safe(480, 112, 860, 150, { name: 'Vault · transit/keys/my-key' });
    const vers = k === 5 ? 4 : 2;
    for (let v = 1; v <= vers; v++) { const x = 170 + (v - 1) * 190, s = (k === 0 && v === 2) ? pop(u, 0.9) : (k === 5 && v > 2) ? pop(u, 0.6 + (v - 3) * 0.7) : 1;
      const dead = k >= 4 && v === 1, col = dead ? OFF : v === 1 ? ACC : INFO;
      keyIcon(x, 120, 1.3 * s, col); pill(x + 62, 120, 'v' + v, col, s, { mono: true, fs: 14.5 });
      if (dead) sub(x + 10, 162, k === 4 ? (u > 1.4 ? '복호화 금지' : '') : '복호화 금지', 1, { fill: BAD, 'font-weight': 700 }); }
    if (k === 0) cmd(70, 236, 'vault write -f transit/keys/my-key/rotate', E(u, 0.1, 0.8), { fs: 14.5 });
    // 버전 수직선: latest_version 과 min_decryption_version
    if (k >= 1 && k <= 4) { const X = (v) => 180 + (v - 1) * 190, y = 250, lat = 2, mn = k === 4 ? lerp(1, 2, E(u, 0.3, 1.3)) : 1;
      el('line', { x1: X(1) - 40, y1: y, x2: X(4) + 20, y2: y, stroke: GRID, 'stroke-width': 3 });
      [1, 2, 3, 4].forEach((v) => { el('line', { x1: X(v), y1: y - 6, x2: X(v), y2: y + 6, stroke: MUT, 'stroke-width': 2 }); mono(X(v), y + 24, String(v), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
      const sh = k === 1 ? E(u, 0.4, 1.4) : 1;
      el('rect', { x: X(mn) - 6, y: y - 12, width: Math.max(12, (X(lat) - X(mn)) * sh + 12), height: 24, rx: 12, fill: GOOD, opacity: 0.25 });
      el('circle', { cx: X(mn), cy: y, r: 8, fill: BAD }); mono(X(mn), y - 20, 'min_decryption ' + (k === 4 ? Math.round(mn * 10) / 10 : 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
      el('circle', { cx: X(lat), cy: y, r: 8, fill: INFO }); mono(X(lat) + 12, y + 46, 'latest_version 2', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      if (k === 1) tx(X(4) - 10, y - 20, '복호화 허용 = 초록 띠', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 2) { const y = 350; mono(70, y, 'encrypt "new-data"', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      dot([[360, 140], [360, 300], [440, y - 5]], seg(u, 0.4, 1.4), INFO, 7);
      ctx(460, y, 2, CT2, { fs: 16, op: fade(u, 1.4) }); sub(600, y + 26, '회전 뒤 새 암호문은 자동으로 v2', fade(u, 1.8), { fill: INFO, 'font-weight': 700 }); }
    if (k === 3 || k === 4) { const y = 350; ctx(70, y, 1, CT1, { fs: 15 }); mono(300, y, '→ decrypt', { 'font-size': 14, fill: MUT });
      if (k === 3) { dot([[170, y - 20], [170, 150]], seg(u, 0.3, 1.2), ACC, 7); mono(420, y, SSN, { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) }); check(580, y - 5, 10, pop(u, 1.6));
        sub(700, y + 26, '옛 키 v1이 아직 남아 있다', fade(u, 1.8), { 'font-weight': 700 }); }
      else { cross(440, y - 5, 10, pop(u, 1.5)); mono(70, y + 34, 'ciphertext or signature version is disallowed by policy (too old)', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.7) }); } }
    if (k === 5) { const x0 = 120, y = 300, W = 720; el('line', { x1: x0, y1: y, x2: x0 + W, y2: y, stroke: MUT, 'stroke-width': 2 });
      [0, 30, 60].forEach((d, i) => { const x = x0 + (d / 75) * W; el('line', { x1: x, y1: y - 8, x2: x, y2: y + 8, stroke: MUT, 'stroke-width': 2 }); mono(x, y + 28, d + '일', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
        if (i) { const s = pop(u, 0.6 + (i - 1) * 0.7); card(x, y - 30, 60, 30, { rx: 8, text: 'v' + (i + 2), fs: 14, mono: true, stroke: INFO, color: INFO, s }); } });
      mono(x0, 380, 'auto_rotate_period=720h', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); sub(560, 380, '720h = 30일마다 새 버전 (앱 코드는 그대로)', fade(u, 1.8), { 'font-weight': 700 }); }
  }

  // 5. rewrap · HMAC · 서명 · 정리
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { safe(480, 200, 280, 170, { spin: u });
      ctx(40, 120, 1, CT1, { fs: 14.5, op: 1 - 0.6 * E(u, 0.6, 1.0) }); fly(250, 150, 400, 190, seg(u, 0.4, 1.1), 'v1', { mono: true });
      const pl = seg(u, 1.1, 1.4) * (1 - seg(u, 1.8, 2.1)); mono(480, 210, SSN, { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: pl * 0.8 });
      fly(560, 190, 700, 150, seg(u, 2.0, 2.5), 'v2', { mono: true, fill: INFO, stay: true });
      ctx(620, 300, 2, RW2, { fs: 14.5, op: fade(u, 2.3) });
      tx(480, 390, '평문은 금고 안에서만 잠깐 존재한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { const vs = [1, 2, 1, 1, 2, 1, 1, 2], x0 = 120;
      tx(x0, 70, 'users.ssn_enc 전 행을 차례로 rewrap', { 'font-size': 15, 'font-weight': 700 });
      vs.forEach((v, i) => { const y = 92 + i * 34, done = v === 1 && E(u, 0.3 + i * 0.22, 0.5 + i * 0.22) >= 1, now = v === 2 || done;
        el('rect', { x: x0, y, width: 420, height: 28, rx: 5, fill: now ? INFOBG : SOFT, stroke: GRID });
        mono(x0 + 12, y + 20, 'id ' + (i + 1), { 'font-size': 14, fill: MUT }); ctx(x0 + 70, y + 20, now ? 2 : 1, '…', { fs: 14 }); });
      el('polygon', { points: '0,0 14,8 0,16', transform: `translate(${x0 - 22} ${92 + Math.min(7, Math.floor(clamp((u - 0.3) / 0.22, 0, 7.99))) * 34 + 6})`, fill: ACC, opacity: u > 0.3 && u < 2.2 ? 1 : 0 });
      card(740, 220, 300, 110, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 2.0) });
      tx(740, 210, '다 바뀐 뒤에', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(740, 240, 'min_decryption_version=2', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { pill(180, 140, 'order-42:paid', INK, pop(u, 0.2), { mono: true, fs: 15 });
      grow(270, 140, 380, 140, E(u, 0.5, 0.9), MUT); card(470, 140, 170, 70, { rx: 10, stroke: ACC, sw: 2.5, text: 'HMAC\nsha2-256', fs: 14.5, s: pop(u, 0.7) });
      grow(556, 140, 620, 140, E(u, 1.1, 1.4), ACC); ctx(630, 146, 2, HM, { fs: 15, op: fade(u, 1.4) });
      sub(760, 176, '32바이트 → base64 44자', fade(u, 1.6));
      tx(480, 270, '받은 쪽이 다시 계산해 값이 같으면 그대로, 다르면 변조', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      check(330, 320, 12, pop(u, 2.1)); tx(355, 326, '같다', { 'font-size': 15, opacity: fade(u, 2.1) }); cross(600, 320, 11, pop(u, 2.3)); tx(625, 326, '다르다', { 'font-size': 15, fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { keyIcon(120, 120, 1.3, WARN); mono(170, 126, 'sign-key · type=ed25519', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      pill(180, 210, 'contract-body', INK, pop(u, 0.5), { mono: true, fs: 15 }); grow(270, 210, 340, 210, E(u, 0.8, 1.1), WARN);
      ctx(350, 216, 1, SG, { fs: 15, op: fade(u, 1.1) }); sub(500, 244, '서명 64바이트 → base64 88자', fade(u, 1.3));
      grow(480, 260, 480, 300, E(u, 1.6, 1.9), MUT); pill(480, 326, 'transit/verify/sign-key → valid: true', GOOD, pop(u, 1.9), { mono: true, fs: 14 });
      sub(480, 380, '개인키는 Vault밖에 없어서 "내가 안 했다"가 통하지 않는다', fade(u, 2.2), { 'font-weight': 700 }); return; }
    // k4 정리
    card(150, 200, 200, 110, { rx: 12, sw: 2.5 }); lbl(150, 180, '앱 코드', 1); mono(150, 214, '암호화 키 0줄', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 800, opacity: fade(u, 0.3) });
    safe(560, 200, 300, 220, {});
    [['생성', -90, -40], ['회전', 50, -40], ['폐기', -90, 30], ['감사 로그', 50, 30]].forEach(([s, dx, dy], i) => pill(560 + dx + 20, 200 + dy + 10, s, ACC, pop(u, 0.5 + i * 0.3), { fs: 15 }));
    grow(252, 200, 406, 200, E(u, 0.2, 0.6), ACC);
    sub(560, 340, '키 관리와 감사가 한 곳에 모인다', fade(u, 1.9), { 'font-weight': 700 });
    banner(480, 392, '앱은 평문과 이름만, 키는 금고 안에', pop(u, 2.2));
  }

  const quiz = [
    { q: '앱이 AES_KEY를 환경변수에 두고 직접 암호화할 때 가장 큰 위험은 무엇인가?',
      o: ['암호화 속도가 느려진다', '앱 서버와 DB 백업이 함께 새면 저장된 데이터가 전부 평문이 된다', '암호문이 너무 길어져 DB 칸이 모자란다'], a: 1,
      why: '키와 데이터가 같은 경계 안에 있으면 그 경계가 뚫리는 순간 모든 ssn_enc가 풀린다. 인스턴스 100개가 같은 키를 쓰면 한 곳만 뚫려도 된다.' },
    { q: 'vault read transit/keys/my-key 응답에 나오지 않는 것은 무엇인가?',
      o: ['type=aes256-gcm96', 'latest_version', '키 값 자체'], a: 2,
      why: 'read는 메타데이터만 돌려준다. exportable=false가 기본이라 키는 Vault 밖으로 나가지 않는다.' },
    { q: 'vault:v1:로 시작하는 암호문에서 v1이 뜻하는 것은 무엇인가?',
      o: ['1번 버전 키로 암호화했다', 'transit 엔진 API 버전 1', '첫 번째로 저장된 행'], a: 0,
      why: '접두사가 어느 키 버전으로 만들었는지 알려 준다. 그래서 회전 뒤에도 Vault가 맞는 버전 키를 골라 복호화한다.' },
    { q: 'rotate 뒤 min_decryption_version을 1로 둔 상태에서 vault:v1: 암호문을 decrypt 하면 어떻게 되나?',
      o: ['정상 복호화된다', '거부된다', 'v2로 자동 변환되어 돌아온다'], a: 0,
      why: '회전은 키를 갈아 끼우는 게 아니라 버전을 더한다. v1 키가 남아 있고 하한선이 1이라 옛 암호문도 풀린다.' },
    { q: 'rewrap의 쓰임새로 맞는 것은 무엇인가?',
      o: ['평문을 앱에 돌려주지 않고 옛 버전 암호문을 최신 버전으로 바꾼다', '데이터가 바뀌었는지 HMAC으로 확인한다', '키를 밖으로 내보내 백업한다'], a: 0,
      why: 'rewrap은 Vault 안에서 풀고 다시 잠근다. 전 행을 rewrap한 뒤에 min_decryption_version을 올리는 순서가 안전하다.' },
  ];

  const summary = [
    '앱이 AES 키를 직접 들고 있으면 앱과 DB 백업이 함께 샐 때 모든 데이터가 풀린다.',
    'transit은 키를 Vault 안에서 만들고 내보내지 않는다. 앱은 my-key라는 이름만 안다.',
    '앱은 base64 평문을 보내 vault:v1: 암호문을 받아 DB에 그대로 저장한다.',
    '회전은 버전을 더하는 일이라 옛 v1 암호문도 풀리고, rewrap으로 차례로 옮긴다.',
  ];
  const review = [
    { q: 'rotate 직후 min_decryption_version을 2로 올렸더니 일부 사용자 조회가 실패한다. 먼저 의심할 것은?',
      o: ['transit 엔진이 꺼졌다', 'DB에 아직 vault:v1: 암호문이 남아 있다', 'base64 인코딩이 잘못됐다'], a: 1,
      why: '하한선을 2로 올리면 v1 암호문은 too old로 거부된다. 전 행을 rewrap해 v2로 옮긴 뒤 올렸어야 한다.' },
    { q: '보안팀이 "누가 언제 주민번호를 복호화했는지" 알고 싶어 한다. transit으로 바꾼 뒤 가능한 이유는?',
      o: ['복호화가 모두 Vault 요청이라 감사 로그에 남는다', 'DB가 조회 기록을 자동으로 남긴다', '암호문 접두사에 사용자 이름이 들어간다'], a: 0,
      why: '앱이 직접 풀 때는 기록이 없었다. 이제 decrypt는 Vault API 호출이라 audit device가 요청마다 남긴다.' },
    { q: '주문 데이터가 중간에 바뀌지 않았는지 확인하려 한다. transit에서 고를 도구는?',
      o: ['rewrap', 'hmac 또는 sign', 'min_decryption_version'], a: 1,
      why: 'hmac은 같은 입력이면 같은 값을 내 변조를 잡고, sign은 Vault 안의 개인키로 서명해 부인까지 막는다.' },
  ];

  R.page({ title: 'transit 암복호화 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
