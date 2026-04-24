# 예제 IV-1-3: Multi-stage 빌드로 이미지 크기 줄이기

## 목적

Multi-stage 빌드로 이미지 크기를 줄이는 방법을 학습한다.

빌드 도구(gcc, make, 헤더 파일 등)는 애플리케이션 실행에 필요하지 않다.
하지만 단일 스테이지 빌드에서는 이 도구들이 그대로 최종 이미지에 남는다.
Multi-stage 빌드는 빌드 단계와 실행 단계를 분리해, 실행에 필요한 파일만 slim 이미지에 담는다.

이 예제는 `multistage-demo:multi`(Multi-stage)와 `multistage-demo:single`(단일 스테이지) 두 이미지를
나란히 빌드해서 크기 차이를 눈으로 확인하는 것이 핵심 목표다.

---

## 사전 요건

| 항목 | 버전 | 확인 명령 |
|:--|:--|:--|
| Docker Engine | 24 이상 | `docker --version` |
| Docker Compose v2 | 2.20 이상 | `docker compose version` |

> `docker-compose`(하이픈)가 아닌 `docker compose`(스페이스)를 사용한다. 하이픈 형식은 v1 레거시다.

---

## 파일 구성

```
iv-1-3-multistage-build/
├── Dockerfile              # Multi-stage 빌드 (builder → python:3.11-slim)
├── Dockerfile.single       # 단일 스테이지 빌드 (python:3.11 full — 비교용)
├── docker-compose.yml      # app-multi(8000) + app-single(8001) 두 서비스 정의
├── .env.example            # 환경 변수 샘플 (복사 후 사용)
├── requirements.txt        # fastapi, uvicorn
└── app/
    └── main.py             # FastAPI 루트 + 헬스체크 엔드포인트
```

---

## 실행 단계

### 1단계: 환경 변수 파일 복사

```bash
cp .env.example .env
```

`.env` 파일이 생성된다. 학습 환경에서는 기본값 그대로 사용해도 된다.

### 2단계: 두 이미지 빌드

```bash
docker compose build
```

`app-multi`(Multi-stage)와 `app-single`(단일 스테이지) 두 이미지가 빌드된다.
첫 실행 시 베이스 이미지를 내려받아야 해서 시간이 걸린다.

### 3단계: 이미지 크기 비교 (핵심)

```bash
docker images | grep multistage
```

아래와 같이 두 이미지의 크기 차이를 확인할 수 있다.

```
REPOSITORY          TAG       IMAGE ID       CREATED          SIZE
multistage-demo     multi     xxxxxxxxxxxx   X seconds ago    ~200 MB
multistage-demo     single    xxxxxxxxxxxx   X seconds ago    ~1 GB
```

> 실제 크기는 환경마다 다를 수 있다. `multi`가 `single`보다 수백 MB 작아야 정상이다.

### 4단계: 두 컨테이너 시작

```bash
docker compose up -d
```

`app-multi`는 8000번 포트, `app-single`은 8001번 포트로 실행된다.

### 5단계: Multi-stage 빌드 응답 확인

```bash
curl http://localhost:8000/
```

`build_type`이 `multi-stage`로 표시된다.

```json
{
  "message": "Hello from multi-stage build!",
  "python_version": "3.12.x ...",
  "build_type": "multi-stage"
}
```

### 6단계: 단일 스테이지 빌드 응답 확인

```bash
curl http://localhost:8001/
```

`build_type`이 `single-stage`로 표시된다.

```json
{
  "message": "Hello from multi-stage build!",
  "python_version": "3.12.x ...",
  "build_type": "single-stage"
}
```

### 7단계: 종료

```bash
docker compose down
```

두 컨테이너가 모두 삭제된다.

---

## 렌즈로 이해하기

> **[입문 렌즈 ★☆☆]**
> - **비유**: 이사할 때 짐 정리와 같다. 이삿짐을 쌀 때 공구(드릴, 망치 등)를 동원해 가구를 분해한다. 하지만 새 집에 가져가는 짐은 가구 자체이지, 분해에 쓴 공구가 아니다. Multi-stage 빌드도 같다. 첫 번째 스테이지(builder)는 공구다. pip, gcc, make로 패키지를 설치한다. 두 번째 스테이지(slim)는 새 집이다. 실행에 필요한 파이썬 패키지만 골라 옮긴다. 공구(빌드 도구)는 새 집에 가져가지 않으므로 짐(이미지)이 가벼워진다.
> - **체감 예시**: 완성된 케이크를 배달할 때 밀가루 포대, 오븐, 거품기를 함께 실어 보내지 않는 것과 같다. Multi-stage 빌드는 케이크(실행 가능한 앱)만 배달 박스(slim 이미지)에 담는다.
> - **주의**: 3단계에서 `docker images | grep multistage`로 반드시 크기를 눈으로 확인한다. 이 숫자 차이를 직접 보는 것이 이 예제의 핵심이다.

> **[주니어 렌즈 ★★☆]**
> - **`--prefix` 옵션**: `Dockerfile`의 빌드 스테이지에서 `pip install --prefix=/install`을 사용한다. 패키지를 `/usr/local`이 아닌 `/install`이라는 별도 경로에 설치한다. 이렇게 하면 다음 스테이지에서 `COPY --from=builder /install /usr/local`로 패키지만 깔끔하게 옮길 수 있다. 전체 `/usr/local`을 복사하면 빌드 도구가 따라올 수 있다.
> - **`COPY --from` 경로 이해**: `COPY --from=builder /install /usr/local`에서 `builder`는 첫 번째 `FROM ... AS builder`에서 붙인 이름이다. 스테이지 이름은 이 예제처럼 의미 있는 이름을 붙이는 것이 좋다. 이름 없이 `--from=0`처럼 인덱스를 쓸 수도 있지만, 스테이지가 많아지면 헷갈린다.
> - **`.dockerignore`로 빌드 컨텍스트 최적화**: `docker compose build`를 실행하면 현재 폴더 전체가 Docker 데몬에 전달된다(빌드 컨텍스트). `.dockerignore` 파일에 `__pycache__`, `*.pyc`, `.git`, `.env` 등을 추가하면 전송되는 데이터가 줄어 빌드가 빨라진다. `.gitignore`와 문법이 같다.
> - **체크리스트**:
>   - [ ] `docker images | grep multistage`에서 `multi`가 `single`보다 작게 나온다
>   - [ ] `curl http://localhost:8000/`의 `build_type`이 `"multi-stage"`다
>   - [ ] `curl http://localhost:8001/`의 `build_type`이 `"single-stage"`다

> **[실무자 렌즈 ★★★]**
> - **distroless 베이스 이미지**: `python:3.11-slim` 대신 `gcr.io/distroless/python3` 이미지를 사용하면 OS 패키지 관리자(apt, bash, sh)마저 제거돼 이미지 크기가 더 줄고 공격 표면이 최소화된다. shell이 없어 `docker exec`로 컨테이너에 직접 들어갈 수 없으므로 디버깅 방법이 달라진다. `scratch` 이미지는 운영체제 자체를 제거한 완전 빈 이미지로, Go 같이 정적 바이너리를 만드는 언어에 적합하다.
> - **CI/CD에서 빌드 스테이지 캐시 (`--cache-from`)**: GitHub Actions 같은 CI 환경은 매 실행마다 캐시가 없어 전체를 새로 빌드한다. `docker build --cache-from ghcr.io/<user>/<image>:cache --target builder .`로 레지스트리에 저장된 이전 빌드 스테이지를 캐시로 재사용하면 빌드 시간을 크게 줄일 수 있다. `docker buildx`의 `--cache-to type=registry`와 함께 사용하면 스테이지별 캐시를 레이어 단위로 저장한다.
> - **scratch 이미지**: Go나 Rust처럼 정적 링크된 단일 바이너리를 만드는 언어에서는 `FROM scratch`를 써서 OS 자체를 포함하지 않는 이미지를 만든다. Python은 런타임 인터프리터가 필요해 scratch를 직접 쓰기 어렵지만, 컴파일 언어에서는 이미지가 수 MB 수준으로 줄어든다.

---

## 보안 안내

이 예제의 포트 설정(`8000:8000`, `8001:8000`)은 학습 편의를 위해 모든 인터페이스(`0.0.0.0`)에 바인딩된다.
학습 환경이 아닌 서버에서 실행하는 경우, `docker-compose.yml`의 포트를 아래와 같이 수정해
로컬호스트에서만 접근하도록 제한하는 것을 권장한다.

```yaml
ports:
  - "127.0.0.1:8000:8000"
```

---

## 자동 검증

아래 명령으로 전체 흐름(빌드 → 크기 비교 → 실행 → 응답 확인)을 자동으로 검증할 수 있다.

```bash
bash tests/verify_multistage.sh
```

종료 코드 `0`이면 PASS다. 이 스크립트는 Git Bash / macOS / Linux bash 전용이다.
Windows PowerShell에서는 실행할 수 없다.

> 검증 스크립트(`tests/verify_multistage.sh`)는 test-writer가 별도 작성 예정이다.
> 스크립트가 추가되면 위 명령을 그대로 사용하면 된다.

---

## 트러블슈팅

### 포트 8000 또는 8001이 이미 사용 중이다

`.env` 파일에서 포트를 변경한다.

```
PORT=8002
PORT_SINGLE=8003
```

변경 후 다시 `docker compose up -d`를 실행하고 새 포트로 접근한다.

```bash
curl http://localhost:8002/
```

### 빌드 중 `pip install` 단계에서 오류가 난다

네트워크 문제일 가능성이 높다. 아래를 확인한다.

1. 인터넷 연결을 확인한다.
2. 기업 내부망의 PyPI 미러를 사용 중이라면 `requirements.txt` 경로를 확인한다.
3. `docker compose build --no-cache`로 캐시 없이 재빌드한다.

### `docker images | grep multistage`에 이미지가 보이지 않는다

`docker compose build`가 완료됐는지 확인한다. 빌드 중 오류가 있으면 이미지가 생성되지 않는다.

```bash
docker compose build
```

빌드 로그에서 `FINISHED` 또는 `Successfully built`가 보이면 정상이다.

### Windows에서 `cp` 명령이 동작하지 않는다

Git Bash 또는 WSL2를 사용한다. PowerShell에서는 아래 명령을 사용한다.

```powershell
Copy-Item .env.example .env
```

### curl 출력 형식이 다르다

Windows PowerShell의 `curl`은 `Invoke-WebRequest`의 별칭이라 출력 형식이 다르다.
`curl.exe`를 명시하거나 Git Bash를 사용한다.

```powershell
curl.exe -s http://localhost:8000/
```
