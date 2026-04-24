/**
 * VI-1-3.js
 * 경로: learn/sections/VI-1-3.js
 * 목적: "환경 분리 전략" — dev/staging/prod 3환경 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['VI-1-3'] = function SectionVI13() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var envs = [
    { name: 'dev', label: '개발', icon: '🧪', desc: '실험 OK, 불량 허용', color: '#22c55e', example: 'my-api-dev' },
    { name: 'staging', label: '스테이징', icon: '🔬', desc: '검증된 코드만 진입', color: '#f59e0b', example: 'my-api-staging' },
    { name: 'prod', label: '운영', icon: '🏭', desc: '실제 사용자 트래픽', color: '#ef4444', example: 'my-api-prod' }
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 왜 환경을 나누는가?',
      desc: '운영(prod)에 바로 배포하면 버그가 사용자에게 노출됩니다. dev → staging → prod 순서로 검증하면 안전하게 릴리스할 수 있습니다.',
      focus: 'overview'
    },
    {
      title: 'STEP 2 — 3개 환경의 역할',
      desc: 'dev는 자유로운 실험, staging은 prod와 동일한 환경에서 최종 검증, prod는 실제 서비스입니다. 각 환경에 별도 Cloud Run 서비스를 배포합니다.',
      focus: 'envs'
    },
    {
      title: 'STEP 3 — 브랜치 전략과 연결',
      desc: 'Git 브랜치와 환경을 연결합니다. develop → dev, release → staging, main → prod. Cloud Build 트리거로 자동화합니다.',
      focus: 'branch'
    },
    {
      title: 'STEP 4 — 환경별 설정 분리',
      desc: 'DB 접속 정보, API 키 등은 환경마다 다릅니다. 환경 변수와 Secret Manager로 설정을 분리합니다.',
      focus: 'config'
    }
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 items-end">
            {envs.map(function (e, i) {
              return (
                <React.Fragment key={e.name}>
                  <div className="text-center">
                    <span style={{ fontSize: '40px' }}>{e.icon}</span>
                    <div className="text-sm font-bold mt-1" style={{ color: e.color }}>{e.label}</div>
                    <div className="text-xs text-slate-400">{e.desc}</div>
                  </div>
                  {i < envs.length - 1 && <div className="text-slate-300 text-lg pb-4">→</div>}
                </React.Fragment>
              );
            })}
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center">
            왼쪽에서 오른쪽으로 검증 수준이 높아집니다.
          </div>
        </div>
      );
    }

    if (focus === 'envs') {
      return (
        <div className="space-y-3">
          {envs.map(function (e) {
            return (
              <div key={e.name} className={getStatusClass('active', 'p-4 rounded-lg border-2 flex items-center gap-4')}>
                <span style={{ fontSize: '36px' }}>{e.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: e.color }}>{e.label} ({e.name})</div>
                  <div className="text-xs text-slate-500">{e.desc}</div>
                </div>
                <code className="text-xs px-2 py-1 rounded font-semibold" style={{ background: e.color + '10', color: e.color }}>{e.example}</code>
              </div>
            );
          })}
        </div>
      );
    }

    if (focus === 'branch') {
      var branches = [
        { branch: 'develop', env: 'dev', color: '#22c55e', state: 'active' },
        { branch: 'release/*', env: 'staging', color: '#f59e0b', state: 'highlight' },
        { branch: 'main', env: 'prod', color: '#ef4444', state: 'done' }
      ];
      return (
        <div className="space-y-3">
          <div className="text-center text-xs font-bold text-slate-500 mb-2">브랜치 → 환경 매핑</div>
          {branches.map(function (b, i) {
            return (
              <div key={b.branch}>
                <div className={getStatusClass(b.state, 'p-3 rounded-lg border-2 flex items-center gap-3')}>
                  <code className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">{b.branch}</code>
                  <div className="text-slate-300">→</div>
                  <div className="text-sm font-bold" style={{ color: b.color }}>{b.env}</div>
                </div>
                {i < branches.length - 1 && <div className="text-center text-slate-300 text-xs">|</div>}
              </div>
            );
          })}
        </div>
      );
    }

    // config
    var configs = [
      { key: 'DATABASE_URL', dev: 'dev-db:5432', prod: 'prod-db:5432', icon: '🗄️' },
      { key: 'API_KEY', dev: 'dev-key-xxx', prod: 'Secret Manager', icon: '🔑' },
      { key: 'LOG_LEVEL', dev: 'DEBUG', prod: 'WARNING', icon: '📋' }
    ];
    return (
      <div>
        <div className="text-center text-xs font-bold text-slate-500 mb-3">환경별 설정 비교</div>
        <div className="space-y-2">
          {configs.map(function (c) {
            return (
              <div key={c.key} className={getStatusClass('done', 'p-3 rounded-lg border-2')}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{c.icon}</span>
                  <code className="text-xs font-bold text-slate-700">{c.key}</code>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 rounded p-2 text-center">
                    <div className="text-green-600 font-semibold">dev</div>
                    <div className="text-slate-500">{c.dev}</div>
                  </div>
                  <div className="bg-red-50 rounded p-2 text-center">
                    <div className="text-red-600 font-semibold">prod</div>
                    <div className="text-slate-500">{c.prod}</div>
                  </div>
                </div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">환경 분리 효과</div>
          <div className="space-y-3">
            {[
              { q: '버그 격리', a: 'dev 버그가 prod에 영향 없음' },
              { q: '안전한 테스트', a: 'staging에서 prod와 동일 환경 검증' },
              { q: '롤백 용이', a: '문제 시 이전 버전으로 즉시 복구' },
              { q: '팀 협업', a: '개발자는 dev에서 자유롭게 실험' }
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

    if (focus === 'envs') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">환경별 Cloud Run CLI</div>
          <div className="rounded-lg overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">gcloud CLI</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# dev 환경 배포\ngcloud run deploy my-api-dev \\\n  --image=...my-api:dev \\\n  --set-env-vars=ENV=dev\n\n# staging 환경 배포\ngcloud run deploy my-api-staging \\\n  --image=...my-api:rc-1.0 \\\n  --set-env-vars=ENV=staging\n\n# prod 환경 배포\ngcloud run deploy my-api-prod \\\n  --image=...my-api:v1.0.0 \\\n  --set-env-vars=ENV=prod'}</div>
          </div>
        </div>
      );
    }

    if (focus === 'branch') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Git 브랜치 전략</div>
          <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
              <span className="ml-1.5">Git Flow</span>
            </div>
            <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'feature/* → develop (개발)\n         ↓ merge\ndevelop  → dev 배포 (자동)\n         ↓ release branch\nrelease/* → staging 배포 (자동)\n         ↓ merge to main\nmain     → prod 배포 (자동)'}</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>팁</strong>: 작은 팀이라면 main(prod) + develop(dev) 2개만으로도 충분합니다.
          </div>
        </div>
      );
    }

    // config
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">설정 분리 방법</div>
        <div className="rounded-lg overflow-hidden border border-slate-700 mb-3">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud CLI</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 환경 변수 설정\ngcloud run services update my-api-prod \\\n  --set-env-vars=\\\n    ENV=prod,\\\n    LOG_LEVEL=WARNING\n\n# Secret Manager 연결\ngcloud run services update my-api-prod \\\n  --set-secrets=\\\n    DB_PASSWORD=db-pass:latest'}</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-xs text-green-700">
          <strong>핵심</strong>: 코드에 비밀 정보를 하드코딩하지 마세요. 환경 변수 + Secret Manager를 사용하세요.
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
