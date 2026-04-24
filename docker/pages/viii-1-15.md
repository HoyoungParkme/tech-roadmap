### VIII-1-15. EC2에 Docker Compose로 배포하기

- **난이도**: ★★★
- **학습 목표**: 이 Section을 마치면 로컬에서 개발한 Docker Compose 프로젝트를 EC2에 `scp`로 전송하고, Nginx 리버스 프록시를 통해 80/443 포트로 서비스하고, Let's Encrypt HTTPS 인증서를 적용할 수 있다.
- **설명**:
  VIII-1-13에서 Docker를 설치한 EC2 서버에 실제 애플리케이션을 배포하는 단계다. `examples/vi-1-1-fastapi-postgres-nginx/` 예제를 EC2에 올리는 시나리오로 진행한다. 파일 전송부터 Nginx 리버스 프록시, HTTPS 설정까지 실제 서비스 운영에 필요한 전체 흐름을 다룬다.
- **핵심 키워드**: `scp`, Docker Compose 배포, Nginx 리버스 프록시, Let's Encrypt, certbot, HTTPS
- **시각화 연결**: 향후 구현 예정
- **선수 지식**: VIII-1-13, VIII-1-14, V-1-3 (Compose)
- **다음 섹션**: VIII-1-16

#### 본문

##### 파일 전송: scp

로컬 프로젝트 파일을 EC2에 전송할 때는 `scp`(Secure Copy)를 사용한다. SSH와 동일한 키 파일을 사용한다.

```bash
# 로컬에서 EC2로 디렉토리 전체 전송
scp -i ~/Downloads/my-key.pem \
  -r ./vi-1-1-fastapi-postgres-nginx \
  ubuntu@<탄력적 IP>:~/app/

# 예시
scp -i ~/Downloads/my-key.pem \
  -r ./vi-1-1-fastapi-postgres-nginx \
  ubuntu@13.125.100.200:~/app/
```

```bash
# 파일 하나만 전송할 때
scp -i ~/Downloads/my-key.pem \
  ./docker-compose.yml \
  ubuntu@13.125.100.200:~/app/docker-compose.yml
```

##### EC2에서 Docker Compose 실행

```bash
# EC2에 SSH 접속
ssh -i ~/Downloads/my-key.pem ubuntu@13.125.100.200

# 전송한 디렉토리로 이동
cd ~/app/vi-1-1-fastapi-postgres-nginx

# 환경 변수 파일 생성 (.env는 scp로 전송하지 않는 것이 좋다)
cat > .env << 'EOF'
POSTGRES_USER=appuser
POSTGRES_PASSWORD=strongpassword123
POSTGRES_DB=appdb
EOF

# 백그라운드로 실행
docker compose up -d
```

```bash
# 실행 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f

# 특정 서비스 로그만 확인
docker compose logs -f api
```

> **[입문 렌즈 ★☆☆]**
> - **비유**: `scp`는 USB 드라이브처럼 파일을 한 컴퓨터에서 다른 컴퓨터로 복사하는 도구다. SSH 터널을 통해 파일을 안전하게 전송한다.
> - **`.env` 파일 전송 주의**: `.env` 파일에는 비밀번호 같은 민감한 정보가 담겨 있다. `scp`로 전송하면 로그에 내용이 남을 수 있다. EC2에 직접 접속해서 생성하는 것이 더 안전하다.

##### Nginx 리버스 프록시 설정

EC2 보안 그룹에서 80번 포트를 열었지만, FastAPI 앱은 8000번 포트에서 실행된다. Nginx가 80번 포트로 들어오는 요청을 FastAPI 8000번 포트로 전달해주는 역할을 한다.

`vi-1-1-fastapi-postgres-nginx` 예제는 이미 Nginx 리버스 프록시가 포함되어 있다. EC2에서 80번 포트로 접속하면 Nginx → FastAPI 흐름으로 요청이 전달된다.

```bash
# 브라우저에서 접속 확인
# http://<탄력적 IP>
curl http://13.125.100.200/
curl http://13.125.100.200/docs
```

##### HTTPS 설정 — Let's Encrypt + certbot

도메인이 있다면 무료 SSL 인증서를 발급받아 HTTPS를 적용할 수 있다.

**사전 조건**: 도메인이 EC2 탄력적 IP를 가리키도록 DNS A 레코드가 설정되어 있어야 한다.

```bash
# EC2에서 certbot 설치
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

```bash
# 인증서 발급 (Nginx 자동 설정 포함)
sudo certbot --nginx -d example.com -d www.example.com
```

certbot이 자동으로 아래를 처리한다.
1. Let's Encrypt CA에서 인증서 발급
2. `/etc/nginx/` 설정 파일에 SSL 관련 설정 추가
3. 80번 포트 → 443번 포트 자동 리다이렉트 설정

```bash
# 인증서 자동 갱신 (90일마다 만료, cron으로 자동 갱신)
sudo certbot renew --dry-run
```

> **[주니어 렌즈 ★★☆]**
> - **도메인 없을 때 HTTP 동작 확인**: 도메인이 없는 경우 `http://<탄력적 IP>`로 접속하여 동작을 확인한다. 자체 서명(self-signed) 인증서를 사용할 수도 있지만, 브라우저 경고가 발생한다. 개인 실습이라면 HTTP로만 진행해도 무방하다.
> - **Docker Compose와 certbot 충돌**: certbot은 80번 포트를 사용하여 인증서 발급 과정을 진행한다. Docker Compose가 80번 포트를 이미 사용 중이라면 잠시 중단하고 발급한 뒤 다시 시작한다.
>   ```bash
>   docker compose stop nginx
>   sudo certbot certonly --standalone -d example.com
>   docker compose start nginx
>   ```
> - **Nginx 컨테이너 안에서 certbot 사용**: `nginx:alpine` 이미지는 snap이 없다. 이 경우 컨테이너 외부(EC2 호스트)의 Nginx에 certbot을 적용하거나, `certbot/certbot` Docker 이미지를 사용한다.

##### 업데이트 배포

코드를 수정하고 새 이미지를 ECR에 푸시한 뒤 EC2에서 업데이트한다.

```bash
# 최신 이미지 풀 + 컨테이너 재시작
docker compose pull && docker compose up -d

# 사용하지 않는 이전 이미지 정리
docker image prune -f
```

```bash
# 특정 서비스만 업데이트
docker compose pull api
docker compose up -d --no-deps api
```

> **[실무자 렌즈 ★★★]**
> - **Blue-Green 배포**: `docker compose up -d` 방식은 컨테이너를 내렸다가 다시 올리는 과정에서 짧은 다운타임이 발생한다. 무중단 배포(Blue-Green)를 원한다면 두 벌의 Compose 파일을 번갈아 실행하거나, Nginx upstream을 동적으로 교체하는 방식을 사용한다. 규모가 커지면 Kubernetes 또는 AWS ECS를 고려한다.
> - **`--no-deps` 옵션**: 한 서비스만 업데이트할 때 `--no-deps`를 붙이면 의존 서비스(DB 등)를 재시작하지 않는다. DB를 포함한 모든 서비스를 재시작하면 데이터가 날아가는 실수를 예방할 수 있다.
> - **EFS(Elastic File System) 연동**: EC2를 여러 대 운영할 때 볼륨 데이터를 공유하려면 EFS를 Docker 볼륨 드라이버로 연결한다. 단일 EC2 실습에서는 불필요하다.

##### 체크포인트

- [ ] `scp -r` 명령으로 로컬 프로젝트 폴더를 EC2에 전송할 수 있다
- [ ] EC2에서 `docker compose up -d`를 실행하고 `curl`로 서비스가 응답하는지 확인할 수 있다
- [ ] Nginx 리버스 프록시가 80번 포트 요청을 내부 컨테이너 포트로 전달하는 구조를 설명할 수 있다
- [ ] `docker compose pull && docker compose up -d` 명령으로 새 이미지를 EC2에 배포할 수 있다
- [ ] Let's Encrypt certbot으로 HTTPS 인증서를 발급받기 위한 사전 조건(도메인, DNS A 레코드)을 설명할 수 있다

---

