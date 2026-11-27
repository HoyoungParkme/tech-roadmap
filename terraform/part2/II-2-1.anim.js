/* II-2-1 variable / output — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 값의 최종 결정은 공식 문서의 우선순위(default < TF_VAR_ < terraform.tfvars < terraform.tfvars.json < *.auto.tfvars < -var/-var-file 적은 순서)를
 * 파이썬으로 재현해 beat 마다 계산했다. terraform 을 돌리지 못해 터미널 출력은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, snippet, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function fileIc(cx, cy, label, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op), col = o.col || INK;
    el('path', { d: 'M-15,-20 H7 L16,-11 V20 H-15 Z', fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M7,-20 V-11 H16', fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    if (label) mono(26, 6, label, { 'font-size': 14, fill: o.lcol || col, 'font-weight': 700 }, g); }
  function vm(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INK;
    el('rect', { x: -18, y: -13, width: 36, height: 23, rx: 4, fill: PANEL, stroke: c, 'stroke-width': 2.2 }, g); el('path', { d: 'M-7,15 H7 M0,10 V15', stroke: c, 'stroke-width': 2.2 }, g); }

  // ---------- 1. variable = 입력 슬롯 ----------
  const SL = [['region', 'string', '"ap-northeast-2"'], ['instance_type', 'string', '"t3.micro"'], ['tags', 'map(string)', '{ env = "dev" }'], ['admin_email', 'string', null]];
  const MOD = { x: 620, y: 70, w: 290, h: 300 };
  function slot(i, s, hot) { const [n, ty, v] = SL[i], y = 100 + i * 78; if (s <= 0) return;
    const g = R.G(0, 0, 1, s); const col = v == null ? WARN : INK;
    el('rect', { x: 30, y: y - 28, width: 400, height: 58, rx: 10, fill: hot ? ACCBG : PANEL, stroke: v == null ? WARN : hot ? ACC : GRID, 'stroke-width': hot ? 2.4 : 1.6, 'stroke-dasharray': v == null ? '6 4' : null }, g);
    mono(46, y - 4, 'var.' + n, { 'font-size': 15, 'font-weight': 800, fill: col }, g);
    mono(46, y + 18, ty, { 'font-size': 13.5, fill: INFO }, g);
    mono(416, y + 18, v == null ? '(필수: default 없음)' : 'default = ' + v, { 'font-size': 13.5, fill: v == null ? WARN : MUT, 'text-anchor': 'end' }, g);
    el('line', { x1: 430, y1: y, x2: MOD.x, y2: y, stroke: hot ? ACC : GRID, 'stroke-width': 2.2 }, g); }
  function module(title) { el('rect', { x: MOD.x, y: MOD.y, width: MOD.w, height: MOD.h, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.2 });
    tx(MOD.x + MOD.w / 2, MOD.y + 30, title || '모듈 (main.tf)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); }
  function s1(t, c) { const { k, u } = c;
    module();
    const n = Math.min(k + 1, 4), map = [0, 1, 1, 2, 3][k];
    for (let i = 0; i <= map; i++) slot(i, i === map && k !== 2 ? fade(u, 0.2, 0.6) : 1, i === map && k !== 2);
    tx(MOD.x + MOD.w / 2, MOD.y + 70, '입력 ' + (map + 1) + '개', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 700 });
    if (k === 0) sub(MOD.x + MOD.w / 2, MOD.y + 150, 'type · default · description', fade(u, 1.0), { fill: INK, 'font-size': 14.5 });
    if (k === 2) { const gx = 530, gy = 178; el('rect', { x: gx - 8, y: gy - 30, width: 16, height: 60, rx: 4, fill: ACC, opacity: pop(u, 0.2) });
      mono(gx, gy - 40, 'validation: ^t3\\.', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) });
      const a = seg(u, 0.6, 1.2); if (a > 0 && a < 1) fly(450, gy - 16, gx - 10, gy - 16, a, 't3.small', { mono: true, fill: GOOD });
      if (u > 1.2) { fly(gx + 10, gy - 16, MOD.x + 40, gy - 16, seg(u, 1.2, 1.6), 't3.small', { mono: true, fill: GOOD, stay: true }); }
      const b = seg(u, 1.4, 2.0); if (b > 0) { const x = b < 0.7 ? lerp(450, gx - 14, b / 0.7) : lerp(gx - 14, 470, (b - 0.7) / 0.3); card(x, gy + 22, 92, 26, { rx: 13, text: 'm5.large', fs: 13.5, mono: true, fill: BAD, stroke: 'none', color: PANEL }); }
      card(MOD.x + MOD.w / 2, 300, 270, 54, { rx: 10, text: 'plan에서 바로 실패\nerror_message 출력', fs: 14, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.0) }); }
    if (k === 3) { [['env', '"dev"']].forEach(([a, b], i) => { mono(MOD.x + 40, MOD.y + 130, 'var.tags["env"]', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
        mono(MOD.x + 40, MOD.y + 160, '→ "dev"', { 'font-size': 15, fill: ACC, 'font-weight': 800, opacity: fade(u, 1.4) }); });
      sub(MOD.x + MOD.w / 2, MOD.y + 230, '슬롯 하나에 여러 값을 묶는다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); }
    if (k === 4) { terminal(MOD.x + 10, MOD.y + 90, MOD.w - 20, 120, ['$ terraform plan', ['var.admin_email', '#fbbf24'], '  운영자 이메일 (알림 수신)', '  Enter a value: _'], Math.min(4, 4 * seg(u, 0.6, 1.8)), { fs: 13.5 });
      mono(MOD.x + MOD.w / 2, MOD.y + 250, '(예시) -input=false면 바로 실패', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) });
      tx(MOD.x + MOD.w / 2, MOD.y + 280, 'default가 없으면 필수값', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.2) }); } }

  // ---------- 값의 층 (S2·S3 공용) ----------
  const COLS = [['region', 190, 150], ['instance_type', 348, 120], ['tags', 476, 250], ['admin_email', 734, 196]];
  // layers: 위(우선) → 아래. { name, vals[4], col, enter(0~1), x: [i] 지운 칸 }
  function stack(layers, o) { o = o || {}; const y0 = o.y0 || 120, rh = 50;
    COLS.forEach(([n, x, w]) => mono(x + 8, y0 - 26, n, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: o.hiCol != null && o.hiCol !== COLS.findIndex((cc) => cc[0] === n) ? 0.35 : 1 }));
    const fin = [null, null, null, null], src = [null, null, null, null];
    layers.forEach((L, r) => { const y = y0 + r * rh + (1 - (L.enter ?? 1)) * -40, op = (L.enter ?? 1);
      if (op <= 0) return;
      tx(30, y + 28, L.name, { 'font-size': 14, 'font-weight': 700, fill: L.col || INK, opacity: op, class: L.mono ? 'mono' : null });
      COLS.forEach(([n, x, w], j) => { const v = L.vals[j], dim = o.hiCol != null && o.hiCol !== j;
        const win = v != null && fin[j] == null; if (win) { fin[j] = v; src[j] = L.col || INK; }
        el('rect', { x, y: y + 4, width: w - 8, height: rh - 10, rx: 7, fill: v == null ? 'none' : win ? PANEL : SOFT, stroke: v == null ? GRID : win ? (L.col || INK) : GRID, 'stroke-width': win ? 2 : 1.2, 'stroke-dasharray': v == null ? '3 4' : null, opacity: op * (dim ? 0.35 : 1) });
        if (v != null) mono(x + 10, y + 34, v, { 'font-size': 13.5, 'font-weight': win ? 700 : 400, fill: win ? (L.col || INK) : MUT, opacity: op * (dim ? 0.35 : 1), 'text-decoration': !win && o.strike ? 'line-through' : null }); }); });
    if (o.final !== false) { const fy = 34; tx(30, fy + 24, '최종 값', { 'font-size': 15, 'font-weight': 800, opacity: o.fop ?? 1 });
      COLS.forEach(([n, x, w], j) => { if (fin[j] == null) return; const dim = o.hiCol != null && o.hiCol !== j;
        mono(x + 10, fy + 24, fin[j], { 'font-size': 14, 'font-weight': 800, fill: src[j], opacity: (o.fop ?? 1) * (dim ? 0.35 : 1) }); });
      el('line', { x1: 30, y1: fy + 38, x2: 930, y2: fy + 38, stroke: GRID, 'stroke-width': 1.5 }); }
    return { fin, src }; }
  const DEF = ['ap-northeast-2', 't3.micro', 'env=dev', null];
  const TFV = ['ap-northeast-2', 't3.small', 'env=stg, team=be', 'ops@example.com'];
  const PROD = ['ap-northeast-2', 't3.large', 'env=prod, tier=critical', 'oncall@example.com'];

  // ---------- 2. tfvars ----------
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { const tf = k === 0 ? ['ap-northeast-2', 't3.small', null, 'ops@example.com'] : TFV;
      const layers = [];
      if (k === 2) layers.push({ name: 'tfvars.json', vals: ['ap-northeast-2', 't3.small', null, null], col: INFO, enter: E(u, 0.2, 0.9), mono: true });
      layers.push({ name: 'terraform.tfvars', vals: tf, col: ACC, enter: k === 0 ? E(u, 0.2, 0.9) : 1, mono: true });
      layers.push({ name: 'default', vals: DEF, col: MUT });
      stack(layers, { fop: k === 0 ? fade(u, 1.2) : 1, strike: k === 1, y0: 150 });
      if (k === 0) sub(480, 370, '이름이 terraform.tfvars면 옵션 없이 읽혀 default를 덮는다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 });
      if (k === 1) { const y = 330; mono(120, y + 40, '{env=dev}', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) }); mono(220, y + 40, '+', { 'font-size': 15, opacity: fade(u, 0.7) });
        mono(250, y + 40, '{env=stg, team=be}', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.8) }); mono(430, y + 40, '=', { 'font-size': 15, opacity: fade(u, 1.0) });
        mono(460, y + 40, '{env=stg, team=be}', { 'font-size': 15, fill: ACC, 'font-weight': 800, opacity: fade(u, 1.3) });
        tx(660, y + 40, '합쳐지지 않고 통째로 바뀐다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); }
      if (k === 2) sub(480, 370, 'JSON도 자동으로 읽힌다. 같은 값이면 결과도 같다', fade(u, 1.4), { fill: INK, 'font-size': 14.5 });
      return; }
    if (k === 3) { // *.auto.tfvars 사전순
      const F = ['99-secrets.auto.tfvars', '01-common.auto.tfvars', '02-network.auto.tfvars'], order = [1, 2, 0];
      tx(40, 50, '폴더 안 (순서 없음)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      F.forEach((f, i) => fileIc(70, 100 + i * 70, f, { col: f.startsWith('99') ? WARN : INK }));
      tx(560, 50, '읽는 순서 (파일 이름 사전순)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.3) });
      order.forEach((fi, r) => { const a = seg(u, 0.5 + r * 0.5, 1.0 + r * 0.5); if (a <= 0) return; const f = F[fi];
        const x = lerp(70, 600, E(a, 0, 1)), y = lerp(100 + fi * 70, 100 + r * 70, E(a, 0, 1)); fileIc(x, y, f, { col: f.startsWith('99') ? WARN : INK });
        if (a >= 1) mono(560, 106 + r * 70, String(r + 1), { 'font-size': 16, 'font-weight': 800, fill: ACC }); });
      grow(860, 100, 860, 250, E(u, 2.0, 2.5), ACC); mono(870, 290, '뒤가 이긴다', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(300, 360, '접두 번호로 순서를 눈에 보이게 고정한다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { // 자동 로드 안 되는 이름
      [['terraform.tfvars', true], ['terraform.tfvars.json', true], ['01-common.auto.tfvars', true], ['prod.tfvars', false], ['dev.tfvars', false]].forEach(([f, ok], i) => { const y = 70 + i * 62;
        fileIc(70, y, f, { col: ok ? INK : OFF, lcol: ok ? INK : MUT });
        if (ok) { grow(330, y, 560, y, E(u, 0.3 + i * 0.15, 0.8 + i * 0.15), GOOD); }
        else { mono(340, y + 5, '그냥 두면 무시', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) }); } });
      card(720, 140, 240, 70, { rx: 12, text: 'terraform\n(자동으로 읽는 것)', fs: 14.5, stroke: GOOD });
      mono(480, 380, '$ terraform apply -var-file=prod.tfvars', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      grow(600, 362, 700, 182, E(u, 1.9, 2.4), ACC, { dash: '6 5' }); return; }
    // k5 폴더 구조
    const T = [['infra/', 0, INK], ['main.tf', 1, INK], ['variable.tf', 1, INK], ['terraform.tfvars', 1, ACC, '공통 기본값'], ['secrets.auto.tfvars', 1, WARN, '.gitignore'], ['envs/', 1, INK], ['dev.tfvars', 2, INFO, '-var-file로'], ['prod.tfvars', 2, INFO, '-var-file로'], ['.gitignore', 1, INK]];
    T.forEach(([n, d, col, mm], i) => { const y = 40 + i * 40, x = 80 + d * 40, op = fade(u, 0.1 + i * 0.18);
      if (d) el('path', { d: `M${x - 26},${y - 30} V${y - 5} H${x - 6}`, fill: 'none', stroke: GRID, 'stroke-width': 1.8, opacity: op });
      mono(x, y, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
      if (mm) tx(400, y, mm, { 'font-size': 14, fill: col, opacity: op, 'font-weight': 600 });
      if (n === 'secrets.auto.tfvars') lock(380, y - 5, true, WARN, 0.6 * pop(u, 0.1 + i * 0.18 + 0.3)); });
    card(740, 200, 300, 120, { rx: 14, text: '코드(.tf)는 한 벌\n값(.tfvars)만 갈아 끼운다', fs: 15, stroke: ACC, s: pop(u, 1.9) }); }

  // ---------- 3. 명령줄 · 환경변수 ----------
  function s3(t, c) { const { k, u } = c;
    const cmdLine = (s, col) => mono(30, 400, s, { 'font-size': 14.5, 'font-weight': 800, fill: col || INK, opacity: fade(u, 0.1) });
    if (k <= 3 || k === 4) {
      let cli = [null, null, null, null], env = [null, null, null, null], tf = TFV, df = DEF, hiCol = null, enter = E(u, 0.3, 1.0), strike = true;
      if (k === 0) { cli = ['us-east-1', 't3.large', null, null]; cmdLine('$ terraform plan -var "region=us-east-1" -var "instance_type=t3.large"', ACC); }
      if (k === 1) { cli = PROD; cmdLine('$ terraform plan -var-file=envs/prod.tfvars', ACC); }
      if (k === 2) { cli = [PROD[0], u > 1.4 ? 't3.xlarge' : PROD[1], PROD[2], PROD[3]]; enter = 1; cmdLine('$ terraform apply -var-file=envs/prod.tfvars -var "instance_type=t3.xlarge"', ACC); }
      if (k === 3) { env = ['ap-northeast-2', null, null, 'sre@example.com']; enter = 1; cmdLine('$ export TF_VAR_admin_email=…  &&  terraform plan', WARN); }
      if (k === 4) { env = ['us-west-2', null, null, null]; tf = ['us-east-1', null, null, null]; df = ['ap-northeast-2', null, null, null]; cli = ['eu-west-1', null, null, null]; hiCol = 0; cmdLine('$ terraform plan -var "region=eu-west-1"   (TF_VAR_region=us-west-2)', ACC); }
      const layers = [{ name: '명령줄', vals: cli, col: ACC, enter: k === 3 ? 0 : enter }, { name: 'terraform.tfvars', vals: tf, col: INK, mono: true }, { name: 'TF_VAR_ 환경변수', vals: env, col: WARN, enter: k === 3 || k === 4 ? E(u, 0.3, 1.0) : 1 }, { name: 'default', vals: df, col: MUT }];
      stack(layers, { hiCol, strike, y0: 130 });
      tx(16, 110, '높음', { 'font-size': 13.5, fill: MUT }); tx(16, 352, '낮음', { 'font-size': 13.5, fill: MUT }); el('line', { x1: 22, y1: 116, x2: 22, y2: 336, stroke: GRID, 'stroke-width': 2 });
      if (k === 3) { const x = COLS[3][1]; el('rect', { x: x - 4, y: 226, width: 196, height: 46, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.2, opacity: fade(u, 1.4) });
        tx(x + 92, 296, 'tfvars에 밀린다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
      return; }
    if (k === 5) { // CI
      card(150, 90, 230, 60, { rx: 10, text: 'GitHub Actions\ninputs.env = prod', fs: 14, stroke: INK });
      card(150, 270, 230, 60, { rx: 10, text: 'secrets.ADMIN_EMAIL', fs: 14.5, mono: true, stroke: WARN, color: WARN });
      card(780, 180, 220, 70, { rx: 12, text: 'terraform apply', fs: 15, mono: true, stroke: ACC, color: ACC });
      grow(266, 90, 668, 165, E(u, 0.3, 1.0), ACC); mono(330, 110, '-var-file=envs/prod.tfvars', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
      grow(266, 270, 668, 198, E(u, 0.8, 1.5), WARN); mono(330, 280, 'TF_VAR_admin_email (env)', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(780, 260, '명령줄에 비밀이 남지 않는다', fade(u, 1.6), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 });
      note(480, 370, 'prod.tfvars에도 admin_email이 있으면 파일 값이 이긴다', fade(u, 2.1), { 'text-anchor': 'middle', fill: BAD });
      note(480, 400, 'env로 넣을 키는 tfvars에서 빼 둔다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    // k6: plan -out 으로 고정
    mono(30, 50, '$ terraform plan -out=tfplan -var-file=envs/prod.tfvars', { 'font-size': 14.5, 'font-weight': 800 });
    const fx = 300, fy = 180; card(fx, fy, 300, 150, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 0.3) });
    mono(fx - 135, fy - 50, 'tfplan', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
    PROD.forEach((v, i) => mono(fx - 135, fy - 18 + i * 26, COLS[i][0] + ' = ' + v, { 'font-size': 13.5, opacity: fade(u, 0.5 + i * 0.15) }));
    lock(fx + 120, fy - 52, true, ACC, pop(u, 1.1));
    mono(560, 150, '$ terraform apply tfplan -var "…"', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) });
    card(740, 220, 380, 56, { rx: 10, text: "Error: Can't set variables when\napplying a saved plan  (예시)", fs: 13.5, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.7) });
    sub(480, 370, '검토한 계획이 그대로 적용된다. 값을 끼워 넣을 틈이 없다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 4. output = 리턴값 ----------
  const OUT = [['vpc_id', '"vpc-0a1b2c3d4e5f"'], ['public_ip', '"13.124.xxx.xxx"'], ['db_endpoint', '"mydb.xxx.rds.amazonaws.com:5432"'], ['db_password', '<sensitive>']];
  const MO = { x: 40, y: 60, w: 250, h: 300 };
  function outs(n, k, u, fresh) { el('rect', { x: MO.x, y: MO.y, width: MO.w, height: MO.h, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.2 });
    tx(MO.x + MO.w / 2, MO.y + 30, '모듈', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
    OUT.slice(0, n).forEach(([nm, v], i) => { const y = 120 + i * 70, isNew = i === fresh, op = isNew ? fade(u, 0.2) : 1, sens = nm === 'db_password';
      el('line', { x1: MO.x + MO.w, y1: y, x2: 340, y2: y, stroke: sens ? BAD : GOOD, 'stroke-width': 2.4, opacity: op });
      card(MO.x + MO.w - 70, y, 130, 34, { rx: 7, text: nm, fs: 13.5, mono: true, stroke: sens ? BAD : GOOD, color: sens ? BAD : GOOD, op });
      let val = v; if (nm === 'public_ip' && k === 1 && u < 1.4) val = '(known after apply)';
      mono(350, y + 5, val, { 'font-size': 14, 'font-weight': 700, fill: sens ? BAD : INK, opacity: isNew ? fade(u, 0.6) : 1 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { outs(k + 1, k, u, k);
      if (k === 0) { mono(360, 340, 'value = aws_vpc.main.id', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
        sub(600, 390, 'output 하나 = 밖으로 내보내는 값 하나', fade(u, 1.4), { fill: INK, 'font-size': 14.5 }); }
      if (k === 1) { if (u > 1.4) { el('rect', { x: 345, y: 172, width: 160, height: 32, rx: 6, fill: GOOD, opacity: 0.18 * (1 - fade(u, 2.2)) }); }
        sub(600, 390, 'apply가 끝나야 정해지는 값도 그대로 내보낸다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); }
      if (k === 2) { const a = seg(u, 0.4, 1.4);
        [['address', 560, 340], ['port', 760, 340]].forEach(([s, x, y], i) => { if (a < 1) card(lerp(x, 520 + i * 160, a), lerp(y, 266, a), 120, 34, { rx: 8, text: s, fs: 14, mono: true, stroke: ACC, color: ACC }); });
        mono(360, 330, '"${…address}:${…port}"', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) }); }
      if (k === 3) { // 화면은 가리고 state 는 평문
        terminal(560, 60, 370, 120, ['$ terraform apply', 'Outputs:', ['db_password = <sensitive>', '#fca5a5']], Math.min(3, 3 * seg(u, 0.3, 1.2)), { fs: 13.5 });
        el('rect', { x: 560, y: 220, width: 370, height: 110, rx: 10, fill: PANEL, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.4) });
        mono(576, 246, 'terraform.tfstate', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) });
        mono(576, 280, 'db_password: 평문 그대로', { 'font-size': 14.5, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.7) });
        lock(900, 240, false, BAD, pop(u, 1.9));
        sub(745, 360, 'state는 따로 암호화 · 접근 제어해야 한다', fade(u, 2.1), { fill: BAD, 'font-weight': 700, 'font-size': 14 }); }
      return; }
    if (k === 4) { // depends_on
      tx(40, 60, 'depends_on 없이', { 'font-size': 15, 'font-weight': 800, fill: BAD }); tx(40, 230, 'depends_on = [aws_lb_listener.https]', { 'font-size': 15, 'font-weight': 800, fill: GOOD, class: 'mono', opacity: fade(u, 1.2) });
      const row = (y, outAt, col, op) => { [['aws_lb.main', 0, 180, INK], ['aws_lb_listener.https', 190, 220, INK]].forEach(([s, x0, w, cc], i) => { const a = seg(u, 0.2 + i * 0.4, 0.6 + i * 0.4);
          el('rect', { x: 200 + x0, y, width: w * a, height: 30, rx: 5, fill: cc, opacity: 0.75 * op }); if (a >= 1) mono(208 + x0, y + 21, s, { 'font-size': 13.5, fill: PANEL, 'font-weight': 700, opacity: op }); });
        const p = pop(u, outAt); card(outAt < 1 ? 470 : 700, outAt < 1 ? y - 22 : y + 15, 170, 30, { rx: 15, text: 'ready_endpoint', fs: 13.5, mono: true, stroke: col, color: col, s: p, op }); };
      row(90, 0.7, BAD, 1); row(260, 1.1, GOOD, fade(u, 1.2));
      sub(470, 160, '리스너가 붙기 전에 DNS를 내보낸다', fade(u, 1.0), { fill: BAD, 'font-weight': 700 });
      sub(480, 390, '참조로 안 드러나는 순서만 depends_on으로 건다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 5) { // for 로 목록
      [0, 1, 2].forEach((i) => { const y = 110 + i * 90; vm(100, y, pop(u, 0.1 + i * 0.15)); mono(140, y + 5, `aws_instance.worker[${i}]`, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.15) });
        fly(380, y, 640, 200 + (i - 1) * 0, seg(u, 0.9 + i * 0.3, 1.5 + i * 0.3), '.public_ip', { mono: true, fill: ACC }); });
      card(760, 200, 250, 60, { rx: 10, text: '[ ip, ip, ip ]', fs: 17, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 2.0) });
      mono(480, 380, '[for i in aws_instance.worker : i.public_ip]', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) }); return; }
    if (k === 6) { terminal(140, 50, 680, 260, ['$ terraform apply', '…', 'Apply complete!', '', 'Outputs:', '', 'vpc_id      = "vpc-0a1b2c3d4e5f"', 'public_ip   = "13.124.xxx.xxx"', ['db_password = <sensitive>', '#fca5a5']], Math.min(9, 9 * seg(u, 0.2, 2.0)), { fs: 14 });
      sub(480, 350, '(예시 · 일부) sensitive를 붙인 값만 가려진다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 7) { terminal(60, 40, 840, 300, ['$ terraform output vpc_id', '"vpc-0a1b2c3d4e5f"', '', '$ terraform output -json | jq .public_ip.value', '"13.124.xxx.xxx"', '', '$ terraform output -raw db_password', ['(평문이 그대로 나온다)', '#fca5a5']], Math.min(8, 8 * seg(u, 0.2, 2.2)), { fs: 14.5 });
      sub(480, 380, '값은 state에 남아 있어 apply 뒤에도 언제든 다시 꺼낸다 (예시 출력)', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); return; }
    // k8 모듈 → 모듈
    card(200, 200, 260, 140, { rx: 14, stroke: INK, fill: SOFT }); tx(200, 150, 'module "network"', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' });
    card(760, 200, 260, 140, { rx: 14, stroke: INK, fill: SOFT, s: pop(u, 0.4) }); tx(760, 150, 'module "app"', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.5) });
    pill(250, 220, 'output vpc_id', GOOD, 1, { mono: true, fs: 13.5 }); pill(710, 220, 'var.vpc_id', ACC, pop(u, 0.7), { mono: true, fs: 13.5 });
    grow(318, 220, 638, 220, E(u, 0.9, 1.6), ACC); dot([[318, 220], [638, 220]], seg(u, 1.6, 2.3), GOOD, 7);
    mono(480, 200, 'module.network.vpc_id', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 800, opacity: fade(u, 1.2) });
    sub(480, 330, '출력이 다음 모듈의 입력이 되고, 순서도 저절로 잡힌다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 5. 환경별 분리 ----------
  const ENV = { dev: ['ap-northeast-2', 't3.micro', '1', 'dev@example.com', 'env=dev, tier=low'], prod: ['ap-northeast-2', 't3.large', '6', 'oncall@example.com', 'env=prod, tier=critical'] };
  const KEYS = ['region', 'instance_type', 'instance_count', 'admin_email', 'tags'];
  function envCard(x, name, vals, n, o) { o = o || {}; el('rect', { x, y: 60, width: 400, height: 260, rx: 12, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 16, 88, name, { 'font-size': 15, 'font-weight': 800, fill: o.col || INK, opacity: o.op ?? 1 });
    KEYS.slice(0, n).forEach((key, i) => { const y = 128 + i * 40, diff = o.diff && ENV.dev[i] !== ENV.prod[i];
      mono(x + 16, y, key, { 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); mono(x + 150, y, vals[i], { 'font-size': 14, 'font-weight': diff ? 800 : 500, fill: diff ? (o.col || INK) : INK, opacity: (o.op ?? 1) * (o.rowOp ? o.rowOp(i) : 1) }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['main.tf', 0], ['variable.tf', 1], ['output.tf', 2]].forEach(([f, i]) => fileIc(90, 90 + i * 70, f));
      el('rect', { x: 50, y: 50, width: 260, height: 230, rx: 12, fill: 'none', stroke: INK, 'stroke-width': 2 }); tx(60, 310, '코드 한 벌', { 'font-size': 15, 'font-weight': 800 });
      ['dev.tfvars', 'stg.tfvars', 'prod.tfvars'].forEach((f, i) => { const a = pop(u, 0.5 + i * 0.3); fileIc(620, 90 + i * 70, f, { s: a, col: i === 2 ? BAD : i === 1 ? WARN : INFO }); });
      tx(580, 310, 'envs/ (값만 다르다)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4) });
      grow(320, 160, 570, 160, E(u, 1.4, 2.0), MUT, { dash: '6 5', plain: true }); return; }
    if (k <= 4) { const devN = k === 1 ? 4 : 5;
      envCard(40, 'envs/dev.tfvars', ENV.dev, devN, { col: INFO, rowOp: (i) => (k === 1 ? fade(u, 0.2 + i * 0.25) : k === 2 && i === 4 ? fade(u, 0.3) : 1) });
      if (k >= 3) envCard(520, 'envs/prod.tfvars', ENV.prod, k === 3 ? 4 : 5, { col: BAD, diff: true, rowOp: (i) => (k === 3 ? fade(u, 0.2 + i * 0.25) : k === 4 && i === 4 ? fade(u, 0.3) : 1) });
      if (k === 2) { card(720, 160, 300, 100, { rx: 12, text: '비용 집계 · 알림 라우팅\n태그 기준으로 갈린다', fs: 15, stroke: INFO, s: pop(u, 1.0) }); }
      if (k === 3) sub(480, 370, '키 구성은 같고 값만 다르다', fade(u, 1.8), { fill: INK, 'font-size': 15, 'font-weight': 700 });
      if (k === 4) sub(480, 370, 'tier=critical 하나로 알림 · 백업 정책이 달라진다', fade(u, 1.0), { fill: INK, 'font-size': 15 });
      if (k === 1) sub(480, 370, '개발은 작고 싸게', fade(u, 1.6), { fill: INK, 'font-size': 15 });
      return; }
    if (k === 5) { card(480, 70, 200, 50, { rx: 10, text: '같은 .tf 코드', fs: 15, stroke: INK });
      mono(240, 160, '-var-file=envs/dev.tfvars', { 'font-size': 14, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(720, 160, '-var-file=envs/prod.tfvars', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      grow(420, 95, 260, 140, E(u, 0.2, 0.7), INFO); grow(540, 95, 700, 140, E(u, 0.5, 1.0), BAD);
      el('rect', { x: 120, y: 190, width: 240, height: 150, rx: 12, fill: SOFT, stroke: INFO, 'stroke-width': 2 }); tx(136, 214, 'dev', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      vm(240, 280, pop(u, 1.0), INFO); mono(240, 326, 't3.micro × 1', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      el('rect', { x: 560, y: 190, width: 320, height: 150, rx: 12, fill: SOFT, stroke: BAD, 'stroke-width': 2 }); tx(576, 214, 'prod', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      for (let i = 0; i < 6; i++) vm(610 + (i % 3) * 110, 250 + Math.floor(i / 3) * 46, pop(u, 1.2 + i * 0.12), BAD);
      mono(720, 334, 't3.large × 6', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 395, '명령은 파일 이름만 다르다. plan을 먼저 보고 apply', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 6) { snippet(40, 60, ['terraform {', '  backend "s3" {', '    bucket = "my-tfstate"', '    region = "ap-northeast-2"', '    # key는 비워 둔다', '  }', '}'], { fs: 14.5, w: 360 });
      card(620, 120, 300, 54, { rx: 10, text: 'key = var.env  ← 불가', fs: 15, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.6) });
      sub(620, 172, 'backend 블록은 variable을 읽지 못한다', fade(u, 1.0), { fill: BAD, 'font-weight': 700, 'font-size': 14 });
      card(620, 270, 300, 54, { rx: 10, text: 'partial config', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.6) });
      sub(620, 320, 'key는 init 할 때 넣는다', fade(u, 1.9), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 7) { mono(30, 50, '$ terraform init -backend-config="key=dev/terraform.tfstate"', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.1) });
      mono(30, 80, '$ terraform init -backend-config="key=prod/terraform.tfstate" -reconfigure', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      el('rect', { x: 260, y: 120, width: 440, height: 240, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2 }); mono(280, 148, 's3://my-tfstate', { 'font-size': 15, 'font-weight': 800 });
      [['dev/terraform.tfstate', INFO, 0.4], ['prod/terraform.tfstate', BAD, 1.1]].forEach(([f, col, a], i) => fileIc(320, 210 + i * 80, f, { col, s: pop(u, a) }));
      sub(480, 400, 'state까지 갈라야 환경끼리 서로를 덮어쓰지 않는다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    // k8 비밀
    fileIc(110, 120, 'prod.tfvars', { col: INK }); mono(80, 186, 'db_password = "…"', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-decoration': u > 0.8 ? 'line-through' : null });
    cross(330, 160, 16, pop(u, 0.8)); sub(180, 230, 'tfvars는 커밋되는 파일', fade(u, 0.9), { fill: BAD, 'font-weight': 700 });
    card(560, 100, 260, 50, { rx: 10, text: 'Secrets Manager · Vault', fs: 14.5, stroke: WARN, color: WARN, s: pop(u, 1.1) });
    card(560, 200, 260, 50, { rx: 10, text: 'CI 시크릿', fs: 14.5, stroke: WARN, color: WARN, s: pop(u, 1.3) });
    grow(690, 125, 790, 250, E(u, 1.5, 2.0), WARN); grow(690, 200, 780, 260, E(u, 1.5, 2.0), WARN);
    card(830, 300, 220, 50, { rx: 10, text: 'TF_VAR_db_password', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 2.0) });
    sub(480, 395, '같은 키를 tfvars에 두지 않아야 env 값이 쓰인다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); }

  const quiz = [
    { q: 'variable "admin_email" 에 default가 없으면 어떻게 되나?',
      o: ['빈 문자열로 처리된다', '필수값이 되어, 값을 주지 않으면 plan이 묻거나 실패한다', 'apply 단계에서만 오류가 난다'], a: 1,
      why: 'default가 있으면 선택값, 없으면 필수값이다. 어디서도 값이 오지 않으면 plan이 대화형으로 묻고, -input=false면 실패한다.' },
    { q: 'default가 { env = "dev" }인 tags에 terraform.tfvars가 { env = "stg", team = "be" }를 주면 최종 값은?',
      o: ['{ env = "dev", team = "be" }', '{ env = "stg", team = "be" }', '{ env = "dev" }'], a: 1,
      why: 'map과 list는 합쳐지지 않고 통째로 바뀐다. tfvars에 적은 map이 그대로 최종 값이 된다.' },
    { q: 'terraform.tfvars에 admin_email = "ops@example.com" 이 있고 TF_VAR_admin_email=sre@example.com을 export 했다. plan이 쓰는 값은?',
      o: ['sre@example.com', '둘 다 쓰여 오류가 난다', 'ops@example.com'], a: 2,
      why: '환경변수는 default 바로 위 4위다. terraform.tfvars가 더 높아서 ops@example.com이 남는다.' },
    { q: 'sensitive = true를 붙인 output에 대해 맞는 설명은?',
      o: ['콘솔에서는 가려지지만 state 파일에는 평문으로 남는다', 'state 파일에서도 암호화된다', 'terraform output으로 절대 꺼낼 수 없다'], a: 0,
      why: 'sensitive는 화면 노출만 막는다. state는 따로 암호화하고 접근을 막아야 하며, -raw나 이름 지정으로는 값을 꺼낼 수 있다.' },
    { q: 'dev와 prod를 같은 코드로 운영할 때 tfvars만 나누고 빠뜨리면 사고가 나는 것은?',
      o: ['main.tf를 환경마다 복사하는 것', 'backend의 key를 환경별로 나누는 것', 'variable.tf를 환경마다 다르게 쓰는 것'], a: 1,
      why: 'state가 하나면 dev와 prod가 같은 state를 덮어쓴다. key를 비워 두고 init의 -backend-config로 환경마다 다른 key를 준다.' },
  ];

  const summary = [
    'variable은 모듈의 입력이다. default가 있으면 선택값, 없으면 꼭 넣어야 하는 값이 된다.',
    '값이 여러 곳에서 오면 명령줄, auto.tfvars, terraform.tfvars, 환경변수, default 순으로 앞이 이긴다.',
    'output은 모듈의 반환값이다. sensitive는 화면에서만 가리고 state에는 평문으로 남는다.',
    '환경은 코드 한 벌에 tfvars만 바꿔 끼우고, state도 backend key로 따로 나눈다.',
  ];
  const review = [
    { q: 'envs/prod.tfvars를 만들어 두고 terraform apply만 실행했더니 운영 사양이 아닌 값으로 만들어졌다. 원인은?',
      o: ['prod.tfvars 같은 일반 이름은 -var-file로 주지 않으면 읽히지 않는다', 'prod.tfvars보다 default가 우선이다', 'envs/ 폴더 안 파일은 JSON 이어야 한다'], a: 0,
      why: '자동으로 읽히는 것은 terraform.tfvars와 *.auto.tfvars뿐이다. 환경 파일은 일부러 일반 이름을 써서 -var-file=envs/prod.tfvars로 골라 넣는다.' },
    { q: 'terraform plan -out=tfplan으로 검토를 마친 뒤 apply tfplan에 -var를 붙였더니 오류가 났다. 이유는?',
      o: ['-var는 plan에서만 쓸 수 있는 옵션이라서', '저장한 계획에는 변수가 이미 고정되어 있어서', 'tfplan 파일이 깨져서'], a: 1,
      why: '저장한 plan은 검토한 값 그대로 적용하는 것이 목적이다. 값을 바꾸려면 plan부터 다시 만든다.' },
    { q: 'network 모듈이 만든 VPC ID를 app 모듈에 넘기려 한다. 알맞은 연결은?',
      o: ['app 모듈에서 aws_vpc.main.id를 직접 참조한다', 'VPC ID를 tfvars에 손으로 적는다', 'network에 output vpc_id를 두고 app의 입력에 module.network.vpc_id를 넣는다'], a: 2,
      why: '모듈 안 리소스는 밖에서 바로 못 본다. output으로 내보내고 module.<이름>.<output>으로 받으면 순서도 저절로 잡힌다.' },
  ];

  R.page({ title: '입력과 결과의 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
