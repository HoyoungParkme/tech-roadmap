/**
 * part-VIII.js — Part VIII "Compute Engine — VM 기반 인프라" 6개 Section 데이터
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sections = window.GCPLearn.sections || {};

window.GCPLearn.sections['VIII-1-1'] = {
  id: 'VIII-1-1', title: 'Compute Engine이란? — IaaS와 VM',
  part: 'VIII', partTitle: 'Compute Engine — VM 기반 인프라', chapter: '1', chapterTitle: 'VM 기초',
  difficulty: '★★☆', prerequisites: 'I-1-3, III-1-2',
  objective: '이 Section을 마치면 Compute Engine과 Cloud Run의 차이를 설명하고, VM 기반 배포가 필요한 상황을 판단할 수 있다.',
  paragraphs: [
    'Part I에서 IaaS를 "피자 재료를 직접 사다가 오븐을 켜는 방식"으로 설명했다. GCP의 Compute Engine이 바로 이 역할이다. 원하는 사양의 가상 서버(VM)를 직접 골라 운영체제부터 세팅하는 IaaS 서비스다.',
    'Compute Engine은 CPU 개수, 메모리 용량, OS를 선택해 VM을 만들고, 무엇을 설치하고 어떻게 설정할지를 직접 결정한다. Cloud Run과 달리 OS 패치, 보안 설정, 프로세스 관리까지 개발자가 직접 책임진다.',
    'Cloud Run으로 처리하기 어려운 워크로드가 Compute Engine의 무대다. GPU가 필요한 ML 학습, 특정 OS 커널 설정이 필요한 레거시 앱, 몇 시간씩 돌아가는 배치 작업 등이다.',
    'Compute Engine은 제어가 필요한 상황에서 선택하는 IaaS 서비스다. 대부분의 웹 서비스는 Cloud Run으로 충분하다.',
  ],
  keywords: ['Compute Engine', '가상 머신(VM)', 'IaaS', '머신 타입(Machine Type)', 'e2-micro'],
  prevSection: 'VII-2-1', nextSection: 'VIII-1-2',
};

window.GCPLearn.sections['VIII-1-2'] = {
  id: 'VIII-1-2', title: 'Compute Engine 인스턴스 생성과 방화벽 규칙',
  part: 'VIII', partTitle: 'Compute Engine — VM 기반 인프라', chapter: '1', chapterTitle: 'VM 기초',
  difficulty: '★★☆', prerequisites: 'VIII-1-1',
  objective: '이 Section을 마치면 gcloud 명령으로 Compute Engine 인스턴스를 생성하고, 방화벽 규칙으로 특정 포트를 열 수 있다.',
  paragraphs: [
    '새 건물에 입주하면 처음에는 현관문이 잠겨 있다. Compute Engine 인스턴스도 비슷하다. GCP 방화벽이 기본적으로 외부 트래픽을 모두 차단하고 있어서, 필요한 포트를 명시적으로 열어야 한다.',
    '인스턴스를 만들 때는 존(Zone), 머신 타입, OS 이미지 세 가지를 지정해야 한다. 방화벽 규칙은 네트워크 태그가 일치하는 인스턴스에만 적용된다.',
    '핵심은 "허용하지 않으면 모두 차단"이라는 기본 원칙이다. HTTP(80)를 열면 웹 요청이, SSH(22)는 gcloud compute ssh가 자동으로 처리한다.',
  ],
  codeBlocks: [
    { title: '인스턴스 생성 + 방화벽', language: 'bash',
      code: '# Compute Engine 인스턴스 생성\ngcloud compute instances create my-instance \\\n  --zone=asia-northeast3-a \\\n  --machine-type=e2-micro \\\n  --image-family=debian-12 \\\n  --image-project=debian-cloud\n\n# 방화벽 규칙 생성 (HTTP 80포트 허용)\ngcloud compute firewall-rules create allow-http \\\n  --allow=tcp:80 \\\n  --target-tags=http-server' },
  ],
  keywords: ['gcloud compute instances create', '머신 타입', '이미지 패밀리', '방화벽 규칙(Firewall Rules)', '네트워크 태그'],
  prevSection: 'VIII-1-1', nextSection: 'VIII-1-3',
};

window.GCPLearn.sections['VIII-1-3'] = {
  id: 'VIII-1-3', title: '예제 앱을 Compute Engine에서 실행하기',
  part: 'VIII', partTitle: 'Compute Engine — VM 기반 인프라', chapter: '1', chapterTitle: 'VM 기초',
  difficulty: '★★★', prerequisites: 'VIII-1-2',
  objective: '이 Section을 마치면 Compute Engine에 SSH로 접속해 앱을 빌드·실행하고, 외부에서 접근할 수 있다.',
  paragraphs: [
    'Cloud Run에 앱을 올릴 때는 Dockerfile을 작성했다. Compute Engine은 다르다. SSH로 VM에 접속하고, 패키지를 설치하고, 앱을 실행한다. 로컬 PC에서 개발 서버를 띄우는 과정과 거의 같다.',
    'gcloud compute ssh 명령을 쓰면 SSH 키 생성과 업로드를 GCP가 자동으로 처리한다. VM을 재시작하면 실행 중이던 프로세스가 모두 종료되므로, 운영 환경에서는 systemd로 자동 시작 설정이 필요하다.',
    'Compute Engine에서 앱을 실행하는 과정은 IaaS의 특성을 그대로 보여준다. 편의성은 Cloud Run보다 낮지만, OS와 네트워크 설정을 원하는 대로 제어할 수 있다.',
  ],
  codeBlocks: [
    { title: 'SSH 접속 및 앱 실행', language: 'bash',
      code: '# Compute Engine에 SSH 접속\ngcloud compute ssh my-instance --zone=asia-northeast3-a\n\n# 인스턴스 내부에서 앱 실행\nsudo apt update && sudo apt install -y python3-pip\npip3 install flask\npython3 app.py' },
  ],
  keywords: ['gcloud compute ssh', 'SSH', '패키지 설치', '포트 바인딩', 'systemd'],
  prevSection: 'VIII-1-2', nextSection: 'VIII-2-1',
};

window.GCPLearn.sections['VIII-2-1'] = {
  id: 'VIII-2-1', title: 'Public Subnet과 Private Subnet',
  part: 'VIII', partTitle: 'Compute Engine — VM 기반 인프라', chapter: '2', chapterTitle: '네트워크와 보안',
  difficulty: '★★★', prerequisites: 'V-1-1, VIII-1-1',
  objective: '이 Section을 마치면 Public Subnet과 Private Subnet의 차이를 설명하고, 보안을 위해 서비스를 Private Subnet에 배치하는 이유를 이해할 수 있다.',
  paragraphs: [
    '건물 1층에는 누구나 들어올 수 있는 안내 데스크가 있고, 2층 이상 개발실에는 사원증이 있는 직원만 출입할 수 있다. Public Subnet은 1층이고, Private Subnet은 카드키가 필요한 내부 사무실이다.',
    'Public Subnet의 인스턴스는 외부 IP를 부여받아 인터넷에서 직접 접근 가능하다. Private Subnet의 인스턴스는 외부 IP가 없어 직접 도달하지 못하며, 아웃바운드 요청은 NAT Gateway를 경유한다.',
    '실무에서는 웹 서버만 Public Subnet에 두고, DB 서버나 내부 API는 Private Subnet에 배치한다. 공격 표면(Attack Surface)을 최소화하는 것이 핵심이다.',
  ],
  keywords: ['Public Subnet', 'Private Subnet', '외부 IP(External IP)', 'NAT Gateway', '공격 표면(Attack Surface)'],
  prevSection: 'VIII-1-3', nextSection: 'VIII-2-2',
};

window.GCPLearn.sections['VIII-2-2'] = {
  id: 'VIII-2-2', title: 'Private Compute Engine과 Bastion Host',
  part: 'VIII', partTitle: 'Compute Engine — VM 기반 인프라', chapter: '2', chapterTitle: '네트워크와 보안',
  difficulty: '★★★', prerequisites: 'VIII-2-1',
  objective: '이 Section을 마치면 Private Subnet에 Compute Engine을 배치하고, Bastion Host를 통해 안전하게 접근할 수 있다.',
  paragraphs: [
    'Private Subnet에 인스턴스를 배치하면 외부 공격 표면을 줄일 수 있다. 하지만 관리자는 어떻게 접근할까? Bastion Host 패턴이 해결책이다.',
    'Bastion Host는 Public Subnet에 배치하는 인스턴스로, 외부 IP를 가진 유일한 관문이다. Bastion에 SSH 접속 후 내부 IP로 Private 인스턴스에 재접속하는 2단계 SSH 구조다.',
    'Bastion Host는 검증된 패턴이지만 관리 부담이 하나 더 생긴다. Bastion 자체도 OS 패치와 보안 관리가 필요하다.',
  ],
  codeBlocks: [
    { title: 'Bastion Host 생성 + 접속', language: 'bash',
      code: '# Public Subnet에 Bastion Host 생성\ngcloud compute instances create bastion-host \\\n  --zone=asia-northeast3-a \\\n  --subnet=public-subnet \\\n  --tags=bastion\n\n# Bastion을 통해 Private 인스턴스에 접속\ngcloud compute ssh bastion-host --zone=asia-northeast3-a\nssh 10.0.2.3' },
  ],
  keywords: ['Bastion Host', '점프 서버(Jump Server)', 'Private Subnet', '2단계 SSH', '보안 경계'],
  prevSection: 'VIII-2-1', nextSection: 'VIII-2-3',
};

window.GCPLearn.sections['VIII-2-3'] = {
  id: 'VIII-2-3', title: 'IAP로 Private 인스턴스에 접근하기',
  part: 'VIII', partTitle: 'Compute Engine — VM 기반 인프라', chapter: '2', chapterTitle: '네트워크와 보안',
  difficulty: '★★★', prerequisites: 'VIII-2-2',
  objective: '이 Section을 마치면 IAP 터널을 사용해 Bastion Host 없이 Private 인스턴스에 안전하게 접근할 수 있다.',
  paragraphs: [
    'Bastion Host 대신 GCP가 관리하는 IAP(Identity-Aware Proxy)를 사용하면 Bastion 없이 Private 인스턴스에 직접 SSH 접속할 수 있다.',
    '--tunnel-through-iap 옵션으로 SSH를 시도하면, IAP 서버가 구글 계정 인증과 IAM 권한을 검증한 후 터널을 연다. 외부에서 인스턴스로 향하는 직접 경로는 없고, 모든 트래픽은 IAP 경유로만 흐른다.',
    'IAP는 Zero Trust 보안 모델의 GCP 구현이다. "모든 접근 시도를 항상 인증한다"는 원칙을 따른다. Private Subnet + IAP가 GCP에서 Compute Engine을 운영하는 보안 기본기다.',
  ],
  codeBlocks: [
    { title: 'IAP SSH 접속', language: 'bash',
      code: '# IAP를 통한 SSH 접속 (Bastion 없이)\ngcloud compute ssh private-instance \\\n  --zone=asia-northeast3-a \\\n  --tunnel-through-iap\n\n# IAP 방화벽 규칙 (IAP IP 대역 허용)\ngcloud compute firewall-rules create allow-iap-ssh \\\n  --allow=tcp:22 \\\n  --source-ranges=35.235.240.0/20' },
  ],
  keywords: ['IAP(Identity-Aware Proxy)', '--tunnel-through-iap', '35.235.240.0/20', 'Zero Trust'],
  prevSection: 'VIII-2-2', nextSection: 'IX-1-1',
};
