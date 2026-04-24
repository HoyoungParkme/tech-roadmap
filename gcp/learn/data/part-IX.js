/**
 * part-IX.js — Part IX "IAM · VPC 실습" 4개 Section 데이터
 */
window.GCPLearn=window.GCPLearn||{};window.GCPLearn.sections=window.GCPLearn.sections||{};

window.GCPLearn.sections['IX-1-1']={id:'IX-1-1',title:'Service Account 생성과 권한 부여',part:'IX',partTitle:'IAM · VPC 실습',chapter:'1',chapterTitle:'IAM 실습',difficulty:'★★★',prerequisites:'V-1-2',
objective:'이 Section을 마치면 Service Account를 생성하고, 특정 GCP 서비스에 대한 역할을 부여할 수 있다.',
paragraphs:['카페에서 아르바이트생을 처음 고용하면 업주는 매장 열쇠를 통째로 넘기지 않는다. 에스프레소 머신 사용 권한은 주되, 금고 열쇠는 별도로 보관한다. GCP에서 Service Account도 같은 원리로 동작한다.','Service Account를 만드는 과정은 두 단계다. gcloud iam service-accounts create 명령으로 계정을 생성하고, gcloud projects add-iam-policy-binding으로 역할을 부여한다.','예시에서는 roles/cloudsql.client를 부여한다. 이 역할은 Cloud SQL에 쿼리를 날리는 것만 허용하고 인스턴스 생성·삭제 같은 관리 권한은 포함하지 않는다.'],
codeBlocks:[{title:'Service Account 생성 + 역할 부여',language:'bash',code:'# Service Account 생성\ngcloud iam service-accounts create my-sa \\\n  --display-name="My Service Account"\n\n# Service Account에 역할 부여\ngcloud projects add-iam-policy-binding MY_PROJECT_ID \\\n  --member="serviceAccount:my-sa@MY_PROJECT_ID.iam.gserviceaccount.com" \\\n  --role="roles/cloudsql.client"'}],
keywords:['Service Account','gcloud iam service-accounts create','역할 바인딩','IAM 정책'],prevSection:'VIII-2-3',nextSection:'IX-1-2'};

window.GCPLearn.sections['IX-1-2']={id:'IX-1-2',title:'특정 사용자의 리소스 접근 제어',part:'IX',partTitle:'IAM · VPC 실습',chapter:'1',chapterTitle:'IAM 실습',difficulty:'★★★',prerequisites:'IX-1-1',
objective:'이 Section을 마치면 특정 사용자에게 특정 역할만 부여하고, 현재 프로젝트의 IAM 정책을 조회할 수 있다.',
paragraphs:['팀에 새 백엔드 개발자가 합류했다. 이 개발자는 Cloud Run 배포 상태를 모니터링해야 하지만, Cloud SQL 데이터를 직접 수정할 필요는 없다.','gcloud projects add-iam-policy-binding 명령으로 특정 사용자에게 roles/run.viewer를 부여한다. 이 역할은 상태와 로그를 조회할 수 있지만 배포하거나 삭제할 수는 없다.','IAM 정책을 부여한 뒤에는 gcloud projects get-iam-policy 명령으로 현재 상태를 확인하는 습관이 필요하다.'],
codeBlocks:[{title:'사용자 역할 부여 + 정책 확인',language:'bash',code:'# 특정 사용자에게 Cloud Run Viewer 역할 부여\ngcloud projects add-iam-policy-binding MY_PROJECT_ID \\\n  --member="user:developer@example.com" \\\n  --role="roles/run.viewer"\n\n# 현재 IAM 정책 확인\ngcloud projects get-iam-policy MY_PROJECT_ID'}],
keywords:['IAM Policy Binding','--member','--role','Owner vs Editor vs Viewer','최소 권한'],prevSection:'IX-1-1',nextSection:'IX-2-1'};

window.GCPLearn.sections['IX-2-1']={id:'IX-2-1',title:'VPC 직접 생성하기',part:'IX',partTitle:'IAM · VPC 실습',chapter:'2',chapterTitle:'VPC 실습',difficulty:'★★★',prerequisites:'V-1-1',
objective:'이 Section을 마치면 Custom 모드 VPC를 생성하고 서브넷을 추가할 수 있다.',
paragraphs:['신도시 택지 개발을 상상해보자. 토지를 처음 조성할 때 도로망을 먼저 설계한다. 실무에서는 IP 대역을 직접 설계하고 서브넷을 용도별로 나누는 Custom 모드 VPC를 사용한다.','gcloud compute networks create 명령에 --subnet-mode=custom 옵션을 붙이면 빈 VPC가 만들어진다. 서브넷을 처음부터 하나씩 직접 추가해야 한다.','서브넷을 추가할 때는 VPC 이름, 리전, CIDR 범위를 지정한다. /24는 256개의 IP 주소를 쓸 수 있는 블록이다.'],
codeBlocks:[{title:'Custom VPC + 서브넷',language:'bash',code:'# Custom 모드 VPC 생성\ngcloud compute networks create my-vpc \\\n  --subnet-mode=custom\n\n# Subnet 생성\ngcloud compute networks subnets create my-subnet \\\n  --network=my-vpc \\\n  --region=asia-northeast3 \\\n  --range=10.0.1.0/24'}],
keywords:['Custom VPC','--subnet-mode=custom','CIDR(10.0.1.0/24)','서브넷 설계'],prevSection:'IX-1-2',nextSection:'IX-2-2'};

window.GCPLearn.sections['IX-2-2']={id:'IX-2-2',title:'Subnet 추가와 방화벽 규칙 관리',part:'IX',partTitle:'IAM · VPC 실습',chapter:'2',chapterTitle:'VPC 실습',difficulty:'★★★',prerequisites:'IX-2-1',
objective:'이 Section을 마치면 VPC에 방화벽 규칙을 추가해 내부 통신과 외부 접근을 제어할 수 있다.',
paragraphs:['아파트 단지 경비실을 생각해보자. 외부인은 확인을 거쳐야 들어올 수 있고, 주민끼리는 자유롭게 이동한다. 방화벽 규칙이 이 경비실 역할을 한다.','방화벽 규칙은 내부 통신 규칙(allow-internal)과 외부 SSH 접근 규칙(allow-ssh) 두 종류가 필요하다.','--source-ranges 옵션이 핵심이다. SSH 규칙에서 0.0.0.0/0 대신 관리자 IP만 허용하면 보안이 크게 강화된다.'],
codeBlocks:[{title:'방화벽 규칙 생성',language:'bash',code:'# 내부 통신 허용\ngcloud compute firewall-rules create allow-internal \\\n  --network=my-vpc \\\n  --allow=tcp,udp,icmp \\\n  --source-ranges=10.0.0.0/16\n\n# 외부 SSH 허용\ngcloud compute firewall-rules create allow-ssh \\\n  --network=my-vpc \\\n  --allow=tcp:22 \\\n  --source-ranges=0.0.0.0/0'}],
keywords:['방화벽 규칙','--source-ranges','Ingress/Egress','내부 통신','SSH 허용'],prevSection:'IX-2-1',nextSection:'X-1-1'};
