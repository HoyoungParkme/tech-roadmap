#!/usr/bin/env bash
# =============================================================================
# 예제 V-1-2: Postgres named volume 영구화 검증 스크립트
# 경로: examples/v-1-2-postgres-volume/tests/verify_persistence.sh
# 목적: named volume이 컨테이너 삭제 후에도 데이터를 보존하는지 자동 검증
# 단일 진실원: docs/design/crossref.md §2
# 플랫폼: Git Bash (Windows) / macOS / Linux
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# 색상 출력 헬퍼 (터미널 지원 여부와 무관하게 동작)
# -----------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

# -----------------------------------------------------------------------------
# 전역 상태: 실패 카운터
# -----------------------------------------------------------------------------
FAIL_COUNT=0

# -----------------------------------------------------------------------------
# assertion 헬퍼
# 사용법: assert_contains "실제 출력" "기대 문자열" "테스트 설명"
# -----------------------------------------------------------------------------
assert_contains() {
  local actual="$1"
  local expected="$2"
  local description="$3"

  if echo "$actual" | grep -q "$expected"; then
    pass "$description"
  else
    fail "$description"
    echo "    기대값 포함: '$expected'"
    echo "    실제 출력:   '$actual'"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# -----------------------------------------------------------------------------
# 행 수 검증 헬퍼
# 사용법: assert_row_count "실제 출력" 기대행수 "테스트 설명"
# psql \pset format unaligned 출력에서 마지막 "(N rows)" 또는 "(N row)" 파싱
# -----------------------------------------------------------------------------
assert_row_count() {
  local actual="$1"
  local expected_count="$2"
  local description="$3"

  # "(1 row)" 또는 "(2 rows)" 패턴 모두 처리
  local actual_count
  actual_count=$(echo "$actual" | grep -oE '\([0-9]+ rows?\)' | grep -oE '[0-9]+' || echo "0")

  if [ "$actual_count" -eq "$expected_count" ]; then
    pass "$description (${actual_count}행)"
  else
    fail "$description"
    echo "    기대 행 수: $expected_count"
    echo "    실제 행 수: $actual_count"
    echo "    실제 출력:"
    echo "$actual" | sed 's/^/      /'
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# -----------------------------------------------------------------------------
# Docker Compose 대기 헬퍼
# Postgres가 실제로 쿼리를 받을 수 있을 때까지 최대 30초 대기
# -----------------------------------------------------------------------------
wait_for_postgres() {
  local max_attempts=30
  local attempt=1

  info "Postgres 준비 대기 중..."
  while [ $attempt -le $max_attempts ]; do
    if docker compose exec -T db psql -U app -d demo -c "SELECT 1;" > /dev/null 2>&1; then
      info "Postgres 준비 완료 (${attempt}초)"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  fail "Postgres 준비 시간 초과 (${max_attempts}초)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  return 1
}

# -----------------------------------------------------------------------------
# cleanup: trap으로 보장 — 중간 실패 시에도 반드시 정리
# docker compose down -v로 볼륨까지 삭제하여 다음 실행에 영향 없게 함
# -----------------------------------------------------------------------------
cleanup() {
  info "cleanup: 컨테이너 및 볼륨 삭제..."
  docker compose down -v > /dev/null 2>&1 || true
}
trap cleanup EXIT

# -----------------------------------------------------------------------------
# 스크립트 위치를 기준으로 예제 디렉토리로 이동
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_DIR="$(dirname "$SCRIPT_DIR")"
cd "$EXAMPLE_DIR"
info "작업 디렉토리: $(pwd)"

echo ""
echo "============================================================"
echo " V-1-2 Postgres Volume 영구화 검증 시작"
echo " 단일 진실원: docs/design/crossref.md §2"
echo "============================================================"
echo ""

# =============================================================================
# STEP 1: .env 파일 준비
# 이미 존재하면 덮어쓰지 않고 건너뛴다
# =============================================================================
info "[STEP 1] .env 파일 준비"
if [ -f ".env" ]; then
  info ".env 이미 존재 — 건너뜀"
else
  cp .env.example .env
  pass ".env 파일 생성 완료"
fi

# =============================================================================
# STEP 2: 최초 기동 및 init.sql 실행 확인
# =============================================================================
info "[STEP 2] docker compose up -d (최초 기동)"
docker compose up -d > /dev/null 2>&1
wait_for_postgres

# =============================================================================
# STEP 3: seed 데이터 1행 확인
# init.sql이 정상 실행되었으면 seed-row 1행이 존재해야 함
# =============================================================================
info "[STEP 3] seed 데이터 확인 (기대: 1행, seed-row)"
OUTPUT=$(docker compose exec -T db psql -U app -d demo -c "SELECT * FROM items;")
assert_row_count "$OUTPUT" 1 "최초 기동 후 seed-row 1행 존재"
assert_contains "$OUTPUT" "seed-row" "seed-row 데이터 존재"

# =============================================================================
# STEP 4: 새 데이터 INSERT
# INSERT 0 1이 반환되어야 성공
# =============================================================================
info "[STEP 4] after-insert 데이터 INSERT"
INSERT_OUTPUT=$(docker compose exec -T db psql -U app -d demo -c "INSERT INTO items(name) VALUES ('after-insert');")
assert_contains "$INSERT_OUTPUT" "INSERT 0 1" "INSERT 명령 성공 (INSERT 0 1)"

# =============================================================================
# STEP 5: 컨테이너 삭제 (볼륨 유지)
# docker compose down은 볼륨을 삭제하지 않음 — pgdata 볼륨은 보존됨
# =============================================================================
info "[STEP 5] docker compose down (볼륨 유지, 컨테이너만 삭제)"
docker compose down > /dev/null 2>&1
pass "컨테이너 삭제 완료 (볼륨 pgdata 유지)"

# =============================================================================
# STEP 6: 재기동 (볼륨 재연결)
# =============================================================================
info "[STEP 6] docker compose up -d (재기동, 볼륨 재연결)"
docker compose up -d > /dev/null 2>&1
wait_for_postgres

# =============================================================================
# STEP 7: 데이터 생존 확인 — 핵심 검증
# 볼륨이 데이터를 보존했다면 seed-row + after-insert 2행이 존재해야 함
# =============================================================================
info "[STEP 7] 데이터 생존 확인 (기대: 2행, seed-row + after-insert)"
OUTPUT=$(docker compose exec -T db psql -U app -d demo -c "SELECT * FROM items;")
assert_row_count "$OUTPUT" 2 "컨테이너 재기동 후 2행 생존 (named volume 영구화 확인)"
assert_contains "$OUTPUT" "seed-row" "seed-row 생존"
assert_contains "$OUTPUT" "after-insert" "after-insert 생존 (볼륨 데이터 보존 확인)"

# =============================================================================
# STEP 8: 볼륨까지 삭제
# docker compose down -v는 named volume(pgdata)도 함께 삭제
# =============================================================================
info "[STEP 8] docker compose down -v (볼륨까지 삭제)"
docker compose down -v > /dev/null 2>&1
pass "컨테이너 및 볼륨 pgdata 삭제 완료"

# =============================================================================
# STEP 9: 재기동 (init.sql 재실행 기대)
# 볼륨이 없으므로 postgres가 새 볼륨을 생성하고 init.sql을 재실행함
# =============================================================================
info "[STEP 9] docker compose up -d (볼륨 삭제 후 재기동, init.sql 재실행)"
docker compose up -d > /dev/null 2>&1
wait_for_postgres

# =============================================================================
# STEP 10: 초기화 확인 — 핵심 검증
# 볼륨이 초기화되었으면 seed-row 1행만 존재해야 함 (after-insert는 사라짐)
# =============================================================================
info "[STEP 10] 초기화 확인 (기대: 1행, seed-row만 존재)"
OUTPUT=$(docker compose exec -T db psql -U app -d demo -c "SELECT * FROM items;")
assert_row_count "$OUTPUT" 1 "볼륨 삭제 후 재기동 시 seed-row 1행만 존재 (초기화 확인)"
assert_contains "$OUTPUT" "seed-row" "seed-row 존재"

# after-insert가 사라졌는지 명시적으로 확인
if echo "$OUTPUT" | grep -q "after-insert"; then
  fail "after-insert가 남아있음 — 볼륨 초기화 실패"
  FAIL_COUNT=$((FAIL_COUNT + 1))
else
  pass "after-insert 사라짐 (볼륨 초기화 정상)"
fi

# =============================================================================
# 최종 결과 출력
# cleanup은 trap EXIT에서 자동 실행됨
# =============================================================================
echo ""
echo "============================================================"
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN} 전체 PASS — named volume 영구화 시나리오 검증 완료${NC}"
  echo "============================================================"
  exit 0
else
  echo -e "${RED} FAIL ${FAIL_COUNT}건 — 위 로그를 확인하세요${NC}"
  echo "============================================================"
  exit 1
fi
