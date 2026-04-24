/**
 * X-1-2.js
 * 경로: learn/sections/X-1-2.js
 * 목적: "SSL 인증서와 HTTPS" — HTTPS 설정과 Managed SSL 4단계 인터랙티브
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sectionRenderers = window.GCPLearn.sectionRenderers || {};

window.GCPLearn.sectionRenderers['X-1-2'] = function SectionX12() {
  var InteractiveViewer = window.GCPLearn.InteractiveViewer;
  var getStatusClass = window.GCPLearn.getStatusClass;

  var lbParts = [
    { name: 'Backend Service', icon: '⚙️', desc: '인스턴스 그룹 + Health Check 연결', color: '#10b981' },
    { name: 'URL Map', icon: '🔀', desc: '경로별 백엔드 라우팅 규칙', color: '#3b82f6' },
    { name: 'Target HTTPS Proxy', icon: '🔒', desc: 'SSL 인증서 연결 + HTTPS 종료', color: '#8b5cf6' },
    { name: 'Forwarding Rule', icon: '🌐', desc: '외부 IP + 포트 443 수신 진입점', color: '#f59e0b' },
  ];

  var STEPS = [
    {
      title: 'STEP 1 — HTTPS가 필요한 이유',
      desc: 'HTTP는 평문 통신이라 중간에 데이터가 노출됩니다. HTTPS는 SSL/TLS로 암호화하여 안전합니다. 브라우저 주소창의 자물쇠 아이콘이 HTTPS를 나타냅니다.',
      focus: 'overview',
    },
    {
      title: 'STEP 2 — LB 구성 요소',
      desc: 'GCP HTTP(S) LB는 Backend Service, URL Map, HTTPS Proxy, Forwarding Rule 네 가지로 구성됩니다.',
      focus: 'parts',
    },
    {
      title: 'STEP 3 — Managed SSL 인증서',
      desc: 'GCP가 무료 SSL 인증서를 자동 발급·자동 갱신합니다. Let\'s Encrypt처럼 직접 갱신할 필요가 없습니다.',
      focus: 'ssl',
    },
    {
      title: 'STEP 4 — 전체 연결 흐름',
      desc: '도메인 → DNS → Forwarding Rule → HTTPS Proxy(SSL 종료) → URL Map → Backend Service → VM 순서로 연결됩니다.',
      focus: 'flow',
    },
  ];

  function renderDiagram(stepData, stepIdx) {
    var focus = stepData.focus;

    if (focus === 'overview') {
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-8 items-end">
            <div className="text-center">
              <span style={{ fontSize: '48px' }}>🔓</span>
              <div className="text-sm font-bold text-red-500 mt-1">HTTP</div>
              <div className="text-xs text-slate-400">평문 통신</div>
            </div>
            <div className="text-2xl text-slate-300 font-bold">vs</div>
            <div className="text-center">
              <span style={{ fontSize: '48px' }}>🔒</span>
              <div className="text-sm font-bold text-emerald-500 mt-1">HTTPS</div>
              <div className="text-xs text-slate-400">암호화 통신</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            HTTPS = HTTP + SSL/TLS 암호화<br/>GCP LB에서 SSL 종료(Termination) 처리
          </div>
        </div>
      );
    }

    if (focus === 'parts') {
      return (
        <div>
          <div className="text-center mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">HTTP(S) LB 구성</div>
          </div>
          <div className="space-y-2">
            {lbParts.map(function (p, i) {
              return (
                <div key={p.name}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{ background: p.color + '08', borderColor: p.color + '30' }}>
                    <span style={{ fontSize: '24px' }}>{p.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: p.color }}>{p.name}</div>
                      <div className="text-xs text-slate-500">{p.desc}</div>
                    </div>
                  </div>
                  {i < lbParts.length - 1 && <div className="text-center text-slate-300 text-base py-0.5">↕</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (focus === 'ssl') {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <span style={{ fontSize: '48px' }}>🛡️</span>
            <h3 className="text-base font-bold text-indigo-600 mt-1">Managed SSL Certificate</h3>
            <div className="text-xs text-slate-400">Google 자동 발급 · 자동 갱신</div>
          </div>
          <div className="space-y-2 w-full">
            {[
              { label: '비용', value: '무료', icon: '💰' },
              { label: '발급', value: '자동 (도메인 검증 후)', icon: '🤖' },
              { label: '갱신', value: '자동 (만료 전)', icon: '🔄' },
              { label: '와일드카드', value: '지원 (DNS 인증 시)', icon: '✳️' },
            ].map(function (item) {
              return (
                <div key={item.label} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                  <span>{item.icon}</span>
                  <div className="text-xs font-semibold text-slate-700 w-16">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // flow
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">HTTPS 요청 흐름</div>
        {[
          { icon: '👤', label: 'https://api.example.com', color: '#64748b' },
          { icon: '📡', label: 'Cloud DNS → LB IP', color: '#3b82f6' },
          { icon: '🔒', label: 'HTTPS Proxy (SSL 종료)', color: '#8b5cf6' },
          { icon: '🔀', label: 'URL Map → Backend Service', color: '#10b981' },
          { icon: '🖥️', label: 'VM (HTTP로 수신)', color: '#f59e0b' },
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">HTTP vs HTTPS</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-slate-500"></th>
                <th className="py-2 text-center font-bold text-red-500">HTTP</th>
                <th className="py-2 text-center font-bold text-emerald-500">HTTPS</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['포트', '80', '443'],
                ['암호화', '없음', 'TLS'],
                ['데이터 보호', '노출 위험', '안전'],
                ['SEO', '불리', '유리'],
                ['브라우저', '"안전하지 않음"', '자물쇠 표시'],
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

    if (focus === 'parts') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">각 요소 역할</div>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>Backend Service</strong>: MIG(인스턴스 그룹)를 연결하고 Health Check로 상태를 모니터링합니다.
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <strong>URL Map</strong>: /api/* → API 백엔드, /static/* → CDN 같은 경로 기반 라우팅을 정의합니다.
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-700">
              <strong>HTTPS Proxy</strong>: SSL 인증서를 연결하고, HTTPS 연결을 종료(복호화)합니다.
            </div>
          </div>
        </div>
      );
    }

    if (focus === 'ssl') {
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">SSL 인증서 유형</div>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
              <strong>Google-managed (권장)</strong><br/>
              무료, 자동 발급·갱신. 도메인 소유 확인만 하면 됩니다.
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700">
              <strong>Self-managed</strong><br/>
              직접 구매한 인증서를 업로드. 갱신도 직접 해야 합니다.
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>팁:</strong> Managed 인증서는 발급에 최대 60분 소요될 수 있습니다. 도메인 DNS가 LB IP를 가리킨 후 발급됩니다.
          </div>
        </div>
      );
    }

    // flow
    return (
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">CLI 명령어</div>
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70"></span>
            <span className="ml-1.5">gcloud ssl</span>
          </div>
          <div className="bg-slate-900 p-3 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{'# Managed SSL 인증서 생성\ngcloud compute ssl-certificates create my-cert \\\n  --domains=api.example.com \\\n  --global\n\n# HTTPS Proxy에 인증서 연결\ngcloud compute target-https-proxies create my-proxy \\\n  --ssl-certificates=my-cert \\\n  --url-map=my-url-map\n\n# Forwarding Rule (포트 443)\ngcloud compute forwarding-rules create my-rule \\\n  --target-https-proxy=my-proxy \\\n  --ports=443 --global'}</div>
        </div>
      </div>
    );
  }

  return <InteractiveViewer steps={STEPS} renderDiagram={renderDiagram} renderDetail={renderDetail} />;
};
