/* I-2-2 LLMOps 도구 지도 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 도구마다 "어디에 끼어드는가"를 그린다. LangSmith = 환경변수와 스팬 트리, Helicone = 호출 경로 위의 프록시와 캐시,
 *       Langfuse = 우리 인프라 경계 안의 서버, W&B = 한 run 안의 두 그래프, 선택 = 질문 나무와 기능 격자.
 * 지연·토큰·점수 같은 측정값은 페이지에 없으므로 "예시" 딱지를 붙인다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, cross, check, lock, terminal, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const ex = (x, y, op) => pill(x, y, '예시', WARN, op ?? 1, { fs: 13.5 });
  const head = (s, op, a) => tx(480, 44, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: op ?? 1 }, a || {}));
  // 스팬 트리: rows [[깊이, 이름, 시작(0~1), 길이(0~1), 색]] — 왼쪽 이름, 오른쪽 타임라인 막대
  function spans(x, y, rows, u0, u, o) { o = o || {}; const W = o.w || 420, nx = o.nx || 230;
    rows.forEach(([d, n, s, l, col, note], i) => { const yy = y + i * 40, g = E(u, u0 + i * 0.3, u0 + 0.5 + i * 0.3), op = fade(u, u0 + i * 0.3);
      if (d) el('path', { d: `M${x + (d - 1) * 22 + 8},${yy - 30} V${yy - 6} H${x + d * 22 - 4}`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: op });
      mono(x + d * 22, yy, n, { 'font-size': 14, 'font-weight': 700, opacity: op });
      el('rect', { x: x + nx + W * s, y: yy - 15, width: Math.max(2, W * l * g), height: 20, rx: 4, fill: col || INFO, opacity: 0.85 });
      if (note) mono(x + nx + W * (s + l) + 8, yy, note, { 'font-size': 13.5, fill: MUT, opacity: fade(u, u0 + 0.5 + i * 0.3) }); }); }

  // ---------- 1. LangSmith ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      const L = [['$ export LANGCHAIN_TRACING_V2=true'], ['$ export LANGCHAIN_API_KEY=ls__…'], ['$ export LANGCHAIN_PROJECT=customer_bot']];
      terminal(60, 80, 560, 170, L.map((x) => x[0]), lerp(0, 3, E(u, 0.2, 1.8)), { title: '환경변수 세 줄', fs: 15 });
      card(780, 130, 220, 70, { rx: 12, stroke: GOOD, sw: 2.5, text: '애플리케이션 코드\n수정 0줄', fs: 16, fw: 800, color: GOOD, s: pop(u, 2.0) });
      sub(340, 300, '추적을 켜는 건 코드가 아니라 설정이다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) {
      card(260, 180, 260, 80, { rx: 12, stroke: ACC, sw: 2.4, text: 'ChatPromptTemplate\n"질문: {q}"', fs: 15, mono: true, s: pop(u, 0.2) });
      card(700, 180, 220, 80, { rx: 12, stroke: INK, sw: 2.4, text: 'ChatOpenAI\ngpt-4', fs: 15, mono: true, s: pop(u, 0.6) });
      mono(480, 192, '|', { 'font-size': 44, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      pill(480, 300, 'chain = prompt | llm', ACC, pop(u, 1.4), { mono: true, fs: 16 });
      sub(480, 350, '추적용으로 더 쓴 코드가 없다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) { head('chain.invoke({"q": "환불 정책?"}) 한 번의 trace', fade(u, 0.1), { 'font-size': 16 }); ex(890, 44, pop(u, 0.2));
      spans(60, 120, [[0, 'RunnableSequence', 0, 1, INFO, ''], [1, 'ChatPromptTemplate', 0, 0.04, ACC, ''], [1, 'ChatOpenAI', 0.05, 0.93, WARN, 'tokens · $']], 0.3, u, { w: 400, nx: 240 });
      [['입력/출력', 0.9], ['latency', 1.2], ['토큰 수', 1.5], ['비용', 1.8], ['부모-자식', 2.1]].forEach(([s, at], i) => pill(150 + i * 165, 300, s, INK, pop(u, at), { fs: 14 }));
      sub(480, 360, '막대 길이는 그림용 · chain 이 깊을수록 트리의 값이 커진다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 3) {
      zone(80, 70, 380, 280, 'LangSmith Prompt Hub · customer_bot', { fill: SOFT, stroke: ACC });
      [['커밋 3', 'prod', GOOD], ['커밋 2', '', null], ['커밋 1', 'v1', ACC]].forEach(([n, tag, col], i) => { const y = 130 + i * 64, op = fade(u, 0.2 + (2 - i) * 0.3);
        el('circle', { cx: 120, cy: y, r: 9, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: op }); if (i < 2) el('line', { x1: 120, y1: y + 10, x2: 120, y2: y + 54, stroke: GRID, 'stroke-width': 2.5, opacity: op });
        tx(144, y + 5, n, { 'font-size': 15, opacity: op }); if (tag) pill(300, y, tag, col, pop(u, 0.8 + i * 0.3), { mono: true, fs: 14 }); });
      grow(470, 290, 620, 290, 0, MUT);
      server(760, 200, '운영 서버', { lamp: GOOD, s: pop(u, 0.4) });
      fly(380, 130, 700, 130, seg(u, 1.5, 2.3), 'customer_bot:prod', { mono: true, stay: true, fill: GOOD });
      sub(760, 310, '프롬프트만 바꿔 끼운다 · 배포 없음', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k === 4: evaluate + self-host
    ex(470, 66, pop(u, 0.1));
    tx(60, 72, 'evaluate(target, data="customer_eval_v3")', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.1) });
    ['input', 'faithfulness', 'relevance'].forEach((s, j) => tx([70, 280, 420][j], 112, s, { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' }));
    [['환불 정책?', 1, 1], ['배송 기간?', 1, 1], ['교환 절차?', 0, 1]].forEach(([q, a, b], i) => { const y = 150 + i * 46, at = 0.4 + i * 0.35;
      tx(70, y, q, { 'font-size': 15, opacity: fade(u, at) });
      [a, b].forEach((v, j) => (v ? check : cross)([320, 460][j], y - 5, 9, pop(u, at + 0.15 + j * 0.1))); });
    zone(620, 90, 290, 220, null, { fill: SOFT, stroke: WARN, dash: '6 5' });
    lock(765, 160, true, WARN, pop(u, 1.6)); tx(765, 220, 'Self-host', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
    tx(765, 250, 'Enterprise 계약에서만', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
    sub(480, 380, '데이터셋 · 채점 · trace 가 한 UI 에 모인다', fade(u, 2.2), { 'font-size': 15 }); }

  // ---------- 2. Helicone ----------
  const H = { ax: 110, px: 480, ox: 820, y: 170 };
  function hPath(bend, o) { o = o || {};
    server(H.ax, H.y, '우리 앱', { lamp: ACC });
    card(H.ox, H.y, 150, 60, { rx: 12, text: 'OpenAI', fs: 16, fw: 800 });
    const by = lerp(H.y, H.y, bend);
    el('line', { x1: H.ax + 58, y1: H.y, x2: H.ox - 76, y2: H.y, stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '5 5', opacity: 1 - bend });
    if (bend > 0) { card(H.px, by, 180, 64, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: bend });
      tx(H.px, by - 4, 'Helicone proxy', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: bend });
      tx(H.px, by + 18, 'oai.helicone.ai', { 'font-size': 13.5, class: 'mono', fill: MUT, 'text-anchor': 'middle', opacity: bend });
      grow(H.ax + 58, H.y, H.px - 92, H.y, bend, ACC); grow(H.px + 92, H.y, H.ox - 76, H.y, bend, INK); } }
  const route = [[H.ax + 58, H.y], [H.px - 92, H.y], [H.px + 92, H.y], [H.ox - 76, H.y]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { hPath(E(u, 0.8, 1.6));
      pill(H.px, 300, 'base_url="https://oai.helicone.ai/v1"', ACC, pop(u, 0.4), { mono: true, fs: 14 });
      pill(H.px, 350, 'Helicone-Auth: Bearer …', INK, pop(u, 1.4), { mono: true, fs: 14 });
      sub(H.px, 95, 'SDK 는 그대로, 목적지만 바뀐다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { hPath(1);
      for (let i = 0; i < 4; i++) dot(route, seg(u, 0.2 + i * 0.4, 1.0 + i * 0.4), ACC, 6);
      zone(H.px - 150, 230, 300, 150, '요청 기록', { fill: SOFT });
      [0, 1, 2, 3].forEach((i) => { const op = fade(u, 0.8 + i * 0.4); el('rect', { x: H.px - 136, y: 262 + i * 28, width: 272, height: 20, rx: 4, fill: PANEL, stroke: GRID, opacity: op });
        mono(H.px - 126, 277 + i * 28, `POST /chat/completions`, { 'font-size': 13.5, opacity: op }); });
      card(150, 330, 200, 64, { rx: 10, stroke: GRID, text: 'create( … )\n변경 없음', fs: 14.5, mono: true, color: MUT });
      return; }
    if (k === 2) { head('계측 코드 없이 채워지는 것', fade(u, 0.1));
      ['요청/응답 전문', '토큰 + 비용', 'p50/p95/p99', 'error rate', 'user/session 묶음'].forEach((s, i) => { const x = 110 + i * 185, s2 = pop(u, 0.3 + i * 0.3);
        card(x, 190, 165, 150, { rx: 12, stroke: INK, sw: 2, s: s2 }); tx(x, 140, s, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: s2 });
        el('polyline', { points: [0, 1, 2, 3, 4, 5].map((j) => `${x - 62 + j * 25},${240 - [10, 22, 16, 30, 24, 36][(j + i) % 6] * E(u, 0.5 + i * 0.3, 1.2 + i * 0.3)}`).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: s2 }); });
      sub(480, 320, '선 모양은 그림용', fade(u, 1.8), { 'font-size': 13.5 }); return; }
    if (k === 3) { hPath(1);
      ['Helicone-User-Id', 'Helicone-Session-Id', 'Helicone-Property-Feature', 'Helicone-Cache-Enabled: true'].forEach((s, i) => pill([220, 560, 240, 620][i], [72, 72, 112, 112][i], s, i === 3 ? GOOD : INK, pop(u, 0.2 + i * 0.2), { mono: true, fs: 13.5 }));
      dot(route, seg(u, 0.9, 1.6), WARN, 7); pill(H.ox, 240, '1번째 · miss', WARN, pop(u, 1.5), { fs: 14 });
      dot([[H.ax + 58, H.y + 8], [H.px - 92, H.y + 8]], seg(u, 1.8, 2.2), GOOD, 7); dot([[H.px - 92, H.y - 8], [H.ax + 58, H.y - 8]], seg(u, 2.2, 2.6), GOOD, 7);
      pill(H.px, 250, '같은 요청 2번째 · cache hit', GOOD, pop(u, 2.2), { fs: 14 });
      sub(480, 360, '헤더에 식별자를 넣어야 "누가 얼마 쓰는지" 쪼개 본다', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    // k === 4: 포기하는 것
    hPath(1);
    pill(H.px, 90, '+ hop 하나 (지연이 조금 붙는다)', WARN, pop(u, 0.3), { fs: 14.5 });
    cross(H.px - 120, 250, 9, pop(u, 1.1)); tx(H.px - 100, 256, 'proxy 가 죽으면 호출도 막힌다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
    [['Eval', 1.6], ['Prompt registry', 1.9]].forEach(([s, at], i) => { const x = 330 + i * 300; card(x, 340, 220, 56, { rx: 10, stroke: OFF, dash: '6 5', text: s + ' · 약함', fs: 15, color: MUT, s: pop(u, at) }); }); }

  // ---------- 3. Langfuse ----------
  function infra(op) { zone(40, 66, 640, 330, '우리 인프라 (사내망)', { fill: SOFT, stroke: GOOD, dash: '8 6', op }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { infra(fade(u, 0.1));
      terminal(70, 100, 380, 110, ['$ git clone …/langfuse/langfuse', '$ docker compose up -d'], lerp(0, 2, E(u, 0.2, 1.2)), { fs: 14 });
      [['Langfuse UI', ':3000'], ['DB', '']].forEach(([n, p], i) => { const s = pop(u, 1.4 + i * 0.3); card(180 + i * 230, 300, 190, 70, { rx: 10, stroke: GOOD, sw: 2.2, s, text: n + (p ? '\n' + p : ''), fs: 15, fw: 800, mono: !!p }); });
      card(830, 200, 170, 70, { rx: 12, stroke: OFF, dash: '6 5', text: '외부 SaaS', fs: 15, color: MUT, s: pop(u, 1.8) }); cross(905, 172, 9, pop(u, 2.1));
      sub(830, 260, '데이터가 나가지 않는다', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); return; }
    infra(1);
    if (k === 1) { server(150, 220, '우리 앱', { lamp: GOOD });
      card(500, 220, 220, 70, { rx: 12, stroke: GOOD, sw: 2.4, text: 'Langfuse 서버', fs: 16, fw: 800, color: GOOD });
      grow(210, 220, 388, 220, E(u, 0.4, 1.2), GOOD);
      pill(330, 130, 'host="https://langfuse.mycompany.com"', GOOD, pop(u, 0.2), { mono: true, fs: 13.5 });
      pill(330, 320, 'public_key · secret_key', INK, pop(u, 1.2), { mono: true, fs: 13.5 });
      tx(820, 200, 'host 한 줄로', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(820, 226, 'Cloud ↔ self-host', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 2) { ex(640, 90, pop(u, 0.1));
      mono(70, 110, '@observe()', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
      spans(70, 160, [[0, 'answer_user', 0, 1, GOOD, ''], [1, 'OpenAI generation', 0.04, 0.9, WARN, '']], 0.5, u, { w: 330, nx: 220 });
      sub(360, 300, '함수 호출 전체가 trace 하나, 안의 LLM 호출이 자식 span', fade(u, 1.6), { 'font-size': 14.5 });
      card(840, 200, 200, 70, { rx: 12, stroke: GOOD, text: 'LangChain 없이\n순수 SDK 에 붙는다', fs: 14.5, s: pop(u, 2.0) }); return; }
    if (k === 3) {
      [['customer_bot v1', false], ['customer_bot v2', true]].forEach(([n, on], i) => { const y = 150 + i * 90; card(250, y, 300, 64, { rx: 10, stroke: on ? GOOD : GRID, sw: 2.2, s: pop(u, 0.2 + i * 0.3) });
        mono(120, y + 6, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) }); });
      const y = lerp(150, 240, E(u, 1.0, 1.8)); pill(480, y, 'production', GOOD, pop(u, 0.6), { mono: true, fs: 14.5 });
      server(840, 200, '운영', { lamp: GOOD }); grow(560, y, 780, 200, E(u, 1.8, 2.3), GOOD);
      sub(360, 350, '라벨이 붙은 버전을 운영이 읽는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k === 4
    dbIcon(500, 220, 'customer_eval_v3', { stroke: GOOD });
    for (let i = 0; i < 5; i++) fly(120, 140 + i * 36, 470, 210, seg(u, 0.2 + i * 0.35, 0.8 + i * 0.35), `item ${i + 1}`, { mono: true, fill: GOOD });
    const n = Math.min(5, Math.floor(lerp(0, 5.99, E(u, 0.8, 2.4)))); mono(500, 330, `${n}건 쌓임`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
    tx(820, 190, '금융 · 의료처럼', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    tx(820, 216, '규제가 있는 곳', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }

  // ---------- 4. W&B Weave ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { pill(260, 120, 'weave.init("customer_bot")', INFO, pop(u, 0.2), { mono: true, fs: 15 });
      card(620, 200, 300, 160, { rx: 14, stroke: INFO, sw: 2.5, s: pop(u, 0.8) });
      tx(620, 150, 'W&B 프로젝트', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) });
      ['ML 실험 run', 'LLM trace'].forEach((s, i) => pill(620, 200 + i * 44, s, INK, pop(u, 1.2 + i * 0.4), { fs: 14 }));
      grow(380, 130, 470, 170, E(u, 0.5, 0.9), INFO);
      sub(260, 220, 'ML 실험과 같은 그릇', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) {
      el('rect', { x: 270, y: 120, width: 420, height: 150, rx: 12, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.2) });
      mono(286, 144, '@weave.op()', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.2) });
      card(480, 205, 300, 70, { rx: 10, text: 'answer_user(question)', fs: 15, mono: true, fw: 800 });
      fly(80, 205, 260, 205, seg(u, 0.6, 1.3), 'question', { mono: true });
      fly(700, 205, 880, 205, seg(u, 1.3, 2.0), 'answer', { mono: true, fill: INK, stay: true });
      sub(480, 320, '입력과 출력이 통째로 기록된다 · Langfuse 의 observe 와 같은 발상', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) {
      pill(200, 110, 'answer_user("환불 정책?")', INK, pop(u, 0.2), { mono: true, fs: 14.5 });
      zone(380, 80, 520, 250, 'W&B UI · Traces', { fill: SOFT, stroke: INFO });
      [['answer_user', '방금', 1.0], ['answer_user', '이전 호출', 0]].forEach(([n, w, at], i) => { const y = 130 + i * 50, op = at ? fade(u, at) : 0.6;
        el('rect', { x: 396, y: y - 20, width: 488, height: 38, rx: 6, fill: i ? PANEL : INFOBG, stroke: i ? GRID : INFO, opacity: op });
        mono(412, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); tx(870, y + 5, w, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: op }); });
      dot([[300, 110], [396, 130]], seg(u, 0.5, 1.0), INFO, 7);
      sub(640, 290, '그래프로 비교하기 좋은 시각화가 강점', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { ex(890, 44, pop(u, 0.1)); head('wandb.init(project="rag_pipeline") 한 run', fade(u, 0.1), { 'font-size': 16 });
      const a1 = axes(80, 100, 330, 200, { x: [0, 10], y: [0, 1], xt: [0, 10], yt: [0, 0.5, 1], xl: 'step', yl: 'embedding_loss · MLOps' });
      line(a1, [[0, 0.9], [2, 0.55], [4, 0.35], [6, 0.22], [8, 0.15], [10, 0.12]], E(u, 0.3, 1.5), INFO, { sw: 3 });
      mono(a1.X(10), a1.Y(0.12) - 12, '0.12', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      const a2 = axes(560, 100, 330, 200, { x: [0, 10], y: [0, 1], xt: [0, 10], yt: [0, 0.5, 1], xl: '질문', yl: 'ragas_score · LLMOps' });
      R.scatter(a2, [[1, 0.8], [2, 0.7], [3, 0.9], [4, 0.85], [5, 0.6], [6, 0.9], [7, 0.75], [8, 0.95], [9, 0.8]], { u: E(u, 1.2, 2.3), col: ACC });
      sub(480, 395, '두 세계의 지표를 한 대시보드에 · 값은 그림용', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k === 4
    card(260, 180, 260, 110, { rx: 14, stroke: WARN, sw: 2.5, s: pop(u, 0.2) });
    mono(260, 180, '$50~ / 월', { 'font-size': 26, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    tx(260, 210, '표 가격 · 자주 바뀐다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    card(680, 140, 260, 56, { rx: 10, stroke: OFF, dash: '6 5', text: 'Prompt Hub · 미흡', fs: 15, color: MUT, s: pop(u, 0.9) });
    card(680, 220, 260, 56, { rx: 10, stroke: OFF, dash: '6 5', text: 'LLM 전용 기능 · 얕음', fs: 15, color: MUT, s: pop(u, 1.2) });
    tx(480, 340, 'MLOps 와 같은 팀이면 통합 가치, 아니면 비싸다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }

  // ---------- 5. 선택 가이드 ----------
  function q(x, y, s, op) { card(x, y, 250, 48, { rx: 24, stroke: INK, sw: 2.2, text: s, fs: 15, fw: 800, op }); }
  function ans(x, y, s, col, sc) { card(x, y, 190, 46, { rx: 10, stroke: col, sw: 2.4, fill: PANEL, text: s, fs: 15, fw: 800, color: col, s: sc }); }
  function tree(k, u) { const f = (a) => (k === 0 ? fade(u, a) : 1), p = (a) => (k === 0 ? pop(u, a) : 1);
    q(200, 80, 'Q1. LangChain 쓰나?', f(0.1)); grow(325, 80, 560, 80, k === 0 ? E(u, 0.4, 0.8) : 1, ACC); tx(440, 70, 'YES', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: f(0.6) }); ans(660, 80, 'LangSmith', ACC, p(0.7));
    grow(200, 104, 200, 140, k === 0 ? E(u, 1.0, 1.2) : 1, MUT); tx(214, 128, 'NO', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: f(1.0) });
    q(200, 165, 'Q2. 데이터 주권?', f(1.2)); grow(325, 165, 560, 165, k === 0 ? E(u, 1.5, 1.9) : 1, GOOD); tx(440, 155, 'YES', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: f(1.7) }); ans(660, 165, 'Langfuse self-host', GOOD, p(1.8)); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { tree(k, u);
      if (k === 0) { sub(480, 330, '취향이 아니라 제약부터 · 규제와 스택은 협상 대상이 아니다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      grow(200, 189, 200, 225, E(u, 0.1, 0.3), MUT);
      q(200, 250, 'Q3. 최대한 빨리?', fade(u, 0.3)); grow(325, 250, 560, 250, E(u, 0.6, 1.0), WARN); ans(660, 250, 'Helicone', WARN, pop(u, 0.9));
      grow(200, 274, 200, 310, E(u, 1.1, 1.3), MUT);
      q(200, 335, 'Q4. MLOps 와 한 곳?', fade(u, 1.3)); grow(325, 335, 560, 335, E(u, 1.6, 2.0), INFO); ans(660, 335, 'W&B Weave', INFO, pop(u, 1.9)); return; }
    if (k === 2) { head('규모별 추천', fade(u, 0.1));
      [['프로토타입 (1주)', 'Helicone', WARN], ['소규모 ($1K/mo)', 'Helicone / Langfuse', WARN], ['중규모 ($10K/mo)', 'Langfuse self-host', GOOD], ['대규모 ($100K/mo)', 'LangSmith Enterprise', ACC], ['금융 / 의료', 'Langfuse self-host', GOOD]].forEach(([a, b, col], i) => { const y = 92 + i * 60, w = 160 + i * 60, s = pop(u, 0.2 + i * 0.3);
        el('rect', { x: 80, y: y - 22, width: w * s, height: 44, rx: 6, fill: SOFT, stroke: GRID });
        tx(94, y + 6, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); ans(780, y, b, col, s); grow(80 + w + 10, y, 680, y, E(u, 0.3 + i * 0.3, 0.6 + i * 0.3), MUT); });
      return; }
    if (k === 3) { const tools = ['LangSmith', 'Helicone', 'Langfuse', 'W&B'], rows = [['Trace', [2, 2, 2, 2]], ['Prompt Hub', [3, 1, 2, 1]], ['Eval (RAGAS)', [3, 1, 2, 2]], ['A/B 테스트', [2, 2, 2, 1]], ['Self-host', [1, 2, 2, 2]], ['MLOps', [0, 0, 0, 3]]];
      const sym = ['❌', '⚠', '✅', '✅✅'], col = [BAD, WARN, GOOD, GOOD];
      tools.forEach((s, j) => tx(390 + j * 140, 70, s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.1) }));
      rows.forEach(([n, v], i) => { const y = 112 + i * 46, same = v.every((x) => x === v[0]), op = fade(u, 0.3 + i * 0.25) * (same && u > 1.9 ? 0.35 : 1);
        tx(120, y + 6, n, { 'font-size': 15, 'font-weight': 700, opacity: op });
        v.forEach((x, j) => { el('rect', { x: 330 + j * 140, y: y - 18, width: 120, height: 36, rx: 6, fill: x >= 2 ? GOODBG : x === 1 ? WARNBG : BADBG, opacity: op });
          tx(390 + j * 140, y + 6, sym[x] + (n === 'Self-host' && j === 0 ? ' Ent.' : ''), { 'font-size': 14.5, 'text-anchor': 'middle', fill: col[x], 'font-weight': 800, opacity: op }); }); });
      sub(480, 400, '모두 되는 줄(Trace)은 판단에 쓸모없다 · 갈리는 줄만 본다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k === 4
    [['Helicone', 180, WARN], ['Langfuse', 480, GOOD], ['LangSmith', 780, ACC]].forEach(([n, x, col], i) => ans(x, 180, n, col, pop(u, 0.2 + i * 0.3)));
    grow(280, 170, 380, 170, E(u, 1.0, 1.4), MUT); grow(580, 170, 680, 170, E(u, 1.5, 1.9), MUT);
    tx(330, 150, '막히면', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); tx(630, 150, '막히면', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
    banner(480, 300, '오늘 가장 빨리 시작할 수 있는 것으로 시작한다', pop(u, 2.1)); }

  const quiz = [
    { q: 'LangChain 앱에서 LangSmith 추적을 켜려면 무엇을 바꾸는가?',
      o: ['환경변수 세 줄(TRACING_V2, API_KEY, PROJECT)', '모든 함수에 데코레이터를 붙인다', 'OpenAI base_url을 바꾼다'], a: 0,
      why: 'LangSmith는 LangChain과 붙어 있어 환경변수만 켜면 chain.invoke가 trace로 쌓인다. 애플리케이션 코드는 한 줄도 바뀌지 않는다.' },
    { q: 'Helicone이 기존 코드 수정 없이 호출을 기록할 수 있는 이유는 무엇인가?',
      o: ['OpenAI가 Helicone에 로그를 보내 줘서', '호출 경로에 proxy로 끼어들어 지나가는 요청을 기록해서', '응답을 캐시에만 저장해서'], a: 1,
      why: 'base_url을 oai.helicone.ai로 바꾸면 모든 요청이 proxy를 지난다. 대신 hop 하나만큼 지연이 붙고 proxy 장애도 경로에 들어온다.' },
    { q: '금융 회사가 Langfuse를 고르는 가장 큰 이유는 무엇인가?',
      o: ['UI가 가장 세련돼서', 'MLOps 실험까지 한 곳에서 보여서', 'docker compose로 사내에 띄워 데이터가 밖으로 나가지 않아서'], a: 2,
      why: 'Langfuse는 MIT 라이선스 오픈소스라 우리 인프라에 띄울 수 있다. trace와 평가셋이 모두 사내 서버에 남는다.' },
    { q: 'W&B Weave를 고를 만한 상황은 무엇인가?',
      o: ['같은 팀이 임베딩 학습(MLOps)과 LLM 호출(LLMOps)을 한 대시보드에서 봐야 할 때', 'Prompt Hub가 가장 중요할 때', '비용을 가장 아끼고 싶을 때'], a: 0,
      why: '한 run에 embedding_loss와 ragas_score를 함께 남길 수 있는 것이 강점이다. LLM 전용 기능과 가격은 약점이다.' },
    { q: '도구 선택 가이드가 Q1·Q2를 먼저 묻는 이유는 무엇인가?',
      o: ['가장 싼 도구를 먼저 고르려고', 'LangChain 사용과 데이터 규제는 바꾸기 어려운 제약이라서', '질문 순서는 상관없어서'], a: 1,
      why: '이미 쓰는 스택과 규제는 협상 대상이 아니다. 그 두 제약에 걸리지 않을 때 속도와 MLOps 통합으로 좁힌다.' },
  ];

  const summary = [
    'LangSmith는 LangChain 앱에서 환경변수만으로 trace, 프롬프트, 평가를 한 곳에 모은다.',
    'Helicone은 base_url 한 줄로 proxy를 끼워 넣어 코드 수정 없이 호출을 기록한다.',
    'Langfuse는 우리 서버에 직접 띄울 수 있어 trace와 평가셋이 사내에 남는다.',
    '고를 때는 LangChain 사용과 데이터 규제를 먼저 보고, 작게 시작해 막히면 옮긴다.',
  ];
  const review = [
    { q: '병원 상담 챗봇을 만든다. LangChain은 쓰지 않고 환자 대화가 외부로 나가면 안 된다. 무엇을 고를까?',
      o: ['LangSmith SaaS', 'Langfuse self-host', 'Helicone Cloud'], a: 1,
      why: 'Q1은 NO, Q2는 YES다. Langfuse를 사내에 띄우면 trace와 평가셋이 우리 인프라에 남는다.' },
    { q: '해커톤 프로토타입에 오늘 오후까지 비용과 지연을 보고 싶다. 가장 빠른 방법은?',
      o: ['W&B 프로젝트를 만들고 run 구조를 설계한다', 'Langfuse를 docker compose로 띄운다', 'OpenAI base_url을 Helicone proxy로 바꾼다'], a: 2,
      why: 'base_url과 인증 헤더만 바꾸면 토큰·비용·p95가 바로 쌓인다. 프로토타입 규모에서는 무료 tier로 충분하다.' },
    { q: 'Helicone을 붙인 뒤 사용자별 비용을 보려 했는데 전부 한 묶음으로만 보인다. 먼저 확인할 것은?',
      o: ['Helicone-User-Id 같은 식별 헤더를 요청에 넣었는지', 'temperature 값', '평가셋 크기'], a: 0,
      why: 'proxy는 요청에 실린 정보로만 쪼갤 수 있다. User·Session·Feature 헤더를 넣어야 그 축으로 비용을 나눠 본다.' },
  ];

  R.page({ title: 'LLMOps 도구 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
