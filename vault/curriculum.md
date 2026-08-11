# HashiCorp Vault 인터랙티브 학습 커리큘럼

## 학습 목표
HashiCorp Vault 를 실서비스 시크릿 관리 도구로 안전하게 도입할 수 있을 만큼 익힌다. 기초 개념(secret engine / auth / policy / token)에서 시작해 동적 시크릿(dynamic lease), 암호화 서비스(transit / PKI / SSH), 쿠버네티스 통합(K8s auth / OIDC / agent injector / external-secrets), 운영(HA / seal / Raft / audit / backup)까지 5단계로 다룬다.

## Part I. 기초 — secret engine / auth / policy / token
- I-1-1. secret engine — KV(정적) vs dynamic engine
- I-1-2. auth method — token / userpass / approle / k8s
- I-2-1. policy — capabilities 와 path glob (HCL)
- I-2-2. token — TTL / renewable / orphan / accessor

## Part II. dynamic secret 과 lease
- II-1-1. database secret engine — PostgreSQL 동적 사용자
- II-1-2. AWS secret engine — STS 임시 자격 증명
- II-2-1. lease — 발급/renew/만료 사이클
- II-2-2. revocation — lease revoke / 비상 회수

## Part III. 암호화 서비스 — transit / PKI / SSH
- III-1-1. transit — encryption as a service (앱이 키를 보지 않는다)
- III-1-2. PKI — 짧은 수명 인증서 발급
- III-2-1. SSH OTP — 일회용 비밀번호로 서버 접속
- III-2-2. SSH CA — 짧은 수명 인증서로 SSH

## Part IV. 쿠버네티스 통합 — K8s / OIDC / agent / ESO
- IV-1-1. Kubernetes auth method — ServiceAccount 토큰 검증
- IV-1-2. OIDC — 사람 로그인(Okta/Google)
- IV-2-1. agent injector — sidecar 가 시크릿 주입
- IV-2-2. external-secrets operator — Vault → K8s Secret 동기화

## Part V. 운영 — HA / seal / Raft / audit / backup
- V-1-1. HA — Raft consensus 와 active/standby
- V-1-2. seal / unseal — Shamir 키 분할 vs auto-unseal
- V-2-1. audit device — 모든 요청 추적
- V-2-2. backup — Raft snapshot 으로 재해 복구

## 색상 매핑
- 도메인 색상: HashiCorp Vault yellow (#FFCC33)
- 좌 LiveDataPane (Vault 도메인 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 코드 lang: HCL(policy/config) + bash(CLI/curl)
- 700~900 라인/시각화, 3000ms autoplay, 4 controls, 키보드 ←/→
