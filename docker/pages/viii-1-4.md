### VIII-1-4. system prune과 디스크 관리

- **난이도**: ★★☆
- **학습 목표**: 이 Section을 마치면 Docker가 차지하는 디스크 공간을 파악하고, 안전하게 정리할 수 있다.
- **설명**:
  Docker를 계속 사용하다 보면 중지된 컨테이너, 사용하지 않는 이미지, 비어 있는 볼륨이 쌓인다. 이들이 디스크를 조금씩 잠식한다. `docker system df`로 현황을 파악하고, prune 명령으로 안전하게 정리할 수 있다. `docker system prune -a`는 한 번에 대량 삭제하는 강력한 명령이라 사용 전에 반드시 무엇이 삭제되는지 이해해야 한다.
- **핵심 키워드**: `docker system df`, `docker system prune`, `docker image prune`, `docker volume prune`, `docker container prune`, 댕글링 이미지
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-3
- **다음 섹션**: VIII-1-5

#### 본문

##### docker system df — 디스크 사용량 현황 파악

정리하기 전에 현황부터 파악한다. `docker system df`는 이미지, 컨테이너, 볼륨, 빌드 캐시가 각각 얼마나 차지하는지 요약해서 보여준다.

```bash
# 요약 보기
docker system df

# 상세 보기 (개별 항목 목록)
docker system df -v
```

출력 예시:
```
TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
Images          12      3        2.45GB    1.82GB (74%)
Containers      8       2        156MB     134MB (86%)
Local Volumes   5       2        1.2GB     800MB (66%)
Build Cache     24      0        512MB     512MB (100%)
```

`RECLAIMABLE`이 정리 가능한 용량이다. 이 숫자를 보고 정리 여부를 결정한다.

> **[입문 렌즈 ★☆☆]**
> - **비유**: 컴퓨터의 디스크 정리 도구와 같다. 무작정 파일을 지우기 전에 "이 폴더가 몇 GB인지" 먼저 확인하는 것처럼, `docker system df`로 어디에 얼마가 쌓여 있는지 먼저 본다.
> - **체감 예시**: 개발 노트북의 `/var/lib/docker`가 20GB를 넘어 디스크가 부족해졌다. `docker system df -v`로 확인해 보니 이전 스프린트에서 빌드한 이미지들이 15GB를 차지하고 있었다. `docker image prune`으로 사용하지 않는 이미지를 지워서 공간을 확보했다.
> - **주의**: macOS와 Windows에서는 Docker Desktop이 가상 디스크(vmdk, vhdx)를 사용한다. `system df`는 그 가상 디스크 안의 사용량을 보여준다.

##### 댕글링 이미지란

이미지를 새로 빌드하면 같은 태그의 이전 이미지는 태그를 잃고 `<none>:<none>`이 된다. 이를 댕글링(dangling) 이미지라고 한다. 실제로 사용되지 않지만 디스크를 차지한다.

```bash
# 댕글링 이미지 목록 확인
docker images -f dangling=true

# 댕글링 이미지만 삭제
docker image prune
```

##### docker system prune — 한 번에 정리

중지된 컨테이너 + 사용하지 않는 네트워크 + 댕글링 이미지 + 빌드 캐시를 한 번에 삭제한다.

```bash
# prune 실행 (삭제 전 확인 메시지 표시됨)
docker system prune

# 확인 메시지 없이 바로 실행
docker system prune -f
```

실행하면 아래처럼 어떤 항목이 삭제되는지 목록이 표시된다.

```
WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all dangling build cache

Are you sure you want to continue? [y/N]
```

> **[주니어 렌즈 ★★☆]**
> - **prune의 범위 확인**: `docker system prune`은 실행 중인 컨테이너와 연결된 이미지는 삭제하지 않는다. "사용 중(active)"인 리소스는 건드리지 않는다.
> - **볼륨은 기본 제외**: `docker system prune`은 기본적으로 볼륨을 삭제하지 않는다. 볼륨에는 DB 데이터가 있을 수 있기 때문이다. 볼륨도 함께 지우려면 `--volumes` 플래그를 추가한다.
> - **빌드 캐시 별도 관리**: 빌드 캐시가 많이 쌓인 경우 `docker builder prune`으로만 캐시를 지울 수 있다. `docker system prune`도 기본적으로 빌드 캐시를 정리하지만, 캐시만 선택적으로 지우고 싶을 때 유용하다.

##### docker system prune -a — 주의 필요

`-a` 플래그를 추가하면 실행 중인 컨테이너에서 사용하지 않는 **모든** 이미지를 삭제한다. 댕글링 이미지뿐만 아니라 태그가 있는 이미지도 삭제된다.

```bash
# 경고: 사용하지 않는 모든 이미지 삭제
docker system prune -a

# 7일보다 오래된 것만 삭제 (--filter 활용)
docker system prune -a --filter "until=168h"
```

`-a`를 쓰면 다음에 필요할 때 이미지를 다시 pull해야 한다. 인터넷 환경이 느리거나 레지스트리 접근이 제한된 환경에서는 신중하게 사용한다.

##### 개별 prune 명령

전체가 아닌 특정 항목만 정리할 때 사용한다.

```bash
# 중지된 컨테이너만 삭제
docker container prune

# 댕글링 이미지만 삭제
docker image prune

# 사용하지 않는 볼륨만 삭제 (데이터 영구 삭제 — 주의!)
docker volume prune

# 사용하지 않는 네트워크만 삭제
docker network prune

# 빌드 캐시만 삭제
docker builder prune
```

각 명령이 삭제하는 대상을 정확히 이해하고 쓰는 것이 중요하다.

| 명령 | 삭제 대상 | 주의 수준 |
|:--|:--|:--|
| `container prune` | 중지된 컨테이너 | 낮음 |
| `image prune` | 댕글링 이미지 (`<none>:<none>`) | 낮음 |
| `image prune -a` | 사용하지 않는 모든 이미지 | 높음 |
| `volume prune` | 미사용 볼륨 (데이터 포함) | 매우 높음 |
| `network prune` | 미사용 네트워크 | 낮음 |
| `system prune` | 컨테이너+네트워크+댕글링 이미지+캐시 | 중간 |
| `system prune -a` | + 모든 미사용 이미지 | 높음 |
| `system prune -a --volumes` | + 볼륨 포함 | 매우 높음 |

##### --filter 옵션으로 안전하게 정리

무작정 전부 지우는 것보다 기준을 정해서 정리하면 더 안전하다.

```bash
# 24시간보다 오래된 중지된 컨테이너만 삭제
docker container prune --filter "until=24h"

# 특정 레이블이 붙은 이미지만 삭제
docker image prune --filter "label=env=dev"

# 48시간보다 오래된 빌드 캐시 삭제
docker builder prune --filter "until=48h"
```

##### 디스크 부족 시 대처 플로차트

```
디스크 부족 감지
        │
        ▼
docker system df -v 로 현황 파악
        │
        ├─── 빌드 캐시가 많다 ───► docker builder prune
        │
        ├─── 중지된 컨테이너가 많다 ───► docker container prune
        │
        ├─── 댕글링 이미지가 많다 ───► docker image prune
        │
        ├─── 오래된 이미지가 많다 ───► docker image prune -a --filter "until=168h"
        │
        └─── 미사용 볼륨이 있다 ───► docker volume ls 로 확인 후
                                      필요 없는 것만 docker volume rm <이름>
```

> **[실무자 렌즈 ★★★]**
> - **CI 서버 정기 정리**: CI 서버는 빌드할 때마다 이미지가 쌓인다. 매일 새벽 cron으로 `docker system prune -f`를 실행하거나, GitHub Actions의 self-hosted runner라면 워크플로우 마지막에 prune을 추가한다.
> - **볼륨 prune의 위험성**: `docker volume prune`은 어떤 컨테이너에도 연결되지 않은 볼륨을 삭제한다. 컨테이너를 삭제했지만 볼륨은 남겨둔 경우(데이터 보존 목적)도 삭제될 수 있다. 볼륨 이름을 명확히 관리하고, 삭제 전 `docker volume ls`로 목록을 확인한다.
> - **Docker Desktop 가상 디스크 축소**: macOS/Windows에서 `docker system prune`을 실행해도 호스트의 가상 디스크 파일 크기가 줄지 않을 수 있다. Docker Desktop의 "Clean / Purge data" 기능을 사용하거나, 가상 디스크를 직접 축소하는 절차가 필요하다.
> - **프로덕션 서버**: 프로덕션 서버에서 `docker system prune -a`를 실행하면 현재 사용하지 않는 이미지가 모두 삭제된다. 롤백 시 이전 버전 이미지를 다시 pull해야 하므로 레지스트리 접근이 보장되어 있을 때만 실행한다.

##### 체크포인트

- [ ] `docker system df`와 `docker system df -v`의 차이를 설명할 수 있다
- [ ] 댕글링 이미지가 무엇인지, 왜 생기는지 설명할 수 있다
- [ ] `docker system prune`과 `docker system prune -a`의 차이를 설명할 수 있다
- [ ] `docker volume prune`이 위험한 이유를 설명할 수 있다
- [ ] 디스크가 부족할 때 어떤 순서로 정리 명령을 실행할지 설명할 수 있다

---

