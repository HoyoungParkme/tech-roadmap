/* IV-1-2 workspace — 코드 하나, state 여러 개. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 인스턴스 타입·개수·tfvars 값은 페이지 CODE 블록(var-switch.tf, tfvars-switch.md)에서 그대로 옮겼다.
 * workspace list 출력 순서는 local backend 소스(default 먼저, 나머지는 이름순)를 따른다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, spans, cross, check, lock, terminal, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, kk, d) => (c.k > kk ? 1 : c.k === kk ? pop(c.u, d ?? 0.2) : 0);
  const fa = (c, kk, d) => (c.k > kk ? 1 : c.k === kk ? fade(c.u, d ?? 0.2) : 0);
  const gr = (c, kk, a, b) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a ?? 0.2, b ?? 1.2) : 0);
  function fileCard(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1, st = o.stroke || INK;
    el('path', { d: `M${x},${y} H${x + w - 16} L${x + w},${y + 16} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: st, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: op });
    if (name) mono(x + 12, y + 22, name, { 'font-size': 14.5, 'font-weight': 700, fill: o.color || INK, opacity: op }); }
  // state 파일 아이콘 (가운데 기준)
  function stateDoc(cx, cy, label, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INFO;
    el('path', { d: 'M-24,-32 H12 L24,-20 V32 H-24 Z', fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2.2 }, g);
    mono(0, 2, '{ }', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    mono(0, 22, 'state', { 'font-size': 13.5, 'text-anchor': 'middle', fill: col }, g);
    if (label) mono(0, 54, label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: o.lc || INK }, g); return g; }
  const MAIN = ['resource "aws_instance" "web" {', '  ami           = "ami-0c55b159"', '  instance_type = "t3.micro"', '}'];
  // workspace 서랍 한 칸
  function slot(x, y, w, name, path, o) { o = o || {}; const on = o.on, g = R.G(x, y, 1, o.op ?? 1);
    el('rect', { x: 0, y: 0, width: w, height: 54, rx: 9, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.6 : 1.6 }, g);
    mono(16, 22, name, { 'font-size': 15, 'font-weight': 800, fill: on ? ACC : INK, 'text-decoration': o.gone ? 'line-through' : null }, g);
    mono(16, 42, path, { 'font-size': 13.5, fill: MUT }, g); }
  function star(x, y, op) { mono(x, y, '*', { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: op ?? 1 }); }

  // ---------- 1. 코드 하나, state 여러 개 ----------
  function s1(t, c) { const { k, u } = c;
    if (k !== 4) { fileCard(24, 40, 330, 150, 'main.tf  (한 벌)'); MAIN.forEach((l, i) => mono(36, 88 + i * 24, l, { 'font-size': 13.5 })); }
    if (k === 0) { ['dev', 'staging', 'prod'].forEach((e, i) => { const x = 420 + i * 175, s = pop(u, 0.2 + i * 0.25);
        fileCard(x, 70, 150, 96, e + '/main.tf', { dash: '6 5', op: clamp(s), stroke: MUT, color: MUT });
        mono(x + 14, 120, '…복붙…', { 'font-size': 13.5, fill: MUT, opacity: clamp(s) });
        if (u > 1.4) cross(x + 75, 118, 26, pop(u, 1.4 + i * 0.15)); });
      tx(670, 230, '환경 3개 · 코드는 한 벌만 두고 싶다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(670, 262, '복붙 방식은 탈락', { 'font-size': 15, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    if (k === 1) { grow(190, 180, 190, 236, E(u, 0.1, 0.5), MUT);
      const sp = E(u, 0.7, 1.7); ['dev', 'staging', 'prod'].forEach((e, i) => stateDoc(lerp(190, 120 + i * 140, sp), 290, sp > 0.9 ? e : null, { op: i === 1 ? 1 : clamp(sp * 3) }));
      tx(520, 120, '코드는 공유한다', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
      tx(520, 290, 'state만 workspace마다 나눈다', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      tx(520, 320, '전환하면 다른 디렉토리에서 실행하는 것처럼 동작', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) });
      return; }
    if (k === 2) { zone(400, 40, 530, 240, 'local backend의 저장 위치', { fill: SOFT });
      const L = ['terraform.tfstate.d/', '├── dev/terraform.tfstate', '├── staging/terraform.tfstate', '└── prod/terraform.tfstate'];
      L.forEach((l, i) => { const s = seg(u, 0.2 + i * 0.4, 0.6 + i * 0.4); mono(424, 96 + i * 40, l.slice(0, Math.round(l.length * s)), { 'font-size': 15, fill: i ? INK : INFO, 'font-weight': i ? 500 : 800 }); });
      tx(424, 262, '아직 workspace를 만들기 전 · 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
      ['dev', 'staging', 'prod'].forEach((e, i) => stateDoc(120 + i * 110, 300, e, { s: 0.75, op: 0.35 }));
      return; }
    if (k === 3) { slot(420, 70, 500, 'default', 'terraform.tfstate', { on: true, op: fade(u, 0.2) }); star(400, 108, fade(u, 0.6));
      stateDoc(190, 300, 'terraform.tfstate', { s: pop(u, 0.4) });
      tx(420, 170, 'default는 처음부터 있다', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.0) });
      tx(420, 200, '다른 workspace를 만들기 전까지 늘 활성이고, 지울 수 없다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
      return; }
    // k = 4: workspace 와 디렉토리 분리 비교
    const side = (x0, title, codes, s) => { tx(x0 + 200, 50, title, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(s * 2) });
      for (let i = 0; i < codes; i++) fileCard(x0 + (codes === 1 ? 140 : 10 + i * 135), 76, 120, 70, codes === 1 ? 'main.tf' : ['dev', 'stg', 'prod'][i] + '/main.tf', { op: clamp(s * 2) });
      ['dev', 'staging', 'prod'].forEach((e, i) => { const tx0 = x0 + 70 + i * 135;
        grow(codes === 1 ? x0 + 200 : tx0, 150, tx0, 218, seg(s, 0.4, 1), MUT); stateDoc(tx0, 258, e, { s: 0.8 * clamp(s * 1.5 - 0.3) }); });
      mono(x0 + 200, 360, `코드 ${codes} · state 3`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: codes === 1 ? ACC : WARN, opacity: clamp(s * 2 - 1) }); };
    side(20, 'workspace', 1, E(u, 0.2, 1.4)); side(500, '디렉토리 분리', 3, E(u, 1.0, 2.2));
    el('line', { x1: 480, y1: 40, x2: 480, y2: 380, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 6' }); }

  // ---------- 2. workspace new / select / delete ----------
  const TERM = [
    ['$ terraform workspace list', '* default'],
    ['$ terraform workspace new dev', 'Created and switched to workspace "dev"!'],
    ['$ terraform workspace new staging', 'Created and switched to workspace "staging"!', '$ terraform workspace new prod', 'Created and switched to workspace "prod"!'],
    ['$ terraform workspace list', '  default', '  dev', '* prod', '  staging'],
    ['$ terraform workspace select staging', 'Switched to workspace "staging".', '$ terraform workspace show', 'staging'],
    ['$ terraform workspace select default', '$ terraform workspace delete dev', 'Deleted workspace "dev"!'],
  ];
  const WS = ['default', 'dev', 'staging', 'prod'], ACT = [0, 1, 3, 3, 2, 0], BORN = [0, 1, 2, 2];
  const pathOf = (n) => (n === 'default' ? 'terraform.tfstate' : 'terraform.tfstate.d/' + n + '/terraform.tfstate');
  function s2(t, c) { const { k, u } = c;
    const all = [].concat(...TERM.slice(0, k + 1)), before = [].concat(...TERM.slice(0, k)).length;
    terminal(16, 24, 440, 380, all, before + (all.length - before) * E(u, 0.2, 1.6), { fs: 13.5, title: 'bash' });
    WS.forEach((n, i) => { if (k < BORN[i]) return; const y = 50 + i * 76, gone = i === 1 && k === 5;
      const op = BORN[i] === k ? fade(u, 0.6 + (i === 3 ? 0.6 : 0)) : 1;
      slot(500, y, 440, n, pathOf(n), { on: ACT[k] === i, op: gone ? 1 - 0.7 * fade(u, 1.6) : op, gone: gone && u > 1.6 }); });
    const yA = (i) => 50 + i * 76 + 34, py = tween(c.prev ? yA(ACT[k - 1]) : null, yA(ACT[k]), u, 0.8);
    star(484, py + 4);
    if (k === 3) tx(720, 360, 'list는 default 다음에 이름순으로 찍는다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    if (k === 5) { [['지금 활성인 workspace', 0], ['리소스가 남은 workspace (-force 없이)', 1]].forEach(([s, i]) => { const y = 358 + i * 30;
        cross(512, y - 5, 8, pop(u, 1.8 + i * 0.3)); tx(530, y, s + ' 는 못 지운다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8 + i * 0.3) }); }); } }

  // ---------- 3. terraform.workspace 로 값 분기 ----------
  const ENVS = [['dev', 't3.micro', 1], ['staging', 't3.small', 2], ['prod', 'm5.large', 4]];
  function fleet(x, y, env, type, n, s, o) { o = o || {};
    for (let i = 0; i < n; i++) server(x + (i % 2) * 64, y + Math.floor(i / 2) * 78, null, { s: 0.42 * clamp(s * n - i), stroke: o.col || INK, lamp: o.col || ACC });
    mono(x + 32, y + Math.ceil(n / 2) * 78 - 10, `${n} × ${type}`, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: o.col || INK, opacity: clamp(s * 2) }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 6) { // 전환하며 apply
      ENVS.forEach(([e, ty, n], i) => { const x = 40 + i * 310, on = Math.floor(E(u, 0.2, 2.4) * 3) === i || (u > 2.4 && i === 2), s = seg(u, 0.2 + i * 0.75, 0.9 + i * 0.75);
        slot(x, 30, 270, e, 'select ' + e + ' && apply', { on, op: 0.4 + 0.6 * clamp(s * 3) });
        fleet(x + 100, 140, e, ty, n, s); });
      tx(480, 400, '같은 코드, 다른 결과', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.3) });
      return; }
    // 위: 활성 workspace 탭
    ENVS.forEach(([e], i) => card(80 + i * 120, 40, 108, 36, { rx: 8, text: (i === 1 ? '* ' : '') + e, fs: 15, fw: 800, mono: true, stroke: i === 1 ? ACC : GRID, color: i === 1 ? ACC : MUT, fill: i === 1 ? ACCBG : PANEL }));
    mono(30, 112, 'local.env = terraform.workspace', { 'font-size': 14.5 });
    const ep = k === 0 ? E(u, 0.6, 1.5) : 1; if (k === 0) fly(200, 58, 345, 140, seg(u, 0.4, 1.4), '"staging"', { mono: true });
    if (ep >= 1 || k > 0) pill(345, 140, '"staging"', ACC, k === 0 ? pop(u, 1.4) : 1, { mono: true });
    // 가운데: 맵 표
    const tx0 = 30, ty0 = 180, cw = [120, 150, 150];
    if (k >= 1) { tx(tx0 + 130, ty0 + 2, 'instance_type_map', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fa(c, 1, 0.2), class: 'mono' }); }
    if (k >= 2) { tx(tx0 + 280, ty0 + 2, 'instance_count_map', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fa(c, 2, 0.2), class: 'mono' }); }
    ENVS.forEach(([e, ty, n], i) => { const y = ty0 + 16 + i * 46, hi = k >= 3 && i === 1;
      if (k >= 1) { if (hi) el('rect', { x: tx0 - 6, y: y - 2, width: 430, height: 40, rx: 6, fill: ACCBG, opacity: fa(c, 3, 0.3) });
        mono(tx0 + 8, y + 24, e, { 'font-size': 14.5, 'font-weight': 700, opacity: fa(c, 1, 0.2 + i * 0.2) });
        mono(tx0 + 130, y + 24, '"' + ty + '"', { 'font-size': 14.5, fill: hi ? ACC : INK, opacity: fa(c, 1, 0.5 + i * 0.3) }); }
      if (k >= 2) mono(tx0 + 280, y + 24, String(n), { 'font-size': 16, 'font-weight': 800, fill: hi ? ACC : INK, opacity: fa(c, 2, 0.4 + i * 0.3) }); });
    if (k === 2) tx(tx0, 352, 'prod만 4대', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
    // 오른쪽: 실제로 생기는 인스턴스
    if (k >= 3) { const s = k === 3 ? E(u, 0.8, 1.8) : 1; grow(470, 260, 560, 200, k === 3 ? E(u, 0.3, 0.8) : 1, ACC);
      for (let i = 0; i < 2; i++) server(640 + i * 150, 170, null, { s: 0.55 * clamp(s * 2 - i), lamp: ACC });
      mono(715, 92, 'aws_instance.web × 2', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fa(c, 3, 1.4) });
      mono(715, 116, 'instance_type = "t3.small"', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fa(c, 3, 1.6) }); }
    if (k >= 4) { ['web-staging-0', 'web-staging-1'].forEach((n, i) => pill(640 + i * 150, 230, n, INFO, at(c, 4, 0.3 + i * 0.3), { mono: true, fs: 13.5 }));
      mono(715, 272, 'Environment = "staging"', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, opacity: fa(c, 4, 1.2) }); }
    if (k >= 5) terminal(520, 300, 420, 100, ['$ terraform apply', 'summary = "[staging] 2 × t3.small"'], k === 5 ? 1 + E(u, 0.4, 1.6) : 2, { fs: 14 }); }

  // ---------- 4. 환경별 tfvars ----------
  const VARS = [['instance_type', 'string'], ['instance_count', 'number'], ['db_size', 'string']];
  const VAL = { dev: ['"t3.micro"', '1', '"db.t3.micro"'], prod: ['"m5.large"', '4', '"db.r5.xlarge"'] };
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) {
      const T = ['project/', '├── main.tf', '├── variables.tf', '└── envs/', '     ├── dev.tfvars', '     ├── staging.tfvars', '     └── prod.tfvars'];
      T.forEach((l, i) => { const hi = (k === 2 && i === 4) || (k === 3 && i === 6);
        mono(30, 70 + i * 32, l, { 'font-size': 14.5, 'font-weight': hi ? 800 : 500, fill: hi ? ACC : INK, opacity: k === 0 ? fade(u, 0.2 + i * 0.2) : 1 }); });
      if (k === 0) { fileCard(360, 60, 560, 150, 'main.tf');
        mono(376, 110, 'instance_type_map = { dev = …, prod = … }', { 'font-size': 14, fill: MUT });
        el('line', { x1: 376, y1: 105, x2: lerp(376, 740, E(u, 1.0, 1.6)), y2: 105, stroke: BAD, 'stroke-width': 2.4 });
        mono(376, 150, 'instance_type = var.instance_type', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.7) });
        mono(376, 176, 'count         = var.instance_count', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.9) });
        tx(640, 270, '환경이 늘어도 main.tf는 그대로', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
        return; }
      // 변수 선언과 값 칸
      tx(360, 52, 'variables.tf — 선언만', { 'font-size': 15, 'font-weight': 800 });
      if (k >= 2) tx(640, 52, 'dev.tfvars', { 'font-size': 15, 'font-weight': 800, fill: GOOD, class: 'mono', opacity: fa(c, 2, 0.2) });
      if (k >= 3) tx(800, 52, 'prod.tfvars', { 'font-size': 15, 'font-weight': 800, fill: WARN, class: 'mono', opacity: fa(c, 3, 0.2) });
      VARS.forEach(([n, ty], i) => { const y = 80 + i * 74;
        card(470, y + 22, 220, 50, { rx: 8, stroke: GRID, sw: 1.5, s: k === 1 ? pop(u, 0.2 + i * 0.25) : 1 });
        mono(372, y + 20, n, { 'font-size': 14.5, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.3 + i * 0.25) : 1 });
        mono(372, y + 40, 'type = ' + ty, { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 0.3 + i * 0.25) : 1 });
        [['dev', 2, 640, GOOD], ['prod', 3, 800, WARN]].forEach(([e, kk, x, col]) => { if (k < kk) { if (k === 1 && e === 'dev') mono(x + 50, y + 30, '?', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); return; }
          const s = kk === k ? seg(u, 0.3 + i * 0.4, 0.9 + i * 0.4) : 1;
          if (kk === k && s < 1) fly(x + 60, 30, x + 60, y + 24, s, VAL[e][i], { mono: true, fill: col });
          else pill(x + 60, y + 24, VAL[e][i], col, kk === k ? pop(u, 0.9 + i * 0.4) : 1, { mono: true, fs: 13.5 }); }); });
      if (k === 1) tx(360, 330, '값이 없으면 apply가 값을 묻고, 입력이 없는 CI에서는 실패한다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      if (k >= 2) tx(360, 330, 'staging.tfvars도 같은 변수 이름에 값만 다르다', { 'font-size': 14.5, fill: MUT, opacity: fa(c, 2, 2.0) });
      return; }
    if (k === 4) { // state 선택과 값 선택이 짝이 맞아야 한다
      const row = (y, ws, vf, ok, s) => { card(150, y, 220, 50, { rx: 9, text: 'select ' + ws, fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO, s });
        tx(150, y + 44, 'state 선택', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: clamp(s) });
        card(430, y, 280, 50, { rx: 9, text: '-var-file=' + vf, fs: 14.5, mono: true, fw: 800, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, s });
        tx(430, y + 44, '값 선택', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: clamp(s) }); };
      row(90, 'prod', 'envs/prod.tfvars', true, pop(u, 0.2)); check(620, 90, 14, pop(u, 0.8));
      row(240, 'prod', 'envs/dev.tfvars', false, pop(u, 1.0)); cross(620, 240, 14, pop(u, 1.4));
      card(800, 240, 240 * 0.9, 120, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 1.6) });
      ['prod state (4 × m5.large)', '+ dev 값 (1 × t3.micro)', '~ 1 change', '- 3 destroy'].forEach((l, i) => mono(704, 206 + i * 24, l, { 'font-size': 13.5, 'font-weight': i > 1 ? 800 : 500, fill: i === 2 ? WARN : i === 3 ? BAD : INK, opacity: fade(u, 1.8 + i * 0.15) }));
      tx(800, 330, '어긋나면 이런 plan이 나온다 (예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.3) });
      return; }
    // k = 5: CI matrix
    mono(40, 60, 'matrix.env = [dev, staging, prod]', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    ['dev', 'staging', 'prod'].forEach((e, i) => { const y = 120 + i * 90, s = seg(u, 0.3 + i * 0.4, 1.0 + i * 0.4);
      grow(150, 74, 150, y - 4, i === 0 ? s : 0, MUT);
      card(150, y + 20, 160, 44, { rx: 22, text: 'job: ' + e, fs: 14.5, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.3 + i * 0.4) });
      grow(232, y + 20, 290, y + 20, s, ACC);
      mono(300, y + 12, 'workspace select ' + e, { 'font-size': 14, opacity: clamp(s * 2 - 0.5) });
      mono(300, y + 34, 'apply -var-file=envs/' + e + '.tfvars', { 'font-size': 14, opacity: clamp(s * 2 - 0.8) }); });
    tx(700, 210, '환경 이름 하나가', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
    tx(700, 238, 'state와 값을 함께 고른다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); }

  // ---------- 5. 한계와 권장 구조 ----------
  function bucket(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || WARN;
    el('path', { d: 'M-60,-30 L-48,40 H48 L60,-30 Z', fill: o.fill || WARNBG, stroke: col, 'stroke-width': 2.4 }, g);
    el('ellipse', { cx: 0, cy: -30, rx: 60, ry: 10, fill: PANEL, stroke: col, 'stroke-width': 2.4 }, g);
    if (name) mono(0, 64, name, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 130, 820, 120, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) });
      tx(100, 118, '"Workspaces are not appropriate for system decomposition', { 'font-size': 17, 'font-style': 'italic', opacity: fade(u, 0.5) });
      tx(100, 148, ' or deployments requiring separate credentials and access controls."', { 'font-size': 17, 'font-style': 'italic', opacity: fade(u, 0.7) });
      tx(860, 178, 'HashiCorp, Terraform 문서 (State: Workspaces)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.9) });
      tx(480, 270, '자격 증명과 접근 권한이 달라야 하는 배포에는 workspace를 쓰지 않는다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
      tx(480, 310, '아래 세 한계를 차례로 본다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      return; }
    if (k === 1) { bucket(620, 150, 's3://같은 버킷', { s: pop(u, 0.2) });
      ['terraform.tfstate', 'env:/dev/terraform.tfstate', 'env:/prod/terraform.tfstate'].forEach((s, i) => mono(700, 110 + i * 34, s, { 'font-size': 14, 'font-weight': i === 2 ? 800 : 500, fill: i === 2 ? BAD : INK, opacity: fade(u, 0.5 + i * 0.25) }));
      R.person(140, 160, '개발자 (dev 권한)', {}); card(140, 260, 200, 36, { rx: 8, text: '같은 IAM role', fs: 14, stroke: GRID, s: pop(u, 0.6) });
      dot([[170, 150], [450, 150], [690, 178]], seg(u, 1.0, 2.0), BAD, 7);
      grow(170, 150, 548, 150, E(u, 1.0, 1.6), BAD);
      pill(330, 330, 'workspace select prod && destroy', BAD, pop(u, 2.0), { mono: true, fs: 13.5 });
      tx(620, 262, 'S3 backend는 workspace state를 env:/ 아래에 둔다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      return; }
    if (k === 2) { [['dev 계정', 230, INFO], ['prod 계정', 730, WARN]].forEach(([n, x, col], i) => { zone(x - 170, 60, 340, 220, n, { fill: SOFT, stroke: col, op: fade(u, 0.2 + i * 0.3) });
        server(x - 90, 130, null, { s: 0.5 * pop(u, 0.4 + i * 0.3), lamp: col }); mono(x - 90, 166, i ? '계정 B' : '계정 A', { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.5 + i * 0.3) }); });
      card(480, 340, 300, 50, { rx: 9, text: 'provider "aws" { … } 한 벌', fs: 15, mono: true, fw: 700, s: pop(u, 0.8) });
      grow(400, 314, 260, 282, E(u, 1.2, 1.7), INFO);
      grow(560, 314, 700, 282, E(u, 1.6, 2.1), BAD, { dash: '6 5' });
      tx(700, 190, '같은 provider 설정으로는', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(700, 216, '계정이 갈리지 않는다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(700, 250, 'assume_role 분기는 지저분해진다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      return; }
    if (k === 3) { fileCard(40, 150, 260, 110, 'main.tf'); mono(56, 210, '한 줄 실수', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      for (let r = 0; r < 3; r++) { const rr = E(u, 0.3 + r * 0.4, 1.6 + r * 0.4) * 520; if (rr > 0) el('circle', { cx: 170, cy: 205, r: rr, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: 0.5 * (1 - rr / 560) }); }
      ['default', 'dev', 'staging', 'prod'].forEach((n, i) => { const hit = u > 0.9 + i * 0.3; slot(520, 50 + i * 80, 400, n, hit ? '같은 변경이 적용된다' : '', { on: false });
        if (hit) cross(890, 77 + i * 80, 10, pop(u, 0.9 + i * 0.3)); });
      tx(170, 330, '코드 공유가 곧 영향 범위', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      return; }
    if (k === 4) { const T = [['infra/', 0], ['modules/', 1], ['web-app/  재사용 모듈', 2, ACC], ['envs/', 1], ['dev/      main.tf · backend.tf · terraform.tfvars', 2], ['staging/  main.tf · backend.tf · terraform.tfvars', 2], ['prod/     main.tf · backend.tf · terraform.tfvars', 2, WARN]];
      T.forEach(([s, d, col], i) => mono(60 + d * 36, 70 + i * 40, (d ? '└ ' : '') + s, { 'font-size': 15, 'font-weight': d < 2 ? 800 : 600, fill: col || INK, opacity: fade(u, 0.2 + i * 0.22) }));
      tx(60, 370, '본체는 modules/ 한 곳, 환경 폴더는 module 호출과 backend만', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      return; }
    if (k === 5) { bucket(260, 160, 'dev 버킷', { col: INFO, fill: INFOBG, s: pop(u, 0.2) }); bucket(700, 160, 'prod 버킷', { s: pop(u, 0.5) });
      lock(700, 260, true, WARN, pop(u, 0.9)); mono(700, 300, 'prod 전용 IAM', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) });
      R.person(80, 330, 'dev 권한', {}); grow(110, 320, 230, 220, E(u, 1.0, 1.5), INFO);
      grow(110, 330, lerp(110, 620, E(u, 1.5, 2.1)), 300, 1, BAD, { plain: true }); if (u > 2.1) cross(620, 300, 14, pop(u, 2.1));
      tx(480, 400, '권한 경계를 디렉토리와 backend로 긋는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) });
      return; }
    if (k === 6) { const L = [['pr-123', 0.2, 1.5], ['feature-login', 0.6, 2.2], ['ci-${BUILD_ID}', 1.0, 1.7], ['dev-alice', 1.4, 2.9]];
      el('line', { x1: 260, y1: 340, x2: 920, y2: 340, stroke: MUT, 'stroke-width': 2 }); tx(920, 366, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      L.forEach(([n, a, b], i) => { const y = 70 + i * 64, x0 = 260 + a * 200, cur = Math.min(u, b), live = u < b;
        mono(40, y + 18, n, { 'font-size': 15, 'font-weight': 800, fill: live ? ACC : MUT, opacity: u > a ? 1 : 0.3 });
        if (u > a) el('rect', { x: x0, y, width: (cur - a) * 200, height: 26, rx: 6, fill: live ? ACC : OFF, opacity: 0.8 });
        if (!live) mono(x0 + (b - a) * 200 + 8, y + 18, 'delete', { 'font-size': 13.5, fill: MUT }); });
      tx(260, 396, '수명이 짧고 권한이 같은 슬롯에 맞는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    // k = 7: 결론표
    const rows = [['dev / staging / prod 분리', '디렉토리 분리', GOOD], ['PR 미리보기 · 임시 검증', 'workspace', ACC], ['AWS 계정이 갈린다', '디렉토리 + backend 분리', GOOD], ['학습 · 실습', 'workspace로 시작', ACC]];
    rows.forEach(([a, b, col], i) => { const y = 70 + i * 74, s = pop(u, 0.2 + i * 0.35);
      card(250, y, 420, 56, { rx: 10, text: a, fs: 16, fw: 700, stroke: GRID, s }); grow(465, y, 560, y, seg(u, 0.4 + i * 0.35, 0.8 + i * 0.35), MUT);
      card(740, y, 340, 56, { rx: 28, text: b, fs: 16, fw: 800, stroke: col, color: col, s: pop(u, 0.6 + i * 0.35) }); }); }

  const quiz = [
    { q: 'workspace를 나누면 환경마다 따로 생기는 것은 무엇인가?',
      o: ['.tf 코드 사본', 'state 파일', 'provider 플러그인'], a: 1,
      why: '코드는 한 벌을 같이 쓰고 state만 갈린다. local backend라면 terraform.tfstate.d/<이름>/terraform.tfstate에 쌓인다.' },
    { q: 'workspace new dev, new staging, new prod를 차례로 친 직후 활성 workspace는 무엇인가?',
      o: ['default', 'dev', 'prod'], a: 2,
      why: 'new는 만들고 바로 전환한다. 마지막에 만든 prod에 * 가 붙는다.' },
    { q: 'staging workspace에서 local.instance_count_map[terraform.workspace]의 값은 무엇인가?',
      o: ['2', '1', '4'], a: 0,
      why: 'terraform.workspace가 "staging"이므로 맵에서 staging 키를 찾고, 값은 2다. 그래서 t3.small 2대가 만들어진다.' },
    { q: 'workspace select prod 상태에서 -var-file=envs/dev.tfvars로 apply하면 어떤 일이 생기는가?',
      o: ['Terraform이 짝이 안 맞는다며 자동으로 거부한다', 'dev state가 대신 쓰인다', 'prod 리소스가 dev 값에 맞춰 줄어드는 plan이 나온다'], a: 2,
      why: 'state 선택과 값 선택은 서로를 모른다. prod state 4대에 dev 값(1대)을 넣으면 3대를 지우는 plan이 된다.' },
    { q: 'HashiCorp가 workspace를 권하지 않는 경우는 무엇인가?',
      o: ['환경마다 자격 증명과 접근 권한이 달라야 할 때', 'PR마다 잠깐 띄우는 미리보기 환경', '개발자별 개인 작업 공간'], a: 0,
      why: '모든 workspace가 같은 backend와 provider 설정을 쓰므로 권한 경계를 나눌 수 없다. 그런 분리는 디렉토리와 backend로 한다.' },
  ];

  const summary = [
    'workspace는 코드 한 벌에 state 파일만 여러 개 두는 방법이다.',
    'new는 만들고 바로 전환하고, select는 전환만 하며, * 가 붙은 곳이 apply 대상이다.',
    'terraform.workspace 값을 맵의 키로 써서 환경별 타입과 개수를 고른다.',
    '권한이나 계정이 달라야 하는 dev와 prod는 디렉토리와 backend를 따로 둔다.',
  ];
  const review = [
    { q: 'dev에서 실험하려고 apply했는데 prod 인스턴스가 바뀌었다. 먼저 확인할 것은?',
      o: ['terraform workspace show로 활성 workspace가 무엇이었는지', 'provider 버전이 올라갔는지', 'main.tf의 resource 이름이 바뀌었는지'], a: 0,
      why: '같은 코드가 * 가 붙은 workspace의 state를 바라본다. 마지막에 prod를 만들거나 고른 채로 두면 apply가 prod에 간다.' },
    { q: 'CI에서 workspace select와 -var-file을 따로 적다가 사고가 났다. 가장 적은 수정으로 막는 방법은?',
      o: ['환경마다 main.tf를 복사한다', 'matrix의 환경 이름 하나로 select와 -var-file을 함께 만든다', 'tfvars 파일을 하나로 합친다'], a: 1,
      why: '같은 변수에서 두 값을 만들면 state 선택과 값 선택이 어긋날 수 없다.' },
    { q: 'prod는 별도 AWS 계정과 IAM으로 막아야 한다는 요구가 왔다. 어떤 구조가 맞는가?',
      o: ['workspace를 하나 더 만들고 이름을 prod-secure로 한다', 'main.tf에 terraform.workspace로 provider를 분기한다', 'envs/prod 디렉토리에 자기 backend.tf와 자격 증명을 둔다'], a: 2,
      why: 'workspace는 backend와 provider 설정을 공유한다. 권한 경계는 환경 디렉토리마다 backend를 따로 두어 긋는다.' },
  ];

  R.page({ title: 'workspace와 state 슬롯', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
