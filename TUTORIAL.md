# 초보자를 위한 설치 가이드

청소년 활동 정보 MCP 서버를 처음부터 끝까지 설치하는 방법입니다.

## 📋 준비 단계

### 1. Node.js 설치 확인

터미널(명령 프롬프트)을 열고 다음 명령어를 입력하세요:

```bash
node --version
```

**결과가 `v18.0.0` 이상이면 OK!**

만약 설치가 안 되어 있다면:
- **macOS**: `brew install node` 또는 https://nodejs.org 에서 다운로드
- **Windows**: https://nodejs.org 에서 다운로드
- **Linux**: `sudo apt install nodejs npm` (Ubuntu/Debian)

### 2. API 키 발급받기 (필수!)

1. **공공데이터포털 접속**
   - https://www.data.go.kr/ 로 이동
   - 회원가입 (카카오/네이버 간편 가입 가능)

2. **API 검색**
   - 상단 검색창에 "청소년활동정보서비스" 입력
   - 검색 결과 클릭

3. **활용신청**
   - "활용신청" 버튼 클릭
   - 간단한 정보 입력 후 신청
   - **즉시 승인됨!**

4. **API 키 복사**
   - 마이페이지 > 개발계정
   - **일반 인증키 (Encoding)** 복사
   - 어딘가에 메모해두기 (나중에 사용)

---

## 🚀 설치 방법 (두 가지 중 선택)

### 방법 A: 간편 설치 (추천! ⭐)

**클론 없이 한 줄로 설치**

```bash
npm install -g git+https://github.com/hyunhoonj/mcp-server-youth-activity.git
```

**이 명령어가 하는 일:**
- ✅ GitHub에서 자동 다운로드
- ✅ 필요한 패키지 자동 설치
- ✅ TypeScript 자동 빌드
- ✅ `youth-activity-mcp` 명령어 등록

**설치 완료!** 바로 Claude Desktop 설정으로 이동 →

---

### 방법 B: 클론해서 설치 (개발자용)

#### 1단계: 저장소 클론

```bash
# 원하는 폴더로 이동 (예: Documents)
cd ~/Documents

# 저장소 클론
git clone https://github.com/hyunhoonj/mcp-server-youth-activity.git

# 폴더 이동
cd mcp-server-youth-activity
```

**예상 결과:**
```
Cloning into 'mcp-server-youth-activity'...
remote: Enumerating objects: 50, done.
remote: Counting objects: 100% (50/50), done.
...
```

#### 2단계: 패키지 설치

```bash
npm install
```

**예상 결과:**
```
added 92 packages in 5s
```

#### 3단계: 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env
```

이제 `.env` 파일을 편집기로 열어서:

```bash
# macOS/Linux
nano .env

# Windows
notepad .env
```

다음과 같이 수정:
```
YOUTH_API_SERVICE_KEY=여기에_발급받은_API_키_붙여넣기
```

저장하고 닫기:
- **nano**: `Ctrl+X` → `Y` → `Enter`
- **notepad**: `파일 > 저장` 후 닫기

#### 4단계: 빌드

```bash
npm run build
```

**예상 결과:**
```
> youth-activity-mcp-server@1.0.0 build
> tsc
```

**현재 폴더의 절대 경로 확인:**
```bash
pwd
```

**이 경로를 메모해두세요!** (Claude Desktop 설정에 필요)

---

## ⚙️ Claude Desktop 설정

### 1단계: 설정 파일 열기

**파일 위치:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**파일 여는 방법:**

**macOS:**
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```powershell
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

### 2단계: 설정 추가

#### 방법 A를 선택했다면 (간편 설치):

파일에 다음 내용을 추가:

```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "youth-activity-mcp",
      "env": {
        "YOUTH_API_SERVICE_KEY": "여기에_발급받은_API_키_붙여넣기"
      }
    }
  }
}
```

**주의:** API 키를 따옴표 안에 붙여넣으세요!

#### 방법 B를 선택했다면 (클론 설치):

**옵션 1 - API 키를 설정에 직접 입력:**

```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "node",
      "args": ["/Users/yourname/Documents/mcp-server-youth-activity/build/index.js"],
      "env": {
        "YOUTH_API_SERVICE_KEY": "여기에_발급받은_API_키_붙여넣기"
      }
    }
  }
}
```

**옵션 2 - .env 파일 사용:**

```json
{
  "mcpServers": {
    "youth-activity": {
      "command": "node",
      "args": ["/Users/yourname/Documents/mcp-server-youth-activity/build/index.js"],
      "cwd": "/Users/yourname/Documents/mcp-server-youth-activity"
    }
  }
}
```

**중요:**
- `/Users/yourname/Documents/mcp-server-youth-activity` 부분을 **4단계에서 메모한 실제 경로**로 바꾸세요!
- Windows는 `C:\\Users\\YourName\\Documents\\mcp-server-youth-activity\\build\\index.js` 형식

### 3단계: 파일 저장

- **저장하고 닫기**
- JSON 문법이 맞는지 확인 (괄호, 쉼표 체크)

---

## ✅ 실행 및 테스트

### 1단계: Claude Desktop 재시작

1. **Claude Desktop 완전히 종료**
   - macOS: `Cmd + Q`
   - Windows: 작업 표시줄에서 우클릭 > 종료

2. **Claude Desktop 다시 시작**

### 2단계: 연결 확인

Claude Desktop 창 아래쪽을 보면:
- 🔨 망치 아이콘이 보여야 함
- 클릭하면 "youth-activity" 또는 서버 정보가 표시됨

### 3단계: 테스트 질문

Claude에게 다음과 같이 물어보세요:

```
전국의 시도 목록을 보여줘
```

**성공하면:**
```
📍 시도 목록 (전체 17개)

1. 서울특별시 (코드: 11)
2. 부산광역시 (코드: 21)
3. 대구광역시 (코드: 22)
...
```

이런 식으로 결과가 나옵니다!

### 4단계: 실제 활용

이제 다양한 질문을 해보세요:

```
서울시의 청소년 봉사활동을 찾아줘
```

```
경기도의 문화체험 프로그램 알려줘
```

```
부산에서 진행되는 청소년 활동 검색해줘
```

---

## 🔧 문제 해결

### 문제 1: "command not found" (방법 A)

**원인:** NPM 전역 bin 경로가 PATH에 없음

**해결:**
```bash
# PATH 확인
echo $PATH

# NPM prefix 확인
npm config get prefix

# PATH에 추가 (macOS/Linux)
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 문제 2: "YOUTH_API_SERVICE_KEY 환경 변수가 설정되지 않았습니다"

**원인:** API 키가 제대로 설정되지 않음

**해결:**
1. Claude Desktop 설정 파일 다시 열기
2. `YOUTH_API_SERVICE_KEY` 값이 제대로 들어갔는지 확인
3. 따옴표 안에 API 키가 있는지 확인
4. Claude Desktop 재시작

### 문제 3: 서버가 목록에 안 나타남

**원인:** 설정 파일 오류

**해결:**
1. https://jsonlint.com/ 에서 설정 파일 내용 붙여넣기
2. JSON 문법 오류 확인
3. 오류 수정 후 다시 저장
4. Claude Desktop 재시작

### 문제 4: API 오류

**원인:** API 키가 잘못되었거나 승인되지 않음

**해결:**
1. 공공데이터포털 마이페이지에서 API 키 다시 확인
2. "일반 인증키 (Encoding)" 맞는지 확인
3. API 활용 승인 상태 확인

---

## 📖 다음 단계

설치가 완료되었습니다! 이제:

1. **다양한 검색 시도**: 여러 지역, 키워드로 검색
2. **프롬프트 활용**: "search-guide 프롬프트 보여줘"
3. **리소스 확인**: "youth://api-guide 리소스 읽어줘"

---

## 💡 팁

### API 키 안전하게 관리하기

- ❌ GitHub에 올리지 마세요
- ❌ 공개 채팅에 공유하지 마세요
- ✅ `.env` 파일 사용 (방법 B)
- ✅ 환경 변수로 설정 (방법 A)

### 업데이트 방법

**방법 A (간편 설치):**
```bash
npm install -g git+https://github.com/hyunhoonj/mcp-server-youth-activity.git
```

**방법 B (클론 설치):**
```bash
cd ~/Documents/mcp-server-youth-activity
git pull
npm install
npm run build
```

---

## 🆘 추가 도움이 필요하신가요?

- GitHub Issues: https://github.com/hyunhoonj/mcp-server-youth-activity/issues
- README: https://github.com/hyunhoonj/mcp-server-youth-activity/blob/main/readme.md
- 상세 설치 가이드: https://github.com/hyunhoonj/mcp-server-youth-activity/blob/main/INSTALL.md

축하합니다! 🎉 이제 Claude와 함께 청소년 활동 정보를 쉽게 검색할 수 있습니다!
