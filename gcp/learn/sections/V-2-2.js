/**
 * V-2-2.js
 * 경로: learn/sections/V-2-2.js
 * 목적: "Cloud Armor와 4겹 보안" — DDoS 방어 + 보안 레이어 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['V-2-2'] = function SectionV22() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var layers = [
    { name: 'Cloud Armor', desc: 'DDoS 방어 + WAF', icon: '🛡️', color: '#ef4444', detail: 'SQL Injection, XSS 등 공격 패턴 차단' },
    { name: 'Load Balancer', desc: '트래픽 분산 + SSL', icon: '⚖️', color: '#f59e0b', detail: 'HTTPS 종료, 백엔드 헬스체크' },
    { name: 'IAM', desc: '권한 통제', icon: '🔑', color: '#3b82f6', detail: '누가 무엇을 할 수 있는지 정의' },
    { name: 'VPC 방화벽', desc: '네트워크 분리', icon: '🏢', color: '#8b5cf6', detail: '포트/IP 기반 트래픽 제어' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 보안 4겹 구조 개요',
      desc: 'GCP는 외부에서 내부로 4겹의 보안 레이어를 제공합니다. 각 레이어가 서로 다른 종류의 위협을 방어하여 종심방어(Defense in Depth)를 구현합니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — Cloud Armor (1겹)',
      desc: 'Google 글로벌 네트워크 엣지에서 DDoS 공격을 흡수하고, WAF 규칙으로 SQL Injection, XSS 등 공격 패턴을 차단합니다.',
      focus: 'armor',
      activeLayer: 0
    },
    {
      title: 'STEP 3 — LB + IAM (2~3겹)',
      desc: 'Load Balancer는 SSL 종료와 트래픽 분산을, IAM은 API 호출 권한 검증을 담당합니다. 두 레이어가 인증/인가를 처리합니다.',
      focus: 'lb-iam',
      activeLayer: 1
    },
    {
      title: 'STEP 4 — VPC 방화벽 (4겹) + 요약',
      desc: '마지막으로 VPC 방화벽이 네트워크 레벨에서 허용된 포트/IP만 통과시킵니다. 4겹 전체가 협력하여 완벽에 가까운 보안을 제공합니다.',
      focus: 'summary',
      activeLayer: 3
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-center mb-3 text-xs font-bold text-red-500">외부에서 내부로 — 4겹 보안</div>
          <div className="space-y-2">
            {layers.map(function (l, i) {
              return (
                <div key={l.name} className={getStatusClass('done', 'p-3 rounded-lg border-2 flex items-center gap-3')} style={{ marginLeft: i * 16 + 'px' }}>
                  <span style={{ fontSize: '24px' }}>{l.icon}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: l.color }}>{l.name}</div>
                    <div className="text-xs text-slate-500">{l.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-3">
            <div className="inline-block px-3 py-2 bg-slate-100 rounded-lg text-xs text-slate-600">
              🎯 각 레이어가 다른 종류의 위협을 방어
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'armor') {
      return (
        <div>
          <div className="text-center mb-4">
            <span style={{ fontSize: '48px' }}>🛡️</span>
            <div className="text-lg font-bold text-red-500 mt-1">Cloud Armor</div>
          </div>
          <div className="space-y-2">
            {layers.map(function (l, i) {
              var state = i === 0 ? 'active' : 'idle';
              return (
                <div key={l.name} className={getStatusClass(state, 'p-3 rounded-lg border-2 flex items-center gap-3')} style={{ marginLeft: i * 16 + 'px' }}>
                  <span style={{ fontSize: '20px' }}>{l.icon}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: state === 'active' ? l.color : '#94a3b8' }}>{l.name}</div>
                    <div className="text-xs text-slate-500">{l.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'lb-iam') {
      return (
        <div>
          <div className="space-y-2">
            {layers.map(function (l, i) {
              var state = i === 0 ? 'done' : (i === 1 || i === 2) ? 'active' : 'idle';
              return (
                <div key={l.name} className={getStatusClass(state, 'p-3 rounded-lg border-2 flex items-center gap-3')} style={{ marginLeft: i * 16 + 'px' }}>
                  <span style={{ fontSize: '20px' }}>{l.icon}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: (state === 'active' || state === 'done') ? l.color : '#94a3b8' }}>{l.name}</div>
                    <div className="text-xs text-slate-500">{state === 'active' ? l.detail : l.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // summary
    return (
      <div>
        <div className="space-y-2">
          {layers.map(function (l, i) {
            var state = i === 3 ? 'active' : 'done';
            return (
              <div key={l.name} className={getStatusClass(state, 'p-3 rounded-lg border-2 flex items-center gap-3')} style={{ marginLeft: i * 16 + 'px' }}>
                <span style={{ fontSize: '20px' }}>{l.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: l.color }}>{l.name}</div>
                  <div className="text-xs text-slate-500">{l.detail}</div>
                </div>
                <span className="text-xs text-green-500 font-bold">{state === 'done' ? '✓' : '◉'}</span>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">종심방어란?</div>
          <div className="space-y-3">
            {[
              { q: '왜 4겹인가?', a: '한 레이어가 뚫려도 다음 레이어가 방어' },
              { q: '비유', a: '성벽(Armor) → 경비(LB) → 신분증(IAM) → 잠금장치(방화벽)' },
              { q: '적용 순서', a: '외부 → Cloud Armor → LB → IAM → VPC → 앱' },
              { q: '핵심 원칙', a: 'Zero Trust: 아무것도 신뢰하지 않음' }
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

    if (focus === 'armor') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Cloud Armor 규칙 예시</div>
          <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 보안 정책 생성\ngcloud compute security-policies create \\\n  my-policy\n\n# SQL Injection 차단 규칙\ngcloud compute security-policies rules \\\n  create 1000 \\\n  --security-policy=my-policy \\\n  --expression="evaluatePreconfiguredExpr(\n    \'sqli-stable\')\" \\\n  --action=deny-403\n\n# LB에 정책 연결\ngcloud compute backend-services \\\n  update my-backend \\\n  --security-policy=my-policy'}</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-xs text-red-700">
            <strong>DDoS 방어</strong>: Google 글로벌 네트워크가 수 Tbps 공격도 자동 흡수합니다.
          </div>
        </div>
      );
    }

    if (focus === 'lb-iam') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">LB + IAM 역할 분담</div>
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">레이어</th>
                <th className="py-2 text-left text-slate-500">방어 대상</th>
                <th className="py-2 text-left text-slate-500">방법</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Load Balancer', '비정상 트래픽', 'SSL 종료 + 헬스체크'],
                ['IAM', '무권한 접근', '역할 기반 인증/인가']
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-700 text-xs">{row[0]}</td>
                    <td className="py-2 text-xs text-slate-500">{row[1]}</td>
                    <td className="py-2 text-xs text-slate-500">{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>팁</strong>: Cloud Run은 --no-allow-unauthenticated로 IAM 인증을 강제할 수 있습니다.
          </div>
        </div>
      );
    }

    // summary
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">4겹 보안 정리</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-left text-slate-500">겹</th>
              <th className="py-2 text-left text-slate-500">레이어</th>
              <th className="py-2 text-left text-slate-500">차단 대상</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['1겹', 'Cloud Armor', 'DDoS, SQLi, XSS'],
              ['2겹', 'Load Balancer', 'SSL 미적용, 비정상 요청'],
              ['3겹', 'IAM', '무권한 사용자/서비스'],
              ['4겹', 'VPC 방화벽', '허용되지 않은 포트/IP']
            ].map(function (row) {
              return (
                <tr key={row[0]} className="border-b border-slate-100">
                  <td className="py-2 font-bold text-slate-700 text-xs">{row[0]}</td>
                  <td className="py-2 text-xs font-semibold text-slate-600">{row[1]}</td>
                  <td className="py-2 text-xs text-slate-500">{row[2]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700">
          <strong>핵심</strong>: 하나만 쓰지 마세요. 4겹 전부 활성화해야 종심방어가 완성됩니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
