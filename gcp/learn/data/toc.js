/**
 * toc.js
 * 경로: learn/data/toc.js
 * 목적: 전체 52 Section + 부록 6개의 목차(TOC) 데이터
 * 주요 기능: 사이드바 렌더링, 네비게이션, 구현 상태 관리
 */
window.GCPLearn = window.GCPLearn || {};

window.GCPLearn.TOC = [
  {
    part: 'I', title: '왜 클라우드인가',
    chapters: [
      { chapter: '1', title: '클라우드 개념', sections: [
        { id: 'I-1-1', title: '내 서버를 직접 운영한다는 것', implemented: true },
        { id: 'I-1-2', title: '클라우드가 해결하는 세 가지 문제', implemented: true },
        { id: 'I-1-3', title: 'IaaS / PaaS / SaaS — 클라우드의 세 가지 형태', implemented: true },
      ]},
      { chapter: '2', title: '비용', sections: [
        { id: 'I-2-1', title: '클라우드 비용 구조 이해하기', implemented: true },
      ]},
    ]
  },
  {
    part: 'II', title: '클라우드 비교',
    chapters: [
      { chapter: '1', title: 'AWS vs Azure vs GCP', sections: [
        { id: 'II-1-1', title: '세 공룡의 포지션', implemented: true },
        { id: 'II-1-2', title: 'GCP의 특화 영역 — 데이터 · AI · 컨테이너', implemented: true },
        { id: 'II-1-3', title: '주요 서비스 대응표 (AWS vs GCP)', implemented: true },
      ]},
    ]
  },
  {
    part: 'III', title: 'GCP 계정 · gcloud CLI',
    chapters: [
      { chapter: '1', title: '계정과 CLI', sections: [
        { id: 'III-1-1', title: 'GCP 계정 생성과 프로젝트 구조', implemented: true },
        { id: 'III-1-2', title: 'gcloud CLI 설치와 초기 설정', implemented: true },
        { id: 'III-1-3', title: '리전(Region)과 존(Zone) 선택하기', implemented: true },
      ]},
      { chapter: '2', title: 'Console과 Billing', sections: [
        { id: 'III-2-1', title: 'Cloud Console 주요 화면 둘러보기', implemented: true },
        { id: 'III-2-2', title: 'Billing 알람 설정하기', implemented: true },
      ]},
    ]
  },
  {
    part: 'IV', title: 'Compute · Storage · DB',
    chapters: [
      { chapter: '1', title: 'Cloud Run', sections: [
        { id: 'IV-1-1', title: 'Cloud Run 요청이 처리되는 흐름 (시각화)', implemented: true },
        { id: 'IV-1-2', title: 'Dockerfile과 컨테이너 이미지 만들기', implemented: true },
        { id: 'IV-1-3', title: 'Cloud Run 배포 옵션 이해하기', implemented: true },
      ]},
      { chapter: '2', title: 'Storage', sections: [
        { id: 'IV-2-1', title: 'Cloud Storage — 파일을 클라우드에 보관하기', implemented: true },
      ]},
      { chapter: '3', title: 'Database', sections: [
        { id: 'IV-3-1', title: 'Cloud SQL — 관리형 관계형 데이터베이스', implemented: true },
        { id: 'IV-3-2', title: 'Cloud SQL 연결 — 환경 변수와 Secret Manager', implemented: true },
        { id: 'IV-3-3', title: 'Cloud SQL Studio 사용하기', implemented: true },
      ]},
    ]
  },
  {
    part: 'V', title: '네트워킹 · IAM',
    chapters: [
      { chapter: '1', title: 'VPC와 IAM', sections: [
        { id: 'V-1-1', title: 'VPC — 나만의 가상 네트워크', implemented: true },
        { id: 'V-1-2', title: 'IAM — 누가 무엇을 할 수 있는가', implemented: true },
      ]},
      { chapter: '2', title: 'LB와 보안', sections: [
        { id: 'V-2-1', title: '로드 밸런서(Load Balancer) 심화', implemented: true },
        { id: 'V-2-2', title: 'Cloud Armor — DDoS 방어와 WAF', implemented: true },
      ]},
    ]
  },
  {
    part: 'VI', title: '실전 배포 프로젝트',
    chapters: [
      { chapter: '1', title: '프로젝트 설계와 배포', sections: [
        { id: 'VI-1-1', title: '프로젝트 설계 — 3계층 아키텍처', implemented: true },
        { id: 'VI-1-2', title: 'CI/CD 파이프라인 — Cloud Build', implemented: true },
        { id: 'VI-1-3', title: '환경 분리 — dev · staging · prod', implemented: true },
      ]},
    ]
  },
  {
    part: 'VII', title: 'Cloud Run 배포 · 운영',
    chapters: [
      { chapter: '1', title: '모니터링', sections: [
        { id: 'VII-1-1', title: 'Cloud Logging으로 로그 확인하기', implemented: true },
        { id: 'VII-1-2', title: 'Cloud Monitoring — 알림과 대시보드', implemented: true },
        { id: 'VII-1-3', title: '트래픽 분산과 점진적 배포 (Traffic Splitting)', implemented: true },
      ]},
      { chapter: '2', title: '비용 최적화', sections: [
        { id: 'VII-2-1', title: '비용 최적화 — Cloud Run 설정 튜닝', implemented: true },
      ]},
    ]
  },
  {
    part: 'VIII', title: 'Compute Engine — VM 기반 인프라',
    chapters: [
      { chapter: '1', title: 'VM 기초', sections: [
        { id: 'VIII-1-1', title: 'Compute Engine이란? — IaaS와 VM', implemented: true },
        { id: 'VIII-1-2', title: 'Compute Engine 인스턴스 생성과 방화벽 규칙', implemented: true },
        { id: 'VIII-1-3', title: '예제 앱을 Compute Engine에서 실행하기', implemented: true },
      ]},
      { chapter: '2', title: '네트워크와 보안', sections: [
        { id: 'VIII-2-1', title: 'Public Subnet과 Private Subnet', implemented: true },
        { id: 'VIII-2-2', title: 'Private Compute Engine과 Bastion Host', implemented: true },
        { id: 'VIII-2-3', title: 'IAP로 Private 인스턴스에 접근하기', implemented: true },
      ]},
    ]
  },
  {
    part: 'IX', title: 'IAM · VPC 실습',
    chapters: [
      { chapter: '1', title: 'IAM 실습', sections: [
        { id: 'IX-1-1', title: 'Service Account 생성과 권한 부여', implemented: true },
        { id: 'IX-1-2', title: '특정 사용자의 리소스 접근 제어', implemented: true },
      ]},
      { chapter: '2', title: 'VPC 실습', sections: [
        { id: 'IX-2-1', title: 'VPC 직접 생성하기', implemented: true },
        { id: 'IX-2-2', title: 'Subnet 추가와 방화벽 규칙 관리', implemented: true },
      ]},
    ]
  },
  {
    part: 'X', title: 'Load Balancer · 도메인 실습',
    chapters: [
      { chapter: '1', title: 'LB 실습', sections: [
        { id: 'X-1-1', title: '인스턴스 템플릿·그룹·Health Check', implemented: true },
        { id: 'X-1-2', title: 'Load Balancer 생성하기', implemented: true },
      ]},
      { chapter: '2', title: '도메인 실습', sections: [
        { id: 'X-2-1', title: '도메인이란? — 도메인 구매와 등록', implemented: true },
        { id: 'X-2-2', title: 'Cloud DNS로 도메인과 IP 매핑하기', implemented: true },
      ]},
    ]
  },
  {
    part: 'XI', title: '데이터 분석 — BigQuery',
    chapters: [
      { chapter: '1', title: 'BigQuery', sections: [
        { id: 'XI-1-1', title: 'BigQuery란? — 서버리스 데이터 웨어하우스', implemented: true },
        { id: 'XI-1-2', title: 'BigQuery 사용하기 — 데이터 업로드와 SQL 쿼리', implemented: true },
        { id: 'XI-1-3', title: 'Looker Studio로 데이터 시각화하기', implemented: true },
      ]},
    ]
  },
  {
    part: 'XII', title: 'GKE — 컨테이너 오케스트레이션',
    chapters: [
      { chapter: '1', title: 'GKE', sections: [
        { id: 'XII-1-1', title: 'GKE란? — Autopilot vs Standard', implemented: true },
        { id: 'XII-1-2', title: 'GKE Autopilot 클러스터 생성하기', implemented: true },
        { id: 'XII-1-3', title: 'GKE에 Nginx 웹서버 배포하기', implemented: true },
      ]},
    ]
  },
  {
    part: 'XIII', title: 'AI — AgentBuilder',
    chapters: [
      { chapter: '1', title: 'AgentBuilder', sections: [
        { id: 'XIII-1-1', title: 'AgentBuilder란? — 대화형 AI 에이전트', implemented: true },
        { id: 'XIII-1-2', title: '웹검색 기반 대화형 에이전트 구현하기', implemented: true },
      ]},
    ]
  },
];

// 부록은 별도 배열
window.GCPLearn.APPENDIX = [
  { id: 'A', title: 'GCP 핵심 용어집', implemented: false },
  { id: 'B', title: '자주 묻는 질문 (FAQ)', implemented: false },
  { id: 'C', title: '다음에 공부할 것', implemented: false },
  { id: 'D', title: '참고 자료', implemented: false },
  { id: 'E', title: '리소스 명명규칙', implemented: false },
  { id: 'F', title: '아키텍처 문서화 — draw.io 활용법', implemented: false },
];
