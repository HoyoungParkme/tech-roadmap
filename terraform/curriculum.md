# Terraform 인터랙티브 학습 커리큘럼

## 학습 목표
Terraform으로 클라우드 인프라(AWS/GCP/Azure)를 코드로 정의하고 안전하게 관리하는 방법을 익힌다. 선언적 IaC, state, module, workspace, 협업 패턴까지.

## Part I. IaC 기초 (Why Terraform)
- I-1-1. 클릭 인프라의 함정 — 환경 차이 / 재현 불가
- I-1-2. IaC 란 무엇인가 — 선언적 vs 명령적
- I-2-1. Terraform vs CloudFormation vs Pulumi
- I-2-2. Terraform 설치 + 첫 실행

## Part II. Terraform 핵심 개념
- II-1-1. provider — AWS/GCP/Azure 인증
- II-1-2. resource — 리소스 선언 한 줄로
- II-2-1. variable / output — 입력과 결과
- II-2-2. terraform plan / apply / destroy 라이프사이클

## Part III. State 관리
- III-1-1. terraform.tfstate — 진실의 원본
- III-1-2. remote state (S3 + DynamoDB lock)
- III-2-1. state import / mv / rm
- III-2-2. 충돌과 lock 복구

## Part IV. 모듈과 협업
- IV-1-1. module — 재사용 가능한 코드 단위
- IV-1-2. workspace — dev/staging/prod 분리
- IV-2-1. terragrunt — DRY 보강
- IV-2-2. PR + plan 자동 코멘트 (Atlantis/Spacelift)

## Part V. 운영과 보안
- V-1-1. lifecycle — prevent_destroy / create_before_destroy
- V-1-2. drift 감지와 sentinel 정책
- V-2-1. secret 관리 — Vault / SOPS / 환경변수
- V-2-2. 실전 체크리스트 — 운영 출항 점검표

## 색상 매핑
- 도메인 색상: pink
- 좌 LiveDataPane (도메인별 시뮬레이션) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 3000ms autoplay, 4 controls, 키보드 ←/→
