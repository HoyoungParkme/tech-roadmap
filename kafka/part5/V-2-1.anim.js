/* V-2-1 Cluster 운영 (broker 추가/제거 + 파티션 재분배) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * broker 마다 가진 replica 를 칩으로 그린다 (채운 칩 = leader). 분포는 페이지의 PLAN_CURRENT / PLAN_PROPOSED 와 같고,
 * broker 3 비우기(drain) 분포는 예시다. 개수는 저장소 밖 verify.py 로 다시 셌다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, terminal, snippet, hbar, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const mid = (x, y, s, op, a) => note(x, y, s, op, Object.assign({ 'text-anchor': 'middle' }, a || {}));
  const CUR = { p0: [1, 2], p1: [1, 3], p2: [2, 3], p3: [2, 1], p4: [3, 1], p5: [3, 2] };
  const PRO = { p0: [1, 4], p1: [4, 3], p2: [2, 4], p3: [2, 1], p4: [3, 1], p5: [4, 2] };
  const DRA = Object.assign({}, PRO, { p1: [4, 1], p4: [1, 2] });
  const PS = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5'];
  const BXs = { 1: 135, 2: 365, 3: 595, 4: 825 }, BT = 70, BH = 190;

  // 분포 → broker 별 칩 목록. inflight: { p: 새 replica 배열 } 이면 아직 없는 broker 에 "복사 중" 칩을 붙인다
  function chips(assign, inflight) { const out = { 1: [], 2: [], 3: [], 4: [] };
    PS.forEach((p) => { const r = assign[p]; r.forEach((b) => out[b].push({ p, L: b === r[0] }));
      if (inflight && inflight[p]) inflight[p].forEach((b) => { if (!r.includes(b)) out[b].push({ p, copy: true }); }); });
    return out; }
  const chipXY = (b, j) => [BXs[b] + (j % 2 ? 46 : -46), BT + 58 + Math.floor(j / 2) * 44];
  function broker(b, list, o) { o = o || {}; const cx = BXs[b], op = o.op ?? 1, s = o.s ?? 1; if (s <= 0 || op <= 0) return;
    const g = R.G(cx, BT + BH / 2, s, op);
    el('rect', { x: -100, y: -BH / 2, width: 200, height: BH, rx: 12, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash ? '7 5' : null }, g);
    tx(-84, -BH / 2 + 24, o.title || 'broker ' + b, { 'font-size': 15, 'font-weight': 800, fill: o.stroke && o.stroke !== INK ? o.stroke : INK }, g);
    el('circle', { cx: 82, cy: -BH / 2 + 19, r: 5.5, fill: o.lamp || GOOD }, g);
    (list || []).forEach((c, j) => { const [x, y] = chipXY(b, j), cop = c.op ?? 1, cs = c.s ?? 1; if (cs <= 0) return;
      card(x - cx, y - BT - BH / 2, 80, 34, { rx: 8, text: c.p + (c.L ? ' L' : ''), fs: 14, fw: 800, mono: true, p: g, s: cs, op: cop,
        fill: c.copy ? WARNBG : c.L ? ACC : PANEL, stroke: c.copy ? WARN : c.urp ? BAD : ACC, color: c.copy ? WARN : c.L ? PANEL : c.urp ? BAD : ACC, dash: c.copy ? '5 4' : null, sw: c.urp ? 3 : 2 }); });
    if (o.count) tx(0, BH / 2 + 22, o.count, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: o.countCol || MUT }, g); }
  function cluster(map, o) { o = o || {}; const ids = o.ids || [1, 2, 3, 4];
    ids.forEach((b) => broker(b, map[b], Object.assign({ count: `replica ${map[b].filter((c) => !c.copy).length}개` }, (o.each && o.each(b)) || {}))); }

  // ---------- 1. broker 추가 ----------
  function s1(t, c) { const { k, u } = c, M = chips(CUR);
    [1, 2, 3].forEach((b) => broker(b, M[b], { count: 'replica 4개', s: k === 0 ? pop(u, 0.1 + b * 0.12) : 1 }));
    const joined = k >= 3, title = k === 0 ? '새 서버' : 'broker 4';
    broker(4, [], { dash: !joined, stroke: joined ? INK : OFF, lamp: joined ? (k === 3 ? (u > 1.2 ? GOOD : WARN) : GOOD) : OFF, title, s: k === 0 ? pop(u, 0.7) : 1,
      count: k === 4 ? 'replica 0개' : null, countCol: BAD });
    if (k === 0) { mid(825, 175, '아직 기동 전', fade(u, 1.0), { fill: OFF });
      [['cluster.id · controller 주소', 0], ['9092 · 9093 포트 개방', 1], ['사양은 기존 broker와 같게', 2]].forEach(([s, i]) => pill(180 + i * 300, 330, s, INFO, pop(u, 1.2 + i * 0.3), { fs: 14 }));
      mid(480, 392, '하나라도 어긋나면 기동해도 합류하지 못한다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1 || k === 2) { const L1 = ['broker.id=4', 'node.id=4', 'process.roles=broker'], L2 = ['controller.quorum.voters=1@kafka-1:9093,2@…,3@…', 'advertised.listeners=PLAINTEXT://kafka-4:9092', 'log.dirs=/var/kafka/data'];
      const lines = k === 1 ? L1 : L1.slice(0, 1).concat(L2); const n = Math.ceil(lerp(0, lines.length, E(u, 0.2, 1.4)));
      snippet(150, 288, lines.slice(0, Math.max(1, n)), { fs: 14.5, w: 660 });
      if (k === 1) note(150, 410, '중복 id면 기동이 거부된다 · 예전에 쓰던 id 재사용도 금지', fade(u, 1.6), { fill: WARN, 'font-size': 14 });
      else note(150, 410, 'advertised.listeners가 틀리면 client가 broker 4에 못 붙는다', fade(u, 1.8), { fill: WARN, 'font-size': 14 });
      return; }
    if (k === 3) { terminal(150, 284, 660, 132, ['$ kafka-broker-api-versions.sh --bootstrap-server kafka-1:9092', 'kafka-1:9092 (id: 1 rack: null) -> ...', 'kafka-2:9092 (id: 2 rack: null) -> ...', 'kafka-3:9092 (id: 3 rack: null) -> ...', 'kafka-4:9092 (id: 4 rack: null) -> ...'], lerp(0, 5, E(u, 0.3, 2.0)), { fs: 13.5, lh: 18 });
      return; }
    mid(480, 330, '멤버로는 등록됐지만 topic-A의 replica는 broker 1·2·3 에만 있다', fade(u, 0.6));
    mid(480, 368, '등록은 자동이고, 데이터 재배치는 자동이 아니다', fade(u, 1.4), { fill: BAD }); }

  // ---------- 2. 자동 재분배 없음 ----------
  function s2(t, c) { const { k, u } = c, M = chips(CUR);
    const busy = k === 3 ? [80, 80, 80, 5] : null;
    [1, 2, 3].forEach((b) => broker(b, M[b], { count: 'replica 4개', stroke: k === 3 ? BAD : INK }));
    broker(4, [], { count: 'replica 0개', countCol: BAD, lamp: k === 3 ? OFF : GOOD });
    if (k === 0) { [[1, 'p0'], [2, 'p2'], [3, 'p4']].forEach(([b, p], i) => { const [x, y] = chipXY(b, 0), v = seg(u, 0.4 + i * 0.3, 1.4 + i * 0.3);
        if (v > 0) card(lerp(x, 825 - 46 + (i % 2) * 92, E(v, 0, 1)), lerp(y, BT + 58 + Math.floor(i / 2) * 44, E(v, 0, 1)), 80, 34, { rx: 8, text: p, fs: 14, mono: true, fw: 800, stroke: OFF, color: OFF, dash: '5 4', op: 0.8 }); });
      card(480, 320, 300, 54, { rx: 27, text: '기대: 알아서 퍼지겠지', fs: 17, fw: 800, stroke: MUT, color: MUT, dash: '6 5', s: pop(u, 0.2) });
      mid(480, 392, 'Kafka는 Auto Scaling 그룹이 아니다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 1) { cross(710, 160, 16, pop(u, 0.2));
      ['B0', 'B1', 'B2', 'B3'].forEach((p, i) => { const b = i + 1, v = E(u, 0.6 + i * 0.2, 1.1 + i * 0.2); if (v <= 0) return;
        card(BXs[b], lerp(300, 312, v), 60, 30, { rx: 8, text: p, fs: 14, mono: true, fw: 800, stroke: INFO, color: INFO, op: v }); });
      note(40, 344, '새로 만드는 topic-B의 partition은 broker 4에도 놓인다', fade(u, 1.6), { fill: INFO });
      note(40, 378, '기존 p0~p5와 __consumer_offsets 50개는 그대로', fade(u, 2.0), { fill: BAD });
      return; }
    if (k === 2) { const y = 352; el('rect', { x: 150, y: y - 16, width: 680 * E(u, 0.2, 1.2), height: 32, rx: 16, fill: WARNBG, stroke: WARN, 'stroke-width': 2 });
      for (let j = 0; j < 6; j++) dot([[150, y], [830, y]], ((t * 0.6 + j / 6) % 1) * (u > 1.2 ? 1 : 0), WARN, 6);
      mid(480, y - 26, 'partition 이동 = 디스크 복제 = 네트워크 사용', fade(u, 1.0), { 'font-size': 15 });
      mid(480, 392, '그래서 언제·얼마나·어떤 순서로 옮길지는 운영자가 정한다 (자동화는 Cruise Control 같은 별도 도구)', fade(u, 1.8), { fill: MUT, 'font-weight': 500, 'font-size': 14 }); return; }
    [1, 2, 3, 4].forEach((b, i) => { const v = tween(0, busy[i], u, 1.2); hbar(BXs[b] - 90, 300, 120, v, 100, { col: v > 50 ? BAD : GOOD, text: 'CPU ' + Math.round(v) + '%' }); });
    mid(480, 368, '서버를 늘렸는데 부하는 하나도 안 줄었다 (CPU 값은 코드의 예시)', fade(u, 1.6), { fill: BAD }); }

  // ---------- 3. reassign 계획 ----------
  const TX = { p: 120, cur: 290, pro: 500 }, RY = (i) => 104 + i * 44;
  function repChips(cx, y, r, hi, s) { r.forEach((b, j) => card(cx - 24 + j * 48, y, 40, 30, { rx: 6, text: String(b), fs: 14.5, mono: true, fw: 800, s,
    fill: j === 0 ? (hi && hi(b) ? WARN : ACC) : PANEL, stroke: hi && hi(b) ? WARN : ACC, color: j === 0 ? PANEL : hi && hi(b) ? WARN : ACC })); }
  function planTable(k, u) {
    [['partition', TX.p], ['current', TX.cur], ['proposed', TX.pro]].forEach(([s, x], j) => tx(x, 70, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: j === 2 && k < 2 ? OFF : MUT }));
    PS.forEach((p, i) => { const y = RY(i), changed = CUR[p].join() !== PRO[p].join();
      mono(TX.p, y + 5, p, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
      repChips(TX.cur, y, CUR[p], null, k === 0 ? pop(u, 0.2 + i * 0.1) : 1);
      if (k >= 2) { const s = k === 2 ? pop(u, 0.4 + i * 0.15) : 1; repChips(TX.pro, y, PRO[p], (b) => b === 4, s);
        if (changed && (k > 2 || u > 1.4)) el('rect', { x: 60, y: y - 20, width: 520, height: 40, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }); } }); }
  function file(x, y, name, s, col, sub2) { card(x, y, 220, 50, { rx: 8, text: name, fs: 14, mono: true, fw: 800, stroke: col || INK, s });
    if (sub2) tx(x, y + 42, sub2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); }
  function s3(t, c) { const { k, u } = c;
    planTable(k, u);
    const FX = 790;
    if (k === 0) { pill(FX, 120, 'BOOTSTRAP="kafka-1:9092"', INK, pop(u, 1.0), { mono: true, fs: 13.5 }); pill(FX, 170, 'TOPIC="topic-A"', INK, pop(u, 1.2), { mono: true, fs: 13.5 });
      pill(FX, 220, 'set -euo pipefail', INK, pop(u, 1.4), { mono: true, fs: 13.5 });
      mid(330, 400, '지금 분포가 곧 되돌릴 기준이다 (RF=2, 칸 첫 번호 = leader)', fade(u, 1.8), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { snippet(680, 100, ['{', '  "topics": [', '    { "topic": "topic-A" }', '  ],', '  "version": 1', '}'], { fs: 14, op: fade(u, 0.2) });
      note(680, 290, 'topics-to-move.json', fade(u, 0.6), { class: 'mono' }); note(680, 320, '처음엔 topic 하나씩', fade(u, 1.4), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 2) { pill(FX, 120, '--broker-list "1,2,3,4"', ACC, pop(u, 0.1), { mono: true, fs: 13.5 }); pill(FX, 170, '--generate', ACC, pop(u, 0.3), { mono: true, fs: 13.5 });
      note(640, 230, 'p0 · p1 · p2 · p5에', fade(u, 1.6), { fill: WARN }); note(640, 258, 'broker 4가 들어갔다', fade(u, 1.6), { fill: WARN });
      note(640, 310, '계획만 낸다 · 데이터는', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); note(640, 336, '1바이트도 안 움직인다', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 3) { fly(TX.cur, 372, FX, 140, seg(u, 0.2, 1.0), 'current', { fill: INK });
      file(FX, 140, 'rollback-plan.json', pop(u, 1.0), GOOD, '되돌릴 때 쓰는 유일한 보험');
      mid(330, 400, '이 파일 없이 실행한 재분배는 되돌릴 방법이 없다', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 4) { file(FX, 120, 'rollback-plan.json', 1, GOOD); fly(TX.pro, 372, FX, 200, seg(u, 0.2, 1.0), 'proposed', { fill: ACC });
      file(FX, 200, 'reassignment.json', pop(u, 1.0), ACC);
      mono(FX, 290, '복사될 replica 4개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
      tx(FX, 314, 'p0 · p1 · p2 · p5 → broker 4', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7) });
      mid(330, 400, '두 파일의 차이가 이번에 실제로 복사될 양이다', fade(u, 2.0)); return; }
    if (k === 5) { const rows = [['broker', 1, 2, 3, 4], ['replica', 3, 3, 2, 4], ['leader', 1, 2, 1, 2]];
      rows.forEach((r, i) => r.forEach((v, j) => { const x = 660 + j * 58, y = 120 + i * 40, hot = i === 1 && (j === 3 || j === 4);
        tx(j === 0 ? x + 24 : x, y, String(v), { 'text-anchor': j === 0 ? 'end' : 'middle', 'font-size': 15, 'font-weight': j === 0 || i === 0 ? 700 : 800, class: j ? 'mono' : null, fill: hot ? WARN : j === 0 ? MUT : INK, opacity: fade(u, 0.2 + i * 0.3) }); }));
      [['RF=2 유지', GOOD], ['4에 4개 · 3에 2개 쏠림', WARN], ['rack · 한 번에 옮기는 양 확인', INFO]].forEach(([s, col], i) => { if (u < 1.2 + i * 0.3) return;
        (col === GOOD ? check : col === WARN ? cross : check)(650, 250 + i * 40 - 5, 9, 1); note(668, 250 + i * 40, s, 1, { fill: col, 'font-size': 14 }); });
      return; }
    file(FX, 110, 'rollback-plan.json', 1, GOOD); file(FX, 180, 'reassignment.json', 1, ACC);
    file(FX, 250, 'reassignment-20…json', pop(u, 0.4), INFO, '타임스탬프 백업');
    [110, 180, 250].forEach((y, i) => check(FX + 128, y, 10, pop(u, 0.9 + i * 0.25)));
    mid(330, 400, '계획 · 롤백 · 백업 셋이 갖춰져야 execute로 넘어간다', fade(u, 1.8), { fill: GOOD }); }

  // ---------- 4. 실행 + throttle ----------
  function valve(x, y, on, u) { el('rect', { x: x - 150, y: y - 18, width: 300, height: 36, rx: 18, fill: on ? WARNBG : SOFT, stroke: on ? WARN : OFF, 'stroke-width': 2, 'stroke-dasharray': on ? null : '6 5' });
    mono(x, y + 5, on ? 'throttle 50MB/s = 52428800 B/s' : 'throttle 해제', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: on ? WARN : MUT }); }
  function progress(n, prevN, u) { const v = lerp(prevN, n, E(u, 0.3, 1.3));
    el('rect', { x: 560, y: 318, width: 360, height: 20, rx: 10, fill: SOFT }); el('rect', { x: 560, y: 318, width: 360 * v / 6, height: 20, rx: 10, fill: n >= 6 ? GOOD : ACC });
    mono(740, 362, `--verify  ${Math.round(v)} / 6`, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); }
  function streams(ps, t, speed) { ps.forEach((p, i) => { const src = PRO[p][0] === 4 ? CUR[p][0] : CUR[p][0], [x0, y0] = chipXY(src, chips(CUR)[src].findIndex((c) => c.p === p));
    const dj = chips(PRO, Object.fromEntries(ps.map((q) => [q, PRO[q]])))[4].findIndex((c) => c.p === p), [x1, y1] = chipXY(4, dj);
    for (let j = 0; j < 2; j++) dot([[x0, y0], [x0, BT + BH + 8], [x1, BT + BH + 8], [x1, y1]], ((t * speed + j / 2 + i * 0.13) % 1), WARN, 4.5); }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, pv = c.prev && c.prev.progress ? c.prev.progress.current : 0, n = b.progress ? b.progress.current : 0;
    let map;
    if (k <= 1) map = chips(CUR, k === 1 ? { p0: PRO.p0, p1: PRO.p1, p2: PRO.p2, p5: PRO.p5 } : null);
    else if (k === 2) map = chips(CUR, { p0: PRO.p0, p1: PRO.p1, p2: PRO.p2, p5: PRO.p5 });
    else if (k === 3) map = chips(Object.assign({}, CUR, { p0: PRO.p0, p2: PRO.p2 }), { p1: PRO.p1, p5: PRO.p5 });
    else map = chips(PRO);
    cluster(map, { each: (bb) => (bb === 4 && k >= 1 && k <= 3 ? { stroke: WARN } : null) });
    const live = k === 1 ? ['p0', 'p1', 'p2', 'p5'] : k === 2 ? ['p0', 'p1', 'p2', 'p5'] : k === 3 ? ['p1', 'p5'] : [];
    if (live.length && (k > 1 || u > 0.6)) streams(live, t, 0.35);
    if (k < 5) valve(250, 330, k <= 3, u);
    if (k === 0) { mid(250, 384, '새벽 배치 시간이라면 200MB/s (209715200)', fade(u, 1.0), { fill: MUT, 'font-weight': 500, 'font-size': 14 });
      progress(0, 0, u); return; }
    progress(n, k === 1 ? 0 : pv, u);
    if (k === 1) mid(250, 384, '--execute와 함께 걸어 복제가 바로 묶인다', fade(u, 1.2), { 'font-size': 14 });
    if (k === 2) mid(250, 384, 'p3 · p4는 replica가 그대로라 바로 완료', fade(u, 1.2), { 'font-size': 14, fill: GOOD });
    if (k === 3) mid(250, 384, 'URP가 치솟으면 throttle을 낮춘다', fade(u, 1.2), { 'font-size': 14, fill: WARN });
    if (k === 4) mid(250, 384, '--verify가 완료를 확인하면 throttle도 풀린다', fade(u, 1.2), { 'font-size': 14, fill: GOOD });
    if (k === 5) { terminal(40, 286, 470, 120, ['$ kafka-configs.sh --entity-type brokers \\', '    --entity-name 1 --describe | grep throttle', '(출력 없음)'], lerp(0, 3, E(u, 0.2, 1.4)), { fs: 13.5 }); } }

  // ---------- 5. broker 제거 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 2 || k === 3) { const M = chips(PRO); cluster(M, { each: () => ({ op: 0.35 }) });
      if (k === 2) terminal(150, 284, 660, 132, ['$ kafka-topics.sh --bootstrap-server kafka-1:9092 --list', 'topic-A', 'topic-B', 'topic-C'], lerp(0, 4, E(u, 0.2, 1.6)), { fs: 14 });
      else { snippet(150, 280, ['{ "topics": [ { "topic": "topic-A" }, { "topic": "topic-B" },', '              { "topic": "topic-C" } ], "version": 1 }'], { fs: 14, op: fade(u, 0.2) });
        note(150, 400, 'broker 3에 있는 내부 topic(__consumer_offsets 등)도 함께 넣는다', fade(u, 1.4), { fill: WARN, 'font-size': 14 }); }
      return; }
    if (k <= 1) { const M = chips(PRO);
      if (k === 1) { const dead = E(u, 0.3, 0.9);
        M[1] = M[1].map((cc) => (cc.p === 'p4' ? { p: 'p4', L: u > 1.1, urp: true } : cc)); M[4] = M[4].map((cc) => (cc.p === 'p1' ? Object.assign({}, cc, { urp: true }) : cc));
        cluster(M, { each: (b) => (b === 3 ? { op: 1 - dead * 0.6, stroke: BAD, lamp: BAD } : null) }); cross(595, 165, 30, pop(u, 0.3));
        pill(480, 318, 'URP 2개 · p1, p4의 replica가 1개뿐', BAD, pop(u, 1.3), { fs: 15 });
        mid(480, 370, 'p4 leader는 broker 1로 자동 승격 · RF는 임시로 깨진다', fade(u, 1.8));
        mid(480, 402, '금지: process를 먼저 끄는 순서', fade(u, 2.2), { fill: BAD }); return; }
      cluster(M, { each: (b) => (b === 3 ? { stroke: WARN, sw: 3.2 } : null) });
      mid(480, 330, '4-broker에서 broker 3을 뺀다 · 조건은 무중단과 RF 유지', fade(u, 0.6));
      mid(480, 366, '지금 broker 3에는 p1과 p4(leader) replica가 있다', fade(u, 1.2), { fill: WARN }); return; }
    if (k === 4) { cluster(chips(PRO), { each: (b) => (b === 3 ? { stroke: WARN } : { op: 0.6 }) });
      const a = E(u, 0.2, 0.8); pill(400, 330, '--broker-list "1,2,3,4"', MUT, 1, { mono: true, fs: 14, op: 1 - a * 0.5 });
      grow(540, 330, 600, 330, E(u, 0.8, 1.1), MUT); pill(720, 330, '--broker-list "1,2,4"', ACC, pop(u, 1.1), { mono: true, fs: 14 });
      mid(480, 386, '3이 빠졌는지 눈으로 확인하고 drain-broker-3 계획을 만든다', fade(u, 1.7)); return; }
    if (k === 5) { const M = chips(PRO, { p1: DRA.p1, p4: DRA.p4 }); cluster(M, { each: (b) => (b === 3 ? { stroke: WARN, lamp: WARN } : null) });
      const from = (p) => chipXY(3, M[3].findIndex((cc) => cc.p === p)), to = (b, p) => chipXY(b, M[b].findIndex((cc) => cc.p === p));
      [['p1', 1], ['p4', 2]].forEach(([p, b], i) => { const src = p === 'p1' ? chipXY(4, M[4].findIndex((cc) => cc.p === 'p1')) : from('p4'), [x1, y1] = to(b, p);
        for (let j = 0; j < 2; j++) dot([[src[0], src[1]], [src[0], BT + BH + 8], [x1, BT + BH + 8], [x1, y1]], ((t * 0.35 + j / 2 + i * 0.2) % 1), WARN, 4.5); });
      valve(480, 330, true, u); mid(480, 386, 'p1은 broker 1, p4는 broker 2로 복사 (예시 계획)', fade(u, 1.2)); return; }
    if (k === 6) { const M = chips(DRA); cluster(M, { each: (b) => (b === 3 ? { stroke: GOOD, count: 'replica 0개', countCol: GOOD } : null) });
      terminal(150, 300, 660, 100, ['$ kafka-topics.sh --describe | grep "Replicas:.*3"', '(출력 없음 → 꺼도 안전)'], lerp(0, 2, E(u, 0.3, 1.4)), { fs: 14 }); return; }
    if (k === 7) { const M = chips(DRA), out = E(u, 0.3, 1.2);
      cluster(M, { ids: [1, 2, 4] }); broker(3, [], { op: 1 - out, dash: true, stroke: OFF, lamp: OFF, s: 1 - out * 0.2 });
      pill(480, 322, 'kafka-server-stop.sh  →  kafka-cluster.sh unregister --id 3', INK, pop(u, 1.0), { mono: true, fs: 13.5 });
      mid(480, 380, '데이터를 먼저 옮겼기 때문에 끄는 순간에도 URP 0', fade(u, 1.8), { fill: GOOD }); return; }
    const items = ['reassign --verify 통과', 'under-replicated partitions = 0', 'consumer lag 비정상 증가 없음', 'disk · network 정상 복귀', 'throttle 해제 확인'];
    items.forEach((s, i) => { const y = 80 + i * 56, sc = pop(u, 0.2 + i * 0.3); card(480, y, 460, 44, { rx: 10, stroke: GOOD, s: sc });
      if (sc > 0.9) { check(280, y, 10, 1); note(304, y + 5, s, 1); } });
    mid(480, 392, '데이터 먼저 · verify · 그다음 종료', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); }

  const quiz = [
    { q: 'broker 4가 cluster에 합류한 직후, topic-A의 replica는 어디에 있는가?',
      o: ['일부가 자동으로 broker 4로 옮겨진다', '그대로 broker 1·2·3 에만 있다', '모두 broker 4로 한 벌 더 복사된다'], a: 1,
      why: '합류는 멤버 등록일 뿐이다. 기존 partition은 운영자가 reassign 하기 전까지 움직이지 않아 broker 4는 replica 0개다.' },
    { q: '재분배를 하지 않으면 broker 4가 받게 되는 것은 무엇인가?',
      o: ['앞으로 새로 만드는 topic·partition', '기존 __consumer_offsets의 50개 partition', '가장 바쁜 broker의 leader'], a: 0,
      why: '새로 생기는 partition만 broker 4에도 배치된다. 기존 replica는 디스크 복제라 시점을 운영자에게 맡긴다.' },
    { q: 'kafka-reassign-partitions.sh --generate를 실행하면 데이터는 어떻게 되는가?',
      o: ['rollback 파일이 자동으로 저장된다', '바로 복사가 시작된다', '움직이지 않고 current·proposed 계획만 출력된다'], a: 2,
      why: '--generate는 계획만 낸다. 출력에서 current는 rollback-plan.json, proposed는 reassignment.json으로 직접 나눠 저장한다.' },
    { q: '--throttle 52428800은 무엇을 제한하는가?',
      o: ['broker 당 복제 속도를 50MB/s로', 'partition 당 메시지 수를 52428800개로', '클러스터 전체 합계를 50MB/s로'], a: 0,
      why: '50 × 1048576 = 52428800 바이트/초다. 운영 트래픽과 네트워크를 나눠 쓰도록 replica 복사 속도를 broker 단위로 묶는다.' },
    { q: 'broker 3을 무중단으로 빼는 올바른 순서는 무엇인가?',
      o: ['process를 끄고 나서 reassign 한다', 'reassign으로 replica를 모두 옮기고 0개를 확인한 뒤 끈다', 'unregister를 먼저 하고 reassign 한다'], a: 1,
      why: '먼저 끄면 p1, p4처럼 broker 3에 있던 replica가 사라져 URP가 된다. 옮긴 뒤 끄면 그 순간에도 URP 0이다.' },
  ];

  const summary = [
    'broker를 추가해도 기존 partition은 옮겨지지 않아, 새 broker는 replica 0개로 논다.',
    '재분배는 --generate로 계획을 뽑아 사람이 검토하고, rollback 파일을 남긴 뒤 실행한다.',
    '실행할 때는 --throttle로 broker당 복제 속도를 50MB/s처럼 묶고 --verify로 진행을 본다.',
    'broker를 뺄 때는 replica를 먼저 옮겨 0개를 확인한 뒤 process를 끈다.',
  ];
  const review = [
    { q: 'broker를 하나 늘렸는데 일주일째 기존 broker CPU가 그대로다. 먼저 확인할 것은?',
      o: ['새 broker에 replica가 몇 개 있는지', 'consumer의 max.poll.records 값', 'producer의 acks 설정'], a: 0,
      why: '합류만으로는 replica가 옮겨지지 않는다. 새 broker가 replica 0개라면 reassign을 돌려야 부하가 나뉜다.' },
    { q: 'reassign을 실행한 직후 운영 producer 지연이 갑자기 늘었다. 먼저 의심할 것은?',
      o: ['rollback-plan.json을 만들지 않았다', 'throttle 없이(또는 너무 높게) 실행해 복제가 네트워크를 차지했다', 'topics-to-move.json의 version이 1이다'], a: 1,
      why: 'replica 복사는 디스크와 네트워크를 크게 쓴다. 운영 시간에는 50MB/s처럼 묶고, 너무 빠르면 낮추거나 --cancel로 멈춘다.' },
    { q: 'broker 3을 회수하려고 바로 껐더니 URP 경보가 울렸다. 이유는?',
      o: ['unregister를 하지 않아서', 'consumer lag이 갑자기 늘어서', 'broker 3에 있던 replica가 사라져 RF를 못 채운 partition이 생겨서'], a: 2,
      why: 'p1, p4처럼 broker 3에 replica가 있던 partition은 하나만 남는다. 먼저 drain으로 replica를 옮겼어야 한다.' },
  ];

  R.page({ title: '파티션 재분배', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
