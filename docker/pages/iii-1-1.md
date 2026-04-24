### III-1-1. Docker 설치 (Windows/Mac/Linux)

- **난이도**: ★★☆
- **선수 지식**: II-1-4
- **학습 목표**: 이 Section을 마치면 `docker version` 명령이 정상 출력되는 환경을 갖출 수 있다.
- **설명**:
  Windows와 Mac에서는 **Docker Desktop**을 설치하는 것이 가장 빠르다. Docker Desktop은 GUI, Docker 엔진, Docker Compose를 한 번에 설치해준다. Linux에서는 패키지 관리자로 docker-ce(Community Edition)를 설치한다. 설치 후 `docker version`을 실행해 Client와 Server 버전이 모두 출력되면 성공이다. Windows WSL2 환경에서는 Docker Desktop이 WSL2 백엔드를 자동으로 사용한다.
- **핵심 키워드**: Docker Desktop, docker-ce, WSL2, `docker version`, `docker info`
- **시각화 연결**: 향후 구현 예정
- **다음 섹션**: III-1-2

#### 본문

##### Docker 설치 — 첫 관문 통과하기

지금까지 Docker가 무엇인지, 왜 필요한지를 배웠다. 이제 실제로 설치해 보자. "이론은 알겠는데, 내 컴퓨터에서 돌아가야 진짜지"라는 생각이 드는 순간이다. 이 섹션을 마치면 터미널에 `docker version`을 쳤을 때 숫자가 출력되는 환경을 갖추게 된다.

운영체제마다 설치 방법이 조금씩 다르다. 본인의 환경에 맞는 섹션으로 바로 이동하면 된다.

---

##### Windows에서 설치하기

Windows에서는 **Docker Desktop**을 설치하는 것이 가장 빠르고 간단하다. 카카오톡을 설치하는 것과 크게 다르지 않다. `setup.exe`를 실행하면 Docker 엔진, Docker Compose, GUI 대시보드가 한 번에 설치된다.

**사전 조건: WSL2 설정**

Docker Desktop은 내부적으로 WSL2(Windows Subsystem for Linux 2)를 사용한다. WSL2는 Windows 위에서 Linux를 실행하는 가벼운 환경이다. 설치 전에 WSL2가 활성화되어 있어야 한다.

```powershell
# PowerShell을 관리자 권한으로 열고 실행
wsl --install
# 재시작 후 확인
wsl --list --verbose
```

`VERSION` 열에 `2`가 표시되면 WSL2가 정상이다.

**Docker Desktop 설치**

1. [docs.docker.com/desktop/install/windows-install](https://docs.docker.com/desktop/install/windows-install) 에서 설치 파일을 내려받는다
2. `Docker Desktop Installer.exe`를 실행한다
3. 설치 중 "Use WSL 2 instead of Hyper-V" 옵션이 체크되어 있는지 확인한다
4. 설치 완료 후 재시작한다
5. 시스템 트레이(우측 하단)에 Docker 고래 아이콘이 생기면 성공이다

**설치 확인**

```bash
# WSL2 터미널 또는 PowerShell에서
docker version
```

`Client:` 와 `Server:` 두 섹션이 모두 출력되면 Docker 엔진이 정상 동작하는 것이다.

---

##### Mac에서 설치하기

Mac도 Docker Desktop을 사용한다. 한 가지 주의할 점이 있다. **Apple Silicon(M1/M2/M3) Mac인지, Intel Mac인지 확인해야 한다.**

```bash
# 터미널에서 칩 종류 확인
uname -m
# arm64 → Apple Silicon
# x86_64 → Intel
```

[docs.docker.com/desktop/install/mac-install](https://docs.docker.com/desktop/install/mac-install) 에서 본인의 칩에 맞는 설치 파일을 내려받는다. Apple Silicon용 `.dmg`와 Intel용 `.dmg`가 별도로 제공된다.

설치 후 터미널에서 `docker version`을 실행해 확인한다.

---

##### Linux에서 설치하기

Linux에서는 Docker Desktop 대신 **docker-ce**(Community Edition)를 직접 설치한다. Ubuntu 기준으로 설명한다.

```bash
# 1. 이전에 설치된 구버전 제거
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. 필요한 패키지 설치
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 3. Docker 공식 GPG 키 추가
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Docker 설치
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**Linux 필수 후처리: 권한 그룹 추가**

설치 직후 `docker` 명령을 치면 `permission denied` 에러가 날 수 있다. Docker 데몬은 기본적으로 `root` 권한으로 실행되기 때문이다. `sudo docker`를 매번 치는 것은 번거로우니, 현재 사용자를 `docker` 그룹에 추가한다.

```bash
# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 반드시 로그아웃 후 다시 로그인해야 적용된다
# 또는 다음 명령으로 즉시 적용
newgrp docker

# 확인
docker version
```

---

##### 운영체제별 설치 방법 비교

| 항목 | Windows | Mac | Linux |
|:--|:--|:--|:--|
| 설치 방법 | Docker Desktop (.exe) | Docker Desktop (.dmg) | docker-ce (패키지 관리자) |
| 내부 구조 | WSL2 위 Linux VM | 경량 Linux VM | 직접 실행 |
| GUI 대시보드 | 제공 | 제공 | 미제공 (CLI 전용) |
| 후처리 필요 | WSL2 사전 활성화 | 칩 종류 확인 | 그룹 권한 추가 |
| 추천 대상 | 개발용 Windows PC | Mac 개발자 | 서버·CI 환경 |

---

> **[입문 렌즈 ★☆☆]**
> - **비유**: Docker 설치는 카카오톡 설치와 같다. 설치 파일을 내려받아 실행하면 된다. Windows/Mac은 GUI 설치 마법사가 나오고, Linux는 명령어로 설치한다.
> - **막혔을 때**: `docker version` 실행 시 `Cannot connect to the Docker daemon` 에러가 나오면 Docker Desktop이 아직 실행되지 않은 것이다. 트레이 아이콘에서 Docker Desktop을 시작하면 된다.
> - **핵심 질문**: "설치 후 `docker version`을 쳤을 때 Client와 Server 버전이 모두 나오는가?" — 이것이 성공 기준이다.

> **[주니어 렌즈 ★★☆]**
> - **Windows WSL2 주의사항**: WSL2 없이 설치하면 Hyper-V 백엔드로 실행된다. Hyper-V는 Windows Home 에디션에서 사용 불가다. WSL2 백엔드가 성능도 좋고 호환성도 높으므로 기본 선택이다.
> - **Mac Apple Silicon**: x86_64용 이미지를 Apple Silicon에서 실행하면 `WARNING: The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)` 경고가 뜬다. 기능은 작동하지만 성능이 느릴 수 있다. 멀티 플랫폼 이미지(`--platform linux/amd64`)로 명시하거나 ARM 지원 이미지를 찾는다.
> - **Linux 그룹 적용**: `newgrp docker` 또는 로그아웃-로그인 없이 터미널을 새로 열면 그룹이 적용되지 않아 `permission denied`가 계속 뜬다. 재시작이 가장 확실하다.

> **[실무자 렌즈 ★★★]**
> - **Docker Desktop 라이선싱**: 2022년부터 기업(직원 250명 이상 또는 연매출 1천만 달러 이상)은 Docker Desktop 유료 구독이 필요하다. 오픈소스 프로젝트·소규모 팀·개인은 무료다.
> - **대안 도구**: 기업 환경에서 라이선스 비용을 피하려면 **Colima**(macOS·Linux용 경량 컨테이너 런타임)나 **Rancher Desktop**을 쓴다. `colima start` 한 줄로 Docker 소켓을 띄우며 Docker CLI와 완전히 호환된다. CI 서버에서는 Docker Desktop 없이 docker-ce만 설치하면 된다.
> - **`docker info`**: `docker version`보다 자세한 환경 정보를 출력한다. 스토리지 드라이버, 런타임, cgroup 버전, 메모리 제한 등 환경 검증에 유용하다.

##### 체크포인트

- [ ] `docker version`을 실행했을 때 Client와 Server 버전이 모두 출력된다
- [ ] `docker info`를 실행했을 때 `Containers: 0` 같은 상태 정보가 출력된다
- [ ] 본인 운영체제에서 설치 시 필요한 후처리(WSL2, 그룹 권한 등)를 수행했다
- [ ] Docker Desktop이 트레이 아이콘으로 실행 중이거나, Linux에서 `systemctl status docker`가 active임을 확인했다

