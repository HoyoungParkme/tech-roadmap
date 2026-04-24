#!/usr/bin/env bash
# =============================================================================
# 예제 VI-1-1: FastAPI + PostgreSQL + Nginx 3티어 검증 스크립트
# 경로: examples/vi-1-1-fastapi-postgres-nginx/tests/verify_3tier.sh
# 목적: Nginx -> FastAPI -> PostgreSQL 3티어 통신을 자동으로 검증
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
# HTTP 상태코드 검증 헬퍼
# 사용법: assert_status_code "실제 코드" "기대 코드" "테스트 설명"
# -----------------------------------------------------------------------------
assert_status_code() {
  local actual="$1"
  local expected="$2"
  local description="$3"

  if [ "$actual" = "$expected" ]; then
    pass "$description (HTTP $actual)"
  else
    fail "$description"
    echo "    기대 상태코드: $expected"
    echo "    실제 상태코드: $actual"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# -----------------------------------------------------------------------------
# Nginx(80포트)가 응답할 때까지 폴링 대기 - 최대 30초
# db healthcheck -> api 기동 -> nginx 기동까지 모두 포함하는 시간
# -----------------------------------------------------------------------------
wait_for_nginx() {
  local max_attempts=30
  local attempt=1

  info "Nginx 준비 대기 중 (최대 ${max_attempts}초)..."
  while [ $attempt -le $max_attempts ]; do
    # curl이 정상 응답(2xx/3xx/4xx)을 반환하면 준비 완료로 판단
    # 연결 자체가 안 되는 경우(exit code 7)만 재시도
    if curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://localhost/health 2>/dev/null | grep -qE '^[2345][0-9]{2}$'; then
      info "Nginx 준비 완료 (${attempt}초 경과)"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  fail "Nginx 준비 시간 초과 (${max_attempts}초)"
  echo "    docker compose ps 출력:"
  docker compose ps 2>/dev/null | sed 's/^/      /' || true
  FAIL_COUNT=$((FAIL_COUNT + 1))
  return 1
}

# -----------------------------------------------------------------------------
# cleanup: trap으로 보장 - 중간 실패 시에도 반드시 정리
# docker compose down -v 로 볼륨까지 삭제하여 다음 실행에 영향 없게 함
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
echo " VI-1-1 FastAPI + PostgreSQL + Nginx 3티어 검증 시작"
echo "============================================================"
echo ""

# =============================================================================
# STEP 1: .env 파일 준비
# 이미 존재하면 덮어쓰지 않고 건너뛴다
# =============================================================================
info "[STEP 1] .env 파일 준비"
if [ -f ".env" ]; then
  info ".env 이미 존재 - 건너뜀"
else
  cp .env.example .env
  pass ".env 파일 생성 완료"
fi

# =============================================================================
# STEP 2: docker compose up -d -> Nginx 준비 대기
# db healthcheck가 완료되어야 api가 기동하고, api가 떠야 nginx가 프록시 가능
# =============================================================================
info "[STEP 2] docker compose up -d"
docker compose up -d > /dev/null 2>&1
wait_for_nginx

# =============================================================================
# STEP 3: GET /health -> {"status":"ok"} 확인
# FastAPI의 헬스체크 엔드포인트가 DB 연결까지 확인함
# =============================================================================
info '[STEP 3] GET /health 확인'
HEALTH_BODY=$(curl -s --max-time 5 http://localhost/health)
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost/health)

assert_status_code "$HEALTH_CODE" "200" "GET /health 상태코드"
assert_contains "$HEALTH_BODY" '"status"' "응답에 status 필드 존재"
assert_contains "$HEALTH_BODY" '"ok"' "status 값이 ok"

# =============================================================================
# STEP 4: GET /items -> seed-row 포함 확인
# init.sql에서 seed-row가 삽입되어 있어야 함
# =============================================================================
info "[STEP 4] GET /items -> seed-row 포함 확인"
ITEMS_BODY=$(curl -s --max-time 5 http://localhost/items)
ITEMS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost/items)

assert_status_code "$ITEMS_CODE" "200" "GET /items 상태코드"
assert_contains "$ITEMS_BODY" "seed-row" "응답에 seed-row 포함"

# =============================================================================
# STEP 5: POST /items -> 201 + id 존재 확인
# 새 아이템을 생성하고 응답에 id 필드가 있어야 함
# =============================================================================
info '[STEP 5] POST /items - test-item 생성 -> 201 + id 존재 확인'
POST_BODY=$(curl -s --max-time 5 \
  -X POST http://localhost/items \
  -H "Content-Type: application/json" \
  -d '{"name":"test-item"}')
POST_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
  -X POST http://localhost/items \
  -H "Content-Type: application/json" \
  -d '{"name":"test-item-probe"}')

assert_status_code "$POST_CODE" "201" "POST /items 상태코드"
assert_contains "$POST_BODY" '"id"' "응답에 id 필드 존재"
assert_contains "$POST_BODY" '"test-item"' "응답에 name=test-item 포함"

# =============================================================================
# STEP 6: GET /items -> test-item 포함 + 2행 이상 확인
# POST 이후 목록에 test-item이 추가되어야 함 (seed-row + test-item)
# =============================================================================
info "[STEP 6] GET /items -> test-item 포함 확인 (2행 이상)"
ITEMS_BODY2=$(curl -s --max-time 5 http://localhost/items)

assert_contains "$ITEMS_BODY2" "seed-row" "목록에 seed-row 존재"
assert_contains "$ITEMS_BODY2" "test-item" "목록에 test-item 존재"

# JSON 배열에서 아이템 수 계산 - id 필드 개수로 판단
ITEM_COUNT=$(echo "$ITEMS_BODY2" | grep -o '"id"' | wc -l)
if [ "$ITEM_COUNT" -ge 2 ]; then
  pass "목록 아이템 수 ${ITEM_COUNT}개 (기대: 2개 이상)"
else
  fail "목록 아이템 수 부족"
  echo "    기대: 2개 이상"
  echo "    실제: ${ITEM_COUNT}개"
  echo "    실제 출력: $ITEMS_BODY2"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# =============================================================================
# STEP 7: GET /items/1 -> seed-row 단건 조회 확인
# init.sql에서 seed-row가 id=1로 삽입되어야 함
# =============================================================================
info "[STEP 7] GET /items/1 -> seed-row 단건 조회 확인"
ITEM1_BODY=$(curl -s --max-time 5 http://localhost/items/1)
ITEM1_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost/items/1)

assert_status_code "$ITEM1_CODE" "200" "GET /items/1 상태코드"
assert_contains "$ITEM1_BODY" '"id"' "단건 응답에 id 필드 존재"
assert_contains "$ITEM1_BODY" "seed-row" "단건 응답에 seed-row 포함"

# =============================================================================
# 최종 결과 출력
# cleanup은 trap EXIT에서 자동 실행됨
# =============================================================================
echo ""
echo "============================================================"
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN} 전체 PASS - 3티어 통신 시나리오 검증 완료${NC}"
  echo "============================================================"
  exit 0
else
  echo -e "${RED} FAIL ${FAIL_COUNT}건 - 위 로그를 확인하세요${NC}"
  echo "============================================================"
  exit 1
fi
