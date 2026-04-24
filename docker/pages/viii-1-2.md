### VIII-1-2. exec, cp, attach — 실행 중 컨테이너 조작

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 실행 중인 컨테이너에 접속하고, 명령을 실행하고, 파일을 주고받을 수 있다.
- **설명**:
  컨테이너가 실행 중일 때 내부 상태를 확인하거나 긴급하게 파일을 수정해야 할 때가 있다. `docker exec`는 실행 중인 컨테이너에 새 프로세스를 추가로 실행하는 방법이다. `docker cp`는 호스트와 컨테이너 사이에 파일을 복사한다. `docker attach`는 컨테이너의 기존 메인 프로세스에 연결하는 방법이다. 세 명령의 차이를 이해하면 컨테이너 디버깅이 훨씬 쉬워진다.
- **핵심 키워드**: `docker exec`, `docker cp`, `docker attach`, 새 프로세스 vs stdin 공유
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-1
- **다음 섹션**: VIII-1-3

#### 본문

##### docker exec — 컨테이너 안에서 명령 실행

`docker exec`는 실행 중인 컨테이너에 새 프로세스를 추가로 실행한다. 컨테이너의 메인 프로세스(PID 1)와 독립적으로 동작한다.

```bash
# nginx 컨테이너를 백그라운드로 실행
docker run -d --name web nginx:alpine

# 컨테이너 내부 bash 셸 접속 (bash가 없으면 sh 사용)
docker exec -it web sh

# 셸 접속 후 할 수 있는 것들
/# cat /etc/nginx/nginx.conf          # 설정 파일 확인
/# ls /usr/share/nginx/html           # 기본 HTML 위치 확인
/# ps aux                              # 실행 중인 프로세스 확인
/# exit                                # 컨테이너는 계속 실행 중
```

`exit`로 나와도 컨테이너는 중지되지 않는다. `exec`로 접속한 셸만 종료될 뿐, 메인 프로세스(nginx)는 계속 실행된다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 실행 중인 자동차의 창문을 열고 손을 넣어 작업하는 것과 같다. 차는 계속 달리고 있고, 나는 옆에서 추가 작업을 하는 것이다.
> - **체감 예시**: nginx 컨테이너가 실행 중인데 설정 파일이 어디에 있는지 확인하고 싶다. `docker exec -it web sh`로 접속해서 `cat /etc/nginx/nginx.conf`를 실행하면 된다. VM이나 EC2 서버에 SSH 접속하는 것과 비슷한 느낌이다.
> - **주의**: `exec -it ... bash`가 안 될 때는 `bash`가 설치되지 않은 이미지다. Alpine 기반 이미지는 기본적으로 `sh`만 있다.

##### exec로 단일 명령 실행

셸에 접속하지 않고 명령 하나만 실행할 수도 있다.

```bash
# nginx 버전 확인
docker exec web nginx -v

# 설정 파일 문법 검사
docker exec web nginx -t

# 환경변수 확인
docker exec web env

# 특정 파일 내용 출력
docker exec web cat /etc/nginx/conf.d/default.conf

# nginx 설정 리로드 (무중단)
docker exec web nginx -s reload
```

##### docker cp — 호스트↔컨테이너 파일 복사

```bash
# 컨테이너 → 호스트 (설정 파일 가져오기)
docker cp web:/etc/nginx/nginx.conf ./nginx.conf

# 호스트 → 컨테이너 (수정한 파일 넣기)
echo "<h1>Hello Docker</h1>" > index.html
docker cp index.html web:/usr/share/nginx/html/index.html

# 브라우저에서 변경 확인 (포트 매핑이 되어 있어야 함)
# docker run -d --name web -p 8080:80 nginx:alpine 으로 실행했다면:
curl http://localhost:8080
```

폴더 전체를 복사할 수도 있다.

```bash
# 폴더 통째로 컨테이너에 복사
docker cp ./config/ web:/etc/nginx/

# 컨테이너 로그 폴더 가져오기
docker cp web:/var/log/nginx/ ./nginx-logs/
```

> **[주니어 렌즈 ★★☆]**
> - **cp의 한계**: `docker cp`는 임시 방편이다. 컨테이너를 재생성하면 복사한 파일이 사라진다. 설정 파일을 자주 교체해야 한다면 바인드 마운트(`-v`)를 쓰는 게 맞다.
> - **cp로 백업**: 컨테이너 안에 생성된 파일(예: sqlite 파일, 업로드된 이미지)을 빠르게 꺼내야 할 때 `docker cp`가 유용하다. 볼륨 설정을 깜빡했을 때 최후의 수단이 되기도 한다.
> - **경로 주의**: `컨테이너명:절대경로` 형식을 사용한다. 상대 경로는 동작하지 않는다.

##### docker attach — 메인 프로세스에 연결

`docker attach`는 컨테이너의 메인 프로세스(PID 1)의 stdin/stdout에 직접 연결한다. `exec`와 가장 큰 차이는 새 프로세스를 만들지 않는다는 점이다.

```bash
# attach로 nginx 메인 프로세스에 연결
docker run -d --name web nginx:alpine
docker attach web
# nginx 접근 로그가 실시간으로 출력됨
# Ctrl+C를 누르면 nginx(메인 프로세스)가 종료됨 — 컨테이너도 중지됨!
```

`attach`에서 컨테이너를 유지하면서 빠져나오려면 `Ctrl+P`, `Ctrl+Q`를 순서대로 누른다(detach 키 시퀀스).

```bash
# attach 상태에서 안전하게 빠져나오기
# Ctrl+P → Ctrl+Q (순서대로, 동시가 아님)
```

##### exec vs attach 비교

| 구분 | `docker exec` | `docker attach` |
|:--|:--|:--|
| 동작 | 새 프로세스 생성 | 기존 메인 프로세스에 연결 |
| exit 시 | exec 프로세스만 종료, 컨테이너 유지 | 메인 프로세스 종료 → 컨테이너 중지 |
| 주 용도 | 디버깅, 설정 확인, 긴급 수정 | 메인 프로세스 출력 모니터링 |
| 안전성 | 안전 | Ctrl+C 실수 시 컨테이너 중지됨 |
| 권장 여부 | 대부분의 상황에 권장 | 특수한 경우에만 사용 |

> **[실무자 렌즈 ★★★]**
> - **exec의 보안 위험**: `docker exec -it web sh`로 컨테이너에 접속해서 설정을 수정하는 것은 임시 방편이다. 컨테이너를 재생성하면 수정 내용이 사라진다. 이미지와 Compose 파일을 수정하고 재배포하는 것이 올바른 방법이다. exec는 원인 파악용으로만 쓴다.
> - **프로덕션 exec 제한**: 프로덕션 환경에서는 보안상 `docker exec` 권한을 제한하는 경우가 있다. Kubernetes의 경우 `kubectl exec`를 허용/차단하는 RBAC 정책을 따로 설정할 수 있다.
> - **distroless 이미지에서 exec**: distroless 이미지는 셸이 없어서 `exec -it ... sh`가 불가능하다. 디버깅이 필요하면 `gcr.io/distroless/base:debug` 태그를 쓰거나, `kubectl debug`로 사이드카 컨테이너를 붙인다.

##### 실습: nginx 컨테이너 접속 후 파일 확인 및 교체

```bash
# 1. nginx 컨테이너 실행 (포트 개방)
docker run -d --name web -p 8080:80 nginx:alpine

# 2. 기본 페이지 확인
curl http://localhost:8080

# 3. 내부 접속 후 기본 HTML 위치 확인
docker exec -it web sh
/# ls /usr/share/nginx/html
/# exit

# 4. 기본 index.html을 호스트로 가져오기
docker cp web:/usr/share/nginx/html/index.html ./original-index.html

# 5. 새 index.html 만들어서 컨테이너에 복사
echo "<h1>Part VIII 실습 완료!</h1>" > new-index.html
docker cp new-index.html web:/usr/share/nginx/html/index.html

# 6. 변경 확인
curl http://localhost:8080

# 7. 정리
docker stop web && docker rm web
```

##### 체크포인트

- [ ] `docker exec -it <이름> sh`와 `docker attach <이름>`의 차이를 설명할 수 있다
- [ ] `docker exec`로 나온 후 컨테이너가 유지되는 이유를 설명할 수 있다
- [ ] `docker cp`로 컨테이너의 설정 파일을 호스트로 가져오는 명령을 작성할 수 있다
- [ ] `docker attach`에서 안전하게 빠져나오는 키 시퀀스를 알고 있다
- [ ] Alpine 기반 이미지에서 bash 대신 sh를 써야 하는 이유를 설명할 수 있다

---

