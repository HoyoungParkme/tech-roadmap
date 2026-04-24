### VIII-1-16. 배포 자동화와 운영 체크리스트

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 GitHub Actions 워크플로우로 main 브랜치 푸시 시 Docker 이미지를 빌드하여 ECR에 푸시하고 EC2에 자동 배포하는 CI/CD 파이프라인을 구축할 수 있다.
- **설명**:
  코드를 수정할 때마다 수동으로 빌드하고 EC2에 접속하여 배포하는 과정은 번거롭고 실수가 생기기 쉽다. GitHub Actions를 사용하면 `main` 브랜치에 코드를 푸시하는 것만으로 전체 배포 과정이 자동으로 진행된다. 이 Section에서는 복사해서 바로 쓸 수 있는 워크플로우 YAML과 운영 체크리스트를 제공한다.
- **핵심 키워드**: GitHub Actions, GitHub Secrets, `docker/build-push-action`, watchtower, 롤백, 운영 체크리스트
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VII-1-4 (CI/CD), VIII-1-15
- **다음 섹션**: 부록

#### 본문

##### GitHub Actions 워크플로우 전체 코드

아래 파일을 `.github/workflows/deploy.yml`로 저장한다. main 브랜치에 푸시하면 자동으로 빌드→ECR 푸시→EC2 배포까지 진행한다.

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy to EC2

on:
  push:
    branches:
      - main

env:
  AWS_REGION: ap-northeast-2
  ECR_REPOSITORY: demo-app
  EC2_USER: ubuntu

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. 소스 코드 체크아웃
      - name: 소스 코드 체크아웃
        uses: actions/checkout@v4

      # 2. AWS 자격 증명 설정
      - name: AWS 자격 증명 설정
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      # 3. ECR 로그인
      - name: ECR 로그인
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      # 4. Docker 이미지 빌드 및 ECR 푸시
      - name: Docker 이미지 빌드 및 푸시
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                     $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      # 5. EC2에 SSH 접속하여 배포
      - name: EC2 배포
        env:
          IMAGE_TAG: ${{ github.sha }}
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ env.EC2_USER }}
          key: ${{ secrets.EC2_KEY }}
          envs: IMAGE_TAG,ECR_REGISTRY,ECR_REPOSITORY,AWS_REGION
          script: |
            # ECR 로그인 (EC2에 IAM 역할이 연결되어 있어야 함)
            aws ecr get-login-password --region $AWS_REGION \
              | docker login \
                --username AWS \
                --password-stdin \
                $ECR_REGISTRY

            # 최신 이미지 풀
            docker pull $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

            # 환경변수에 새 이미지 태그 설정
            export APP_IMAGE=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

            # Docker Compose 재시작
            cd ~/app
            APP_IMAGE=$APP_IMAGE docker compose up -d --no-deps api

            # 사용하지 않는 이미지 정리
            docker image prune -f
```

##### GitHub Secrets 설정

워크플로우에서 사용하는 민감한 값은 GitHub Secrets에 저장한다.

```
GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret
```

| Secret 이름 | 값 | 설명 |
|:--|:--|:--|
| `AWS_ACCESS_KEY_ID` | `AKIAIOSFODNN7EXAMPLE` | IAM 사용자 Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | `wJalrX...` | IAM 사용자 Secret Access Key |
| `EC2_HOST` | `13.125.100.200` | EC2 탄력적 IP |
| `EC2_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | `.pem` 파일 내용 전체 |

```bash
# EC2_KEY에 넣을 내용 확인 (pem 파일 전체 내용)
cat ~/Downloads/my-key.pem
```

> **[입문 렌즈 ★☆☆]**
> - **GitHub Actions 비유**: GitHub Actions는 "코드가 올라오면 이것을 해줘"라고 시키는 자동화 도우미다. 도우미는 AWS에 접속하고, Docker 이미지를 만들고, 서버에 배포하는 일을 대신 해준다.
> - **GitHub Secrets**: 비밀번호를 코드에 직접 쓰면 누구나 볼 수 있다. Secrets는 암호화된 금고처럼 민감한 값을 안전하게 보관하고, 워크플로우 실행 시에만 꺼내 쓴다.

##### watchtower로 이미지 자동 업데이트 (간단한 대안)

GitHub Actions 없이 더 단순하게 자동 업데이트를 원한다면 watchtower를 사용할 수 있다. watchtower는 실행 중인 컨테이너의 이미지가 업데이트되면 자동으로 재시작해주는 컨테이너다.

```yaml
# compose.yml에 watchtower 서비스 추가
services:
  api:
    image: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:latest
    # ... 기타 설정

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker/config.json:/config.json  # ECR 인증 정보
    command: --interval 300  # 5분마다 확인
    environment:
      - WATCHTOWER_CLEANUP=true  # 오래된 이미지 자동 삭제
```

```bash
# watchtower 실행
docker compose up -d watchtower
```

> watchtower는 ECR처럼 인증이 필요한 레지스트리도 지원한다. 단, ECR 토큰은 12시간마다 만료되므로 별도의 토큰 갱신 설정이 필요하다.

##### 롤백 전략

배포 후 문제가 발생하면 이전 버전으로 빠르게 되돌려야 한다. GitHub SHA 태그를 사용하면 정확한 버전으로 롤백할 수 있다.

```bash
# EC2에서 특정 버전으로 롤백
# 이전 커밋 SHA를 GitHub Actions 실행 이력에서 확인
PREVIOUS_SHA=abc1234def5678

# 이전 이미지 풀
docker pull \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:$PREVIOUS_SHA

# 이전 이미지로 컨테이너 재시작
APP_IMAGE=123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:$PREVIOUS_SHA \
  docker compose up -d --no-deps api
```

> **[주니어 렌즈 ★★☆]**
> - **`appleboy/ssh-action`**: GitHub Actions에서 SSH로 원격 서버에 명령을 실행하는 액션이다. EC2 키 파일 내용을 `EC2_KEY` Secret에 통째로 넣어서 인증한다.
> - **`${{ github.sha }}`**: 현재 커밋의 고유 SHA 해시 값이다. 이미지 태그로 사용하면 어떤 코드로 만든 이미지인지 정확히 추적할 수 있다. `latest`만 사용하면 정확한 버전을 알 수 없어 롤백이 어렵다.
> - **IAM 사용자 권한 최소화**: CI용 IAM 사용자에게는 ECR push 권한(`AmazonEC2ContainerRegistryPowerUser`)만 부여한다. EC2 전체 제어 권한은 주지 않는다. EC2 배포는 SSH 키를 통해 수행하기 때문이다.

##### 운영 체크리스트

| 단계 | 항목 | 확인 방법 |
|:--|:--|:--|
| **배포 전** | `.env` 파일이 Git에 커밋되지 않았는가 | `git status`, `.gitignore` 확인 |
| **배포 전** | 보안 그룹에서 불필요한 포트가 열려 있지 않은가 | AWS 콘솔 → 보안 그룹 인바운드 규칙 확인 |
| **배포 전** | ECR 이미지에 알려진 취약점이 없는가 | ECR 콘솔 → 이미지 스캔 결과 확인 |
| **배포 중** | GitHub Actions 워크플로우가 성공했는가 | Actions 탭 → 초록 체크 확인 |
| **배포 후** | 헬스체크 엔드포인트가 200을 반환하는가 | `curl http://<IP>/health` |
| **배포 후** | 로그에 에러가 없는가 | `docker compose logs -f` |
| **배포 후** | 컨테이너가 모두 Running 상태인가 | `docker compose ps` |
| **운영 중** | EC2 CPU/메모리 사용량이 정상 범위인가 | AWS CloudWatch 또는 `docker stats` |
| **운영 중** | EBS 디스크 용량이 여유 있는가 | `df -h` |
| **운영 중** | 불필요한 이미지가 디스크를 차지하지 않는가 | `docker system df` → `docker image prune` |

##### 비용 관리

```bash
# 프리티어 한도 확인 (AWS CLI)
aws ce get-cost-and-usage \
  --time-period Start=2026-04-01,End=2026-05-01 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

| 리소스 | 프리티어 한도 | 초과 시 비용 |
|:--|:--|:--|
| EC2 t2.micro | 750시간/월 | ~$0.013/시간 |
| EBS 스토리지 | 30GB | ~$0.1/GB/월 |
| ECR 스토리지 | 500MB/월 | ~$0.1/GB/월 |
| 데이터 전송 (아웃바운드) | 15GB/월 | ~$0.09/GB |

```bash
# 실습 종료 후 정리 목록
# 1. EC2 인스턴스 중지 (Stop) 또는 종료 (Terminate)
# 2. 탄력적 IP 해제 (인스턴스와 연결되지 않은 탄력적 IP는 과금)
# 3. ECR 이미지 삭제 (500MB 초과 시 과금)
# 4. 스냅샷 삭제 (있는 경우)
```

> **[실무자 렌즈 ★★★]**
> - **AWS Budgets 알림 설정**: AWS 콘솔 → Billing → Budgets에서 월 예산 알림을 설정한다. $1 이상 청구 예상 시 이메일 알림을 받도록 설정해두면 예상치 못한 과금을 예방할 수 있다.
> - **GitHub Actions 비용**: GitHub Actions는 퍼블릭 저장소는 무료, 프라이빗 저장소는 월 2,000분까지 무료다. `ubuntu-latest` 러너 기준으로 분당 0.008달러이므로 일반적인 배포 파이프라인은 무료 범위 안에서 동작한다.
> - **이 다음에는?**: 단일 EC2 + Docker Compose 구조는 가장 간단한 배포 방식이다. 서비스 규모가 커지면 아래 기술을 순서대로 검토한다.

**다음 학습 경로**

| 기술 | 사용 시점 | 핵심 내용 |
|:--|:--|:--|
| **AWS ECS (Fargate)** | EC2 관리 없이 컨테이너만 운영하고 싶을 때 | 서버리스 컨테이너 실행 환경 |
| **Kubernetes (EKS)** | 수십 개 이상의 컨테이너를 운영할 때 | 컨테이너 오케스트레이션 |
| **Terraform** | 인프라를 코드로 관리(IaC)하고 싶을 때 | EC2, VPC, ECR을 코드로 선언 |
| **GitHub Actions 심화** | 테스트 자동화, 멀티 환경 배포 | 매트릭스 빌드, 환경 승인 |
| **AWS CDK** | Terraform 대신 Python/TypeScript로 IaC | AWS 서비스에 최적화된 IaC |

##### 체크포인트

- [ ] `.github/workflows/deploy.yml` 파일을 작성하고 GitHub Secrets 4개(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, EC2_HOST, EC2_KEY)를 설정하여 자동 배포 파이프라인을 동작시킬 수 있다
- [ ] `${{ github.sha }}` 이미지 태그를 사용하는 이유와, `latest`만 사용할 때의 문제점을 설명할 수 있다
- [ ] 배포 후 롤백이 필요할 때 이전 SHA 태그로 컨테이너를 재시작하는 명령어를 작성할 수 있다
- [ ] 운영 체크리스트의 배포 전/중/후 항목을 보고 각 확인 방법을 실행할 수 있다
- [ ] 실습 종료 후 AWS 비용이 발생하지 않도록 정리해야 할 리소스 목록(EC2, 탄력적 IP, ECR, 스냅샷)을 말할 수 있다

---

