/* III-2-2 cross-provider 의존 — Output 과 dependsOn — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, lock } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const LX = [160, 480, 800], LN = [['AWS', WARN], ['GCP', INFO], ['Cloudflare', GOOD]];
  function lanes(on) { LN.forEach(([n, col], i) => { const s = on ? on[i] : 1; if (s <= 0) return;
      zone(LX[i] - 145, 20, 290, 390, null, { fill: SOFT, op: Math.min(1, s) });
      const g = card(LX[i], 40, 290, 36, { rx: 8, fill: col, stroke: 'none', s }); tx(0, 6, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: PANEL }, g); }); }
  function res(cx, cy, w, kind, name, col, o) { o = o || {}; const plan = o.st === 'plan', h = o.h || 52;
    const g = card(cx, cy, w, h, { rx: 8, stroke: col, sw: o.hot ? 3 : 2, dash: plan ? '6 5' : null, fill: PANEL, s: o.s, op: o.op });
    tx(-w / 2 + 12, -6, kind, { 'font-size': 14, 'font-weight': 800, fill: plan ? MUT : col }, g); mono(-w / 2 + 12, 15, name, { 'font-size': 14, fill: plan ? MUT : INK }, g);
    if (o.badge != null) { el('circle', { cx: w / 2, cy: -h / 2, r: 12, fill: col }, g); tx(w / 2, -h / 2 + 5, String(o.badge), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: PANEL }, g); }
    return g; }
  // 아직 값이 없는 Output: '?' → 값. o.secret 이면 자물쇠
  function outBox(cx, cy, w, label, val, open, o) { o = o || {}; const g = card(cx, cy, w, 40, { rx: 20, stroke: INFO, sw: 2, dash: open < 1 ? '5 4' : null, fill: INFOBG, s: o.s, op: o.op });
    if (label) mono(-w / 2 + 6, -28, label, { 'font-size': 13.5, 'font-weight': 700, fill: INFO }, g);
    if (open < 0.5) tx(0, 7, '?', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: INFO, opacity: 1 - open * 2 }, g);
    else mono(0, 6, val, { 'text-anchor': 'middle', 'font-size': o.fs || 13.5, 'font-weight': 700, fill: INK, opacity: (open - 0.5) * 2 }, g);
    if (o.secret) { lock(cx + w / 2 - 4, cy - 20, true, BAD, 0.8); }
    return g; }
  function gantt(x, y, w, rows, tmax, T, o) { o = o || {}; const rh = o.rh || 34, X = (v) => x + (v / tmax) * w;
    el('line', { x1: x, y1: y + rows.length * rh + 4, x2: x + w, y2: y + rows.length * rh + 4, stroke: MUT, 'stroke-width': 1.5 });
    (o.ticks || []).forEach((v) => mono(X(v), y + rows.length * rh + 22, v + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    rows.forEach((r, i) => { const yy = y + i * rh;
      mono(x - 10, yy + 21, r.n, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700 });
      el('rect', { x, y: yy + 6, width: w, height: 22, rx: 4, fill: SOFT });
      const e = Math.min(T, r.e); if (e > r.s) el('rect', { x: X(r.s), y: yy + 6, width: X(e) - X(r.s), height: 22, rx: 4, fill: r.col || ACC, opacity: 0.85 });
      if (T >= r.e) mono(Math.min(X(r.e) + 6, x + w - 40), yy + 22, (r.e - r.s) + 's', { 'font-size': 13.5, 'font-weight': 800, fill: r.col || ACC }); }); return X; }
  const EP = 'app-db.abc123.ap-northeast-2.rds.amazonaws.com:5432';   // @pulumi/pulumi mock 런타임에 넣은 예시 주소
  const HOST = 'app-db.abc123.ap-northeast-2.rds.amazonaws.com';

  // ---------- 1. 아직 없는 값 ----------
  function s1(t, c) { const { k, u } = c;
    lanes(k === 0 ? [pop(u, 0.3), pop(u, 0.7), pop(u, 1.1)] : null);
    if (k === 0) { LN.forEach(([n, col], i) => mono(LX[i], 92, '@pulumi/' + n.toLowerCase(), { 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }));
      sub(480, 240, '세 provider를 한 파일에서 import', fade(u, 1.8), { 'font-size': 17, fill: INK, 'font-weight': 700 }); return; }
    const stR = k >= 2 ? null : 'plan';
    res(LX[0], 130, 250, 'RDS Postgres', 'app-db', WARN, { st: stR, s: k === 1 ? pop(u, 0.2) : 1 });
    res(LX[1], 130, 250, 'Cloud Run', 'api-server', INFO, { st: 'plan', s: k === 1 ? pop(u, 0.5) : 1 });
    res(LX[2], 130, 250, 'DNS Record', 'api.example.com', GOOD, { st: 'plan', s: k === 1 ? pop(u, 0.8) : 1 });
    if (k === 1) { sub(480, 260, '서로 다른 cloud 인데 하나로 이어져야 한다', fade(u, 1.4), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    const mv = k === 3 ? E(u, 0.3, 1.3) : 0;
    outBox(lerp(LX[0], LX[1], mv), lerp(230, 200, mv), 230, 'rds.endpoint', '', 0, { s: k === 2 ? pop(u, 0.3) : 1 });
    if (k === 2) { snippet(30, 300, ['console.log(rds.endpoint)', '// 주소 문자열이 아니라 Output 객체'], { fs: 14, w: 300, op: fade(u, 1.0) });
      sub(LX[0], 270, 'Output<string> · 배포 뒤에 채워진다', fade(u, 0.8), { fill: INFO, 'font-weight': 700 }); return; }
    grow(LX[0] + 125, 130, LX[1] - 125, 130, E(u, 1.3, 1.9), ACC); mono(320, 118, '의존 자동', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    sub(LX[1], 250, '입력에 넣기만 했다', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }

  // ---------- 2. 출력을 참조하면 의존이 생긴다 ----------
  function s2(t, c) { const { k, u } = c;
    lanes();
    const F = [['engine', '"postgres"'], ['instanceClass', '"db.t3.micro"'], ['allocatedStorage', '20'], ['dbName', '"appdb"'], ['username', '"app"'], ['password', 'dbPassword']];
    zone(LX[0] - 135, 70, 270, 260, null, { fill: PANEL, stroke: WARN });
    tx(LX[0] - 120, 94, 'aws.rds.Instance("app-db")', { 'font-size': 13.5, 'font-weight': 800, fill: WARN, class: 'mono' });
    F.forEach(([kk, v], i) => { const need = i < 3 ? 0 : 1; if (k < need) return; const op = k === need ? fade(u, 0.3 + (i % 3) * 0.3) : 1;
      mono(LX[0] - 120, 126 + i * 32, kk, { 'font-size': 13.5, fill: MUT, opacity: op }); mono(LX[0] + 120, 126 + i * 32, v, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: i === 5 ? BAD : INK, opacity: op }); });
    if (k === 0) sub(LX[1] + 160, 230, '체인의 첫 리소스 · 이 값이 나와야 뒤가 움직인다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 1) { card(480, 330, 300, 60, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.2) }); mono(480, 326, 'dbPassword: secure: …', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.3) });
      sub(480, 348, 'stack config에 암호문으로 저장', fade(u, 1.4)); lock(640, 300, true, BAD, pop(u, 1.4)); grow(330, 320, 290, 296, E(u, 1.6, 2.0), BAD); return; }
    if (k >= 2) { zone(LX[1] - 135, 70, 270, 200, null, { fill: PANEL, stroke: INFO, op: k === 2 ? fade(u, 0.2) : 1 });
      tx(LX[1] - 120, 94, 'gcp.cloudrun.Service', { 'font-size': 13.5, 'font-weight': 800, fill: INFO, class: 'mono', opacity: k === 2 ? fade(u, 0.2) : 1 });
      ['DATABASE_HOST', 'DATABASE_NAME'].forEach((n, i) => { mono(LX[1] - 120, 140 + i * 60, n, { 'font-size': 14, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.5) : 1 });
        el('rect', { x: LX[1] - 120, y: 150 + i * 60, width: 240, height: 26, rx: 6, fill: k >= 3 ? INFOBG : SOFT, stroke: INFO, 'stroke-dasharray': k >= 4 && u > 1.6 ? null : '4 3' }); }); }
    if (k === 2) { pill(LX[1], 310, 'db.endpoint : Output<string>', INFO, pop(u, 1.0), { mono: true, fs: 13.5 }); sub(LX[1], 350, '아직 둘은 이어지지 않았다', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
    if (k >= 3) { [[222, 'db.endpoint', 163], [254, 'db.dbName', 223]].forEach(([y0, n, y1], i) => { grow(LX[0] + 135, y0 - 96 + i * 0, LX[1] - 122, y1, k === 3 ? E(u, 0.4 + i * 0.4, 1.0 + i * 0.4) : 1, ACC);
        mono(330, y1 - 40 + i * 20, n, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 0.9 + i * 0.4) : 1 }); }); }
    if (k === 3) sub(LX[1] + 40, 320, '이 한 줄이 두 cloud를 잇는다', fade(u, 1.8), { 'font-size': 16, fill: INK, 'font-weight': 700 });
    if (k === 4) { const open = E(u, 1.0, 1.6);
      mono(LX[1] - 112, 168, open > 0.5 ? 'app-db.abc123…:5432' : '?', { 'font-size': 13.5, fill: INK, 'font-weight': 700 }); mono(LX[1] - 112, 228, open > 0.5 ? 'appdb' : '?', { 'font-size': 13.5, fill: INK, 'font-weight': 700 });
      el('circle', { cx: LX[0] + 120, cy: 70, r: 13, fill: WARN }); tx(LX[0] + 120, 75, '1', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: PANEL });
      el('circle', { cx: LX[1] + 120, cy: 70, r: 13, fill: INFO, opacity: fade(u, 1.6) }); tx(LX[1] + 120, 75, '2', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.6) });
      el('rect', { x: 30, y: 360, width: 900 * E(u, 0.1, 1.0), height: 16, rx: 4, fill: WARN, opacity: 0.8 }); mono(40, 398, 'RDS 생성 → 값이 채워진 뒤 Cloud Run 시작', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2) }); } }

  // ---------- 3. apply / interpolate / all ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { snippet(30, 20, ['"postgres://" + db.endpoint'], { fs: 15, w: 330 });
      grow(370, 40, 420, 40, E(u, 0.3, 0.6), BAD); card(680, 40, 500, 40, { rx: 8, stroke: BAD, fill: BADBG, s: pop(u, 0.6) });
      mono(440, 46, 'postgres://Calling [toString] on an [Output<T>]…', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.7) });
      sub(680, 86, '주소 대신 경고 문장이 붙는다 · 실제로 돌려 본 결과', fade(u, 0.9), { fill: BAD, 'font-weight': 700 });
      outBox(150, 230, 220, 'db.endpoint', EP.slice(0, 14) + '…', E(u, 1.2, 1.5));
      card(420, 230, 220, 60, { rx: 10, stroke: INFO, sw: 2.5, text: '.apply(ep =>\n ep.split(":")[0])', fs: 13.5, mono: true, s: pop(u, 1.3) }); grow(262, 230, 308, 230, E(u, 1.5, 1.8), INFO); grow(532, 230, 568, 230, E(u, 1.8, 2.1), INFO);
      outBox(760, 230, 370, 'hostOnly', HOST, E(u, 2.0, 2.4), { fs: 13.5 }); sub(760, 280, '포트 :5432를 뗀 host', fade(u, 2.3)); return; }
    if (k === 1) { mono(480, 50, 'pulumi.interpolate`postgres://app:${dbPassword}@${db.endpoint}/appdb`', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.1) });
      outBox(240, 150, 200, 'dbPassword', '***', 0.6, { secret: true, s: pop(u, 0.4) }); outBox(720, 150, 260, 'db.endpoint', 'app-db.abc123…:5432', E(u, 0.6, 1.0), { s: pop(u, 0.5) });
      grow(240, 172, 450, 262, E(u, 1.0, 1.5), INFO); grow(720, 172, 510, 262, E(u, 1.0, 1.5), INFO);
      outBox(480, 290, 520, 'dbUrl', 'postgres://app:***@app-db.abc123…:5432/appdb', E(u, 1.6, 2.0), { secret: true });
      sub(480, 350, 'secret을 넣어 만든 값도 secret이 된다 (isSecret = true로 확인)', fade(u, 2.1), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 2) { outBox(200, 100, 280, 'db.endpoint', 'app-db.abc123…:5432', 1, { s: pop(u, 0.2) }); outBox(200, 200, 280, 'db.dbName', '"appdb"', 1, { s: pop(u, 0.4) });
      card(480, 150, 200, 60, { rx: 10, stroke: INFO, sw: 2.5, text: 'pulumi.all([…])\n.apply', fs: 14, mono: true, s: pop(u, 0.8) });
      grow(342, 100, 378, 140, E(u, 1.0, 1.3), INFO); grow(342, 200, 378, 162, E(u, 1.0, 1.3), INFO); grow(582, 150, 620, 150, E(u, 1.4, 1.7), INFO);
      outBox(790, 150, 320, 'conn', '…amazonaws.com:5432/appdb', E(u, 1.7, 2.1));
      sub(480, 300, '여러 Output을 묶어 한 번에 푼다 · 결과도 Output', fade(u, 2.2), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { res(720, 70, 300, 'Cloud Run', 'api-server', INFO, {});
      [['DATABASE_URL', 'dbUrl', 'interpolate 결과', true], ['DATABASE_HOST', 'hostOnly', 'apply 결과', false]].forEach(([n, v, note, sec], i) => { const y = 170 + i * 100, a = 0.3 + i * 0.6;
        outBox(230, y, 220, v, '', 0, { secret: sec, s: pop(u, a) }); grow(342, y, 560, y, E(u, a + 0.3, a + 0.8), ACC);
        card(720, y, 300, 44, { rx: 8, stroke: INFO, fill: INFOBG, text: n, fs: 15, mono: true, s: pop(u, a + 0.6) }); sub(450, y + 24, note, fade(u, a + 0.6)); });
      sub(480, 400, '가공한 값도 Output 그대로 넣는다', fade(u, 2.0), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    res(130, 210, 200, 'RDS', 'app-db', WARN, {});
    [['apply', 'hostOnly', 130], ['interpolate', 'dbUrl', 290]].forEach(([op, n, y], i) => { const a = 0.2 + i * 0.4;
      grow(232, 210, 330, y, E(u, a, a + 0.4), INFO); card(400, y, 130, 40, { rx: 8, stroke: INFO, text: op, fs: 14, mono: true, s: pop(u, a + 0.3) });
      grow(466, y, 520, y, E(u, a + 0.6, a + 0.9), INFO); outBox(600, y, 150, n, '', 0, { s: pop(u, a + 0.8) }); grow(676, y, 740, 210, E(u, a + 1.0, a + 1.3), ACC); });
    res(840, 210, 190, 'Cloud Run', 'api-server', INFO, { s: pop(u, 1.6) });
    banner(480, 380, '가공을 거쳐도 RDS 다음에 Cloud Run 순서는 그대로', pop(u, 2.0)); }

  // ---------- 4. dependsOn ----------
  const NX = { rds: 105, mig: 355, run: 605, dns: 855 }, NY = 110, NW = 170;
  function edge(a, b, kind, u0, u, o) { o = o || {}; const x1 = NX[a] + NW / 2 + 4, x2 = NX[b] - NW / 2 - 4, y = NY + (o.dy || 0), col = kind === 'explicit' ? WARN : ACC;
    grow(x1, y, x2, y, u0, col, { dash: kind === 'explicit' ? '7 5' : null, sw: 2.5 });
    if (o.label) mono((x1 + x2) / 2, kind === 'explicit' ? NY - 38 : NY + 46, o.label, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
  function s4(t, c) { const { k, u } = c;
    res(NX.rds, NY, NW, 'RDS', 'app-db', WARN, {});
    res(NX.mig, NY, NW, 'cloudrunv2.Job', 'db-migrate', INFO, { s: k === 0 ? pop(u, 0.2) : 1 });
    if (k >= 1) res(NX.run, NY, NW, 'Cloud Run', 'api-server', INFO, { s: k === 1 ? pop(u, 0.2) : 1 });
    if (k >= 3) res(NX.dns, NY, NW, 'cloudflare.Record', 'api-dns', GOOD, { s: k === 3 ? pop(u, 0.2) : 1 });
    edge('rds', 'mig', 'implicit', k === 0 ? E(u, 0.5, 1.1) : 1, u, { label: 'db.endpoint', op: k === 0 ? fade(u, 1.0) : 1 });
    if (k >= 1) { grow(NX.rds, NY + 26, NX.rds, NY + 72, 1, ACC, { plain: true, sw: 2.5 }); grow(NX.rds, NY + 72, NX.run, NY + 72, k === 1 ? E(u, 0.4, 1.0) : 1, ACC, { plain: true, sw: 2.5 }); grow(NX.run, NY + 72, NX.run, NY + 28, k === 1 ? E(u, 0.9, 1.1) : 1, ACC, { sw: 2.5 });
      mono(355, NY + 92, 'dbUrl', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' }); }
    if (k === 0) { sub(480, 260, '값을 참조하니 Job은 RDS 다음 · 여기까지는 암묵적', fade(u, 1.4), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    // 시간 줄: Job 과 Run 이 RDS 다음 같이 시작하는지
    const ordered = k >= 2, T = k === 1 || k === 2 ? lerp(0, 230, E(u, 0.3, 2.3)) : 230;
    const rows = [{ n: 'app-db', s: 0, e: 182, col: WARN }, { n: 'db-migrate', s: 182, e: 206, col: INFO }, { n: 'api-server', s: ordered ? 206 : 182, e: ordered ? 224 : 200, col: INFO }];
    if (k >= 3) rows.push({ n: 'api-dns', s: 224, e: 227, col: GOOD });
    gantt(160, 220, 740, rows, 230, T, { ticks: [0, 182, 230], rh: 32 });
    if (k === 1) { if (T > 190) cross(NX.mig + 120, NY + 104, 10, pop(u, 1.8)); pill(480, 40, 'Job과 Cloud Run 사이엔 참조가 없다', BAD, pop(u, 0.6), { fs: 14 }); return; }
    if (k >= 2) edge('mig', 'run', 'explicit', k === 2 ? E(u, 0.3, 0.9) : 1, u, { label: 'dependsOn', dy: -10, op: k === 2 ? fade(u, 0.8) : 1 });
    if (k === 2) { pill(480, 40, 'Job 리소스가 만들어질 때까지만 기다린다 · 실행 완료는 아님', WARN, pop(u, 1.2), { fs: 13.5 }); return; }
    edge('run', 'dns', 'implicit', k === 3 ? E(u, 0.5, 1.1) : 1, u, { label: 'statuses[0].url', op: k === 3 ? fade(u, 1.0) : 1 });
    if (k === 3) { pill(480, 40, 'CNAME 값 = Cloud Run URL에서 https://를 뗀 것', ACC, pop(u, 1.2), { fs: 13.5 }); return; }
    edge('run', 'dns', 'explicit', E(u, 0.4, 1.0), u, { label: 'dependsOn: [api]', dy: -10, op: fade(u, 0.9) });
    pill(480, 40, '순서는 이미 같다 · 앱이 뜬 뒤에 DNS를 켠다는 뜻을 적어 둔다', WARN, pop(u, 1.3), { fs: 13.5 }); }

  // ---------- 5. DAG 로 순서가 나온다 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const rows = [['pulumi:pulumi:Stack', 'cross-prod', MUT], ['aws:rds:Instance', 'app-db', WARN], ['gcp:cloudrunv2:Job', 'db-migrate', INFO], ['gcp:cloudrun:Service', 'api-server', INFO], ['cloudflare:Record', 'api-dns', GOOD]];
      mono(60, 50, '$ pulumi up   (출력은 예시)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      rows.forEach(([ty, n, col], i) => { const y = 100 + i * 40, op = fade(u, 0.3 + i * 0.25); el('rect', { x: 60, y: y - 18, width: 5, height: 24, rx: 2, fill: col, opacity: op });
        mono(80, y, '+', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: op }); mono(104, y, ty, { 'font-size': 15, fill: MUT, opacity: op }); mono(420, y, n, { 'font-size': 15, 'font-weight': 700, opacity: op }); });
      mono(60, 340, 'Resources: + 5 to create', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); sub(720, 340, 'Stack 1 + 리소스 4', fade(u, 2.0), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const N = [['app-db', WARN], ['db-migrate', INFO], ['api-server', INFO], ['api-dns', GOOD]];
      N.forEach(([n, col], i) => { const x = 120 + i * 240; mono(x, 70, '층 ' + i, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.3) }); card(x, 160, 180, 50, { rx: 10, stroke: col, text: n, fs: 15, mono: true, color: col, s: pop(u, 0.2 + i * 0.3) }); });
      [['①', 'implicit', 'db.endpoint'], ['②', 'explicit', 'dependsOn'], ['③', 'implicit', 'url 참조']].forEach(([m, kind, l], i) => { const x1 = 210 + i * 240, x2 = 270 + i * 240, a = 1.0 + i * 0.3;
        grow(x1, 160, x2, 160, E(u, a, a + 0.3), kind === 'explicit' ? WARN : ACC, { dash: kind === 'explicit' ? '6 4' : null, sw: 2.5 }); tx(240 + i * 240, 140, m, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, a + 0.2) });
        sub(240 + i * 240, 214, l, fade(u, a + 0.3), { class: 'mono' }); });
      sub(480, 300, '참조와 dependsOn을 모아 그래프 하나 · 위상 정렬로 층이 나온다', fade(u, 2.2), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { gantt(170, 50, 720, [{ n: 'app-db', s: 0, e: 182, col: WARN }, { n: 'db-migrate', s: 182, e: 206, col: INFO }, { n: 'api-server', s: 206, e: 224, col: INFO }, { n: 'api-dns', s: 224, e: 227, col: GOOD }], 230, lerp(0, 230, E(u, 0.2, 2.3)), { ticks: [0, 182, 206, 227] });
      mono(480, 270, '182 + 24 + 18 + 3 = 227초', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(480, 300, '체인은 앞이 끝나야 뒤가 시작한다 · 로그의 Duration 3m52s에는 준비 시간도 들어 있다', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 3) { gantt(170, 60, 720, [{ n: 'other-db', s: 0, e: 170, col: WARN }, { n: 'assets', s: 0, e: 4, col: INFO }], 180, lerp(0, 180, E(u, 0.2, 2.2)), { ticks: [0, 170] });
      tx(480, 220, '간선이 없으면 같은 시각에 함께 시작', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.4) });
      mono(480, 260, '총 시간 170초 · 174초가 아니다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { zone(120, 60, 720, 220, 'Outputs', { fill: PANEL, stroke: INK, color: INK });
      [['apiUrl', '"https://api.example.com"'], ['dbHost', '"' + HOST + '"']].forEach(([n, v], i) => { const y = 130 + i * 80;
        mono(150, y + 5, n, { 'font-size': 15, 'font-weight': 700 }); outBox(540, y, 520, '', v, E(u, 0.6 + i * 0.5, 1.0 + i * 0.5)); });
      sub(480, 330, '미래 값이던 것이 실제 문자열로 채워졌다 · 값은 예시', fade(u, 2.0), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    tx(480, 50, '$ pulumi destroy · 그래프의 역순', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono' });
    [['api-dns', GOOD], ['api-server', INFO], ['db-migrate', INFO], ['app-db', WARN]].forEach(([n, col], i) => { const x = 140 + i * 230, gone = u > 0.4 + i * 0.5;
      card(x, 180, 190, 50, { rx: 10, stroke: gone ? OFF : col, text: n, fs: 15, mono: true, color: gone ? OFF : col });
      if (gone) el('line', { x1: x - 85, y1: 180, x2: x + 85, y2: 180, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.4 + i * 0.5, 0.3) });
      mono(x, 240, String(i + 1), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: gone ? BAD : MUT });
      if (i < 3) grow(x + 98, 180, x + 132, 180, E(u, 0.6 + i * 0.5, 0.8 + i * 0.5), MUT); });
    sub(480, 320, '순서는 우리가 짠 게 아니라 그래프에서 나왔다', fade(u, 2.3), { 'font-size': 16, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'RDS의 endpoint가 Output<string> 인 이유는 무엇인가?',
      o: ['문자열보다 메모리를 덜 써서', 'pulumi up으로 RDS가 만들어져야 주소가 생기는 미래 값이라서', 'AWS가 주소를 암호화해서'], a: 1,
      why: '주소는 배포 전에는 존재하지 않는다. Output은 그 미래 값을 담고, 다른 리소스 입력에 넣으면 의존도 함께 만든다.' },
    { q: 'Cloud Run envs에 value: db.endpoint를 넣으면 무엇이 생기나?',
      o: ['RDS 다음에 Cloud Run을 만드는 암묵적 의존', 'Cloud Run이 RDS를 새로 만드는 동작', '아무 관계도 생기지 않는다'], a: 0,
      why: '출력을 입력에 참조하는 것만으로 엔진은 순서를 안다. 별도 선언 없이 RDS가 먼저, Cloud Run이 나중이 된다.' },
    { q: '"postgres://" + db.endpoint를 실제로 돌리면 어떤 문자열이 나오나?',
      o: ['postgres:// 뒤에 RDS 주소', '빈 문자열', 'postgres:// 뒤에 Calling [toString] on an [Output<T>] 경고 문장'], a: 2,
      why: 'Output은 문자열 덧셈 때 값이 아니라 경고 문장을 돌려준다. 그래서 apply나 pulumi.interpolate로 조립한다.' },
    { q: 'dependsOn: [migration]이 기다리는 것은 무엇인가?',
      o: ['Job 리소스가 만들어지는 것', 'Job이 마이그레이션 실행을 끝내는 것', 'RDS의 백업이 끝나는 것'], a: 0,
      why: 'dependsOn은 리소스 생성 순서만 건다. Job을 실제로 돌려 마이그레이션을 끝내는 일은 따로 해야 한다.' },
    { q: '의존이 없는 other-db(170초)와 assets(4초)를 함께 만들면 둘 몫의 시간은 얼마인가?',
      o: ['174초', '170초', '4초'], a: 1,
      why: '간선이 없는 리소스는 같은 시각에 시작해 병렬로 만들어진다. 그래서 합이 아니라 더 긴 170초가 걸린다.' },
  ];
  const summary = [
    'RDS 주소는 up 전에는 없으므로 Pulumi는 그것을 Output이라는 미래 값으로 다룬다.',
    'Output을 다른 cloud 리소스 입력에 넣기만 하면 암묵적 의존이 생겨 RDS 다음에 Cloud Run이 만들어진다.',
    'Output은 + 로 붙이면 경고 문장이 되므로 apply·interpolate·all로 가공하고, 결과도 Output이다.',
    '값 참조 없이 순서만 필요하면 dependsOn을 쓰고, 엔진은 그래프를 위상 정렬해 순서와 병렬을 정한다.',
  ];
  const review = [
    { q: 'Cloud Run이 DB 스키마가 없다며 에러를 냈다. dependsOn: [migration]은 이미 걸려 있다. 먼저 의심할 것은?',
      o: ['Job 리소스만 만들어지고 실행은 되지 않았다', 'RDS의 endpoint가 Output이 아니다', 'Cloudflare 레코드가 너무 일찍 만들어졌다'], a: 0,
      why: 'dependsOn은 Job 리소스 생성까지만 기다린다. 마이그레이션을 실제로 돌리는 단계가 없으면 스키마는 비어 있다.' },
    { q: 'dbUrl을 stack 출력으로 내보냈더니 화면에 [secret]으로 가려졌다. 이유는?',
      o: ['Cloud Run이 값을 숨겼다', 'RDS 주소는 언제나 secret이다', 'interpolate에 secret인 dbPassword를 넣어 결과도 secret이 되었다'], a: 2,
      why: 'secret Output을 섞어 만든 값은 secret이 이어진다. 비밀번호가 평문으로 새지 않게 하려는 동작이다.' },
    { q: '배포가 227초 걸렸다. 네 리소스가 한 줄로 이어진 그래프에서 시간을 줄일 방법으로 맞는 것은?',
      o: ['provider를 하나로 합친다', '꼭 필요 없는 dependsOn을 빼 체인을 짧게 만든다', 'Output 대신 문자열을 하드코딩한다'], a: 1,
      why: '체인은 앞이 끝나야 뒤가 시작해 시간이 더해진다. 불필요한 간선을 빼면 병렬로 돌 수 있는 리소스가 늘어난다.' },
  ];

  R.page({ title: 'cross-provider 의존', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
