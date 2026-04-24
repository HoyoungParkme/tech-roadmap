### VII-1-2. 이미지 태깅 전략 (semver, latest, sha)
[iframe](/visualizations/vii-1-2_tagging_strategy.html)

- **난이도**: ★★★
- **선수 지식**: VII-1-1
- **학습 목표**: 이 Section을 마치면 프로덕션 배포에서 `latest` 태그를 피해야 하는 이유를 설명하고 대안을 적용할 수 있다.
- **설명**:
  `latest` 태그는 편하지만 위험하다. `latest`를 pull하면 그 시점의 가장 최신 이미지가 내려오는데, 의도치 않은 버전이 배포될 수 있다. 실무에서는 세 가지 태깅 전략을 조합한다. semver(1.2.3)로 릴리스 버전을 명시하고, Git 커밋 SHA(a1b2c3d)로 정확한 빌드를 추적하고, 브랜치명(main, release)으로 의미를 부여한다. CI/CD 파이프라인에서 자동으로 여러 태그를 동시에 붙이는 것이 표준이다.
- **핵심 키워드**: `latest` 태그, semver, Git SHA 태그, `docker tag`, 이미지 불변성
- **시각화 연결**: [visualizations/vii-1-2_tagging_strategy.html](visualizations/vii-1-2_tagging_strategy.html) (이미지 태깅 전략 4단계 시각화)
- **다음 섹션**: VII-1-3

#### 본문

##### `latest` 태그의 함정

`latest` 태그는 "가장 최신 이미지"를 가리키도록 관례적으로 쓰이는 이름이다. 편하지만 **예측 불가능하다**는 치명적인 단점이 있다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 보고서 파일 이름에 날짜를 안 붙이는 것과 같다. `report_final.docx`, `report_final2.docx`, `report_진짜최종.docx` — 어느 파일이 실제 최종본인지 모른다. 날짜와 버전 번호를 붙이면(`report_2026-04-23_v1.2.docx`) 어느 시점의 파일인지 명확해진다. 이미지 태그도 마찬가지다.
> - **체감 예시**: 서버에서 `docker pull myapp:latest`를 실행했을 때 어제 올린 이미지가 내려올 수도 있고, 방금 누군가 올린 이미지가 내려올 수도 있다. 배포 시점에 무슨 코드가 실행될지 태그 이름만으로는 보장할 수 없다.
> - **주의**: `latest`는 Docker가 특별하게 관리하는 태그가 아니다. `docker push myapp`처럼 태그를 생략하면 자동으로 `latest`가 붙을 뿐이다. Docker가 자동으로 최신 이미지를 `latest`로 갱신하지 않는다.

`latest` 태그의 구체적인 문제:

1. **재현 불가**: 3개월 전에 배포한 이미지를 그대로 다시 올리기 어렵다. `latest`는 항상 현재 시점의 최신 이미지를 가리키므로 과거 특정 버전을 정확히 가리킬 수 없다.
2. **롤백 어려움**: 장애가 발생해 이전 버전으로 되돌려야 할 때 "이전 `latest`가 무엇이었는가"를 알기 어렵다.
3. **캐시 오염**: 서버에 이미 `latest` 이미지가 캐시되어 있으면 `docker pull`을 해도 새 이미지가 내려오지 않을 수 있다. Docker는 레이어 다이제스트(SHA256)가 다를 때만 업데이트한다.

##### 세 가지 태깅 전략

실무에서 주로 세 가지 방식을 조합한다.

| 전략 | 예시 | 특징 | 용도 |
|:--|:--|:--|:--|
| **semver** | `1.0.0`, `1.2.3` | 의미론적 버전. 주.부.패치 형식 | 릴리스 버전 명시 |
| **Git SHA** | `a1b2c3d`, `a1b2c3d4e5f6` | 커밋 해시. 정확한 코드 상태 | 빌드 추적, 디버깅 |
| **브랜치/환경** | `main`, `develop`, `staging` | 브랜치 또는 환경 이름 | CI 자동 배포, 테스트 환경 |

일반적으로 하나의 이미지에 여러 태그를 동시에 붙인다. 같은 이미지 콘텐츠를 여러 이름으로 부르는 것이고, 저장 용량이 중복되지 않는다(동일 레이어는 공유).

```bash
# 같은 이미지에 여러 태그 부여
docker tag myapp:a1b2c3d myusername/myapp:1.2.3
docker tag myapp:a1b2c3d myusername/myapp:latest   # latest도 같이 올림 (선택)

# 동시에 push
docker push myusername/myapp:1.2.3
docker push myusername/myapp:latest
```

##### Git SHA 태그

**Git SHA(커밋 해시) 태그**는 이미지가 정확히 어느 코드 상태에서 빌드됐는지 추적할 수 있게 한다. semver는 "이 버전에 어떤 기능이 있다"는 의미를 전달하고, SHA는 "정확히 이 커밋의 코드"라는 사실을 보장한다.

```bash
# Git 커밋 SHA 앞 7자리 가져오기
GIT_SHA=$(git rev-parse --short HEAD)
echo $GIT_SHA  # 예: a1b2c3d

# SHA를 태그로 사용
docker build -t myusername/myapp:${GIT_SHA} .
docker push myusername/myapp:${GIT_SHA}
```

배포 기록에 이미지 태그(`a1b2c3d`)를 남기면, 나중에 문제가 생겼을 때 `git log a1b2c3d`로 정확히 어떤 커밋인지 바로 찾을 수 있다.

> **[주니어 렌즈 ★★☆]**
> - **semver 규칙 이해**: `주버전.부버전.패치버전` — 패치(버그 수정)는 `1.0.0 → 1.0.1`, 부버전(하위 호환 기능 추가)은 `1.0.0 → 1.1.0`, 주버전(하위 비호환 변경)은 `1.0.0 → 2.0.0`으로 올린다. 컨테이너 이미지 태그에 semver를 적용하면 배포된 버전의 변경 규모를 태그만 보고 파악할 수 있다.
> - **`latest`를 완전히 안 쓸 필요는 없다**: 로컬 개발 환경에서는 `latest`를 써도 된다. 프로덕션 서버와 CI에서만 명시적 버전 태그를 강제하면 된다. `docker-compose.yml`(개발용)에서는 `image: myapp:latest`, 프로덕션 배포 매니페스트에서는 `image: myapp:1.2.3` 또는 `image: myapp@sha256:...` 형식을 쓴다.
> - **이미지 다이제스트 고정**: 태그는 가변이지만 다이제스트(`sha256:...`)는 불변이다. 보안이 중요한 프로덕션 환경에서는 태그 대신 다이제스트로 이미지를 고정한다. `docker pull nginx@sha256:abc123...`처럼 쓴다. `docker inspect <이미지명> --format '{{.RepoDigests}}'`로 이미지의 다이제스트를 확인할 수 있다.

##### CI에서 자동 태깅

수동으로 태그를 붙이는 것은 실수가 생기기 쉽다. CI/CD 파이프라인에서 자동으로 태그를 생성하는 것이 표준이다.

**`git describe` 활용:**

```bash
# 가장 가까운 Git 태그 + 커밋 수 + SHA 조합
git describe --tags --always
# 예: v1.2.3-4-ga1b2c3d  (v1.2.3 태그 이후 4커밋, SHA a1b2c3d)
```

`git describe`는 가장 가까운 Git 태그로부터 현재 커밋까지의 관계를 사람이 읽기 쉬운 형식으로 표현한다. 이미지 태그로 쓰면 버전과 커밋 위치를 동시에 담을 수 있다.

**GitHub Actions에서 메타데이터 자동 생성:**

`docker/metadata-action`을 사용하면 브랜치, 태그, PR 번호에 맞는 이미지 태그를 자동으로 생성한다.

```yaml
- name: Docker 메타데이터 생성
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ghcr.io/myorg/myapp
    tags: |
      type=semver,pattern={{version}}      # Git 태그가 v1.2.3이면 → 1.2.3
      type=semver,pattern={{major}}.{{minor}}  # → 1.2
      type=sha,prefix=                     # → a1b2c3d
      type=raw,value=latest,enable={{is_default_branch}}  # main 브랜치에만 latest
```

이 액션은 `steps.meta.outputs.tags`와 `steps.meta.outputs.labels`를 제공해 `build-push-action`과 바로 연결할 수 있다.

> **[실무자 렌즈 ★★★]**
> - **이미지 불변성 원칙**: 한 번 레지스트리에 push한 이미지 태그는 다시 덮어쓰지 않는다. `1.2.3` 태그가 이미 존재하면 같은 태그로 다시 push하지 말고, `1.2.4`를 만든다. 일부 레지스트리(ECR 등)는 이미지 태그 불변성(image tag immutability)을 강제하는 설정을 제공한다. 이 옵션을 활성화하면 실수로 기존 태그를 덮어쓰는 것을 방지할 수 있다.
> - **롤백 전략**: 태그 기반 롤백은 간단하다. `docker pull myapp:1.2.2`로 이전 버전을 내려받고 재배포한다. Kubernetes 환경에서는 `kubectl set image deployment/myapp myapp=myapp:1.2.2`로 롤백한다. SHA 기반 배포(`myapp@sha256:...`)를 사용하면 태그가 덮어써지더라도 정확한 이미지를 지정할 수 있다.
> - **이미지 승격(promotion) 패턴**: CI에서 빌드된 이미지를 `staging` 환경에서 검증 후, 동일 이미지를 프로덕션용 태그로 재태그한다. 새로 빌드하지 않고 검증 완료된 이미지를 그대로 쓰는 것이다. `docker pull myapp:staging-a1b2c3d` → 검증 → `docker tag myapp:staging-a1b2c3d myapp:1.2.3` → `docker push myapp:1.2.3`. 이 패턴은 "빌드한 것을 그대로 배포"라는 원칙을 지킨다.

##### 체크포인트

- [ ] `latest` 태그를 프로덕션에서 쓰면 안 되는 이유 두 가지를 설명할 수 있다
- [ ] `git rev-parse --short HEAD`로 Git SHA를 가져와 이미지 태그로 사용할 수 있다
- [ ] 하나의 이미지에 semver 태그와 SHA 태그를 동시에 붙이는 이유를 설명할 수 있다
- [ ] 이미지 태그와 이미지 다이제스트(sha256)의 차이를 설명하고, 프로덕션에서 다이제스트를 쓰는 이유를 말할 수 있다
- [ ] CI에서 `docker/metadata-action`이 자동으로 생성하는 태그 종류를 설명할 수 있다

