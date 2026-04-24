# 🚀 docker 폴더 시작하기 (첫 프롬프트)

이 폴더는 `D:/dev/framwork_study/` 루트와 **독립된** Claude Code 프로젝트다. 여기서 `/pm`을 실행하면 Docker 학습 자료만 놓고 스프린트가 돌아간다.

## 현재 폴더에 있는 것

| 파일 | 내용 |
|:--|:--|
| `index.html` | **Chapter 1-1 시각화** — Dockerfile → build → Image → run → Container → 네트워크 노출 흐름 |
| `curriculum.md` | Part I~VII 상세 목차 (Section 설명 2~3줄, 총 ~32 Section) |
| `README.md` | Live Server 실행 + GitHub Pages 배포 가이드 |
| `docs/` | Sprint 1 대기 상태 |
| `.claude/`, `CLAUDE.md`, `USAGE.md` | 루트와 동일한 PM 워크플로우 |

## 시작 방법

### 1. 이 폴더로 이동
```bash
cd D:/dev/framwork_study/docker
```

### 2. Claude Code 실행 후 아래 프롬프트 복사

```
/pm 이 폴더의 Docker 학습 자료 Sprint 1을 시작할게.

현재 상태
- index.html: Dockerfile에서 컨테이너까지 시각화 (Chapter 1-1)
- curriculum.md: Part I~VII 상세 목차
- README.md: Live Server / Pages 가이드

다음 스프린트 방향 후보를 같이 정리해줘:

A. Chapter 1-2 시각화 추가 — 레이어 캐싱과 이미지 최적화 / Compose 멀티 컨테이너 / 볼륨 vs bind mount 차이 중 선택
B. curriculum 본문 1원고 집필 — Section 설명을 책 수준 본문으로 확장 (Part 단위 분할)
C. 실전 프로젝트 예제 추가 — "FastAPI + PostgreSQL + Nginx" Compose 한 세트

독자 타겟은 [컨테이너 처음인 입문자 / 로컬 개발 환경 통일하려는 주니어 / 프로덕션 배포 앞둔 실무자] 중 무엇으로?
```

## 방향별 참고

### A. Chapter 1-2 시각화 후보
- **레이어 캐싱과 최적화** — 같은 Dockerfile을 여러 번 빌드할 때 변경된 레이어만 재빌드되는 과정 (`COPY` 순서가 캐시에 주는 영향)
- **Compose 멀티 컨테이너** — web + db + cache 3개 서비스가 `docker compose up` 한 번으로 같은 네트워크에 뜨는 과정
- **볼륨 vs bind mount** — 컨테이너가 삭제돼도 데이터가 남는 과정 vs 호스트 경로 직접 마운트

### B. curriculum 본문 집필 시 주의
- Part별 3분할 위임
- Part I에서 "내 노트북에선 되는데 서버에선 안 돼요" 비유로 훅

### C. 실전 프로젝트 후보
- FastAPI + Postgres + Nginx Compose — 현실 최소 프로덕션 세트
- Multi-stage 빌드로 이미지 크기 1/5 줄이기 실험 (빌더 스테이지 vs 런타임 스테이지)
