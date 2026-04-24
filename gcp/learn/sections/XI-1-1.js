/**
 * XI-1-1.js
 * 경로: learn/sections/XI-1-1.js
 * 목적: "OLTP vs OLAP" — 트랜잭션 처리 vs 분석 처리 비교 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['XI-1-1'] = function SectionXI11() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var oltpFeatures = [
    { icon: '🏪', text: '주문 1건 삽입', detail: 'INSERT INTO orders VALUES(...)' },
    { icon: '👤', text: '회원 정보 수정', detail: 'UPDATE users SET name=... WHERE id=1' },
    { icon: '💳', text: '결제 처리', detail: 'BEGIN → 잔액 차감 → 주문 상태 변경 → COMMIT' },
  ];

  var olapFeatures = [
    { icon: '📊', text: '1년 매출 합계', detail: 'SELECT SUM(amount) FROM orders WHERE year=2025' },
    { icon: '📈', text: '월별 성장률 분석', detail: 'GROUP BY month, 윈도우 함수 활용' },
    { icon: '🗺️', text: '지역별 트렌드', detail: 'JOIN 여러 테이블 + 수천만 행 집계' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 두 가지 데이터 처리 방식',
      desc: '데이터베이스 워크로드는 크게 OLTP(트랜잭션)와 OLAP(분석)으로 나뉩니다. 편의점 계산대(OLTP)와 본사 매출 분석(OLAP)으로 비유할 수 있습니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — OLTP (Cloud SQL)',
      desc: 'OLTP는 소수의 행을 빠르게 읽고 씁니다. 회원 가입, 주문 처리, 결제 등 실시간 서비스에 사용합니다. GCP에서는 Cloud SQL이 대표적입니다.',
      focus: 'oltp',
    },
    {
      title: 'STEP 3 — OLAP (BigQuery)',
      desc: 'OLAP는 수천만~수억 행을 한꺼번에 스캔하여 집계·분석합니다. 매출 분석, 사용자 행동 분석 등에 사용합니다. GCP에서는 BigQuery가 대표적입니다.',
      focus: 'olap',
    },
    {
      title: 'STEP 4 — 핵심 비교',
      desc: 'OLTP와 OLAP는 목적이 다르므로 동일 DB로 처리하면 성능 문제가 발생합니다. 서비스 DB(OLTP)와 분석 DB(OLAP)를 분리하는 것이 핵심입니다.',
      focus: 'compare',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-8 items-end">
            <div className="text-center">
              <span style={{ fontSize: '56px' }}>🏪</span>
              <div className="text-sm font-bold text-amber-500 mt-1">편의점 계산대</div>
              <div className="text-xs text-slate-400">OLTP</div>
            </div>
            <div className="text-2xl text-slate-300 font-bold">vs</div>
            <div className="text-center">
              <span style={{ fontSize: '56px' }}>📊</span>
              <div className="text-sm font-bold text-blue-500 mt-1">본사 매출 분석</div>
              <div className="text-xs text-slate-400">OLAP</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            둘 다 데이터를 다룬다.<br/>처리 방식과 목적이 완전히 다르다.
          </div>
        </div>
      );
    }

    if (focus === 'oltp') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>🏪</span>
            <h3 className="text-lg font-bold text-amber-500">OLTP (Cloud SQL)</h3>
            <div className="text-xs text-slate-400">소수의 행을 빠르게 읽고 쓰기</div>
          </div>
          <div className="space-y-2">
            {oltpFeatures.map(function (item) {
              return (
                <div key={item.text} className="flex items-center gap-3 p-2 rounded-lg border bg-amber-50 border-amber-200 transition-all duration-500">
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{item.text}</div>
                    <code className="text-xs text-slate-500">{item.detail}</code>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'olap') {
      return (
        <div>
          <div className="text-center mb-3">
            <span style={{ fontSize: '40px' }}>📊</span>
            <h3 className="text-lg font-bold text-blue-500">OLAP (BigQuery)</h3>
            <div className="text-xs text-slate-400">수천만 행을 한꺼번에 훑기</div>
          </div>
          <div className="space-y-2">
            {olapFeatures.map(function (item) {
              return (
                <div key={item.text} className="flex items-center gap-3 p-2 rounded-lg border bg-blue-50 border-blue-200 transition-all duration-500">
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{item.text}</div>
                    <code className="text-xs text-slate-500">{item.detail}</code>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // compare
    return (
      <div>
        <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">항목별 비교</div>
        <div className="space-y-2">
          {['처리 대상', '응답 시간', '동시성', 'GCP 서비스', '과금'].map(function (label, i) {
            var oltp = ['소수 행 (1~100건)', '밀리초 (ms)', '수천 동시 트랜잭션', 'Cloud SQL', '인스턴스 시간 기반'];
            var olap = ['수천만~수억 행', '초~분', '소수 대형 쿼리', 'BigQuery', '스캔한 데이터 양 기반'];
            return (
              <div key={label} className="grid grid-cols-3 gap-2 text-xs">
                <div className="font-semibold text-slate-600 py-2 text-center">{label}</div>
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center text-amber-700">{oltp[i]}</div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center text-blue-700">{olap[i]}</div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">핵심 질문</div>
          <div className="space-y-3">
            {[
              { q: 'OLTP는 언제 쓰나요?', a: '실시간 서비스: 주문, 결제, 로그인 처리' },
              { q: 'OLAP는 언제 쓰나요?', a: '데이터 분석: 매출 집계, 사용자 행동 분석' },
              { q: '왜 분리하나요?', a: '분석 쿼리가 서비스 DB를 느리게 만들기 때문' },
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

    if (focus === 'oltp') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Cloud SQL 특징</div>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
              <strong>완전 관리형 RDBMS</strong><br/>
              MySQL, PostgreSQL, SQL Server 중 선택
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              <strong>ACID 트랜잭션</strong><br/>
              데이터 무결성 보장 (결제 처리에 필수)
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>자동 백업 + 고가용성</strong><br/>
              리전 간 복제, 자동 장애 조치
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'olap') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">BigQuery 특징</div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>서버리스 데이터 웨어하우스</strong><br/>
              인프라 관리 없이 SQL만으로 분석
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              <strong>컬럼 기반 저장</strong><br/>
              필요한 컬럼만 스캔 → 대규모 집계에 최적화
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>스캔한 데이터만 과금</strong><br/>
              매월 1TB 무료, 이후 $5/TB
            </div>
          </div>
        </div>
      );
    }

    // compare
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">요약</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-left text-slate-500"></th>
              <th className="py-2 text-center font-bold text-amber-500">OLTP</th>
              <th className="py-2 text-center font-bold text-blue-500">OLAP</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['목적', '서비스 운영', '데이터 분석'],
              ['데이터 양', '소량 (행 단위)', '대량 (테이블 전체)'],
              ['속도', '밀리초', '초~분'],
              ['GCP', 'Cloud SQL', 'BigQuery'],
              ['비용 모델', '인스턴스 시간', '스캔 데이터 양'],
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

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
