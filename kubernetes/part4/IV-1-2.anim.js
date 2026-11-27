/* IV-1-2 ConfigMap — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * ConfigMap 키·값, 이미지에 박힌 ENV, Pod 의 env·마운트 파일은 STEPS 의 configMap · pod 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, cross, check, lock, clock, terminal, kvTable, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const short = (v, n) => (v.length > n ? v.slice(0, n - 1) + '…' : v);

  // 이미지 레이어 쌓기 (아래에서 위로). layers: [[text, color, s]]
  function stack(cx, by, layers, o) { o = o || {}; const w = o.w || 300, h = 30;
    layers.forEach(([s, col, sc, op], i) => { const y = by - i * (h + 4) - h / 2;
      card(cx, y - (1 - (sc ?? 1)) * 40, w, h, { rx: 5, text: s, fs: 13.5, mono: true, fw: 600, stroke: col || INK, fill: col === WARN ? WARNBG : col === BAD ? BADBG : PANEL, color: col === BAD ? BAD : INK, op: (o.op ?? 1) * (op ?? 1) * clamp((sc ?? 1) * 1.5), sw: 1.8 }); });
    if (o.name) lbl(cx, by + 26, o.name, o.op ?? 1, { fill: o.nameCol || INK }); }
  const BASE = [['FROM python:3.11-slim'], ['RUN pip install -r …'], ['COPY . .']];

  // ---------- 1. 이미지에 설정 박기 ----------
  function s1(t, c) { const { k, u } = c, baked = c.beat.pod.baked;
    const envL = baked.map((b, i) => { const isNew = !c.prev || !c.prev.pod.baked[i]; return ['ENV ' + b.key + '=' + short(b.value, 20), WARN, isNew ? E(u, 0.3 + i * 0.3, 0.9 + i * 0.3) : 1]; });
    if (k <= 2) { const base = BASE.map(([s], i) => [s, INK, k === 0 ? E(u, 0.2 + i * 0.5, 0.8 + i * 0.5) : 1]);
      stack(260, 380, base.concat(envL), { w: 380, name: k === 0 ? 'myapp 이미지 (빌드 중)' : 'myapp:prod' });
      if (k >= 1) { const n0 = c.prev ? c.prev.pod.baked.length : 0;
        tx(560, 110, '이미지 안에 박힌 설정', { 'font-size': 15, 'font-weight': 700, fill: MUT });
        mono(560, 170, String(Math.round(tween(n0, baked.length, u))), { 'font-size': 52, 'font-weight': 800, fill: WARN });
        note(620, 168, '개 · 바꾸려면 다시 빌드', k === 1 ? fade(u, 1.2) : 1);
        if (k === 2) { pill(700, 250, 'FEATURE_FLAG 하나 = 새 이미지', WARN, pop(u, 1.3), { fs: 14 }); } }
      else { note(560, 150, '여기까지는 환경과 상관없는 층', fade(u, 1.8), { fill: MUT }); }
      return; }
    if (k === 3) { const envs = [['dev', 150], ['staging', 480], ['prod', 810]], sp = E(u, 0.2, 1.2);
      envs.forEach(([e, x], i) => { const cx = lerp(480, x, sp), op = i === 1 ? 1 : clamp((sp - 0.55) * 3);
        stack(cx, 290, BASE.map(([s]) => [short(s, 14), INK]).concat([['ENV × 4', WARN]]), { w: 200, name: 'myapp:' + e, op });
        tx(cx - 100, 360, 'Dockerfile.' + (e === 'staging' ? 'stg' : e), { 'font-size': 13.5, class: 'mono', fill: MUT, opacity: fade(u, 1.0) });
        hbar(cx - 100, 372, 140, 1, 1, { u: E(u, 1.0 + i * 0.4, 1.6 + i * 0.4), h: 14, label: false, col: WARN }); });
      banner(480, 40, '코드는 같은데 이미지가 3개, 빌드도 3번', pop(u, 1.6)); return; }
    // k4: 사고
    terminal(30, 40, 470, 190, ['$ docker history myapp:prod', 'CREATED BY', 'CMD ["python" "main.py"]', ['ENV FEATURE_FLAG=true', null], ['ENV LOG_LEVEL=WARN', null], ['ENV API_KEY=prod-key-xxxxxx', '#f87171']], 1 + E(u, 0.2, 1.4) * 5, { fs: 13.5, lh: 22 });
    note(40, 262, 'layer에 남은 API 키는 누구나 꺼내 본다', fade(u, 1.4), { fill: BAD });
    stack(720, 210, BASE.map(([s]) => [short(s, 14), INK]).concat([['ENV × 4 (prod 값)', WARN]]), { w: 220, name: 'myapp:prod' });
    zone(600, 280, 250, 110, 'dev 클러스터', { stroke: GRID });
    fly(720, 210, 725, 345, seg(u, 1.0, 2.0), 'myapp:prod', { mono: true, stay: true, fill: BAD });
    if (u > 2.0) { cross(800, 345, 14, pop(u, 2.0)); }
    sub(725, 412, 'prod DB 주소를 dev에서 쓰는 오배포', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. ConfigMap 정의 ----------
  function cmRows(cm, prevCm, u, o) { o = o || {}; const old = (prevCm && prevCm.data) || [];
    return cm.data.map((d, i) => { const isNew = !old[i] || old[i].key !== d.key;
      return [d.key, short(d.value.split('\\n')[0], o.vn || 26) + (d.value.includes('\\n') ? ' …' : ''), { op: isNew && o.anim !== false ? fade(u, 0.3 + i * 0.35) : 1, hot: o.hot ? o.hot(d, i) : false }]; }); }
  function s2(t, c) { const { k, u } = c, cm = c.beat.configMap;
    // 왼쪽: 설정이 빠진 이미지
    stack(150, 370, BASE.map(([s]) => [short(s, 14), INK]), { w: 210, name: 'myapp:v1' });
    if (k === 0) [0, 1, 2, 3].forEach((i) => { const d = E(u, 0.3, 1.6); card(150, 238 - i * 34 + d * 60, 210, 30, { rx: 5, text: 'ENV …', fs: 13.5, stroke: WARN, fill: WARNBG, op: 1 - d, mono: true }); });
    if (k === 0) sub(150, 120, '이미지에서 ENV 층이 빠진다', fade(u, 1.4), { 'font-size': 14, 'font-weight': 700 });
    // 오른쪽: ConfigMap 메모장
    const x = k === 3 ? 300 : 330, w = 420, s = k === 0 ? pop(u, 0.3) : 1;
    const rows = cmRows(cm, c.prev && c.prev.configMap, u, { anim: k === 1 || k === 2 });
    kvTable(x, 60, w, rows.length ? rows : [['data:', '(비어 있음)', { op: 0.6 }]], { title: 'ConfigMap app-config · namespace dev', kw: 150 });
    const n0 = c.prev && c.prev.configMap.data ? c.prev.configMap.data.length : 0;
    if (k <= 2) mono(x + w + 16, 92, Math.round(tween(n0, cm.data.length, u)) + ' key', { 'font-size': 20, 'font-weight': 800, fill: ACC });
    if (k === 2) { const y = 60 + 30 + 4 * 34; el('rect', { x: x + 6, y: y + 34, width: w - 12, height: 74, rx: 6, fill: SOFT, opacity: fade(u, 1.4) });
      ['log.level=info', 'feature.flag=true', 'cache.ttl=300'].forEach((l, i) => mono(x + 160, y + 54 + i * 22, l, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5 + i * 0.2) }));
      tx(x + 16, y + 76, 'key = 파일 이름', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); }
    if (k === 3) { dbIcon(850, 130, 'API 서버 (etcd)', { s: pop(u, 0.2) });
      fly(x + w / 2, 120, 850, 130, seg(u, 0.6, 1.5), 'app-config', { mono: true });
      terminal(300, 290, 620, 120, ['$ kubectl apply -f configmap.yaml', ['configmap/app-config created', null], '$ kubectl create configmap app-config --from-env-file=.env'], E(u, 0.4, 2.4) * 3, { fs: 13.5 }); } }

  // ---------- 3. env 주입 ----------
  const PX3 = 560;
  function podEnv(x, y, w, envs, o) { o = o || {};
    el('rect', { x, y, width: w, height: 300, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.4, opacity: o.op ?? 1 });
    tx(x + 16, y + 26, 'Pod web · namespace dev', { 'font-size': 15, 'font-weight': 700, opacity: o.op ?? 1 });
    card(x + w / 2, y + 66, w - 40, 42, { rx: 8, text: o.image || 'app · myapp:v1', fs: 14, mono: true, fill: SOFT, op: o.op });
    tx(x + 20, y + 116, 'env', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    if (!envs.length) mono(x + 70, y + 116, '(없음)', { 'font-size': 14, fill: OFF });
    envs.forEach((e, i) => { const yy = y + 136 + i * 38, op = e.op ?? 1;
      el('rect', { x: x + 20, y: yy, width: w - 40, height: 32, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: op });
      mono(x + 32, yy + 21, e.key + '=' + short(e.value, 26), { 'font-size': 13.5, 'font-weight': 700, fill: e.col || INK, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, env = b.pod.env, prevN = c.prev ? c.prev.pod.env.length : 0;
    const hotKeys = env.slice(prevN).map((e) => e.key);
    const rows = b.configMap.data.map((d) => [d.key, short(d.value, 24), { hot: hotKeys.includes(d.key) && u < 2.4, op: 1 }]);
    if (k === 4) rows[0] = ['LOG_LEVEL', u > 1.2 ? 'debug  ← 수정' : 'info', { hot: u > 1.2 }];
    kvTable(30, 70, 420, rows, { title: 'ConfigMap app-config', kw: 150 });
    const show = env.map((e, i) => { const isNew = i >= prevN; return { ...e, op: isNew && k > 0 ? fade(u, 1.3 + (i - prevN) * 0.15) : 1 }; });
    podEnv(PX3, 40, 370, show, { op: k === 0 ? fade(u, 0.2) : 1 });
    env.forEach((e, i) => { if (i < prevN || k === 0) return; const ry = 70 + 30 + b.configMap.data.findIndex((d) => d.key === e.key) * 34 + 17;
      fly(400, ry, PX3 + 130, 40 + 136 + i * 38 + 16, seg(u, 0.3 + (i - prevN) * 0.12, 1.4 + (i - prevN) * 0.12), e.key, { mono: true }); });
    const tag = k === 1 || k === 2 ? 'env · configMapKeyRef (키 하나씩)' : k === 3 ? 'envFrom · configMapRef (전부)' : null;
    if (tag) pill(245, 290, tag, ACC, pop(u, 0.2), { fs: 13.5 });
    if (k === 2) sub(245, 330, '키 하나에 여섯 줄', fade(u, 1.6), { 'font-size': 14 });
    if (k === 3) sub(245, 330, '키 이름이 그대로 변수 이름', fade(u, 1.6), { 'font-size': 14 });
    if (k === 4) { terminal(30, 300, 420, 104, ['$ kubectl exec web -- env | grep LOG', ['LOG_LEVEL=info', null]], E(u, 0.1, 0.9) * 2, { fs: 13.5 });
      if (u > 1.4) { pill(PX3 + 185, 372, 'Pod 재시작 전까지 info 그대로', WARN, pop(u, 1.4), { fs: 13.5 }); } } }

  // ---------- 4. volume 마운트 ----------
  function s4(t, c) { const { k, u } = c, cm = c.beat.configMap, edited = k === 3 && u > 0.6;
    const rows = cm.data.map((d) => [d.key, short(d.value.split('\\n')[0], 18) + ' …', { hot: edited && d.key === 'app.properties' }]);
    kvTable(30, 70, 380, rows, { title: 'ConfigMap app-config (파일용 key 2개)', kw: 150 });
    // Pod 와 파일 트리
    el('rect', { x: 500, y: 40, width: 430, height: 360, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.4 });
    tx(516, 66, 'Pod web', { 'font-size': 15, 'font-weight': 700 });
    pill(640, 380, 'volume: config-volume', ACC, k === 0 ? pop(u, 0.4) : 1, { mono: true, fs: 13.5 });
    grow(410, 120, 560, 362, k === 0 ? E(u, 0.8, 1.8) : 1, ACC, { plain: true, dash: '6 4' });
    if (k === 0) sub(240, 230, 'configMap: name: app-config', fade(u, 1.4), { class: 'mono', 'font-size': 14, fill: ACC });
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1;
      mono(530, 110, '/', { 'font-size': 15, fill: MUT, opacity: s }); mono(550, 140, 'etc/', { 'font-size': 15, fill: MUT, opacity: s });
      el('rect', { x: 560, y: 152, width: 150, height: 30, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8, opacity: s });
      mono(572, 173, 'config/', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: s });
      lock(735, 168, true, ACC, 0.8 * s); mono(752, 173, 'readOnly', { 'font-size': 13.5, fill: MUT, opacity: s });
      grow(640, 362, 640, 186, k === 1 ? E(u, 0.6, 1.4) : 1, ACC); }
    if (k >= 2) { const files = c.beat.pod.mounts.map((m) => m.path.split('/').pop());
      files.forEach((f, i) => { const y = 206 + i * 34, s = k === 2 ? pop(u, 0.3 + i * 0.35) : 1;
        el('path', { d: `M572,182 V${y + 10} H600`, fill: 'none', stroke: GRID, 'stroke-width': 1.8, opacity: s });
        card(680, y + 10, 150, 28, { rx: 5, text: f, fs: 13.5, mono: true, s, stroke: INK }); });
      const val = c.beat.configMap.data[0].value.split('\\n'), shownVal = k === 3 && !(u > 2.0) ? c.prev.configMap.data[0].value.split('\\n') : val;
      el('rect', { x: 530, y: 278, width: 380, height: 84, rx: 8, fill: 'var(--ink)', opacity: k === 2 ? fade(u, 1.2) : 1 });
      mono(544, 298, '$ cat /etc/config/app.properties', { 'font-size': 13.5, fill: PANEL, opacity: k === 2 ? fade(u, 1.2) : 1 });
      shownVal.forEach((l, i) => mono(544, 320 + i * 18, l, { 'font-size': 13.5, fill: k === 3 && u > 2.0 && i === 0 ? '#fbbf24' : 'var(--term)', opacity: k === 2 ? fade(u, 1.5 + i * 0.15) : 1 })); }
    if (k === 3) { clock(240, 300, 30, E(u, 0.6, 2.0), INFO);
      tx(290, 292, 'kubelet 동기화', { 'font-size': 14, 'font-weight': 700 });
      tx(290, 314, '기본 1분 주기 + 캐시 지연', { 'font-size': 13.5, fill: MUT });
      if (u > 2.0) check(890, 320, 10, pop(u, 2.0)); } }

  // ---------- 5. 환경별 ConfigMap ----------
  const COLS = [['dev', 165], ['staging', 480], ['prod', 795]];
  function s5(t, c) { const { k, u } = c;
    const vals = { dev: ['debug', 'true', 'dev-db:5432'], staging: ['info', 'true', 'stg-db:5432'], prod: ['warn', 'false', 'prod-db:5432'] };
    pill(480, 36, '이미지 myapp:v1 하나', ACC, 1, { mono: true, fs: 14 });
    COLS.forEach(([e, x], i) => { const on = i < k || k === 3, isNew = i === k && k < 3; if (!on && !isNew) { zone(x - 145, 110, 290, 290, 'namespace ' + e, { op: 0.35 }); return; }
      const s = isNew ? pop(u, 0.2) : 1;
      zone(x - 145, 110, 290, 290, 'namespace ' + e, { stroke: isNew ? ACC : 'none', op: clamp(s * 1.4) });
      grow(480, 52, x, 108, isNew ? E(u, 0.2, 0.9) : 1, MUT);
      ['LOG_LEVEL', 'FEATURE_FLAG', 'DB_URL'].forEach((key, j) => { const y = 160 + j * 52, prevV = e === 'prod' && key === 'FEATURE_FLAG';
        tx(x - 128, y, key, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: clamp(s * 1.4) });
        mono(x - 128, y + 22, vals[e][j], { 'font-size': 15, 'font-weight': 800, fill: prevV ? BAD : j === 0 ? INFO : INK, opacity: isNew ? fade(u, 0.6 + j * 0.3) : 1 }); });
      if (k === 3) { dot([[480, 52], [x, 108], [x, 330]], seg(u, 0.2 + i * 0.25, 1.2 + i * 0.25), ACC, 7);
        card(x, 350, 200, 50, { rx: 10, text: 'Pod web · myapp:v1', fs: 14, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 1.1 + i * 0.25) }); } });
    if (k === 2) pill(795, 420 - 24, 'prod만 신기능 OFF', BAD, pop(u, 1.2), { fs: 13.5 });
    if (k === 3) tx(480, 412, 'kubectl apply -f pod.yaml -n <환경>  · Pod spec은 셋 다 같다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) }); }

  const quiz = [
    { q: 'Dockerfile에 ENV로 설정을 박을 때 생기는 문제가 아닌 것은 무엇인가?',
      o: ['환경마다 이미지를 따로 빌드해야 한다', 'docker history로 API 키가 보인다', '컨테이너가 시작할 때 설정을 읽지 못한다'], a: 2,
      why: '박힌 ENV는 오히려 늘 읽힌다. 문제는 값이 이미지에 고정돼 dev, staging, prod 이미지 3개를 굽고, layer에 API 키가 남는다는 점이다.' },
    { q: 'ConfigMap data에 여러 줄 값(app.properties: |)을 넣으면 무엇이 되는가?',
      o: ['볼륨으로 마운트할 때 그 key 이름의 파일이 된다', '여러 개의 환경 변수로 쪼개진다', 'Secret으로 자동 변환된다'], a: 0,
      why: 'key는 파일 이름, value는 파일 내용이 된다. 평탄한 키 4개에 파일용 키 하나를 더해 5 key가 됐다.' },
    { q: 'ConfigMap의 LOG_LEVEL을 env로 받은 Pod에서, ConfigMap 값을 고치면 어떻게 되는가?',
      o: ['몇 초 안에 env가 바뀐다', 'Pod를 다시 시작해야 새 값이 들어간다', 'ConfigMap 수정이 거부된다'], a: 1,
      why: 'env는 컨테이너가 시작할 때 한 번 채워진다. 그래서 envFrom 이든 configMapKeyRef 든 재시작이 필요하다.' },
    { q: 'ConfigMap을 /etc/config에 볼륨으로 마운트했을 때 값을 고치면 어떻게 되는가?',
      o: ['Pod가 자동으로 재시작된다', '파일은 그대로고 env만 바뀐다', 'kubelet이 동기화하면서 파일 내용이 바뀐다'], a: 2,
      why: '마운트된 파일은 kubelet 동기화 주기와 캐시 지연 뒤 갱신된다. 앱이 변경을 감지하면 재시작 없이 반영할 수 있다.' },
    { q: 'dev, staging, prod에 같은 이름의 ConfigMap을 두면 무엇을 한 번만 하면 되는가?',
      o: ['myapp:v1 이미지 빌드', '환경별 Pod spec 작성', '네임스페이스 생성'], a: 0,
      why: '값만 네임스페이스마다 다르고 이미지와 Pod spec은 같다. 한 번 빌드한 myapp:v1을 -n만 바꿔 세 번 배포한다.' },
  ];

  const summary = [
    '설정을 Dockerfile의 ENV로 박으면 환경 수만큼 이미지를 굽고 API 키가 layer에 남는다.',
    'ConfigMap은 설정을 key-value로 클러스터에 따로 저장해 이미지와 떼어 놓는다.',
    'env로 받은 값은 Pod를 재시작해야 바뀌고, 볼륨 파일은 kubelet 동기화 뒤 바뀐다.',
    '네임스페이스마다 같은 이름의 ConfigMap을 두면 myapp:v1 하나로 세 환경을 운영한다.',
  ];
  const review = [
    { q: 'ConfigMap의 FEATURE_FLAG를 false로 고쳤는데 앱 동작이 그대로다. 앱은 envFrom으로 값을 받는다. 먼저 할 일은?',
      o: ['이미지를 다시 빌드한다', 'Pod를 다시 시작한다(rollout restart)', 'ConfigMap을 지우고 Secret으로 옮긴다'], a: 1,
      why: 'env는 컨테이너 시작 때만 채워진다. ConfigMap은 이미 바뀌었으니 Pod만 새로 띄우면 된다.' },
    { q: 'nginx.conf처럼 긴 설정 파일을 넣어야 한다. 어떤 방식이 맞는가?',
      o: ['환경 변수 하나에 파일 전체를 넣는다', 'Dockerfile에 COPY로 넣는다', 'ConfigMap에 파일 key로 넣고 볼륨으로 마운트한다'], a: 2,
      why: '볼륨 마운트는 key를 파일 이름으로 만들어 준다. 이미지에 넣으면 설정을 바꿀 때마다 다시 빌드해야 한다.' },
    { q: 'prod 이미지가 dev에 잘못 배포돼 dev가 prod DB에 붙었다. 다시는 안 생기게 하려면?',
      o: ['설정을 ConfigMap으로 빼고 이미지는 myapp:v1 하나만 만든다', 'prod 이미지 태그 이름을 더 길게 바꾼다', 'dev 클러스터의 노드 수를 줄인다'], a: 0,
      why: '이미지에 환경 값이 없으면 어느 네임스페이스에 올려도 그곳 ConfigMap의 DB_URL을 읽는다.' },
  ];

  R.page({ title: 'ConfigMap 주입', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
