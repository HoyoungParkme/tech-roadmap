### III-1-3. docker ps / docker images — 상태 확인

- **난이도**: ★★☆
- **선수 지식**: III-1-2
- **학습 목표**: 이 Section을 마치면 실행 중인 컨테이너와 로컬 이미지 목록을 확인하고 정리할 수 있다.
- **설명**:
  `docker ps`는 현재 실행 중인 컨테이너 목록을 보여준다. 종료된 컨테이너까지 보려면 `docker ps -a`를 쓴다. `docker images`는 로컬에 저장된 이미지 목록을 보여준다. 불필요한 컨테이너는 `docker rm <id>`, 이미지는 `docker rmi <id>`로 삭제한다. 디스크를 한 번에 정리하고 싶다면 `docker system prune`을 사용한다(사용하지 않는 컨테이너·이미지·네트워크를 모두 삭제).
- **핵심 키워드**: `docker ps`, `docker images`, `docker rm`, `docker rmi`, `docker system prune`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-1-4

#### 본문

##### 작업관리자 비유 — 무엇이 실행 중인가

Windows를 쓰다가 컴퓨터가 느려지면 `Ctrl + Alt + Delete`로 작업관리자를 연다. 어떤 프로그램이 CPU를 많이 쓰는지, 메모리는 얼마나 차지하는지 한눈에 보인다. Docker에도 같은 역할을 하는 명령이 있다. `docker ps`는 "지금 실행 중인 컨테이너는 무엇인가"를 보여주는 Docker의 작업관리자다.

---

##### docker ps — 실행 중인 컨테이너 확인

먼저 nginx 웹 서버를 백그라운드로 실행해 보자.

```bash
docker run -d --name my-nginx -p 8080:80 nginx
```

이제 `docker ps`를 실행하면 다음과 같이 출력된다.

```
CONTAINER ID   IMAGE   COMMAND                  CREATED         STATUS         PORTS                  NAMES
a3b7c9d1f2e4   nginx   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds   0.0.0.0:8080->80/tcp   my-nginx
```

각 컬럼의 의미를 알아두면 유용하다.

| 컬럼 | 의미 |
|:--|:--|
| CONTAINER ID | 컨테이너의 고유 ID (앞 4~12자만 써도 인식) |
| IMAGE | 이 컨테이너를 만든 이미지 이름 |
| COMMAND | 컨테이너 시작 시 실행된 명령 |
| CREATED | 컨테이너가 만들어진 시간 |
| STATUS | 현재 상태 (Up = 실행 중, Exited = 종료) |
| PORTS | 포트 연결 정보 (호스트:컨테이너) |
| NAMES | 컨테이너 이름 |

---

##### docker ps -a — 종료된 컨테이너도 보기

`docker ps`는 실행 중인 컨테이너만 보여준다. 종료된 컨테이너까지 모두 보려면 `-a`(all) 옵션을 추가한다.

```bash
docker ps -a
```

```
CONTAINER ID   IMAGE         COMMAND    CREATED         STATUS                     NAMES
a3b7c9d1f2e4   nginx         "..."      2 minutes ago   Up 2 minutes               my-nginx
b4c8e2f1a3d5   hello-world   "/hello"   5 minutes ago   Exited (0) 5 minutes ago   eager_darwin
c5d9f3g2b4e6   ubuntu        "bash"     8 minutes ago   Exited (0) 7 minutes ago   sad_turing
```

`STATUS` 컬럼에서 `Exited (0)`은 정상 종료, `Exited (1)`이나 다른 숫자는 에러로 종료된 것이다.

---

##### docker images — 로컬 이미지 목록

`docker images`는 로컬 컴퓨터에 저장된 이미지 목록을 보여준다.

```bash
docker images
```

```
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
nginx         latest    a6bd71f48f68   2 weeks ago    187MB
ubuntu        latest    3565a89d9e81   4 weeks ago    77.9MB
hello-world   latest    d2c94e258dcb   14 months ago  13.3kB
```

| 컬럼 | 의미 |
|:--|:--|
| REPOSITORY | 이미지 이름 |
| TAG | 버전 태그 (latest = 최신, 생략 시 latest) |
| IMAGE ID | 이미지 고유 ID |
| CREATED | 이미지가 빌드된 시간 |
| SIZE | 이미지 크기 |

---

##### 정리 명령 — rm, rmi, prune

컨테이너와 이미지가 쌓이면 디스크 공간을 차지한다. 필요 없는 것은 정리해야 한다.

```bash
# 특정 컨테이너 삭제 (ID 또는 이름)
docker rm my-nginx          # 실행 중인 컨테이너는 삭제 안 됨
docker rm -f my-nginx       # -f: 실행 중이어도 강제 삭제

# 종료된 컨테이너 모두 삭제
docker rm $(docker ps -aq)

# 특정 이미지 삭제
docker rmi nginx
docker rmi nginx:latest     # 태그 명시

# 사용하지 않는 것 한 번에 정리 (컨테이너 + 이미지 + 네트워크)
docker system prune

# 볼륨까지 포함해서 정리
docker system prune -a --volumes
```

> **주의**: `docker system prune -a`는 실행 중이지 않은 이미지를 모두 삭제한다. 다시 필요하면 다시 pull해야 한다.

---

##### docker system df — 디스크 사용량 확인

정리 전에 얼마나 차지하고 있는지 먼저 확인하고 싶다면 `docker system df`를 쓴다.

```bash
docker system df
```

```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          4         2         1.2GB     800MB (67%)
Containers      6         1         0B        0B
Local Volumes   2         1         245MB     120MB (49%)
Build Cache     8         0         180MB     180MB (100%)
```

`RECLAIMABLE` 컬럼은 정리 시 회수 가능한 용량이다. 빌드 캐시가 100% 회수 가능하다는 것은 지금 당장 정리해도 아무런 문제가 없다는 뜻이다.

---

> **[입문 렌즈 ★☆☆]**
> - **비유**: `docker ps`는 컴퓨터의 작업관리자다. 어떤 컨테이너가 실행 중인지, 어떤 포트를 쓰는지 한눈에 볼 수 있다. `docker images`는 앱스토어의 "내 앱 목록"이다. 내려받은 이미지가 모두 여기에 있다.
> - **막혔을 때**: `docker ps`에 아무것도 안 나오면 실행 중인 컨테이너가 없는 것이다. `docker ps -a`를 치면 종료된 것들도 보인다.
> - **핵심 질문**: "`docker ps`와 `docker ps -a`의 차이는?" — `ps`는 실행 중만, `-a`는 종료된 것도 포함해서 보여준다.

> **[주니어 렌즈 ★★☆]**
> - **컨테이너 ID 단축**: CONTAINER ID는 12자리지만 앞 3~4자리만 입력해도 Docker가 인식한다. `docker rm a3b7`처럼 쓸 수 있다. 단, 앞 자리가 겹치는 컨테이너가 있으면 에러가 난다.
> - **docker images 출력 읽기**: `hello-world` 이미지가 13.3kB인 것을 보면, Docker 이미지가 반드시 클 필요는 없다는 것을 알 수 있다. 반면 머신러닝 이미지는 수 GB가 되기도 한다. SIZE를 보고 큰 이미지는 경량화 여부를 검토한다.
> - **정리 전 확인**: `docker system df`를 먼저 실행해서 회수 가능한 공간을 확인하는 습관을 들인다. `docker system prune -a`는 강력한 명령이라 실수로 필요한 이미지를 지울 수 있다.

> **[실무자 렌즈 ★★★]**
> - **docker system df -v**: `-v`(verbose) 옵션을 추가하면 각 이미지/컨테이너/볼륨별 상세 크기가 나온다. 어떤 이미지가 디스크를 많이 차지하는지 파악할 수 있다.
> - **CI 환경 정리**: CI 서버에서 빌드를 반복하다 보면 이미지가 빠르게 쌓인다. 파이프라인 마지막 단계에 `docker system prune -f` 또는 `docker image prune -f`를 추가해서 자동 정리한다.
> - **--filter 옵션**: `docker ps --filter status=exited`처럼 상태로 필터링하거나, `docker images --filter dangling=true`로 태그 없는 이미지만 추려서 정리할 수 있다. 스크립트 자동화에 유용하다.

##### 체크포인트

- [ ] `docker ps`와 `docker ps -a`의 출력 차이를 설명할 수 있다
- [ ] `docker images` 출력에서 REPOSITORY, TAG, SIZE 컬럼의 의미를 설명할 수 있다
- [ ] `docker rm`과 `docker rmi`의 차이를 설명할 수 있다
- [ ] `docker system prune`이 무엇을 삭제하는지 설명할 수 있다

