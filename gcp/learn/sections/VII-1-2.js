/**
 * VII-1-2.js
 * 경로: learn/sections/VII-1-2.js
 * 목적: "Cloud Monitoring" — 메트릭/대시보드/알림 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VII-1-2'] = function SectionVII12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var metrics = [
    { name: '요청 수', icon: '📊', color: '#3b82f6', unit: 'req/s', desc: '초당 들어오는 요청 수' },
    { name: '지연 시간', icon: '⏱️', color: '#f59e0b', unit: 'ms', desc: '요청 처리 평균 시간' },
    { name: '인스턴스 수', icon: '🐳', color: '#10b981', unit: '개', desc: '현재 실행 중인 컨테이너 수' },
    { name: '에러율', icon: '🚨', color: '#ef4444', unit: '%', desc: '전체 요청 중 에러 비율' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — Cloud Monitoring이란?',
      desc: 'Cloud Monitoring은 GCP 서비스의 상태를 실시간으로 관측하는 도구입니다. Cloud Run의 요청 수, 지연 시간, 에러율 등을 자동으로 수집합니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 핵심 메트릭 4가지',
      desc: '요청 수(트래픽), 지연 시간(성능), 인스턴스 수(스케일), 에러율(안정성). 이 4가지를 모니터링하면 서비스 상태를 파악할 수 있습니다.',
      focus: 'metrics'
    },
    {
      title: 'STEP 3 — 대시보드와 알림',
      desc: '메트릭을 대시보드에 시각화하고, 임계값을 넘으면 자동 알림을 보냅니다. 에러율 > 5%이면 Slack 알림 같은 정책을 설정합니다.',
      focus: 'dashboard'
    },
    {
      title: 'STEP 4 — SLI/SLO와 운영',
      desc: 'SLI(지표)와 SLO(목표)를 정의하면 체계적인 운영이 가능합니다. "지연시간 99% < 200ms" 같은 목표를 설정하고 추적합니다.',
      focus: 'slo'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '56px' }}>📊</span>
          <div className="text-lg font-bold text-blue-600">Cloud Monitoring</div>
          <div className="text-sm text-slate-500 text-center">서비스 상태를 실시간으로 관측</div>
          <div className="grid grid-cols-2 gap-3 mt-2 w-full">
            {metrics.map(function (m) {
              return (
                <div key={m.name} className={getStatusClass('done', 'p-3 rounded-lg border-2 text-center')}>
                  <span style={{ fontSize: '24px' }}>{m.icon}</span>
                  <div className="text-xs font-bold mt-1" style={{ color: m.color }}>{m.name}</div>
                  <div className="text-xs text-slate-400">자동 수집</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'metrics') {
      return (
        <div className="space-y-3">
          {metrics.map(function (m) {
            return (
              <div key={m.name} className={getStatusClass('active', 'p-4 rounded-lg border-2 flex items-center gap-4')}>
                <span style={{ fontSize: '32px' }}>{m.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: m.color }}>{m.name}</div>
                  <div className="text-xs text-slate-500">{m.desc}</div>
                </div>
                <div className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-600">{m.unit}</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'dashboard') {
      return (
        <div>
          <div className="text-center text-xs font-bold text-slate-500 mb-3">대시보드 미리보기</div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(function (m) {
                var mockValue = m.name === '요청 수' ? '1,234' : m.name === '지연 시간' ? '45' : m.name === '인스턴스 수' ? '3' : '0.2';
                return (
                  <div key={m.name} className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="text-xs text-slate-400">{m.name}</div>
                    <div className="text-2xl font-bold mt-1" style={{ color: m.color }}>{mockValue}</div>
                    <div className="text-xs text-slate-400">{m.unit}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // slo
    var slos = [
      { metric: '가용성', target: '99.9%', current: '99.95%', ok: true },
      { metric: '지연시간 p99', target: '< 200ms', current: '145ms', ok: true },
      { metric: '에러율', target: '< 1%', current: '0.2%', ok: true }
    ];
    return (
      <div>
        <div className="text-center text-xs font-bold text-slate-500 mb-3">SLO 대시보드</div>
        <div className="space-y-3">
          {slos.map(function (s) {
            return (
              <div key={s.metric} className={getStatusClass(s.ok ? 'done' : 'active', 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-700">{s.metric}</div>
                  <div className="text-xs text-slate-500">목표: {s.target}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: s.ok ? '#10b981' : '#ef4444' }}>{s.current}</div>
                  <div className="text-xs" style={{ color: s.ok ? '#10b981' : '#ef4444' }}>{s.ok ? '✅ 충족' : '⚠️ 미달'}</div>
                </div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Monitoring vs Logging</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-left text-slate-500">Monitoring</th>
                <th className="py-2 text-left text-slate-500">Logging</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['데이터', '숫자 메트릭', '텍스트 로그'],
                ['용도', '상태 파악/알림', '원인 분석/디버깅'],
                ['질문', '"지금 괜찮은가?"', '"왜 문제가 생겼나?"'],
                ['예시', '에러율 5%', 'NullPointerException']
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-700 text-xs">{row[0]}</td>
                    <td className="py-2 text-xs text-blue-600">{row[1]}</td>
                    <td className="py-2 text-xs text-green-600">{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (focus === 'metrics') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">메트릭 확인 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Cloud Run 메트릭 조회\ngcloud monitoring metrics list \\\n  --filter="metric.type=\n    run.googleapis.com/request_count"\n\n# Cloud Run 서비스 상태\ngcloud run services describe my-api \\\n  --region=asia-northeast3 \\\n  --format="table(status.traffic[].percent,\n    status.traffic[].revisionName)"'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'dashboard') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">알림 정책 예시</div>
          <div className="space-y-3">
            {[
              { name: '에러율 알림', condition: '에러율 > 5% (5분 동안)', action: 'Slack #alerts 채널' },
              { name: '지연시간 알림', condition: 'p99 > 500ms (10분 동안)', action: 'PagerDuty + 이메일' },
              { name: '인스턴스 폭증', condition: '인스턴스 > 50개', action: '이메일 (비용 경고)' }
            ].map(function (item) {
              return (
                <div key={item.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-semibold text-slate-700">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-1">조건: {item.condition}</div>
                  <div className="text-xs text-blue-600 mt-0.5">알림: {item.action}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // slo
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">SLI/SLO 정리</div>
        <div className="space-y-3">
          {[
            { q: 'SLI (Service Level Indicator)', a: '측정 가능한 지표 — 가용성, 지연시간, 에러율' },
            { q: 'SLO (Service Level Objective)', a: '내부 목표 — "가용성 99.9%" 같은 수치' },
            { q: 'SLA (Service Level Agreement)', a: '고객과의 계약 — SLO 미달 시 보상' },
            { q: 'Error Budget', a: 'SLO 내에서 허용되는 에러 여유분' }
          ].map(function (item) {
            return (
              <div key={item.q} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-blue-700">{item.q}</div>
                <div className="text-xs text-blue-500 mt-1">{item.a}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
