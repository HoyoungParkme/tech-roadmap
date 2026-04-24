### VII-1-4. CI/CD에서 Docker 빌드 자동화

- **난이도**: ★★★
- **선수 지식**: VII-1-3
- **학습 목표**: 이 Section을 마치면 GitHub Actions 워크플로우로 이미지를 자동 빌드·태그·push할 수 있다.
- **설명**:
  코드 변경이 main 브랜치에 merge될 때마다 이미지를 자동으로 빌드하고 레지스트리에 push하는 것이 CI/CD 표준이다. GitHub Actions 기준으로, `docker/setup-buildx-action`으로 BuildKit을 켜고, `docker/build-push-action`으로 빌드·push를 한 번에 처리한다. BuildKit은 레이어 캐시를 레지스트리에 저장(`--cache-from`, `--cache-to`)해 반복 빌드 속도를 크게 높인다.
- **핵심 키워드**: GitHub Actions, BuildKit, `docker/build-push-action`, 캐시 내보내기(`--cache-to`), 자동화
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: 부록 A

#### 본문

##### CI/CD 자동화가 필요한 이유

수동 빌드·push 프로세스는 세 가지 문제가 있다. 첫째, **실수 가능성** — 태그를 잘못 붙이거나 push를 빠뜨릴 수 있다. 둘째, **재현성 부족** — "내 노트북에서 빌드한 이미지"는 환경에 따라 다를 수 있다. 셋째, **병목** — 배포가 특정 사람에게 의존하게 된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 공장 자동화와 같다. 수작업으로 제품을 만들 때는 품질이 사람마다 다르고, 담당자가 없으면 생산이 멈춘다. 공장 자동화 버튼 하나면 원자재 투입 → 가공 → 검사 → 포장 → 출하까지 자동으로 처리된다. GitHub Actions의 워크플로우가 그 버튼이다. 코드를 main에 merge하면 빌드 → 스캔 → 레지스트리 push가 자동으로 실행된다.
> - **체감 예시**: 새벽 2시에 긴급 버그를 수정해서 main에 push했다. CI가 자동으로 이미지를 빌드하고 레지스트리에 올려준다. 배포 담당자는 레지스트리에서 새 이미지를 받아 서버에 올리기만 하면 된다. 빌드 절차를 외울 필요가 없다.
> - **주의**: 자동화가 잘못되면 실수도 자동화된다. 테스트가 없는 코드가 main에 merge되면 문제 있는 이미지가 자동으로 올라간다. CI에는 빌드 전에 테스트 실행 단계를 반드시 포함한다.

##### GitHub Actions 기본 구조

GitHub Actions 워크플로우는 `.github/workflows/` 디렉토리에 YAML 파일로 저장한다. Docker 빌드 자동화에 필요한 기본 구조는 다음과 같다.

```yaml
# .github/workflows/docker-build.yml
name: Docker 빌드 및 push

on:
  push:
    branches: [main]       # main 브랜치에 push될 때 실행
  pull_request:
    branches: [main]       # main으로 향하는 PR 생성/업데이트 시 실행

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}   # myorg/myapp 형식

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write      # GHCR에 push하기 위한 권한

    steps:
      # 1. 코드 체크아웃
      - name: 저장소 체크아웃
        uses: actions/checkout@v4

      # 2. BuildKit(buildx) 활성화
      - name: Docker Buildx 설정
        uses: docker/setup-buildx-action@v3

      # 3. GHCR 로그인
      - name: GHCR 로그인
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}   # GitHub이 자동 제공하는 토큰

      # 4. 이미지 메타데이터(태그) 자동 생성
      - name: 이미지 메타데이터 생성
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest,enable={{is_default_branch}}

      # 5. 빌드 및 push
      - name: 빌드 및 push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}   # PR에서는 push 안 함
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha                # GitHub Actions 캐시에서 불러옴
          cache-to: type=gha,mode=max         # GitHub Actions 캐시에 저장
```

**각 단계 설명:**

| 단계 | 역할 |
|:--|:--|
| `actions/checkout@v4` | 저장소 코드를 워크플로우 실행 환경에 내려받음 |
| `docker/setup-buildx-action@v3` | BuildKit 기반의 `buildx` 빌더를 활성화 |
| `docker/login-action@v3` | 레지스트리에 로그인. `GITHUB_TOKEN`은 GitHub이 자동 제공 |
| `docker/metadata-action@v5` | 브랜치, 태그, SHA에 맞는 이미지 태그를 자동 생성 |
| `docker/build-push-action@v5` | 빌드와 push를 한 번에 처리. BuildKit 캐시 연동 포함 |

> **[주니어 렌즈 ★★☆]**
> - **`secrets.GITHUB_TOKEN`**: GitHub Actions가 자동으로 제공하는 토큰이다. 저장소의 패키지(GHCR 포함)에 접근할 수 있는 권한을 갖는다. 별도로 발급하지 않아도 된다. 단, `permissions.packages: write`를 워크플로우에 명시해야 GHCR에 push할 수 있다.
> - **PR에서 push 안 하는 이유**: `push: ${{ github.event_name != 'pull_request' }}`는 PR 검증 시에는 빌드만 하고 실제 레지스트리에 push하지 않는다는 설정이다. 검토 전 코드의 이미지가 레지스트리에 올라가는 것을 막는다. main merge 후에만 push된다.
> - **`cache-from: type=gha` / `cache-to: type=gha`**: GitHub Actions가 관리하는 캐시 스토리지를 BuildKit 캐시 백엔드로 사용한다. 첫 빌드 이후 변경되지 않은 레이어는 캐시에서 재사용된다. 특히 `pip install`, `npm ci` 레이어가 캐시되면 빌드 시간이 수 분에서 수십 초로 단축될 수 있다. 캐시 용량 제한은 리포지토리당 10GB다.
> - **워크플로우 디버깅**: 빌드가 실패하면 Actions 탭의 해당 워크플로우 실행 기록에서 각 단계의 로그를 확인한다. `docker/build-push-action`의 `ACTIONS_STEP_DEBUG` 시크릿을 `true`로 설정하면 더 상세한 BuildKit 로그를 볼 수 있다.

##### 전체 파이프라인 흐름

```
코드 push (main 브랜치)
    │
    ├─ [테스트] pytest / npm test 실행
    │       │
    │       └─ 실패 시 → 빌드 단계 진행 안 함
    │
    ├─ [빌드] docker/build-push-action
    │       │  캐시 불러오기 (type=gha)
    │       │  이미지 빌드
    │       │  캐시 저장 (type=gha, mode=max)
    │
    ├─ [스캔] trivy 취약점 스캔
    │       │
    │       └─ CRITICAL 취약점 발견 시 → push 중단 (선택)
    │
    └─ [push] GHCR / ECR에 이미지 push
```

테스트 → 빌드 → 스캔 → push 순서가 표준이다. 앞 단계가 실패하면 뒤 단계는 실행되지 않는다. 취약한 이미지나 테스트를 통과하지 못한 코드의 이미지는 레지스트리에 올라가지 않는다.

**trivy 스캔을 CI에 추가하는 예시:**

```yaml
- name: trivy 이미지 스캔
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}
    format: table
    exit-code: 1              # CRITICAL 취약점 발견 시 워크플로우 실패
    severity: CRITICAL,HIGH
```

> **[실무자 렌즈 ★★★]**
> - **BuildKit 원격 캐시 — 레지스트리 캐시**: `type=gha` 대신 `type=registry`를 사용하면 캐시를 레지스트리에 저장할 수 있다. 여러 저장소나 셀프 호스팅 러너에서도 캐시를 공유할 수 있다는 장점이 있다.
>
>   ```yaml
>   cache-from: type=registry,ref=ghcr.io/myorg/myapp:buildcache
>   cache-to: type=registry,ref=ghcr.io/myorg/myapp:buildcache,mode=max
>   ```
>
> - **멀티플랫폼 빌드**: `docker/setup-buildx-action`을 사용하면 QEMU 에뮬레이션을 통해 `linux/amd64`와 `linux/arm64`를 동시에 빌드할 수 있다. Apple Silicon Mac에서도 동작하는 이미지를 CI에서 한 번에 생성한다.
>
>   ```yaml
>   - name: QEMU 설정 (멀티플랫폼 빌드용)
>     uses: docker/setup-qemu-action@v3
>
>   - name: 빌드 및 push
>     uses: docker/build-push-action@v5
>     with:
>       platforms: linux/amd64,linux/arm64
>       ...
>   ```
>
> - **배포 파이프라인 설계**: CI(이미지 빌드·push)와 CD(서버 배포)는 분리하는 것이 좋다. CI는 항상 실행하지만, CD는 승인이 필요하거나 특정 조건(Git 태그 생성, 수동 트리거 등)에서만 실행한다. GitHub Actions의 `environment` + `protection rules`를 사용하면 프로덕션 배포 전 승인자가 리뷰하는 단계를 추가할 수 있다. 이미지 레지스트리가 중간 저장소 역할을 해서 CI와 CD 파이프라인이 분리되면서도 연결된다.
> - **이미지 취약점 알림 자동화**: ECR, GHCR 모두 레지스트리에 이미지가 push될 때 자동으로 스캔하고 새 취약점이 발견되면 알림을 보내는 기능을 제공한다. ECR의 경우 `Enhanced Scanning`(Inspector 연동)을 활성화하면 새 CVE가 발표될 때마다 기존 이미지도 재스캔한다.

##### 체크포인트

- [ ] `.github/workflows/` 디렉토리에 Docker 빌드 워크플로우 YAML 파일을 만들어 main 브랜치 push 시 자동으로 이미지를 빌드할 수 있다
- [ ] `docker/setup-buildx-action`, `docker/login-action`, `docker/metadata-action`, `docker/build-push-action` 네 액션의 역할을 설명할 수 있다
- [ ] `cache-from: type=gha` / `cache-to: type=gha` 설정이 빌드 시간을 단축하는 원리를 설명할 수 있다
- [ ] PR에서 빌드만 하고 push는 하지 않는 조건(`push: ${{ github.event_name != 'pull_request' }}`)의 이유를 설명할 수 있다
- [ ] CI 파이프라인에서 테스트 → 빌드 → 스캔 → push 순서가 중요한 이유를 설명할 수 있다

---

