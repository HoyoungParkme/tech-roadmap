"""
auth.py — 인증 유틸리티
경로: project/auth.py
목적: 패스워드 해싱(Bcrypt), JWT 토큰 생성/검증
주요 의존성: passlib, python-jose

관련 시각화:
- III-3-3 JWT (chapter-03-03-jwt.html)
- IV-4-11 Bcrypt (chapter-04-11-bcrypt.html)
"""

import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """비밀번호를 bcrypt로 해싱"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """평문 비밀번호와 해시를 비교"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """JWT 액세스 토큰 생성

    Args:
        data: 토큰에 담을 페이로드 (sub 필드 필수)

    Returns:
        인코딩된 JWT 문자열
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """JWT 토큰을 디코딩하여 페이로드 반환

    Returns:
        디코딩된 페이로드 dict, 실패 시 None
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
