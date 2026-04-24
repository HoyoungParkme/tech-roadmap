/**
 * IX-2-1.js
 * 경로: learn/sections/IX-2-1.js
 * 목적: "VPC 생성" — Custom VPC와 IP 대역 설계 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IX-2-1'] = function SectionIX21() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var vpcModes = [
    { name: 'Auto 모드', icon: '🤖', desc: '리전별 서브넷 자동 생성 (10.128.0.0/9)', pros: '간편', cons: 'IP 충돌 가능', color: '#f59e0b' },
    { name: 'Custom 모드', icon: '🔧', desc: '서브넷·IP 대역을 직접 지정', pros: '유연·안전', cons: '설계 필요', color: '#10b981' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — VPC란?',
      desc: 'VPC(Virtual Private Cloud)는 GCP 내에서 나만의 네트워크를 만드는 것입니다. 건물의 "전용 층"을 임대하는 것과 비슷합니다. 외부와 격리된 나만의 네트워크 공간입니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — Auto vs Custom 모드',
      desc: 'Auto 모드는 서브넷이 자동 생성되어 편리하지만, 실무에서는 IP 대역 충돌 방지를 위해 Custom 모드를 사용합니다.',
      focus: 'modes',
    },
    {
      title: 'STEP 3 — IP 대역 설계',
      desc: 'CIDR 표기법으로 서브넷의 IP 범위를 정합니다. /24는 256개 IP, /16은 65,536개 IP를 의미합니다.',
      focus: 'cidr',
    },
    {
      title: 'STEP 4 — VPC 생성 실습',
      desc: 'gcloud CLI로 Custom VPC와 서브넷을 생성하는 과정을 확인합니다.',
      focus: 'practice',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '56px' }}>🏢</span>
          <div className="text-sm font-bold text-purple-600">전용 층 = VPC</div>
          <div className="w-full max-w-xs p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
            <div className="text-center text-xs font-bold text-purple-600 mb-3">my-vpc (내 네트워크)</div>
            <div className="space-y-2">
              <div className="p-2 bg-white rounded border border-purple-200 text-center">
                <div className="text-xs font-bold text-emerald-600">web-subnet</div>
                <div className="text-xs text-slate-400">10.0.1.0/24</div>
              </div>
              <div className="p-2 bg-white rounded border border-purple-200 text-center">
                <div className="text-xs font-bold text-blue-600">db-subnet</div>
                <div className="text-xs text-slate-400">10.0.2.0/24</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center">외부와 격리된 나만의 네트워크</div>
        </div>
      );
    }

    if (focus === 'modes') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">VPC 생성 모드</div>
          </div>
          <div className="space-y-3">
            {vpcModes.map(function (m) {
              return (
                <div key={m.name} className="p-4 rounded-lg border transition-all duration-500"
                  style={{ background: m.color + '08', borderColor: m.color + '40' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: '28px' }}>{m.icon}</span>
                    <div className="text-base font-bold" style={{ color: m.color }}>{m.name}</div>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{m.desc}</div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-emerald-600">장점: {m.pros}</span>
                    <span className="text-red-500">단점: {m.cons}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'cidr') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '36px' }}>📐</span>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">CIDR 표기법</div>
          </div>
          <div className="space-y-2">
            {[
              { cidr: '10.0.1.0/24', ips: '256개', use: '소규모 서브넷' },
              { cidr: '10.0.0.0/20', ips: '4,096개', use: '중규모 서브넷' },
              { cidr: '10.0.0.0/16', ips: '65,536개', use: '대규모 서브넷' },
            ].map(function (c) {
              return (
                <div key={c.cidr} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <code className="text-sm font-bold text-purple-600 min-w-[120px]">{c.cidr}</code>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-700">IP {c.ips}</div>
                    <div className="text-xs text-slate-400">{c.use}</div>
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
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">VPC 생성 흐름</div>
        {['Custom VPC 생성', '서브넷 추가 (리전 지정)', 'VM 배치 확인'].map(function (label, i) {
          return (
            <div key={label}>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                <div className="text-sm font-semibold text-slate-700">{label}</div>
              </div>
              {i < 2 && <div className="text-center text-slate-300 text-lg py-1">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">VPC 핵심 특징</div>
          <div className="space-y-3">
            {[
              { q: '범위', a: '글로벌 리소스 (리전에 걸쳐 하나의 VPC)' },
              { q: '서브넷', a: '리전별로 서브넷을 생성 (리전 리소스)' },
              { q: '격리', a: 'VPC 간 트래픽은 기본적으로 차단' },
              { q: '비용', a: 'VPC 자체는 무료, 트래픽에 과금' },
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

    if (focus === 'modes') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">비교</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-center font-bold text-amber-500">Auto</th>
                <th className="py-2 text-center font-bold text-emerald-500">Custom</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['서브넷 생성', '자동', '수동'],
                ['IP 대역', '고정 (10.128.x)', '자유 지정'],
                ['VPC 피어링', 'IP 충돌 위험', '안전'],
                ['실무 사용', '테스트용', '프로덕션'],
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 text-slate-600 font-medium text-xs">{row[0]}</td>
                    <td className="py-2 text-center text-xs">{row[1]}</td>
                    <td className="py-2 text-center text-xs">{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (focus === 'cidr') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">IP 설계 팁</div>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-700">
              <strong>RFC 1918 사설 IP 사용</strong><br/>
              10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
              <strong>다른 VPC와 겹치지 않게 설계</strong><br/>
              VPC 피어링 시 IP가 겹치면 연결 불가
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>여유 있게 할당</strong><br/>
              /24(256개)보다 /20(4,096개)을 추천
            </div>
          </div>
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
            <span className="ml-1.5">gcloud network</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 1. Custom VPC 생성\ngcloud compute networks create my-vpc \\\n  --subnet-mode=custom\n\n# 2. 서브넷 추가\ngcloud compute networks subnets create my-subnet \\\n  --network=my-vpc \\\n  --region=asia-northeast3 \\\n  --range=10.0.1.0/24\n\n# 3. 확인\ngcloud compute networks describe my-vpc'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
