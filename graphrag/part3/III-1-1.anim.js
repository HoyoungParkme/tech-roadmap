/* III-1-1 Neo4j 개론 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그래프 계산(3홉 탐색 결과, Raft 과반)은 networkx로 다시 돌려 확인했다. 실행 시간(12ms)·로그는 페이지 예시 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, browser, cross, check, lock, terminal, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그래프 도구 (노드·관계) ----------
  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const x = lerp(x1, x2, clamp(u)), y = lerp(y1, y2, clamp(u));
    el('line', { x1, y1, x2: x, y2: y, stroke: col, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linecap': 'round' });
    if (u > 0.9 && !o.plain) { const a = Math.atan2(y2 - y1, x2 - x1), s = o.head || 11;
      el('path', { d: `M${x},${y} L${x - s * Math.cos(a - 0.45)},${y - s * Math.sin(a - 0.45)} L${x - s * Math.cos(a + 0.45)},${y - s * Math.sin(a + 0.45)} Z`, fill: col, opacity: o.op ?? 1 }); } }
  function gnode(x, y, name, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const r = o.r || 30, col = o.col || ACC, bg = o.bg || ACCBG, g = R.G(x, y, s, o.op);
    if (o.ring) el('circle', { cx: 0, cy: 0, r: r + 8, fill: 'none', stroke: o.ringCol || WARN, 'stroke-width': 3, opacity: o.ring }, g);
    el('circle', { cx: 0, cy: 0, r, fill: bg, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 800, fill: INK }, g);
    if (o.label) tx(0, r + 19, ':' + o.label, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g); return g; }
  function gedge(a, b, type, u, o) { o = o || {}; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, ra = a.r || 30, rb = b.r || 30;
    const x1 = a.x + ux * (ra + 3), y1 = a.y + uy * (ra + 3), x2 = b.x - ux * (rb + 4), y2 = b.y - uy * (rb + 4), col = o.col || MUT;
    arrow(x1, y1, x2, y2, u, col, { sw: o.sw || 2.6, op: o.op, dash: o.dash });
    if (type && u > 0.5) { const mx = (x1 + x2) / 2 + (o.dx || 0), my = (y1 + y2) / 2 + (o.dy ?? -14), w = tw(type, 13.5) + 12, op = (o.op ?? 1) * clamp((u - 0.5) * 3);
      el('rect', { x: mx - w / 2, y: my - 12, width: w, height: 22, rx: 5, fill: PANEL, opacity: op }); mono(mx, my + 4, type, { 'font-size': 13.5, 'font-weight': 700, fill: col === MUT ? INK : col, 'text-anchor': 'middle', opacity: op }); } }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. Docker로 띄우기 ----------
  const CB = { x: 360, y: 50, w: 300, h: 240 };   // 컨테이너 상자
  const PY = { http: 130, bolt: 230 };
  function s1(t, c) { const { k, u } = c;
    if (k === 6) return s1end(u);
    zone(14, 14, 932, 392, '호스트 PC', { fill: 'none', stroke: GRID, dash: '6 6', sw: 1.5 });
    // 바깥 손님: 사람(브라우저), 앱
    browser(110, PY.http - 8, 120, 74, '사람 · 웹 브라우저', {});
    card(110, PY.bolt + 12, 124, 52, { rx: 10, text: 'Python 앱', fs: 15, fw: 700 });
    const portIn = k === 0 ? E(u, 0.3, 1.2) : 1;
    [['http', '7474', 'HTTP · Browser UI'], ['bolt', '7687', 'Bolt · 앱 연결']].forEach(([key, n, s], i) => { const y = PY[key], on = k >= 2;
      grow(172, y, 244, y, k === 0 ? seg(u, 0.2 + i * 0.4, 0.8 + i * 0.4) : 1, on ? ACC : MUT, { plain: true });
      card(282, y, 76, 34, { rx: 8, text: n, fs: 15, mono: true, fw: 800, stroke: on ? ACC : INK, color: on ? ACC : INK, fill: on ? ACCBG : PANEL, s: k === 0 ? pop(u, 0.4 + i * 0.4) : 1 });
      sub(282, y + 36, s, k === 0 ? fade(u, 0.9 + i * 0.4) : 1, { 'font-size': 13.5 });
      if (k >= 2) { grow(320, y, CB.x, y, k === 2 ? E(u, 0.3 + i * 0.4, 1.0 + i * 0.4) : 1, ACC, { plain: true });
        el('circle', { cx: CB.x, cy: y, r: 7, fill: ACC, opacity: k === 2 ? fade(u, 1.0 + i * 0.4) : 1 }); }
      if (k >= 3) { const blink = 0.5 + 0.5 * Math.sin(t * 5); el('circle', { cx: 342, cy: y - 27, r: 5, fill: k === 3 ? WARN : GOOD, opacity: k === 3 ? 0.4 + 0.6 * blink : 1 });
        tx(332, y - 22, k === 3 ? '대기' : 'LISTEN', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: k === 3 ? WARN : GOOD, opacity: k === 3 ? fade(u, 0.6) : 1 }); } });
    if (k === 2) mono(CB.x - 2, 70, '-p 7474:7474 -p 7687:7687', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.4) });
    // 컨테이너
    if (k === 0) { el('rect', { x: CB.x, y: CB.y, width: CB.w, height: CB.h, rx: 14, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: fade(u, 1.6) });
      sub(CB.x + CB.w / 2, CB.y + CB.h / 2 + 5, '컨테이너 아직 없음', fade(u, 1.8), { 'font-size': 15 }); return; }
    const cs = k === 1 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: CB.x, y: CB.y + CB.h * (1 - cs), width: CB.w, height: CB.h * cs, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
    if (cs > 0.9) { tx(CB.x + 16, CB.y + 26, 'neo4j 컨테이너', { 'font-size': 15, 'font-weight': 800 });
      card(CB.x + 110, CB.y + 80, 170, 56, { rx: 10, text: 'Neo4j Engine\n5.x Community', fs: 14, stroke: ACC, fill: PANEL, s: k === 1 ? pop(u, 1.0) : 1 }); }
    if (k === 1) mono(CB.x + CB.w / 2, CB.y + CB.h + 30, '$ docker run -d --name neo4j', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    // 계정
    if (k >= 3) { const s = k === 3 ? pop(u, 0.4) : 1;
      card(CB.x + 110, CB.y + 170, 200, 54, { rx: 10, stroke: WARN, fill: WARNBG, s }); lock(CB.x + 30, CB.y + 172, true, WARN, s);
      mono(CB.x + 52, CB.y + 166, 'NEO4J_AUTH', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: s });
      mono(CB.x + 52, CB.y + 186, 'neo4j/test12345', { 'font-size': 14, 'font-weight': 700, opacity: s }); }
    // 볼륨
    if (k >= 4) { pill(CB.x + CB.w - 52, CB.y, 'neo4j:5', INFO, k === 4 ? pop(u, 1.6) : 1, { mono: true, fill: PANEL, fs: 14 });
      [['/data', 'data', 100], ['/logs', 'logs', 222]].forEach(([m, h, y], i) => { const g0 = k === 4 ? E(u, 0.3 + i * 0.5, 1.0 + i * 0.5) : 1;
        mono(CB.x + CB.w - 12, y + 5, m, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: INFO, opacity: g0 });
        grow(CB.x + CB.w, y, 760, y, g0, INFO, { plain: true, dash: '6 5' });
        dbIcon(820, y, '$HOME/neo4j/' + h, { stroke: INFO, s: 0.85, op: g0 });
        if (i === 0 && g0 > 0.9) { gnode(806, y - 8, '', { r: 7, op: g0 }); gnode(834, y - 8, '', { r: 7, op: g0 }); el('line', { x1: 813, y1: y - 8, x2: 827, y2: y - 8, stroke: ACC, 'stroke-width': 2 }); } }); }
    if (k === 5) { const lines = ['$ docker logs neo4j | tail -3', ['Bolt enabled on 0.0.0.0:7687.', 'var(--term)'], ['HTTP enabled on 0.0.0.0:7474.', 'var(--term)'], ['Started.', '#4ade80']];
      terminal(CB.x, 300, 580, 112, lines, lerp(0, 4, E(u, 0.1, 2.2)), { lh: 21, fs: 14 }); }
  }
  function s1end(u) { // 볼륨이 있을 때와 없을 때의 재시작
    [[250, '볼륨 mount 했을 때', true], [710, '볼륨 mount 안 했을 때', false]].forEach(([cx, title, keep], i) => {
      lbl(cx, 46, title, 1, { fill: keep ? GOOD : BAD });
      el('rect', { x: cx - 190, y: 66, width: 380, height: 250, rx: 14, fill: SOFT, stroke: keep ? GOOD : BAD, 'stroke-width': 2 });
      const spin = E(u, 0.2, 1.0);
      card(cx, 106, 220, 40, { rx: 20, text: spin < 1 ? '컨테이너 재시작 중' : 'docker restart 완료', fs: 14.5, stroke: INK, fill: PANEL });
      el('path', { d: `M${cx + 128},96 a12,12 0 1 1 -4,-8`, fill: 'none', stroke: INK, 'stroke-width': 2.5, transform: `rotate(${spin * 360} ${cx + 120} 106)` });
      const g = keep ? 1 : 1 - E(u, 1.0, 1.8);
      gnode(cx - 70, 210, 'Alice', { label: 'Person', op: g }); gnode(cx + 70, 210, 'Bob', { label: 'Person', op: g });
      if (g > 0.02) gedge({ x: cx - 70, y: 210 }, { x: cx + 70, y: 210 }, 'KNOWS', 1, { op: g, col: ACC });
      if (!keep) { el('rect', { x: cx - 150, y: 160, width: 300, height: 110, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.6) });
        tx(cx, 222, '빈 그래프', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }
      else check(cx + 150, 132, 12, pop(u, 1.4));
      sub(cx, 346, keep ? '/data가 호스트 디스크에 남아 있다' : '데이터가 컨테이너 안에만 있었다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); });
  }

  // ---------- 2. 접속 ----------
  const SV = { x: 600, y: 60, w: 330, h: 300 };
  function s2(t, c) { const { k, u } = c;
    // 서버
    el('rect', { x: SV.x, y: SV.y, width: SV.w, height: SV.h, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
    tx(SV.x + 16, SV.y + 26, 'Neo4j (컨테이너)', { 'font-size': 15, 'font-weight': 800 });
    card(SV.x + 205, SV.y + 160, 170, 60, { rx: 10, text: 'Neo4j Engine', fs: 15, stroke: ACC, fill: PANEL });
    // 앱 쪽 코드
    const appY = 250;
    el('rect', { x: 20, y: appY - 40, width: 400, height: 190, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(36, appY - 16, 'connect.py', { 'font-size': 14, class: 'mono', fill: MUT, 'font-weight': 700 });
    const code = [['from neo4j import GraphDatabase', 0], ['URI = "bolt://localhost:7687"', 1], ['driver.verify_connectivity()', 2], ['s.run("RETURN 1 AS hello")', 3]];
    code.forEach(([s, kk], i) => { if (k < kk) return; const op = k === kk ? fade(u, 0.2) : kk === Math.min(k, 3) ? 1 : 0.45;
      R.spans(36, appY + 12 + i * 30, R.tokens(s), { 'font-size': 14.5, opacity: op }); });
    // Bolt 리스너
    const by = SV.y + 220, hy = SV.y + 90;
    if (k >= 1) { const s = k === 1 ? pop(u, 0.9) : 1;
      card(SV.x + 62, by, 104, 52, { rx: 8, text: 'Bolt\n:7687', fs: 14, stroke: ACC, fill: ACCBG, s, mono: true });
      el('line', { x1: SV.x + 114, y1: by, x2: SV.x + 120, y2: by, stroke: ACC, 'stroke-width': 2, opacity: s }); grow(SV.x + 114, by, SV.x + 118, SV.y + 190, s, MUT, { plain: true }); }
    const wire = [[420, appY + 40], [SV.x + 10, by]];
    if (k === 1) { fly(300, appY - 70, SV.x - 90, by - 50, seg(u, 0.1, 1.2), 'bolt://localhost:7687', { mono: true, stay: true, fill: INK }); }
    if (k >= 2) { el('line', { x1: wire[0][0], y1: wire[0][1], x2: wire[1][0], y2: wire[1][1], stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': k === 2 ? null : null, opacity: k === 2 ? fade(u, 0.1) : 1 });
      // 드라이버의 커넥션 풀
      tx(440, appY + 86, 'driver 커넥션 풀', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 4; i++) el('rect', { x: 440 + i * 30, y: appY + 96, width: 24, height: 18, rx: 3, fill: i === 0 && k >= 2 ? ACC : PANEL, stroke: ACC, 'stroke-width': 1.5, opacity: k === 2 ? fade(u, 0.4 + i * 0.15) : 1 }); }
    if (k === 2) { dot([wire[0], wire[1], [SV.x + 120, SV.y + 160]], seg(u, 0.6, 1.4), ACC, 7); dot([[SV.x + 120, SV.y + 160], wire[1], wire[0]], seg(u, 1.4, 2.1), GOOD, 7);
      check(470, appY - 10 + 0, 11, pop(u, 2.1)); note(490, appY - 4, '연결 확인 OK', fade(u, 2.1), { fill: GOOD }); }
    if (k === 3) { fly(wire[0][0], wire[0][1] - 26, SV.x + 120, SV.y + 130, seg(u, 0.2, 1.1), 'RETURN 1 AS hello', { mono: true });
      fly(SV.x + 120, SV.y + 130, wire[0][0] + 20, wire[0][1] - 26, seg(u, 1.3, 2.1), 'hello = 1', { mono: true, fill: GOOD, stay: true });
      mono(36, appY + 160 - 10, 'print → 1', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); }
    // 브라우저
    if (k >= 4) { const s = k === 4 ? pop(u, 0.2) : 1;
      browser(250, 100, 300, 140, null, { s });
      card(SV.x + 62, hy, 104, 52, { rx: 8, text: 'Browser UI\n:7474', fs: 14, stroke: INFO, fill: INFOBG, s, mono: true });
      grow(400, 100, SV.x + 10, hy, k === 4 ? E(u, 0.5, 1.1) : 1, INFO, { plain: true });
      mono(400, 30, 'http://localhost:7474', { 'font-size': 14, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
      if (k === 4) { tx(130, 92, '초기 비밀번호 바꾸기', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
        const sw = E(u, 1.3, 2.0);
        mono(130, 124, 'neo4j', { 'font-size': 15, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.0) * (0.4 + 0.6 * sw) });
        mono(200, 124, '→ test12345', { 'font-size': 15, fill: GOOD, 'font-weight': 800, opacity: sw }); }
      if (k === 5) { tx(120, 86, 'Database Information', { 'font-size': 14.5, 'font-weight': 800 });
        ['Node labels', 'Relationship types', 'Property keys'].forEach((s0, i) => { const op = fade(u, 0.3 + i * 0.35);
          el('rect', { x: 116, y: 98 + i * 24, width: 10, height: 10, rx: 2, fill: INFO, opacity: op }); tx(134, 108 + i * 24, s0, { 'font-size': 14, opacity: op }); });
        note(440, 398, '앱은 7687, 사람은 7474로 같은 DB에 들어온다', fade(u, 1.8), { 'font-size': 14.5 }); } }
  }

  // ---------- 3. 첫 CREATE ----------
  const NA = { x: 580, y: 150, r: 34 }, NB = { x: 840, y: 150, r: 34 };
  function graphPane(o) { o = o || {};
    el('rect', { x: 460, y: 28, width: 480, height: 270, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(476, 52, '결과 그래프 (Browser)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
  function props(x, y, rows, op, hot) { const h = rows.length * 20 + 10; el('rect', { x: x - 70, y, width: 140, height: h, rx: 7, fill: SOFT, stroke: hot ? WARN : GRID, 'stroke-width': hot ? 2 : 1.2, opacity: op });
    rows.forEach((r, i) => mono(x - 60, y + 20 + i * 20, r, { 'font-size': 13.5, opacity: op })); }
  function s3(t, c) { const { k, u } = c;
    graphPane();
    const nA = k === 1 ? pop(u, 0.9) : k >= 1 ? 1 : 0, nB = k === 1 ? pop(u, 1.5) : k >= 1 ? 1 : 0, eU = k === 2 ? E(u, 0.6, 1.6) : k >= 2 ? 1 : 0;
    if (k === 0) { el('rect', { x: 500, y: 80, width: 400, height: 190, rx: 10, fill: 'none', stroke: OFF, 'stroke-dasharray': '6 6', 'stroke-width': 2, opacity: fade(u, 1.2) });
      sub(700, 182, '아직 비어 있다', fade(u, 1.4), { 'font-size': 15 }); }
    const ring = k === 3 ? fade(u, 0.5) : 0;
    if (nA > 0) { gnode(NA.x, NA.y, 'Alice', { r: 34, label: 'Person', s: nA, ring }); props(NA.x, 206, ['name: "Alice"', 'age: 30'], k === 1 ? fade(u, 1.2) : k === 4 ? 1 : 1); }
    if (nB > 0) { gnode(NB.x, NB.y, 'Bob', { r: 34, label: 'Person', s: nB, ring }); props(NB.x, 206, ['name: "Bob"', 'age: 28'], k === 1 ? fade(u, 1.8) : 1); }
    if (eU > 0) { gedge(NA, NB, 'KNOWS', eU, { col: ACC, sw: 3 }); if (eU > 0.9) { const op = k === 2 ? fade(u, 1.7) : 1; el('rect', { x: 650, y: 162, width: 120, height: 26, rx: 6, fill: SOFT, stroke: GRID, opacity: op }); mono(710, 180, 'since: 2020', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: op }); } }
    // 왼쪽: 코드
    if (k === 0) { const parts = [['(a:Person {name:"Alice"})', '노드 = 둥근 괄호', ACC, 90], ['-[:KNOWS {since:2020}]->', '관계 = 대괄호 + 화살표', INFO, 190], ['(b:Person {name:"Bob"})', '노드', ACC, 290]];
      parts.forEach(([s, l, col, y], i) => { const op = fade(u, 0.2 + i * 0.5), w = tw(s, 15);
        mono(30, y, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
        el('path', { d: `M30,${y + 10} v8 h${w} v-8`, fill: 'none', stroke: col, 'stroke-width': 1.8, opacity: op }); tx(30 + w / 2, y + 38, l, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); });
      return; }
    const lines = k === 4 ? null : ['CREATE (a:Person {name:"Alice", age:30})', 'CREATE (b:Person {name:"Bob", age:28})', 'CREATE (a)-[:KNOWS {since:2020}]->(b)', 'RETURN a, b'];
    if (k >= 1 && k <= 3) { tx(24, 48, 'first-create.cypher', { 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700 });
      lines.forEach((s, i) => { const cur = (k === 1 && i < 2) || (k === 2 && i === 2) || (k === 3 && i === 3), seen = i < (k === 1 ? 2 : k === 2 ? 3 : 4); if (!seen) return;
        const op = cur ? fade(u, 0.1 + (k === 1 ? i * 0.5 : 0)) : 0.4;
        if (cur) el('rect', { x: 18, y: 64 + i * 34, width: 432, height: 28, rx: 5, fill: ACCBG, opacity: op });
        mono(26, 84 + i * 34, s.replace(/^CREATE /, 'CREATE '), { 'font-size': 13.5, 'font-weight': cur ? 700 : 500, opacity: Math.max(op, 0.4) }); });
      if (k === 1) { fly(452, 82, NA.x, NA.y, seg(u, 0.3, 0.9), '(a)', { mono: true }); fly(452, 116, NB.x, NB.y, seg(u, 0.9, 1.5), '(b)', { mono: true }); }
      if (k === 3) { // 결과 표
        const op = fade(u, 1.0); tx(24, 260, 'RETURN 결과', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
        cells(24, 272, ['a', 'b'], { w: 200, h: 34, gap: 4, style: () => ({ fill: SOFT, stroke: GRID, op }) });
        cells(24, 310, ['(:Person Alice)', '(:Person Bob)'], { w: 200, h: 34, gap: 4, fs: 13.5, style: () => ({ stroke: ACC, op: fade(u, 1.4) }) }); } }
    if (k === 4) { const m = E(u, 0.3, 1.5);
      ['CREATE (a:Person {name:"Alice"})', '       -[:KNOWS {since:2020}]->', '       (b:Person {name:"Bob"})', 'RETURN a, b'].forEach((s, i) => mono(26, lerp(70 + i * 44, 90 + i * 28, m), s, { 'font-size': 14, 'font-weight': 700, fill: i === 1 ? INFO : i === 3 ? INK : ACC }));
      pill(150, 250, 'CREATE 3번 → 1번', WARN, pop(u, 1.6), { fill: PANEL }); check(920, 60, 11, pop(u, 2.0)); note(780, 66, '결과 동일', fade(u, 2.0), { fill: GOOD }); }
    if (k >= 5) { const st = [['nodes', 2], ['rels', 1], ['props', 5], ['ms', 12]];
      if (k === 5) { tx(24, 48, 'Browser 실행 결과', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
        st.forEach(([n, v], i) => { const y = 90 + i * 66, val = Math.round(v * E(u, 0.2 + i * 0.25, 1.2 + i * 0.25));
          card(120, y, 190, 54, { rx: 10, stroke: i === 3 ? INFO : ACC, fill: PANEL }); mono(60, y + 9, String(val), { 'font-size': 26, 'font-weight': 800, fill: i === 3 ? INFO : ACC });
          tx(140, y + 6, ['노드 생성', '관계 생성', '속성 설정', '걸린 시간 (예시)'][i], { 'font-size': 14, 'font-weight': 700 }); }); }
      if (k === 6) { tx(24, 44, 'SQL 이었다면', { 'font-size': 15, 'font-weight': 800, fill: BAD });
        tx(24, 74, 'person', { 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700 });
        const rows = [['id', 'name', 'age'], ['1', 'Alice', '30'], ['2', 'Bob', '28']];
        rows.forEach((r, i) => cells(24, 82 + i * 32, r, { w: 74, h: 28, gap: 3, fs: 13.5, style: () => ({ fill: i === 0 ? SOFT : PANEL, stroke: GRID, s: i === 0 ? 1 : pop(u, 0.2 + i * 0.3) }) }));
        tx(270, 74, 'knows', { 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700 });
        [['from', 'to', 'since'], ['1', '2', '2020']].forEach((r, i) => cells(270, 82 + i * 32, r, { w: 56, h: 28, gap: 3, fs: 13.5, style: () => ({ fill: i === 0 ? SOFT : PANEL, stroke: GRID, s: i === 0 ? 1 : pop(u, 0.9) }) }));
        mono(24, 210, 'INSERT × 3  +  조회 때 JOIN', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
        mono(24, 262, 'Cypher', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
        mono(24, 290, '(a)-[:KNOWS]->(b)  한 줄', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); } }
    if (k >= 4 && k <= 5) sub(700, 330, k === 4 ? '쿼리 모양만 바뀌고 그래프는 같다' : 'Created 2 nodes, 1 relationship, 5 properties', k === 4 ? fade(u, 2.2) : fade(u, 1.6), { 'font-size': 14.5 });
  }

  // ---------- 4. 아키텍처 ----------
  const LY = [['Bolt Listener', ':7687 · PackStream 바이너리', 40], ['Cypher Engine', 'Parser → Planner → Runtime', 130], ['Native Graph Storage', 'Index-free Adjacency', 220], ['디스크', 'store 파일 · TX Log', 310]];
  function stack(on, k, u) { LY.forEach(([n, s, y], i) => { const hot = on === i, cs = i === 2 && k < 2 ? 0.35 : i === 3 && k < 3 ? 0.35 : 1;
      el('rect', { x: 24, y, width: 400, height: 72, rx: 10, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.5 : 1.5, opacity: cs });
      tx(42, y + 30, n, { 'font-size': 16, 'font-weight': 800, fill: hot ? ACC : INK, opacity: cs }); tx(42, y + 54, s, { 'font-size': 13.5, fill: MUT, opacity: cs });
      if (i < 3) arrow(380, y + 72, 380, y + 90, 1, MUT, { sw: 2, head: 8, op: cs }); }); }
  const GN = { a: { x: 560, y: 150, n: 'Alice' }, b: { x: 700, y: 150, n: 'Bob' }, c: { x: 860, y: 100, n: 'Carol' }, d: { x: 860, y: 230, n: 'Dave' } };
  function s4(t, c) { const { k, u } = c;
    stack([0, 1, 2, 2, 3, 2][k], k, u);
    // 질의 점이 층을 따라 내려간다
    const qx = 400, depth = [0, 1, 2, 2, 3, 2][k];
    dot([[qx, 20], [qx, 40 + depth * 90 + 36]], seg(u, 0.1, 0.9), ACC, 7);
    zone(452, 20, 490, 380, null, { fill: SOFT });
    if (k === 0) { tx(470, 50, '앱 → Bolt', { 'font-size': 15, 'font-weight': 800 });
      card(560, 120, 140, 44, { rx: 8, text: 'Python 앱', fs: 15 });
      for (let i = 0; i < 6; i++) { const x = 650 + i * 40, s = clamp(E(u, 0.4, 1.8) * 6 - i);
        el('rect', { x, y: 200, width: 34, height: 30, rx: 4, fill: INK, opacity: s }); }
      grow(630, 120, 890, 120, E(u, 0.3, 1.2), ACC);
      note(470, 270, '사람이 읽는 글자가 아니라', fade(u, 1.6)); note(470, 298, '작고 빠른 바이너리(PackStream)로 오간다', fade(u, 1.9));
      return; }
    if (k === 1) { tx(470, 50, 'Cypher 한 줄의 여정', { 'font-size': 15, 'font-weight': 800 });
      [['Parser', 'Cypher → AST'], ['Planner', 'AST → Logical → Physical Plan'], ['Runtime', 'interpreted · slotted · pipelined']].forEach(([a, b], i) => {
        const y = 100 + i * 96, s = pop(u, 0.3 + i * 0.5); card(560, y, 150, 50, { rx: 10, text: a, fs: 15, stroke: ACC, s });
        tx(648, y + 5, b, { 'font-size': 14, class: 'mono', opacity: fade(u, 0.5 + i * 0.5) });
        if (i < 2) arrow(560, y + 26, 560, y + 68, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), MUT, { sw: 2 }); });
      return; }
    if (k === 2 || k === 5) { const hops = k === 5;
      tx(470, 50, hops ? 'MATCH (Alice)-[:KNOWS*1..3]->(f)' : '이웃을 포인터로 직접 든다', { 'font-size': hops ? 14 : 15, 'font-weight': 800, class: hops ? 'mono' : null });
      const E2 = [['a', 'b'], ['b', 'c'], ['b', 'd']], hopOf = { b: 1, c: 2, d: 2 };
      const wave = hops ? E(u, 0.2, 1.8) * 2 : 0;
      E2.forEach(([p, q], i) => { const lit = hops ? clamp(wave - (hopOf[q] - 1)) : 1; gedge(Object.assign({ r: 28 }, GN[p]), Object.assign({ r: 28 }, GN[q]), 'KNOWS', hops ? 1 : E(u, 0.3 + i * 0.3, 0.9 + i * 0.3), { col: hops && lit > 0.5 ? ACC : MUT, dy: q === 'd' ? 0 : -14, dx: q === 'd' ? 30 : q === 'c' ? -6 : 0 }); });
      Object.entries(GN).forEach(([id, n]) => { const lit = hops && id !== 'a' ? clamp(wave - (hopOf[id] - 1)) : 0;
        gnode(n.x, n.y, n.n, { r: 28, fs: 14.5, label: 'Person', ring: id === 'a' ? 1 : lit > 0.5 ? 1 : 0, ringCol: id === 'a' ? INK : ACC });
        if (hops && id !== 'a') mono(n.x + 32, n.y - 26, hopOf[id] + '홉', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: lit }); });
      if (!hops) { dot([[GN.a.x, GN.a.y], [GN.b.x, GN.b.y], [GN.d.x, GN.d.y]], seg(u, 1.0, 2.4), WARN, 8);
        note(470, 320, 'hop 1번 = 포인터 1번 따라가기', fade(u, 1.6), { fill: ACC }); note(470, 350, '찾아볼 인덱스가 없다 → O(1)', fade(u, 2.0)); return; }
      const n = Math.round(lerp(0, 3, E(u, 0.6, 2.0)));
      card(540, 330, 150, 46, { rx: 10, stroke: ACC, fill: PANEL }); mono(490, 337, `결과 ${n}명`, { 'font-size': 17, 'font-weight': 800, fill: ACC });
      tx(720, 322, 'RDB: hop 마다 인덱스 O(log n)', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(720, 348, 'Neo4j: hop 마다 포인터 O(1)', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { tx(470, 50, '고정 크기 레코드 파일 3개', { 'font-size': 15, 'font-weight': 800 });
      [['nodestore', ['Alice', 'Bob', 'Carol'], ACC], ['relationshipstore', ['KNOWS', 'KNOWS', 'KNOWS'], INFO], ['propertystore', ['name', 'age', 'since'], WARN]].forEach(([f, vals, col], i) => {
        const y = 90 + i * 96; mono(470, y, 'neostore.' + f + '.db', { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.4) });
        vals.forEach((v, j) => { const s = pop(u, 0.3 + i * 0.4 + j * 0.12); card(520 + j * 132, y + 34, 122, 36, { rx: 4, text: v, fs: 14, mono: true, stroke: col, s }); }); });
      grow(520, 142, 520, 202, E(u, 1.6, 2.0), MUT); grow(520, 238, 520, 298, E(u, 1.9, 2.3), MUT);
      sub(780, 392, '노드 → 첫 관계 → 속성 순으로 포인터가 이어진다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) { tx(470, 50, '쓰기는 로그 먼저 (WAL)', { 'font-size': 15, 'font-weight': 800 });
      fly(560, 90, 560, 160, seg(u, 0.2, 0.8), 'CREATE …', { mono: true, stay: true });
      tx(470, 210, 'TX Log (디스크)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 8; i++) { const s = i < 5 ? 1 : clamp(E(u, 0.8, 1.4) * 3 - (i - 5)); el('rect', { x: 470 + i * 52, y: 220, width: 46, height: 30, rx: 4, fill: i >= 5 ? ACC : GRID, opacity: s }); }
      tx(470, 290, 'Page Cache (메모리)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 6; i++) { const hot = i === 1 || i === 4; el('rect', { x: 470 + i * 70, y: 300, width: 62, height: 34, rx: 4, fill: hot ? WARN : PANEL, stroke: GRID, opacity: hot ? 0.3 + 0.7 * fade(u, 1.5) : 1 }); }
      note(470, 380, '크래시가 나도 로그를 다시 읽어 복구한다', fade(u, 2.0)); return; }
  }

  // ---------- 5. Causal Cluster ----------
  const CO = [{ x: 280, n: 'core-1' }, { x: 500, n: 'core-2' }, { x: 720, n: 'core-3' }], RP = [{ x: 390, n: 'replica-1' }, { x: 610, n: 'replica-2' }];
  const CY = 118, RY = 312;
  function s5(t, c) { const { k, u } = c;
    zone(160, 22, 680, 188, 'Core 서버 · Raft 합의', { fill: 'none', stroke: ACC, dash: '6 5', sw: 1.8, color: ACC, op: k === 0 ? fade(u, 0.2) : 1 });
    zone(160, 252, 680, 152, 'Read Replica · 읽기 확장', { fill: 'none', stroke: INFO, dash: '6 5', sw: 1.8, color: INFO, op: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { mono(500, 135, 'Core × 3', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      mono(500, 330, 'Replica × N', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) }); }
    const nCore = k >= 3 ? 3 : k >= 2 ? 2 : k >= 1 ? 1 : 0;
    CO.forEach((s, i) => { if (i >= nCore) { if (k >= 1) el('rect', { x: s.x - 56, y: CY - 40, width: 112, height: 80, rx: 6, fill: 'none', stroke: OFF, 'stroke-dasharray': '5 5', 'stroke-width': 1.6 }); return; }
      const sc = k === i + 1 ? pop(u, 0.3) : 1; server(s.x, CY, null, { s: sc, stroke: i === 0 ? ACC : INK, lamp: i === 0 ? ACC : GOOD });
      tx(s.x, CY + 62, (i === 0 ? '★ ' : '') + s.n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: i === 0 ? ACC : INK, opacity: sc });
      tx(s.x, CY + 80, i === 0 ? 'LEADER' : 'FOLLOWER', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT, opacity: sc }); });
    if (k === 1) pill(500, 231, 'discovery: core-1:5000, core-2:5000, core-3:5000', MUT, pop(u, 0.9), { mono: true, fs: 13.5, fill: PANEL, color: INK });
    if (nCore > 1) { const gu = k === nCore ? E(u, 0.6, 1.2) : 1; el('path', { d: `M${CO[0].x},${CY - 42} V${CY - 50} H${lerp(CO[nCore - 2].x, CO[nCore - 1].x, gu)} V${CY - 42}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: 0.8 }); }
    if (k === 3) { // 쓰기 한 건이 과반을 얻는다
      dot([[CO[0].x, CY - 50], [CO[1].x, CY - 50]], seg(u, 0.2, 0.9), WARN, 7); dot([[CO[0].x, CY - 50], [CO[2].x, CY - 50]], seg(u, 0.2, 1.2), WARN, 7);
      const acks = 1 + (u > 1.0 ? 1 : 0) + (u > 1.4 ? 1 : 0);
      card(500, 231, 240, 38, { rx: 19, stroke: acks >= 2 ? GOOD : WARN, fill: PANEL }); mono(500, 237, `기록 확인 ${acks} / 3  →  ${acks >= 2 ? '커밋' : '대기'}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: acks >= 2 ? GOOD : WARN });
      sub(500, 286, '과반 = 2 · 한 대가 죽어도 쓰기는 계속된다', fade(u, 1.9), { 'font-size': 15, fill: INK }); }
    if (k >= 4) RP.forEach((s, i) => { const sc = k === 4 ? pop(u, 0.3 + i * 0.4) : 1;
      server(s.x, RY, null, { s: sc, stroke: INFO, lamp: INFO }); tx(s.x, RY + 62, s.n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: sc });
      el('line', { x1: CO[0].x, y1: CY + 86, x2: s.x, y2: RY - 44, stroke: INFO, 'stroke-width': 1.8, 'stroke-dasharray': '3 5', opacity: sc * 0.8 });
      if (k === 4) dot([[CO[0].x, CY + 86], [s.x, RY - 44]], ((u * 0.7 + i * 0.4) % 1), INFO, 5); });
    if (k === 4) sub(500, 236, '합의에 끼지 않고 복제본만 받아 읽기를 맡는다', fade(u, 1.4), { 'font-size': 14.5, fill: INK });
    if (k >= 5) { // 앱과 드라이버 URI
      card(70, 220, 110, 56, { rx: 10, text: '앱\n(driver)', fs: 14.5 });
      if (k === 5) { mono(70, 300, 'bolt://', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 0.2) });
        mono(70, 330, 'neo4j://', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
        card(70, 120, 130, 74, { rx: 8, fill: PANEL, stroke: ACC, s: pop(u, 1.3) });
        tx(70, 104, '라우팅 표', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
        mono(16, 128, 'W core-1', { 'font-size': 13.5, opacity: fade(u, 1.6) }); mono(16, 148, 'R 나머지 4', { 'font-size': 13.5, opacity: fade(u, 1.8) }); }
      if (k === 6) { const src = [126, 220];
        for (let i = 0; i < 6; i++) { const w = i % 3 === 0, tgt = w ? [CO[0].x - 58, CY] : i % 3 === 1 ? [RP[0].x - 58, RY] : [RP[1].x - 58, RY];
          dot([src, tgt], ((u * 0.55 + i / 6) % 1), w ? ACC : INFO, 6); }
        pill(70, 300, 'write → Leader', ACC, pop(u, 0.4), { fs: 13.5, fill: PANEL }); pill(70, 340, 'read → 복제본', INFO, pop(u, 0.8), { fs: 13.5, fill: PANEL });
        sub(500, 236, '앱 코드는 그대로, URI 한 줄로 확장', fade(u, 1.6), { 'font-size': 15, fill: INK }); } }
  }

  const quiz = [
    { q: 'docker run에서 볼륨(-v)을 빼먹으면 어떤 일이 생기는가?',
      o: ['7687 포트가 열리지 않아 앱이 붙지 못한다', '초기 비밀번호가 neo4j로 되돌아가 로그인이 막힌다', '컨테이너를 다시 띄울 때마다 빈 그래프로 돌아간다'], a: 2,
      why: '그래프 파일은 컨테이너 안의 /data에 쓰인다. 호스트 디렉터리를 붙여 두지 않으면 컨테이너와 함께 사라진다.' },
    { q: 'Python 앱이 Neo4j에 붙을 때 쓰는 주소는 무엇인가?',
      o: ['http://localhost:7474', 'bolt://localhost:7687', 'jdbc:neo4j://localhost:5432'], a: 1,
      why: '7474는 사람이 쓰는 Browser UI의 HTTP 포트다. 드라이버는 바이너리 프로토콜 Bolt가 기다리는 7687로 붙는다.' },
    { q: 'CREATE (a:Person {name:"Alice"})-[:KNOWS]->(b:Person {name:"Bob"})에서 대괄호 [ ]가 나타내는 것은 무엇인가?',
      o: ['관계와 그 타입', '노드의 라벨 목록', '속성 키-값 묶음'], a: 0,
      why: '둥근 괄호는 노드, 대괄호와 화살표는 관계다. 속성은 중괄호에 담긴다.' },
    { q: 'Neo4j에서 hop 한 번이 O(1)인 이유는 무엇인가?',
      o: ['노드 레코드가 이웃 관계를 포인터로 직접 들고 있어서', '모든 관계에 B-Tree 인덱스를 자동으로 만들어서', '쿼리 결과를 Page Cache에 미리 계산해 두어서'], a: 0,
      why: 'Index-free Adjacency다. 이웃을 찾으려고 인덱스를 뒤지지 않고 저장된 포인터를 따라간다.' },
    { q: 'Core 서버 3대 클러스터에서 한 대가 죽어도 쓰기가 계속되는 이유는 무엇인가?',
      o: ['Read Replica가 그 자리를 대신 맡아서', '드라이버가 쓰기를 잠시 메모리에 모아 두어서', '남은 2대가 과반이라 Raft 합의가 성립해서'], a: 2,
      why: '3대의 과반은 2대다. Read Replica는 합의에 끼지 않으므로 쓰기 가용성은 Core 수가 정한다.' },
  ];

  const summary = [
    'Neo4j는 Docker 한 줄로 뜨고 7474는 Browser, 7687은 앱의 Bolt 연결이다.',
    '/data를 호스트 볼륨에 붙이지 않으면 재시작할 때 그래프가 사라진다.',
    'Cypher는 (노드)-[관계]->(노드)를 그림 그대로 써서 노드 2개와 관계 1개를 한 줄로 만든다.',
    '노드가 이웃을 포인터로 들고 있어 hop 한 번이 O(1)이고, 운영은 Core 3대와 Replica로 나눈다.',
  ];
  const review = [
    { q: 'Browser에서는 그래프가 잘 보이는데 앱에서 http://localhost:7474로 드라이버를 만들자 접속이 실패했다. 먼저 고칠 것은?',
      o: ['URI를 bolt://localhost:7687로 바꾼다', 'NEO4J_AUTH 비밀번호를 다시 정한다', '볼륨 mount 경로를 바꾼다'], a: 0,
      why: '드라이버는 HTTP가 아니라 7687의 Bolt로 말한다. Browser가 잘 된다면 계정과 데이터는 이미 정상이다.' },
    { q: '읽기 요청이 늘어 클러스터가 버거워졌다. 쓰기 합의 속도는 그대로 두고 읽기만 늘리려면?',
      o: ['Core를 3대에서 4대로 늘린다', 'Read Replica를 더 붙이고 드라이버 URI를 neo4j://로 쓴다', '단일 인스턴스로 돌아가 Page Cache를 키운다'], a: 1,
      why: 'Replica는 Raft 합의에 끼지 않아 쓰기 비용을 늘리지 않는다. neo4j:// 라우팅이 읽기를 Replica로 보낸다.' },
    { q: '친구의 친구를 3단계까지 찾는 쿼리가 RDB에서는 데이터가 커질수록 느려졌다. Neo4j에서 덜 느려지는 까닭은?',
      o: ['Cypher가 SQL보다 짧아서 파싱이 빠르다', '결과를 TX Log에서 바로 읽어 온다', 'hop마다 인덱스 대신 저장된 포인터를 따라간다'], a: 2,
      why: 'RDB는 hop마다 인덱스를 찾아 O(log n)이 쌓이고, Neo4j는 이웃 포인터를 따라 hop당 O(1)이다.' },
  ];

  R.page({ title: 'Neo4j 한 대에서 클러스터까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
