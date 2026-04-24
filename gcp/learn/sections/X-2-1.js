/**
 * X-2-1.js
 * 경로: learn/sections/X-2-1.js
 * 목적: "도메인이란" — 도메인과 DNS 기초 개념 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['X-2-1'] = function SectionX21() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var domainParts = [
    { name: 'TLD (최상위 도메인)', example: '.com, .kr, .io', desc: '도메인 맨 오른쪽 부분', color: '#ef4444' },
    { name: 'Second Level', example: 'example', desc: '내가 직접 정하는 이름', color: '#3b82f6' },
    { name: 'Subdomain', example: 'api, www, dev', desc: '서브 도메인으로 서비스 구분', color: '#10b981' },
  ];

  var recordTypes = [
    { type: 'A', desc: '도메인 → IPv4 주소', example: 'api.example.com → 34.120.1.1' },
    { type: 'AAAA', desc: '도메인 → IPv6 주소', example: 'api.example.com → 2001:db8::1' },
    { type: 'CNAME', desc: '도메인 → 다른 도메인', example: 'www → api.example.com' },
    { type: 'MX', desc: '메일 서버 지정', example: '@ → mail.example.com' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — 도메인 = 전화번호부',
      desc: '"api.example.com"은 사람이 읽기 쉬운 주소이고, 실제로는 "34.120.xx.xx" 같은 IP로 변환됩니다. DNS는 이름 → IP 변환을 담당하는 전화번호부입니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — 도메인 구조',
      desc: '도메인은 TLD(최상위) → Second Level → Subdomain으로 구성됩니다. "api.example.com"에서 .com이 TLD, example이 이름, api가 서브도메인입니다.',
      focus: 'structure',
    },
    {
      title: 'STEP 3 — DNS 레코드 타입',
      desc: 'A 레코드는 IP를 직접 가리키고, CNAME은 다른 도메인을 가리킵니다. 용도에 따라 적절한 레코드 타입을 선택합니다.',
      focus: 'records',
    },
    {
      title: 'STEP 4 — DNS 조회 흐름',
      desc: '브라우저 → 로컬 캐시 → Recursive Resolver → 루트/TLD/권한 DNS 순서로 조회합니다.',
      focus: 'lookup',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 items-center flex-wrap justify-center">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span style={{ fontSize: '36px' }}>🏷️</span>
              <div className="text-sm font-bold text-blue-600 mt-1">api.example.com</div>
              <div className="text-xs text-slate-400">사람이 읽는 주소</div>
            </div>
            <div className="text-lg text-blue-400 font-bold">→ DNS 조회 →</div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <span style={{ fontSize: '36px' }}>📡</span>
              <div className="text-sm font-bold text-emerald-600 mt-1">34.120.xx.xx</div>
              <div className="text-xs text-slate-400">서버가 읽는 IP</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            DNS = 인터넷의 전화번호부
          </div>
        </div>
      );
    }

    if (focus === 'structure') {
      return (
        <div>
          <div className="text-center mb-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 inline-block">
              <code className="text-lg">
                <span className="text-emerald-600 font-bold">api</span>
                <span className="text-slate-400">.</span>
                <span className="text-blue-600 font-bold">example</span>
                <span className="text-slate-400">.</span>
                <span className="text-red-500 font-bold">com</span>
              </code>
            </div>
          </div>
          <div className="space-y-2">
            {domainParts.map(function (p) {
              return (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ background: p.color + '08', borderColor: p.color + '30' }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }}></div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: p.color }}>{p.name}</div>
                    <div className="text-xs text-slate-500">{p.example} — {p.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'records') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">DNS 레코드 타입</div>
          </div>
          <div className="space-y-2">
            {recordTypes.map(function (r) {
              return (
                <div key={r.type} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600">{r.type}</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700">{r.desc}</div>
                      <code className="text-xs text-slate-400">{r.example}</code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // lookup
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">DNS 조회 흐름</div>
        {[
          { icon: '💻', label: '브라우저 캐시 확인', color: '#64748b' },
          { icon: '🏠', label: 'OS 로컬 캐시 확인', color: '#6b7280' },
          { icon: '🔄', label: 'Recursive Resolver (ISP)', color: '#3b82f6' },
          { icon: '🌍', label: '루트 → TLD → 권한 DNS', color: '#8b5cf6' },
          { icon: '✅', label: 'IP 반환 → 연결', color: '#10b981' },
        ].map(function (item, i) {
          return (
            <div key={item.label}>
              <div className="flex items-center gap-2 p-2 rounded border"
                style={{ borderColor: item.color + '30' }}>
                <span>{item.icon}</span>
                <div className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</div>
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">핵심 질문</div>
          <div className="space-y-3">
            {[
              { q: '왜 도메인을 쓰나요?', a: 'IP(34.120.xx.xx)보다 기억하기 쉽고, IP가 바뀌어도 도메인은 유지' },
              { q: '도메인은 어디서 사나요?', a: '도메인 등록 업체 (Google Domains, 가비아 등)' },
              { q: 'DNS 서버는 뭔가요?', a: '도메인→IP 매핑 정보를 저장·응답하는 서버' },
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

    if (focus === 'structure') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">실전 예시</div>
          <div className="space-y-2">
            {[
              { domain: 'api.myapp.com', use: 'API 서버' },
              { domain: 'www.myapp.com', use: '웹 프론트엔드' },
              { domain: 'dev.myapp.com', use: '개발 환경' },
              { domain: 'staging.myapp.com', use: '스테이징 환경' },
            ].map(function (d) {
              return (
                <div key={d.domain} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-xs font-bold text-indigo-600">{d.domain}</code>
                  <span className="text-xs text-slate-500">{d.use}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁:</strong> 서브도메인은 무료로 무제한 생성 가능합니다. 환경별·서비스별로 분리하세요.
          </div>
        </div>
      );
    }

    if (focus === 'records') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">레코드 선택 가이드</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500">상황</th>
                <th className="py-2 text-center text-slate-500">레코드</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['LB IP 연결', 'A'],
                ['다른 도메인으로 별칭', 'CNAME'],
                ['메일 서버 설정', 'MX'],
                ['텍스트 검증 (SPF 등)', 'TXT'],
              ].map(function (row) {
                return (
                  <tr key={row[0]} className="border-b border-slate-100">
                    <td className="py-2 text-xs text-slate-600">{row[0]}</td>
                    <td className="py-2 text-center text-xs font-bold text-indigo-600">{row[1]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>주의:</strong> CNAME은 루트 도메인(@)에 사용할 수 없습니다. 루트에는 A 레코드를 사용하세요.
          </div>
        </div>
      );
    }

    // lookup
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">직접 확인해보기</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">터미널</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# DNS 조회 (A 레코드)\nnslookup api.example.com\n\n# 상세 DNS 추적\ndig api.example.com +trace\n\n# TTL(캐시 시간) 확인\ndig api.example.com +noall +answer\n\n# 결과 예시:\n# api.example.com  300  IN  A  34.120.1.1\n# TTL=300 → 5분간 캐시'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
