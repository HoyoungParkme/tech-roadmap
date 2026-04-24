/**
 * part-I.js
 * 경로: learn/data/part-I.js
 * 목적: Part I "왜 클라우드인가" 4개 Section 본문 데이터
 * 주요 기능: SectionPage 컴포넌트에서 사용하는 콘텐츠 데이터
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sections = window.GCPLearn.sections || {};

window.GCPLearn.sections['I-1-1'] = {
  id: 'I-1-1',
  title: '내 서버를 직접 운영한다는 것',
  part: 'I',
  partTitle: '왜 클라우드인가',
  chapter: '1',
  chapterTitle: '클라우드 개념',
  difficulty: '★☆☆',
  prerequisites: '없음',
  objective: '이 Section을 마치면 "온프레미스(On-Premise)"가 무엇인지, 왜 비용과 관리 부담이 큰지 설명할 수 있다.',
  paragraphs: [
    '집을 직접 짓는다고 상상해 보자. 땅을 사고, 설계도를 그리고, 건물을 올리고, 수도와 전기를 연결해야 한다. 완공 뒤에도 끝이 아니다. 보일러가 고장 나면 직접 수리하고, 지붕이 새면 직접 올라가야 한다. 회사가 서버를 직접 사서 운영하는 방식, 즉 온프레미스(On-Premise)가 정확히 이 구조다.',
    '온프레미스는 서버 장비를 구입해 회사 내부 또는 임대한 데이터센터(Data Center) 공간에 설치하고, 네트워크·전력·냉각까지 직접 구성하는 방식이다. 장비 구입처럼 한 번에 큰돈이 나가는 비용을 초기 투자 비용(CapEx, Capital Expenditure)이라 부르고, 전기세·유지보수·운영 인력처럼 매달 꾸준히 나가는 비용을 운영 비용(OpEx, Operating Expenditure)이라 부른다. 온프레미스는 이 두 가지 비용을 모두 회사가 직접 감당한다.',
    '문제는 유연성이다. 연말 이벤트나 신제품 출시로 트래픽이 갑자기 10배가 되어도, 새 서버를 주문하고 설치하고 설정하는 데는 몇 주가 걸린다. 반대로 한산한 시기에는 비싸게 사들인 서버가 전력만 소모하며 놀고 있다. 실무에서 온프레미스로 서비스를 운영해 본 개발자라면 "서버가 부족해서 배포를 미룬 경험"이 한 번쯤 있을 것이다.',
    '클라우드는 이 구조를 호텔로 바꾼다. 방이 더 필요하면 그날 바로 예약하면 되고, 수도·전기·청소는 호텔 측이 알아서 처리한다. 온프레미스의 한계를 이해하면, 다음 Section에서 클라우드가 왜 등장했는지 자연스럽게 이해된다.',
  ],
  keywords: ['온프레미스(On-Premise)', '데이터센터(Data Center)', '서버(Server)', '초기 투자 비용(CapEx)', '운영 비용(OpEx)'],
  prevSection: null,
  nextSection: 'I-1-2',
};

window.GCPLearn.sections['I-1-2'] = {
  id: 'I-1-2',
  title: '클라우드가 해결하는 세 가지 문제',
  part: 'I',
  partTitle: '왜 클라우드인가',
  chapter: '1',
  chapterTitle: '클라우드 개념',
  difficulty: '★☆☆',
  prerequisites: 'I-1-1',
  objective: '이 Section을 마치면 클라우드가 해결하는 핵심 문제 세 가지(초기 비용, 확장성, 가용성)를 설명할 수 있다.',
  paragraphs: [
    '호텔에 묵는다고 생각해 보자. 체크인 당일 방이 부족하면 그 자리에서 룸을 추가할 수 있다. 다음 달 출장이 없으면 예약하지 않으면 된다. 전구가 나가도 프런트에 전화 한 통이면 해결된다. 클라우드는 서버 세계에서 이 경험을 가능하게 만드는 기술이다. 구체적으로 세 가지 문제를 해결한다.',
    '첫째, 초기 비용 문제다. 온프레미스에서는 서비스 시작 전부터 서버 장비를 구입해야 한다. 클라우드는 서버를 사는 대신 빌린다. 종량제(Pay-as-you-go) 방식으로 실제로 사용한 만큼만 내기 때문에, 아이디어를 검증하는 초기 단계에서도 큰 초기 투자 없이 시작할 수 있다.',
    '둘째, 확장성(Scalability) 문제다. 서비스가 갑자기 인기를 얻어 트래픽이 급증해도, Auto Scaling 기능이 자동으로 서버 수를 늘려준다. 개발자가 새벽에 일어나 서버를 손수 추가할 필요가 없다.',
    '셋째, 가용성(Availability) 문제다. AWS, Google, Microsoft 같은 클라우드 제공자는 전 세계 수십 개 리전(Region)에 데이터센터를 분산 운영한다. 서울 리전에 장애가 생겨도 일본 리전이 요청을 이어받을 수 있어, 한 곳의 고장이 전체 서비스 중단으로 이어지지 않는다.',
    '주니어 개발자에게 가장 체감되는 부분은 확장성이다. 로컬에서 잘 돌아가던 앱을 배포한 뒤, 갑작스러운 트래픽 급증으로 서버가 멈추는 상황을 겪으면 Auto Scaling의 가치를 바로 느낄 수 있다. 클라우드 환경에서는 서버 증설이 코드 한 줄 또는 콘솔 클릭 한 번으로 해결된다.',
    '이 세 가지 — 초기 비용 절감, 확장성, 가용성 — 가 클라우드를 선택하는 핵심 이유다. 다음 Section에서는 클라우드 서비스를 어떤 방식으로 빌려 쓰느냐에 따른 세 가지 형태(IaaS/PaaS/SaaS)를 살펴본다.',
  ],
  keywords: ['확장성(Scalability)', '가용성(Availability)', '리전(Region)', 'Auto Scaling', '종량제(Pay-as-you-go)'],
  prevSection: 'I-1-1',
  nextSection: 'I-1-3',
};

window.GCPLearn.sections['I-1-3'] = {
  id: 'I-1-3',
  title: 'IaaS / PaaS / SaaS — 클라우드의 세 가지 형태',
  part: 'I',
  partTitle: '왜 클라우드인가',
  chapter: '1',
  chapterTitle: '클라우드 개념',
  difficulty: '★☆☆',
  prerequisites: 'I-1-2',
  objective: '이 Section을 마치면 IaaS·PaaS·SaaS의 차이를 피자 비유로 설명할 수 있다.',
  paragraphs: [
    '피자를 먹고 싶을 때 선택지는 세 가지다. 밀가루와 토마토소스부터 직접 사서 오븐을 켜거나, 반죽이 미리 준비된 피자 키트를 받아서 원하는 토핑만 올리거나, 완성된 피자를 앱으로 주문해 받거나. 클라우드 서비스도 이 세 가지 방식으로 나뉜다.',
    '클라우드에서 "얼마나 직접 관리하느냐"에 따라 서비스 형태가 달라진다. IaaS(Infrastructure as a Service)는 가상 머신(VM)을 빌려서 운영체제(OS)와 미들웨어를 직접 설치하고 관리하는 방식이다. 피자 재료를 사다가 직접 굽는 것처럼, 인프라에 대한 통제권이 높지만 그만큼 할 일이 많다. PaaS(Platform as a Service)는 반죽과 소스까지 준비된 피자 키트처럼, 인프라 걱정 없이 코드만 올리면 플랫폼이 배포와 실행을 대신 처리해 준다. SaaS(Software as a Service)는 완성된 피자를 배달받는 것이다. Gmail, Google Docs처럼 설치도 설정도 필요 없이 브라우저에서 바로 쓴다.',
    '관리 범위의 차이가 실무에서 어떻게 드러나는지 보면 더 명확하다. GCP Compute Engine은 대표적인 IaaS로, VM을 직접 만들고 OS 패치부터 네트워크 설정까지 개발자가 책임진다. 반면 Cloud Run은 PaaS에 해당한다. 컨테이너 이미지를 올리면 플랫폼이 서버 관리, 스케일링, 트래픽 처리를 알아서 담당한다. 개발자는 코드와 비즈니스 로직에만 집중할 수 있다.',
    'IaaS, PaaS, SaaS는 통제권과 편의성의 교환이다. 통제가 많을수록 자유롭지만 관리 부담도 커진다. 어느 형태를 선택하느냐는 팀의 규모와 역량, 서비스의 특성에 따라 달라진다. 다음 파트에서는 클라우드를 실제로 쓸 때 바로 만나는 문제인 비용 구조를 살펴본다.',
  ],
  keywords: ['IaaS', 'PaaS', 'SaaS', '가상 머신(VM)', '관리 범위'],
  prevSection: 'I-1-2',
  nextSection: 'I-2-1',
};

window.GCPLearn.sections['I-2-1'] = {
  id: 'I-2-1',
  title: '클라우드 비용 구조 이해하기',
  part: 'I',
  partTitle: '왜 클라우드인가',
  chapter: '2',
  chapterTitle: '비용',
  difficulty: '★☆☆',
  prerequisites: 'I-1-2',
  objective: '이 Section을 마치면 클라우드 종량제 비용 구조와 무료 체험(Free Tier)을 이해하고, 예상치 못한 청구를 피하는 방법을 알 수 있다.',
  paragraphs: [
    '전기를 쓴 만큼 요금이 나오고 월말에 청구서가 날아오는 것처럼, 클라우드도 사용한 만큼 비용이 발생한다. 이것을 종량제(Pay-as-you-go)라고 부른다. 서버를 미리 사서 데이터센터에 쌓아 두는 방식과 달리, 클라우드는 필요한 순간에만 자원을 빌리고 쓰지 않으면 비용이 멈춘다.',
    'GCP는 새로 가입한 계정에 $300 크레딧을 90일간 제공한다. 이 기간 동안 대부분의 서비스를 무료로 실험해 볼 수 있다. 크레딧을 다 쓰거나 90일이 지나도 Cloud Run을 비롯한 일부 서비스는 Always Free 한도 안에서 영구 무료로 사용할 수 있다. Free Tier는 학습과 소규모 프로젝트를 시작하는 데 충분한 여유를 준다.',
    '그러나 종량제에는 함정이 있다. 테스트용으로 만든 VM을 끄지 않고 방치하거나, 대용량 데이터를 실수로 저장하면 예상하지 못한 청구서가 나온다. 이를 막는 가장 확실한 방법은 예산 알림(Budget Alert)을 설정하는 것이다. 설정한 금액에 근접하면 이메일로 알림이 오므로, 초과 청구를 사전에 차단할 수 있다.',
    'Cloud Run은 트래픽이 없을 때 인스턴스가 0으로 줄어드는 Scale to Zero 기능을 기본 제공하므로, 사용하지 않는 시간에도 서버를 켜 두는 낭비가 없다. 클라우드 비용의 핵심은 "끄면 안 내도 된다"는 단순한 원리에 있다. Budget Alert 설정과 Scale to Zero 구조를 이해하고 나면, 비용 걱정 없이 GCP를 실습할 수 있다.',
  ],
  keywords: ['종량제', 'Free Tier', 'Always Free', 'Budget Alert', 'Scale to Zero'],
  prevSection: 'I-1-3',
  nextSection: 'II-1-1',
};
