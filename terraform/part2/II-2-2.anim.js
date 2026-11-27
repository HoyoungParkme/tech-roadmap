/* II-2-2 plan / apply / destroy 라이프사이클 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * plan 의 +/~/-/+/- 개수, apply 물결(병렬)·destroy 역순 물결, -target 범위(plan·apply 는 대상+대상이 의존하는 것, destroy 는 대상+대상에 의존하는 것),
 * drift 뒤 일반 plan 의 ~ 1건은 공식 문서 규칙을 파이썬으로 재현해 맞췄다 (예시 main.tf: aws_instance.web 이 aws_security_group.web_sg.id 를 참조).
 * terraform 을 돌리지 못해 터미널 출력과 provider 버전 숫자는 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, snippet, spans, terminal, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 그림 부품 ----------
  function bucketI(cx, cy, s, col, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s, o.op, o.p), c = col || INK;
    el('path', { d: 'M-17,-12 L-12,16 H12 L17,-12', fill: PANEL, stroke: c, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: 0, cy: -12, rx: 17, ry: 5, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g);
    if (o.objs) [[-8, 2], [-1, 6], [5, 0]].forEach(([x, y]) => el('rect', { x, y, width: 6, height: 6, rx: 1, fill: c }, g)); }
  function shieldI(cx, cy, s, col, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s, o.op, o.p), c = col || INK;
    el('path', { d: 'M0,-18 L15,-11 V2 Q15,13 0,19 Q-15,13 -15,2 V-11 Z', fill: PANEL, stroke: c, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M-6,0 L-1,5 L7,-5', fill: 'none', stroke: c, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g); }
  function vmI(cx, cy, s, col, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s, o.op, o.p), c = col || INK;
    el('rect', { x: -18, y: -15, width: 36, height: 24, rx: 4, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g);
    el('path', { d: 'M-8,15 H8 M0,9 V15', stroke: c, 'stroke-width': 2.4 }, g);
    el('circle', { cx: 10, cy: -7, r: 3.5, fill: o.off ? OFF : GOOD }, g); }
  function dbI(cx, cy, s, col, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s, o.op, o.p), c = col || INK;
    el('path', { d: 'M-16,-11 V11 A16,5 0 0 0 16,11 V-11', fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g);
    el('ellipse', { cx: 0, cy: -11, rx: 16, ry: 5, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); }
  function fileG(cx, cy, col, dir, s) { const g = R.G(cx, cy, s ?? 1), c = col || INK;
    if (dir) el('path', { d: 'M-11,-8 H-3 L0,-5 H11 V9 H-11 Z', fill: PANEL, stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    else { el('path', { d: 'M-8,-10 H3 L8,-5 V10 H-8 Z', fill: PANEL, stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g); el('path', { d: 'M3,-10 V-5 H8', fill: 'none', stroke: c, 'stroke-width': 1.6 }, g); } }

  // 예시 main.tf 의 리소스 세 개 (행 순서: logs, web, web_sg)
  const RS = [
    { key: 'logs', addr: 'aws_s3_bucket.logs', id: 'logs-2026', ic: bucketI, code: 'bucket = "logs-2026"' },
    { key: 'web', addr: 'aws_instance.web', id: 'i-0abc123', ic: vmI, code: 'ami · instance_type' },
    { key: 'sg', addr: 'aws_security_group.web_sg', id: 'sg-0def', ic: shieldI, code: 'name · tags' },
  ];
  const CX = [30, 320, 610], CW = 270, RY = [130, 198, 266], RH = 56;
  const H3 = [['.tf 코드', '원하는 상태'], ['tfstate', '알고 있는 상태'], ['실제 클라우드', '현재 상태']];
  function heads(titles, o) { o = o || {}; titles.forEach(([a, b], i) => { const x = (o.cx || CX)[i], op = o.op ? o.op[i] ?? 1 : 1;
    tx(x, 50, a, { 'font-size': 16, 'font-weight': 800, fill: i === 2 ? INFO : INK, opacity: op, class: i < 2 ? 'mono' : null });
    tx(x + tw(a, 16) + 10, 50, b, { 'font-size': 13.5, fill: MUT, opacity: op });
    el('line', { x1: x, y1: 66, x2: x + CW, y2: 66, stroke: GRID, 'stroke-width': 1.5, opacity: op }); }); }
  // 한 칸: 열 i, 행 r. a = 굵은 첫 줄, b = 둘째 줄
  function cell(i, r, a, b, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const x0 = (o.cx || CX)[i];
    const g = R.G(x0 + CW / 2, RY[r], s, o.op);
    el('rect', { x: -CW / 2, y: -RH / 2, width: CW, height: RH, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash }, g);
    let lx = -CW / 2 + 12; if (o.ic) { o.ic(-CW / 2 + 28, 0, 0.9, o.icol || o.stroke || INK, { p: g, off: o.off, objs: o.objs }); lx += 40; }
    if (a) R.mono(lx, b ? -5 : 5, a, { 'font-size': 14, 'font-weight': 700, fill: o.acol || INK }, g);
    if (b) R.mono(lx, 17, b, { 'font-size': 13.5, fill: o.bcol || MUT, 'font-weight': o.bcol ? 700 : 400 }, g); }
  // 아이콘 함수들이 부모 g 안에 그릴 수 있게 (o.p)
  const SYM = { '+': [GOOD, GOODBG], '~': [WARN, WARNBG], '-': [BAD, BADBG], '-/+': [BAD, BADBG], '<=': [INFO, INFOBG] };
  const sym = (x, y, s, sc) => sc > 0 && pill(x, y, s, SYM[s][0], sc, { mono: true, fs: 15, fill: SYM[s][1] });
  // Plan: a to add, c to change, d to destroy.
  function planLine(cx, y, a, c, d, o) { o = o || {}; const fs = o.fs || 17, s = `Plan: ${a} to add, ${c} to change, ${d} to destroy.`, x = cx - tw(s, fs) / 2;
    const e = spans(x, y, [['Plan: ', { fill: INK }], [a + ' to add', { fill: GOOD, 'font-weight': 700 }], [', ', {}], [c + ' to change', { fill: WARN, 'font-weight': 700 }], [', ', {}], [d + ' to destroy', { fill: BAD, 'font-weight': 700 }], ['.', {}]], { 'font-size': fs, opacity: o.op ?? 1 });
    // destroy 부분의 실제 위치 (고정폭 글꼴 폭이 어림과 달라 직접 잰다)
    let dx = x, dw = 0; try { const i0 = s.indexOf(d + ' to destroy'), r0 = e.getExtentOfChar(i0), r1 = e.getExtentOfChar(i0 + (d + ' to destroy').length - 1); dx = r0.x; dw = r1.x + r1.width - r0.x; } catch (er) { /* 무시 */ }
    return { x, dx, dw }; }

  // ---------- 1. init ----------
  const TREE = [['main.tf', 0, 0, false], ['.terraform/', 0, 1, true], ['providers/', 1, 1, true], ['hashicorp/aws 5.x', 2, 1, true], ['.terraform.lock.hcl', 0, 2, false]];
  function tree(k, u, o) { o = o || {}; zone(30, 40, 360, 290, '작업 폴더');
    TREE.forEach(([s, ind, at, dir], i) => { if (k < at) return; const y = 92 + i * 46;
      const a = k === at && at === 1 ? seg(u, 1.2 + (i - 1) * 0.3, 1.5 + (i - 1) * 0.3) : k === at && at === 2 ? seg(u, 0.2, 0.6) : 1; if (a <= 0) return;
      const col = (o.bad || []).includes(i) ? BAD : (o.hi || []).includes(i) ? ACC : INK, x = 66 + ind * 26;
      if (ind) el('path', { d: `M${x - 18},${y - 26} V${y} H${x - 12}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: a });
      fileG(x, y, col, dir, a); mono(x + 20, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: a });
      if (o.ok && i >= 1) check(360, y, 8, a); }); }
  function s1(t, c) { const { k, u } = c;
    tree(k, u, { hi: k === 1 ? [3] : k === 2 ? [4] : k === 3 ? [4] : [], bad: k === 4 ? [3, 4] : [], ok: k === 5 });
    if (k === 0) { const L = ['terraform {', '  required_providers {', '    aws = {', '      source  = "hashicorp/aws"', '      version = "~> 5.0"', '    }', '  }', '}'];
      grow(180, 92, 430, 92, E(u, 0.1, 0.5), MUT);
      snippet(440, 50, L, { fs: 14.5, w: 420 });
      const sc = E(u, 0.5, 1.6) * 7, row = Math.min(7, Math.floor(sc)), hit = u > 1.6;
      [hit ? 3 : row, ...(hit ? [4] : [])].forEach((r) => el('rect', { x: 446, y: 58 + r * 22.5, width: 408, height: 22, rx: 4, fill: ACC, opacity: hit ? 0.18 : 0.12 }));
      pill(650, 290, '받을 것: hashicorp/aws (~> 5.0)', ACC, pop(u, 1.8), { mono: true, fs: 14.5 });
      sub(650, 330, '.tf가 없는 폴더에서는 받을 것도 없다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 1) { card(800, 110, 230, 46, { rx: 23, text: 'registry.terraform.io', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      el('path', { d: 'M685,110 Q520,110 390,220', fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      sub(560, 96, '네트워크', fade(u, 0.4), { fill: INFO, 'font-weight': 700 });
      const p = E(u, 0.5, 1.4); if (p > 0 && p < 1) card(lerp(800, 330, p), lerp(150, 230, p), 150, 30, { rx: 15, text: 'hashicorp/aws', fs: 13.5, mono: true, fill: ACC, stroke: 'none', color: PANEL });
      note(440, 300, 'plan · apply는 이제 받아 둔 플러그인을 쓴다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) { const L = [['provider "registry.terraform.io/hashicorp/aws" {', INK], ['  version     = "5.0.0"', ACC], ['  constraints = "~> 5.0"', INK], ['  hashes = [ "h1:…", "zh:…", … ]', ACC], ['}', INK]];
      el('rect', { x: 430, y: 50, width: 500, height: 176, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.3) });
      mono(446, 76, '.terraform.lock.hcl', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      L.forEach(([s, col], i) => mono(446, 106 + i * 24, s, { 'font-size': 14, fill: col, 'font-weight': col === ACC ? 700 : 400, opacity: fade(u, 0.5 + i * 0.2) }));
      grow(680, 230, 680, 278, E(u, 1.5, 1.9), GOOD);
      pill(680, 300, 'git commit', GOOD, pop(u, 1.9), { mono: true, fs: 14.5 }); check(760, 300, 9, pop(u, 2.1));
      sub(680, 340, '팀원 모두 같은 버전·해시로 init 한다 (버전 값은 예시)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { const x0 = 470, W = 420, X = (v) => x0 + (v - 5) * W;
      note(440, 60, 'terraform init -upgrade', 1, { class: 'mono', 'font-size': 15.5, 'font-weight': 800, fill: ACC });
      el('rect', { x: x0, y: 92, width: W, height: 30, rx: 6, fill: ACCBG, opacity: fade(u, 0.2) });
      sub(x0 + W / 2, 112, '~> 5.0이 허용하는 범위 (6.0 미만)', fade(u, 0.3), { fill: ACC, 'font-weight': 700 });
      el('line', { x1: x0, y1: 138, x2: x0 + W + 30, y2: 138, stroke: MUT, 'stroke-width': 1.8 });
      [[5, '5.0'], [6, '6.0']].forEach(([v, s]) => { el('line', { x1: X(v), y1: 133, x2: X(v), y2: 143, stroke: MUT, 'stroke-width': 1.8 }); mono(X(v), 162, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      const v = tween(5.0, 5.1, u, 1.2), nx = X(v);
      el('path', { d: `M${nx},130 l-7,-12 h14 z`, fill: INK });
      mono(nx + 12, 186, 'lock: ' + (v < 5.099 ? '5.0.0' : '5.1.0'), { 'font-size': 14, 'font-weight': 700, fill: v < 5.099 ? INK : ACC });
      note(440, 250, 'terraform init -reconfigure', fade(u, 1.4), { class: 'mono', 'font-size': 15.5, 'font-weight': 800, fill: INFO });
      card(560, 300, 220, 40, { rx: 8, text: 'backend 옛 설정', fs: 14, stroke: OFF, color: MUT, dash: '5 4', s: pop(u, 1.5) }); cross(560, 300, 9, pop(u, 1.9));
      card(820, 300, 200, 40, { rx: 8, text: 'backend 새 설정', fs: 14, stroke: INFO, color: INFO, s: pop(u, 1.8) });
      sub(690, 352, 'state는 옮기지 않고 새로 잡는다 (옮길 땐 -migrate-state)', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 4) { grow(390, 170, 470, 116, E(u, 0.2, 0.6), BAD, { dash: '6 5', plain: true }); cross(432, 143, 9, pop(u, 0.6));
      card(690, 110, 440, 64, { rx: 10, text: 'Error: Failed to query available\nprovider packages', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.5) });
      sub(690, 166, '네트워크 · 프록시를 본다', fade(u, 0.9), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
      grow(390, 276, 470, 248, E(u, 1.1, 1.4), BAD, { plain: true });
      card(690, 250, 440, 52, { rx: 10, text: 'Error: Inconsistent dependency lock file', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.3) });
      sub(690, 300, 'required_providers와 lock이 어긋남 · init -upgrade', fade(u, 1.7), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
      note(480, 380, '둘 다 코드가 아니라 환경 문제다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    // k5 몇 번 해도 같은 결과
    terminal(430, 46, 500, 170, ['$ terraform init', '- Reusing previous version of hashicorp/aws', '  from the dependency lock file', '- Using previously-installed hashicorp/aws v5.0.0', 'Terraform has been successfully initialized!'], Math.min(5, 5 * seg(u, 0.2, 1.3)), { fs: 13.5, title: '(출력 예시)' });
    ['1회', '2회', '3회'].forEach((s, i) => { pill(540 + i * 110, 262, 'init ' + s, INK, pop(u, 1.3 + i * 0.3), { fs: 14 }); check(590 + i * 110, 262, 7, pop(u, 1.4 + i * 0.3)); });
    sub(680, 312, '.terraform/는 그대로 · 다시 받지 않는다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // ---------- 2. plan ----------
  function planBase(k, u, o) { o = o || {}; const op = o.op ?? 1;
    heads(H3, { op: [op, op, op] }); mono(920, 50, 'plan', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: op });
    RS.forEach((r, i) => { const off = o.off && o.off(i), cop = op * (off ? 0.32 : 1);
      const b = o.code ? o.code(i) : r.code;
      cell(0, i, r.addr, b, { s: k === 0 && !o.static ? pop(u, 0.2 + i * 0.2) : 1, op: cop, stroke: o.hiRow === i ? ACC : GRID, bcol: o.bcol && o.bcol(i) });
      const sw = k === 0 && !o.static ? E(u, 1.1 + i * 0.35, 1.5 + i * 0.35) : 1;
      if (sw > 0 && sw < 1) el('rect', { x: 30, y: RY[i] - RH / 2 - 3, width: 850 * sw, height: RH + 6, rx: 8, fill: ACC, opacity: 0.08 });
      const sc = k === 0 && !o.static ? pop(u, 1.5 + i * 0.35) : 1;
      if (off) mono(920, RY[i] + 5, '제외', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op });
      else if (!(o.noSym && o.noSym(i))) sym(920, RY[i], '+', sc * (op > 0.5 ? 1 : op * 2)); });
    const eo = (k === 0 && !o.static ? fade(u, 0.8) : 1) * op;
    [1, 2].forEach((i) => { el('rect', { x: CX[i], y: RY[0] - RH / 2, width: CW, height: RY[2] - RY[0] + RH, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 1.6, 'stroke-dasharray': '6 5', opacity: eo });
      sub(CX[i] + CW / 2, RY[1] + 5, i === 1 ? '(비어 있음 · 첫 plan)' : '(아직 아무것도 없다)', eo, { 'font-size': 14.5 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { planBase(k, u); note(480, 340, 'plan은 계산만 한다 · 클라우드도 state도 그대로', fade(u, 2.4), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { planBase(k, u); const n = Math.round(tween(0, 3, u, 1.0)), P = planLine(480, 350, n, 0, 0, { fs: 18 });
      el('rect', { x: P.dx - 6, y: 328, width: P.dw + 12, height: 32, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.4, opacity: fade(u, 1.5) });
      note(P.dx + P.dw / 2, 392, 'destroy가 0 인지부터 본다', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD }); return; }
    if (k === 2) { const shrink = E(u, 0.2, 1.0); planBase(k, u, { op: 1 - 0.65 * shrink, static: true, noSym: (i) => u > 0.2 + i * 0.15 });
      RS.forEach((r, i) => fly(920, RY[i], 250, 350, seg(u, 0.2 + i * 0.15, 1.0 + i * 0.15), '+ ' + r.key, { fill: GOOD, mono: true }));
      card(250, 350, 210, 48, { rx: 10, text: 'tfplan.binary', fs: 16, mono: true, stroke: INK, sw: 2.4, s: pop(u, 1.1) }); lock(365, 346, true, INK, pop(u, 1.3));
      grow(390, 350, 520, 350, E(u, 1.5, 1.9), GOOD); pill(660, 350, 'apply tfplan.binary', GOOD, pop(u, 1.9), { mono: true, fs: 15 });
      sub(660, 396, '이 계획에는 -var로 값을 다시 넣을 수 없다', fade(u, 2.2), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 3) { const v = u > 1.0;
      planBase(k, u, { static: true, hiRow: 1, code: (i) => i === 1 && v ? 'instance_type = "t3.large"' : RS[i].code, bcol: (i) => i === 1 && v ? WARN : null });
      fly(140, 380, 165, 214, seg(u, 0.2, 1.0), 'prod.tfvars', { fill: WARN, mono: true });
      planLine(480, 350, 3, 0, 0, { fs: 17, op: fade(u, 1.4) });
      sub(480, 392, '같은 코드도 넣은 값에 따라 계획이 달라진다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { planBase(k, u, { static: true, off: (i) => i === 0 && u > 0.5, hiRow: 1, code: (i) => i === 1 ? 'web_sg.id를 참조' : RS[i].code, bcol: (i) => i === 1 ? INFO : null });
      el('path', { d: `M30,${RY[1] + 12} H16 V${RY[2] - 12} H24`, fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': 220, 'stroke-dashoffset': 220 * (1 - E(u, 0.6, 1.3)), 'marker-end': u > 1.3 ? 'url(#ra-ah)' : null });
      mono(480, 316, '$ terraform plan -target=aws_instance.web', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.2) });
      planLine(480, 356, Math.round(tween(3, 2, u - 1.2, 0.6)), 0, 0, { fs: 17, op: fade(u, 0.3) });
      sub(480, 394, '대상 + 대상이 의존하는 것만 계산한다 · s3는 빠진다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { const ROWS = [['+', '생성', 'state에 없는 리소스', 'new'], ['~', '제자리 수정', 'instance_type 변경', 'upd'], ['-/+', '지우고 다시 만들기', 'ami 변경 (교체)', 'rep'], ['-', '삭제', '코드에서 블록을 지움', 'del'], ['<=', 'data source 읽기', 'data 블록 조회', 'read']];
      ROWS.forEach(([s, m, ex, kind], i) => { const y = 66 + i * 70, a = fade(u, 0.2 + i * 0.42), sc = pop(u, 0.2 + i * 0.42); if (a <= 0) return;
        if (kind === 'rep') el('rect', { x: 20, y: y - 28, width: 920, height: 56, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: a });
        sym(70, y, s, sc); tx(130, y + 6, m, { 'font-size': 16, 'font-weight': 700, opacity: a }); mono(330, y + 6, ex, { 'font-size': 14, fill: MUT, opacity: a });
        const x = 640, cyy = y;
        if (kind === 'new') { el('rect', { x, y: cyy - 15, width: 60, height: 30, rx: 6, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4', opacity: a }); card(x + 30, cyy, 60, 30, { rx: 6, stroke: GOOD, fill: GOODBG, s: pop(u, 0.5 + i * 0.42) }); }
        if (kind === 'upd') { card(x + 30, cyy, 60, 30, { rx: 6, stroke: INK, op: a }); el('rect', { x: x + 10, y: cyy - 4, width: 40, height: 8, rx: 3, fill: u > 0.9 + i * 0.42 ? WARN : OFF, opacity: a }); mono(x + 80, cyy + 5, '자리 그대로', { 'font-size': 13.5, fill: WARN, opacity: a }); }
        if (kind === 'rep') { card(x + 30, cyy, 60, 30, { rx: 6, stroke: BAD, op: a * (1 - 0.6 * seg(u, 1.4, 1.8)) }); cross(x + 30, cyy, 9, pop(u, 1.5));
          el('line', { x1: x + 66, y1: cyy, x2: x + 66 + 80 * E(u, 1.7, 2.2), y2: cyy, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); sub(x + 106, cyy - 10, '다운타임', fade(u, 1.9), { fill: BAD, 'font-weight': 700 });
          card(x + 186, cyy, 60, 30, { rx: 6, stroke: GOOD, fill: GOODBG, s: pop(u, 2.2) }); }
        if (kind === 'del') { card(x + 30, cyy, 60, 30, { rx: 6, stroke: BAD, op: a * 0.5 }); cross(x + 30, cyy, 9, pop(u, 2.0)); }
        if (kind === 'read') { card(x + 30, cyy, 60, 30, { rx: 6, stroke: INFO, dash: '5 4', op: a }); grow(x + 64, cyy, x + 130, cyy, E(u, 2.1, 2.5), INFO); } }); return; }
    if (k === 6) { const L = ['$ terraform show -json tfplan.binary > plan.json', '$ jq ".resource_changes[] | {addr: .address,', '      actions: .change.actions}" plan.json',
        '{ "addr": "aws_instance.web", "actions": ["create"] }', '{ "addr": "aws_s3_bucket.logs", "actions": ["create"] }', '{ "addr": "aws_security_group.web_sg", ... ["create"] }'];
      terminal(24, 46, 560, 230, L, Math.min(6, 6 * seg(u, 0.2, 1.5)), { fs: 13.5, title: '(출력 예시 · 줄여 씀)' });
      card(770, 110, 300, 76, { rx: 10, text: 'CI 규칙\nactions에 "delete" 가 있으면 실패', fs: 14.5, stroke: INFO, color: INK, s: pop(u, 1.5) });
      grow(590, 200, 690, 200, E(u, 1.7, 2.0), INFO);
      pill(770, 230, 'delete 0건 · 통과', GOOD, pop(u, 2.0), { fs: 15 }); check(870, 230, 9, pop(u, 2.2));
      note(300, 330, '계획을 기계가 읽으면 위험한 변경을 CI가 먼저 막는다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    // k7 사람이 한 번 더 읽는다
    person(110, 190, '리뷰어', { s: pop(u, 0.2) });
    el('rect', { x: 230, y: 60, width: 360, height: 220, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    RS.forEach((r, i) => spans(250, 100 + i * 34, [['+ ', { fill: GOOD, 'font-weight': 800 }], [r.addr, {}]], { 'font-size': 14 }));
    planLine(410, 240, 3, 0, 0, { fs: 13.5 });
    const ey = 80 + 170 * E(u, 0.3, 1.4); if (u < 1.5) el('line', { x1: 236, y1: ey, x2: 584, y2: ey, stroke: ACC, 'stroke-width': 2, opacity: 0.6 });
    [['마지막 줄 destroy 0', GOOD], ['-/+ (교체) 없음', GOOD], ['prod.tfvars로 계산했나', INFO]].forEach(([s, col], i) => { const y = 100 + i * 60;
      card(780, y, 280, 44, { rx: 8, text: s, fs: 14.5, stroke: col, color: INK, s: pop(u, 1.4 + i * 0.3) }); check(660, y, 8, pop(u, 1.5 + i * 0.3)); });
    grow(780, 290, 780, 336, E(u, 2.2, 2.5), GOOD); pill(780, 360, 'apply로', GOOD, pop(u, 2.5), { fs: 15 }); }

  // ---------- 3. apply ----------
  const AX = [30, 345, 660], AT = [['계획', 'plan 결과'], ['실제 클라우드', 'API로 만든다'], ['tfstate', 'ID를 적는다']];
  function applyCols(o) { o = o || {}; const mk = o.mk || (() => 1), st = o.st || (() => 1);
    AT.forEach(([a, b], i) => { tx(AX[i], 50, a, { 'font-size': 16, 'font-weight': 800, fill: i === 1 ? INFO : INK }); tx(AX[i] + tw(a, 16) + 10, 50, b, { 'font-size': 13.5, fill: MUT }); el('line', { x1: AX[i], y1: 66, x2: AX[i] + CW, y2: 66, stroke: GRID, 'stroke-width': 1.5 }); });
    RS.forEach((r, i) => { const dim = o.dim && o.dim(i);
      cell(0, i, null, null, { cx: AX, op: dim ? 0.35 : 1 }); spans(AX[0] + 14, RY[i] + 5, [['+ ', { fill: GOOD, 'font-weight': 800 }], [r.addr, { 'font-weight': 700 }]], { 'font-size': 14, opacity: dim ? 0.35 : 1 });
      const m = mk(i); if (m > 0) cell(1, i, r.id, o.cloudB ? o.cloudB(i) : null, { cx: AX, ic: r.ic, s: m, stroke: GOOD, icol: GOOD });
      else el('rect', { x: AX[1], y: RY[i] - RH / 2, width: CW, height: RH, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5', 'stroke-width': 1.5 });
      if (m <= 0 && o.missing && o.missing(i)) sub(AX[1] + CW / 2, RY[i] + 5, o.missing(i), 1, { fill: WARN, 'font-weight': 700, 'font-size': 14.5 });
      const s = st(i); if (s > 0) cell(2, i, r.addr, 'id = "' + r.id + '"', { cx: AX, s, stroke: INK });
      else el('rect', { x: AX[2], y: RY[i] - RH / 2, width: CW, height: RH, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5', 'stroke-width': 1.5 }); }); }
  // 계획 → 클라우드 → state 흐름 (물결 1: logs·sg, 물결 2: web)
  const T0 = { 0: 0.2, 2: 0.2, 1: 1.0 };
  function flow(u, i, base) { const t0 = (base ?? 0) + T0[i]; dot([[AX[0] + CW, RY[i]], [AX[1] + 20, RY[i]]], seg(u, t0, t0 + 0.5), ACC, 6); dot([[AX[1] + CW, RY[i]], [AX[2] + 10, RY[i]]], seg(u, t0 + 0.7, t0 + 1.1), INK, 6); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { applyCols({ mk: () => 0, st: () => 0 });
      el('rect', { x: AX[1] - 5, y: 96, width: 590, height: 204, fill: PANEL });
      const typed = 3 + seg(u, 0.4, 1.6) * 2;
      terminal(AX[1], 96, 585, 150, ['$ terraform apply', 'Do you want to perform these actions?', "  Only 'yes' will be accepted to approve.", '  Enter a value: yes'], Math.min(4, typed), { fs: 14 });
      pill(AX[1] + 140, 272, 'yes → 승인', GOOD, pop(u, 1.8), { fs: 14.5 }); check(AX[1] + 230, 272, 8, pop(u, 1.9));
      sub(AX[1] + 420, 277, 'y나 ok는 승인이 아니다', fade(u, 2.0), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
      RS.forEach((_, i) => dot([[AX[0] + CW, RY[i]], [AX[0] + CW + 60, RY[i]]], seg(u, 2.2, 2.6), ACC, 6));
      note(480, 340, '계획을 다시 보여 주고, 사람의 승인 한 번을 받는다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { applyCols({ mk: (i) => pop(u, T0[i] + 0.5), st: (i) => pop(u, T0[i] + 1.1) }); RS.forEach((_, i) => flow(u, i));
      card(150, 340, 220, 46, { rx: 10, text: 'tfplan.binary', fs: 16, mono: true, stroke: INK, sw: 2.4 }); lock(270, 336, true, INK);
      pill(470, 340, 'yes 질문', MUT, 1, { fs: 14.5 }); cross(470, 340, 10, pop(u, 0.4));
      sub(720, 345, '재계산 없이 그대로 적용', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { applyCols();
      card(150, 350, 220, 54, { rx: 10, text: 'CI 파이프라인\napply -auto-approve', fs: 14, stroke: INFO, color: INK, s: pop(u, 0.2) });
      pill(420, 350, 'yes 질문', MUT, 1, { fs: 14.5 }); cross(420, 350, 10, pop(u, 0.6));
      sub(700, 340, '앞에서 plan 검토가 끝났을 때만', fade(u, 1.2), { fill: INK, 'font-weight': 700, 'font-size': 15 });
      sub(700, 366, '사람이 치는 터미널에서는 쓰지 않는다', fade(u, 1.6), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 3) { applyCols({ cloudB: (i) => i === 1 ? 't3.large' : null });
      if (u > 0.2) el('rect', { x: AX[1] - 3, y: RY[1] - RH / 2 - 3, width: CW + 6, height: RH + 6, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 0.2) });
      [['plan ', 0], ['apply', 1]].forEach(([s, i]) => { const y = 330 + i * 40; mono(120, y + 5, s + ' -var-file=prod.tfvars', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }); check(520, y, 9, pop(u, 0.7 + i * 0.4)); });
      mono(560, 355, '=', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      sub(760, 345, 'apply에 다른 파일을 넘기면', fade(u, 1.8), { fill: BAD, 'font-size': 14.5, 'font-weight': 700 });
      sub(760, 368, '검토한 계획과 다른 결과', fade(u, 1.9), { fill: BAD, 'font-size': 14.5, 'font-weight': 700 }); return; }
    if (k === 4) { applyCols({ dim: (i) => i === 0, mk: (i) => i === 0 ? 0 : pop(u, T0[i] + 0.5), st: (i) => i === 0 ? 0 : pop(u, T0[i] + 1.1), missing: (i) => i === 0 ? '미생성' : null });
      [1, 2].forEach((i) => flow(u, i));
      mono(300, 340, '$ terraform apply -target=aws_instance.web', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT });
      pill(AX[2] + CW / 2, 340, 'state 반쪽', WARN, pop(u, 2.0), { fs: 15 });
      sub(480, 386, 'web과 그것이 기대는 web_sg만 · 끝나면 전체 apply로 맞춘다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { const x0 = 260, W = 380, BARS = [[0, 0.2, 1.2], [2, 0.2, 1.0], [1, 1.1, 2.1]];
      tx(x0, 50, '시간 →', { 'font-size': 13.5, fill: MUT });
      [['물결 1', 0.2], ['물결 2', 1.1]].forEach(([s, t0], j) => { const xx = x0 + (j ? W * 0.5 : 0); el('line', { x1: xx, y1: 64, x2: xx, y2: 300, stroke: GRID, 'stroke-dasharray': '4 4' }); mono(xx + 6, 82, s, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); });
      BARS.forEach(([ri, a, b], j) => { const r = RS[ri], y = 110 + j * 66, g = E(u, a, b), bx = x0 + (ri === 1 ? W * 0.5 : 0), bw = (ri === 1 ? W * 0.5 : ri === 0 ? W * 0.48 : W * 0.4) * g;
        mono(x0 - 14, y + 18, r.addr, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' });
        if (bw > 1) el('rect', { x: bx, y, width: bw, height: 28, rx: 5, fill: ri === 1 ? ACC : INFO, opacity: 0.85 });
        if (g > 0 && g < 1) mono(bx + 8, y + 19, 'API 호출', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
        if (g >= 1) { mono(bx + 8, y + 19, r.id, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL }); dot([[bx + bw, y + 14], [720, 130 + j * 34]], seg(u, b, b + 0.35), INK, 5); } });
      el('rect', { x: 700, y: 64, width: 240, height: 140, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(714, 88, 'terraform.tfstate', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      BARS.forEach(([ri, , b], j) => mono(714, 120 + j * 32, RS[ri].id, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, b + 0.35, 0.2) }));
      grow(x0 + W * 0.4 + 4, 204, x0 + W * 0.5 - 2, 240, E(u, 1.0, 1.2), INFO);
      sub(420, 330, 'web은 web_sg.id가 나와야 시작한다', fade(u, 1.0), { fill: INK, 'font-size': 14.5, 'font-weight': 700 });
      note(480, 380, '① API 호출    ② ID 받기    ③ state 기록', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 6) { applyCols({ cloudB: (i) => i === 1 ? 'public_ip' : null });
      fly(AX[1] + 220, RY[1] + 16, 240, 380, seg(u, 0.3, 1.1), '13.124.xx.xx', { fill: INFO, mono: true });
      terminal(30, 312, 460, 100, ['$ terraform output', 'instance_public_ip = "13.124.xx.xx"'], Math.min(2, 2 * seg(u, 1.0, 1.8)), { fs: 14 });
      sub(730, 350, 'IP · 엔드포인트를 다음 작업에 넘긴다', fade(u, 1.9), { fill: INK, 'font-size': 15, 'font-weight': 700 }); return; }
    // k7 apply 가 막히는 두 경우
    zone(20, 36, 450, 370, 'state lock'); zone(490, 36, 450, 370, '이미 있는 리소스');
    person(90, 150, 'A: apply 중', { s: pop(u, 0.2) }); person(90, 290, 'B: apply', { s: pop(u, 0.4) });
    card(270, 210, 150, 70, { rx: 10, text: 'tfstate', fs: 15, mono: true, stroke: INK, s: pop(u, 0.3) }); lock(345, 180, true, WARN, pop(u, 0.6));
    grow(120, 150, 192, 196, E(u, 0.5, 0.9), INK); grow(120, 290, 190, 236, E(u, 0.9, 1.2), BAD, { plain: true }); cross(160, 262, 8, pop(u, 1.2));
    card(245, 384, 400, 40, { rx: 8, text: 'Error acquiring the state lock', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.3) });
    zone(520, 80, 170, 140, '클라우드', { fill: INFOBG, color: INFO });
    vmI(605, 150, pop(u, 1.4) * 1.3, INK); sub(605, 196, '콘솔에서 만든 web', fade(u, 1.5), { fill: INK, 'font-weight': 700 });
    card(820, 150, 200, 66, { rx: 10, text: 'plan: + web\napply: already exists', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.6) });
    grow(605, 228, 605, 300, E(u, 1.9, 2.3), GOOD);
    card(715, 330, 420, 44, { rx: 8, text: 'terraform import aws_instance.web i-…', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 2.1) }); }

  // ---------- 4. refresh ----------
  const ST0 = ['id = "logs-2026"', 'instance_state = "running"', 'tags = { Name }'], ST1 = ['id = "logs-2026"', 'instance_state = "stopped"', 'tags = { Name, owner }'];
  const CL = ['변화 없음', 'stopped', 'tags + owner = "alice"'];
  function refCols(o) { o = o || {}; heads(H3, { op: [o.codeOp ?? 1, 1, 1] });
    RS.forEach((r, i) => { const drift = i > 0; if (o.skip && o.skip(i)) return;
      cell(0, i, r.addr, r.code, { op: o.codeOp ?? 1 });
      const nw = o.st ? o.st(i) : 0; cell(1, i, r.addr, nw ? ST1[i] : ST0[i], { stroke: nw && drift ? WARN : GRID, bcol: nw && drift ? WARN : null });
      cell(2, i, r.key === 'sg' ? 'web_sg' : r.id, CL[i], { ic: r.ic, off: i === 1, stroke: drift ? WARN : GRID, icol: drift ? WARN : INK, bcol: drift ? WARN : null, op: o.cloudOp }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { refCols({ codeOp: 0.4, st: (i) => u > 0.9 + i * 0.3 });
      RS.forEach((_, i) => dot([[CX[2] + 10, RY[i]], [CX[1] + CW - 10, RY[i]]], seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3), INFO, 6));
      sub(CX[0] + CW / 2, 318, '코드는 그대로', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 });
      mono(480, 370, '$ terraform refresh   (deprecated: apply -refresh-only와 같다)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { refCols({ codeOp: 0.3 });
      [1, 2].forEach((i) => { grow(CX[2] - 4, RY[i], CX[1] + CW + 4, RY[i], E(u, 0.3 + i * 0.2, 0.8 + i * 0.2), WARN); sym(CX[2] - 10, RY[i] - 26, '~', pop(u, 0.8 + i * 0.2)); });
      sub(CX[0] + CW / 2, 318, '코드와는 비교하지 않는다', fade(u, 0.4), { fill: MUT, 'font-weight': 700, 'font-size': 14.5 });
      el('rect', { x: 300, y: 300, width: 640, height: 110, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 1.6, opacity: fade(u, 1.2) });
      mono(316, 326, '$ terraform plan -refresh-only   (출력 예시)', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
      mono(316, 352, '~ aws_instance.web   instance_state: "running" → "stopped"', { 'font-size': 13.5, opacity: fade(u, 1.5) });
      mono(316, 376, '~ aws_security_group.web_sg   tags: + owner = "alice"', { 'font-size': 13.5, opacity: fade(u, 1.8) });
      pill(860, 392, 'drift 2건', WARN, pop(u, 2.2), { fs: 14 }); return; }
    if (k === 2) { refCols({ codeOp: 0.4, st: (i) => u > 1.0 + i * 0.2 });
      [1, 2].forEach((i) => fly(CX[2] + 60, RY[i], CX[1] + 150, RY[i] + 14, seg(u, 0.3 + i * 0.2, 1.0 + i * 0.2), i === 1 ? 'stopped' : '+ owner', { fill: WARN, mono: true }));
      mono(480, 330, '$ terraform apply -refresh-only', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(CX[2] + CW / 2, 318, '다시 켜지지 않는다', fade(u, 1.8), { fill: BAD, 'font-weight': 700, 'font-size': 15 });
      sub(480, 376, 'state만 실제에 맞춰 바뀐다 · 클라우드는 건드리지 않는다', fade(u, 2.1), { fill: INK, 'font-size': 15, 'font-weight': 700 }); return; }
    if (k === 3) { const ROWS = [['terraform plan', [['refresh', INFO], ['코드와 비교', ACC]]], ['terraform apply', [['refresh', INFO], ['코드와 비교', ACC], ['적용', GOOD]]], ['plan -refresh=false', [['refresh', OFF, true], ['코드와 비교', ACC]]]];
      ROWS.forEach(([name, parts], j) => { const y = 90 + j * 96, a = fade(u, 0.2 + j * 0.6);
        mono(30, y + 24, name, { 'font-size': 15, 'font-weight': 800, opacity: a });
        parts.forEach(([s, col, off], i) => { const x = 290 + i * 210, g = E(u, 0.3 + j * 0.6 + i * 0.25, 0.6 + j * 0.6 + i * 0.25); if (g <= 0) return;
          el('rect', { x, y, width: 200 * g, height: 38, rx: 6, fill: col, opacity: off ? 0.4 : 0.85 });
          if (g >= 1) { tx(x + 100, y + 25, s, { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }); if (off) el('line', { x1: x + 10, y1: y + 19, x2: x + 190, y2: y + 19, stroke: BAD, 'stroke-width': 3 }); } }); });
      sub(480, 385, '리소스가 많아 느릴 때만 끈다 · 끄면 바깥 변경을 못 본다', fade(u, 2.2), { fill: INK, 'font-size': 15, 'font-weight': 700 }); return; }
    if (k === 4) { zone(330, 120, 300, 190, '실제 클라우드', { fill: INFOBG, color: INFO });
      RS.forEach((r, i) => { r.ic(390 + i * 90, 215, 1.4, i > 0 || u > 1.6 ? WARN : INK, { off: i === 1 }); });
      zone(30, 160, 200, 110, 'Terraform', { dash: '6 5', stroke: MUT, fill: 'none' }); sub(130, 230, '밖의 일은 모른다', 1, { fill: MUT, 'font-weight': 700 });
      const SRC = [['콘솔·CLI 수동 변경', 440, 60, 390, 190], ['오토스케일링', 800, 120, 620, 200], ['IAM 정책 수동 추가', 800, 340, 620, 270], ['보안 도구 태그 수정', 440, 380, 480, 305]];
      SRC.forEach(([s, x, y, tx2, ty2], i) => { const a = 0.2 + i * 0.45; card(x, y, tw(s, 14.5) + 30, 38, { rx: 19, text: s, fs: 14.5, stroke: WARN, color: INK, s: pop(u, a) }); grow(x + (x > 600 ? -tw(s, 14.5) / 2 - 15 : 0), y + (x > 600 ? 0 : y < 200 ? 19 : -19), tx2, ty2, E(u, a + 0.2, a + 0.6), WARN); });
      sub(130, 330, 'Terraform 밖 변경 = drift', fade(u, 2.2), { fill: WARN, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 5) { refCols({ st: () => true, skip: (i) => i === 0 });
      el('path', { d: `M${CX[2] + CW / 2},${RY[1] - RH / 2} C${CX[2] + CW / 2},90 ${CX[1] + CW / 2},90 ${CX[1] + CW / 2},${RY[1] - RH / 2}`, fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 0.3, 1.0)), 'marker-end': u > 1 ? 'url(#ra-ah)' : null });
      pill(CX[1] + CW, 84, '① 실제를 받아들인다 (web의 stop)', INFO, pop(u, 0.9), { fs: 14 });
      el('path', { d: `M${CX[0] + CW / 2},${RY[2] + RH / 2} C${CX[0] + CW / 2},330 ${CX[2] + CW / 2},330 ${CX[2] + CW / 2},${RY[2] + RH / 2}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, 'stroke-dasharray': 700, 'stroke-dashoffset': 700 * (1 - E(u, 1.1, 1.8)), 'marker-end': u > 1.8 ? 'url(#ra-ah)' : null });
      pill(CX[1] + CW / 2, 336, '② apply로 되돌린다 (web_sg의 tags)', GOOD, pop(u, 1.7), { fs: 14 });
      planLine(480, 392, 0, 1, 0, { fs: 16, op: fade(u, 2.1) }); return; }
    // k6 state 직접 보기
    terminal(30, 36, 600, 370, ['$ terraform state list', 'aws_instance.web', 'aws_s3_bucket.logs', 'aws_security_group.web_sg', '$ terraform state show aws_instance.web', '# aws_instance.web:', 'resource "aws_instance" "web" {', '    id             = "i-0abc123"', ['    instance_state = "stopped"', WARN], '    ...', '}'],
      Math.min(11, 11 * seg(u, 0.2, 2.0)), { fs: 14, title: '(출력 예시)' });
    grow(800, 238, 560, 238, E(u, 2.0, 2.4), WARN); sub(800, 222, 'drift를 눈으로 확인', fade(u, 2.2), { fill: WARN, 'font-weight': 700, 'font-size': 15, 'text-anchor': 'start' }); }

  // ---------- 5. destroy ----------
  const DP = { sg: [640, 120], web: [640, 250], logs: [840, 185] };
  // gone: key → 0..1 (사라진 정도), minus: key → 0..1, o.db: web 대신 운영 DB
  function dgraph(o) { o = o || {}; const gone = o.gone || {}, minus = o.minus || {};
    zone(500, 50, 440, 270, o.title || '실제 클라우드', { fill: INFOBG, color: INFO });
    if (!o.db) { const a = 1 - (gone.web || 0); el('line', { x1: DP.web[0], y1: DP.web[1] - 30, x2: DP.sg[0], y2: DP.sg[1] + 58, stroke: MUT, 'stroke-width': 2, opacity: a, 'marker-end': 'url(#ra-ah)' }); mono(DP.web[0] + 10, 204, 'web_sg.id', { 'font-size': 13.5, fill: MUT, opacity: a }); }
    RS.forEach((r) => { const [x, y] = DP[r.key], g = gone[r.key] || 0, isDb = o.db && r.key === 'web', col = (o.bad || {})[r.key] ? BAD : isDb ? WARN : INK;
      (isDb ? dbI : r.ic)(x, y, 1.5, col, { op: 1 - 0.75 * g, objs: o.objs && r.key === 'logs' });
      mono(x, y + 44, isDb ? 'db-prod-1' : r.id, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: 1 - 0.75 * g });
      if (isDb) lock(x + 34, y - 18, true, WARN, 1);
      if (g > 0.3) cross(x, y, 14, pop(g, 0.3, 0.5));
      if (minus[r.key] > 0 && g <= 0.3) sym(x - 40, y - 26, '-', minus[r.key]); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { dgraph({ minus: { web: pop(u, 0.9), logs: pop(u, 1.1), sg: pop(u, 1.3) } });
      terminal(24, 50, 450, 170, ['$ terraform destroy', 'Plan: 0 to add, 0 to change, 3 to destroy.', 'Do you really want to destroy all resources?', '  Enter a value: yes'], Math.min(4, 4 * seg(u, 0.2, 1.9)), { fs: 13.5, title: '(출력 예시)' });
      sub(250, 270, '지운 것은 되돌릴 수 없다 · 그래서 먼저 보여 준다', fade(u, 2.1), { fill: INK, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 1) { dgraph({ minus: { web: pop(u, 0.6), logs: pop(u, 0.8), sg: pop(u, 1.0) }, title: '실제 클라우드 · 그대로' });
      terminal(24, 50, 450, 110, ['$ terraform plan -destroy', 'Plan: 0 to add, 0 to change, 3 to destroy.'], Math.min(2, 2 * seg(u, 0.2, 1.0)), { fs: 13.5 });
      [['web', 1.4], ['logs', 1.6], ['sg', 1.8]].forEach(([key, a]) => check(DP[key][0] + 36, DP[key][1] + 20, 8, pop(u, a)));
      sub(250, 210, '삭제 계획만 계산한다 · 지우는 것은 없다', fade(u, 2.0), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 2) { dgraph({ gone: { web: E(u, 0.4, 1.1), logs: E(u, 0.4, 1.1), sg: E(u, 1.4, 2.1) } });
      terminal(24, 50, 450, 110, ['$ terraform destroy -auto-approve', 'Destroy complete! Resources: 3 destroyed.'], Math.min(2, 1 + seg(u, 2.1, 2.4)), { fs: 13.5, title: '(출력 예시)' });
      [['물결 1', 'web · logs', 0.4, 1.1], ['물결 2', 'web_sg', 1.4, 2.1]].forEach(([a, b, t0, t1], j) => { const y = 340 + j * 36, g = E(u, t0, t1);
        mono(510, y + 17, a, { 'font-size': 14, 'font-weight': 700, fill: MUT }); el('rect', { x: 580 + j * 170, y, width: 170 * g, height: 26, rx: 5, fill: BAD, opacity: 0.8 });
        mono(780 + (j ? 0 : -110), y + 18, b, { 'font-size': 13.5, 'font-weight': 700, fill: g >= 1 ? PANEL : INK, opacity: fade(u, t0) }); });
      sub(250, 220, '만든 순서의 거꾸로 지운다', fade(u, 1.2), { fill: INK, 'font-weight': 700, 'font-size': 15 });
      sub(250, 250, 'PR 환경 · 테스트 스택에만 쓴다', fade(u, 1.8), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 3) { dgraph({ gone: { web: E(u, 0.7, 1.4) } });
      terminal(24, 50, 460, 110, ['$ terraform destroy -target=aws_instance.web', 'Plan: 0 to add, 0 to change, 1 to destroy.'], Math.min(2, 2 * seg(u, 0.2, 0.9)), { fs: 13.5, title: '(출력 예시)' });
      el('rect', { x: 24, y: 190, width: 450, height: 104, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(40, 214, 'terraform.tfstate', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      [['aws_s3_bucket.logs', 1], ['aws_security_group.web_sg', 1], ['aws_instance.web', 1 - fade(u, 1.2)]].forEach(([s, a], i) => mono(40, 242 + i * 22, s, { 'font-size': 14, opacity: 0.15 + 0.85 * a, 'text-decoration': a < 1 ? 'line-through' : null }));
      sub(250, 330, 'web에 기대는 것이 없어 web 하나만 지운다', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 4) { dgraph({ title: 'dev 환경', gone: { web: E(u, 1.4, 1.9), logs: E(u, 1.4, 1.9), sg: E(u, 1.9, 2.4) } });
      el('rect', { x: 24, y: 60, width: 330, height: 100, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.2) });
      mono(40, 86, 'dev.tfvars', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      mono(40, 114, 'region = "ap-northeast-2"', { 'font-size': 14, opacity: fade(u, 0.4) }); mono(40, 140, 'tags   = { env = "dev" }', { 'font-size': 14, opacity: fade(u, 0.5) });
      grow(355, 110, 495, 160, E(u, 0.8, 1.3), ACC);
      mono(250, 210, 'destroy -var-file="dev.tfvars"', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.7) });
      card(200, 290, 340, 60, { rx: 10, text: 'apply와 다른 tfvars를 넘기면\n계획이 어긋난다', fs: 14.5, stroke: WARN, color: INK, dash: '6 4', s: pop(u, 2.2) }); return; }
    if (k === 5) { dgraph({ db: true, bad: { web: u > 1.4 } });
      snippet(24, 50, ['resource "aws_db_instance" "prod" {', '  lifecycle {', '    prevent_destroy = true', '  }', '}'], { fs: 14.5, w: 420 });
      el('rect', { x: 30, y: 102, width: 408, height: 22, rx: 4, fill: WARN, opacity: 0.18 * fade(u, 0.4) });
      grow(450, 220, 600, 250, E(u, 0.8, 1.3), BAD);
      card(480, 352, 520, 48, { rx: 10, text: 'Error: Instance cannot be destroyed', fs: 15, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.4) });
      sub(480, 400, '계획 전체가 거부된다 · logs도 web_sg도 지워지지 않는다', fade(u, 2.0), { fill: INK, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 6) { const LANE = [['terraform destroy', 3, ['logs', 'web', 'sg']], ['logs 블록을 지우고 apply', 1, ['logs']]];
      LANE.forEach(([name, n, del], j) => { const y = 70 + j * 170, a = 0.2 + j * 0.9;
        card(160, y + 30, 260, 50, { rx: 10, text: name, fs: 15, mono: true, stroke: j ? INFO : BAD, color: INK, s: pop(u, a) });
        grow(295, y + 30, 400, y + 30, E(u, a + 0.2, a + 0.5), MUT);
        RS.forEach((r, i) => { const x = 460 + i * 110, gone = del.includes(r.key) ? E(u, a + 0.5, a + 0.9) : 0;
          r.ic(x, y + 30, 1.3, gone > 0.5 ? BAD : INK, { op: 1 - 0.7 * gone, off: false }); if (gone > 0.3) cross(x, y + 30, 13, pop(gone, 0.3, 0.5)); });
        planLine(570, y + 100, 0, 0, n, { fs: 15, op: fade(u, a + 0.7) }); });
      sub(480, 405, '블록을 지우고 apply 하면 그 리소스만 사라진다', fade(u, 2.3), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 7) { el('rect', { x: 40, y: 90, width: 260, height: 120, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.2) });
      mono(56, 116, 'terraform.tfstate', { 'font-size': 14, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(56, 160, '"resources": []', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
      sub(170, 240, '파일은 남고 목록만 빈다', fade(u, 0.8), { fill: INK, 'font-weight': 700, 'font-size': 14.5 });
      fileG(400, 150, INK, true, pop(u, 1.0) * 2.2); mono(440, 158, '.terraform/', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      sub(470, 240, 'init 결과 그대로', fade(u, 1.2), { fill: INK, 'font-weight': 700, 'font-size': 14.5 });
      zone(640, 80, 290, 140, '실제 클라우드', { fill: INFOBG, color: INFO, op: fade(u, 1.5) }); sub(785, 160, '(비어 있음)', fade(u, 1.7), { 'font-size': 15 });
      sub(785, 240, '콘솔에서 terminated · 삭제 확인', fade(u, 1.9), { fill: INK, 'font-weight': 700, 'font-size': 14.5 });
      note(480, 330, '다시 쓰려면 apply만 하면 된다 (init은 이미 끝났다)', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    // k8 destroy 가 실패할 때
    dgraph({ objs: true, gone: { web: E(u, 0.3, 0.9) }, bad: { logs: u > 1.0, sg: u > 1.4 } });
    card(840, 260, 220, 34, { rx: 8, text: 'BucketNotEmpty', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.0) });
    zone(380, 330, 200, 70, null, { fill: 'none', stroke: MUT, dash: '5 4' }); mono(480, 360, 'ENI', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); sub(480, 384, 'Terraform 밖', fade(u, 1.3));
    grow(470, 330, 606, 132, E(u, 1.3, 1.7), BAD, { plain: true });
    card(800, 365, 250, 34, { rx: 8, text: 'DependencyViolation', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.5) });
    [['① 버킷 객체 비우기', '(또는 force_destroy = true)'], ['② web_sg를 물고 있는 것 정리', null], ['③ destroy 다시', null]].forEach(([a, b], i) => { const y = 80 + i * 70;
      note(30, y, a, fade(u, 1.8 + i * 0.25), { 'font-weight': 700 }); if (b) mono(48, y + 24, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9) }); }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '.terraform.lock.hcl을 git에 커밋하는 이유는 무엇인가?',
      o: ['state를 팀원과 나누려고', '팀원 모두 같은 provider 버전과 해시로 init하게 하려고', 'provider 바이너리를 저장소에 올리려고'], a: 1,
      why: 'lock 파일에는 고른 버전과 해시만 적힌다. 커밋해 두면 누가 init해도 같은 플러그인을 받는다.' },
    { q: 'plan 기호 중 운영 환경에서 가장 먼저 살펴야 하는 것은 무엇인가?',
      o: ['~ 제자리 수정', '+ 생성', '-/+ 지우고 다시 만들기'], a: 2,
      why: '-/+는 기존 리소스를 지우고 새로 만드는 교체라 그 사이 서비스가 끊긴다. ami처럼 바꿀 수 없는 인자가 바뀌면 나온다.' },
    { q: 'terraform apply tfplan.binary를 실행하면 무엇이 달라지나?',
      o: ['저장한 계획을 다시 계산하지 않고 묻지도 않고 적용한다', '계획을 다시 계산하고 yes를 묻는다', '클라우드는 그대로 두고 state만 쓴다'], a: 0,
      why: '-out으로 굳힌 계획은 검토한 그대로 적용된다. 그래서 CI는 plan -out 뒤 apply <파일>로 돌린다.' },
    { q: '콘솔에서 stop한 인스턴스가 있을 때 apply -refresh-only를 하면 어떻게 되나?',
      o: ['인스턴스가 다시 켜진다', '인스턴스를 지우고 다시 만든다', '꺼진 채로 두고 state에만 stopped로 적는다'], a: 2,
      why: 'refresh-only는 실제 상태를 state에 받아 적기만 한다. 클라우드에는 아무 API도 부르지 않는다.' },
    { q: 'state에 prevent_destroy = true인 aws_db_instance.prod가 있을 때 terraform destroy를 하면 무엇이 일어나나?',
      o: ['prod만 남기고 나머지는 지운다', '계획 전체가 에러로 거부되어 아무것도 지워지지 않는다', '경고만 내고 prod도 지운다'], a: 1,
      why: '보호된 리소스를 지우는 계획은 통째로 에러가 된다. 그래서 logs와 web_sg도 그대로 남는다.' },
  ];

  const summary = [
    'init은 코드가 요구하는 provider를 받아 두고, 고른 버전과 해시를 lock 파일에 적는다.',
    'plan은 코드와 state, 실제 클라우드를 비교해 바뀔 것만 계산하고 아무것도 건드리지 않는다.',
    'apply는 의존 순서대로 API를 부르고 받은 ID를 state에 적는다. 서로 무관한 것은 동시에 만든다.',
    'Terraform 밖의 변경은 refresh-only로 확인하고, destroy는 state의 리소스를 만든 순서의 거꾸로 지운다.',
  ];
  const review = [
    { q: 'PR에서 plan을 검토하고 승인했는데 apply 결과가 검토한 내용과 달랐다. 먼저 의심할 것은?',
      o: ['init을 두 번 실행했다', 'state show로 속성을 들여다봤다', 'plan과 apply에 다른 tfvars를 넘겼다'], a: 2,
      why: 'plan은 넣은 변수 값으로 계산된다. -out으로 계획을 파일에 굳히고 그 파일을 apply에 넘기면 검토한 것이 그대로 적용된다.' },
    { q: 'prod plan의 마지막 줄이 Plan: 1 to add, 0 to change, 1 to destroy.였고 두 줄 모두 aws_instance.web이었다. 무엇을 뜻하나?',
      o: ['web을 지우고 다시 만드는 교체라 다운타임을 확인해야 한다', '태그만 바뀌는 제자리 수정이다', 'state만 고치고 클라우드는 그대로다'], a: 0,
      why: '같은 주소에서 add와 destroy가 하나씩 나오면 -/+ 교체다. ami처럼 바꿀 수 없는 인자가 바뀌면 이렇게 계산된다.' },
    { q: '누군가 콘솔에서 보안그룹 태그를 고쳤다. 코드가 맞다고 정했다면 할 일은?',
      o: ['apply -refresh-only로 state에 받아 적는다', '일반 plan에서 ~ 1건을 확인하고 apply로 되돌린다', 'destroy 후 다시 apply한다'], a: 1,
      why: 'refresh-only는 실제를 받아들이는 쪽이다. 코드가 맞으면 일반 plan이 태그를 되돌리는 ~ 1건을 보여 주고 apply가 그대로 적용한다.' },
  ];

  R.page({ title: 'init · plan · apply · destroy', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
