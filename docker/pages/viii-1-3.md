### VIII-1-3. logs, inspect, stats — 상태 파악과 디버깅

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 실행 중인 컨테이너의 로그를 추적하고, 내부 설정값을 추출하고, 실시간 자원 사용량을 확인할 수 있다.
- **설명**:
  컨테이너가 예상대로 동작하지 않을 때 첫 번째로 확인하는 것이 로그(`docker logs`)다. 네트워크 설정이나 마운트 경로를 알아야 할 때는 `docker inspect`가 답을 준다. CPU와 메모리를 얼마나 쓰는지 보려면 `docker stats`를 쓴다. 세 명령을 순서대로 사용하면 대부분의 문제를 진단할 수 있다.
- **핵심 키워드**: `docker logs`, `docker inspect`, `docker stats`, `--format`, `--tail`, `--since`
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-2
- **다음 섹션**: VIII-1-4

#### 본문

##### docker logs — 컨테이너 로그 확인

컨테이너 내부 애플리케이션이 stdout/stderr에 출력하는 내용을 Docker가 수집한다. `docker logs`로 이 내용을 볼 수 있다.

```bash
# 컨테이너 실행
docker run -d --name web nginx:alpine

# 전체 로그 출력
docker logs web

# 마지막 50줄만 출력
docker logs --tail 50 web

# 실시간 로그 추적 (tail -f 처럼)
docker logs -f web

# 마지막 50줄부터 실시간 추적
docker logs -f --tail 50 web
```

로그에 타임스탬프를 붙이려면 `-t`를 추가한다.

```bash
# 타임스탬프 포함
docker logs -t web

# 타임스탬프 + 실시간 추적
docker logs -ft web
```

##### 시간 필터로 로그 범위 좁히기

장애 발생 시각을 알면 로그 범위를 좁혀서 볼 수 있다.

```bash
# 최근 1시간 이내 로그
docker logs --since 1h web

# 최근 30분 이내 로그
docker logs --since 30m web

# 특정 시각 이후 로그 (ISO 8601 형식)
docker logs --since 2026-04-23T10:00:00 web

# 특정 시각 범위 (--since + --until)
docker logs --since 2026-04-23T09:00:00 --until 2026-04-23T10:00:00 web
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: 블랙박스 영상을 보는 것과 같다. 사고 전후 30분만 꺼내서 보는 것이 `--since`이고, 계속 실시간으로 보는 것이 `-f`이다.
> - **체감 예시**: 애플리케이션이 갑자기 응답을 안 한다. `docker logs -f --tail 100 app`으로 최근 100줄부터 실시간 로그를 보면서 어떤 에러가 반복되는지 확인한다.
> - **주의**: 컨테이너가 중지된 후에도 로그는 남아 있다. `docker ps -a`에서 보이는 중지된 컨테이너의 로그도 `docker logs`로 확인할 수 있다.

##### docker inspect — 컨테이너 전체 정보 조회

`docker inspect`는 컨테이너(또는 이미지, 네트워크, 볼륨)의 모든 설정을 JSON으로 출력한다.

```bash
# 컨테이너 전체 정보 (JSON)
docker inspect web

# JSON이 너무 길면 less로 보기
docker inspect web | less
```

JSON 전체를 보는 것보다 필요한 값만 추출하는 `--format` 옵션이 훨씬 실용적이다.

```bash
# IP 주소만 추출
docker inspect --format '{{.NetworkSettings.IPAddress}}' web

# 헬스체크 상태 확인
docker inspect --format '{{.State.Health.Status}}' web

# 컨테이너 상태 (running/exited 등)
docker inspect --format '{{.State.Status}}' web

# 마운트 정보 (볼륨/바인드 마운트)
docker inspect --format '{{range .Mounts}}{{.Source}} → {{.Destination}}{{println}}{{end}}' web

# 환경변수 목록
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' web

# 재시작 정책
docker inspect --format '{{.HostConfig.RestartPolicy.Name}}' web
```

> **[주니어 렌즈 ★★☆]**
> - **--format 문법**: Go 템플릿 문법을 사용한다. `{{.필드명}}`으로 값을 참조하고, `{{range .배열}}...{{end}}`로 반복한다. 처음에는 어렵게 느껴지지만, 자주 쓰는 패턴 3~4개만 외우면 된다.
> - **네트워크 vs IP**: `--network host`를 쓰면 컨테이너에 별도 IP가 없어서 `NetworkSettings.IPAddress`가 비어 있다. 이 경우 `docker inspect --format '{{.NetworkSettings.Networks}}'`로 전체 네트워크 정보를 확인한다.
> - **이미지에도 inspect 가능**: `docker inspect nginx:alpine`처럼 이미지에도 사용할 수 있다. 이미지의 레이어 수, 환경변수, CMD, ENTRYPOINT를 확인할 때 유용하다.

##### docker stats — 실시간 자원 사용량 모니터링

실행 중인 모든 컨테이너의 CPU, 메모리, 네트워크, 디스크 I/O를 실시간으로 표시한다.

```bash
# 모든 컨테이너 실시간 모니터링 (top 명령처럼 갱신됨)
docker stats

# 특정 컨테이너만 모니터링
docker stats web

# 스냅샷 (한 번만 출력하고 종료)
docker stats --no-stream

# 특정 컨테이너 스냅샷
docker stats --no-stream web
```

출력 예시:
```
CONTAINER ID   NAME    CPU %   MEM USAGE / LIMIT   MEM %   NET I/O       BLOCK I/O
a1b2c3d4e5f6   web     0.00%   3.5MiB / 7.7GiB     0.05%   1.2kB / 648B  0B / 0B
```

각 컬럼의 의미:

| 컬럼 | 의미 |
|:--|:--|
| CPU % | 전체 CPU 대비 사용률 |
| MEM USAGE / LIMIT | 현재 메모리 사용량 / 제한값 |
| MEM % | 제한값 대비 메모리 사용률 |
| NET I/O | 수신 / 송신 네트워크 데이터 |
| BLOCK I/O | 디스크 읽기 / 쓰기 |

> **[실무자 렌즈 ★★★]**
> - **inspect + jq**: `docker inspect`의 JSON 출력은 `jq`와 조합하면 훨씬 강력해진다. `docker inspect web | jq '.[0].NetworkSettings.Networks'`처럼 쓰면 --format 문법보다 직관적이다.
> - **stats의 한계**: `docker stats`는 현재 시점의 값을 보여줄 뿐, 과거 데이터를 저장하지 않는다. 시계열 모니터링이 필요하면 Prometheus + cAdvisor 또는 Datadog, Grafana Cloud 같은 도구를 사용한다.
> - **logs의 저장 위치**: Docker의 기본 로그 드라이버는 `json-file`이다. 로그는 호스트의 `/var/lib/docker/containers/<ID>/<ID>-json.log`에 저장된다. 별도 용량 제한 설정이 없으면 로그가 디스크를 가득 채울 수 있다. 프로덕션에서는 `max-size`와 `max-file` 설정을 반드시 한다.

##### 실습: postgres 컨테이너 상태 파악

```bash
# 1. postgres 컨테이너 실행
docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=myapp \
  postgres:16-alpine

# 2. 시작 로그 확인 (DB 초기화 완료 메시지 확인)
docker logs --tail 20 db

# 3. DB가 준비될 때까지 실시간 로그 추적
docker logs -f db
# "database system is ready to accept connections" 메시지 보이면 Ctrl+C

# 4. IP 주소 확인
docker inspect --format '{{.NetworkSettings.IPAddress}}' db

# 5. 마운트 정보 확인 (볼륨이 없으면 빈 배열)
docker inspect --format '{{json .Mounts}}' db

# 6. 자원 사용량 확인
docker stats --no-stream db

# 7. 정리
docker stop db && docker rm db
```

##### 체크포인트

- [ ] `docker logs -f --tail 50`이 하는 일을 설명할 수 있다
- [ ] `docker logs --since 1h`로 최근 1시간 로그를 볼 수 있다
- [ ] `docker inspect --format '{{.NetworkSettings.IPAddress}}'`로 컨테이너 IP를 추출할 수 있다
- [ ] `docker inspect --format '{{.State.Health.Status}}'`로 헬스체크 상태를 확인할 수 있다
- [ ] `docker stats --no-stream`과 `docker stats`의 차이를 설명할 수 있다

---

