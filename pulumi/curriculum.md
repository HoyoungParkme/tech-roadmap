# Pulumi 인터랙티브 학습 커리큘럼

## 학습 목표
Pulumi로 클라우드 인프라(AWS/GCP/Azure/K8s)를 **범용 프로그래밍 언어**(TypeScript / Python / Go / .NET)로 정의하고 관리하는 방법을 익힌다. HCL이 아닌 진짜 코드로 IaC를 작성한다 — 변수, 함수, 클래스, 패키지 그대로. CrossGuard 정책, Automation API, multi-cloud 패턴까지.

## Part I. Pulumi 기초 (Why a Programming Language)
- I-1-1. program / stack / resource — Pulumi 3대 개념
- I-1-2. 언어별 SDK — TypeScript / Python / Go / .NET
- I-2-1. state 와 backend — Pulumi Cloud / S3 / 로컬
- I-2-2. Pulumi vs Terraform — 같은 인프라, 다른 표현

## Part II. Component + Dynamic Resource
- II-1-1. ComponentResource — 재사용 가능한 인프라 묶음
- II-1-2. Dynamic Provider — 내가 만드는 리소스 타입
- II-2-1. Transformation — 리소스 일괄 수정 hook
- II-2-2. Multi-language — TypeScript 컴포넌트를 Python 에서 import

## Part III. Cross-Cloud 통합
- III-1-1. AWS + GCP + Azure 한 프로그램에 — multi-cloud 패턴
- III-1-2. Kubernetes provider — manifest → 코드
- III-2-1. cross-region — 같은 컴포넌트, 여러 region 배포
- III-2-2. cross-provider 의존성 — AWS S3 URL 을 GCP Cloud Function 에 전달

## Part IV. CI/CD + Policy as Code
- IV-1-1. GitHub Actions — pulumi preview/up 자동화
- IV-1-2. Pulumi Cloud — 팀 협업 + state 잠금 + RBAC
- IV-2-1. CrossGuard — Policy as Code (TypeScript/Python)
- IV-2-2. Automation API — pulumi 를 라이브러리로 호출

## Part V. 운영 (State / Secret / Drift / Import)
- V-1-1. state backend 비교 — Pulumi Cloud vs self-hosted S3
- V-1-2. secret — Pulumi config 암호화 + secret provider
- V-2-1. drift 감지 — pulumi refresh / preview
- V-2-2. brownfield import — 기존 인프라를 Pulumi 안으로

## 색상 매핑
- 도메인 색상: purple (#8A3391, Pulumi 브랜드)
- 좌 LiveDataPane (Pulumi 상태/리소스 그래프 mock) + 우 VSCode CodeViewer (highlight.js + atom-one-dark)
- 언어: TypeScript + Python 위주, 일부 Go / HCL 비교
- 3000ms autoplay, 4 controls (처음/이전/▶/다음), 키보드 ←/→
