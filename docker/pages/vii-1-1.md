### VII-1-1. Docker Hub / GitHub Container Registry 사용

- **난이도**: ★★★
- **선수 지식**: VI-1-4
- **학습 목표**: 이 Section을 마치면 자신이 빌드한 이미지를 레지스트리에 push하고 서버에서 pull할 수 있다.
- **설명**:
  이미지를 레지스트리에 올리면 어느 서버에서든 `docker pull`로 내려받아 실행할 수 있다. Docker Hub는 무료 계정으로 공개 이미지를 무제한 저장할 수 있다. GitHub Container Registry(ghcr.io)는 GitHub 저장소와 연동되어 GitHub Actions에서 자동 push하기 쉽다. 이미지를 push하기 전에 `docker login`으로 인증하고, `docker tag`로 레지스트리 주소를 포함한 이름으로 태그를 붙인다.
- **핵심 키워드**: `docker login`, `docker tag`, `docker push`, ghcr.io, ECR, Artifact Registry
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VII-1-2

#### 본문

##### 레지스트리란 무엇인가

레지스트리(Registry)는 Docker 이미지를 저장하고 배포하는 원격 저장소다. `docker build`로 만든 이미지는 기본적으로 빌드한 로컬 머신에만 존재한다. 다른 서버나 팀원의 컴퓨터에서 그 이미지를 쓰려면 어딘가 공통으로 접근할 수 있는 곳에 올려야 한다. 레지스트리가 그 역할을 한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 클라우드 사진첩(Google Photos, iCloud)과 같다. 내 폰에서 찍은 사진을 클라우드에 올려두면 다른 기기에서 언제든 내려받을 수 있다. Docker 이미지도 마찬가지다. 내 노트북에서 빌드한 이미지를 레지스트리에 올려두면 서버에서 `docker pull` 한 줄로 내려받아 실행할 수 있다.
> - **체감 예시**: 팀원이 "내 로컬에서는 잘 되는데 서버에서 안 돼요"라는 상황을 레지스트리가 해결한다. 이미지를 레지스트리에 올리면 모두가 같은 이미지를 쓰게 되어 환경 차이가 사라진다.
> - **주의**: `docker push` 전에 반드시 `docker login`으로 인증해야 한다. 인증 없이 push하면 `denied: access forbidden` 오류가 난다.

주요 레지스트리 서비스는 다음과 같다.

| 레지스트리 | 주소 | 특징 |
|:--|:--|:--|
| Docker Hub | `docker.io` (기본값) | 가장 널리 쓰이는 공개 레지스트리. 무료 계정은 공개 이미지 무제한, 비공개 이미지 1개 |
| GitHub Container Registry (GHCR) | `ghcr.io` | GitHub 저장소·Actions와 통합. 비공개 이미지 무료 |
| AWS ECR | `<계정>.dkr.ecr.<리전>.amazonaws.com` | AWS IAM 기반 인증. ECS/EKS와 연동 |
| GCP Artifact Registry | `<리전>-docker.pkg.dev` | Google Cloud 네이티브. GKE와 연동 |
| 자체 호스팅 | `registry:2` | Docker Registry 컨테이너로 직접 운영 |

##### Docker Hub 사용: login → tag → push → pull

Docker Hub는 별도 설정 없이 바로 사용할 수 있다. 순서는 네 단계다.

**1단계: Docker Hub 로그인**

```bash
docker login
# Username: [Docker Hub 아이디]
# Password: [Docker Hub 비밀번호 또는 액세스 토큰]
```

비밀번호 대신 Docker Hub에서 발급한 **액세스 토큰**을 쓰는 것이 보안상 권장된다. Docker Hub → Account Settings → Security → New Access Token에서 발급한다. 토큰에 권한 범위(Read, Write 등)를 지정할 수 있어 비밀번호 노출 위험을 줄인다.

**2단계: 이미지에 레지스트리 주소 포함 태그 붙이기**

Docker Hub에 올리려면 이미지 이름이 `[사용자명]/[이미지명]:[태그]` 형식이어야 한다.

```bash
# 기존 이미지에 Docker Hub용 태그 추가
docker tag myapp:latest myusername/myapp:latest

# 빌드 시 바로 태그 지정
docker build -t myusername/myapp:1.0.0 .
```

**3단계: 레지스트리에 push**

```bash
docker push myusername/myapp:latest
docker push myusername/myapp:1.0.0
```

**4단계: 어느 서버에서든 pull**

```bash
docker pull myusername/myapp:latest
docker run -d -p 8000:8000 myusername/myapp:latest
```

##### GitHub Container Registry(GHCR) 사용

GHCR은 GitHub 저장소와 연동되어 GitHub Actions에서 자동 push하기 가장 편한 레지스트리다. 비공개 이미지도 GitHub 무료 계정에서 사용할 수 있다.

**GHCR Personal Access Token(PAT) 발급:**

GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) 에서 새 토큰을 만든다. 권한은 `write:packages`, `read:packages`, `delete:packages`를 선택한다.

```bash
# GHCR 로그인
echo $GITHUB_TOKEN | docker login ghcr.io -u [github-username] --password-stdin

# 이미지 태그 — ghcr.io/[github-username-or-org]/[이미지명]:[태그]
docker tag myapp:latest ghcr.io/myusername/myapp:latest

# push
docker push ghcr.io/myusername/myapp:latest
```

`--password-stdin`은 터미널에 토큰이 그대로 노출되지 않도록 stdin에서 읽는 방식이다. 스크립트나 CI 환경에서 반드시 이 방식을 사용한다.

GHCR에 올린 이미지는 기본적으로 비공개다. GitHub 저장소 Settings → Packages에서 접근 권한을 설정한다.

> **[주니어 렌즈 ★★☆]**
> - **push 전 확인**: `docker images`로 태그가 올바르게 붙었는지 확인한 뒤 push한다. `docker push`는 레이어 단위로 업로드하므로, 이전에 같은 레이어를 올린 적 있으면 `Layer already exists` 메시지와 함께 건너뛴다.
> - **`docker login` 정보 저장 위치**: 로그인 정보는 `~/.docker/config.json`에 base64로 인코딩되어 저장된다. base64는 암호화가 아니므로 이 파일이 유출되면 레지스트리 접근 권한이 노출된다. CI 환경에서는 환경 변수로만 전달하고 파일에 저장하지 않는다. Docker credential helper(`docker-credential-*`)를 설치하면 OS의 키체인에 안전하게 저장할 수 있다.
> - **멀티 레지스트리 로그인**: 여러 레지스트리에 동시에 로그인할 수 있다. `docker login docker.io`, `docker login ghcr.io`, `docker login [ECR주소]`를 각각 실행하면 된다. `~/.docker/config.json`에 레지스트리별로 인증 정보가 저장된다.

> **[실무자 렌즈 ★★★]**
> - **AWS ECR**: ECR은 IAM 기반 인증을 사용한다. `aws ecr get-login-password` 명령으로 임시 토큰을 받아 `docker login`에 전달한다. 토큰은 12시간 유효하므로 CI에서는 빌드 시작 시 항상 재발급해야 한다.
>
>   ```bash
>   aws ecr get-login-password --region ap-northeast-2 | \
>     docker login --username AWS --password-stdin \
>     123456789.dkr.ecr.ap-northeast-2.amazonaws.com
>   ```
>
> - **이미지 미러링**: 공개 이미지(Docker Hub의 `nginx`, `postgres` 등)를 그대로 쓰면 Docker Hub의 rate limit(무료 계정: 6시간에 200회 pull)에 걸릴 수 있다. 프로덕션에서는 자주 쓰는 베이스 이미지를 ECR이나 GHCR에 미러링해두고 그곳에서 pull한다. CI/CD에서도 Docker Hub 대신 내부 미러를 쓰면 빌드 실패 위험을 줄일 수 있다.
> - **접근 제어**: ECR은 리포지토리별 IAM 정책으로 push/pull 권한을 분리할 수 있다. 빌드 서버에는 `ecr:GetAuthorizationToken`과 `ecr:BatchCheckLayerAvailability`, `ecr:PutImage` 권한만 부여하고, 운영 서버에는 `ecr:GetDownloadUrlForLayer`와 `ecr:BatchGetImage`(pull 전용) 권한만 부여하는 것이 최소 권한 원칙이다.

##### 체크포인트

- [ ] `docker login`, `docker tag`, `docker push`, `docker pull` 명령을 순서대로 실행해서 Docker Hub에 이미지를 올리고 다른 터미널에서 내려받을 수 있다
- [ ] Docker Hub 이미지 이름의 형식(`사용자명/이미지명:태그`)을 설명할 수 있다
- [ ] GHCR에 이미지를 push할 때 필요한 PAT 권한(`write:packages`)을 알고, `--password-stdin` 방식으로 로그인할 수 있다
- [ ] `docker login` 인증 정보가 저장되는 위치와 CI 환경에서 주의해야 하는 이유를 설명할 수 있다
- [ ] Docker Hub, GHCR, ECR 중 자신이 사용 중인 환경에 맞는 레지스트리를 선택하고 이유를 설명할 수 있다

