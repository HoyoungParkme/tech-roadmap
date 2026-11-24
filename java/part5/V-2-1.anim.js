/* V-2-1 Maven·Gradle 빌드 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 충돌 규칙은 Maven 문서(같은 깊이면 먼저 선언한 쪽)와 Gradle 문서(가장 높은 버전)를 따른다.
 * library-X·Y, guava 30.0·32.0 은 설명용 예시 좌표다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone, cross, check, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // jar 조각
  const jar = (x, y, s, o) => card(x, y, (o && o.w) || tw(s, 13.5) + 26, 30, { rx: 6, text: s, fs: 13.5, mono: true, stroke: (o && o.stroke) || WARN, fill: (o && o.fill) || WARNBG, color: INK, s: o && o.s, op: o && o.op });
  // 폴더
  function folder(x, y, w, h, name, o) { o = o || {};
    el('path', { d: `M${x},${y + 14} V${y + h} H${x + w} V${y + 14} H${x + 70} L${x + 58},${y} H${x + 4} Q${x},${y} ${x},${y + 4} Z`, fill: o.fill || SOFT, stroke: o.stroke || MUT, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 12, y + 34, name, { 'font-size': 14.5, 'font-weight': 800, fill: o.stroke || INK, opacity: o.op ?? 1 }); }
  // 화살표 끝 맞춘 노드 연결
  const link = (a, b, u, col, o) => grow(a[0], a[1], b[0], b[1], u, col || MUT, o);

  // =========================================================
  // 1. 손으로 빌드 — lib/ · -cp · 수동 순서
  // =========================================================
  const JARS = ['jackson-databind-2.17.1.jar', 'jackson-core-2.17.1.jar', 'jackson-annotations-2.17.1.jar'];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(110, 70, 130, 44, { rx: 8, text: 'App.java', fs: 15, mono: true, fw: 800, s: pop(u, 0.1) });
      const D = [330, 70], Cc = [330, 150], A = [330, 230];
      card(D[0] + 70, D[1], 200, 40, { rx: 8, text: 'jackson-databind', fs: 14, mono: true, stroke: ACC, s: pop(u, 0.4) }); link([176, 70], [D[0] - 34, 70], seg(u, 0.3, 0.6), ACC);
      card(Cc[0] + 70, Cc[1], 200, 40, { rx: 8, text: 'jackson-core', fs: 14, mono: true, s: pop(u, 0.8), dash: '5 4' });
      card(A[0] + 70, A[1], 200, 40, { rx: 8, text: 'jackson-annotations', fs: 14, mono: true, s: pop(u, 1.0), dash: '5 4' });
      el('path', { d: `M300,90 V150 H328 M300,150 V230 H328`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: fade(u, 0.8) });
      tx(400, 280, '점선 = 선언하지 않았는데 필요한 전이 의존성', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) });
      folder(640, 120, 290, 220, 'lib/', { op: fade(u, 1.2) });
      JARS.forEach((j, i) => { const v = seg(u, 1.5 + i * 0.3, 2.2 + i * 0.3); if (v >= 1) jar(785, 186 + i * 44, j, { w: 268 }); else fly(500, 70 + i * 80, 785, 186 + i * 44, v, j, { fill: WARN, mono: true }); });
      return; }
    if (k <= 2) { folder(640, 30, 290, 150, 'lib/', {}); JARS.forEach((j, i) => jar(785, 82 + i * 32, j, { w: 268 }));
      // classpath 띠 : 칸이 하나씩 채워진다
      const rows = k === 1 ? [['javac -cp', 90, 0]] : [['javac -cp', 90, 3], ['java  -cp', 90, 0]];
      const draw = (y, label, n, out) => { mono(40, y + 5, label, { 'font-size': 15, 'font-weight': 800 });
        const parts = (out ? ['out'] : []).concat(['lib/…databind…jar', 'lib/…core…jar', 'lib/…annotations…jar']);
        let x = 140; parts.forEach((p, i) => { const w = tw(p, 13.5) + 18, s = n >= 3 ? 1 : pop(u, 0.3 + i * 0.45);
          card(x + w / 2, y, w, 32, { rx: 4, text: p, fs: 13.5, mono: true, stroke: p === 'out' ? INFO : WARN, fill: p === 'out' ? INFOBG : WARNBG, s }); x += w + 4;
          if (i < parts.length - 1) mono(x - 2, y + 5, ':', { 'font-size': 15, 'font-weight': 800, opacity: s }); x += 8; }); };
      if (k === 1) { draw(250, 'javac -cp', 0, false); tx(40, 320, '컴파일할 때마다 jar 경로를 한 줄로 이어 붙인다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      else { draw(230, 'javac -cp', 3, false); draw(300, 'java  -cp', 0, true); tx(40, 370, '실행할 때 같은 목록을 또 적고, out 까지 붙인다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 3) { const lines = ['$ javac -cp ... test/AppTest.java', '$ java  -cp ... org.junit...', '$ jar cfe app.jar App -C out .'];
      terminal(60, 40, 560, 160, lines, clamp(u * 1.4, 0, 3), { title: 'terminal', lh: 26 });
      ['컴파일', '테스트', '패키징'].forEach((s, i) => { const x = 160 + i * 220, sc = pop(u, 0.5 + i * 0.7);
        card(x, 290, 170, 56, { rx: 28, text: (i + 1) + '. ' + s, fs: 16, fw: 800, stroke: WARN, s: sc }); if (i) grow(x - 135, 290, x - 88, 290, seg(u, 0.4 + i * 0.7, 0.7 + i * 0.7), MUT); });
      tx(480, 370, '순서를 매번 사람이 기억한다 · 빠뜨려도 아무도 안 알려 준다', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    // k === 4: 파일이 수백 개가 되면
    const n = Math.round(lerp(3, 60, E(u, 0.1, 1.4)));
    for (let i = 0; i < n; i++) { const x = 60 + (i % 15) * 26, y = 60 + Math.floor(i / 15) * 30;
      el('rect', { x, y, width: 20, height: 24, rx: 3, fill: i < 3 ? WARN : WARNBG, stroke: WARN, 'stroke-width': 1.2 }); }
    tx(60, 200, 'jar 가 수백 개로 늘면 -cp 는 사람이 관리할 수 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    [['의존성 자동 (전이 포함)', 0], ['표준 라이프사이클', 1], ['누가 어디서 해도 같은 결과', 2]].forEach(([s, i]) => { const y = 90 + i * 70, sc = pop(u, 1.4 + i * 0.35);
      card(720, y, 380, 54, { rx: 27, stroke: GOOD, sw: 2.2, s: sc }); if (sc > 0.6) { check(560, y, 10, 1); tx(584, y + 6, s, { 'font-size': 16, 'font-weight': 700 }); } });
    tx(720, 320, 'Maven · Gradle 이 맡는 일', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.4) }); }

  // =========================================================
  // 2. Maven — 좌표 · scope · 라이프사이클
  // =========================================================
  function coord(y, parts, s, o) { o = o || {}; let x = o.x ?? 480 - parts.reduce((a, [p]) => a + tw(p, 16) + 30, 0) / 2;
    parts.forEach(([p, name, col], i) => { const w = tw(p, 16) + 24, sc = s(i);
      card(x + w / 2, y, w, 44, { rx: 6, text: p, fs: 16, mono: true, fw: 800, stroke: col, color: col, fill: PANEL, s: sc });
      if (name) tx(x + w / 2, y + 40, name, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: sc });
      x += w; if (i < parts.length - 1) { mono(x + 3, y + 6, ':', { 'font-size': 18, 'font-weight': 800, opacity: sc }); x += 14; } }); }
  const PH = ['validate', 'compile', 'test', 'package', 'install'];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { coord(150, [['com.example', 'groupId', INFO], ['my-app', 'artifactId', ACC], ['1.0.0', 'version', GOOD]], (i) => pop(u, 0.3 + i * 0.5));
      tx(480, 60, 'pom.xml 의 세 값이 이 프로젝트 자신을 가리킨다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      pill(480, 280, 'packaging = jar', MUT, pop(u, 2.0), { mono: true, fs: 15 }); return; }
    if (k === 1) { card(250, 160, 330, 56, { rx: 9, text: 'maven.compiler.release = 21', fs: 16, mono: true, fw: 800, stroke: ACC, s: pop(u, 0.2) });
      grow(420, 160, 560, 160, seg(u, 0.8, 1.4), ACC);
      card(700, 160, 240, 56, { rx: 9, text: 'javac --release 21', fs: 16, mono: true, s: pop(u, 1.4) });
      tx(480, 270, '누가 어떤 JDK 로 빌드해도 Java 21 기준 바이트코드', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { coord(60, [['com.fasterxml.jackson.core', null, INFO], ['jackson-databind', null, ACC], ['2.17.1', null, GOOD]], () => pop(u, 0.1));
      card(200, 220, 230, 90, { rx: 14, stroke: INFO, sw: 2.2, fill: INFOBG, s: pop(u, 0.5) }); tx(200, 226, 'Maven Central', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) });
      folder(560, 160, 370, 200, '~/.m2/repository', { op: fade(u, 0.8) });
      ['jackson-databind-2.17.1.jar', 'jackson-core-2.17.1.jar', 'jackson-annotations-2.17.1.jar'].forEach((j, i) => { const v = seg(u, 1.0 + i * 0.4, 1.7 + i * 0.4), y = 226 + i * 40;
        if (v >= 1) { jar(745, y, j, { w: 290 }); } else fly(310, 220, 745, y, v, j, { fill: WARN, mono: true }); });
      tx(480, 400, 'core · annotations 는 적지 않았는데 따라 내려온다 (전이)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.4) }); return; }
    if (k === 3) { zone(40, 40, 420, 300, '테스트 클래스패스', { fill: INFOBG, color: INFO }); zone(500, 40, 420, 300, '최종 jar (my-app-1.0.0.jar)', { fill: SOFT });
      jar(250, 120, 'jackson-databind 2.17.1', { s: pop(u, 0.2), w: 300 }); jar(710, 120, 'jackson-databind 2.17.1', { s: pop(u, 0.5), w: 300 });
      jar(250, 190, 'junit-jupiter 5.10.2 · test', { s: pop(u, 0.9), w: 300, stroke: INFO, fill: PANEL });
      const v = seg(u, 1.4, 2.0); jar(lerp(250, 710, E(v, 0, 1)), 190, 'junit-jupiter 5.10.2 · test', { w: 300, stroke: v > 0 ? BAD : INFO, fill: PANEL, op: v > 0.25 && v < 1 ? 0.7 : v >= 1 ? 0.35 : 0 });
      if (v >= 1) cross(710, 190, 14, pop(u, 2.0));
      tx(480, 380, 'scope=test 는 테스트에서만 보이고 jar 에는 들어가지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k === 4: mvn package
    pill(480, 50, '$ mvn package', INK, pop(u, 0.1), { mono: true, fs: 16 });
    PH.forEach((p, i) => { const x = 110 + i * 185, run = i <= 3 && u > 0.5 + i * 0.4, s = 1;
      card(x, 170, 160, 60, { rx: 10, text: p, fs: 16, mono: true, fw: 800, stroke: i === 4 ? GRID : run ? GOOD : INK, color: i === 4 ? MUT : run ? GOOD : INK, fill: run ? GOODBG : PANEL, s });
      if (i) grow(x - 102, 170, x - 82, 170, 1, MUT); });
    dot([[30, 170], [665, 170]], seg(u, 0.4, 2.0), GOOD, 8);
    sub(850, 222, '부르지 않음', 1, { 'font-size': 14 });
    jar(665, 280, 'target/my-app-1.0.0.jar', { s: pop(u, 2.1), stroke: GOOD, fill: GOODBG, w: 250 });
    tx(480, 360, 'package 를 부르면 그 앞 단계가 순서대로 먼저 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); }

  // =========================================================
  // 3. Gradle — 태스크 DAG 와 UP-TO-DATE
  // =========================================================
  const N = { compileJava: [140, 100], processResources: [140, 230], classes: [390, 165], test: [620, 100], jar: [620, 230], build: [840, 165] };
  const E_ = [['compileJava', 'classes'], ['processResources', 'classes'], ['classes', 'test'], ['classes', 'jar'], ['test', 'build'], ['jar', 'build']];
  function dag(show, st, u) { E_.forEach(([a, b]) => { const s = Math.min(show(a), show(b)); if (s <= 0) return;
      const [x1, y1] = N[a], [x2, y2] = N[b]; grow(x1 + 95, y1, x2 - 92, y2, s, MUT, { sw: 2 }); });
    Object.keys(N).forEach((n) => { const s = show(n); if (s <= 0) return; const [x, y] = N[n], state = st(n);
      card(x, y, 184, 48, { rx: 10, text: n, fs: 15, mono: true, fw: 800, s, stroke: state === 'up' ? GRID : state === 'hot' ? ACC : INK, color: state === 'up' ? MUT : INK, fill: state === 'up' ? SOFT : PANEL });
      if (state === 'up') mono(x, y + 40, 'UP-TO-DATE', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 }); }); }
  function s3(t, c) { const { k, u } = c;
    const base = ['compileJava', 'processResources', 'classes'];
    const show = (n) => base.includes(n) ? (k === 0 ? pop(u, 0.4 + base.indexOf(n) * 0.4) : 1) : (n === 'test' || n === 'jar') ? (k >= 4 ? (k === 4 ? pop(u, n === 'test' ? 0.3 : 1.2) : 1) : 0) : n === 'build' ? (k === 5 ? pop(u, 0.2) : 0) : 0;
    const st = (n) => k === 5 && u > 1.2 ? 'up' : (k === 1 && n === 'compileJava') || (k === 4 && n === 'test') ? 'hot' : '';
    if (k === 3) { // pom 과 gradle 줄 수 비교
      tx(60, 60, '의존성 두 개를 적는 데 드는 줄', { 'font-size': 16, 'font-weight': 800 });
      tx(240, 126, 'pom.xml', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' }); hbar(260, 112, 420, 11 * seg(u, 0.3, 1.2), 11, { col: WARN, text: '<dependency> 블록 11줄' });
      tx(240, 186, 'build.gradle', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' }); hbar(260, 172, 420, 2 * seg(u, 0.9, 1.6), 11, { col: GOOD, text: '2줄' });
      [["implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.1'", INK], ["testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'", INFO]].forEach(([s, col], i) => mono(60, 270 + i * 34, s, { 'font-size': 14.5, fill: col, opacity: fade(u, 1.6 + i * 0.3) }));
      sub(480, 380, '좌표 체계는 Maven 과 같다 · group:artifact:version 한 줄', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    dag(show, st, u);
    if (k === 0) { pill(480, 40, "plugins { id 'java' }", ACC, pop(u, 0.1), { mono: true, fs: 15 }); sub(390, 330, '한 줄로 표준 태스크가 등록된다 · src/main/java 관습', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }
    if (k === 1) { pill(140, 40, 'toolchain · JDK 21', ACC, pop(u, 0.3), { fs: 15 }); grow(140, 56, 140, 76, seg(u, 0.6, 1.0), ACC);
      sub(390, 330, '로컬 JDK 가 달라도 21 로 컴파일한다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); }
    if (k === 2) { card(840, 320, 220, 60, { rx: 12, text: 'mavenCentral()', fs: 16, mono: true, fw: 800, stroke: INFO, fill: INFOBG, s: pop(u, 0.3) });
      dot([[840, 290], [140, 128]], seg(u, 0.9, 1.9), INFO, 7); sub(390, 330, 'Maven 과 같은 중앙 저장소에서 받는다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); }
    if (k === 4) { pill(620, 40, 'useJUnitPlatform()', ACC, pop(u, 0.6), { mono: true, fs: 14.5 }); grow(620, 56, 620, 74, seg(u, 0.8, 1.1), ACC);
      sub(390, 330, 'tasks.named("test") 로 등록된 태스크를 고쳐 쓴다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }
    if (k === 5) { pill(480, 330, u < 1.2 ? '1회차 gradle build · 모두 실행' : '2회차 · 입력이 그대로면 건너뛴다', u < 1.2 ? INK : GOOD, 1, { fs: 15 });
      if (u < 1.2) dot([[48, 100], [930, 165]], seg(u, 0.1, 1.1), ACC, 8); } }

  // =========================================================
  // 4. 의존성 트리 — 충돌과 고정
  // =========================================================
  const T = { root: [110, 70], X: [250, 170], Y: [250, 290], gX: [470, 170], gY: [470, 290] };
  function tree(k, u, o) { o = o || {};
    card(T.root[0], T.root[1], 140, 44, { rx: 8, text: 'my-app', fs: 15, mono: true, fw: 800, s: o.s0 ?? 1 });
    const sx = o.sx ?? 1, sy = o.sy ?? 1;
    if (sx > 0) { el('path', { d: `M60,92 V170 H${T.X[0] - 74}`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: sx });
      card(T.X[0], T.X[1], 140, 42, { rx: 8, text: 'library-X 1.0', fs: 14, mono: true, s: sx });
      grow(T.X[0] + 70, 170, T.gX[0] - 78, 170, sx, MUT);
      card(T.gX[0], T.gX[1], 150, 42, { rx: 8, text: 'guava ' + (o.vX || '30.0'), fs: 14.5, mono: true, fw: 800, stroke: o.cX || WARN, fill: o.fX || PANEL, s: sx }); }
    if (sy > 0) { el('path', { d: `M60,170 V290 H${T.Y[0] - 74}`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: sy });
      card(T.Y[0], T.Y[1], 140, 42, { rx: 8, text: 'library-Y 2.0', fs: 14, mono: true, s: sy });
      grow(T.Y[0] + 70, 290, T.gY[0] - 78, 290, sy, MUT);
      card(T.gY[0], T.gY[1], 150, 42, { rx: 8, text: 'guava ' + (o.vY || '32.0'), fs: 14.5, mono: true, fw: 800, stroke: o.cY || WARN, fill: o.fY || PANEL, s: sy }); }
    tx(470, 128, '깊이 2', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: sx }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 6) { [['dependency:tree 로 본다', INFO], ['BOM · constraints 로 고정', ACC], ['트리로 다시 확인', GOOD]].forEach(([s, col], i) => { const x = 180 + i * 300, sc = pop(u, 0.2 + i * 0.4);
        card(x, 170, 250, 60, { rx: 30, text: s, fs: 15.5, fw: 800, stroke: col, color: col, s: sc });
        if (i) grow(x - 300 + 127, 170, x - 127, 170, seg(u, 0.4 + i * 0.4, 0.7 + i * 0.4), MUT); });
      if (u > 1.4) el('path', { d: 'M780,202 V262 H180 V202', fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', 'marker-end': 'url(#ra-ah)', opacity: fade(u, 1.4) });
      sub(480, 286, '의존성을 바꿀 때마다 다시', fade(u, 1.6), { 'font-size': 14.5 });
      tx(480, 370, '"알아서 되겠지" 대신 트리로 확인하고 버전을 못박는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    const o = { s0: k === 0 ? pop(u, 0.2) : 1, sx: k === 0 ? 0 : k === 1 ? seg(u, 0.3, 1.2) : 1, sy: k <= 1 ? 0 : k === 2 ? seg(u, 0.3, 1.2) : 1 };
    if (k >= 4) { o.vX = '32.0'; o.vY = '32.0'; o.cX = o.cY = GOOD; o.fX = o.fY = GOODBG; }
    if (k === 4 && u < 1.2) { o.vX = '30.0'; o.cX = WARN; o.fX = PANEL; }
    tree(k, u, o);
    if (k === 0) { pill(480, 70, '$ mvn dependency:tree -Dverbose', INK, pop(u, 0.5), { mono: true, fs: 14.5 }); sub(480, 230, '어떤 버전이 실제로 뽑혔는지는 트리만 보여 준다', fade(u, 1.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { tx(470, 216, '선언한 적 없는 전이 의존성', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { const s = fade(u, 1.4); el('path', { d: 'M560,182 l14,22 l-14,22 l14,22 l-14,22 l14,20', fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: s });
      tx(600, 236, '같은 guava 의 두 버전 · 클래스패스엔 하나만', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: s }); return; }
    if (k === 3) { // 두 도구의 답
      [[680, 'Maven', '같은 깊이 → 먼저 선언한 X', '30.0', 0.3], [860, 'Gradle', '가장 높은 버전', '32.0', 1.2]].forEach(([x, n, r, v, at], i) => { const s = pop(u, at);
        card(x, 230, 166, 150, { rx: 12, stroke: i ? INFO : ACC, sw: 2.4, s }); if (s < 0.6) return;
        tx(x, 184, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: i ? INFO : ACC });
        tx(x, 214, r.split(' → ')[0], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); if (r.includes(' → ')) tx(x, 234, r.split(' → ')[1], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
        mono(x, 280, 'guava ' + v, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: i ? INFO : ACC }); });
      tx(480, 395, 'X 가 32.0 의 메서드를 부르면 런타임 NoSuchMethodError 위험', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { card(760, 120, 290, 92, { rx: 12, stroke: ACC, sw: 2.4, fill: ACCBG, s: pop(u, 0.2) });
      if (u > 0.5) { tx(760, 106, 'BOM import (pom.xml)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC }); mono(760, 134, 'guava → 32.0', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }); }
      grow(615, 140, 548, 165, seg(u, 0.8, 1.2), ACC); grow(640, 166, 548, 282, seg(u, 0.9, 1.3), ACC);
      tx(760, 360, '버전 결정권이 한곳으로 모인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k === 5 constraints
    const lines = ['dependencies {', '  constraints {', "    implementation('com.google.guava:guava:32.0')", '  }', '}'];
    R.snippet(526, 90, lines.slice(0, Math.ceil(clamp(u * 2.2) * 5)), { fs: 13.5, w: 420 });
    tx(760, 330, 'Gradle 은 constraints 로 명시해 못박는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }

  // =========================================================
  // 5. 래퍼 · 멀티모듈 — 재현 가능한 빌드
  // =========================================================
  const WF = ['gradlew', 'gradlew.bat', 'gradle/wrapper/gradle-wrapper.jar', 'gradle/wrapper/gradle-wrapper.properties'];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { pill(480, 44, '$ gradle wrapper --gradle-version 8.7', INK, pop(u, 0.1), { mono: true, fs: 15 });
      folder(150, 90, 660, 250, 'my-app/', {});
      WF.forEach((f, i) => { const s = pop(u, 0.5 + i * 0.35), y = 170 + i * 42; jar(380, y, f, { s, w: 410, stroke: INK, fill: PANEL }); if (s > 0.8) { check(620, y, 9, pop(u, 1.0 + i * 0.35)); tx(640, y + 5, 'git 에 커밋', { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); } });
      return; }
    if (k === 1) { const ln = 'distributionUrl=.../gradle-8.7-bin.zip'; card(480, 150, 560, 60, { rx: 10, stroke: ACC, sw: 2.4, s: pop(u, 0.2) });
      mono(480, 156, ln.slice(0, Math.round(ln.length * seg(u, 0.4, 1.4))), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      pill(640, 222, '8.7', ACC, pop(u, 1.6), { mono: true, fs: 16 });
      tx(480, 300, 'gradle-wrapper.properties 한 줄이 빌드 도구 버전을 고정한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k <= 3) { const who = [['개발자 A', '로컬 8.5'], ['개발자 B', '로컬 7.6'], ['CI 서버', 'Gradle 없음']];
      who.forEach(([n, l], i) => { const x = 170 + i * 310; R.person(x - 60, 80, null, {}); tx(x - 20, 70, n, { 'font-size': 15, 'font-weight': 800 }); tx(x - 20, 92, l, { 'font-size': 13.5, fill: MUT });
        const cmd = k === 3 ? './mvnw package' : './gradlew build'; pill(x, 160, cmd, INK, k === 2 ? pop(u, 0.2 + i * 0.2) : 1, { mono: true, fs: 14 });
        const v = k === 2 ? seg(u, 0.8 + i * 0.2, 1.6 + i * 0.2) : 1; dot([[x, 180], [x, 240]], k === 2 && v < 1 ? v : 0, ACC, 6);
        if (v >= 1) card(x, 260, 190, 44, { rx: 8, text: k === 3 ? '고정된 Maven 받아 실행' : 'Gradle 8.7 받아서 실행', fs: 13.5, stroke: ACC, fill: ACCBG });
        if (k === 2 && u > 2.0 + i * 0.1) check(x, 330, 12, 1); });
      if (k === 2) tx(480, 390, '셋 다 8.7 로 같은 결과 · 로컬 설치 버전은 상관없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) });
      if (k === 3) { tx(480, 340, 'Maven 도 같은 생각 · .mvn/wrapper/maven-wrapper.properties 에 버전을 적는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) }); }
      return; }
    if (k === 4) { card(480, 60, 300, 50, { rx: 10, text: "include 'common', 'service', 'api'", fs: 14.5, mono: true, stroke: INFO, s: pop(u, 0.1) });
      [[':api', 180], [':service', 480], [':common', 780]].forEach(([n, x], i) => { const s = pop(u, 0.5 + i * 0.4);
        card(x, 220, 200, 70, { rx: 12, text: n, fs: 18, mono: true, fw: 800, stroke: i === 2 ? GOOD : INK, s });
        if (i) grow(x - 300 + 102, 220, x - 102, 220, seg(u, 0.8 + i * 0.4, 1.2 + i * 0.4), MUT, { sw: 2.6 }); });
      ['진입점', '비즈니스 로직', '공용 유틸'].forEach((s, i) => sub(180 + i * 300, 280, s, fade(u, 1.8), { 'font-size': 14.5 }));
      tx(480, 360, '루트가 공통 버전·플러그인을 관리하고, 의존은 한 방향으로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k === 5 재현성 3요소
    [['의존성 버전', 'BOM · lock'], ['JDK 버전', 'toolchain'], ['빌드 도구 버전', 'wrapper']].forEach(([a, b], i) => { const x = 200 + i * 280, h = 200 * E(u, 0.2 + i * 0.4, 1.0 + i * 0.4);
      el('rect', { x: x - 100, y: 320 - h, width: 200, height: h, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.2 });
      if (h > 120) { tx(x, 320 - h + 40, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 }); mono(x, 320 - h + 70, b, { 'text-anchor': 'middle', 'font-size': 15, fill: GOOD, 'font-weight': 700 }); } });
    el('rect', { x: 80, y: 320, width: 800, height: 14, rx: 4, fill: INK });
    tx(480, 380, '셋 다 커밋하면 "내 PC 에선 됨" 이 사라진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'Jackson 하나를 손으로 쓰려고 lib/에 넣어야 했던 jar는 무엇인가?',
      o: ['databind 하나면 된다', 'databind에 core와 annotations까지 세 개', 'JDK에 들어 있어 필요 없다'], a: 1,
      why: 'jackson-databind는 jackson-core와 jackson-annotations에 의존한다. 이런 전이 의존성을 손으로 추적해야 했다.' },
    { q: 'mvn package를 부르면 무엇이 일어나는가?',
      o: ['package 단계만 실행된다', 'validate, compile, test가 먼저 돌고 jar가 만들어진다', 'install까지 자동으로 된다'], a: 1,
      why: 'Maven 라이프사이클은 앞 단계를 순서대로 먼저 실행한다. install은 package 뒤라 부르지 않는다.' },
    { q: '두 번째 gradle build가 빨리 끝나는 까닭은 무엇인가?',
      o: ['입력이 바뀌지 않은 태스크를 UP-TO-DATE로 건너뛰어서', '테스트를 생략해서', '컴파일러를 바꿔서'], a: 0,
      why: 'Gradle은 태스크마다 입력과 출력을 기억한다. 바뀐 것이 없으면 다시 실행하지 않는다.' },
    { q: 'X와 Y가 같은 깊이에서 guava 30.0과 32.0을 끌어온다. X를 먼저 선언했다면 Maven이 고르는 것은 무엇인가?',
      o: ['32.0, 가장 높은 버전이니까', '둘 다 클래스패스에 올린다', '30.0, 깊이가 같으면 먼저 선언한 쪽이니까'], a: 2,
      why: 'Maven은 가까운 정의를 고르고 깊이가 같으면 먼저 선언한 쪽을 남긴다. 가장 높은 버전을 고르는 것은 Gradle이다.' },
    { q: '로컬에 Gradle 7.6이 깔린 동료가 ./gradlew build를 칠 때 쓰이는 Gradle 버전은 무엇인가?',
      o: ['7.6', 'gradle-wrapper.properties에 적힌 8.7', '설치된 것 중 가장 최신'], a: 1,
      why: '래퍼는 distributionUrl에 적힌 버전을 받아서 실행한다. 로컬 설치 버전과 상관없이 모두 8.7이다.' },
  ];
  const summary = [
    '손으로 빌드하면 전이 jar와 -cp 목록과 빌드 순서를 사람이 다 챙겨야 한다.',
    'Maven은 pom.xml의 좌표와 표준 라이프사이클로, Gradle은 태스크 그래프로 빌드한다.',
    '버전이 겹치면 Maven은 가까운 쪽(같은 깊이면 먼저 선언), Gradle은 높은 쪽을 고른다.',
    '의존성 버전, JDK 버전, 빌드 도구 버전을 모두 커밋해야 어디서든 같은 결과가 난다.',
  ];
  const review = [
    { q: '로컬에선 되던 서비스가 배포 후 NoSuchMethodError를 냈다. 먼저 할 일은 무엇인가?',
      o: ['JDK를 다시 설치한다', 'dependency:tree로 실제 뽑힌 버전을 확인한다', 'scope를 모두 test로 바꾼다'], a: 1,
      why: '전이 의존성 충돌로 다른 버전이 뽑혔을 가능성이 크다. 트리로 확인한 뒤 BOM이나 constraints로 고정한다.' },
    { q: 'CI에서만 빌드가 다르게 나온다. 팀이 gradle build를 직접 치고 있었다. 무엇을 바꿔야 하나?',
      o: ['모두 ./gradlew build로 바꾸고 래퍼 파일을 커밋한다', 'CI 서버의 Gradle을 지운다', 'pom.xml로 옮긴다'], a: 0,
      why: '각자 설치한 Gradle 버전이 다르면 결과가 갈린다. 래퍼가 고정한 버전으로 모두 빌드해야 한다.' },
    { q: 'junit을 compile scope로 두었더니 배포 jar가 커졌다. 알맞은 고침은 무엇인가?',
      o: ['junit을 lib/에 손으로 넣는다', 'jar를 압축한다', 'Maven은 scope=test, Gradle은 testImplementation으로 바꾼다'], a: 2,
      why: '테스트 전용 의존성은 테스트 클래스패스에만 두면 최종 jar에 들어가지 않는다.' },
  ];

  R.page({ title: '클래스패스 · 라이프사이클 · 의존성 트리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
