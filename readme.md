# MCP Test Server

바닥부터 만든 MCP (Model Context Protocol) 서버입니다.

## 개요

이 프로젝트는 MCP SDK를 사용하여 처음부터 구현한 테스트 서버입니다. MCP의 핵심 기능인 Tools, Resources, Prompts를 모두 구현했습니다.

## 기능

### 🔧 Tools (도구)

1. **echo** - 입력받은 메시지를 그대로 반환
2. **calculate** - 간단한 수학 계산 (덧셈, 뺄셈, 곱셈, 나눗셈)
3. **get_time** - 현재 시간 조회

### 📦 Resources (리소스)

1. **test://info** - 서버 정보
2. **test://greeting** - 환영 메시지

### 💬 Prompts (프롬프트)

1. **welcome** - 사용자 환영 프롬프트
2. **help** - 사용 가이드 프롬프트

## 설치

```bash
npm install
```

## 빌드

```bash
npm run build
```

## 실행

```bash
npm start
```

또는 개발 모드:

```bash
npm run dev
```

## 프로젝트 구조

```
mcp-test/
├── src/
│   └── index.ts          # MCP 서버 메인 코드
├── build/                # 컴파일된 JavaScript 파일
├── package.json          # 프로젝트 설정
├── tsconfig.json         # TypeScript 설정
└── readme.md            # 이 파일
```

## Claude Desktop에서 사용하기

Claude Desktop의 설정 파일(`claude_desktop_config.json`)에 다음을 추가하세요:

```json
{
  "mcpServers": {
    "mcp-test": {
      "command": "node",
      "args": ["/절대/경로/mcp-test/build/index.js"]
    }
  }
}
```

## 기술 스택

- **TypeScript** - 타입 안전성
- **@modelcontextprotocol/sdk** - MCP 프로토콜 구현
- **Node.js** - 런타임 환경

## 라이선스

MIT
