/* IV-1-1 엔티티 추출 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // 타입별 색: 인물 · 회사 · 도시
  const TC = { Person: ACC, Company: INFO, City: WARN };
  const TBG = { Person: C.ACCBG, Company: C.INFOBG, City: C.WARNBG };
  // 원문 3문장을 조각으로 (type이 있으면 엔티티 언급)
  const SENT = [
    [['Alice', 'Person', 'alice'], ['는 '], ['Acme', 'Company', 'acme'], ['에서 일한다.']],
    [['Acme Corp', 'Company', 'acme'], ['는 '], ['서울', 'City', 'seoul'], ['에 있다.']],
    [['ACME', 'Company', 'acme'], ['의 본사도 '], ['서울', 'City', 'seoul'], ['이다.']],
  ];
  // 조각 위치 계산: 문장 i를 (x0, y0 + i*lh)에 fs 크기로
  // 글자 폭은 실제로 재서 쓴다(못 재면 어림값)
  const WC = {};
  function width(t, fs) { const key = fs + '|' + t; if (WC[key]) return WC[key];
    const e = tx(-999, -999, t, { 'font-size': fs, 'font-weight': 700, style: 'white-space:pre' }); let w = 0; try { w = e.getComputedTextLength(); } catch (err) { w = 0; } e.remove();
    if (w > 0) WC[key] = w; return w || tw(t, fs) * 0.86; }
  function layout(x0, y0, lh, fs) { const out = [];
    SENT.forEach((s, i) => { let x = x0; s.forEach(([t, type, grp]) => { const w = width(t, fs); out.push({ t, type, grp, x, w, y: y0 + i * lh, line: i }); x += w + (type ? 4 : 0); }); });
    return out; }
  // 문장 그리기. o.typed(0→1 문장별 타이핑), o.mark(엔티티 언급 상자 보이기 0→1, 함수 가능), o.fs
  function drawText(toks, o) { o = o || {}; const fs = o.fs || 18;
    toks.forEach((k, j) => { const m = k.m = k.type ? (typeof o.mark === 'function' ? o.mark(k, j) : o.mark || 0) : 0;
      if (m > 0) el('rect', { x: k.x - 3, y: k.y - fs + 1, width: k.w + 6, height: fs + 9, rx: 5, fill: TBG[k.type], stroke: TC[k.type], 'stroke-width': 2, opacity: m }); });
    [0, 1, 2].forEach((i) => { const line = toks.filter((k) => k.line === i), full = line.map((k) => k.t).join(''), ty = o.typed ? o.typed(i) : 1;
      if (ty <= 0) return; let left = Math.round(full.length * ty);
      line.forEach((k) => { if (left <= 0) return; const s = k.t.slice(0, left); left -= k.t.length;
        tx(k.x, k.y, s, { 'font-size': fs, 'font-weight': k.m > 0.5 ? 700 : 600, fill: k.m > 0.5 ? TC[k.type] : INK, style: 'white-space:pre' }); }); }); }
  // 엔티티 노드(둥근 판 + 타입 이름표)
  function node(cx, cy, name, type, o) { o = o || {}; const w = Math.max(96, tw(name, 16) + 34);
    card(cx, cy, w, 40, { rx: 20, fill: TBG[type], stroke: TC[type], sw: 2.5, text: name, fs: 16, fw: 800, color: TC[type], s: o.s, op: o.op });
    if (o.tag !== false) mono(cx, cy + 38, ':' + type, { 'font-size': 13.5, fill: TC[type], 'text-anchor': 'middle', opacity: (o.op ?? 1) * clamp(o.s ?? 1) }); }
  function count(x, y, label, v, o) { o = o || {}; tx(x, y, label, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'end' });
    mono(x + 10, y + 2, String(v), { 'font-size': 24, 'font-weight': 800, fill: o.col || INK }); }

  // 1. 원문 — 글자만 있고 구조는 없다
  function s1(t, c) { const { k, u } = c, toks = layout(70, 74, 52, 19);
    zone(40, 34, 520, 172, 'text.txt', { fill: SOFT });
    const typed = (i) => (k === 0 ? E(u, 0.2 + i * 0.55, 0.75 + i * 0.55) : 1);
    const ents = toks.filter((x) => x.type);
    const mark = k === 0 || k === 4 ? 0 : (x) => { const j = ents.indexOf(x); return k === 1 ? E(u, 0.3 + j * 0.3, 0.6 + j * 0.3) : 1; };
    drawText(toks, { typed, mark, fs: 19 });
    // 오른쪽: 사람이 읽은 개념
    const n = k === 0 ? 0 : k === 1 ? Math.round(lerp(0, 6, E(u, 0.3, 2.1))) : k === 2 ? Math.round(lerp(6, 4, E(u, 0.8, 1.8))) : k === 3 ? Math.round(lerp(4, 3, E(u, 0.6, 1.4))) : 0;
    if (k >= 1 && k <= 3) count(740, 60, k === 1 ? '언급' : '개념', n, { col: k === 1 ? INK : ACC });
    if (k === 1) [['Person', '인물 1'], ['Company', '회사 표기 3'], ['City', '도시 2회']].forEach(([ty, s], i) =>
      pill(700 + (i === 1 ? 0 : 0), 108 + i * 38, s, TC[ty], pop(u, 0.6 + i * 0.6), { fs: 14 }));
    if (k >= 2 && k <= 3) { // 같은 회사 세 표기를 한 점으로
      const tgt = [800, 120], g = k === 2 ? E(u, 0.3, 1.5) : 1;
      ents.filter((x) => x.grp === 'acme').forEach((x) => { const sx = x.x + x.w / 2, sy = x.y + 8;
        el('path', { d: `M${sx},${sy} Q${lerp(sx, tgt[0], 0.6)},${sy + 40} ${lerp(sx, tgt[0], g)},${lerp(sy, tgt[1], g)}`, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: 0.8 }); });
      node(tgt[0], tgt[1], 'Acme', 'Company', { s: k === 2 ? pop(u, 1.4) : 1 });
      if (k === 2) sub(tgt[0], tgt[1] + 64, 'Acme · Acme Corp · ACME', fade(u, 1.8), { fill: INFO, 'font-weight': 700 }); }
    if (k === 3) { const tgt = [800, 214], g = E(u, 0.3, 1.2);
      ents.filter((x) => x.grp === 'seoul').forEach((x) => { const sx = x.x + x.w / 2, sy = x.y + 8;
        el('path', { d: `M${sx},${sy} Q${lerp(sx, tgt[0], 0.6)},${sy + 50} ${lerp(sx, tgt[0], g)},${lerp(sy, tgt[1], g)}`, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: 0.8 }); });
      node(tgt[0], tgt[1], '서울', 'City', { s: pop(u, 1.1) }); node(640, 214, 'Alice', 'Person', { s: pop(u, 0.4) });
      // 네 단계 길
      ['NER', 'LLM', '정규화', '평가'].forEach((s, i) => { const x = 170 + i * 200, a = 1.4 + i * 0.25;
        if (i) grow(x - 140, 330, x - 62, 330, E(u, a - 0.15, a + 0.1), MUT);
        card(x, 330, 116, 44, { rx: 10, text: s, fs: 16, fw: 800, stroke: ACC, color: ACC, s: pop(u, a) }); }); }
    if (k === 4) { // 컴퓨터가 가진 것: 글자 배열
      tx(70, 258, '프로그램이 들고 있는 것', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      const chars = [...'Alice는 Acme에서 일한다.'];
      chars.forEach((ch, i) => { const s = pop(u, 0.3 + i * 0.05);
        card(86 + i * 36, 296, 32, 38, { rx: 5, text: ch === ' ' ? '␠' : ch, fs: 16, fw: 600, mono: true, stroke: GRID, sw: 1.5, s });
        if (i % 5 === 0) mono(86 + i * 36, 334, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); });
      mono(70, 380, 'extracted = []', { 'font-size': 17, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      tx(250, 380, '노드 0개 · 엣지 0개', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); } }

  // 오른쪽 목록: rows [[text, type, props?]]를 x,y 부터 한 줄씩. n 개까지 (소수면 마지막 줄 날아드는 중)
  function list(x, y, rows, n, o) { o = o || {}; const rh = o.rh || 46, w = o.w || 300;
    rows.forEach(([t, type, props], i) => { const s = clamp(n - i); if (s <= 0) return; const yy = y + i * rh;
      card(x + w / 2, yy, w, rh - 8, { rx: 8, fill: TBG[type], stroke: TC[type], sw: 2, op: s });
      tx(x + 14, yy + 6, t, { 'font-size': 16, 'font-weight': 800, fill: TC[type], opacity: s });
      mono(x + (o.tagX || 128), yy + 6, ':' + (o.label ? o.label[type] : type), { 'font-size': 14, fill: TC[type], opacity: s });
      if (props) mono(x + w - 12, yy + 6, props, { 'font-size': 13.5, fill: INK, 'text-anchor': 'end', opacity: s * (o.propOp ?? 1) }); }); }
  const SIX = [['Alice', 'Person'], ['Acme', 'Company'], ['Acme Corp', 'Company'], ['서울', 'City'], ['ACME', 'Company'], ['서울', 'City']];
  const KO = { Person: 'PS', Company: 'OG', City: 'LC' };
  function acmeBracket(x, y0, rows, op, text) { // Acme 세 줄을 묶는 빨간 괄호
    const ys = rows.map((i) => y0 + i * 46); el('path', { d: `M${x},${ys[0] - 16} h10 V${ys[ys.length - 1] + 16} h-10`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: op });
    tx(x + 18, (ys[0] + ys[ys.length - 1]) / 2 - 4, text[0], { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: op });
    tx(x + 18, (ys[0] + ys[ys.length - 1]) / 2 + 16, text[1], { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: op }); }

  // 2. NER (spaCy)
  function s2(t, c) { const { k, u } = c, toks = layout(52, 96, 46, 17);
    zone(30, 50, 450, 160, k >= 1 ? 'TEXT  (문장 3개를 한 문자열로)' : '원문', { fill: SOFT, stroke: k === 1 ? ACC : 'none', op: 1 });
    const ents = toks.filter((x) => x.type);
    drawText(toks, { fs: 17, mark: k >= 3 ? (x) => { const j = ents.indexOf(x); return k === 3 ? (j < 2 ? E(u, 0.3 + j * 0.5, 0.7 + j * 0.5) : 0) : 1; } : 0 });
    if (k === 1) { const g = E(u, 0.3, 1.6); el('rect', { x: 34, y: 54, width: 442 * g, height: 152, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 3 }); }
    if (k === 2) { const sx = lerp(40, 470, E(u, 0.3, 2.2)); el('line', { x1: sx, y1: 60, x2: sx, y2: 200, stroke: ACC, 'stroke-width': 3 });
      toks.forEach((x) => { if (x.x + x.w / 2 < sx) el('line', { x1: x.x, y1: x.y + 8, x2: x.x + x.w, y2: x.y + 8, stroke: x.type ? ACC : GRID, 'stroke-width': x.type ? 3 : 1.5 }); });
      sub(255, 236, 'doc 안에서 엔티티 span 계산 중', fade(u, 0.6), { fill: ACC, 'font-weight': 700 }); }
    // 모델 상자
    card(255, 300, 300, 64, { rx: 12, stroke: k === 0 ? ACC : GRID, sw: 2.5, s: k === 0 ? pop(u, 0.3) : 1 });
    tx(255, 296, 'spaCy  nlp', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.5) : 1 });
    mono(255, 318, 'ko_core_news_lg', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
    if (k === 2) mono(255, 370, 'mode: raw → ner', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
    // 오른쪽: doc.ents
    zone(540, 30, 390, 370, 'doc.ents', { fill: PANEL, stroke: GRID, sw: 1.5 });
    const n = k < 3 ? 0 : k === 3 ? Math.min(2, E(u, 0.8, 2.2) * 2) : 2 + E(u, 0.2, 1.6) * 4;
    mono(912, 52, String(Math.floor(n)) + '개', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: n ? ACC : MUT });
    if (n === 0) sub(735, 220, '(아직 꺼낸 것 없음)', 1, { 'font-size': 15 });
    list(556, 80, SIX, n, { label: KO, w: 250, tagX: 150 });
    if (k === 4) { acmeBracket(818, 80, [1, 2, 4], fade(u, 1.8), ['같은 회사인데', '세 줄']);
      tx(735, 380, '속성(props) 없음 · 라벨은 PS/OG/LC 뿐', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); } }

  // 3. LLM + JSON Schema
  const PROPS = ['role: Employee', 'hq: 서울', 'hq: 서울', 'country: KR', 'hq: 서울', 'country: KR'];
  function s3(t, c) { const { k, u } = c;
    // 왼쪽: 스키마 나무
    zone(24, 24, 400, 260, 'SCHEMA  (함수 호출 형식)', { fill: SOFT });
    const tree = [[50, 70, 'extract_entities', INK], [80, 112, 'entities: array', INK], [110, 154, 'items: object', INK]];
    const leaf = [['text', 'string'], ['type', 'Person | Company | City'], ['props', 'object']];
    const tg = k === 0 ? 0 : k === 1 ? E(u, 0.2, 1.8) : 1;
    tree.forEach(([x, y, s, col], i) => { const a = clamp(tg * 3 - i); if (a <= 0) return;
      if (i) el('path', { d: `M${x - 18},${y - 34} V${y - 5} H${x - 4}`, fill: 'none', stroke: MUT, 'stroke-width': 1.8, opacity: a });
      mono(x, y, s, { 'font-size': 15.5, 'font-weight': 700, fill: col, opacity: a }); });
    if (k >= 2) leaf.forEach(([a, b], i) => { const y = 196 + i * 30, s = k === 2 ? fade(u, 0.3 + i * 0.4) : 1;
      el('path', { d: `M122,${y - 22} V${y - 5} H136`, fill: 'none', stroke: MUT, 'stroke-width': 1.8, opacity: s });
      mono(142, y, a, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: s }); mono(210, y, b, { 'font-size': 13.5, fill: MUT, opacity: s }); });
    if (k === 2) { mono(40, 318, '{"text": "Alice", "type": "Person", "props": {}}', { 'font-size': 14, opacity: fade(u, 1.6) });
      tx(40, 346, '지금 가진 결과에는 props가 비어 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); }
    // 가운데: LLM 상자
    const L = [500, 150];
    card(L[0], L[1], 120, 70, { rx: 14, stroke: k >= 3 ? ACC : INK, sw: 2.5, fill: k >= 3 ? C.ACCBG : PANEL, s: k === 0 ? pop(u, 0.3) : 1 });
    tx(L[0], L[1] - 3, 'GPT-4', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.5) : 1 });
    mono(L[0], L[1] + 19, 'OpenAI()', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
    if (k === 3) { fly(230, 300, L[0] - 30, L[1] + 20, seg(u, 0.2, 1.2), 'PROMPT', { mono: true }); fly(230, 340, L[0] - 30, L[1] + 30, seg(u, 0.5, 1.5), 'SCHEMA', { mono: true, fill: INFO });
      const sp = Math.floor(t * 4) % 3; [0, 1, 2].forEach((i) => el('circle', { cx: L[0] - 14 + i * 14, cy: L[1] + 56, r: 4.5, fill: i === sp ? ACC : OFF, opacity: fade(u, 1.5) }));
      sub(L[0], L[1] + 86, '응답 기다리는 중', fade(u, 1.6)); }
    if (k === 4) for (let i = 0; i < 6; i++) dot([[L[0] + 60, L[1]], [560, 80 + i * 50]], seg(u, 0.1 + i * 0.1, 0.6 + i * 0.1), ACC, 5);
    // 오른쪽: 결과
    zone(570, 24, 370, 372, k === 4 ? '응답 (예시) · props 포함' : 'NER 결과 인계', { fill: PANEL, stroke: GRID, sw: 1.5 });
    const rows = SIX.map(([a, b], i) => [a, b, k === 4 ? PROPS[i] : null]);
    list(584, 72, rows, 6, { rh: 50, w: 342, tagX: 118, propOp: k === 4 ? fade(u, 0.6) : 1 });
    if (k < 4) el('rect', { x: 576, y: 44, width: 358, height: 340, fill: PANEL, opacity: 0.45 });
    if (k === 4) { el('path', { d: 'M930,106 h6 V286 h-6', fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.6) });
      tx(755, 390, 'Acme 세 표기는 여전히 별개', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); } }

  // 4. 정규화: 표기 키 → 별칭 사전 → 임베딩 유사도
  const KEYS = ['alice', 'acme', 'acmecorp', '서울', 'acme', '서울'];
  function s4(t, c) { const { k, u } = c, X = 92, Y = (i) => 64 + i * 56;
    tx(28, 30, 'LLM 결과 6개', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    // 합쳐진 줄은 흐리게
    const gone = (i) => (k >= 2 && (i === 2 || i === 4) ? (k === 2 ? 1 - 0.6 * E(u, 1.2, 2) : 0.4) : 0) + (k >= 3 && i === 5 ? (k === 3 ? 1 - 0.6 * E(u, 1.4, 2.2) : 0.4) : 0);
    SIX.forEach(([s, ty], i) => { const op = 1 - (gone(i) ? (1 - gone(i)) : 0);
      card(X, Y(i), 128, 40, { rx: 8, fill: TBG[ty], stroke: TC[ty], sw: 2, text: s, fs: 15, fw: 800, color: TC[ty], op });
      // 임베딩 칸(작은 막대 6개)
      for (let j = 0; j < 6; j++) { const h = 6 + ((s.charCodeAt(j % s.length) * (j + 3)) % 17);
        el('rect', { x: 166 + j * 7, y: Y(i) + 10 - h, width: 5, height: h, fill: TC[ty], opacity: (k === 0 ? fade(u, 0.6 + i * 0.15) : 1) * op * 0.75 }); } });
    if (k === 0) { card(480, 200, 300, 70, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.3) });
      tx(480, 196, 'embedder', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.5) });
      mono(480, 220, 'multilingual-MiniLM-L12', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
      tx(480, 270, '문장마다 벡터 하나', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); }
    // 표기 키
    if (k >= 1) KEYS.forEach((s, i) => { const s1 = k === 1 ? fade(u, 0.4 + i * 0.25) : 1;
      grow(222, Y(i), 262, Y(i), k === 1 ? E(u, 0.3 + i * 0.25, 0.6 + i * 0.25) : 1, MUT, { sw: 1.8 });
      mono(272, Y(i) + 5, s, { 'font-size': 16, 'font-weight': 700, fill: (k >= 2 && (s === 'acme' || s === 'acmecorp')) ? INFO : INK, opacity: s1 }); });
    if (k === 1) tx(480, 390, 'lower() · 공백 · 쉼표 제거', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
    // 별칭 사전
    if (k >= 2 && k <= 3) { const s0 = k === 2 ? pop(u, 0.2) : 1; zone(392, 6, 210, 100, 'ALIASES', { fill: SOFT, op: clamp(s0) });
      [['acme', 'Acme'], ['acmecorp', 'Acme'], ['acmecorp.', 'Acme']].forEach(([a, b], i) => mono(408, 50 + i * 22, a.padEnd(10) + '→ ' + b, { 'font-size': 14.5, opacity: k === 2 ? fade(u, 0.4 + i * 0.2) : 1 })); }
    // 오른쪽: canonical 노드
    const NX = 790, ny = { Alice: 80, Acme: 200, 서울: 322 };
    const acmeIn = k === 2 ? E(u, 0.5, 1.6) : k > 2 ? 1 : 0;
    if (acmeIn > 0) [1, 2, 4].forEach((i) => { el('path', { d: `M${342},${Y(i)} C${560},${Y(i)} ${600},${ny.Acme} ${lerp(342, NX - 70, acmeIn)},${lerp(Y(i), ny.Acme, acmeIn)}`, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k >= 4 ? 0.35 : 0.8 }); });
    if (k >= 2) { node(NX, ny.Alice, 'Alice', 'Person', { s: k === 2 ? pop(u, 0.3) : 1 }); node(NX, ny.Acme, 'Acme', 'Company', { s: k === 2 ? pop(u, 1.5) : 1 }); }
    if (k === 3) { // 서울 두 번: 유사도
      const g = E(u, 0.3, 1.2); el('path', { d: `M342,${Y(3)} C380,${Y(3)} 380,${Y(5)} 342,${Y(5)}`, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: g });
      card(500, 392, 330, 42, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.6) });
      mono(430, 398, 'cos = 1.00 > 0.9', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.8) });
      tx(590, 397, '타입도 City로 같다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1) }); }
    const seoulIn = k === 3 ? E(u, 1.3, 2.2) : k > 3 ? 1 : 0;
    if (seoulIn > 0) { [3, 5].forEach((i) => el('path', { d: `M342,${Y(i)} C560,${Y(i)} 600,${ny['서울']} ${lerp(342, NX - 60, seoulIn)},${lerp(Y(i), ny['서울'], seoulIn)}`, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k >= 4 ? 0.35 : 0.8 }));
      node(NX, ny['서울'], '서울', 'City', { s: k === 3 ? pop(u, 2) : 1 }); }
    // 노드 수
    const nv = k < 2 ? 6 : k === 2 ? Math.round(lerp(6, 4, E(u, 1.2, 2))) : k === 3 ? Math.round(lerp(4, 3, E(u, 1.4, 2.2))) : 3;
    count(926, 30, '노드', nv, { col: nv === 3 ? ACC : INK });
    if (k === 4) { [['Alice', ['Alice']], ['Acme', ['Acme', 'Acme Corp', 'ACME']], ['서울', ['서울', '서울']]].forEach(([n, al], i) => {
        mono(NX - 60, [ny.Alice, ny.Acme, ny['서울']][i] + 64, 'aliases: ' + al.join(', '), { 'font-size': 13.5, fill: INK, opacity: fade(u, 0.3 + i * 0.35) }); });
      banner(480, 392, '6개 → 3개, 같은 회사는 노드 하나', pop(u, 1.6)); } }

  // 5. Precision · Recall · F1
  const GOLD = [['Alice', 'Person'], ['Acme', 'Company'], ['서울', 'City']];
  function s5(t, c) { const { k, u } = c, b = c.beat.dataState, p = c.prev ? c.prev.dataState : null;
    const G0 = [250, 210], r = 150, slide = k < 2 ? 0 : k === 2 ? E(u, 0.2, 1.4) : 1;
    const px = k === 0 ? null : lerp(430, G0[0], slide);
    el('circle', { cx: G0[0], cy: G0[1], r, fill: C.GOODBG, stroke: GOOD, 'stroke-width': 2.5, opacity: k === 0 ? fade(u, 0.2) : 1 });
    tx(G0[0] - r + 18, G0[1] - r + 22, 'GOLD', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    if (px != null) { el('circle', { cx: px, cy: G0[1], r, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '8 5', opacity: k === 1 ? fade(u, 0.3) : 1 });
      tx(px + r - 64, G0[1] - r + 22, 'PRED', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.3) : 1 }); }
    GOLD.forEach(([n, ty], i) => { const y = G0[1] - 62 + i * 62;
      node(G0[0] - (k >= 1 ? 0 : 0), y, n, ty, { tag: false, s: k === 0 ? pop(u, 0.4 + i * 0.3) : 1 });
      if (k === 1) node(px + 0, y, n, ty, { tag: false, op: 0.5, s: pop(u, 0.6 + i * 0.3) });
      if (k >= 2 && k <= 2) { const g = E(u, 1.2 + i * 0.2, 1.5 + i * 0.2); if (g > 0) check(G0[0] + 76, y, 9, g); }
      if (k >= 3) check(G0[0] + 76, y, 9, 1); });
    // 계수
    const f = b.f1, pf = p && p.f1;
    if (f) { [['TP', f.tp, GOOD], ['FP', f.fp, BAD], ['FN', f.fn, WARN]].forEach(([n, v, col], i) => {
      const op = k === 2 ? fade(u, 1.6 + i * 0.2) : 1; tx(530, 70 + i * 34, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); mono(566, 70 + i * 34, '= ' + v, { 'font-size': 16, 'font-weight': 800, opacity: op }); });
      // 막대 3개
      const names = [['Precision', 'precision', 'TP/(TP+FP) = 3/3'], ['Recall', 'recall', 'TP/(TP+FN) = 3/3'], ['F1', 'f1', '2PR/(P+R)']];
      const X0 = 640, W = 250;
      names.forEach(([nm, key, fm], i) => { const y = 200 + i * 66, v = tween(pf ? pf[key] : 0, f[key], c.u);
        tx(X0, y - 8, nm, { 'font-size': 15, 'font-weight': 800 }); mono(X0 + W, y - 8, fm, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
        hbar(X0, y, W, v, 1, { h: 20, col: i === 2 ? ACC : GOOD, text: v.toFixed(2) }); });
      if (k === 4) { const x = X0 + W * 0.85; [0, 1, 2].forEach((i) => el('line', { x1: x, y1: 196 + i * 66, x2: x, y2: 224 + i * 66, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: fade(u, 0.6) }));
        mono(x, 362, '목표 0.85', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8) });
        tx(250, 402, '세 엔티티 모두 gold와 일치', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) }); } }
    else if (k === 1) tx(620, 110, '정규화 결과 3개를 PRED로', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) });
    else tx(620, 110, '사람이 라벨링한 정답 3개', { 'font-size': 15, fill: MUT, opacity: fade(u, 1) }); }

  const quiz = [
    { q: '"Alice는 Acme에서 일한다…" 세 문장에서 사람이 읽어 낸 개념은 몇 개인가?',
      o: ['6개, 언급마다 하나씩', '3개, 같은 회사·같은 도시를 하나로 본다', '0개, 아직 추출하지 않았다'], a: 1,
      why: '언급은 6개지만 Acme 세 표기와 서울 두 번을 하나로 묶으면 Alice·Acme·서울 3개다. 프로그램은 이 묶기를 스스로 하지 못한다.' },
    { q: 'spaCy NER 결과에서 끝까지 해결되지 않는 문제는 무엇인가?',
      o: ['Alice를 인물로 못 알아본다', 'Acme·Acme Corp·ACME가 서로 다른 항목으로 남는다', '서울을 도시로 못 알아본다'], a: 1,
      why: 'NER은 언급 하나하나에 라벨을 붙일 뿐이라 표기가 다르면 다른 항목이다. 속성도 뽑지 못한다.' },
    { q: 'LLM에 JSON Schema를 함수로 넘기면 NER보다 나아지는 점은 무엇인가?',
      o: ['라벨을 자유롭게 정하고 role·hq 같은 속성까지 함께 받는다', '표기 변형이 저절로 하나로 합쳐진다', '호출 비용이 들지 않는다'], a: 0,
      why: '스키마로 text·type·props 형식을 강제하니 속성까지 한 번에 온다. 하지만 Acme 세 표기는 여전히 따로라 정규화가 필요하다.' },
    { q: '"서울"이 두 번 나왔을 때 normalize.py가 둘을 합치는 조건은 무엇인가?',
      o: ['별칭 사전에 서울이 있을 때', '두 언급의 글자 수가 같을 때', '임베딩 cos 유사도가 0.9를 넘고 타입도 같을 때'], a: 2,
      why: '서울은 ALIASES에 없으니 임베딩 유사도로 판단한다. 같은 글자라 cos 1.00이고 타입도 City라 한 노드가 되어 6개가 3개로 줄었다.' },
    { q: 'GOLD 3개와 PRED 3개가 똑같을 때 Precision·Recall·F1은 얼마인가?',
      o: ['셋 다 1.00', 'Precision만 1.00, Recall은 0.00', '셋 다 0.33'], a: 0,
      why: 'TP=3, FP=0, FN=0이라 Precision 3/3, Recall 3/3이고 F1도 1.00이다. 운영에서는 F1 0.85 이상을 목표로 둔다.' },
  ];

  const summary = [
    '원문은 글자 배열일 뿐이라 인물·회사·도시를 골라내는 추출이 먼저다.',
    'NER은 빠르고 무료지만 라벨이 정해져 있고 Acme 세 표기를 따로 뽑는다.',
    'LLM에 JSON Schema를 주면 속성까지 받지만 표기 변형은 그대로 남는다.',
    '별칭 사전과 임베딩 유사도로 6개 언급을 노드 3개로 합치고 F1로 점수를 낸다.',
  ];
  const review = [
    { q: '추출한 회사 노드를 세어 보니 실제 회사 수의 세 배였다. 먼저 손볼 곳은?',
      o: ['NER 모델을 더 큰 것으로 바꾼다', '표기 정규화와 별칭 사전으로 같은 회사를 묶는다', '평가용 gold 셋을 지운다'], a: 1,
      why: 'Acme·Acme Corp·ACME처럼 표기만 다른 언급이 따로 노드가 된 경우다. 정규화 단계에서 canonical 하나로 합쳐야 한다.' },
    { q: '사내 문서에서 :Drug, :Symptom 같은 도메인 라벨과 용량 속성까지 뽑아야 한다. 어울리는 방법은?',
      o: ['spaCy 기본 NER만 쓴다', '정규화만 돌린다', 'JSON Schema로 라벨과 props를 정한 LLM 추출'], a: 2,
      why: 'NER은 학습된 라벨만 낸다. LLM 함수 호출은 스키마로 라벨과 속성을 정할 수 있어 도메인 추출에 맞는다.' },
    { q: '추출 결과 Precision은 높은데 Recall이 낮게 나왔다. 무엇을 뜻하나?',
      o: ['뽑은 것은 대부분 맞지만 정답 중 놓친 것이 많다', '헛 추출이 많다', '정규화가 과하게 합쳤다'], a: 0,
      why: 'Precision은 뽑은 것 중 맞은 비율, Recall은 정답 중 잡은 비율이다. Recall이 낮으면 FN, 즉 누락이 많다는 뜻이다.' },
  ];

  R.page({ title: '텍스트 → 엔티티 추출', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
