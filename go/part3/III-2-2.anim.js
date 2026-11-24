/* III-2-2 JSON struct tag — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 Go struct(필드 · 타입 · json 태그) ↔ 오른쪽 JSON 텍스트. 태그에서 키로 선이 이어진다.
 * struct 와 결과 문자열은 STEPS 의 beat 데이터(struct, result)에서 읽는다. 결과는 encoding/json 문서의 규칙으로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, pill, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 14.5, fill: MUT, opacity: op ?? 1 }, a || {}));

  const SX = 30, SW = 450, JX = 510, JW = 420, RY = 136, RS = 50;
  const rowY = (i) => RY + i * RS;
  function tagCol(tag) { return tag === '-' || tag === '무시됨' ? BAD : /omitempty/.test(tag) ? WARN : tag === '-,' ? WARN : ACC; }
  // 결과 문자열을 JSON 줄과 꼬리말로 나눈다
  function parseResult(res) { const [main, tail] = String(res || '').split(/\s+←\s*/); let obj = null; try { obj = JSON.parse(main); } catch (e) { obj = null; }
    return { main: main.trim(), tail: tail || null, obj }; }
  function jsonLines(obj) { if (obj && typeof obj === 'object' && !Array.isArray(obj)) { const ks = Object.keys(obj);
      return ['{'].concat(ks.map((k, i) => `  "${k}": ${JSON.stringify(obj[k]).replace(/,/g, ',')}${i < ks.length - 1 ? ',' : ''}`), ['}']); }
    return [JSON.stringify(obj)]; }
  // 왼쪽 struct 판. o.vals 값(필드 아래 작은 글씨), o.cross 줄 번호들, o.hot 강조 줄, o.n 보일 줄 수
  function structCard(st, o) { o = o || {}; const n = o.n ?? st.fields.length;
    zone(SX, 70, SW, 310, `type ${st.name} struct`, { fill: PANEL, stroke: INK, sw: 2, color: INK });
    tx(SX + 16, 114, '필드', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(SX + 170, 114, '타입', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(SX + 290, 114, 'json 태그', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const ends = [];
    st.fields.forEach(([f, ty, tag], i) => { const s = clamp(n - i); if (s <= 0) return; const y = rowY(i) + 8, col = tagCol(tag), lower = /^[a-z]/.test(f);
      if (o.hot === i) el('rect', { x: SX + 6, y: y - 26, width: SW - 12, height: 46, rx: 8, fill: o.hotBg || ACCBG });
      mono(SX + 16, y, f, { 'font-size': 15, 'font-weight': 700, fill: lower ? MUT : INK, opacity: s });
      mono(SX + 170, y, ty, { 'font-size': 14, fill: MUT, opacity: s });
      const w = tw(tag, 14) + 20; card(SX + 290 + w / 2, y - 5, w, 28, { rx: 14, stroke: col, sw: 1.8, text: tag, mono: true, fs: 14, color: col, s: R.spring(s) });
      ends.push([i, SX + 290 + w, y - 5, tag]);
      if (o.vals && o.vals[i] != null) mono(SX + 16, y + 19, o.vals[i], { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: o.valOp ?? 1 });
      if (o.cross && o.cross.includes(i)) { el('line', { x1: SX + 12, y1: y - 5, x2: SX + 280, y2: y - 5, stroke: BAD, 'stroke-width': 2.5, opacity: o.crossOp ?? 1 }); } });
    return ends; }
  // 오른쪽 JSON 판. 키 줄의 y 를 돌려준다. o.f 나타나는 정도, o.hot 키 강조
  function jsonCard(res, o) { o = o || {}; const p = parseResult(res), f = o.f ?? 1, title = o.title || 'json.Marshal 결과';
    zone(JX, 70, JW, 310, title, { fill: SOFT });
    const keyY = {};
    if (p.obj && typeof p.obj === 'object') { const L = jsonLines(p.obj);
      L.forEach((s, i) => { const op = clamp(f * L.length - i); if (op <= 0) return; const y = 122 + i * 30, m = s.match(/^\s+"([^"]*)"/), hot = m && o.hot && o.hot.includes(m[1]);
        if (m) keyY[m[1]] = y - 5;
        if (hot) el('rect', { x: JX + 8, y: y - 21, width: JW - 16, height: 28, rx: 6, fill: o.hotBg || GOODBG, opacity: op });
        mono(JX + 18, y, s, { 'font-size': Math.max(13.5, Math.min(14.5, (JW - 30) / (s.length * 0.6))), 'font-weight': m ? 700 : 400, fill: hot ? (o.hotCol || GOOD) : INK, opacity: op }); }); }
    else { const err = /^error/.test(p.main), plain = /^\(/.test(p.main);
      const words = p.main.length > 40 ? [p.main.slice(0, p.main.lastIndexOf(' ', 40)), p.main.slice(p.main.lastIndexOf(' ', 40) + 1)] : [p.main];
      words.forEach((s, i) => mono(JX + 18, 140 + i * 28, s, { 'font-size': 15, 'font-weight': 700, fill: err ? BAD : plain ? MUT : INK, opacity: f })); }
    if (p.tail && o.tail !== false) note(JX + 18, 364, '← ' + p.tail, fade(o.u ?? 3, o.tailAt ?? 1.2), { fill: o.tailCol || INK, 'font-weight': 700 });
    return keyY; }
  // 태그 → 키 연결선
  function links(ends, keyY, u, at) { ends.forEach(([i, x, y, tag], j) => { const key = tag.split(',')[0]; if (!(key in keyY)) return; const g = E(u, at + j * 0.15, at + 0.5 + j * 0.15);
    if (g <= 0) return; el('line', { x1: x + 4, y1: y, x2: lerp(x + 4, JX + 10, g), y2: lerp(y, keyY[key], g), stroke: tagCol(tag), 'stroke-width': 1.6, 'stroke-dasharray': '4 4', opacity: 0.8 }); }); }
  // 빠지는 키: JSON 판 안에서 아래로 떨어지며 사라진다
  function drop(keys, u, at) { keys.forEach((k, i) => { const g = E(u, at + i * 0.2, at + 0.9 + i * 0.2), y = 240 + i * 30 + g * 60;
    if (g >= 1) return; const op = 1 - g; mono(JX + 18, y, `"${k}": …`, { 'font-size': 14.5, fill: BAD, opacity: op, 'text-decoration': 'line-through' }); });
    if (u > at + 1) { tx(JX + 18, 330, '빠진 키: ' + keys.join(', '), { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, at + 1) }); } }
  function bytesFlow(u, at, rev) { for (let i = 0; i < 6; i++) { const a = [SX + SW + 2, 220], b = [JX - 2, 220]; dot(rev ? [b, a] : [a, b], seg(u, at + i * 0.12, at + 0.5 + i * 0.12), rev ? INFO : ACC, 5); } }

  // ---------- 1. 기본 태그 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 2) { structCard(b.struct, { vals: ['1', '"Alice"', '"a@x.com"'], valOp: fade(u, 0.3) }); jsonCard(b.result);
      note(SX, 400, '태그는 값이 아니다 · 리플렉션이 읽는 변환 규칙이다', fade(u, 1.2), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const ends = structCard(b.struct, { vals: ['1', '"Alice"', '"a@x.com"'] }); bytesFlow(u, 0.2);
      const ky = jsonCard(b.result, { f: E(u, 0.6, 1.6) }); links(ends, ky, u, 1.5);
      note(SX, 400, 'json.Marshal(u) 은 []byte 를 준다 · 출력은 string(b)', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { const ends = structCard(b.struct, { vals: ['2', '"Bob"', '"b@x.com"'], valOp: fade(u, 1.3) });
      const ky = jsonCard('{"id":2,"name":"Bob","email_address":"b@x.com"}', { title: 'raw (들어온 JSON)' }); links(ends, ky, u, 0.2); bytesFlow(u, 0.6, true);
      note(SX, 400, 'json.Unmarshal(raw, &u2)  →  ' + parseResult(b.result).main, fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    const ends = structCard(b.struct, { n: k === 1 ? 2 + E(u, 0.2, 0.8) : k === 0 ? 2 * E(u, 0.1, 0.9) : 3, cross: k === 5 ? [2] : null, crossOp: fade(u, 0.8) });
    const ky = jsonCard(b.result, { f: k === 0 ? E(u, 0.8, 1.6) : 1, u, tailCol: BAD }); links(ends, ky, u, k === 1 ? 0.8 : k === 0 ? 1.4 : 0.1);
    if (k === 0) note(SX, 400, '태그가 없으면 키는 "ID", "Name" 그대로 나간다', fade(u, 2.0), { fill: INK, 'font-weight': 700 });
    if (k === 1) note(SX, 400, '외부 API 의 키 이름에 맞출 때 쓴다', fade(u, 1.6), { fill: INK, 'font-weight': 700 });
    if (k === 5) note(SX, 400, '첫 글자가 소문자면 export 되지 않아 태그와 상관없이 빠진다', fade(u, 1.2), { fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. omitempty ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { const ends = structCard(b.struct, { n: 2 * E(u, 0.1, 0.8) }); const ky = jsonCard(b.result, { f: E(u, 0.6, 1.4) }); links(ends, ky, u, 1.2);
      note(SX, 400, '기본은 값이 비어 있어도 키를 낸다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { structCard(b.struct, { n: 2 + 3 * E(u, 0.2, 1.4) }); jsonCard(b.result);
      note(SX, 400, '형식은 json:"이름,옵션" · 쉼표 앞뒤에 공백을 넣지 않는다', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const ends = structCard(b.struct, { vals: ['1', '"Alice"', '""', '0', 'nil'] }); const ky = jsonCard(b.result, { u, tail: false }); links(ends, ky, u, 0.1);
      drop(['phone', 'age', 'tags'], u, 0.6); note(SX, 400, '"", 0, nil 은 모두 제로값이라 키가 빠진다', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const ends = structCard(b.struct, { vals: ['2', '"Bob"', '"010"', '30', '["vip"]'] }); const ky = jsonCard(b.result, { f: E(u, 0.2, 1.4), hot: ['phone', 'age', 'tags'] }); links(ends, ky, u, 1.2);
      note(SX, 400, '같은 타입인데 값에 따라 키 집합이 달라진다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { const ends = structCard(b.struct, { vals: ['3', '"Baby"', '0'], hot: 2, hotBg: BADBG }); const ky = jsonCard(b.result, { u, tailCol: BAD }); links(ends, ky, u, 0.1);
      drop(['age'], u, 0.4); note(SX, 400, '나이 0 과 입력 안 함을 구분할 수 없다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); return; }
    // k === 5: *int
    const ends = structCard(b.struct, { vals: ['3', null] }); const ky = jsonCard(b.result, { f: E(u, 1.4, 2.0), hot: ['age'], u, tailAt: 2.0 }); links(ends, ky, u, 1.9);
    const y = rowY(1) + 27; grow(SX + 40, y, SX + 120, y, E(u, 0.3, 0.8), ACC); card(SX + 150, y, 52, 30, { rx: 6, stroke: ACC, sw: 2, text: '0', mono: true, fs: 15, color: ACC, s: pop(u, 0.8) });
    mono(SX + 190, y + 5, '포인터가 가리키는 값', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
    note(SX, 400, '제로값이 nil 이 되므로 0 은 정상 값으로 나간다', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); }

  // ---------- 3. "-" · "-," · 중첩 · 임베딩 ----------
  function wall(x, y0, y1, op) { for (let y = y0; y < y1; y += 14) el('rect', { x, y, width: 10, height: 11, rx: 2, fill: BAD, opacity: op }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { const ends = structCard(b.struct, { vals: ['30', '"Seoul"'] }); const ky = jsonCard(b.result, { f: E(u, 0.4, 1.2) }); links(ends, ky, u, 1.0);
      note(SX, 400, '다른 struct 의 필드가 되면 그대로 중첩 객체가 된다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const ends = structCard(b.struct, { vals: ['1', '"Alice"', '"secret"'], hot: 2, hotBg: BADBG }); const ky = jsonCard(b.result, { u, tailCol: BAD }); links(ends, ky, u, 0.1);
      wall(JX - 18, rowY(2) - 20, rowY(2) + 20, fade(u, 0.4)); fly(SX + 360, rowY(2) + 3, JX - 30, rowY(2) + 3, seg(u, 0.6, 1.1), 'secret', { fill: BAD });
      note(SX, 400, 'DB 모델을 그대로 응답할 때 민감 필드를 막는다', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const ends = structCard(b.struct, { hot: 2, hotBg: WARNBG }); const ky = jsonCard(b.result, { hot: ['-'], hotCol: WARN, hotBg: WARNBG }); links(ends, ky, u, 0.3);
      wall(JX - 18, rowY(1) - 20, rowY(1) + 20, 1);
      note(SX, 400, '쉼표 하나로 무시가 아니라 "-" 라는 키가 된다 · 값이 비어도 나간다', fade(u, 1.2), { fill: WARN, 'font-weight': 700 }); return; }
    if (k === 3) { const ends = structCard(b.struct, { n: 2 * E(u, 0.1, 0.9) }); const ky = jsonCard(b.result, { f: E(u, 0.8, 1.6) }); links(ends, ky, u, 1.4);
      note(SX, 400, '여러 모델이 같이 쓰는 필드를 한 타입으로 모은다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 4 || k === 6) { const ends = structCard(b.struct, { hot: 2 }); const ky = jsonCard(b.result, { f: k === 4 ? 1 : E(u, 0.2, 1.4), hot: ['created_at', 'updated_at'] }); links(ends, ky, u, 1.0);
      const f = E(u, 0.3, 1.1); ['created_at', 'updated_at'].forEach((s, i) => { const y = rowY(2) + 30 + i * 30, x = SX + 60 + i * 140;
        card(x + 60, lerp(rowY(2) + 3, y, f), 130, 26, { rx: 13, stroke: ACC, sw: 1.6, text: s, mono: true, fs: 13.5, color: ACC, op: f }); });
      note(SX, 400, k === 4 ? '필드 이름 없이 타입만 쓰면 안쪽 필드가 바깥으로 펼쳐진다' : '"audit" 라는 키는 어디에도 없다', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); return; }
    // k === 5: User 실제 출력
    const ends = structCard(b.struct, { vals: ['1', '"Alice"', '"secret"', '""', '{30 Seoul}'], hot: 3, hotBg: WARNBG }); const ky = jsonCard(b.result, { f: E(u, 0.2, 1.4), hot: ['-'], hotCol: WARN, hotBg: WARNBG }); links(ends, ky, u, 1.2);
    wall(JX - 18, rowY(2) - 20, rowY(2) + 20, 1);
    note(SX, 400, 'Password 는 값이 있어도 빠지고, Internal 은 빈 값이어도 "-" 로 나간다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); }

  // ---------- 4. time.Time · time.Duration ----------
  function pipe(items, u, at, y) { let x = 40; items.forEach(([s, col, lab], i) => { const w = tw(s, 15) + 28, cx = x + w / 2, a = at + i * 0.45;
    card(cx, y, w, 46, { rx: 10, stroke: col || INK, sw: 2.2, text: s, mono: true, fs: 15, color: col || INK, s: pop(u, a) });
    if (lab) note(cx, y + 44, lab, fade(u, a + 0.2), { 'text-anchor': 'middle', 'font-size': 13.5 });
    if (i < items.length - 1) grow(x + w + 4, y, x + w + 40, y, E(u, a + 0.2, a + 0.45), MUT); x += w + 44; }); }
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0 || k === 6) { const ends = structCard(b.struct, { vals: ['1', k === 6 ? 'time.Now().UTC()' : null] }); const ky = jsonCard(b.result, { f: E(u, 0.4, 1.4), title: k === 6 ? 'json.Marshal 결과 (시각은 예시)' : 'json.Marshal 결과' }); links(ends, ky, u, 1.2);
      note(SX, 400, k === 0 ? 'time.Time 은 MarshalJSON 을 이미 갖고 있다 · RFC 3339 문자열' : '실행할 때마다 다르고 초 아래 자릿수까지 붙는다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const ends = structCard(b.struct, { vals: ['"build"', '5 * time.Minute'], hot: 1, hotBg: WARNBG }); const ky = jsonCard(b.result, { hot: ['timeout'], hotCol: WARN, hotBg: WARNBG, u, tailCol: WARN }); links(ends, ky, u, 0.2);
      mono(SX, 404, '5 × 60 × 1,000,000,000 = 300,000,000,000 ns', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { tx(40, 90, 'func (d Duration) MarshalJSON() ([]byte, error)', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      pipe([['Duration(5m)'], ['.String()', INFO], ['5m0s', ACC, '따옴표 없는 Go 문자열'], ['json.Marshal(s)', INFO], ['"5m0s"', GOOD, 'JSON 문자열 (따옴표 포함)']], u, 0.3, 180);
      note(40, 320, 'json.Marshal 을 거쳐야 따옴표와 이스케이프가 정확히 붙는다', fade(u, 2.3), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { tx(40, 90, 'func (d *Duration) UnmarshalJSON(data []byte) error', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      pipe([['data = "5m0s"', INFO, '따옴표까지 들어온다'], ['json.Unmarshal(data, &s)', INFO], ['s = 5m0s', ACC, '이제 Go 문자열']], u, 0.3, 180);
      note(40, 320, '값을 바꿔야 하므로 리시버는 반드시 포인터 *Duration', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { tx(40, 90, 'parsed, err := time.ParseDuration(s)', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      pipe([['s = 5m0s', ACC], ['ParseDuration', INFO], ['300000000000', WARN, 'ns'], ['*d = Duration(…)', GOOD, '호출자의 값이 채워진다']], u, 0.3, 180);
      card(480, 340, 560, 46, { rx: 23, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 2.2), text: '"5분" 처럼 틀린 문자열 → err 를 그대로 돌려준다', fs: 14.5, color: BAD }); return; }
    // k 5, 7: Job 에 꽂기 · 출력
    const ends = structCard(b.struct, { vals: ['"build"', 'Duration(5 * time.Minute)'], hot: 1 }); const ky = jsonCard(b.result, { f: k === 7 ? E(u, 0.4, 1.4) : 1, hot: ['timeout'] }); links(ends, ky, u, k === 7 ? 1.2 : 0.4);
    if (k === 5) { pill(SX + 300, 400, 'MarshalJSON · UnmarshalJSON 자동 적용', GOOD, pop(u, 1.0), { fs: 14 }); }
    else note(SX, 400, '300000000000 대신 "5m0s" 가 나간다', fade(u, 1.8), { fill: GOOD, 'font-weight': 700 }); }

  // ---------- 5. Marshaler / Unmarshaler ----------
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { structCard(b.struct, { n: 3 * E(u, 0.2, 1.4) });
      const n = Math.min(2, Math.floor(seg(u, 0.2, 1.6) * 3)); card(SX + 380, rowY(n) + 3, 80, 30, { rx: 15, fill: INFO, stroke: 'none', text: 'iota=' + n, mono: true, fs: 13.5, color: PANEL });
      jsonCard(b.result, { u, tailCol: WARN, title: 'Task 를 Marshal 하면' }); note(SX, 400, '상수 사이에 새 값을 끼우면 뒤 번호가 밀린다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { structCard(b.struct); jsonCard(b.result, { f: E(u, 1.4, 2.0), title: 'Task 를 Marshal 하면' });
      [0, 1, 2].forEach((i) => grow(SX + SW - 10, rowY(i) + 3, JX + 14, 220, E(u, 0.3 + i * 0.3, 0.8 + i * 0.3), i === 1 ? ACC : OFF));
      note(SX, 400, '돌려주는 값은 완성된 JSON 조각 · 따옴표까지 직접 넣는다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { structCard(b.struct, { hot: 0, hotBg: BADBG }); jsonCard(b.result, { u, tailCol: BAD, title: 'json.Marshal 결과' });
      cross(JX + JW - 40, 140, 12, pop(u, 0.6)); note(SX, 400, 'switch 에 없는 값은 error · 잘못된 응답이 나가지 않는다', fade(u, 1.4), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { structCard(b.struct); jsonCard(b.result, { u, title: '들어온 data' });
      fly(JX + 60, 140, SX + 330, rowY(0) + 3, seg(u, 0.4, 1.1), '"done"', { mono: true, fill: INFO });
      note(SX, 400, '포인터 리시버여야 원본 값을 바꿀 수 있다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { structCard(b.struct, { hot: u > 1.2 ? 2 : null, hotBg: GOODBG }); jsonCard(b.result, { u, title: '결과' });
      card(SX + 300, 400, 380, 34, { rx: 17, stroke: BAD, sw: 2, fill: BADBG, text: '"dnoe" → unknown status: dnoe', mono: true, fs: 14, color: BAD, s: pop(u, 1.8) });
      return; }
    // k 5, 6, 7: Task
    const vals = k === 7 ? ['2', 'StatusDone'] : ['1', 'StatusActive'];
    const ends = structCard(b.struct, { vals, hot: 1 });
    if (k === 7) { const p = parseResult(b.result); jsonCard('{"id":2,"status":"done"}', { title: 'raw (들어온 JSON)' }); bytesFlow(u, 0.3, true);
      note(SX, 400, 'fmt.Printf("%+v") 출력: ' + p.main, fade(u, 1.4), { fill: INK, 'font-weight': 700 }); return; }
    const ky = jsonCard(b.result, { f: k === 6 ? E(u, 0.3, 1.3) : 1, hot: ['status'], u, tailCol: INK }); links(ends, ky, u, k === 6 ? 1.0 : 0.3);
    if (k === 5) note(SX, 400, '필드 타입이 Status 라서 두 메서드가 자동으로 쓰인다', fade(u, 1.2), { fill: INK, 'font-weight': 700 });
    else note(SX, 400, '내부 값은 1, 밖으로는 "active"', fade(u, 1.6), { fill: GOOD, 'font-weight': 700 }); }

  const quiz = [
    { q: 'type T struct { secret string `json:"secret"` }를 Marshal하면 결과는 무엇인가?',
      o: ['{"secret":"…"}', '{}', '컴파일 에러'], a: 1,
      why: '소문자로 시작하는 필드는 export되지 않아 encoding/json이 볼 수 없다. 태그가 있어도 빠진다.' },
    { q: 'Age int `json:"age,omitempty"`에 0을 넣고 Marshal하면 어떻게 되나?',
      o: ['"age":0이 나간다', '"age":null이 나간다', 'age 키가 통째로 빠진다'], a: 2,
      why: 'omitempty는 값이 아니라 제로값인지를 본다. int의 제로값이 0이라 키가 빠진다. 0을 보내려면 *int로 바꾼다.' },
    { q: 'Internal string `json:"-,"`인 필드에 값을 넣지 않고 Marshal하면 무엇이 나가나?',
      o: ['"-":"" 키가 나간다', '아무 키도 나가지 않는다', '"internal":"" 키가 나간다'], a: 0,
      why: '쉼표가 붙은 "-,"는 무시 지시가 아니라 키 이름 "-"다. omitempty가 없으니 빈 문자열이어도 나간다.' },
    { q: 'Timeout time.Duration 필드에 5 * time.Minute을 넣고 Marshal하면 무엇이 나가나?',
      o: ['"timeout":300000000000', '"timeout":"5m0s"', '"timeout":5'], a: 0,
      why: 'time.Duration은 나노초 int64라서 숫자 그대로 나간다. "5m0s"를 원하면 별칭 타입에 MarshalJSON을 단다.' },
    { q: 'Status(9)처럼 정의 밖 값을 가진 Task를 Marshal하면 어떻게 되나?',
      o: ['"status":9가 나간다', 'json.Marshal이 error를 돌려준다', '"status":"pending" 이 나간다'], a: 1,
      why: 'MarshalJSON의 switch에 걸리지 않아 invalid status 에러를 돌려주고, json.Marshal 전체가 실패한다.' },
  ];

  const summary = [
    '필드 옆 json 태그가 JSON 키 이름을 정하고, 소문자 필드는 태그가 있어도 빠진다.',
    'omitempty는 제로값이면 키를 뺀다. 0이나 false를 보내야 하면 포인터로 바꾼다.',
    'json:"-"는 항상 빠지고 "-,"는 "-"라는 키가 된다. 이름 없이 임베딩하면 필드가 펼쳐진다.',
    'Duration은 숫자로 나가므로 MarshalJSON과 UnmarshalJSON을 직접 달아 문자열로 바꾼다.',
  ];
  const review = [
    { q: '회원 API 응답에 password_hash가 그대로 보였다. DB 모델을 바꾸지 않고 가장 빨리 막는 방법은?',
      o: ['필드에 omitempty를 붙인다', '필드 태그를 json:"-"로 바꾼다', '필드 태그를 json:"-,"로 바꾼다'], a: 1,
      why: 'json:"-"는 값이 있어도 항상 뺀다. omitempty는 값이 있으면 그대로 내보내고, "-,"는 "-"라는 키로 내보낸다.' },
    { q: '설정 API에서 retries를 0으로 보냈는데 응답에 retries 키가 없다. 먼저 확인할 것은?',
      o: ['Retries int에 omitempty가 붙어 있는지', 'Retries가 임베딩된 타입인지', 'MarshalJSON이 포인터 리시버인지'], a: 0,
      why: 'omitempty는 0을 빈 값으로 본다. 0이 의미 있는 값이면 *int로 바꾸거나 omitempty를 뺀다.' },
    { q: '{"status":"dnoe"}를 받았더니 에러 없이 Pending으로 저장됐다. UnmarshalJSON에서 고칠 곳은?',
      o: ['리시버를 값 리시버로 바꾼다', 'json.Unmarshal(data, &str)을 지운다', 'switch의 default에서 error를 돌려준다'], a: 2,
      why: '모르는 문자열을 거절하지 않으면 제로값 0(Pending)이 그대로 남는다. default에서 error를 돌려줘야 오타가 드러난다.' },
  ];

  R.page({ title: 'struct ↔ JSON', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
