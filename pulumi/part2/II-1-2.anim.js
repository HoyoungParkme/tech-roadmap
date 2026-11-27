/* II-1-2 Dynamic Provider — 내가 만드는 리소스 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 훅 목록(check·diff·create·read·update·delete, create 만 필수)과 반환 모양은 @pulumi/pulumi 3 의 dynamic 타입 정의와
 * pulumi.com/docs 의 Dynamic Providers 문서로 확인했다. 동적 provider 는 TypeScript·Python 만 되고, read 는 문서상 아직 제대로 동작하지 않는다.
 * pulumi CLI 와 사내 API 가 없어 코드는 tsc --noEmit 으로만 확인했다. diff 판정(25 → 60 이면 update)은 파이썬으로 같은 규칙을 돌려 맞췄다.
 * flag_a1b2c3 은 페이지의 예시 id 다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 사내 Feature Flag API: 서버 + 지금 들고 있는 플래그 한 줄
  const AX = 800;
  function api(ext, o) { o = o || {}; const op = o.op ?? 1;
    zone(AX - 150, 40, 300, o.h || 300, 'flags.internal.acme.io', { fill: INFOBG, stroke: INFO, color: INFO, op, dash: '6 4' });
    server(AX, 120, null, { s: 0.75, op, lamp: ext && ext.exists ? GOOD : OFF });
    if (o.noRec) return;
    const y = 190, d = ext && ext.data;
    el('rect', { x: AX - 132, y, width: 264, height: 128, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    tx(AX - 120, y + 22, '지금 외부에 있는 플래그', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op });
    if (!d) { note(AX, y + (o.gone ? 112 : 74), o.gone ? '(지워짐)' : '(없음)', op, { 'text-anchor': 'middle', fill: OFF }); return; }
    const rows = [['id', ext.id || '?'], ['key', d.key], ['enabled', String(d.enabled)], ['rollout', o.rollout != null ? o.rollout : d.rollout]];
    rows.forEach(([a, b], i) => { mono(AX - 120, y + 46 + i * 22, a, { 'font-size': 14, fill: MUT, opacity: op * (o.recOp ?? 1) });
      mono(AX + 120, y + 46 + i * 22, String(b), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: a === 'id' && !ext.id ? OFF : a === 'rollout' && o.hotRoll ? WARN : INK, opacity: op * (o.recOp ?? 1) }); }); }
  // 훅 막대: 위에서 아래로 칸, on = 지금 불리는 훅, done = 구현한 훅
  const HOOKS = ['check', 'diff', 'create', 'read', 'update', 'delete'];
  const HX = 470, HY = 70, HH = 44;
  const hy = (h) => HY + HOOKS.indexOf(h) * HH;
  function hooks(on, done, o) { o = o || {}; const op = o.op ?? 1;
    zone(HX - 110, HY - 50, 220, HOOKS.length * HH + 62, 'flagProvider', { fill: SOFT, stroke: o.stroke || GRID, op, color: o.stroke || MUT });
    HOOKS.forEach((h, i) => { const y = hy(h), isOn = h === on, isDone = done.includes(h);
      card(HX, y, 180, 34, { rx: 8, fill: isOn ? ACC : isDone ? ACCBG : PANEL, stroke: isOn || isDone ? ACC : GRID, sw: isOn ? 2.5 : 1.5, op: op * (isOn || isDone ? 1 : 0.75) });
      mono(HX - 76, y + 5, h + '()', { 'font-size': 14.5, 'font-weight': 700, fill: isOn ? PANEL : isDone ? ACC : MUT, opacity: op });
      if (h === 'create') mono(HX + 76, y + 5, '필수', { 'font-size': 13.5, fill: isOn ? PANEL : WARN, 'text-anchor': 'end', opacity: op }); }); }
  // 요청·응답: 점이 길을 따라가고, 이름표는 아래 빈 띠에 뜬다
  function send(from, to, u, a, b, label, col, at) { dot([from, to], seg(u, a, b), col || ACC, 7);
    const [lx, ly] = at || [700, 384]; pill(lx, ly, label, col || ACC, pop(u, a), { mono: true, fs: 13.5, fill: PANEL }); }
  // state 파일: 저장된 outs
  function state(outs, o) { o = o || {}; const x = o.x ?? 30, y = o.y ?? 240, w = o.w ?? 260, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: 150, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    tx(x + 14, y + 24, 'state (outs)', { 'font-size': 14, 'font-weight': 800, opacity: op });
    if (!outs) { note(x + w / 2, y + 86, o.gone ? '(빠짐)' : '(비어 있음)', op, { 'text-anchor': 'middle', fill: OFF }); return; }
    Object.entries(outs).forEach(([a, b], i) => { const rop = op * (o.rowOp ? o.rowOp(i) : 1); if (rop <= 0) return;
      mono(x + 14, y + 52 + i * 24, a, { 'font-size': 14, fill: MUT, opacity: rop });
      mono(x + w - 14, y + 52 + i * 24, String(a === 'rollout' && o.rollout != null ? o.rollout : b), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: rop, fill: a === 'rollout' && o.hot ? WARN : INK }); }); }

  // ---------- 1. 공식 provider 가 없을 때 ----------
  const EP = [['POST', '/flags', '생성'], ['GET', '/flags/:id', '조회'], ['PATCH', '/flags/:id', '수정'], ['DELETE', '/flags/:id', '삭제']];
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) {
      api(c.beat.external, { noRec: true, h: 360 });
      EP.forEach(([m, p, w], i) => { const y = 200 + i * 44, a = k === 0 ? seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3) : 1; if (a <= 0) return;
        el('rect', { x: AX - 134, y: y - 18, width: 268 * a, height: 34, rx: 7, fill: PANEL, stroke: GRID, 'stroke-width': 1.2 });
        mono(AX - 122, y + 5, m, { 'font-size': 14.5, 'font-weight': 800, fill: m === 'DELETE' ? BAD : m === 'GET' ? INFO : ACC, opacity: fade(a, 0.5, 0.5) });
        mono(AX - 52, y + 5, p, { 'font-size': 14, opacity: fade(a, 0.5, 0.5) }); tx(AX + 122, y + 5, w, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(a, 0.5, 0.5) }); });
      if (k === 0) {
        tx(40, 60, 'Pulumi provider 플러그인', { 'font-size': 15, 'font-weight': 700 });
        [['aws', true], ['gcp', true], ['사내 Feature Flag', false]].forEach(([n, ok], i) => { const y = 110 + i * 70, s = pop(u, 0.3 + i * 0.4);
          card(170, y, 240, 48, { rx: 10, stroke: ok ? INK : BAD, dash: ok ? null : '6 4', s, text: n, fs: 15, color: ok ? INK : BAD });
          if (ok) check(320, y, 11, s); else cross(320, y, 11, s); });
        note(40, 340, '공식 provider가 없다. API는 네 개 있다.', fade(u, 1.8), { fill: BAD });
        grow(330, 250, AX - 160, 250, seg(u, 1.4, 2.0), BAD, { dash: '6 5', plain: true });
        return; }
      // k1: 생명주기를 코드로
      card(150, 80, 240, 74, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.2), text: 'checkout-v2\nenabled: true · rollout: 25', fs: 14.5, mono: true });
      [['pulumi up', 0, '생성'], ['코드 수정 후 up', 2, 'PATCH 또는 재생성'], ['pulumi destroy', 3, '삭제']].forEach(([cmd, ep, w], i) => { const y = 190 + i * 70, s = pop(u, 0.6 + i * 0.4);
        pill(130, y, cmd, INK, s, { mono: true, fs: 14, fill: PANEL });
        grow(230, y, AX - 140, 200 + ep * 44, seg(u, 0.9 + i * 0.4, 1.5 + i * 0.4), ACC, { sw: 2 });
        sub(130, y + 30, w, fade(u, 1.0 + i * 0.4)); });
      return; }
    // k2: 묶기 vs 새 타입
    zone(30, 40, 430, 330, 'ComponentResource · 있는 리소스를 묶는다', { fill: SOFT });
    zone(500, 40, 430, 330, 'Dynamic Provider · 새 리소스 타입을 만든다', { fill: ACCBG, stroke: ACC, color: ACC });
    [['aws.s3.Bucket', 0], ['aws.lambda.Function', 1], ['aws.iam.Role', 2]].forEach(([n, i]) => card(245, 120 + i * 70, 260, 46, { rx: 8, text: n, fs: 14.5, mono: true, s: pop(u, 0.2 + i * 0.2) }));
    sub(245, 340, '각 리소스의 provider는 이미 있다', fade(u, 0.9));
    card(715, 110, 300, 50, { rx: 10, stroke: ACC, sw: 2.5, text: 'FeatureFlag (새 타입)', fs: 15, s: pop(u, 0.9), color: ACC });
    ['create', 'read', 'update', 'delete', 'diff'].forEach((h, i) => { const s = pop(u, 1.2 + i * 0.15);
      card(590 + i * 62, 220, 56, 40, { rx: 8, text: h, fs: 13.5, mono: true, s, stroke: ACC, color: ACC }); grow(590 + i * 62, 197, 590 + i * 62, 140, seg(u, 1.3 + i * 0.15, 1.6 + i * 0.15), ACC, { plain: true, sw: 1.6 }); });
    sub(715, 290, '훅 안의 코드는 내가 쓴다', fade(u, 2.0), { 'font-weight': 700, fill: ACC }); }

  // ---------- 2. create 훅 ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    // 입력 계약
    tx(30, 52, 'interface FlagInputs', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
    [['key', 'string'], ['enabled', 'boolean'], ['rollout', 'number  // 0~100 %']].forEach(([a, ty], i) => { const y = 72 + i * 40, w = k === 0 ? seg(u, 0.4 + i * 0.3, 1.0 + i * 0.3) : 1; if (w <= 0) return;
      el('rect', { x: 30, y, width: 270 * w, height: 32, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.2 });
      mono(42, y + 22, a + ': ' + ty, { 'font-size': 14, opacity: fade(w, 0.6, 0.4) }); });
    if (k === 0) { pill(165, 230, 'const API = "https://flags…"', INFO, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL });
      api(null, { op: fade(u, 1.8) }); return; }
    const on = k <= 4 ? 'create' : null;
    hooks(on, ['create'], { op: k === 1 ? fade(u, 0.2) : 1, stroke: ACC });
    if (k === 1) note(HX, 360, 'async create(inputs)', fade(u, 0.8), { 'text-anchor': 'middle', class: 'mono', fill: ACC });
    const ex = b.external, showRec = k >= 2;
    api(showRec ? ex : null, { recOp: k === 2 ? fade(u, 1.4) : 1 });
    if (k === 2) send([HX + 90, hy('create')], [AX - 132, 250], u, 0.2, 1.4, 'POST /flags {key, enabled, rollout}');
    if (k === 3) { send([AX - 132, 236], [HX + 90, hy('create')], u, 0.2, 1.3, '응답 { "id": "flag_a1b2c3" }', INFO);
      note(700, 414, 'id가 있어야 다음에 다시 찾는다', fade(u, 1.4), { 'text-anchor': 'middle', fill: INFO }); }
    if (k === 4) { state(b.stateOuts, { rowOp: (i) => fade(u, 0.8 + i * 0.2) });
      send([HX - 90, hy('create')], [160, 240], u, 0.1, 0.9, 'return { id, outs }', ACC, [160, 216]);
      sub(160, 414, '다음 실행 때 olds로 다시 들어온다', fade(u, 1.8), { 'font-weight': 700, fill: ACC }); }
    else state(null, { op: k === 1 ? fade(u, 1.0) : 1 }); }

  // ---------- 3. Resource 클래스로 감싸기 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat;
    // 사용자용 클래스
    zone(30, 40, 270, 150, 'class FeatureFlag', { fill: ACCBG, stroke: ACC, color: ACC, op: k === 0 ? fade(u, 0.2) : 1 });
    mono(46, 88, 'extends dynamic.Resource', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.5) : 1 });
    const fid = b.stateOuts ? b.stateOuts.flagId : k >= 1 ? 'undefined' : '';
    mono(46, 126, 'flagId: Output<string>', { 'font-size': 14, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.9) : 1 });
    if (fid) card(165, 160, 220, 32, { rx: 8, text: fid, fs: 14, mono: true, stroke: b.stateOuts ? GOOD : GRID, dash: b.stateOuts ? null : '5 4', color: b.stateOuts ? GOOD : OFF, s: k === 3 ? pop(u, 1.2) : 1 });
    hooks(k >= 2 ? (b.activeHook === 'create' && k === 2 ? 'create' : null) : null, k >= 1 ? ['create'] : [], { op: k === 0 ? 0.45 : 1, stroke: k >= 1 ? ACC : GRID });
    if (k === 0) note(HX, 360, '아직 아무 훅도 안 불린다', fade(u, 1.2), { 'text-anchor': 'middle', fill: MUT });
    if (k >= 1) { grow(300, 115, HX - 112, 115, k === 1 ? seg(u, 0.2, 0.9) : 1, ACC);
      if (k === 1) { mono(30, 236, 'super(flagProvider, name,', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.9) }); mono(30, 260, '  { ...args, flagId: undefined }, opts)', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.1) }); } }
    api(k >= 2 ? b.external : null, { recOp: k === 2 ? fade(u, 1.8) : 1 });
    if (k === 2) { el('rect', { x: 30, y: 220, width: 280, height: 90, rx: 8, fill: INK });
      mono(42, 246, 'index.ts', { 'font-size': 13.5, fill: OFF });
      mono(42, 272, 'new FeatureFlag("checkout-v2")', { 'font-size': 14, fill: PANEL, opacity: fade(u, 0.2) });
      mono(42, 296, '+ create  (pulumi up)', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.7) });
      dot([[310, 270], [HX - 90, hy('create')]], seg(u, 0.6, 1.2), ACC, 7);
      fly(HX + 90, hy('create'), AX - 60, 210, seg(u, 1.2, 2.0), 'POST', { mono: true }); }
    if (k === 3) { state(b.stateOuts, { y: 230, rowOp: (i) => fade(u, 0.3 + i * 0.15) });
      dot([[160, 230], [165, 178]], seg(u, 0.8, 1.2), GOOD, 6);
      pill(HX, 386, 'export const flagId = checkoutFlag.flagId', GOOD, pop(u, 1.6), { mono: true, fs: 13.5, fill: PANEL }); } }

  // ---------- 4. diff ----------
  const DR = ['key', 'enabled', 'rollout'];
  function s4(t, c) { const { k, u } = c, b = c.beat, olds = b.stateOuts, news = b.inputs;
    const TX = 30, TY = 60;
    tx(TX, TY - 18, 'diff(id, olds, news)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC });
    [['필드', 0], ['olds · state', 120], ['news · 코드', 250]].forEach(([s, dx]) => tx(TX + dx + 10, TY + 22, s, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }));
    el('rect', { x: TX, y: TY, width: 380, height: 34, rx: 7, fill: SOFT });
    const look = [null, 0, 1, 2, 2][k];   // 지금 보는 줄
    DR.forEach((f, i) => { const y = TY + 40 + i * 46, a = olds[f], bb = news[f], diff = a !== bb;
      const seen = k >= 1 && (k >= 2 ? true : i === 0), hot = seen && (k === 1 ? i === 0 : diff);
      el('rect', { x: TX, y, width: 380, height: 40, rx: 7, fill: hot ? (diff ? WARNBG : GOODBG) : PANEL, stroke: GRID, 'stroke-width': 1.2 });
      mono(TX + 10, y + 26, f, { 'font-size': 14.5, 'font-weight': 700 });
      const rv = f === 'rollout' && k === 4 ? Math.round(tween(25, 60, u)) : a;
      mono(TX + 130, y + 26, String(rv), { 'font-size': 14.5, fill: diff && k < 4 ? WARN : INK });
      mono(TX + 260, y + 26, String(bb), { 'font-size': 14.5, 'font-weight': 700, fill: diff ? WARN : INK, opacity: k === 0 && diff ? fade(u, 0.6) : 1 });
      if (seen && (k !== 1 || i === 0)) { const s = k === 1 || (k === 2 && i > 0) ? pop(u, 0.8 + i * 0.3) : 1; if (diff) mono(TX + 368, y + 27, '≠', { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: Math.min(1, s) }); else check(TX + 356, y + 20, 8, s); } });
    if (k === 0) note(TX, 250, '코드에서 rollout을 25 → 60으로 고쳤다', fade(u, 1.0), { fill: WARN });
    // 결과
    const rp = '[]', ch = k >= 2 ? 'true' : '?';
    if (k >= 1) { mono(TX, 260, 'replaces: ' + rp, { 'font-size': 15, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.2) : 1 });
      sub(TX + 250, 260, 'key가 같다 · 재생성 아님', k === 1 ? fade(u, 1.4) : 1, { 'text-anchor': 'start' }); }
    if (k >= 2) mono(TX, 290, 'changes:  ' + ch, { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: k === 2 ? fade(u, 1.4) : 1 });
    // 판정 스위치
    if (k >= 3) { const OPS = [['변경 없음', MUT], ['update', ACC], ['replace', BAD]], sx = 90;
      OPS.forEach(([s, col], i) => { const on = i === 1; card(sx + i * 150, 350, 130, 40, { rx: 20, text: s, fs: 14.5, fw: 700, stroke: on ? col : GRID, fill: on ? ACCBG : PANEL, color: on ? col : MUT, s: k === 3 ? pop(u, 0.2 + i * 0.15) : 1 }); });
      if (k === 3) { const px = lerp(sx, sx + 150, E(u, 0.8, 1.6)); el('path', { d: `M${px - 9},${320} L${px + 9},${320} L${px},${332} Z`, fill: ACC }); }
      else el('path', { d: `M${sx + 141},320 L${sx + 159},320 L${sx + 150},332 Z`, fill: ACC });
      if (k === 3) sub(sx + 150, 404, 'replace 였다면 deleteBeforeReplace: true라 먼저 지우고 만든다', fade(u, 1.8)); }
    // 가운데: 지금 불리는 훅, 오른쪽: 외부
    [['diff', 120], ['update', 290]].forEach(([h, y]) => { const on = b.activeHook === h;
      card(530, y, 150, 40, { rx: 20, text: h + '()', fs: 15, mono: true, fill: on ? ACC : PANEL, stroke: on ? ACC : GRID, color: on ? PANEL : MUT }); });
    grow(530, 142, 530, 266, k >= 3 ? (k === 3 ? seg(u, 1.6, 2.2) : 1) : 0, ACC);
    const roll = k === 4 ? Math.round(tween(25, 60, u, 1.0)) : 25;
    api(b.external, { rollout: roll, hotRoll: k === 4 });
    if (k === 4) { send([605, 290], [AX - 132, 290], u, 0.1, 1.0, 'PATCH /flags/flag_a1b2c3', ACC, [800, 384]);
      sub(AX, 412, '외부도 state도 rollout 60', fade(u, 2.0), { 'font-weight': 700, fill: ACC }); } }

  // ---------- 5. read · delete · 실무 ----------
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 2) {
      const done = k === 0 ? ['create', 'update', 'diff'] : k === 1 ? ['create', 'update', 'diff', 'read'] : ['create', 'update', 'diff', 'read', 'delete'];
      hooks(b.activeHook === 'update' ? null : b.activeHook, done, { stroke: ACC });
      if (k === 0) { HOOKS.forEach((h, i) => { const y = hy(h); if (h === 'check') sub(HX + 140, y + 5, '선택', fade(u, 0.5)); else if (!done.includes(h)) pill(HX + 142, y, '남음', WARN, pop(u, 0.6 + i * 0.1), { fs: 13.5, fill: PANEL }); else check(HX + 136, y, 9, pop(u, 0.3 + i * 0.1)); });
        mono(150, 380, '구현 ' + done.length + ' / 6', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
      const del = k === 2 && u < 1.5 && c.prev;
      api(del ? c.prev.external : b.external, { gone: k === 2, recOp: del ? 1 - fade(u, 0.9, 0.6) : 1 });
      state(k === 2 ? (u < 1.2 && c.prev ? c.prev.stateOuts : null) : b.stateOuts, { x: 30, y: 60, w: 250, op: 1, gone: k === 2 });
      if (k === 1) { send([AX - 132, 250], [HX + 90, hy('read')], u, 0.3, 1.3, 'GET /flags/flag_a1b2c3', INFO);
        card(170, 300, 300, 86, { rx: 10, stroke: WARN, fill: WARNBG, s: pop(u, 1.4), text: '문서: 동적 provider의 read 는\n아직 제대로 동작하지 않는다\n(import · get 불가)', fs: 13.5 }); }
      if (k === 2) { send([HX + 90, hy('delete')], [AX - 132, 250], u, 0.1, 0.9, 'DELETE /flags/flag_a1b2c3', BAD);
        if (u > 0.9) cross(AX, 256, 22, pop(u, 0.9));
        note(155, 330, 'state에서도 빠진다', fade(u, 1.6), { 'text-anchor': 'middle', fill: BAD }); }
      return; }
    // k3: 실무 자리
    tx(480, 50, '같은 원리로 리소스로 만드는 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
    [['시크릿 회전', 'update에서 새 값 발급 · 옛 값 폐기', 'update'], ['SaaS 웹훅 · 도메인 등록', '결제사 콜백 URL도 같은 자리', 'create / delete'], ['DB 스키마 마이그레이션', 'up 한 번으로 실행', 'create']].forEach(([a, d, h], i) => {
      const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.3);
      card(cx, 140, 280, 110, { rx: 12, stroke: ACC, sw: 2, s });
      tx(cx - 124, 118, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
      tx(cx - 124, 146, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) });
      mono(cx - 124, 176, h + '()', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4 + i * 0.3) }); });
    // 멱등: 두 번 불러도 결과는 하나
    tx(480, 252, 'create · update는 멱등하게', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) });
    [0, 1].forEach((i) => { const y = 300 + i * 50; pill(250, y, (i ? '다시 시도한 ' : '') + 'PATCH rollout=60', WARN, pop(u, 1.5 + i * 0.3), { mono: true, fs: 13.5, fill: PANEL });
      grow(370, y, 600, 325, seg(u, 1.7 + i * 0.3, 2.2 + i * 0.3), WARN, { sw: 2 }); });
    card(700, 325, 190, 50, { rx: 10, stroke: GOOD, text: 'rollout = 60 하나', fs: 15, mono: true, s: pop(u, 2.2) }); }

  const quiz = [
    { q: '사내 Feature Flag API를 Pulumi로 관리하려 할 때 Dynamic Provider가 맞는 이유는 무엇인가?',
      o: ['이미 있는 AWS 리소스를 묶기만 하면 되어서', '공식 provider가 없는 리소스의 생성·수정·삭제를 내가 짜야 해서', 'Terraform module을 그대로 불러올 수 있어서'], a: 1,
      why: 'ComponentResource는 있는 리소스를 묶는다. 공식 provider가 없으면 POST·PATCH·DELETE를 부르는 훅을 직접 써서 새 타입을 만든다.' },
    { q: 'create 훅이 반드시 돌려줘야 하는 것은 무엇인가?',
      o: ['외부 API의 HTTP 상태 코드', '{ id, outs } — 리소스 id와 state에 남길 값', '다음 up 때 쓸 diff 결과'], a: 1,
      why: 'id로 다음에 이 리소스를 다시 찾고, outs는 state에 저장돼 다음 실행의 olds가 된다.' },
    { q: 'new FeatureFlag("checkout-v2", …)를 쓰고 pulumi up 하면 실제로 무엇이 일어나는가?',
      o: ['flagProvider의 create가 불려 외부에 플래그가 생긴다', '코드에 적은 값이 state에만 적히고 외부는 그대로다', 'AWS에 같은 이름의 리소스가 생긴다'], a: 0,
      why: 'dynamic.Resource는 super의 첫 인자로 provider와 이어진다. 처음 만드는 리소스면 엔진이 create를 부른다.' },
    { q: 'rollout을 25에서 60으로, key는 그대로 두고 up 했다. diff 판정은 무엇인가?',
      o: ['replace — 지우고 다시 만든다', '변경 없음', 'update — PATCH로 고친다'], a: 2,
      why: 'key가 같아 replaces는 비고, rollout이 달라 changes는 true다. 그래서 update 훅이 PATCH를 보낸다.' },
    { q: '코드에서 FeatureFlag를 지우고 up 하면 어느 훅이 불리는가?',
      o: ['delete', 'read', 'check'], a: 0,
      why: '코드에서 사라진 리소스나 destroy는 delete 훅으로 간다. 외부 DELETE가 나가고 state에서도 빠진다.' },
  ];

  const summary = [
    '공식 provider가 없는 사내 API도 훅을 직접 짜면 Pulumi 리소스가 된다.',
    'create는 외부에 POST하고 { id, outs }를 돌려준다. outs는 state에 남아 다음 olds가 된다.',
    'diff는 olds와 news를 비교한다. key가 바뀌면 replace, rollout만 바뀌면 update다.',
    '훅은 create만 필수이고, 외부 호출은 멱등하게 짠다. 동적 provider는 TypeScript와 Python만 된다.',
  ];
  const review = [
    { q: '플래그 key를 checkout-v2에서 checkout-v3로 바꿔 up 했다. 일어나는 일은?',
      o: ['update 훅이 PATCH로 key만 고친다', 'replaces에 key가 들어가 지우고 새로 만든다', 'diff가 변경 없음으로 본다'], a: 1,
      why: 'diff 코드는 key가 다르면 replaces에 넣는다. deleteBeforeReplace가 true라 DELETE 뒤 POST가 나간다.' },
    { q: 'create에서 id를 빼고 outs만 돌려줬다. 나중에 먼저 생길 문제는?',
      o: ['Pulumi가 이 플래그를 다시 찾지 못해 update·delete가 엉뚱해진다', 'rollout 값이 0으로 바뀐다', '훅이 더 빨라진다'], a: 0,
      why: 'update·delete는 id로 /flags/:id를 부른다. id는 리소스를 다시 찾는 열쇠다.' },
    { q: '네트워크 오류로 pulumi up을 다시 돌렸더니 같은 플래그가 두 개 생겼다. 먼저 고칠 곳은?',
      o: ['diff의 replaces 목록', 'state 파일을 손으로 지운다', 'create가 같은 key를 다시 받아도 하나만 남도록 멱등하게 짠다'], a: 2,
      why: '훅은 실제 외부 부수효과를 낸다. 다시 시도해도 결과가 같도록 create·update를 멱등하게 짜야 한다.' },
  ];

  R.page({ title: 'Dynamic Provider 훅', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
