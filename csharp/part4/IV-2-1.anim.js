/* IV-2-1 파일 IO와 JSON — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자·출력은 .NET 10 에서 코드를 실제로 돌려 확인한 값: note.txt 26바이트(UTF-8, BOM 없음, 첫 바이트 EC), ReadAllLines 2줄 → 3줄,
 * 기본 직렬화의 한글은 에스… 로 이스케이프, Encoder(UnicodeRanges.All) 를 주면 그대로,
 * 특성 없는 "phone" → PhoneNo = null, [JsonIgnore] 뒤 출력 {"user_name":"kim","phone":"010"}, Utf8JsonReader 속성 이름 id·name·price.
 * 스트림 장면의 로그 여덟 줄은 설명용 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, spans, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const BS = String.fromCharCode(92);
  const ESC = BS + 'uC5D0' + BS + 'uC2A4' + BS + 'uD504' + BS + 'uB808' + BS + 'uC18C';

  // 문서 아이콘: 귀퉁이 접힌 종이 + 줄
  function doc(cx, cy, w, h, name, lines, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), x = -w / 2, y = -h / 2, f = 18;
    el('path', { d: `M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2 }, g);
    el('path', { d: `M${x + w - f},${y} V${y + f} H${x + w}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.6 }, g);
    if (name) tx(0, h / 2 + 22, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono' }, g);
    (lines || []).forEach((ln, i) => { const [s, col, op] = Array.isArray(ln) ? ln : [ln]; tx(x + 14, y + 30 + i * 24, s, { 'font-size': 14.5, fill: col || INK, opacity: op ?? 1, class: o.mono ? 'mono' : null }, g); });
    return g; }
  function folder(cx, cy, name, s) { const g = R.G(cx, cy, s ?? 1);
    el('path', { d: 'M-40,-22 H-12 L-4,-30 H40 V28 H-40 Z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.2 }, g);
    tx(0, 52, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono' }, g); }

  // ---------- 1. File · Path · Directory ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      const parts = [['<BaseDirectory>', INK], ['data', WARN], ['note.txt', ACC]];
      parts.forEach(([s, col], i) => pill(160 + i * 200, 70, s, col, pop(u, 0.2 + i * 0.25), { mono: true, fs: 15 }));
      note(60, 140, 'Path.Combine 이 구분자를 OS 에 맞춰 넣는다', fade(u, 0.9));
      const sep = [BS, '/'];
      [['Windows', `C:${BS}…${BS}bin${BS}data${BS}note.txt`], ['Linux', '/home/…/bin/data/note.txt']].forEach(([os, pth], i) => { const y = 190 + i * 50;
        tx(60, y, os, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.1 + i * 0.3) });
        mono(170, y, pth, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.3) });
        pill(620, y - 5, `구분자 ${sep[i]}`, INFO, pop(u, 1.4 + i * 0.3), { mono: true, fs: 14 }); });
      note(60, 330, `dir + "${BS}" + name 은 Linux 에서 깨진다`, fade(u, 1.9), { fill: BAD, class: 'mono', 'font-size': 14.5 });
      folder(820, 220, 'data/', pop(u, 2.0));
      sub(820, 310, 'CreateDirectory: 없으면 만든다', fade(u, 2.2), { 'font-size': 14 });
      return; }
    const L = [['안녕하세요'], ['둘째 줄']];
    if (k === 4) L.push(['셋째 줄', ACC, seg(u, 0.6, 1.2)]);
    const shown = k === 1 ? Math.floor(seg(u, 0.9, 1.8) * 2 + (u > 1.8 ? 0 : 0)) : L.length;
    doc(180, 190, 200, 150, 'note.txt', L.slice(0, k === 1 ? (u > 1.8 ? 2 : u > 1.3 ? 1 : 0) : L.length), { s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { ['열기', '쓰기', '닫기'].forEach((s, i) => { const on = u > 0.5 + i * 0.6; el('circle', { cx: 400 + i * 110, cy: 110, r: 12, fill: on ? ACC : SOFT, stroke: ACC });
        tx(400 + i * 110, 146, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? ACC : MUT }); if (i < 2) grow(416 + i * 110, 110, 494 + i * 110, 110, seg(u, 0.6 + i * 0.6, 1.0 + i * 0.6), ACC); });
      note(380, 220, 'File.WriteAllText 한 줄', fade(u, 0.3), { class: 'mono' });
      mono(380, 270, '26 바이트 · UTF-8 · BOM 없음', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.0) });
      sub(560, 302, '첫 바이트 EC (한글 "안"의 시작)', fade(u, 2.3), { 'font-size': 14 });
      note(380, 360, '이미 있던 내용은 통째로 덮어쓴다', fade(u, 2.4), { fill: WARN, 'font-size': 14.5 });
      return; }
    if (k === 2) { const m = E(u, 0.4, 1.4);
      zone(420, 70, 500, 220, '메모리', { fill: SOFT });
      card(lerp(240, 670, m), lerp(190, 170, m), 300, 56, { rx: 8, text: `"안녕하세요${BS}n둘째 줄"`, mono: true, fs: 16, fw: 700, stroke: ACC, color: ACC });
      mono(540, 240, 'string all', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      sub(670, 340, '파일 전체가 문자열 하나로 · 작은 설정 파일에 맞다', fade(u, 1.8), { 'font-size': 15 });
      return; }
    if (k === 3) { zone(420, 70, 500, 220, '메모리', { fill: SOFT });
      mono(450, 110, 'string[] lines', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.2) });
      L.forEach(([s], i) => { const m = E(u, 0.3 + i * 0.4, 1.0 + i * 0.4);
        card(lerp(180, 640, m), lerp(160 + i * 24, 150 + i * 64, m), 220, 50, { rx: 8, text: s, fs: 16, fw: 700, stroke: ACC });
        mono(490, 155 + i * 64, `[${i}]`, { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0 + i * 0.4) }); });
      mono(450, 330, 'lines.Length == 2', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      return; }
    // k=4
    fly(560, 200, 180, 238, seg(u, 0.2, 0.7), '셋째 줄', {});
    note(380, 120, 'File.AppendAllText — 뒤에 붙인다', fade(u, 0.2), { class: 'mono', 'font-size': 14.5 });
    if (u > 1.4) card(600, 230, 260, 44, { rx: 8, text: 'File.Exists → true', mono: true, fs: 15, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
    mono(470, 320, '이제 ReadAllLines → 3줄', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
  }

  // ---------- 2. 스트림 · using · async ----------
  const LOG = ['INFO start', 'INFO req /a', 'ERROR db timeout', 'INFO req /b', 'WARN slow', 'ERROR disk full', 'INFO req /c', 'INFO done'];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const x0 = 220, w = 640;
      [['ReadAllText (동기)', BAD], ['await ReadAllTextAsync', GOOD]].forEach(([n, col], i) => { const y = 110 + i * 150;
        tx(40, y + 6, '스레드', { 'font-size': 14, fill: MUT }); mono(40, y - 30, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.3) });
        el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: GRID, 'stroke-width': 2 });
        const p = E(u, 0.4, 2.2);
        if (i === 0) { el('rect', { x: x0, y: y - 14, width: w * 0.12, height: 28, rx: 4, fill: INFO, opacity: 0.6 });
          el('rect', { x: x0 + w * 0.12, y: y - 14, width: Math.max(0, w * 0.76 * clamp((p - 0.12) / 0.76)), height: 28, rx: 4, fill: BAD, opacity: 0.55 });
          if (p > 0.5) tx(x0 + w * 0.5, y + 46, '디스크를 기다리며 막혀 있다', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle' }); }
        else { el('rect', { x: x0, y: y - 14, width: w * 0.12, height: 28, rx: 4, fill: INFO, opacity: 0.6 });
          [0.18, 0.34, 0.5, 0.66].forEach((a, j) => { if (p > a) el('rect', { x: x0 + w * a, y: y - 14, width: w * 0.12, height: 28, rx: 4, fill: GOOD, opacity: 0.5 }); });
          if (p > 0.5) tx(x0 + w * 0.5, y + 46, '기다리는 동안 다른 요청을 처리한다', { 'font-size': 14.5, fill: GOOD, 'text-anchor': 'middle' }); } });
      note(220, 400, '파란 칸: 요청 처리 · 초록 칸: 그사이 다른 일', fade(u, 2.2), { fill: MUT, 'font-size': 14 });
      return; }
    // 파일 + 핸들
    doc(130, 200, 170, 250, 'big.log', LOG.map((s) => [s.length > 12 ? s.slice(0, 12) : s, s.startsWith('ERROR') ? BAD : MUT]), { mono: true });
    const rOpen = k === 1 ? E(u, 0.3, 1.0) : k === 4 ? 1 - E(u, 1.6, 2.2) : 1;
    if (rOpen > 0) { grow(222, 120, lerp(222, 330, rOpen), 120, 1, ACC, { plain: true });
      card(410, 120, 150, 48, { rx: 8, text: 'reader', mono: true, fs: 16, fw: 700, stroke: ACC, color: ACC, op: rOpen }); }
    else { cross(276, 120, 9, 1); mono(330, 126, '② reader 닫힘', { 'font-size': 14.5, fill: MUT }); }
    // using 범위 괄호
    el('path', { d: 'M520,70 h-12 v300 h12', fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, k === 1 ? 1.2 : 0) });
    mono(530, 80, 'using 범위', { 'font-size': 14, fill: INFO, opacity: fade(u, k === 1 ? 1.2 : 0) });
    if (k === 1) { sub(365, 250, '파일 핸들 = OS 자원 · GC 가 바로 회수하지 않는다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 2) { const n = Math.min(8, Math.floor(E(u, 0.2, 2.4) * 8.99)), cur = Math.min(7, n);
      el('rect', { x: 50, y: 75 + 30 + cur * 24 - 17, width: 162, height: 24, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.4 });
      zone(560, 110, 360, 110, '메모리에 있는 것', { fill: SOFT });
      mono(580, 170, `"${LOG[cur]}"`, { 'font-size': 16, 'font-weight': 700 });
      const cnt = LOG.slice(0, n).filter((s) => s.startsWith('ERROR')).length;
      mono(580, 280, `count = ${cnt}`, { 'font-size': 24, 'font-weight': 800, fill: BAD });
      note(580, 320, '한 번에 한 줄만 · 파일이 커도 같다', fade(u, 1.5));
      sub(740, 400, '로그 여덟 줄은 예시', 1, { 'font-size': 13.5 });
      return; }
    // k=3 writer 열기, k=4 역순 닫기
    const wOpen = k === 3 ? E(u, 0.3, 1.0) : 1 - E(u, 0.9, 1.4);
    doc(810, 260, 160, 120, 'report.txt', k === 4 && u > 0.6 ? [['errors = 2', ACC]] : [], { mono: true, s: k === 3 ? pop(u, 0.2) : 1 });
    if (wOpen > 0) { grow(728, 260, lerp(728, 640, wOpen), 260, 1, WARN, { plain: true });
      card(600, 260, 130, 48, { rx: 8, text: 'writer', mono: true, fs: 16, fw: 700, stroke: WARN, color: WARN, op: wOpen }); }
    else { cross(690, 260, 9, 1); mono(560, 312, '① writer 닫힘', { 'font-size': 14.5, fill: MUT }); }
    mono(560, 400, 'count = 2', { 'font-size': 16, 'font-weight': 700, fill: BAD });
    if (k === 3) { note(540, 190, 'StreamWriter 도 using var', fade(u, 1.2), { class: 'mono', 'font-size': 14.5 }); return; }
    if (u < 0.9) fly(620, 230, 800, 250, seg(u, 0.1, 0.6), 'flush', { fill: ACC });
    note(540, 190, '범위 끝 · 선언의 역순으로 Dispose', fade(u, 0.1), { 'font-size': 14.5, fill: INFO });
  }

  // ---------- 3. System.Text.Json ----------
  function obj(x, y, vals, s, o) { o = o || {}; card(x, y, 260, 150, { rx: 10, stroke: o.stroke || INK, sw: 2.2, s });
    if (s < 0.5) return; mono(x - 116, y - 48, o.title || 'Coffee', { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INK });
    [['Id', 'int', '7'], ['Name', 'string', '"에스프레소"'], ['Price', 'int', '4500']].forEach(([k2, ty, v], i) => { mono(x - 116, y - 12 + i * 32, k2, { 'font-size': 15, 'font-weight': 700 }); mono(x + 116, y - 12 + i * 32, vals ? v : ty, { 'font-size': 15, fill: vals ? ACC : MUT, 'text-anchor': 'end' }); }); }
  function jsonBox(x, y, lines, o) { o = o || {}; const w = o.w || 430, h = lines.length * 28 + 30;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: INK, opacity: o.op ?? 1 });
    lines.forEach((ln, i) => { const parts = Array.isArray(ln) ? ln : [[ln, {}]]; spans(x + 18, y + 34 + i * 28, parts.map(([s2, a]) => [s2, Object.assign({ fill: 'var(--term)' }, a)]), { 'font-size': 15, opacity: o.op ?? 1 }); }); }
  const key = (s, hot) => [`"${s}"`, { fill: hot ? WARN : INFO, 'font-weight': hot ? 800 : 400 }];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { obj(200, 200, false, pop(u, 0.2), { title: 'record Coffee' });
      ['Id', 'Name', 'Price'].forEach((k2, i) => { grow(340, 188 + i * 32, 520, 120 + i * 60, seg(u, 0.8 + i * 0.3, 1.2 + i * 0.3), MUT); pill(600, 120 + i * 60, `"${k2}"`, INFO, pop(u, 1.2 + i * 0.3), { mono: true }); });
      note(520, 340, '프로퍼티 이름이 곧 JSON 키', fade(u, 2.1), { 'font-size': 15 });
      return; }
    if (k === 1) { const m = E(u, 0.8, 1.6);
      mono(40, 70, '기본 출력 (한 줄)', { 'font-size': 14, fill: MUT });
      jsonBox(40, 84, [[['{"Id":7,"Name":"', {}], [BS + 'uC5D0' + BS + 'uC2A4…', { fill: WARN }], ['","Price":4500}', {}]]], { w: 600, op: 1 - 0.6 * m });
      mono(40, 196, 'WriteIndented = true', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      jsonBox(40, 214, ['{', [['  ', {}], key('Id'), [': 7,', {}]], [['  ', {}], key('Name'), [': "', {}], [BS + 'uC5D0' + BS + 'uC2A4…', { fill: WARN }], ['",', {}]], [['  ', {}], key('Price'), [': 4500', {}]], '}'], { w: 420, op: m });
      if (u > 2.0) note(500, 330, '한글이 이상하다? 곧 다룬다', fade(u, 2.0), { fill: WARN, 'font-size': 14.5 });
      return; }
    if (k === 2) { const m = E(u, 0.4, 1.2);
      [['Id', 'id'], ['Name', 'name'], ['Price', 'price']].forEach(([a, b], i) => { const y = 110 + i * 70;
        pill(200, y, `"${a}"`, MUT, 1, { mono: true, fs: 16, op: 1 - 0.5 * m }); grow(270, y, 380, y, seg(u, 0.4 + i * 0.2, 0.8 + i * 0.2), ACC);
        pill(460, y, `"${b}"`, ACC, pop(u, 0.8 + i * 0.2), { mono: true, fs: 16 }); });
      mono(600, 116, 'CamelCase', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      note(600, 146, 'JS·웹 API 의 키 규칙', fade(u, 0.5), { 'font-size': 14.5 });
      mono(600, 230, 'WhenWritingNull', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) });
      note(600, 260, 'null 인 프로퍼티는 키째 뺀다', fade(u, 1.6), { 'font-size': 14.5 });
      mono(600, 300, '{ "id": 1 }  ← Name 이 null 일 때', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
      return; }
    if (k === 3) { // 한글 이스케이프
      mono(60, 80, '기본 Encoder', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      jsonBox(60, 96, [[['"name": "', {}], [ESC, { fill: WARN, 'font-weight': 800 }], ['"', {}]]], { w: 620 });
      [...'에스프레소'].forEach((ch, i) => { const s = pop(u, 0.5 + i * 0.2); card(120 + i * 120, 240, 100, 64, { rx: 8, s, stroke: WARN });
        if (s > 0.5) { tx(120 + i * 120, 236, ch, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle' }); mono(120 + i * 120, 262, BS + 'u' + ch.charCodeAt(0).toString(16).toUpperCase(), { 'font-size': 14, 'text-anchor': 'middle', fill: WARN }); } });
      mono(60, 330, 'Encoder = JavaScriptEncoder.Create(UnicodeRanges.All)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      if (u > 2.1) { jsonBox(60, 344, [[['"name": "', {}], ['에스프레소', { fill: GOOD, 'font-weight': 800 }], ['"', {}]]], { w: 360 }); check(450, 372, 10, pop(u, 2.2)); }
      return; }
    if (k === 4) { obj(170, 200, true, 1);
      const lines = ['{', [['  ', {}], key('id'), [': 7,', {}]], [['  ', {}], key('name'), [': "에스프레소",', {}]], [['  ', {}], key('price'), [': 4500', {}]], '}'];
      const n = Math.floor(E(u, 0.6, 2.0) * 5.99);
      jsonBox(480, 90, lines.slice(0, n), { w: 420 });
      [0, 1, 2].forEach((i) => dot([[300, 188 + i * 32], [490, 152 + i * 28]], seg(u, 0.5 + i * 0.4, 1.0 + i * 0.4), ACC, 6));
      mono(480, 330, 'string json = Serialize(coffee, opts)', { 'font-size': 15, opacity: fade(u, 0.2) });
      return; }
    // k=5 역직렬화 왕복
    jsonBox(40, 90, ['{', [['  ', {}], key('id'), [': 7,', {}]], [['  ', {}], key('name'), [': "에스프레소",', {}]], [['  ', {}], key('price'), [': 4500', {}]], '}'], { w: 380 });
    [0, 1, 2].forEach((i) => dot([[300, 152 + i * 28], [600, 188 + i * 32]], seg(u, 0.4 + i * 0.35, 0.9 + i * 0.35), ACC, 6));
    obj(750, 200, true, pop(u, 1.4), { title: 'Coffee back', stroke: ACC });
    mono(480, 360, 'back.Name == "에스프레소"  →  True', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
  }

  // ---------- 4. 이름 매핑 ----------
  function s4(t, c) { const { k, u } = c;
    const JX = 200, PX = 700;
    tx(JX, 50, '외부 JSON', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT }); tx(PX, 50, 'class User', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, class: 'mono' });
    const rows = [['"user_name": "kim"', 'UserName', 100], ['"phone": "010"', 'PhoneNo', 180], [null, 'Internal', 260]];
    rows.forEach(([j, pr, y], i) => { if (j) pill(JX, y, j, INK, 1, { mono: true, fs: 15 });
      const ign = pr === 'Internal' && k >= 2, col = ign ? OFF : INK;
      card(PX, y, 200, 46, { rx: 8, stroke: ign ? GRID : INK, dash: ign ? '5 4' : null });
      mono(PX, y + 6, pr, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: col, 'text-decoration': ign ? 'line-through' : null }); });
    const link = (y, u2, col, tag) => { if (u2 <= 0) return; grow(JX + 105, y, lerp(JX + 105, PX - 105, u2), y, 1, col, { plain: true }); if (u2 >= 1 && tag) pill((JX + PX) / 2, y - 26, tag, col, 1, { mono: true, fs: 13.5, fill: PANEL }); };
    if (k === 0) { link(100, E(u, 0.5, 1.4), ACC, '[JsonPropertyName("user_name")]');
      if (u > 1.6) mono(PX + 120, 106, '= "kim"', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      note(JX - 100, 340, 'snake_case 와 PascalCase 는 저절로 안 이어진다', fade(u, 2.0));
      return; }
    link(100, 1, ACC);
    mono(PX + 120, 106, '= "kim"', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 1) { const fail = u < 1.5;
      if (fail) { link(180, E(u, 0.2, 0.8), BAD); if (u > 0.8) { cross((JX + PX) / 2, 180, 10, pop(u, 0.8)); mono(PX + 120, 186, '= null', { 'font-size': 15, 'font-weight': 800, fill: BAD }); }
        note(JX - 100, 340, '특성이 없으면: 예외 없이 null', fade(u, 0.9), { fill: BAD }); }
      else { link(180, E(u, 1.5, 2.1), ACC, '[JsonPropertyName("phone")]'); if (u > 2.1) mono(PX + 120, 186, '= "010"', { 'font-size': 15, 'font-weight': 800, fill: ACC });
        note(JX - 100, 340, '특성을 붙이면 "010" (실제 실행 결과)', fade(u, 1.6), { fill: GOOD }); }
      return; }
    link(180, 1, ACC); mono(PX + 120, 186, '= "010"', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 2) { pill(PX, 222, '[JsonIgnore]', BAD, pop(u, 0.3), { mono: true, fs: 13.5 });
      mono(60, 350, 'Serialize →', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      mono(180, 350, '{"user_name":"kim","phone":"010"}', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.3) });
      sub(480, 390, 'Internal 은 나가지도 들어오지도 않는다', fade(u, 1.8), { 'font-size': 14.5 });
      return; }
    if (k === 3) { // 대소문자: 예시 키
      pill(JX, 330, '"Email": "a@b.c"', INK, pop(u, 0.2), { mono: true, fs: 15 });
      card(PX, 330, 200, 46, { rx: 8, s: pop(u, 0.2) }); mono(PX, 336, 'Email', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      const on = u > 1.3;
      mono(480, 300, on ? 'CaseInsensitive = true' : 'CaseInsensitive = false', { 'font-size': 14.5, 'font-weight': 800, fill: on ? GOOD : MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      link(330, on ? E(u, 1.4, 2.0) : 0, ACC);
      sub(480, 405, '대소문자만 다른 키도 이어진다 (Email 은 예시 키)', fade(u, 2.1), { 'font-size': 14 });
      return; }
    // k=4 결과 확인
    [['u.UserName', '"kim"'], ['u.PhoneNo', '"010"']].forEach(([a, b], i) => { const y = 320 + i * 40, s = pop(u, 0.4 + i * 0.5);
      mono(120, y, a, { 'font-size': 17, 'font-weight': 700, opacity: s }); mono(300, y, b, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: s }); if (s > 0.5) check(400, y - 6, 9, s); });
    note(500, 340, '값이 비어 있으면 먼저 이름부터 대조', fade(u, 1.6), { fill: WARN });
  }

  // ---------- 5. 대용량 스트리밍 & 라이브러리 ----------
  function gauge(x, y, frac, col, lab) { el('rect', { x, y, width: 40, height: 220, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    el('rect', { x: x + 4, y: y + 216 - 212 * frac, width: 32, height: 212 * frac, rx: 4, fill: col, opacity: 0.7 });
    tx(x + 20, y + 246, lab, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { doc(130, 200, 150, 190, 'huge.json', [['[', MUT], ['{…},{…},', MUT], ['{…},{…},', MUT], ['{…},{…},', MUT], ['… 수백 MB', MUT]], { mono: true });
      const m = E(u, 0.3, 2.0);
      card(lerp(260, 520, m), 200, lerp(60, 300, m), lerp(40, 180, m), { rx: 8, fill: BADBG, stroke: BAD, text: m > 0.6 ? 'string s (파일 전체)' : '', fs: 15, color: BAD });
      gauge(800, 90, m * 0.95, BAD, '메모리');
      if (u > 2.1) pill(820, 360, 'OutOfMemory', BAD, pop(u, 2.1), { mono: true, fs: 14.5 });
      note(260, 390, 'ReadAllText 는 크기를 묻지 않고 전부 올린다', fade(u, 1.8), { fill: BAD, 'font-size': 14.5 });
      return; }
    if (k <= 2) { doc(130, 200, 150, 190, 'huge.json', [['[', MUT], ['{…},{…},', MUT], ['{…},{…},', MUT], ['{…},{…},', MUT], ['…', MUT]], { mono: true });
      const po = k === 1 ? E(u, 0.3, 1.2) : 1;
      el('rect', { x: 215, y: 180, width: 330 * po, height: 40, rx: 20, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
      if (po > 0.9) mono(380, 160, 'FileStream (await using)', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
      gauge(800, 90, k === 2 ? 0.12 : 0.05, GOOD, '메모리');
      if (k === 1) { note(240, 300, 'File.OpenRead 는 파일을 열기만 한다', fade(u, 1.4)); note(240, 330, '아직 한 바이트도 읽지 않았다', fade(u, 1.8), { fill: MUT }); return; }
      for (let i = 0; i < 6; i++) dot([[220, 200], [545, 200]], ((t * 0.7 + i / 6) % 1), INFO, 6);
      const n = Math.floor(E(u, 0.3, 2.4) * 6);
      for (let i = 0; i < n; i++) card(600 + (i % 3) * 62, 140 + Math.floor(i / 3) * 56, 54, 44, { rx: 6, text: 'Coffee', fs: 13.5, stroke: ACC, s: 1 });
      mono(600, 280, 'List<Coffee>', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      note(240, 330, 'DeserializeAsync 가 읽는 만큼 객체로 바꾼다', fade(u, 1.0));
      note(240, 360, '파일 전체 문자열은 끝내 만들지 않는다', fade(u, 1.5), { fill: GOOD });
      return; }
    if (k === 3 || k === 4) { const B = '{"id":7,"name":"…","price":4500}';
      mono(40, 70, 'byte[] bytes (UTF-8)', { 'font-size': 14, fill: MUT });
      [...B].forEach((ch, i) => { el('rect', { x: 40 + i * 27, y: 84, width: 25, height: 34, rx: 3, fill: PANEL, stroke: GRID }); mono(52 + i * 27, 106, ch, { 'font-size': 14, 'text-anchor': 'middle' }); });
      const toks = [['StartObject', '{'], ['PropertyName', 'id'], ['Number', '7'], ['PropertyName', 'name'], ['String', '…'], ['PropertyName', 'price'], ['Number', '4500'], ['EndObject', '}']];
      const n = k === 3 ? Math.round(E(u, 0.5, 1.5) * 1) : Math.floor(E(u, 0.2, 2.3) * 8.99);
      if (k === 3) { note(40, 180, 'new Utf8JsonReader(bytes)', fade(u, 0.3), { class: 'mono' }); note(40, 212, 'Read() 한 번에 토큰 하나 · 객체를 만들지 않는다', fade(u, 1.2)); }
      toks.slice(0, k === 3 ? n : n).forEach(([ty, v], i) => { const x = 40 + (i % 4) * 225, y = 270 + Math.floor(i / 4) * 64, hot = ty === 'PropertyName';
        card(x + 100, y, 210, 50, { rx: 8, stroke: hot ? ACC : GRID, fill: hot ? ACCBG : PANEL });
        mono(x + 14, y - 3, ty, { 'font-size': 13.5, fill: hot ? ACC : MUT, 'font-weight': 700 }); mono(x + 14, y + 17, v, { 'font-size': 15, 'font-weight': 800 }); });
      if (k === 4) { terminal(600, 120, 320, 110, ['id', 'name', 'price'].slice(0, [1, 3, 5].filter((j) => j < n).length), 3, { lh: 18, fs: 13.5 });
        note(40, 180, 'PropertyName 일 때만 출력', 1, { fill: ACC }); }
      return; }
    // k=5 라이브러리
    const libs = c.beat.libCompare;
    libs.forEach((l, i) => { const x = 250 + i * 460, s = pop(u, 0.2 + i * 0.5), col = l.tone === 'good' ? GOOD : WARN;
      card(x, 170, 400, 180, { rx: 12, stroke: col, sw: 2.4, s });
      if (s < 0.5) return;
      mono(x, 120, l.lib, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: col });
      tx(x, 172, l.good, { 'font-size': 16, 'text-anchor': 'middle' });
      tx(x, 214, l.use, { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 }); });
    note(480, 330, '새 코드는 내장 System.Text.Json 부터', fade(u, 1.6), { 'text-anchor': 'middle', 'font-size': 16 });
    sub(480, 362, '다음 장 IV-2-2: 이 JSON 을 HTTP 로 주고받는다', fade(u, 2.0), { 'font-size': 14.5 });
  }

  const quiz = [
    { q: '경로를 dir + "\\" + name으로 잇지 말고 Path.Combine을 쓰는 까닭은 무엇인가?',
      o: ['Path.Combine이 파일을 미리 만들어 주기 때문이다', 'OS마다 다른 구분자를 알아서 넣기 때문이다', '문자열 덧셈보다 메모리를 덜 쓰기 때문이다'], a: 1,
      why: 'Windows는 \\, Linux는 / 를 쓴다. Path.Combine은 실행 중인 OS의 구분자로 경로를 조립한다.' },
    { q: 'using var reader와 using var writer를 차례로 선언했다. 범위가 끝날 때 무엇이 먼저 닫히나?',
      o: ['reader가 먼저 닫힌다', '둘이 동시에 닫힌다', 'writer가 먼저 flush하고 닫힌다'], a: 2,
      why: 'using 선언은 역순으로 Dispose 된다. 나중에 연 writer가 먼저 닫히며 내용을 파일에 쓴다.' },
    { q: '옵션 없이 Coffee(7, "에스프레소", 4500)를 직렬화하면 name은 어떻게 나오나?',
      o: ['"\\uC5D0\\uC2A4…" 처럼 이스케이프된다', '"에스프레소" 그대로 나온다', '직렬화가 예외를 던진다'], a: 0,
      why: '기본 Encoder는 ASCII 밖의 글자를 \\uXXXX로 바꾼다. Encoder에 UnicodeRanges.All을 주면 한글이 그대로 나간다.' },
    { q: '외부 JSON의 "phone" 을 PhoneNo로 받는데 특성을 안 붙였다. 결과는 무엇인가?',
      o: ['JsonException이 난다', 'PhoneNo가 조용히 null이 된다', '대소문자를 무시해 자동으로 이어진다'], a: 1,
      why: '이름이 다르면 그 키는 건너뛰고 예외도 없다. 실제로 돌려 보면 PhoneNo=null이다. [JsonPropertyName("phone")]으로 잇는다.' },
    { q: '수백 MB JSON 배열을 객체 목록으로 읽을 때 알맞은 방법은 무엇인가?',
      o: ['File.OpenRead 스트림을 DeserializeAsync에 넘긴다', 'ReadAllText로 읽어 Deserialize에 넘긴다', 'ReadAllLines로 줄마다 Deserialize 한다'], a: 0,
      why: '스트림을 넘기면 읽는 만큼 객체로 바꾸므로 파일 전체 문자열을 만들지 않는다.' },
  ];

  const summary = [
    '경로는 Path.Combine으로 잇고, 폴더는 CreateDirectory로 먼저 만든다.',
    '큰 파일은 StreamReader로 한 줄씩 읽고, 스트림은 using으로 닫는다. 서버에서는 Async 버전을 쓴다.',
    'System.Text.Json은 기본으로 한글을 \\uC5D0처럼 바꾼다. 그대로 쓰려면 Encoder를 바꾼다.',
    '키 이름이 다르면 예외 없이 null이 들어온다. [JsonPropertyName]으로 잇고 결과를 확인한다.',
  ];
  const review = [
    { q: 'API에서 받은 JSON을 역직렬화했더니 UserName은 들어오는데 PhoneNo만 늘 null이다. 먼저 볼 것은?',
      o: ['JSON의 실제 키와 PhoneNo 이름이 맞는지', 'WriteIndented를 켰는지', '파일을 using으로 열었는지'], a: 0,
      why: '이름이 다르면 예외 없이 건너뛴다. 실제 키가 "phone"이면 [JsonPropertyName("phone")]으로 이어 준다.' },
    { q: '설정을 JSON 파일로 저장했더니 한글 값이 \\uD55C\\uAE00 같은 글자로 보인다. 어떻게 하나?',
      o: ['파일을 UTF-16으로 다시 저장한다', 'Encoder를 JavaScriptEncoder.Create(UnicodeRanges.All)로 준다', 'PropertyNameCaseInsensitive를 켠다'], a: 1,
      why: '기본 Encoder가 ASCII 밖의 글자를 이스케이프한 것이다. 값은 맞지만, 사람이 읽게 하려면 Encoder를 바꾼다.' },
    { q: '로그 분석 서버가 수 GB 파일을 ReadAllText로 읽다 메모리가 바닥난다. 바꿀 방법은?',
      o: ['ReadAllLines로 바꾼다', 'GC를 더 자주 돌린다', 'StreamReader로 열어 ReadLineAsync로 한 줄씩 읽는다'], a: 2,
      why: 'ReadAllText와 ReadAllLines는 둘 다 전체를 올린다. 스트림으로 한 줄씩 읽으면 메모리는 한 줄 수준이다.' },
  ];

  R.page({ title: '파일과 JSON이 오가는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
