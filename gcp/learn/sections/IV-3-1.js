/**
 * IV-3-1.js — "Cloud SQL" — Cloud Run ↔ Cloud SQL 연결 + 관리형 DB 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IV-3-1'] = function SectionIV31() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var STEPS = [
    { title: 'STEP 1 — Cloud SQL이란?', desc: '구글이 관리하는 관계형 데이터베이스 서비스입니다. MySQL, PostgreSQL, SQL Server를 지원합니다. OS 패치, 백업, 장애 복구를 GCP가 대신 해줍니다.', focus: 'overview' },
    { title: 'STEP 2 — Cloud Run ↔ Cloud SQL 연결', desc: 'Cloud Run에서 Cloud SQL에 접근하려면 --add-cloudsql-instances 옵션으로 연결을 설정합니다. Private IP(내부 네트워크)를 통해 안전하게 통신합니다.', focus: 'connect' },
    { title: 'STEP 3 — GCP가 대신 관리하는 것', desc: 'Cloud SQL을 쓰면 DB 운영의 가장 고통스러운 부분들을 GCP가 대신합니다. 개발자는 SQL 쿼리에만 집중할 수 있습니다.', focus: 'managed' },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '48px' }}>🗄️</span>
          <h3 className="text-lg font-bold text-amber-600">Cloud SQL</h3>
          <div className="w-full grid grid-cols-3 gap-2">
            {[
              { name: 'MySQL', icon: '🐬', color: '#3b82f6' },
              { name: 'PostgreSQL', icon: '🐘', color: '#6366f1' },
              { name: 'SQL Server', icon: '📊', color: '#ef4444' },
            ].map(function (db) {
              return (
                <div key={db.name} className="p-3 rounded-lg border-2 text-center" style={{ borderColor: db.color + '40' }}>
                  <span style={{ fontSize: '28px' }}>{db.icon}</span>
                  <div className="text-xs font-bold mt-1" style={{ color: db.color }}>{db.name}</div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-slate-400 text-center">관리형 = GCP가 서버 운영 대행</div>
        </div>
      );
    }

    if (focus === 'connect') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 w-full justify-center">
            <div className={getStatusClass('active', 'p-3 rounded-lg border-2 text-center')}>
              <span style={{ fontSize: '24px' }}>🐳</span>
              <div className="text-sm font-bold">Cloud Run</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs text-slate-400">Private IP</div>
              <div className="text-xl text-blue-500">⟷</div>
              <div className="text-xs text-slate-400">Auth Proxy</div>
            </div>
            <div className={getStatusClass('active', 'p-3 rounded-lg border-2 text-center')}>
              <span style={{ fontSize: '24px' }}>🗄️</span>
              <div className="text-sm font-bold">Cloud SQL</div>
            </div>
          </div>
          <div className="w-full mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700 text-center">
            외부 인터넷을 거치지 않는 Private IP 연결 → 빠르고 안전
          </div>
        </div>
      );
    }

    // managed
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">GCP가 대신 관리</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { item: 'OS 보안 패치', icon: '🔒', desc: '자동 업데이트' },
            { item: 'DB 버전 업그레이드', icon: '⬆️', desc: '무중단 업그레이드' },
            { item: '자동 백업', icon: '💾', desc: '매일 자동 + 수동' },
            { item: '장애 복구 (Failover)', icon: '🔄', desc: 'HA 구성 시 자동' },
          ].map(function (m) {
            return (
              <div key={m.item} className="p-3 rounded-lg border-2 border-green-200 bg-green-50 text-center">
                <span style={{ fontSize: '24px' }}>{m.icon}</span>
                <div className="text-sm font-bold text-green-700 mt-1">{m.item}</div>
                <div className="text-xs text-green-600">{m.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;
    var codes = {
      overview: '# Cloud SQL 인스턴스 생성\ngcloud sql instances create mydb \\\n  --database-version=POSTGRES_15 \\\n  --tier=db-f1-micro \\\n  --region=asia-northeast3\n\n# DB 사용자 생성\ngcloud sql users create myuser \\\n  --instance=mydb \\\n  --password=securepass',
      connect: '# Cloud Run에 Cloud SQL 연결\ngcloud run services update my-api \\\n  --add-cloudsql-instances \\\n  myproject:asia-northeast3:mydb\n\n# 환경 변수로 DB URL 전달\n--set-env-vars \\\n  DB_HOST=/cloudsql/myproject:\\\n  asia-northeast3:mydb',
      managed: '# 자동 백업 확인\ngcloud sql instances describe \\\n  mydb --format=\\\n  "value(settings.backupConfiguration)"\n\n# 수동 백업 생성\ngcloud sql backups create \\\n  --instance=mydb\n\n# 백업에서 복원\ngcloud sql backups restore \\\n  BACKUP_ID --restore-instance=mydb',
    };

    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">CLI 명령어</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400">Terminal</div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{codes[focus]}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
