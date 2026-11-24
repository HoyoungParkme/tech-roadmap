/* I-2-2 OutputParser — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 왼쪽 원문 → 가운데 검사대(파서) → 오른쪽 결과. STEPS 의 raw · parser · parsed 를 읽는다.
 * 파서 동작(펜스 제거, "1991" → 1991, 실패 시 OutputParserException, format_instructions 문구, partial 후 input_variables)은
 * langchain-core 1.8.4 + pydantic 2 로 실행해 확인했다. 모델 답과 with_structured_output 결과는 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, spans, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op) => pill(x, y, '예시', MUT, 1, { fs: 13.5, op });
  const typed = (s, f) => (f >= 1 ? s : s.slice(0, Math.round(s.length * clamp(f))));
  // 검사대(파서): 가운데 문
  function gate(name, o) { o = o || {}; const x = 480, y = o.y || 180, col = o.col || ACC, s = o.s ?? 1; if (s <= 0) return;
    const g = R.G(x, y, s);
    el('rect', { x: -96, y: -70, width: 192, height: 140, rx: 14, fill: o.none ? PANEL : o.bg || ACCBG, stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': o.none ? '7 5' : null }, g);
    el('line', { x1: -96, y1: -36, x2: 96, y2: -36, stroke: col, 'stroke-width': 1.6, opacity: o.none ? 0.4 : 1 }, g);
    tx(0, -46, o.none ? '(파서 없음)' : '검사대', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col }, g);
    const parts = String(name).replace(/(.)(OutputParser)$/, '$1|$2').split('|');
    parts.slice(0, 3).forEach((p, i) => tx(0, -4 + i * 20, p, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: o.none ? MUT : INK }, g)); }
  // 원문 상자 (줄 목록)
  function rawBox(lines, o) { o = o || {}; const x = 24, y = o.y || 70, w = o.w || 300, h = o.h || 220, f = o.f ?? 1;
    zone(x, y, w, h, o.title || 'LLM 원문', { fill: PANEL, stroke: GRID, sw: 1.5 });
    const n = Math.ceil(lines.length * f);
    lines.slice(0, n).forEach((ln, i) => { const [s, col, strike] = Array.isArray(ln) ? ln : [ln]; tx(x + 14, y + 50 + i * 21, s, { 'font-size': 13.5, class: 'mono', fill: col || INK, 'text-decoration': strike ? 'line-through' : null }); }); }
  const FENCE = ['```json', '{', '  "name": "Python",', '  "year": 1991,', '  "pros": ["읽기 쉬움", "라이브러리"],', '  "cons": ["속도 느림", "GIL"]', '}', '```'];
  const PROSE = ['Python은 1991년 귀도 반 로섬이', '만든 범용 프로그래밍 언어입니다.', '장점은 읽기 쉽고 라이브러리가', '풍부하다는 점이며, 단점으로는', '실행 속도가 느리고 GIL 제약이', '있습니다.'];
  const FIELDS = [['name', 'str', '"Python"'], ['year', 'int', '1991'], ['pros', 'list[str]', '["읽기 쉬움", "라이브러리"]'], ['cons', 'list[str]', '["속도 느림", "GIL"]']];
  // 결과 객체 (필드 줄). st(i) → {ok, val, op}
  function objBox(title, st, o) { o = o || {}; const x = o.x || 636, y = o.y || 70, w = o.w || 300;
    zone(x, y, w, 40 + FIELDS.length * 44, title, { fill: o.fill || PANEL, stroke: o.stroke || ACC, sw: 2 });
    FIELDS.forEach(([n, ty, v], i) => { const s = st ? st(i) : {}, yy = y + 56 + i * 44; if (s.op === 0) return;
      mono(x + 14, yy, n, { 'font-size': 14, 'font-weight': 800, opacity: s.op ?? 1 }); mono(x + w - 12, yy, ty, { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', opacity: s.op ?? 1 });
      tx(x + 14, yy + 19, s.val != null ? s.val : v, { 'font-size': 13.5, class: 'mono', fill: s.val === '' ? MUT : INK, opacity: s.op ?? 1 });
      if (s.ok === true) check(x + w - 22, yy + 14, 7, 1); if (s.ok === false) cross(x + w - 22, yy + 14, 6, 1); }); }
  const arrow = (u, a, b) => { grow(328, 180, 380, 180, seg(u, a, a + 0.3), MUT); grow(580, 180, 630, 180, seg(u, b, b + 0.3), ACC); };

  // ---------- 1. 파서 없이 ----------
  function s1(t, c) { const { k, u } = c;
    gate('', { none: true, col: BAD });
    card(170, 110, 260, 52, { rx: 10, stroke: INK, s: k === 0 ? pop(u, 0.2) : 1 }); mono(170, 116, 'ChatOpenAI(gpt-4o-mini)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.4) : 1 });
    if (k === 0) { note(480, 330, '체인에 파서 자리가 아예 없다', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { card(170, 220, 260, 70, { rx: 10, stroke: INFO, fill: INFOBG, s: pop(u, 0.3) });
      mono(170, 214, 'AIMessage(', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.5) }); mono(170, 236, 'content="Python은 …")', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      fly(170, 220, 760, 180, seg(u, 0.9, 1.7), 'AIMessage 그대로', { fill: INFO, stay: true });
      mono(760, 240, 'response["name"]', { 'font-size': 14, opacity: fade(u, 1.8) }); mono(760, 264, '→ TypeError', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      note(480, 360, '문자열이 아니라 객체다. 매번 .content로 꺼내야 한다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    // k 2~4: 산문
    zone(24, 150, 330, 180, '.content (str)', { fill: PANEL, stroke: GRID, sw: 1.5 });
    PROSE.forEach((s, i) => tx(38, 196 + i * 22, typed(s, k === 2 ? seg(u, 0.3 + i * 0.25, 0.6 + i * 0.25) : 1), { 'font-size': 14 }));
    if (k === 2) { ex(310, 342, fade(u, 1.0)); note(760, 200, '형식이 정해지지 않은', fade(u, 1.8), { 'text-anchor': 'middle' }); note(760, 226, '산문 한 덩어리', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 3) { [['data["name"]', 'str에는 키가 없다'], ['re.search(r"(\\d{4})년")', '"1991년" 표현이 바뀌면 실패'], ['.split("장점은")', '모델이 "좋은 점은"이라 쓰면 실패']].forEach(([a, z], i) => {
        const y = 110 + i * 70, s = pop(u, 0.3 + i * 0.5); card(770, y, 320, 54, { rx: 10, stroke: BAD, fill: BADBG, s });
        if (s > 0.4) { mono(624, y - 4, a, { 'font-size': 13.5, 'font-weight': 700 }); tx(624, y + 17, z, { 'font-size': 13.5, fill: BAD }); } });
      el('rect', { x: 36, y: 228, width: 70, height: 20, rx: 3, fill: WARN, opacity: 0.3 * fade(u, 1.2) });
      return; }
    // k 4: 원하는 모양
    grow(360, 240, 610, 240, seg(u, 0.3, 0.9), ACC);
    zone(620, 140, 310, 210, '필요한 것: dict · 객체', { fill: ACCBG, stroke: ACC, sw: 2, op: fade(u, 0.8) });
    ['name', 'year', 'pros', 'cons'].forEach((n, i) => { const s = pop(u, 1.0 + i * 0.2); card(775, 190 + i * 38, 270, 30, { rx: 6, stroke: ACC, dash: '4 3', s }); if (s > 0.4) mono(652, 195 + i * 38, n + ': …', { 'font-size': 14, fill: ACC }); });
    note(480, 400, '다음 단계는 JsonOutputParser', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  // ---------- 2. JsonOutputParser ----------
  function s2(t, c) { const { k, u } = c;
    gate('JsonOutputParser', { s: k === 0 ? pop(u, 0.4) : 1 });
    if (k === 0) { ['JsonOutputParser', 'ChatPromptTemplate'].forEach((s, i) => pill(200 + i * 560, 330, s, ACC, pop(u, 0.2 + i * 0.3), { mono: true, fs: 14 })); note(480, 390, '가져오기만 했다. 아직 아무것도 돌지 않았다', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 1) { note(480, 300, 'parser = JsonOutputParser()', fade(u, 0.3), { 'text-anchor': 'middle', class: 'mono' });
      note(480, 336, '스키마를 모른다. 어떤 JSON이든 json.loads로 dict를 만든다', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { zone(24, 280, 912, 100, 'prompt', { fill: SOFT });
      tx(44, 330, typed('{topic} 언어를 JSON 으로 설명해줘. 키: name, year, pros(list), cons(list)', E(u, 0.3, 1.6)), { 'font-size': 15 });
      el('rect', { x: 390, y: 342, width: 380 * fade(u, 1.8), height: 4, fill: WARN });
      note(580, 366, '키 이름을 손으로 적었다', fade(u, 2.0), { 'text-anchor': 'middle', fill: WARN, 'font-size': 14 }); return; }
    if (k === 3) { [['prompt', 160], ['llm', 320], ['parser', 480]].forEach(([s, x], i) => { if (i < 2) card(x, 330, 130, 44, { rx: 10, text: s, fs: 16, mono: true, s: pop(u, 0.2 + i * 0.2) });
        if (i) tx(x - 80, 340, '|', { 'font-size': 30, 'font-weight': 800, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.2) }); });
      grow(400, 312, 470, 258, seg(u, 0.9, 1.3), ACC);
      note(720, 336, 'chain = prompt | llm | parser', fade(u, 1.3), { 'text-anchor': 'middle', class: 'mono' }); return; }
    // k 4~6: 실제 흐름
    if (k <= 5) { const strike = k >= 4 && (k > 4 || u > 1.4);
      rawBox(FENCE.map((s, i) => [s, i === 0 || i === 7 ? BAD : INK, strike && (i === 0 || i === 7)]), { f: k === 4 ? E(u, 0.2, 1.0) : 1, h: 230, title: 'LLM 원문 (예시)' });
      arrow(u, k === 4 ? 1.0 : 0, k === 4 ? 2.0 : 0);
      if (k === 4) { note(480, 300, '펜스 ```json 을 잘라 낸다', fade(u, 1.5), { 'text-anchor': 'middle', fill: BAD, 'font-size': 14 }); return; }
      zone(636, 70, 300, 230, "type: dict", { fill: ACCBG, stroke: ACC, sw: 2 });
      [["'name'", "'Python'"], ["'year'", '1991'], ["'pros'", "['읽기 쉬움', '라이브러리']"], ["'cons'", "['속도 느림', 'GIL']"]].forEach(([a, z], i) => {
        const y = 124 + i * 40, hot = i === 2 && u > 1.2; if (hot) el('rect', { x: 644, y: y - 18, width: 284, height: 28, rx: 5, fill: PANEL, stroke: ACC });
        mono(652, y, a + ': ', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2 + i * 0.2) }); mono(712, y, z, { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.2) }); });
      spans(480, 380, [['data["pros"][0]', { 'font-weight': 700 }], ['  →  ', { fill: MUT }], ["'읽기 쉬움'", { fill: ACC, 'font-weight': 800 }]], { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    // k 6: 타입 검증 없음
    rawBox([['{"name": "Python",', INK], [' "year": "1991"}', WARN]], { h: 120, title: 'LLM 원문 (예시)' });
    arrow(u, 0.2, 0.9);
    zone(636, 70, 300, 120, 'type: dict', { fill: WARNBG, stroke: WARN, sw: 2, op: fade(u, 1.0) });
    mono(652, 124, "'name': 'Python'", { 'font-size': 14, opacity: fade(u, 1.1) }); mono(652, 156, "'year': '1991'", { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
    note(480, 300, 'year가 문자열이어도, pros · cons가 빠져도 그대로 통과한다', fade(u, 1.6), { 'text-anchor': 'middle', fill: WARN });
    note(480, 336, '타입을 보는 검사는 없다', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  // ---------- 3. PydanticOutputParser ----------
  function schema(x, y, op, hot) { zone(x, y, 300, 214, 'class LanguageInfo(BaseModel)', { fill: hot ? WARNBG : SOFT, stroke: hot ? WARN : 'none', op });
    FIELDS.forEach(([n, ty], i) => { mono(x + 16, y + 60 + i * 38, n, { 'font-size': 15, 'font-weight': 800, opacity: op }); mono(x + 110, y + 60 + i * 38, ': ' + ty, { 'font-size': 15, fill: INFO, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c, d = c.beat.parsed;
    if (k === 0) { schema(24, 70, fade(u, 0.2)); FIELDS.forEach((f, i) => el('rect', { x: 132, y: 116 + i * 38, width: 120 * E(u, 0.6 + i * 0.25, 1.0 + i * 0.25), height: 3, fill: INFO }));
      note(660, 180, '이름과 타입을 못 박는다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    gate('PydanticOutputParser', { col: INFO, bg: INFOBG, s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { schema(24, 70, 1); fly(180, 180, 470, 200, seg(u, 0.7, 1.4), 'pydantic_object=LanguageInfo', { fill: INFO });
      note(480, 330, '파서가 이 스키마로 검사한다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 2 || k === 6) { const dup = k === 6; schema(24, 70, 1, dup);
      zone(24, 300, 912, 90, 'prompt', { fill: dup ? WARNBG : SOFT, stroke: dup ? WARN : 'none' });
      tx(44, 350, '{topic} 언어를 JSON 으로 설명해줘. 스키마: ', { 'font-size': 15 }); mono(44 + tw('{topic} 언어를 JSON 으로 설명해줘. 스키마: ', 15) - 40, 350, '{{name, year, pros, cons}}', { 'font-size': 15, fill: dup ? WARN : INK, 'font-weight': 700 });
      if (!dup) { sub(740, 330, '{{ }} 는 글자 그대로의 중괄호', fade(u, 1.2), { 'font-size': 14 }); sub(740, 380, "input_variables = ['topic']", fade(u, 1.6), { 'font-size': 14, class: 'mono' }); }
      else { el('path', { d: 'M180,286 C180,300 300,300 300,320', fill: 'none', stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '5 4', opacity: fade(u, 0.6) });
        note(780, 180, '스키마가 두 곳에 있다', fade(u, 1.0), { 'text-anchor': 'middle', fill: WARN }); sub(780, 210, '하나를 고치면 다른 쪽도 손으로', fade(u, 1.5), { 'font-size': 14 }); }
      return; }
    // k 3~5
    rawBox(FENCE, { h: 230, title: 'LLM 원문 (예시)' });
    if (k === 3) { arrow(u, 0.2, 1.0); objBox('LanguageInfo', (i) => ({ ok: u > 1.2 + i * 0.3 ? true : null, op: fade(u, 1.0 + i * 0.3) }), { stroke: INFO });
      note(480, 330, '검사를 통과한 dict가 모델 인스턴스가 된다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { objBox('LanguageInfo', () => ({ ok: true }), { stroke: INFO });
      [['info.name', '"Python"'], ['info.year + 30', '2021']].forEach(([a, z], i) => spans(480, 330 + i * 34, [[a, { 'font-weight': 700 }], ['  →  ', { fill: MUT }], [z, { fill: ACC, 'font-weight': 800 }]], { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.6) }));
      sub(480, 410, 'year가 진짜 int라 더하기가 된다', fade(u, 1.6), { 'font-size': 14 }); return; }
    // k 5: 검증
    [['year: "1991"', '→ 1991 (int로 바꿈)', GOOD], ['year: "천구백"', '→ OutputParserException', BAD], ['pros: null', '→ OutputParserException', BAD]].forEach(([a, z, col], i) => {
      const y = 330 + i * 30; mono(560, y, a, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.5) }); mono(700, y, z, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.5) }); });
    objBox('LanguageInfo', (i) => ({ ok: i === 1 ? true : null }), { stroke: INFO, y: 40, fill: PANEL });
    sub(250, 330, '실패 메시지 안에', fade(u, 2.0), { 'font-size': 14 }); sub(250, 352, 'pydantic ValidationError가 들어 있다', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 4. format_instructions ----------
  const FI = [['The output should be formatted as a JSON instance', INK], ['that conforms to the JSON schema below.', INK], ['As an example, for the schema {"foo": …}', MUT], ['… (foo 예시 설명) …', MUT], ['Here is the output schema:', INK], ['{"properties": {"name": {"description":', INFO], ['  "언어 이름", "title": "Name", "type": "string"},', INFO], ['  "year": {… "type": "integer"}, …},', INFO], [' "required": ["name", "year", "pros", "cons"]}', INFO]];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { schema(24, 70, 1); note(660, 180, 'Step 3과 같은 BaseModel', fade(u, 0.5), { 'text-anchor': 'middle' }); sub(660, 210, '바뀌는 것은 프롬프트를 만드는 방법', fade(u, 1.0), { 'font-size': 14 }); return; }
    if (k === 1) { schema(24, 70, 1); gate('PydanticOutputParser', { col: INFO, bg: INFOBG, s: pop(u, 0.2) });
      note(760, 300, '이 파서가 안내문도 만든다', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k === 2 || k === 3) { mono(24, 86, 'parser.get_format_instructions()', { 'font-size': 15, 'font-weight': 700, fill: INFO });
      zone(24, 100, 640, 300, null, { fill: PANEL, stroke: INFO, sw: 1.6 });
      const n = k === 2 ? E(u, 0.2, 2.2) * FI.length : FI.length;
      FI.forEach(([s, col], i) => { const f = clamp(n - i); if (f <= 0) return; tx(40, 130 + i * 29, typed(s, f), { 'font-size': 14, class: 'mono', fill: col }); });
      if (k === 3) { [['맨 앞', '형식 지시'], ['가운데', 'foo로 든 예시'], ['끝', '우리 스키마 · required']].forEach(([a, z], i) => { const y = [145, 218, 320][i], s = pop(u, 0.3 + i * 0.4);
          card(800, y, 230, 50, { rx: 10, stroke: i === 2 ? INFO : GRID, s }); if (s > 0.4) { tx(700, y + 5, a, { 'font-size': 14, 'font-weight': 800 }); tx(760, y + 5, z, { 'font-size': 14, fill: i === 2 ? INFO : MUT }); } });
        sub(800, 380, 'description까지 스키마에서 나온다', fade(u, 1.8), { 'font-size': 14 }); }
      return; }
    if (k === 4 || k === 5) { zone(24, 70, 912, 120, 'prompt', { fill: SOFT });
      tx(44, 116, '', {}); const x1 = 44; el('rect', { x: x1, y: 98, width: 70, height: 26, rx: 5, fill: PANEL, stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '4 3' }); mono(x1 + 8, 116, '{topic}', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
      tx(x1 + 80, 116, '언어를 설명해줘.', { 'font-size': 15 });
      const filled = k === 5 && u > 1.0; el('rect', { x: x1, y: 140, width: filled ? 600 : 200, height: 30, rx: 5, fill: filled ? INFOBG : PANEL, stroke: INFO, 'stroke-width': 1.8, 'stroke-dasharray': filled ? null : '4 3' });
      mono(x1 + 8, 160, filled ? 'The output should be formatted as a JSON instance …' : '{format_instructions}', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
      if (k === 4) { note(480, 260, '안내문 자리만 비워 둔다. 스키마 문장을 손으로 쓰지 않는다', fade(u, 1.0), { 'text-anchor': 'middle' }); return; }
      fly(250, 300, 300, 155, seg(u, 0.3, 1.0), 'prompt.partial(format_instructions=…)', { fill: INFO });
      [["['format_instructions', 'topic']", 0], ["['topic']", 1]].forEach(([s, i]) => { const y = 290 + i * 40; tx(300, y, i ? 'partial 뒤' : 'partial 앞', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.2 + i * 0.5) });
        mono(320, y, 'input_variables = ' + s, { 'font-size': 14, fill: i ? ACC : MUT, 'font-weight': i ? 800 : 400, opacity: fade(u, 1.2 + i * 0.5) }); });
      sub(480, 400, '실행할 때는 topic만 넘긴다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 6) { rawBox(FENCE, { h: 230, title: 'LLM 원문 (예시)' }); gate('PydanticOutputParser', { col: INFO, bg: INFOBG }); arrow(u, 0.2, 1.0);
      objBox('LanguageInfo', (i) => ({ ok: u > 1.2 + i * 0.2 ? true : null, op: fade(u, 1.0 + i * 0.2) }), { stroke: INFO });
      note(480, 330, '모델이 스키마 문서를 읽고 답하니 검사를 거의 통과한다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    // k 7: 한 곳만 고친다
    schema(24, 70, 1); const add = E(u, 0.3, 0.9);
    el('rect', { x: 40, y: 270, width: 268 * add, height: 30, rx: 5, fill: ACCBG, stroke: ACC }); if (add > 0.9) mono(56, 290, 'paradigm: str', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    ex(300, 318, fade(u, 0.9));
    grow(330, 280, 450, 200, seg(u, 1.0, 1.4), ACC); card(560, 190, 220, 56, { rx: 10, text: 'get_format_instructions()', fs: 13.5, mono: true, stroke: INFO, s: pop(u, 1.3) });
    grow(672, 190, 730, 190, seg(u, 1.6, 1.9), ACC); card(830, 190, 180, 56, { rx: 10, text: 'prompt', fs: 15, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 1.9) });
    note(640, 300, 'BaseModel만 고치면 프롬프트가 따라온다', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  // ---------- 5. with_structured_output ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { schema(24, 70, 1); mono(40, 312, '"""언어에 대한 구조화된 정보"""', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      [['parser', 600], ['prompt 속 스키마', 800]].forEach(([s, x], i) => { card(x, 180, 170, 48, { rx: 10, text: s, fs: 15, stroke: GRID, color: MUT, s: pop(u, 0.6 + i * 0.3) }); cross(x, 180, 18, pop(u, 1.2 + i * 0.3)); });
      note(700, 270, '파서도, 프롬프트 지시도 없다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    const LLM = (s) => { card(480, 150, 300, 90, { rx: 14, stroke: ACC, fill: ACCBG, sw: 2.4, s }); mono(480, 140, 'structured_llm', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s > 0.4 ? 1 : 0 });
      mono(480, 166, 'llm + LanguageInfo 스키마', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s > 0.4 ? 1 : 0 }); };
    if (k === 1) { card(220, 150, 200, 60, { rx: 10, text: 'ChatOpenAI', fs: 16, mono: true, s: pop(u, 0.1) }); fly(160, 330, 480, 160, seg(u, 0.5, 1.3), 'LanguageInfo', { fill: INFO });
      LLM(pop(u, 1.4)); mono(480, 260, 'llm.with_structured_output(LanguageInfo)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 290, '스키마가 모델이 아는 형식(tool spec)으로 붙는다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2 || k === 3) { LLM(1); pill(160, 150, '"Python 언어를 설명해줘"', INK, k === 2 ? pop(u, 0.2) : 1, { fs: 14 }); grow(300, 150, 326, 150, k === 2 ? seg(u, 0.4, 0.7) : 1, MUT);
      grow(634, 150, 660, 150, k === 2 ? seg(u, 1.0, 1.3) : 1, ACC);
      objBox("<class 'LanguageInfo'>", (i) => ({ op: k === 2 ? fade(u, 1.3 + i * 0.2) : 1, ok: true }), { x: 664, y: 60, w: 272, stroke: ACC });
      ex(880, 290, 1);
      if (k === 2) { note(330, 300, '펜스도, 파서도, 프롬프트 지시도 없이', fade(u, 1.8), { 'text-anchor': 'middle' }); note(330, 326, '인스턴스가 바로 나온다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
      [['info.name, info.year', 'Python 1991'], ['info.pros', '["읽기 쉬움", "라이브러리"]']].forEach(([a, z], i) => spans(40, 300 + i * 40, [[a, { 'font-weight': 700 }], ['  →  ', { fill: MUT }], [z, { fill: ACC, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.5) })); return; }
    if (k === 4) { [['①', '스키마 → tool spec · JSON schema', 150], ['②', '모델이 그 형식대로 JSON 생성', 480], ['③', 'LanguageInfo로 파싱 · 검증', 810]].forEach(([n, s, x], i) => {
        const sc = pop(u, 0.2 + i * 0.5); card(x, 180, 280, 90, { rx: 12, stroke: i === 1 ? ACC : INK, fill: i === 1 ? ACCBG : PANEL, s: sc });
        if (sc > 0.4) { tx(x, 168, n, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); tx(x, 198, s, { 'font-size': 14, 'text-anchor': 'middle' }); }
        if (i) grow(x - 190, 180, x - 142, 180, seg(u, 0.4 + i * 0.5, 0.6 + i * 0.5), ACC); });
      note(480, 300, '마크다운 펜스와 키 누락이 거의 사라진다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { mono(40, 90, 'class Top3(BaseModel):', { 'font-size': 15, 'font-weight': 700 }); mono(60, 116, 'languages: list[LanguageInfo]', { 'font-size': 15, fill: INFO });
      zone(40, 150, 880, 170, 'top3.languages', { fill: SOFT });
      [0, 1, 2].forEach((i) => { const s = pop(u, 0.5 + i * 0.3), x = 190 + i * 290; card(x, 250, 260, 100, { rx: 10, stroke: ACC, s });
        if (s > 0.4) { mono(x, 226, 'LanguageInfo', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); FIELDS.forEach(([n], j) => mono(x - 110 + (j % 2) * 120, 254 + Math.floor(j / 2) * 24, n + ': …', { 'font-size': 13.5, fill: MUT })); } });
      note(480, 370, '리스트 필드를 가진 모델이면 객체 목록이 그대로 나온다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    // k 6: 다섯 단계 비교
    const rows = [['파서 없음', [0, 0, 0]], ['JsonOutputParser', [1, 0, 0]], ['PydanticOutputParser', [1, 1, 0]], ['+ format_instructions', [1, 1, 1]], ['with_structured_output', [1, 1, 1]]];
    ['dict · 객체로', '타입 검증', '스키마 한 곳'].forEach((h, j) => tx(520 + j * 150, 74, h, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT }));
    rows.forEach(([n, v], i) => { const y = 116 + i * 52, s = fade(u, 0.2 + i * 0.3), last = i === 4;
      if (last) el('rect', { x: 40, y: y - 24, width: 880, height: 44, rx: 8, fill: ACCBG, opacity: s });
      mono(60, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: s, fill: last ? ACC : INK });
      v.forEach((ok, j) => { if (s < 0.5) return; if (ok) check(520 + j * 150, y, 9, 1); else cross(520 + j * 150, y, 7, 1); }); });
    note(480, 400, '새로 쓰는 코드는 마지막 줄부터 고려한다', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  const quiz = [
    { q: '파서 없이 llm.invoke("Python 언어를 설명해줘")가 돌려주는 것은 무엇인가?',
      o: ['키가 있는 dict', '자유 산문이 content에 든 AIMessage', 'LanguageInfo 객체'], a: 1,
      why: 'invoke 결과는 AIMessage다. .content를 꺼내도 형식 없는 산문이라 data["name"]처럼 쓸 수 없다.' },
    { q: 'JsonOutputParser에 {"year": "1991"}이 들어오면 결과의 year는 무엇인가?',
      o: ["int 1991로 바뀐다", '오류가 난다', "문자열 '1991' 그대로"], a: 2,
      why: 'JsonOutputParser는 펜스를 걷고 json.loads만 한다. 타입을 보는 검사가 없어 문자열이 그대로 통과한다.' },
    { q: 'PydanticOutputParser가 year: "천구백"을 받으면 어떻게 되나?',
      o: ['OutputParserException으로 막힌다', 'year를 0으로 채운다', 'year를 빼고 나머지만 돌려준다'], a: 0,
      why: '"1991"처럼 숫자로 바꿀 수 있으면 int로 바꾸지만 "천구백"은 못 바꾼다. ValidationError를 담은 OutputParserException이 난다.' },
    { q: 'prompt.partial(format_instructions=instructions) 뒤의 input_variables는 무엇인가?',
      o: ["['format_instructions', 'topic']", "['topic']", '[]'], a: 1,
      why: 'partial이 안내문 자리를 미리 채운다. 실행할 때는 topic만 넘기면 된다.' },
    { q: 'llm.with_structured_output(LanguageInfo)를 쓰면 따로 만들지 않아도 되는 것은 무엇인가?',
      o: ['LanguageInfo 스키마 클래스', 'ChatOpenAI 모델', '파서와 프롬프트 속 형식 지시'], a: 2,
      why: '스키마만 넘기면 tool spec 변환, JSON 생성, 파싱·검증을 모델 쪽에서 한 번에 한다. 스키마 클래스는 여전히 직접 정의한다.' },
  ];

  const summary = [
    '파서가 없으면 모델 답은 AIMessage 속 산문이라 코드에서 키로 꺼낼 수 없다.',
    'JsonOutputParser는 dict를 주지만 year가 문자열이어도 그대로 통과시킨다.',
    'PydanticOutputParser는 타입을 검사해 "1991"은 int로 바꾸고 틀린 값은 막는다.',
    'format_instructions는 스키마 중복을 없애고 with_structured_output은 이 과정을 한 줄로 줄인다.',
  ];
  const review = [
    { q: 'DB에 넣다가 year 칼럼에 "1991"이라는 문자열이 들어가 오류가 났다. 체인은 JsonOutputParser를 쓴다. 가장 먼저 할 일은?',
      o: ['프롬프트에 "숫자로 써"를 더 강하게 적는다', 'LanguageInfo 스키마로 PydanticOutputParser를 쓴다', 'StrOutputParser로 바꾼다'], a: 1,
      why: 'Pydantic 파서는 year: int 선언대로 "1991"을 1991로 바꾸고, 바꿀 수 없는 값은 예외로 막는다.' },
    { q: '스키마에 필드를 하나 추가했는데 모델이 새 필드를 계속 빠뜨린다. 프롬프트에 스키마를 손으로 적어 두었다. 원인은?',
      o: ['프롬프트 속 스키마 문장을 고치지 않아 모델이 새 필드를 모른다', 'Pydantic이 새 필드를 지원하지 않는다', 'temperature가 너무 낮다'], a: 0,
      why: '스키마가 BaseModel과 프롬프트 두 곳에 있으면 한쪽만 바뀐다. {format_instructions}로 넣으면 BaseModel만 고쳐도 따라온다.' },
    { q: '새 프로젝트에서 모델 답을 객체로 받으려 한다. 모델이 tool calling을 지원할 때 첫 선택은?',
      o: ['StrOutputParser와 정규식', 'JsonOutputParser', 'llm.with_structured_output(스키마)'], a: 2,
      why: '스키마만 넘기면 형식 지시, JSON 생성, 검증을 한 번에 처리해 펜스나 키 누락 문제가 거의 없다.' },
  ];

  R.page({ title: '세관 검사관 다섯 단계', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
