/* V-1-1 lifecycle 옵션 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 틀: 왼쪽 .tf 코드(원하는 상태) · 오른쪽 AWS(실제 리소스) · 아래 plan 출력(+ ~ - -/+ +/-).
 * plan 출력 줄은 terraform 을 실행한 결과가 아니라 동작 규칙으로 만든 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, tokens, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, cross, check, lock, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const SYM = { '+': GOOD, '~': WARN, '-': BAD, '-/+': BAD, '+/-': GOOD };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // .tf 코드 카드: rows = [{ s, hi, op, strike, col }]
  function codeCard(x, y, w, file, rows, o) { o = o || {}; const lh = o.lh || 23, h = 34 + rows.length * lh + 10;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    el('rect', { x, y, width: w, height: 28, rx: 10, fill: SOFT, opacity: o.op ?? 1 });
    mono(x + 14, y + 19, file, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: o.op ?? 1 });
    rows.forEach((r, i) => { if (!r) return; const op = (r.op ?? 1) * (o.op ?? 1); if (op <= 0) return; const yy = y + 34 + i * lh;
      if (r.hi) el('rect', { x: x + 6, y: yy, width: w - 12, height: lh, rx: 4, fill: r.hi === 'bad' ? BADBG : r.hi === 'warn' ? WARNBG : ACCBG, opacity: op });
      const t = spans(x + 16, yy + lh / 2 + 5, r.col ? [[r.s, { fill: r.col }]] : tokens(r.s), { 'font-size': 14.5, opacity: op });
      if (r.strike) el('line', { x1: x + 14, y1: yy + lh / 2, x2: x + 14 + Math.min(w - 28, tw(r.s, 14.5)) * r.strike, y2: yy + lh / 2, stroke: BAD, 'stroke-width': 2.4, opacity: op }); });
    return h; }
  // plan 출력 한 줄: 기호(색) + 주소 + 설명
  function planRow(x, y, sym, addr, desc, op, o) { o = o || {}; if ((op ?? 1) <= 0) return;
    mono(x, y, sym, { 'font-size': 16, 'font-weight': 800, fill: SYM[sym] || INK, opacity: op });
    mono(x + (sym.length > 1 ? 44 : 22), y, addr, { 'font-size': 14.5, 'font-weight': 700, fill: o.col || INK, opacity: op });
    if (desc) mono(x + (sym.length > 1 ? 44 : 22) + tw(addr, 14.5) + 14, y, desc, { 'font-size': 13.5, fill: o.dcol || MUT, opacity: op }); }
  // plan 출력 상자 (아래 띠)
  function planBox(y, h, title, op) { el('rect', { x: 24, y, width: 912, height: h, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op ?? 1 });
    tx(40, y + 22, title || 'terraform plan (예시)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op ?? 1 }); }
  function cloud(x, y, w, h, op) { zone(x, y, w, h, 'AWS (실제 리소스)', { fill: SOFT, stroke: GRID, sw: 1.5, op }); }
  // 방패(가드): col 색, s 크기
  function shield(cx, cy, s, col, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s, o.op);
    el('path', { d: 'M0,-24 L20,-15 V3 C20,15 9,23 0,27 C-9,23 -20,15 -20,3 V-15 Z', fill: o.fill || GOODBG, stroke: col || GOOD, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, g);
    if (o.open) el('path', { d: 'M-8,-2 V-8 A8,8 0 0 1 8,-8', fill: 'none', stroke: col || GOOD, 'stroke-width': 2.6 }, g);
    else el('path', { d: 'M-8,-2 V-8 A8,8 0 0 1 8,-8 V-2', fill: 'none', stroke: col || GOOD, 'stroke-width': 2.6 }, g);
    el('rect', { x: -10, y: -2, width: 20, height: 14, rx: 3, fill: col || GOOD }, g); }
  function bucket(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-36,-26 L36,-26 L28,26 L-28,26 Z', fill: PANEL, stroke: c, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: 0, cy: -26, rx: 36, ry: 9, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    if (name) tx(0, 50, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: c }, g); return g; }
  const chip = (cx, cy, s, col, sc, o) => pill(cx, cy, s, col, sc, Object.assign({ mono: true, fs: 13.5, fill: PANEL }, o || {}));
  // 인스턴스 네모 (ASG)
  function inst(cx, cy, col, s, o) { o = o || {}; if (s <= 0) return; card(cx, cy, 34, 34, { rx: 6, fill: o.fill || PANEL, stroke: col || INK, sw: 2.2, s, text: o.t || '', fs: 13.5, mono: true, color: col || INK }); }

  // ================= 1. prevent_destroy =================
  const PD = (k, u) => { // 코드 줄
    const lc = k >= 1 && k !== 5, val = k === 3 ? 'false' : 'true';
    return [
      { s: 'resource "aws_db_instance" "prod" {', strike: k === 5 ? E(u, 0.2, 1.0) : 0 },
      { s: '  identifier        = "myapp-prod-db"', hi: k === 2 ? 'bad' : null, strike: k === 5 ? E(u, 0.3, 1.1) : 0 },
      { s: '  allocated_storage = 100', strike: k === 5 ? E(u, 0.4, 1.2) : 0 },
      lc || k === 5 ? { s: '  lifecycle {', hi: k === 1 || k === 3 ? 'acc' : null, op: k === 1 ? fade(u, 0.2) : 1, strike: k === 5 ? E(u, 0.5, 1.3) : 0 } : { s: '' },
      lc || k === 5 ? { s: `    prevent_destroy = ${val}`, hi: k === 1 ? 'acc' : k === 3 ? 'warn' : null, op: k === 1 ? fade(u, 0.5) : 1, strike: k === 5 ? E(u, 0.6, 1.4) : 0 } : { s: '' },
      lc || k === 5 ? { s: '  }', op: k === 1 ? fade(u, 0.7) : 1, strike: k === 5 ? E(u, 0.7, 1.5) : 0 } : { s: '' },
      { s: '}', strike: k === 5 ? E(u, 0.8, 1.6) : 0 },
    ]; };
  function s1(t, c) { const { k, u } = c;
    if (k === 4) { // 흔한 실수: 환경별로 가드가 다르다
      tx(480, 40, '가드가 걸린 곳과 빠진 곳', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      const items = [[170, 'prod DB', true, 'db'], [400, 'user_data 버킷', true, 'b'], [630, 'staging DB', false, 'db']];
      items.forEach(([x, name, guard, kind], i) => { const s = pop(u, 0.2 + i * 0.25), gone = !guard && seg(u, 1.6, 2.2);
        if (kind === 'db') dbIcon(x, 140, name, { s, op: 1 - 0.75 * gone, stroke: gone ? OFF : INK }); else bucket(x, 140, name, { s });
        if (guard) shield(x + 52, 112, pop(u, 0.6 + i * 0.25), GOOD);
        else { mono(x, 232, '가드 없음', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); if (gone) cross(x, 140, 22, gone); } });
      fly(630, 330, 630, 170, seg(u, 0.9, 1.6), 'terraform destroy (staging)', { mono: true, fill: BAD });
      card(820, 160, 190, 120, { rx: 10, stroke: WARN, dash: '6 5', s: pop(u, 1.4) });
      mono(820, 130, 'module "db"', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      shield(820, 172, pop(u, 1.6) * 0.8, WARN, { fill: WARNBG });
      tx(820, 214, '안에 숨은 가드', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      planBox(290, 110, '점검', fade(u, 1.8));
      note(44, 340, '환경마다 가드 정책이 같은지 본다 (dev · staging · prod)', fade(u, 2.0));
      note(44, 372, '모듈 안의 prevent_destroy는 모듈 README에 적어 둔다', fade(u, 2.2)); return; }
    const hh = codeCard(24, 24, 400, 'prevent-destroy.tf', PD(k, u), { op: k === 0 ? fade(u, 0.1) : 1, stroke: k === 5 ? BAD : GRID, dash: k === 5 ? '6 5' : null });
    if (k === 5) mono(408, 24 + hh + 20, '블록 통째로 삭제', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.4) });
    cloud(452, 24, 484, 220);
    const dbGone = (k === 0 && seg(u, 1.6, 2.3)) || (k === 5 && seg(u, 1.9, 2.5)) || (k === 3 && seg(u, 2.1, 2.7) * 0.0);
    dbIcon(600, 130, 'myapp-prod-db', { s: k === 0 ? pop(u, 0.2) : 1, op: 1 - 0.7 * dbGone, stroke: dbGone ? OFF : INK });
    mono(600, 222, '100 GB · 회원 데이터', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.5) : 1 });
    const guarded = k === 1 || k === 2, sh = k === 1 ? pop(u, 0.8) : guarded ? 1 : k === 3 ? 1 : k === 5 ? 1 - seg(u, 1.0, 1.6) : 0;
    if (sh > 0) shield(672, 100, sh, k === 3 ? WARN : GOOD, { open: k === 3 && u > 1.2, fill: k === 3 ? WARNBG : GOODBG });
    if (k === 0) { fly(830, 130, 640, 130, seg(u, 0.6, 1.5), 'destroy', { mono: true, fill: BAD }); if (dbGone) cross(600, 130, 22, dbGone); }
    if (k === 1) { const b = seg(u, 1.1, 2.0), x = b < 0.6 ? lerp(860, 712, b / 0.6) : lerp(712, 800, (b - 0.6) / 0.4);
      if (b > 0 && b < 1) card(x, 100, 86, 28, { rx: 14, fill: BAD, stroke: 'none', text: 'destroy', fs: 13.5, fw: 700, color: PANEL, mono: true });
      if (b >= 1) chip(820, 100, 'destroy', BAD, 1); mono(820, 150, '튕겨 나옴', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k === 5 && dbGone) cross(600, 130, 22, dbGone);
    // 아래: plan 출력
    planBox(262, 140, k === 3 ? '해제 순서' : 'terraform plan / destroy 출력 (예시)');
    if (k === 0) { planRow(44, 312, '-', 'aws_db_instance.prod', 'will be destroyed', fade(u, 1.2));
      mono(44, 344, 'Plan: 0 to add, 0 to change, 1 to destroy.', { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.5) });
      note(44, 380, '확인 한 번이면 운영 DB가 사라진다', fade(u, 2.0), { fill: BAD }); }
    if (k === 1) { mono(44, 314, 'Error: Instance cannot be destroyed', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      mono(44, 344, '  aws_db_instance.prod has lifecycle.prevent_destroy set', { 'font-size': 14, fill: INK, opacity: fade(u, 1.6) });
      note(44, 380, 'plan 단계에서 멈춘다. apply까지 가지 않는다', fade(u, 2.0), { fill: GOOD }); }
    if (k === 2) { tx(44, 312, 'identifier 변경', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      planRow(44, 342, '-/+', 'aws_db_instance.prod', 'must be replaced', fade(u, 0.6));
      cross(420, 334, 10, pop(u, 1.0)); mono(440, 342, '차단', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      tx(520, 312, 'tags 수정', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      planRow(520, 342, '~', 'aws_db_instance.prod', 'update in-place', fade(u, 1.5));
      check(870, 334, 10, pop(u, 1.9)); note(44, 384, '막는 기준은 명령이 아니라 "삭제가 일어나는가"', fade(u, 2.2)); }
    if (k === 3) { [['① 코드에서 false', WARN], ['② apply (가드만 해제)', WARN], ['③ destroy 실행', BAD]].forEach(([s, col], i) => {
        const x = 150 + i * 310; chip(x, 330, s, col, pop(u, 0.3 + i * 0.6), { mono: false, fs: 14.5 });
        if (i < 2) grow(x + 112, 330, x + 196, 330, E(u, 0.6 + i * 0.6, 1.0 + i * 0.6), MUT); });
      note(44, 384, 'apply가 두 번 필요하다. 그 사이에 한 번 더 생각하게 된다', fade(u, 2.2)); }
    if (k === 5) { planRow(44, 314, '-', 'aws_db_instance.prod', 'will be destroyed', fade(u, 1.6));
      mono(44, 344, 'Plan: 0 to add, 0 to change, 1 to destroy.', { 'font-size': 14.5, opacity: fade(u, 1.8) });
      note(44, 380, '가드는 코드 안에 있다. 블록이 없어지면 막을 것도 없다', fade(u, 2.2), { fill: BAD }); } }

  // ================= 2. create_before_destroy =================
  function gantt(u) { const X = (v) => 250 + v * 6.4; // v: 0~100 시간
    const row = (y, name, sym, bars) => { tx(40, y + 6, name, { 'font-size': 15, 'font-weight': 700 }); mono(40, y + 30, sym, { 'font-size': 14, 'font-weight': 800, fill: SYM[sym] });
      bars.forEach(([a, b, col, label, hatch], i) => { const g = E(u, 0.2 + i * 0.35, 0.8 + i * 0.35); if (g <= 0) return; const w = (X(b) - X(a)) * g;
        el('rect', { x: X(a), y: y - 14, width: w, height: 30, rx: 5, fill: hatch ? BADBG : col, stroke: hatch ? BAD : 'none', 'stroke-dasharray': hatch ? '5 4' : null, 'stroke-width': 2, opacity: hatch ? 1 : 0.9 });
        if (g > 0.6) tx(X(a) + w / 2, y + 6, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: hatch ? BAD : PANEL }); }); };
    row(90, '기본 순서', '-/+', [[0, 40, MUT, '헌 SG'], [40, 56, null, '다운타임', true], [56, 100, ACC, '새 SG']]);
    row(200, 'create_before_destroy', '+/-', [[0, 60, MUT, '헌 SG'], [36, 100, ACC, '새 SG']]);
    // 겹친 구간 표시
    const ov = fade(u, 1.6); if (ov > 0) { el('rect', { x: X(36), y: 168, width: X(60) - X(36), height: 66, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: ov });
      tx(X(48), 252, '둘 다 떠 있는 구간', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: ov }); check(X(48) + 4, 164, 8, pop(u, 1.8) * 0.9); }
    grow(250, 290, 900, 290, E(u, 0.1, 0.6), MUT); tx(900, 312, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  function sgCard(cx, cy, title, nameLine, o) { o = o || {}; const w = o.w || 250;
    card(cx, cy, w, o.h || 96, { rx: 10, stroke: o.col || INK, sw: 2.2, s: o.s ?? 1, op: o.op, fill: o.fill });
    if ((o.s ?? 1) < 0.5) return;
    mono(cx - w / 2 + 14, cy - (o.h || 96) / 2 + 24, title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: o.op });
    mono(cx - w / 2 + 14, cy - (o.h || 96) / 2 + 50, nameLine, { 'font-size': 14.5, 'font-weight': 700, fill: o.ncol || INK, opacity: o.op }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { gantt(u);
      planBox(330, 76, 'plan이 쓰는 기호', fade(u, 1.9));
      planRow(44, 386, '-/+', '', 'destroy and then create replacement', fade(u, 2.0), { dcol: INK });
      planRow(500, 386, '+/-', '', 'create replacement and then destroy', fade(u, 2.2), { dcol: INK }); return; }
    if (k === 1) { tx(250, 44, 'name = "web-sg" (고정)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono' });
      tx(710, 44, 'name_prefix = "web-sg-"', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC });
      sgCard(250, 120, '헌 SG', 'web-sg', { s: pop(u, 0.2) }); sgCard(250, 250, '새 SG (먼저 생성)', 'web-sg', { s: pop(u, 0.6), col: BAD, ncol: BAD });
      cross(400, 250, 14, pop(u, 1.1)); mono(250, 330, '같은 이름 → 생성 실패', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sgCard(710, 120, '헌 SG', 'web-sg-<접미사 A>', { s: pop(u, 1.0), w: 300 }); sgCard(710, 250, '새 SG (먼저 생성)', 'web-sg-<접미사 B>', { s: pop(u, 1.4), col: ACC, ncol: ACC, w: 300 });
      check(880, 250, 12, pop(u, 1.9)); mono(710, 330, '접미사는 provider가 붙인다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      el('line', { x1: 480, y1: 70, x2: 480, y2: 360, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' }); return; }
    if (k === 2) { sgCard(230, 150, 'aws_security_group.web (헌)', 'web-sg-<A>', { h: 150, w: 330 });
      chip(230, 190, 'ingress 80/tcp · 0.0.0.0/0', INK, 1);
      sgCard(700, 150, 'aws_security_group.web (새)', 'web-sg-<B>', { h: 150, w: 330, col: ACC, s: pop(u, 0.2) });
      fly(230, 190, 700, 190, seg(u, 0.6, 1.6), 'ingress 80/tcp · 0.0.0.0/0', { mono: true, fill: ACC, stay: true });
      note(480, 300, '규칙은 그대로 새 SG로 옮겨 간다', fade(u, 1.8), { 'text-anchor': 'middle' });
      note(480, 334, '잘못된 규칙도 그대로 옮겨 간다', fade(u, 2.2), { 'text-anchor': 'middle', fill: WARN }); return; }
    if (k === 3) { // 실제 교체 순서
      const st = [['새 SG 생성', ACC, 0.2], ['헬스체크 통과', GOOD, 0.9], ['헌 SG 삭제', BAD, 1.6]];
      st.forEach(([s, col, a], i) => { const x = 170 + i * 310; card(x, 90, 220, 54, { rx: 10, stroke: col, sw: 2.4, s: pop(u, a), text: `${i + 1}. ${s}`, fs: 15, color: col });
        if (i < 2) grow(x + 112, 90, x + 196, 90, E(u, a + 0.4, a + 0.7), MUT); });
      sgCard(260, 210, '헌 SG', 'web-sg-<A>', { op: 1 - 0.7 * seg(u, 1.7, 2.3), col: seg(u, 1.7, 2.3) > 0.5 ? OFF : INK });
      if (u > 2.0) cross(260, 210, 18, pop(u, 2.0));
      sgCard(700, 210, '새 SG', 'web-sg-<B>', { col: ACC, s: pop(u, 0.3) }); if (u > 1.0) check(810, 190, 10, pop(u, 1.0));
      planBox(286, 112, 'terraform plan (예시)');
      planRow(44, 336, '+/-', 'aws_security_group.web', 'must be replaced (description 변경)', fade(u, 0.4));
      mono(44, 370, 'Plan: 1 to add, 0 to change, 1 to destroy.', { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.8) }); return; }
    if (k === 4) { // Launch Template: 새 버전 추가
      card(250, 200, 300, 250, { rx: 12, stroke: INK, sw: 2.2 });
      mono(120, 100, 'aws_launch_template.web', { 'font-size': 14.5, 'font-weight': 800 });
      mono(120, 124, 'name_prefix = "web-lt-"', { 'font-size': 13.5, fill: MUT });
      [['v1', 'ami-…old', 1], ['v2', 'ami-…new', pop(u, 0.9)]].forEach(([v, ami, s], i) => { if (s <= 0) return; const y = 170 + i * 64;
        card(250, y, 250, 50, { rx: 8, stroke: i ? ACC : GRID, sw: 2, s, fill: i ? ACCBG : PANEL });
        if (s > 0.6) { mono(140, y + 5, v, { 'font-size': 15, 'font-weight': 800, fill: i ? ACC : MUT }); mono(190, y + 5, 'image_id = ' + ami, { 'font-size': 14, fill: INK }); } });
      fly(620, 234, 360, 234, seg(u, 0.3, 0.9), 'var.ami_id 변경', { mono: true, fill: WARN });
      el('rect', { x: 540, y: 80, width: 396, height: 120, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.3) });
      tx(556, 102, 'terraform plan (예시)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.3) });
      planRow(560, 136, '~', 'aws_launch_template.web', '', fade(u, 1.4)); mono(582, 170, 'image_id 변경 → 새 버전 v2', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      card(738, 290, 396, 110, { rx: 10, stroke: WARN, sw: 2, dash: '6 5', s: pop(u, 1.9) });
      note(560, 280, 'LT를 통째로 갈아야 할 때를 대비해', fade(u, 2.0)); mono(560, 312, 'create_before_destroy = true', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { // ASG instance refresh
      tx(480, 44, 'ASG 인스턴스 4대 · instance_refresh', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      const sw = (i) => seg(u, 0.4 + i * 0.5, 0.8 + i * 0.5);
      for (let i = 0; i < 4; i++) { const x = 270 + i * 140, s = sw(i), newer = s >= 0.5;
        inst(x, 150, newer ? ACC : MUT, 1, { t: newer ? 'v2' : 'v1', fill: newer ? ACCBG : PANEL });
        if (s > 0 && s < 1) el('circle', { cx: x, cy: 150, r: 26 + 6 * Math.sin(s * Math.PI), fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); }
      hbar(270, 220, 420, Math.round(4 * E(u, 0.4, 2.4)), 4, { col: ACC, text: Math.round(4 * E(u, 0.4, 2.4)) + ' / 4 교체' });
      zone(120, 270, 720, 112, null, { fill: SOFT });
      note(144, 306, 'Terraform: 새 LT(버전)를 먼저 준비하는 순서를 맡는다', fade(u, 1.0));
      note(144, 342, 'ASG: 인스턴스를 몇 대씩, 얼마나 빨리 바꿀지 맡는다', fade(u, 1.6));
      return; }
    // k === 6: name 충돌
    sgCard(230, 110, 'aws_iam_role (헌)', 'name = "app-role"', { w: 300 });
    sgCard(230, 240, 'aws_iam_role (새, 먼저 생성)', 'name = "app-role"', { w: 300, col: BAD, ncol: BAD, s: pop(u, 0.3) });
    cross(410, 240, 14, pop(u, 0.9));
    el('rect', { x: 520, y: 70, width: 416, height: 120, rx: 10, fill: INK, opacity: fade(u, 0.7) });
    mono(540, 110, 'Error: EntityAlreadyExists', { 'font-size': 15, 'font-weight': 800, fill: '#f87171', opacity: fade(u, 0.9) });
    mono(540, 140, 'Role with name app-role', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 1.1) }); mono(540, 166, 'already exists.', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 1.1) });
    chip(728, 250, 'name_prefix = "app-role-"', GOOD, pop(u, 1.6)); chip(728, 300, 'name에 random_id 붙이기', GOOD, pop(u, 1.9));
    note(520, 360, 'CBD와 name_prefix는 한 세트로 쓴다', fade(u, 2.2)); }

  // ================= 3. ignore_changes =================
  const ASG = (k, u) => [
    { s: 'resource "aws_autoscaling_group" "web" {' },
    { s: '  min_size         = 2' }, { s: '  max_size         = 10' },
    { s: '  desired_capacity = 2', hi: k === 0 || k === 4 ? 'acc' : null },
    { s: '  launch_template { version = "$Latest" }', hi: k === 1 ? 'acc' : null },
    { s: '  tag { key = "Name" value = "web-asg" }', hi: k === 2 ? 'acc' : null },
    k >= 3 ? { s: '  lifecycle { ignore_changes = [', hi: k === 3 ? 'acc' : null, op: k === 3 ? fade(u, 0.2) : 1 } : { s: '' },
    k >= 3 ? { s: '    desired_capacity, tag ] }', hi: k === 3 ? 'acc' : null, op: k === 3 ? fade(u, 0.5) : 1 } : { s: '' },
    { s: '}' },
  ];
  function asgBox(x, y, n, o) { o = o || {}; zone(x, y, 400, 150, 'aws_autoscaling_group.web', { fill: PANEL, stroke: GRID, sw: 1.5 });
    for (let i = 0; i < 10; i++) { const cx = x + 36 + (i % 5) * 46, cy = y + 66 + Math.floor(i / 5) * 46, on = i < n;
      if (on) inst(cx, cy, INK, o.pop ? o.pop(i) : 1); else el('rect', { x: cx - 17, y: cy - 17, width: 34, height: 34, rx: 6, fill: 'none', stroke: GRID, 'stroke-dasharray': '3 4', 'stroke-width': 1.5 }); }
    mono(x + 380, y + 22, `desired ${Math.round(n)}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: o.col || INK }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { // 시간에 따른 desired_capacity
      const ax = axes(90, 60, 760, 240, { x: [0, 10], y: [0, 10], yt: [0, 2, 4, 6, 8, 10], xl: '시간 →', yl: 'desired_capacity', grid: true });
      line(ax, [[0, 2], [2, 2], [3, 5], [4, 8], [10, 8]], E(u, 0.2, 1.4), ACC, { sw: 3 });
      line(ax, [[6, 8], [6.1, 2], [10, 2]], E(u, 1.5, 2.2), BAD, { sw: 2.5, dash: '7 5' });
      mono(ax.X(6.2), ax.Y(2) - 12, 'ignore 없이 apply → 2로 되돌림', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      mono(ax.X(0.2), ax.Y(2) - 12, '생성: 코드값 2', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(ax.X(4.3), ax.Y(8) - 12, 'AutoScaling이 8로', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      note(90, 395, 'ignore_changes가 있으면 다음 plan은 No changes', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 5) { tx(480, 40, 'Terraform밖에 주인이 있는 속성', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['ECS service', 'desired_count', '배포 도구'], ['Lambda', 'source_code_hash', 'CI'], ['EC2', 'ami', 'Image Builder'], ['EKS', 'kubernetes_version', '수동 업그레이드']].forEach(([r, a, who], i) => {
        const x = 130 + (i % 2) * 400, y = 100 + Math.floor(i / 2) * 96, s = pop(u, 0.2 + i * 0.3);
        card(x + 100, y, 360, 74, { rx: 10, stroke: WARN, sw: 2, s, fill: WARNBG });
        if (s > 0.6) { tx(x - 66, y - 6, r, { 'font-size': 15, 'font-weight': 700 }); mono(x - 66, y + 20, a, { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); tx(x + 266, y + 8, '주인: ' + who, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); } });
      card(480, 340, 420, 56, { rx: 10, stroke: BAD, sw: 2.2, s: pop(u, 1.6) });
      mono(480, 346, 'ignore_changes = all', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); cross(300, 340, 12, pop(u, 2.0));
      return; }
    codeCard(24, 24, 470, 'ignore-changes.tf', ASG(k, u), { lh: 21 });
    const real = k === 3 ? 8 : 2;
    asgBox(512, 24, k === 3 ? tween(2, 8, u) : 2, { pop: k === 0 ? (i) => pop(u, 0.4 + i * 0.3) : null, col: k === 3 ? ACC : INK });
    planBox(268, 134, 'terraform plan (예시)');
    if (k === 0) { mono(44, 318, 'Plan: 1 to add, 0 to change, 0 to destroy.', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      note(44, 354, '생성할 때는 코드값 2가 그대로 쓰인다', fade(u, 1.5)); note(44, 386, '아직 ignore_changes 없음 · 매 apply가 실제 값을 2로 맞춘다', fade(u, 2.0), { fill: WARN }); }
    if (k === 1) { ['v1', 'v2', 'v3'].forEach((v, i) => chip(560 + i * 70, 216, v, i === 2 ? ACC : MUT, pop(u, 0.2 + i * 0.4)));
      mono(780, 222, '← $Latest', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      mono(44, 318, 'No changes.', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      note(44, 354, 'LT 버전이 올라가도 ASG 정의 문자열은 그대로다', fade(u, 1.8)); note(44, 386, '대신 어느 버전이 떠 있는지 코드로는 못 박는다', fade(u, 2.2), { fill: WARN }); }
    if (k === 2) { fly(900, 240, 850, 140, seg(u, 0.3, 1.1), '외부 태그', { fill: WARN });
      if (u > 1.1) chip(850, 140, '외부 태그', WARN, 1);
      planRow(44, 320, '~', 'aws_autoscaling_group.web', 'update in-place', fade(u, 1.3));
      planRow(66, 350, '-', 'tag { 외부 태그 }', '제거 예정', fade(u, 1.6));
      note(44, 386, '비용 태깅·보안 스캐너가 붙인 태그를 매번 지우려 든다', fade(u, 2.1), { fill: WARN }); }
    if (k === 3) { chip(850, 140, '외부 태그', WARN, 1);
      mono(44, 318, '실제 desired 8 · 코드 2 · 외부 태그 1개', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      mono(44, 352, 'No changes.', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      note(44, 386, '무시 목록에 넣은 속성은 이미 있는 리소스에서만 비교하지 않는다', fade(u, 2.0)); } }

  // ================= 4. replace_triggered_by =================
  const N = { ssm: [160, 110], ec2: [580, 110], iam: [580, 270] };
  function node(key, title, sub2, o) { o = o || {}; const [x, y] = N[key];
    card(x, y, o.w || 250, 78, { rx: 12, stroke: o.col || INK, sw: o.sw || 2.2, s: o.s ?? 1, fill: o.fill, op: o.op });
    if ((o.s ?? 1) < 0.5) return; mono(x, y - 6, title, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: o.col || INK, opacity: o.op });
    if (sub2) tx(x, y + 20, sub2, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 6) { tx(480, 40, '트리거는 재생성이 꼭 필요한 의존에만', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['ECS Task Definition', 'ECS Service 재배포', GOOD], ['Secrets Manager 값', '컨테이너 재기동', GOOD], ['자주 바뀌는 값', 'RDS 재생성', BAD]].forEach(([a, b, col], i) => {
        const y = 110 + i * 90, s = pop(u, 0.3 + i * 0.5);
        card(220, y, 280, 60, { rx: 10, stroke: INK, sw: 2, s, text: a, fs: 15 }); grow(366, y, 560, y, E(u, 0.5 + i * 0.5, 0.9 + i * 0.5), col === BAD ? BAD : ACC);
        card(700, y, 270, 60, { rx: 10, stroke: col, sw: 2.4, s: pop(u, 0.7 + i * 0.5), text: b, fs: 15, color: col, fill: col === BAD ? BADBG : PANEL }); });
      cross(856, 290, 12, pop(u, 2.0)); note(480, 400, '1.2 이상에서 쓸 수 있다. user_data에 해시를 넣는 방식과 비교해 고른다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    const ver = k <= 3 ? (k === 0 ? (u > 1.2 ? 2 : 1) : 1) : k === 4 ? Math.round(tween(3, 4, u)) : 4;
    // 간선: SSM → EC2 (부팅 때 읽음)
    const readOp = k >= 3 || k === 0 ? 1 : 0.35;
    el('line', { x1: 305, y1: 96, x2: 445, y2: 96, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: readOp });
    tx(375, 84, '부팅 때 한 번 읽음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: readOp });
    el('line', { x1: N.iam[0], y1: N.iam[1] - 39, x2: N.ec2[0], y2: N.ec2[1] + 39, stroke: GRID, 'stroke-width': 2 });
    node('ssm', 'aws_ssm_parameter.app_config', `/myapp/config · version ${ver}`, { col: k === 1 || k >= 4 ? WARN : INK, fill: k === 1 || k >= 4 ? WARNBG : PANEL, w: 290, s: k === 1 ? pop(u, 0.2) : 1 });
    const repl = k >= 4;
    node('ec2', 'aws_instance.app', k === 5 && u > 1.0 ? '새 인스턴스 · log_level DEBUG' : repl ? '강제 재생성 대상' : k === 0 && u > 1.2 ? '옛 설정으로 계속 실행' : 'ami · instance_type 고정', { col: repl ? ACC : INK, fill: repl ? ACCBG : PANEL, w: 270, s: k === 2 ? pop(u, 0.2) : 1 });
    node('iam', 'aws_iam_instance_profile.app', '권한', { col: k >= 4 ? WARN : INK, w: 290 });
    if (k >= 4) { // 트리거 간선이 자란다
      const g = k === 4 ? E(u, 0.2, 1.0) : 1; grow(305, 128, 443, 128, g, ACC, { sw: 3.4 });
      grow(N.iam[0] - 60, N.iam[1] - 40, N.ec2[0] - 60, N.ec2[1] + 40, g, ACC, { sw: 3.4 });
      mono(500, 196, 'replace_triggered_by', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: g, 'text-anchor': 'end' }); if (0) mono(300, 220, 'replace_triggered_by', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: g }); }
    // 오른쪽 위: 설명 영역
    if (k === 0) { fly(160, 250, 160, 150, seg(u, 0.4, 1.1), 'log_level 변경', { fill: WARN }); }
    if (k === 1) { snippetLines(30, 186, ['jsonencode({', '  log_level = var.log_level', '  feature_x = var.feature_x_enabled', '})'], fade(u, 0.6)); }
    if (k === 2) { [['ami', '= 그대로'], ['instance_type', '= 그대로'], ['iam_instance_profile', '= 그대로']].forEach(([a, b], i) => {
        mono(40, 210 + i * 32, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.3) }); mono(380, 210 + i * 32, b, { 'font-size': 14, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.3) }); }); }
    if (k === 3) { // 부팅 시간선: user_data 는 한 번만
      const X0 = 40, X1 = 400; grow(X0, 250, X1, 250, E(u, 0.2, 0.8), MUT, { plain: true });
      el('circle', { cx: X0 + 30, cy: 250, r: 8, fill: ACC, opacity: fade(u, 0.6) }); mono(X0 + 30, 280, '부팅', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.7) });
      el('circle', { cx: X0 + 230, cy: 250, r: 8, fill: WARN, opacity: fade(u, 1.2) }); mono(X0 + 230, 280, '설정 변경 (반영 안 됨)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.3) });
      mono(X0 + 30, 220, 'user_data는 여기서 한 번만 돈다', { 'font-size': 14, opacity: fade(u, 1.8) }); }
    // 아래: plan
    planBox(340, 70, 'terraform plan (예시)');
    if (k <= 3) { if (k === 0) { planRow(44, 388, '~', 'aws_ssm_parameter.app_config', 'update in-place', fade(u, 1.4)); mono(590, 388, 'EC2는 계획에 없음', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
      else mono(44, 388, k === 1 ? 'Plan: 1 to add, 0 to change, 0 to destroy. (version 1)' : 'No changes. (EC2 속성 diff 없음)', { 'font-size': 14.5, fill: k === 1 ? INK : MUT, opacity: fade(u, 1.2) }); }
    if (k === 4) { planRow(44, 388, '+/-', 'aws_instance.app', '', fade(u, 1.2)); mono(330, 388, 'Plan: 1 to add, 1 to change, 1 to destroy.', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 5) { [['① SSM update', WARN, 0.2], ['② 새 EC2 생성', ACC, 0.8], ['③ 헌 EC2 삭제', BAD, 1.4]].forEach(([s, col, a], i) => chip(130 + i * 250, 384, s, col, pop(u, a), { mono: false, fs: 14.5 }));
      [0, 1].forEach((i) => grow(212 + i * 250, 384, 300 + i * 250, 384, E(u, 0.5 + i * 0.6, 0.8 + i * 0.6), MUT));
      chip(790, 384, 'INFO → DEBUG', WARN, pop(u, 2.0)); } }
  function snippetLines(x, y, lines, op) { el('rect', { x, y, width: Math.max(...lines.map((l) => tw(l, 13.5))) + 24, height: lines.length * 24 + 18, rx: 8, fill: SOFT, stroke: GRID, opacity: op });
    lines.forEach((s, i) => spans(x + 10, y + 26 + i * 24, tokens(s), { 'font-size': 13.5, opacity: op })); }

  // ================= 5. 시나리오별 선택 =================
  const Q = [['Q1 사라지면 복구가 안 되나?', 'prevent_destroy'], ['Q2 교체 중 다운타임이 안 되나?', 'create_before_destroy'], ['Q3 Terraform 밖에서 값을 바꾸나?', 'ignore_changes'], ['Q4 다른 것이 바뀌면 같이 새로?', 'replace_triggered_by']];
  function ladder(k, u) { Q.forEach(([q, opt], i) => { const y = 70 + i * 62, on = k === 0 || k - 1 === i, s = k === 0 ? pop(u, 0.2 + i * 0.35) : 1;
    card(220, y, 380, 48, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 2.6 : 1.5, s, fill: on && k > 0 ? ACCBG : PANEL });
    if (s > 0.6) tx(44, y + 6, q, { 'font-size': 15, 'font-weight': 700, fill: on ? INK : MUT });
    grow(412, y, 470, y, k === 0 ? E(u, 0.5 + i * 0.35, 0.8 + i * 0.35) : 1, on ? ACC : GRID);
    if (s > 0.6) mono(480, y + 6, opt, { 'font-size': 15, 'font-weight': 800, fill: on ? ACC : MUT }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k >= 0 && k <= 4) { ladder(k, u);
      if (k === 0) { note(44, 340, '네 질문은 서로 배타적이지 않다', fade(u, 1.9)); note(44, 372, 'YES가 여럿이면 옵션도 여럿을 함께 건다', fade(u, 2.2)); return; }
      const ex = [[['운영 DB', 'NS 레코드', 'KMS Key'], null, 'Q1의 기준은 "귀찮은가"가 아니라 "복구가 되는가"'],
        [['Launch Template', 'ALB Target Group'], 'name_prefix 같이', 'Q2가 YES면 이름 전략도 같이 정한다'],
        [['ASG desired_capacity', 'ECS desired_count'], 'ignore_changes = all 금지', 'Q3는 이 값의 주인이 누구인지 정하는 일'],
        [['SSM 변경 → EC2'], 'RDS에 트리거 금지', 'Q4는 런타임 의존을 코드로 적는 일']][k - 1];
      ex[0].forEach((s, i) => chip(780, 110 + i * 52, s, ACC, pop(u, 0.4 + i * 0.35), { mono: false, fs: 14.5 }));
      if (ex[1]) { const bad = /금지/.test(ex[1]); chip(780, 110 + ex[0].length * 52 + 6, ex[1], bad ? BAD : WARN, pop(u, 1.5), { mono: false, fs: 14.5 }); }
      note(44, 372, ex[2], fade(u, 2.0)); return; }
    if (k === 5) { // 조합 레시피 표
      const rows = [['운영 RDS', [1, 0, 1, 0]], ['ALB Target Group', [0, 1, 0, 0]], ['Launch Template', [0, 1, 0, 1]], ['AutoScaling Group', [0, 0, 1, 1]], ['ECS Service', [0, 1, 1, 0]], ['Route53 NS', [1, 0, 0, 0]], ['IAM Role (운영)', [1, 1, 0, 0]], ['KMS Key', [1, 0, 0, 0]]];
      const cols = ['prevent', 'CBD', 'ignore', 'replace_by'];
      cols.forEach((s, j) => mono(330 + j * 140, 40, s, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
      rows.forEach(([name, v], i) => { const y = 66 + i * 42, a = fade(u, 0.2 + i * 0.22); tx(40, y + 22, name, { 'font-size': 15, 'font-weight': 700, opacity: a });
        v.forEach((on, j) => { const s = on ? pop(u, 0.35 + i * 0.22 + j * 0.05) : a; el('rect', { x: 330 + j * 140 - 56, y: y + 4, width: 112, height: 32, rx: 6, fill: on ? ACC : SOFT, opacity: on ? 0.85 * s : a }); }); });
      tx(900, 400, '표는 출발점, 우리 환경에서 누가 무엇을 바꾸는지가 먼저', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.2) }); return; }
    if (k === 6) { tx(480, 40, '피해야 할 다섯 가지', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      ['모든 리소스에 prevent_destroy', 'ignore_changes = all', 'lifecycle을 모듈 안에 숨김', 'CBD만 걸고 name 고정', 'RDS에 replace_triggered_by'].forEach((s, i) => {
        const y = 86 + i * 62, s2 = pop(u, 0.2 + i * 0.35); card(480, y, 520, 48, { rx: 24, stroke: BAD, sw: 2, s: s2, fill: BADBG });
        if (s2 > 0.6) { tx(270, y + 6, s, { 'font-size': 15.5, 'font-weight': 700 }); cross(690, y, 9, s2); } }); return; }
    // k === 7: 체크리스트
    tx(480, 40, '운영 체크리스트', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    ['운영 DB · 스토리지에 prevent_destroy', '트래픽 받는 리소스에 create_before_destroy', 'ASG desired_capacity를 ignore_changes에', 'lifecycle 변경은 PR 리뷰 필수', '환경별(dev · staging · prod) 가드 정책'].forEach((s, i) => {
      const y = 86 + i * 62, d = seg(u, 0.3 + i * 0.4, 0.6 + i * 0.4);
      el('rect', { x: 200, y: y - 16, width: 32, height: 32, rx: 6, fill: d >= 1 ? GOODBG : PANEL, stroke: d > 0 ? GOOD : GRID, 'stroke-width': 2 });
      if (d > 0) check(216, y, 9, d); tx(252, y + 6, s, { 'font-size': 15.5, 'font-weight': 600, fill: d > 0 ? INK : MUT }); }); }

  const quiz = [
    { q: 'prevent_destroy = true를 건 DB의 identifier를 바꾸고 plan을 돌리면 어떻게 되는가?',
      o: ['identifier만 in-place로 바뀐다', '교체(-/+)가 필요해서 plan이 에러로 멈춘다', 'prevent_destroy가 무시되고 교체된다'], a: 1,
      why: 'identifier 변경은 재생성을 부르고, 재생성은 삭제를 포함한다. prevent_destroy는 삭제가 일어나는 계획이면 명령과 상관없이 막는다.' },
    { q: 'create_before_destroy를 건 보안 그룹에 name = "web-sg"를 고정하면 무엇이 문제인가?',
      o: ['새 SG를 먼저 만들 때 같은 이름이라 생성이 실패한다', '헌 SG가 삭제되지 않고 계속 남는다', 'plan 기호가 -/+로 바뀐다'], a: 0,
      why: 'CBD는 새 리소스를 먼저 만든다. 이름이 유일해야 하는 리소스는 헌 것과 이름이 겹치므로 name_prefix를 써야 한다.' },
    { q: 'ASG desired_capacity를 ignore_changes에 넣은 뒤 AutoScaling이 2를 8로 늘렸다. 다음 plan 결과는 무엇인가?',
      o: ['desired_capacity 8 → 2 update', 'ASG 교체(-/+)', 'No changes'], a: 2,
      why: '무시 목록의 속성은 이미 만든 리소스에서 비교하지 않는다. 그래서 실제 8과 코드 2가 달라도 변경 계획이 없다.' },
    { q: 'SSM 파라미터만 바뀌고 EC2 속성은 그대로일 때, replace_triggered_by가 없으면 plan은 EC2를 어떻게 다루는가?',
      o: ['EC2를 교체한다', 'EC2는 계획에 넣지 않는다', 'EC2를 in-place로 재부팅한다'], a: 1,
      why: 'Terraform은 그 리소스 속성의 diff만 본다. 부팅 때 읽는 설정 같은 런타임 의존은 replace_triggered_by로 알려 줘야 한다.' },
    { q: '외부 배포 도구가 ECS desired_count를 바꾸는 서비스에 맞는 옵션은 무엇인가?',
      o: ['prevent_destroy', 'ignore_changes = [desired_count]', 'ignore_changes = all'], a: 1,
      why: 'Q3에 YES인 경우다. 주인이 Terraform밖에 있는 속성만 골라 넣고 all은 쓰지 않는다.' },
  ];

  const summary = [
    'lifecycle 없는 운영 DB는 destroy 한 번이나 이름 변경 한 번으로 사라질 수 있다.',
    'prevent_destroy는 삭제가 들어간 계획을 plan 단계에서 막지만 블록을 지우면 가드도 사라진다.',
    '교체 순서는 create_before_destroy로, 외부가 바꾸는 값은 ignore_changes로 다룬다.',
    '부팅 때 읽는 설정처럼 diff에 안 잡히는 의존은 replace_triggered_by로 묶는다.',
  ];
  const review = [
    { q: '운영 DB에 prevent_destroy를 걸어 두었는데, 누군가 그 resource 블록을 코드에서 지우고 apply했더니 DB가 삭제 계획에 올랐다. 이유는?',
      o: ['prevent_destroy는 코드에 블록이 있을 때만 막는다', 'state에 가드가 저장되지 않아서 apply 때 풀린다', 'destroy 명령이 아니라서 가드가 반응하지 않는다'], a: 0,
      why: '가드는 resource 블록 안의 설정이다. 블록이 없어지면 Terraform은 그 리소스를 지울 계획을 세우고 막을 근거도 없다.' },
    { q: 'Launch Template에만 create_before_destroy를 걸었는데, LT가 참조하는 보안 그룹을 교체할 때도 새 SG가 먼저 생긴다. 무엇 때문인가?',
      o: ['ignore_changes가 기본으로 켜져 있어서', 'CBD가 의존하는 리소스로 전파되어서', 'name_prefix가 순서를 바꿔서'], a: 1,
      why: 'A가 B에 의존하고 A에 create_before_destroy가 있으면 Terraform은 B에도 같은 순서를 적용한다. 그래서 영향 범위를 plan의 +/- 기호로 미리 본다.' },
    { q: '앱 설정이 든 SSM 파라미터를 바꿀 때마다 EC2를 무중단으로 새로 띄우고 싶다. 알맞은 조합은?',
      o: ['ignore_changes + prevent_destroy', 'prevent_destroy + create_before_destroy', 'replace_triggered_by + create_before_destroy'], a: 2,
      why: '트리거로 재생성을 일으키고, CBD로 새 인스턴스를 먼저 띄운 뒤 헌 것을 지운다. plan에는 SSM update와 EC2 교체가 함께 잡힌다.' },
  ];

  R.page({ title: 'lifecycle 동작 보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
