/* IV-2-1 Optional — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: null을 가리키는 스택 변수와 NPE, 값 상자·빈 상자(Optional), 상자를 만드는 세 메서드, 두 갈래로 꺼내기,
 *       상자째 흐르는 map·filter·orElse 체인과 두 겹 상자(flatMap), 필드에 둔 Optional이 만드는 객체 한 겹. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, terminal, hbar, kvTable, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 자바 코드 조각 ----------
  const JKW = /^(abstract|boolean|case|catch|class|default|double|else|extends|final|for|if|implements|import|instanceof|int|interface|long|new|null|permits|private|public|record|return|sealed|static|switch|this|throw|throws|try|var|void|yield|true|false)$/;
  function jtok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(@?\b\w+\b)/).forEach((w) => { if (w) out.push([w, JKW.test(w) ? { 'font-weight': 700, fill: INFO } : w[0] === '@' ? { 'font-weight': 700, fill: WARN } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if (ch === '/' && s[i + 1] === '/') { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // o.hl(i) → 'hl' | 'bad' | 'good' | 'dim', o.show = 보이는 줄 수(소수면 마지막 줄을 타이핑)
  function jcode(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + 30, h = lines.length * lh + 16, op = o.op ?? 1, show = o.show ?? lines.length;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': o.stroke ? 2 : 1.5, opacity: op });
    lines.forEach((s, i) => { if (i >= Math.ceil(show)) return; const part = i === Math.ceil(show) - 1 && show % 1 ? s.slice(0, Math.round(s.length * (show % 1))) : s;
      const st = o.hl ? o.hl(i) : null, ly = y + 8 + i * lh;
      if (st === 'hl' || st === 'bad' || st === 'good') el('rect', { x: x + 4, y: ly, width: w - 8, height: lh, rx: 4, fill: st === 'bad' ? BADBG : st === 'good' ? GOODBG : ACCBG, opacity: op });
      spans(x + 14, ly + lh / 2 + fs * 0.36, jtok(part), { 'font-size': fs, opacity: op * (st === 'dim' ? 0.35 : 1) }); });
    return { x, y, w, h, lh, cx: (col) => x + 14 + col * fs * 0.55, cy: (i) => y + 8 + i * lh + lh / 2 }; }
  // 참조 화살표 (구부러진 선이 자란다). 시작점에 점
  const MK = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function qp(x1, y1, x2, y2, b) { return [(x1 + x2) / 2 - (y2 - y1) * b, (y1 + y2) / 2 + (x2 - x1) * b]; }
  function arc(x1, y1, x2, y2, u, col, o) { o = o || {}; if (u <= 0) return; const [qx, qy] = qp(x1, y1, x2, y2, o.bend || 0);
    if (!o.nodot) el('circle', { cx: x1, cy: y1, r: 5, fill: col || INK, opacity: o.op ?? 1 });
    const a = { d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`, fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, opacity: o.op ?? 1, 'marker-end': u >= 0.98 ? MK(col) : null };
    if (u < 1) { a.pathLength = 1; a['stroke-dasharray'] = `${u} 1`; } else if (o.dash) a['stroke-dasharray'] = o.dash;
    el('path', a); }
  function along(x1, y1, x2, y2, b, f) { const [qx, qy] = qp(x1, y1, x2, y2, b), g = 1 - f; return [g * g * x1 + 2 * g * f * qx + f * f * x2, g * g * y1 + 2 * g * f * qy + f * f * y2]; }
  // 스택 프레임: rows [[이름, 값(null 이면 참조 점), {col, bg}]] → 값 칸 가운데 좌표
  function frame(x, y, w, title, rows, o) { o = o || {}; const rh = 42, h = 40 + rows.length * rh;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 });
    mono(x + 12, y + 24, title, { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    return rows.map(([n, v, ro], i) => { ro = ro || {}; const yy = y + 36 + i * rh, vx = x + w * 0.46, vw = w * 0.54 - 12, col = ro.col || INK;
      mono(x + 14, yy + rh / 2 + 5, n, { 'font-size': 15, 'font-weight': 700, fill: col });
      el('rect', { x: vx, y: yy + 5, width: vw, height: rh - 10, rx: 5, fill: ro.bg || SOFT, stroke: ro.col || GRID, 'stroke-width': 1.5 });
      if (v != null) mono(vx + vw / 2, yy + rh / 2 + 5, v, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col });
      else el('circle', { cx: vx + vw / 2, cy: yy + rh / 2, r: 5, fill: col });
      return { x: vx + vw / 2, y: yy + rh / 2, r: vx + vw }; }); }
  // 힙 객체: 머리(클래스) + 필드 줄
  function obj(cx, cy, w, head, rows, o) { o = o || {}; const h = 38 + rows.length * 26, col = o.stroke || INK;
    const g = card(cx, cy, w, h, { rx: 10, stroke: col, sw: 2.2, fill: o.fill || PANEL, s: o.s, op: o.op });
    mono(0, -h / 2 + 24, head, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    if (rows.length) el('line', { x1: -w / 2 + 8, y1: -h / 2 + 34, x2: w / 2 - 8, y2: -h / 2 + 34, stroke: GRID, 'stroke-width': 1.5 }, g);
    rows.forEach(([s, rc], i) => mono(-w / 2 + 14, -h / 2 + 56 + i * 26, s, { 'font-size': 14.5, fill: rc || INK }, g));
    return { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2, h }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const strike = (x, y, len, u, col) => { if (u > 0) el('line', { x1: x, y1: y, x2: x + len * clamp(u), y2: y, stroke: col || BAD, 'stroke-width': 2.4, 'stroke-linecap': 'round' }); };
  const heapZones = (sx, hx) => { zone(20, 34, sx - 30, 372, '스택', { fill: SOFT }); zone(sx, 34, hx - sx, 372, '힙', { fill: INFOBG }); };
  const chip = (x, y, s, col, o) => { o = o || {}; return card(x, y, tw(s, 14) + 22, 30, { rx: 8, text: s, mono: true, fs: 14, fw: 700, fill: o.fill || PANEL, stroke: col || INK, color: col || INK, s: o.s, op: o.op }); };
  // Optional 상자: v 가 null 이면 빈 상자. o.nest 면 상자 안에 상자
  function box(cx, cy, v, o) { o = o || {}; const w = o.w || 150, h = o.h || 60, full = v != null, col = o.col || (full ? ACC : MUT), s = o.s ?? 1; if (s <= 0) return;
    const g = card(cx, cy, w, h, { rx: 12, stroke: col, sw: 2.4, dash: full ? null : '7 5', fill: full ? ACCBG : PANEL, s, op: o.op });
    mono(-w / 2 + 10, -h / 2 + 17, o.label || 'Optional', { 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    if (full) card(0, 9, Math.min(w - 20, tw(v, 14) + 20), 26, { rx: 6, text: v, mono: true, fs: 14, fw: 700, stroke: INK, p: g });
    else tx(0, 15, o.emptyText || '비어 있음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g); }
  const burst = (x, y, s, sc) => { if (sc <= 0) return; const g = G(x, y, sc);
    el('path', { d: 'M0,-34 L9,-12 L32,-18 L16,0 L32,18 L9,12 L0,34 L-9,12 L-32,18 L-16,0 L-32,-18 L-9,-12 Z', fill: BADBG, stroke: BAD, 'stroke-width': 2.4 }, g);
    if (s) tx(0, 56, s, { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', class: 'mono' }, g); };
  const { G } = R;

  // ---------- 1. null 반환 ----------
  function sites(u, k) { const S = [['주문 화면', 160], ['프로필', 480], ['알림 메일', 800]];
    S.forEach(([n, x], i) => { const miss = k === 3 && i === 2, s = pop(u, 0.2 + i * 0.2);
      card(x, 170, 270, 150, { rx: 12, stroke: miss ? BAD : INK, sw: 2.2, s });
      if (s < 0.5) return; tx(x - 120, 120, n, { 'font-size': 15, 'font-weight': 800 });
      mono(x - 120, 150, 'u = findUser(99L)', { 'font-size': 14 });
      if (!miss) { const g = fade(u, 0.8 + i * 0.25); el('rect', { x: x - 124, y: 162, width: 160, height: 28, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.8, opacity: g }); mono(x - 116, 181, 'if (u != null)', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: g }); }
      else { el('rect', { x: x - 124, y: 162, width: 160, height: 28, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }); mono(x - 116, 181, '(체크 빠짐)', { 'font-size': 14, fill: BAD, 'font-weight': 700 }); }
      mono(x - 120, 216, 'u.getName()', { 'font-size': 14, fill: miss ? BAD : INK });
      if (miss) burst(x + 80, 214, null, pop(u, 1.4)); else check(x + 90, 210, 10, pop(u, 1.3 + i * 0.2)); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { kvTable(40, 70, 300, [['1L', 'User(Kim)'], ['2L', 'User(Lee)'], ['99L', '(없음)', { gone: true }]], { title: 'db : Map<Long, User>' });
      const cd = jcode(420, 80, ['public User findUser(Long id) {', '  return db.get(id);  // 없으면 null', '}'], { fs: 15, show: lerp(0, 3, E(u, 0.2, 0.9)) });
      fly(250, 182, 640, 230, seg(u, 1.0, 1.7), 'null', { mono: true, fill: BAD, stay: true });
      el('rect', { x: cd.cx(7) - 3, y: cd.cy(0) - 13, width: 4 * 15 * 0.55 + 6, height: 26, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 1.8) });
      note(420, 300, '반환 타입 User에는', fade(u, 2.0), { fill: WARN }); note(420, 326, '"없을 수도 있다"는 말이 없다', fade(u, 2.1), { fill: WARN }); return; }
    if (k === 1) { zone(20, 34, 300, 372, '스택', { fill: SOFT });
      const fr = frame(34, 70, 272, 'main()', [['u', 'null', { col: BAD, bg: BADBG }]]);
      jcode(350, 60, ['User u = repo.findUser(99L);', 'String name = u.getName();'], { fs: 15, hl: (i) => (i === 1 && u > 0.6 ? 'bad' : null) });
      const g = E(u, 0.6, 1.2); if (g > 0) el('line', { x1: fr[0].r, y1: fr[0].y, x2: fr[0].r + 160 * g, y2: fr[0].y, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
      if (u > 1.2) { cross(fr[0].r + 170, fr[0].y, 11, pop(u, 1.2)); sub(fr[0].r + 170, fr[0].y + 34, '가리키는 객체가 없다', 1, { fill: BAD, 'font-weight': 700 }); }
      pill(440, 230, 'javac 통과', GOOD, pop(u, 1.4), { fs: 14.5 }); grow(500, 230, 560, 230, E(u, 1.6, 1.8), MUT); pill(650, 230, '실행 중 NPE', BAD, pop(u, 1.8), { fs: 14.5 });
      terminal(350, 280, 580, 90, [['Exception in thread "main"', '#fca5a5'], ['  java.lang.NullPointerException', '#fca5a5']], u < 2.0 ? 0 : lerp(1, 2, E(u, 2.0, 2.5)), { fs: 14 }); return; }
    if (k === 2 || k === 3) { sites(u, k);
      if (k === 2) banner(480, 330, '같은 방어 코드가 호출부마다 복제된다', pop(u, 2.0));
      else { banner(480, 330, '한 곳만 빠져도 그 자리가 지뢰', pop(u, 1.8)); sub(480, 380, '안전이 컴파일러가 아니라 사람의 기억에 달려 있다', fade(u, 2.2), { 'font-size': 15 }); }
      return; }
    // k4: Optional 로 바꾸면
    const cd = jcode(60, 50, ['public Optional<User> findUser(Long id)'], { fs: 16, stroke: ACC });
    el('rect', { x: cd.cx(7) - 3, y: cd.cy(0) - 14, width: 14 * 16 * 0.55 + 6, height: 28, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.3) });
    box(160, 200, null, { s: pop(u, 0.5) }); grow(160, 112, 160, 166, E(u, 0.3, 0.6), ACC);
    mono(300, 180, 'findUser(99L).getName()', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.9) }); cross(540, 174, 9, pop(u, 1.2));
    sub(420, 210, 'Optional에는 getName()이 없다 → 컴파일 에러', fade(u, 1.3), { fill: BAD, 'font-weight': 700 });
    mono(300, 280, 'findUser(99L).map(User::getName).orElse("손님")', { 'font-size': 15, fill: GOOD, opacity: fade(u, 1.7) });
    fly(240, 230, 820, 330, seg(u, 2.0, 2.5), '"손님"', { mono: true, fill: GOOD, stay: true });
    note(300, 384, '없을 때를 처리하지 않고는 값을 꺼낼 수 없다', fade(u, 2.4), { fill: ACC }); }

  // ---------- 2. 상자 만들기 ----------
  function maker(cx, cy, name, col, s) { card(cx, cy, 300, 56, { rx: 12, stroke: col || INK, sw: 2.4, text: name, mono: true, fs: 15.5, fw: 800, color: col || INK, s }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { maker(480, 180, 'Optional.ofNullable(found)', ACC, pop(u, 0.2));
      card(300, 70, 160, 40, { rx: 8, text: 'User(Kim)', mono: true, fs: 15, s: pop(u, 0.4) }); card(660, 70, 160, 40, { rx: 8, text: 'null', mono: true, fs: 15, stroke: BAD, color: BAD, s: pop(u, 0.5) });
      sub(480, 66, 'found = db.get(id)', fade(u, 0.4), { class: 'mono', 'font-size': 14 });
      fly(300, 90, 440, 160, seg(u, 0.8, 1.3), 'User(Kim)', { mono: true, fill: INFO }); fly(660, 90, 520, 160, seg(u, 1.0, 1.5), 'null', { mono: true, fill: BAD });
      grow(420, 208, 300, 290, E(u, 1.4, 1.8), ACC); grow(540, 208, 660, 290, E(u, 1.6, 2.0), MUT);
      box(300, 330, 'User(Kim)', { s: pop(u, 1.8) }); box(660, 330, null, { s: pop(u, 2.0) });
      sub(480, 404, 'null이면 빈 상자, 아니면 값 상자', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { obj(200, 120, 300, 'static final User ADMIN', [['= User(admin)', INK]], { s: pop(u, 0.2) });
      maker(480, 250, 'Optional.of(ADMIN)', ACC, pop(u, 0.5)); fly(260, 150, 420, 230, seg(u, 0.9, 1.5), 'ADMIN', { mono: true, fill: INFO });
      grow(632, 250, 700, 250, E(u, 1.6, 1.8), ACC); box(790, 250, 'ADMIN', { s: pop(u, 1.8) });
      note(330, 370, '"절대 null이 아니다"를 단언할 때만 of', fade(u, 2.1), { fill: ACC }); return; }
    if (k === 2) { maker(250, 120, 'Optional.empty()', ACC, pop(u, 0.2)); grow(250, 150, 250, 210, E(u, 0.5, 0.8), ACC); box(250, 250, null, { s: pop(u, 0.8) });
      sub(250, 316, '"없음"이 객체로 있다', fade(u, 1.1), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      card(700, 120, 300, 56, { rx: 12, stroke: BAD, sw: 2.4, text: 'return null', mono: true, fs: 15.5, fw: 800, color: BAD, s: pop(u, 1.3) });
      grow(700, 150, 700, 210, E(u, 1.5, 1.8), BAD); mono(700, 256, 'null', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(700, 316, '상자조차 없다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      note(250, 384, 'empty()는 메서드를 불러도 안전하고, null은 부르는 순간 NPE다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 3) { maker(480, 200, 'Optional.of(null)', BAD, pop(u, 0.2)); fly(480, 60, 480, 170, seg(u, 0.6, 1.2), 'null', { mono: true, fill: BAD });
      burst(480, 200, null, pop(u, 1.2));
      terminal(250, 286, 460, 100, [['java.lang.NullPointerException', '#fca5a5'], ['  at java.util.Optional.of(...)', '#fca5a5']], u < 1.5 ? 0 : lerp(1, 2, E(u, 1.5, 2.1)), { fs: 14 });
      note(740, 220, '감싸는 그 자리에서', fade(u, 1.8), { fill: BAD }); note(740, 246, '바로 터진다', fade(u, 1.9), { fill: BAD }); return; }
    // k4: 계약
    const rows = [['Optional<User> findUser(Long id)', 'ofNullable', 'User(Kim)'], ['Optional<User> currentAdmin()', 'of', 'ADMIN'], ['Optional<User> noUser()', 'empty', null]];
    el('rect', { x: 40, y: 50, width: 560, height: 330, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    mono(60, 80, 'import java.util.Optional;', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.2) });
    mono(60, 110, 'public class UserRepository', { 'font-size': 16, 'font-weight': 800 });
    rows.forEach(([sig, how, v], i) => { const y = 170 + i * 80, s = fade(u, 0.5 + i * 0.4);
      mono(60, y, sig, { 'font-size': 15, opacity: s }); sub(60, y + 26, how, s, { 'text-anchor': 'start', class: 'mono', fill: ACC, 'font-weight': 700 });
      grow(520, y - 4, 640, y - 4, E(u, 0.8 + i * 0.4, 1.1 + i * 0.4), ACC); box(740, y - 4, v, { s: pop(u, 1.1 + i * 0.4), h: 58 }); });
    note(640, 408, '반환 타입이 곧 계약이 된다', fade(u, 2.4), { fill: ACC }); }

  // ---------- 3. 꺼내기 ----------
  const RY = [140, 300];
  function lanes2(method, col, s) { tx(40, RY[0] - 56, '값 있음', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(40, RY[1] - 56, '비어 있음', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    box(130, RY[0], 'User(Kim)'); box(130, RY[1], null);
    RY.forEach((y) => { el('line', { x1: 205, y1: y, x2: 330, y2: y, stroke: GRID, 'stroke-width': 3 }); card(480, y, 300, 56, { rx: 12, stroke: col || INK, sw: 2.2, text: method, mono: true, fs: 14.5, fw: 700, s }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { lanes2('.map(User::getName).orElse("손님")', ACC, pop(u, 0.2));
      fly(630, RY[0], 800, RY[0], seg(u, 0.7, 1.2), '"Kim"', { mono: true, stay: true }); fly(630, RY[1], 800, RY[1], seg(u, 1.1, 1.6), '"손님"', { mono: true, fill: WARN, stay: true });
      note(330, 400, '"손님"은 상수라 매번 평가돼도 부담이 없다', fade(u, 1.9)); return; }
    if (k === 1) { lanes2('.orElseGet(() -> loadDefaultUser())', ACC, pop(u, 0.2));
      fly(630, RY[0], 800, RY[0], seg(u, 0.7, 1.2), 'User(Kim)', { mono: true, stay: true }); sub(480, RY[0] + 50, '람다 실행 안 됨', fade(u, 1.0), { fill: MUT, 'font-weight': 700 });
      const run = E(u, 1.2, 1.8); el('circle', { cx: 480, cy: RY[1] + 52, r: 9, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '6 4', transform: `rotate(${run * 360} 480 ${RY[1] + 52})`, opacity: run > 0 ? 1 : 0 });
      sub(530, RY[1] + 58, 'loadDefaultUser() 실행', fade(u, 1.3), { fill: ACC, 'font-weight': 700, 'text-anchor': 'start' });
      fly(630, RY[1], 820, RY[1], seg(u, 1.8, 2.3), '기본 사용자', { fill: WARN, stay: true });
      return; }
    if (k === 2) { // 값이 있어도 orElse 인자는 먼저 계산된다
      tx(40, 46, '둘 다 값이 있는 상자', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      [['.orElse(loadDefaultUser())', BAD, 1], ['.orElseGet(() -> loadDefaultUser())', GOOD, 0]].forEach(([m, col, n], i) => { const y = RY[i];
        box(130, y, 'User(Kim)'); el('line', { x1: 205, y1: y, x2: 330, y2: y, stroke: GRID, 'stroke-width': 3 });
        card(480, y, 300, 56, { rx: 12, stroke: col, sw: 2.2, text: m, mono: true, fs: 14, fw: 700 });
        if (n) { fly(480, y + 30, 480, y + 70, seg(u, 0.3, 0.8), '① 인자부터 계산', { fill: BAD, stay: true }); card(700, y + 70, 150, 36, { rx: 8, text: 'User(default)', mono: true, fs: 14, stroke: OFF, color: OFF, op: fade(u, 1.4) }); cross(790, y + 70, 8, pop(u, 1.8)); sub(700, y + 106, '만들고 바로 버린다', fade(u, 1.9), { fill: BAD }); }
        else sub(480, y + 50, '상자를 먼저 보고, 값이 있으니 람다를 부르지 않는다', fade(u, 1.0), { fill: GOOD, 'font-weight': 700 });
        card(880, y, 120, 56, { rx: 10, stroke: col, sw: 2.2 }); tx(880, y - 8, '호출 횟수', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
        mono(880, y + 18, String(u > 0.8 ? n : 0), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }); return; }
    if (k === 3) { lanes2('.orElseThrow(() -> new ...)', WARN, pop(u, 0.2));
      fly(630, RY[0], 800, RY[0], seg(u, 0.7, 1.2), 'User(Kim)', { mono: true, stay: true });
      burst(700, RY[1], null, pop(u, 1.3));
      terminal(560, RY[1] + 40, 380, 64, [['IllegalStateException: user 99 없음', '#fca5a5']], u > 1.6 ? 1 : 0, { fs: 13.5 });
      note(40, 404, '반드시 있어야 하는 자리면 없음을 예외로 선언한다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k4: isPresent + get
    jcode(60, 60, ['if (u != null) u.getName();'], { fs: 16 }); jcode(60, 140, ['if (opt.isPresent()) opt.get();'], { fs: 16, stroke: WARN, op: fade(u, 0.4) });
    note(470, 90, 'null 체크', fade(u, 0.2), { fill: MUT }); note(470, 170, '모양이 똑같다', fade(u, 0.7), { fill: WARN });
    box(140, 300, null, { s: pop(u, 1.0) }); mono(230, 306, '.get()', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); burst(360, 300, null, pop(u, 1.5));
    terminal(430, 260, 500, 84, [['java.util.NoSuchElementException:', '#fca5a5'], ['  No value present', '#fca5a5']], u < 1.7 ? 0 : lerp(1, 2, E(u, 1.7, 2.2)), { fs: 14 });
    note(430, 392, 'NPE가 다른 예외로 바뀌었을 뿐이다', fade(u, 2.3), { fill: BAD }); }

  // ---------- 4. 체인 ----------
  const CX = [120, 330, 545, 770], LY = [120, 225, 330];
  const LANE = [['User(a@x.com)', '"a@x.com"', '"a@x.com"', '"a@x.com"'], ['User(abc)', '"abc"', null, '"no-mail"'], [null, null, null, '"no-mail"']];
  const HEAD = ['findUser(id)', '.map(getEmail)', '.filter(has @)', '.orElse("no-mail")'];
  function s4(t, c) { const { k, u } = c;
    if (k === 4) { // flatMap
      tx(40, 56, 'findAddress가 이미 Optional<Address>를 돌려준다', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      box(110, 150, 'User', { w: 120, s: 1 }); box(110, 310, 'User', { w: 120 });
      mono(186, 92, '.map(User::findAddress)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.2) });
      grow(172, 150, 300, 150, E(u, 0.3, 0.6), BAD);
      if (u > 0.6) { card(420, 150, 220, 96, { rx: 14, stroke: BAD, sw: 2.4, fill: BADBG, s: pop(u, 0.6) }); mono(320, 118, 'Optional', { 'font-size': 13.5, 'font-weight': 700, fill: BAD });
        box(420, 162, 'Address', { w: 150, h: 56, s: pop(u, 0.9) }); }
      mono(560, 156, 'Optional<Optional<Address>>', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
      mono(186, 262, '.flatMap(User::findAddress)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
      grow(172, 310, 300, 310, E(u, 1.5, 1.8), ACC); box(380, 310, 'Address', { s: pop(u, 1.8) });
      grow(457, 310, 560, 310, E(u, 2.0, 2.2), ACC); mono(470, 296, '.map(getCity)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
      box(650, 310, '예: "서울"', { s: pop(u, 2.2) }); sub(650, 366, 'Optional<String>', fade(u, 2.3), { class: 'mono', fill: ACC, 'font-weight': 700 }); return; }
    if (k === 5) { // ifPresent
      mono(480, 60, 'findUser(id).ifPresent(u -> log.info("hit {}", u.getName()))', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.2) });
      box(140, 170, 'User(Kim)'); box(140, 320, null);
      [170, 320].forEach((y, i) => { grow(217, y, 330, y, E(u, 0.4 + i * 0.3, 0.7 + i * 0.3), i ? MUT : ACC); card(420, y, 160, 50, { rx: 10, text: 'ifPresent', mono: true, fs: 15, stroke: i ? GRID : ACC, color: i ? MUT : ACC }); });
      grow(502, 170, 600, 170, E(u, 1.0, 1.3), ACC); terminal(610, 120, 320, 100, [['INFO hit Kim', null]], u > 1.4 ? 1 : 0, { title: '로그 (예)', fs: 14 });
      sub(420, 370, '람다가 불리지 않는다', fade(u, 1.6), { fill: MUT, 'font-weight': 700 }); tx(600, 326, '아무 일도 없음', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      note(610, 260, '반환값 없이 부수효과만 낼 때', fade(u, 2.1), { fill: ACC }); return; }
    HEAD.forEach((h, j) => { if (j > k) return; mono(CX[j], 50, h, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: j === k ? ACC : MUT, opacity: j === k ? fade(u, 0.2) : 1 }); });
    tx(20, LY[1] + 40, '예', { 'font-size': 13.5, fill: MUT });
    LANE.forEach((row, i) => { const y = LY[i];
      for (let j = 0; j <= k; j++) { const v = row[j], last = j === 3, newer = j === k;
        if (j > 0) grow(CX[j - 1] + 78, y, CX[j] - 78, y, newer ? E(u, 0.3, 0.7) : 1, MUT);
        const s = newer && j > 0 ? pop(u, 0.7 + i * 0.25) : 1;
        if (last) { if (s > 0) card(CX[j], y, 150, 46, { rx: 8, text: v, mono: true, fs: 15, stroke: i ? WARN : ACC, color: i ? WARN : ACC, s }); }
        else box(CX[j], y, v, { s, col: v == null && j > 0 && row[j - 1] != null ? BAD : undefined });
        if (newer && j > 0 && v == null && row[j - 1] == null && !last) sub(CX[j], y + 46, '건너뜀', fade(u, 1.2), { fill: MUT, 'font-weight': 700 });
        if (newer && j === 2 && i === 1) sub(CX[j], y + 46, '조건 실패 → 비움', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); } });
    if (k === 0) note(330, 404, '꺼내지 않고 상자째 다음 단계로 넘긴다', fade(u, 1.4), { fill: ACC });
    if (k === 3) note(330, 404, 'Optional이 여기서 String 하나로 정리된다', fade(u, 1.8), { fill: ACC }); }

  // ---------- 5. 올바른 사용 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const cd = jcode(140, 110, ['public Optional<User> findByEmail(String email)'], { fs: 17, stroke: GOOD });
      check(110, cd.cy(0), 12, pop(u, 0.4)); el('rect', { x: cd.cx(7) - 3, y: cd.cy(0) - 15, width: 14 * 17 * 0.55 + 6, height: 30, rx: 5, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: fade(u, 0.6) });
      person(260, 300, '호출자', { s: pop(u, 1.0) }); grow(290, 270, 380, 170, E(u, 1.2, 1.6), GOOD);
      note(330, 300, '시그니처만 봐도 없을 수 있음을 안다', fade(u, 1.7), { fill: GOOD });
      note(330, 330, '조회·검색 결과의 반환 타입이 제자리다', fade(u, 2.1)); return; }
    if (k === 1) { const cd = jcode(60, 60, ['public List<User> findActive()'], { fs: 16, stroke: GOOD });
      mono(60, 160, 'Collections.emptyList()', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.4) });
      cells(60, 180, ['', '', ''], { w: 50, h: 40, style: () => ({ stroke: GRID, dash: '5 4', op: fade(u, 0.6) }) }); mono(240, 206, 'size = 0', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.7) });
      mono(60, 280, 'for (User x : findActive()) { … }', { 'font-size': 15, opacity: fade(u, 1.0) }); sub(220, 310, '0번 돌고 끝, 분기 없음', fade(u, 1.3), { fill: GOOD, 'font-weight': 700 });
      jcode(560, 60, ['Optional<List<User>>'], { fs: 16, stroke: BAD, op: fade(u, 1.6) }); cross(820, 82, 10, pop(u, 1.8));
      sub(690, 140, '없음을 두 번 표현하는 이중 방어', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { mono(480, 70, 'String bad1 = findByEmail(x).get();', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD });
      box(240, 200, null, { s: pop(u, 0.3) }); mono(330, 206, '.get()', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) }); burst(470, 200, null, pop(u, 1.0));
      terminal(540, 160, 390, 84, [['NoSuchElementException', '#fca5a5'], ['  No value present', '#fca5a5']], u < 1.2 ? 0 : lerp(1, 2, E(u, 1.2, 1.8)), { fs: 14 });
      note(240, 330, '꺼내기는 orElse · orElseGet · orElseThrow로', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 3) { zone(20, 34, 920, 230, '힙 · 필드를 Optional로 두면', { fill: INFOBG });
      const m = obj(150, 150, 200, 'Member', [['nickname', BAD]], { s: pop(u, 0.2) });
      const o = obj(420, 150, 180, 'Optional', [['value', MUT]], { stroke: BAD, s: pop(u, 0.5) }); const s = obj(660, 150, 160, 'String', [['"kim"', INK]], { s: pop(u, 0.7) });
      arc(m.r - 30, 166, o.l, 160, E(u, 0.6, 0.9), BAD); arc(o.r - 30, 166, s.l, 160, E(u, 0.8, 1.1), INK);
      note(770, 120, '객체 하나 더', fade(u, 1.2), { fill: BAD, 'font-size': 14.5 }); note(770, 146, 'Serializable 아님', fade(u, 1.4), { fill: BAD, 'font-size': 14.5 });
      mono(60, 320, 'update(Optional.of("kim"));', { 'font-size': 16, fill: BAD, opacity: fade(u, 1.7) }); sub(560, 316, '파라미터면 호출자가 매번 감싸야 한다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 });
      note(60, 380, '필드는 그냥 T, 파라미터는 오버로딩이나 null 허용', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 4) { zone(560, 34, 380, 372, '힙', { fill: INFOBG });
      [['findByEmail(x).orElse(new User())', BAD, 110], ['findByEmail(x).orElseGet(User::new)', GOOD, 280]].forEach(([s, col, y], i) => {
        box(110, y, 'User(Kim)', { w: 140 }); mono(190, y + 6, s.replace('findByEmail(x)', ''), { 'font-size': 14.5, fill: col, 'font-weight': 700 }); });
      const born = obj(750, 110, 200, 'User (새로 만듦)', [], { stroke: u > 1.6 ? OFF : WARN, s: pop(u, 0.6) }); grow(470, 104, 645, 104, E(u, 0.3, 0.6), WARN);
      if (u > 1.6) { cross(870, 110, 12, pop(u, 1.6)); sub(750, 160, '값이 있어서 바로 쓰레기', 1, { fill: BAD, 'font-weight': 700 }); }
      sub(750, 290, '새 객체 없음', fade(u, 1.9), { fill: GOOD, 'font-weight': 700, 'font-size': 15 });
      note(40, 400, '비싼 기본값은 orElseGet으로 없을 때만 만든다', fade(u, 2.3), { fill: GOOD }); return; }
    // k5: return null
    mono(60, 70, 'Optional<User> bad4() { return null; }', { 'font-size': 16, fill: BAD, 'font-weight': 700 });
    zone(20, 100, 300, 160, '스택', { fill: SOFT }); const fr = frame(34, 130, 272, 'caller()', [['opt', 'null', { col: BAD, bg: BADBG }]]);
    mono(360, 170, 'opt.orElse(guest)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) }); burst(600, 166, null, pop(u, 1.0));
    terminal(660, 120, 270, 70, [['NullPointerException', '#fca5a5']], u > 1.2 ? 1 : 0, { fs: 14 });
    sub(480, 236, '상자를 열기도 전에 터진다', fade(u, 1.3), { fill: BAD, 'font-weight': 700, 'font-size': 15 });
    mono(60, 320, 'Optional<User> ok4() { return Optional.empty(); }', { 'font-size': 16, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
    box(820, 330, null, { s: pop(u, 2.1) }); }

  const quiz = [
    { q: 'User findUser(Long id)가 null을 돌려줄 때 가장 큰 문제는 무엇인가?',
      o: ['반환 타입만 봐서는 값이 없을 수 있다는 걸 알 수 없다', 'null을 돌려주면 컴파일이 안 된다', 'null은 메모리를 많이 쓴다'], a: 0,
      why: '타입 User는 "없을 수도"를 말하지 않아 체크를 빠뜨려도 컴파일이 통과한다. 그 자리는 실행 중 NullPointerException이 된다.' },
    { q: 'Map 조회 결과처럼 null일 수도 있는 값을 상자에 담을 때 쓰는 메서드는 무엇인가?',
      o: ['Optional.of(found)', 'Optional.empty()', 'Optional.ofNullable(found)'], a: 2,
      why: 'ofNullable은 null이면 빈 상자, 아니면 값 상자를 만든다. of에 null을 넣으면 그 자리에서 NPE가 난다.' },
    { q: '값이 있는 상자에 orElse(loadDefaultUser())를 부르면 loadDefaultUser()는 어떻게 되는가?',
      o: ['한 번 실행되고 결과는 버려진다', '실행되지 않는다', '상자의 값을 바꾼다'], a: 0,
      why: '자바는 인자를 먼저 계산한다. 값이 있어도 기본값은 이미 만들어진 뒤라 낭비가 되고, orElseGet은 빈 상자일 때만 람다를 부른다.' },
    { q: 'findAddress가 이미 Optional<Address>를 돌려줄 때 map 대신 flatMap을 쓰는 까닭은 무엇인가?',
      o: ['map은 빈 상자에서 예외를 던져서', 'map을 쓰면 Optional<Optional<Address>>로 두 겹이 돼서', 'flatMap이 값을 꺼내 주어서'], a: 1,
      why: 'map은 결과를 다시 상자에 담으므로 상자가 두 겹이 된다. flatMap은 함수가 돌려준 상자를 그대로 써서 한 겹을 유지한다.' },
    { q: 'Optional을 쓰기에 알맞은 자리는 어디인가?',
      o: ['엔티티의 필드', '조회 메서드의 반환 타입', '메서드 파라미터'], a: 1,
      why: 'Optional은 반환 타입 전용으로 만든 도구다. 필드는 직렬화가 안 되고 객체가 하나 더 생기며, 파라미터는 호출자에게 감싸는 부담만 준다.' },
  ];

  const summary = [
    'null을 돌려주는 메서드는 타입에 부재가 드러나지 않아 체크 하나만 빠져도 실행 중에 NPE가 난다.',
    '반환 타입을 Optional<User>로 바꾸면 없을 때를 처리하지 않고는 값을 꺼낼 수 없다.',
    'null일 수 있으면 ofNullable로 감싸고, 꺼낼 때는 orElse나 orElseGet, orElseThrow를 쓴다.',
    'Optional은 반환 타입에만 쓰고, 목록은 빈 리스트를 돌려주며 get()은 바로 부르지 않는다.',
  ];
  const review = [
    { q: 'findUser가 Optional<User>를 돌려주는데도 호출부에서 NPE가 났다. 먼저 의심할 것은?',
      o: ['findUser 안에 return null이 남아 있다', 'orElse 대신 orElseGet을 썼다', 'map을 두 번 이었다'], a: 0,
      why: 'Optional을 반환한다고 선언해도 null을 돌려주면 상자를 열기 전에 터진다. 없을 때는 Optional.empty()를 돌려줘야 한다.' },
    { q: '이메일이 없거나 @가 없으면 "no-mail"을 돌려줘야 한다. 알맞은 코드는?',
      o: ['if (opt.isPresent()) return opt.get().getEmail();', 'findUser(id).map(User::getEmail).filter(e -> e.contains("@")).orElse("no-mail")', 'Optional.of(user.getEmail()).get()'], a: 1,
      why: 'map과 filter는 빈 상자를 그대로 흘려보내고 조건에 맞지 않으면 상자를 비운다. 마지막 orElse가 두 경우를 "no-mail"로 모은다.' },
    { q: '값이 대부분 있는데 기본값 생성에 DB 조회가 필요하다. 꺼내는 코드로 알맞은 것은?',
      o: ['orElse(loadFromDb())', 'isPresent() 뒤에 get()', 'orElseGet(() -> loadFromDb())'], a: 2,
      why: 'orElse의 인자는 값이 있어도 먼저 계산된다. orElseGet은 빈 상자일 때만 람다를 불러 DB 조회를 아낀다.' },
  ];

  R.page({ title: 'Optional 상자', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
