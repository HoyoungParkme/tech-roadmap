### III-1-4. 처음 만나는 에러

- **난이도**: ★★☆
- **선수 지식**: III-1-3
- **학습 목표**: 이 Section을 마치면 Docker 초보자가 흔히 만나는 에러 3가지를 스스로 해결할 수 있다.
- **설명**:
  가장 흔한 에러 첫 번째, `Cannot connect to the Docker daemon` — Docker Desktop이 실행 중이지 않은 것이다. 트레이 아이콘에서 Docker Desktop을 시작하면 해결된다. 두 번째, `port is already allocated` — 호스트에서 같은 포트를 이미 쓰고 있다. 다른 포트로 매핑(`-p 8080:8000`)하거나 기존 프로세스를 종료한다. 세 번째, `No space left on device` — 이미지·컨테이너가 디스크를 가득 채운 것이다. `docker system prune`으로 정리한다.
- **핵심 키워드**: Docker daemon, 포트 충돌, 디스크 정리, `docker system prune`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: IV-1-1

#### 본문

##### 에러는 기계가 보내는 메시지다

처음 Docker를 쓸 때 에러가 나면 당황스럽다. 빨간 글씨가 쏟아지면 뭔가 크게 잘못된 것 같은 느낌이 든다. 하지만 에러 메시지는 "무엇이 문제인지"를 기계가 영어로 설명해 주는 것이다. 겁내지 말고 메시지를 읽으면, 대부분 해결 방법이 메시지 안에 있거나 메시지를 검색하면 바로 나온다.

이 섹션에서는 Docker 입문자가 가장 자주 만나는 에러 3가지와 해결법을 정리한다.

---

##### 에러 1: Cannot connect to the Docker daemon

```
docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
Is the docker daemon running?
```

**원인**: Docker 데몬(백그라운드 프로세스)이 실행되지 않은 상태에서 `docker` 명령을 입력했다.

이것은 자동차 시동을 걸지 않고 악셀을 밟은 것과 같다. Docker Desktop이 실행되지 않으면 `docker` 명령이 아무것도 할 수 없다.

**해결 방법**

| 운영체제 | 해결 방법 |
|:--|:--|
| Windows / Mac | 시스템 트레이에서 Docker Desktop 아이콘을 더블클릭해서 시작한다 |
| Linux | `sudo systemctl start docker` 또는 `sudo service docker start` |

확인 방법:

```bash
docker version
# 정상이면 Client: / Server: 두 섹션이 출력됨
```

---

##### 에러 2: port is already allocated

```
Error response from daemon: driver failed programming external connectivity on endpoint my-app:
Bind for 0.0.0.0:8080 failed: port is already allocated
```

**원인**: 호스트(내 컴퓨터)의 8080 포트를 이미 다른 프로세스가 사용하고 있다. Docker가 같은 포트를 사용하려고 하니 충돌이 생긴다.

**해결 방법 1: 다른 포트로 변경**

```bash
# 8080 대신 8081 포트 사용
docker run -d -p 8081:80 nginx
```

**해결 방법 2: 기존 프로세스 확인 후 종료**

```bash
# Windows PowerShell — 8080 포트 사용 프로세스 확인
netstat -ano | findstr :8080

# Mac / Linux
lsof -i :8080
# 또는
ss -tlnp | grep 8080
```

출력된 PID(프로세스 ID)를 확인하고, 해당 프로세스가 무엇인지 확인한 뒤 종료한다. 혹시 이미 실행 중인 Docker 컨테이너가 같은 포트를 쓰고 있을 수도 있다.

```bash
# 실행 중인 컨테이너 중 8080 포트를 쓰는 것 확인
docker ps | grep 8080
```

---

##### 에러 3: No such image / pull access denied

```
Unable to find image 'myngix:latest' locally
docker: Error response from daemon: pull access denied for myngix, repository does not exist or may require 'docker login'
```

**원인**: 이미지 이름을 잘못 입력했거나, 존재하지 않는 이미지를 pull하려고 했다. 오타가 가장 흔한 원인이다. 위 예시에서 `myngix`는 `nginx`의 오타다.

**해결 방법**

1. 이미지 이름의 오타를 확인한다 (`nginx`인지 `ngnix`인지)
2. [hub.docker.com](https://hub.docker.com) 에서 이미지 이름을 검색해서 정확한 이름을 확인한다
3. 비공개 저장소(사설 레지스트리)에 있는 이미지라면 `docker login` 후 다시 시도한다

```bash
# Docker Hub 로그인
docker login

# 이미지 이름 정확히 입력
docker pull nginx        # 올바른 이름
docker run -d nginx
```

---

##### 에러 4: No space left on device

```
write /var/lib/docker/tmp/...: no space left on device
```

**원인**: 디스크가 꽉 찼다. Docker는 이미지, 컨테이너, 볼륨, 빌드 캐시를 저장하는데, 이것들이 쌓이면 디스크를 많이 차지한다.

**해결 방법**

```bash
# 현재 Docker가 차지하는 공간 확인
docker system df

# 사용하지 않는 컨테이너, 이미지, 네트워크 정리
docker system prune

# 빌드 캐시까지 포함해서 정리 (더 공격적)
docker system prune -a

# 볼륨까지 포함 (주의: 데이터 손실 가능)
docker system prune -a --volumes
```

> **주의**: `--volumes` 옵션은 볼륨에 저장된 데이터도 삭제한다. 데이터베이스 볼륨이 있다면 삭제 전 백업을 확인한다.

---

##### 에러 메시지 읽는 법

에러가 길게 나와도 겁내지 않아도 된다. 아래 순서로 읽으면 대부분 해결된다.

```
1. 마지막 줄을 먼저 읽는다 — 실제 에러 원인이 대부분 마지막에 있다
2. "Error:", "failed:", "denied:" 키워드를 찾는다
3. 에러 메시지 그대로 복사해서 검색한다 (StackOverflow, GitHub Issues)
```

모르는 에러가 나왔다고 해서 처음부터 다시 읽거나 모든 줄을 이해하려고 하지 않아도 된다. 핵심 키워드만 검색하면 이미 같은 문제를 겪은 사람의 해결책을 찾을 수 있다.

---

> **[입문 렌즈 ★☆☆]**
> - **비유**: 에러 메시지는 자동차 계기판의 경고등이다. 경고등이 켜진다고 자동차가 폭발하지는 않는다. 어떤 경고등인지 확인하고 설명서(검색)를 찾아보면 된다.
> - **막혔을 때**: 에러 메시지 전체를 복사해서 ChatGPT나 Google에 붙여 넣으면 해결책이 나온다. 한국어로 "docker [에러 내용]"으로 검색해도 된다.
> - **핵심 질문**: "지금 만난 에러 메시지에서 핵심 키워드가 무엇인가?" — 그 키워드로 검색한다.

> **[주니어 렌즈 ★★☆]**
> - **포트 충돌 빠른 확인**: `docker ps`를 먼저 실행해서 이미 같은 포트를 쓰는 컨테이너가 있는지 확인한다. 이미 실행 중인 컨테이너가 원인인 경우가 많다.
> - **permission denied**: Linux에서 `docker` 그룹에 사용자를 추가하지 않은 상태에서 `sudo` 없이 `docker` 명령을 치면 `permission denied`가 난다. III-1-1 섹션의 Linux 후처리(그룹 추가)를 다시 확인한다.
> - **image not found**: Docker Hub에서 공식 이미지는 `nginx`, `ubuntu`, `python`처럼 한 단어다. 개인/조직 이미지는 `username/imagename` 형식이다. 이름 규칙을 확인한다.

> **[실무자 렌즈 ★★★]**
> - **에러 기반 학습 전략**: 에러가 날 때마다 원인과 해결책을 개인 노트에 기록한다. 같은 에러를 두 번 검색하지 않게 된다.
> - **docker logs로 디버깅**: 컨테이너가 시작하자마자 종료되는 경우(`Exited (1)`) `docker logs <container_id>`로 컨테이너 내부 로그를 확인한다. 대부분 로그 마지막 줄에 원인이 있다.
> - **docker inspect로 상세 정보 확인**: `docker inspect <container_id>`는 컨테이너의 네트워크 설정, 마운트, 환경변수, 종료 코드 등 상세 정보를 JSON으로 출력한다. `--format` 옵션으로 원하는 필드만 추출할 수 있다.

```bash
# 마지막 종료 코드 확인
docker inspect --format='{{.State.ExitCode}}' <container_id>

# 컨테이너 로그 실시간 보기
docker logs -f <container_id>

# 마지막 50줄만 보기
docker logs --tail 50 <container_id>
```

##### 체크포인트

- [ ] `Cannot connect to the Docker daemon` 에러의 원인과 해결법을 설명할 수 있다
- [ ] `port is already allocated` 에러가 났을 때 2가지 해결 방법을 말할 수 있다
- [ ] 이미지 이름 오타로 생기는 `pull access denied` 에러를 구분할 수 있다
- [ ] 에러 메시지에서 핵심 키워드를 찾아 검색하는 방법을 안다
- [ ] `docker logs <container_id>`로 컨테이너 내부 로그를 확인할 수 있다

---

