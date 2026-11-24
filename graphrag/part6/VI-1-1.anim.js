/* VI-1-1 온톨로지 설계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   chaos_demo.py · ontology_design.py · validate 결과는 Python 3.12 로 실제 실행한 출력이다 (['김이사'], 3 / (True,'OK') · 도메인 위반 · 레인지 위반).
   RDF 트리플 5개는 rdflib 7.6 으로 같은 그래프를 만들어 len(g) = 5 를 확인했다. 클래스 계층의 조상은 networkx 로 확인했다.
   LLM 응답은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, check, cross, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const exam = (x, y, op) => pill(x, y, '예시', WARN, 1, { fs: 13.5, op: op ?? 1 });

  const TY = { P: [ACC, ACCBG], C: [INFO, INFOBG], X: [MUT, PANEL], L: [WARN, WARNBG] };
  function node(x, y, name, o) { o = o || {}; const [col, bg] = TY[o.t || 'X'], s = o.s ?? 1; if (s <= 0.02) return; const w = Math.max(70, tw(name, 14.5) + 24), g = G(x, y, s, o.op);
    el('rect', { x: -w / 2, y: -17, width: w, height: 34, rx: o.lit ? 4 : 17, fill: bg, stroke: o.stroke || col, 'stroke-width': o.hot ? 3 : 2, 'stroke-dasharray': o.dash }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: o.color || INK, class: o.mono ? 'mono' : null }, g);
    if (o.tag) mono(0, -24, o.tag, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700 }, g); return w; }
  function arc(a, b, u, rel, o) { o = o || {}; if (u <= 0) return; const [x1, y1, w1 = 80] = a, [x2, y2, w2 = 80] = b;
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const pad = (w, ux0, uy0) => Math.min(Math.abs(ux0) > 1e-3 ? (w / 2) / Math.abs(ux0) : 1e9, Math.abs(uy0) > 1e-3 ? 17 / Math.abs(uy0) : 1e9) + 3;
    const p1 = pad(w1, ux, uy), p2 = pad(w2, ux, uy), sx = x1 + ux * p1, sy = y1 + uy * p1, ex = x2 - ux * p2, ey = y2 - uy * p2;
    grow(sx, sy, ex, ey, u, o.col || MUT, { sw: o.sw || 2.2, dash: o.dash });
    if (rel && u > 0.6) { const mx = (sx + ex) / 2 + (o.lx || 0), my = (sy + ey) / 2 + (o.ly || 0), w = tw(rel, 13.5) + 10, op = seg(u, 0.6, 1);
      el('rect', { x: mx - w / 2, y: my - 11, width: w, height: 22, rx: 4, fill: PANEL, opacity: op }); mono(mx, my + 5, rel, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.rcol || o.col || INK, 'font-weight': 700, opacity: op }); } }

  // ---------- 1. 온톨로지 없는 혼돈 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 4) { const L = [80, 360], Rr = [280, 690];
      // 조각 그래프 4개
      const F = [['김이사', 'worksFor', '우리회사', '추출기 A', 90], ['Kim', 'employedBy', 'OurCorp', '추출기 B', 170], ['김이사', '재직', '우리회사', '수기 입력', 250], ['박대리', 'works_at', '우리회사', '추출기 A', 330]];
      F.forEach(([s0, p0, o0, src, y], i) => { const show = i <= Math.min(k + 1, 2) || (i === 3 && k >= 4); if (!show) return;
        const now = (k === 0 && i <= 1) || (k === 1 && i === 2) || (k === 4 && i === 3), s = now ? pop(u, 0.2 + (k === 0 ? i * 0.5 : 0)) : 1;
        const lit = k >= 2 && k <= 3 && p0 === 'worksFor', miss = k >= 2 && k <= 3 && p0 !== 'worksFor' && i < 3;
        mono(40, y + 5, src, { 'font-size': 13.5, fill: MUT, opacity: s });
        const w1 = node(200, y, s0, { s }), w2 = node(520, y, o0, { s });
        arc([200, y, w1], [520, y, w2], now ? seg(u, 0.5 + (k === 0 ? i * 0.5 : 0), 1.2 + (k === 0 ? i * 0.5 : 0)) : 1, p0, { col: lit ? ACC : miss ? OFF : MUT, rcol: lit ? ACC : miss ? MUT : BAD, sw: lit ? 3 : 2 });
        if (miss && k === 3) cross(620, y, 9, pop(u, 0.4)); if (lit && k === 3) check(620, y, 10, pop(u, 0.4)); });
      if (k === 1) tx(780, 250, '관계 이름 2 → 3', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      if (k === 2) { el('rect', { x: 680, y: 90, width: 250, height: 70, rx: 8, fill: INK, opacity: fade(u, 0.2) }); mono(694, 118, 'find_employees(...)', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.3) }); mono(694, 142, '  p == "worksFor"', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.5) }); }
      if (k === 3) { el('rect', { x: 680, y: 90, width: 250, height: 70, rx: 8, fill: INK }); mono(694, 118, '>>> print(hits)', { 'font-size': 14, fill: 'var(--term)' }); mono(694, 142, "['김이사']", { 'font-size': 15, fill: PANEL, opacity: fade(u, 0.4) });
        R.meters(680, 200, 250, [{ name: '저장', val: '3건' }, { name: '조회', val: '1명', hot: true }]); tx(805, 310, '저장한 사실의 2/3 이 사라진다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); }
      if (k === 4) { [[200, 90, 200, 170], [520, 90, 520, 170]].forEach(([x1, y1, x2, y2], i) => { el('path', { d: `M${x1 + 50},${y1 + 4} Q${x1 + 90},${(y1 + y2) / 2} ${x2 + 50},${y2 - 4}`, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 1.0 + i * 0.3) });
          tx(x1 + 96, (y1 + y2) / 2 + 5, '같은 대상?', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.1 + i * 0.3) }); });
        tx(810, 250, '파편 3 → 4건', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); }
      return; }
    // k5: 온톨로지로 정렬
    const m = E(u, 0.2, 1.2);
    const pk = node(250, 140, '김이사', { t: 'P', tag: ':Person', s: pop(u, 0.4) }), pp = node(250, 300, '박대리', { t: 'P', tag: ':Person', s: pop(u, 0.6) }), oc = node(620, 220, 'OurCorp', { t: 'C', tag: ':Company', s: pop(u, 0.8) });
    arc([250, 140, pk], [620, 220, oc], seg(u, 1.0, 1.6), 'WORKS_AT', { col: ACC, sw: 2.8 }); arc([250, 300, pp], [620, 220, oc], seg(u, 1.2, 1.8), 'WORKS_AT', { col: ACC, sw: 2.8 });
    ['worksFor', 'employedBy', '재직', 'works_at'].forEach((w, i) => { const x = 820, y = 110 + i * 40, op = 1 - m * 0.75; mono(x, y, w, { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', opacity: op, 'text-decoration': u > 1.2 ? 'line-through' : null }); });
    tx(820, 300, '관계 어휘 4 → 1', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); }

  // ---------- 2. 클래스 · 속성 · 제약 ----------
  const CL = { Thing: [470, 90], Agent: [330, 175], City: [640, 175], Person: [220, 265], Company: [440, 265] };
  function tree(k, u, o) { o = o || {}; const ed = [['Agent', 'Thing'], ['City', 'Thing'], ['Person', 'Agent'], ['Company', 'Agent']];
    ed.forEach(([a, b], i) => { const g = o.grow ? seg(u, 0.3 + i * 0.25, 0.8 + i * 0.25) : 1; if (g <= 0) return; const [x1, y1] = CL[a], [x2, y2] = CL[b];
      el('line', { x1, y1: y1 - 17, x2: lerp(x1, x2, g), y2: lerp(y1 - 17, y2 + 17, g), stroke: o.hotUp && (a === 'Person' || a === 'Agent' && o.hotUp > 1) ? ACC : MUT, 'stroke-width': 2.2 });
      if (g > 0.95) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; el('path', { d: `M${lerp(x1, x2, 0.92) - 5},${lerp(y1 - 17, y2 + 17, 0.92) + 4} l5,-9 l5,9 z`, fill: MUT }); } });
    Object.keys(CL).forEach((nm, i) => { const [x, y] = CL[nm]; node(x, y, nm, { t: nm === 'Person' ? 'P' : nm === 'Company' ? 'C' : nm === 'City' ? 'L' : 'X', lit: true, s: o.grow ? pop(u, 0.1 + i * 0.2) : 1, hot: o.hot && o.hot(nm) }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { el('rect', { x: 260, y: 90, width: 440, height: 180, rx: 10, fill: INK, opacity: fade(u, 0.2) });
      ['@dataclass', 'class RelationSchema:', '    domain: str       # 출발 클래스', '    range: str        # 도착 클래스', '    cardinality: str = "N:N"'].forEach((l, i) => mono(280, 122 + i * 30, l, { 'font-size': 15, fill: i === 4 ? PANEL : 'var(--term)', opacity: fade(u, 0.3 + i * 0.25) }));
      tx(480, 330, '관계마다 같은 형식으로 규칙을 붙일 그릇', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { tree(k, u, { grow: true }); tx(820, 175, 'Person ⊂ Agent ⊂ Thing', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      tx(820, 205, '부모의 규칙을 물려받는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    tree(k, u, { hot: k === 4 ? (nm) => nm === 'Person' || (nm === 'Agent' && u > 1.2) : null, hotUp: k === 4 ? (u > 1.2 ? 2 : 1) : 0 });
    if (k === 2) { [['name: str', 220, 315], ['birthCity: str', 220, 345], ['name: str', 440, 315], ['foundedYear: int', 440, 345]].forEach(([s0, x, y], i) => mono(x, y, s0, { 'font-size': 14, 'text-anchor': 'middle', fill: i < 2 ? ACC : INFO, opacity: fade(u, 0.3 + i * 0.3) }));
      tx(800, 300, '데이터 속성 · 값이 문자열·숫자', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    if (k === 3) { const rel = [['WORKS_AT', 'Person', 'Company', 'N:1', 330], ['FOUNDED', 'Person', 'Company', '1:N', 365], ['LOCATED_IN', 'Company', 'City', 'N:1', 400]];
      rel.forEach(([r0, d, rg, cd, y], i) => { const s = fade(u, 0.3 + i * 0.4); mono(80, y, r0, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: s }); mono(240, y, `${d} → ${rg}`, { 'font-size': 14.5, opacity: s }); mono(450, y, cd, { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: s }); });
      el('path', { d: 'M265,280 Q330,330 400,280', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.4), 'marker-end': 'url(#ra-ahb)' });
      el('path', { d: 'M480,280 Q600,320 630,195', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.2), 'marker-end': 'url(#ra-ahb)' });
      tx(800, 330, '객체 속성 · 값이 다른 노드', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { dot([[220, 248], [330, 192], [330, 158], [470, 107]], seg(u, 0.3, 2.2), ACC, 7);
      el('rect', { x: 680, y: 260, width: 250, height: 76, rx: 8, fill: INK, opacity: fade(u, 0.2) }); mono(694, 288, 'is_subclass("Person",', { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.3) }); mono(694, 312, '            "Agent") → True', { 'font-size': 14, fill: PANEL, opacity: fade(u, 1.4) }); return; }
    // k5 검증
    const V = [['(김이사)-[WORKS_AT]->(OurCorp)', true, 'OK'], ['(OurCorp)-[WORKS_AT]->(김이사)', false, '도메인 위반: 주어는 Person'], ['(김이사)-[WORKS_AT]->(서울)', false, '레인지 위반: 목적어는 Company']];
    V.forEach(([tr, ok, why], i) => { const y = 330 + i * 30, s = fade(u, 0.3 + i * 0.4); mono(80, y, tr, { 'font-size': 14, opacity: s }); (ok ? check : cross)(480, y - 5, 8, s > 0.5 ? 1 : 0); tx(500, y, why, { 'font-size': 14, fill: ok ? GOOD : BAD, 'font-weight': 700, opacity: s }); });
    tx(800, 160, '스키마가 곧', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(800, 186, '입력 검증기', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); }

  // ---------- 3. RDF/OWL vs 프로퍼티 그래프 ----------
  const RDF = [[':김이사', 'rdf:type', ':Person'], [':김이사', ':name', '"김이사"'], [':김이사', ':worksAt', ':OurCorp'], [':OurCorp', 'rdf:type', ':Company'], [':OurCorp', ':foundedYear', '2011']];
  const RP = { ':김이사': [140, 220], ':Person': [90, 340], '"김이사"': [240, 340], ':OurCorp': [340, 140], ':Company': [420, 250], '2011': [440, 70] };
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) { tx(40, 46, 'RDF · 트리플 + URI', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      if (k === 0) { R.dbIcon(240, 210, 'Graph()', { s: pop(u, 0.3), stroke: INFO }); mono(240, 320, 'EX = Namespace("http://ex.org/")', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
        tx(700, 210, '모든 것을 전역 URI 로 부른다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.3) }); return; }
      const n = k === 1 ? Math.ceil(E(u, 0.2, 1.4) * 3) : 5; const nNow = k === 2 ? 3 + Math.ceil(E(u, 0.2, 1.2) * 2) : n;
      const used = new Set(); RDF.slice(0, nNow).forEach(([s0, p0, o0]) => { used.add(s0); used.add(o0); });
      RDF.slice(0, nNow).forEach(([s0, p0, o0], i) => { const lit = o0.startsWith('"') || /^\d/.test(o0); arc([...RP[s0], 90], [...RP[o0], lit ? 90 : 96], 1, p0, { col: INFO, rcol: INFO, sw: 2 }); });
      [...used].forEach((nm) => { const [x, y] = RP[nm], lit = nm.startsWith('"') || /^\d/.test(nm); node(x, y, nm, { t: lit ? 'L' : 'C', lit, mono: true }); });
      mono(260, 405, `len(g) = ${nNow}`, { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
      if (k >= 3) { el('line', { x1: 530, y1: 60, x2: 530, y2: 400, stroke: GRID, 'stroke-width': 2 }); tx(560, 46, '프로퍼티 그래프 · 노드 + 속성', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
        const g1 = pop(u, 0.4), g2 = pop(u, 0.7); el('rect', { x: 570, y: 130, width: 150, height: 80, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: g1 });
        mono(585, 156, ':Person', { 'font-size': 14, fill: ACC, 'font-weight': 800, opacity: g1 }); mono(585, 186, 'name="김이사"', { 'font-size': 14, opacity: g1 });
        el('rect', { x: 760, y: 240, width: 180, height: 96, rx: 10, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: g2 });
        mono(775, 266, ':Company', { 'font-size': 14, fill: INFO, 'font-weight': 800, opacity: g2 }); mono(775, 294, 'name="OurCorp"', { 'font-size': 14, opacity: g2 }); mono(775, 318, 'foundedYear=2011', { 'font-size': 14, opacity: g2 });
        grow(720, 190, 800, 236, seg(u, 1.0, 1.5), ACC); mono(800, 200, 'WORKS_AT', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
        tx(740, 385, '트리플 5줄 = 노드 2 + 관계 1', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) }); }
      else tx(700, 220, k === 1 ? '속성 하나에 트리플 하나' : 'URI 연결 · OWL 추론의 대가', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
      return; }
    // k4~5 비교표
    const rows = [['기본 단위', '트리플 (S,P,O)', '노드 · 관계 · 속성'], ['식별자', '전역 URI', '내부 ID'], ['표준 추론', 'OWL 추론기', '앱에서 구현'], ['기관 간 연계', 'URI 로 연결', '약함'], ['앱 개발·성능', '장황', '직관 · 빠름'], ['대표 도구', 'RDFLib · GraphDB', 'Neo4j · Neptune']];
    const n = k === 4 ? 3 : 6; tx(300, 60, 'RDF/OWL', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' }); tx(620, 60, '프로퍼티 그래프', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    rows.slice(0, n).forEach(([a, b, c0], i) => { const y = 100 + i * 40, now = (k === 4) || (k === 5 && i >= 3), s = now ? fade(u, 0.2 + (i % 3) * 0.3) : 1;
      el('line', { x1: 60, y1: y + 14, x2: 780, y2: y + 14, stroke: GRID, opacity: s }); tx(70, y, a, { 'font-size': 14.5, 'font-weight': 700, opacity: s });
      tx(300, y, b, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: s }); tx(620, y, c0, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: s }); });
    if (k === 5) { card(300, 370, 260, 48, { rx: 10, stroke: INFO, sw: 2, text: '공공 지식 · 표준 연계', fs: 14.5, s: pop(u, 1.5) }); card(620, 370, 260, 48, { rx: 10, stroke: ACC, sw: 2.5, text: '사내 앱 · 성능 · GraphRAG', fs: 14.5, s: pop(u, 1.8) }); } }

  // ---------- 4. 질문에서 스키마로 (반복 설계) ----------
  const PH = ['① 질문', '② 개념', '③ 초안', '④ 검증', '⑤ 반복'];
  function wheel(k0, u) { const cx = 180, cy = 225, r = 125, k = [0, 1, 2, 3, 3, 4][k0], loop = k0 === 5;
    PH.forEach((p, i) => { const a = -Math.PI / 2 + i * (2 * Math.PI / 5), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; let on = false; const done = i < k;
      const a2 = a + 2 * Math.PI / 5; on = i === k; if (i < 4 || loop) el('path', { d: `M${cx + Math.cos(a + 0.32) * r},${cy + Math.sin(a + 0.32) * r} A${r},${r} 0 0 1 ${cx + Math.cos(a2 - 0.32) * r},${cy + Math.sin(a2 - 0.32) * r}`, fill: 'none', stroke: done || (loop && i === 4) ? ACC : GRID, 'stroke-width': 2.5, 'marker-end': done || (loop && i === 4) ? 'url(#ra-ahb)' : 'url(#ra-ah)' });
      card(x, y, 84, 34, { rx: 17, stroke: on || done ? ACC : GRID, fill: on ? ACC : done ? ACCBG : PANEL, color: on ? PANEL : done ? ACC : MUT, text: p, fs: 14, sw: 2, s: on && k0 !== 4 ? 1 + R.bump(u, 0.1) : 1 }); }); }
  function s4(t, c) { const { k, u } = c; wheel(k, u); const X = 400;
    if (k === 0) { ['"이 회사에 누가 다녔나?"', '"그 사람 출신 도시는?"', '"회사는 언제 설립됐나?"'].forEach((q, i) => card(660, 120 + i * 70, 360, 50, { rx: 25, stroke: ACC, sw: 2, text: q, fs: 15, s: pop(u, 0.3 + i * 0.35) }));
      tx(660, 360, '질문이 곧 요구사항', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { const ex = [['김이사', 'Person', 'P'], ['박대리', 'Person', 'P'], ['OurCorp', 'Company', 'C'], ['서울', 'City', 'L']];
      ex.forEach(([n0, cl, ty], i) => { const y = 110 + i * 66; node(X + 120, y, n0, { s: pop(u, 0.2 + i * 0.25) }); grow(X + 180, y, X + 290, y, seg(u, 0.6 + i * 0.25, 1.0 + i * 0.25), MUT); node(X + 380, y, cl, { t: ty, lit: true, s: pop(u, 0.9 + i * 0.25) }); });
      tx(X + 250, 395, '질문 속 명사 → 클래스', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { const rels = ['WORKS_AT', 'FOUNDED', 'LOCATED_IN']; el('rect', { x: X + 40, y: 90, width: 300, height: 150, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
      mono(X + 56, 116, 'RELATIONS (초안 = 계약)', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); rels.forEach((r0, i) => mono(X + 70, 150 + i * 28, r0, { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.2) }));
      fly(X + 500, 330, X + 200, 260, seg(u, 0.9, 1.8), 'BORN_IN', { fill: BAD, mono: true });
      if (u > 1.8) { cross(X + 200, 300, 11, pop(u, 1.8)); mono(X + 280, 305, '(False, "미정의 관계")', { 'font-size': 14, fill: BAD, 'font-weight': 700 }); } return; }
    if (k === 3 || k === 4) { const ok = k === 3; const w1 = node(X + 90, 160, '김이사', { t: 'P', tag: ':Person' }), w2 = node(X + 420, 160, ok ? 'OurCorp' : '서울', { t: ok ? 'C' : 'L', tag: ok ? ':Company' : ':City' });
      arc([X + 90, 160, w1], [X + 420, 160, w2], seg(u, 0.3, 1.0), 'WORKS_AT', { col: ok ? GOOD : BAD });
      mono(X + 90, 230, ok ? '주어 Person = 도메인 Person' : '목적어 City ≠ 레인지 Company', { 'font-size': 14.5, fill: ok ? GOOD : BAD, 'font-weight': 700, opacity: fade(u, 1.1) });
      (ok ? check : cross)(X + 255, 280, 12, pop(u, 1.4));
      if (!ok) { tx(X + 255, 340, '"김이사 출신?" 을 넣으니 BORN_IN 샘플이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); }
      else tx(X + 255, 340, '"OurCorp 재직자?" → 김이사', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    R.meters(X + 40, 110, 460, [{ name: '통과', val: '1건', good: true }, { name: '위반', val: '2건', hot: true }]);
    ['BORN_IN 샘플 보강', 'City 클래스 확정', '새 질문 수집'].forEach((s0, i) => pill(X + 270, 230 + i * 50, s0, ACC, pop(u, 0.6 + i * 0.3), { fs: 14.5 })); }

  // ---------- 5. 추출 가드레일 ----------
  function trip(x, y, s0, p0, o0, col, op) { mono(x, y, `(${s0})-[`, { 'font-size': 14.5, opacity: op }); const x2 = x + tw(`(${s0})-[`, 14.5);
    mono(x2, y, p0, { 'font-size': 14.5, fill: col, 'font-weight': 800, opacity: op }); mono(x2 + tw(p0, 14.5), y, `]->(${o0})`, { 'font-size': 14.5, opacity: op }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 90, '제약 없는 LLM 출력', { 'font-size': 15, 'font-weight': 700, fill: MUT }); trip(60, 140, '김이사', 'is employed by', '우리회사', BAD, fade(u, 0.4)); trip(60, 180, '김이사', 'founded', '스타트업', BAD, fade(u, 0.8)); exam(420, 90, fade(u, 0.4));
      mono(620, 140, 'RELATIONS', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); mono(620, 166, 'validate_triple', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      tx(480, 300, '추출 모듈이 온톨로지와 검증기를 그대로 가져온다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { el('rect', { x: 60, y: 90, width: 520, height: 110, rx: 8, fill: INK }); mono(76, 118, '>>> classes', { 'font-size': 14.5, fill: 'var(--term)' }); mono(76, 142, "['City', 'Company', 'Person']", { 'font-size': 14.5, fill: PANEL, opacity: fade(u, 0.5) });
      mono(76, 170, '>>> rels  →  WORKS_AT · FOUNDED · LOCATED_IN', { 'font-size': 14.5, fill: PANEL, opacity: fade(u, 1.0) });
      tx(60, 250, '도메인·레인지에서 모으면 City 까지 들어간다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      tx(60, 280, 'DATA_PROPERTIES 키만 쓰면 [Person, Company] 뿐이다', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { el('rect', { x: 200, y: 70, width: 560, height: 300, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2 });
      ['아래 텍스트에서 지식 트리플을 추출하라.', '', "[허용 클래스] ['City', 'Company', 'Person']", "[허용 관계]   ['WORKS_AT', 'FOUNDED', 'LOCATED_IN']", '규칙: 위 어휘로만, 관계는 도메인·레인지를 지켜라.', '출력: JSON 배열 [{"s":..,"p":..,"o":..}]'].forEach((l, i) => { if (!l) return;
        const hot = i === 4; mono(220, 106 + i * 40, l, { 'font-size': 14, fill: hot ? ACC : INK, 'font-weight': hot ? 800 : 400, opacity: fade(u, 0.2 + i * 0.25) }); }); return; }
    // k3~4: LLM 응답 → 검증
    const raw = [['Person:김이사', 'WORKS_AT', 'Company:OurCorp', true], ['Person:김이사', 'FOUNDED', 'Company:스타트업', true], ['Company:OurCorp', 'WORKS_AT', 'Person:김이사', false]];
    if (k === 3 || k === 4) { tx(60, 80, 'LLM 응답 (JSON 파싱)', { 'font-size': 15, 'font-weight': 700, fill: MUT }); exam(280, 74);
      raw.forEach(([s0, p0, o0, ok], i) => { const y = 130 + i * 50, s = k === 3 ? fade(u, 0.3 + i * 0.3) : 1, gone = k === 4 && !ok && u > 1.4;
        trip(60, y, s0, p0, o0, ok || k === 3 ? ACC : BAD, gone ? 0.35 : s);
        if (k === 4) { (ok ? check : cross)(620, y - 5, 9, pop(u, 0.4 + i * 0.3)); tx(640, y, ok ? '채택' : '거부 · 도메인 위반', { 'font-size': 14.5, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, 0.5 + i * 0.3) }); } });
      if (k === 4) banner(480, 340, '채택 2건 · 스키마가 최종 게이트', pop(u, 1.6)); return; }
    if (k === 5) { const V = [['v1', 'Person · Company · WORKS_AT', '초기 배포'], ['v2', '+ City · + BORN_IN', '출신 질문 대응'], ['v3', 'foundedYear → foundingDate', '마이그레이션 필요']];
      el('line', { x1: 120, y1: 210, x2: lerp(120, 840, E(u, 0.2, 1.6)), y2: 210, stroke: MUT, 'stroke-width': 2.5 });
      V.forEach(([v, ch, nt], i) => { const x = 160 + i * 320, s = pop(u, 0.3 + i * 0.5); el('circle', { cx: x, cy: 210, r: 14 * s, fill: ACC });
        mono(x, 175, v, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s }); tx(x, 250, ch, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.5) }); tx(x, 276, nt, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); });
      tx(480, 360, '스키마도 버전으로 관리한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2) }); return; }
    const M = [['Person', 'schema.org/Person', 'P'], ['Company', 'schema.org/Organization', 'C'], ['foundedYear', 'schema.org/foundingDate', 'L']];
    M.forEach(([a, b, ty], i) => { const y = 120 + i * 80; const w = node(200, y, a, { t: ty, lit: true, s: pop(u, 0.2 + i * 0.3) }); grow(260, y, 470, y, seg(u, 0.5 + i * 0.3, 1.0 + i * 0.3), MUT); mono(490, y + 5, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.3) }); });
    tx(480, 380, '바닥부터 만들지 않고 공개 어휘를 물려받는다 · FOAF · Dublin Core 도 후보', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2) }); }

  const quiz = [
    { q: 'chaos_demo.py에서 트리플 3건을 넣고 find_employees(..., "우리회사")를 부르면 몇 명이 나오는가?',
      o: ['3명', '1명', '0명'], a: 1,
      why: '조회가 p == "worksFor" 만 비교하므로 employedBy, 재직으로 저장된 사실은 빠진다. 출력은 [\'김이사\'] 하나다.' },
    { q: 'validate_triple("OurCorp", "WORKS_AT", "김이사")가 False인 까닭은 무엇인가?',
      o: ['WORKS_AT가 정의되지 않은 관계라서', '레인지가 City라서', '주어 OurCorp가 Company라 도메인 Person을 어겨서'], a: 2,
      why: 'WORKS_AT의 도메인은 Person, 레인지는 Company다. 뒤집힌 트리플은 도메인 검사에서 걸린다.' },
    { q: '"김이사가 OurCorp에서 일한다" 를 RDF로 넣은 예제 그래프의 트리플 수는 몇 개인가?',
      o: ['5개', '2개', '3개'], a: 0,
      why: '타입, 이름, 근무처, 회사 타입, 설립연도가 각각 트리플이다. 프로퍼티 그래프로는 노드 2개와 관계 1개다.' },
    { q: '반복 설계에서 BORN_IN이 빠졌다는 사실을 드러낸 단계는 무엇인가?',
      o: ['① 질문 수집', '④ 샘플 검증', '③ 스키마 초안'], a: 1,
      why: '"김이사 출신?" 질문을 샘플 데이터에 넣어 보니 답할 관계가 없었다. 그래서 ⑤에서 보강하고 ①로 돌아간다.' },
    { q: 'llm_extract.py가 허용 클래스를 DATA_PROPERTIES.keys() 로만 만들면 생기는 문제는 무엇인가?',
      o: ['관계 목록이 비게 된다', '프롬프트가 너무 길어진다', 'City가 빠져 LOCATED_IN의 레인지를 쓸 수 없다'], a: 2,
      why: 'DATA_PROPERTIES에는 Person, Company만 있다. 관계의 도메인·레인지에서 모으면 City까지 들어간다.' },
  ];

  const summary = [
    '같은 사실이 worksFor, employedBy, 재직으로 갈라지면 한 이름으로 조회할 때 셋 중 둘이 사라진다.',
    '온톨로지는 클래스 계층, 데이터 속성, 관계의 도메인·레인지·카디널리티를 정해 입력 검증기가 된다.',
    'RDF는 트리플과 URI로 연계와 추론에 강하고, 프로퍼티 그래프는 노드에 속성을 달아 앱과 성능에 강하다.',
    '스키마는 질문에서 끌어내 샘플로 검증하며 키우고, LLM 추출 프롬프트에 넣어 어휘를 묶는다.',
  ];
  const review = [
    { q: 'LLM 추출을 돌렸더니 "is employed by", "works for" 가 섞여 저장됐다. 가장 먼저 할 일은?',
      o: ['허용 관계 목록을 프롬프트에 넣고 검증기로 통과분만 저장한다', '임베딩 모델을 더 큰 것으로 바꾼다', '저장 후 사람이 하나씩 고친다'], a: 0,
      why: '온톨로지를 가드레일로 주입하면 LLM 출력이 WORKS_AT으로 모이고, validate_triple이 남은 위반을 거른다.' },
    { q: '여러 기관의 공개 데이터와 이어 붙이고 "Person이면 Agent" 같은 추론도 필요한 프로젝트다. 맞는 선택은?',
      o: ['프로퍼티 그래프만', 'RDF/OWL', '관계형 테이블'], a: 1,
      why: '전역 URI로 데이터셋을 연결하고 OWL 추론기로 상속 규칙을 유도하는 것은 RDF/OWL 쪽의 강점이다.' },
    { q: '서비스에 "회사 설립일로 정렬" 기능이 생겨 foundedYear를 schema.org의 foundingDate로 바꾼다. 같이 챙길 것은?',
      o: ['프롬프트 문구만 고친다', 'City 클래스를 지운다', '스키마 버전을 올리고 기존 데이터를 옮긴다'], a: 2,
      why: '속성 이름과 형식이 바뀌면 v3처럼 버전을 올리고 저장된 값을 마이그레이션해야 옛 데이터도 조회된다.' },
  ];

  R.page({ title: '온톨로지 설계', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
