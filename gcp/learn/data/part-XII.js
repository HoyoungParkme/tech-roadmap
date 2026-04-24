/**
 * part-XII.js — Part XII "GKE" 3개 Section + Part XIII "AI" 2개 Section 데이터
 */
window.GCPLearn=window.GCPLearn||{};window.GCPLearn.sections=window.GCPLearn.sections||{};

window.GCPLearn.sections['XII-1-1']={id:'XII-1-1',title:'GKE란? — Autopilot vs Standard',part:'XII',partTitle:'GKE — 컨테이너 오케스트레이션',chapter:'1',chapterTitle:'GKE',difficulty:'★★★',prerequisites:'IV-1-2',
objective:'이 Section을 마치면 GKE의 Autopilot과 Standard 모드 차이를 설명하고 선택할 수 있다.',
paragraphs:['Cloud Run은 컨테이너 하나를 빠르게 띄우는 데 최적화된 서비스다. GKE는 수십에서 수백 개의 컨테이너를 조율하고 관리하는 역할이다.','Autopilot 모드는 노드 관리를 GCP가 전부 대신한다. Standard 모드는 노드 머신 타입, OS, 노드 수를 직접 결정한다.','GKE는 마이크로서비스 아키텍처에서 빛을 발한다. 서비스가 분산·확장될수록 Kubernetes 오케스트레이션이 필요해진다.'],
keywords:['GKE','Kubernetes','Autopilot','Standard','노드(Node)','Pod','클러스터(Cluster)'],prevSection:'XI-1-3',nextSection:'XII-1-2'};

window.GCPLearn.sections['XII-1-2']={id:'XII-1-2',title:'GKE Autopilot 클러스터 생성하기',part:'XII',partTitle:'GKE — 컨테이너 오케스트레이션',chapter:'1',chapterTitle:'GKE',difficulty:'★★★',prerequisites:'XII-1-1',
objective:'이 Section을 마치면 GKE Autopilot 클러스터를 생성하고, kubectl로 클러스터에 접근할 수 있다.',
paragraphs:['새 지사 사무실을 개설하듯, 클러스터를 만들고 kubectl 인증 정보를 연결하는 두 단계가 필요하다.','create-auto 명령은 GCP가 노드 프로비저닝·OS 패치·스케일링을 전부 자동으로 처리하겠다는 선언이다.','get-credentials는 클러스터 접속 정보를 로컬 kubeconfig에 기록한다. 이후 kubectl 명령으로 Pod와 서비스를 다룰 수 있다.'],
codeBlocks:[{title:'GKE Autopilot 클러스터',language:'bash',code:'# GKE Autopilot 클러스터 생성\ngcloud container clusters create-auto my-cluster \\\n  --region=asia-northeast3\n\n# 클러스터 인증 정보 가져오기\ngcloud container clusters get-credentials my-cluster \\\n  --region=asia-northeast3'}],
keywords:['gcloud container clusters create-auto','kubectl','kubeconfig','인증 정보'],prevSection:'XII-1-1',nextSection:'XII-1-3'};

window.GCPLearn.sections['XII-1-3']={id:'XII-1-3',title:'GKE에 Nginx 웹서버 배포하기',part:'XII',partTitle:'GKE — 컨테이너 오케스트레이션',chapter:'1',chapterTitle:'GKE',difficulty:'★★★',prerequisites:'XII-1-2',
objective:'이 Section을 마치면 Kubernetes Deployment와 Service를 작성해 GKE에 Nginx를 배포할 수 있다.',
paragraphs:['Kubernetes에서는 YAML 파일로 원하는 상태를 선언한다. "Nginx 컨테이너를 2개 실행하고, 외부에서 80번 포트로 접근할 수 있게 해달라"는 의도를 YAML에 적는다. 이를 선언적 관리(Declarative Management)라고 부른다.','Deployment는 컨테이너 실행 방법을 정의하는 객체다. replicas: 2는 Nginx Pod을 2개 유지하라는 선언이다.','kubectl expose deployment nginx --type=LoadBalancer --port=80으로 외부에서 접근 가능한 IP를 할당한다.'],
codeBlocks:[{title:'nginx-deployment.yaml',language:'yaml',code:'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:latest\n        ports:\n        - containerPort: 80'},
{title:'배포 및 서비스 노출',language:'bash',code:'kubectl apply -f nginx-deployment.yaml\nkubectl expose deployment nginx --type=LoadBalancer --port=80\nkubectl get services'}],
keywords:['Deployment','Service','Pod','kubectl apply','LoadBalancer 타입','YAML 매니페스트'],prevSection:'XII-1-2',nextSection:'XIII-1-1'};

window.GCPLearn.sections['XIII-1-1']={id:'XIII-1-1',title:'AgentBuilder란? — 대화형 AI 에이전트',part:'XIII',partTitle:'AI — AgentBuilder',chapter:'1',chapterTitle:'AgentBuilder',difficulty:'★★☆',prerequisites:'없음',
objective:'이 Section을 마치면 AgentBuilder의 개념과 활용 사례를 이해하고, 어떤 유형의 에이전트를 만들 수 있는지 설명할 수 있다.',
paragraphs:['챗봇을 만들려면 예전에는 자연어 처리 모델을 직접 학습시켜야 했다. AgentBuilder는 이 과정 전체를 Cloud Console의 UI에서 처리할 수 있게 만든 노코드/로우코드 AI 에이전트 빌더다.','AgentBuilder의 핵심은 LLM(Large Language Model)이다. Google이 직접 개발한 LLM을 기반으로 작동하며, Vertex AI 위에서 동작한다.','에이전트 유형은 웹검색 기반 질의응답, 사내 문서 검색, 고객 상담 자동화 세 가지가 대표적이다. 모든 구성을 Cloud Console에서 클릭과 입력만으로 완료할 수 있다.'],
keywords:['AgentBuilder','대화형 에이전트','노코드','LLM','Vertex AI'],prevSection:'XII-1-3',nextSection:'XIII-1-2'};

window.GCPLearn.sections['XIII-1-2']={id:'XIII-1-2',title:'웹검색 기반 대화형 에이전트 구현하기',part:'XIII',partTitle:'AI — AgentBuilder',chapter:'1',chapterTitle:'AgentBuilder',difficulty:'★★★',prerequisites:'XIII-1-1',
objective:'이 Section을 마치면 AgentBuilder로 웹검색 기반 대화형 에이전트를 만들고 테스트할 수 있다.',
paragraphs:['스마트폰 음성 비서처럼 인터넷을 검색해 실시간 정보를 가져와 자연스러운 문장으로 답한다. AgentBuilder의 웹검색 기반 에이전트가 이 방식이다.','에이전트 유형 선택 → 데이터 소스 연결(Grounding) → 테스트 대화 실행 순서로 진행된다. Grounding은 LLM의 답변을 지정한 소스 데이터로 고정시키는 역할이다.','테스트를 통과한 에이전트는 API 엔드포인트나 웹 위젯 형태로 기존 앱에 통합할 수 있다. 웹 위젯은 HTML 한 줄을 복사해 붙이는 것만으로 챗봇 UI를 삽입한다.'],
keywords:['에이전트 유형','데이터 소스 연결','Grounding','웹 위젯','API 통합'],prevSection:'XIII-1-1',nextSection:null};
