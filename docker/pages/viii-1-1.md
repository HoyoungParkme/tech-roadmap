### VIII-1-1. docker run 핵심 옵션 총정리

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 `docker run`의 주요 옵션을 상황에 맞게 조합해서 컨테이너를 실행할 수 있다.
- **설명**:
  `docker run`은 이미지를 내려받고 컨테이너를 생성해서 바로 실행하는 한 방 명령이다. 옵션 하나하나가 컨테이너의 동작 방식을 결정한다. `-d`는 백그라운드 실행, `-it`는 터미널 연결, `-p`는 포트 개방, `-v`는 데이터 유지. 처음에는 개별 옵션을 외우기보다 "어떤 상황에 어떤 옵션이 필요한가"를 익히는 것이 더 빠르다.
- **핵심 키워드**: `-d`, `-it`, `-p`, `-v`, `--name`, `--rm`, `-e`, `--env-file`, `--network`, `--restart`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: III-1-2 (Hello World 컨테이너)
- **다음 섹션**: VIII-1-2

#### 본문

##### 옵션 없이 실행하면 어떻게 되나

`docker run nginx:alpine`을 입력하면 nginx가 포그라운드로 실행된다. 터미널이 블로킹되고, Ctrl+C를 누르면 컨테이너가 중지된다. 포트도 열리지 않아서 브라우저에서 접속할 수 없다. 이것이 옵션의 필요성을 가장 잘 보여주는 출발점이다.

```bash
# 포그라운드 실행 — 터미널이 블로킹됨
docker run nginx:alpine
```

##### -d: 백그라운드(데몬) 실행

서버처럼 계속 실행되어야 하는 컨테이너에 사용한다. 실행 즉시 컨테이너 ID를 출력하고 프롬프트로 돌아온다.

```bash
# 백그라운드로 실행
docker run -d nginx:alpine

# 실행 확인
docker ps
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: 음악을 틀어놓고 다른 일을 하는 것과 같다. `-d` 없이 실행하면 음악이 끝날 때까지 그 자리에 서 있어야 한다. `-d`를 붙이면 음악을 틀어두고 다른 일을 할 수 있다.
> - **체감 예시**: nginx 웹 서버를 시작했다. `-d`를 붙였더니 터미널이 바로 돌아와서 다른 명령을 계속 입력할 수 있다.
> - **주의**: `-d`로 실행하면 로그가 화면에 표시되지 않는다. 문제가 생기면 `docker logs <컨테이너ID>`로 확인한다.

##### -it: 인터랙티브 터미널

컨테이너 내부에서 직접 명령을 실행해야 할 때 사용한다. `-i`는 표준 입력(stdin)을 열어두고, `-t`는 가상 터미널(pseudo-TTY)을 할당한다. 보통 셸에 접속할 때 두 옵션을 함께 쓴다.

```bash
# 컨테이너 내부 셸에 접속
docker run -it alpine sh

# 컨테이너 안에서 실행
/# ls /
/# cat /etc/os-release
/# exit
```

##### -p: 포트 매핑

호스트(내 컴퓨터)의 포트를 컨테이너의 포트에 연결한다. 형식은 `-p <호스트포트>:<컨테이너포트>`이다.

```bash
# 호스트 8080 → 컨테이너 80
docker run -d -p 8080:80 nginx:alpine

# 브라우저에서 http://localhost:8080 접속 가능
curl http://localhost:8080
```

포트를 열지 않으면 호스트에서 컨테이너 서비스에 접근할 수 없다. `docker ps`에서 `PORTS` 컬럼에 `0.0.0.0:8080->80/tcp`가 보이면 정상이다.

##### -v: 볼륨 마운트

컨테이너가 삭제되어도 데이터를 유지하거나, 호스트의 파일을 컨테이너에서 사용할 때 쓴다.

```bash
# 명명된 볼륨 (Docker가 관리)
docker run -d -v mydata:/data postgres:16-alpine

# 바인드 마운트 (호스트 경로 직접 연결)
docker run -d -v $(pwd)/html:/usr/share/nginx/html nginx:alpine
```

##### --name: 컨테이너 이름 지정

이름을 지정하지 않으면 Docker가 랜덤한 이름을 붙인다(`quirky_tesla` 같은). 이름을 지정하면 ID 대신 이름으로 명령을 실행할 수 있다.

```bash
docker run -d --name my-nginx -p 8080:80 nginx:alpine

# 이름으로 중지/재시작
docker stop my-nginx
docker start my-nginx
docker logs my-nginx
```

##### --rm: 컨테이너 종료 시 자동 삭제

컨테이너가 종료되면 자동으로 삭제된다. 임시 작업이나 테스트할 때 유용하다. `-d`와 함께 쓰면 백그라운드로 실행하다가 종료 시 자동 삭제된다.

```bash
# 셸 접속 후 exit 시 컨테이너 자동 삭제
docker run --rm -it alpine sh

# 백그라운드 + 종료 시 자동 삭제
docker run -d --rm --name temp-nginx nginx:alpine
```

##### -e / --env-file: 환경변수 주입

컨테이너 안에서 읽을 환경변수를 설정한다. 비밀번호, API 키 같은 값을 Dockerfile에 넣지 않고 실행 시점에 주입하는 방식이다.

```bash
# 단일 환경변수
docker run -d \
  -e POSTGRES_PASSWORD=mysecret \
  -e POSTGRES_DB=myapp \
  postgres:16-alpine

# .env 파일에서 일괄 주입
docker run -d --env-file .env postgres:16-alpine
```

`.env` 파일 형식:
```
POSTGRES_PASSWORD=mysecret
POSTGRES_DB=myapp
POSTGRES_USER=appuser
```

##### --network: 네트워크 연결

컨테이너를 특정 Docker 네트워크에 연결한다. 같은 네트워크에 있는 컨테이너끼리는 컨테이너 이름으로 통신할 수 있다.

```bash
# 네트워크 생성
docker network create mynet

# 같은 네트워크에 컨테이너 연결
docker run -d --name db --network mynet postgres:16-alpine
docker run -d --name web --network mynet nginx:alpine

# web에서 db로 ping
docker exec web ping db
```

##### --restart: 재시작 정책

컨테이너가 종료되었을 때 자동으로 재시작할지 결정한다.

| 값 | 동작 |
|:--|:--|
| `no` (기본값) | 재시작 안 함 |
| `always` | 항상 재시작 (Docker 재시작 시도 포함) |
| `unless-stopped` | 수동으로 중지하지 않은 경우 항상 재시작 |
| `on-failure` | 비정상 종료(exit code ≠ 0)일 때만 재시작 |

```bash
# 서버처럼 항상 켜져 있어야 하는 컨테이너
docker run -d --restart unless-stopped --name web nginx:alpine

# 에러 시에만 재시작 (최대 3회)
docker run -d --restart on-failure:3 myapp:latest
```

> **[주니어 렌즈 ★★☆]**
> - **옵션 조합 패턴**: 실무에서 자주 쓰는 조합은 정해져 있다. 웹 서버: `-d --name --restart unless-stopped -p`. DB: `-d --name -e -v`. 디버깅: `--rm -it`. 임시 작업: `--rm`.
> - **--rm과 --restart 충돌**: `--rm`과 `--restart always`를 동시에 쓰면 Docker가 에러를 낸다. `--rm`은 "종료 시 삭제", `--restart`는 "종료 시 재시작"이므로 서로 모순이다.
> - **환경변수 우선순위**: `-e`로 직접 지정한 값이 `--env-file`보다 우선한다. 같은 키가 있으면 `-e` 값을 쓴다.

> **[실무자 렌즈 ★★★]**
> - **docker run vs Compose**: 프로덕션에서는 `docker run`을 직접 쓰는 경우가 거의 없다. Compose 파일에 옵션을 선언적으로 정의하고 `docker compose up -d`를 실행한다. `docker run`은 빠른 테스트, 일회성 작업, CI 스크립트에서 주로 쓴다.
> - **--restart와 오케스트레이터**: Kubernetes, ECS를 쓰면 재시작 정책은 오케스트레이터가 관리한다. 단독 서버에서 Docker만 쓸 때 `--restart unless-stopped`가 유용하다.
> - **환경변수와 시크릿 관리**: `-e`로 패스워드를 직접 주입하면 `docker inspect`나 `ps aux`에서 노출될 수 있다. 프로덕션에서는 Docker Secrets, AWS SSM Parameter Store, HashiCorp Vault 같은 시크릿 관리 시스템을 사용한다.

##### 옵션 조합 비교 표

| 시나리오 | 명령 예시 |
|:--|:--|
| nginx 웹 서버 (프로덕션) | `docker run -d --name web -p 80:80 --restart unless-stopped nginx:alpine` |
| postgres DB (개발) | `docker run -d --name db -e POSTGRES_PASSWORD=dev -v pgdata:/var/lib/postgresql/data postgres:16-alpine` |
| 컨테이너 내부 탐색 | `docker run --rm -it alpine sh` |
| 일회성 명령 실행 | `docker run --rm alpine date` |
| 개발 서버 (핫 리로드) | `docker run -d --name dev -p 3000:3000 -v $(pwd):/app myapp:dev` |

##### 체크포인트

- [ ] `-d`와 `-it`의 차이를 설명하고, 각각 어떤 상황에 쓰는지 예시를 들 수 있다
- [ ] `-p 8080:80`에서 앞 숫자(8080)가 호스트 포트이고 뒤 숫자(80)가 컨테이너 포트임을 설명할 수 있다
- [ ] `--rm`과 `--restart always`를 동시에 쓰면 에러가 나는 이유를 설명할 수 있다
- [ ] `-e`와 `--env-file`의 차이와 우선순위를 설명할 수 있다
- [ ] nginx를 백그라운드로 실행하고, 포트를 열고, 이름을 지정하는 명령을 옵션 순서까지 맞게 작성할 수 있다

---

