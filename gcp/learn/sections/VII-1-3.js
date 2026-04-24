/**
 * VII-1-3.js
 * 경로: learn/sections/VII-1-3.js
 * 목적: "Traffic Splitting" — 카나리 배포와 트래픽 분산 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VII-1-3'] = function SectionVII13() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — Traffic Splitting이란?',
      desc: '새 버전을 배포할 때 트래픽의 일부만 새 버전으로 보내는 기법입니다. 문제가 없으면 점진적으로 늘리고, 문제가 있으면 즉시 롤백합니다.',
      focus: 'overview',
      v2Ratio: 10
    },
    {
      title: 'STEP 2 — 카나리 배포 (10%)',
      desc: '처음에는 10%의 트래픽만 새 버전(v2)으로 보냅니다. 에러율, 지연시간을 관찰하며 문제가 없는지 확인합니다.',
      focus: 'canary',
      v2Ratio: 10
    },
    {
      title: 'STEP 3 — 점진적 확대 (50%)',
      desc: '문제가 없으면 50%로 늘립니다. 이 단계에서도 메트릭을 면밀히 모니터링합니다. 이상이 발견되면 즉시 0%로 롤백합니다.',
      focus: 'expand',
      v2Ratio: 50
    },
    {
      title: 'STEP 4 — 전체 전환 (100%)',
      desc: '최종적으로 100% 트래픽을 v2로 전환합니다. 이전 버전(v1)의 리비전은 남겨두어 롤백에 대비합니다.',
      focus: 'full',
      v2Ratio: 100
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var v2Ratio = stepData.v2Ratio;
    var v1Ratio = 100 - v2Ratio;

    return (
      <div>
        <div className="text-center mb-4">
          <div className="text-sm font-bold text-purple-600 mb-2">트래픽 분산</div>
        </div>

        {/* 트래픽 바 */}
        <div className="mb-4">
          <div className="flex h-10 rounded-lg overflow-hidden border border-slate-200">
            {v2Ratio > 0 && (
              <div className="bg-purple-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-500" style={{ width: v2Ratio + '%' }}>
                {v2Ratio >= 15 ? 'v2 ' + v2Ratio + '%' : ''}
              </div>
            )}
            {v1Ratio > 0 && (
              <div className="bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-1 transition-all duration-500">
                v1 {v1Ratio}%
              </div>
            )}
          </div>
        </div>

        {/* 버전 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className={getStatusClass(v1Ratio > 0 ? 'done' : 'idle', 'p-4 rounded-lg border-2 text-center')}>
            <span style={{ fontSize: '28px' }}>📦</span>
            <div className="text-sm font-bold text-slate-700 mt-1">v1 (현재)</div>
            <div className="text-2xl font-bold text-slate-500">{v1Ratio}%</div>
            <div className="text-xs text-slate-400">안정 버전</div>
          </div>
          <div className={getStatusClass(v2Ratio > 0 ? 'active' : 'idle', 'p-4 rounded-lg border-2 text-center')}>
            <span style={{ fontSize: '28px' }}>🆕</span>
            <div className="text-sm font-bold text-purple-600 mt-1">v2 (신규)</div>
            <div className="text-2xl font-bold text-purple-600">{v2Ratio}%</div>
            <div className="text-xs text-slate-400">테스트 중</div>
          </div>
        </div>

        {/* 단계 표시 */}
        <div className="flex justify-center gap-2 mt-4">
          {[10, 30, 50, 100].map(function (v) {
            return (
              <div key={v} className={'px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 ' +
                (v2Ratio >= v ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-slate-100 text-slate-400 border border-slate-200')}>
                {v}%
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">배포 전략 비교</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">전략</th>
                <th className="py-2 text-left text-slate-500">방식</th>
                <th className="py-2 text-left text-slate-500">위험도</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Big Bang', '한 번에 100% 전환', '🔴 높음'],
                ['카나리', '10% → 50% → 100%', '🟢 낮음'],
                ['Blue/Green', '두 환경 스위칭', '🟡 중간'],
                ['Rolling', '인스턴스 순차 교체', '🟡 중간']
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-700">{row[0]}</td>
                    <td className="py-2 text-xs text-slate-500">{row[1]}</td>
                    <td className="py-2 text-xs">{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (focus === 'canary') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">카나리 배포 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# v2 배포 (트래픽 0%로 시작)\ngcloud run deploy my-api \\\n  --image=...my-api:v2 \\\n  --no-traffic\n\n# 10%만 v2로 분배\ngcloud run services \\\n  update-traffic my-api \\\n  --to-revisions=my-api-v2=10'}</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700">
            <strong>팁</strong>: --no-traffic 플래그로 배포하면 트래픽을 받지 않고 대기합니다.
          </div>
        </div>
      );
    }

    if (focus === 'expand') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">모니터링 체크리스트</div>
          <div className="space-y-3">
            {[
              { check: '에러율 확인', detail: 'v2의 에러율이 v1과 비슷한지 확인', ok: true },
              { check: '지연시간 확인', detail: 'p99 지연시간이 임계값 이내인지 확인', ok: true },
              { check: '로그 확인', detail: 'ERROR/WARNING 로그가 증가하지 않았는지 확인', ok: true },
              { check: '문제 발견 시', detail: '즉시 gcloud run services update-traffic --to-revisions=v1=100', ok: false }
            ].map(function (item) {
              return (
                <div key={item.check} className={'p-3 rounded-lg border ' + (item.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')}>
                  <div className="text-sm font-semibold" style={{ color: item.ok ? '#10b981' : '#ef4444' }}>
                    {item.ok ? '✅' : '🚨'} {item.check}
                  </div>
                  <div className="text-xs mt-1" style={{ color: item.ok ? '#10b981' : '#ef4444' }}>{item.detail}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // full
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">100% 전환 CLI</div>
        <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud CLI</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 100% v2로 전환\ngcloud run services \\\n  update-traffic my-api \\\n  --to-latest\n\n# 롤백이 필요하면:\ngcloud run services \\\n  update-traffic my-api \\\n  --to-revisions=my-api-v1=100\n\n# 이전 리비전 확인\ngcloud run revisions list \\\n  --service=my-api'}</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700">
          <strong>핵심</strong>: Cloud Run은 리비전을 자동 보관하므로 언제든 이전 버전으로 롤백할 수 있습니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
