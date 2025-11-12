# 빠른 시작 가이드

청소년 활동 정보 MCP 서버를 빠르게 시작하는 방법입니다.

## 준비물

- Node.js 18 이상
- 공공데이터포털 API 키

## 1분 안에 시작하기

### 1. API 키 발급

1. https://www.data.go.kr/ 접속
2. 회원가입/로그인
3. "청소년활동정보서비스" 검색
4. 활용신청 클릭 (즉시 승인됨)
5. 마이페이지 > 개발계정에서 인증키 복사

### 2. 환경 설정

```bash
# 1. .env 파일 생성
cp .env.example .env

# 2. .env 파일 편집 (API 키 입력)
# YOUTH_API_SERVICE_KEY=여기에_복사한_키_붙여넣기

# 3. 패키지 설치 (이미 했다면 생략)
npm install

# 4. 빌드
npm run build
```

### 3. 로컬에서 테스트

```bash
# 테스트 스크립트 실행
./test-server.sh

# 또는 직접 실행
npm start
```

서버가 시작되면 stderr에 "MCP 테스트 서버가 시작되었습니다" 메시지가 표시됩니다.

### 4. Claude Desktop 연결

#### macOS

```bash
# 설정 파일 열기
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### Windows

```powershell
# 설정 파일 열기
notepad %APPDATA%\Claude\claude_desktop_config.json
```

#### 설정 내용

**현재 경로를 절대 경로로 변경하세요!**

```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "node",
      "args": ["현재경로/mcp-test/build/index.js"],
      "env": {
        "YOUTH_API_SERVICE_KEY": "발급받은_API_키"
      }
    }
  }
}
```

또는 .env 파일 사용:

```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "node",
      "args": ["현재경로/mcp-test/build/index.js"],
      "cwd": "현재경로/mcp-test"
    }
  }
}
```

### 5. Claude Desktop 재시작

설정 저장 후 Claude Desktop을 완전히 종료하고 다시 시작합니다.

## 사용 예시

Claude와 대화하면서 다음과 같이 질문해보세요:

```
Q: 전국의 시도 목록을 보여줘
→ get_sido_list 도구가 실행됩니다

Q: 서울시의 청소년 봉사활동을 찾아줘
→ get_sido_list + search_youth_activities 도구가 실행됩니다

Q: 경기도의 문화 체험 프로그램 알려줘
→ 시도 코드 확인 후 키워드로 검색합니다
```

## 문제 해결

### 서버가 시작되지 않을 때

```bash
# 1. 환경 변수 확인
cat .env

# 2. 빌드 재실행
npm run build

# 3. 로그 확인
npm start 2>&1 | tee server.log
```

### Claude Desktop에서 연결이 안 될 때

1. 경로가 절대 경로인지 확인
2. build/index.js 파일이 존재하는지 확인
3. API 키가 올바른지 확인
4. Claude Desktop 로그 확인 (Help > View Logs)

### API 호출 오류

```
오류: API 호출 실패
```

- API 키가 올바른지 확인
- 공공데이터포털에서 API 사용 승인 상태 확인
- 네트워크 연결 확인

## 다음 단계

- [전체 README](./readme.md) 읽기
- [API 가이드](./readme.md#api-정보) 확인
- 추가 기능 개발하기

## 지원

문제가 발생하면 GitHub Issues에 등록해주세요!
