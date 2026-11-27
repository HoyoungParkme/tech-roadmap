/* I-2-2 설치와 첫 apply — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone,
    cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO, HL } = C;
  const SYM = { '+': GOOD, '~': WARN, '-': BAD, '-/+': BAD };
  const BUCKET = 'tf-demo-bucket-2026-edgar';

  // ---------- 공통 부품 ----------
  // 왼쪽 터미널: beat.terminal 을 그대로. 이번 beat 에 새로 붙은 줄은 타이핑된다
  function fit(s, max) { if (tw(s, 13.5) <= max) return s; let t = s; while (t.length && tw(t + '…', 13.5) > max) t = t.slice(0, -1); return t + '…'; }
  const KCOL = { cmd: PANEL, success: HL, warn: HL, info: OFF };
  function term(c) { const cur = c.beat.terminal || [], prev = c.prev ? (c.prev.terminal || []) : [];
    const same = prev.length <= cur.length && prev.every((l, i) => cur[i] && cur[i].text === l.text), from = same ? prev.length : 0;
    const lines = cur.map((l) => [fit(((l.label ? l.label + ' ' : '') + l.text).replace(/\s{3,}#.*$/, ''), 440), KCOL[l.kind] || null]);
    R.terminal(20, 20, 470, 380, lines, lerp(from, cur.length, E(c.u, 0.15, 1.7)) || 0.001, { title: '~/my-first-tf', lh: 21, fs: 13.5 }); }
  // 문서 아이콘 (접힌 귀퉁이)
  function doc(cx, cy, w, h, title, rows, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2, col = o.col || INK, g = R.G(0, 0, 1, o.op);
    el('path', { d: `M${x},${y} H${x + w - 16} L${x + w},${y + 16} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash }, g);
    mono(x + 12, y + 22, title, { 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    (rows || []).forEach((r, i) => { const [s, rc] = Array.isArray(r) ? r : [r, MUT]; mono(x + 12, y + 46 + i * 21, s, { 'font-size': 13.5, fill: rc }, g); }); }
  // S3 버킷 그림 (양동이). ghost 면 점선
  function bucket(cx, cy, s, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s), col = o.col || INK;
    el('path', { d: 'M-36,-26 L-28,30 Q0,40 28,30 L36,-26', fill: o.ghost ? 'none' : (o.fill || PANEL), stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.ghost ? '6 4' : null }, g);
    el('ellipse', { cx: 0, cy: -26, rx: 36, ry: 10, fill: o.ghost ? 'none' : PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.ghost ? '6 4' : null }, g); }
  function region(x, y, w, h, name, o) { o = o || {}; zone(x, y, w, h, null, { fill: o.fill || PANEL, stroke: o.col || INFO, dash: '7 5', sw: 2, op: o.op });
    mono(x + 12, y + 20, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.col || INFO, opacity: o.op ?? 1 }); }
  const R0 = 520, RW = 420;   // 오른쪽 그림 칸
  const note = (s, a, u, col) => tx(R0 + RW / 2, 396, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col || INK, opacity: fade(u, a) });

  // =========================================================
  // 1. 설치 — 단일 바이너리 + 자격증명
  // =========================================================
  function binIcon(cx, cy, s, label) { card(cx, cy, 120, 70, { rx: 10, fill: INK, stroke: 'none', s }); mono(cx, cy + 6, label || 'terraform', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL, opacity: s }); }
  function s1(t, c) { const { k, u } = c; term(c);
    if (k === 0) { card(640, 90, 150, 50, { rx: 10, stroke: INK, sw: 2, text: 'Homebrew', fs: 15, fw: 700 });
      pill(820, 90, 'hashicorp/tap', ACC, pop(u, 0.4), { mono: true });
      fly(640, 120, 820, 270, seg(u, 0.9, 1.9), 'terraform', { mono: true });
      zone(560, 220, 360, 110, null, { fill: SOFT, stroke: GRID, sw: 1.5 }); mono(576, 244, 'PATH 안의 bin/', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      if (u > 1.9) binIcon(820, 280, pop(u, 1.9), 'terraform');
      note('실행 파일 하나가 PATH에 들어가면 끝', 2.2, u); return; }
    if (k === 1) { [['macOS', 'brew', 600], ['Windows', 'choco / zip', 730], ['Linux', 'apt', 860]].forEach(([os, how, x], i) => { const s = pop(u, 0.2 + i * 0.3);
        card(x, 80, 116, 64, { rx: 10, stroke: GRID, sw: 1.8, s }); tx(x, 74, os, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: s }); mono(x, 96, how, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s });
        grow(x, 114, 730, 236, E(u, 0.8 + i * 0.2, 1.4 + i * 0.2), MUT); });
      binIcon(730, 272, pop(u, 1.6)); note('설치 길은 달라도 결과는 같은 파일 하나', 2, u); return; }
    if (k === 2) { binIcon(600, 140, 1); grow(665, 140, 715, 140, E(u, 0.3, 0.8), ACC);
      card(820, 140, 190, 80, { rx: 10, stroke: GOOD, sw: 2.2, fill: C.GOODBG, s: pop(u, 0.8) });
      mono(820, 134, 'Terraform v1.9.5', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) }); mono(820, 158, 'on darwin_arm64', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1) });
      sub(820, 200, '출력 예시', fade(u, 1.2));
      card(730, 290, 380, 56, { rx: 10, stroke: BAD, sw: 1.8, dash: '6 4', s: pop(u, 1.6) }); tx(730, 296, '버전이 안 나오면 PATH 문제', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); return; }
    // k3: 자격증명
    doc(640, 170, 220, 120, '~/.aws/credentials', [['[default]', INK], ['aws_access_key_id = AKIA****', MUT], ['aws_secret_access_key = ****', MUT]], { op: fade(u, 0.3) });
    lock(745, 120, true, ACC, pop(u, 0.8));
    grow(755, 170, 820, 170, E(u, 1.0, 1.5), ACC); card(870, 170, 100, 44, { rx: 22, text: 'aws', fs: 15, mono: true, stroke: ACC, sw: 2.2, fill: ACCBG, s: pop(u, 1.4) });
    mono(870, 214, 'provider', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) });
    card(730, 300, 400, 56, { rx: 10, stroke: WARN, sw: 1.8, s: pop(u, 1.9) }); tx(730, 306, '키는 코드에 적지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2) }); }

  // =========================================================
  // 2. main.tf — 블록 넷
  // =========================================================
  const BLK = [['terraform', 'aws ~> 5.0', 0], ['provider "aws"', 'us-east-1', 1], ['resource "aws_s3_bucket" "demo"', null, 2], ['  tags', 'Name · Env', 3], ['output "bucket_name"', null, 4]];
  function s2(t, c) { const { k, u } = c; term(c);
    // 오른쪽 위: main.tf 블록 쌓기
    zone(R0, 20, RW, 186, null, { fill: SOFT, stroke: GRID, sw: 1.5 }); mono(R0 + 14, 42, 'main.tf', { 'font-size': 14, 'font-weight': 800 });
    BLK.forEach(([a, b, at], i) => { if (at > k) return; const y = 66 + i * 30, cur = at === k, s = cur ? pop(u, 0.2) : 1;
      if (cur) el('rect', { x: R0 + 8, y: y - 13, width: RW - 16, height: 26, rx: 5, fill: ACCBG, opacity: s });
      mono(R0 + 18, y + 5, a, { 'font-size': 14, 'font-weight': 700, fill: cur ? ACC : INK, opacity: s }); if (b) mono(R0 + RW - 16, y + 5, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); });
    // 오른쪽 아래: AWS (아직 아무것도 없다)
    if (k >= 1) { region(R0, 226, RW, 150, 'AWS · us-east-1', { op: k === 1 ? fade(u, 0.6) : 1 }); }
    if (k === 0) { lock(730, 290, true, ACC, pop(u, 0.5)); tx(730, 336, 'init이 이 조건대로 provider를 받는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1) }); return; }
    if (k === 1) { tx(730, 316, 'Access Key는 여기에 적지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) }); return; }
    const gs = k === 2 ? pop(u, 0.6) : 1; bucket(600, 306, gs, { ghost: true, col: MUT });
    mono(650, 290, BUCKET, { 'font-size': 14, 'font-weight': 700, opacity: gs }); tx(650, 314, '선언만 했다 · 아직 없음', { 'font-size': 14, fill: MUT, opacity: gs });
    if (k === 3) { pill(726, 352, 'Name=first-bucket', ACC, pop(u, 0.6), { mono: true, fs: 13.5 }); pill(874, 352, 'Env=learning', ACC, pop(u, 0.9), { mono: true, fs: 13.5 }); }
    if (k === 4) { grow(640, 344, 820, 344, E(u, 0.4, 1.2), ACC); pill(860, 344, 'bucket_name', ACC, pop(u, 1.1), { mono: true, fs: 13.5 }); note('apply 뒤에 찍을 값을 미리 정해 둔다', 1.6, u); } }

  // =========================================================
  // 3. terraform init — provider 플러그인을 받는다
  // =========================================================
  function tree(rows, u0, u) { zone(R0, 20, RW, 230, null, { fill: SOFT, stroke: GRID, sw: 1.5 }); mono(R0 + 14, 44, 'my-first-tf/', { 'font-size': 14.5, 'font-weight': 800 });
    rows.forEach(([s, col, at, mark], i) => { const y = 76 + i * 30, op = at == null ? 1 : fade(u, at);
      mono(R0 + 34, y, s, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: op });
      if (mark === 'x') cross(R0 + RW - 30, y - 5, 7, op); if (mark === 'v') check(R0 + RW - 30, y - 5, 8, op); }); }
  function s3(t, c) { const { k, u } = c; term(c);
    const base = [['main.tf', INK]];
    if (k === 0) { tree(base, 0, u); pill(730, 300, 'backend: local (기본값)', INFO, pop(u, 0.8), { mono: true });
      note('.tf가 있는 폴더에서 실행한다', 1.6, u); return; }
    if (k === 1) { tree(base, 0, u); card(640, 320, 200, 56, { rx: 10, stroke: INK, sw: 2, text: 'registry.terraform.io', fs: 13.5, mono: true });
      fly(640, 292, 730, 110, seg(u, 0.5, 1.6), 'hashicorp/aws v5.62.0', { mono: true, stay: true });
      tx(840, 330, '"~> 5.0" 에 맞는 최신 5.x', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6), 'text-anchor': 'middle' });
      tx(840, 352, '(버전은 예시)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7), 'text-anchor': 'middle' }); return; }
    const rows = [['main.tf', INK], ['.terraform/providers/…/aws', ACC, k === 2 ? 0.3 : null, k >= 3 ? 'x' : null], ['.terraform.lock.hcl', ACC, k === 2 ? 0.7 : null, k >= 3 ? 'v' : null]];
    if (k >= 3) rows.push(['.gitignore', WARN, k === 3 ? 0.3 : null]);
    tree(rows, 0, u);
    if (k === 2) { doc(730, 330, 300, 90, '.terraform.lock.hcl', ['provider ".../hashicorp/aws" {', '  version = "5.62.0"  (예시)'], { op: fade(u, 1.1) }); return; }
    if (k === 3) { tx(R0 + 34, 290, '커밋', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) }); mono(R0 + 90, 290, '.terraform.lock.hcl', { 'font-size': 14, opacity: fade(u, 0.9) });
      tx(R0 + 34, 322, '제외', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) }); mono(R0 + 90, 322, '.terraform/  *.tfstate', { 'font-size': 14, opacity: fade(u, 1.3) });
      note('플러그인은 다시 받으면 되고, state에는 비밀값이 든다', 1.8, u); return; }
    // k4: 다시 init 이 필요한 때
    ['provider 추가·버전 변경', 'module 추가', 'backend 설정 변경'].forEach((s, i) => pill(R0 + RW / 2, 284 + i * 36, s, ACC, pop(u, 0.3 + i * 0.35), { fs: 14 }));
    note('AWS API 호출은 아직 0회', 1.6, u, INFO); }

  // =========================================================
  // 4. terraform plan — 코드 · state · AWS 를 나란히
  // =========================================================
  function cols(k, u) { const xs = [R0, R0 + 145, R0 + 290], w = 130;
    [['main.tf', '원하는 상태'], ['state', '알고 있는 상태'], ['AWS', '현재 상태']].forEach(([a, b], i) => { const x = xs[i];
      zone(x, 20, w, 170, null, { fill: SOFT, stroke: i === 2 ? INFO : GRID, sw: 1.5, dash: i === 2 ? '6 4' : null });
      tx(x + w / 2, 44, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: i < 2 ? 'mono' : null });
      tx(x + w / 2, 64, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
    bucket(R0 + 65, 128, 0.75, { col: ACC }); mono(R0 + 65, 176, 'demo', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: ACC });
    tx(R0 + 210, 130, '(비어 있음)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); tx(R0 + 355, 130, '(없음)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); }
  function s4(t, c) { const { k, u } = c; term(c);
    if (k <= 2) cols(k, u);
    if (k === 0) { grow(R0 + 130, 110, R0 + 145, 110, 1, MUT); tx(R0 + 210, 236, '비교: 코드에 있고 state에 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1) });
      check(R0 + RW / 2 - 110, 300, 9, pop(u, 1.6)); tx(R0 + RW / 2 - 92, 305, 'AWS에는 쓰기 호출이 없다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { const rows = [['+ bucket', `"${BUCKET}"`, GOOD], ['+ id', '(known after apply)', MUT], ['+ arn', '(known after apply)', MUT]];
      mono(R0, 222, '+ aws_s3_bucket.demo', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
      rows.forEach(([a, b, col], i) => { const y = 252 + i * 26; mono(R0 + 14, y, a, { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5 + i * 0.35) }); mono(R0 + 100, y, b, { 'font-size': 13.5, fill: col === MUT ? WARN : INK, opacity: fade(u, 0.5 + i * 0.35) }); });
      note('id·arn은 만들어 봐야 안다', 1.8, u); return; }
    if (k === 2) { [['to add', 1, GOOD], ['to change', 0, WARN], ['to destroy', 0, BAD]].forEach(([n, v, col], i) => { const x = R0 + 70 + i * 140, s = pop(u, 0.2 + i * 0.3);
        card(x, 266, 126, 72, { rx: 10, stroke: col, sw: v ? 3 : 1.8, fill: v ? C.GOODBG : PANEL, s }); mono(x, 266, String(Math.round(v * E(u, 0.4, 1.2))), { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: col, opacity: s });
        tx(x, 292, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: s }); });
      note('운영에서는 destroy 숫자부터 본다', 1.6, u, BAD); return; }
    if (k === 3) { [['+', 'create', '새로 만든다'], ['~', 'update', '속성만 바꾼다'], ['-', 'destroy', '지운다'], ['-/+', 'replace', '지우고 다시 만든다']].forEach(([sy, en, ko], i) => { const y = 60 + i * 72, s = pop(u, 0.2 + i * 0.35), col = SYM[sy];
        card(R0 + 40, y, sy.length > 1 ? 56 : 40, 40, { rx: 8, stroke: col, sw: 2.4, text: sy, fs: 18, fw: 800, color: col, mono: true, s });
        mono(R0 + 90, y + 6, en, { 'font-size': 15.5, 'font-weight': 800, fill: col, opacity: s }); tx(R0 + 200, y + 6, ko, { 'font-size': 15, 'font-weight': 700, opacity: s }); });
      el('rect', { x: R0 + 4, y: 254, width: RW - 8, height: 52, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.6) });
      note('-/+ 가 보이면 무심코 apply 하지 않는다', 1.8, u, BAD); return; }
    // k4: -out 으로 저장
    doc(620, 120, 170, 70, 'tfplan.binary', ['리뷰한 계획'], { col: ACC, op: fade(u, 0.3) });
    grow(710, 120, 790, 120, E(u, 0.8, 1.4), ACC); card(860, 120, 130, 50, { rx: 10, text: 'apply', fs: 16, mono: true, stroke: ACC, sw: 2.2, s: pop(u, 1.3) });
    tx(R0 + RW / 2, 230, '그 계획만 그대로 실행된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
    card(R0 + RW / 2, 300, 380, 56, { rx: 10, stroke: WARN, sw: 1.8, s: pop(u, 1.9) }); tx(R0 + RW / 2, 306, '파일 안에 민감한 값도 그대로 들어 있다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2) }); }

  // =========================================================
  // 5. terraform apply — yes 를 쳐야 만든다
  // =========================================================
  function s5(t, c) { const { k, u } = c; term(c);
    region(R0, 20, RW, 200, 'AWS · us-east-1', {});
    const made = k >= 2, bs = k === 2 ? pop(u, 1.0) : 1;
    if (made) { bucket(600, 120, bs, { col: GOOD, fill: C.GOODBG }); mono(650, 112, BUCKET, { 'font-size': 14, 'font-weight': 700, opacity: bs }); tx(650, 136, 'S3 버킷 · 실제로 있다', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: bs }); }
    else { bucket(600, 120, 1, { ghost: true, col: OFF }); tx(650, 124, '아직 아무것도 없다', { 'font-size': 14.5, fill: MUT }); }
    if (k === 0) { card(R0 + RW / 2, 300, 360, 60, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.3) }); mono(R0 + 40, 306, 'Enter a value: ', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      if (Math.floor(t * 2) % 2) el('rect', { x: R0 + 190, y: 292, width: 9, height: 18, fill: INK }); note('승인 전까지는 Ctrl+C 해도 안전하다', 1.6, u); return; }
    if (k === 1) { [['yes', true], ['y', false], ['Y', false]].forEach(([v, ok], i) => { const x = R0 + 80 + i * 130, s = pop(u, 0.3 + i * 0.35);
        card(x, 300, 100, 50, { rx: 10, text: v, fs: 17, mono: true, stroke: ok ? GOOD : BAD, sw: 2.2, fill: ok ? C.GOODBG : PANEL, s }); (ok ? check : cross)(x + 42, 278, 9, s); });
      note("'yes'만 승인으로 인정된다", 1.6, u); return; }
    if (k === 2) { dot([[490, 200], [560, 140]], seg(u, 0.2, 0.9), ACC, 8); mono(R0, 270, 'aws_s3_bucket.demo: Creating...', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(R0, 296, 'Creation complete after 3s (예시)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); note('여기서부터 요금이 나온다', 1.8, u, WARN); return; }
    if (k === 3) { fly(620, 160, R0 + 210, 300, seg(u, 0.3, 1.3), 'bucket_name', { mono: true });
      card(R0 + RW / 2, 300, 400, 56, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.2) }); mono(R0 + 22, 306, `bucket_name = "${BUCKET}"`, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.3) }); return; }
    if (k === 4) { grow(600, 160, 640, 248, E(u, 0.3, 0.9), ACC);
      doc(700, 310, 300, 110, 'terraform.tfstate', [['aws_s3_bucket.demo', INK], [`  id  = "${BUCKET}"`, MUT], ['  arn = "arn:aws:s3:::…"', MUT]], { col: ACC, op: fade(u, 0.7) });
      tx(900, 280, '.backup', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); tx(900, 302, '덮어쓸 때', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); tx(900, 322, '직전 판', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    // k5: state list 와 aws s3 ls 가 같은 것을 가리킨다
    [['terraform state list', 'aws_s3_bucket.demo', R0 + 100], ['aws s3 ls', BUCKET.slice(0, 16) + '…', R0 + 320]].forEach(([cmd, out, x], i) => { const s = pop(u, 0.3 + i * 0.5);
      card(x, 310, 200, 74, { rx: 10, stroke: GOOD, sw: 2, s }); mono(x, 300, cmd, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, opacity: s }); mono(x, 324, out, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s });
      grow(x, 272, 600 + (i ? 20 : -10), 162, E(u, 0.9 + i * 0.4, 1.4 + i * 0.4), GOOD); });
    check(R0 + RW / 2, 312, 12, pop(u, 1.9)); }

  const quiz = [
    { q: 'terraform -v가 버전을 출력하지 않을 때 가장 먼저 의심할 것은 무엇인가?',
      o: ['AWS 자격증명이 틀렸다', 'terraform 실행 파일이 PATH에 없다', 'main.tf 문법이 틀렸다'], a: 1,
      why: 'Terraform은 단일 바이너리다. 버전조차 안 나오면 셸이 그 파일을 못 찾는 것이라 PATH부터 본다.' },
    { q: 'main.tf의 resource "aws_s3_bucket" "demo"에서 demo는 무엇인가?',
      o: ['.tf 안에서만 쓰는 로컬 이름', 'AWS에 만들어질 버킷 이름', 'provider의 이름'], a: 0,
      why: '첫 문자열은 provider가 정한 리소스 타입, 둘째 문자열은 코드 안에서 aws_s3_bucket.demo로 부르는 별칭이다. 실제 이름은 bucket 인자다.' },
    { q: 'terraform init을 실행한 뒤 Git에 커밋해야 하는 파일은 무엇인가?',
      o: ['.terraform/ 폴더', 'terraform.tfstate', '.terraform.lock.hcl'], a: 2,
      why: 'lock 파일은 팀 전원이 같은 provider 버전을 쓰게 한다. .terraform/은 다시 받으면 되고 state에는 비밀값이 들어 있다.' },
    { q: '빈 state에서 terraform plan을 돌렸을 때 aws_s3_bucket.demo의 id가 (known after apply)로 나오는 이유는 무엇인가?',
      o: ['provider가 아직 설치되지 않아서', '버킷을 실제로 만들어야 정해지는 값이라서', 'output 블록이 없어서'], a: 1,
      why: 'plan은 읽기만 하고 아무것도 만들지 않는다. id와 arn은 AWS가 자원을 만든 뒤에 돌려주는 값이다.' },
    { q: 'apply가 끝난 뒤 다음 plan의 비교 기준이 되는 것은 무엇인가?',
      o: ['main.tf의 output 블록', 'AWS 콘솔 화면', 'terraform.tfstate에 기록된 자원 ID와 속성'], a: 2,
      why: 'apply가 만든 자원의 ID와 속성이 terraform.tfstate에 기록된다. state를 잃으면 Terraform은 자기가 만든 버킷을 알아보지 못한다.' },
  ];
  const summary = [
    'Terraform은 실행 파일 하나라서 PATH에 넣고 terraform -v로 확인하면 설치가 끝난다.',
    'main.tf에는 provider와 리전, 만들 자원, 출력할 값을 적고 접속 키는 적지 않는다.',
    'init은 provider 플러그인과 lock 파일을 만들고 plan은 바뀔 것을 1 to add처럼 미리 보여 준다.',
    'apply는 yes를 받은 뒤 실제 버킷을 만들고 그 결과를 terraform.tfstate에 남긴다.',
  ];
  const review = [
    { q: '동료가 저장소를 받아 plan을 돌렸더니 provider 버전이 나와 달랐다. 무엇이 빠졌을 가능성이 큰가?',
      o: ['.terraform.lock.hcl을 커밋하지 않았다', '.gitignore에 *.tfstate를 넣었다', 'output 블록을 지웠다'], a: 0,
      why: 'lock 파일이 없으면 init이 ~> 5.0에 맞는 그때의 최신 버전을 받는다. 커밋해 두면 모두 같은 버전을 받는다.' },
    { q: '학습을 마치고 폴더를 지우기 전에 terraform.tfstate부터 지웠다. 무엇이 문제인가?',
      o: ['main.tf가 같이 지워진다', 'provider 플러그인을 다시 받아야 한다', 'Terraform이 만든 버킷을 알아보지 못해 destroy로 지울 수 없다'], a: 2,
      why: 'state가 Terraform이 만든 자원의 목록이다. state 없이 plan을 돌리면 버킷을 새로 만들려 하고, destroy는 지울 대상을 모른다.' },
    { q: 'CI에서 PR 때 리뷰한 계획 그대로만 적용하고 싶다. 알맞은 방법은?',
      o: ['apply를 두 번 돌린다', 'plan -out으로 저장한 파일을 apply에 넘긴다', 'init을 다시 돌린다'], a: 1,
      why: '저장한 계획 파일을 apply에 넘기면 리뷰한 그 변경만 실행된다. 그 사이 코드가 바뀌어도 다른 변경이 끼어들지 않는다.' },
  ];

  R.page({ title: '첫 terraform apply', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
