/**
 * IV-1-1.js
 * 경로: learn/sections/IV-1-1.js
 * 목적: "Cloud Run 요청 흐름" — cloud-run-flow.html 패턴을 SPA에 내장한 6단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IV-1-1'] = function SectionIV11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var components = [
    { id: 'client', label: 'Client (HTTPS)', sub: 'POST /api/users', step: 'STEP 1' },
    { id: 'lb', label: 'Load Balancer', sub: 'SSL 종료 · 라우팅', step: 'STEP 2' },
    { id: 'cr', label: 'Cloud Run', sub: 'Stateless · 자동 스케일', step: 'STEP 3' },
    { id: 'sql', label: 'Cloud SQL', sub: 'Private IP 연결', step: 'STEP 4' },
    { id: 'resp', label: '응답 반환', sub: '200 OK · JSON', step: 'STEP 5' },
    { id: 'log', label: 'Cloud Logging', sub: '자동 기록', step: 'STEP 6' },
  ];

  var STEPS = [
    { title: 'STEP 1 — 클라이언트 요청', desc: '브라우저나 앱이 HTTPS로 요청을 보냅니다. TLS 암호화가 적용된 안전한 통신입니다.', states: { client: 'sending', lb: 'idle', cr: 'idle', sql: 'idle', resp: 'idle', log: 'idle' } },
    { title: 'STEP 2 — Google Load Balancer', desc: 'Google 글로벌 로드 밸런서가 SSL을 종료하고, 가장 가까운 리전의 Cloud Run으로 라우팅합니다.', states: { client: 'waiting', lb: 'active', cr: 'idle', sql: 'idle', resp: 'idle', log: 'idle' } },
    { title: 'STEP 3 — Cloud Run 인스턴스', desc: 'Stateless 컨테이너가 요청을 처리합니다. 트래픽이 많으면 자동 Scale Out, 없으면 Scale to Zero.', states: { client: 'waiting', lb: 'done', cr: 'active', sql: 'idle', resp: 'idle', log: 'idle' } },
    { title: 'STEP 4 — Cloud SQL (Private IP)', desc: 'Cloud Run이 Private IP를 통해 Cloud SQL에 데이터를 조회/저장합니다. 외부 인터넷을 거치지 않아 안전합니다.', states: { client: 'waiting', lb: 'done', cr: 'waiting', sql: 'active', resp: 'idle', log: 'idle' } },
    { title: 'STEP 5 — 응답 반환', desc: 'Cloud SQL 결과를 받은 Cloud Run이 JSON 응답을 클라이언트에 반환합니다.', states: { client: 'received', lb: 'done', cr: 'done', sql: 'done', resp: 'active', log: 'idle' } },
    { title: 'STEP 6 — Cloud Logging', desc: '요청 처리 과정이 자동으로 Cloud Logging에 기록됩니다. gcloud logging read로 확인 가능합니다.', states: { client: 'received', lb: 'done', cr: 'done', sql: 'done', resp: 'done', log: 'active' } },
  ];

  function renderDiagram(stepData) {
    var states = stepData.states;
    return (
      <div className="space-y-2">
        {components.map(function (comp, i) {
          var state = states[comp.id];
          var isLastRow = i >= 4;
          return (
            <div key={comp.id}>
              {isLastRow && i === 4 && <div className="grid grid-cols-2 gap-2">
                {components.slice(4).map(function (c2) {
                  return (
                    <div key={c2.id} className={getStatusClass(states[c2.id], 'p-3 rounded-lg border-2 text-center')}>
                      <div className="text-xs opacity-60 uppercase tracking-widest">{c2.step}</div>
                      <div className="text-sm font-bold">{c2.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{c2.sub}</div>
                    </div>
                  );
                })}
              </div>}
              {!isLastRow && (
                <>
                  <div className="flex justify-center">
                    <div className={getStatusClass(state, 'px-4 py-2 rounded-lg border-2 text-center w-52')}>
                      <div className="text-xs opacity-60 uppercase tracking-widest">{comp.step}</div>
                      <div className="text-sm font-bold">{comp.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{comp.sub}</div>
                      {state === 'active' && comp.id === 'cr' && (
                        <div className="mt-1 flex justify-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay:'0ms'}}></div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay:'150ms'}}></div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay:'300ms'}}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  {i < 3 && <div className="text-center text-slate-300">↓</div>}
                </>
              )}
            </div>
          );
        }).filter(function (_, i) { return i <= 4; })}
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var cliCode = [
      '# 1. Cloud Run 배포\ngcloud run deploy my-api \\\n  --image gcr.io/myproject/my-api \\\n  --region asia-northeast3 \\\n  --allow-unauthenticated',
      '# 2. Cloud SQL 연결 설정\ngcloud run services update my-api \\\n  --add-cloudsql-instances \\\n  myproject:asia-northeast3:mydb',
      '# 3. 로그 확인\ngcloud logging read \\\n  "resource.type=cloud_run_revision" \\\n  --limit 10',
    ];
    var activeCode = stepIdx <= 2 ? 0 : stepIdx <= 3 ? 1 : 2;

    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">관련 CLI</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud CLI</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed">
            {cliCode.map(function (code, i) {
              return (
                <div key={i} className={'p-2 rounded mb-1 whitespace-pre-wrap transition-all duration-500 ' +
                  (i === activeCode ? 'bg-blue-900/60 border-l-4 border-blue-400' : 'border-l-4 border-transparent opacity-50')}>
                  {code}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
