"""예제 V-1-2: bind mount 핫 리로드 FastAPI 앱.

경로: examples/v-1-2-bind-mount-hot-reload/app/main.py
목적: VERSION 상수를 수정하면 uvicorn --reload가 감지하여 자동 재시작되는 것을 체험.
단일 진실원: ../../docs/design/crossref.md §3
"""

from fastapi import FastAPI

VERSION = "v1"

app = FastAPI()


@app.get("/")
def root():
    """루트 엔드포인트. bind mount 동작 확인용."""
    return {"message": "hello bind mount"}


@app.get("/version")
def version():
    """현재 VERSION 상수를 반환. 핫 리로드 검증용."""
    return {"version": VERSION}
