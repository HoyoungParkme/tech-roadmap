/**
 * VIII-2-2.js
 * 경로: learn/sections/VIII-2-2.js
 * 목적: "Bastion Host" — 2단계 SSH 접속 구조 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VIII-2-2'] = function SectionVIII22() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — Bastion Host란?',
      desc: 'Private Subnet의 인스턴스에는 직접 SSH 접속이 불가능합니다. Bastion Host는 Public Subnet에 배치된 "징검다리" 서버로, 이를 통해 Private 인스턴스에 접근합니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 2단계 SSH 접속 흐름',
      desc: '관리자 → (SSH) → Bastion Host → (SSH) → Private 인스턴스. Bastion만 외부에 노출되므로, 공격 표면을 최소화할 수 있습니다.',
      focus: 'flow'
    },
    {
      title: 'STEP 3 — Bastion 보안 강화',
      desc: 'Bastion Host는 공격 대상이 될 수 있으므로 방화벽으로 접속 IP를 제한하고, 최소한의 소프트웨어만 설치합니다.',
      focus: 'security'
    },
    {
      title: 'STEP 4 — 한계와 대안',
      desc: 'Bastion Host는 추가 VM 비용이 들고, 관리 포인트가 늘어납니다. GCP에서는 IAP Tunnel이라는 더 좋은 대안이 있습니다.',
      focus: 'alternative'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '48px' }}>🏰</span>
          <div className="text-lg font-bold text-amber-600">Bastion Host = 징검다리</div>
          <div className="text-sm text-slate-500 text-center">
            Private 인스턴스에 직접 접근 불가<br/>
            Bastion을 통해 2단계로 접속
          </div>
          <div className="flex gap-4 items-center mt-2">
            <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-center">
              <div>👤</div>관리자
            </div>
            <div className="text-amber-500 font-bold">→</div>
            <div className="px-3 py-2 bg-amber-50 rounded-lg border-2 border-amber-300 text-xs text-center">
              <div>🏰</div>Bastion
            </div>
            <div className="text-red-500 font-bold">→</div>
            <div className="px-3 py-2 bg-red-50 rounded-lg border-2 border-red-300 text-xs text-center">
              <div>🖥️</div>Private
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'flow') {
      var flowItems = [
        { icon: '👤', label: '관리자', sub: '외부 네트워크', state: 'active' },
        { icon: '🏰', label: 'Bastion Host', sub: 'Public Subnet (34.64.xxx.xxx)', state: 'highlight' },
        { icon: '🖥️', label: 'Private 인스턴스', sub: 'Private Subnet (10.0.2.3)', state: 'done' }
      ];
      return (
        <div className="space-y-2">
          {flowItems.map(function (f, i) {
            return (
              <div key={f.label}>
                <div className={getStatusClass(f.state, 'p-4 rounded-lg border-2 text-center')}>
                  <span style={{ fontSize: '32px' }}>{f.icon}</span>
                  <div className="text-sm font-bold text-slate-700 mt-1">{f.label}</div>
                  <div className="text-xs text-slate-500">{f.sub}</div>
                </div>
                {i === 0 && <div className="text-center text-amber-500 text-xs font-semibold py-1">↓ SSH (외부 IP 경유)</div>}
                {i === 1 && <div className="text-center text-red-500 text-xs font-semibold py-1">↓ SSH (내부 IP 경유)</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'security') {
      var secRules = [
        { icon: '🔒', rule: '접속 IP 제한', desc: '회사 IP만 Bastion SSH 허용', state: 'active' },
        { icon: '🛡️', rule: '최소 SW 설치', desc: 'SSH 서버만 실행, 다른 서비스 X', state: 'done' },
        { icon: '📋', rule: '로그 감사', desc: 'SSH 접속 로그 모니터링', state: 'done' },
        { icon: '⏰', rule: '필요 시만 가동', desc: '작업 시에만 Bastion 시작', state: 'idle' }
      ];
      return (
        <div className="space-y-2">
          <div className="text-center text-xs font-bold text-slate-500 mb-2">Bastion 보안 체크리스트</div>
          {secRules.map(function (s) {
            return (
              <div key={s.rule} className={getStatusClass(s.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                <span style={{ fontSize: '20px' }}>{s.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-700">{s.rule}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // alternative
    return (
      <div>
        <div className="text-center text-xs font-bold text-slate-500 mb-3">Bastion vs IAP</div>
        <div className="grid grid-cols-2 gap-3">
          <div className={getStatusClass('idle', 'p-4 rounded-lg border-2 text-center')}>
            <span style={{ fontSize: '32px' }}>🏰</span>
            <div className="text-sm font-bold text-amber-600 mt-1">Bastion Host</div>
            <div className="text-xs text-slate-500 mt-2">추가 VM 필요</div>
            <div className="text-xs text-slate-500">관리 포인트 증가</div>
            <div className="text-xs text-slate-500">비용 발생</div>
          </div>
          <div className={getStatusClass('active', 'p-4 rounded-lg border-2 text-center')}>
            <span style={{ fontSize: '32px' }}>🛡️</span>
            <div className="text-sm font-bold text-blue-600 mt-1">IAP Tunnel</div>
            <div className="text-xs text-slate-500 mt-2">추가 VM 불필요</div>
            <div className="text-xs text-slate-500">IAM 기반 인증</div>
            <div className="text-xs text-green-600 font-semibold">무료</div>
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-blue-600 font-semibold">
          GCP 권장: IAP Tunnel 사용
        </div>
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">왜 Bastion이 필요한가?</div>
          <div className="space-y-3">
            {[
              { q: '직접 접근 불가', a: 'Private 인스턴스는 외부 IP가 없어 SSH 불가' },
              { q: '보안 원칙', a: 'DB 서버를 외부에 노출하면 안 됨' },
              { q: 'Bastion 역할', a: '유일한 외부 노출 포인트 → 공격 표면 최소화' },
              { q: '실제 사용', a: 'AWS/GCP 모두 이 패턴 사용 (점차 IAP로 대체)' }
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">2단계 SSH CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">터미널</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 1단계: Bastion에 SSH 접속\ngcloud compute ssh bastion \\\n  --zone=asia-northeast3-a\n\n# 2단계: Bastion에서 Private로\n# (Bastion 내부에서 실행)\nssh 10.0.2.3\n\n# 또는 ProxyJump로 한 번에:\nssh -J bastion 10.0.2.3'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'security') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Bastion 방화벽 규칙</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Bastion에 회사 IP만 SSH 허용\ngcloud compute firewall-rules create \\\n  allow-ssh-bastion \\\n  --network=my-vpc \\\n  --allow=tcp:22 \\\n  --source-ranges=203.0.113.0/24 \\\n  --target-tags=bastion\n\n# Bastion → Private SSH 허용\ngcloud compute firewall-rules create \\\n  allow-ssh-internal \\\n  --network=my-vpc \\\n  --allow=tcp:22 \\\n  --source-tags=bastion \\\n  --target-tags=internal-only'}</div>
          </div>
        </div>
      );
    }

    // alternative
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Bastion vs IAP 비교</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-left text-slate-500"></th>
              <th className="py-2 text-center text-amber-600 font-bold">Bastion</th>
              <th className="py-2 text-center text-blue-600 font-bold">IAP Tunnel</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['추가 VM', '필요 (비용)', '불필요'],
              ['인증', 'SSH 키', 'IAM (구글 계정)'],
              ['감사 로그', '별도 설정', '자동 기록'],
              ['관리 부담', '높음', '낮음'],
              ['사용 방법', '2단계 SSH', 'gcloud 한 줄']
            ].map(function (row) {
              return (
                <tr key={row[0]} className="border-b border-slate-100">
                  <td className="py-2 text-slate-600 font-medium text-xs">{row[0]}</td>
                  <td className="py-2 text-center text-xs text-amber-600">{row[1]}</td>
                  <td className="py-2 text-center text-xs text-blue-600">{row[2]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <strong>결론</strong>: 신규 프로젝트에서는 IAP Tunnel을 사용하세요. Bastion은 레거시 환경에서 만날 수 있습니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
