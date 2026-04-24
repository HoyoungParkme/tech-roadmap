/**
 * I-1-2.js
 * 경로: learn/sections/I-1-2.js
 * 목적: "클라우드가 해결하는 세 가지 문제" — Before/After 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['I-1-2'] = function SectionI12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var problems = [
    {
      icon: '💰', title: '초기 비용', color: '#f59e0b', bgColor: '#fffbeb',
      keyword: 'Pay-as-you-go',
      description: '서버를 사는 대신 빌린다. 종량제로 쓴 만큼만 낸다.',
      before: { text: '서비스 시작 전 서버 구매 필요', icon: '💸', detail: '수천만 원 초기 투자, 사용 안 해도 감가상각' },
      after: { text: '초기 투자 없이 바로 시작', icon: '💳', detail: '신용카드 등록 → 바로 시작, 쓴 만큼만 과금' },
    },
    {
      icon: '📈', title: '확장성', color: '#10b981', bgColor: '#ecfdf5',
      keyword: 'Auto Scaling',
      description: 'Auto Scaling이 자동으로 서버를 늘리고 줄인다.',
      before: { text: '새벽에 서버 수동 추가', icon: '😰', detail: '트래픽 예측 실패 → 서비스 다운 or 과잉 투자' },
      after: { text: '트래픽에 따라 자동 확장', icon: '🚀', detail: '급증 시 자동으로 서버 추가, 줄면 자동 축소' },
    },
    {
      icon: '🌐', title: '가용성', color: '#3b82f6', bgColor: '#eff6ff',
      keyword: 'Multi-Region',
      description: '전 세계 리전에 분산 운영. 한 곳 장애에도 서비스 유지.',
      before: { text: '서울 서버 장애 = 전체 중단', icon: '🔥', detail: '단일 장애점(SPOF), 복구에 수 시간' },
      after: { text: '일본 리전이 자동으로 이어받음', icon: '🛡️', detail: '자동 페일오버, 99.95% SLA 보장' },
    },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 세 가지 문제',
      desc: '온프레미스 환경에서 가장 흔한 세 가지 고통이 있습니다: 높은 초기 비용, 수동 확장, 단일 장애점. 클라우드는 이 세 가지를 근본적으로 해결합니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 💰 초기 비용 → Pay-as-you-go',
      desc: problems[0].description + ' 서버를 "사는" 대신 "빌리는" 모델로, 사용하지 않으면 비용이 0에 수렴합니다.',
      focus: 0,
    },
    {
      title: 'STEP 3 — 📈 확장성 → Auto Scaling',
      desc: problems[1].description + ' 블랙프라이데이, 수강신청 같은 트래픽 급증에 수동으로 대응할 필요가 없습니다.',
      focus: 1,
    },
    {
      title: 'STEP 4 — 🌐 가용성 → Multi-Region',
      desc: problems[2].description + ' 서울 리전에 장애가 나면 도쿄 리전이 자동으로 트래픽을 이어받습니다.',
      focus: 2,
    },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">온프레미스의 3가지 고통</div>
          {problems.map(function (p, i) {
            return (
              <div key={p.title} className="flex items-center gap-3 w-full p-3 rounded-lg border-2 border-slate-200 bg-white transition-all duration-500">
                <span style={{ fontSize: '32px' }}>{p.icon}</span>
                <div>
                  <div className="font-bold text-sm" style={{ color: p.color }}>{p.title}</div>
                  <div className="text-xs text-slate-500">{p.before.text}</div>
                </div>
                <div className="ml-auto text-lg text-slate-300">→</div>
                <div className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: p.bgColor, color: p.color }}>
                  {p.keyword}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // 개별 문제 포커스: Before → After 시각화
    var p = problems[focus];
    return (
      <div className="flex flex-col items-center gap-4">
        <span style={{ fontSize: '48px' }}>{p.icon}</span>
        <h3 className="text-lg font-bold" style={{ color: p.color }}>{p.title}</h3>

        {/* Before */}
        <div className="w-full p-3 rounded-lg border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{p.before.icon}</span>
            <span className="text-xs font-bold text-red-500 uppercase">Before</span>
          </div>
          <div className="text-sm font-semibold text-red-700">{p.before.text}</div>
          <div className="text-xs text-red-500 mt-1">{p.before.detail}</div>
        </div>

        {/* 화살표 */}
        <div className="text-2xl text-slate-300">↓</div>

        {/* After */}
        <div className="w-full p-3 rounded-lg border-2 border-green-200 bg-green-50 ring-2 ring-green-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{p.after.icon}</span>
            <span className="text-xs font-bold text-green-600 uppercase">After</span>
          </div>
          <div className="text-sm font-semibold text-green-700">{p.after.text}</div>
          <div className="text-xs text-green-600 mt-1">{p.after.detail}</div>
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">클라우드의 해결책</div>
          {problems.map(function (p) {
            return (
              <div key={p.title} className="mb-3 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: p.color }}>{p.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: p.bgColor, color: p.color }}>{p.keyword}</span>
                </div>
                <div className="text-xs text-slate-500">{p.description}</div>
              </div>
            );
          })}
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 text-center">
            <strong>다음 단계에서 하나씩 자세히 봅니다</strong>
          </div>
        </div>
      );
    }

    var p = problems[focus];
    var examples = {
      0: { title: 'GCP 비용 예시', items: ['Cloud Run: 200만 요청/월 무료', 'Cloud Storage: 5GB 무료', 'Compute Engine: e2-micro 1개 무료', '신규 가입 시 $300 크레딧 90일'] },
      1: { title: 'Auto Scaling 작동', items: ['평소: 인스턴스 2개', '트래픽 2배: 자동으로 4개', '트래픽 10배: 자동으로 20개', '새벽: 다시 2개로 축소'] },
      2: { title: 'Multi-Region 구성', items: ['서울(asia-northeast3): Primary', '도쿄(asia-northeast1): Standby', '장애 감지: 30초 이내', '자동 페일오버: 트래픽 전환'] },
    };

    var ex = examples[focus];
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">{ex.title}</div>
        <div className="space-y-2">
          {ex.items.map(function (item, i) {
            return (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: p.color }}>
                  {i + 1}
                </div>
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-3 rounded-lg text-xs text-center font-semibold" style={{ background: p.bgColor, color: p.color }}>
          핵심 키워드: {p.keyword}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
