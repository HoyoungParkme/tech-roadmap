/**
 * VIII-1-2.js
 * 경로: learn/sections/VIII-1-2.js
 * 목적: "인스턴스 생성" — Compute Engine VM 생성 과정 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VIII-1-2'] = function SectionVIII12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var specs = [
    { label: '존 (Zone)', value: 'asia-northeast3-a', icon: '📍', desc: '서울 리전, a 존' },
    { label: '머신 타입', value: 'e2-micro', icon: '⚙️', desc: '공유 코어, 1GB RAM (무료 티어)' },
    { label: 'OS 이미지', value: 'debian-12', icon: '🐧', desc: '경량 Linux 배포판' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — VM 생성 시 결정할 것',
      desc: 'Compute Engine VM을 만들 때 존(Zone), 머신 타입, OS 이미지 3가지를 먼저 결정합니다. 이것이 VM의 물리적 위치, 성능, 운영 환경을 결정합니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 존(Zone)과 머신 타입',
      desc: '존은 물리적 위치(서울 a존), 머신 타입은 CPU/메모리 조합(e2-micro, n1-standard-4 등)입니다. 용도에 맞는 조합을 선택합니다.',
      focus: 'zone-machine'
    },
    {
      title: 'STEP 3 — OS 이미지와 디스크',
      desc: 'OS 이미지는 Debian, Ubuntu, Windows 등을 선택합니다. 부트 디스크 크기와 타입(SSD/HDD)도 지정할 수 있습니다.',
      focus: 'os-disk'
    },
    {
      title: 'STEP 4 — 생성 실행',
      desc: 'gcloud compute instances create 명령 하나로 VM이 생성됩니다. 30초~1분 내에 SSH로 접속할 수 있는 상태가 됩니다.',
      focus: 'create'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '56px' }}>🖥️</span>
          <div className="text-lg font-bold text-amber-600">VM 생성 3요소</div>
          <div className="grid grid-cols-3 gap-3 w-full">
            {specs.map(function (s) {
              return (
                <div key={s.label} className={getStatusClass('done', 'p-3 rounded-lg border-2 text-center')}>
                  <span style={{ fontSize: '28px' }}>{s.icon}</span>
                  <div className="text-xs font-bold text-slate-700 mt-1">{s.label}</div>
                  <code className="text-xs text-blue-600 font-semibold">{s.value}</code>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'zone-machine') {
      var machines = [
        { type: 'e2-micro', cpu: '0.25 vCPU', mem: '1 GB', price: '무료 티어', state: 'active' },
        { type: 'e2-medium', cpu: '1 vCPU', mem: '4 GB', price: '~$25/월', state: 'done' },
        { type: 'n1-standard-4', cpu: '4 vCPU', mem: '15 GB', price: '~$100/월', state: 'idle' }
      ];
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '32px' }}>📍</span>
            <div className="text-sm font-bold text-slate-600">asia-northeast3-a (서울)</div>
          </div>
          <div className="space-y-2">
            {machines.map(function (m) {
              return (
                <div key={m.type} className={getStatusClass(m.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-700">{m.type}</div>
                    <div className="text-xs text-slate-500">{m.cpu} · {m.mem}</div>
                  </div>
                  <div className="text-xs font-semibold text-green-600">{m.price}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'os-disk') {
      var images = [
        { os: 'Debian 12', icon: '🐧', desc: '경량, GCP 기본', state: 'active' },
        { os: 'Ubuntu 22.04', icon: '🟠', desc: '범용, 커뮤니티 활발', state: 'done' },
        { os: 'Windows Server', icon: '🪟', desc: '.NET 앱용 (추가 비용)', state: 'idle' }
      ];
      return (
        <div>
          <div className="text-center mb-3 text-sm font-bold text-slate-600">OS 이미지 선택</div>
          <div className="space-y-2">
            {images.map(function (img) {
              return (
                <div key={img.os} className={getStatusClass(img.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '24px' }}>{img.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-700">{img.os}</div>
                    <div className="text-xs text-slate-500">{img.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 text-center">
            부트 디스크: 10GB SSD (기본) — 필요시 확장 가능
          </div>
        </div>
      );
    }

    // create
    var createSteps = [
      { num: '1', label: '설정 결정', icon: '📋', state: 'done' },
      { num: '2', label: 'gcloud 명령 실행', icon: '⌨️', state: 'active' },
      { num: '3', label: 'VM 프로비저닝', icon: '🔄', state: 'highlight' },
      { num: '4', label: 'SSH 접속 가능', icon: '✅', state: 'done' }
    ];
    return (
      <div className="space-y-2">
        {createSteps.map(function (s, i) {
          return (
            <div key={s.num}>
              <div className={getStatusClass(s.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{s.num}</div>
                <span style={{ fontSize: '20px' }}>{s.icon}</span>
                <div className="text-sm font-bold text-slate-700">{s.label}</div>
              </div>
              {i < createSteps.length - 1 && <div className="text-center text-slate-300 text-sm">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">결정 가이드</div>
          <div className="space-y-3">
            {[
              { q: '존 (Zone)', a: '사용자와 가까운 리전 선택 → 지연시간 최소화' },
              { q: '머신 타입', a: '개발: e2-micro (무료), 운영: e2-medium 이상' },
              { q: 'OS 이미지', a: 'Python/Node → Debian, .NET → Windows Server' },
              { q: '디스크', a: 'SSD(기본) → 빠름, HDD → 저렴 (대용량 저장)' }
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

    if (focus === 'zone-machine') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">머신 타입 계열</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">계열</th>
                <th className="py-2 text-left text-slate-500">용도</th>
                <th className="py-2 text-left text-slate-500">가격</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['E2', '범용 (비용 효율)', '최저가'],
                ['N2', '범용 (고성능)', '중간'],
                ['C2', 'CPU 집약적', '높음'],
                ['M2', '메모리 집약적', '높음'],
                ['A2/G2', 'GPU (ML/AI)', '매우 높음']
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
        </div>
      );
    }

    if (focus === 'os-disk') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">이미지 목록 확인</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 사용 가능한 이미지 목록\ngcloud compute images list \\\n  --filter="family:debian-12"\n\n# 커스텀 이미지 생성 (나중에)\ngcloud compute images create \\\n  my-custom-image \\\n  --source-disk=my-instance \\\n  --source-disk-zone=asia-northeast3-a'}</div>
          </div>
        </div>
      );
    }

    // create
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">VM 생성 CLI</div>
        <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud CLI</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# VM 인스턴스 생성\ngcloud compute instances create \\\n  my-server \\\n  --zone=asia-northeast3-a \\\n  --machine-type=e2-micro \\\n  --image-family=debian-12 \\\n  --image-project=debian-cloud \\\n  --boot-disk-size=10GB \\\n  --tags=web-server\n\n# 생성 확인\ngcloud compute instances list'}</div>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
          <strong>팁</strong>: e2-micro는 매월 1대까지 무료입니다 (us-west1, us-central1, us-east1 리전).
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
