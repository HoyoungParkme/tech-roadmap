/**
 * III-1-1.js
 * 경로: learn/sections/III-1-1.js
 * 목적: "GCP 계정 생성과 프로젝트 구조" — 건물 층 비유 + 리소스 계층 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['III-1-1'] = function SectionIII11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var layers = [
    { id: 'org', name: '조직 (Organization)', icon: '🏢', desc: '회사 전체를 묶는 최상위 단위', color: '#4361ee', bg: '#eef2ff' },
    { id: 'project', name: '프로젝트 (Project)', icon: '📁', desc: '서비스·환경을 담는 그릇 (청구·권한 격리)', color: '#f59e0b', bg: '#fffbeb' },
    { id: 'resource', name: '리소스 (Resource)', icon: '⚙️', desc: 'Cloud Run, Cloud SQL 등 실제 서비스', color: '#10b981', bg: '#ecfdf5' },
  ];

  var STEPS = [
    { title: 'STEP 1 — GCP 리소스 계층', desc: 'GCP는 조직 → 프로젝트 → 리소스의 3층 계층 구조입니다. 건물에 비유하면 조직은 건물 전체, 프로젝트는 층, 리소스는 각 방입니다. 이 구조가 청구와 권한 격리의 기본 단위입니다.', focus: 'overview' },
    { title: 'STEP 2 — 🏢 조직 (Organization)', desc: '회사 전체를 묶는 최상위 단위입니다. Google Workspace 또는 Cloud Identity와 연동됩니다. 개인 학습 시에는 없어도 됩니다.', focus: 0 },
    { title: 'STEP 3 — 📁 프로젝트 (Project)', desc: '가장 중요한 단위! 청구(비용), 권한(IAM), 리소스가 모두 프로젝트 단위로 격리됩니다. 실무에서는 dev/staging/prod를 별도 프로젝트로 분리합니다.', focus: 1 },
    { title: 'STEP 4 — ⚙️ 리소스와 프로젝트 분리 패턴', desc: 'Cloud Run, Cloud SQL, Cloud Storage 등 실제 서비스가 리소스입니다. 환경(dev/staging/prod)별로 프로젝트를 분리하면 실수로 운영 환경을 건드리는 사고를 방지할 수 있습니다.', focus: 2 },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">3층 계층 구조</div>
          <div className="space-y-2">
            {layers.map(function (layer, i) {
              return (
                <div key={layer.id}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-500"
                    style={{ borderColor: layer.color + '60', background: layer.bg, marginLeft: i * 20 + 'px' }}>
                    <span style={{ fontSize: '28px' }}>{layer.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: layer.color }}>{layer.name}</div>
                      <div className="text-xs text-slate-500">{layer.desc}</div>
                    </div>
                  </div>
                  {i < layers.length - 1 && (
                    <div className="text-center text-slate-300 text-lg" style={{ marginLeft: (i * 20 + 20) + 'px' }}>↓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    var layer = layers[focus];
    return (
      <div className="flex flex-col items-center gap-3">
        <span style={{ fontSize: '56px' }}>{layer.icon}</span>
        <h3 className="text-lg font-bold" style={{ color: layer.color }}>{layer.name}</h3>
        <div className="text-sm text-slate-500 text-center">{layer.desc}</div>
        {focus === 1 && (
          <div className="w-full mt-3 grid grid-cols-3 gap-2">
            {[
              { name: 'dev-project', color: '#22c55e', desc: '개발 (실험 OK)' },
              { name: 'staging-project', color: '#f59e0b', desc: '테스트' },
              { name: 'prod-project', color: '#ef4444', desc: '운영 (안정성)' },
            ].map(function (p) {
              return (
                <div key={p.name} className="p-2 rounded-lg border-2 text-center transition-all duration-500"
                  style={{ borderColor: p.color + '60' }}>
                  <code className="text-xs font-bold" style={{ color: p.color }}>{p.name}</code>
                  <div className="text-xs text-slate-400 mt-1">{p.desc}</div>
                </div>
              );
            })}
          </div>
        )}
        {focus === 2 && (
          <div className="w-full mt-3 grid grid-cols-2 gap-2">
            {['Cloud Run', 'Cloud SQL', 'Cloud Storage', 'BigQuery'].map(function (svc) {
              return (
                <div key={svc} className="p-2 bg-green-50 rounded-lg border border-green-200 text-center text-xs font-semibold text-green-700">
                  ⚙️ {svc}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;
    var details = {
      overview: (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">건물 비유</div>
          {[
            { label: '🏢 건물 전체', desc: '조직 — 모든 프로젝트의 상위', eq: 'Organization' },
            { label: '🏗️ 각 층', desc: '프로젝트 — 독립된 환경', eq: 'Project' },
            { label: '🚪 각 방', desc: '리소스 — 실제 서비스', eq: 'Resource' },
          ].map(function (item) {
            return (
              <div key={item.label} className="flex items-center gap-3 p-2 mb-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm">{item.label}</span>
                <div className="flex-1"><div className="text-xs text-slate-600">{item.desc}</div></div>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{item.eq}</span>
              </div>
            );
          })}
        </div>
      ),
      0: (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">조직 설정</div>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-700">기업 사용자</div>
              <div className="text-xs text-blue-600">Google Workspace 도메인으로 자동 생성</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-700">개인 학습</div>
              <div className="text-xs text-slate-500">조직 없이 바로 프로젝트 생성 가능</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>학습 팁</strong>: 개인 Gmail로 GCP 가입하면 조직 없이 바로 시작합니다.
          </div>
        </div>
      ),
      1: (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">프로젝트가 중요한 이유</div>
          <div className="space-y-2">
            {[
              { icon: '💰', text: '청구 격리 — 프로젝트별 독립 비용 추적' },
              { icon: '🔐', text: '권한 격리 — 프로젝트별 IAM 정책' },
              { icon: '🧪', text: '환경 분리 — dev에서 실험해도 prod 무영향' },
              { icon: '🗑️', text: '정리 용이 — 프로젝트 삭제 = 모든 리소스 삭제' },
            ].map(function (item) {
              return (
                <div key={item.text} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                  <span>{item.icon}</span><span className="text-slate-600">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      ),
      2: (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">프로젝트 생성 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 프로젝트 생성\ngcloud projects create my-dev-project\n\n# 프로젝트 전환\ngcloud config set project \\\n  my-dev-project\n\n# 현재 프로젝트 확인\ngcloud config get project'}</div>
          </div>
        </div>
      ),
    };
    return <div>{details[focus]}</div>;
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
