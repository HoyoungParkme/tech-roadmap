/**
 * VI-1-2.js
 * 경로: learn/sections/VI-1-2.js
 * 목적: "Cloud Build + CI/CD" — 파이프라인 단계별 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VI-1-2'] = function SectionVI12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var pipeline = [
    { icon: '📝', label: 'GitHub Push', desc: '코드 변경 감지', color: '#1a1a2e' },
    { icon: '🔨', label: 'Docker Build', desc: '이미지 빌드', color: '#3b82f6' },
    { icon: '📦', label: 'Registry Push', desc: 'Artifact Registry 업로드', color: '#8b5cf6' },
    { icon: '🚀', label: 'Cloud Run Deploy', desc: '자동 배포', color: '#10b981' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — CI/CD란?',
      desc: 'CI(지속적 통합)는 코드를 자주 빌드·테스트하고, CD(지속적 배포)는 자동으로 운영에 반영합니다. Cloud Build는 GCP의 CI/CD 서비스입니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 파이프라인 흐름',
      desc: 'GitHub Push → Docker Build → Artifact Registry → Cloud Run Deploy. 이 4단계가 cloudbuild.yaml 하나로 자동화됩니다.',
      focus: 'pipeline'
    },
    {
      title: 'STEP 3 — cloudbuild.yaml 작성',
      desc: 'Cloud Build는 cloudbuild.yaml 파일에 파이프라인을 정의합니다. 각 step이 순서대로 실행되며, 컨테이너 기반으로 동작합니다.',
      focus: 'yaml'
    },
    {
      title: 'STEP 4 — 트리거와 자동화',
      desc: 'GitHub 리포에 Push하면 자동으로 Cloud Build가 실행됩니다. 브랜치별로 다른 파이프라인을 설정할 수도 있습니다.',
      focus: 'trigger'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '56px' }}>🔄</span>
          <div className="text-lg font-bold text-blue-600">CI/CD = 자동 빌드 + 자동 배포</div>
          <div className="text-sm text-slate-500 text-center">
            코드를 Push하면 자동으로 빌드 → 테스트 → 배포<br/>
            수동 작업 없이 빠르고 안정적인 릴리스
          </div>
          <div className="flex gap-3 mt-2">
            <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700 font-semibold">CI: 빌드+테스트</div>
            <div className="text-slate-300">→</div>
            <div className="px-3 py-2 bg-green-50 rounded-lg border border-green-200 text-xs text-green-700 font-semibold">CD: 자동 배포</div>
          </div>
        </div>
      );
    }

    if (focus === 'pipeline') {
      return (
        <div className="space-y-2">
          {pipeline.map(function (p, i) {
            var state = i === 0 ? 'done' : i === 1 ? 'active' : i === 2 ? 'highlight' : 'idle';
            return (
              <div key={p.label}>
                <div className={getStatusClass(state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <span style={{ fontSize: '24px' }}>{p.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: p.color }}>{p.label}</div>
                    <div className="text-xs text-slate-500">{p.desc}</div>
                  </div>
                  <div className="text-xs font-bold" style={{ color: state === 'done' ? '#10b981' : state === 'active' ? '#3b82f6' : '#94a3b8' }}>
                    {state === 'done' ? '✓ 완료' : state === 'active' ? '◉ 진행 중' : '대기'}
                  </div>
                </div>
                {i < pipeline.length - 1 && <div className="text-center text-slate-300 text-sm">↓</div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'yaml') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>📄</span>
            <div className="text-sm font-bold text-purple-600 mt-1">cloudbuild.yaml</div>
          </div>
          <div className="space-y-2">
            {[
              { step: 'step 1', label: 'Docker Build', icon: '🔨', state: 'active' },
              { step: 'step 2', label: 'Registry Push', icon: '📦', state: 'highlight' },
              { step: 'step 3', label: 'Cloud Run Deploy', icon: '🚀', state: 'done' }
            ].map(function (s, i) {
              return (
                <div key={s.step}>
                  <div className={getStatusClass(s.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                    <span style={{ fontSize: '20px' }}>{s.icon}</span>
                    <div>
                      <div className="text-xs text-slate-400 uppercase">{s.step}</div>
                      <div className="text-sm font-bold text-slate-700">{s.label}</div>
                    </div>
                  </div>
                  {i < 2 && <div className="text-center text-slate-300 text-sm">↓</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // trigger
    var triggerFlow = [
      { icon: '💻', label: 'git push origin main', state: 'active' },
      { icon: '🔔', label: 'Cloud Build Trigger', state: 'highlight' },
      { icon: '🔄', label: 'Pipeline 자동 실행', state: 'done' },
      { icon: '✅', label: '배포 완료 알림', state: 'done' }
    ];
    return (
      <div className="space-y-2">
        {triggerFlow.map(function (t, i) {
          return (
            <div key={t.label}>
              <div className={getStatusClass(t.state, 'p-3 rounded-lg border-2 text-center')}>
                <span style={{ fontSize: '24px' }}>{t.icon}</span>
                <div className="text-sm font-bold text-slate-700 mt-1">{t.label}</div>
              </div>
              {i < triggerFlow.length - 1 && <div className="text-center text-slate-300 text-sm">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">CI/CD 장점</div>
          <div className="space-y-3">
            {[
              { q: '자동화', a: '수동 빌드/배포 실수 제거' },
              { q: '빠른 피드백', a: '코드 Push 후 수 분 내 배포' },
              { q: '일관성', a: '매번 동일한 프로세스로 배포' },
              { q: '롤백 용이', a: '이전 이미지로 즉시 되돌리기' }
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

    if (focus === 'pipeline') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">파이프라인 비교</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">단계</th>
                <th className="py-2 text-left text-slate-500">수동</th>
                <th className="py-2 text-left text-slate-500">Cloud Build</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['빌드', 'docker build 직접 실행', '자동 실행'],
                ['푸시', 'docker push 직접', '자동 푸시'],
                ['배포', 'gcloud run deploy', '자동 배포'],
                ['소요 시간', '10~20분 (수동)', '3~5분 (자동)']
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-700 text-xs">{row[0]}</td>
                    <td className="py-2 text-xs text-red-500">{row[1]}</td>
                    <td className="py-2 text-xs text-green-600">{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (focus === 'yaml') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">cloudbuild.yaml 예시</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">cloudbuild.yaml</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'steps:\n  # 1. Docker 이미지 빌드\n  - name: "gcr.io/cloud-builders/docker"\n    args: ["build", "-t",\n      "asia-northeast3-docker.pkg.dev/\n       $PROJECT_ID/my-repo/my-api",\n      "."]\n\n  # 2. Artifact Registry 푸시\n  - name: "gcr.io/cloud-builders/docker"\n    args: ["push",\n      "asia-northeast3-docker.pkg.dev/\n       $PROJECT_ID/my-repo/my-api"]\n\n  # 3. Cloud Run 배포\n  - name: "gcr.io/cloud-builders/gcloud"\n    args: ["run", "deploy", "my-api",\n      "--image", "asia-...",\n      "--region", "asia-northeast3"]'}</div>
          </div>
        </div>
      );
    }

    // trigger
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">트리거 설정 CLI</div>
        <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud CLI</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Cloud Build 트리거 생성\ngcloud builds triggers create github \\\n  --name="deploy-on-push" \\\n  --repo-name="my-repo" \\\n  --repo-owner="my-org" \\\n  --branch-pattern="^main$" \\\n  --build-config="cloudbuild.yaml"'}</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700">
          <strong>팁</strong>: branch-pattern으로 main에만 배포하고, develop 브랜치는 별도 트리거로 staging에 배포할 수 있습니다.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
