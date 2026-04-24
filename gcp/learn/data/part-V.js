/**
 * part-V.js
 * 경로: learn/data/part-V.js
 * 목적: Part V "네트워킹 · IAM" 4개 Section 본문 데이터
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sections = window.GCPLearn.sections || {};

window.GCPLearn.sections['V-1-1'] = {
  id: 'V-1-1', title: 'VPC — 나만의 가상 네트워크',
  part: 'V', partTitle: '네트워킹 · IAM', chapter: '1', chapterTitle: 'VPC와 IAM',
  difficulty: '★★★', prerequisites: 'IV-1-1',
  objective: '이 Section을 마치면 VPC·서브넷·방화벽 규칙의 관계를 설명하고 기본 VPC 구조를 파악할 수 있다.',
  paragraphs: [
    '회사 사무실 건물을 상상해보자. 건물 전체가 회사 소유이고, 각 층은 팀별로 구분되어 있다. 각 층 출입구에는 보안 도어가 달려 있어 권한 없는 직원은 들어올 수 없다. GCP에서 VPC(Virtual Private Cloud)는 바로 이 건물 역할을 한다.',
    'VPC 안에는 서브넷(Subnet)이 존재한다. 건물의 각 층처럼, 서브넷은 VPC라는 네트워크 공간을 용도별로 나누는 단위다. 층마다 달린 보안 도어가 방화벽 규칙(Firewall Rules)이다. "80, 443 포트만 외부에서 허용" 같은 규칙을 설정해 트래픽 흐름을 정밀하게 통제한다.',
    'Cloud Run은 기본적으로 VPC 외부에서 실행되는 서버리스 서비스지만, VPC Connector를 설정하면 Cloud Run이 VPC 내부 리소스, 즉 Private IP를 가진 Cloud SQL에 직접 접근할 수 있다.',
    'VPC는 GCP 네트워크 구조의 뼈대다. 서브넷으로 공간을 나누고, 방화벽 규칙으로 문을 제어하며, VPC Connector로 서버리스와 내부 네트워크를 잇는 구조를 파악하면 GCP 보안 설계의 절반을 이해한 것이다.',
  ],
  keywords: ['VPC(Virtual Private Cloud)', '서브넷(Subnet)', '방화벽 규칙(Firewall Rules)', 'VPC Connector', 'Private IP'],
  prevSection: 'IV-3-3', nextSection: 'V-1-2',
};

window.GCPLearn.sections['V-1-2'] = {
  id: 'V-1-2', title: 'IAM — 누가 무엇을 할 수 있는가',
  part: 'V', partTitle: '네트워킹 · IAM', chapter: '1', chapterTitle: 'VPC와 IAM',
  difficulty: '★★★', prerequisites: 'III-1-1',
  objective: '이 Section을 마치면 IAM의 역할(Role)·정책(Policy)·서비스 계정(Service Account)을 이해하고 최소 권한 원칙을 적용할 수 있다.',
  paragraphs: [
    '대형 병원을 떠올려보자. 의사는 환자 기록을 읽고 처방을 내릴 수 있다. 간호사는 기록을 읽고 처치를 수행하지만 처방은 내릴 수 없다. 청소부는 병실에 들어가지만 환자 기록에는 접근하지 못한다. GCP의 IAM(Identity and Access Management)이 이 출입 통제 시스템이다.',
    'IAM의 핵심 구성 요소는 세 가지다. 역할(Role)은 권한의 묶음이다. 서비스 계정(Service Account)은 사람이 아닌 앱이나 서비스가 GCP 리소스에 접근할 때 사용하는 계정이다.',
    '최소 권한 원칙이 여기서 구체화된다. Cloud Run이 Cloud SQL에 접근해야 한다면, Cloud Run의 서비스 계정에 roles/cloudsql.client 역할만 부여한다. 그 이상의 권한은 주지 않는다.',
    'IAM은 GCP 전체를 관통하는 권한 레이어다. 네트워크(VPC)로 공간을 분리하고, IAM으로 행동을 분리하면 외부 침입과 내부 실수 두 가지 위협을 동시에 방어할 수 있다.',
  ],
  keywords: ['IAM', '역할(Role)', '서비스 계정(Service Account)', '최소 권한 원칙(Least Privilege)', 'gcloud iam'],
  prevSection: 'V-1-1', nextSection: 'V-2-1',
};

window.GCPLearn.sections['V-2-1'] = {
  id: 'V-2-1', title: '로드 밸런서(Load Balancer) 심화',
  part: 'V', partTitle: '네트워킹 · IAM', chapter: '2', chapterTitle: 'LB와 보안',
  difficulty: '★★★', prerequisites: 'IV-1-1, V-1-1',
  objective: '이 Section을 마치면 GCP 글로벌 로드 밸런서 유형과 Cloud Run과의 관계를 설명할 수 있다.',
  paragraphs: [
    '국제공항의 입국 심사대를 생각해보자. 비행기 한 대에서 수백 명이 내려도 입국 심사관 여러 명이 동시에 처리한다. GCP의 Cloud Load Balancing이 이 역할을 한다. 쏟아지는 인터넷 트래픽을 여러 Cloud Run 인스턴스로 분산한다.',
    'Cloud Run을 공개 URL로 노출하면 GCP가 자동으로 Cloud Load Balancing을 붙여준다. 이 로드 밸런서는 글로벌 애니캐스트(Anycast) IP를 사용한다. 서울 사용자의 요청은 서울 거점에서, 뉴욕 사용자의 요청은 뉴욕 거점에서 처리된다. SSL Termination을 로드 밸런서가 담당한다.',
    '실무에서 자주 쓰이는 패턴 중 하나가 URL Map을 이용한 경로 기반 라우팅이다. /api 경로는 백엔드 Cloud Run으로, /admin 경로는 관리자 전용 Cloud Run으로 보내는 구조다.',
    '로드 밸런서는 트래픽의 첫 번째 관문이다. 글로벌 트래픽 분산, SSL 처리, 경로 기반 라우팅을 한 곳에서 해결해준다.',
  ],
  keywords: ['Cloud Load Balancing', '애니캐스트(Anycast)', 'SSL Termination', 'Google-managed SSL', 'URL Map'],
  prevSection: 'V-1-2', nextSection: 'V-2-2',
};

window.GCPLearn.sections['V-2-2'] = {
  id: 'V-2-2', title: 'Cloud Armor — DDoS 방어와 WAF',
  part: 'V', partTitle: '네트워킹 · IAM', chapter: '2', chapterTitle: 'LB와 보안',
  difficulty: '★★★', prerequisites: 'V-2-1',
  objective: '이 Section을 마치면 Cloud Armor를 로드 밸런서에 붙여 IP 차단·WAF 규칙을 적용할 수 있다.',
  paragraphs: [
    '유명 공연의 콘서트 입장 줄을 상상해보자. 악의적인 사람들이 가짜 표를 들고 줄을 혼잡하게 만들거나, 수천 명이 동시에 몰려 입구를 막아버리려 한다. Cloud Armor가 보안 요원 역할을 한다.',
    'Cloud Armor는 두 가지 방어 기능을 제공한다. 첫째는 DDoS 방어다. 비정상적으로 많은 요청이 특정 IP 대역에서 쏟아지면 자동으로 감지하고 차단한다. 둘째는 WAF(Web Application Firewall) 기능이다. SQL Injection, XSS 같은 웹 공격 패턴을 인식해 차단한다.',
    '특정 국가나 IP 대역에서 오는 트래픽을 허용하거나 차단하는 규칙도 보안 정책(Security Policy)으로 관리한다.',
    'VPC로 네트워크를 분리하고, IAM으로 권한을 통제하고, 로드 밸런서로 트래픽을 분산하고, Cloud Armor로 공격을 걸러내는 이 네 겹의 구조가 GCP 네트워킹·보안의 기본 골격이다.',
  ],
  keywords: ['Cloud Armor', 'DDoS', 'WAF(Web Application Firewall)', 'IP 차단', '보안 정책(Security Policy)'],
  prevSection: 'V-2-1', nextSection: 'VI-1-1',
};
