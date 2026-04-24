/**
 * V-2-1.js
 * 경로: learn/sections/V-2-1.js
 * 목적: "방화벽 규칙" — Ingress/Egress, 우선순위, 태그 기반 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['V-2-1'] = function SectionV21() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — 방화벽 규칙 개요',
      desc: 'GCP 방화벽은 VPC 레벨에서 트래픽을 허용/차단합니다. 기본적으로 모든 인바운드를 차단하고, 명시적으로 허용 규칙을 추가하는 화이트리스트 방식입니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — Ingress vs Egress',
      desc: 'Ingress(인바운드)는 외부→내부, Egress(아웃바운드)는 내부→외부 트래픽입니다. 보통 Ingress를 엄격히 제어하고 Egress는 허용하는 경우가 많습니다.',
      focus: 'direction'
    },
    {
      title: 'STEP 3 — 우선순위와 태그',
      desc: '우선순위(0~65535)가 낮을수록 먼저 적용됩니다. 네트워크 태그로 특정 인스턴스에만 규칙을 적용할 수 있습니다.',
      focus: 'priority'
    },
    {
      title: 'STEP 4 — 실전 규칙 설계',
      desc: '웹 서비스를 위한 일반적인 방화벽 규칙 세트: HTTP/HTTPS 허용 → 내부 통신 허용 → 나머지 차단.',
      focus: 'practice'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-8 items-center">
            <div className="text-center">
              <span style={{ fontSize: '48px' }}>🌍</span>
              <div className="text-xs text-slate-500 mt-1">외부 트래픽</div>
            </div>
            <div className="flex flex-col items-center">
              <span style={{ fontSize: '48px' }}>🔥</span>
              <div className="text-sm font-bold text-red-500">방화벽</div>
            </div>
            <div className="text-center">
              <span style={{ fontSize: '48px' }}>🏢</span>
              <div className="text-xs text-slate-500 mt-1">VPC 내부</div>
            </div>
          </div>
          <div className="text-sm text-slate-500 text-center mt-2">
            기본: 모든 Ingress 차단 / 모든 Egress 허용<br/>
            필요한 포트만 명시적으로 열어줍니다.
          </div>
        </div>
      );
    }

    if (focus === 'direction') {
      return (
        <div className="space-y-4">
          <div className={getStatusClass('active', 'p-4 rounded-lg border-2')}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '28px' }}>📥</span>
              <div>
                <div className="text-sm font-bold text-blue-600">Ingress (인바운드)</div>
                <div className="text-xs text-slate-500">외부 → VPC 내부로 들어오는 트래픽</div>
              </div>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">HTTP 80</span>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">HTTPS 443</span>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">SSH 22</span>
            </div>
          </div>
          <div className={getStatusClass('done', 'p-4 rounded-lg border-2')}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '28px' }}>📤</span>
              <div>
                <div className="text-sm font-bold text-green-600">Egress (아웃바운드)</div>
                <div className="text-xs text-slate-500">VPC 내부 → 외부로 나가는 트래픽</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">기본적으로 모두 허용 (필요 시 차단)</div>
          </div>
        </div>
      );
    }

    if (focus === 'priority') {
      var priorityRules = [
        { priority: '1000', name: 'allow-http', action: '허용', state: 'active' },
        { priority: '2000', name: 'allow-internal', action: '허용', state: 'done' },
        { priority: '65534', name: 'deny-all-ingress', action: '차단', state: 'idle' }
      ];
      return (
        <div>
          <div className="text-center mb-3 text-xs text-slate-500">우선순위 숫자가 낮을수록 먼저 적용</div>
          <div className="space-y-2">
            {priorityRules.map(function (r) {
              return (
                <div key={r.name} className={getStatusClass(r.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0">{r.priority}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-700">{r.name}</div>
                    <div className="text-xs text-slate-500">{r.action}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded" style={{ background: r.action === '허용' ? '#ecfdf5' : '#fef2f2', color: r.action === '허용' ? '#10b981' : '#ef4444' }}>
                    {r.action === '허용' ? '✅ ALLOW' : '🚫 DENY'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // practice
    var practiceRules = [
      { icon: '✅', name: 'allow-http', desc: 'tcp:80,443 — 웹 트래픽', tag: 'web-server', state: 'active' },
      { icon: '✅', name: 'allow-internal', desc: 'all — 내부 IP 대역', tag: '(전체)', state: 'done' },
      { icon: '✅', name: 'allow-ssh-iap', desc: 'tcp:22 — IAP 대역만', tag: 'ssh-allowed', state: 'done' },
      { icon: '🚫', name: 'deny-all', desc: '기본 차단 규칙', tag: '(전체)', state: 'idle' }
    ];
    return (
      <div className="space-y-2">
        <div className="text-center text-xs font-bold text-slate-500 mb-2">웹 서비스 방화벽 규칙 세트</div>
        {practiceRules.map(function (r) {
          return (
            <div key={r.name} className={getStatusClass(r.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
              <span style={{ fontSize: '18px' }}>{r.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">{r.name}</div>
                <div className="text-xs text-slate-500">{r.desc}</div>
              </div>
              <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{r.tag}</code>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">방화벽 규칙 구성요소</div>
          <div className="space-y-3">
            {[
              { q: '방향 (Direction)', a: 'Ingress(인바운드) 또는 Egress(아웃바운드)' },
              { q: '대상 (Target)', a: '네트워크 태그 또는 서비스 계정' },
              { q: '소스/대상 범위', a: 'IP 대역 (CIDR) 또는 태그' },
              { q: '프로토콜/포트', a: 'tcp:80, udp:53 등 지정' },
              { q: '액션', a: 'ALLOW 또는 DENY' }
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

    if (focus === 'direction') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Ingress 규칙 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Ingress: 외부 HTTP 허용\ngcloud compute firewall-rules create \\\n  allow-http \\\n  --direction=INGRESS \\\n  --priority=1000 \\\n  --network=my-vpc \\\n  --allow=tcp:80,tcp:443 \\\n  --source-ranges=0.0.0.0/0 \\\n  --target-tags=web-server\n\n# Egress: 특정 대역 차단\ngcloud compute firewall-rules create \\\n  deny-suspicious \\\n  --direction=EGRESS \\\n  --priority=900 \\\n  --network=my-vpc \\\n  --deny=all \\\n  --destination-ranges=203.0.113.0/24'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'priority') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">네트워크 태그 활용</div>
          <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 인스턴스에 태그 추가\ngcloud compute instances add-tags \\\n  my-instance \\\n  --tags=web-server,ssh-allowed\n\n# 태그 기반 방화벽 규칙\ngcloud compute firewall-rules create \\\n  allow-http-tagged \\\n  --allow=tcp:80 \\\n  --target-tags=web-server'}</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>팁</strong>: 태그를 쓰면 특정 인스턴스에만 규칙을 적용할 수 있어 보안이 더 세밀해집니다.
          </div>
        </div>
      );
    }

    // practice
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">규칙 적용 순서</div>
        <div className="space-y-3">
          {[
            { step: '1', text: 'HTTP/HTTPS 트래픽이 들어옴' },
            { step: '2', text: 'priority 1000: allow-http → 매칭 → 허용' },
            { step: '3', text: '내부 통신 발생' },
            { step: '4', text: 'priority 2000: allow-internal → 매칭 → 허용' },
            { step: '5', text: '알 수 없는 포트 접근' },
            { step: '6', text: 'priority 65534: deny-all → 차단' }
          ].map(function (item) {
            return (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{item.step}</div>
                <div className="text-xs text-slate-600">{item.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
