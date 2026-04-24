/**
 * XII-1-1.js
 * 경로: learn/sections/XII-1-1.js
 * 목적: "GKE Autopilot vs Standard" — GKE 모드 비교 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['XII-1-1'] = function SectionXII11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var k8sConcepts = [
    { icon: '📦', name: 'Pod', desc: '컨테이너 실행 단위 (최소 배포 단위)', color: '#3b82f6' },
    { icon: '🖥️', name: 'Node', desc: 'Pod가 실행되는 VM (워커 머신)', color: '#10b981' },
    { icon: '🏗️', name: 'Cluster', desc: 'Node 묶음 + Control Plane', color: '#8b5cf6' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — GKE란?',
      desc: 'GKE(Google Kubernetes Engine)는 컨테이너를 대규모로 배포·관리하는 서비스입니다. Docker 컨테이너를 여러 VM에 자동으로 분산 배치합니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — Kubernetes 핵심 개념',
      desc: 'Pod(컨테이너 실행 단위), Node(VM), Cluster(Node 묶음)가 기본 구성입니다.',
      focus: 'concepts',
    },
    {
      title: 'STEP 3 — Autopilot vs Standard',
      desc: 'Autopilot은 노드 관리를 GCP에 맡기고, Standard는 직접 노드를 제어합니다. 입문자는 Autopilot을 추천합니다.',
      focus: 'compare',
    },
    {
      title: 'STEP 4 — 어떤 모드를 선택할까?',
      desc: '프로젝트 요구 사항에 따라 적절한 모드를 선택합니다.',
      focus: 'decision',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
            <span style={{ fontSize: '40px' }}>☸️</span>
            <div className="text-base font-bold text-blue-600 mt-1">GKE Cluster</div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="p-3 bg-white rounded-lg border border-emerald-200 text-center">
              <div className="text-xs font-bold text-emerald-600 mb-1">Node 1</div>
              <div className="flex gap-1">
                <span className="text-sm p-1 bg-blue-50 rounded">🐳</span>
                <span className="text-sm p-1 bg-blue-50 rounded">🐳</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-200 text-center">
              <div className="text-xs font-bold text-emerald-600 mb-1">Node 2</div>
              <div className="flex gap-1">
                <span className="text-sm p-1 bg-blue-50 rounded">🐳</span>
                <span className="text-sm p-1 bg-blue-50 rounded">🐳</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-200 text-center">
              <div className="text-xs font-bold text-emerald-600 mb-1">Node 3</div>
              <div className="flex gap-1">
                <span className="text-sm p-1 bg-blue-50 rounded">🐳</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center">
            컨테이너(Pod)를 여러 Node에 자동 분산 배치
          </div>
        </div>
      );
    }

    if (focus === 'concepts') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kubernetes 핵심 개념</div>
          </div>
          <div className="space-y-2">
            {k8sConcepts.map(function (c, i) {
              return (
                <div key={c.name}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{ background: c.color + '08', borderColor: c.color + '30' }}>
                    <span style={{ fontSize: '24px' }}>{c.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: c.color }}>{c.name}</div>
                      <div className="text-xs text-slate-500">{c.desc}</div>
                    </div>
                  </div>
                  {i < k8sConcepts.length - 1 && <div className="text-center text-slate-300 text-sm py-0.5">포함 관계 ↑</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'compare') {
      return (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-300 text-center">
            <span style={{ fontSize: '32px' }}>🤖</span>
            <div className="text-base font-bold text-emerald-600 mt-1">Autopilot</div>
            <div className="text-xs text-slate-500 mt-1">노드 관리 = GCP 전담</div>
            <div className="text-xs text-slate-400">앱 배포에만 집중. 입문자 추천</div>
          </div>
          <div className="text-center text-slate-300 text-lg">vs</div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-300 text-center">
            <span style={{ fontSize: '32px' }}>🔧</span>
            <div className="text-base font-bold text-amber-600 mt-1">Standard</div>
            <div className="text-xs text-slate-500 mt-1">노드 설정 직접 제어</div>
            <div className="text-xs text-slate-400">GPU·커스텀 네트워크 필요 시</div>
          </div>
        </div>
      );
    }

    // decision
    return (
      <div>
        <div className="text-center mb-3">
          <span style={{ fontSize: '36px' }}>🤔</span>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">선택 기준</div>
        </div>
        <div className="space-y-3">
          {[
            { q: '처음 GKE를 사용한다', a: 'Autopilot', color: '#10b981' },
            { q: 'GPU 워크로드가 있다', a: 'Standard', color: '#f59e0b' },
            { q: '노드 커스터마이징 불필요', a: 'Autopilot', color: '#10b981' },
            { q: 'DaemonSet 직접 배포 필요', a: 'Standard', color: '#f59e0b' },
            { q: '비용 최적화가 중요', a: 'Autopilot', color: '#10b981' },
          ].map(function (item) {
            return (
              <div key={item.q} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-600">{item.q}</div>
                <div className="text-xs font-bold px-2 py-1 rounded" style={{ color: item.color, background: item.color + '15' }}>{item.a}</div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">GKE를 쓰는 이유</div>
          <div className="space-y-3">
            {[
              { q: 'Docker만으로 부족한가요?', a: 'VM 1대에서는 충분하지만, 여러 대에 분산 배치하려면 오케스트레이터가 필요' },
              { q: 'Cloud Run과 뭐가 다른가요?', a: 'Cloud Run은 단일 컨테이너, GKE는 복잡한 마이크로서비스 구성에 적합' },
              { q: '관리형 Control Plane', a: 'Master 노드는 GCP가 자동 관리 (사용자가 신경 쓸 필요 없음)' },
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

    if (focus === 'concepts') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">추가 개념</div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>Deployment</strong><br/>
              Pod의 개수(replicas)와 업데이트 전략을 선언적으로 관리
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>Service</strong><br/>
              Pod 그룹에 고정 IP/DNS를 부여. 내부/외부 접근 가능
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
              <strong>Namespace</strong><br/>
              클러스터 내에서 리소스를 논리적으로 분리 (dev, staging, prod 등)
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'compare') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">상세 비교</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-center font-bold text-emerald-500">Autopilot</th>
                <th className="py-2 text-center font-bold text-amber-500">Standard</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['노드 관리', 'GCP', '직접'],
                ['과금 단위', 'Pod 리소스', '노드 VM'],
                ['GPU 지원', '제한적', '완전 지원'],
                ['보안 패치', '자동', '수동 + 자동'],
                ['커스텀 설정', '제한', '자유'],
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

    // decision
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">요약</div>
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
            <strong>Autopilot 추천 상황</strong><br/>
            웹 앱, API 서버, 마이크로서비스. 인프라보다 앱에 집중하고 싶을 때.
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
            <strong>Standard 추천 상황</strong><br/>
            ML 학습(GPU), 게임 서버, 고급 네트워크 정책, DaemonSet 필요 시.
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
            <strong>팁:</strong> Autopilot으로 시작하고, 한계가 느껴지면 Standard로 전환하세요.
          </div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
