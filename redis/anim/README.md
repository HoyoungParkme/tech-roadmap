# Redis 챕터 애니메이션 (C안)

각 챕터 페이지의 본문을 "애니메이션 + 코드 창" 으로 바꾼 틀이다.

- 코드가 필요한 단계: 왼쪽 애니메이션(60%) + 오른쪽 코드 창(40%)
- 코드가 필요 없는 단계(기본: 코드 파일이 마크다운): 애니메이션을 크게, 코드는 접힘
- 그림 칸의 "코드 접기 / 코드 보기" 버튼으로 언제든 바꾼다. 그림을 누르면 이 beat 를 다시 재생한다.

## 파일

| 파일 | 하는 일 |
|---|---|
| `anim/engine.js` | SVG 그리기 도구(`window.RA`). 장면 등록 `RA.page()`, 그리기 `RA.render()` |
| `anim/stage.jsx` | React 부품 `AnimStage` `AnimPane` `HybridBody`. 페이지의 본 babel 스크립트보다 먼저 불린다 |
| `anim/anim.css` | 무대 색(CSS 변수)과 60/40 배치 |
| `partN/<id>.anim.js` | 그 페이지의 장면들. `RA.page({ title, scenes: [...] })` |

페이지에는 `</head>` 앞에 css·engine·`<id>.anim.js`, 본 스크립트 앞에 `stage.jsx` 가 붙고,
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
- 색은 `RA.C` 의 토큰만 쓴다 (`INK MUT OFF GRID SOFT PANEL ACC ACCBG BAD GOOD WARN INFO` …).

## 그림 원칙 (tweenkit animation-html 스킬의 규칙을 이 페이지들에 맞게 옮김)

1. **Redis 자체를 그린다.** 키와 값, TTL 시계, 리스트 칸, 스트림 항목, 슬롯 번호, 락 토큰, 복제 오프셋처럼 그 챕터에 실제로 있는 것이 화면을 이룬다. 상자와 화살표만 있는 장면은 전체의 1/3 이하.
2. **바꿔치기 시험:** 제목과 설명을 다른 챕터 것으로 바꿔도 그림이 그대로 말이 되면 다시 그린다.
3. **설명 순서대로 나타난다.** 처음부터 다 보이지 않는다. 등장은 선이 자라기, 흐르는 점, 칸이 채워지기, 쪼개지기 등으로 고르고 매번 흐려졌다 나타나기만 쓰지 않는다.
4. **숫자를 지어내지 않는다.** 페이지 데이터와 설명에 있는 숫자만 쓴다. 숫자는 `mono`, 막대에는 값을 적는다.
5. **한 beat 에 한 가지.** 그림 안 글은 서너 줄 이하. 긴 설명은 그림 아래 caption 이 맡는다.

## 점검

```bash
python -m http.server 8766          # 저장소 루트에서
python scripts/check_redis_anim.py redis/part1/I-1-1.html   # 콘솔 오류, 무대 밖 글자, 글자 겹침 + beat 별 캡처 모음
```

자동 점검은 글자와 도형이 겹치는 것은 못 잡는다. 캡처 모음을 눈으로 본다.
