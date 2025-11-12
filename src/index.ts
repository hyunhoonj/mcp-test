#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP 테스트 서버
 * 기본적인 도구(Tools), 리소스(Resources), 프롬프트(Prompts)를 제공합니다.
 */

// 서버 인스턴스 생성
const server = new Server(
  {
    name: "mcp-test-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

/**
 * Tools 핸들러 등록
 * 사용 가능한 도구 목록 반환
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "echo",
        description: "입력받은 메시지를 그대로 반환합니다",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "반환할 메시지",
            },
          },
          required: ["message"],
        },
      },
      {
        name: "calculate",
        description: "간단한 수학 계산을 수행합니다 (덧셈, 뺄셈, 곱셈, 나눗셈)",
        inputSchema: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              enum: ["add", "subtract", "multiply", "divide"],
              description: "수행할 연산",
            },
            a: {
              type: "number",
              description: "첫 번째 숫자",
            },
            b: {
              type: "number",
              description: "두 번째 숫자",
            },
          },
          required: ["operation", "a", "b"],
        },
      },
      {
        name: "get_time",
        description: "현재 시간을 반환합니다",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

/**
 * Tool 실행 핸들러
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "echo": {
      const message = args?.message as string;
      return {
        content: [
          {
            type: "text",
            text: `Echo: ${message}`,
          },
        ],
      };
    }

    case "calculate": {
      const { operation, a, b } = args as {
        operation: string;
        a: number;
        b: number;
      };

      let result: number;
      switch (operation) {
        case "add":
          result = a + b;
          break;
        case "subtract":
          result = a - b;
          break;
        case "multiply":
          result = a * b;
          break;
        case "divide":
          if (b === 0) {
            throw new Error("0으로 나눌 수 없습니다");
          }
          result = a / b;
          break;
        default:
          throw new Error(`알 수 없는 연산: ${operation}`);
      }

      return {
        content: [
          {
            type: "text",
            text: `${a} ${operation} ${b} = ${result}`,
          },
        ],
      };
    }

    case "get_time": {
      const now = new Date();
      return {
        content: [
          {
            type: "text",
            text: `현재 시간: ${now.toISOString()}\n로컬 시간: ${now.toLocaleString('ko-KR')}`,
          },
        ],
      };
    }

    default:
      throw new Error(`알 수 없는 도구: ${name}`);
  }
});

/**
 * Resources 핸들러 등록
 * 사용 가능한 리소스 목록 반환
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "test://info",
        mimeType: "text/plain",
        name: "서버 정보",
        description: "MCP 테스트 서버의 기본 정보",
      },
      {
        uri: "test://greeting",
        mimeType: "text/plain",
        name: "인사말",
        description: "환영 메시지",
      },
    ],
  };
});

/**
 * Resource 읽기 핸들러
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "test://info":
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: `MCP 테스트 서버 v1.0.0

이 서버는 MCP (Model Context Protocol)의 기본 기능을 테스트하기 위한 서버입니다.

제공 기능:
- Tools: echo, calculate, get_time
- Resources: info, greeting
- Prompts: welcome, help`,
          },
        ],
      };

    case "test://greeting":
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: "안녕하세요! MCP 테스트 서버에 오신 것을 환영합니다. 이 서버는 MCP 프로토콜의 기본 기능들을 시연합니다.",
          },
        ],
      };

    default:
      throw new Error(`알 수 없는 리소스: ${uri}`);
  }
});

/**
 * Prompts 핸들러 등록
 * 사용 가능한 프롬프트 목록 반환
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "welcome",
        description: "사용자를 환영하는 프롬프트",
        arguments: [
          {
            name: "name",
            description: "사용자 이름",
            required: false,
          },
        ],
      },
      {
        name: "help",
        description: "서버 사용법을 안내하는 프롬프트",
      },
    ],
  };
});

/**
 * Prompt 가져오기 핸들러
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "welcome": {
      const userName = args?.name || "사용자";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `${userName}님, MCP 테스트 서버에 오신 것을 환영합니다!

이 서버는 다음과 같은 기능을 제공합니다:
- 메시지 에코
- 간단한 계산기
- 현재 시간 조회
- 서버 정보 및 인사말 리소스

무엇을 도와드릴까요?`,
            },
          },
        ],
      };
    }

    case "help": {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `MCP 테스트 서버 사용 가이드

📌 사용 가능한 도구 (Tools):
1. echo - 메시지를 그대로 반환
2. calculate - 수학 계산 (add, subtract, multiply, divide)
3. get_time - 현재 시간 조회

📦 사용 가능한 리소스 (Resources):
1. test://info - 서버 정보
2. test://greeting - 환영 메시지

💬 사용 가능한 프롬프트 (Prompts):
1. welcome - 환영 메시지
2. help - 이 도움말

각 기능을 자유롭게 사용해보세요!`,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`알 수 없는 프롬프트: ${name}`);
  }
});

/**
 * 서버 시작
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stderr로 로그 출력 (stdout은 MCP 프로토콜용으로 사용)
  console.error("MCP 테스트 서버가 시작되었습니다");
}

main().catch((error) => {
  console.error("서버 오류:", error);
  process.exit(1);
});
