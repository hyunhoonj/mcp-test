# 설치 가이드 (Wrapper 방식)

이 가이드는 클론 없이 NPM을 통해 직접 설치하는 방법을 안내합니다.

## 방법 1: GitHub에서 직접 설치 (권장)

### 1. 전역 설치

```bash
npm install -g git+https://github.com/hyunhoonj/mcp-server-youth-activity.git
```

이 명령어 하나로:
- ✅ 저장소에서 자동으로 다운로드
- ✅ 의존성 자동 설치
- ✅ TypeScript 자동 빌드
- ✅ 전역 명령어 등록

### 2. API 키 설정

설치 후 환경 변수를 설정해야 합니다.

**옵션 A: 시스템 환경 변수로 설정 (권장)**

```bash
# macOS/Linux
echo 'export YOUTH_API_SERVICE_KEY="your_api_key_here"' >> ~/.zshrc
source ~/.zshrc

# 또는 bash 사용 시
echo 'export YOUTH_API_SERVICE_KEY="your_api_key_here"' >> ~/.bashrc
source ~/.bashrc

# Windows (PowerShell)
[System.Environment]::SetEnvironmentVariable('YOUTH_API_SERVICE_KEY', 'your_api_key_here', 'User')
```

**옵션 B: Claude Desktop 설정에서 직접 설정**

아래 Claude Desktop 설정 참고

### 3. Claude Desktop 설정

설정 파일 위치:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### 옵션 A: 시스템 환경 변수 사용 (권장)

```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "youth-activity-mcp"
    }
  }
}
```

#### 옵션 B: 설정 파일에 API 키 직접 입력

```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "youth-activity-mcp",
      "env": {
        "YOUTH_API_SERVICE_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### 옵션 C: Node 경로 직접 지정 (문제 발생 시)

```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "node",
      "args": [
        "/usr/local/lib/node_modules/youth-activity-mcp-server/build/index.js"
      ],
      "env": {
        "YOUTH_API_SERVICE_KEY": "your_api_key_here"
      }
    }
  }
}
```

전역 설치 경로 확인:
```bash
npm list -g youth-activity-mcp-server
```

### 4. Claude Desktop 재시작

설정 저장 후 Claude Desktop을 완전히 종료하고 다시 시작합니다.

## 방법 2: 로컬 설치 (프로젝트별)

특정 프로젝트에서만 사용하려면:

```bash
# 프로젝트 디렉토리에서
npm install git+https://github.com/hyunhoonj/mcp-server-youth-activity.git
```

Claude Desktop 설정:
```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "node",
      "args": [
        "/path/to/your/project/node_modules/youth-activity-mcp-server/build/index.js"
      ],
      "env": {
        "YOUTH_API_SERVICE_KEY": "your_api_key_here"
      }
    }
  }
}
```

## 업데이트

새 버전으로 업데이트:

```bash
# 전역 설치한 경우
npm update -g git+https://github.com/hyunhoonj/mcp-server-youth-activity.git

# 또는 재설치
npm uninstall -g youth-activity-mcp-server
npm install -g git+https://github.com/hyunhoonj/mcp-server-youth-activity.git
```

## 제거

```bash
# 전역 설치 제거
npm uninstall -g youth-activity-mcp-server
```

## 문제 해결

### 1. 명령어를 찾을 수 없음 (command not found)

```bash
# NPM 전역 bin 경로 확인
npm config get prefix

# 해당 경로가 PATH에 있는지 확인
echo $PATH  # macOS/Linux
echo $env:PATH  # Windows PowerShell

# PATH에 추가 (macOS/Linux)
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 2. 권한 오류 (EACCES)

```bash
# macOS/Linux: sudo 없이 전역 설치 가능하도록 설정
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 그 다음 다시 설치
npm install -g git+https://github.com/hyunhoonj/mcp-server-youth-activity.git
```

### 3. 빌드 오류

빌드가 실패하면 TypeScript가 설치되어 있는지 확인:
```bash
npm install -g typescript
```

## API 키 발급

1. [공공데이터포털](https://www.data.go.kr/) 접속
2. 회원가입/로그인
3. "청소년활동정보서비스" 검색
4. 활용신청 클릭
5. 마이페이지 > 개발계정에서 인증키(Encoding) 복사

## 사용 예시

Claude Desktop에서:
```
Q: 서울시의 청소년 봉사활동을 찾아줘
Q: 전국의 시도 목록을 보여줘
Q: 경기도의 문화체험 프로그램 알려줘
```

## 더 알아보기

- [README.md](https://github.com/hyunhoonj/mcp-server-youth-activity/blob/main/readme.md)
- [QUICKSTART.md](https://github.com/hyunhoonj/mcp-server-youth-activity/blob/main/QUICKSTART.md)
