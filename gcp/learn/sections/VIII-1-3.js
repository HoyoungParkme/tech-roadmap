/**
 * VIII-1-3.js
 * 경로: learn/sections/VIII-1-3.js
 * 목적: "SSH와 메타데이터" — VM 접속과 초기 설정 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VIII-1-3'] = function SectionVIII13() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var steps = [
    { num: '1', title: 'SSH 접속', icon: '🔑', desc: 'gcloud compute ssh' },
    { num: '2', title: '패키지 설치', icon: '📦', desc: 'apt + pip install' },
    { num: '3', title: '앱 실행', icon: '🚀', desc: 'python3 app.py' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — SSH 접속 방법',
      desc: 'gcloud compute ssh 명령으로 VM에 접속합니다. SSH 키를 자동 생성하고 관리해주므로 별도 키 관리가 필요 없습니다.',
      focus: 'ssh'
    },
    {
      title: 'STEP 2 — 메타데이터와 Startup Script',
      desc: 'VM 메타데이터에 startup-script를 설정하면 VM이 부팅될 때 자동으로 스크립트가 실행됩니다. 패키지 설치, 앱 설정을 자동화할 수 있습니다.',
      focus: 'metadata'
    },
    {
      title: 'STEP 3 — 앱 배포 과정',
      desc: 'SSH 접속 → 패키지 설치 → 앱 실행. Compute Engine에서는 이 과정을 직접 수행합니다. Cloud Run과 달리 수동 작업이 필요합니다.',
      focus: 'deploy'
    },
    {
      title: 'STEP 4 — 보안과 팁',
      desc: 'SSH 접속은 IAP Tunnel을 사용하면 더 안전합니다. 서비스 계정으로 다른 GCP 서비스에 접근할 수 있습니다.',
      focus: 'security'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'ssh') {
      var sshFlow = [
        { icon: '👤', label: '개발자', sub: 'gcloud compute ssh', state: 'active' },
        { icon: '🔑', label: 'SSH 키 자동 생성', sub: '~/.ssh/google_compute_engine', state: 'highlight' },
        { icon: '🖥️', label: 'VM 인스턴스', sub: 'my-server (서울)', state: 'done' }
      ];
      return (
        <div className="space-y-2">
          {sshFlow.map(function (s, i) {
            return (
              <div key={s.label}>
                <div className={getStatusClass(s.state, 'p-4 rounded-lg border-2 text-center')}>
                  <span style={{ fontSize: '28px' }}>{s.icon}</span>
                  <div className="text-sm font-bold text-slate-700 mt-1">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.sub}</div>
                </div>
                {i < sshFlow.length - 1 && <div className="text-center text-slate-300 text-sm">↓</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'metadata') {
      return (
        <div>
          <div className="text-center mb-4">
            <span style={{ fontSize: '48px' }}>📝</span>
            <div className="text-sm font-bold text-purple-600 mt-1">Startup Script</div>
            <div className="text-xs text-slate-400">VM 부팅 시 자동 실행</div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'apt update', desc: '패키지 목록 갱신', state: 'done' },
              { label: 'pip install', desc: '필요 라이브러리 설치', state: 'active' },
              { label: 'systemctl start', desc: '앱 서비스 시작', state: 'highlight' }
            ].map(function (s, i) {
              return (
                <div key={s.label}>
                  <div className={getStatusClass(s.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <div>
                      <code className="text-xs font-bold text-slate-700">{s.label}</code>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </div>
                  </div>
                  {i < 2 && <div className="text-center text-slate-300 text-xs">↓</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'deploy') {
      return (
        <div className="space-y-2">
          {steps.map(function (s, i) {
            var state = i === 0 ? 'done' : i === 1 ? 'active' : 'highlight';
            return (
              <div key={s.num}>
                <div className={getStatusClass(state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{s.num}</div>
                  <span style={{ fontSize: '20px' }}>{s.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{s.title}</div>
                    <div className="text-xs text-slate-500">{s.desc}</div>
                  </div>
                </div>
                {i < steps.length - 1 && <div className="text-center text-slate-300 text-sm">↓</div>}
              </div>
            );
          })}
        </div>
      );
    }

    // security
    var secItems = [
      { icon: '🛡️', label: 'IAP Tunnel', desc: '공개 IP 없이 SSH 접속', state: 'active' },
      { icon: '🔐', label: '서비스 계정', desc: 'VM에서 다른 GCP 서비스 접근', state: 'highlight' },
      { icon: '🔒', label: '방화벽 규칙', desc: 'SSH 포트(22) 접근 제한', state: 'done' }
    ];
    return (
      <div className="space-y-3">
        {secItems.map(function (s) {
          return (
            <div key={s.label} className={getStatusClass(s.state, 'p-4 rounded-lg border-2 flex items-center gap-3')}>
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
              <div>
                <div className="text-sm font-bold text-slate-700">{s.label}</div>
                <div className="text-xs text-slate-500">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'ssh') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">SSH 접속 CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 기본 SSH 접속\ngcloud compute ssh my-server \\\n  --zone=asia-northeast3-a\n\n# IAP Tunnel 경유 (더 안전)\ngcloud compute ssh my-server \\\n  --zone=asia-northeast3-a \\\n  --tunnel-through-iap\n\n# 명령만 실행하고 나오기\ngcloud compute ssh my-server \\\n  --zone=asia-northeast3-a \\\n  --command="uptime"'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'metadata') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Startup Script 예시</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# startup-script 지정하여 VM 생성\ngcloud compute instances create \\\n  my-server \\\n  --zone=asia-northeast3-a \\\n  --machine-type=e2-micro \\\n  --image-family=debian-12 \\\n  --image-project=debian-cloud \\\n  --metadata-from-file=\\\n    startup-script=startup.sh\n\n# startup.sh 내용:\n#!/bin/bash\napt-get update\napt-get install -y python3 python3-pip\npip3 install flask gunicorn'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'deploy') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">수동 배포 과정</div>
          <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">VM 내부에서</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 1. 시스템 업데이트\nsudo apt update && sudo apt upgrade -y\n\n# 2. Python + 의존성 설치\nsudo apt install -y python3 python3-pip\npip3 install flask gunicorn\n\n# 3. 앱 코드 가져오기\ngit clone https://github.com/.../my-app\ncd my-app\n\n# 4. 앱 실행\ngunicorn -b 0.0.0.0:8080 app:app'}</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>비교</strong>: Cloud Run은 docker push + gcloud run deploy면 끝이지만, CE는 이 과정을 직접 합니다.
          </div>
        </div>
      );
    }

    // security
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">보안 팁</div>
        <div className="space-y-3">
          {[
            { tip: 'IAP Tunnel 사용', detail: '공개 IP 없이도 SSH 가능 → 22번 포트 안 열어도 됨' },
            { tip: 'OS Login 활성화', detail: 'IAM 기반 SSH 접근 제어 → 키 관리 불필요' },
            { tip: '서비스 계정 최소 권한', detail: 'VM에 필요한 권한만 부여 (Editor 금지)' },
            { tip: '자동 패치 관리', detail: 'OS 패치를 정기적으로 적용 (운영 책임)' }
          ].map(function (item) {
            return (
              <div key={item.tip} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-blue-700">{item.tip}</div>
                <div className="text-xs text-blue-500 mt-1">{item.detail}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
