### VII-1-3. 보안 — 비루트 사용자, 이미지 스캔

- **난이도**: ★★★
- **선수 지식**: VII-1-2
- **학습 목표**: 이 Section을 마치면 컨테이너를 root가 아닌 일반 사용자로 실행하고, 이미지 취약점 스캔을 설정할 수 있다.
- **설명**:
  기본적으로 컨테이너 안에서 프로세스는 root로 실행된다. root 컨테이너가 탈출(escape)하면 호스트 시스템까지 위험해진다. Dockerfile에서 `USER` 명령으로 전용 비루트 사용자를 만들어 전환하는 것이 보안 모범 사례다. 이미지 스캔 도구(`docker scout`, `trivy`, `snyk`)는 이미지에 포함된 OS 패키지·라이브러리의 알려진 취약점(CVE)을 검사한다. CI 파이프라인에 스캔 단계를 추가해 취약한 이미지가 레지스트리에 올라가지 못하게 막는다.
- **핵심 키워드**: `USER`, 비루트 사용자, 컨테이너 탈출, CVE 스캔, trivy, docker scout
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: VII-1-4

#### 본문

##### 왜 컨테이너 보안이 중요한가

컨테이너는 가상 머신보다 격리 수준이 낮다. 커널을 호스트와 공유하기 때문이다. 컨테이너 안에서 root 권한으로 실행 중인 프로세스가 탈출(container escape)에 성공하면 호스트 시스템 전체를 장악할 수 있다. 컨테이너 탈출 취약점은 매년 발견된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 아파트 단지의 열쇠 비유다. root는 마스터키 — 관리인이 가진 키로 모든 세대, 지하 기계실, 옥상 모두 열 수 있다. 일반 사용자 계정은 방 열쇠 — 자신의 세대와 공용 공간 일부만 열 수 있다. 컨테이너에서 root를 쓰는 것은 앱 하나를 위해 마스터키를 꽂아두는 것과 같다. 침입자가 앱 취약점을 이용하면 마스터키로 전체를 장악할 수 있다.
> - **체감 예시**: `docker run --rm ubuntu whoami` 를 실행하면 `root`가 출력된다. 이것은 컨테이너 안의 앱이 root 권한으로 동작한다는 뜻이다. 비루트 사용자로 전환하면 같은 명령에서 `appuser` 같은 일반 사용자 이름이 출력된다.
> - **주의**: 비루트 사용자로 전환했더라도 `privileged` 모드(`docker run --privileged`)로 실행하면 root와 동등한 권한을 얻는다. `--privileged`는 절대 프로덕션에서 사용하지 않는다.

두 번째 위협은 이미지 안에 포함된 **취약한 패키지**다. `FROM python:3.12-slim` 같은 베이스 이미지에도 알려진 보안 취약점(CVE: Common Vulnerabilities and Exposures)이 있는 패키지가 포함될 수 있다. 이미지 스캔 도구는 이미지에 설치된 OS 패키지와 언어 패키지의 CVE 데이터베이스와 비교해 취약점을 찾아낸다.

##### 비루트 사용자 설정

Dockerfile에서 `USER` 명령으로 비루트 사용자를 만들고 전환한다. 표준 패턴은 다음과 같다.

**Python/Linux 예시:**

```dockerfile
FROM python:3.12-slim
WORKDIR /app

# 1. 시스템 사용자 생성 (--no-create-home: 홈 디렉토리 없음, --system: 시스템 계정)
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup --no-create-home appuser

# 2. 의존성 설치 (root로 실행 — 시스템 패키지 설치 필요)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. 소스 복사
COPY . .

# 4. 파일 소유권 변경 (appuser가 읽을 수 있도록)
RUN chown -R appuser:appgroup /app

# 5. 비루트 사용자로 전환
USER appuser

CMD ["python", "main.py"]
```

`USER` 명령 이후의 모든 명령(`RUN`, `CMD`, `ENTRYPOINT`)은 해당 사용자 권한으로 실행된다. 패키지 설치처럼 root 권한이 필요한 단계는 `USER` 앞에 둔다.

**Node.js 예시 — node 이미지는 기본 제공 사용자 활용:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# node 이미지에는 'node' 사용자가 기본 포함됨
RUN chown -R node:node /app
USER node

CMD ["node", "index.js"]
```

공식 `node` 이미지는 `node` 사용자를 기본으로 포함한다. 별도로 사용자를 만들 필요가 없다.

##### trivy로 이미지 취약점 스캔

trivy는 Aqua Security에서 만든 오픈소스 취약점 스캐너다. 설치가 간단하고 Docker 이미지, 파일시스템, Git 저장소 등을 스캔할 수 있다.

**로컬 설치 (Linux/Mac):**

```bash
# Homebrew (Mac)
brew install trivy

# 스크립트 설치 (Linux)
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

**이미지 스캔:**

```bash
# 로컬 이미지 스캔
trivy image myapp:latest

# 레지스트리 이미지 스캔
trivy image ghcr.io/myorg/myapp:1.2.3

# CRITICAL, HIGH 등급 취약점만 표시
trivy image --severity CRITICAL,HIGH myapp:latest

# JSON 출력 (CI 파이프라인 처리용)
trivy image --format json --output trivy-results.json myapp:latest
```

스캔 결과 예시:

```
myapp:latest (debian 12.0)
=========================
Total: 3 (CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 0)

┌──────────────┬──────────────────┬──────────┬──────────────────────┐
│   Library    │  Vulnerability   │ Severity │     Description      │
├──────────────┼──────────────────┼──────────┼──────────────────────┤
│ libssl3      │ CVE-2024-XXXXX   │ HIGH     │ OpenSSL 버퍼 오버플로우 │
└──────────────┴──────────────────┴──────────┴──────────────────────┘
```

취약점이 발견되면 보통 두 가지 대응이 있다. 해당 패키지 버전을 업그레이드하거나, 더 최신 베이스 이미지로 변경한다.

> **[주니어 렌즈 ★★☆]**
> - **`docker scout`**: Docker Desktop 4.17+부터 포함된 공식 스캔 도구다. `docker scout cves myapp:latest`로 CVE를 확인하고, `docker scout recommendations myapp:latest`로 더 취약점이 적은 베이스 이미지를 추천받을 수 있다. trivy에 비해 간단히 쓸 수 있다.
> - **취약점 무시 파일**: 모든 취약점을 즉시 고칠 수 없는 경우 trivy의 `.trivyignore` 파일에 CVE ID를 등록해 특정 취약점을 무시할 수 있다. 단, 무시하는 이유와 재검토 일정을 주석으로 반드시 기록한다.
>
>   ```
>   # .trivyignore
>   # 이유: 해당 취약점은 이 앱에서 사용하는 코드 경로에 없음. 2026-07-01 재검토
>   CVE-2024-XXXXX
>   ```
>
> - **USER 전환 후 파일 접근 오류**: `USER appuser`로 전환 후 `/app` 디렉토리에 쓰기 권한이 없어 앱이 실패하는 경우가 많다. `chown -R appuser /app`을 `USER` 명령 전에 실행했는지 확인한다. 로그 파일, 업로드 디렉토리 등 앱이 쓰기를 필요로 하는 경로를 모두 권한 변경 대상에 포함해야 한다.

> **[실무자 렌즈 ★★★]**
> - **distroless 이미지**: Google이 만든 distroless 이미지(`gcr.io/distroless/python3`, `gcr.io/distroless/java17`)는 앱 실행에 필요한 런타임만 포함하고 셸, 패키지 관리자, 유틸리티를 전혀 포함하지 않는다. 공격 표면(attack surface)이 최소화된다. 멀티 스테이지 빌드와 함께 쓴다 — 빌드 스테이지에서 앱을 빌드하고, 최종 스테이지에서 distroless를 베이스로 아티팩트만 복사한다. 컨테이너에 침입해도 `bash`, `curl` 같은 도구가 없어 추가 공격이 어려워진다.
> - **이미지 서명 (cosign)**: `sigstore/cosign`으로 이미지에 서명하면 레지스트리에 서명 데이터가 함께 저장된다. 배포 시 서명을 검증해 신뢰할 수 있는 소스에서 빌드된 이미지인지 확인할 수 있다. Kubernetes admission controller(Policy Controller, Kyverno 등)와 연동하면 서명되지 않은 이미지의 배포를 자동 차단할 수 있다.
> - **SBOM(Software Bill of Materials)**: 이미지에 포함된 모든 소프트웨어 컴포넌트 목록이다. `trivy image --format cyclonedx myapp:latest`로 CycloneDX 형식 SBOM을 생성할 수 있다. 공급망 보안 규정이 강화되면서 SBOM 제공이 요구되는 경우가 늘고 있다. GitHub Dependency Graph, Dependabot과 통합해 자동 취약점 알림을 받을 수 있다.
> - **컨테이너 런타임 보안**: 빌드 타임 보안(이미지 스캔)과 별개로 런타임 보안도 필요하다. `seccomp` 프로파일로 컨테이너에서 허용할 시스템 콜을 제한하고, `AppArmor`/`SELinux` 프로파일로 파일 접근을 제어한다. `--read-only` 플래그로 컨테이너 파일시스템을 읽기 전용으로 만들고, 쓰기가 필요한 곳만 tmpfs 마운트로 허용하는 것이 최소 권한 원칙에 부합한다.

##### 체크포인트

- [ ] `RUN adduser`와 `USER` 명령을 사용해 비루트 사용자로 실행되는 Dockerfile을 작성할 수 있다
- [ ] `docker exec -it <컨테이너명> whoami` 명령으로 컨테이너 안의 실행 사용자를 확인할 수 있다
- [ ] trivy 또는 `docker scout`로 이미지를 스캔하고 CRITICAL/HIGH 취약점 목록을 확인할 수 있다
- [ ] `USER` 명령 이후에 파일 쓰기 오류가 발생했을 때 `chown` 명령으로 해결하는 방법을 설명할 수 있다
- [ ] distroless 이미지를 쓰는 이유와 멀티 스테이지 빌드와 함께 사용하는 방법을 설명할 수 있다

