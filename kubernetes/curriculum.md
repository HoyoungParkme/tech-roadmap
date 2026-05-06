# Kubernetes 인터랙티브 학습 커리큘럼

컨테이너 오케스트레이션을 단계별로 학습한다. docker(컨테이너 1개)에서 한 단계 위로 — **수많은 컨테이너를 자동으로 배치/재시작/스케일**하는 방법.

## 독자 가이드

- **선수 지식**: docker 기초 (이미지, 컨테이너, docker-compose). docker 학습 자료 47개를 먼저 본 학습자 대상
- **목표**: kubectl 한 줄로 동작하는 작은 클러스터를 운영할 수 있는 수준
- **분량**: 5 Parts × 20 sections, 시각화는 Phase A부터 점진 추가

---

## Part I. Kubernetes 개론

학습 목표: 왜 K8s가 필요한지, 가장 작은 단위(Pod)와 큰 그림(Cluster)을 이해한다.

### Section I-1-1. Kubernetes란 무엇인가
- **난이도**: ★☆☆
- **선수 지식**: docker 기초
- **학습 목표**: 컨테이너가 수십~수백 개일 때 사람이 손으로 못하는 일을 K8s가 어떻게 자동화하는지 안다.
- **핵심 키워드**: [오케스트레이션, 선언적 설정, self-healing, 스케일링]
- **시각화 연결**: [K8s란 시각화 보기](part1/I-1-1.html) — 손수 vs 오케스트레이션 / 선언적 설정 / self-healing / 자동 스케일 (택배 물류 센터 비유)
- **다음 섹션**: I-1-2

### Section I-1-2. Pod와 Container의 관계
- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: K8s가 컨테이너를 직접 다루지 않고 Pod라는 한 겹을 두는 이유를 안다.
- **핵심 키워드**: [Pod, sidecar, 공유 볼륨, 공유 네트워크]
- **시각화 연결**: [Pod 시각화 보기](part1/I-1-2.html) — Container만 / Pod 안 1개 / Pod 안 2개(sidecar) / 공유 자원 (도시락 비유)
- **다음 섹션**: I-2-1

### Section I-2-1. Cluster, Node, Control Plane
- **난이도**: ★★☆
- **선수 지식**: I-1-2
- **학습 목표**: 클러스터의 두 종류 노드(Master/Worker)와 핵심 컴포넌트(API Server, Scheduler, kubelet)의 역할을 안다.
- **핵심 키워드**: [Cluster, Master Node, Worker Node, API Server, Scheduler, kubelet, etcd]
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: I-2-2

### Section I-2-2. 선언적 매니페스트 (YAML)
- **난이도**: ★★☆
- **선수 지식**: I-2-1
- **학습 목표**: kubectl apply -f가 왜 강력한지(idempotent + 차이만 적용)를 안다.
- **핵심 키워드**: [apiVersion, kind, metadata, spec, kubectl apply]
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: II-1-1

---

## Part II. Workload (실행 단위)

학습 목표: Pod 위에 쌓는 다양한 워크로드 타입을 안다 — Deployment / StatefulSet / DaemonSet / Job.

### Section II-1-1. Deployment & ReplicaSet
- **난이도**: ★★☆
- **선수 지식**: I-2-2
- **학습 목표**: Pod를 N개로 복제하고 롤링 업데이트하는 표준 패턴을 안다.
- **핵심 키워드**: [Deployment, ReplicaSet, replicas, rolling update]
- **시각화 연결**: [Deployment & ReplicaSet 시각화 보기](part2/II-1-1.html) — Pod 단독 / ReplicaSet / Deployment / replicas 조절 (공장 생산라인 비유)
- **다음 섹션**: II-1-2

### Section II-1-2. 롤링 업데이트와 롤백
- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: 무중단 배포의 흐름과 문제 발생 시 즉시 되돌리는 방법을 안다.
- **핵심 키워드**: [rollout, maxSurge, maxUnavailable, rollback]
- **시각화 연결**: [롤링 업데이트와 롤백 시각화 보기](part2/II-1-2.html) — 안정 v1 / 점진 교체 / 완료 v2 / 롤백 (교대 근무 비유)
- **다음 섹션**: II-2-1

### Section II-2-1. StatefulSet (DB, 큐 등 상태 있는 워크로드)
- **난이도**: ★★★
- **선수 지식**: II-1-2
- **학습 목표**: Deployment와 다르게 StatefulSet이 필요한 이유(고유 ID, 순서 보장, 영속 볼륨)를 안다.
- **핵심 키워드**: [StatefulSet, headless service, persistent volume claim]
- **시각화 연결**: [StatefulSet 시각화 보기](part2/II-2-1.html) — Deployment 한계 / 고유 ID / 영속 볼륨 / 순서 보장 (지정석 비유)
- **다음 섹션**: II-2-2

### Section II-2-2. DaemonSet & Job & CronJob
- **난이도**: ★★☆
- **선수 지식**: II-2-1
- **학습 목표**: 노드별 1개(로그 수집) / 1회성 (마이그레이션) / 주기 작업의 워크로드 타입을 안다.
- **핵심 키워드**: [DaemonSet, Job, CronJob]
- **시각화 연결**: [DaemonSet & Job & CronJob 시각화 보기](part2/II-2-2.html) — DaemonSet 노드별 / Job 1회 / CronJob 주기 / 4 워크로드 비교
- **다음 섹션**: III-1-1

---

## Part III. Service & Networking

학습 목표: Pod IP는 동적인데 안정적 진입점을 어떻게 만드는지, 외부에서 어떻게 접근하는지 안다.

### Section III-1-1. Service의 4가지 타입
- **난이도**: ★★☆
- **선수 지식**: II-2-2
- **학습 목표**: ClusterIP / NodePort / LoadBalancer / ExternalName 차이와 선택 기준을 안다.
- **핵심 키워드**: [ClusterIP, NodePort, LoadBalancer, ExternalName, selector]
- **시각화 연결**: [Service 4타입 시각화 보기](part3/III-1-1.html) — ClusterIP / NodePort / LoadBalancer / ExternalName (건물 출입문 4종 비유)
- **다음 섹션**: III-1-2

### Section III-1-2. Ingress (HTTP 라우팅)
- **난이도**: ★★★
- **선수 지식**: III-1-1
- **학습 목표**: 도메인/경로 기반 라우팅과 TLS 종료를 한 곳에서 처리하는 패턴을 안다.
- **핵심 키워드**: [Ingress, Ingress Controller, host, path, TLS]
- **시각화 연결**: [Ingress 시각화 보기](part3/III-1-2.html) — LB N개 한계 / 도메인 라우팅 / 경로 라우팅 / TLS 종료 (안내 데스크 비유)
- **다음 섹션**: III-2-1

### Section III-2-1. NetworkPolicy (Pod 간 트래픽 통제)
- **난이도**: ★★★
- **선수 지식**: III-1-2
- **학습 목표**: 보안 경계를 클러스터 안에 만드는 방법(default deny → 명시적 허용)을 안다.
- **핵심 키워드**: [NetworkPolicy, ingress/egress 규칙, podSelector]
- **시각화 연결**: [NetworkPolicy 시각화 보기](part3/III-2-1.html) — 전 통신 허용 / Default Deny / 명시 허용 / Egress (방화벽 비유)
- **다음 섹션**: III-2-2

### Section III-2-2. DNS와 Service 디스커버리
- **난이도**: ★★☆
- **선수 지식**: III-2-1
- **학습 목표**: `<service>.<namespace>.svc.cluster.local` 이름으로 어떻게 자동 해석되는지 안다.
- **핵심 키워드**: [CoreDNS, FQDN, namespace, headless service]
- **시각화 연결**: [DNS & 디스커버리 시각화 보기](part3/III-2-2.html) — Service 이름 / FQDN / namespace 격리 / Headless (사내 전화번호부 비유)
- **다음 섹션**: IV-1-1

---

## Part IV. Storage & Config

학습 목표: 파일/설정/비밀값을 Pod에 어떻게 주입하는지, Pod가 죽어도 데이터를 보존하는 방법을 안다.

### Section IV-1-1. Volume과 PersistentVolume(Claim)
- **난이도**: ★★★
- **선수 지식**: III-2-2
- **학습 목표**: emptyDir / hostPath / PVC의 차이, dynamic provisioning을 안다.
- **핵심 키워드**: [Volume, PersistentVolume, PersistentVolumeClaim, StorageClass]
- **시각화 연결**: [Volume/PV/PVC 시각화 보기](part4/IV-1-1.html) — emptyDir / hostPath / PV+PVC / Dynamic Provisioning (사물함 비유)
- **다음 섹션**: IV-1-2

### Section IV-1-2. ConfigMap (설정 외부화)
- **난이도**: ★★☆
- **선수 지식**: IV-1-1
- **학습 목표**: 설정값을 이미지에서 분리하는 두 방식(env / volume mount)을 안다.
- **핵심 키워드**: [ConfigMap, env, volumeMount, hot reload]
- **시각화 연결**: [ConfigMap 시각화 보기](part4/IV-1-2.html) — 이미지 박힘 / ConfigMap 생성 / env 주입 / volume mount (공유 메모장 비유)
- **다음 섹션**: IV-2-1

### Section IV-2-1. Secret (비밀값 주입)
- **난이도**: ★★☆
- **선수 지식**: IV-1-2
- **학습 목표**: ConfigMap과의 차이, base64 인코딩의 한계, 외부 비밀 관리(Vault) 연계 필요성을 안다.
- **핵심 키워드**: [Secret, base64, encryption-at-rest, sealed-secrets]
- **시각화 연결**: [Secret 시각화 보기](part4/IV-2-1.html) — Secret 기본 / base64 함정 / etcd 암호화 / SealedSecrets·Vault (금고 비유)
- **다음 섹션**: IV-2-2

### Section IV-2-2. Resource Limits & Requests
- **난이도**: ★★☆
- **선수 지식**: IV-2-1
- **학습 목표**: Pod 스케줄링을 안정화하는 cpu/memory 요청/한도와 QoS 클래스를 안다.
- **핵심 키워드**: [requests, limits, QoS, OOMKilled]
- **시각화 연결**: [Resource Limits & Requests 시각화 보기](part4/IV-2-2.html) — 설정 없음 / requests / + limits / Guaranteed (예약 좌석 비유 + QoS 3 클래스)
- **다음 섹션**: V-1-1

---

## Part V. 실전 운영

학습 목표: 클러스터를 안정적으로 운영하기 위한 도구와 관행을 안다.

### Section V-1-1. kubectl 핵심 명령어
- **난이도**: ★★☆
- **선수 지식**: IV-2-2
- **학습 목표**: get / describe / logs / exec / apply 5개 명령어로 일상 디버깅을 한다.
- **핵심 키워드**: [kubectl, get, describe, logs, exec, apply]
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-1-2

### Section V-1-2. Helm (패키지 매니저)
- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: 매니페스트 N개를 묶어 values.yaml 한 파일로 환경별 배포하는 방법을 안다.
- **핵심 키워드**: [Helm, Chart, values.yaml, helm install/upgrade]
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-2-1

### Section V-2-1. 모니터링 (Prometheus + Grafana)
- **난이도**: ★★★
- **선수 지식**: V-1-2
- **학습 목표**: 메트릭 수집/시각화의 표준 스택과 핵심 알림(CPU/메모리/Pod 재시작)을 안다.
- **핵심 키워드**: [Prometheus, Grafana, ServiceMonitor, AlertManager]
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: V-2-2

### Section V-2-2. 트러블슈팅 체크리스트
- **난이도**: ★★★
- **선수 지식**: V-2-1
- **학습 목표**: Pod가 안 뜰 때(ImagePullBackOff/CrashLoopBackOff/Pending) 단계별 진단 흐름을 안다.
- **핵심 키워드**: [ImagePullBackOff, CrashLoopBackOff, Pending, Events]
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: 없음 (커리큘럼 마지막 섹션)

---

## 참고 자료

- Kubernetes 공식 문서 ([kubernetes.io/docs](https://kubernetes.io/docs/))
- "Kubernetes in Action" (Marko Lukša)
- CNCF Cloud Native Trail Map
- kubectl Cheat Sheet
