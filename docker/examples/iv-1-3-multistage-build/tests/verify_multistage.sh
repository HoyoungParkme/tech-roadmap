#!/usr/bin/env bash
# =============================================================================
# 예제 IV-1-3: Multi-stage 빌드 검증 스크립트
# 경로: examples/iv-1-3-multistage-build/tests/verify_multistage.sh
# 목적: multi-stage 이미지가 single-stage보다 작고, 두 서비스 모두 정상 동작함을 검증
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
# HTTP 서비스 폴링 대기 헬퍼
# 사용법: wait_for_http "http://url/path" "서비스명" 최대대기초
# curl이 HTTP 응답을 반환할 때까지 1초 간격으로 폴링한다.
# 연결 거부(exit 7)만 재시도 — 4xx/5xx는 서비스가 떠있다고 판단하고 진행.
# -----------------------------------------------------------------------------
wait_for_http() {
  local url="$1"
  local service_name="$2"
  local max_attempts="${3:-30}"
  local attempt=1

  info "${service_name} 준비 대기 중 (최대 ${max_attempts}초)..."
  while [ $attempt -le $max_attempts ]; do
    if curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url" 2>/dev/null | grep -qE '^[2345][0-9]{2}$'; then
      info "${service_name} 준비 완료 (${attempt}초 경과)"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  fail "${service_name} 준비 시간 초과 (${max_attempts}초)"
  echo "    docker compose ps 출력:"
  docker compose ps 2>/dev/null | sed 's/^/      /' || true
  FAIL_COUNT=$((FAIL_COUNT + 1))
  return 1
}

# -----------------------------------------------------------------------------
# cleanup: trap으로 보장 - 중간 실패 시에도 반드시 정리
# -----------------------------------------------------------------------------
cleanup() {
  info "cleanup: 컨테이너 삭제..."
  docker compose down > /dev/null 2>&1 || true
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
echo " IV-1-3 Multi-stage 빌드 검증 시작"
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
# STEP 2: docker compose build - 두 이미지 빌드
# multistage-demo:multi (Dockerfile) 와 multistage-demo:single (Dockerfile.single)
# 빌드 실패 시 이후 단계 전체가 의미 없으므로 여기서 멈춘다.
# =============================================================================
info "[STEP 2] docker compose build (두 이미지 빌드)"
if docker compose build > /dev/null 2>&1; then
  pass "docker compose build 성공"
else
  fail "docker compose build 실패 - 빌드 로그를 확인하세요"
  echo "    docker compose build 출력:"
  docker compose build 2>&1 | sed 's/^/      /' || true
  FAIL_COUNT=$((FAIL_COUNT + 1))
  exit 1
fi

# =============================================================================
# STEP 3: 이미지 크기 비교 - multi < single
# docker inspect의 Size 필드(바이트)를 사용하여 정확하게 비교한다.
# multi-stage 빌드는 slim 베이스 이미지를 사용하므로 반드시 single보다 작아야 한다.
# =============================================================================
info "[STEP 3] 이미지 크기 비교 (multistage-demo:multi < multistage-demo:single)"

MULTI_SIZE=$(docker inspect --format='{{.Size}}' multistage-demo:multi 2>/dev/null || echo "0")
SINGLE_SIZE=$(docker inspect --format='{{.Size}}' multistage-demo:single 2>/dev/null || echo "0")

# MB 단위로 변환하여 출력 (가독성)
MULTI_MB=$(( MULTI_SIZE / 1024 / 1024 ))
SINGLE_MB=$(( SINGLE_SIZE / 1024 / 1024 ))

info "  multistage-demo:multi  = ${MULTI_MB}MB (${MULTI_SIZE} bytes)"
info "  multistage-demo:single = ${SINGLE_MB}MB (${SINGLE_SIZE} bytes)"

if [ "$MULTI_SIZE" -gt 0 ] && [ "$SINGLE_SIZE" -gt 0 ] && [ "$MULTI_SIZE" -lt "$SINGLE_SIZE" ]; then
  DIFF_MB=$(( (SINGLE_SIZE - MULTI_SIZE) / 1024 / 1024 ))
  pass "multi-stage 이미지가 single-stage보다 ${DIFF_MB}MB 작음 (핵심 검증)"
else
  fail "이미지 크기 비교 실패"
  echo "    multi (${MULTI_MB}MB) 가 single (${SINGLE_MB}MB) 보다 크거나 같음"
  echo "    Dockerfile 또는 Dockerfile.single 을 확인하세요"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# =============================================================================
# STEP 4: docker compose up -d - 두 서비스 기동
# app-multi (8000), app-single (8001) 동시 기동
# =============================================================================
info "[STEP 4] docker compose up -d (두 서비스 기동)"
docker compose up -d > /dev/null 2>&1
pass "docker compose up -d 실행 완료"

# 두 서비스 모두 준비될 때까지 대기
wait_for_http "http://localhost:8000/health" "app-multi (8000포트)"
wait_for_http "http://localhost:8001/health" "app-single (8001포트)"

# =============================================================================
# STEP 5: 헬스체크 - app-multi GET /health -> {"status":"ok"}
# =============================================================================
info "[STEP 5] app-multi 헬스체크 (http://localhost:8000/health)"

MULTI_HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8000/health)
MULTI_HEALTH_BODY=$(curl -s --max-time 5 http://localhost:8000/health)

assert_status_code "$MULTI_HEALTH_CODE" "200" "app-multi GET /health 상태코드"
assert_contains "$MULTI_HEALTH_BODY" '"status"' "app-multi 헬스 응답에 status 필드 존재"
assert_contains "$MULTI_HEALTH_BODY" '"ok"' "app-multi 헬스 status 값이 ok"

# =============================================================================
# STEP 6: 빌드 타입 확인 - app-multi GET / -> build_type 에 multi-stage 포함
# Dockerfile의 ENV BUILD_TYPE=multi-stage 가 실제로 적용되었는지 검증한다.
# =============================================================================
info "[STEP 6] app-multi 빌드 타입 확인 (http://localhost:8000/)"

MULTI_ROOT_BODY=$(curl -s --max-time 5 http://localhost:8000/)
MULTI_ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8000/)

assert_status_code "$MULTI_ROOT_CODE" "200" "app-multi GET / 상태코드"
assert_contains "$MULTI_ROOT_BODY" '"build_type"' "app-multi 응답에 build_type 필드 존재"
assert_contains "$MULTI_ROOT_BODY" "multi-stage" "app-multi build_type 값에 multi-stage 포함"

# =============================================================================
# STEP 7: 단일 스테이지 빌드 타입 확인 - app-single GET / -> build_type 에 single-stage 포함
# Dockerfile.single의 ENV BUILD_TYPE=single-stage 가 실제로 적용되었는지 검증한다.
# =============================================================================
info "[STEP 7] app-single 빌드 타입 확인 (http://localhost:8001/)"

SINGLE_ROOT_BODY=$(curl -s --max-time 5 http://localhost:8001/)
SINGLE_ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8001/)

assert_status_code "$SINGLE_ROOT_CODE" "200" "app-single GET / 상태코드"
assert_contains "$SINGLE_ROOT_BODY" '"build_type"' "app-single 응답에 build_type 필드 존재"
assert_contains "$SINGLE_ROOT_BODY" "single-stage" "app-single build_type 값에 single-stage 포함"

# =============================================================================
# STEP 8: docker compose down - 정리
# trap cleanup이 EXIT 시 자동 실행되므로 여기서는 명시적 down만 수행하고
# 성공 여부를 기록한다. (cleanup에서 중복 실행되어도 무해함)
# =============================================================================
info "[STEP 8] docker compose down (정리)"
docker compose down > /dev/null 2>&1
pass "docker compose down 완료"

# =============================================================================
# 최종 결과 출력
# cleanup은 trap EXIT에서 자동 실행됨
# =============================================================================
echo ""
echo "============================================================"
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN} 전체 PASS - Multi-stage 빌드 시나리오 검증 완료${NC}"
  echo "============================================================"
  exit 0
else
  echo -e "${RED} FAIL ${FAIL_COUNT}건 - 위 로그를 확인하세요${NC}"
  echo "============================================================"
  exit 1
fi

