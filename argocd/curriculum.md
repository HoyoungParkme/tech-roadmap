# ArgoCD 인터랙티브 학습 커리큘럼

> Kubernetes GitOps 도구 ArgoCD를 다섯 단계로 끊어서 본다.
> Git이 곧 desired state, ArgoCD는 그것을 클러스터에 맞춰 끊임없이 sync 한다.

---

## 전체 구조 (5 Parts)

| Part | 주제 | 핵심 키워드 |
|:----:|:-----|:-----------|
| I    | 기초 — GitOps 4원칙·Application CRD·source·destination | declarative / pull / Application |
| II   | sync 전략 — manual·auto·wave·sync option                | self-heal / prune / sync wave |
| III  | App of Apps + Project — 다중 환경·멀티 테넌시            | AppOfApps / ApplicationSet / AppProject |
| IV   | 보안 — RBAC·SSO·Dex·Secret 관리                          | rbac.csv / Dex / Sealed Secrets |
| V    | 실전 — Progressive Delivery·Canary·Rollout·Notifications | Argo Rollouts / Analysis / Notification |

---

## Part I. 기초 — "왜 GitOps, 무엇이 Application인가" (4 섹션)

ArgoCD를 처음 만나는 사람이 가장 먼저 답해야 할 두 질문 — "왜 굳이 GitOps 인가?", "Application 이라는 단어가 도대체 뭘 가리키는가?" — 를 다룬다.

- **I-1-1 GitOps 4원칙** — declarative / versioned / pulled / continuously reconciled. push-pipeline 시대와 무엇이 다른가.
- **I-1-2 Application CRD** — ArgoCD 가 클러스터에 추가하는 단 하나의 핵심 리소스. metadata + spec(source + destination + syncPolicy)로 구성된다.
- **I-1-3 source — Git 저장소 가리키기** — repoURL · path · targetRevision · helm / kustomize chart 지정.
- **I-1-4 destination — 어느 클러스터 어느 네임스페이스로** — server URL + namespace. multi-cluster 의 첫 단추.

---

## Part II. sync 전략 — "Git 과 클러스터를 어떻게 맞출 것인가" (4 섹션)

같은 Application 이라도 sync 정책에 따라 운영 성격이 완전히 달라진다. 수동/자동, 자동 치유, 단계 분리(wave), 그리고 세부 옵션(prune / replace 등)을 살핀다.

- **II-1-1 manual sync** — `argocd app sync` 또는 UI 버튼. 운영 환경의 안전 장치.
- **II-1-2 automated sync (self-heal + prune)** — Git 이 곧 truth. 클러스터 손댐도 자동으로 되돌린다.
- **II-1-3 sync wave** — `argoproj.io/sync-wave` annotation 으로 ConfigMap → Deploy → Ingress 순서 보장.
- **II-1-4 sync option** — `CreateNamespace=true`, `ServerSideApply=true`, `Replace=true`, `PrunePropagationPolicy=foreground` 같은 세부 손잡이.

---

## Part III. App of Apps + Project — "여러 앱과 다중 환경을 어떻게 묶는가" (4 섹션)

앱이 늘어나면 Application 을 일일이 만드는 일이 끔찍해진다. App of Apps 패턴과 ApplicationSet 으로 자동 생성하고, AppProject 로 권한·소스·대상 범위를 제한한다.

- **III-1-1 App of Apps 패턴** — Application 을 정의하는 Application. 모든 앱이 한 폴더 안에서 관리된다.
- **III-1-2 ApplicationSet** — generator(list / git / cluster / matrix) 가 Application 을 동적으로 찍어낸다. dev/stg/prod 또는 클러스터별로.
- **III-1-3 AppProject** — Application 들을 묶는 권한 단위. `sourceRepos`, `destinations`, `clusterResourceWhitelist` 로 sandboxing.
- **III-1-4 multi-tenancy** — 팀별 Project + 팀별 RBAC. 한 ArgoCD 인스턴스로 여러 팀을 안전하게 운영.

---

## Part IV. 보안 — "누가 무엇을 할 수 있는가" (4 섹션)

ArgoCD 는 클러스터 권한이 매우 강하다. RBAC, SSO 통합, Dex, Secret 저장 — 운영 전 반드시 잠가야 한다.

- **IV-1-1 RBAC** — `rbac.csv` policy 작성. role / group / subject 매핑.
- **IV-1-2 SSO + Dex** — GitHub / Google / OIDC 통합으로 ArgoCD 로그인을 회사 계정과 일원화.
- **IV-1-3 secret 관리 (Sealed Secrets / External Secrets)** — Git 에 plain secret 을 두지 않는 방법.
- **IV-1-4 audit log 와 webhook** — 누가 sync 했고 누가 권한을 바꿨나.

---

## Part V. 실전 — "안전하게 배포한다" (4 섹션)

ArgoCD 만으로는 traffic shifting 이 부족하다. Argo Rollouts 를 결합해 canary / blue-green / analysis 를 구현하고, Notifications 로 팀에 알린다.

- **V-1-1 Progressive Delivery 개념** — all-at-once 배포의 위험과 점진 배포 4가지(rolling / canary / blue-green / shadow).
- **V-1-2 Argo Rollouts — Canary** — `setWeight` + `pause` 로 10% → 25% → 50% → 100% 단계 승급.
- **V-1-3 AnalysisTemplate — 자동 판정** — Prometheus 메트릭으로 error-rate 가 임계치를 넘으면 자동 abort.
- **V-1-4 Notifications** — Slack / Email / webhook 으로 sync · health · degraded 이벤트 알림.

---

## 학습 순서 추천

1. Part I 을 가장 천천히. ArgoCD 의 기본 단어 4개(Application / source / destination / sync) 가 머리에 잡혀야 나머지가 쉬워진다.
2. Part II 는 직접 한 번 manual / auto 둘 다 sync 해보면 차이가 즉시 보인다.
3. Part III, IV 는 팀 단위 운영을 시작할 때 본다. 혼자 쓰면 III, IV 의 무게가 느껴지지 않는다.
4. Part V 는 ArgoCD 의 확장(Rollouts) 이므로 실제 트래픽이 흐르는 서비스가 있어야 의미가 있다.

---

## 색상 코드

이 자료에서 ArgoCD 브랜드 색은 `#EF7B4D` (orange-red) 한 가지로 통일한다.
복잡한 멀티 컬러 대신 단색 강조로 "ArgoCD = 이 색" 이라는 인지를 만든다.
