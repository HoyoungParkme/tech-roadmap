/**
 * IV-3-3.js — "Cloud SQL Studio" — 웹 SQL 에디터 3단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['IV-3-3'] = function SectionIV33() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;

  var STEPS = [
    { title: 'STEP 1 — SQL Studio란?', desc: 'Cloud Console 안에서 바로 SQL을 실행할 수 있는 웹 에디터입니다. 별도 DB 클라이언트 설치 없이 브라우저에서 테이블 조회, 데이터 삽입, 스키마 수정을 할 수 있습니다.', focus: 'overview' },
    { title: 'STEP 2 — 🔍 데이터 확인', desc: 'Cloud Run 배포 후 "DB에 데이터가 제대로 들어갔나?" 확인할 때 SQL Studio를 씁니다. SELECT 쿼리로 즉시 확인 가능합니다.', focus: 'query' },
    { title: 'STEP 3 — 🏗️ 스키마 프로토타이핑', desc: '테이블 구조를 빠르게 만들고 수정할 때 사용합니다. CREATE TABLE, ALTER TABLE, 시드 데이터 INSERT를 브라우저에서 바로 실행합니다.', focus: 'schema' },
  ];

  var queryResults = [
    { id: 1, name: '김개발', email: 'dev@example.com' },
    { id: 2, name: '이클라우드', email: 'cloud@example.com' },
    { id: 3, name: '박서버', email: 'server@example.com' },
  ];

  function renderDiagram(stepData) {
    var focus = stepData.focus;
    var sql = {
      overview: 'SELECT * FROM users LIMIT 5;',
      query: "SELECT * FROM users\nWHERE created_at > '2024-01-01'\nORDER BY id DESC\nLIMIT 5;",
      schema: "CREATE TABLE products (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  price INTEGER DEFAULT 0,\n  created_at TIMESTAMP\n    DEFAULT NOW()\n);",
    };

    return (
      <div>
        {/* SQL Studio 모형 */}
        <div className="rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
          {/* 상단 바 */}
          <div className="bg-slate-800 px-3 py-2 flex items-center gap-2 text-xs">
            <span>🗄️</span>
            <span className="text-cyan-400 font-bold">Cloud SQL Studio</span>
            <span className="ml-auto text-slate-400">mydb (PostgreSQL 15)</span>
          </div>
          {/* SQL 에디터 */}
          <div className="bg-slate-900 p-3 font-mono text-sm leading-relaxed">
            <div className="text-slate-300 whitespace-pre-wrap">{sql[focus]}</div>
          </div>
          {/* 결과 테이블 */}
          {(focus === 'overview' || focus === 'query') && (
            <div className="border-t border-slate-200 p-3 bg-white">
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="font-bold text-slate-400 bg-slate-100 p-1.5 rounded">id</div>
                <div className="font-bold text-slate-400 bg-slate-100 p-1.5 rounded">name</div>
                <div className="font-bold text-slate-400 bg-slate-100 p-1.5 rounded">email</div>
                {queryResults.map(function (r) {
                  return (
                    <React.Fragment key={r.id}>
                      <div className="p-1.5 text-slate-600">{r.id}</div>
                      <div className="p-1.5 text-slate-600">{r.name}</div>
                      <div className="p-1.5 text-slate-600">{r.email}</div>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-slate-400">{queryResults.length} rows returned</div>
            </div>
          )}
          {focus === 'schema' && (
            <div className="border-t border-slate-200 p-3 bg-green-50">
              <div className="text-xs text-green-600 font-semibold">✓ CREATE TABLE executed successfully</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderDetail(stepData) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">접근 방법</div>
          <div className="space-y-2">
            {[
              '1. Cloud Console → Cloud SQL',
              '2. 인스턴스 선택',
              '3. "SQL Studio" 탭 클릭',
              '4. DB/사용자 선택',
              '5. SQL 입력 → 실행',
            ].map(function (step, i) {
              return (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <span className="text-slate-600">{step.substring(3)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁</strong>: DBeaver, pgAdmin 등 외부 도구 설치 없이 바로 사용 가능!
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
          {focus === 'query' ? '실무 활용' : '스키마 설계 팁'}
        </div>
        <div className="space-y-2">
          {(focus === 'query' ? [
            { icon: '🔍', text: '배포 후 데이터 검증' },
            { icon: '🐛', text: '버그 원인 데이터 조회' },
            { icon: '📊', text: '간단한 집계 쿼리 실행' },
            { icon: '🧹', text: '테스트 데이터 정리' },
          ] : [
            { icon: '🏗️', text: 'CREATE TABLE로 빠른 프로토타이핑' },
            { icon: '🔄', text: 'ALTER TABLE로 스키마 변경' },
            { icon: '📥', text: 'INSERT로 시드 데이터 삽입' },
            { icon: '⚠️', text: '운영 DB에서는 주의! (prod 접근 제한 권장)' },
          ]).map(function (item) {
            return (
              <div key={item.text} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <span>{item.icon}</span>
                <span className="text-slate-600">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
