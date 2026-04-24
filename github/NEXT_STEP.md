# 🚀 github 폴더 시작하기 (첫 프롬프트)

이 폴더는 `D:/dev/framwork_study/` 루트와 **독립된** Claude Code 프로젝트다. 여기서 `/pm`을 실행하면 Git/GitHub 학습 자료만 놓고 스프린트가 돌아간다.

## 현재 폴더에 있는 것

| 파일 | 내용 |
|:--|:--|
| `index.html` | **Chapter 1-1 시각화** — Working Directory → Staging → Local → Remote → PR → Merge 흐름 |
| `curriculum.md` | Part I~VII 상세 목차 (Section 설명 2~3줄, 총 ~30 Section) |
| `README.md` | Live Server 실행 + GitHub Pages 배포 가이드 |
| `docs/` | Sprint 1 대기 상태 |
| `.claude/`, `CLAUDE.md`, `USAGE.md` | 루트와 동일한 PM 워크플로우 |

## 시작 방법

### 1. 이 폴더로 이동
```bash
cd D:/dev/framwork_study/github
```

### 2. Claude Code 실행 후 아래 프롬프트 복사

```
/pm 이 폴더의 Git/GitHub 학습 자료 Sprint 1을 시작할게.

현재 상태
- index.html: Git 변경사항 여행 시각화 (Chapter 1-1)
- curriculum.md: Part I~VII 상세 목차
- README.md: Live Server / Pages 가이드

다음 스프린트 방향 후보를 같이 정리해줘:

A. Chapter 1-2 시각화 추가 — 3-way merge vs rebase / GitHub Actions 파이프라인 / reset·revert·restore 비교 중 선택
B. curriculum 본문 1원고 집필 — Section 설명을 책 수준 본문으로 확장 (Part 단위 분할)
C. 실전 프로젝트 예제 추가 — "팀 협업 워크플로우 템플릿" (브랜치 전략 + PR 템플릿 + CODEOWNERS + Actions)

독자 타겟은 [Git 처음 쓰는 입문자 / 개인 작업 주니어 → 팀 협업 전환자 / CI/CD까지 빨리 가야 하는 실무자] 중 무엇으로?
```

## 방향별 참고

### A. Chapter 1-2 시각화 후보
- **3-way merge vs rebase** — 같은 분기점에서 두 브랜치를 합칠 때 커밋 그래프가 어떻게 달라지는지
- **GitHub Actions 워크플로우 파이프라인** — push 이벤트 → 워크플로우 트리거 → job 병렬/직렬 → step 순서 → 아티팩트 업로드
- **reset / revert / restore 비교** — HEAD 이동, 새 커밋 생성, 파일 복원의 차이를 커밋 그래프로

### B. curriculum 본문 집필 시 주의
- Part별 3분할 위임
- Part I 비유("파일 이름에 _v2 붙이는 혼돈")를 초반에 강하게

### C. 실전 프로젝트 후보
- 팀 협업 템플릿 (GitHub Flow + PR/Issue 템플릿 + CODEOWNERS + Actions)
- Conventional Commits + 자동 CHANGELOG 생성 파이프라인
