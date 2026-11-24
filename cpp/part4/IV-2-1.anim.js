/* IV-2-1 string_view·ranges — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 출력값(Hello, Modern C++ (17) / literal (7) / 16 / Modern / 4 16 36 / Linus(21) … / Dennis Ada Grace)은
 * 코드 블록을 zig c++ -std=c++20 (64비트) 으로 돌려 확인했다. filter 검사 8번 · transform 3번도 세어 본 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cells, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ctr = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  // 문자 칸: 한 칸 30, 간격 2. o.n(보이는 칸 수), o.on(i) 강조, o.dead 회색, o.idx 칸 번호
  const CP = 32;
  function chars(x, y, str, o) { o = o || {}; const arr = [...str], n = o.n ?? arr.length;
    arr.forEach((ch, i) => { if (i >= n) return; const on = o.on && o.on(i), dead = o.dead;
      card(x + i * CP + 15, y + 18, 30, 36, { rx: 4, text: ch === ' ' ? '␣' : ch, fs: 15, mono: true, fw: 700, stroke: dead ? GRID : on ? ACC : INK, fill: dead ? SOFT : on ? ACCBG : PANEL, color: dead ? OFF : ch === ' ' ? OFF : INK, sw: on ? 2.4 : 1.6, op: o.op });
      if (o.idx && (i % (o.idxStep || 1) === 0)) mono(x + i * CP + 15, y + 54, String(i), { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); }); }
  // 칸 위 괄호: a 번째부터 len 칸
  function brace(x, y, a, len, col, u) { if (len <= 0 || (u ?? 1) <= 0) return; const x0 = x + a * CP, x1 = x0 + len * CP - 2, w = (x1 - x0) * (u ?? 1);
    el('path', { d: `M${x0},${y + 8} V${y} H${x0 + w}${(u ?? 1) >= 1 ? ` V${y + 8}` : ''}`, fill: 'none', stroke: col || ACC, 'stroke-width': 2.5 }); }
  // 뷰 객체: [ptr | size]
  function viewObj(cx, cy, name, ptr, size, o) { o = o || {}; const s = o.s ?? 1, col = o.col || ACC;
    card(cx - 50, cy, 110, 54, { rx: 8, stroke: col, sw: 2.2, s, fill: o.fill });
    card(cx + 55, cy, 90, 54, { rx: 8, stroke: col, sw: 2.2, s, fill: o.fill });
    if (s > 0.5) { tx(cx - 50, cy - 9, 'ptr', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      mono(cx - 50, cy + 16, ptr, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col });
      tx(cx + 55, cy - 9, 'size', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      mono(cx + 55, cy + 16, String(size), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col });
      if (name) mono(cx - 115, cy + 6, name, { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 800, fill: col }); } }

  // ---------- 1. string_view ----------
  const HELLO = 'Hello, Modern C++';
  const BX = 230, BY = 240;
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { viewObj(480, 150, 'sv', '—', 0, { s: pop(u, 0.3) });
      ctr(480, 240, '#include <string_view>', fade(u, 0.8), { class: 'mono', 'font-size': 15 });
      ctr(480, 290, '가리키는 문자열이 아직 없다', fade(u, 1.3), { fill: MUT }); return; }
    if (k === 1) { zone(470, 70, 440, 230, 'printLen(std::string_view sv)');
      viewObj(720, 190, 'sv', 'ptr', 'n', { s: pop(u, 0.2) });
      [['std::string s', 100], ['"literal"', 190], ['char buf[]', 280]].forEach(([nm, y], i) => { const d = 0.6 + i * 0.4;
        pill(170, y, nm, INK, pop(u, d), { mono: true, fs: 14 });
        grow(250, y, 580, 190 + (i - 1) * 14, E(u, d + 0.2, d + 0.6), ACC); });
      ctr(480, 360, '무엇이 와도 문자 복사 0 · 두 칸짜리 값으로 받는다', fade(u, 2.0), { fill: ACC, 'font-weight': 700 }); return; }
    // k ≥ 2: s 와 힙 버퍼
    const lit = k === 4;
    if (!lit) { card(110, BY + 18, 100, 54, { rx: 8, text: 's', fs: 17, mono: true, fw: 800, s: k === 2 ? pop(u, 0.2) : 1 });
      grow(160, BY + 18, BX - 4, BY + 18, k === 2 ? E(u, 0.4, 0.7) : 1, INK);
      chars(BX, BY, HELLO, { n: k === 2 ? Math.round(17 * E(u, 0.6, 1.8)) : 17, idx: true, idxStep: 1 });
      tx(BX, BY + 78, '힙 버퍼 · s가 소유', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.0) : 1 }); }
    else { chars(BX, BY, 'literal', { idx: true, on: () => true });
      tx(BX, BY + 78, '문자열 리터럴 (프로그램 안의 고정 영역)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
    if (k === 2) { ctr(480, 120, '문자 17개를 실제로 들고 있는 것은 s 하나', fade(u, 2.0)); return; }
    const st = b.viewStart, len = b.viewLen, pst = p.viewStart ?? st, plen = p.viewLen ?? len;
    const cur = k === 3 ? Math.round(lerp(0, len, E(u, 0.8, 1.6))) : k === 5 ? Math.round(tween(plen, len, u)) : len;
    const sx = k === 5 ? lerp(pst, st, E(u, 0.1, 1.3)) : st;
    viewObj(480, 110, 'sv', lit ? '&lit[0]' : `&s[${Math.round(sx)}]`, cur, { s: k === 3 ? pop(u, 0.2) : 1 });
    const px = BX + sx * CP + 15; grow(430, 138, px, BY - 6, k === 3 ? E(u, 0.5, 0.9) : 1, ACC);
    brace(BX, BY - 22, sx, Math.max(cur, 0.01), ACC, k === 3 ? E(u, 0.8, 1.6) : 1);
    if (k === 3) ctr(480, 350, '복사가 아니라 첫 글자 주소와 길이 17을 적어 둘 뿐', fade(u, 1.8), { fill: ACC });
    if (k === 4) terminal(560, 310, 360, 90, ['$ printLen("literal")', 'literal (7)'], lerp(1, 2, E(u, 1.0, 1.6)));
    if (k === 4) note(BX, 360, '임시 std::string을 만들지 않는다', fade(u, 1.8), { fill: ACC });
    if (k === 5) { card(250, 360, 120, 44, { rx: 8, text: 'ptr 8B', fs: 14, mono: true, stroke: MUT, s: pop(u, 1.4) }); card(380, 360, 120, 44, { rx: 8, text: 'size 8B', fs: 14, mono: true, stroke: MUT, s: pop(u, 1.6) });
      mono(470, 366, '= sizeof(sv) 16', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.9) });
      tx(660, 366, '가리키는 길이와 무관 (64비트)', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); } }

  // ---------- 2. substr ----------
  function allocs(n, prev, u) { const v = Math.round(tween(prev, n, u)); card(850, 60, 150, 52, { rx: 10, stroke: v > 1 ? WARN : MUT, sw: 2 });
    tx(790, 54, '힙 할당', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(905, 70, `${v}번`, { 'font-size': 20, 'font-weight': 800, fill: v > 1 ? WARN : INK, 'text-anchor': 'end' }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { card(280, 200, 240, 120, { rx: 10, stroke: INK, sw: 2.4, s: pop(u, 0.2) }); mono(280, 170, '<string>', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      chars(200, 190, 'abc', { op: fade(u, 0.5) }); ctr(280, 250, '문자를 소유한다', fade(u, 0.6), { 'font-size': 14 });
      card(680, 200, 240, 120, { rx: 10, stroke: ACC, sw: 2.4, dash: '7 5', s: pop(u, 1.0) }); mono(680, 170, '<string_view>', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      ctr(680, 215, '창문 = ptr + size', fade(u, 1.3), { fill: ACC, 'font-size': 14 }); ctr(680, 245, '문자를 소유하지 않는다', fade(u, 1.4), { 'font-size': 14 });
      ctr(480, 350, '이름은 같은 substr이어도 비용이 다르다', fade(u, 2.0), { fill: MUT }); return; }
    const X0 = 140, Y0 = 150;
    tx(X0, Y0 - 14, 's (원본)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    chars(X0, Y0, HELLO, { n: k === 1 ? Math.round(17 * E(u, 0.2, 1.4)) : 17, idx: true, on: (i) => k >= 2 && i >= 7 && i < 13 });
    allocs(k === 1 ? 1 : k >= 2 ? (k === 2 && u < 1.2 ? 1 : 2) : 0, k === 1 ? 0 : 1, k === 1 ? u : 3);
    if (k === 1) { ctr(480, 300, '원본 한 번의 할당은 어느 쪽이든 필요하다', fade(u, 1.6), { fill: MUT }); return; }
    if (k <= 3) { // s2 = s.substr(7, 6): 새 버퍼에 복사
      const Y2 = 280; mono(X0 - 10, Y2 + 24, 's2', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 0.3) : 1 });
      const n = k === 2 ? Math.round(6 * E(u, 0.6, 1.8)) : 6;
      if (k === 2) for (let i = 0; i < 6; i++) fly(X0 + (7 + i) * CP + 15, Y0 + 18, X0 + i * CP + 15, Y2 + 18, seg(u, 0.5 + i * 0.2, 1.0 + i * 0.2), HELLO[7 + i], { mono: true, fill: WARN });
      chars(X0, Y2, 'Modern', { n, on: () => false });
      mono(X0 + 210, Y2 + 24, 's.substr(7, 6)  새 버퍼 + memcpy', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.4) : 1 }); }
    if (k === 3) { viewObj(330, 64, 'v', '&s[7]', 6, { s: pop(u, 0.2) }); grow(280, 92, X0 + 7 * CP + 15, Y0 - 4, E(u, 0.5, 1.0), ACC);
      brace(X0, Y0 - 24, 7, 6, ACC, E(u, 0.9, 1.5));
      mono(440, 112, 'sv.substr(7, 6)  할당 0', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
      ctr(480, 390, '둘 다 "Modern"이다. 다른 것은 비용뿐', fade(u, 2.1), { 'font-weight': 700 }); }
    if (k === 4) { const CX = 140, CY = 270, CSV = 'a,bb,ccc';
      tx(CX, CY - 14, 'csv = "a,bb,ccc"', { 'font-size': 14, 'font-weight': 700, class: 'mono' });
      chars(CX, CY, CSV, { idx: true, on: (i) => CSV[i] === ',' && u > 0.6 });
      const cuts = [[0, 1, 'a'], [2, 2, 'bb'], [5, 3, 'ccc']];
      cuts.forEach(([a, l, nm], i) => { const d = 0.7 + i * 0.5; if (u > d) { brace(CX, CY + 62, a, l, ACC, E(u, d, d + 0.3)); }
        pill(560 + i * 110, CY + 18, nm, ACC, pop(u, d + 0.3), { mono: true, fs: 15, fill: ACCBG }); });
      mono(560, CY - 16, 'cols (뷰 3개)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.6) });
      ctr(480, 390, 'find로 콤마를 찾고 창문만 민다 · 조각 문자 복사 0', fade(u, 2.2), { fill: ACC, 'font-weight': 700 }); } }

  // ---------- 3. 수명 ----------
  // 문장 끝(;)을 기준으로 한 시간 띠
  function timeline(y, marks, u0) { el('line', { x1: 60, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 3 });
    marks.forEach(([x, s, col], i) => { el('circle', { cx: x, cy: y, r: 6, fill: col || MUT, opacity: u0[i] ?? 1 }); tx(x, y + 26, s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: col || MUT, 'font-weight': 700, opacity: u0[i] ?? 1 }); }); }
  function tempStr(x, y, s, dead, o) { o = o || {}; el('rect', { x: x - 8, y: y - 8, width: s.length * CP + 14, height: 52, rx: 8, fill: 'none', stroke: dead ? BAD : WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: o.op ?? 1 });
    chars(x, y, s, { dead, op: o.op }); if (o.label) tx(x - 6, y - 16, o.label, { 'font-size': 13.5, fill: dead ? BAD : WARN, 'font-weight': 700, opacity: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { pill(480, 40, k === 0 ? 'std::string makeName() { return "Ada"; }' : 'std::string_view bad = makeName() + "!";', k === 0 ? INK : WARN, k <= 1 ? pop(u, 0.2) : 1, { mono: true, fs: 14.5 });
      const word = k === 0 ? 'Ada' : 'Ada!', dead = k === 2 && u > 0.6;
      tempStr(380, 130, word, dead, { op: k === 0 ? fade(u, 0.6) : 1, label: dead ? '파괴됨 · 메모리 반환' : '이름 없는 임시 std::string' });
      timeline(300, [[200, '임시 생성', WARN], [520, '; 문장 끝', BAD], [800, '다음 줄', MUT]], [k === 0 ? fade(u, 1.0) : 1, k >= 1 ? fade(u, k === 1 ? 1.2 : 0) : 0, k === 2 ? 1 : 0]);
      if (k >= 1) { viewObj(170, 210, 'bad', '&tmp[0]', 4, { s: k === 1 ? pop(u, 0.5) : 1, col: dead ? BAD : ACC });
        grow(140, 182, 395, 172, k === 1 ? E(u, 0.8, 1.2) : 1, dead ? BAD : ACC); }
      if (k === 0) note(560, 210, '호출식이 만든 것은 이름 없는 임시다', fade(u, 1.4));
      if (k === 1) note(560, 210, '뷰는 가리킬 뿐 살려 두지 않는다', fade(u, 1.8), { fill: WARN });
      if (k === 2) { dot([[200, 300], [520, 300], [800, 300]], seg(u, 0.1, 1.4), BAD, 7);
        pill(640, 210, 'cout << bad;  미정의 동작', BAD, pop(u, 1.5), { mono: true, fs: 14, fill: BADBG }); }
      return; }
    if (k === 3) { pill(480, 40, 'std::string good = makeName() + "!";', GOOD, pop(u, 0.2), { mono: true, fs: 14.5 });
      card(150, 150, 110, 54, { rx: 8, text: 'good', fs: 16, mono: true, fw: 800, stroke: GOOD, s: pop(u, 0.4) });
      grow(205, 150, 376, 150, E(u, 0.6, 0.9), GOOD); chars(380, 132, 'Ada!', { on: () => true });
      tx(380, 112, 'good이 소유한 버퍼', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
      timeline(300, [[200, '생성', GOOD], [520, '; 문장 끝', MUT], [800, '다음 줄에서도 살아 있다', GOOD]], [1, fade(u, 1.0), fade(u, 1.6)]);
      dot([[200, 300], [520, 300], [800, 300]], seg(u, 1.0, 2.2), GOOD, 7);
      ctr(480, 390, '문장 밖에서도 써야 하면 뷰가 아니라 std::string으로 받는다', fade(u, 2.2), { 'font-weight': 700 }); return; }
    // k 4: 원본이 자라면
    const grown = u > 1.0;
    pill(480, 40, 'buf += " there there there";', INK, pop(u, 0.9), { mono: true, fs: 14.5 });
    tx(140, 104, grown ? '옛 버퍼 (반환됨)' : 'buf의 버퍼', { 'font-size': 13.5, 'font-weight': 700, fill: grown ? BAD : MUT });
    chars(140, 116, 'hi', { dead: grown });
    viewObj(250, 230, 'sv', '&old[0]', 2, { col: grown ? BAD : ACC });
    grow(200, 202, 155, 156, 1, grown ? BAD : ACC);
    if (grown) { tx(300, 104, '새로 잡은 큰 버퍼', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.1) });
      chars(300, 116, 'hi there there there', { n: Math.round(20 * E(u, 1.1, 2.0)) }); }
    tx(560, 260, '용량을 넘어 재할당되면 sv는 옛 버퍼에 남는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
    tx(560, 286, '재할당 시점은 구현마다 다르다 (예시)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); }

  // ---------- 4. 지연 파이프라인 ----------
  const NUMS = [1, 2, 3, 4, 5, 6, 7, 8];
  const ST = [{ x: 330, nm: 'filter', d: '짝수만' }, { x: 530, nm: 'transform', d: '제곱' }, { x: 730, nm: 'take(3)', d: '앞 3개' }];
  function station(i, s, hot) { const q = ST[i]; card(q.x, 210, 140, 70, { rx: 10, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: 2.2, s });
    if (s > 0.5) { mono(q.x, 205, q.nm, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); tx(q.x, 228, q.d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { ['views::filter', 'views::transform', 'views::take'].forEach((s, i) => pill(240 + i * 240, 200, s, ACC, pop(u, 0.3 + i * 0.3), { mono: true, fs: 15, fill: ACCBG }));
      ctr(480, 290, '컨테이너가 아니라 컨테이너를 감싸는 얇은 뷰를 만든다', fade(u, 1.6)); return; }
    // nums 는 위에
    tx(60, 58, 'nums (유일한 저장소)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    cells(60, 70, NUMS, { w: 40, h: 40, gap: 6, s: undefined, style: (i) => ({ s: k === 1 ? pop(u, 0.2 + i * 0.12) : 1 }) });
    if (k === 1) { ctr(600, 200, '이 뒤로 새 vector는 하나도 만들지 않는다', fade(u, 1.6)); return; }
    const nst = k === 2 ? 1 : k === 3 ? 2 : 3;
    for (let i = 0; i < nst; i++) { station(i, (k === 2 && i === 0) || (k === 3 && i === 1) || (k === 4 && i === 2) ? pop(u, 0.3) : 1);
      if (i) grow(ST[i - 1].x + 72, 210, ST[i].x - 72, 210, 1, MUT); }
    grow(150, 116, 258, 196, 1, MUT);
    if (k < 4) { card(860, 330, 150, 52, { rx: 10, stroke: GRID, text: '계산 0번', fs: 16, fw: 800, s: pop(u, 0.8) });
      ctr(480, 330, k === 2 ? '조건만 저장했다' : '뷰 위에 뷰를 한 겹 더', fade(u, 1.2), { fill: MUT }); return; }
    // k 4: 순회. 원소 하나에 0.27초
    const D = 0.27, T0 = 0.25; let fc = 0, tcount = 0; const out = [];
    NUMS.forEach((n, i) => { const a = T0 + i * D; if (u < a) return; fc++;
      const even = n % 2 === 0, idxEven = Math.floor(n / 2) - 1, taken = even && idxEven < 3;
      if (taken) tcount++;
      const f = clamp((u - a) / D), y = 210;
      if (f < 1) { const x = even ? (taken ? lerp(150, 830, f) : lerp(150, 420, f)) : lerp(150, 330, f);
        card(x, y - 56, 38, 30, { rx: 6, text: String(taken && x > 530 ? n * n : n), fs: 14, mono: true, fw: 800, fill: even ? ACCBG : BADBG, stroke: even ? ACC : BAD }); }
      if (taken && f >= 0.85) out.push(n * n); });

    mono(60, 300, `filter 검사 ${fc}번`, { 'font-size': 16, 'font-weight': 800, fill: INK });
    mono(60, 330, `transform ${tcount}번`, { 'font-size': 16, 'font-weight': 800, fill: ACC });
    terminal(560, 280, 360, 100, ['$ ./a.exe', out.join(' ')], out.length ? 2 : 1);
    tx(60, 380, '8은 filter만 지나고 64는 끝내 계산되지 않는다', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.5) }); }

  // ---------- 5. ranges 알고리즘 · 프로젝션 ----------
  const PEOPLE = [['Ada', 36], ['Linus', 21], ['Grace', 45], ['Dennis', 30]];
  function person(x, y, nm, age, o) { o = o || {}; card(x, y, 150, 64, { rx: 10, stroke: o.dim ? GRID : INK, sw: 2, s: o.s, fill: o.dim ? SOFT : PANEL });
    if ((o.s ?? 1) > 0.5) { tx(x - 60, y - 6, nm, { 'font-size': 15, 'font-weight': 800, fill: o.dim ? OFF : INK });
      mono(x - 60, y + 20, 'age', { 'font-size': 13.5, fill: MUT }); mono(x + 60, y + 20, String(age), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: o.dim ? OFF : o.hot ? ACC : INK }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 140, 520, 54, { rx: 10, stroke: MUT, text: 'std::sort(v.begin(), v.end());', fs: 16, mono: true, color: MUT, s: pop(u, 0.2) });
      card(480, 240, 520, 54, { rx: 10, stroke: ACC, text: 'std::ranges::sort(v);', fs: 16, mono: true, color: ACC, s: pop(u, 0.9) });
      grow(480, 170, 480, 210, E(u, 0.6, 0.9), MUT);
      ctr(480, 330, '반복자 짝 대신 범위 하나를 넘긴다', fade(u, 1.5), { 'font-weight': 700 }); return; }
    if (k === 1) { card(320, 200, 280, 110, { rx: 10, s: pop(u, 0.2) }); mono(200, 172, 'struct Person {', { 'font-size': 15, opacity: fade(u, 0.3) });
      mono(220, 200, 'std::string name;', { 'font-size': 15, opacity: fade(u, 0.4) }); mono(220, 226, 'int age;', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      note(560, 190, 'Person끼리는 <로 비교할 수 없다', fade(u, 1.2)); note(560, 222, '기준이 될 필드는 age 하나', fade(u, 1.6), { fill: ACC }); return; }
    const order = [1, 3, 0, 2];   // 나이순: Linus 21, Dennis 30, Ada 36, Grace 45
    const xs = (slot) => 130 + slot * 180;
    if (k === 2) { PEOPLE.forEach(([nm, a], i) => person(xs(i), 180, nm, a, { s: pop(u, 0.2 + i * 0.25) }));
      ctr(480, 300, '정렬 전 나이: 36 · 21 · 45 · 30', fade(u, 1.5), { class: 'mono' }); return; }
    if (k === 3) { pill(480, 50, 'std::ranges::sort(people, {}, &Person::age);', ACC, pop(u, 0.2), { mono: true, fs: 14.5, fill: ACCBG });
      PEOPLE.forEach(([nm, a], i) => { const to = order.indexOf(i), g = E(u, 0.9, 2.0), x = lerp(xs(i), xs(to), g), y = 180 - Math.sin(g * Math.PI) * (i % 2 ? 40 : -40);
        person(x, y, nm, a, { hot: true }); });
      ctr(480, 300, '비교자는 기본 {}, 기준은 &Person::age', fade(u, 0.6), { fill: MUT });
      terminal(150, 330, 660, 70, ['Linus(21) Dennis(30) Ada(36) Grace(45)'], E(u, 2.1, 2.6), {}); return; }
    // k 4: filter | transform(&Person::name)
    order.forEach((i, slot) => person(xs(slot), 130, PEOPLE[i][0], PEOPLE[i][1], { dim: PEOPLE[i][1] < 30 && u > 0.6 }));
    pill(270, 220, 'filter(age >= 30)', ACC, pop(u, 0.3), { mono: true, fs: 14 }); pill(640, 220, 'transform(&Person::name)', ACC, pop(u, 0.8), { mono: true, fs: 14 });
    ['Dennis', 'Ada', 'Grace'].forEach((nm, i) => fly(xs(i + 1), 160, 300 + i * 150, 310, seg(u, 1.0 + i * 0.3, 1.6 + i * 0.3), nm, { stay: true }));
    ctr(480, 380, '중간 vector 없이 이름만 순회한다', fade(u, 2.3), { 'font-weight': 700 }); }

  // ---------- 6. 실패 사례 ----------
  const PIT = ['① 댕글링 뷰', '② 널 종료 가정', '③ 원본보다 오래', '④ 원본 수정'];
  function pits(on, u) { PIT.forEach((s, i) => pill(122 + i * 238, 30, s, on.includes(i) ? BAD : GRID, on.includes(i) ? pop(u, 0.1) : 1, { fs: 14, fill: on.includes(i) ? BADBG : PANEL, color: on.includes(i) ? BAD : OFF })); }
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { pits([0, 2], u);
      card(250, 200, 300, 150, { rx: 12, stroke: ACC, sw: 2.4, dash: '8 6', s: pop(u, 0.2) }); mono(250, 160, 'std::string_view', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      card(700, 200, 300, 150, { rx: 12, stroke: ACC, sw: 2.4, dash: '8 6', s: pop(u, 0.6) }); mono(700, 160, 'ranges view', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) });
      ctr(250, 210, '문자를 소유하지 않는다', fade(u, 0.9), { 'font-size': 14 }); ctr(700, 210, '원소를 소유하지 않는다', fade(u, 1.1), { 'font-size': 14 });
      ctr(480, 360, '창문이 원본보다 오래 살면 그 순간 무효다', fade(u, 1.7), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { pits([0], u);
      [['std::string_view bad = getStr() + "!";', BAD, 0.2], ['std::string ok = getStr() + "!";', GOOD, 1.1]].forEach(([code, col, d], i) => { const y = 110 + i * 150;
        mono(60, y, code, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, d) });
        if (i === 0) { tempStr(120, y + 44, 'log!', u > 0.9, { op: fade(u, d + 0.2), label: u > 0.9 ? '문장 끝에서 파괴' : '임시' }); cross(300, y + 62, 10, pop(u, 1.0)); }
        else { chars(120, y + 30, 'log!', { on: () => true, op: fade(u, d + 0.2) }); check(300, y + 48, 10, pop(u, d + 0.5)); } });
      note(560, 180, '오른쪽 식은 똑같다', fade(u, 1.8)); note(560, 210, '받는 타입 하나가 UB와 안전을 가른다', fade(u, 2.1), { fill: ACC }); return; }
    if (k === 2) { pits([1], u);
      tx(80, 90, '버퍼', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); chars(80, 100, 'log!', { on: (i) => i < 3 }); card(80 + 4 * CP + 15, 118, 30, 36, { rx: 4, text: '\\0', fs: 14, mono: true, stroke: MUT, color: MUT });
      brace(80, 92, 0, 3, ACC, E(u, 0.2, 0.6)); tx(80, 180, 'sv가 앞 3글자만 볼 때 (예시)', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(420, 110, 'printf("%s", sv.data());', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      dot([[95, 156], [95 + 4 * CP, 156]], seg(u, 1.0, 1.8), BAD, 6);
      mono(420, 140, '→ "log!"  \\0을 만날 때까지 읽는다', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.8) });
      mono(420, 240, 'std::string cstr{sv};  cstr.c_str()', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      mono(420, 270, '→ "log"  길이만큼 복사하고 \\0을 붙인다', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 2.2) });
      ctr(480, 370, 'string_view는 널 종료를 약속하지 않는다', fade(u, 2.4), { 'font-weight': 700 }); return; }
    // k 3: 파이프라인 뒤 원본 수정
    pits([3], u);
    tx(80, 90, 'v', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const pushed = u > 0.8; cells(100, 70, pushed ? [1, 2, 3, 9] : [1, 2, 3], { w: 40, h: 40, style: (i) => (i === 3 ? { stroke: WARN, fill: WARNBG, s: pop(u, 0.8) } : {}) });
    mono(320, 96, 'pipe = v | filter(n > 1)', { 'font-size': 14.5, opacity: fade(u, 0.3) });
    mono(80, 180, '만든 뒤 push_back(9)하고 처음 순회하면', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) });
    terminal(80, 196, 300, 66, ['2 3 9'], E(u, 1.3, 1.7) > 0.5 ? 1 : 0);
    tx(420, 236, '뷰는 v를 지금 모습 그대로 본다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
    mono(80, 310, '한 번 순회한 뒤 push_back(9)로 재할당되면', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
    tx(80, 340, 'filter가 기억해 둔 시작 반복자가 옛 버퍼를 가리킨다', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.1) });
    ctr(480, 395, '원본 수정을 끝낸 뒤 파이프라인을 만들고 순회한다', fade(u, 2.4), { 'font-weight': 700, fill: GOOD }); }

  const quiz = [
    { q: 'std::string_view 안에 실제로 들어 있는 것은 무엇인가?',
      o: ['문자들의 복사본', '첫 글자를 가리키는 포인터와 길이', '원본 std::string 전체의 참조 카운트'], a: 1,
      why: '뷰는 ptr과 size 두 값뿐이라 64비트에서 sizeof가 16이다. 몇 글자를 가리키든 크기가 같다.' },
    { q: 's.substr(7, 6)과 sv.substr(7, 6)의 차이는 무엇인가?',
      o: ['앞은 새 버퍼에 복사하고 뒤는 ptr과 size만 바꾼다', '앞은 뷰를 주고 뒤는 복사본을 준다', '결과 문자열이 서로 다르다'], a: 0,
      why: '둘 다 "Modern"이지만 std::string::substr는 힙 할당과 복사를, string_view::substr는 창문 이동만 한다.' },
    { q: 'std::string_view bad = makeName() + "!"; 다음 줄에서 bad를 읽으면 어떻게 되는가?',
      o: ['"Ada!"가 안전하게 나온다', '컴파일 에러가 난다', '이미 파괴된 임시를 읽는 미정의 동작이다'], a: 2,
      why: '임시 "Ada!"는 문장 끝 ;에서 파괴된다. 뷰는 임시를 살려 두지 않으므로 bad는 반환된 메모리를 가리킨다.' },
    { q: 'nums | filter | transform | take(3) 파이프라인을 만든 직후 계산은 몇 번 일어났는가?',
      o: ['0번', '8번', '3번'], a: 0,
      why: '뷰는 지연 평가라 정의할 때는 아무것도 계산하지 않는다. 순회해야 filter 검사 8번, transform 3번이 돈다.' },
    { q: 'std::ranges::sort(people, {}, &Person::age)에서 &Person::age의 역할은 무엇인가?',
      o: ['비교 함수 자체', '각 원소에서 비교할 값을 뽑는 프로젝션', '정렬할 범위의 끝'], a: 1,
      why: '비교자는 기본 {}로 두고 원소를 age로 투영해 비교한다. 그래서 별도 비교 람다 없이 나이순이 된다.' },
    { q: 'sv.data()를 printf("%s")에 그대로 넘기면 안 되는 이유는 무엇인가?',
      o: ['string_view는 널 종료를 보장하지 않아서', 'data()가 nullptr를 돌려줘서', 'printf가 string_view를 모르면 컴파일이 안 되어서'], a: 0,
      why: '뷰가 원본 중간까지만 볼 때 그 뒤에 \\0이 없다. %s는 \\0을 만날 때까지 읽으므로 뷰 밖까지 출력한다.' },
  ];

  const summary = [
    'string_view는 포인터와 길이만 가진 창문이라 문자를 복사하지 않고 읽는다.',
    'std::string의 substr는 조각마다 새 버퍼를 잡고, string_view의 substr는 창문만 옮긴다.',
    '뷰는 원본을 살려 두지 않아서 임시 문자열을 가리키면 문장 끝에서 바로 무효가 된다.',
    'ranges 파이프라인은 순회할 때 원소 하나씩 흐르고 중간 vector를 만들지 않는다.',
  ];
  const review = [
    { q: '설정 파일을 읽는 클래스가 멤버로 std::string_view name을 두고 생성자에서 지역 std::string을 넘겼다. 나중에 name이 깨진다. 먼저 고칠 것은?',
      o: ['멤버를 std::string으로 바꿔 소유한다', 'name을 const std::string_view&로 바꾼다', 'string_view 대신 const char*를 쓴다'], a: 0,
      why: '지역 문자열은 생성자가 끝나면 사라지고 뷰는 그 메모리를 가리킨 채 남는다. 보관할 값은 std::string으로 받아야 한다.' },
    { q: '로그 한 줄을 토큰 30개로 쪼개는 함수가 느리다. 토큰을 std::string substr로 만들고 읽기만 한다. 먼저 해 볼 것은?',
      o: ['토큰마다 reserve를 부른다', '토큰을 std::list에 담는다', '토큰을 string_view로 받아 원본 위에서 자른다'], a: 2,
      why: 'std::string::substr는 토큰마다 할당과 복사를 한다. 원본이 살아 있는 동안 읽기만 하면 string_view의 substr로 복사를 없앨 수 있다.' },
    { q: '함수 안 지역 vector에 filter를 걸어 만든 뷰를 return했더니 호출한 쪽에서 이상한 값이 나온다. 원인은?',
      o: ['filter가 짝수만 남겨서', '뷰가 함수가 끝나며 사라진 지역 vector를 가리켜서', 'take를 붙이지 않아서'], a: 1,
      why: 'ranges 뷰도 원소를 소유하지 않는다. 원본보다 오래 사는 뷰는 댕글링이니 결과를 vector로 모아 돌려준다.' },
  ];

  R.page({ title: 'string_view와 ranges의 창문', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
