## 부록

### 부록 A. Docker 용어집

| 용어 | 설명 |
|:--|:--|
| Dockerfile | 이미지를 만드는 설계도 파일 |
| Image | Dockerfile로 빌드된 읽기 전용 스냅샷 |
| Container | 이미지가 실행된 상태. 격리된 프로세스 |
| Layer | Dockerfile 명령어 하나가 만드는 파일시스템 변경 단위 |
| Registry | 이미지를 저장·배포하는 원격 저장소 (Docker Hub 등) |
| docker build | Dockerfile을 읽어 이미지를 만드는 명령 |
| docker run | 이미지로 컨테이너를 생성하고 실행하는 명령 |
| docker pull | 레지스트리에서 이미지를 내려받는 명령 |
| docker push | 로컬 이미지를 레지스트리에 올리는 명령 |
| docker ps | 실행 중인 컨테이너 목록 확인 |
| docker images | 로컬에 저장된 이미지 목록 확인 |
| -p (포트 매핑) | 호스트 포트:컨테이너 포트 연결 (예: -p 8000:8000) |
| -d (detached) | 컨테이너를 백그라운드에서 실행 |
| -t (tag) | 이미지 이름/태그 지정 |
| Volume | Docker가 관리하는 영구 저장소 |
| Bind Mount | 호스트 디렉토리를 컨테이너 안에 직접 마운트 |
| Docker Compose | 여러 컨테이너를 YAML로 선언하고 한 번에 실행하는 도구 |
| bridge 네트워크 | Docker 기본 가상 네트워크. 컨테이너 간 통신 허용 |
| HEALTHCHECK | 컨테이너 준비 상태를 주기적으로 검사하는 명령 |
| Multi-stage Build | 하나의 Dockerfile에서 빌드 스테이지와 실행 스테이지를 분리 |
| OCI | Open Container Initiative. 컨테이너 이미지·런타임 표준 |
| Docker Hub | Docker 공식 공개 레지스트리 |
| BuildKit | Docker 빌드 엔진. 병렬 빌드·캐시 최적화를 지원 |
| .dockerignore | 이미지 빌드 시 제외할 파일 목록 (.gitignore와 유사) |
| ENV | Dockerfile에서 환경변수를 설정하는 명령 |
| EXPOSE | 컨테이너가 사용하는 포트를 문서화하는 명령 (실제 개방은 -p로) |
| WORKDIR | 컨테이너 안의 기본 작업 디렉토리 설정 |
| FROM | 베이스 이미지 지정. Dockerfile의 첫 번째 명령 |
| CMD | 컨테이너 시작 시 실행할 기본 명령 |
| ENTRYPOINT | 컨테이너의 진입점 명령 (CMD와 함께 쓰임) |
| RUN | 빌드 시 명령을 실행해 레이어를 쌓는 명령 |
| docker exec | 실행 중인 컨테이너 안에서 명령을 실행하는 명령 (예: `docker exec -it <id> bash`) |
| docker logs | 컨테이너의 표준 출력(stdout/stderr) 로그를 확인하는 명령 |
| docker inspect | 컨테이너 또는 이미지의 상세 정보를 JSON 형식으로 출력하는 명령 |
| docker stats | 실행 중인 컨테이너의 CPU·메모리·네트워크 사용량을 실시간으로 확인하는 명령 |
| docker system prune | 사용하지 않는 컨테이너·이미지·네트워크·빌드 캐시를 한 번에 정리하는 명령 |
| docker cp | 컨테이너와 호스트 사이에 파일 또는 디렉토리를 복사하는 명령 |
| redis-cli | Redis 서버에 접속해 명령을 실행하는 명령줄 클라이언트 |
| mongosh | MongoDB 서버에 접속해 쿼리를 실행하는 공식 셸 클라이언트 (MongoDB Shell) |
| EC2 | AWS의 가상 서버 서비스 (Elastic Compute Cloud). 리눅스/윈도우 인스턴스를 시간 단위로 빌려 쓴다 |
| ECR | AWS의 Docker 이미지 저장소 (Elastic Container Registry). Docker Hub의 AWS 전용 대안 |
| IAM | AWS 접근 권한 관리 서비스 (Identity and Access Management). 사용자·역할·정책으로 AWS 리소스 접근을 제어한다 |
| watchtower | 실행 중인 컨테이너의 이미지를 주기적으로 확인해 새 버전이 나오면 자동으로 업데이트해주는 도구 |
| certbot | Let's Encrypt CA에서 무료 SSL/TLS 인증서를 자동으로 발급·갱신해주는 도구 |
| SCP | SSH 프로토콜 기반으로 원격 서버와 파일을 안전하게 전송하는 명령 (Secure Copy Protocol) |
| AOF | Append-Only File. Redis의 영속화 방식으로, 모든 쓰기 연산을 파일에 순서대로 기록한다 |
| BSON | Binary JSON. MongoDB가 내부적으로 문서를 저장하는 바이너리 형식 |

---

### 부록 B. 자주 묻는 질문 (FAQ)

**Q1. Docker와 가상머신(VM)의 차이가 뭔가요?**
VM은 하드웨어를 가상화해 OS 전체를 올린다. 컨테이너는 OS 커널을 공유하고 앱 실행 환경만 격리한다. 컨테이너는 VM보다 훨씬 가볍고 빠르게 시작된다.

**Q2. `docker run`과 `docker start`의 차이가 뭔가요?**
`docker run`은 이미지로 새 컨테이너를 만들고 실행한다. `docker start`는 이미 존재하는(종료된) 컨테이너를 다시 시작한다.

**Q3. `CMD`와 `ENTRYPOINT`의 차이가 뭔가요?**
`ENTRYPOINT`는 항상 실행되는 진입점이고, `CMD`는 기본 인수다. `docker run myapp 인수`처럼 실행 시 인수를 주면 `CMD`는 override되지만 `ENTRYPOINT`는 유지된다. 단순한 경우 `CMD`만 써도 충분하다.

**Q4. 레이어 캐시를 강제로 무효화하려면?**
`docker build --no-cache -t myapp .`처럼 `--no-cache` 옵션을 주면 모든 레이어를 새로 빌드한다.

**Q5. 컨테이너 안에 접속해서 파일을 직접 보고 싶어요.**
`docker exec -it <컨테이너ID> /bin/bash` (또는 `/bin/sh`)로 컨테이너 내부 셸에 접속할 수 있다. slim 이미지는 bash가 없는 경우 `sh`를 사용한다.

**Q6. 컨테이너가 종료되면 데이터가 사라지나요?**
컨테이너 내부 파일시스템의 변경사항은 컨테이너 종료 시 사라진다. 데이터를 보존하려면 볼륨(Volume) 또는 바인드 마운트(Bind Mount)를 사용해야 한다.

**Q7. `latest` 태그를 쓰면 안 되나요?**
개발/테스트에서는 편하지만 프로덕션에서는 피해야 한다. `latest`는 pull 시점마다 다른 버전이 올 수 있어 재현 불가능한 배포가 된다. semver 태그나 Git SHA 태그를 사용하라.

**Q8. Dockerfile에서 `COPY . .`을 하면 불필요한 파일까지 들어가지 않나요?**
`.dockerignore` 파일에 제외할 항목을 지정하면 된다. `.git`, `__pycache__`, `node_modules`, `*.log` 등을 포함하는 것이 일반적이다.

**Q9. Docker Compose와 Kubernetes의 차이가 뭔가요?**
Docker Compose는 단일 서버(로컬 또는 단일 VM)에서 여러 컨테이너를 조율하는 도구다. Kubernetes는 여러 서버에 걸친 대규모 컨테이너 클러스터를 오케스트레이션한다. 프로젝트 초기에는 Compose로 충분하다.

**Q10. `docker-compose` 명령과 `docker compose` 명령이 다른 건가요?**
Docker Compose V1은 별도로 설치하는 `docker-compose`(하이픈)였다. V2부터 Docker CLI 플러그인으로 통합되어 `docker compose`(공백)를 사용한다. 현재 공식 권장은 V2이며 `docker compose`를 쓴다.

---

### 부록 C. 다음에 공부할 것

Docker를 이 커리큘럼으로 마쳤다면 아래 순서로 확장을 추천한다.

1. **Kubernetes (k8s)** — 컨테이너 오케스트레이션. 여러 서버에서 컨테이너를 자동으로 배포·스케일링·복구한다.
2. **Helm** — Kubernetes 앱의 패키지 관리자. 복잡한 k8s 리소스를 차트(Chart)로 관리한다.
3. **GitHub Actions / GitLab CI** — Docker 빌드·push를 코드 변경에 맞게 자동화한다. 이 커리큘럼 Part VIII-16에서 EC2 자동 배포 전체 워크플로우를 이미 다뤘다. 다음 단계로 매트릭스 빌드(여러 OS·Node 버전 동시 테스트), 멀티 플랫폼 이미지 빌드(amd64/arm64), 스테이징→프로덕션 단계적 승격 파이프라인을 학습하라.
4. **Trivy / Snyk** — 이미지 보안 취약점 스캔을 CI에 통합한다.
5. **AWS ECS / EKS** — 이 커리큘럼 Part VIII-13~16에서 EC2에 직접 Docker를 설치해 배포하는 방법을 다뤘다. 다음 단계로 ECS(Elastic Container Service, AWS 관리형 컨테이너 실행 플랫폼)와 EKS(Elastic Kubernetes Service, AWS 관리형 Kubernetes)를 학습하면 수동 서버 관리 없이 컨테이너를 운영할 수 있다.
6. **Prometheus / Grafana** — 컨테이너 메트릭 수집·시각화 스택. `docker stats`로 확인하던 CPU·메모리 사용량을 시계열 DB에 저장하고 대시보드로 시각화한다. Docker Compose로 로컬에서 바로 실습할 수 있어 진입 장벽이 낮다.
7. **GCP Cloud Run** — 서버리스 컨테이너 플랫폼. Kubernetes 없이 컨테이너를 간단하게 배포한다.

---

### 부록 D. 참고 자료

| 분류 | 제목 | 주소 | 비고 |
|:--|:--|:--|:--|
| 공식 문서 | Docker 공식 문서 | https://docs.docker.com | 가장 정확한 레퍼런스 |
| 공식 문서 | Dockerfile reference | https://docs.docker.com/reference/dockerfile/ | 명령어 전체 목록 |
| 공식 문서 | Docker Compose 파일 레퍼런스 | https://docs.docker.com/compose/compose-file/ | Compose YAML 스펙 |
| 공식 이미지 | Docker Hub 공식 이미지 | https://hub.docker.com | python, postgres, nginx 등 |
| 보안 스캔 | Trivy | https://github.com/aquasecurity/trivy | 오픈소스 이미지 취약점 스캔 |
| 보안 스캔 | Docker Scout | https://docs.docker.com/scout/ | Docker 내장 취약점 스캔 |
| 표준 | OCI 스펙 | https://opencontainers.org | 컨테이너 이미지·런타임 표준 |
| 도구 | BuildKit | https://github.com/moby/buildkit | Docker 빌드 백엔드 |
| CI 통합 | docker/build-push-action | https://github.com/docker/build-push-action | GitHub Actions Docker 빌드 |
| CI 통합 | GitHub Actions 공식 문서 | https://docs.github.com/en/actions | 워크플로우 문법·매트릭스·환경변수 |
| 대안 런타임 | Podman | https://podman.io | 루트리스 컨테이너 도구 |
| 스케일링 | Kubernetes 공식 문서 | https://kubernetes.io/ko/docs/ | 다음 단계: 컨테이너 오케스트레이션 |
| AWS | Amazon ECR 공식 문서 | https://docs.aws.amazon.com/ecr/ | AWS Docker 이미지 레지스트리 |
| AWS | Amazon EC2 공식 문서 | https://docs.aws.amazon.com/ec2/ | AWS 가상 서버 |
| AWS | Amazon ECS 공식 문서 | https://docs.aws.amazon.com/ecs/ | AWS 관리형 컨테이너 서비스 |
| AWS | AWS IAM 공식 문서 | https://docs.aws.amazon.com/iam/ | AWS 접근 권한 관리 |
| 강의 | Play with Docker | https://labs.play-with-docker.com | 브라우저에서 바로 실습 가능 |
