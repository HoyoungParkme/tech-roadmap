/**
 * XII-1-3.js
 * 경로: learn/sections/XII-1-3.js
 * 목적: "GKE 배포 흐름" — Kubernetes 선언적 배포와 서비스 노출 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['XII-1-3'] = function SectionXII13() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    {
      title: 'STEP 1 — 선언적 관리란?',
      desc: '"서버 3대를 띄워라"가 아니라 "서버가 항상 3대여야 한다"고 선언합니다. Kubernetes가 현재 상태를 원하는 상태(Desired State)에 맞춰 자동으로 조절합니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — YAML로 Deployment 작성',
      desc: 'YAML 파일에 이미지, replicas 수, 포트 등을 선언하고 kubectl apply로 적용합니다.',
      focus: 'deployment',
    },
    {
      title: 'STEP 3 — Service로 외부 노출',
      desc: 'Pod는 내부 IP만 가지므로, Service(LoadBalancer 타입)로 외부 IP를 부여하여 접근 가능하게 만듭니다.',
      focus: 'service',
    },
    {
      title: 'STEP 4 — 전체 배포 흐름',
      desc: 'YAML 작성 → kubectl apply → Pod 생성 → Service 노출 → 외부 접근까지 전체 흐름을 확인합니다.',
      focus: 'flow',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span style={{ fontSize: '28px' }}>📝</span>
              <div className="text-xs font-bold text-blue-600 mt-1">Desired State</div>
              <div className="text-xs text-slate-400">"replicas: 3"</div>
            </div>
            <div className="text-lg text-blue-400">→</div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span style={{ fontSize: '28px' }}>☸️</span>
              <div className="text-xs font-bold text-emerald-600 mt-1">Kubernetes</div>
              <div className="text-xs text-slate-400">상태 조절</div>
            </div>
            <div className="text-lg text-emerald-400">→</div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex gap-1 justify-center">
                <span style={{ fontSize: '18px' }}>🐳</span>
                <span style={{ fontSize: '18px' }}>🐳</span>
                <span style={{ fontSize: '18px' }}>🐳</span>
              </div>
              <div className="text-xs font-bold text-amber-600 mt-1">Pod x 3</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center mt-2">
            Pod가 죽으면? → K8s가 자동으로 새 Pod 생성
          </div>
        </div>
      );
    }

    if (focus === 'deployment') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deployment YAML</div>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">deployment.yaml</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: my-app\n  template:\n    metadata:\n      labels:\n        app: my-app\n    spec:\n      containers:\n      - name: my-app\n        image: gcr.io/$PROJECT/my-app:v1\n        ports:\n        - containerPort: 8080'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'service') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center text-xs font-bold text-blue-600 mb-3">Service (LoadBalancer)</div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <span style={{ fontSize: '24px' }}>🌐</span>
                <div className="text-xs text-slate-500">EXTERNAL-IP</div>
              </div>
              <div className="text-blue-400">→</div>
              <div className="flex gap-2">
                <div className="p-2 bg-white rounded border border-emerald-200 text-center">
                  <span>🐳</span>
                  <div className="text-xs text-emerald-600">Pod 1</div>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200 text-center">
                  <span>🐳</span>
                  <div className="text-xs text-emerald-600">Pod 2</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center">
            외부 IP로 들어온 트래픽을 Pod에 분산
          </div>
        </div>
      );
    }

    // flow
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">전체 배포 흐름</div>
        {[
          { icon: '📝', label: 'YAML 작성', desc: 'Deployment + Service', color: '#3b82f6' },
          { icon: '🚀', label: 'kubectl apply -f', desc: '클러스터에 적용', color: '#8b5cf6' },
          { icon: '🐳', label: 'Pod 생성', desc: 'replicas 수만큼 컨테이너 실행', color: '#10b981' },
          { icon: '🌐', label: 'Service 생성', desc: 'LoadBalancer → EXTERNAL-IP 할당', color: '#f59e0b' },
          { icon: '✅', label: '외부 접근 가능', desc: 'http://EXTERNAL-IP:80', color: '#ef4444' },
        ].map(function (item, i) {
          return (
            <div key={item.label}>
              <div className="flex items-center gap-2 p-2 rounded border"
                style={{ borderColor: item.color + '30' }}>
                <span>{item.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: item.color }}>{item.label}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
              {i < 4 && <div className="text-center text-slate-300 text-sm">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">선언적 vs 명령적</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-center font-bold text-blue-500">선언적</th>
                <th className="py-2 text-center font-bold text-slate-500">명령적</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['방식', '"3대여야 한다"', '"3대를 띄워라"'],
                ['자동 복구', 'Pod 죽으면 자동 생성', '수동 재시작'],
                ['재현성', 'YAML 파일로 재현', '명령 히스토리 추적'],
                ['권장', 'Kubernetes 표준', '일회성 작업만'],
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

    if (focus === 'deployment') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">적용 명령</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">kubectl</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Deployment 적용\nkubectl apply -f deployment.yaml\n\n# Pod 상태 확인\nkubectl get pods -w\n\n# Deployment 상태\nkubectl get deployment my-app\n\n# 결과 예시:\n# NAME    READY   UP-TO-DATE   AVAILABLE\n# my-app  2/2     2            2'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'service') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Service 명령</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">kubectl expose</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# LoadBalancer Service 생성\nkubectl expose deployment my-app \\\n  --type=LoadBalancer \\\n  --port=80 \\\n  --target-port=8080\n\n# EXTERNAL-IP 확인 (1~2분 소요)\nkubectl get service my-app -w\n\n# 결과:\n# NAME    TYPE          EXTERNAL-IP   PORT(S)\n# my-app  LoadBalancer  34.xx.xx.xx   80:xxxxx/TCP'}</div>
          </div>
        </div>
      );
    }

    // flow
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">운영 명령 모음</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">운영</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 스케일 조절\nkubectl scale deployment my-app --replicas=5\n\n# 이미지 업데이트 (롤링 업데이트)\nkubectl set image deployment/my-app \\\n  my-app=gcr.io/$PROJECT/my-app:v2\n\n# 롤백\nkubectl rollout undo deployment/my-app\n\n# 로그 확인\nkubectl logs -f deployment/my-app'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
