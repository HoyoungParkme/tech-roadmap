# 챕터 애니메이션 (C안) — 모든 주제 공용

각 챕터 페이지의 본문을 "애니메이션 + 코드 창" 으로 바꾼 틀이다.

- 코드가 필요한 단계: 왼쪽 애니메이션(60%) + 오른쪽 코드 창(40%)
- 코드가 필요 없는 단계(기본: 코드 파일이 마크다운): 애니메이션을 크게, 코드는 접힘
- 그림 칸의 "코드 접기 / 코드 보기" 버튼으로 언제든 바꾼다. 그림을 누르면 이 beat 를 다시 재생한다.

## 파일

| 파일 | 하는 일 |
|---|---|
| `anim/engine.js` (저장소 루트) | SVG 그리기 도구(`window.RA`). 장면 등록 `RA.page()`, 그리기 `RA.render()` |
| `anim/stage.jsx` | React 부품 `AnimStage` `AnimPane` `HybridBody`. 페이지의 본 babel 스크립트보다 먼저 불린다 |
| `anim/anim.css` | 무대 색(CSS 변수)과 60/40 배치 |
| `<주제>/partN/<id>.anim.js` | 그 페이지의 장면들. `RA.page({ title, scenes: [...] })` |

페이지에는 `</head>` 앞에 `../../anim/` 의 css·engine 과 `./<id>.anim.js`, 본 스크립트 앞에 `stage.jsx` 가 붙고,
(`python scripts/anim_convert.py <페이지>` 가 붙인다)
본문 그리드는 `<HybridBody step={step} stepIdx={stepIdx} />` 한 줄이 된다.

## 장면 쓰는 법

STEPS 는 제목(`title`)이 같은 것끼리 한 장면(Step)으로 묶인다. 장면마다 함수 하나:

```js
function s1(t, c) {   // c = { k, u, n, beat, prev, steps }
  // k: 이 장면 안에서 몇 번째 beat 인지 (0부터), u: 그 beat 안에서 흐른 시간 0 → 3초
  // beat: 지금 STEPS 항목 (caption, changes, 페이지별 데이터 필드), prev: 바로 앞 beat
}
RA.page({ title: '그림 칸 제목', scenes: [s1, s2, s3, s4, s5], codeOpen: [true, true, false, true, false] /* 생략 가능 */ });
```

- 같은 `(t, c)` 면 언제나 같은 그림이어야 한다 (매 프레임 지우고 다시 그린다).
- beat 하나는 3초. 자동재생도 3초마다 넘어가므로 움직임은 u = 0.2 ~ 2.6 안에서 끝낸다.
- 숫자는 `c.beat` 의 데이터 필드에서 읽는다. 앞 beat 값에서 이어지게 `tween(c.prev.x, c.beat.x, c.u)`.
- 무대는 `viewBox 0 0 960 420`. 글자는 13.5px 이상, 이름표는 15px 이상(60% 폭에서도 읽히게).
- 그래프 도구: `axes`(좌표축 → X(v)/Y(v)), `scatter`(점), `line`(꺾은선을 u 만큼), `heat`(행렬·히트맵), `hbar`(값 막대).
- 색은 `RA.C` 의 토큰만 쓴다 (`INK MUT OFF GRID SOFT PANEL ACC ACCBG BAD GOOD WARN INFO` …).

## 표·정리 보기 (RefPanel)

그림으로 옮기기 어려운 표·링크·목록(선택 기준표, 이어지는 주제, 실무 적용 예, 한계 목록 등)은 지우지 말고
페이지의 본 스크립트에 `function RefPanel({ step, stepIdx })` 를 정의해 돌려준다. 그림·코드 아래 전체 폭의 접는 상자에 들어간다.
훅을 쓰지 않는 함수여야 하고, 그 단계에 보여 줄 것이 없으면 `null`. `<table>`, `<h4>`, `<ul>` 는 기본 모양이 잡혀 있다.

## 그림 원칙 (tweenkit animation-html 스킬의 규칙을 이 페이지들에 맞게 옮김)

주제의 실제 대상을 그린다: Redis 는 키·TTL·슬롯, ML 은 데이터 표·결정 경계·손실 곡선·혼동 행렬처럼.

1. **주제 자체를 그린다.** (Redis 예: 키와 값, TTL 시계, 슬롯 번호 / ML 예: 샘플 점, 특징 표, 결정 경계, 오차 막대) 그 챕터에 실제로 있는 것이 화면을 이룬다. 상자와 화살표만 있는 장면은 전체의 1/3 이하.
2. **바꿔치기 시험:** 제목과 설명을 다른 챕터 것으로 바꿔도 그림이 그대로 말이 되면 다시 그린다.
3. **설명 순서대로 나타난다.** 처음부터 다 보이지 않는다. 등장은 선이 자라기, 흐르는 점, 칸이 채워지기, 쪼개지기 등으로 고르고 매번 흐려졌다 나타나기만 쓰지 않는다.
4. **숫자를 지어내지 않는다.** 페이지 데이터와 설명에 있는 숫자만 쓴다. 숫자는 `mono`, 막대에는 값을 적는다.
5. **한 beat 에 한 가지.** 그림 안 글은 서너 줄 이하. 긴 설명은 그림 아래 caption 이 맡는다.

## 점검

```bash
python -m http.server 8766          # 저장소 루트에서
node scripts/dump_steps.js <페이지>    # 단계·beat·데이터 요약
python scripts/check_anim.py redis/part1/I-1-1.html   # 콘솔 오류, 무대 밖 글자, 글자 겹침 + beat 별 캡처 모음
```

자동 점검은 글자와 도형이 겹치는 것은 못 잡는다. 캡처 모음을 눈으로 본다.

---

# 플랫폼 표준 (A 레슨형) — 2026-11

레퍼런스: Brilliant. 설계도 원본은 저장소 밖 디자인 작업 폴더의 DESIGN.md, 요약은 아래.

| 화면 | 파일 | 만드는 법 |
|---|---|---|
| 첫 화면 | `index.html` + `anim/home.js` | `python scripts/build_hub.py` (CATS 리터럴은 그대로 옮긴다, ANIM 장 수를 다시 센다) |
| 주제 페이지(학습 경로) | `<주제>/index.html` + `anim/topic.js` | `python scripts/to_topic.py [<주제>…]` (예전 노트의 SECTIONS 를 읽어 다시 만든다) |
| 챕터(레슨) | 챕터 html + `anim/lesson.jsx` | `python scripts/to_lesson.py <페이지>…` (애니메이션 틀이 붙은 페이지만) |

- 공용 색·부품: `anim/platform.css` (`pf-` 접두사), 아이콘·분류 그림: `anim/icons.js`
- 진도: `localStorage['trn-read-<주제>'][장 id] = true` (레슨 완료 화면에서 기록), 이어서 보기: `trn-last`
- 챕터 레슨: 한 화면에 한 단계. 장면(Step) 끝마다 확인 문제, 끝에 완료 화면(`window.LESSON.wrap`).
- 코드: 그 단계의 강조 줄 두세 줄만 그림 아래에, 전체는 접기. 코드 파일이 마크다운(설명 문서)이면 코드를 보이지 않는다.
- 확인 문제: `<id>.anim.js` 의 `RA.page({ …, quiz: [{ q, o:[…], a, why }] })` — 장면 수만큼, 그 장면 내용으로만, 답 위치는 섞는다.
- 새 주제를 애니메이션으로 바꿀 때 순서: `anim_convert.py` → 장면(`<id>.anim.js`)·확인 문제 작성 → `to_lesson.py` → `to_topic.py <주제>` → `build_hub.py` → `check_anim.py`·`check_pages.js`
