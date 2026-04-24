/**
 * X-1-1.js
 * 경로: learn/sections/X-1-1.js
 * 목적: "Cloud Load Balancing" — 로드 밸런서 구성 요소 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['X-1-1'] = function SectionX11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var components = [
    { icon: '📐', name: 'Instance Template', desc: '머신 타입 + OS + 태그 금형', detail: 'VM을 찍어내는 틀. 일관된 설정 보장', color: '#3b82f6' },
    { icon: '👥', name: 'MIG (인스턴스 그룹)', desc: '동일 VM N대 자동 생성 + Auto Scaling', detail: 'Template으로 VM을 자동 생성·관리', color: '#10b981' },
    { icon: '💓', name: 'Health Check', desc: 'HTTP 주기적 점검 → Auto Healing', detail: '비정상 VM 자동 감지 후 교체', color: '#ef4444' },
  ];

  var lbTypes = [
    { name: 'HTTP(S) LB', layer: 'L7', scope: '글로벌', use: '웹 앱' },
    { name: 'TCP/UDP LB', layer: 'L4', scope: '리전', use: '게임 서버' },
    { name: 'Internal LB', layer: 'L4', scope: '내부', use: 'VPC 내 서비스 간' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 로드 밸런서란?',
      desc: '로드 밸런서는 트래픽을 여러 서버에 분산시킵니다. 카페의 "번호표 기계"처럼, 손님(요청)을 대기 줄이 짧은 카운터(서버)로 안내합니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 핵심 구성 요소',
      desc: 'Instance Template → MIG → Health Check. 이 세 가지가 로드 밸런서의 백엔드를 구성합니다.',
      focus: 'components',
    },
    {
      title: 'STEP 3 — LB 유형 비교',
      desc: 'GCP는 다양한 로드 밸런서를 제공합니다. 웹 앱은 HTTP(S) LB, 게임 서버는 TCP/UDP LB를 사용합니다.',
      focus: 'types',
    },
    {
      title: 'STEP 4 — 동작 흐름',
      desc: '사용자 요청이 Forwarding Rule → URL Map → Backend Service → MIG → VM으로 전달되는 전체 흐름을 확인합니다.',
      focus: 'flow',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <span style={{ fontSize: '40px' }}>👥</span>
            <div className="text-xs text-slate-400 mt-1">사용자 요청</div>
          </div>
          <div className="text-xl text-slate-300">↓</div>
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
            <span style={{ fontSize: '32px' }}>⚖️</span>
            <div className="text-sm font-bold text-blue-600 mt-1">Load Balancer</div>
            <div className="text-xs text-slate-400">트래픽 분산</div>
          </div>
          <div className="flex gap-4">
            <div className="text-xl text-slate-300">↙</div>
            <div className="text-xl text-slate-300">↓</div>
            <div className="text-xl text-slate-300">↘</div>
          </div>
          <div className="flex gap-3">
            {['VM 1', 'VM 2', 'VM 3'].map(function (vm) {
              return (
                <div key={vm} className="p-2 bg-emerald-50 rounded border border-emerald-200 text-center">
                  <span style={{ fontSize: '20px' }}>🖥️</span>
                  <div className="text-xs font-bold text-emerald-600">{vm}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'components') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">백엔드 구성 요소</div>
          </div>
          <div className="space-y-2">
            {components.map(function (c, i) {
              return (
                <div key={c.name}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-500"
                    style={{ background: c.color + '08', borderColor: c.color + '30' }}>
                    <span style={{ fontSize: '24px' }}>{c.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: c.color }}>{c.name}</div>
                      <div className="text-xs text-slate-500">{c.desc}</div>
                    </div>
                  </div>
                  {i < components.length - 1 && <div className="text-center text-slate-300 text-lg py-1">↓</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'types') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">LB 유형 비교</div>
          </div>
          <div className="space-y-3">
            {lbTypes.map(function (t) {
              return (
                <div key={t.name} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-indigo-600">{t.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{t.use}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-600">{t.layer}</div>
                      <div className="text-xs text-slate-400">{t.scope}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // flow
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">요청 흐름</div>
        {[
          { icon: '🌐', name: 'Forwarding Rule', desc: '외부 IP + 포트 수신 진입점', color: '#8b5cf6' },
          { icon: '🔀', name: 'URL Map', desc: '경로별 백엔드 라우팅 규칙', color: '#3b82f6' },
          { icon: '⚙️', name: 'Backend Service', desc: 'MIG + Health Check 연결', color: '#10b981' },
          { icon: '🖥️', name: 'MIG → VM', desc: '실제 요청 처리', color: '#f59e0b' },
        ].map(function (item, i) {
          return (
            <div key={item.name}>
              <div className="flex items-center gap-3 p-2 rounded-lg border"
                style={{ background: item.color + '08', borderColor: item.color + '30' }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: item.color }}>{item.name}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
              {i < 3 && <div className="text-center text-slate-300 text-base">↓</div>}
            </div>
          );
        })}
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">LB가 해결하는 문제</div>
          <div className="space-y-3">
            {[
              { q: '트래픽 폭주', a: '여러 VM에 분산하여 과부하 방지' },
              { q: '서버 장애', a: 'Health Check로 비정상 VM 자동 제외' },
              { q: '글로벌 사용자', a: 'Anycast IP로 가까운 리전에 연결' },
            ].map(function (item) {
              return (
                <div key={item.q} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-semibold text-slate-700">{item.q}</div>
                  <div className="text-xs text-slate-500 mt-1">{item.a}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'components') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">각 요소 상세</div>
          <div className="space-y-3">
            {components.map(function (c) {
              return (
                <div key={c.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-semibold" style={{ color: c.color }}>{c.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.detail}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'types') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">선택 가이드</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">유형</th>
                <th className="py-2 text-center text-slate-500">계층</th>
                <th className="py-2 text-center text-slate-500">범위</th>
              </tr>
            </thead>
            <tbody>
              {lbTypes.map(function (t) {
                return (
                  <tr key={t.name} className="border-b border-slate-100">
                    <td className="py-2 text-xs font-bold text-indigo-600">{t.name}</td>
                    <td className="py-2 text-center text-xs">{t.layer}</td>
                    <td className="py-2 text-center text-xs">{t.scope}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁:</strong> 웹 앱 대부분은 HTTP(S) LB를 선택합니다. 글로벌 Anycast IP + SSL 종료 + CDN 연동이 가능합니다.
          </div>
        </div>
      );
    }

    // flow
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">주요 설정 예시</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">URL Map 예시</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# URL Map 라우팅 규칙\n/api/*    → backend-api (MIG-api)\n/static/* → backend-cdn (Cloud CDN)\n/*        → backend-web (MIG-web)\n\n# Health Check 설정\n프로토콜: HTTP\n포트: 80\n경로: /health\n주기: 10초\n임계값: 3회 실패 → unhealthy'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
