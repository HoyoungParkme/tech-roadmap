/**
 * III-2-1.js
 * 경로: learn/sections/III-2-1.js
 * 목적: "Cloud Console 주요 화면" — 관제탑 비유 + UI 구성 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['III-2-1'] = function SectionIII21() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var uiElements = [
    { area: '왼쪽 내비게이션', icon: '📋', desc: 'GCP 서비스 목록 (카테고리별 정리)', color: '#4361ee', detail: 'Compute Engine, Cloud Run, Cloud SQL 등을 카테고리별로 찾을 수 있습니다.' },
    { area: '상단 검색창', icon: '🔍', desc: '서비스·리소스를 이름으로 빠른 이동', color: '#f59e0b', detail: '"Cloud Run" 입력 → 바로 이동. 가장 빠른 접근 방법입니다.' },
    { area: '프로젝트 선택기', icon: '📁', desc: '현재 작업 중인 프로젝트 전환', color: '#10b981', detail: '상단 드롭다운에서 프로젝트를 전환합니다. 프로젝트 ID도 여기서 확인.' },
    { area: 'Cloud Shell', icon: '⌨️', desc: '브라우저 안 터미널 (설치 불필요)', color: '#8b5cf6', detail: 'gcloud, kubectl, docker 등이 미리 설치된 가상 터미널. 바로 명령어 실행 가능.' },
  ];

  var STEPS = [
    { title: 'STEP 1 — Console 전체 모습', desc: 'Cloud Console은 GCP의 "관제탑"입니다. 왼쪽 네비, 상단 검색, 프로젝트 선택, Cloud Shell — 이 네 가지만 알면 어디든 갈 수 있습니다.', focus: 'overview' },
    { title: 'STEP 2 — 📋 왼쪽 네비게이션 + 🔍 검색', desc: uiElements[0].detail + ' ' + uiElements[1].detail, focus: 0 },
    { title: 'STEP 3 — 📁 프로젝트 선택기', desc: uiElements[2].detail + ' 잘못된 프로젝트에서 작업하면 비용이 엉뚱한 곳에 청구됩니다.', focus: 1 },
    { title: 'STEP 4 — ⌨️ Cloud Shell', desc: uiElements[3].detail + ' 로컬에 gcloud CLI를 설치하기 전에 Cloud Shell로 먼저 연습하세요.', focus: 2 },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;
    var activeIdx = focus === 'overview' ? -1 : focus;

    return (
      <div>
        {/* Console 모형 */}
        <div className="rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
          {/* 상단 바 */}
          <div className="bg-slate-800 px-3 py-2 flex items-center gap-2 text-xs">
            <span>☁️</span>
            <span className="text-cyan-400 font-bold">Google Cloud</span>
            <div className={'ml-2 px-2 py-1 rounded text-slate-400 transition-all duration-500 ' +
              (activeIdx === 1 ? 'bg-green-900 ring-2 ring-green-400 text-green-300' : 'bg-slate-700')}>
              📁 my-project
            </div>
            <div className={'ml-auto px-2 py-1 rounded transition-all duration-500 ' +
              (activeIdx === 0 ? 'bg-amber-900 ring-2 ring-amber-400 text-amber-300' : 'bg-slate-700 text-slate-400')}>
              🔍 검색...
            </div>
            <div className={'px-2 py-1 rounded transition-all duration-500 ' +
              (activeIdx === 2 ? 'bg-purple-600 ring-2 ring-purple-300 text-white' : 'bg-blue-700 text-white')}>
              ⌨️ Shell
            </div>
          </div>
          {/* 본문 */}
          <div className="flex" style={{ minHeight: '140px' }}>
            <div className={'border-r border-slate-200 p-2 transition-all duration-500 ' +
              (activeIdx === 0 ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-slate-50')} style={{ width: '120px' }}>
              <div className="text-xs text-slate-400 font-bold mb-1">SERVICES</div>
              {['Compute Engine', 'Cloud Run', 'Cloud SQL', 'Storage', 'BigQuery'].map(function (s) {
                return <div key={s} className="text-xs text-slate-500 py-0.5">{s}</div>;
              })}
            </div>
            <div className="flex-1 p-4 flex items-center justify-center text-sm text-slate-400">
              대시보드 · 리소스 목록
            </div>
          </div>
        </div>
        {/* 현재 강조 영역 표시 */}
        {activeIdx >= 0 && (
          <div className="mt-3 p-2 rounded-lg text-center text-sm font-semibold" style={{ background: uiElements[activeIdx + (activeIdx === 0 ? 0 : 1)].color + '15', color: uiElements[activeIdx + (activeIdx === 0 ? 0 : 1)].color }}>
            {uiElements[activeIdx === 0 ? 0 : activeIdx === 1 ? 2 : 3].area} 영역 강조 중
          </div>
        )}
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">4가지 핵심 영역</div>
          {uiElements.map(function (el) {
            return (
              <div key={el.area} className="flex items-center gap-3 p-2 mb-2 rounded-lg border border-slate-200 bg-slate-50">
                <span style={{ fontSize: '20px' }}>{el.icon}</span>
                <div>
                  <div className="text-sm font-bold" style={{ color: el.color }}>{el.area}</div>
                  <div className="text-xs text-slate-500">{el.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    var tips = [
      { title: '빠른 접근 팁', items: ['/ 키로 검색창 바로 진입', '"Cloud Run" 입력 → 즉시 이동', '즐겨찾기 서비스 Pin 가능', '최근 사용 서비스 상단에 표시'] },
      { title: '프로젝트 관리 팁', items: ['상단 드롭다운에서 전환', '프로젝트 ID는 전 세계 유일', 'Billing 연결 상태 확인', '잘못된 프로젝트 = 과금 사고'] },
      { title: 'Cloud Shell 팁', items: ['$HOME에 5GB 영구 저장소', 'gcloud, kubectl, docker 내장', 'Ctrl+L로 화면 클리어', '웹 미리보기 포트 8080 지원'] },
    ];

    var tip = tips[focus];
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">{tip.title}</div>
        <div className="space-y-2">
          {tip.items.map(function (item, i) {
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <span className="text-blue-500">•</span>
                <span className="text-slate-600">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
