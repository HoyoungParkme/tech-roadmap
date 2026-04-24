/**
 * XII-1-2.js
 * 경로: learn/sections/XII-1-2.js
 * 목적: "GKE 클러스터 생성" — Autopilot 클러스터 생성 실습 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['XII-1-2'] = function SectionXII12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — 클러스터 생성 준비',
      desc: 'GKE 클러스터를 생성하기 전에 프로젝트, 리전, Kubernetes Engine API 활성화를 확인합니다.',
      focus: 'prepare',
    },
    {
      title: 'STEP 2 — Autopilot 클러스터 생성',
      desc: 'gcloud container clusters create-auto 명령으로 Autopilot 클러스터를 생성합니다.',
      focus: 'create',
    },
    {
      title: 'STEP 3 — 인증 연결 (kubeconfig)',
      desc: 'get-credentials로 kubectl이 클러스터와 통신할 수 있도록 인증 정보를 설정합니다.',
      focus: 'auth',
    },
    {
      title: 'STEP 4 — 클러스터 확인',
      desc: 'kubectl 명령으로 클러스터 상태, 노드 목록, 네임스페이스를 확인합니다.',
      focus: 'verify',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'prepare') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">사전 준비 체크리스트</div>
          {[
            { icon: '📋', label: 'GCP 프로젝트 선택', done: true },
            { icon: '🔑', label: 'Kubernetes Engine API 활성화', done: true },
            { icon: '🌏', label: '리전 결정 (asia-northeast3)', done: true },
            { icon: '🛠️', label: 'gcloud + kubectl 설치 확인', done: true },
          ].map(function (item) {
            return (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-200 w-full">
                <span className="text-emerald-500">✅</span>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div className="text-sm font-semibold text-slate-700">{item.label}</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'create') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <span style={{ fontSize: '48px' }}>🏗️</span>
            <div className="text-base font-bold text-blue-600 mt-1">클러스터 생성 중...</div>
            <div className="text-xs text-slate-400">약 5~10분 소요</div>
          </div>
          <div className="w-full space-y-2">
            {['Control Plane 프로비저닝', 'Node Pool 준비 (Autopilot 자동)', '네트워크 설정', '클러스터 Ready'].map(function (label, i) {
              return (
                <div key={label} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <div className="text-xs font-semibold text-blue-700">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'auth') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span style={{ fontSize: '28px' }}>💻</span>
              <div className="text-xs font-bold text-blue-600 mt-1">로컬 kubectl</div>
            </div>
            <div className="text-lg text-blue-400">🔑 →</div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span style={{ fontSize: '28px' }}>☸️</span>
              <div className="text-xs font-bold text-emerald-600 mt-1">GKE Cluster</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full text-center">
            <div className="text-xs text-slate-500">get-credentials 명령이</div>
            <div className="text-xs font-bold text-indigo-600 mt-1">~/.kube/config 파일을 업데이트합니다</div>
          </div>
        </div>
      );
    }

    // verify
    return (
      <div className="flex flex-col items-center gap-4">
        <span style={{ fontSize: '48px' }}>✅</span>
        <div className="text-base font-bold text-emerald-600">클러스터 준비 완료</div>
        <div className="w-full space-y-2">
          {[
            { cmd: 'kubectl cluster-info', desc: 'API 서버 주소 확인' },
            { cmd: 'kubectl get nodes', desc: '노드 목록 (Autopilot은 Pod 배포 시 자동 생성)' },
            { cmd: 'kubectl get namespaces', desc: '기본 네임스페이스 확인' },
          ].map(function (item) {
            return (
              <div key={item.cmd} className="p-2 bg-white rounded-lg border border-slate-200">
                <code className="text-xs font-bold text-indigo-600">{item.cmd}</code>
                <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetail(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'prepare') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">CLI 설정</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">사전 준비</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# API 활성화\ngcloud services enable container.googleapis.com\n\n# 기본 리전 설정\ngcloud config set compute/region asia-northeast3\n\n# kubectl 설치 확인\nkubectl version --client'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'create') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">클러스터 생성 명령</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Autopilot 클러스터 생성\ngcloud container clusters create-auto my-cluster \\\n  --region=asia-northeast3\n\n# 약 5~10분 소요됩니다.\n# 완료 후 자동으로 kubeconfig 업데이트'}</div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>참고:</strong> Standard 모드는 <code>create</code> (create-auto 대신)을 사용하며, 노드 풀 옵션을 직접 지정합니다.
          </div>
        </div>
      );
    }

    if (focus === 'auth') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">인증 연결</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">kubeconfig</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# kubeconfig에 클러스터 인증 정보 추가\ngcloud container clusters get-credentials my-cluster \\\n  --region=asia-northeast3\n\n# 결과: ~/.kube/config 파일 업데이트\n# 이후 kubectl 명령이 해당 클러스터에 연결됨'}</div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁:</strong> 여러 클러스터를 사용할 때는 <code>kubectl config use-context</code>로 전환합니다.
          </div>
        </div>
      );
    }

    // verify
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">확인 명령어</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">kubectl</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 클러스터 정보\nkubectl cluster-info\n\n# 노드 확인\nkubectl get nodes\n\n# 네임스페이스 확인\nkubectl get namespaces\n\n# 기본 Pod 확인\nkubectl get pods --all-namespaces'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
