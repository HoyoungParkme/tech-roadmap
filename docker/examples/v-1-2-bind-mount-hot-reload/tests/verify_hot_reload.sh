#!/usr/bin/env bash
# =============================================================================
# 예제 V-1-2: bind mount 핫 리로드 검증 스크립트
# 경로: examples/v-1-2-bind-mount-hot-reload/tests/verify_hot_reload.sh
# 목적: app/main.py 수정 시 uvicorn --reload가 변경을 감지하여
#        재시작하는 핫 리로드 동작을 자동 검증
# 단일 진실원: docs/design/crossref.md §3
# 플랫폼: Git Bash (Windows) / macOS / Linux
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# 색상 출력 헬퍼
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
# 사용법: assert_equals "실제 값" "기대 값" "테스트 설명"
# -----------------------------------------------------------------------------
assert_equals() {
  local actual="$1"
  local expected="$2"
  local description="$3"

  if [ "$actual" = "$expected" ]; then
    pass "$description"
  else
    fail "$description"
    echo "    기대값: '$expected'"
    echo "    실제값: '$actual'"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# -----------------------------------------------------------------------------
# curl 응답에서 version 값 추출
# 응답 형식: {"version":"v1"} → v1
# -----------------------------------------------------------------------------
get_version() {
  local response="$1"
  # JSON에서 version 값을 간단한 grep/sed로 파싱 (jq 미설치 환경 대응)
  echo "$response" | grep -oE '"version":"[^"]*"' | grep -oE '"[^"]*"$' | tr -d '"'
}

# -----------------------------------------------------------------------------
# uvicorn 서비스 준비 대기
# 최대 30초 동안 HTTP 200 응답이 올 때까지 대기
# -----------------------------------------------------------------------------
wait_for_web() {
  local max_attempts=30
  local attempt=1

  info "uvicorn 서비스 준비 대기 중..."
  while [ $attempt -le $max_attempts ]; do
    if curl -s -o /dev/null -w "%{http_code}" "localhost:8000/version" 2>/dev/null | grep -q "200"; then
      info "서비스 준비 완료 (${attempt}초)"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  fail "서비스 준비 시간 초과 (${max_attempts}초)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  return 1
}

# -----------------------------------------------------------------------------
# main.py 원복 함수
# 스크립트 중간 실패 시에도 파일을 v1 상태로 되돌림
# -----------------------------------------------------------------------------
restore_main_py() {
  local main_py="$EXAMPLE_DIR/app/main.py"
  if grep -q 'VERSION = "v2"' "$main_py" 2>/dev/null; then
    info "app/main.py 원복: v2 → v1"
    sed -i 's/VERSION = "v2"/VERSION = "v1"/' "$main_py"
  fi
}

# -----------------------------------------------------------------------------
# cleanup: trap으로 보장
# 1) main.py를 v1으로 원복 (파일 상태 일관성 유지)
# 2) 컨테이너 정리
# -----------------------------------------------------------------------------
cleanup() {
  info "cleanup: 원복 및 컨테이너 삭제..."
  restore_main_py
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
echo " V-1-2 bind mount 핫 리로드 검증 시작"
echo " 단일 진실원: docs/design/crossref.md §3"
echo "============================================================"
echo ""

# =============================================================================
# 사전 확인: main.py가 v1 상태인지 보장
# 이전 실행이 실패하여 v2로 남아있을 경우 원복 후 진행
# =============================================================================
info "[사전 확인] app/main.py 초기 상태 확인"
if grep -q 'VERSION = "v2"' "app/main.py"; then
  info "app/main.py가 v2 상태 — v1으로 원복 후 시작"
  sed -i 's/VERSION = "v2"/VERSION = "v1"/' "app/main.py"
  pass "app/main.py v1으로 원복"
else
  pass "app/main.py v1 상태 확인"
fi

# =============================================================================
# STEP 1: 서비스 기동
# bind mount로 ./app:/app이 마운트되어 호스트 파일 변경이 즉시 반영됨
# =============================================================================
info "[STEP 1] docker compose up -d"
docker compose up -d > /dev/null 2>&1
wait_for_web

# =============================================================================
# STEP 2: 초기 버전 확인 (v1)
# crossref.md §3 표준: {"version":"v1"} 응답 기대
# =============================================================================
info "[STEP 2] 초기 버전 확인 (기대: v1)"
RESPONSE=$(curl -s "localhost:8000/version")
ACTUAL_VERSION=$(get_version "$RESPONSE")
assert_equals "$ACTUAL_VERSION" "v1" "초기 버전이 v1 (curl localhost:8000/version)"

# =============================================================================
# STEP 3: main.py VERSION 수정 v1 → v2
# bind mount이므로 호스트에서 수정하면 컨테이너 내 /app/main.py도 즉시 변경됨
# sed -i는 Git Bash / macOS / Linux 모두 지원
# =============================================================================
info "[STEP 3] app/main.py VERSION v1 → v2 수정"
sed -i 's/VERSION = "v1"/VERSION = "v2"/' "app/main.py"

# 파일이 실제로 수정되었는지 확인
if grep -q 'VERSION = "v2"' "app/main.py"; then
  pass "app/main.py 파일 수정 완료 (VERSION = \"v2\")"
else
  fail "app/main.py 파일 수정 실패"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# =============================================================================
# STEP 4: uvicorn 리로드 대기
# uvicorn --reload가 파일 변경을 감지하고 재시작할 때까지 대기
# crossref.md §3: 1~3초 대기 권장, 안정성을 위해 최대 10초까지 폴링
# =============================================================================
info "[STEP 4] uvicorn 핫 리로드 대기 (최대 10초)"
RELOAD_SUCCESS=false
for i in $(seq 1 10); do
  sleep 1
  RESPONSE=$(curl -s "localhost:8000/version" 2>/dev/null || echo "")
  CURRENT_VERSION=$(get_version "$RESPONSE")
  if [ "$CURRENT_VERSION" = "v2" ]; then
    info "uvicorn 리로드 감지 완료 (${i}초)"
    RELOAD_SUCCESS=true
    break
  fi
done

# =============================================================================
# STEP 5: 핫 리로드 후 버전 확인 (v2) — 핵심 검증
# uvicorn이 변경을 감지하여 재시작했다면 v2를 반환해야 함
# =============================================================================
info "[STEP 5] 핫 리로드 후 버전 확인 (기대: v2)"
RESPONSE=$(curl -s "localhost:8000/version")
ACTUAL_VERSION=$(get_version "$RESPONSE")
assert_equals "$ACTUAL_VERSION" "v2" "핫 리로드 후 버전이 v2 (bind mount + uvicorn --reload 확인)"

# =============================================================================
# STEP 6: main.py 원복 v2 → v1
# 다음 실행을 위해 파일을 초기 상태로 복원
# =============================================================================
info "[STEP 6] app/main.py VERSION v2 → v1 원복"
sed -i 's/VERSION = "v2"/VERSION = "v1"/' "app/main.py"

if grep -q 'VERSION = "v1"' "app/main.py"; then
  pass "app/main.py v1으로 원복 완료"
else
  fail "app/main.py 원복 실패"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# 원복 후 서비스도 v1으로 돌아오는지 추가 확인 (선택적)
info "[STEP 6-추가] 원복 후 버전 v1 복귀 확인"
for i in $(seq 1 10); do
  sleep 1
  RESPONSE=$(curl -s "localhost:8000/version" 2>/dev/null || echo "")
  CURRENT_VERSION=$(get_version "$RESPONSE")
  if [ "$CURRENT_VERSION" = "v1" ]; then
    pass "원복 후 버전 v1 복귀 확인 (${i}초)"
    break
  fi
  if [ "$i" -eq 10 ]; then
    fail "원복 후 v1 복귀 시간 초과"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

# =============================================================================
# STEP 7: cleanup은 trap EXIT에서 자동 실행됨
# (docker compose down + main.py 원복)
# =============================================================================

# =============================================================================
# 최종 결과 출력
# =============================================================================
echo ""
echo "============================================================"
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN} 전체 PASS — bind mount 핫 리로드 시나리오 검증 완료${NC}"
  echo "============================================================"
  exit 0
else
  echo -e "${RED} FAIL ${FAIL_COUNT}건 — 위 로그를 확인하세요${NC}"
  echo "============================================================"
  exit 1
fi
