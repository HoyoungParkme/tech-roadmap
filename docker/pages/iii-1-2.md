### III-1-2. Hello World 컨테이너

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: 이 Section을 마치면 `docker run hello-world` 동작 원리를 단계별로 설명할 수 있다.
- **설명**:
  `docker run hello-world`를 실행하면 Docker는 다음 순서로 동작한다. 1) 로컬에 `hello-world` 이미지가 있는지 확인한다. 2) 없으면 Docker Hub에서 자동으로 pull한다. 3) 이미지로 컨테이너를 생성·실행한다. 4) 컨테이너가 메시지를 출력하고 종료된다. 이 짧은 과정에서 이미지 pull, 컨테이너 생성, 실행, 종료의 전체 라이프사이클이 한 번에 일어난다.
- **핵심 키워드**: `docker run`, 이미지 pull, 컨테이너 라이프사이클, `hello-world`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-1-3

#### 본문

##### Hello World — 프로그래머의 첫 인사

프로그래밍을 처음 배울 때 거의 모든 교재가 "Hello, World!"를 화면에 출력하는 것부터 시작한다. Docker도 마찬가지다. `docker run hello-world`는 Docker가 제대로 설치되었는지 확인하는 동시에, Docker의 핵심 동작 원리를 한 번에 보여준다.

```bash
docker run hello-world
```

명령을 실행하면 아래와 비슷한 출력이 나온다.

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
719385e32844: Pull complete
Digest: sha256:...
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

단순해 보이지만, 이 짧은 출력 안에 Docker의 핵심 동작이 모두 담겨 있다.

---

##### docker run의 실제 동작 — 3단계

`docker run hello-world`를 입력했을 때 Docker 내부에서는 다음 3단계가 순서대로 실행된다.

```
[1] 이미지 확인
    로컬 캐시에 hello-world 이미지가 있는가?
    ↓ 없으면
[2] 이미지 Pull
    Docker Hub(인터넷)에서 hello-world 이미지를 내려받는다
    ↓
[3] 컨테이너 생성 → 실행 → 종료
    이미지로 컨테이너를 만들고 실행한다
    프로그램이 종료되면 컨테이너도 종료된다
```

처음 실행할 때는 `Unable to find image 'hello-world:latest' locally`라는 줄이 나온다. 로컬에 없으니 인터넷에서 받겠다는 뜻이다. 두 번째 실행부터는 이미 이미지가 로컬에 캐시되어 있으므로 이 줄이 나오지 않는다.

---

##### 상호작용하는 컨테이너 — ubuntu bash

`hello-world`는 출력만 하고 바로 종료된다. 컨테이너 안에 들어가서 직접 명령을 입력해 보고 싶다면 `-it` 옵션을 쓴다.

```bash
docker run -it ubuntu bash
```

옵션 의미를 풀어보면 다음과 같다.

| 옵션 | 의미 |
|:--|:--|
| `-i` | interactive — 입력을 받을 수 있게 한다 |
| `-t` | tty — 터미널처럼 보이게 한다 |
| `ubuntu` | 사용할 이미지 이름 |
| `bash` | 컨테이너 안에서 실행할 명령 |

실행하면 프롬프트가 바뀐다.

```
root@a3b7c9d1f2e4:/#
```

이제 컨테이너 안 Ubuntu Linux 터미널이다. `ls`, `pwd`, `cat /etc/os-release` 같은 명령을 자유롭게 입력할 수 있다.

```bash
# 컨테이너 안에서
cat /etc/os-release    # Ubuntu 버전 확인
ls /                   # 루트 디렉토리 목록
exit                   # 컨테이너 종료
```

`exit`를 입력하거나 `Ctrl + D`를 누르면 bash가 종료되고, 컨테이너도 함께 종료된다.

---

##### --rm 옵션 — 쓰고 버리기

기본적으로 `docker run`으로 실행한 컨테이너는 종료 후에도 목록에 남아 있다(`docker ps -a`로 확인 가능). 한번 쓰고 정리하고 싶다면 `--rm` 옵션을 추가한다.

```bash
# 종료 후 컨테이너를 자동으로 삭제
docker run --rm -it ubuntu bash
```

테스트나 일회성 작업에 자주 쓰는 패턴이다.

---

##### docker run 옵션 정리

```bash
# 기본 실행 (이미지만 지정)
docker run hello-world

# 상호작용 터미널
docker run -it ubuntu bash

# 백그라운드(데몬) 실행
docker run -d nginx

# 포트 연결 (호스트 8080 → 컨테이너 80)
docker run -d -p 8080:80 nginx

# 종료 후 자동 삭제
docker run --rm hello-world

# 이름 지정
docker run --name my-container -d nginx
```

---

> **[입문 렌즈 ★☆☆]**
> - **비유**: `docker run hello-world`는 스마트폰을 처음 켰을 때 나오는 "설정이 완료되었습니다" 화면과 같다. 기계가 제대로 작동한다는 신호다.
> - **체감 예시**: `hello-world` 출력에 "This message shows that your installation appears to be working correctly."라는 문장이 있다. 이것이 "설치 성공" 확인서다.
> - **핵심 질문**: "`docker run -it ubuntu bash`를 실행했을 때 프롬프트가 `root@...:#`으로 바뀌었는가?" — 그렇다면 컨테이너 안에 들어온 것이다.

> **[주니어 렌즈 ★★☆]**
> - **pull → create → start 3단계**: `docker run`은 사실 세 명령의 단축키다. `docker pull`(이미지 내려받기) + `docker create`(컨테이너 생성) + `docker start`(컨테이너 실행)를 한 번에 한다. 세 단계를 분리해서 실행하고 싶을 때는 각 명령을 직접 쓸 수 있다.
> - **-it 없이 bash 실행**: `docker run ubuntu bash`처럼 `-it`를 빼면 bash가 바로 종료된다. bash는 터미널(tty)이 없으면 입력을 받을 수 없어 즉시 종료된다. 상호작용이 필요한 명령에는 반드시 `-it`를 붙인다.
> - **--rm 습관**: 학습 중에는 `--rm`을 붙이는 습관을 들이면 `docker ps -a`에 죽은 컨테이너가 쌓이지 않는다.

> **[실무자 렌즈 ★★★]**
> - **docker run의 실제 동작 순서**: docker run → Docker CLI가 dockerd에 요청 → dockerd가 containerd에 위임 → containerd가 runc로 컨테이너 생성. `hello-world` 이미지의 Dockerfile을 보면 `CMD ["/hello"]`만 있는 최소 이미지다.
> - **이미지 레이어 캐싱**: 처음 pull 시 레이어를 내려받고 로컬에 캐시한다. 같은 베이스 이미지를 공유하는 다른 이미지를 pull하면 이미 있는 레이어는 건너뛴다. `--rm`은 컨테이너만 삭제하고 이미지는 유지한다.
> - **entrypoint vs cmd**: `docker run ubuntu bash`에서 `bash`는 `CMD`를 오버라이드한다. ubuntu 이미지의 기본 `CMD`는 `bash`이므로 사실 `docker run -it ubuntu`만 해도 동일하다.

##### 체크포인트

- [ ] `docker run hello-world`를 실행해서 "Hello from Docker!" 메시지를 확인했다
- [ ] `docker run -it ubuntu bash`로 컨테이너 안에 들어갔다가 `exit`로 나왔다
- [ ] `-i`, `-t`, `-d`, `-p`, `--rm` 옵션이 각각 무슨 역할인지 설명할 수 있다
- [ ] `docker run`이 내부적으로 pull → create → start 순서로 동작한다는 것을 설명할 수 있다

