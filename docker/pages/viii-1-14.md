### VIII-1-14. ECR(Elastic Container Registry) 사용

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 AWS ECR 프라이빗 레지스트리를 생성하고, Docker 이미지를 빌드하여 ECR에 푸시하고, EC2에서 IAM 역할을 통해 이미지를 풀(Pull)할 수 있다.
- **설명**:
  Docker Hub는 편리하지만 기본 설정이 공개(Public) 저장소다. 회사 내부 이미지나 민감한 설정이 담긴 이미지를 올리기에는 적합하지 않다. AWS ECR은 AWS 계정 안에서만 접근 가능한 프라이빗 이미지 저장소로, EC2, ECS, Lambda 등 AWS 서비스와 자연스럽게 연동된다.
- **핵심 키워드**: ECR, `aws ecr`, `docker login`, IAM 역할, 이미지 수명 주기 정책, 최소 권한 원칙
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VII-1-1 (레지스트리), VIII-1-13
- **다음 섹션**: VIII-1-15

#### 본문

##### Docker Hub vs ECR

| 항목 | Docker Hub | AWS ECR |
|:--|:--|:--|
| 기본 공개 여부 | 공개 (Public) | 비공개 (Private) |
| 무료 저장소 | 1개 프라이빗 | 500MB/월 무료 (AWS 프리티어) |
| 인증 방식 | 사용자 계정 | AWS IAM |
| AWS 서비스 연동 | 별도 설정 필요 | EC2/ECS/Lambda 자동 연동 |
| 이미지 스캔 | 유료 | 기본 스캔 무료 |
| 네트워크 비용 | AWS → Docker Hub 전송 비용 발생 | 같은 리전 내 무료 |

같은 AWS 리전 안에서 EC2 → ECR 이미지 풀은 네트워크 비용이 발생하지 않는다. 이 점에서 AWS 환경이라면 ECR이 Docker Hub보다 유리하다.

##### AWS CLI 설치와 설정

로컬 PC에서 AWS 리소스를 CLI로 제어하려면 AWS CLI를 설치해야 한다.

```bash
# Mac (Homebrew)
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 설치 확인
aws --version
```

```bash
# AWS 자격 증명 설정
aws configure
```

`aws configure` 명령을 실행하면 아래 4가지를 차례로 입력한다.

```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: ap-northeast-2
Default output format [None]: json
```

> Access Key는 AWS 콘솔 → IAM → 사용자 → 보안 자격 증명 탭에서 생성한다.

> **[입문 렌즈 ★☆☆]**
> - **ECR 비유**: ECR은 회사 내부 사진 앨범 같다. Docker Hub가 누구나 볼 수 있는 공개 갤러리라면, ECR은 우리 팀만 접근할 수 있는 비공개 드라이브다.
> - **AWS CLI**: AWS 웹 콘솔에서 클릭하는 작업을 터미널 명령어로 하는 도구다. 자동화나 스크립트 작성에 필수다.

##### ECR 리포지토리 생성

```bash
# ECR 리포지토리 생성
aws ecr create-repository \
  --repository-name demo-app \
  --region ap-northeast-2
```

성공하면 아래와 같은 JSON 응답이 나온다.

```json
{
    "repository": {
        "repositoryArn": "arn:aws:ecr:ap-northeast-2:123456789012:repository/demo-app",
        "registryId": "123456789012",
        "repositoryName": "demo-app",
        "repositoryUri": "123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app",
        "createdAt": "2026-04-23T00:00:00+00:00",
        "imageTagMutability": "MUTABLE"
    }
}
```

`repositoryUri` 값을 메모해둔다. 이후 `docker tag`와 `docker push`에 사용한다.

##### ECR 로그인

ECR에 이미지를 푸시하려면 먼저 Docker 클라이언트를 ECR에 로그인시켜야 한다.

```bash
# ECR 로그인 (AWS CLI로 임시 토큰을 받아 docker login에 전달)
aws ecr get-login-password --region ap-northeast-2 \
  | docker login \
    --username AWS \
    --password-stdin \
    123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
```

성공하면 `Login Succeeded`가 출력된다. 이 토큰은 12시간 동안 유효하다.

##### 이미지 태그와 푸시

```bash
# 로컬에서 이미지 빌드
docker build -t demo-app:latest .

# ECR URI 형식으로 태그 추가
docker tag demo-app:latest \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:latest

# ECR에 푸시
docker push \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:latest
```

```bash
# 특정 버전 태그로 푸시 (권장)
docker tag demo-app:latest \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:v1.0.0

docker push \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:v1.0.0
```

> **[주니어 렌즈 ★★☆]**
> - **계정 ID 확인**: `aws sts get-caller-identity --query Account --output text` 명령으로 현재 AWS 계정 ID를 확인할 수 있다.
> - **환경변수로 URI 관리**: ECR URI를 반복 입력하지 않으려면 환경변수로 저장한다.
>   ```bash
>   export ECR_URI=123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app
>   docker tag demo-app:latest $ECR_URI:latest
>   docker push $ECR_URI:latest
>   ```
> - **`--image-tag-mutability IMMUTABLE`**: 같은 태그에 다른 이미지를 덮어쓰지 못하게 막는 옵션이다. 운영 환경에서는 이미지 불변성을 보장하기 위해 `IMMUTABLE`로 설정하는 것이 좋다.

##### EC2에서 이미지 풀 — IAM 역할 연결

EC2에서 ECR 이미지를 풀하려면 EC2 인스턴스에 적절한 IAM 역할이 연결되어야 한다. IAM 역할은 "이 인스턴스는 ECR에서 이미지를 읽을 수 있다"는 권한을 부여한다.

```
AWS 콘솔 → IAM → 역할 → 역할 만들기
→ 신뢰할 수 있는 엔티티: AWS 서비스 → EC2
→ 정책 연결: AmazonEC2ContainerRegistryReadOnly
→ 역할 이름: ec2-ecr-read-role → 생성
```

```
AWS 콘솔 → EC2 → 인스턴스 선택 → 작업 → 보안 → IAM 역할 수정
→ ec2-ecr-read-role 선택 → 저장
```

IAM 역할이 연결된 후 EC2에서 바로 `docker pull`을 실행할 수 있다.

```bash
# EC2에서 ECR 로그인 (IAM 역할 덕분에 자격 증명 없이 동작)
aws ecr get-login-password --region ap-northeast-2 \
  | docker login \
    --username AWS \
    --password-stdin \
    123456789012.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 풀
docker pull \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/demo-app:latest
```

##### ECR 수명 주기 정책

이미지를 계속 푸시하면 ECR 저장 비용이 누적된다. 수명 주기 정책을 설정하면 오래된 이미지를 자동으로 삭제한다.

```bash
# 수명 주기 정책 파일 작성
cat > lifecycle-policy.json << 'EOF'
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "최근 10개 이미지만 유지",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["v"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF

# 정책 적용
aws ecr put-lifecycle-policy \
  --repository-name demo-app \
  --lifecycle-policy-text file://lifecycle-policy.json
```

> **[실무자 렌즈 ★★★]**
> - **IAM 권한 최소화 원칙**: EC2에 부여하는 IAM 역할은 `AmazonEC2ContainerRegistryReadOnly`처럼 필요한 최소 권한만 부여한다. 빌드 서버(CI)에는 `AmazonEC2ContainerRegistryPowerUser`(push 포함)를 부여하고, 운영 서버에는 Read Only만 부여하는 식으로 역할을 분리한다.
> - **크로스 계정 접근**: 개발 계정(dev)에서 빌드한 이미지를 운영 계정(prod)에서 풀하는 경우, ECR 리포지토리 정책에 크로스 계정 IAM을 허용하는 설정이 필요하다.
> - **VPC 엔드포인트**: ECR은 기본적으로 인터넷을 통해 통신한다. 보안이 중요한 환경에서는 VPC 엔드포인트를 생성하여 인터넷을 거치지 않고 AWS 내부 네트워크로 ECR에 접근할 수 있다.

##### 체크포인트

- [ ] `aws ecr create-repository` 명령으로 ECR 리포지토리를 생성하고 `repositoryUri`를 확인할 수 있다
- [ ] `aws ecr get-login-password ... | docker login ...` 명령으로 ECR에 로그인하고 이미지를 푸시할 수 있다
- [ ] ECR이 Docker Hub 대신 필요한 이유(프라이빗, AWS 연동, 네트워크 비용)를 설명할 수 있다
- [ ] EC2에 IAM 역할을 연결하여 자격 증명 파일 없이 ECR에서 이미지를 풀할 수 있다
- [ ] ECR 수명 주기 정책을 설정하여 오래된 이미지를 자동으로 정리할 수 있다

---

