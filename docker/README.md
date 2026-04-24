# Docker 인터랙티브 마스터 코스

두꺼운 책 없이, 클릭 한 번으로 Docker의 핵심 개념을 눈으로 확인하며 익히는 학습 자료다.

---

## 이 자료의 목적

주니어 개발자가 "내 노트북에선 되는데 서버에선 안 돼요"라는 상황을 처음 겪을 때, Docker가 왜 필요한지부터 Dockerfile 작성, 이미지 빌드, 컨테이너 실행, Docker Compose 실전 구성까지 **인터랙티브 시각화**로 빠르게 체득하는 것이 목표다.

글로 읽으면 며칠이 걸리는 내용을, 애니메이션을 보고 직접 조작하면서 수 시간 안에 머릿속에 그림이 그려지도록 설계했다. 이 자료를 전부 익히고 나면 실무 Docker 설정을 보고 "왜 이렇게 짰는지"가 자연스럽게 보이기 시작한다.

---

## 로컬에서 실행하기 (VSCode Live Server)

빌드 도구가 없다. `npm install` 없이 파일을 브라우저에서 바로 열기만 하면 된다.

### 1단계: Live Server 확장 설치

VSCode를 열고 왼쪽 사이드바의 Extensions 아이콘(또는 `Ctrl+Shift+X`)을 클릭한다.

검색창에 `Live Server`를 입력한다. **Ritwick Dey**가 만든 확장을 설치한다.

> 설치 후 VSCode를 재시작해야 메뉴가 보이는 경우가 있다.

### 2단계: index.html 열기

VSCode에서 이 `docker/` 폴더를 연다. 파일 탐색기에서 `index.html`을 찾아 **우클릭** → **Open with Live Server**를 선택한다.

기본 브라우저에서 `http://127.0.0.1:5500/docker/index.html` (또는 유사한 주소)로 자동으로 열린다.

---

## GitHub Pages에 배포하기

### 방법 A: `docker/` 폴더 전체를 새 레포 루트로 (권장)

`index.html`이 레포 루트에 위치해야 GitHub Pages가 자동으로 진입점을 인식한다.

```bash
cd docker/
git init
git add .
git commit -m "feat: Docker 시각화 Chapter IV-1-1"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

GitHub 레포 → **Settings** → **Pages** → Source를 `main` 브랜치 `/ (root)`로 지정한다.

배포 URL 예시: `https://<user>.github.io/<repo>/`

### 방법 B: 기존 레포의 서브폴더로 올리기

`docker/` 폴더를 기존 레포 안에 그대로 push하면 된다. 구조가 복잡해지므로 방법 A를 권장한다.

> **주의**: CDN이 차단된 기업 내부망에서는 React, Tailwind, Babel 라이브러리가 로드되지 않아 화면이 비어있을 수 있다. 이 경우 로컬 Live Server 방식을 사용한다.

---

## 커리큘럼 개요

전체 목차: [`curriculum.md`](./curriculum.md)

현재 루트 `index.html`은 **Chapter IV-1-1 (Dockerfile → 컨테이너 6단계)** 시각화다. Dockerfile 작성부터 `docker build`(레이어 캐싱), Image 생성(읽기 전용), `docker run`, Container 실행(프로세스+파일시스템+네트워크), 포트 매핑으로 호스트에서 접근까지 6단계를 단계별 애니메이션으로 보여준다.

| Part | 제목 | 대상 난이도 | 시각화 |
|:--|:--|:--|:--|
| I | 왜 컨테이너인가 | ★☆☆ (비개발자) | — |
| II | 컨테이너 생태계 | ★☆☆~★★☆ | — |
| III | 첫 컨테이너 실행 | ★★☆ (코딩 입문) | — |
| IV | 이미지·Dockerfile | ★★☆~★★★ | ✅ (`index.html` = IV-1-1 Dockerfile→컨테이너) / ✅ (`examples/iv-1-3-multistage-build/` = IV-1-3 Multi-stage 빌드) |
| V | 네트워크·볼륨·Compose | ★★★ (주니어) | ✅ (`visualizations/v-1-2_volumes_vs_bindmount.html` = V-1-2 볼륨·바인드 마운트) |
| VI | 실전 다중 컨테이너 앱 | ★★★ | ✅ (`examples/vi-1-1-fastapi-postgres-nginx/` = VI-1-1 FastAPI+PostgreSQL+Nginx 3티어) |
| VII | 레지스트리·프로덕션 | ★★★ | — |
| 부록 | 용어집 / FAQ / 다음 공부 / 참고자료 | 공통 | — |

> 세부 Chapter·Section 번호와 학습 목표는 [`curriculum.md`](./curriculum.md)를 참고하라.

---

## 시각화 목록

모든 시각화는 [`visualizations/index.html`](./visualizations/index.html)에서 한눈에 볼 수 있다.

| 파일 | 챕터 | 주제 |
|:--|:--|:--|
| [`visualizations/i-1-2_vm_vs_container.html`](./visualizations/i-1-2_vm_vs_container.html) | I-1-2 | VM vs 컨테이너 구조 비교 |
| [`index.html`](./index.html) | IV-1-1 | Dockerfile → 컨테이너 6단계 |
| [`visualizations/v-1-2_volumes_vs_bindmount.html`](./visualizations/v-1-2_volumes_vs_bindmount.html) | V-1-2 | 볼륨 vs 바인드 마운트 vs tmpfs |
| [`visualizations/v-1-4_compose_multicontainer.html`](./visualizations/v-1-4_compose_multicontainer.html) | V-1-4 | Compose 다중 컨테이너 연결 |
| [`visualizations/vi-1-3_healthcheck_timing.html`](./visualizations/vi-1-3_healthcheck_timing.html) | VI-1-3 | 헬스체크 타이밍 시뮬레이션 |
| [`visualizations/vii-1-2_tagging_strategy.html`](./visualizations/vii-1-2_tagging_strategy.html) | VII-1-2 | 이미지 태깅 전략 |

---

## 실습 예제

손으로 직접 실행해보는 예제 모음이다. 각 폴더 안의 `README.md`에 단계별 실행 방법이 있다.

| 폴더 | 챕터 | 주제 | 필요한 것 |
|:--|:--|:--|:--|
| [`examples/iv-1-3-multistage-build/`](./examples/iv-1-3-multistage-build/) | IV-1-3 | Multi-stage 빌드로 이미지 크기 줄이기 | Docker, Docker Compose |
| [`examples/v-1-2-postgres-volume/`](./examples/v-1-2-postgres-volume/) | V-1-2 | Named Volume으로 PostgreSQL 데이터 영구화 | Docker, Docker Compose |
| [`examples/v-1-2-bind-mount-hot-reload/`](./examples/v-1-2-bind-mount-hot-reload/) | V-1-2 | Bind Mount로 FastAPI 핫 리로드 개발 환경 | Docker, Docker Compose |
| [`examples/vi-1-1-fastapi-postgres-nginx/`](./examples/vi-1-1-fastapi-postgres-nginx/) | VI-1-1 | FastAPI + PostgreSQL + Nginx 3티어 구성 | Docker, Docker Compose |

전체 예제 안내: [`examples/README.md`](./examples/README.md)

---

## 기술 스택

별도 설치 없이 CDN으로 모든 라이브러리를 로드한다.

| 분류 | 기술 | 역할 |
|:--|:--|:--|
| UI 라이브러리 | React 18 (UMD CDN) | 컴포넌트 기반 UI |
| JSX 변환 | Babel Standalone | 브라우저에서 JSX를 직접 변환 |
| 스타일 | Tailwind CSS Play CDN | 유틸리티 클래스 스타일링 |
| 호스팅 | GitHub Pages | 정적 파일 서빙 |
| 로컬 실행 | VSCode Live Server | 파일 변경 시 브라우저 자동 새로고침 |
| 빌드 도구 | 없음 | npm/node 설치 불필요 |

---

## 트러블슈팅

### Live Server로 열었는데 화면이 흰색이다

1. 브라우저 개발자 도구(`F12`)를 열고 **Console** 탭을 확인한다.
2. `Failed to load resource` 에러가 보인다면 React, Tailwind, Babel CDN 중 하나가 로드 실패한 것이다. 인터넷 연결과 기업망 CDN 차단 여부를 확인한다.
3. 에러가 없는데 흰 화면이라면 `index.html` 파일 경로가 올바른지 확인한다 (폴더가 아닌 파일을 열어야 한다).

### "Open with Live Server" 메뉴가 보이지 않는다

Live Server 확장 설치 후 VSCode를 완전히 종료했다가 다시 시작한다. 그래도 안 보인다면 Extensions 탭에서 Live Server가 **활성화(Enabled)** 상태인지 확인한다.

### GitHub Pages에 올렸는데 빈 화면이다

`index.html`이 레포 루트(최상위 폴더)에 있는지 확인한다. Pages Source 설정이 올바른 브랜치와 `/ (root)` 경로를 가리키는지 재확인한다. 변경 후 배포 반영까지 1~2분 걸릴 수 있다.
