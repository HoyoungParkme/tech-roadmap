/* I-2-2 프로퍼티와 자동 구현 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono: monoRaw, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, terminal, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 한글이 섞인 글은 고정폭 글꼴에서 자간이 벌어지므로 보통 글꼴로 쓴다
  const mono = (x, y, s, a, p) => (/[가-힣]/.test(String(s)) ? tx(x, y, s, Object.assign({ style: 'white-space:pre' }, a || {}), p) : monoRaw(x, y, s, a, p));
  const KW = /^(var|class|static|void|string|int|decimal|new|public|private|get|set|init|required|record|value|return|if|throw|this)$/;
  function cs(x, y, line, o) { o = o || {}; const fs = o.fs || 14.5, f = o.shown == null ? 1 : clamp(o.shown);
    const s = line.slice(0, Math.round(line.length * f)); const parts = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) parts.push([w, KW.test(w) ? { fill: INFO, 'font-weight': 700 } : { fill: o.color || INK }]); }); buf = ''; };
    while (i < s.length) { const c = s[i];
      if (c === '/' && s[i + 1] === '/') { flush(); parts.push([s.slice(i), { fill: MUT }]); break; }
      if (c === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; parts.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += c; i++; }
    flush(); return spans(x, y, parts, { 'font-size': fs, opacity: o.op ?? 1 }); }
  const out = (x, y, w, lines, shown) => terminal(x, y, w, 30 + lines.length * 22 + 14, lines.map((l) => [l, 'var(--term)']), Math.max(0.001, shown), { title: 'console', fs: 14 });
  const token = (x, y, s, col, sc) => card(x, y, tw(s, 14.5) + 24, 30, { rx: 15, fill: col || ACC, stroke: 'none', text: s, fs: 14.5, fw: 800, color: PANEL, mono: true, s: sc ?? 1 });
  // 문(접근자): 열림/잠김
  function door(x, y, name, open, col, sc) { const c = open ? (col || GOOD) : BAD, s = sc ?? 1;
    el('rect', { x: x - 30, y: y - 20, width: 60, height: 40, rx: 6, fill: open ? GOODBG : BADBG, stroke: c, 'stroke-width': 2.2, opacity: s });
    mono(x, y + 6, name, { 'font-size': 14.5, 'font-weight': 800, fill: c, 'text-anchor': 'middle', opacity: s }); }
  // 숨은 필드 칸
  function field(x, y, name, v, o) { o = o || {}; const w = o.w || 230, s = o.s ?? 1;
    el('rect', { x, y, width: w, height: 40, rx: 6, fill: o.fill || SOFT, stroke: o.stroke || MUT, 'stroke-width': 1.8, 'stroke-dasharray': o.dash || '5 4', opacity: s });
    mono(x + 10, y + 25, name, { 'font-size': 13.5, fill: MUT, opacity: s });
    if (v != null) mono(x + w - 10, y + 25, v, { 'font-size': 15, 'font-weight': 800, fill: o.vcol || INK, 'text-anchor': 'end', opacity: s }); }

  // ================= 장면 1. 필드 vs 프로퍼티 =================
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: public 필드
    zone(30, 40, 420, 250, 'UserBad (public 필드)', { fill: SOFT, color: k <= 1 ? INK : MUT });
    field(120, 110, 'Name', k === 0 && u < 1.3 ? null : '"Ada"', { w: 240, stroke: INK, dash: null, fill: PANEL });
    if (k === 0) { token(lerp(80, 200, E(u, 0.3, 1.2)), lerp(220, 130, E(u, 0.3, 1.2)), '"Ada"', ACC, u < 1.3 ? 1 : 0);
      cs(60, 250, 'u.Name = "Ada";', { fs: 15 }); pill(330, 250, 'IL: stfld Name', INFO, pop(u, 1.6), { fs: 14, mono: true });
      sub(240, 190, '필드 칸에 곧장 쓴다. 지금은 아무 문제 없다', fade(u, 2.0), { 'font-size': 14, fill: INK }); }
    if (k === 1) { card(240, 190, 330, 44, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, text: '"이름이 바뀌면 로그를 남겨줘"', fs: 15, s: pop(u, 0.2) });
      cross(390, 130, 12, pop(u, 0.9)); sub(240, 250, '읽고 쓰는 길목에 끼워 넣을 자리가 없다', fade(u, 1.0), { 'font-size': 14.5, fill: INK });
      // 다른 어셈블리의 호출부
      card(700, 140, 300, 120, { rx: 10, stroke: INK, sw: 2, s: pop(u, 1.3) });
      tx(560, 102, '이미 빌드된 Other.dll', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      mono(570, 140, 'stfld UserBad::Name', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      tx(570, 176, '필드가 사라지면 실행 불가', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
      pill(700, 250, '필드 → 프로퍼티 = 바이너리 호환 깨짐', BAD, pop(u, 2.1), { fs: 14 });
      sub(700, 300, '참조하던 어셈블리를 모두 다시 컴파일해야 한다', fade(u, 2.3), { 'font-size': 14, fill: INK });
      return; }
    if (k === 0) return;
    // 오른쪽: 프로퍼티 (문 두 개 뒤에 숨은 필드)
    zone(490, 40, 440, 250, 'User (프로퍼티)', { fill: SOFT, color: INK });
    const sc = k === 2 ? pop(u, 0.2) : 1;
    door(560, 110, 'set', true, INFO, sc); door(560, 200, 'get', true, INFO, k === 2 ? pop(u, 0.5) : 1);
    const v = k === 2 ? null : k === 3 && u < 1.5 ? null : '"Ada"';
    field(640, 135, '숨은 필드', v, { w: 260, s: k === 2 ? fade(u, 0.9) : 1 });
    el('line', { x1: 590, y1: 110, x2: 640, y2: 150, stroke: MUT, 'stroke-width': 2 }); el('line', { x1: 590, y1: 200, x2: 640, y2: 165, stroke: MUT, 'stroke-width': 2 });
    if (k === 2) { cs(500, 330, 'public string Name { get; set; }', { fs: 16, op: fade(u, 1.2) });
      sub(710, 370, '겉은 obj.Name 그대로, 속은 get/set 메서드', fade(u, 1.7), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { dot([[500, 330], [500, 110], [530, 110]], seg(u, 0.3, 1.0), ACC, 8); token(760, 92, 'value = "Ada"', ACC, pop(u, 0.9));
      cs(500, 330, 'u.Name = "Ada";', { fs: 16 }); pill(790, 330, 'IL: callvirt set_Name', INFO, pop(u, 1.6), { fs: 14, mono: true });
      sub(710, 380, '대입처럼 보여도 set 메서드 호출이다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    dot([[900, 155], [900, 230], [600, 230], [500, 250]], seg(u, 0.3, 1.3), ACC, 8);
    cs(500, 330, 'Console.WriteLine(u.Name);', { fs: 15 }); out(500, 350, 200, ['Ada'], seg(u, 1.4, 1.8));
    sub(830, 380, '읽을 때는 get 이 불린다', fade(u, 1.9), { 'font-size': 14.5, fill: INK });
  }

  // ================= 장면 2. 자동 구현 → 백킹 필드 =================
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { card(300, 170, 520, 230, { rx: 12, stroke: INK, sw: 2 });
      cs(56, 80, 'public class Product {', { fs: 16 });
      cs(80, 124, 'public string Name { get; set; }', { fs: 15.5, shown: k === 0 ? seg(u, 0.2, 0.9) : 1 });
      cs(80, 160, 'public decimal Price { get; set; }', { fs: 15.5, shown: k === 0 ? seg(u, 0.7, 1.4) : 1 });
      if (k === 1) cs(80, 196, 'public int Stock { get; set; } = 0;', { fs: 15.5, shown: seg(u, 0.2, 0.9) });
      mono(56, 270, '}', { 'font-size': 16 });
      if (k === 0) { pill(780, 140, '본문 없음', INFO, pop(u, 1.6), { fs: 15 }); sub(780, 190, '빈 자리는 컴파일러가 채운다', fade(u, 1.9), { 'font-size': 14.5, fill: INK }); return; }
      fly(400, 196, 760, 280, seg(u, 1.0, 1.7), '= 0', { fill: GOOD, mono: true });
      field(620, 300, '<Stock>k__BackingField', u > 1.7 ? '0' : null, { w: 300, s: fade(u, 0.9) });
      sub(770, 370, '초기값은 숨은 필드로 들어간다', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // 한 줄이 세 조각으로
    cs(60, 60, 'public string Name { get; set; }', { fs: 18 });
    const sp = k === 2 ? E(u, 0.3, 1.2) : 1;
    grow(200, 76, 200, lerp(76, 110, sp), sp, MUT);
    field(60, 120, '<Name>k__BackingField', k >= 5 ? '"Book"' : null, { w: 320, s: k === 2 ? fade(u, 0.6) : 1, vcol: ACC });
    if (k === 2) { tx(440, 145, '숨은 private 필드 1개', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(60, 220, 'Product 에 실제로 생긴 필드 (리플렉션으로 확인)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5) });
      ['<Name>k__BackingField', '<Price>k__BackingField', '<Stock>k__BackingField'].forEach((s, i) => mono(76, 252 + i * 28, s, { 'font-size': 14.5, opacity: fade(u, 1.7 + i * 0.2) }));
      sub(700, 300, 'C# 코드로는 이 이름을 직접 쓸 수 없다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // get
    const gs = k === 3 ? pop(u, 0.2) : 1;
    card(620, 140, 300, 44, { rx: 8, stroke: INFO, sw: 2, s: gs }); mono(486, 146, 'get => 숨은 필드', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: gs });
    grow(380, 140, 466, 140, k === 3 ? seg(u, 0.5, 0.9) : 1, INFO);
    if (k === 3) { sub(620, 200, '인자 없이 값을 돌려주는 메서드', fade(u, 1.1), { 'font-size': 14.5, fill: INK }); sub(480, 300, '남은 것은 set 이다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    const ss = k === 4 ? pop(u, 0.2) : 1;
    card(620, 220, 300, 44, { rx: 8, stroke: ACC, sw: 2, s: ss }); mono(486, 226, 'set => 숨은 필드 = value', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: ss });
    grow(466, 220, 300, 162, k === 4 ? seg(u, 0.5, 0.9) : 1, ACC);
    if (k === 4) { token(780, 290, 'value', ACC, pop(u, 1.0)); sub(620, 340, 'value = 대입된 값을 가리키는 예약어', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(620, 370, '나중에 이 자리에 검증을 넣을 수 있다', fade(u, 1.8), { 'font-size': 14 }); return; }
    // k5 사용
    cs(60, 300, 'var p = new Product { Name = "Book", Price = 12.5m };', { fs: 15 });
    dot([[160, 290], [160, 250], [770, 250], [770, 242]], seg(u, 0.3, 1.0), ACC, 8);
    out(60, 320, 300, ['Book: 12.5'], seg(u, 1.5, 1.9));
    sub(680, 350, '자동 구현이든 손으로 쓴 접근자든 쓰는 법은 같다', fade(u, 1.9), { 'font-size': 14.5, fill: INK });
  }

  // ================= 장면 3. 접근 제어 · init =================
  const PR = [['Status', '{ get; private set; }'], ['Id', '{ get; init; }'], ['CreatedAt', '{ get; }']];
  // phase: 'build' (생성 중) | 'after' (생성 후)
  function order(n, phase, vals, o) { o = o || {};
    zone(250, 40, 460, 300, 'Order 객체 안', { fill: SOFT });
    PR.forEach(([name, acc], i) => { if (i >= n) return; const y = 100 + i * 80, s = o.pop && o.pop[i] != null ? o.pop[i] : 1;
      mono(270, y - 18, name + ' ' + acc, { 'font-size': 14, fill: MUT, opacity: s });
      field(290, y - 6, name, vals[i], { w: 240, s, stroke: INK, dash: null, fill: PANEL });
      door(200, y + 14, 'get', true, INFO, s);
      const wOpen = i === 0 ? false : i === 1 ? phase === 'build' : false;
      if (i !== 2) door(780, y + 14, i === 1 ? 'init' : 'set', wOpen, GOOD, s); else card(780, y + 14, 60, 40, { rx: 6, text: '없음', fs: 14, stroke: GRID, color: MUT, s }); }); }
  function phases(phase, s) { const y = 370; tx(270, y, '생성 중 (생성자·초기화자)', { 'font-size': 14, 'font-weight': 700, fill: phase === 'build' ? GOOD : MUT, opacity: s ?? 1 });
    tx(560, y, '생성 후', { 'font-size': 14, 'font-weight': 700, fill: phase === 'after' ? INK : MUT, opacity: s ?? 1 });
    el('rect', { x: 260, y: y + 10, width: 270, height: 8, rx: 4, fill: phase === 'build' ? GOOD : GRID, opacity: s ?? 1 }); el('rect', { x: 550, y: y + 10, width: 160, height: 8, rx: 4, fill: phase === 'after' ? INK : GRID, opacity: s ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    tx(60, 64, '밖', { 'font-size': 16, 'font-weight': 800, fill: MUT }); tx(880, 64, '밖', { 'font-size': 16, 'font-weight': 800, fill: MUT });
    if (k === 0) { order(1, 'after', ['"New"'], { pop: [pop(u, 0.2)] });
      sub(480, 230, 'set 문은 밖에서 잠기고, 안에서만 열린다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 260, '밖에서는 읽기만 된다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 1) { const ph = u < 1.6 ? 'build' : 'after';
      order(2, ph, ['"New"', u > 0.8 ? '1' : null], { pop: [1, pop(u, 0.2)] }); phases(ph, fade(u, 0.3));
      if (u > 0.4 && u < 0.9) token(lerp(880, 800, seg(u, 0.4, 0.8)), 194, 'Id = 1', GOOD);
      sub(480, 320, ph === 'build' ? '초기화하는 동안만 init 문이 열린다' : '생성이 끝나면 잠긴다', 1, { 'font-size': 15, fill: ph === 'build' ? GOOD : BAD, 'font-weight': 700 }); return; }
    if (k === 2) { order(3, 'after', ['"New"', '1', u > 1.0 ? 'UtcNow' : null], { pop: [1, 1, pop(u, 0.2)] }); phases('build', 1);
      pill(480, 326, 'public Order() => CreatedAt = DateTime.UtcNow;', INFO, pop(u, 0.6), { fs: 13.5, mono: true });
      grow(480, 312, 480, 290, seg(u, 0.8, 1.0), INFO); return; }
    if (k === 3 || k === 5) { const done = k === 5 && u > 1.2;
      order(3, 'after', [done ? '"Shipped"' : '"New"', '1', 'UtcNow'], {});
      card(480, 330, 300, 44, { rx: 8, stroke: GOOD, sw: 2.2, text: 'Ship() => Status = "Shipped"', fs: 14.5, mono: true });
      el('path', { d: 'M480,308 C 480,260 420,200 420,120', fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: k === 3 ? fade(u, 0.6) : 1, 'marker-end': 'url(#ra-ah)' });
      if (k === 3) { sub(480, 395, '변경 경로를 메서드 한 곳으로 모은다', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
      dot([[60, 330], [330, 330]], seg(u, 0.2, 0.9), ACC, 8); mono(60, 300, 'o.Ship();', { 'font-size': 15, 'font-weight': 700 });
      out(740, 360, 190, ['Shipped'], seg(u, 1.6, 2.0)); return; }
    // k4: 두 개의 컴파일 에러
    order(3, 'after', ['"New"', '1', 'UtcNow'], {});
    [['o.Id = 2;', 'CS8852', 194], ['o.Status = "x";', 'CS0272', 114]].forEach(([a, code, y], i) => { const s = fade(u, 0.3 + i * 0.7), yy = 360 - i * 0 + i * 0;
      cs(260 + i * 260, 362, a, { fs: 15, op: s }); if (u > 0.8 + i * 0.7) { cross(830, y, 10, pop(u, 0.8 + i * 0.7)); pill(330 + i * 260, 330, code, BAD, pop(u, 1.0 + i * 0.7), { fs: 13.5, mono: true }); } });
    sub(480, 405, '둘 다 실행 전에 컴파일러가 막는다', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
  }

  // ================= 장면 4. set 검증 · 계산 프로퍼티 =================
  function guard(x, y, s) { card(x, y, 150, 70, { rx: 10, stroke: WARN, sw: 2.6, fill: WARNBG, s }); mono(x, y - 6, 'set', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: s }); mono(x, y + 18, 'value < 0 ?', { 'font-size': 14, 'text-anchor': 'middle', opacity: s }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { field(600, 120, '_age', k === 2 ? (u < 0.8 ? '0' : '30') : '0', { w: 200, stroke: INK, dash: null, fill: PANEL, s: k === 0 ? pop(u, 0.2) : 1 });
      door(860, 140, 'get', true, INFO, k === 0 ? pop(u, 0.6) : 1); grow(800, 140, 828, 140, 1, INFO);
      if (k === 0) { cs(60, 80, 'private int _age;', { fs: 16 }); cs(60, 112, 'public int Age { get => _age; set { … } }', { fs: 16, op: fade(u, 0.5) });
        sub(480, 260, '검증을 넣으려면 자동 구현을 풀고 필드를 직접 둔다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(480, 290, '호출부는 그대로다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
      guard(380, 140, k === 1 ? pop(u, 0.2) : 1); grow(455, 140, 598, 140, 1, GOOD);
      if (k === 1) { cs(60, 260, 'if (value < 0)', { fs: 15.5, op: fade(u, 0.6) }); cs(90, 290, 'throw new ArgumentOutOfRangeException(nameof(value));', { fs: 14.5, op: fade(u, 0.9) });
        token(lerp(60, 280, E(u, 1.2, 1.8)), 140, '-5', BAD, 1); if (u > 1.8) { cross(300, 100, 10, pop(u, 1.8)); }
        sub(480, 360, '잘못된 값은 필드에 닿지도 못한다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
      const V = [['30', true], ['-5', false], ['0', true]];
      V.forEach(([v, ok], i) => { const y = 250 + i * 46, s = fade(u, 0.3 + i * 0.5);
        mono(70, y + 5, 'Age = ' + v, { 'font-size': 15, 'font-weight': 700, opacity: s }); (ok ? check : cross)(220, y, 9, s);
        tx(250, y + 5, ok ? '통과 → _age 에 저장' : 'ArgumentOutOfRangeException', { 'font-size': 14, fill: ok ? GOOD : BAD, opacity: s }); });
      token(lerp(140, 280, E(u, 0.2, 0.7)), 140, '30', GOOD, u < 0.8 ? 1 : 0);
      sub(700, 300, '객체는 늘 Age ≥ 0 을 지킨다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3~5 계산 프로퍼티
    field(60, 80, 'First', '"Ada"', { w: 220, stroke: INK, dash: null, fill: PANEL, s: k === 3 ? pop(u, 0.2) : 1 });
    field(60, 140, 'Last', '"Lovelace"', { w: 220, stroke: INK, dash: null, fill: PANEL, s: k === 3 ? pop(u, 0.5) : 1 });
    if (k === 3) { sub(560, 120, '검증이 필요 없으니 자동 구현으로 짧게', fade(u, 1.0), { 'font-size': 15, fill: INK }); sub(560, 150, '(직접 쓴 프로퍼티와 섞어 쓰는 것이 정상)', fade(u, 1.4), { 'font-size': 14 }); return; }
    card(620, 125, 280, 70, { rx: 10, stroke: ACC, sw: 2.4 }); mono(500, 118, 'FullName =>', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    mono(500, 144, '$"{First} {Last}"', { 'font-size': 15, fill: ACC });
    el('rect', { x: 520, y: 180, width: 200, height: 34, rx: 6, fill: 'none', stroke: GRID, 'stroke-width': 1.8, 'stroke-dasharray': '5 5' }); mono(620, 202, '저장 칸 없음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    const runs = k === 4 ? Math.min(3, Math.floor(seg(u, 0.3, 2.6) * 3) + 1) : 1;
    for (let r = 0; r < (k === 4 ? 3 : 1); r++) { const base = 0.3 + r * 0.75, a = seg(u, base, base + 0.5); if (k !== 4) break;
      if (a > 0 && a < 1) { fly(280, 100, 470, 100, a, '"Ada"', { fill: INFO, mono: true }); fly(280, 160, 470, 160, a, '"Lovelace"', { fill: INFO, mono: true }); } }
    if (k === 4) { tx(620, 260, '읽을 때마다 다시 계산: ' + runs + '번째', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      sub(620, 300, '무거운 계산이면 메서드로 드러내거나 캐시한다', fade(u, 1.8), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
    cs(60, 260, 'var p = new Person { First = "Ada", Last = "Lovelace", Age = 30 };', { fs: 14.5 });
    out(60, 280, 330, ['Ada Lovelace'], seg(u, 0.4, 0.9));
    cs(500, 330, 'p.Age = -5;', { fs: 15, op: fade(u, 1.2) }); pill(780, 330, 'ArgumentOutOfRangeException', BAD, pop(u, 1.5), { fs: 13.5, mono: true });
    sub(640, 380, 'Age 는 30 그대로 (직접 실행해 확인)', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
  }

  // ================= 장면 5. required · record =================
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { card(260, 150, 420, 150, { rx: 12, stroke: INK, sw: 2 }); tx(66, 100, 'class Account', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      cs(80, 140, 'public required string Email { get; init; }', { fs: 14 }); cs(80, 176, 'public string? Nickname { get; init; }', { fs: 14 });
      pill(400, 230, '필수', BAD, k === 0 ? pop(u, 0.8) : 1, { fs: 14 }); grow(400, 214, 400, 150, k === 0 ? seg(u, 1.0, 1.3) : 1, BAD, { plain: true });
      pill(560, 230, '선택', MUT, k === 0 ? pop(u, 1.2) : 1, { fs: 14 });
      if (k === 0) { sub(700, 330, '생성자 없이도 "꼭 줘야 하는 값"을 선언한다 (C# 11)', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
      [['new Account { Email = "a@b.com" }', true, ''], ['new Account { }', false, 'CS9035']].forEach(([a, ok, code], i) => { const y = 310 + i * 50, s = fade(u, 0.3 + i * 0.6);
        cs(520, y, a, { fs: 14.5, op: s }); if (u > 0.6 + i * 0.6) { (ok ? check : cross)(890, y - 5, 9, 1); if (code) pill(900, y - 42, code, BAD, 1, { fs: 13.5, mono: true }); } });
      sub(480, 405, '필수 값 누락이 실행 중 null 이 아니라 컴파일 에러로 나온다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { cs(60, 70, 'public record Money(decimal Amount, string Currency);', { fs: 17 });
      const G = [['Amount { get; init; }', INFO], ['Currency { get; init; }', INFO], ['Equals · ==', GOOD], ['ToString', MUT], ['with 복제', ACC]];
      G.forEach(([s, col], i) => { const x = 110 + (i % 3) * 270, y = 160 + Math.floor(i / 3) * 70; pill(x + 60, y, s, col, pop(u, 0.5 + i * 0.25), { fs: 14.5, mono: true }); });
      grow(300, 86, 300, 130, seg(u, 0.3, 0.6), MUT);
      sub(480, 330, '위치 매개변수가 자동으로 init 프로퍼티가 된다 (C# 9)', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { ['m1', 'm2'].forEach((n, i) => { const y = 90 + i * 110;
        mono(60, y + 5, n, { 'font-size': 16, 'font-weight': 800 }); grow(100, y, 270, y, E(u, 0.2 + i * 0.3, 0.6 + i * 0.3), INK);
        card(370, y, 190, 70, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.2 + i * 0.3) }); mono(300, y - 6, 'Amount  10', { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.3) }); mono(300, y + 18, 'Currency USD', { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.3) }); });
      [[0, 1], [1, 1]].forEach(([r], i) => { const on = seg(u, 1.0 + i * 0.3, 1.3 + i * 0.3); if (on > 0) check(480, 120 + i * 24, 7, on); });
      card(740, 120, 260, 50, { rx: 10, stroke: GOOD, sw: 2.4, s: pop(u, 1.6) }); mono(630, 126, 'm1 == m2', { 'font-size': 15, opacity: fade(u, 1.7) }); mono(860, 126, 'True', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      card(740, 200, 260, 50, { rx: 10, stroke: MUT, sw: 2, s: pop(u, 2.0) }); mono(630, 206, 'ReferenceEquals', { 'font-size': 14.5, opacity: fade(u, 2.1) }); mono(860, 206, 'False', { 'font-size': 16, 'font-weight': 800, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.1) });
      sub(480, 330, '객체는 둘이지만 값이 같으면 같다고 본다 (class 였다면 False)', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 4) { mono(60, 95, 'm1', { 'font-size': 16, 'font-weight': 800 }); grow(100, 90, 270, 90, 1, INK);
      card(370, 90, 190, 70, { rx: 10, stroke: INK, sw: 2 }); mono(300, 84, 'Amount  10', { 'font-size': 14.5 }); mono(300, 108, 'Currency USD', { 'font-size': 14.5 });
      const a = E(u, 0.4, 1.2); card(lerp(370, 650, a), lerp(90, 230, a), 190, 70, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG });
      if (a >= 1) { mono(580, 224, 'Amount  20', { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); mono(580, 248, 'Currency USD', { 'font-size': 14.5 }); mono(450, 235, 'm3', { 'font-size': 16, 'font-weight': 800, fill: ACC }); }
      cs(60, 330, 'var m3 = m1 with { Amount = 20m };', { fs: 15 });
      out(500, 300, 430, ['Money { Amount = 20, Currency = USD }', 'Money { Amount = 10, Currency = USD }'], 2 * seg(u, 1.4, 2.2));
      sub(250, 380, '원본은 그대로, 바뀐 새 인스턴스', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k5 지도
    const rows = [['밖으로 보이는 상태', '프로퍼티'], ['만든 뒤 안 바뀌어야 한다', 'init · required'], ['값이 곧 정체성', 'record']];
    rows.forEach(([a, b], i) => { const y = 80 + i * 62, s = fade(u, 0.2 + i * 0.3); tx(120, y, a, { 'font-size': 16, 'font-weight': 700, opacity: s }); grow(380, y - 6, 470, y - 6, s, MUT); pill(580, y - 6, b, GOOD, s, { fs: 15, mono: true }); });
    const F = ['public 필드 노출', 'set 검증 없음', 'init/readonly 혼동', '로직 없는 프로퍼티 남발'];
    F.forEach((f, i) => pill(140 + i * 225, 330, f, i < 2 ? BAD : WARN, pop(u, 1.3 + i * 0.25), { fs: 13.5 }));
    tx(60, 290, '실무 실패 사례', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
  }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'public 필드 Name을 나중에 프로퍼티로 바꾸면 이미 빌드된 다른 어셈블리는 왜 다시 컴파일해야 하는가?',
      o: ['그 어셈블리의 IL이 필드에 직접 쓰는 stfld로 되어 있어서', '프로퍼티 이름은 대소문자를 구분해서', '프로퍼티는 static이라서'], a: 0,
      why: '필드 대입은 IL에서 stfld, 프로퍼티 대입은 callvirt set_Name이다. 호출하는 쪽 IL이 달라지므로 바이너리 호환이 깨진다.' },
    { q: 'public string Name { get; set; } 한 줄을 컴파일하면 무엇이 생기는가?',
      o: ['public 필드 Name 하나', '숨은 필드 <Name>k__BackingField와 get·set 메서드', 'get 메서드만'], a: 1,
      why: '자동 구현은 숨은 백킹 필드와 그것을 읽고 쓰는 get·set을 컴파일러가 채워 주는 문법이다. 리플렉션으로 보면 <Name>k__BackingField가 있다.' },
    { q: 'public int Id { get; init; }인 Order를 만든 뒤 o.Id = 2;를 쓰면 어떻게 되는가?',
      o: ['값이 2로 바뀐다', '실행 중 예외가 난다', '컴파일 에러가 난다'], a: 2,
      why: 'init은 생성자나 객체 초기화자에서만 대입할 수 있다. 생성 뒤의 대입은 CS8852로 컴파일 단계에서 막힌다.' },
    { q: 'Age의 set에 value < 0이면 예외를 던지게 했다. p.Age = -5;를 실행한 뒤 p.Age는 얼마인가? (원래 30)',
      o: ['-5', '0', '30'], a: 2,
      why: '가드에서 ArgumentOutOfRangeException이 나서 _age에 저장하는 줄까지 가지 않는다. 직접 실행해 보니 30 그대로였다.' },
    { q: 'record Money(decimal Amount, string Currency)로 값이 같은 m1, m2를 따로 만들었다. m1 == m2는 무엇인가?',
      o: ['True. 값으로 비교한다', 'False. 서로 다른 객체다', '컴파일 에러다'], a: 0,
      why: 'record는 필드 값을 비교하는 ==를 만들어 준다. ReferenceEquals(m1, m2)는 False지만 ==는 True다.' },
  ];

  const summary = [
    'public 필드는 나중에 검증이나 로그를 넣을 자리가 없고 바꾸면 호출하는 쪽을 다시 빌드해야 한다.',
    '{ get; set; } 한 줄은 숨은 백킹 필드와 get, set 메서드로 풀린다.',
    'private set, init, get만 두기로 값을 바꿀 수 있는 때와 곳을 좁힌다.',
    'set에 검증을 넣어 불변식을 지키고, 꼭 필요한 값은 required, 값 객체는 record로 만든다.',
  ];
  const review = [
    { q: '주문 상태가 아무 곳에서나 바뀌어 추적이 어렵다. 가장 먼저 할 일은?',
      o: ['Status를 public 필드로 바꾼다', 'Status를 { get; private set; }으로 두고 Ship() 같은 메서드로만 바꾼다', 'Status에 [Obsolete]를 붙인다'], a: 1,
      why: 'private set이면 밖에서는 읽기만 되고 변경은 클래스 안의 메서드를 거친다. 밖에서 대입하면 CS0272로 막힌다.' },
    { q: 'FullName => $"{First} {Last}" 대신 여기에 DB 조회를 넣었더니 화면이 느려졌다. 원인은?',
      o: ['계산 프로퍼티는 읽을 때마다 다시 계산되어 조회가 매번 일어나서', 'record가 아니라서', 'init이 빠져서'], a: 0,
      why: '계산 프로퍼티는 저장 칸 없이 접근할 때마다 실행된다. 무거운 일은 GetXxx() 메서드로 드러내거나 결과를 캐시한다.' },
    { q: '설정 객체를 만들 때 Email을 빠뜨린 코드가 배포 뒤에야 null 오류로 드러났다. 컴파일 단계에서 막으려면?',
      o: ['Email을 { get; set; }으로 둔다', 'Email에 required를 붙인다', 'Email을 계산 프로퍼티로 만든다'], a: 1,
      why: 'required를 붙이면 객체 초기화자에서 값을 주지 않을 때 CS9035 컴파일 에러가 난다. 누락이 실행 전에 드러난다.' },
  ];

  R.page({ title: '프로퍼티 안쪽 보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
