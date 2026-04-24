/**
 * VII-1-1.js
 * 경로: learn/sections/VII-1-1.js
 * 목적: "Cloud Logging" — severity 레벨과 로그 탐색 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VII-1-1'] = function SectionVII11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var levels = [
    { severity: 'DEBUG', color: '#94a3b8', icon: '🔍', desc: '디버깅 전용 상세 로그' },
    { severity: 'INFO', color: '#3b82f6', icon: 'ℹ️', desc: '정상 요청 처리 로그' },
    { severity: 'WARNING', color: '#f59e0b', icon: '⚠️', desc: '잠재적 문제 경고' },
    { severity: 'ERROR', color: '#ef4444', icon: '🚨', desc: '에러 발생 — 즉시 확인 필요' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — Cloud Logging이란?',
      desc: 'Cloud Logging은 GCP 모든 서비스의 로그를 자동 수집하는 중앙 로그 시스템입니다. Cloud Run, Cloud SQL, LB 등의 로그가 한 곳에 모입니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — Severity 레벨',
      desc: '로그에는 심각도(severity)가 있습니다. DEBUG → INFO → WARNING → ERROR 순으로 중요도가 올라갑니다. prod에서는 보통 WARNING 이상만 모니터링합니다.',
      focus: 'severity'
    },
    {
      title: 'STEP 3 — 로그 탐색과 필터링',
      desc: 'Cloud Console이나 gcloud CLI로 로그를 검색합니다. 리소스 타입, severity, 시간 범위로 필터링하여 원하는 로그를 빠르게 찾을 수 있습니다.',
      focus: 'search'
    },
    {
      title: 'STEP 4 — 알림과 실전 활용',
      desc: 'ERROR 로그가 발생하면 자동으로 Slack/이메일 알림을 보낼 수 있습니다. Log-based Metrics로 대시보드도 만들 수 있습니다.',
      focus: 'alert'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '56px' }}>📋</span>
          <div className="text-lg font-bold text-blue-600">Cloud Logging</div>
          <div className="text-sm text-slate-500 text-center">모든 GCP 서비스의 로그를 자동 수집</div>
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            {['Cloud Run', 'Cloud SQL', 'Load Balancer', 'VPC Flow'].map(function (s) {
              return (
                <div key={s} className={getStatusClass('done', 'px-3 py-2 rounded-lg border-2 text-xs font-semibold text-center')}>
                  {s}
                </div>
              );
            })}
          </div>
          <div className="text-center text-slate-300 text-sm">↓ 자동 수집</div>
          <div className={getStatusClass('active', 'px-6 py-3 rounded-lg border-2 text-center')}>
            <div className="text-sm font-bold text-blue-600">📋 Cloud Logging</div>
          </div>
        </div>
      );
    }

    if (focus === 'severity') {
      return (
        <div className="space-y-2">
          {levels.map(function (l) {
            var state = l.severity === 'ERROR' ? 'active' : l.severity === 'WARNING' ? 'highlight' : 'done';
            return (
              <div key={l.severity} className={getStatusClass(state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                <span style={{ fontSize: '24px' }}>{l.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: l.color }}>{l.severity}</div>
                  <div className="text-xs text-slate-500">{l.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'search') {
      var logEntries = [
        { time: '14:32:01', severity: 'INFO', msg: 'GET /api/users 200 45ms', color: '#3b82f6' },
        { time: '14:32:05', severity: 'INFO', msg: 'POST /api/orders 201 120ms', color: '#3b82f6' },
        { time: '14:32:08', severity: 'WARNING', msg: 'Slow query: 2.3s', color: '#f59e0b' },
        { time: '14:32:12', severity: 'ERROR', msg: 'Connection refused: Cloud SQL', color: '#ef4444' }
      ];
      return (
        <div>
          <div className="text-center text-xs font-bold text-slate-500 mb-3">로그 탐색기 미리보기</div>
          <div className="bg-slate-900 rounded-lg p-3 space-y-1">
            {logEntries.map(function (e, i) {
              var state = e.severity === 'ERROR' ? 'active' : 'idle';
              return (
                <div key={i} className={'flex gap-2 text-xs font-mono p-1.5 rounded transition-all duration-500 ' +
                  (e.severity === 'ERROR' ? 'bg-red-900/30 border border-red-500/30' : '')}>
                  <span className="text-slate-500">{e.time}</span>
                  <span className="font-bold" style={{ color: e.color }}>{e.severity}</span>
                  <span className="text-slate-300">{e.msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // alert
    var alertFlow = [
      { icon: '🚨', label: 'ERROR 로그 발생', state: 'active' },
      { icon: '📊', label: 'Log-based Metric', state: 'highlight' },
      { icon: '🔔', label: 'Alert Policy 트리거', state: 'done' },
      { icon: '💬', label: 'Slack/이메일 알림', state: 'done' }
    ];
    return (
      <div className="space-y-2">
        {alertFlow.map(function (a, i) {
          return (
            <div key={a.label}>
              <div className={getStatusClass(a.state, 'p-3 rounded-lg border-2 text-center')}>
                <span style={{ fontSize: '24px' }}>{a.icon}</span>
                <div className="text-sm font-bold text-slate-700 mt-1">{a.label}</div>
              </div>
              {i < alertFlow.length - 1 && <div className="text-center text-slate-300 text-sm">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Cloud Logging 특징</div>
          <div className="space-y-3">
            {[
              { q: '자동 수집', a: 'Cloud Run 로그가 자동으로 수집됨' },
              { q: '중앙 집중', a: '여러 서비스 로그를 한 곳에서 검색' },
              { q: '보존 기간', a: '기본 30일, 커스텀 설정 가능' },
              { q: '무료 할당', a: '매월 50GB까지 무료' }
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

    if (focus === 'severity') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Python에서 로그 남기기</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">Python logging</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'import logging\nimport json\n\n# Cloud Run 구조화 로그\ndef log_info(message, **kwargs):\n    entry = {\n        "severity": "INFO",\n        "message": message,\n        **kwargs\n    }\n    print(json.dumps(entry))\n\n# 사용 예시\nlog_info("주문 생성",\n         order_id=123,\n         user_id=456)\n\n# → Cloud Logging에 구조화 로그로 저장'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'search') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">로그 검색 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Cloud Run 로그 최근 10건\ngcloud logging read \\\n  "resource.type=cloud_run_revision" \\\n  --limit=10\n\n# ERROR만 필터\ngcloud logging read \\\n  "resource.type=cloud_run_revision\n   AND severity=ERROR" \\\n  --limit=5\n\n# 특정 시간 범위\ngcloud logging read \\\n  "resource.type=cloud_run_revision\n   AND timestamp>=\\"2024-01-01T00:00:00Z\\"" \\\n  --limit=20'}</div>
          </div>
        </div>
      );
    }

    // alert
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">알림 설정 팁</div>
        <div className="space-y-3">
          {[
            { tip: 'ERROR 로그 알림', detail: 'Log-based Metric → Alerting Policy → Notification Channel' },
            { tip: 'Slack 연동', detail: 'Notification Channel에 Slack Webhook 등록' },
            { tip: '대시보드', detail: 'Cloud Monitoring 대시보드에 로그 기반 차트 추가' },
            { tip: '비용 주의', detail: '과도한 DEBUG 로그는 비용 증가 — prod는 WARNING 이상 권장' }
          ].map(function (item) {
            return (
              <div key={item.tip} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-blue-700">{item.tip}</div>
                <div className="text-xs text-blue-500 mt-1">{item.detail}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
