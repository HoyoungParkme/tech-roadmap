### VIII-1-13. EC2 인스턴스 생성과 Docker 설치

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 AWS EC2 인스턴스를 프리티어로 생성하고, SSH로 접속하여 Docker와 Docker Compose를 설치하고, 탄력적 IP를 연결하여 배포 준비를 완료할 수 있다.
- **설명**:
  로컬에서 잘 돌아가는 Docker 컨테이너를 실제 서버에 올리는 첫 단계는 EC2 인스턴스를 만드는 것이다. AWS 프리티어를 활용하면 12개월 동안 기본 실습을 무료로 할 수 있다. 이 Section에서는 EC2 생성부터 Docker 설치까지 전체 절차를 단계별로 따른다.
- **핵심 키워드**: EC2, 프리티어, AMI, 보안 그룹, 탄력적 IP, SSH, `usermod -aG docker`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: III-1-1 (Docker 설치)
- **다음 섹션**: VIII-1-14

#### 본문

##### AWS 프리티어 개요

AWS 프리티어(Free Tier)는 신규 계정 생성 후 12개월 동안 특정 서비스를 무료로 사용할 수 있는 혜택이다.

| 항목 | 내용 |
|:--|:--|
| 인스턴스 유형 | `t2.micro` (구형) 또는 `t3.micro` (신형, 일부 리전) |
| 무료 기간 | 계정 생성 후 12개월 |
| 월 제공 시간 | 750시간 (한 인스턴스를 한 달 내내 켜도 무료) |
| 스토리지 | EBS 30GB 무료 |
| 비고 | 12개월 이후 또는 프리티어 한도 초과 시 과금 발생 |

> **[경고] 실습 후 반드시 EC2 인스턴스를 중지(Stop)하세요. 중지가 아닌 실행(Running) 상태로 방치하면 프리티어 한도를 초과하여 요금이 발생합니다. 삭제(Terminate)는 복구가 불가능하므로 주의하세요.**

##### EC2 인스턴스 생성 단계

AWS 콘솔에서 순서대로 진행한다.

**1단계: 리전 선택**

AWS 콘솔 오른쪽 상단에서 리전을 선택한다. 한국에서 사용할 때는 `아시아 태평양(서울) ap-northeast-2`를 선택한다.

**2단계: EC2 대시보드 진입**

콘솔 검색창에 `EC2`를 입력하고 → `인스턴스 시작` 버튼을 클릭한다.

**3단계: AMI(Amazon Machine Image) 선택**

AMI는 서버의 운영체제 설치본이다. 실습에는 `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`을 선택한다. `프리 티어 사용 가능` 레이블을 확인한다.

**4단계: 인스턴스 유형 선택**

`t2.micro` (vCPU 1, 메모리 1GB)를 선택한다. `프리 티어 사용 가능` 레이블을 확인한다.

**5단계: 키 페어 생성**

SSH 접속에 필요한 키 파일이다. `새 키 페어 생성`을 클릭하고 이름을 지정한 뒤 `.pem` 파일을 다운로드한다. 이 파일은 분실 시 재발급이 불가능하므로 안전한 곳에 보관한다.

```bash
# 다운로드한 키 파일 권한 설정 (Linux/Mac)
chmod 400 ~/Downloads/my-key.pem
```

**6단계: 보안 그룹 설정**

보안 그룹은 EC2 인스턴스의 방화벽 역할을 한다. 아래 포트를 허용한다.

| 포트 | 프로토콜 | 소스 | 용도 |
|:--|:--|:--|:--|
| 22 | TCP | 내 IP (또는 0.0.0.0/0) | SSH 접속 |
| 80 | TCP | 0.0.0.0/0 | HTTP 웹 서비스 |
| 443 | TCP | 0.0.0.0/0 | HTTPS 웹 서비스 |

> 보안을 위해 22번 포트 소스는 `내 IP`로 제한하는 것이 좋다. `0.0.0.0/0`은 전 세계 어디서나 접근 가능하다는 의미다.

**7단계: 스토리지 설정**

기본값 8GB에서 `20GB`로 늘린다. 프리티어는 EBS 30GB까지 무료이므로 20GB는 무료 범위 안이다.

**8단계: 인스턴스 시작**

`인스턴스 시작` 버튼을 클릭한다. 약 1~2분 후 인스턴스 상태가 `running`으로 바뀐다.

##### 탄력적 IP 연결

EC2 인스턴스는 중지 후 재시작하면 퍼블릭 IP가 바뀐다. 탄력적 IP(Elastic IP)를 연결하면 고정 IP를 사용할 수 있다.

```
AWS 콘솔 → EC2 → 탄력적 IP → 탄력적 IP 주소 할당 → 인스턴스에 연결
```

> **주의**: 탄력적 IP는 인스턴스에 연결된 상태로 사용하면 무료지만, 할당만 해두고 인스턴스에 연결하지 않으면 요금이 발생한다.

##### SSH 접속

```bash
# 기본 SSH 접속 명령어
ssh -i ~/Downloads/my-key.pem ubuntu@<탄력적 IP>

# 예시
ssh -i ~/Downloads/my-key.pem ubuntu@13.125.100.200
```

처음 접속 시 "Are you sure you want to continue connecting?"이라는 경고가 나타난다. `yes`를 입력하면 된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: EC2는 AWS가 대신 관리해주는 원격 컴퓨터다. 우리가 서버를 사서 설치하는 대신, AWS에서 컴퓨터를 빌려서 쓰는 것이다. SSH는 그 컴퓨터에 원격으로 연결하는 터미널이다.
> - **키 페어**: 자물쇠(`pem` 파일)와 열쇠 쌍이다. AWS가 자물쇠를 인스턴스에 걸어놓고, 나는 열쇠(`.pem` 파일)로 문을 연다. 열쇠를 잃어버리면 문을 열 수 없다.

##### Ubuntu에 Docker 설치

SSH로 접속한 EC2 서버에서 아래 명령어를 순서대로 실행한다.

```bash
# 1. 패키지 목록 업데이트
sudo apt-get update

# 2. Docker 공식 설치 스크립트로 설치 (가장 간단한 방법)
curl -fsSL https://get.docker.com | sh
```

```bash
# 3. 현재 사용자를 docker 그룹에 추가 (sudo 없이 docker 명령 사용 가능)
sudo usermod -aG docker $USER

# 4. 그룹 변경 적용 (재로그인 또는 아래 명령 실행)
newgrp docker
```

```bash
# 5. Docker Compose 플러그인 설치
sudo apt-get install -y docker-compose-plugin
```

```bash
# 6. 설치 확인
docker --version
docker compose version
```

설치가 완료되면 아래와 같이 출력된다.

```
Docker version 27.x.x, build xxxxxxx
Docker Compose version v2.x.x
```

> **[주니어 렌즈 ★★☆]**
> - **`curl -fsSL https://get.docker.com | sh`**: Docker 공식 편의 스크립트다. 현재 OS를 자동 감지하여 적절한 패키지를 설치한다. 실무에서는 스크립트 내용을 먼저 확인하는 것이 좋지만(`curl -fsSL https://get.docker.com -o install-docker.sh && cat install-docker.sh`), 개인 실습용 서버에서는 편의를 위해 직접 파이프로 실행한다.
> - **`usermod -aG docker $USER`**: `-aG`는 "append to Group"의 약자다. `$USER` 환경변수는 현재 로그인한 사용자 이름이다. 이 명령 없이 `docker` 명령을 실행하면 `permission denied while trying to connect to the Docker daemon socket` 에러가 발생한다.
> - **`newgrp docker`**: 현재 셸 세션에서 그룹 변경을 즉시 적용한다. EC2를 재접속(SSH 재연결)해도 동일하게 적용된다.

##### Docker 동작 확인

```bash
# Hello World 컨테이너 실행 (정상 동작 확인)
docker run --rm hello-world

# 이미지 목록 확인
docker images

# 실행 중인 컨테이너 확인
docker ps
```

##### 비용 예상표

| 인스턴스 유형 | vCPU | 메모리 | 월 비용 (서울 리전) | 비고 |
|:--|:--|:--|:--|:--|
| `t2.micro` | 1 | 1GB | $0 (프리티어 12개월) | 개인 실습에 적합 |
| `t3.micro` | 2 | 1GB | ~$8 | 프리티어 적용 리전에서 무료 가능 |
| `t3.small` | 2 | 2GB | ~$15 | 소규모 서비스 운영 |
| `t3.medium` | 2 | 4GB | ~$30 | DB + 앱 함께 운영 시 |

> **[실무자 렌즈 ★★★]**
> - **프로덕션에서 `t2.micro` 사용 주의**: t2.micro는 CPU 버스트 크레딧 방식이다. 평소에는 성능을 낮게 유지하다가 크레딧이 있을 때만 높은 성능을 낸다. 지속적인 CPU 부하가 걸리면 크레딧이 소진되어 성능이 급격히 떨어진다. 실제 서비스에는 `t3` 이상을 권장한다.
> - **IMDSv2(인스턴스 메타데이터 서비스 v2)**: AWS는 최근 인스턴스에서 IMDSv2를 기본 사용한다. EC2 메타데이터를 코드에서 읽을 때는 IMDSv2 방식을 써야 한다. Docker 이미지 빌드 자체에는 영향이 없다.
> - **EBS 볼륨 스냅샷**: 운영 서버라면 EBS 스냅샷을 주기적으로 생성해두는 것이 좋다. AWS Backup 서비스를 사용하면 자동화할 수 있다.

##### 체크포인트

- [ ] EC2 인스턴스를 생성하고 SSH로 접속할 수 있다
- [ ] 탄력적 IP를 할당하고 인스턴스에 연결할 수 있다
- [ ] `curl -fsSL https://get.docker.com | sh` 명령으로 Docker를 설치하고 버전을 확인할 수 있다
- [ ] `sudo usermod -aG docker $USER` 명령의 역할을 설명하고, 이 설정 없이 `docker` 명령을 실행하면 어떤 에러가 발생하는지 말할 수 있다
- [ ] 프리티어 인스턴스를 실습 후 반드시 중지(Stop)해야 하는 이유와, 중지(Stop)와 삭제(Terminate)의 차이를 설명할 수 있다

---

