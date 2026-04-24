# FastAPI 인터랙티브 마스터 코스

두꺼운 책 없이, 클릭 한 번으로 FastAPI의 핵심 개념을 눈으로 확인하며 익히는 학습 자료다.

---

## 이 자료의 목적

주니어 개발자가 FastAPI 코드베이스에 처음 투입됐을 때 가장 먼저 부딪히는 개념들 — 비동기 I/O, Pydantic 검증, 의존성 주입(DI), 3계층 아키텍처 — 을 **인터랙티브 시각화**로 빠르게 체득하는 것이 목표다.

책을 읽으면 이해하는 데 며칠이 걸리는 내용을, 애니메이션을 보고 직접 조작하면서 수 시간 안에 머릿속에 그림이 그려지도록 설계했다. 이 자료를 전부 익히고 나면 실무 FastAPI 코드를 보고 "왜 이렇게 짰는지"가 자연스럽게 보이기 시작한다.

---

## 로컬에서 실행하기 (VSCode Live Server)

빌드 도구가 없다. `npm install` 없이 파일을 브라우저에서 바로 열기만 하면 된다.

### 1단계: Live Server 확장 설치

VSCode를 열고 왼쪽 사이드바의 Extensions 아이콘(또는 `Ctrl+Shift+X`)을 클릭한다.

검색창에 `Live Server`를 입력한다. **Ritwick Dey**가 만든 확장을 설치한다.

> 설치 후 VSCode를 재시작해야 메뉴가 보이는 경우가 있다.

### 2단계: index.html 열기

VSCode에서 이 `fastapi/` 폴더를 연다. 파일 탐색기에서 `index.html`(허브 페이지)을 찾아 **우클릭** → **Open with Live Server**를 선택한다.

기본 브라우저에서 `http://127.0.0.1:5500/fastapi/index.html`로 자동으로 열린다. 허브 화면의 챕터 카드를 클릭하면 각 시각화 페이지로 이동한다.

---

## GitHub Pages에 배포하기

### 방법 A: `fastapi/` 폴더 전체를 새 레포 루트로 (권장)

이 방법이 가장 단순하다. `index.html`이 레포 루트에 위치해야 GitHub Pages가 자동으로 진입점을 인식한다.

```bash
# fastapi/ 폴더 내용을 새 레포에 올리는 예시
cd fastapi/
git init
git add .
git commit -m "feat: Chapter 1-1 비동기 I/O 시각화"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

GitHub 레포 → **Settings** → **Pages** → Source를 `main` 브랜치 `/ (root)`로 지정한다.

배포 URL 예시: `https://<user>.github.io/<repo>/`

### 방법 B: 기존 레포의 서브폴더로 올리기

`fastapi/` 폴더를 기존 레포 안에 그대로 push하면 된다. 이 경우 GitHub Pages Source를 `/docs`로 지정하는 기능이 필요하거나, 별도 브랜치(예: `gh-pages`)를 써야 할 수 있다. 구조가 복잡해지므로 방법 A를 권장한다.

> **주의**: CDN이 차단된 기업 내부망에서는 React, Tailwind, Babel 라이브러리가 로드되지 않아 화면이 비어있을 수 있다. 이 경우 로컬 Live Server 방식을 사용한다.

---

## 커리큘럼 개요

전체 목차: [`curriculum.md`](./curriculum.md)

루트 `index.html`은 **허브(목차)** 페이지다. 시각화가 완성된 챕터는 카드로 노출되고, 카드를 클릭하면 해당 챕터 HTML로 이동한다.

### 시각화 목차

#### Part I. 왜 웹인가

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| I-1-1 | 인터넷이 어떻게 연결돼 있나 | [`I-1-1.html`](./I-1-1.html) | ✅ 완성 |
| I-1-2 | IP, 도메인, DNS — 주소의 종류 | [`I-1-2.html`](./I-1-2.html) | ✅ 완성 |
| I-1-3 | 포트 — 한 컴퓨터 안의 여러 창구 | [`I-1-3.html`](./I-1-3.html) | ✅ 완성 |
| I-2-1 | 요청과 응답 — 편지처럼 주고받는다 | [`I-2-1.html`](./I-2-1.html) | ✅ 완성 |
| I-2-2 | 메서드 — GET / POST / PUT / DELETE | [`I-2-2.html`](./I-2-2.html) | ✅ 완성 |
| I-2-3 | 상태 코드 — 200 / 404 / 500 | [`I-2-3.html`](./I-2-3.html) | ✅ 완성 |
| I-2-4 | 헤더와 바디 — 봉투와 편지지 | [`I-2-4.html`](./I-2-4.html) | ✅ 완성 |

#### Part II. 웹 프레임워크 개론

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| II-1-1 | 맨땅 vs 프레임워크 | [`II-1-1.html`](./II-1-1.html) | ✅ 완성 |
| II-1-2 | 라이브러리 vs 프레임워크 (IoC) | [`II-1-2.html`](./II-1-2.html) | ✅ 완성 |
| II-2-1 | 생 소켓 vs 프레임워크 코드량 | [`II-2-1.html`](./II-2-1.html) | ✅ 완성 |
| II-3 | 주요 웹 프레임워크 지도 | [`II-3.html`](./II-3.html) | ✅ 완성 |
| II-4-1 | 동기 vs 비동기 (햄버거 가게) | [`II-4-1.html`](./II-4-1.html) | ✅ 완성 |
| II-4-2 | WSGI vs ASGI | [`II-4-2.html`](./II-4-2.html) | ✅ 완성 |
| II-6 | FastAPI 선택 가이드 | [`II-6.html`](./II-6.html) | ✅ 완성 |

#### Part III. FastAPI 첫 걸음

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| III-2-1 | 가상환경 (장난감 상자 비유) | [`III-2-1.html`](./III-2-1.html) | ✅ 완성 |
| III-3-1 | 5줄짜리 첫 API | [`III-3-1.html`](./III-3-1.html) | ✅ 완성 |
| III-3-2/3 | uvicorn 실행 + 브라우저 확인 | [`III-3-23.html`](./III-3-23.html) | ✅ 완성 |
| III-4 | Swagger UI 구조 | [`III-4.html`](./III-4.html) | ✅ 완성 |
| III-5-1 | Port already in use 에러 | [`III-5-1.html`](./III-5-1.html) | ✅ 완성 |
| III-5-2 | ModuleNotFoundError 에러 | [`III-5-2.html`](./III-5-2.html) | ✅ 완성 |

#### Part IV. FastAPI 코어 개념

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| IV-1-1 | 비동기 I/O & Event Loop | [`chapter-01-01-async.html`](./chapter-01-01-async.html) | ✅ 완성 |
| IV-1-2 | Pydantic 데이터 검증 | [`chapter-01-02-pydantic.html`](./chapter-01-02-pydantic.html) | ✅ 완성 |
| IV-1-3 | 자동 OpenAPI 문서 | [`chapter-01-03-openapi.html`](./chapter-01-03-openapi.html) | ✅ 완성 |
| IV-2-1 | Path/Query Parameter | [`chapter-02-01-params.html`](./chapter-02-01-params.html) | ✅ 완성 |
| IV-2-2 | Response Model | [`chapter-02-02-response-model.html`](./chapter-02-02-response-model.html) | ✅ 완성 |
| IV-2-3 | HTTPException | [`chapter-02-03-exception.html`](./chapter-02-03-exception.html) | ✅ 완성 |
| IV-3-1 | Depends() 의존성 주입 | [`chapter-03-01-depends.html`](./chapter-03-01-depends.html) | ✅ 완성 |
| IV-3-2 | DB 세션 관리 | [`chapter-03-02-db-session.html`](./chapter-03-02-db-session.html) | ✅ 완성 |
| IV-3-3 | JWT 인증 | [`chapter-03-03-jwt.html`](./chapter-03-03-jwt.html) | ✅ 완성 |

#### Part V. 아키텍처 패턴

| Section | 제목 | 파일 | 상태 |
|:--|:--|:--|:--|
| V-1-1 | 스파게티 코드 | [`chapter-05-01-spaghetti.html`](./chapter-05-01-spaghetti.html) | ✅ 완성 |
| V-1-2 | 템플릿(패턴) 효과 | [`chapter-05-02-template.html`](./chapter-05-02-template.html) | ✅ 완성 |
| V-2-1 | MVC 패턴 | [`chapter-05-03-mvc.html`](./chapter-05-03-mvc.html) | ✅ 완성 |
| V-2-2 | MVC vs MTV 비교 | [`chapter-05-04-mtv.html`](./chapter-05-04-mtv.html) | ✅ 완성 |
| V-2-3 | Fat Controller | [`chapter-05-05-fat-controller.html`](./chapter-05-05-fat-controller.html) | ✅ 완성 |
| V-3-1 | 레이어드 아키텍처 3계층 | [`chapter-05-06-layered.html`](./chapter-05-06-layered.html) | ✅ 완성 |
| V-3-2 | FastAPI 폴더 구조 | [`chapter-05-07-folder.html`](./chapter-05-07-folder.html) | ✅ 완성 |
| V-3-3 | APIRouter 분리 | [`chapter-05-08-apirouter.html`](./chapter-05-08-apirouter.html) | ✅ 완성 |
| V-4-1 | 헥사고날 아키텍처 | [`chapter-05-09-hexagonal.html`](./chapter-05-09-hexagonal.html) | ✅ 완성 |
| V-4-2 | 클린 아키텍처 | [`chapter-05-10-clean.html`](./chapter-05-10-clean.html) | ✅ 완성 |
| V-4-3 | 패턴 선택 가이드 | [`chapter-05-11-when.html`](./chapter-05-11-when.html) | ✅ 완성 |
| V-5-1 | BackgroundTasks | [`chapter-05-12-background.html`](./chapter-05-12-background.html) | ✅ 완성 |
| V-5-2 | Celery / 메시지 큐 | [`chapter-05-13-celery.html`](./chapter-05-13-celery.html) | ✅ 완성 |

#### 전체 현황

| Part | 제목 | 시각화 수 |
|:--|:--|:--|
| I | 왜 웹인가 | 7개 ✅ |
| II | 웹 프레임워크 개론 | 7개 ✅ |
| III | FastAPI 첫 걸음 | 6개 ✅ |
| IV | FastAPI 코어 개념 | 9개 ✅ |
| V | 아키텍처 패턴 | 13개 ✅ |
| **합계** | | **42개** |

> 세부 Chapter·Section 번호와 학습 목표는 [`curriculum.md`](./curriculum.md)를 참고하라. 모든 Section이 **난이도 / 선수 지식 / 학습 목표 / 설명 / 핵심 키워드 / 시각화 연결 / 다음 섹션** 7필드를 갖추고 있다.

---

## 새 챕터 추가 방법

### 파일 구조

```
fastapi/
├── index.html                       # 허브 — 42개 시각화 카드 그리드
├── I-1-1.html ~ I-2-4.html          # Part I (7개)
├── II-1-1.html ~ II-6.html          # Part II (7개)
├── III-2-1.html ~ III-5-2.html      # Part III (6개)
├── chapter-01-01 ~ chapter-03-03    # Part IV (9개)
├── chapter-05-01 ~ chapter-05-13    # Part V (13개)
└── curriculum.md                    # 전체 목차 (Part I~VII + 부록, 90+ Section)
```

### 새 챕터 시각화 추가 절차

1. `chapter-XX-XX-NAME.html`을 새로 만든다 (기존 챕터 파일을 복사 후 `STEPS`/`PYTHON_CODE`/헤더만 교체).
2. `index.html`의 `CHAPTERS` 배열에 한 줄을 추가한다.
   ```js
   { id: '1-3', title: '자동 OpenAPI 문서', desc: '...', file: './chapter-01-03-openapi.html', curriculum: 'IV-1-3', status: 'ready' },
   ```
3. README의 "시각화 목차"와 `curriculum.md` 해당 Section의 `시각화 연결` 필드를 갱신한다.

### JSX 수정 시 주의점

이 파일은 빌드 과정이 없다. JSX는 `<script type="text/babel">` 블록 안에 인라인으로 작성한다.

```html
<script type="text/babel">
  // 여기에 React 컴포넌트 작성
  const { useState, useEffect, useRef } = React;

  function App() {
    return <div>Hello</div>;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
```

아래 규칙을 반드시 지킨다.

- `import` / `export` 문 사용 금지 — CDN UMD 방식은 전역 변수로 접근한다
- React 훅은 `const { useState, useEffect } = React;` 패턴으로 꺼내 쓴다
- 외부 파일 분리 금지 — 모든 JS/JSX는 해당 HTML 파일 안에 유지한다

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
