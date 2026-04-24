/**
 * III-1-2.js
 * 경로: learn/sections/III-1-2.js
 * 목적: "gcloud CLI 설치와 초기 설정" — Console vs CLI + gcloud init 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['III-1-2'] = function SectionIII12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var STEPS = [
    { title: 'STEP 1 — Console vs CLI', desc: 'GCP를 조작하는 방법은 두 가지입니다. Console(웹 UI)은 마우스로 클릭하며 조작하고, gcloud CLI(터미널)는 명령어 한 줄로 동일한 작업을 합니다. CLI가 익숙해지면 훨씬 빠릅니다.', focus: 'compare' },
    { title: 'STEP 2 — 🔑 계정 인증', desc: 'gcloud init 실행 시 브라우저가 열리고 구글 계정 로그인을 요청합니다. "이 터미널에서 내 GCP를 조작해도 된다"는 허가를 주는 단계입니다.', focus: 0 },
    { title: 'STEP 3 — 📁 프로젝트 선택', desc: '내 계정에 연결된 프로젝트 목록이 표시됩니다. 작업할 프로젝트 번호를 입력합니다. 이후 모든 gcloud 명령이 이 프로젝트를 기본으로 사용합니다.', focus: 1 },
    { title: 'STEP 4 — 🌍 기본 리전 설정', desc: '기본 리전(예: asia-northeast3)을 설정하면 --region 플래그를 매번 안 써도 됩니다. 서울 리전을 기본으로 설정하는 것이 일반적입니다.', focus: 2 },
  ];

  var initSteps = [
    { num: '1', title: '계정 인증', icon: '🔑', desc: '브라우저 → 구글 로그인 → 허가', cmd: 'gcloud auth login' },
    { num: '2', title: '프로젝트 선택', icon: '📁', desc: '프로젝트 목록에서 번호 입력', cmd: 'gcloud config set project PROJECT_ID' },
    { num: '3', title: '기본 리전', icon: '🌍', desc: '--region 매번 안 써도 됨', cmd: 'gcloud config set compute/region asia-northeast3' },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'compare') {
      return (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">GCP 조작 방법</div>
          {[
            { icon: '🖱️', name: 'Console (웹)', color: '#f59e0b', bg: '#fffbeb', pros: ['시각적', '탐색 쉬움'], cons: ['느림', '반복 작업 비효율'] },
            { icon: '⌨️', name: 'gcloud CLI (터미널)', color: '#3b82f6', bg: '#eff6ff', pros: ['빠름', '자동화 가능'], cons: ['명령어 암기 필요'] },
          ].map(function (tool) {
            return (
              <div key={tool.name} className="p-3 rounded-lg border-2" style={{ borderColor: tool.color + '60', background: tool.bg }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                  <span className="font-bold text-sm" style={{ color: tool.color }}>{tool.name}</span>
                </div>
                <div className="flex gap-3 text-xs">
                  <div className="flex-1">{tool.pros.map(function (p) { return <div key={p} className="text-green-600">✓ {p}</div>; })}</div>
                  <div className="flex-1">{tool.cons.map(function (c) { return <div key={c} className="text-red-400">✗ {c}</div>; })}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // gcloud init 단계별 포커스
    var step = initSteps[focus];
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full space-y-2">
          {initSteps.map(function (s, i) {
            var isActive = i === focus;
            return (
              <div key={s.num} className={'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-500 ' +
                (isActive ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 scale-105 shadow-sm' : 'border-slate-200 bg-white')}>
                <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' +
                  (isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500')}>{s.num}</div>
                <span style={{ fontSize: '20px' }}>{s.icon}</span>
                <div>
                  <div className={'text-sm font-bold ' + (isActive ? 'text-blue-700' : 'text-slate-400')}>{s.title}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;

    if (focus === 'compare') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">같은 작업, 다른 방법</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400">Console vs CLI</div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Console: 10번 클릭\n# CLI: 한 줄\n\ngcloud run deploy my-api \\\n  --image gcr.io/myproject/api \\\n  --region asia-northeast3\n\n# 자동화: 스크립트로 반복 실행\n# CI/CD: GitHub Actions에서 호출'}</div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>권장</strong>: 처음엔 Console로 이해 → CLI로 전환 → 스크립트로 자동화
          </div>
        </div>
      );
    }

    var step = initSteps[focus];
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">실행 명령어</div>
        <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">Terminal</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
            {focus === 0 && '# 최초 1회 실행\ngcloud init\n\n# 또는 개별 단계:\ngcloud auth login\n# → 브라우저가 열림\n# → 구글 계정 로그인\n# → "허용" 클릭'}
            {focus === 1 && '# 프로젝트 목록 확인\ngcloud projects list\n\n# 프로젝트 선택\ngcloud config set project \\\n  my-first-project\n\n# 확인\ngcloud config get project\n# → my-first-project'}
            {focus === 2 && '# 서울 리전 기본 설정\ngcloud config set \\\n  compute/region asia-northeast3\ngcloud config set \\\n  run/region asia-northeast3\n\n# 확인\ngcloud config list\n# → region = asia-northeast3'}
          </div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
