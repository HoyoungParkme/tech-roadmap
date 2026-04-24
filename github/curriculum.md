# Git & GitHub 사다리형 학습 커리큘럼

> 버전 관리의 필요성부터 GitHub Actions CI/CD까지, 한 권으로 올라가는 Git & GitHub 학습 자료.

---

## 이 자료가 만들어진 이유

이 자료는 Git 공식 문서나 두꺼운 기술서와 다르게 **"아는 만큼 읽고, 필요한 만큼만 깊이 들어가도 되는"** 사다리형 구조로 짜여 있다. 컴퓨터 파일을 직접 복사해서 `report_v2_최종_진짜최종.docx` 같은 파일을 만들어본 적 있는 분이라면 Part I부터 읽어도 막히지 않게 만들었다. 동시에 Git은 알지만 협업 워크플로우와 CI/CD를 체계적으로 정리하고 싶은 주니어에게도 Part IV 이후가 즉시 참고 자료가 된다.

전체 구성은 **설계도(상세 목차) + 인터랙티브 시각화**다. Part IV Chapter 1에는 `index.html`과 같은 **단계별 애니메이션 시각화**가 짝을 이뤄, 글 대신 움직이는 그림으로 Git 변경사항의 흐름을 체득할 수 있다.

---

## 읽기 가이드

### 난이도 범례

| 표기 | 독자 | 설명 |
|:--|:--|:--|
| **★☆☆** | 비개발자 | 파일 복사·이동 경험만 있음. 터미널 처음 접함 |
| **★★☆** | 코딩 입문 | 터미널 기본 명령어(cd/ls/mkdir)를 써본 적 있음 |
| **★★★** | 주니어 | Python/JS 등 언어 경험, 팀 프로젝트 투입 준비 |

### 독자별 추천 경로

- **Git이 처음인 분** → Part I → Part II → Part III → Part IV
- **Git 기본은 알지만 협업이 서툰 분** → Part IV → Part V → Part VI
- **팀 협업 + 자동화까지 갖추고 싶은 분** → Part V → Part VI → Part VII

### Section 양식 (공통)

각 Section은 아래 7개 필드를 갖는다.

- **난이도**: ★☆☆ / ★★☆ / ★★★
- **선수 지식**: 먼저 읽어두면 좋은 이전 Section
- **학습 목표**: "이 Section을 마치면 ...할 수 있다"
- **설명**: 3~5줄 핵심 요약 (비유 중심, 한국어(영어) 병기)
- **핵심 키워드**: 이 Section의 기억해둘 개념 목록
- **시각화 연결**: 관련 `index.html` 시각화 또는 향후 구현 예정
- **다음 섹션**: 다음 번호

### 번호 규칙

`Part-Chapter-Section` (예: `IV-1-1` = Part IV, Chapter 1, Section 1).
`index.html`의 Git 변경사항 여행 시각화는 이 커리큘럼의 **IV-1-1**에 해당한다.

---

## 전체 목차

| Part | 제목 | 대상 난이도 | 시각화 |
|:--|:--|:--|:--|
| I | 왜 버전 관리인가 | ★☆☆ (비개발자) | ✅ |
| II | VCS 지도 — Git/SVN 비교 | ★☆☆~★★☆ | ✅ |
| III | 깃 첫 걸음 | ★☆☆~★★☆ (코딩 입문) | ✅ |
| IV | 브랜치·머지·리베이스 | ★★☆~★★★ | ✅ |
| V | PR·리뷰·Issue | ★★★ (주니어) | ✅ |
| VI | 실전 팀 워크플로우 | ★★☆~★★★ | ✅ |
| VII | CI/CD — GitHub Actions | ★★★ | ✅ |
| VIII | 태그·릴리즈·분석·디버깅 | ★★★ | — |
| IX | 보안·GitHub 서비스·고급 도구 | ★★☆~★★★ | — |
| 부록 | 용어집 / FAQ / 다음 공부 / 참고자료 | 공통 | — |

---

## Part I. 왜 버전 관리인가

> 코드가 아니라 "변화"를 관리한다는 발상이 왜 필요한지부터 이해한다.

### I-1-1. 파일 이름으로 버전 관리하던 시절

- **난이도**: ★☆☆
- **선수 지식**: 없음
- **학습 목표**: 파일 복사 기반 버전 관리의 문제점을 말할 수 있다
- **설명**: `report_최종.docx`, `report_최종2.docx`, `report_진짜최종.docx`... 이름으로 버전을 구분하던 방식은 파일이 10개를 넘어가면 어느 게 진짜 최신인지 아무도 모른다. 혼자 작업할 때는 그나마 버티지만, 두 명이 동시에 같은 파일을 수정하면 누군가의 작업이 덮어씌워진다. 이 Section은 버전 관리 도구가 없던 시절의 고통을 되짚어, "왜 Git이 필요한가"의 동기를 만든다.
- **핵심 키워드**: 버전 관리(Version Control), 덮어쓰기 충돌(Overwrite Conflict), 히스토리(History)
- **시각화 연결**: [visualizations/part-1.html](visualizations/part-1.html) — 파일 증식 애니메이션
- **다음 섹션**: I-1-2
- **본문**: [docs/book/part-1.md#i-1-1-파일-이름으로-버전-관리하던-시절](docs/book/part-1.md#i-1-1-파일-이름으로-버전-관리하던-시절)

### I-1-2. 버전 관리 시스템의 세 가지 약속

- **난이도**: ★☆☆
- **선수 지식**: I-1-1
- **학습 목표**: VCS가 제공하는 핵심 기능 3가지(히스토리/복원/협업)를 설명할 수 있다
- **설명**: 버전 관리 시스템(VCS, Version Control System)은 세 가지를 보장한다. 첫째, 모든 변경에 타임스탬프와 작성자를 붙인다(히스토리). 둘째, 실수로 지워도 특정 시점으로 되돌릴 수 있다(복원). 셋째, 두 사람이 동시에 작업해도 변경사항을 안전하게 합친다(협업). 이 세 가지가 소프트웨어 팀에서 VCS가 필수인 이유다.
- **핵심 키워드**: VCS(Version Control System), 히스토리(History), 롤백(Rollback), 병합(Merge)
- **시각화 연결**: [visualizations/part-1.html](visualizations/part-1.html) — 세 가지 기둥 애니메이션
- **다음 섹션**: I-1-3
- **본문**: [docs/book/part-1.md#i-1-2-버전-관리-시스템의-세-가지-약속](docs/book/part-1.md#i-1-2-버전-관리-시스템의-세-가지-약속)

### I-1-3. Git이 세상을 바꾼 이유 — 분산 저장소

- **난이도**: ★☆☆
- **선수 지식**: I-1-2
- **학습 목표**: 중앙집중형 VCS와 분산형 VCS의 차이를 비유로 설명할 수 있다
- **설명**: SVN 같은 중앙집중형 VCS는 서버 한 대가 모든 히스토리를 갖는다. 서버가 다운되면 작업을 기록할 방법이 없다. Git은 분산형(Distributed)이다. 모든 개발자의 로컬 컴퓨터가 전체 히스토리의 복사본을 가진다. 네트워크가 끊겨도 커밋하고, 브랜치를 만들고, 로그를 볼 수 있다. GitHub는 이 분산 저장소 중 "중앙 역할을 자처하는 원격 서버"일 뿐, 필수 요소가 아니다.
- **핵심 키워드**: 분산형 VCS(Distributed VCS), 중앙집중형(Centralized), 로컬 저장소(Local Repository)
- **시각화 연결**: [visualizations/part-1.html](visualizations/part-1.html) — 중앙 vs 분산 비교 애니메이션
- **다음 섹션**: I-2-1
- **본문**: [docs/book/part-1.md#i-1-3-git이-세상을-바꾼-이유--분산-저장소](docs/book/part-1.md#i-1-3-git이-세상을-바꾼-이유--분산-저장소)

### I-2-1. Git과 GitHub는 다르다

- **난이도**: ★☆☆
- **선수 지식**: I-1-3
- **학습 목표**: Git과 GitHub의 역할 차이를 정확히 구분해 설명할 수 있다
- **설명**: Git은 버전 관리 소프트웨어(도구)고, GitHub는 Git 저장소를 인터넷에 올려두는 웹 서비스(플랫폼)다. Git 없이 GitHub는 존재할 수 없지만, GitHub 없이 Git은 로컬에서 완전히 동작한다. GitLab이나 Bitbucket도 같은 원리의 플랫폼이다. GitHub의 진짜 가치는 "저장소 호스팅" 이상의 기능 — Pull Request, Issue, Actions, Pages — 에 있다.
- **핵심 키워드**: Git(도구), GitHub(플랫폼), 원격 저장소(Remote Repository), GitLab, Bitbucket
- **시각화 연결**: [visualizations/part-1.html](visualizations/part-1.html) — Git vs GitHub 관계도 애니메이션
- **다음 섹션**: II-1-1
- **본문**: [docs/book/part-1.md#i-2-1-git과-github는-다르다](docs/book/part-1.md#i-2-1-git과-github는-다르다)

---

## Part II. VCS 지도 — Git/SVN/Mercurial 비교

> Git을 선택하는 이유를 다른 도구들과 비교해 이해한다.

### II-1-1. 주요 VCS 한눈에 보기

- **난이도**: ★☆☆
- **선수 지식**: I-2-1
- **학습 목표**: Git, SVN, Mercurial의 핵심 차이를 표로 설명할 수 있다
- **설명**: 현재 업계에서 사용하는 VCS는 크게 셋이다. Git(분산형, 오픈소스, Linux 커널에서 시작), SVN(Apache Subversion, 중앙집중형, 기업 레거시에 여전히 존재), Mercurial(분산형, Python으로 작성, Git보다 단순한 명령어). 2024년 기준 GitHub·GitLab 생태계가 압도적이므로 Git을 배우는 것이 실질적인 선택이다.
- **핵심 키워드**: SVN(Subversion), Mercurial, 분산형(Distributed), 중앙집중형(Centralized)
- **시각화 연결**: [visualizations/part-2.html](visualizations/part-2.html) — VCS 비교 카드 애니메이션
- **다음 섹션**: II-1-2
- **본문**: [docs/book/part-2.md#ii-1-1-주요-vcs-한눈에-보기](docs/book/part-2.md#ii-1-1-주요-vcs-한눈에-보기)

### II-1-2. 왜 Git이 표준이 됐는가

- **난이도**: ★★☆
- **선수 지식**: II-1-1
- **학습 목표**: Git의 기술적 장점(스냅샷 모델, 브랜치 비용)을 설명할 수 있다
- **설명**: SVN은 파일의 "차이(delta)"를 저장한다. Git은 매 커밋마다 전체 파일 트리의 "스냅샷(snapshot)"을 저장한다. 변경되지 않은 파일은 이전 스냅샷 포인터만 저장하므로 공간 낭비가 없다. 브랜치는 단순히 커밋을 가리키는 포인터라서 생성·삭제 비용이 사실상 0에 가깝다. 이 구조가 Git을 빠르고 유연하게 만든 핵심이다.
- **핵심 키워드**: 스냅샷(Snapshot), 델타(Delta), SHA-1 해시, 포인터(Pointer)
- **시각화 연결**: [visualizations/part-2.html](visualizations/part-2.html) — 스냅샷 vs 델타 비교 애니메이션
- **다음 섹션**: II-2-1
- **본문**: [docs/book/part-2.md#ii-1-2-왜-git이-표준이-됐는가](docs/book/part-2.md#ii-1-2-왜-git이-표준이-됐는가)

### II-2-1. GitHub vs GitLab vs Bitbucket

- **난이도**: ★★☆
- **선수 지식**: II-1-2
- **학습 목표**: 세 플랫폼의 주요 차이와 선택 기준을 설명할 수 있다
- **설명**: GitHub는 오픈소스 생태계의 사실상 표준이다. 공개 저장소 무제한 무료, Actions로 CI/CD 내장, Copilot AI 통합이 강점이다. GitLab은 Self-hosted(직접 서버에 설치)가 가능해 보안이 중요한 기업에서 선호한다. Bitbucket은 Atlassian 제품군(Jira, Confluence)과 연동이 뛰어나다. 취업 준비 중이라면 GitHub 포트폴리오가 가장 범용적이다.
- **핵심 키워드**: GitHub, GitLab, Bitbucket, Self-hosted, CI/CD 내장
- **시각화 연결**: [visualizations/part-2.html](visualizations/part-2.html) — 플랫폼 비교 애니메이션
- **다음 섹션**: III-0-1
- **본문**: [docs/book/part-2.md#ii-2-1-github-vs-gitlab-vs-bitbucket](docs/book/part-2.md#ii-2-1-github-vs-gitlab-vs-bitbucket)

---

## Part III. 깃 첫 걸음

> 터미널을 열고 첫 저장소를 만들어 실제로 손을 움직인다.

### III-0-1. Git GUI 클라이언트 소개 — GitHub Desktop, SourceTree, VS Code

- **난이도**: ★☆☆
- **선수 지식**: II-2-1
- **학습 목표**: 대표적인 Git GUI 클라이언트 3종의 특징을 비교하고, 자신에게 맞는 도구를 선택할 수 있다
- **설명**: 터미널이 익숙하지 않다면 GUI(Graphical User Interface) 클라이언트로 Git을 시작해도 된다. **GitHub Desktop**은 GitHub 공식 앱으로 PR 생성까지 한 번에 처리된다. **SourceTree**는 Atlassian이 만든 무료 앱으로 브랜치 그래프가 직관적이다. **VS Code**는 에디터에 Git 기능이 내장되어 코드 수정과 커밋을 한 화면에서 한다. CLI를 완전히 대체하지는 못하지만, 첫 학습 진입 장벽을 크게 낮춰준다.
- **핵심 키워드**: GUI 클라이언트, GitHub Desktop, SourceTree, VS Code Git, CLI vs GUI
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — GUI 클라이언트 비교 카드
- **다음 섹션**: III-0-2
- **본문**: [docs/book/part-3.md#iii-0-1-git-gui-클라이언트-소개](docs/book/part-3.md#iii-0-1-git-gui-클라이언트-소개)

### III-0-2. Windows에서 Git 설치하기

- **난이도**: ★☆☆
- **선수 지식**: III-0-1
- **학습 목표**: Windows에서 Git을 설치하고, Git Bash와 PowerShell 중 어디서 실행할지 선택할 수 있다
- **설명**: Windows는 https://git-scm.com/download/win 에서 설치 파일을 받는다. 설치 과정에서 "기본 에디터 선택", "PATH 환경변수 설정", "줄바꿈 처리(CRLF vs LF)" 등 옵션이 나온다. 대부분 기본값으로 진행하면 되지만, 에디터는 VS Code로 바꾸는 것을 권장한다. 설치가 끝나면 Git Bash(Unix 명령어 지원)와 PowerShell 두 곳에서 Git을 사용할 수 있다. `git --version`으로 설치를 확인한다.
- **핵심 키워드**: Git for Windows, Git Bash, PATH, CRLF, LF, 줄바꿈 설정
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — Windows 설치 단계 시뮬레이션
- **다음 섹션**: III-0-3
- **본문**: [docs/book/part-3.md#iii-0-2-windows에서-git-설치하기](docs/book/part-3.md#iii-0-2-windows에서-git-설치하기)

### III-0-3. macOS/Linux에서 Git 설치하기

- **난이도**: ★☆☆
- **선수 지식**: III-0-1
- **학습 목표**: macOS와 Linux에서 Git을 설치하고 버전을 확인할 수 있다
- **설명**: macOS는 터미널에서 `git`을 처음 실행하면 Xcode Command Line Tools 설치를 제안한다. 또는 Homebrew(`brew install git`)로 최신 버전을 설치할 수 있다. Linux(Ubuntu/Debian)는 `sudo apt install git`, Fedora는 `sudo dnf install git`으로 설치한다. macOS와 Linux는 기본 터미널(Terminal.app, bash/zsh)에서 바로 Git을 사용한다. Windows와 달리 줄바꿈 설정은 보통 신경 쓰지 않아도 된다.
- **핵심 키워드**: Homebrew, Xcode Command Line Tools, apt, dnf, 터미널
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — macOS/Linux 설치 시뮬레이션
- **다음 섹션**: III-1-1
- **본문**: [docs/book/part-3.md#iii-0-3-macoslinux에서-git-설치하기](docs/book/part-3.md#iii-0-3-macoslinux에서-git-설치하기)

### III-1-1. Git 설치와 초기 설정

- **난이도**: ★★☆
- **선수 지식**: Part II (개념), 터미널 기본
- **학습 목표**: git config로 사용자 이름과 이메일을 설정하고, git --version으로 설치를 확인할 수 있다
- **설명**: Git은 https://git-scm.com 에서 다운로드한다. 설치 후 반드시 사용자 정보를 등록해야 커밋 작성자가 기록된다(`git config --global user.name`, `git config --global user.email`). `--global` 옵션은 이 컴퓨터의 모든 저장소에 적용된다. 특정 프로젝트에만 다른 이메일을 쓰고 싶으면 `--local` 옵션을 쓴다.
- **핵심 키워드**: git config, --global, --local, user.name, user.email
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — Git 설치·설정 터미널 시뮬레이션
- **다음 섹션**: III-1-2
- **본문**: [docs/book/part-3.md#iii-1-1-git-설치와-초기-설정](docs/book/part-3.md#iii-1-1-git-설치와-초기-설정)

### III-1-2. 첫 저장소 만들기 — git init

- **난이도**: ★★☆
- **선수 지식**: III-1-1
- **학습 목표**: git init으로 새 저장소를 생성하고 .git 폴더의 역할을 설명할 수 있다
- **설명**: `git init`을 실행하면 현재 폴더에 `.git` 숨김 폴더가 생긴다. 이 폴더가 Git 데이터베이스다. 모든 커밋 히스토리, 브랜치 정보, 설정이 여기에 들어간다. `.git`을 삭제하면 Git 히스토리가 전부 사라진다(파일 자체는 유지). `git clone`은 원격 저장소를 로컬로 복사할 때 쓴다 — 내부적으로 `git init` + 다운로드를 함께 수행한다.
- **핵심 키워드**: git init, git clone, .git 폴더, 저장소(Repository)
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — git init 터미널 시뮬레이션
- **다음 섹션**: III-1-3
- **본문**: [docs/book/part-3.md#iii-1-2-첫-저장소-만들기--git-init](docs/book/part-3.md#iii-1-2-첫-저장소-만들기--git-init)

### III-1-3. 파일 추가와 첫 커밋

- **난이도**: ★★☆
- **선수 지식**: III-1-2
- **학습 목표**: git add → git commit 흐름을 실행하고, git log로 히스토리를 확인할 수 있다
- **설명**: 파일을 만들거나 수정한 뒤 `git add <파일>` 또는 `git add .`(전체)로 Staging Area에 올린다. 그다음 `git commit -m "메시지"`로 로컬 히스토리에 영구 기록한다. 커밋 메시지는 "무엇을 했는가"를 한 줄로 써야 나중에 히스토리를 읽기 쉽다. `git log`로 커밋 SHA, 작성자, 날짜, 메시지를 확인한다.
- **핵심 키워드**: git add, git commit, git log, Staging Area, 커밋 메시지
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — git add/commit/log 터미널 시뮬레이션
- **다음 섹션**: III-2-1
- **본문**: [docs/book/part-3.md#iii-1-3-파일-추가와-첫-커밋](docs/book/part-3.md#iii-1-3-파일-추가와-첫-커밋)

### III-2-1. 현재 상태 파악 — git status와 git diff

- **난이도**: ★★☆
- **선수 지식**: III-1-3
- **학습 목표**: git status로 변경된 파일 목록을, git diff로 실제 변경 내용을 확인할 수 있다
- **설명**: `git status`는 Working Directory와 Staging Area의 현재 상태를 보여준다. 빨간색은 "추적됐지만 아직 스테이지에 없음", 초록색은 "스테이지에 올라감"이다. `git diff`는 Working Directory의 내용과 마지막 커밋을 줄 단위로 비교해 보여준다. `-` 는 삭제된 줄, `+`는 추가된 줄이다. 커밋 전 항상 diff를 확인하는 습관을 들이면 실수가 줄어든다.
- **핵심 키워드**: git status, git diff, Untracked, Modified, Staged
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — git status/diff 터미널 시뮬레이션
- **다음 섹션**: III-2-2
- **본문**: [docs/book/part-3.md#iii-2-1-현재-상태-파악--git-status와-git-diff](docs/book/part-3.md#iii-2-1-현재-상태-파악--git-status와-git-diff)

### III-2-2. 실수 되돌리기 — restore와 reset

- **난이도**: ★★☆
- **선수 지식**: III-2-1
- **학습 목표**: git restore로 Working Directory 변경을 취소하고, git reset으로 스테이지를 되돌릴 수 있다
- **설명**: 파일을 수정했다가 취소하고 싶을 때 `git restore <파일>`을 쓴다(마지막 커밋 상태로 복원). 스테이지에 올렸다가 내리고 싶을 때는 `git restore --staged <파일>`을 쓴다. `git reset --soft HEAD~1`은 마지막 커밋을 취소하고 변경사항을 Staging Area에 유지한다. `--hard`는 변경사항까지 전부 삭제하므로 주의가 필요하다.
- **핵심 키워드**: git restore, git reset, HEAD, --soft, --hard
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — restore/reset 터미널 시뮬레이션
- **다음 섹션**: III-3-1
- **본문**: [docs/book/part-3.md#iii-2-2-실수-되돌리기--restore와-reset](docs/book/part-3.md#iii-2-2-실수-되돌리기--restore와-reset)

### III-3-1. .gitignore — Git에게 무시할 파일을 알려주기

- **난이도**: ★★☆
- **선수 지식**: III-1-3
- **학습 목표**: .gitignore 파일을 작성해 비밀 키, 빌드 산출물, OS 파일을 추적에서 제외할 수 있다
- **설명**: `.env`(환경 변수), `node_modules/`(npm 패키지), `__pycache__/`(Python 캐시), `.DS_Store`(macOS 시스템 파일) 같은 파일은 Git으로 추적하면 안 된다. `.gitignore` 파일에 패턴을 적으면 Git이 해당 파일을 완전히 무시한다. `gitignore.io` 사이트에서 프레임워크별 `.gitignore` 템플릿을 생성할 수 있다.
- **핵심 키워드**: .gitignore, 와일드카드 패턴, .env, node_modules, gitignore.io
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — .gitignore 터미널 시뮬레이션
- **다음 섹션**: III-3-2
- **본문**: [docs/book/part-3.md#iii-3-1-gitignore--git에게-무시할-파일을-알려주기](docs/book/part-3.md#iii-3-1-gitignore--git에게-무시할-파일을-알려주기)

### III-3-2. 원격 저장소 연결 — git remote

- **난이도**: ★★☆
- **선수 지식**: III-3-1
- **학습 목표**: git remote add origin으로 원격 저장소를 연결하고, git push/pull로 동기화할 수 있다
- **설명**: GitHub에 빈 저장소를 만든 뒤 `git remote add origin <URL>`로 로컬 저장소에 원격 주소를 등록한다. `origin`은 관례적인 원격 저장소 이름이다. `git push -u origin main`으로 첫 번째 푸시를 하면 이후에는 `git push`만으로 동기화된다. `git pull`은 원격의 최신 변경사항을 로컬로 가져온다(fetch + merge 조합).
- **핵심 키워드**: git remote, origin, git push, git pull, HTTPS, SSH
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — git remote/push/pull 터미널 시뮬레이션
- **다음 섹션**: III-4-1
- **본문**: [docs/book/part-3.md#iii-3-2-원격-저장소-연결--git-remote](docs/book/part-3.md#iii-3-2-원격-저장소-연결--git-remote)

### III-4-1. GUI로 add·commit·push 따라하기

- **난이도**: ★☆☆
- **선수 지식**: III-3-2, III-0-1
- **학습 목표**: GitHub Desktop 또는 VS Code에서 파일 스테이징, 커밋, 푸시를 GUI로 수행할 수 있다
- **설명**: Part III에서 배운 `git add`, `git commit`, `git push`를 GUI로 똑같이 해본다. GitHub Desktop에서는 왼쪽 패널에서 변경 파일을 체크하고(= `git add`), 하단에 메시지를 적고 "Commit to main" 버튼을 클릭하고(= `git commit`), "Push origin" 버튼을 누른다(= `git push`). VS Code에서는 Source Control 패널(Ctrl+Shift+G)에서 같은 과정을 수행한다. CLI와 GUI 모두 뒤에서 같은 Git 명령을 실행한다는 점을 이해하는 것이 핵심이다.
- **핵심 키워드**: GitHub Desktop 커밋, VS Code Source Control, GUI 스테이징, CLI와 GUI 동일성
- **시각화 연결**: [visualizations/part-3.html](visualizations/part-3.html) — GUI add/commit/push 시뮬레이션
- **다음 섹션**: IV-1-1
- **본문**: [docs/book/part-3.md#iii-4-1-gui로-addcommitpush-따라하기](docs/book/part-3.md#iii-4-1-gui로-addcommitpush-따라하기)

---

## Part IV. 브랜치·머지·리베이스

> 병렬 작업의 핵심인 브랜치를 이해하고, 변경사항이 팀 코드베이스에 합쳐지는 전 과정을 체험한다.

### IV-1-1. Git 변경사항의 여행 — Working Directory에서 Merge까지

- **난이도**: ★★☆
- **선수 지식**: III-3-2
- **학습 목표**: 파일 수정부터 머지까지 6단계(Working → Staging → Local Repo → Remote → PR → Merge)를 순서대로 실행하고 설명할 수 있다
- **설명**: 코드 한 줄 바꾸는 것도 Git 안에서는 긴 여행을 떠난다. ① 텍스트 에디터로 파일 수정(Working Directory), ② `git add`로 스테이지에 올리기(Staging Area), ③ `git commit`으로 로컬 히스토리에 기록(Local Repository), ④ `git push`로 원격 전송(Remote), ⑤ PR 생성 후 팀원 리뷰(Pull Request), ⑥ 승인 후 main 브랜치에 통합(Merge). 각 단계가 명확히 분리되어 있어 실수를 되돌리기 쉽고, 팀원이 리뷰할 기회가 생긴다.
- **핵심 키워드**: Working Directory, Staging Area, Local Repository, Remote, Pull Request, Merge
- **시각화 연결**: [visualizations/part-4.html](visualizations/part-4.html) — 6단계 여행 애니메이션
- **다음 섹션**: IV-1-2
- **본문**: [docs/book/part-4.md#iv-1-1-git-변경사항의-여행](docs/book/part-4.md#iv-1-1-git-변경사항의-여행)

### IV-1-2. 브랜치란 무엇인가 — 포인터의 마법

- **난이도**: ★★☆
- **선수 지식**: IV-1-1
- **학습 목표**: 브랜치가 커밋 포인터임을 설명하고, git branch와 git checkout으로 브랜치를 다룰 수 있다
- **설명**: 브랜치(Branch)는 "특정 커밋을 가리키는 가벼운 포인터"다. 브랜치를 만들면 파일을 복사하는 게 아니라 포인터만 하나 추가된다. `git branch feature/login`으로 새 브랜치를 만들고 `git checkout feature/login`(또는 `git switch feature/login`)으로 이동한다. 현재 브랜치는 `HEAD`라는 특수 포인터가 가리킨다. 브랜치 생성과 전환을 한 번에 하려면 `git checkout -b feature/login`을 쓴다.
- **핵심 키워드**: Branch, HEAD, 포인터(Pointer), git branch, git checkout, git switch
- **시각화 연결**: [visualizations/part-4.html](visualizations/part-4.html) — 브랜치 포인터 애니메이션
- **다음 섹션**: IV-1-3
- **본문**: [docs/book/part-4.md#iv-1-2-브랜치란-무엇인가](docs/book/part-4.md#iv-1-2-브랜치란-무엇인가)

### IV-1-3. 브랜치 전략 — main·develop·feature

- **난이도**: ★★☆
- **선수 지식**: IV-1-2
- **학습 목표**: Git Flow, GitHub Flow 두 가지 브랜치 전략의 차이와 선택 기준을 설명할 수 있다
- **설명**: 브랜치를 아무렇게나 만들면 팀에서 혼란이 생긴다. Git Flow는 main(프로덕션), develop(통합), feature/*, release/*, hotfix/* 브랜치를 엄격히 구분한다 — 릴리스 주기가 긴 프로젝트에 적합하다. GitHub Flow는 main + feature/* 만 쓰는 단순한 방식으로, 웹 서비스처럼 자주 배포하는 팀에 맞다. 팀 규모와 배포 빈도를 고려해 전략을 선택한다.
- **핵심 키워드**: Git Flow, GitHub Flow, main, develop, feature, hotfix, 브랜치 전략
- **시각화 연결**: [visualizations/part-4.html](visualizations/part-4.html) — 브랜치 전략 비교
- **다음 섹션**: IV-2-1
- **본문**: [docs/book/part-4.md#iv-1-3-브랜치-전략](docs/book/part-4.md#iv-1-3-브랜치-전략)

### IV-2-1. 머지의 두 가지 방식 — Fast-forward와 3-way Merge

- **난이도**: ★★★
- **선수 지식**: IV-1-3
- **학습 목표**: Fast-forward Merge와 3-way Merge의 차이를 설명하고, 각 상황에서 어떤 방식이 선택되는지 판단할 수 있다
- **설명**: `git merge feature`를 실행하면 Git이 자동으로 방식을 선택한다. main이 분기 이후 새 커밋이 없으면 단순히 포인터를 앞으로 옮기는 Fast-forward Merge가 된다(히스토리가 선형 유지). 양쪽 브랜치에 각자 커밋이 있으면 공통 조상(base)을 찾아 세 버전을 비교하는 3-way Merge가 된다(Merge Commit 생성). `--no-ff` 옵션을 쓰면 Fast-forward 상황에서도 항상 Merge Commit을 만들어 브랜치 흔적을 남길 수 있다.
- **핵심 키워드**: Fast-forward, 3-way Merge, Merge Commit, 공통 조상(Base), --no-ff
- **시각화 연결**: [visualizations/part-4.html](visualizations/part-4.html) — FF vs 3-way Merge 비교
- **다음 섹션**: IV-2-2
- **본문**: [docs/book/part-4.md#iv-2-1-머지의-두-가지-방식](docs/book/part-4.md#iv-2-1-머지의-두-가지-방식)

### IV-2-2. 충돌 해결 — Conflict Resolution

- **난이도**: ★★★
- **선수 지식**: IV-2-1
- **학습 목표**: Merge Conflict 발생 원인을 파악하고, 충돌 마커를 직접 편집해 해결한 뒤 커밋할 수 있다
- **설명**: 두 브랜치가 같은 파일의 같은 줄을 다르게 수정했을 때 Git은 자동으로 합치지 못하고 Conflict(충돌)를 알린다. 파일 안에 `<<<<<<<`, `=======`, `>>>>>>>`로 나뉜 충돌 마커가 생긴다. 에디터(VS Code의 Merge Editor 등)에서 원하는 내용을 남기고 마커를 삭제한 뒤, `git add`와 `git commit`으로 충돌을 해결한다. 충돌은 나쁜 것이 아니라 Git이 "사람이 판단해야 한다"고 신호를 보내는 것이다.
- **핵심 키워드**: Conflict, 충돌 마커(Conflict Marker), Merge Editor, git add (충돌 해결 후)
- **시각화 연결**: [visualizations/part-4.html](visualizations/part-4.html) — 충돌 마커 해결 시뮬레이션
- **다음 섹션**: IV-3-1
- **본문**: [docs/book/part-4.md#iv-2-2-충돌-해결](docs/book/part-4.md#iv-2-2-충돌-해결)

### IV-3-1. 리베이스 — Rebase

- **난이도**: ★★★
- **선수 지식**: IV-2-2
- **학습 목표**: git rebase의 동작 원리를 설명하고, Merge와 Rebase의 트레이드오프를 비교할 수 있다
- **설명**: `git rebase main`은 현재 브랜치의 커밋들을 main의 최신 커밋 위로 "다시 붙인다(replay)". 결과적으로 히스토리가 일직선이 되어 `git log`가 보기 좋아진다. 하지만 커밋 SHA가 변경되므로, 이미 원격에 푸시된 브랜치에 rebase하면 팀원의 히스토리와 충돌이 생긴다. 원칙: **공유된 브랜치(main, develop)에는 rebase하지 않는다. 로컬 feature 브랜치에만 쓴다.**
- **핵심 키워드**: git rebase, replay, 선형 히스토리(Linear History), SHA 변경, Golden Rule of Rebase
- **시각화 연결**: [visualizations/part-4.html](visualizations/part-4.html) — 리베이스 전후 비교
- **다음 섹션**: IV-3-2
- **본문**: [docs/book/part-4.md#iv-3-1-리베이스](docs/book/part-4.md#iv-3-1-리베이스)

### IV-3-2. 체리픽 — 특정 커밋만 가져오기

- **난이도**: ★★★
- **선수 지식**: IV-3-1
- **학습 목표**: git cherry-pick으로 다른 브랜치의 특정 커밋만 현재 브랜치에 적용할 수 있다
- **설명**: `git cherry-pick <커밋 SHA>`는 브랜치 전체를 머지하지 않고 특정 커밋 하나만 현재 브랜치에 적용한다. 긴급 버그 픽스를 hotfix 브랜치에서 main에만 적용해야 할 때 유용하다. 남용하면 히스토리가 복잡해지므로, "브랜치 전체 머지가 불가능한 상황"에서만 쓴다.
- **핵심 키워드**: git cherry-pick, SHA, 선택적 적용, hotfix
- **시각화 연결**: [visualizations/part-4.html](visualizations/part-4.html) — 체리픽 시뮬레이션
- **다음 섹션**: IV-4-1
- **본문**: [docs/book/part-4.md#iv-3-2-체리픽](docs/book/part-4.md#iv-3-2-체리픽)

### IV-4-1. GUI로 브랜치·머지 따라하기

- **난이도**: ★★☆
- **선수 지식**: IV-3-2, III-4-1
- **학습 목표**: GitHub Desktop 또는 VS Code에서 브랜치 생성, 전환, 머지를 GUI로 수행할 수 있다
- **설명**: Part IV에서 배운 브랜치·머지를 GUI로 체험한다. GitHub Desktop 상단 "Current Branch" 드롭다운에서 "New Branch"를 클릭하면 `git checkout -b`와 동일하다. 브랜치를 전환하고, 파일을 수정·커밋한 뒤, "Choose a branch to merge into [현재 브랜치]"로 머지한다. 충돌이 발생하면 에디터에서 충돌 마커를 직접 해결하라는 안내가 뜬다. VS Code에서는 하단 상태 바의 브랜치 이름을 클릭해 전환하고, Command Palette(Ctrl+Shift+P)에서 "Git: Merge Branch"를 실행한다.
- **핵심 키워드**: GitHub Desktop 브랜치, VS Code 브랜치 전환, GUI 머지, GUI 충돌 해결
- **시각화 연결**: [visualizations/part-4.html](visualizations/part-4.html) — GUI 브랜치·머지 시뮬레이션
- **다음 섹션**: V-1-1
- **본문**: [docs/book/part-4.md#iv-4-1-gui로-브랜치머지-따라하기](docs/book/part-4.md#iv-4-1-gui로-브랜치머지-따라하기)

---

## Part V. PR·리뷰·Issue

> 코드 품질의 게이트, Pull Request와 팀 협업 도구를 마스터한다.

### V-1-1. Pull Request의 역할과 구조

- **난이도**: ★★★
- **선수 지식**: IV-1-1
- **학습 목표**: PR이 코드 리뷰와 CI 통합 지점으로서 어떤 역할을 하는지 설명할 수 있다
- **설명**: Pull Request(PR)는 "내 브랜치의 변경사항을 main에 통합해달라"는 공식 요청이다. PR을 열면 팀원이 코드를 줄 단위로 댓글을 달고, 변경을 요청하거나 승인한다. GitHub Actions 같은 CI가 연결되어 있으면 PR이 열리는 순간 자동으로 테스트가 실행된다. PR이 통과되고 리뷰어가 Approve하면 비로소 Merge 버튼이 활성화된다.
- **핵심 키워드**: Pull Request, Code Review, Approve, Request Changes, CI 체크
- **시각화 연결**: [visualizations/part-5.html](visualizations/part-5.html) — PR 워크플로우 애니메이션
- **다음 섹션**: V-1-2
- **본문**: [docs/book/part-5.md#v-1-1-pull-request의-역할과-구조](docs/book/part-5.md#v-1-1-pull-request의-역할과-구조)

### V-1-2. 좋은 PR 작성법

- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: 리뷰어가 이해하기 쉬운 PR 설명과 작은 단위 PR의 장점을 실천할 수 있다
- **설명**: 좋은 PR은 작다. 500줄 이상의 PR은 리뷰어가 집중력을 잃어 버그를 놓치기 쉽다. PR 설명(Description)에는 "무엇을 왜 바꿨는지", "어떻게 테스트했는지", "리뷰어가 특히 봐야 할 부분"을 적는다. PR 템플릿을 `.github/pull_request_template.md`에 저장하면 팀 전체가 동일한 양식을 쓰게 된다. 스크린샷이나 GIF를 첨부하면 UI 변경 사항 리뷰 효율이 크게 오른다.
- **핵심 키워드**: PR 크기(PR Size), pull_request_template.md, 설명(Description), 스크린샷
- **시각화 연결**: [visualizations/part-5.html](visualizations/part-5.html) — 좋은 PR 팁 카드
- **다음 섹션**: V-2-1
- **본문**: [docs/book/part-5.md#v-1-2-좋은-pr-작성법](docs/book/part-5.md#v-1-2-좋은-pr-작성법)

### V-2-1. 코드 리뷰 — 작성자와 리뷰어의 에티켓

- **난이도**: ★★★
- **선수 지식**: V-1-2
- **학습 목표**: GitHub 리뷰 도구(댓글, Suggestion, Approve)를 사용하고, 건설적 리뷰 피드백을 작성할 수 있다
- **설명**: 리뷰어는 코드에 집중하고 사람을 비난하지 않는다. "이 함수는 길다"보다 "이 함수를 두 개로 나누면 테스트하기 쉬울 것 같아요"처럼 대안을 제시한다. GitHub의 Suggestion 기능을 쓰면 리뷰어가 직접 코드를 제안하고 작성자가 클릭 한 번으로 적용할 수 있다. 작성자는 리뷰 댓글마다 Resolve(해결)나 답글로 응답하며 대화를 완성한다.
- **핵심 키워드**: Suggestion, Resolve, Line Comment, Nitpick, nit
- **시각화 연결**: [visualizations/part-5.html](visualizations/part-5.html) — 리뷰 에티켓 시뮬레이션
- **다음 섹션**: V-2-2
- **본문**: [docs/book/part-5.md#v-2-1-코드-리뷰](docs/book/part-5.md#v-2-1-코드-리뷰)

### V-2-2. GitHub Issue — 버그, 기능 요청, 작업 추적

- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: Issue를 생성하고, 레이블·담당자·마일스톤을 설정해 프로젝트를 추적할 수 있다
- **설명**: Issue는 GitHub에서 작업 단위를 추적하는 도구다. 버그 리포트, 새 기능 요청, 기술 부채 기록 모두 Issue로 관리한다. `Fixes #42`를 PR 설명에 쓰면 해당 PR이 머지될 때 Issue #42가 자동으로 닫힌다. 레이블(bug, enhancement, documentation)과 마일스톤(v1.0)을 붙이면 로드맵 관리가 쉬워진다. GitHub Projects(칸반 보드)와 연동하면 이슈를 시각적으로 관리할 수 있다.
- **핵심 키워드**: Issue, Label, Milestone, Fixes #N, GitHub Projects, 칸반(Kanban)
- **시각화 연결**: [visualizations/part-5.html](visualizations/part-5.html) — Issue 관리 애니메이션
- **다음 섹션**: V-3-1
- **본문**: [docs/book/part-5.md#v-2-2-github-issue](docs/book/part-5.md#v-2-2-github-issue)

### V-3-1. Branch Protection — main 브랜치 보호 규칙

- **난이도**: ★★★
- **선수 지식**: V-2-2
- **학습 목표**: Branch Protection Rules를 설정해 직접 push와 CI 미통과 PR 머지를 차단할 수 있다
- **설명**: 아무나 main에 직접 `git push`하면 코드 품질 보장이 불가능하다. GitHub 저장소 Settings → Branches → Branch protection rules에서 규칙을 설정한다. "Require a pull request before merging", "Require status checks to pass"를 활성화하면 PR + CI 통과 없이는 main 머지가 불가능해진다. 팀 규모가 커질수록 이 설정이 코드 품질의 첫 번째 방어선이 된다.
- **핵심 키워드**: Branch Protection, Status Check, Required Review, Merge 제한
- **시각화 연결**: [visualizations/part-5.html](visualizations/part-5.html) — Branch Protection 규칙 시뮬레이션
- **다음 섹션**: VI-1-1
- **본문**: [docs/book/part-5.md#v-3-1-branch-protection](docs/book/part-5.md#v-3-1-branch-protection)

---

## Part VI. 실전 팀 워크플로우

> 개인 학습에서 팀 협업으로 전환하는 실전 패턴과 트러블슈팅.

### VI-1-1. Fork & Pull Request — 오픈소스 기여 워크플로우

- **난이도**: ★★★
- **선수 지식**: V-1-1
- **학습 목표**: Fork → Clone → 수정 → PR 과정을 따라 오픈소스 프로젝트에 기여할 수 있다
- **설명**: 외부 저장소에 직접 push 권한이 없을 때는 Fork(내 계정에 복사)를 먼저 한다. Fork한 저장소를 로컬에 Clone하고 feature 브랜치에서 수정한 뒤, 원본 저장소로 PR을 보낸다. 원본 저장소(upstream)에서 최신 변경사항을 가져오려면 `git remote add upstream <원본 URL>`을 등록하고 `git pull upstream main`을 쓴다.
- **핵심 키워드**: Fork, upstream, origin, 오픈소스 기여(Contribution), git remote
- **시각화 연결**: [visualizations/part-6.html](visualizations/part-6.html) — Fork & PR 워크플로우
- **다음 섹션**: VI-1-2
- **본문**: [docs/book/part-6.md#vi-1-1-fork--pull-request](docs/book/part-6.md#vi-1-1-fork--pull-request)

### VI-1-2. Squash Merge와 히스토리 관리

- **난이도**: ★★★
- **선수 지식**: VI-1-1
- **학습 목표**: Squash Merge, Rebase Merge, Merge Commit 세 가지 PR 머지 방식의 차이와 팀 규칙을 설명할 수 있다
- **설명**: GitHub PR 머지 방식은 세 가지다. **Create a merge commit** — 모든 feature 커밋과 Merge Commit이 기록된다(히스토리 완전 보존). **Squash and merge** — feature 브랜치의 여러 커밋을 하나로 합쳐 main에 커밋한다(main 히스토리 깔끔). **Rebase and merge** — feature 커밋을 선형으로 main에 붙인다(Merge Commit 없음, 선형 히스토리). 팀 전체가 같은 방식을 쓰기로 합의하는 게 중요하다.
- **핵심 키워드**: Squash Merge, Rebase Merge, Merge Commit, 히스토리 전략
- **시각화 연결**: [visualizations/part-6.html](visualizations/part-6.html) — Squash Merge 비교
- **다음 섹션**: VI-2-1
- **본문**: [docs/book/part-6.md#vi-1-2-squash-merge와-히스토리-관리](docs/book/part-6.md#vi-1-2-squash-merge와-히스토리-관리)

### VI-2-1. 커밋 메시지 컨벤션 — Conventional Commits

- **난이도**: ★★★
- **선수 지식**: VI-1-2
- **학습 목표**: Conventional Commits 형식으로 커밋 메시지를 작성하고, 자동 CHANGELOG 생성의 원리를 설명할 수 있다
- **설명**: `feat: 로그인 기능 추가`, `fix: 토큰 만료 버그 수정`, `docs: README 갱신` — Conventional Commits는 커밋 메시지의 표준 형식이다. `type(scope): 설명` 구조를 따른다. 이 규칙을 따르면 release-please, semantic-release 같은 도구가 자동으로 버전을 올리고 CHANGELOG를 생성한다. Husky + commitlint를 쓰면 규칙에 맞지 않는 커밋을 git hook으로 자동 차단할 수 있다.
- **핵심 키워드**: Conventional Commits, feat/fix/docs/chore, semantic versioning, Husky, commitlint
- **시각화 연결**: [visualizations/part-6.html](visualizations/part-6.html) — Conventional Commits 형식
- **다음 섹션**: VI-2-2
- **본문**: [docs/book/part-6.md#vi-2-1-커밋-메시지-컨벤션](docs/book/part-6.md#vi-2-1-커밋-메시지-컨벤션)

### VI-2-2. Git Stash — 작업 임시 저장

- **난이도**: ★★☆
- **선수 지식**: VI-2-1
- **학습 목표**: git stash로 현재 작업을 임시 저장하고, 브랜치 전환 후 다시 꺼내 적용할 수 있다
- **설명**: 작업 도중 다른 브랜치로 급히 전환해야 할 때, 커밋하기엔 아직 이른 상태라면 `git stash`로 임시 저장한다. Stash는 작업 내용을 스택에 밀어 넣고(push) Working Directory를 마지막 커밋 상태로 돌린다. `git stash list`로 목록을 보고, `git stash pop`으로 다시 꺼낸다. 여러 stash가 있을 때는 `git stash apply stash@{2}` 같이 인덱스를 지정한다.
- **핵심 키워드**: git stash, stash pop, stash apply, stash list, 임시 저장
- **시각화 연결**: [visualizations/part-6.html](visualizations/part-6.html) — Git Stash 시뮬레이션
- **다음 섹션**: VI-3-1
- **본문**: [docs/book/part-6.md#vi-2-2-git-stash](docs/book/part-6.md#vi-2-2-git-stash)

### VI-3-1. 실전 트러블슈팅 — detached HEAD, 잘못된 push, 히스토리 수정

- **난이도**: ★★★
- **선수 지식**: VI-2-2
- **학습 목표**: detached HEAD 상태를 벗어나고, git revert로 안전하게 변경을 되돌릴 수 있다
- **설명**: `git checkout <SHA>`로 특정 커밋으로 이동하면 HEAD가 브랜치를 가리키지 않는 "detached HEAD" 상태가 된다. 여기서 커밋해도 브랜치가 없어 나중에 잃어버릴 수 있다. 빠져나오려면 `git checkout main`으로 돌아온다. 공유된 브랜치에 잘못 push했을 때는 `git revert <SHA>`로 새 커밋을 추가해 효과를 되돌린다(`git reset --hard` + 강제 push는 팀원 히스토리를 망가뜨리므로 금지). `git reflog`는 HEAD가 이동한 모든 기록을 보여줘 실수를 복구하는 마지막 수단이 된다.
- **핵심 키워드**: detached HEAD, git revert, git reflog, --force-with-lease, 강제 push 금지
- **시각화 연결**: [visualizations/part-6.html](visualizations/part-6.html) — 트러블슈팅 문제→해결
- **다음 섹션**: VI-4-1
- **본문**: [docs/book/part-6.md#vi-3-1-실전-트러블슈팅](docs/book/part-6.md#vi-3-1-실전-트러블슈팅)

### VI-4-1. git add -p — 부분 스테이징

- **난이도**: ★★★
- **선수 지식**: VI-2-2
- **학습 목표**: git add -p로 파일 내 특정 변경 블록(hunk)만 선택적으로 스테이징할 수 있다
- **설명**: 하나의 파일에 두 가지 변경사항이 섞여 있을 때(예: 버그 수정 + 새 기능 추가), `git add -p`(또는 `--patch`)를 쓰면 변경 블록(hunk) 단위로 "이건 스테이지에 올리고, 저건 아직 남겨둘래"를 선택할 수 있다. `y`(올림), `n`(건너뜀), `s`(더 잘게 나눔) 옵션을 활용한다. 이 기능 덕분에 하나의 파일 수정을 두 개의 의미 있는 커밋으로 분리할 수 있다. "커밋은 하나의 논리적 변경만 담는다" 원칙을 지키는 핵심 도구다.
- **핵심 키워드**: git add -p, --patch, hunk, 부분 스테이징, 커밋 원자성
- **시각화 연결**: [visualizations/part-6.html](visualizations/part-6.html) — git add -p 시뮬레이션
- **다음 섹션**: VI-4-2
- **본문**: [docs/book/part-6.md#vi-4-1-git-add--p](docs/book/part-6.md#vi-4-1-git-add--p)

### VI-4-2. git clean — 추적되지 않는 파일 정리

- **난이도**: ★★☆
- **선수 지식**: III-3-1
- **학습 목표**: git clean으로 추적되지 않는 파일과 디렉토리를 안전하게 삭제할 수 있다
- **설명**: 빌드 산출물, 임시 파일, 실험용 코드가 Working Directory에 쌓이면 `git status`가 지저분해진다. `.gitignore`에 없는 추적되지 않는(untracked) 파일을 한 번에 삭제하려면 `git clean`을 쓴다. `-n`(dry run)으로 먼저 뭘 지울지 확인하고, `-f`(force)로 실행한다. `-d` 옵션을 추가하면 빈 디렉토리도 함께 삭제한다. `-x`를 쓰면 `.gitignore`에 등록된 파일까지 삭제하므로 주의가 필요하다.
- **핵심 키워드**: git clean, -n(dry run), -f(force), -d(디렉토리), -x(gitignore 포함), untracked 파일
- **시각화 연결**: [visualizations/part-6.html](visualizations/part-6.html) — git clean 시뮬레이션
- **다음 섹션**: VII-1-1
- **본문**: [docs/book/part-6.md#vi-4-2-git-clean](docs/book/part-6.md#vi-4-2-git-clean)

---

## Part VII. CI/CD — GitHub Actions

> 코드 품질 자동화와 배포 파이프라인 구축. Git과 GitHub의 세 번째 축.

### VII-1-1. GitHub Actions란 무엇인가

- **난이도**: ★★★
- **선수 지식**: V-3-1
- **학습 목표**: GitHub Actions의 핵심 개념(Workflow, Job, Step, Runner)을 설명하고, 첫 번째 workflow YAML을 읽을 수 있다
- **설명**: GitHub Actions는 GitHub에 내장된 CI/CD(지속적 통합/배포) 플랫폼이다. `.github/workflows/` 폴더에 YAML 파일을 넣으면, push나 PR 같은 이벤트에 반응해 자동으로 작업을 실행한다. Workflow는 여러 Job으로 구성되고, 각 Job은 Runner(가상 머신) 위에서 Step을 순서대로 실행한다. 별도 서버 없이 GitHub이 제공하는 Runner를 무료로 사용할 수 있다.
- **핵심 키워드**: Workflow, Job, Step, Runner, YAML, .github/workflows
- **시각화 연결**: [visualizations/part-7.html](visualizations/part-7.html) — Actions 개념 계층 애니메이션
- **다음 섹션**: VII-1-2
- **본문**: [docs/book/part-7.md#vii-1-1-github-actions란-무엇인가](docs/book/part-7.md#vii-1-1-github-actions란-무엇인가)

### VII-1-2. 첫 번째 Workflow — 자동 테스트

- **난이도**: ★★★
- **선수 지식**: VII-1-1
- **학습 목표**: PR이 열릴 때 자동으로 pytest 또는 npm test를 실행하는 workflow YAML을 작성할 수 있다
- **설명**: `on: pull_request` 트리거를 쓰면 PR이 생성·업데이트될 때마다 자동으로 테스트가 실행된다. `uses: actions/checkout@v4`로 코드를 가져오고, `uses: actions/setup-python@v5`로 Python 환경을 설정하고, `run: pytest`로 테스트를 실행한다. 테스트가 실패하면 PR에 빨간 X가 표시되고, Branch Protection Rules와 연결하면 실패한 PR의 Merge를 자동으로 차단할 수 있다.
- **핵심 키워드**: on: pull_request, actions/checkout, actions/setup-python, pytest, npm test
- **시각화 연결**: [visualizations/part-7.html](visualizations/part-7.html) — Workflow YAML 시뮬레이션
- **다음 섹션**: VII-2-1
- **본문**: [docs/book/part-7.md#vii-1-2-첫-번째-workflow](docs/book/part-7.md#vii-1-2-첫-번째-workflow)

### VII-2-1. Actions 마켓플레이스와 재사용 가능한 Action

- **난이도**: ★★★
- **선수 지식**: VII-1-2
- **학습 목표**: Actions 마켓플레이스에서 검증된 Action을 찾아 workflow에 추가할 수 있다
- **설명**: GitHub Actions Marketplace(marketplace.github.com/actions)에는 수천 개의 오픈소스 Action이 있다. 직접 스크립트를 작성하지 않고 `uses: docker/login-action@v3` 같은 방식으로 불러다 쓴다. Action의 버전을 `@v3`처럼 태그로 고정하면 업스트림 변경으로 인한 파이프라인 브레이크를 방지할 수 있다. 자주 쓰는 조합은 Composite Action이나 Reusable Workflow로 패키징해 여러 저장소에서 공유한다.
- **핵심 키워드**: Marketplace, uses, Composite Action, Reusable Workflow, 버전 고정
- **시각화 연결**: [visualizations/part-7.html](visualizations/part-7.html) — 마켓플레이스 애니메이션
- **다음 섹션**: VII-2-2
- **본문**: [docs/book/part-7.md#vii-2-1-actions-마켓플레이스](docs/book/part-7.md#vii-2-1-actions-마켓플레이스)

### VII-2-2. 비밀 값 관리 — GitHub Secrets

- **난이도**: ★★★
- **선수 지식**: VII-2-1
- **학습 목표**: GitHub Secrets에 API 키를 저장하고, workflow에서 환경변수로 안전하게 참조할 수 있다
- **설명**: API 키, DB 비밀번호, 클라우드 자격증명은 절대 YAML에 직접 쓰면 안 된다. GitHub 저장소 Settings → Secrets and variables → Actions에서 Secret을 등록하면 workflow에서 `${{ secrets.MY_API_KEY }}`로 참조할 수 있다. Secret은 로그에 자동으로 마스킹(***) 처리되어 노출되지 않는다. 환경별로 다른 값을 쓰고 싶을 때는 Environment(staging, production)별로 Secret을 분리한다.
- **핵심 키워드**: GitHub Secrets, ${{ secrets.* }}, Environment, 마스킹(Masking), 자격증명
- **시각화 연결**: [visualizations/part-7.html](visualizations/part-7.html) — Secrets 관리 시뮬레이션
- **다음 섹션**: VII-3-1
- **본문**: [docs/book/part-7.md#vii-2-2-비밀-값-관리](docs/book/part-7.md#vii-2-2-비밀-값-관리)

### VII-3-1. 자동 배포 — main 머지 시 배포 트리거

- **난이도**: ★★★
- **선수 지식**: VII-2-2
- **학습 목표**: main 브랜치 push 이벤트에 반응해 서버에 자동 배포하는 workflow를 작성할 수 있다
- **설명**: `on: push: branches: [main]` 트리거를 쓰면 PR이 main에 머지될 때마다 자동으로 배포가 실행된다. 배포 방식은 대상에 따라 다르다 — GitHub Pages는 `actions/deploy-pages@v4`, AWS EC2는 SSH 접속 후 `docker pull && docker-compose up`, Cloud Run은 `google-github-actions/deploy-cloudrun@v2`를 사용한다. CD(지속적 배포)와 CD(지속적 전달)의 차이를 구분하고, 프로덕션 배포 전 staging 환경 검증 단계를 워크플로우에 포함시키는 것이 안전하다.
- **핵심 키워드**: on: push, CD(Continuous Deployment), 배포 트리거, staging, GitHub Pages, Cloud Run
- **시각화 연결**: [visualizations/part-7.html](visualizations/part-7.html) — 자동 배포 시뮬레이션
- **다음 섹션**: VII-3-2
- **본문**: [docs/book/part-7.md#vii-3-1-자동-배포](docs/book/part-7.md#vii-3-1-자동-배포)

### VII-3-2. 실전 CI/CD 파이프라인 설계

- **난이도**: ★★★
- **선수 지식**: VII-3-1
- **학습 목표**: Lint → Test → Build → Deploy 4단계 파이프라인을 Job 의존성(needs)을 활용해 YAML로 설계할 수 있다
- **설명**: 실무 파이프라인은 여러 Job을 순서대로 실행한다. `needs: [test]`를 쓰면 test Job이 성공해야만 deploy Job이 시작된다. 실패하면 이후 단계가 자동으로 취소된다. Job 사이에 `if: github.ref == 'refs/heads/main'` 조건을 붙이면 main 브랜치에서만 배포가 실행된다. 파이프라인 최적화 팁: 캐시(`actions/cache@v4`)로 의존성 설치 시간을 단축하고, 병렬로 실행 가능한 Job은 `needs` 없이 나란히 둔다.
- **핵심 키워드**: Job 의존성(needs), if 조건, actions/cache, Lint/Test/Build/Deploy, 파이프라인 최적화
- **시각화 연결**: [visualizations/part-7.html](visualizations/part-7.html) — 4단계 파이프라인 애니메이션
- **다음 섹션**: VIII-1-1
- **본문**: [docs/book/part-7.md#vii-3-2-실전-cicd-파이프라인-설계](docs/book/part-7.md#vii-3-2-실전-cicd-파이프라인-설계)

---

## Part VIII. 태그·릴리즈·분석·디버깅

> 버전 태그로 릴리즈를 관리하고, Git의 분석·디버깅 도구로 문제를 추적한다.

### VIII-1-1. 태그와 릴리즈 — 버전에 이름 붙이기

- **난이도**: ★★★
- **선수 지식**: IV-1-2
- **학습 목표**: Lightweight Tag와 Annotated Tag의 차이를 설명하고, 릴리즈 버전에 태그를 생성·푸시할 수 있다
- **설명**: 태그(Tag)는 특정 커밋에 붙이는 영구 레이블이다. 브랜치는 새 커밋이 생기면 자동으로 앞으로 이동하지만, 태그는 한번 만들면 움직이지 않는다. `git tag v1.0.0`은 이름만 붙이는 Lightweight Tag, `git tag -a v1.0.0 -m "첫 릴리즈"`는 작성자·날짜·메시지가 포함된 Annotated Tag다. 릴리즈에는 Annotated Tag를 쓴다. `git push origin v1.0.0`으로 원격에 푸시한다. Semantic Versioning(MAJOR.MINOR.PATCH) 규칙을 따르면 버전 번호만으로 변경 범위를 알 수 있다.
- **핵심 키워드**: git tag, Lightweight Tag, Annotated Tag, Semantic Versioning, git push --tags
- **시각화 연결**: [visualizations/part-8.html](visualizations/part-8.html) — 태그 생성·푸시 시뮬레이션
- **다음 섹션**: VIII-1-2
- **본문**: [docs/book/part-8.md#viii-1-1-태그와-릴리즈](docs/book/part-8.md#viii-1-1-태그와-릴리즈)

### VIII-1-2. GitHub Releases — 릴리즈 노트 작성

- **난이도**: ★★★
- **선수 지식**: VIII-1-1
- **학습 목표**: GitHub Releases 페이지에서 태그 기반 릴리즈를 생성하고 릴리즈 노트를 작성할 수 있다
- **설명**: GitHub의 Releases 기능은 태그에 릴리즈 노트·바이너리 파일·변경 목록을 첨부한다. 저장소 → Releases → "Draft a new release"에서 기존 태그를 선택하거나 새로 만든다. "Generate release notes" 버튼을 클릭하면 마지막 릴리즈 이후의 PR 목록이 자동으로 채워진다. `.github/release.yml` 파일로 카테고리(Features, Bug Fixes, Breaking Changes)를 커스터마이즈할 수 있다. 바이너리 빌드 파일이 있으면 Assets에 첨부한다.
- **핵심 키워드**: GitHub Releases, 릴리즈 노트, Generate release notes, release.yml, Assets
- **시각화 연결**: [visualizations/part-8.html](visualizations/part-8.html) — Releases 생성 시뮬레이션
- **다음 섹션**: VIII-2-1
- **본문**: [docs/book/part-8.md#viii-1-2-github-releases](docs/book/part-8.md#viii-1-2-github-releases)

### VIII-2-1. git log 고급 — 커밋 히스토리 분석

- **난이도**: ★★★
- **선수 지식**: III-1-3
- **학습 목표**: git log의 필터링·포맷팅 옵션으로 원하는 커밋만 추출하고, 히스토리를 그래프로 시각화할 수 있다
- **설명**: `git log`의 기본 출력은 길고 읽기 어렵다. `--oneline`은 SHA 7자리 + 메시지 한 줄로 압축한다. `--graph`는 브랜치 분기·합류를 ASCII 그래프로 보여준다. `--since="2024-01-01"`, `--author="홍길동"`, `--grep="fix"`로 특정 조건의 커밋만 필터링한다. `git log -- src/api/`처럼 경로를 지정하면 해당 디렉토리에 영향을 준 커밋만 추출한다. `--pretty=format:"%h %an %s"`로 출력 형식을 커스터마이즈한다.
- **핵심 키워드**: git log --oneline, --graph, --since, --author, --grep, --pretty=format
- **시각화 연결**: [visualizations/part-8.html](visualizations/part-8.html) — git log 옵션 시뮬레이션
- **다음 섹션**: VIII-2-2
- **본문**: [docs/book/part-8.md#viii-2-1-git-log-고급](docs/book/part-8.md#viii-2-1-git-log-고급)

### VIII-2-2. git blame — 줄 단위 작성자 추적

- **난이도**: ★★★
- **선수 지식**: VIII-2-1
- **학습 목표**: git blame으로 파일의 각 줄을 마지막으로 수정한 커밋과 작성자를 확인할 수 있다
- **설명**: `git blame <파일>`은 파일의 모든 줄에 대해 "이 줄을 마지막으로 변경한 커밋 SHA, 작성자, 날짜"를 보여준다. 버그가 발생한 줄을 찾았을 때, 누가 언제 왜 이렇게 바꿨는지 추적하는 핵심 도구다. `-L 10,20`으로 10~20번째 줄만 볼 수 있고, `-w`로 공백 변경을 무시할 수 있다. VS Code의 GitLens 확장 프로그램은 에디터에서 blame 정보를 줄마다 실시간으로 표시한다. blame의 목적은 범인 찾기가 아니라 "변경 맥락 이해"다.
- **핵심 키워드**: git blame, -L(줄 범위), -w(공백 무시), GitLens, 변경 맥락 추적
- **시각화 연결**: [visualizations/part-8.html](visualizations/part-8.html) — git blame 시뮬레이션
- **다음 섹션**: VIII-2-3
- **본문**: [docs/book/part-8.md#viii-2-2-git-blame](docs/book/part-8.md#viii-2-2-git-blame)

### VIII-2-3. git bisect — 이진 검색 디버깅

- **난이도**: ★★★
- **선수 지식**: VIII-2-2
- **학습 목표**: git bisect로 버그를 도입한 커밋을 이진 검색으로 효율적으로 찾을 수 있다
- **설명**: "1주일 전엔 잘 됐는데 지금은 버그가 있다"는 상황에서, 100개 커밋 중 문제를 만든 커밋을 하나씩 확인하면 시간이 너무 오래 걸린다. `git bisect start` → `git bisect bad`(현재 커밋이 버그 있음) → `git bisect good <SHA>`(이 커밋은 정상)을 입력하면, Git이 이진 검색으로 중간 커밋을 체크아웃한다. 테스트해서 `git bisect good` 또는 `bad`를 반복하면 log₂(100) ≈ 7번 만에 범인 커밋을 찾는다. `git bisect reset`으로 원래 브랜치로 돌아온다.
- **핵심 키워드**: git bisect, 이진 검색(Binary Search), bisect start/good/bad/reset, 회귀 버그
- **시각화 연결**: [visualizations/part-8.html](visualizations/part-8.html) — git bisect 이진 검색 시뮬레이션
- **다음 섹션**: IX-1-1
- **본문**: [docs/book/part-8.md#viii-2-3-git-bisect](docs/book/part-8.md#viii-2-3-git-bisect)

---

## Part IX. 보안·GitHub 서비스·고급 도구

> SSH/GPG로 보안을 강화하고, GitHub Pages·README·CLI·Hook·worktree로 개발 생산성을 높인다.

### IX-1-1. SSH 키 생성과 GitHub 등록

- **난이도**: ★★☆
- **선수 지식**: III-3-2
- **학습 목표**: SSH 키 쌍을 생성하고 GitHub에 등록해 비밀번호 없이 push/pull할 수 있다
- **설명**: HTTPS 방식은 push/pull 할 때마다 비밀번호(또는 Personal Access Token)를 입력해야 한다. SSH 방식은 공개 키를 GitHub에 등록해두면 이후 인증이 자동으로 처리된다. `ssh-keygen -t ed25519 -C "이메일"`로 키 쌍을 생성하고, `~/.ssh/id_ed25519.pub`의 내용을 GitHub → Settings → SSH and GPG keys에 붙여넣는다. `ssh -T git@github.com`으로 연결을 테스트한다. 여러 GitHub 계정을 쓸 때는 `~/.ssh/config` 파일로 호스트별 키를 분리한다.
- **핵심 키워드**: SSH, ed25519, ssh-keygen, ~/.ssh/config, Personal Access Token, HTTPS vs SSH
- **시각화 연결**: [visualizations/part-9.html](visualizations/part-9.html) — SSH 키 생성 시뮬레이션
- **다음 섹션**: IX-1-2
- **본문**: [docs/book/part-9.md#ix-1-1-ssh-키-생성과-github-등록](docs/book/part-9.md#ix-1-1-ssh-키-생성과-github-등록)

### IX-1-2. GPG 서명 — 커밋 인증

- **난이도**: ★★★
- **선수 지식**: IX-1-1
- **학습 목표**: GPG 키로 커밋에 서명하고, GitHub에서 "Verified" 배지가 표시되게 설정할 수 있다
- **설명**: `git config user.email`은 아무 값이나 넣을 수 있다. 즉, 다른 사람인 척 커밋할 수 있다는 뜻이다. GPG 서명은 "이 커밋은 정말 내가 작성했다"를 암호학적으로 증명한다. `gpg --gen-key`로 키를 만들고, `git config --global commit.gpgsign true`로 자동 서명을 활성화한다. GitHub에 GPG 공개 키를 등록하면, 서명된 커밋 옆에 초록색 "Verified" 배지가 붙는다. 오픈소스 프로젝트에서 메인테이너의 커밋 신뢰성을 보장하는 데 쓴다.
- **핵심 키워드**: GPG, gpg --gen-key, commit.gpgsign, Verified 배지, 커밋 인증
- **시각화 연결**: [visualizations/part-9.html](visualizations/part-9.html) — GPG 서명 시뮬레이션
- **다음 섹션**: IX-2-1
- **본문**: [docs/book/part-9.md#ix-1-2-gpg-서명](docs/book/part-9.md#ix-1-2-gpg-서명)

### IX-2-1. GitHub Pages — 무료 웹 호스팅

- **난이도**: ★★☆
- **선수 지식**: VII-1-1
- **학습 목표**: GitHub Pages를 활성화해 정적 웹사이트를 무료로 배포하고, 커스텀 도메인을 연결할 수 있다
- **설명**: GitHub Pages는 저장소의 정적 파일(HTML/CSS/JS)을 자동으로 웹사이트로 호스팅한다. Settings → Pages에서 소스 브랜치(보통 main 또는 gh-pages)와 폴더(/ 또는 /docs)를 선택하면 `https://[유저명].github.io/[저장소명]`으로 접근할 수 있다. Jekyll(Ruby 기반 정적 사이트 생성기)이 기본 내장되어 Markdown으로 블로그를 만들 수 있다. 포트폴리오, 프로젝트 문서, 개인 블로그 호스팅에 최적이다. 커스텀 도메인 연결도 무료로 지원한다.
- **핵심 키워드**: GitHub Pages, gh-pages 브랜치, Jekyll, 정적 사이트, 커스텀 도메인
- **시각화 연결**: [visualizations/part-9.html](visualizations/part-9.html) — Pages 설정 시뮬레이션
- **다음 섹션**: IX-2-2
- **본문**: [docs/book/part-9.md#ix-2-1-github-pages](docs/book/part-9.md#ix-2-1-github-pages)

### IX-2-2. README.md — 프로젝트의 얼굴

- **난이도**: ★★☆
- **선수 지식**: III-3-1
- **학습 목표**: 효과적인 README.md를 작성하고, 배지·스크린샷·설치 가이드를 포함시킬 수 있다
- **설명**: README.md는 저장소 방문자가 가장 먼저 보는 문서다. GitHub가 저장소 메인 페이지에 자동으로 렌더링한다. 좋은 README에는 프로젝트 이름, 한 줄 설명, 스크린샷, 설치 방법, 사용법, 기여 가이드, 라이선스가 들어간다. Shields.io 배지(`![Build](https://img.shields.io/...`)로 CI 상태, 라이선스, 버전 정보를 시각적으로 보여줄 수 있다. README가 잘 작성된 프로젝트는 Star와 기여자가 더 많이 모인다.
- **핵심 키워드**: README.md, Shields.io 배지, 설치 가이드, 기여 가이드(CONTRIBUTING.md), 라이선스
- **시각화 연결**: [visualizations/part-9.html](visualizations/part-9.html) — README 구조 시뮬레이션
- **다음 섹션**: IX-3-1
- **본문**: [docs/book/part-9.md#ix-2-2-readmemd](docs/book/part-9.md#ix-2-2-readmemd)

### IX-3-1. GitHub CLI (gh) — 터미널에서 GitHub 조작

- **난이도**: ★★★
- **선수 지식**: V-2-2
- **학습 목표**: gh CLI로 Issue 생성, PR 생성, 저장소 클론 등 GitHub 작업을 터미널에서 수행할 수 있다
- **설명**: GitHub CLI(`gh`)는 GitHub의 공식 커맨드라인 도구다. 브라우저를 열지 않고 터미널에서 `gh issue create`, `gh pr create`, `gh repo clone` 등을 실행할 수 있다. `gh auth login`으로 인증하면 `gh pr list`로 현재 저장소의 PR 목록을 보고, `gh pr checkout 42`로 PR #42의 브랜치를 로컬에 바로 체크아웃한다. `gh api`로 GitHub REST/GraphQL API를 직접 호출할 수도 있다. 자동화 스크립트에서 특히 강력하다.
- **핵심 키워드**: gh CLI, gh issue, gh pr, gh repo, gh auth login, gh api
- **시각화 연결**: [visualizations/part-9.html](visualizations/part-9.html) — gh CLI 시뮬레이션
- **다음 섹션**: IX-3-2
- **본문**: [docs/book/part-9.md#ix-3-1-github-cli](docs/book/part-9.md#ix-3-1-github-cli)

### IX-3-2. Git Hook — 커밋 전후 자동화

- **난이도**: ★★★
- **선수 지식**: VI-2-1
- **학습 목표**: pre-commit, commit-msg 훅을 설정해 커밋 전 lint와 메시지 형식 검사를 자동화할 수 있다
- **설명**: Git Hook은 커밋·푸시 등 Git 이벤트 전후에 자동 실행되는 스크립트다. `.git/hooks/` 폴더에 저장된다. `pre-commit` 훅은 커밋 직전에 실행되어 lint, 포맷팅, 테스트를 자동으로 돌린다. `commit-msg` 훅은 커밋 메시지가 Conventional Commits 형식인지 검사한다. Husky(npm 패키지)를 쓰면 `.husky/` 폴더에 훅을 저장소에 포함시켜 팀 전체가 같은 훅을 공유한다. pre-push 훅으로 push 전 테스트를 강제할 수도 있다.
- **핵심 키워드**: Git Hook, pre-commit, commit-msg, pre-push, Husky, .git/hooks
- **시각화 연결**: [visualizations/part-9.html](visualizations/part-9.html) — Hook 동작 시뮬레이션
- **다음 섹션**: IX-3-3
- **본문**: [docs/book/part-9.md#ix-3-2-git-hook](docs/book/part-9.md#ix-3-2-git-hook)

### IX-3-3. git worktree — 다중 작업 디렉토리

- **난이도**: ★★★
- **선수 지식**: IV-1-2
- **학습 목표**: git worktree로 하나의 저장소에서 여러 브랜치를 동시에 별도 디렉토리로 열어 작업할 수 있다
- **설명**: 브랜치를 전환하면 Working Directory의 파일이 바뀐다. 빌드 중이거나 서버가 실행 중인 상태에서 다른 브랜치를 봐야 할 때 곤란하다. `git worktree add ../hotfix hotfix/urgent`를 실행하면 같은 저장소의 `hotfix/urgent` 브랜치를 별도 폴더(`../hotfix`)에 체크아웃한다. 두 디렉토리가 같은 `.git` 데이터를 공유하므로 저장소를 따로 클론할 필요가 없다. 작업이 끝나면 `git worktree remove ../hotfix`로 정리한다.
- **핵심 키워드**: git worktree, worktree add, worktree remove, 다중 브랜치 동시 작업
- **시각화 연결**: [visualizations/part-9.html](visualizations/part-9.html) — worktree 시뮬레이션
- **다음 섹션**: 부록
- **본문**: [docs/book/part-9.md#ix-3-3-git-worktree](docs/book/part-9.md#ix-3-3-git-worktree)

---

## 부록

### 부록 A. 핵심 용어집

| 용어 | 한국어 설명 |
|:--|:--|
| Repository (저장소) | 프로젝트의 모든 파일과 히스토리를 담는 Git 데이터베이스 |
| Working Directory | 현재 파일이 존재하는 로컬 폴더. 수정 중인 내용이 있는 상태 |
| Staging Area (Index) | `git add` 후 커밋 대기 상태. 장바구니에 비유 |
| Commit | 특정 시점의 전체 파일 트리 스냅샷. SHA-1 해시로 식별 |
| Branch | 특정 커밋을 가리키는 가벼운 포인터. 생성 비용이 거의 0 |
| HEAD | 현재 체크아웃된 브랜치(또는 커밋)를 가리키는 특수 포인터 |
| Remote | 인터넷에 있는 원격 저장소. 기본 이름은 `origin` |
| Push | 로컬 커밋을 원격 저장소로 전송 |
| Pull | 원격 커밋을 로컬로 가져와 머지 (fetch + merge) |
| Fetch | 원격 커밋을 가져오되 머지하지 않음. 확인만 먼저 할 때 |
| Merge | 두 브랜치의 변경사항을 하나로 통합 |
| Rebase | 커밋을 다른 커밋 위로 재배치. 히스토리 선형화 |
| Pull Request (PR) | 브랜치 머지 요청 + 코드 리뷰 공간 |
| Fork | 외부 저장소를 자신의 계정에 복사 |
| Clone | 원격 저장소 전체를 로컬로 복사 |
| Conflict | 두 브랜치가 같은 줄을 다르게 수정했을 때 발생하는 충돌 |
| Cherry-pick | 특정 커밋 하나만 현재 브랜치에 적용 |
| Stash | 커밋하지 않은 변경사항을 임시로 저장 |
| Tag | 특정 커밋에 붙이는 영구 레이블. 릴리스 버전 표시에 사용 |
| GitHub Actions | GitHub 내장 CI/CD 플랫폼 |
| Workflow | GitHub Actions의 자동화 작업 정의 파일 (.github/workflows/*.yml) |
| Runner | Workflow를 실제로 실행하는 가상 머신(환경) |
| Secret | workflow에서 사용하는 암호화된 환경변수 |
| Branch Protection | main 직접 push, CI 미통과 PR 머지 등을 차단하는 규칙 |
| Upstream | Fork의 원본 저장소 |
| Squash Merge | PR의 여러 커밋을 하나로 압축해 main에 머지 |
| Conventional Commits | `feat:`, `fix:`, `docs:` 등 표준 커밋 메시지 형식 |
| Detached HEAD | HEAD가 브랜치가 아닌 특정 커밋을 직접 가리키는 상태 |
| git reflog | HEAD 이동 히스토리 전체 기록. 실수 복구 수단 |
| .gitignore | Git이 추적하지 않을 파일 패턴 목록 |

### 부록 B. 자주 묻는 질문 (FAQ)

**Q. git pull과 git fetch의 차이는 무엇인가?**
A. `git fetch`는 원격 변경사항을 로컬로 가져오기만 하고, 로컬 브랜치를 변경하지 않는다. 무슨 변경이 있는지 먼저 보고 싶을 때 쓴다. `git pull`은 fetch + merge를 한 번에 실행한다. 안전하게 작업하려면 `git fetch` 후 변경사항을 확인하고 `git merge`하는 습관이 좋다.

**Q. git merge와 git rebase 중 어느 것을 써야 하나?**
A. 개인 feature 브랜치를 main의 최신 상태로 업데이트할 때는 rebase가 히스토리를 깔끔하게 유지한다. main 또는 팀에서 공유하는 브랜치에는 절대 rebase하지 않는다. PR을 통한 최종 통합에는 팀 합의된 방식(Merge Commit / Squash / Rebase)을 따른다.

**Q. 커밋 메시지를 잘못 작성했다. 어떻게 수정하나?**
A. 가장 최근 커밋 메시지는 `git commit --amend -m "새 메시지"`로 수정한다. 단, 이미 원격에 push한 커밋이라면 `--force-with-lease` push가 필요하다. 이 경우 팀원이 해당 브랜치를 pull 받고 있다면 반드시 팀원에게 알려야 한다.

**Q. .gitignore에 추가했는데 파일이 계속 추적된다. 왜인가?**
A. `.gitignore`는 아직 추적하지 않는 파일에만 적용된다. 이미 `git add`로 한 번이라도 추적된 파일은 `git rm --cached <파일>`로 추적을 제거한 뒤 `.gitignore`에 추가해야 한다.

**Q. git push를 했는데 rejected가 뜬다. 어떻게 해야 하나?**
A. 원격에 로컬에 없는 커밋이 있다는 뜻이다. `git pull --rebase origin main`으로 원격 변경사항을 먼저 가져와 통합한 뒤 다시 push한다. `--force`나 `--force-with-lease`는 다른 사람의 커밋을 덮어쓸 수 있으므로 공유 브랜치에서는 절대 쓰지 않는다.

**Q. GitHub Actions workflow 요금이 걱정된다.**
A. 공개(Public) 저장소는 GitHub Actions가 완전 무료다. 비공개(Private) 저장소는 매월 2,000분(Free 계획)이 무료로 제공되며, ubuntu runner 기준으로 일반적인 테스트 워크플로우는 수 분 이내에 끝나므로 개인 프로젝트에서는 거의 비용이 발생하지 않는다.

**Q. PR을 머지한 뒤 feature 브랜치를 삭제해야 하나?**
A. 삭제하는 것이 좋다. GitHub는 PR 머지 후 "Delete branch" 버튼을 제공한다. 오래된 브랜치가 쌓이면 저장소가 복잡해지고 실수로 오래된 브랜치에서 작업할 수 있다. 로컬 삭제는 `git branch -d feature/xxx`, 원격 삭제는 `git push origin --delete feature/xxx`로 한다.

**Q. git stash와 커밋의 차이는 무엇인가?**
A. stash는 임시 보관함이다. 히스토리에 기록되지 않고, 명시적으로 pop/apply 하기 전까지 대기한다. 커밋은 히스토리에 영구 기록되어 로그에 남는다. 작업이 아직 미완성이거나 다른 브랜치로 급히 전환해야 할 때 stash를 쓰고, 작업의 의미 있는 단위가 완성되면 커밋한다.

**Q. Squash Merge를 쓰면 feature 브랜치 상세 커밋은 사라지나?**
A. main 히스토리에서는 사라진다. feature 브랜치 자체는 삭제하기 전까지 남아있으므로 상세 커밋을 보고 싶으면 해당 브랜치를 보면 된다. Squash의 장점은 main 히스토리가 "기능 단위 커밋" 하나로 정리된다는 것이다.

**Q. git revert와 git reset의 차이는?**
A. `git revert <SHA>`는 해당 커밋의 변경사항을 되돌리는 **새 커밋**을 추가한다. 히스토리가 보존되므로 공유 브랜치에서 안전하다. `git reset`은 히스토리 자체를 이동시켜 커밋을 없앤다. 로컬에서만 쓰고, 원격에 push된 커밋에는 쓰지 않는다.

### 부록 C. 다음 공부

이 커리큘럼을 마친 뒤 이어 공부할 방향:

1. **Docker** — 앱을 컨테이너로 패키징해 "내 로컬에서는 됐는데"를 없앤다. GitHub Actions와 Docker를 조합하면 실무형 CI/CD 파이프라인이 완성된다.
2. **GCP / AWS** — GitHub Actions로 Cloud Run이나 EC2에 자동 배포하는 파이프라인을 연결한다.
3. **Semantic Release** — Conventional Commits 규칙을 지키면 자동으로 버전을 올리고 CHANGELOG를 생성하는 도구.
4. **Dependabot** — GitHub 내장 의존성 취약점 자동 탐지 + PR 생성 도구. 보안 업데이트를 자동화한다.
5. **GitHub Advanced Security** — Code Scanning, Secret Scanning으로 코드베이스의 보안 취약점을 자동으로 찾아낸다.

### 부록 D. 참고 자료

| 자료 | 유형 | 설명 |
|:--|:--|:--|
| https://git-scm.com/book/ko/v2 | 공식 문서 | Git Pro Book 한국어판. 가장 신뢰할 수 있는 Git 레퍼런스 |
| https://docs.github.com/ko | 공식 문서 | GitHub 공식 한국어 문서. PR, Actions, Pages 전체 커버 |
| https://learngitbranching.js.org/?locale=ko | 인터랙티브 | 브랜치와 리베이스를 게임으로 배우는 무료 사이트 |
| https://www.conventionalcommits.org/ko | 공식 | Conventional Commits 한국어 스펙 |
| https://ohshitgit.com/ko | 트러블슈팅 | "이런 실수를 했을 때 어떻게 하나" 상황별 해결 모음 |
| https://github.com/k88hudson/git-flight-rules | 트러블슈팅 | 항공 규칙처럼 정리된 Git 상황별 대응 가이드 (영어) |
| https://docs.github.com/ko/actions | 공식 문서 | GitHub Actions 전체 레퍼런스 |
| https://github.com/marketplace/actions | 마켓플레이스 | 검증된 Actions 검색 |
| https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens | VSCode 확장 | GitLens — VS Code에서 Git 히스토리를 줄 단위로 시각화 |
