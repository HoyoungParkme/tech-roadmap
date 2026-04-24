/**
 * part-X.js — Part X "Load Balancer · 도메인 실습" 4개 Section 데이터
 */
window.GCPLearn=window.GCPLearn||{};window.GCPLearn.sections=window.GCPLearn.sections||{};

window.GCPLearn.sections['X-1-1']={id:'X-1-1',title:'인스턴스 템플릿·그룹·Health Check',part:'X',partTitle:'Load Balancer · 도메인 실습',chapter:'1',chapterTitle:'LB 실습',difficulty:'★★★',prerequisites:'VIII-1-2, V-2-1',
objective:'이 Section을 마치면 인스턴스 템플릿으로 동일한 VM을 자동 생성하는 인스턴스 그룹을 만들고, Health Check를 설정할 수 있다.',
paragraphs:['같은 모양의 가구를 여러 개 만들 때 금형(틀)에서 동일한 제품을 찍어낸다. 인스턴스 템플릿(Instance Template)이 바로 이 금형에 해당한다.','관리형 인스턴스 그룹(MIG)은 이 템플릿으로 복수의 VM을 묶어 관리하는 단위다. Auto Scaling으로 트래픽에 따라 VM을 자동으로 늘리고 줄인다.','Health Check는 각 인스턴스에 주기적으로 HTTP 요청을 보내 정상 응답하지 않는 인스턴스를 자동으로 교체한다(Auto Healing).'],
codeBlocks:[{title:'템플릿 + MIG + Health Check',language:'bash',code:'# 인스턴스 템플릿 생성\ngcloud compute instance-templates create my-template \\\n  --machine-type=e2-micro \\\n  --image-family=debian-12 \\\n  --image-project=debian-cloud \\\n  --tags=http-server\n\n# 인스턴스 그룹 생성\ngcloud compute instance-groups managed create my-group \\\n  --template=my-template \\\n  --size=2 \\\n  --zone=asia-northeast3-a\n\n# Health Check 생성\ngcloud compute health-checks create http my-health-check \\\n  --port=80'}],
keywords:['인스턴스 템플릿(Instance Template)','관리형 인스턴스 그룹(MIG)','Health Check','Auto Healing'],prevSection:'IX-2-2',nextSection:'X-1-2'};

window.GCPLearn.sections['X-1-2']={id:'X-1-2',title:'Load Balancer 생성하기',part:'X',partTitle:'Load Balancer · 도메인 실습',chapter:'1',chapterTitle:'LB 실습',difficulty:'★★★',prerequisites:'X-1-1',
objective:'이 Section을 마치면 백엔드 서비스와 프론트엔드를 연결해 HTTP Load Balancer를 구성할 수 있다.',
paragraphs:['V-2-1에서 국제공항 입국 심사대 비유로 Load Balancer를 배웠다. 이 Section에서는 그 심사대를 직접 설치한다.','GCP HTTP(S) Load Balancer는 세 구성 요소로 이루어진다. 백엔드 서비스(Backend Service), URL Map, 프론트엔드(Forwarding Rule)이다.','백엔드 서비스와 인스턴스 그룹이 연결되면 Load Balancer가 트래픽을 각 VM에 분산하기 시작한다.'],
codeBlocks:[{title:'Backend Service 생성',language:'bash',code:'# 백엔드 서비스 생성\ngcloud compute backend-services create my-backend \\\n  --protocol=HTTP \\\n  --health-checks=my-health-check \\\n  --global\n\n# 백엔드 서비스에 인스턴스 그룹 연결\ngcloud compute backend-services add-backend my-backend \\\n  --instance-group=my-group \\\n  --instance-group-zone=asia-northeast3-a \\\n  --global'}],
keywords:['백엔드 서비스(Backend Service)','URL Map','Forwarding Rule','글로벌 Load Balancer'],prevSection:'X-1-1',nextSection:'X-2-1'};

window.GCPLearn.sections['X-2-1']={id:'X-2-1',title:'도메인이란? — 도메인 구매와 등록',part:'X',partTitle:'Load Balancer · 도메인 실습',chapter:'2',chapterTitle:'도메인 실습',difficulty:'★★☆',prerequisites:'X-1-2',
objective:'이 Section을 마치면 도메인의 역할을 이해하고, 도메인을 구매해 GCP 서비스에 연결할 준비를 할 수 있다.',
paragraphs:['친구에게 집 주소를 알려줄 때 숫자 주소보다 "강남 CGV 맞은편 건물"이 기억하기 쉽다. 도메인(Domain)은 IP에 사람이 읽을 수 있는 이름을 붙이는 시스템이다.','도메인을 사용하려면 구매와 DNS 매핑 두 단계가 필요하다. 등록 업체(Registrar)에서 원하는 이름을 검색하고 연 단위로 구매한다.','DNS(Domain Name System)는 도메인 이름을 IP 주소로 변환하는 전화번호부 역할을 한다. A 레코드는 도메인과 IPv4를 직접 연결하는 DNS 레코드 타입이다.'],
keywords:['도메인(Domain)','DNS(Domain Name System)','도메인 등록(Registrar)','A 레코드','CNAME'],prevSection:'X-1-2',nextSection:'X-2-2'};

window.GCPLearn.sections['X-2-2']={id:'X-2-2',title:'Cloud DNS로 도메인과 IP 매핑하기',part:'X',partTitle:'Load Balancer · 도메인 실습',chapter:'2',chapterTitle:'도메인 실습',difficulty:'★★★',prerequisites:'X-2-1',
objective:'이 Section을 마치면 Cloud DNS에 영역을 만들고, A 레코드로 도메인과 Load Balancer IP를 매핑할 수 있다.',
paragraphs:['도메인을 구매해도 DNS 서버에 레코드를 등록하지 않으면 연결되지 않는다. Cloud DNS는 GCP가 제공하는 관리형 DNS 서비스다.','Cloud DNS 설정은 관리 영역(Managed Zone) 생성과 네임서버 변경 두 단계다.','A 레코드를 추가하면 도메인이 Load Balancer IP에 연결된다. TTL은 DNS 캐시 보관 시간을 초 단위로 지정한다.'],
codeBlocks:[{title:'Cloud DNS 설정',language:'bash',code:'# DNS 영역 생성\ngcloud dns managed-zones create my-zone \\\n  --dns-name="example.com." \\\n  --description="My DNS zone"\n\n# A 레코드 추가\ngcloud dns record-sets create "api.example.com." \\\n  --zone=my-zone \\\n  --type=A \\\n  --ttl=300 \\\n  --rrdatas="34.xx.xx.xx"'}],
keywords:['Cloud DNS','관리 영역(Managed Zone)','A 레코드','네임서버(NS)','TTL'],prevSection:'X-2-1',nextSection:'XI-1-1'};
