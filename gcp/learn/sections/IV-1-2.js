/**
 * IV-1-2.js — "Dockerfile과 컨테이너 이미지" — 빌드 파이프라인 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IV-1-2'] = function SectionIV12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var pipeline = [
    { id: 'write', icon: '📝', label: 'Dockerfile 작성', desc: '베이스 이미지 + 패키지 + 시작 명령' },
    { id: 'build', icon: '🔨', label: 'gcloud builds submit', desc: 'GCP 서버에서 이미지 빌드' },
    { id: 'store', icon: '📦', label: 'Artifact Registry', desc: '빌드된 이미지 저장소' },
    { id: 'deploy', icon: '🚀', label: 'Cloud Run 배포', desc: '이미지를 내려받아 실행' },
  ];

  var STEPS = [
    { title: 'STEP 1 — 컨테이너 빌드 전체 흐름', desc: 'Dockerfile 작성 → GCP에서 빌드 → Artifact Registry 저장 → Cloud Run 배포. 4단계 파이프라인입니다.', active: -1 },
    { title: 'STEP 2 — 📝 Dockerfile 작성', desc: '어떤 OS를 쓸지(베이스 이미지), 어떤 패키지를 설치할지, 어떻게 실행할지를 정의하는 레시피입니다.', active: 0 },
    { title: 'STEP 3 — 🔨 빌드 & 📦 저장', desc: 'gcloud builds submit으로 GCP Cloud Build가 이미지를 빌드하고, Artifact Registry에 자동 저장합니다.', active: 1 },
    { title: 'STEP 4 — 🚀 Cloud Run 배포', desc: 'gcloud run deploy로 Artifact Registry의 이미지를 Cloud Run에 배포합니다. URL이 즉시 생성됩니다.', active: 3 },
  ];

  var codeBlocks = [
    '# Dockerfile\nFROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "main:app", \\\n     "--host", "0.0.0.0", \\\n     "--port", "8080"]',
    '# 빌드 + 저장 (한 줄)\ngcloud builds submit \\\n  --tag gcr.io/myproject/my-api',
    '',
    '# 배포 (한 줄)\ngcloud run deploy my-api \\\n  --image gcr.io/myproject/my-api \\\n  --region asia-northeast3\n\n# → Service URL:\n# https://my-api-xxxx.run.app',
  ];

  function renderDiagram(stepData) {
    var active = stepData.active;
    return (
      <div className="space-y-2">
        {pipeline.map(function (p, i) {
          var state = active === -1 ? 'idle' : i === active ? 'active' : i < active ? 'done' : (active === 1 && i === 2) ? 'active' : 'idle';
          return (
            <div key={p.id}>
              <div className={getStatusClass(state, 'flex items-center gap-3 p-3 rounded-lg border-2')}>
                <span style={{ fontSize: '28px' }}>{p.icon}</span>
                <div>
                  <div className="text-sm font-bold">{p.label}</div>
                  <div className="text-xs opacity-70">{p.desc}</div>
                </div>
              </div>
              {i < pipeline.length - 1 && <div className="text-center text-slate-300 text-lg">↓</div>}
            </div>
          );
        })}
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var code = codeBlocks[stepIdx];
    if (!code) {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">택배 비유</div>
          <div className="space-y-2">
            {[
              { emoji: '📝', label: 'Dockerfile', eq: '포장 설명서' },
              { emoji: '🔨', label: 'Cloud Build', eq: '포장 공장' },
              { emoji: '📦', label: 'Artifact Registry', eq: '물류 창고' },
              { emoji: '🚀', label: 'Cloud Run', eq: '배달 완료' },
            ].map(function (item) {
              return (
                <div key={item.label} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span>{item.emoji}</span>
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <span className="text-xs text-slate-400 ml-auto">= {item.eq}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">코드</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">Terminal</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{code}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
