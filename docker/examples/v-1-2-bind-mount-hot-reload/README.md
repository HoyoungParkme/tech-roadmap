# 예제 V-1-2: FastAPI bind mount 핫 리로드

## 목적

bind mount(바인드 마운트)를 사용해 호스트의 소스 파일을 컨테이너 안에 직결한다.
`app/main.py`를 수정하면 컨테이너를 재빌드하거나 재시작하지 않아도 변경 사항이 즉시 반영되는 개발 편의 흐름을 체험하는 것이 핵심 목표다.

bind mount는 "창고 직결"과 같다. 컨테이너 밖(호스트)에서 파일을 수정하면 컨테이너 안에서도 동시에 바뀐다.
uvicorn의 `--reload` 옵션이 파일 변경을 감지해 서버를 자동으로 재시작한다.

---

## 사전 요건

| 항목 | 버전 | 확인 명령 |
|:--|:--|:--|
| Docker Engine | 24 이상 | `docker --version` |
| Docker Compose v2 | 2.20 이상 | `docker compose version` |
| curl | — | 호스트에서 응답 확인용. Git Bash / macOS / Linux 기본 내장 |

> `docker-compose`(하이픈)가 아닌 `docker compose`(스페이스)를 사용한다. 하이픈 형식은 v1 레거시다.

---

## 파일 구성

```
v-1-2-bind-mount-hot-reload/
├── Dockerfile              # python:3.11-slim + uvicorn + fastapi
├── docker-compose.yml      # ./app → /app bind mount + --reload 옵션
├── requirements.txt        # fastapi, uvicorn[standard]
├── app/
│   └── main.py             # FastAPI 앱 (VERSION 상수 포함)
└── tests/
    └── verify_hot_reload.sh   # 자동 검증 스크립트 (Git Bash 전용)
```

---

## 실행 단계

### 1단계: 이미지 빌드 및 컨테이너 시작

```bash
docker compose up -d
```

`web-1 Started` 가 출력된다. 처음 실행하면 이미지를 빌드하는 시간이 걸린다.
uvicorn이 `Uvicorn running on http://0.0.0.0:8000` 로그를 출력하면 준비 완료다.

### 2단계: 초기 버전 확인

```bash
curl -s localhost:8000/version
```

아래 응답이 반환된다.

```json
{"version":"v1"}
```

### 3단계: 소스 코드 수정

호스트에서 `app/main.py`의 `VERSION = "v1"` 을 `VERSION = "v2"` 로 변경한다.

텍스트 에디터로 직접 수정해도 되고, 아래 명령으로 한 번에 바꿀 수도 있다.

```bash
sed -i 's/VERSION = "v1"/VERSION = "v2"/' app/main.py
```

> `sed` 명령은 Git Bash / macOS / Linux 전용이다. Windows PowerShell에서는 아래를 사용한다.
> ```powershell
> (Get-Content app\main.py) -replace 'VERSION = "v1"', 'VERSION = "v2"' | Set-Content app\main.py
> ```

### 4단계: uvicorn 재시작 대기 (1~3초)

`docker compose logs -f` 로 로그를 확인하면 아래와 같이 출력된다.

```
web-1  | WARNING:  StatReload detected file change in 'main.py'. Reloading...
web-1  | INFO:     Application startup complete.
```

별도로 아무것도 하지 않아도 된다. uvicorn이 파일 변경을 감지하여 자동으로 재시작한다.

### 5단계: 변경된 버전 확인 (핵심)

```bash
curl -s localhost:8000/version
```

아래 응답이 반환된다. 컨테이너를 재시작하지 않았지만 버전이 바뀐 것을 확인할 수 있다.

```json
{"version":"v2"}
```

### 6단계: 원복

```bash
sed -i 's/VERSION = "v2"/VERSION = "v1"/' app/main.py
```

> PowerShell:
> ```powershell
> (Get-Content app\main.py) -replace 'VERSION = "v2"', 'VERSION = "v1"' | Set-Content app\main.py
> ```

### 7단계: 컨테이너 종료

```bash
docker compose down
```

`web-1 Removed` 가 출력된다.

---

## 렌즈로 이해하기

> **[입문 렌즈 ★☆☆]**
> - **비유**: bind mount는 창고 직결과 같다. 컨테이너 안에서 바로 집(호스트) 창고를 쓰게 해준다. 창고의 물건을 바꾸면 컨테이너 안에서도 동시에 바뀐다. 서로 같은 공간을 보고 있기 때문이다.
> - **체감 예시**: 구글 독스(Google Docs)에서 내가 타이핑하면 상대방 화면에도 실시간으로 반영되는 것과 비슷하다. 호스트와 컨테이너가 같은 파일을 동시에 보고 있다.
> - **주의**: bind mount는 개발 편의용이다. 프로덕션 이미지에 bind mount를 붙이면 호스트 파일이 없는 환경에서 앱이 실행되지 않는다. 프로덕션에서는 `COPY`로 파일을 이미지 안에 넣는다.

> **[주니어 렌즈 ★★☆]**
> - **명령**: `docker compose up --build` — 소스는 이미 bind mount로 반영되지만, `requirements.txt`가 변경된 경우에는 이 명령으로 이미지를 다시 빌드해야 한다.
> - **흔한 함정**: bind mount 경로가 컨테이너 안의 `WORKDIR`과 겹치면 이미지에 `COPY`한 파일이 호스트 마운트에 덮어씌워진다. 이 예제에서는 `./app:/app` 으로 설정되어 있어, 이미지 빌드 시 `COPY`한 내용이 마운트로 완전히 대체된다. `requirements.txt`가 `/app` 안에 있으면 사라지므로, 이 예제는 `requirements.txt`를 빌드 단계(`COPY requirements.txt .`)에서만 사용하고 런타임에는 참조하지 않는다.
> - **체크리스트**:
>   - [ ] `docker compose up -d` 전에 이미지가 빌드되었다 (최초 실행 또는 `--build` 사용)
>   - [ ] `app/main.py` 수정 후 uvicorn 로그에 `Reloading...` 이 출력된다
>   - [ ] `curl -s localhost:8000/version` 응답이 수정한 버전으로 바뀐다

> **[실무자 렌즈 ★★★]**
> - **프로덕션 고려**: `--reload` 옵션은 파일 시스템을 주기적으로 폴링(polling)한다. 프로덕션에서는 성능 저하와 불필요한 재시작 위험이 있으므로 제거한다. 프로덕션 Dockerfile은 `--reload` 없는 `CMD`를 사용하고, 개발 전용 설정은 `docker-compose.override.yml`로 분리하는 것이 모범 사례다.
> - **대안 기술**: bind mount 대신 `docker cp`나 `rsync` 기반 워크플로우도 있지만, 현재 시점에서는 bind mount + `--reload` 조합이 가장 단순하다. Kubernetes 환경에서는 skaffold나 Tilt가 동일 역할을 한다.
> - **관측**: `docker compose logs -f web` 으로 uvicorn 재시작 로그를 실시간으로 확인할 수 있다. 재시작이 너무 자주 발생한다면 파일 저장 이벤트가 중복 발생하는 에디터 설정(자동 저장 간격)을 확인한다.

---

## 자동 검증

위 단계를 자동으로 실행하고 PASS/FAIL을 확인하려면:

```bash
bash tests/verify_hot_reload.sh
```

종료 코드 `0`이면 PASS다.

> **주의**: 이 스크립트는 Git Bash 전용이다. macOS / Linux bash에서도 실행 가능하다.
> Windows PowerShell / CMD에서는 실행할 수 없다. Windows 사용자는 Git Bash를 사용한다.
> Git Bash 설치: https://git-scm.com/downloads

---

## 트러블슈팅

### 포트 8000이 이미 사용 중이다

`docker-compose.yml`의 `ports:` 항목을 대체 포트로 변경한다.

```yaml
ports:
  - "8001:8000"
```

변경 후 curl 접속 시 변경한 포트를 사용한다.

```bash
curl -s localhost:8001/version
```

### 코드를 수정했는데 응답이 바뀌지 않는다

아래 순서로 확인한다.

1. `docker compose logs web` 으로 `Reloading...` 이 출력되는지 확인한다.
   - 출력이 없으면 uvicorn이 파일 변경을 감지하지 못한 것이다.
2. `docker compose ps` 로 컨테이너가 실행 중인지 확인한다.
3. `docker compose restart web` 으로 수동 재시작한다.

uvicorn이 `--reload` 옵션 없이 실행 중이라면 Dockerfile의 `CMD`를 확인한다. 이 예제에서는 `docker-compose.yml`의 `command:` 항목에 `--reload`가 지정되어 있다.

### Windows에서 bind mount가 동작하지 않는다

Docker Desktop의 Settings → Resources → File sharing 에서 프로젝트 드라이브(예: `C:\`)가 공유 목록에 있는지 확인한다.

WSL2 백엔드를 사용하는 경우, 프로젝트를 WSL2 파일 시스템(`/home/...`) 안으로 이동하면 파일 변경 감지 성능이 크게 향상된다. Windows 드라이브(`/mnt/c/...`) 경로는 inotify 이벤트가 느리거나 작동하지 않을 수 있다.

### `sed` 명령이 동작하지 않는다 (Windows)

`sed` 명령은 Git Bash / macOS / Linux 전용이다. Windows PowerShell에서는 아래를 사용한다.

```powershell
(Get-Content app\main.py) -replace 'VERSION = "v1"', 'VERSION = "v2"' | Set-Content app\main.py
```

### `curl` 출력 형식이 다르다 (Windows PowerShell)

Windows PowerShell의 `curl`은 `Invoke-WebRequest`의 별칭이라 출력 형식이 다르다.
`curl.exe`를 명시하거나 `Invoke-RestMethod`를 사용한다.

```powershell
curl.exe -s localhost:8000/version
# 또는
Invoke-RestMethod http://localhost:8000/version
```
