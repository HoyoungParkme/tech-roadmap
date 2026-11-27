/* III-2-1 cross-region 반복 배포 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, cells, kvTable, person, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 리전: 버지니아는 왼쪽(미주), 서울·도쿄는 오른쪽(아시아)
  const RG = [{ code: 'ap-northeast-2', name: '서울', x: 590 }, { code: 'ap-northeast-1', name: '도쿄', x: 800 }, { code: 'us-east-1', name: '버지니아', x: 200 }];
  function pin(cx, cy, r, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.col || INFO;
    el('path', { d: 'M0,0 C-14,-18 -16,-26 -16,-32 A16,16 0 1 1 16,-32 C16,-26 14,-18 0,0 Z', fill: o.dim ? PANEL : col, stroke: col, 'stroke-width': 2.2 }, g);
    el('circle', { cx: 0, cy: -32, r: 6, fill: PANEL }, g);
    tx(0, 24, r.name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.dim ? MUT : INK }, g);
    mono(0, 44, r.code, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // 지도 띠: 아메리카 · 아시아 두 덩어리
  function band(y, h) { zone(40, y, 330, h, '미주', { fill: SOFT }); zone(450, y, 470, h, '아시아', { fill: SOFT }); }
  function res(cx, cy, w, kind, name, col, o) { o = o || {}; const g = card(cx, cy, w, 42, { rx: 8, stroke: col || INK, sw: 2, fill: o.fill || PANEL, s: o.s, op: o.op, dash: o.dash });
    tx(-w / 2 + 10, 6, kind, { 'font-size': 14, 'font-weight': 800, fill: col || INK }, g); mono(w / 2 - 10, 6, name, { 'font-size': 13.5, 'text-anchor': 'end' }, g); return g; }
  function gantt(x, y, w, rows, tmax, T, o) { o = o || {}; const rh = o.rh || 30, X = (v) => x + (v / tmax) * w;
    el('line', { x1: x, y1: y + rows.length * rh + 4, x2: x + w, y2: y + rows.length * rh + 4, stroke: MUT, 'stroke-width': 1.5 });
    for (let v = 0; v <= tmax; v += o.step || 5) mono(X(v), y + rows.length * rh + 22, v + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    rows.forEach((r, i) => { const yy = y + i * rh;
      mono(x - 10, yy + 19, r.n, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700 });
      el('rect', { x, y: yy + 6, width: w, height: 18, rx: 4, fill: SOFT });
      const e = Math.min(T, r.e); if (e > r.s) el('rect', { x: X(r.s), y: yy + 6, width: X(e) - X(r.s), height: 18, rx: 4, fill: r.col || ACC, opacity: 0.85 });
      if (T >= r.e && r.e > r.s) mono(X(r.e) + 6, yy + 20, (r.e - r.s) + 's', { 'font-size': 13.5, 'font-weight': 700, fill: r.col || ACC }); }); return X; }

  // ---------- 1. 대상 리전 배열 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 3) { // active-active 와 DR
      tx(240, 40, 'active-active', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD }); tx(720, 40, 'DR (failover)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN });
      [90, 240, 390].forEach((x, i) => { pin(x, 170, RG[[2, 0, 1][i]], { col: GOOD, s: pop(u, 0.2 + i * 0.15) }); person(x, 330, null, { s: pop(u, 0.5 + i * 0.15) }); grow(x, 300, x, 236, E(u, 0.9, 1.4), GOOD); });
      sub(240, 400, '세 리전이 모두 받는다 · 가까운 곳이 답한다', fade(u, 1.4), { fill: INK, 'font-weight': 700, 'font-size': 15 });
      const fail = u > 1.6; pin(600, 170, RG[0], { col: fail ? BAD : WARN, s: pop(u, 0.4) }); pin(840, 170, RG[1], { col: WARN, dim: !fail, s: pop(u, 0.6) });
      tx(840, 90, fail ? '넘겨받음' : '대기', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: fail ? WARN : MUT });
      person(720, 330, null, { s: pop(u, 0.8) }); grow(fail ? 740 : 700, 300, fail ? 830 : 610, 236, fail ? 1 : E(u, 1.0, 1.4), fail ? WARN : INK);
      if (fail) cross(600, 128, 14, pop(u, 1.6)); sub(720, 400, '평소엔 한 곳, 장애 나면 다른 리전으로', fade(u, 1.9), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    band(170, 210);
    if (k === 0) snippet(40, 20, ['import * as pulumi from "@pulumi/pulumi";', 'import * as aws from "@pulumi/aws";'], { fs: 15, w: 440 });
    const n = k === 0 ? 0 : k === 1 ? 1 : 3;
    mono(530, 50, 'targetRegions', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    const vals = RG.map((r, i) => (i < n ? r.code : ''));
    cells(530, 64, k === 0 ? ['', '', ''] : vals, { w: 128, h: 40, fs: 13.5, style: (i) => ({ stroke: i < n ? ACC : GRID, dash: i < n ? null : '4 4', s: (k === 1 && i === 0) || (k === 2 && i > 0) ? pop(u, 0.3 + i * 0.3) : 1 }) });
    const cnt = Math.round(tween(c.prev ? (k === 1 ? 0 : k === 2 ? 1 : 3) : 0, n, u)); mono(940, 92, String(cnt), { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    RG.forEach((r, i) => { if (i >= n) return; const drop = (k === 1 && i === 0) || (k === 2 && i > 0) ? E(u, 0.6 + i * 0.3, 1.2 + i * 0.3) : 1;
      pin(r.x, lerp(120, 290, drop), r, { op: drop > 0 ? 1 : 0 }); });
    if (k === 0) sub(480, 300, '아직 대상 리전이 없다', fade(u, 0.8), { 'font-size': 16, fill: MUT, 'font-weight': 700 });
    if (k === 2) sub(480, 405, '리전 추가 = 배열에 한 줄', fade(u, 2.0), { 'font-size': 16, fill: INK, 'font-weight': 700 }); }

  // ---------- 2. provider 인스턴스로 리전 지정 ----------
  const PV = [['seoulProvider', 0], ['tokyoProvider', 1], ['virginiaProvider', 2]];
  function s2(t, c) { const { k, u } = c;
    band(230, 180); RG.forEach((r) => pin(r.x, 330, r, {}));
    PV.forEach(([n, i], j) => { const on = j === 0 || k >= 1; if (!on) return; const s = (k === 0 && j === 0) || (k === 1 && j > 0) ? pop(u, 0.3 + j * 0.35) : 1, x = RG[i].x;
      card(x, 60, 180, 40, { rx: 8, stroke: ACC, sw: 2, text: n, fs: 14, mono: true, color: ACC, s }); grow(x, 82, x, 268, (k === 0 && j === 0) || (k === 1 && j > 0) ? E(u, 0.7 + j * 0.35, 1.2 + j * 0.35) : 1, ACC, { plain: true, dash: '3 4' }); });
    if (k === 0) sub(590, 130, 'region: "ap-northeast-2"', fade(u, 1.0), { class: 'mono', fill: INK, 'font-weight': 700 });
    if (k === 1) sub(480, 140, 'provider 하나 = 리전 하나 · 손으로 세 번 썼다', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 });
    const bk = (i, x, s) => { const g = G(x, 248, s); el('path', { d: 'M-20,-12 L20,-12 L16,14 L-16,14 Z', fill: INFOBG, stroke: INFO, 'stroke-width': 2 }, g); };
    if (k >= 2) { const p = k === 2 ? E(u, 0.4, 1.4) : 1; bk(0, RG[0].x, 1); if (k === 2) fly(RG[0].x, 110, RG[0].x, 220, seg(u, 0.4, 1.4), 'app-seoul', { mono: true, fill: INFO });
      mono(RG[0].x + 30, 252, 'app-seoul', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: p }); }
    if (k >= 3) { bk(1, RG[1].x, 1); if (k === 3) fly(RG[1].x, 110, RG[1].x, 220, seg(u, 0.4, 1.4), 'app-tokyo', { mono: true, fill: INFO });
      mono(RG[1].x + 30, 252, 'app-tokyo', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: k === 3 ? fade(u, 1.4) : 1 }); }
    if (k === 3) sub(480, 150, '이름과 provider만 바꾼 복사본이 하나 더', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 });
    if (k === 4) { card(200, 160, 230, 50, { rx: 10, stroke: WARN, dash: '6 4', text: 'provider 생략한 버킷', fs: 15, color: WARN, s: pop(u, 0.2) });
      grow(200, 186, 200, 260, E(u, 0.6, 1.2), WARN, { dash: '5 4' }); pill(200, 130, 'aws:region config의 기본 리전으로', WARN, pop(u, 1.0), { fs: 13.5 });
      tx(780, 150, '블록 ×3', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); sub(780, 176, '리전이 늘면 그대로 늘어난다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); } }

  // ---------- 3. 반복문으로 복제 ----------
  const MOLD = { x: 300, y: 70, w: 300, h: 290 };
  function mold(k, u) { zone(MOLD.x, MOLD.y, MOLD.w, MOLD.h, 'function createStack(region)', { fill: ACCBG, stroke: ACC, color: ACC });
    const slots = [['Provider', 'prov-${region}', 1], ['Vpc', 'vpc-${region}', 2], ['BucketV2', 'assets-${region}', 3]];
    slots.forEach(([kind, n, need], i) => { if (k < need) return; res(MOLD.x + 150, MOLD.y + 70 + i * 66, 260, kind, n, ACC, { s: k === need ? pop(u, 0.3) : 1 }); });
    if (k >= 3) mono(MOLD.x + 150, MOLD.y + 272, 'return { region, vpc, bucket }', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 3 ? fade(u, 1.2) : 1 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { ['seoulProvider', 'tokyoProvider', 'virginiaProvider'].forEach((n, i) => { const p = E(u, 0.4 + i * 0.2, 1.4 + i * 0.2);
        card(lerp(200 + i * 280, 270 + i * 210, p), lerp(90, 250, p), 190, 40, { rx: 8, stroke: lerp(1, 0, p) > 0.5 ? MUT : ACC, text: p > 0.5 ? RG[i].code : n, fs: 14, mono: true, op: 1 }); });
      mono(480, 200, 'const targetRegions = [ … ]', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
      sub(480, 330, 'provider 세 벌 대신 배열 하나가 반복의 입력', fade(u, 2.0), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    cells(30, 40, RG.map((r) => r.code), { w: 130, h: 36, fs: 13.5, gap: 4, style: () => ({ stroke: ACC }) });
    mold(k, u);
    if (k === 1) sub(450, 395, 'region을 받아 그 리전 전용 provider를 만든다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 2) { const p = E(u, 0.8, 1.6); mono(780, 200, p < 0.5 ? 'vpc-${region}' : 'vpc-ap-northeast-2', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: p < 0.5 ? MUT : INFO });
      sub(780, 230, 'region = "ap-northeast-2" 일 때', fade(u, 0.6)); sub(780, 260, '이름이 리전마다 달라 충돌하지 않는다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); }
    if (k === 3) sub(780, 230, '만든 것을 돌려줘 밖에서 쓴다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 4) { const cols = [700, 790, 880];
      RG.forEach((r, i) => { const a = 0.2 + i * 0.6; dot([[95 + i * 134, 80], [MOLD.x + 10, MOLD.y + 150], [MOLD.x + MOLD.w - 10, MOLD.y + 150]], seg(u, a, a + 0.6), ACC, 8);
        mono(cols[i], 70, r.name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: u > a + 0.6 ? INFO : OFF });
        ['P', 'V', 'B'].forEach((s, j) => { const sh = pop(u, a + 0.6 + j * 0.08); card(cols[i], 120 + j * 64, 70, 48, { rx: 8, stroke: INFO, fill: INFOBG, text: s, fs: 16, color: INFO, s: sh }); }); });
      mono(790, 340, '3 리전 × 3 = 9', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(790, 372, 'P provider · V vpc · B bucket', fade(u, 2.2)); } }

  // ---------- 4. 매핑 테이블 · 글로벌은 한 번 ----------
  const AMI = [['ap-northeast-2', 'ami-0seoul123'], ['ap-northeast-1', 'ami-0tokyo456'], ['us-east-1', 'ami-0virg789']];
  const AZ = [['ap-northeast-2', 'ap-northeast-2a'], ['ap-northeast-1', 'ap-northeast-1a'], ['us-east-1', 'us-east-1a']];
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { kvTable(40, 40, 420, AMI.map(([a, b], i) => [a, b, { op: k === 0 ? fade(u, 0.3 + i * 0.3) : 1 }]), { title: 'amiByRegion', kw: 210 });
      if (k === 1) kvTable(500, 40, 420, AZ.map(([a, b], i) => [a, b, { op: fade(u, 0.3 + i * 0.3) }]), { title: 'azByRegion', kw: 210 });
      sub(480, 230, k === 0 ? '같은 이미지라도 리전마다 AMI ID가 다르다' : '가용영역 이름도 리전에 딸려 있다', fade(u, 1.4), { 'font-size': 16, fill: INK, 'font-weight': 700 });
      sub(480, 262, '리전을 키로 조회한다 · ID 값은 예시', fade(u, 1.8), { 'font-size': 15 }); return; }
    // 글로벌 띠 + 리전 세 칸
    zone(30, 20, 900, 92, '글로벌 · 반복문 밖에서 1회', { fill: ACCBG, color: ACC });
    [['Role', 'app-shared-role'], ['InstanceProfile', 'app-profile'], ['Zone', 'primary-zone']].forEach(([kind, n], i) => res(185 + i * 300, 72, 280, kind, n, ACC, { s: k === 2 ? pop(u, 0.3 + i * 0.3) : 1 }));
    if (k === 2) { grow(325, 72, 345, 72, E(u, 1.0, 1.3), ACC); }
    const RX = [200, 480, 760]; [2, 0, 1].forEach((ri, j) => zone(RX[j] - 130, 150, 260, 200, RG[ri].name + ' · ' + RG[ri].code, { fill: SOFT }));
    if (k === 2) { sub(480, 260, '리전이 몇 개든 한 번만 만들고 같이 쓴다', fade(u, 1.6), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    // EC2 를 리전마다: 매핑에서 값 꺼내기
    [2, 0, 1].forEach((ri, j) => { const a = k === 3 ? 0.2 + j * 0.7 : -1, s = k === 3 ? pop(u, a) : 1;
      res(RX[j], 200, 230, 'Instance', 'web-' + RG[ri].code, INFO, { s });
      mono(RX[j], 250, AMI[ri][1], { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: k === 3 ? fade(u, a + 0.3) : 1 });
      mono(RX[j], 274, AZ[ri][1], { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: k === 3 ? fade(u, a + 0.45) : 1 });
      if (k === 4) grow(485, 94, RX[j], 178, E(u, 0.3 + j * 0.2, 0.8 + j * 0.2), ACC); });
    if (k === 3) { sub(480, 334, 'amiByRegion[region] · azByRegion[region]', fade(u, 2.0), { class: 'mono', fill: INK, 'font-weight': 700, 'font-size': 14 }); return; }
    mono(560, 130, 'profile.name', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
    card(480, 388, 620, 40, { rx: 10, stroke: BAD, fill: BADBG, text: 'Role을 for 안에 두면 app-shared-role이 3번 등록 → Duplicate resource URN', fs: 14, color: BAD, s: pop(u, 1.6) });
    [0, 1, 2].forEach((i) => { if (u > 1.4) card(RX[i] + 60, 320, 150, 32, { rx: 6, stroke: BAD, dash: '4 3', text: 'app-shared-role', fs: 13.5, mono: true, color: BAD, s: pop(u, 1.3 + i * 0.1) }); }); }

  // ---------- 5. up 한 번 ----------
  const PLAN = [['Stack', 'cross-region-prod', MUT], ['Role', 'app-shared-role', ACC], ['InstanceProfile', 'app-profile', ACC], ['Zone', 'primary-zone', ACC]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { terminal(120, 40, 720, 300, [['$ pulumi up', null], 'Previewing update (prod):', '', '  엔진이 프로그램을 끝까지 돌려', '  등록된 리소스를 state와 비교한다', '', '  state: 비어 있음 → 모두 + create'], E(u, 0.1, 2.0) * 7, { title: 'pulumi-up.sh · 예시', fs: 15, lh: 30 });
      return; }
    if (k <= 2) { const rows = PLAN.concat(k === 2 ? [].concat(...[0, 1, 2].map((i) => [['Provider', 'prov-' + RG[i].code, INFO], ['Vpc', 'vpc-' + RG[i].code, INFO], ['Instance', 'web-' + RG[i].code, INFO]])) : []);
      rows.forEach(([kind, n, col], i) => { const y = 34 + i * 29, op = k === 1 ? (i === 0 ? 1 : fade(u, 0.3 + i * 0.3)) : i < 4 ? 1 : fade(u, 0.2 + (i - 4) * 0.15);
        el('rect', { x: 40, y: y - 16, width: 5, height: 22, rx: 2, fill: col, opacity: op });
        mono(56, y, '+', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: op }); mono(80, y, kind, { 'font-size': 14, fill: MUT, opacity: op }); mono(250, y, n, { 'font-size': 14, 'font-weight': 700, opacity: op });
        if (k === 1 && i > 0) pill(560, y - 5, '글로벌 1회', ACC, pop(u, 0.5 + i * 0.3), { fs: 13.5 }); });
      if (k === 2) { mono(740, 200, '1 + 3 + 3 × 3', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        mono(740, 240, '= + 13 to create', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) }); }
      return; }
    if (k === 3) { // python 으로 재현한 일정: 의존이 끝나면 바로 시작
      const rows = [{ n: 'app-shared-role', s: 0, e: 2, col: ACC }, { n: 'app-profile', s: 2, e: 3, col: ACC }, { n: 'vpc-ap-northeast-2', s: 0, e: 3, col: INFO }, { n: 'vpc-ap-northeast-1', s: 0, e: 3, col: INFO },
        { n: 'vpc-us-east-1', s: 0, e: 3, col: INFO }, { n: 'web-ap-northeast-2', s: 3, e: 21, col: WARN }, { n: 'web-ap-northeast-1', s: 3, e: 20, col: WARN }, { n: 'web-us-east-1', s: 3, e: 22, col: WARN }];
      gantt(240, 30, 660, rows, 25, lerp(0, 25, E(u, 0.2, 2.4)), { step: 5 });
      pill(570, 345, 'VPC 셋은 동시에 · EC2 셋은 app-profile 다음 동시에', INK, pop(u, 2.2), { fs: 14 });
      sub(570, 390, '리전이 늘어도 시간은 합이 아니라 가장 긴 줄 · app-profile 1초는 가정값', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    // k4: 엔드포인트 → Route53 active-active
    card(480, 60, 260, 52, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'Route53 · example.com', fs: 15, color: ACC, s: pop(u, 0.2) });
    [2, 0, 1].forEach((ri, j) => { const x = [180, 480, 780][j]; pin(x, 260, RG[ri], { col: GOOD, s: pop(u, 0.4 + j * 0.2) });
      grow(480, 88, x, 210, E(u, 0.8 + j * 0.2, 1.3 + j * 0.2), GOOD); mono(x, 340, 'web-' + RG[ri].code + '.example.com', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.4 + j * 0.2) }); });
    sub(480, 395, '리전을 늘리려면 배열에 한 줄 넣고 다시 up · 주소는 예시', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: '이 장의 코드에서 배포 대상 리전을 늘리는 방법은 무엇인가?',
      o: ['콘솔에서 리전을 하나 더 연다', 'targetRegions 배열에 한 줄을 넣는다', 'Pulumi.yaml에 리전마다 프로젝트를 만든다'], a: 1,
      why: '배열이 배포 대상의 전부다. 반복문이 이 배열을 돌므로 한 줄을 넣으면 그 리전에도 같은 스택이 생긴다.' },
    { q: '리소스 옵션에서 provider를 빼면 그 리소스는 어디에 만들어지나?',
      o: ['배열의 첫 리전', '세 리전 모두', 'aws:region config의 기본 리전'], a: 2,
      why: '명시한 provider가 없으면 기본 provider를 쓰고, 기본 provider는 aws:region config를 따른다. 그래서 cross-region에서는 provider를 늘 명시한다.' },
    { q: 'createStack 안에서 리소스 이름에 region을 넣는 이유는 무엇인가?',
      o: ['리전마다 이름이 달라야 같은 프로그램 안에서 충돌하지 않는다', 'AWS가 이름에 리전을 꼭 요구한다', '이름이 길수록 빨리 만들어진다'], a: 0,
      why: '같은 함수를 세 번 부르므로 이름이 같으면 logical name이 겹친다. vpc-${region}처럼 넣으면 vpc-ap-northeast-2 등으로 갈린다.' },
    { q: 'IAM Role을 for 반복문 안에 넣으면 어떻게 되나?',
      o: ['리전마다 다른 Role이 생겨 문제없다', '같은 이름이 세 번 등록돼 URN 중복 오류가 난다', '첫 번째 리전에만 만들어진다'], a: 1,
      why: 'Role은 리전이 없는 글로벌 리소스라 이름도 하나다. 반복문 안에서 같은 이름을 세 번 등록하면 Duplicate resource URN 오류가 난다.' },
    { q: 'preview의 + 13 to create는 어떻게 나온 숫자인가?',
      o: ['Stack 1 + 글로벌 3 + (provider·VPC·EC2) 3 × 리전 3', '리전 3 × 리소스 4 + 1', '리소스 종류 13가지'], a: 0,
      why: 'Stack도 리소스로 센다. 글로벌 Role·프로필·Zone이 3개, 리전마다 provider·VPC·EC2가 3개씩이라 1 + 3 + 9 = 13이다.' },
  ];
  const summary = [
    '같은 인프라를 서울·도쿄·버지니아에 두면 가까운 리전이 답하고, 한 곳이 죽어도 다른 곳이 받는다.',
    '리전은 aws.Provider 인스턴스로 정하고, provider를 빼면 aws:region config의 기본 리전으로 간다.',
    'targetRegions 배열을 map으로 돌려 createStack을 리전마다 부르면 같은 스택이 복제된다.',
    'AMI·AZ처럼 리전마다 다른 값은 매핑으로 찾고, Role·Zone 같은 글로벌 리소스는 반복문 밖에서 한 번 만든다.',
  ];
  const review = [
    { q: '리전을 4개로 늘렸더니 preview에 Role이 4줄 create로 떴다. 먼저 의심할 것은?',
      o: ['Role을 반복문 안에 둔 것', 'AMI 매핑에 새 리전이 빠진 것', 'Route53 Zone 이름이 틀린 것'], a: 0,
      why: '글로벌 리소스는 계획에 한 줄만 떠야 한다. 리전 수만큼 늘었다면 반복문 안에 들어가 있는 것이다.' },
    { q: '새 리전 eu-west-1을 배열에 넣었더니 EC2 만들 때 ami가 비어 있다고 실패했다. 고칠 곳은?',
      o: ['aws.Provider의 region 값', 'amiByRegion 매핑에 eu-west-1 항목 추가', 'Role의 신뢰 정책'], a: 1,
      why: 'EC2는 amiByRegion[region]으로 AMI를 찾는다. 새 리전 키가 매핑에 없으면 값이 비어 실패한다.' },
    { q: '세 리전 EC2가 각각 17~19초 걸렸다. up 전체에서 EC2 몫의 시간에 가장 가까운 것은?',
      o: ['세 시간을 더한 약 54초', '가장 짧은 17초', '가장 긴 한 대에 가까운 약 19초'], a: 2,
      why: '세 리전 EC2는 서로 기다리지 않아 동시에 만들어진다. 그래서 합이 아니라 가장 오래 걸린 한 대에 맞춰 끝난다.' },
  ];

  R.page({ title: '리전마다 같은 스택', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
