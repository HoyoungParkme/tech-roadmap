/* I-1-2 LangChain 아키텍처 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 위쪽 부서 지도는 STEPS 의 active · support 를 읽는다. 프롬프트·파서·도구 값은 langchain-core 1.8.4 로 실행해 확인했다.
 * 모델이 쓰는 문장은 실제 호출이 아니므로 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, spans, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op) => pill(x, y, '예시', MUT, 1, { fs: 13.5, op });
  const typed = (s, f) => (f >= 1 ? s : s.slice(0, Math.round(s.length * clamp(f))));
  const DEPT = [['models', 'Models'], ['prompts', 'Prompts'], ['parsers', 'Parsers'], ['chains', 'Chains'], ['agents', 'Agents'], ['memory', 'Memory'], ['retrievers', 'Retrievers']];
  // 부서 지도: 지금 부서는 진하게, 돕는 부서는 옅게
  function map(c, all) { const b = c.beat, sup = b.support || [];
    DEPT.forEach(([id, name], i) => { const cx = 84 + i * 132, on = all || id === b.active, hp = sup.includes(id);
      card(cx, 26, 124, 32, { rx: 16, text: name, fs: 15, fw: 800, fill: on ? ACC : hp ? ACCBG : PANEL, stroke: on || hp ? ACC : GRID, color: on ? PANEL : hp ? ACC : MUT, sw: 1.8 }); }); }
  // 메시지 한 줄: 역할 딱지 + 내용
  function msg(x, y, w, role, text, o) { o = o || {}; const col = role === 'System' ? INFO : role === 'AI' ? ACC : INK, s = o.s ?? 1; if (s <= 0) return;
    const g = R.G(x, y, 1, o.op ?? 1);
    el('rect', { x: 0, y: -16, width: w * s, height: 32, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 1.6 }, g);
    if (s > 0.6) { tx(12, 5, role, { 'font-size': 13.5, 'font-weight': 800, fill: col }, g); tx(o.tx || 82, 5, text, { 'font-size': 14, fill: INK, class: o.mono ? 'mono' : null }, g); } }
  // 템플릿 한 줄: 문자열 조각 중 {슬롯} 은 칸으로
  function tmpl(x, y, parts, fill, o) { o = o || {}; let cx = x;
    parts.forEach((p) => { if (p[0] === '{') { const key = p.slice(1, -1), v = fill && fill[key], f = v ? v.f : 0, show = f > 0.5 ? v.v : p, w = tw(show, 14) + 14;
        el('rect', { x: cx, y: y - 17, width: w, height: 24, rx: 5, fill: f > 0.5 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 1.6, 'stroke-dasharray': f > 0.5 ? null : '4 3' });
        tx(cx + 7, y, show, { 'font-size': 14, 'font-weight': 700, fill: ACC, class: f > 0.5 ? null : 'mono' }); cx += w + 2; }
      else { tx(cx, y, p, { 'font-size': 14, fill: o.col || INK }); cx += tw(p, 14) + 2; } }); return cx; }

  // ---------- 1. Models ----------
  const MOD = [{ x: 250, cls: 'ChatOpenAI', v: 'gpt', m: 'model="gpt-4o-mini"', t: 'temperature=0', a: '"리스트는 mutable, 튜플은…"' },
    { x: 710, cls: 'ChatAnthropic', v: 'claude', m: 'model="claude-3-5-sonnet-latest"', t: '', a: '"리스트는 변경 가능하고…"' }];
  function s1(t, c) { const { k, u } = c; map(c);
    if (k === 5) { // 부서의 핵심 클래스 세 갈래
      card(480, 96, 220, 40, { rx: 10, text: 'Models 부서', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.1) });
      [['BaseChatModel', '채팅용 (대부분의 최신 LLM)', 170], ['BaseLLM', '텍스트 completion (legacy)', 480], ['Embeddings', '텍스트 → 벡터 (Retriever 용)', 790]].forEach(([n, d, x], i) => {
        grow(480, 116, x, 170, seg(u, 0.4 + i * 0.25, 0.8 + i * 0.25), MUT);
        card(x, 196, 260, 54, { rx: 10, stroke: i === 0 ? ACC : INK, s: pop(u, 0.8 + i * 0.25) });
        mono(x, 192, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 0 ? ACC : INK, opacity: fade(u, 1.0 + i * 0.25) });
        sub(x, 212, d, fade(u, 1.0 + i * 0.25)); });
      ['ChatOpenAI', 'ChatAnthropic'].forEach((s, i) => pill(105 + i * 135, 268, s, ACC, pop(u, 1.6 + i * 0.15), { mono: true, fs: 13.5 }));
      mono(790, 268, '"연차 며칠?" → [0.12, -0.03, …]', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) });
      note(480, 340, '공급사가 바뀌어도 prompt · chain · parser 코드는 그대로다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    MOD.forEach((o, i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.3) : 1;
      card(o.x, 110, 300, 50, { rx: 10, stroke: INK, sw: 2.2, s });
      mono(o.x, 116, o.cls, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: s > 0.4 ? 1 : 0 });
      if (k === 0) sub(o.x, 156, 'BaseChatModel 상속 · HTTP 세부는 안에', fade(u, 1.0 + i * 0.3));
      const made = k >= 1 + i; if (!made) return;
      const ms = k === 1 + i ? pop(u, 0.3) : 1;
      grow(o.x, 136, o.x, 168, k === 1 + i ? seg(u, 0.1, 0.4) : 1, MUT);
      card(o.x, 214, 300, 84, { rx: 12, stroke: k === 1 + i ? ACC : GRID, fill: k === 1 + i ? ACCBG : PANEL, sw: 2, s: ms });
      if (ms > 0.4) { mono(o.x - 136, 196, o.v + ' =', { 'font-size': 15, 'font-weight': 800, fill: ACC });
        mono(o.x - 136, 220, o.m, { 'font-size': 13.5 }); if (o.t) mono(o.x - 136, 242, o.t, { 'font-size': 13.5 }); } });
    if (k === 1) { note(480, 300, '만드는 순간에는 네트워크 호출이 없다', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT }); }
    if (k === 2) note(480, 300, '인스턴스만 다르고 쓰는 법은 같다', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT });
    if (k >= 3) { const q = '"파이썬 리스트와 튜플 차이?"';
      if (k === 3) { pill(480, 290, q, INK, pop(u, 0.2), { fs: 14 });
        MOD.forEach((o) => { fly(480, 290, o.x, 258, seg(u, 0.9, 1.8), '.invoke(q)', { mono: true }); }); }
      if (k === 3) note(480, 350, '두 인스턴스를 같은 .invoke로 부른다', fade(u, 2.0), { 'text-anchor': 'middle' });
      if (k === 4) MOD.forEach((o, i) => { grow(o.x, 256, o.x, 290, seg(u, 0.2, 0.5), ACC);
        card(o.x, 318, 300, 48, { rx: 10, stroke: ACC, s: pop(u, 0.5 + i * 0.3) });
        mono(o.x - 138, 312, `r${i + 1}: AIMessage`, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7 + i * 0.3) });
        tx(o.x - 138, 332, '.content = ' + o.a, { 'font-size': 13.5, opacity: fade(u, 1.2 + i * 0.3) }); });
      if (k === 4) { ex(890, 380, fade(u, 1.5)); note(480, 390, '반환 타입도 같아서 뒤에 오는 코드를 같이 쓴다', fade(u, 2.0), { 'text-anchor': 'middle' }); } } }

  // ---------- 2. Prompts ----------
  const SYS = ['너는 친절한 파이썬 강사다. ', '{level}', ' 학습자가 대상이다.'], HUM = ['{topic}', '에 대해 설명해줘.'];
  function s2(t, c) { const { k, u } = c; map(c);
    if (k === 0) { [['리스트 튜플 차이 알려줘', 160, 110], ['초급자용으로 list vs tuple?', 360, 160], ['튜플이 뭐야 리스트랑 비교', 230, 214]].forEach(([s, x, y], i) => {
        pill(x, y, s, WARN, pop(u, 0.2 + i * 0.3), { fs: 14, fill: WARNBG }); });
      ex(470, 110, fade(u, 1.0)); sub(250, 262, '매번 다른 형식 → 답 품질이 들쑥날쑥', fade(u, 1.2), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
      grow(560, 160, 640, 160, seg(u, 1.4, 1.8), ACC);
      card(780, 160, 250, 70, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 1.8) });
      mono(780, 156, 'ChatPromptTemplate', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
      sub(780, 178, '다시 쓰는 양식', fade(u, 2.0)); return; }
    if (k === 5) { // 다른 양식들
      [['PromptTemplate', '단일 텍스트 (legacy LLM)'], ['FewShotPromptTemplate', '예시 N개를 자동 삽입'], ['MessagesPlaceholder', '대화 history 슬롯']].forEach(([n, d], i) => {
        const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4); card(x, 140, 280, 64, { rx: 10, stroke: INK, s });
        mono(x, 136, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s > 0.4 ? 1 : 0 }); sub(x, 158, d, s > 0.4 ? 1 : 0); });
      mono(170, 222, '"{topic}을 설명해줘."', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) });
      for (let i = 0; i < 3; i++) card(480, 214 + i * 30, 200, 24, { rx: 6, text: `예시 ${i + 1}: 입력 → 답`, fs: 13.5, stroke: GRID, s: pop(u, 1.0 + i * 0.2) });
      ['Human', 'AI', 'Human', 'AI'].forEach((r, i) => card(790, 212 + i * 26, 150, 22, { rx: 6, text: r, fs: 13.5, stroke: r === 'AI' ? ACC : INK, color: r === 'AI' ? ACC : INK, s: pop(u, 1.4 + i * 0.15) }));
      note(480, 362, 'prompt는 매개변수가 있는 양식이다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    // k 1~4 : 양식 → 채우기 → 메시지 → 모델
    const fill = k >= 2 ? { level: { v: '초급', f: k === 2 ? seg(u, 1.1, 1.2) : 1 }, topic: { v: '리스트와 튜플의 차이', f: k === 2 ? seg(u, 1.45, 1.5) : 1 } } : null;
    const top = k === 1 ? pop(u, 0.1) : 1;
    zone(40, 62, 880, 112, k >= 2 ? 'ChatPromptValue (값이 채워짐)' : 'prompt = ChatPromptTemplate.from_messages([...])', { fill: SOFT, op: top });
    tx(60, 112, 'system', { 'font-size': 13.5, 'font-weight': 800, fill: INFO, opacity: top }); tmpl(130, 112, SYS, fill);
    tx(60, 150, 'human', { 'font-size': 13.5, 'font-weight': 800, fill: INK, opacity: top }); tmpl(130, 150, HUM, fill);
    if (k === 1) note(480, 220, '슬롯 {level} · {topic}은 invoke 할 때 채운다', fade(u, 1.2), { 'text-anchor': 'middle' });
    if (k === 2) { pill(480, 222, 'prompt.invoke({"level": "초급", "topic": "리스트와 튜플의 차이"})', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      fly(380, 222, 460, 112, seg(u, 0.5, 1.1), '초급'); fly(560, 222, 170, 150, seg(u, 0.9, 1.45), '리스트와 튜플의 차이');
      note(480, 290, '슬롯이 채워진 ChatPromptValue가 나온다', fade(u, 2.0), { 'text-anchor': 'middle' }); }
    if (k >= 3) { const op = k === 3 ? 1 : 0.55; mono(40, 214, 'pv.to_messages()', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op });
      msg(40, 248, 520, 'System', '너는 친절한 파이썬 강사다. 초급 학습자가 대상이다.', { s: k === 3 ? E(u, 0.3, 0.9) : 1, tx: 100, op });
      msg(40, 290, 520, 'Human', '리스트와 튜플의 차이에 대해 설명해줘.', { s: k === 3 ? E(u, 0.9, 1.5) : 1, tx: 100, op });
      if (k === 3) note(720, 270, '역할이 나뉜 메시지 2건', fade(u, 1.8), { 'text-anchor': 'middle' }); }
    if (k === 4) { dot([[560, 270], [640, 270]], seg(u, 0.2, 0.8), ACC, 7); grow(565, 270, 640, 270, seg(u, 0.2, 0.8), ACC);
      card(760, 270, 220, 64, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 0.7) });
      mono(760, 266, 'llm.invoke(pv)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) }); sub(760, 288, 'gpt-4o-mini', fade(u, 0.9));
      note(480, 360, 'prompt의 출력이 그대로 model의 입력이 된다', fade(u, 1.6), { 'text-anchor': 'middle' }); } }

  // ---------- 3. OutputParsers ----------
  const FIELDS = [['name', 'str', '자료형 이름', "'리스트'"], ['mutable', 'bool', '변경 가능 여부', 'True'], ['syntax', 'str', '문법 표기 예: []', "'[]'"]];
  function gate(x, y, name, s, hot) { card(x, y, 210, 56, { rx: 10, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: 2.4, s });
    mono(x, y + 6, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? ACC : INK, opacity: s > 0.4 ? 1 : 0 }); }
  function s3(t, c) { const { k, u } = c; map(c);
    if (k === 0) { card(220, 200, 300, 120, { rx: 14, stroke: MUT, dash: '6 5', s: pop(u, 0.2) });
      tx(220, 176, 'AIMessage', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.4) });
      ['리스트는 mutable이고 []로', '쓰며, 튜플은 immutable…'].forEach((s, i) => tx(220, 206 + i * 22, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.2) }));
      ex(330, 136, fade(u, 0.8)); grow(380, 200, 560, 200, seg(u, 1.0, 1.5), MUT);
      ['StrOutputParser', 'JsonOutputParser', 'PydanticOutputParser'].forEach((s, i) => pill(720, 150 + i * 50, s, ACC, pop(u, 1.4 + i * 0.25), { mono: true, fs: 14 }));
      note(480, 340, '후속 코드는 문자열이 아니라 dict나 객체가 필요하다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k === 1 || k === 2) { const js = k === 2;
      card(170, 190, 280, 90, { rx: 12, stroke: INK, s: 1 });
      mono(170, 162, 'AIMessage', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      if (!js) tx(170, 198, '"리스트는 ..."', { 'font-size': 15, 'text-anchor': 'middle' });
      else ['```json', '{"name": "리스트",', ' "mutable": true}', '```'].forEach((s, i) => { const fence = i === 0 || i === 3, gone = fence ? fade(u, 1.0) : 0;
        mono(60, 184 + i * 20, s, { 'font-size': 13.5, fill: fence ? BAD : INK, opacity: 1 - gone * 0.7, 'text-decoration': fence && gone > 0.5 ? 'line-through' : null }); });
      dot([[310, 190], [380, 190]], seg(u, 0.4, 0.9), ACC, 7);
      gate(480, 190, js ? 'JsonOutputParser' : 'StrOutputParser', pop(u, 0.2), true);
      grow(585, 190, 650, 190, seg(u, 1.2, 1.5), ACC);
      if (!js) { card(780, 190, 220, 50, { rx: 10, stroke: ACC, s: pop(u, 1.5) }); mono(780, 196, '"리스트는 ..."', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
        sub(780, 236, 'type: str (content만)', fade(u, 1.8), { 'font-weight': 700, fill: ACC }); }
      else { const s = pop(u, 1.5); card(790, 190, 250, 80, { rx: 10, stroke: ACC, s });
        if (s > 0.4) { mono(680, 178, "{'name': '리스트',", { 'font-size': 14 }); mono(688, 202, " 'mutable': True}", { 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
        sub(790, 250, 'type: dict  (true → True)', fade(u, 1.9), { 'font-weight': 700, fill: ACC }); }
      note(480, 330, js ? '코드블록 울타리를 걷어 내고 JSON을 dict로 바꾼다' : 'AIMessage 봉투를 벗기고 글자만 꺼낸다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k >= 3 && k <= 6) { // 스키마 → 파서 → 지침 → 결과
      const sx = 40, sy = 70; zone(sx, sy, 380, 168, 'class PythonType(BaseModel)', { fill: SOFT, op: k === 3 ? fade(u, 0.1) : 1 });
      FIELDS.forEach(([n, ty, d, v], i) => { const y = sy + 56 + i * 38, f = k === 3 ? fade(u, 0.4 + i * 0.4) : 1;
        mono(sx + 16, y, `${n}: ${ty}`, { 'font-size': 15, 'font-weight': 700, opacity: f });
        tx(sx + 200, y, d, { 'font-size': 13.5, fill: MUT, opacity: f });
        if (k === 6) { const ok = fade(u, 1.2 + i * 0.3); check(sx + 360, y - 5, 8, ok); } });
      if (k >= 4) { const s = k === 4 ? pop(u, 0.3) : 1; grow(422, 154, 500, 154, k === 4 ? seg(u, 0.6, 1.0) : 1, ACC);
        gate(620, 154, 'PydanticOutputParser', s, k === 4);
        mono(620, 206, 'pydantic_object=PythonType', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 4 ? fade(u, 1.1) : 1 });
        if (k === 4) note(480, 300, '응답이 이 스키마를 통과해야 결과가 된다', fade(u, 1.6), { 'text-anchor': 'middle' }); }
      if (k === 5) { mono(40, 276, 'parser.get_format_instructions()', { 'font-size': 14, 'font-weight': 700, fill: ACC });
        card(480, 330, 880, 64, { rx: 10, stroke: INFO, fill: INFOBG, s: pop(u, 0.4) });
        tx(56, 324, typed('The output should be formatted as a JSON instance that conforms to', fade(u, 0.6, 1.2)), { 'font-size': 14, class: 'mono' });
        tx(56, 346, typed('the JSON schema below. … (스키마까지 742자)', fade(u, 1.6, 0.6)), { 'font-size': 14, class: 'mono' });
        fly(820, 300, 880, 160, seg(u, 2.0, 2.6), '→ prompt', { fill: INFO }); return; }
      if (k === 6) { grow(728, 154, 780, 154, seg(u, 0.2, 0.5), ACC);
        card(780, 300, 320, 74, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.4) });
        mono(632, 294, "PythonType(name='리스트',", { 'font-size': 14, opacity: fade(u, 0.6) }); mono(632, 316, "  mutable=True, syntax='[]')", { 'font-size': 14, opacity: fade(u, 0.6) });
        spans(560, 390, [['result.mutable', { 'font-weight': 700 }], ['  → ', { fill: MUT }], ['True', { fill: ACC, 'font-weight': 800 }], ['   (bool, 자동완성 됨)', { fill: MUT }]], { 'font-size': 14, opacity: fade(u, 1.6) }); }
      return; }
    // k 7: 다리
    tx(170, 100, '확률적 텍스트', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: WARN });
    tx(790, 100, '결정적 데이터 구조', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC });
    for (let i = 0; i < 4; i++) el('path', { d: `M60,${140 + i * 34} q30,-12 60,0 t60,0 t60,0`, fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 0.2 + i * 0.12) });
    ['DB 저장', 'API 응답', '다음 chain 입력'].forEach((s, i) => card(790, 150 + i * 46, 220, 36, { rx: 8, text: s, fs: 15, stroke: ACC, s: pop(u, 0.6 + i * 0.2) }));
    el('path', { d: `M290,${200} Q480,${200 - 90 * E(u, 1.0, 1.8)} 670,200`, fill: 'none', stroke: INK, 'stroke-width': 4 });
    card(480, 170, 150, 40, { rx: 10, text: 'Parser', fs: 17, stroke: INK, fill: PANEL, s: pop(u, 1.6) });
    note(480, 330, 'Parser가 둘 사이를 잇는다', fade(u, 2.1), { 'text-anchor': 'middle' }); }

  // ---------- 4. Chains ----------
  const PARTS = [{ x: 170, n: 'prompt', d: 'ChatPromptTemplate', l1: 'system: JSON 으로만 답해라.', l2: 'human: {topic} 를 설명해라.' }, { x: 480, n: 'model', d: 'ChatOpenAI', l1: 'gpt-4o-mini', l2: 'temperature=0' }, { x: 790, n: 'parser', d: 'JsonOutputParser', l1: 'AIMessage → dict', l2: '' }];
  function parts(k, u) { PARTS.forEach((p, i) => { const s = k === 1 ? pop(u, 0.2 + i * 0.4) : 1;
      card(p.x, 150, 250, 100, { rx: 12, stroke: INK, sw: 2.2, s }); if (s < 0.4) return;
      mono(p.x, 122, p.n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); sub(p.x, 142, p.d, 1, { class: 'mono' });
      tx(p.x, 166, p.l1, { 'font-size': 13.5, 'text-anchor': 'middle' }); if (p.l2) tx(p.x, 186, p.l2, { 'font-size': 13.5, 'text-anchor': 'middle', class: i === 1 ? 'mono' : null }); }); }
  function s4(t, c) { const { k, u } = c; map(c);
    if (k === 0) { [['langchain_core.prompts', 'ChatPromptTemplate'], ['langchain_core.output_parsers', 'JsonOutputParser'], ['langchain_openai', 'ChatOpenAI']].forEach(([m, n], i) => {
        const y = 110 + i * 56; spans(120, y, [['from ', { fill: INFO, 'font-weight': 700 }], [m, {}], [' import ', { fill: INFO, 'font-weight': 700 }], [n, { fill: ACC, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.35) }); });
      note(480, 320, '앞의 세 부서가 만든 부품을 가져와 조립 라인에 올린다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    parts(k, u);
    if (k === 1) { note(480, 260, '셋 다 Runnable이다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    [325, 635].forEach((x, i) => tx(x, 164, '|', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, class: 'mono', fill: ACC, opacity: k === 2 ? fade(u, 0.2 + i * 0.3) : 1 }));
    const f = k === 2 ? E(u, 0.8, 1.6) : 1; el('rect', { x: 34, y: 88, width: 892 * f, height: 124, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '7 5' });
    if (k === 2) { mono(480, 250, 'chain = prompt | model | parser', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      sub(480, 276, '부품 3개가 Runnable 합성체 1개가 된다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 3 || k === 4) { const st = [['{"topic": …}', 40, INK], ['ChatPromptValue', 325, INFO], ['AIMessage', 635, INFO], ['dict', 920, ACC]];
      const n = k === 3 ? Math.floor(E(u, 0.2, 2.2) * 3.99) : 3;
      dot([[40, 236], [920, 236]], k === 3 ? E(u, 0.2, 2.2) : 0, ACC, 7);
      st.forEach(([s, x, col], i) => { if (i > n) return; mono(clamp(x, 40, 920), 268, s, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': i === 0 ? 'start' : i === 3 ? 'end' : 'middle' }); });
      if (k === 3) { note(480, 330, 'invoke 한 번에 세 부품을 차례로 통과한다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
      card(480, 340, 520, 50, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.3) });
      mono(480, 346, '{"리스트": "mutable, []", "튜플": "immutable, ()"}', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      ex(800, 340, fade(u, 0.8)); note(480, 400, '마지막 자리가 parser라서 결과는 파싱이 끝난 dict다', fade(u, 1.5), { 'text-anchor': 'middle', 'font-size': 14 }); return; }
    if (k === 5) { [['.stream', '토큰씩'], ['.ainvoke', '비동기'], ['.batch', '여러 건 병렬']].forEach(([m, d], i) => { const x = 250 + i * 230;
        grow(x, 212, x, 252, seg(u, 0.2 + i * 0.3, 0.5 + i * 0.3), ACC, { plain: true }); pill(x, 270, m, ACC, pop(u, 0.4 + i * 0.3), { mono: true, fs: 15 }); sub(x, 306, d, fade(u, 0.7 + i * 0.3)); });
      note(480, 362, '같은 chain에 이미 붙어 있어 추가 코드는 0줄이다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    // k 6: Chain 부서가 하는 일
    [['단계 합성', 'prompt | model | parser'], ['타입 전달', 'dict → … → dict'], ['실행 모드 · trace', 'stream · async · batch · LangSmith'], ['분기 · 병렬', 'RunnableBranch · RunnableParallel']].forEach(([a, z], i) => {
      const x = 130 + i * 233, s = pop(u, 0.2 + i * 0.3); card(x, 290, 218, 72, { rx: 10, stroke: ACC, sw: 2, s });
      if (s > 0.4) { tx(x, 284, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); tx(x, 306, z, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } }); }

  // ---------- 5. Agents ----------
  const TOOLS = [{ n: 'get_weather', a: 'city: str', d: '주어진 도시의 현재 날씨와 기온(°C) 반환' }, { n: 'celsius_to_fahrenheit', a: 'c: float', d: '섭씨 → 화씨 변환' }];
  function toolCard(x, y, o, s, hot) { card(x, y, 330, 70, { rx: 10, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: 2, s }); if (s < 0.4) return;
    mono(x - 152, y - 12, '@tool ' + o.n, { 'font-size': 14.5, 'font-weight': 800, fill: hot ? ACC : INK }); mono(x - 152, y + 8, 'args: ' + o.a, { 'font-size': 13.5, fill: MUT });
    tx(x - 152, y + 27, o.d, { 'font-size': 13.5 }); }
  const TRACE = [['Thought', '먼저 날씨를 조회해야 한다', MUT], ['Action', 'get_weather(city="서울")', INFO], ['Obs', '"서울: 맑음, 22°C"', ACC], ['Thought', '22를 화씨로 바꿔야 한다', MUT], ['Action', 'celsius_to_fahrenheit(c=22)', INFO], ['Obs', '71.6', ACC], ['Final', '"서울은 맑고 22°C(71.6°F)입니다."', INK]];
  function s5(t, c) { const { k, u } = c; map(c);
    if (k === 0) { // 정해진 레일 vs 갈림길
      tx(240, 92, 'Chain: 정해진 순서', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      ['prompt', 'model', 'parser'].forEach((s, i) => { card(90 + i * 150, 160, 110, 40, { rx: 8, text: s, fs: 14, mono: true, s: pop(u, 0.2 + i * 0.15) }); if (i) grow(90 + (i - 1) * 150 + 56, 160, 90 + i * 150 - 56, 160, seg(u, 0.4, 0.7), MUT); });
      tx(720, 92, 'Agent: LLM이 다음 행동을 고른다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      card(620, 190, 120, 50, { rx: 25, text: 'LLM', fs: 16, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.0) });
      [['도구 A', 130], ['도구 B', 190], ['최종 답', 250]].forEach(([s, y], i) => { grow(680, 190, 790, y, seg(u, 1.3 + i * 0.2, 1.6 + i * 0.2), ACC); card(850, y, 110, 36, { rx: 8, text: s, fs: 14, stroke: i === 2 ? INK : ACC, s: pop(u, 1.5 + i * 0.2) }); });
      note(480, 330, 'create_tool_calling_agent · AgentExecutor · @tool', fade(u, 2.1), { 'text-anchor': 'middle', class: 'mono', 'font-size': 14 }); return; }
    if (k === 1 || k === 2) { mono(60, 104, 'def get_weather(city: str) -> str:', { 'font-size': 14, opacity: k === 1 ? fade(u, 0.1) : 0.5 });
      mono(80, 126, '"""주어진 도시의 현재 날씨와 기온(°C) 반환"""', { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 0.2) : 0.5 });
      if (k === 1) { pill(120, 160, '@tool', ACC, pop(u, 0.6), { mono: true, fs: 15 }); grow(240, 170, 520, 190, seg(u, 0.9, 1.4), ACC); }
      toolCard(700, 200, TOOLS[0], k === 1 ? pop(u, 1.3) : 1, k === 1);
      if (k === 1) note(480, 300, 'docstring이 LLM이 읽을 도구 설명이 된다', fade(u, 1.9), { 'text-anchor': 'middle' });
      if (k === 2) { mono(60, 170, 'def celsius_to_fahrenheit(c: float) -> float:', { 'font-size': 14, opacity: fade(u, 0.1) });
        mono(80, 192, 'return c * 9 / 5 + 32', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) });
        toolCard(700, 290, TOOLS[1], pop(u, 0.8), true);
        zone(520, 150, 360, 190, null, { fill: 'none', stroke: ACC, dash: '6 4', op: fade(u, 1.4) });
        mono(530, 366, 'tools = [get_weather, celsius_to_fahrenheit]', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) });
        note(260, 300, 'LLM의 선택지가 2개가 됐다', fade(u, 1.9), { 'text-anchor': 'middle' }); } return; }
    if (k === 3) { zone(60, 70, 600, 200, 'agent 용 prompt', { fill: SOFT, op: fade(u, 0.1) });
      [['system', '필요한 도구를 골라 사용해 사용자에게 답하라.', INFO], ['human', '{input}', INK], ['placeholder', '{agent_scratchpad}', ACC]].forEach(([r, s, col], i) => {
        const y = 120 + i * 46; tx(80, y, r, { 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.3) });
        tx(190, y, s, { 'font-size': 14, class: s[0] === '{' ? 'mono' : null, fill: s[0] === '{' ? col : INK, opacity: fade(u, 0.3 + i * 0.3) }); });
      el('rect', { x: 180, y: 202, width: 220, height: 56 * E(u, 1.2, 2.0), rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' });
      note(720, 230, '추론 기록이', fade(u, 1.6), { fill: ACC }); note(720, 254, '쌓일 자리', fade(u, 1.6), { fill: ACC }); return; }
    if (k === 4) { [['llm', 'gpt-4o-mini'], ['tools', '도구 2개'], ['prompt', 'scratchpad 포함']].forEach(([a, z], i) => {
        card(130, 110 + i * 70, 170, 54, { rx: 10, stroke: INK, s: pop(u, 0.2 + i * 0.2) }); mono(130, 106 + i * 70, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.2) });
        sub(130, 126 + i * 70, z, fade(u, 0.3 + i * 0.2)); grow(218, 110 + i * 70, 330, 180, seg(u, 0.8, 1.2), MUT); });
      card(420, 180, 170, 60, { rx: 12, text: 'agent', fs: 17, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.2) });
      // 실행기 고리
      const a = E(u, 1.4, 2.6) * Math.PI * 2; el('circle', { cx: 710, cy: 180, r: 90, fill: 'none', stroke: GRID, 'stroke-width': 10 });
      el('path', { d: `M710,90 A90,90 0 ${a > Math.PI ? 1 : 0} 1 ${710 + 90 * Math.sin(a)},${180 - 90 * Math.cos(a)}`, fill: 'none', stroke: ACC, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: a > 0.01 ? 1 : 0 });
      mono(710, 176, 'AgentExecutor', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); sub(710, 198, '결정 → 실행 → 관찰', fade(u, 1.6));
      grow(508, 180, 616, 180, seg(u, 1.4, 1.7), ACC);
      note(480, 330, 'verbose=True면 루프 한 바퀴씩을 눈으로 본다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { pill(480, 84, '"서울 날씨와 그 기온의 화씨는?"', INK, pop(u, 0.1), { fs: 14 });
      const n = E(u, 0.3, 2.5) * TRACE.length;
      TRACE.forEach(([r, s, col], i) => { const y = 124 + i * 36, f = clamp(n - i); if (f <= 0) return;
        const tool = r !== 'Thought' && r !== 'Final'; card(480, y, 640, 30, { rx: 8, stroke: r === 'Final' ? INK : tool ? col : GRID, fill: r === 'Obs' ? ACCBG : PANEL, sw: r === 'Final' ? 2.4 : 1.5, s: 0.6 + 0.4 * f });
        tx(180, y + 5, r, { 'font-size': 14, 'font-weight': 800, fill: col === MUT ? INK : col, opacity: f }); tx(270, y + 5, s, { 'font-size': 14, class: r === 'Action' || r === 'Obs' ? 'mono' : null, opacity: f }); });
      sub(880, 160, 'Thought·Final', fade(u, 1.0)); sub(880, 178, '문장은 예시', fade(u, 1.0));
      sub(880, 214, 'Obs 값은', fade(u, 1.4)); sub(880, 232, '도구 실행값', fade(u, 1.4)); return; }
    // k 6: 풀어 주는 일과 비용
    [['실시간 정보', '날씨 · 검색'], ['계산', '22°C → 71.6°F'], ['여러 단계 추론', '도구 2개 연속']].forEach(([a, z], i) => { const y = 110 + i * 62, s = pop(u, 0.2 + i * 0.25);
      card(240, y, 320, 50, { rx: 10, stroke: GOOD, s }); check(105, y, 10, s); tx(130, y - 2, a, { 'font-size': 15, 'font-weight': 800, opacity: s > 0.4 ? 1 : 0 }); tx(130, y + 17, z, { 'font-size': 13.5, fill: MUT, opacity: s > 0.4 ? 1 : 0 }); });
    tx(700, 92, '이 질문 하나에 LLM 호출', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    ['도구 고르기', '도구 고르기', '최종 답'].forEach((s, i) => { const s2 = pop(u, 1.2 + i * 0.25); card(610 + i * 90, 140, 80, 44, { rx: 8, stroke: WARN, fill: WARNBG, s: s2 }); mono(610 + i * 90, 146, String(i + 1), { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: s2 > 0.4 ? 1 : 0 }); sub(610 + i * 90, 180, s, s2 > 0.4 ? 1 : 0); });
    note(700, 240, '단계마다 LLM을 다시 부르니 비용이 는다', fade(u, 1.9), { 'text-anchor': 'middle', fill: WARN, 'font-size': 14 });
    note(700, 270, '무한 루프를 막는 max_iterations가 필요하다', fade(u, 2.2), { 'text-anchor': 'middle', fill: WARN, 'font-size': 14 }); }

  // ---------- 6. Memory & Retrievers ----------
  const DOCS = ['사내 휴가 규정: 연차 15일', '출장비 한도: 일 5만원'];
  function s6(t, c) { const { k, u } = c; map(c, k === 7);
    if (k === 0) { zone(40, 70, 420, 250, '단기 기억 · Memory', { fill: SOFT, op: fade(u, 0.1) }); zone(500, 70, 420, 250, '장기 지식 · Retrievers', { fill: SOFT, op: fade(u, 0.4) });
      ['Human', 'AI', 'Human'].forEach((r, i) => msg(70, 130 + i * 44, 300, r, i === 2 ? '…' : '이전 턴', { s: E(u, 0.4 + i * 0.2, 0.8 + i * 0.2), tx: 90 }));
      for (let i = 0; i < 3; i++) { const s = pop(u, 0.8 + i * 0.2); card(570 + i * 70, 180, 54, 70, { rx: 4, stroke: INK, s }); for (let j = 0; j < 3; j++) el('line', { x1: 556 + i * 70, y1: 164 + j * 14, x2: 584 + i * 70, y2: 164 + j * 14, stroke: OFF, 'stroke-width': 3, opacity: s }); }
      sub(640, 240, '사내 문서', fade(u, 1.2));
      R.dbIcon(820, 180, 'FAISS', { s: pop(u, 1.4) });
      note(480, 370, '대화 history는 단기 기억, 외부 문서는 장기 지식이다', fade(u, 1.9), { 'text-anchor': 'middle' }); return; }
    if (k === 1 || k === 2) { DOCS.forEach((d, i) => { const y = 110 + i * 70, hot = k === 2 && i === 0;
        card(160, y, 260, 44, { rx: 8, text: d, fs: 14, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, s: k === 1 ? pop(u, 0.2 + i * 0.2) : 1 });
        if (k === 1) grow(296, y, 380, y, seg(u, 0.7, 1.0), MUT);
        // 벡터 조각
        for (let j = 0; j < 8; j++) { const h = 6 + 18 * Math.abs(Math.sin((i + 1) * (j + 2) * 1.7)); el('rect', { x: 400 + j * 14, y: y + 12 - h, width: 10, height: h, rx: 2, fill: i ? INFO : ACC, opacity: k === 1 ? fade(u, 0.9 + j * 0.05) : 0.8 }); } });
      sub(460, 236, '임베딩 (예시 모양)', k === 1 ? fade(u, 1.3) : 1);
      R.dbIcon(700, 140, 'FAISS', { s: k === 1 ? pop(u, 1.3) : 1 });
      pill(700, 250, 'as_retriever(k=2)', ACC, k === 1 ? pop(u, 1.8) : 1, { mono: true, fs: 14 });
      if (k === 2) { pill(160, 290, 'retriever.invoke("연차 며칠?")', INK, pop(u, 0.2), { mono: true, fs: 14 });
        dot([[300, 290], [640, 290], [700, 200]], seg(u, 0.4, 1.2), ACC, 7);
        DOCS.forEach((d, i) => { const s = pop(u, 1.3 + i * 0.3); card(700, 330 + i * 40, 300, 34, { rx: 8, stroke: i ? GRID : ACC, fill: i ? PANEL : ACCBG, s });
          if (s > 0.4) { mono(566, 335 + i * 40, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: i ? MUT : ACC }); tx(586, 335 + i * 40, d, { 'font-size': 14 }); } });
        note(160, 360, '가까운 문서가 먼저 온다', fade(u, 2.0), { 'text-anchor': 'middle' }); note(160, 386, '(문서가 2건이라 k=2면 둘 다)', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT, 'font-size': 14 }); }
      return; }
    if (k === 3) { mono(60, 96, 'chat_history = [', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      msg(80, 140, 440, 'Human', '회사 휴가 규정 알려줘', { s: E(u, 0.4, 0.9) }); msg(80, 186, 440, 'AI', '연차는 15일입니다.', { s: E(u, 0.9, 1.4) });
      mono(60, 230, ']', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      note(720, 150, '이전 턴을 리스트에', fade(u, 1.6), { 'text-anchor': 'middle' }); note(720, 176, '직접 쌓는다', fade(u, 1.6), { 'text-anchor': 'middle' });
      sub(720, 214, 'LCEL 권장 방식', fade(u, 1.9), { 'font-size': 14 }); return; }
    if (k === 7) return;
    // k 4~6: prompt 양식 · 매핑 · 호출
    const filled = k === 6;
    zone(40, 66, 560, 230, filled ? '채워진 메시지' : 'prompt', { fill: SOFT });
    if (!filled) { tx(60, 112, 'system', { 'font-size': 13.5, 'font-weight': 800, fill: INFO }); tmpl(130, 112, ['다음 컨텍스트를 참고해 답하라: ', '{context}'], null);
      tx(60, 172, 'history', { 'font-size': 13.5, 'font-weight': 800, fill: ACC }); el('rect', { x: 130, y: 146, width: 300, height: 44, rx: 6, fill: PANEL, stroke: ACC, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' });
      mono(140, 173, 'MessagesPlaceholder("history")', { 'font-size': 13.5, fill: ACC });
      tx(60, 232, 'human', { 'font-size': 13.5, 'font-weight': 800 }); tmpl(130, 232, ['{question}'], null);
      if (k === 4) note(780, 180, '기억과 지식이 들어올 자리', fade(u, 1.2), { 'text-anchor': 'middle' }); }
    else { const f = (i) => E(u, 0.2 + i * 0.35, 0.6 + i * 0.35);
      msg(54, 104, 530, 'System', '컨텍스트: 연차 15일 · 출장비 일 5만원', { s: f(0) });
      msg(54, 144, 530, 'Human', '회사 휴가 규정 알려줘', { s: f(1) }); msg(54, 184, 530, 'AI', '연차는 15일입니다.', { s: f(2) });
      msg(54, 224, 530, 'Human', '그럼 출장비는?', { s: f(3) });
      grow(600, 180, 660, 180, seg(u, 1.7, 2.0), ACC);
      card(790, 180, 240, 70, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 2.0) });
      tx(790, 176, '출장비 한도는', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); tx(790, 198, '일 5만원입니다.', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      ex(870, 130, fade(u, 2.2));
      note(320, 340, '"그럼"은 history로, 5만원은 문서로 안다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { [['"context"', 'retriever.invoke(question)', 112], ['"history"', 'x["history"]', 168], ['"question"', 'x["question"]', 232]].forEach(([a, z, y], i) => {
        const s = pop(u, 0.2 + i * 0.3); card(790, y, 250, 44, { rx: 8, stroke: i ? INK : ACC, s });
        if (s > 0.4) { mono(678, y - 4, a, { 'font-size': 14, 'font-weight': 800, fill: ACC }); mono(678, y + 15, z, { 'font-size': 13.5, fill: MUT }); }
        dot([[665, y], [440, y]], seg(u, 0.8 + i * 0.3, 1.5 + i * 0.3), ACC, 6); });
      mono(480, 340, '{ 매핑 dict } | prompt | llm', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); return; }
    // k 7: 7개 부서
  }
  function s6x(t, c) { s6(t, c); if (c.k !== 7) return; const u = c.u;
    const P = [['Prompts', 170, 150], ['Models', 400, 150], ['Parsers', 630, 150]];
    zone(70, 100, 680, 100, 'Chains', { fill: ACCBG, stroke: ACC, op: fade(u, 0.1) });
    P.forEach(([s, x, y], i) => { card(x, y, 160, 44, { rx: 10, text: s, fs: 16, stroke: INK, s: pop(u, 0.2 + i * 0.2) }); if (i) grow(x - 150, y, x - 82, y, seg(u, 0.6, 0.9), ACC); });
    [['Retrievers', 170, '문서'], ['Memory', 400, '대화'], ['Agents', 630, '도구']].forEach(([s, x, d], i) => { card(x, 300, 160, 44, { rx: 10, text: s, fs: 16, stroke: ACC, color: ACC, s: pop(u, 1.0 + i * 0.25) });
      grow(x, 276, x, 202, seg(u, 1.3 + i * 0.25, 1.6 + i * 0.25), ACC); sub(x + 30, 250, d, fade(u, 1.5 + i * 0.25), { 'text-anchor': 'start' }); });
    card(850, 150, 150, 70, { rx: 12, stroke: INK, fill: INK, s: pop(u, 2.0) }); tx(850, 155, 'AI 공장', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 2.1) });
    grow(752, 150, 772, 150, seg(u, 2.0, 2.2), ACC); }

  const quiz = [
    { q: 'gpt와 claude 인스턴스를 바꿔 써도 뒤쪽 코드가 그대로인 이유는 무엇인가?',
      o: ['두 인스턴스가 같은 .invoke로 불리고 같은 AIMessage를 돌려줘서', '두 모델이 같은 답을 내서', '생성할 때 서로 같은 서버에 접속해서'], a: 0,
      why: '둘 다 BaseChatModel 계열이라 호출과 반환 모양이 같다. 그래서 .content를 읽는 후속 코드를 그대로 쓴다.' },
    { q: 'prompt.invoke({"level": "초급", "topic": "리스트와 튜플의 차이"})가 돌려주는 것은 무엇인가?',
      o: ['모델의 답 AIMessage', '{level}과 {topic}이 채워진 ChatPromptValue', '변수 이름 목록 ["level", "topic"]'], a: 1,
      why: '템플릿은 슬롯을 채운 ChatPromptValue를 만든다. to_messages()로 열면 SystemMessage와 HumanMessage 2건이 들어 있다.' },
    { q: 'JsonOutputParser가 ```json 코드블록이 붙은 AIMessage를 받으면 하는 일은 무엇인가?',
      o: ['코드블록이 있으면 오류를 낸다', '문자열 그대로 돌려준다', '울타리를 걷어 내고 JSON을 dict로 바꾼다'], a: 2,
      why: 'JSON 블록을 찾아 파싱하므로 {"name": "리스트", "mutable": true}가 파이썬 dict {\'name\': \'리스트\', \'mutable\': True}가 된다.' },
    { q: 'chain = prompt | model | JsonOutputParser()의 invoke 결과 타입은 무엇인가?',
      o: ['ChatPromptValue', 'dict', 'AIMessage'], a: 1,
      why: '값은 dict → ChatPromptValue → AIMessage → dict로 바뀐다. 마지막 자리의 parser가 출력 타입을 정한다.' },
    { q: '"서울 날씨와 그 기온의 화씨는?"에서 celsius_to_fahrenheit를 부를지 정하는 것은 무엇인가?',
      o: ['매 단계 LLM의 판단', '코드에 적힌 호출 순서', 'tools 리스트의 순서'], a: 0,
      why: 'Agent는 관찰 결과(22°C)를 보고 LLM이 다음 도구를 고른다. 그래서 단계마다 LLM 호출이 생긴다.' },
    { q: '"그럼 출장비는?"에 답할 때 "그럼"의 맥락은 어디서 오나?',
      o: ['retriever가 찾은 문서', 'system 메시지의 지시문', 'MessagesPlaceholder("history")에 들어간 이전 대화'], a: 2,
      why: '앞선 대화(휴가 규정 질문과 답)는 history 슬롯으로 들어간다. 출장비 한도 5만원은 retriever가 찾은 문서에서 온다.' },
  ];

  const summary = [
    'Models는 벤더가 달라도 같은 invoke로 부르고 같은 AIMessage를 받는다.',
    'Prompts는 슬롯이 있는 양식이고 값을 넣으면 역할별 메시지가 된다.',
    'Parsers는 모델의 자유 텍스트를 dict나 Pydantic 객체로 바꾼다.',
    'Chains가 부품을 파이프로 잇고 Agents, Memory, Retrievers가 도구와 기억과 문서를 붙인다.',
  ];
  const review = [
    { q: '챗봇이 앞 질문을 잊고 "그럼 출장비는?"에 엉뚱한 답을 한다. 먼저 확인할 것은?',
      o: ['prompt에 history 슬롯이 있고 이전 대화가 들어가는지', 'JsonOutputParser를 붙였는지', 'temperature가 0인지'], a: 0,
      why: '"그럼"을 이해하려면 앞 대화가 MessagesPlaceholder로 들어가야 한다. 파서나 temperature는 맥락과 관계가 없다.' },
    { q: '모델 답을 DB 칼럼 name, mutable, syntax에 바로 넣고 싶다. 어느 부서를 어떻게 쓰면 되나?',
      o: ['Prompts에서 FewShotPromptTemplate만 쓴다', 'Agents에 도구를 하나 더 준다', 'Parsers에서 PythonType 스키마로 PydanticOutputParser를 만든다'], a: 2,
      why: '스키마를 물린 파서는 응답을 검증해 타입이 맞는 객체로 돌려준다. format_instructions로 그 형식을 prompt에 알려 줄 수도 있다.' },
    { q: '사내 문서 질문에 모델이 지어낸 숫자로 답한다. 가장 먼저 붙일 부서는?',
      o: ['Memory', 'Retrievers', 'Parsers'], a: 1,
      why: 'Retriever가 질의와 가까운 문서를 찾아 {context}에 넣으면 모델이 문서의 값(연차 15일)으로 답한다.' },
  ];

  R.page({ title: 'AI 공장의 7개 부서', scenes: [s1, s2, s3, s4, s5, s6x], quiz, summary, review });
})();
