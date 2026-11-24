/* V-1-1 Kotlin Multiplatform — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 소스셋 폴더, 타깃별 컴파일러, 산출물, expect 구멍과 actual 조각을 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, cross, check, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // k 번째 beat 에 i 번 요소가: 지난 beat 면 다 보이고, 지금 beat 면 s 초부터 자란다
  const ap = (k, i, u, s = 0.2, d = 0.6) => (k > i ? 1 : k === i ? R.spring(seg(u, s, s + d)) : 0);
  const gr = (k, i, u, s = 0.2, d = 0.9) => (k > i ? 1 : k === i ? E(u, s, s + d) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 소스셋 폴더: 탭 + 몸통
  function folder(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1, col = o.stroke || INK, fill = o.fill || PANEL;
    el('rect', { x, y, width: Math.min(w - 10, tw(name, 14.5) + 26), height: 18, rx: 5, fill, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    el('rect', { x, y: y + 12, width: w, height: h - 12, rx: 8, fill, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 12, y + 34, name, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op }); }
  // .kt 파일 아이콘
  function file(cx, cy, label, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s);
    el('path', { d: 'M-15,-20 H7 L15,-12 V20 H-15 Z', fill: PANEL, stroke: col || ACC, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M7,-20 V-12 H15', fill: 'none', stroke: col || ACC, 'stroke-width': 2 }, g);
    tx(0, 5, 'kt', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: col || ACC, class: 'mono' }, g);
    tx(0, 40, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }, g); }
  // 산출물 카드 (이름 + 타깃 함수)
  function artifact(cx, cy, name, fn, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s);
    el('rect', { x: -105, y: -30, width: 210, height: 60, rx: 9, fill: col === GOOD ? GOODBG : PANEL, stroke: col || INK, 'stroke-width': 2.2 }, g);
    tx(-90, -5, name, { 'font-size': 15, 'font-weight': 800, fill: col || INK }, g);
    tx(-90, 17, fn, { 'font-size': 13.5, class: 'mono', fill: MUT }, g); }
  // 빌드 램프: ok = true/false/null(아직)
  function lamp(cx, cy, name, ok, s) { if (s <= 0) return; const col = ok ? GOOD : ok === false ? BAD : OFF;
    card(cx, cy, 200, 40, { rx: 20, stroke: col, sw: 2.2, fill: ok ? GOODBG : ok === false ? BADBG : PANEL, s });
    el('circle', { cx: cx - 78, cy, r: 8, fill: col, opacity: clamp(s) });
    tx(cx - 60, cy + 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: clamp(s) }); }

  // ---------- 1. 타깃 선언 → 같은 소스가 타깃마다 컴파일된다 ----------
  const COMP = [{ name: 'Kotlin/JVM', y: 102 }, { name: 'Kotlin/Native', y: 300 }];
  const ART = [
    { name: 'Android AAR', fn: 'androidTarget()', y: 58, comp: 0, k: 1 },
    { name: 'JVM 서버 jar', fn: 'jvm()', y: 146, comp: 0, k: 3 },
    { name: 'iOS Framework', fn: 'iosArm64()', y: 256, comp: 1, k: 2 },
    { name: 'iOS Simulator', fn: 'iosSimulatorArm64()', y: 344, comp: 1, k: 2 },
  ];
  function s1(t, c) { const { k, u } = c;
    zone(24, 36, 318, 350, 'shared 모듈 (소스셋)', { fill: SOFT });
    const filled = k >= 4;
    folder(44, 66, 278, 170, 'commonMain', { stroke: filled ? ACC : MUT, dash: filled ? null : '6 5', fill: filled ? ACCBG : PANEL });
    if (!filled) sub(183, 170, '(아직 비어 있음)', 1, { 'font-size': 14 });
    else [['로직', 0], ['모델', 1], ['검증', 2]].forEach(([n, i]) => file(100 + i * 84, 150, n, ap(k, 4, u, 0.2 + i * 0.25)));
    // 플랫폼 소스셋
    const am = ap(k, 1, u, 0.1), im = ap(k, 2, u, 0.1);
    folder(44, 254, 132, 112, 'androidMain', { stroke: am > 0 ? INK : OFF, dash: am > 0 ? null : '6 5', op: am > 0 ? clamp(am) : 1 });
    folder(190, 254, 132, 112, 'iosMain', { stroke: im > 0 ? INK : OFF, dash: im > 0 ? null : '6 5', op: im > 0 ? clamp(im) : 1 });
    if (im > 0) sub(256, 330, 'arm64 · 시뮬레이터', clamp(im), { 'font-size': 13.5 });
    if (am > 0) sub(110, 330, 'Android 전용', clamp(am), { 'font-size': 13.5 });
    // 컴파일러와 산출물
    COMP.forEach((cp, ci) => { const s = ap(k, ci === 0 ? 1 : 2, u, 0.3);
      if (s > 0) { grow(342, 210, 438, cp.y, gr(k, ci === 0 ? 1 : 2, u, 0.2, 0.5), MUT, { plain: true }); card(520, cp.y, 156, 46, { rx: 8, text: cp.name, fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO, fill: INFOBG, s }); } });
    ART.forEach((a) => { const g = gr(k, a.k, u, 0.7, 0.7), s = ap(k, a.k, u, 1.3, 0.6);
      grow(598, COMP[a.comp].y, 712, a.y, g, MUT);
      artifact(818, a.y, a.name, a.fn, s, k >= 4 ? GOOD : INK); });
    if (k === 0) { note(560, 190, 'kotlin { } — 타깃 0개', fade(u, 0.3), { 'font-size': 17, 'font-weight': 800 });
      note(560, 222, '선언한 타깃 수만큼 같은 소스가', fade(u, 0.9), { fill: MUT });
      note(560, 246, '여러 번 컴파일된다', fade(u, 0.9), { fill: MUT }); }
    const nt = [0, 1, 3, 4, 4][Math.min(k, 4)], pn = [0, 0, 1, 3, 4][Math.min(k, 4)];
    if (k > 0) mono(452, 52, `타깃 ${Math.round(tween(pn, nt, u))}개`, { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 4) { // commonMain 의 코드가 네 산출물로 흘러간다
      ART.forEach((a, i) => dot([[322, 150], [342, 210], [438, COMP[a.comp].y], [598, COMP[a.comp].y], [712, a.y]], seg(u, 1.0 + i * 0.12, 2.2 + i * 0.12), ACC, 6));
      banner(520, 398, '소스 한 벌 → 산출물 4개', pop(u, 2.2)); } }

  // ---------- 2. expect 구멍을 actual 조각이 채운다 ----------
  const EXP = [{ d: 'expect fun currentTimeMillis(): Long', y: 74 }, { d: 'expect val platformName: String', y: 124 }];
  const ACT = { and: ['System.currentTimeMillis()', '"Android"'], ios: ['(NSDate().timeIntervalSince1970 * 1000).toLong()', '"iOS"'] };
  function s2(t, c) { const { k, u } = c;
    zone(24, 32, 912, 136, 'commonMain — 선언만', { fill: ACCBG, color: ACC });
    EXP.forEach((e, i) => { const s = ap(k, 0, u, 0.2 + i * 0.3); if (s <= 0) return;
      card(220, e.y, 360, 38, { rx: 7, text: e.d, fs: 14, mono: true, fw: 700, stroke: ACC, color: ACC, s });
      // 몸통 자리 (구멍)
      const full = k >= 2;
      el('rect', { x: 412, y: e.y - 15, width: 70, height: 30, rx: 6, fill: full ? GOODBG : PANEL, stroke: full ? GOOD : WARN, 'stroke-width': 2, 'stroke-dasharray': full ? null : '5 4', opacity: clamp(s) });
      tx(447, e.y + 5, full ? '채움' : '몸통?', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: full ? GOOD : WARN, opacity: clamp(s) }); });
    // greeting() — 플랫폼을 모르고 호출만
    const gs = ap(k, 1, u, 0.2);
    if (gs > 0) { card(718, 100, 380, 92, { rx: 9, stroke: INK, s: gs });
      mono(540, 86, 'fun greeting(): String =', { 'font-size': 14, 'font-weight': 700, opacity: clamp(gs) });
      mono(540, 112, '"Hello from $platformName', { 'font-size': 13.5, fill: ACC, opacity: clamp(gs) });
      mono(540, 132, '  at ${currentTimeMillis()}"', { 'font-size': 13.5, fill: ACC, opacity: clamp(gs) });
      if (k === 1) EXP.forEach((e, i) => dot([[528, 100], [490, e.y]], seg(u, 0.9 + i * 0.35, 1.5 + i * 0.35), ACC, 6)); }
    // 플랫폼 소스셋
    [['androidMain', 60, 'and', 2], ['iosMain', 500, 'ios', 3]].forEach(([nm, x, key, kk]) => {
      folder(x, 196, 400, 150, nm, { stroke: k >= kk ? INK : OFF, dash: k >= kk ? null : '6 5' });
      if (k < kk) { sub(x + 200, 290, 'actual 미구현', 1, { fill: WARN, 'font-weight': 700, 'font-size': 14.5 }); return; }
      ACT[key].forEach((body, i) => { const f = gr(k, kk, u, 0.3 + i * 0.4, 0.8), y0 = 262 + i * 42, ty = lerp(y0, y0, f);
        const head = i === 0 ? 'actual fun …Millis() =' : 'actual val platformName =';
        mono(x + 16, ty - 8, head, { 'font-size': 13.5, fill: MUT, opacity: f });
        mono(x + 16, ty + 12, body, { 'font-size': body.length > 30 ? 13.5 : 14.5, 'font-weight': 700, fill: GOOD, opacity: f });
        if (f > 0 && f < 1) { // 구멍으로 올라가는 조각
          card(lerp(x + 140, 447, E(f, 0, 1)), lerp(y0, EXP[i].y, E(f, 0, 1)), 74, 28, { rx: 6, fill: GOOD, stroke: 'none', text: 'actual', fs: 13.5, color: PANEL, fw: 700 }); } }); });
    lamp(260, 388, k >= 2 ? 'Android 빌드 통과' : 'Android 빌드 실패', k >= 2, k === 2 ? 1 : 1);
    lamp(700, 388, k >= 3 ? 'iOS 빌드 통과' : 'iOS 빌드 실패', k >= 3, 1);
    if (k === 3) banner(480, 180, '모든 타깃에 actual → 컴파일 통과', pop(u, 1.8)); }

  // ---------- 3. Repository 는 공유, 화면은 각자 ----------
  const RP = { x: 480, y: 222 }, DB = { x: 800, y: 330 }, API = { x: 160, y: 330 };
  function s3(t, c) { const { k, u } = c;
    // 경계선
    el('line', { x1: 24, y1: 132, x2: 936, y2: 132, stroke: k >= 3 ? WARN : GRID, 'stroke-width': 2, 'stroke-dasharray': '7 6' });
    tx(30, 124, '각 플랫폼 (화면)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    tx(30, 154, 'commonMain (규칙·데이터)', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    const rs = ap(k, 0, u, 0.2);
    card(RP.x, RP.y, 300, 92, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, s: rs });
    if (rs > 0) { mono(RP.x - 130, RP.y - 14, 'class UserRepository', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: clamp(rs) });
      mono(RP.x - 130, RP.y + 14, 'suspend fun getUser(id)', { 'font-size': 14, opacity: clamp(rs) }); }
    // 주입되는 의존성
    const di = gr(k, 0, u, 0.8, 0.8);
    card(API.x, API.y, 200, 56, { rx: 10, text: 'ApiClient\nKtor', fs: 14.5, stroke: INFO, color: INFO, s: ap(k, 0, u, 0.6) });
    R.dbIcon(DB.x, DB.y - 6, 'LocalDb · SQLDelight', { s: clamp(ap(k, 0, u, 0.6)) * 0.8 });
    grow(API.x + 100, API.y - 10, RP.x - 150, RP.y + 30, di, MUT, { plain: true });
    grow(DB.x - 40, DB.y - 34, RP.x + 150, RP.y + 30, di, MUT, { plain: true });
    if (k === 0) sub(480, 300, '생성자로 받는다 — 플랫폼별 구현을 밖에서 갈아 끼운다', fade(u, 1.5), { 'font-size': 14.5 });
    // 호출 흐름
    const caller = [RP.x, 140], toRepo = [RP.x, RP.y - 46];
    if (k === 1) { dot([caller, toRepo, [RP.x + 150, RP.y + 30], [DB.x - 40, DB.y - 34]], seg(u, 0.2, 1.1), ACC, 7);
      if (u > 1.1) { check(DB.x + 70, DB.y - 40, 12, pop(u, 1.1)); note(DB.x - 60, 270, 'db.find(id) → 있음', fade(u, 1.1), { fill: GOOD, 'font-size': 14.5 }); }
      dot([[DB.x - 40, DB.y - 34], [RP.x + 150, RP.y + 30], toRepo, caller], seg(u, 1.4, 2.4), GOOD, 7);
      if (u > 2.2) pill(RP.x, 112, '바로 반환 — 네트워크 안 감', GOOD, pop(u, 2.2), { fs: 13.5 }); }
    if (k === 2) { const st = [[1, 'db.find(id) → null', BAD, DB.x - 70, 270], [2, 'api.fetchUser(id)', INFO, API.x - 80, 280], [3, 'db.save(user)', ACC, DB.x - 70, 395], [4, 'return user', GOOD, RP.x - 50, 112]];
      dot([toRepo, [RP.x + 150, RP.y + 30], [DB.x - 40, DB.y - 34]], seg(u, 0.1, 0.6), ACC, 7);
      dot([[RP.x - 150, RP.y + 30], [API.x + 100, API.y - 10]], seg(u, 0.7, 1.2), INFO, 7);
      dot([[API.x + 100, API.y - 10], [RP.x - 150, RP.y + 30], [RP.x + 150, RP.y + 30], [DB.x - 40, DB.y - 34]], seg(u, 1.3, 1.9), ACC, 7);
      dot([[RP.x + 150, RP.y + 30], toRepo, caller], seg(u, 2.0, 2.5), GOOD, 7);
      st.forEach(([n, s, col, x, y], i) => { const op = fade(u, [0.5, 1.1, 1.8, 2.3][i]); if (op <= 0) return;
        el('circle', { cx: x - 14, cy: y - 5, r: 11, fill: col, opacity: op }); tx(x - 14, y, String(n), { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: op });
        mono(x + 2, y, s, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); }); }
    // 화면 (각자)
    if (k >= 3) { [['Android · Compose', 230], ['iOS · SwiftUI', 730]].forEach(([n, x], i) => { const s = ap(k, 3, u, 0.2 + i * 0.3);
        R.browser(x, 66, 200, 70, null, { s }); tx(x, 82, n, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s) });
        grow(x + (i ? -60 : 60), 102, RP.x + (i ? 60 : -60), RP.y - 46, gr(k, 3, u, 0.9, 0.7), ACC); });
      pill(480, 380, '규칙을 계산하면 공유 · 화면을 그리면 각자', WARN, pop(u, 1.8), { fs: 14 }); } }

  // ---------- 4. 공통 API 하나, 엔진만 플랫폼별 ----------
  const LIB = [['ktor-client-core', '2.3.12'], ['sqldelight runtime', '2.0.2'], ['coroutines-core', '1.8.1']];
  function s4(t, c) { const { k, u } = c;
    if (k === 3) return adopt(t, c);
    zone(24, 28, 912, 128, 'commonMain.dependencies', { fill: ACCBG, color: ACC });
    LIB.forEach(([n, v], i) => { const f = gr(k, 0, u, 0.2 + i * 0.35, 0.6), y = lerp(60, 100, f); if (f <= 0) return;
      card(170 + i * 300, y, 250, 50, { rx: 8, stroke: ACC, fill: PANEL, sw: 2, op: f });
      mono(170 + i * 300 - 112, y - 3, n, { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      mono(170 + i * 300 - 112, y + 16, v, { 'font-size': 13.5, fill: MUT }); });
    // 호출 코드는 하나
    if (k >= 1) mono(480, 196, 'client.get(url)   // 공통 코드', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    grow(480, 206, 480, 236, k >= 1 ? 1 : 0, MUT, { plain: true });
    el('line', { x1: 240, y1: 236, x2: 720, y2: 236, stroke: k >= 1 ? MUT : GRID, 'stroke-width': 2 });
    [['androidMain', 'ktor-client-okhttp', 'OkHttp', 240, 1, 'AndroidSqliteDriver'], ['iosMain', 'ktor-client-darwin', 'Darwin', 720, 2, 'NativeSqliteDriver']].forEach(([sset, art, eng, x, kk, drv]) => {
      grow(x, 236, x, 266, k >= kk ? 1 : 0, MUT, { plain: true });
      tx(x, 290, sset, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: MUT });
      // 엔진 소켓
      el('rect', { x: x - 110, y: 302, width: 220, height: 56, rx: 9, fill: PANEL, stroke: k >= kk ? INK : WARN, 'stroke-width': 2, 'stroke-dasharray': k >= kk ? null : '6 5' });
      if (k < kk) { tx(x, 336, '엔진 미지정', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
      const f = gr(k, kk, u, 0.2, 0.7), y = lerp(372, 330, f);
      card(x, y, 200, 44, { rx: 8, stroke: GOOD, fill: GOODBG, sw: 2 });
      tx(x, y - 2, eng + ' 엔진', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD });
      mono(x, y + 15, art, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      if (k === kk) dot([[480, 206], [480, 236], [x, 236], [x, 300]], seg(u, 1.0, 1.9), ACC, 7);
      if (k >= 2) pill(x, 392, 'SQLDelight: ' + drv, INFO, ap(k, 2, u, 1.6), { fs: 13.5, mono: true }); });
    if (k === 0) note(480, 200, '셋 다 멀티플랫폼 아티팩트 — 공통 코드에서 그대로 쓴다', fade(u, 1.6), { fill: MUT, 'text-anchor': 'middle' }); }
  // 4-k3 점진 도입: 두 앱에서 한 덩어리만 떼어 공유 모듈로
  function adopt(t, c) { const { u } = c;
    const rows = ['로그인 화면', '피드 화면', '결제 화면', '입력값 검증'];
    [['Android 앱', 150], ['iOS 앱', 810]].forEach(([n, x]) => { lbl(x, 52, n, 1, { 'font-size': 16 });
      rows.forEach((r, i) => { const mv = i === 3, f = mv ? E(u, 0.6, 1.8) : 0, cx = lerp(x, 480, f), cy = lerp(96 + i * 64, 240, f);
        if (mv && f >= 1) return;
        card(cx, cy, 200, 48, { rx: 8, text: r, fs: 14.5, stroke: mv ? ACC : GRID, color: mv ? ACC : INK, sw: mv ? 2.5 : 1.8 }); }); });
    const sh = pop(u, 1.8);
    card(480, 240, 230, 96, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, s: sh });
    if (sh > 0) { mono(480, 222, 'shared 모듈', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: clamp(sh) });
      tx(480, 252, '입력값 검증 (한 벌)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: clamp(sh) }); }
    pill(480, 120, 'Compose Multiplatform — 선택', MUT, pop(u, 2.3), { fs: 13.5 });
    note(300, 380, '나머지 화면은 그대로 둔다 · 새 기능 한 덩어리부터', fade(u, 2.1), { fill: MUT }); }

  // ---------- 5. 플랫폼 API 를 공통에 끌어오면 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 3) return checklist(t, c);
    folder(40, 30, 420, 170, 'commonMain', { stroke: k === 0 ? BAD : ACC, fill: k === 0 ? BADBG : ACCBG });
    folder(40, 230, 200, 150, 'androidMain', {});
    folder(260, 230, 200, 150, 'iosMain', { stroke: k === 2 ? BAD : INK, dash: k === 2 ? '6 5' : null });
    if (k === 0) { mono(60, 104, 'import android.os.Build', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
      mono(60, 132, 'val id = Build.MODEL', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) });
      // iOS 컴파일러가 이 파일을 읽다 멈춘다
      dot([[250, 160], [360, 300]], seg(u, 0.8, 1.5), INFO, 7);
      if (u > 1.5) { cross(360, 300, 18, pop(u, 1.5)); mono(290, 350, 'android 없음', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) }); }
      lamp(720, 150, '공통 코드 컴파일 실패', false, pop(u, 1.9));
      note(560, 230, 'iOS 쪽에는 android.os가 없다.', fade(u, 2.1), { fill: MUT });
      note(560, 256, '공통 코드는 모든 타깃에서 성립해야 한다.', fade(u, 2.3), { fill: MUT }); return; }
    // k1: 플랫폼 의존을 경계 밖으로
    mono(60, 104, 'expect fun deviceModel(): String', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 1.4) : 1 });
    mono(60, 132, 'val id = deviceModel()', { 'font-size': 15, fill: INK, opacity: k === 1 ? fade(u, 1.7) : 1 });
    if (k === 1) { const f = E(u, 0.2, 1.3); card(lerp(240, 140, f), lerp(118, 320, f), 190, 32, { rx: 6, text: 'Build.MODEL', fs: 14.5, mono: true, fill: WARNBG, stroke: WARN, color: WARN });
      note(560, 160, '플랫폼에만 있는 것은', fade(u, 1.6)); note(560, 186, 'expect 선언 뒤로 숨긴다', fade(u, 1.9), { fill: ACC }); return; }
    // k2: androidMain 만 구현
    mono(56, 296, 'actual fun', { 'font-size': 14, fill: MUT }); mono(56, 320, 'deviceModel() =', { 'font-size': 14, fill: MUT });
    mono(56, 348, 'Build.MODEL', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    tx(360, 312, 'actual 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
    lamp(720, 120, 'Android 빌드 통과', true, pop(u, 0.9));
    lamp(720, 180, 'iOS 빌드 실패', false, pop(u, 1.3));
    note(560, 250, '새 타깃을 붙이면 actual이 하나 더 필요하다.', fade(u, 1.8), { fill: MUT });
    note(560, 276, '빠뜨리면 컴파일러가 바로 알려 준다.', fade(u, 2.1), { fill: MUT }); }
  function checklist(t, c) { const { u } = c;
    lbl(480, 52, '공유 경계 체크리스트', 1, { 'font-size': 18 });
    ['로직만 공유, UI는 네이티브로', '플랫폼 API는 expect/actual로 격리', '새 기능 한 덩어리부터 점진 도입', '새 타깃을 붙이면 actual 누락 확인'].forEach((s, i) => {
      const y = 112 + i * 70, sc = pop(u, 0.2 + i * 0.4);
      card(480, y, 520, 54, { rx: 27, stroke: GOOD, sw: 2, s: sc }); check(258, y, 11, sc);
      tx(286, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); }); }

  const quiz = [
    { q: 'iosArm64()와 iosSimulatorArm64()를 따로 선언하는 까닭은 무엇인가?',
      o: ['iOS는 소스셋이 두 개 있어야 해서', '실기기와 시뮬레이터가 서로 다른 타깃이라 산출물을 따로 만들어야 해서', '시뮬레이터에서는 commonMain을 못 써서'], a: 1,
      why: '실기기와 시뮬레이터는 타깃이 달라 각각 컴파일된다. 소스는 iosMain 하나로 묶여 그대로 쓰인다.' },
    { q: 'commonMain에 expect fun만 있고 iosMain에 actual이 없으면 어떻게 되는가?',
      o: ['실행할 때 iOS에서만 예외가 난다', 'Android 구현이 iOS에도 그대로 쓰인다', 'iOS 타깃이 컴파일되지 않는다'], a: 2,
      why: '컴파일러가 타깃마다 actual이 있는지 검사한다. 하나라도 비면 그 타깃은 빌드되지 않아 누락이 바로 드러난다.' },
    { q: '공유 모듈(commonMain)에 두기 가장 알맞은 코드는 무엇인가?',
      o: ['캐시를 먼저 보고 없으면 네트워크로 가는 getUser 규칙', '권한 팝업을 띄우는 화면 코드', 'SwiftUI 화면 전환'], a: 0,
      why: '캐시 우선 규칙은 플랫폼과 무관한 계산이다. 화면과 권한 팝업은 플랫폼마다 관례가 달라 각자 남긴다.' },
    { q: 'Ktor를 commonMain에 넣은 뒤 플랫폼마다 따로 넣는 것은 무엇인가?',
      o: ['client.get을 부르는 호출 코드', 'HTTP 엔진(OkHttp, Darwin)', '@Serializable 모델 클래스'], a: 1,
      why: '호출 코드는 공통에 한 벌이고, 실제 전송을 맡는 엔진만 androidMain은 OkHttp, iosMain은 Darwin으로 넣는다.' },
    { q: 'commonMain에서 android.os.Build.MODEL을 바로 쓰면 어떻게 되는가?',
      o: ['Android에서만 동작하고 iOS는 빈 값을 준다', '런타임에 iOS 앱이 죽는다', 'iOS 쪽에 그 API가 없어 공통 코드가 컴파일되지 않는다'], a: 2,
      why: '공통 코드는 모든 타깃에서 성립해야 한다. 그래서 expect fun deviceModel()로 감싸고 androidMain에서만 Build.MODEL을 쓴다.' },
  ];

  const summary = [
    'KMP는 commonMain 코드 한 벌을 Android, iOS, JVM 타깃마다 따로 컴파일한다.',
    '플랫폼마다 다른 API는 expect로 선언만 하고 각 소스셋이 actual로 채운다.',
    'actual이 하나라도 빠지면 그 타깃은 컴파일되지 않아 누락이 바로 보인다.',
    '규칙과 데이터 계층은 공유하고 화면은 네이티브로 두며 한 기능씩 옮긴다.',
  ];
  const review = [
    { q: '공통 코드를 고친 뒤 iOS 빌드만 Unresolved reference로 깨졌다. 먼저 찾아볼 것은?',
      o: ['androidTarget() 선언 순서', 'commonMain에 android.os처럼 한 플랫폼에만 있는 API를 쓴 줄', 'Ktor 버전 숫자'], a: 1,
      why: '공통 코드에 한쪽에만 있는 API가 들어오면 다른 타깃은 그 이름을 찾지 못한다. expect로 감싸 actual을 플랫폼 소스셋에 둔다.' },
    { q: 'Android 앱과 iOS 앱의 캐시 동작이 서로 달라졌다. 구조를 어떻게 바꾸는 게 맞나?',
      o: ['캐시 우선 규칙을 commonMain의 UserRepository 한 곳으로 옮긴다', '두 앱의 화면 코드를 하나로 합친다', 'iOS 쪽 캐시를 지운다'], a: 0,
      why: '같은 규칙을 양쪽에 따로 짜면 언젠가 어긋난다. 규칙을 공유 모듈에 한 벌만 두면 두 앱이 같은 동작을 한다.' },
    { q: '기존 앱에 KMP를 처음 들이려 한다. 위험이 가장 낮은 시작은?',
      o: ['앱 전체 UI를 Compose Multiplatform으로 다시 짠다', '모든 플랫폼 코드를 한 번에 expect/actual로 옮긴다', '입력값 검증 같은 로직 한 덩어리만 공유 모듈로 떼어 낸다'], a: 2,
      why: '한 덩어리만 옮기면 기존 화면은 그대로라 되돌리기도 쉽다. UI 공유는 선택이고 나중 일이다.' },
  ];

  R.page({ title: '소스셋과 타깃', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
