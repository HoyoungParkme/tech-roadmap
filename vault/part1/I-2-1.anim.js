/* I-2-1 policy (capabilities 와 path glob) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 허용/거부 판정은 Vault 문서의 우선순위 규칙(첫 +·* 위치 → * 로 끝남 → + 개수 → 길이)을 python 으로 재현해 맞춘 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // path 를 세그먼트 칸으로. parts 의 각 칸 스타일은 st(i, s) → {stroke, fill, color, dash, op, w}
  function segs(x, y, parts, st, o) { o = o || {}; let cx = x; const h = o.h || 34, fs = o.fs || 14.5, out = [];
    parts.forEach((s, i) => { const a = (st && st(i, s)) || {}, w = a.w || Math.max(36, tw(s, fs) * 1.0 + 18);
      if ((a.op ?? 1) > 0) { el('rect', { x: cx, y, width: w, height: h, rx: 6, fill: a.fill || PANEL, stroke: a.stroke || GRID, 'stroke-width': a.sw || 1.8, 'stroke-dasharray': a.dash, opacity: a.op ?? 1 });
        mono(cx + w / 2, y + h / 2 + 5, s, { 'font-size': fs, 'font-weight': 700, 'text-anchor': 'middle', fill: a.color || INK, opacity: a.op ?? 1 }); }
      out.push({ x: cx, w, cx: cx + w / 2 }); cx += w + (o.gap ?? 6); });
    return out; }
  // HCL 정책 블록 카드
  function block(x, y, w, path, caps, o) { o = o || {}; const op = o.op ?? 1, col = o.col || INK;
    el('rect', { x, y, width: w, height: 62, rx: 8, fill: o.hot ? (o.deny ? BADBG : ACCBG) : SOFT, stroke: o.hot ? (o.deny ? BAD : ACC) : GRID, 'stroke-width': o.hot ? 2.6 : 1.5, opacity: op });
    mono(x + 12, y + 24, 'path "' + path + '"', { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op });
    mono(x + 24, y + 48, '[' + caps.map((c) => '"' + c + '"').join(', ') + ']', { 'font-size': 14, fill: caps.includes('deny') ? BAD : ACC, opacity: op }); }
  // 판정 도장
  function verdict(cx, cy, ok, s, label) { if (s <= 0) return; const col = ok ? GOOD : BAD;
    card(cx, cy, 108, 40, { rx: 20, text: label || (ok ? '허용' : '거부'), fs: 16, fw: 800, fill: ok ? GOODBG : BADBG, stroke: col, color: col, s }); }
  const ROWS = (c) => (c.beat && c.beat.rows) || [];

  // ---------- 1. 인증 ≠ 인가 ----------
  function s1(t, c) { const { k, u } = c;
    const G1 = 330, G2 = 620, Y = 150;
    el('line', { x1: 40, y1: Y + 40, x2: 920, y2: Y + 40, stroke: GRID, 'stroke-width': 3 });
    [[G1, '인증 (authentication)', '너 누구야?', 'auth method'], [G2, '인가 (authorization)', '뭘 할 수 있어?', 'policy']].forEach(([x, a, b, who], i) => {
      const hot = (i === 1 && (k === 0 || k >= 2)) || (i === 0 && k === 1);
      el('rect', { x: x - 8, y: Y - 40, width: 16, height: 80, rx: 4, fill: hot ? (i === 1 && k >= 2 ? BAD : ACC) : MUT });
      tx(x, Y - 60, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : INK });
      tx(x, Y + 74, b, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT });
      pill(x, Y + 106, who, i === 1 ? ACC : INFO, k === 0 ? pop(u, 0.4 + i * 0.6) : 1, { mono: true }); });
    if (k === 0) { tx(475, 330, '두 질문은 다른 단계다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.7) }); person(110, Y + 6, null, { s: pop(u, 0.2) }); return; }
    const px = k === 1 ? lerp(110, 470, E(u, 0.2, 1.2)) : k === 2 ? lerp(470, G2 - 50, E(u, 0.2, 0.9)) : 470;
    if (k < 3) person(px, Y + 6, 'alice', {});
    if (k >= 1) { const s = k === 1 ? pop(u, 1.0) : 1; card(Math.min(px, 480), Y + 74, 150, 34, { rx: 6, text: 'hvs.CAESI...', fs: 14, mono: true, fill: ACCBG, stroke: ACC, s: k < 3 ? s : 0 }); }
    if (k === 1) tx(475, 330, '신원은 확인됐다 · 권한은 아직 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
    if (k === 2) { cross(G2, Y, 16, pop(u, 1.0));
      mono(G2 + 20, 300, 'vault kv get secret/app/db', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(G2 + 20, 326, 'Error: permission denied', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 3) { const rows = ROWS(c);
      el('rect', { x: G2 - 8, y: Y - 40, width: 16, height: 80, rx: 4, fill: BAD });
      rows.forEach((r, i) => { const y = 296 + i * 40, g = seg(u, 0.2 + i * 0.4, 0.9 + i * 0.4);
        mono(60, y + 5, r.action.padEnd(6) + r.path, { 'font-size': 14.5, opacity: fade(u, 0.1 + i * 0.4) });
        dot([[420, y], [G2 - 14, y]], g, INK, 6); if (g >= 1) cross(G2, y, 10, 1); });
      tx(800, 300, '적지 않은 path', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      tx(800, 326, '= 거부 (기본값)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) }); } }

  // ---------- 2. path 별 capabilities ----------
  const B1 = ['secret/data/app/*', ['read', 'list']], B2 = ['secret/data/myapp/*', ['create', 'read', 'update']];
  const CAPS = [['create', 'POST/PUT'], ['read', 'GET'], ['update', 'POST/PUT'], ['patch', 'PATCH'], ['delete', 'DELETE'], ['list', 'LIST'], ['sudo', '—'], ['deny', '—']];
  function s2(t, c) { const { k, u } = c;
    if (k === 2) { tx(480, 50, 'capabilities와 HTTP 동사', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      CAPS.forEach(([cap, verb], i) => { const col = i % 4, row = Math.floor(i / 4), x = 80 + col * 210, y = 90 + row * 130, s = pop(u, 0.2 + i * 0.18), sp = i >= 6;
        card(x + 90, y + 40, 180, 90, { rx: 12, stroke: cap === 'deny' ? BAD : sp ? WARN : ACC, fill: cap === 'deny' ? BADBG : sp ? WARNBG : ACCBG, s });
        mono(x + 90, y + 34, cap, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: cap === 'deny' ? BAD : sp ? WARN : ACC, opacity: s > 0.5 ? 1 : 0 });
        mono(x + 90, y + 62, verb, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: s > 0.5 ? 1 : 0 }); });
      tx(480, 378, 'deny는 같은 path의 다른 어떤 capability보다 앞선다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    zone(30, 30, 400, 230, 'app-policy.hcl', { fill: PANEL, stroke: GRID, sw: 1.5 });
    const hot1 = k === 0 || k === 3, hot2 = k === 1;
    block(46, 54, 368, B1[0], B1[1], { hot: hot1, op: k === 0 ? fade(u, 0.2) : 1 });
    if (k >= 1) block(46, 130, 368, B2[0], B2[1], { hot: hot2, op: k === 1 ? fade(u, 0.2) : 1 });
    // 요청 판정
    const req = k === 0 ? ['read', 'secret/data/app/db'] : k === 1 ? ['update', 'secret/data/myapp/key'] : ['create', 'secret/data/app/db'];
    const caps = k === 1 ? B2[1] : B1[1], ok = caps.includes(req[0]);
    tx(480, 60, '요청', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    pill(560, 54, req[0], INFO, pop(u, 0.5), { mono: true, fs: 15 });
    mono(620, 60, req[1], { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
    const by = k === 1 ? 160 : 84;
    grow(470, 70, 420, by, E(u, 0.9, 1.4), MUT, { dash: '4 4' });
    tx(480, 130, '매칭된 블록의 capabilities', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) });
    caps.forEach((cp, i) => { const x = 520 + i * 110, hit = cp === req[0];
      card(x, 170, 96, 36, { rx: 18, text: cp, fs: 15, mono: true, stroke: hit ? GOOD : GRID, fill: hit ? GOODBG : PANEL, color: hit ? GOOD : MUT, s: pop(u, 1.3 + i * 0.15) }); });
    verdict(620, 250, ok, pop(u, 1.9));
    if (!ok) tx(620, 300, req[0] + ' 이 목록에 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
    if (k === 0) tx(230, 320, 'path 블록 + capabilities = 규칙 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
    if (k === 1) tx(230, 320, '경로마다 다른 capabilities', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // ---------- 3. path glob ----------
  const sp = (p) => p.split('/');
  function matchRow(x, y, path, pat, ok, g, o) { o = o || {};
    const P = sp(pat), Q = sp(path);
    const top = segs(x, y, P, (i, s) => ({ stroke: s === '+' || s === '*' ? WARN : INK, fill: s === '+' || s === '*' ? WARNBG : PANEL, color: s === '+' || s === '*' ? WARN : INK, dash: s === '+' || s === '*' ? '5 3' : null, w: o.w && o.w[i] }), { fs: 14 });
    segs(x, y + 46, Q, (i, s) => { const pi = Math.min(i, P.length - 1), wild = P[pi] === '*' && i >= P.length - 1;
      const hit = ok && (P[i] === s || P[i] === '+' || wild);
      return { op: clamp(g * Q.length - i), stroke: hit ? GOOD : (!ok && i >= P.length - 1) ? BAD : GRID, fill: hit ? GOODBG : (!ok && i >= P.length - 1) ? BADBG : PANEL, color: hit ? GOOD : INK }; }, { fs: 14 });
    return top; }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 60, '패턴', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(60, 106, '요청', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const top = matchRow(130, 40, 'secret/data/app/db', 'secret/data/+/db', true, E(u, 0.6, 1.6));
      tx(top[2].cx, 136 + 6, '한 칸만', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      verdict(760, 82, true, pop(u, 2.0), '매칭');
      tx(480, 260, '+ 는 세그먼트 한 칸을 아무 이름으로 채운다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { [['secret/data/app/db', true], ['secret/data/team/db', true], ['secret/data/app/sub/db', false]].forEach(([p, ok], i) => {
        const y = 30 + i * 128; matchRow(40, y, p, 'secret/data/+/db', ok, E(u, 0.2 + i * 0.5, 0.9 + i * 0.5));
        verdict(800, y + 40, ok, pop(u, 0.9 + i * 0.5), ok ? '매칭' : '불일치'); });
      return; }
    if (k === 2) { [['secret/data/app/db', true], ['secret/data/app/sub/key', true]].forEach(([p, ok], i) => {
        const y = 40 + i * 140; matchRow(40, y, p, 'secret/data/app/*', ok, E(u, 0.2 + i * 0.6, 1.0 + i * 0.6));
        verdict(800, y + 40, ok, pop(u, 1.0 + i * 0.6), '매칭'); });
      tx(480, 340, '* 는 끝에서만 쓰고, 뒤에 오는 것을 몇 단계든 받는다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { tx(40, 50, '요청  update secret/data/app/token', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      block(40, 80, 420, 'secret/data/app/*', ['read'], { op: 0.75 });
      block(500, 80, 420, 'secret/data/app/token', ['read', 'update'], { hot: E(u, 1.0, 1.3) > 0.5 });
      grow(250, 150, 250, 200, E(u, 0.4, 0.9), MUT, { plain: true }); grow(710, 150, 710, 200, E(u, 0.4, 0.9), ACC, { plain: true });
      tx(250, 226, '* 로 끝난다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) });
      tx(710, 226, '와일드카드 없음 · 더 구체적', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      verdict(710, 290, true, pop(u, 1.6)); tx(710, 344, 'update가 열린다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
      return; }
    // k4: 첫 와일드카드 위치
    tx(40, 44, '요청  read secret/data/app/db에 두 패턴이 함께 걸린다', { 'font-size': 16, 'font-weight': 800 });
    [['secret/data/+/db', 12, false], ['secret/data/app/*', 16, true]].forEach(([p, pos, win], i) => { const y = 90 + i * 110, x0 = 70, cw = 24;
      [...p].forEach((ch, j) => { const w = ch === '+' || ch === '*', on = clamp(E(u, 0.2 + i * 0.4, 1.0 + i * 0.4) * p.length - j);
        el('rect', { x: x0 + j * cw, y, width: cw - 2, height: 34, rx: 3, fill: w ? WARNBG : j < pos ? SOFT : PANEL, stroke: w ? WARN : GRID, 'stroke-width': 1.2, opacity: on });
        mono(x0 + j * cw + 11, y + 23, ch, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: w ? WARN : INK, opacity: on }); });
      const mx = x0 + pos * cw + 11; grow(mx, y + 70, mx, y + 38, E(u, 1.2, 1.6), WARN);
      mono(mx, y + 88, '첫 와일드카드 ' + (pos + 1) + '번째 글자', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      if (win) verdict(800, y + 17, true, pop(u, 2.0), '이긴다'); });
    tx(480, 372, '와일드카드가 더 뒤에서 처음 나오는 패턴이 우선한다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); }

  // ---------- 4. deny · 최소 권한 · 합집합 ----------
  // path 나무: [라벨, x, y, 부모]
  const TREE = [['secret/data/app/', 60, 70], ['db', 300, 40], ['token', 300, 92], ['prod', 300, 144], ['sys/', 60, 260], ['policies/acl', 300, 260]];
  function tree(st) { const TW = (i) => (i === 0 ? 170 : i === 4 ? 90 : 160), link = (a, b) => el('path', { d: `M${TREE[a][1] + TW(a)},${TREE[a][2] + 16} C${TREE[a][1] + TW(a) + 30},${TREE[a][2] + 16} ${TREE[b][1] - 30},${TREE[b][2] + 16} ${TREE[b][1]},${TREE[b][2] + 16}`, fill: 'none', stroke: GRID, 'stroke-width': 2 });
    link(0, 1); link(0, 2); link(0, 3); link(4, 5);
    TREE.forEach(([s, x, y], i) => { const a = st(i) || {}; const w = TW(i);
      el('rect', { x, y, width: w, height: 32, rx: 7, fill: a.fill || PANEL, stroke: a.stroke || GRID, 'stroke-width': 2 });
      mono(x + 12, y + 22, s, { 'font-size': 14.5, 'font-weight': 700, fill: a.color || INK });
      if (a.mark === 'ok') check(x + w - 16, y + 16, 7, 1); if (a.mark === 'no') cross(x + w - 16, y + 16, 7, 1); }); }
  const OKS = { fill: GOODBG, stroke: GOOD, color: GOOD, mark: 'ok' }, NOS = { fill: BADBG, stroke: BAD, color: BAD, mark: 'no' };
  function s4(t, c) { const { k, u } = c;
    if (k === 3) { tx(480, 46, 'token에 정책 두 개 · 같은 path 패턴 (예시)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      block(40, 80, 400, 'secret/data/app/*', ['read', 'list'], { op: fade(u, 0.2) }); tx(40, 168, 'app-read', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      block(520, 80, 400, 'secret/data/app/*', ['create', 'update'], { op: fade(u, 0.5) }); tx(520, 168, 'app-write', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) });
      grow(240, 180, 440, 230, E(u, 0.9, 1.4), MUT, { plain: true }); grow(720, 180, 520, 230, E(u, 0.9, 1.4), MUT, { plain: true });
      ['create', 'read', 'update', 'list'].forEach((cp, i) => card(330 + i * 100, 250, 90, 34, { rx: 17, text: cp, fs: 14.5, mono: true, stroke: GOOD, fill: GOODBG, color: GOOD, s: pop(u, 1.4 + i * 0.12) }));
      mono(330, 330, 'read   secret/data/app/db', { 'font-size': 15, opacity: fade(u, 1.9) }); check(620, 325, 9, pop(u, 2.0));
      mono(330, 362, 'delete secret/data/app/db', { 'font-size': 15, opacity: fade(u, 2.1) }); cross(620, 357, 9, pop(u, 2.2));
      return; }
    if (k === 4) { tx(480, 60, '최소 권한으로 정책 쓰기', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      [['필요한 path와 capability만 연다', 'app/* 는 read · list'], ['위험한 곳은 deny로 못 박는다', 'app/prod · sys/*'], ['같은 path는 정책끼리 합쳐진다', '그 안의 deny는 여전히 우선'], ['다른 path 끼리는 구체적인 쪽 하나', 'deny를 넓은 glob에만 걸면 밀릴 수 있다']].forEach(([a, b], i) => {
        const y = 108 + i * 70, s = pop(u, 0.2 + i * 0.35); card(480, y, 640, 58, { rx: 10, stroke: i === 3 ? WARN : ACC, s });
        tx(186, y + 6, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) }); tx(776, y + 6, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.35) }); });
      return; }
    tree((i) => { if (i >= 1 && i <= 3) { if (i === 3 && k >= 1) return k === 1 ? (u > 1.2 ? NOS : OKS) : NOS; return u > 1.0 || k > 0 ? OKS : {}; }
      if (i === 0) return { stroke: ACC };
      if (i >= 4 && k >= 2) return k === 2 && u < 1.0 ? {} : NOS; return {}; });
    const by = 40;
    block(560, by, 370, 'secret/data/app/*', ['read', 'list'], { hot: k === 0, op: k === 0 ? fade(u, 0.2) : 0.7 });
    if (k >= 1) block(560, by + 80, 370, 'secret/data/app/prod', ['deny'], { hot: k === 1, deny: true, op: k === 1 ? fade(u, 0.2) : 0.7 });
    if (k >= 2) block(560, by + 160, 370, 'sys/*', ['deny'], { hot: k === 2, deny: true, op: k === 2 ? fade(u, 0.2) : 0.7 });
    if (k === 0) tx(480, 360, 'app 아래는 read · list만 열린다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
    if (k === 1) { tx(480, 344, 'prod에는 두 패턴이 걸리고, 더 구체적인 prod 블록이 뽑힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(480, 372, '그 블록의 deny가 거부한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }
    if (k === 2) tx(480, 360, 'Vault 관리 API는 통째로 막는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }

  // ---------- 5. templated policy ----------
  function s5(t, c) { const { k, u } = c;
    const tpl = ['secret', 'data', 'user', '{{identity.entity.name}}', '*'];
    if (k <= 1) { tx(40, 52, '정책 파일 하나', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      segs(40, 64, tpl, (i) => (i === 3 ? { stroke: WARN, fill: WARNBG, color: WARN, dash: '5 3', op: k === 0 ? fade(u, 0.6) : 1 } : { op: k === 0 ? fade(u, 0.2) : 1 }), { fs: 14.5 });
      if (k === 0) { tx(480, 170, '로그인한 사람의 entity 이름이 이 자리에 들어간다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) });
        mono(480, 206, 'capabilities = [create, read, update, delete]', { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.9) }); return; }
      person(80, 200, 'alice', {});
      fly(120, 190, 340, 81, seg(u, 0.2, 0.9), 'alice', { mono: true, fill: WARN });
      segs(40, 140, ['secret', 'data', 'user', 'alice', '*'], (i) => (i === 3 ? { stroke: ACC, fill: ACCBG, color: ACC, op: fade(u, 1.0) } : { op: fade(u, 1.0) }), { fs: 14.5 });
      [['read secret/data/user/alice/note', true], ['read secret/data/user/bob/note', false]].forEach(([p, ok], i) => { const y = 260 + i * 60;
        mono(180, y + 5, p, { 'font-size': 15, opacity: fade(u, 1.4 + i * 0.4) }); verdict(720, y, ok, pop(u, 1.6 + i * 0.4)); });
      return; }
    if (k === 2) { tx(40, 52, '팀 경로도 같은 방식', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      segs(40, 64, ['secret', 'data', 'team', '{{identity.entity.metadata.team}}', '*'], (i) => (i === 3 ? { stroke: WARN, fill: WARNBG, color: WARN, dash: '5 3' } : {}), { fs: 14 });
      card(160, 190, 230, 70, { rx: 10, stroke: INFO, fill: INFOBG, s: pop(u, 0.4) });
      tx(60, 182, 'entity alice', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.5) }); mono(60, 208, 'metadata team=team-a', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.6) });
      grow(280, 190, 400, 190, E(u, 0.9, 1.3), INFO);
      [['read secret/data/team/team-a/x', true], ['read secret/data/team/team-b/x', false]].forEach(([p, ok], i) => { const y = 170 + i * 70;
        mono(420, y + 5, p, { 'font-size': 14.5, opacity: fade(u, 1.3 + i * 0.4) }); verdict(860, y, ok, pop(u, 1.5 + i * 0.4)); });
      return; }
    if (k === 3) { terminal(30, 30, 520, 160, [['$ vault policy write app-read app-policy.hcl', PANEL], ['$ vault policy write team-db team-db-policy.hcl', PANEL], ['$ vault token create \\', PANEL], ['    -policy="app-read" -policy="team-db"', PANEL]], lerp(0, 4, E(u, 0.1, 1.6)), { fs: 14 });
      zone(600, 30, 330, 160, 'sys/policies/acl', { fill: SOFT });
      ['app-read', 'team-db', 'default'].forEach((p, i) => card(765, 76 + i * 38, 200, 30, { rx: 6, text: p, fs: 14, mono: true, stroke: i < 2 ? ACC : GRID, s: i < 2 ? pop(u, 0.4 + i * 0.5) : 1 }));
      const g = E(u, 1.7, 2.4); card(480, 300, 420, 74, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 1.6) });
      mono(290, 292, 'token', { 'font-size': 15, 'font-weight': 800, opacity: g });
      mono(290, 318, 'policies ["app-read" "default" "team-db"]', { 'font-size': 14, fill: ACC, opacity: g });
      return; }
    tx(480, 50, '실무 원칙', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
    [['팀 · 앱 단위로 정책 파일을 나눈다', '관리가 쉽다'], ['필요한 path · capability만 연다', '최소 권한'], ['민감 경로는 deny로 못 박는다', 'sys/* · prod'], ['templated로 사람마다 공간을 나눈다', '정책 하나로']].forEach(([a, b], i) => {
      const y = 100 + i * 72, s = pop(u, 0.2 + i * 0.35); check(180, y, 10, s);
      tx(206, y + 6, a, { 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) }); tx(800, y + 6, b, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.35) }); }); }

  const quiz = [
    { q: 'alice가 userpass로 로그인해 token을 받았는데 secret/app/db를 읽으면 permission denied가 난다. 이유는 무엇인가?',
      o: ['비밀번호가 틀려서', 'token에 그 path를 여는 정책이 없어서', 'token TTL이 끝나서'], a: 1,
      why: '로그인은 신원 확인(인증)까지다. 무엇을 할 수 있는지는 정책이 정하고, 적지 않은 path는 기본으로 거부된다.' },
    { q: 'secret/data/app/*에 ["read", "list"]만 준 정책으로 secret/data/app/db에 create 요청을 보내면?',
      o: ['허용된다, 같은 경로라서', 'list가 있으니 허용된다', '거부된다, create가 목록에 없어서'], a: 2,
      why: 'capabilities에 적지 않은 동작은 자동으로 거부된다. 경로가 맞아도 동작이 목록에 있어야 한다.' },
    { q: '한 정책에 secret/data/+/db와 secret/data/app/*가 함께 있다. read secret/data/app/db에는 어느 블록이 적용되나?',
      o: ['secret/data/app/*', 'secret/data/+/db', '두 블록의 capabilities를 합친 것'], a: 0,
      why: '+는 13번째, *는 17번째 글자에서 처음 나온다. 첫 와일드카드가 더 뒤에 있는 app/*가 우선한다.' },
    { q: 'app/*에 read를 주고 app/prod에 deny를 둔 정책에서 read secret/data/app/prod는 어떻게 되나?',
      o: ['허용된다, app/*가 read를 열었으니까', '거부된다, 더 구체적인 app/prod 블록이 뽑히고 그 deny가 적용돼서', '정책 순서에 따라 달라진다'], a: 1,
      why: '두 패턴이 모두 걸리지만 와일드카드가 없는 app/prod가 우선한다. 그 블록이 deny라 거부된다.' },
    { q: 'path "secret/data/user/{{identity.entity.name}}/*" 정책을 받은 bob이 secret/data/user/alice/note를 읽으면?',
      o: ['허용된다, 같은 정책이라서', 'alice가 허락하면 허용된다', '거부된다, bob에게는 user/bob/* 로 치환되기 때문에'], a: 2,
      why: '변수는 요청한 사람의 entity 이름으로 바뀐다. bob에게 이 정책은 user/bob/* 만 연다.' },
  ];
  const summary = [
    '로그인해 받은 token도 정책이 없으면 아무 path도 읽지 못한다. 기본은 거부다.',
    '정책은 path마다 capabilities 목록이고, 목록에 없는 동작은 거부된다.',
    '+는 세그먼트 한 칸, *는 끝의 나머지 전부이고, 여러 패턴이 걸리면 구체적인 쪽 하나만 쓴다.',
    '같은 path 안에서 deny가 가장 앞서고, templated 정책은 사람마다 다른 경로를 연다.',
  ];
  const review = [
    { q: 'secret/data/app/*에 deny를 걸어 두었는데 secret/data/app/prod를 읽을 수 있었다. 먼저 의심할 것은?',
      o: ['deny가 작동하지 않는 버그', '다른 정책에 와일드카드 없는 secret/data/app/prod 허용 블록이 있다', 'token이 만료됐다'], a: 1,
      why: '서로 다른 패턴이 걸리면 더 구체적인 패턴 하나만 적용된다. 넓은 glob의 deny는 정확한 경로의 허용에 밀린다.' },
    { q: '앱에 app-read와 app-write 정책을 붙였는데 delete만 계속 거부된다. 가장 그럴듯한 이유는?',
      o: ['두 정책 어디에도 그 path의 delete가 없다', '정책을 두 개 붙이면 서로 지운다', 'delete는 sudo가 있어야만 된다'], a: 0,
      why: '같은 path는 두 정책의 capabilities를 합치지만, 어느 쪽에도 없는 동작은 합쳐도 없다.' },
    { q: '팀원 50명에게 각자 개인 경로를 주려 한다. 가장 관리하기 쉬운 방법은?',
      o: ['사람마다 정책 파일을 하나씩 만든다', 'secret/data/user/* 전체에 read를 연다', '{{identity.entity.name}}을 쓴 templated 정책 하나를 모두에게 붙인다'], a: 2,
      why: 'templated 정책은 요청한 사람의 이름으로 경로가 바뀐다. 정책 하나로 사람마다 다른 경로만 열린다.' },
  ];

  R.page({ title: '정책 판정 — 요청 path · 동작 vs 정책', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
