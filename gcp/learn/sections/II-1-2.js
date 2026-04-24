/**
 * II-1-2.js
 * 경로: learn/sections/II-1-2.js
 * 목적: "GCP의 특화 영역" — BigQuery/Vertex AI/GKE 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['II-1-2'] = function SectionII12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var services = [
    {
      name: 'BigQuery', icon: '📊', category: '데이터 분석',
      color: '#3b82f6', bgColor: '#eff6ff',
      origin: '구글 광고 분석팀 내부 시스템에서 탄생',
      desc: 'PB 규모 데이터를 SQL로 수초 만에 분석',
      features: ['SQL만 알면 PB급 분석 가능', '서버리스 — 인프라 관리 불필요', '1TB 쿼리/월 무료', '실시간 스트리밍 분석 지원'],
      useCase: '일별 매출 분석, 로그 분석, A/B 테스트 결과 집계',
    },
    {
      name: 'Vertex AI', icon: '🤖', category: 'AI · ML',
      color: '#8b5cf6', bgColor: '#f5f3ff',
      origin: '구글 AI 연구팀 통합 플랫폼',
      desc: '학습 → 배포 → 모니터링을 하나의 플랫폼에서',
      features: ['AutoML — 코드 없이 모델 학습', 'Model Garden — 사전학습 모델', '엔드포인트 배포 원클릭', 'Gemini API 통합'],
      useCase: '이미지 분류, 텍스트 요약, 추천 시스템',
    },
    {
      name: 'GKE', icon: '⚙️', category: '컨테이너',
      color: '#10b981', bgColor: '#ecfdf5',
      origin: 'Kubernetes를 만든 구글이 직접 운영',
      desc: '관리형 K8s 클러스터 — 설치·유지보수 불필요',
      features: ['Autopilot 모드 — 노드 관리 자동화', 'Google 내부와 동일한 인프라', 'Cloud Run과 자연스러운 연동', '글로벌 로드 밸런싱 기본 제공'],
      useCase: '마이크로서비스 운영, 대규모 배포, 멀티 클라우드',
    },
  ];

  var STEPS = [
    { title: 'STEP 1 — GCP의 세 가지 얼굴', desc: 'GCP가 다른 클라우드와 차별화되는 세 가지 서비스가 있습니다. 모두 구글이 내부에서 먼저 사용하고, 검증된 후 서비스로 공개한 것입니다.', focus: 'overview' },
    { title: 'STEP 2 — 📊 BigQuery: 데이터 분석의 끝판왕', desc: services[0].desc + '. ' + services[0].origin + '. SQL만 알면 PB급 데이터를 수초 만에 분석할 수 있습니다.', focus: 0 },
    { title: 'STEP 3 — 🤖 Vertex AI: 통합 ML 플랫폼', desc: services[1].desc + '. ' + services[1].origin + '. Gemini API도 여기서 사용합니다.', focus: 1 },
    { title: 'STEP 4 — ⚙️ GKE: Kubernetes 본가', desc: services[2].desc + '. ' + services[2].origin + '. 대규모 컨테이너 오케스트레이션의 표준입니다.', focus: 2 },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">GCP 3대 특화 서비스</div>
          <div className="flex gap-6 items-center">
            {services.map(function (s) {
              return (
                <div key={s.name} className="text-center p-3 rounded-xl border-2 border-slate-200 bg-white transition-all duration-500 hover:shadow-md" style={{ width: '100px' }}>
                  <span style={{ fontSize: '36px' }}>{s.icon}</span>
                  <div className="text-sm font-bold mt-1" style={{ color: s.color }}>{s.name}</div>
                  <div className="text-xs text-slate-400">{s.category}</div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-slate-400 text-center mt-2">
            모두 구글 내부 기술에서 탄생했습니다
          </div>
        </div>
      );
    }

    var s = services[focus];
    return (
      <div className="flex flex-col items-center gap-3">
        <span style={{ fontSize: '48px' }}>{s.icon}</span>
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: s.color }}>{s.category}</div>
        <h3 className="text-xl font-bold text-slate-800">{s.name}</h3>
        <div className="text-xs text-slate-400 italic text-center">{s.origin}</div>
        <div className="w-full mt-3 space-y-2">
          {s.features.map(function (f, i) {
            return (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border-2 transition-all duration-500"
                style={{ borderColor: s.color + '40', background: s.bgColor }}>
                <span className="text-sm" style={{ color: s.color }}>✦</span>
                <span className="text-sm text-slate-700">{f}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">왜 GCP인가?</div>
          <div className="space-y-3">
            {[
              { label: '구글 검색', desc: '전 세계 검색의 92%를 처리하는 인프라', icon: '🔍' },
              { label: 'YouTube', desc: '매일 10억 시간 영상 스트리밍', icon: '📺' },
              { label: 'Gmail', desc: '18억 명이 사용하는 이메일', icon: '✉️' },
            ].map(function (item) {
              return (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-xs text-red-700 mt-3 text-center">
            이 인프라 위에서 돌아가는 것이 GCP입니다
          </div>
        </div>
      );
    }

    var s = services[focus];
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">활용 사례</div>
        <div className="p-4 rounded-xl border-2 mb-3" style={{ borderColor: s.color + '60', background: s.bgColor }}>
          <div className="text-sm text-slate-700 text-center">{s.useCase}</div>
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center mt-4">핵심 설명</div>
        <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 leading-relaxed">
          {s.desc}
        </div>
        <div className="mt-3 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: s.bgColor, color: s.color }}>
            {s.name} — {s.category}
          </span>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
