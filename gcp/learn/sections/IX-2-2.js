/**
 * IX-2-2.js
 * 경로: learn/sections/IX-2-2.js
 * 목적: "Subnet + 방화벽" — 서브넷 설계와 방화벽 규칙 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IX-2-2'] = function SectionIX22() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var firewallRules = [
    { name: 'allow-internal', source: '10.0.0.0/16', allow: 'TCP, UDP, ICMP', desc: 'VPC 내부끼리 자유 통신', icon: '🏠', color: '#10b981' },
    { name: 'allow-ssh', source: '0.0.0.0/0', allow: 'TCP:22', desc: '관리자 SSH 접근', icon: '🔑', color: '#3b82f6' },
    { name: 'allow-http', source: '0.0.0.0/0', allow: 'TCP:80,443', desc: '웹 트래픽 허용', icon: '🌐', color: '#8b5cf6' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 서브넷과 방화벽 개요',
      desc: '서브넷은 VPC 안에서 IP 구간을 나누는 것이고, 방화벽은 그 구간에 대한 출입문입니다. 건물의 "층"이 서브넷이고, "출입문 보안"이 방화벽입니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 서브넷 설계',
      desc: 'Web 서버, DB 서버 등 역할별로 서브넷을 분리하면 보안과 관리가 쉬워집니다.',
      focus: 'subnets',
    },
    {
      title: 'STEP 3 — 방화벽 규칙',
      desc: 'GCP 방화벽은 Stateful 방식입니다. 허용된 요청의 응답은 자동으로 허용됩니다. 규칙은 우선순위(0~65535)로 평가됩니다.',
      focus: 'firewall',
    },
    {
      title: 'STEP 4 — 방화벽 실습',
      desc: 'gcloud CLI로 방화벽 규칙을 생성하고 적용하는 과정을 확인합니다.',
      focus: 'practice',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-sm p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
            <div className="text-center text-xs font-bold text-purple-600 mb-3">my-vpc</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-emerald-200">
                <span>🌐</span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-emerald-600">web-subnet (10.0.1.0/24)</div>
                </div>
                <span className="text-xs text-slate-400">🔒 방화벽</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                <span>💾</span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-600">db-subnet (10.0.2.0/24)</div>
                </div>
                <span className="text-xs text-slate-400">🔒 방화벽</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center">
            서브넷 = 구역 분리, 방화벽 = 출입 통제
          </div>
        </div>
      );
    }

    if (focus === 'subnets') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">역할별 서브넷 분리</div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'web-subnet', range: '10.0.1.0/24', role: 'Web 서버 (Nginx, Cloud Run)', icon: '🌐', color: '#10b981' },
              { name: 'app-subnet', range: '10.0.2.0/24', role: 'App 서버 (API, Worker)', icon: '⚙️', color: '#3b82f6' },
              { name: 'db-subnet', range: '10.0.3.0/24', role: 'DB 서버 (Cloud SQL Proxy)', icon: '💾', color: '#8b5cf6' },
            ].map(function (s) {
              return (
                <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-500"
                  style={{ background: s.color + '08', borderColor: s.color + '30' }}>
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  <div>
                    <code className="text-sm font-bold" style={{ color: s.color }}>{s.name}</code>
                    <div className="text-xs text-slate-500">{s.range} — {s.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'firewall') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">방화벽 규칙 예시</div>
          </div>
          <div className="space-y-3">
            {firewallRules.map(function (r) {
              return (
                <div key={r.name} className="p-3 rounded-lg border transition-all duration-500"
                  style={{ background: r.color + '08', borderColor: r.color + '30' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '20px' }}>{r.icon}</span>
                    <div className="flex-1">
                      <code className="text-sm font-bold" style={{ color: r.color }}>{r.name}</code>
                      <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>source: <code>{r.source}</code></span>
                    <span>allow: <code>{r.allow}</code></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // practice
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">방화벽 설정 흐름</div>
        {['규칙 이름·방향 결정', '소스 IP·대상 태그 지정', '허용 프로토콜·포트 지정', '우선순위 설정'].map(function (label, i) {
          return (
            <div key={label}>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                <div className="text-sm font-semibold text-slate-700">{label}</div>
              </div>
              {i < 3 && <div className="text-center text-slate-300 text-lg py-1">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">핵심 개념</div>
          <div className="space-y-3">
            {[
              { q: '서브넷 범위', a: '리전 내에서 CIDR로 IP 대역을 지정' },
              { q: '방화벽 방향', a: 'Ingress(들어오는) / Egress(나가는) 규칙' },
              { q: 'Stateful', a: '허용된 요청의 응답은 자동으로 허용' },
              { q: '기본 정책', a: '들어오는 트래픽은 기본 차단 (Deny All)' },
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

    if (focus === 'subnets') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">서브넷 설계 원칙</div>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>역할별 분리</strong><br/>
              Web, App, DB를 서브넷으로 분리하면 방화벽 규칙을 세밀하게 적용 가능
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>리전 고려</strong><br/>
              서비스가 배포되는 리전에 서브넷을 생성 (asia-northeast3 등)
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
              <strong>IP 여유 확보</strong><br/>
              GKE 등은 Pod마다 IP를 사용하므로 넉넉하게 /20 이상 권장
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'firewall') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">방화벽 규칙 속성</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">속성</th>
                <th className="py-2 text-left text-slate-500">설명</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['direction', 'INGRESS (수신) / EGRESS (발신)'],
                ['source-ranges', '허용할 소스 IP 범위 (CIDR)'],
                ['target-tags', '규칙이 적용될 인스턴스 태그'],
                ['allow / deny', '허용/차단할 프로토콜:포트'],
                ['priority', '0(최고) ~ 65535(최저)'],
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs text-indigo-600">{row[0]}</td>
                    <td className="py-2 text-xs text-slate-600">{row[1]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    // practice
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">CLI 명령어</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud firewall</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 내부 통신 허용\ngcloud compute firewall-rules create allow-internal \\\n  --network=my-vpc \\\n  --allow=tcp,udp,icmp \\\n  --source-ranges=10.0.0.0/16\n\n# SSH 허용 (태그 기반)\ngcloud compute firewall-rules create allow-ssh \\\n  --network=my-vpc \\\n  --allow=tcp:22 \\\n  --source-ranges=0.0.0.0/0 \\\n  --target-tags=ssh-server\n\n# HTTP/HTTPS 허용\ngcloud compute firewall-rules create allow-http \\\n  --network=my-vpc \\\n  --allow=tcp:80,tcp:443 \\\n  --source-ranges=0.0.0.0/0 \\\n  --target-tags=web-server'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
