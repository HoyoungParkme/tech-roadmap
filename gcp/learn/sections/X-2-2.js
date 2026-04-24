/**
 * X-2-2.js
 * 경로: learn/sections/X-2-2.js
 * 목적: "Cloud DNS" — Cloud DNS 설정 실습 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['X-2-2'] = function SectionX22() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var setupSteps = [
    { num: '1', title: 'Managed Zone 생성', desc: 'example.com 영역 + 네임서버 할당', icon: '📋' },
    { num: '2', title: '네임서버 변경', desc: '등록 업체에서 Cloud DNS NS로 변경', icon: '🔄' },
    { num: '3', title: 'A 레코드 추가', desc: 'api.example.com → LB IP 매핑', icon: '🎯' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — Cloud DNS 개요',
      desc: 'Cloud DNS는 Google 인프라 위에서 도메인의 DNS 레코드를 관리하는 서비스입니다. 100% SLA, 글로벌 Anycast 네트워크를 제공합니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — Managed Zone',
      desc: 'Managed Zone은 하나의 도메인(example.com)에 대한 DNS 레코드 모음입니다. Zone을 생성하면 GCP 네임서버(NS)가 할당됩니다.',
      focus: 'zone',
    },
    {
      title: 'STEP 3 — 레코드 설정',
      desc: 'A 레코드로 LB IP를 연결하고, CNAME으로 서브도메인 별칭을 만듭니다.',
      focus: 'records',
    },
    {
      title: 'STEP 4 — 전체 설정 흐름',
      desc: 'Zone 생성 → NS 변경 → 레코드 추가 → 확인까지 전체 과정을 CLI로 실습합니다.',
      focus: 'practice',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-4">
          <span style={{ fontSize: '48px' }}>☁️</span>
          <div className="text-base font-bold text-blue-600">Cloud DNS</div>
          <div className="w-full max-w-xs space-y-2">
            {[
              { label: '100% SLA', desc: '가장 높은 가용성 보장' },
              { label: '글로벌 Anycast', desc: '전 세계 어디서든 빠른 응답' },
              { label: 'DNSSEC 지원', desc: 'DNS 응답 위변조 방지' },
            ].map(function (item) {
              return (
                <div key={item.label} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-emerald-500">✅</span>
                  <div>
                    <div className="text-xs font-bold text-blue-700">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'zone') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-sm p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
            <div className="text-center mb-3">
              <div className="text-sm font-bold text-blue-600">Managed Zone: example.com</div>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-white rounded border border-slate-200 text-center">
                <div className="text-xs text-slate-400">NS 레코드 (자동 생성)</div>
                <code className="text-xs text-blue-600">ns-cloud-a1.googledomains.com</code>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200 text-center">
                <div className="text-xs text-slate-400">SOA 레코드 (자동 생성)</div>
                <code className="text-xs text-slate-500">권한 정보</code>
              </div>
              <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-center">
                <div className="text-xs text-slate-400">내가 추가할 레코드</div>
                <code className="text-xs text-emerald-600">A, CNAME, MX ...</code>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'records') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">레코드 설정 예시</div>
          </div>
          <div className="space-y-2">
            {[
              { name: 'api.example.com', type: 'A', value: '34.120.1.1', ttl: '300', desc: 'API → LB IP' },
              { name: 'www.example.com', type: 'CNAME', value: 'api.example.com.', ttl: '300', desc: 'www → api 별칭' },
              { name: 'example.com', type: 'A', value: '34.120.1.1', ttl: '300', desc: '루트 → LB IP' },
            ].map(function (r) {
              return (
                <div key={r.name + r.type} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-xs font-bold text-indigo-600">{r.name}</code>
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 rounded text-indigo-700 font-bold">{r.type}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    → <code>{r.value}</code> (TTL: {r.ttl}s)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{r.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // practice
    return (
      <div>
        <div className="text-center mb-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">설정 단계</div>
        </div>
        <div className="space-y-2">
          {setupSteps.map(function (s, i) {
            return (
              <div key={s.num}>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{s.num}</div>
                  <span style={{ fontSize: '20px' }}>{s.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{s.title}</div>
                    <div className="text-xs text-slate-500">{s.desc}</div>
                  </div>
                </div>
                {i < setupSteps.length - 1 && <div className="text-center text-slate-300 text-lg py-1">↓</div>}
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Cloud DNS vs 외부 DNS</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-center font-bold text-blue-500">Cloud DNS</th>
                <th className="py-2 text-center font-bold text-slate-500">외부 DNS</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['SLA', '100%', '99.x%'],
                ['GCP 통합', '네이티브', '수동 연동'],
                ['DNSSEC', '지원', '일부 지원'],
                ['비용', 'Zone당 $0.20/월', '무료~유료'],
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

    if (focus === 'zone') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">NS 변경이란?</div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>Cloud DNS Zone을 만들면</strong><br/>
              ns-cloud-a1~a4.googledomains.com 네임서버가 자동 할당됩니다.
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
              <strong>도메인 등록 업체에서</strong><br/>
              네임서버를 기존 → Google NS로 변경해야 합니다. (전파에 최대 48시간)
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>변경 후</strong><br/>
              이제 Cloud DNS에서 추가한 레코드가 전 세계에 적용됩니다.
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'records') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">TTL (Time To Live)</div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm font-semibold text-slate-700">TTL이란?</div>
              <div className="text-xs text-slate-500 mt-1">DNS 응답을 캐시하는 시간 (초). 짧으면 변경이 빠르고, 길면 DNS 부하가 줄어듭니다.</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>권장 TTL</strong><br/>
              일반: 300초 (5분) / 변경 예정 시: 60초 / 안정 후: 3600초 (1시간)
            </div>
          </div>
        </div>
      );
    }

    // practice
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">CLI 명령어</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud dns</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# 1. Managed Zone 생성\ngcloud dns managed-zones create my-zone \\\n  --dns-name="example.com." \\\n  --description="My DNS zone"\n\n# 2. NS 레코드 확인 (등록 업체에 입력)\ngcloud dns managed-zones describe my-zone\n\n# 3. A 레코드 추가\ngcloud dns record-sets create api.example.com. \\\n  --zone=my-zone \\\n  --type=A \\\n  --ttl=300 \\\n  --rrdatas="34.120.1.1"\n\n# 4. 확인\nnslookup api.example.com'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
