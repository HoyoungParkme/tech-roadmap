/**
 * VIII-2-1.js
 * 경로: learn/sections/VIII-2-1.js
 * 목적: "Public/Private Subnet" — 네트워크 분리 구조 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VIII-2-1'] = function SectionVIII21() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — Public vs Private Subnet',
      desc: 'Public Subnet은 외부 인터넷에서 접근 가능하고, Private Subnet은 외부에서 직접 접근할 수 없습니다. DB 같은 민감한 리소스는 Private에 배치합니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — Public Subnet 상세',
      desc: 'Public Subnet의 인스턴스는 외부 IP를 가지며 인터넷에서 직접 접근 가능합니다. 웹 서버, 로드 밸런서를 배치합니다.',
      focus: 'public'
    },
    {
      title: 'STEP 3 — Private Subnet 상세',
      desc: 'Private Subnet의 인스턴스는 외부 IP가 없어 인터넷에서 직접 접근 불가능합니다. DB, 내부 API 서버를 배치합니다.',
      focus: 'private'
    },
    {
      title: 'STEP 4 — 통신 구조',
      desc: 'Public ↔ Private은 내부 IP로 통신합니다. Private에서 외부 인터넷이 필요하면 Cloud NAT를 사용합니다.',
      focus: 'communication'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-center mb-3 text-sm font-bold text-purple-600">VPC 네트워크</div>
          <div className="flex gap-3">
            <div className={getStatusClass('active', 'flex-1 p-4 rounded-lg border-2 text-center')}>
              <div className="text-lg mb-1">🌐</div>
              <div className="text-sm font-bold text-green-600">Public Subnet</div>
              <div className="text-xs text-slate-500 mt-1">외부 IP 있음</div>
              <div className="text-xs text-slate-400">인터넷 접근 가능</div>
              <div className="mt-2 text-lg">🖥️ 🔀</div>
              <div className="text-xs text-slate-500">웹 서버 · LB</div>
            </div>
            <div className="flex items-center text-slate-300 text-lg">↔</div>
            <div className={getStatusClass('done', 'flex-1 p-4 rounded-lg border-2 text-center')}>
              <div className="text-lg mb-1">🔒</div>
              <div className="text-sm font-bold text-red-500">Private Subnet</div>
              <div className="text-xs text-slate-500 mt-1">외부 IP 없음</div>
              <div className="text-xs text-slate-400">직접 접근 불가</div>
              <div className="mt-2 text-lg">🗄️ ⚙️</div>
              <div className="text-xs text-slate-500">DB · 내부 API</div>
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'public') {
      var publicItems = [
        { icon: '🌐', label: '외부 IP 할당', desc: '34.64.xxx.xxx (공인 IP)', state: 'active' },
        { icon: '🖥️', label: '웹 서버', desc: 'HTTP/HTTPS 요청 처리', state: 'active' },
        { icon: '⚖️', label: 'Load Balancer', desc: '트래픽 분산 프론트엔드', state: 'done' }
      ];
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>🌐</span>
            <div className="text-sm font-bold text-green-600 mt-1">Public Subnet</div>
            <div className="text-xs text-slate-400">10.0.1.0/24</div>
          </div>
          <div className="space-y-2">
            {publicItems.map(function (p) {
              return (
                <div key={p.label} className={getStatusClass(p.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '24px' }}>{p.icon}</span>
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

    if (focus === 'private') {
      var privateItems = [
        { icon: '🔒', label: '외부 IP 없음', desc: '내부 IP만 (10.0.2.x)', state: 'done' },
        { icon: '🗄️', label: 'Cloud SQL', desc: 'Private IP로만 접근', state: 'active' },
        { icon: '⚙️', label: '내부 API 서버', desc: '외부 노출 없이 내부 통신', state: 'done' }
      ];
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>🔒</span>
            <div className="text-sm font-bold text-red-500 mt-1">Private Subnet</div>
            <div className="text-xs text-slate-400">10.0.2.0/24</div>
          </div>
          <div className="space-y-2">
            {privateItems.map(function (p) {
              return (
                <div key={p.label} className={getStatusClass(p.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '24px' }}>{p.icon}</span>
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

    // communication
    var commFlow = [
      { icon: '🌍', label: '인터넷', state: 'idle' },
      { icon: '🌐', label: 'Public Subnet (웹 서버)', state: 'active' },
      { icon: '🔒', label: 'Private Subnet (DB)', state: 'done' }
    ];
    return (
      <div>
        <div className="text-center text-xs font-bold text-slate-500 mb-3">통신 흐름</div>
        <div className="space-y-2">
          {commFlow.map(function (c, i) {
            return (
              <div key={c.label}>
                <div className={getStatusClass(c.state, 'p-3 rounded-lg border-2 text-center')}>
                  <span style={{ fontSize: '24px' }}>{c.icon}</span>
                  <div className="text-sm font-bold text-slate-700 mt-1">{c.label}</div>
                </div>
                {i === 0 && <div className="text-center text-green-500 text-xs font-semibold">↓ 외부 IP 경유</div>}
                {i === 1 && <div className="text-center text-blue-500 text-xs font-semibold">↓ 내부 IP 통신 (10.0.x.x)</div>}
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
          Private → 외부 필요 시: Cloud NAT 사용
        </div>
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">비교 테이블</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-center font-bold text-green-600">Public</th>
                <th className="py-2 text-center font-bold text-red-500">Private</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['외부 IP', '있음', '없음'],
                ['인터넷 접근', '가능', '불가 (NAT 필요)'],
                ['외부 접근', '가능', '불가'],
                ['배치 리소스', '웹 서버, LB', 'DB, 내부 API'],
                ['보안 수준', '중간', '높음']
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

    if (focus === 'public') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Public Subnet 생성</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Public 서브넷 생성\ngcloud compute networks subnets create \\\n  public-subnet \\\n  --network=my-vpc \\\n  --region=asia-northeast3 \\\n  --range=10.0.1.0/24\n\n# 외부 IP가 있는 VM 생성\ngcloud compute instances create \\\n  web-server \\\n  --zone=asia-northeast3-a \\\n  --subnet=public-subnet \\\n  --tags=web-server'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'private') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Private Subnet 생성</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Private 서브넷 생성\ngcloud compute networks subnets create \\\n  private-subnet \\\n  --network=my-vpc \\\n  --region=asia-northeast3 \\\n  --range=10.0.2.0/24\n\n# 외부 IP 없는 VM 생성\ngcloud compute instances create \\\n  db-server \\\n  --zone=asia-northeast3-a \\\n  --subnet=private-subnet \\\n  --no-address \\\n  --tags=internal-only'}</div>
          </div>
        </div>
      );
    }

    // communication
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Cloud NAT 설정</div>
        <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud CLI</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Cloud Router 생성\ngcloud compute routers create \\\n  my-router \\\n  --network=my-vpc \\\n  --region=asia-northeast3\n\n# Cloud NAT 설정\ngcloud compute routers nats create \\\n  my-nat \\\n  --router=my-router \\\n  --region=asia-northeast3 \\\n  --auto-allocate-nat-external-ips \\\n  --nat-all-subnet-ip-ranges'}</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700">
          <strong>핵심</strong>: Cloud NAT으로 Private 인스턴스가 외부에 요청을 보낼 수 있지만, 외부에서는 여전히 접근 불가능합니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
