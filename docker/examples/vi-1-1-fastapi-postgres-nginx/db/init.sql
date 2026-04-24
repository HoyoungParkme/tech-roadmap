-- 예제 VI-1-1: 다중 컨테이너 학습용 초기 스키마

CREATE TABLE IF NOT EXISTS items (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO items (name) VALUES ('seed-row');
