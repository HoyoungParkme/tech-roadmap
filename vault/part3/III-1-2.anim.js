/* III-1-2 PKI — 짧은 수명 인증서 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
   체인(root 87600h → intermediate 43800h → leaf 24h)과 role 규칙은 python cryptography 로 실제 인증서를 만들어 서명 검증까지 확인했다.
   만료 시각 1786503600 = 2026-08-12T03:00:00Z (2026-08-11T03:00Z 발급 + 24h, 예시). Agent 갱신 시점은 수명의 90%(lease_renewal_threshold 기본값). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, browser, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));

  // 인증서 카드: 위 띠 + 이름 + 둘째 줄 + 오른쪽 아래 도장
  function cert(cx, cy, w, h, name, line2, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.col || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: 8, rx: 4, fill: col, opacity: 0.8 }, g);
    tx(-w / 2 + 12, -h / 2 + 30, name, { 'font-size': 15, 'font-weight': 800, fill: col }, g);
    if (line2) tx(-w / 2 + 12, -h / 2 + 52, line2, { 'font-size': 13.5, fill: MUT, class: 'mono' }, g);
    if (!o.noSeal) { el('circle', { cx: w / 2 - 20, cy: h / 2 - 18, r: 11, fill: 'none', stroke: col, 'stroke-width': 2 }, g); el('circle', { cx: w / 2 - 20, cy: h / 2 - 18, r: 5, fill: col, opacity: 0.6 }, g); }
    return g; }
  // 수명 막대: 0..max 눈금 위에 [a, b] 구간
  function lifeBar(x, y, w, a, b, max, col, f, label) { const X = (v) => x + (v / max) * w, e = lerp(a, b, clamp(f ?? 1));
    el('rect', { x: X(a), y, width: Math.max(2, X(e) - X(a)), height: 18, rx: 4, fill: col, opacity: 0.8 });
    if (label && f >= 0.98) mono(X(b) + 8, y + 14, label, { 'font-size': 14, 'font-weight': 700, fill: col }); }
  const cmd = (x, y, s, f, o) => { o = o || {}; spans(x, y, [['$ ', { fill: MUT }], [typed(s, f), { fill: INK, 'font-weight': 600 }]], { 'font-size': o.fs || 14.5, opacity: o.op ?? 1 }); };
  function vaultBox(cx, cy, w, h, name, o) { o = o || {}; const g = card(cx, cy, w, h, { rx: 12, sw: 2.5, stroke: o.stroke || INK, s: o.s });
    tx(-w / 2 + 14, -h / 2 + 24, name, { 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: o.stroke || INK }, g); return g; }
  // 오른쪽 위 원형 화살표 (자기 서명)
  function selfArrow(cx, cy, r, f, col) { if (f <= 0) return; const a0 = -Math.PI * 0.9, a1 = a0 + Math.PI * 1.6 * clamp(f);
    el('path', { d: `M${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}`, fill: 'none', stroke: col, 'stroke-width': 2.5, 'marker-end': f > 0.97 ? 'url(#ra-ahb)' : null }); }

  // 1. 손으로 관리하던 1년짜리 인증서
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const steps = ['openssl req (CSR)', '메일로 CA 담당자', '며칠 대기', 'scp로 서버에'];
      steps.forEach((s, i) => { const x = 130 + i * 235; card(x, 90, 190, 54, { rx: 10, text: s, fs: 14.5, stroke: i === 2 ? WARN : INK, color: i === 2 ? WARN : INK, s: pop(u, 0.2 + i * 0.35) });
        if (i < 3) grow(x + 97, 90, x + 138, 90, E(u, 0.45 + i * 0.35, 0.65 + i * 0.35), MUT); });
      cert(260, 270, 260, 96, 'server.crt', 'CN=api.svc · 365일', { s: pop(u, 1.8) });
      lifeBar(450, 262, 380, 0, 365, 365, INK, E(u, 1.9, 2.6), '365일');
      sub(640, 310, '사람 손이 서너 번, 서버 수만큼 반복', fade(u, 2.3), { 'font-weight': 700 }); return; }
    if (k === 1) { const x = 120, w = 600, d = lerp(300, 366, E(u, 0.2, 1.4)), X = (v) => x + (v / 380) * w;
      el('line', { x1: x, y1: 120, x2: x + w, y2: 120, stroke: GRID, 'stroke-width': 2 });
      [0, 335, 365].forEach((v) => { el('line', { x1: X(v), y1: 112, x2: X(v), y2: 128, stroke: MUT, 'stroke-width': 2 }); mono(X(v), 150, v + '일', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
      sub(X(335), 92, '만료 30일 전 알림 (놓침)', 1, { fill: WARN, 'font-weight': 700 });
      el('rect', { x: X(0), y: 104, width: X(Math.min(d, 365)) - X(0), height: 10, rx: 4, fill: d > 365 ? BAD : INK, opacity: 0.7 });
      el('circle', { cx: X(d), cy: 120, r: 8, fill: d > 365 ? BAD : INK });
      browser(480, 280, 420, 150, null, { stroke: BAD, s: pop(u, 1.4) });
      mono(480, 290, 'NET::ERR_CERT_DATE_INVALID', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
      sub(480, 320, '서비스 전체가 멈춘다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { cert(170, 130, 200, 80, 'server.key', '유출', { col: BAD, s: pop(u, 0.2), noSeal: true });
      card(480, 130, 230, 120, { rx: 10, stroke: INK, sw: 2 }); tx(380, 92, 'CRL (폐기 목록)', { 'font-size': 14.5, 'font-weight': 800 });
      [['serial 1f:…', 0], ['serial 3a:8f:…', 1]].forEach(([s, i]) => mono(380, 125 + i * 28, s, { 'font-size': 14, fill: i ? BAD : MUT, 'font-weight': i ? 700 : 400, opacity: i ? fade(u, 0.8) : 1 }));
      grow(272, 130, 360, 130, E(u, 0.5, 0.9), BAD);
      browser(800, 140, 200, 120, '클라이언트', { s: pop(u, 1.0) });
      grow(596, 130, 694, 130, E(u, 1.2, 1.7), MUT, { dash: '6 6', plain: true }); cross(645, 130, 10, pop(u, 1.7));
      check(800, 150, 14, pop(u, 2.0)); sub(800, 238, 'CRL을 안 읽으면 여전히 신뢰', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { const n = Math.floor(lerp(0, 40, E(u, 0.2, 1.6)));
      tx(70, 50, '인증서 40장 · 남은 기간', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 40; i++) { if (i >= n) break; const col = i % 4, row = Math.floor(i / 4), x = 70 + col * 215, y = 70 + row * 32, left = ((i * 37) % 100) / 100;
        el('rect', { x, y, width: 190, height: 14, rx: 3, fill: SOFT });
        el('rect', { x, y, width: Math.max(3, 190 * left), height: 14, rx: 3, fill: left < 0.12 ? BAD : left < 0.3 ? WARN : INK, opacity: 0.75 }); }
      sub(480, 404, '스프레드시트로 쫓다 보면 언젠가 하나를 놓친다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); return; }
    // k4: 긴 막대 하나 vs 짧은 막대 여러 개
    const x = 160, w = 680;
    tx(x, 110, '지금: 1년 한 장', { 'font-size': 15, 'font-weight': 700 }); lifeBar(x, 124, w, 0, 1, 1, INK, 1);
    tx(x, 210, '바꿀 모양: 짧게, 자동으로 다시', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    for (let i = 0; i < 14; i++) { const f = E(u, 0.3 + i * 0.12, 0.45 + i * 0.12); if (f <= 0) continue;
      el('rect', { x: x + i * (w / 14), y: 224, width: (w / 14 - 6) * f, height: 18, rx: 4, fill: ACC, opacity: 0.8 }); }
    banner(480, 330, '짧은 수명 + 자동 발급 + 자동 만료', pop(u, 2.1));
  }

  // 2. root / intermediate
  function s2(t, c) { const { k, u } = c, RX = 200, RY = 92, IX = 200, IY = 232, LY = 362;
    const rx = 440, rw = 440, X = (y) => rx + (y / 10) * rw;
    el('line', { x1: rx, y1: 404, x2: rx + rw, y2: 404, stroke: GRID, 'stroke-width': 2 });
    [0, 5, 10].forEach((v) => { el('line', { x1: X(v), y1: 398, x2: X(v), y2: 410, stroke: MUT, 'stroke-width': 2 }); mono(X(v), 394, v + '년', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    // root
    const rootOn = k >= 1, rf = k === 1 ? pop(u, 0.4) : 1;
    if (!rootOn) { el('rect', { x: RX - 130, y: RY - 44, width: 260, height: 88, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: k === 0 ? fade(u, 0.3) : 1 });
      mono(RX, RY + 5, 'pki/', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: k === 0 ? fade(u, 0.3) : 1 }); }
    else cert(RX, RY, 260, 88, 'Vault Root CA', 'pki/ · 자기 서명', { col: ACC, s: rf });
    lifeBar(rx, RY - 9, rw, 0, 10, 10, ACC, k === 0 ? E(u, 0.8, 1.9) : 1, '87600h');
    if (k === 0) sub(RX, RY + 64, 'max-lease-ttl 87600h = 10년', fade(u, 1.6), { 'font-weight': 700 });
    if (k === 1) { selfArrow(RX + 175, RY - 28, 24, E(u, 0.9, 1.8), ACC); sub(RX + 175, RY + 24, '자기 서명', fade(u, 1.8), { fill: ACC, 'font-weight': 700 }); }
    // intermediate
    if (k >= 2) { const signed = k >= 4 && (k > 4 || u > 1.3);
      if (!signed) { el('rect', { x: IX - 130, y: IY - 44, width: 260, height: 88, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '7 6' });
        mono(IX, IY + (k >= 3 ? -14 : 5), 'pki_int/', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
        if (k >= 3) { lock(IX - 40, IY + 20, true, INFO, k === 3 ? pop(u, 0.3) : 1); sub(IX + 30, IY + 26, '키쌍 생성', 1, { fill: INFO, 'font-weight': 700 }); } }
      else cert(IX, IY, 260, 88, 'Vault Intermediate CA', 'pki_int/ · root가 서명', { col: INFO, s: k === 4 ? pop(u, 1.3) : 1 });
      lifeBar(rx, IY - 9, rw, 0, 5, 10, INFO, k === 2 ? E(u, 0.5, 1.5) : 1, '43800h = 5년');
      if (k >= 1) grow(RX, RY + 46, IX, IY - 48, k === 4 ? E(u, 1.2, 1.6) : k > 4 ? 1 : 0, ACC); }
    if (k === 3) { fly(IX + 140, IY - 10, IX + 140, (RY + IY) / 2, seg(u, 0.9, 2.0), 'pki_int.csr', { mono: true, fill: INFO, stay: true });
      sub(IX + 132, IY + 60, '"이 공개키에 서명해 달라"', fade(u, 1.6), { fill: INFO, 'font-weight': 700 }); }
    if (k === 4) { pill(RX + 150, (RY + IY) / 2, 'sign-intermediate ttl=43800h', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      sub(660, (RY + IY) / 2 + 5, 'root가 나서는 유일한 순간', fade(u, 1.6), { 'font-weight': 700 }); }
    if (k === 5) { cert(IX, LY, 260, 70, 'api.svc.internal', 'leaf · 24h', { col: GOOD, s: pop(u, 0.2), noSeal: true });
      grow(IX, IY + 46, IX, LY - 37, E(u, 0.3, 0.7), INFO);
      [[LY, IY, 'intermediate 공개키로 확인'], [IY, RY, 'root 공개키로 확인']].forEach(([y0, y1, s], i) => { const f = E(u, 0.9 + i * 0.6, 1.4 + i * 0.6);
        grow(IX - 150, y0 - 10, IX - 150, y1 + 20, f, GOOD); if (f >= 1) check(IX - 150, (y0 + y1) / 2, 9, 1); });
      sub(IX + 10, LY + 50, '검증은 leaf → intermediate → root로 거슬러 간다', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); }
  }

  // 3. role
  function s3(t, c) { const { k, u } = c;
    // 왼쪽: role 카드
    vaultBox(220, 160, 360, 230, 'pki_int/roles/svc-internal', { s: k === 0 ? pop(u, 0.1) : 1 });
    const rows = [['allowed_domains', 'svc.internal'], ['allow_subdomains', 'true'], ['allow_bare_domains', 'false'], ['ttl', '24h'], ['max_ttl', '72h'], ['key_type / bits', 'rsa / 2048']];
    rows.forEach(([a, b], i) => { const show = i < 3 ? (k === 0 ? fade(u, 0.3 + i * 0.25) : 1) : (k === 1 ? fade(u, 0.2 + (i - 3) * 0.3) : k > 1 ? 1 : 0);
      const hot = k === 2; mono(56, 100 + i * 30, a, { 'font-size': 14, fill: MUT, opacity: show }); mono(240, 100 + i * 30, b, { 'font-size': 14.5, 'font-weight': 700, fill: hot ? GOOD : INK, opacity: show }); });
    if (k === 2) { cmd(40, 312, 'vault read pki_int/roles/svc-internal', E(u, 0.1, 0.8)); sub(220, 340, '규칙이 Vault에 기록돼 있다', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 0) { // 도메인 나무
      const P = [620, 90], kids = [['api.svc.internal', true], ['db.svc.internal', true]];
      card(P[0], P[1], 170, 40, { rx: 20, text: 'svc.internal', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.4) }); cross(P[0] + 100, P[1], 9, pop(u, 1.8));
      sub(P[0] + 210, P[1] + 5, 'bare 도메인 막음', fade(u, 1.9), { fill: BAD });
      kids.forEach(([s, ok], i) => { const x = 560 + i * 220, y = 220; grow(P[0], P[1] + 20, x, y - 20, E(u, 0.8 + i * 0.3, 1.2 + i * 0.3), GOOD);
        card(x, y, 190, 40, { rx: 20, text: s, fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.1 + i * 0.3) }); check(x, y + 40, 9, pop(u, 1.5 + i * 0.3)); }); }
    if (k === 1) { const x = 470, w = 430, X = (h) => x + (h / 100) * w, y = 150;
      el('line', { x1: x, y1: y + 40, x2: x + w, y2: y + 40, stroke: GRID, 'stroke-width': 2 });
      [0, 24, 72, 100].forEach((v) => mono(X(v), y + 64, v + 'h', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      el('rect', { x: X(0), y: y + 22, width: X(24) - X(0), height: 14, rx: 4, fill: GOOD, opacity: 0.7 }); mono(X(12), y + 14, 'ttl 기본', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD });
      el('line', { x1: X(72), y1: y - 10, x2: X(72), y2: y + 50, stroke: BAD, 'stroke-width': 3 }); mono(X(72), y - 18, 'max_ttl', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
      const req = E(u, 0.6, 1.8), end = lerp(0, 100, req), shown = Math.min(end, 72);
      tx(x, y + 104, '요청 ttl=100h', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) });
      el('rect', { x: X(0), y: y + 116, width: X(shown) - X(0), height: 16, rx: 4, fill: INFO, opacity: 0.8 });
      if (end > 72) el('rect', { x: X(72), y: y + 116, width: X(end) - X(72), height: 16, rx: 4, fill: OFF, opacity: 0.6 * (1 - E(u, 2.0, 2.5)) });
      sub(X(72), y + 160, '72h를 넘지 못한다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
    if (k === 3 || k === 4) { const gx = 640; el('rect', { x: gx - 8, y: 60, width: 16, height: 220, rx: 4, fill: BAD, opacity: 0.85 });
      const reqs = k === 3 ? [['cn=api.example.com', 0]] : [['cn=api.example.com', 0], ['cn=api.svc.internal ttl=1000h', 1]];
      reqs.forEach(([s, i]) => { const y = 110 + i * 110, f = E(u, 0.2 + i * 0.6, 1.0 + i * 0.6), x = lerp(960 - tw(s, 13.5) / 2 - 30, gx + tw(s, 13.5) / 2 + 30, f);
        pill(x, y, s, i ? WARN : BAD, 1, { mono: true, fs: 13.5 });
        if (f >= 1) { if (i === 0) cross(gx, y, 12, pop(u, 1.0)); else check(gx, y, 12, pop(u, 1.6)); } });
      if (k === 3) mono(480, 330, 'Error: common name api.example.com not allowed by this role', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.3) });
      else { sub(800, 260, '나오더라도 72h까지만', fade(u, 2.0), { fill: WARN, 'font-weight': 700 }); person(880, 330, '토큰 탈취범', { stroke: BAD, s: pop(u, 0.1) });
        banner(400, 370, '거부는 CA 쪽에서 일어난다', pop(u, 2.3)); } }
  }

  // 4. issue
  function s4(t, c) { const { k, u } = c, V = [150, 210];
    vaultBox(V[0], V[1], 220, 150, 'pki_int/', { stroke: INFO });
    sub(V[0], V[1] + 10, 'role: svc-internal', 1, { 'font-weight': 700 });
    if (k === 0) { cmd(40, 46, 'vault write pki_int/issue/svc-internal common_name=api.svc.internal ttl=24h', E(u, 0.1, 1.2), { fs: 14 });
      lock(V[0], V[1] + 45, false, ACC, pop(u, 1.4)); sub(V[0], V[1] + 100, '개인키를 그 자리에서 만든다', fade(u, 1.6), { fill: ACC, 'font-weight': 700 });
      sub(620, 230, 'CSR도, 담당자도, 며칠 대기도 없다', fade(u, 2.0), { 'font-weight': 700 }); return; }
    // 응답 상자
    const X0 = 300; el('rect', { x: X0, y: 40, width: 620, height: 340, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); mono(X0 + 16, 64, 'data { … } 응답', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    grow(V[0] + 112, V[1], X0 - 4, V[1], k === 1 ? E(u, 0.1, 0.5) : 1, INFO);
    if (k < 4) cert(X0 + 140, 140, 240, 90, 'certificate', 'CN=api.svc.internal', { col: GOOD, s: k === 1 ? pop(u, 0.5) : 1 });
    if (k === 1) sub(X0 + 140, 210, 'intermediate가 서명', fade(u, 1.3), { fill: GOOD, 'font-weight': 700 });
    if (k === 2 || k === 3) { ['Vault Intermediate CA', 'Vault Root CA'].forEach((s, i) => cert(X0 + 460, 110 + i * 76, 250, 64, i ? 'root' : 'intermediate', s, { col: i ? ACC : INFO, s: k === 2 ? pop(u, 0.3 + i * 0.4) : 1, noSeal: true }));
      mono(X0 + 460, 172 + 76, 'issuing_ca + ca_chain', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 2 ? fade(u, 1.2) : 1 }); }
    if (k === 3) { const f = 1, yy = 270;
      cert(X0 + 140, yy + 30, 240, 70, 'private_key', 'RSA · 응답에 한 번만', { col: WARN, s: k === 3 ? pop(u, 0.2) : f, noSeal: true });
      mono(X0 + 290, yy + 10, 'serial_number 3a:8f:1c:…:9d', { 'font-size': 14, opacity: k === 3 ? fade(u, 0.7) : 1 });
      mono(X0 + 290, yy + 36, 'expiration  1786503600', { 'font-size': 14, opacity: k === 3 ? fade(u, 1.0) : 1 });
      mono(X0 + 290, yy + 62, '= 2026-08-12T03:00Z (발급 + 24h)', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: k === 3 ? fade(u, 1.4) : 1 }); }
    if (k === 4) { const outs = [['cert + key', '서비스 TLS', GOOD, 120], ['ca_chain', '상대방 검증', INFO, 210], ['serial', '한 장만 revoke', BAD, 300]];

      outs.forEach(([a, b, col, y], i) => { const s = pop(u, 0.3 + i * 0.45); pill(X0 + 130, y, a, col, s, { mono: true, fs: 15 }); grow(X0 + 220, y, X0 + 380, y, E(u, 0.5 + i * 0.45, 0.9 + i * 0.45), col);
        tx(X0 + 400, y + 6, b, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, 0.8 + i * 0.45) }); });
      sub(X0 + 310, 360, '24h 뒤에는 스스로 만료된다', fade(u, 2.0), { 'font-weight': 700 }); }
  }

  // 5. 자동 갱신 · revoke · mTLS
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { cert(300, 200, 360, 170, 'api.svc.internal', 'leaf · 24h', { col: GOOD });
      ['CRL  https://vault.svc/v1/pki_int/crl', 'OCSP https://vault.svc/v1/pki_int/ocsp'].forEach((s, i) => mono(136, 240 + i * 26, typed(s, E(u, 0.4 + i * 0.7, 1.1 + i * 0.7)), { 'font-size': 13.5, fill: INFO }));
      browser(760, 200, 240, 150, '검증자', { s: pop(u, 1.6) });
      grow(640, 200, 488, 250, E(u, 1.9, 2.4), INFO, { dash: '6 5' }); sub(760, 210, '"아직 유효한가?"', fade(u, 2.1), { 'font-weight': 700 }); return; }
    if (k === 1) { const x = 90, w = 780, X = (h) => x + (h / 72) * w, y = 230;
      el('line', { x1: x, y1: y + 70, x2: x + w, y2: y + 70, stroke: GRID, 'stroke-width': 2 });
      [0, 24, 48, 72].forEach((v) => mono(X(v), y + 94, v + 'h', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      for (let i = 0; i < 4; i++) { const s0 = i * 21.6, f = E(u, 0.2 + i * 0.5, 0.7 + i * 0.5); if (f <= 0) continue; const yy = y - 90 + i * 38;
        el('rect', { x: X(s0), y: yy, width: Math.max(2, (X(Math.min(72, s0 + 24)) - X(s0)) * f), height: 22, rx: 5, fill: i % 2 ? INFO : GOOD, opacity: 0.75 });
        if (f >= 1 && i < 3) { el('line', { x1: X(s0 + 21.6), y1: yy - 4, x2: X(s0 + 21.6), y2: yy + 60, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); } }
      mono(X(21.6), y + 54, '21.6h', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(x, 60, 'Vault Agent: 수명의 90% 지점에서 새 인증서 → 파일 교체 → reload', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); return; }
    if (k === 2) { for (let i = 0; i < 6; i++) { const x = 110 + i * 150, hit = i === 2; cert(x, 130, 120, 70, hit ? '3a:8f:…' : '#' + (i + 1), null, { col: hit ? BAD : GOOD, noSeal: true, s: 1 });
        if (hit) cross(x, 140, 16, pop(u, 0.8)); }
      cmd(110, 230, 'vault write pki_int/revoke serial_number=3a:8f:1c:…:9d', E(u, 0.1, 0.7), { fs: 14 });
      mono(110, 262, 'revocation_time_rfc3339  2026-08-11T04:00:00Z', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.0) });
      card(480, 340, 300, 60, { rx: 10, stroke: INK, sw: 2, s: pop(u, 1.4) }); mono(480, 345, 'CRL += 3a:8f:1c:…:9d', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(800, 300, '나머지 다섯 장은 그대로', fade(u, 2.0), { fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 3) { server(190, 170, 'service-a', { lamp: GOOD }); server(770, 170, 'service-b', { lamp: GOOD });
      cert(190, 320, 170, 56, 'client.crt', null, { col: GOOD, noSeal: true }); cert(770, 320, 170, 56, 'server.crt', null, { col: GOOD, noSeal: true });
      fly(260, 140, 700, 140, seg(u, 0.3, 1.2), 'client.crt', { mono: true, fill: GOOD });
      fly(700, 200, 260, 200, seg(u, 1.2, 2.1), 'server.crt', { mono: true, fill: INFO });
      check(700, 110, 11, pop(u, 1.2)); check(260, 230, 11, pop(u, 2.1));
      sub(480, 290, '서로 ca_chain으로 상대 인증서를 확인', fade(u, 2.2), { 'font-weight': 700 }); return; }
    [['즉석 발급', 'issue 한 번', GOOD], ['짧은 TTL', '24h, 최대 72h', INFO], ['자동 갱신', 'Agent · 90% 지점', ACC], ['급한 회수', 'revoke + CRL/OCSP', BAD]].forEach(([a, b, col], i) => {
      const x = 150 + i * 220, s = pop(u, 0.2 + i * 0.35); card(x, 180, 190, 110, { rx: 12, stroke: col, sw: 2.5, s });
      tx(x, 172, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.35) });
      tx(x, 200, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.35) }); });
    banner(480, 330, '사람 손 없이 서비스 간 신뢰가 계속 돈다', pop(u, 1.9));
  }

  const quiz = [
    { q: '1년짜리 인증서를 손으로 관리할 때 가장 흔한 장애는 무엇인가?',
      o: ['갱신을 깜빡해 인증서가 만료된다', '인증서가 너무 짧아 자주 끊긴다', 'CA가 같은 시리얼을 두 번 쓴다'], a: 0,
      why: '캘린더 알림 하나에 기대다 놓치면 NET::ERR_CERT_DATE_INVALID로 서비스가 멈춘다. 코드 버그가 아니라 운영 절차의 구멍이다.' },
    { q: 'root 대신 intermediate가 실제 발급을 맡는 이유는 무엇인가?',
      o: ['intermediate가 더 빠른 알고리즘을 쓴다', 'intermediate가 새도 그것만 갈고 root는 지킬 수 있다', 'root는 인증서를 서명할 수 없다'], a: 1,
      why: 'root(87600h)는 intermediate CSR에 서명할 때만 나선다. 발급 업무는 pki_int(43800h)가 맡아 root를 깊이 보관한다.' },
    { q: 'role svc-internal(max_ttl=72h)에 ttl=100h로 발급을 요청하면 어떻게 되나?',
      o: ['100h짜리 인증서가 나온다', '수명이 72h를 넘지 못한다', 'role이 지워진다'], a: 1,
      why: 'TTL 상한이 role에 박혀 있어 요청자가 길게 불러도 max_ttl 72h를 넘는 인증서는 나오지 않는다.' },
    { q: 'issue 응답에서 다시 받을 수 없으니 받는 즉시 안전하게 보관해야 하는 것은?',
      o: ['ca_chain', 'issuing_ca', 'private_key'], a: 2,
      why: '개인키는 Vault가 그 자리에서 만들어 응답에 한 번만 담는다. 인증서와 체인은 공개 정보다.' },
    { q: '24h 인증서를 쓰는 서비스에서 Vault Agent는 대략 언제 새 인증서를 받아 오나?',
      o: ['발급 직후 바로', '수명의 90% 지점, 약 21.6시간 뒤', '만료되고 나서 장애가 난 뒤'], a: 1,
      why: '임대가 없는 인증서는 유효기간의 lease_renewal_threshold(기본 0.9) 지점에서 다시 받는다. 만료 전에 파일을 바꾸고 reload한다.' },
  ];

  const summary = [
    '1년짜리 인증서를 손으로 갱신하면 언젠가 깜빡하고 만료 장애가 난다.',
    'root는 10년으로 깊이 두고, 5년짜리 intermediate가 실제 발급을 맡는다.',
    'role이 허용 도메인과 max_ttl 72h를 못 박아 토큰이 새도 임의 인증서를 못 만든다.',
    'issue 한 번에 인증서·개인키·체인이 나오고, Agent가 수명 90% 지점에서 갈아 끼운다.',
  ];
  const review = [
    { q: '토큰이 새어 공격자가 pki_int/issue/svc-internal로 shop.example.com 인증서를 요청했다. 결과는?',
      o: ['role의 allowed_domains 밖이라 거부된다', 'intermediate가 서명해 그대로 나온다', 'root가 대신 서명한다'], a: 0,
      why: 'role은 svc.internal과 그 하위 도메인만 허용한다. 거부는 요청자의 선의가 아니라 CA 쪽 규칙에서 일어난다.' },
    { q: '인증서 한 장의 개인키가 샌 것 같다. 가장 알맞은 대응은?',
      o: ['root CA를 새로 만든다', 'serial로 그 한 장만 revoke하고 CRL/OCSP로 알린다', '모든 서비스 인증서를 즉시 지운다'], a: 1,
      why: 'serial 하나만 폐기하면 나머지 인증서는 영향이 없다. 수명이 24h라 그 한 장도 곧 스스로 만료된다.' },
    { q: 'mTLS를 켰더니 service-b가 service-a의 인증서를 믿지 못한다. 먼저 확인할 것은?',
      o: ['service-b가 intermediate와 root가 담긴 ca_chain을 갖고 있는지', 'service-a 인증서의 TTL이 72h를 넘는지', 'transit 키가 회전됐는지'], a: 0,
      why: '검증은 leaf에서 intermediate, root로 거슬러 간다. 체인이 없으면 Vault가 서명한 인증서라도 경로를 잇지 못한다.' },
  ];

  R.page({ title: 'PKI 발급 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
