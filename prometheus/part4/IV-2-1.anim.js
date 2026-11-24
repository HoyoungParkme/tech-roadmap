/* IV-2-1 file SD — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 타깃 주소·레이블은 코드 블록(prometheus.yml · targets/api-prod.json · gen_targets.sh)의 값,
 * 오토스케일로 바뀌는 인스턴스(10.0.1.14 추가 · 10.0.1.13 종료)는 예전 패널의 예시를 따른다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, clock, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, k0, a) => (c.k > k0 ? 1 : c.k === k0 ? pop(c.u, a ?? 0.2) : 0);
  const fa = (c, k0, a) => (c.k > k0 ? 1 : c.k === k0 ? fade(c.u, a ?? 0.2) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 설정 파일 그림: lines = [[text, color, opacity, strike]]
  function doc(x, y, w, h, title, lines, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5 });
    tx(x + 14, y + 24, title, { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: o.tcol || INK });
    if (o.lock) lock(x + w - 22, y + 22, true, MUT, 0.7);
    lines.forEach(([s, col, op, strike], i) => { if (op === 0) return; const yy = y + 52 + i * (o.lh || 25);
      mono(x + 14, yy, s, { 'font-size': o.fs || 14.5, fill: col || INK, opacity: op ?? 1, 'text-decoration': strike ? 'line-through' : null }); }); }
  const tgtRow = (x, y, addr, o) => { o = o || {}; card(x + 90, y, 180, 36, { rx: 6, stroke: o.stroke || GRID, fill: o.fill, dash: o.dash, s: o.s ?? 1, op: o.op });
    mono(x + 90, y + 5, addr, { 'font-size': 14, 'text-anchor': 'middle', fill: o.col || INK, 'font-weight': 700, opacity: (o.op ?? 1) * ((o.s ?? 1) > 0.3 ? 1 : 0), 'text-decoration': o.strike ? 'line-through' : null }); };

  // ---------- 1. static_configs 의 한계 ----------
  const IPS = ['10.0.1.11', '10.0.1.12', '10.0.1.13'];
  function s1(t, c) { const { k, u } = c;
    const L = [['scrape_configs:', INFO], ['  - job_name: "api"', INK], ['    static_configs:', INFO, fa(c, 0, 0.8)],
      ['      - targets:', INFO, fa(c, 1)], ...IPS.map((ip, i) => ['          - ' + ip + ':9100', ACC, fa(c, 1, 0.4 + i * 0.3)]),
      ['          - 10.0.1.14:9100', BAD, k === 3 ? fade(u, 1.4) : k > 3 ? 1 : 0], ['        labels:', INFO, fa(c, 2)], ['          env: prod  team: api', WARN, fa(c, 2, 0.6)]];
    doc(20, 30, 380, 340, 'prometheus.yml', L);
    zone(450, 30, 490, 250, '클라우드 (오토스케일)', { stroke: GRID, sw: 1.5 });
    if (k >= 1 && k <= 3) IPS.forEach((ip, i) => { const s = k === 1 ? pop(u, 0.4 + i * 0.3) : 1, y = 80 + i * 60;
      card(600, y, 180, 44, { rx: 8, text: ip, fs: 14.5, mono: true, stroke: GOOD, s });
      if (k <= 3) grow(310, 155 + i * 25, 508, y, k === 1 ? E(u, 0.6 + i * 0.3, 1.1 + i * 0.3) : 1, GRID, { plain: true });
      if (k >= 2 && k <= 3) pill(760, y, 'env=prod', WARN, k === 2 ? pop(u, 0.6 + i * 0.2) : 1, { mono: true, fs: 13 }); });
    if (k === 0) note(470, 330, '설정 파일이 타깃까지 갖는다', fade(u, 1.2));
    if (k === 2) note(470, 330, 'labels 는 이 그룹의 모든 시계열에 붙는다', fade(u, 1.4));
    if (k === 3) { card(600, 260, 180, 44, { rx: 8, text: '10.0.1.14', fs: 14.5, mono: true, stroke: BAD, dash: '6 4', s: pop(u, 0.2) });
      tx(700, 266, '?', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: 1 - fade(u, 1.6) });
      person(420, 360, null, { s: pop(u, 0.9) }); note(450, 352, 'yml 을 고치고', fade(u, 1.2));
      pill(690, 352, 'POST /-/reload', ACC, pop(u, 2.0), { mono: true, fs: 14 }); note(450, 400, '리로드해야 그제야 긁힌다', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 4) { // 뜨고 지는 인스턴스, 쌓이는 수정·리로드
      const slots = [[540, 90], [700, 90], [860, 90], [540, 160], [700, 160], [860, 160], [540, 230], [700, 230], [860, 230]];
      slots.forEach(([x, y], i) => { const ph = (t * 0.9 + i * 0.37) % 1, on = ph < 0.6;
        card(x, y, 120, 36, { rx: 6, stroke: on ? GOOD : OFF, dash: on ? null : '4 4', op: on ? 1 : 0.5, text: '10.0.' + (2 + (i % 3)) + '.' + (20 + i), fs: 13.5, mono: true, color: on ? INK : MUT }); });
      const n = Math.floor(E(u, 0.3, 2.3) * 6);
      for (let i = 0; i < n; i++) card(560 + i * 8, 360 - i * 6, 180, 34, { rx: 6, text: i === n - 1 ? 'yml 수정 → reload' : '', fs: 13.5, stroke: BAD, fill: BADBG });
      person(420, 360, null, {}); note(30, 400, '수십 대가 뜨고 지면 사람이 따라갈 수 없다', fade(u, 1.8), { fill: BAD }); } }

  // ---------- 2. file_sd_configs ----------
  const FILES = [['api-prod.json', 1], ['api-stg.json', 1], ['api.yml', 1], ['web.json', 0]];
  function s2(t, c) { const { k, u } = c;
    const sw = k === 0 ? E(u, 0.4, 1.2) : 1;
    const L = [['scrape_configs:', INFO], ['  - job_name: "api"', INK], ['    static_configs: …', MUT, 1 - sw, true], ['    file_sd_configs:', ACC, sw],
      ['      - files:', INFO, fa(c, 1)], ['        - targets/api-*.json', ACC, fa(c, 1, 0.3)], ['        - targets/api.yml', ACC, fa(c, 1, 0.5)], ['        refresh_interval: 30s', WARN, fa(c, 1, 1.4)]];
    doc(20, 30, 400, 260, 'prometheus.yml', L, { lock: k === 3, stroke: k === 3 ? INK : GRID });
    zone(470, 30, 300, 230, 'targets/', { stroke: GRID, sw: 1.5, op: fa(c, 0, 1.4) });
    FILES.forEach(([f, m], i) => { const y = 78 + i * 46, s = k === 0 ? pop(u, 1.5 + i * 0.15) : 1, hit = k >= 1 && m;
      card(620, y, 250, 36, { rx: 6, text: f, fs: 14, mono: true, fw: 700, stroke: hit ? ACC : GRID, color: k >= 1 && !m ? MUT : INK, s, sw: hit ? 2.4 : 1.5,
        fill: k >= 2 && i === 0 ? (Math.floor(t * 3) % 2 ? WARNBG : PANEL) : PANEL });
      if (k === 1) { if (m) check(760, y, 8, pop(u, 0.6 + i * 0.2)); else cross(760, y, 8, pop(u, 1.2)); } });
    if (k === 1) { clock(860, 300, 26, (u / 3), WARN); mono(860, 350, '30s', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      note(30, 330, 'glob 에 맞는 파일만 읽는다 (마지막 경로 조각의 * 하나)', fade(u, 1.0), { 'font-size': 14.5 });
      note(30, 360, 'refresh_interval 은 감시가 놓쳤을 때를 위한 재확인 주기', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); }
    if (k >= 2) { server(860, 330, null, { lamp: GOOD, s: 0.8 });
      if (k === 2) { const g = E(u, 0.4, 1.0);
        fly(760, 110, 820, 300, seg(u, 0.3, 1.1), '변경 감지', { fill: ACC });
        ['10.0.1.11:9100', '10.0.1.12:9100', '10.0.1.14:9100'].forEach((a, i) => tgtRow(470, 300 + i * 40, a, { s: i === 2 ? pop(u, 1.3) : 1, stroke: i === 2 ? GOOD : GRID, col: i === 2 ? GOOD : INK }));
        el('rect', { x: 30, y: 310, width: 380 * E(u, 0, 2.8), height: 12, rx: 6, fill: GOOD, opacity: 0.8 });
        note(30, 350, 'Prometheus 는 계속 떠 있다 — 재시작 없음', fade(u, 1.6), { fill: GOOD }); note(30, 300, '프로세스 가동 중', g, { fill: MUT, 'font-size': 14 }); }
      if (k === 3) { note(30, 330, '정책(yml)은 고정', fade(u, 0.4), { fill: INK }); note(30, 362, '자주 바뀌는 목록(json)만 따로 움직인다', fade(u, 0.9), { fill: ACC });
        tx(860, 400, 'Prometheus', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); } } }

  // ---------- 3. 파일 형식 ----------
  const G1 = ['10.0.1.11:9100', '10.0.1.12:9100'], G2 = ['10.0.2.21:9100'];
  function s3(t, c) { const { k, u } = c;
    // 왼쪽: JSON 뼈대
    const br = at(c, 0, 0.1);
    mono(22, 62, '[', { 'font-size': 40, fill: INFO, 'font-weight': 300, opacity: br }); mono(22, 404, ']', { 'font-size': 40, fill: INFO, 'font-weight': 300, opacity: br });
    const grp = (y, h, tg, region, k0, kl) => { const s = at(c, 0, k0 === 1 ? 0.5 : 0.8);
      el('rect', { x: 50, y, width: 380, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6, opacity: s > 0.3 ? 1 : 0 });
      mono(62, y + 26, '"targets":', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fa(c, k0) });
      tg.forEach((a, i) => pill(260, y + 21 + i * 30, a, ACC, at(c, k0, 0.3 + i * 0.3), { mono: true, fs: 13.5 }));
      const ly = y + 26 + tg.length * 30 + 6;
      mono(62, ly, '"labels":', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fa(c, kl) });
      [['env', 'prod'], ['team', 'api'], ['region', region]].forEach(([kk, v], i) => pill([120, 230, 190][i], ly + (i === 2 ? 58 : 28), kk + '=' + v, WARN, at(c, kl, 0.4 + i * 0.25), { mono: true, fs: 13 })); };
    grp(36, 168, G1, 'ap-northeast-2', 1, 2); grp(226, 140, G2, 'us-east-1', 3, 3);
    if (k === 0) { note(470, 120, '파일 최상위는 배열', fade(u, 0.6)); note(470, 152, '객체 하나 = 타깃 그룹 하나', fade(u, 1.1)); note(470, 184, '키는 targets · labels 둘뿐', fade(u, 1.6), { fill: MUT }); return; }
    // 오른쪽: 그 결과 생기는 타깃과 라벨
    if (k <= 3) { tx(500, 46, '그 결과 생기는 타깃 (job="api")', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const rows = [[G1[0], 'ap-northeast-2', 1], [G1[1], 'ap-northeast-2', 1], [G2[0], 'us-east-1', 3]];
      rows.forEach(([a, r, k0], i) => { if (k < k0) return; const y = 96 + i * 96, s = at(c, k0, 0.6 + (i % 2) * 0.3);
        card(715, y, 430, 80, { rx: 10, stroke: GRID, s });
        mono(514, y - 12, 'instance="' + a + '"', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: s > 0.3 ? 1 : 0 });
        const lo = k0 === 1 ? fa(c, 2, 0.9 + i * 0.2) : fa(c, 3, 1.4);
        mono(514, y + 18, 'env="prod" team="api"', { 'font-size': 14, fill: WARN, opacity: lo });
        mono(514, y + 38 - 4, '', {}); mono(744, y + 18, 'region="' + r + '"', { 'font-size': 14, fill: k0 === 3 ? BAD : WARN, opacity: lo, 'font-weight': k0 === 3 ? 800 : 400 }); });
      if (k === 2) fly(300, 190, 600, 110, seg(u, 0.5, 1.1), 'labels', { fill: WARN });
      if (k === 3) note(500, 394, '그룹을 나누면 그룹마다 다른 레이블', fade(u, 2.0)); return; }
    // k4: 키 이름이 갈라지면 쿼리가 갈라진다
    tx(470, 50, '다른 팀 파일이 키를 다르게 쓰면', { 'font-size': 15, 'font-weight': 700 });
    [['api 팀', 'env="prod"', GOOD], ['web 팀', 'environment="prod"', BAD], ['batch 팀', 'stage="prod"', BAD]].forEach(([tm, kv, col], i) => { const y = 100 + i * 52, s = pop(u, 0.3 + i * 0.3);
      card(700, y, 440, 42, { rx: 8, stroke: col, s }); tx(500, y + 5, tm, { 'font-size': 14.5, 'font-weight': 700, opacity: s > 0.3 ? 1 : 0 }); mono(600, y + 5, kv, { 'font-size': 14.5, fill: col, opacity: s > 0.3 ? 1 : 0 }); });
    mono(480, 290, 'up{env="prod"}', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.5) });
    tx(480, 324, '→ api 팀 타깃만 나온다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) });
    note(480, 370, '키 이름은 팀 사이에 미리 맞춘다', fade(u, 2.3), { fill: GOOD }); }

  // ---------- 4. 외부 시스템이 파일을 갱신 ----------
  const INST = [['10.0.1.11', 'api', 1], ['10.0.1.12', 'api', 1], ['10.0.1.13', 'api', 0], ['10.0.1.14', 'api', 1], ['10.0.3.5', 'web', 1]];
  function s4(t, c) { const { k, u } = c;
    card(390, 70, 200, 52, { rx: 10, text: 'gen_targets.sh', fs: 15, mono: true, fw: 800, stroke: INK, s: at(c, 0) });
    if (k === 0) { const steps = ['aws ec2 …', 'jq …', 'mv'];
      steps.forEach((s, i) => { const x = 240 + i * 230; card(x, 210, 170, 46, { rx: 8, text: s, fs: 15, mono: true, stroke: i === 0 ? BAD : GRID, color: i === 0 ? BAD : INK, s: pop(u, 0.5 + i * 0.2), op: i === 0 ? 1 : 1 - 0.6 * fade(u, 1.6) });
        if (i < 2) grow(x + 88, 210, x + 140, 210, E(u, 0.7 + i * 0.2, 1.0 + i * 0.2), MUT); });
      cross(240, 172, 11, pop(u, 1.3)); mono(240, 266, 'exit 1', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(390, 150, 'set -euo pipefail', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
      note(130, 340, '한 단계가 실패하면 그 자리에서 멈춘다', fade(u, 1.7)); note(130, 372, '반쪽 결과로 목록을 덮어쓰지 않는다', fade(u, 2.1), { fill: MUT }); return; }
    // 파일 두 개
    const mv = k >= 4 ? E(k === 4 ? u : 3, 1.6, 2.4) : 0;
    card(720, 70, 230, 40, { rx: 6, text: 'api-prod.json', fs: 14, mono: true, fw: 700, stroke: mv > 0.99 ? GOOD : GRID, color: mv > 0.99 ? GOOD : MUT, s: at(c, 1) });
    if (mv < 0.99) card(720, lerp(130, 70, mv), 230, 40, { rx: 6, text: 'api-prod.json.$$', fs: 14, mono: true, fw: 700, stroke: WARN, fill: WARNBG, s: at(c, 1, 0.5) });
    if (k === 1) { note(600, 190, 'OUT = targets/api-prod.json', fade(u, 0.8), { class: 'mono', 'font-size': 14 }); note(600, 220, 'TMP = 같은 디렉터리의 임시 파일', fade(u, 1.2), { 'font-size': 14 });
      note(600, 250, '.json 으로 안 끝나 glob 에 안 걸린다', fade(u, 1.6), { 'font-size': 14, fill: MUT }); return; }
    // 클라우드
    zone(16, 150, 330, 250, '클라우드 API', { stroke: GRID, sw: 1.5 });
    INST.forEach(([ip, tm, run], i) => { const y = 190 + i * 40, keep = tm === 'api' && run, g = k === 2 ? E(u, 0.6 + i * 0.15, 1.0 + i * 0.15) : 1;
      card(120, y, 150, 32, { rx: 6, text: ip, fs: 13.5, mono: true, stroke: run ? INK : OFF, dash: run ? null : '4 4', color: run ? INK : MUT, op: keep || k < 2 ? 1 : 1 - 0.6 * g });
      mono(205, y + 5, tm + (run ? '' : ' · stopped'), { 'font-size': 13.5, fill: keep ? GOOD : MUT, opacity: keep || k < 2 ? 1 : 1 - 0.6 * g }); });
    if (k === 2) { note(380, 190, 'team=api 이고 running 인 것만', fade(u, 0.4), { 'font-size': 14.5 });
      ['10.0.1.11', '10.0.1.12', '10.0.1.14'].forEach((ip, i) => fly(300, 190 + [0, 1, 3][i] * 40, 450, 250 + i * 34, seg(u, 1.2 + i * 0.2, 2.0 + i * 0.2), ip, { mono: true, fill: INFO, stay: true }));
      return; }
    if (k === 3) { // jq 변환
      el('rect', { x: 370, y: 160, width: 570, height: 240, rx: 10, fill: INK });
      const J = ['[{', '  "targets": ["10.0.1.11:9100",', '              "10.0.1.12:9100",', '              "10.0.1.14:9100"],', '  "labels": {"env": "prod", "team": "api"}', '}]'];
      J.forEach((s, i) => mono(390, 192 + i * 30, s.slice(0, Math.round(s.length * E(u, 0.2 + i * 0.3, 0.6 + i * 0.3))), { 'font-size': 14.5, fill: i === 4 ? 'var(--warn)' : 'var(--term)' }));
      grow(940, 170, 840, 140, E(u, 2.2, 2.6), WARN); return; }
    if (k === 4) { // 직접 쓰기 vs rename
      el('rect', { x: 370, y: 160, width: 270, height: 150, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: fade(u, 0.2) });
      tx(384, 186, '바로 쓰는 중에 읽으면', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
      mono(384, 222, '[{"targets": ["10.0.1', { 'font-size': 14, opacity: fade(u, 0.5) }); mono(384, 254, '→ JSON 오류', { 'font-size': 14, fill: BAD, 'font-weight': 800, opacity: fade(u, 0.9) });
      cross(610, 180, 10, pop(u, 1.0));
      el('rect', { x: 660, y: 160, width: 280, height: 150, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5, opacity: fade(u, 1.2) });
      tx(674, 186, 'rename(mv) 은 한 번에', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      tx(674, 222, '옛 파일 아니면 새 파일', { 'font-size': 14, opacity: fade(u, 1.5) }); tx(674, 254, '중간 상태가 없다', { 'font-size': 14, opacity: fade(u, 1.8) });
      note(370, 350, '같은 디렉터리 안이어야 rename 이 원자적이다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k5: 1분마다 실행 → 타깃 추가·제거
    const x0 = 380, w = 540; el('line', { x1: x0, y1: 186, x2: x0 + w, y2: 186, stroke: MUT, 'stroke-width': 1.8 });
    for (let m = 0; m <= 4; m++) { const x = x0 + (w * m) / 4, s = pop(u, 0.2 + m * 0.2, 0.4); el('circle', { cx: x, cy: 186, r: 7 * s, fill: ACC }); mono(x, 210, m + 'm', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    tx(x0, 166, 'cron · systemd timer 로 1분마다', { 'font-size': 14.5, 'font-weight': 700 });
    tx(400, 250, 'Prometheus 타깃', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    [['10.0.1.11:9100', 0], ['10.0.1.12:9100', 0], ['10.0.1.13:9100', -1], ['10.0.1.14:9100', 1]].forEach(([a, st], i) => { const y = 276 + i * 34;
      const g = st ? E(u, 1.2, 1.9) : 0;
      tgtRow(390, y, a, { stroke: st === 1 ? GOOD : st === -1 ? BAD : GRID, col: st === 1 ? GOOD : st === -1 ? BAD : INK, op: st === -1 ? 1 - 0.6 * g : st === 1 ? g : 1, strike: st === -1 && g > 0.5 });
      if (st && g > 0.5) mono(600, y + 5, st === 1 ? '+ 추가' : '− 제거', { 'font-size': 14, 'font-weight': 800, fill: st === 1 ? GOOD : BAD }); });
    note(700, 300, '재시작 0번', fade(u, 2.0), { fill: GOOD }); }

  // ---------- 5. relabel · 함정 ----------
  const T5 = [['10.0.1.11:9100', ''], ['10.0.1.12:9100', ''], ['10.0.1.14:9100', 'canary']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) {
      tx(30, 40, 'file SD 가 넘겨준 타깃과 라벨 (relabel 전)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const H = ['__address__', '__meta_filepath', 'tier', 'sd_file'];
      H.forEach((h, j) => mono([30, 220, 520, 640][j], 78, h, { 'font-size': 14, 'font-weight': 800, fill: j === 3 ? ACC : MUT, opacity: j === 3 ? fa(c, 1, 0.6) : 1 }));
      T5.forEach(([a, tier], i) => { const y = 124 + i * 56, drop = tier && k >= 2, g = k === 2 ? E(u, 0.8, 1.6) : drop ? 1 : 0;
        el('rect', { x: 20, y: y - 24, width: 920, height: 44, rx: 6, fill: drop ? BADBG : i % 2 ? PANEL : SOFT, opacity: 1 - 0.5 * g });
        mono(30, y + 4, a, { 'font-size': 14, 'font-weight': 700, opacity: 1 - 0.5 * g });
        mono(220, y + 4, 'targets/api-prod.json', { 'font-size': 14, fill: MUT, opacity: 1 - 0.5 * g });
        mono(520, y + 4, tier ? '"canary"' : '—', { 'font-size': 14, fill: tier ? WARN : OFF, 'font-weight': tier ? 800 : 400, opacity: 1 - 0.5 * g });
        if (k >= 1) { if (k === 1) fly(300, y, 700, y, seg(u, 0.4 + i * 0.25, 1.1 + i * 0.25), 'api-prod.json', { mono: true, fill: ACC, stay: true });
          else mono(640, y + 4, '"targets/api-prod.json"', { 'font-size': 14, fill: ACC, opacity: 1 - 0.5 * g }); }
        if (drop && g > 0) el('line', { x1: 24, y1: y, x2: 24 + 912 * g, y2: y, stroke: BAD, 'stroke-width': 2.5 }); });
      if (k === 0) note(30, 330, '__meta_filepath: 이 타깃이 어느 파일에서 왔는지', fade(u, 1.2));
      if (k === 1) note(30, 330, '__ 로 시작하는 메타 라벨은 곧 사라지므로 남길 값은 옮겨 둔다', fade(u, 1.8));
      if (k === 2) { note(30, 330, 'tier="canary" 에 regex 가 맞으면 drop — 아예 긁지 않는다', fade(u, 1.4), { fill: BAD }); mono(30, 370, '타깃 3 → 2', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); }
      return; }
    if (k === 3) { // 형식 오류 · 권한
      el('rect', { x: 20, y: 30, width: 440, height: 220, rx: 10, fill: INK });
      ['[{', '  "targets": ["10.0.1.11:9100",', '              "10.0.1.15:9100",],', '  "labels": {"env": "prod"}', '}]'].forEach((s, i) => mono(36, 64 + i * 28, s, { 'font-size': 14.5, fill: i === 2 ? 'var(--bad)' : 'var(--term)', opacity: fade(u, 0.1 + i * 0.1) }));
      el('rect', { x: 290, y: 106, width: 22, height: 24, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.8) });
      tx(36, 230, '쉼표 하나 → 이 변경은 통째로 무시', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      tx(500, 60, 'Prometheus 의 타깃 목록', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ['10.0.1.11:9100', '10.0.1.12:9100'].forEach((a, i) => tgtRow(500, 100 + i * 44, a, {}));
      tgtRow(500, 188, '10.0.1.15:9100', { dash: '5 4', col: MUT, stroke: OFF, op: fade(u, 1.2) });
      note(500, 236, '옛 목록이 그대로 남는다', fade(u, 1.5), { fill: WARN });
      lock(50, 310, true, BAD, pop(u, 1.8)); note(80, 318, '권한·경로 문제로 못 읽으면 에러 로그만 남는다', fade(u, 1.9));
      note(80, 352, '처음부터 못 읽었다면 타깃은 0개', fade(u, 2.2), { fill: BAD }); note(80, 386, 'promtool check config 로 먼저 검증', fade(u, 2.5), { fill: GOOD, 'font-size': 14.5 }); return; }
    // k4: 갱신 지연 · 레이블 키
    tx(30, 44, '파일이 바뀐 뒤 반영되기까지', { 'font-size': 15, 'font-weight': 700 });
    const x0 = 60, w = 820, X = (s) => x0 + (s / 120) * w;
    el('line', { x1: x0, y1: 120, x2: x0 + w, y2: 120, stroke: MUT, 'stroke-width': 1.8 });
    [0, 30, 60, 90, 120].forEach((s) => mono(X(s), 144, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    [30, 60, 90, 120].forEach((s, i) => { el('line', { x1: X(s), y1: 104, x2: X(s), y2: 120, stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.3 + i * 0.15) }); });
    tx(X(120), 94, 'refresh_interval 30s 재확인', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.5) });
    el('circle', { cx: X(5), cy: 120, r: 8, fill: ACC, opacity: fade(u, 0.8) }); tx(X(5), 94, '파일 교체', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
    el('line', { x1: X(5), y1: 128, x2: X(5) + (X(30) - X(5)) * E(u, 1.0, 1.5), y2: 128, stroke: BAD, 'stroke-width': 4 });
    tx(X(17), 172, '감시가 놓치면 최대 한 주기 늦다', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) });
    note(30, 216, '생성 주기(1분)와 refresh_interval 을 함께 정한다', fade(u, 1.6), { 'font-size': 14.5 });
    el('line', { x1: 20, y1: 244, x2: 940, y2: 244, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.8) });
    [['env', GOOD], ['environment', BAD], ['stage', BAD]].forEach(([kk, col], i) => pill(120 + i * 200, 290, kk + '="prod"', col, pop(u, 1.9 + i * 0.15), { mono: true, fs: 14 }));
    note(30, 350, '같은 뜻의 키가 셋이면 쿼리·알림이 셋으로 갈라진다', fade(u, 2.3), { fill: BAD });
    note(30, 384, 'env · team · region 처럼 키 규칙을 하나로', fade(u, 2.5), { fill: GOOD }); }

  const quiz = [
    { q: 'static_configs로 관리할 때 인스턴스 10.0.1.14가 새로 뜨면 무엇을 해야 긁히는가?',
      o: ['아무것도 안 해도 다음 scrape에 잡힌다', 'prometheus.yml을 고치고 리로드한다', 'node_exporter를 다시 시작한다'], a: 1,
      why: '타깃이 설정 파일에 박혀 있어서 yml 수정과 /-/reload(또는 SIGHUP)가 따라붙는다. 수십 대가 뜨고 지면 사람이 따라갈 수 없다.' },
    { q: 'file_sd_configs로 바꾼 뒤 prometheus.yml이 갖는 것은 무엇인가?',
      o: ['읽을 파일 경로(glob)와 재확인 주기', '타깃 IP 전체 목록', '타깃마다 붙일 region 값'], a: 0,
      why: 'yml에는 targets/api-*.json 같은 경로와 refresh_interval만 남는다. 목록은 파일이 갖고, 파일이 바뀌면 재시작 없이 반영된다.' },
    { q: 'targets/api-prod.json의 두 번째 그룹에 있는 10.0.2.21:9100에 붙는 region은 무엇인가?',
      o: ['ap-northeast-2', 'us-east-1', '아무 region도 붙지 않는다'], a: 1,
      why: 'labels는 그 그룹 안의 타깃에만 붙는다. 그룹을 나눴기 때문에 두 번째 그룹은 us-east-1을 받는다.' },
    { q: 'gen_targets.sh가 결과를 임시 파일에 쓴 뒤 mv로 바꾸는 까닭은 무엇인가?',
      o: ['jq가 바로 쓰지 못해서', '파일 크기를 줄이려고', 'Prometheus가 반쯤 쓰인 JSON을 읽지 않게 하려고'], a: 2,
      why: '같은 디렉터리 안 rename은 한 번에 바뀐다. 쓰는 도중에 읽으면 JSON 오류가 나지만 rename에는 중간 상태가 없다.' },
    { q: 'targets JSON에 쉼표를 하나 잘못 넣었다. Prometheus의 타깃 목록은 어떻게 되는가?',
      o: ['그 변경이 무시되고 옛 목록이 그대로 남는다', '모든 타깃이 즉시 사라진다', '맞는 줄만 골라 반영된다'], a: 0,
      why: '형식이 맞는 변경만 반영된다. 에러 로그만 남고 새 타깃은 조용히 안 들어오므로 promtool로 먼저 검증한다.' },
  ];

  const summary = [
    'static_configs는 인스턴스가 바뀔 때마다 yml을 고치고 리로드해야 해서 오토스케일을 못 따라간다.',
    'file_sd_configs는 yml에 파일 경로만 두고, 목록 파일이 바뀌면 재시작 없이 다시 읽는다.',
    '파일은 targets와 labels를 가진 그룹의 배열이고, 레이블은 그 그룹 타깃에만 붙는다.',
    '스크립트가 임시 파일에 쓴 뒤 mv로 바꾸고, 형식 오류 변경은 무시되니 미리 검증한다.',
  ];
  const review = [
    { q: '오토스케일 그룹에 인스턴스가 늘었는데 1분이 지나도 타깃에 안 보인다. 먼저 볼 곳은?',
      o: ['gen_targets.sh가 돌았는지와 Prometheus 로그의 파일 읽기 오류', 'scrape_interval이 15초인지', 'node_exporter의 collector 목록'], a: 0,
      why: '목록은 스크립트가 만든 파일에서 온다. 스크립트가 멈췄거나 JSON이 깨졌으면 옛 목록이 그대로 남는다.' },
    { q: '두 팀이 같은 job에 각각 env와 environment 키로 레이블을 달았다. up{env="prod"}로 조회하면?',
      o: ['두 팀 타깃이 모두 나온다', 'env 키를 쓴 팀 타깃만 나온다', '쿼리 문법 오류가 난다'], a: 1,
      why: '레이블은 키 이름까지 같아야 같은 조건에 걸린다. 키 규칙을 맞추지 않으면 쿼리와 알림이 갈라진다.' },
    { q: 'canary 인스턴스는 목록 파일에 그대로 두고 scrape만 빼고 싶다. 알맞은 방법은?',
      o: ['refresh_interval을 늘린다', '파일을 web.json으로 옮긴다', 'relabel_configs에서 tier="canary" 를 action: drop 한다'], a: 2,
      why: 'relabel의 drop은 regex에 맞는 타깃을 아예 긁지 않는다. 그림에서 타깃이 3개에서 2개로 줄었다.' },
  ];

  R.page({ title: 'file SD 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
