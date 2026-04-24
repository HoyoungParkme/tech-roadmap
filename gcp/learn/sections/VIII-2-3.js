/**
 * VIII-2-3.js
 * 경로: learn/sections/VIII-2-3.js
 * 목적: "IAP Tunnel" — Bastion 없이 안전한 접속 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VIII-2-3'] = function SectionVIII23() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — IAP(Identity-Aware Proxy)란?',
      desc: 'IAP는 Google의 Zero Trust 접근 제어 서비스입니다. Bastion Host 없이도 Private 인스턴스에 안전하게 접속할 수 있습니다. 모든 접근을 인증/인가합니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — IAP Tunnel 접속 흐름',
      desc: '관리자 → IAP Proxy(인증+권한 검증) → Private 인스턴스. Google이 관리하는 프록시를 통해 암호화된 터널로 접속합니다.',
      focus: 'flow'
    },
    {
      title: 'STEP 3 — IAP 설정',
      desc: 'IAP Tunnel은 방화벽 규칙 + IAM 권한 2가지만 설정하면 됩니다. 추가 VM이나 소프트웨어가 필요 없습니다.',
      focus: 'setup'
    },
    {
      title: 'STEP 4 — Zero Trust와 장점',
      desc: '"네트워크 위치가 아닌 사용자 신원으로 접근을 판단한다"가 Zero Trust의 핵심입니다. IAP는 이를 GCP 레벨에서 구현합니다.',
      focus: 'zerotrust'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '56px' }}>🛡️</span>
          <div className="text-lg font-bold text-blue-600">IAP = Zero Trust 접근</div>
          <div className="text-sm text-slate-500 text-center">
            Bastion Host 불필요<br/>
            Google IAM으로 인증 + 암호화 터널
          </div>
          <div className="flex gap-3 items-center mt-2">
            <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-center">
              <div>👤</div>관리자
            </div>
            <div className="text-blue-500 font-bold">→</div>
            <div className="px-3 py-2 bg-blue-50 rounded-lg border-2 border-blue-400 text-xs text-center">
              <div>🛡️</div>IAP Proxy
            </div>
            <div className="text-green-500 font-bold">→ 터널 →</div>
            <div className="px-3 py-2 bg-red-50 rounded-lg border-2 border-red-300 text-xs text-center">
              <div>🖥️</div>Private
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'flow') {
      var flowItems = [
        { icon: '👤', label: '관리자', sub: 'gcloud compute ssh --tunnel-through-iap', state: 'active' },
        { icon: '🛡️', label: 'IAP Proxy', sub: 'Google 관리 · IAM 인증 · 권한 검증', state: 'highlight' },
        { icon: '🔒', label: '암호화 터널', sub: 'TLS 암호화 통신', state: 'done' },
        { icon: '🖥️', label: 'Private 인스턴스', sub: '10.0.2.3 (외부 IP 없음)', state: 'done' }
      ];
      return (
        <div className="space-y-2">
          {flowItems.map(function (f, i) {
            return (
              <div key={f.label}>
                <div className={getStatusClass(f.state, 'p-3 rounded-lg border-2 text-center')}>
                  <span style={{ fontSize: '24px' }}>{f.icon}</span>
                  <div className="text-sm font-bold text-slate-700 mt-1">{f.label}</div>
                  <div className="text-xs text-slate-500">{f.sub}</div>
                </div>
                {i < flowItems.length - 1 && <div className="text-center text-blue-400 text-xs font-semibold">↓</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'setup') {
      var setupSteps = [
        { num: '1', label: '방화벽 규칙 추가', desc: 'IAP IP 대역에서 SSH 허용', state: 'active' },
        { num: '2', label: 'IAM 권한 부여', desc: 'iap.tunnelResourceAccessor 역할', state: 'highlight' },
        { num: '3', label: '접속 테스트', desc: '--tunnel-through-iap 플래그', state: 'done' }
      ];
      return (
        <div className="space-y-2">
          <div className="text-center text-xs font-bold text-slate-500 mb-2">설정 2단계 + 테스트</div>
          {setupSteps.map(function (s, i) {
            return (
              <div key={s.num}>
                <div className={getStatusClass(s.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{s.num}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{s.label}</div>
                    <div className="text-xs text-slate-500">{s.desc}</div>
                  </div>
                </div>
                {i < setupSteps.length - 1 && <div className="text-center text-slate-300 text-sm">↓</div>}
              </div>
            );
          })}
        </div>
      );
    }

    // zerotrust
    var principles = [
      { icon: '🔍', label: '항상 검증', desc: '모든 접근 요청을 인증', state: 'active' },
      { icon: '🔒', label: '최소 권한', desc: '필요한 권한만 부여', state: 'highlight' },
      { icon: '📋', label: '감사 로그', desc: '모든 접근을 자동 기록', state: 'done' },
      { icon: '🌐', label: '위치 무관', desc: '네트워크 위치가 아닌 신원 기반', state: 'done' }
    ];
    return (
      <div>
        <div className="text-center mb-3">
          <div className="text-sm font-bold text-blue-600">Zero Trust 원칙</div>
          <div className="text-xs text-slate-400">"아무것도 신뢰하지 않는다"</div>
        </div>
        <div className="space-y-2">
          {principles.map(function (p) {
            return (
              <div key={p.label} className={getStatusClass(p.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                <span style={{ fontSize: '20px' }}>{p.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-700">{p.label}</div>
                  <div className="text-xs text-slate-500">{p.desc}</div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">IAP 장점</div>
          <div className="space-y-3">
            {[
              { q: '추가 VM 불필요', a: 'Bastion Host 비용 절약' },
              { q: 'IAM 기반 인증', a: 'SSH 키가 아닌 Google 계정으로 인증' },
              { q: '자동 감사 로그', a: '누가 언제 접속했는지 자동 기록' },
              { q: '암호화 터널', a: 'TLS로 전 구간 암호화' }
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

    if (focus === 'flow') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">IAP SSH 접속</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# IAP Tunnel 경유 SSH (한 줄이면 끝)\ngcloud compute ssh private-server \\\n  --zone=asia-northeast3-a \\\n  --tunnel-through-iap\n\n# TCP 포워딩 (로컬 포트 → 원격 포트)\ngcloud compute start-iap-tunnel \\\n  private-server 3306 \\\n  --local-host-port=localhost:3306 \\\n  --zone=asia-northeast3-a\n\n# → localhost:3306으로 DB 접속 가능!'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'setup') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">IAP 설정 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 1. IAP IP 대역에서 SSH 허용\ngcloud compute firewall-rules create \\\n  allow-ssh-iap \\\n  --network=my-vpc \\\n  --allow=tcp:22 \\\n  --source-ranges=35.235.240.0/20\n\n# 2. IAM 권한 부여\ngcloud projects add-iam-policy-binding \\\n  my-project \\\n  --member="user:admin@company.com" \\\n  --role="roles/iap.tunnelResourceAccessor"'}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>핵심</strong>: 35.235.240.0/20은 Google IAP의 IP 대역입니다. 이 대역만 허용하면 됩니다.
          </div>
        </div>
      );
    }

    // zerotrust
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">접근 제어 진화</div>
        <div className="space-y-3">
          {[
            { era: '전통적', method: 'VPN + 방화벽', problem: 'VPN 뚫리면 내부 전체 노출' },
            { era: 'Bastion', method: '징검다리 서버', problem: '추가 VM 비용 + 관리 부담' },
            { era: 'IAP (Zero Trust)', method: 'IAM + 암호화 터널', problem: '없음 (GCP 권장)' }
          ].map(function (item) {
            return (
              <div key={item.era} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-slate-700">{item.era}</div>
                  <div className="text-xs text-slate-400">→ {item.method}</div>
                </div>
                <div className="text-xs mt-1" style={{ color: item.problem === '없음 (GCP 권장)' ? '#10b981' : '#ef4444' }}>
                  {item.problem === '없음 (GCP 권장)' ? '✅ ' : '⚠️ '}{item.problem}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700">
          <strong>결론</strong>: Zero Trust: 모든 접근을 항상 인증. IAP Tunnel이 GCP 베스트 프랙티스입니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
