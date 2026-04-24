"""
main.py — FastAPI 앱 진입점
경로: project/main.py
목적: 앱 생성, CORS 설정, 라우터 등록, 테이블 생성
주요 의존성: fastapi, database, routers

관련 시각화:
- IV-4-1 CORS (chapter-04-01-cors.html)
- IV-4-14 Middleware (chapter-04-14-middleware-custom.html)
- V-5-8 APIRouter (chapter-05-08-apirouter.html)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import posts, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작 시 테이블 자동 생성"""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Blog API",
    description="FastAPI 학습용 블로그 API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 설정 — 개발 환경에서는 모든 오리진 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(users.router)
app.include_router(posts.router)


@app.get("/")
def root():
    """헬스 체크"""
    return {"message": "Blog API is running", "docs": "/docs"}
