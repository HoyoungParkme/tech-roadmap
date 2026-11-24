/**
 * 모듈: mindmap/map.js — 기술 로드맵 지도
 * 한 장의 시스템 그림(요청이 지나가는 길) 위에 흐름 9개를 경로로 겹치고, 각 지점에 그때 쓰는 기술(주제)을 형광펜으로 붙인다.
 * 데이터: ./topics.js (scripts/build_hub.py 가 만든다) 의 TOPIC_GROUPS·TOPIC_ANIM. 진도: localStorage 'trn-read-<id>'.
 * 좌표계: viewBox 0 0 1800 1150. 끌기·휠·버튼으로 viewBox 를 움직인다.
 */
(function () {
  const NAME = {}, CAT = {}, CH = {};
  (window.TOPIC_GROUPS || []).forEach(([c, items]) => items.forEach(([id, n, , , ch]) => { NAME[id] = n; CAT[id] = c; CH[id] = ch; }));
  const ANIM = window.TOPIC_ANIM || {};
  const read = (id) => { try { return Object.keys(JSON.parse(localStorage.getItem('trn-read-' + id) || '{}')).length; } catch (e) { return 0; } };
  const href = (id) => `../${id}/index.html`;

  // ---------- 그림 데이터 ----------
  const REGIONS = [
    { id: 'deploy', x: 175, y: 18, w: 1145, h: 178, label: '코드가 올라가는 길' },
    { id: 'cloud', x: 598, y: 222, w: 712, h: 560, label: '클라우드 (VPC)', t: ['cloud-infra', 'gcp'], cx: 720, cy: 756 },
    { id: 'k8s', x: 722, y: 262, w: 366, h: 470, label: 'Kubernetes 클러스터', t: ['kubernetes'] },
    { id: 'obs', x: 1338, y: 222, w: 446, h: 300, label: '지켜보기' },
    { id: 'ana', x: 1338, y: 560, w: 446, h: 560, label: '분석' },
    { id: 'ai', x: 598, y: 812, w: 712, h: 308, label: 'AI' },
    { id: 'inside', x: 22, y: 762, w: 540, h: 358, label: '서버 한 대 안을 들여다보면' },
  ];
  const N = {
    dev: { x: 255, y: 88, ic: 'laptop', n: '개발자 PC', t: ['linux'], x2: ['Git'], d: '코드를 고치고 커밋한다.' },
    github: { x: 450, y: 88, ic: 'git', n: 'GitHub', t: ['github'], x2: ['Actions CI'], d: 'PR을 리뷰하고 테스트·빌드를 자동으로 돌린다.' },
    image: { x: 640, y: 88, ic: 'cube', n: '컨테이너 이미지', t: ['docker'], x2: ['Registry'], d: '앱과 실행 환경을 한 덩어리로 굳혀 저장소에 올린다.' },
    argo: { x: 835, y: 88, ic: 'sync', n: '배포 동기화', t: ['helm', 'argocd'], x2: ['GitOps'], d: 'Git에 적힌 원하는 상태와 클러스터를 계속 맞춘다.' },
    iac: { x: 1035, y: 88, ic: 'blocks', n: '인프라 코드', t: ['terraform', 'pulumi'], x2: [], d: 'VM·네트워크·DB 같은 클라우드 자원을 코드로 만든다.' },
    vault: { x: 1230, y: 88, ic: 'lock', n: '비밀 저장소', t: ['vault'], x2: [], d: '비밀번호·API 키를 코드 밖에 두고 필요할 때 꺼내 준다.' },
    bundler: { x: 405, y: 262, ic: 'bundle', n: '번들러', t: ['vite', 'webpack', 'storybook'], x2: [], w: 190, d: '수백 개 소스 파일을 몇 개로 묶고 줄인다. Storybook은 컴포넌트를 따로 띄워 본다.' },
    user: { x: 72, y: 470, ic: 'person', n: '사용자', t: [], x2: [], d: '버튼을 누르면 모든 흐름이 여기서 시작한다.' },
    browser: { x: 240, y: 400, ic: 'browser', n: '브라우저', t: ['html', 'css', 'js', 'typescript', 'react', 'vue', 'svelte', 'nextjs', 'tailwindcss', 'webassembly'], x2: [], w: 230, d: 'HTML·CSS·JS를 받아 DOM을 만들고 화면을 그린다. React·Vue·Svelte가 상태에 따라 다시 그린다.' },
    phone: { x: 240, y: 670, ic: 'phone', n: '앱', t: ['kotlin'], x2: ['Android'], d: '모바일 앱도 같은 API 서버로 요청을 보낸다.' },
    dns: { x: 480, y: 372, ic: 'globe', n: 'DNS', t: [], x2: ['Route53'], d: '도메인 이름을 서버 IP 주소로 바꿔 준다.' },
    cdn: { x: 468, y: 560, ic: 'cloud', n: 'CDN', t: [], x2: ['CloudFront'], d: '이미지·JS 같은 정적 파일을 사용자 가까운 곳에서 바로 준다.' },
    lb: { x: 660, y: 470, ic: 'lb', n: '로드밸런서', t: ['nginx'], x2: ['TLS'], w: 120, d: '요청을 받아 TLS를 풀고 서버 여러 대로 나눈다(리버스 프록시).' },
    gw: { x: 800, y: 470, ic: 'gate', n: 'API 게이트웨이', t: ['spring-cloud'], x2: [], w: 130, d: '외부 요청 하나를 받아 경로에 맞는 안쪽 서비스로 보낸다.' },
    order: { x: 965, y: 350, ic: 'server', n: '주문 서비스', t: ['fastapi', 'springboot', 'nodejs', 'microservices'], x2: [], w: 210, d: '요청을 해석해 비즈니스 로직을 돌리는 API 서버. 서비스마다 자기 DB를 가진다.' },
    pay: { x: 965, y: 600, ic: 'server', n: '결제 서비스', t: ['go', 'java', 'grpc', 'graphql'], x2: [], w: 210, d: '다른 서비스가 gRPC·GraphQL로 부르거나, 메시지를 구독해 일한다.' },
    cache: { x: 1195, y: 300, ic: 'cache', n: '캐시', t: ['redis'], x2: [], d: '같은 질문의 답을 메모리에서 바로 꺼낸다.' },
    db: { x: 1195, y: 462, ic: 'db', n: '데이터베이스', t: ['postgres', 'mongodb', 'sqlite'], x2: [], w: 200, d: '데이터를 디스크에 안전하게 저장하고 찾는다.' },
    broker: { x: 1195, y: 640, ic: 'queue', n: '메시지 브로커', t: ['kafka', 'rabbitmq'], x2: [], d: '이벤트를 맡아 두었다가 구독한 서비스에 나눠 준다.' },
    otel: { x: 1425, y: 300, ic: 'funnel', n: '수집기', t: ['opentelemetry'], x2: [], w: 130, d: '서비스들이 내는 지표·트레이스·로그를 모아 보낸다.' },
    store: { x: 1565, y: 300, ic: 'tsdb', n: '지표 · 트레이스', t: ['prometheus', 'jaeger'], x2: [], w: 140, d: '신호를 시간순으로 저장한다.' },
    dash: { x: 1710, y: 300, ic: 'screen', n: '대시보드', t: ['grafana'], x2: [], w: 120, d: '그래프로 지금 상태를 한눈에 본다.' },
    alert: { x: 1710, y: 450, ic: 'bell', n: '알림', t: ['observability'], x2: ['SLO'], w: 120, d: '기준을 넘으면 사람을 부른다.' },
    etl: { x: 1440, y: 680, ic: 'gear', n: '가공', t: ['data-engineering', 'dw-pipeline'], x2: ['Airflow', 'dbt'], w: 180, d: '정해진 시간에 데이터를 정리·집계한다.' },
    dw: { x: 1665, y: 680, ic: 'building', n: '웨어하우스', t: ['gcp'], x2: ['BigQuery', 'ODS·DW·DM'], w: 170, d: '원본(레이크)과 분석용 표(웨어하우스)를 나눠 쌓는다.' },
    search: { x: 1440, y: 930, ic: 'magnifier', n: '검색 엔진', t: ['search', 'elasticsearch', 'opensearch'], x2: [], w: 180, d: '역색인으로 글을 빠르게 찾는다.' },
    bi: { x: 1665, y: 930, ic: 'chart', n: '분석 화면', t: [], x2: ['BI'], d: '웨어하우스 표를 그래프로 본다.' },
    train: { x: 670, y: 900, ic: 'gpu', n: '모델 학습', t: ['ml', 'dl', 'pytorch', 'tensorflow'], x2: ['GPU'], w: 150, d: '데이터로 손실을 줄이도록 가중치를 고친다.' },
    serve: { x: 850, y: 900, ic: 'box', n: '모델 서빙', t: ['mlops'], x2: ['MLflow'], w: 130, d: '모델 버전을 저장하고 API로 띄워 예측을 준다.' },
    llm: { x: 1040, y: 900, ic: 'spark', n: 'LLM · 에이전트', t: ['ai-agent', 'langchain', 'llmops'], x2: [], w: 170, d: '질문에 답하거나 도구를 불러 더 알아본다. LLMOps가 품질·비용을 잰다.' },
    tools: { x: 1230, y: 900, ic: 'wrench', n: '도구 · MCP', t: [], x2: ['Tool Use', 'MCP'], w: 130, d: '날씨 API·DB·파일 같은 외부 기능을 LLM이 부르게 한다.' },
    docs: { x: 850, y: 1060, ic: 'pages', n: '문서 적재', t: ['rag'], x2: ['청크', '임베딩'], w: 150, d: '문서를 잘라 벡터로 바꾼다.' },
    vdb: { x: 1040, y: 1060, ic: 'vdb', n: '벡터 · 그래프 DB', t: ['vector-db', 'graphrag'], x2: [], w: 170, d: '가까운 의미를 찾는 벡터와 관계를 따라가는 그래프에 넣는다.' },
  };
  const LAYERS = [
    { n: '언어 런타임', t: ['python', 'java', 'kotlin', 'csharp'], x2: ['JVM', 'CPython'] },
    { n: '프로세스 · 스레드', t: ['go', 'nodejs'], x2: ['goroutine', '이벤트 루프'] },
    { n: '메모리', t: ['c', 'cpp', 'rust'], x2: ['GC', '소유권'] },
    { n: '커널 · 네트워크', t: ['linux'], x2: ['소켓', '시스템 콜'] },
  ];
  // [출발, 도착, 화살표 위 글, 흐름, 휨]
  const A = [
    ['user', 'browser', '클릭', 'req', 0], ['browser', 'dns', '이름 → IP', 'req', -36], ['browser', 'lb', 'HTTPS 요청', 'req', 120], ['phone', 'lb', 'API 요청', 'req', 30],
    ['lb', 'gw', '프록시', 'req', 0], ['gw', 'order', '라우팅', 'req', 0], ['order', 'cache', 'GET key', 'req', -20], ['order', 'db', 'miss면 SQL', 'req', 20],
    ['dev', 'bundler', 'npm run build', 'fe', 0], ['bundler', 'cdn', 'bundle.js', 'fe', 110], ['cdn', 'browser', 'HTML · JS', 'fe', -40],
    ['order', 'pay', 'gRPC 호출', 'msa', 0], ['order', 'broker', '주문됨 이벤트', 'msa', 60], ['broker', 'pay', '구독', 'msa', 20], ['gw', 'pay', '', 'msa', 0],
    ['dev', 'github', 'git push', 'deploy', 0], ['github', 'image', 'CI 빌드', 'deploy', 0], ['image', 'argo', '이미지 태그', 'deploy', 0], ['argo', '@k8s', 'sync', 'deploy', 0], ['iac', '@cloud', '자원 생성', 'deploy', 0], ['vault', '@k8s2', '비밀 주입', 'deploy', 30],
    ['order', 'otel', 'OTLP', 'obs', -150], ['otel', 'store', '내보내기', 'obs', 0], ['store', 'dash', 'PromQL', 'obs', 0], ['dash', 'alert', '규칙 위반', 'obs', 0],
    ['db', 'etl', 'CDC', 'data', -30], ['broker', 'etl', '토픽', 'data', 0], ['etl', 'dw', '적재', 'data', 0], ['dw', 'bi', '질의', 'data', 0], ['db', 'search', '색인', 'data', 60],
    ['train', 'serve', '모델 버전', 'ml', 0], ['serve', 'pay', '예측 API', 'ml', 60],
    ['order', 'llm', '질문', 'rag', -140], ['docs', 'vdb', '벡터 upsert', 'rag', 0], ['llm', 'vdb', 'top-k 검색', 'rag', 0], ['llm', 'tools', '도구 호출', 'rag', 0],
  ];
  const PTS = { '@k8s': [900, 262], '@cloud': [1035, 222], '@k8s2': [1060, 262] };
  const FLOWS = [
    { id: 'req', n: '요청 한 번이 지나가는 길' }, { id: 'fe', n: '화면이 그려지기까지' }, { id: 'os', n: '서버 한 대 안' },
    { id: 'msa', n: '서비스끼리 주고받기' }, { id: 'deploy', n: '코드가 서버에 올라가기' }, { id: 'obs', n: '서버를 지켜보기' },
    { id: 'data', n: '데이터가 분석까지' }, { id: 'ml', n: '모델을 만들어 서비스하기' }, { id: 'rag', n: '질문이 답이 되기' },
  ];
  const FLOW_REG = { deploy: ['deploy', 'k8s', 'cloud'], os: ['inside'], obs: ['obs'], data: ['ana'], ml: ['ai'], rag: ['ai'], msa: ['k8s'] };
  // 기초 노트(옛 지도의 장 노트)와 흐름의 짝
  const NOTES = [
    ['1-1-dev-intro', '개발이란?'], ['1-2-good-developer', '개발 잘하는 사람'], ['1-3-app-types', '앱 종류'], ['1-4-frontend-backend', '프론트 vs 백엔드'],
    ['2-1-webapp-vs-native', '웹 앱 vs 네이티브'], ['3-languages', '언어·프레임워크'], ['4-api-security', 'API·보안'], ['5-sw-engineering', '소프트웨어 공학'],
    ['6-cs-basics', '컴퓨터 구조·OS'], ['7-database', '데이터베이스'], ['8-network', '네트워크'], ['9-architecture', '아키텍처'],
    ['10-cloud-deploy', '클라우드·배포'], ['11-ai-agent', 'AI Agent'],
  ];
  const FLOW_NOTES = {
    req: ['8-network', '4-api-security', '1-4-frontend-backend'], fe: ['1-3-app-types', '2-1-webapp-vs-native', '1-4-frontend-backend'],
    os: ['6-cs-basics', '3-languages'], msa: ['9-architecture', '5-sw-engineering'], deploy: ['10-cloud-deploy'], obs: ['10-cloud-deploy'],
    data: ['7-database'], ml: ['11-ai-agent'], rag: ['11-ai-agent'],
  };

  // ---------- 그리기 ----------
  const svg = document.getElementById('map'), NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (p || svg).appendChild(e); return e; };
  el('defs', {}).innerHTML = `<filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2b2b2b"/></marker>
<marker id="ahr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#e0473c"/></marker>`;
  const gReg = el('g', {}), gArr = el('g', {}), gNode = el('g', {});
  const ICON = {
    person: '<circle cx="0" cy="-16" r="11"/><path d="M-20 22c0-16 9-24 20-24s20 8 20 24z"/>',
    browser: '<rect x="-36" y="-26" width="72" height="52" rx="5"/><path d="M-36 -14H36"/><circle class="f" cx="-28" cy="-20" r="2"/><circle class="f" cx="-21" cy="-20" r="2"/><circle class="f" cx="-14" cy="-20" r="2"/><path d="M-26 -3H6M-26 6H20M-26 15H0"/>',
    phone: '<rect x="-17" y="-30" width="34" height="60" rx="7"/><path d="M-6 22H6"/><path d="M-10 -18H10M-10 -8H6"/>',
    laptop: '<rect x="-26" y="-22" width="52" height="34" rx="3"/><path d="M-36 18H36L30 24H-30z"/><path d="M-16 -10l-6 6 6 6M16 -10l6 6-6 6"/>',
    git: '<rect x="-28" y="-26" width="56" height="52" rx="6"/><circle cx="-10" cy="-12" r="5"/><circle cx="-10" cy="14" r="5"/><circle cx="12" cy="0" r="5"/><path d="M-10 -7V9M-10 -4c0 8 22 0 22 0"/>',
    cube: '<path d="M0 -28L26 -14V14L0 28L-26 14V-14z"/><path d="M-26 -14L0 0L26 -14M0 0V28"/>',
    sync: '<path d="M-20 -4a20 20 0 0 1 36 -10"/><path d="M20 4a20 20 0 0 1 -36 10"/><path class="a" d="M18 -22l2 12-11-3z"/><path class="a" d="M-18 22l-2-12 11 3z"/>',
    blocks: '<rect x="-28" y="4" width="26" height="20" rx="2"/><rect x="2" y="4" width="26" height="20" rx="2"/><rect x="-13" y="-20" width="26" height="22" rx="2"/>',
    lock: '<rect x="-22" y="-6" width="44" height="32" rx="5"/><path d="M-13 -6v-9a13 13 0 0 1 26 0v9"/><circle class="f" cx="0" cy="10" r="4"/>',
    bundle: '<rect x="-34" y="-22" width="16" height="12" rx="2"/><rect x="-34" y="-4" width="16" height="12" rx="2"/><rect x="-34" y="14" width="16" height="12" rx="2"/><path d="M-16 -16L6 0M-16 2H6M-16 20L6 4"/><rect x="8" y="-14" width="26" height="30" rx="3"/>',
    globe: '<circle r="26"/><ellipse rx="11" ry="26"/><path d="M-26 0H26M-22 -13H22M-22 13H22"/>',
    cloud: '<path d="M-24 18a14 14 0 0 1 -2 -27a18 18 0 0 1 32 -8a14 14 0 0 1 22 16a12 12 0 0 1 -4 19z"/><circle class="f" cx="-8" cy="6" r="2.5"/><circle class="f" cx="4" cy="6" r="2.5"/><circle class="f" cx="16" cy="6" r="2.5"/>',
    lb: '<rect x="-30" y="-14" width="24" height="28" rx="3"/><path d="M-6 0H6M6 0L26 -18M6 0H28M6 0L26 18"/><circle class="f" cx="28" cy="-18" r="3"/><circle class="f" cx="30" cy="0" r="3"/><circle class="f" cx="28" cy="18" r="3"/>',
    gate: '<path d="M-26 26V-6a26 26 0 0 1 52 0V26z"/><path d="M-12 26V4a12 12 0 0 1 24 0V26"/>',
    server: '<rect x="-32" y="-28" width="64" height="56" rx="5"/><path d="M-32 -9H32M-32 10H32"/><circle class="f" cx="22" cy="-18" r="3"/><circle class="f" cx="22" cy="0" r="3"/><circle class="f" cx="22" cy="19" r="3"/><path d="M-22 -18H6M-22 0H6M-22 19H6"/>',
    cache: '<ellipse cy="-20" rx="26" ry="8"/><path d="M-26 -20V20a26 8 0 0 0 52 0V-20"/><path class="a" d="M3 -10L-9 6H1L-4 20L10 1H0z"/>',
    db: '<ellipse cy="-22" rx="28" ry="9"/><path d="M-28 -22V22a28 9 0 0 0 56 0V-22"/><path d="M-28 -6a28 9 0 0 0 56 0M-28 9a28 9 0 0 0 56 0"/>',
    queue: '<rect x="-40" y="-16" width="80" height="32" rx="16"/><rect x="-28" y="-7" width="14" height="14" rx="2"/><rect x="-7" y="-7" width="14" height="14" rx="2"/><rect x="14" y="-7" width="14" height="14" rx="2"/>',
    funnel: '<path d="M-30 -22H30L8 4V22L-8 28V4z"/>',
    tsdb: '<ellipse cy="-20" rx="26" ry="8"/><path d="M-26 -20V20a26 8 0 0 0 52 0V-20"/><path d="M-18 10L-8 -2L2 6L18 -10" stroke="#e0473c"/>',
    screen: '<rect x="-34" y="-24" width="68" height="44" rx="4"/><path d="M-10 28H10M0 20V28"/><path d="M-22 10V-2M-10 10V-12M2 10V-6M14 10V-16"/>',
    bell: '<path d="M-20 14c6-6 4-14 4-22a16 16 0 0 1 32 0c0 8-2 16 4 22z"/><path d="M-6 18a6 6 0 0 0 12 0"/><path class="a" d="M14 -26l8 0 0 8z"/>',
    gear: '<circle r="16"/><circle r="6"/><path d="M0 -26V-16M0 16V26M-26 0H-16M16 0H26M-18 -18L-11 -11M11 11L18 18M18 -18L11 -11M-11 11L-18 18"/>',
    building: '<path d="M-32 26V-6L0 -26L32 -6V26z"/><path d="M-20 26V6H20V26M-20 14H20"/>',
    magnifier: '<circle cx="-6" cy="-6" r="18"/><path d="M7 7L26 26"/><path d="M-14 -8H2M-14 0H-2"/>',
    chart: '<path d="M-32 24H32M-32 24V-26"/><rect x="-24" y="2" width="10" height="22"/><rect x="-8" y="-12" width="10" height="36"/><rect x="8" y="-4" width="10" height="28"/>',
    gpu: '<rect x="-28" y="-22" width="56" height="44" rx="4"/><rect x="-14" y="-10" width="28" height="20" rx="2"/><path d="M-20 -22V-30M-6 -22V-30M8 -22V-30M20 -22V-30M-20 22V30M-6 22V30M8 22V30M20 22V30"/>',
    box: '<path d="M-26 -10L0 -24L26 -10V18L0 30L-26 18z"/><path d="M-26 -10L0 4L26 -10M0 4V30"/><path class="a" d="M22 -30l10 4-6 8z"/>',
    spark: '<rect x="-34" y="-24" width="68" height="46" rx="14"/><path d="M-10 22L-16 32L0 22"/><path class="a" d="M0 -14l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>',
    wrench: '<path d="M14 -26a14 14 0 0 0 -12 20L-24 16a6 6 0 0 0 8 8L6 2a14 14 0 0 0 20 -12l-8 4-6-2-2-6z"/>',
    pages: '<rect x="-18" y="-28" width="40" height="50" rx="3"/><rect x="-24" y="-22" width="40" height="50" rx="3"/><path d="M-16 -10H8M-16 0H8M-16 10H0"/>',
    vdb: '<ellipse cy="-20" rx="26" ry="8"/><path d="M-26 -20V20a26 8 0 0 0 52 0V-20"/><circle class="f" cx="-10" cy="0" r="3"/><circle class="f" cx="6" cy="-6" r="3"/><circle class="f" cx="10" cy="10" r="3"/><path d="M-10 0L6 -6L10 10" stroke-width="1.4"/>',
  };

  // 형광펜 칩(주제 페이지 있음)과 회색 용어를 maxW 폭으로 줄바꿈해 가운데 정렬
  function chipRow(p, x, y, ids, terms, maxW) {
    const items = ids.filter((id) => NAME[id]).map((id) => ({ id, s: NAME[id], k: 'c' })).concat(terms.map((t) => ({ s: t, k: 't' })));
    const rows = [[]]; let w = 0; const gap = 6; const g = el('g', {}, p);
    items.forEach((it) => {
      const tx = el('text', { class: it.k === 'c' ? 'cp' : 'tm' }, g); tx.textContent = it.s;
      let tw = tx.getComputedTextLength() + (it.k === 'c' ? 12 : 4);
      it.tag = it.k === 'c' && ANIM[it.id] ? '레슨' : '';
      if (it.tag) tw += 26;
      it.el = tx; it.w = tw;
      if (w + tw > maxW && rows[rows.length - 1].length) { rows.push([]); w = 0; }
      rows[rows.length - 1].push(it); w += tw + gap;
    });
    rows.forEach((r, ri) => {
      const tot = r.reduce((a, it) => a + it.w, 0) + gap * (r.length - 1); let cx = x - tot / 2; const cy = y + ri * 24;
      r.forEach((it) => {
        if (it.k === 'c') {
          const a = el('a', { href: href(it.id) }, g);
          const t = el('title', {}, a); t.textContent = `${it.s} · ${CH[it.id] || 0}장${ANIM[it.id] ? ' · 애니메이션 레슨' : ''}`;
          el('rect', { class: 'cpb', x: cx, y: cy - 14, width: it.w, height: 20, rx: 3 }, a);
          el('path', { class: 'cpu', d: `M${cx + 2} ${cy + 5}H${cx + it.w - 2}` }, a);
          a.appendChild(it.el); it.el.setAttribute('x', cx + 6); it.el.setAttribute('y', cy + 1);
          if (it.tag) { const l = el('text', { class: 'lsn', x: cx + it.w - 28, y: cy }, a); l.textContent = it.tag; }
        } else { it.el.setAttribute('x', cx + 2); it.el.setAttribute('y', cy + 1); }
        cx += it.w + gap;
      });
    });
  }

  REGIONS.forEach((r) => {
    const g = el('g', { class: 'rg', 'data-r': r.id }, gReg);
    el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 22, fill: '#f3efe3', 'fill-opacity': r.id === 'k8s' ? 0.9 : 0.55, stroke: '#8c887c', 'stroke-width': 2, 'stroke-dasharray': '10 8', filter: 'url(#rough)' }, g);
    const t = el('text', { class: 'rl', x: r.x + 18, y: r.y + 32 }, g); t.textContent = r.label;
    if (r.t) chipRow(g, r.cx || r.x + 68, r.cy || r.y + 58, r.t, [], 260);
  });

  // 서버 한 대 안: 층으로 자른 그림
  (() => {
    const r = REGIONS.find((x) => x.id === 'inside'), g = el('g', { class: 'node', 'data-id': 'inside' }, gNode);
    LAYERS.forEach((L, i) => {
      const y = r.y + 62 + i * 70;
      el('rect', { x: r.x + 22, y, width: r.w - 44, height: 58, rx: 8, fill: '#fff', stroke: '#2b2b2b', 'stroke-width': 2, filter: 'url(#rough)' }, g);
      const t = el('text', { class: 'nm', x: r.x + 36, y: y + 35, style: 'font-size:15px' }, g); t.textContent = L.n;
      chipRow(g, r.x + 340, y + 34, L.t, L.x2, 300);
    });
    N.inside = { x: r.x + r.w / 2, y: r.y + 30, n: '서버 한 대 안', t: LAYERS.flatMap((l) => l.t), x2: [], d: '요청을 받은 서버 한 대 안에서는 커널이 소켓으로 받고, 프로세스·스레드가 나눠 맡고, 언어 런타임이 코드를 돌리고, 메모리를 쓰고 치운다.' };
    g.addEventListener('click', (e) => { if (!e.target.closest('a')) showInfo('inside'); });
  })();

  Object.entries(N).forEach(([id, d]) => {
    if (id === 'inside') return;
    const g = el('g', { class: 'node', 'data-id': id, tabindex: 0, role: 'button', 'aria-label': d.n }, gNode);
    const ic = el('g', { class: 'ic', transform: `translate(${d.x},${d.y})`, filter: 'url(#rough)' }, g); ic.innerHTML = ICON[d.ic];
    const t = el('text', { class: 'nm', x: d.x, y: d.y + 52, 'text-anchor': 'middle' }, g); t.textContent = d.n;
    if (d.t.length || d.x2.length) chipRow(g, d.x, d.y + 76, d.t, d.x2, d.w || 160);
    g.addEventListener('click', (e) => { if (!e.target.closest('a')) showInfo(id); });
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.target.closest('a')) showInfo(id); });
  });

  const pt = (k) => (PTS[k] ? { x: PTS[k][0], y: PTS[k][1], r: 4 } : { x: N[k].x, y: N[k].y, r: 44 });
  A.forEach(([a, b, label, flow, bend]) => {
    const P = pt(a), Q = pt(b), dx = Q.x - P.x, dy = Q.y - P.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const sx = P.x + ux * P.r, sy = P.y + uy * P.r, ex = Q.x - ux * Q.r, ey = Q.y - uy * Q.r;
    const mx = (sx + ex) / 2 - uy * bend, my = (sy + ey) / 2 + ux * bend;
    const g = el('g', { class: 'arg', 'data-f': flow, 'data-a': a, 'data-b': b }, gArr);
    el('path', { class: 'ar', d: `M${sx} ${sy}Q${mx} ${my} ${ex} ${ey}`, 'marker-end': 'url(#ah)' }, g);
    if (label) { const t = el('text', { class: 'al', x: (sx + 2 * mx + ex) / 4, y: (sy + 2 * my + ey) / 4 - 6, 'text-anchor': 'middle' }, g); t.textContent = label; }
  });
  (() => { // 주문 서비스 → 서버 한 대 안 (빨간 점선)
    const P = N.order, bx = 400, by = 762, g = el('g', { class: 'arg', 'data-f': 'os', 'data-a': 'order' }, gArr);
    el('path', { class: 'ar map', d: `M${P.x - 30} ${P.y + 30}Q${(P.x + bx) / 2 - 220} ${(P.y + by) / 2} ${bx} ${by}`, 'marker-end': 'url(#ahr)' }, g);
  })();

  // ---------- 흐름 고르기 ----------
  const flowEl = document.getElementById('flows'), notesEl = document.getElementById('notes');
  const nodesOf = (f) => { const s = new Set(); document.querySelectorAll(`.arg[data-f="${f}"]`).forEach((g) => { s.add(g.dataset.a); if (g.dataset.b) s.add(g.dataset.b); }); if (f === 'os') { s.add('order'); s.add('inside'); } return s; };
  let cur = null;
  const mk = (label, f) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'fb'; if (f) b.dataset.f = f; b.innerHTML = label; b.onclick = () => focus(f && cur !== f ? f : null); flowEl.appendChild(b); return b; };
  mk('전체 그림', null);
  FLOWS.forEach((f, i) => mk(`<i>${i + 1}</i>${f.n}`, f.id));
  NOTES.forEach(([file, n]) => { const a = document.createElement('a'); a.href = `./chapters/${file}.html`; a.dataset.n = file; a.textContent = n; notesEl.appendChild(a); });

  function focus(f) {
    cur = f; svg.classList.toggle('focus', !!f);
    flowEl.querySelectorAll('.fb').forEach((b) => b.classList.toggle('on', (b.dataset.f || null) === f));
    notesEl.querySelectorAll('a').forEach((a) => a.classList.toggle('on', !!f && (FLOW_NOTES[f] || []).includes(a.dataset.n)));
    document.querySelectorAll('.arg').forEach((g) => { const on = g.dataset.f === f; g.classList.toggle('on', on); g.querySelector('.ar').setAttribute('marker-end', on || g.querySelector('.map') ? 'url(#ahr)' : 'url(#ah)'); });
    const ns = f ? nodesOf(f) : new Set();
    document.querySelectorAll('.node').forEach((n) => n.classList.toggle('on', ns.has(n.dataset.id)));
    document.querySelectorAll('.rg').forEach((r) => r.classList.toggle('on', !!f && (FLOW_REG[f] || []).includes(r.dataset.r)));
    try { if (f) history.replaceState(null, '', '#' + f); else history.replaceState(null, '', location.pathname); } catch (e) { /* 무시 */ }
    if (!f) return animTo(0, 0, 1800, 1150);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    ns.forEach((id) => { const d = N[id]; if (!d) return; x0 = Math.min(x0, d.x - 130); x1 = Math.max(x1, d.x + 130); y0 = Math.min(y0, d.y - 70); y1 = Math.max(y1, d.y + 140); });
    (FLOW_REG[f] || []).forEach((rid) => { const r = REGIONS.find((x) => x.id === rid); x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); });
    animTo(x0 - 20, y0 - 20, x1 - x0 + 40, y1 - y0 + 40);
  }

  // ---------- 끌기·확대 ----------
  let vb = { x: 0, y: 0, w: 1800, h: 1150 };
  const setVB = () => svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  function animTo(x, y, w, h) {
    const box = svg.getBoundingClientRect(), ar = box.width / box.height;
    if (w / h > ar) { const nh = w / ar; y -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x -= (nw - w) / 2; w = nw; }
    const s = { ...vb }, t0 = performance.now(), dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450;
    const step = (now) => { const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
      vb = { x: s.x + (x - s.x) * e, y: s.y + (y - s.y) * e, w: s.w + (w - s.w) * e, h: s.h + (h - s.h) * e }; setVB(); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function zoomAt(f, cx, cy) { const nw = Math.min(3200, Math.max(300, vb.w * f)), k = nw / vb.w; vb = { x: cx - (cx - vb.x) * k, y: cy - (cy - vb.y) * k, w: nw, h: vb.h * k }; setVB(); }
  const toSvg = (e) => { const b = svg.getBoundingClientRect(); return { x: vb.x + (e.clientX - b.left) / b.width * vb.w, y: vb.y + (e.clientY - b.top) / b.height * vb.h }; };
  svg.addEventListener('wheel', (e) => { e.preventDefault(); const p = toSvg(e); zoomAt(e.deltaY > 0 ? 1.12 : 1 / 1.12, p.x, p.y); }, { passive: false });
  let drag = null;
  svg.addEventListener('pointerdown', (e) => { if (e.target.closest('a,.node')) return; drag = { x: e.clientX, y: e.clientY, vb: { ...vb } }; svg.classList.add('drag'); svg.setPointerCapture(e.pointerId); });
  svg.addEventListener('pointermove', (e) => { if (!drag) return; const b = svg.getBoundingClientRect(); vb.x = drag.vb.x - (e.clientX - drag.x) / b.width * vb.w; vb.y = drag.vb.y - (e.clientY - drag.y) / b.height * vb.h; setVB(); });
  svg.addEventListener('pointerup', () => { drag = null; svg.classList.remove('drag'); });
  document.getElementById('zfit').onclick = () => focus(null);
  document.getElementById('zin').onclick = () => zoomAt(1 / 1.3, vb.x + vb.w / 2, vb.y + vb.h / 2);
  document.getElementById('zout').onclick = () => zoomAt(1.3, vb.x + vb.w / 2, vb.y + vb.h / 2);
  addEventListener('resize', () => focus(cur));

  // ---------- 정보 카드 ----------
  const info = document.getElementById('info');
  function showInfo(id) {
    const d = N[id];
    const chips = d.t.filter((t) => NAME[t]).map((t) => { const r = read(t), c = CH[t] || 0;
      return `<a href="${href(t)}">${NAME[t]}<small>${ANIM[t] ? '레슨 · ' : ''}${r ? `${r}/${c}장 읽음` : `${c}장`}</small></a>`; }).join('');
    const terms = d.x2.map((x) => `<span class="t">${x}</span>`).join('');
    const fl = FLOWS.filter((f) => nodesOf(f.id).has(id)).map((f) => `<button type="button" data-f="${f.id}">${f.n}</button>`).join('');
    info.innerHTML = `<button class="x" type="button" aria-label="닫기">×</button><h3>${d.n}</h3><p>${d.d}</p>${chips ? `<div class="chips">${chips}</div>` : ''}${terms ? `<div class="terms">${terms}</div>` : ''}${fl ? `<div class="fl"><span>지나가는 흐름</span>${fl}</div>` : ''}`;
    info.hidden = false;
    info.querySelector('.x').onclick = () => { info.hidden = true; };
    info.querySelectorAll('.fl button').forEach((b) => { b.onclick = () => focus(b.dataset.f); });
  }

  // 주소의 #흐름 으로 바로 열기 (예: mindmap/index.html#deploy)
  const start = (location.hash || '').slice(1);
  focus(FLOWS.some((f) => f.id === start) ? start : null);
})();
