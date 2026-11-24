/* IV-1-2 json·csv·datetime — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽은 파이썬 객체(dict 의 키·값 칸과 타입 꼬리표), 오른쪽은 바깥으로 나가는 글자(JSON 문자열·CSV 줄·포맷 문자열).
 * 숫자와 출력은 페이지 코드의 주석, 그리고 python 3.12 로 직접 실행한 결과만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, fly, dot, cells, zone, cross, check, snippet, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 ----------
  // dict 상자: rows [[key, value, type, o]]  o = { hot, bad, op }
  function dictBox(x, y, name, rows, o) { o = o || {}; const w = o.w || 360, rh = 40, h = rows.length * rh + 44;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 14, y + 26, name, { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1 }); mono(x + w - 14, y + 26, 'dict', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: o.op ?? 1 });
    rows.forEach(([k, v, ty, ro], i) => { ro = ro || {}; const yy = y + 38 + i * rh, op = (ro.op ?? 1) * (o.op ?? 1); if (op <= 0.02) return;
      const col = ro.bad ? BAD : ro.hot ? ACC : INK;
      if (ro.hot || ro.bad) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: rh - 4, rx: 6, fill: ro.bad ? BADBG : ACCBG, opacity: op });
      mono(x + 16, yy + 26, k, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
      mono(x + (o.kw || 110), yy + 26, v, { 'font-size': 15, fill: col, opacity: op, 'font-weight': ro.hot || ro.bad ? 800 : 400 });
      if (ty) pill(x + w - 14 - (tw(ty, 13.5) + 26) / 2, yy + 20, ty, ro.bad ? BAD : MUT, 1, { fs: 13.5, op }); }); }
  // 한 줄 문자열 띠. parts [[text, color]] 를 n 글자까지만 보인다
  function tape(x, y, label, parts, n, o) { o = o || {}; const fs = o.fs || 15, all = parts.map((p) => p[0]).join(''), w = o.w || tw(all, fs) + 30;
    el('rect', { x, y, width: w, height: 44, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    if (label) mono(x, y - 10, label, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    let left = n == null ? all.length : Math.round(n); const ps = parts.map(([s, col]) => { const t = s.slice(0, Math.max(0, left)); left -= s.length; return [t, { fill: col || INK, 'font-weight': col ? 800 : 400 }]; });
    spans(x + 15, y + 28, ps, { 'font-size': fs, opacity: o.op ?? 1 }); return w; }
  const term = (x, y, w, h, lines, shown, title) => R.terminal(x, y, w, h, lines, shown, { title, fs: 14.5, lh: 23 });
  function fileDoc(cx, cy, w, h, name, rows, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2;
    el('path', { d: `M${x},${y} H${x + w - 18} L${x + w},${y + 18} V${y + h} H${x} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 });
    el('path', { d: `M${x + w - 18},${y} V${y + 18} H${x + w}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.5 });
    if (name) mono(cx, y + h + 20, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    (rows || []).forEach((r, i) => { const op = r.op ?? 1; if (op <= 0.02) return; const yy = y + 30 + i * (o.lh || 26);
      if (r.t != null) mono(x + 12, yy, r.t, { 'font-size': r.fs || 14.5, fill: r.col || INK, opacity: op, 'font-weight': r.fw || 600 });
      else el('rect', { x: x + 12, y: yy - 9, width: (w - 34) * (r.w ?? 0.7), height: 9, rx: 4, fill: r.col || OFF, opacity: op }); }); }

  // ---------- 1. dumps / loads ----------
  const USER = [['"id"', '7', 'int'], ['"name"', '"kim"', 'str'], ['"vip"', 'True', 'bool'], ['"ref"', 'None', 'NoneType']];
  const JS = [['{"id": 7, "name": "kim", "vip": '], ['true', ACC], [', "ref": '], ['null', ACC], ['}']];
  const JSLEN = JS.map((p) => p[0]).join('').length;
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const nodes = [[150, 170, '파이썬 객체', 'dict · list …'], [480, 170, 'JSON 문자열', 'str'], [810, 170, '파일', 'out.json']];
      nodes.forEach(([x, y, a, b], i) => card(x, y, 200, 76, { rx: 12, stroke: i === 1 ? ACC : INK, sw: 2.2, text: a + '\n' + b, fs: 15, s: pop(u, 0.2 + i * 0.25) }));
      grow(252, 152, 378, 152, E(u, 0.9, 1.3), ACC); grow(378, 190, 252, 190, E(u, 1.2, 1.6), INK);
      mono(315, 140, 'dumps', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(315, 214, 'loads', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      el('path', { d: 'M150,212 C150,320 810,320 810,212', fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': '7 6', opacity: fade(u, 1.7) });
      mono(480, 336, 'dump(obj, f) · load(f)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 380, '이름 끝의 s = string. s 가 없으면 파일 객체를 받는다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { USER.forEach((r, i) => { r[3] = { op: fade(u, 0.2 + i * 0.3), hot: i >= 2 && u > 1.6 }; }); dictBox(40, 60, 'user', USER);
      tx(470, 120, 'True · None 은 파이썬 표기', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(470, 156, 'JSON 에는 이 낱말이 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
      sub(220, 290, '아직 변환 전, 평범한 dict', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { dictBox(40, 60, 'user', USER.map((r, i) => [...r.slice(0, 3), { hot: i >= 2 }]));
      const n = JSLEN * E(u, 0.3, 1.8); tape(420, 100, 's = json.dumps(user)', JS, n, { fs: 14.5, w: 520, stroke: ACC });
      for (let i = 0; i < 4; i++) dot([[400, 120 + i * 40], [430, 122]], seg(u, 0.3 + i * 0.3, 0.7 + i * 0.3), ACC, 6);
      [['True', 'true'], ['None', 'null']].forEach(([a, b], i) => { const y = 200 + i * 44; mono(450, y, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6 + i * 0.2) }); grow(500, y - 5, 560, y - 5, E(u, 1.7 + i * 0.2, 2.0 + i * 0.2), ACC); mono(570, y, b, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9 + i * 0.2) }); });
      mono(700, 222, "type(s) → <class 'str'>", { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(480, 330, '결과는 dict 가 아니라 글자 줄 하나다', fade(u, 2.3), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { tape(420, 100, 's', JS, null, { fs: 14.5, w: 520 });
      for (let i = 0; i < 4; i++) dot([[430, 122], [400, 120 + i * 40]], seg(u, 0.3 + i * 0.25, 0.7 + i * 0.25), INK, 6);
      dictBox(40, 60, 'data = json.loads(s)', USER.map((r, i) => [...r.slice(0, 3), { op: fade(u, 0.5 + i * 0.25), hot: i === 2 }]), { w: 360, kw: 120 });
      mono(470, 210, 'data["vip"]  → True', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      mono(470, 250, 's["id"]     → TypeError', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      sub(700, 290, "string indices must be integers, not 'str'", fade(u, 2.2), { 'font-size': 14 }); return; }
    const X = [['"pos"', '(1, 2)', 'tuple'], ['1', '"a"', 'int 키']];
    if (k === 4) { dictBox(40, 60, 'x', X.map((r, i) => [...r, { hot: true, op: fade(u, 0.2 + i * 0.3) }]));
      tape(420, 100, 'json.dumps(x)', [['{"pos": '], ['[1, 2]', WARN], [', '], ['"1"', WARN], [': "a"}']], 25 * E(u, 0.8, 1.8), { fs: 15, w: 400 });
      [['(1, 2)', '[1, 2]', 'JSON 에는 tuple 이 없다'], ['키 1', '키 "1"', 'JSON 의 키는 문자열뿐']].forEach(([a, b, why], i) => { const y = 210 + i * 56;
        mono(440, y, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8 + i * 0.3) }); grow(520, y - 5, 570, y - 5, E(u, 1.9 + i * 0.3, 2.2 + i * 0.3), WARN);
        mono(580, y, b, { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0 + i * 0.3) }); tx(690, y, why, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1 + i * 0.3) }); }); return; }
    // k5 왕복 비교
    dictBox(40, 60, 'x (넣은 것)', X.map((r) => [...r, { hot: true }]), { w: 330 });
    dictBox(520, 60, 'back (돌아온 것)', [['"pos"', '[1, 2]', 'list', { bad: true, op: fade(u, 0.4) }], ['"1"', '"a"', 'str 키', { bad: true, op: fade(u, 0.7) }]], { w: 360 });
    grow(380, 120, 510, 120, E(u, 0.2, 0.6), MUT); mono(445, 108, '왕복', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    cross(905, 102, 9, pop(u, 1.0)); cross(905, 142, 9, pop(u, 1.2));
    mono(40, 250, "print(back) → {'pos': [1, 2], '1': 'a'}", { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
    mono(40, 300, 'back[1] → KeyError   (키가 "1" 로 바뀌었다)', { 'font-size': 15, fill: BAD, opacity: fade(u, 2.0) });
    sub(480, 360, '왕복해도 타입이 그대로 돌아오지 않는 두 가지', fade(u, 2.3), { 'font-size': 15, fill: INK }); }

  // ---------- 2. 파일 저장과 옵션 ----------
  const DATA = [['"name"', '"김철수"', 'str'], ['"joined"', 'datetime(2026,8,7,9,30)', 'datetime']];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { dictBox(40, 70, 'data', DATA.map((r, i) => [...r, { op: fade(u, 0.2 + i * 0.4), hot: i === 0 && u > 1.2, bad: i === 1 && u > 1.6 }]), { w: 470, kw: 120 });
      pill(700, 132, '한글 → ensure_ascii', ACC, pop(u, 1.2), { fs: 15 }); pill(700, 176, 'datetime → default', BAD, pop(u, 1.6), { fs: 15 });
      mono(40, 250, 'json.dumps(data)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      mono(40, 280, 'TypeError: Object of type datetime is not JSON serializable', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const chars = [['김', '\\uae40'], ['철', '\\ucca0'], ['수', '\\uc218']];
      mono(40, 60, 'json.dumps({"name": "김철수"})   # ensure_ascii=True (기본)', { 'font-size': 15, 'font-weight': 700 });
      chars.forEach(([ch, esc], i) => { const x = 120 + i * 260, g = E(u, 0.4 + i * 0.4, 1.0 + i * 0.4);
        card(x, 130, 70, 56, { rx: 8, stroke: INK, sw: 2, text: ch, fs: 24, s: 1 - 0.3 * g });
        grow(x, 162, x, 196, g, WARN);
        cells(x - 3 * 26, 206, [...esc].map((s) => (g > 0.6 ? s : '')), { w: 22, h: 34, gap: 4, fs: 14.5, style: () => ({ stroke: WARN, color: WARN, op: g }) }); });
      mono(40, 300, '→ {"name": "\\uae40\\ucca0\\uc218"}', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.9) });
      sub(480, 350, '값은 같지만 사람이 읽을 수 없다 (직접 실행)', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { snippet(30, 36, ['def to_serializable(o):', '    if isinstance(o, datetime):', '        return o.isoformat()', '    raise TypeError(...)'], { w: 400, fs: 14.5 });
      card(640, 90, 250, 52, { rx: 10, stroke: INK, sw: 2, text: 'datetime(2026,8,7,9,30)', fs: 14.5, mono: true, s: pop(u, 0.3) });
      grow(640, 118, 640, 168, E(u, 0.7, 1.1), ACC); card(640, 196, 280, 52, { rx: 10, stroke: ACC, sw: 2.2, text: '"2026-08-07T09:30:00"', fs: 15, mono: true, color: ACC, s: pop(u, 1.1) });
      card(640, 300, 250, 50, { rx: 10, stroke: BAD, sw: 2, text: '{1, 2}  (set)', fs: 15, mono: true, s: pop(u, 1.6) });
      mono(40, 210, '모르는 타입은 일부러 예외로 남긴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      mono(40, 250, "TypeError: not serializable: <class 'set'>", { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.0) });
      sub(225, 290, 'set 을 넣어 직접 실행한 결과', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { const opts = [['ensure_ascii=False', '한글 그대로'], ['indent=2', '줄 나눔'], ['default=to_serializable', 'datetime → 문자열']];
      opts.forEach(([a, b], i) => { const on = u > 0.4 + i * 0.6, y = 70 + i * 54;
        card(170, y, 290, 42, { rx: 21, stroke: on ? ACC : GRID, sw: 2, fill: on ? ACCBG : PANEL, text: a, fs: 14.5, mono: true, color: on ? ACC : MUT });
        tx(330, y + 6, b, { 'font-size': 15, 'font-weight': 700, opacity: on ? 1 : 0.3 }); });
      const st = u > 1.6 ? 3 : u > 1.0 ? 2 : u > 0.4 ? 1 : 0;
      const out = st >= 2 ? ['{', '  "name": "김철수",', st >= 3 ? '  "joined": "2026-08-07T09:30:00"' : '  "joined": ?? TypeError', '}'] : [st ? '{"name": "김철수", "joined": ??}' : '{"name": "\\uae40\\ucca0\\uc218", ...}'];
      term(500, 40, 440, 190, out.map((s) => [s, s.includes('??') ? '#fca5a5' : null]), out.length, 'json.dumps(data, ...)');
      sub(480, 300, '세 옵션을 하나씩 켜면 출력이 이렇게 바뀐다', fade(u, 0.2), { 'font-size': 15, fill: INK });
      sub(480, 336, '사람이 열어 볼 JSON 이면 셋을 한 세트로 붙인다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { const out = ['{', '  "name": "김철수",', '  "joined": "2026-08-07T09:30:00"', '}'];
      term(60, 50, 520, 190, out, lerp(0, 4, E(u, 0.2, 1.4)), 'print(s)');
      [['"김철수"', '한글이 그대로', 0], ['"2026-08-07T09:30:00"', 'datetime 이 ISO 문자열로', 1]].forEach(([a, b, i]) => { const y = 120 + i * 70;
        pill(770, y, a, ACC, pop(u, 1.5 + i * 0.4), { mono: true, fs: 14.5 }); sub(770, y + 34, b, fade(u, 1.7 + i * 0.4), { 'font-size': 14.5 }); });
      sub(320, 300, '직접 실행해 찍은 출력과 같다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 5) { dictBox(40, 60, 'data', DATA, { w: 470, kw: 120 });
      fileDoc(780, 150, 170, 180, 'out.json', [{ t: '{', op: fade(u, 1.0) }, { t: ' "name": "김철수",', fs: 13.5, op: fade(u, 1.2) }, { t: ' "joined": "2026…"', fs: 13.5, op: fade(u, 1.4) }, { t: '}', op: fade(u, 1.5) }]);
      for (let i = 0; i < 5; i++) dot([[520, 110], [600, 140], [690, 150]], seg(u, 0.3 + i * 0.15, 1.0 + i * 0.15), ACC, 5);
      pill(600, 86, 'encoding="utf-8"', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      mono(40, 230, 'json.dump(data, f, ...)   # s 가 빠졌다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(780, 280, '63 바이트', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(40, 300, 'encoding="ascii" 로 연 파일 → UnicodeEncodeError', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.1) });
      sub(280, 336, 'ensure_ascii=False 는 utf-8 파일과 세트 (직접 실행)', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k6 load
    fileDoc(140, 150, 170, 180, 'out.json', [{ t: '{' }, { t: ' "name": "김철수",', fs: 13.5 }, { t: ' "joined": "2026…"', fs: 13.5 }, { t: '}' }]);
    for (let i = 0; i < 4; i++) dot([[230, 150], [380, 130]], seg(u, 0.2 + i * 0.15, 0.8 + i * 0.15), INK, 5);
    dictBox(400, 60, 'loaded = json.load(f)', [['"name"', '"김철수"', 'str', { op: fade(u, 0.7) }], ['"joined"', '"2026-08-07T09:30:00"', 'str', { op: fade(u, 1.0), bad: u > 1.5 }]], { w: 520, kw: 130 });
    mono(400, 230, 'loaded["name"] → 김철수', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) });
    tx(400, 280, 'joined 는 datetime 이 아니라 str 로 돌아온다', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
    mono(400, 316, 'datetime.fromisoformat(...) 로 직접 되돌린다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); }

  // ---------- 3. csv ----------
  const ROWS = [['1', 'kim', 'seoul'], ['2', 'lee', 'busan']];
  function rowCards(o) { o = o || {}; ROWS.forEach(([id, n, cty], i) => { const y = 86 + i * 60, op = o.op ? o.op(i) : 1;
      card(200, y, 330, 52, { rx: 10, stroke: INK, sw: 1.8, op });
      spans(48, y + 6, [['{"id": ', {}], [id, { fill: o.idCol || INFO, 'font-weight': 800 }], [`, "name": "${n}", ...}`, {}]], { 'font-size': 14.5, opacity: op }); });
    if (o.tag !== false) pill(330, 186, 'id 는 int', INFO, 1, { fs: 13.5, op: o.tagOp ?? 1 }); }
  function csvDoc(lines, o) { o = o || {}; fileDoc(760, 170, 280, 200, 'people.csv', lines.map((l) => (typeof l === 'string' ? { t: l } : l)), { lh: 30, stroke: o.stroke }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { zone(20, 26, 380, 200, 'rows  (dict 의 list)'); rowCards({ op: (i) => fade(u, 0.2 + i * 0.4), tagOp: fade(u, 1.2) });
      csvDoc([{ t: '(아직 없음)', col: MUT, op: fade(u, 0.4) }], { stroke: OFF });
      grow(410, 120, 600, 120, E(u, 1.4, 1.9), MUT, { dash: '6 5' }); sub(505, 108, 'DictWriter', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(480, 320, 'dict 의 키가 그대로 열 이름이 된다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { const lanes = [['newline=""', "b'id,name,city\\r\\n'", GOOD, ['id,name,city', '1,kim,seoul', '2,lee,busan']], ['newline 생략 (윈도우)', "b'id,name,city\\r\\r\\n'", BAD, ['id,name,city', '(빈 행)', '1,kim,seoul', '(빈 행)']]];
      lanes.forEach(([a, b, col, rows], i) => { const x = 40 + i * 470, s = pop(u, 0.2 + i * 0.8);
        pill(x + 100, 50, a, col, s, { mono: true, fs: 14.5 });
        mono(x, 102, b, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.5 + i * 0.8) });
        rows.forEach((r, j) => { const y = 150 + j * 34, bad = r === '(빈 행)';
          card(x + 170, y, 340, 28, { rx: 5, stroke: bad ? BAD : GRID, sw: 1.5, fill: bad ? BADBG : PANEL, dash: bad ? '5 4' : null, op: fade(u, 0.7 + i * 0.8 + j * 0.12) });
          mono(x + 16, y + 5, r, { 'font-size': 14.5, fill: bad ? BAD : INK, opacity: fade(u, 0.7 + i * 0.8 + j * 0.12) }); }); });
      sub(480, 330, '다시 읽으면 행마다 빈 행 [] 이 끼어든다 (직접 실행)', fade(u, 2.2), { 'font-size': 15, fill: INK });
      sub(480, 364, '엑셀에서 한글이 깨지면 encoding="utf-8-sig"', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 2) { zone(20, 26, 380, 200, 'rows'); rowCards({ tag: false });
      cells(40, 262, ['"id"', '"name"', '"city"'], { w: 100, h: 38, gap: 10, fs: 14.5, style: () => ({ stroke: ACC, color: ACC }) });
      tx(40, 250, 'fieldnames', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      fly(200, 280, 720, 104, seg(u, 0.4, 1.3), 'id,name,city', { mono: true });
      csvDoc([{ t: 'id,name,city', col: ACC, fw: 800, op: fade(u, 1.3) }]);
      sub(760, 310, '첫 줄 = 나중에 읽을 때의 키', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { zone(20, 26, 380, 200, 'rows'); rowCards({ op: (i) => 1 - 0.5 * E(u, 0.4 + i * 0.6, 0.9 + i * 0.6) });
      fly(240, 70, 720, 134, seg(u, 0.4, 1.1), '1,kim,seoul', { mono: true }); fly(240, 136, 720, 164, seg(u, 1.0, 1.7), '2,lee,busan', { mono: true });
      csvDoc([{ t: 'id,name,city' }, { t: '1,kim,seoul', op: fade(u, 1.1) }, { t: '2,lee,busan', op: fade(u, 1.7) }]);
      tx(40, 270, '정수 1 은 글자 "1" 로 적힌다', { 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      tx(40, 304, 'CSV 에는 타입이 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { csvDoc([{ t: 'id,name,city', col: ACC, fw: 800 }, { t: '1,kim,seoul' }, { t: '2,lee,busan' }]);
      ROWS.forEach(([id, n, cty], i) => { const y = 120 + i * 80, s = pop(u, 0.8 + i * 0.5);
        dot([[620, 135 + i * 30], [440, y]], seg(u, 0.4 + i * 0.5, 1.0 + i * 0.5), ACC, 6);
        card(220, y, 400, 50, { rx: 10, stroke: ACC, sw: 2, s, text: `{'id': '${id}', 'name': '${n}', 'city': '${cty}'}`, fs: 14.5, mono: true }); });
      tx(40, 60, 'row = 헤더가 키인 dict', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      sub(220, 310, 'row["name"] 처럼 이름으로 꺼낸다 · 열 순서가 바뀌어도 안전', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 5) { card(220, 80, 400, 50, { rx: 10, stroke: ACC, sw: 2, text: "{'id': '1', 'name': 'kim', ...}", fs: 14.5, mono: true });
      [['row["id"]', "'1'  (str)", WARN], ['row["id"] + "1"', "'11'   ← 조용히 틀린다", BAD], ['row["id"] + 1', 'TypeError', BAD], ['int(row["id"]) + 1', '2', GOOD]].forEach(([a, b, col], i) => { const y = 160 + i * 48;
        mono(40, y, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) }); mono(330, y, '→ ' + b, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.5) }); });
      card(760, 200, 300, 130, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 2.2), text: '읽자마자 변환\nint(row["id"])\nfloat(row["score"])', fs: 15 }); return; }
    // k6 csv.reader
    csvDoc([{ t: 'id,name,city' }, { t: '1,kim,seoul' }, { t: '2,lee,busan' }]);
    [['id', 'name', 'city'], ['1', 'kim', 'seoul'], ['2', 'lee', 'busan']].forEach((r, i) => { const y = 70 + i * 66;
      cells(60, y, r.map((s) => `'${s}'`), { w: 110, h: 40, gap: 8, fs: 14.5, style: () => ({ stroke: i ? INK : WARN, color: i ? INK : WARN, op: fade(u, 0.3 + i * 0.4) }) });
      mono(30, y + 26, '[', { 'font-size': 20, opacity: fade(u, 0.3 + i * 0.4) }); mono(420, y + 26, ']', { 'font-size': 20, opacity: fade(u, 0.3 + i * 0.4) }); });
    tx(60, 300, '헤더도 그냥 한 행 · 각 행은 문자열 list', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) });
    sub(260, 336, '번호(row[0])로 꺼내야 해 열이 바뀌면 깨진다', fade(u, 2.0), { 'font-size': 14.5 }); }

  // ---------- 4. datetime 포맷 ----------
  const SLOT = [['year', '2026', '%Y', '2026'], ['month', '8', '%m', '08'], ['day', '7', '%d', '07'], ['hour', '9', '%H', '09'], ['minute', '30', '%M', '30'], ['second', '0', '%S', '00']];
  const SX = (i) => 110 + i * 150;
  function slots(op, hot) { zone(30, 26, 900, 110, 'dt = datetime(2026, 8, 7, 9, 30, 0)', { fill: SOFT });
    SLOT.forEach(([n, v], i) => { const o = typeof op === 'function' ? op(i) : op ?? 1;
      card(SX(i), 92, 112, 52, { rx: 8, stroke: hot ? ACC : INK, sw: 2, op: o }); sub(SX(i), 76, n, o, { 'font-size': 13.5 });
      mono(SX(i), 104, v, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: o }); }); }
  function fmtRow(y, u0, u, o) { o = o || {};
    SLOT.forEach(([, , tok, out], i) => { card(SX(i), y, 70, 36, { rx: 6, stroke: o.col || INFO, sw: 1.8, text: tok, fs: 15, mono: true, color: o.col || INFO, op: fade(u, u0 + i * 0.08) });
      const sep = ['-', '-', ' ', ':', ':', ''][i]; if (sep.trim()) mono(SX(i) + 75, y + 6, sep, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, u0) }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { slots((i) => fade(u, 0.2 + i * 0.25));
      [['date', '날짜만'], ['time', '시각만'], ['datetime', '둘 다'], ['timedelta', '기간']].forEach(([a, b], i) => { const x = 160 + i * 210;
        pill(x, 210, a, i === 2 ? ACC : i === 3 ? WARN : MUT, pop(u, 1.8 + i * 0.15), { mono: true, fs: 15 }); sub(x, 246, b, fade(u, 1.9 + i * 0.15), { 'font-size': 14.5 }); });
      sub(480, 320, '값 객체다. 더하고 빼면 언제나 새 객체가 나온다', fade(u, 2.3), { 'font-size': 15, fill: INK }); return; }
    if (k === 1 || k === 2) { slots(1, k === 2 && u > 2.0); const up = k === 2;
      mono(40, 186, up ? 'strptime(문자열, 포맷)' : 'strftime(포맷)', { 'font-size': 15, 'font-weight': 800, fill: up ? GOOD : INFO });
      fmtRow(222, 0.2, u, { col: up ? GOOD : INFO });
      SLOT.forEach(([, , , out], i) => { const g = up ? 1 - seg(u, 0.6 + i * 0.15, 1.3 + i * 0.15) : seg(u, 0.6 + i * 0.15, 1.3 + i * 0.15);
        const cy = lerp(118, 300, g), hide = cy > 190 && cy < 255; if (g > 0.02 && g < 0.98) card(SX(i), cy, 50, 26, { rx: 6, fill: up ? GOOD : INFO, stroke: 'none', text: hide ? null : out, fs: 14, mono: true, color: PANEL }); });
      const str = '2026-08-07 09:30:00';
      tape(220, 282, up ? '입력 문자열' : 's', [[str, up ? null : ACC]], up ? null : str.length * E(u, 1.0, 2.2), { fs: 17, w: 520 });
      sub(480, 372, up ? '문자열의 각 자리를 포맷 토큰에 맞춰 칸에 다시 넣는다' : '자리마다 값이 채워진다 · 한 자리 수는 0 으로 채워 두 자리', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { const s = '2026/08/07', f = '%Y-%m-%d', cw = 34, x0 = 260;
      mono(40, 80, 'datetime.strptime("2026/08/07", "%Y-%m-%d")', { 'font-size': 16, 'font-weight': 700 });
      const sc = ['2026', '/', '08', '/', '07'], fc = ['%Y', '-', '%m', '-', '%d'];
      sc.forEach((p, i) => { const x = x0 + i * 90, bad = i === 1 || i === 3, g = fade(u, 0.3 + i * 0.3);
        card(x, 160, 80, 44, { rx: 6, stroke: bad && u > 1.2 ? BAD : INK, sw: 2, text: p, fs: 17, mono: true, color: bad && u > 1.2 ? BAD : INK, op: g });
        card(x, 230, 80, 44, { rx: 6, stroke: bad && u > 1.2 ? BAD : INFO, sw: 2, text: fc[i], fs: 17, mono: true, color: bad && u > 1.2 ? BAD : INFO, op: g });
        if (!bad) check(x, 278, 9, pop(u, 0.5 + i * 0.3)); });
      cross(x0 + 90, 280, 10, pop(u, 1.3)); tx(170, 166, '문자열', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end' }); tx(170, 236, '포맷', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end' });
      mono(40, 340, "ValueError: time data '2026/08/07' does not match format '%Y-%m-%d'", { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.8) });
      sub(480, 384, '구분자 한 글자만 달라도 실패 · %H(24시)와 %I(12시)도 자주 헷갈린다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 4) { slots(1);
      tape(170, 200, 'dt.isoformat()', [['2026-08-07'], ['T', ACC], ['09:30:00']], 19 * E(u, 0.3, 1.2), { fs: 20, w: 330 });
      grow(510, 222, 600, 222, E(u, 1.2, 1.5), MUT); mono(620, 228, 'fromisoformat(...)', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      pill(330, 300, '포맷 문자열이 없다', GOOD, pop(u, 1.8), { fs: 15 }); sub(700, 300, 'ISO 8601 고정 형식 → 불일치 ValueError 가 생길 틈이 없다', fade(u, 2.1), { 'font-size': 14 }); return; }
    // k5 timedelta: 달력 선
    const x0 = 80, x1 = 880, d0 = 0, d1 = 140, X = (d) => lerp(x0, x1, d / d1);
    el('line', { x1: x0, y1: 220, x2: x1, y2: 220, stroke: INK, 'stroke-width': 2.5 });
    [['8/7', 0], ['9/1', 25], ['10/1', 55], ['11/1', 86], ['12/1', 116], ['12/25', 140]].forEach(([s, d]) => { el('line', { x1: X(d), y1: 212, x2: X(d), y2: 228, stroke: INK, 'stroke-width': 2 }); mono(X(d), 252, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
    const g = E(u, 0.3, 1.0); el('rect', { x: X(0), y: 160, width: (X(7) - X(0)) * g, height: 28, rx: 5, fill: ACC, opacity: 0.85 });
    mono(X(7) + 10, 180, 'dt + timedelta(days=7) → 2026-08-14 09:30:00', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
    const h = E(u, 1.2, 2.2); el('rect', { x: X(0), y: 280, width: (X(140) - X(0)) * h, height: 28, rx: 5, fill: WARN, opacity: 0.8 });
    mono(480, 344, 'date(2026,12,25) - date(2026,8,7) → .days = 140', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    sub(480, 100, '날짜 + 기간 = 날짜 · 날짜 - 날짜 = 기간', fade(u, 0.2), { 'font-size': 15.5, fill: INK, 'font-weight': 700 }); }

  // ---------- 5. 타임존 ----------
  // 아날로그 시계: h(0~24), m
  function clockFace(cx, cy, r, h, m, label, col, o) { o = o || {}; const op = o.op ?? 1; if (op <= 0.02) return;
    el('circle', { cx, cy, r, fill: PANEL, stroke: col || INK, 'stroke-width': 2.5, opacity: op });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; el('line', { x1: cx + Math.sin(a) * r * 0.82, y1: cy - Math.cos(a) * r * 0.82, x2: cx + Math.sin(a) * r * 0.94, y2: cy - Math.cos(a) * r * 0.94, stroke: MUT, 'stroke-width': 1.5, opacity: op }); }
    const ha = (((h % 12) + m / 60) / 12) * Math.PI * 2, ma = (m / 60) * Math.PI * 2;
    el('line', { x1: cx, y1: cy, x2: cx + Math.sin(ha) * r * 0.5, y2: cy - Math.cos(ha) * r * 0.5, stroke: col || INK, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: op });
    el('line', { x1: cx, y1: cy, x2: cx + Math.sin(ma) * r * 0.78, y2: cy - Math.cos(ma) * r * 0.78, stroke: col || INK, 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: op });
    if (label) mono(cx, cy + r + 22, label, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col || INK, opacity: op }); }
  // 절대 시각 축: UTC 8/6 22:00 ~ 8/7 12:00
  const AX0 = 90, AX1 = 890, TX = (h) => lerp(AX0, AX1, (h + 2) / 14);
  function instantAxis(op) { el('line', { x1: AX0, y1: 330, x2: AX1, y2: 330, stroke: INK, 'stroke-width': 2.2, opacity: op ?? 1 });
    [-2, 0, 2, 4, 6, 8, 10, 12].forEach((h) => { el('line', { x1: TX(h), y1: 324, x2: TX(h), y2: 336, stroke: INK, 'stroke-width': 1.5, opacity: op ?? 1 }); mono(TX(h), 356, (h < 0 ? 24 + h : h) + ':00', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op ?? 1 }); });
    tx(AX0, 312, '실제 순간 (UTC 기준 축)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op ?? 1 }); }
  function pin(h, col, label, op) { el('line', { x1: TX(h), y1: 280, x2: TX(h), y2: 330, stroke: col, 'stroke-width': 3, opacity: op }); el('circle', { cx: TX(h), cy: 330, r: 7, fill: col, opacity: op });
    if (label) mono(TX(h), 272, label, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['timezone.utc', 'datetime 모듈 안', INFO], ['ZoneInfo("Asia/Seoul")', '표준 zoneinfo (3.9+)', ACC]].forEach(([a, b, col], i) => { const x = 250 + i * 460;
        pill(x, 80, a, col, pop(u, 0.2 + i * 0.4), { mono: true, fs: 15.5 }); sub(x, 120, b, fade(u, 0.4 + i * 0.4), { 'font-size': 14.5 }); });
      zone(470, 160, 460, 150, '윈도우에서 직접 실행하면', { fill: WARNBG, op: fade(u, 1.2) });
      mono(490, 214, 'ZoneInfoNotFoundError:', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.4) }); mono(490, 238, "'No time zone found with key Asia/Seoul'", { 'font-size': 14, fill: BAD, opacity: fade(u, 1.5) });
      mono(490, 284, 'pip install tzdata 로 해결', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
      tx(40, 210, '리눅스·맥은 OS 의 IANA 데이터를 쓴다', { 'font-size': 15, opacity: fade(u, 1.0) });
      tx(40, 246, '윈도우에는 그 데이터가 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    instantAxis();
    if (k === 1) { card(250, 80, 380, 60, { rx: 10, stroke: BAD, sw: 2.2, s: pop(u, 0.2), text: 'naive = 2026-08-07 09:30:00', fs: 16, mono: true });
      mono(250, 134, 'tzinfo = None', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      clockFace(640, 110, 56, 9, 30, '09:30 ?', BAD, { op: fade(u, 0.4) });
      pin(9.5, WARN, 'UTC 09:30 이라면', fade(u, 1.2)); pin(0.5, WARN, '서울 09:30 이라면', fade(u, 1.5));
      el('path', { d: `M${TX(0.5)},296 V288 H${TX(9.5)} V296`, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.9) });
      mono((TX(0.5) + TX(9.5)) / 2, 230, '9시간 차이 · 받는 쪽이 고른다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 2) { card(250, 80, 400, 60, { rx: 10, stroke: GOOD, sw: 2.2, s: pop(u, 0.2), text: 'utc_now = 2026-08-07 00:30:00+00:00', fs: 15, mono: true });
      mono(250, 134, 'tzinfo = UTC', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      clockFace(640, 110, 56, 0, 30, 'UTC 00:30', INFO, { op: fade(u, 0.4) });
      pin(0.5, GOOD, '순간이 하나로 정해진다', fade(u, 1.2));
      sub(640, 236, '저장·전송은 전부 이 형태', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { clockFace(300, 120, 56, 0, 30, 'UTC 00:30', INFO);
      clockFace(640, 120, 56, lerp(0, 9, E(u, 0.4, 1.4)), 30, '서울 09:30+09:00', ACC, { op: fade(u, 0.3) });
      grow(366, 120, 574, 120, E(u, 0.3, 0.9), ACC); mono(470, 36, '.astimezone(ZoneInfo("Asia/Seoul"))', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      pin(0.5, GOOD, '같은 순간', 1);
      mono(640, 250, 'seoul == utc_now → True', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 4) { card(200, 70, 300, 50, { rx: 10, stroke: BAD, sw: 2, text: 'naive (tzinfo=None)', fs: 15, mono: true }); card(620, 70, 300, 50, { rx: 10, stroke: GOOD, sw: 2, text: 'utc_now (UTC)', fs: 15, mono: true });
      [['naive - utc_now', "TypeError: can't subtract offset-naive and offset-aware datetimes", BAD], ['naive < utc_now', "TypeError: can't compare offset-naive and offset-aware datetimes", BAD], ['naive == utc_now', 'False   ← 예외 없이 그냥 다르다고 답한다', WARN]].forEach(([a, b, col], i) => { const y = 150 + i * 46;
        mono(40, y, a, { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.6) }); mono(240, y, b, { 'font-size': 13.5, fill: col, opacity: fade(u, 0.6 + i * 0.6) }); });
      return; }
    // k5 ISO 왕복
    tape(140, 80, 's = utc_now.isoformat()', [['2026-08-07T00:30:00'], ['+00:00', ACC]], 25 * E(u, 0.2, 1.2), { fs: 19, w: 400 });
    grow(560, 102, 640, 102, E(u, 1.2, 1.5), MUT);
    mono(660, 108, 'fromisoformat(s).tzinfo → UTC', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
    pill(380, 170, '오프셋까지 글자에 담긴다', ACC, pop(u, 1.3), { fs: 15 });
    pin(0.5, GOOD, '복원해도 같은 순간', fade(u, 1.9));
    sub(480, 230, '값은 예시 (코드 주석의 시각)', fade(u, 2.2), { 'font-size': 14 }); }

  const quiz = [
    { q: 'json.dumps({"pos": (1, 2)})의 결과를 json.loads로 되돌리면 pos의 값은 무엇인가?',
      o: ['(1, 2) 튜플', '[1, 2] 리스트', '"(1, 2)" 문자열'], a: 1,
      why: 'JSON에는 tuple이 없어 array로 나가고, 돌아올 때는 list가 된다. 정수 키 1도 "1" 로 돌아온다.' },
    { q: '한글과 datetime이 든 dict를 사람이 읽을 JSON 파일로 저장하려면 필요한 조합은 무엇인가?',
      o: ['ensure_ascii=False, default 함수, encoding="utf-8" 파일', 'indent=2만 주면 된다', 'default=None, ensure_ascii=True'], a: 0,
      why: '기본 ensure_ascii=True는 "김"을 \\uae40로 바꾸고, datetime은 default 없이 TypeError를 낸다. 한글을 그대로 쓴 파일은 utf-8로 열어야 한다.' },
    { q: 'DictReader로 읽은 row["id"]에 + "1" 을 했더니 무엇이 나오나?',
      o: ['2', 'TypeError', "'11'"], a: 2,
      why: 'CSV에는 타입이 없어 값이 전부 str이다. 문자열끼리 이어 붙여 \'11\'이 되므로 int()로 먼저 바꿔야 한다.' },
    { q: 'datetime.strptime("2026/08/07", "%Y-%m-%d")가 실패하는 이유는 무엇인가?',
      o: ['월과 일이 두 자리라서', '구분자 / 와 - 가 달라서', 'strptime은 시각까지 있어야 해서'], a: 1,
      why: 'strptime은 문자열과 포맷이 글자 하나까지 맞아야 한다. 슬래시와 하이픈이 달라 ValueError가 난다.' },
    { q: 'DB에 시각을 저장하려 한다. 가장 안전한 값은 무엇인가?',
      o: ['datetime.now(timezone.utc)', 'datetime.now()', 'datetime.utcnow()'], a: 0,
      why: 'now()와 utcnow()는 둘 다 tzinfo가 None인 naive다. UTC aware로 저장하고 화면에 보일 때만 astimezone으로 바꾼다.' },
  ];
  const summary = [
    'dumps는 객체를 JSON 문자열로, loads는 되돌린다. tuple과 정수 키는 왕복하면 list와 문자열 키가 된다.',
    '사람이 볼 JSON은 ensure_ascii=False, indent, default를 함께 주고 utf-8 파일로 쓴다.',
    'CSV는 newline=""로 열고 DictReader로 읽는다. 읽은 값은 전부 str이라 숫자는 직접 바꾼다.',
    'strptime은 포맷이 글자까지 맞아야 한다. 시각은 UTC aware로 저장하고 표시할 때만 바꾼다.',
  ];
  const review = [
    { q: '설정을 JSON으로 저장했다 읽었더니 config[1]이 KeyError를 냈다. 먼저 의심할 것은?',
      o: ['파일이 utf-8이 아니었다', '정수 키 1이 저장되며 문자열 "1" 이 되었다', 'indent를 주지 않았다'], a: 1,
      why: 'JSON의 키는 문자열뿐이라 dumps에서 1이 "1" 로 바뀐다. 읽은 뒤 int로 되돌리거나 처음부터 문자열 키를 쓴다.' },
    { q: '윈도우에서 만든 CSV를 열었더니 데이터 사이마다 빈 행이 있다. 쓰는 코드에서 고칠 곳은?',
      o: ['open에 newline="" 을 준다', 'DictWriter 대신 writer를 쓴다', 'encoding을 cp949로 바꾼다'], a: 0,
      why: 'csv 모듈이 \\r\\n을 넣는데 파일 쪽이 \\n을 또 \\r\\n으로 바꿔 \\r\\r\\n이 된다. newline="" 이 그 변환을 끈다.' },
    { q: '서울 서버가 datetime.now()로 저장한 주문 시각을 미국 서버가 UTC로 읽어 9시간 어긋났다. 바른 고침은?',
      o: ['읽는 쪽에서 9시간을 빼 준다', 'strftime 포맷을 ISO로 바꾼다', '저장할 때 datetime.now(timezone.utc)로 만들어 오프셋까지 담는다'], a: 2,
      why: 'naive 값은 어느 지역 시각인지 정보가 없다. UTC aware로 저장하면 isoformat에 +00:00이 붙어 어디서 읽어도 같은 순간이 된다.' },
  ];

  R.page({ title: '객체가 글자가 되는 순간', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
