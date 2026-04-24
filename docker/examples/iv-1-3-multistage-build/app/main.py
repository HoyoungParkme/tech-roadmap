"""
모듈: main
파일: examples/iv-1-3-multistage-build/app/main.py
목적: Multi-stage 빌드 학습용 간단 FastAPI 서버
주요 기능: 헬스체크 엔드포인트, 이미지 정보 반환
주요 의존성: fastapi, uvicorn
"""

import os
import sys

from fastapi import FastAPI

app = FastAPI(title="Multi-stage Build Demo")


@app.get("/")
def root() -> dict:
    """루트 엔드포인트. 이미지 빌드 방식 정보를 반환한다.

    Returns:
        dict: 메시지, Python 버전, 빌드 타입 정보
    """
    return {
        "message": "Hello from multi-stage build!",
        "python_version": sys.version,
        "build_type": os.getenv("BUILD_TYPE", "unknown"),
    }


@app.get("/health")
def health() -> dict:
    """헬스체크 엔드포인트.

    Returns:
        dict: 상태 정보
    """
    return {"status": "ok"}
