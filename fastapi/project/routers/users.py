"""
routers/users.py — 사용자 인증 라우터
경로: project/routers/users.py
목적: 회원가입, 로그인 엔드포인트
주요 의존성: fastapi, services.user_service

관련 시각화:
- V-5-8 APIRouter (chapter-05-08-apirouter.html)
- III-3-3 JWT (chapter-03-03-jwt.html)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from schemas import Token, UserCreate, UserResponse
from services.user_service import authenticate_user, register_user

router = APIRouter(tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """회원가입 — 이메일/사용자명/비밀번호로 새 계정 생성"""
    return register_user(db, user_data)


@router.post("/login", response_model=Token)
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    """로그인 — 이메일/비밀번호 확인 후 JWT 토큰 발급"""
    token = authenticate_user(db, user_data.email, user_data.password)
    return {"access_token": token, "token_type": "bearer"}
