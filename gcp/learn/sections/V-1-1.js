/**
 * V-1-1.js
 * 경로: learn/sections/V-1-1.js
 * 목적: "VPC 네트워크란" — 건물 비유 + VPC/서브넷/방화벽 구조도 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['V-1-1'] = function SectionV11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — VPC는 "건물 전체"',
      desc: 'VPC(Virtual Private Cloud)는 GCP 안에서 나만의 네트워크를 만드는 것입니다. 건물 전체를 빌려서 내부를 자유롭게 구성하는 것과 같습니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 서브넷은 "층/방"',
      desc: '서브넷은 VPC 안의 IP 대역 구분입니다. 서울 리전에 서브넷 A(Cloud Run용), 서브넷 B(Cloud SQL용)처럼 역할별로 나눕니다.',
      focus: 'subnets'
    },
    {
      title: 'STEP 3 — 방화벽은 "출입 규칙"',
      desc: '방화벽 규칙으로 어떤 트래픽이 들어오고 나갈 수 있는지 통제합니다. 건물 출입 규칙처럼 허용/차단을 정합니다.',
      focus: 'firewall'
    },
    {
      title: 'STEP 4 — 전체 구조 요약',
      desc: 'VPC → 서브넷 → 방화벽 순서로 네트워크를 설계합니다. 이 3가지가 GCP 네트워크의 기본 뼈대입니다.',
      focus: 'summary'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '64px' }}>🏢</span>
          <div className="text-lg font-bold text-purple-600">VPC = 나만의 건물</div>
          <div className="text-sm text-slate-500 text-center">
            GCP 프로젝트 안에 격리된 가상 네트워크를 생성<br/>
            내부 IP 대역, 라우팅, 방화벽을 자유롭게 설정
          </div>
          <div className="flex gap-4 mt-2">
            <div className="px-3 py-2 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-700 font-semibold">글로벌 리소스</div>
            <div className="px-3 py-2 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-700 font-semibold">리전별 서브넷</div>
            <div className="px-3 py-2 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-700 font-semibold">커스텀 방화벽</div>
          </div>
        </div>
      );
    }

    if (focus === 'subnets') {
      return (
        <div>
          <div className="text-center mb-4">
            <div className="text-sm font-bold text-purple-600 mb-2">🏢 VPC (건물 전체)</div>
          </div>
          <div className="flex gap-3">
            <div className={getStatusClass('active', 'flex-1 p-4 rounded-lg border-2 text-center')}>
              <div className="text-lg mb-1">🌐</div>
              <div className="text-sm font-bold text-green-600">서브넷 A (서울)</div>
              <div className="text-xs text-slate-500 mt-1">10.0.1.0/24</div>
              <div className="text-xs text-slate-400 mt-1">Cloud Run + VPC Connector</div>
            </div>
            <div className="flex items-center text-slate-300 text-lg">↔</div>
            <div className={getStatusClass('active', 'flex-1 p-4 rounded-lg border-2 text-center')}>
              <div className="text-lg mb-1">🗄️</div>
              <div className="text-sm font-bold text-amber-600">서브넷 B (서울)</div>
              <div className="text-xs text-slate-500 mt-1">10.0.2.0/24</div>
              <div className="text-xs text-slate-400 mt-1">Cloud SQL (Private IP)</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-3">같은 VPC 안에서는 내부 IP로 통신</div>
        </div>
      );
    }

    if (focus === 'firewall') {
      var rules = [
        { icon: '✅', rule: 'allow-http', direction: 'Ingress', port: '80, 443', target: '모든 인스턴스', state: 'active' },
        { icon: '✅', rule: 'allow-internal', direction: 'Ingress', port: '전체', target: '내부 IP 대역', state: 'done' },
        { icon: '🚫', rule: 'deny-all', direction: 'Ingress', port: '전체', target: '기본 차단', state: 'idle' }
      ];
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '32px' }}>🔒</span>
            <div className="text-sm font-bold text-red-500 mt-1">방화벽 규칙</div>
          </div>
          <div className="space-y-2">
            {rules.map(function (r) {
              return (
                <div key={r.rule} className={getStatusClass(r.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '20px' }}>{r.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-700">{r.rule}</div>
                    <div className="text-xs text-slate-500">{r.direction} · 포트 {r.port} · {r.target}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // summary
    var layers = [
      { label: 'VPC', icon: '🏢', desc: '격리된 가상 네트워크', color: 'text-purple-600', state: 'done' },
      { label: '서브넷', icon: '🏠', desc: '리전별 IP 대역 분리', color: 'text-blue-600', state: 'done' },
      { label: '방화벽', icon: '🔒', desc: '트래픽 허용/차단 규칙', color: 'text-red-600', state: 'done' }
    ];
    return (
      <div className="space-y-2">
        {layers.map(function (l, i) {
          return (
            <div key={l.label}>
              <div className={getStatusClass(l.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                <span style={{ fontSize: '24px' }}>{l.icon}</span>
                <div>
                  <div className={'text-sm font-bold ' + l.color}>{l.label}</div>
                  <div className="text-xs text-slate-500">{l.desc}</div>
                </div>
              </div>
              {i < layers.length - 1 && <div className="text-center text-slate-300 text-sm">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">건물 비유</div>
          <div className="space-y-3">
            {[
              { q: 'VPC', a: '건물 전체 — 나만의 독립 공간' },
              { q: '서브넷', a: '층/방 — 역할별로 공간 분리' },
              { q: '방화벽', a: '출입 규칙 — 누가 어디에 들어갈 수 있는지' },
              { q: 'IP 대역', a: '방 번호 — 각 리소스의 주소' }
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">서브넷 생성 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# VPC 생성\ngcloud compute networks create my-vpc \\\n  --subnet-mode=custom\n\n# 서브넷 A (Cloud Run용)\ngcloud compute networks subnets create subnet-a \\\n  --network=my-vpc \\\n  --region=asia-northeast3 \\\n  --range=10.0.1.0/24\n\n# 서브넷 B (Cloud SQL용)\ngcloud compute networks subnets create subnet-b \\\n  --network=my-vpc \\\n  --region=asia-northeast3 \\\n  --range=10.0.2.0/24'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'firewall') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">방화벽 규칙 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# HTTP/HTTPS 허용\ngcloud compute firewall-rules create \\\n  allow-http \\\n  --network=my-vpc \\\n  --allow=tcp:80,tcp:443 \\\n  --source-ranges=0.0.0.0/0\n\n# 내부 통신 허용\ngcloud compute firewall-rules create \\\n  allow-internal \\\n  --network=my-vpc \\\n  --allow=all \\\n  --source-ranges=10.0.0.0/16'}</div>
          </div>
        </div>
      );
    }

    // summary
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">핵심 정리</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-left text-slate-500">구성요소</th>
              <th className="py-2 text-left text-slate-500">범위</th>
              <th className="py-2 text-left text-slate-500">핵심 포인트</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['VPC', '글로벌', '프로젝트당 여러 VPC 가능'],
              ['서브넷', '리전', 'IP 대역은 겹치면 안 됨'],
              ['방화벽', 'VPC 단위', '기본은 모두 차단 (deny-all)'],
              ['라우팅', '자동/커스텀', '서브넷 간 자동 라우팅']
            ].map(function (row) {
              return (
                <tr key={row[0]} className="border-b border-slate-100">
                  <td className="py-2 font-semibold text-slate-700">{row[0]}</td>
                  <td className="py-2 text-xs text-slate-500">{row[1]}</td>
                  <td className="py-2 text-xs text-slate-500">{row[2]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 p-3 bg-purple-50 rounded-lg text-xs text-purple-700">
          <strong>기억하세요</strong>: VPC는 글로벌, 서브넷은 리전별, 방화벽은 VPC 단위입니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
