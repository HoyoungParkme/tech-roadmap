/**
 * III-1-3.js
 * 경로: learn/sections/III-1-3.js
 * 목적: "리전과 존 선택하기" — 물류 창고 비유 + 리전/존 계층 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['III-1-3'] = function SectionIII13() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var regions = [
    { code: 'asia-northeast3', name: '서울', flag: '🇰🇷', latency: '~2ms', highlight: true },
    { code: 'asia-northeast1', name: '도쿄', flag: '🇯🇵', latency: '~30ms', highlight: false },
    { code: 'us-central1', name: '미국 중부', flag: '🇺🇸', latency: '~150ms', highlight: false },
    { code: 'europe-west1', name: '벨기에', flag: '🇧🇪', latency: '~250ms', highlight: false },
  ];

  var zones = ['asia-northeast3-a', 'asia-northeast3-b', 'asia-northeast3-c'];

  var STEPS = [
    { title: 'STEP 1 — 리전이란?', desc: '리전(Region)은 GCP 데이터센터가 위치한 지역입니다. 사용자와 가까운 리전을 선택하면 응답 속도가 빨라집니다. 한국 서비스라면 서울(asia-northeast3)을 선택합니다.', focus: 'regions' },
    { title: 'STEP 2 — 🇰🇷 서울 리전 선택', desc: '서울 리전(asia-northeast3)은 한국 사용자에게 ~2ms 지연으로 가장 빠릅니다. 대부분의 한국향 서비스는 서울 리전을 기본으로 사용합니다.', focus: 'seoul' },
    { title: 'STEP 3 — 존(Zone)이란?', desc: '하나의 리전 안에 여러 존(Zone)이 있습니다. 존은 독립된 전력·냉방·네트워크를 가진 데이터센터 집합입니다. 서울 리전에는 a, b, c 세 개의 존이 있습니다.', focus: 'zones' },
    { title: 'STEP 4 — 선택 기준', desc: '리전 선택: 사용자 위치 기준. 존 선택: 고가용성이 필요하면 여러 존에 분산. 학습용이라면 서울 리전의 아무 존이나 선택하면 됩니다.', focus: 'criteria' },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'regions') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">주요 GCP 리전</div>
          <div className="grid grid-cols-2 gap-3">
            {regions.map(function (r) {
              return (
                <div key={r.code} className={'p-3 rounded-lg border-2 text-center transition-all duration-500 ' +
                  (r.highlight ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 scale-105' : 'border-slate-200 bg-white')}>
                  <span style={{ fontSize: '28px' }}>{r.flag}</span>
                  <div className={'text-sm font-bold mt-1 ' + (r.highlight ? 'text-blue-600' : 'text-slate-600')}>{r.name}</div>
                  <code className="text-xs text-slate-400">{r.code}</code>
                  <div className={'text-xs mt-1 font-semibold ' + (r.highlight ? 'text-blue-500' : 'text-slate-400')}>지연: {r.latency}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'seoul') {
      return (
        <div className="flex flex-col items-center gap-3">
          <span style={{ fontSize: '56px' }}>🇰🇷</span>
          <h3 className="text-lg font-bold text-blue-600">서울 리전</h3>
          <code className="text-sm text-slate-500">asia-northeast3</code>
          <div className="w-full mt-3 space-y-2">
            {[
              { label: '지연 시간', value: '~2ms (국내)' },
              { label: '존 수', value: '3개 (a, b, c)' },
              { label: '주요 서비스', value: 'Cloud Run, GKE, Cloud SQL, BigQuery' },
              { label: '적합 대상', value: '한국향 서비스 전부' },
            ].map(function (item) {
              return (
                <div key={item.label} className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                  <span className="font-semibold text-blue-700">{item.label}</span>
                  <span className="text-slate-600">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'zones') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">서울 리전 내 3개 존</div>
          <div className="w-full p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="text-center text-sm font-bold text-blue-600 mb-3">🇰🇷 asia-northeast3</div>
            <div className="grid grid-cols-3 gap-3">
              {zones.map(function (z) {
                return (
                  <div key={z} className="p-3 bg-white rounded-lg border-2 border-purple-200 text-center shadow-sm">
                    <span style={{ fontSize: '24px' }}>🏭</span>
                    <code className="block text-xs font-bold text-purple-600 mt-1">{z.split('-').pop()}</code>
                    <div className="text-xs text-slate-400 mt-0.5">독립 전력/냉방</div>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-xs text-blue-500 mt-2">한 존 장애 → 다른 존 영향 없음</div>
          </div>
        </div>
      );
    }

    // criteria
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">선택 가이드</div>
        <div className="space-y-3">
          {[
            { q: '사용자가 한국?', a: '서울 (asia-northeast3)', icon: '🇰🇷', color: '#3b82f6' },
            { q: '고가용성 필요?', a: '2개 이상 존에 분산', icon: '🛡️', color: '#10b981' },
            { q: '학습/실험용?', a: '서울 리전 아무 존', icon: '🧪', color: '#f59e0b' },
            { q: '글로벌 서비스?', a: '멀티 리전 구성', icon: '🌍', color: '#8b5cf6' },
          ].map(function (item) {
            return (
              <div key={item.q} className="flex items-center gap-3 p-3 rounded-lg border-2" style={{ borderColor: item.color + '40' }}>
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-700">{item.q}</div>
                  <div className="text-xs" style={{ color: item.color }}>{item.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} />;
};
