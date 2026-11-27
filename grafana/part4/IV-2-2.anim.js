/* IV-2-2 Dashboard provisioning — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 파일 목록(files: name·uid·status), 폴더(folders: name·boards), 커밋(gitCommit)은 페이지 STEPS 의 beat 데이터를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, clock, server, dbIcon, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 지역 도우미 ──
  function code(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 11;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    lines.forEach((s, i) => { const yy = y + 9 + i * lh;
      if (o.hl && o.hl.includes(i)) el('rect', { x: x + 5, y: yy + 1, width: w - 10, height: lh - 2, rx: 5, fill: o.hlc || ACCBG });
      spans(x + 14, yy + lh / 2 + fs * 0.36, tokens(s), { 'font-size': fs, opacity: o.rowOp ? o.rowOp(i) : 1 }); });
    return (i) => y + 9 + i * lh + lh / 2; }
  function fileCard(cx, cy, name, sub2, o) { o = o || {}; const w = o.w || 190, h = o.h || 58, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash }, g);
    mono(-w / 2 + 12, sub2 ? -3 : 5, name, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || INK }, g);
    if (sub2) mono(-w / 2 + 12, 17, sub2, { 'font-size': 13.5, fill: MUT }, g); return g; }
  // Grafana 폴더 트리 (beat.folders). 새 폴더·보드는 튀어나온다
  function folders(x, y, w, c, o) { o = o || {}; const list = c.beat.folders || [], prev = (c.prev && c.prev.folders) || [];
    el('rect', { x, y, width: w, height: o.h || 300, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 });
    el('rect', { x, y, width: w, height: 34, rx: 10, fill: INK }); el('rect', { x, y: y + 24, width: w, height: 10, fill: INK });
    tx(x + 14, y + 23, 'Grafana › Dashboards', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL });
    if (!list.length) sub(x + w / 2, y + 110, o.empty || '보드 없음', 1, { 'font-size': 14.5 });
    let yy = y + 50; list.forEach((f) => { const pf = prev.find((q) => q.name === f.name), s = pf ? 1 : pop(c.u, 0.3 + (o.delay || 0));
      const g = R.G(x + 20, yy, s); el('path', { d: 'M0,0 h14 l5,5 h19 v20 h-38 z', fill: WARNBG, stroke: WARN, 'stroke-width': 1.8 }, g);
      tx(48, 19, f.name, { 'font-size': 15, 'font-weight': 800 }, g); yy += 34;
      f.boards.forEach((bd) => { const nb = !pf || !pf.boards.includes(bd), s2 = nb ? pop(c.u, 0.6 + (o.delay || 0)) : 1, lockd = bd.includes('🔒') || o.lockAll, name = bd.replace(' 🔒', '').replace(' · PR only', '');
        const g2 = R.G(x + 46, yy, s2); el('rect', { x: 0, y: 0, width: w - 66, height: 28, rx: 6, fill: SOFT, stroke: lockd ? INK : 'none', 'stroke-width': 1.4 }, g2);
        tx(10, 19, name, { 'font-size': 14 }, g2); if (lockd) lock(x + w - 38, yy + 15, true, INK, 0.6 * s2); yy += 34; }); yy += 4; }); }
  // 디스크 쪽 파일 목록 (beat.files)
  function disk(x, y, w, c, o) { o = o || {}; const list = c.beat.files || [], prev = (c.prev && c.prev.files) || [];
    zone(x, y, w, o.h || 200, o.title || 'options.path', { stroke: o.stroke || INK });
    list.forEach((f, i) => { const pf = prev.find((q) => q.name === f.name), s = pf ? 1 : pop(c.u, 0.3), col = f.status === 'new' ? ACC : f.status === 'locked' ? INK : GOOD;
      const g = R.G(x + 16, y + 40 + i * 44, s); el('rect', { x: 0, y: 0, width: w - 32, height: 36, rx: 6, fill: f.status === 'new' ? ACCBG : SOFT, stroke: col, 'stroke-width': 1.6 }, g);
      mono(10, 23, f.name, { 'font-size': 13.5, 'font-weight': 700 }, g); }); }

  // 1. provider 정의
  const PROV = ['apiVersion: 1', 'providers:', '  - name: platform-dashboards', '    orgId: 1', '    type: file', '    folder: Platform', '    folderUid: platform', '    options:', '      path: /etc/grafana/dashboards/platform', '    updateIntervalSeconds: 30'];
  function s1(t, c) { const { k, u } = c;
    const when = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4], hl = [[0], [2, 3, 4], [5, 6], [7, 8], [9], []][k];
    code(30, 46, 470, PROV, { fs: 14, lh: 27, hl, rowOp: (i) => (when[i] < k || k === 5 ? 1 : when[i] === k ? fade(u, 0.2 + (i % 3) * 0.25) : 0.12) });
    const RX = 530;
    if (k === 0) { fileCard(640, 110, 'default.yaml', 'provisioning/dashboards/', { w: 220 }); grow(752, 110, 820, 170, E(u, 0.5, 1.1), ACC); server(860, 210, 'Grafana 부팅', { lamp: E(u, 1.1, 1.3) > 0.5 ? GOOD : OFF });
      sub(700, 340, '부팅할 때 읽는다 — 볼륨으로 미리 넣어 둔다', fade(u, 1.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { card(725, 150, 330, 120, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 0.3) });
      [['name', 'platform-dashboards'], ['orgId', '1'], ['type', 'file']].forEach(([a, v], i) => { mono(580, 120 + i * 30, a, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.3) }); mono(660, 120 + i * 30, v, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.3) }); });
      sub(725, 250, 'type: file = 디렉터리를 스캔하는 provider', fade(u, 1.5), { fill: INK, 'font-size': 14 }); return; }
    if (k === 2) { const g = R.G(600, 110, pop(u, 0.3)); el('path', { d: 'M0,0 h40 l12,12 h60 v60 h-112 z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.4 }, g);
      const rn = E(u, 1.4, 2.0); tx(740, 135, 'Platform', { 'font-size': 18, 'font-weight': 800, fill: rn > 0.4 ? MUT : INK, 'text-decoration': rn > 0.4 ? 'line-through' : null, opacity: fade(u, 0.5) });
      tx(740, 162, '→ Platform Team (예시)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: rn }); mono(740, 200, 'folderUid: platform', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
      sub(725, 270, '이름이 바뀌어도 uid가 같으면 같은 폴더', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { const T = [['/etc/grafana/dashboards/platform/', INK, 700], ['  service-health.json', ACC, 700], ['  latency-slo.json', ACC, 700], ['  README.md', MUT, 400]];
      T.forEach(([s, col, fw], i) => mono(RX + 10, 110 + i * 40, s, { 'font-size': 15, fill: col, 'font-weight': fw, opacity: fade(u, 0.3 + i * 0.3) }));
      check(RX + 270, 145, 9, pop(u, 1.2)); check(RX + 250, 185, 9, pop(u, 1.4)); cross(RX + 150, 225, 8, pop(u, 1.6));
      sub(725, 300, '*.json만 대시보드가 된다', fade(u, 1.8), { fill: INK, 'font-size': 15, 'font-weight': 700 }); return; }
    if (k === 4) { clock(640, 150, 48, (u % 1.5) / 1.5, ACC, '30초마다 다시 읽기');
      card(810, 120, 200, 48, { rx: 10, text: '> 10 → 그 주기로 폴링', fs: 14, stroke: ACC, s: pop(u, 0.8) }); card(810, 190, 200, 48, { rx: 10, text: '≤ 10 → 파일 변경 감시', fs: 14, stroke: INFO, s: pop(u, 1.2) });
      sub(725, 300, '파일을 고친 뒤 화면에 닿기까지의 지연', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); return; }
    // k5 두 마운트
    zone(RX, 50, 390, 300, 'grafana 컨테이너', { stroke: INK });
    [['/etc/grafana/provisioning/dashboards', 'provider yaml', 110], ['/etc/grafana/dashboards/platform', '대시보드 json', 220]].forEach(([p, d, y], i) => {
      el('rect', { x: RX + 16, y, width: 358, height: 54, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8, opacity: fade(u, 0.3 + i * 0.5) });
      mono(RX + 28, y + 23, p, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3 + i * 0.5) }); tx(RX + 28, y + 44, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.5) }); });
    sub(RX + 195, 330, '하나라도 빠지면 아무 보드도 안 뜬다', fade(u, 1.5), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); }

  // 2. 파일 자동 로드
  const DJ = ['{', '  "uid": "service-health",', '  "title": "Service Health",', '  "tags": ["platform", "prod"],', '  "time": { "from": "now-1h" },', '  "refresh": "30s",', '  "panels": [{ "gridPos": { "w": 24, "h": 8 },', '    "datasource": { "uid": "prom" },', '    "targets": [{ "refId": "A", "expr": "…" }] }]', '}'];
  function s2(t, c) { const { k, u } = c;
    const hl = [[1], [3, 4, 5], [6, 7], [8], [], []][k];
    if (k <= 3) { code(30, 46, 480, DJ, { fs: 13.5, lh: 27, hl, rowOp: (i) => ([0, 0, 1, 1, 1, 1, 2, 2, 3, 0][i] <= k ? 1 : 0.15) });
      const BX = 540, BY = 50, BW = 380;
      el('rect', { x: BX, y: BY, width: BW, height: 300, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 }); el('rect', { x: BX, y: BY, width: BW, height: 34, rx: 10, fill: INK }); el('rect', { x: BX, y: BY + 24, width: BW, height: 10, fill: INK });
      tx(BX + 14, BY + 23, k >= 0 ? 'Service Health' : '', { 'font-size': 15, 'font-weight': 700, fill: PANEL });
      mono(BX + 14, BY + 60, '/d/service-health', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.6) : 1 });
      if (k === 0) sub(BX + BW / 2, BY + 150, 'uid가 URL이 된다 — 환경이 달라도 같은 주소', fade(u, 1.2), { fill: INK, 'font-size': 14 });
      if (k >= 1) ['platform', 'prod', 'now-1h', '30s'].forEach((s, i) => pill(BX + 50 + i * 86, BY + 92, s, i < 2 ? INFO : MUT, k === 1 ? pop(u, 0.3 + i * 0.2) : 1, { fs: 13.5, mono: true }));
      if (k >= 2) { const pw = (k === 2 ? E(u, 0.3, 1.3) : 1) * (BW - 32); el('rect', { x: BX + 16, y: BY + 120, width: pw, height: 140, rx: 7, fill: PANEL, stroke: k === 2 ? ACC : GRID, 'stroke-width': 2 });
        tx(BX + 26, BY + 142, 'p99 Latency', { 'font-size': 14, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.0) : 1 });
        if (k === 2) mono(BX + BW - 26, BY + 142, 'w 24 · h 8', { 'font-size': 14, 'text-anchor': 'end', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
        mono(BX + 26, BY + 248, 'datasource uid: prom', { 'font-size': 13.5, fill: MUT, opacity: k === 2 ? fade(u, 1.4) : 1 }); }
      if (k === 3) { const ys = [0.7, 0.55, 0.62, 0.4, 0.48, 0.3, 0.36], n = Math.max(2, Math.ceil(ys.length * E(u, 0.5, 2.2)));
        el('polyline', { points: ys.slice(0, n).map((v, i) => `${BX + 40 + i * 50},${BY + 150 + v * 80}`).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 2.6 });
        mono(BX + 14, BY + 290, 'refId A · expr = PromQL', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.3) }); }
      return; }
    // k4·k5 스캔 순환: 디스크 → provider → 폴더
    disk(30, 50, 300, c, { h: 150 });
    const st = [['이 파일로 만든 보드?', INFO], ['없으면 생성', ACC], ['folder 아래 배치', GOOD]];
    st.forEach(([s, col], i) => card(480, 90 + i * 66, 210, 46, { rx: 23, text: s, fs: 14.5, stroke: col, sw: 2, s: k === 4 ? pop(u, 0.3 + i * 0.4) : 1 }));
    dot([[330, 90], [375, 90], [375, 222], [585, 222], [630, 160]], ((t * 0.4) % 1), ACC, 7);
    folders(640, 50, 290, c, { h: 220 });
    if (k === 5) { zone(30, 290, 900, 120, 'uid를 빼먹으면 (예시)', { stroke: BAD });
      [['staging', '/d/a81xk2', 230], ['prod', '/d/q93mf0', 600]].forEach(([n, url, x], i) => { tx(x - 160, 345, n, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.8 + i * 0.3) }); mono(x - 60, 345, url, { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.3) }); });
      sub(480, 390, '같은 파일인데 환경마다 주소가 달라 링크가 깨진다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); }
    else sub(480, 330, '매 주기 이 세 단계를 되풀이한다', fade(u, 1.6), { fill: INK, 'font-size': 15 }); }

  // 3. GitOps
  function s3(t, c) { const { k, u } = c, b = c.beat;
    // 위: 파이프라인 레일
    const N = [['Git', 110], ['git-sync', 270], ['options.path', 440], ['provider', 600]];
    N.forEach(([s, x], i) => { const on = (k >= 1 && i <= 2) || k === 0 && i === 3 || k >= 2; card(x, 66, 140, 40, { rx: 20, text: s, fs: 14.5, mono: true, stroke: on ? ACC : GRID, color: on ? ACC : MUT, sw: 2 }); if (i) grow(N[i - 1][1] + 72, 66, x - 72, 66, 1, on ? ACC : GRID); });
    if (k >= 1) dot([[110, 66], [600, 66]], ((t * 0.35) % 1), ACC, 6);
    mono(30, 120, b.gitCommit || '', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
    if (k === 0) { code(30, 140, 440, ['- name: gitops-dashboards', '  disableDeletion: false', '  updateIntervalSeconds: 20'], { fs: 15, lh: 32, hl: [1] });
      fileCard(620, 200, 'old.json', '파일 삭제', { w: 170, stroke: BAD, dash: '6 5', op: 1 - E(u, 1.0, 1.8) * 0.6 }); grow(708, 200, 770, 200, E(u, 1.2, 1.6), BAD);
      card(850, 200, 140, 44, { rx: 8, text: '보드도 삭제', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 1.6) }); sub(480, 320, 'Git에 있는 것만 Grafana에 남는다', fade(u, 2.0), { fill: INK, 'font-size': 15 }); return; }
    disk(30, 140, 330, c, { h: 190, title: '/etc/grafana/dashboards/git' });
    if (k === 2) card(480, 200, 200, 70, { rx: 10, text: 'foldersFromFilesStructure\n: true', fs: 14, mono: true, stroke: ACC, sw: 2.2, s: pop(u, 0.2) });
    if (k === 3) { card(480, 200, 210, 90, { rx: 10, stroke: INFO, sw: 2.2, s: pop(u, 0.2) }); mono(395, 186, 'PR #142', { 'font-size': 16, 'font-weight': 800, fill: INFO }); tx(395, 214, '리뷰 → main 머지', { 'font-size': 14.5, opacity: fade(u, 0.6) }); }
    if (k === 4) { clock(480, 200, 36, E(u, 0.4, 2.4), ACC, 'git-sync + 20초'); }
    if (k === 5) { el('line', { x1: 380, y1: 300, x2: 580, y2: 300, stroke: MUT, 'stroke-width': 3 }); [400, 470, 540].forEach((x, i) => el('circle', { cx: x, cy: 300, r: 8, fill: i === 2 ? WARN : ACC }));
      mono(540, 280, 'git revert', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) }); el('path', { d: 'M540,316 C520,350 450,350 420,318', fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.3) });
      sub(480, 380, 'revert 한 번이면 다음 스캔에 이전 보드로 돌아간다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); }
    folders(620, 110, 310, c, { h: 240, empty: '폴더 없음' });
    if (k === 2) sub(775, 380, '디렉터리 이름이 그대로 폴더 이름', fade(u, 1.2), { fill: ACC, 'font-weight': 700, 'font-size': 14.5 }); }

  // 4. allowUiUpdates 충돌
  function uiBoard(x, y, o) { o = o || {}; el('rect', { x, y, width: 400, height: 230, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 }); el('rect', { x, y, width: 400, height: 34, rx: 10, fill: INK }); el('rect', { x, y: y + 24, width: 400, height: 10, fill: INK });
    tx(x + 14, y + 23, 'Platform › Service Health', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL });
    el('rect', { x: x + 16, y: y + 50, width: 368, height: 120, rx: 7, fill: o.edited ? WARNBG : SOFT, stroke: o.edited ? WARN : 'none', 'stroke-width': 2 });
    tx(x + 28, y + 74, o.edited ? 'p99 Latency (UI에서 고침)' : 'p99 Latency', { 'font-size': 14, 'font-weight': 700, fill: o.edited ? WARN : INK });
    card(x + 340, y + 200, 80, 34, { rx: 8, text: 'Save', fs: 15, stroke: INK, sw: 2 }); }
  function s4(t, c) { const { k, u } = c;
    const Y = ['- name: platform-dashboards', '  disableDeletion: true', '  allowUiUpdates: false', '  updateIntervalSeconds: 30'];
    if (k <= 2) { code(30, 50, 400, Y, { fs: 15, lh: 32, hl: [[0], [1], [2]][k], rowOp: (i) => (i <= k + (k ? 1 : 0) ? 1 : 0.15) });
      if (k === 0) { uiBoard(500, 50, {}); lock(874, 71, true, PANEL, 0.7 * pop(u, 0.6)); sub(700, 330, '적지 않아도 allowUiUpdates 기본값은 false', fade(u, 1.0), { fill: INK, 'font-size': 14.5 }); }
      if (k === 1) { fileCard(560, 130, 'service-health.json', '파일 삭제', { w: 230, stroke: BAD, dash: '6 5', op: 1 - E(u, 0.4, 1.2) * 0.6 }); cross(560, 130, 16, pop(u, 1.0));
        dbIcon(820, 140, 'grafana.db', {}); card(820, 250, 190, 40, { rx: 8, text: 'Service Health 남음', fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 1.5) });
        sub(690, 340, 'true: 파일이 사라져도 보드는 DB에 남는다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); sub(230, 260, '기본값 false면 함께 지워진다', fade(u, 2.1), { fill: MUT, 'font-size': 14 }); }
      if (k === 2) { uiBoard(500, 50, { edited: true }); el('circle', { cx: lerp(700, 840, E(u, 0.1, 0.6)), cy: lerp(160, 250, E(u, 0.1, 0.6)), r: 7, fill: ACC, opacity: 1 - fade(u, 0.8) });
        card(560, 330, 420, 100, { rx: 12, stroke: BAD, sw: 2.6, s: pop(u, 0.8) }); tx(560, 314, 'Cannot save provisioned dashboard', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
        tx(560, 344, 'JSON을 복사해 provisioning 파일에 반영하라', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); }
      return; }
    if (k === 3 || k === 5) { const P = [['UI에서 고쳐 보기', 140], ['JSON 복사', 330], ['PR · 리뷰', 520], ['파일 머지', 710], ['재스캔', 880]];
      P.forEach(([s, x], i) => { card(x, 160, i === 4 ? 120 : 160, 52, { rx: 26, text: s, fs: 14.5, stroke: i === 3 ? ACC : INK, color: i === 3 ? ACC : INK, sw: 2, s: k === 3 ? pop(u, 0.2 + i * 0.3) : 1 }); if (i) grow(P[i - 1][1] + (i === 4 ? 82 : 82), 160, x - (i === 4 ? 62 : 82), 160, k === 3 ? E(u, 0.4 + i * 0.3, 0.7 + i * 0.3) : 1, ACC); });
      if (k === 3) { banner(480, 260, '변경 통로는 PR 하나', pop(u, 1.8)); sub(480, 320, '급한 hotfix도 파일을 고쳐 배포해야 한다', fade(u, 2.1), { fill: WARN, 'font-weight': 700, 'font-size': 15 }); }
      else { lock(480, 270, true, ACC, pop(u, 0.4)); banner(480, 340, '진실은 파일 하나 — allowUiUpdates: false', pop(u, 0.8)); }
      return; }
    // k4 true 를 고르면
    zone(40, 60, 400, 250, 'Git 파일', { stroke: INK }); mono(60, 130, '"title": "p99 Latency"', { 'font-size': 15 }); mono(60, 165, '(UI 수정 없음)', { 'font-size': 14, fill: MUT });
    zone(520, 60, 400, 250, 'Grafana DB', { stroke: WARN }); mono(540, 130, '"title": "p99 Latency (UI)"', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.4) });
    tx(480, 190, '≠', { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) }); sub(480, 230, '진실이 둘', fade(u, 1.0), { fill: BAD, 'font-weight': 700, 'font-size': 15 });
    fly(240, 260, 720, 260, seg(u, 1.6, 2.5), '파일이 바뀌면 덮어쓴다', { fill: INK });
    sub(480, 360, '실험·임시 보드에만 true를 쓴다', fade(u, 2.3), { fill: INK, 'font-size': 15 }); }

  // 5. dashboard as code 종합
  function s5(t, c) { const { k, u } = c, b = c.beat;
    zone(30, 46, 420, 360, 'docker-compose · grafana:11.2.0', { stroke: INK });
    const V = [['./provisioning → /etc/grafana/provisioning', 'provider yaml', 1], ['./dashboards → /etc/grafana/dashboards', 'Git의 json', 2]];
    V.forEach(([a, d, kk], i) => { const on = k >= kk, op = k === kk ? fade(u, 0.3) : on ? 1 : 0.2, y = 80 + i * 70;
      el('rect', { x: 46, y, width: 388, height: 56, rx: 8, fill: on ? ACCBG : SOFT, stroke: on ? ACC : GRID, 'stroke-dasharray': on ? null : '6 5', opacity: op });
      mono(58, y + 24, a, { 'font-size': 13.5, 'font-weight': 700, fill: on ? ACC : MUT, opacity: op }); tx(58, y + 45, d, { 'font-size': 13.5, fill: MUT, opacity: op }); });
    if (k >= 3) ['platform/service-health.json', 'payment/checkout.json', 'infra/nodes.json'].forEach((s, i) => mono(60, 250 + i * 28, s, { 'font-size': 14, fill: INK, opacity: k === 3 ? fade(u, 0.3 + i * 0.3) : 1 }));
    if (k === 4) { const st = ['push', 'review', 'merge', '반영', '재스캔']; el('line', { x1: 60, y1: 380, x2: lerp(60, 420, E(u, 0.2, 2.0)), y2: 380, stroke: ACC, 'stroke-width': 3 });
      st.forEach((s, i) => { const x = 60 + i * 90, op = fade(u, 0.2 + i * 0.4); el('circle', { cx: x, cy: 380, r: 7, fill: ACC, opacity: op }); mono(x, 364, s, { 'font-size': 13.5, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle', opacity: op }); }); }
    if (k === 0) sub(240, 280, '아직 아무것도 마운트하지 않았다', fade(u, 0.5), { fill: INK, 'font-size': 14.5 });
    mono(480, 40, b.gitCommit || '', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
    folders(480, 56, 450, c, { lockAll: k === 5, h: 340, empty: k === 0 ? 'provider 없음 · 보드 없음' : '스캔 중 — 폴더 매핑 전' });
    if (k === 1) { clock(705, 260, 26, (u % 1) , ACC, 'scan on'); }
    if (k === 5) banner(705, 360, '리뷰 · 버전 · 재현', pop(u, 1.0)); }

  const quiz = [
    { q: 'provider의 options.path는 무엇을 정하나?',
      o: ['보드가 들어갈 Grafana 폴더 이름', '대시보드 *.json을 찾아 읽을 디렉터리', '파일을 다시 읽는 주기'], a: 1,
      why: 'path 아래의 *.json만 대시보드로 로드된다. 폴더 이름은 folder, 주기는 updateIntervalSeconds가 맡는다.' },
    { q: '대시보드 json에 uid를 적어 두는 가장 큰 이유는 무엇인가?',
      o: ['파일 크기를 줄이려고', 'title을 숨기려고', '어느 환경에서 로드해도 같은 uid·같은 URL을 갖게 하려고'], a: 2,
      why: 'uid가 /d/service-health 같은 URL이 된다. 빼면 환경마다 랜덤 uid가 붙어 링크가 갈라진다.' },
    { q: 'foldersFromFilesStructure: true로 path 아래 payment/checkout.json을 두면 어느 폴더에 들어가나?',
      o: ['payment 폴더', 'provider의 folder 값 폴더', '최상위(General)'], a: 0,
      why: '하위 디렉터리 이름이 그대로 Grafana 폴더 이름이 된다. 이 옵션을 쓸 때는 folder·folderUid를 비운다.' },
    { q: 'allowUiUpdates: false인 provisioned 보드를 UI에서 고치고 Save를 누르면?',
      o: ['저장되고 20초 뒤 되돌아간다', 'Cannot save provisioned dashboard 창이 뜨고 저장되지 않는다', '저장되고 파일도 함께 바뀐다'], a: 1,
      why: 'UI 저장 자체가 막힌다. 바꾸려면 JSON을 복사해 파일을 고치고 PR로 반영한다.' },
    { q: '이 장의 dashboard as code 구성에서 볼륨 두 개가 각각 담는 것은?',
      o: ['provider yaml과 대시보드 json', 'grafana.db와 플러그인', '로그와 메트릭'], a: 0,
      why: './provisioning은 provider 정의를, ./dashboards는 Git에서 받은 json을 담는다. 둘 다 있어야 보드가 뜬다.' },
  ];

  const summary = [
    'provider yaml의 options.path와 updateIntervalSeconds가 어느 경로를 몇 초마다 볼지 정한다.',
    'path 아래 *.json은 파일마다 보드 하나가 되고, 파일 안의 uid가 환경마다 같은 URL을 준다.',
    'Git 머지가 배포가 되고, foldersFromFilesStructure를 켜면 디렉터리 이름이 그대로 폴더가 된다.',
    'allowUiUpdates: false로 두면 UI 저장이 막혀 파일이 유일한 진실로 남는다.',
  ];
  const review = [
    { q: 'payment/refund.json을 Git에 머지했는데 1분이 지나도 Grafana에 안 보인다. 먼저 확인할 것은?',
      o: ['allowUiUpdates가 false인지', 'git-sync가 path로 받아 왔는지와 그 경로가 provider의 options.path인지', 'refund.json의 title 길이'], a: 1,
      why: '머지에서 화면까지는 git-sync 주기와 재스캔 주기를 거친다. 파일이 path에 없으면 provider가 볼 것이 없다.' },
    { q: '실수로 dashboards 디렉터리의 json을 지웠더니 운영 보드가 함께 사라졌다. 이를 막는 설정은?',
      o: ['disableDeletion: true', 'updateIntervalSeconds: 0', 'foldersFromFilesStructure: false'], a: 0,
      why: 'disableDeletion이 true면 파일이 사라져도 보드는 DB에 남는다. 기본값 false면 파일과 함께 지워진다.' },
    { q: '팀이 급한 수정을 UI에서 바로 하고 싶다며 allowUiUpdates: true를 요청했다. 무엇을 알려야 하나?',
      o: ['true면 Save 버튼이 사라진다', 'true면 파일이 자동으로 Git에 커밋된다', 'UI 수정은 DB에만 남아 Git과 어긋나고, 파일이 다음에 바뀌면 덮인다'], a: 2,
      why: 'true는 진실을 둘로 만든다. 그 사이 Git과 보드가 다르고, 다음 파일 변경 때 UI 수정은 사라진다.' },
  ];

  R.page({ title: 'Dashboard provisioning', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
