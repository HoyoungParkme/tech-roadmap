# FastAPI Blog API

FastAPI 학습용 블로그 REST API 프로젝트입니다.

## 기술 스택
- FastAPI + Uvicorn
- SQLAlchemy 2.0 (SQLite)
- Pydantic v2
- JWT 인증 (python-jose)
- Bcrypt 해싱 (passlib)

## 설치 및 실행

```bash
# 1. 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 의존성 설치
pip install -r requirements.txt

# 3. 환경변수 설정
cp .env.example .env

# 4. 서버 실행
uvicorn main:app --reload
```

## API 문서
서버 실행 후 http://localhost:8000/docs 에서 Swagger UI 확인

## 주요 엔드포인트
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | /register | 회원가입 | X |
| POST | /login | 로그인 (JWT 발급) | X |
| GET | /posts | 게시글 목록 | X |
| GET | /posts/{id} | 게시글 상세 | X |
| POST | /posts | 게시글 작성 | O |
| PUT | /posts/{id} | 게시글 수정 | O (작성자) |
| DELETE | /posts/{id} | 게시글 삭제 | O (작성자) |

## Docker 실행
```bash
docker build -t blog-api .
docker run -p 8000:8000 blog-api
```
