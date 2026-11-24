/* I-2-2 환경 설정 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행해 본 값(node v24.14.0, dotenv 18.0.10): process.env.PORT 는 문자열 "3000",
 * dotenv.config() → "◇ injected env (3) from .env", --env-file 없이 PORT undefined / 붙이면 "3000",
 * NODE_ENV=production → isProd true · logLevel warn · { message: 'Internal Error' },
 * Step 2 의 .env 로 validate-env.js 를 돌리면 "필수 환경변수 누락: JWT_SECRET" 후 exit 1,
 * engines 불일치 → npm warn EBADENGINE, engine-strict → npm error code EBADENGINE. 운영 DB 주소는 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, terminal, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function file(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: op });
    el('rect', { x, y, width: w, height: 30, rx: 10, fill: SOFT, opacity: op }); el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: o.stroke || INK, 'stroke-width': 1.2, opacity: op });
    mono(x + 14, y + 21, name, { 'font-size': 15, 'font-weight': 800, opacity: op, fill: o.stroke === GRID ? MUT : o.stroke || INK }); }
  // 방패 (.gitignore)
  function shield(cx, cy, s, col) { const g = R.G(cx, cy, s); el('path', { d: 'M0,-34 L28,-24 V2 C28,20 14,30 0,36 C-14,30 -28,20 -28,2 V-24 Z', fill: PANEL, stroke: col, 'stroke-width': 3 }, g);
    el('path', { d: 'M-11,0 L-3,9 L12,-9', fill: 'none', stroke: col, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g); }

  // ---------- 1. process.env ----------
  const ENV = { x: 30, y: 60, w: 270 }, PE = { cx: 420, cy: 210 }, CFG = { x: 560, y: 60, w: 370, h: 300 };
  const KEYS = ['PORT', 'DB_URL', 'API_KEY'], VAL = { PORT: '"3000"', DB_URL: '"postgres://localhost…"', API_KEY: '(값은 코드 밖)' };
  function envBox(items, title, col, op) { zone(ENV.x, ENV.y, ENV.w, 40 + items.length * 40, title, { fill: SOFT, op, color: col });
    items.forEach((s, i) => mono(ENV.x + 16, ENV.y + 56 + i * 40, s, { 'font-size': 14.5, opacity: op, 'font-weight': 700 })); }
  function s1(t, c) { const { k, u } = c, D = c.beat.env, P = c.prev && c.prev.env;
    envBox(D.source.items, '환경 (.env / OS)', MUT, 1);
    file(CFG.x, CFG.y, CFG.w, CFG.h, 'config.js', { stroke: INK });
    if (k === 0) { mono(CFG.x + 16, CFG.y + 70, 'const dbUrl =', { 'font-size': 14.5 }); mono(CFG.x + 16, CFG.y + 98, '"postgres://prod-server:5432/app"', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      const g = E(u, 0.6, 1.4); if (g > 0) el('line', { x1: CFG.x + 12, y1: CFG.y + 93, x2: CFG.x + 12 + 340 * g, y2: CFG.y + 93, stroke: BAD, 'stroke-width': 3 });
      zone(CFG.x, 300 + 10, CFG.w, 60, 'git 이력', { fill: BADBG, op: fade(u, 1.4) }); mono(CFG.x + 16, 356, '커밋마다 이 주소가 남는다', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.6) });
      note(ENV.x, 260, '값은 환경이 쥐어야 한다', fade(u, 2.0), { fill: ACC }); return; }
    // process.env 원
    el('circle', { cx: PE.cx, cy: PE.cy, r: 58, fill: PANEL, stroke: ACC, 'stroke-width': 2.4 });
    mono(PE.cx, PE.cy + 5, 'process.env', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC });
    mono(CFG.x + 16, CFG.y + 64, 'const config = {', { 'font-size': 14.5, opacity: k === 1 ? fade(u, 0.3) : 1 });
    mono(CFG.x + 16, CFG.y + 64 + 4 * 46, '};', { 'font-size': 14.5, opacity: k === 1 ? fade(u, 0.3) : 1 });
    const reads = D.appReads.filter((r) => r.key.startsWith('process.env.')).map((r) => r.key.split('.').pop());
    KEYS.forEach((key, i) => { const y = CFG.y + 64 + (i + 1) * 46, on = reads.includes(key), isNew = on && !(P && P.appReads.find((q) => q.key === 'process.env.' + key));
      const nm = { PORT: 'port', DB_URL: 'dbUrl', API_KEY: 'apiKey' }[key];
      el('rect', { x: CFG.x + 30, y: y - 20, width: 320, height: 30, rx: 6, fill: on ? ACCBG : 'none', stroke: on ? 'none' : GRID, 'stroke-dasharray': '4 4' });
      mono(CFG.x + 40, y, `${nm}:`, { 'font-size': 14.5, fill: on ? INK : OFF });
      if (on) mono(CFG.x + 130, y, VAL[key], { 'font-size': 14, fill: key === 'API_KEY' ? MUT : ACC, 'font-weight': 700, opacity: isNew ? fade(u, 1.3) : 1 });
      if (isNew) { dot([[ENV.x + ENV.w, ENV.y + 50 + i * 40], [PE.cx, PE.cy], [CFG.x + 30, y - 5]], seg(u, 0.2, 1.3), ACC, 7); } });
    if (k === 1) note(CFG.x, CFG.y + CFG.h + 30, '읽는 곳을 한 군데로 모은다', fade(u, 1.0), { fill: ACC });
    if (k === 2) note(CFG.x, CFG.y + CFG.h + 30, 'typeof → "string" · 숫자가 필요하면 Number()', fade(u, 1.8), { fill: WARN, 'font-size': 14 });
    if (k === 3) { zone(ENV.x, 250, ENV.w, 80, '운영 서버 (예시)', { fill: INFOBG, op: fade(u, 1.5), color: INFO });
      mono(ENV.x + 16, 306, 'DB_URL=postgres://prod-…', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      note(ENV.x, 370, '같은 코드, 값만 다르다', fade(u, 2.1), { fill: INFO, 'font-size': 14 }); }
    if (k === 4) { zone(ENV.x, 260, ENV.w, 100, 'git 에 올라가는 것', { fill: GOODBG }); mono(ENV.x + 16, 316, 'process.env.API_KEY', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(ENV.x + 16, 342, '키 이름만, 값은 없다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 5) { ['db.js', 'server.js', 'client.js'].forEach((f, i) => { const x = CFG.x + 60 + i * 125;
        pill(x, 395, f, INK, pop(u, 0.5 + i * 0.25), { mono: true, fs: 13.5 }); grow(x, 380, x, CFG.y + CFG.h + 4, E(u, 0.8 + i * 0.25, 1.2 + i * 0.25), ACC); });
      note(ENV.x, 300, 'process.env 를 읽는 곳은 config.js 하나', fade(u, 1.8), { fill: ACC, 'font-size': 14 }); } }

  // ---------- 2. .env · dotenv ----------
  const ENVF = ['PORT=3000', 'DB_URL=postgres://localhost:5432/app_dev', 'API_KEY=sk-live-abc123secret'];
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { file(30, 40, 430, 160, '.env', { stroke: BAD }); lock(430, 56, true, BAD, 0.8);
      ENVF.forEach((s, i) => mono(48, 96 + i * 32, s, { 'font-size': 14.5, opacity: k === 0 ? fade(u, 0.3 + i * 0.3) : 1 }));
      if (k === 0) { note(30, 250, '실제 비밀값이 그대로 들어 있다', fade(u, 1.6), { fill: BAD }); return; }
      file(30, 230, 430, 150, '.env.example', { stroke: GOOD, op: k === 1 ? fade(u, 0.3) : 1 });
      ['PORT=', 'DB_URL=', 'API_KEY='].forEach((s, i) => mono(48, 286 + i * 30, s, { 'font-size': 14.5, opacity: k === 1 ? fade(u, 0.6 + i * 0.2) : 1 }));
      if (k === 1) { grow(470, 300, 560, 300, E(u, 1.4, 1.8), MUT); card(700, 300, 240, 70, { rx: 10, text: '팀원: 복사해서\n자기 값을 채운다', fs: 14.5, stroke: GOOD, s: pop(u, 1.8) }); return; }
      // k2: git add . — .env 는 방패에서 튕긴다
      shield(600, 200, pop(u, 0.2), GOOD); mono(600, 262, '.gitignore', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
      zone(720, 60, 220, 300, '저장소', { fill: SOFT });
      const b = seg(u, 0.5, 1.5), back = b < 0.6 ? b / 0.6 : 1 - (b - 0.6) / 0.4 * 0.7;
      if (u > 0.5) card(lerp(380, 560, back), lerp(120, 190, back), 90, 34, { rx: 8, text: '.env', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG });
      if (b >= 0.6 && b < 1) cross(560, 160, 9, 1);
      fly(380, 300, 830, 150, seg(u, 1.2, 2.2), '.env.example', { mono: true, fill: GOOD, stay: true });
      if (u > 2.2) { fly(600, 200, 830, 200, 1, '.gitignore', { mono: true, fill: INK, stay: true }); }
      return; }
    if (k === 3) { file(30, 40, 430, 160, '.env', { stroke: BAD });
      ENVF.forEach((s, i) => { mono(48, 96 + i * 32, s, { 'font-size': 14.5 }); fly(250, 92 + i * 32, 700, 120 + i * 40, seg(u, 0.4 + i * 0.25, 1.1 + i * 0.25), s.split('=')[0], { mono: true }); });
      zone(570, 70, 260, 170, 'process.env', { fill: ACCBG, color: ACC });
      ENVF.forEach((s, i) => { if (u > 1.1 + i * 0.25) mono(590, 125 + i * 40, s.split('=')[0] + ' ✓', { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); });
      terminal(30, 270, 560, 110, ['$ node index.js', '◇ injected env (3) from .env'], lerp(1, 2, E(u, 1.8, 2.3)), { title: 'dotenv 18' });
      note(620, 320, '운영은 dotenv 대신 진짜 환경변수', fade(u, 2.4), { 'font-size': 14, fill: MUT }); return; }
    // k4: --env-file
    tx(30, 50, 'Node 20.6+ 는 .env 를 직접 읽는다', { 'font-size': 16, 'font-weight': 800 });
    terminal(30, 80, 620, 200, ['$ node config.js', '{ port: undefined, dbUrl: undefined, … }', '$ node --env-file=.env config.js', "{ port: '3000', dbUrl: 'postgres://localhost…', … }"],
      lerp(0, 4, E(u, 0.2, 2.0)), { title: 'node v24', fs: 14 });
    pill(800, 120, 'dotenv 설치 없이', GOOD, pop(u, 1.6), { fs: 14 }); pill(800, 170, 'process.loadEnvFile()', INFO, pop(u, 2.0), { mono: true, fs: 13.5 });
    note(30, 330, '.env · .env.example · .gitignore 세 파일 규칙은 그대로', fade(u, 2.3), { fill: ACC, 'font-size': 14 }); }

  // ---------- 3. NODE_ENV ----------
  function lever(cx, cy, prod, u) { el('rect', { x: cx - 70, y: cy - 20, width: 140, height: 40, rx: 20, fill: prod ? ACCBG : SOFT, stroke: prod ? ACC : MUT, 'stroke-width': 2 });
    el('circle', { cx: cx + (prod ? 48 : -48), cy, r: 15, fill: prod ? ACC : MUT });
    mono(cx, cy + 46, prod ? 'production' : 'development', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: prod ? ACC : MUT }); }
  function s3(t, c) { const { k, u } = c, rows = c.beat.nodeenv.rows;
    if (k === 0) { [['NODE_ENV 없음', false, 'env = "development"', 'isProd = false'], ['NODE_ENV=production', true, 'env = "production"', 'isProd = true']].forEach(([a, prod, e, p], i) => {
        const x = 240 + i * 480, s = fade(u, 0.3 + i * 0.6); mono(x, 70, a, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: s });
        if (s > 0.1) lever(x, 130, prod, u); mono(x, 230, e, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.7 + i * 0.6) }); mono(x, 260, p, { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: prod ? ACC : MUT, opacity: fade(u, 0.9 + i * 0.6) }); });
      note(240, 340, '이 값을 읽는 곳은 한 군데, 나머지는 isProd 만 본다', fade(u, 2.2), { fill: ACC, 'font-size': 14 }); return; }
    if (k === 1) { const LV = [['debug', MUT], ['info', INFO], ['warn', WARN], ['error', BAD]];
      [['development · debug', false], ['production · warn', true]].forEach(([n, prod], j) => { const y = 90 + j * 150;
        tx(30, y - 30, n, { 'font-size': 15, 'font-weight': 800, fill: prod ? ACC : MUT });
        el('line', { x1: 470, y1: y - 26, x2: 470, y2: y + 92, stroke: prod ? ACC : GRID, 'stroke-width': 4, 'stroke-dasharray': prod ? null : '6 6' });
        LV.forEach(([lv, col], i) => { const pass = !prod || i >= 2, x = lerp(60, pass ? 760 : 450, E(u, 0.3 + i * 0.25, 1.4 + i * 0.25));
          pill(x, y + i * 30 - 12, lv, col, 1, { mono: true, fs: 13.5, op: pass ? 1 : 0.5 }); }); });
      note(560, 400, '운영 로그가 줄면 진짜 문제가 보인다', fade(u, 2.2), { fill: ACC, 'font-size': 14 }); return; }
    if (k === 2) { tx(30, 50, 'throw new Error("boom") 에 대한 응답', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      [['development', "{ message: 'boom',\n  stack: 'Error: boom\\n at …' }", WARN], ['production', "{ message: 'Internal Error' }", GOOD]].forEach(([n, body, col], i) => { const x = 250 + i * 460, s = pop(u, 0.4 + i * 0.6);
        lever(x, 110, i === 1, u); card(x, 260, 400, 100, { rx: 10, stroke: col, s }); if (s > 0.5) body.split('\n').forEach((l, j) => mono(x - 180, 252 + j * 26, l, { 'font-size': 14, fill: col, 'font-weight': 700 })); });
      note(30, 370, '스택에는 파일 경로와 내부 구조가 드러난다', fade(u, 2.2), { fill: WARN, 'font-size': 14 }); return; }
    // k3: 분기는 가장자리에만
    card(480, 210, 220, 90, { rx: 14, text: '핵심 로직\n환경과 무관하게 같다', fs: 15, stroke: ACC, fill: ACCBG, color: INK, s: pop(u, 0.2) });
    rows.forEach((r, i) => { const a = -Math.PI / 2 + i * (Math.PI / 2) + Math.PI / 4, x = 480 + Math.cos(a) * 320, y = 210 + Math.sin(a) * 140, s = pop(u, 0.6 + i * 0.3);
      card(x, y, 270, 80, { rx: 10, stroke: WARN, s }); if (s > 0.5) { tx(x, y - 14, r.topic, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN }); tx(x, y + 8, '개발: ' + r.dev, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); tx(x, y + 28, '운영: ' + r.prod, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK }); }
      grow(480 + Math.cos(a) * 120, 210 + Math.sin(a) * 52, x - Math.cos(a) * 118, y - Math.sin(a) * 42, E(u, 0.8 + i * 0.3, 1.2 + i * 0.3), WARN, { plain: true, dash: '5 4' }); }); }

  // ---------- 4. 부팅 검증 ----------
  function s4(t, c) { const { k, u } = c, V = c.beat.validate, P = c.prev && c.prev.validate;
    // 부팅 단계 줄
    const ST = ['dotenv 로드', '필수 검사', '서버 listen'];
    ST.forEach((s, i) => { const x = 130 + i * 300, active = (k === 0 && i === 0) || (k >= 1 && k <= 3 && i === 1), dead = k === 4 && i === 2;
      card(x, 50, 220, 44, { rx: 22, text: s, fs: 15, stroke: dead ? BAD : active ? ACC : GRID, color: dead ? BAD : active ? ACC : MUT, fill: active ? ACCBG : PANEL, dash: dead ? '5 4' : null });
      if (i) grow(x - 300 + 112, 50, x - 112, 50, 1, MUT); });
    // process.env 상자
    zone(30, 110, 330, 200, 'process.env', { fill: SOFT });
    const loaded = k === 0 ? E(u, 0.4, 1.8) : 1;
    ['PORT', 'DB_URL', 'API_KEY'].forEach((key, i) => { if (loaded * 3 > i) mono(50, 160 + i * 36, key + ' ✓', { 'font-size': 15, fill: ACC, 'font-weight': 700 }); });
    mono(50, 160 + 3 * 36, 'JWT_SECRET  없음', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: loaded > 0.99 ? fade(u, k === 0 ? 2.0 : 0) : 0 });
    if (k === 0) { note(420, 170, '검사보다 먼저 .env 를 넣는다', fade(u, 0.8), { fill: ACC }); note(420, 200, '순서가 바뀌면 멀쩡한 키도 누락으로 잡힌다', fade(u, 1.4), { 'font-size': 14, fill: MUT }); return; }
    // REQUIRED 카드
    tx(420, 140, 'REQUIRED', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    V.required.forEach((key, i) => { const ok = V.present[key], x = 480 + i * 160, y = 190, s = k === 1 ? pop(u, 0.3 + i * 0.3) : 1;
      const judged = k >= 3 || (k === 1 && u > 1.6);
      card(x, y, 140, 48, { rx: 10, text: key, fs: 14.5, mono: true, stroke: judged ? (ok ? GOOD : BAD) : INK, color: judged ? (ok ? GOOD : BAD) : INK, fill: judged && !ok ? BADBG : PANEL, s }); });
    if (k === 1) { note(420, 300, '없으면 앱이 못 도는 키만 적는다', fade(u, 1.9), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 2) { tx(420, 280, '기본값을 주는가', { 'font-size': 15, 'font-weight': 800 });
      [['PORT', '|| 3000', '틀려도 안전 → 기본값 OK', GOOD], ['API_KEY · JWT_SECRET', '기본값 없음', '틀린 값으로 조용히 돌면 사고', BAD]].forEach(([a, b, d, col], i) => { const y = 316 + i * 40, op = fade(u, 0.4 + i * 0.6);
        mono(420, y, a, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); mono(640, y, b, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: op }); tx(930, y, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }); return; }
    if (k === 3) { mono(420, 290, 'REQUIRED.filter((k) => !process.env[k])', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      fly(800, 214, 600, 340, seg(u, 0.6, 1.4), 'JWT_SECRET', { mono: true, fill: BAD, stay: true });
      mono(420, 345, 'missing =', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) }); mono(680, 345, '— 1건', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    // k4: exit 1
    terminal(30, 320, 560, 90, ['◇ injected env (3) from .env', '필수 환경변수 누락: JWT_SECRET', '$ echo $?  →  1'], lerp(1, 3, E(u, 0.2, 1.4)), { title: 'node validate-env.js', lh: 21, fs: 13.5 });
    server(780, 330, null, { stroke: OFF, lamp: OFF, s: 0.7 }); cross(780, 330, 16, pop(u, 1.4));
    mono(780, 395, '트래픽을 받기 전에 멈춘다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  // ---------- 5. Node 버전 ----------
  function s5(t, c) { const { k, u } = c, places = c.beat.version.places;
    if (k === 0) { tx(30, 46, 'Node 메이저 버전 (2026-11)', { 'font-size': 15, 'font-weight': 800 });
      [['20', '지원 종료 (2026-04)', OFF], ['22', 'LTS', INFO], ['24', 'LTS · 지금 고를 버전', GOOD], ['25', '홀수 · LTS 없음', WARN]].forEach(([v, d, col], i) => { const y = 90 + i * 52, g = E(u, 0.2 + i * 0.25, 0.8 + i * 0.25);
        mono(60, y + 22, 'v' + v, { 'font-size': 17, 'font-weight': 800, fill: col });
        el('rect', { x: 120, y: y + 4, width: 300 * g, height: 28, rx: 6, fill: col, opacity: v === '24' ? 0.9 : 0.4 });
        tx(440, y + 24, d, { 'font-size': 14.5, fill: v === '24' ? GOOD : MUT, 'font-weight': v === '24' ? 800 : 500, opacity: g }); });
      file(700, 90, 200, 110, '.nvmrc', { stroke: ACC }); mono(800, 165, '24', { 'font-size': 34, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(30, 340, '짝수 메이저 LTS 를 메이저 숫자만 적는다', fade(u, 2.0), { fill: ACC, 'font-size': 14 }); return; }
    if (k === 1) { mono(30, 60, '"engines": { "node": ">=24" }', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
      terminal(30, 100, 600, 110, ['$ npm install   (맞지 않는 Node 에서)', 'npm warn EBADENGINE Unsupported engine'], lerp(1, 2, E(u, 0.5, 1.2)), { title: '기본: 경고만', fs: 14 });
      terminal(30, 240, 600, 110, ['$ npm install --engine-strict', 'npm error code EBADENGINE'], lerp(1, 2, E(u, 1.4, 2.0)), { title: 'engine-strict=true: 설치 실패', fs: 14 });
      pill(800, 150, '경고', WARN, pop(u, 1.2), { fs: 15 }); pill(800, 290, '차단', BAD, pop(u, 2.0), { fs: 15 }); return; }
    // k2, k3: 세 곳이 같은 버전
    places.forEach((p, i) => { const x = 170 + i * 310, isNew = !(c.prev && c.prev.version.places.find((q) => q.where === p.where)), s = isNew ? pop(u, 0.3) : 1;
      card(x, 120, 270, 110, { rx: 12, stroke: GOOD, s }); if (s > 0.5) { tx(x, 98, p.where, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); mono(x, 134, p.value, { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); tx(x, 160, p.how, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } });
    ['로컬', '협업', '운영'].forEach((s, i) => mono(170 + i * 310, 200, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: places[i] ? 1 : 0 }));
    if (k === 2) { el('line', { x1: 60, y1: 240, x2: 60 + 840 * E(u, 0.8, 1.8), y2: 240, stroke: GOOD, 'stroke-width': 3 }); note(60, 290, 'CI 이미지를 latest 로 두면 어느 날 조용히 버전이 바뀐다', fade(u, 2.0), { fill: WARN, 'font-size': 14 }); return; }
    terminal(60, 250, 520, 130, ['$ nvm use', 'Found \'.nvmrc\' with version <24>', '$ node -v', 'v24.14.0'], lerp(1, 4, E(u, 0.3, 1.8)), { title: 'terminal' });
    check(680, 315, 18, pop(u, 2.0)); mono(720, 322, '세 곳 모두 24', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: 'PORT=3000으로 실행했을 때 process.env.PORT의 값은 무엇인가?',
      o: ['숫자 3000', '문자열 "3000"', 'undefined'], a: 1,
      why: '환경변수는 언제나 문자열로 들어온다. 실행해 보면 typeof가 string이라 숫자가 필요하면 Number()로 바꾼다.' },
    { q: '.env, .env.example, .gitignore 중 저장소에 올라가지 않아야 하는 것은?',
      o: ['.env.example', '.gitignore', '.env'], a: 2,
      why: '.env에는 진짜 비밀값이 있다. .gitignore로 막고, 키 목록만 담은 .env.example을 대신 커밋한다.' },
    { q: 'NODE_ENV=production일 때 errorBody(new Error("boom"))가 돌려주는 것은?',
      o: ['{ message: "Internal Error" }', '{ message: "boom", stack: … }', '아무것도 돌려주지 않는다'], a: 0,
      why: '운영에서는 스택을 숨기고 일반 메시지만 보낸다. 실행해 보면 개발에서만 boom과 스택이 나온다.' },
    { q: '2단계의 .env 그대로 validate-env.js를 실행하면 어떻게 되나?',
      o: ['PORT가 없어 기본값 3000으로 뜬다', 'JWT_SECRET 누락을 찍고 exit 1로 끝난다', 'API_KEY 누락으로 종료된다'], a: 1,
      why: '.env에는 PORT, DB_URL, API_KEY만 있다. REQUIRED 중 JWT_SECRET이 빠져 missing에 담기고 바로 종료된다.' },
    { q: 'package.json에 "engines": { "node": ">=24" }만 두었을 때 Node 22에서 npm install하면?',
      o: ['설치가 실패한다', 'Node 24가 자동으로 깔린다', 'EBADENGINE 경고만 내고 설치는 된다'], a: 2,
      why: 'engines는 기본적으로 경고다. engine-strict=true를 켜야 npm error code EBADENGINE으로 설치가 막힌다.' },
  ];

  const summary = [
    '환경마다 바뀌는 값은 코드에 적지 않고 process.env로 읽는다. 값은 언제나 문자열이다.',
    '.env는 커밋하지 않고 .env.example로 키 목록만 공유한다. Node 20.6부터는 --env-file로도 읽는다.',
    'NODE_ENV는 한 곳에서 읽어 로그 레벨과 에러 노출만 가르고, 핵심 로직은 그대로 둔다.',
    '필수 키가 빠지면 부팅에서 바로 exit 1로 끝내고, Node 버전은 .nvmrc와 engines와 CI에 24로 맞춘다.',
  ];
  const review = [
    { q: '새로 들어온 팀원이 서버를 띄우자 "필수 환경변수 누락: JWT_SECRET"이 났다. 먼저 볼 곳은?',
      o: ['.env.example에 JWT_SECRET이 있는지와 자기 .env에 값을 채웠는지', 'validate-env.js의 REQUIRED에서 JWT_SECRET을 지우기', 'NODE_ENV를 production으로 바꾸기'], a: 0,
      why: '검증은 할 일을 했다. 필요한 키가 .env.example에 적혀 있어야 팀원이 무엇을 채울지 안다.' },
    { q: '운영 서버에서 에러 응답에 파일 경로가 담긴 스택이 그대로 나간다. 가장 먼저 의심할 것은?',
      o: ['dotenv가 운영에서 .env를 못 읽었다', '운영 프로세스에 NODE_ENV=production이 안 들어갔다', 'engines가 24로 되어 있다'], a: 1,
      why: 'errorBody는 isProd일 때만 스택을 숨긴다. NODE_ENV가 비면 development로 판정돼 스택이 나간다.' },
    { q: '로컬에선 되는데 CI에서만 문법 오류가 난다. CI 이미지는 node:latest다. 어떻게 고치나?',
      o: ['CI에서 npm install을 다시 돌린다', 'API_KEY에 기본값을 준다', '.nvmrc와 engines와 CI 이미지 태그를 같은 메이저 버전으로 맞춘다'], a: 2,
      why: 'latest는 어느 날 버전이 바뀐다. 로컬, 협업, 운영 세 곳의 버전을 하나로 못 박아야 같은 결과가 나온다.' },
  ];

  R.page({ title: '설정이 코드 밖에서 들어오는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
